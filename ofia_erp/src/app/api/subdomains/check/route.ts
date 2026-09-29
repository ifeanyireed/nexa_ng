import { NextRequest, NextResponse } from "next/server";
import { validateSubdomainAvailability } from "@/lib/subdomain-checker";

const USER_BASE = process.env.USER_SERVICE_URL
  ? `${process.env.USER_SERVICE_URL}/api/v1`
  : (process.env.NEXT_PUBLIC_USER_API_URL || "https://ofia-user-service.onrender.com/api/v1");
const GTM_BASE = process.env.AI_SERVICE_URL
  ? `${process.env.AI_SERVICE_URL}/api/v1/gtm`
  : (process.env.NEXT_PUBLIC_GTM_API_URL || "https://ofia-ai-service.onrender.com/api/v1/gtm");

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || "";

  if (!slug) {
    return NextResponse.json(
      {
        slug: "",
        isAvailable: false,
        category: "INVALID_FORMAT",
        message: "Missing 'slug' query parameter.",
        suggestions: [],
      },
      { status: 400 }
    );
  }

  // Attempt to fetch live database tenant slugs from backend microservices
  const liveTenantSlugs = new Set<string>();

  try {
    const orgsPromise = fetch(`${GTM_BASE}/admin/organizations`, {
      signal: AbortSignal.timeout(1500),
    }).then(async (res) => (res.ok ? res.json() : []));

    const [orgs] = await Promise.allSettled([orgsPromise]);
    if (orgs.status === "fulfilled" && Array.isArray(orgs.value)) {
      orgs.value.forEach((org: any) => {
        const s = org.slug || org.Slug;
        if (s) liveTenantSlugs.add(s.toLowerCase());
      });
    }
  } catch (err) {
    // Non-blocking fallback to internal seed registry
  }

  const result = validateSubdomainAvailability(slug, liveTenantSlugs);

  return NextResponse.json(result);
}
