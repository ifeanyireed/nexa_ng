import { NextResponse } from "next/server";
import { getDbPool, ensureTablesExist } from "@/lib/db";
import { generateSupportAutoreply } from "@/lib/gemini";

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

    const savedMessage = insertRes.rows[0];

    // 3. Check if sender is a visitor/guest
    const normalizedSender = (sender || "").toLowerCase();
    const isVisitor =
      !normalizedSender.includes("support") &&
      !normalizedSender.includes("staff") &&
      !normalizedSender.includes("admin") &&
      !normalizedSender.includes("ai");

    let aiReplyRecord = null;

    if (isVisitor) {
      // Check if support staff is currently online
      const staffRes = await pool.query(
        `SELECT is_active 
         FROM support_staff_status 
         WHERE is_active = true 
         LIMIT 1`
      );
      const isStaffOnline = staffRes.rows.length > 0 && Boolean(staffRes.rows[0].is_active);

      // Trigger Gemini 3.8 Flash autoreply when staff is NOT online
      if (!isStaffOnline) {
        try {
          const aiResult = await generateSupportAutoreply({
            sessionId: session_id,
            visitorMessage: text.trim(),
            visitorName: user_name || sender,
          });

          if (aiResult?.text) {
            const aiMsgId = `cmsg-ai-${Date.now()}`;
            const aiSender = `Ofia AI Assistant (${aiResult.model})`;

            const aiInsertRes = await pool.query(
              `INSERT INTO support_chat_messages (id, session_id, sender, text, timestamp)
               VALUES ($1, $2, $3, $4, NOW())
               RETURNING *`,
              [aiMsgId, session_id, aiSender, aiResult.text]
            );

            await pool.query(
              `UPDATE support_chat_sessions 
               SET last_message = $1, updated_at = NOW() 
               WHERE id = $2`,
              [aiResult.text, session_id]
            );

            aiReplyRecord = aiInsertRes.rows[0];
          }
        } catch (aiErr) {
          console.error("[Support Chat] Failed to execute Gemini autoreply:", aiErr);
        }
      }
    }

    return NextResponse.json(
      {
        ...savedMessage,
        ai_reply: aiReplyRecord,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/support/chat/history error:", error);
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
  }
}
