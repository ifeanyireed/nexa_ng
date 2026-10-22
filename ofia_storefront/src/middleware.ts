import { NextResponse, type NextRequest } from "next/server";
import {
  resolveTenantFromHostAndQuery,
  resolveTenantVertical,
  isGlobalStorefrontRoute,
} from "./lib/storefront-tenant";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // 1. Bypass Next.js static files, public assets, and common icons
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/ofia-logo.png" ||
    pathname === "/ofia-admin-logo.png" ||
    pathname === "/logo.png" ||
    pathname === "/logo-icon.svg" ||
    /\.(svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|css|js|map|json)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Resolve tenant identity from query (?tenant= / ?store= / ?slug=), subdomain (*.ofia.ng / *.localhost), or custom domain
  const queryTenant =
    request.nextUrl.searchParams.get("tenant") ||
    request.nextUrl.searchParams.get("store") ||
    request.nextUrl.searchParams.get("slug");
  const cookieTenant = request.cookies.get("ofia_tenant_slug")?.value;
  const cookieVertical = request.cookies.get("ofia_tenant_vertical")?.value;

  const { tenantSlug, source, domain, subdomain } = resolveTenantFromHostAndQuery(
    host,
    queryTenant,
    cookieTenant
  );

  // 3. If no tenant is resolved, serve platform landing page and public templates directory
  if (!tenantSlug) {
    return NextResponse.next();
  }

  // 4. Resolve the tenant's vertical archetype (e.g. cars, gadgets, pharmacy, fashion)
  const vertical = resolveTenantVertical(tenantSlug, cookieVertical);

  // 5. Inject multi-tenant context headers for server components, SSR layouts, and API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-slug", tenantSlug);
  requestHeaders.set("x-tenant-vertical", vertical);
  requestHeaders.set("x-tenant-source", source || "unknown");
  if (domain) requestHeaders.set("x-tenant-domain", domain);
  if (subdomain) requestHeaders.set("x-tenant-subdomain", subdomain);

  // 6. API routes: Inject tenant headers and pass through without route rewriting
  if (pathname.startsWith("/api/")) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 7. Prepare rewritten URL preserving query parameters and tenant identity
  const rewriteUrl = request.nextUrl.clone();
  if (!rewriteUrl.searchParams.has("tenant")) {
    rewriteUrl.searchParams.set("tenant", tenantSlug);
  }

  // Case A: Root path "/" on a tenant subdomain, custom domain, or ?tenant= URL
  // Rewrites internally to the merchant's provisioned vertical (e.g. /cars or /pharmacy)
  // while keeping the browser address bar cleanly at "/" (e.g. https://neweratransports.ofia.ng/)
  if (pathname === "/" || pathname === "") {
    rewriteUrl.pathname = `/${vertical}`;
    const response = NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: requestHeaders,
      },
    });

    // Set cookies for fast edge resolution on subsequent navigations
    response.cookies.set("ofia_tenant_slug", tenantSlug, {
      path: "/",
      maxAge: 2592000,
      sameSite: "lax",
    });
    response.cookies.set("ofia_tenant_vertical", vertical, {
      path: "/",
      maxAge: 2592000,
      sameSite: "lax",
    });
    return response;
  }

  // Case B: Global commerce routes (e.g. /checkout, /order-confirmed, /order-tracking, /search, /templates)
  // or vertical paths already matching standard taxonomy (e.g. /cars/listings, /pharmacy/prescription)
  if (isGlobalStorefrontRoute(pathname)) {
    const response = NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: requestHeaders,
      },
    });
    response.cookies.set("ofia_tenant_slug", tenantSlug, {
      path: "/",
      maxAge: 2592000,
      sameSite: "lax",
    });
    response.cookies.set("ofia_tenant_vertical", vertical, {
      path: "/",
      maxAge: 2592000,
      sameSite: "lax",
    });
    return response;
  }

  // Case C: Vertical-relative shorthand sub-routes (e.g. /listings -> /cars/listings, /catalog -> /gadgets/catalog)
  // Provides clean, vanity URLs for tenants hosted on their own subdomains or custom domains
  rewriteUrl.pathname = `/${vertical}${pathname}`;
  const response = NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });
  response.cookies.set("ofia_tenant_slug", tenantSlug, {
    path: "/",
    maxAge: 2592000,
    sameSite: "lax",
  });
  response.cookies.set("ofia_tenant_vertical", vertical, {
    path: "/",
    maxAge: 2592000,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static asset extensions (.svg, .png, .jpg, .jpeg, .gif, .webp, .woff, .woff2, .css, .js)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|css|js|map)$).*)",
  ],
};
