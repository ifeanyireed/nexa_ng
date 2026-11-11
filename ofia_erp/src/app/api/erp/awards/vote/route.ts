import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import { ensureAwardTables } from "@/lib/awards-db";
import crypto from "crypto";

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
    const employeeId = searchParams.get("employeeId");

    if (!eventId || !employeeId) {
      return NextResponse.json(
        { success: false, error: "eventId and employeeId are required" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureAwardTables(sql, tenantSlug);

    const ballotRows = await sql`
      SELECT id, event_id, tenant_slug, employee_id, receipt_hash, is_sealed, categories_voted_count, submitted_at
      FROM award_ballots
      WHERE event_id = ${eventId}
        AND (employee_id = ${employeeId} OR LOWER(employee_id) = ${employeeId.toLowerCase()})
      LIMIT 1;
    `;

    if (ballotRows.length > 0) {
      const b = ballotRows[0];
      return NextResponse.json({
        success: true,
        hasVoted: true,
        ballot: {
          id: b.id,
          eventId: b.event_id,
          employeeId: b.employee_id,
          receiptHash: b.receipt_hash,
          isSealed: b.is_sealed !== false,
          categoriesVotedCount: b.categories_voted_count,
          submittedAt: b.submitted_at,
        },
      });
    }

    return NextResponse.json({
      success: true,
      hasVoted: false,
      ballot: null,
    });
  } catch (err: any) {
    console.error("[GET /api/erp/awards/vote] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to check ballot status" },
      { status: 500 }
    );
  }
}

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
    const { eventId, employeeId, selections = [] } = body;

    if (!eventId || !employeeId) {
      return NextResponse.json(
        { success: false, error: "eventId and employeeId are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(selections) || selections.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one category nomination must be selected" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureAwardTables(sql, tenantSlug);

    // 1. Validate event status & voting window
    const eventRows = await sql`
      SELECT status, allow_vote_editing, award_year, start_date, end_date
      FROM award_events
      WHERE id = ${eventId}
      LIMIT 1;
    `;

    if (eventRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Award event not found" },
        { status: 404 }
      );
    }

    const event = eventRows[0];
    if (event.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: `Voting is currently closed for this event (Status: ${event.status})` },
        { status: 400 }
      );
    }

    const now = new Date();
    if (event.start_date && now < new Date(event.start_date)) {
      return NextResponse.json(
        { success: false, error: "Voting window has not opened yet" },
        { status: 400 }
      );
    }
    if (event.end_date && now > new Date(event.end_date)) {
      return NextResponse.json(
        { success: false, error: "Voting deadline has passed for this event" },
        { status: 400 }
      );
    }

    // 2. Check if already voted
    const existingBallots = await sql`
      SELECT id, receipt_hash FROM award_ballots
      WHERE event_id = ${eventId}
        AND (employee_id = ${employeeId} OR LOWER(employee_id) = ${employeeId.toLowerCase()})
      LIMIT 1;
    `;

    if (existingBallots.length > 0 && !event.allow_vote_editing) {
      return NextResponse.json(
        { success: false, error: "Your ballot has already been sealed. Vote changes are locked by HR policy." },
        { status: 400 }
      );
    }

    // 3. Strict Anti-Self-Voting Validation
    for (const sel of selections) {
      const nomineeRows = await sql`
        SELECT employee_id FROM award_nominees
        WHERE id = ${sel.nomineeId} AND category_id = ${sel.categoryId}
        LIMIT 1;
      `;
      if (nomineeRows.length > 0) {
        const nomEmpId = nomineeRows[0].employee_id;
        if (nomEmpId.toLowerCase() === employeeId.toLowerCase()) {
          return NextResponse.json(
            { success: false, error: "Self-voting is strictly prohibited by HR integrity policy. You cannot vote for yourself in any category." },
            { status: 400 }
          );
        }
      }
    }

    // 4. Generate Cryptographic Receipt Hash
    const awardYear = event.award_year || now.getFullYear();
    const salt = crypto.randomUUID();
    const hash = crypto
      .createHash("sha256")
      .update(`${eventId}-${employeeId}-${salt}-${Date.now()}`)
      .digest("hex")
      .toUpperCase();

    const shortTenant = (tenantSlug || "NEXA").toUpperCase().slice(0, 4);
    const receiptHash = `OFIA-${awardYear}-${shortTenant}-${hash.slice(0, 8)}`;
    const ballotHash = hash;

    // 5. Insert / Update Ballot
    const ballotId = "bal-" + crypto.randomUUID();
    if (existingBallots.length > 0 && event.allow_vote_editing) {
      await sql`
        UPDATE award_ballots
        SET
          receipt_hash = ${receiptHash},
          categories_voted_count = ${selections.length},
          submitted_at = CURRENT_TIMESTAMP
        WHERE id = ${existingBallots[0].id};
      `;
    } else {
      await sql`
        INSERT INTO award_ballots (
          id, event_id, tenant_slug, employee_id, receipt_hash,
          is_sealed, categories_voted_count, submitted_at
        ) VALUES (
          ${ballotId}, ${eventId}, ${tenantSlug}, ${employeeId},
          ${receiptHash}, TRUE, ${selections.length}, CURRENT_TIMESTAMP
        );
      `;
    }

    // 6. Record Anonymized Category Votes
    for (const sel of selections) {
      const voteId = "vot-" + crypto.randomUUID();
      await sql`
        INSERT INTO award_votes (
          id, event_id, category_id, nominee_id, tenant_slug,
          ballot_hash, cast_at
        ) VALUES (
          ${voteId}, ${eventId}, ${sel.categoryId}, ${sel.nomineeId},
          ${tenantSlug}, ${ballotHash}, CURRENT_TIMESTAMP
        )
        ON CONFLICT (category_id, ballot_hash)
        DO UPDATE SET
          nominee_id = EXCLUDED.nominee_id,
          cast_at = CURRENT_TIMESTAMP;
      `;
    }

    // Audit Log
    await sql`
      INSERT INTO award_audit_logs (
        id, event_id, tenant_slug, actor_id, action, details, created_at
      ) VALUES (
        ${"log-" + crypto.randomUUID()}, ${eventId}, ${tenantSlug},
        ${employeeId}, ${"SUBMIT_BALLOT"},
        ${JSON.stringify({ categoriesVoted: selections.length, receiptHash })},
        CURRENT_TIMESTAMP
      );
    `;

    return NextResponse.json({
      success: true,
      receiptHash,
      categoriesVotedCount: selections.length,
      submittedAt: now.toISOString(),
      isSealed: true,
      message: "Your ballot has been securely sealed and encrypted. Thank you for voting!",
    });
  } catch (err: any) {
    console.error("[POST /api/erp/awards/vote] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to record vote" },
      { status: 500 }
    );
  }
}
