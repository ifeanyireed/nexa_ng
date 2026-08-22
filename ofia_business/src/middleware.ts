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

  // 1. TENANT DIGITAL SHOPFRONT: *.domain.shop (e.g. edusuite.ofia.shop or custom .shop)
  if (hostname.endsWith(".shop") || hostname.includes(".shop:")) {
    const subdomain = hostname.split(".")[0];
    // If accessing root of .shop, rewrite to /shopfront
    if (url.pathname === "/") {
      url.pathname = "/shopfront";
      return NextResponse.rewrite(url);
    }
  }

  // 2. TENANT WORKPLACE & ERP: client_slug.domain.ng / client_slug.domain.com
  // If subdomain is present (excluding apex 'ofia', 'www', 'handyman', 'cars', etc.)
  const knownClusters = ["handyman", "homeservices", "construction", "health", "creative", "tech"];
  const knownNiches = ["cars", "solar", "cctv", "fashion", "realestate", "cleaning", "auto"];

  const hostParts = hostname.split(":")[0].split(".");
  if (hostParts.length > 2) {
    const subdomain = hostParts[0].toLowerCase();

    if (subdomain !== "www" && subdomain !== "app" && subdomain !== "admin") {
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
        if (url.pathname === "/") {
          url.pathname = "/tenant";
          return NextResponse.rewrite(url);
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
