import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import { ensureAwardTables } from "@/lib/awards-db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "eventId is required" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureAwardTables(sql, tenantSlug);

    // Get event details
    const eventRows = await sql`
      SELECT id, title, award_year FROM award_events WHERE id = ${eventId} LIMIT 1;
    `;
    if (eventRows.length === 0) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }
    const event = eventRows[0];
    const year = event.award_year || new Date().getFullYear();

    // Query winning results joined with nominees and categories
    const winnerRows = await sql`
      SELECT
        r.category_id,
        r.nominee_id,
        r.rank,
        r.total_votes,
        n.employee_id,
        n.employee_name,
        n.department,
        n.designation,
        n.avatar_url,
        n.nomination_pitch,
        c.name as category_name
      FROM award_results r
      JOIN award_nominees n ON n.id = r.nominee_id
      JOIN award_categories c ON c.id = r.category_id
      WHERE r.event_id = ${eventId} AND r.is_winner = TRUE
      ORDER BY c.sort_order ASC, r.rank ASC;
    `;

    // Clear previous winners for this event (if republishing)
    await sql`DELETE FROM award_winners WHERE event_id = ${eventId};`;

    let idx = 1;
    for (const w of winnerRows) {
      const winnerId = "win-" + crypto.randomUUID();
      const certNum = `OFIA-${year}-AWD-${String(idx).padStart(3, "0")}`;
      idx++;

      await sql`
        INSERT INTO award_winners (
          id, event_id, category_id, nominee_id, tenant_slug,
          employee_id, employee_name, department, designation,
          avatar_url, rank, total_votes_received, citation,
          certificate_number, published_at
        ) VALUES (
          ${winnerId}, ${eventId}, ${w.category_id}, ${w.nominee_id}, ${tenantSlug},
          ${w.employee_id}, ${w.employee_name}, ${w.department || ""}, ${w.designation || ""},
          ${w.avatar_url || "/character1.jpg"}, ${w.rank}, ${w.total_votes},
          ${w.nomination_pitch || ""}, ${certNum}, CURRENT_TIMESTAMP
        );
      `;
    }

    // Set event to PUBLISHED
    await sql`
      UPDATE award_events
      SET status = 'PUBLISHED', is_public_visible = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${eventId};
    `;

    return NextResponse.json({
      success: true,
      message: "Winners officially published to Hall of Fame!",
      publishedCount: winnerRows.length,
    });
  } catch (err: any) {
    console.error("[POST /api/erp/awards/publish] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to publish winners" },
      { status: 500 }
    );
  }
}
