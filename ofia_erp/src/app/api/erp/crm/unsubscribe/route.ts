import { NextRequest, NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";
import { getTenantSql } from "@/lib/tenant-db-resolver";

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
    if (!payload || !payload.tenantSlug || !payload.email) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired unsubscribe link" },
        { status: 400 }
      );
    }

    const tenantSlug = payload.tenantSlug.toLowerCase().trim();
    const cleanEmail = payload.email.toLowerCase().trim();
    const sql = await getTenantSql(tenantSlug);

    const subRows = await sql`
      SELECT status, unsubscribed_at, unsubscribe_reason
      FROM crm_email_subscribers
      WHERE LOWER(email) = ${cleanEmail}
        AND LOWER(tenant_slug) = ${tenantSlug}
        ${payload.listId ? sql`AND list_id = ${payload.listId}` : sql``}
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    const status = subRows[0]?.status || "SUBSCRIBED";

    return NextResponse.json({
      success: true,
      email: payload.email,
      listId: payload.listId || null,
      status,
      unsubscribedAt: subRows[0]?.unsubscribed_at ? new Date(subRows[0].unsubscribed_at).toISOString() : null,
      unsubscribeReason: subRows[0]?.unsubscribe_reason || null,
    });
  } catch (err: any) {
    console.error("[CRM Unsubscribe GET] Error:", err);
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
    if (!payload || !payload.tenantSlug || !payload.email) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired unsubscribe link" },
        { status: 400 }
      );
    }

    const tenantSlug = payload.tenantSlug.toLowerCase().trim();
    const cleanEmail = payload.email.toLowerCase().trim();
    const sql = await getTenantSql(tenantSlug);

    if (action === "unsubscribe") {
      await sql`
        UPDATE crm_email_subscribers
        SET status = 'UNSUBSCRIBED',
            unsubscribed_at = NOW(),
            unsubscribe_reason = ${reason}
        WHERE LOWER(email) = ${cleanEmail}
          AND LOWER(tenant_slug) = ${tenantSlug}
          ${payload.listId ? sql`AND list_id = ${payload.listId}` : sql``};
      `;

      // Refresh list subscriber count
      if (payload.listId) {
        await sql`
          UPDATE crm_email_lists
          SET subscriber_count = (
            SELECT COUNT(*)::int FROM crm_email_subscribers
            WHERE list_id = ${payload.listId} AND LOWER(tenant_slug) = ${tenantSlug} AND status = 'SUBSCRIBED'
          ), updated_at = NOW()
          WHERE id = ${payload.listId} AND LOWER(tenant_slug) = ${tenantSlug};
        `;
      }

      return NextResponse.json({
        success: true,
        message: "You have been successfully unsubscribed.",
        email: payload.email,
        status: "UNSUBSCRIBED",
      });
    } else {
      await sql`
        UPDATE crm_email_subscribers
        SET status = 'SUBSCRIBED',
            unsubscribed_at = NULL,
            unsubscribe_reason = NULL
        WHERE LOWER(email) = ${cleanEmail}
          AND LOWER(tenant_slug) = ${tenantSlug}
          ${payload.listId ? sql`AND list_id = ${payload.listId}` : sql``};
      `;

      // Refresh list subscriber count
      if (payload.listId) {
        await sql`
          UPDATE crm_email_lists
          SET subscriber_count = (
            SELECT COUNT(*)::int FROM crm_email_subscribers
            WHERE list_id = ${payload.listId} AND LOWER(tenant_slug) = ${tenantSlug} AND status = 'SUBSCRIBED'
          ), updated_at = NOW()
          WHERE id = ${payload.listId} AND LOWER(tenant_slug) = ${tenantSlug};
        `;
      }

      return NextResponse.json({
        success: true,
        message: "You have been resubscribed.",
        email: payload.email,
        status: "SUBSCRIBED",
      });
    }
  } catch (err: any) {
    console.error("[CRM Unsubscribe POST] Error:", err);
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
