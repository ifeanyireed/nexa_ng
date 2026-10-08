import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDbPool } from "@/lib/db";
import { sendSuperAdminPasswordResetEmail } from "@/lib/email-service";
import { SEEDED_SUPER_ADMINS } from "@/lib/jwt-auth";

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

    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json(
        { error: "Database service unavailable" },
        { status: 503 }
      );
    }

    // Check if user is in DB or in seeded list
    let operatorName = "SuperAdmin Operator";
    const dbRes = await pool.query(
      `SELECT id, name, email FROM "User" WHERE LOWER(email) = $1 LIMIT 1`,
      [normalizedEmail]
    );

    const seededUser = SEEDED_SUPER_ADMINS.find(
      (a) => a.email.toLowerCase() === normalizedEmail
    );

    if (dbRes.rows.length > 0) {
      operatorName = dbRes.rows[0].name || operatorName;
    } else if (seededUser) {
      operatorName = seededUser.name;
    }

    if (dbRes.rows.length > 0 || seededUser) {
      // Invalidate existing unused tokens
      await pool.query(
        `UPDATE password_reset_tokens SET used = true WHERE LOWER(email) = $1 AND used = false`,
        [normalizedEmail]
      );

      const token = crypto.randomBytes(32).toString("hex");
      const tokenId = `prt_admin_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      const expiresInMinutes = 60;
      const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

      await pool.query(
        `INSERT INTO password_reset_tokens (
           id, email, token, tenant_slug, expires_at, used, created_at
         ) VALUES ($1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP)`,
        [tokenId, normalizedEmail, token, "admin_root", expiresAt]
      );

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
