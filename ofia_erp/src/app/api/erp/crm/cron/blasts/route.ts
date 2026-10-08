import { NextResponse } from "next/server";
import { dispatchScheduledBlasts } from "@/lib/crm-service";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const hasTenantParam = url.searchParams.has("tenant") || url.searchParams.has("tenant_slug") || url.searchParams.has("slug") || request.headers.has("x-tenant-slug");
    const tenantSlug = hasTenantParam ? getValidatedTenantSlug(request) : undefined;
    const result = await dispatchScheduledBlasts(tenantSlug);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process scheduled blasts" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
