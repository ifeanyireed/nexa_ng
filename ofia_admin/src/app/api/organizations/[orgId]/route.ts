import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/jwt-auth";
import { getDbPool } from "@/lib/db";

const rawUserUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "http://localhost:8081";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { errorResponse } = await authenticateApiRequest(request);
  if (errorResponse) return errorResponse;

  const { orgId } = await params;

  // 1. Try remote microservice
  try {
    const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // fallback to direct Neon PostgreSQL query
  }

  // 2. Query Neon PostgreSQL directly
  try {
    const pool = getDbPool();
    if (pool) {
      const result = await pool.query(
        `SELECT 
          o.id, o.name, o.slug, o.domain, o.status, o.logo,
          COALESCE(o.plan_tier, o."planTier", 'GROWTH') as "planTier",
          COALESCE(o.plan_tier, o."planTier", 'GROWTH') as plan_tier,
          COALESCE(o.billing_cycle, o."billingCycle", 'MONTHLY') as billing_cycle,
          o.primary_color, o.secondary_color, o.login_image,
          o.hero_title, o.hero_subtitle,
          COALESCE(o.created_at, o."createdAt") as created_at,
          COALESCE(o.updated_at, o."updatedAt") as updated_at,
          u.name as "ownerName", u.email as "ownerEmail",
          u.name as owner_name, u.email as owner_email
        FROM "Organization" o
        LEFT JOIN "User" u ON (u.id = o.owner_id OR u.id = o."ownerId")
        WHERE o.id = $1 OR o.slug = $1 OR o.domain = $1
        LIMIT 1`,
        [orgId]
      );

      if (result.rows.length > 0) {
        return NextResponse.json(result.rows[0]);
      }
    }
  } catch (err: any) {
    console.warn("Neon PostgreSQL read error:", err.message);
  }

  return NextResponse.json({ id: orgId, error: "Tenant organization not found" }, { status: 404 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { errorResponse } = await authenticateApiRequest(request, {
    allowedRoles: ["SUPER_ADMIN"],
    requirePermission: "canManageTenants",
  });
  if (errorResponse) return errorResponse;

  const { orgId } = await params;

  try {
    const body = await request.json();

    // 1. Forward to remote microservice if available
    try {
      await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      // service_users is offline, write directly to Neon
    }

    // 2. Direct update to Neon PostgreSQL
    const pool = getDbPool();
    if (pool) {
      const planTier = body.planTier || body.plan_tier || null;
      const status = body.status ? String(body.status).toUpperCase() : null;
      const logo = body.logo !== undefined ? body.logo : null;

      const updateRes = await pool.query(
        `UPDATE "Organization"
         SET 
           name = COALESCE($2, name),
           slug = COALESCE($3, slug),
           domain = COALESCE($4, domain),
           plan_tier = COALESCE($5, plan_tier),
           "planTier" = COALESCE($5, "planTier"),
           status = COALESCE($6, status),
           logo = CASE WHEN $7::text IS NOT NULL THEN $7::text ELSE logo END,
           updated_at = NOW(),
           "updatedAt" = NOW()
         WHERE id = $1 OR slug = $1
         RETURNING *`,
        [orgId, body.name || null, body.slug || null, body.domain || null, planTier, status, logo]
      );

      // If owner info was provided, update User table as well
      const ownerName = body.ownerName || body.owner_name;
      const ownerEmail = body.ownerEmail || body.owner_email;
      if (ownerName || ownerEmail) {
        try {
          await pool.query(
            `UPDATE "User"
             SET 
               name = COALESCE($2, name),
               email = COALESCE($3, email),
               updated_at = NOW()
             WHERE id = (SELECT owner_id FROM "Organization" WHERE id = $1 OR slug = $1 LIMIT 1)
                OR id = (SELECT "ownerId" FROM "Organization" WHERE id = $1 OR slug = $1 LIMIT 1)`,
            [orgId, ownerName || null, ownerEmail || null]
          );
        } catch (e: any) {
          console.warn("Could not update User owner record:", e.message);
        }
      }

      if (updateRes.rows.length > 0) {
        return NextResponse.json({
          ...updateRes.rows[0],
          ownerName: ownerName || undefined,
          ownerEmail: ownerEmail || undefined,
          message: "Tenant successfully updated in Neon PostgreSQL",
        });
      }
    }

    return NextResponse.json({ success: true, ...body });
  } catch (err: any) {
    console.error("Neon PostgreSQL tenant update error:", err);
    return NextResponse.json({ error: "Failed to update tenant in database: " + err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { errorResponse } = await authenticateApiRequest(request, {
    allowedRoles: ["SUPER_ADMIN"],
    requirePermission: "canManageTenants",
  });
  if (errorResponse) return errorResponse;

  const { orgId } = await params;
  try {
    const pool = getDbPool();
    if (pool) {
      await pool.query(`DELETE FROM "Organization" WHERE id = $1 OR slug = $1`, [orgId]);
      await pool.query(`DELETE FROM "TenantRolePermission" WHERE "tenantId" = $1`, [orgId]);
    }
    return NextResponse.json({ success: true, message: "Tenant organization deleted from database" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete tenant from database: " + err.message }, { status: 500 });
  }
}
