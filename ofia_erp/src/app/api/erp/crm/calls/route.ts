import { NextResponse } from "next/server";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "https://ofia-erp-service.onrender.com";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = getValidatedTenantSlug(request);

    const params = new URLSearchParams();
    params.set("tenant", tenantSlug);
    const leadId = searchParams.get("lead_id");
    const rep = searchParams.get("rep");
    const outcome = searchParams.get("outcome");
    const direction = searchParams.get("direction");

    if (leadId) params.set("lead_id", leadId);
    if (rep) params.set("rep", rep);
    if (outcome) params.set("outcome", outcome);
    if (direction) params.set("direction", direction);

    const res = await fetch(`${ERP_BASE}/crm/calls?${params.toString()}`, {
      cache: "no-store",
      headers: {
        "x-tenant-slug": tenantSlug,
      },
      signal: AbortSignal.timeout(15000),
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

    const res = await fetch(`${ERP_BASE}/crm/calls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      },
      body: bodyText,
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP service connection error: " + err.message }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const tenantSlug = getValidatedTenantSlug(request);

    if (!id) {
      return NextResponse.json({ error: "Call ID is required" }, { status: 400 });
    }

    const res = await fetch(`${ERP_BASE}/crm/calls?id=${encodeURIComponent(id)}&tenant=${encodeURIComponent(tenantSlug)}`, {
      method: "DELETE",
      headers: {
        "x-tenant-slug": tenantSlug,
      },
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP service connection error: " + err.message }, { status: 502 });
  }
}
