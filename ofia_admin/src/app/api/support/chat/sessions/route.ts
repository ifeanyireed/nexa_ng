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
        s.id as session_id,
        s.user_name as sender,
        s.user_email,
        s.status,
        s.last_message as text,
        s.updated_at as timestamp,
        s.created_at
      FROM support_chat_sessions s
      ORDER BY s.updated_at DESC
      LIMIT 50
    `);

    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error("GET /api/support/chat/sessions error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch chat sessions" }, { status: 500 });
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
      session_id,
      user_name = "Website Visitor",
      user_email,
      last_message,
    } = body;

    const sid = session_id || `sess-${Date.now().toString().slice(-6)}`;

    const res = await pool.query(
      `INSERT INTO support_chat_sessions (id, user_name, user_email, status, last_message, created_at, updated_at)
       VALUES ($1, $2, $3, 'active', $4, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
         user_name = COALESCE(EXCLUDED.user_name, support_chat_sessions.user_name),
         last_message = COALESCE(EXCLUDED.last_message, support_chat_sessions.last_message),
         updated_at = NOW()
       RETURNING *`,
      [sid, user_name, user_email || null, last_message || "Started new chat session"]
    );

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error("POST /api/support/chat/sessions error:", error);
    return NextResponse.json({ error: error.message || "Failed to upsert chat session" }, { status: 500 });
  }
}
