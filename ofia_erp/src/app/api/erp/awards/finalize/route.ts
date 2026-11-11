import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
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

    // Compute vote tallies per category and nominee
    const tallyRows = await sql`
      SELECT
        category_id,
        nominee_id,
        COUNT(*) as total_votes
      FROM award_votes
      WHERE event_id = ${eventId}
      GROUP BY category_id, nominee_id
      ORDER BY category_id, total_votes DESC;
    `;

    // Group by category to determine rank and percentage
    const catMap: Record<string, any[]> = {};
    const catTotals: Record<string, number> = {};

    for (const row of tallyRows) {
      const catId = row.category_id;
      const votes = Number(row.total_votes) || 0;
      if (!catMap[catId]) {
        catMap[catId] = [];
        catTotals[catId] = 0;
      }
      catMap[catId].push({ nomineeId: row.nominee_id, votes });
      catTotals[catId] += votes;
    }

    // Upsert into award_results
    for (const [catId, nominees] of Object.entries(catMap)) {
      const totalInCat = catTotals[catId] || 0;
      for (let rank = 0; rank < nominees.length; rank++) {
        const nom = nominees[rank];
        const pct = totalInCat > 0 ? (nom.votes / totalInCat) * 100 : 0;
        const isWinner = rank === 0; // Top ranked is winner

        const resId = "res-" + crypto.randomUUID();
        await sql`
          INSERT INTO award_results (
            id, event_id, category_id, nominee_id, tenant_slug,
            total_votes, vote_percentage, rank, is_winner, finalized_at
          ) VALUES (
            ${resId}, ${eventId}, ${catId}, ${nom.nomineeId}, ${tenantSlug},
            ${nom.votes}, ${pct}, ${rank + 1}, ${isWinner}, CURRENT_TIMESTAMP
          )
          ON CONFLICT (category_id, nominee_id)
          DO UPDATE SET
            total_votes = EXCLUDED.total_votes,
            vote_percentage = EXCLUDED.vote_percentage,
            rank = EXCLUDED.rank,
            is_winner = EXCLUDED.is_winner,
            finalized_at = CURRENT_TIMESTAMP;
        `;
      }
    }

    // Update event status
    await sql`
      UPDATE award_events
      SET status = 'FINALIZED', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${eventId};
    `;

    return NextResponse.json({
      success: true,
      message: "Results finalized and locked into vault successfully",
    });
  } catch (err: any) {
    console.error("[POST /api/erp/awards/finalize] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to finalize results" },
      { status: 500 }
    );
  }
}
