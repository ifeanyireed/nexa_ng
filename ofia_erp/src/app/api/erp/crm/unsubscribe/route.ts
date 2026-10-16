import { NextRequest, NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";
import { handleCrmUnsubscribe, getCrmSubscriberDetailsForUnsubscribe } from "@/lib/crm-service";

export const dynamic = "force-dynamic";

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

    const details = await getCrmSubscriberDetailsForUnsubscribe({
      tenantSlug: payload.tenantSlug,
      email: payload.email,
      subscriberId: payload.subscriberId,
      listId: payload.listId,
    });

    return NextResponse.json({
      success: true,
      details: {
        tenantSlug: payload.tenantSlug,
        subscriberId: payload.subscriberId,
        listId: payload.listId,
        ...details,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to inspect unsubscribe token" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/erp/crm/unsubscribe
 * Handles unsubscribe and resubscribe requests.
 * Supports:
 * 1. RFC 8058 One-Click HTTP POST with query param `?token=...` and body `List-Unsubscribe=One-Click`
 * 2. JSON POST body `{ token: string, action?: "unsubscribe" | "resubscribe", reason?: string }`
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

    const result = await handleCrmUnsubscribe({
      tenantSlug: payload.tenantSlug,
      email: payload.email,
      subscriberId: payload.subscriberId,
      listId: payload.listId,
      action,
      reason,
    });

    return NextResponse.json({
      ...result,
    });
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
