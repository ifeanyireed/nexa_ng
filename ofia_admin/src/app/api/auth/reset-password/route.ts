import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { SEEDED_SUPER_ADMINS } from "@/lib/jwt-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = (searchParams.get("token") || "").trim();
    const email = (searchParams.get("email") || "").trim().toLowerCase();

    if (!token || !email) {
      return NextResponse.json({ valid: false, error: "Missing parameters" }, { status: 400 });
    }

    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json({ valid: false, error: "Database unavailable" }, { status: 503 });
    }

    const res = await pool.query(
      `SELECT id, email, token, expires_at, used
       FROM password_reset_tokens
       WHERE token = $1 AND LOWER(email) = $2
       LIMIT 1`,
      [token, email]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ valid: false, error: "Invalid token" }, { status: 404 });
    }

    const row = res.rows[0];
    if (row.used) {
      return NextResponse.json({ valid: false, error: "Token already used" }, { status: 400 });
    }

    if (Date.now() > new Date(row.expires_at).getTime()) {
      return NextResponse.json({ valid: false, error: "Token expired" }, { status: 410 });
    }

    return NextResponse.json({ valid: true, email: row.email });
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error?.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, email, newPassword } = body;

    const normalizedToken = (token || "").trim();
    const normalizedEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (newPassword || "").trim();

    if (!normalizedToken || !normalizedEmail || cleanPassword.length < 8) {
      return NextResponse.json(
        { error: "Valid token, email, and password of at least 8 characters are required" },
        { status: 400 }
      );
    }

    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const tokenRes = await pool.query(
      `SELECT id, email, token, expires_at, used
       FROM password_reset_tokens
       WHERE token = $1 AND LOWER(email) = $2
       LIMIT 1`,
      [normalizedToken, normalizedEmail]
    );

    if (tokenRes.rows.length === 0) {
      return NextResponse.json({ error: "Invalid reset token" }, { status: 404 });
    }

    const tokenRow = tokenRes.rows[0];
    if (tokenRow.used || Date.now() > new Date(tokenRow.expires_at).getTime()) {
      return NextResponse.json({ error: "Reset token expired or already used" }, { status: 400 });
    }

    // Update in database "User" table
    await pool.query(
      `UPDATE "User"
       SET password = $1, "updatedAt" = NOW(), updated_at = NOW()
       WHERE LOWER(email) = $2`,
      [cleanPassword, normalizedEmail]
    );

    // Also update in SEEDED_SUPER_ADMINS in-memory cache if matching
    const seeded = SEEDED_SUPER_ADMINS.find((a) => a.email.toLowerCase() === normalizedEmail);
    if (seeded) {
      seeded.passwordHash = cleanPassword;
    }

    // Mark token as used
    await pool.query(`UPDATE password_reset_tokens SET used = true WHERE id = $1`, [tokenRow.id]);

    return NextResponse.json({
      success: true,
      message: "Operator password updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to reset password" }, { status: 500 });
  }
}
