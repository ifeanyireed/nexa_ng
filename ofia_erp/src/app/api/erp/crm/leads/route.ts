import { NextResponse } from "next/server";
import { getCrmLeads, createCrmLead } from "@/lib/crm-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenant") || searchParams.get("slug") || "default";
    const leads = await getCrmLeads(tenantSlug);
    return NextResponse.json({ success: true, leads });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantSlug = "default", ...leadData } = body;
    const lead = await createCrmLead(tenantSlug, leadData);
    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create lead" }, { status: 500 });
  }
}
