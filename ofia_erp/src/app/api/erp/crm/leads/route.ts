import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

async function ensureCrmLeadsTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS crm_leads (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      name VARCHAR(191) NOT NULL,
      company VARCHAR(191) DEFAULT '',
      email VARCHAR(191) DEFAULT '',
      phone VARCHAR(100) DEFAULT '',
      source VARCHAR(100) DEFAULT 'Direct Outreach',
      score INT DEFAULT 80,
      status VARCHAR(50) DEFAULT 'QUALIFIED',
      owner VARCHAR(191) DEFAULT '',
      assigned_rep VARCHAR(191) DEFAULT '',
      value VARCHAR(100) DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_leads_tenant ON crm_leads (LOWER(tenant_slug));`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_leads_created ON crm_leads (LOWER(tenant_slug), created_at DESC);`;
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
    await ensureCrmLeadsTable(sql);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const status = searchParams.get("status") || "";

    const rows = await sql`
      SELECT 
        id,
        tenant_slug,
        name,
        COALESCE(company, '') AS company,
        COALESCE(email, '') AS email,
        COALESCE(phone, '') AS phone,
        COALESCE(source, 'Direct Outreach') AS source,
        COALESCE(score, 75) AS score,
        COALESCE(status, 'QUALIFIED') AS status,
        COALESCE(owner, '') AS owner,
        COALESCE(assigned_rep, '') AS assigned_rep,
        COALESCE(value, '') AS value,
        COALESCE(notes, '') AS notes,
        created_at,
        updated_at
      FROM crm_leads
      WHERE LOWER(tenant_slug) = ${tenantSlug}
        ${status && status !== "ALL" ? sql`AND status = ${status}` : sql``}
        ${search ? sql`AND (LOWER(name) LIKE ${'%' + search + '%'} OR LOWER(company) LIKE ${'%' + search + '%'} OR LOWER(phone) LIKE ${'%' + search + '%'})` : sql``}
      ORDER BY created_at DESC
      LIMIT 200;
    `;

    const leads = rows.map((r: any) => ({
      id: r.id,
      tenantSlug: r.tenant_slug,
      name: r.name,
      contactName: r.name,
      company: r.company,
      companyName: r.company,
      email: r.email,
      contactEmail: r.email,
      phone: r.phone,
      contactPhone: r.phone,
      source: r.source,
      score: Number(r.score) || 75,
      status: r.status,
      owner: r.owner || r.assigned_rep,
      assignedRep: r.assigned_rep || r.owner,
      value: r.value,
      notes: r.notes,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, leads });
  } catch (err: any) {
    console.error("[CRM-Leads] GET error:", err);
    return NextResponse.json(
      { success: false, error: "Database error resolving CRM leads: " + err.message },
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
    await ensureCrmLeadsTable(sql);

    const leadId = body.id || `LED-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const name = (body.name || body.contactName || "Prospect").trim();
    const company = (body.company || body.companyName || "").trim();
    const email = (body.email || body.contactEmail || "").trim();
    const phone = (body.phone || body.contactPhone || "").trim();
    const source = (body.source || "Voice Outreach").trim();
    const score = Number(body.score) || 80;
    const status = (body.status || "QUALIFIED").trim();
    const owner = (body.owner || body.assignedRep || "").trim();
    const assignedRep = (body.assignedRep || body.owner || "").trim();
    const value = (body.value || "").trim();
    const notes = (body.notes || "").trim();

    const [saved] = await sql`
      INSERT INTO crm_leads (
        id, tenant_slug, tenant_id, name, company, email, phone,
        source, score, status, owner, assigned_rep, value, notes, created_at, updated_at
      ) VALUES (
        ${leadId}, ${tenantSlug}, '', ${name}, ${company}, ${email}, ${phone},
        ${source}, ${score}, ${status}, ${owner}, ${assignedRep}, ${value}, ${notes}, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        company = EXCLUDED.company,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        status = EXCLUDED.status,
        score = EXCLUDED.score,
        owner = EXCLUDED.owner,
        assigned_rep = EXCLUDED.assigned_rep,
        value = EXCLUDED.value,
        notes = EXCLUDED.notes,
        updated_at = NOW()
      WHERE LOWER(crm_leads.tenant_slug) = ${tenantSlug}
      RETURNING *;
    `;

    return NextResponse.json({
      success: true,
      lead: {
        id: saved.id,
        name: saved.name,
        company: saved.company,
        email: saved.email,
        phone: saved.phone,
        status: saved.status,
      },
    });
  } catch (err: any) {
    console.error("[CRM-Leads] POST error:", err);
    return NextResponse.json(
      { success: false, error: "Database error saving CRM lead: " + err.message },
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
      return NextResponse.json({ success: false, error: "Lead ID is required" }, { status: 400 });
    }

    const sql = await getTenantSql(tenantSlug);
    await sql`
      DELETE FROM crm_leads
      WHERE id = ${id} AND LOWER(tenant_slug) = ${tenantSlug};
    `;

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error("[CRM-Leads] DELETE error:", err);
    return NextResponse.json(
      { success: false, error: "Database error deleting CRM lead: " + err.message },
      { status: 500 }
    );
  }
}
