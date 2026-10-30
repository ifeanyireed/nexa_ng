export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
  // Standard format: cloudinary://<api_key>:<api_secret>@<cloud_name>
  const match = cleaned.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?#]+)/i);
  if (match) {
    return {
      apiKey: match[1],
      apiSecret: match[2],
      cloudName: match[3],
    };
  }
  try {
    const httpEquiv = cleaned.replace(/^cloudinary:\/\//i, "http://");
    const parsed = new URL(httpEquiv);
    if (parsed.hostname && parsed.username && parsed.password) {
      return {
        cloudName: parsed.hostname,
        apiKey: parsed.username,
        apiSecret: parsed.password,
      };
    }
  } catch (err) {
    console.warn("[Admin Upload Route] Failed to parse Cloudinary URL:", err);
  }
  return null;
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
  const envCreds = parseCloudinaryUrl(envUrl);
  if (envCreds) return envCreds;

  // Fallback to active tenant storage config registered in the master platform database
  if (MASTER_CONNECTION_STRING) {
    try {
      const sql = neon(MASTER_CONNECTION_STRING);
      const rows = await sql`
        SELECT cloudinary_url FROM platform_tenants
        WHERE cloudinary_url IS NOT NULL AND cloudinary_url != ''
        LIMIT 1;
      `;
      if (rows && rows.length > 0 && rows[0].cloudinary_url) {
        const creds = parseCloudinaryUrl(rows[0].cloudinary_url);
        if (creds) return creds;
      }
    } catch (err) {
      console.warn("[Admin Upload Route] Fallback to platform tenant cloudinary failed:", err);
    }
  }

  return null;
}

function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  creds: CloudinaryCredentials
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        cloud_name: creds.cloudName,
        api_key: creds.apiKey,
        api_secret: creds.apiSecret,
        secure: true,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Empty response from Cloudinary"));
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

function uploadBase64ToCloudinary(
  imagePayload: string,
  folder: string,
  creds: CloudinaryCredentials
): Promise<{ secure_url: string; public_id: string }> {
  return cloudinary.uploader.upload(imagePayload, {
    folder,
    resource_type: "auto",
    cloud_name: creds.cloudName,
    api_key: creds.apiKey,
    api_secret: creds.apiSecret,
    secure: true,
  });
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const contentType = request.headers.get("content-type") || "";

    let fileBuffer: Buffer | null = null;
    let base64Payload: string | null = null;
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
      fileBuffer = Buffer.from(bytes);
    } else {
      const body = await request.json();
      base64Payload = body.image;
      if (body.tenantId || body.tenantSlug || body.tenant) {
        tenantId = body.tenantId || body.tenantSlug || body.tenant;
      }
      if (body.folder || body.targetPath) {
        targetFolder = body.folder || body.targetPath;
      }
    }

    if (!fileBuffer && !base64Payload) {
      return NextResponse.json({ error: "No image payload or file provided" }, { status: 400 });
    }

    const cleanTenant = (tenantId || "").toLowerCase().trim();
    const creds = await getCloudinaryCredentialsForTenant(cleanTenant);

    if (!creds) {
      return NextResponse.json(
        { error: "Cloudinary storage credentials not configured for tenant or platform." },
        { status: 500 }
      );
    }

    cloudinary.config({
      cloud_name: creds.cloudName,
      api_key: creds.apiKey,
      api_secret: creds.apiSecret,
      secure: true,
    });

    const cleanTarget = (targetFolder || "").replace(/^\/+/, "").replace(/\/+$/, "");
    const folder = cleanTarget
      ? cleanTarget.startsWith("ofia_ng_assets/")
        ? cleanTarget
        : `ofia_ng_assets/${cleanTarget}`
      : cleanTenant
      ? `ofia_ng_assets/${cleanTenant}`
      : "ofia_ng_assets/blog/covers";

    let uploadResult: { secure_url: string; public_id: string };

    if (fileBuffer) {
      uploadResult = await uploadBufferToCloudinary(fileBuffer, folder, creds);
    } else {
      uploadResult = await uploadBase64ToCloudinary(base64Payload!, folder, creds);
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
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
