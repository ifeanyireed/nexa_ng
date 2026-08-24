import { NextResponse } from "next/server";

const USER_BASE = process.env.USER_SERVICE_URL
  ? `${process.env.USER_SERVICE_URL}/api/v1`
  : (process.env.NEXT_PUBLIC_USER_SERVICE_URL || "https://ofia-user-service.onrender.com/api/v1");

export async function GET() {
  try {
    const res = await fetch(`${USER_BASE}/organizations`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch organizations from backend database: " + err.message }, { status: 502 });
  }

  return NextResponse.json([], { status: 500 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${USER_BASE}/organizations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const created = await res.json();
      return NextResponse.json(created, { status: 201 });
    }
    const errText = await res.text();
    return NextResponse.json({ error: errText }, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to persist organization to database: " + err.message }, { status: 502 });
  }
}
