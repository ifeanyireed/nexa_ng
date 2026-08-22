"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Sparkles,
  ShoppingBag,
  Briefcase,
  Server,
  Activity,
  Users,
  Building2,
  Mail,
  Award,
  AlertOctagon,
  Layers,
  UserCheck,
  FolderTree,
  FileSpreadsheet,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Cpu,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function SuperAdminOverviewPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const services = [
    { name: "ai_gtm_service", port: 8082, desc: "Autonomous GTM Swarm & Outreach Engine", status: "ONLINE", latency: "14ms", version: "v2.4.0" },
    { name: "user_subscription_service", port: 8081, desc: "Auth, Multi-Tenant RBAC & SubscriptionHelper", status: "ONLINE", latency: "12ms", version: "v1.8.0" },
    { name: "marketplace_service", port: 8085, desc: "Marketplace Search, Booking & Paystack Escrow", status: "ONLINE", latency: "18ms", version: "v2.1.0" },
    { name: "erp_service (Finance & HR)", port: 8080, desc: "General Ledger, Payroll & Appraisal Engine", status: "ONLINE", latency: "16ms", version: "v1.5.0" },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--nexa-text-primary)] flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-[#1A56DB]" />
              Super Admin Unified Command Center
            </h1>
            <p className="text-xs sm:text-sm text-[var(--nexa-text-muted)] mt-1">
              Cross-application infrastructure, security, identity, and telemetry for <strong>Ofia AI</strong>, <strong>Ofia Marketplace</strong>, and <strong>Ofia ERP</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <NexaButton
              size="sm"
              variant="outline"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
              onClick={handleRefresh}
            >
              Refresh Telemetry
            </NexaButton>
            <NexaBadge variant="brand">Platform v3.2 Production</NexaBadge>
          </div>
        </div>

        {/* 3 APPLICATION OVERVIEW CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* OFIA AI CARD */}
          <NexaCard variant="glass" padding="md" className="space-y-4 border-l-4 border-l-[#1A56DB]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#1A56DB]/10 text-[#1A56DB]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">Ofia AI</h3>
                  <p className="text-[11px] text-[var(--nexa-text-muted)]">Autonomous GTM Engine</p>
                </div>
              </div>
              <NexaBadge variant="brand">B2B SaaS</NexaBadge>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--nexa-border)]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Active Workspaces</span>
                <p className="text-lg font-black text-[var(--nexa-text-primary)]">240</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">AI Agents Live</span>
                <p className="text-lg font-black text-[#0E9F6E]">15 / 15</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Deliverability</span>
                <p className="text-sm font-bold text-[#1A56DB]">99.4%</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Daily Outbound</span>
                <p className="text-sm font-bold text-[var(--nexa-text-primary)]">14,280 emails</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--nexa-border)] text-xs">
              <Link href="/ai" className="font-bold text-[#1A56DB] hover:underline flex items-center gap-1">
                Open AI Admin <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/ai/email" className="text-[11px] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]">
                Email Infra →
              </Link>
            </div>
          </NexaCard>

          {/* OFIA MARKETPLACE CARD */}
          <NexaCard variant="glass" padding="md" className="space-y-4 border-l-4 border-l-[#0E9F6E]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#0E9F6E]/10 text-[#0E9F6E]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">Ofia Marketplace</h3>
                  <p className="text-[11px] text-[var(--nexa-text-muted)]">Nexa Discovery Network</p>
                </div>
              </div>
              <NexaBadge variant="cyan">B2C & B2B</NexaBadge>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--nexa-border)]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Total GMV</span>
                <p className="text-lg font-black text-[var(--nexa-text-primary)]">₦42.8M</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Active Pros</span>
                <p className="text-lg font-black text-[#0E9F6E]">3,420</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Niches Covered</span>
                <p className="text-sm font-bold text-[#0E9F6E]">99+ Categories</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Escrow Status</span>
                <p className="text-sm font-bold text-[#1A56DB]">₦3.2M in Transit</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--nexa-border)] text-xs">
              <Link href="/marketplace" className="font-bold text-[#0E9F6E] hover:underline flex items-center gap-1">
                Open Marketplace Admin <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/marketplace/pros" className="text-[11px] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]">
                Pro Vetting →
              </Link>
            </div>
          </NexaCard>

          {/* OFIA ERP CARD */}
          <NexaCard variant="glass" padding="md" className="space-y-4 border-l-4 border-l-[#7E3AF2]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#7E3AF2]/10 text-[#7E3AF2]">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">Ofia ERP</h3>
                  <p className="text-[11px] text-[var(--nexa-text-muted)]">Enterprise HR & Finance</p>
                </div>
              </div>
              <NexaBadge variant="purple">Enterprise</NexaBadge>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--nexa-border)]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Staff Enrolled</span>
                <p className="text-lg font-black text-[var(--nexa-text-primary)]">120 Staff</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Departments</span>
                <p className="text-lg font-black text-[#7E3AF2]">14 Active</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Monthly Payroll</span>
                <p className="text-sm font-bold text-[var(--nexa-text-primary)]">₦18.4M / mo</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">KPI Completion</span>
                <p className="text-sm font-bold text-[#0E9F6E]">98.6%</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--nexa-border)] text-xs">
              <Link href="/erp" className="font-bold text-[#7E3AF2] hover:underline flex items-center gap-1">
                Open ERP Admin <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/erp/users" className="text-[11px] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]">
                Staff RBAC →
              </Link>
            </div>
          </NexaCard>
        </div>

        {/* MICROSERVICES CLUSTER TELEMETRY */}
        <NexaCard variant="glass" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-[var(--nexa-text-primary)] flex items-center gap-2">
                <Server className="w-4 h-4 text-[#1A56DB]" />
                Microservices Mesh & Database Connectivity
              </h3>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                Real-time health status of Golang services and MySQL master cluster.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0E9F6E] animate-ping" />
              <span className="text-xs font-bold text-[#0E9F6E]">4 / 4 Services Healthy</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {services.map((svc) => (
              <div
                key={svc.name}
                className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2 hover:border-[#1A56DB]/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[var(--nexa-text-primary)] truncate">
                    :{svc.port}
                  </span>
                  <NexaBadge variant="cyan">{svc.status}</NexaBadge>
                </div>
                <div className="text-xs font-bold text-[var(--nexa-text-primary)]">{svc.name}</div>
                <p className="text-[11px] text-[var(--nexa-text-muted)] leading-snug">{svc.desc}</p>
                <div className="flex items-center justify-between pt-1 border-t border-[var(--nexa-border)] text-[10px] text-[var(--nexa-text-muted)]">
                  <span>Latency: <strong className="text-[#0E9F6E]">{svc.latency}</strong></span>
                  <span>{svc.version}</span>
                </div>
              </div>
            ))}
          </div>
        </NexaCard>

        {/* QUICK JUMP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-3">
            <h4 className="text-xs font-black uppercase text-[var(--nexa-text-muted)] tracking-wider">
              Ofia AI Shortcuts
            </h4>
            <div className="space-y-1.5 text-xs">
              <Link href="/ai/email" className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] font-semibold">
                <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#1A56DB]" /> Platform Email & Relay Keys</span>
                <span className="text-[10px] text-[#1A56DB]">Configure →</span>
              </Link>
              <Link href="/ai/organizations" className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] font-semibold">
                <span className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-[#1A56DB]" /> Tenant Plans & Quotas</span>
                <span className="text-[10px] text-[#1A56DB]">Manage →</span>
              </Link>
              <Link href="/ai/swarm" className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] font-semibold">
                <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-[#1A56DB]" /> 15 AI Specialist Agents</span>
                <span className="text-[10px] text-[#1A56DB]">Inspect →</span>
              </Link>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-3">
            <h4 className="text-xs font-black uppercase text-[var(--nexa-text-muted)] tracking-wider">
              Marketplace Shortcuts
            </h4>
            <div className="space-y-1.5 text-xs">
              <Link href="/marketplace/pros" className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] font-semibold">
                <span className="flex items-center gap-2"><Award className="w-3.5 h-3.5 text-[#0E9F6E]" /> Pro Vetting & Verified Badges</span>
                <span className="text-[10px] text-[#0E9F6E]">12 Queue →</span>
              </Link>
              <Link href="/marketplace/categories" className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] font-semibold">
                <span className="flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-[#0E9F6E]" /> 99+ Categories & Commissions</span>
                <span className="text-[10px] text-[#0E9F6E]">Edit Fees →</span>
              </Link>
              <Link href="/marketplace/disputes" className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] font-semibold">
                <span className="flex items-center gap-2"><AlertOctagon className="w-3.5 h-3.5 text-[#0E9F6E]" /> Escrow Arbitration</span>
                <span className="text-[10px] text-[#0E9F6E]">Review →</span>
              </Link>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-3">
            <h4 className="text-xs font-black uppercase text-[var(--nexa-text-muted)] tracking-wider">
              Ofia ERP Shortcuts
            </h4>
            <div className="space-y-1.5 text-xs">
              <Link href="/erp/users" className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] font-semibold">
                <span className="flex items-center gap-2"><UserCheck className="w-3.5 h-3.5 text-[#7E3AF2]" /> Staff & 6 RBAC Roles</span>
                <span className="text-[10px] text-[#7E3AF2]">120 Staff →</span>
              </Link>
              <Link href="/erp/departments" className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] font-semibold">
                <span className="flex items-center gap-2"><FolderTree className="w-3.5 h-3.5 text-[#7E3AF2]" /> Departmental Structures</span>
                <span className="text-[10px] text-[#7E3AF2]">Configure →</span>
              </Link>
              <Link href="/erp/audit-trail" className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] font-semibold">
                <span className="flex items-center gap-2"><FileSpreadsheet className="w-3.5 h-3.5 text-[#7E3AF2]" /> Financial & Performance Audit</span>
                <span className="text-[10px] text-[#7E3AF2]">Audit Log →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
