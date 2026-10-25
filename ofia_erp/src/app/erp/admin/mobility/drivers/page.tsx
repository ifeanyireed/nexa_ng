"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  User,
  Users,
  Star,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Car,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Award,
  AlertTriangle,
  X,
  Check,
  FileText,
  ChevronRight,
  RefreshCw,
  BadgeCheck,
  MapPin,
  Briefcase
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { Pagination } from "@/components/nexa/Pagination";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant, extractSubdomainOrParam } from "@/lib/tenant-context";

export interface DriverVerifications {
  identity: "Verified" | "Pending" | "Action Needed";
  license: "Verified" | "Pending" | "Action Needed";
  background: "Verified" | "Pending" | "Action Needed";
  overall: "Verified" | "Action Needed" | "Pending";
}

export interface DriverProfile {
  id: string;
  name: string;
  employeeId: string;
  phone: string;
  email: string;
  designation: string;
  region: string;
  assignedPlate: string;
  assignedVehicleType: string;
  licenseNumber: string;
  licenseExpiry: string;
  lasdriCertified: boolean;
  status: "Active" | "Online" | "On Trip" | "Standby" | "On Leave" | "Action Needed";
  rating: number;
  totalTrips: number;
  totalIncidents: number;
  totalCancellations: number;
  serviceCategory: string;
  verifications: DriverVerifications;
  guarantorName?: string;
  guarantorPhone?: string;
  qualification?: string;
}

interface KpiData {
  activeDrivers: number;
  avgRating: number;
  pendingReview: number;
  incidents30d: number;
}

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

