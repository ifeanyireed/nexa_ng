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
 * Determine the canonical home portal route for each ERP role or assigned page
 */
function getRoleHomeRoute(role?: string, assignedPages: string[] = []): string {
  const normalized = (role || "").toLowerCase().trim();

  // If specific pages are assigned, determine primary dashboard from assigned pages
  if (assignedPages && assignedPages.length > 0 && !assignedPages.includes("employee")) {
    if (assignedPages.includes("sales_closer")) return "/erp/ops/crm";
    if (assignedPages.includes("crm")) return "/erp/admin/crm";
    if (assignedPages.includes("shop")) return "/erp/admin/shop";
    if (assignedPages.includes("dispatch") || assignedPages.includes("dispatch_ops") || assignedPages.includes("dispatcher")) return "/erp/admin/dispatch";
    if (assignedPages.includes("accounting") || assignedPages.includes("finance")) return "/erp/accountant";
    if (assignedPages.includes("hr")) return "/erp/hr";
    if (assignedPages.includes("users")) return "/erp/admin/users";
    if (assignedPages.includes("mobility")) return "/erp/admin/mobility";
    if (assignedPages.includes("marketplace")) return "/erp/admin/marketplace";
    if (assignedPages.includes("ai")) return "/erp/admin/ai";
    if (assignedPages.includes("overview")) return "/erp/admin";
  }

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
 * Edge check: If a page is assigned to the user, they automatically have the right to navigate.
 */
function isRouteAllowedByAssignedPages(assignedPages: string[], pathname: string): boolean {
  if (!assignedPages || assignedPages.length === 0) return false;

  for (const page of assignedPages) {
    const p = (page || "").toLowerCase().trim();
    if (!p) continue;

    // Overview / Master Admin Command Center
    if ((p === "overview" || p === "admin") && (pathname === "/erp/admin" || pathname === "/erp/admin/")) return true;

    // Shop, Retail POS, Inventory IMS, Referrals
    if (p === "shop" && pathname.startsWith("/erp/admin/shop")) return true;

    // CRM, Marketing, Leads, Deals, Outreach
    if (p === "crm" && (
      pathname.startsWith("/erp/admin/crm") ||
      pathname.startsWith("/erp/marketer") ||
      pathname.startsWith("/erp/ops/crm") ||
      pathname.startsWith("/erp/ops/calls") ||
      pathname.startsWith("/ops/crm") ||
      pathname.startsWith("/ops/calls")
    )) return true;

    // Sales Closer Portal
    if (p === "sales_closer" && (
      pathname.startsWith("/erp/ops/crm") ||
      pathname.startsWith("/erp/ops/calls") ||
      pathname.startsWith("/ops/crm") ||
      pathname.startsWith("/ops/calls") ||
      pathname.startsWith("/erp/admin/crm")
    )) return true;

    // Dispatch & Fleet Logistics
    if ((p === "dispatch" || p === "dispatch_ops" || p === "dispatcher") && (
      pathname.startsWith("/erp/admin/dispatch") ||
      pathname.startsWith("/erp/ops/dispatch")
    )) return true;

    // Mobility
    if (p === "mobility" && pathname.startsWith("/erp/admin/mobility")) return true;

    // Marketplace
    if (p === "marketplace" && pathname.startsWith("/erp/admin/marketplace")) return true;

    // AI Swarm
    if (p === "ai" && pathname.startsWith("/erp/admin/ai")) return true;

    // Accounting & Ledgers
    if ((p === "accounting" || p === "finance") && (
      pathname.startsWith("/erp/accountant") ||
      pathname.startsWith("/accountant")
    )) return true;

    // HR & Appraisals
    if (p === "hr" && (
      pathname.startsWith("/erp/hr") ||
      pathname.startsWith("/hr")
    )) return true;

    // Users & Departments
    if ((p === "users" || p === "departments") && (
      pathname.startsWith("/erp/admin/users") ||
      pathname.startsWith("/erp/admin/departments")
    )) return true;

    // Manager Portal
    if (p === "manager" && (
      pathname.startsWith("/erp/manager") ||
      pathname.startsWith("/manager")
    )) return true;

    // MD Executive Portal
    if (p === "md" && (
      pathname.startsWith("/erp/md") ||
      pathname.startsWith("/md")
    )) return true;

    // Employee Portal
    if (p === "employee" && (
      pathname.startsWith("/erp/employee") ||
      pathname.startsWith("/employee")
    )) return true;
  }

  return false;
}

/**
 * Edge Role-Based Access Control (RBAC) validation
 */
function isRouteAllowedForRole(role: string, pathname: string, assignedPages: string[] = []): boolean {
  const normalized = role.toLowerCase().trim();
  if (normalized === "admin") return true; // master administrative privilege

  // Employee self-service portal is accessible to all authenticated staff
  if (pathname.startsWith("/erp/employee")) return true;

  // DIRECT PAGE ASSIGNMENT: If a page is assigned, they automatically have the right to navigate!
  if (isRouteAllowedByAssignedPages(assignedPages, pathname)) {
    return true;
  }

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

  // Extract assigned pages from cookie if present
  const rawAssignedPages = request.cookies.get("nexa_assigned_pages")?.value;
  let userAssignedPages: string[] = [];
  if (rawAssignedPages) {
    try {
      const decoded = decodeURIComponent(rawAssignedPages);
      if (decoded.startsWith("[") && decoded.endsWith("]")) {
        const parsed = JSON.parse(decoded);
        if (Array.isArray(parsed)) userAssignedPages = parsed;
      } else {
        userAssignedPages = decoded.split(",").map((s) => s.trim()).filter(Boolean);
      }
    } catch {
      userAssignedPages = rawAssignedPages.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

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
    if (userAssignedPages.length > 0) {
      requestHeaders.set("x-user-assigned-pages", userAssignedPages.join(","));
    }
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
      const homeRoute = getRoleHomeRoute(userRole, userAssignedPages);
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
      const homeRoute = getRoleHomeRoute(userRole, userAssignedPages);
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
    const homeRoute = getRoleHomeRoute(userRole, userAssignedPages);
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

    // DIRECT PAGE ASSIGNMENT: If a page is assigned, they automatically have the right to navigate!
    if (userAssignedPages.length > 0 && isRouteAllowedByAssignedPages(userAssignedPages, pathname)) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Role-Based Access Control (RBAC) enforcement at the edge
    if (userRole && !isRouteAllowedForRole(userRole, pathname, userAssignedPages)) {
      // If user's role is "employee" and no assigned pages cookie is recorded yet,
      // allow request through to client-side RoleGuard/ErpAdminShell which checks DB and localStorage
      if (userRole === "employee" && userAssignedPages.length === 0) {
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }

      const homeRoute = getRoleHomeRoute(userRole, userAssignedPages);
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

