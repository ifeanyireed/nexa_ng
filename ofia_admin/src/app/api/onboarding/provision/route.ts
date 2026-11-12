import { NextRequest, NextResponse } from "next/server";
import { executeInfrastructureProvisioning } from "@/lib/provisioning/provisioning-engine";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantSlug, customCloudinaryUrl } = body;

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenantSlug is required" },
        { status: 400 }
      );
    }

    const result = await executeInfrastructureProvisioning({
      tenantSlug,
      customCloudinaryUrl,
    });

    if (!result.success && !result.neonResult?.projectId) {
      return NextResponse.json(
        { success: false, error: result.error || "Provisioning failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      neon: result.neonResult,
      cloudinary: result.cloudinaryResult,
      nextStep: 4,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
