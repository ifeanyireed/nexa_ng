import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";

export const dynamic = "force-dynamic";

function extractTenantSlug(request: NextRequest, body?: any): string {
  const headerSlug = request.headers.get("x-tenant-slug");
  if (headerSlug && headerSlug.trim()) {
    return headerSlug.trim().toLowerCase();
  }
  if (body?.tenant && typeof body.tenant === "string" && body.tenant.trim()) {
    return body.tenant.trim().toLowerCase();
  }
  if (body?.tenantSlug && typeof body.tenantSlug === "string" && body.tenantSlug.trim()) {
    return body.tenantSlug.trim().toLowerCase();
  }
  try {
    const url = new URL(request.url);
    const querySlug =
      url.searchParams.get("tenant") ||
      url.searchParams.get("tenant_slug") ||
      url.searchParams.get("slug");
    if (querySlug && querySlug.trim()) {
      return querySlug.trim().toLowerCase();
    }
  } catch {}
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  if (host && host.includes(".")) {
    const parts = host.split(":")[0].split(".");
    const sub = parts[0].toLowerCase().trim();
    if (sub && !["www", "admin", "app", "api", "localhost", "ofia", "vercel"].includes(sub)) {
      return sub;
    }
  }
  return "";
}

export async function GET(request: NextRequest) {
  const tenantSlug = extractTenantSlug(request);

  if (!tenantSlug || tenantSlug === "default") {
    return NextResponse.json(
      {
        success: false,
        error: "Tenant slug is required. Provide a valid tenant in header or ?tenant=",
      },
      { status: 400 }
    );
  }

  try {
    const sql = await getTenantSql(tenantSlug);

    // 1. Fetch vehicles with financial and unit economic columns
    const dbVehicles = await sql`
      SELECT 
        v.id,
        v.plate_number,
        v.vehicle_type,
        v.make_model,
        v.year,
        COALESCE(v.seats, 15) as seats,
        v.operational_status,
        v.assigned_driver_name,
        COALESCE(v.service_type, 'Commercial Logistics') as service_type,
        COALESCE(v.acquisition_cost, 24000000) as acquisition_cost,
        COALESCE(v.payback_horizon_months, 36) as payback_horizon_months,
        COALESCE(v.total_months_active, 18) as total_months_active,
        COALESCE(v.monthly_revenue, 1850000) as monthly_revenue,
        COALESCE(v.monthly_distance_km, 3200) as monthly_distance_km,
        COALESCE(v.fuel_litres, 400) as fuel_litres,
        COALESCE(v.fuel_price_per_litre, 1370) as fuel_price_per_litre,
        COALESCE(v.fuel_target_km_per_litre, 8.0) as fuel_target_km_per_litre,
        COALESCE(v.total_maintenance_cost, 0) as total_maintenance_cost,
        COALESCE(v.driver_wage_cost, 150000) as driver_wage_cost,
        COALESCE(v.fixed_cost_monthly, 80000) as fixed_cost_monthly,
        COALESCE(v.health_score, 88) as health_score,
        COALESCE(v.last_service_date, '2026-09-15') as last_service_date,
        COALESCE(v.next_service_mileage, 125000) as next_service_mileage,
        COALESCE(v.current_odometer, 120000) as current_odometer
      FROM fleet_vehicles v
      WHERE LOWER(v.tenant_slug) = ${tenantSlug}
      ORDER BY v.created_at DESC;
    `;

    // Map to Frontend VehicleFinancials Interface
    const vehicles = dbVehicles.map((v: any) => {
      let mappedType: "Coaster Bus" | "Minibus" | "Executive Van" | "Sedan" | "Coach" = "Minibus";
      const vt = (v.vehicle_type || "").toUpperCase();
      if (vt.includes("COASTER") || vt.includes("BUS")) mappedType = "Coaster Bus";
      else if (vt.includes("TRUCK") || vt.includes("VOLVO") || vt.includes("ACTROS")) mappedType = "Coach";
      else if (vt.includes("OPV") || vt.includes("HILUX") || vt.includes("PICKUP")) mappedType = "Executive Van";
      else if (vt.includes("SEDAN") || vt.includes("CAR")) mappedType = "Sedan";

      let mappedStatus: "active" | "maintenance" | "idle" = "active";
      if (v.operational_status === "In Workshop") mappedStatus = "maintenance";
      else if (v.operational_status === "Grounded (Papers Expired)" || v.operational_status === "Inspection Due") mappedStatus = "idle";

      const parts = (v.make_model || v.vehicle_type || "Toyota Hiace").split(" ");
      const make = parts[0] || "Toyota";
      const model = parts.slice(1).join(" ") || "Commercial";

      return {
        id: v.id,
        plate: v.plate_number,
        make,
        model,
        year: v.year || 2020,
        type: mappedType,
        seats: Number(v.seats) || 15,
        status: mappedStatus,
        assignedDriver: v.assigned_driver_name || "Unassigned",
        driverId: `DRV-${v.id.slice(-4)}`,
        serviceType: v.service_type,
        acquisitionCost: Number(v.acquisition_cost) || 24000000,
        paybackHorizonMonths: Number(v.payback_horizon_months) || 36,
        totalMonthsActive: Number(v.total_months_active) || 18,
        monthlyRevenue: Number(v.monthly_revenue) || 1850000,
        monthlyDistanceKm: Number(v.monthly_distance_km) || 3200,
        fuelLitres: Number(v.fuel_litres) || 400,
        fuelPricePerLitre: Number(v.fuel_price_per_litre) || 1370,
        fuelTargetKmPerLitre: Number(v.fuel_target_km_per_litre) || 8.0,
        maintenanceCost: Number(v.total_maintenance_cost) || 65000,
        driverWageCost: Number(v.driver_wage_cost) || 150000,
        fixedCostMonthly: Number(v.fixed_cost_monthly) || 80000,
        healthScore: Number(v.health_score) || 88,
        lastServiceDate: v.last_service_date ? String(v.last_service_date).split("T")[0] : "2026-09-15",
        nextServiceMileage: Number(v.next_service_mileage) || 125000,
        currentMileage: Number(v.current_odometer) || 120000
      };
    });

    // 2. Fetch fuel logs
    const dbFuelLogs = await sql`
      SELECT 
        id,
        vehicle_id,
        plate_number,
        refill_date,
        litres,
        price_per_litre,
        total_cost,
        odometer_km,
        driver_name,
        station_name,
        efficiency_km_per_litre
      FROM fleet_fuel_logs
      WHERE LOWER(tenant_slug) = ${tenantSlug}
      ORDER BY refill_date DESC
      LIMIT 100;
    `;

    const fuelLogs = dbFuelLogs.map((f: any) => ({
      id: f.id,
      vehicleId: f.vehicle_id,
      plate: f.plate_number,
      date: f.refill_date ? new Date(f.refill_date).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "Recent",
      litres: Number(f.litres) || 0,
      pricePerLitre: Number(f.price_per_litre) || 1370,
      totalCost: Number(f.total_cost) || 0,
      odometerKm: Number(f.odometer_km) || 0,
      driver: f.driver_name || "Fleet Driver",
      station: f.station_name || "TotalEnergies / NNPC Station",
      efficiencyKmPerLitre: f.efficiency_km_per_litre ? Number(f.efficiency_km_per_litre) : undefined
    }));

    return NextResponse.json({
      success: true,
      vehicles,
      fuelLogs,
      totalVehicles: vehicles.length,
      totalFuelLogs: fuelLogs.length
    });
  } catch (error: any) {
    console.error(`[Mobility Vehicles GET Error]:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vehicle unit economics: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  const tenantSlug = extractTenantSlug(request, body);
  if (!tenantSlug || tenantSlug === "default") {
    return NextResponse.json(
      { success: false, error: "Tenant slug is required." },
      { status: 400 }
    );
  }

  const { action } = body;

  try {
    const sql = await getTenantSql(tenantSlug);

    // ACTION: REGISTER VEHICLE
    if (action === "register_vehicle") {
      const {
        makeModel,
        plate,
        category,
        seats,
        region,
        acquisitionCost,
        fuelEconomyTarget,
        paybackHorizon,
        monthlyRevenue
      } = body;

      if (!plate || !plate.trim()) {
        return NextResponse.json({ success: false, error: "Vehicle plate is required" }, { status: 400 });
      }

      const cleanPlate = plate.trim().toUpperCase();
      const vehId = `veh-${tenantSlug}-${cleanPlate.replace(/[^A-Z0-9]/g, "")}`;

      await sql`
        INSERT INTO fleet_vehicles (
          id, tenant_slug, tenant_id, plate_number, vehicle_type, make_model,
          region, seats, acquisition_cost, fuel_target_km_per_litre,
          payback_horizon_months, monthly_revenue, operational_status,
          current_odometer, total_months_active
        ) VALUES (
          ${vehId}, ${tenantSlug}, ${tenantSlug}, ${cleanPlate}, ${category || 'Commercial Vehicle'},
          ${makeModel || 'Commercial Van'}, ${region || 'Lagos'}, ${Number(seats) || 15},
          ${Number(acquisitionCost) || 24000000}, ${Number(fuelEconomyTarget) || 8.0},
          ${Number(paybackHorizon) || 36}, ${Number(monthlyRevenue) || 1850000}, 'Operational',
          0, 1
        )
        ON CONFLICT (tenant_slug, plate_number) DO UPDATE SET
          make_model = EXCLUDED.make_model,
          seats = EXCLUDED.seats,
          acquisition_cost = EXCLUDED.acquisition_cost,
          fuel_target_km_per_litre = EXCLUDED.fuel_target_km_per_litre,
          payback_horizon_months = EXCLUDED.payback_horizon_months,
          updated_at = CURRENT_TIMESTAMP;
      `;

      return NextResponse.json({ success: true, message: `Vehicle ${cleanPlate} registered successfully` });
    }

    // ACTION: LOG FUEL REFILL
    if (action === "log_fuel") {
      const { vehicleId, plate, litres, pricePerLitre, odometerKm, station } = body;

      if (!vehicleId && !plate) {
        return NextResponse.json({ success: false, error: "Vehicle ID or plate is required" }, { status: 400 });
      }

      // Find vehicle
      const target = await sql`
        SELECT id, plate_number, assigned_driver_name, current_odometer, fuel_litres
        FROM fleet_vehicles
        WHERE LOWER(tenant_slug) = ${tenantSlug}
          AND (id = ${vehicleId || ''} OR plate_number = ${plate || ''})
        LIMIT 1;
      `;

      if (!target || target.length === 0) {
        return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 });
      }

      const veh = target[0];
      const numLitres = Number(litres) || 0;
      const numPrice = Number(pricePerLitre) || 1370;
      const totalCost = Math.round(numLitres * numPrice);
      const numOdo = Number(odometerKm) || veh.current_odometer || 0;
      const logId = `fuel-${tenantSlug}-${Date.now()}`;

      await sql`
        INSERT INTO fleet_fuel_logs (
          id, tenant_slug, tenant_id, vehicle_id, plate_number,
          refill_date, litres, price_per_litre, total_cost, odometer_km,
          driver_name, station_name
        ) VALUES (
          ${logId}, ${tenantSlug}, ${tenantSlug}, ${veh.id}, ${veh.plate_number},
          CURRENT_TIMESTAMP, ${numLitres}, ${numPrice}, ${totalCost}, ${numOdo},
          ${veh.assigned_driver_name || 'Fleet Driver'}, ${station || 'Commercial Retail Depot'}
        );
      `;

      // Update vehicle odometer and fuel total
      await sql`
        UPDATE fleet_vehicles
        SET current_odometer = GREATEST(current_odometer, ${numOdo}),
            fuel_litres = fuel_litres + ${numLitres},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${veh.id};
      `;

      return NextResponse.json({ success: true, message: "Fuel refill logged successfully" });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error(`[Mobility Vehicles POST Error]:`, error);
    return NextResponse.json(
      { success: false, error: "Operation failed: " + error.message },
      { status: 500 }
    );
  }
}
