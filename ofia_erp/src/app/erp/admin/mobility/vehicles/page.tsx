"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Truck,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Fuel,
  Gauge,
  Wrench,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Calendar,
  Sparkles,
  SlidersHorizontal,
  BarChart3,
  ChevronRight,
  X,
  Info,
  Car,
  Users,
  RefreshCw,
  Clock,
  Layers,
  FileText,
  Activity
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { Pagination } from "@/components/nexa/Pagination";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant, extractSubdomainOrParam } from "@/lib/tenant-context";

// --- Types & Data Interfaces ---

export interface VehicleFinancials {
  id: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  type: "Coaster Bus" | "Minibus" | "Executive Van" | "Sedan" | "Coach";
  seats: number;
  status: "active" | "maintenance" | "idle";
  assignedDriver: string;
  driverId: string;
  serviceType: string;
  acquisitionCost: number; // in NGN
  paybackHorizonMonths: number;
  totalMonthsActive: number;

  // Monthly Financial Metrics (MTD / Last 30 Days)
  monthlyRevenue: number;
  monthlyDistanceKm: number;

  // Operating Costs Breakdown
  fuelLitres: number;
  fuelPricePerLitre: number;
  fuelTargetKmPerLitre: number;
  maintenanceCost: number;
  driverWageCost: number;
  fixedCostMonthly: number; // Insurance, Tracker, Permits, Amortized CapEx

  // Maintenance & Health
  healthScore: number; // 0-100
  lastServiceDate: string;
  nextServiceMileage: number;
  currentMileage: number;
}

export interface FuelRefillLog {
  id: string;
  vehicleId: string;
  plate: string;
  date: string;
  litres: number;
  pricePerLitre: number;
  totalCost: number;
  odometerKm: number;
  driver: string;
  station: string;
  efficiencyKmPerLitre?: number;
}

// Initial Rich Seed Data representing realistic Nigerian transport fleet operations
const INITIAL_VEHICLES: VehicleFinancials[] = [
  {
    id: "veh-1",
    plate: "AAA-17JL",
    make: "Toyota",
    model: "Coaster",
    year: 2018,
    type: "Coaster Bus",
    seats: 28,
    status: "active",
    assignedDriver: "Mr. Ajit Adeleke",
    driverId: "DRV-102",
    serviceType: "Corporate Staff Transport & Shuttle",
    acquisitionCost: 28000000,
    paybackHorizonMonths: 36,
    totalMonthsActive: 19,
    monthlyRevenue: 2450000,
    monthlyDistanceKm: 4800,
    fuelLitres: 800,
    fuelPricePerLitre: 950,
    fuelTargetKmPerLitre: 6.2,
    maintenanceCost: 115000,
    driverWageCost: 180000,
    fixedCostMonthly: 120000,
    healthScore: 92,
    lastServiceDate: "Sep 22, 2026",
    nextServiceMileage: 145000,
    currentMileage: 141200
  },
  {
    id: "veh-2",
    plate: "GGE-990KL",
    make: "Toyota",
    model: "Hiace Commuter",
    year: 2021,
    type: "Minibus",
    seats: 14,
    status: "active",
    assignedDriver: "Michael Okon",
    driverId: "DRV-801",
    serviceType: "Interstate Express & Airport Shuttle",
    acquisitionCost: 18500000,
    paybackHorizonMonths: 30,
    totalMonthsActive: 14,
    monthlyRevenue: 1920000,
    monthlyDistanceKm: 6100,
    fuelLitres: 670,
    fuelPricePerLitre: 950,
    fuelTargetKmPerLitre: 9.5,
    maintenanceCost: 145000,
    driverWageCost: 160000,
    fixedCostMonthly: 85000,
    healthScore: 88,
    lastServiceDate: "Sep 28, 2026",
    nextServiceMileage: 92000,
    currentMileage: 88400
  },
  {
    id: "veh-3",
    plate: "LSR-901KT",
    make: "Mercedes-Benz",
    model: "Sprinter 516 VIP",
    year: 2020,
    type: "Executive Van",
    seats: 19,
    status: "active",
    assignedDriver: "Babatunde Alao",
    driverId: "DRV-304",
    serviceType: "VIP Bus Rental & Executive Charters",
    acquisitionCost: 34000000,
    paybackHorizonMonths: 42,
    totalMonthsActive: 22,
    monthlyRevenue: 2850000,
    monthlyDistanceKm: 3600,
    fuelLitres: 440,
    fuelPricePerLitre: 950,
    fuelTargetKmPerLitre: 8.5,
    maintenanceCost: 95000,
    driverWageCost: 200000,
    fixedCostMonthly: 150000,
    healthScore: 94,
    lastServiceDate: "Oct 01, 2026",
    nextServiceMileage: 110000,
    currentMileage: 104500
  },
  {
    id: "veh-4",
    plate: "AAA-123XY",
    make: "Toyota",
    model: "Camry V6",
    year: 2015,
    type: "Sedan",
    seats: 4,
    status: "maintenance",
    assignedDriver: "Unassigned",
    driverId: "",
    serviceType: "On-Demand Executive Ride",
    acquisitionCost: 7500000,
    paybackHorizonMonths: 24,
    totalMonthsActive: 38,
    monthlyRevenue: 490000,
    monthlyDistanceKm: 1850,
    fuelLitres: 285,
    fuelPricePerLitre: 950,
    fuelTargetKmPerLitre: 8.2,
    maintenanceCost: 380000, // Massive repair costs
    driverWageCost: 110000,
    fixedCostMonthly: 60000,
    healthScore: 41,
    lastServiceDate: "Oct 04, 2026",
    nextServiceMileage: 215000,
    currentMileage: 214800
  },
  {
    id: "veh-5",
    plate: "KJA-992BB",
    make: "Hyundai",
    model: "County Commercial",
    year: 2019,
    type: "Coaster Bus",
    seats: 30,
    status: "active",
    assignedDriver: "Samuel Eze",
    driverId: "DRV-409",
    serviceType: "School Bus Transport Subscriptions",
    acquisitionCost: 22000000,
    paybackHorizonMonths: 36,
    totalMonthsActive: 16,
    monthlyRevenue: 1650000,
    monthlyDistanceKm: 2750,
    fuelLitres: 480,
    fuelPricePerLitre: 950,
    fuelTargetKmPerLitre: 6.0,
    maintenanceCost: 80000,
    driverWageCost: 150000,
    fixedCostMonthly: 90000,
    healthScore: 89,
    lastServiceDate: "Sep 15, 2026",
    nextServiceMileage: 75000,
    currentMileage: 71200
  }
];

