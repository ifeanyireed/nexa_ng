import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "https://ofia-erp-service.onrender.com";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = (searchParams.get("token") || "").trim();
    const email = (searchParams.get("email") || "").trim().toLowerCase();

    if (!token || !email) {
      return NextResponse.json(
        { valid: false, error: "Missing required token or email parameters" },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true, email });
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, error: error?.message || "Verification failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, email, newPassword, password } = body;

    const normalizedToken = (token || "").trim();
    const normalizedEmail = (email || "").trim().toLowerCase();
    const targetPassword = (newPassword || password || "").trim();

    if (!normalizedToken || !normalizedEmail || !targetPassword) {
      return NextResponse.json(
        { error: "Token, email, and new password are required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${ERP_BASE}/update-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        token: normalizedToken,
        new_password: targetPassword,
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to update password" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now log in.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "ERP microservice error: " + (error?.message || "Internal failure") },
      { status: 502 }
    );
  }
}
