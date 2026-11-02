import { NextResponse, type NextRequest } from "next/server";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "admin",
  "superadmin",
  "erp",
  "api",
  "store",
  "storefront",
  "ofia",
  "localhost",
  "127.0.0.1",
]);

/**
 * Determine the canonical home portal route for each ERP role
 */
function getRoleHomeRoute(role?: string): string {
  const normalized = (role || "").toLowerCase().trim();
  switch (normalized) {
    case "admin":
      return "/erp/admin";
    case "md":
      return "/erp/md";
    case "manager":
      return "/erp/manager";
    case "hr":
      return "/erp/hr";
    case "accountant":
      return "/erp/accountant";
    case "marketer":
      return "/erp/marketer";
    case "sales_closer":
      return "/erp/ops/crm";
    case "dispatcher":
      return "/erp/admin/dispatch";
    case "cashier":
      return "/erp/admin/shop/pos";
    case "inventory_officer":
      return "/erp/admin/shop/inventory";
    case "employee":
    default:
      return "/erp/employee";
  }
}

/**
 * Edge Role-Based Access Control (RBAC) validation
 */
function isRouteAllowedForRole(role: string, pathname: string): boolean {
  const normalized = role.toLowerCase().trim();
  if (normalized === "admin") return true; // master administrative privilege

  // Employee self-service portal is accessible to all authenticated staff
  if (pathname.startsWith("/erp/employee")) return true;

  if (normalized === "employee") {
    // General staff without specialized roles are isolated to self-service employee portal
    return false;
  }

  if (normalized === "manager") {
    return pathname.startsWith("/erp/manager") || pathname.startsWith("/erp/employee");
  }

  if (normalized === "md") {
    return (
      pathname.startsWith("/erp/md") ||
      pathname.startsWith("/erp/employee") ||
      pathname.startsWith("/erp/manager") ||
      pathname.startsWith("/erp/accountant") ||
      pathname.startsWith("/erp/hr") ||
      pathname.startsWith("/erp/admin/crm") ||
      pathname.startsWith("/erp/admin/shop")
    );
  }

  if (normalized === "hr") {
    return (
      pathname.startsWith("/erp/hr") ||
      pathname.startsWith("/erp/employee") ||
      pathname.startsWith("/erp/admin/users") ||
      pathname.startsWith("/erp/admin/departments")
    );
  }

  if (normalized === "accountant") {
    return pathname.startsWith("/erp/accountant") || pathname.startsWith("/erp/employee");
  }

  if (normalized === "marketer") {
    return (
      pathname.startsWith("/erp/marketer") ||
      pathname.startsWith("/erp/employee") ||
      pathname.startsWith("/erp/admin/crm") ||
      pathname.startsWith("/erp/admin/ai")
    );
  }

  if (normalized === "sales_closer") {
    return (
      pathname.startsWith("/erp/ops/crm") ||
      pathname.startsWith("/erp/ops/calls") ||
      pathname.startsWith("/ops/crm") ||
      pathname.startsWith("/ops/calls") ||
      pathname.startsWith("/erp/admin/crm") ||
      pathname.startsWith("/erp/employee")
    );
  }

  if (normalized === "dispatcher") {
    return (
      pathname.startsWith("/erp/admin/dispatch") ||
      pathname.startsWith("/erp/admin/mobility") ||
      pathname.startsWith("/erp/ops/dispatch") ||
      pathname.startsWith("/erp/employee")
    );
  }

  if (normalized === "cashier") {
    return pathname.startsWith("/erp/admin/shop/pos") || pathname.startsWith("/erp/employee");
  }

  if (normalized === "inventory_officer") {
    return pathname.startsWith("/erp/admin/shop/inventory") || pathname.startsWith("/erp/employee");
  }

  return false;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const cleanHost = host.split(":")[0].toLowerCase().trim();

  // 1. Bypass Next.js internal files, assets, static extensions, and health endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.(svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|css|js|map|json)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Identify Tenant from Host Header (Subdomain or Custom Domain)
  let resolvedTenantSlug = "";
  let isCustom = false;

  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "ofia.ng").toLowerCase().trim();
  const isLocal = cleanHost.includes("localhost") || cleanHost.includes("127.0.0.1");

  if (isLocal) {
    // e.g. neweratransports.localhost:3002
    if (cleanHost.endsWith(".localhost")) {
      const sub = cleanHost.replace(/\.localhost$/, "").split(".")[0];
      if (sub && !RESERVED_SUBDOMAINS.has(sub)) {
        resolvedTenantSlug = sub;
      }
    }
  } else if (cleanHost.endsWith(`.${rootDomain}`) || cleanHost.endsWith(".ofia.ng") || cleanHost.endsWith(".ofia.shop")) {
    // Standard platform subdomain: e.g. neweratransports.ofia.ng
    const parts = cleanHost.split(".");
    const sub = parts[0];
    if (sub && !RESERVED_SUBDOMAINS.has(sub)) {
      resolvedTenantSlug = sub;
    }
  } else if (
    cleanHost &&
    cleanHost !== "ofia.ng" &&
    cleanHost !== "ofia.shop" &&
    cleanHost !== "localhost" &&
    cleanHost !== "127.0.0.1" &&
    !cleanHost.includes("onrender.com") &&
    !cleanHost.includes("vercel.app")
  ) {
    // Fully custom domain: e.g. erp.neweratransports.com
    isCustom = true;
    resolvedTenantSlug = cleanHost;
  }

  // Fallback to query param if explicitly passed in dev/testing (e.g. ?tenant=neweratransports)
  if (!resolvedTenantSlug) {
    const querySlug =
      request.nextUrl.searchParams.get("tenant") ||
      request.nextUrl.searchParams.get("tenant_slug") ||
      request.nextUrl.searchParams.get("slug");
    if (querySlug) {
      resolvedTenantSlug = querySlug.toLowerCase().trim();
    }
  }

  // 3. Extract Authentication Session & Role Cookies
  const authToken =
    request.cookies.get("nexa_auth_token")?.value ||
    request.cookies.get("ofia_superadmin_jwt")?.value;
  const userRole = request.cookies.get("nexa_user_role")?.value?.toLowerCase().trim() || "";
  const userEmail = request.cookies.get("nexa_user_email")?.value || "";

  // 4. Inject multi-tenant context and identity headers for Downstream Server Components and API Routes
  const requestHeaders = new Headers(request.headers);
  if (resolvedTenantSlug) {
    requestHeaders.set("x-tenant-slug", resolvedTenantSlug);
    requestHeaders.set("x-tenant-host", cleanHost);
    if (isCustom) {
      requestHeaders.set("x-tenant-custom-domain", cleanHost);
    }
  }
  if (authToken) {
    requestHeaders.set("x-user-authenticated", "true");
    if (userRole) requestHeaders.set("x-user-role", userRole);
    if (userEmail) requestHeaders.set("x-user-email", userEmail);
  }

  // 5. API routes: forward headers directly without URL rewriting
  if (pathname.startsWith("/api/")) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 6. Root path "/" routing on tenant workspace vs platform root domain
  if (pathname === "/" || pathname === "") {
    if (resolvedTenantSlug) {
      // On a tenant workspace (e.g. neweratransports.localhost:3002):
      // If NOT authenticated -> Redirect to /login
      if (!authToken) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
      }
      // If AUTHENTICATED -> Redirect to user's assigned role home portal
      const homeRoute = getRoleHomeRoute(userRole);
      return NextResponse.redirect(new URL(homeRoute, request.url));
    }

    // On platform root marketing domain (erp.ofia.ng or root localhost): allow public marketing page
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 7. Login page handling
  if (pathname === "/login") {
    // If user is already authenticated with a valid token, redirect directly to their role home portal
    if (authToken) {
      const homeRoute = getRoleHomeRoute(userRole);
      return NextResponse.redirect(new URL(homeRoute, request.url));
    }
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 8. Explicit "/erp" root path
  if (pathname === "/erp" || pathname === "/erp/") {
    if (!authToken) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    const homeRoute = getRoleHomeRoute(userRole);
    return NextResponse.redirect(new URL(homeRoute, request.url));
  }

  // 9. Protected ERP, Tenant & Operations Routes (/erp/*, /tenant/*, /ops/*)
  if (
    pathname.startsWith("/erp/") ||
    pathname.startsWith("/tenant") ||
    pathname.startsWith("/ops/")
  ) {
    // Unauthenticated access guard: redirect directly to login with returnUrl
    if (!authToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnUrl", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    // Role-Based Access Control (RBAC) enforcement at the edge
    if (userRole && !isRouteAllowedForRole(userRole, pathname)) {
      const homeRoute = getRoleHomeRoute(userRole);
      return NextResponse.redirect(new URL(homeRoute, request.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

