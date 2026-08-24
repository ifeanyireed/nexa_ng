import { NextResponse } from "next/server";
import { getPlansStore, setPlansStore } from "../route";

const USER_BASE = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:8081/api/v1";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${USER_BASE}/subscriptions/plans/${encodeURIComponent(id)}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Fallback
  }

  const store = getPlansStore();
  const plan = store.find((p) => p.id === id);
  if (plan) {
    return NextResponse.json(plan);
  }

  return NextResponse.json({ id, error: "Not found" }, { status: 404 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const updatedFields: any = {
    id,
    updated_at: new Date().toISOString(),
  };

  if (body.name !== undefined) updatedFields.name = body.name;
  if (body.price_ngn !== undefined) updatedFields.price_ngn = Number(body.price_ngn);
  else if (body.priceNgn !== undefined) updatedFields.price_ngn = Number(body.priceNgn);
  if (body.price_usd !== undefined) updatedFields.price_usd = Number(body.price_usd);
  if (body.period !== undefined) updatedFields.period = body.period;
  if (body.badge !== undefined) updatedFields.badge = body.badge;
  if (body.description !== undefined) updatedFields.description = body.description;
  if (body.category !== undefined) updatedFields.category = body.category;
  if (body.category_label !== undefined) updatedFields.category_label = body.category_label;
  else if (body.categoryLabel !== undefined) updatedFields.category_label = body.categoryLabel;
  if (body.tier !== undefined) updatedFields.tier = body.tier;
  if (body.leads_limit !== undefined) updatedFields.leads_limit = Number(body.leads_limit);
  else if (body.leadsLimit !== undefined) updatedFields.leads_limit = Number(body.leadsLimit);
  if (body.campaigns_limit !== undefined) updatedFields.campaigns_limit = Number(body.campaigns_limit);
  else if (body.campaignsLimit !== undefined) updatedFields.campaigns_limit = Number(body.campaignsLimit);
  if (body.team_seats !== undefined) updatedFields.team_seats = Number(body.team_seats);
  else if (body.teamSeats !== undefined) updatedFields.team_seats = Number(body.teamSeats);
  if (body.tokens_limit !== undefined) updatedFields.tokens_limit = Number(body.tokens_limit);
  else if (body.tokensLimit !== undefined) updatedFields.tokens_limit = Number(body.tokensLimit);
  if (body.storefronts_limit !== undefined) updatedFields.storefronts_limit = Number(body.storefronts_limit);
  else if (body.storefrontsLimit !== undefined) updatedFields.storefronts_limit = Number(body.storefrontsLimit);
  if (body.features_json !== undefined) updatedFields.features_json = body.features_json;
  else if (body.features !== undefined) updatedFields.features_json = JSON.stringify(body.features);

  // Try proxy to Go backend
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    await fetch(`${USER_BASE}/subscriptions/plans/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch {
    // Backend offline
  }

  // Update in-memory store
  const store = getPlansStore();
  const index = store.findIndex((p) => p.id === id);
  if (index >= 0) {
    store[index] = { ...store[index], ...updatedFields };
    setPlansStore(store);
    return NextResponse.json(store[index]);
  }

  const merged = { id, ...updatedFields };
  setPlansStore([...store, merged]);
  return NextResponse.json(merged);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    await fetch(`${USER_BASE}/subscriptions/plans/${encodeURIComponent(id)}`, {
      method: "DELETE",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch {
    // Backend offline
  }

  const store = getPlansStore();
  setPlansStore(store.filter((p) => p.id !== id));
  return NextResponse.json({ success: true, message: "Subscription plan deleted successfully" });
}
