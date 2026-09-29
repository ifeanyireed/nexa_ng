import { NextResponse } from "next/server";

const ERP_BASE = process.env.ERP_SERVICE_URL || process.env.NEXT_PUBLIC_ERP_SERVICE_URL || "https://ofia-erp-service.onrender.com";

function getTenantSlug(request: Request, url: URL): string {
  const headerSlug = request.headers.get("x-tenant-slug");
  if (headerSlug) return headerSlug;

  const querySlug = url.searchParams.get("tenant") || url.searchParams.get("tenant_slug");
  if (querySlug) return querySlug;

  return "";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const subPath = path.join("/");
  const url = new URL(request.url);
  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;
  const tenantSlug = getTenantSlug(request, url);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tenantSlug) {
      headers["x-tenant-slug"] = tenantSlug;
    }

    const res = await fetch(targetUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP backend connection error: " + err.message }, { status: 502 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const subPath = path.join("/");
  const url = new URL(request.url);
  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;
  const tenantSlug = getTenantSlug(request, url);

  try {
    const body = await request.text();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tenantSlug) {
      headers["x-tenant-slug"] = tenantSlug;
    }

    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: body || "{}",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP backend error: " + err.message }, { status: 502 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const subPath = path.join("/");
  const url = new URL(request.url);
  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;
  const tenantSlug = getTenantSlug(request, url);

  try {
    const body = await request.text();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tenantSlug) {
      headers["x-tenant-slug"] = tenantSlug;
    }

    const res = await fetch(targetUrl, {
      method: "PUT",
      headers,
      body: body || "{}",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP backend error: " + err.message }, { status: 502 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const subPath = path.join("/");
  const url = new URL(request.url);
  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;
  const tenantSlug = getTenantSlug(request, url);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tenantSlug) {
      headers["x-tenant-slug"] = tenantSlug;
    }

    const res = await fetch(targetUrl, {
      method: "DELETE",
      headers,
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP backend error: " + err.message }, { status: 502 });
  }
}
