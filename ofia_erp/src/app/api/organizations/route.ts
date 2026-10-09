import { NextResponse } from "next/server";
import { INITIAL_TENANTS } from "@/lib/admin-data";
import { getDbPool, ensureTablesExist } from "@/lib/db";

const rawUserUrl = process.env.USER_SERVICE_URL || process.env.NEXT_PUBLIC_USER_SERVICE_URL || "https://ofia-user-service.onrender.com";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

const globalOrgMap = (globalThis as any).__OFIA_ORG_MAP__ || new Map<string, any>();
(globalThis as any).__OFIA_ORG_MAP__ = globalOrgMap;

export async function GET() {
  let list: any[] = [];

  // 1. First try Direct Neon PostgreSQL Query
  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      const res = await pool.query(
        `SELECT o.id, o.name, o.slug, o.domain, o.owner_id, o.plan_tier, o.billing_cycle, o.status,
                o.logo, o.login_image, o.primary_color, o.secondary_color, o.hero_title, o.hero_subtitle,
                o.erp_enabled, o.shop_enabled,
                u.name AS "ownerName", u.email AS "ownerEmail"
         FROM "Organization" o
         LEFT JOIN "User" u ON u.id = o.owner_id
         ORDER BY o.created_at ASC`
      );
      if (res.rows.length > 0) {
        list = res.rows.map((row) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          domain: row.domain || `${row.slug}.ofia.ng`,
          owner_id: row.owner_id,
          ownerName: row.ownerName || "",
          ownerEmail: row.ownerEmail || "",
          owner: { name: row.ownerName || "", email: row.ownerEmail || "" },
          plan_tier: row.plan_tier || "ENTERPRISE",
          planTier: row.plan_tier || "ENTERPRISE",
          status: row.status || "ACTIVE",
          logo: row.logo,
          loginImage: row.login_image,
          primaryColor: row.primary_color || "#1A56DB",
          secondaryColor: row.secondary_color || "#0E9F6E",
          heroTitle: row.hero_title,
          heroSubtitle: row.hero_subtitle,
          erpEnabled: row.erp_enabled ?? true,
          shopEnabled: row.shop_enabled ?? true,
        }));
      }
    }
  } catch (dbErr: any) {
    console.warn("Neon PostgreSQL organizations list fetch error:", dbErr.message);
  }

  // 2. If list empty, query remote microservice
  if (list.length === 0) {
    try {
      const res = await fetch(`${USER_BASE}/organizations`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          list = data;
        }
      }
    } catch (err: any) {
      console.warn("Failed to fetch organizations from backend microservice:", err.message);
    }
  }

  // 3. Fallback to initial tenants seed data if still empty
  if (list.length === 0) {
    list = INITIAL_TENANTS.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      domain: t.domain,
      ownerName: t.ownerName,
      ownerEmail: t.ownerEmail,
      logo: t.logo,
      favicon: t.favicon,
      primaryColor: t.primaryColor,
      secondaryColor: t.secondaryColor,
      loginImage: t.loginImage,
      heroTitle: t.heroTitle,
      heroSubtitle: t.heroSubtitle,
      planTier: t.planTier,
      status: t.status,
      erpEnabled: true,
      shopEnabled: true,
    }));
  }

  // 4. Merge any in-memory overrides
  const mergedList = list.map((org) => {
    const override =
      globalOrgMap.get(org.id?.toLowerCase()) ||
      globalOrgMap.get(org.slug?.toLowerCase()) ||
      globalOrgMap.get(org.name?.toLowerCase());

    if (override) {
      return {
        ...org,
        ...override,
        owner: {
          ...(org.owner || {}),
          name: override.ownerName || override.owner_name || org.owner?.name,
          email: override.ownerEmail || override.owner_email || org.owner?.email,
        },
      };
    }
    return org;
  });

  return NextResponse.json(mergedList);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resolvedOwnerName = body.ownerName || body.owner_name || body.adminName || body.admin_name || "";
    const resolvedOwnerEmail = body.ownerEmail || body.owner_email || body.adminEmail || body.admin_email || "";

    const erpEnabled = body.erpEnabled !== undefined ? body.erpEnabled : (body.erp_enabled !== undefined ? body.erp_enabled : true);
    const shopEnabled = body.shopEnabled !== undefined ? body.shopEnabled : (body.shop_enabled !== undefined ? body.shop_enabled : true);

    const normalizedBody = {
      ...body,
      id: body.id || `org-${Date.now()}`,
      ownerName: resolvedOwnerName,
      owner_name: resolvedOwnerName,
      adminName: resolvedOwnerName,
      admin_name: resolvedOwnerName,
      ownerEmail: resolvedOwnerEmail,
      owner_email: resolvedOwnerEmail,
      adminEmail: resolvedOwnerEmail,
      admin_email: resolvedOwnerEmail,
      erpEnabled,
      erp_enabled: erpEnabled,
      shopEnabled,
      shop_enabled: shopEnabled,
      owner: {
        ...(body.owner || {}),
        name: resolvedOwnerName,
        email: resolvedOwnerEmail,
      },
    };

    // Direct Neon DB insert if possible
    try {
      const pool = getDbPool();
      if (pool) {
        await ensureTablesExist();
        await pool.query(
          `INSERT INTO "Organization" 
             (id, name, slug, domain, owner_id, plan_tier, billing_cycle, status, logo, login_image, primary_color, secondary_color, hero_title, hero_subtitle, erp_enabled, shop_enabled, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             slug = EXCLUDED.slug,
             domain = EXCLUDED.domain,
             logo = EXCLUDED.logo,
             login_image = EXCLUDED.login_image,
             primary_color = EXCLUDED.primary_color,
             secondary_color = EXCLUDED.secondary_color,
             hero_title = EXCLUDED.hero_title,
             hero_subtitle = EXCLUDED.hero_subtitle,
             erp_enabled = EXCLUDED.erp_enabled,
             shop_enabled = EXCLUDED.shop_enabled,
             updated_at = NOW()`,
          [
            normalizedBody.id,
            normalizedBody.name,
            normalizedBody.slug,
            normalizedBody.domain || `${normalizedBody.slug}.ofia.ng`,
            normalizedBody.owner_id || `USR-${normalizedBody.id}`,
            normalizedBody.planTier || "ENTERPRISE",
            "MONTHLY",
            "ACTIVE",
            normalizedBody.logo || null,
            normalizedBody.loginImage || normalizedBody.login_image || null,
            normalizedBody.primaryColor || "#1A56DB",
            normalizedBody.secondaryColor || "#0E9F6E",
            normalizedBody.heroTitle || null,
            normalizedBody.heroSubtitle || null,
            erpEnabled,
            shopEnabled,
          ]
        );
      }
    } catch (dbErr: any) {
      console.warn("Direct Neon DB organization insert warning:", dbErr.message);
    }

    if (normalizedBody.id) globalOrgMap.set(normalizedBody.id.toLowerCase(), normalizedBody);
    if (normalizedBody.slug) globalOrgMap.set(normalizedBody.slug.toLowerCase(), normalizedBody);

    try {
      const res = await fetch(`${USER_BASE}/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedBody),
      });

      if (res.ok) {
        const created = await res.json();
        return NextResponse.json({ ...created, ...normalizedBody }, { status: 201 });
      }
    } catch (e: any) {
      console.warn("Remote org create fetch failed, returning in-memory created record:", e.message);
    }

    return NextResponse.json(normalizedBody, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to persist organization to database: " + err.message },
      { status: 500 }
    );
  }
}
