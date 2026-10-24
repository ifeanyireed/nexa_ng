import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getTenantSql } from "@/lib/tenant-db-resolver";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("monnify-signature");
    const secretKey = process.env.MONNIFY_SECRET_KEY || "mock_monnify_secret_key";

    // SHA-512 Hash validation
    const computedHash = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
    if (process.env.NODE_ENV === "production" && signature !== computedHash) {
      return NextResponse.json({ error: "Invalid Monnify transaction hash" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventData = payload.eventData;

    if (payload.eventType === "SUCCESSFUL_TRANSACTION" && eventData) {
      const paymentReference = eventData.paymentReference || eventData.transactionReference;
      const rawTenant =
        eventData.metaData?.tenantSlug ||
        eventData.metaData?.tenant ||
        request.nextUrl.searchParams.get("tenant");

      if (!rawTenant) {
        return NextResponse.json(
          { error: "tenantSlug is required in metadata for strict multi-tenant isolation" },
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
          WHERE (order_number = ${paymentReference} OR id = ${paymentReference})
            AND LOWER(tenant_slug) = ${tenantSlug}
          LIMIT 1
        `;

        const ord = orders.length > 0 ? orders[0] : null;
        const rawAmount = ord ? Number(ord.raw_amount) : (Number(eventData.amountPaid || eventData.payableAmount || 0));
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
          WHERE (order_number = ${paymentReference} OR id = ${paymentReference})
            AND LOWER(tenant_slug) = ${tenantSlug}
        `;

        // 3. Update dedicated tenant wallet
        const walletId = `wal-${tenantSlug}`;
        const txId = `tx-mon-${Date.now().toString().slice(-8)}`;

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
              ${txId}, ${tenantSlug}, 'ESCROW_HOLD', ${mAmount}, ${paymentReference},
              ${`Monnify payment of ₦${rawAmount.toLocaleString()} received and held in Ofia Escrow Vault pending delivery confirmation.`},
              'MONNIFY', TRUE, 'SUCCESS', NOW()
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
              ${txId}, ${tenantSlug}, 'SALE_CREDIT', ${mAmount}, ${paymentReference},
              ${`Monnify payment cleared. Instant 98.5% split (₦${mAmount.toLocaleString()}) credited to available balance for anytime withdrawal.`},
              'MONNIFY', FALSE, 'SUCCESS', NOW()
            )
          `;
        }
      }

      return NextResponse.json({ status: true, reference: paymentReference, tenantSlug });
    }

    return NextResponse.json({ status: true, received: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Monnify processing failed: " + err.message },
      { status: 500 }
    );
  }
}
