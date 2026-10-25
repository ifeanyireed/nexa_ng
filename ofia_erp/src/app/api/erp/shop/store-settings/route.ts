import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { MASTER_REGISTRY_URL, invalidateTenantDbCache } from "@/lib/tenant-db-resolver";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawTenant = searchParams.get("tenant") || searchParams.get("slug") || request.headers.get("x-tenant-slug");

  if (!rawTenant) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  const tenantSlug = rawTenant.toLowerCase().trim();

  try {
    const sql = neon(MASTER_REGISTRY_URL);
    const rows = await sql`
      SELECT id, name, slug, domain, vertical, status, logo, login_image,
             hero_title, hero_subtitle, owner_email, storefront_config
      FROM platform_tenants
      WHERE LOWER(slug) = ${tenantSlug}
         OR REPLACE(LOWER(slug), '-', '') = REPLACE(${tenantSlug}, '-', '')
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: `Tenant workspace '${tenantSlug}' not found.` },
        { status: 404 }
      );
    }

    const r = rows[0];
    const customConfig = (r.storefront_config && typeof r.storefront_config === "object") ? r.storefront_config : {};

    return NextResponse.json({
      success: true,
      tenant: {
        id: r.id,
        name: r.name,
        slug: r.slug,
        domain: r.domain,
        vertical: r.vertical,
        logo: r.logo,
        bannerUrl: r.login_image,
        heroTitle: r.hero_title,
        heroSubtitle: r.hero_subtitle,
        ownerEmail: r.owner_email,
      },
      config: customConfig,
    });
  } catch (err: any) {
    console.error(`[ERP Store Settings API] GET error for '${tenantSlug}':`, err);
    return NextResponse.json(
      { success: false, error: "Database error fetching storefront settings: " + err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawTenant = searchParams.get("tenant") || searchParams.get("slug") || request.headers.get("x-tenant-slug");

  if (!rawTenant) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  const tenantSlug = rawTenant.toLowerCase().trim();

  try {
    const payload = await request.json();
    const sql = neon(MASTER_REGISTRY_URL);

    // Extract core fields to also synchronize into platform_tenants root columns
    const storeName = (payload.storeName || "").trim();
    const logoUrl = (payload.logoUrl || "").trim();
    const bannerUrl = (payload.hero?.image || payload.bannerUrl || "").trim();
    const heroTitle = (payload.hero?.headline || payload.storeHeadline || "").trim();
    const heroSubtitle = (payload.hero?.description || "").trim();

    await sql`
      UPDATE platform_tenants
      SET storefront_config = ${JSON.stringify(payload)}::jsonb,
          name = COALESCE(NULLIF(${storeName}, ''), name),
          logo = COALESCE(NULLIF(${logoUrl}, ''), logo),
          login_image = COALESCE(NULLIF(${bannerUrl}, ''), login_image),
          hero_title = COALESCE(NULLIF(${heroTitle}, ''), hero_title),
          hero_subtitle = COALESCE(NULLIF(${heroSubtitle}, ''), hero_subtitle),
          updated_at = NOW()
      WHERE LOWER(slug) = ${tenantSlug}
         OR REPLACE(LOWER(slug), '-', '') = REPLACE(${tenantSlug}, '-', '');
    `;

    invalidateTenantDbCache(tenantSlug);

    return NextResponse.json({
      success: true,
      message: "Storefront customization saved and published live!",
      tenantSlug,
    });
  } catch (err: any) {
    console.error(`[ERP Store Settings API] PUT error for '${tenantSlug}':`, err);
    return NextResponse.json(
      { success: false, error: "Failed to persist storefront settings: " + err.message },
      { status: 500 }
    );
  }
}
