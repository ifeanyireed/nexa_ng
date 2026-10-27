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
      status VARCHAR(50) DEFAULT 'CURIOUS',
      owner VARCHAR(191) DEFAULT '',
      assigned_rep VARCHAR(191) DEFAULT '',
      value VARCHAR(100) DEFAULT '',
      notes TEXT DEFAULT '',
      linkedin_url VARCHAR(255) DEFAULT '',
      converted_deal_id VARCHAR(191) DEFAULT '',
      converted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255) DEFAULT '';`;
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS converted_deal_id VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;`;
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

    // Business Rule Enforcement: Any contact without a call log in crm_calls should NEVER be set to QUALIFIED!
    // Auto-revert any uncontacted leads that were mistakenly marked QUALIFIED back to CURIOUS
    try {
      await sql`
        UPDATE crm_leads
        SET status = 'CURIOUS', updated_at = NOW()
        WHERE LOWER(tenant_slug) = ${tenantSlug}
          AND status = 'QUALIFIED'
          AND NOT EXISTS (
            SELECT 1 FROM crm_calls
            WHERE LOWER(crm_calls.tenant_slug) = ${tenantSlug}
              AND (
                crm_calls.lead_id = crm_leads.id
                OR (crm_leads.phone != '' AND crm_calls.phone_number LIKE ('%' || RIGHT(REGEXP_REPLACE(crm_leads.phone, '[^0-9]', '', 'g'), 7)))
                OR (LOWER(crm_calls.contact_name) = LOWER(crm_leads.name) AND LENGTH(crm_leads.name) > 0)
              )
          );
      `;
    } catch {
      // In case crm_calls table has not yet been initialized
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const status = searchParams.get("status") || "";
    const rep = searchParams.get("rep") || searchParams.get("assignedRep") || "";

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
        COALESCE(status, 'CURIOUS') AS status,
        COALESCE(owner, '') AS owner,
        COALESCE(assigned_rep, '') AS assigned_rep,
        COALESCE(value, '') AS value,
        COALESCE(notes, '') AS notes,
        COALESCE(linkedin_url, '') AS linkedin_url,
        created_at,
        updated_at
      FROM crm_leads
      WHERE LOWER(tenant_slug) = ${tenantSlug}
        ${status && status !== "ALL" ? sql`AND status = ${status}` : sql``}
        ${rep && rep !== "ALL" ? (rep.toUpperCase() === "UNASSIGNED" ? sql`AND (COALESCE(assigned_rep, '') = '' OR assigned_rep = 'Unassigned')` : sql`AND (LOWER(assigned_rep) = ${rep.toLowerCase()} OR LOWER(owner) = ${rep.toLowerCase()})`) : sql``}
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
      icpFitScore: Number(r.score) || 75,
      buyingSignals: r.notes
        ? r.notes
            .split(
              /\r?\n|(?<=[.!?])\s+(?=(?:Call Log\s*\(|Lead auto-assigned|Email [bB]last|Inbound|Outbound|Direct Outreach|Converted to Deal|Promoted to Deal|Deal Won|Meeting Scheduled))/g
            )
            .map((s: string) => s.trim())
            .filter(Boolean)
        : ["Direct Outreach"],
      status: r.status,
      owner: r.owner || r.assigned_rep,
      assignedRep: r.assigned_rep || r.owner,
      value: r.value,
      notes: r.notes,
      linkedinUrl: r.linkedin_url || "",
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
    let status = (body.status || "CURIOUS").trim();
    const owner = (body.owner || body.assignedRep || "").trim();
    const assignedRep = (body.assignedRep || body.owner || "").trim();
    const value = (body.value || "").trim();
    const notes = (body.notes || "").trim();
    const linkedinUrl = (body.linkedinUrl || body.linkedin_url || "").trim();

    // Business Rule Enforcement: Any contact without a call log in crm_calls should NEVER be set to QUALIFIED!
    if (status === "QUALIFIED") {
      const cleanDigits = phone.replace(/[^0-9]/g, "");
      const lastDigits = cleanDigits.length >= 7 ? cleanDigits.slice(-7) : cleanDigits;
      const leadName = name.trim().toLowerCase();

      let hasCall = false;
      try {
        const [callRow] = await sql`
          SELECT 1 FROM crm_calls
          WHERE LOWER(tenant_slug) = ${tenantSlug}
            AND (
              lead_id = ${leadId}
              ${lastDigits ? sql`OR phone_number LIKE ${'%' + lastDigits}` : sql``}
              ${leadName ? sql`OR (LOWER(contact_name) = ${leadName} AND LENGTH(contact_name) > 0)` : sql``}
            )
          LIMIT 1;
        `;
        if (callRow) hasCall = true;
      } catch {
        hasCall = false;
      }

      if (!hasCall) {
        status = "CURIOUS";
      }
    }

    const [saved] = await sql`
      INSERT INTO crm_leads (
        id, tenant_slug, tenant_id, name, company, email, phone,
        source, score, status, owner, assigned_rep, value, notes, linkedin_url, created_at, updated_at
      ) VALUES (
        ${leadId}, ${tenantSlug}, '', ${name}, ${company}, ${email}, ${phone},
        ${source}, ${score}, ${status}, ${owner}, ${assignedRep}, ${value}, ${notes}, ${linkedinUrl}, NOW(), NOW()
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
        linkedin_url = CASE WHEN EXCLUDED.linkedin_url != '' THEN EXCLUDED.linkedin_url ELSE crm_leads.linkedin_url END,
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

    const id = body.id;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Lead ID is required for updating lead" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureCrmLeadsTable(sql);

    // Fetch existing lead
    const [existingLead] = await sql`
      SELECT id, name, company, email, phone, status, owner, assigned_rep, notes
      FROM crm_leads
      WHERE id = ${id} AND LOWER(tenant_slug) = ${tenantSlug}
      LIMIT 1;
    `;

    if (!existingLead) {
      return NextResponse.json(
        { success: false, error: `Lead with ID "${id}" not found` },
        { status: 404 }
      );
    }

    const targetStatus = body.status !== undefined ? String(body.status).trim() : existingLead.status;

    // Strict validation: Any contact without a call log should never be set to QUALIFIED!
    if (targetStatus === "QUALIFIED") {
      const cleanDigits = (existingLead.phone || body.contactPhone || body.phone || "").replace(/[^0-9]/g, "");
      const lastDigits = cleanDigits.length >= 7 ? cleanDigits.slice(-7) : cleanDigits;
      const leadName = (existingLead.name || body.contactName || body.name || "").trim().toLowerCase();

      let hasCall = false;
      try {
        const [callRow] = await sql`
          SELECT 1 FROM crm_calls
          WHERE LOWER(tenant_slug) = ${tenantSlug}
            AND (
              lead_id = ${id}
              ${lastDigits ? sql`OR phone_number LIKE ${'%' + lastDigits}` : sql``}
              ${leadName ? sql`OR (LOWER(contact_name) = ${leadName} AND LENGTH(contact_name) > 0)` : sql``}
            )
          LIMIT 1;
        `;
        if (callRow) hasCall = true;
      } catch {
        hasCall = false;
      }

      if (!hasCall) {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot set status to QUALIFIED: Contact has not been called yet. Any contact without a call log should never be set to QUALIFIED.",
          },
          { status: 400 }
        );
      }
    }

    const name = body.contactName !== undefined || body.name !== undefined 
      ? (body.contactName || body.name || "").trim() 
      : existingLead.name;
    const company = body.companyName !== undefined || body.company !== undefined
      ? (body.companyName || body.company || "").trim()
      : existingLead.company;
    const email = body.contactEmail !== undefined || body.email !== undefined
      ? (body.contactEmail || body.email || "").trim()
      : existingLead.email;
    const phone = body.contactPhone !== undefined || body.phone !== undefined
      ? (body.contactPhone || body.phone || "").trim()
      : existingLead.phone;
    const assignedRep = body.assignedRep !== undefined 
      ? String(body.assignedRep).trim() 
      : existingLead.assigned_rep;
    const owner = body.owner !== undefined 
      ? String(body.owner).trim() 
      : (assignedRep || existingLead.owner);
    const notes = body.notes !== undefined 
      ? String(body.notes) 
      : existingLead.notes;
    const linkedinUrl = body.linkedinUrl !== undefined || body.linkedin_url !== undefined
      ? String(body.linkedinUrl ?? body.linkedin_url).trim()
      : (existingLead.linkedin_url || "");
    const score = body.score !== undefined || body.icpFitScore !== undefined
      ? Number(body.score ?? body.icpFitScore)
      : undefined;
    const value = body.value !== undefined ? String(body.value).trim() : undefined;
    const convertedDealId = body.convertedDealId !== undefined ? String(body.convertedDealId).trim() : undefined;

    const [updated] = await sql`
      UPDATE crm_leads SET
        name = ${name},
        company = ${company},
        email = ${email},
        phone = ${phone},
        status = ${targetStatus},
        assigned_rep = ${assignedRep},
        owner = ${owner},
        notes = ${notes},
        linkedin_url = ${linkedinUrl},
        ${score !== undefined ? sql`score = ${score},` : sql``}
        ${value !== undefined ? sql`value = ${value},` : sql``}
        ${convertedDealId !== undefined ? sql`converted_deal_id = ${convertedDealId}, converted_at = NOW(),` : sql``}
        updated_at = NOW()
      WHERE id = ${id} AND LOWER(tenant_slug) = ${tenantSlug}
      RETURNING *;
    `;

    return NextResponse.json({
      success: true,
      lead: {
        id: updated.id,
        tenantSlug: updated.tenant_slug,
        name: updated.name,
        contactName: updated.name,
        company: updated.company,
        companyName: updated.company,
        email: updated.email,
        contactEmail: updated.email,
        phone: updated.phone,
        contactPhone: updated.phone,
        linkedinUrl: updated.linkedin_url || "",
        status: updated.status,
        assignedRep: updated.assigned_rep,
        owner: updated.owner,
        notes: updated.notes,
        score: updated.score,
        icpFitScore: updated.score,
        value: updated.value,
        convertedDealId: updated.converted_deal_id,
        updatedAt: updated.updated_at,
      },
    });
  } catch (err: any) {
    console.error("[CRM-Leads] PATCH error:", err);
    return NextResponse.json(
      { success: false, error: "Database error updating CRM lead: " + err.message },
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
