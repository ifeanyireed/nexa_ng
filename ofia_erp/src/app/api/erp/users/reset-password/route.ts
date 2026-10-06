import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, email, password, tenantSlug } = body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    const targetUserId = (userId || "").trim();
    const effectiveTenantSlug = (
      tenantSlug ||
      request.headers.get("x-tenant-slug") ||
      ""
    ).trim();

    if (!normalizedEmail && !targetUserId) {
      return NextResponse.json(
        { error: "Either user email or user ID must be provided" },
        { status: 400 }
      );
    }

    const newPassword = (password || "12345678").trim();
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const pool = getDbPool();

    if (!pool) {
      return NextResponse.json(
        { error: "Database connection unavailable" },
        { status: 503 }
      );
    }

    // 1. Try matching with tenant slug first if provided
    let result = null;
    if (effectiveTenantSlug) {
      result = await pool.query(
        `UPDATE "User"
         SET password = $1,
             email = LOWER(email),
             "updatedAt" = NOW(),
             updated_at = NOW()
         WHERE (LOWER(email) = $2 OR id = $3)
           AND "tenantSlug" = $4
         RETURNING id, name, email, role, "tenantSlug", "updatedAt"`,
        [hashedPassword, normalizedEmail, targetUserId, effectiveTenantSlug]
      );
    }

    // 2. If no match with tenant slug, try matching by email or id directly
    if (!result || result.rows.length === 0) {
      result = await pool.query(
        `UPDATE "User"
         SET password = $1,
             email = LOWER(email),
             "updatedAt" = NOW(),
             updated_at = NOW()
         WHERE LOWER(email) = $2 OR id = $3
         RETURNING id, name, email, role, "tenantSlug", "updatedAt"`,
        [hashedPassword, normalizedEmail, targetUserId]
      );
    }

    if (!result || result.rows.length === 0) {
      return NextResponse.json(
        { error: `User not found with email '${normalizedEmail || targetUserId}'` },
        { status: 404 }
      );
    }

    const updatedUser = result.rows[0];

    return NextResponse.json({
      success: true,
      message: `Password for ${updatedUser.name || updatedUser.email} reset successfully to '${newPassword}'`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        tenantSlug: updatedUser.tenantSlug,
        updatedAt: updatedUser.updatedAt,
      },
      newPassword,
    });
  } catch (error: any) {
    console.error("Error in reset-password route:", error);
    return NextResponse.json(
      { error: "Failed to reset password: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
