/**
 * OFIA COMPASS & ERP SUBDOMAIN AVAILABILITY ENGINE
 * 
 * Validates tenant workspace subdomains ({slug}.ofia.ng) and digital storefront domains ({slug}.ofia.shop / {slug}.shop).
 * Enforces strict reservation rules for:
 * 1. Platform & infrastructure reserved keywords (admin, erp, app, auth, api, etc.)
 * 2. 11 Master Verticals (food, rides, hotels, apartments, beauty, tutors, autocare, etc.)
 * 3. 10 Sector Aliases (home-services, fashion, logistics, education, etc.)
 * 4. 24+ Canonical Subcategory & High-Intent Niche Finders (handyman, solar, plumber, etc.)
 * 5. Existing registered tenant workspace and .shop storefront slugs.
 */

// 1. Core Platform & Infrastructure Reserved Keywords
export const SYSTEM_RESERVED_SUBDOMAINS = new Set<string>([
  "admin",
  "superadmin",
  "super-admin",
  "erp",
  "app",
  "apps",
  "www",
  "api",
  "auth",
  "login",
  "signup",
  "sign-in",
  "sign-up",
  "register",
  "join",
  "logout",
  "dashboard",
  "portal",
  "billing",
  "checkout",
  "pay",
  "payment",
  "payments",
  "support",
  "help",
  "status",
  "health",
  "healthz",
  "docs",
  "documentation",
  "cdn",
  "static",
  "assets",
  "mail",
  "email",
  "webmail",
  "smtp",
  "imap",
  "pop3",
  "ns1",
  "ns2",
  "root",
  "staging",
  "dev",
  "development",
  "test",
  "testing",
  "demo",
  "internal",
  "hub",
  "compass",
  "ofia",
  "nexa",
  "storefront",
  "shopfront",
  "marketplace",
]);

// 2. 11 Master Verticals & Alternate Singular/Plural Forms
export const MASTER_VERTICAL_SUBDOMAINS = new Set<string>([
  "food",
  "hotels",
  "hotel",
  "rides",
  "ride",
  "dispatch",
  "beauty",
  "apartments",
  "apartment",
  "shortlets",
  "shortlet",
  "cars",
  "car",
  "laundry",
  "tutors",
  "tutor",
  "autocare",
  "properties",
  "property",
]);

// 3. 10 Sector Aliases
export const SECTOR_ALIAS_SUBDOMAINS = new Set<string>([
  "home-services",
  "homeservices",
  "fashion-grooming",
  "fashion",
  "professional-services",
  "professionals",
  "education-skills",
  "education",
  "events-entertainment",
  "events",
  "health-wellness",
  "health",
  "logistics-transport",
  "logistics",
  "automotive-services",
  "auto",
  "food-agribusiness",
  "real-estate-construction",
  "realestate",
]);

// 4. 24 Canonical Subcategories & High-Intent Niche Slugs
export const NICHE_SUBCATEGORY_SUBDOMAINS = new Set<string>([
  // Canonical Subcategories
  "handyman",
  "specialists",
  "cleaning",
  "sanitation",
  "style",
  "wardrobe",
  "tech",
  "corporate",
  "creative",
  "talent",
  "tutoring",
  "vocational",
  "planning",
  "entertainment",
  "medical",
  "wellness",
  "caregiving",
  "transport",
  "mechanics",
  "culinary",
  "agriculture",
  "construction",

  // Specialized High-Intent Finders
  "plumber",
  "electrician",
  "carpenter",
  "painter",
  "tiler",
  "welder",
  "solar",
  "solar-installer",
  "generator",
  "generator-repairer",
  "ac-technician",
  "borehole",
  "inverter",
  "tailor",
  "barber",
  "hairdresser",
  "makeup",
  "makeup-artist",
  "nails",
  "lawyer",
  "accountant",
  "cctv",
  "car-mechanic",
  "chef",
  "caterer",
  "chauffeur",
  "mover",
]);

