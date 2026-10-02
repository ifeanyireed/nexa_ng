import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/jwt-auth";
import { getDbPool } from "@/lib/db";
import crypto from "crypto";

const rawUserUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "http://localhost:8081";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

export async function GET(request: Request) {
  const { errorResponse } = await authenticateApiRequest(request);
  if (errorResponse) return errorResponse;

  // 1. Try remote microservice
  try {
    const res = await fetch(`${USER_BASE}/organizations`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.json(data);
      }
    }
  } catch {
    // service_users is offline, query Neon PostgreSQL directly
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
        ORDER BY o.created_at ASC`
      );

      return NextResponse.json(result.rows);
    }
  } catch (err: any) {
    console.warn("Neon PostgreSQL read error in /api/organizations:", err.message);
  }

  return NextResponse.json([]);
}

export async function POST(request: Request) {
  const { errorResponse } = await authenticateApiRequest(request, {
    allowedRoles: ["SUPER_ADMIN"],
    requirePermission: "canManageTenants",
  });
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    // 1. Try remote microservice
    try {
      const res = await fetch(`${USER_BASE}/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const created = await res.json();
        return NextResponse.json(created, { status: 201 });
      }
    } catch {
      // service_users is offline, persist directly into Neon PostgreSQL
    }

    // 2. Direct persistence into Neon PostgreSQL
    const pool = getDbPool();
    if (pool) {
      const orgId = body.id || `org_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
      const planTier = body.planTier || body.plan_tier || "GROWTH";
      const billingCycle = body.billingCycle || body.billing_cycle || "MONTHLY";
      const status = (body.status || "ACTIVE").toUpperCase();
      const logo = body.logo || null;

      const insertRes = await pool.query(
        `INSERT INTO "Organization" (
          id, name, slug, domain, status, logo,
          plan_tier, "planTier", billing_cycle, "billingCycle",
          owner_id, "ownerId", created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $7, $8, $8,
          'ADM001', 'ADM001', NOW(), NOW()
        )
        RETURNING *`,
        [orgId, body.name, body.slug, body.domain, status, logo, planTier, billingCycle]
      );

      return NextResponse.json(insertRes.rows[0], { status: 201 });
    }

    return NextResponse.json({ error: "Failed to persist organization" }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to persist organization to database: " + err.message }, { status: 500 });
  }
}
