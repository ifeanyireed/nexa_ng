import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

const rawUserUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "http://localhost:8081";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id || !body.status) {
      return NextResponse.json({ error: "Comment ID and status required" }, { status: 400 });
    }

    try {
      const res = await fetch(`${USER_BASE}/cms/blog/comments/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) return NextResponse.json(await res.json());
    } catch {}

    const pool = getDbPool();
    if (pool) {
      await pool.query(
        `UPDATE "BlogComment" SET status = $1 WHERE id = $2`,
        [body.status.toUpperCase(), body.id]
      );
      return NextResponse.json({ success: true, message: "Comment status updated" });
    }
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
