"use client";

import React, { useState } from "react";
import {
  Building2,
  CheckCircle2,
  FolderTree,
  Layers,
  Plus,
  Users,
} from "lucide-react";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

const INITIAL_DEPTS = [
  { code: "DEPT-FIN", name: "Finance & Accounts", head: "Oluwatobiloba Olateju", headCount: 8, budget: "₦42,000,000", costCenter: "CC-101" },
  { code: "DEPT-FLT", name: "Fleet Operations & Maintenance", head: "Babajide Sanwo", headCount: 28, budget: "₦95,000,000", costCenter: "CC-201" },
  { code: "DEPT-IT", name: "Systems & IT / ERP", head: "System Administrator", headCount: 6, budget: "₦28,000,000", costCenter: "CC-301" },
  { code: "DEPT-HR", name: "Human Resources & Admin", head: "Goldy Okeke", headCount: 5, budget: "₦18,500,000", costCenter: "CC-401" },
  { code: "DEPT-MKT", name: "Commercial & Business Development", head: "Growth Lead", headCount: 12, budget: "₦35,000,000", costCenter: "CC-501" },
  { code: "DEPT-EXE", name: "Executive Directorate", head: "Ifeanyi Ibeh (MD)", headCount: 4, budget: "₦50,000,000", costCenter: "CC-001" },
];

export default function ERPDepartmentsPage() {
  return (
    <SuperAdminShell
      title="Departmental Structure & Cost Centers"
      subtitle="Define organizational hierarchy, cost center allocations, and executive leadership assignment."
      action={
        <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} className="bg-[#9061F9] text-white">
          Add Department
        </NexaButton>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INITIAL_DEPTS.map((d) => (
            <NexaCard key={d.code} variant="glass" padding="md" className="space-y-3 border border-[var(--nexa-border)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#9061F9]">{d.code}</span>
                <NexaBadge variant="purple">{d.costCenter}</NexaBadge>
              </div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">{d.name}</h3>
              <div className="space-y-1 text-xs text-[var(--nexa-text-secondary)] font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Department Lead:</span>
                  <span className="font-bold text-[var(--nexa-text-primary)]">{d.head}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Headcount:</span>
                  <span className="font-bold text-[var(--nexa-text-primary)]">{d.headCount} Staff</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Annual Budget:</span>
                  <span className="font-bold text-[#0E9F6E]">{d.budget}</span>
                </div>
              </div>
            </NexaCard>
          ))}
        </div>
      </div>
    </SuperAdminShell>
  );
}
