import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

async function ensureCrmDealsTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS crm_deals (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      title VARCHAR(191) NOT NULL,
      company VARCHAR(191) DEFAULT '',
      contact_name VARCHAR(191) DEFAULT '',
      email VARCHAR(191) DEFAULT '',
      phone VARCHAR(100) DEFAULT '',
      value VARCHAR(100) DEFAULT '₦0',
      stage VARCHAR(50) DEFAULT 'LEAD',
      owner VARCHAR(191) DEFAULT '',
      probability INT DEFAULT 20,
      expected_close VARCHAR(100) DEFAULT '',
      notes TEXT DEFAULT '',
      account_id VARCHAR(191),
      lead_id VARCHAR(191),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`ALTER TABLE crm_deals ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_deals_tenant ON crm_deals (LOWER(tenant_slug));`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_deals_created ON crm_deals (LOWER(tenant_slug), created_at DESC);`;
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
    await ensureCrmDealsTable(sql);

    const rows = await sql`
      SELECT 
        id,
        tenant_slug,
        title,
        COALESCE(company, '') AS company,
        COALESCE(contact_name, '') AS contact_name,
        COALESCE(email, '') AS email,
        COALESCE(phone, '') AS phone,
        COALESCE(value, '₦0') AS value,
        COALESCE(stage, 'LEAD') AS stage,
        COALESCE(owner, '') AS owner,
        COALESCE(probability, 20) AS probability,
        COALESCE(expected_close, '') AS expected_close,
        COALESCE(notes, '') AS notes,
        account_id,
        lead_id,
        created_at,
        updated_at
      FROM crm_deals
      WHERE LOWER(tenant_slug) = ${tenantSlug}
         OR LOWER(tenant_slug) = 'default'
      ORDER BY created_at DESC;
    `;

    const deals = rows.map((r: any) => ({
      id: r.id,
      tenantSlug: r.tenant_slug,
      title: r.title,
      company: r.company,
      contactName: r.contact_name,
      email: r.email,
      phone: r.phone,
      value: r.value,
      stage: r.stage,
      owner: r.owner,
      probability: Number(r.probability || 0),
      expectedClose: r.expected_close,
      notes: r.notes,
      accountId: r.account_id || undefined,
      leadId: r.lead_id || undefined,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, deals });
  } catch (err: any) {
    console.error("[CRM Deals GET] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch deals: " + err.message, deals: [] },
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
      : `DEAL-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const title = (body.title || "Untitled Deal").trim();
    const company = (body.company || "").trim();
    const contactName = (body.contactName || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const phone = (body.phone || "").trim();
    const value = (body.value || "₦0").trim();
    const stage = (body.stage || "LEAD").trim();
    const owner = (body.owner || "").trim();
    const probability = Number(body.probability) || 20;
    const expectedClose = (body.expectedClose || "").trim();
    const notes = (body.notes || "").trim();
    const accountId = body.accountId ? String(body.accountId).trim() : null;
    const leadId = body.leadId ? String(body.leadId).trim() : null;

    const sql = await getTenantSql(tenantSlug);
    await ensureCrmDealsTable(sql);

    await sql`
      INSERT INTO crm_deals (
        id, tenant_slug, tenant_id, title, company, contact_name, email, phone, value, stage, owner, probability, expected_close, notes, account_id, lead_id, created_at, updated_at
      ) VALUES (
        ${id}, ${tenantSlug}, '', ${title}, ${company}, ${contactName}, ${email}, ${phone}, ${value}, ${stage}, ${owner}, ${probability}, ${expectedClose}, ${notes}, ${accountId}, ${leadId}, NOW(), NOW()
      );
    `;

    return NextResponse.json({
      success: true,
      deal: {
        id,
        tenantSlug,
        title,
        company,
        contactName,
        email,
        phone,
        value,
        stage,
        owner,
        probability,
        expectedClose,
        notes,
        accountId,
        leadId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("[CRM Deals POST] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create deal: " + err.message },
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
      return NextResponse.json({ success: false, error: "Deal ID is required" }, { status: 400 });
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureCrmDealsTable(sql);

    const title = body.title !== undefined ? String(body.title).trim() : undefined;
    const company = body.company !== undefined ? String(body.company).trim() : undefined;
    const contactName = body.contactName !== undefined ? String(body.contactName).trim() : undefined;
    const email = body.email !== undefined ? String(body.email).trim().toLowerCase() : undefined;
    const phone = body.phone !== undefined ? String(body.phone).trim() : undefined;
    const value = body.value !== undefined ? String(body.value).trim() : undefined;
    const stage = body.stage !== undefined ? String(body.stage).trim() : undefined;
    const owner = body.owner !== undefined ? String(body.owner).trim() : undefined;
    const probability = body.probability !== undefined ? Number(body.probability) : undefined;
    const expectedClose = body.expectedClose !== undefined ? String(body.expectedClose).trim() : undefined;
    const notes = body.notes !== undefined ? String(body.notes).trim() : undefined;

    await sql`
      UPDATE crm_deals
      SET title = COALESCE(${title}, title),
          company = COALESCE(${company}, company),
          contact_name = COALESCE(${contactName}, contact_name),
          email = COALESCE(${email}, email),
          phone = COALESCE(${phone}, phone),
          value = COALESCE(${value}, value),
          stage = COALESCE(${stage}, stage),
          owner = COALESCE(${owner}, owner),
          probability = COALESCE(${probability}, probability),
          expected_close = COALESCE(${expectedClose}, expected_close),
          notes = COALESCE(${notes}, notes),
          updated_at = NOW()
      WHERE id = ${id} AND (LOWER(tenant_slug) = ${tenantSlug} OR LOWER(tenant_slug) = 'default');
    `;

    return NextResponse.json({ success: true, message: "Deal updated successfully", id });
  } catch (err: any) {
    console.error("[CRM Deals PATCH] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update deal: " + err.message },
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
      return NextResponse.json({ success: false, error: "Deal ID is required" }, { status: 400 });
    }

    const cleanId = String(id).trim();
    const sql = await getTenantSql(tenantSlug);
    await ensureCrmDealsTable(sql);

    await sql`
      DELETE FROM crm_deals
      WHERE id = ${cleanId} AND (LOWER(tenant_slug) = ${tenantSlug} OR LOWER(tenant_slug) = 'default');
    `;

    return NextResponse.json({ success: true, message: "Deal deleted successfully" });
  } catch (err: any) {
    console.error("[CRM Deals DELETE] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete deal: " + err.message },
      { status: 500 }
    );
  }
}
