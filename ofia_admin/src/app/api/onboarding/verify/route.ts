import { NextRequest, NextResponse } from "next/server";
import { verifyInfrastructureIntegrations } from "@/lib/provisioning/provisioning-engine";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantSlug } = body;

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenantSlug is required" },
        { status: 400 }
      );
    }

    const testResults = await verifyInfrastructureIntegrations(tenantSlug);

    return NextResponse.json({
      success: testResults.success,
      neon: testResults.neon,
      cloudinary: testResults.cloudinary,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
