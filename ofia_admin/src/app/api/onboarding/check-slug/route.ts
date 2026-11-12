import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { MASTER_CONNECTION_STRING } from "@/lib/tenant-db-resolver";
import { validateSubdomainAvailability, normalizeSubdomainSlug } from "@/lib/subdomain-checker";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSlug = (searchParams.get("slug") || "").trim();

    if (!rawSlug) {
      return NextResponse.json({
        isAvailable: false,
        message: "Please enter a business URL slug.",
        suggestions: [],
      });
    }

    const normalized = normalizeSubdomainSlug(rawSlug);

    // Query database for existing tenant slugs
    let existingSlugs = new Set<string>();
    if (MASTER_CONNECTION_STRING) {
      try {
        const sql = neon(MASTER_CONNECTION_STRING);
        const rows = await sql`
          SELECT slug FROM platform_tenants;
        `;
        existingSlugs = new Set(rows.map((r: any) => (r.slug || "").toLowerCase()));
      } catch (err: any) {
        console.warn("[Check Slug API] Could not fetch live slugs, using memory cache:", err.message);
      }
    }

    const check = validateSubdomainAvailability(rawSlug, existingSlugs);

    return NextResponse.json({
      success: true,
      slug: check.slug,
      normalizedSlug: check.normalizedSlug,
      isAvailable: check.isAvailable,
      category: check.category,
      message: check.message,
      workspaceDomain: check.workspaceDomain,
      storefrontDomain: check.storefrontDomain,
      customShopDomain: check.customShopDomain,
      suggestions: check.suggestions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to validate slug availability: " + err.message },
      { status: 500 }
    );
  }
}
