import { NextResponse } from "next/server";
import {
  DispatchJob,
  CourierDriver,
  INITIAL_DISPATCH_JOBS,
  INITIAL_COURIERS,
  INITIAL_ZONE_RATES,
  JobStatus,
} from "@/lib/dispatch-types";

// In-memory runtime cache for seamless operation across requests
let memoryJobs: DispatchJob[] = [...INITIAL_DISPATCH_JOBS];
let memoryCouriers: CourierDriver[] = [...INITIAL_COURIERS];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const typeFilter = url.searchParams.get("type");
  const statusFilter = url.searchParams.get("status");
  const search = url.searchParams.get("search")?.toLowerCase();

  let filtered = [...memoryJobs];

  if (typeFilter && typeFilter !== "ALL") {
    filtered = filtered.filter((j) => j.type === typeFilter);
  }

  if (statusFilter && statusFilter !== "ALL") {
    filtered = filtered.filter((j) => j.status === statusFilter);
  }

  if (search) {
    filtered = filtered.filter(
      (j) =>
        j.id.toLowerCase().includes(search) ||
        j.trackingNumber.toLowerCase().includes(search) ||
        j.initiatorName.toLowerCase().includes(search) ||
        j.recipientName.toLowerCase().includes(search) ||
        j.recipientAddress.toLowerCase().includes(search) ||
        j.parcelDescription.toLowerCase().includes(search)
    );
  }

  // Calculate live operations summary
  const stats = {
    activeDeliveries: memoryJobs.filter((j) => j.status === "IN_TRANSIT" || j.status === "PICKED_UP").length,
    pendingQueue: memoryJobs.filter((j) => j.status === "PENDING").length,
    availableCouriers: memoryCouriers.filter((c) => c.isAvailable).length,
    deliveredToday: memoryJobs.filter((j) => j.status === "DELIVERED").length,
    exceptionsCount: memoryJobs.filter((j) => j.status === "EXCEPTION").length,
    totalJobs: memoryJobs.length,
  };

  return NextResponse.json({
    success: true,
    jobs: filtered,
    couriers: memoryCouriers,
    zoneRates: INITIAL_ZONE_RATES,
    stats,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const now = new Date();
    const timeStr = `Today at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    const newJobId = `JOB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = `NX-${Math.floor(100000 + Math.random() * 900000)}-NG`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const newJob: DispatchJob = {
      id: newJobId,
      orderNumber: body.orderNumber || `DSP-${Math.floor(1000 + Math.random() * 9000)}`,
      trackingNumber,
      type: body.type || "VENDOR_DISPATCH",
      status: "PENDING",
      priority: body.priority || "STANDARD",
      initiatorName: body.initiatorName || "Merchant Dispatch",
      initiatorPhone: body.initiatorPhone || "+234 800 000 0000",
      pickupAddress: body.pickupAddress || "Lekki Phase 1, Lagos",
      pickupCity: body.pickupCity || "Lagos",
      pickupCoords: body.pickupCoords || { lat: 6.4698, lng: 3.5852 },
      recipientName: body.recipientName || "Valued Customer",
      recipientPhone: body.recipientPhone || "+234 800 000 0000",
      recipientAddress: body.recipientAddress || "Victoria Island, Lagos",
      recipientCity: body.recipientCity || "Lagos",
      destCoords: body.destCoords || { lat: 6.4281, lng: 3.4219 },
      parcelDescription: body.parcelDescription || "Standard Parcel Package",
      weightKg: Number(body.weightKg) || 1.5,
      shippingFee: Number(body.shippingFee) || 3000,
      currency: "NGN",
      estimatedDelivery: body.estimatedDelivery || "Today, 04:00 PM",
      deliveryOtp: otp,
      waypoints: [
        {
          id: `wp-${Date.now()}`,
          location: body.pickupAddress || "Origin Point",
          status: "PENDING",
          timestamp: timeStr,
          notes: "Dispatch ticket ingested into queue",
        },
      ],
      createdAt: timeStr,
      updatedAt: timeStr,
    };

    memoryJobs.unshift(newJob);

    return NextResponse.json({
      success: true,
      message: "Dispatch job successfully queued",
      job: newJob,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create dispatch job" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { jobId, action, courierId, status, notes, otp, reason } = body;

    const jobIndex = memoryJobs.findIndex((j) => j.id === jobId);
    if (jobIndex === -1) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    const job = { ...memoryJobs[jobIndex] };
    const now = new Date();
    const timeStr = `${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    if (action === "ASSIGN_COURIER" || action === "REASSIGN_COURIER") {
      const courier = memoryCouriers.find((c) => c.id === courierId);
      if (!courier) {
        return NextResponse.json({ success: false, error: "Courier not found" }, { status: 404 });
      }

      job.courierId = courier.id;
      job.courierName = courier.name;
      job.courierPhone = courier.phone;
      job.courierPlate = courier.plateNumber;
      job.courierVehicle = courier.vehicleType;
      job.courierRating = courier.rating;
      job.status = "ASSIGNED";
      job.updatedAt = `Today at ${timeStr}`;

      job.waypoints.push({
        id: `wp-${Date.now()}`,
        location: `${courier.currentZone} (${courier.plateNumber})`,
        status: "ASSIGNED",
        timestamp: timeStr,
        notes: `Assigned to rider ${courier.name} [${courier.plateNumber}]`,
      });

      // Update courier availability
      memoryCouriers = memoryCouriers.map((c) =>
        c.id === courierId ? { ...c, activeJobs: c.activeJobs + 1 } : c
      );
    } else if (action === "UPDATE_STATUS") {
      const validStatuses: JobStatus[] = ["PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
      }

      if (status === "DELIVERED" && job.deliveryOtp && otp && job.deliveryOtp !== otp.trim()) {
        return NextResponse.json(
          { success: false, error: `Invalid Proof-of-Delivery OTP. Expected ${job.deliveryOtp}` },
          { status: 400 }
        );
      }

      job.status = status;
      job.updatedAt = `Today at ${timeStr}`;

      job.waypoints.push({
        id: `wp-${Date.now()}`,
        location: notes || `Milestone: ${status}`,
        status: status,
        timestamp: timeStr,
        notes: notes || `Shipment transitioned to ${status}`,
      });

      if (status === "DELIVERED" && job.courierId) {
        memoryCouriers = memoryCouriers.map((c) =>
          c.id === job.courierId ? { ...c, totalTrips: c.totalTrips + 1, activeJobs: Math.max(0, c.activeJobs - 1) } : c
        );
      }
    } else if (action === "REPORT_EXCEPTION") {
      job.status = "EXCEPTION";
      job.exceptionReason = reason || "Delivery Exception Reported";
      job.exceptionNotes = notes || "Recipient unreachable or restricted access";
      job.updatedAt = `Today at ${timeStr}`;

      job.waypoints.push({
        id: `wp-${Date.now()}`,
        location: "Delivery Location Exception",
        status: "EXCEPTION",
        timestamp: timeStr,
        notes: `EXCEPTION: ${job.exceptionReason}. ${job.exceptionNotes}`,
      });
    } else if (action === "TOGGLE_COURIER_AVAILABILITY") {
      memoryCouriers = memoryCouriers.map((c) =>
        c.id === courierId ? { ...c, isAvailable: !c.isAvailable } : c
      );
      return NextResponse.json({ success: true, couriers: memoryCouriers });
    }

    memoryJobs[jobIndex] = job;

    return NextResponse.json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update dispatch job" },
      { status: 400 }
    );
  }
}
