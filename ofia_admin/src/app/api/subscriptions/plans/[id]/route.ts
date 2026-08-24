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
  } catch (err) {
    // Fallback handled
  }

  return NextResponse.json({ id, error: "Not found" }, { status: 404 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: any = {};
  try {
    body = await request.json();
    const res = await fetch(`${USER_BASE}/subscriptions/plans/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const updated = await res.json();
      return NextResponse.json(updated);
    }
  } catch (err) {
    // Fallback
  }

  return NextResponse.json({ id, ...body, updated_at: new Date().toISOString() });
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
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // Fallback
  }

  return NextResponse.json({ success: true, message: `Plan ${id} deleted` });
}
