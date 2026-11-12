import { NextRequest, NextResponse } from "next/server";
import { updateTenantBusinessProfile } from "@/lib/provisioning/provisioning-engine";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantSlug, address, city, state, country, phone, description, vertical, logo } = body;

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenantSlug is required" },
        { status: 400 }
      );
    }

    const result = await updateTenantBusinessProfile({
      tenantSlug,
      address,
      city,
      state,
      country,
      phone,
      description,
      vertical,
      logo,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      tenant: result.tenant,
      nextStep: 3,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
