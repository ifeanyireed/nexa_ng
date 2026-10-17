import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { DepartmentAccessItem } from "@/lib/department-access-constants";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tenantSlug =
    request.headers.get("x-tenant-slug") ||
    url.searchParams.get("tenant") ||
    url.searchParams.get("tenant_slug") ||
    url.searchParams.get("orgId") ||
    "";

  try {
    const pool = getDbPool();
    const permRes = await pool.query(
      `SELECT id, "departmentCode", "departmentName", "accessiblePages", "accessibleTabs", "isEnabled" 
       FROM "TenantDepartmentPermission" 
       WHERE "tenantId" = $1
       ORDER BY "departmentName" ASC`,
      [tenantSlug]
    );

    if (permRes.rows.length > 0) {
      const list: DepartmentAccessItem[] = permRes.rows.map((row: any) => {
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

    return NextResponse.json([]);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Department access query error: " + err.message },
      { status: 500 }
    );
  }
}
