import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { DepartmentAccessItem } from "@/lib/department-access-constants";

export const dynamic = "force-dynamic";

async function resolveCanonicalOrg(pool: any, rawOrgId: string) {
  const decoded = decodeURIComponent(rawOrgId || "").trim();
  let canonicalSlug = decoded;
  let canonicalId = decoded;

  const orgRes = await pool.query(
    `SELECT id, slug FROM "Organization" 
     WHERE id = $1 
        OR slug = $1 
        OR domain = $1 
        OR LOWER(slug) = LOWER($1)
        OR LOWER(name) = LOWER($1)
     LIMIT 1`,
    [decoded]
  );

  if (orgRes.rows.length > 0) {
    canonicalSlug = orgRes.rows[0].slug;
    canonicalId = orgRes.rows[0].id;
  }

  return { canonicalSlug, canonicalId };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId?: string }> | { orgId?: string } }
) {
  const resolvedParams = await params;
  const orgId = resolvedParams?.orgId || "";

  try {
    const pool = getDbPool();
    const { canonicalSlug, canonicalId } = await resolveCanonicalOrg(pool, orgId);

    // 1. Fetch from TenantDepartmentPermission
    const permRes = await pool.query(
      `SELECT id, "departmentCode", "departmentName", "accessiblePages", "accessibleTabs", "isEnabled" 
       FROM "TenantDepartmentPermission" 
       WHERE "tenantId" = $1 OR "tenantId" = $2
       ORDER BY "departmentName" ASC`,
      [canonicalSlug, canonicalId]
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

    // 2. Fetch from Department table accessiblePages/accessibleTabs
    const deptRows = await pool.query(
      `SELECT code, name, "accessiblePages", "accessibleTabs" 
       FROM "Department" 
       WHERE "tenantSlug" = $1 OR "tenantSlug" = $2
       ORDER BY code ASC`,
      [canonicalSlug, canonicalId]
    );

    if (deptRows.rows.length > 0) {
      const list: DepartmentAccessItem[] = deptRows.rows.map((row: any) => {
        let pages = [];
        try { pages = typeof row.accessiblePages === "string" ? JSON.parse(row.accessiblePages) : row.accessiblePages; } catch {}
        let tabs = {};
        try { tabs = typeof row.accessibleTabs === "string" ? JSON.parse(row.accessibleTabs) : row.accessibleTabs; } catch {}

        return {
          id: `dept_perm_${canonicalSlug}_${row.code}`,
          departmentCode: row.code,
          departmentName: row.name,
          accessiblePages: pages || [],
          accessibleTabs: tabs || {},
          isEnabled: true,
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
