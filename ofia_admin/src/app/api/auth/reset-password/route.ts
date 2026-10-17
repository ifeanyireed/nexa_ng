import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET_KEY } from "@/lib/jwt-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = (searchParams.get("token") || "").trim();
    const email = (searchParams.get("email") || "").trim().toLowerCase();

    if (!token || !email) {
      return NextResponse.json({ valid: false, error: "Missing parameters" }, { status: 400 });
    }

    const secret = new TextEncoder().encode(JWT_SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);
    if (payload.purpose !== "admin_password_reset" || (payload.email as string)?.toLowerCase() !== email) {
      return NextResponse.json({ valid: false, error: "Invalid reset token" }, { status: 400 });
    }

    return NextResponse.json({ valid: true, email });
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: "Invalid or expired reset link" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, email, newPassword } = body;

    const normalizedToken = (token || "").trim();
    const normalizedEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (newPassword || "").trim();

    if (!normalizedToken || !normalizedEmail || cleanPassword.length < 8) {
      return NextResponse.json(
        { error: "Valid token, email, and password of at least 8 characters are required" },
        { status: 400 }
      );
    }

    const secret = new TextEncoder().encode(JWT_SECRET_KEY);
    const { payload } = await jwtVerify(normalizedToken, secret);
    if (payload.purpose !== "admin_password_reset" || (payload.email as string)?.toLowerCase() !== normalizedEmail) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Operator credentials updated successfully. Please log in with your new password.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Password reset failed: " + (error?.message || "Invalid or expired link") },
      { status: 400 }
    );
  }
}
