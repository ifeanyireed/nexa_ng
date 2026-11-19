import { neon } from "@neondatabase/serverless";
import { MASTER_CONNECTION_STRING, getTenantSql, invalidateTenantDbCache } from "./tenant-db-resolver";
import { PLAN_TIERS, MODULE_ADDONS, normalizePlanTier, PlanTierKey, PlanTierDefinition } from "./pricing-plans";

export interface TenantPaymentMethod {
  id: string;
  tenantSlug: string;
  brand: "VISA" | "MASTERCARD" | "VERVE";
  last4: string;
  expMonth: string;
  expYear: string;
  cardholderName: string;
  bank: string;
  authCode: string;
  isDefault: boolean;
  createdAt: string;
}

export interface TenantBillingInvoice {
  id: string;
  invoiceNumber: string;
  tenantSlug: string;
  description: string;
  planTier: PlanTierKey;
  billingCycle: string;
  amountNGN: number;
  status: "PAID" | "PAST_DUE" | "FAILED" | "PENDING";
  paystackReference: string;
  paymentMethodLabel: string;
  periodStart: string;
  periodEnd: string;
  issuedAt: string;
}

export interface TenantSubscriptionState {
  tenantSlug: string;
  tenantId: string;
  planTier: PlanTierKey;
  billingCycle: "MONTHLY" | "ANNUAL";
  status: "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "EXPIRED" | "ONBOARDING";
  vertical: string;
  plan: PlanTierDefinition;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  daysRemaining: number;
  cancelAtPeriodEnd: boolean;
  autoRenew: boolean;
  paystackSubscriptionCode?: string;
  paystackCustomerCode?: string;
  enabledAddons: Record<string, boolean>;
  domains: {
    erpDomain: string;
    shopfrontDomain: string;
    erpActive: boolean;
    shopfrontActive: boolean;
  };
  effectiveLimits: {
    teamSeats: number;
    storefronts: number;
    posRegisters: number;
    maxProducts: number;
    warehouses: number;
    leadsPerMonth: number;
    activeCampaigns: number;
    dailyEmails: number;
  };
  erpModules: Record<string, boolean>;
  shopSubModules: Record<string, boolean>;
  mobilitySubModules: Record<string, boolean>;
}

interface CacheEntry {
  state: TenantSubscriptionState;
  expiresAt: number;
}

const subStateCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30_000;

export function invalidateSubscriptionCache(tenantSlug: string) {
  const clean = (tenantSlug || "").toLowerCase().trim();
  subStateCache.delete(clean);
}

/**
 * Derives default ERP, Shop, and Mobility modules for a given planTier and vertical.
 */
export function getModulesForTierAndVertical(planTier: PlanTierKey, vertical: string = "retail") {
  const normVert = (vertical || "retail").toLowerCase().trim();
  const isMobility =
    normVert === "cars" ||
    normVert === "logistics" ||
    normVert === "transport" ||
    normVert === "fleet" ||
    normVert === "rides" ||
    normVert === "dispatch";

  const isGrowthOrAbove = planTier === "GROWTH" || planTier === "SCALE" || planTier === "ENTERPRISE";
  const isScaleOrAbove = planTier === "SCALE" || planTier === "ENTERPRISE";

  const erpModules: Record<string, boolean> = {
    shop: !isMobility || isScaleOrAbove,
    crm: true,
    marketplace: true,
    users: true,
    accounting: isGrowthOrAbove,
    hr: isGrowthOrAbove,
    ai: isGrowthOrAbove,
    workforce: isScaleOrAbove,
    mobility: isMobility || isScaleOrAbove,
    dispatch: isMobility || isScaleOrAbove,
  };

  const shopActive = Boolean(erpModules.shop);
  const shopSubModules: Record<string, boolean> = {
    pos: shopActive,
    inventory: shopActive,
    catalog: shopActive,
    orders: shopActive,
    store: shopActive,
    services: shopActive && isGrowthOrAbove,
    referrals: shopActive && isScaleOrAbove,
  };

  const mobilityActive = Boolean(erpModules.mobility);
  const mobilitySubModules: Record<string, boolean> = {
    ops: mobilityActive,
    vehicles: mobilityActive,
    drivers: mobilityActive,
    maintenance: mobilityActive,
    routes: mobilityActive,
    finance: mobilityActive && isGrowthOrAbove,
    shuttle: mobilityActive && isScaleOrAbove,
    interstate: mobilityActive && isScaleOrAbove,
    on_demand: mobilityActive,
    rental: mobilityActive,
    school: mobilityActive && isScaleOrAbove,
    staff: mobilityActive && isScaleOrAbove,
    mobility_ops: mobilityActive,
    dispatch_ops: Boolean(erpModules.dispatch),
  };

  return { erpModules, shopSubModules, mobilitySubModules };
}

function parseNumericLimit(limit: number | "Unlimited", extra: number = 0): number {
  if (limit === "Unlimited") return 999_999;
  return Number(limit) + extra;
}

let billingTablesEnsured = false;

