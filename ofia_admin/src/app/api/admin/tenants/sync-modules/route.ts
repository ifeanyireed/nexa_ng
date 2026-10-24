import { NextRequest, NextResponse } from "next/server";
import { alignTenantModules, alignAllTenants } from "@/lib/tenant-module-aligner";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { slug, erpModules, shopSubModules, mobilitySubModules } = body;

    if (slug) {
      const result = await alignTenantModules(slug, {
        erpModules,
        shopSubModules,
        mobilitySubModules,
      });
      return NextResponse.json({ success: true, result });
    }

    // If no specific tenant slug is provided, align all platform tenants
    const count = await alignAllTenants();
    return NextResponse.json({
      success: true,
      message: `Successfully aligned modules for ${count} tenants`,
      alignedCount: count,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to align tenant modules" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || searchParams.get("tenant");

    if (slug) {
      const result = await alignTenantModules(slug);
      return NextResponse.json({ success: true, result });
    }

    const count = await alignAllTenants();
    return NextResponse.json({
      success: true,
      message: `Successfully aligned modules for ${count} tenants`,
      alignedCount: count,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to align tenant modules" },
      { status: 500 }
    );
  }
}
