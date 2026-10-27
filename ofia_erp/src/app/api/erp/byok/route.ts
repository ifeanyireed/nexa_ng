import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

const AI_BASE =
  process.env.AI_SERVICE_URL ||
  process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
  "";

async function ensureVoiceConfigTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS crm_voice_config (
      tenant_slug VARCHAR(191) PRIMARY KEY,
      tenant_id VARCHAR(191) DEFAULT '',
      agent_name VARCHAR(191) DEFAULT 'Ofia Executive Voice Assistant',
      tone VARCHAR(100) DEFAULT 'B2B Professional',
      voice_id VARCHAR(100) DEFAULT 'en-NG-Standard-A',
      model_name VARCHAR(100) DEFAULT 'gemini-1.5-flash',
      opening_hook TEXT DEFAULT 'Good day, I am calling on behalf of the executive sales team regarding our enterprise services.',
      value_proposition TEXT DEFAULT 'Guaranteed SLA delivery, dedicated account management, and real-time operational visibility with transparent corporate billing.',
      ai_disclosure_enabled BOOLEAN DEFAULT true,
      ai_disclosure_text TEXT DEFAULT 'Hello, I am an automated AI executive assistant calling on behalf of the corporate sales team.',
      max_duration_sec INT DEFAULT 300,
      calling_hours_start VARCHAR(20) DEFAULT '09:00',
      calling_hours_end VARCHAR(20) DEFAULT '17:00',
      max_retries INT DEFAULT 2,
      human_escalation_phone VARCHAR(50) DEFAULT '+234 800 000 0000',
      auto_whatsapp_deck BOOLEAN DEFAULT true,
      telephony_provider VARCHAR(50) DEFAULT 'VOICEBIP',
      voicebip_sip_endpoint VARCHAR(191) DEFAULT 'sip.voicebip.com:5060',
      voicebip_workspace_id VARCHAR(191) DEFAULT '',
      voicebip_agent_id VARCHAR(191) DEFAULT '',
      voicebip_api_key TEXT DEFAULT '',
      voicebip_api_secret TEXT DEFAULT '',
      from_phone_number VARCHAR(50) DEFAULT '+234 1 888 0000',
      allowed_actions_json JSONB DEFAULT '["Write structured call outcome to crm_calls", "Boost lead score to 95 for qualified prospects", "Schedule follow-up callback tasks for human sales closers", "Instant WhatsApp proposal dispatch upon qualification"]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`ALTER TABLE crm_voice_config ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_voice_config ADD COLUMN IF NOT EXISTS voicebip_workspace_id VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_voice_config ADD COLUMN IF NOT EXISTS voicebip_agent_id VARCHAR(191) DEFAULT '';`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_voice_config_tenant ON crm_voice_config (LOWER(tenant_slug));`;
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
    await ensureVoiceConfigTable(sql);

    const rows = await sql`
      SELECT 
        tenant_slug,
        COALESCE(agent_name, 'Ofia Executive Voice Assistant') AS agent_name,
        COALESCE(tone, 'B2B Professional') AS tone,
        COALESCE(voice_id, 'en-NG-Standard-A') AS voice_id,
        COALESCE(model_name, 'gemini-1.5-flash') AS model_name,
        COALESCE(opening_hook, 'Good day, I am calling on behalf of the executive sales team regarding our enterprise services.') AS opening_hook,
        COALESCE(value_proposition, 'Guaranteed SLA delivery, dedicated account management, and real-time operational visibility with transparent corporate billing.') AS value_proposition,
        COALESCE(ai_disclosure_enabled, true) AS ai_disclosure_enabled,
        COALESCE(ai_disclosure_text, 'Hello, I am an automated AI executive assistant calling on behalf of the corporate sales team.') AS ai_disclosure_text,
        COALESCE(max_duration_sec, 300) AS max_duration_sec,
        COALESCE(calling_hours_start, '09:00') AS calling_hours_start,
        COALESCE(calling_hours_end, '17:00') AS calling_hours_end,
        COALESCE(max_retries, 2) AS max_retries,
        COALESCE(human_escalation_phone, '+234 800 000 0000') AS human_escalation_phone,
        COALESCE(auto_whatsapp_deck, true) AS auto_whatsapp_deck,
        COALESCE(telephony_provider, 'VOICEBIP') AS telephony_provider,
        COALESCE(voicebip_sip_endpoint, 'sip.voicebip.com:5060') AS voicebip_sip_endpoint,
        COALESCE(voicebip_workspace_id, '') AS voicebip_workspace_id,
        COALESCE(voicebip_agent_id, '') AS voicebip_agent_id,
        COALESCE(voicebip_api_key, '') AS voicebip_api_key,
        COALESCE(voicebip_api_secret, '') AS voicebip_api_secret,
        COALESCE(from_phone_number, '+234 1 888 0000') AS from_phone_number,
        COALESCE(allowed_actions_json::text, '["Write structured call outcome to crm_calls", "Boost lead score to 95 for qualified prospects", "Schedule follow-up callback tasks for human sales closers", "Instant WhatsApp proposal dispatch upon qualification"]') AS allowed_actions_json,
        created_at,
        updated_at
      FROM crm_voice_config
      WHERE LOWER(tenant_slug) = ${tenantSlug}
      LIMIT 1;
    `;

    let voiceRow = rows[0];

    // If no voice config exists yet in tenant DB, insert default vertical-neutral B2B config
    if (!voiceRow) {
      const defaultActions = JSON.stringify([
        "Write structured call outcome to crm_calls",
        "Boost lead score to 95 for qualified prospects",
        "Schedule follow-up callback tasks for human sales closers",
        "Instant WhatsApp proposal dispatch upon qualification",
      ]);

      const [inserted] = await sql`
        INSERT INTO crm_voice_config (
          tenant_slug, tenant_id, agent_name, tone, voice_id, model_name,
          opening_hook, value_proposition, ai_disclosure_enabled, ai_disclosure_text,
          max_duration_sec, calling_hours_start, calling_hours_end, max_retries,
          human_escalation_phone, auto_whatsapp_deck, telephony_provider,
          voicebip_sip_endpoint, from_phone_number, allowed_actions_json
        ) VALUES (
          ${tenantSlug}, '', 'Ofia Executive Voice Assistant', 'B2B Professional', 'en-NG-Standard-A', 'gemini-1.5-flash',
          'Good day, I am calling on behalf of the executive sales team regarding our enterprise services.',
          'Guaranteed SLA delivery, dedicated account management, and real-time operational visibility with transparent corporate billing.',
          true, 'Hello, I am an automated AI executive assistant calling on behalf of the corporate sales team.',
          300, '09:00', '17:00', 2,
          '+234 800 000 0000', true, 'VOICEBIP',
          'sip.voicebip.com:5060', '+234 1 888 0000', ${defaultActions}::jsonb
        )
        RETURNING 
          tenant_slug, agent_name, tone, voice_id, model_name,
          opening_hook, value_proposition, ai_disclosure_enabled, ai_disclosure_text,
          max_duration_sec, calling_hours_start, calling_hours_end, max_retries,
          human_escalation_phone, auto_whatsapp_deck, telephony_provider,
          voicebip_sip_endpoint, voicebip_api_key, voicebip_api_secret,
          from_phone_number, COALESCE(allowed_actions_json::text, '[]') AS allowed_actions_json,
          created_at, updated_at;
      `;
      voiceRow = inserted;
    }

    let allowedActions = [
      "Write structured call outcome to crm_calls",
      "Boost lead score to 95 for qualified prospects",
      "Schedule follow-up callback tasks for human sales closers",
      "Instant WhatsApp proposal dispatch upon qualification",
    ];
    try {
      if (voiceRow.allowed_actions_json) {
        allowedActions = JSON.parse(voiceRow.allowed_actions_json);
      }
    } catch {}

    const voiceConfig = {
      organization_id: voiceRow.tenant_slug,
      agent_name: voiceRow.agent_name,
      tone: voiceRow.tone,
      voice_id: voiceRow.voice_id,
      model_name: voiceRow.model_name,
      opening_hook: voiceRow.opening_hook,
      value_proposition: voiceRow.value_proposition,
      ai_disclosure_enabled: voiceRow.ai_disclosure_enabled,
      ai_disclosure_text: voiceRow.ai_disclosure_text,
      max_duration_sec: Number(voiceRow.max_duration_sec),
      calling_hours_start: voiceRow.calling_hours_start,
      calling_hours_end: voiceRow.calling_hours_end,
      max_retries: Number(voiceRow.max_retries),
      human_escalation_phone: voiceRow.human_escalation_phone,
      auto_whatsapp_deck: voiceRow.auto_whatsapp_deck,
      telephony_provider: voiceRow.telephony_provider,
      voicebip_sip_endpoint: voiceRow.voicebip_sip_endpoint,
      voicebip_workspace_id: voiceRow.voicebip_workspace_id || "",
      voicebip_agent_id: voiceRow.voicebip_agent_id || "",
      voicebip_api_key: voiceRow.voicebip_api_key,
      voicebip_api_secret: voiceRow.voicebip_api_secret,
      from_phone_number: voiceRow.from_phone_number,
      allowed_actions: allowedActions,
      created_at: voiceRow.created_at,
      updated_at: voiceRow.updated_at,
    };

    // Optional BYOK integration
    let byokData: any = null;
    if (AI_BASE) {
      try {
        const byokRes = await fetch(`${AI_BASE}/api/v1/gtm/${encodeURIComponent(tenantSlug)}/settings`, {
          cache: "no-store",
          signal: AbortSignal.timeout(4000),
        }).catch(() => null);
        if (byokRes && byokRes.ok) {
          byokData = await byokRes.json().catch(() => null);
        }
      } catch {}
    }

    return NextResponse.json({
      configured: byokData?.has_anthropic_key || byokData?.has_openai_key || byokData?.has_gemini_key || false,
      settings: {
        anthropicKey: byokData?.anthropic_key_masked || "",
        openaiKey: byokData?.openai_key_masked || "",
        geminiKey: byokData?.gemini_key_masked || "",
        whatsappKey: byokData?.whatsapp_phone_number_id || "",
        groqKey: byokData?.groq_key_masked || "",
        deepseekKey: byokData?.deepseek_key_masked || "",
        hasAnthropicKey: Boolean(byokData?.has_anthropic_key),
        hasOpenaiKey: Boolean(byokData?.has_openai_key),
        hasGeminiKey: Boolean(byokData?.has_gemini_key),
        hasWhatsappKey: Boolean(byokData?.has_whatsapp_token),
        hasGroqKey: Boolean(byokData?.has_groq_key),
        hasDeepseekKey: Boolean(byokData?.has_deepseek_key),
        aiDeliveryMode: byokData?.email_provider || "smtp",
        useTenantKeysOnly: Boolean(byokData?.use_tenant_keys_only),
      },
      voiceConfig,
    });
  } catch (err: any) {
    console.error("[BYOK-Voice] Error resolving voice config:", err);
    return NextResponse.json(
      { success: false, error: "Database error resolving voice configuration: " + err.message },
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
    await ensureVoiceConfigTable(sql);

    // 1. Save Voice Agent config if action === "save_voice" or voiceConfig is provided
    if (body.action === "save_voice" || body.voiceConfig) {
      const vc = body.voiceConfig || body;
      const agentName = (vc.agent_name || "Ofia Executive Voice Assistant").trim();
      const tone = (vc.tone || "B2B Professional").trim();
      const voiceId = (vc.voice_id || "en-NG-Standard-A").trim();
      const modelName = (vc.model_name || "gemini-1.5-flash").trim();
      const openingHook = (vc.opening_hook || "Good day, I am calling on behalf of the executive sales team regarding our enterprise services.").trim();
      const valueProposition = (vc.value_proposition || "Guaranteed SLA delivery, dedicated account management, and real-time operational visibility with transparent corporate billing.").trim();
      const aiDisclosureEnabled = vc.ai_disclosure_enabled !== undefined ? Boolean(vc.ai_disclosure_enabled) : true;
      const aiDisclosureText = (vc.ai_disclosure_text || "Hello, I am an automated AI executive assistant calling on behalf of the corporate sales team.").trim();
      const maxDurationSec = Number(vc.max_duration_sec) || 300;
      const callingHoursStart = (vc.calling_hours_start || "09:00").trim();
      const callingHoursEnd = (vc.calling_hours_end || "17:00").trim();
      const maxRetries = Number(vc.max_retries) || 2;
      const humanEscalationPhone = (vc.human_escalation_phone || "+234 800 000 0000").trim();
      const autoWhatsAppDeck = vc.auto_whatsapp_deck !== undefined ? Boolean(vc.auto_whatsapp_deck) : true;
      const telephonyProvider = (vc.telephony_provider || "VOICEBIP").toUpperCase().trim();
      const voicebipSipEndpoint = (vc.voicebip_sip_endpoint || "sip.voicebip.com:5060").trim();
      const voicebipWorkspaceId = (vc.voicebip_workspace_id || "").trim();
      const voicebipAgentId = (vc.voicebip_agent_id || "").trim();
      const voicebipApiKey = (vc.voicebip_api_key || "").trim();
      const voicebipApiSecret = (vc.voicebip_api_secret || "").trim();
      const fromPhoneNumber = (vc.from_phone_number || "+234 1 888 0000").trim();
      const allowedActions = Array.isArray(vc.allowed_actions)
        ? vc.allowed_actions
        : [
            "Write structured call outcome to crm_calls",
            "Boost lead score to 95 for qualified prospects",
            "Schedule follow-up callback tasks for human sales closers",
            "Instant WhatsApp proposal dispatch upon qualification",
          ];
      const allowedActionsJson = JSON.stringify(allowedActions);

      const [saved] = await sql`
        INSERT INTO crm_voice_config (
          tenant_slug, tenant_id, agent_name, tone, voice_id, model_name,
          opening_hook, value_proposition, ai_disclosure_enabled, ai_disclosure_text,
          max_duration_sec, calling_hours_start, calling_hours_end, max_retries,
          human_escalation_phone, auto_whatsapp_deck, telephony_provider,
          voicebip_sip_endpoint, voicebip_workspace_id, voicebip_agent_id,
          voicebip_api_key, voicebip_api_secret,
          from_phone_number, allowed_actions_json, updated_at
        ) VALUES (
          ${tenantSlug}, '', ${agentName}, ${tone}, ${voiceId}, ${modelName},
          ${openingHook}, ${valueProposition}, ${aiDisclosureEnabled}, ${aiDisclosureText},
          ${maxDurationSec}, ${callingHoursStart}, ${callingHoursEnd}, ${maxRetries},
          ${humanEscalationPhone}, ${autoWhatsAppDeck}, ${telephonyProvider},
          ${voicebipSipEndpoint}, ${voicebipWorkspaceId}, ${voicebipAgentId},
          ${voicebipApiKey}, ${voicebipApiSecret},
          ${fromPhoneNumber}, ${allowedActionsJson}::jsonb, NOW()
        )
        ON CONFLICT (tenant_slug) DO UPDATE SET
          agent_name = EXCLUDED.agent_name,
          tone = EXCLUDED.tone,
          voice_id = EXCLUDED.voice_id,
          model_name = EXCLUDED.model_name,
          opening_hook = EXCLUDED.opening_hook,
          value_proposition = EXCLUDED.value_proposition,
          ai_disclosure_enabled = EXCLUDED.ai_disclosure_enabled,
          ai_disclosure_text = EXCLUDED.ai_disclosure_text,
          max_duration_sec = EXCLUDED.max_duration_sec,
          calling_hours_start = EXCLUDED.calling_hours_start,
          calling_hours_end = EXCLUDED.calling_hours_end,
          max_retries = EXCLUDED.max_retries,
          human_escalation_phone = EXCLUDED.human_escalation_phone,
          auto_whatsapp_deck = EXCLUDED.auto_whatsapp_deck,
          telephony_provider = EXCLUDED.telephony_provider,
          voicebip_sip_endpoint = EXCLUDED.voicebip_sip_endpoint,
          voicebip_workspace_id = EXCLUDED.voicebip_workspace_id,
          voicebip_agent_id = EXCLUDED.voicebip_agent_id,
          voicebip_api_key = EXCLUDED.voicebip_api_key,
          voicebip_api_secret = EXCLUDED.voicebip_api_secret,
          from_phone_number = EXCLUDED.from_phone_number,
          allowed_actions_json = EXCLUDED.allowed_actions_json,
          updated_at = NOW()
        RETURNING *;
      `;

      // Optional forward to AI microservice in background if configured
      if (AI_BASE) {
        fetch(`${AI_BASE}/api/v1/gtm/${encodeURIComponent(tenantSlug)}/voice/config`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(vc),
          signal: AbortSignal.timeout(5000),
        }).catch(() => null);
      }

      return NextResponse.json({
        success: true,
        voiceConfig: {
          organization_id: saved.tenant_slug,
          agent_name: saved.agent_name,
          tone: saved.tone,
          voice_id: saved.voice_id,
          model_name: saved.model_name,
          opening_hook: saved.opening_hook,
          value_proposition: saved.value_proposition,
          ai_disclosure_enabled: saved.ai_disclosure_enabled,
          ai_disclosure_text: saved.ai_disclosure_text,
          max_duration_sec: Number(saved.max_duration_sec),
          calling_hours_start: saved.calling_hours_start,
          calling_hours_end: saved.calling_hours_end,
          max_retries: Number(saved.max_retries),
          human_escalation_phone: saved.human_escalation_phone,
          auto_whatsapp_deck: saved.auto_whatsapp_deck,
          telephony_provider: saved.telephony_provider,
          voicebip_sip_endpoint: saved.voicebip_sip_endpoint,
          from_phone_number: saved.from_phone_number,
          allowed_actions: allowedActions,
        },
      });
    }

    // 2. Test channel action or BYOK keys save if AI_BASE is present
    if (AI_BASE) {
      if (body.action === "test_channel") {
        const res = await fetch(`${AI_BASE}/api/v1/gtm/${encodeURIComponent(tenantSlug)}/settings/test`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(10000),
        });
        const data = await res.json().catch(() => null);
        return NextResponse.json(data, { status: res.status });
      }

      const res = await fetch(`${AI_BASE}/api/v1/gtm/${encodeURIComponent(tenantSlug)}/settings/byok`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json().catch(() => null);
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json({ success: true, message: "Settings processed" });
  } catch (err: any) {
    console.error("[BYOK] POST error:", err);
    return NextResponse.json(
      { success: false, error: "Error updating settings: " + err.message },
      { status: 500 }
    );
  }
}
