import { NextRequest, NextResponse } from "next/server";
import { MASTER_CONNECTION_STRING, invalidateTenantDbCache } from "@/lib/tenant-db-resolver";
import { alignTenantModules } from "@/lib/tenant-module-aligner";
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

    const dbMode = "DEDICATED";
    const databaseUrl = (body.database_url || body.databaseUrl || "").trim();
    const isCustomDb = true;

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
          db_mode = ${dbMode},
          database_url = ${databaseUrl},
          is_custom_db = ${isCustomDb},
          logo = COALESCE(${body.logo}, logo),
          mrr = COALESCE(${body.mrr}, mrr),
          vertical = COALESCE(${body.vertical}, vertical),
          erp_modules = COALESCE(${erpModules ? JSON.stringify(erpModules) : null}::jsonb, erp_modules),
          shop_sub_modules = COALESCE(${shopSubModules ? JSON.stringify(shopSubModules) : null}::jsonb, shop_sub_modules),
          mobility_sub_modules = COALESCE(${mobilitySubModules ? JSON.stringify(mobilitySubModules) : null}::jsonb, mobility_sub_modules),
          updated_at = NOW()
      WHERE id = ${rawId} OR LOWER(slug) = ${rawId.toLowerCase()}
      RETURNING *;
    `;

    const targetSlug = updated?.slug || rawId.toLowerCase();

    // Automatically align and force synchronization into TenantRolePermission table
    try {
      await alignTenantModules(targetSlug, {
        erpModules: erpModules || undefined,
        shopSubModules: shopSubModules || undefined,
        mobilitySubModules: mobilitySubModules || undefined,
      });
    } catch (alignErr: any) {
      console.warn(`[Tenant API] Automatic module alignment warning for '${targetSlug}':`, alignErr.message);
    }

    invalidateTenantDbCache(targetSlug);

    return NextResponse.json({ success: true, tenant: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

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
