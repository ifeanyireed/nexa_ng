import { NextRequest, NextResponse } from "next/server";
import { MASTER_CONNECTION_STRING, getTenantSql, invalidateTenantDbCache } from "@/lib/tenant-db-resolver";
import { INITIAL_TENANTS } from "@/lib/admin-data";
import { alignTenantModules, getDefaultModulesForVertical } from "@/lib/tenant-module-aligner";
import { ensureDefaultTenantAdmin } from "@/lib/tenant-admin-provisioner";
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

    // Check query params if caller requested forced alignment sync
    const url = new URL(request.url);
    const syncParam = url.searchParams.get("sync");
    if (syncParam === "true") {
      for (const t of rows) {
        try {
          await alignTenantModules(t.slug);
        } catch {}
      }
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

    const defaultPreset = getDefaultModulesForVertical(vertical);
    const erpModules = body.erp_modules || body.erpModules || defaultPreset.erpModules;
    const shopSubModules = body.shop_sub_modules || body.shopSubModules || defaultPreset.shopSubModules;
    const mobilitySubModules = body.mobility_sub_modules || body.mobilitySubModules || defaultPreset.mobilitySubModules;

    const sql = neon(MASTER_CONNECTION_STRING);

    const hasDatabaseUrl = body.database_url !== undefined || body.databaseUrl !== undefined;
    const databaseUrl = hasDatabaseUrl ? (body.database_url || body.databaseUrl || "").trim() : "";
    const hasCloudinaryUrl = body.cloudinary_url !== undefined || body.cloudinaryUrl !== undefined;
    const cloudinaryUrl = hasCloudinaryUrl ? (body.cloudinary_url || body.cloudinaryUrl || "").trim() : "";

    const [tenant] = await sql`
      INSERT INTO platform_tenants (
        id, name, slug, domain, owner_name, owner_email, plan_tier, status,
        db_mode, database_url, cloudinary_url, is_custom_db, is_custom_storage, mrr, vertical,
        erp_modules, shop_sub_modules, mobility_sub_modules,
        created_at, updated_at
      ) VALUES (
        ${id}, ${name}, ${cleanSlug}, ${effectiveDomain},
        ${ownerName || "Tenant Admin"}, ${ownerEmail || `admin@${cleanSlug}.ng`},
        ${planTier}, 'Active', ${effectiveDbMode}, ${databaseUrl}, ${cloudinaryUrl},
        ${effectiveIsCustom}, ${Boolean(cloudinaryUrl)}, ${mrr}, ${vertical},
        ${JSON.stringify(erpModules)}::jsonb,
        ${JSON.stringify(shopSubModules)}::jsonb,
        ${JSON.stringify(mobilitySubModules)}::jsonb,
        NOW(), NOW()
      )
      ON CONFLICT (slug) DO UPDATE
      SET name = EXCLUDED.name,
          domain = EXCLUDED.domain,
          db_mode = EXCLUDED.db_mode,
          database_url = CASE WHEN EXCLUDED.database_url <> '' THEN EXCLUDED.database_url ELSE platform_tenants.database_url END,
          cloudinary_url = CASE WHEN EXCLUDED.cloudinary_url <> '' THEN EXCLUDED.cloudinary_url ELSE platform_tenants.cloudinary_url END,
          is_custom_db = EXCLUDED.is_custom_db,
          is_custom_storage = CASE WHEN EXCLUDED.cloudinary_url <> '' THEN true ELSE platform_tenants.is_custom_storage END,
          plan_tier = EXCLUDED.plan_tier,
          erp_modules = EXCLUDED.erp_modules,
          shop_sub_modules = EXCLUDED.shop_sub_modules,
          mobility_sub_modules = EXCLUDED.mobility_sub_modules,
          updated_at = NOW()
      RETURNING *;
    `;

    // Automatically align and populate TenantRolePermission in database
    try {
      await alignTenantModules(cleanSlug, {
        erpModules,
        shopSubModules,
        mobilitySubModules,
      });
    } catch (alignErr: any) {
      console.warn(`[Tenant API] Automatic module alignment warning for new tenant '${cleanSlug}':`, alignErr.message);
    }

    // Automatically create default admin user account for the tenant on workspace provision
    try {
      await ensureDefaultTenantAdmin({
        tenantSlug: cleanSlug,
        tenantName: name,
        ownerEmail: ownerEmail || `admin@${cleanSlug}.ng`,
        ownerName: ownerName || `${name} Admin`,
        domain: effectiveDomain,
        vertical,
        password: body.password || body.default_password || process.env.DEFAULT_TENANT_ADMIN_PASSWORD || undefined,
      });
    } catch (adminErr: any) {
      console.warn(`[Tenant API] Default admin account creation warning for '${cleanSlug}':`, adminErr.message);
    }

    return NextResponse.json({ success: true, tenant });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to create tenant: " + err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const rawId = (body.id || body.slug || "").trim();

    if (!rawId) {
      return NextResponse.json(
        { success: false, error: "id or slug parameter is required in request body" },
        { status: 400 }
      );
    }

    const sql = neon(MASTER_CONNECTION_STRING);

    const hasDatabaseUrl = body.database_url !== undefined || body.databaseUrl !== undefined;
    const databaseUrl = hasDatabaseUrl ? (body.database_url || body.databaseUrl || "").trim() : null;

    const hasCloudinaryUrl = body.cloudinary_url !== undefined || body.cloudinaryUrl !== undefined;
    const cloudinaryUrl = hasCloudinaryUrl ? (body.cloudinary_url || body.cloudinaryUrl || "").trim() : null;

    const hasMrr = body.mrr !== undefined && body.mrr !== null;
    const mrr = hasMrr ? Number(body.mrr) : null;

    const newSlug = body.slug ? body.slug.toLowerCase().trim() : null;
    let newDomain = body.domain ? body.domain.trim() : null;
    if (newSlug && (!newDomain || newDomain.endsWith(".ofia.ng") || newDomain.endsWith(".ofia.shop"))) {
      newDomain = `${newSlug}.ofia.ng`;
    }

    const erpModules = body.erp_modules || body.erpModules || null;
    const shopSubModules = body.shop_sub_modules || body.shopSubModules || null;
    const mobilitySubModules = body.mobility_sub_modules || body.mobilitySubModules || null;

    const [updated] = await sql`
      UPDATE platform_tenants
      SET name = COALESCE(${body.name}, name),
          slug = COALESCE(${newSlug}, slug),
          domain = COALESCE(${newDomain}, domain),
          owner_name = COALESCE(${body.ownerName || body.owner_name}, owner_name),
          owner_email = COALESCE(${body.ownerEmail || body.owner_email}, owner_email),
          plan_tier = COALESCE(${body.planTier || body.plan_tier}, plan_tier),
          status = COALESCE(${body.status}, status),
          db_mode = 'DEDICATED',
          database_url = CASE WHEN ${hasDatabaseUrl} THEN ${databaseUrl} ELSE database_url END,
          cloudinary_url = CASE WHEN ${hasCloudinaryUrl} THEN ${cloudinaryUrl} ELSE cloudinary_url END,
          is_custom_db = true,
          logo = COALESCE(${body.logo}, logo),
          mrr = CASE WHEN ${hasMrr} THEN ${mrr} ELSE mrr END,
          vertical = COALESCE(${body.vertical}, vertical),
          erp_modules = COALESCE(${erpModules ? JSON.stringify(erpModules) : null}::jsonb, erp_modules),
          shop_sub_modules = COALESCE(${shopSubModules ? JSON.stringify(shopSubModules) : null}::jsonb, shop_sub_modules),
          mobility_sub_modules = COALESCE(${mobilitySubModules ? JSON.stringify(mobilitySubModules) : null}::jsonb, mobility_sub_modules),
          updated_at = NOW()
      WHERE id = ${rawId} OR LOWER(slug) = ${rawId.toLowerCase()}
      RETURNING *;
    `;

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Tenant workspace '${rawId}' not found` },
        { status: 404 }
      );
    }

    const targetSlug = updated.slug || rawId.toLowerCase();

    // Automatically align and force synchronization into TenantRolePermission table
    try {
      await alignTenantModules(targetSlug, {
        erpModules: updated.erp_modules || undefined,
        shopSubModules: updated.shop_sub_modules || undefined,
        mobilitySubModules: updated.mobility_sub_modules || undefined,
      });
    } catch (alignErr: any) {
      console.warn(`[Tenant API] Automatic module alignment warning for '${targetSlug}':`, alignErr.message);
    }

    // Ensure default admin user account exists for tenant
    try {
      await ensureDefaultTenantAdmin({
        tenantSlug: targetSlug,
        tenantName: updated.name || targetSlug,
        ownerEmail: updated.owner_email || body.ownerEmail || body.owner_email,
        ownerName: updated.owner_name || body.ownerName || body.owner_name,
        domain: updated.domain || body.domain,
        vertical: updated.vertical || body.vertical,
        password: body.password || body.default_password || process.env.DEFAULT_TENANT_ADMIN_PASSWORD || undefined,
      });
    } catch (adminErr: any) {
      console.warn(`[Tenant API] Admin user sync note for '${targetSlug}':`, adminErr.message);
    }

    invalidateTenantDbCache(targetSlug);

    return NextResponse.json({ success: true, tenant: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export const PATCH = PUT;

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idOrSlug = (searchParams.get("id") || searchParams.get("slug") || "").trim();

  if (!idOrSlug) {
    return NextResponse.json(
      { success: false, error: "id or slug parameter is required" },
      { status: 400 }
    );
  }

  try {
    const sql = neon(MASTER_CONNECTION_STRING);
    const rows = await sql`
      SELECT * FROM platform_tenants
      WHERE id = ${idOrSlug} OR LOWER(slug) = ${idOrSlug.toLowerCase()}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tenant not found" },
        { status: 404 }
      );
    }

    const target = rows[0];

    await sql`
      DELETE FROM platform_tenants
      WHERE id = ${target.id};
    `;

    invalidateTenantDbCache(target.slug);

    return NextResponse.json({
      success: true,
      message: `Tenant '${target.name}' (@${target.slug}) deleted successfully.`,
      deletedTenant: {
        id: target.id,
        name: target.name,
        slug: target.slug,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to delete tenant: " + err.message },
      { status: 500 }
    );
  }
}
