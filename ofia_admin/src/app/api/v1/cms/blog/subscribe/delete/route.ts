import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

const rawUserUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "http://localhost:8081";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Subscriber ID required" }, { status: 400 });

    try {
      const res = await fetch(`${USER_BASE}/cms/blog/subscribe/delete?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) return NextResponse.json({ success: true });
    } catch {}

    const pool = getDbPool();
    if (pool) {
      await pool.query(`DELETE FROM "BlogSubscriber" WHERE id = $1`, [id]);
      return NextResponse.json({ success: true, message: "Subscriber removed" });
    }
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
