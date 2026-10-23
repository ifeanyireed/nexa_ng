import { NextRequest, NextResponse } from "next/server";
import { MASTER_CONNECTION_STRING, invalidateTenantDbCache } from "@/lib/tenant-db-resolver";
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

    const [updated] = await sql`
      UPDATE platform_tenants
      SET name = COALESCE(${body.name}, name),
          domain = COALESCE(${body.domain}, domain),
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
          updated_at = NOW()
      WHERE id = ${rawId} OR LOWER(slug) = ${rawId.toLowerCase()}
      RETURNING *;
    `;

    if (updated?.slug) {
      invalidateTenantDbCache(updated.slug);
    }

    return NextResponse.json({ success: true, tenant: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
