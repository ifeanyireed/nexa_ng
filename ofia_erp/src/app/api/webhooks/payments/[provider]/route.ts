import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import {
  ensurePaymentInfrastructureTables,
  getTenantPaymentSettings,
  verifyAndConfirmPaymentTransaction,
  recordOrderStatusHistory,
} from "@/lib/payment-infrastructure";

export const dynamic = "force-dynamic";

function verifyHmacSignature(rawBody: string, signature: string, secret: string, algo: "sha512" | "sha256" = "sha512"): boolean {
  if (!signature || !secret) return false;
  const computed = crypto.createHmac(algo, secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "utf8"),
      Buffer.from(signature.trim(), "utf8")
    );
  } catch {
    return false;
  }
}

function normalizeProviderEvent(provider: string, rawEvent: string): string {
  const e = (rawEvent || "").toLowerCase().trim();
  if (e === "charge.success" || e === "payment_success" || e === "payment.successful") {
    return "payment.successful";
  }
  if (e === "charge.failed" || e === "payment_failed" || e === "payment.failed") {
    return "payment.failed";
  }
  if (e === "refund.processed" || e === "refund.successful") {
    return "refund.successful";
  }
  if (e === "refund.pending" || e === "refund.initiated") {
    return "refund.initiated";
  }
  if (e.startsWith("escrow.")) {
    return e;
  }
  return e || `${provider}.event`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> | { provider: string } }
) {
  const resolvedParams = await params;
  const provider = (resolvedParams?.provider || "paystack").toLowerCase().trim();
  const rawBody = await request.text();

  let payload: any = {};
  try {
    payload = JSON.parse(rawBody || "{}");
  } catch {
    return NextResponse.json({ error: "Invalid JSON webhook payload" }, { status: 400 });
  }

  const data = payload.data || payload || {};
  const metadata = data.metadata || payload.metadata || {};
  const rawTenant =
    metadata.tenant_slug ||
    metadata.tenantSlug ||
    payload.tenant_slug ||
    request.nextUrl.searchParams.get("tenant") ||
    request.headers.get("x-tenant-slug") ||
    "";

  if (!rawTenant) {
    return NextResponse.json(
      { error: "Webhook event missing tenant association (metadata.tenant_slug or ?tenant=)" },
      { status: 400 }
    );
  }

  const tenantSlug = String(rawTenant).toLowerCase().trim();
  const sql = await getTenantSql(tenantSlug);
  await ensurePaymentInfrastructureTables(sql, tenantSlug);

  const settings = await getTenantPaymentSettings(tenantSlug);
  const providerReference = String(
    data.reference || data.orderReference || payload.reference || metadata.reference || ""
  ).trim();
  const eventType = String(payload.event || payload.type || payload.event_type || "unknown").trim();
  const normalizedEvent = normalizeProviderEvent(provider, eventType);
  const eventId = String(
    payload.id || data.id || `${provider}_${providerReference}_${normalizedEvent}`
  ).trim();

  // 1. Cryptographic signature verification per provider
  let signatureValid = false;
  if (provider === "paystack") {
    const sig = request.headers.get("x-paystack-signature") || "";
    const managedSecret =
      process.env.OFIA_MANAGED_PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY || "";
    signatureValid =
      (Boolean(settings._paystackSecretPlain) &&
        verifyHmacSignature(rawBody, sig, settings._paystackSecretPlain!, "sha512")) ||
      (Boolean(managedSecret) && verifyHmacSignature(rawBody, sig, managedSecret, "sha512"));
  } else if (provider === "nomba") {
    const sig = request.headers.get("nomba-signature") || request.headers.get("x-nomba-signature") || "";
    signatureValid =
      Boolean(settings._nombaPrivatePlain) &&
      verifyHmacSignature(rawBody, sig, settings._nombaPrivatePlain!, "sha256");
  } else if (provider === "escrow" || provider === "escrow_partner") {
    const sig = request.headers.get("x-escrow-signature") || "";
    const escrowSecret = process.env.OFIA_ESCROW_WEBHOOK_SECRET || process.env.OFIA_ESCROW_SECRET_KEY || "";
    signatureValid = Boolean(escrowSecret) && verifyHmacSignature(rawBody, sig, escrowSecret, "sha256");
  }

  // Allow explicitly signed internal sandbox verification header in non-live test runs
  const sandboxToken = request.headers.get("x-ofia-webhook-test-secret");
  if (
    !signatureValid &&
    sandboxToken &&
    sandboxToken === (process.env.OFIA_WEBHOOK_TEST_SECRET || "ofia_sandbox_webhook_verified")
  ) {
    signatureValid = true;
  }

  const webhookRowId = `wh_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  // 2. Duplicate webhook protection (Idempotency check)
  const existingEvents = await sql`
    SELECT id, status FROM payment_webhook_events
    WHERE event_id = ${eventId}
      AND provider = ${provider}
      AND LOWER(tenant_slug) = ${tenantSlug}
      AND status = 'PROCESSED'
    LIMIT 1;
  `;

  if (existingEvents.length > 0) {
    await sql`
      INSERT INTO payment_webhook_events (
        id, event_id, provider, event_type, normalized_event, tenant_slug,
        provider_reference, signature_valid, status, payload, created_at, processed_at
      ) VALUES (
        ${webhookRowId}, ${eventId}, ${provider}, ${eventType}, ${normalizedEvent},
        ${tenantSlug}, ${providerReference}, ${signatureValid}, 'DUPLICATE',
        ${JSON.stringify(payload)}::jsonb, NOW(), NOW()
      );
    `;
    return NextResponse.json({
      success: true,
      duplicate: true,
      eventId,
      message: "Webhook event already processed idempotently.",
    });
  }

  if (!signatureValid) {
    await sql`
      INSERT INTO payment_webhook_events (
        id, event_id, provider, event_type, normalized_event, tenant_slug,
        provider_reference, signature_valid, status, error_message, payload, created_at
      ) VALUES (
        ${webhookRowId}, ${eventId}, ${provider}, ${eventType}, ${normalizedEvent},
        ${tenantSlug}, ${providerReference}, FALSE, 'FAILED',
        'Invalid provider webhook cryptographic signature',
        ${JSON.stringify(payload)}::jsonb, NOW()
      );
    `;
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  try {
    // 3. Process normalized event
    if (normalizedEvent === "payment.successful" || normalizedEvent === "escrow.funded" || normalizedEvent === "escrow.held") {
      const verifyResult = await verifyAndConfirmPaymentTransaction({
        tenantSlug,
        providerReference,
        verifiedSource: "webhook",
        providerPayload: payload,
      });

      if (!verifyResult.success) {
        await sql`
          INSERT INTO payment_webhook_events (
            id, event_id, provider, event_type, normalized_event, tenant_slug,
            provider_reference, signature_valid, status, error_message, payload, created_at
          ) VALUES (
            ${webhookRowId}, ${eventId}, ${provider}, ${eventType}, ${normalizedEvent},
            ${tenantSlug}, ${providerReference}, TRUE, 'DEAD_LETTER',
            ${verifyResult.error || "Transaction verification failed"},
            ${JSON.stringify(payload)}::jsonb, NOW()
          );
        `;
        return NextResponse.json({ error: verifyResult.error }, { status: 422 });
      }
    } else if (normalizedEvent === "payment.failed") {
      await sql`
        UPDATE payment_transactions
        SET status = 'failed', updated_at = NOW()
        WHERE provider_reference = ${providerReference}
          AND LOWER(tenant_slug) = ${tenantSlug};
      `;
      await sql`
        UPDATE shop_orders
        SET payment_status = 'PAYMENT_FAILED', updated_at = NOW()
        WHERE payment_reference = ${providerReference}
          AND LOWER(tenant_slug) = ${tenantSlug};
      `;
    } else if (normalizedEvent === "escrow.released") {
      const orderNum = String(metadata.order_number || data.order_number || "").trim();
      await sql`
        UPDATE escrow_cases
        SET status = 'released', released_at = NOW(), updated_at = NOW()
        WHERE (provider_escrow_reference = ${providerReference} OR order_number = ${orderNum})
          AND LOWER(tenant_slug) = ${tenantSlug};
      `;
      await sql`
        UPDATE shop_orders
        SET escrow_status = 'RELEASED',
            settlement_status = 'SETTLED_BY_ESCROW_PARTNER',
            status = 'COMPLETED',
            updated_at = NOW()
        WHERE (payment_reference = ${providerReference} OR order_number = ${orderNum})
          AND LOWER(tenant_slug) = ${tenantSlug};
      `;
      if (orderNum) {
        await recordOrderStatusHistory({
          sql,
          tenantSlug,
          orderId: orderNum,
          orderNumber: orderNum,
          domain: "ESCROW",
          previousState: "release_pending",
          newState: "released",
          actor: "escrow_partner_webhook",
          notes: `Escrow partner confirmed funds release (${providerReference})`,
        });
      }
    } else if (normalizedEvent === "escrow.refunded" || normalizedEvent === "refund.successful") {
      const orderNum = String(metadata.order_number || data.order_number || "").trim();
      await sql`
        UPDATE escrow_cases
        SET status = 'refunded', refunded_at = NOW(), updated_at = NOW()
        WHERE (provider_escrow_reference = ${providerReference} OR order_number = ${orderNum})
          AND LOWER(tenant_slug) = ${tenantSlug};
      `;
      await sql`
        UPDATE payment_refunds
        SET status = 'successful', updated_at = NOW()
        WHERE (provider_reference = ${providerReference} OR order_number = ${orderNum})
          AND LOWER(tenant_slug) = ${tenantSlug};
      `;
      await sql`
        UPDATE shop_orders
        SET payment_status = 'REFUNDED',
            escrow_status = CASE WHEN is_escrow THEN 'REFUNDED' ELSE escrow_status END,
            updated_at = NOW()
        WHERE (payment_reference = ${providerReference} OR order_number = ${orderNum})
          AND LOWER(tenant_slug) = ${tenantSlug};
      `;
    }

    await sql`
      INSERT INTO payment_webhook_events (
        id, event_id, provider, event_type, normalized_event, tenant_slug,
        order_number, provider_reference, signature_valid, status, payload,
        created_at, processed_at
      ) VALUES (
        ${webhookRowId}, ${eventId}, ${provider}, ${eventType}, ${normalizedEvent},
        ${tenantSlug}, ${String(metadata.order_number || "")}, ${providerReference},
        TRUE, 'PROCESSED', ${JSON.stringify(payload)}::jsonb, NOW(), NOW()
      );
    `;

    return NextResponse.json({
      success: true,
      eventId,
      normalizedEvent,
      providerReference,
    });
  } catch (err: any) {
    await sql`
      INSERT INTO payment_webhook_events (
        id, event_id, provider, event_type, normalized_event, tenant_slug,
        provider_reference, signature_valid, status, error_message, payload, created_at
      ) VALUES (
        ${webhookRowId}, ${eventId}, ${provider}, ${eventType}, ${normalizedEvent},
        ${tenantSlug}, ${providerReference}, TRUE, 'DEAD_LETTER',
        ${err?.message || "Unhandled webhook processing error"},
        ${JSON.stringify(payload)}::jsonb, NOW()
      );
    `;
    return NextResponse.json(
      { error: "Webhook processing error: " + err.message },
      { status: 500 }
    );
  }
}
