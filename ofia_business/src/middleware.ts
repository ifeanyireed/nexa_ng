import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // Exclude static assets, api routes, and next internals
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/favicon.ico") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const hostWithoutPort = hostname.split(":")[0].toLowerCase();
  const port = hostname.includes(":") ? `:${hostname.split(":")[1]}` : "";
  const isLocal = hostWithoutPort.includes("localhost") || hostWithoutPort.includes("127.0.0.1");
  const hostParts = hostWithoutPort.split(".");

  let subdomain = "";
  if (isLocal) {
    if (hostParts.length > 1 && hostParts[0] !== "localhost" && hostParts[0] !== "www") {
      subdomain = hostParts[0];
    }
  } else {
    if (hostParts.length > 2) {
      subdomain = hostParts[0];
    } else if (hostParts.length === 2 && hostParts[1] === "shop") {
      // Direct 2-level .shop domain like brand.shop
      subdomain = hostParts[0];
    }
  }

  // 1. ERP MARKETING & GENERAL PORTAL: erp.domain.ng / erp.ofia.ng / erp.localhost:3000
  // Belongs to NO tenant. Serves the marketing showcase at / and general login form at /login
  if (subdomain === "erp") {
    // Accessing root of erp subdomain -> rewrite to /erp (ERP marketing & showcase page)
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/erp";
      return NextResponse.rewrite(url);
    }
    // Auth & public utility pages keep their direct route on erp subdomain
    if (
      url.pathname === "/login" ||
      url.pathname === "/signup" ||
      url.pathname === "/forgot-password" ||
      url.pathname === "/onboarding" ||
      url.pathname.startsWith("/api") ||
      url.pathname.startsWith("/erp")
    ) {
      return NextResponse.next();
    }
    // Any ERP suite subpaths (/admin, /accountant, /hr, /manager, /employee, /md, /pos, /inventory, /logistics, /referrals, etc.) -> rewrite to /erp/*
    url.pathname = `/erp${url.pathname}`;
    return NextResponse.rewrite(url);
  }



  // 3. TENANT DIGITAL STOREFRONT: *.domain.shop or *.shop (e.g. edusuite.ofia.shop or custom .shop)
  const isShopDomain = hostWithoutPort.endsWith(".shop") || hostWithoutPort.includes(".shop");
  if (isShopDomain) {
    const tenantShopSlug = subdomain && subdomain !== "www" && subdomain !== "shop" ? subdomain : "default";
    const response = NextResponse.next();
    response.headers.set("x-tenant-slug", tenantShopSlug);
    response.headers.set("x-is-shopfront", "true");

    // Rewrite root to /shopfront with tenant slug
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/shopfront";
      url.searchParams.set("tenant", tenantShopSlug);
      return NextResponse.rewrite(url, { headers: response.headers });
    }

    // Preserve static and api paths
    if (url.pathname.startsWith("/api") || url.pathname.startsWith("/_next")) {
      return NextResponse.next();
    }

    // Storefront subpaths (e.g. /shop, /book, /cart, /checkout)
    if (
      url.pathname.startsWith("/shopfront") ||
      url.pathname.startsWith("/book") ||
      url.pathname.startsWith("/checkout") ||
      url.pathname.startsWith("/categories")
    ) {
      url.searchParams.set("tenant", tenantShopSlug);
      return NextResponse.rewrite(url, { headers: response.headers });
    }

    // Default rewrite other pages to shopfront view
    if (!url.pathname.startsWith("/shopfront")) {
      url.pathname = `/shopfront${url.pathname}`;
      url.searchParams.set("tenant", tenantShopSlug);
      return NextResponse.rewrite(url, { headers: response.headers });
    }

    return response;
  }

  // 4. INDUSTRY CLUSTER & NICHE DISCOVERY SUBDOMAINS ({niche}.ofia.ng / {vertical}.ofia.ng)
  const KNOWN_NICHE_SLUGS = new Set([
    // 11 Master Verticals
    "food",
    "hotels", "hotel",
    "rides", "ride",
    "dispatch",
    "beauty",
    "apartments", "apartment", "shortlets", "shortlet",
    "cars", "car",
    "laundry",
    "tutors", "tutor",
    "autocare",
    "properties", "property",

    // 10 Sector Aliases
    "home-services", "homeservices",
    "fashion-grooming", "fashion",
    "professional-services", "professionals",
    "education-skills", "education",
    "events-entertainment", "events",
    "health-wellness", "health",
    "logistics-transport", "logistics",
    "automotive-services", "auto",
    "food-agribusiness",
    "real-estate-construction", "realestate",

    // 24 Canonical One-Word SEO Subcategory Slugs
    "handyman", "specialists", "cleaning",
    "beauty", "laundry",
    "tech", "corporate", "creative", "talent",
    "tutoring", "vocational",
    "planning", "entertainment",
    "medical", "wellness", "caregiving",
    "dispatch", "transport",
    "mechanics", "autocare",
    "culinary", "agriculture",
    "properties", "construction",

    // Specialized high-intent finders
    "plumber", "electrician", "carpenter", "painter", "tiler", "welder",
    "solar", "solar-installer", "generator", "generator-repairer", "ac-technician", "borehole", "inverter",
    "tailor", "barber", "hairdresser", "makeup", "makeup-artist", "nails",
    "lawyer", "accountant", "cctv", "mechanic", "car-mechanic", "chef", "caterer", "chauffeur", "mover"
  ]);

  if (subdomain && subdomain !== "www" && subdomain !== "app" && subdomain !== "admin") {
    const normalizedSubdomain = subdomain.toLowerCase();

    if (KNOWN_NICHE_SLUGS.has(normalizedSubdomain)) {
      const response = NextResponse.next();
      response.headers.set("x-niche-slug", normalizedSubdomain);

      // Root of niche subdomain -> rewrite to /{niche} (e.g. handyman.ofia.ng/ -> /handyman)
      if (url.pathname === "/" || url.pathname === "") {
        url.pathname = `/${normalizedSubdomain}`;
        return NextResponse.rewrite(url, { headers: response.headers });
      }

      // Niche subpaths (e.g. handyman.ofia.ng/search -> /handyman/search, handyman.ofia.ng/category -> /handyman/category)
      if (
        url.pathname.startsWith("/search") ||
        url.pathname.startsWith("/category") ||
        url.pathname.startsWith("/services")
      ) {
        url.pathname = `/${normalizedSubdomain}${url.pathname}`;
        return NextResponse.rewrite(url, { headers: response.headers });
      }

      // If already has /{niche} in path (e.g. handyman.ofia.ng/handyman -> rewrite cleanly)
      if (url.pathname.startsWith(`/${normalizedSubdomain}`)) {
        return response;
      }

      return response;
    }

    // 5. DEDICATED TENANT WORKSPACES (e.g. edusuite.ofia.ng / payflow.ofia.ng)
    const response = NextResponse.next();
    response.headers.set("x-tenant-slug", subdomain);

    // Auth pages stay directly on tenant subdomain (e.g. edusuite.ofia.ng/login)
    if (
      url.pathname === "/login" ||
      url.pathname === "/signup" ||
      url.pathname === "/forgot-password" ||
      url.pathname.startsWith("/api") ||
      url.pathname.startsWith("/erp/reset-password")
    ) {
      return response;
    }

    // Root of tenant subdomain -> rewrite to /tenant dashboard
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/tenant";
      return NextResponse.rewrite(url, { headers: response.headers });
    }

    // If accessing ERP shortcuts directly on tenant subdomain (/admin, /accountant, /hr, /md, /employee, /users)
    const erpShortcuts = ["/admin", "/accountant", "/hr", "/md", "/employee", "/pos", "/inventory", "/logistics", "/referrals", "/users"];
    if (erpShortcuts.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) {
      url.pathname = `/erp${url.pathname}`;
      return NextResponse.rewrite(url, { headers: response.headers });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
