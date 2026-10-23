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
  const rawTenant = searchParams.get("tenant") || searchParams.get("slug") || request.headers.get("x-tenant-slug");

  if (!rawTenant) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  const tenantSlug = rawTenant.toLowerCase().trim();

  try {
    const bookings = await getStorefrontBookings(tenantSlug);
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

    const rawTenant = body.tenantSlug || request.headers.get("x-tenant-slug");
    if (!rawTenant) {
      return NextResponse.json(
        { success: false, error: "tenantSlug is required for multi-tenant isolation" },
        { status: 400 }
      );
    }
    const tenantSlug = rawTenant.toLowerCase().trim();

    const bookingNumber =
      body.bookingNumber || `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const bookingId = body.id || `BK-${Date.now().toString().slice(-6)}`;

    const newBooking: StorefrontBookingPayload = {
      id: bookingId,
      bookingNumber: bookingNumber,
      tenantSlug: tenantSlug,
      tenantId: body.tenantId || `org-${tenantSlug}`,
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

    // Forward to ofia_erp and service_erp for Neon PostgreSQL persistence
    try {
      const erpNextUrl = process.env.ERP_NEXT_URL || "http://localhost:3002";
      const erpServiceUrl = process.env.ERP_SERVICE_URL || "http://localhost:8084";

      // 1. Forward to ERP Next.js API route
      fetch(`${erpNextUrl}/api/erp/shop/bookings?tenant=${encodeURIComponent(newBooking.tenantSlug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
        signal: AbortSignal.timeout(2000),
      }).catch(() => null);

      // 2. Forward to service_erp Go microservice if available
      fetch(`${erpServiceUrl}/shop/bookings?tenant=${encodeURIComponent(newBooking.tenantSlug)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": newBooking.tenantSlug,
        },
        body: JSON.stringify(newBooking),
        signal: AbortSignal.timeout(2000),
      }).catch(() => null);

      // 3. Forward to marketplace_service
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
    const body = await request.json();
    const { bookingId, status } = body;
    const rawTenant =
      body.tenantSlug ||
      request.nextUrl.searchParams.get("tenant") ||
      request.headers.get("x-tenant-slug");

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

    const updated = await updateStorefrontBookingStatus(
      bookingId,
      status,
      rawTenant.toLowerCase().trim()
    );
    return NextResponse.json({ success: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
