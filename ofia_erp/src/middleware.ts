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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
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
    // e.g. reedbreed.localhost:3002
    if (cleanHost.endsWith(".localhost")) {
      const sub = cleanHost.replace(/\.localhost$/, "").split(".")[0];
      if (sub && !RESERVED_SUBDOMAINS.has(sub)) {
        resolvedTenantSlug = sub;
      }
    }
  } else if (cleanHost.endsWith(`.${rootDomain}`) || cleanHost.endsWith(".ofia.ng") || cleanHost.endsWith(".ofia.shop")) {
    // Standard platform subdomain: e.g. funmyclothing.ofia.ng
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
    // Fully custom domain: e.g. portal.brand.com or brand.ng
    isCustom = true;
    resolvedTenantSlug = cleanHost;
  }

  // Fallback to query param if explicitly passed in dev/testing (e.g. ?tenant=reedbreed)
  if (!resolvedTenantSlug) {
    const querySlug =
      request.nextUrl.searchParams.get("tenant") ||
      request.nextUrl.searchParams.get("tenant_slug") ||
      request.nextUrl.searchParams.get("slug");
    if (querySlug) {
      resolvedTenantSlug = querySlug.toLowerCase().trim();
    }
  }

  // 3. Inject multi-tenant context headers for Downstream Server Components and API Routes
  const requestHeaders = new Headers(request.headers);
  if (resolvedTenantSlug) {
    requestHeaders.set("x-tenant-slug", resolvedTenantSlug);
    requestHeaders.set("x-tenant-host", cleanHost);
    if (isCustom) {
      requestHeaders.set("x-tenant-custom-domain", cleanHost);
    }
  }

  // 4. API routes: forward headers directly without URL rewriting
  if (pathname.startsWith("/api/")) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 5. If hitting root "/" on a tenant custom domain or subdomain, redirect to ERP dashboard or login
  if (pathname === "/" || pathname === "") {
    if (resolvedTenantSlug) {
      const erpUrl = request.nextUrl.clone();
      erpUrl.pathname = "/erp/admin";
      return NextResponse.rewrite(erpUrl, {
        request: {
          headers: requestHeaders,
        },
      });
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
