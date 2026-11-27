import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { ensureBuyerWalletTables, resolveBuyerKey, getBuyerWalletBalance } from "@/lib/buyer-wallet";

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
  const { searchParams } = new URL(request.url);
  const buyerKey = resolveBuyerKey(searchParams.get("email"), searchParams.get("phone"));
  if (!buyerKey) {
    return NextResponse.json(
      { success: false, error: "email or phone is required to load the wallet" },
      { status: 400 }
    );
  }

  try {
    const sql = await getTenantSql(tenantSlug);
    await ensureBuyerWalletTables(sql, tenantSlug);

    const [balance, txRows, refundRows] = await Promise.all([
      getBuyerWalletBalance(sql, tenantSlug, buyerKey),
      sql`
        SELECT id, type, amount, reference, description, status, created_at
        FROM buyer_wallet_transactions
        WHERE LOWER(tenant_slug) = ${tenantSlug} AND buyer_key = ${buyerKey}
        ORDER BY created_at DESC LIMIT 30;
      `,
      sql`
        SELECT id, order_number, amount, reason, status, resolution_note, created_at
        FROM buyer_refund_requests
        WHERE LOWER(tenant_slug) = ${tenantSlug} AND buyer_key = ${buyerKey}
        ORDER BY created_at DESC LIMIT 30;
      `,
    ]);

    return NextResponse.json({
      success: true,
      balance,
      currency: "NGN",
      transactions: txRows.map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        reference: t.reference,
        description: t.description,
        status: t.status,
        createdAt: t.created_at,
      })),
      refunds: refundRows.map((r: any) => ({
        id: r.id,
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
      { success: false, error: "Failed to load wallet: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantSlug = tenantFrom(request, body);
    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenantSlug is required for multi-tenant isolation" },
        { status: 400 }
      );
    }
    const action = String(body.action || "REQUEST_REFUND").toUpperCase();
    if (action !== "REQUEST_REFUND") {
      return NextResponse.json({ success: false, error: "Unsupported wallet action" }, { status: 400 });
    }

    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const buyerKey = resolveBuyerKey(email, phone);
    const orderNumber = String(body.orderNumber || "").trim();
    const reason = String(body.reason || "").trim();
    if (!buyerKey || !orderNumber || !reason) {
      return NextResponse.json(
        { success: false, error: "email/phone, orderNumber and reason are required" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureBuyerWalletTables(sql, tenantSlug);

    // The order must exist and belong to this buyer; refund amount comes from the order, never the client.
    const orders = await sql`
      SELECT order_number, customer_name, customer_email, customer_phone, raw_amount, payment_status
      FROM shop_orders
      WHERE LOWER(tenant_slug) = ${tenantSlug} AND order_number = ${orderNumber}
      LIMIT 1;
    `;
    const order = orders[0];
    const ownsOrder =
      order &&
      ((email && String(order.customer_email || "").toLowerCase() === email) ||
        (phone && String(order.customer_phone || "").replace(/\D/g, "") === phone.replace(/\D/g, "")));
    if (!ownsOrder) {
      return NextResponse.json({ success: false, error: "Order not found for this account." }, { status: 404 });
    }
    if (String(order.payment_status || "").toUpperCase() === "REFUNDED") {
      return NextResponse.json({ success: false, error: "This order has already been refunded." }, { status: 409 });
    }

    const existing = await sql`
      SELECT id FROM buyer_refund_requests
      WHERE LOWER(tenant_slug) = ${tenantSlug} AND order_number = ${orderNumber}
        AND buyer_key = ${buyerKey} AND status IN ('PENDING', 'APPROVED')
      LIMIT 1;
    `;
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: "A refund request for this order is already open." },
        { status: 409 }
      );
    }

    const id = `rfd_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    await sql`
      INSERT INTO buyer_refund_requests (
        id, tenant_slug, tenant_id, buyer_key, buyer_name, order_number, amount, reason, status
      ) VALUES (
        ${id}, ${tenantSlug}, ${`org-${tenantSlug}`}, ${buyerKey}, ${order.customer_name || ""},
        ${orderNumber}, ${Number(order.raw_amount) || 0}, ${reason}, 'PENDING'
      );
    `;

    return NextResponse.json({ success: true, refund: { id, orderNumber, status: "PENDING" } });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to submit refund request: " + err.message },
      { status: 500 }
    );
  }
}
