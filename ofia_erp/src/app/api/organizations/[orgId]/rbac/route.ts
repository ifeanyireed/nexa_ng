import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

const rawUserUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "https://ofia-user-service.onrender.com";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

const DEFAULT_ERP_MODULES = [
  "ai",
  "crm",
  "marketplace",
  "shop",
  "accounting",
  "hr",
  "users",
];

const DEFAULT_ROLES = [
  "tenant_provision",
  "admin",
  "md",
  "manager",
  "employee",
  "hr",
  "accountant",
];

function generateDefaultMatrix(): Record<string, Record<string, boolean>> {
  const matrix: Record<string, Record<string, boolean>> = {};
  for (const role of DEFAULT_ROLES) {
    matrix[role] = {};
    for (const mod of DEFAULT_ERP_MODULES) {
      matrix[role][mod] = true;
    }
  }
  return matrix;
}

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
            OR REPLACE(LOWER(name), ' ', '') = REPLACE(LOWER($1), ' ', '')
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

      if (orgRes.rows.length === 0) {
        orgRes = await pool.query(
          `SELECT id, slug FROM "Organization" 
           ORDER BY "created_at" ASC NULLS LAST 
           LIMIT 1`
        );
      }

      if (orgRes.rows.length > 0) {
        canonicalSlug = orgRes.rows[0].slug;
        canonicalId = orgRes.rows[0].id;
      }
    } catch (err) {
      console.warn("Error resolving canonical organization:", err);
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
  const { canonicalSlug, canonicalId } = await resolveCanonicalOrg(pool, orgId);

  // 1. Try remote microservice using canonicalSlug
  try {
    const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(canonicalSlug)}/rbac`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.matrix && Object.keys(data.matrix).length > 0) {
        return NextResponse.json(data);
      }
    }
  } catch {
    // Fall back to direct Neon PostgreSQL read
  }

  // 2. Query Neon PostgreSQL directly
  try {
    if (pool) {
      const permRes = await pool.query(
        `SELECT role, "moduleKey", "isEnabled" 
         FROM "TenantRolePermission" 
         WHERE "tenantId" = $1 OR "tenantId" = $2`,
        [canonicalSlug, canonicalId]
      );

      if (permRes.rows.length > 0) {
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
      }
    }
  } catch (err: any) {
    console.warn("Neon PostgreSQL RBAC read error in ofia_erp:", err.message);
  }

  return NextResponse.json({
    tenant_id: canonicalSlug || orgId,
    matrix: generateDefaultMatrix(),
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;

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

    // Try remote microservice using canonicalSlug
    try {
      await fetch(`${USER_BASE}/organizations/${encodeURIComponent(canonicalSlug)}/rbac`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matrix }),
      });
    } catch {
      // service_users is offline, write directly to Neon
    }

    if (pool) {
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
