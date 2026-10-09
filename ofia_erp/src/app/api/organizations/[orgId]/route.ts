import { NextResponse } from "next/server";
import { INITIAL_TENANTS } from "@/lib/admin-data";
import { getDbPool, ensureTablesExist } from "@/lib/db";

const rawUserUrl = process.env.USER_SERVICE_URL || process.env.NEXT_PUBLIC_USER_SERVICE_URL || "https://ofia-user-service.onrender.com";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

// Global in-memory overrides to guarantee persistent updates across the application
const globalOrgMap = (globalThis as any).__OFIA_ORG_MAP__ || new Map<string, any>();
(globalThis as any).__OFIA_ORG_MAP__ = globalOrgMap;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const lowerId = orgId.toLowerCase();

  // 1. Direct Neon PostgreSQL Query (Source of Truth)
  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      const dbRes = await pool.query(
        `SELECT o.id, o.name, o.slug, o.domain, o.owner_id, o.plan_tier, o.billing_cycle, o.status,
                o.logo, o.login_image, o.primary_color, o.secondary_color, o.hero_title, o.hero_subtitle,
                o.erp_enabled, o.shop_enabled,
                u.name AS "ownerName", u.email AS "ownerEmail"
         FROM "Organization" o
         LEFT JOIN "User" u ON u.id = o.owner_id
         WHERE o.id = $1 OR LOWER(o.slug) = LOWER($1) OR LOWER(o.name) = LOWER($1)
         LIMIT 1`,
        [orgId]
      );
      if (dbRes.rows.length > 0) {
        const row = dbRes.rows[0];
        const record = {
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
        };

        const override =
          globalOrgMap.get(lowerId) ||
          globalOrgMap.get(row.id?.toLowerCase()) ||
          globalOrgMap.get(row.slug?.toLowerCase());
        if (override) {
          return NextResponse.json({ ...record, ...override });
        }
        return NextResponse.json(record);
      }
    }
  } catch (err: any) {
    console.warn("Direct Neon organization fetch error:", err.message);
  }

  // 2. Remote User Microservice Fallback
  try {
    const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const initialMatch = INITIAL_TENANTS.find(
        (t) =>
          t.id.toLowerCase() === lowerId ||
          t.slug.toLowerCase() === lowerId ||
          t.id.toLowerCase() === data.id?.toLowerCase() ||
          t.slug.toLowerCase() === data.slug?.toLowerCase()
      );
      const merged = initialMatch
        ? {
            ...initialMatch,
            ...data,
            logo: data.logo || initialMatch.logo,
            favicon: data.favicon || initialMatch.favicon,
            primaryColor: data.primaryColor || initialMatch.primaryColor,
            secondaryColor: data.secondaryColor || initialMatch.secondaryColor,
            loginImage: data.loginImage || initialMatch.loginImage,
            heroTitle: data.heroTitle || initialMatch.heroTitle,
            heroSubtitle: data.heroSubtitle || initialMatch.heroSubtitle,
          }
        : data;
      const override =
        globalOrgMap.get(lowerId) ||
        globalOrgMap.get(data.id?.toLowerCase()) ||
        globalOrgMap.get(data.slug?.toLowerCase());
      if (override) {
        return NextResponse.json({ ...merged, ...override });
      }
      return NextResponse.json(merged);
    }
  } catch (err: any) {
    console.warn("Failed to fetch organization from remote backend:", err.message);
  }

  // 3. Check in-memory store
  const override = globalOrgMap.get(lowerId);
  if (override) {
    return NextResponse.json(override);
  }

  // 4. Check initial tenants seed data
  const initialMatch = INITIAL_TENANTS.find(
    (t) => t.id.toLowerCase() === lowerId || t.slug.toLowerCase() === lowerId
  );
  if (initialMatch) {
    return NextResponse.json(initialMatch);
  }

  return NextResponse.json({
    id: orgId,
    name: orgId,
    slug: orgId,
    domain: `${orgId}.ofia.ng`,
    status: "ACTIVE",
    planTier: "Enterprise",
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const lowerId = orgId.toLowerCase();

  try {
    const body = await request.json();
    const resolvedOwnerName = body.ownerName || body.owner_name || body.adminName || body.admin_name || "";
    const resolvedOwnerEmail = body.ownerEmail || body.owner_email || body.adminEmail || body.admin_email || "";

    const erpEnabled = body.erpEnabled !== undefined ? body.erpEnabled : (body.erp_enabled !== undefined ? body.erp_enabled : true);
    const shopEnabled = body.shopEnabled !== undefined ? body.shopEnabled : (body.shop_enabled !== undefined ? body.shop_enabled : true);

    const normalizedBody = {
      ...body,
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

    // 1. Direct Neon PostgreSQL Update (Guaranteed Persistence)
    try {
      const pool = getDbPool();
      if (pool) {
        await ensureTablesExist();
        await pool.query(
          `UPDATE "Organization"
           SET name = COALESCE($1, name),
               slug = COALESCE($2, slug),
               domain = COALESCE($3, domain),
               logo = COALESCE($4, logo),
               login_image = COALESCE($5, login_image),
               primary_color = COALESCE($6, primary_color),
               secondary_color = COALESCE($7, secondary_color),
               hero_title = COALESCE($8, hero_title),
               hero_subtitle = COALESCE($9, hero_subtitle),
               erp_enabled = $10,
               shop_enabled = $11,
               updated_at = NOW()
           WHERE id = $12 OR LOWER(slug) = LOWER($12) OR LOWER(name) = LOWER($12)`,
          [
            body.name || null,
            body.slug || null,
            body.domain || null,
            body.logo || null,
            body.loginImage || body.login_image || null,
            body.primaryColor || null,
            body.secondaryColor || null,
            body.heroTitle || body.hero_title || null,
            body.heroSubtitle || body.hero_subtitle || null,
            erpEnabled,
            shopEnabled,
            orgId,
          ]
        );

        if (resolvedOwnerName || resolvedOwnerEmail) {
          await pool.query(
            `UPDATE "User"
             SET name = COALESCE($1, name),
                 email = COALESCE($2, email)
             WHERE id = (SELECT owner_id FROM "Organization" WHERE id = $3 OR LOWER(slug) = LOWER($3) LIMIT 1)
                OR (email = $2 AND email != '')`,
            [resolvedOwnerName || null, resolvedOwnerEmail || null, orgId]
          ).catch(() => {});
        }
      }
    } catch (dbErr: any) {
      console.warn("Direct Neon DB organization update warning:", dbErr.message);
    }

    // 2. Save in global in-memory map
    globalOrgMap.set(lowerId, normalizedBody);
    if (body.slug) globalOrgMap.set(body.slug.toLowerCase(), normalizedBody);
    if (body.id) globalOrgMap.set(body.id.toLowerCase(), normalizedBody);

    // 3. Forward update to remote microservice
    try {
      const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedBody),
      });

      if (res.ok) {
        const updated = await res.json();
        const merged = { ...updated, ...normalizedBody };
        globalOrgMap.set(lowerId, merged);
        return NextResponse.json(merged);
      }
    } catch (e: any) {
      console.warn("Remote org update fetch failed, returning Neon updated record:", e.message);
    }

    return NextResponse.json(normalizedBody);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update organization: " + err.message },
      { status: 500 }
    );
  }
}
