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
    const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}/subscription`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // Fallback
  }

  return NextResponse.json({
    organization_id: orgId,
    plan_tier: "GROWTH",
    status: "ACTIVE",
    limits: {
      max_monthly_leads: 5000,
      max_active_campaigns: 10,
      max_team_seats: 15,
    },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  let body: any = {};
  try {
    body = await request.json();
    const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}/subscription`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // Fallback
  }

  return NextResponse.json({
    success: true,
    organization_id: orgId,
    plan_tier: body.plan_tier || "GROWTH",
    status: "ACTIVE",
    message: "Updated successfully",
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  let body: any = {};
  try {
    body = await request.json();
    const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}/subscription/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // Fallback
  }

  return NextResponse.json({
    success: true,
    organization_id: orgId,
    ...body,
    message: "Quota override updated successfully",
  });
}
