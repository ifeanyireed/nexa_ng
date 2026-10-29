import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

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
    const emailFilter = searchParams.get("email");

    const sql = await getTenantSql(tenantSlug);

    const rows = await sql`
      SELECT 
        id,
        email,
        name,
        role,
        COALESCE(department, '') AS department,
        COALESCE(designation, '') AS designation,
        COALESCE(company, '') AS company,
        COALESCE(location, '') AS location,
        COALESCE(avatar, '') AS avatar,
        COALESCE("tenantSlug", '') AS "tenantSlug",
        COALESCE("assignedPages", '[]'::jsonb) AS "assignedPages"
      FROM "User"
      WHERE (
        LOWER("tenantSlug") = ${tenantSlug}
        OR "tenantSlug" = ''
        OR "tenantSlug" IS NULL
      )
      ${emailFilter ? sql`AND LOWER(email) = ${emailFilter.trim().toLowerCase()}` : sql``}
      ORDER BY name ASC;
    `;

    const users = rows.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      department: u.department,
      designation: u.designation,
      company: u.company,
      location: u.location,
      avatar: u.avatar,
      tenantSlug: u.tenantSlug,
      assignedPages: u.assignedPages,
    }));

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    console.error("[Users GET] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users: " + err.message, users: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    const body = JSON.parse(bodyText || "{}");
    const tenantSlug = getValidatedTenantSlug(request, body);

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const id = body.id && String(body.id).trim()
      ? String(body.id).trim()
      : `USR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const email = (body.email || "").trim().toLowerCase();
    const name = (body.name || "").trim();
    const role = (body.role || "employee").trim();
    const department = (body.department || "").trim();
    const designation = (body.designation || department || "").trim();
    const company = (body.company || "").trim();
    const location = (body.location || "").trim();
    const avatar = String(body.avatar || "1");
    const assignedPages = Array.isArray(body.assignedPages) ? body.assignedPages : [];
    const assignedPagesJson = JSON.stringify(assignedPages);

    const sql = await getTenantSql(tenantSlug);

    const existing = await sql`
      SELECT id FROM "User"
      WHERE (id = ${id} OR LOWER(email) = ${email})
        AND (LOWER("tenantSlug") = ${tenantSlug} OR "tenantSlug" = '' OR "tenantSlug" IS NULL)
      LIMIT 1;
    `;

    if (existing.length > 0) {
      const existingId = existing[0].id;
      await sql`
        UPDATE "User"
        SET name = COALESCE(NULLIF(${name}, ''), name),
            role = COALESCE(NULLIF(${role}, ''), role),
            department = COALESCE(NULLIF(${department}, ''), department),
            designation = COALESCE(NULLIF(${designation}, ''), designation),
            company = COALESCE(NULLIF(${company}, ''), company),
            location = COALESCE(NULLIF(${location}, ''), location),
            avatar = COALESCE(NULLIF(${avatar}, ''), avatar),
            "assignedPages" = ${assignedPagesJson}::jsonb,
            "tenantSlug" = ${tenantSlug},
            "updatedAt" = NOW()
        WHERE id = ${existingId};
      `;

      return NextResponse.json({
        success: true,
        message: "User updated successfully",
        user: {
          id: existingId,
          email,
          name,
          role,
          department,
          designation,
          company,
          location,
          avatar,
          tenantSlug,
          assignedPages,
        },
      });
    }

    await sql`
      INSERT INTO "User" (
        id, email, name, role, department, designation, company, location, avatar, "tenantSlug", "assignedPages", "createdAt", "updatedAt"
      ) VALUES (
        ${id}, ${email}, ${name}, ${role}, ${department}, ${designation}, ${company}, ${location}, ${avatar}, ${tenantSlug}, ${assignedPagesJson}::jsonb, NOW(), NOW()
      );
    `;

    return NextResponse.json({
      success: true,
      message: "User onboarded successfully",
      user: {
        id,
        email,
        name,
        role,
        department,
        designation,
        company,
        location,
        avatar,
        tenantSlug,
        assignedPages,
      },
    });
  } catch (err: any) {
    console.error("[Users POST] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save user: " + err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const tenantSlug = getValidatedTenantSlug(request);

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    const cleanId = String(id).trim();
    const sql = await getTenantSql(tenantSlug);

    await sql`
      DELETE FROM "User"
      WHERE id = ${cleanId} AND LOWER("tenantSlug") = ${tenantSlug};
    `;

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (err: any) {
    console.error("[Users DELETE] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete user: " + err.message },
      { status: 500 }
    );
  }
}
