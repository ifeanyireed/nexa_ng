import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "https://ofia-erp-service.onrender.com";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${ERP_BASE}/send-reset-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to dispatch password recovery email" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "If an account matches that email, a password recovery link has been dispatched.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "ERP microservice error: " + (error?.message || "Internal failure") },
      { status: 502 }
    );
  }
}
