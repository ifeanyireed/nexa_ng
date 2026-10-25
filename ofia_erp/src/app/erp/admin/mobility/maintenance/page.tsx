"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Wrench,
  Calendar,
  AlertTriangle,
  PenTool,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Users,
  Car,
  Truck,
  ClipboardCheck,
  FileText,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Clock,
  Phone,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Layers,
  DollarSign,
  AlertCircle,
  BadgeAlert,
  SlidersHorizontal,
  X,
  Gauge,
  UserCheck
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { Pagination } from "@/components/nexa/Pagination";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant, extractSubdomainOrParam } from "@/lib/tenant-context";

// =============================================================================
// TYPES & DATA INTERFACES (Strictly Generic & Multitenant)
// =============================================================================

export type FleetRegion = string;

export type DocumentType =
  | "hackney"
  | "roadWorthiness"
  | "license"
  | "insurance";

export interface DocumentRecord {
  docType: DocumentType;
  label: string;
  renewedDate: string; // YYYY-MM-DD
  expiringDate: string; // YYYY-MM-DD
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
  inspectionDate: string; // YYYY-MM-DD
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
  escalatedToRepairId?: string; // Links to Maintenance Logger when defect is found
}

export interface PartRepairRecord {
  id: string;
  workOrderNumber: string;
  vehiclePlate: string;
  vehicleType: string;
  region: string;
  partName: string;
  category: "Brakes" | "Suspension" | "Engine" | "Electrical" | "Tyres" | "Cooling" | "Transmission" | "Bodywork";
  damagedDate: string; // YYYY-MM-DD
  repairedDate?: string; // YYYY-MM-DD
  tatDays: number; // Turn Around Time in Days (auto-calculated)
  costAmount: number; // NGN
  workshopVendor: string;
  status: "Awaiting Parts" | "In Workshop" | "Repaired & Cleared";
  jccSignedOff: boolean; // Job Completion Certificate signed off
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

function calculateDaysRemaining(expiringDateStr: string): { daysRemaining: number; status: "Valid" | "Expiring Soon" | "Expired" } {
  try {
    const today = new Date().toISOString().split("T")[0];
    const expiry = new Date(expiringDateStr + "T00:00:00Z");
    const diffTime = expiry.getTime() - new Date(today + "T00:00:00Z").getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let status: "Valid" | "Expiring Soon" | "Expired" = "Valid";
    if (days <= 0) status = "Expired";
    else if (days <= 30) status = "Expiring Soon";
    return { daysRemaining: days, status };
  } catch {
    return { daysRemaining: 0, status: "Expired" };
  }
}

// =============================================================================
// REUSABLE TAB PAGINATION CONTROLLER
// =============================================================================

function TablePaginationFooter({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  if (totalItems === 0) return null;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
        <span className="font-medium">Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1);
          }}
          aria-label="Select rows per page"
          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
        >
          {[10, 15, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 md:ml-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={pageSize}
          onPageChange={onPageChange}
          className="!pt-0 !border-t-0"
        />
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT: CONSOLIDATED FLEET OPERATIONS & COMPLIANCE HUB
// =============================================================================

export default function ConsolidatedFleetOperationsHub() {
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);
  const tenantSlug = activeTenant?.slug || extractSubdomainOrParam() || "";

  // Navigation sub-tabs: 4 Consolidated Pages + Master Matrix
  const [activeTab, setActiveTab] = useState<
    "matrix" | "drivers" | "inspection" | "papers" | "maintenance"
  >("matrix");

  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination states per subpage
  const [pageSize, setPageSize] = useState<number>(15);
  const [matrixPage, setMatrixPage] = useState<number>(1);
  const [driversPage, setDriversPage] = useState<number>(1);
  const [inspectionPage, setInspectionPage] = useState<number>(1);
  const [papersPage, setPapersPage] = useState<number>(1);
  const [repairsPage, setRepairsPage] = useState<number>(1);

  // Live Component State loaded dynamically per tenant from API
  const [vehicles, setVehicles] = useState<FleetVehicleUnit[]>([]);
  const [inspections, setInspections] = useState<RoutineInspectionRecord[]>([]);
  const [repairs, setRepairs] = useState<PartRepairRecord[]>([]);
  const [drivers, setDrivers] = useState<DriverAssignmentRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);

  // Selected vehicle for contextual modal actions
  const [selectedPlate, setSelectedPlate] = useState<string>("");
  const [defectToEscalate, setDefectToEscalate] = useState<{
    inspectionId: string;
    vehiclePlate: string;
    defectNote: string;
  } | null>(null);

  // Forms State
  const [assignForm, setAssignForm] = useState({
    plateNumber: "",
    driverId: "",
    newDriverName: "",
    phone: "",
    lasdriCertified: true,
  });

  const [inspectionForm, setInspectionForm] = useState({
    vehiclePlate: "",
    inspectionType: "Pre-Trip Daily" as RoutineInspectionRecord["inspectionType"],
    inspectorName: user?.name || "Fleet Inspector",
    odometerReadingKm: 0,
    tyres: "Pass" as InspectionCheckStatus,
    brakes: "Pass" as InspectionCheckStatus,
    fluids: "Pass" as InspectionCheckStatus,
    lights: "Pass" as InspectionCheckStatus,
    windscreen: "Pass" as InspectionCheckStatus,
    emergencyKit: "Pass" as InspectionCheckStatus,
    notes: ""
  });

  const [paperForm, setPaperForm] = useState({
    vehiclePlate: "",
    docType: "hackney" as DocumentType,
    renewedDate: new Date().toISOString().split("T")[0],
    expiringDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    renewalAmount: 25000,
    docRefNumber: ""
  });

  const [repairForm, setRepairForm] = useState({
    vehiclePlate: "",
    partName: "",
    category: "Brakes" as PartRepairRecord["category"],
    damagedDate: new Date().toISOString().split("T")[0],
    costAmount: 0,
    workshopVendor: "",
    remark: ""
  });

  const [vehicleForm, setVehicleForm] = useState({
    plateNumber: "",
    vehicleType: "Toyota Hilux",
    region: "Main Fleet",
    assignedDriverName: "",
    hackneyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    roadWorthinessExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    insuranceExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    hackneyCost: 25000,
    roadWorthinessCost: 18000,
    licenseCost: 32000,
    insuranceCost: 65000,
  });

  // Load tenant fleet data from live API
  useEffect(() => {
    let isCurrent = true;
    async function loadTenantData() {
      if (!tenantSlug) {
        setIsLoadingData(false);
        return;
      }
      setIsLoadingData(true);
      try {
        const res = await fetch(
          `/api/erp/mobility/maintenance?tenant=${encodeURIComponent(tenantSlug)}`,
          {
            headers: {
              "x-tenant-slug": tenantSlug,
            },
          }
        );
        if (res.ok) {
          const json = await res.json();
          if (isCurrent && json.success) {
            setVehicles(json.vehicles || []);
            setInspections(json.routineInspections || []);
            setRepairs(json.partRepairs || []);
            setDrivers(json.drivers || []);
          }
        }
      } catch (err) {
        console.warn("Failed to load tenant mobility fleet data:", err);
      } finally {
        if (isCurrent) setIsLoadingData(false);
      }
    }
    loadTenantData();
    return () => {
      isCurrent = false;
    };
  }, [tenantSlug]);

  // Dynamically derived regions from tenant's vehicle inventory
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach((v) => {
      if (v.region && v.region.trim()) set.add(v.region.trim());
    });
    return ["All", ...Array.from(set)];
  }, [vehicles]);

  // ---------------------------------------------------------------------------
  // FILTERING LOGIC
  // ---------------------------------------------------------------------------
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesRegion = selectedRegion === "All" || v.region === selectedRegion;
      const matchesSearch =
        v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.assignedDriverName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRegion && matchesSearch;
    });
  }, [vehicles, selectedRegion, searchQuery]);

  const filteredInspections = useMemo(() => {
    return inspections.filter((insp) => {
      const matchesRegion = selectedRegion === "All" || insp.region === selectedRegion;
      const matchesSearch =
        insp.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insp.inspectorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insp.notes.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRegion && matchesSearch;
    });
  }, [inspections, selectedRegion, searchQuery]);

  const filteredRepairs = useMemo(() => {
    return repairs.filter((rep) => {
      const matchesRegion = selectedRegion === "All" || rep.region === selectedRegion;
      const matchesSearch =
        rep.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.workshopVendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRegion && matchesSearch;
    });
  }, [repairs, selectedRegion, searchQuery]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const matchesRegion = selectedRegion === "All" || d.region === selectedRegion;
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.assignedPlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.phone.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRegion && matchesSearch;
    });
  }, [drivers, selectedRegion, searchQuery]);

  // Reset all page controllers when search query or selected region changes
  useEffect(() => {
    setMatrixPage(1);
    setDriversPage(1);
    setInspectionPage(1);
    setPapersPage(1);
    setRepairsPage(1);
  }, [searchQuery, selectedRegion]);

  // Adjust page index if outside total pages
  useEffect(() => {
    const totalMatrixPages = Math.max(1, Math.ceil(filteredVehicles.length / pageSize));
    if (matrixPage > totalMatrixPages) setMatrixPage(totalMatrixPages);
  }, [filteredVehicles.length, matrixPage, pageSize]);

  useEffect(() => {
    const totalDriversPages = Math.max(1, Math.ceil(filteredDrivers.length / pageSize));
    if (driversPage > totalDriversPages) setDriversPage(totalDriversPages);
  }, [filteredDrivers.length, driversPage, pageSize]);

  useEffect(() => {
    const totalInspectionPages = Math.max(1, Math.ceil(filteredInspections.length / pageSize));
    if (inspectionPage > totalInspectionPages) setInspectionPage(totalInspectionPages);
  }, [filteredInspections.length, inspectionPage, pageSize]);

  useEffect(() => {
    const totalPapersPages = Math.max(1, Math.ceil(filteredVehicles.length / pageSize));
    if (papersPage > totalPapersPages) setPapersPage(totalPapersPages);
  }, [filteredVehicles.length, papersPage, pageSize]);

  useEffect(() => {
    const totalRepairsPages = Math.max(1, Math.ceil(filteredRepairs.length / pageSize));
    if (repairsPage > totalRepairsPages) setRepairsPage(totalRepairsPages);
  }, [filteredRepairs.length, repairsPage, pageSize]);

  // ---------------------------------------------------------------------------
  // PAGINATED DATA SLICES (Strictly 15 items per page default)
  // ---------------------------------------------------------------------------
  const paginatedVehicles = useMemo(() => {
    const start = (matrixPage - 1) * pageSize;
    return filteredVehicles.slice(start, start + pageSize);
  }, [filteredVehicles, matrixPage, pageSize]);

  const paginatedDrivers = useMemo(() => {
    const start = (driversPage - 1) * pageSize;
    return filteredDrivers.slice(start, start + pageSize);
  }, [filteredDrivers, driversPage, pageSize]);

  const paginatedInspections = useMemo(() => {
    const start = (inspectionPage - 1) * pageSize;
    return filteredInspections.slice(start, start + pageSize);
  }, [filteredInspections, inspectionPage, pageSize]);

  const paginatedPapersVehicles = useMemo(() => {
    const start = (papersPage - 1) * pageSize;
    return filteredVehicles.slice(start, start + pageSize);
  }, [filteredVehicles, papersPage, pageSize]);

  const paginatedRepairs = useMemo(() => {
    const start = (repairsPage - 1) * pageSize;
    return filteredRepairs.slice(start, start + pageSize);
  }, [filteredRepairs, repairsPage, pageSize]);

  // ---------------------------------------------------------------------------
  // AGGREGATED METRICS
  // ---------------------------------------------------------------------------
  const totalFleetCount = vehicles.length;
  const unassignedVehiclesCount = vehicles.filter((v) => !v.assignedDriverName).length;
  const totalExpiredPapers = vehicles.reduce((acc, v) => {
    const docs = Object.values(v.documents);
    return acc + docs.filter((d) => d.status === "Expired").length;
  }, 0);
  const totalExpiringSoonPapers = vehicles.reduce((acc, v) => {
    const docs = Object.values(v.documents);
    return acc + docs.filter((d) => d.status === "Expiring Soon").length;
  }, 0);
  const openRepairsCount = repairs.filter((r) => r.status !== "Repaired & Cleared").length;
  const totalRepairSpend = repairs.reduce((acc, r) => acc + r.costAmount, 0);

  // ---------------------------------------------------------------------------
  // ACTIONS: ADD VEHICLE
  // ---------------------------------------------------------------------------
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.plateNumber.trim()) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const hackneyCalc = calculateDaysRemaining(vehicleForm.hackneyExpiry);
    const rdwCalc = calculateDaysRemaining(vehicleForm.roadWorthinessExpiry);
    const licCalc = calculateDaysRemaining(vehicleForm.licenseExpiry);
    const insCalc = calculateDaysRemaining(vehicleForm.insuranceExpiry);

    const newUnit: FleetVehicleUnit = {
      id: `veh-${Date.now()}`,
      plateNumber: vehicleForm.plateNumber.trim().toUpperCase(),
      vehicleType: vehicleForm.vehicleType.trim(),
      region: vehicleForm.region.trim() || "Main Fleet",
      assignedDriverName: vehicleForm.assignedDriverName || "",
      operationalStatus: "Operational",
      documents: {
        hackney: {
          docType: "hackney",
          label: "Hackney Permit",
          renewedDate: todayStr,
          expiringDate: vehicleForm.hackneyExpiry,
          daysRemaining: hackneyCalc.daysRemaining,
          status: hackneyCalc.status,
          renewalAmount: Number(vehicleForm.hackneyCost) || 25000,
        },
        roadWorthiness: {
          docType: "roadWorthiness",
          label: "Road Worthiness",
          renewedDate: todayStr,
          expiringDate: vehicleForm.roadWorthinessExpiry,
          daysRemaining: rdwCalc.daysRemaining,
          status: rdwCalc.status,
          renewalAmount: Number(vehicleForm.roadWorthinessCost) || 18000,
        },
        license: {
          docType: "license",
          label: "Vehicle License",
          renewedDate: todayStr,
          expiringDate: vehicleForm.licenseExpiry,
          daysRemaining: licCalc.daysRemaining,
          status: licCalc.status,
          renewalAmount: Number(vehicleForm.licenseCost) || 32000,
        },
        insurance: {
          docType: "insurance",
          label: "Proof / Insurance",
          renewedDate: todayStr,
          expiringDate: vehicleForm.insuranceExpiry,
          daysRemaining: insCalc.daysRemaining,
          status: insCalc.status,
          renewalAmount: Number(vehicleForm.insuranceCost) || 65000,
        },
      },
      openRepairsCount: 0,
      totalMaintenanceCost: 0,
    };

    setVehicles((prev) => [newUnit, ...prev]);
    setIsAddVehicleModalOpen(false);

    fetch("/api/erp/mobility/maintenance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      },
      body: JSON.stringify({
        action: "ADD_VEHICLE",
        vehicle: newUnit,
        tenantSlug,
      }),
    }).catch((err) => console.warn("Failed to persist vehicle addition:", err));
  };

  // ---------------------------------------------------------------------------
  // ACTIONS: DRIVER ASSIGNMENT
  // ---------------------------------------------------------------------------
  const handleAssignDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.plateNumber) return;

    let driverName = assignForm.newDriverName;
    let driverPhone = assignForm.phone;
    let isLasdri = assignForm.lasdriCertified;

    if (assignForm.driverId) {
      const matched = drivers.find((d) => d.id === assignForm.driverId);
      if (matched) {
        driverName = matched.name;
        driverPhone = matched.phone;
        isLasdri = matched.lasdriCertified;
      }
    }

    setVehicles((prev) =>
      prev.map((v) => {
        if (v.plateNumber === assignForm.plateNumber) {
          return {
            ...v,
            assignedDriverName: driverName,
            assignedDriverPhone: driverPhone,
            assignedDriverLasdri: isLasdri
          };
        }
        return v;
      })
    );

    setDrivers((prev) =>
      prev.map((d) => {
        if (d.name === driverName) {
          return {
            ...d,
            assignedPlate: assignForm.plateNumber,
            status: "Assigned"
          };
        }
        return d;
      })
    );

    setIsAssignModalOpen(false);

    fetch("/api/erp/mobility/maintenance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      },
      body: JSON.stringify({
        action: "ASSIGN_DRIVER",
        plateNumber: assignForm.plateNumber,
        driverName,
        phone: driverPhone,
        lasdriCertified: isLasdri,
        tenantSlug,
      }),
    }).catch(() => null);
  };

  const handleUnassignDriver = (plateNumber: string) => {
    setVehicles((prev) =>
      prev.map((v) => (v.plateNumber === plateNumber ? { ...v, assignedDriverName: "", assignedDriverPhone: undefined } : v))
    );
    setDrivers((prev) =>
      prev.map((d) => (d.assignedPlate === plateNumber ? { ...d, assignedPlate: "", status: "Standby" } : d))
    );

    fetch("/api/erp/mobility/maintenance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      },
      body: JSON.stringify({
        action: "ASSIGN_DRIVER",
        plateNumber,
        driverName: "",
        phone: "",
        lasdriCertified: false,
        tenantSlug,
      }),
    }).catch(() => null);
  };

  // ---------------------------------------------------------------------------
  // ACTIONS: ROUTINE INSPECTION (Strictly separate from repairs)
  // ---------------------------------------------------------------------------
  const handleLogInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectionForm.vehiclePlate) return;

    const matchedVeh = vehicles.find((v) => v.plateNumber === inspectionForm.vehiclePlate);
    const hasDefect =
      inspectionForm.tyres === "Fail" ||
      inspectionForm.brakes === "Fail" ||
      inspectionForm.fluids === "Fail" ||
      inspectionForm.lights === "Fail" ||
      inspectionForm.windscreen === "Fail" ||
      inspectionForm.emergencyKit === "Fail";

    const newInsp: RoutineInspectionRecord = {
      id: `INSP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      vehiclePlate: inspectionForm.vehiclePlate,
      vehicleType: matchedVeh ? matchedVeh.vehicleType : "Commercial Vehicle",
      region: matchedVeh ? matchedVeh.region : (selectedRegion !== "All" ? selectedRegion : "Main Fleet"),
      inspectionType: inspectionForm.inspectionType,
      inspectionDate: new Date().toISOString().split("T")[0],
      inspectorName: inspectionForm.inspectorName,
      odometerReadingKm: Number(inspectionForm.odometerReadingKm),
      overallStatus: hasDefect ? "Defect Flagged" : "Passed",
      checklist: {
        tyresAndPressures: inspectionForm.tyres,
        brakesAndFluid: inspectionForm.brakes,
        engineOilAndCoolant: inspectionForm.fluids,
        lightsAndIndicators: inspectionForm.lights,
        windscreenAndWipers: inspectionForm.windscreen,
        emergencyKitAndExtinguisher: inspectionForm.emergencyKit
      },
      notes: inspectionForm.notes || (hasDefect ? "Routine inspection identified mechanical defects requiring workshop intervention." : "Vehicle passed 6-point pre-trip routine inspection.")
    };

    setInspections([newInsp, ...inspections]);

    setVehicles((prev) =>
      prev.map((v) => {
        if (v.plateNumber === inspectionForm.vehiclePlate) {
          return {
            ...v,
            operationalStatus: hasDefect ? "In Workshop" : "Operational",
            lastRoutineInspection: {
              date: newInsp.inspectionDate,
              inspector: inspectionForm.inspectorName,
              passed: !hasDefect,
              type: inspectionForm.inspectionType
            }
          };
        }
        return v;
      })
    );

    setIsInspectionModalOpen(false);

    fetch("/api/erp/mobility/maintenance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      },
      body: JSON.stringify({
        action: "LOG_INSPECTION",
        inspection: newInsp,
        tenantSlug,
      }),
    }).catch(() => null);
  };

  // ---------------------------------------------------------------------------
  // ACTIONS: ESCALATE INSPECTION DEFECT TO MAINTENANCE LOGGER
  // ---------------------------------------------------------------------------
  const handleEscalateToRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defectToEscalate) return;

    const matchedVeh = vehicles.find((v) => v.plateNumber === defectToEscalate.vehiclePlate);
    const newWorkOrder: PartRepairRecord = {
      id: `rep-${Date.now()}`,
      workOrderNumber: `WO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      vehiclePlate: defectToEscalate.vehiclePlate,
      vehicleType: matchedVeh ? matchedVeh.vehicleType : "Commercial Vehicle",
      region: matchedVeh ? matchedVeh.region : (selectedRegion !== "All" ? selectedRegion : "Main Fleet"),
      partName: defectToEscalate.defectNote.slice(0, 50) || "Routine Inspection Defect",
      category: "Brakes",
      damagedDate: new Date().toISOString().split("T")[0],
      tatDays: 0,
      costAmount: Number(repairForm.costAmount) || 0,
      workshopVendor: repairForm.workshopVendor || "Approved Service Centre",
      status: "In Workshop",
      jccSignedOff: false,
      remark: `Escalated directly from Routine Inspection ${defectToEscalate.inspectionId}: ${defectToEscalate.defectNote}`,
      originInspectionId: defectToEscalate.inspectionId
    };

    setRepairs([newWorkOrder, ...repairs]);

    setInspections((prev) =>
      prev.map((insp) =>
        insp.id === defectToEscalate.inspectionId ? { ...insp, escalatedToRepairId: newWorkOrder.workOrderNumber } : insp
      )
    );

    setVehicles((prev) =>
      prev.map((v) =>
        v.plateNumber === defectToEscalate.vehiclePlate
          ? { ...v, operationalStatus: "In Workshop", openRepairsCount: v.openRepairsCount + 1 }
          : v
      )
    );

    setIsEscalateModalOpen(false);
    setDefectToEscalate(null);

    fetch("/api/erp/mobility/maintenance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      },
      body: JSON.stringify({
        action: "LOG_REPAIR",
        repair: newWorkOrder,
        tenantSlug,
      }),
    }).catch(() => null);
  };

  // ---------------------------------------------------------------------------
  // ACTIONS: VEHICLE PAPERS RENEWAL
  // ---------------------------------------------------------------------------
  const handleRenewDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperForm.vehiclePlate) return;

    const { daysRemaining, status } = calculateDaysRemaining(paperForm.expiringDate);

    setVehicles((prev) =>
      prev.map((v) => {
        if (v.plateNumber === paperForm.vehiclePlate) {
          const currentDocs = { ...v.documents };
          currentDocs[paperForm.docType] = {
            ...currentDocs[paperForm.docType],
            renewedDate: paperForm.renewedDate,
            expiringDate: paperForm.expiringDate,
            daysRemaining,
            status,
            renewalAmount: Number(paperForm.renewalAmount),
            docRefNumber: paperForm.docRefNumber
          };
          return {
            ...v,
            documents: currentDocs,
            operationalStatus: status === "Expired" ? "Grounded (Papers Expired)" : v.operationalStatus === "In Workshop" ? "In Workshop" : "Operational"
          };
        }
        return v;
      })
    );

    setIsPaperModalOpen(false);

    fetch("/api/erp/mobility/maintenance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      },
      body: JSON.stringify({
        action: "RENEW_PAPER",
        vehiclePlate: paperForm.vehiclePlate,
        docType: paperForm.docType,
        renewedDate: paperForm.renewedDate,
        expiringDate: paperForm.expiringDate,
        renewalAmount: Number(paperForm.renewalAmount),
        docRefNumber: paperForm.docRefNumber,
        tenantSlug,
      }),
    }).catch(() => null);
  };

  // ---------------------------------------------------------------------------
  // ACTIONS: PART REPAIRS & JCC SIGN-OFF
  // ---------------------------------------------------------------------------
  const handleLogPartRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairForm.vehiclePlate) return;

    const matchedVeh = vehicles.find((v) => v.plateNumber === repairForm.vehiclePlate);
    const newRepair: PartRepairRecord = {
      id: `rep-${Date.now()}`,
      workOrderNumber: `WO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      vehiclePlate: repairForm.vehiclePlate,
      vehicleType: matchedVeh ? matchedVeh.vehicleType : "Commercial Vehicle",
      region: matchedVeh ? matchedVeh.region : (selectedRegion !== "All" ? selectedRegion : "Main Fleet"),
      partName: repairForm.partName,
      category: repairForm.category,
      damagedDate: repairForm.damagedDate,
      tatDays: 0,
      costAmount: Number(repairForm.costAmount),
      workshopVendor: repairForm.workshopVendor || "Approved Service Centre",
      status: "In Workshop",
      jccSignedOff: false,
      remark: repairForm.remark || "Work order created."
    };

    setRepairs([newRepair, ...repairs]);

    setVehicles((prev) =>
      prev.map((v) => {
        if (v.plateNumber === repairForm.vehiclePlate) {
          return {
            ...v,
            operationalStatus: "In Workshop",
            openRepairsCount: v.openRepairsCount + 1,
            totalMaintenanceCost: v.totalMaintenanceCost + Number(repairForm.costAmount)
          };
        }
        return v;
      })
    );

    setIsRepairModalOpen(false);

    fetch("/api/erp/mobility/maintenance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      },
      body: JSON.stringify({
        action: "LOG_REPAIR",
        repair: newRepair,
        tenantSlug,
      }),
    }).catch(() => null);
  };

  const handleSignJcc = (repairId: string) => {
    setRepairs((prev) =>
      prev.map((r) => {
        if (r.id === repairId) {
          return {
            ...r,
            jccSignedOff: true,
            status: "Repaired & Cleared",
            repairedDate: new Date().toISOString().split("T")[0]
          };
        }
        return r;
      })
    );

    const target = repairs.find((r) => r.id === repairId);
    if (target) {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.plateNumber === target.vehiclePlate) {
            return {
              ...v,
              openRepairsCount: Math.max(0, v.openRepairsCount - 1),
              operationalStatus: "Operational"
            };
          }
          return v;
        })
      );
    }

    fetch("/api/erp/mobility/maintenance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      },
      body: JSON.stringify({
        action: "SIGN_JCC",
        repairId,
        tenantSlug,
      }),
    }).catch(() => null);
  };

  return (
    <ErpAdminShell
      title="Fleet Operations & Compliance Hub"
      subtitle="Unified command console consolidating Driver Assignment, Routine Inspection, Vehicle Papers, and Maintenance Turn Around Time (TAT)."
      activeModule="mobility"
      action={
        <div className="flex items-center gap-2">
          <NexaButton
            size="sm"
            variant="outline"
            onClick={() => setIsAddVehicleModalOpen(true)}
            className="gap-2 text-xs"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            Add Vehicle Unit
          </NexaButton>
          <NexaButton
            size="sm"
            variant="outline"
            onClick={() => {
              setInspectionForm({
                ...inspectionForm,
                vehiclePlate: vehicles[0]?.plateNumber || ""
              });
              setIsInspectionModalOpen(true);
            }}
            className="gap-2 text-xs"
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-500" />
            Log Routine Inspection
          </NexaButton>
          <NexaButton
            size="sm"
            variant="primary"
            onClick={() => {
              setRepairForm({
                ...repairForm,
                vehiclePlate: vehicles[0]?.plateNumber || ""
              });
              setIsRepairModalOpen(true);
            }}
            className="gap-2 text-xs"
          >
            <Wrench className="w-4 h-4" />
            Log Part Repair (TAT)
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">

        {/* TOP KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Fleet</span>
              <Truck className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xl font-bold text-slate-900">{totalFleetCount}</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Active registered units
            </p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Unassigned</span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-xl font-bold text-slate-900">{unassignedVehiclesCount}</p>
            <p className="text-[11px] text-purple-600 mt-1 font-medium">
              Needs driver pairing
            </p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Expired Papers</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-xl font-bold text-rose-600">{totalExpiredPapers}</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Grounded / High fine risk
            </p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Expiring &lt; 30d</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl font-bold text-amber-600">{totalExpiringSoonPapers}</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Upcoming renewal renewals
            </p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Workshop Repairs</span>
              <Wrench className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xl font-bold text-slate-900">{openRepairsCount}</p>
            <p className="text-[11px] text-slate-500 mt-1">
              ₦{totalRepairSpend.toLocaleString()} spend
            </p>
          </div>
        </div>

        {/* DYNAMIC REGIONAL FILTER PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1 border-b border-slate-200 pb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-2 shrink-0">
            <Layers className="w-3.5 h-3.5" /> Operations Division:
          </span>
          {availableRegions.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                selectedRegion === reg
                  ? "bg-blue-600 text-white shadow-sm font-semibold"
                  : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {reg === "All" ? `All Divisions (${vehicles.length})` : `${reg} (${vehicles.filter(v => v.region === reg).length})`}
            </button>
          ))}
        </div>

        {/* 5 CONSOLIDATED SUB-VIEW TABS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("matrix")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === "matrix"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              1. Fleet Master Matrix
            </button>

            <button
              onClick={() => setActiveTab("drivers")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === "drivers"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-purple-500" />
              2. Driver Assignment
              {unassignedVehiclesCount > 0 && (
                <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-700 rounded-full text-[10px]">
                  {unassignedVehiclesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("inspection")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === "inspection"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
              3. Routine Inspection Logger
            </button>

            <button
              onClick={() => setActiveTab("papers")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === "papers"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
              4. Vehicle Papers & Expiry
              {totalExpiredPapers > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-700 rounded-full text-[10px]">
                  {totalExpiredPapers}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("maintenance")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === "maintenance"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-amber-500" />
              5. Maintenance & Repairs TAT
              {openRepairsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-700 rounded-full text-[10px]">
                  {openRepairsCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search plate, driver, vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* =====================================================================
            TAB 1: MASTER FLEET MATRIX
        ====================================================================== */}
        {activeTab === "matrix" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="p-3.5 min-w-[140px]">Vehicle Unit</th>
                    <th className="p-3.5 min-w-[120px]">Division / Region</th>
                    <th className="p-3.5 min-w-[160px]">Assigned Driver</th>
                    <th className="p-3.5 text-center min-w-[110px]">Hackney</th>
                    <th className="p-3.5 text-center min-w-[110px]">Road Worthiness</th>
                    <th className="p-3.5 text-center min-w-[110px]">License</th>
                    <th className="p-3.5 text-center min-w-[110px]">Proof / Ins.</th>
                    <th className="p-3.5 min-w-[140px]">Routine Audit</th>
                    <th className="p-3.5 min-w-[130px]">Workshop TAT</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-12 text-center">
                        <div className="max-w-md mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto text-xl">
                            <Truck className="w-6 h-6" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">
                            No Fleet Vehicles Registered
                          </h4>
                          <p className="text-xs text-slate-500">
                            There are currently no vehicle records registered for this workspace. Onboard your first vehicle unit to start tracking driver rosters, routine safety checks, document expiries, and maintenance TAT.
                          </p>
                          <div className="pt-2">
                            <NexaButton
                              size="sm"
                              variant="primary"
                              onClick={() => setIsAddVehicleModalOpen(true)}
                              className="gap-1.5 text-xs mx-auto"
                            >
                              <Plus className="w-4 h-4" /> Register First Vehicle
                            </NexaButton>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedVehicles.map((veh) => {
                      const hStatus = veh.documents.hackney;
                      const rStatus = veh.documents.roadWorthiness;
                      const lStatus = veh.documents.license;
                      const iStatus = veh.documents.insurance;

                      return (
                        <tr key={veh.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Vehicle Unit */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                <Car className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 font-mono">{veh.plateNumber}</p>
                                <p className="text-[10px] text-slate-500">{veh.vehicleType}</p>
                              </div>
                            </div>
                          </td>

                          {/* Region */}
                          <td className="p-3.5 text-slate-600 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-medium">
                              {veh.region}
                            </span>
                          </td>

                          {/* Driver Assignment */}
                          <td className="p-3.5">
                            {veh.assignedDriverName ? (
                              <div>
                                <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                                  {veh.assignedDriverName}
                                  {veh.assignedDriverLasdri && (
                                    <span className="px-1.5 py-0.2 bg-purple-500/10 text-purple-600 border border-purple-500/20 rounded text-[9px] font-bold" title="LASDRI Certified">
                                      LASDRI
                                    </span>
                                  )}
                                </p>
                                <p className="text-[10px] text-slate-500">{veh.assignedDriverPhone || "Active"}</p>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setAssignForm({ ...assignForm, plateNumber: veh.plateNumber });
                                  setIsAssignModalOpen(true);
                                }}
                                className="text-[11px] text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1 hover:underline"
                              >
                                <Plus className="w-3 h-3" /> Assign Driver
                              </button>
                            )}
                          </td>

                          {/* Hackney */}
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                hStatus.status === "Expired"
                                  ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                  : hStatus.status === "Expiring Soon"
                                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              }`}
                            >
                              {hStatus.daysRemaining < 0
                                ? `${Math.abs(hStatus.daysRemaining)}d Expired`
                                : `${hStatus.daysRemaining}d`}
                            </span>
                          </td>

                          {/* Road Worthiness */}
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                rStatus.status === "Expired"
                                  ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                  : rStatus.status === "Expiring Soon"
                                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              }`}
                            >
                              {rStatus.daysRemaining < 0
                                ? `${Math.abs(rStatus.daysRemaining)}d Expired`
                                : `${rStatus.daysRemaining}d`}
                            </span>
                          </td>

                          {/* Vehicle License */}
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                lStatus.status === "Expired"
                                  ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                  : lStatus.status === "Expiring Soon"
                                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              }`}
                            >
                              {lStatus.daysRemaining < 0
                                ? `${Math.abs(lStatus.daysRemaining)}d Expired`
                                : `${lStatus.daysRemaining}d`}
                            </span>
                          </td>

                          {/* Insurance */}
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                iStatus.status === "Expired"
                                  ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                  : iStatus.status === "Expiring Soon"
                                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              }`}
                            >
                              {iStatus.daysRemaining < 0
                                ? `${Math.abs(iStatus.daysRemaining)}d Expired`
                                : `${iStatus.daysRemaining}d`}
                            </span>
                          </td>

                          {/* Routine Inspection (Non-Repair Audit) */}
                          <td className="p-3.5">
                            {veh.lastRoutineInspection ? (
                              <div>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    veh.lastRoutineInspection.passed
                                      ? "bg-emerald-500/10 text-emerald-600"
                                      : "bg-rose-500/10 text-rose-600"
                                  }`}
                                >
                                  {veh.lastRoutineInspection.passed ? "✓ Passed Audit" : "⚠ Defect Flagged"}
                                </span>
                                <p className="text-[10px] text-slate-500 mt-1">
                                  {veh.lastRoutineInspection.date}
                                </p>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">None Recorded</span>
                            )}
                          </td>

                          {/* Maintenance Turn Around Time */}
                          <td className="p-3.5">
                            {veh.openRepairsCount > 0 ? (
                              <div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600">
                                  {veh.openRepairsCount} Open Work Order
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Trip
                              </span>
                            )}
                            <p className="text-[10px] text-slate-500 mt-1">
                              MTD: ₦{veh.totalMaintenanceCost.toLocaleString()}
                            </p>
                          </td>

                          {/* Row Actions */}
                          <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setInspectionForm({ ...inspectionForm, vehiclePlate: veh.plateNumber });
                                setIsInspectionModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-emerald-600 transition-colors"
                              title="Log Routine Inspection"
                            >
                              <ClipboardCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setPaperForm({
                                  vehiclePlate: veh.plateNumber,
                                  docType: "hackney",
                                  renewedDate: new Date().toISOString().split("T")[0],
                                  expiringDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                                  renewalAmount: 25000,
                                  docRefNumber: ""
                                });
                                setIsPaperModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
                              title="Renew Documents"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setRepairForm({
                                  ...repairForm,
                                  vehiclePlate: veh.plateNumber,
                                });
                                setIsRepairModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-amber-600 transition-colors"
                              title="Log Part Repair Work Order"
                            >
                              <Wrench className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <TablePaginationFooter
              currentPage={matrixPage}
              totalItems={filteredVehicles.length}
              pageSize={pageSize}
              onPageChange={setMatrixPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}

        {/* =====================================================================
            TAB 2: DRIVER ASSIGNMENT
        ====================================================================== */}
        {activeTab === "drivers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Fleet Drivers Roster & Vehicle Pairing
                </h4>
                <p className="text-xs text-slate-500">
                  Manage driver allocation, phone contacts, LASDRI compliance, and standby drivers.
                </p>
              </div>
              <NexaButton
                size="sm"
                variant="primary"
                onClick={() => {
                  setAssignForm({
                    plateNumber: vehicles.find((v) => !v.assignedDriverName)?.plateNumber || vehicles[0]?.plateNumber || "",
                    driverId: "",
                    newDriverName: "",
                    phone: "",
                    lasdriCertified: true,
                  });
                  setIsAssignModalOpen(true);
                }}
                className="gap-2 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Pair Driver to Vehicle
              </NexaButton>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="p-3.5">Driver Name</th>
                    <th className="p-3.5">Contact Phone</th>
                    <th className="p-3.5">Assigned Vehicle</th>
                    <th className="p-3.5">Division / Region</th>
                    <th className="p-3.5">License & LASDRI</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredDrivers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No driver records found. Click &quot;Pair Driver to Vehicle&quot; to register drivers.
                      </td>
                    </tr>
                  ) : (
                    paginatedDrivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
                              {driver.name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-900">{driver.name}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono text-xs">
                          {driver.phone || "—"}
                        </td>
                        <td className="p-3.5">
                          {driver.assignedPlate ? (
                            <div>
                              <span className="font-bold font-mono text-slate-900">{driver.assignedPlate}</span>
                              <p className="text-[10px] text-slate-500">{driver.assignedVehicleType}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned (Standby Pool)</span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {driver.region}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            {driver.lasdriCertified ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                                LASDRI Certified
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                                Non-LASDRI
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              driver.status === "Assigned"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : driver.status === "Standby"
                                ? "bg-blue-500/10 text-blue-600"
                                : "bg-amber-500/10 text-amber-600"
                            }`}
                          >
                            {driver.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          {driver.assignedPlate ? (
                            <button
                              onClick={() => handleUnassignDriver(driver.assignedPlate)}
                              className="text-xs text-rose-600 hover:underline font-semibold"
                            >
                              Unpair
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setAssignForm({
                                  plateNumber: vehicles.find((v) => !v.assignedDriverName)?.plateNumber || "",
                                  driverId: driver.id,
                                  newDriverName: driver.name,
                                  phone: driver.phone,
                                  lasdriCertified: driver.lasdriCertified,
                                });
                                setIsAssignModalOpen(true);
                              }}
                              className="text-xs text-purple-600 hover:underline font-semibold"
                            >
                              Pair
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <TablePaginationFooter
              currentPage={driversPage}
              totalItems={filteredDrivers.length}
              pageSize={pageSize}
              onPageChange={setDriversPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}

        {/* =====================================================================
            TAB 3: ROUTINE INSPECTION LOGGER (Strictly Separate from Repairs!)
        ====================================================================== */}
        {activeTab === "inspection" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Routine Pre-Trip & Post-Trip Inspection Log (Non-Repair Audit)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Daily vehicle condition monitoring. Defective checks can be escalated with 1-click to the Maintenance Logger.
                  </p>
                </div>
              </div>
              <NexaButton
                size="sm"
                variant="primary"
                onClick={() => {
                  setInspectionForm({
                    ...inspectionForm,
                    vehiclePlate: vehicles[0]?.plateNumber || ""
                  });
                  setIsInspectionModalOpen(true);
                }}
                className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                + Log Routine Inspection
              </NexaButton>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="p-3.5">Ticket #</th>
                    <th className="p-3.5">Vehicle</th>
                    <th className="p-3.5">Type & Inspector</th>
                    <th className="p-3.5">Mileage</th>
                    <th className="p-3.5 text-center">Tyres</th>
                    <th className="p-3.5 text-center">Brakes</th>
                    <th className="p-3.5 text-center">Fluids</th>
                    <th className="p-3.5 text-center">Lights</th>
                    <th className="p-3.5 text-center">Safety Kit</th>
                    <th className="p-3.5">Result</th>
                    <th className="p-3.5 text-right">Escalation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredInspections.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-slate-500">
                        No routine inspections logged yet. Click &quot;+ Log Routine Inspection&quot; to conduct daily audits.
                      </td>
                    </tr>
                  ) : (
                    paginatedInspections.map((insp) => (
                      <tr key={insp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          {insp.id}
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold font-mono text-slate-900">{insp.vehiclePlate}</span>
                          <p className="text-[10px] text-slate-500">{insp.region}</p>
                        </td>
                        <td className="p-3.5">
                          <p className="font-semibold text-slate-800">{insp.inspectionType}</p>
                          <p className="text-[10px] text-slate-500">{insp.inspectorName} • {insp.inspectionDate}</p>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">
                          {insp.odometerReadingKm ? `${insp.odometerReadingKm.toLocaleString()} km` : "—"}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`text-[10px] font-bold ${insp.checklist.tyresAndPressures === "Pass" ? "text-emerald-600" : insp.checklist.tyresAndPressures === "Warning" ? "text-amber-600" : "text-rose-600"}`}>
                            {insp.checklist.tyresAndPressures}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`text-[10px] font-bold ${insp.checklist.brakesAndFluid === "Pass" ? "text-emerald-600" : insp.checklist.brakesAndFluid === "Warning" ? "text-amber-600" : "text-rose-600"}`}>
                            {insp.checklist.brakesAndFluid}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`text-[10px] font-bold ${insp.checklist.engineOilAndCoolant === "Pass" ? "text-emerald-600" : insp.checklist.engineOilAndCoolant === "Warning" ? "text-amber-600" : "text-rose-600"}`}>
                            {insp.checklist.engineOilAndCoolant}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`text-[10px] font-bold ${insp.checklist.lightsAndIndicators === "Pass" ? "text-emerald-600" : insp.checklist.lightsAndIndicators === "Warning" ? "text-amber-600" : "text-rose-600"}`}>
                            {insp.checklist.lightsAndIndicators}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`text-[10px] font-bold ${insp.checklist.emergencyKitAndExtinguisher === "Pass" ? "text-emerald-600" : insp.checklist.emergencyKitAndExtinguisher === "Warning" ? "text-amber-600" : "text-rose-600"}`}>
                            {insp.checklist.emergencyKitAndExtinguisher}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              insp.overallStatus === "Passed"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-rose-500/10 text-rose-600"
                            }`}
                          >
                            {insp.overallStatus}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {insp.escalatedToRepairId ? (
                            <span className="text-[11px] font-mono font-semibold text-blue-600" title="Linked to Repair Logger">
                              WO: {insp.escalatedToRepairId}
                            </span>
                          ) : insp.overallStatus === "Defect Flagged" ? (
                            <button
                              onClick={() => {
                                setDefectToEscalate({
                                  inspectionId: insp.id,
                                  vehiclePlate: insp.vehiclePlate,
                                  defectNote: insp.notes,
                                });
                                setIsEscalateModalOpen(true);
                              }}
                              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/30 rounded text-[10px] font-bold transition-all"
                            >
                              ⚡ Escalate to Repair
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">Clear</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <TablePaginationFooter
              currentPage={inspectionPage}
              totalItems={filteredInspections.length}
              pageSize={pageSize}
              onPageChange={setInspectionPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}

        {/* =====================================================================
            TAB 4: VEHICLE PAPERS & EXPIRY TRACKER
        ====================================================================== */}
        {activeTab === "papers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Statutory Vehicle Papers & Expiry Countdown
                </h4>
                <p className="text-xs text-slate-500">
                  Real-time validity tracker: Hackney Permit, Road Worthiness, Vehicle License, and Insurance.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="p-3.5">Vehicle Unit</th>
                    <th className="p-3.5">Division / Region</th>
                    <th className="p-3.5">Hackney Permit</th>
                    <th className="p-3.5">Road Worthiness</th>
                    <th className="p-3.5">Vehicle License</th>
                    <th className="p-3.5">Proof / Insurance</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No vehicle document records registered.
                      </td>
                    </tr>
                  ) : (
                    paginatedPapersVehicles.map((veh) => {
                      const renderDocCell = (doc: DocumentRecord) => (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                doc.status === "Expired"
                                  ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                  : doc.status === "Expiring Soon"
                                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              }`}
                            >
                              {doc.daysRemaining < 0
                                ? `Expired (${Math.abs(doc.daysRemaining)}d ago)`
                                : `${doc.daysRemaining} days remaining`}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">
                            Expires: {doc.expiringDate} • ₦{doc.renewalAmount.toLocaleString()}
                          </p>
                        </div>
                      );

                      return (
                        <tr key={veh.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3.5">
                            <span className="font-bold font-mono text-slate-900">{veh.plateNumber}</span>
                            <p className="text-[10px] text-slate-500">{veh.vehicleType}</p>
                          </td>
                          <td className="p-3.5 text-slate-600">
                            {veh.region}
                          </td>
                          <td className="p-3.5">{renderDocCell(veh.documents.hackney)}</td>
                          <td className="p-3.5">{renderDocCell(veh.documents.roadWorthiness)}</td>
                          <td className="p-3.5">{renderDocCell(veh.documents.license)}</td>
                          <td className="p-3.5">{renderDocCell(veh.documents.insurance)}</td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => {
                                setPaperForm({
                                  vehiclePlate: veh.plateNumber,
                                  docType: "hackney",
                                  renewedDate: new Date().toISOString().split("T")[0],
                                  expiringDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                                  renewalAmount: 25000,
                                  docRefNumber: ""
                                });
                                setIsPaperModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 border border-rose-500/30 rounded text-xs font-semibold transition-all"
                            >
                              Renew
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <TablePaginationFooter
              currentPage={papersPage}
              totalItems={filteredVehicles.length}
              pageSize={pageSize}
              onPageChange={setPapersPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}

        {/* =====================================================================
            TAB 5: MAINTENANCE & REPAIRS TAT LOGGER
        ====================================================================== */}
        {activeTab === "maintenance" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Workshop Repairs & Turn Around Time (TAT) Logger
                </h4>
                <p className="text-xs text-slate-500">
                  Track parts replacements, damaged date, repaired date, SLA duration in days, and JCC certificates.
                </p>
              </div>
              <NexaButton
                size="sm"
                variant="primary"
                onClick={() => {
                  setRepairForm({
                    ...repairForm,
                    vehiclePlate: vehicles[0]?.plateNumber || ""
                  });
                  setIsRepairModalOpen(true);
                }}
                className="gap-2 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Log Part Repair Order
              </NexaButton>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="p-3.5">Work Order #</th>
                    <th className="p-3.5">Vehicle Unit</th>
                    <th className="p-3.5">Part / Description</th>
                    <th className="p-3.5">Category & Vendor</th>
                    <th className="p-3.5 text-center">Damaged Date</th>
                    <th className="p-3.5 text-center">Repaired Date</th>
                    <th className="p-3.5 text-center">TAT (Days)</th>
                    <th className="p-3.5">Cost (₦)</th>
                    <th className="p-3.5">Status & JCC</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredRepairs.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-500">
                        No workshop repair orders recorded.
                      </td>
                    </tr>
                  ) : (
                    paginatedRepairs.map((rep) => {
                      const isOverSla = rep.tatDays > 3;

                      return (
                        <tr key={rep.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-slate-900">
                            {rep.workOrderNumber}
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold font-mono text-slate-900">{rep.vehiclePlate}</span>
                            <p className="text-[10px] text-slate-500">{rep.vehicleType}</p>
                          </td>
                          <td className="p-3.5">
                            <p className="font-semibold text-slate-900">{rep.partName}</p>
                            <p className="text-[10px] text-slate-500">{rep.remark}</p>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              {rep.category}
                            </span>
                            <p className="text-[10px] text-slate-500 mt-1">{rep.workshopVendor}</p>
                          </td>
                          <td className="p-3.5 text-center font-mono text-slate-600">{rep.damagedDate}</td>
                          <td className="p-3.5 text-center font-mono text-slate-600">{rep.repairedDate || "In Progress"}</td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                isOverSla
                                  ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              }`}
                            >
                              {rep.tatDays} {rep.tatDays === 1 ? "day" : "days"}
                            </span>
                            {isOverSla && (
                              <p className="text-[9px] text-rose-500 mt-0.5 font-semibold">Exceeded 72h SLA</p>
                            )}
                          </td>
                          <td className="p-3.5 font-bold font-mono text-slate-900">
                            ₦{rep.costAmount.toLocaleString()}
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                                  rep.status === "Repaired & Cleared"
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : rep.status === "In Workshop"
                                    ? "bg-amber-500/10 text-amber-600"
                                    : "bg-purple-500/10 text-purple-600"
                                }`}
                              >
                                {rep.status}
                              </span>
                              {rep.jccSignedOff && (
                                <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-semibold">
                                  ✓ JCC Signed
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 text-right">
                            {!rep.jccSignedOff && (
                              <button
                                onClick={() => handleSignJcc(rep.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-all shadow-xs"
                              >
                                Sign JCC
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <TablePaginationFooter
              currentPage={repairsPage}
              totalItems={filteredRepairs.length}
              pageSize={pageSize}
              onPageChange={setRepairsPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}

      </div>

      {/* =====================================================================
          MODAL 1: DRIVER ASSIGNMENT
      ====================================================================== */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-900">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Assign Driver to Vehicle
              </h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignDriver} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Vehicle Unit</label>
                <select
                  value={assignForm.plateNumber}
                  onChange={(e) => setAssignForm({ ...assignForm, plateNumber: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.plateNumber}>
                      {v.plateNumber} - {v.vehicleType} ({v.region})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Select from Driver Pool</label>
                <select
                  value={assignForm.driverId}
                  onChange={(e) => {
                    const found = drivers.find((d) => d.id === e.target.value);
                    setAssignForm({
                      ...assignForm,
                      driverId: e.target.value,
                      newDriverName: found ? found.name : "",
                      phone: found ? found.phone : "",
                      lasdriCertified: found ? found.lasdriCertified : true
                    });
                  }}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose Driver (or Type Below) --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.status} - {d.region})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Driver Name</label>
                <input
                  type="text"
                  value={assignForm.newDriverName}
                  onChange={(e) => setAssignForm({ ...assignForm, newDriverName: e.target.value })}
                  placeholder="e.g. Babatunde Balogun"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Phone Number</label>
                <input
                  type="text"
                  value={assignForm.phone}
                  onChange={(e) => setAssignForm({ ...assignForm, phone: e.target.value })}
                  placeholder="+234 803 xxx xxxx"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="lasdriCheck"
                  checked={assignForm.lasdriCertified}
                  onChange={(e) => setAssignForm({ ...assignForm, lasdriCertified: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="lasdriCheck" className="text-xs text-slate-700 font-medium">
                  Driver holds verified LASDRI Certification (Lagos Stage Carriage)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <NexaButton type="submit" size="sm" variant="primary">
                  Confirm Assignment
                </NexaButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: ROUTINE INSPECTION (Strictly separate from repairs)
      ====================================================================== */}
      {isInspectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 my-8 text-slate-900">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-500" />
                Log Routine Inspection (Non-Repair Audit)
              </h3>
              <button onClick={() => setIsInspectionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogInspection} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Vehicle Unit</label>
                  <select
                    value={inspectionForm.vehiclePlate}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, vehiclePlate: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">-- Select Vehicle --</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.plateNumber}>
                        {v.plateNumber} ({v.vehicleType})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Inspection Type</label>
                  <select
                    value={inspectionForm.inspectionType}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, inspectionType: e.target.value as any })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Pre-Trip Daily">Pre-Trip Daily</option>
                    <option value="Post-Trip Return">Post-Trip Return</option>
                    <option value="Weekly Safety">Weekly Safety Audit</option>
                    <option value="Monthly Roadworthiness">Monthly Roadworthiness</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Inspector Name</label>
                  <input
                    type="text"
                    value={inspectionForm.inspectorName}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, inspectorName: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Odometer (km)</label>
                  <input
                    type="number"
                    value={inspectionForm.odometerReadingKm}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, odometerReadingKm: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* 6-Point Checklist */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-900 mb-1">Routine Inspection Checklist:</p>
                
                {[
                  { key: "tyres", label: "Tyres & Tread Pressure (> 3.5mm)", stateKey: "tyres" },
                  { key: "brakes", label: "Brakes & Fluid Reservoir Levels", stateKey: "brakes" },
                  { key: "fluids", label: "Engine Oil, Coolant & Washer Fluid", stateKey: "fluids" },
                  { key: "lights", label: "Headlights, Hazards, Brake & Reverse Lights", stateKey: "lights" },
                  { key: "windscreen", label: "Windscreen Glass, Mirrors & Wipers", stateKey: "windscreen" },
                  { key: "emergencyKit", label: "Fire Extinguisher, C-Caution & Jack", stateKey: "emergencyKit" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-1.5 border-b border-slate-200/60 last:border-0 text-xs">
                    <span className="text-slate-800 font-medium">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      {(["Pass", "Warning", "Fail"] as InspectionCheckStatus[]).map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setInspectionForm({ ...inspectionForm, [item.stateKey]: val })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            (inspectionForm as any)[item.stateKey] === val
                              ? val === "Pass"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : val === "Warning"
                                ? "bg-amber-600 text-white shadow-sm"
                                : "bg-rose-600 text-white shadow-sm"
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Observations & Inspector Remarks</label>
                <textarea
                  value={inspectionForm.notes}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, notes: e.target.value })}
                  placeholder="Record specific defect details or pre-trip clearance notes..."
                  rows={2}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsInspectionModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <NexaButton type="submit" size="sm" variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Save Routine Inspection
                </NexaButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: ESCALATE INSPECTION DEFECT TO REPAIR (TAT)
      ====================================================================== */}
      {isEscalateModalOpen && defectToEscalate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-900">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Escalate Inspection Defect to Repair
              </h3>
              <button onClick={() => setIsEscalateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEscalateToRepair} className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-800">
                <p className="font-bold">Vehicle: {defectToEscalate.vehiclePlate}</p>
                <p className="mt-1 opacity-90">{defectToEscalate.defectNote}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Workshop Garage / Vendor</label>
                <input
                  type="text"
                  placeholder="e.g. Authorized Dealership Garage"
                  value={repairForm.workshopVendor}
                  onChange={(e) => setRepairForm({ ...repairForm, workshopVendor: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Estimated Repair Cost (₦)</label>
                <input
                  type="number"
                  value={repairForm.costAmount}
                  onChange={(e) => setRepairForm({ ...repairForm, costAmount: Number(e.target.value) })}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEscalateModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <NexaButton type="submit" size="sm" variant="primary" className="bg-amber-600 hover:bg-amber-700 text-white">
                  Create Work Order & Ground Vehicle
                </NexaButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: VEHICLE PAPER RENEWAL
      ====================================================================== */}
      {isPaperModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-900">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-500" />
                Record Document Renewal
              </h3>
              <button onClick={() => setIsPaperModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRenewDocument} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Vehicle Plate</label>
                <select
                  value={paperForm.vehiclePlate}
                  onChange={(e) => setPaperForm({ ...paperForm, vehiclePlate: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.plateNumber}>
                      {v.plateNumber} ({v.region})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Document Type</label>
                <select
                  value={paperForm.docType}
                  onChange={(e) => setPaperForm({ ...paperForm, docType: e.target.value as DocumentType })}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="hackney">Hackney Permit</option>
                  <option value="roadWorthiness">Road Worthiness</option>
                  <option value="license">Vehicle License</option>
                  <option value="insurance">Proof of Ownership / Insurance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">New Renewal Date</label>
                  <input
                    type="date"
                    value={paperForm.renewedDate}
                    onChange={(e) => setPaperForm({ ...paperForm, renewedDate: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">New Expiry Date</label>
                  <input
                    type="date"
                    value={paperForm.expiringDate}
                    onChange={(e) => setPaperForm({ ...paperForm, expiringDate: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Renewal Cost (₦)</label>
                <input
                  type="number"
                  value={paperForm.renewalAmount}
                  onChange={(e) => setPaperForm({ ...paperForm, renewalAmount: Number(e.target.value) })}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Certificate / Ref Number</label>
                <input
                  type="text"
                  value={paperForm.docRefNumber}
                  onChange={(e) => setPaperForm({ ...paperForm, docRefNumber: e.target.value })}
                  placeholder="e.g. HAK-2026-90"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPaperModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <NexaButton type="submit" size="sm" variant="primary" className="bg-rose-600 hover:bg-rose-700 text-white">
                  Update Paper Expiry
                </NexaButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 5: LOG PART REPAIR & TAT
      ====================================================================== */}
      {isRepairModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-900">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-500" />
                Log Part Repair & Workshop TAT
              </h3>
              <button onClick={() => setIsRepairModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogPartRepair} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Vehicle Unit</label>
                <select
                  value={repairForm.vehiclePlate}
                  onChange={(e) => setRepairForm({ ...repairForm, vehiclePlate: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.plateNumber}>
                      {v.plateNumber} - {v.vehicleType} ({v.region})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Part Name / Fault Description</label>
                <input
                  type="text"
                  value={repairForm.partName}
                  onChange={(e) => setRepairForm({ ...repairForm, partName: e.target.value })}
                  placeholder="e.g. Front Shock Absorbers, Brake Caliper Kit"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">System Category</label>
                  <select
                    value={repairForm.category}
                    onChange={(e) => setRepairForm({ ...repairForm, category: e.target.value as any })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Brakes">Brakes</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Cooling">Cooling</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Tyres">Tyres</option>
                    <option value="Transmission">Transmission</option>
                    <option value="Engine">Engine</option>
                    <option value="Bodywork">Bodywork</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Damaged Date</label>
                  <input
                    type="date"
                    value={repairForm.damagedDate}
                    onChange={(e) => setRepairForm({ ...repairForm, damagedDate: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Repair Cost (₦)</label>
                  <input
                    type="number"
                    value={repairForm.costAmount}
                    onChange={(e) => setRepairForm({ ...repairForm, costAmount: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Workshop Vendor</label>
                  <input
                    type="text"
                    placeholder="e.g. Authorized Dealer Garage"
                    value={repairForm.workshopVendor}
                    onChange={(e) => setRepairForm({ ...repairForm, workshopVendor: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Mechanic Remark / Notes</label>
                <textarea
                  value={repairForm.remark}
                  onChange={(e) => setRepairForm({ ...repairForm, remark: e.target.value })}
                  placeholder="Details on spare parts sourced, warranty, mechanic observations..."
                  rows={2}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRepairModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <NexaButton type="submit" size="sm" variant="primary" className="bg-amber-600 hover:bg-amber-700 text-white">
                  Log Repair Work Order
                </NexaButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 6: REGISTER VEHICLE UNIT
      ====================================================================== */}
      {isAddVehicleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 my-8 text-slate-900">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Register Vehicle Unit to Fleet
              </h3>
              <button onClick={() => setIsAddVehicleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">License Plate Number</label>
                  <input
                    type="text"
                    placeholder="e.g. KSF-882-AB"
                    value={vehicleForm.plateNumber}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, plateNumber: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 uppercase font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Vehicle Make / Model</label>
                  <input
                    type="text"
                    placeholder="e.g. Toyota Hilux 4x4, Coaster Bus"
                    value={vehicleForm.vehicleType}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Operational Division / Region</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Fleet, North Depot, Transit Line"
                    value={vehicleForm.region}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, region: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Assign Driver (Optional)</label>
                  <select
                    value={vehicleForm.assignedDriverName}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, assignedDriverName: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Leave Unassigned --</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Document Expiries Setup */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <p className="text-xs font-bold text-slate-900">Vehicle Papers & Expiry Dates:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-500">Hackney Permit Expiry</label>
                    <input
                      type="date"
                      value={vehicleForm.hackneyExpiry}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, hackneyExpiry: e.target.value })}
                      className="w-full mt-0.5 p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Road Worthiness Expiry</label>
                    <input
                      type="date"
                      value={vehicleForm.roadWorthinessExpiry}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, roadWorthinessExpiry: e.target.value })}
                      className="w-full mt-0.5 p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Vehicle License Expiry</label>
                    <input
                      type="date"
                      value={vehicleForm.licenseExpiry}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, licenseExpiry: e.target.value })}
                      className="w-full mt-0.5 p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Insurance Expiry</label>
                    <input
                      type="date"
                      value={vehicleForm.insuranceExpiry}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, insuranceExpiry: e.target.value })}
                      className="w-full mt-0.5 p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <NexaButton type="submit" size="sm" variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Register Vehicle
                </NexaButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpAdminShell>
  );
}
