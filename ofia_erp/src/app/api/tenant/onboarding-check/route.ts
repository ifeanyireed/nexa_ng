import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { MASTER_REGISTRY_URL } from "@/lib/tenant-db-resolver";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSlug = (searchParams.get("slug") || "").toLowerCase().trim();
    const rawEmail = (searchParams.get("email") || "").toLowerCase().trim();

    if (!rawSlug && !rawEmail) {
      return NextResponse.json(
        { error: "slug or email parameter is required" },
        { status: 400 }
      );
    }

    if (!MASTER_REGISTRY_URL) {
      // In offline / fallback test environments
      return NextResponse.json({
        exists: true,
        isComplete: true,
        status: "Active",
        onboardingStatus: "COMPLETED",
        onboardingStep: 6,
      });
    }

    const sql = neon(MASTER_REGISTRY_URL);

    let rows: any[] = [];
    if (rawSlug) {
      rows = await sql`
        SELECT id, name, slug, status, onboarding_status, onboarding_step, owner_email
        FROM platform_tenants
        WHERE LOWER(slug) = ${rawSlug}
           OR REPLACE(LOWER(slug), '-', '') = REPLACE(${rawSlug}, '-', '')
        LIMIT 1;
      `;
    } else if (rawEmail) {
      rows = await sql`
        SELECT id, name, slug, status, onboarding_status, onboarding_step, owner_email
        FROM platform_tenants
        WHERE LOWER(owner_email) = ${rawEmail}
        ORDER BY created_at DESC
        LIMIT 1;
      `;
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        exists: false,
        isComplete: true, // If tenant not found in platform_tenants, do not block (might be legacy or system account)
      });
    }

    const tenant = rows[0];
    const status = tenant.status || "Active";
    const onboardingStatus = tenant.onboarding_status || "COMPLETED";
    const step = Number(tenant.onboarding_step || 6);

    const isIncomplete =
      status.toLowerCase() === "onboarding" ||
      onboardingStatus.toUpperCase() === "IN_PROGRESS" ||
      step < 6;

    const landingBase =
      process.env.NEXT_PUBLIC_LANDING_URL ||
      process.env.LANDING_URL ||
      "https://ofia.ng";
    const resumeUrl = `${landingBase.replace(/\/+$/, "")}/onboarding?resume=${encodeURIComponent(tenant.slug)}`;

    return NextResponse.json({
      exists: true,
      slug: tenant.slug,
      name: tenant.name,
      status,
      onboardingStatus,
      onboardingStep: step,
      isComplete: !isIncomplete,
      resumeUrl,
    });
  } catch (err: any) {
    console.warn("[Onboarding Check API] Failed to query platform registry:", err.message);
    // Fail safe to not break login if DB query encounters transient error
    return NextResponse.json({
      exists: true,
      isComplete: true,
      error: err.message,
    });
  }
}
