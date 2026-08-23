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

  // 2. REDIRECT /login & /erp REQUESTS ON APEX/NON-ERP DOMAINS TO erp.domain.com
  if ((url.pathname === "/login" || url.pathname.startsWith("/erp")) && subdomain !== "erp") {
    const protocol = request.headers.get("x-forwarded-proto") || (isLocal ? "http" : "https");
    let targetHost = "";
    if (isLocal) {
      targetHost = `erp.localhost${port}`;
    } else {
      const baseDomain = hostParts.length > 2 ? hostParts.slice(-2).join(".") : hostWithoutPort;
      targetHost = `erp.${baseDomain}${port}`;
    }
    const targetPath = url.pathname.startsWith("/erp")
      ? (url.pathname.replace(/^\/erp/, "") || "/")
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
