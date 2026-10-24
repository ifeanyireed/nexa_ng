import { NextRequest, NextResponse } from "next/server";
import { MASTER_CONNECTION_STRING, getTenantSql } from "@/lib/tenant-db-resolver";
import { INITIAL_TENANTS } from "@/lib/admin-data";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const sql = neon(MASTER_CONNECTION_STRING);

    // Auto-create table if needed
    await sql`
      CREATE TABLE IF NOT EXISTS platform_tenants (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(191) NOT NULL UNIQUE,
        domain VARCHAR(255) DEFAULT '',
        owner_name VARCHAR(255) DEFAULT '',
        owner_email VARCHAR(255) DEFAULT '',
        plan_tier VARCHAR(50) DEFAULT 'GROWTH',
        status VARCHAR(50) DEFAULT 'Active',
        db_mode VARCHAR(50) DEFAULT 'DEDICATED',
        database_url TEXT DEFAULT '',
        cloudinary_url TEXT DEFAULT '',
        is_custom_db BOOLEAN DEFAULT TRUE,
        is_custom_storage BOOLEAN DEFAULT FALSE,
        mrr NUMERIC(15,2) DEFAULT 0,
        vertical VARCHAR(50) DEFAULT 'retail',
        logo TEXT DEFAULT '',
        login_image TEXT DEFAULT '',
        hero_title TEXT DEFAULT '',
        hero_subtitle TEXT DEFAULT '',
        erp_modules JSONB DEFAULT '{}'::jsonb,
        shop_sub_modules JSONB DEFAULT '{}'::jsonb,
        mobility_sub_modules JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const rows = await sql`
      SELECT * FROM platform_tenants ORDER BY created_at DESC;
    `;

    // If database table is empty, seed with initial tenants so admin always has records
    if (!rows || rows.length === 0) {
      for (const t of INITIAL_TENANTS) {
        await sql`
          INSERT INTO platform_tenants (
            id, name, slug, domain, owner_name, owner_email, plan_tier, status,
            db_mode, database_url, is_custom_db, mrr, vertical, logo, login_image,
            hero_title, hero_subtitle, erp_modules, shop_sub_modules, mobility_sub_modules,
            created_at, updated_at
          ) VALUES (
            ${t.id}, ${t.name}, ${t.slug}, ${t.domain}, ${t.ownerName}, ${t.ownerEmail},
            ${t.planTier}, ${t.status}, 'DEDICATED',
            ${t.databaseUrl || ''}, true, ${t.mrr}, ${t.vertical || 'cars'},
            ${t.logo || ''}, ${t.loginImage || ''}, ${t.heroTitle || ''}, ${t.heroSubtitle || ''},
            ${JSON.stringify(t.erpModules || {})}, ${JSON.stringify(t.shopSubModules || {})},
            ${JSON.stringify(t.mobilitySubModules || {})}, NOW(), NOW()
          )
          ON CONFLICT (slug) DO UPDATE
          SET updated_at = NOW();
        `;
      }

      const seededRows = await sql`SELECT * FROM platform_tenants ORDER BY created_at DESC;`;
      return NextResponse.json({ success: true, tenants: seededRows });
    }

    return NextResponse.json({ success: true, tenants: rows });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch platform tenants: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      domain,
      ownerName,
      ownerEmail,
      planTier = "GROWTH",
      databaseUrl = "",
      mrr = 24000,
      vertical = "retail",
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "name and slug are required" },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim();
    const effectiveDomain =
      domain && !domain.endsWith(".ofia.ng") && !domain.endsWith(".ofia.shop")
        ? domain.trim()
        : `${cleanSlug}.ofia.ng`;
    const id = body.id || `org-${Date.now()}`;
    const effectiveDbMode = "DEDICATED";
    const effectiveIsCustom = true;

    const sql = neon(MASTER_CONNECTION_STRING);

    const [tenant] = await sql`
      INSERT INTO platform_tenants (
        id, name, slug, domain, owner_name, owner_email, plan_tier, status,
        db_mode, database_url, is_custom_db, mrr, vertical, created_at, updated_at
      ) VALUES (
        ${id}, ${name}, ${cleanSlug}, ${effectiveDomain},
        ${ownerName || "Tenant Admin"}, ${ownerEmail || `admin@${cleanSlug}.ng`},
        ${planTier}, 'Active', ${effectiveDbMode}, ${databaseUrl.trim()},
        ${effectiveIsCustom}, ${mrr}, ${vertical}, NOW(), NOW()
      )
      ON CONFLICT (slug) DO UPDATE
      SET name = EXCLUDED.name,
          domain = EXCLUDED.domain,
          db_mode = EXCLUDED.db_mode,
          database_url = EXCLUDED.database_url,
          is_custom_db = EXCLUDED.is_custom_db,
          plan_tier = EXCLUDED.plan_tier,
          updated_at = NOW()
      RETURNING *;
    `;

    return NextResponse.json({ success: true, tenant });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to create tenant: " + err.message },
      { status: 500 }
    );
  }
}
