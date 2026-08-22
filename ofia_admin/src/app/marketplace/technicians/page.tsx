"use client";

import React, { useState } from "react";
import {
  Award,
  CheckCircle2,
  Filter,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Star,
  UserCheck,
  Wrench,
} from "lucide-react";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

const TECH_LIST = [
  { id: "TECH-001", name: "John Philip", specialty: "Electrical & Inverters", location: "Lekki Phase 1, Lagos", phone: "+234 802 111 2222", rating: 4.9, completedJobs: 142, status: "AVAILABLE" },
  { id: "TECH-002", name: "Emmanuel Nwosu", specialty: "Plumbing & Piping", location: "Victoria Island, Lagos", phone: "+234 803 222 3333", rating: 4.8, completedJobs: 98, status: "ON_JOB" },
  { id: "TECH-003", name: "Michael Bello", specialty: "HVAC & Air Conditioning", location: "Surulere, Lagos", phone: "+234 805 333 4444", rating: 4.7, completedJobs: 76, status: "AVAILABLE" },
  { id: "TECH-004", name: "Fatima Aliyu", specialty: "Access Control & CCTV", location: "Wuse 2, Abuja", phone: "+234 809 444 5555", rating: 4.9, completedJobs: 110, status: "AVAILABLE" },
  { id: "TECH-005", name: "Chinedu Eze", specialty: "Carpentry & Furniture", location: "GRA Phase 2, Port Harcourt", phone: "+234 818 555 6666", rating: 4.6, completedJobs: 54, status: "OFF_DUTY" },
];

export default function MarketplaceTechniciansPage() {
  const [search, setSearch] = useState("");

  const filtered = TECH_LIST.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.specialty.toLowerCase().includes(search.toLowerCase()) ||
    t.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SuperAdminShell
      title="Field Technician Roster & Verification"
      subtitle="Certified on-demand field artisans dispatched for verified client jobs across Lagos, Abuja, and Port Harcourt."
      action={
        <NexaBadge variant="green" className="py-1 px-3 text-xs font-bold">
          {TECH_LIST.filter((t) => t.status === "AVAILABLE").length} Online & Ready
        </NexaBadge>
      }
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search technician by name, trade, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#0E9F6E]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-semibold">
              <tr>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-3">Specialty / Trade</th>
                <th className="py-3 px-3">Base Location</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Rating & Jobs</th>
                <th className="py-3 px-3">Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
              {filtered.map((tech) => (
                <tr key={tech.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#0E9F6E]" />
                    <div>
                      <div>{tech.name}</div>
                      <div className="font-mono text-[10px] text-[var(--nexa-text-muted)]">{tech.id}</div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <NexaBadge variant="neutral">{tech.specialty}</NexaBadge>
                  </td>
                  <td className="py-3.5 px-3 text-[11px] text-[var(--nexa-text-muted)]">{tech.location}</td>
                  <td className="py-3.5 px-3 font-mono text-[11px]">{tech.phone}</td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1 font-bold">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                      <span>{tech.rating}</span>
                      <span className="text-[10px] text-[var(--nexa-text-muted)] font-normal">
                        ({tech.completedJobs} jobs)
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <NexaBadge
                      variant={
                        tech.status === "AVAILABLE"
                          ? "green"
                          : tech.status === "ON_JOB"
                          ? "purple"
                          : "neutral"
                      }
                      className="text-[9px]"
                    >
                      {tech.status}
                    </NexaBadge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <NexaButton size="sm" variant="outline">
                      View Profile
                    </NexaButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminShell>
  );
}
