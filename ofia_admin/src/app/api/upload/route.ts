import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

function configureCloudinary() {
  const cloudinaryUrl =
    process.env.CLOUDINARY_URL ||
    "cloudinary://472234474198431:QoGMyc2f1ZLt_MNFWEs9kNKTEls@ihfqdysu";

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
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "ihfqdysu",
      api_key: process.env.CLOUDINARY_API_KEY || "472234474198431",
      api_secret: process.env.CLOUDINARY_API_SECRET || "QoGMyc2f1ZLt_MNFWEs9kNKTEls",
      secure: true,
    });
  }
}

export async function POST(request: Request) {
  try {
    configureCloudinary();
    const contentType = request.headers.get("content-type") || "";

    let imagePayload: string | null = null;
    let folder = "ofia_ng_assets/logos";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const targetPath = formData.get("target_path") as string | null;
      const tenantId = formData.get("tenantId") as string | null;

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
      const tenantId = body.tenantId;
      if (tenantId) {
        folder = `ofia_ng_assets/${tenantId}`;
      }
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
