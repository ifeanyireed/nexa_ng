import { NextResponse } from "next/server";
import { dispatchScheduledBlasts } from "@/lib/crm-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenant") || searchParams.get("slug") || undefined;
    const result = await dispatchScheduledBlasts(tenantSlug);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process scheduled blasts" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
