import { NextResponse } from "next/server";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "https://ofia-erp-service.onrender.com";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const action = url.searchParams.get("action");
    const tenantSlug = getValidatedTenantSlug(request);

    const params = new URLSearchParams();
    params.set("tenant", tenantSlug);
    if (id) params.set("id", id);
    if (action) params.set("action", action);

    const res = await fetch(`${ERP_BASE}/crm/blasts?${params.toString()}`, {
      cache: "no-store",
      headers: {
        "x-tenant-slug": tenantSlug,
      },
      signal: AbortSignal.timeout(30000),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP service connection error: " + err.message }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const bodyText = await request.text();
    const parsed = JSON.parse(bodyText || "{}");
    const tenantSlug = getValidatedTenantSlug(request, parsed);

    const params = new URLSearchParams();
    params.set("tenant", tenantSlug);
    if (action) params.set("action", action);

    const res = await fetch(`${ERP_BASE}/crm/blasts?${params.toString()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      },
      body: bodyText,
      signal: AbortSignal.timeout(30000),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP service connection error: " + err.message }, { status: 502 });
  }
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const action = url.searchParams.get("action");
    const bodyText = await request.text();
    const parsed = JSON.parse(bodyText || "{}");
    const tenantSlug = getValidatedTenantSlug(request, parsed);

    const params = new URLSearchParams();
    params.set("tenant", tenantSlug);
    if (id) params.set("id", id);
    if (action) params.set("action", action);

    const res = await fetch(`${ERP_BASE}/crm/blasts?${params.toString()}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      },
      body: bodyText,
      signal: AbortSignal.timeout(30000),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP service connection error: " + err.message }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  return PUT(request);
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const tenantSlug = getValidatedTenantSlug(request);

    const params = new URLSearchParams();
    params.set("tenant", tenantSlug);
    if (id) params.set("id", id);

    const res = await fetch(`${ERP_BASE}/crm/blasts?${params.toString()}`, {
      method: "DELETE",
      headers: {
        "x-tenant-slug": tenantSlug,
      },
      signal: AbortSignal.timeout(30000),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP service connection error: " + err.message }, { status: 502 });
  }
}
