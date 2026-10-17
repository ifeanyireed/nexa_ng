import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/jwt-auth";

export const dynamic = "force-dynamic";

const rawUserUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "https://ofia-user-service.onrender.com";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

export async function GET(request: Request) {
  const { errorResponse } = await authenticateApiRequest(request);
  if (errorResponse) return errorResponse;

  try {
    const { search } = new URL(request.url);
    const res = await fetch(`${USER_BASE}/waitlist${search}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const leads = Array.isArray(data)
      ? data.map((row: any) => ({
          id: row.id,
          fullName: row.full_name || row.FullName,
          businessName: row.business_name || row.BusinessName,
          email: row.email || row.Email,
          phone: row.phone || row.Phone,
          role: row.role || row.Role || "MERCHANT",
          businessType: row.business_type || row.BusinessType || "Retail Store",
          toolType: row.tool_type || row.ToolType || "Full Ecosystem",
          customBusinessType: row.custom_business_type || row.CustomBusinessType,
          customToolType: row.custom_tool_type || row.CustomToolType,
          niche: row.niche || row.Niche || "general",
          state: row.state || row.State || "Lagos",
          city: row.city || row.City || "Ikeja",
          teamSize: row.team_size || row.TeamSize || "1-5",
          featuresInterest: typeof row.features_interest === "string" ? row.features_interest.split(", ") : (row.features_interest || []),
          queueNumber: row.queue_number || row.QueueNumber,
          referralCode: row.referral_code || row.ReferralCode,
          referredBy: row.referred_by || row.ReferredBy,
          status: row.status || row.Status || "PENDING",
          inviteCode: row.invite_code || row.InviteCode,
          notes: row.notes || row.Notes,
          createdAt: row.created_at || row.CreatedAt,
        }))
      : [];

    return NextResponse.json(leads);
  } catch (err: any) {
    return NextResponse.json(
      { error: "User microservice connection error: " + err.message },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const res = await fetch(`${USER_BASE}/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "User microservice connection error: " + err.message },
      { status: 502 }
    );
  }
}
