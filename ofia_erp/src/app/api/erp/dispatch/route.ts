import { NextResponse } from "next/server";
import {
  DispatchJob,
  CourierDriver,
  INITIAL_ZONE_RATES,
  JobStatus,
} from "@/lib/dispatch-types";

const LOGISTICS_SERVICE_URL = process.env.LOGISTICS_SERVICE_URL || "http://localhost:8085";

function getTenantKey(request: Request): string | null {
  const url = new URL(request.url);
  const fromHeader = request.headers.get("x-tenant-slug") || request.headers.get("x-org-id");
  if (fromHeader && fromHeader.trim() !== "") {
    return fromHeader.toLowerCase().trim();
  }
  const fromQuery = url.searchParams.get("tenant") || url.searchParams.get("tenant_slug") || url.searchParams.get("org_id");
  if (fromQuery && fromQuery.trim() !== "") {
    return fromQuery.toLowerCase().trim();
  }
  return null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tenantKey = getTenantKey(request);

  if (!tenantKey) {
    return NextResponse.json(
      { success: false, error: "Missing tenant context. Provide X-Tenant-Slug header or tenant parameter." },
      { status: 400 }
    );
  }

  const typeFilter = url.searchParams.get("type");
  const statusFilter = url.searchParams.get("status");
  const search = url.searchParams.get("search")?.toLowerCase();

  try {
    const serviceRes = await fetch(
      `${LOGISTICS_SERVICE_URL}/api/v1/logistics/shipments?type=${typeFilter || "ALL"}&status=${statusFilter || "ALL"}&search=${search || ""}`,
      {
        headers: {
          "X-Tenant-Slug": tenantKey,
          "X-Org-ID": tenantKey,
          Authorization: request.headers.get("authorization") || "",
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!serviceRes.ok) {
      const errText = await serviceRes.text();
      return NextResponse.json(
        { success: false, error: `Logistics service error (${serviceRes.status}): ${errText}` },
        { status: serviceRes.status }
      );
    }

    const data = await serviceRes.json();
    if (!data.success) {
      return NextResponse.json(
        { success: false, error: data.error || "Failed to fetch shipments" },
        { status: 400 }
      );
    }

    const rawShipments = data.shipments || [];
    const mappedJobs: DispatchJob[] = rawShipments.map((s: any) => ({
      id: s.id,
      orderNumber: s.order_id || s.id,
      trackingNumber: s.tracking_number,
      type: (s.carrier === "IN_HOUSE" ? "VENDOR_DISPATCH" : "STORE_ORDER") as any,
      status: s.status as JobStatus,
      priority: (s.priority || "STANDARD") as any,
      initiatorName: s.sender_name || "",
      initiatorPhone: s.sender_phone || "",
      pickupAddress: s.pickup_address || s.sender_address || "",
      pickupCity: s.sender_city || "",
      pickupCoords: { lat: Number(s.pickup_lat) || 0, lng: Number(s.pickup_lng) || 0 },
      recipientName: s.recipient_name,
      recipientPhone: s.recipient_phone,
      recipientAddress: s.recipient_address,
      recipientCity: s.recipient_city || "",
      destCoords: { lat: Number(s.dropoff_lat) || 0, lng: Number(s.dropoff_lng) || 0 },
      parcelDescription: s.parcel_description || "",
      weightKg: Number(s.weight_kg) || 0,
      shippingFee: Number(s.shipping_fee) || 0,
      currency: "NGN",
      estimatedDelivery: s.estimated_delivery ? new Date(s.estimated_delivery).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      deliveryOtp: s.delivery_otp || "",
      courierId: s.courier_driver_id || undefined,
      waypoints: (s.waypoints || []).map((w: any) => ({
        id: w.id,
        location: w.location,
        status: w.status,
        timestamp: w.timestamp ? new Date(w.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        notes: w.notes,
        latitude: w.latitude,
        longitude: w.longitude,
      })),
      createdAt: s.created_at ? new Date(s.created_at).toLocaleTimeString() : "",
      updatedAt: s.updated_at ? new Date(s.updated_at).toLocaleTimeString() : "",
    }));

    const rawCouriers = data.couriers || [];
    const mappedCouriers: CourierDriver[] = rawCouriers.map((c: any) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      vehicleType: c.vehicle_type || "MOTORBIKE",
      plateNumber: c.plate_number,
      isAvailable: c.is_available,
      currentLat: Number(c.current_lat) || 0,
      currentLng: Number(c.current_lng) || 0,
      currentZone: c.current_zone || "",
      rating: Number(c.rating) || 0,
      totalTrips: Number(c.total_trips) || 0,
      activeJobs: Number(c.active_jobs) || 0,
      heading: Number(c.heading) || 0,
      speed: Number(c.speed) || 0,
      batteryPct: Number(c.battery_pct) || 0,
      status: c.status || (c.is_available ? "AVAILABLE" : "OFFLINE"),
    }));

    return NextResponse.json({
      success: true,
      tenant: tenantKey,
      jobs: mappedJobs,
      couriers: mappedCouriers,
      zoneRates: INITIAL_ZONE_RATES,
      stats: data.stats || {
        activeDeliveries: mappedJobs.filter((j) => j.status === "IN_TRANSIT" || j.status === "PICKED_UP").length,
        pendingQueue: mappedJobs.filter((j) => j.status === "PENDING").length,
        availableCouriers: mappedCouriers.filter((c) => c.isAvailable).length,
        deliveredToday: mappedJobs.filter((j) => j.status === "DELIVERED").length,
        exceptionsCount: mappedJobs.filter((j) => j.status === "EXCEPTION").length,
        totalJobs: mappedJobs.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: `Logistics service unavailable: ${err?.message || err}` },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const tenantKey = getTenantKey(request);
  if (!tenantKey) {
    return NextResponse.json(
      { success: false, error: "Missing tenant context. Provide X-Tenant-Slug header or tenant parameter." },
      { status: 400 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!body.recipientName || !body.recipientAddress || !body.recipientPhone) {
    return NextResponse.json(
      { success: false, error: "recipientName, recipientPhone, and recipientAddress are required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${LOGISTICS_SERVICE_URL}/api/v1/logistics/shipments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Slug": tenantKey,
        "X-Org-ID": tenantKey,
        Authorization: request.headers.get("authorization") || "",
      },
      body: JSON.stringify({
        sender_name: body.initiatorName || "Merchant Dispatch",
        sender_phone: body.initiatorPhone || "",
        sender_address: body.pickupAddress || "",
        pickup_address: body.pickupAddress,
        pickup_lat: body.pickupCoords?.lat || 0,
        pickup_lng: body.pickupCoords?.lng || 0,
        recipient_name: body.recipientName,
        recipient_phone: body.recipientPhone,
        recipient_address: body.recipientAddress,
        dropoff_lat: body.destCoords?.lat || 0,
        dropoff_lng: body.destCoords?.lng || 0,
        parcel_description: body.parcelDescription || "",
        weight_kg: Number(body.weightKg) || 1.0,
        shipping_fee: Number(body.shippingFee) || 0,
        carrier: "IN_HOUSE",
        status: "PENDING",
        priority: body.priority || "STANDARD",
      }),
      signal: AbortSignal.timeout(5000),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data.error || "Failed to create shipment" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Shipment created in tenant dedicated database",
      job: data.shipment,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: `Failed to create dispatch job: ${err?.message || err}` },
      { status: 502 }
    );
  }
}

export async function PATCH(request: Request) {
  const tenantKey = getTenantKey(request);
  if (!tenantKey) {
    return NextResponse.json(
      { success: false, error: "Missing tenant context. Provide X-Tenant-Slug header or tenant parameter." },
      { status: 400 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  const { jobId, action, courierId, status, notes, otp, reason } = body;
  if (!jobId) {
    return NextResponse.json({ success: false, error: "jobId is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${LOGISTICS_SERVICE_URL}/api/v1/logistics/shipments/${jobId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Slug": tenantKey,
        "X-Org-ID": tenantKey,
        Authorization: request.headers.get("authorization") || "",
      },
      body: JSON.stringify({ action, courier_id: courierId, status, notes, otp, reason }),
      signal: AbortSignal.timeout(5000),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data.error || "Failed to update shipment status" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || "Shipment updated successfully",
      job: data.shipment,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: `Failed to update dispatch job: ${err?.message || err}` },
      { status: 502 }
    );
  }
}
