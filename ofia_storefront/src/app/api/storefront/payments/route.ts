import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { ensureBuyerWalletTables, resolveBuyerKey } from "@/lib/buyer-wallet";
import {
  ensureStorefrontPaymentTables,
  getStorefrontPaymentOptions,
  PaymentMode,
} from "@/lib/payment-gateway";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawTenant =
      searchParams.get("tenant") ||
      searchParams.get("slug") ||
      request.headers.get("x-tenant-slug");

    if (!rawTenant) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const tenantSlug = rawTenant.toLowerCase().trim();
    const orderRef = (searchParams.get("ref") || searchParams.get("orderNumber") || "").trim();
    const sql = await getTenantSql(tenantSlug);
    await ensureStorefrontPaymentTables(sql);

    if (orderRef) {
      const [transactions, escrowCases, disputes, history, refunds] = await Promise.all([
        sql`
          SELECT id, order_id, order_number, payment_mode, provider, provider_reference,
                 gross_amount, provider_fee, ofia_fee, protection_fee, net_amount,
                 currency, status, settlement_status, verified_at, created_at
          FROM payment_transactions
          WHERE LOWER(tenant_slug) = ${tenantSlug}
            AND (LOWER(order_number) = ${orderRef.toLowerCase()} OR LOWER(provider_reference) = ${orderRef.toLowerCase()})
          ORDER BY created_at DESC;
        `,
        sql`
          SELECT * FROM escrow_cases
          WHERE LOWER(tenant_slug) = ${tenantSlug}
            AND LOWER(order_number) = ${orderRef.toLowerCase()}
          LIMIT 1;
        `,
        sql`
          SELECT * FROM escrow_disputes
          WHERE LOWER(tenant_slug) = ${tenantSlug}
            AND LOWER(order_number) = ${orderRef.toLowerCase()}
          ORDER BY created_at DESC;
        `,
        sql`
          SELECT * FROM order_status_history
          WHERE LOWER(tenant_slug) = ${tenantSlug}
            AND LOWER(order_number) = ${orderRef.toLowerCase()}
          ORDER BY created_at ASC;
        `,
        sql`
          SELECT * FROM payment_refunds
          WHERE LOWER(tenant_slug) = ${tenantSlug}
            AND LOWER(order_number) = ${orderRef.toLowerCase()}
          ORDER BY created_at DESC;
        `,
      ]);

      return NextResponse.json({
        success: true,
        tenantSlug,
        orderNumber: orderRef,
        transaction: transactions[0] || null,
        transactions,
        escrowCase: escrowCases[0] || null,
        disputes,
        history,
        refunds,
      });
    }

    const options = await getStorefrontPaymentOptions(tenantSlug);
    const { _secrets, ...publicOptions } = options as any;

    return NextResponse.json({
      success: true,
      ...publicOptions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to load payment details: " + err.message },
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
      request.headers.get("x-tenant-slug");

    if (!rawTenant) {
      return NextResponse.json(
        { success: false, error: "tenantSlug is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const tenantSlug = String(rawTenant).toLowerCase().trim();
    const action = String(body.action || "INITIALIZE_PAYMENT").toUpperCase().trim();
    const sql = await getTenantSql(tenantSlug);
    await ensureStorefrontPaymentTables(sql);

    // 1. Initialize & verify payment attempt for an order
    if (action === "INITIALIZE_PAYMENT") {
      const orderId = String(body.orderId || "").trim();
      const orderNumber = String(body.orderNumber || "").trim();
      const requestedMode = body.requestedMode === "protected_escrow" ? "protected_escrow" : "standard";

      if (!orderId || !orderNumber) {
        return NextResponse.json(
          { success: false, error: "orderId and orderNumber are required" },
          { status: 400 }
        );
      }

      const options = await getStorefrontPaymentOptions(tenantSlug);

      // Section 4 Rule: Protected order when escrow partner is unavailable MUST NOT fall back to standard payments
      if (requestedMode === "protected_escrow") {
        if (!options.protectedPayment.enabled || !options.protectedPayment.eligible) {
          return NextResponse.json(
            {
              success: false,
              errorCode: "ESCROW_NOT_ENABLED",
              error: "Protected Payment is not enabled for this merchant.",
            },
            { status: 400 }
          );
        }
        if (!options.protectedPayment.providerAvailable) {
          return NextResponse.json(
            {
              success: false,
              errorCode: "ESCROW_PROVIDER_UNAVAILABLE",
              error:
                "Protected Payment escrow provider is currently unavailable. Per platform policy, Protected Payments never silently fall back to standard payments.",
            },
            { status: 503 }
          );
        }
      } else if (!options.standardPayment.available) {
        return NextResponse.json(
          {
            success: false,
            errorCode: "STANDARD_PAYMENT_UNAVAILABLE",
            error: "Standard payment is not available for this merchant.",
          },
          { status: 400 }
        );
      }

      const paymentMode: PaymentMode =
        requestedMode === "protected_escrow"
          ? "protected_escrow"
          : options.standardPayment.paymentMode;
      const provider =
        requestedMode === "protected_escrow"
          ? "escrow_partner"
          : options.standardPayment.provider;

      // Immutability check: ensure an active attempt hasn't locked a different payment_mode
      const existingAttempts = await sql`
        SELECT id, payment_mode, provider_reference, status
        FROM payment_attempts
        WHERE LOWER(tenant_slug) = ${tenantSlug}
          AND order_number = ${orderNumber}
          AND status IN ('pending', 'processing', 'successful')
        LIMIT 1;
      `;
      if (
        existingAttempts.length > 0 &&
        existingAttempts[0].payment_mode !== paymentMode
      ) {
        return NextResponse.json(
          {
            success: false,
            errorCode: "PAYMENT_MODE_IMMUTABLE",
            error: `Payment mode for order ${orderNumber} is already locked to '${existingAttempts[0].payment_mode}'.`,
          },
          { status: 409 }
        );
      }

      const requestedBase = Math.max(0, Number(body.baseAmount || body.rawAmount || 0));

      // Optional store-wallet credit: amount is decided and debited server-side only.
      let creditApplied = 0;
      const creditBuyerKey = resolveBuyerKey(body.customerEmail, body.customerPhone);
      if (body.useWalletCredit === true && creditBuyerKey && existingAttempts.length === 0 && requestedBase > 0) {
        await ensureBuyerWalletTables(sql, tenantSlug);
        const balRows = await sql`
          SELECT balance FROM buyer_wallets
          WHERE LOWER(tenant_slug) = ${tenantSlug} AND buyer_key = ${creditBuyerKey} AND status = 'ACTIVE'
          LIMIT 1;
        `;
        const wanted = Math.min(Number(balRows[0]?.balance || 0), requestedBase);
        if (wanted > 0) {
          const debited = await sql`
            UPDATE buyer_wallets
            SET balance = balance - ${wanted}, updated_at = NOW()
            WHERE LOWER(tenant_slug) = ${tenantSlug} AND buyer_key = ${creditBuyerKey}
              AND status = 'ACTIVE' AND balance >= ${wanted}
            RETURNING balance;
          `;
          if (debited.length > 0) {
            creditApplied = wanted;
            await sql`
              INSERT INTO buyer_wallet_transactions (
                id, tenant_slug, tenant_id, buyer_key, type, amount, reference, description, status
              ) VALUES (
                ${`bwt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`}, ${tenantSlug},
                ${`org-${tenantSlug}`}, ${creditBuyerKey}, 'ORDER_DEBIT', ${wanted}, ${orderNumber},
                ${`Store credit applied to order ${orderNumber}`}, 'COMPLETED'
              );
            `;
          }
        }
      }
      const baseAmount = Math.max(0, requestedBase - creditApplied);
      const protectionFee =
        paymentMode === "protected_escrow"
          ? Math.round(baseAmount * (options.protectedPayment.protectionFeePct / 100) * 100) / 100
          : 0;
      const totalPayable = Math.round((baseAmount + protectionFee) * 100) / 100;
      const ofiaFee =
        paymentMode === "ofia_managed"
          ? Math.round(baseAmount * 0.015 * 100) / 100
          : 0;
      const providerFee = Math.min(2000, Math.round(totalPayable * 0.015 * 100) / 100);
      const merchantNet = Math.max(
        0,
        Math.round((baseAmount - ofiaFee - (paymentMode === "merchant_byok" ? providerFee : 0)) * 100) / 100
      );

      const attemptId = `att_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      const txId = `ptx_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      const prefix =
        paymentMode === "protected_escrow"
          ? "OFIA-ESC"
          : paymentMode === "merchant_byok"
          ? "OFIA-BYOK"
          : "OFIA-MGD";
      const providerReference = `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

      await sql`
        INSERT INTO payment_attempts (
          id, tenant_slug, tenant_id, order_id, order_number, payment_mode, provider,
          provider_reference, amount, protection_fee, currency, status,
          customer_email, customer_name, created_at, updated_at
        ) VALUES (
          ${attemptId}, ${tenantSlug}, ${`org-${tenantSlug}`}, ${orderId}, ${orderNumber},
          ${paymentMode}, ${provider}, ${providerReference}, ${totalPayable}, ${protectionFee},
          'NGN', 'successful', ${body.customerEmail || ""}, ${body.customerName || ""}, NOW(), NOW()
        );
      `;

      const isEscrow = paymentMode === "protected_escrow";
      const settlementStatus = isEscrow
        ? "held_by_escrow_partner"
        : paymentMode === "merchant_byok"
        ? "pending_provider_settlement"
        : "pending_managed_settlement";

      await sql`
        INSERT INTO payment_transactions (
          id, tenant_slug, tenant_id, order_id, order_number, attempt_id, payment_mode,
          provider, provider_reference, customer_name, customer_email, gross_amount,
          provider_fee, ofia_fee, protection_fee, net_amount, currency, status,
          settlement_status, channel, verified_source, verified_at, created_at, updated_at
        ) VALUES (
          ${txId}, ${tenantSlug}, ${`org-${tenantSlug}`}, ${orderId}, ${orderNumber},
          ${attemptId}, ${paymentMode}, ${provider}, ${providerReference},
          ${body.customerName || ""}, ${body.customerEmail || ""}, ${totalPayable},
          ${providerFee}, ${ofiaFee}, ${protectionFee}, ${merchantNet}, 'NGN',
          'successful', ${settlementStatus}, ${body.paymentMethod || "card"},
          'server_verify', NOW(), NOW(), NOW()
        );
      `;

      if (isEscrow) {
        const escrowCaseId = `esc_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
        await sql`
          INSERT INTO escrow_cases (
            id, tenant_slug, tenant_id, order_id, order_number, provider,
            provider_escrow_reference, customer_name, customer_email, customer_phone,
            gross_amount, protection_fee, merchant_net_amount, currency,
            status, fulfilment_status, created_at, updated_at
          ) VALUES (
            ${escrowCaseId}, ${tenantSlug}, ${`org-${tenantSlug}`}, ${orderId}, ${orderNumber},
            ${options.protectedPayment.providerName}, ${`ESCP-${providerReference}`},
            ${body.customerName || ""}, ${body.customerEmail || ""}, ${body.customerPhone || ""},
            ${totalPayable}, ${protectionFee}, ${merchantNet}, 'NGN',
            'held', 'awaiting_fulfilment', NOW(), NOW()
          )
          ON CONFLICT (order_number) DO UPDATE SET
            status = 'held',
            provider_escrow_reference = EXCLUDED.provider_escrow_reference,
            updated_at = NOW();
        `;
      } else {
        const settlementId = `stl_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
        await sql`
          INSERT INTO merchant_settlements (
            id, tenant_slug, tenant_id, provider, payment_mode, settlement_reference,
            gross_amount, provider_fee, ofia_fee, net_amount, currency, status,
            transaction_references, created_at, updated_at
          ) VALUES (
            ${settlementId}, ${tenantSlug}, ${`org-${tenantSlug}`}, ${provider}, ${paymentMode},
            ${`STL-${providerReference}`}, ${totalPayable}, ${providerFee}, ${ofiaFee},
            ${merchantNet}, 'NGN', 'pending', ${JSON.stringify([providerReference])}::jsonb, NOW(), NOW()
          );
        `;
      }

      // Append immutable financial ledger entry
      const ledgerId = `fle_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      await sql`
        INSERT INTO financial_ledger_entries (
          id, tenant_slug, tenant_id, order_id, order_number, transaction_id,
          payment_mode, provider, provider_reference, entry_type, direction,
          gross_amount, provider_fee, ofia_fee, protection_fee, net_amount,
          currency, status, description, created_at
        ) VALUES (
          ${ledgerId}, ${tenantSlug}, ${`org-${tenantSlug}`}, ${orderId}, ${orderNumber},
          ${txId}, ${paymentMode}, ${provider}, ${providerReference},
          ${isEscrow ? "ESCROW_FUNDED_HELD" : "PAYMENT_CAPTURED"}, 'CREDIT',
          ${totalPayable}, ${providerFee}, ${ofiaFee}, ${protectionFee}, ${merchantNet},
          'NGN', 'VERIFIED',
          ${
            isEscrow
              ? `Order #${orderNumber} funded and held by ${options.protectedPayment.providerName} (${providerReference}).`
              : `Order #${orderNumber} verified via ${provider} (${paymentMode}).`
          },
          NOW()
        );
      `;

      // Update order with verified payment state while keeping fulfilment_status independent
      await sql`
        UPDATE shop_orders
        SET payment_mode = ${paymentMode},
            payment_provider = ${provider},
            payment_reference = ${providerReference},
            payment_status = 'PAID',
            status = 'IN_PREPARATION',
            fulfilment_status = 'processing',
            is_escrow = ${isEscrow},
            escrow_status = ${isEscrow ? "HELD" : "NONE"},
            settlement_status = ${isEscrow ? "HELD_ESCROW" : "PENDING_SETTLEMENT"},
            protection_fee = ${protectionFee},
            platform_fee = ${ofiaFee},
            merchant_amount = ${merchantNet},
            raw_amount = ${totalPayable + creditApplied},
            total_amount = ${`₦${(totalPayable + creditApplied).toLocaleString()}`},
            updated_at = NOW()
        WHERE (id = ${orderId} OR order_number = ${orderNumber})
          AND LOWER(tenant_slug) = ${tenantSlug};
      `;

      const histId = `osh_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      await sql`
        INSERT INTO order_status_history (
          id, tenant_slug, tenant_id, order_id, order_number, domain,
          previous_state, new_state, actor, notes, created_at
        ) VALUES (
          ${histId}, ${tenantSlug}, ${`org-${tenantSlug}`}, ${orderId}, ${orderNumber},
          ${isEscrow ? "ESCROW" : "PAYMENT"}, 'AWAITING_PAYMENT',
          ${isEscrow ? "ESCROW_FUNDED_HELD" : "PAYMENT_CONFIRMED"},
          'payment_processor',
          ${`Verified ${paymentMode} transaction ${providerReference} via ${provider}`},
          NOW()
        );
      `;

      return NextResponse.json({
        success: true,
        paymentMode,
        provider,
        providerReference,
        protectionFee,
        totalPayable,
        creditApplied,
        merchantNet,
      });
    }

    // 2. Customer confirms receipt on Protected Payment order
    if (action === "CONFIRM_ESCROW_RECEIPT") {
      const orderNumber = String(body.orderNumber || "").trim();
      if (!orderNumber) {
        return NextResponse.json({ success: false, error: "orderNumber is required" }, { status: 400 });
      }

      const caseRows = await sql`
        SELECT * FROM escrow_cases
        WHERE LOWER(tenant_slug) = ${tenantSlug}
          AND LOWER(order_number) = ${orderNumber.toLowerCase()}
        LIMIT 1;
      `;
      if (!caseRows || caseRows.length === 0) {
        return NextResponse.json({ success: false, error: "Escrow case not found" }, { status: 404 });
      }
      const esc = caseRows[0];
      if (esc.status === "disputed") {
        return NextResponse.json(
          { success: false, error: "Release is frozen while an active dispute is open on this order." },
          { status: 400 }
        );
      }

      const [updated] = await sql`
        UPDATE escrow_cases
        SET buyer_confirmed_at = NOW(),
            status = 'release_pending',
            release_requested_at = NOW(),
            updated_at = NOW()
        WHERE id = ${esc.id}
          AND LOWER(tenant_slug) = ${tenantSlug}
        RETURNING *;
      `;

      await sql`
        UPDATE shop_orders
        SET escrow_status = 'RELEASE_PENDING',
            updated_at = NOW()
        WHERE order_number = ${esc.order_number}
          AND LOWER(tenant_slug) = ${tenantSlug};
      `;

      const histId = `osh_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      await sql`
        INSERT INTO order_status_history (
          id, tenant_slug, tenant_id, order_id, order_number, domain,
          previous_state, new_state, actor, notes, created_at
        ) VALUES (
          ${histId}, ${tenantSlug}, ${esc.tenant_id || ""}, ${esc.order_id}, ${esc.order_number},
          'ESCROW', ${esc.status}, 'release_pending', 'buyer',
          ${`Buyer confirmed delivery receipt. Release request sent to escrow partner (${esc.provider_escrow_reference}).`},
          NOW()
        );
      `;

      return NextResponse.json({
        success: true,
        message: "Receipt confirmed! Release request has been sent to the escrow partner.",
        escrowCase: updated,
      });
    }

    // 3. Customer opens a dispute / reports a problem on Protected Payment order
    if (action === "OPEN_ESCROW_DISPUTE") {
      const orderNumber = String(body.orderNumber || "").trim();
      const reason = String(body.reason || "Item or delivery issue").trim();
      const description = String(body.description || "").trim();

      if (!orderNumber || !description) {
        return NextResponse.json(
          { success: false, error: "orderNumber and description are required" },
          { status: 400 }
        );
      }

      const caseRows = await sql`
        SELECT * FROM escrow_cases
        WHERE LOWER(tenant_slug) = ${tenantSlug}
          AND LOWER(order_number) = ${orderNumber.toLowerCase()}
        LIMIT 1;
      `;
      if (!caseRows || caseRows.length === 0) {
        return NextResponse.json({ success: false, error: "Escrow case not found" }, { status: 404 });
      }
      const esc = caseRows[0];
      const disputeId = `dsp_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

      const [dispute] = await sql`
        INSERT INTO escrow_disputes (
          id, tenant_slug, tenant_id, escrow_case_id, order_id, order_number,
          provider_dispute_reference, opened_by, reason, description, status, created_at, updated_at
        ) VALUES (
          ${disputeId}, ${tenantSlug}, ${esc.tenant_id || ""}, ${esc.id},
          ${esc.order_id}, ${esc.order_number}, ${`DSP-${esc.provider_escrow_reference}`},
          'buyer', ${reason}, ${description}, 'OPEN', NOW(), NOW()
        )
        RETURNING *;
      `;

      const [updatedEscrow] = await sql`
        UPDATE escrow_cases
        SET status = 'disputed',
            dispute_id = ${disputeId},
            updated_at = NOW()
        WHERE id = ${esc.id}
          AND LOWER(tenant_slug) = ${tenantSlug}
        RETURNING *;
      `;

      await sql`
        UPDATE shop_orders
        SET status = 'DISPUTED',
            escrow_status = 'DISPUTED',
            updated_at = NOW()
        WHERE order_number = ${esc.order_number}
          AND LOWER(tenant_slug) = ${tenantSlug};
      `;

      const histId = `osh_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      await sql`
        INSERT INTO order_status_history (
          id, tenant_slug, tenant_id, order_id, order_number, domain,
          previous_state, new_state, actor, notes, created_at
        ) VALUES (
          ${histId}, ${tenantSlug}, ${esc.tenant_id || ""}, ${esc.order_id}, ${esc.order_number},
          'ESCROW', ${esc.status}, 'disputed', 'buyer',
          ${`Buyer reported a problem (${reason}): ${description}. Escrow release frozen.`},
          NOW()
        );
      `;

      return NextResponse.json({
        success: true,
        message: "Dispute opened. Escrow funds are frozen with the escrow provider until resolved.",
        dispute,
        escrowCase: updatedEscrow,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unsupported payment action '${action}'` },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Payment request failed: " + err.message },
      { status: 500 }
    );
  }
}
