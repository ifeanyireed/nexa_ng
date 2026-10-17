import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

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
        OR REPLACE(LOWER(name), ' ', '') = REPLACE(LOWER($1), ' ', '')
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

    const permRes = await pool.query(
      `SELECT role, "moduleKey", "isEnabled" 
       FROM "TenantRolePermission" 
       WHERE "tenantId" = $1 OR "tenantId" = $2`,
      [canonicalSlug, canonicalId]
    );

    const matrix: Record<string, Record<string, boolean>> = {};
    for (const row of permRes.rows) {
      if (!matrix[row.role]) {
        matrix[row.role] = {};
      }
      matrix[row.role][row.moduleKey] = Boolean(row.isEnabled);
    }

    return NextResponse.json({
      tenant_id: canonicalSlug,
      matrix,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "RBAC database query error: " + err.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId?: string }> | { orgId?: string } }
) {
  const resolvedParams = await params;
  const orgId = resolvedParams?.orgId || "";

  try {
    const body = await request.json();
    const matrix = body.matrix;

    if (!matrix || typeof matrix !== "object") {
      return NextResponse.json(
        { error: "Invalid RBAC payload: 'matrix' object required" },
        { status: 400 }
      );
    }

    const pool = getDbPool();
    const { canonicalSlug, canonicalId } = await resolveCanonicalOrg(pool, orgId);

    const targets = Array.from(new Set([canonicalSlug, canonicalId])).filter(Boolean);
    const valuesPlaceholders: string[] = [];
    const queryParams: any[] = [];
    let pIdx = 1;

    for (const targetTenantId of targets) {
      for (const [role, modules] of Object.entries(matrix as Record<string, Record<string, boolean>>)) {
        for (const [moduleKey, isEnabled] of Object.entries(modules)) {
          const permId = `perm_${targetTenantId}_${role}_${moduleKey}`;
          valuesPlaceholders.push(
            `($${pIdx}, $${pIdx + 1}, $${pIdx + 2}, $${pIdx + 3}, $${pIdx + 4}, NOW(), NOW())`
          );
          queryParams.push(permId, targetTenantId, role, moduleKey, Boolean(isEnabled));
          pIdx += 5;
        }
      }
    }

    if (valuesPlaceholders.length > 0) {
      const queryText = `
        INSERT INTO "TenantRolePermission" (id, "tenantId", role, "moduleKey", "isEnabled", "createdAt", "updatedAt")
        VALUES ${valuesPlaceholders.join(", ")}
        ON CONFLICT ("tenantId", role, "moduleKey")
        DO UPDATE SET "isEnabled" = EXCLUDED."isEnabled", "updatedAt" = NOW()
      `;
      await pool.query(queryText, queryParams);
    }

    return NextResponse.json({
      success: true,
      message: "RBAC matrix updated in Neon PostgreSQL",
      tenant_id: canonicalSlug,
      matrix,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to persist RBAC: " + err.message },
      { status: 500 }
    );
  }
}
