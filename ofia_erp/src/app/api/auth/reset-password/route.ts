import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDbPool, ensureTablesExist } from "@/lib/db";
import { sendPlatformPasswordChangedEmail } from "@/lib/email-service";
import { slugToTenantName } from "@/lib/tenant-context";

// GET /api/auth/reset-password?token=...&email=...
// Verifies if the reset token is valid and unexpired
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

    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json(
        { valid: false, error: "Database service unavailable" },
        { status: 503 }
      );
    }

    await ensureTablesExist();

    const result = await pool.query(
      `SELECT id, email, token, tenant_slug, expires_at, used
       FROM password_reset_tokens
       WHERE token = $1 AND LOWER(email) = $2
       LIMIT 1`,
      [token, email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { valid: false, error: "Invalid password reset token" },
        { status: 404 }
      );
    }

    const row = result.rows[0];

    if (row.used) {
      return NextResponse.json(
        { valid: false, error: "This password reset link has already been used" },
        { status: 400 }
      );
    }

    const expiresAt = new Date(row.expires_at).getTime();
    if (Date.now() > expiresAt) {
      return NextResponse.json(
        { valid: false, error: "This password reset link has expired" },
        { status: 410 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: row.email,
      tenantSlug: row.tenant_slug,
    });
  } catch (error: any) {
    console.error("Error verifying reset token:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to verify token: " + (error?.message || "Internal error") },
      { status: 500 }
    );
  }
}

// POST /api/auth/reset-password
// Resets user password upon providing a valid token
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, email, newPassword } = body;

    const normalizedToken = (token || "").trim();
    const normalizedEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (newPassword || "").trim();

    if (!normalizedToken || !normalizedEmail) {
      return NextResponse.json(
        { error: "Token and email are required" },
        { status: 400 }
      );
    }

    if (!cleanPassword || cleanPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
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

    // 1. Verify token validity in database
    const tokenRes = await pool.query(
      `SELECT id, email, token, tenant_slug, expires_at, used
       FROM password_reset_tokens
       WHERE token = $1 AND LOWER(email) = $2
       LIMIT 1`,
      [normalizedToken, normalizedEmail]
    );

    if (tokenRes.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid password reset token" },
        { status: 404 }
      );
    }

    const tokenRow = tokenRes.rows[0];

    if (tokenRow.used) {
      return NextResponse.json(
        { error: "This password reset link has already been used. Please request a new one." },
        { status: 400 }
      );
    }

    if (Date.now() > new Date(tokenRow.expires_at).getTime()) {
      return NextResponse.json(
        { error: "This password reset link has expired. Please request a new one." },
        { status: 410 }
      );
    }

    // 2. Hash the new password with bcrypt
    const hashedPassword = bcrypt.hashSync(cleanPassword, 10);

    // 3. Update the user password in Neon PostgreSQL "User" table
    const updateRes = await pool.query(
      `UPDATE "User"
       SET password = $1,
           "updatedAt" = NOW(),
           updated_at = NOW()
       WHERE LOWER(email) = $2
       RETURNING id, name, email, role, "tenantSlug"`,
      [hashedPassword, normalizedEmail]
    );

    if (updateRes.rows.length === 0) {
      return NextResponse.json(
        { error: "Account could not be found to update password" },
        { status: 404 }
      );
    }

    const updatedUser = updateRes.rows[0];

    // 4. Mark the token as used so it cannot be re-used
    await pool.query(
      `UPDATE password_reset_tokens
       SET used = true
       WHERE id = $1`,
      [tokenRow.id]
    );

    // 5. Dispatch confirmation email using tenant Primary Workspace Domain and Sender Display Name
    const resolvedTenantSlug = updatedUser.tenantSlug || tokenRow.tenant_slug || "default";
    const resolvedTenantName = resolvedTenantSlug && resolvedTenantSlug !== "default"
      ? slugToTenantName(resolvedTenantSlug)
      : "Ofia Platform";

    sendPlatformPasswordChangedEmail({
      recipientEmail: normalizedEmail,
      recipientName: updatedUser.name || normalizedEmail.split("@")[0],
      tenantSlug: resolvedTenantSlug,
      tenantName: resolvedTenantName,
    }).catch((err) => console.warn("Failed to dispatch password changed security alert:", err));

    return NextResponse.json({
      success: true,
      message: "Password has been successfully updated. You may now sign in with your new password.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        tenantSlug: updatedUser.tenantSlug,
      },
    });
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Failed to reset password: " + (error?.message || "Internal error") },
      { status: 500 }
    );
  }
}
