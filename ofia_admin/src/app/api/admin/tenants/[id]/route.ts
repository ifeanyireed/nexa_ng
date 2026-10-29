import { NextRequest, NextResponse } from "next/server";
import { MASTER_CONNECTION_STRING, invalidateTenantDbCache } from "@/lib/tenant-db-resolver";
import { alignTenantModules } from "@/lib/tenant-module-aligner";
import { ensureDefaultTenantAdmin } from "@/lib/tenant-admin-provisioner";
import { registerDomainOnEdge, isCustomDomain } from "@/lib/domain-edge-manager";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rawId = (id || "").trim();

  if (!rawId) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  try {
    const sql = neon(MASTER_CONNECTION_STRING);
    const rows = await sql`
      SELECT * FROM platform_tenants
      WHERE id = ${rawId} OR LOWER(slug) = ${rawId.toLowerCase()}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, tenant: rows[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rawId = (id || "").trim();

  if (!rawId) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }
  try {
    const body = await request.json();
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
          login_image = COALESCE(${body.login_image || body.loginImage}, login_image),
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

    // Automatically create / verify default admin user account for the tenant
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

    // Automatically register/update custom domain on edge infrastructure (e.g. Vercel)
    if (updated.domain && isCustomDomain(updated.domain)) {
      try {
        await registerDomainOnEdge(updated.domain);
      } catch (domErr: any) {
        console.warn(`[Tenant API] Custom domain edge registration warning for '${updated.domain}':`, domErr.message);
      }
    }

    invalidateTenantDbCache(targetSlug);

    return NextResponse.json({ success: true, tenant: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export const PATCH = PUT;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rawId = (id || "").trim();

  if (!rawId) {
    return NextResponse.json(
      { success: false, error: "tenant identifier is required" },
      { status: 400 }
    );
  }

  try {
    const sql = neon(MASTER_CONNECTION_STRING);
    const rows = await sql`
      SELECT * FROM platform_tenants
      WHERE id = ${rawId} OR LOWER(slug) = ${rawId.toLowerCase()}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tenant workspace not found" },
        { status: 404 }
      );
    }

    const target = rows[0];

    // Delete the tenant record from platform_tenants registry
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
