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
    console.warn("[ERP White BG Route] Failed to parse Cloudinary URL:", err);
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
      console.warn("[ERP White BG Route] Could not resolve tenant Cloudinary URL:", err);
    }
  }

  const envUrl = process.env.CLOUDINARY_URL || process.env.PLATFORM_CLOUDINARY_URL || "";
  return parseCloudinaryUrl(envUrl);
}

/**
 * Transforms a Cloudinary URL to apply AI background removal and pure white background:
 * e_background_removal,b_rgb:FFFFFF
 */
function applyCloudinaryWhiteBgTransformation(url: string): string {
  if (!url.includes("res.cloudinary.com")) return url;

  // If already has background removal transformation, ensure pure white background
  if (url.includes("e_background_removal")) {
    return url.replace(/e_background_removal[^/]*\//, "e_background_removal,b_rgb:FFFFFF/");
  }

  // Insert e_background_removal,b_rgb:FFFFFF right after /image/upload/
  return url.replace(
    /\/image\/upload\/(?:v\d+\/)?/,
    (match) => match.replace("/image/upload/", "/image/upload/e_background_removal,b_rgb:FFFFFF/")
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, tenantSlug } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
    }

    const cleanTenant = (tenantSlug || "").toLowerCase().trim();

    // 1. Check for Photoroom API key (Industry leader for fashion/apparel packshots)
    if (process.env.PHOTOROOM_API_KEY) {
      try {
        const photoRoomRes = await fetch("https://sdk.photoroom.com/v1/segment", {
          method: "POST",
          headers: {
            "x-api-key": process.env.PHOTOROOM_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image_url: imageUrl,
            background_color: "FFFFFF",
          }),
        });

        if (photoRoomRes.ok) {
          const buffer = Buffer.from(await photoRoomRes.arrayBuffer());
          const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;

          // Re-upload processed buffer to tenant's Cloudinary storage
          const creds = await getCloudinaryCredentialsForTenant(cleanTenant);
          if (creds) {
            const upload = await cloudinary.uploader.upload(base64, {
              folder: `ofia_ng_assets/${cleanTenant || "catalog"}/white_bg`,
              cloud_name: creds.cloudName,
              api_key: creds.apiKey,
              api_secret: creds.apiSecret,
              secure: true,
            });
            return NextResponse.json({
              success: true,
              url: upload.secure_url,
              provider: "photoroom_ai",
            });
          }

          return NextResponse.json({
            success: true,
            url: base64,
            provider: "photoroom_ai",
          });
        }
      } catch (prErr) {
        console.warn("[White BG API] Photoroom call error, falling back:", prErr);
      }
    }

    // 2. Check for remove.bg API key
    if (process.env.REMOVE_BG_API_KEY) {
      try {
        const removeBgRes = await fetch("https://api.remove.bg/v1.0/removebg", {
          method: "POST",
          headers: {
            "X-Api-Key": process.env.REMOVE_BG_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image_url: imageUrl,
            bg_color: "white",
            size: "auto",
          }),
        });

        if (removeBgRes.ok) {
          const buffer = Buffer.from(await removeBgRes.arrayBuffer());
          const base64 = `data:image/png;base64,${buffer.toString("base64")}`;

          const creds = await getCloudinaryCredentialsForTenant(cleanTenant);
          if (creds) {
            const upload = await cloudinary.uploader.upload(base64, {
              folder: `ofia_ng_assets/${cleanTenant || "catalog"}/white_bg`,
              cloud_name: creds.cloudName,
              api_key: creds.apiKey,
              api_secret: creds.apiSecret,
              secure: true,
            });
            return NextResponse.json({
              success: true,
              url: upload.secure_url,
              provider: "remove_bg",
            });
          }

          return NextResponse.json({
            success: true,
            url: base64,
            provider: "remove_bg",
          });
        }
      } catch (rbErr) {
        console.warn("[White BG API] remove.bg call error, falling back:", rbErr);
      }
    }

    // 3. Cloudinary native AI background removal & pure white backdrop
    if (imageUrl.includes("res.cloudinary.com")) {
      const transformedUrl = applyCloudinaryWhiteBgTransformation(imageUrl);
      return NextResponse.json({
        success: true,
        url: transformedUrl,
        provider: "cloudinary_ai",
      });
    }

    // 4. External image upload to Cloudinary with background removal
    const creds = await getCloudinaryCredentialsForTenant(cleanTenant);
    if (creds) {
      const upload = await cloudinary.uploader.upload(imageUrl, {
        folder: `ofia_ng_assets/${cleanTenant || "catalog"}/white_bg`,
        transformation: [
          { effect: "background_removal", background: "white" },
        ],
        cloud_name: creds.cloudName,
        api_key: creds.apiKey,
        api_secret: creds.apiSecret,
        secure: true,
      });

      return NextResponse.json({
        success: true,
        url: upload.secure_url,
        provider: "cloudinary_ai_upload",
      });
    }

    // 5. Fallback: return image URL if no provider is configured
    return NextResponse.json({
      success: true,
      url: imageUrl,
      fallback: true,
      message: "No AI background removal credentials configured. Retained original photo.",
    });
  } catch (err: any) {
    console.error("[White BG API] Error processing image:", err);
    return NextResponse.json(
      { error: "Failed to process photo background: " + (err?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
