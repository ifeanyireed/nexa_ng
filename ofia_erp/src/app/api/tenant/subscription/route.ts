import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import {
  getTenantSubscriptionState,
  syncTenantTierAndModules,
} from "@/lib/subscription-enforcer";
import { PLAN_TIERS, normalizePlanTier, PlanTierKey } from "@/lib/pricing-plans";

export const dynamic = "force-dynamic";

const rawUserUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl
  ? cleanUserUrl.endsWith("/api/v1")
    ? cleanUserUrl
    : `${cleanUserUrl}/api/v1`
  : "";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawTenant =
      searchParams.get("tenant") ||
      searchParams.get("slug") ||
      getValidatedTenantSlug(request) ||
      "default";
    const tenantSlug = rawTenant.toLowerCase().trim();

    const state = await getTenantSubscriptionState(tenantSlug);

    let productsCount = 0;
    let teamSeatsCount = 1;
    let monthlyLeadsCount = 0;
    let activeCampaignsCount = 0;

    try {
      const sql = await getTenantSql(tenantSlug);

      const [prodRow] = await sql`
        SELECT COUNT(*)::int AS cnt FROM commerce_products
        WHERE LOWER(tenant_slug) = ${tenantSlug};
      `.catch(() => [{ cnt: 0 }]);

      const [seatRow] = await sql`
        SELECT COUNT(*)::int AS cnt FROM "User"
        WHERE LOWER("tenantSlug") = ${tenantSlug} OR "tenantSlug" = '' OR "tenantSlug" IS NULL;
      `.catch(() => [{ cnt: 1 }]);

      const [leadRow] = await sql`
        SELECT COUNT(*)::int AS cnt FROM crm_leads
        WHERE LOWER(tenant_slug) = ${tenantSlug}
          AND created_at >= date_trunc('month', NOW());
      `.catch(() => [{ cnt: 0 }]);

      const [campRow] = await sql`
        SELECT COUNT(*)::int AS cnt FROM crm_campaigns
        WHERE LOWER(tenant_slug) = ${tenantSlug}
          AND UPPER(COALESCE(status, 'ACTIVE')) = 'ACTIVE';
      `.catch(() => [{ cnt: 0 }]);

      productsCount = Number(prodRow?.cnt || 0);
      teamSeatsCount = Math.max(1, Number(seatRow?.cnt || 1));
      monthlyLeadsCount = Number(leadRow?.cnt || 0);
      activeCampaignsCount = Number(campRow?.cnt || 0);
    } catch {}

    return NextResponse.json({
      success: true,
      subscription: state,
      usage: {
        productsCount,
        teamSeatsCount,
        monthlyLeadsCount,
        activeCampaignsCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to load subscription state: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawTenant =
      body.tenantSlug ||
      body.tenant ||
      getValidatedTenantSlug(request, body) ||
      "default";
    const tenantSlug = String(rawTenant).toLowerCase().trim();

    const tierKey = normalizePlanTier(body.planTier || body.plan_tier || "GROWTH");
    const targetPlan = PLAN_TIERS[tierKey];
    const billingCycle: "MONTHLY" | "ANNUAL" =
      String(body.billingCycle || body.billing_cycle || "MONTHLY").toUpperCase() === "ANNUAL"
        ? "ANNUAL"
        : "MONTHLY";
    const email = String(body.email || "billing@ofia.ng").trim();
    const amountNGN =
      billingCycle === "ANNUAL" ? targetPlan.annualPriceNGN : targetPlan.monthlyPriceNGN;
    const reference = `ofia_sub_${tenantSlug}_${Date.now()}`;

    // 1. If Paystack Secret Key is configured and user requested live checkout initialization
    const paystackSecret = (process.env.PAYSTACK_SECRET_KEY || "").trim();
    if (body.action === "INITIALIZE_CHECKOUT" && paystackSecret && amountNGN > 0) {
      try {
        const callbackUrl =
          body.callbackUrl ||
          `${new URL(request.url).origin}/tenant/billing?upgraded=${targetPlan.key}&cycle=${billingCycle}&ref=${reference}`;
        const psRes = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${paystackSecret}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            amount: Math.round(amountNGN * 100),
            reference,
            currency: "NGN",
            callback_url: callbackUrl,
            metadata: {
              org_id: tenantSlug,
              tenant_slug: tenantSlug,
              plan_tier: targetPlan.key,
              billing_cycle: billingCycle,
            },
          }),
          signal: AbortSignal.timeout(8000),
        });
        const psData = await psRes.json().catch(() => null);
        if (psData?.status && psData?.data?.authorization_url) {
          return NextResponse.json({
            success: true,
            mode: "LIVE_PAYSTACK",
            authorizationUrl: psData.data.authorization_url,
            reference: psData.data.reference || reference,
            amountNGN,
            planTier: targetPlan.key,
            billingCycle,
          });
        }
      } catch (psErr: any) {
        console.warn("[TenantSubscription POST] Paystack init warning:", psErr.message);
      }
    }

    // 2. Synchronize tier + RBAC module matrix in Master DB and Dedicated Tenant DB
    const updatedState = await syncTenantTierAndModules({
      tenantSlug,
      planTier: targetPlan.key as PlanTierKey,
      billingCycle,
      status: "ACTIVE",
    });

    // 3. Non-blocking sync to service_users microservice
    if (USER_BASE) {
      fetch(`${USER_BASE}/organizations/${encodeURIComponent(tenantSlug)}/subscription`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_tier: targetPlan.key,
          billing_cycle: billingCycle,
          status: "ACTIVE",
        }),
        signal: AbortSignal.timeout(5000),
      }).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      mode: "ACTIVATED",
      reference,
      amountNGN,
      subscription: updatedState,
      message: `Workspace upgraded to ${targetPlan.name} (${targetPlan.key}). Module entitlements synchronized.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to update tenant subscription: " + err.message },
      { status: 500 }
    );
  }
}
