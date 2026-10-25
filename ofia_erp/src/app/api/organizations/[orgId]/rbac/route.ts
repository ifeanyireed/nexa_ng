import { NextResponse } from "next/server";
import { MASTER_CONNECTION_STRING, getTenantSql } from "@/lib/tenant-db-resolver";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

const rawUserUrl = process.env.USER_SERVICE_URL || process.env.NEXT_PUBLIC_USER_SERVICE_URL || "";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl ? (cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`) : "";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId?: string }> | { orgId?: string } }
) {
  const resolvedParams = await params;
  const rawOrg = (resolvedParams?.orgId || "").trim();

  if (!rawOrg) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  const cleanOrg = rawOrg.toLowerCase();

  // 1. Direct authoritative lookup from PostgreSQL (platform_tenants + TenantRolePermission)
  if (MASTER_CONNECTION_STRING) {
    try {
      const masterSql = neon(MASTER_CONNECTION_STRING);
      const [tenant] = await masterSql`
        SELECT id, slug, database_url, erp_modules, shop_sub_modules, mobility_sub_modules
        FROM platform_tenants
        WHERE LOWER(slug) = ${cleanOrg}
           OR REPLACE(LOWER(slug), '-', '') = REPLACE(${cleanOrg}, '-', '')
        LIMIT 1;
      `;

      if (tenant) {
        const matrix: Record<string, Record<string, boolean>> = {
          admin: {},
          tenant_provision: {},
        };

        // Query TenantRolePermission from tenant's dedicated DB
        try {
          const dedicatedSql = await getTenantSql(cleanOrg);
          const perms = await dedicatedSql`
            SELECT role, "moduleKey", "isEnabled"
            FROM "TenantRolePermission"
            WHERE LOWER("tenantId") = ${cleanOrg}
               OR "tenantId" = ${tenant.id || ""};
          `;

          if (Array.isArray(perms) && perms.length > 0) {
            for (const p of perms) {
              if (!matrix[p.role]) matrix[p.role] = {};
              matrix[p.role][p.moduleKey] = p.isEnabled;
            }
          }
        } catch (permErr: any) {
          console.warn(`[RBAC API] Dedicated DB permissions query note for '${cleanOrg}':`, permErr.message);
        }

        // Strict enforcement: platform_tenants.erp_modules is the master ground truth!
        const erpModules = tenant.erp_modules || {};
        for (const [key, isEnabled] of Object.entries(erpModules)) {
          if (isEnabled === false) {
            if (!matrix.admin) matrix.admin = {};
            if (!matrix.tenant_provision) matrix.tenant_provision = {};
            matrix.admin[key] = false;
            matrix.tenant_provision[key] = false;

            // When user management is not provisioned, enforce that all portals and roles have users/employee/manager/md disabled
            if (key === "users") {
              matrix.admin.employee = false;
              matrix.admin.manager = false;
              matrix.admin.md = false;
              matrix.tenant_provision.employee = false;
              matrix.tenant_provision.manager = false;
              matrix.tenant_provision.md = false;

              for (const rKey of Object.keys(matrix)) {
                matrix[rKey].users = false;
                matrix[rKey].employee = false;
                matrix[rKey].manager = false;
                matrix[rKey].md = false;
              }
            }
          } else if (isEnabled === true) {
            if (!matrix.admin) matrix.admin = {};
            if (!matrix.tenant_provision) matrix.tenant_provision = {};
            if (matrix.admin[key] === undefined) matrix.admin[key] = true;
            if (matrix.tenant_provision[key] === undefined) matrix.tenant_provision[key] = true;
          }
        }

        return NextResponse.json({
          tenant_id: cleanOrg,
          matrix,
        });
      }
    } catch (dbErr: any) {
      console.warn(`[RBAC API] PostgreSQL direct lookup note for '${cleanOrg}':`, dbErr.message);
    }
  }

  // 2. Microservice fallback if USER_BASE is configured
  if (USER_BASE) {
    try {
      const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(cleanOrg)}/rbac`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(request.headers.get("authorization") ? { authorization: request.headers.get("authorization")! } : {}),
          "x-tenant-slug": cleanOrg,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });

      const data = await res.json().catch(() => null);
      if (data && data.matrix) {
        return NextResponse.json(data, { status: res.status });
      }
    } catch (err: any) {
      console.warn(`[RBAC API] Microservice fallback note for '${cleanOrg}':`, err.message);
    }
  }

  return NextResponse.json(
    { tenant_id: cleanOrg, matrix: {} },
    { status: 200 }
  );
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId?: string }> | { orgId?: string } }
) {
  const resolvedParams = await params;
  const rawOrg = (resolvedParams?.orgId || "").trim();

  if (!rawOrg) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  const cleanOrg = rawOrg.toLowerCase();

  try {
    const rawBody = await request.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {}

    const matrix = body.matrix || body;

    // Direct persistence to dedicated database
    try {
      const dedicatedSql = await getTenantSql(cleanOrg);
      const records: Array<{ id: string; tenantId: string; role: string; moduleKey: string; isEnabled: boolean }> = [];

      for (const [role, modules] of Object.entries(matrix || {})) {
        if (typeof modules === "object" && modules !== null) {
          for (const [modKey, isEnabled] of Object.entries(modules as Record<string, boolean>)) {
            records.push({
              id: `${cleanOrg}_${role}_${modKey}`,
              tenantId: cleanOrg,
              role,
              moduleKey: modKey,
              isEnabled: Boolean(isEnabled),
            });
          }
        }
      }

      if (records.length > 0) {
        const jsonStr = JSON.stringify(records);
        await dedicatedSql`
          INSERT INTO "TenantRolePermission" (
            id, "tenantId", role, "moduleKey", "isEnabled", "createdAt", "updatedAt"
          )
          SELECT 
            x.id,
            x."tenantId",
            x.role,
            x."moduleKey",
            x."isEnabled",
            NOW(),
            NOW()
          FROM json_to_recordset(${jsonStr}::json) AS x(
            id VARCHAR(191),
            "tenantId" VARCHAR(191),
            role VARCHAR(50),
            "moduleKey" VARCHAR(100),
            "isEnabled" BOOLEAN
          )
          ON CONFLICT ("tenantId", role, "moduleKey")
          DO UPDATE SET
            "isEnabled" = EXCLUDED."isEnabled",
            "updatedAt" = NOW();
        `;
      }
    } catch (saveErr: any) {
      console.warn(`[RBAC API] Dedicated DB write note for '${cleanOrg}':`, saveErr.message);
    }

    // Secondary non-blocking microservice sync
    if (USER_BASE) {
      fetch(`${USER_BASE}/organizations/${encodeURIComponent(cleanOrg)}/rbac`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(request.headers.get("authorization") ? { authorization: request.headers.get("authorization")! } : {}),
          "x-tenant-slug": cleanOrg,
        },
        body: rawBody,
        signal: AbortSignal.timeout(5000),
      }).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      message: "Tenant RBAC matrix saved",
      tenant_id: cleanOrg,
      matrix,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error saving RBAC: " + err.message },
      { status: 500 }
    );
  }
}
