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
      categoryId,
      employeeId,
      nominationPitch = "",
      displayOrder = 0,
    } = body;

    if (!eventId || !categoryId || !employeeId) {
      return NextResponse.json(
        { success: false, error: "eventId, categoryId, and employeeId are required" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);

    // Look up employee details in "User" table
    const userRows = await sql`
      SELECT name, department, designation, avatar
      FROM "User"
      WHERE (LOWER("tenantSlug") = ${tenantSlug} OR "tenantSlug" = '' OR "tenantSlug" IS NULL)
        AND (id = ${employeeId} OR LOWER(email) = ${employeeId.toLowerCase()})
      LIMIT 1;
    `;

    let employeeName = body.employeeName || "";
    let department = body.department || "";
    let designation = body.designation || "";
    let avatarUrl = body.avatarUrl || "/character1.jpg";

    if (userRows.length > 0) {
      const u = userRows[0];
      if (!employeeName) employeeName = u.name;
      if (!department) department = u.department || "";
      if (!designation) designation = u.designation || "";
      if (!avatarUrl || avatarUrl === "/character1.jpg") avatarUrl = u.avatar || "/character1.jpg";
    }

    if (!employeeName) {
      employeeName = "Employee " + employeeId.slice(0, 5);
    }

    const nomineeId = "nom-" + crypto.randomUUID();

    await sql`
      INSERT INTO award_nominees (
        id, category_id, event_id, tenant_slug, employee_id,
        employee_name, department, designation, avatar_url,
        nomination_pitch, display_order, is_active, created_at, updated_at
      ) VALUES (
        ${nomineeId}, ${categoryId}, ${eventId}, ${tenantSlug}, ${employeeId},
        ${employeeName}, ${department}, ${designation}, ${avatarUrl},
        ${nominationPitch}, ${Number(displayOrder) || 0}, TRUE,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT (category_id, employee_id)
      DO UPDATE SET
        nomination_pitch = EXCLUDED.nomination_pitch,
        is_active = TRUE,
        updated_at = CURRENT_TIMESTAMP;
    `;

    return NextResponse.json({
      success: true,
      nomineeId,
      message: "Nominee added successfully",
    });
  } catch (err: any) {
    console.error("[POST /api/erp/awards/nominees] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to add nominee" },
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
    const id = searchParams.get("id") || searchParams.get("nomineeId");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Nominee id is required" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);

    await sql`
      DELETE FROM award_nominees
      WHERE id = ${id};
    `;

    return NextResponse.json({
      success: true,
      message: "Nominee removed successfully",
    });
  } catch (err: any) {
    console.error("[DELETE /api/erp/awards/nominees] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to remove nominee" },
      { status: 500 }
    );
  }
}