const INITIAL_FUEL_LOGS: FuelRefillLog[] = [
  {
    id: "fuel-101",
    vehicleId: "veh-1",
    plate: "AAA-17JL",
    date: "Oct 08, 2026 07:15 AM",
    litres: 85,
    pricePerLitre: 950,
    totalCost: 80750,
    odometerKm: 141200,
    driver: "Mr. Ajit Adeleke",
    station: "TotalEnergies Lekki Phase 1",
    efficiencyKmPerLitre: 6.0
  },
  {
    id: "fuel-102",
    vehicleId: "veh-2",
    plate: "GGE-990KL",
    date: "Oct 07, 2026 05:40 PM",
    litres: 60,
    pricePerLitre: 950,
    totalCost: 57000,
    odometerKm: 88400,
    driver: "Michael Okon",
    station: "NNPC Retail Berger",
    efficiencyKmPerLitre: 9.1
  },
  {
    id: "fuel-103",
    vehicleId: "veh-3",
    plate: "LSR-901KT",
    date: "Oct 06, 2026 09:30 AM",
    litres: 75,
    pricePerLitre: 950,
    totalCost: 71250,
    odometerKm: 104500,
    driver: "Babatunde Alao",
    station: "Mobil Victoria Island",
    efficiencyKmPerLitre: 8.2
  },
  {
    id: "fuel-104",
    vehicleId: "veh-4",
    plate: "AAA-123XY",
    date: "Oct 03, 2026 02:10 PM",
    litres: 55,
    pricePerLitre: 950,
    totalCost: 52250,
    odometerKm: 214800,
    driver: "Mr. Ajit Adeleke (Temp)",
    station: "Conoil Ikeja GRA",
    efficiencyKmPerLitre: 6.4 // Below expected 8.2
  }
];

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

