import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "https://ofia-erp-service.onrender.com";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tenantSlug =
    request.headers.get("x-tenant-slug") ||
    url.searchParams.get("tenant") ||
    url.searchParams.get("tenant_slug") ||
    "";

  if (!tenantSlug) {
    return NextResponse.json({ error: "Tenant slug required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${ERP_BASE}/crm/smtp-settings?tenant=${encodeURIComponent(tenantSlug)}`, {
      cache: "no-store",
      headers: {
        "x-tenant-slug": tenantSlug,
      },
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "ERP service connection error: " + err.message },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const body = JSON.parse(bodyText || "{}");
    const tenantSlug =
      body.tenantSlug ||
      body.tenant_slug ||
      request.headers.get("x-tenant-slug") ||
      "";

    if (!tenantSlug) {
      return NextResponse.json({ error: "Tenant slug required" }, { status: 400 });
    }

    const res = await fetch(`${ERP_BASE}/crm/smtp-settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      },
      body: bodyText,
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "ERP service connection error: " + err.message },
      { status: 502 }
    );
  }
}
