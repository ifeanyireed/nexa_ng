import { NextResponse } from "next/server";
import { getDbPool, ensureTablesExist } from "@/lib/db";

const rawUserUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "http://localhost:8081";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Post slug or ID required" }, { status: 400 });
    }

    // 1. Try remote Go microservice first
    try {
      const res = await fetch(`${USER_BASE}/cms/blog/posts/${encodeURIComponent(slug)}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {
      // Fall through to database
    }

    // 2. Neon PostgreSQL query
    await ensureTablesExist();
    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const query = `
      SELECT 
        p.id, p.title, p.slug, p.excerpt, p.content, p.cover_image,
        p.category_id, p.tags, p.status, p.author_id, p.author_name,
        p.published_at, p.created_at, p.updated_at,
        c.name as category,
        json_build_object('full_name', COALESCE(p.author_name, 'Ofia Editorial Team')) as author
      FROM "BlogPost" p
      LEFT JOIN "BlogCategory" c ON c.id = p.category_id
      WHERE p.slug = $1 OR p.id = $1
      LIMIT 1
    `;

    const res = await pool.query(query, [slug]);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (err: any) {
    console.error("Error retrieving blog post by slug:", err);
    return NextResponse.json(
      { error: "Failed to retrieve blog post: " + (err.message || "Internal error") },
      { status: 500 }
    );
  }
}
