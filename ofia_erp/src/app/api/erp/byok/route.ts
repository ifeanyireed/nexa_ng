import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const AI_BASE =
  process.env.AI_SERVICE_URL ||
  process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
  "https://ofia-ai-service.onrender.com";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantSlug =
    searchParams.get("tenant") ||
    searchParams.get("tenant_slug") ||
    searchParams.get("slug") ||
    request.headers.get("x-tenant-slug") ||
    "";

  if (!tenantSlug) {
    return NextResponse.json({ error: "Tenant slug required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${AI_BASE}/api/v1/gtm/${encodeURIComponent(tenantSlug)}/settings`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json().catch(() => null);

    // Also fetch Voice Agent configuration
    const voiceRes = await fetch(`${AI_BASE}/api/v1/gtm/${encodeURIComponent(tenantSlug)}/voice/config`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    }).catch(() => null);
    const voiceData = voiceRes && voiceRes.ok ? await voiceRes.json().catch(() => null) : null;

    if (!res.ok && !voiceData) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json({
      configured: data?.has_anthropic_key || data?.has_openai_key || data?.has_gemini_key,
      settings: {
        anthropicKey: data?.anthropic_key_masked || "",
        openaiKey: data?.openai_key_masked || "",
        geminiKey: data?.gemini_key_masked || "",
        whatsappKey: data?.whatsapp_phone_number_id || "",
        groqKey: data?.groq_key_masked || "",
        deepseekKey: data?.deepseek_key_masked || "",
        hasAnthropicKey: Boolean(data?.has_anthropic_key),
        hasOpenaiKey: Boolean(data?.has_openai_key),
        hasGeminiKey: Boolean(data?.has_gemini_key),
        hasWhatsappKey: Boolean(data?.has_whatsapp_token),
        hasGroqKey: Boolean(data?.has_groq_key),
        hasDeepseekKey: Boolean(data?.has_deepseek_key),
        aiDeliveryMode: data?.email_provider || "smtp",
        useTenantKeysOnly: Boolean(data?.use_tenant_keys_only),
      },
      voiceConfig: voiceData || {
        agent_name: "Ofia Executive Voice Assistant",
        voice_id: "en-NG-Standard-A",
        model_name: "gemini-1.5-flash",
        ai_disclosure_enabled: true,
        ai_disclosure_text: "Hello, I am Ofia's automated executive assistant calling on behalf of Ofia Mobility.",
        max_duration_sec: 300,
        human_escalation_phone: "+2348000000000",
        opening_hook: "We help corporate teams in Lagos and Abuja streamline staff transportation with dedicated buses and real-time tracking.",
        value_proposition: "25-35% cost reduction on corporate transport with guaranteed standby replacement buses.",
        telephony_provider: "VOICEBIP",
        voicebip_api_key: "",
        voicebip_api_secret: "",
        voicebip_sip_endpoint: "sip.voicebip.com:5060",
        calling_hours_start: "09:00",
        calling_hours_end: "17:00",
        max_retries: 2,
        auto_whatsapp_deck: true,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "AI microservice connection error: " + err.message },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantSlug =
      body.tenantSlug ||
      body.tenant_slug ||
      request.headers.get("x-tenant-slug") ||
      "";

    if (!tenantSlug) {
      return NextResponse.json({ error: "Tenant slug required" }, { status: 400 });
    }

    // 1. Test channel action
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

    // 2. Save Voice Agent config if action === "save_voice" or voiceConfig is provided
    if (body.action === "save_voice" || body.voiceConfig) {
      const voicePayload = body.voiceConfig || body;
      const res = await fetch(`${AI_BASE}/api/v1/gtm/${encodeURIComponent(tenantSlug)}/voice/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voicePayload),
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json().catch(() => null);
      return NextResponse.json(data, { status: res.status });
    }

    // 3. Save BYOK keys
    const res = await fetch(`${AI_BASE}/api/v1/gtm/${encodeURIComponent(tenantSlug)}/settings/byok`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "AI microservice connection error: " + err.message },
      { status: 502 }
    );
  }
}
