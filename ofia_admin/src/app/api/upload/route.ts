import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { MASTER_CONNECTION_STRING } from "@/lib/tenant-db-resolver";
import { neon } from "@neondatabase/serverless";

async function getCloudinaryUrlForTenant(tenantId?: string | null): Promise<string> {
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
        return rows[0].cloudinary_url.replace(/^CLOUDINARY_URL=/, "").trim();
      }
    } catch (err) {
      console.warn("[Upload Route] Could not resolve tenant Cloudinary URL:", err);
    }
  }

  const envUrl = process.env.CLOUDINARY_URL || process.env.PLATFORM_CLOUDINARY_URL || "";
  return envUrl.replace(/^CLOUDINARY_URL=/, "").trim();
}

function configureCloudinaryFromUrl(rawUrl: string): boolean {
  if (!rawUrl) return false;
  try {
    const parsed = new URL(rawUrl);
    cloudinary.config({
      cloud_name: parsed.hostname,
      api_key: parsed.username,
      api_secret: parsed.password,
      secure: true,
    });
    return true;
  } catch (err) {
    console.warn("[Upload Route] Failed to parse Cloudinary URL:", err);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let imagePayload: string | null = null;
    let folder = "ofia_ng_assets/logos";
    let tenantId: string | null = request.headers.get("x-tenant-slug");

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const targetPath = formData.get("target_path") as string | null;
      const formTenant = formData.get("tenantId") as string | null;
      if (formTenant) tenantId = formTenant;

      if (!file) {
        return NextResponse.json({ error: "No file provided in form data" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mime = file.type || "image/jpeg";
      imagePayload = `data:${mime};base64,${buffer.toString("base64")}`;

      if (targetPath) {
        folder = `ofia_ng_assets/${targetPath}`;
      } else if (tenantId) {
        folder = `ofia_ng_assets/${tenantId}`;
      }
    } else {
      const body = await request.json();
      imagePayload = body.image;
      if (body.tenantId) {
        tenantId = body.tenantId;
        folder = `ofia_ng_assets/${tenantId}`;
      }
    }

    const cloudinaryUrl = await getCloudinaryUrlForTenant(tenantId);
    if (!cloudinaryUrl || !configureCloudinaryFromUrl(cloudinaryUrl)) {
      return NextResponse.json(
        { error: "Cloudinary storage is not configured in environment or tenant settings." },
        { status: 500 }
      );
    }

    if (!imagePayload) {
      return NextResponse.json({ error: "No image payload provided" }, { status: 400 });
    }

    const uploadResponse = await cloudinary.uploader.upload(imagePayload, {
      folder,
      resource_type: "image",
    });

    return NextResponse.json({
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error in ofia_admin:", error);
    return NextResponse.json(
      { error: "Image upload failed: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
