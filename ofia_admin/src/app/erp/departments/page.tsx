"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderTree,
  Building2,
  Users,
  Plus,
  Edit2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function ERPDepartmentsPage() {
  const depts = [
    { id: "dept-1", name: "Finance & Accounts", subDepts: ["Accounts Payable", "Accounts Receivable", "Management Accounting", "Financial Analysis"], lead: "Head of Finance", headCount: 12, kpiCycle: "Q3 2026 Active" },
    { id: "dept-2", name: "Fleet Operations & Maintenance", subDepts: ["Fleet Operations North", "Fleet Support", "Workshop & Maintenance", "HSE Compliance"], lead: "Fleet Operations Manager", headCount: 38, kpiCycle: "Q3 2026 Active" },
    { id: "dept-3", name: "Human Resources & Administration", subDepts: ["Front Desk Support", "Talent Acquisition", "Office Administration"], lead: "HR Executive Lead", headCount: 8, kpiCycle: "Q3 2026 Active" },
    { id: "dept-4", name: "Systems, ERP & IT", subDepts: ["Core Infrastructure", "ERP Development", "Network Operations Center"], lead: "Lead Systems Architect", headCount: 6, kpiCycle: "Q3 2026 Active" },
    { id: "dept-5", name: "Marketing & Growth", subDepts: ["Brand Strategy", "Customer Success", "Digital Outreach"], lead: "Growth Lead", headCount: 14, kpiCycle: "Q3 2026 Active" },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/erp" className="text-xs font-bold text-[#7E3AF2] hover:underline">
                ← ERP Admin
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--nexa-text-primary)] flex items-center gap-2.5 mt-1">
              <FolderTree className="w-6 h-6 text-[#7E3AF2]" />
              Department Structures & KPI Cycles
            </h1>
            <p className="text-xs sm:text-sm text-[var(--nexa-text-muted)] mt-1">
              Configure corporate department hierarchies, designated managerial leads, and quarterly appraisal cycles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <NexaButton size="sm" variant="primary" className="bg-[#7E3AF2] hover:bg-[#6C2BD9] text-white" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Department
            </NexaButton>
          </div>
        </div>

        {/* DEPARTMENT HIERARCHY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {depts.map((d) => (
            <NexaCard key={d.id} variant="glass" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-[var(--nexa-text-primary)]">{d.name}</div>
                <NexaBadge variant="brand">{d.kpiCycle}</NexaBadge>
              </div>

              <div className="text-xs text-[var(--nexa-text-muted)]">
                Lead: <strong className="text-[var(--nexa-text-primary)]">{d.lead}</strong> • Headcount: <strong className="text-[var(--nexa-text-primary)]">{d.headCount}</strong>
              </div>

              <div className="space-y-1 pt-2 border-t border-[var(--nexa-border)]">
                <span className="text-[10px] font-extrabold uppercase text-[var(--nexa-text-muted)]">Sub-Units:</span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {d.subDepts.map((sub) => (
                    <span key={sub} className="px-2 py-0.5 rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[11px] text-[var(--nexa-text-secondary)]">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </NexaCard>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
