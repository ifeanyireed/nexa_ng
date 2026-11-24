import { NextResponse } from "next/server";
import crypto from "crypto";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import {
  resolveTenantSlugFromRequest,
  ensurePasswordResetTokensTable,
  findTenantUserForPasswordReset,
} from "@/lib/auth-password-sync";
import { sendPlatformPasswordResetEmail } from "@/lib/email-service";
import { slugToTenantName } from "@/lib/tenant-utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const normalizedEmail = String(body?.email || "").trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required" },
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

    const userFound = await findTenantUserForPasswordReset(tenantSlug, normalizedEmail);

    // Prevent account enumeration: only create token and send email if account exists for this tenant
    if (userFound) {
      const tenantSql = await getTenantSql(tenantSlug);
      await ensurePasswordResetTokensTable(tenantSql);

      // Invalidate any previous unused tokens for this email within this tenant
      await tenantSql`
        UPDATE password_reset_tokens
        SET used = TRUE
        WHERE LOWER(email) = ${normalizedEmail}
          AND LOWER(tenant_slug) = ${tenantSlug}
          AND used = FALSE;
      `;

      // Generate secure 64-character single-use reset token with 60-minute expiry
      const token = crypto.randomBytes(32).toString("hex");
      const tokenId = `prt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      const expiresInMinutes = 60;
      const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

      await tenantSql`
        INSERT INTO password_reset_tokens (
          id, email, token, tenant_slug, tenant_id, expires_at, used, created_at
        ) VALUES (
          ${tokenId}, ${normalizedEmail}, ${token}, ${tenantSlug}, '', ${expiresAt}, FALSE, NOW()
        );
      `;

      // Construct origin from forwarded headers / host
      const rawHost =
        request.headers.get("x-forwarded-host") ||
        request.headers.get("host") ||
        "";
      const cleanHost = rawHost.trim();
      const proto =
        request.headers.get("x-forwarded-proto") ||
        (cleanHost.includes("localhost") || cleanHost.includes("127.0.0.1")
          ? "http"
          : "https");
      const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "ofia.ng").trim();
      const origin = cleanHost
        ? `${proto}://${cleanHost}`
        : `https://${tenantSlug}.${rootDomain}`;

      const hostHasTenantSubdomain = cleanHost
        .toLowerCase()
        .startsWith(`${tenantSlug}.`);
      const tenantQuery = hostHasTenantSubdomain
        ? ""
        : `&tenant=${encodeURIComponent(tenantSlug)}`;
      const resetUrl = `${origin}/erp/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(normalizedEmail)}${tenantQuery}`;

      const tenantName = slugToTenantName(tenantSlug);

      const emailResult = await sendPlatformPasswordResetEmail({
        recipientEmail: normalizedEmail,
        recipientName: userFound.name || normalizedEmail.split("@")[0],
        resetUrl,
        tenantSlug,
        tenantName,
        expiresInMinutes,
      });

      if (!emailResult.success) {
        console.error(
          `[Forgot Password] Failed to dispatch reset email for '${normalizedEmail}' (tenant: ${tenantSlug}):`,
          emailResult.error
        );
        return NextResponse.json(
          { error: emailResult.error || "Failed to dispatch password recovery email" },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "If an account matches that email, a password recovery link has been dispatched.",
    });
  } catch (error: any) {
    console.error("[Forgot Password] Error:", error);
    return NextResponse.json(
      { error: "Failed to process password recovery request: " + (error?.message || "Internal error") },
      { status: 500 }
    );
  }
}
