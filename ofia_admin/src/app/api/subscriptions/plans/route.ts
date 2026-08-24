import { NextResponse } from "next/server";
import { SUBSCRIPTION_TIERS_CATALOG } from "@/app/tenants/page";

const USER_BASE = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:8081/api/v1";

// Shared global in-memory store for Next.js runtime
declare global {
  // eslint-disable-next-line no-var
  var __OFIA_PLANS_STORE__: any[] | undefined;
}

export function getPlansStore(): any[] {
  if (!globalThis.__OFIA_PLANS_STORE__ || globalThis.__OFIA_PLANS_STORE__.length === 0) {
    globalThis.__OFIA_PLANS_STORE__ = SUBSCRIPTION_TIERS_CATALOG.map((p) => ({
      id: p.id,
      category: p.category,
      category_label: p.categoryLabel,
      tier: p.tier,
      name: p.name,
      price_ngn: p.priceNgn,
      price_usd: 0,
      period: p.period,
      badge: p.badge,
      description: p.description,
      leads_limit: p.leadsLimit,
      campaigns_limit: p.campaignsLimit,
      team_seats: p.teamSeats,
      tokens_limit: p.tokensLimit,
      storefronts_limit: p.storefrontsLimit,
      features_json: JSON.stringify(p.features),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }
  return globalThis.__OFIA_PLANS_STORE__;
}

export function setPlansStore(plans: any[]) {
  globalThis.__OFIA_PLANS_STORE__ = plans;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    const url = category && category !== "ALL"
      ? `${USER_BASE}/subscriptions/plans?category=${encodeURIComponent(category)}`
      : `${USER_BASE}/subscriptions/plans`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(url, { cache: "no-store", signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setPlansStore(data);
        return NextResponse.json(data);
      }
    }
  } catch {
    // Backend service not reachable or timed out, use store
  }

  const store = getPlansStore();
  if (category && category !== "ALL") {
    return NextResponse.json(store.filter((p) => p.category === category));
  }
  return NextResponse.json(store);
}

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const planId = body.id || `plan-${Date.now()}`;
  const newPlan = {
    id: planId,
    category: body.category || "OFIA_AI",
    category_label: body.category_label || body.categoryLabel || "Ofia Plan",
    tier: body.tier || "STARTER",
    name: body.name || "New Subscription Plan",
    price_ngn: Number(body.price_ngn !== undefined ? body.price_ngn : body.priceNgn || 0),
    price_usd: Number(body.price_usd || 0),
    period: body.period || "Monthly",
    badge: body.badge || "",
    description: body.description || "",
    leads_limit: Number(body.leads_limit !== undefined ? body.leads_limit : body.leadsLimit || 1000),
    campaigns_limit: Number(body.campaigns_limit !== undefined ? body.campaigns_limit : body.campaignsLimit || 3),
    team_seats: Number(body.team_seats !== undefined ? body.team_seats : body.teamSeats || 5),
    tokens_limit: Number(body.tokens_limit !== undefined ? body.tokens_limit : body.tokensLimit || 0),
    storefronts_limit: Number(body.storefronts_limit !== undefined ? body.storefronts_limit : body.storefrontsLimit || 0),
    features_json: typeof body.features_json === "string" ? body.features_json : JSON.stringify(body.features || []),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Try proxy to Go backend
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    await fetch(`${USER_BASE}/subscriptions/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPlan),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch {
    // Go backend offline
  }

  // Update in-memory store
  const store = getPlansStore();
  setPlansStore([...store, newPlan]);

  return NextResponse.json(newPlan, { status: 201 });
}
