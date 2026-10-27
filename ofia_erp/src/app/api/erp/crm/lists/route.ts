import { NextResponse } from "next/server";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "";

export async function GET(request: Request) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    const res = await fetch(`${ERP_BASE}/crm/lists?tenant=${encodeURIComponent(tenantSlug)}`, {
      cache: "no-store",
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

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const parsed = JSON.parse(bodyText || "{}");
    const tenantSlug = getValidatedTenantSlug(request, parsed);

    const res = await fetch(`${ERP_BASE}/crm/lists`, {
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

    const res = await fetch(`${ERP_BASE}/crm/lists`, {
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
    let id = searchParams.get("id") || searchParams.get("listId");
    let body: any = null;

    if (!id) {
      try {
        body = await request.json();
        id = body?.id || body?.listId;
      } catch {
        // ignore
      }
    }

    const tenantSlug = getValidatedTenantSlug(request, body);
    if (!id) {
      return NextResponse.json({ error: "Audience list ID is required" }, { status: 400 });
    }

    const res = await fetch(`${ERP_BASE}/crm/lists?id=${encodeURIComponent(id)}&tenant=${encodeURIComponent(tenantSlug)}`, {
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
