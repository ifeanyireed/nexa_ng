import { NextResponse } from "next/server";
import { getDbPool, ensureTablesExist } from "@/lib/db";

export async function GET() {
  try {
    await ensureTablesExist();
    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json({ is_active: true });
    }

    const res = await pool.query(
      `SELECT is_active FROM support_staff_status WHERE user_id IN ('admin-support-04', 'support@ofia.ng') LIMIT 1`
    );

    const isActive = res.rows.length > 0 ? Boolean(res.rows[0].is_active) : true;
    return NextResponse.json({ is_active: isActive });
  } catch (error: any) {
    console.error("GET /api/support/staff/status error:", error);
    return NextResponse.json({ is_active: true });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTablesExist();
    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    let newStatus = body.is_active;

    if (typeof newStatus !== "boolean") {
      // Toggle if not provided
      const current = await pool.query(
        `SELECT is_active FROM support_staff_status WHERE user_id IN ('admin-support-04', 'support@ofia.ng') LIMIT 1`
      );
      const isCurrentlyActive = current.rows.length > 0 ? Boolean(current.rows[0].is_active) : true;
      newStatus = !isCurrentlyActive;
    }

    await pool.query(
      `INSERT INTO support_staff_status (id, user_id, is_active, updated_at)
       VALUES ('status-support-04', 'admin-support-04', $1, NOW())
       ON CONFLICT (user_id) DO UPDATE SET is_active = $1, updated_at = NOW()`,
      [newStatus]
    );

    return NextResponse.json({ is_active: newStatus });
  } catch (error: any) {
    console.error("POST /api/support/staff/status error:", error);
    return NextResponse.json({ error: error.message || "Failed to update staff status" }, { status: 500 });
  }
}
