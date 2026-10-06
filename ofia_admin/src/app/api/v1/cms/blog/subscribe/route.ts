import { NextResponse } from "next/server";
import { getDbPool, ensureTablesExist } from "@/lib/db";
import crypto from "crypto";

const rawUserUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "http://localhost:8081";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

export async function GET() {
  try {
    const res = await fetch(`${USER_BASE}/cms/blog/subscribe`, {
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {}

  try {
    await ensureTablesExist();
    const pool = getDbPool();
    if (pool) {
      const result = await pool.query(`SELECT id, email, status, created_at FROM "BlogSubscriber" ORDER BY created_at DESC`);
      return NextResponse.json(result.rows);
    }
  } catch (err: any) {
    console.error("Error fetching subscribers:", err);
  }

  return NextResponse.json([]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    try {
      const res = await fetch(`${USER_BASE}/cms/blog/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) return NextResponse.json(await res.json(), { status: 201 });
    } catch {}

    await ensureTablesExist();
    const pool = getDbPool();
    if (!pool) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    const id = body.id || `sub_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const email = body.email.toLowerCase().trim();

    const insertRes = await pool.query(
      `INSERT INTO "BlogSubscriber" (id, email, status, created_at)
       VALUES ($1, $2, 'ACTIVE', NOW())
       ON CONFLICT (email) DO UPDATE SET status = 'ACTIVE'
       RETURNING *`,
      [id, email]
    );

    return NextResponse.json(insertRes.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
