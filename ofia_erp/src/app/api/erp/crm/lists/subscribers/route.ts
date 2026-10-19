import { NextResponse } from "next/server";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "https://ofia-erp-service.onrender.com";

export async function GET(request: Request) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get("listId") || searchParams.get("list_id");
    if (!listId) {
      return NextResponse.json({ error: "listId query param is required" }, { status: 400 });
    }

    const res = await fetch(`${ERP_BASE}/crm/lists/subscribers?listId=${encodeURIComponent(listId)}&tenant=${encodeURIComponent(tenantSlug)}`, {
      cache: "no-store",
      headers: {
        "x-tenant-slug": tenantSlug,
      },
      signal: AbortSignal.timeout(10000),
    });
    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text || `ERP service returned HTTP ${res.status}`, subscribers: [] };
    }
    return NextResponse.json(data || { subscribers: [] }, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP service connection error: " + err.message, subscribers: [] }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const parsed = JSON.parse(bodyText || "{}");
    const tenantSlug = getValidatedTenantSlug(request, parsed);

    const res = await fetch(`${ERP_BASE}/crm/lists/subscribers`, {
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
    return NextResponse.json({ error: "ERP service connection error: " + err.message }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  try {
    const bodyText = await request.text();
    const parsed = JSON.parse(bodyText || "{}");
    const tenantSlug = getValidatedTenantSlug(request, parsed);

    const res = await fetch(`${ERP_BASE}/crm/lists/subscribers`, {
      method: "PATCH",
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
    return NextResponse.json({ error: "ERP service connection error: " + err.message }, { status: 502 });
  }
}

export async function PUT(request: Request) {
  return PATCH(request);
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const tenantSlug = getValidatedTenantSlug(request);

    if (!id) {
      return NextResponse.json({ error: "Subscriber ID is required" }, { status: 400 });
    }

    const res = await fetch(`${ERP_BASE}/crm/lists/subscribers?id=${encodeURIComponent(id)}&tenant=${encodeURIComponent(tenantSlug)}`, {
      method: "DELETE",
      headers: {
        "x-tenant-slug": tenantSlug,
      },
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP service connection error: " + err.message }, { status: 502 });
  }
}
