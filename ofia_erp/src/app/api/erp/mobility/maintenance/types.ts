export type DocumentType =
  | "hackney"
  | "roadWorthiness"
  | "license"
  | "insurance";

export interface DocumentRecord {
  docType: DocumentType;
  label: string;
  renewedDate: string;
  expiringDate: string;
  daysRemaining: number;
  status: "Valid" | "Expiring Soon" | "Expired";
  renewalAmount: number;
  docRefNumber?: string;
}

export type InspectionCheckStatus = "Pass" | "Fail" | "Warning";

export interface RoutineInspectionRecord {
  id: string;
  vehiclePlate: string;
  vehicleType: string;
  region: string;
  inspectionType: "Pre-Trip Daily" | "Post-Trip Return" | "Weekly Safety" | "Monthly Roadworthiness";
  inspectionDate: string;
  inspectorName: string;
  odometerReadingKm: number;
  overallStatus: "Passed" | "Defect Flagged";
  checklist: {
    tyresAndPressures: InspectionCheckStatus;
    brakesAndFluid: InspectionCheckStatus;
    engineOilAndCoolant: InspectionCheckStatus;
    lightsAndIndicators: InspectionCheckStatus;
    windscreenAndWipers: InspectionCheckStatus;
    emergencyKitAndExtinguisher: InspectionCheckStatus;
  };
  notes: string;
  escalatedToRepairId?: string;
}

export interface PartRepairRecord {
  id: string;
  workOrderNumber: string;
  vehiclePlate: string;
  vehicleType: string;
  region: string;
  partName: string;
  category: "Brakes" | "Suspension" | "Engine" | "Electrical" | "Tyres" | "Cooling" | "Transmission" | "Bodywork";
  damagedDate: string;
  repairedDate?: string;
  tatDays: number;
  costAmount: number;
  workshopVendor: string;
  status: "Awaiting Parts" | "In Workshop" | "Repaired & Cleared";
  jccSignedOff: boolean;
  remark: string;
  originInspectionId?: string;
}

export interface DriverAssignmentRecord {
  id: string;
  name: string;
  phone: string;
  assignedPlate: string;
  assignedVehicleType: string;
  region: string;
  licenseNumber: string;
  licenseExpiry: string;
  lasdriCertified: boolean;
  status: "Assigned" | "Standby" | "On Leave";
  assignedDate: string;
}

export interface FleetVehicleUnit {
  id: string;
  plateNumber: string;
  vehicleType: string;
  region: string;
  assignedDriverName: string;
  assignedDriverPhone?: string;
  assignedDriverLasdri?: boolean;
  documents: {
    hackney: DocumentRecord;
    roadWorthiness: DocumentRecord;
    license: DocumentRecord;
    insurance: DocumentRecord;
  };
  operationalStatus: "Operational" | "In Workshop" | "Grounded (Papers Expired)" | "Inspection Due";
  lastRoutineInspection?: {
    date: string;
    inspector: string;
    passed: boolean;
    type: string;
  };
  openRepairsCount: number;
  totalMaintenanceCost: number;
}
