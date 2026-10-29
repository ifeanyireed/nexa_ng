import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ERP_BASE = process.env.ERP_SERVICE_URL || process.env.NEXT_PUBLIC_ERP_SERVICE_URL || "";

function getTenantSlug(request: Request, url: URL, bodyText?: string): string {
  const headerSlug = request.headers.get("x-tenant-slug");
  if (headerSlug && headerSlug.trim()) return headerSlug.trim().toLowerCase();

  const querySlug = url.searchParams.get("tenant") || url.searchParams.get("tenant_slug") || url.searchParams.get("slug");
  if (querySlug && querySlug.trim()) return querySlug.trim().toLowerCase();

  if (bodyText) {
    try {
      const parsed = JSON.parse(bodyText);
      if (parsed?.tenantSlug && typeof parsed.tenantSlug === "string" && parsed.tenantSlug.trim()) {
        return parsed.tenantSlug.trim().toLowerCase();
      }
      if (parsed?.tenant_slug && typeof parsed.tenant_slug === "string" && parsed.tenant_slug.trim()) {
        return parsed.tenant_slug.trim().toLowerCase();
      }
    } catch {}
  }

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  if (host && host.includes(".")) {
    const parts = host.split(":")[0].split(".");
    const sub = parts[0].toLowerCase().trim();
    if (sub && !["www", "admin", "app", "api", "localhost", "ofia", "vercel"].includes(sub)) {
      return sub;
    }
  }

  // Fail closed - zero hardcoded fallback tenant
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

  if (!tenantSlug) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-tenant-slug": tenantSlug,
    };

    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["authorization"] = authHeader;
    }

    const res = await fetch(targetUrl, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
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
  const body = await request.text();
  const tenantSlug = getTenantSlug(request, url, body);

  if (!tenantSlug) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-tenant-slug": tenantSlug,
    };
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["authorization"] = authHeader;
    }

    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: body || "{}",
      signal: AbortSignal.timeout(30000),
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
  const body = await request.text();
  const tenantSlug = getTenantSlug(request, url, body);

  if (!tenantSlug) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-tenant-slug": tenantSlug,
    };
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["authorization"] = authHeader;
    }

    const res = await fetch(targetUrl, {
      method: "PUT",
      headers,
      body: body || "{}",
      signal: AbortSignal.timeout(30000),
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

  if (!tenantSlug) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-tenant-slug": tenantSlug,
    };
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["authorization"] = authHeader;
    }

    const res = await fetch(targetUrl, {
      method: "DELETE",
      headers,
      signal: AbortSignal.timeout(30000),
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
