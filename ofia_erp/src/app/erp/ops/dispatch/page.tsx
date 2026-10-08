"use client";

import React, { useState } from "react";
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

export default function DispatcherOperationsPortal() {
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

  const [activeTab, setActiveTab] = useState<"queue" | "map" | "fleet" | "exceptions" | "rates">("queue");
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
    }
  };

  // Calculate live rate quote
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
      subtitle: `${c.vehicleType} • ${c.isAvailable ? "Available" : "Busy on trip"}`,
    })),
  ];

  return (
    <ErpAdminShell
      title="Dispatch Operator"
      subtitle="Operational control center for dispatch agents, store-order fulfillment, vendor dispatches, and rider fleet management."
      activeModule="dispatch"
      subTabs={[]}
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
      <div className="space-y-8">
        {/* 1. OPERATIONS OVERVIEW KPI SUMMARY */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Active Deliveries</h3>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary font-mono">{stats.activeDeliveries}</p>
            <p className="text-xs text-blue-600 mt-2 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse inline-block" /> En route or picked up
            </p>
          </div>

          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Pending Queue</h3>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary font-mono">{stats.pendingQueue}</p>
            <p className="text-xs text-nexa-text-secondary mt-2">Requires rider allocation</p>
          </div>

          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Available Couriers</h3>
              <Bike className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary font-mono">{stats.availableCouriers}</p>
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active GPS online
            </p>
          </div>

          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Delivered Today</h3>
              <Package className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary font-mono">{stats.deliveredToday}</p>
            <p className="text-xs text-nexa-text-secondary mt-2">Waybills fulfilled</p>
          </div>

          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Live Exceptions</h3>
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary font-mono">{stats.exceptionsCount}</p>
            <p className="text-xs text-rose-600 mt-2 flex items-center gap-1 font-medium">
              {stats.exceptionsCount > 0 ? "Action required" : "Zero active blockers"}
            </p>
          </div>
        </section>

        {/* 2. TAB NAVIGATION BAR */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-nexa-border">
          {[
            { id: "queue", label: "Dispatch Console", icon: Bike, badge: jobs.length.toString() },
            { id: "map", label: "Live Fleet Map", icon: Navigation },
            { id: "fleet", label: "Rider Management", icon: Users, badge: couriers.length.toString() },
            { id: "exceptions", label: "Exceptions", icon: AlertTriangle, badge: stats.exceptionsCount > 0 ? stats.exceptionsCount.toString() : undefined },
            { id: "rates", label: "Tariff & Quotes", icon: DollarSign },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
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

        {/* 3. TAB CONTENT 1: DISPATCH QUEUE & SPLIT CONSOLE */}
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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

        {/* 4. TAB CONTENT 2: LIVE FLEET TELEMETRY MAP */}
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

        {/* 5. TAB CONTENT 3: RIDER & FLEET MANAGEMENT */}
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
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-nexa-border bg-nexa-bg-base hover:bg-nexa-surface transition-colors"
                    >
                      Toggle {courier.isAvailable ? "Off-Duty" : "Available"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. TAB CONTENT 4: EXCEPTIONS MANAGEMENT */}
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

        {/* 7. TAB CONTENT 5: TARIFFS & RATE CALCULATOR */}
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
              <button onClick={() => setIsOtpModalOpen(false)} className="text-nexa-text-secondary hover:text-nexa-text-primary">
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
              <button onClick={() => setIsExceptionModalOpen(false)} className="text-nexa-text-secondary hover:text-nexa-text-primary">
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
              <button onClick={() => setIsNewJobModalOpen(false)} className="text-nexa-text-secondary hover:text-nexa-text-primary">
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
