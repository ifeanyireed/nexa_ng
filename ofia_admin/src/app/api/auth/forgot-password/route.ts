import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { sendSuperAdminPasswordResetEmail } from "@/lib/email-service";
import { SEEDED_SUPER_ADMINS, JWT_SECRET_KEY } from "@/lib/jwt-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid operator email address is required" },
        { status: 400 }
      );
    }

    const seededUser = SEEDED_SUPER_ADMINS.find(
      (a) => a.email.toLowerCase() === normalizedEmail
    );
    const operatorName = seededUser ? seededUser.name : "SuperAdmin Operator";

    if (seededUser) {
      const expiresInMinutes = 60;
      const secret = new TextEncoder().encode(JWT_SECRET_KEY);
      const token = await new SignJWT({
        email: normalizedEmail,
        purpose: "admin_password_reset",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(secret);

      const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "admin.ofia.ng";
      const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
      const origin = `${proto}://${host}`;

      const resetUrl = `${origin}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(normalizedEmail)}`;

      const emailResult = await sendSuperAdminPasswordResetEmail({
        recipientEmail: normalizedEmail,
        recipientName: operatorName,
        resetUrl,
        expiresInMinutes,
      });

      if (!emailResult.success) {
        console.warn("⚠️ SuperAdmin reset email warning:", emailResult.error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "If an authorized operator account matches that email, a password recovery link has been dispatched.",
    });
  } catch (error: any) {
    console.error("Error in superadmin forgot-password:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error?.message || "Failed to process request") },
      { status: 500 }
    );
  }
}
