import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { saveStorefrontOrder } from "@/lib/commerce-orders-store";

export const dynamic = "force-dynamic";

const LOGISTICS_SERVICE_URL = process.env.LOGISTICS_SERVICE_URL || "http://localhost:8085";

async function ensureDispatchTables(sql: any) {
  if (!sql) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS dispatch_shipments (
        id VARCHAR(64) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        tracking_number VARCHAR(64) NOT NULL,
        order_number VARCHAR(64) NOT NULL,
        job_type VARCHAR(32) NOT NULL DEFAULT 'CUSTOMER_PICKUP',
        status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
        priority VARCHAR(16) NOT NULL DEFAULT 'STANDARD',
        sender_name VARCHAR(191) NOT NULL,
        sender_phone VARCHAR(64) NOT NULL,
        pickup_address TEXT NOT NULL,
        pickup_city VARCHAR(100) DEFAULT '',
        pickup_notes TEXT DEFAULT '',
        pickup_lat NUMERIC(10, 7) DEFAULT 0,
        pickup_lng NUMERIC(10, 7) DEFAULT 0,
        recipient_name VARCHAR(191) NOT NULL,
        recipient_phone VARCHAR(64) NOT NULL,
        recipient_address TEXT NOT NULL,
        recipient_city VARCHAR(100) DEFAULT '',
        recipient_notes TEXT DEFAULT '',
        dropoff_lat NUMERIC(10, 7) DEFAULT 0,
        dropoff_lng NUMERIC(10, 7) DEFAULT 0,
        parcel_category VARCHAR(64) NOT NULL DEFAULT 'Documents',
        parcel_description TEXT DEFAULT '',
        weight_tier VARCHAR(32) DEFAULT 'light',
        weight_kg NUMERIC(6, 2) DEFAULT 1.0,
        vehicle_type VARCHAR(32) DEFAULT 'MOTORBIKE',
        speed_tier VARCHAR(32) DEFAULT 'instant',
        shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
        currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
        payment_method VARCHAR(32) NOT NULL DEFAULT 'card',
        payment_status VARCHAR(32) NOT NULL DEFAULT 'PAID',
        delivery_otp VARCHAR(16) NOT NULL,
        courier_driver_id VARCHAR(64) DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_dispatch_shipments_tenant_created 
        ON dispatch_shipments(LOWER(tenant_slug), created_at DESC);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_dispatch_shipments_tenant_status 
        ON dispatch_shipments(LOWER(tenant_slug), status);
    `;

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_dispatch_shipments_tenant_tracking 
        ON dispatch_shipments(LOWER(tenant_slug), tracking_number);
    `;
  } catch (err: any) {
    // Non-fatal if index or table already exists
    console.warn("[Dispatch API] ensureDispatchTables notice:", err.message);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref") || searchParams.get("orderNumber");
  const rawTenant = searchParams.get("tenant") || request.headers.get("x-tenant-slug");

  if (!ref) {
    return NextResponse.json(
      { success: false, error: "Order reference or tracking number is required" },
      { status: 400 }
    );
  }

  // Fail-Fast Rule (AGENT.md §4.2)
  if (!rawTenant || !rawTenant.trim()) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant dispatch tracking" },
      { status: 400 }
    );
  }

  const tenantSlug = rawTenant.toLowerCase().trim();
  const cleanRef = ref.trim().toLowerCase();
  const sql = await getTenantSql(tenantSlug);

  try {
    if (sql) {
      await ensureDispatchTables(sql);

      // 1. Check dedicated dispatch_shipments first
      const shipments = await sql`
        SELECT *
        FROM dispatch_shipments
        WHERE (LOWER(tracking_number) = ${cleanRef} OR LOWER(id) = ${cleanRef} OR LOWER(order_number) = ${cleanRef})
          AND LOWER(tenant_slug) = ${tenantSlug}
        LIMIT 1;
      `;

      if (shipments && shipments.length > 0) {
        const s = shipments[0];

        const origin = {
          name: s.sender_name || "Origin Hub",
          address: s.pickup_address,
          city: s.pickup_city || "Lagos",
          lat: Number(s.pickup_lat) || 6.4281,
          lng: Number(s.pickup_lng) || 3.4219,
        };

        const destination = {
          name: s.recipient_name,
          address: s.recipient_address,
          city: s.recipient_city || "Lagos",
          lat: Number(s.dropoff_lat) || 6.4549,
          lng: Number(s.dropoff_lng) || 3.4346,
        };

        let progressRatio = 0.1;
        let riderStatus = "Awaiting Courier Assignment";
        let speedKmh = 0;
        let distanceKm = 8.5;
        let etaMinutes = 45;

        switch (s.status) {
          case "ASSIGNED":
            progressRatio = 0.3;
            riderStatus = "Courier Assigned & Heading to Pickup";
            speedKmh = 30;
            distanceKm = 6.0;
            etaMinutes = 35;
            break;
          case "PICKED_UP":
            progressRatio = 0.55;
            riderStatus = "Package Picked Up — In Transit";
            speedKmh = 42;
            distanceKm = 4.2;
            etaMinutes = 20;
            break;
          case "IN_TRANSIT":
            progressRatio = 0.8;
            riderStatus = "Arriving at Destination Area";
            speedKmh = 35;
            distanceKm = 1.5;
            etaMinutes = 8;
            break;
          case "DELIVERED":
            progressRatio = 1.0;
            riderStatus = "Delivered & Verified via OTP";
            speedKmh = 0;
            distanceKm = 0;
            etaMinutes = 0;
            break;
          case "EXCEPTION":
            progressRatio = 0.4;
            riderStatus = "Delivery Exception Encountered";
            break;
        }

        const riderLat = origin.lat + (destination.lat - origin.lat) * progressRatio;
        const riderLng = origin.lng + (destination.lng - origin.lng) * progressRatio;

        return NextResponse.json({
          success: true,
          tenantSlug,
          type: "DISPATCH_SHIPMENT",
          orderNumber: s.order_number,
          trackingNumber: s.tracking_number,
          orderStatus: s.status,
          deliveryOtp: s.delivery_otp,
          parcel: {
            category: s.parcel_category,
            description: s.parcel_description,
            weightTier: s.weight_tier,
            vehicleType: s.vehicle_type,
            shippingFee: Number(s.shipping_fee) || 0,
            currency: s.currency || "NGN",
          },
          logistics: {
            courier: {
              id: s.courier_driver_id || "DRV-ASSIGNING",
              name: s.courier_driver_id ? "Ibrahim Musa" : "Assigning Nearby Rider...",
              phone: s.courier_driver_id ? "+234 812 345 6789" : "",
              vehicleType: s.vehicle_type === "van" ? "Toyota Hiace Delivery Van" : "Yamaha NMAX 155",
              plateNumber: s.courier_driver_id ? "KJA-482-XA" : "Fleet Pending",
              rating: 4.9,
              totalDeliveries: 380,
            },
            telemetry: {
              riderStatus,
              speedKmh,
              distanceKmRemaining: distanceKm,
              etaMinutesRemaining: etaMinutes,
              progressRatio,
              currentLocation: {
                lat: Number(riderLat.toFixed(5)),
                lng: Number(riderLng.toFixed(5)),
              },
              origin,
              destination,
              waypoints: [
                {
                  title: "Order Booked & Confirmed",
                  location: origin.name,
                  status: "COMPLETED",
                  time: s.created_at ? new Date(s.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently",
                },
                {
                  title: "Courier Assigned",
                  location: `${tenantSlug.toUpperCase()} Dispatch Hub`,
                  status: progressRatio >= 0.3 ? "COMPLETED" : "PENDING",
                  time: progressRatio >= 0.3 ? "In Progress" : "Pending",
                },
                {
                  title: "Parcel Picked Up",
                  location: origin.address,
                  status: progressRatio >= 0.55 ? "COMPLETED" : "PENDING",
                  time: progressRatio >= 0.55 ? "In Progress" : "Pending",
                },
                {
                  title: "In Transit to Recipient",
                  location: destination.address,
                  status: progressRatio >= 0.8 ? "COMPLETED" : "PENDING",
                  time: progressRatio >= 0.8 ? "In Progress" : "Pending",
                },
                {
                  title: "Verified Delivery",
                  location: destination.address,
                  status: progressRatio === 1.0 ? "COMPLETED" : "PENDING",
                  time: progressRatio === 1.0 ? "Verified" : "Awaiting OTP",
                },
              ],
            },
          },
        });
      }

      // 2. Fall back to standard shop_orders for retail merchant deliveries
      const rows = await sql`
        SELECT id, order_number, tenant_slug, customer_name, customer_phone,
               status, delivery_method, shipping_address, city, created_at
        FROM shop_orders
        WHERE (LOWER(order_number) = ${cleanRef} OR LOWER(id) = ${cleanRef})
          AND LOWER(tenant_slug) = ${tenantSlug}
        LIMIT 1
      `;
      if (rows && rows.length > 0) {
        const order = rows[0];
        const origin = {
          name: `${tenantSlug.toUpperCase()} Atelier Hub`,
          address: "Commercial Logistics Corridor, Lagos",
          lat: 6.4281,
          lng: 3.4219,
        };

        const destination = {
          name: order.customer_name,
          address: order.shipping_address || "Ikoyi, Lagos",
          city: order.city || "Lagos",
          lat: 6.4549,
          lng: 3.4346,
        };

        let progressRatio = 0.2;
        let riderStatus = "Awaiting Handover";
        if (order.status === "READY_DISPATCH") {
          progressRatio = 0.65;
          riderStatus = "In Transit";
        } else if (order.status === "DELIVERED") {
          progressRatio = 1.0;
          riderStatus = "Delivered";
        }

        const riderLat = origin.lat + (destination.lat - origin.lat) * progressRatio;
        const riderLng = origin.lng + (destination.lng - origin.lng) * progressRatio;

        return NextResponse.json({
          success: true,
          tenantSlug,
          type: "SHOP_ORDER",
          orderNumber: order.order_number,
          orderStatus: order.status,
          logistics: {
            courier: {
              id: "DRV-104",
              name: "Chidi Okeke",
              phone: "+234 803 991 2040",
              vehicleType: "Yamaha Force 155",
              plateNumber: "KJA-482-XA",
              rating: 4.95,
              totalDeliveries: 482,
            },
            telemetry: {
              riderStatus,
              speedKmh: 35,
              distanceKmRemaining: 2.5,
              etaMinutesRemaining: 15,
              progressRatio,
              currentLocation: {
                lat: Number(riderLat.toFixed(5)),
                lng: Number(riderLng.toFixed(5)),
              },
              origin,
              destination,
              waypoints: [
                { title: "Order Confirmed", location: origin.name, status: "COMPLETED", time: "Ready" },
                { title: "In Transit", location: destination.address, status: progressRatio >= 0.6 ? "COMPLETED" : "PENDING", time: "Pending" },
              ],
            },
          },
        });
      }
    }

    return NextResponse.json(
      { success: false, error: `No active shipment or order found matching reference '${ref}' for tenant '${tenantSlug}'` },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to generate dispatch telemetry: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const rawTenant =
    request.headers.get("x-tenant-slug") ||
    url.searchParams.get("tenant") ||
    request.cookies.get("ofia_tenant_slug")?.value;

  // Fail-Fast Rule (AGENT.md §4.2)
  if (!rawTenant || !rawTenant.trim()) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant dispatch isolation" },
      { status: 400 }
    );
  }

  const tenantSlug = rawTenant.toLowerCase().trim();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  // Validate required fields
  if (!body.senderName || !body.senderPhone || !body.pickupAddress || !body.recipientName || !body.recipientPhone || !body.dropoffAddress) {
    return NextResponse.json(
      { success: false, error: "Sender and recipient contact and address details are required" },
      { status: 400 }
    );
  }

  const sql = await getTenantSql(tenantSlug);
  if (!sql) {
    return NextResponse.json(
      { success: false, error: `Could not resolve dedicated database connection for tenant '${tenantSlug}'` },
      { status: 500 }
    );
  }

  await ensureDispatchTables(sql);

  const waybillRef = `OFIA-DP-${Math.floor(100000 + Math.random() * 900000)}`;
  const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));
  const shipmentId = `shp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const totalFare = Number(body.totalFare) || 2500;

  try {
    // 1. Insert into dedicated dispatch_shipments with strict LOWER(tenant_slug) filter
    await sql`
      INSERT INTO dispatch_shipments (
        id, tenant_slug, tenant_id, tracking_number, order_number, job_type, status, priority,
        sender_name, sender_phone, pickup_address, pickup_city, pickup_notes,
        recipient_name, recipient_phone, recipient_address, recipient_city, recipient_notes,
        parcel_category, parcel_description, weight_tier, weight_kg, vehicle_type,
        speed_tier, shipping_fee, currency, payment_method, payment_status, delivery_otp
      ) VALUES (
        ${shipmentId}, ${tenantSlug}, ${body.tenantId || `org-${tenantSlug}`}, ${waybillRef}, ${waybillRef},
        'CUSTOMER_PICKUP', 'PENDING', ${body.priority || "STANDARD"},
        ${body.senderName}, ${body.senderPhone}, ${body.pickupAddress}, ${body.pickupCity || "Lagos"}, ${body.pickupNotes || ""},
        ${body.recipientName}, ${body.recipientPhone}, ${body.dropoffAddress}, ${body.dropoffCity || "Lagos"}, ${body.dropoffNotes || ""},
        ${body.parcelCategory || "Documents"}, ${body.parcelDesc || "General Courier Parcel"}, ${body.weightTier || "light"},
        ${Number(body.weightKg) || 1.0}, ${body.vehicleType || "MOTORBIKE"}, ${body.speedTier || "instant"},
        ${totalFare}, 'NGN', ${body.paymentMethod || "card"}, 'PAID', ${deliveryOtp}
      );
    `;

    // 2. Also register in shop_orders for unified commerce audit trail
    await saveStorefrontOrder({
      id: shipmentId,
      orderNumber: waybillRef,
      tenantSlug: tenantSlug,
      tenantId: body.tenantId || `org-${tenantSlug}`,
      customerName: body.senderName,
      customerPhone: body.senderPhone,
      channel: "STOREFRONT",
      shippingAddress: body.dropoffAddress,
      city: body.dropoffCity || "Lagos",
      paymentMethod: body.paymentMethod || "card",
      items: [
        {
          id: `item-${shipmentId}`,
          name: `Point-to-Point Dispatch (${body.parcelCategory || "Documents"})`,
          quantity: 1,
          price: totalFare,
        },
      ],
      itemsSummary: `Express Dispatch: ${body.parcelCategory || "Documents"} to ${body.recipientName}`,
      itemCount: 1,
      totalAmount: `₦${totalFare.toLocaleString()}`,
      rawAmount: totalFare,
      status: "IN_PREPARATION",
      paymentStatus: "PAID",
      deliveryMethod: "DISPATCH",
      notes: `Waybill Ref: ${waybillRef} · Delivery OTP: ${deliveryOtp} · Pickup: ${body.pickupAddress}`,
    });

    // 3. Forward to backend service_logistics if reachable
    try {
      fetch(`${LOGISTICS_SERVICE_URL}/api/v1/logistics/shipments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Slug": tenantSlug,
          "X-Org-ID": tenantSlug,
        },
        body: JSON.stringify({
          sender_name: body.senderName,
          sender_phone: body.senderPhone,
          sender_address: body.pickupAddress,
          pickup_address: body.pickupAddress,
          recipient_name: body.recipientName,
          recipient_phone: body.recipientPhone,
          recipient_address: body.dropoffAddress,
          parcel_description: body.parcelDesc || body.parcelCategory,
          weight_kg: Number(body.weightKg) || 1.0,
          shipping_fee: totalFare,
          carrier: "IN_HOUSE",
          status: "PENDING",
          priority: body.priority || "STANDARD",
          delivery_otp: deliveryOtp,
          tracking_number: waybillRef,
        }),
      }).catch((e) => console.warn("[Dispatch API] Background microservice sync notice:", e.message));
    } catch {}

    return NextResponse.json({
      success: true,
      tenantSlug,
      shipmentId,
      trackingNumber: waybillRef,
      deliveryOtp,
      totalFare,
      message: "Dispatch job successfully booked and persisted to dedicated tenant database.",
    });
  } catch (err: any) {
    console.error("[Dispatch API] Failed to create shipment:", err);
    return NextResponse.json(
      { success: false, error: "Failed to persist dispatch order: " + err.message },
      { status: 500 }
    );
  }
}
