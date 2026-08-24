import { NextResponse } from "next/server";
import { getTenantsStore, setTenantsStore } from "../route";

const USER_BASE = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:8081/api/v1";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}`, {
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

  const store = getTenantsStore();
  const tenant = store.find((t) => t.id === orgId || t.slug === orgId);
  if (tenant) {
    return NextResponse.json(tenant);
  }

  return NextResponse.json({ id: orgId, error: "Tenant not found" }, { status: 404 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const store = getTenantsStore();
  const index = store.findIndex((t) => t.id === orgId || t.slug === orgId);

  const updatedFields: any = {};
  if (body.name !== undefined) updatedFields.name = body.name;
  if (body.slug !== undefined) updatedFields.slug = body.slug;
  if (body.domain !== undefined) updatedFields.domain = body.domain;
  if (body.ownerName !== undefined) updatedFields.ownerName = body.ownerName;
  else if (body.owner_name !== undefined) updatedFields.ownerName = body.owner_name;
  if (body.ownerEmail !== undefined) updatedFields.ownerEmail = body.ownerEmail;
  else if (body.owner_email !== undefined) updatedFields.ownerEmail = body.owner_email;
  if (body.planTier !== undefined) updatedFields.planTier = body.planTier;
  else if (body.plan_tier !== undefined) updatedFields.planTier = body.plan_tier;
  if (body.status !== undefined) {
    const rawStatus = String(body.status).toUpperCase();
    updatedFields.status = rawStatus === "SUSPENDED" ? "Suspended" : "Active";
  }
  if (body.mrr !== undefined) updatedFields.mrr = Number(body.mrr);
  if (body.leadsLimit !== undefined) updatedFields.leadsLimit = Number(body.leadsLimit);
  else if (body.leads_limit !== undefined) updatedFields.leadsLimit = Number(body.leads_limit);
  if (body.campaignsLimit !== undefined) updatedFields.campaignsLimit = Number(body.campaignsLimit);
  else if (body.campaigns_limit !== undefined) updatedFields.campaignsLimit = Number(body.campaigns_limit);
  if (body.erpModules !== undefined) updatedFields.erpModules = body.erpModules;

  // Try proxy to Go backend
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    await fetch(`${USER_BASE}/organizations/${encodeURIComponent(orgId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch {
    // Go backend offline
  }

  if (index >= 0) {
    store[index] = { ...store[index], ...updatedFields };
    setTenantsStore(store);
    return NextResponse.json(store[index]);
  }

  const merged = { id: orgId, ...updatedFields };
  setTenantsStore([...store, merged]);
  return NextResponse.json(merged);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const store = getTenantsStore();
  setTenantsStore(store.filter((t) => t.id !== orgId && t.slug !== orgId));
  return NextResponse.json({ success: true, message: "Tenant organization deleted" });
}
