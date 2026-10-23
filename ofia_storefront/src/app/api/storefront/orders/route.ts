import { NextRequest, NextResponse } from "next/server";
import {
  getStorefrontOrders,
  getStorefrontOrderByIdOrRef,
  saveStorefrontOrder,
  updateStorefrontOrderStatus,
} from "@/lib/commerce-orders-store";
import { StorefrontOrderPayload } from "@/types/storefront";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get("tenant") || searchParams.get("slug");
  const ref = searchParams.get("ref") || searchParams.get("orderNumber") || searchParams.get("id");

  try {
    if (ref) {
      const order = await getStorefrontOrderByIdOrRef(ref, tenantSlug || undefined);
      if (order) {
        return NextResponse.json({ success: true, order });
      }
      return NextResponse.json(
        { success: false, error: `Order with reference '${ref}' not found` },
        { status: 404 }
      );
    }

    const orders = await getStorefrontOrders(tenantSlug || undefined);
    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.customerPhone || !body.shippingAddress) {
      return NextResponse.json(
        { success: false, error: "Name, phone, and shipping address are required" },
        { status: 400 }
      );
    }

    const rawTenant = body.tenantSlug || request.headers.get("x-tenant-slug");
    if (!rawTenant) {
      return NextResponse.json(
        { success: false, error: "tenantSlug is required" },
        { status: 400 }
      );
    }
    const tenantSlug = rawTenant.toLowerCase().trim();

    const orderNumber =
      body.orderNumber || `OFIA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = body.id || `ORD-${Date.now().toString().slice(-6)}`;

    const newOrder: StorefrontOrderPayload = {
      id: orderId,
      orderNumber: orderNumber,
      tenantSlug: tenantSlug,
      tenantId: body.tenantId || `org-${tenantSlug}`,
      customerName: body.customerName,
      customerEmail: body.customerEmail || "",
      customerPhone: body.customerPhone,
      channel: "STOREFRONT",
      shippingAddress: body.shippingAddress,
      city: body.city || "Lagos",
      paymentMethod: body.paymentMethod || "card",
      items: body.items || [],
      itemsSummary:
        body.itemsSummary ||
        (body.items && body.items.length > 0
          ? body.items.map((i: any) => `${i.title || i.name} (x${i.quantity || 1})`).join(", ")
          : "Storefront Merchandise"),
      itemCount:
        body.itemCount ||
        (body.items && body.items.length > 0
          ? body.items.reduce((acc: number, i: any) => acc + (i.quantity || 1), 0)
          : 1),
      totalAmount:
        body.totalAmount ||
        (body.rawAmount ? `₦${Number(body.rawAmount).toLocaleString()}` : "₦0"),
      rawAmount: Number(body.rawAmount) || 0,
      status: "IN_PREPARATION",
      paymentStatus: "PAID",
      deliveryMethod: body.deliveryMethod || "DISPATCH",
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      notes: body.notes || "",
    };

    const saved = await saveStorefrontOrder(newOrder);

    // Forward to ofia_erp and service_erp for Neon PostgreSQL persistence
    try {
      const erpNextUrl = process.env.ERP_NEXT_URL || "http://localhost:3002";
      const erpServiceUrl = process.env.ERP_SERVICE_URL || "http://localhost:8084";

      // 1. Forward to ERP Next.js API route (saves to Neon via @neondatabase/serverless)
      fetch(`${erpNextUrl}/api/erp/shop/orders?tenant=${encodeURIComponent(newOrder.tenantSlug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
        signal: AbortSignal.timeout(2000),
      }).catch(() => null);

      // 2. Forward to service_erp Go microservice if available
      fetch(`${erpServiceUrl}/shop/orders?tenant=${encodeURIComponent(newOrder.tenantSlug)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": newOrder.tenantSlug,
        },
        body: JSON.stringify(newOrder),
        signal: AbortSignal.timeout(2000),
      }).catch(() => null);

      // 3. Forward to marketplace_service
      const marketplaceUrl = process.env.MARKETPLACE_SERVICE_URL || "http://localhost:8083";
      fetch(`${marketplaceUrl}/api/v1/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: newOrder.items[0]?.productId || "prod-storefront",
          quantity: newOrder.items[0]?.quantity || 1,
          amount: newOrder.rawAmount,
          shipping_address: newOrder.shippingAddress,
          phone: newOrder.customerPhone,
        }),
        signal: AbortSignal.timeout(1500),
      }).catch(() => null);
    } catch {}

    return NextResponse.json({ success: true, order: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Order creation failed: " + err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { orderId, status } = await request.json();
    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: "orderId and status are required" },
        { status: 400 }
      );
    }

    const updated = await updateStorefrontOrderStatus(orderId, status);
    return NextResponse.json({ success: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
