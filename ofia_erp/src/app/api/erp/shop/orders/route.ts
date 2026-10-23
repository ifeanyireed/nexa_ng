import { NextRequest, NextResponse } from "next/server";
import { getErpOrders, saveErpOrder, updateErpOrderStatus } from "@/lib/commerce-orders-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get("tenant") || searchParams.get("slug");

  try {
    const orders = await getErpOrders(tenantSlug || undefined);
    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch ERP shop orders: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.customerPhone) {
      return NextResponse.json(
        { success: false, error: "customerName and customerPhone are required" },
        { status: 400 }
      );
    }

    const saved = await saveErpOrder(body);
    return NextResponse.json({ success: true, order: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to create order: " + err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: "orderId and status are required" },
        { status: 400 }
      );
    }

    const updated = await updateErpOrderStatus(orderId, status);
    return NextResponse.json({ success: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
