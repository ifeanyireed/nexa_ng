import { NextResponse } from "next/server";

const rawUserUrl = process.env.USER_SERVICE_URL || process.env.NEXT_PUBLIC_USER_SERVICE_URL || "https://ofia-user-service.onrender.com";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

const globalOrgMap = (globalThis as any).__OFIA_ORG_MAP__ || new Map<string, any>();
(globalThis as any).__OFIA_ORG_MAP__ = globalOrgMap;

import { INITIAL_TENANTS } from "@/lib/admin-data";

export async function GET() {
  let list: any[] = [];
  try {
    const res = await fetch(`${USER_BASE}/organizations`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        list = data;
      }
    }
  } catch (err: any) {
    console.warn("Failed to fetch organizations from backend database:", err.message);
  }

  // If list is empty, fallback to initial tenants
  if (list.length === 0) {
    list = INITIAL_TENANTS.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      domain: t.domain,
      ownerName: t.ownerName,
      ownerEmail: t.ownerEmail,
      logo: t.logo,
      favicon: t.favicon,
      primaryColor: t.primaryColor,
      secondaryColor: t.secondaryColor,
      loginImage: t.loginImage,
      planTier: t.planTier,
      status: t.status,
    }));
  }

  // Merge any in-memory overrides
  const mergedList = list.map((org) => {
    const initialMatch = INITIAL_TENANTS.find(
      (t) => t.id === org.id || t.slug === org.slug
    );
    const override =
      globalOrgMap.get(org.id?.toLowerCase()) ||
      globalOrgMap.get(org.slug?.toLowerCase()) ||
      globalOrgMap.get(org.name?.toLowerCase());

    const base = initialMatch
      ? {
          ...initialMatch,
          ...org,
          logo: org.logo || initialMatch.logo,
          favicon: org.favicon || initialMatch.favicon,
          primaryColor: org.primaryColor || initialMatch.primaryColor,
          secondaryColor: org.secondaryColor || initialMatch.secondaryColor,
          loginImage: org.loginImage || initialMatch.loginImage,
        }
      : org;

    if (override) {
      return {
        ...base,
        ...override,
        owner: {
          ...(base.owner || {}),
          name: override.ownerName || override.owner_name || base.owner?.name,
          email: override.ownerEmail || override.owner_email || base.owner?.email,
        },
      };
    }
    return base;
  });

  return NextResponse.json(mergedList);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resolvedOwnerName = body.ownerName || body.owner_name || body.adminName || body.admin_name || "";
    const resolvedOwnerEmail = body.ownerEmail || body.owner_email || body.adminEmail || body.admin_email || "";

    const normalizedBody = {
      ...body,
      id: body.id || `org-${Date.now()}`,
      ownerName: resolvedOwnerName,
      owner_name: resolvedOwnerName,
      adminName: resolvedOwnerName,
      admin_name: resolvedOwnerName,
      ownerEmail: resolvedOwnerEmail,
      owner_email: resolvedOwnerEmail,
      adminEmail: resolvedOwnerEmail,
      admin_email: resolvedOwnerEmail,
      owner: {
        ...(body.owner || {}),
        name: resolvedOwnerName,
        email: resolvedOwnerEmail,
      },
    };

    if (normalizedBody.id) globalOrgMap.set(normalizedBody.id.toLowerCase(), normalizedBody);
    if (normalizedBody.slug) globalOrgMap.set(normalizedBody.slug.toLowerCase(), normalizedBody);

    try {
      const res = await fetch(`${USER_BASE}/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedBody),
      });

      if (res.ok) {
        const created = await res.json();
        return NextResponse.json({ ...created, ...normalizedBody }, { status: 201 });
      }
    } catch (e: any) {
      console.warn("Remote org create fetch failed, returning in-memory created record:", e.message);
    }

    return NextResponse.json(normalizedBody, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to persist organization to database: " + err.message },
      { status: 500 }
    );
  }
}
