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
        // 1. Fetch order details to check opt-in escrow status
        const orders = await sql`
          SELECT id, order_number, raw_amount, merchant_amount, platform_fee, is_escrow
          FROM shop_orders
          WHERE (order_number = ${reference} OR id = ${reference})
            AND LOWER(tenant_slug) = ${tenantSlug}
          LIMIT 1
        `;

        const ord = orders.length > 0 ? orders[0] : null;
        const rawAmount = ord ? Number(ord.raw_amount) : (Number(data.amount) / 100);
        const pFee = ord ? Number(ord.platform_fee) : Math.round(rawAmount * 0.015 * 100) / 100;
        const mAmount = ord ? Number(ord.merchant_amount) : Math.max(0, rawAmount - pFee);
        const isEscrow = ord ? Boolean(ord.is_escrow) : false;

        // 2. Update order in PostgreSQL with strict tenant partition
        await sql`
          UPDATE shop_orders
          SET payment_status = 'PAID',
              status = 'IN_PREPARATION',
              escrow_status = ${isEscrow ? 'HELD' : 'NONE'},
              settlement_status = ${isEscrow ? 'HELD_ESCROW' : 'AVAILABLE'},
              merchant_amount = ${mAmount},
              platform_fee = ${pFee},
              updated_at = NOW()
          WHERE (order_number = ${reference} OR id = ${reference})
            AND LOWER(tenant_slug) = ${tenantSlug}
        `;

        // 3. Update dedicated tenant wallet
        const walletId = `wal-${tenantSlug}`;
        const txId = `tx-pay-${Date.now().toString().slice(-8)}`;

        if (isEscrow) {
          await sql`
            INSERT INTO tenant_wallets (
              id, tenant_slug, available_balance, escrow_balance, total_withdrawn, currency, created_at, updated_at
            ) VALUES (
              ${walletId}, ${tenantSlug}, 0, ${mAmount}, 0, 'NGN', NOW(), NOW()
            )
            ON CONFLICT (tenant_slug) DO UPDATE SET
              escrow_balance = tenant_wallets.escrow_balance + ${mAmount},
              updated_at = NOW()
          `;

          await sql`
            INSERT INTO tenant_wallet_transactions (
              id, tenant_slug, type, amount, reference, description, channel, is_escrow, status, created_at
            ) VALUES (
              ${txId}, ${tenantSlug}, 'ESCROW_HOLD', ${mAmount}, ${reference},
              ${`Charge of ₦${rawAmount.toLocaleString()} received via Paystack and locked in Ofia Escrow Vault pending delivery confirmation.`},
              'PAYSTACK', TRUE, 'SUCCESS', NOW()
            )
          `;
        } else {
          await sql`
            INSERT INTO tenant_wallets (
              id, tenant_slug, available_balance, escrow_balance, total_withdrawn, currency, created_at, updated_at
            ) VALUES (
              ${walletId}, ${tenantSlug}, ${mAmount}, 0, 0, 'NGN', NOW(), NOW()
            )
            ON CONFLICT (tenant_slug) DO UPDATE SET
              available_balance = tenant_wallets.available_balance + ${mAmount},
              updated_at = NOW()
          `;

          await sql`
            INSERT INTO tenant_wallet_transactions (
              id, tenant_slug, type, amount, reference, description, channel, is_escrow, status, created_at
            ) VALUES (
              ${txId}, ${tenantSlug}, 'SALE_CREDIT', ${mAmount}, ${reference},
              ${`Paystack charge cleared. Instant 98.5% split (₦${mAmount.toLocaleString()}) credited to available balance for anytime withdrawal.`},
              'PAYSTACK', FALSE, 'SUCCESS', NOW()
            )
          `;
        }

        // 4. Log webhook receipt in audit table
        const notifId = `NTF-PAY-${Date.now().toString().slice(-6)}`;
        await sql`
          INSERT INTO shop_order_notifications (
            id, tenant_slug, order_id, order_number, channel,
            recipient, status_event, subject, message, delivery_status,
            tracking_url, created_at, updated_at
          ) VALUES (
            ${notifId}, ${tenantSlug}, ${reference}, ${reference}, 'PAYSTACK_WEBHOOK',
            ${data.customer?.email || "customer@paystack.com"}, 'PAYMENT_VERIFIED',
            ${isEscrow ? 'Paystack Escrow Settlement Confirmed' : 'Payment Cleared & Direct Split Credited'},
            ${isEscrow
              ? `Charge of ₦${rawAmount.toLocaleString()} successfully settled into escrow vault pending recipient delivery confirmation.`
              : `Charge of ₦${rawAmount.toLocaleString()} cleared. ₦${mAmount.toLocaleString()} credited to your available balance for anytime withdrawal.`},
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
