import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    processed: 0,
    sent: 0,
    failed: 0,
    remainingPending: 0,
    remainingRateLimited: 0,
    errors: [],
  });
}

export async function GET() {
  return POST();
}
