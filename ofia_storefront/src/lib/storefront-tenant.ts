import { TenantStorefrontHandshake, VendorStore, VerticalType } from "@/types/storefront";
import { MOCK_STORES } from "@/data/mockStores";

const SYSTEM_RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "admin",
  "erp",
  "api",
  "store",
  "storefront",
  "ofia",
  "ofia-shop",
  "localhost",
  "127.0.0.1",
]);

/**
 * Extracts the tenant subdomain from host or hostname string.
 * Supports:
 * - <tenant>.ofia.ng
 * - <tenant>.ofia.shop
 * - <tenant>.localhost:3005
 * - <tenant>.localhost
 */
export function extractSubdomainFromHost(host?: string | null): string | null {
  if (!host) return null;

  const cleanHost = host.split(":")[0].toLowerCase().trim();

  // If host is an IP address or direct localhost without subdomain
  if (cleanHost === "localhost" || cleanHost === "127.0.0.1" || cleanHost === "0.0.0.0") {
    return null;
  }

  const parts = cleanHost.split(".");

  // e.g. <subdomain>.localhost (2 parts)
  if (cleanHost.endsWith(".localhost") && parts.length >= 2) {
    const sub = parts[0];
    if (sub && !SYSTEM_RESERVED_SUBDOMAINS.has(sub)) {
      return sub;
    }
  }

  // e.g. <subdomain>.ofia.ng or <subdomain>.ofia.shop (3 parts)
  if (parts.length >= 3) {
    const sub = parts[0];
    if (sub && !SYSTEM_RESERVED_SUBDOMAINS.has(sub)) {
      return sub;
    }
  }

  return null;
}

export interface ResolvedTenantResolution {
  tenantSlug: string | null;
  source: "query" | "subdomain" | "custom_domain" | "cookie" | null;
  subdomain: string | null;
  domain: string | null;
}

/**
 * High-resilience tenant identity resolver for edge middleware and client context.
 * Checks:
 * 1. Query param (?tenant= / ?store= / ?slug=)
 * 2. Host subdomain (<slug>.ofia.ng, <slug>.localhost:3005)
 * 3. Custom domain matching against known seed stores (e.g. reedbreed.cc)
 * 4. Fallback cookie (ofia_tenant_slug)
 */
export function resolveTenantFromHostAndQuery(
  host?: string | null,
  searchParamsTenant?: string | null,
  cookieTenant?: string | null
): ResolvedTenantResolution {
  // 1. Explicit query parameter takes precedence (ideal for live preview links)
  if (searchParamsTenant && searchParamsTenant.trim()) {
    const slug = searchParamsTenant.toLowerCase().trim();
    return {
      tenantSlug: slug,
      source: "query",
      subdomain: extractSubdomainFromHost(host),
      domain: host ? host.split(":")[0].toLowerCase().trim() : null,
    };
  }

  if (host) {
    const cleanHost = host.split(":")[0].toLowerCase().trim();

    // 2. Subdomain extraction
    const subdomain = extractSubdomainFromHost(cleanHost);
    if (subdomain) {
      return {
        tenantSlug: subdomain,
        source: "subdomain",
        subdomain,
        domain: cleanHost,
      };
    }

    // 3. Custom domain lookup against known presets
    for (const [slug, preset] of Object.entries(SEED_TENANT_HANDSHAKES)) {
      if (preset.domain && preset.domain.toLowerCase().trim() === cleanHost) {
        return {
          tenantSlug: slug,
          source: "custom_domain",
          subdomain: null,
          domain: cleanHost,
        };
      }
    }
  }

  // 4. Fallback to cookie
  if (cookieTenant && cookieTenant.trim()) {
    const slug = cookieTenant.toLowerCase().trim();
    return {
      tenantSlug: slug,
      source: "cookie",
      subdomain: extractSubdomainFromHost(host),
      domain: host ? host.split(":")[0].toLowerCase().trim() : null,
    };
  }

  return {
    tenantSlug: null,
    source: null,
    subdomain: null,
    domain: host ? host.split(":")[0].toLowerCase().trim() : null,
  };
}

/**
 * Resolves a tenant's active vertical archetype from seed presets or cookies.
 */
export function resolveTenantVertical(
  tenantSlug: string,
  cookieVertical?: string | null
): VerticalType {
  if (
    cookieVertical &&
    ["fashion", "cars", "food", "property", "gadgets", "beauty", "home-living", "pharmacy", "hardware", "retail"].includes(
      cookieVertical
    )
  ) {
    return cookieVertical as VerticalType;
  }
  const seed = SEED_TENANT_HANDSHAKES[tenantSlug.toLowerCase()];
  if (seed?.vertical) {
    return seed.vertical;
  }
  return "cars"; // Default archetype
}

/**
 * Top-level route segments that belong to global commerce workflows or explicit vertical templates.
 */
