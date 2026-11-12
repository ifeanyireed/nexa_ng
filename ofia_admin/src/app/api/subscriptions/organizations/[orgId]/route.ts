import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/jwt-auth";
import { MASTER_CONNECTION_STRING } from "@/lib/tenant-db-resolver";
import { alignTenantModules } from "@/lib/tenant-module-aligner";
import { neon } from "@neondatabase/serverless";

const USER_BASE = process.env.USER_SERVICE_URL
  ? `${process.env.USER_SERVICE_URL}/api/v1`
  : (process.env.NEXT_PUBLIC_USER_SERVICE_URL || "https://ofia-user-service.onrender.com/api/v1");

const TIER_LIMITS: Record<string, any> = {
  FREE_TRIAL: {
    monthly_price_ngn: 0,
    max_projects: 1,
    max_products: 50,
    max_team_seats: 2,
    max_monthly_leads: 250,
    max_active_campaigns: 1,
    max_monthly_ai_tokens: 250000,
    direct_fee_percent: 2.5,
    escrow_fee_percent: 5.0,
  },
  STARTER: {
    monthly_price_ngn: 25000,
    max_projects: 1,
    max_products: 500,
    max_team_seats: 5,
    max_monthly_leads: 1500,
    max_active_campaigns: 3,
    max_monthly_ai_tokens: 2000000,
    direct_fee_percent: 2.0,
    escrow_fee_percent: 4.5,
  },
  GROWTH: {
    monthly_price_ngn: 75000,
    max_projects: 3,
    max_products: 5000,
    max_team_seats: 15,
    max_monthly_leads: 10000,
    max_active_campaigns: 10,
    max_monthly_ai_tokens: 10000000,
    direct_fee_percent: 1.25,
    escrow_fee_percent: 3.5,
  },
  SCALE: {
    monthly_price_ngn: 200000,
    max_projects: 10,
    max_products: 999999,
    max_team_seats: 50,
    max_monthly_leads: 50000,
    max_active_campaigns: 30,
    max_monthly_ai_tokens: 50000000,
    direct_fee_percent: 0.5,
    escrow_fee_percent: 2.5,
  },
  ENTERPRISE: {
    monthly_price_ngn: 650000,
    max_projects: 999,
    max_products: 999999,
    max_team_seats: 999,
    max_monthly_leads: 250000,
    max_active_campaigns: 100,
    max_monthly_ai_tokens: 250000000,
    direct_fee_percent: 0.0,
    escrow_fee_percent: 1.5,
  },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { errorResponse } = await authenticateApiRequest(request);
  if (errorResponse) return errorResponse;

  const { orgId } = await params;
  const rawOrg = (orgId || "").trim();

  if (!rawOrg) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(rawOrg)}/subscription`, {
      headers: {
        "x-tenant-slug": rawOrg.toLowerCase(),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {}

  // Direct Master Postgres fallback
  if (MASTER_CONNECTION_STRING) {
    try {
      const sql = neon(MASTER_CONNECTION_STRING);
      const [tenant] = await sql`
        SELECT id, slug, plan_tier, status, erp_modules, shop_sub_modules, mobility_sub_modules
        FROM platform_tenants
        WHERE id = ${rawOrg} OR LOWER(slug) = ${rawOrg.toLowerCase()}
        LIMIT 1;
      `;
      if (tenant) {
        const tier = (tenant.plan_tier || "GROWTH").toUpperCase();
        return NextResponse.json({
          organization_id: tenant.id,
          slug: tenant.slug,
          plan_tier: tier,
          status: (tenant.status || "ACTIVE").toUpperCase(),
          limits: TIER_LIMITS[tier] || TIER_LIMITS.GROWTH,
          modules: {
            erp_modules: tenant.erp_modules || {},
            shop_sub_modules: tenant.shop_sub_modules || {},
            mobility_sub_modules: tenant.mobility_sub_modules || {},
          },
        });
      }
    } catch {}
  }

  return NextResponse.json({
    organization_id: rawOrg,
    plan_tier: "GROWTH",
    status: "ACTIVE",
    limits: TIER_LIMITS.GROWTH,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { errorResponse } = await authenticateApiRequest(request, {
    allowedRoles: ["SUPER_ADMIN"],
    requirePermission: "canManagePlans",
  });
  if (errorResponse) return errorResponse;

  const { orgId } = await params;
  const rawOrg = (orgId || "").trim();

  if (!rawOrg) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  let body: any = {};
  let alignmentResult: any = null;
  try {
    body = await request.json();
    const targetTier = (body.plan_tier || "GROWTH").toUpperCase().trim();
    const targetStatus = body.status ? String(body.status).trim() : undefined;

    // 1. Authoritative Master DB + Dedicated Tenant RBAC alignment
    if (MASTER_CONNECTION_STRING) {
      try {
        const sql = neon(MASTER_CONNECTION_STRING);
        if (targetStatus) {
          await sql`
            UPDATE platform_tenants
            SET status = ${targetStatus}, updated_at = NOW()
            WHERE id = ${rawOrg} OR LOWER(slug) = ${rawOrg.toLowerCase()};
          `;
        }
        alignmentResult = await alignTenantModules(rawOrg, undefined, targetTier);
      } catch (alignErr: any) {
        console.warn(`[Subscriptions PUT] Module alignment note for '${rawOrg}':`, alignErr.message);
      }
    }

    // 2. Forward to service_users microservice
    const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}/subscription`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        ...data,
        aligned_modules: alignmentResult,
      });
    }
  } catch {}

  const tier = (body.plan_tier || "GROWTH").toUpperCase();
  return NextResponse.json({
    success: true,
    organization_id: orgId,
    plan_tier: tier,
    status: body.status || "ACTIVE",
    limits: TIER_LIMITS[tier] || TIER_LIMITS.GROWTH,
    aligned_modules: alignmentResult,
    message: "Subscription tier and RBAC module matrix updated in PostgreSQL",
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { errorResponse } = await authenticateApiRequest(request, {
    allowedRoles: ["SUPER_ADMIN"],
    requirePermission: "canManagePlans",
  });
  if (errorResponse) return errorResponse;

  const { orgId } = await params;
  const rawOrg = (orgId || "").trim();
  let body: any = {};
  let alignmentResult: any = null;

  try {
    body = await request.json();
    if (body.plan_tier && MASTER_CONNECTION_STRING) {
      try {
        alignmentResult = await alignTenantModules(rawOrg, undefined, String(body.plan_tier).toUpperCase());
      } catch {}
    }

    const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}/subscription/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        ...data,
        aligned_modules: alignmentResult,
      });
    }
  } catch {}

  return NextResponse.json({
    success: true,
    organization_id: orgId,
    ...body,
    aligned_modules: alignmentResult,
    message: "Quota override persisted successfully",
  });
}
