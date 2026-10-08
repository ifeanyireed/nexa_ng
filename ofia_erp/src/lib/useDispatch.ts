"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DispatchJob,
  CourierDriver,
  ZoneRate,
  JobType,
  JobStatus,
  INITIAL_DISPATCH_JOBS,
  INITIAL_COURIERS,
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
  const [jobs, setJobs] = useState<DispatchJob[]>(INITIAL_DISPATCH_JOBS);
  const [couriers, setCouriers] = useState<CourierDriver[]>(INITIAL_COURIERS);
  const [zoneRates, setZoneRates] = useState<ZoneRate[]>(INITIAL_ZONE_RATES);
  const [stats, setStats] = useState<DispatchStats>({
    activeDeliveries: 2,
    pendingQueue: 2,
    availableCouriers: 4,
    deliveredToday: 1,
    exceptionsCount: 1,
    totalJobs: 6,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>("JOB-2026-8491");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const refreshData = useCallback(async () => {
    try {
      const res = await fetch("/api/erp/dispatch");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setJobs(data.jobs);
          setCouriers(data.couriers);
          setZoneRates(data.zoneRates);
          setStats(data.stats);
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
  }, [refreshData]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0] || null;

  const assignCourier = async (jobId: string, courierId: string) => {
    try {
      const res = await fetch("/api/erp/dispatch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch("/api/erp/dispatch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch("/api/erp/dispatch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch("/api/erp/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch("/api/erp/dispatch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