export const GLOBAL_STOREFRONT_ROUTES = new Set([
  "checkout",
  "order-confirmed",
  "order-tracking",
  "search",
  "templates",
  "account",
  "dispatch",
  "info",
  "api",
  "fashion",
  "cars",
  "food",
  "property",
  "gadgets",
  "beauty",
  "home-living",
  "pharmacy",
  "hardware",
  "retail",
]);

export function isGlobalStorefrontRoute(pathname: string): boolean {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment) return true; // root path handled separately
  return GLOBAL_STOREFRONT_ROUTES.has(segment.toLowerCase());
}

/**
 * Fallback preset data for known seed tenants when backend microservices are offline.
 */
export const SEED_TENANT_HANDSHAKES: Record<string, TenantStorefrontHandshake> = {
  neweratransports: {
    tenantId: "1aa8c687-b71d-4188-9de2-371aa5dfa9e6",
    slug: "neweratransports",
    name: "New Era Transports",
    domain: "neweratransports.ofia.ng",
    subdomain: "neweratransports",
    vertical: "cars",
    provisioning: {
      isShopEnabled: true,
      planTier: "ENTERPRISE",
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
      storeName: "New Era Transports & Automotive",
      headline: "Certified Luxury, Performance & Executive Fleet",
      description: "Nigeria's premier dealership for certified pre-owned, brand new, and imported luxury SUVs, executive sedans, and sports coupés.",
      primaryColor: "#0069FF",
      secondaryColor: "#0F172A",
      logoUrl: "/ofia-logo.png",
      bannerUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&h=600&q=80",
      currency: "₦",
      contact: {
        phone: "+234 814 990 4040",
        email: "sales@neweratransports.ofia.ng",
        address: "Plot 8 Akin Adesola Boulevard, Victoria Island, Lagos",
        whatsapp: "+2348149904040",
        operatingHours: "Mon - Sat: 8:00 AM - 6:00 PM",
      },
      sectionVisibility: {
        hero: true,
        products: true,
        services: true,
        reviews: true,
        dispatchBooking: true,
      },
      badges: ["150-Point Inspection Passed", "Clean Title Verified", "At-Home Valet Test-Drive"],
    },
  },

  reedbreed: {
    tenantId: "2bb399db-3689-5129-9b64-e53f0419fa07",
    slug: "reedbreed",
    name: "Reed Breed Systems",
    domain: "reedbreed.cc",
    subdomain: "reedbreed",
    vertical: "gadgets",
    provisioning: {
      isShopEnabled: true,
      planTier: "ENTERPRISE",
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
      storeName: "Reed Breed Silicon & Flagship Hardware",
      headline: "Next-Gen Silicon & Flagship Hardware",
      description: "Enterprise workstations, ultra-thin silicon notebooks, and certified accessories with 2-year express repair replacement warranty.",
      primaryColor: "#4F46E5",
      secondaryColor: "#111827",
      logoUrl: "/ofia-logo.png",
      bannerUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&h=600&q=80",
      currency: "₦",
      contact: {
        phone: "+234 809 111 8844",
        email: "store@reedbreed.cc",
        address: "54 Awolowo Road, Ikoyi, Lagos",
        whatsapp: "+2348091118844",
        operatingHours: "Mon - Fri: 9:00 AM - 6:00 PM",
      },
      sectionVisibility: {
        hero: true,
        products: true,
        services: true,
        reviews: true,
        dispatchBooking: true,
      },
      badges: ["2-Year Device Warranty", "Same-Day Courier Delivery", "Diagnostic Clinic Onsite"],
    },
  },
};

/**
 * Composes a full VendorStore object by merging dynamic tenant handshake settings over vertical presets.
 */
export function buildDynamicVendorStore(
  handshake: TenantStorefrontHandshake,
  fallbackStore?: VendorStore
): VendorStore {
  const basePreset = fallbackStore || MOCK_STORES[handshake.vertical] || MOCK_STORES.retail;

  return {
    ...basePreset,
    id: handshake.tenantId || basePreset.id,
    slug: handshake.slug || basePreset.slug,
    name: handshake.storefrontConfig.storeName || handshake.name || basePreset.name,
    vertical: handshake.vertical || basePreset.vertical,
    tagline: handshake.storefrontConfig.headline || basePreset.tagline,
    description: handshake.storefrontConfig.description || basePreset.description,
    primaryColor: handshake.storefrontConfig.primaryColor || basePreset.primaryColor,
    accentColor: handshake.storefrontConfig.secondaryColor || basePreset.accentColor,
    logo: handshake.storefrontConfig.logoUrl || basePreset.logo,
    coverImage: handshake.storefrontConfig.bannerUrl || basePreset.coverImage,
    currency: handshake.storefrontConfig.currency || basePreset.currency || "₦",
    contact: {
      ...basePreset.contact,
      ...(handshake.storefrontConfig.contact || {}),
    },
    badges: handshake.storefrontConfig.badges?.length ? handshake.storefrontConfig.badges : basePreset.badges,
    features: basePreset.features,
  };
}
