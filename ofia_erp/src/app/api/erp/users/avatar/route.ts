import { NextRequest, NextResponse } from "next/server";
import { getTenantSql, MASTER_CONNECTION_STRING } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import { v2 as cloudinary } from "cloudinary";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

interface CloudinaryCredentials {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

function parseCloudinaryUrl(rawUrl: string): CloudinaryCredentials | null {
  if (!rawUrl) return null;
  const cleaned = rawUrl.replace(/^CLOUDINARY_URL=/, "").trim();
  try {
    const parsed = new URL(cleaned);
    if (!parsed.hostname || !parsed.username || !parsed.password) return null;
    return {
      cloudName: parsed.hostname,
      apiKey: parsed.username,
      apiSecret: parsed.password,
    };
  } catch {
    return null;
  }
}

async function getCloudinaryCredentials(tenantSlug?: string | null): Promise<CloudinaryCredentials | null> {
  const norm = (tenantSlug || "").toLowerCase().trim();
  if (norm && MASTER_CONNECTION_STRING) {
    try {
      const sql = neon(MASTER_CONNECTION_STRING);
      const rows = await sql`
        SELECT cloudinary_url FROM platform_tenants
        WHERE LOWER(slug) = ${norm}
           OR REPLACE(LOWER(slug), '-', '') = REPLACE(${norm}, '-', '')
        LIMIT 1;
      `;
      if (rows && rows.length > 0 && rows[0].cloudinary_url) {
        const creds = parseCloudinaryUrl(rows[0].cloudinary_url);
        if (creds) return creds;
      }
    } catch (err) {
      console.warn("[Avatar Upload] Could not resolve tenant Cloudinary URL:", err);
    }
  }

  const envUrl = process.env.CLOUDINARY_URL || process.env.PLATFORM_CLOUDINARY_URL || "";
  return parseCloudinaryUrl(envUrl);
}

export async function POST(request: NextRequest) {
  return handleAvatarUpdate(request);
}

export async function PUT(request: NextRequest) {
  return handleAvatarUpdate(request);
}

export async function PATCH(request: NextRequest) {
  return handleAvatarUpdate(request);
}

async function handleAvatarUpdate(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let userId = "";
    let email = "";
    let avatarUrl = "";
    let tenantSlug = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      userId = String(formData.get("userId") || formData.get("id") || "").trim();
      email = String(formData.get("email") || "").trim().toLowerCase();
      tenantSlug = String(formData.get("tenantSlug") || formData.get("tenant") || "").trim();
      const directAvatar = formData.get("avatar") as string | null;

      if (directAvatar) {
        avatarUrl = directAvatar.trim();
      } else if (file) {
        // Upload file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const mime = file.type || "image/jpeg";
        const base64Image = `data:${mime};base64,${buffer.toString("base64")}`;

        const creds = await getCloudinaryCredentials(tenantSlug);
        if (creds) {
          try {
            const folder = tenantSlug ? `ofia_ng_assets/${tenantSlug}/avatars` : "ofia_ng_assets/avatars";
            const uploadRes = await cloudinary.uploader.upload(base64Image, {
              folder,
              resource_type: "image",
              cloud_name: creds.cloudName,
              api_key: creds.apiKey,
              api_secret: creds.apiSecret,
              secure: true,
            });
            avatarUrl = uploadRes.secure_url;
          } catch (uploadErr: any) {
            console.warn("[Avatar Upload] Cloudinary upload failed, falling back to data URL:", uploadErr?.message);
            avatarUrl = base64Image;
          }
        } else {
          avatarUrl = base64Image;
        }
      }
    } else {
      const body = await request.json().catch(() => ({}));
      userId = String(body.userId || body.id || "").trim();
      email = String(body.email || "").trim().toLowerCase();
      avatarUrl = String(body.avatar || "").trim();
      tenantSlug = String(body.tenantSlug || body.tenant || "").trim();
    }

    if (!tenantSlug) {
      tenantSlug = getValidatedTenantSlug(request) || "";
    }

    if (!avatarUrl) {
      return NextResponse.json(
        { success: false, error: "avatar parameter or image file is required" },
        { status: 400 }
      );
    }

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: "userId or email is required to identify the user" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);

    // Update avatar in "User" table
    const result = await sql`
      UPDATE "User"
      SET avatar = ${avatarUrl},
          "updatedAt" = NOW()
      WHERE (
        (id = ${userId} OR LOWER(email) = ${email})
        AND (
          LOWER("tenantSlug") = ${tenantSlug.toLowerCase()}
          OR "tenantSlug" = ''
          OR "tenantSlug" IS NULL
        )
      )
      RETURNING id, name, email, role, department, designation, avatar, company, "tenantSlug";
    `;

    // If no row matched with tenant isolation, attempt fallback lookup by id/email directly
    let updatedUser = result[0];
    if (!updatedUser) {
      const fallbackResult = await sql`
        UPDATE "User"
        SET avatar = ${avatarUrl},
            "updatedAt" = NOW()
        WHERE id = ${userId} OR LOWER(email) = ${email}
        RETURNING id, name, email, role, department, designation, avatar, company, "tenantSlug";
      `;
      updatedUser = fallbackResult[0];
    }

    return NextResponse.json({
      success: true,
      status: "success",
      message: "Avatar updated successfully",
      avatar: avatarUrl,
      user: updatedUser || { id: userId, email, avatar: avatarUrl },
    });
  } catch (err: any) {
    console.error("[Avatar Update API] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update avatar: " + err.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || searchParams.get("id");
  const email = searchParams.get("email");
  const tenantSlug = getValidatedTenantSlug(request) || "";

  if (!userId && !email) {
    return NextResponse.json(
      { success: false, error: "userId or email query parameter required" },
      { status: 400 }
    );
  }

  try {
    const sql = await getTenantSql(tenantSlug);
    const rows = await sql`
      SELECT id, name, email, role, department, designation, avatar
      FROM "User"
      WHERE (id = ${userId} OR LOWER(email) = ${email?.toLowerCase()})
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, avatar: rows[0].avatar, user: rows[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
