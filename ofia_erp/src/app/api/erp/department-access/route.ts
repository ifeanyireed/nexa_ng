import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { DEFAULT_DEPARTMENT_ACCESS, DepartmentAccessItem } from "@/lib/department-access";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tenantSlug =
    request.headers.get("x-tenant-slug") ||
    url.searchParams.get("tenant") ||
    url.searchParams.get("tenant_slug") ||
    url.searchParams.get("orgId") ||
    "neweratransports";

  const pool = getDbPool();
  if (!pool) {
    return NextResponse.json(DEFAULT_DEPARTMENT_ACCESS);
  }

  try {
    const permRes = await pool.query(
      `SELECT id, "departmentCode", "departmentName", "accessiblePages", "accessibleTabs", "isEnabled" 
       FROM "TenantDepartmentPermission" 
       WHERE "tenantId" = $1 OR "tenantId" = 'neweratransports' OR "tenantId" = 'default'
       ORDER BY "departmentName" ASC`,
      [tenantSlug]
    );

    if (permRes.rows.length > 0) {
      const list: DepartmentAccessItem[] = permRes.rows.map((row) => {
        let pages = [];
        try { pages = typeof row.accessiblePages === "string" ? JSON.parse(row.accessiblePages) : row.accessiblePages; } catch {}
        let tabs = {};
        try { tabs = typeof row.accessibleTabs === "string" ? JSON.parse(row.accessibleTabs) : row.accessibleTabs; } catch {}

        return {
          id: row.id,
          departmentCode: row.departmentCode,
          departmentName: row.departmentName,
          accessiblePages: pages || [],
          accessibleTabs: tabs || {},
          isEnabled: row.isEnabled ?? true,
        };
      });

      return NextResponse.json(list);
    }

    return NextResponse.json(DEFAULT_DEPARTMENT_ACCESS);
  } catch (err: any) {
    console.warn("Direct department access fetch error:", err);
    return NextResponse.json(DEFAULT_DEPARTMENT_ACCESS);
  }
}
