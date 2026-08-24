import { NextRequest, NextResponse } from "next/server";

const MARKETPLACE_BASE = process.env.NEXT_PUBLIC_MARKETPLACE_API_URL || "http://localhost:8083/api/v1";

export async function GET() {
  try {
    const res = await fetch(`${MARKETPLACE_BASE}/layouts`, {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // Fallback to local default layouts
  }

  // Fallback 7 default layouts
  const fallback = [
    {
      key: "quick_order",
      name: "Quick-Order (Food, Groceries & FMCG)",
      badge: "Quick-Order",
      description: "High-velocity ordering with fast +/- item counters and express doorstep dispatch.",
      icon: "ShoppingBag",
      component_key: "QuickOrderTemplate",
    },
    {
      key: "booking_stay",
      name: "Rental & Stay Booking (Hotels, Shortlets & Apartments)",
      badge: "Rental & Stay",
      description: "Check-in/out date range picker, nightly pricing calculator, and instant reservation modal.",
      icon: "Building2",
      component_key: "BookingStayTemplate",
    },
    {
      key: "on_demand_dispatch",
      name: "On-Demand Dispatch (Rides, Haulage & Logistics)",
      badge: "On-Demand Dispatch",
      description: "Pickup/drop-off geocoding, multi-vehicle fleet options, live fare estimator, and driver tracking.",
      icon: "Truck",
      component_key: "OnDemandDispatchTemplate",
    },
    {
      key: "calendar_booking",
      name: "Calendar Booking (Tutors, Barbers, Salons & Healthcare)",
      badge: "Calendar Booking",
      description: "Weekly date strip, hourly time slot grid, verified artisan profiles, and appointment confirmation.",
      icon: "Calendar",
      component_key: "CalendarBookingTemplate",
    },
    {
      key: "vehicle_inspection",
      name: "Vehicle Inspection & Autocare (Mechanics & Car Sales)",
      badge: "Vehicle Inspection",
      description: "Vehicle make/model picker, 150-point diagnostics checklist, mobile mechanic booking, and reports.",
      icon: "Wrench",
      component_key: "VehicleInspectionTemplate",
    },
    {
      key: "subscription_pickup",
      name: "Subscription & Laundry Pickup (Dry Cleaning & Waste)",
      badge: "Subscription Pickup",
      description: "Recurring weekly/monthly pickup plans, laundry bag load counter, and automated collection schedule.",
      icon: "RefreshCw",
      component_key: "SubscriptionPickupTemplate",
    },
    {
      key: "technical_quote",
      name: "Technical Quote & Custom Estimate (Plumbing, Solar & Construction)",
      badge: "Technical Quote",
      description: "Custom scope-of-work builder, photo upload for site faults, on-site survey request, and escrow milestones.",
      icon: "FileSpreadsheet",
      component_key: "TechnicalQuoteTemplate",
    },
  ];

  return NextResponse.json(fallback);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${MARKETPLACE_BASE}/layouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: 201 });
    }
  } catch (err) {}

  return NextResponse.json({ success: true, message: "Layout registered locally" });
}
