import { NextRequest, NextResponse } from "next/server";
import { TenantStorefrontHandshake, VerticalType } from "@/types/storefront";
import {
  extractSubdomainFromHost,
  SEED_TENANT_HANDSHAKES,
} from "@/lib/storefront-tenant";
import { neon } from "@neondatabase/serverless";
import { MASTER_REGISTRY_URL } from "@/lib/tenant-db-resolver";

export const dynamic = "force-dynamic";

const MARKETPLACE_BASE = process.env.MARKETPLACE_SERVICE_URL
  ? `${process.env.MARKETPLACE_SERVICE_URL.replace(/\/+$/, "")}/api/v1`
  : null;

const USER_BASE = process.env.USER_SERVICE_URL
  ? `${process.env.USER_SERVICE_URL.replace(/\/+$/, "")}/api/v1`
  : null;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const host = request.headers.get("host");

  const queryTenant = searchParams.get("tenant") || searchParams.get("slug") || searchParams.get("store");
  const hostSubdomain = extractSubdomainFromHost(host);
  const headerTenant = request.headers.get("x-tenant-slug");
  const tenantSlug = (queryTenant || hostSubdomain || headerTenant || "").toLowerCase().trim();

  if (!tenantSlug) {
    return NextResponse.json(
      { error: "tenant parameter is required for multi-tenant isolation", isTenantResolved: false },
      { status: 400 }
    );
  }

  // 1. Query platform_tenants registry directly in PostgreSQL
  try {
    const registrySql = neon(MASTER_REGISTRY_URL);
    const rows = await registrySql`
      SELECT id, name, slug, domain, vertical, status, db_mode, plan_tier,
             logo, login_image, hero_title, hero_subtitle, shop_sub_modules, owner_email
      FROM platform_tenants
      WHERE LOWER(slug) = ${tenantSlug}
      LIMIT 1;
    `;

    if (rows && rows.length > 0) {
      const r = rows[0];
      const verticalKey: VerticalType = (r.vertical as VerticalType) || "retail";

      const handshake: TenantStorefrontHandshake = {
        tenantId: r.id || `org-${tenantSlug}`,
        slug: r.slug,
        name: r.name || tenantSlug,
        domain: r.domain || `${tenantSlug}.ofia.ng`,
        subdomain: tenantSlug,
        vertical: verticalKey,
        provisioning: {
          isShopEnabled: true,
          planTier: (r.plan_tier as any) || "GROWTH",
          shopSubModules: r.shop_sub_modules || {
            pos: true,
            inventory: true,
            catalog: true,
            services: true,
            orders: true,
            store: true,
            referrals: true,
          },
        },
        storefrontConfig: {
          storeName: r.name || tenantSlug,
          headline: r.hero_title || "Premium Products & Reliable Service",
          description: r.hero_subtitle || "",
          primaryColor: "#0069FF",
          secondaryColor: "#0F172A",
          logoUrl: (r.logo || "").trim(),
          bannerUrl: (r.login_image || "").trim(),
          currency: "₦",
          contact: {
            email: r.owner_email || `contact@${tenantSlug}.ofia.ng`,
          },
          sectionVisibility: {
            hero: true,
            products: true,
            services: true,
            reviews: true,
            dispatchBooking: true,
          },
          badges: [],
        },
      };

      return NextResponse.json({
        success: true,
        isTenantResolved: true,
        handshake,
      });
    }
  } catch (dbErr) {
    console.warn(`[Storefront Handshake API] Database lookup error for '${tenantSlug}':`, dbErr);
  }

  // 2. Check seed presets fallback if DB is unreachable
  if (SEED_TENANT_HANDSHAKES[tenantSlug]) {
    const seed = SEED_TENANT_HANDSHAKES[tenantSlug];
    return NextResponse.json({
      success: true,
      isTenantResolved: true,
      handshake: seed,
    });
  }

  // 3. Check remote microservices (service_marketplace & service_users) if explicitly configured
  if (MARKETPLACE_BASE || USER_BASE) {
    try {
      const [layoutRes, orgRes] = await Promise.all([
        MARKETPLACE_BASE
          ? fetch(`${MARKETPLACE_BASE}/subdomain-layouts/${encodeURIComponent(tenantSlug)}`, {
              cache: "no-store",
              signal: AbortSignal.timeout(1500),
            }).catch(() => null)
          : Promise.resolve(null),
        USER_BASE
          ? fetch(`${USER_BASE}/organizations/${encodeURIComponent(tenantSlug)}`, {
              cache: "no-store",
              signal: AbortSignal.timeout(1500),
            }).catch(() => null)
          : Promise.resolve(null),
      ]);

      const layoutData = layoutRes && layoutRes.ok ? await layoutRes.json().catch(() => null) : null;
      const orgData = orgRes && orgRes.ok ? await orgRes.json().catch(() => null) : null;

    if (layoutData || orgData) {
      const verticalKey: VerticalType =
        (orgData?.vertical as VerticalType) ||
        (layoutData?.layout_key as VerticalType) ||
        "retail";

      const handshake: TenantStorefrontHandshake = {
        tenantId: orgData?.id || layoutData?.id || `org-${tenantSlug}`,
        slug: tenantSlug,
        name: orgData?.name || layoutData?.custom_title || tenantSlug,
        domain: orgData?.domain || `${tenantSlug}.ofia.ng`,
        subdomain: tenantSlug,
        vertical: verticalKey,
        provisioning: {
          isShopEnabled: orgData?.shopEnabled ?? true,
          planTier: orgData?.plan_tier || orgData?.planTier || "GROWTH",
          shopSubModules: orgData?.shopSubModules || orgData?.shop_sub_modules || {
            pos: true,
            inventory: true,
            catalog: true,
            services: true,
            orders: true,
            store: true,
            referrals: true,
          },
        },
        storefrontConfig: {
          storeName: layoutData?.custom_title || orgData?.name || `${tenantSlug} Store`,
          headline: layoutData?.custom_subtitle || orgData?.heroTitle || "Premium Products & Reliable Service",
          description: orgData?.heroSubtitle || "",
          primaryColor: layoutData?.theme_color || orgData?.primaryColor || "#0069FF",
          secondaryColor: orgData?.secondaryColor || "#0F172A",
          logoUrl: orgData?.logo || "/ofia-logo.png",
          bannerUrl: orgData?.loginImage || "https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=1600&h=600&q=80",
          currency: "₦",
          contact: {
            email: orgData?.ownerEmail || `contact@${tenantSlug}.ofia.ng`,
          },
          sectionVisibility: {
            hero: true,
            products: true,
            services: true,
            reviews: true,
            dispatchBooking: true,
          },
          badges: ["Verified Ofia Merchant"],
        },
      };

      return NextResponse.json({
        success: true,
        isTenantResolved: true,
        handshake,
      });
    }
  } catch (err) {
    console.warn("[Storefront Handshake API] Remote fetch failed:", err);
  }
}

  // 4. If tenant is NOT provisioned anywhere, return HTTP 404 (strictly NO fallback vertical!)
  return NextResponse.json(
    {
      success: false,
      isTenantResolved: false,
      error: `Storefront workspace '${tenantSlug}' is not provisioned on Ofia Platform.`,
    },
    { status: 404 }
  );
}
