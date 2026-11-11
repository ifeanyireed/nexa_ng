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
    const {
      eventId,
      name,
      description = "",
      criteria = "",
      iconName = "Award",
      imageUrl = "",
      maxWinners = 1,
      minSelections = 1,
      sortOrder = 0,
      eligibleDepartments = [],
    } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "eventId is required" },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const categoryId = "cat-" + crypto.randomUUID();
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const sql = await getTenantSql(tenantSlug);

    await sql`
      INSERT INTO award_categories (
        id, event_id, tenant_slug, name, slug, description, criteria,
        icon_name, image_url, max_winners, min_selections, sort_order,
        eligible_departments, created_at, updated_at
      ) VALUES (
        ${categoryId}, ${eventId}, ${tenantSlug}, ${name.trim()}, ${slug},
        ${description}, ${criteria}, ${iconName}, ${imageUrl},
        ${Number(maxWinners) || 1}, ${Number(minSelections) || 1},
        ${Number(sortOrder) || 0}, ${JSON.stringify(eligibleDepartments)},
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      );
    `;

    return NextResponse.json({
      success: true,
      categoryId,
      message: "Category created successfully",
    });
  } catch (err: any) {
    console.error("[POST /api/erp/awards/categories] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create category" },
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
    const { id, name, description, criteria, maxWinners, iconName, sortOrder } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Category id is required" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);

    await sql`
      UPDATE award_categories
      SET
        name = COALESCE(${name !== undefined ? name.trim() : null}, name),
        description = COALESCE(${description !== undefined ? description : null}, description),
        criteria = COALESCE(${criteria !== undefined ? criteria : null}, criteria),
        max_winners = COALESCE(${maxWinners !== undefined ? Number(maxWinners) : null}, max_winners),
        icon_name = COALESCE(${iconName !== undefined ? iconName : null}, icon_name),
        sort_order = COALESCE(${sortOrder !== undefined ? Number(sortOrder) : null}, sort_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id};
    `;

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (err: any) {
    console.error("[PUT /api/erp/awards/categories] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update category" },
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
        { success: false, error: "Category id is required" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);

    // Clean up nominees, votes, results associated with this category
    await sql`DELETE FROM award_votes WHERE category_id = ${id};`;
    await sql`DELETE FROM award_results WHERE category_id = ${id};`;
    await sql`DELETE FROM award_nominees WHERE category_id = ${id};`;
    await sql`DELETE FROM award_categories WHERE id = ${id};`;

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err: any) {
    console.error("[DELETE /api/erp/awards/categories] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
