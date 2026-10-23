import { NextResponse } from "next/server";
import { MASTER_CONNECTION_STRING, invalidateTenantDbCache } from "@/lib/tenant-db-resolver";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

const rawUserUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USERS_API ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "https://ofia-user-service.onrender.com";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  try {
    const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization") ? { authorization: request.headers.get("authorization")! } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "User microservice connection error: " + err.message },
      { status: 502 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  try {
    const rawBody = await request.text();

    // 1. Persist database URL and mode into Neon platform_tenants
    try {
      const parsed = JSON.parse(rawBody);
      const sql = neon(MASTER_CONNECTION_STRING);
      const dbUrl = (parsed.database_url || parsed.databaseUrl || "").trim();
      const dbMode = "DEDICATED";
      const isCustom = true;

      const [updated] = await sql`
        UPDATE platform_tenants
        SET database_url = ${dbUrl},
            db_mode = ${dbMode},
            is_custom_db = ${isCustom},
            name = COALESCE(${parsed.name}, name),
            updated_at = NOW()
        WHERE id = ${orgId} OR LOWER(slug) = ${orgId.toLowerCase().trim()}
        RETURNING slug;
      `;

      if (updated?.slug) {
        invalidateTenantDbCache(updated.slug);
      }
    } catch {}

    // 2. Forward to microservice
    const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization") ? { authorization: request.headers.get("authorization")! } : {}),
      },
      body: rawBody,
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "User microservice connection error: " + err.message },
      { status: 502 }
    );
  }
}
