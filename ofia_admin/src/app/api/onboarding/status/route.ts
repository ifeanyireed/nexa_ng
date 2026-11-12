import { NextRequest, NextResponse } from "next/server";
import { getOnboardingProgress } from "@/lib/provisioning/provisioning-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = (searchParams.get("slug") || searchParams.get("tenantId") || "").trim();

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "slug parameter is required" },
        { status: 400 }
      );
    }

    const progress = await getOnboardingProgress(slug);

    if (!progress) {
      return NextResponse.json(
        { success: false, error: `Tenant workspace '${slug}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ...progress,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
