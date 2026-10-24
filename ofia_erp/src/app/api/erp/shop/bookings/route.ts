import { NextRequest, NextResponse } from "next/server";
import { getErpBookings, saveErpBooking, updateErpBookingStatus } from "@/lib/commerce-orders-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawTenant = searchParams.get("tenant") || searchParams.get("slug") || request.headers.get("x-tenant-slug");

  if (!rawTenant) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  const tenantSlug = rawTenant.toLowerCase().trim();

  try {
    const bookings = await getErpBookings(tenantSlug);
    return NextResponse.json({ success: true, tenantSlug, count: bookings.length, bookings });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch ERP shop bookings: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawTenant = body.tenantSlug || request.headers.get("x-tenant-slug");

    if (!rawTenant) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    if (!body.customerName || !body.customerPhone || !body.serviceTitle) {
      return NextResponse.json(
        { success: false, error: "customerName, customerPhone, and serviceTitle are required" },
        { status: 400 }
      );
    }

    const tenantSlug = rawTenant.toLowerCase().trim();
    const saved = await saveErpBooking({ ...body, tenantSlug });
    return NextResponse.json({ success: true, booking: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to create booking: " + err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, status, technicianId, technicianName } = body;
    const rawTenant = body.tenantSlug || request.headers.get("x-tenant-slug");

    if (!rawTenant) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    if (!bookingId || !status) {
      return NextResponse.json(
        { success: false, error: "bookingId and status are required" },
        { status: 400 }
      );
    }

    const tenantSlug = rawTenant.toLowerCase().trim();
    const updated = await updateErpBookingStatus(
      bookingId,
      status,
      tenantSlug,
      technicianId,
      technicianName
    );
    return NextResponse.json({ success: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
