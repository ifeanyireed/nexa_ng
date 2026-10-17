import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
  { params }: { params: Promise<{ path?: string[] }> | { path?: string[] } }
) {
  const resolvedParams = await params;
  const path = Array.isArray(resolvedParams?.path) ? resolvedParams.path : [];
  const subPath = path.join("/");
  const url = new URL(request.url);
  const tenantSlug = getTenantSlug(request, url);

  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tenantSlug) {
      headers["x-tenant-slug"] = tenantSlug;
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["authorization"] = authHeader;
    }

    const res = await fetch(targetUrl, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "ERP microservice connection error: " + err.message },
      { status: 502 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path?: string[] }> | { path?: string[] } }
) {
  const resolvedParams = await params;
  const path = Array.isArray(resolvedParams?.path) ? resolvedParams.path : [];
  const subPath = path.join("/");
  const url = new URL(request.url);
  const tenantSlug = getTenantSlug(request, url);
  const body = await request.text();

  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tenantSlug) {
      headers["x-tenant-slug"] = tenantSlug;
    }
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["authorization"] = authHeader;
    }

    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: body || "{}",
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "ERP microservice connection error: " + err.message },
      { status: 502 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ path?: string[] }> | { path?: string[] } }
) {
  const resolvedParams = await params;
  const path = Array.isArray(resolvedParams?.path) ? resolvedParams.path : [];
  const subPath = path.join("/");
  const url = new URL(request.url);
  const tenantSlug = getTenantSlug(request, url);
  const body = await request.text();

  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tenantSlug) {
      headers["x-tenant-slug"] = tenantSlug;
    }
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["authorization"] = authHeader;
    }

    const res = await fetch(targetUrl, {
      method: "PUT",
      headers,
      body: body || "{}",
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "ERP microservice connection error: " + err.message },
      { status: 502 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ path?: string[] }> | { path?: string[] } }
) {
  const resolvedParams = await params;
  const path = Array.isArray(resolvedParams?.path) ? resolvedParams.path : [];
  const subPath = path.join("/");
  const url = new URL(request.url);
  const tenantSlug = getTenantSlug(request, url);

  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tenantSlug) {
      headers["x-tenant-slug"] = tenantSlug;
    }
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["authorization"] = authHeader;
    }

    const res = await fetch(targetUrl, {
      method: "DELETE",
      headers,
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "ERP microservice connection error: " + err.message },
      { status: 502 }
    );
  }
}
