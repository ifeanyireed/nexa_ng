import { NextResponse } from "next/server";
import { getDbPool, ensureTablesExist } from "@/lib/db";

export async function GET() {
  try {
    await ensureTablesExist();
    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const res = await pool.query(`
      SELECT 
        c.id, c.name, c.slug, c.icon, c.description, c.created_at,
        COUNT(a.id)::int as article_count
      FROM support_kb_categories c
      LEFT JOIN support_kb_articles a ON a.category_id = c.id
      GROUP BY c.id, c.name, c.slug, c.icon, c.description, c.created_at
      ORDER BY c.created_at ASC
    `);

    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error("GET /api/support/kb/categories error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
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
    const { name, slug, description, icon = "BookOpen" } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const autoSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const id = `cat-${Date.now().toString().slice(-6)}`;

    const res = await pool.query(
      `INSERT INTO support_kb_categories (id, name, slug, icon, description, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
       RETURNING *`,
      [id, name.trim(), autoSlug, icon, description || ""]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("POST /api/support/kb/categories error:", error);
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}