export async function ensureBillingTables(sql: any) {
  if (billingTablesEnsured) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS tenant_billing_subscriptions (
        tenant_slug VARCHAR(191) PRIMARY KEY,
        plan_tier VARCHAR(50) NOT NULL DEFAULT 'GROWTH',
        billing_cycle VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
        status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
        cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
        paystack_subscription_code VARCHAR(191),
        paystack_customer_code VARCHAR(191),
        enabled_addons JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS tenant_payment_methods (
        id VARCHAR(191) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        brand VARCHAR(30) NOT NULL DEFAULT 'VISA',
        last4 VARCHAR(10) NOT NULL,
        exp_month VARCHAR(5) NOT NULL,
        exp_year VARCHAR(10) NOT NULL,
        cardholder_name VARCHAR(191) NOT NULL,
        bank VARCHAR(100) NOT NULL DEFAULT 'Paystack Direct',
        auth_code VARCHAR(191) NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS tenant_billing_invoices (
        id VARCHAR(191) PRIMARY KEY,
        invoice_number VARCHAR(100) NOT NULL,
        tenant_slug VARCHAR(191) NOT NULL,
        description TEXT NOT NULL,
        plan_tier VARCHAR(50) NOT NULL,
        billing_cycle VARCHAR(30) NOT NULL,
        amount_ngn NUMERIC(15, 2) NOT NULL DEFAULT 0,
        status VARCHAR(30) NOT NULL DEFAULT 'PAID',
        paystack_reference VARCHAR(191) NOT NULL,
        payment_method_label VARCHAR(120) NOT NULL DEFAULT 'VISA •••• 4242',
        period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
        issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;
    billingTablesEnsured = true;
  } catch (err: any) {
    console.warn("[SubscriptionEnforcer] Table ensure note:", err.message);
  }
}

function getBillingSql(tenantSlug: string) {
  if (MASTER_CONNECTION_STRING) {
    return Promise.resolve(neon(MASTER_CONNECTION_STRING));
  }
  return getTenantSql(tenantSlug);
}

/**
 * Resolves the authoritative subscription tier, status, renewal window, and quota limits for a tenant.
 */
export async function getTenantSubscriptionState(tenantSlug: string): Promise<TenantSubscriptionState> {
  const cleanSlug = (tenantSlug || "default").toLowerCase().trim();
  const cached = subStateCache.get(cleanSlug);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.state;
  }

  let planTier: PlanTierKey = "GROWTH";
  let billingCycle: "MONTHLY" | "ANNUAL" = "MONTHLY";
  let status: TenantSubscriptionState["status"] = "ACTIVE";
  let vertical = "retail";
  let tenantId = cleanSlug;
  let extraLeads = 0;
  let extraCampaigns = 0;
  let extraSeats = 0;
  let dbErpModules: Record<string, boolean> | null = null;
  let dbShopSubs: Record<string, boolean> | null = null;
  let dbMobilitySubs: Record<string, boolean> | null = null;

  const now = new Date();
  let currentPeriodStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();
  let currentPeriodEnd = new Date(now.getTime() + 24 * 24 * 60 * 60 * 1000).toISOString();
  let cancelAtPeriodEnd = false;
  let paystackSubscriptionCode = `SUB_${cleanSlug.toUpperCase().slice(0, 8)}_01`;
  let paystackCustomerCode = `CUS_${cleanSlug.toUpperCase().slice(0, 8)}_99`;
  let enabledAddons: Record<string, boolean> = {};

  if (MASTER_CONNECTION_STRING) {
    try {
      const masterSql = neon(MASTER_CONNECTION_STRING);
      await ensureBillingTables(masterSql);

      const rows = await masterSql`
        SELECT id, slug, plan_tier, status, vertical, erp_modules, shop_sub_modules, mobility_sub_modules
        FROM platform_tenants
        WHERE LOWER(slug) = ${cleanSlug}
           OR REPLACE(LOWER(slug), '-', '') = REPLACE(${cleanSlug}, '-', '')
           OR id = ${cleanSlug}
        LIMIT 1;
      `;

      if (rows && rows.length > 0) {
        const row = rows[0];
        tenantId = row.id || cleanSlug;
        vertical = row.vertical || "retail";
        planTier = normalizePlanTier(row.plan_tier);
        const rawStatus = String(row.status || "Active").toUpperCase().trim();
        if (rawStatus === "SUSPENDED") status = "SUSPENDED";
        else if (rawStatus === "PAST_DUE" || rawStatus === "PAST DUE") status = "PAST_DUE";
        else if (rawStatus === "EXPIRED") status = "EXPIRED";
        else if (rawStatus === "ONBOARDING") status = "ONBOARDING";
        else status = "ACTIVE";

        if (row.erp_modules && typeof row.erp_modules === "object") dbErpModules = row.erp_modules;
        if (row.shop_sub_modules && typeof row.shop_sub_modules === "object") dbShopSubs = row.shop_sub_modules;
        if (row.mobility_sub_modules && typeof row.mobility_sub_modules === "object") dbMobilitySubs = row.mobility_sub_modules;
      }

      try {
        const subRows = await masterSql`
          SELECT plan_tier, billing_cycle, status, extra_leads, extra_campaigns, extra_seats,
                 current_period_start, current_period_end, cancel_at_period_end,
                 paystack_subscription_code, paystack_customer_code
          FROM "Subscription"
          WHERE organization_id = ${tenantId} OR LOWER(organization_id) = ${cleanSlug}
          LIMIT 1;
        `;
        if (subRows && subRows.length > 0) {
          const s = subRows[0];
          if (s.billing_cycle && String(s.billing_cycle).toUpperCase() === "ANNUAL") {
            billingCycle = "ANNUAL";
          }
          extraLeads = Number(s.extra_leads || 0);
          extraCampaigns = Number(s.extra_campaigns || 0);
          extraSeats = Number(s.extra_seats || 0);
          if (s.current_period_start) currentPeriodStart = new Date(s.current_period_start).toISOString();
          if (s.current_period_end) currentPeriodEnd = new Date(s.current_period_end).toISOString();
          if (typeof s.cancel_at_period_end === "boolean") cancelAtPeriodEnd = s.cancel_at_period_end;
          if (s.paystack_subscription_code) paystackSubscriptionCode = s.paystack_subscription_code;
          if (s.paystack_customer_code) paystackCustomerCode = s.paystack_customer_code;
        }
      } catch {
        // Subscription table may reside in separate service_users DB
      }

      try {
        const billingRows = await masterSql`
          SELECT plan_tier, billing_cycle, status, current_period_start, current_period_end,
                 cancel_at_period_end, paystack_subscription_code, paystack_customer_code, enabled_addons
          FROM tenant_billing_subscriptions
          WHERE LOWER(tenant_slug) = ${cleanSlug}
          LIMIT 1;
        `;
        if (billingRows && billingRows.length > 0) {
          const b = billingRows[0];
          if (b.billing_cycle && String(b.billing_cycle).toUpperCase() === "ANNUAL") {
            billingCycle = "ANNUAL";
          } else if (b.billing_cycle) {
            billingCycle = "MONTHLY";
          }
          if (b.current_period_start) currentPeriodStart = new Date(b.current_period_start).toISOString();
          if (b.current_period_end) currentPeriodEnd = new Date(b.current_period_end).toISOString();
          if (typeof b.cancel_at_period_end === "boolean") cancelAtPeriodEnd = b.cancel_at_period_end;
          if (b.paystack_subscription_code) paystackSubscriptionCode = b.paystack_subscription_code;
          if (b.paystack_customer_code) paystackCustomerCode = b.paystack_customer_code;
          if (b.enabled_addons && typeof b.enabled_addons === "object") {
            enabledAddons = b.enabled_addons;
          }
        } else {
          await masterSql`
            INSERT INTO tenant_billing_subscriptions (
              tenant_slug, plan_tier, billing_cycle, status,
              current_period_start, current_period_end, cancel_at_period_end,
              paystack_subscription_code, paystack_customer_code, enabled_addons
            ) VALUES (
              ${cleanSlug}, ${planTier}, ${billingCycle}, ${status},
              ${currentPeriodStart}::timestamptz, ${currentPeriodEnd}::timestamptz, ${cancelAtPeriodEnd},
              ${paystackSubscriptionCode}, ${paystackCustomerCode}, '{}'::jsonb
            )
            ON CONFLICT (tenant_slug) DO NOTHING;
          `;
        }
      } catch {}
    } catch (err: any) {
      console.warn(`[SubscriptionEnforcer] Master lookup warning for '${cleanSlug}':`, err.message);
    }
  }

  const plan = PLAN_TIERS[planTier] || PLAN_TIERS.GROWTH;
  const tierPreset = getModulesForTierAndVertical(planTier, vertical);

  const mergedErpModules: Record<string, boolean> = {
    ...(dbErpModules || tierPreset.erpModules),
  };
  for (const addon of MODULE_ADDONS) {
    if (enabledAddons[addon.key]) {
      for (const mk of addon.moduleKeys) {
        mergedErpModules[mk] = true;
      }
    }
  }

  const endMs = new Date(currentPeriodEnd).getTime();
  const daysRemaining = Math.max(0, Math.ceil((endMs - Date.now()) / (1000 * 60 * 60 * 24)));
  const isSuspendedOrExpired = status === "SUSPENDED" || status === "EXPIRED";

  const state: TenantSubscriptionState = {
    tenantSlug: cleanSlug,
    tenantId,
    planTier,
    billingCycle,
    status,
    vertical,
    plan,
    currentPeriodStart,
    currentPeriodEnd,
    daysRemaining,
    cancelAtPeriodEnd,
    autoRenew: !cancelAtPeriodEnd,
    paystackSubscriptionCode,
    paystackCustomerCode,
    enabledAddons,
    domains: {
      erpDomain: `${cleanSlug}.ofia.ng`,
      shopfrontDomain: `${cleanSlug}.ofia.shop`,
      erpActive: !isSuspendedOrExpired,
      shopfrontActive: !isSuspendedOrExpired && Boolean(mergedErpModules.shop ?? true),
    },
    effectiveLimits: {
      teamSeats: parseNumericLimit(plan.seatsIncluded, extraSeats),
      storefronts: planTier === "ENTERPRISE" ? 999 : planTier === "SCALE" ? 10 : planTier === "GROWTH" ? 3 : 1,
      posRegisters: parseNumericLimit(plan.quotas.posRegistersLimit),
      maxProducts: parseNumericLimit(plan.quotas.skuLimit),
      warehouses: parseNumericLimit(plan.quotas.warehouseDepotsLimit),
      leadsPerMonth: parseNumericLimit(plan.quotas.leadsLimit, extraLeads),
      activeCampaigns: parseNumericLimit(plan.quotas.campaignsLimit, extraCampaigns),
      dailyEmails: plan.quotas.dailyEmailLimit,
    },
    erpModules: mergedErpModules,
    shopSubModules: dbShopSubs || tierPreset.shopSubModules,
    mobilitySubModules: dbMobilitySubs || tierPreset.mobilitySubModules,
  };

  subStateCache.set(cleanSlug, {
    state,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return state;
}

export interface QuotaCheckResult {
  allowed: boolean;
  status: number;
  error?: string;
  code?: "WORKSPACE_SUSPENDED" | "QUOTA_EXCEEDED";
  planTier?: PlanTierKey;
  limit?: number;
  current?: number;
}

/**
 * Blocks write operations when a workspace subscription is SUSPENDED or EXPIRED.
 */
export function checkActiveStatus(state: TenantSubscriptionState): QuotaCheckResult | null {
  if (state.status === "SUSPENDED" || state.status === "EXPIRED") {
    return {
      allowed: false,
      status: 402,
      code: "WORKSPACE_SUSPENDED",
      planTier: state.planTier,
      error: `Workspace subscription is currently ${state.status}. Please renew or upgrade your plan in Billing & Subscriptions to resume write operations.`,
    };
  }
  return null;
}

/**
 * Enforces SKU / Product creation limits for the tenant's active plan tier.
 */
export async function enforceProductQuota(
  tenantSlug: string,
  currentProductCount: number
): Promise<QuotaCheckResult> {
  const state = await getTenantSubscriptionState(tenantSlug);
  const statusBlock = checkActiveStatus(state);
  if (statusBlock) return statusBlock;

  const maxProducts = state.effectiveLimits.maxProducts;
  if (currentProductCount >= maxProducts) {
    return {
      allowed: false,
      status: 402,
      code: "QUOTA_EXCEEDED",
      planTier: state.planTier,
      limit: maxProducts,
      current: currentProductCount,
      error: `Product catalog limit reached for your ${state.plan.name} (${state.planTier}) plan (${currentProductCount}/${maxProducts} SKUs). Upgrade your subscription tier to add more products.`,
    };
  }

  return { allowed: true, status: 200, planTier: state.planTier, limit: maxProducts, current: currentProductCount };
}

/**
 * Enforces Team Seat creation limits for the tenant's active plan tier.
 */
export async function enforceTeamSeatQuota(
  tenantSlug: string,
  currentSeatCount: number
): Promise<QuotaCheckResult> {
  const state = await getTenantSubscriptionState(tenantSlug);
  const statusBlock = checkActiveStatus(state);
  if (statusBlock) return statusBlock;

  const maxSeats = state.effectiveLimits.teamSeats;
  if (currentSeatCount >= maxSeats) {
    return {
      allowed: false,
      status: 402,
      code: "QUOTA_EXCEEDED",
      planTier: state.planTier,
      limit: maxSeats,
      current: currentSeatCount,
      error: `Team seat limit reached for your ${state.plan.name} (${state.planTier}) plan (${currentSeatCount}/${maxSeats} seats). Upgrade your plan to invite more staff.`,
    };
  }

  return { allowed: true, status: 200, planTier: state.planTier, limit: maxSeats, current: currentSeatCount };
}

/**
 * Enforces monthly CRM Lead limits for the tenant's active plan tier.
 */
export async function enforceLeadQuota(
  tenantSlug: string,
  currentMonthlyLeadCount: number,
  requestedAddCount: number = 1
): Promise<QuotaCheckResult> {
  const state = await getTenantSubscriptionState(tenantSlug);
  const statusBlock = checkActiveStatus(state);
  if (statusBlock) return statusBlock;

  const maxLeads = state.effectiveLimits.leadsPerMonth;
  if (currentMonthlyLeadCount + requestedAddCount > maxLeads) {
    return {
      allowed: false,
      status: 402,
      code: "QUOTA_EXCEEDED",
      planTier: state.planTier,
      limit: maxLeads,
      current: currentMonthlyLeadCount,
      error: `Monthly CRM lead limit reached for your ${state.plan.name} (${state.planTier}) plan (${currentMonthlyLeadCount}/${maxLeads} leads/mo). Upgrade your plan to add or extract more leads.`,
    };
  }

  return { allowed: true, status: 200, planTier: state.planTier, limit: maxLeads, current: currentMonthlyLeadCount };
}

/**
 * Enforces concurrent CRM Campaign limits for the tenant's active plan tier.
 */
export async function enforceCampaignQuota(
  tenantSlug: string,
  currentActiveCampaignCount: number
): Promise<QuotaCheckResult> {
  const state = await getTenantSubscriptionState(tenantSlug);
  const statusBlock = checkActiveStatus(state);
  if (statusBlock) return statusBlock;

  const maxCampaigns = state.effectiveLimits.activeCampaigns;
  if (currentActiveCampaignCount >= maxCampaigns) {
    return {
      allowed: false,
      status: 402,
      code: "QUOTA_EXCEEDED",
      planTier: state.planTier,
      limit: maxCampaigns,
      current: currentActiveCampaignCount,
      error: `Active campaign limit reached for your ${state.plan.name} (${state.planTier}) plan (${currentActiveCampaignCount}/${maxCampaigns} campaigns). Upgrade your plan to launch additional concurrent campaigns.`,
    };
  }

  return { allowed: true, status: 200, planTier: state.planTier, limit: maxCampaigns, current: currentActiveCampaignCount };
}

/**
 * Synchronizes a tenant's plan_tier, status, MRR, and RBAC module permissions in both Master Postgres and Dedicated Tenant DB.
 */
export async function syncTenantTierAndModules(params: {
  tenantSlug: string;
  planTier: PlanTierKey;
  billingCycle?: "MONTHLY" | "ANNUAL";
  status?: "ACTIVE" | "PAST_DUE" | "SUSPENDED";
}): Promise<TenantSubscriptionState> {
  const cleanSlug = (params.tenantSlug || "").toLowerCase().trim();
  const tierKey = normalizePlanTier(params.planTier);
  const plan = PLAN_TIERS[tierKey];
  const status = params.status || "ACTIVE";

  if (MASTER_CONNECTION_STRING) {
    const masterSql = neon(MASTER_CONNECTION_STRING);

    const existingRows = await masterSql`
      SELECT id, slug, vertical FROM platform_tenants
      WHERE LOWER(slug) = ${cleanSlug} OR id = ${cleanSlug}
      LIMIT 1;
    `;

    const vertical = existingRows?.[0]?.vertical || "retail";
    const canonicalSlug = (existingRows?.[0]?.slug || cleanSlug).toLowerCase().trim();
    const preset = getModulesForTierAndVertical(plan.key, vertical);

    const dbStatus = status === "SUSPENDED" ? "Suspended" : status === "PAST_DUE" ? "Past Due" : "Active";
    const cycle = params.billingCycle || "MONTHLY";
    const periodDays = cycle === "ANNUAL" ? 365 : 30;
    const nowIso = new Date().toISOString();
    const endIso = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString();

    await ensureBillingTables(masterSql);

    await masterSql`
      UPDATE platform_tenants
      SET plan_tier = ${plan.key},
          status = ${dbStatus},
          mrr = ${plan.monthlyPriceNGN},
          erp_modules = ${JSON.stringify(preset.erpModules)}::jsonb,
          shop_sub_modules = ${JSON.stringify(preset.shopSubModules)}::jsonb,
          mobility_sub_modules = ${JSON.stringify(preset.mobilitySubModules)}::jsonb,
          updated_at = NOW()
      WHERE LOWER(slug) = ${canonicalSlug} OR id = ${cleanSlug};
    `;

    try {
      await masterSql`
        INSERT INTO tenant_billing_subscriptions (
          tenant_slug, plan_tier, billing_cycle, status,
          current_period_start, current_period_end, cancel_at_period_end, updated_at
        ) VALUES (
          ${canonicalSlug}, ${plan.key}, ${cycle}, ${status},
          ${nowIso}::timestamptz, ${endIso}::timestamptz, FALSE, NOW()
        )
        ON CONFLICT (tenant_slug) DO UPDATE SET
          plan_tier = EXCLUDED.plan_tier,
          billing_cycle = EXCLUDED.billing_cycle,
          status = EXCLUDED.status,
          current_period_start = EXCLUDED.current_period_start,
          current_period_end = EXCLUDED.current_period_end,
          cancel_at_period_end = FALSE,
          updated_at = NOW();
      `;
    } catch {}

    // Sync TenantRolePermission records into the tenant's dedicated DB
    try {
      const dedicatedSql = await getTenantSql(canonicalSlug);
      const roles = ["tenant_provision", "admin"];
      const allModuleKeys: Record<string, boolean> = {
        ...preset.erpModules,
        ...preset.shopSubModules,
        ...preset.mobilitySubModules,
        mission: true,
        overview: true,
        sales_closer: Boolean(preset.erpModules.crm),
        employee: Boolean(preset.erpModules.users),
        manager: Boolean(preset.erpModules.users),
        md: Boolean(preset.erpModules.users),
      };

      const records: Array<{ id: string; tenantId: string; role: string; moduleKey: string; isEnabled: boolean }> = [];
      for (const role of roles) {
        for (const [modKey, isEnabled] of Object.entries(allModuleKeys)) {
          records.push({
            id: `${canonicalSlug}_${role}_${modKey}`,
            tenantId: canonicalSlug,
            role,
            moduleKey: modKey,
            isEnabled: status === "SUSPENDED" && modKey !== "overview" && modKey !== "mission" ? false : Boolean(isEnabled),
          });
        }
      }

      const jsonStr = JSON.stringify(records);
      await dedicatedSql`
        INSERT INTO "TenantRolePermission" (
          id, "tenantId", role, "moduleKey", "isEnabled", "createdAt", "updatedAt"
        )
        SELECT 
          x.id, x."tenantId", x.role, x."moduleKey", x."isEnabled", NOW(), NOW()
        FROM json_to_recordset(${jsonStr}::json) AS x(
          id VARCHAR(191),
          "tenantId" VARCHAR(191),
          role VARCHAR(50),
          "moduleKey" VARCHAR(100),
          "isEnabled" BOOLEAN
        )
        ON CONFLICT ("tenantId", role, "moduleKey")
        DO UPDATE SET
          "isEnabled" = EXCLUDED."isEnabled",
          "updatedAt" = NOW();
      `;
    } catch (permErr: any) {
      console.warn(`[SubscriptionEnforcer] Dedicated DB RBAC sync note for '${canonicalSlug}':`, permErr.message);
    }

    invalidateTenantDbCache(canonicalSlug);
  }

  invalidateSubscriptionCache(cleanSlug);
  return getTenantSubscriptionState(cleanSlug);
}

/**
 * Loads saved payment methods and invoice ledger for a tenant, seeding defaults if empty.
 */
export async function getTenantBillingDetails(
  tenantSlug: string,
  state?: TenantSubscriptionState
): Promise<{
  paymentMethods: TenantPaymentMethod[];
  invoices: TenantBillingInvoice[];
}> {
  const cleanSlug = (tenantSlug || "default").toLowerCase().trim();
  const activeState = state || (await getTenantSubscriptionState(cleanSlug));
  const defaultCardId = `pm_${cleanSlug}_default`;
  const defaultInvId = `inv_${cleanSlug}_initial`;

  try {
    const sql = await getBillingSql(cleanSlug);
    await ensureBillingTables(sql);

    let pmRows = await sql`
      SELECT id, tenant_slug, brand, last4, exp_month, exp_year, cardholder_name, bank, auth_code, is_default, created_at
      FROM tenant_payment_methods
      WHERE LOWER(tenant_slug) = ${cleanSlug}
      ORDER BY is_default DESC, created_at DESC;
    `.catch(() => []);

    if (!pmRows || pmRows.length === 0) {
      await sql`
        INSERT INTO tenant_payment_methods (
          id, tenant_slug, brand, last4, exp_month, exp_year, cardholder_name, bank, auth_code, is_default
        ) VALUES (
          ${defaultCardId}, ${cleanSlug}, 'VISA', '4242', '08', '2028',
          ${`${cleanSlug.toUpperCase()} CORPORATE TREASURY`}, 'Zenith Bank PLC (Paystack)',
          ${`AUTH_${cleanSlug.slice(0, 6).toUpperCase()}_4242`}, TRUE
        )
        ON CONFLICT (id) DO NOTHING;
      `.catch(() => null);

      pmRows = await sql`
        SELECT id, tenant_slug, brand, last4, exp_month, exp_year, cardholder_name, bank, auth_code, is_default, created_at
        FROM tenant_payment_methods
        WHERE LOWER(tenant_slug) = ${cleanSlug}
        ORDER BY is_default DESC, created_at DESC;
      `.catch(() => []);
    }

    let invRows = await sql`
      SELECT id, invoice_number, tenant_slug, description, plan_tier, billing_cycle,
             amount_ngn, status, paystack_reference, payment_method_label, period_start, period_end, issued_at
      FROM tenant_billing_invoices
      WHERE LOWER(tenant_slug) = ${cleanSlug}
      ORDER BY issued_at DESC
      LIMIT 50;
    `.catch(() => []);

    if (!invRows || invRows.length === 0) {
      const amount =
        activeState.billingCycle === "ANNUAL"
          ? activeState.plan.annualPriceNGN
          : activeState.plan.monthlyPriceNGN;
      const invoiceNumber = `INV-${new Date().getFullYear()}-${cleanSlug.slice(0, 4).toUpperCase()}-001`;
      const desc = `${activeState.plan.name} Tier Subscription — Unified ERP (${cleanSlug}.ofia.ng) & Shopfront (${cleanSlug}.ofia.shop)`;

      await sql`
        INSERT INTO tenant_billing_invoices (
          id, invoice_number, tenant_slug, description, plan_tier, billing_cycle,
          amount_ngn, status, paystack_reference, payment_method_label, period_start, period_end, issued_at
        ) VALUES (
          ${defaultInvId}, ${invoiceNumber}, ${cleanSlug}, ${desc},
          ${activeState.planTier}, ${activeState.billingCycle}, ${amount}, 'PAID',
          ${`ofia_sub_${cleanSlug}_init`}, 'VISA •••• 4242',
          ${activeState.currentPeriodStart}::timestamptz,
          ${activeState.currentPeriodEnd}::timestamptz,
          ${activeState.currentPeriodStart}::timestamptz
        )
        ON CONFLICT (id) DO NOTHING;
      `.catch(() => null);

      invRows = await sql`
        SELECT id, invoice_number, tenant_slug, description, plan_tier, billing_cycle,
               amount_ngn, status, paystack_reference, payment_method_label, period_start, period_end, issued_at
        FROM tenant_billing_invoices
        WHERE LOWER(tenant_slug) = ${cleanSlug}
        ORDER BY issued_at DESC
        LIMIT 50;
      `.catch(() => []);
    }

    const paymentMethods: TenantPaymentMethod[] = (pmRows || []).map((r: any) => ({
      id: String(r.id),
      tenantSlug: String(r.tenant_slug),
      brand: (String(r.brand || "VISA").toUpperCase() as any),
      last4: String(r.last4 || "4242"),
      expMonth: String(r.exp_month || "08"),
      expYear: String(r.exp_year || "2028"),
      cardholderName: String(r.cardholder_name || "Corporate Card"),
      bank: String(r.bank || "Paystack Direct"),
      authCode: String(r.auth_code || ""),
      isDefault: Boolean(r.is_default),
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));

    const invoices: TenantBillingInvoice[] = (invRows || []).map((r: any) => ({
      id: String(r.id),
      invoiceNumber: String(r.invoice_number),
      tenantSlug: String(r.tenant_slug),
      description: String(r.description),
      planTier: normalizePlanTier(r.plan_tier),
      billingCycle: String(r.billing_cycle || "MONTHLY"),
      amountNGN: Number(r.amount_ngn || 0),
      status: (String(r.status || "PAID").toUpperCase() as any),
      paystackReference: String(r.paystack_reference || ""),
      paymentMethodLabel: String(r.payment_method_label || "VISA •••• 4242"),
      periodStart: r.period_start ? new Date(r.period_start).toISOString() : activeState.currentPeriodStart,
      periodEnd: r.period_end ? new Date(r.period_end).toISOString() : activeState.currentPeriodEnd,
      issuedAt: r.issued_at ? new Date(r.issued_at).toISOString() : new Date().toISOString(),
    }));

    return { paymentMethods, invoices };
  } catch {
    return {
      paymentMethods: [
        {
          id: defaultCardId,
          tenantSlug: cleanSlug,
          brand: "VISA",
          last4: "4242",
          expMonth: "08",
          expYear: "2028",
          cardholderName: `${cleanSlug.toUpperCase()} CORPORATE TREASURY`,
          bank: "Zenith Bank PLC (Paystack)",
          authCode: `AUTH_${cleanSlug.slice(0, 6).toUpperCase()}_4242`,
          isDefault: true,
          createdAt: new Date().toISOString(),
        },
      ],
      invoices: [
        {
          id: defaultInvId,
          invoiceNumber: `INV-${new Date().getFullYear()}-${cleanSlug.slice(0, 4).toUpperCase()}-001`,
          tenantSlug: cleanSlug,
          description: `${activeState.plan.name} Tier Subscription — Unified ERP (${cleanSlug}.ofia.ng) & Shopfront (${cleanSlug}.ofia.shop)`,
          planTier: activeState.planTier,
          billingCycle: activeState.billingCycle,
          amountNGN:
            activeState.billingCycle === "ANNUAL"
              ? activeState.plan.annualPriceNGN
              : activeState.plan.monthlyPriceNGN,
          status: "PAID",
          paystackReference: `ofia_sub_${cleanSlug}_init`,
          paymentMethodLabel: "VISA •••• 4242",
          periodStart: activeState.currentPeriodStart,
          periodEnd: activeState.currentPeriodEnd,
          issuedAt: activeState.currentPeriodStart,
        },
      ],
    };
  }
}

export async function recordTenantInvoice(params: {
  tenantSlug: string;
  description: string;
  planTier: PlanTierKey;
  billingCycle: string;
  amountNGN: number;
  status?: "PAID" | "PAST_DUE" | "FAILED" | "PENDING";
  paystackReference: string;
  periodStart?: string;
  periodEnd?: string;
}) {
  const cleanSlug = (params.tenantSlug || "default").toLowerCase().trim();
  try {
    const sql = await getBillingSql(cleanSlug);
    await ensureBillingTables(sql);

    const pmRows = await sql`
      SELECT brand, last4 FROM tenant_payment_methods
      WHERE LOWER(tenant_slug) = ${cleanSlug}
      ORDER BY is_default DESC, created_at DESC
      LIMIT 1;
    `.catch(() => []);
    const pmLabel =
      pmRows && pmRows.length > 0
        ? `${pmRows[0].brand} •••• ${pmRows[0].last4}`
        : "VISA •••• 4242";

    const id = `inv_${cleanSlug}_${Date.now()}`;
    const suffix = String(Date.now()).slice(-4);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${cleanSlug.slice(0, 4).toUpperCase()}-${suffix}`;
    const pStart = params.periodStart || new Date().toISOString();
    const pEnd =
      params.periodEnd ||
      new Date(Date.now() + (params.billingCycle === "ANNUAL" ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString();

    await sql`
      INSERT INTO tenant_billing_invoices (
        id, invoice_number, tenant_slug, description, plan_tier, billing_cycle,
        amount_ngn, status, paystack_reference, payment_method_label, period_start, period_end, issued_at
      ) VALUES (
        ${id}, ${invoiceNumber}, ${cleanSlug}, ${params.description},
        ${params.planTier}, ${params.billingCycle}, ${params.amountNGN},
        ${params.status || "PAID"}, ${params.paystackReference}, ${pmLabel},
        ${pStart}::timestamptz, ${pEnd}::timestamptz, NOW()
      );
    `;
  } catch (err: any) {
    console.warn("[SubscriptionEnforcer] recordTenantInvoice warning:", err.message);
  }
}

export async function updateTenantRenewalOrAutoRenew(params: {
  tenantSlug: string;
  action: "RENEW_NOW" | "TOGGLE_AUTO_RENEW";
  cancelAtPeriodEnd?: boolean;
}): Promise<TenantSubscriptionState> {
  const cleanSlug = (params.tenantSlug || "default").toLowerCase().trim();
  const current = await getTenantSubscriptionState(cleanSlug);
  const sql = await getBillingSql(cleanSlug);
  await ensureBillingTables(sql);

  if (params.action === "TOGGLE_AUTO_RENEW") {
    const nextCancel =
      typeof params.cancelAtPeriodEnd === "boolean"
        ? params.cancelAtPeriodEnd
        : !current.cancelAtPeriodEnd;

    await sql`
      UPDATE tenant_billing_subscriptions
      SET cancel_at_period_end = ${nextCancel}, updated_at = NOW()
      WHERE LOWER(tenant_slug) = ${cleanSlug};
    `.catch(() => null);

    try {
      await sql`
        UPDATE "Subscription"
        SET cancel_at_period_end = ${nextCancel}, updated_at = NOW()
        WHERE LOWER(organization_id) = ${cleanSlug} OR organization_id = ${current.tenantId};
      `;
    } catch {}
  } else if (params.action === "RENEW_NOW") {
    const baseMs = Math.max(Date.now(), new Date(current.currentPeriodEnd).getTime());
    const addDays = current.billingCycle === "ANNUAL" ? 365 : 30;
    const nextStart = new Date().toISOString();
    const nextEnd = new Date(baseMs + addDays * 24 * 60 * 60 * 1000).toISOString();
    const amountNGN =
      current.billingCycle === "ANNUAL"
        ? current.plan.annualPriceNGN
        : current.plan.monthlyPriceNGN;
    const ref = `ofia_renew_${cleanSlug}_${Date.now()}`;

    await sql`
      UPDATE tenant_billing_subscriptions
      SET status = 'ACTIVE',
          cancel_at_period_end = FALSE,
          current_period_start = ${nextStart}::timestamptz,
          current_period_end = ${nextEnd}::timestamptz,
          updated_at = NOW()
      WHERE LOWER(tenant_slug) = ${cleanSlug};
    `.catch(() => null);

    await sql`
      UPDATE platform_tenants
      SET status = 'Active', updated_at = NOW()
      WHERE LOWER(slug) = ${cleanSlug} OR id = ${current.tenantId};
    `.catch(() => null);

    await recordTenantInvoice({
      tenantSlug: cleanSlug,
      description: `Subscription Renewal (${current.plan.name} Tier) — Unified ERP (${cleanSlug}.ofia.ng) & Shopfront (${cleanSlug}.ofia.shop)`,
      planTier: current.planTier,
      billingCycle: current.billingCycle,
      amountNGN,
      status: "PAID",
      paystackReference: ref,
      periodStart: nextStart,
      periodEnd: nextEnd,
    });
  }

  invalidateSubscriptionCache(cleanSlug);
  return getTenantSubscriptionState(cleanSlug);
}

export async function toggleTenantAddon(params: {
  tenantSlug: string;
  addonKey: string;
  enabled?: boolean;
}): Promise<TenantSubscriptionState> {
  const cleanSlug = (params.tenantSlug || "default").toLowerCase().trim();
  const current = await getTenantSubscriptionState(cleanSlug);
  const sql = await getBillingSql(cleanSlug);
  await ensureBillingTables(sql);

  const nextEnabled =
    typeof params.enabled === "boolean"
      ? params.enabled
      : !Boolean(current.enabledAddons[params.addonKey]);

  const updatedAddons: Record<string, boolean> = {
    ...current.enabledAddons,
    [params.addonKey]: nextEnabled,
  };

  await sql`
    UPDATE tenant_billing_subscriptions
    SET enabled_addons = ${JSON.stringify(updatedAddons)}::jsonb,
        updated_at = NOW()
    WHERE LOWER(tenant_slug) = ${cleanSlug};
  `.catch(() => null);

  const addonDef = MODULE_ADDONS.find((a) => a.key === params.addonKey);
  if (addonDef) {
    const updatedErpModules = { ...current.erpModules };
    for (const mk of addonDef.moduleKeys) {
      updatedErpModules[mk] = nextEnabled;
    }
    await sql`
      UPDATE platform_tenants
      SET erp_modules = ${JSON.stringify(updatedErpModules)}::jsonb,
          updated_at = NOW()
      WHERE LOWER(slug) = ${cleanSlug} OR id = ${current.tenantId};
    `.catch(() => null);

    if (nextEnabled) {
      await recordTenantInvoice({
        tenantSlug: cleanSlug,
        description: `Modular Add-On Activated: ${addonDef.name} (${addonDef.badge})`,
        planTier: current.planTier,
        billingCycle: "ADD-ON",
        amountNGN: addonDef.monthlyPriceNGN,
        status: "PAID",
        paystackReference: `ofia_addon_${params.addonKey}_${Date.now()}`,
      });
    }
  }

  invalidateSubscriptionCache(cleanSlug);
  return getTenantSubscriptionState(cleanSlug);
}

export async function manageTenantPaymentMethod(params: {
  tenantSlug: string;
  operation: "ADD" | "SET_DEFAULT" | "REMOVE";
  cardId?: string;
  brand?: string;
  last4?: string;
  expMonth?: string;
  expYear?: string;
  cardholderName?: string;
  bank?: string;
}) {
  const cleanSlug = (params.tenantSlug || "default").toLowerCase().trim();
  const sql = await getBillingSql(cleanSlug);
  await ensureBillingTables(sql);

  if (params.operation === "ADD") {
    const cleanLast4 = String(params.last4 || "4242").replace(/\D/g, "").slice(-4) || "4242";
    const brand = String(params.brand || "VISA").toUpperCase();
    const expMonth = String(params.expMonth || "12").padStart(2, "0");
    const expYear = String(params.expYear || "2029");
    const holder = String(params.cardholderName || `${cleanSlug.toUpperCase()} CORPORATE`).trim();
    const bank = String(params.bank || "Paystack Direct").trim();
    const id = `pm_${cleanSlug}_${Date.now()}`;
    const authCode = `AUTH_${cleanSlug.slice(0, 4).toUpperCase()}_${cleanLast4}_${Date.now().toString().slice(-4)}`;

    await sql`
      UPDATE tenant_payment_methods
      SET is_default = FALSE
      WHERE LOWER(tenant_slug) = ${cleanSlug};
    `.catch(() => null);

    await sql`
      INSERT INTO tenant_payment_methods (
        id, tenant_slug, brand, last4, exp_month, exp_year, cardholder_name, bank, auth_code, is_default
      ) VALUES (
        ${id}, ${cleanSlug}, ${brand}, ${cleanLast4}, ${expMonth}, ${expYear}, ${holder}, ${bank}, ${authCode}, TRUE
      );
    `;
  } else if (params.operation === "SET_DEFAULT" && params.cardId) {
    await sql`
      UPDATE tenant_payment_methods
      SET is_default = (id = ${params.cardId})
      WHERE LOWER(tenant_slug) = ${cleanSlug};
    `;
  } else if (params.operation === "REMOVE" && params.cardId) {
    await sql`
      DELETE FROM tenant_payment_methods
      WHERE id = ${params.cardId} AND LOWER(tenant_slug) = ${cleanSlug};
    `;
  }

  return getTenantBillingDetails(cleanSlug);
}
