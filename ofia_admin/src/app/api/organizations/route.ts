import { NextResponse } from "next/server";
import { INITIAL_TENANTS, TenantOrg } from "@/lib/admin-data";

const USER_BASE = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:8081/api/v1";

// Shared global in-memory store for Next.js runtime
declare global {
  // eslint-disable-next-line no-var
  var __OFIA_TENANTS_STORE__: TenantOrg[] | undefined;
}

export function getTenantsStore(): TenantOrg[] {
  if (!globalThis.__OFIA_TENANTS_STORE__ || globalThis.__OFIA_TENANTS_STORE__.length === 0) {
    globalThis.__OFIA_TENANTS_STORE__ = [...INITIAL_TENANTS];
  }
  return globalThis.__OFIA_TENANTS_STORE__;
}

export function setTenantsStore(tenants: TenantOrg[]) {
  globalThis.__OFIA_TENANTS_STORE__ = tenants;
}

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${USER_BASE}/organizations`, { cache: "no-store", signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Merge or sync with store
        const store = getTenantsStore();
        return NextResponse.json(store);
      }
    }
  } catch {
    // Backend service offline
  }

  const store = getTenantsStore();
  return NextResponse.json(store);
}

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const store = getTenantsStore();
  const orgSlug = body.slug || body.name?.toLowerCase().replace(/\s+/g, "-") || `org-${Date.now()}`;
  const newTenant: TenantOrg = {
    id: body.id || `org-${String(store.length + 1).padStart(2, "0")}`,
    name: body.name || "New Tenant Workspace",
    slug: orgSlug,
    domain: body.domain || `${orgSlug}.ofia.ng`,
    ownerName: body.ownerName || body.owner_name || "System Admin",
    ownerEmail: body.ownerEmail || body.owner_email || `admin@${orgSlug}.ng`,
    planTier: body.planTier || body.plan_tier || "GROWTH",
    status: body.status === "Suspended" || body.status === "SUSPENDED" ? "Suspended" : "Active",
    mrr: Number(body.mrr || 24000),
    activeAgentsCount: Number(body.activeAgentsCount || 15),
    leadsUsed: Number(body.leadsUsed || 0),
    leadsLimit: Number(body.leadsLimit || 5000),
    campaignsActive: Number(body.campaignsActive || 0),
    campaignsLimit: Number(body.campaignsLimit || 10),
    monthlyAiSpendUSD: Number(body.monthlyAiSpendUSD || 0),
    integrationHealth: "Healthy",
    erpModules: body.erpModules || { ...INITIAL_TENANTS[0].erpModules },
    createdAt: new Date().toISOString().split("T")[0],
  };

  // Try proxy to Go backend
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    await fetch(`${USER_BASE}/organizations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTenant.name,
        slug: newTenant.slug,
        plan_tier: newTenant.planTier,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch {
    // Go backend offline
  }

  setTenantsStore([newTenant, ...store]);
  return NextResponse.json(newTenant, { status: 201 });
}
