import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "https://ofia-erp-service.onrender.com";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, email, password, tenantSlug } = body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    const targetUserId = (userId || "").trim();
    const effectiveTenantSlug = (
      tenantSlug ||
      request.headers.get("x-tenant-slug") ||
      ""
    ).trim();

    if (!normalizedEmail && !targetUserId) {
      return NextResponse.json(
        { error: "Either user email or user ID must be provided" },
        { status: 400 }
      );
    }

    const newPassword = (password || "12345678").trim();
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    const res = await fetch(`${ERP_BASE}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": effectiveTenantSlug,
      },
      body: JSON.stringify({
        id: targetUserId,
        email: normalizedEmail,
        password: hashedPassword,
        tenantSlug: effectiveTenantSlug,
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to reset password in ERP microservice" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully.",
      user: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "ERP microservice error: " + (error?.message || "Internal failure") },
      { status: 502 }
    );
  }
}
