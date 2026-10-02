import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/jwt-auth";
import { getDbPool } from "@/lib/db";
import { SUPER_ADMIN_ERP_MODULES } from "@/lib/admin-data";
import crypto from "crypto";

const rawUserUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "http://localhost:8081";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

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
    for (const mod of SUPER_ADMIN_ERP_MODULES) {
      matrix[role][mod.key] = true;
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
      console.warn("Error resolving canonical organization in ofia_admin:", err);
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

  // 1. Try to fetch from remote Go microservice if available using canonicalSlug
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
    // service_users is offline or unreachable, fall back to direct Neon PostgreSQL
  }

  // 2. Fetch directly from Neon PostgreSQL
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
    console.warn("Neon PostgreSQL RBAC read error:", err.message);
  }

  // 3. Fallback to default matrix
  return NextResponse.json({
    tenant_id: orgId,
    matrix: generateDefaultMatrix(),
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { errorResponse, user } = await authenticateApiRequest(request, {
    allowedRoles: ["SUPER_ADMIN"],
    requirePermission: "canManageTenants",
  });
  if (errorResponse) return errorResponse;

  const { orgId } = await params;

  try {
    const body = await request.json();
    const matrix = body.matrix as Record<string, Record<string, boolean>>;

    if (!matrix || typeof matrix !== "object") {
      return NextResponse.json(
        { error: "Invalid RBAC payload: 'matrix' object required" },
        { status: 400 }
      );
    }

    // 1. Forward to remote microservice if alive
    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json(
        { error: "Database pool not configured" },
        { status: 500 }
      );
    }

    const { canonicalSlug, canonicalId } = await resolveCanonicalOrg(pool, orgId);

    // 1. Forward to remote microservice if alive
    try {
      await fetch(`${USER_BASE}/organizations/${encodeURIComponent(canonicalSlug)}/rbac`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matrix }),
      });
    } catch {
      // service_users is offline, continuing to direct Neon write
    }

    const targets = Array.from(new Set([canonicalSlug, canonicalId])).filter(Boolean);

    const valuesPlaceholders: string[] = [];
    const queryParams: any[] = [];
    let pIdx = 1;

    for (const targetTenantId of targets) {
      for (const [role, modules] of Object.entries(matrix)) {
        for (const [moduleKey, isEnabled] of Object.entries(modules)) {
          const permId = `perm_${targetTenantId}_${role}_${moduleKey}`;
          valuesPlaceholders.push(
            `($${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, NOW(), NOW())`
          );
          queryParams.push(permId, targetTenantId, role, moduleKey, Boolean(isEnabled));
        }
      }
    }

    if (valuesPlaceholders.length > 0) {
      const batchSql = `
        INSERT INTO "TenantRolePermission" (id, "tenantId", role, "moduleKey", "isEnabled", "createdAt", "updatedAt")
        VALUES ${valuesPlaceholders.join(", ")}
        ON CONFLICT ("tenantId", role, "moduleKey")
        DO UPDATE SET "isEnabled" = EXCLUDED."isEnabled", "updatedAt" = NOW()
      `;
      await pool.query(batchSql, queryParams);
    }

    // Optional: Log audit action
    try {
      const auditId = `audit_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      await pool.query(
        `INSERT INTO "TenantPermissionAuditLog" (id, "tenantId", "actorUserId", "targetRole", "moduleKey", "newState", "createdAt")
         VALUES ($1, $2, $3, 'ALL_ROLES', 'BATCH_SWITCHBOARD', true, NOW())`,
        [auditId, canonicalSlug, user?.email || "superadmin"]
      );
    } catch {
      // Non-fatal if audit logging encounters a schema variant
    }

    return NextResponse.json({
      success: true,
      message: `Tenant RBAC matrix successfully persisted to Neon Postgres database for '${canonicalSlug}'`,
      tenant_id: canonicalSlug,
      matrix,
    });
  } catch (err: any) {
    console.error("Neon PostgreSQL RBAC update error:", err);
    return NextResponse.json(
      { error: "Failed to persist RBAC to database: " + err.message },
      { status: 500 }
    );
  }
}
