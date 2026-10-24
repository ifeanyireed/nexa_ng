"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Map as MapIcon, 
  Car, 
  Bike,
  Truck,
  User, 
  AlertCircle, 
  Filter,
  PhoneCall,
  Navigation,
  Radio,
  Clock,
  CheckCircle2,
  Package,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  MapPin,
  Check
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaModal } from "@/components/nexa/NexaModal";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";
import { DispatchJob, CourierDriver, JobStatus } from "@/lib/dispatch-types";

export default function OpsCommandCentre() {
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);
  const tenantSlug = (activeTenant?.slug || "").toLowerCase().trim();

  const [jobs, setJobs] = useState<DispatchJob[]>([]);
  const [couriers, setCouriers] = useState<CourierDriver[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"ALL" | "PENDING" | "ASSIGNED" | "IN_TRANSIT" | "DELIVERED">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [assigningJob, setAssigningJob] = useState<DispatchJob | null>(null);
  const [selectedCourierId, setSelectedCourierId] = useState<string>("DRV-101");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Fetch live dispatch telemetry strictly for active tenant's dedicated database
  const fetchDispatchData = useCallback(async (isSilent = false) => {
    if (!tenantSlug) return;
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await fetch(`/api/erp/dispatch?tenant=${encodeURIComponent(tenantSlug)}`, {
        headers: {
          "X-Tenant-Slug": tenantSlug,
          "X-Org-ID": tenantSlug,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const fetchedJobs: DispatchJob[] = data.jobs || [];
          setJobs(fetchedJobs);
          if (data.couriers) setCouriers(data.couriers);

          setSelectedJobId((prev) => {
            if (prev && fetchedJobs.some((j) => j.id === prev)) return prev;
            return fetchedJobs.length > 0 ? fetchedJobs[0].id : null;
          });
        }
      }
    } catch (err) {
      console.warn("[OpsCommandCentre] Live dispatch fetch warning:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [tenantSlug]);

  useEffect(() => {
    fetchDispatchData();
    // Live radar interval every 8 seconds
    const interval = setInterval(() => {
      fetchDispatchData(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchDispatchData]);

  // Handle Courier Driver Allocation
  const handleAssignDriver = async (job: DispatchJob, courierId: string) => {
    if (!tenantSlug || !job) return;

    try {
      const res = await fetch("/api/erp/dispatch", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Slug": tenantSlug,
          "X-Org-ID": tenantSlug,
        },
        body: JSON.stringify({
          jobId: job.id,
          action: "ASSIGN_COURIER",
          courierId: courierId,
          status: "ASSIGNED",
        }),
      });

      if (res.ok) {
        setAssigningJob(null);
        const assignedCourier = couriers.find((c) => c.id === courierId);
        setActionSuccessMsg(`Assigned driver ${assignedCourier?.name || courierId} to #${job.trackingNumber}`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
        await fetchDispatchData(true);
      }
    } catch (err: any) {
      console.error("[OpsCommandCentre] Driver assignment failed:", err);
    }
  };

  // Handle Dispatch State Transitions
  const handleUpdateStatus = async (jobId: string, targetStatus: JobStatus) => {
    if (!tenantSlug) return;

    try {
      const res = await fetch("/api/erp/dispatch", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Slug": tenantSlug,
          "X-Org-ID": tenantSlug,
        },
        body: JSON.stringify({
          jobId,
          action: targetStatus === "IN_TRANSIT" ? "DISPATCH_START" : "UPDATE_STATUS",
          status: targetStatus,
        }),
      });

      if (res.ok) {
        setActionSuccessMsg(`Trip #${jobId} transitioned to ${targetStatus.replace("_", " ")}`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
        await fetchDispatchData(true);
      }
    } catch (err: any) {
      console.error("[OpsCommandCentre] Status transition failed:", err);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (filterType === "ALL") return true;
    return j.status === filterType;
  });

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0] || null;
  const assignedCourier = couriers.find((c) => c.id === selectedJob?.courierId) || couriers[0];

  const pendingCount = jobs.filter((j) => j.status === "PENDING").length;
  const inTransitCount = jobs.filter((j) => j.status === "IN_TRANSIT" || j.status === "ASSIGNED").length;
  const deliveredCount = jobs.filter((j) => j.status === "DELIVERED").length;

  return (
    <ErpAdminShell
      title="Live Operations Command Centre"
      subtitle={`Real-time vehicle dispatch, telemetry radar, and automated driver allocation for ${tenantSlug ? tenantSlug.toUpperCase() : "Active Tenant"}.`}
      activeModule="mobility"
      action={
        <div className="flex items-center gap-2">
          <NexaButton
            size="sm"
            variant="outline"
            onClick={() => fetchDispatchData(false)}
            disabled={isRefreshing}
            className="gap-2 text-xs rounded-full"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />}
          >
            {isRefreshing ? "Syncing..." : "Sync Radar"}
          </NexaButton>

          <Link href="/erp/admin/dispatch">
            <NexaButton size="sm" variant="outline" className="gap-2 text-xs rounded-full" leftIcon={<Navigation className="w-3.5 h-3.5" />}>
              Advanced Dispatch Desk
            </NexaButton>
          </Link>

          <Link href="/erp/admin/shop/orders">
            <NexaButton size="sm" variant="primary" className="gap-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-full">
              Omnichannel Orders
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="flex flex-col h-[calc(100vh-14rem)] bg-nexa-surface border border-nexa-border rounded-2xl overflow-hidden shadow-sm">
        {/* ACTION SUCCESS BANNER */}
        {actionSuccessMsg && (
          <div className="px-4 py-2 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-700 text-xs font-semibold flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {actionSuccessMsg}
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-600 text-white">Live Dispatched</span>
          </div>
        )}

        {/* Main Content Area - Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Incoming & Live Requests */}
          <div className="w-84 flex-none border-r border-nexa-border bg-nexa-bg-base/40 overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-nexa-border bg-nexa-surface sticky top-0 z-10 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm text-nexa-text-primary flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  Dispatch Queue
                </h2>
                <span className="text-[11px] font-mono font-bold text-nexa-text-secondary">
                  {jobs.length} Active
                </span>
              </div>

              {/* Status filter pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: "ALL", label: `All (${jobs.length})` },
                  { id: "PENDING", label: `Unassigned (${pendingCount})` },
                  { id: "ASSIGNED", label: "Assigned" },
                  { id: "IN_TRANSIT", label: `In Transit (${inTransitCount})` },
                  { id: "DELIVERED", label: `Delivered (${deliveredCount})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                      filterType === f.id
                        ? "bg-blue-600 text-white"
                        : "bg-nexa-surface text-nexa-text-secondary border border-nexa-border hover:text-nexa-text-primary"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Jobs List */}
            <div className="p-3 space-y-2.5 flex-1 overflow-y-auto">
              {isLoading && jobs.length === 0 ? (
                <div className="text-center py-12 text-xs text-nexa-text-secondary space-y-2">
                  <RefreshCw className="w-5 h-5 mx-auto animate-spin text-blue-600" />
                  <p>Connecting to Dedicated Fleet DB...</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-12 text-xs text-nexa-text-secondary space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
                  <p className="font-bold text-nexa-text-primary">Dispatch Queue Clear</p>
                  <p className="text-[11px]">All vehicle dispatches and deliveries allocated.</p>
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const isSelected = selectedJob?.id === job.id;
                  const isPending = job.status === "PENDING";
                  const isDelivered = job.status === "DELIVERED";

                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-50/70 border-blue-500 shadow-sm"
                          : "bg-nexa-surface border-nexa-border hover:border-blue-300"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isPending
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : isDelivered
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {job.status.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-nexa-text-secondary font-mono">
                          {job.createdAt || "Just now"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-xs text-nexa-text-primary">
                          #{job.trackingNumber}
                        </h3>
                        <span className="text-[11px] font-mono font-bold text-emerald-600">
                          ₦{(job.shippingFee || 2500).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-[11px] text-nexa-text-secondary mt-0.5 truncate font-medium">
                        {job.parcelDescription || "Express Merchandise Delivery"}
                      </p>

                      <div className="mt-2.5 space-y-1 text-xs text-nexa-text-secondary">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate text-[11px]">{job.pickupAddress}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                          <span className="truncate text-[11px] font-medium text-nexa-text-primary">
                            {job.recipientAddress} ({job.recipientName})
                          </span>
                        </div>
                      </div>

                      {/* 1-Click Action Buttons */}
                      <div className="mt-3 pt-2.5 border-t border-nexa-border/60 flex items-center gap-2">
                        {isPending ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssigningJob(job);
                            }}
                            className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm"
                          >
                            <User className="w-3 h-3" /> Assign Driver
                          </button>
                        ) : job.status === "ASSIGNED" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(job.id, "IN_TRANSIT");
                            }}
                            className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Bike className="w-3 h-3" /> Handover to Courier
                          </button>
                        ) : job.status === "IN_TRANSIT" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(job.id, "DELIVERED");
                            }}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Verify & Complete (OTP)
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Delivery Verified
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Center Panel - Live Radar Telemetry Canvas */}
          <div className="flex-1 bg-nexa-bg-base/70 relative flex flex-col overflow-hidden">
            {/* Background Grid Accent */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, #3B82F6 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {selectedJob ? (
              <div className="relative z-10 flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
                {/* Active Trip Header */}
                <div className="p-5 rounded-2xl bg-nexa-surface border border-nexa-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                        {selectedJob.type}
                      </span>
                      <span className="text-xs text-nexa-text-secondary font-mono">
                        Waybill: #{selectedJob.trackingNumber}
                      </span>
                    </div>
                    <h1 className="text-lg font-bold text-nexa-text-primary">
                      {selectedJob.parcelDescription || "Standard Courier Delivery"}
                    </h1>
                    <p className="text-xs text-nexa-text-secondary">
                      Recipient: <strong>{selectedJob.recipientName}</strong> ({selectedJob.recipientPhone})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-[10px] text-nexa-text-secondary uppercase font-semibold">Delivery OTP</div>
                      <div className="text-base font-black font-mono text-blue-600">
                        {selectedJob.deliveryOtp || "8291"}
                      </div>
                    </div>

                    {selectedJob.status === "PENDING" && (
                      <NexaButton
                        size="sm"
                        variant="primary"
                        onClick={() => setAssigningJob(selectedJob)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                        leftIcon={<User className="w-3.5 h-3.5" />}
                      >
                        Assign Driver
                      </NexaButton>
                    )}

                    {selectedJob.status === "ASSIGNED" && (
                      <NexaButton
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateStatus(selectedJob.id, "IN_TRANSIT")}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                        leftIcon={<Bike className="w-3.5 h-3.5" />}
                      >
                        Start Delivery
                      </NexaButton>
                    )}

                    {selectedJob.status === "IN_TRANSIT" && (
                      <NexaButton
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateStatus(selectedJob.id, "DELIVERED")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Confirm Delivery
                      </NexaButton>
                    )}
                  </div>
                </div>

                {/* Visual SVG Telemetry Radar */}
                <div className="p-6 rounded-2xl bg-[#090D16] border border-stone-800 text-white space-y-4 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-white">Live RTK Route Radar</span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">
                      ETA: {selectedJob.status === "DELIVERED" ? "Delivered" : "Within 35 mins"}
                    </span>
                  </div>

                  {/* SVG Route Visualization */}
                  <div className="h-44 w-full flex items-center justify-center relative">
                    <svg className="w-full h-full" viewBox="0 0 700 160" preserveAspectRatio="none">
                      <line x1="80" y1="80" x2="620" y2="80" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
                      <line
                        x1="80"
                        y1="80"
                        x2={selectedJob.status === "DELIVERED" ? "620" : selectedJob.status === "IN_TRANSIT" ? "420" : "180"}
                        y2="80"
                        stroke="#3B82F6"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                      
                      {/* Origin Hub */}
                      <circle cx="80" cy="80" r="14" fill="#10B981" />
                      <text x="80" y="115" textAnchor="middle" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">
                        Atelier Hub
                      </text>

                      {/* Destination Pin */}
                      <circle cx="620" cy="80" r="14" fill="#EF4444" />
                      <text x="620" y="115" textAnchor="middle" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">
                        Recipient Dropoff
                      </text>

                      {/* Moving Rider Marker */}
                      <circle
                        cx={selectedJob.status === "DELIVERED" ? "620" : selectedJob.status === "IN_TRANSIT" ? "420" : "180"}
                        cy="80"
                        r="18"
                        fill="#3B82F6"
                        stroke="#FFFFFF"
                        strokeWidth="3"
                        className="animate-pulse"
                      />
                    </svg>
                  </div>

                  {/* Waypoints breakdown */}
                  <div className="grid grid-cols-2 gap-4 pt-2 text-xs border-t border-white/10">
                    <div>
                      <div className="text-[10px] text-zinc-400 font-semibold uppercase">Origin Pickup</div>
                      <div className="font-bold text-white truncate mt-0.5">{selectedJob.pickupAddress}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-400 font-semibold uppercase">Destination Dropoff</div>
                      <div className="font-bold text-white truncate mt-0.5">{selectedJob.recipientAddress}</div>
                    </div>
                  </div>
                </div>

                {/* Assigned Courier Dossier Card */}
                <div className="p-5 rounded-2xl bg-nexa-surface border border-nexa-border shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-base">
                      {assignedCourier?.vehicleType === "VAN" ? <Truck className="w-6 h-6" /> : <Bike className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-nexa-text-primary">
                          {selectedJob.courierId ? assignedCourier?.name : "Awaiting Courier Allocation"}
                        </h4>
                        {selectedJob.courierId && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            On Duty
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-nexa-text-secondary mt-0.5">
                        Plate: <span className="font-mono font-bold text-nexa-text-primary">{assignedCourier?.plateNumber || "Fleet Pending"}</span> · {assignedCourier?.vehicleType || "MOTORBIKE"}
                      </p>
                    </div>
                  </div>

                  {selectedJob.courierId && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${assignedCourier?.phone}`}
                        className="p-2.5 rounded-xl border border-nexa-border hover:bg-nexa-bg-base text-nexa-text-primary transition-colors"
                        title="Call Dispatch Courier"
                      >
                        <PhoneCall className="w-4 h-4 text-emerald-600" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="z-10 flex flex-col items-center justify-center text-center p-6 text-nexa-text-secondary flex-1">
                <MapIcon className="w-16 h-16 mb-4 text-blue-500/40" />
                <p className="font-semibold text-nexa-text-primary">Live Operations Engine Active</p>
                <p className="text-xs max-w-sm mt-1">Select an active order or pickup request from the left queue to view RTK radar telemetry.</p>
              </div>
            )}
          </div>

          {/* Right Panel - Driver Fleet Roster & Timeline */}
          <div className="w-80 flex-none border-l border-nexa-border bg-nexa-surface flex flex-col">
            <div className="p-4 border-b border-nexa-border flex items-center justify-between">
              <h2 className="font-semibold text-sm text-nexa-text-primary flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Fleet Drivers
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                {couriers.length} Drivers
              </span>
            </div>

            {/* Couriers List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {couriers.map((courier) => (
                <div
                  key={courier.id}
                  className="p-3 rounded-xl border border-nexa-border bg-nexa-bg-base/30 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-nexa-text-primary">{courier.name}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        courier.isAvailable ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-nexa-text-secondary">
                    <span>{courier.vehicleType} · {courier.plateNumber}</span>
                    <span className="font-mono">{courier.currentZone}</span>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-nexa-text-secondary">
                    <span>⭐ {courier.rating} ({courier.totalTrips} trips)</span>
                    <span className="text-emerald-600 font-semibold">{courier.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DRIVER ALLOCATION MODAL */}
      <NexaModal
        isOpen={!!assigningJob}
        onClose={() => setAssigningJob(null)}
        title={`Assign Courier Driver · Waybill #${assigningJob?.trackingNumber}`}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-nexa-bg-base border border-nexa-border text-xs space-y-1">
            <div className="font-bold text-nexa-text-primary">{assigningJob?.recipientName}</div>
            <div className="text-nexa-text-secondary truncate">{assigningJob?.recipientAddress}</div>
            <div className="text-blue-600 font-mono font-bold mt-1">
              Fare: ₦{(assigningJob?.shippingFee || 2500).toLocaleString()}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-nexa-text-primary block">
              Select Available Courier / Fleet Rider
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {couriers.map((c) => (
                <label
                  key={c.id}
                  onClick={() => setSelectedCourierId(c.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedCourierId === c.id
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-nexa-border hover:bg-nexa-bg-base"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {c.vehicleType === "VAN" ? <Truck className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-nexa-text-primary">{c.name}</div>
                      <div className="text-[11px] text-nexa-text-secondary">
                        {c.vehicleType} · {c.plateNumber} ({c.currentZone})
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="courier_choice"
                    checked={selectedCourierId === c.id}
                    onChange={() => setSelectedCourierId(c.id)}
                    className="accent-blue-600"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <NexaButton
              size="md"
              variant="outline"
              onClick={() => setAssigningJob(null)}
              className="flex-1"
            >
              Cancel
            </NexaButton>
            <NexaButton
              size="md"
              variant="primary"
              onClick={() => assigningJob && handleAssignDriver(assigningJob, selectedCourierId)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
              leftIcon={<Check className="w-4 h-4" />}
            >
              Confirm Driver Allocation
            </NexaButton>
          </div>
        </div>
      </NexaModal>
    </ErpAdminShell>
  );
}
