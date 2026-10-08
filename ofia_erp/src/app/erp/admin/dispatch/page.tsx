"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Bike,
  Banknote,
  Activity,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Users,
  TrendingUp,
  MapPin,
  Radio,
  FileCheck2,
  Package,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Search,
  Filter,
  DollarSign,
  Compass,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import {
  DispatchJob,
  CourierDriver,
  INITIAL_DISPATCH_JOBS,
  INITIAL_COURIERS,
  INITIAL_ZONE_RATES,
  JobStatus,
} from "@/lib/dispatch-types";

export default function DispatchTenantAdminCommandCentre() {
  const [jobs, setJobs] = useState<DispatchJob[]>(INITIAL_DISPATCH_JOBS);
  const [couriers, setCouriers] = useState<CourierDriver[]>(INITIAL_COURIERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/erp/dispatch")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.jobs) setJobs(data.jobs);
          if (data.couriers) setCouriers(data.couriers);
        }
      })
      .catch((err) => console.warn("Failed to load dispatch admin metrics:", err));
  }, []);

  // Operational calculations
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

  // Filtered jobs table
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.recipientAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.courierName && job.courierName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && (job.status === "IN_TRANSIT" || job.status === "PICKED_UP")) ||
        (statusFilter === "DELIVERED" && job.status === "DELIVERED") ||
        (statusFilter === "PENDING" && (job.status === "PENDING" || job.status === "ASSIGNED")) ||
        (statusFilter === "EXCEPTION" && job.status === "EXCEPTION");

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchTerm, statusFilter]);

  return (
    <ErpAdminShell
      title="Ofia Dispatch Manager"
      subtitle="Your daily operations, revenue, courier fleet, and delivery fulfillment status at a glance."
      activeModule="dispatch"
      subTabs={[]}
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/ops/dispatch">
            <NexaButton size="sm" variant="primary" className="gap-2 text-xs">
              <Radio className="w-4 h-4 animate-pulse" />
              Live Ops Console
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* 1. TOP KPI CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue Today */}
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Revenue Today</h3>
              <Banknote className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">
              ₦{totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs yesterday
            </p>
          </div>

          {/* Active Deliveries */}
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Active Deliveries</h3>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">{activeJobs}</p>
            <p className="text-xs text-nexa-text-secondary mt-2">
              {completedJobs} deliveries completed today
            </p>
          </div>

          {/* Available Couriers */}
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Available Couriers</h3>
              <Bike className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">
              {availableRiders} / {couriers.length}
            </p>
            <p className="text-xs text-nexa-text-secondary mt-2">
              {activeRiders} on route, {offlineRiders} off-duty
            </p>
          </div>

          {/* Dispatch Queue */}
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Dispatch Queue</h3>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">
              {pendingJobs} Pending
            </p>
            <p className="text-xs text-nexa-text-secondary mt-2">
              {unassignedJobs} unassigned, {exceptionJobs} exception{exceptionJobs === 1 ? "" : "s"}
            </p>
          </div>
        </section>

        {/* 2. FLEET STATUS & ATTENTION REQUIRED */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courier Fleet Status & Channels (2 Cols) */}
          <section className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-nexa-text-primary mb-4">
                Courier Fleet Status
              </h2>
              <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm p-6">
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 rounded-full border-8 border-nexa-border/60 flex items-center justify-center relative">
                    <span className="text-xl font-bold text-nexa-text-primary">
                      {couriers.length}
                    </span>
                    <span className="absolute bottom-6 text-xs text-nexa-text-secondary">Total</span>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span> Active (On Delivery)
                      </span>
                      <span className="font-semibold text-nexa-text-primary">{activeRiders}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Available (Standby)
                      </span>
                      <span className="font-semibold text-nexa-text-primary">{availableRiders}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500"></span> Break / Idle
                      </span>
                      <span className="font-semibold text-nexa-text-primary">{breakRiders}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-slate-400"></span> Offline / Off-Duty
                      </span>
                      <span className="font-semibold text-nexa-text-primary">{offlineRiders}</span>
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
            <h2 className="text-lg font-semibold text-nexa-text-primary mb-4">
              Attention Required
            </h2>
            <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm p-4 space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Delivery Exception Alert</p>
                  <p className="text-xs mt-1 text-nexa-text-secondary">
                    Waybill OF-DISP-9904 restricted by estate security at Victoria Garden City.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-lg">
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Unassigned Urgent Waybill</p>
                  <p className="text-xs mt-1 text-nexa-text-secondary">
                    Store order OF-ORD-8823 waiting &gt; 15 mins for rider pickup in Ikeja.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 rounded-lg">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Rider License & Transit Badge</p>
                  <p className="text-xs mt-1 text-nexa-text-secondary">
                    Rider Babatunde Raji LASDRI commercial badge expires in 3 days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-lg">
                <FileCheck2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Pending OTP Handover</p>
                  <p className="text-xs mt-1 text-nexa-text-secondary">
                    Waybill OF-DISP-1002 arrived at drop-off; awaiting recipient PIN verification.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 3. RECENT WAYBILLS FULFILLMENT LEDGER */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-nexa-text-primary">
              Recent Waybills Fulfillment Ledger
            </h2>
            <Link href="/erp/ops/dispatch">
              <NexaButton size="sm" variant="outline" className="text-xs gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                Open Live Queue ({jobs.length})
              </NexaButton>
            </Link>
          </div>

          <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm overflow-hidden">
            {/* Table Control Bar */}
            <div className="p-4 border-b border-nexa-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {["ALL", "ACTIVE", "DELIVERED", "PENDING", "EXCEPTION"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      statusFilter === tab
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-nexa-border text-xs">
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-nexa-text-secondary">
                        No waybills found matching the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-nexa-bg-base/30 transition-colors">
                        <td className="p-4">
                          <span className="font-mono font-bold text-blue-600">
                            {job.trackingNumber}
                          </span>
                          <div className="text-[11px] text-nexa-text-secondary mt-0.5">
                            {job.orderNumber}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="text-[11px] font-semibold text-nexa-text-secondary">
                            {job.type.replace("_", " ")}
                          </span>
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
                          <NexaBadge
                            variant={
                              job.status === "DELIVERED"
                                ? "green"
                                : job.status === "IN_TRANSIT"
                                ? "cyan"
                                : job.status === "EXCEPTION"
                                ? "danger"
                                : job.status === "PICKED_UP"
                                ? "blue"
                                : "neutral"
                            }
                            className="text-[10px]"
                          >
                            {job.status}
                          </NexaBadge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4. ZONE TARIFFS & COVERAGE ENGINE */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-nexa-text-primary">
                Zone Tariffs & Coverage Engine
              </h2>
              <p className="text-xs text-nexa-text-secondary">
                Standard baseline pricing policies and delivery radius governance
              </p>
            </div>
            <Link href="/erp/ops/dispatch">
              <NexaButton size="sm" variant="outline" className="text-xs">
                Configure Pricing Matrix
              </NexaButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INITIAL_ZONE_RATES.map((zone) => (
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
    </ErpAdminShell>
  );
}
