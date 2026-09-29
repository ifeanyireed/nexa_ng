"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useERPStore, ReviewCycle, DEPARTMENTS } from "@/lib/erp-store";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { Pagination } from "@/components/nexa/Pagination";
import { Calendar, Plus, CheckCircle2, Clock, AlertCircle, ArrowLeft } from "lucide-react";

export default function ReviewCycleManagement() {
  const { cycles, addReviewCycle, updateCycles } = useERPStore();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [cycleStatus, setCycleStatus] = useState<"Draft" | "Active">("Draft");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const depts = DEPARTMENTS;

  const handleSelectAll = () => {
    if (selectedDepts.length === depts.length) {
      setSelectedDepts([]);
    } else {
      setSelectedDepts([...depts]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate || selectedDepts.length === 0) {
      alert("Please fill in all cycle details and select at least one department.");
      return;
    }

    const newCycle: ReviewCycle = {
      id: `CYC00${cycles.length + 1}`,
      name,
      startDate,
      endDate,
      status: cycleStatus,
      departments: selectedDepts,
    };

    addReviewCycle(newCycle);
    setName("");
    setStartDate("");
    setEndDate("");
    setSelectedDepts([]);
    setCycleStatus("Draft");
    alert("Review Cycle created successfully!");
  };

  const handleToggleDept = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      setSelectedDepts(selectedDepts.filter(d => d !== dept));
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  const handleUpdateStatus = (cycleId: string, newStatus: "Draft" | "Active" | "Completed") => {
    const list = cycles.map(c => {
      if (c.id === cycleId) {
        return { ...c, status: newStatus };
      }
      if (newStatus === "Active" && c.status === "Active") {
        return { ...c, status: "Completed" as const };
      }
      return c;
    });
    updateCycles(list);
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
            <h3 className="font-extrabold text-[var(--nexa-text-primary)] text-sm pb-2 border-b border-[var(--nexa-border)]">
              Configured Review Cycles
            </h3>
            
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
                      {c.status === "Active" ? (
                        <NexaBadge variant="green" size="sm" className="rounded-full">Active</NexaBadge>
                      ) : c.status === "Completed" ? (
                        <NexaBadge variant="neutral" size="sm" className="rounded-full">Completed</NexaBadge>
                      ) : (
                        <NexaBadge variant="brand" size="sm" className="rounded-full">Draft</NexaBadge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {c.departments.map(d => (
                      <span key={d} className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[10px] font-bold text-[var(--nexa-text-secondary)] px-2 py-0.5 rounded-full">
                        {d}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 items-center justify-end pt-2 border-t border-[var(--nexa-border)]">
                    {c.status === "Draft" && (
                      <NexaButton
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateStatus(c.id, "Active")}
                        className="rounded-full bg-[#1A56DB] text-xs h-7"
                      >
                        Publish Cycle
                      </NexaButton>
                    )}
                    {c.status === "Active" && (
                      <NexaButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(c.id, "Completed")}
                        className="rounded-full text-xs h-7"
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
              Create New Review Cycle
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
                  className="w-full px-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-semibold text-[var(--nexa-text-primary)] outline-none"
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
                    className="w-full px-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-semibold text-[var(--nexa-text-primary)] outline-none"
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
                    className="w-full px-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-semibold text-[var(--nexa-text-primary)] outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-extrabold text-[var(--nexa-text-muted)] uppercase tracking-wider">
                    Target Departments
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[10px] font-extrabold text-[#1A56DB] hover:underline uppercase cursor-pointer"
                  >
                    {selectedDepts.length === depts.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
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

              <NexaButton
                type="submit"
                size="md"
                variant="primary"
                className="w-full rounded-full bg-[#1A56DB] text-white"
              >
                Create Cycle
              </NexaButton>
            </form>
          </NexaCard>

        </div>
      </div>
    </BusinessShell>
  );
}
