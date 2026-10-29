import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

async function ensureSenderProfilesTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS tenant_sender_profiles (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      profile_name VARCHAR(191) NOT NULL,
      provider VARCHAR(50) DEFAULT 'custom',
      host VARCHAR(191) NOT NULL,
      port INT DEFAULT 587,
      encryption VARCHAR(20) DEFAULT 'tls',
      from_email VARCHAR(191) NOT NULL,
      from_name VARCHAR(191) NOT NULL,
      username VARCHAR(191) NOT NULL,
      password TEXT DEFAULT '',
      is_default BOOLEAN DEFAULT FALSE,
      rate_limited_until TIMESTAMPTZ,
      rate_limit_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`ALTER TABLE tenant_sender_profiles ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE tenant_sender_profiles ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tenant_sender_profiles_slug ON tenant_sender_profiles (LOWER(tenant_slug));`;

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
    await ensureSenderProfilesTable(sql);

    const [profRows, smtpRows] = await Promise.all([
      sql`
        SELECT id, tenant_slug, profile_name, provider, host, port, encryption, from_email, from_name, username, password, is_default, rate_limited_until, rate_limit_reason, created_at, updated_at
        FROM tenant_sender_profiles
        WHERE LOWER(tenant_slug) = ${tenantSlug}
        ORDER BY is_default DESC, created_at ASC;
      `,
      sql`
        SELECT tenant_slug, provider, host, port, encryption, from_email, from_name, username, password
        FROM tenant_smtp_settings
        WHERE LOWER(tenant_slug) = ${tenantSlug}
        LIMIT 1;
      `,
    ]);

    const profiles = profRows.map((row: any) => {
      const isRateLimited = Boolean(
        row.rate_limited_until && new Date(row.rate_limited_until).getTime() > Date.now()
      );
      return {
        id: row.id,
        tenantSlug: row.tenant_slug,
        profileName: row.profile_name,
        provider: row.provider || "custom",
        host: row.host || "",
        port: Number(row.port) || 587,
        encryption: row.encryption || "tls",
        fromEmail: row.from_email || "",
        fromName: row.from_name || "",
        username: row.username || "",
        hasPassword: Boolean(row.password && row.password.length > 0),
        isDefault: Boolean(row.is_default),
        rateLimitedUntil: row.rate_limited_until ? new Date(row.rate_limited_until).toISOString() : null,
        rateLimitReason: row.rate_limit_reason || null,
        isRateLimited,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
      };
    });

    let defaultSmtp: any = null;
    if (smtpRows.length > 0) {
      const s = smtpRows[0];
      defaultSmtp = {
        tenantSlug: s.tenant_slug,
        provider: s.provider || "custom",
        host: s.host || "",
        port: Number(s.port) || 587,
        encryption: s.encryption || "tls",
        fromEmail: s.from_email || "",
        fromName: s.from_name || "",
        username: s.username || "",
        hasPassword: Boolean(s.password && s.password.length > 0),
      };
    }

    return NextResponse.json({
      success: true,
      profiles,
      defaultSmtp,
    });
  } catch (err: any) {
    console.error("[Sender Profiles GET] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load sender profiles: " + err.message, profiles: [], defaultSmtp: null },
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
    await ensureSenderProfilesTable(sql);

    const profileName = (body.profileName || body.fromName || "Commercial Relay").trim();
    const provider = (body.provider || "custom").trim();
    const host = (body.host || "").trim();
    const port = Number(body.port) || 587;
    const encryption = (body.encryption || "tls").trim();
    const fromEmail = (body.fromEmail || "").trim().toLowerCase();
    const fromName = (body.fromName || "").trim();
    const username = (body.username || "").trim();
    const password = body.password ? String(body.password) : "";
    const isDefault = Boolean(body.isDefault);

    if (!host || !fromEmail) {
      return NextResponse.json(
        { success: false, error: "Host and From Email are required" },
        { status: 400 }
      );
    }

    const id = body.id && String(body.id).trim()
      ? String(body.id).trim()
      : `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (isDefault) {
      await sql`
        UPDATE tenant_sender_profiles
        SET is_default = FALSE, updated_at = NOW()
        WHERE LOWER(tenant_slug) = ${tenantSlug};
      `;
    }

    // Check if updating existing profile
    const existing = await sql`
      SELECT id, password FROM tenant_sender_profiles
      WHERE id = ${id} AND LOWER(tenant_slug) = ${tenantSlug}
      LIMIT 1;
    `;

    const effectivePassword = password && password !== "••••••••" ? password : (existing[0]?.password || "");

    if (existing.length > 0) {
      await sql`
        UPDATE tenant_sender_profiles
        SET profile_name = ${profileName},
            provider = ${provider},
            host = ${host},
            port = ${port},
            encryption = ${encryption},
            from_email = ${fromEmail},
            from_name = ${fromName},
            username = ${username},
            password = ${effectivePassword},
            is_default = ${isDefault},
            updated_at = NOW()
        WHERE id = ${id} AND LOWER(tenant_slug) = ${tenantSlug};
      `;
    } else {
      await sql`
        INSERT INTO tenant_sender_profiles (
          id, tenant_slug, tenant_id, profile_name, provider, host, port, encryption, from_email, from_name, username, password, is_default, created_at, updated_at
        ) VALUES (
          ${id}, ${tenantSlug}, '', ${profileName}, ${provider}, ${host}, ${port}, ${encryption}, ${fromEmail}, ${fromName}, ${username}, ${effectivePassword}, ${isDefault}, NOW(), NOW()
        );
      `;
    }

    return NextResponse.json({
      success: true,
      profile: {
        id,
        tenantSlug,
        profileName,
        provider,
        host,
        port,
        encryption,
        fromEmail,
        fromName,
        username,
        hasPassword: Boolean(effectivePassword && effectivePassword.length > 0),
        isDefault,
      },
    });
  } catch (err: any) {
    console.error("[Sender Profiles POST] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save sender profile: " + err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const tenantSlug = getValidatedTenantSlug(request);

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Profile ID is required" }, { status: 400 });
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureSenderProfilesTable(sql);

    await sql`
      DELETE FROM tenant_sender_profiles
      WHERE id = ${id.trim()} AND LOWER(tenant_slug) = ${tenantSlug};
    `;

    return NextResponse.json({ success: true, message: "Profile deleted successfully" });
  } catch (err: any) {
    console.error("[Sender Profiles DELETE] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete sender profile: " + err.message },
      { status: 500 }
    );
  }
}
