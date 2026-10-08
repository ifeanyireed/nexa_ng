import { NextResponse } from "next/server";
import { getCrmAccounts, createCrmAccount, updateCrmAccount, deleteCrmAccount } from "@/lib/crm-service";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    const accounts = await getCrmAccounts(tenantSlug);
    return NextResponse.json({ success: true, accounts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch accounts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantSlug = getValidatedTenantSlug(request, body);
    const account = await createCrmAccount(tenantSlug, body);
    return NextResponse.json({ success: true, account }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create account" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
    }
    const tenantSlug = getValidatedTenantSlug(request, body);
    const updated = await updateCrmAccount(tenantSlug, id, updates);
    return NextResponse.json({ success: true, account: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update account" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const tenantSlug = getValidatedTenantSlug(request);
    if (!id) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
    }
    await deleteCrmAccount(tenantSlug, id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete account" }, { status: 500 });
  }
}
