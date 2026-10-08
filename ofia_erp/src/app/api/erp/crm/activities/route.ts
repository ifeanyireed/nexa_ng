import { NextResponse } from "next/server";
import { getCrmActivities, createCrmActivity, updateCrmActivityStatus, deleteCrmActivity } from "@/lib/crm-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenant") || searchParams.get("slug") || "default";
    const activities = await getCrmActivities(tenantSlug);
    return NextResponse.json({ success: true, activities });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantSlug = "default", ...actData } = body;
    const activity = await createCrmActivity(tenantSlug, actData);
    return NextResponse.json({ success: true, activity }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to log activity" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, tenantSlug = "default" } = body;
    if (!id || !status) {
      return NextResponse.json({ error: "Activity ID and status are required" }, { status: 400 });
    }
    const updated = await updateCrmActivityStatus(tenantSlug, id, status);
    return NextResponse.json({ success: true, activity: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update activity" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const tenantSlug = searchParams.get("tenant") || searchParams.get("slug") || "default";
    if (!id) {
      return NextResponse.json({ error: "Activity ID is required" }, { status: 400 });
    }
    await deleteCrmActivity(tenantSlug, id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete activity" }, { status: 500 });
  }
}
