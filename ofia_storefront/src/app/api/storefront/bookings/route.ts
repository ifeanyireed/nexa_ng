import { NextRequest, NextResponse } from "next/server";
import {
  getStorefrontBookings,
  saveStorefrontBooking,
  updateStorefrontBookingStatus,
} from "@/lib/commerce-orders-store";
import { StorefrontBookingPayload } from "@/types/storefront";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get("tenant") || searchParams.get("slug");

  try {
    const bookings = await getStorefrontBookings(tenantSlug || undefined);
    return NextResponse.json({ success: true, count: bookings.length, bookings });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.customerPhone || !body.serviceTitle) {
      return NextResponse.json(
        { success: false, error: "Name, phone, and service title are required" },
        { status: 400 }
      );
    }

    const bookingNumber =
      body.bookingNumber || `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const bookingId = body.id || `BK-${Date.now().toString().slice(-6)}`;

    const newBooking: StorefrontBookingPayload = {
      id: bookingId,
      bookingNumber: bookingNumber,
      tenantSlug: (body.tenantSlug || "neweratransports").toLowerCase().trim(),
      tenantId: body.tenantId || `org-${body.tenantSlug || "neweratransports"}`,
      customerName: body.customerName,
      customerEmail: body.customerEmail || "",
      customerPhone: body.customerPhone,
      serviceTitle: body.serviceTitle,
      dateTime: body.dateTime || "Tomorrow at 10:00 AM",
      status: "CONFIRMED",
      notes: body.notes || "",
      vertical: body.vertical || "cars",
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const saved = await saveStorefrontBooking(newBooking);

    // Forward to marketplace_service if available
    try {
      const marketplaceUrl = process.env.MARKETPLACE_SERVICE_URL || "http://localhost:8083";
      fetch(`${marketplaceUrl}/api/v1/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_name: newBooking.serviceTitle,
          notes: newBooking.notes,
        }),
        signal: AbortSignal.timeout(1500),
      }).catch(() => null);
    } catch {}

    return NextResponse.json({ success: true, booking: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Booking creation failed: " + err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { bookingId, status } = await request.json();
    if (!bookingId || !status) {
      return NextResponse.json(
        { success: false, error: "bookingId and status are required" },
        { status: 400 }
      );
    }

    const updated = await updateStorefrontBookingStatus(bookingId, status);
    return NextResponse.json({ success: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
