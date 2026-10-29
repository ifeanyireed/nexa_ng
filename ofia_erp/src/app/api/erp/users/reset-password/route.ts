import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getTenantSql } from "@/lib/tenant-db-resolver";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      userId,
      email,
      password,
      tenantSlug,
      name,
      role,
      department,
      designation,
      avatar,
      company,
      location,
      assignedPages,
      managerName,
      managerId,
    } = body;

    const normalizedEmail = (email || body.Email || "").trim().toLowerCase();
    const targetUserId = (userId || body.id || body.ID || "").trim();
    const effectiveTenantSlug = (
      tenantSlug ||
      request.headers.get("x-tenant-slug") ||
      ""
    ).trim().toLowerCase();

    if (!effectiveTenantSlug) {
      return NextResponse.json(
        { error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    if (!normalizedEmail && !targetUserId) {
      return NextResponse.json(
        { error: "Either user email or user ID must be provided" },
        { status: 400 }
      );
    }

    if (!password || !password.trim()) {
      return NextResponse.json(
        { error: "New password is required to reset user credentials" },
        { status: 400 }
      );
    }

    const newPassword = password.trim();
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // 1. Direct PostgreSQL Neon update using tenant's dedicated database
    let directDbUpdated = false;
    try {
      const sql = await getTenantSql(effectiveTenantSlug);
      if (sql && normalizedEmail) {
        await sql`
          UPDATE users
          SET password_hash = ${hashedPassword}, updated_at = NOW()
          WHERE LOWER(email) = ${normalizedEmail}
        `;
        directDbUpdated = true;
      }
    } catch (dbErr) {
      // Table or schema differ, continue gracefully with microservice sync
    }

    // 2. Fetch existing user details if required fields (name, role, department) are missing
    let targetName = (name || body.Name || "").trim();
    let targetRole = (role || body.Role || "").trim();
    let targetDepartment = (department || body.Department || "").trim();
    let targetDesignation = (designation || body.Designation || targetDepartment || "").trim();
    let targetAvatar = (avatar || body.Avatar || "/character1.jpg").trim();
    let targetCompany = (company || body.Company || effectiveTenantSlug.toUpperCase()).trim();
    let targetLocation = (location || body.Location || "Lagos, Nigeria").trim();
    let targetPages = assignedPages || body.assignedPages || [];

    if (!targetName || !targetRole || !targetDepartment) {
      try {
        const usersRes = await fetch(
          `${ERP_BASE}/users?tenant=${encodeURIComponent(effectiveTenantSlug)}`,
          {
            headers: { "x-tenant-slug": effectiveTenantSlug },
            signal: AbortSignal.timeout(5000),
          }
        );
        if (usersRes.ok) {
          const userList = await usersRes.json();
          if (Array.isArray(userList)) {
            const matched = userList.find(
              (u: any) =>
                (targetUserId && (u.id === targetUserId || u.ID === targetUserId)) ||
                (normalizedEmail &&
                  (u.email || u.Email || "").toLowerCase() === normalizedEmail)
            );
            if (matched) {
              if (!targetName) targetName = matched.name || matched.Name || "Staff Member";
              if (!targetRole) targetRole = matched.role || matched.Role || "employee";
              if (!targetDepartment)
                targetDepartment = matched.department || matched.Department || "Operations";
              if (!targetDesignation)
                targetDesignation =
                  matched.designation || matched.Designation || targetDepartment;
              if (!targetAvatar) targetAvatar = matched.avatar || matched.Avatar || "/character1.jpg";
              if (!targetCompany) targetCompany = matched.company || matched.Company || effectiveTenantSlug.toUpperCase();
              if (!targetLocation) targetLocation = matched.location || matched.Location || "Lagos, Nigeria";
            }
          }
        }
      } catch (fetchErr) {
        console.warn("[Reset Password] Could not fetch existing user profile from ERP:", fetchErr);
      }
    }

    // Fallbacks to guarantee complete parameters
    if (!targetName) targetName = "Staff Member";
    if (!targetRole) targetRole = "employee";
    if (!targetDepartment) targetDepartment = "General Operations";
    if (!targetDesignation) targetDesignation = targetDepartment;

    // 3. Attempt /update-password endpoint on ERP service
    try {
      await fetch(`${ERP_BASE}/update-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": effectiveTenantSlug,
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password: newPassword,
          new_password: newPassword,
          newPassword: newPassword,
          tenant: effectiveTenantSlug,
        }),
        signal: AbortSignal.timeout(5000),
      }).catch(() => {});
    } catch {}

    // 4. Update via /users endpoint with COMPLETE parameters to satisfy validation
    const userPayload = {
      id: targetUserId || `USR-${Date.now()}`,
      email: normalizedEmail,
      name: targetName,
      role: targetRole,
      department: targetDepartment,
      designation: targetDesignation,
      avatar: targetAvatar,
      company: targetCompany,
      location: targetLocation,
      assignedPages: targetPages,
      managerName: managerName || undefined,
      managerId: managerId || undefined,
      password: hashedPassword,
      tenantSlug: effectiveTenantSlug,
    };

    const res = await fetch(`${ERP_BASE}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": effectiveTenantSlug,
      },
      body: JSON.stringify(userPayload),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok && !directDbUpdated) {
      return NextResponse.json(
        { error: data?.error || data?.message || "Failed to reset password in ERP microservice" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully.",
      user: data || userPayload,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "ERP microservice error: " + (error?.message || "Internal failure") },
      { status: 502 }
    );
  }
}
