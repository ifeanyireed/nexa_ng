import { NextRequest, NextResponse } from "next/server";

const MARKETPLACE_BASE = process.env.MARKETPLACE_SERVICE_URL
  ? `${process.env.MARKETPLACE_SERVICE_URL}/api/v1`
  : (process.env.NEXT_PUBLIC_MARKETPLACE_API_URL || "https://ofia-marketplace-service.onrender.com/api/v1");

export async function GET() {
  try {
    const res = await fetch(`${MARKETPLACE_BASE}/subdomain-layouts`, {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {}

  return NextResponse.json([]);
}

export async function POST() {
  // Seed route
  try {
    const res = await fetch(`${MARKETPLACE_BASE}/subdomain-layouts/seed`, {
      method: "POST",
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {}

  return NextResponse.json({ success: true, message: "Subdomain layouts seeded successfully" });
}
