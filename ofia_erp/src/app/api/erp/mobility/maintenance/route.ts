import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import { NEWERATRANSPORTS_SEED } from "./seeds/neweratransports-seed";
import {
  FleetVehicleUnit,
  RoutineInspectionRecord,
  PartRepairRecord,
  DriverAssignmentRecord,
} from "./seeds/types";

export const dynamic = "force-dynamic";

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

function getTenantData(tenantSlug: string) {
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

  // If neweratransports, load specific migrated spreadsheet seed data
  if (normSlug === "neweratransports") {
    const seed = JSON.parse(JSON.stringify(NEWERATRANSPORTS_SEED));
    try {
      fs.writeFileSync(filePath, JSON.stringify(seed, null, 2), "utf-8");
    } catch {}
    memoryStore[normSlug] = seed;
    return seed;
  }

  // Strict Multitenancy: All other tenants start with a clean, blank fleet state
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

function saveTenantData(
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
    console.warn(`[Mobility Maintenance] File sync warning for tenant ${normSlug}:`, err);
  }
}

export async function GET(request: NextRequest) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    const data = getTenantData(tenantSlug);

    return NextResponse.json({
      success: true,
      tenantSlug,
      vehicles: data.vehicles || [],
      routineInspections: data.routineInspections || [],
      partRepairs: data.partRepairs || [],
      drivers: data.drivers || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch mobility fleet data: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantSlug = getValidatedTenantSlug(request, body);
    const current = getTenantData(tenantSlug);

    const action = body.action;

    if (action === "ADD_VEHICLE") {
      const newVeh: FleetVehicleUnit = body.vehicle;
      if (!newVeh || !newVeh.plateNumber) {
        return NextResponse.json({ success: false, error: "Vehicle plateNumber is required" }, { status: 400 });
      }
      current.vehicles = [newVeh, ...current.vehicles.filter((v: FleetVehicleUnit) => v.plateNumber !== newVeh.plateNumber)];
    } else if (action === "ASSIGN_DRIVER") {
      const { plateNumber, driverName, phone, lasdriCertified } = body;
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
      // Update or add driver to driver roster
      const existingDriver = current.drivers.find((d: DriverAssignmentRecord) => d.name.toLowerCase() === driverName.toLowerCase());
      if (existingDriver) {
        existingDriver.assignedPlate = plateNumber;
        existingDriver.status = "Assigned";
        existingDriver.phone = phone || existingDriver.phone;
        existingDriver.lasdriCertified = lasdriCertified ?? existingDriver.lasdriCertified;
      } else if (driverName && driverName !== "Unassigned") {
        current.drivers.push({
          id: `drv-${Date.now()}`,
          name: driverName,
          phone: phone || "",
          assignedPlate: plateNumber,
          assignedVehicleType: current.vehicles.find((v: FleetVehicleUnit) => v.plateNumber === plateNumber)?.vehicleType || "Fleet Vehicle",
          region: current.vehicles.find((v: FleetVehicleUnit) => v.plateNumber === plateNumber)?.region || "General",
          licenseNumber: "",
          licenseExpiry: "",
          lasdriCertified: Boolean(lasdriCertified),
          status: "Assigned",
          assignedDate: new Date().toISOString().split("T")[0],
        });
      }
    } else if (action === "LOG_INSPECTION") {
      const newInsp: RoutineInspectionRecord = body.inspection;
      if (!newInsp) {
        return NextResponse.json({ success: false, error: "Inspection object required" }, { status: 400 });
      }
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
    } else if (action === "RENEW_PAPER") {
      const { vehiclePlate, docType, renewedDate, expiringDate, renewalAmount, docRefNumber } = body;
      const today = new Date().toISOString().split("T")[0];
      const expiry = new Date(expiringDate + "T00:00:00Z");
      const diffTime = expiry.getTime() - new Date(today + "T00:00:00Z").getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const status: "Valid" | "Expiring Soon" | "Expired" = daysRemaining <= 0 ? "Expired" : daysRemaining <= 30 ? "Expiring Soon" : "Valid";

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
    } else if (action === "LOG_REPAIR") {
      const newRepair: PartRepairRecord = body.repair;
      if (!newRepair) {
        return NextResponse.json({ success: false, error: "Repair object required" }, { status: 400 });
      }
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
    } else if (action === "SIGN_JCC") {
      const { repairId } = body;
      const targetRepair = current.partRepairs.find((r: PartRepairRecord) => r.id === repairId);
      current.partRepairs = current.partRepairs.map((r: PartRepairRecord) =>
        r.id === repairId
          ? {
              ...r,
              status: "Repaired & Cleared",
              jccSignedOff: true,
              repairedDate: new Date().toISOString().split("T")[0],
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
    } else if (action === "SYNC_ALL") {
      if (Array.isArray(body.vehicles)) current.vehicles = body.vehicles;
      if (Array.isArray(body.routineInspections)) current.routineInspections = body.routineInspections;
      if (Array.isArray(body.partRepairs)) current.partRepairs = body.partRepairs;
      if (Array.isArray(body.drivers)) current.drivers = body.drivers;
    }

    saveTenantData(tenantSlug, current);

    return NextResponse.json({
      success: true,
      tenantSlug,
      vehicles: current.vehicles,
      routineInspections: current.routineInspections,
      partRepairs: current.partRepairs,
      drivers: current.drivers,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to update mobility maintenance data: " + err.message },
      { status: 500 }
    );
  }
}
