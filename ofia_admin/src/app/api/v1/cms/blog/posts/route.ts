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
    .replace(/^-+|-+$/g, "") || `post-${Date.now()}`;
}

export async function GET(request: Request) {
  // 1. Try remote Go microservice first
  try {
    const { search } = new URL(request.url);
    const res = await fetch(`${USER_BASE}/cms/blog/posts${search}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Fallback to direct Neon PostgreSQL query
  }

  // 2. Direct Neon PostgreSQL query
  try {
    await ensureTablesExist();
    const pool = getDbPool();
    if (pool) {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");

      let query = `
        SELECT 
          p.id, p.title, p.slug, p.excerpt, p.content, p.cover_image,
          p.category_id, p.tags, p.status, p.author_id, p.author_name,
          p.published_at, p.created_at, p.updated_at,
          c.name as category,
          json_build_object('full_name', COALESCE(p.author_name, 'Ofia Editorial Team')) as author
        FROM "BlogPost" p
        LEFT JOIN "BlogCategory" c ON c.id = p.category_id
      `;
      const params: any[] = [];
      if (status) {
        query += ` WHERE p.status = $1`;
        params.push(status.toUpperCase());
      }
      query += ` ORDER BY p.created_at DESC`;

      const result = await pool.query(query, params);
      return NextResponse.json(result.rows);
    }
  } catch (err: any) {
    console.error("Neon error fetching blog posts:", err);
  }

  return NextResponse.json([]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Try remote Go microservice
    try {
      const res = await fetch(`${USER_BASE}/cms/blog/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        return NextResponse.json(await res.json(), { status: 201 });
      }
    } catch {
      // Direct Neon fallback
    }

    // 2. Direct Neon PostgreSQL persistence
    await ensureTablesExist();
    const pool = getDbPool();
    if (!pool) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    const id = body.id || `post_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const title = body.title;
    const slug = body.slug || slugify(title);
    const excerpt = body.excerpt || "";
    const content = body.content || "";
    const coverImage = body.cover_image || "";
    const categoryId = body.category_id || null;
    const tags = body.tags || "";
    const status = (body.status || "DRAFT").toUpperCase();
    const authorId = body.author_id || null;
    const authorName = body.author_name || "Ofia Editorial Team";
    const publishedAt = status === "PUBLISHED" ? new Date().toISOString() : null;

    // Check if updating existing
    const existing = await pool.query(`SELECT id FROM "BlogPost" WHERE id = $1`, [id]);
    if (existing.rows.length > 0) {
      const updateRes = await pool.query(
        `UPDATE "BlogPost" SET
          title = $1, excerpt = $2, content = $3, cover_image = $4,
          category_id = $5, tags = $6, status = $7, author_name = $8,
          published_at = COALESCE(published_at, $9), updated_at = NOW()
        WHERE id = $10
        RETURNING *`,
        [title, excerpt, content, coverImage, categoryId, tags, status, authorName, publishedAt, id]
      );
      return NextResponse.json(updateRes.rows[0]);
    }

    const insertRes = await pool.query(
      `INSERT INTO "BlogPost" (
        id, title, slug, excerpt, content, cover_image,
        category_id, tags, status, author_id, author_name,
        published_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, NOW(), NOW()
      )
      RETURNING *`,
      [id, title, slug, excerpt, content, coverImage, categoryId, tags, status, authorId, authorName, publishedAt]
    );

    return NextResponse.json(insertRes.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to save post: " + err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Post ID required" }, { status: 400 });

    try {
      const res = await fetch(`${USER_BASE}/cms/blog/posts?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) return NextResponse.json({ success: true });
    } catch {}

    const pool = getDbPool();
    if (pool) {
      await pool.query(`DELETE FROM "BlogPost" WHERE id = $1`, [id]);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
