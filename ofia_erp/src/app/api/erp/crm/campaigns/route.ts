import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

async function ensureCrmCampaignsTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS crm_campaigns (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      name VARCHAR(191) NOT NULL,
      goal TEXT DEFAULT '',
      target_audience TEXT DEFAULT '',
      status VARCHAR(50) DEFAULT 'ACTIVE',
      channels_json JSONB DEFAULT '["Voicebip PSTN", "WhatsApp Deck"]'::jsonb,
      prospects_count INT DEFAULT 0,
      sent_count INT DEFAULT 0,
      replies_count INT DEFAULT 0,
      meetings_count INT DEFAULT 0,
      pipeline_value NUMERIC(15,2) DEFAULT 0,
      start_date VARCHAR(100) DEFAULT '',
      strategy_summary TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_campaigns_tenant ON crm_campaigns (LOWER(tenant_slug));`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_campaigns_created ON crm_campaigns (LOWER(tenant_slug), created_at DESC);`;
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
    await ensureCrmCampaignsTable(sql);

    const rows = await sql`
      SELECT 
        id,
        tenant_slug,
        name,
        COALESCE(goal, '') AS goal,
        COALESCE(target_audience, '') AS target_audience,
        COALESCE(status, 'Active') AS status,
        COALESCE(channels_json::text, '["Voicebip PSTN", "WhatsApp Deck"]') AS channels_json,
        COALESCE(prospects_count, 0) AS prospects_count,
        COALESCE(sent_count, 0) AS sent_count,
        COALESCE(replies_count, 0) AS replies_count,
        COALESCE(meetings_count, 0) AS meetings_count,
        COALESCE(pipeline_value, 0) AS pipeline_value,
        COALESCE(start_date, '') AS start_date,
        COALESCE(strategy_summary, '') AS strategy_summary,
        created_at,
        updated_at
      FROM crm_campaigns
      WHERE LOWER(tenant_slug) = ${tenantSlug}
      ORDER BY created_at DESC
      LIMIT 100;
    `;

    const campaigns = rows.map((c: any) => {
      let channels: string[] = ["Voicebip Phone", "WhatsApp Follow-up"];
      try {
        if (c.channels_json) channels = JSON.parse(c.channels_json);
      } catch {}

      return {
        id: c.id,
        name: c.name,
        targetAudience: c.target_audience,
        target_audience: c.target_audience,
        goal: c.goal,
        status: c.status,
        channels,
        channels_json: c.channels_json,
        prospectsCount: Number(c.prospects_count),
        sentCount: Number(c.sent_count),
        replyRate: c.sent_count > 0 ? Math.round((Number(c.replies_count) / Number(c.sent_count)) * 100) : 0,
        meetingsBooked: Number(c.meetings_count),
        revenuePipeline: Number(c.pipeline_value),
        createdAt: c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString(),
        startDate: c.start_date || (c.created_at ? new Date(c.created_at).toISOString().slice(0, 10) : ""),
        strategySummary: c.strategy_summary || c.goal || "Targeted qualification campaign",
        conversionFunnel: [
          { stage: "Scanned", count: Number(c.prospects_count) || 100, pct: 100 },
          { stage: "Sent", count: Number(c.sent_count) || 0, pct: Number(c.prospects_count) > 0 ? Math.round((Number(c.sent_count) / Number(c.prospects_count)) * 100) : 0 },
          { stage: "Replied", count: Number(c.replies_count) || 0, pct: Number(c.sent_count) > 0 ? Math.round((Number(c.replies_count) / Number(c.sent_count)) * 100) : 0 },
          { stage: "Meeting", count: Number(c.meetings_count) || 0, pct: Number(c.sent_count) > 0 ? Math.round((Number(c.meetings_count) / Number(c.sent_count)) * 100) : 0 },
        ],
      };
    });

    return NextResponse.json({ success: true, campaigns });
  } catch (err: any) {
    console.error("[CRM-Campaigns] GET error:", err);
    return NextResponse.json(
      { success: false, error: "Database error resolving campaigns: " + err.message },
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
    await ensureCrmCampaignsTable(sql);

    const campaignId = body.id || `CMP-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const name = (body.name || body.campaignName || "Outreach Campaign").trim();
    const goal = (body.goal || "").trim();
    const targetAudience = (body.target_audience || body.targetAudience || body.audience || "").trim();
    const status = (body.status || "Active").trim();
    const channels = Array.isArray(body.channels) ? body.channels : (body.selectedChannels || ["Voicebip PSTN", "WhatsApp Deck"]);
    const channelsJson = JSON.stringify(channels);
    const prospectsCount = Number(body.prospects_count || body.prospectsCount || 0);
    const pipelineValue = Number(body.pipeline_value || body.revenuePipeline || 0);
    const startDate = body.start_date || body.startDate || new Date().toISOString().slice(0, 10);
    const strategySummary = body.strategy_summary || body.strategySummary || goal;

    const [saved] = await sql`
      INSERT INTO crm_campaigns (
        id, tenant_slug, tenant_id, name, goal, target_audience, status,
        channels_json, prospects_count, sent_count, replies_count, meetings_count,
        pipeline_value, start_date, strategy_summary, created_at, updated_at
      ) VALUES (
        ${campaignId}, ${tenantSlug}, '', ${name}, ${goal}, ${targetAudience}, ${status},
        ${channelsJson}::jsonb, ${prospectsCount}, 0, 0, 0,
        ${pipelineValue}, ${startDate}, ${strategySummary}, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        goal = EXCLUDED.goal,
        target_audience = EXCLUDED.target_audience,
        status = EXCLUDED.status,
        channels_json = EXCLUDED.channels_json,
        pipeline_value = EXCLUDED.pipeline_value,
        strategy_summary = EXCLUDED.strategy_summary,
        updated_at = NOW()
      WHERE LOWER(crm_campaigns.tenant_slug) = ${tenantSlug}
      RETURNING *;
    `;

    return NextResponse.json({
      success: true,
      campaign: {
        id: saved.id,
        name: saved.name,
        targetAudience: saved.target_audience,
        goal: saved.goal,
        status: saved.status,
        channels,
        createdAt: saved.created_at,
      },
    });
  } catch (err: any) {
    console.error("[CRM-Campaigns] POST error:", err);
    return NextResponse.json(
      { success: false, error: "Database error creating campaign: " + err.message },
      { status: 500 }
    );
  }
}
