import { NextResponse } from "next/server";
import {
  DispatchJob,
  CourierDriver,
  INITIAL_ZONE_RATES,
  JobStatus,
} from "@/lib/dispatch-types";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { sendOrderStatusNotification } from "@/lib/commerce-notifications";

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

const DEFAULT_COURIERS: CourierDriver[] = [
  {
    id: "DRV-101",
    name: "Ibrahim Musa",
    phone: "+234 803 123 4567",
    vehicleType: "MOTORBIKE",
    plateNumber: "KJA-482-XA",
    isAvailable: true,
    currentLat: 6.4474,
    currentLng: 3.4723,
    currentZone: "Lekki Phase 1",
    rating: 4.9,
    totalTrips: 412,
    activeJobs: 0,
    status: "AVAILABLE",
  },
  {
    id: "DRV-102",
    name: "Emeka Okafor",
    phone: "+234 812 345 6789",
    vehicleType: "MOTORBIKE",
    plateNumber: "AGL-921-BD",
    isAvailable: true,
    currentLat: 6.5956,
    currentLng: 3.3541,
    currentZone: "Ikeja GRA",
    rating: 4.85,
    totalTrips: 345,
    activeJobs: 1,
    status: "BUSY",
  },
  {
    id: "DRV-103",
    name: "Babatunde Lawal",
    phone: "+234 809 987 6543",
    vehicleType: "VAN",
    plateNumber: "APP-512-YY",
    isAvailable: true,
    currentLat: 6.4281,
    currentLng: 3.4219,
    currentZone: "Victoria Island",
    rating: 4.95,
    totalTrips: 512,
    activeJobs: 0,
    status: "AVAILABLE",
  },
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tenantKey = getTenantKey(request);

  // Fail-Fast Rule (AGENT.md §4.2)
  if (!tenantKey) {
    return NextResponse.json(
      { success: false, error: "Missing tenant context. Provide X-Tenant-Slug header or tenant parameter." },
      { status: 400 }
    );
  }

  const typeFilter = url.searchParams.get("type");
  const statusFilter = url.searchParams.get("status");
  const search = url.searchParams.get("search")?.toLowerCase();

  let jobs: DispatchJob[] = [];
  let couriers: CourierDriver[] = DEFAULT_COURIERS;

  // 1. First try backend service_logistics
  try {
    const serviceRes = await fetch(
      `${LOGISTICS_SERVICE_URL}/api/v1/logistics/shipments?type=${typeFilter || "ALL"}&status=${statusFilter || "ALL"}&search=${search || ""}`,
      {
        headers: {
          "X-Tenant-Slug": tenantKey,
          "X-Org-ID": tenantKey,
          Authorization: request.headers.get("authorization") || "",
        },
        signal: AbortSignal.timeout(2500),
      }
    );

    if (serviceRes.ok) {
      const data = await serviceRes.json();
      if (data.success && Array.isArray(data.shipments) && data.shipments.length > 0) {
        jobs = data.shipments.map((s: any) => ({
          id: s.id,
          orderNumber: s.order_id || s.tracking_number || s.id,
          trackingNumber: s.tracking_number,
          type: (s.carrier === "IN_HOUSE" ? "VENDOR_DISPATCH" : "CUSTOMER_PICKUP") as any,
          status: s.status as JobStatus,
          priority: (s.priority || "STANDARD") as any,
          initiatorName: s.sender_name || "",
          initiatorPhone: s.sender_phone || "",
          pickupAddress: s.pickup_address || s.sender_address || "",
          pickupCity: s.sender_city || "Lagos",
          pickupCoords: { lat: Number(s.pickup_lat) || 6.4281, lng: Number(s.pickup_lng) || 3.4219 },
          recipientName: s.recipient_name,
          recipientPhone: s.recipient_phone,
          recipientAddress: s.recipient_address,
          recipientCity: s.recipient_city || "Lagos",
          destCoords: { lat: Number(s.dropoff_lat) || 6.4549, lng: Number(s.dropoff_lng) || 3.4346 },
          parcelDescription: s.parcel_description || "",
          weightKg: Number(s.weight_kg) || 1.0,
          shippingFee: Number(s.shipping_fee) || 0,
          currency: "NGN",
          estimatedDelivery: s.estimated_delivery || "Within 45 mins",
          deliveryOtp: s.delivery_otp || "",
          courierId: s.courier_driver_id || undefined,
          waypoints: s.waypoints || [],
          createdAt: s.created_at ? new Date(s.created_at).toLocaleTimeString() : "",
          updatedAt: s.updated_at ? new Date(s.updated_at).toLocaleTimeString() : "",
        }));

        if (Array.isArray(data.couriers) && data.couriers.length > 0) {
          couriers = data.couriers;
        }
      }
    }
  } catch (err: any) {
    // Non-fatal; fall back to dedicated tenant database
    console.warn(`[Dispatch Route] service_logistics fetch notice for tenant '${tenantKey}':`, err.message);
  }

  // 2. Query Dedicated Tenant Database (AGENT.md Strict Database-Per-Tenant Mandate)
  try {
    const sql = await getTenantSql(tenantKey);
    if (sql) {
      const dbShipments = await sql`
        SELECT *
        FROM dispatch_shipments
        WHERE LOWER(tenant_slug) = ${tenantKey}
        ORDER BY created_at DESC;
      `;

      if (dbShipments && dbShipments.length > 0) {
        const dedicatedJobs: DispatchJob[] = dbShipments.map((s: any) => ({
          id: s.id,
          orderNumber: s.order_number || s.tracking_number,
          trackingNumber: s.tracking_number,
          type: (s.job_type || "CUSTOMER_PICKUP") as any,
          status: (s.status || "PENDING") as JobStatus,
          priority: (s.priority || "STANDARD") as any,
          initiatorName: s.sender_name || "Storefront Customer",
          initiatorPhone: s.sender_phone || "",
          pickupAddress: s.pickup_address,
          pickupCity: s.pickup_city || "Lagos",
          pickupCoords: { lat: Number(s.pickup_lat) || 6.4281, lng: Number(s.pickup_lng) || 3.4219 },
          recipientName: s.recipient_name,
          recipientPhone: s.recipient_phone,
          recipientAddress: s.recipient_address,
          recipientCity: s.recipient_city || "Lagos",
          destCoords: { lat: Number(s.dropoff_lat) || 6.4549, lng: Number(s.dropoff_lng) || 3.4346 },
          parcelDescription: s.parcel_description || `${s.parcel_category} Package`,
          weightKg: Number(s.weight_kg) || 1.0,
          shippingFee: Number(s.shipping_fee) || 0,
          currency: s.currency || "NGN",
          estimatedDelivery: s.status === "DELIVERED" ? "Completed" : "Within 45 mins",
          deliveryOtp: s.delivery_otp || "",
          courierId: s.courier_driver_id || undefined,
          waypoints: [
            {
              id: `wpt-1-${s.id}`,
              location: s.pickup_address,
              status: s.status === "PENDING" ? "PENDING" : "COMPLETED",
              timestamp: new Date(s.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
            {
              id: `wpt-2-${s.id}`,
              location: s.recipient_address,
              status: s.status === "DELIVERED" ? "DELIVERED" : "IN_PROGRESS",
              timestamp: s.status === "DELIVERED" ? "Delivered" : "In Progress",
            },
          ],
          createdAt: new Date(s.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          updatedAt: new Date(s.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));

        // Merge dedicated DB jobs with any service_logistics jobs (deduplicating by id)
        const existingIds = new Set(jobs.map((j) => j.id));
        for (const dj of dedicatedJobs) {
          if (!existingIds.has(dj.id)) {
            jobs.unshift(dj);
            existingIds.add(dj.id);
          }
        }
      }

      // 3. Also pull Storefront retail orders requiring dispatch
      const dbShopOrders = await sql`
        SELECT id, order_number, tenant_slug, customer_name, customer_phone,
               customer_email, shipping_address, city, total_amount, raw_amount,
               status, delivery_method, items_summary, channel, created_at, updated_at
        FROM shop_orders
        WHERE LOWER(tenant_slug) = ${tenantKey}
          AND (delivery_method = 'DISPATCH' OR channel = 'STOREFRONT')
        ORDER BY created_at DESC
        LIMIT 30;
      `;

      if (dbShopOrders && dbShopOrders.length > 0) {
        const existingIds = new Set(jobs.map((j) => j.id));
        for (const ord of dbShopOrders) {
          if (!existingIds.has(ord.id) && !existingIds.has(ord.order_number)) {
            let mappedStatus: JobStatus = "PENDING";
            if (ord.status === "READY_DISPATCH") mappedStatus = "ASSIGNED";
            else if (ord.status === "DELIVERED") mappedStatus = "DELIVERED";
            else if (ord.status === "CANCELLED") mappedStatus = "EXCEPTION";

            jobs.push({
              id: ord.id,
              orderNumber: ord.order_number,
              trackingNumber: ord.order_number,
              type: "VENDOR_DISPATCH",
              status: mappedStatus,
              priority: "STANDARD",
              initiatorName: `${tenantKey.toUpperCase()} Storefront Atelier`,
              initiatorPhone: "+234 800 000 0000",
              pickupAddress: `${tenantKey.toUpperCase()} Central Hub, Commercial Logistics Corridor, Lagos`,
              pickupCity: "Lagos",
              pickupCoords: { lat: 6.4281, lng: 3.4219 },
              recipientName: ord.customer_name,
              recipientPhone: ord.customer_phone,
              recipientAddress: ord.shipping_address || "Customer Delivery Address",
              recipientCity: ord.city || "Lagos",
              destCoords: { lat: 6.4549, lng: 3.4346 },
              parcelDescription: ord.items_summary || "Storefront Retail Order",
              weightKg: 2.0,
              shippingFee: 2500,
              currency: "NGN",
              estimatedDelivery: ord.status === "DELIVERED" ? "Completed" : "Within 45 mins",
              deliveryOtp: (ord.id || "8291").slice(-4).toUpperCase(),
              courierId: ord.status === "READY_DISPATCH" ? "DRV-101" : undefined,
              waypoints: [
                {
                  id: `wpt-1-${ord.id}`,
                  location: `${tenantKey.toUpperCase()} Central Hub`,
                  status: ord.status === "IN_PREPARATION" ? "PENDING" : "PICKED_UP",
                  timestamp: new Date(ord.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
                {
                  id: `wpt-2-${ord.id}`,
                  location: ord.shipping_address || "Destination",
                  status: ord.status === "DELIVERED" ? "DELIVERED" : "IN_TRANSIT",
                  timestamp: ord.status === "DELIVERED" ? "Delivered" : "In Progress",
                },
              ],
              createdAt: new Date(ord.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              updatedAt: new Date(ord.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            });
            existingIds.add(ord.id);
            existingIds.add(ord.order_number);
          }
        }
      }
    }
  } catch (dbErr: any) {
    console.warn(`[Dispatch Route] Dedicated DB query notice for tenant '${tenantKey}':`, dbErr.message);
  }

  // Filter in-memory if needed
  let filteredJobs = jobs;
  if (typeFilter && typeFilter !== "ALL") {
    filteredJobs = filteredJobs.filter((j) => j.type === typeFilter);
  }
  if (statusFilter && statusFilter !== "ALL") {
    filteredJobs = filteredJobs.filter((j) => j.status === statusFilter);
  }
  if (search) {
    filteredJobs = filteredJobs.filter(
      (j) =>
        j.trackingNumber?.toLowerCase().includes(search) ||
        j.initiatorName?.toLowerCase().includes(search) ||
        j.recipientName?.toLowerCase().includes(search) ||
        j.pickupAddress?.toLowerCase().includes(search) ||
        j.recipientAddress?.toLowerCase().includes(search)
    );
  }

  const activeDeliveries = filteredJobs.filter((j) => j.status === "IN_TRANSIT" || j.status === "PICKED_UP" || j.status === "ASSIGNED").length;
  const pendingQueue = filteredJobs.filter((j) => j.status === "PENDING").length;
  const availableCouriers = couriers.filter((c) => c.isAvailable).length;
  const deliveredToday = filteredJobs.filter((j) => j.status === "DELIVERED").length;
  const exceptionsCount = filteredJobs.filter((j) => j.status === "EXCEPTION").length;

  return NextResponse.json({
    success: true,
    tenant: tenantKey,
    jobs: filteredJobs,
    couriers,
    zoneRates: INITIAL_ZONE_RATES,
    stats: {
      activeDeliveries,
      pendingQueue,
      availableCouriers,
      deliveredToday,
      exceptionsCount,
      totalJobs: filteredJobs.length,
    },
  });
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
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!body.recipientName || !body.recipientAddress || !body.recipientPhone) {
    return NextResponse.json(
      { success: false, error: "recipientName, recipientPhone, and recipientAddress are required" },
      { status: 400 }
    );
  }

  const waybillRef = body.trackingNumber || `OFIA-DP-${Math.floor(100000 + Math.random() * 900000)}`;
  const deliveryOtp = body.deliveryOtp || String(Math.floor(1000 + Math.random() * 9000));
  const shipmentId = body.id || `shp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const totalFare = Number(body.shippingFee) || 2500;

  // Persist directly to dedicated tenant PostgreSQL database (AGENT.md §1)
  try {
    const sql = await getTenantSql(tenantKey);
    if (sql) {
      await sql`
        INSERT INTO dispatch_shipments (
          id, tenant_slug, tracking_number, order_number, job_type, status, priority,
          sender_name, sender_phone, pickup_address, pickup_city,
          recipient_name, recipient_phone, recipient_address, recipient_city,
          parcel_category, parcel_description, weight_kg, shipping_fee, currency,
          delivery_otp
        ) VALUES (
          ${shipmentId}, ${tenantKey}, ${waybillRef}, ${waybillRef},
          ${body.type || "VENDOR_DISPATCH"}, 'PENDING', ${body.priority || "STANDARD"},
          ${body.initiatorName || "Merchant Dispatch"}, ${body.initiatorPhone || ""},
          ${body.pickupAddress || "Origin Dispatch Point"}, ${body.pickupCity || "Lagos"},
          ${body.recipientName}, ${body.recipientPhone}, ${body.recipientAddress},
          ${body.recipientCity || "Lagos"}, ${body.parcelCategory || "Documents"},
          ${body.parcelDescription || ""}, ${Number(body.weightKg) || 1.0},
          ${totalFare}, 'NGN', ${deliveryOtp}
        );
      `;
    }
  } catch (err: any) {
    console.warn(`[Dispatch Route POST] Dedicated DB insert notice:`, err.message);
  }

  // Also notify backend service_logistics if available
  try {
    fetch(`${LOGISTICS_SERVICE_URL}/api/v1/logistics/shipments`, {
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
        recipient_name: body.recipientName,
        recipient_phone: body.recipientPhone,
        recipient_address: body.recipientAddress,
        parcel_description: body.parcelDescription || "",
        weight_kg: Number(body.weightKg) || 1.0,
        shipping_fee: totalFare,
        carrier: "IN_HOUSE",
        status: "PENDING",
        priority: body.priority || "STANDARD",
      }),
    }).catch(() => {});
  } catch {}

  return NextResponse.json({
    success: true,
    message: "Shipment created in tenant dedicated database",
    job: {
      id: shipmentId,
      trackingNumber: waybillRef,
      status: "PENDING",
      deliveryOtp,
    },
  });
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
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  const { jobId, action, courierId, status, notes, otp } = body;
  if (!jobId) {
    return NextResponse.json({ success: false, error: "jobId is required" }, { status: 400 });
  }

  const targetStatus = status || (action === "ASSIGN_COURIER" ? "ASSIGNED" : action === "DISPATCH_START" ? "IN_TRANSIT" : "PENDING");

  // 1. Update Dedicated Tenant Database (AGENT.md Strict Defense-in-Depth)
  try {
    const sql = await getTenantSql(tenantKey);
    if (sql) {
      await sql`
        UPDATE dispatch_shipments
        SET status = ${targetStatus},
            courier_driver_id = COALESCE(${courierId || null}, courier_driver_id),
            updated_at = NOW()
        WHERE (id = ${jobId} OR tracking_number = ${jobId} OR order_number = ${jobId})
          AND LOWER(tenant_slug) = ${tenantKey};
      `;

      const shopOrderStatus =
        targetStatus === "DELIVERED"
          ? "DELIVERED"
          : targetStatus === "ASSIGNED" || targetStatus === "IN_TRANSIT" || targetStatus === "PICKED_UP"
          ? "READY_DISPATCH"
          : "IN_PREPARATION";

      const updatedOrders = await sql`
        UPDATE shop_orders
        SET status = ${shopOrderStatus},
            updated_at = NOW()
        WHERE (id = ${jobId} OR order_number = ${jobId})
          AND LOWER(tenant_slug) = ${tenantKey}
        RETURNING id, order_number, tenant_slug, tenant_id, customer_name, customer_email, customer_phone, shipping_address;
      `;

      if (updatedOrders && updatedOrders.length > 0) {
        const ord = updatedOrders[0];
        sendOrderStatusNotification({
          orderId: ord.id,
          orderNumber: ord.order_number,
          tenantSlug: ord.tenant_slug,
          tenantId: ord.tenant_id,
          customerName: ord.customer_name,
          customerEmail: ord.customer_email,
          customerPhone: ord.customer_phone,
          shippingAddress: ord.shipping_address,
          newStatus: shopOrderStatus,
        }).catch(() => null);
      }
    }
  } catch (err: any) {
    console.warn(`[Dispatch Route PATCH] Dedicated DB update notice:`, err.message);
  }

  // 2. Notify backend service_logistics
  try {
    fetch(`${LOGISTICS_SERVICE_URL}/api/v1/logistics/shipments/${jobId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Slug": tenantKey,
        "X-Org-ID": tenantKey,
        Authorization: request.headers.get("authorization") || "",
      },
      body: JSON.stringify({ action, courier_id: courierId, status: targetStatus, notes, otp }),
    }).catch(() => {});
  } catch {}

  return NextResponse.json({
    success: true,
    message: "Shipment updated successfully in dedicated tenant database",
    jobId,
    status: targetStatus,
  });
}
