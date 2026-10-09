import { NextResponse } from "next/server";
import { getCrmEmailLists, createCrmEmailList, updateCrmEmailList, deleteCrmEmailList } from "@/lib/crm-service";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    const lists = await getCrmEmailLists(tenantSlug);
    return NextResponse.json({ success: true, lists });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch email lists" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantSlug = getValidatedTenantSlug(request, body);
    const list = await createCrmEmailList(tenantSlug, body);
    return NextResponse.json({ success: true, list }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create email list" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const tenantSlug = getValidatedTenantSlug(request, body);
    const { id, name, description, tags } = body;
    if (!id) {
      return NextResponse.json({ error: "Audience list ID is required" }, { status: 400 });
    }
    const updated = await updateCrmEmailList(tenantSlug, id, { name, description, tags });
    if (!updated) {
      return NextResponse.json({ error: "Audience list not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, list: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update audience list" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return PATCH(request);
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const tenantSlug = getValidatedTenantSlug(request);
    if (!id) {
      return NextResponse.json({ error: "Audience list ID is required" }, { status: 400 });
    }
    await deleteCrmEmailList(tenantSlug, id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete audience list" }, { status: 500 });
  }
}

