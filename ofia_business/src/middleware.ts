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
    }
  }

  // 1. ERP GENERAL SUBDOMAIN: erp.ofia.ng / erp.localhost:3000 / erp.domain.com
  if (subdomain === "erp") {
    // Accessing root of erp subdomain -> rewrite to /login (general ERP login console)
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/login";
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

  // 2. REDIRECT /login & /erp REQUESTS ON APEX/WWW (ofia.ng) TO erp.ofia.ng
  // Only redirect if accessing from apex / www, NEVER redirect tenant subdomains!
  const isApexOrWww = !subdomain || subdomain === "www";
  if (isApexOrWww && (url.pathname === "/login" || url.pathname.startsWith("/erp"))) {
    const protocol = request.headers.get("x-forwarded-proto") || (isLocal ? "http" : "https");
    let targetHost = "";
    if (isLocal) {
      targetHost = `erp.localhost${port}`;
    } else {
      const baseDomain = hostParts.length > 2 ? hostParts.slice(-2).join(".") : hostWithoutPort;
      targetHost = `erp.${baseDomain}${port}`;
    }
    const targetPath = url.pathname.startsWith("/erp")
      ? (url.pathname.replace(/^\/erp/, "") || "/login")
      : url.pathname;
    return NextResponse.redirect(new URL(`${protocol}://${targetHost}${targetPath}${url.search}`), 307);
  }

  // 3. TENANT DIGITAL SHOPFRONT: *.domain.shop (e.g. edusuite.ofia.shop or custom .shop)
  if (hostname.endsWith(".shop") || hostname.includes(".shop:")) {
    if (url.pathname === "/") {
      url.pathname = "/shopfront";
      return NextResponse.rewrite(url);
    }
  }

  // 4. TENANT WORKPLACE & INDUSTRY CLUSTERS / NICHES
  const knownClusters = ["handyman", "homeservices", "construction", "health", "creative", "tech"];
  const knownNiches = ["cars", "solar", "cctv", "fashion", "realestate", "cleaning", "auto"];

  if (subdomain && subdomain !== "www" && subdomain !== "app" && subdomain !== "admin") {
    if (knownClusters.includes(subdomain)) {
      if (url.pathname === "/") {
        url.pathname = `/${subdomain}`;
        return NextResponse.rewrite(url);
      }
    } else if (knownNiches.includes(subdomain)) {
      if (url.pathname === "/") {
        url.pathname = `/${subdomain}`;
        return NextResponse.rewrite(url);
      }
    } else {
      // Dedicated Tenant Subdomain (e.g. edusuite.ofia.ng / edusuite.localhost:3000)
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

      // If accessing ERP shortcuts directly on tenant subdomain (/admin, /accountant, /hr, /md, /employee)
      const erpShortcuts = ["/admin", "/accountant", "/hr", "/md", "/employee", "/pos", "/inventory", "/logistics", "/referrals"];
      if (erpShortcuts.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) {
        url.pathname = `/erp${url.pathname}`;
        return NextResponse.rewrite(url, { headers: response.headers });
      }

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
