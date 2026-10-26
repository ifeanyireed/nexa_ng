import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

/**
 * Format phone number to E.164 standard.
 * Nigerian local numbers (e.g. 0803XXXXXXX) -> +234803XXXXXXX
 */
function formatE164(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "").trim();
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    return `+234${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith("234") && cleaned.length === 13) {
    return `+${cleaned}`;
  }
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantSlug = getValidatedTenantSlug(request, body);

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const { targetPhone, targetContact, targetCompany, leadId, provider } = body;

    if (!targetPhone || typeof targetPhone !== "string" || !targetPhone.trim()) {
      return NextResponse.json(
        { success: false, error: "Destination phone number (targetPhone) is required" },
        { status: 400 }
      );
    }

    const formattedToNumber = formatE164(targetPhone);
    if (!formattedToNumber.startsWith("+") || formattedToNumber.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid destination phone format: "${targetPhone}". Expected international format (e.g. +234803...)`,
        },
        { status: 400 }
      );
    }

    // 1. Strict Tenant DB Resolution
    const sql = await getTenantSql(tenantSlug);

    // 2. Fetch tenant telephony credentials strictly from dedicated database
    const configRows = await sql`
      SELECT 
        tenant_slug,
        COALESCE(agent_name, 'Ofia Executive Voice Assistant') AS agent_name,
        COALESCE(telephony_provider, 'VOICEBIP') AS telephony_provider,
        COALESCE(voicebip_api_key, '') AS voicebip_api_key,
        COALESCE(voicebip_api_secret, '') AS voicebip_api_secret,
        COALESCE(voicebip_workspace_id, '') AS voicebip_workspace_id,
        COALESCE(voicebip_agent_id, '') AS voicebip_agent_id,
        COALESCE(from_phone_number, '') AS from_phone_number,
        COALESCE(voicebip_sip_endpoint, 'sip.voicebip.com:5060') AS voicebip_sip_endpoint,
        opening_hook,
        value_proposition
      FROM crm_voice_config
      WHERE LOWER(tenant_slug) = ${tenantSlug}
      LIMIT 1;
    `;

    const voiceConfig = configRows[0];
    if (!voiceConfig) {
      return NextResponse.json(
        {
          success: false,
          error: `No voice configuration found in database for tenant "${tenantSlug}". Please configure Voice Settings in ERP.`,
        },
        { status: 400 }
      );
    }

    const selectedProvider = (provider || voiceConfig.telephony_provider || "VOICEBIP").toUpperCase().trim();

    if (selectedProvider === "VOICEBIP") {
      const apiKey = (voiceConfig.voicebip_api_key || "").trim();
      const apiSecret = (voiceConfig.voicebip_api_secret || "").trim();
      const workspaceId = (voiceConfig.voicebip_workspace_id || "").trim();
      const agentId = (voiceConfig.voicebip_agent_id || "").trim();
      const fromNumber = formatE164((voiceConfig.from_phone_number || "").trim());

      // Validate that all required tenant credentials exist in their database record
      const missingFields: string[] = [];
      if (!apiKey) missingFields.push("API Key");
      if (!apiSecret) missingFields.push("API Secret");
      if (!workspaceId) missingFields.push("Workspace ID");
      if (!agentId) missingFields.push("Agent ID");
      if (!fromNumber) missingFields.push("Outbound Caller ID Number");

      if (missingFields.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Voicebip credentials incomplete in database for tenant "${tenantSlug}". Missing: ${missingFields.join(", ")}. Please configure them in Voice Outreach Settings.`,
          },
          { status: 400 }
        );
      }

      // 3. Initiate real outbound PSTN call via Voicebip API
      const voicebipRes = await fetch("https://api.voicebip.com/v1/calls", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "X-Voicebip-Secret": apiSecret,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspace_id: workspaceId,
          agent_id: agentId,
          from_number: fromNumber,
          to_number: formattedToNumber,
        }),
      });

      const responseText = await voicebipRes.text();
      let voicebipData: any = {};
      try {
        voicebipData = JSON.parse(responseText);
      } catch {
        voicebipData = { raw: responseText };
      }

      if (!voicebipRes.ok) {
        console.error("[Voicebip Outbound] API call failed:", voicebipRes.status, responseText);
        return NextResponse.json(
          {
            success: false,
            error:
              voicebipData.message ||
              voicebipData.error ||
              `Voicebip API error (HTTP ${voicebipRes.status}): ${responseText}`,
            status: voicebipRes.status,
          },
          { status: voicebipRes.status >= 400 && voicebipRes.status < 500 ? 400 : 502 }
        );
      }

      const callId = voicebipData.call_id || `call_${Date.now()}`;
      const callStatus = voicebipData.status || "queued";

      // 4. Ensure crm_calls table has mandatory isolation and sid columns
      await sql`ALTER TABLE crm_calls ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';`;
      await sql`ALTER TABLE crm_calls ADD COLUMN IF NOT EXISTS telephony_sid VARCHAR(191);`;

      const internalCallId = `CALL-VB-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await sql`
        INSERT INTO crm_calls (
          id, tenant_slug, tenant_id, lead_id, contact_name, company, phone_number,
          rep_name, rep_email, direction, outcome, duration_seconds, notes,
          telephony_sid, is_ai, call_date, created_at, updated_at
        ) VALUES (
          ${internalCallId},
          ${tenantSlug},
          '',
          ${leadId || ''},
          ${targetContact || 'Corporate Prospect'},
          ${targetCompany || ''},
          ${formattedToNumber},
          ${voiceConfig.agent_name || 'Ofia Voice Assistant'},
          'voice-agent@ofia.ng',
          'OUTBOUND',
          'DIALING',
          0,
          ${`Live Voicebip call initiated to ${formattedToNumber} from ${fromNumber}. Status: ${callStatus}. Call ID: ${callId}`},
          ${callId},
          true,
          NOW(),
          NOW(),
          NOW()
        );
      `;

      return NextResponse.json({
        success: true,
        callId,
        internalId: internalCallId,
        status: callStatus,
        fromNumber,
        toNumber: formattedToNumber,
        provider: "VOICEBIP",
        message: `Voicebip call queued. Calling ${formattedToNumber} from ${fromNumber}. Your recipient phone will ring shortly.`,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: `Provider "${selectedProvider}" direct outbound dial is not supported. Please select Voicebip or In-Browser Simulator.`,
      },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[Telephony Outbound] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to dispatch outbound call: " + err.message },
      { status: 500 }
    );
  }
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

    const { searchParams } = new URL(request.url);
    const callId = searchParams.get("callId") || searchParams.get("call_id");

    if (!callId) {
      return NextResponse.json({ success: false, error: "callId is required" }, { status: 400 });
    }

    const sql = await getTenantSql(tenantSlug);
    const configRows = await sql`
      SELECT voicebip_api_key, voicebip_api_secret
      FROM crm_voice_config
      WHERE LOWER(tenant_slug) = ${tenantSlug}
      LIMIT 1;
    `;

    const cfg = configRows[0];
    if (!cfg?.voicebip_api_key || !cfg?.voicebip_api_secret) {
      return NextResponse.json(
        { success: false, error: "Voicebip credentials not found in tenant database" },
        { status: 400 }
      );
    }

    const res = await fetch(`https://api.voicebip.com/v1/calls/${encodeURIComponent(callId)}`, {
      headers: {
        "Authorization": `Bearer ${cfg.voicebip_api_key}`,
        "X-Voicebip-Secret": cfg.voicebip_api_secret,
      },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ success: res.ok, call: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
