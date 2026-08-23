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

  // 1. ERP SUBDOMAIN: erp.domain.com / erp.ofia.ng / erp.localhost:3000
  if (subdomain === "erp") {
    // If accessing root of erp subdomain -> rewrite to /erp landing page
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/erp";
      return NextResponse.rewrite(url);
    }
    // If accessing /admin, /accountant, /hr, etc. directly on erp subdomain -> rewrite to /erp/*
    if (!url.pathname.startsWith("/erp") && !url.pathname.startsWith("/api")) {
      url.pathname = `/erp${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // 2. REDIRECT /erp REQUESTS ON APEX/NON-ERP DOMAINS TO erp.domain.com
  if (url.pathname.startsWith("/erp") && subdomain !== "erp") {
    const protocol = request.headers.get("x-forwarded-proto") || (isLocal ? "http" : "https");
    let targetHost = "";
    if (isLocal) {
      targetHost = `erp.localhost${port}`;
    } else {
      const baseDomain = hostParts.length > 2 ? hostParts.slice(-2).join(".") : hostWithoutPort;
      targetHost = `erp.${baseDomain}${port}`;
    }
    const targetPath = url.pathname.replace(/^\/erp/, "") || "/";
    return NextResponse.redirect(new URL(`${protocol}://${targetHost}${targetPath}${url.search}`), 307);
  }

  // 3. TENANT DIGITAL SHOPFRONT: *.domain.shop (e.g. edusuite.ofia.shop or custom .shop)
  if (hostname.endsWith(".shop") || hostname.includes(".shop:")) {
    // If accessing root of .shop, rewrite to /shopfront
    if (url.pathname === "/") {
      url.pathname = "/shopfront";
      return NextResponse.rewrite(url);
    }
  }

  // 4. TENANT WORKPLACE & INDUSTRY CLUSTERS / NICHES
  const knownClusters = ["handyman", "homeservices", "construction", "health", "creative", "tech"];
  const knownNiches = ["cars", "solar", "cctv", "fashion", "realestate", "cleaning", "auto"];

  if (subdomain && subdomain !== "www" && subdomain !== "app" && subdomain !== "admin") {
    // Check if cluster subdomain
    if (knownClusters.includes(subdomain)) {
      if (url.pathname === "/") {
        url.pathname = `/${subdomain}`;
        return NextResponse.rewrite(url);
      }
    }
    // Check if vertical niche subdomain
    else if (knownNiches.includes(subdomain)) {
      if (url.pathname === "/") {
        url.pathname = `/${subdomain}`;
        return NextResponse.rewrite(url);
      }
    }
    // Otherwise, it's a business tenant workplace (e.g. edusuite.ofia.ng)
    else {
      // Allow public quest screens without rewriting to /tenant
      if (url.pathname.startsWith("/quests")) {
        const response = NextResponse.next();
        response.headers.set("x-tenant-slug", subdomain);
        return response;
      }

      if (url.pathname === "/") {
        url.pathname = "/tenant";
        return NextResponse.rewrite(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
