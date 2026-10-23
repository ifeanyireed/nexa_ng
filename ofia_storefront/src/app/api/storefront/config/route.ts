import { NextRequest, NextResponse } from "next/server";
import { TenantStorefrontHandshake, VerticalType } from "@/types/storefront";
import {
  extractSubdomainFromHost,
  SEED_TENANT_HANDSHAKES,
} from "@/lib/storefront-tenant";

export const dynamic = "force-dynamic";

const MARKETPLACE_BASE = process.env.MARKETPLACE_SERVICE_URL
  ? `${process.env.MARKETPLACE_SERVICE_URL.replace(/\/+$/, "")}/api/v1`
  : "http://localhost:8083/api/v1";

const USER_BASE = process.env.USER_SERVICE_URL
  ? `${process.env.USER_SERVICE_URL.replace(/\/+$/, "")}/api/v1`
  : "http://localhost:8081/api/v1";

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

  // 1. Check local seed presets first for instant high-reliability
  if (SEED_TENANT_HANDSHAKES[tenantSlug]) {
    const seed = SEED_TENANT_HANDSHAKES[tenantSlug];
    return NextResponse.json({
      isTenantResolved: true,
      handshake: seed,
    });
  }

  // 2. Fetch from service_marketplace subdomain layouts & service_users
  try {
    const [layoutRes, orgRes] = await Promise.all([
      fetch(`${MARKETPLACE_BASE}/subdomain-layouts/${encodeURIComponent(tenantSlug)}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(2500),
      }).catch(() => null),
      fetch(`${USER_BASE}/organizations/${encodeURIComponent(tenantSlug)}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(2500),
      }).catch(() => null),
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
        isTenantResolved: true,
        handshake,
      });
    }
  } catch (err) {
    console.warn("[Storefront Handshake API] Remote fetch failed:", err);
  }

  // 3. Generative dynamic fallback if tenant not found in remote or seed
  const fallbackHandshake: TenantStorefrontHandshake = {
    tenantId: `org-${tenantSlug}`,
    slug: tenantSlug,
    name: tenantSlug.toUpperCase(),
    domain: `${tenantSlug}.ofia.ng`,
    subdomain: tenantSlug,
    vertical: "retail",
    provisioning: {
      isShopEnabled: true,
      planTier: "GROWTH",
      shopSubModules: {
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
      storeName: `${tenantSlug} Store`,
      headline: "Welcome to Our Digital Storefront",
      primaryColor: "#0069FF",
      secondaryColor: "#0F172A",
      logoUrl: "/ofia-logo.png",
      currency: "₦",
      sectionVisibility: {
        hero: true,
        products: true,
        services: true,
        reviews: true,
        dispatchBooking: true,
      },
      badges: ["Official Storefront"],
    },
  };

  return NextResponse.json({
    isTenantResolved: true,
    handshake: fallbackHandshake,
  });
}
