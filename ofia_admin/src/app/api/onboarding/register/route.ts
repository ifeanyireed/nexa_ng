import { NextRequest, NextResponse } from "next/server";
import { registerTenantAndReserveSlug } from "@/lib/provisioning/provisioning-engine";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessName,
      slug,
      ownerName,
      ownerEmail,
      password,
      vertical,
      planTier,
      phone,
    } = body;

    const result = await registerTenantAndReserveSlug({
      businessName,
      slug,
      ownerName,
      ownerEmail,
      password,
      vertical,
      planTier,
      phone,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          suggestions: result.suggestions || [],
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      tenant: result.tenant,
      nextStep: 2,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to register tenant" },
      { status: 500 }
    );
  }
}
