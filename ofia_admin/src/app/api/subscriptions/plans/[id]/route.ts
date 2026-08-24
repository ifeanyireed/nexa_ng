import { NextResponse } from "next/server";

const USER_BASE = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:8081/api/v1";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await fetch(`${USER_BASE}/subscriptions/plans/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch plan from database: " + err.message }, { status: 502 });
  }

  return NextResponse.json({ id, error: "Plan not found" }, { status: 404 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const res = await fetch(`${USER_BASE}/subscriptions/plans/${encodeURIComponent(id)}`, {
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
    return NextResponse.json({ error: "Failed to update plan in database: " + err.message }, { status: 502 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await fetch(`${USER_BASE}/subscriptions/plans/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      return NextResponse.json({ success: true, message: "Subscription plan deleted from database" });
    }
    const errText = await res.text();
    return NextResponse.json({ error: errText }, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete plan from database: " + err.message }, { status: 502 });
  }
}
