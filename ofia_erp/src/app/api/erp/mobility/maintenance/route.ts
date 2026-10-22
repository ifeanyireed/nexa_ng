import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import { NEWERATRANSPORTS_SEED } from "./seeds/neweratransports-seed";
import {
  FleetVehicleUnit,
  RoutineInspectionRecord,
  PartRepairRecord,
  DriverAssignmentRecord,
  DocumentRecord,
  DocumentType,
} from "./seeds/types";

export const dynamic = "force-dynamic";

const NEON_CONNECTION_STRING =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  "postgresql://neondb_owner:npg_PlmqORh64gNG@ep-steep-bar-ayq6g77r-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";

function getNeonSql() {
  try {
    if (NEON_CONNECTION_STRING) {
      return neon(NEON_CONNECTION_STRING);
    }
  } catch (err) {
    console.warn("[Mobility Route] Neon SQL init warning:", err);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Local File Sync Fallback (Ensures offline / air-gapped continuity)
// ---------------------------------------------------------------------------
function getStorageDir() {
  const dir = path.resolve(process.cwd(), ".mobility_sync");
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {}
  return dir;
}

const memoryStore: Record<
  string,
  {
    vehicles: FleetVehicleUnit[];
    routineInspections: RoutineInspectionRecord[];
    partRepairs: PartRepairRecord[];
    drivers: DriverAssignmentRecord[];
  }
> = {};

function getLocalTenantData(tenantSlug: string) {
  const normSlug = (tenantSlug || "default").toLowerCase().trim();
  const storageDir = getStorageDir();
  const filePath = path.join(storageDir, `${normSlug}.json`);

  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      memoryStore[normSlug] = data;
      return data;
    } catch {}
  }

  if (memoryStore[normSlug]) {
    return memoryStore[normSlug];
  }

  if (normSlug === "neweratransports") {
    const seed = JSON.parse(JSON.stringify(NEWERATRANSPORTS_SEED));
    try {
      fs.writeFileSync(filePath, JSON.stringify(seed, null, 2), "utf-8");
    } catch {}
    memoryStore[normSlug] = seed;
    return seed;
  }

  const blankData = {
    vehicles: [],
    routineInspections: [],
    partRepairs: [],
    drivers: [],
  };

  try {
    fs.writeFileSync(filePath, JSON.stringify(blankData, null, 2), "utf-8");
  } catch {}
  memoryStore[normSlug] = blankData;
  return blankData;
}

function saveLocalTenantData(
  tenantSlug: string,
  data: {
    vehicles: FleetVehicleUnit[];
    routineInspections: RoutineInspectionRecord[];
    partRepairs: PartRepairRecord[];
    drivers: DriverAssignmentRecord[];
  }
) {
  const normSlug = (tenantSlug || "default").toLowerCase().trim();
  const storageDir = getStorageDir();
  const filePath = path.join(storageDir, `${normSlug}.json`);

  memoryStore[normSlug] = data;

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn(`[Mobility Maintenance] Local file sync warning for ${normSlug}:`, err);
  }
}

