import { NextResponse } from "next/server";
import { getCrmDeals, createCrmDeal, updateCrmDeal, deleteCrmDeal } from "@/lib/crm-service";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    const deals = await getCrmDeals(tenantSlug);
    return NextResponse.json({ success: true, deals });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch deals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantSlug = getValidatedTenantSlug(request, body);
    const deal = await createCrmDeal(tenantSlug, body);
    return NextResponse.json({ success: true, deal }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create deal" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Deal ID is required for updates" }, { status: 400 });
    }
    const tenantSlug = getValidatedTenantSlug(request, body);
    const updated = await updateCrmDeal(tenantSlug, id, updates);
    return NextResponse.json({ success: true, deal: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update deal" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const tenantSlug = getValidatedTenantSlug(request);
    if (!id) {
      return NextResponse.json({ error: "Deal ID is required" }, { status: 400 });
    }
    await deleteCrmDeal(tenantSlug, id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete deal" }, { status: 500 });
  }
}
