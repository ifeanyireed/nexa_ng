import { neon } from "@neondatabase/serverless";
import { MASTER_CONNECTION_STRING, getTenantSql, invalidateTenantDbCache } from "./tenant-db-resolver";
import { PLAN_TIERS, normalizePlanTier, PlanTierKey, PlanTierDefinition } from "./pricing-plans";

export interface TenantSubscriptionState {
  tenantSlug: string;
  tenantId: string;
  planTier: PlanTierKey;
  billingCycle: "MONTHLY" | "ANNUAL";
  status: "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "EXPIRED" | "ONBOARDING";
  vertical: string;
  plan: PlanTierDefinition;
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

/**
 * Resolves the authoritative subscription tier, status, and quota limits for a tenant.
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

  if (MASTER_CONNECTION_STRING) {
    try {
      const masterSql = neon(MASTER_CONNECTION_STRING);
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
          SELECT plan_tier, billing_cycle, status, extra_leads, extra_campaigns, extra_seats
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
        }
      } catch {
        // Subscription table may reside in separate service_users DB
      }
    } catch (err: any) {
      console.warn(`[SubscriptionEnforcer] Master lookup warning for '${cleanSlug}':`, err.message);
    }
  }

  const plan = PLAN_TIERS[planTier] || PLAN_TIERS.GROWTH;
  const tierPreset = getModulesForTierAndVertical(planTier, vertical);

  const state: TenantSubscriptionState = {
    tenantSlug: cleanSlug,
    tenantId,
    planTier,
    billingCycle,
    status,
    vertical,
    plan,
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
    erpModules: dbErpModules || tierPreset.erpModules,
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
