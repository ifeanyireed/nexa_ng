import { NextResponse } from "next/server";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "https://ofia-erp-service.onrender.com";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const hasTenantParam =
      url.searchParams.has("tenant") ||
      url.searchParams.has("tenant_slug") ||
      url.searchParams.has("slug") ||
      request.headers.has("x-tenant-slug");
    const tenantSlug = hasTenantParam ? getValidatedTenantSlug(request) : "all";

    const res = await fetch(`${ERP_BASE}/crm/blasts?tenant=${encodeURIComponent(tenantSlug)}`, {
      cache: "no-store",
      headers: {
        "x-tenant-slug": tenantSlug,
      },
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data || { success: true, processed: 0 });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP service connection error: " + err.message }, { status: 502 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
