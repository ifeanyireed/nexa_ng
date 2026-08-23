"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Building2,
  CheckCircle2,
  CreditCard,
  Database,
  DollarSign,
  Globe,
  Layers,
  Lock,
  Mail,
  PieChart,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Terminal,
  TrendingUp,
  UserCheck,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function MasterOverviewPage() {
  return (
    <SuperAdminShell
      title="Master Overview & Cross-App Governance"
      subtitle="Unified Super Admin command center orchestrating Ofia AI Autonomous Swarm, Ofia Discovery Marketplace, and Ofia Enterprise ERP."
      subTabs={[]}
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/ai/email">
            <NexaButton
              size="sm"
              variant="primary"
              leftIcon={<Mail className="w-3.5 h-3.5" />}
              className="bg-[#1A56DB] text-white hover:bg-[#1545B0] shadow-sm"
            >
              Email Setup Wizard
            </NexaButton>
          </Link>
          <Link href="/marketplace/disputes">
            <NexaButton
              size="sm"
              variant="outline"
              leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-[#E02424]" />}
            >
              Dispute Queue (2)
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* CROSS-APP EXECUTIVE KPI BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Ecosystem Revenue */}
          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#0E9F6E]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Ecosystem Volume (YTD)</span>
              <DollarSign className="w-4 h-4 text-[#0E9F6E]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              ₦427,050,000
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#0E9F6E] font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Across GTM, Marketplace & ERP</span>
            </div>
          </NexaCard>

          {/* Active AI Organizations */}
          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#1A56DB]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Active AI Organizations</span>
              <Bot className="w-4 h-4 text-[#1A56DB]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              142 Tenants
            </div>
            <div className="text-[11px] text-[#1A56DB] font-semibold">
              15 Autonomous Specialists Deployed
            </div>
          </NexaCard>

          {/* Marketplace Merchants */}
          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#7E3AF2]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Marketplace Verified Pros</span>
              <ShoppingBag className="w-4 h-4 text-[#7E3AF2]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              1,420 Merchants
            </div>
            <div className="text-[11px] text-[#0E9F6E] font-semibold">
              98.2% Fulfillment Success Rate
            </div>
          </NexaCard>

          {/* Corporate ERP Staff */}
          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#9061F9]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Enterprise ERP Headcount</span>
              <Building2 className="w-4 h-4 text-[#9061F9]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              84 Active Staff
            </div>
            <div className="text-[11px] text-[var(--nexa-text-muted)] font-mono">
              11 Operating Departments
            </div>
          </NexaCard>
        </div>

        {/* 3 APPLICATION HUBS - GROUPED CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* APP 1: OFIA AI SWARM */}
          <NexaCard
            variant="glass"
            padding="lg"
            className="space-y-5 border border-[#1A56DB]/30 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1A56DB]/5 rounded-bl-full pointer-events-none" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#1A56DB]/10 text-[#1A56DB]">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[var(--nexa-text-primary)]">Ofia AI Platform</h3>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] font-mono">Autonomous GTM & AI Swarm</p>
                  </div>
                </div>
                <NexaBadge variant="brand">B2B SaaS</NexaBadge>
              </div>

              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Centralized management of cold email infrastructure (Resend/Brevo/SES), multi-tenant organizations, 15 specialized AI agents, and LLM telemetry.
              </p>

              <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Active Relay Provider:</span>
                  <span className="font-bold text-[#1A56DB]">Resend REST API</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Inbox Deliverability:</span>
                  <span className="font-bold text-[#0E9F6E]">99.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">LLM Token Latency:</span>
                  <span className="font-bold text-[var(--nexa-text-primary)]">142ms Avg</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link href="/ai/email" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#1A56DB]/10 hover:text-[#1A56DB] transition-all flex items-center justify-between">
                  <span>Email Console</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
                <Link href="/ai/organizations" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#1A56DB]/10 hover:text-[#1A56DB] transition-all flex items-center justify-between">
                  <span>Tenants & Plans</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
                <Link href="/ai/observability" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#1A56DB]/10 hover:text-[#1A56DB] transition-all flex items-center justify-between">
                  <span>Token Traces</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
                <Link href="/ai/swarm" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#1A56DB]/10 hover:text-[#1A56DB] transition-all flex items-center justify-between">
                  <span>Agent Swarm (15)</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
              </div>

              <Link href="/ai" className="block pt-1">
                <NexaButton size="sm" variant="primary" className="w-full bg-[#1A56DB] text-white hover:bg-[#1545B0] justify-center">
                  Open AI Platform Admin
                </NexaButton>
              </Link>
            </div>
          </NexaCard>

          {/* APP 2: OFIA MARKETPLACE */}
          <NexaCard
            variant="glass"
            padding="lg"
            className="space-y-5 border border-[#0E9F6E]/30 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0E9F6E]/5 rounded-bl-full pointer-events-none" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#0E9F6E]/10 text-[#0E9F6E]">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[var(--nexa-text-primary)]">Ofia Marketplace</h3>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] font-mono">B2B/B2C Discovery Platform</p>
                  </div>
                </div>
                <NexaBadge variant="green">Marketplace</NexaBadge>
              </div>

              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Supervision of 99+ Nigerian niche verticals, business verification (Nexa Verified), on-demand technician job dispatch, and escrow dispute arbitration.
              </p>

              <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Monthly GMV:</span>
                  <span className="font-bold text-[#0E9F6E]">₦84,250,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Verified Businesses:</span>
                  <span className="font-bold text-[#0E9F6E]">894 Badges Issued</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Dispute Queue:</span>
                  <span className="font-bold text-[#E02424]">2 Open Grievances</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link href="/marketplace/merchants" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#0E9F6E]/10 hover:text-[#0E9F6E] transition-all flex items-center justify-between">
                  <span>Pro Merchants</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
                <Link href="/marketplace/assignments" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#0E9F6E]/10 hover:text-[#0E9F6E] transition-all flex items-center justify-between">
                  <span>Job Dispatch</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
                <Link href="/marketplace/disputes" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#0E9F6E]/10 hover:text-[#0E9F6E] transition-all flex items-center justify-between">
                  <span>Disputes & Escrow</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
                <Link href="/marketplace/technicians" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#0E9F6E]/10 hover:text-[#0E9F6E] transition-all flex items-center justify-between">
                  <span>Field Technicians</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
              </div>

              <Link href="/marketplace" className="block pt-1">
                <NexaButton size="sm" variant="primary" className="w-full bg-[#0E9F6E] text-white hover:bg-[#0B855D] justify-center">
                  Open Marketplace Admin
                </NexaButton>
              </Link>
            </div>
          </NexaCard>

          {/* APP 3: OFIA ENTERPRISE ERP */}
          <NexaCard
            variant="glass"
            padding="lg"
            className="space-y-5 border border-[#9061F9]/30 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#9061F9]/5 rounded-bl-full pointer-events-none" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#9061F9]/10 text-[#9061F9]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[var(--nexa-text-primary)]">Ofia Enterprise ERP</h3>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] font-mono">HR, Finance & Operations</p>
                  </div>
                </div>
                <NexaBadge variant="purple">Internal ERP</NexaBadge>
              </div>

              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Corporate governance across Human Resources, general ledger, consolidated balance sheets, payroll disbursement, and immutable enterprise audit trails.
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
                  <span className="text-[var(--nexa-text-muted)]">RBAC Access Tiers:</span>
                  <span className="font-bold text-[#9061F9]">6 Active Roles</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link href="/erp/users" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#9061F9]/10 hover:text-[#9061F9] transition-all flex items-center justify-between">
                  <span>RBAC Governance</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
                <Link href="/erp/departments" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#9061F9]/10 hover:text-[#9061F9] transition-all flex items-center justify-between">
                  <span>Departments</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
              </div>

              <Link href="/erp" className="block pt-1">
                <NexaButton size="sm" variant="primary" className="w-full bg-[#9061F9] text-white hover:bg-[#7E3AF2] justify-center">
                  Open ERP Admin
                </NexaButton>
              </Link>
            </div>
          </NexaCard>
        </div>

        {/* SYSTEM CLUSTER & MICROSERVICES STATUS */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                <Server className="w-4 h-4 text-[#1A56DB]" />
                Infrastructure & Microservices Cluster Topology
              </h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Real-time health status of core Go backends and multi-tenant databases
              </p>
            </div>
            <NexaBadge variant="green" className="py-1 px-3 text-xs font-mono font-bold">
              ● All Clusters Healthy
            </NexaBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              { name: "ai_gtm_service", port: "8082", tech: "Go 1.26 + GORM", status: "HEALTHY", desc: "Autonomous Swarm & Email Relay" },
              { name: "user_subscription_service", port: "8081", tech: "Go 1.26 + JWT", status: "HEALTHY", desc: "Auth, Multi-Tenant RBAC & Quotas" },
              { name: "marketplace_service", port: "8085", tech: "Go 1.26 + REST", status: "HEALTHY", desc: "99 Niche Directories & Bookings" },
              { name: "erp_service", port: "8080/8085", tech: "Go 1.26 + MySQL", status: "HEALTHY", desc: "Finance & HR Microservices" },
            ].map((srv) => (
              <div key={srv.name} className="p-3.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-[var(--nexa-text-primary)]">{srv.name}</span>
                  <NexaBadge variant="green" className="text-[9px] py-0 font-mono">
                    {srv.status}
                  </NexaBadge>
                </div>
                <div className="text-[11px] text-[var(--nexa-text-muted)]">{srv.desc}</div>
                <div className="flex justify-between text-[10px] text-[var(--nexa-text-muted)] pt-1 border-t border-[var(--nexa-border)] font-mono">
                  <span>Port: {srv.port}</span>
                  <span>{srv.tech}</span>
                </div>
              </div>
            ))}
          </div>
        </NexaCard>
      </div>
    </SuperAdminShell>
  );
}
