import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { ensureBuyerWalletTables } from "@/lib/buyer-wallet";

export const dynamic = "force-dynamic";

function tenantFrom(request: NextRequest, body?: any): string {
  const { searchParams } = new URL(request.url);
  return String(
    searchParams.get("tenant") ||
      searchParams.get("slug") ||
      body?.tenantSlug ||
      request.headers.get("x-tenant-slug") ||
      ""
  )
    .toLowerCase()
    .trim();
}

export async function GET(request: NextRequest) {
  const tenantSlug = tenantFrom(request);
  if (!tenantSlug) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }
  const status = (new URL(request.url).searchParams.get("status") || "").toUpperCase().trim();

  try {
    const sql = await getTenantSql(tenantSlug);
    await ensureBuyerWalletTables(sql, tenantSlug);
    const rows = status
      ? await sql`
          SELECT * FROM buyer_refund_requests
          WHERE LOWER(tenant_slug) = ${tenantSlug} AND status = ${status}
          ORDER BY created_at DESC LIMIT 100;`
      : await sql`
          SELECT * FROM buyer_refund_requests
          WHERE LOWER(tenant_slug) = ${tenantSlug}
          ORDER BY created_at DESC LIMIT 100;`;
    return NextResponse.json({
      success: true,
      refunds: rows.map((r: any) => ({
        id: r.id,
        buyerName: r.buyer_name,
        buyerKey: r.buyer_key,
        orderNumber: r.order_number,
        amount: Number(r.amount),
        reason: r.reason,
        status: r.status,
        resolutionNote: r.resolution_note,
        createdAt: r.created_at,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch refund requests: " + err.message },
      { status: 500 }
    );
  }
}

/** Merchant decision: APPROVE credits the buyer's store wallet; REJECT closes the request. */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantSlug = tenantFrom(request, body);
    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenantSlug is required for multi-tenant isolation" },
        { status: 400 }
      );
    }
    const id = String(body.id || "").trim();
    const decision = String(body.action || "").toUpperCase().trim();
    const note = String(body.note || "").trim();
    if (!id || !["APPROVE", "REJECT"].includes(decision)) {
      return NextResponse.json(
        { success: false, error: "id and action (APPROVE | REJECT) are required" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureBuyerWalletTables(sql, tenantSlug);

    // Claim the request atomically so a refund can never be credited twice.
    const claimed = await sql`
      UPDATE buyer_refund_requests
      SET status = ${decision === "APPROVE" ? "APPROVED" : "REJECTED"},
          resolution_note = ${note}, updated_at = NOW()
      WHERE id = ${id} AND LOWER(tenant_slug) = ${tenantSlug} AND status = 'PENDING'
      RETURNING id, buyer_key, order_number, amount;
    `;
    if (claimed.length === 0) {
      return NextResponse.json(
        { success: false, error: "Refund request not found or already resolved." },
        { status: 409 }
      );
    }

    if (decision === "APPROVE") {
      const r = claimed[0];
      const amount = Number(r.amount) || 0;
      const walletId = `bwal_${tenantSlug}_${crypto.createHash("sha1").update(r.buyer_key).digest("hex").slice(0, 12)}`;
      await sql`
        INSERT INTO buyer_wallets (id, tenant_slug, tenant_id, buyer_key, buyer_email, balance)
        VALUES (${walletId}, ${tenantSlug}, ${`org-${tenantSlug}`}, ${r.buyer_key},
                ${String(r.buyer_key).includes("@") ? r.buyer_key : ""}, ${amount})
        ON CONFLICT (tenant_slug, buyer_key) DO UPDATE
        SET balance = buyer_wallets.balance + ${amount}, updated_at = NOW();
      `;
      await sql`
        INSERT INTO buyer_wallet_transactions (
          id, tenant_slug, tenant_id, buyer_key, type, amount, reference, description, status
        ) VALUES (
          ${`bwt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`}, ${tenantSlug},
          ${`org-${tenantSlug}`}, ${r.buyer_key}, 'REFUND_CREDIT', ${amount}, ${r.order_number},
          ${`Refund approved for order ${r.order_number}`}, 'COMPLETED'
        );
      `;
      await sql`
        UPDATE shop_orders SET payment_status = 'REFUNDED'
        WHERE LOWER(tenant_slug) = ${tenantSlug} AND order_number = ${r.order_number};
      `;
    }

    return NextResponse.json({ success: true, status: decision === "APPROVE" ? "APPROVED" : "REJECTED" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to resolve refund request: " + err.message },
      { status: 500 }
    );
  }
}
