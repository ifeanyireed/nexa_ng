import { NextResponse } from "next/server";

const USER_BASE = process.env.USER_SERVICE_URL
  ? `${process.env.USER_SERVICE_URL}/api/v1`
  : (process.env.NEXT_PUBLIC_USER_SERVICE_URL || "https://ofia-user-service.onrender.com/api/v1");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  try {
    const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: "Organization not found" }, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch organization: " + err.message },
      { status: 502 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  try {
    const body = await request.json();
    const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const updated = await res.json();
      return NextResponse.json(updated);
    }
    const errText = await res.text().catch(() => "");
    return NextResponse.json({ error: errText }, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update organization: " + err.message },
      { status: 502 }
    );
  }
}
