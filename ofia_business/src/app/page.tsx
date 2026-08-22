"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  Database,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Flame,
  Globe,
  Key,
  Layers,
  Lock,
  Mail,
  Package,
  PieChart,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  Store,
  Tag,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function BusinessMasterLauncherPage() {
  return (
    <BusinessShell
      title="Ofia Business Operating System"
      subtitle="Unified business portal orchestrating Marketer Autonomous AI & Marketplace, Finance & General Ledger, and Corporate ERP."
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/erp/accountant/marketer/ai">
            <NexaButton
              size="sm"
              variant="primary"
              leftIcon={<Zap className="w-3.5 h-3.5" />}
              className="bg-[#1A56DB] text-white hover:bg-[#1545B0]"
            >
              Launch AI Campaign
            </NexaButton>
          </Link>
          <Link href="/tenant/billing">
            <NexaButton size="sm" variant="outline" leftIcon={<CreditCard className="w-3.5 h-3.5" />}>
              Growth Tier
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* KPI BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NexaCard variant="glass" padding="md" className="space-y-1.5 border-l-4 border-l-[#1A56DB]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">AI Outbound Leads</span>
              <Bot className="w-4 h-4 text-[#1A56DB]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">1,480 Leads</div>
            <div className="text-[11px] text-[#1A56DB] font-semibold">15 Autonomous Agents Active</div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-1.5 border-l-4 border-l-[#0E9F6E]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Store GMV & Revenue</span>
              <DollarSign className="w-4 h-4 text-[#0E9F6E]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">₦14,850,000</div>
            <div className="text-[11px] text-[#0E9F6E] font-bold">+28.4% this month</div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-1.5 border-l-4 border-l-[#9061F9]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Corporate Headcount</span>
              <Building2 className="w-4 h-4 text-[#9061F9]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">84 Staff</div>
            <div className="text-[11px] text-[#9061F9] font-bold">11 Operating Departments</div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-1.5 border-l-4 border-l-[#F59E0B]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Monthly Quota Remaining</span>
              <Activity className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">82% Available</div>
            <div className="text-[11px] text-[var(--nexa-text-muted)] font-mono">1,640 / 2,000 Leads</div>
          </NexaCard>
        </div>

        {/* 3 PRIMARY OPERATING MODULES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* MODULE 1: MARKETER (AI + MARKETPLACE) */}
          <NexaCard
            variant="glass"
            padding="lg"
            className="space-y-5 border border-[#9061F9]/30 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#9061F9]/10 text-[#9061F9]">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[var(--nexa-text-primary)]">Marketer Operations</h3>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] font-mono">Under Finance & Accounts</p>
                  </div>
                </div>
                <NexaBadge variant="purple">Commercial Hub</NexaBadge>
              </div>

              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Autonomous Go-To-Market cold outreach and direct discovery marketplace commerce combined into the marketer user domain.
              </p>

              <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">AI Specialist Agents:</span>
                  <span className="font-bold text-[#1A56DB]">15 Autonomous</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Active Campaigns:</span>
                  <span className="font-bold text-[#0E9F6E]">4 Live Outreaches</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Product Catalog SKUs:</span>
                  <span className="font-bold text-[var(--nexa-text-primary)]">38 Items</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link href="/erp/accountant/marketer/ai" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#1A56DB]/10 hover:text-[#1A56DB] transition-all flex items-center justify-between">
                  <span>AI GTM Swarm</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
                <Link href="/erp/accountant/marketer/marketplace" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#0E9F6E]/10 hover:text-[#0E9F6E] transition-all flex items-center justify-between">
                  <span>Marketplace Store</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
              </div>

              <Link href="/erp/accountant/marketer" className="block pt-1">
                <NexaButton size="sm" variant="primary" className="w-full bg-[#9061F9] text-white hover:bg-[#7E3AF2] justify-center">
                  Open Marketer Hub
                </NexaButton>
              </Link>
            </div>
          </NexaCard>

          {/* MODULE 2: FINANCE & GENERAL LEDGER */}
          <NexaCard
            variant="glass"
            padding="lg"
            className="space-y-5 border border-[#0E9F6E]/30 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#0E9F6E]/10 text-[#0E9F6E]">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[var(--nexa-text-primary)]">Finance & Accounts</h3>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] font-mono">General Ledger & Payroll</p>
                  </div>
                </div>
                <NexaBadge variant="green">Accountant</NexaBadge>
              </div>

              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Corporate finance, accounts receivable invoices, accounts payable vendor bills, bank statement reconciliations, and payroll processing.
              </p>

              <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Operating Income (YTD):</span>
                  <span className="font-bold text-[#0E9F6E]">₦124,500,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Monthly Payroll:</span>
                  <span className="font-bold text-[var(--nexa-text-primary)]">₦18,450,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Fiscal Balance:</span>
                  <span className="font-bold text-[#1A56DB]">Reconciled (Feb)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link href="/erp/accountant/invoices" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#0E9F6E]/10 hover:text-[#0E9F6E] transition-all flex items-center justify-between">
                  <span>Client Invoices</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
                <Link href="/erp/accountant/bills" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#0E9F6E]/10 hover:text-[#0E9F6E] transition-all flex items-center justify-between">
                  <span>Vendor Bills</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
              </div>

              <Link href="/erp/accountant" className="block pt-1">
                <NexaButton size="sm" variant="primary" className="w-full bg-[#0E9F6E] text-white hover:bg-[#0B855D] justify-center">
                  Open Finance Cockpit
                </NexaButton>
              </Link>
            </div>
          </NexaCard>

          {/* MODULE 3: TENANT & ERP ROLES */}
          <NexaCard
            variant="glass"
            padding="lg"
            className="space-y-5 border border-[#1A56DB]/30 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#1A56DB]/10 text-[#1A56DB]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[var(--nexa-text-primary)]">ERP & Tenant Admin</h3>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] font-mono">Governance & Subscriptions</p>
                  </div>
                </div>
                <NexaBadge variant="brand">Enterprise</NexaBadge>
              </div>

              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                HR performance appraisals, departmental manager reviews, employee self-service, plan subscriptions, and AES-256 BYOK key management.
              </p>

              <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Active Organization:</span>
                  <span className="font-bold text-[var(--nexa-text-primary)]">EduSuite Nigeria</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Subscription Tier:</span>
                  <span className="font-bold text-[#1A56DB]">Growth (5 Seats)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">BYOK AI Keys:</span>
                  <span className="font-bold text-[#0E9F6E]">Configured</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link href="/erp" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#1A56DB]/10 hover:text-[#1A56DB] transition-all flex items-center justify-between">
                  <span>ERP Roles</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
                <Link href="/tenant" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#1A56DB]/10 hover:text-[#1A56DB] transition-all flex items-center justify-between">
                  <span>Tenant Admin</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
              </div>

              <Link href="/tenant/billing" className="block pt-1">
                <NexaButton size="sm" variant="primary" className="w-full bg-[#1A56DB] text-white hover:bg-[#1545B0] justify-center">
                  Manage Workspace
                </NexaButton>
              </Link>
            </div>
          </NexaCard>
        </div>
      </div>
    </BusinessShell>
  );
}
