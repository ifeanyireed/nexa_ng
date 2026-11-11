import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import { ensureAwardTables } from "@/lib/awards-db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "eventId is required" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureAwardTables(sql, tenantSlug);

    // Event info
    const eventRows = await sql`
      SELECT end_date, status FROM award_events
      WHERE id = ${eventId}
      LIMIT 1;
    `;

    let daysRemaining = 0;
    let isVotingOpen = false;
    if (eventRows.length > 0) {
      const evt = eventRows[0];
      isVotingOpen = evt.status === "ACTIVE";
      if (evt.end_date) {
        const diffMs = new Date(evt.end_date).getTime() - Date.now();
        daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }
    }

    // Active categories count
    const catCountRows = await sql`
      SELECT count(*) as count FROM award_categories
      WHERE event_id = ${eventId};
    `;
    const activeCategories = Number(catCountRows[0]?.count) || 0;

    // Total eligible staff from "User"
    const userCountRows = await sql`
      SELECT count(*) as count FROM "User"
      WHERE (LOWER("tenantSlug") = ${tenantSlug} OR "tenantSlug" = '' OR "tenantSlug" IS NULL);
    `;
    const totalEligibleStaff = Math.max(1, Number(userCountRows[0]?.count) || 0);

    // Total ballots cast
    const ballotCountRows = await sql`
      SELECT count(*) as count FROM award_ballots
      WHERE event_id = ${eventId};
    `;
    const totalBallotsCast = Number(ballotCountRows[0]?.count) || 0;
    const turnoutPercentage = Math.min(100, (totalBallotsCast / totalEligibleStaff) * 100);

    // Department breakdown
    const deptRows = await sql`
      SELECT
        COALESCE(u.department, 'General') as department,
        COUNT(DISTINCT u.id) as total_staff,
        COUNT(DISTINCT b.employee_id) as voted_count
      FROM "User" u
      LEFT JOIN award_ballots b
        ON (b.employee_id = u.id OR LOWER(b.employee_id) = LOWER(u.email))
        AND b.event_id = ${eventId}
      WHERE (LOWER(u."tenantSlug") = ${tenantSlug} OR u."tenantSlug" = '' OR u."tenantSlug" IS NULL)
      GROUP BY COALESCE(u.department, 'General')
      ORDER BY total_staff DESC;
    `;

    const departmentTurnout = deptRows.map((d: any) => {
      const total = Number(d.total_staff) || 0;
      const voted = Number(d.voted_count) || 0;
      return {
        department: d.department || "General",
        totalStaff: total,
        votedCount: voted,
        percentage: total > 0 ? (voted / total) * 100 : 0,
      };
    });

    const turnout = {
      totalEligibleStaff,
      totalBallotsCast,
      turnoutPercentage: Math.round(turnoutPercentage * 10) / 10,
      activeCategories,
      daysRemaining,
      isVotingOpen,
      departmentTurnout,
    };

    return NextResponse.json({ success: true, turnout });
  } catch (err: any) {
    console.error("[GET /api/erp/awards/turnout] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load turnout" },
      { status: 500 }
    );
  }
}
