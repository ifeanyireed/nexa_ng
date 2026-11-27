import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import {
  ensurePaymentInfrastructureTables,
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
    const orderNumber = (searchParams.get("orderNumber") || searchParams.get("ref") || "").trim();
    const sql = await getTenantSql(tenantSlug);
    await ensurePaymentInfrastructureTables(sql, tenantSlug);

    const cases = orderNumber
      ? await sql`
          SELECT * FROM escrow_cases
          WHERE LOWER(tenant_slug) = ${tenantSlug}
            AND (LOWER(order_number) = ${orderNumber.toLowerCase()} OR LOWER(id) = ${orderNumber.toLowerCase()})
          ORDER BY created_at DESC;
        `
      : await sql`
          SELECT * FROM escrow_cases
          WHERE LOWER(tenant_slug) = ${tenantSlug}
          ORDER BY created_at DESC
          LIMIT 100;
        `;

    const disputes = orderNumber
      ? await sql`
          SELECT * FROM escrow_disputes
          WHERE LOWER(tenant_slug) = ${tenantSlug}
            AND LOWER(order_number) = ${orderNumber.toLowerCase()}
          ORDER BY created_at DESC;
        `
      : await sql`
          SELECT * FROM escrow_disputes
          WHERE LOWER(tenant_slug) = ${tenantSlug}
          ORDER BY created_at DESC
          LIMIT 100;
        `;

    const history = orderNumber
      ? await sql`
          SELECT * FROM order_status_history
          WHERE LOWER(tenant_slug) = ${tenantSlug}
            AND LOWER(order_number) = ${orderNumber.toLowerCase()}
          ORDER BY created_at ASC;
        `
      : [];

    return NextResponse.json({
      success: true,
      tenantSlug,
      escrowCases: cases,
      disputes,
      history,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to load escrow data: " + err.message },
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
    const orderNumber = String(body.orderNumber || "").trim();

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "orderNumber is required for escrow operations" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);
    await ensurePaymentInfrastructureTables(sql, tenantSlug);

    const caseRows = await sql`
      SELECT * FROM escrow_cases
      WHERE LOWER(tenant_slug) = ${tenantSlug}
        AND LOWER(order_number) = ${orderNumber.toLowerCase()}
      LIMIT 1;
    `;

    if (!caseRows || caseRows.length === 0) {
      return NextResponse.json(
        { success: false, error: `Escrow case for order '${orderNumber}' not found` },
        { status: 404 }
      );
    }

    const esc = caseRows[0];

    // 1. Merchant submits fulfilment & delivery evidence
    if (action === "SUBMIT_FULFILMENT_EVIDENCE") {
      const trackingNumber = String(body.trackingNumber || "").trim();
      const courierName = String(body.courierName || "").trim();
      const evidenceUrl = String(body.deliveryEvidenceUrl || "").trim();
      const notes = String(body.deliveryEvidenceNotes || "").trim();

      if (!trackingNumber && !evidenceUrl && !notes) {
        return NextResponse.json(
          { success: false, error: "Tracking number, proof-of-delivery URL, or delivery notes are required" },
          { status: 400 }
        );
      }

      const nextEscrowStatus =
        esc.status === "disputed" ? "disputed" : "awaiting_buyer_confirmation";

      const [updated] = await sql`
        UPDATE escrow_cases
        SET tracking_number = COALESCE(NULLIF(${trackingNumber}, ''), tracking_number),
            courier_name = COALESCE(NULLIF(${courierName}, ''), courier_name),
            delivery_evidence_url = COALESCE(NULLIF(${evidenceUrl}, ''), delivery_evidence_url),
            delivery_evidence_notes = COALESCE(NULLIF(${notes}, ''), delivery_evidence_notes),
            fulfilment_status = 'delivered',
            status = ${nextEscrowStatus},
            updated_at = NOW()
        WHERE id = ${esc.id}
          AND LOWER(tenant_slug) = ${tenantSlug}
        RETURNING *;
      `;

      // Update order fulfilment status separately without releasing escrow funds
      await sql`
        UPDATE shop_orders
        SET status = 'DELIVERED',
            fulfilment_status = 'delivered',
            escrow_status = ${nextEscrowStatus.toUpperCase()},
            updated_at = NOW()
        WHERE order_number = ${esc.order_number}
          AND LOWER(tenant_slug) = ${tenantSlug};
      `;

      await recordOrderStatusHistory({
        sql,
        tenantSlug,
        orderId: esc.order_id,
        orderNumber: esc.order_number,
        domain: "FULFILMENT",
        previousState: esc.fulfilment_status,
        newState: "delivered",
        actor: "merchant",
        notes: `Merchant submitted fulfilment evidence (${courierName || "Courier"} ${trackingNumber || ""}). Escrow remains held pending buyer confirmation.`,
      });

      return NextResponse.json({
        success: true,
        message: "Fulfilment evidence recorded. Customer notified to confirm receipt. Escrow funds remain safeguarded by the escrow partner.",
        escrowCase: updated,
      });
    }

    // 2. Customer confirms receipt -> checks dispute status -> sends release request to escrow partner
    if (action === "CONFIRM_RECEIPT") {
      if (esc.status === "disputed") {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot confirm receipt for release while an active dispute is open on this escrow case.",
          },
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

      await recordOrderStatusHistory({
        sql,
        tenantSlug,
        orderId: esc.order_id,
        orderNumber: esc.order_number,
        domain: "ESCROW",
        previousState: esc.status,
        newState: "release_pending",
        actor: "buyer",
        notes: `Buyer confirmed delivery receipt. Release request dispatched to escrow partner (${esc.provider_escrow_reference}).`,
      });

      return NextResponse.json({
        success: true,
        message: "Delivery confirmed! A release request has been dispatched to the escrow partner.",
        escrowCase: updated,
      });
    }

    // 3. Request Release (strictly blocks manual release if buyer hasn't confirmed or dispute is open)
    if (action === "REQUEST_RELEASE") {
      if (esc.status === "disputed") {
        return NextResponse.json(
          { success: false, error: "Escrow release is frozen while a dispute is open." },
          { status: 400 }
        );
      }
      if (!esc.buyer_confirmed_at && esc.status !== "release_eligible") {
        return NextResponse.json(
          {
            success: false,
            error: "Merchants cannot manually release escrow funds before verified buyer receipt confirmation.",
          },
          { status: 403 }
        );
      }

      const [updated] = await sql`
        UPDATE escrow_cases
        SET status = 'release_pending',
            release_requested_at = NOW(),
            updated_at = NOW()
        WHERE id = ${esc.id}
          AND LOWER(tenant_slug) = ${tenantSlug}
        RETURNING *;
      `;

      return NextResponse.json({
        success: true,
        message: "Release request sent to escrow partner. Final release awaits provider webhook confirmation.",
        escrowCase: updated,
      });
    }

    // 4. Open Dispute (Buyer or Merchant) -> freezes release
    if (action === "OPEN_DISPUTE") {
      const reason = String(body.reason || "Order issue reported").trim();
      const description = String(body.description || "").trim();
      const openedBy = body.openedBy === "merchant" ? "merchant" : "buyer";

      if (!description) {
        return NextResponse.json(
          { success: false, error: "Please provide a detailed description of the problem" },
          { status: 400 }
        );
      }

      const disputeId = `dsp_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      const evidenceUrls = Array.isArray(body.evidenceUrls) ? body.evidenceUrls : [];

      const [dispute] = await sql`
        INSERT INTO escrow_disputes (
          id, tenant_slug, tenant_id, escrow_case_id, order_id, order_number,
          provider_dispute_reference, opened_by, reason, description,
          buyer_evidence_urls, status, created_at, updated_at
        ) VALUES (
          ${disputeId}, ${tenantSlug}, ${esc.tenant_id || `org-${tenantSlug}`},
          ${esc.id}, ${esc.order_id}, ${esc.order_number},
          ${`DSP-${esc.provider_escrow_reference}`}, ${openedBy}, ${reason}, ${description},
          ${JSON.stringify(evidenceUrls)}::jsonb, 'OPEN', NOW(), NOW()
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

      await recordOrderStatusHistory({
        sql,
        tenantSlug,
        orderId: esc.order_id,
        orderNumber: esc.order_number,
        domain: "ESCROW",
        previousState: esc.status,
        newState: "disputed",
        actor: openedBy,
        notes: `Dispute opened (${reason}): ${description}. Escrow release frozen.`,
      });

      return NextResponse.json({
        success: true,
        message: "Dispute opened and escrow release frozen pending resolution.",
        dispute,
        escrowCase: updatedEscrow,
      });
    }

    // 5. Merchant responds to dispute with evidence
    if (action === "SUBMIT_DISPUTE_EVIDENCE") {
      const disputeId = String(body.disputeId || esc.dispute_id || "").trim();
      const responseText = String(body.merchantResponse || "").trim();
      const evidenceUrls = Array.isArray(body.evidenceUrls) ? body.evidenceUrls : [];

      if (!disputeId || !responseText) {
        return NextResponse.json(
          { success: false, error: "disputeId and merchantResponse are required" },
          { status: 400 }
        );
      }

      const [updatedDispute] = await sql`
        UPDATE escrow_disputes
        SET merchant_response = ${responseText},
            merchant_evidence_urls = ${JSON.stringify(evidenceUrls)}::jsonb,
            status = 'UNDER_REVIEW',
            updated_at = NOW()
        WHERE id = ${disputeId}
          AND LOWER(tenant_slug) = ${tenantSlug}
        RETURNING *;
      `;

      await recordOrderStatusHistory({
        sql,
        tenantSlug,
        orderId: esc.order_id,
        orderNumber: esc.order_number,
        domain: "ESCROW",
        previousState: "disputed",
        newState: "dispute_under_review",
        actor: "merchant",
        notes: `Merchant submitted dispute response and evidence.`,
      });

      return NextResponse.json({
        success: true,
        message: "Dispute response and evidence submitted to escrow resolution desk.",
        dispute: updatedDispute,
      });
    }

    // 6. Request Escrow Refund
    if (action === "REQUEST_REFUND") {
      const reason = String(body.reason || "Customer refund request").trim();
      const [updated] = await sql`
        UPDATE escrow_cases
        SET status = 'refund_pending',
            refund_requested_at = NOW(),
            updated_at = NOW()
        WHERE id = ${esc.id}
          AND LOWER(tenant_slug) = ${tenantSlug}
        RETURNING *;
      `;

      const refundId = `ref_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      await sql`
        INSERT INTO payment_refunds (
          id, tenant_slug, tenant_id, order_id, order_number,
          provider_reference, provider_refund_reference, provider, payment_mode,
          amount, currency, reason, status, requested_by, created_at, updated_at
        ) VALUES (
          ${refundId}, ${tenantSlug}, ${esc.tenant_id || `org-${tenantSlug}`},
          ${esc.order_id}, ${esc.order_number}, ${esc.provider_escrow_reference},
          ${`REF-${esc.provider_escrow_reference}`}, ${esc.provider}, 'protected_escrow',
          ${esc.gross_amount}, 'NGN', ${reason}, 'pending',
          ${body.requestedBy || "buyer"}, NOW(), NOW()
        );
      `;

      await sql`
        UPDATE shop_orders
        SET status = 'REFUND_PENDING',
            escrow_status = 'REFUND_PENDING',
            updated_at = NOW()
        WHERE order_number = ${esc.order_number}
          AND LOWER(tenant_slug) = ${tenantSlug};
      `;

      await recordOrderStatusHistory({
        sql,
        tenantSlug,
        orderId: esc.order_id,
        orderNumber: esc.order_number,
        domain: "ESCROW",
        previousState: esc.status,
        newState: "refund_pending",
        actor: body.requestedBy || "buyer",
        notes: `Escrow refund requested: ${reason}`,
      });

      return NextResponse.json({
        success: true,
        message: "Refund request submitted to the escrow partner.",
        escrowCase: updated,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unsupported escrow action '${action}'` },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Escrow action failed: " + err.message },
      { status: 500 }
    );
  }
}
