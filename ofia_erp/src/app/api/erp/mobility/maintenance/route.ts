import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import {
  FleetVehicleUnit,
  RoutineInspectionRecord,
  PartRepairRecord,
  DriverAssignmentRecord,
  DocumentRecord,
  DocumentType,
} from "./types";

export const dynamic = "force-dynamic";

/**
 * Extracts and validates the tenant slug from headers, query params, or body.
 * Strictly adheres to AGENT.md: No hardcoded fallbacks to "default" or "demo".
 */
function extractTenantSlug(request: NextRequest, body?: any): string {
  // 1. Strict Request Header 'x-tenant-slug'
  const headerSlug = request.headers.get("x-tenant-slug");
  if (headerSlug && headerSlug.trim()) {
    return headerSlug.trim().toLowerCase();
  }

  // 2. Request body tenant / tenantSlug
  if (body?.tenant && typeof body.tenant === "string" && body.tenant.trim()) {
    return body.tenant.trim().toLowerCase();
  }
  if (body?.tenantSlug && typeof body.tenantSlug === "string" && body.tenantSlug.trim()) {
    return body.tenantSlug.trim().toLowerCase();
  }

  // 3. URL search params '?tenant=...' or '?tenant_slug=...'
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

  // 4. Subdomain extraction (e.g. neweratransports.ofia.ng)
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

let tablesEnsured = false;

/**
 * Ensures mobility tables exist in the tenant's dedicated database.
 * Defense-in-depth isolation with lowercase composite indexes.
 */
async function ensureMobilityTables(sql: any) {
  if (tablesEnsured) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS fleet_vehicles (
        id VARCHAR(191) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        plate_number VARCHAR(50) NOT NULL,
        vehicle_type VARCHAR(100) NOT NULL DEFAULT 'Hiace Bus',
        make_model VARCHAR(191) NOT NULL,
        year INT DEFAULT 2020,
        region VARCHAR(100) NOT NULL DEFAULT 'Headquarters',
        assigned_driver_name VARCHAR(191) DEFAULT 'Unassigned',
        assigned_driver_phone VARCHAR(50) DEFAULT '',
        assigned_driver_lasdri BOOLEAN DEFAULT FALSE,
        operational_status VARCHAR(50) NOT NULL DEFAULT 'Operational',
        current_odometer INT DEFAULT 0,
        fuel_target_km_per_litre NUMERIC(5,2) DEFAULT 8.0,
        total_maintenance_cost NUMERIC(12,2) DEFAULT 0,
        open_repairs_count INT DEFAULT 0,
        last_routine_inspection_json JSONB DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_fleet_vehicles_tenant_plate UNIQUE (tenant_slug, plate_number)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS fleet_papers (
        id VARCHAR(191) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        vehicle_id VARCHAR(191) NOT NULL REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
        vehicle_plate VARCHAR(50) NOT NULL,
        paper_type VARCHAR(50) NOT NULL,
        paper_name VARCHAR(100) NOT NULL,
        doc_ref_number VARCHAR(100) DEFAULT '',
        renewed_date DATE NOT NULL,
        expiring_date DATE NOT NULL,
        days_remaining INT DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'Valid',
        renewal_amount NUMERIC(12,2) DEFAULT 0,
        document_url TEXT DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_fleet_papers_vehicle_type UNIQUE (tenant_slug, vehicle_id, paper_type)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS routine_inspections (
        id VARCHAR(191) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        vehicle_id VARCHAR(191) NOT NULL REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
        vehicle_plate VARCHAR(50) NOT NULL,
        inspector_name VARCHAR(191) NOT NULL,
        inspection_date DATE NOT NULL,
        inspection_type VARCHAR(100) NOT NULL DEFAULT 'Non-Repair Pre-Trip Audit',
        odometer_reading_km INT DEFAULT 0,
        fuel_level VARCHAR(50) NOT NULL DEFAULT 'Full',
        body_condition VARCHAR(50) NOT NULL DEFAULT 'Clean',
        tires_condition VARCHAR(50) NOT NULL DEFAULT 'Good',
        fluids_level VARCHAR(50) NOT NULL DEFAULT 'Optimal',
        lights_condition VARCHAR(50) NOT NULL DEFAULT 'All Working',
        brakes_condition VARCHAR(50) NOT NULL DEFAULT 'Responsive',
        checklist_json JSONB DEFAULT NULL,
        overall_status VARCHAR(50) NOT NULL DEFAULT 'Passed',
        findings_notes TEXT DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        escalated_to_repair BOOLEAN DEFAULT FALSE,
        escalated_to_repair_id VARCHAR(191) DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS maintenance_repairs (
        id VARCHAR(191) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        vehicle_id VARCHAR(191) NOT NULL REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
        vehicle_plate VARCHAR(50) NOT NULL,
        work_order_number VARCHAR(100) DEFAULT NULL,
        part_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'Preventive Service',
        damaged_date DATE NOT NULL,
        repaired_date DATE DEFAULT NULL,
        turnaround_time_days INT DEFAULT NULL,
        cost_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
        workshop_vendor VARCHAR(191) NOT NULL,
        driver_at_fault VARCHAR(191) DEFAULT NULL,
        mechanic_notes TEXT DEFAULT NULL,
        remark TEXT DEFAULT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'In Workshop',
        jcc_signed_off BOOLEAN DEFAULT FALSE,
        origin_inspection_id VARCHAR(191) DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS fleet_drivers (
        id VARCHAR(191) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        name VARCHAR(191) NOT NULL,
        phone VARCHAR(50) DEFAULT '',
        assigned_plate VARCHAR(50) DEFAULT NULL,
        assigned_vehicle_type VARCHAR(100) DEFAULT NULL,
        region VARCHAR(100) DEFAULT 'General',
        license_number VARCHAR(100) DEFAULT '',
        license_expiry VARCHAR(50) DEFAULT '',
        lasdri_certified BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'Active',
        assigned_date DATE DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_fleet_drivers_tenant_name UNIQUE (tenant_slug, name)
      )
    `;

    await sql`ALTER TABLE fleet_vehicles ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';`;
    await sql`ALTER TABLE fleet_papers ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';`;
    await sql`ALTER TABLE routine_inspections ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';`;
    await sql`ALTER TABLE maintenance_repairs ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';`;
    await sql`ALTER TABLE fleet_drivers ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';`;

    await sql`CREATE INDEX IF NOT EXISTS idx_fleet_veh_tenant_created ON fleet_vehicles(LOWER(tenant_slug), created_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_fleet_veh_tenant_status ON fleet_vehicles(LOWER(tenant_slug), operational_status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_fleet_papers_tenant_created ON fleet_papers(LOWER(tenant_slug), created_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_inspections_tenant_created ON routine_inspections(LOWER(tenant_slug), created_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_repairs_tenant_created ON maintenance_repairs(LOWER(tenant_slug), created_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_fleet_drivers_tenant_created ON fleet_drivers(LOWER(tenant_slug), created_at DESC);`;

    tablesEnsured = true;
  } catch (err: any) {
    console.warn("[Mobility Route] ensureMobilityTables notice:", err.message);
  }
}

/**
 * Fetches tenant-scoped fleet data from the tenant's dedicated database.
 */
async function fetchTenantFleetData(sql: any, tenantSlug: string) {
  // 1. Fetch vehicles
  const dbVehicles = await sql`
    SELECT * FROM fleet_vehicles 
    WHERE LOWER(tenant_slug) = ${tenantSlug}
    ORDER BY created_at DESC;
  `;

  // 2. Fetch papers
  const dbPapers = await sql`
    SELECT * FROM fleet_papers 
    WHERE LOWER(tenant_slug) = ${tenantSlug};
  `;

  // Map papers by vehicle_id
  const papersByVehicle: Record<string, Record<string, DocumentRecord>> = {};
  for (const p of dbPapers) {
    if (!papersByVehicle[p.vehicle_id]) {
      papersByVehicle[p.vehicle_id] = {};
    }
    papersByVehicle[p.vehicle_id][p.paper_type] = {
      docType: p.paper_type as DocumentType,
      label: p.paper_name,
      renewedDate: p.renewed_date ? new Date(p.renewed_date).toISOString().split("T")[0] : "",
      expiringDate: p.expiring_date ? new Date(p.expiring_date).toISOString().split("T")[0] : "",
      daysRemaining: Number(p.days_remaining) || 0,
      status: p.status as "Valid" | "Expiring Soon" | "Expired",
      renewalAmount: Number(p.renewal_amount) || 0,
      docRefNumber: p.doc_ref_number || "",
    };
  }

  // 3. Assemble full FleetVehicleUnit array
  const vehicles: FleetVehicleUnit[] = dbVehicles.map((v: any) => {
    const vPapers = papersByVehicle[v.id] || {};
    const defaultPaper = (type: DocumentType, label: string): DocumentRecord => ({
      docType: type,
      label,
      renewedDate: "",
      expiringDate: "",
      daysRemaining: 999,
      status: "Valid",
      renewalAmount: 0,
    });

    return {
      id: v.id,
      plateNumber: v.plate_number,
      vehicleType: v.vehicle_type,
      region: v.region,
      assignedDriverName: v.assigned_driver_name || "Unassigned",
      assignedDriverPhone: v.assigned_driver_phone || "",
      assignedDriverLasdri: Boolean(v.assigned_driver_lasdri),
      documents: {
        hackney: vPapers.hackney || defaultPaper("hackney", "Hackney Permit"),
        roadWorthiness: vPapers.roadWorthiness || defaultPaper("roadWorthiness", "State Road Worthiness"),
        license: vPapers.license || defaultPaper("license", "Vehicle License"),
        insurance: vPapers.insurance || defaultPaper("insurance", "Commercial Auto Insurance"),
      },
      operationalStatus: v.operational_status || "Operational",
      lastRoutineInspection: v.last_routine_inspection_json || undefined,
      openRepairsCount: Number(v.open_repairs_count) || 0,
      totalMaintenanceCost: Number(v.total_maintenance_cost) || 0,
    };
  });

  // 4. Fetch routine inspections
  const dbInspections = await sql`
    SELECT * FROM routine_inspections 
    WHERE LOWER(tenant_slug) = ${tenantSlug}
    ORDER BY inspection_date DESC, created_at DESC;
  `;

  const routineInspections: RoutineInspectionRecord[] = dbInspections.map((i: any) => ({
    id: i.id,
    vehiclePlate: i.vehicle_plate,
    vehicleType: i.vehicle_type || "Fleet Vehicle",
    region: i.region || "General",
    inspectionType: i.inspection_type || "Non-Repair Pre-Trip Audit",
    inspectionDate: i.inspection_date ? new Date(i.inspection_date).toISOString().split("T")[0] : "",
    inspectorName: i.inspector_name,
    odometerReadingKm: Number(i.odometer_reading_km) || 0,
    overallStatus: i.overall_status === "Passed" ? "Passed" : "Defect Flagged",
    checklist: i.checklist_json || {
      tyresAndPressures: "Pass",
      brakesAndFluid: "Pass",
      engineOilAndCoolant: "Pass",
      lightsAndIndicators: "Pass",
      windscreenAndWipers: "Pass",
      emergencyKitAndExtinguisher: "Pass",
    },
    notes: i.notes || i.findings_notes || "",
    escalatedToRepairId: i.escalated_to_repair_id || undefined,
  }));

  // 5. Fetch maintenance repairs
  const dbRepairs = await sql`
    SELECT * FROM maintenance_repairs 
    WHERE LOWER(tenant_slug) = ${tenantSlug}
    ORDER BY damaged_date DESC, created_at DESC;
  `;

  const partRepairs: PartRepairRecord[] = dbRepairs.map((r: any) => ({
    id: r.id,
    workOrderNumber: r.work_order_number || `WO-${r.id.slice(-6)}`,
    vehiclePlate: r.vehicle_plate,
    vehicleType: r.vehicle_type || "Fleet Vehicle",
    region: r.region || "General",
    partName: r.part_name,
    category: r.category || "Preventive Service",
    damagedDate: r.damaged_date ? new Date(r.damaged_date).toISOString().split("T")[0] : "",
    repairedDate: r.repaired_date ? new Date(r.repaired_date).toISOString().split("T")[0] : undefined,
    tatDays: Number(r.turnaround_time_days) || 0,
    costAmount: Number(r.cost_amount) || 0,
    workshopVendor: r.workshop_vendor,
    status: r.status || "In Workshop",
    jccSignedOff: Boolean(r.jcc_signed_off),
    remark: r.remark || r.mechanic_notes || "",
    originInspectionId: r.origin_inspection_id || undefined,
  }));

  // 6. Fetch drivers
  const dbDrivers = await sql`
    SELECT * FROM fleet_drivers 
    WHERE LOWER(tenant_slug) = ${tenantSlug}
    ORDER BY name ASC;
  `;

  const drivers: DriverAssignmentRecord[] = dbDrivers.map((d: any) => ({
    id: d.id,
    name: d.name,
    phone: d.phone || "",
    assignedPlate: d.assigned_plate || "",
    assignedVehicleType: d.assigned_vehicle_type || "Fleet Vehicle",
    region: d.region || "General",
    licenseNumber: d.license_number || "",
    licenseExpiry: d.license_expiry || "",
    lasdriCertified: Boolean(d.lasdri_certified),
    status: d.status || "Assigned",
    assignedDate: d.assigned_date ? new Date(d.assigned_date).toISOString().split("T")[0] : "",
  }));

  return { vehicles, routineInspections, partRepairs, drivers };
}

// ---------------------------------------------------------------------------
// Route Handlers
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const tenantSlug = extractTenantSlug(request);

  // Strict Fail-Fast Validation (AGENT.md Section 4.2)
  if (!tenantSlug || tenantSlug === "default") {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  try {
    const sql = await getTenantSql(tenantSlug);
    await ensureMobilityTables(sql);
    const tenantData = await fetchTenantFleetData(sql, tenantSlug);

    return NextResponse.json({
      success: true,
      tenantSlug,
      source: "dedicated-tenant-db",
      ...tenantData,
    });
  } catch (err: any) {
    console.error(`[Mobility Route] Dedicated DB query failed for tenant '${tenantSlug}':`, err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch fleet data: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantSlug = extractTenantSlug(request, body);
    const tenantId = body?.tenantId || "";

    // Strict Fail-Fast Validation (AGENT.md Section 4.2)
    if (!tenantSlug || tenantSlug === "default") {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const action = body.action;
    const sql = await getTenantSql(tenantSlug);
    await ensureMobilityTables(sql);

    // 1. ADD_VEHICLE
    if (action === "ADD_VEHICLE") {
      const newVeh: FleetVehicleUnit = body.vehicle;
      if (!newVeh || !newVeh.plateNumber) {
        return NextResponse.json(
          { success: false, error: "Vehicle plateNumber is required" },
          { status: 400 }
        );
      }
      const vehId = newVeh.id?.startsWith(tenantSlug)
        ? newVeh.id
        : `${tenantSlug}-${newVeh.id || Date.now()}`;
      newVeh.id = vehId;

      await sql`
        INSERT INTO fleet_vehicles (
          id, tenant_slug, tenant_id, plate_number, vehicle_type, make_model, region,
          assigned_driver_name, assigned_driver_phone, assigned_driver_lasdri,
          operational_status, open_repairs_count, total_maintenance_cost
        ) VALUES (
          ${vehId}, ${tenantSlug}, ${tenantId}, ${newVeh.plateNumber}, ${newVeh.vehicleType},
          ${newVeh.vehicleType}, ${newVeh.region}, ${newVeh.assignedDriverName || "Unassigned"},
          ${newVeh.assignedDriverPhone || ""}, ${Boolean(newVeh.assignedDriverLasdri)},
          ${newVeh.operationalStatus || "Operational"}, ${newVeh.openRepairsCount || 0},
          ${newVeh.totalMaintenanceCost || 0}
        )
        ON CONFLICT (tenant_slug, plate_number) DO UPDATE SET
          region = EXCLUDED.region,
          assigned_driver_name = EXCLUDED.assigned_driver_name,
          assigned_driver_phone = EXCLUDED.assigned_driver_phone,
          assigned_driver_lasdri = EXCLUDED.assigned_driver_lasdri,
          updated_at = CURRENT_TIMESTAMP
      `;

      if (newVeh.documents) {
        for (const [key, doc] of Object.entries(newVeh.documents)) {
          const docType = key as DocumentType;
          await sql`
            INSERT INTO fleet_papers (
              id, tenant_slug, tenant_id, vehicle_id, vehicle_plate, paper_type, paper_name,
              doc_ref_number, renewed_date, expiring_date, days_remaining,
              status, renewal_amount
            ) VALUES (
              ${`${vehId}-${docType}`}, ${tenantSlug}, ${tenantId}, ${vehId}, ${newVeh.plateNumber},
              ${docType}, ${doc.label}, ${doc.docRefNumber || ""},
              ${doc.renewedDate ? new Date(doc.renewedDate) : new Date()},
              ${doc.expiringDate ? new Date(doc.expiringDate) : new Date()},
              ${doc.daysRemaining || 0}, ${doc.status}, ${doc.renewalAmount || 0}
            )
            ON CONFLICT (tenant_slug, vehicle_id, paper_type) DO UPDATE SET
              expiring_date = EXCLUDED.expiring_date,
              renewed_date = EXCLUDED.renewed_date,
              days_remaining = EXCLUDED.days_remaining,
              status = EXCLUDED.status,
              updated_at = CURRENT_TIMESTAMP
          `;
        }
      }
    }

    // 2. ASSIGN_DRIVER
    else if (action === "ASSIGN_DRIVER") {
      const { plateNumber, driverName, phone, lasdriCertified } = body;

      await sql`
        UPDATE fleet_vehicles
        SET 
          assigned_driver_name = ${driverName},
          assigned_driver_phone = ${phone || ""},
          assigned_driver_lasdri = ${Boolean(lasdriCertified)},
          updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(tenant_slug) = ${tenantSlug} AND plate_number = ${plateNumber}
      `;

      if (driverName && driverName !== "Unassigned") {
        await sql`
          INSERT INTO fleet_drivers (
            id, tenant_slug, tenant_id, name, phone, assigned_plate, status, assigned_date
          ) VALUES (
            ${`drv-${Date.now()}`}, ${tenantSlug}, ${tenantId}, ${driverName}, ${phone || ""},
            ${plateNumber}, 'Assigned', CURRENT_DATE
          )
          ON CONFLICT (tenant_slug, name) DO UPDATE SET
            assigned_plate = EXCLUDED.assigned_plate,
            phone = EXCLUDED.phone,
            status = 'Assigned',
            updated_at = CURRENT_TIMESTAMP
        `;
      }
    }

    // 3. LOG_INSPECTION
    else if (action === "LOG_INSPECTION") {
      const newInsp: RoutineInspectionRecord = body.inspection;
      if (!newInsp) {
        return NextResponse.json(
          { success: false, error: "Inspection object required" },
          { status: 400 }
        );
      }
      const inspId = newInsp.id?.startsWith(tenantSlug)
        ? newInsp.id
        : `${tenantSlug}-${newInsp.id || Date.now()}`;
      newInsp.id = inspId;

      const vehRows = await sql`
        SELECT id FROM fleet_vehicles 
        WHERE LOWER(tenant_slug) = ${tenantSlug} AND plate_number = ${newInsp.vehiclePlate} 
        LIMIT 1
      `;
      const vehicleId =
        vehRows.length > 0 ? vehRows[0].id : `${tenantSlug}-${newInsp.vehiclePlate}`;

      await sql`
        INSERT INTO routine_inspections (
          id, tenant_slug, tenant_id, vehicle_id, vehicle_plate, inspector_name,
          inspection_date, inspection_type, overall_status, checklist_json, notes
        ) VALUES (
          ${inspId}, ${tenantSlug}, ${tenantId}, ${vehicleId}, ${newInsp.vehiclePlate},
          ${newInsp.inspectorName}, ${new Date(newInsp.inspectionDate)}, ${newInsp.inspectionType},
          ${newInsp.overallStatus}, ${JSON.stringify(newInsp.checklist)}, ${newInsp.notes}
        )
        ON CONFLICT (id) DO NOTHING
      `;

      const inspectionJson = {
        date: newInsp.inspectionDate,
        inspector: newInsp.inspectorName,
        passed: newInsp.overallStatus === "Passed",
        type: newInsp.inspectionType,
      };

      const newOperationalStatus =
        newInsp.overallStatus === "Passed" ? "Operational" : "Inspection Due";

      await sql`
        UPDATE fleet_vehicles
        SET 
          last_routine_inspection_json = ${JSON.stringify(inspectionJson)},
          operational_status = CASE 
            WHEN operational_status = 'In Workshop' THEN 'In Workshop'
            ELSE ${newOperationalStatus}
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(tenant_slug) = ${tenantSlug} AND plate_number = ${newInsp.vehiclePlate}
      `;
    }

    // 4. RENEW_PAPER
    else if (action === "RENEW_PAPER") {
      const { vehiclePlate, docType, renewedDate, expiringDate, renewalAmount, docRefNumber } = body;
      const today = new Date().toISOString().split("T")[0];
      const expiry = new Date(expiringDate + "T00:00:00Z");
      const diffTime = expiry.getTime() - new Date(today + "T00:00:00Z").getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const status: "Valid" | "Expiring Soon" | "Expired" =
        daysRemaining <= 0 ? "Expired" : daysRemaining <= 30 ? "Expiring Soon" : "Valid";

      await sql`
        UPDATE fleet_papers
        SET
          renewed_date = ${new Date(renewedDate)},
          expiring_date = ${new Date(expiringDate)},
          days_remaining = ${daysRemaining},
          status = ${status},
          renewal_amount = ${Number(renewalAmount) || 0},
          doc_ref_number = COALESCE(${docRefNumber || null}, doc_ref_number),
          updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(tenant_slug) = ${tenantSlug} AND vehicle_plate = ${vehiclePlate} AND paper_type = ${docType}
      `;
    }

    // 5. LOG_REPAIR
    else if (action === "LOG_REPAIR") {
      const newRepair: PartRepairRecord = body.repair;
      if (!newRepair) {
        return NextResponse.json(
          { success: false, error: "Repair object required" },
          { status: 400 }
        );
      }
      const repairId = newRepair.id?.startsWith(tenantSlug)
        ? newRepair.id
        : `${tenantSlug}-${newRepair.id || Date.now()}`;
      newRepair.id = repairId;

      const vehRows = await sql`
        SELECT id FROM fleet_vehicles 
        WHERE LOWER(tenant_slug) = ${tenantSlug} AND plate_number = ${newRepair.vehiclePlate} 
        LIMIT 1
      `;
      const vehicleId =
        vehRows.length > 0 ? vehRows[0].id : `${tenantSlug}-${newRepair.vehiclePlate}`;

      await sql`
        INSERT INTO maintenance_repairs (
          id, tenant_slug, tenant_id, vehicle_id, vehicle_plate, work_order_number,
          part_name, category, damaged_date, turnaround_time_days,
          cost_amount, workshop_vendor, status, jcc_signed_off, remark
        ) VALUES (
          ${repairId}, ${tenantSlug}, ${tenantId}, ${vehicleId}, ${newRepair.vehiclePlate},
          ${newRepair.workOrderNumber}, ${newRepair.partName}, ${newRepair.category},
          ${new Date(newRepair.damagedDate)}, ${newRepair.tatDays || 0},
          ${newRepair.costAmount || 0}, ${newRepair.workshopVendor}, 'In Workshop',
          false, ${newRepair.remark || ""}
        )
        ON CONFLICT (id) DO NOTHING
      `;

      await sql`
        UPDATE fleet_vehicles
        SET
          operational_status = 'In Workshop',
          open_repairs_count = open_repairs_count + 1,
          total_maintenance_cost = total_maintenance_cost + ${newRepair.costAmount || 0},
          updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(tenant_slug) = ${tenantSlug} AND plate_number = ${newRepair.vehiclePlate}
      `;
    }

    // 6. SIGN_JCC
    else if (action === "SIGN_JCC") {
      const { repairId } = body;

      const updatedRepairs = await sql`
        UPDATE maintenance_repairs
        SET
          status = 'Repaired & Cleared',
          jcc_signed_off = true,
          repaired_date = CURRENT_DATE,
          updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(tenant_slug) = ${tenantSlug} AND id = ${repairId}
        RETURNING vehicle_plate
      `;

      if (updatedRepairs.length > 0) {
        const plate = updatedRepairs[0].vehicle_plate;
        await sql`
          UPDATE fleet_vehicles
          SET
            operational_status = 'Operational',
            open_repairs_count = GREATEST(0, open_repairs_count - 1),
            updated_at = CURRENT_TIMESTAMP
          WHERE LOWER(tenant_slug) = ${tenantSlug} AND plate_number = ${plate}
        `;
      }
    }

    // Fetch refreshed live data from the tenant's dedicated database
    const refreshed = await fetchTenantFleetData(sql, tenantSlug);
    return NextResponse.json({
      success: true,
      tenantSlug,
      source: "dedicated-tenant-db",
      ...refreshed,
    });
  } catch (err: any) {
    console.error("[Mobility Route] Operation failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to process mobility operation: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