export default function CorporateVehiclesPage() {
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);
  const tenantSlug = activeTenant?.slug || extractSubdomainOrParam() || "";

  const [vehicles, setVehicles] = useState<VehicleFinancials[]>(INITIAL_VEHICLES);
  const [fuelLogs, setFuelLogs] = useState<FuelRefillLog[]>(INITIAL_FUEL_LOGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<"matrix" | "fuel_telemetry" | "simulator">("matrix");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roiFilter, setRoiFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Pagination
  const [pageSize, setPageSize] = useState<number>(15);
  const [matrixPage, setMatrixPage] = useState<number>(1);
  const [fuelPage, setFuelPage] = useState<number>(1);

  // Selected Vehicle for Financial Deep Dive Modal
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleFinancials | null>(null);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);

  // Fuel modal form state
  const [fuelForm, setFuelForm] = useState({
    vehicleId: "",
    litres: 65,
    pricePerLitre: 1370,
    odometerKm: 141300,
    station: "TotalEnergies Lekki Phase 1"
  });

  // Register modal form state
  const [registerForm, setRegisterForm] = useState({
    makeModel: "",
    plate: "",
    category: "Coaster Bus" as VehicleFinancials["type"],
    seats: 28,
    region: "Lagos",
    acquisitionCost: 38000000,
    fuelEconomyTarget: 6.5,
    paybackHorizon: 36
  });

  // Simulator State
  const [simFuelPriceChange, setSimFuelPriceChange] = useState<number>(0);
  const [simUtilizationChange, setSimUtilizationChange] = useState<number>(0);

  // Fetch live fleet data from API
  const fetchFleetData = async () => {
    if (!tenantSlug) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/erp/mobility/vehicles?tenant=${tenantSlug}`);
      const data = await res.json();
      if (data.success && data.vehicles) {
        setVehicles(data.vehicles);
        if (data.fuelLogs) {
          setFuelLogs(data.fuelLogs);
        }
        if (data.vehicles.length > 0 && !fuelForm.vehicleId) {
          setFuelForm((prev) => ({ ...prev, vehicleId: data.vehicles[0].id }));
        }
      }
    } catch (err) {
      console.error("[Corporate Vehicles] Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFleetData();
  }, [tenantSlug]);

  // Reset pagination when search / filter changes
  useEffect(() => {
    setMatrixPage(1);
    setFuelPage(1);
  }, [searchQuery, statusFilter, roiFilter]);

  // Handle Register Vehicle Submission
  const handleRegisterVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.plate.trim() || !tenantSlug) return;
    try {
      setIsSaving(true);
      const res = await fetch("/api/erp/mobility/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-tenant-slug": tenantSlug },
        body: JSON.stringify({
          action: "register_vehicle",
          ...registerForm,
          tenantSlug
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsRegisterModalOpen(false);
        setRegisterForm({
          makeModel: "",
          plate: "",
          category: "Coaster Bus",
          seats: 28,
          region: "Lagos",
          acquisitionCost: 38000000,
          fuelEconomyTarget: 6.5,
          paybackHorizon: 36
        });
        await fetchFleetData();
      } else {
        alert(data.error || "Failed to register vehicle");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Fuel Refill Submission
  const handleLogFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetVeh = vehicles.find((v) => v.id === fuelForm.vehicleId) || vehicles[0];
    if (!targetVeh || !tenantSlug) return;

    try {
      setIsSaving(true);
      const res = await fetch("/api/erp/mobility/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-tenant-slug": tenantSlug },
        body: JSON.stringify({
          action: "log_fuel",
          vehicleId: targetVeh.id,
          plate: targetVeh.plate,
          litres: fuelForm.litres,
          pricePerLitre: fuelForm.pricePerLitre,
          odometerKm: fuelForm.odometerKm,
          station: fuelForm.station,
          tenantSlug
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsFuelModalOpen(false);
        await fetchFleetData();
      } else {
        alert(data.error || "Failed to log fuel refill");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Calculations Helper Functions ---

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString("en-NG")}`;
  };

  const getVehicleCalculations = (v: VehicleFinancials) => {
    const fuelCost = v.fuelLitres * (v.fuelPricePerLitre + simFuelPriceChange);
    const totalOperatingCost = fuelCost + v.maintenanceCost + v.driverWageCost + v.fixedCostMonthly;
    const adjustedRevenue = v.monthlyRevenue * (1 + simUtilizationChange / 100);
    const netOperatingProfit = adjustedRevenue - totalOperatingCost;
    const operatingMarginPct = adjustedRevenue > 0 ? (netOperatingProfit / adjustedRevenue) * 100 : 0;

    // Monthly Operating Return on Investment (ROI)
    const monthlyRoiPct = totalOperatingCost > 0 ? (netOperatingProfit / totalOperatingCost) * 100 : 0;

    // Actual Fuel Efficiency (km / Litre)
    const actualKmPerLitre = v.fuelLitres > 0 ? Number((v.monthlyDistanceKm / v.fuelLitres).toFixed(1)) : 0;
    const fuelEfficiencyVariance = v.fuelTargetKmPerLitre > 0
      ? Number((((actualKmPerLitre - v.fuelTargetKmPerLitre) / v.fuelTargetKmPerLitre) * 100).toFixed(1))
      : 0;

    // Cost Per Kilometer (CPK) & Revenue Per Kilometer (RPK)
    const cpk = v.monthlyDistanceKm > 0 ? Math.round(totalOperatingCost / v.monthlyDistanceKm) : 0;
    const rpk = v.monthlyDistanceKm > 0 ? Math.round(adjustedRevenue / v.monthlyDistanceKm) : 0;
    const fuelCostPerKm = v.monthlyDistanceKm > 0 ? Math.round(fuelCost / v.monthlyDistanceKm) : 0;

    // CapEx Payback Horizon calculation
    const monthlyDepreciation = v.paybackHorizonMonths > 0 ? v.acquisitionCost / v.paybackHorizonMonths : 0;
    const netCashflowWithCapEx = netOperatingProfit - monthlyDepreciation;
    const monthsToFullPayback = netOperatingProfit > 0 ? Number((v.acquisitionCost / netOperatingProfit).toFixed(1)) : 999;
    const percentCapExRecovered = Math.min(100, Math.round((v.totalMonthsActive / (v.acquisitionCost / (netOperatingProfit > 0 ? netOperatingProfit : 1))) * 100));

    // Health Category
    let healthCategory: "excellent" | "healthy" | "watch" | "danger" = "healthy";
    if (monthlyRoiPct >= 80 && actualKmPerLitre >= v.fuelTargetKmPerLitre * 0.95) {
      healthCategory = "excellent";
    } else if (monthlyRoiPct >= 40) {
      healthCategory = "healthy";
    } else if (monthlyRoiPct >= 0) {
      healthCategory = "watch";
    } else {
      healthCategory = "danger";
    }

    return {
      fuelCost,
      totalOperatingCost,
      adjustedRevenue,
      netOperatingProfit,
      operatingMarginPct,
      monthlyRoiPct,
      actualKmPerLitre,
      fuelEfficiencyVariance,
      cpk,
      rpk,
      fuelCostPerKm,
      monthlyDepreciation,
      netCashflowWithCapEx,
      monthsToFullPayback,
      percentCapExRecovered,
      healthCategory
    };
  };

  // --- Aggregate Fleet Metrics ---

  const fleetMetrics = useMemo(() => {
    let totalRevenue = 0;
    let totalOperatingCost = 0;
    let totalFuelSpend = 0;
    let totalFuelLitres = 0;
    let totalDistanceKm = 0;
    let totalMaintenance = 0;
    let totalDriverWages = 0;

    vehicles.forEach((v) => {
      const calc = getVehicleCalculations(v);
      totalRevenue += calc.adjustedRevenue;
      totalOperatingCost += calc.totalOperatingCost;
      totalFuelSpend += calc.fuelCost;
      totalFuelLitres += v.fuelLitres;
      totalDistanceKm += v.monthlyDistanceKm;
      totalMaintenance += v.maintenanceCost;
      totalDriverWages += v.driverWageCost;
    });

    const activeVehiclesCount = vehicles.filter((v) => v.status === "active").length || 1;
    const totalVehiclesCount = vehicles.length || 1;
    const avgRevenuePerVehicle = Math.round(totalRevenue / totalVehiclesCount);
    const avgCostPerVehicle = Math.round(totalOperatingCost / totalVehiclesCount);
    const avgNetProfitPerVehicle = avgRevenuePerVehicle - avgCostPerVehicle;
    const fleetNetMargin = totalRevenue > 0 ? ((totalRevenue - totalOperatingCost) / totalRevenue) * 100 : 0;
    const fleetAverageRoi = totalOperatingCost > 0 ? ((totalRevenue - totalOperatingCost) / totalOperatingCost) * 100 : 0;
    const fleetAvgFuelEfficiency = totalFuelLitres > 0 ? Number((totalDistanceKm / totalFuelLitres).toFixed(1)) : 0;
    const fleetAvgCpk = totalDistanceKm > 0 ? Math.round(totalOperatingCost / totalDistanceKm) : 0;

    return {
      totalRevenue,
      totalOperatingCost,
      totalFuelSpend,
      totalFuelLitres,
      totalDistanceKm,
      totalMaintenance,
      totalDriverWages,
      activeVehiclesCount,
      totalVehiclesCount,
      avgRevenuePerVehicle,
      avgCostPerVehicle,
      avgNetProfitPerVehicle,
      fleetNetMargin,
      fleetAverageRoi,
      fleetAvgFuelEfficiency,
      fleetAvgCpk
    };
  }, [vehicles, simFuelPriceChange, simUtilizationChange]);

  // --- Filtered Vehicles ---

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.assignedDriver.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || v.status === statusFilter;

      const calc = getVehicleCalculations(v);
      const matchesRoi =
        roiFilter === "all" ||
        (roiFilter === "excellent" && calc.healthCategory === "excellent") ||
        (roiFilter === "healthy" && calc.healthCategory === "healthy") ||
        (roiFilter === "watch" && calc.healthCategory === "watch") ||
        (roiFilter === "danger" && calc.healthCategory === "danger");

      return matchesSearch && matchesStatus && matchesRoi;
    });
  }, [vehicles, searchQuery, statusFilter, roiFilter, simFuelPriceChange, simUtilizationChange]);

  // Paginated Slices
  const paginatedVehicles = useMemo(() => {
    const start = (matrixPage - 1) * pageSize;
    return filteredVehicles.slice(start, start + pageSize);
  }, [filteredVehicles, matrixPage, pageSize]);

  const paginatedFuelLogs = useMemo(() => {
    const start = (fuelPage - 1) * pageSize;
    return fuelLogs.slice(start, start + pageSize);
  }, [fuelLogs, fuelPage, pageSize]);

  return (
    <ErpAdminShell
      title="Corporate Vehicles, Unit Economics & ROI"
      subtitle="Track Cost/Vehicle, Revenue/Vehicle, and Fuel Consumption telemetry across your operating fleet."
      activeModule="mobility"
      action={
        <div className="flex items-center gap-2.5">
          <NexaButton
            size="sm"
            variant="outline"
            onClick={() => setIsFuelModalOpen(true)}
            className="gap-2 text-xs border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
          >
            <Fuel className="w-3.5 h-3.5" />
            Log Fuel Refill
          </NexaButton>
          <NexaButton
            size="sm"
            variant="primary"
            onClick={() => setIsRegisterModalOpen(true)}
            className="gap-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            Register Vehicle
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-8">
        {/* --- Top Fleet Executive Telemetry Bar --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue / Vehicle */}
          <div className="p-5 bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-semibold text-nexa-text-secondary uppercase tracking-wider">
                  Avg Revenue / Vehicle
                </span>
                <p className="text-2xl font-black text-nexa-text-primary mt-1">
                  {formatNaira(fleetMetrics.avgRevenuePerVehicle)}
                  <span className="text-xs font-medium text-nexa-text-secondary ml-1">/ mo</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-3 border-t border-nexa-border/60 flex items-center justify-between text-xs">
              <span className="text-nexa-text-secondary">
                Fleet Total: <strong className="text-nexa-text-primary">{formatNaira(fleetMetrics.totalRevenue)}</strong>
              </span>
              <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% MoM
              </span>
            </div>
          </div>

          {/* Cost / Vehicle */}
          <div className="p-5 bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-semibold text-nexa-text-secondary uppercase tracking-wider">
                  Avg Cost / Vehicle (OpEx)
                </span>
                <p className="text-2xl font-black text-nexa-text-primary mt-1">
                  {formatNaira(fleetMetrics.avgCostPerVehicle)}
                  <span className="text-xs font-medium text-nexa-text-secondary ml-1">/ mo</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-3 border-t border-nexa-border/60 flex items-center justify-between text-xs">
              <span className="text-nexa-text-secondary">
                Avg Cost/KM: <strong className="text-nexa-text-primary">₦{fleetMetrics.fleetAvgCpk}/km</strong>
              </span>
              <span className="text-nexa-text-secondary">
                Fuel + Repairs + Wage
              </span>
            </div>
          </div>

          {/* Fuel Consumption & Efficiency */}
          <div className="p-5 bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-semibold text-nexa-text-secondary uppercase tracking-wider">
                  Fuel Usage & Efficiency
                </span>
                <p className="text-2xl font-black text-nexa-text-primary mt-1">
                  {fleetMetrics.totalFuelLitres.toLocaleString()}
                  <span className="text-xs font-semibold text-blue-500 ml-1">Litres</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                <Fuel className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-3 border-t border-nexa-border/60 flex items-center justify-between text-xs">
              <span className="text-nexa-text-secondary">
                Fleet Spend: <strong className="text-nexa-text-primary">{formatNaira(fleetMetrics.totalFuelSpend)}</strong>
              </span>
              <span className="text-blue-500 font-bold flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5" /> {fleetMetrics.fleetAvgFuelEfficiency} km/L avg
              </span>
            </div>
          </div>

          {/* Net Margin & Portfolio ROI */}
          <div className="p-5 bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-semibold text-nexa-text-secondary uppercase tracking-wider">
                  Fleet Operating Margin & ROI
                </span>
                <p className="text-2xl font-black text-emerald-500 mt-1">
                  {fleetMetrics.fleetAverageRoi.toFixed(1)}%
                  <span className="text-xs font-medium text-nexa-text-secondary ml-1">Avg ROI</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-3 border-t border-nexa-border/60 flex items-center justify-between text-xs">
              <span className="text-nexa-text-secondary">
                Net Margin: <strong className="text-emerald-500">{fleetMetrics.fleetNetMargin.toFixed(1)}%</strong>
              </span>
              <span className="text-xs bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full">
                Healthy Fleet
              </span>
            </div>
          </div>
        </section>

        {/* --- Navigation Subtabs & Tools Bar --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-nexa-border pb-4">
          {/* Sub-view switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-nexa-surface border border-nexa-border rounded-xl">
            <button
              onClick={() => setActiveTab("matrix")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "matrix"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-nexa-text-secondary hover:text-nexa-text-primary hover:bg-nexa-bg-base"
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Vehicle ROI Matrix
            </button>
            <button
              onClick={() => setActiveTab("fuel_telemetry")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "fuel_telemetry"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-nexa-text-secondary hover:text-nexa-text-primary hover:bg-nexa-bg-base"
              }`}
            >
              <Fuel className="w-3.5 h-3.5" />
              Fuel Telemetry & Audit
            </button>
            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "simulator"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-nexa-text-secondary hover:text-nexa-text-primary hover:bg-nexa-bg-base"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              ROI & Fuel Simulator
              {(simFuelPriceChange !== 0 || simUtilizationChange !== 0) && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          </div>

          {/* Search, Filter & Display Toggles */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-nexa-text-secondary" />
              <input
                type="text"
                placeholder="Search plate, model, driver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-nexa-surface border border-nexa-border rounded-xl text-xs w-48 lg:w-60 text-nexa-text-primary placeholder:text-nexa-text-secondary/60 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={roiFilter}
              onChange={(e) => setRoiFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-nexa-surface border border-nexa-border rounded-xl text-xs text-nexa-text-primary focus:outline-none focus:border-blue-500"
            >
              <option value="all">All ROI Health</option>
              <option value="excellent">Top Producers (&gt;80% ROI)</option>
              <option value="healthy">Healthy (40%-80% ROI)</option>
              <option value="watch">Watch / Moderate (0-40%)</option>
              <option value="danger">Margin Destroyers (&lt;0%)</option>
            </select>

            {activeTab === "matrix" && (
              <div className="hidden sm:flex items-center border border-nexa-border rounded-xl overflow-hidden bg-nexa-surface">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-1.5 text-xs ${viewMode === "cards" ? "bg-nexa-bg-base text-blue-600 font-bold" : "text-nexa-text-secondary"}`}
                  title="Card Grid View"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 text-xs ${viewMode === "table" ? "bg-nexa-bg-base text-blue-600 font-bold" : "text-nexa-text-secondary"}`}
                  title="Detailed Table View"
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- TAB 1: VEHICLE ROI MATRIX VIEW --- */}
        {activeTab === "matrix" && (
          <div className="space-y-6">
            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {paginatedVehicles.map((v) => {
                  const calc = getVehicleCalculations(v);

                  return (
                    <div
                      key={v.id}
                      className="bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm p-6 flex flex-col justify-between hover:border-blue-500/40 transition-all group"
                    >
                      {/* Card Header */}
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                              {v.type === "Coaster Bus" ? "🚌" : v.type === "Executive Van" ? "🚐" : v.type === "Sedan" ? "🚗" : "🚍"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-base text-nexa-text-primary group-hover:text-blue-500 transition-colors">
                                  {v.make} {v.model} ({v.year})
                                </h3>
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-nexa-bg-base border border-nexa-border font-semibold text-nexa-text-primary">
                                  {v.plate}
                                </span>
                              </div>
                              <p className="text-xs text-nexa-text-secondary mt-0.5">
                                {v.seats} Seats • {v.serviceType}
                              </p>
                            </div>
                          </div>

                          {/* Health & Status Badge */}
                          <div className="flex flex-col items-end gap-1.5">
                            {calc.healthCategory === "excellent" && (
                              <NexaBadge variant="emerald" size="sm" dot>Top Producer</NexaBadge>
                            )}
                            {calc.healthCategory === "healthy" && (
                              <NexaBadge variant="brand" size="sm" dot>Healthy</NexaBadge>
                            )}
                            {calc.healthCategory === "watch" && (
                              <NexaBadge variant="amber" size="sm" dot>Watch Margin</NexaBadge>
                            )}
                            {calc.healthCategory === "danger" && (
                              <NexaBadge variant="red" size="sm" dot>Margin Destroyer</NexaBadge>
                            )}

                            <span className="text-[11px] text-nexa-text-secondary">
                              Driver: <strong className="text-nexa-text-primary">{v.assignedDriver}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Financial Performance Grid */}
                        <div className="mt-5 grid grid-cols-3 gap-3 bg-nexa-bg-base/70 p-3.5 rounded-xl border border-nexa-border">
                          <div>
                            <span className="text-[10px] font-semibold text-nexa-text-secondary uppercase">
                              Revenue / Mo
                            </span>
                            <p className="text-sm font-bold text-emerald-500 mt-0.5">
                              {formatNaira(calc.adjustedRevenue)}
                            </p>
                            <span className="text-[10px] text-nexa-text-secondary">
                              ₦{calc.rpk}/km
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-semibold text-nexa-text-secondary uppercase">
                              Cost / Mo (OpEx)
                            </span>
                            <p className="text-sm font-bold text-nexa-text-primary mt-0.5">
                              {formatNaira(calc.totalOperatingCost)}
                            </p>
                            <span className="text-[10px] text-nexa-text-secondary">
                              ₦{calc.cpk}/km
                            </span>
                          </div>

                          <div className="border-l border-nexa-border pl-3">
                            <span className="text-[10px] font-semibold text-nexa-text-secondary uppercase">
                              Net Profit & ROI
                            </span>
                            <p className={`text-sm font-black mt-0.5 flex items-center gap-1 ${
                              calc.netOperatingProfit >= 0 ? "text-emerald-500" : "text-red-500"
                            }`}>
                              {calc.netOperatingProfit >= 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {formatNaira(calc.netOperatingProfit)}
                            </p>
                            <span className={`text-[11px] font-extrabold ${
                              calc.monthlyRoiPct >= 40 ? "text-emerald-500" : calc.monthlyRoiPct >= 0 ? "text-amber-500" : "text-red-500"
                            }`}>
                              {calc.monthlyRoiPct.toFixed(0)}% ROI ({calc.operatingMarginPct.toFixed(0)}% margin)
                            </span>
                          </div>
                        </div>

                        {/* Cost Breakdown Progress Bar */}
                        <div className="mt-4 space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-nexa-text-secondary font-medium">Cost Distribution:</span>
                            <span className="text-nexa-text-secondary">
                              Fuel: <strong className="text-blue-500">{Math.round((calc.fuelCost / calc.totalOperatingCost) * 100)}%</strong> • 
                              Repairs: <strong className="text-amber-500">{Math.round((v.maintenanceCost / calc.totalOperatingCost) * 100)}%</strong> • 
                              Driver: <strong className="text-purple-500">{Math.round((v.driverWageCost / calc.totalOperatingCost) * 100)}%</strong>
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-nexa-border overflow-hidden flex">
                            <div
                              style={{ width: `${(calc.fuelCost / calc.totalOperatingCost) * 100}%` }}
                              className="bg-blue-500 h-full"
                              title={`Fuel Cost: ${formatNaira(calc.fuelCost)}`}
                            />
                            <div
                              style={{ width: `${(v.maintenanceCost / calc.totalOperatingCost) * 100}%` }}
                              className="bg-amber-500 h-full"
                              title={`Maintenance: ${formatNaira(v.maintenanceCost)}`}
                            />
                            <div
                              style={{ width: `${(v.driverWageCost / calc.totalOperatingCost) * 100}%` }}
                              className="bg-purple-500 h-full"
                              title={`Driver Wage: ${formatNaira(v.driverWageCost)}`}
                            />
                            <div
                              style={{ width: `${(v.fixedCostMonthly / calc.totalOperatingCost) * 100}%` }}
                              className="bg-slate-400 h-full"
                              title={`Fixed Costs: ${formatNaira(v.fixedCostMonthly)}`}
                            />
                          </div>
                        </div>

                        {/* Fuel Telemetry Pill */}
                        <div className="mt-4 pt-3.5 border-t border-nexa-border flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Fuel className="w-4 h-4 text-blue-500" />
                            <span className="text-nexa-text-secondary">
                              Burned: <strong className="text-nexa-text-primary">{v.fuelLitres}L</strong> ({formatNaira(calc.fuelCost)})
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Gauge className="w-4 h-4 text-indigo-500" />
                            <span className="text-nexa-text-secondary">
                              Efficiency:{" "}
                              <strong className={`${
                                calc.fuelEfficiencyVariance >= -5 ? "text-emerald-500" : "text-amber-500"
                              }`}>
                                {calc.actualKmPerLitre} km/L
                              </strong>{" "}
                              <span className="text-[10px] text-nexa-text-secondary/70">
                                (target: {v.fuelTargetKmPerLitre})
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-5 pt-3 border-t border-nexa-border flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] text-nexa-text-secondary">
                          <Wrench className="w-3 h-3 text-nexa-text-secondary" />
                          <span>Last Serviced: {v.lastServiceDate}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setFuelForm({
                                ...fuelForm,
                                vehicleId: v.id,
                                odometerKm: v.currentMileage + 150
                              });
                              setIsFuelModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all flex items-center gap-1"
                          >
                            <Fuel className="w-3 h-3" />
                            Refill
                          </button>
                          <button
                            onClick={() => setSelectedVehicle(v)}
                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-nexa-bg-base border border-nexa-border text-nexa-text-primary hover:border-blue-500/50 hover:text-blue-500 transition-all flex items-center gap-1"
                          >
                            Inspect ROI <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Table View for Fleet Managers */
              <div className="bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-nexa-bg-base border-b border-nexa-border text-nexa-text-secondary font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Vehicle & Identity</th>
                        <th className="p-4">Service & Driver</th>
                        <th className="p-4 text-right">Revenue / Mo</th>
                        <th className="p-4 text-right">Total Cost (OpEx)</th>
                        <th className="p-4 text-right">Fuel Telemetry</th>
                        <th className="p-4 text-right">Net Profit</th>
                        <th className="p-4 text-right">ROI (%)</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-nexa-border">
                      {paginatedVehicles.map((v) => {
                        const calc = getVehicleCalculations(v);

                        return (
                          <tr key={v.id} className="hover:bg-nexa-bg-base/40 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">
                                  {v.type === "Coaster Bus" ? "🚌" : v.type === "Executive Van" ? "🚐" : v.type === "Sedan" ? "🚗" : "🚍"}
                                </span>
                                <div>
                                  <p className="font-bold text-nexa-text-primary text-sm">
                                    {v.make} {v.model}
                                  </p>
                                  <p className="text-[11px] font-mono text-nexa-text-secondary">
                                    {v.plate} • {v.year}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              <p className="font-medium text-nexa-text-primary">{v.serviceType}</p>
                              <p className="text-nexa-text-secondary">Driver: {v.assignedDriver}</p>
                            </td>

                            <td className="p-4 text-right">
                              <p className="font-bold text-emerald-500 text-sm">
                                {formatNaira(calc.adjustedRevenue)}
                              </p>
                              <p className="text-nexa-text-secondary text-[10px]">
                                ₦{calc.rpk}/km • {v.monthlyDistanceKm.toLocaleString()} km
                              </p>
                            </td>

                            <td className="p-4 text-right">
                              <p className="font-bold text-nexa-text-primary">
                                {formatNaira(calc.totalOperatingCost)}
                              </p>
                              <p className="text-nexa-text-secondary text-[10px]">
                                Fuel: {formatNaira(calc.fuelCost)} • Repairs: {formatNaira(v.maintenanceCost)}
                              </p>
                            </td>

                            <td className="p-4 text-right">
                              <p className="font-bold text-blue-500">
                                {v.fuelLitres}L <span className="text-nexa-text-secondary text-[10px]">({calc.actualKmPerLitre} km/L)</span>
                              </p>
                              <p className={`text-[10px] ${
                                calc.fuelEfficiencyVariance >= 0 ? "text-emerald-500 font-semibold" : "text-amber-500 font-semibold"
                              }`}>
                                {calc.fuelEfficiencyVariance >= 0 ? "+" : ""}{calc.fuelEfficiencyVariance}% vs target
                              </p>
                            </td>

                            <td className="p-4 text-right">
                              <p className={`font-bold ${calc.netOperatingProfit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                {formatNaira(calc.netOperatingProfit)}
                              </p>
                              <p className="text-[10px] text-nexa-text-secondary">
                                {calc.operatingMarginPct.toFixed(1)}% margin
                              </p>
                            </td>

                            <td className="p-4 text-right font-mono font-bold">
                              <span className={`text-sm ${
                                calc.monthlyRoiPct >= 80 ? "text-emerald-500" : calc.monthlyRoiPct >= 40 ? "text-blue-500" : calc.monthlyRoiPct >= 0 ? "text-amber-500" : "text-red-500"
                              }`}>
                                {calc.monthlyRoiPct.toFixed(0)}%
                              </span>
                            </td>

                            <td className="p-4 text-center">
                              {calc.healthCategory === "excellent" && (
                                <NexaBadge variant="emerald" size="sm">Top ROI</NexaBadge>
                              )}
                              {calc.healthCategory === "healthy" && (
                                <NexaBadge variant="brand" size="sm">Healthy</NexaBadge>
                              )}
                              {calc.healthCategory === "watch" && (
                                <NexaBadge variant="amber" size="sm">Watch</NexaBadge>
                              )}
                              {calc.healthCategory === "danger" && (
                                <NexaBadge variant="red" size="sm">Replace</NexaBadge>
                              )}
                            </td>

                            <td className="p-4 text-center">
                              <button
                                onClick={() => setSelectedVehicle(v)}
                                className="px-2.5 py-1 text-xs rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 font-semibold transition-all"
                              >
                                View ROI
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            <TablePaginationFooter
              currentPage={matrixPage}
              totalItems={filteredVehicles.length}
              pageSize={pageSize}
              onPageChange={setMatrixPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}

        {/* --- TAB 2: FUEL TELEMETRY & CONSUMPTION AUDIT --- */}
        {activeTab === "fuel_telemetry" && (
          <div className="space-y-6">
            {/* Telemetry Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xs font-semibold text-nexa-text-secondary uppercase">
                    Total Fuel Consumed (30D)
                  </h4>
                  <Fuel className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-black text-nexa-text-primary mt-1">
                  {fleetMetrics.totalFuelLitres.toLocaleString()}{" "}
                  <span className="text-sm font-semibold text-blue-500">Litres</span>
                </p>
                <p className="text-xs text-nexa-text-secondary mt-2">
                  Total Fuel Expense: <strong className="text-nexa-text-primary">{formatNaira(fleetMetrics.totalFuelSpend)}</strong>
                </p>
              </div>

              <div className="p-5 bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xs font-semibold text-nexa-text-secondary uppercase">
                    Fleet Average Economy
                  </h4>
                  <Gauge className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-2xl font-black text-emerald-500 mt-1">
                  {fleetMetrics.fleetAvgFuelEfficiency}{" "}
                  <span className="text-sm font-semibold text-nexa-text-secondary">KM / Litre</span>
                </p>
                <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Normal fleet burn pattern
                </p>
              </div>

              <div className="p-5 bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xs font-semibold text-nexa-text-secondary uppercase">
                    Fuel Anomalies & Siphon Flags
                  </h4>
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-2xl font-black text-amber-500 mt-1">1 Vehicle</p>
                <p className="text-xs text-amber-500 mt-2">
                  AAA-123XY burning 22% above baseline
                </p>
              </div>
            </div>

            {/* Fuel Efficiency Leaderboard & Audit Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Leaderboard */}
              <div className="lg:col-span-1 bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-nexa-border pb-3">
                  <h3 className="font-bold text-sm text-nexa-text-primary flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Fuel Efficiency Benchmark
                  </h3>
                  <span className="text-[11px] text-nexa-text-secondary">km / Litre</span>
                </div>

                <div className="space-y-3.5">
                  {vehicles.map((v) => {
                    const calc = getVehicleCalculations(v);
                    const isDeficit = calc.fuelEfficiencyVariance < -10;

                    return (
                      <div
                        key={v.id}
                        className={`p-3 rounded-xl border text-xs transition-all ${
                          isDeficit
                            ? "bg-red-500/5 border-red-500/20"
                            : "bg-nexa-bg-base border-nexa-border"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-bold text-nexa-text-primary">{v.plate} ({v.model})</span>
                          <span className={`font-mono font-bold ${isDeficit ? "text-red-500" : "text-emerald-500"}`}>
                            {calc.actualKmPerLitre} km/L
                          </span>
                        </div>
                        <div className="w-full bg-nexa-border h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isDeficit ? "bg-red-500" : "bg-emerald-500"}`}
                            style={{ width: `${Math.min(100, (calc.actualKmPerLitre / 10) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-nexa-text-secondary mt-1">
                          <span>Target: {v.fuelTargetKmPerLitre} km/L</span>
                          <span className={calc.fuelEfficiencyVariance >= 0 ? "text-emerald-500" : "text-amber-500"}>
                            {calc.fuelEfficiencyVariance >= 0 ? "+" : ""}{calc.fuelEfficiencyVariance}% variance
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Fuel Refill Log */}
              <div className="lg:col-span-2 bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-nexa-border pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-nexa-text-primary flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-blue-500" />
                      Recent Fuel Refills & Fuel Cards Ledger
                    </h3>
                    <p className="text-xs text-nexa-text-secondary mt-0.5">
                      Audited pump refills matched against driver trips and telemetry
                    </p>
                  </div>
                  <NexaButton
                    size="sm"
                    variant="outline"
                    onClick={() => setIsFuelModalOpen(true)}
                    className="text-xs gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Log Refill
                  </NexaButton>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-nexa-bg-base border-b border-nexa-border text-nexa-text-secondary">
                      <tr>
                        <th className="p-3 font-semibold">Refill Timestamp</th>
                        <th className="p-3 font-semibold">Vehicle</th>
                        <th className="p-3 font-semibold">Driver & Station</th>
                        <th className="p-3 font-semibold text-right">Volume</th>
                        <th className="p-3 font-semibold text-right">Total Cost</th>
                        <th className="p-3 font-semibold text-right">Odometer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-nexa-border">
                      {paginatedFuelLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-nexa-bg-base/40 transition-colors">
                          <td className="p-3 font-medium text-nexa-text-primary">
                            {log.date}
                          </td>
                          <td className="p-3">
                            <span className="font-mono font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded text-[11px]">
                              {log.plate}
                            </span>
                          </td>
                          <td className="p-3">
                            <p className="font-medium text-nexa-text-primary">{log.driver}</p>
                            <p className="text-[10px] text-nexa-text-secondary">{log.station}</p>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-nexa-text-primary">
                            {log.litres} L
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-500">
                            {formatNaira(log.totalCost)}
                            <span className="block text-[10px] text-nexa-text-secondary font-normal">
                              ₦{log.pricePerLitre}/L
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono text-nexa-text-secondary">
                            {log.odometerKm.toLocaleString()} km
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Fuel Pagination Controls */}
                <TablePaginationFooter
                  currentPage={fuelPage}
                  totalItems={fuelLogs.length}
                  pageSize={pageSize}
                  onPageChange={setFuelPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: UNIT ECONOMICS & WHAT-IF SIMULATOR --- */}
        {activeTab === "simulator" && (
          <div className="space-y-6">
            <div className="bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm p-6 space-y-6">
              <div className="border-b border-nexa-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-nexa-text-primary flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-blue-500" />
                    Fleet Unit Economics & Stress Simulator
                  </h3>
                  <p className="text-xs text-nexa-text-secondary mt-1">
                    Simulate how macro fuel price surges or changes in route utilization immediately impact Cost/Vehicle, Net Margins, and ROI.
                  </p>
                </div>
                {(simFuelPriceChange !== 0 || simUtilizationChange !== 0) && (
                  <button
                    onClick={() => {
                      setSimFuelPriceChange(0);
                      setSimUtilizationChange(0);
                    }}
                    className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset to Actuals
                  </button>
                )}
              </div>

              {/* Sliders Control Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-nexa-bg-base/70 p-5 rounded-2xl border border-nexa-border">
                {/* Fuel Price Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-nexa-text-primary flex items-center gap-1.5">
                      <Fuel className="w-4 h-4 text-blue-500" />
                      Simulated Fuel Price Adjustment
                    </label>
                    <span className="font-mono font-bold text-sm text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded-lg">
                      {simFuelPriceChange >= 0 ? `+₦${simFuelPriceChange}` : `-₦${Math.abs(simFuelPriceChange)}`} / Litre
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="500"
                    step="25"
                    value={simFuelPriceChange}
                    onChange={(e) => setSimFuelPriceChange(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-nexa-text-secondary">
                    <span>-₦200/L (Subsidy/Bulk Deal)</span>
                    <span>Current Baseline: ₦950/L</span>
                    <span>+₦500/L (Fuel Shock)</span>
                  </div>
                </div>

                {/* Route Utilization Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-nexa-text-primary flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      Trip & Seat Utilization Shift
                    </label>
                    <span className="font-mono font-bold text-sm text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                      {simUtilizationChange >= 0 ? `+${simUtilizationChange}%` : `${simUtilizationChange}%`} Revenue
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="60"
                    step="5"
                    value={simUtilizationChange}
                    onChange={(e) => setSimUtilizationChange(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-nexa-text-secondary">
                    <span>-40% (Off-Peak / Holidays)</span>
                    <span>Baseline (100%)</span>
                    <span>+60% (Peak Charter Expansion)</span>
                  </div>
                </div>
              </div>

              {/* Stress Results Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-nexa-border bg-nexa-surface text-center">
                  <span className="text-[11px] font-semibold text-nexa-text-secondary uppercase">
                    Simulated Fleet Revenue
                  </span>
                  <p className="text-xl font-black text-emerald-500 mt-1">
                    {formatNaira(fleetMetrics.totalRevenue)}
                  </p>
                  <span className="text-[10px] text-nexa-text-secondary">
                    {formatNaira(fleetMetrics.avgRevenuePerVehicle)} / vehicle
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-nexa-border bg-nexa-surface text-center">
                  <span className="text-[11px] font-semibold text-nexa-text-secondary uppercase">
                    Simulated Fleet Fuel Spend
                  </span>
                  <p className="text-xl font-black text-blue-500 mt-1">
                    {formatNaira(fleetMetrics.totalFuelSpend)}
                  </p>
                  <span className="text-[10px] text-nexa-text-secondary">
                    {fleetMetrics.totalFuelLitres.toLocaleString()} Litres consumed
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-nexa-border bg-nexa-surface text-center">
                  <span className="text-[11px] font-semibold text-nexa-text-secondary uppercase">
                    Simulated OpEx Cost / Vehicle
                  </span>
                  <p className="text-xl font-black text-nexa-text-primary mt-1">
                    {formatNaira(fleetMetrics.avgCostPerVehicle)}
                  </p>
                  <span className="text-[10px] text-nexa-text-secondary">
                    Cost per KM: ₦{fleetMetrics.fleetAvgCpk}/km
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-nexa-border bg-nexa-surface text-center">
                  <span className="text-[11px] font-semibold text-nexa-text-secondary uppercase">
                    Simulated Portfolio ROI
                  </span>
                  <p className={`text-xl font-black mt-1 ${
                    fleetMetrics.fleetAverageRoi >= 40 ? "text-emerald-500" : fleetMetrics.fleetAverageRoi >= 0 ? "text-amber-500" : "text-red-500"
                  }`}>
                    {fleetMetrics.fleetAverageRoi.toFixed(1)}%
                  </p>
                  <span className="text-[10px] text-nexa-text-secondary">
                    Margin: {fleetMetrics.fleetNetMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL 1: VEHICLE FINANCIAL DEEP-DIVE & ROI DRILLDOWN --- */}
        {selectedVehicle && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 text-slate-900">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-2xl">
                    {selectedVehicle.type === "Coaster Bus" ? "🚌" : selectedVehicle.type === "Executive Van" ? "🚐" : "🚗"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-900">
                        {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
                      </h2>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {selectedVehicle.plate}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Assigned Driver: {selectedVehicle.assignedDriver} • {selectedVehicle.serviceType}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Vehicle Capital Payback Progress */}
              {(() => {
                const calc = getVehicleCalculations(selectedVehicle);

                return (
                  <div className="space-y-6">
                    {/* CapEx & Payback Matrix */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-600">
                          Asset Acquisition Cost: <strong className="text-slate-900">{formatNaira(selectedVehicle.acquisitionCost)}</strong>
                        </span>
                        <span className="text-blue-600 font-bold">
                          {selectedVehicle.totalMonthsActive} of {selectedVehicle.paybackHorizonMonths} Mos Active
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (selectedVehicle.totalMonthsActive / selectedVehicle.paybackHorizonMonths) * 100)}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>
                          Monthly Net Cashflow: <strong className="text-emerald-600">{formatNaira(calc.netOperatingProfit)}</strong>
                        </span>
                        <span>
                          Estimated Break-Even Horizon: <strong className="text-slate-900">{calc.monthsToFullPayback} Months</strong>
                        </span>
                      </div>
                    </div>

                    {/* Detailed Monthly P&L Ledger */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Monthly Operating Ledger Breakdown
                      </h4>

                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white text-xs shadow-xs">
                        <div className="p-3 flex justify-between bg-emerald-50">
                          <span className="font-bold text-emerald-700">Gross Monthly Revenue</span>
                          <span className="font-bold font-mono text-emerald-700">+{formatNaira(calc.adjustedRevenue)}</span>
                        </div>

                        <div className="p-3 flex justify-between">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <Fuel className="w-3.5 h-3.5 text-blue-500" /> Fuel ({selectedVehicle.fuelLitres}L @ ₦{selectedVehicle.fuelPricePerLitre}/L)
                          </span>
                          <span className="font-mono text-red-600">-{formatNaira(calc.fuelCost)}</span>
                        </div>

                        <div className="p-3 flex justify-between">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-amber-500" /> Routine & Corrective Maintenance
                          </span>
                          <span className="font-mono text-red-600">-{formatNaira(selectedVehicle.maintenanceCost)}</span>
                        </div>

                        <div className="p-3 flex justify-between">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-purple-500" /> Driver Compensation & Stipends
                          </span>
                          <span className="font-mono text-red-600">-{formatNaira(selectedVehicle.driverWageCost)}</span>
                        </div>

                        <div className="p-3 flex justify-between">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Insurance, Tracking & Licensing
                          </span>
                          <span className="font-mono text-red-600">-{formatNaira(selectedVehicle.fixedCostMonthly)}</span>
                        </div>

                        <div className="p-3.5 flex justify-between bg-slate-50 font-bold text-sm border-t border-slate-200">
                          <span className="text-slate-900">Net Monthly Operating Profit</span>
                          <span className={calc.netOperatingProfit >= 0 ? "text-emerald-600 font-mono" : "text-red-600 font-mono"}>
                            {formatNaira(calc.netOperatingProfit)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Telemetry Metrics */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase">Fuel Economy</span>
                        <p className="font-bold text-slate-900 mt-0.5">
                          {calc.actualKmPerLitre} km/L <span className="text-slate-500 font-normal">(target: {selectedVehicle.fuelTargetKmPerLitre})</span>
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase">Cost Per KM (CPK)</span>
                        <p className="font-bold text-slate-900 mt-0.5">
                          ₦{calc.cpk} / km
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <NexaButton
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedVehicle(null)}
                      >
                        Close
                      </NexaButton>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* --- MODAL 2: LOG FUEL REFILL --- */}
        {isFuelModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Log Fuel Refill</h3>
                    <p className="text-[11px] text-slate-500">Record pump volumes to update vehicle telemetry</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFuelModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleLogFuel} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Select Vehicle
                  </label>
                  <select
                    value={fuelForm.vehicleId}
                    onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id} className="bg-white text-slate-900">
                        {v.plate} — {v.make} {v.model} ({v.assignedDriver})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Litres Pumped
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={fuelForm.litres}
                      onChange={(e) => setFuelForm({ ...fuelForm, litres: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Price / Litre (₦)
                    </label>
                    <input
                      type="number"
                      required
                      value={fuelForm.pricePerLitre}
                      onChange={(e) => setFuelForm({ ...fuelForm, pricePerLitre: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Odometer (KM)
                    </label>
                    <input
                      type="number"
                      required
                      value={fuelForm.odometerKm}
                      onChange={(e) => setFuelForm({ ...fuelForm, odometerKm: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Station / Vendor
                    </label>
                    <input
                      type="text"
                      required
                      value={fuelForm.station}
                      onChange={(e) => setFuelForm({ ...fuelForm, station: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex justify-between items-center">
                  <span className="font-semibold text-xs">Calculated Total Refill:</span>
                  <span className="font-bold text-sm font-mono text-blue-800">
                    {formatNaira(fuelForm.litres * fuelForm.pricePerLitre)}
                  </span>
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <NexaButton
                    type="button"
                    variant="ghost"
                    onClick={() => setIsFuelModalOpen(false)}
                    className="text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" variant="primary" className="text-xs">
                    Confirm & Record Refill
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL 3: REGISTER NEW VEHICLE --- */}
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Register Vehicle & Set ROI Baseline</h3>
                    <p className="text-[11px] text-slate-500">Initialize capital baseline, target economy and payback period</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRegisterVehicle} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Make & Model</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Toyota Coaster"
                      value={registerForm.makeModel}
                      onChange={(e) => setRegisterForm({ ...registerForm, makeModel: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Plate Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LAG-402KJ"
                      value={registerForm.plate}
                      onChange={(e) => setRegisterForm({ ...registerForm, plate: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Vehicle Type</label>
                    <select
                      value={registerForm.category}
                      onChange={(e) => setRegisterForm({ ...registerForm, category: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                    >
                      <option value="Coaster Bus" className="bg-white text-slate-900">Coaster Bus</option>
                      <option value="Minibus" className="bg-white text-slate-900">Minibus</option>
                      <option value="Executive Van" className="bg-white text-slate-900">Executive Van</option>
                      <option value="Sedan" className="bg-white text-slate-900">Sedan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Acquisition Cost (₦)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="25,000,000"
                      value={registerForm.acquisitionCost}
                      onChange={(e) => setRegisterForm({ ...registerForm, acquisitionCost: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Target Fuel Economy (km/L)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      min="0.5"
                      placeholder="6.5"
                      value={registerForm.fuelEconomyTarget}
                      onChange={(e) => setRegisterForm({ ...registerForm, fuelEconomyTarget: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Payback Horizon (Months)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="36"
                      value={registerForm.paybackHorizon}
                      onChange={(e) => setRegisterForm({ ...registerForm, paybackHorizon: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-[11px]">
                  💡 <strong>ROI Baseline Engine:</strong> Once registered, trip manifests, driver allocations, and fuel refill logs will automatically compute continuous monthly ROI and Cost per KM.
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <NexaButton
                    type="button"
                    variant="ghost"
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton
                    type="submit"
                    variant="primary"
                    disabled={isSaving}
                    className="text-xs"
                  >
                    {isSaving ? "Saving..." : "Save Vehicle"}
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ErpAdminShell>
  );
}

