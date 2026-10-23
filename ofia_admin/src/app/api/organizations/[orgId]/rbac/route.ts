import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const rawUserUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USERS_API ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "https://ofia-user-service.onrender.com";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId?: string }> | { orgId?: string } }
) {
  const resolvedParams = await params;
  const rawOrg = (resolvedParams?.orgId || "").trim();

  if (!rawOrg) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  const orgId = encodeURIComponent(rawOrg);

  try {
    const res = await fetch(`${USER_BASE}/organizations/${orgId}/rbac`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization") ? { authorization: request.headers.get("authorization")! } : {}),
        "x-tenant-slug": rawOrg.toLowerCase(),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Users microservice RBAC connection error: " + err.message },
      { status: 502 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId?: string }> | { orgId?: string } }
) {
  const resolvedParams = await params;
  const rawOrg = (resolvedParams?.orgId || "").trim();

  if (!rawOrg) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  const orgId = encodeURIComponent(rawOrg);

  try {
    const body = await request.text();
    const res = await fetch(`${USER_BASE}/organizations/${orgId}/rbac`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization") ? { authorization: request.headers.get("authorization")! } : {}),
        "x-tenant-slug": rawOrg.toLowerCase(),
      },
      body,
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Users microservice RBAC connection error: " + err.message },
      { status: 502 }
    );
  }
}
