"use client";

import React from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import {
  ShieldAlert,
  Building2,
  Users,
  DollarSign,
  Cpu,
  Activity,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Server,
  ToggleLeft,
  Zap,
} from "lucide-react";
import {
  INITIAL_TENANTS,
  INITIAL_ADMIN_USERS,
  INITIAL_FEATURE_FLAGS,
  INITIAL_SWARM_HEALTH,
  INITIAL_AUDIT_LOGS,
} from "@/lib/admin-data";

export default function AdminOverviewPage() {
  const totalMRR = INITIAL_TENANTS.reduce((sum, t) => sum + t.mrr, 0);
  const totalAiSpend = INITIAL_TENANTS.reduce((sum, t) => sum + t.monthlyAiSpendUSD, 0);
  const totalLeads = INITIAL_TENANTS.reduce((sum, t) => sum + t.leadsUsed, 0);

  return (
    <AdminShell>
      <div className="space-y-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NexaBadge variant="purple" dot>
                Platform Operator Cockpit
              </NexaBadge>
              <span className="text-xs text-[var(--nexa-text-muted)]">
                Shared Database: <strong className="text-mono">u721451974_nexa_db</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
              Platform Administration & Health
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/features">
              <NexaButton size="sm" variant="outline" leftIcon={<ToggleLeft className="w-4 h-4" />}>
                Manage Feature Flags
              </NexaButton>
            </Link>
            <Link href="/admin/organizations">
              <NexaButton size="sm" variant="primary" leftIcon={<Building2 className="w-4 h-4" />}>
                Provision Tenant
              </NexaButton>
            </Link>
          </div>
        </div>

        {/* Platform Vital Signs Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Platform MRR */}
          <NexaCard variant="glass" padding="md" className="space-y-1.5 border-l-4 border-l-[#0E9F6E]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span>Platform MRR</span>
              <DollarSign className="w-4 h-4 text-[#0E9F6E]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] text-mono">
              ${totalMRR.toLocaleString()}
            </div>
            <div className="text-xs text-[#0E9F6E] flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> +24% MoM growth
            </div>
          </NexaCard>

          {/* Card 2: Active Tenants */}
          <NexaCard variant="glass" padding="md" className="space-y-1.5 border-l-4 border-l-[#7E22CE]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span>Tenant Workspaces</span>
              <Building2 className="w-4 h-4 text-[#7E22CE]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] text-mono">
              240 Orgs
            </div>
            <div className="text-xs text-[var(--nexa-text-muted)]">
              1,420 total user seats
            </div>
          </NexaCard>

          {/* Card 3: AI Inference Spend vs Margin */}
          <NexaCard variant="glass" padding="md" className="space-y-1.5 border-l-4 border-l-[#1A56DB]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span>Total Monthly AI Spend</span>
              <Cpu className="w-4 h-4 text-[#1A56DB]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] text-mono">
              ${totalAiSpend.toFixed(1)}
            </div>
            <div className="text-xs text-[#0E9F6E] font-semibold">
              88.4% Gross SaaS Margin
            </div>
          </NexaCard>

          {/* Card 4: Swarm Error Rate */}
          <NexaCard variant="glass" padding="md" className="space-y-1.5 border-l-4 border-l-[#C88A3A]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span>Swarm Error Rate</span>
              <Activity className="w-4 h-4 text-[#C88A3A]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] text-mono">
              0.02%
            </div>
            <div className="text-xs text-[#0E9F6E] font-semibold">
              15/15 Agents Healthy
            </div>
          </NexaCard>
        </div>

        {/* Live Swarm Health & High-Volume Tenants Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active AI Swarm Pulse Matrix */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[var(--nexa-text-primary)] text-display uppercase tracking-wider">
                  AI Agent Swarm Telemetry Floor
                </h2>
                <p className="text-xs text-[var(--nexa-text-muted)]">
                  Live execution rates, latency, and error rates across all 15 agents
                </p>
              </div>
              <Link href="/admin/swarm">
                <NexaButton size="sm" variant="ghost">
                  Full Monitor
                </NexaButton>
              </Link>
            </div>

            <div className="space-y-3">
              {INITIAL_SWARM_HEALTH.map((agent) => (
                <div
                  key={agent.agentKey}
                  className="p-3.5 rounded-2xl liquid-glass border border-[var(--nexa-border)] flex items-center justify-between hover:border-[#7E22CE]/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EBF5FF] dark:bg-[#3B82F6]/15 flex items-center justify-center font-bold text-xs text-[#1A56DB]">
                      {agent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[var(--nexa-text-primary)]">
                          {agent.name}
                        </span>
                        <NexaBadge variant="brand">{agent.role}</NexaBadge>
                      </div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5 font-mono">
                        Model: {agent.primaryModel} · {agent.totalExecutionsToday.toLocaleString()} runs today
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right">
                      <div className="font-bold text-[var(--nexa-text-primary)]">{agent.tasksPerMinute} t/min</div>
                      <div className="text-[10px] text-[var(--nexa-text-muted)]">{agent.avgLatencyMs}ms</div>
                    </div>
                    <NexaBadge variant="success" dot>
                      {agent.status}
                    </NexaBadge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High-Volume Tenants & Live Audit Stream */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[var(--nexa-text-primary)] text-display uppercase tracking-wider">
                  Top Tenant Workspaces
                </h2>
                <p className="text-xs text-[var(--nexa-text-muted)]">
                  Highest utilization and MRR organizations
                </p>
              </div>
              <Link href="/admin/organizations">
                <NexaButton size="sm" variant="ghost">
                  All 240
                </NexaButton>
              </Link>
            </div>

            <div className="space-y-3">
              {INITIAL_TENANTS.slice(0, 4).map((tenant) => (
                <div
                  key={tenant.id}
                  className="p-3.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs text-[var(--nexa-text-primary)]">
                        {tenant.name}
                      </div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)]">
                        {tenant.ownerName} · {tenant.domain}
                      </div>
                    </div>
                    <NexaBadge
                      variant={
                        tenant.planTier === "ENTERPRISE"
                          ? "purple"
                          : tenant.planTier === "GROWTH"
                          ? "brand"
                          : "neutral"
                      }
                    >
                      {tenant.planTier}
                    </NexaBadge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[var(--nexa-border)]/60 text-mono">
                    <span className="text-[var(--nexa-text-muted)]">
                      Leads: {tenant.leadsUsed.toLocaleString()} / {tenant.leadsLimit.toLocaleString()}
                    </span>
                    <span className="font-bold text-[#0E9F6E]">
                      ${tenant.mrr.toLocaleString()} MRR
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Operator Live Audit Log */}
            <NexaCard variant="glass" padding="md" className="space-y-3 mt-4">
              <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--nexa-text-muted)] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#7E22CE]" /> Live Operator Audit
                </span>
                <Link href="/admin/audit-logs" className="text-[11px] font-bold text-[#7E22CE] hover:underline">
                  View Log
                </Link>
              </div>

              <div className="space-y-2">
                {INITIAL_AUDIT_LOGS.slice(0, 3).map((log) => (
                  <div key={log.id} className="text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-[var(--nexa-text-primary)] font-mono text-[11px]">
                        {log.action}
                      </strong>
                      <span className="text-[10px] text-[var(--nexa-text-faint)]">
                        {log.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--nexa-text-secondary)] truncate">
                      {log.details}
                    </p>
                  </div>
                ))}
              </div>
            </NexaCard>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
