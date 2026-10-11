import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { DEFAULT_DEPARTMENT_ACCESS, DepartmentAccessItem } from "@/lib/department-access";

async function resolveCanonicalOrg(pool: any, rawOrgId: string) {
  const decoded = decodeURIComponent(rawOrgId || "").trim();
  let canonicalSlug = decoded;
  let canonicalId = decoded;

  if (pool) {
    try {
      let orgRes = await pool.query(
        `SELECT id, slug FROM "Organization" 
         WHERE id = $1 
            OR slug = $1 
            OR domain = $1 
            OR LOWER(slug) = LOWER($1)
            OR LOWER(name) = LOWER($1)
         LIMIT 1`,
        [decoded]
      );

      if (orgRes.rows.length === 0 && (
        !decoded ||
        decoded === "default" ||
        decoded === "Ofia ERP" ||
        decoded.toLowerCase().includes("newera")
      )) {
        orgRes = await pool.query(
          `SELECT id, slug FROM "Organization" 
           WHERE slug = 'neweratransports' OR id = '1aa8c687-b71d-4188-9de2-371aa5dfa9e6'
           ORDER BY "created_at" ASC NULLS LAST 
           LIMIT 1`
        );
      }

      if (orgRes.rows.length > 0) {
        canonicalSlug = orgRes.rows[0].slug;
        canonicalId = orgRes.rows[0].id;
      }
    } catch (err) {
      console.warn("Error resolving canonical organization in erp department access:", err);
    }
  }

  return { canonicalSlug, canonicalId };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const pool = getDbPool();

  try {
    if (!pool) {
      return NextResponse.json(DEFAULT_DEPARTMENT_ACCESS);
    }

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

    // 2. Fallback to Department table accessiblePages/accessibleTabs
    const deptRows = await pool.query(
      `SELECT code, name, "accessiblePages", "accessibleTabs" 
       FROM "Department" 
       WHERE "tenantSlug" = $1 OR "tenantSlug" = $2
       ORDER BY code ASC`,
      [canonicalSlug, canonicalId]
    );

    if (deptRows.rows.length > 0) {
      const list: DepartmentAccessItem[] = deptRows.rows.map((row) => {
        let pages = [];
        try { pages = typeof row.accessiblePages === "string" ? JSON.parse(row.accessiblePages) : row.accessiblePages; } catch {}
        let tabs = {};
        try { tabs = typeof row.accessibleTabs === "string" ? JSON.parse(row.accessibleTabs) : row.accessibleTabs; } catch {}

        return {
          id: `dept_perm_${canonicalSlug}_${row.code}`,
          departmentCode: row.code,
          departmentName: row.name,
          accessiblePages: (pages && pages.length > 0) ? pages : ["employee"],
          accessibleTabs: tabs || {},
          isEnabled: true,
        };
      });

      return NextResponse.json(list);
    }

    return NextResponse.json(DEFAULT_DEPARTMENT_ACCESS);
  } catch (err: any) {
    console.error("Error retrieving department access in ofia_erp:", err);
    return NextResponse.json(DEFAULT_DEPARTMENT_ACCESS);
  }
}
