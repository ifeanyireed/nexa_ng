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
    const { image, tenantId } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image payload provided" }, { status: 400 });
    }

    configureCloudinary();

    const folder = tenantId ? `ofia_ng_assets/${tenantId}` : "ofia_ng_assets/logos";

    const uploadResponse = await cloudinary.uploader.upload(image, {
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
