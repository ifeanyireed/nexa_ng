import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ERP_BASE = process.env.ERP_SERVICE_URL || process.env.NEXT_PUBLIC_ERP_SERVICE_URL || "https://ofia-erp-service.onrender.com";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId?: string }> | { orgId?: string } }
) {
  const resolvedParams = await params;
  const orgId = resolvedParams?.orgId || "";

  try {
    const res = await fetch(`${ERP_BASE}/departments?tenant=${encodeURIComponent(orgId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": orgId,
        ...(request.headers.get("authorization") ? { authorization: request.headers.get("authorization")! } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json().catch(() => []);
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    if (Array.isArray(data)) {
      const mapped = data.map((d: any) => ({
        id: `dept_${d.code || d.name}`,
        departmentCode: d.code,
        departmentName: d.name,
        accessiblePages: ["employee"],
        accessibleTabs: {},
        isEnabled: true,
      }));
      return NextResponse.json(mapped);
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: "ERP service department connection error: " + err.message },
      { status: 502 }
    );
  }
}
