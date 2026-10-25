import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { MASTER_CONNECTION_STRING } from "@/lib/tenant-db-resolver";
import { neon } from "@neondatabase/serverless";

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
  } catch (err) {
    console.warn("[Admin Upload Route] Failed to parse Cloudinary URL:", err);
    return null;
  }
}

async function getCloudinaryCredentialsForTenant(tenantId?: string | null): Promise<CloudinaryCredentials | null> {
  const norm = (tenantId || "").toLowerCase().trim();
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
      console.warn("[Admin Upload Route] Could not resolve tenant Cloudinary URL:", err);
    }
  }

  const envUrl = process.env.CLOUDINARY_URL || process.env.PLATFORM_CLOUDINARY_URL || "";
  return parseCloudinaryUrl(envUrl);
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const contentType = request.headers.get("content-type") || "";

    let imagePayload: string | null = null;
    let tenantId: string | null =
      url.searchParams.get("tenant") ||
      request.headers.get("x-tenant-slug") ||
      null;
    let targetFolder: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const formTenant = (formData.get("tenantId") || formData.get("tenantSlug") || formData.get("tenant")) as string | null;
      if (formTenant) tenantId = formTenant;
      targetFolder = (formData.get("folder") || formData.get("target_path")) as string | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided in form data" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mime = file.type || "image/jpeg";
      imagePayload = `data:${mime};base64,${buffer.toString("base64")}`;
    } else {
      const body = await request.json();
      imagePayload = body.image;
      if (body.tenantId || body.tenantSlug || body.tenant) {
        tenantId = body.tenantId || body.tenantSlug || body.tenant;
      }
      if (body.folder || body.targetPath) {
        targetFolder = body.folder || body.targetPath;
      }
    }

    if (!imagePayload) {
      return NextResponse.json({ error: "No image payload provided" }, { status: 400 });
    }

    const cleanTenant = (tenantId || "").toLowerCase().trim();
    const creds = await getCloudinaryCredentialsForTenant(cleanTenant);

    if (!creds) {
      return NextResponse.json(
        { error: "Cloudinary storage credentials not configured for tenant or platform." },
        { status: 500 }
      );
    }

    const folder = targetFolder
      ? `ofia_ng_assets/${targetFolder}`
      : cleanTenant
      ? `ofia_ng_assets/${cleanTenant}`
      : "ofia_ng_assets/logos";

    const uploadResponse = await cloudinary.uploader.upload(imagePayload, {
      folder,
      resource_type: "image",
      cloud_name: creds.cloudName,
      api_key: creds.apiKey,
      api_secret: creds.apiSecret,
      secure: true,
    });

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      cloudName: creds.cloudName,
      tenant: cleanTenant,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error in ofia_admin:", error);
    return NextResponse.json(
      { error: "Image upload failed: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
