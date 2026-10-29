import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

async function ensureCrmActivitiesTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS crm_activities (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      company VARCHAR(191) DEFAULT '',
      rep VARCHAR(191) DEFAULT '',
      date_time VARCHAR(100) DEFAULT '',
      status VARCHAR(50) DEFAULT 'UPCOMING',
      notes TEXT DEFAULT '',
      deal_id VARCHAR(191),
      account_id VARCHAR(191),
      lead_id VARCHAR(191),
      scheduled_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`ALTER TABLE crm_activities ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_activities_tenant ON crm_activities (LOWER(tenant_slug));`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_activities_created ON crm_activities (LOWER(tenant_slug), created_at DESC);`;
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
    await ensureCrmActivitiesTable(sql);

    const rows = await sql`
      SELECT 
        id,
        tenant_slug,
        type,
        title,
        COALESCE(company, '') AS company,
        COALESCE(rep, '') AS rep,
        COALESCE(date_time, '') AS date_time,
        COALESCE(status, 'UPCOMING') AS status,
        COALESCE(notes, '') AS notes,
        deal_id,
        account_id,
        lead_id,
        scheduled_at,
        completed_at,
        created_at
      FROM crm_activities
      WHERE LOWER(tenant_slug) = ${tenantSlug}
      ORDER BY created_at DESC;
    `;

    const activities = rows.map((r: any) => ({
      id: r.id,
      tenantSlug: r.tenant_slug,
      type: r.type,
      title: r.title,
      company: r.company,
      rep: r.rep,
      dateTime: r.date_time,
      status: r.status,
      notes: r.notes,
      dealId: r.deal_id || undefined,
      accountId: r.account_id || undefined,
      leadId: r.lead_id || undefined,
      scheduledAt: r.scheduled_at ? new Date(r.scheduled_at).toISOString() : undefined,
      completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : undefined,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, activities });
  } catch (err: any) {
    console.error("[CRM Activities GET] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch activities: " + err.message, activities: [] },
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

    const id = body.id && String(body.id).trim()
      ? String(body.id).trim()
      : `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const type = (body.type || "NOTE").trim();
    const title = (body.title || "Untitled Activity").trim();
    const company = (body.company || "").trim();
    const rep = (body.rep || "").trim();
    const dateTime = (body.dateTime || new Date().toISOString()).trim();
    const status = (body.status || "UPCOMING").trim();
    const notes = (body.notes || "").trim();
    const dealId = body.dealId ? String(body.dealId).trim() : null;
    const accountId = body.accountId ? String(body.accountId).trim() : null;
    const leadId = body.leadId ? String(body.leadId).trim() : null;

    const sql = await getTenantSql(tenantSlug);
    await ensureCrmActivitiesTable(sql);

    await sql`
      INSERT INTO crm_activities (
        id, tenant_slug, tenant_id, type, title, company, rep, date_time, status, notes, deal_id, account_id, lead_id, created_at
      ) VALUES (
        ${id}, ${tenantSlug}, '', ${type}, ${title}, ${company}, ${rep}, ${dateTime}, ${status}, ${notes}, ${dealId}, ${accountId}, ${leadId}, NOW()
      );
    `;

    return NextResponse.json({
      success: true,
      activity: {
        id,
        tenantSlug,
        type,
        title,
        company,
        rep,
        dateTime,
        status,
        notes,
        dealId,
        accountId,
        leadId,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("[CRM Activities POST] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create activity: " + err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    const id = (body.id || "").trim();
    if (!id) {
      return NextResponse.json({ success: false, error: "Activity ID is required" }, { status: 400 });
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureCrmActivitiesTable(sql);

    const type = body.type !== undefined ? String(body.type).trim() : undefined;
    const title = body.title !== undefined ? String(body.title).trim() : undefined;
    const company = body.company !== undefined ? String(body.company).trim() : undefined;
    const rep = body.rep !== undefined ? String(body.rep).trim() : undefined;
    const dateTime = body.dateTime !== undefined ? String(body.dateTime).trim() : undefined;
    const status = body.status !== undefined ? String(body.status).trim() : undefined;
    const notes = body.notes !== undefined ? String(body.notes).trim() : undefined;

    await sql`
      UPDATE crm_activities
      SET type = COALESCE(${type}, type),
          title = COALESCE(${title}, title),
          company = COALESCE(${company}, company),
          rep = COALESCE(${rep}, rep),
          date_time = COALESCE(${dateTime}, date_time),
          status = COALESCE(${status}, status),
          notes = COALESCE(${notes}, notes)
      WHERE id = ${id} AND LOWER(tenant_slug) = ${tenantSlug};
    `;

    return NextResponse.json({ success: true, message: "Activity updated successfully", id });
  } catch (err: any) {
    console.error("[CRM Activities PATCH] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update activity: " + err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return PATCH(request);
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
      return NextResponse.json({ success: false, error: "Activity ID is required" }, { status: 400 });
    }

    const cleanId = String(id).trim();
    const sql = await getTenantSql(tenantSlug);
    await ensureCrmActivitiesTable(sql);

    await sql`
      DELETE FROM crm_activities
      WHERE id = ${cleanId} AND LOWER(tenant_slug) = ${tenantSlug};
    `;

    return NextResponse.json({ success: true, message: "Activity deleted successfully" });
  } catch (err: any) {
    console.error("[CRM Activities DELETE] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete activity: " + err.message },
      { status: 500 }
    );
  }
}
