import { NextResponse } from "next/server";

const USER_BASE = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:8081/api/v1";

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
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch organization: " + err.message }, { status: 502 });
  }

  return NextResponse.json({ id: orgId, error: "Tenant organization not found" }, { status: 404 });
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
    const errText = await res.text();
    return NextResponse.json({ error: errText }, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update tenant in database: " + err.message }, { status: 502 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  try {
    const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      return NextResponse.json({ success: true, message: "Tenant organization deleted from database" });
    }
    const errText = await res.text();
    return NextResponse.json({ error: errText }, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete tenant from database: " + err.message }, { status: 502 });
  }
}
