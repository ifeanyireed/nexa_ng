import { NextResponse } from "next/server";
import { getCrmEmailLists, createCrmEmailList } from "@/lib/crm-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenant") || searchParams.get("slug") || "default";
    const lists = await getCrmEmailLists(tenantSlug);
    return NextResponse.json({ success: true, lists });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch email lists" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantSlug = "default", ...listData } = body;
    const list = await createCrmEmailList(tenantSlug, listData);
    return NextResponse.json({ success: true, list }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create email list" }, { status: 500 });
  }
}
