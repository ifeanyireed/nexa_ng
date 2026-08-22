"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Building2,
  FolderTree,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  Landmark,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function ERPAdminOverviewPage() {
  const departments = [
    { name: "Finance & Accounts", head: "Head of Finance", staffCount: 12, payroll: "₦3.2M", kpiStatus: "100% Completed" },
    { name: "Fleet Operations & Maintenance", head: "Fleet Operations Manager", staffCount: 38, payroll: "₦5.8M", kpiStatus: "96% Completed" },
    { name: "Human Resources & Admin", head: "HR Executive Lead", staffCount: 8, payroll: "₦1.9M", kpiStatus: "100% Completed" },
    { name: "Systems, ERP & IT", head: "ERP/IT Lead", staffCount: 6, payroll: "₦2.1M", kpiStatus: "100% Completed" },
    { name: "Marketing & Growth", head: "Growth Lead", staffCount: 14, payroll: "₦2.8M", kpiStatus: "94% Completed" },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--nexa-text-primary)] flex items-center gap-2.5">
              <Briefcase className="w-6 h-6 text-[#7E3AF2]" />
              Ofia ERP Enterprise Super Admin
            </h1>
            <p className="text-xs sm:text-sm text-[var(--nexa-text-muted)] mt-1">
              Organization-wide human resources, multi-role RBAC governance, and general ledger finance management.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/erp/users">
              <NexaButton size="sm" variant="primary" className="bg-[#7E3AF2] hover:bg-[#6C2BD9] text-white">
                Manage 120 Staff Roles
              </NexaButton>
            </Link>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NexaCard variant="glass" padding="md" className="space-y-1">
            <span className="text-xs font-bold text-[var(--nexa-text-muted)] uppercase">Active Enterprise Staff</span>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] flex items-center justify-between">
              <span>120</span>
              <NexaBadge variant="purple">Full Roster</NexaBadge>
            </div>
            <p className="text-[11px] text-[var(--nexa-text-muted)]">Across 14 departments</p>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-1">
            <span className="text-xs font-bold text-[var(--nexa-text-muted)] uppercase">Monthly Payroll Disbursed</span>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] flex items-center justify-between">
              <span>₦18,450,000</span>
              <span className="text-xs font-bold text-[#0E9F6E]">On Time</span>
            </div>
            <p className="text-[11px] text-[var(--nexa-text-muted)]">Automated statutory tax deduction</p>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-1">
            <span className="text-xs font-bold text-[var(--nexa-text-muted)] uppercase">Q3 Appraisal Progress</span>
            <div className="text-2xl font-black text-[#0E9F6E] flex items-center justify-between">
              <span>98.6%</span>
              <NexaBadge variant="brand">Active Cycle</NexaBadge>
            </div>
            <p className="text-[11px] text-[var(--nexa-text-muted)]">118 of 120 appraisals graded</p>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-1">
            <span className="text-xs font-bold text-[var(--nexa-text-muted)] uppercase">RBAC Roles Defined</span>
            <div className="text-2xl font-black text-[#7E3AF2] flex items-center justify-between">
              <span>6 Roles</span>
              <span className="text-xs font-bold text-[var(--nexa-text-muted)]">Enforced</span>
            </div>
            <p className="text-[11px] text-[var(--nexa-text-muted)]">Employee, Manager, HR, Acc, MD, Admin</p>
          </NexaCard>
        </div>

        {/* QUICK ERP LINKS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/erp/users" className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-[#7E3AF2]/50 transition-all space-y-2 group">
            <div className="flex items-center justify-between">
              <Users className="w-5 h-5 text-[#7E3AF2]" />
              <NexaBadge variant="purple">120 Users</NexaBadge>
            </div>
            <h4 className="font-bold text-sm text-[var(--nexa-text-primary)] group-hover:text-[#7E3AF2] transition-colors">
              User & RBAC Management
            </h4>
            <p className="text-xs text-[var(--nexa-text-muted)]">
              Assign roles (`employee`, `manager`, `hr`, `accountant`, `md`, `admin`) and reporting managers.
            </p>
          </Link>

          <Link href="/erp/departments" className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-[#7E3AF2]/50 transition-all space-y-2 group">
            <div className="flex items-center justify-between">
              <FolderTree className="w-5 h-5 text-[#1A56DB]" />
              <NexaBadge variant="brand">14 Depts</NexaBadge>
            </div>
            <h4 className="font-bold text-sm text-[var(--nexa-text-primary)] group-hover:text-[#1A56DB] transition-colors">
              Department Structures & KPIs
            </h4>
            <p className="text-xs text-[var(--nexa-text-muted)]">
              Manage parent department trees and standardized quarterly KPI weightings.
            </p>
          </Link>

          <Link href="/erp/audit-trail" className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-[#7E3AF2]/50 transition-all space-y-2 group">
            <div className="flex items-center justify-between">
              <FileSpreadsheet className="w-5 h-5 text-[#0E9F6E]" />
              <NexaBadge variant="cyan">Real-time</NexaBadge>
            </div>
            <h4 className="font-bold text-sm text-[var(--nexa-text-primary)] group-hover:text-[#0E9F6E] transition-colors">
              Financial & HR Audit Trail
            </h4>
            <p className="text-xs text-[var(--nexa-text-muted)]">
              Track payroll disbursement logs, general ledger adjustments, and salary updates.
            </p>
          </Link>
        </div>

        {/* DEPARTMENTAL OVERVIEW TABLE */}
        <NexaCard variant="glass" padding="none" className="overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[var(--nexa-border)] flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[var(--nexa-text-primary)]">
                Corporate Department Roster
              </h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Headcount and payroll allocation by department.
              </p>
            </div>
            <Link href="/erp/departments" className="text-xs font-bold text-[#7E3AF2] hover:underline">
              Configure Tree →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Designated Lead</th>
                  <th className="py-3 px-4">Staff Count</th>
                  <th className="py-3 px-4">Monthly Allocation</th>
                  <th className="py-3 px-4">Appraisal Cycle</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] font-medium">
                {departments.map((dept) => (
                  <tr key={dept.name} className="hover:bg-[var(--nexa-bg-surface)]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[var(--nexa-text-primary)]">
                      {dept.name}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--nexa-text-secondary)]">{dept.head}</td>
                    <td className="py-3.5 px-4 font-bold">{dept.staffCount} staff</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0E9F6E]">{dept.payroll}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0E9F6E] bg-[#0E9F6E]/10 px-2 py-0.5 rounded-full border border-[#0E9F6E]/20">
                        {dept.kpiStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href="/erp/users" className="text-xs font-bold text-[#7E3AF2] hover:underline">
                        View Staff
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NexaCard>
      </div>
    </AdminShell>
  );
}
