import { NextResponse } from "next/server";
import { getDbPool, ensureTablesExist } from "@/lib/db";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    await ensureTablesExist();
    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let query = `
      SELECT 
        id, user_id, user_full_name, user_email, assigned_to,
        subject, category, message, status, priority, app_module,
        created_at, updated_at
      FROM support_tickets
      WHERE 1=1
    `;
    const params: any[] = [];
    let pIdx = 1;

    if (status && status !== "all") {
      query += ` AND status = $${pIdx++}`;
      params.push(status);
    }
    if (category && category !== "all") {
      query += ` AND category = $${pIdx++}`;
      params.push(category);
    }
    if (search && search.trim()) {
      query += ` AND (subject ILIKE $${pIdx} OR user_full_name ILIKE $${pIdx} OR message ILIKE $${pIdx})`;
      params.push(`%${search.trim()}%`);
      pIdx++;
    }

    query += ` ORDER BY created_at DESC`;

    const res = await pool.query(query, params);
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error("GET /api/support/admin/tickets error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch tickets" }, { status: 500 });
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
      subject,
      category = "Platform",
      message,
      priority = "normal",
      app_module = "Platform",
      user_full_name = "Enterprise Merchant",
      user_email = "merchant@ofia.ng",
      user_id = `usr-${Date.now()}`,
    } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const ticketId = `t-${Date.now().toString().slice(-6)}`;
    const now = new Date();

    const insertQuery = `
      INSERT INTO support_tickets (
        id, user_id, user_full_name, user_email, assigned_to,
        subject, category, message, status, priority, app_module,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const res = await pool.query(insertQuery, [
      ticketId,
      user_id,
      user_full_name,
      user_email,
      "support@ofia.ng",
      subject,
      category,
      message,
      "open",
      priority,
      app_module,
      now,
      now,
    ]);

    // Also record the initial message in support_ticket_messages
    const msgId = `msg-${Date.now()}`;
    await pool.query(
      `INSERT INTO support_ticket_messages (id, ticket_id, sender_id, sender_name, sender_role, sender_type, message, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [msgId, ticketId, user_id, user_full_name, "customer", "customer", message, now]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("POST /api/support/admin/tickets error:", error);
    return NextResponse.json({ error: error.message || "Failed to create ticket" }, { status: 500 });
  }
}
