"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Navigation,
  Bike,
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Phone,
  User,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Layers,
  Radio,
  ExternalLink,
  ChevronRight,
  X,
  Compass,
  FileText,
  DollarSign,
  AlertCircle,
  Building,
  Check,
  UserCheck,
  Activity,
  Users,
  Banknote,
  ShieldAlert,
  FileCheck2,
  LayoutDashboard,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { GoogleMap } from "@/components/nexa/GoogleMap";
import { useDispatch } from "@/lib/useDispatch";
import {
  DispatchJob,
  JobType,
  JobStatus,
  CourierDriver,
} from "@/lib/dispatch-types";

type DispatchTab = "overview" | "queue" | "map" | "fleet" | "exceptions" | "rates";

export default function DispatchUnifiedCommandCentre() {
  const {
    jobs,
    filteredJobs,
    couriers,
    zoneRates,
    stats,
    isLoading,
    selectedJobId,
    setSelectedJobId,
    selectedJob,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    assignCourier,
    updateStatus,
    reportException,
    createJob,
    toggleCourierAvailability,
    refreshData,
  } = useDispatch();

  const [activeTab, setActiveTab] = useState<DispatchTab>("overview");
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState("");
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState<string>("ALL");

  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [exceptionReason, setExceptionReason] = useState("Customer Unreachable");
  const [exceptionNotes, setExceptionNotes] = useState("");

  // Rate calculator state
  const [calcOrigin, setCalcOrigin] = useState("Lagos (Mainland)");
  const [calcDest, setCalcDest] = useState("Lagos (Island)");
  const [calcWeight, setCalcWeight] = useState(2.5);

  // New job form state
  const [newJobForm, setNewJobForm] = useState({
    type: "VENDOR_DISPATCH" as JobType,
    priority: "STANDARD" as "STANDARD" | "HIGH" | "URGENT",
    initiatorName: "",
    initiatorPhone: "",
    pickupAddress: "",
    pickupCity: "Lagos",
    recipientName: "",
    recipientPhone: "",
    recipientAddress: "",
    recipientCity: "Lagos",
    parcelDescription: "",
    weightKg: 1.5,
    shippingFee: 3000,
  });

  // Read URL query params on mount and on popstate/navigation
  useEffect(() => {
    const syncTabFromUrl = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get("tab") as DispatchTab | null;
        if (tabParam && ["overview", "queue", "map", "fleet", "exceptions", "rates"].includes(tabParam)) {
          setActiveTab(tabParam);
        } else {
          setActiveTab("overview");
        }
      }
    };

    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);
    return () => window.removeEventListener("popstate", syncTabFromUrl);
  }, []);

  const handleTabChange = (tabId: DispatchTab) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const url = tabId === "overview" ? "/erp/admin/dispatch" : `/erp/admin/dispatch?tab=${tabId}`;
      window.history.pushState(null, "", url);
    }
  };

  // Operational metrics
  const totalRevenue = useMemo(
    () => jobs.reduce((acc, curr) => acc + (curr.shippingFee || 0), 0),
    [jobs]
  );
  const completedJobs = useMemo(
    () => jobs.filter((j) => j.status === "DELIVERED").length,
    [jobs]
  );
  const activeJobs = useMemo(
    () => jobs.filter((j) => j.status === "IN_TRANSIT" || j.status === "PICKED_UP").length,
    [jobs]
  );
  const pendingJobs = useMemo(
    () => jobs.filter((j) => j.status === "PENDING" || j.status === "ASSIGNED").length,
    [jobs]
  );
  const exceptionJobs = useMemo(
    () => jobs.filter((j) => j.status === "EXCEPTION").length,
    [jobs]
  );
  const unassignedJobs = useMemo(
    () => jobs.filter((j) => !j.courierId && j.status !== "DELIVERED" && j.status !== "CANCELLED").length,
    [jobs]
  );

  // Fleet breakdown
  const availableRiders = couriers.filter((c) => c.isAvailable && c.activeJobs === 0).length;
  const activeRiders = couriers.filter((c) => c.activeJobs > 0).length;
  const breakRiders = couriers.filter((c) => !c.isAvailable && c.activeJobs === 0).length;
  const offlineRiders = Math.max(0, couriers.length - (availableRiders + activeRiders + breakRiders));

  // Fulfillment stream counts
  const storeOrderCount = jobs.filter((j) => j.type === "STORE_ORDER").length;
  const vendorDispatchCount = jobs.filter((j) => j.type === "VENDOR_DISPATCH").length;
  const customerPickupCount = jobs.filter((j) => j.type === "CUSTOMER_PICKUP").length;
  const vendorPickupCount = jobs.filter((j) => j.type === "VENDOR_PICKUP").length;

  // Overview Ledger table filtered jobs
  const ledgerFilteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.trackingNumber.toLowerCase().includes(ledgerSearchTerm.toLowerCase()) ||
        job.orderNumber.toLowerCase().includes(ledgerSearchTerm.toLowerCase()) ||
        job.recipientName.toLowerCase().includes(ledgerSearchTerm.toLowerCase()) ||
        job.recipientAddress.toLowerCase().includes(ledgerSearchTerm.toLowerCase()) ||
        (job.courierName && job.courierName.toLowerCase().includes(ledgerSearchTerm.toLowerCase()));

      const matchesStatus =
        ledgerStatusFilter === "ALL" ||
        (ledgerStatusFilter === "ACTIVE" && (job.status === "IN_TRANSIT" || job.status === "PICKED_UP")) ||
        (ledgerStatusFilter === "DELIVERED" && job.status === "DELIVERED") ||
        (ledgerStatusFilter === "PENDING" && (job.status === "PENDING" || job.status === "ASSIGNED")) ||
        (ledgerStatusFilter === "EXCEPTION" && job.status === "EXCEPTION");

      return matchesSearch && matchesStatus;
    });
  }, [jobs, ledgerSearchTerm, ledgerStatusFilter]);

  const getJobTypeBadge = (type: JobType) => {
    switch (type) {
      case "STORE_ORDER":
        return <NexaBadge variant="blue" className="text-[10px]">Type A • Store Order</NexaBadge>;
      case "VENDOR_DISPATCH":
        return <NexaBadge variant="purple" className="text-[10px]">Type B • Vendor Dispatch</NexaBadge>;
      case "CUSTOMER_PICKUP":
        return <NexaBadge variant="green" className="text-[10px]">Type C • Customer Pickup</NexaBadge>;
      case "VENDOR_PICKUP":
        return <NexaBadge variant="warning" className="text-[10px]">Type D • Vendor Inbound</NexaBadge>;
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case "PENDING":
        return <NexaBadge variant="neutral" dot>Pending</NexaBadge>;
      case "ASSIGNED":
        return <NexaBadge variant="blue" dot>Assigned</NexaBadge>;
      case "PICKED_UP":
        return <NexaBadge variant="purple" dot>Picked Up</NexaBadge>;
      case "IN_TRANSIT":
        return <NexaBadge variant="cyan" dot>In Transit</NexaBadge>;
      case "DELIVERED":
        return <NexaBadge variant="green" dot>Delivered</NexaBadge>;
      case "EXCEPTION":
        return <NexaBadge variant="danger" dot>Exception</NexaBadge>;
      case "CANCELLED":
        return <NexaBadge variant="danger">Cancelled</NexaBadge>;
    }
  };

  const handleOtpConfirm = async () => {
    if (!selectedJob) return;
    setOtpError("");
    const res = await updateStatus(selectedJob.id, "DELIVERED", "Delivery completed with verified OTP", otpInput);
    if (res.success) {
      setIsOtpModalOpen(false);
      setOtpInput("");
    } else {
      setOtpError(res.error || "OTP verification failed");
    }
  };

  const handleReportExceptionSubmit = async () => {
    if (!selectedJob) return;
    await reportException(selectedJob.id, exceptionReason, exceptionNotes);
    setIsExceptionModalOpen(false);
    setExceptionNotes("");
  };

  const handleCreateJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createJob(newJobForm);
    if (res.success) {
      setIsNewJobModalOpen(false);
      setNewJobForm({
        type: "VENDOR_DISPATCH",
        priority: "STANDARD",
        initiatorName: "",
        initiatorPhone: "",
        pickupAddress: "",
        pickupCity: "Lagos",
        recipientName: "",
        recipientPhone: "",
        recipientAddress: "",
        recipientCity: "Lagos",
        parcelDescription: "",
        weightKg: 1.5,
        shippingFee: 3000,
      });
      handleTabChange("queue");
    }
  };

  // Live rate quote calculation
  const activeRateMatch = zoneRates.find(
    (r) => r.originCity.includes(calcOrigin.split(" ")[0]) && r.destCity.includes(calcDest.split(" ")[0])
  ) || zoneRates[0];
  const calculatedFee = (activeRateMatch?.baseFee || 2500) + calcWeight * (activeRateMatch?.perKgFee || 400);

  // Map markers for active deliveries and drivers
  const mapMarkers = [
    ...jobs
      .filter((j) => j.status === "IN_TRANSIT" || j.status === "ASSIGNED" || j.status === "PENDING")
      .map((j) => ({
        id: `dest-${j.id}`,
        lat: j.destCoords.lat,
        lng: j.destCoords.lng,
        title: `Drop-off: ${j.recipientName} (${j.trackingNumber})`,
        subtitle: j.recipientAddress,
      })),
    ...couriers.map((c) => ({
      id: `courier-${c.id}`,
      lat: c.currentLat,
      lng: c.currentLng,
      title: `Rider: ${c.name} [${c.plateNumber}]`,
      subtitle: `${c.vehicleType} • ${c.isAvailable ? "Available" : "Busy on trip"}${c.speed ? ` • ${c.speed.toFixed(0)} km/h` : ""}${c.batteryPct !== undefined ? ` • 🔋${c.batteryPct}%` : ""}`,
    })),
  ];

  return (
    <ErpAdminShell
      title="Ofia Dispatch Command & Operations"
      subtitle="Unified logistics command center: revenue, live fleet telemetry, waybill register, and real-time dispatch console."
      activeModule="dispatch"
      action={
        <div className="flex items-center gap-2">
          <NexaButton
            size="sm"
            variant="outline"
            onClick={refreshData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
            className="text-xs"
          >
            Refresh
          </NexaButton>
          <NexaButton
            size="sm"
            variant="primary"
            onClick={() => setIsNewJobModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            New Dispatch Job
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        {/* TOP LEVEL UNIFIED METRICS SUMMARY (6 CARDS) */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Revenue Today */}
          <div className="p-4 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-1.5">
              <h3 className="text-xs font-medium text-nexa-text-secondary truncate">Revenue Today</h3>
              <Banknote className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            </div>
            <p className="text-xl font-bold text-nexa-text-primary font-mono truncate">
              ₦{totalRevenue.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1 font-medium truncate">
              <TrendingUp className="w-3 h-3 flex-shrink-0" /> +18.4% vs yest.
            </p>
          </div>

          {/* 2. Active Deliveries */}
          <div className="p-4 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-1.5">
              <h3 className="text-xs font-medium text-nexa-text-secondary truncate">Active Deliveries</h3>
              <Activity className="w-4 h-4 text-blue-500 flex-shrink-0" />
            </div>
            <p className="text-xl font-bold text-nexa-text-primary font-mono truncate">{activeJobs}</p>
            <p className="text-[11px] text-blue-600 mt-1.5 flex items-center gap-1 font-medium truncate">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse inline-block flex-shrink-0" /> En route / picked up
            </p>
          </div>

          {/* 3. Dispatch Queue */}
          <div className="p-4 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-1.5">
              <h3 className="text-xs font-medium text-nexa-text-secondary truncate">Pending Queue</h3>
              <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
            </div>
            <p className="text-xl font-bold text-nexa-text-primary font-mono truncate">{pendingJobs}</p>
            <p className="text-[11px] text-amber-600 mt-1.5 truncate">
              {unassignedJobs} unassigned
            </p>
          </div>

          {/* 4. Available Couriers */}
          <div className="p-4 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-1.5">
              <h3 className="text-xs font-medium text-nexa-text-secondary truncate">Available Fleet</h3>
              <Bike className="w-4 h-4 text-purple-500 flex-shrink-0" />
            </div>
            <p className="text-xl font-bold text-nexa-text-primary font-mono truncate">
              {availableRiders} / {couriers.length}
            </p>
            <p className="text-[11px] text-purple-600 mt-1.5 truncate">
              {activeRiders} on trip, {offlineRiders} off
            </p>
          </div>

          {/* 5. Delivered Today */}
          <div className="p-4 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-1.5">
              <h3 className="text-xs font-medium text-nexa-text-secondary truncate">Delivered Today</h3>
              <Package className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            </div>
            <p className="text-xl font-bold text-nexa-text-primary font-mono truncate">{completedJobs}</p>
            <p className="text-[11px] text-nexa-text-secondary mt-1.5 truncate">
              Waybills fulfilled
            </p>
          </div>

          {/* 6. Live Exceptions */}
          <div className="p-4 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-1.5">
              <h3 className="text-xs font-medium text-nexa-text-secondary truncate">Live Exceptions</h3>
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            </div>
            <p className="text-xl font-bold text-nexa-text-primary font-mono truncate">{exceptionJobs}</p>
            <p className="text-[11px] text-rose-600 mt-1.5 font-medium truncate">
              {exceptionJobs > 0 ? "Action required" : "Zero active blockers"}
            </p>
          </div>
        </section>

        {/* PRIMARY TAB NAVIGATION BAR */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-nexa-border">
          {[
            { id: "overview", label: "Executive Overview", icon: LayoutDashboard },
            { id: "queue", label: "Dispatch Console", icon: Bike, badge: jobs.length.toString() },
            { id: "map", label: "Live Fleet Map", icon: Navigation },
            { id: "fleet", label: "Rider Management", icon: Users, badge: couriers.length.toString() },
            { id: "exceptions", label: "Exceptions", icon: AlertTriangle, badge: exceptionJobs > 0 ? exceptionJobs.toString() : undefined },
            { id: "rates", label: "Tariff & Quotes", icon: DollarSign },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as DispatchTab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm font-bold"
                    : "bg-nexa-surface hover:bg-nexa-bg-base text-nexa-text-secondary hover:text-nexa-text-primary border border-nexa-border"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? "bg-white text-blue-600 font-bold" : "bg-nexa-bg-base text-nexa-text-secondary"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: EXECUTIVE OVERVIEW & FULFILLMENT LEDGER */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Fleet Status Donut & Fulfillment Streams + Attention Required */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Courier Fleet Status & Channels (2 Cols) */}
              <section className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-nexa-text-primary mb-3">
                    Courier Fleet Status & Ingestion
                  </h2>
                  <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-32 h-32 rounded-full border-8 border-nexa-border/60 flex items-center justify-center relative flex-shrink-0">
                        <span className="text-2xl font-bold text-nexa-text-primary font-mono">
                          {couriers.length}
                        </span>
                        <span className="absolute bottom-6 text-[11px] text-nexa-text-secondary font-medium">Total Riders</span>
                      </div>
                      <div className="flex-1 w-full space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Active (On Delivery)
                          </span>
                          <span className="font-semibold text-nexa-text-primary font-mono">{activeRiders}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available (Standby)
                          </span>
                          <span className="font-semibold text-nexa-text-primary font-mono">{availableRiders}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Break / Idle
                          </span>
                          <span className="font-semibold text-nexa-text-primary font-mono">{breakRiders}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Offline / Off-Duty
                          </span>
                          <span className="font-semibold text-nexa-text-primary font-mono">{offlineRiders}</span>
                        </div>
                      </div>
                    </div>

                    {/* Fulfillment Channel Ingestion */}
                    <div className="mt-6 pt-6 border-t border-nexa-border">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-semibold text-nexa-text-primary">
                            Fulfillment Channel Ingestion
                          </h3>
                          <p className="text-xs text-nexa-text-secondary">
                            Waybill volume across the 4 blueprint dispatch streams
                          </p>
                        </div>
                        <span className="text-xs font-mono font-medium text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                          {jobs.length} Total Waybills
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-nexa-bg-base border border-nexa-border space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold text-nexa-text-primary">
                            <span>Type A • Store Orders</span>
                            <span className="font-mono text-blue-600">
                              {storeOrderCount} ({jobs.length > 0 ? Math.round((storeOrderCount / jobs.length) * 100) : 0}%)
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-nexa-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${jobs.length > 0 ? Math.round((storeOrderCount / jobs.length) * 100) : 0}%`,
                              }}
                            />
                          </div>
                          <p className="text-[11px] text-nexa-text-secondary">
                            Store checkout automated dispatches
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-nexa-bg-base border border-nexa-border space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold text-nexa-text-primary">
                            <span>Type B • Vendor Direct</span>
                            <span className="font-mono text-purple-600">
                              {vendorDispatchCount} ({jobs.length > 0 ? Math.round((vendorDispatchCount / jobs.length) * 100) : 0}%)
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-nexa-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{
                                width: `${jobs.length > 0 ? Math.round((vendorDispatchCount / jobs.length) * 100) : 0}%`,
                              }}
                            />
                          </div>
                          <p className="text-[11px] text-nexa-text-secondary">
                            Merchant point-to-point courier requests
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-nexa-bg-base border border-nexa-border space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold text-nexa-text-primary">
                            <span>Type C • Customer Pickups</span>
                            <span className="font-mono text-emerald-600">
                              {customerPickupCount} ({jobs.length > 0 ? Math.round((customerPickupCount / jobs.length) * 100) : 0}%)
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-nexa-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{
                                width: `${jobs.length > 0 ? Math.round((customerPickupCount / jobs.length) * 100) : 0}%`,
                              }}
                            />
                          </div>
                          <p className="text-[11px] text-nexa-text-secondary">
                            Customer errand & collection requests
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-nexa-bg-base border border-nexa-border space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold text-nexa-text-primary">
                            <span>Type D • Vendor Restock</span>
                            <span className="font-mono text-amber-600">
                              {vendorPickupCount} ({jobs.length > 0 ? Math.round((vendorPickupCount / jobs.length) * 100) : 0}%)
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-nexa-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{
                                width: `${jobs.length > 0 ? Math.round((vendorPickupCount / jobs.length) * 100) : 0}%`,
                              }}
                            />
                          </div>
                          <p className="text-[11px] text-nexa-text-secondary">
                            Warehouse supply & bulk intake
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Attention Required (1 Col) */}
              <section>
                <h2 className="text-base font-semibold text-nexa-text-primary mb-3">
                  Attention Required
                </h2>
                <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm p-4 space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-xs">Delivery Exception Alert</p>
                      <p className="text-[11px] mt-0.5 text-nexa-text-secondary">
                        Waybill OF-DISP-9904 restricted by estate security at Victoria Garden City.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-lg">
                    <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-xs">Unassigned Urgent Waybill</p>
                      <p className="text-[11px] mt-0.5 text-nexa-text-secondary">
                        Store order OF-ORD-8823 waiting &gt; 15 mins for rider pickup in Ikeja.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 rounded-lg">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-xs">Rider Commercial Badge</p>
                      <p className="text-[11px] mt-0.5 text-nexa-text-secondary">
                        Rider Babatunde Raji LASDRI commercial badge expires in 3 days.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-lg">
                    <FileCheck2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-xs">Pending OTP Handover</p>
                      <p className="text-[11px] mt-0.5 text-nexa-text-secondary">
                        Waybill OF-DISP-1002 arrived at drop-off; awaiting recipient PIN verification.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Recent Waybills Fulfillment Ledger Table */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-semibold text-nexa-text-primary">
                    Waybills Fulfillment Register
                  </h2>
                  <p className="text-xs text-nexa-text-secondary">
                    Real-time transaction register of customer orders, merchant dispatches, and rider handoffs.
                  </p>
                </div>
                <NexaButton
                  size="sm"
                  variant="outline"
                  onClick={() => handleTabChange("queue")}
                  className="text-xs gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  Open Live Console ({jobs.length})
                </NexaButton>
              </div>

              <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm overflow-hidden">
                {/* Table Control Bar */}
                <div className="p-4 border-b border-nexa-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {["ALL", "ACTIVE", "DELIVERED", "PENDING", "EXCEPTION"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setLedgerStatusFilter(tab)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          ledgerStatusFilter === tab
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-nexa-bg-base text-nexa-text-secondary hover:text-nexa-text-primary border border-nexa-border"
                        }`}
                      >
                        {tab === "ALL" ? `All (${jobs.length})` : tab}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-nexa-text-secondary absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={ledgerSearchTerm}
                      onChange={(e) => setLedgerSearchTerm(e.target.value)}
                      placeholder="Search tracking, rider, or address..."
                      className="w-full pl-8 pr-3 py-1.5 bg-nexa-bg-base border border-nexa-border rounded-lg text-xs text-nexa-text-primary placeholder:text-nexa-text-secondary focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-nexa-bg-base/50 border-b border-nexa-border text-xs text-nexa-text-secondary">
                      <tr>
                        <th className="p-4 font-semibold">Waybill Tracking</th>
                        <th className="p-4 font-semibold">Stream</th>
                        <th className="p-4 font-semibold">Recipient & Destination</th>
                        <th className="p-4 font-semibold">Assigned Courier</th>
                        <th className="p-4 font-semibold">Fee</th>
                        <th className="p-4 font-semibold">Verification</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-nexa-border text-xs">
                      {ledgerFilteredJobs.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-nexa-text-secondary">
                            No waybills found matching current search and filters.
                          </td>
                        </tr>
                      ) : (
                        ledgerFilteredJobs.map((job) => (
                          <tr
                            key={job.id}
                            className="hover:bg-nexa-bg-base/40 transition-colors cursor-pointer group"
                            onClick={() => {
                              setSelectedJobId(job.id);
                              handleTabChange("queue");
                            }}
                          >
                            <td className="p-4">
                              <span className="font-mono font-bold text-blue-600">
                                {job.trackingNumber}
                              </span>
                              <div className="text-[11px] text-nexa-text-secondary mt-0.5">
                                {job.orderNumber}
                              </div>
                            </td>

                            <td className="p-4">
                              {getJobTypeBadge(job.type)}
                            </td>

                            <td className="p-4 max-w-xs">
                              <div className="font-medium text-nexa-text-primary truncate">
                                {job.recipientName}
                              </div>
                              <div className="text-[11px] text-nexa-text-secondary truncate mt-0.5">
                                {job.recipientAddress}
                              </div>
                            </td>

                            <td className="p-4">
                              {job.courierName ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                                    <Bike className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-nexa-text-primary truncate max-w-[130px]">
                                      {job.courierName}
                                    </p>
                                    <p className="text-[10px] text-nexa-text-secondary">
                                      {job.courierPlate || "Motorbike"}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-amber-500 font-semibold text-[11px] flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Unassigned
                                </span>
                              )}
                            </td>

                            <td className="p-4 font-mono font-bold text-emerald-600">
                              ₦{job.shippingFee.toLocaleString()}
                            </td>

                            <td className="p-4">
                              {job.deliveryOtp ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  <ShieldCheck className="w-3 h-3" /> PIN: {job.deliveryOtp}
                                </span>
                              ) : (
                                <span className="text-nexa-text-secondary text-[11px]">Standard</span>
                              )}
                            </td>

                            <td className="p-4">
                              {getStatusBadge(job.status)}
                            </td>

                            <td className="p-4 text-right">
                              <span className="text-blue-600 text-xs font-semibold group-hover:underline inline-flex items-center gap-1">
                                Manage <ChevronRight className="w-3 h-3" />
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Zone Tariffs & Coverage Engine Preview */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-semibold text-nexa-text-primary">
                    Zone Tariffs & Coverage Engine
                  </h2>
                  <p className="text-xs text-nexa-text-secondary">
                    Standard baseline pricing policies and delivery radius governance
                  </p>
                </div>
                <NexaButton
                  size="sm"
                  variant="outline"
                  onClick={() => handleTabChange("rates")}
                  className="text-xs"
                >
                  Configure Pricing Matrix & Calculator
                </NexaButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zoneRates.map((zone) => (
                  <div
                    key={zone.id}
                    className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm text-nexa-text-primary">
                          {zone.zoneName}
                        </h3>
                        <p className="text-xs text-nexa-text-secondary flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-blue-500" />
                          {zone.originCity} ➔ {zone.destCity}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold">
                        {zone.estimatedDays === 1 ? "Same-Day / 24h" : `${zone.estimatedDays} Days`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-nexa-border">
                      <div>
                        <span className="text-[10px] text-nexa-text-secondary uppercase">Base Rate</span>
                        <p className="font-mono font-bold text-sm text-nexa-text-primary">
                          ₦{zone.baseFee.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-nexa-text-secondary uppercase">Per KG Fee</span>
                        <p className="font-mono font-bold text-sm text-nexa-text-primary">
                          ₦{zone.perKgFee.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: INTERACTIVE DISPATCH QUEUE & SPLIT CONSOLE */}
        {activeTab === "queue" && (
          <div className="space-y-6">
            {/* Filter Pills & Search */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-nexa-surface p-4 rounded-xl border border-nexa-border shadow-sm">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { key: "ALL", label: "All Streams" },
                  { key: "STORE_ORDER", label: "Type A • Store Orders" },
                  { key: "VENDOR_DISPATCH", label: "Type B • Vendor Dispatch" },
                  { key: "CUSTOMER_PICKUP", label: "Type C • Customer Pickup" },
                  { key: "VENDOR_PICKUP", label: "Type D • Vendor Inbound" },
                ].map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setTypeFilter(type.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      typeFilter === type.key
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-nexa-bg-base text-nexa-text-secondary hover:text-nexa-text-primary border border-nexa-border"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-nexa-text-secondary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tracking, client, area..."
                    className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-nexa-border bg-nexa-bg-base text-nexa-text-primary placeholder:text-nexa-text-secondary w-56 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-nexa-border bg-nexa-bg-base text-nexa-text-primary focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="EXCEPTION">Exception</option>
                </select>
              </div>
            </div>

            {/* Split Screen Console: Queue List (Left 5 cols) + Detailed Job Action Console (Right 7 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: DISPATCH QUEUE */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-nexa-text-secondary px-1">
                  <span>Filtered Waybills ({filteredJobs.length})</span>
                  <span>Sorted by Urgency</span>
                </div>

                {filteredJobs.length === 0 ? (
                  <div className="p-12 text-center bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
                    <Package className="w-10 h-10 mx-auto text-nexa-text-secondary mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-nexa-text-primary">No dispatch jobs found</p>
                    <p className="text-xs text-nexa-text-secondary mt-1">Try clearing your filters or create a new dispatch ticket.</p>
                  </div>
                ) : (
                  filteredJobs.map((job) => {
                    const isSelected = selectedJob?.id === job.id;
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer shadow-sm ${
                          isSelected
                            ? "border-2 border-blue-600 bg-blue-500/5"
                            : "border-nexa-border bg-nexa-surface hover:border-blue-500/40 hover:bg-nexa-bg-base/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-blue-600">
                                {job.trackingNumber}
                              </span>
                              {job.priority === "URGENT" && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                  URGENT
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-nexa-text-secondary mt-0.5">{job.orderNumber}</div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(job.status)}
                            <div className="text-[11px] font-mono font-bold text-emerald-600 mt-1">
                              ₦{job.shippingFee.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="mb-2.5">{getJobTypeBadge(job.type)}</div>

                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-nexa-text-primary font-medium truncate">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            <span className="truncate">{job.pickupAddress}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-nexa-text-secondary truncate">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                            <span className="truncate">{job.recipientAddress}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-nexa-border flex items-center justify-between text-[11px] text-nexa-text-secondary">
                          <span className="truncate max-w-[180px]">{job.parcelDescription}</span>
                          {job.courierName ? (
                            <span className="font-medium text-nexa-text-primary flex items-center gap-1">
                              <Bike className="w-3 h-3 text-blue-600" />
                              {job.courierName.split(" ")[0]}
                            </span>
                          ) : (
                            <span className="text-amber-500 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Unassigned
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* RIGHT COLUMN: SELECTED JOB ACTION CONSOLE */}
              <div className="lg:col-span-7">
                {selectedJob ? (
                  <div className="bg-nexa-surface border border-nexa-border rounded-xl shadow-sm p-6 space-y-6 sticky top-6">
                    {/* Top Job Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-nexa-border pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-nexa-text-primary font-mono">
                            {selectedJob.trackingNumber}
                          </h2>
                          {getStatusBadge(selectedJob.status)}
                        </div>
                        <div className="text-xs text-nexa-text-secondary mt-0.5">
                          Reference: <span className="font-mono font-medium">{selectedJob.orderNumber}</span> • Ingested {selectedJob.createdAt}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getJobTypeBadge(selectedJob.type)}
                        <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                          ₦{selectedJob.shippingFee.toLocaleString()} {selectedJob.currency}
                        </span>
                      </div>
                    </div>

                    {/* Progress Milestone Bar */}
                    <div>
                      <div className="text-xs font-bold text-nexa-text-secondary mb-2 uppercase tracking-wider">
                        Milestone Pipeline
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 text-center">
                        {[
                          { key: "PENDING", label: "Queued" },
                          { key: "ASSIGNED", label: "Assigned" },
                          { key: "PICKED_UP", label: "Picked Up" },
                          { key: "IN_TRANSIT", label: "In Transit" },
                          { key: "DELIVERED", label: "Delivered" },
                        ].map((step, idx) => {
                          const order = ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];
                          const currentIdx = order.indexOf(selectedJob.status);
                          const isDone = currentIdx >= idx;
                          const isCurrent = selectedJob.status === step.key;

                          return (
                            <div key={step.key} className="space-y-1">
                              <div
                                className={`h-2 rounded-full transition-colors ${
                                  selectedJob.status === "EXCEPTION" && isCurrent
                                    ? "bg-rose-500"
                                    : isDone
                                    ? "bg-blue-600"
                                    : "bg-nexa-border"
                                }`}
                              />
                              <div
                                className={`text-[10px] font-semibold ${
                                  isDone
                                    ? "text-nexa-text-primary font-bold"
                                    : "text-nexa-text-secondary"
                                }`}
                              >
                                {step.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Origin & Destination Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Origin Pickup */}
                      <div className="p-4 rounded-xl bg-nexa-bg-base border border-nexa-border space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            Pickup Location
                          </span>
                          <span className="text-[10px] text-nexa-text-secondary uppercase">Origin</span>
                        </div>
                        <div className="font-bold text-sm text-nexa-text-primary">
                          {selectedJob.initiatorName}
                        </div>
                        <div className="text-xs text-nexa-text-secondary">
                          {selectedJob.pickupAddress}, {selectedJob.pickupCity}
                        </div>
                        <div className="pt-2 border-t border-nexa-border flex items-center justify-between text-xs">
                          <a
                            href={`tel:${selectedJob.initiatorPhone}`}
                            className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                          >
                            <Phone className="w-3 h-3" />
                            {selectedJob.initiatorPhone}
                          </a>
                        </div>
                      </div>

                      {/* Recipient Drop-off */}
                      <div className="p-4 rounded-xl bg-nexa-bg-base border border-nexa-border space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-rose-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            Drop-Off Recipient
                          </span>
                          <span className="text-[10px] text-nexa-text-secondary uppercase">Destination</span>
                        </div>
                        <div className="font-bold text-sm text-nexa-text-primary">
                          {selectedJob.recipientName}
                        </div>
                        <div className="text-xs text-nexa-text-secondary">
                          {selectedJob.recipientAddress}, {selectedJob.recipientCity}
                        </div>
                        <div className="pt-2 border-t border-nexa-border flex items-center justify-between text-xs">
                          <a
                            href={`tel:${selectedJob.recipientPhone}`}
                            className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                          >
                            <Phone className="w-3 h-3" />
                            {selectedJob.recipientPhone}
                          </a>
                          {selectedJob.deliveryOtp && (
                            <span className="font-mono text-[11px] font-bold text-purple-600 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                              OTP: {selectedJob.deliveryOtp}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Parcel Specifications */}
                    <div className="p-4 rounded-xl bg-nexa-bg-base border border-nexa-border space-y-1.5">
                      <div className="text-xs font-bold text-nexa-text-secondary uppercase tracking-wider">
                        Parcel Specifications
                      </div>
                      <div className="text-sm font-semibold text-nexa-text-primary">
                        {selectedJob.parcelDescription}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-nexa-text-secondary pt-1">
                        <span>Weight: <strong className="text-nexa-text-primary">{selectedJob.weightKg} kg</strong></span>
                        <span>ETA: <strong className="text-nexa-text-primary">{selectedJob.estimatedDelivery}</strong></span>
                        <span>Priority: <strong className="text-nexa-text-primary">{selectedJob.priority}</strong></span>
                      </div>
                    </div>

                    {/* Exception Banner if Active */}
                    {selectedJob.status === "EXCEPTION" && (
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1 text-xs">
                        <div className="flex items-center gap-2 font-bold text-rose-600">
                          <AlertCircle className="w-4 h-4" />
                          <span>Active Exception: {selectedJob.exceptionReason}</span>
                        </div>
                        <p className="text-rose-600/90">
                          {selectedJob.exceptionNotes}
                        </p>
                      </div>
                    )}

                    {/* SMART RIDER ALLOCATION & DISPATCH ACTIONS */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-nexa-text-secondary uppercase tracking-wider">
                          Rider Assignment & Proximity Dispatch
                        </h3>
                        {selectedJob.courierName && (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Assigned to {selectedJob.courierName}
                          </span>
                        )}
                      </div>

                      {/* If assigned, show current courier card */}
                      {selectedJob.courierName ? (
                        <div className="p-4 rounded-xl bg-nexa-bg-base border border-blue-500/30 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                              <Bike className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-nexa-text-primary">
                                {selectedJob.courierName}
                              </div>
                              <div className="text-xs text-nexa-text-secondary">
                                {selectedJob.courierVehicle} • Plate: {selectedJob.courierPlate} • Rating: ⭐ {selectedJob.courierRating}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${selectedJob.courierPhone}`}
                              className="p-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary hover:bg-nexa-bg-base transition-colors"
                              title="Call Rider"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                            <NexaButton
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const nextCourier = couriers.find((c) => c.isAvailable && c.id !== selectedJob.courierId);
                                if (nextCourier) assignCourier(selectedJob.id, nextCourier.id);
                              }}
                              className="text-xs"
                            >
                              Reassign
                            </NexaButton>
                          </div>
                        </div>
                      ) : (
                        /* If unassigned, show proximity match list */
                        <div className="space-y-2">
                          <div className="text-xs text-nexa-text-secondary">
                            Select an available rider nearby to dispatch this package:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {couriers.filter((c) => c.isAvailable).map((courier) => (
                              <div
                                key={courier.id}
                                className="p-3 rounded-xl bg-nexa-bg-base border border-nexa-border flex items-center justify-between hover:border-blue-500 transition-all"
                              >
                                <div>
                                  <div className="font-bold text-xs text-nexa-text-primary">
                                    {courier.name}
                                  </div>
                                  <div className="text-[10px] text-nexa-text-secondary">
                                    {courier.vehicleType} • {courier.currentZone}
                                  </div>
                                  <div className="text-[10px] text-amber-500 font-semibold mt-0.5">
                                    ⭐ {courier.rating} ({courier.totalTrips} trips)
                                  </div>
                                </div>
                                <NexaButton
                                  size="sm"
                                  variant="primary"
                                  onClick={() => assignCourier(selectedJob.id, courier.id)}
                                  className="text-xs py-1"
                                >
                                  Assign
                                </NexaButton>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Milestone State Action Buttons */}
                      <div className="pt-3 border-t border-nexa-border flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {selectedJob.status === "ASSIGNED" && (
                            <NexaButton
                              size="sm"
                              variant="primary"
                              onClick={() => updateStatus(selectedJob.id, "PICKED_UP", "Rider confirmed package pickup at origin")}
                            >
                              Mark Picked Up
                            </NexaButton>
                          )}
                          {selectedJob.status === "PICKED_UP" && (
                            <NexaButton
                              size="sm"
                              variant="primary"
                              onClick={() => updateStatus(selectedJob.id, "IN_TRANSIT", "Rider in transit to destination")}
                            >
                              Mark In Transit
                            </NexaButton>
                          )}
                          {(selectedJob.status === "IN_TRANSIT" || selectedJob.status === "PICKED_UP") && (
                            <NexaButton
                              size="sm"
                              variant="primary"
                              onClick={() => setIsOtpModalOpen(true)}
                              leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                            >
                              Confirm Delivery (OTP)
                            </NexaButton>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <NexaButton
                            size="sm"
                            variant="outline"
                            onClick={() => setIsExceptionModalOpen(true)}
                            className="text-rose-600 hover:bg-rose-500/10 border-rose-500/30"
                          >
                            Flag Exception
                          </NexaButton>
                        </div>
                      </div>
                    </div>

                    {/* Embedded Mini Route Preview */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-nexa-text-secondary uppercase tracking-wider">
                        Geographical Route Preview
                      </div>
                      <div className="h-44 rounded-xl overflow-hidden border border-nexa-border">
                        <GoogleMap
                          center={selectedJob.destCoords}
                          zoom={13}
                          showNavigateButton={false}
                          className="w-full h-full"
                          markers={[
                            {
                              id: "origin",
                              lat: selectedJob.pickupCoords.lat,
                              lng: selectedJob.pickupCoords.lng,
                              title: `Origin: ${selectedJob.initiatorName}`,
                            },
                            {
                              id: "dest",
                              lat: selectedJob.destCoords.lat,
                              lng: selectedJob.destCoords.lng,
                              title: `Destination: ${selectedJob.recipientName}`,
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-16 text-center bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
                    <Package className="w-12 h-12 mx-auto text-nexa-text-secondary mb-3 opacity-40" />
                    <h3 className="text-base font-bold text-nexa-text-primary">Select a Waybill Job</h3>
                    <p className="text-xs text-nexa-text-secondary mt-1 max-w-sm mx-auto">
                      Choose an order from the queue on the left to review details, assign riders, or advance delivery milestones.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE FLEET TELEMETRY MAP */}
        {activeTab === "map" && (
          <div className="space-y-4">
            <div className="bg-nexa-surface border border-nexa-border rounded-xl shadow-sm p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-nexa-text-primary flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    Live Regional Fleet & Waybill Telemetry
                  </h3>
                  <p className="text-xs text-nexa-text-secondary">
                    Tracking {couriers.length} registered couriers across Lagos and active delivery destinations.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Available Riders ({couriers.filter((c) => c.isAvailable).length})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    In-Transit Waybills ({stats.activeDeliveries})
                  </span>
                </div>
              </div>

              <div className="h-[520px] rounded-xl overflow-hidden border border-nexa-border shadow-inner">
                <GoogleMap
                  center={{ lat: 6.5244, lng: 3.3792 }}
                  zoom={12}
                  className="w-full h-full"
                  markers={mapMarkers}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RIDER & FLEET MANAGEMENT */}
        {activeTab === "fleet" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-nexa-text-primary">Rider & Courier Roster</h3>
                <p className="text-xs text-nexa-text-secondary">Manage field drivers, vehicle allocations, availability, and trip histories.</p>
              </div>
              <NexaButton size="sm" variant="outline" leftIcon={<UserCheck className="w-3.5 h-3.5" />}>
                Verified Roster ({couriers.length})
              </NexaButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {couriers.map((courier) => (
                <div key={courier.id} className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-nexa-text-primary">{courier.name}</div>
                      <div className="text-xs text-nexa-text-secondary font-mono">{courier.plateNumber}</div>
                    </div>
                    <NexaBadge variant={courier.isAvailable ? "green" : "neutral"} dot>
                      {courier.isAvailable ? "Online & Ready" : "On Trip / Offline"}
                    </NexaBadge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-lg bg-nexa-bg-base border border-nexa-border">
                    <div>
                      <span className="text-nexa-text-secondary">Vehicle:</span>
                      <div className="font-bold text-nexa-text-primary">{courier.vehicleType}</div>
                    </div>
                    <div>
                      <span className="text-nexa-text-secondary">Operating Hub:</span>
                      <div className="font-bold text-nexa-text-primary">{courier.currentZone}</div>
                    </div>
                    <div>
                      <span className="text-nexa-text-secondary">Completed Trips:</span>
                      <div className="font-bold text-nexa-text-primary font-mono">{courier.totalTrips}</div>
                    </div>
                    <div>
                      <span className="text-nexa-text-secondary">Rating:</span>
                      <div className="font-bold text-amber-500">⭐ {courier.rating}</div>
                    </div>
                    {courier.batteryPct !== undefined && (
                      <div>
                        <span className="text-nexa-text-secondary">Battery Level:</span>
                        <div className="font-bold text-emerald-600 flex items-center gap-1">
                          🔋 {courier.batteryPct}%
                        </div>
                      </div>
                    )}
                    {courier.speed !== undefined && courier.speed > 0 && (
                      <div>
                        <span className="text-nexa-text-secondary">Live Speed:</span>
                        <div className="font-bold text-blue-600 flex items-center gap-1">
                          ⚡ {courier.speed.toFixed(0)} km/h
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-nexa-border flex items-center justify-between">
                    <a
                      href={`tel:${courier.phone}`}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Phone className="w-3 h-3" />
                      {courier.phone}
                    </a>
                    <button
                      onClick={() => toggleCourierAvailability(courier.id)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-nexa-border bg-nexa-bg-base hover:bg-nexa-surface transition-colors cursor-pointer"
                    >
                      Toggle {courier.isAvailable ? "Off-Duty" : "Available"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: EXCEPTIONS MANAGEMENT */}
        {activeTab === "exceptions" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-sm text-nexa-text-primary">Fulfillment Exceptions & Escalations</h3>
              <p className="text-xs text-nexa-text-secondary">Manage failed deliveries, unreachable recipients, damaged parcels, and cancellations.</p>
            </div>

            {jobs.filter((j) => j.status === "EXCEPTION").length === 0 ? (
              <div className="p-12 text-center bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2 opacity-80" />
                <h4 className="font-bold text-sm text-nexa-text-primary">Zero Active Exceptions</h4>
                <p className="text-xs text-nexa-text-secondary mt-1">All dispatched waybills are operating smoothly without milestone blockage.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.filter((j) => j.status === "EXCEPTION").map((job) => (
                  <div key={job.id} className="p-5 bg-nexa-surface border-l-4 border-l-rose-500 border border-nexa-border rounded-xl shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-blue-600">{job.trackingNumber}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                            {job.exceptionReason}
                          </span>
                        </div>
                        <div className="text-xs text-nexa-text-secondary mt-0.5">{job.orderNumber} • Assigned to {job.courierName}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-emerald-600">₦{job.shippingFee.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600">
                      <strong>Incident Log:</strong> {job.exceptionNotes}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-nexa-border text-xs">
                      <div className="text-nexa-text-secondary">
                        Drop-off: {job.recipientAddress} ({job.recipientPhone})
                      </div>
                      <div className="flex items-center gap-2">
                        <NexaButton
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const nextCourier = couriers.find((c) => c.isAvailable && c.id !== job.courierId);
                            if (nextCourier) assignCourier(job.id, nextCourier.id);
                          }}
                          className="text-xs"
                        >
                          Reassign to Next Rider
                        </NexaButton>
                        <NexaButton
                          size="sm"
                          variant="primary"
                          onClick={() => updateStatus(job.id, "IN_TRANSIT", "Exception cleared; delivery retried")}
                          className="text-xs"
                        >
                          Clear Exception & Retry
                        </NexaButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: TARIFFS & RATE CALCULATOR */}
        {activeTab === "rates" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Tariff Table (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div>
                <h3 className="font-bold text-sm text-nexa-text-primary">Zonal Tariff Rules</h3>
                <p className="text-xs text-nexa-text-secondary">Standard regional pricing rules configured for Nigerian logistics fulfillment.</p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-nexa-border bg-nexa-surface shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-nexa-bg-base/50 text-nexa-text-secondary font-semibold border-b border-nexa-border">
                    <tr>
                      <th className="p-3.5">Zone / Route</th>
                      <th className="p-3.5">Base Fee</th>
                      <th className="p-3.5">Per Kg Rate</th>
                      <th className="p-3.5">Estimated Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-nexa-border">
                    {zoneRates.map((rate) => (
                      <tr key={rate.id} className="hover:bg-nexa-bg-base/40 transition-colors">
                        <td className="p-3.5 font-medium text-nexa-text-primary">
                          {rate.zoneName}
                          <div className="text-[10px] text-nexa-text-secondary mt-0.5">{rate.originCity} ➔ {rate.destCity}</div>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-600">₦{rate.baseFee.toLocaleString()}</td>
                        <td className="p-3.5 font-mono">₦{rate.perKgFee.toLocaleString()} / kg</td>
                        <td className="p-3.5">{rate.estimatedDays} day{rate.estimatedDays > 1 ? "s" : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Instant Rate Calculator (5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-nexa-surface border border-nexa-border rounded-xl shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-nexa-text-primary">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Instant Rate Estimator
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-nexa-text-secondary font-medium mb-1">Origin Hub</label>
                    <select
                      value={calcOrigin}
                      onChange={(e) => setCalcOrigin(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-nexa-border bg-nexa-bg-base text-nexa-text-primary focus:outline-none focus:border-blue-500"
                    >
                      <option value="Lagos (Mainland)">Lagos Mainland (Ikeja, Yaba, Surulere)</option>
                      <option value="Lagos (Island)">Lagos Island (Lekki, VI, Ikoyi)</option>
                      <option value="Lagos Outskirts">Greater Lagos (Ikorodu, Epe)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-nexa-text-secondary font-medium mb-1">Destination Hub</label>
                    <select
                      value={calcDest}
                      onChange={(e) => setCalcDest(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-nexa-border bg-nexa-bg-base text-nexa-text-primary focus:outline-none focus:border-blue-500"
                    >
                      <option value="Lagos (Island)">Lagos Island (Lekki, VI, Ikoyi)</option>
                      <option value="Lagos (Mainland)">Lagos Mainland (Ikeja, Yaba, Surulere)</option>
                      <option value="Abuja">Abuja Interstate Express</option>
                      <option value="Port Harcourt">Port Harcourt Interstate Express</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-nexa-text-secondary font-medium mb-1">Package Weight (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-nexa-border bg-nexa-bg-base text-nexa-text-primary focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5 text-xs">
                  <div className="flex justify-between text-nexa-text-secondary">
                    <span>Base Tariff:</span>
                    <span className="font-mono">₦{activeRateMatch?.baseFee?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-nexa-text-secondary">
                    <span>Weight Add-on ({calcWeight} kg):</span>
                    <span className="font-mono">₦{(calcWeight * (activeRateMatch?.perKgFee || 400)).toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-500/20 flex justify-between font-bold text-sm text-emerald-600">
                    <span>Estimated Total:</span>
                    <span className="font-mono text-base font-bold">₦{calculatedFee.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: OTP PROOF-OF-DELIVERY CONFIRMATION */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-nexa-surface border border-nexa-border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-nexa-text-primary flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Proof of Delivery (OTP)
              </h3>
              <button onClick={() => setIsOtpModalOpen(false)} className="text-nexa-text-secondary hover:text-nexa-text-primary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-nexa-text-secondary">
              Enter the 4-digit verification code provided to <strong>{selectedJob?.recipientName}</strong> to finalize and close this waybill.
            </p>

            {otpError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-semibold">
                {otpError}
              </div>
            )}

            <div>
              <input
                type="text"
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="e.g. 4829"
                className="w-full text-center tracking-widest font-mono text-2xl font-black p-3 rounded-xl border border-nexa-border bg-nexa-bg-base text-nexa-text-primary focus:outline-none focus:border-emerald-500"
              />
              <div className="text-center text-[10px] text-nexa-text-secondary mt-1">
                (Dispatcher Test Bypass Code: {selectedJob?.deliveryOtp})
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <NexaButton size="sm" variant="outline" onClick={() => setIsOtpModalOpen(false)}>
                Cancel
              </NexaButton>
              <NexaButton size="sm" variant="primary" onClick={handleOtpConfirm}>
                Verify & Complete
              </NexaButton>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REPORT EXCEPTION */}
      {isExceptionModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-nexa-surface border border-nexa-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Report Delivery Exception
              </h3>
              <button onClick={() => setIsExceptionModalOpen(false)} className="text-nexa-text-secondary hover:text-nexa-text-primary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-nexa-text-secondary font-medium mb-1">Reason for Exception</label>
                <select
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-nexa-border bg-nexa-bg-base text-nexa-text-primary focus:outline-none focus:border-blue-500"
                >
                  <option value="Customer Unreachable">Customer Unreachable (Phone Off / No Answer)</option>
                  <option value="Incorrect Address">Incorrect Address / Landmark Not Found</option>
                  <option value="Gate Access Denied">Gate Access Denied / Security Clearance Lacking</option>
                  <option value="Damaged Goods">Parcel Damaged / Refused by Recipient</option>
                  <option value="Rider Vehicle Breakdown">Rider Vehicle Breakdown En-Route</option>
                </select>
              </div>

              <div>
                <label className="block text-nexa-text-secondary font-medium mb-1">Dispatcher Operational Notes</label>
                <textarea
                  rows={3}
                  value={exceptionNotes}
                  onChange={(e) => setExceptionNotes(e.target.value)}
                  placeholder="Detail attempts made to contact customer or driver..."
                  className="w-full p-2.5 rounded-lg border border-nexa-border bg-nexa-bg-base text-nexa-text-primary focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <NexaButton size="sm" variant="outline" onClick={() => setIsExceptionModalOpen(false)}>
                Cancel
              </NexaButton>
              <NexaButton size="sm" variant="primary" onClick={handleReportExceptionSubmit} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
                Log Exception
              </NexaButton>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: BOOK NEW DISPATCH TICKET */}
      {isNewJobModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-nexa-surface border border-nexa-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-nexa-text-primary flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Book New Dispatch Ticket
              </h3>
              <button onClick={() => setIsNewJobModalOpen(false)} className="text-nexa-text-secondary hover:text-nexa-text-primary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJobSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-nexa-text-secondary font-medium mb-1">Dispatch Stream</label>
                  <select
                    value={newJobForm.type}
                    onChange={(e) => setNewJobForm({ ...newJobForm, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg border border-nexa-border bg-nexa-bg-base text-nexa-text-primary focus:outline-none focus:border-blue-500"
                  >
                    <option value="VENDOR_DISPATCH">Type B • Vendor Dispatch</option>
                    <option value="CUSTOMER_PICKUP">Type C • Customer Pickup</option>
                    <option value="VENDOR_PICKUP">Type D • Vendor Inbound</option>
                  </select>
                </div>
                <div>
                  <label className="block text-nexa-text-secondary font-medium mb-1">Priority</label>
                  <select
                    value={newJobForm.priority}
                    onChange={(e) => setNewJobForm({ ...newJobForm, priority: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg border border-nexa-border bg-nexa-bg-base text-nexa-text-primary focus:outline-none focus:border-blue-500"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent Express</option>
                  </select>
                </div>
              </div>

              {/* Origin Details */}
              <div className="p-4 rounded-xl bg-nexa-bg-base border border-nexa-border space-y-2">
                <div className="font-bold text-nexa-text-primary">1. Origin & Pickup Contact</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Sender / Business Name"
                    value={newJobForm.initiatorName}
                    onChange={(e) => setNewJobForm({ ...newJobForm, initiatorName: e.target.value })}
                    className="p-2.5 rounded-lg border border-nexa-border bg-nexa-surface text-nexa-text-primary focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Sender Phone (+234...)"
                    value={newJobForm.initiatorPhone}
                    onChange={(e) => setNewJobForm({ ...newJobForm, initiatorPhone: e.target.value })}
                    className="p-2.5 rounded-lg border border-nexa-border bg-nexa-surface text-nexa-text-primary focus:outline-none focus:border-blue-500"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Full Pickup Address (e.g. 14 Admiralty Way, Lekki)"
                  value={newJobForm.pickupAddress}
                  onChange={(e) => setNewJobForm({ ...newJobForm, pickupAddress: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-nexa-border bg-nexa-surface text-nexa-text-primary focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Destination Details */}
              <div className="p-4 rounded-xl bg-nexa-bg-base border border-nexa-border space-y-2">
                <div className="font-bold text-nexa-text-primary">2. Destination & Recipient Contact</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Recipient Name"
                    value={newJobForm.recipientName}
                    onChange={(e) => setNewJobForm({ ...newJobForm, recipientName: e.target.value })}
                    className="p-2.5 rounded-lg border border-nexa-border bg-nexa-surface text-nexa-text-primary focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Recipient Phone (+234...)"
                    value={newJobForm.recipientPhone}
                    onChange={(e) => setNewJobForm({ ...newJobForm, recipientPhone: e.target.value })}
                    className="p-2.5 rounded-lg border border-nexa-border bg-nexa-surface text-nexa-text-primary focus:outline-none focus:border-blue-500"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Full Delivery Address (e.g. Ahmadu Bello Way, VI)"
                  value={newJobForm.recipientAddress}
                  onChange={(e) => setNewJobForm({ ...newJobForm, recipientAddress: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-nexa-border bg-nexa-surface text-nexa-text-primary focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Package Details */}
              <div className="p-4 rounded-xl bg-nexa-bg-base border border-nexa-border space-y-2">
                <div className="font-bold text-nexa-text-primary">3. Package & Fee</div>
                <input
                  type="text"
                  required
                  placeholder="Parcel Contents / Description"
                  value={newJobForm.parcelDescription}
                  onChange={(e) => setNewJobForm({ ...newJobForm, parcelDescription: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-nexa-border bg-nexa-surface text-nexa-text-primary focus:outline-none focus:border-blue-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-nexa-text-secondary mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={newJobForm.weightKg}
                      onChange={(e) => setNewJobForm({ ...newJobForm, weightKg: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-lg border border-nexa-border bg-nexa-surface text-nexa-text-primary focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-nexa-text-secondary mb-1">Delivery Fee (₦)</label>
                    <input
                      type="number"
                      value={newJobForm.shippingFee}
                      onChange={(e) => setNewJobForm({ ...newJobForm, shippingFee: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-lg border border-nexa-border bg-nexa-surface text-nexa-text-primary font-mono font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <NexaButton size="sm" variant="outline" type="button" onClick={() => setIsNewJobModalOpen(false)}>
                  Cancel
                </NexaButton>
                <NexaButton size="sm" variant="primary" type="submit">
                  Queue Dispatch Job
                </NexaButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpAdminShell>
  );
}
