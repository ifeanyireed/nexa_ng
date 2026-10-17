import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

const TENANT_STORAGE_REGISTRY: Record<string, string> = {
  neweratransports: "cloudinary://768523141117821:KeVQI7I7tuGlCxUIdWC9M6RdWjg@wnmabxiy",
  neweratrnsports: "cloudinary://768523141117821:KeVQI7I7tuGlCxUIdWC9M6RdWjg@wnmabxiy",
};

const PLATFORM_STORAGE_URL =
  process.env.PLATFORM_CLOUDINARY_URL ||
  "cloudinary://472234474198431:QoGMyc2f1ZLt_MNFWEs9kNKTEls@ihfqdysu";

function configureCloudinary(tenantId?: string | null) {
  const norm = (tenantId || "").toLowerCase().trim();
  const cloudinaryUrl = (norm && TENANT_STORAGE_REGISTRY[norm]) || PLATFORM_STORAGE_URL;

  try {
    const parsed = new URL(cloudinaryUrl);
    cloudinary.config({
      cloud_name: parsed.hostname,
      api_key: parsed.username,
      api_secret: parsed.password,
      secure: true,
    });
  } catch {
    cloudinary.config({
      cloud_name: "ihfqdysu",
      api_key: "472234474198431",
      api_secret: "QoGMyc2f1ZLt_MNFWEs9kNKTEls",
      secure: true,
    });
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

    configureCloudinary(tenantId);

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
