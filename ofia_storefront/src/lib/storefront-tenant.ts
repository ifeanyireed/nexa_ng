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

  // e.g. <subdomain>.ofia.ng (3 parts)
  if (parts.length >= 3) {
    const sub = parts[0];
    if (sub && !SYSTEM_RESERVED_SUBDOMAINS.has(sub)) {
      return sub;
    }
  }

  return null;
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
