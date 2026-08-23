import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_KEY = process.env.JWT_SECRET || "nexa-jwt-secret-key-production-2026";
const AUTH_COOKIE_NAME = "ofia_superadmin_jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Bypass public static assets and auth API endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET_KEY);
      await jwtVerify(token, secret);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // 2. If visiting /login while already authenticated, redirect to /
  if (pathname === "/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // 3. Protect all other platform routes with the Super Admin login wall
  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
    const loginUrl = new URL(`/login?returnUrl=${returnUrl}`, req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
