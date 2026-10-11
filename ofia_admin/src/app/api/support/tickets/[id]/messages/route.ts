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
      `SELECT id, ticket_id, sender_id, sender_name, sender_role, sender_type, message, created_at
       FROM support_ticket_messages
       WHERE ticket_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error("GET /api/support/tickets/[id]/messages error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
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
    const {
      message,
      sender_id = "admin-support-04",
      sender_name = "Support & Editorial Lead",
      sender_role = "staff",
      sender_type = "staff",
    } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const msgId = `msg-${Date.now()}`;
    const now = new Date();

    const insertRes = await pool.query(
      `INSERT INTO support_ticket_messages (
        id, ticket_id, sender_id, sender_name, sender_role, sender_type, message, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [msgId, id, sender_id, sender_name, sender_role, sender_type, message.trim(), now]
    );

    // Update ticket updated_at
    await pool.query(
      `UPDATE support_tickets SET updated_at = NOW() WHERE id = $1`,
      [id]
    );

    return NextResponse.json(insertRes.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("POST /api/support/tickets/[id]/messages error:", error);
    return NextResponse.json({ error: error.message || "Failed to post message" }, { status: 500 });
  }
}
