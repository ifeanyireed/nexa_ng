import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const tenantSlug = getValidatedTenantSlug(request);

  if (!tenantSlug) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  try {
    const sql = await getTenantSql(tenantSlug);
    const rows = await sql`
      SELECT 
        code,
        name,
        COALESCE(head, '') AS head,
        COALESCE("headCount", 0) AS "headCount",
        COALESCE(budget, '') AS budget,
        COALESCE("costCenter", '') AS "costCenter",
        COALESCE("accessiblePages", '[]'::jsonb) AS "accessiblePages",
        COALESCE("accessibleTabs", '{}'::jsonb) AS "accessibleTabs"
      FROM "Department"
      WHERE LOWER("tenantSlug") = ${tenantSlug}
         OR "tenantSlug" = ''
         OR "tenantSlug" IS NULL
      ORDER BY name ASC;
    `;

    const mapped = rows.map((d: any) => ({
      id: `dept_${d.code || d.name}`,
      departmentCode: d.code,
      departmentName: d.name,
      accessiblePages: Array.isArray(d.accessiblePages) && d.accessiblePages.length > 0 ? d.accessiblePages : ["employee"],
      accessibleTabs: d.accessibleTabs || {},
      isEnabled: true,
    }));

    return NextResponse.json({ success: true, departments: mapped });
  } catch (err: any) {
    console.error("[Department Access GET] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch departments: " + err.message, departments: [] },
      { status: 500 }
    );
  }
}
