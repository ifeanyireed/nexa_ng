import { NextRequest, NextResponse } from "next/server";
import { testSmtpSettings, SmtpSettings } from "@/lib/email-service";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantSlug = getValidatedTenantSlug(request, body);
    const testEmail = (body.testEmail || "").trim();

    if (!testEmail || !testEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid recipient test email is required" },
        { status: 400 }
      );
    }

    let config: SmtpSettings;

    if (body.host && (body.fromEmail || body.from_email)) {
      let resolvedPassword = body.password || "";
      if ((!resolvedPassword || resolvedPassword === "••••••••") && tenantSlug) {
        try {
          const sql = await getTenantSql(tenantSlug);
          const rows = await sql`
            SELECT password FROM tenant_smtp_settings
            WHERE LOWER(tenant_slug) = ${tenantSlug}
            LIMIT 1;
          `;
          if (rows.length > 0 && rows[0].password) {
            resolvedPassword = rows[0].password;
          }
        } catch {}
      }

      config = {
        tenantSlug: tenantSlug || "default",
        provider: body.provider || "custom",
        host: body.host.trim(),
        port: Number(body.port) || 587,
        encryption: body.encryption || "tls",
        fromEmail: (body.fromEmail || body.from_email || "").trim(),
        fromName: body.fromName ? body.fromName.trim() : "Workspace Admin",
        username: body.username ? body.username.trim() : (body.fromEmail || body.from_email || "").trim(),
        password: resolvedPassword,
      };
    } else if (tenantSlug) {
      const sql = await getTenantSql(tenantSlug);
      const rows = await sql`
        SELECT provider, host, port, encryption, from_email, from_name, username, password
        FROM tenant_smtp_settings
        WHERE LOWER(tenant_slug) = ${tenantSlug}
        LIMIT 1;
      `;

      if (rows.length === 0 || !rows[0].host) {
        return NextResponse.json(
          { success: false, error: "No SMTP settings found for this tenant. Please configure host and credentials first." },
          { status: 400 }
        );
      }

      const row = rows[0];
      config = {
        tenantSlug,
        provider: row.provider || "custom",
        host: row.host || "",
        port: Number(row.port) || 587,
        encryption: row.encryption || "tls",
        fromEmail: row.from_email || "",
        fromName: row.from_name || "Workspace Admin",
        username: row.username || "",
        password: row.password || "",
      };
    } else {
      return NextResponse.json(
        { success: false, error: "Tenant context or explicit SMTP host is required." },
        { status: 400 }
      );
    }

    if (!config.host || !config.fromEmail) {
      return NextResponse.json(
        { success: false, error: "Incomplete SMTP configuration. Host and sender email are required." },
        { status: 400 }
      );
    }

    if (!config.password) {
      return NextResponse.json(
        { success: false, error: "SMTP password is missing or unconfigured for this relay." },
        { status: 400 }
      );
    }

    const result = await testSmtpSettings(config, testEmail);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message || "Test email dispatched successfully. SMTP credentials verified.",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message || "SMTP server rejected the authentication or relay request.",
        },
        { status: 422 }
      );
    }
  } catch (err: any) {
    console.error("[SMTP Test POST] Error:", err);
    return NextResponse.json(
      { success: false, error: "SMTP testing encountered an internal exception: " + err.message },
      { status: 500 }
    );
  }
}
