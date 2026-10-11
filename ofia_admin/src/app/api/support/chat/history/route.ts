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
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "session_id parameter is required" }, { status: 400 });
    }

    const res = await pool.query(
      `SELECT id, session_id, sender, text, timestamp
       FROM support_chat_messages
       WHERE session_id = $1
       ORDER BY timestamp ASC`,
      [sessionId]
    );

    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error("GET /api/support/chat/history error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch chat history" }, { status: 500 });
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
    const { session_id, sender = "Visitor", text, user_name, user_email } = body;

    if (!session_id || !text || !text.trim()) {
      return NextResponse.json({ error: "session_id and text are required" }, { status: 400 });
    }

    const msgId = `cmsg-${Date.now()}`;
    const now = new Date();

    // 1. Ensure chat session exists
    await pool.query(
      `INSERT INTO support_chat_sessions (id, user_name, user_email, status, last_message, created_at, updated_at)
       VALUES ($1, $2, $3, 'active', $4, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
         last_message = EXCLUDED.last_message,
         updated_at = NOW()`,
      [session_id, user_name || sender, user_email || null, text.trim()]
    );

    // 2. Insert chat message
    const insertRes = await pool.query(
      `INSERT INTO support_chat_messages (id, session_id, sender, text, timestamp)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [msgId, session_id, sender, text.trim(), now]
    );

    return NextResponse.json(insertRes.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("POST /api/support/chat/history error:", error);
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
  }
}
