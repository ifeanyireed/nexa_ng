import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDbPool, ensureTablesExist } from "@/lib/db";
import { sendPlatformPasswordResetEmail } from "@/lib/email-service";
import { slugToTenantName } from "@/lib/tenant-context";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, tenantSlug } = body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    const effectiveTenantSlug = (tenantSlug || request.headers.get("x-tenant-slug") || "").trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required" },
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

    await ensureTablesExist();

    // 1. Verify if user exists in the database
    let userQuery = `SELECT id, name, email, "tenantSlug" FROM "User" WHERE LOWER(email) = $1`;
    let queryParams: any[] = [normalizedEmail];

    if (effectiveTenantSlug && effectiveTenantSlug !== "default") {
      userQuery += ` AND (LOWER("tenantSlug") = $2 OR "tenantSlug" IS NULL)`;
      queryParams.push(effectiveTenantSlug);
    }

    const userRes = await pool.query(userQuery, queryParams);
    const userFound = userRes.rows.length > 0 ? userRes.rows[0] : null;

    // To prevent account enumeration attacks, always respond with a success message.
    // If the account exists, generate token and dispatch the email.
    if (userFound) {
      // 2. Invalidate any existing unused tokens for this email
      await pool.query(
        `UPDATE password_reset_tokens SET used = true WHERE LOWER(email) = $1 AND used = false`,
        [normalizedEmail]
      );

      // 3. Generate a secure, 64-character random token
      const token = crypto.randomBytes(32).toString("hex");
      const tokenId = `prt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      const expiresInMinutes = 60;
      const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

      const resolvedTenantSlug = userFound.tenantSlug || effectiveTenantSlug || "default";

      await pool.query(
        `INSERT INTO password_reset_tokens (
           id, email, token, tenant_slug, expires_at, used, created_at
         ) VALUES ($1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP)`,
        [tokenId, normalizedEmail, token, resolvedTenantSlug, expiresAt]
      );

      // 4. Construct reset link based on request host and origin
      const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "app.ofia.ng";
      const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
      const origin = `${proto}://${host}`;

      const resetUrl = `${origin}/erp/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(normalizedEmail)}`;

      const resolvedTenantName = resolvedTenantSlug && resolvedTenantSlug !== "default"
        ? slugToTenantName(resolvedTenantSlug)
        : "Ofia ERP";

      // 5. Dispatch email via platform email utility
      const emailResult = await sendPlatformPasswordResetEmail({
        recipientEmail: normalizedEmail,
        recipientName: userFound.name || normalizedEmail.split("@")[0],
        resetUrl,
        tenantSlug: resolvedTenantSlug,
        tenantName: resolvedTenantName,
        expiresInMinutes,
      });

      if (!emailResult.success) {
        console.warn("⚠️ Platform password reset email warning:", emailResult.error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "If an account matching that email address exists, a password reset link has been dispatched to your inbox.",
    });
  } catch (error: any) {
    console.error("Error in forgot-password endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error?.message || "Failed to process request") },
      { status: 500 }
    );
  }
}
