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

  // Strip port (e.g. "tenantslug.localhost:3005" -> "tenantslug.localhost")
  const cleanHost = host.split(":")[0].toLowerCase().trim();

  // If host is an IP address or direct localhost without subdomain
  if (
    cleanHost === "localhost" ||
    cleanHost === "127.0.0.1" ||
    cleanHost === "0.0.0.0" ||
    cleanHost.startsWith("192.168.") ||
    cleanHost.startsWith("10.")
  ) {
    return null;
  }

  // Explicit support for: <tenant>.localhost or <tenant>.localhost:3005
  if (cleanHost.endsWith(".localhost")) {
    const sub = cleanHost.replace(/\.localhost$/, "");
    if (sub && !SYSTEM_RESERVED_SUBDOMAINS.has(sub)) {
      return sub.split(".")[0];
    }
    return null;
  }

  const parts = cleanHost.split(".");

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
/**
 * Strict Host-Based Tenant Identity Resolver for edge middleware and client context.
 * Strict multi-tenant isolation: Tenant storefront identity is governed strictly by
 * the request Host (subdomain or custom domain). Query parameters (?tenant=) are forbidden
 * and ignored to ensure authentic branded isolation.
 */
export function resolveTenantFromHostAndQuery(
  host?: string | null,
  _searchParamsTenant?: string | null, // Query parameter tenant routing removed per strict architecture
  cookieTenant?: string | null
): ResolvedTenantResolution {
  if (host) {
    const cleanHost = host.split(":")[0].toLowerCase().trim();

    // 1. Subdomain extraction (<slug>.ofia.ng, <slug>.localhost:3005)
    const subdomain = extractSubdomainFromHost(cleanHost);
    if (subdomain) {
      return {
        tenantSlug: subdomain,
        source: "subdomain",
        subdomain,
        domain: cleanHost,
      };
    }

    // 2. Custom domain lookup against known presets (e.g. reedbreed.cc)
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

  return {
    tenantSlug: null,
    source: null,
    subdomain: null,
    domain: host ? host.split(":")[0].toLowerCase().trim() : null,
  };
}

/**
 * Detects the most appropriate vertical from tenant slug keywords if not explicitly configured.
 */
export function detectTenantVerticalFromSlug(slug: string): VerticalType {
  const s = (slug || "").toLowerCase().trim();
  if (s.includes("fashion") || s.includes("cloth") || s.includes("apparel") || s.includes("wear") || s.includes("couture") || s.includes("tailor") || s.includes("boutique")) return "fashion";
  if (s.includes("car") || s.includes("auto") || s.includes("motor") || s.includes("transport") || s.includes("vehicle") || s.includes("ride") || s.includes("drive")) return "cars";
  if (s.includes("food") || s.includes("eat") || s.includes("bistro") || s.includes("cafe") || s.includes("grill") || s.includes("kitchen") || s.includes("bake") || s.includes("restaurant") || s.includes("meal")) return "food";
  if (s.includes("pharma") || s.includes("rx") || s.includes("drug") || s.includes("med") || s.includes("health") || s.includes("clinic") || s.includes("chemist")) return "pharmacy";
  if (s.includes("gadget") || s.includes("tech") || s.includes("phone") || s.includes("laptop") || s.includes("device") || s.includes("compute")) return "gadgets";
  if (s.includes("beauty") || s.includes("salon") || s.includes("spa") || s.includes("cosmetic") || s.includes("skin") || s.includes("glow") || s.includes("hair")) return "beauty";
  if (s.includes("property") || s.includes("realt") || s.includes("estate") || s.includes("house") || s.includes("apart") || s.includes("shortlet") || s.includes("stay")) return "property";
  if (s.includes("furniture") || s.includes("decor") || s.includes("interior") || s.includes("furnish") || s.includes("living")) return "home-living";
  if (s.includes("solar") || s.includes("energy") || s.includes("hardware") || s.includes("power") || s.includes("inverter") || s.includes("tool") || s.includes("industrial")) return "hardware";
  if (s.includes("courier") || s.includes("dispatch") || s.includes("logistics") || s.includes("cargo") || s.includes("express") || s.includes("waybill")) return "dispatch";
  return "retail";
}

/**
 * Resolves a tenant's active vertical archetype from seed presets, cookies, or slug heuristic.
 */
export function resolveTenantVertical(
  tenantSlug: string,
  cookieVertical?: string | null
): VerticalType {
  if (
    cookieVertical &&
    ["fashion", "cars", "food", "property", "gadgets", "beauty", "home-living", "pharmacy", "hardware", "retail", "dispatch"].includes(
      cookieVertical
    )
  ) {
    return cookieVertical as VerticalType;
  }
  const clean = (tenantSlug || "").toLowerCase().trim();
  const seed = SEED_TENANT_HANDSHAKES[clean];
  if (seed?.vertical) {
    return seed.vertical;
  }
  return detectTenantVerticalFromSlug(clean);
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
  "unprovisioned",
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

  speedycouriers: {
    tenantId: "3cc400ea-4790-6230-0c75-f64f0520fb18",
    slug: "speedycouriers",
    name: "Speedy Couriers & Logistics",
    domain: "speedycouriers.ofia.ng",
    subdomain: "speedycouriers",
    vertical: "dispatch",
    provisioning: {
      isShopEnabled: true,
      planTier: "ENTERPRISE",
      shopSubModules: {
        pos: true,
        inventory: false,
        catalog: false,
        services: true,
        orders: true,
        store: true,
        referrals: true,
      },
    },
    storefrontConfig: {
      storeName: "Speedy Couriers & Express Dispatch",
      headline: "Instant Citywide Motorcycle & Cargo Dispatch",
      description: "Rapid on-demand parcel pickup, e-commerce cash-on-delivery logistics, and corporate document dispatch across Lagos.",
      primaryColor: "#2563EB",
      secondaryColor: "#1E293B",
      logoUrl: "/ofia-logo.png",
      bannerUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&h=600&q=80",
      currency: "₦",
      contact: {
        phone: "+234 803 123 4567",
        email: "operations@speedycouriers.ofia.ng",
        address: "Hub 12, Commercial Corridor, Ikeja & Lekki, Lagos",
        whatsapp: "+2348031234567",
        operatingHours: "24/7 Operations · Weekend Dispatch Available",
      },
      sectionVisibility: {
        hero: true,
        products: false,
        services: true,
        reviews: true,
        dispatchBooking: true,
      },
      badges: ["Licensed Courier Operator", "Real-Time GPS Tracking", "Delivery OTP Security Handover"],
    },
  },

  funmyclothing: {
    tenantId: "99d52e05-3cb1-45d1-acc8-4edf9e2abcd8",
    slug: "funmyclothing",
    name: "Funmy Clothing",
    domain: "funmyclothing.ofia.ng",
    subdomain: "funmyclothing",
    vertical: "fashion",
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
      storeName: "Funmy Clothing & Haute Couture",
      headline: "Contemporary Bespoke Fashion & Ready-To-Wear Elegance",
      description: "Curated seasonal capsules, bespoke tailored cuts, and artisan outerwear crafted with sustainable heritage textiles.",
      primaryColor: "#B45309",
      secondaryColor: "#18181B",
      logoUrl: "/ofia-logo.png",
      bannerUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&h=600&q=80",
      currency: "₦",
      contact: {
        phone: "+234 802 555 0192",
        email: "funmyclothing@gmail.com",
        address: "14 Victoria Arobieke Street, Lekki Phase 1, Lagos",
        whatsapp: "+2348025550192",
        operatingHours: "Mon - Sat: 9:00 AM - 7:30 PM",
      },
      sectionVisibility: {
        hero: true,
        products: true,
        services: true,
        reviews: true,
        dispatchBooking: true,
      },
      badges: ["Artisan Handcrafted", "Size Customization Available", "Global Express Dispatch"],
    },
  },

  "funmy-clothing": {
    tenantId: "99d52e05-3cb1-45d1-acc8-4edf9e2abcd8",
    slug: "funmyclothing",
    name: "Funmy Clothing",
    domain: "funmyclothing.ofia.ng",
    subdomain: "funmyclothing",
    vertical: "fashion",
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
      storeName: "Funmy Clothing & Haute Couture",
      headline: "Contemporary Bespoke Fashion & Ready-To-Wear Elegance",
      description: "Curated seasonal capsules, bespoke tailored cuts, and artisan outerwear crafted with sustainable heritage textiles.",
      primaryColor: "#B45309",
      secondaryColor: "#18181B",
      logoUrl: "/ofia-logo.png",
      bannerUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&h=600&q=80",
      currency: "₦",
      contact: {
        phone: "+234 802 555 0192",
        email: "funmyclothing@gmail.com",
        address: "14 Victoria Arobieke Street, Lekki Phase 1, Lagos",
        whatsapp: "+2348025550192",
        operatingHours: "Mon - Sat: 9:00 AM - 7:30 PM",
      },
      sectionVisibility: {
        hero: true,
        products: true,
        services: true,
        reviews: true,
        dispatchBooking: true,
      },
      badges: ["Artisan Handcrafted", "Size Customization Available", "Global Express Dispatch"],
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
