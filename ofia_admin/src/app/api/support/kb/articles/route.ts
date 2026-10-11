import { NextResponse } from "next/server";
import { getDbPool, ensureTablesExist } from "@/lib/db";

export async function GET(request: Request) {
  try {
    await ensureTablesExist();
    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");
    const status = searchParams.get("status");

    let query = `
      SELECT 
        a.id, a.category_id, a.title, a.slug, a.excerpt, a.content,
        a.status, a.views, a.helpful_count, a.created_at, a.updated_at,
        c.name as category_name, c.slug as category_slug
      FROM support_kb_articles a
      LEFT JOIN support_kb_categories c ON c.id = a.category_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let pIdx = 1;

    if (categoryId) {
      query += ` AND a.category_id = $${pIdx++}`;
      params.push(categoryId);
    }
    if (status) {
      query += ` AND a.status = $${pIdx++}`;
      params.push(status);
    }

    query += ` ORDER BY a.updated_at DESC`;

    const res = await pool.query(query, params);
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error("GET /api/support/kb/articles error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTablesExist();
    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const body = await request.json();
    const {
      title,
      category_id,
      content,
      excerpt = "",
      status = "published",
    } = body;

    if (!title || !category_id || !content) {
      return NextResponse.json({ error: "Title, category_id, and content are required" }, { status: 400 });
    }

    const id = `art-${Date.now().toString().slice(-6)}`;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `art-${id}`;

    const autoExcerpt = excerpt || content.replace(/<[^>]*>?/gm, "").slice(0, 160) + "...";

    const res = await pool.query(
      `INSERT INTO support_kb_articles (
        id, category_id, title, slug, excerpt, content, status, views, helpful_count, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, NOW(), NOW())
      RETURNING *`,
      [id, category_id, title.trim(), slug, autoExcerpt, content, status]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("POST /api/support/kb/articles error:", error);
    return NextResponse.json({ error: error.message || "Failed to create article" }, { status: 500 });
  }
}
