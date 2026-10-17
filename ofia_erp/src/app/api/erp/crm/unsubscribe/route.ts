import { NextRequest, NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "https://ofia-erp-service.onrender.com";

/**
 * GET /api/erp/crm/unsubscribe?token=...
 * Inspects an unsubscribe token and returns the subscriber's current status and details.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = (searchParams.get("token") || "").trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unsubscribe token is required" },
        { status: 400 }
      );
    }

    const payload = verifyUnsubscribeToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired unsubscribe link" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${ERP_BASE}/crm/unsubscribe?email=${encodeURIComponent(payload.email)}&list_id=${encodeURIComponent(payload.listId || "")}&tenant=${encodeURIComponent(payload.tenantSlug)}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    const data = await res.json().catch(() => null);
    return NextResponse.json(data || { success: true, email: payload.email, status: "ACTIVE" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to inspect unsubscribe token" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/erp/crm/unsubscribe
 * Handles unsubscribe and resubscribe requests across audience lists and tenants.
 */
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let token = (searchParams.get("token") || "").trim();
    let action: "unsubscribe" | "resubscribe" = "unsubscribe";
    let reason = "One-click unsubscribe";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        const body = await req.json();
        if (body.token) token = body.token.trim();
        if (body.action === "resubscribe" || body.action === "unsubscribe") {
          action = body.action;
        }
        if (body.reason) {
          reason = String(body.reason).trim();
        }
      } catch {}
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      try {
        const formData = await req.text();
        const parsed = new URLSearchParams(formData);
        if (parsed.get("token")) token = parsed.get("token")!.trim();
        if (parsed.get("action") === "resubscribe") action = "resubscribe";
        if (parsed.get("reason")) reason = parsed.get("reason")!.trim();
      } catch {}
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unsubscribe token is required" },
        { status: 400 }
      );
    }

    const payload = verifyUnsubscribeToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired unsubscribe link" },
        { status: 400 }
      );
    }

    const res = await fetch(`${ERP_BASE}/crm/unsubscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        list_id: payload.listId,
        tenant: payload.tenantSlug,
        action,
        reason,
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process unsubscribe request" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
