import { NextRequest, NextResponse } from "next/server";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import { initializeOrderPayment } from "@/lib/payment-infrastructure";

export const dynamic = "force-dynamic";

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
    const orderId = String(body.orderId || body.id || "").trim();
    const orderNumber = String(body.orderNumber || "").trim();

    if (!orderId || !orderNumber) {
      return NextResponse.json(
        { success: false, error: "orderId and orderNumber are required to initialize payment" },
        { status: 400 }
      );
    }

    const result = await initializeOrderPayment({
      tenantSlug,
      tenantId: body.tenantId,
      orderId,
      orderNumber,
      customerName: body.customerName || "Customer",
      customerEmail: body.customerEmail || "",
      customerPhone: body.customerPhone || "",
      subtotalAmount: Number(body.subtotalAmount ?? body.rawAmount ?? 0),
      deliveryFee: Number(body.deliveryFee ?? 0),
      discount: Number(body.discount ?? 0),
      requestedMode: body.paymentMode || (body.isEscrow ? "protected_escrow" : "standard"),
      callbackUrl: body.callbackUrl,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Payment initialization failed: " + err.message },
      { status: 500 }
    );
  }
}
