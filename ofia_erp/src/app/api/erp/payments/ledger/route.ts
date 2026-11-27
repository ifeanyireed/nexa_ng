import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import {
  ensurePaymentInfrastructureTables,
  getTenantPaymentSettings,
  recordOrderStatusHistory,
} from "@/lib/payment-infrastructure";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawTenant =
      searchParams.get("tenant") ||
      searchParams.get("slug") ||
      request.headers.get("x-tenant-slug") ||
      getValidatedTenantSlug(request);

    if (!rawTenant || rawTenant === "default") {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const tenantSlug = rawTenant.toLowerCase().trim();
    const sql = await getTenantSql(tenantSlug);
    await ensurePaymentInfrastructureTables(sql, tenantSlug);

    const [transactions, settlements, refunds, escrowCases, disputes, webhookEvents] =
      await Promise.all([
        sql`
          SELECT * FROM payment_transactions
          WHERE LOWER(tenant_slug) = ${tenantSlug}
          ORDER BY created_at DESC
          LIMIT 200;
        `,
        sql`
          SELECT * FROM merchant_settlements
          WHERE LOWER(tenant_slug) = ${tenantSlug}
          ORDER BY created_at DESC
          LIMIT 100;
        `,
        sql`
          SELECT * FROM payment_refunds
          WHERE LOWER(tenant_slug) = ${tenantSlug}
          ORDER BY created_at DESC
          LIMIT 100;
        `,
        sql`
          SELECT * FROM escrow_cases
          WHERE LOWER(tenant_slug) = ${tenantSlug}
          ORDER BY created_at DESC
          LIMIT 100;
        `,
        sql`
          SELECT * FROM escrow_disputes
          WHERE LOWER(tenant_slug) = ${tenantSlug}
          ORDER BY created_at DESC
          LIMIT 100;
        `,
        sql`
          SELECT id, event_id, provider, event_type, normalized_event, order_number,
                 provider_reference, signature_valid, status, error_message, created_at, processed_at
          FROM payment_webhook_events
          WHERE LOWER(tenant_slug) = ${tenantSlug}
          ORDER BY created_at DESC
          LIMIT 50;
        `,
      ]);

    // Compute Part I Section 14 Summary Cards (strictly separating standard/managed settlement from escrow custody)
    let totalSales = 0;
    let successfulPayments = 0;
    let pendingPayments = 0;
    let failedPayments = 0;
    let paymentFees = 0;

    for (const tx of transactions) {
      const gross = Number(tx.gross_amount || 0);
      const fees =
        Number(tx.provider_fee || 0) +
        Number(tx.ofia_fee || 0) +
        Number(tx.protection_fee || 0);
      if (tx.status === "successful") {
        totalSales += gross;
        successfulPayments += gross;
        paymentFees += fees;
      } else if (tx.status === "pending" || tx.status === "processing") {
        pendingPayments += gross;
      } else if (tx.status === "failed") {
        failedPayments += gross;
      }
    }

    let pendingSettlements = 0;
    let settledFunds = 0;
    for (const stl of settlements) {
      const net = Number(stl.net_amount || 0);
      if (stl.status === "settled") {
        settledFunds += net;
      } else if (stl.status === "pending") {
        pendingSettlements += net;
      }
    }

    let refundsTotal = 0;
    for (const r of refunds) {
      if (r.status === "successful" || r.status === "pending") {
        refundsTotal += Number(r.amount || 0);
      }
    }

    let escrowFundsHeld = 0;
    let escrowReleaseEligible = 0;
    let escrowFundsReleased = 0;
    let disputedEscrowFunds = 0;

    for (const esc of escrowCases) {
      const net = Number(esc.merchant_net_amount || esc.gross_amount || 0);
      if (
        esc.status === "funded" ||
        esc.status === "held" ||
        esc.status === "awaiting_fulfilment" ||
        esc.status === "awaiting_buyer_confirmation"
      ) {
        escrowFundsHeld += net;
      } else if (esc.status === "release_eligible" || esc.status === "release_pending") {
        escrowReleaseEligible += net;
      } else if (esc.status === "released") {
        escrowFundsReleased += net;
      } else if (esc.status === "disputed") {
        disputedEscrowFunds += net;
      }
    }

    return NextResponse.json({
      success: true,
      tenantSlug,
      summary: {
        totalSales,
        successfulPayments,
        pendingPayments,
        failedPayments,
        pendingSettlements,
        settledFunds,
        paymentFees,
        refunds: refundsTotal,
        escrowFundsHeld,
        escrowReleaseEligible,
        escrowFundsReleased,
        disputedEscrowFunds,
        currency: "NGN",
      },
      transactions,
      settlements,
      refunds,
      escrowCases,
      disputes,
      webhookEvents,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to load financial ledger: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawTenant =
      body.tenantSlug ||
      body.tenant ||
      request.headers.get("x-tenant-slug") ||
      getValidatedTenantSlug(request, body);

    if (!rawTenant || rawTenant === "default") {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const tenantSlug = String(rawTenant).toLowerCase().trim();
    const action = String(body.action || "").toUpperCase().trim();
    const sql = await getTenantSql(tenantSlug);
    await ensurePaymentInfrastructureTables(sql, tenantSlug);

    if (action === "INITIATE_REFUND") {
      const providerReference = String(body.providerReference || "").trim();
      const reason = String(body.reason || "Merchant-initiated refund").trim();

      const txRows = await sql`
        SELECT * FROM payment_transactions
        WHERE provider_reference = ${providerReference}
          AND LOWER(tenant_slug) = ${tenantSlug}
        LIMIT 1;
      `;

      if (!txRows || txRows.length === 0) {
        return NextResponse.json(
          { success: false, error: `Transaction '${providerReference}' not found` },
          { status: 404 }
        );
      }

      const tx = txRows[0];
      const refundAmount = Number(body.amount || tx.gross_amount || 0);
      const refundId = `ref_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      let providerRefundRef = `RFND-${providerReference}`;
      let refundStatus = "pending";

      const settings = await getTenantPaymentSettings(tenantSlug);
      if (
        tx.provider === "paystack" &&
        settings._paystackSecretPlain &&
        (settings._paystackSecretPlain.startsWith("sk_test_") ||
          settings._paystackSecretPlain.startsWith("sk_live_"))
      ) {
        try {
          const rfRes = await fetch("https://api.paystack.co/refund", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${settings._paystackSecretPlain}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              transaction: providerReference,
              amount: Math.round(refundAmount * 100),
              merchant_note: reason,
            }),
            signal: AbortSignal.timeout(8000),
          });
          const rfJson = await rfRes.json().catch(() => null);
          if (rfRes.ok && rfJson?.status) {
            providerRefundRef = String(rfJson.data?.id || providerRefundRef);
            refundStatus = "processing";
          }
        } catch {}
      }

      const [refund] = await sql`
        INSERT INTO payment_refunds (
          id, tenant_slug, tenant_id, order_id, order_number, transaction_id,
          provider_reference, provider_refund_reference, provider, payment_mode,
          amount, currency, reason, status, requested_by, created_at, updated_at
        ) VALUES (
          ${refundId}, ${tenantSlug}, ${tx.tenant_id || `org-${tenantSlug}`},
          ${tx.order_id}, ${tx.order_number}, ${tx.id},
          ${providerReference}, ${providerRefundRef}, ${tx.provider}, ${tx.payment_mode},
          ${refundAmount}, 'NGN', ${reason}, ${refundStatus}, 'merchant', NOW(), NOW()
        )
        RETURNING *;
      `;

      await sql`
        UPDATE shop_orders
        SET status = 'REFUND_PENDING',
            payment_status = 'REFUND_PENDING',
            updated_at = NOW()
        WHERE order_number = ${tx.order_number}
          AND LOWER(tenant_slug) = ${tenantSlug};
      `;

      await recordOrderStatusHistory({
        sql,
        tenantSlug,
        orderId: tx.order_id,
        orderNumber: tx.order_number,
        domain: "PAYMENT",
        previousState: tx.status,
        newState: "REFUND_INITIATED",
        actor: "merchant",
        notes: `Refund of ₦${refundAmount.toLocaleString()} initiated (${reason})`,
      });

      return NextResponse.json({
        success: true,
        message: `Refund request (${providerRefundRef}) initiated with ${tx.provider}.`,
        refund,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unsupported ledger action '${action}'` },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Ledger operation failed: " + err.message },
      { status: 500 }
    );
  }
}