export default function DriverManagementPage() {
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);
  const tenantSlug = activeTenant?.slug || extractSubdomainOrParam() || "";

  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [pendingReviewDrivers, setPendingReviewDrivers] = useState<DriverProfile[]>([]);
  const [kpis, setKpis] = useState<KpiData>({
    activeDrivers: 0,
    avgRating: 4.8,
    pendingReview: 0,
    incidents30d: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [selectedReviewDriver, setSelectedReviewDriver] = useState<DriverProfile | null>(null);

  // Add Driver Form
  const [addForm, setAddForm] = useState({
    name: "",
    employeeId: "",
    phone: "",
    email: "",
    designation: "Fleet Driver",
    region: "Lagos",
    assignedPlate: "",
    licenseNumber: "",
    licenseExpiry: "2027-12-31",
    lasdriCertified: true,
  });

  // Review Form
  const [reviewForm, setReviewForm] = useState<{
    identityStatus: "Verified" | "Pending" | "Action Needed";
    licenseStatus: "Verified" | "Pending" | "Action Needed";
    backgroundStatus: "Verified" | "Pending" | "Action Needed";
  }>({
    identityStatus: "Verified",
    licenseStatus: "Verified",
    backgroundStatus: "Verified",
  });

  const fetchDrivers = async () => {
    if (!tenantSlug) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/erp/mobility/drivers?tenant=${tenantSlug}`);
      const data = await res.json();
      if (data.success) {
        setDrivers(data.drivers || []);
        setPendingReviewDrivers(data.pendingReview || []);
        if (data.kpis) {
          setKpis(data.kpis);
        }
      }
    } catch (err) {
      console.error("[Drivers] Fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [tenantSlug]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, regionFilter, statusFilter]);

  // Available unique regions
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    drivers.forEach((d) => {
      if (d.region) set.add(d.region);
    });
    return Array.from(set).sort();
  }, [drivers]);

  // Filtered drivers
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.assignedPlate.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRegion = regionFilter === "all" || d.region === regionFilter;

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "Active" && ["Active", "Online", "On Trip", "Assigned"].includes(d.status)) ||
        (statusFilter === "Review" && d.verifications.overall !== "Verified") ||
        d.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchRegion && matchStatus;
    });
  }, [drivers, searchQuery, regionFilter, statusFilter]);

  const paginatedDrivers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDrivers.slice(start, start + pageSize);
  }, [filteredDrivers, currentPage, pageSize]);

  // Handlers
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !tenantSlug) return;
    try {
      setIsSaving(true);
      const res = await fetch("/api/erp/mobility/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-tenant-slug": tenantSlug },
        body: JSON.stringify({
          action: "add_driver",
          tenantSlug,
          ...addForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddDriverOpen(false);
        setAddForm({
          name: "",
          employeeId: "",
          phone: "",
          email: "",
          designation: "Fleet Driver",
          region: "Lagos",
          assignedPlate: "",
          licenseNumber: "",
          licenseExpiry: "2027-12-31",
          lasdriCertified: true,
        });
        await fetchDrivers();
      } else {
        alert(data.error || "Failed to add driver");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenReview = (driver: DriverProfile) => {
    setSelectedReviewDriver(driver);
    setReviewForm({
      identityStatus: driver.verifications.identity || "Verified",
      licenseStatus: driver.verifications.license || "Verified",
      backgroundStatus: driver.verifications.background || "Verified",
    });
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewDriver || !tenantSlug) return;
    try {
      setIsSaving(true);
      const res = await fetch("/api/erp/mobility/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-tenant-slug": tenantSlug },
        body: JSON.stringify({
          action: "verify_driver",
          tenantSlug,
          driverId: selectedReviewDriver.id,
          identityStatus: reviewForm.identityStatus,
          licenseStatus: reviewForm.licenseStatus,
          backgroundStatus: reviewForm.backgroundStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedReviewDriver(null);
        await fetchDrivers();
      } else {
        alert(data.error || "Failed to update verifications");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (driverId: string, newStatus: string) => {
    if (!tenantSlug) return;
    try {
      const res = await fetch("/api/erp/mobility/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-tenant-slug": tenantSlug },
        body: JSON.stringify({
          action: "update_status",
          tenantSlug,
          driverId,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDrivers((prev) =>
          prev.map((d) => (d.id === driverId ? { ...d, status: newStatus as any } : d))
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <ErpAdminShell
      title="Driver Management & Compliance"
      subtitle="Manage driver profiles, LASDRI certifications, performance, and onboarding verifications."
      activeModule="mobility"
      action={
        <div className="flex items-center gap-2.5">
          <NexaButton
            size="sm"
            variant="outline"
            onClick={fetchDrivers}
            className="gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </NexaButton>
          <NexaButton
            size="sm"
            variant="primary"
            onClick={() => setIsAddDriverOpen(true)}
            className="gap-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            Add Driver
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-8">
        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-semibold text-nexa-text-secondary uppercase tracking-wider">
                  Active Drivers
                </span>
                <p className="text-2xl font-black text-nexa-text-primary mt-1">
                  {kpis.activeDrivers}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-nexa-text-secondary mt-2">
              Currently operational or on-trip
            </p>
          </div>

          <div className="p-5 bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-semibold text-nexa-text-secondary uppercase tracking-wider">
                  Avg. Rating
                </span>
                <p className="text-2xl font-black text-nexa-text-primary mt-1 flex items-center gap-1.5">
                  {kpis.avgRating.toFixed(1)}
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-nexa-text-secondary mt-2">
              Fleet aggregate service quality
            </p>
          </div>

          <div className="p-5 bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-semibold text-nexa-text-secondary uppercase tracking-wider">
                  Pending Review
                </span>
                <p className="text-2xl font-black text-nexa-text-primary mt-1">
                  {kpis.pendingReview}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-nexa-text-secondary mt-2">
              Awaiting KYC & license approval
            </p>
          </div>

          <div className="p-5 bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-semibold text-nexa-text-secondary uppercase tracking-wider">
                  Incidents (30d)
                </span>
                <p className="text-2xl font-black text-nexa-text-primary mt-1">
                  {kpis.incidents30d}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-nexa-text-secondary mt-2">
              Reported route safety events
            </p>
          </div>
        </section>

        {/* Main Content: Driver Table + Onboarding Review Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Driver List Table (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm overflow-hidden">
              {/* Table Toolbar */}
              <div className="p-4 border-b border-nexa-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-nexa-text-primary text-sm">
                    Operating Drivers
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-nexa-bg-base text-[11px] font-semibold text-nexa-text-secondary border border-nexa-border">
                    {filteredDrivers.length} profiles
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-nexa-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search name, ID, plate..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-nexa-bg-base border border-nexa-border rounded-xl text-xs w-44 md:w-56 text-nexa-text-primary focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Region Filter */}
                  <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-nexa-bg-base border border-nexa-border rounded-xl text-xs text-nexa-text-primary focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                  >
                    <option value="all">All Regions</option>
                    {availableRegions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-nexa-bg-base border border-nexa-border rounded-xl text-xs text-nexa-text-primary focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active Only</option>
                    <option value="Review">Action Needed</option>
                    <option value="Online">Online</option>
                    <option value="On Trip">On Trip</option>
                  </select>
                </div>
              </div>

              {/* Table Body */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-nexa-bg-base border-b border-nexa-border text-nexa-text-secondary font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Driver & ID</th>
                      <th className="p-3.5">Performance</th>
                      <th className="p-3.5">Assignment & Region</th>
                      <th className="p-3.5">License & LASDRI</th>
                      <th className="p-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-nexa-border">
                    {paginatedDrivers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-nexa-text-secondary">
                          No drivers match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedDrivers.map((driver, idx) => {
                        const initials = getInitials(driver.name);
                        const colors = [
                          "bg-blue-500/10 text-blue-600 border-blue-500/20",
                          "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                          "bg-purple-500/10 text-purple-600 border-purple-500/20",
                          "bg-amber-500/10 text-amber-600 border-amber-500/20",
                        ];
                        const colorClass = colors[idx % colors.length];

                        return (
                          <tr
                            key={driver.id}
                            className="hover:bg-nexa-bg-base/40 transition-colors"
                          >
                            {/* Driver & ID */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs ${colorClass}`}
                                >
                                  {initials}
                                </div>
                                <div>
                                  <p className="font-bold text-nexa-text-primary text-sm">
                                    {driver.name}
                                  </p>
                                  <div className="flex items-center gap-2 text-[11px] text-nexa-text-secondary mt-0.5">
                                    <span className="font-mono">{driver.employeeId}</span>
                                    {driver.phone && <span>• {driver.phone}</span>}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Performance */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-1 text-amber-500">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span className="font-bold text-nexa-text-primary">
                                  {driver.rating.toFixed(1)}
                                </span>
                              </div>
                              <p className="text-[11px] text-nexa-text-secondary mt-0.5">
                                {driver.totalTrips.toLocaleString()} trips •{" "}
                                {driver.totalIncidents} incidents
                              </p>
                            </td>

                            {/* Assignment & Region */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5 font-medium text-nexa-text-primary">
                                <span className="font-mono text-[11px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded border border-blue-500/20">
                                  {driver.assignedPlate || "Pool / Unassigned"}
                                </span>
                              </div>
                              <p className="text-[11px] text-nexa-text-secondary mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {driver.region} • {driver.designation}
                              </p>
                            </td>

                            {/* License & LASDRI */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-500 flex items-center gap-1 font-semibold text-[11px]">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {driver.licenseNumber ? "Valid License" : "Pending Lic."}
                                </span>
                                {driver.lasdriCertified && (
                                  <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.2 rounded text-[10px] font-bold">
                                    LASDRI
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] font-mono text-nexa-text-secondary mt-0.5">
                                Exp: {driver.licenseExpiry || "Dec 2027"}
                              </p>
                            </td>

                            {/* Status & Quick Change */}
                            <td className="p-3.5 text-center">
                              <select
                                value={driver.status}
                                onChange={(e) => handleUpdateStatus(driver.id, e.target.value)}
                                className={`text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none transition-colors ${
                                  driver.status === "Online" || driver.status === "Active"
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                    : driver.status === "On Trip"
                                    ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                    : driver.status === "Action Needed"
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                    : "bg-slate-500/10 text-slate-600 border-slate-500/30"
                                }`}
                              >
                                <option value="Active">Active</option>
                                <option value="Online">Online</option>
                                <option value="On Trip">On Trip</option>
                                <option value="Standby">Standby</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Action Needed">Action Needed</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <TablePaginationFooter
                currentPage={currentPage}
                totalItems={filteredDrivers.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          </div>

          {/* Onboarding & KYC Review Panel (Span 1) */}
          <div className="space-y-4">
            <div className="bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm p-5 space-y-4">
              <div className="border-b border-nexa-border pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-nexa-text-primary flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    Pending Onboarding Review
                  </h3>
                  <p className="text-[11px] text-nexa-text-secondary mt-0.5">
                    KYC, LASDRI & Background Verifications
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[11px] font-bold">
                  {pendingReviewDrivers.length} Queued
                </span>
              </div>

              {pendingReviewDrivers.length === 0 ? (
                <div className="p-6 text-center text-xs text-nexa-text-secondary bg-nexa-bg-base/40 rounded-xl border border-dashed border-nexa-border">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All driver onboarding files and compliance checks are up to date!
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {pendingReviewDrivers.map((d) => (
                    <div
                      key={d.id}
                      className="p-3.5 bg-nexa-bg-base/60 border border-nexa-border rounded-xl space-y-3 hover:border-amber-500/40 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-xs text-nexa-text-primary">{d.name}</p>
                          <p className="text-[10px] font-mono text-nexa-text-secondary">
                            {d.employeeId} • {d.region}
                          </p>
                        </div>
                        <NexaBadge variant="amber" size="sm">
                          Action Needed
                        </NexaBadge>
                      </div>

                      <ul className="text-[11px] space-y-1.5 pt-1 border-t border-nexa-border/60">
                        <li className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5 text-nexa-text-secondary">
                            <CheckCircle2
                              className={`w-3.5 h-3.5 ${
                                d.verifications.identity === "Verified"
                                  ? "text-emerald-500"
                                  : "text-amber-500"
                              }`}
                            />
                            National Identity / NIN
                          </span>
                          <span
                            className={`font-semibold ${
                              d.verifications.identity === "Verified"
                                ? "text-emerald-500"
                                : "text-amber-500"
                            }`}
                          >
                            {d.verifications.identity}
                          </span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5 text-nexa-text-secondary">
                            <CheckCircle2
                              className={`w-3.5 h-3.5 ${
                                d.verifications.license === "Verified"
                                  ? "text-emerald-500"
                                  : "text-amber-500"
                              }`}
                            />
                            Driver License / LASDRI
                          </span>
                          <span
                            className={`font-semibold ${
                              d.verifications.license === "Verified"
                                ? "text-emerald-500"
                                : "text-amber-500"
                            }`}
                          >
                            {d.verifications.license}
                          </span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5 text-nexa-text-secondary">
                            <Clock
                              className={`w-3.5 h-3.5 ${
                                d.verifications.background === "Verified"
                                  ? "text-emerald-500"
                                  : "text-amber-500"
                              }`}
                            />
                            Guarantor & Criminal Check
                          </span>
                          <span
                            className={`font-semibold ${
                              d.verifications.background === "Verified"
                                ? "text-emerald-500"
                                : "text-amber-500"
                            }`}
                          >
                            {d.verifications.background}
                          </span>
                        </li>
                      </ul>

                      <NexaButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenReview(d)}
                        className="w-full text-xs gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                        Review & Verify Profile
                      </NexaButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- MODAL 1: ADD NEW DRIVER --- */}
        {isAddDriverOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Add Fleet Driver</h3>
                    <p className="text-[11px] text-slate-500">
                      Register official driver profile & compliance documents
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddDriverOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddDriver} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Adebayo Ogunlesi"
                      value={addForm.name}
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Employee ID / Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. NETS-014"
                      value={addForm.employeeId}
                      onChange={(e) => setAddForm({ ...addForm, employeeId: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="0803 123 4567"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      placeholder="driver@neweratransports.com"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Operating Region</label>
                    <select
                      value={addForm.region}
                      onChange={(e) => setAddForm({ ...addForm, region: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                    >
                      <option value="Lagos">Lagos</option>
                      <option value="Abuja">Abuja</option>
                      <option value="Port Harcourt">Port Harcourt</option>
                      <option value="Ibadan">Ibadan</option>
                      <option value="Benin City">Benin City</option>
                      <option value="Enugu">Enugu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Assigned Vehicle Plate
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. KRD23GY"
                      value={addForm.assignedPlate}
                      onChange={(e) => setAddForm({ ...addForm, assignedPlate: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Driver License Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AKD29482AA"
                      value={addForm.licenseNumber}
                      onChange={(e) => setAddForm({ ...addForm, licenseNumber: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      License Expiry Date
                    </label>
                    <input
                      type="date"
                      value={addForm.licenseExpiry}
                      onChange={(e) => setAddForm({ ...addForm, licenseExpiry: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="lasdriCheckbox"
                    checked={addForm.lasdriCertified}
                    onChange={(e) => setAddForm({ ...addForm, lasdriCertified: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="lasdriCheckbox" className="font-semibold text-slate-700 cursor-pointer">
                    Driver possesses valid LASDRI Certification (Lagos State Drivers Institute)
                  </label>
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <NexaButton
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAddDriverOpen(false)}
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
                    {isSaving ? "Saving..." : "Save Driver"}
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL 2: REVIEW & VERIFY PROFILE --- */}
        {selectedReviewDriver && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Onboarding Verification Audit
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {selectedReviewDriver.name} ({selectedReviewDriver.employeeId})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReviewDriver(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Driver Details Summary */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">Designation:</span>
                    <p className="font-semibold text-slate-800">{selectedReviewDriver.designation}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Region:</span>
                    <p className="font-semibold text-slate-800">{selectedReviewDriver.region}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Phone:</span>
                    <p className="font-semibold text-slate-800">{selectedReviewDriver.phone || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Qualification:</span>
                    <p className="font-semibold text-slate-800">{selectedReviewDriver.qualification || "SSCE / Valid License"}</p>
                  </div>
                </div>

                {selectedReviewDriver.guarantorName && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-500">Guarantor:</span>
                    <p className="font-semibold text-slate-800">
                      {selectedReviewDriver.guarantorName} ({selectedReviewDriver.guarantorPhone || "No Phone"})
                    </p>
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
                {/* Identity Verification */}
                <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-800">National ID & NIN Check</p>
                    <p className="text-[11px] text-slate-500">Identity document validity</p>
                  </div>
                  <select
                    value={reviewForm.identityStatus}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        identityStatus: e.target.value as any,
                      })
                    }
                    className="px-2.5 py-1 rounded-lg border border-slate-300 font-semibold text-xs"
                  >
                    <option value="Verified">Verified</option>
                    <option value="Action Needed">Action Needed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                {/* License Verification */}
                <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-800">Driver License & LASDRI Check</p>
                    <p className="text-[11px] text-slate-500">
                      {selectedReviewDriver.licenseNumber || "License on file"}
                    </p>
                  </div>
                  <select
                    value={reviewForm.licenseStatus}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        licenseStatus: e.target.value as any,
                      })
                    }
                    className="px-2.5 py-1 rounded-lg border border-slate-300 font-semibold text-xs"
                  >
                    <option value="Verified">Verified</option>
                    <option value="Action Needed">Action Needed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                {/* Background & Guarantor Verification */}
                <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-800">Guarantor & Background Verification</p>
                    <p className="text-[11px] text-slate-500">Character, address and guarantor phone confirmed</p>
                  </div>
                  <select
                    value={reviewForm.backgroundStatus}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        backgroundStatus: e.target.value as any,
                      })
                    }
                    className="px-2.5 py-1 rounded-lg border border-slate-300 font-semibold text-xs"
                  >
                    <option value="Verified">Verified</option>
                    <option value="Action Needed">Action Needed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <NexaButton
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedReviewDriver(null)}
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
                    {isSaving ? "Saving..." : "Confirm & Save Audit"}
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
