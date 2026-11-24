import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  resolveTenantSlugFromRequest,
  syncUserPasswordAcrossTenantAndAuth,
} from "@/lib/auth-password-sync";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      userId,
      email,
      password,
      name,
      role,
      department,
      designation,
      avatar,
      company,
      location,
    } = body;

    const normalizedEmail = String(email || body.Email || "").trim().toLowerCase();
    const targetUserId = String(userId || body.id || body.ID || "").trim();
    const effectiveTenantSlug = resolveTenantSlugFromRequest(request, body);

    if (!effectiveTenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    if (!normalizedEmail && !targetUserId) {
      return NextResponse.json(
        { error: "Either user email or user ID must be provided" },
        { status: 400 }
      );
    }

    if (!password || !String(password).trim()) {
      return NextResponse.json(
        { error: "New password is required to reset user credentials" },
        { status: 400 }
      );
    }

    const newPassword = String(password).trim();
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Synchronize password across tenant's DEDICATED database ("User" table) AND Central Users Auth DB
    const syncResult = await syncUserPasswordAcrossTenantAndAuth({
      tenantSlug: effectiveTenantSlug,
      email: normalizedEmail || undefined,
      userId: targetUserId || undefined,
      hashedPassword,
      fallbackProfile: {
        name: String(name || body.Name || "").trim() || undefined,
        role: String(role || body.Role || "").trim() || undefined,
        department: String(department || body.Department || "").trim() || undefined,
        designation: String(designation || body.Designation || "").trim() || undefined,
        avatar: String(avatar || body.Avatar || "").trim() || undefined,
        company: String(company || body.Company || "").trim() || undefined,
        location: String(location || body.Location || "").trim() || undefined,
      },
    });

    if (!syncResult.tenantDbUpdated && !syncResult.usersDbUpdated) {
      return NextResponse.json(
        { error: "User account not found in tenant directory" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully.",
      synced: {
        tenantDb: syncResult.tenantDbUpdated,
        authDb: syncResult.usersDbUpdated,
      },
      user: syncResult.user,
    });
  } catch (error: any) {
    console.error("[Admin Reset Password] Error:", error);
    return NextResponse.json(
      { error: "Failed to reset user password: " + (error?.message || "Internal failure") },
      { status: 500 }
    );
  }
}
