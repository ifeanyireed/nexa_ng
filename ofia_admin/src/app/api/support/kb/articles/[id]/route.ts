import { NextResponse } from "next/server";
import { getDbPool, ensureTablesExist } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await ensureTablesExist();
    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const res = await pool.query(
      `SELECT 
        a.*, c.name as category_name, c.slug as category_slug
       FROM support_kb_articles a
       LEFT JOIN support_kb_categories c ON c.id = a.category_id
       WHERE a.id = $1`,
      [id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Increment view counter
    await pool.query(`UPDATE support_kb_articles SET views = views + 1 WHERE id = $1`, [id]);

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error("GET /api/support/kb/articles/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch article" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await ensureTablesExist();
    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const body = await request.json();
    const { title, category_id, content, excerpt, status } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let pIdx = 1;

    if (title) {
      updates.push(`title = $${pIdx++}`);
      values.push(title.trim());
    }
    if (category_id) {
      updates.push(`category_id = $${pIdx++}`);
      values.push(category_id);
    }
    if (content !== undefined) {
      updates.push(`content = $${pIdx++}`);
      values.push(content);
    }
    if (excerpt !== undefined) {
      updates.push(`excerpt = $${pIdx++}`);
      values.push(excerpt);
    }
    if (status) {
      updates.push(`status = $${pIdx++}`);
      values.push(status);
    }

    updates.push(`updated_at = NOW()`);

    values.push(id);
    const query = `
      UPDATE support_kb_articles
      SET ${updates.join(", ")}
      WHERE id = $${pIdx}
      RETURNING *
    `;

    const res = await pool.query(query, values);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error("PUT /api/support/kb/articles/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await ensureTablesExist();
    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    await pool.query(`DELETE FROM support_kb_articles WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "Article deleted" });
  } catch (error: any) {
    console.error("DELETE /api/support/kb/articles/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete article" }, { status: 500 });
  }
}
