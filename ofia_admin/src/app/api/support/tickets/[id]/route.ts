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
      `SELECT * FROM support_tickets WHERE id = $1`,
      [id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error("GET /api/support/tickets/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch ticket" }, { status: 500 });
  }
}

export async function PATCH(
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
    const { status, assigned_to, priority } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let pIdx = 1;

    if (status) {
      updates.push(`status = $${pIdx++}`);
      values.push(status);
    }
    if (assigned_to !== undefined) {
      updates.push(`assigned_to = $${pIdx++}`);
      values.push(assigned_to);
    }
    if (priority) {
      updates.push(`priority = $${pIdx++}`);
      values.push(priority);
    }

    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const query = `
      UPDATE support_tickets
      SET ${updates.join(", ")}
      WHERE id = $${pIdx}
      RETURNING *
    `;

    const res = await pool.query(query, values);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error("PATCH /api/support/tickets/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update ticket" }, { status: 500 });
  }
}
