import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

const USERS_DB_URL =
  process.env.USERS_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "";

function getUsersSql() {
  if (!USERS_DB_URL) return null;
  return neon(USERS_DB_URL);
}

const rawUserUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  process.env.USERS_API_URL ||
  process.env.NEXT_PUBLIC_USERS_API ||
  "";
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

    const clean = decodeURIComponent(slug).trim();
    const sql = getUsersSql();

    // 1. Direct Lakebase Neon database query
    if (sql) {
      try {
        const rows = await sql`
          SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.cover_image, p.category_id, p.tags, p.status,
                 p.author_id, p.author_name, p.published_at, p.created_at, p.updated_at,
                 p.meta_title, p.meta_description, p.canonical_url, p.og_image, p.view_count,
                 c.name as category
          FROM "BlogPost" p
          LEFT JOIN "BlogCategory" c ON p.category_id = c.id
          WHERE p.slug = ${clean}
             OR LOWER(p.slug) = LOWER(${clean})
             OR p.id = ${clean}
             OR LOWER(p.id) = LOWER(${clean})
          LIMIT 1;
        `;
        if (rows && rows.length > 0) {
          const r = rows[0];
          return NextResponse.json({
            ...r,
            category: r.category || "Commerce & AI",
            author: { full_name: r.author_name || "Ofia Editorial Team" },
            view_count: Number(r.view_count || 0),
          });
        }
      } catch (dbErr) {
        console.warn("[Admin Blog Post Slug Route] DB query note:", dbErr);
      }
    }

    // 2. Microservice fallback
    if (USER_BASE) {
      const res = await fetch(`${USER_BASE}/cms/blog/posts/${encodeURIComponent(clean)}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data) return NextResponse.json(data);
      }
    }

    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error retrieving blog article: " + (err?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
