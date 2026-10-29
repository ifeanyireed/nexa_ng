import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

async function ensureCrmAccountsTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS crm_accounts (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      company VARCHAR(191) NOT NULL,
      industry VARCHAR(100) DEFAULT '',
      location VARCHAR(191) DEFAULT '',
      total_deals VARCHAR(50) DEFAULT '₦0',
      status VARCHAR(50) DEFAULT 'PROSPECT',
      key_contact VARCHAR(191) DEFAULT '',
      email VARCHAR(191) DEFAULT '',
      phone VARCHAR(100) DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_accounts_tenant ON crm_accounts (LOWER(tenant_slug));`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_accounts_created ON crm_accounts (LOWER(tenant_slug), created_at DESC);`;
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
    await ensureCrmAccountsTable(sql);

    const rows = await sql`
      SELECT 
        id,
        tenant_slug,
        company,
        COALESCE(industry, '') AS industry,
        COALESCE(location, '') AS location,
        COALESCE(total_deals, '₦0') AS total_deals,
        COALESCE(status, 'PROSPECT') AS status,
        COALESCE(key_contact, '') AS key_contact,
        COALESCE(email, '') AS email,
        COALESCE(phone, '') AS phone,
        created_at,
        updated_at
      FROM crm_accounts
      WHERE LOWER(tenant_slug) = ${tenantSlug}
      ORDER BY created_at DESC;
    `;

    const accounts = rows.map((r: any) => ({
      id: r.id,
      tenantSlug: r.tenant_slug,
      company: r.company,
      industry: r.industry,
      location: r.location,
      totalDeals: r.total_deals,
      status: r.status,
      keyContact: r.key_contact,
      email: r.email,
      phone: r.phone,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, accounts });
  } catch (err: any) {
    console.error("[CRM Accounts GET] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch accounts: " + err.message, accounts: [] },
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
      : `ACC-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const company = (body.company || "Untitled Account").trim();
    const industry = (body.industry || "").trim();
    const location = (body.location || "").trim();
    const totalDeals = (body.totalDeals || "₦0").trim();
    const status = (body.status || "PROSPECT").trim();
    const keyContact = (body.keyContact || body.contactName || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const phone = (body.phone || "").trim();

    const sql = await getTenantSql(tenantSlug);
    await ensureCrmAccountsTable(sql);

    await sql`
      INSERT INTO crm_accounts (
        id, tenant_slug, tenant_id, company, industry, location, total_deals, status, key_contact, email, phone, created_at, updated_at
      ) VALUES (
        ${id}, ${tenantSlug}, '', ${company}, ${industry}, ${location}, ${totalDeals}, ${status}, ${keyContact}, ${email}, ${phone}, NOW(), NOW()
      );
    `;

    return NextResponse.json({
      success: true,
      account: {
        id,
        tenantSlug,
        company,
        industry,
        location,
        totalDeals,
        status,
        keyContact,
        email,
        phone,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("[CRM Accounts POST] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create account: " + err.message },
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
      return NextResponse.json({ success: false, error: "Account ID is required" }, { status: 400 });
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureCrmAccountsTable(sql);

    const company = body.company !== undefined ? String(body.company).trim() : undefined;
    const industry = body.industry !== undefined ? String(body.industry).trim() : undefined;
    const location = body.location !== undefined ? String(body.location).trim() : undefined;
    const totalDeals = body.totalDeals !== undefined ? String(body.totalDeals).trim() : undefined;
    const status = body.status !== undefined ? String(body.status).trim() : undefined;
    const keyContact = body.keyContact !== undefined ? String(body.keyContact).trim() : undefined;
    const email = body.email !== undefined ? String(body.email).trim().toLowerCase() : undefined;
    const phone = body.phone !== undefined ? String(body.phone).trim() : undefined;

    await sql`
      UPDATE crm_accounts
      SET company = COALESCE(${company}, company),
          industry = COALESCE(${industry}, industry),
          location = COALESCE(${location}, location),
          total_deals = COALESCE(${totalDeals}, total_deals),
          status = COALESCE(${status}, status),
          key_contact = COALESCE(${keyContact}, key_contact),
          email = COALESCE(${email}, email),
          phone = COALESCE(${phone}, phone),
          updated_at = NOW()
      WHERE id = ${id} AND LOWER(tenant_slug) = ${tenantSlug};
    `;

    return NextResponse.json({ success: true, message: "Account updated successfully", id });
  } catch (err: any) {
    console.error("[CRM Accounts PATCH] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update account: " + err.message },
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
      return NextResponse.json({ success: false, error: "Account ID is required" }, { status: 400 });
    }

    const cleanId = String(id).trim();
    const sql = await getTenantSql(tenantSlug);
    await ensureCrmAccountsTable(sql);

    await sql`
      DELETE FROM crm_accounts
      WHERE id = ${cleanId} AND LOWER(tenant_slug) = ${tenantSlug};
    `;

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (err: any) {
    console.error("[CRM Accounts DELETE] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete account: " + err.message },
      { status: 500 }
    );
  }
}
