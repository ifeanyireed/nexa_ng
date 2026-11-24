import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import {
  resolveTenantSlugFromRequest,
  ensurePasswordResetTokensTable,
  syncUserPasswordAcrossTenantAndAuth,
} from "@/lib/auth-password-sync";
import { sendPlatformPasswordChangedEmail } from "@/lib/email-service";
import { slugToTenantName } from "@/lib/tenant-utils";

export const dynamic = "force-dynamic";

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

    const tenantSlug = resolveTenantSlugFromRequest(request);
    if (!tenantSlug) {
      return NextResponse.json(
        { valid: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const tenantSql = await getTenantSql(tenantSlug);
    await ensurePasswordResetTokensTable(tenantSql);

    const rows = await tenantSql`
      SELECT id, email, token, tenant_slug, expires_at, used
      FROM password_reset_tokens
      WHERE token = ${token}
        AND LOWER(email) = ${email}
        AND (LOWER(tenant_slug) = ${tenantSlug} OR tenant_slug = '')
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { valid: false, error: "This password reset link is invalid." },
        { status: 404 }
      );
    }

    const row = rows[0];
    if (row.used) {
      return NextResponse.json(
        { valid: false, error: "This password reset link has already been used. Please request a new one." },
        { status: 400 }
      );
    }

    if (Date.now() > new Date(row.expires_at).getTime()) {
      return NextResponse.json(
        { valid: false, error: "This password reset link has expired. Please request a new one." },
        { status: 410 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: row.email,
      tenantSlug: row.tenant_slug || tenantSlug,
    });
  } catch (error: any) {
    console.error("[Reset Password GET] Error verifying token:", error);
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

    const normalizedToken = String(token || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const targetPassword = String(newPassword || password || "").trim();

    if (!normalizedToken || !normalizedEmail || !targetPassword) {
      return NextResponse.json(
        { error: "Token, email, and new password are required" },
        { status: 400 }
      );
    }

    if (targetPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const tenantSlug = resolveTenantSlugFromRequest(request, body);
    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const tenantSql = await getTenantSql(tenantSlug);
    await ensurePasswordResetTokensTable(tenantSql);

    // 1. Validate reset token against tenant's dedicated DB
    const tokenRows = await tenantSql`
      SELECT id, email, token, tenant_slug, expires_at, used
      FROM password_reset_tokens
      WHERE token = ${normalizedToken}
        AND LOWER(email) = ${normalizedEmail}
        AND (LOWER(tenant_slug) = ${tenantSlug} OR tenant_slug = '')
      LIMIT 1;
    `;

    if (!tokenRows || tokenRows.length === 0) {
      return NextResponse.json(
        { error: "Invalid password reset link. Please request a new one." },
        { status: 404 }
      );
    }

    const tokenRow = tokenRows[0];
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

    // 2. Hash new password with bcrypt (cost 10)
    const hashedPassword = await bcrypt.hash(targetPassword, 10);

    // 3. Synchronize password hash across tenant's dedicated DB AND central auth DB (USERS_DATABASE_URL)
    const syncResult = await syncUserPasswordAcrossTenantAndAuth({
      tenantSlug,
      email: normalizedEmail,
      hashedPassword,
    });

    if (!syncResult.tenantDbUpdated && !syncResult.usersDbUpdated) {
      return NextResponse.json(
        { error: "Account could not be found to update password" },
        { status: 404 }
      );
    }

    // 4. Mark token as used so it cannot be replayed
    await tenantSql`
      UPDATE password_reset_tokens
      SET used = TRUE
      WHERE id = ${tokenRow.id}
        AND LOWER(tenant_slug) = ${tenantSlug};
    `;

    // 5. Dispatch non-blocking password changed security notification
    const tenantName = slugToTenantName(tenantSlug);
    sendPlatformPasswordChangedEmail({
      recipientEmail: normalizedEmail,
      recipientName: syncResult.user?.name || normalizedEmail.split("@")[0],
      tenantSlug,
      tenantName,
    }).catch((err) =>
      console.warn("[Reset Password] Failed to dispatch password changed security alert:", err)
    );

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now log in.",
    });
  } catch (error: any) {
    console.error("[Reset Password POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to update password: " + (error?.message || "Internal error") },
      { status: 500 }
    );
  }
}
