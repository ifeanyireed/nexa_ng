import { NextResponse } from "next/server";
import { getDbPool, ensureTablesExist } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json({
        success: true,
        data: {
          platformName: "Ofia Enterprise Cloud",
          rootDomain: "ofia.ng",
          supportEmail: "support@ofia.ng",
          securityEmail: "security@ofia.ng",
          defaultCurrency: "NGN",
          defaultTimezone: "Africa/Lagos",
          sessionTimeoutHours: 168,
          enforce2fa: false,
          maintenanceMode: false,
          broadcastBannerEnabled: false,
          broadcastBannerText: "",
          broadcastBannerType: "info",
        },
      });
    }

    await ensureTablesExist();
    const res = await pool.query(
      `SELECT platform_name, root_domain, support_email, security_email,
              default_currency, default_timezone, session_timeout_hours,
              enforce_2fa, maintenance_mode, broadcast_banner_enabled,
              broadcast_banner_text, broadcast_banner_type, updated_at
       FROM platform_settings
       WHERE id = 'global_root'
       LIMIT 1`
    );

    if (res.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          platformName: "Ofia Enterprise Cloud",
          rootDomain: "ofia.ng",
          supportEmail: "support@ofia.ng",
          securityEmail: "security@ofia.ng",
          defaultCurrency: "NGN",
          defaultTimezone: "Africa/Lagos",
          sessionTimeoutHours: 168,
          enforce2fa: false,
          maintenanceMode: false,
          broadcastBannerEnabled: false,
          broadcastBannerText: "",
          broadcastBannerType: "info",
        },
      });
    }

    const row = res.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        platformName: row.platform_name || "Ofia Enterprise Cloud",
        rootDomain: row.root_domain || "ofia.ng",
        supportEmail: row.support_email || "support@ofia.ng",
        securityEmail: row.security_email || "security@ofia.ng",
        defaultCurrency: row.default_currency || "NGN",
        defaultTimezone: row.default_timezone || "Africa/Lagos",
        sessionTimeoutHours: Number(row.session_timeout_hours) || 168,
        enforce2fa: Boolean(row.enforce_2fa),
        maintenanceMode: Boolean(row.maintenance_mode),
        broadcastBannerEnabled: Boolean(row.broadcast_banner_enabled),
        broadcastBannerText: row.broadcast_banner_text || "",
        broadcastBannerType: row.broadcast_banner_type || "info",
        updatedAt: row.updated_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to load platform settings: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 }
      );
    }

    await ensureTablesExist();

    const platformName = (body.platformName || "Ofia Enterprise Cloud").trim();
    const rootDomain = (body.rootDomain || "ofia.ng").trim();
    const supportEmail = (body.supportEmail || "support@ofia.ng").trim();
    const securityEmail = (body.securityEmail || "security@ofia.ng").trim();
    const defaultCurrency = (body.defaultCurrency || "NGN").trim();
    const defaultTimezone = (body.defaultTimezone || "Africa/Lagos").trim();
    const sessionTimeoutHours = Number(body.sessionTimeoutHours) || 168;
    const enforce2fa = Boolean(body.enforce2fa);
    const maintenanceMode = Boolean(body.maintenanceMode);
    const broadcastBannerEnabled = Boolean(body.broadcastBannerEnabled);
    const broadcastBannerText = (body.broadcastBannerText || "").trim();
    const broadcastBannerType = body.broadcastBannerType || "info";

    await pool.query(
      `INSERT INTO platform_settings (
         id, platform_name, root_domain, support_email, security_email,
         default_currency, default_timezone, session_timeout_hours,
         enforce_2fa, maintenance_mode, broadcast_banner_enabled,
         broadcast_banner_text, broadcast_banner_type, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
       ON CONFLICT (id) DO UPDATE SET
         platform_name = EXCLUDED.platform_name,
         root_domain = EXCLUDED.root_domain,
         support_email = EXCLUDED.support_email,
         security_email = EXCLUDED.security_email,
         default_currency = EXCLUDED.default_currency,
         default_timezone = EXCLUDED.default_timezone,
         session_timeout_hours = EXCLUDED.session_timeout_hours,
         enforce_2fa = EXCLUDED.enforce_2fa,
         maintenance_mode = EXCLUDED.maintenance_mode,
         broadcast_banner_enabled = EXCLUDED.broadcast_banner_enabled,
         broadcast_banner_text = EXCLUDED.broadcast_banner_text,
         broadcast_banner_type = EXCLUDED.broadcast_banner_type,
         updated_at = NOW()`,
      [
        "global_root",
        platformName,
        rootDomain,
        supportEmail,
        securityEmail,
        defaultCurrency,
        defaultTimezone,
        sessionTimeoutHours,
        enforce2fa,
        maintenanceMode,
        broadcastBannerEnabled,
        broadcastBannerText,
        broadcastBannerType,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Platform settings updated successfully in PostgreSQL",
      data: {
        platformName,
        rootDomain,
        supportEmail,
        securityEmail,
        defaultCurrency,
        defaultTimezone,
        sessionTimeoutHours,
        enforce2fa,
        maintenanceMode,
        broadcastBannerEnabled,
        broadcastBannerText,
        broadcastBannerType,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to persist platform settings: " + err.message },
      { status: 500 }
    );
  }
}
