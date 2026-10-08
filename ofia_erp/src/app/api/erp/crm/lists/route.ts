import { NextResponse } from "next/server";
import { getCrmEmailLists, createCrmEmailList } from "@/lib/crm-service";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    const lists = await getCrmEmailLists(tenantSlug);
    return NextResponse.json({ success: true, lists });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch email lists" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantSlug = getValidatedTenantSlug(request, body);
    const list = await createCrmEmailList(tenantSlug, body);
    return NextResponse.json({ success: true, list }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create email list" }, { status: 500 });
  }
}
