import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

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
    const query = searchParams.get("q") || "";

    const sql = await getTenantSql(tenantSlug);

    const userRows = await sql`
      SELECT id, name, email, department, designation, avatar, role
      FROM "User"
      WHERE (LOWER("tenantSlug") = ${tenantSlug} OR "tenantSlug" = '' OR "tenantSlug" IS NULL)
      ORDER BY name ASC;
    `;

    let candidates = userRows.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      department: u.department || "",
      designation: u.designation || "",
      avatar: u.avatar || "/character1.jpg",
      role: u.role || "employee",
    }));

    if (query.trim()) {
      const q = query.toLowerCase();
      candidates = candidates.filter(
        (c: any) =>
          c.name.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q) ||
          c.designation.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ success: true, candidates });
  } catch (err: any) {
    console.error("[GET /api/erp/awards/candidates] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load candidates" },
      { status: 500 }
    );
  }
}
