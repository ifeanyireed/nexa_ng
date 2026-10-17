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
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json({
      configured: data.has_anthropic_key || data.has_openai_key || data.has_gemini_key,
      settings: {
        anthropicKey: data.anthropic_key_masked || "",
        openaiKey: data.openai_key_masked || "",
        geminiKey: data.gemini_key_masked || "",
        whatsappKey: data.whatsapp_phone_number_id || "",
        groqKey: data.groq_key_masked || "",
        deepseekKey: data.deepseek_key_masked || "",
        hasAnthropicKey: Boolean(data.has_anthropic_key),
        hasOpenaiKey: Boolean(data.has_openai_key),
        hasGeminiKey: Boolean(data.has_gemini_key),
        hasWhatsappKey: Boolean(data.has_whatsapp_token),
        hasGroqKey: Boolean(data.has_groq_key),
        hasDeepseekKey: Boolean(data.has_deepseek_key),
        aiDeliveryMode: data.email_provider || "smtp",
        useTenantKeysOnly: Boolean(data.use_tenant_keys_only),
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

    // 2. Save BYOK keys
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
