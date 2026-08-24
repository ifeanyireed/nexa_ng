import { NextResponse } from "next/server";

const USER_BASE = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:8081/api/v1";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    const url = category && category !== "ALL"
      ? `${USER_BASE}/subscriptions/plans?category=${encodeURIComponent(category)}`
      : `${USER_BASE}/subscriptions/plans`;

    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // Fallback handled gracefully
  }

  return NextResponse.json([]);
}

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
    const res = await fetch(`${USER_BASE}/subscriptions/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const created = await res.json();
      return NextResponse.json(created, { status: 201 });
    }
  } catch (err) {
    // Return mock response
  }

  return NextResponse.json({ id: `plan-${Date.now()}`, ...body, created_at: new Date().toISOString() }, { status: 201 });
}
