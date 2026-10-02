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
  "logistics",
  "accounting",
  "hr",
  "users",
  "access_control",
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;

  // 1. Try remote microservice
  try {
    const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}/rbac`, {
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
    const pool = getDbPool();
    if (pool) {
      const orgRes = await pool.query(
        `SELECT id, slug FROM "Organization" WHERE id = $1 OR slug = $1 OR domain = $1 LIMIT 1`,
        [orgId]
      );
      const canonicalSlug = orgRes.rows[0]?.slug || orgId;
      const canonicalId = orgRes.rows[0]?.id || orgId;

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
    tenant_id: orgId,
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

    // Try remote microservice
    try {
      await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}/rbac`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matrix }),
      });
    } catch {
      // service_users is offline, write directly to Neon
    }

    const pool = getDbPool();
    if (pool) {
      const orgRes = await pool.query(
        `SELECT id, slug FROM "Organization" WHERE id = $1 OR slug = $1 OR domain = $1 LIMIT 1`,
        [orgId]
      );
      const canonicalSlug = orgRes.rows[0]?.slug || orgId;
      const canonicalId = orgRes.rows[0]?.id || orgId;
      const targets = Array.from(new Set([canonicalSlug, canonicalId])).filter(Boolean);

      for (const targetTenantId of targets) {
        for (const [role, modules] of Object.entries(matrix as Record<string, Record<string, boolean>>)) {
          for (const [moduleKey, isEnabled] of Object.entries(modules)) {
            const permId = `perm_${targetTenantId}_${role}_${moduleKey}`;
            await pool.query(
              `INSERT INTO "TenantRolePermission" (id, "tenantId", role, "moduleKey", "isEnabled", "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
               ON CONFLICT ("tenantId", role, "moduleKey")
               DO UPDATE SET "isEnabled" = EXCLUDED."isEnabled", "updatedAt" = NOW()`,
              [permId, targetTenantId, role, moduleKey, Boolean(isEnabled)]
            );
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "RBAC matrix updated in Neon PostgreSQL",
      tenant_id: orgId,
      matrix,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to persist RBAC: " + err.message },
      { status: 500 }
    );
  }
}
