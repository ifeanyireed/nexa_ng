import { NextResponse } from "next/server";

const rawUserUrl = process.env.USER_SERVICE_URL || process.env.NEXT_PUBLIC_USER_SERVICE_URL || "https://ofia-user-service.onrender.com";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

const globalOrgMap = (globalThis as any).__OFIA_ORG_MAP__ || new Map<string, any>();
(globalThis as any).__OFIA_ORG_MAP__ = globalOrgMap;

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

  // If list is empty, supply default seed list
  if (list.length === 0) {
    list = [
      {
        id: "org-01",
        name: "New Era Transports",
        slug: "neweratransports",
        domain: "neweratransports.ofia.ng",
        owner_name: "Ifeanyi Felix",
        owner_email: "ifeanyi.ibeh@neweratransports.com",
        plan_tier: "GROWTH",
        status: "ACTIVE",
      },
      {
        id: "org-02",
        name: "PayFlow Africa",
        slug: "payflow-africa",
        domain: "payflow-africa.ofia.ng",
        owner_name: "Chioma Okonkwo",
        owner_email: "chioma@payflow.africa",
        plan_tier: "ENTERPRISE",
        status: "ACTIVE",
      },
      {
        id: "org-03",
        name: "HealthBridge Clinics",
        slug: "healthbridge",
        domain: "healthbridge.ofia.ng",
        owner_name: "Dr. Babatunde Jinadu",
        owner_email: "babatunde@healthbridge.io",
        plan_tier: "STARTER",
        status: "ACTIVE",
      },
      {
        id: "org-04",
        name: "Apex Global Logistics",
        slug: "apex-logistics",
        domain: "apex-logistics.ofia.ng",
        owner_name: "Ibrahim Musa",
        owner_email: "ibrahim@apexlogistics.com.ng",
        plan_tier: "SCALE",
        status: "SUSPENDED",
      },
      {
        id: "org-05",
        name: "Zenith Real Estate Hub",
        slug: "zenith-re",
        domain: "zenith-re.ofia.ng",
        owner_name: "Ngozi Eze",
        owner_email: "ngozi@zenithrealty.ng",
        plan_tier: "FREE_TRIAL",
        status: "ACTIVE",
      },
    ];
  }

  // Merge any in-memory overrides
  const mergedList = list.map((org) => {
    const override =
      globalOrgMap.get(org.id?.toLowerCase()) ||
      globalOrgMap.get(org.slug?.toLowerCase()) ||
      globalOrgMap.get(org.name?.toLowerCase());

    if (override) {
      return {
        ...org,
        ...override,
        owner: {
          ...(org.owner || {}),
          name: override.ownerName || override.owner_name || org.owner?.name,
          email: override.ownerEmail || override.owner_email || org.owner?.email,
        },
      };
    }
    return org;
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
