"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Layers,
  Lock,
  PieChart,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function ERPAdminOverviewPage() {
  return (
    <SuperAdminShell
      title="Enterprise ERP Administration"
      subtitle="Corporate governance across Human Resources, Staff Roster, Departmental Structure, and Role-Based Access Control."
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/erp/tenants">
            <NexaButton size="sm" variant="primary" leftIcon={<Building2 className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white hover:bg-[#1545B0]">
              Tenant & Module Control
            </NexaButton>
          </Link>
          <Link href="/erp/users">
            <NexaButton size="sm" variant="outline" leftIcon={<Lock className="w-3.5 h-3.5 text-[#9061F9]" />}>
              RBAC Governance
            </NexaButton>
          </Link>
          <Link href="/erp/departments">
            <NexaButton size="sm" variant="outline" leftIcon={<Layers className="w-3.5 h-3.5 text-[#0E9F6E]" />}>
              Departments
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* TOP METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#1A56DB]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Tenant Workspaces</span>
              <Building2 className="w-4 h-4 text-[#1A56DB]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              5 Organizations
            </div>
            <div className="text-[11px] text-[#1A56DB] font-bold">
              9 ERP Modules Configured
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#9061F9]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Active Corporate Staff</span>
              <Users className="w-4 h-4 text-[#9061F9]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              84 Staff
            </div>
            <div className="text-[11px] text-[#9061F9] font-bold">
              11 Operating Departments
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#0E9F6E]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">RBAC Access Tiers</span>
              <Lock className="w-4 h-4 text-[#0E9F6E]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              6 Roles
            </div>
            <div className="text-[11px] text-[#0E9F6E] font-bold">
              Employee, Manager, HR, Accountant, MD, Admin
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#F59E0B]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Audit Health & Permissions</span>
              <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              100%
            </div>
            <div className="text-[11px] text-[#0E9F6E] font-semibold">
              Strict Least-Privilege Enforced
            </div>
          </NexaCard>
        </div>

        {/* QUICK LINK PANELS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/erp/tenants" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#1A56DB] transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#1A56DB]/10 text-[#1A56DB]">
                  <Building2 className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--nexa-text-muted)] group-hover:text-[#1A56DB] transition-colors" />
              </div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Tenant & Module Control</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Inspect tenant subscriptions, override quota limits, and toggle on/off ERP modules per organization.
              </p>
            </NexaCard>
          </Link>

          <Link href="/erp/users" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#9061F9] transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#9061F9]/10 text-[#9061F9]">
                  <Lock className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--nexa-text-muted)] group-hover:text-[#9061F9] transition-colors" />
              </div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">User & Role Governance</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Assign 6-tier RBAC access roles (Employee, Manager, HR, Accountant, MD, Admin) across corporate staff.
              </p>
            </NexaCard>
          </Link>

          <Link href="/erp/departments" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#0E9F6E] transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#0E9F6E]/10 text-[#0E9F6E]">
                  <Layers className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--nexa-text-muted)] group-hover:text-[#0E9F6E] transition-colors" />
              </div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Department Hierarchy</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Configure corporate departments, assign departmental leads, and manage headcount budgets.
              </p>
            </NexaCard>
          </Link>
        </div>

        {/* DEPARTMENTAL HEADCOUNT & RECENT AUDIT LOGS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#9061F9]" />
                Departmental Roster & Headcount
              </h3>
              <NexaBadge variant="purple">11 Departments</NexaBadge>
            </div>

            <div className="space-y-2.5">
              {[
                { dept: "Finance & Accounts", count: 8, lead: "Head of Finance", color: "#1A56DB" },
                { dept: "Fleet Operations & Maintenance", count: 28, lead: "Fleet Operations Manager", color: "#0E9F6E" },
                { dept: "Systems & IT", count: 6, lead: "ERP/IT Officer", color: "#9061F9" },
                { dept: "Human Resources", count: 5, lead: "HR Executive Lead", color: "#F59E0B" },
                { dept: "Executive Management", count: 4, lead: "Managing Director", color: "#E02424" },
              ].map((d) => (
                <div key={d.dept} className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[var(--nexa-text-primary)]">{d.dept}</div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)]">Lead: {d.lead}</div>
                  </div>
                  <div className="font-mono font-bold text-sm text-[var(--nexa-text-primary)]">
                    {d.count} Staff
                  </div>
                </div>
              ))}
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0E9F6E]" />
                Recent Financial & HR Events
              </h3>
              <NexaBadge variant="green">Live Ledger</NexaBadge>
            </div>

            <div className="space-y-2.5">
              {[
                { event: "Payroll Batch Authorized (Feb 2026)", user: "Managing Director (MD)", amount: "₦18,450,000", time: "1h ago" },
                { event: "Withholding Tax (WHT) Remitted to FIRS", user: "Finance Lead", amount: "₦1,240,000", time: "4h ago" },
                { event: "Q1 Performance Appraisal Cycle Opened", user: "HR Executive", amount: "All Staff", time: "1d ago" },
                { event: "General Ledger Period Reconciled (Jan)", user: "Head of Finance", amount: "Balanced", time: "2d ago" },
              ].map((ev, i) => (
                <div key={i} className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-[var(--nexa-text-primary)]">{ev.event}</div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)]">By: {ev.user}</div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="font-mono font-bold text-[var(--nexa-text-primary)]">{ev.amount}</div>
                    <div className="text-[10px] text-[var(--nexa-text-muted)]">{ev.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </NexaCard>
        </div>
      </div>
    </SuperAdminShell>
  );
}