// ---------------------------------------------------------------------------
// Neon PostgreSQL Handlers
// ---------------------------------------------------------------------------
async function fetchFromNeon(tenantSlug: string) {
  const sql = getNeonSql();
  if (!sql) throw new Error("Neon client not initialized");

  const normSlug = (tenantSlug || "default").toLowerCase().trim();

  // 1. Fetch vehicles
  const dbVehicles = await sql`
    SELECT * FROM fleet_vehicles 
    WHERE tenant_slug = ${normSlug}
    ORDER BY created_at DESC
  `;

  // Seed New Era Transports into Neon on first run if empty
  if (dbVehicles.length === 0 && normSlug === "neweratransports") {
    await seedNewEraIntoNeon(sql, normSlug);
    return fetchFromNeon(normSlug);
  }

  // 2. Fetch papers
  const dbPapers = await sql`
    SELECT * FROM fleet_papers 
    WHERE tenant_slug = ${normSlug}
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
    WHERE tenant_slug = ${normSlug}
    ORDER BY inspection_date DESC, created_at DESC
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
    WHERE tenant_slug = ${normSlug}
    ORDER BY damaged_date DESC, created_at DESC
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
    WHERE tenant_slug = ${normSlug}
    ORDER BY name ASC
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

async function seedNewEraIntoNeon(sql: any, tenantSlug: string) {
  const seed = NEWERATRANSPORTS_SEED;

  for (const v of seed.vehicles) {
    await sql`
      INSERT INTO fleet_vehicles (
        id, tenant_slug, plate_number, vehicle_type, make_model, region,
        assigned_driver_name, assigned_driver_phone, assigned_driver_lasdri,
        operational_status, open_repairs_count, total_maintenance_cost,
        last_routine_inspection_json
      ) VALUES (
        ${v.id}, ${tenantSlug}, ${v.plateNumber}, ${v.vehicleType}, ${v.vehicleType}, ${v.region},
        ${v.assignedDriverName}, ${v.assignedDriverPhone || ''}, ${Boolean(v.assignedDriverLasdri)},
        ${v.operationalStatus}, ${v.openRepairsCount || 0}, ${v.totalMaintenanceCost || 0},
        ${v.lastRoutineInspection ? JSON.stringify(v.lastRoutineInspection) : null}
      )
      ON CONFLICT (tenant_slug, plate_number) DO UPDATE SET
        operational_status = EXCLUDED.operational_status,
        open_repairs_count = EXCLUDED.open_repairs_count,
        total_maintenance_cost = EXCLUDED.total_maintenance_cost,
        last_routine_inspection_json = EXCLUDED.last_routine_inspection_json
    `;

    for (const [key, doc] of Object.entries(v.documents)) {
      const docType = key as DocumentType;
      await sql`
        INSERT INTO fleet_papers (
          id, tenant_slug, vehicle_id, vehicle_plate, paper_type, paper_name,
          doc_ref_number, renewed_date, expiring_date, days_remaining,
          status, renewal_amount
        ) VALUES (
          ${`${v.id}-${docType}`}, ${tenantSlug}, ${v.id}, ${v.plateNumber},
          ${docType}, ${doc.label}, ${doc.docRefNumber || ''},
          ${doc.renewedDate ? new Date(doc.renewedDate) : new Date()},
          ${doc.expiringDate ? new Date(doc.expiringDate) : new Date()},
          ${doc.daysRemaining || 0}, ${doc.status}, ${doc.renewalAmount || 0}
        )
        ON CONFLICT (tenant_slug, vehicle_id, paper_type) DO UPDATE SET
          renewed_date = EXCLUDED.renewed_date,
          expiring_date = EXCLUDED.expiring_date,
          days_remaining = EXCLUDED.days_remaining,
          status = EXCLUDED.status,
          renewal_amount = EXCLUDED.renewal_amount
      `;
    }
  }

  for (const i of seed.routineInspections) {
    await sql`
      INSERT INTO routine_inspections (
        id, tenant_slug, vehicle_id, vehicle_plate, inspector_name,
        inspection_date, inspection_type, overall_status, checklist_json, notes
      ) VALUES (
        ${i.id}, ${tenantSlug}, ${`veh-${i.vehiclePlate}`}, ${i.vehiclePlate},
        ${i.inspectorName}, ${new Date(i.inspectionDate)}, ${i.inspectionType},
        ${i.overallStatus}, ${JSON.stringify(i.checklist)}, ${i.notes}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }

  for (const r of seed.partRepairs) {
    await sql`
      INSERT INTO maintenance_repairs (
        id, tenant_slug, vehicle_id, vehicle_plate, work_order_number,
        part_name, category, damaged_date, repaired_date, turnaround_time_days,
        cost_amount, workshop_vendor, status, jcc_signed_off, remark
      ) VALUES (
        ${r.id}, ${tenantSlug}, ${`veh-${r.vehiclePlate}`}, ${r.vehiclePlate},
        ${r.workOrderNumber}, ${r.partName}, ${r.category}, ${new Date(r.damagedDate)},
        ${r.repairedDate ? new Date(r.repairedDate) : null}, ${r.tatDays || 0},
        ${r.costAmount || 0}, ${r.workshopVendor}, ${r.status}, ${Boolean(r.jccSignedOff)},
        ${r.remark || ''}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }

  for (const d of seed.drivers) {
    await sql`
      INSERT INTO fleet_drivers (
        id, tenant_slug, name, phone, assigned_plate, assigned_vehicle_type,
        region, license_number, license_expiry, lasdri_certified, status, assigned_date
      ) VALUES (
        ${d.id}, ${tenantSlug}, ${d.name}, ${d.phone || ''}, ${d.assignedPlate || ''},
        ${d.assignedVehicleType || ''}, ${d.region || 'General'}, ${d.licenseNumber || ''},
        ${d.licenseExpiry || ''}, ${Boolean(d.lasdriCertified)}, ${d.status},
        ${d.assignedDate ? new Date(d.assignedDate) : null}
      )
      ON CONFLICT (tenant_slug, name) DO NOTHING
    `;
  }
}

// ---------------------------------------------------------------------------
// Route Handlers
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const tenantSlug = getValidatedTenantSlug(request);

  try {
    const neonData = await fetchFromNeon(tenantSlug);
    // Mirror to local cache for instant resilience
    saveLocalTenantData(tenantSlug, neonData);

    return NextResponse.json({
      success: true,
      tenantSlug,
      source: "neon-postgres",
      ...neonData,
    });
  } catch (neonErr: any) {
    console.warn("[Mobility Route] Neon fetch fallback:", neonErr.message);
    const localData = getLocalTenantData(tenantSlug);
    return NextResponse.json({
      success: true,
      tenantSlug,
      source: "local-cache",
      ...localData,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const url = new URL(request.url);
    const tenantSlug = (
      request.headers.get("x-tenant-slug") ||
      url.searchParams.get("tenant") ||
      url.searchParams.get("tenant_slug") ||
      body?.tenant ||
      body?.tenantSlug ||
      getValidatedTenantSlug(request, body)
    ).toLowerCase().trim();
    const action = body.action;
    const sql = getNeonSql();

    // 1. ADD_VEHICLE
    if (action === "ADD_VEHICLE") {
      const newVeh: FleetVehicleUnit = body.vehicle;
      if (!newVeh || !newVeh.plateNumber) {
        return NextResponse.json({ success: false, error: "Vehicle plateNumber is required" }, { status: 400 });
      }
      const vehId = newVeh.id?.startsWith(tenantSlug) ? newVeh.id : `${tenantSlug}-${newVeh.id || Date.now()}`;
      newVeh.id = vehId;

      if (sql) {
        try {
          await sql`
            INSERT INTO fleet_vehicles (
              id, tenant_slug, plate_number, vehicle_type, make_model, region,
              assigned_driver_name, assigned_driver_phone, assigned_driver_lasdri,
              operational_status, open_repairs_count, total_maintenance_cost
            ) VALUES (
              ${vehId}, ${tenantSlug}, ${newVeh.plateNumber}, ${newVeh.vehicleType},
              ${newVeh.vehicleType}, ${newVeh.region}, ${newVeh.assignedDriverName || 'Unassigned'},
              ${newVeh.assignedDriverPhone || ''}, ${Boolean(newVeh.assignedDriverLasdri)},
              ${newVeh.operationalStatus || 'Operational'}, ${newVeh.openRepairsCount || 0},
              ${newVeh.totalMaintenanceCost || 0}
            )
            ON CONFLICT (tenant_slug, plate_number) DO UPDATE SET
              region = EXCLUDED.region,
              assigned_driver_name = EXCLUDED.assigned_driver_name,
              assigned_driver_phone = EXCLUDED.assigned_driver_phone,
              assigned_driver_lasdri = EXCLUDED.assigned_driver_lasdri
          `;

          if (newVeh.documents) {
            for (const [key, doc] of Object.entries(newVeh.documents)) {
              const docType = key as DocumentType;
              await sql`
                INSERT INTO fleet_papers (
                  id, tenant_slug, vehicle_id, vehicle_plate, paper_type, paper_name,
                  doc_ref_number, renewed_date, expiring_date, days_remaining,
                  status, renewal_amount
                ) VALUES (
                  ${`${vehId}-${docType}`}, ${tenantSlug}, ${vehId}, ${newVeh.plateNumber},
                  ${docType}, ${doc.label}, ${doc.docRefNumber || ''},
                  ${doc.renewedDate ? new Date(doc.renewedDate) : new Date()},
                  ${doc.expiringDate ? new Date(doc.expiringDate) : new Date()},
                  ${doc.daysRemaining || 0}, ${doc.status}, ${doc.renewalAmount || 0}
                )
                ON CONFLICT (tenant_slug, vehicle_id, paper_type) DO UPDATE SET
                  expiring_date = EXCLUDED.expiring_date,
                  renewed_date = EXCLUDED.renewed_date,
                  days_remaining = EXCLUDED.days_remaining,
                  status = EXCLUDED.status
              `;
            }
          }
        } catch (err: any) {
          console.warn("[Mobility Route] Neon ADD_VEHICLE fallback:", err.message);
        }
      }

      // Update local storage
      const current = getLocalTenantData(tenantSlug);
      current.vehicles = [newVeh, ...current.vehicles.filter((v: FleetVehicleUnit) => v.plateNumber !== newVeh.plateNumber)];
      saveLocalTenantData(tenantSlug, current);
    }

    // 2. ASSIGN_DRIVER
    else if (action === "ASSIGN_DRIVER") {
      const { plateNumber, driverName, phone, lasdriCertified } = body;

      if (sql) {
        try {
          await sql`
            UPDATE fleet_vehicles
            SET 
              assigned_driver_name = ${driverName},
              assigned_driver_phone = ${phone || ''},
              assigned_driver_lasdri = ${Boolean(lasdriCertified)},
              updated_at = CURRENT_TIMESTAMP
            WHERE tenant_slug = ${tenantSlug} AND plate_number = ${plateNumber}
          `;

          if (driverName && driverName !== "Unassigned") {
            await sql`
              INSERT INTO fleet_drivers (
                id, tenant_slug, name, phone, assigned_plate, status, assigned_date
              ) VALUES (
                ${`drv-${Date.now()}`}, ${tenantSlug}, ${driverName}, ${phone || ''},
                ${plateNumber}, 'Assigned', CURRENT_DATE
              )
              ON CONFLICT (tenant_slug, name) DO UPDATE SET
                assigned_plate = EXCLUDED.assigned_plate,
                phone = EXCLUDED.phone,
                status = 'Assigned'
            `;
          }
        } catch (err: any) {
          console.warn("[Mobility Route] Neon ASSIGN_DRIVER fallback:", err.message);
        }
      }

      const current = getLocalTenantData(tenantSlug);
      current.vehicles = current.vehicles.map((v: FleetVehicleUnit) =>
        v.plateNumber === plateNumber
          ? {
              ...v,
              assignedDriverName: driverName,
              assignedDriverPhone: phone,
              assignedDriverLasdri: lasdriCertified,
            }
          : v
      );
      saveLocalTenantData(tenantSlug, current);
    }

    // 3. LOG_INSPECTION
    else if (action === "LOG_INSPECTION") {
      const newInsp: RoutineInspectionRecord = body.inspection;
      if (!newInsp) {
        return NextResponse.json({ success: false, error: "Inspection object required" }, { status: 400 });
      }
      const inspId = newInsp.id?.startsWith(tenantSlug) ? newInsp.id : `${tenantSlug}-${newInsp.id || Date.now()}`;
      newInsp.id = inspId;

      if (sql) {
        try {
          const vehRows = await sql`
            SELECT id FROM fleet_vehicles 
            WHERE tenant_slug = ${tenantSlug} AND plate_number = ${newInsp.vehiclePlate} 
            LIMIT 1
          `;
          const vehicleId = vehRows.length > 0 ? vehRows[0].id : `${tenantSlug}-${newInsp.vehiclePlate}`;

          await sql`
            INSERT INTO routine_inspections (
              id, tenant_slug, vehicle_id, vehicle_plate, inspector_name,
              inspection_date, inspection_type, overall_status, checklist_json, notes
            ) VALUES (
              ${inspId}, ${tenantSlug}, ${vehicleId}, ${newInsp.vehiclePlate},
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

          const newOperationalStatus = newInsp.overallStatus === "Passed" ? "Operational" : "Inspection Due";

          await sql`
            UPDATE fleet_vehicles
            SET 
              last_routine_inspection_json = ${JSON.stringify(inspectionJson)},
              operational_status = CASE 
                WHEN operational_status = 'In Workshop' THEN 'In Workshop'
                ELSE ${newOperationalStatus}
              END,
              updated_at = CURRENT_TIMESTAMP
            WHERE tenant_slug = ${tenantSlug} AND plate_number = ${newInsp.vehiclePlate}
          `;
        } catch (err: any) {
          console.warn("[Mobility Route] Neon LOG_INSPECTION error:", err.message);
        }
      }

      const current = getLocalTenantData(tenantSlug);
      current.routineInspections = [newInsp, ...current.routineInspections];
      current.vehicles = current.vehicles.map((v: FleetVehicleUnit) =>
        v.plateNumber === newInsp.vehiclePlate
          ? {
              ...v,
              lastRoutineInspection: {
                date: newInsp.inspectionDate,
                inspector: newInsp.inspectorName,
                passed: newInsp.overallStatus === "Passed",
                type: newInsp.inspectionType,
              },
              operationalStatus: newInsp.overallStatus === "Passed" ? "Operational" : v.operationalStatus === "In Workshop" ? "In Workshop" : "Inspection Due",
            }
          : v
      );
      saveLocalTenantData(tenantSlug, current);
    }

    // 4. RENEW_PAPER
    else if (action === "RENEW_PAPER") {
      const { vehiclePlate, docType, renewedDate, expiringDate, renewalAmount, docRefNumber } = body;
      const today = new Date().toISOString().split("T")[0];
      const expiry = new Date(expiringDate + "T00:00:00Z");
      const diffTime = expiry.getTime() - new Date(today + "T00:00:00Z").getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const status: "Valid" | "Expiring Soon" | "Expired" = daysRemaining <= 0 ? "Expired" : daysRemaining <= 30 ? "Expiring Soon" : "Valid";

      if (sql) {
        try {
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
            WHERE tenant_slug = ${tenantSlug} AND vehicle_plate = ${vehiclePlate} AND paper_type = ${docType}
          `;
        } catch (err: any) {
          console.warn("[Mobility Route] Neon RENEW_PAPER fallback:", err.message);
        }
      }

      const current = getLocalTenantData(tenantSlug);
      current.vehicles = current.vehicles.map((v: FleetVehicleUnit) => {
        if (v.plateNumber !== vehiclePlate) return v;
        const currentDoc = v.documents[docType as keyof typeof v.documents];
        return {
          ...v,
          documents: {
            ...v.documents,
            [docType]: {
              ...currentDoc,
              renewedDate,
              expiringDate,
              daysRemaining,
              status,
              renewalAmount,
              docRefNumber: docRefNumber || currentDoc?.docRefNumber,
            },
          },
        };
      });
      saveLocalTenantData(tenantSlug, current);
    }

    // 5. LOG_REPAIR
    else if (action === "LOG_REPAIR") {
      const newRepair: PartRepairRecord = body.repair;
      if (!newRepair) {
        return NextResponse.json({ success: false, error: "Repair object required" }, { status: 400 });
      }
      const repairId = newRepair.id?.startsWith(tenantSlug) ? newRepair.id : `${tenantSlug}-${newRepair.id || Date.now()}`;
      newRepair.id = repairId;

      if (sql) {
        try {
          const vehRows = await sql`
            SELECT id FROM fleet_vehicles 
            WHERE tenant_slug = ${tenantSlug} AND plate_number = ${newRepair.vehiclePlate} 
            LIMIT 1
          `;
          const vehicleId = vehRows.length > 0 ? vehRows[0].id : `${tenantSlug}-${newRepair.vehiclePlate}`;

          await sql`
            INSERT INTO maintenance_repairs (
              id, tenant_slug, vehicle_id, vehicle_plate, work_order_number,
              part_name, category, damaged_date, turnaround_time_days,
              cost_amount, workshop_vendor, status, jcc_signed_off, remark
            ) VALUES (
              ${repairId}, ${tenantSlug}, ${vehicleId}, ${newRepair.vehiclePlate},
              ${newRepair.workOrderNumber}, ${newRepair.partName}, ${newRepair.category},
              ${new Date(newRepair.damagedDate)}, ${newRepair.tatDays || 0},
              ${newRepair.costAmount || 0}, ${newRepair.workshopVendor}, 'In Workshop',
              false, ${newRepair.remark || ''}
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
            WHERE tenant_slug = ${tenantSlug} AND plate_number = ${newRepair.vehiclePlate}
          `;
        } catch (err: any) {
          console.warn("[Mobility Route] Neon LOG_REPAIR fallback:", err.message);
        }
      }

      const current = getLocalTenantData(tenantSlug);
      current.partRepairs = [newRepair, ...current.partRepairs];
      current.vehicles = current.vehicles.map((v: FleetVehicleUnit) =>
        v.plateNumber === newRepair.vehiclePlate
          ? {
              ...v,
              operationalStatus: "In Workshop",
              openRepairsCount: v.openRepairsCount + 1,
              totalMaintenanceCost: v.totalMaintenanceCost + (newRepair.costAmount || 0),
            }
          : v
      );
      saveLocalTenantData(tenantSlug, current);
    }

    // 6. SIGN_JCC
    else if (action === "SIGN_JCC") {
      const { repairId } = body;
      const today = new Date().toISOString().split("T")[0];

      if (sql) {
        try {
          const updatedRepairs = await sql`
            UPDATE maintenance_repairs
            SET
              status = 'Repaired & Cleared',
              jcc_signed_off = true,
              repaired_date = CURRENT_DATE,
              updated_at = CURRENT_TIMESTAMP
            WHERE tenant_slug = ${tenantSlug} AND id = ${repairId}
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
              WHERE tenant_slug = ${tenantSlug} AND plate_number = ${plate}
            `;
          }
        } catch (err: any) {
          console.warn("[Mobility Route] Neon SIGN_JCC fallback:", err.message);
        }
      }

      const current = getLocalTenantData(tenantSlug);
      const targetRepair = current.partRepairs.find((r: PartRepairRecord) => r.id === repairId);
      current.partRepairs = current.partRepairs.map((r: PartRepairRecord) =>
        r.id === repairId
          ? {
              ...r,
              status: "Repaired & Cleared",
              jccSignedOff: true,
              repairedDate: today,
            }
          : r
      );
      if (targetRepair) {
        current.vehicles = current.vehicles.map((v: FleetVehicleUnit) =>
          v.plateNumber === targetRepair.vehiclePlate
            ? {
                ...v,
                operationalStatus: "Operational",
                openRepairsCount: Math.max(0, v.openRepairsCount - 1),
              }
            : v
        );
      }
      saveLocalTenantData(tenantSlug, current);
    }

    // Fetch refreshed live data from Neon (or local cache) to return
    try {
      const refreshed = await fetchFromNeon(tenantSlug);
      return NextResponse.json({
        success: true,
        tenantSlug,
        source: "neon-postgres",
        ...refreshed,
      });
    } catch {
      const localCurrent = getLocalTenantData(tenantSlug);
      return NextResponse.json({
        success: true,
        tenantSlug,
        source: "local-cache",
        ...localCurrent,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to process mobility operation: " + err.message },
      { status: 500 }
    );
  }
}
