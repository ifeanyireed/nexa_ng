import { NextRequest, NextResponse } from "next/server";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import { verifyAndConfirmPaymentTransaction } from "@/lib/payment-infrastructure";

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
    const providerReference = String(body.reference || body.providerReference || "").trim();

    if (!providerReference) {
      return NextResponse.json(
        { success: false, error: "providerReference is required for transaction verification" },
        { status: 400 }
      );
    }

    const result = await verifyAndConfirmPaymentTransaction({
      tenantSlug,
      providerReference,
      verifiedSource: "server_verify",
      providerPayload: body.providerPayload,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Transaction verification error: " + err.message },
      { status: 500 }
    );
  }
}