// 5. Existing Registered Tenant Slugs (Known Seed Registry)
export const REGISTERED_TENANT_SLUGS = new Set<string>([
  "edusuite",
  "edusuite-ng",
  "payflow",
  "payflow-africa",
  "paydirect",
  "paydirect-africa",
  "healthbridge",
  "healthbridge-ng",
  "healthpulse",
  "healthpulse-ng",
  "logitrack",
  "logitrack-express",
  "apex-auto",
  "lagos-plumbers",
  "sparkleclean",
  "rapidexpress",
]);

export type SubdomainCategory =
  | "AVAILABLE"
  | "SYSTEM_RESERVED"
  | "VERTICAL_RESERVED"
  | "SECTOR_RESERVED"
  | "NICHE_RESERVED"
  | "TENANT_TAKEN"
  | "INVALID_FORMAT";

export interface SubdomainValidationResult {
  slug: string;
  normalizedSlug: string;
  isAvailable: boolean;
  category: SubdomainCategory;
  message: string;
  workspaceDomain: string; // e.g. "acme.ofia.ng"
  storefrontDomain: string; // e.g. "acme.ofia.shop"
  customShopDomain: string; // e.g. "acme.shop"
  suggestions: string[];
}

/**
 * Normalizes input text into a valid RFC 1123 DNS hostname slug
 */
export function normalizeSubdomainSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-") // Replace non-alphanumeric chars with hyphen
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ""); // Trim leading and trailing hyphens
}

/**
 * Generates smart, available alternative slugs if the desired slug is taken or reserved
 */
export function generateAvailableSlugSuggestions(baseSlug: string, count = 4): string[] {
  const clean = normalizeSubdomainSlug(baseSlug) || "workspace";
  const suffixes = ["hq", "ng", "biz", "store", "hub", "app", "global", "group", "direct", "pro"];
  const prefixes = ["get", "my", "the", "use"];

  const suggestions: string[] = [];

  // Try suffixes first
  for (const suf of suffixes) {
    const candidate = `${clean}-${suf}`;
    if (isSlugCompletelyAvailableLocally(candidate)) {
      suggestions.push(candidate);
      if (suggestions.length >= count) return suggestions;
    }
  }

  // Try prefixes
  for (const pref of prefixes) {
    const candidate = `${pref}-${clean}`;
    if (isSlugCompletelyAvailableLocally(candidate)) {
      suggestions.push(candidate);
      if (suggestions.length >= count) return suggestions;
    }
  }

  return suggestions;
}

/**
 * Quick local synchronous check if candidate slug hits any reserved/taken list
 */
function isSlugCompletelyAvailableLocally(slug: string): boolean {
  if (!slug || slug.length < 3 || slug.length > 63) return false;
  if (SYSTEM_RESERVED_SUBDOMAINS.has(slug)) return false;
  if (MASTER_VERTICAL_SUBDOMAINS.has(slug)) return false;
  if (SECTOR_ALIAS_SUBDOMAINS.has(slug)) return false;
  if (NICHE_SUBCATEGORY_SUBDOMAINS.has(slug)) return false;
  if (REGISTERED_TENANT_SLUGS.has(slug)) return false;
  return true;
}

/**
 * Core Subdomain Availability Validator
 * 
 * @param rawSlug - Raw user input (e.g. "My Company", "food", "edusuite")
 * @param existingTenantSlugs - Optional list of live DB tenant slugs to check against
 */
