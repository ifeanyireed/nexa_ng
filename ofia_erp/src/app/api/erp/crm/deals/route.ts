import { NextResponse } from "next/server";
import { getCrmDeals, createCrmDeal } from "@/lib/crm-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenant") || searchParams.get("slug") || "default";
    const deals = await getCrmDeals(tenantSlug);
    return NextResponse.json({ success: true, deals });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch deals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantSlug = "default", ...dealData } = body;
    const deal = await createCrmDeal(tenantSlug, dealData);
    return NextResponse.json({ success: true, deal }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create deal" }, { status: 500 });
  }
}
