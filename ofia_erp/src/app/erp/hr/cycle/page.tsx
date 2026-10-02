"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useERPStore, ReviewCycle, DEPARTMENTS, getActiveTenantSlug } from "@/lib/erp-store";
import { useActiveTenant } from "@/lib/tenant-context";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { Pagination } from "@/components/nexa/Pagination";
import { Calendar, Plus, CheckCircle2, Clock, AlertCircle, ArrowLeft, Trash2, Edit2 } from "lucide-react";

export default function ReviewCycleManagement() {
  const { activeTenant } = useActiveTenant();
  const tenantSlug = activeTenant?.slug || activeTenant?.id || "";
  const { cycles, addReviewCycle, updateCycles, deleteReviewCycle, isLoading } = useERPStore(tenantSlug);

  const [editingCycleId, setEditingCycleId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [cycleStatus, setCycleStatus] = useState<"Draft" | "Active">("Draft");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 5;
  
  const [depts, setDepts] = useState<string[]>([...DEPARTMENTS]);
  const [isAddingDept, setIsAddingDept] = useState(false);
  const [newDeptText, setNewDeptText] = useState("");
  const [isSavingDept, setIsSavingDept] = useState(false);
  const [expandedCycleIds, setExpandedCycleIds] = useState<Record<string, boolean>>({});

  const toggleExpandCycle = (id: string) => {
    setExpandedCycleIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Load persistent departments from backend API and combine with operational & cycle departments
  useEffect(() => {
    const slug = tenantSlug || getActiveTenantSlug();

    const loadDepts = async () => {
      let apiNames: string[] = [];
      try {
        const url = slug ? `/api/erp/departments?tenant=${encodeURIComponent(slug)}` : "/api/erp/departments";
        const res = await fetch(url, {
          cache: "no-store",
          headers: slug ? { "x-tenant-slug": slug } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            apiNames = data.map((d: any) => d.name || d.Name).filter(Boolean);
          }
        }
      } catch (err) {
        console.warn("Failed to load departments from API:", err);
      }

      // Collect departments actively assigned to loaded cycles
      const fromCycles = cycles.flatMap(c => c.departments || []).filter(Boolean);

      // Maintain complete master DEPARTMENTS list merged with backend and cycle departments
      const merged = Array.from(new Set([...DEPARTMENTS, ...apiNames, ...fromCycles]));
      setDepts(merged);
    };

    loadDepts();
  }, [tenantSlug, cycles]);

  const handleSaveDept = async () => {
    const trimmed = newDeptText.trim();
    if (!trimmed) return;
    if (depts.map(d => d.toLowerCase()).includes(trimmed.toLowerCase())) {
      alert("This department already exists!");
      return;
    }

    setIsSavingDept(true);
    const slug = tenantSlug || getActiveTenantSlug();

    try {
      const code = `DEPT-${trimmed.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      const payload = {
        code,
        name: trimmed,
        head: "Pending Appointment",
        headCount: 1,
        budget: "₦10,000,000",
        costCenter: `CC-${depts.length + 100}`,
        tenantSlug: slug || undefined,
      };

      const res = await fetch(`/api/erp/departments${slug ? `?tenant=${encodeURIComponent(slug)}` : ""}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(slug ? { "x-tenant-slug": slug } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.warn("Backend returned non-OK status when saving department, saving locally");
      }

      const updated = [...depts, trimmed];
      setDepts(updated);
      setSelectedDepts(prev => prev.includes(trimmed) ? prev : [...prev, trimmed]);
      setIsAddingDept(false);
      setNewDeptText("");
    } catch (err) {
      console.error("Failed to persist department:", err);
      const updated = [...depts, trimmed];
      setDepts(updated);
      setSelectedDepts(prev => prev.includes(trimmed) ? prev : [...prev, trimmed]);
      setIsAddingDept(false);
      setNewDeptText("");
    } finally {
      setIsSavingDept(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedDepts.length === depts.length) {
      setSelectedDepts([]);
    } else {
      setSelectedDepts([...depts]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) {
      alert("Please fill in all required fields (Cycle Name, Start Date, and End Date).");
      return;
    }

    setIsSubmitting(true);
    try {
      let cycleId = editingCycleId;
      if (!cycleId) {
        let maxNum = 0;
        cycles.forEach((c) => {
          const match = c.id.match(/\d+/);
          if (match) {
            const n = parseInt(match[0], 10);
            if (n > maxNum) maxNum = n;
          }
        });
        cycleId = `CYC${String(maxNum + 1).padStart(3, "0")}`;
      }

      const payload: ReviewCycle = {
        id: cycleId,
        name: name.trim(),
        startDate,
        endDate,
        status: cycleStatus,
        departments: selectedDepts,
        tenantSlug: tenantSlug || activeTenant?.slug || activeTenant?.id || "",
      };

      if (editingCycleId) {
        const list = cycles.map(c => c.id === editingCycleId ? payload : c);
        await updateCycles(list);
        alert("Review Cycle updated successfully!");
      } else {
        await addReviewCycle(payload);
        alert("Review Cycle created successfully!");
      }

      setName("");
      setStartDate("");
      setEndDate("");
      setSelectedDepts([]);
      setCycleStatus("Draft");
      setEditingCycleId(null);
    } catch (err: any) {
      alert("Failed to save review cycle: " + (err.message || "Error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setName("");
    setStartDate("");
    setEndDate("");
    setSelectedDepts([]);
    setCycleStatus("Draft");
    setEditingCycleId(null);
  };

  const handleToggleDept = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      setSelectedDepts(selectedDepts.filter(d => d !== dept));
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  const handleEdit = (cycle: ReviewCycle) => {
    setEditingCycleId(cycle.id);
    setName(cycle.name);
    setStartDate(cycle.startDate);
    setEndDate(cycle.endDate);
    setCycleStatus(cycle.status as any);
    setSelectedDepts(cycle.departments || []);
    
    // Scroll to form smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (cycleId: string) => {
    if (confirm("Are you sure you want to completely delete this review cycle and all associated data? This action cannot be undone.")) {
      setIsSubmitting(true);
      try {
        await deleteReviewCycle(cycleId);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleUpdateStatus = async (cycleId: string, newStatus: "Draft" | "Active" | "Completed") => {
    if (newStatus === "Completed") {
      const ok = confirm("Closing this appraisal cycle will automatically finalize and close all pending reviews in this cycle. Do you want to proceed?");
      if (!ok) return;
    }
    setIsSubmitting(true);
    try {
      const list = cycles.map(c => {
        if (c.id === cycleId) {
          return { ...c, status: newStatus, tenantSlug: c.tenantSlug || tenantSlug || activeTenant?.slug || activeTenant?.id || "" };
        }
        if (newStatus === "Active" && c.status === "Active") {
          return { ...c, status: "Completed" as const, tenantSlug: c.tenantSlug || tenantSlug || activeTenant?.slug || activeTenant?.id || "" };
        }
        return c;
      });
      await updateCycles(list);
    } catch (err: any) {
      alert("Failed to update cycle status: " + (err.message || "Error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BusinessShell
      title="Appraisal Cycle Management"
      subtitle="Configure enterprise performance appraisal cycles, evaluation timelines, and target department scopes."
      action={
        <Link href="/erp/hr">
          <NexaButton size="sm" variant="outline" className="rounded-full" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to HR Overview
          </NexaButton>
        </Link>
      }
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Active Cycles List (7cols) */}
          <NexaCard variant="glass" padding="lg" className="lg:col-span-7 space-y-4 rounded-3xl">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--nexa-border)]">
              <h3 className="font-extrabold text-[var(--nexa-text-primary)] text-sm">
                Configured Review Cycles {tenantSlug ? `(${tenantSlug})` : ""}
              </h3>
              <span className="text-[10px] font-bold text-[var(--nexa-text-muted)]">
                {cycles.length} {cycles.length === 1 ? "Cycle" : "Cycles"} Registered
              </span>
            </div>
            
            <div className="space-y-4">
              {cycles.slice((currentPage - 1) * itemsPerPage, (currentPage - 1) * itemsPerPage + itemsPerPage).map((c) => (
                <div key={c.id} className="p-4 bg-[var(--nexa-bg-base)] rounded-2xl flex flex-col gap-3 border border-[var(--nexa-border)]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-[var(--nexa-text-primary)]">{c.name}</h4>
                      <span className="text-[10px] text-[var(--nexa-text-muted)] font-mono block mt-0.5">
                        ID: {c.id} • Period: {c.startDate} to {c.endDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(c)}
                        className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors cursor-pointer"
                        title="Edit Cycle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-full transition-colors mr-1 cursor-pointer"
                        title="Delete Cycle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {c.status === "Active" ? (
                        <NexaBadge variant="green" size="sm" className="rounded-full">Active</NexaBadge>
                      ) : c.status === "Completed" ? (
                        <NexaBadge variant="neutral" size="sm" className="rounded-full">Completed</NexaBadge>
                      ) : (
                        <NexaBadge variant="brand" size="sm" className="rounded-full">Draft</NexaBadge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-[var(--nexa-text-muted)] uppercase tracking-wider">
                        Covered Departments ({c.departments?.length || 0})
                      </span>
                      {c.departments && c.departments.length > 8 && (
                        <button
                          type="button"
                          onClick={() => toggleExpandCycle(c.id)}
                          className="text-[10px] font-bold text-[#1A56DB] hover:underline cursor-pointer"
                        >
                          {expandedCycleIds[c.id] ? "Collapse" : `View All (${c.departments.length})`}
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto p-1.5 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)]">
                      {(c.departments && c.departments.length > 0 ? (
                        (expandedCycleIds[c.id] ? c.departments : c.departments.slice(0, 8)).map(d => (
                          <span key={d} className="bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[10px] font-bold text-[var(--nexa-text-secondary)] px-2 py-0.5 rounded-full">
                            {d}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No target departments specified</span>
                      ))}

                      {!expandedCycleIds[c.id] && c.departments && c.departments.length > 8 && (
                        <button
                          type="button"
                          onClick={() => toggleExpandCycle(c.id)}
                          className="bg-[#1A56DB]/10 text-[#1A56DB] border border-[#1A56DB]/20 text-[10px] font-bold px-2 py-0.5 rounded-full hover:bg-[#1A56DB]/20 cursor-pointer"
                        >
                          +{c.departments.length - 8} more
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 items-center justify-end pt-2 border-t border-[var(--nexa-border)]">
                    {c.status === "Draft" && (
                      <NexaButton
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateStatus(c.id, "Active")}
                        isLoading={isSubmitting}
                        className="rounded-full bg-[#1A56DB] text-xs h-7 cursor-pointer"
                      >
                        Publish Cycle
                      </NexaButton>
                    )}
                    {c.status === "Active" && (
                      <NexaButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(c.id, "Completed")}
                        isLoading={isSubmitting}
                        className="rounded-full text-xs h-7 cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                      >
                        Complete Cycle
                      </NexaButton>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={Math.max(1, Math.ceil(cycles.length / itemsPerPage))}
              totalItems={cycles.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </NexaCard>

          {/* Create Cycle Form (5cols) */}
          <NexaCard variant="glass" padding="lg" className="lg:col-span-5 rounded-3xl">
            <h3 className="font-extrabold text-[var(--nexa-text-primary)] text-sm pb-2 border-b border-[var(--nexa-border)] mb-4">
              {editingCycleId ? "Edit Review Cycle" : "Create New Review Cycle"}
            </h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-[var(--nexa-text-muted)] uppercase mb-1.5 tracking-wider">
                  Cycle Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2026 Annual Performance Review"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--nexa-text-muted)] uppercase mb-1.5 tracking-wider">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--nexa-text-muted)] uppercase mb-1.5 tracking-wider">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-extrabold text-[var(--nexa-text-muted)] uppercase tracking-wider">
                    Target Departments ({selectedDepts.length} of {depts.length} Selected)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddingDept(prev => !prev)}
                      className="text-[10px] font-extrabold text-[#1A56DB] hover:underline uppercase cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> {isAddingDept ? "Cancel" : "Add Dept"}
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-[10px] font-extrabold text-[#1A56DB] hover:underline uppercase cursor-pointer"
                    >
                      {selectedDepts.length === depts.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                </div>

                {isAddingDept && (
                  <div className="flex gap-1.5 items-center border border-blue-200 dark:border-blue-800 rounded-xl p-2 bg-blue-50/50 dark:bg-blue-900/20 mb-2">
                    <input
                      type="text"
                      placeholder="New Department Name..."
                      value={newDeptText}
                      onChange={(e) => setNewDeptText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSaveDept();
                        }
                      }}
                      className="px-2.5 py-1 text-xs border border-[var(--nexa-border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A56DB] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] font-semibold flex-1"
                    />
                    <button
                      type="button"
                      disabled={isSavingDept}
                      onClick={handleSaveDept}
                      className="bg-[#1A56DB] text-white rounded-lg px-2.5 py-1 hover:bg-blue-700 transition-colors shadow-sm text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingDept ? "Saving..." : "Add"}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-1 max-h-48 overflow-y-auto p-2 border border-[var(--nexa-border)] rounded-xl bg-[var(--nexa-bg-base)]">
                  {depts.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleToggleDept(d)}
                      className={`px-2.5 py-1.5 rounded-lg border text-left text-[10px] font-bold transition-all cursor-pointer ${
                        selectedDepts.includes(d)
                          ? "bg-[#1A56DB]/10 border-[#1A56DB] text-[#1A56DB]"
                          : "bg-[var(--nexa-bg-surface)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)]"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-[var(--nexa-text-muted)] uppercase mb-1.5 tracking-wider">
                  Initial Publish State
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-[var(--nexa-text-secondary)] font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={cycleStatus === "Draft"}
                      onChange={() => setCycleStatus("Draft")}
                      className="text-[#1A56DB]"
                    />
                    Save as Draft
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[var(--nexa-text-secondary)] font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={cycleStatus === "Active"}
                      onChange={() => setCycleStatus("Active")}
                      className="text-[#1A56DB]"
                    />
                    Active (Publish)
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <NexaButton
                  type="submit"
                  size="md"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="flex-1 rounded-full bg-[#1A56DB] text-white cursor-pointer"
                >
                  {editingCycleId ? "Save Changes" : "Create Cycle"}
                </NexaButton>
                {editingCycleId && (
                  <NexaButton
                    type="button"
                    size="md"
                    variant="outline"
                    onClick={cancelEdit}
                    className="rounded-full cursor-pointer"
                  >
                    Cancel
                  </NexaButton>
                )}
              </div>
            </form>
          </NexaCard>

        </div>
      </div>
    </BusinessShell>
  );
}
