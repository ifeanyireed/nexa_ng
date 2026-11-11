import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");
    const activeOnly = searchParams.get("active") === "true" || searchParams.get("activeOnly") === "true";

    const sql = await getTenantSql(tenantSlug);

    // Single event or active event requested
    if (id || slug || activeOnly) {
      let eventRows: any[] = [];
      if (slug) {
        eventRows = await sql`
          SELECT * FROM award_events
          WHERE (LOWER(tenant_slug) = ${tenantSlug} OR tenant_slug = '' OR tenant_slug IS NULL)
            AND slug = ${slug}
          LIMIT 1;
        `;
      } else if (id) {
        eventRows = await sql`
          SELECT * FROM award_events
          WHERE (LOWER(tenant_slug) = ${tenantSlug} OR tenant_slug = '' OR tenant_slug IS NULL)
            AND id = ${id}
          LIMIT 1;
        `;
      } else {
        // Find active event, or the latest event
        eventRows = await sql`
          SELECT * FROM award_events
          WHERE (LOWER(tenant_slug) = ${tenantSlug} OR tenant_slug = '' OR tenant_slug IS NULL)
            AND status = 'ACTIVE'
          ORDER BY start_date DESC
          LIMIT 1;
        `;
        if (eventRows.length === 0) {
          eventRows = await sql`
            SELECT * FROM award_events
            WHERE (LOWER(tenant_slug) = ${tenantSlug} OR tenant_slug = '' OR tenant_slug IS NULL)
            ORDER BY created_at DESC
            LIMIT 1;
          `;
        }
      }

      if (eventRows.length === 0) {
        return NextResponse.json({ success: true, event: null, events: [] });
      }

      const rawEvt = eventRows[0];
      const eventId = rawEvt.id;

      // Fetch categories for this event
      const catRows = await sql`
        SELECT * FROM award_categories
        WHERE event_id = ${eventId}
        ORDER BY sort_order ASC, created_at ASC;
      `;

      // Fetch nominees for this event
      const nomRows = await sql`
        SELECT * FROM award_nominees
        WHERE event_id = ${eventId} AND is_active = TRUE
        ORDER BY display_order ASC, created_at ASC;
      `;

      // Nest nominees into their respective categories
      const categories = catRows.map((cat: any) => {
        const catNominees = nomRows
          .filter((n: any) => n.category_id === cat.id)
          .map((n: any) => ({
            id: n.id,
            categoryId: n.category_id,
            eventId: n.event_id,
            tenantSlug: n.tenant_slug,
            employeeId: n.employee_id,
            employeeName: n.employee_name,
            department: n.department || "",
            designation: n.designation || "",
            avatarUrl: n.avatar_url || "/character1.jpg",
            nominationPitch: n.nomination_pitch || "",
            displayOrder: n.display_order || 0,
            isActive: n.is_active !== false,
          }));

        return {
          id: cat.id,
          eventId: cat.event_id,
          tenantSlug: cat.tenant_slug,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || "",
          criteria: cat.criteria || "",
          iconName: cat.icon_name || "Award",
          imageUrl: cat.image_url || "",
          maxWinners: cat.max_winners || 1,
          minSelections: cat.min_selections || 1,
          sortOrder: cat.sort_order || 0,
          eligibleDepartments: cat.eligible_departments ? JSON.parse(cat.eligible_departments) : [],
          nominees: catNominees,
        };
      });

      const event = {
        id: rawEvt.id,
        tenantSlug: rawEvt.tenant_slug,
        title: rawEvt.title,
        slug: rawEvt.slug,
        description: rawEvt.description || "",
        bannerUrl: rawEvt.banner_url || "",
        awardYear: rawEvt.award_year,
        startDate: rawEvt.start_date,
        endDate: rawEvt.end_date,
        status: rawEvt.status,
        isAnonymous: rawEvt.is_anonymous !== false,
        allowVoteEditing: rawEvt.allow_vote_editing === true,
        isPublicVisible: rawEvt.is_public_visible !== false,
        publicSlug: rawEvt.public_slug,
        createdBy: rawEvt.created_by || "HR",
        createdAt: rawEvt.created_at,
        updatedAt: rawEvt.updated_at,
        categories,
      };

      return NextResponse.json({ success: true, event });
    }

    // List all events for tenant
    const eventsRows = await sql`
      SELECT * FROM award_events
      WHERE (LOWER(tenant_slug) = ${tenantSlug} OR tenant_slug = '' OR tenant_slug IS NULL)
      ORDER BY award_year DESC, created_at DESC;
    `;

    const events = eventsRows.map((e: any) => ({
      id: e.id,
      tenantSlug: e.tenant_slug,
      title: e.title,
      slug: e.slug,
      description: e.description || "",
      bannerUrl: e.banner_url || "",
      awardYear: e.award_year,
      startDate: e.start_date,
      endDate: e.end_date,
      status: e.status,
      isAnonymous: e.is_anonymous !== false,
      allowVoteEditing: e.allow_vote_editing === true,
      isPublicVisible: e.is_public_visible !== false,
      publicSlug: e.public_slug,
      createdBy: e.created_by || "HR",
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    }));

    return NextResponse.json({ success: true, events });
  } catch (err: any) {
    console.error("[GET /api/erp/awards/events] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load award events" },
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
    const {
      title,
      description,
      bannerUrl,
      awardYear,
      startDate,
      endDate,
      status = "ACTIVE",
      isAnonymous = true,
      allowVoteEditing = false,
      isPublicVisible = true,
      createdBy = "HR Director",
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Event title is required" },
        { status: 400 }
      );
    }

    const eventId = "evt-" + crypto.randomUUID();
    const cleanYear = Number(awardYear) || new Date().getFullYear();
    const cleanSlug =
      body.slug ||
      title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    const publicSlug = `${cleanSlug}-${cleanYear}-${tenantSlug}`;

    const start = startDate ? new Date(startDate).toISOString() : new Date().toISOString();
    const end = endDate
      ? new Date(endDate).toISOString()
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const sql = await getTenantSql(tenantSlug);

    await sql`
      INSERT INTO award_events (
        id, tenant_slug, title, slug, description, banner_url, award_year,
        start_date, end_date, status, is_anonymous, allow_vote_editing,
        is_public_visible, public_slug, created_by, created_at, updated_at
      ) VALUES (
        ${eventId}, ${tenantSlug}, ${title.trim()}, ${cleanSlug},
        ${description || ""}, ${bannerUrl || ""}, ${cleanYear},
        ${start}, ${end}, ${status}, ${Boolean(isAnonymous)},
        ${Boolean(allowVoteEditing)}, ${Boolean(isPublicVisible)},
        ${publicSlug}, ${createdBy}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      );
    `;

    // Audit log
    await sql`
      INSERT INTO award_audit_logs (
        id, event_id, tenant_slug, actor_id, action, details, created_at
      ) VALUES (
        ${"log-" + crypto.randomUUID()}, ${eventId}, ${tenantSlug},
        ${createdBy}, ${"CREATE_EVENT"}, ${JSON.stringify({ title, year: cleanYear })},
        CURRENT_TIMESTAMP
      );
    `;

    return NextResponse.json({
      success: true,
      eventId,
      slug: cleanSlug,
      message: "Award event created successfully",
    });
  } catch (err: any) {
    console.error("[POST /api/erp/awards/events] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create award event" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { id, title, description, bannerUrl, status, startDate, endDate, isPublicVisible, allowVoteEditing } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Event id is required" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);

    await sql`
      UPDATE award_events
      SET
        title = COALESCE(${title || null}, title),
        description = COALESCE(${description !== undefined ? description : null}, description),
        banner_url = COALESCE(${bannerUrl !== undefined ? bannerUrl : null}, banner_url),
        status = COALESCE(${status || null}, status),
        start_date = COALESCE(${startDate ? new Date(startDate).toISOString() : null}, start_date),
        end_date = COALESCE(${endDate ? new Date(endDate).toISOString() : null}, end_date),
        is_public_visible = COALESCE(${isPublicVisible !== undefined ? Boolean(isPublicVisible) : null}, is_public_visible),
        allow_vote_editing = COALESCE(${allowVoteEditing !== undefined ? Boolean(allowVoteEditing) : null}, allow_vote_editing),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true, message: "Award event updated successfully" });
  } catch (err: any) {
    console.error("[PUT /api/erp/awards/events] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update award event" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Event id is required" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);

    // Clean up all related child rows
    await sql`DELETE FROM award_votes WHERE event_id = ${id};`;
    await sql`DELETE FROM award_ballots WHERE event_id = ${id};`;
    await sql`DELETE FROM award_results WHERE event_id = ${id};`;
    await sql`DELETE FROM award_winners WHERE event_id = ${id};`;
    await sql`DELETE FROM award_nominees WHERE event_id = ${id};`;
    await sql`DELETE FROM award_categories WHERE event_id = ${id};`;
    await sql`DELETE FROM award_audit_logs WHERE event_id = ${id};`;
    await sql`DELETE FROM award_events WHERE id = ${id};`;

    return NextResponse.json({ success: true, message: "Award event deleted successfully" });
  } catch (err: any) {
    console.error("[DELETE /api/erp/awards/events] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete award event" },
      { status: 500 }
    );
  }
}
