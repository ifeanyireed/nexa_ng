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

  const erpShortcuts = [
    "/admin",
    "/accountant",
    "/hr",
    "/md",
    "/employee",
    "/manager",
    "/marketer",
    "/pos",
    "/inventory",
    "/logistics",
    "/referrals",
    "/users",
  ];

  // 1. GENERAL ERP PORTAL (erp.ofia.ng / erp.localhost)
  if (subdomain === "erp" || subdomain === "app") {
    // Root stays on marketing showcase / or login
    if (url.pathname === "/" || url.pathname === "") {
      return NextResponse.next();
    }
    // Auth & public utility pages keep direct route
    if (
      url.pathname === "/login" ||
      url.pathname === "/signup" ||
      url.pathname === "/forgot-password" ||
      url.pathname === "/onboarding" ||
      url.pathname.startsWith("/api") ||
      url.pathname.startsWith("/erp") ||
      url.pathname.startsWith("/tenant") ||
      url.pathname.startsWith("/quests")
    ) {
      return NextResponse.next();
    }
    // ERP suite subpaths -> rewrite to /erp/*
    if (erpShortcuts.some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))) {
      url.pathname = `/erp${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // 2. DEDICATED TENANT WORKSPACES (e.g. edusuite.ofia.ng / payflow.ofia.ng)
  if (subdomain && subdomain !== "www" && subdomain !== "app" && subdomain !== "admin") {
    const response = NextResponse.next();
    response.headers.set("x-tenant-slug", subdomain);

    // Auth pages stay directly on tenant subdomain
    if (
      url.pathname === "/login" ||
      url.pathname === "/signup" ||
      url.pathname === "/forgot-password" ||
      url.pathname.startsWith("/api") ||
      url.pathname.startsWith("/erp/reset-password")
    ) {
      return response;
    }

    // Root of tenant subdomain -> rewrite to /erp/admin dashboard
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/erp/admin";
      return NextResponse.rewrite(url, { headers: response.headers });
    }

    // If accessing ERP shortcuts directly on tenant subdomain
    if (erpShortcuts.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) {
      url.pathname = `/erp${url.pathname}`;
      return NextResponse.rewrite(url, { headers: response.headers });
    }

    return response;
  }

  // 3. DEFAULT ROOT ACCESS (localhost:3002 / business.ofia.ng)
  if (erpShortcuts.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) {
    url.pathname = `/erp${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
