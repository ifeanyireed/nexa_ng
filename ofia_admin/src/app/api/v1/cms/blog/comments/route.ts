import { NextResponse } from "next/server";
import { getDbPool, ensureTablesExist } from "@/lib/db";
import crypto from "crypto";

const rawUserUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "http://localhost:8081";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

export async function GET(request: Request) {
  try {
    const { search } = new URL(request.url);
    const res = await fetch(`${USER_BASE}/cms/blog/comments${search}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {}

  try {
    await ensureTablesExist();
    const pool = getDbPool();
    if (pool) {
      const { searchParams } = new URL(request.url);
      const postId = searchParams.get("post_id");

      let query = `SELECT id, post_id, user_name, email, content, parent_id, status, created_at FROM "BlogComment"`;
      const params: any[] = [];
      if (postId) {
        query += ` WHERE post_id = $1`;
        params.push(postId);
      }
      query += ` ORDER BY created_at DESC`;

      const result = await pool.query(query, params);
      return NextResponse.json(result.rows);
    }
  } catch (err: any) {
    console.error("Error fetching comments:", err);
  }

  return NextResponse.json([]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.post_id || !body.content) {
      return NextResponse.json({ error: "Post ID and content are required" }, { status: 400 });
    }

    try {
      const res = await fetch(`${USER_BASE}/cms/blog/comments`, {
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

    const id = body.id || `comm_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const userName = body.name || body.user_name || "Guest";
    const email = body.email || null;
    const parentId = body.parent_id || null;
    const status = "APPROVED";

    const insertRes = await pool.query(
      `INSERT INTO "BlogComment" (id, post_id, user_name, email, content, parent_id, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [id, body.post_id, userName, email, body.content, parentId, status]
    );

    return NextResponse.json(insertRes.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