export function validateSubdomainAvailability(
  rawSlug: string,
  existingTenantSlugs?: string[] | Set<string>
): SubdomainValidationResult {
  const normalized = normalizeSubdomainSlug(rawSlug);

  const workspaceDomain = `${normalized || "your-subdomain"}.ofia.ng`;
  const storefrontDomain = `${normalized || "your-subdomain"}.ofia.shop`;
  const customShopDomain = `${normalized || "your-subdomain"}.shop`;

  // 1. Check Format & Length Rules
  if (!normalized) {
    return {
      slug: rawSlug,
      normalizedSlug: "",
      isAvailable: false,
      category: "INVALID_FORMAT",
      message: "Please enter a subdomain slug.",
      workspaceDomain,
      storefrontDomain,
      customShopDomain,
      suggestions: [],
    };
  }

  if (normalized.length < 3) {
    return {
      slug: rawSlug,
      normalizedSlug: normalized,
      isAvailable: false,
      category: "INVALID_FORMAT",
      message: "Subdomain must be at least 3 characters long.",
      workspaceDomain,
      storefrontDomain,
      customShopDomain,
      suggestions: generateAvailableSlugSuggestions(normalized),
    };
  }

  if (normalized.length > 63) {
    return {
      slug: rawSlug,
      normalizedSlug: normalized,
      isAvailable: false,
      category: "INVALID_FORMAT",
      message: "Subdomain cannot exceed 63 characters.",
      workspaceDomain,
      storefrontDomain,
      customShopDomain,
      suggestions: [],
    };
  }

  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(normalized)) {
    return {
      slug: rawSlug,
      normalizedSlug: normalized,
      isAvailable: false,
      category: "INVALID_FORMAT",
      message: "Subdomain can only contain lowercase letters, numbers, and hyphens.",
      workspaceDomain,
      storefrontDomain,
      customShopDomain,
      suggestions: generateAvailableSlugSuggestions(normalized),
    };
  }

  // 2. Check System Reserved (admin, erp, app, etc.)
  if (SYSTEM_RESERVED_SUBDOMAINS.has(normalized)) {
    return {
      slug: rawSlug,
      normalizedSlug: normalized,
      isAvailable: false,
      category: "SYSTEM_RESERVED",
      message: `'${normalized}' is a reserved platform root address.`,
      workspaceDomain,
      storefrontDomain,
      customShopDomain,
      suggestions: generateAvailableSlugSuggestions(normalized),
    };
  }

  // 3. Check 11 Master Verticals
  if (MASTER_VERTICAL_SUBDOMAINS.has(normalized)) {
    return {
      slug: rawSlug,
      normalizedSlug: normalized,
      isAvailable: false,
      category: "VERTICAL_RESERVED",
      message: `'${normalized}' is reserved for the ${normalized.toUpperCase()} Master Marketplace Vertical.`,
      workspaceDomain,
      storefrontDomain,
      customShopDomain,
      suggestions: generateAvailableSlugSuggestions(normalized),
    };
  }

  // 4. Check 10 Sector Aliases
  if (SECTOR_ALIAS_SUBDOMAINS.has(normalized)) {
    return {
      slug: rawSlug,
      normalizedSlug: normalized,
      isAvailable: false,
      category: "SECTOR_RESERVED",
      message: `'${normalized}' is reserved for a Compass Marketplace Sector.`,
      workspaceDomain,
      storefrontDomain,
      customShopDomain,
      suggestions: generateAvailableSlugSuggestions(normalized),
    };
  }

  // 5. Check 24+ Canonical Subcategories & Niche Finders
  if (NICHE_SUBCATEGORY_SUBDOMAINS.has(normalized)) {
    return {
      slug: rawSlug,
      normalizedSlug: normalized,
      isAvailable: false,
      category: "NICHE_RESERVED",
      message: `'${normalized}' is reserved for the '${normalized}' Niche Discovery Cluster.`,
      workspaceDomain,
      storefrontDomain,
      customShopDomain,
      suggestions: generateAvailableSlugSuggestions(normalized),
    };
  }

  // 6. Check Registered Tenants & Storefront .shop Domains
  const liveTenantsSet = existingTenantSlugs
    ? (existingTenantSlugs instanceof Set ? existingTenantSlugs : new Set(existingTenantSlugs))
    : REGISTERED_TENANT_SLUGS;

  if (liveTenantsSet.has(normalized)) {
    return {
      slug: rawSlug,
      normalizedSlug: normalized,
      isAvailable: false,
      category: "TENANT_TAKEN",
      message: `The subdomain '${normalized}.ofia.ng' and storefront '${normalized}.ofia.shop' are already taken by an existing tenant.`,
      workspaceDomain,
      storefrontDomain,
      customShopDomain,
      suggestions: generateAvailableSlugSuggestions(normalized),
    };
  }

  // 7. Subdomain is Available
  return {
    slug: rawSlug,
    normalizedSlug: normalized,
    isAvailable: true,
    category: "AVAILABLE",
    message: `'${normalized}.ofia.ng' and '${normalized}.ofia.shop' are both available!`,
    workspaceDomain,
    storefrontDomain,
    customShopDomain,
    suggestions: [],
  };
}
