import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const rawAdminUrl =
  process.env.ADMIN_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ADMIN_API ||
  "http://localhost:3003";

const ADMIN_BASE = rawAdminUrl.replace(/\/+$/, "");

async function proxyToAdmin(request: NextRequest, params: { path: string[] }) {
  const pathSegment = params.path ? params.path.join("/") : "";
  const { search } = new URL(request.url);
  const targetUrl = `${ADMIN_BASE}/api/onboarding/${pathSegment}${search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key !== "host") {
      headers.set(key, value);
    }
  });

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      cache: "no-store",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      fetchOptions.body = await request.text();
    }

    const res = await fetch(targetUrl, fetchOptions);
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
    } else {
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: { "Content-Type": contentType },
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to connect to Ofia Provisioning Engine: " + err.message },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolved = await params;
  return proxyToAdmin(request, resolved);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolved = await params;
  return proxyToAdmin(request, resolved);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolved = await params;
  return proxyToAdmin(request, resolved);
}
