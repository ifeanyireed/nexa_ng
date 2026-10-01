import { NextResponse, type NextRequest } from "next/server";
import { verifySuperAdminJWT, AUTH_COOKIE_NAME } from "./lib/jwt-auth";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Allow public Next.js assets, static files, and icons
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    /\.(svg|png|jpg|jpeg|gif|webp|woff|woff2|css|js|map)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Allow public auth and public ingestion API routes
  if (
    pathname === "/api/auth/login" ||
    (pathname === "/api/crm/contact" && request.method === "POST") ||
    (pathname === "/api/crm/waitlist" && request.method === "POST")
  ) {
    return NextResponse.next();
  }

  // 3. Extract session token from cookie or Authorization header
  const token =
    request.cookies.get(AUTH_COOKIE_NAME)?.value ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  const user = token ? await verifySuperAdminJWT(token) : null;

  // 4. Handle login page visits
  if (pathname === "/login") {
    if (user) {
      const returnUrl = request.nextUrl.searchParams.get("returnUrl") || "/";
      const redirectTarget = returnUrl.startsWith("/") ? returnUrl : "/";
      return NextResponse.redirect(new URL(redirectTarget, request.url));
    }
    return NextResponse.next();
  }

  // 5. Guard all other pages and API routes against unauthenticated access
  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized: Valid SuperAdmin session token required" },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // 6. Role-Based Access Control (RBAC) at the Edge
  // Block mutating operations (POST, PUT, PATCH, DELETE) for VIEWER role on admin API endpoints
  if (user.role === "VIEWER") {
    const isMutatingMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);
    if (pathname.startsWith("/api/") && isMutatingMethod) {
      return NextResponse.json(
        { error: "Forbidden: Viewer role has read-only privileges" },
        { status: 403 }
      );
    }
  }

  // 7. Inject authenticated operator headers for downstream handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-operator-id", user.id);
  requestHeaders.set("x-operator-role", user.role);
  requestHeaders.set("x-operator-email", user.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png).*)",
  ],
};
