import { NextRequest, NextResponse } from "next/server";
import { checkNeonClaimStatus } from "@/lib/provisioning/neon-claimable-provisioner";

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

    const claimStatus = await checkNeonClaimStatus(tenantSlug);

    return NextResponse.json({
      success: true,
      ...claimStatus,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
