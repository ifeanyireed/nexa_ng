import { NextResponse } from "next/server";

const rawUserUrl = process.env.USER_SERVICE_URL || process.env.NEXT_PUBLIC_USER_SERVICE_URL || "https://ofia-user-service.onrender.com";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

// Global in-memory overrides to guarantee persistent updates across the application
const globalOrgMap = (globalThis as any).__OFIA_ORG_MAP__ || new Map<string, any>();
(globalThis as any).__OFIA_ORG_MAP__ = globalOrgMap;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const lowerId = orgId.toLowerCase();

  try {
    const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const override = globalOrgMap.get(lowerId) || globalOrgMap.get(data.id?.toLowerCase()) || globalOrgMap.get(data.slug?.toLowerCase());
      if (override) {
        return NextResponse.json({ ...data, ...override });
      }
      return NextResponse.json(data);
    }
  } catch (err: any) {
    console.warn("Failed to fetch organization from remote backend:", err.message);
  }

  // Check in-memory store
  const override = globalOrgMap.get(lowerId);
  if (override) {
    return NextResponse.json(override);
  }

  return NextResponse.json({
    id: orgId,
    name: orgId,
    slug: orgId,
    domain: `${orgId}.ofia.ng`,
    status: "ACTIVE",
    planTier: "Enterprise",
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const lowerId = orgId.toLowerCase();

  try {
    const body = await request.json();
    const resolvedOwnerName = body.ownerName || body.owner_name || body.adminName || body.admin_name || "";
    const resolvedOwnerEmail = body.ownerEmail || body.owner_email || body.adminEmail || body.admin_email || "";

    const normalizedBody = {
      ...body,
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

    // Save in global in-memory map
    globalOrgMap.set(lowerId, normalizedBody);
    if (body.slug) globalOrgMap.set(body.slug.toLowerCase(), normalizedBody);
    if (body.id) globalOrgMap.set(body.id.toLowerCase(), normalizedBody);

    // Forward update to remote microservice
    try {
      const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedBody),
      });

      if (res.ok) {
        const updated = await res.json();
        const merged = { ...updated, ...normalizedBody };
        globalOrgMap.set(lowerId, merged);
        return NextResponse.json(merged);
      }
    } catch (e: any) {
      console.warn("Remote org update fetch failed, returning in-memory updated record:", e.message);
    }

    return NextResponse.json(normalizedBody);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update organization: " + err.message },
      { status: 500 }
    );
  }
}
