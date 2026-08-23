"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Send,
  Sparkles,
  Truck,
  UserCheck,
  Users,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

const UNASSIGNED_JOBS = [
  { id: "JOB-401", customer: "Dangote Refinery Admin", address: "Plot 1, Commercial Ave, Ikeja", service: "Solar Inverter 5kVA On-site Installation", preferredTime: "Today, 02:00 PM", urgency: "HIGH" },
  { id: "JOB-402", customer: "Fidelity Bank VI", address: "Ahmadu Bello Way, Victoria Island", service: "4K CCTV Camera Maintenance & Diagnostic", preferredTime: "Tomorrow, 10:00 AM", urgency: "NORMAL" },
];

const AVAILABLE_TECHS = [
  { id: "TECH-101", name: "Ibrahim Musa", skill: "Master Solar & CCTV Technician", proximity: "2.4 km away (Ikeja)", vehicle: "Bike (KJA-482-XA)", rating: 4.9, activeJobs: 1 },
  { id: "TECH-102", name: "Emeka Okafor", skill: "Certified Electrical Engineer", proximity: "5.1 km away (Maryland)", vehicle: "Van (APP-912-LK)", rating: 4.8, activeJobs: 0 },
];

export default function DispatchConsolePage() {
  const [assigned, setAssigned] = useState<string[]>([]);

  const handleAutoDispatch = () => {
    setAssigned(["JOB-401", "JOB-402"]);
  };

  return (
    <BusinessShell
      title="Automated Dispatch Console"
      subtitle="Smart proximity matching algorithm for dispatching field technicians and express delivery couriers."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/logistics">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Ofia Logistics Manager
            </NexaButton>
          </Link>
          <NexaButton
            size="sm"
            variant="primary"
            onClick={handleAutoDispatch}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            className="bg-gradient-to-r from-[#1A56DB] to-[#7E3AF2] text-white font-bold"
          >
            Run Proximity Auto-Dispatch
          </NexaButton>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: UNASSIGNED DISPATCH TICKETS (6 COLS) */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center justify-between">
            <span>Pending Dispatch Queue ({UNASSIGNED_JOBS.length})</span>
            <span className="text-xs text-[#E02424] font-semibold">Requires Assignment</span>
          </h3>

          <div className="space-y-3">
            {UNASSIGNED_JOBS.map((job) => (
              <NexaCard key={job.id} variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#1A56DB]">{job.id}</span>
                  <NexaBadge variant={job.urgency === "HIGH" ? "danger" : "neutral"} className="text-[9px]">
                    {job.urgency} PRIORITY
                  </NexaBadge>
                </div>
                <div className="font-bold text-sm text-[var(--nexa-text-primary)]">{job.customer}</div>
                <div className="text-xs text-[var(--nexa-text-secondary)] font-medium">{job.service}</div>
                <div className="flex items-center gap-1 text-[11px] text-[var(--nexa-text-muted)]">
                  <MapPin className="w-3 h-3 text-[#E02424]" />
                  <span>{job.address}</span>
                </div>

                <div className="pt-2 border-t border-[var(--nexa-border)] flex items-center justify-between">
                  <span className="text-[11px] text-[var(--nexa-text-muted)] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {job.preferredTime}
                  </span>
                  <NexaButton size="sm" variant="outline">
                    {assigned.includes(job.id) ? "Assigned to Tech" : "Assign Driver"}
                  </NexaButton>
                </div>
              </NexaCard>
            ))}
          </div>
        </div>

        {/* RIGHT: NEARBY AVAILABLE FIELD CREW (6 COLS) */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center justify-between">
            <span>Available Nearby Fleet & Techs ({AVAILABLE_TECHS.length})</span>
            <span className="text-xs text-[#0E9F6E] font-semibold">GPS Active</span>
          </h3>

          <div className="space-y-3">
            {AVAILABLE_TECHS.map((tech) => (
              <NexaCard key={tech.id} variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)]">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-[var(--nexa-text-primary)]">{tech.name}</div>
                  <NexaBadge variant="green" dot>Available</NexaBadge>
                </div>
                <div className="text-xs text-[#1A56DB] font-semibold">{tech.skill}</div>
                <div className="p-2.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex justify-between text-xs">
                  <div>
                    <span className="text-[var(--nexa-text-muted)]">Proximity: </span>
                    <span className="font-bold text-[var(--nexa-text-primary)]">{tech.proximity}</span>
                  </div>
                  <div>
                    <span className="text-[var(--nexa-text-muted)]">Rating: </span>
                    <span className="font-bold text-[#F59E0B]">⭐ {tech.rating}</span>
                  </div>
                </div>
                <div className="text-[11px] text-[var(--nexa-text-muted)] font-mono">
                  Assigned Vehicle: {tech.vehicle}
                </div>
              </NexaCard>
            ))}
          </div>
        </div>
      </div>
    </BusinessShell>
  );
}
