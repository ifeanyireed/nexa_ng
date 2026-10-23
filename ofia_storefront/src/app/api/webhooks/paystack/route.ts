import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getTenantSql } from "@/lib/tenant-db-resolver";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY || "sk_test_mock_paystack_secret_key";

    // HMAC-SHA512 Signature verification
    const expectedHash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    const isAuthentic = signature === expectedHash;

    if (!isAuthentic && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Invalid cryptographic signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const data = payload.data;

    if (event === "charge.success") {
      const reference = data.reference;
      const rawTenant = data.metadata?.tenantSlug || data.metadata?.tenant || request.nextUrl.searchParams.get("tenant");

      if (!rawTenant) {
        return NextResponse.json(
          { error: "tenantSlug is required in transaction metadata for strict isolation" },
          { status: 400 }
        );
      }

      const tenantSlug = rawTenant.toLowerCase().trim();
      const sql = await getTenantSql(tenantSlug);

      if (sql) {
        // 1. Update order in PostgreSQL with strict tenant partition
        await sql`
          UPDATE shop_orders
          SET payment_status = 'PAID',
              status = 'IN_PREPARATION',
              updated_at = NOW()
          WHERE (order_number = ${reference} OR id = ${reference})
            AND LOWER(tenant_slug) = ${tenantSlug}
        `;

        // 2. Log webhook receipt in audit table
        const notifId = `NTF-PAY-${Date.now().toString().slice(-6)}`;
        await sql`
          INSERT INTO shop_order_notifications (
            id, tenant_slug, order_id, order_number, channel,
            recipient, status_event, subject, message, delivery_status,
            tracking_url, created_at, updated_at
          ) VALUES (
            ${notifId}, ${tenantSlug}, ${reference}, ${reference}, 'PAYSTACK_WEBHOOK',
            ${data.customer?.email || "customer@paystack.com"}, 'PAYMENT_VERIFIED',
            'Paystack Escrow Settlement Confirmed',
            ${`Charge of ₦${(data.amount / 100).toLocaleString()} successfully settled into escrow vault.`},
            'SENT', ${`https://${tenantSlug}.ofia.ng/order-tracking?ref=${encodeURIComponent(reference)}`},
            NOW(), NOW()
          )
        `;
      }

      return NextResponse.json({ status: true, reference, tenantSlug, event: "charge.success" });
    }

    return NextResponse.json({ status: true, received: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Webhook processing failed: " + err.message },
      { status: 500 }
    );
  }
}
