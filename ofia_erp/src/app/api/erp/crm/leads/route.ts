import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import { enforceLeadQuota } from "@/lib/subscription-enforcer";

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
      industry VARCHAR(191) DEFAULT '',
      location VARCHAR(191) DEFAULT '',
      buying_signals TEXT DEFAULT '[]',
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
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS industry VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS location VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS buying_signals TEXT DEFAULT '[]';`;
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS company VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS name VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS company_name VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS contact_name VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS contact_email VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(100) DEFAULT '';`;
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS icp_fit_score INT DEFAULT 80;`;
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255) DEFAULT '';`;
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS converted_deal_id VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;`;
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS contact_title VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS cover_letter JSONB DEFAULT NULL;`;
  try {
    await sql`ALTER TABLE crm_leads ALTER COLUMN company_name DROP NOT NULL;`;
  } catch {}
  try {
    await sql`ALTER TABLE crm_leads ALTER COLUMN contact_name DROP NOT NULL;`;
  } catch {}
  try {
    await sql`ALTER TABLE crm_leads ALTER COLUMN name DROP NOT NULL;`;
  } catch {}
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_leads_tenant ON crm_leads (LOWER(tenant_slug));`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_leads_created ON crm_leads (LOWER(tenant_slug), created_at DESC);`;

  // Ensure helper tables exist to prevent join query crashes
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
  await sql`
    CREATE TABLE IF NOT EXISTS crm_calls (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      lead_id VARCHAR(191) DEFAULT '',
      deal_id VARCHAR(191) DEFAULT '',
      contact_name VARCHAR(191) NOT NULL,
      company VARCHAR(191) DEFAULT '',
      phone_number VARCHAR(100) NOT NULL,
      rep_name VARCHAR(191) NOT NULL,
      rep_email VARCHAR(191) DEFAULT '',
      direction VARCHAR(50) DEFAULT 'OUTBOUND',
      outcome VARCHAR(100) NOT NULL,
      duration_seconds INT DEFAULT 0,
      notes TEXT DEFAULT '',
      followup_date VARCHAR(100) DEFAULT '',
      recording_url TEXT DEFAULT '',
      transcript TEXT DEFAULT '',
      ai_summary TEXT DEFAULT '',
      qualification_json TEXT DEFAULT '',
      is_ai BOOLEAN DEFAULT true,
      call_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS crm_email_subscribers (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      list_id VARCHAR(191) NOT NULL DEFAULT '',
      email VARCHAR(191) NOT NULL,
      name VARCHAR(191) DEFAULT '',
      first_name VARCHAR(100) DEFAULT '',
      last_name VARCHAR(100) DEFAULT '',
      company VARCHAR(191) DEFAULT '',
      phone VARCHAR(50) DEFAULT '',
      linkedin_url VARCHAR(255) DEFAULT '',
      role VARCHAR(100) DEFAULT 'Subscriber',
      department VARCHAR(100) DEFAULT '',
      status VARCHAR(50) DEFAULT 'SUBSCRIBED',
      unsubscribed_at TIMESTAMPTZ,
      unsubscribe_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_crm_leads_tenant_email 
      ON crm_leads (LOWER(tenant_slug), LOWER(TRIM(email))) 
      WHERE email IS NOT NULL AND TRIM(email) != '' AND LOWER(TRIM(email)) NOT LIKE '%@example.%';
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_crm_leads_tenant_phone 
      ON crm_leads (LOWER(tenant_slug), RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 8)) 
      WHERE phone IS NOT NULL AND LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) >= 8;
    `;
  } catch {}
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

    // Audience List Check: Sync actual LinkedIn URLs from audience lists (crm_email_subscribers) into crm_leads
    try {
      await sql`
        UPDATE crm_leads l
        SET linkedin_url = TRIM(s.linkedin_url), updated_at = NOW()
        FROM crm_email_subscribers s
        WHERE LOWER(l.tenant_slug) = ${tenantSlug}
          AND LOWER(s.tenant_slug) = ${tenantSlug}
          AND (l.linkedin_url IS NULL OR l.linkedin_url = '')
          AND s.linkedin_url IS NOT NULL
          AND TRIM(s.linkedin_url) != ''
          AND (
            (l.email != '' AND LOWER(TRIM(s.email)) = LOWER(TRIM(l.email)))
            OR (l.phone != '' AND s.phone != '' AND RIGHT(REGEXP_REPLACE(s.phone, '[^0-9]', '', 'g'), 7) = RIGHT(REGEXP_REPLACE(l.phone, '[^0-9]', '', 'g'), 7))
            OR (
              LENGTH(TRIM(l.name)) > 2 
              AND (
                LOWER(TRIM(COALESCE(s.first_name, '') || ' ' || COALESCE(s.last_name, ''))) = LOWER(TRIM(l.name))
                OR (s.first_name != '' AND s.last_name != '' AND LOWER(l.name) LIKE ('%' || LOWER(s.first_name) || '%' || LOWER(s.last_name) || '%'))
              )
            )
          );
      `;
    } catch {
      // In case crm_email_subscribers table is not present
    }

    // Auto-heal orphaned converted_deal_id references if the deal was deleted from crm_deals
    try {
      await sql`
        UPDATE crm_leads l
        SET converted_deal_id = '',
            updated_at = NOW()
        WHERE LOWER(l.tenant_slug) = ${tenantSlug}
          AND l.converted_deal_id != ''
          AND l.converted_deal_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM crm_deals d
            WHERE (d.id = l.converted_deal_id OR d.lead_id = l.id)
              AND (LOWER(d.tenant_slug) = ${tenantSlug} OR LOWER(d.tenant_slug) = 'default')
          );
      `;
    } catch {
      // In case crm_deals table is not present
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const status = searchParams.get("status") || "";
    const rep = searchParams.get("rep") || searchParams.get("assignedRep") || "";

    const rows = await sql`
      SELECT 
        l.id,
        l.tenant_slug,
        COALESCE(NULLIF(l.name, ''), NULLIF(l.contact_name, ''), '') AS name,
        COALESCE(NULLIF(l.company, ''), NULLIF(l.company_name, ''), '') AS company,
        COALESCE(NULLIF(l.email, ''), NULLIF(l.contact_email, ''), '') AS email,
        COALESCE(NULLIF(l.phone, ''), NULLIF(l.contact_phone, ''), '') AS phone,
        COALESCE(NULLIF(l.source, ''), 'Direct Outreach') AS source,
        COALESCE(NULLIF(l.score, 0), NULLIF(l.icp_fit_score, 0), 75) AS score,
        COALESCE(l.status, 'CURIOUS') AS status,
        COALESCE(l.owner, '') AS owner,
        COALESCE(l.assigned_rep, '') AS assigned_rep,
        COALESCE(l.industry, '') AS industry,
        COALESCE(l.location, '') AS location,
        COALESCE(l.buying_signals::text, '[]') AS buying_signals,
        COALESCE(l.value, '') AS value,
        COALESCE(l.notes, '') AS notes,
        COALESCE(l.contact_title, '') AS contact_title,
        l.cover_letter,
        COALESCE(l.converted_deal_id, '') AS converted_deal_id,
        (
          SELECT d.stage
          FROM crm_deals d
          WHERE (d.id = l.converted_deal_id OR d.lead_id = l.id)
            AND (LOWER(d.tenant_slug) = ${tenantSlug} OR LOWER(d.tenant_slug) = 'default')
          ORDER BY d.created_at DESC
          LIMIT 1
        ) AS deal_stage,
        (
          SELECT d.id
          FROM crm_deals d
          WHERE (d.id = l.converted_deal_id OR d.lead_id = l.id)
            AND (LOWER(d.tenant_slug) = ${tenantSlug} OR LOWER(d.tenant_slug) = 'default')
          ORDER BY d.created_at DESC
          LIMIT 1
        ) AS deal_id,
        COALESCE(
          NULLIF(TRIM(l.linkedin_url), ''),
          (
            SELECT TRIM(s.linkedin_url)
            FROM crm_email_subscribers s
            WHERE LOWER(s.tenant_slug) = ${tenantSlug}
              AND s.linkedin_url IS NOT NULL
              AND TRIM(s.linkedin_url) != ''
              AND (
                (l.email != '' AND LOWER(TRIM(s.email)) = LOWER(TRIM(l.email)))
                OR (l.phone != '' AND s.phone != '' AND RIGHT(REGEXP_REPLACE(s.phone, '[^0-9]', '', 'g'), 7) = RIGHT(REGEXP_REPLACE(l.phone, '[^0-9]', '', 'g'), 7))
                OR (
                  LENGTH(TRIM(l.name)) > 2
                  AND LOWER(TRIM(COALESCE(s.first_name, '') || ' ' || COALESCE(s.last_name, ''))) = LOWER(TRIM(l.name))
                  AND (l.company != '' AND LOWER(TRIM(s.company)) = LOWER(TRIM(l.company)))
                )
              )
            ORDER BY s.created_at DESC
            LIMIT 1
          ),
          ''
        ) AS linkedin_url,
        l.created_at,
        l.updated_at
      FROM crm_leads l
      WHERE LOWER(l.tenant_slug) = ${tenantSlug}
        ${status && status !== "ALL" ? sql`AND l.status = ${status}` : sql``}
        ${rep && rep !== "ALL" ? (rep.toUpperCase() === "UNASSIGNED" ? sql`AND (COALESCE(l.assigned_rep, '') = '' OR l.assigned_rep = 'Unassigned')` : sql`AND (LOWER(l.assigned_rep) = ${rep.toLowerCase()} OR LOWER(l.owner) = ${rep.toLowerCase()})`) : sql``}
        ${search ? sql`AND (LOWER(l.name) LIKE ${'%' + search + '%'} OR LOWER(l.company) LIKE ${'%' + search + '%'} OR LOWER(l.phone) LIKE ${'%' + search + '%'})` : sql``}
      ORDER BY l.created_at DESC
      LIMIT 1000;
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
      industry: r.industry || "",
      location: r.location || "",
      source: r.source,
      score: Number(r.score) || 75,
      icpFitScore: Number(r.score) || 75,
      buyingSignals: (() => {
        if (Array.isArray(r.buying_signals) && r.buying_signals.length > 0) return r.buying_signals;
        if (typeof r.buying_signals === "string" && r.buying_signals.trim()) {
          try {
            const parsed = JSON.parse(r.buying_signals);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          } catch {}
        }
        if (r.notes) {
          return r.notes
            .split(
              /\r?\n|(?<=[.!?])\s+(?=(?:Call Log\s*\(|Lead auto-assigned|Email [bB]last|Inbound|Outbound|Direct Outreach|Converted to Deal|Promoted to Deal|Deal Won|Meeting Scheduled))/g
            )
            .map((s: string) => s.trim())
            .filter(Boolean);
        }
        return ["Direct Outreach"];
      })(),
      status: r.status,
      owner: r.owner || r.assigned_rep,
      assignedRep: r.assigned_rep || r.owner,
      contactTitle: r.contact_title || "",
      coverLetter: r.cover_letter || null,
      value: r.value,
      notes: r.notes,
      linkedinUrl: r.linkedin_url || "",
      convertedDealId: r.deal_id || "",
      dealStage: r.deal_stage || undefined,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    }));

    // Deduplication filter: Guarantee only unique contacts are returned
    const seenEmails = new Set<string>();
    const seenPhones = new Set<string>();
    const seenNameCompany = new Set<string>();
    const uniqueLeads: typeof leads = [];

    for (const l of leads) {
      const cleanEmail = (l.email || "").toLowerCase().trim();
      const isPlaceholderEmail = !cleanEmail || cleanEmail.includes("@example.");
      const cleanPhone = (l.phone || "").replace(/[^0-9]/g, "");
      const phoneKey = cleanPhone.length >= 8 ? cleanPhone.slice(-8) : "";
      const nameCompKey =
        l.name && l.company ? `${l.name.toLowerCase().trim()}|${l.company.toLowerCase().trim()}` : "";

      let isDup = false;
      if (!isPlaceholderEmail && seenEmails.has(cleanEmail)) isDup = true;
      else if (phoneKey && seenPhones.has(phoneKey)) isDup = true;
      else if (nameCompKey && seenNameCompany.has(nameCompKey)) isDup = true;

      if (!isDup) {
        if (!isPlaceholderEmail) seenEmails.add(cleanEmail);
        if (phoneKey) seenPhones.add(phoneKey);
        if (nameCompKey) seenNameCompany.add(nameCompKey);
        uniqueLeads.push(l);
      }
    }

    return NextResponse.json({ success: true, leads: uniqueLeads });
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

    if (body.action === "UPDATE_COVER_LETTER") {
      const { id, coverLetter } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: "Lead ID is required" }, { status: 400 });
      }
      const [updated] = await sql`
        UPDATE crm_leads
        SET cover_letter = ${coverLetter ? JSON.stringify(coverLetter) : null},
            updated_at = NOW()
        WHERE id = ${id} AND LOWER(tenant_slug) = ${tenantSlug}
        RETURNING *;
      `;
      return NextResponse.json({
        success: true,
        lead: {
          id: updated?.id || id,
          coverLetter: updated?.cover_letter || coverLetter,
        },
      });
    }

    const leadId = body.id || `LED-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const name = (body.name || body.contactName || "Prospect").trim();
    const company = (body.company || body.companyName || "").trim();
    let email = (body.email || body.contactEmail || "").trim();
    if (email.toLowerCase().includes("@example.")) {
      email = "";
    }
    const phone = (body.phone || body.contactPhone || "").trim();
    const industry = (body.industry || "").trim();
    const location = (body.location || "").trim();
    const buyingSignals = Array.isArray(body.buyingSignals)
      ? body.buyingSignals
      : (body.buyingSignals ? [String(body.buyingSignals)] : ["Direct Manual Inbound"]);
    const source = (body.source || "Direct Manual Inbound").trim();
    const score = Number(body.score || body.icpFitScore) || 80;
    let status = (body.status || "CURIOUS").trim();
    const owner = (body.owner || body.assignedRep || "").trim();
    const assignedRep = (body.assignedRep || body.owner || "").trim();
    const value = (body.value || "").trim();
    const notes = (body.notes || "").trim();
    const linkedinUrl = (body.linkedinUrl || body.linkedin_url || "").trim();

    // Deduplication check: Does this contact already exist by email or phone?
    const cleanDigits = phone.replace(/[^0-9]/g, "");
    const last8Digits = cleanDigits.length >= 8 ? cleanDigits.slice(-8) : "";
    const cleanEmail = email.toLowerCase().trim();
    const isDummyEmail = !cleanEmail || cleanEmail.includes("@example.");

    let existingLead: any = null;
    if (body.id) {
      const [byId] = await sql`
        SELECT * FROM crm_leads
        WHERE id = ${body.id} AND LOWER(tenant_slug) = ${tenantSlug}
        LIMIT 1;
      `;
      if (byId) existingLead = byId;
    }

    if (!existingLead && (!isDummyEmail || last8Digits)) {
      const [byMatch] = await sql`
        SELECT * FROM crm_leads
        WHERE LOWER(tenant_slug) = ${tenantSlug}
          AND (
            ${!isDummyEmail ? sql`LOWER(TRIM(email)) = ${cleanEmail}` : sql`1=0`}
            ${last8Digits ? sql`OR (phone != '' AND RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 8) = ${last8Digits})` : sql``}
          )
        ORDER BY created_at ASC
        LIMIT 1;
      `;
      if (byMatch) existingLead = byMatch;
    }

    let targetLead: any = null;

    if (existingLead) {
      // Merge notes if new notes provided and not already present
      let mergedNotes = existingLead.notes || "";
      if (notes) {
        const lines = notes.split("\n").map((l: string) => l.trim()).filter(Boolean);
        for (const line of lines) {
          if (!mergedNotes.includes(line)) {
            mergedNotes = mergedNotes ? `${mergedNotes}\n${line}` : line;
          }
        }
      }

      const finalPhone = phone || existingLead.phone || "";
      const finalEmail = email || existingLead.email || "";
      const finalCompany = company || existingLead.company || "";
      const finalLinkedin = linkedinUrl || existingLead.linkedin_url || "";
      const finalRep = assignedRep || existingLead.assigned_rep || existingLead.owner || "";
      const finalScore = Math.max(Number(existingLead.score) || 75, score);
      const finalStatus = (status !== "CURIOUS" && status) ? status : (existingLead.status || "CURIOUS");
      const finalIndustry = industry || existingLead.industry || "";
      const finalLocation = location || existingLead.location || "";
      const finalSignals = buyingSignals.length > 0 ? buyingSignals : (existingLead.buying_signals || []);

      const [updated] = await sql`
        UPDATE crm_leads SET
          name = CASE WHEN ${name !== "Prospect" && name !== ""} THEN ${name} ELSE COALESCE(name, contact_name, '') END,
          contact_name = CASE WHEN ${name !== "Prospect" && name !== ""} THEN ${name} ELSE COALESCE(contact_name, name, '') END,
          company = ${finalCompany},
          company_name = ${finalCompany},
          email = ${finalEmail},
          contact_email = ${finalEmail},
          phone = ${finalPhone},
          contact_phone = ${finalPhone},
          industry = ${finalIndustry},
          location = ${finalLocation},
          buying_signals = ${JSON.stringify(finalSignals)},
          source = CASE WHEN source IS NULL OR source = '' THEN ${source} ELSE source END,
          score = ${finalScore},
          icp_fit_score = ${finalScore},
          status = ${finalStatus},
          owner = ${finalRep},
          assigned_rep = ${finalRep},
          value = CASE WHEN ${value !== ""} THEN ${value} ELSE value END,
          notes = ${mergedNotes},
          linkedin_url = ${finalLinkedin},
          updated_at = NOW()
        WHERE id = ${existingLead.id} AND LOWER(tenant_slug) = ${tenantSlug}
        RETURNING *;
      `;
      targetLead = updated;
    } else {
      // Enforce monthly CRM lead quota before inserting a new lead
      try {
        const [monthCountRow] = await sql`
          SELECT COUNT(*)::int AS cnt FROM crm_leads
          WHERE LOWER(tenant_slug) = ${tenantSlug}
            AND created_at >= date_trunc('month', NOW());
        `;
        const currentMonthLeads = Number(monthCountRow?.cnt || 0);
        const quota = await enforceLeadQuota(tenantSlug, currentMonthLeads, 1);
        if (!quota.allowed) {
          return NextResponse.json(
            {
              success: false,
              error: quota.error,
              code: quota.code,
              planTier: quota.planTier,
              limit: quota.limit,
              current: quota.current,
            },
            { status: quota.status }
          );
        }
      } catch (qErr: any) {
        console.warn("[CRM-Leads POST] Lead quota check note:", qErr.message);
      }

      const [saved] = await sql`
        INSERT INTO crm_leads (
          id, tenant_slug, tenant_id, name, contact_name, company, company_name, email, contact_email, phone, contact_phone,
          industry, location, buying_signals,
          source, score, icp_fit_score, status, owner, assigned_rep, value, notes, linkedin_url, created_at, updated_at
        ) VALUES (
          ${leadId}, ${tenantSlug}, '', ${name}, ${name}, ${company}, ${company}, ${email}, ${email}, ${phone}, ${phone},
          ${industry}, ${location}, ${JSON.stringify(buyingSignals)},
          ${source}, ${score}, ${score}, ${status}, ${owner}, ${assignedRep}, ${value}, ${notes}, ${linkedinUrl}, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          contact_name = EXCLUDED.contact_name,
          company = EXCLUDED.company,
          company_name = EXCLUDED.company_name,
          email = EXCLUDED.email,
          contact_email = EXCLUDED.contact_email,
          phone = EXCLUDED.phone,
          contact_phone = EXCLUDED.contact_phone,
          industry = EXCLUDED.industry,
          location = EXCLUDED.location,
          buying_signals = EXCLUDED.buying_signals,
          status = EXCLUDED.status,
          score = EXCLUDED.score,
          icp_fit_score = EXCLUDED.icp_fit_score,
          owner = EXCLUDED.owner,
          assigned_rep = EXCLUDED.assigned_rep,
          value = EXCLUDED.value,
          notes = EXCLUDED.notes,
          linkedin_url = CASE WHEN EXCLUDED.linkedin_url != '' THEN EXCLUDED.linkedin_url ELSE crm_leads.linkedin_url END,
          updated_at = NOW()
        WHERE LOWER(crm_leads.tenant_slug) = ${tenantSlug}
        RETURNING *;
      `;
      targetLead = saved;
    }

    return NextResponse.json({
      success: true,
      lead: {
        id: targetLead.id,
        tenantSlug: targetLead.tenant_slug || tenantSlug,
        name: targetLead.name || targetLead.contact_name || name,
        contactName: targetLead.contact_name || targetLead.name || name,
        company: targetLead.company || targetLead.company_name || company,
        companyName: targetLead.company_name || targetLead.company || company,
        email: targetLead.email || targetLead.contact_email || "",
        contactEmail: targetLead.contact_email || targetLead.email || "",
        phone: targetLead.phone || targetLead.contact_phone || "",
        contactPhone: targetLead.contact_phone || targetLead.phone || "",
        industry: targetLead.industry || industry,
        location: targetLead.location || location,
        buyingSignals: (() => {
          if (Array.isArray(targetLead.buying_signals) && targetLead.buying_signals.length > 0) return targetLead.buying_signals;
          if (typeof targetLead.buying_signals === "string" && targetLead.buying_signals.trim()) {
            try {
              const parsed = JSON.parse(targetLead.buying_signals);
              if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch {}
          }
          return buyingSignals.length > 0 ? buyingSignals : ["Direct Manual Inbound"];
        })(),
        status: targetLead.status,
        score: Number(targetLead.score || targetLead.icp_fit_score) || score,
        icpFitScore: Number(targetLead.icp_fit_score || targetLead.score) || score,
        assignedRep: targetLead.assigned_rep || targetLead.owner || assignedRep,
        owner: targetLead.owner || targetLead.assigned_rep || owner,
        source: targetLead.source || source,
        value: targetLead.value || "",
        notes: targetLead.notes || "",
        linkedinUrl: targetLead.linkedin_url || "",
        convertedDealId: targetLead.converted_deal_id || "",
        createdAt: targetLead.created_at ? new Date(targetLead.created_at).toISOString() : new Date().toISOString(),
        updatedAt: targetLead.updated_at ? new Date(targetLead.updated_at).toISOString() : new Date().toISOString(),
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

    if (body.action === "UPDATE_COVER_LETTER") {
      const { id, coverLetter } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: "Lead ID is required" }, { status: 400 });
      }
      const [updated] = await sql`
        UPDATE crm_leads
        SET cover_letter = ${coverLetter ? JSON.stringify(coverLetter) : null},
            updated_at = NOW()
        WHERE id = ${id} AND LOWER(tenant_slug) = ${tenantSlug}
        RETURNING *;
      `;
      return NextResponse.json({
        success: true,
        lead: {
          id: updated?.id || id,
          coverLetter: updated?.cover_letter || coverLetter,
        },
      });
    }

    // Fetch existing lead
    const [existingLead] = await sql`
      SELECT id, 
             COALESCE(NULLIF(name, ''), NULLIF(contact_name, ''), '') AS name, 
             COALESCE(NULLIF(company, ''), NULLIF(company_name, ''), '') AS company, 
             COALESCE(NULLIF(email, ''), NULLIF(contact_email, ''), '') AS email, 
             COALESCE(NULLIF(phone, ''), NULLIF(contact_phone, ''), '') AS phone, 
             status, owner, assigned_rep, notes
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
    const contactTitle = body.contactTitle !== undefined
      ? String(body.contactTitle).trim()
      : (existingLead.contact_title || "");
    const score = body.score !== undefined || body.icpFitScore !== undefined
      ? Number(body.score ?? body.icpFitScore)
      : undefined;
    const value = body.value !== undefined ? String(body.value).trim() : undefined;
    const convertedDealId = body.convertedDealId !== undefined ? String(body.convertedDealId).trim() : undefined;

    const [updated] = await sql`
      UPDATE crm_leads SET
        name = ${name},
        contact_name = ${name},
        company = ${company},
        company_name = ${company},
        email = ${email},
        contact_email = ${email},
        phone = ${phone},
        contact_phone = ${phone},
        status = ${targetStatus},
        assigned_rep = ${assignedRep},
        owner = ${owner},
        notes = ${notes},
        linkedin_url = ${linkedinUrl},
        ${body.contactTitle !== undefined ? sql`contact_title = ${contactTitle},` : sql``}
        ${body.coverLetter !== undefined ? sql`cover_letter = ${body.coverLetter ? JSON.stringify(body.coverLetter) : null},` : sql``}
        ${score !== undefined ? sql`score = ${score}, icp_fit_score = ${score},` : sql``}
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
        name: updated.name || updated.contact_name || name,
        contactName: updated.contact_name || updated.name || name,
        contactTitle: updated.contact_title || "",
        company: updated.company || updated.company_name || company,
        companyName: updated.company_name || updated.company || company,
        email: updated.email || updated.contact_email || "",
        contactEmail: updated.contact_email || updated.email || "",
        phone: updated.phone || updated.contact_phone || "",
        contactPhone: updated.contact_phone || updated.phone || "",
        linkedinUrl: updated.linkedin_url || "",
        status: updated.status,
        assignedRep: updated.assigned_rep,
        owner: updated.owner,
        notes: updated.notes,
        coverLetter: updated.cover_letter,
        score: Number(updated.score || updated.icp_fit_score) || 75,
        icpFitScore: Number(updated.icp_fit_score || updated.score) || 75,
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
