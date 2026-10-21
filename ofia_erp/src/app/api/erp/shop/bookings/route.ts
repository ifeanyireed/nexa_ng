import { NextRequest, NextResponse } from "next/server";
import { getErpBookings, updateErpBookingStatus } from "@/lib/commerce-orders-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get("tenant") || searchParams.get("slug");

  try {
    const bookings = await getErpBookings(tenantSlug || undefined);
    return NextResponse.json({ success: true, count: bookings.length, bookings });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch ERP shop bookings: " + err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, status } = body;

    if (!bookingId || !status) {
      return NextResponse.json(
        { success: false, error: "bookingId and status are required" },
        { status: 400 }
      );
    }

    const updated = await updateErpBookingStatus(bookingId, status);
    return NextResponse.json({ success: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
