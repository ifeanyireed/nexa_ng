import { NextResponse } from "next/server";
import { getDbPool, ensureTablesExist } from "@/lib/db";
import crypto from "crypto";

const rawUserUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "http://localhost:8081";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `tag-${Date.now()}`;
}

export async function GET() {
  try {
    const res = await fetch(`${USER_BASE}/cms/blog/tags`, {
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {}

  try {
    await ensureTablesExist();
    const pool = getDbPool();
    if (pool) {
      const result = await pool.query(`SELECT id, name, slug, created_at FROM "BlogTag" ORDER BY name ASC`);
      return NextResponse.json(result.rows);
    }
  } catch (err: any) {
    console.error("Error fetching tags:", err);
  }

  return NextResponse.json([]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) return NextResponse.json({ error: "Tag name required" }, { status: 400 });

    try {
      const res = await fetch(`${USER_BASE}/cms/blog/tags`, {
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

    const id = body.id || `tag_${Date.now()}_${crypto.randomBytes(2).toString("hex")}`;
    const slug = slugify(body.name);

    const insertRes = await pool.query(
      `INSERT INTO "BlogTag" (id, name, slug, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING *`,
      [id, body.name, slug]
    );

    return NextResponse.json(insertRes.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Tag ID required" }, { status: 400 });

    try {
      const res = await fetch(`${USER_BASE}/cms/blog/tags?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) return NextResponse.json({ success: true });
    } catch {}

    const pool = getDbPool();
    if (pool) {
      await pool.query(`DELETE FROM "BlogTag" WHERE id = $1`, [id]);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
