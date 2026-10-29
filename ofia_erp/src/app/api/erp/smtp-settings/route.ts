import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

async function ensureSmtpSettingsTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS tenant_smtp_settings (
      tenant_slug VARCHAR(191) PRIMARY KEY,
      tenant_id VARCHAR(191) DEFAULT '',
      provider VARCHAR(50) DEFAULT 'custom',
      host VARCHAR(191),
      port INT DEFAULT 587,
      encryption VARCHAR(20) DEFAULT 'tls',
      from_email VARCHAR(191),
      from_name VARCHAR(191),
      username VARCHAR(191),
      password TEXT,
      rate_limited_until TIMESTAMPTZ,
      rate_limit_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`ALTER TABLE tenant_smtp_settings ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';`;
}

export async function GET(request: NextRequest) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureSmtpSettingsTable(sql);

    const rows = await sql`
      SELECT tenant_slug, provider, host, port, encryption, from_email, from_name, username, password, rate_limited_until, rate_limit_reason
      FROM tenant_smtp_settings
      WHERE LOWER(tenant_slug) = ${tenantSlug}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ success: true, settings: null });
    }

    const row = rows[0];
    const isRateLimited = Boolean(
      row.rate_limited_until && new Date(row.rate_limited_until).getTime() > Date.now()
    );

    return NextResponse.json({
      success: true,
      settings: {
        tenantSlug: row.tenant_slug,
        provider: row.provider || "custom",
        host: row.host || "",
        port: Number(row.port) || 587,
        encryption: row.encryption || "tls",
        fromEmail: row.from_email || "",
        fromName: row.from_name || "",
        username: row.username || "",
        hasPassword: Boolean(row.password && row.password.length > 0),
        rateLimitedUntil: row.rate_limited_until ? new Date(row.rate_limited_until).toISOString() : null,
        rateLimitReason: row.rate_limit_reason || null,
        isRateLimited,
      },
    });
  } catch (err: any) {
    console.error("[SMTP Settings GET] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch SMTP settings: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    const body = JSON.parse(bodyText || "{}");
    const tenantSlug = getValidatedTenantSlug(request, body);

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureSmtpSettingsTable(sql);

    const provider = (body.provider || "custom").trim();
    const host = (body.host || "").trim();
    const port = Number(body.port) || 587;
    const encryption = (body.encryption || "tls").trim();
    const fromEmail = (body.fromEmail || body.from_email || "").trim().toLowerCase();
    const fromName = (body.fromName || body.from_name || "").trim();
    const username = (body.username || "").trim();
    const password = body.password ? String(body.password) : "";

    // If password is not provided or is masked, preserve existing password
    const existing = await sql`
      SELECT password FROM tenant_smtp_settings
      WHERE LOWER(tenant_slug) = ${tenantSlug}
      LIMIT 1;
    `;

    const effectivePassword = password && password !== "••••••••" ? password : (existing[0]?.password || "");

    await sql`
      INSERT INTO tenant_smtp_settings (
        tenant_slug, tenant_id, provider, host, port, encryption, from_email, from_name, username, password, updated_at
      ) VALUES (
        ${tenantSlug}, '', ${provider}, ${host}, ${port}, ${encryption}, ${fromEmail}, ${fromName}, ${username}, ${effectivePassword}, NOW()
      )
      ON CONFLICT (tenant_slug) DO UPDATE
      SET provider = EXCLUDED.provider,
          host = EXCLUDED.host,
          port = EXCLUDED.port,
          encryption = EXCLUDED.encryption,
          from_email = EXCLUDED.from_email,
          from_name = EXCLUDED.from_name,
          username = EXCLUDED.username,
          password = EXCLUDED.password,
          updated_at = NOW();
    `;

    return NextResponse.json({
      success: true,
      settings: {
        tenantSlug,
        provider,
        host,
        port,
        encryption,
        fromEmail,
        fromName,
        username,
        hasPassword: Boolean(effectivePassword && effectivePassword.length > 0),
      },
    });
  } catch (err: any) {
    console.error("[SMTP Settings POST] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save SMTP settings: " + err.message },
      { status: 500 }
    );
  }
}
