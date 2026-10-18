"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DispatchJob,
  CourierDriver,
  ZoneRate,
  JobType,
  JobStatus,
  INITIAL_ZONE_RATES,
} from "./dispatch-types";

export interface DispatchStats {
  activeDeliveries: number;
  pendingQueue: number;
  availableCouriers: number;
  deliveredToday: number;
  exceptionsCount: number;
  totalJobs: number;
}

export function useDispatch() {
  const [jobs, setJobs] = useState<DispatchJob[]>([]);
  const [couriers, setCouriers] = useState<CourierDriver[]>([]);
  const [zoneRates, setZoneRates] = useState<ZoneRate[]>([]);
  const [stats, setStats] = useState<DispatchStats>({
    activeDeliveries: 0,
    pendingQueue: 0,
    availableCouriers: 0,
    deliveredToday: 0,
    exceptionsCount: 0,
    totalJobs: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const getTenantSlug = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const param = urlParams.get("tenant") || urlParams.get("tenant_slug") || urlParams.get("org_id");
      if (param) return param.toLowerCase().trim();
      const host = window.location.host.toLowerCase();
      const parts = host.split(":")[0].split(".");
      if (parts.length > 2 && parts[0] !== "erp" && parts[0] !== "admin" && parts[0] !== "www") {
        return parts[0].toLowerCase().trim();
      }
      const stored = localStorage.getItem("nexa_tenant_slug") || localStorage.getItem("tenant_slug") || localStorage.getItem("active_workspace_slug");
      if (stored) return stored.toLowerCase().trim();
    }
    return "";
  };

  const refreshData = useCallback(async () => {
    try {
      const tenantSlug = getTenantSlug();
      if (!tenantSlug) {
        setJobs([]);
        setCouriers([]);
        setIsLoading(false);
        return;
      }
      const res = await fetch(`/api/erp/dispatch?tenant=${tenantSlug}`, {
        headers: {
          "X-Tenant-Slug": tenantSlug,
          "X-Org-ID": tenantSlug,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setJobs(data.jobs || []);
          setCouriers(data.couriers || []);
          if (data.zoneRates) setZoneRates(data.zoneRates);
          if (data.stats) setStats(data.stats);
          setSelectedJobId((prev) => {
            if (prev && data.jobs?.some((j: DispatchJob) => j.id === prev)) return prev;
            return data.jobs && data.jobs.length > 0 ? data.jobs[0].id : null;
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch dispatch data from server, using local state:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    // Real-time telemetry poll every 8 seconds for live fleet radar
    const interval = setInterval(() => {
      refreshData();
    }, 8000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0] || null;

  const assignCourier = async (jobId: string, courierId: string) => {
    try {
      const tenant = getTenantSlug();
      const res = await fetch("/api/erp/dispatch", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Slug": tenant,
          "X-Org-ID": tenant,
        },
        body: JSON.stringify({ jobId, action: "ASSIGN_COURIER", courierId }),
      });
      const data = await res.json();
      if (data.success && data.job) {
        setJobs((prev) => prev.map((j) => (j.id === jobId ? data.job : j)));
        refreshData();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateStatus = async (
    jobId: string,
    status: JobStatus,
    notes?: string,
    otp?: string
  ) => {
    try {
      const tenant = getTenantSlug();
      const res = await fetch("/api/erp/dispatch", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Slug": tenant,
          "X-Org-ID": tenant,
        },
        body: JSON.stringify({ jobId, action: "UPDATE_STATUS", status, notes, otp }),
      });
      const data = await res.json();
      if (data.success && data.job) {
        setJobs((prev) => prev.map((j) => (j.id === jobId ? data.job : j)));
        refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Update failed" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const reportException = async (jobId: string, reason: string, notes?: string) => {
    try {
      const tenant = getTenantSlug();
      const res = await fetch("/api/erp/dispatch", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Slug": tenant,
          "X-Org-ID": tenant,
        },
        body: JSON.stringify({ jobId, action: "REPORT_EXCEPTION", reason, notes }),
      });
      const data = await res.json();
      if (data.success && data.job) {
        setJobs((prev) => prev.map((j) => (j.id === jobId ? data.job : j)));
        refreshData();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const createJob = async (jobData: Partial<DispatchJob>) => {
    try {
      const tenant = getTenantSlug();
      const res = await fetch("/api/erp/dispatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Slug": tenant,
          "X-Org-ID": tenant,
        },
        body: JSON.stringify(jobData),
      });
      const data = await res.json();
      if (data.success && data.job) {
        setJobs((prev) => [data.job, ...prev]);
        setSelectedJobId(data.job.id);
        refreshData();
        return { success: true, job: data.job };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const toggleCourierAvailability = async (courierId: string) => {
    try {
      const tenant = getTenantSlug();
      const res = await fetch("/api/erp/dispatch", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Slug": tenant,
          "X-Org-ID": tenant,
        },
        body: JSON.stringify({ action: "TOGGLE_COURIER_AVAILABILITY", courierId }),
      });
      const data = await res.json();
      if (data.success && data.couriers) {
        setCouriers(data.couriers);
        refreshData();
      }
    } catch (err) {
      console.warn("Failed to toggle courier:", err);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesType = typeFilter === "ALL" || j.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || j.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      j.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.recipientAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.initiatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.parcelDescription.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  return {
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
  };
}
