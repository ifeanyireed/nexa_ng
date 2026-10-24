import { NextRequest, NextResponse } from "next/server";
import { getTenantNotifications } from "@/lib/commerce-notifications";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawTenant =
    searchParams.get("tenant") ||
    searchParams.get("slug") ||
    request.headers.get("x-tenant-slug");
  const orderNumber =
    searchParams.get("orderNumber") ||
    searchParams.get("ref") ||
    searchParams.get("id") ||
    undefined;

  if (!rawTenant) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant notifications" },
      { status: 400 }
    );
  }

  const tenantSlug = rawTenant.toLowerCase().trim();

  try {
    const notifications = await getTenantNotifications(tenantSlug, orderNumber);
    return NextResponse.json({
      success: true,
      tenantSlug,
      count: notifications.length,
      notifications,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications: " + err.message },
      { status: 500 }
    );
  }
}
