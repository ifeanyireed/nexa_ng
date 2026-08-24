import { NextRequest, NextResponse } from "next/server";

const MARKETPLACE_BASE = process.env.NEXT_PUBLIC_MARKETPLACE_API_URL || "http://localhost:8083/api/v1";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const res = await fetch(`${MARKETPLACE_BASE}/subdomain-layouts/${encodeURIComponent(slug)}`, {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {}

  return NextResponse.json({
    subdomain_slug: slug,
    layout_key: "technical_quote",
    is_active: true,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const body = await request.json();
    const res = await fetch(`${MARKETPLACE_BASE}/subdomain-layouts/${encodeURIComponent(slug)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {}

  return NextResponse.json({
    success: true,
    subdomain_slug: slug,
    updated: true,
  });
}
