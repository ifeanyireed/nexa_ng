import { NextResponse } from "next/server";
import { processDirectEngagement } from "@/lib/crm-email-engagement";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

/**
 * Brevo (Sendinblue) Webhook Controller.
 * Handles webhook health checks (GET) and event callbacks (POST) for:
 * - opens (opened, unique_opened, first_opening)
 * - clicks (click, clicks)
 * - bounces (soft_bounce, hard_bounce, blocked, invalid_email)
 * - unsubscribes (unsubscribed, spam, complaint)
 *
 * Supports multi-tenant routing via:
 * 1. Embedded custom header "X-Mailin-custom" containing { tenantSlug, blastId, recipientId }
 * 2. URL search parameter ?tenant=<tenant_slug>
 * 3. Request header 'x-tenant-slug'
 * 4. Subdomain host routing (<tenant>.ofia.ng)
 */

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tenant = url.searchParams.get("tenant") || getValidatedTenantSlug(request) || "system";

    return NextResponse.json(
      {
        success: true,
        service: "ofia_crm_brevo_webhook",
        status: "active",
        tenant,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ success: true, service: "ofia_crm_brevo_webhook" }, { status: 200 });
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);

  // Optional webhook secret verification
  const webhookSecret = process.env.BREVO_WEBHOOK_SECRET;
  if (webhookSecret) {
    const authHeader = request.headers.get("authorization") || "";
    const bearerToken = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    const token =
      url.searchParams.get("secret") ||
      request.headers.get("x-webhook-secret") ||
      request.headers.get("x-brevo-token") ||
      request.headers.get("x-api-key") ||
      bearerToken;

    if (token !== webhookSecret) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    console.warn("[Brevo Webhook] Invalid JSON body:", err);
    return NextResponse.json({ success: true, processed: 0, error: "Invalid JSON" }, { status: 200 });
  }

  const events: any[] = Array.isArray(body) ? body : body ? [body] : [];
  if (events.length === 0) {
    return NextResponse.json({ success: true, processed: 0 }, { status: 200 });
  }

  const fallbackTenant =
    url.searchParams.get("tenant") ||
    url.searchParams.get("tenant_slug") ||
    getValidatedTenantSlug(request);

  let processedCount = 0;

  for (const event of events) {
    try {
      // 1. Extract custom tracking metadata (X-Mailin-custom)
      let customData: any = {};
      const rawCustom = event["X-Mailin-custom"] || event.custom || event["x-mailin-custom"];
      if (typeof rawCustom === "string") {
        try {
          customData = JSON.parse(rawCustom);
        } catch {
          // If not valid JSON, treat as raw string
          customData = { raw: rawCustom };
        }
      } else if (typeof rawCustom === "object" && rawCustom !== null) {
        customData = rawCustom;
      }

      // 2. Resolve tenant slug
      const tenantSlug = (
        customData.tenantSlug ||
        customData.tenant ||
        fallbackTenant ||
        ""
      ).toLowerCase().trim();

      if (!tenantSlug) {
        console.warn("[Brevo Webhook] Skipped event without tenant context:", event.event, event.email);
        continue;
      }

      // 3. Resolve blast ID from custom metadata, tags, or query param
      let blastId = (customData.blastId || "").trim();
      if (!blastId) {
        const rawTag = event.tag || (Array.isArray(event.tags) ? event.tags[0] : "");
        if (typeof rawTag === "string" && rawTag.startsWith("blast_")) {
          blastId = rawTag.replace(/^blast_/, "").trim();
        }
      }
      if (!blastId) {
        blastId = (url.searchParams.get("blastId") || "").trim();
      }

      const recipientId = (customData.recipientId || "").trim();
      const email = (event.email || customData.email || "").toLowerCase().trim();
      const rawEvent = (event.event || "").toLowerCase().trim();

      // 4. Map Brevo event types
      let eventType: "OPEN" | "CLICK" | "BOUNCE" | "UNSUBSCRIBE" | null = null;
      let targetUrl = "";
      let bounceReason = "";

      if (
        rawEvent === "opened" ||
        rawEvent === "unique_opened" ||
        rawEvent === "first_opening" ||
        rawEvent === "proxy_open"
      ) {
        eventType = "OPEN";
      } else if (rawEvent === "click" || rawEvent === "clicks") {
        eventType = "CLICK";
        targetUrl = event.link || event.url || "";
      } else if (
        rawEvent === "soft_bounce" ||
        rawEvent === "hard_bounce" ||
        rawEvent === "blocked" ||
        rawEvent === "invalid_email"
      ) {
        eventType = "BOUNCE";
        bounceReason = event.reason || event.description || rawEvent;
      } else if (
        rawEvent === "unsubscribed" ||
        rawEvent === "unsubscribe" ||
        rawEvent === "spam" ||
        rawEvent === "complaint"
      ) {
        eventType = "UNSUBSCRIBE";
      }

      if (!eventType) {
        // Events like 'delivered', 'request', 'deferred' don't alter open/click metrics
        continue;
      }

      // 5. Persist engagement metrics directly to tenant database
      const ok = await processDirectEngagement({
        tenantSlug,
        blastId: blastId || undefined,
        recipientId: recipientId || undefined,
        email: email || undefined,
        eventType,
        targetUrl,
        bounceReason,
      });

      if (ok) processedCount++;
    } catch (eventErr: any) {
      console.error("[Brevo Webhook] Error processing item:", eventErr.message);
    }
  }

  return NextResponse.json(
    {
      success: true,
      received: events.length,
      processed: processedCount,
    },
    { status: 200 }
  );
}
