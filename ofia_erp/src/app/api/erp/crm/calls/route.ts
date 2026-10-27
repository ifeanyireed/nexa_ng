import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

/**
 * Bootstrap crm_calls table with mandatory isolation columns and indexes
 */
async function ensureCrmCallsTable(sql: any) {
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
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_calls_tenant ON crm_calls (LOWER(tenant_slug));`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_calls_tenant_created ON crm_calls (LOWER(tenant_slug), created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_calls_tenant_date ON crm_calls (LOWER(tenant_slug), call_date DESC);`;
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
    await ensureCrmCallsTable(sql);

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("lead_id") || searchParams.get("leadId") || "";
    const rep = searchParams.get("rep") || "";
    const outcome = searchParams.get("outcome") || "";
    const direction = searchParams.get("direction") || "";
    const isAi = searchParams.get("is_ai");

    const rows = await sql`
      SELECT 
        id,
        tenant_slug,
        COALESCE(lead_id, '') AS lead_id,
        COALESCE(deal_id, '') AS deal_id,
        contact_name,
        COALESCE(company, '') AS company,
        phone_number,
        rep_name,
        COALESCE(rep_email, '') AS rep_email,
        direction,
        outcome,
        COALESCE(duration_seconds, 0) AS duration_seconds,
        COALESCE(notes, '') AS notes,
        COALESCE(followup_date, '') AS followup_date,
        COALESCE(recording_url, '') AS recording_url,
        COALESCE(transcript, '') AS transcript,
        COALESCE(ai_summary, '') AS ai_summary,
        COALESCE(qualification_json::text, '') AS qualification_json,
        COALESCE(is_ai, false) AS is_ai,
        call_date,
        created_at,
        updated_at
      FROM crm_calls
      WHERE LOWER(tenant_slug) = ${tenantSlug}
        ${leadId ? sql`AND lead_id = ${leadId}` : sql``}
        ${rep ? sql`AND (LOWER(rep_name) = ${rep.toLowerCase()} OR LOWER(rep_email) = ${rep.toLowerCase()})` : sql``}
        ${outcome && outcome !== "ALL" ? sql`AND outcome = ${outcome}` : sql``}
        ${direction ? sql`AND direction = ${direction}` : sql``}
        ${isAi !== null && isAi !== undefined ? sql`AND is_ai = ${isAi === "true"}` : sql``}
      ORDER BY call_date DESC
      LIMIT 200;
    `;

    let totalDuration = 0;
    let connectedCount = 0;
    let positiveCount = 0;
    let wonCount = 0;
    let todayCount = 0;
    const todayStr = new Date().toISOString().slice(0, 10);

    const calls = rows.map((r: any) => {
      const dur = Number(r.duration_seconds) || 0;
      totalDuration += dur;
      if (r.outcome?.startsWith("CONNECTED") || dur > 0) connectedCount++;
      if (
        r.outcome === "CONNECTED_INTERESTED" ||
        r.outcome === "CONNECTED_NEGOTIATING" ||
        r.outcome === "QUALIFIED" ||
        r.outcome === "CONNECTED_WON"
      )
        positiveCount++;
      if (r.outcome === "CONNECTED_WON") wonCount++;
      const callDateStr = (r.call_date ? new Date(r.call_date).toISOString() : "").slice(0, 10);
      if (callDateStr === todayStr) todayCount++;

      return {
        id: r.id,
        tenantSlug: r.tenant_slug,
        leadId: r.lead_id,
        lead_id: r.lead_id,
        dealId: r.deal_id,
        deal_id: r.deal_id,
        contactName: r.contact_name,
        contact_name: r.contact_name,
        company: r.company,
        phoneNumber: r.phone_number,
        phone_number: r.phone_number,
        repName: r.rep_name,
        rep_name: r.rep_name,
        repEmail: r.rep_email,
        rep_email: r.rep_email,
        direction: r.direction,
        outcome: r.outcome,
        durationSeconds: dur,
        duration_seconds: dur,
        notes: r.notes,
        followupDate: r.followup_date,
        followup_date: r.followup_date,
        recordingUrl: r.recording_url,
        recording_url: r.recording_url,
        transcript: r.transcript,
        aiSummary: r.ai_summary,
        ai_summary: r.ai_summary,
        qualificationJson: r.qualification_json,
        qualification_json: r.qualification_json,
        isAi: Boolean(r.is_ai),
        is_ai: Boolean(r.is_ai),
        callDate: r.call_date ? new Date(r.call_date).toISOString() : new Date().toISOString(),
        call_date: r.call_date ? new Date(r.call_date).toISOString() : new Date().toISOString(),
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      };
    });

    const totalCalls = calls.length;
    const connectRate = totalCalls > 0 ? Math.round((connectedCount / totalCalls) * 100) : 0;
    const avgDurationSec = connectedCount > 0 ? Math.round(totalDuration / connectedCount) : totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;

    return NextResponse.json({
      success: true,
      calls,
      stats: {
        totalCalls,
        connectedCalls: connectedCount,
        connectedCount,
        connectRate,
        positiveCount,
        wonCount,
        avgDurationSec,
        totalDurationSeconds: totalDuration,
        todayCalls: todayCount,
        todayCount,
      },
    });
  } catch (err: any) {
    console.error("[CRM-Calls] GET error:", err);
    return NextResponse.json(
      { success: false, error: "Database error resolving CRM calls: " + err.message },
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
    await ensureCrmCallsTable(sql);

    const callId = body.id || `CALL-AI-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    let leadId = body.leadId || body.lead_id || "";
    const dealId = body.dealId || body.deal_id || "";
    const contactName = body.contactName || body.contact_name || "Corporate Prospect";
    const company = body.company || "";
    const phoneNumber = body.phoneNumber || body.phone_number || "";

    // Auto-link to existing lead by phone or name if leadId wasn't passed
    if (!leadId && phoneNumber) {
      try {
        const rawClean = phoneNumber.replace(/[^0-9]/g, "");
        const lastDigits = rawClean.length >= 10 ? rawClean.slice(-10) : rawClean;
        const [matchedLead] = await sql`
          SELECT id FROM crm_leads
          WHERE LOWER(tenant_slug) = ${tenantSlug}
            AND (
              phone LIKE ${'%' + lastDigits}
              OR (LOWER(name) = ${String(contactName || '').toLowerCase().trim()} AND LENGTH(${String(contactName || '').trim()}) > 0)
            )
          LIMIT 1;
        `;
        if (matchedLead?.id) {
          leadId = matchedLead.id;
        }
      } catch {}
    }
    const repName = body.repName || body.rep_name || (body.isAi || body.is_ai ? "Ofia Voice Agent" : "Sales Rep");
    const repEmail = body.repEmail || body.rep_email || (body.isAi || body.is_ai ? "voice-agent@ofia.ng" : "");
    const direction = body.direction || "OUTBOUND";
    const outcome = body.outcome || "CONNECTED_FOLLOWUP";
    const durationSeconds = Number(body.durationSeconds ?? body.duration_seconds ?? 0);
    const notes = body.notes || "";
    const followupDate = body.followupDate || body.followup_date || "";
    const recordingUrl = body.recordingUrl || body.recording_url || "";
    const transcript = body.transcript || "";
    const aiSummary = body.aiSummary || body.ai_summary || notes;
    let qualJsonStr: string | null = null;
    const rawQual = body.qualificationJson || body.qualification_json;
    if (typeof rawQual === "object" && rawQual !== null) {
      qualJsonStr = JSON.stringify(rawQual);
    } else if (typeof rawQual === "string" && rawQual.trim()) {
      try {
        JSON.parse(rawQual);
        qualJsonStr = rawQual.trim();
      } catch {
        qualJsonStr = null;
      }
    }
    const isAi =
      body.isAi !== undefined
        ? Boolean(body.isAi)
        : body.is_ai !== undefined
        ? Boolean(body.is_ai)
        : true;
    const callDate = body.callDate || body.call_date ? new Date(body.callDate || body.call_date) : new Date();

    const [saved] = await sql`
      INSERT INTO crm_calls (
        id, tenant_slug, tenant_id, lead_id, deal_id, contact_name, company, phone_number,
        rep_name, rep_email, direction, outcome, duration_seconds, notes, followup_date,
        recording_url, transcript, ai_summary, qualification_json, is_ai, call_date, created_at, updated_at
      ) VALUES (
        ${callId}, ${tenantSlug}, '', ${leadId}, ${dealId}, ${contactName}, ${company}, ${phoneNumber},
        ${repName}, ${repEmail}, ${direction}, ${outcome}, ${durationSeconds}, ${notes}, ${followupDate},
        ${recordingUrl}, ${transcript}, ${aiSummary}, ${qualJsonStr ? sql`${qualJsonStr}::jsonb` : null}, ${isAi}, ${callDate}, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        outcome = EXCLUDED.outcome,
        duration_seconds = EXCLUDED.duration_seconds,
        notes = EXCLUDED.notes,
        recording_url = EXCLUDED.recording_url,
        transcript = EXCLUDED.transcript,
        ai_summary = EXCLUDED.ai_summary,
        qualification_json = EXCLUDED.qualification_json,
        followup_date = EXCLUDED.followup_date,
        updated_at = NOW()
      WHERE LOWER(crm_calls.tenant_slug) = ${tenantSlug}
      RETURNING 
        id, tenant_slug, lead_id, contact_name, company, phone_number, outcome,
        duration_seconds, recording_url, transcript, ai_summary, is_ai, call_date,
        COALESCE(qualification_json::text, '') AS qualification_json;
    `;

    return NextResponse.json({
      success: true,
      call: {
        id: saved.id,
        tenantSlug: saved.tenant_slug,
        leadId: saved.lead_id,
        contactName: saved.contact_name,
        company: saved.company,
        phoneNumber: saved.phone_number,
        outcome: saved.outcome,
        durationSeconds: saved.duration_seconds,
        recordingUrl: saved.recording_url,
        transcript: saved.transcript,
        aiSummary: saved.ai_summary,
        isAi: saved.is_ai,
        callDate: saved.call_date,
      },
    });
  } catch (err: any) {
    console.error("[CRM-Calls] POST error:", err);
    return NextResponse.json(
      { success: false, error: "Database error saving CRM call: " + err.message },
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
      return NextResponse.json({ success: false, error: "Call ID is required" }, { status: 400 });
    }

    const sql = await getTenantSql(tenantSlug);
    await sql`
      DELETE FROM crm_calls
      WHERE id = ${id} AND LOWER(tenant_slug) = ${tenantSlug};
    `;

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error("[CRM-Calls] DELETE error:", err);
    return NextResponse.json(
      { success: false, error: "Database error deleting CRM call: " + err.message },
      { status: 500 }
    );
  }
}
