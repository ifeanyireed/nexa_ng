import {
  FleetVehicleUnit,
  RoutineInspectionRecord,
  PartRepairRecord,
  DriverAssignmentRecord,
} from "./types";

export const NEWERATRANSPORTS_SEED: {
  vehicles: FleetVehicleUnit[];
  routineInspections: RoutineInspectionRecord[];
  partRepairs: PartRepairRecord[];
  drivers: DriverAssignmentRecord[];
} = {
  vehicles: [
    // --- IHS ENUGU & ASABA ---
    {
      id: "flt-asb-01",
      plateNumber: "AAA90YJ",
      vehicleType: "OPV (Hilux 4x4)",
      region: "IHS Enugu & Asaba",
      assignedDriverName: "Adebanjo Rufus",
      assignedDriverPhone: "+234 803 419 2811",
      assignedDriverLasdri: true,
      operationalStatus: "Operational",
      lastRoutineInspection: {
        date: "2026-10-21",
        inspector: "Ginika Perpetus (Fleet Sup)",
        passed: true,
        type: "Pre-Trip Daily"
      },
      documents: {
        hackney: { docType: "hackney", label: "Hackney Permit", renewedDate: "2026-03-15", expiringDate: "2027-03-14", daysRemaining: 143, status: "Valid", renewalAmount: 25000, docRefNumber: "HAK-ASB-90YJ" },
        roadWorthiness: { docType: "roadWorthiness", label: "Road Worthiness", renewedDate: "2026-05-10", expiringDate: "2026-11-09", daysRemaining: 18, status: "Expiring Soon", renewalAmount: 18000, docRefNumber: "RDW-EN-1092" },
        license: { docType: "license", label: "Vehicle License", renewedDate: "2026-01-20", expiringDate: "2027-01-19", daysRemaining: 89, status: "Valid", renewalAmount: 32000, docRefNumber: "LIC-DEL-8821" },
        insurance: { docType: "insurance", label: "Proof / Insurance", renewedDate: "2026-02-14", expiringDate: "2027-02-13", daysRemaining: 114, status: "Valid", renewalAmount: 65000, docRefNumber: "INS-AXA-90YJ" }
      },
      openRepairsCount: 0,
      totalMaintenanceCost: 285000
    },
    {
      id: "flt-asb-02",
      plateNumber: "AAA982YJ",
      vehicleType: "OPV (Hilux 4x4)",
      region: "IHS Enugu & Asaba",
      assignedDriverName: "Emeka Nwankwo",
      assignedDriverPhone: "+234 812 550 4910",
      assignedDriverLasdri: true,
      operationalStatus: "In Workshop",
      lastRoutineInspection: {
        date: "2026-10-18",
        inspector: "Ginika Perpetus (Fleet Sup)",
        passed: false,
        type: "Weekly Safety"
      },
      documents: {
        hackney: { docType: "hackney", label: "Hackney Permit", renewedDate: "2025-10-10", expiringDate: "2026-10-09", daysRemaining: -13, status: "Expired", renewalAmount: 25000, docRefNumber: "HAK-EN-2025" },
        roadWorthiness: { docType: "roadWorthiness", label: "Road Worthiness", renewedDate: "2026-06-01", expiringDate: "2026-11-30", daysRemaining: 39, status: "Valid", renewalAmount: 18000, docRefNumber: "RDW-EN-8842" },
        license: { docType: "license", label: "Vehicle License", renewedDate: "2026-04-12", expiringDate: "2027-04-11", daysRemaining: 171, status: "Valid", renewalAmount: 32000, docRefNumber: "LIC-EN-982" },
        insurance: { docType: "insurance", label: "Proof / Insurance", renewedDate: "2026-04-12", expiringDate: "2027-04-11", daysRemaining: 171, status: "Valid", renewalAmount: 65000, docRefNumber: "INS-CUST-982YJ" }
      },
      openRepairsCount: 1,
      totalMaintenanceCost: 410000
    },
    {
      id: "flt-asb-03",
      plateNumber: "AAA983YF",
      vehicleType: "OPV (Hilux 4x4)",
      region: "IHS Enugu & Asaba",
      assignedDriverName: "Vitalis Okeke",
      assignedDriverPhone: "+234 802 881 2940",
      assignedDriverLasdri: true,
      operationalStatus: "Operational",
      lastRoutineInspection: {
        date: "2026-10-22",
        inspector: "Ginika Perpetus (Fleet Sup)",
        passed: true,
        type: "Pre-Trip Daily"
      },
      documents: {
        hackney: { docType: "hackney", label: "Hackney Permit", renewedDate: "2026-02-10", expiringDate: "2027-02-09", daysRemaining: 110, status: "Valid", renewalAmount: 25000, docRefNumber: "HAK-EN-983" },
        roadWorthiness: { docType: "roadWorthiness", label: "Road Worthiness", renewedDate: "2026-04-01", expiringDate: "2026-10-31", daysRemaining: 9, status: "Expiring Soon", renewalAmount: 18000, docRefNumber: "RDW-EN-3391" },
        license: { docType: "license", label: "Vehicle License", renewedDate: "2026-02-10", expiringDate: "2027-02-09", daysRemaining: 110, status: "Valid", renewalAmount: 32000, docRefNumber: "LIC-EN-983" },
        insurance: { docType: "insurance", label: "Proof / Insurance", renewedDate: "2026-02-10", expiringDate: "2027-02-09", daysRemaining: 110, status: "Valid", renewalAmount: 65000, docRefNumber: "INS-LEAD-983YF" }
      },
      openRepairsCount: 0,
      totalMaintenanceCost: 195000
    },
    {
      id: "flt-asb-04",
      plateNumber: "AAA91YJ",
      vehicleType: "OPV (Hilux 4x4)",
      region: "IHS Enugu & Asaba",
      assignedDriverName: "Ogbarode Anthony",
      assignedDriverPhone: "+234 806 731 0029",
      assignedDriverLasdri: true,
      operationalStatus: "Operational",
      lastRoutineInspection: {
        date: "2026-10-20",
        inspector: "Ginika Perpetus (Fleet Sup)",
        passed: true,
        type: "Pre-Trip Daily"
      },
      documents: {
        hackney: { docType: "hackney", label: "Hackney Permit", renewedDate: "2026-07-01", expiringDate: "2027-06-30", daysRemaining: 251, status: "Valid", renewalAmount: 25000, docRefNumber: "HAK-ASB-91" },
        roadWorthiness: { docType: "roadWorthiness", label: "Road Worthiness", renewedDate: "2026-07-01", expiringDate: "2026-12-31", daysRemaining: 70, status: "Valid", renewalAmount: 18000, docRefNumber: "RDW-ASB-91" },
        license: { docType: "license", label: "Vehicle License", renewedDate: "2026-07-01", expiringDate: "2027-06-30", daysRemaining: 251, status: "Valid", renewalAmount: 32000, docRefNumber: "LIC-ASB-91" },
        insurance: { docType: "insurance", label: "Proof / Insurance", renewedDate: "2026-07-01", expiringDate: "2027-06-30", daysRemaining: 251, status: "Valid", renewalAmount: 65000, docRefNumber: "INS-ALL-91YJ" }
      },
      openRepairsCount: 0,
      totalMaintenanceCost: 140000
    },
    // --- KANO ---
    {
      id: "flt-kano-01",
      plateNumber: "FST131YF",
      vehicleType: "Volvo FM 420 Truck",
      region: "Kano",
      assignedDriverName: "Usman Ibrahim",
      assignedDriverPhone: "+234 803 772 1092",
      assignedDriverLasdri: false,
      operationalStatus: "In Workshop",
      lastRoutineInspection: {
        date: "2026-10-15",
        inspector: "Malam Sanusi (Kano Dep Sup)",
        passed: false,
        type: "Weekly Safety"
      },
      documents: {
        hackney: { docType: "hackney", label: "Hackney Permit", renewedDate: "2025-11-20", expiringDate: "2026-11-19", daysRemaining: 28, status: "Expiring Soon", renewalAmount: 35000, docRefNumber: "HAK-KAN-131" },
        roadWorthiness: { docType: "roadWorthiness", label: "Road Worthiness", renewedDate: "2026-05-15", expiringDate: "2026-11-14", daysRemaining: 23, status: "Expiring Soon", renewalAmount: 22000, docRefNumber: "RDW-KAN-131" },
        license: { docType: "license", label: "Vehicle License", renewedDate: "2026-02-01", expiringDate: "2027-01-31", daysRemaining: 101, status: "Valid", renewalAmount: 45000, docRefNumber: "LIC-KAN-131" },
        insurance: { docType: "insurance", label: "Proof / Insurance", renewedDate: "2026-02-01", expiringDate: "2027-01-31", daysRemaining: 101, status: "Valid", renewalAmount: 110000, docRefNumber: "INS-COM-FST131" }
      },
      openRepairsCount: 1,
      totalMaintenanceCost: 780000
    },
    {
      id: "flt-kano-02",
      plateNumber: "APP342YG",
      vehicleType: "Volvo FM 420 Truck",
      region: "Kano",
      assignedDriverName: "Auwalu Shehu",
      assignedDriverPhone: "+234 806 182 9901",
      assignedDriverLasdri: false,
      operationalStatus: "Operational",
      lastRoutineInspection: {
        date: "2026-10-21",
        inspector: "Malam Sanusi (Kano Dep Sup)",
        passed: true,
        type: "Pre-Trip Daily"
      },
      documents: {
        hackney: { docType: "hackney", label: "Hackney Permit", renewedDate: "2026-04-10", expiringDate: "2027-04-09", daysRemaining: 169, status: "Valid", renewalAmount: 35000, docRefNumber: "HAK-KAN-342" },
        roadWorthiness: { docType: "roadWorthiness", label: "Road Worthiness", renewedDate: "2026-04-10", expiringDate: "2026-10-09", daysRemaining: -13, status: "Expired", renewalAmount: 22000, docRefNumber: "RDW-KAN-342" },
        license: { docType: "license", label: "Vehicle License", renewedDate: "2026-04-10", expiringDate: "2027-04-09", daysRemaining: 169, status: "Valid", renewalAmount: 45000, docRefNumber: "LIC-KAN-342" },
        insurance: { docType: "insurance", label: "Proof / Insurance", renewedDate: "2026-04-10", expiringDate: "2027-04-09", daysRemaining: 169, status: "Valid", renewalAmount: 110000, docRefNumber: "INS-CORP-342" }
      },
      openRepairsCount: 0,
      totalMaintenanceCost: 460000
    },
    {
      id: "flt-kano-03",
      plateNumber: "SMK317YH",
      vehicleType: "DAF CF 85 Truck",
      region: "Kano",
      assignedDriverName: "Sabo Muhammad",
      assignedDriverPhone: "+234 808 392 0012",
      assignedDriverLasdri: false,
      operationalStatus: "Operational",
      lastRoutineInspection: {
        date: "2026-10-20",
        inspector: "Malam Sanusi (Kano Dep Sup)",
        passed: true,
        type: "Pre-Trip Daily"
      },
      documents: {
        hackney: { docType: "hackney", label: "Hackney Permit", renewedDate: "2026-08-01", expiringDate: "2027-07-31", daysRemaining: 282, status: "Valid", renewalAmount: 35000, docRefNumber: "HAK-KAN-317" },
        roadWorthiness: { docType: "roadWorthiness", label: "Road Worthiness", renewedDate: "2026-08-01", expiringDate: "2027-01-31", daysRemaining: 101, status: "Valid", renewalAmount: 22000, docRefNumber: "RDW-KAN-317" },
        license: { docType: "license", label: "Vehicle License", renewedDate: "2026-08-01", expiringDate: "2027-07-31", daysRemaining: 282, status: "Valid", renewalAmount: 45000, docRefNumber: "LIC-KAN-317" },
        insurance: { docType: "insurance", label: "Proof / Insurance", renewedDate: "2026-08-01", expiringDate: "2027-07-31", daysRemaining: 282, status: "Valid", renewalAmount: 110000, docRefNumber: "INS-CORP-317" }
      },
      openRepairsCount: 0,
      totalMaintenanceCost: 320000
    },
    // --- IHS LAGOS ---
    {
      id: "flt-los-01",
      plateNumber: "AAA07YG",
      vehicleType: "OPV (Hilux 4x4)",
      region: "IHS Lagos",
      assignedDriverName: "Babatunde Balogun",
      assignedDriverPhone: "+234 802 334 1928",
      assignedDriverLasdri: true,
      operationalStatus: "Operational",
      lastRoutineInspection: {
        date: "2026-10-22",
        inspector: "Segun Obafemi (Lagos Insp)",
        passed: true,
        type: "Pre-Trip Daily"
      },
      documents: {
        hackney: { docType: "hackney", label: "Hackney Permit", renewedDate: "2026-01-15", expiringDate: "2027-01-14", daysRemaining: 84, status: "Valid", renewalAmount: 30000, docRefNumber: "HAK-LOS-07YG" },
        roadWorthiness: { docType: "roadWorthiness", label: "Road Worthiness", renewedDate: "2026-05-20", expiringDate: "2026-11-19", daysRemaining: 28, status: "Expiring Soon", renewalAmount: 20000, docRefNumber: "RDW-LOS-07YG" },
        license: { docType: "license", label: "Vehicle License", renewedDate: "2026-01-15", expiringDate: "2027-01-14", daysRemaining: 84, status: "Valid", renewalAmount: 38000, docRefNumber: "LIC-LOS-07YG" },
        insurance: { docType: "insurance", label: "Proof / Insurance", renewedDate: "2026-01-15", expiringDate: "2027-01-14", daysRemaining: 84, status: "Valid", renewalAmount: 70000, docRefNumber: "INS-CORP-07YG" }
      },
      openRepairsCount: 0,
      totalMaintenanceCost: 210000
    },
    {
      id: "flt-los-02",
      plateNumber: "EKY604XH",
      vehicleType: "Toyota Hilux D-Cab",
      region: "IHS Lagos",
      assignedDriverName: "Unassigned",
      assignedDriverPhone: undefined,
      assignedDriverLasdri: false,
      operationalStatus: "Grounded (Papers Expired)",
      lastRoutineInspection: {
        date: "2026-10-10",
        inspector: "Segun Obafemi (Lagos Insp)",
        passed: false,
        type: "Monthly Roadworthiness"
      },
      documents: {
        hackney: { docType: "hackney", label: "Hackney Permit", renewedDate: "2025-09-30", expiringDate: "2026-09-29", daysRemaining: -23, status: "Expired", renewalAmount: 30000, docRefNumber: "HAK-IHS-408" },
        roadWorthiness: { docType: "roadWorthiness", label: "Road Worthiness", renewedDate: "2026-04-05", expiringDate: "2026-10-04", daysRemaining: -18, status: "Expired", renewalAmount: 20000, docRefNumber: "RDW-IHS-408" },
        license: { docType: "license", label: "Vehicle License", renewedDate: "2026-03-20", expiringDate: "2027-03-19", daysRemaining: 148, status: "Valid", renewalAmount: 38000, docRefNumber: "LIC-IHS-408" },
        insurance: { docType: "insurance", label: "Proof / Insurance", renewedDate: "2026-03-20", expiringDate: "2027-03-19", daysRemaining: 148, status: "Valid", renewalAmount: 70000, docRefNumber: "INS-IHS-604XH" }
      },
      openRepairsCount: 0,
      totalMaintenanceCost: 165000
    },
    // --- GAIOS ---
    {
      id: "flt-gaios-01",
      plateNumber: "KSF885JZ",
      vehicleType: "Toyota Highlander 4WD",
      region: "GAIOS",
      assignedDriverName: "Ifeanyi Okoli",
      assignedDriverPhone: "+234 803 918 2049",
      assignedDriverLasdri: true,
      operationalStatus: "Operational",
      lastRoutineInspection: {
        date: "2026-10-21",
        inspector: "Tola Williams (GAIOS Sup)",
        passed: true,
        type: "Pre-Trip Daily"
      },
      documents: {
        hackney: { docType: "hackney", label: "Hackney Permit", renewedDate: "2026-06-15", expiringDate: "2027-06-14", daysRemaining: 235, status: "Valid", renewalAmount: 30000, docRefNumber: "HAK-GAI-885" },
        roadWorthiness: { docType: "roadWorthiness", label: "Road Worthiness", renewedDate: "2026-06-15", expiringDate: "2026-12-14", daysRemaining: 53, status: "Valid", renewalAmount: 20000, docRefNumber: "RDW-GAI-885" },
        license: { docType: "license", label: "Vehicle License", renewedDate: "2026-06-15", expiringDate: "2027-06-14", daysRemaining: 235, status: "Valid", renewalAmount: 38000, docRefNumber: "LIC-GAI-885" },
        insurance: { docType: "insurance", label: "Proof / Insurance", renewedDate: "2026-06-15", expiringDate: "2027-06-14", daysRemaining: 235, status: "Valid", renewalAmount: 85000, docRefNumber: "INS-GAI-885" }
      },
      openRepairsCount: 0,
      totalMaintenanceCost: 190000
    },
    // --- COASTER BUSES ---
    {
      id: "flt-coa-01",
      plateNumber: "AGL82JS",
      vehicleType: "Toyota Coaster (30-Seater)",
      region: "Coaster Buses",
      assignedDriverName: "Ganiyu Lawal",
      assignedDriverPhone: "+234 803 118 4930",
      assignedDriverLasdri: true,
      operationalStatus: "Operational",
      lastRoutineInspection: {
        date: "2026-10-22",
        inspector: "Kelechi Obi (Fleet Tech)",
        passed: true,
        type: "Pre-Trip Daily"
      },
      documents: {
        hackney: { docType: "hackney", label: "Hackney Permit", renewedDate: "2026-02-18", expiringDate: "2027-02-17", daysRemaining: 118, status: "Valid", renewalAmount: 35000, docRefNumber: "HAK-COA-82JS" },
        roadWorthiness: { docType: "roadWorthiness", label: "Road Worthiness", renewedDate: "2026-05-10", expiringDate: "2026-11-09", daysRemaining: 18, status: "Expiring Soon", renewalAmount: 25000, docRefNumber: "RDW-COA-82JS" },
        license: { docType: "license", label: "Vehicle License", renewedDate: "2026-02-18", expiringDate: "2027-02-17", daysRemaining: 118, status: "Valid", renewalAmount: 48000, docRefNumber: "LIC-COA-82JS" },
        insurance: { docType: "insurance", label: "Proof / Insurance", renewedDate: "2026-02-18", expiringDate: "2027-02-17", daysRemaining: 118, status: "Valid", renewalAmount: 95000, docRefNumber: "INS-COA-82JS" }
      },
      openRepairsCount: 0,
      totalMaintenanceCost: 380000
    },
    {
      id: "flt-coa-02",
      plateNumber: "KRD408JV",
      vehicleType: "Toyota Coaster (30-Seater)",
      region: "Coaster Buses",
      assignedDriverName: "Segun Alabi",
      assignedDriverPhone: "+234 809 384 1902",
      assignedDriverLasdri: true,
      operationalStatus: "In Workshop",
      lastRoutineInspection: {
        date: "2026-10-19",
        inspector: "Kelechi Obi (Fleet Tech)",
        passed: false,
        type: "Weekly Safety"
      },
      documents: {
        hackney: { docType: "hackney", label: "Hackney Permit", renewedDate: "2026-03-22", expiringDate: "2027-03-21", daysRemaining: 150, status: "Valid", renewalAmount: 35000, docRefNumber: "HAK-COA-408" },
        roadWorthiness: { docType: "roadWorthiness", label: "Road Worthiness", renewedDate: "2026-03-22", expiringDate: "2026-09-21", daysRemaining: -31, status: "Expired", renewalAmount: 25000, docRefNumber: "RDW-COA-408" },
        license: { docType: "license", label: "Vehicle License", renewedDate: "2026-03-22", expiringDate: "2027-03-21", daysRemaining: 150, status: "Valid", renewalAmount: 48000, docRefNumber: "LIC-COA-408" },
        insurance: { docType: "insurance", label: "Proof / Insurance", renewedDate: "2026-03-22", expiringDate: "2027-03-21", daysRemaining: 150, status: "Valid", renewalAmount: 95000, docRefNumber: "INS-COA-408" }
      },
      openRepairsCount: 1,
      totalMaintenanceCost: 490000
    }
  ],
  routineInspections: [
    {
      id: "INSP-2026-101",
      vehiclePlate: "AAA90YJ",
      vehicleType: "OPV (Hilux 4x4)",
      region: "IHS Enugu & Asaba",
      inspectionType: "Pre-Trip Daily",
      inspectionDate: "2026-10-21",
      inspectorName: "Ginika Perpetus (Fleet Sup)",
      odometerReadingKm: 142100,
      overallStatus: "Passed",
      checklist: {
        tyresAndPressures: "Pass",
        brakesAndFluid: "Pass",
        engineOilAndCoolant: "Pass",
        lightsAndIndicators: "Pass",
        windscreenAndWipers: "Pass",
        emergencyKitAndExtinguisher: "Pass"
      },
      notes: "Routine pre-trip check completed satisfactorily. All pressures at 34 PSI."
    },
    {
      id: "INSP-2026-102",
      vehiclePlate: "AAA982YJ",
      vehicleType: "OPV (Hilux 4x4)",
      region: "IHS Enugu & Asaba",
      inspectionType: "Weekly Safety",
      inspectionDate: "2026-10-18",
      inspectorName: "Ginika Perpetus (Fleet Sup)",
      odometerReadingKm: 168400,
      overallStatus: "Defect Flagged",
      checklist: {
        tyresAndPressures: "Pass",
        brakesAndFluid: "Fail",
        engineOilAndCoolant: "Pass",
        lightsAndIndicators: "Pass",
        windscreenAndWipers: "Pass",
        emergencyKitAndExtinguisher: "Pass"
      },
      notes: "Severe brake squeal and soft pedal travel detected. Escalate immediately to Asaba workshop.",
      escalatedToRepairId: "WO-2026-081"
    },
    {
      id: "INSP-2026-103",
      vehiclePlate: "FST131YF",
      vehicleType: "Volvo FM 420 Truck",
      region: "Kano",
      inspectionType: "Weekly Safety",
      inspectionDate: "2026-10-15",
      inspectorName: "Malam Sanusi (Kano Dep Sup)",
      odometerReadingKm: 312000,
      overallStatus: "Defect Flagged",
      checklist: {
        tyresAndPressures: "Warning",
        brakesAndFluid: "Pass",
        engineOilAndCoolant: "Fail",
        lightsAndIndicators: "Pass",
        windscreenAndWipers: "Pass",
        emergencyKitAndExtinguisher: "Pass"
      },
      notes: "Hairline bulge detected on top radiator coolant hose. Leak risk on long-haul route.",
      escalatedToRepairId: "WO-2026-082"
    },
    {
      id: "INSP-2026-104",
      vehiclePlate: "KRD408JV",
      vehicleType: "Toyota Coaster (30-Seater)",
      region: "Coaster Buses",
      inspectionType: "Weekly Safety",
      inspectionDate: "2026-10-19",
      inspectorName: "Kelechi Obi (Fleet Tech)",
      odometerReadingKm: 198500,
      overallStatus: "Defect Flagged",
      checklist: {
        tyresAndPressures: "Pass",
        brakesAndFluid: "Pass",
        engineOilAndCoolant: "Pass",
        lightsAndIndicators: "Warning",
        windscreenAndWipers: "Pass",
        emergencyKitAndExtinguisher: "Pass"
      },
      notes: "AC compressor clutch seized, no cabin cooling for corporate staff commute route.",
      escalatedToRepairId: "WO-2026-083"
    },
    {
      id: "INSP-2026-105",
      vehiclePlate: "AAA07YG",
      vehicleType: "OPV (Hilux 4x4)",
      region: "IHS Lagos",
      inspectionType: "Pre-Trip Daily",
      inspectionDate: "2026-10-22",
      inspectorName: "Segun Obafemi (Lagos Insp)",
      odometerReadingKm: 124300,
      overallStatus: "Passed",
      checklist: {
        tyresAndPressures: "Pass",
        brakesAndFluid: "Pass",
        engineOilAndCoolant: "Pass",
        lightsAndIndicators: "Pass",
        windscreenAndWipers: "Pass",
        emergencyKitAndExtinguisher: "Pass"
      },
      notes: "All routine inspection points cleared. Fire extinguisher inspected and valid."
    }
  ],
  partRepairs: [
    {
      id: "rep-01",
      workOrderNumber: "WO-2026-081",
      vehiclePlate: "AAA982YJ",
      vehicleType: "OPV (Hilux 4x4)",
      region: "IHS Enugu & Asaba",
      partName: "Front Brake Caliper & Ceramic Brake Pads",
      category: "Brakes",
      damagedDate: "2026-10-18",
      repairedDate: undefined,
      tatDays: 4,
      costAmount: 85000,
      workshopVendor: "Autofit Asaba Engineering Workshop",
      status: "In Workshop",
      jccSignedOff: false,
      remark: "New caliper seal kit sourced from Onitsha market. Fitting in progress.",
      originInspectionId: "INSP-2026-102"
    },
    {
      id: "rep-02",
      workOrderNumber: "WO-2026-082",
      vehiclePlate: "FST131YF",
      vehicleType: "Volvo FM 420 Truck",
      region: "Kano",
      partName: "Heavy-Duty Radiator Coolant Hose & Clamp Assembly",
      category: "Cooling",
      damagedDate: "2026-10-15",
      repairedDate: undefined,
      tatDays: 7,
      costAmount: 145000,
      workshopVendor: "Kano Heavy Trucks Depot Garage",
      status: "Awaiting Parts",
      jccSignedOff: false,
      remark: "Reinforced silicone hose shipment dispatched from Kaduna transit depot.",
      originInspectionId: "INSP-2026-103"
    },
    {
      id: "rep-03",
      workOrderNumber: "WO-2026-083",
      vehiclePlate: "KRD408JV",
      vehicleType: "Toyota Coaster (30-Seater)",
      region: "Coaster Buses",
      partName: "Denso AC Compressor & Serpentine Belt",
      category: "Electrical",
      damagedDate: "2026-10-19",
      repairedDate: undefined,
      tatDays: 3,
      costAmount: 220000,
      workshopVendor: "Speedy Cool Auto Workshop, Ikeja",
      status: "In Workshop",
      jccSignedOff: false,
      remark: "System flushed, compressor mounted, currently vacuum testing for refrigerant leaks.",
      originInspectionId: "INSP-2026-104"
    },
    {
      id: "rep-04",
      workOrderNumber: "WO-2026-074",
      vehiclePlate: "AAA90YJ",
      vehicleType: "OPV (Hilux 4x4)",
      region: "IHS Enugu & Asaba",
      partName: "Front Shock Absorbers (Pair) & Stabilizer Link Rods",
      category: "Suspension",
      damagedDate: "2026-09-28",
      repairedDate: "2026-10-01",
      tatDays: 3,
      costAmount: 165000,
      workshopVendor: "Autofit Asaba Engineering Workshop",
      status: "Repaired & Cleared",
      jccSignedOff: true,
      remark: "Completed within 72h SLA. JCC signed off by Fleet Supervisor."
    },
    {
      id: "rep-05",
      workOrderNumber: "WO-2026-069",
      vehiclePlate: "AGL82JS",
      vehicleType: "Toyota Coaster (30-Seater)",
      region: "Coaster Buses",
      partName: "Clutch Slave Cylinder & Bleed Valve",
      category: "Transmission",
      damagedDate: "2026-09-15",
      repairedDate: "2026-09-17",
      tatDays: 2,
      costAmount: 95000,
      workshopVendor: "Toyota Certified Service Centre, Anthony",
      status: "Repaired & Cleared",
      jccSignedOff: true,
      remark: "Turnaround time 48 hours. Hydraulic pressure test passed."
    }
  ],
  drivers: [
    { id: "drv-01", name: "Adebanjo Rufus", phone: "+234 803 419 2811", assignedPlate: "AAA90YJ", assignedVehicleType: "OPV (Hilux 4x4)", region: "IHS Enugu & Asaba", licenseNumber: "LAS-29104-B", licenseExpiry: "2027-04-18", lasdriCertified: true, status: "Assigned", assignedDate: "2026-01-15" },
    { id: "drv-02", name: "Emeka Nwankwo", phone: "+234 812 550 4910", assignedPlate: "AAA982YJ", assignedVehicleType: "OPV (Hilux 4x4)", region: "IHS Enugu & Asaba", licenseNumber: "EN-88192-A", licenseExpiry: "2027-09-22", lasdriCertified: true, status: "Assigned", assignedDate: "2026-02-01" },
    { id: "drv-03", name: "Vitalis Okeke", phone: "+234 802 881 2940", assignedPlate: "AAA983YF", assignedVehicleType: "OPV (Hilux 4x4)", region: "IHS Enugu & Asaba", licenseNumber: "EN-31049-C", licenseExpiry: "2026-11-30", lasdriCertified: true, status: "Assigned", assignedDate: "2026-01-10" },
    { id: "drv-04", name: "Ogbarode Anthony", phone: "+234 806 731 0029", assignedPlate: "AAA91YJ", assignedVehicleType: "OPV (Hilux 4x4)", region: "IHS Enugu & Asaba", licenseNumber: "DEL-44910-B", licenseExpiry: "2027-06-14", lasdriCertified: true, status: "Assigned", assignedDate: "2026-03-01" },
    { id: "drv-05", name: "Usman Ibrahim", phone: "+234 803 772 1092", assignedPlate: "FST131YF", assignedVehicleType: "Volvo FM 420 Truck", region: "Kano", licenseNumber: "KAN-77192-A", licenseExpiry: "2027-05-19", lasdriCertified: false, status: "Assigned", assignedDate: "2025-11-10" },
    { id: "drv-06", name: "Auwalu Shehu", phone: "+234 806 182 9901", assignedPlate: "APP342YG", assignedVehicleType: "Volvo FM 420 Truck", region: "Kano", licenseNumber: "KAN-12903-A", licenseExpiry: "2027-02-28", lasdriCertified: false, status: "Assigned", assignedDate: "2026-01-05" },
    { id: "drv-07", name: "Sabo Muhammad", phone: "+234 808 392 0012", assignedPlate: "SMK317YH", assignedVehicleType: "DAF CF 85 Truck", region: "Kano", licenseNumber: "KAN-99102-A", licenseExpiry: "2027-10-11", lasdriCertified: false, status: "Assigned", assignedDate: "2026-04-12" },
    { id: "drv-08", name: "Babatunde Balogun", phone: "+234 802 334 1928", assignedPlate: "AAA07YG", assignedVehicleType: "OPV (Hilux 4x4)", region: "IHS Lagos", licenseNumber: "LAS-44912-B", licenseExpiry: "2027-07-20", lasdriCertified: true, status: "Assigned", assignedDate: "2026-01-08" },
    { id: "drv-09", name: "Ganiyu Lawal", phone: "+234 803 118 4930", assignedPlate: "AGL82JS", assignedVehicleType: "Toyota Coaster (30-Seater)", region: "Coaster Buses", licenseNumber: "LAS-88219-A", licenseExpiry: "2027-03-15", lasdriCertified: true, status: "Assigned", assignedDate: "2025-10-01" },
    { id: "drv-10", name: "Segun Alabi", phone: "+234 809 384 1902", assignedPlate: "KRD408JV", assignedVehicleType: "Toyota Coaster (30-Seater)", region: "Coaster Buses", licenseNumber: "LAS-77182-A", licenseExpiry: "2026-12-05", lasdriCertified: true, status: "Assigned", assignedDate: "2026-01-18" },
    { id: "drv-11", name: "Ifeanyi Okoli", phone: "+234 803 918 2049", assignedPlate: "KSF885JZ", assignedVehicleType: "Toyota Highlander 4WD", region: "GAIOS", licenseNumber: "LAS-33019-B", licenseExpiry: "2027-11-20", lasdriCertified: true, status: "Assigned", assignedDate: "2026-05-01" },
    { id: "drv-12", name: "Chinedu Okafor", phone: "+234 802 991 3847", assignedPlate: "", assignedVehicleType: "", region: "Standby Pool", licenseNumber: "LAS-55219-B", licenseExpiry: "2027-12-14", lasdriCertified: true, status: "Standby", assignedDate: "" }
  ]
};
