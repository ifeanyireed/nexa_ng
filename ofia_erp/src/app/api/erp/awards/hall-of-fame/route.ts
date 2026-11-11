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
    const year = searchParams.get("year");

    const sql = await getTenantSql(tenantSlug);
    await ensureAwardTables(sql, tenantSlug);

    let winnerRows: any[] = [];
    if (year) {
      winnerRows = await sql`
        SELECT
          w.id,
          w.event_id,
          w.category_id,
          w.nominee_id,
          w.tenant_slug,
          w.employee_id,
          w.employee_name,
          w.department,
          w.designation,
          w.avatar_url,
          w.rank,
          w.total_votes_received,
          w.citation,
          w.certificate_number,
          w.published_at,
          c.name as category_name,
          e.title as event_title,
          e.award_year
        FROM award_winners w
        JOIN award_categories c ON c.id = w.category_id
        JOIN award_events e ON e.id = w.event_id
        WHERE (LOWER(w.tenant_slug) = ${tenantSlug} OR w.tenant_slug = '' OR w.tenant_slug IS NULL)
          AND e.award_year = ${Number(year)}
        ORDER BY w.published_at DESC, w.rank ASC;
      `;
    } else {
      winnerRows = await sql`
        SELECT
          w.id,
          w.event_id,
          w.category_id,
          w.nominee_id,
          w.tenant_slug,
          w.employee_id,
          w.employee_name,
          w.department,
          w.designation,
          w.avatar_url,
          w.rank,
          w.total_votes_received,
          w.citation,
          w.certificate_number,
          w.published_at,
          c.name as category_name,
          e.title as event_title,
          e.award_year
        FROM award_winners w
        JOIN award_categories c ON c.id = w.category_id
        JOIN award_events e ON e.id = w.event_id
        WHERE (LOWER(w.tenant_slug) = ${tenantSlug} OR w.tenant_slug = '' OR w.tenant_slug IS NULL)
        ORDER BY w.published_at DESC, w.rank ASC;
      `;
    }

    const winners = winnerRows.map((w: any) => ({
      id: w.id,
      eventId: w.event_id,
      categoryId: w.category_id,
      nomineeId: w.nominee_id,
      tenantSlug: w.tenant_slug,
      employeeId: w.employee_id,
      employeeName: w.employee_name,
      department: w.department || "",
      designation: w.designation || "",
      avatarUrl: w.avatar_url || "/character1.jpg",
      rank: w.rank,
      totalVotesReceived: w.total_votes_received || 0,
      citation: w.citation || "",
      certificateNumber: w.certificate_number || "",
      publishedAt: w.published_at,
      categoryName: w.category_name || "Recognition Award",
      eventTitle: w.event_title || "Awards",
      awardYear: w.award_year,
    }));

    return NextResponse.json({ success: true, winners });
  } catch (err: any) {
    console.error("[GET /api/erp/awards/hall-of-fame] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load Hall of Fame" },
      { status: 500 }
    );
  }
}
