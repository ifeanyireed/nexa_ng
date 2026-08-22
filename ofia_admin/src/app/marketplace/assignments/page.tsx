"use client";

import React, { useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  Search,
  UserCheck,
  Wrench,
} from "lucide-react";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

const INITIAL_UNASSIGNED_JOBS = [
  { id: "JOB-126", service: "Commercial Inverter & Battery Bank Rewiring", area: "Ikoyi, Lagos", priority: "high", budget: "₦85,000", client: "Dangote Refinery Exec Office" },
  { id: "JOB-127", service: "Multi-Floor Water Pressure Booster Repair", area: "Victoria Island, Lagos", priority: "high", budget: "₦120,000", client: "Eko Atlantic Apartments" },
  { id: "JOB-128", service: "Office HVAC Deep Clean & Gas Recharge", area: "Yaba, Lagos", priority: "medium", budget: "₦45,000", client: "Tech Hub Lagos" },
  { id: "JOB-129", service: "Smart Lock & Biometric Access Control Setup", area: "Maitama, Abuja", priority: "low", budget: "₦65,000", client: "Federal Ministry Annex" },
];

const AVAILABLE_TECH_ROSTER = [
  { id: "TECH-001", name: "John Philip", specialty: "Electrical & Inverter", location: "Lekki Phase 1", rating: 4.9, activeJobs: 0 },
  { id: "TECH-002", name: "Emmanuel Nwosu", specialty: "Plumbing & Piping", location: "Victoria Island", rating: 4.8, activeJobs: 1 },
  { id: "TECH-003", name: "Michael Bello", specialty: "HVAC & AC Repair", location: "Surulere", rating: 4.7, activeJobs: 0 },
  { id: "TECH-004", name: "Fatima Aliyu", specialty: "Security & Biometrics", location: "Wuse 2, Abuja", rating: 4.9, activeJobs: 0 },
];

export default function MarketplaceAssignmentsPage() {
  const [jobs, setJobs] = useState(INITIAL_UNASSIGNED_JOBS);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedTech, setSelectedTech] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const handleAssign = () => {
    if (selectedJob && selectedTech) {
      setJobs((prev) => prev.filter((j) => j.id !== selectedJob.id));
      setSuccessMsg(`Successfully assigned ${selectedJob.id} (${selectedJob.service}) to ${selectedTech.name}.`);
      setSelectedJob(null);
      setSelectedTech(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  return (
    <SuperAdminShell
      title="On-Demand Job Dispatch & Allocation Queue"
      subtitle="Supervise incoming client service requests and assign vetted field specialists in real time."
      action={
        <NexaBadge variant="brand" className="py-1 px-3 text-xs font-bold">
          {jobs.length} Unassigned Jobs
        </NexaBadge>
      }
    >
      <div className="space-y-6">
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-[#0E9F6E]/10 border border-[#0E9F6E]/30 text-[#0E9F6E] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* COLUMN 1: UNASSIGNED JOBS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#1A56DB]" />
                1. Select Unassigned Booking
              </h3>
              <span className="text-xs text-[var(--nexa-text-muted)] font-mono">{jobs.length} Pending</span>
            </div>

            <div className="space-y-2.5">
              {jobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? "bg-[#1A56DB]/5 border-[#1A56DB] ring-1 ring-[#1A56DB] shadow-md"
                        : "bg-[var(--nexa-bg-surface)] border-[var(--nexa-border)] hover:border-[#1A56DB]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#1A56DB]">{job.id}</span>
                      <NexaBadge variant={job.priority === "high" ? "coral" : "neutral"} className="text-[9px]">
                        {job.priority.toUpperCase()} PRIORITY
                      </NexaBadge>
                    </div>
                    <div className="font-bold text-xs text-[var(--nexa-text-primary)]">{job.service}</div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--nexa-text-muted)] pt-1 border-t border-[var(--nexa-border)]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{job.area}</span>
                      </div>
                      <div className="font-bold text-[var(--nexa-text-primary)]">{job.budget}</div>
                    </div>
                  </div>
                );
              })}
              {jobs.length === 0 && (
                <div className="p-8 text-center rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] text-xs text-[var(--nexa-text-muted)]">
                  All service bookings have been dispatched!
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 2: FIELD TECHNICIANS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#0E9F6E]" />
                2. Select Available Technician
              </h3>
              <span className="text-xs text-[var(--nexa-text-muted)] font-mono">{AVAILABLE_TECH_ROSTER.length} Available</span>
            </div>

            <div className="space-y-2.5">
              {AVAILABLE_TECH_ROSTER.map((tech) => {
                const isSelected = selectedTech?.id === tech.id;
                return (
                  <div
                    key={tech.id}
                    onClick={() => setSelectedTech(tech)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? "bg-[#0E9F6E]/5 border-[#0E9F6E] ring-1 ring-[#0E9F6E] shadow-md"
                        : "bg-[var(--nexa-bg-surface)] border-[var(--nexa-border)] hover:border-[#0E9F6E]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--nexa-text-primary)]">{tech.name}</span>
                      <NexaBadge variant="green" className="text-[9px]">
                        ★ {tech.rating} • 0 Queued
                      </NexaBadge>
                    </div>
                    <div className="text-xs text-[var(--nexa-text-secondary)]">{tech.specialty}</div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--nexa-text-muted)] pt-1 border-t border-[var(--nexa-border)]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{tech.location}</span>
                      </div>
                      <span className="font-mono text-[10px]">{tech.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM DISPATCH ACTION CARD */}
        <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-xs text-[var(--nexa-text-primary)]">
              {selectedJob && selectedTech ? (
                <span>Ready to dispatch <strong>{selectedJob.id}</strong> to <strong>{selectedTech.name}</strong></span>
              ) : (
                <span className="text-[var(--nexa-text-muted)]">Select one unassigned job and one available technician above</span>
              )}
            </div>
          </div>
          <NexaButton
            size="md"
            variant="primary"
            disabled={!selectedJob || !selectedTech}
            onClick={handleAssign}
            className="bg-[#1A56DB] text-white hover:bg-[#1545B0] px-6 shrink-0"
          >
            Confirm Dispatch Job
          </NexaButton>
        </div>
      </div>
    </SuperAdminShell>
  );
}
