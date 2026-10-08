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
  Clock,
  Cpu,
  CreditCard,
  Database,
  Car,
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
import { cn } from "@/lib/utils";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";
import { AdminStatGrid, AdminStatItem } from "@/components/admin/AdminStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function MasterOverviewPage() {
  const [isSwarmActive, setIsSwarmActive] = useState(true);

  const kpis: AdminStatItem[] = [
    {
      label: "Ecosystem Volume (YTD)",
      value: "₦427,050,000",
      change: "+34% YoY",
      trend: "up",
      icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
      sub: "Across GTM, Marketplace & ERP",
    },
    {
      label: "Active AI Organizations",
      value: "142 Tenants",
      change: "15 Agents",
      trend: "up",
      changeType: "info",
      icon: <Bot className="w-5 h-5 text-blue-500" />,
      sub: "Autonomous Specialists Deployed",
    },
    {
      label: "Marketplace Verified Pros",
      value: "1,420 Merchants",
      change: "98.2% Success",
      trend: "up",
      changeType: "purple",
      icon: <ShoppingBag className="w-5 h-5 text-purple-500" />,
      sub: "Fulfillment & Escrow Shield",
    },
    {
      label: "Enterprise ERP Headcount",
      value: "84 Active Staff",
      change: "11 Depts",
      trend: "up",
      changeType: "warning",
      icon: <Building2 className="w-5 h-5 text-amber-500" />,
      sub: "5 Operating Workspaces",
    },
  ];

  const quickActions = [
    {
      label: "Tenant Directory",
      icon: <Building2 className="w-6 h-6" />,
      desc: "5 Orgs & Workspaces",
      href: "/tenants",
    },
    {
      label: "Mobility Manager",
      icon: <Car className="w-6 h-6 text-orange-500" />,
      desc: "Global Routes & Vehicles",
      href: "/mobility",

    },
    {
      label: "Email Infrastructure",
      icon: <Mail className="w-6 h-6" />,
      desc: "Relay & Domain DNS",
      href: "/ai/email",
    },
    {
      label: "Escrow & Disputes",
      icon: <ShieldAlert className="w-6 h-6 text-rose-500" />,
      desc: "2 Open Grievances",
      href: "/marketplace/disputes",
    },
    {
      label: "AI Specialist Swarm",
      icon: <Bot className="w-6 h-6 text-blue-500" />,
      desc: "15 Autonomous Agents",
      href: "/ai/swarm",
    },
    {
      label: "Growth & Waitlist",
      icon: <Users className="w-6 h-6 text-emerald-500" />,
      desc: "2,848 Pre-Launch Leads",
      href: "/crm/waitlist",
    },
    {
      label: "LLM Observability",
      icon: <Activity className="w-6 h-6 text-purple-500" />,
      desc: "Token Traces & Latency",
      href: "/ai/observability",
    },
  ];

  const recentOperations = [
    {
      id: "ORG-0421",
      customer: "New Era Transports Ltd",
      service: "Enterprise ERP Workspace & AI Swarm Provisioned",
      amount: "₦1,250,000",
      time: "8 mins ago",
      type: "Provisioning",
      status: "Active",
      badgeVariant: "success",
    },
    {
      id: "DISP-104",
      customer: "CoolBreeze Tech / Victoria Crest",
      service: "Escrow Mediation: Late Arrival / AC Servicing Dispute",
      amount: "₦145,000",
      time: "24 mins ago",
      type: "Escrow Dispute",
      status: "In Mediation",
      badgeVariant: "danger",
    },
    {
      id: "GTM-8820",
      customer: "Dangote Logistics Inbound SDR",
      service: "Cold Email Swarm: 1,420 Verified B2B Leads Dispatched",
      amount: "99.4% Delivery",
      time: "1 hour ago",
      type: "AI Campaign",
      status: "Delivered",
      badgeVariant: "info",
    },
    {
      id: "VER-0931",
      customer: "Lagos Master Plumbers Ltd",
      service: "CAC Certificate & Identity Verification Approved",
      amount: "Nexa Verified",
      time: "2 hours ago",
      type: "Marketplace",
      status: "Verified",
      badgeVariant: "success",
    },
  ];

  return (
    <SuperAdminShell
      title="Master Overview & Cross-App Governance"
      subtitle="Unified Super Admin command center orchestrating Ofia AI Autonomous Swarm, Ofia Discovery Marketplace, and Ofia Enterprise ERP."
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/ai/email">
            <NexaButton
              size="sm"
              variant="primary"
              leftIcon={<Mail className="w-3.5 h-3.5" />}
              className="bg-nexa-brand hover:bg-nexa-brand/90 text-white shadow-md shadow-nexa-brand/20 font-bold rounded-full px-4"
            >
              Email Setup Wizard
            </NexaButton>
          </Link>
          <Link href="/marketplace/disputes">
            <NexaButton
              size="sm"
              variant="outline"
              leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-rose-500" />}
              className="rounded-full border-nexa-border hover:border-rose-500/30 text-rose-500 font-bold px-4"
            >
              Dispute Queue (2)
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-10">
        {/* TOP 4 EXECUTIVE KPI CARDS */}
        <AdminStatGrid stats={kpis} columns={4} />

        {/* MAIN 2-COLUMN GRID (MATCHING /erp/admin EXACT STRUCTURE) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT 2 COLUMNS */}
          <div className="lg:col-span-2 space-y-10">
            {/* QUICK ACTIONS */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-extrabold flex items-center gap-2 text-display text-nexa-text-primary">
                  <Zap className="w-5 h-5 text-nexa-brand" />
                  Quick Actions & Operations
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickActions.map((action, i) => (
                  <Link href={action.href} key={i}>
                    <NexaCard
                      variant="interactive"
                      className="p-6 flex flex-col items-center text-center group cursor-pointer border border-nexa-border bg-nexa-bg-surface/50 hover:bg-nexa-bg-surface hover:shadow-xl transition-all rounded-3xl"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-nexa-brand group-hover:text-white transition-all shadow-sm">
                        {action.icon}
                      </div>
                      <h4 className="font-bold text-sm mb-1 text-nexa-text-primary group-hover:text-nexa-brand transition-colors">
                        {action.label}
                      </h4>
                      <p className="text-[10px] text-nexa-text-faint uppercase font-bold tracking-wider">
                        {action.desc}
                      </p>
                    </NexaCard>
                  </Link>
                ))}
              </div>
            </section>

            {/* RECENT CROSS-ECOSYSTEM OPERATIONS FEED */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-extrabold flex items-center gap-2 text-display text-nexa-text-primary">
                  <Activity className="w-5 h-5 text-nexa-brand" />
                  Recent Cross-Ecosystem Operations
                </h3>
                <Link href="/ai/audit-logs">
                  <NexaButton
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-xs font-bold"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    View Audit Trail
                  </NexaButton>
                </Link>
              </div>
              <div className="space-y-4">
                {recentOperations.map((op, i) => (
                  <NexaCard
                    key={i}
                    variant="flat"
                    className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-nexa-border bg-nexa-bg-surface/30 hover:bg-nexa-bg-surface/70 transition-all rounded-3xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center font-bold text-xs">
                        {op.id.split("-")[1] || op.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-nexa-text-primary">{op.customer}</h4>
                          <span
                            className={cn(
                              "text-[9px] font-bold px-2 py-0.5 rounded-full border",
                              op.badgeVariant === "danger"
                                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                : op.badgeVariant === "info"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            )}
                          >
                            {op.status}
                          </span>
                        </div>
                        <p className="text-xs text-nexa-text-faint font-medium mt-0.5">
                          {op.service}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-nexa-text-primary">{op.amount}</p>
                        <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-wider">
                          {op.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={op.type === "Escrow Dispute" ? "/marketplace/disputes" : "/tenants"}>
                          <NexaButton size="sm" variant="secondary" className="rounded-full text-xs font-bold">
                            Inspect
                          </NexaButton>
                        </Link>
                      </div>
                    </div>
                  </NexaCard>
                ))}
              </div>
            </section>

            {/* ECOSYSTEM APPLICATION PLATFORMS */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-extrabold flex items-center gap-2 text-display text-nexa-text-primary">
                  <Layers className="w-5 h-5 text-nexa-brand" />
                  Ecosystem Platforms
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* APP 1: OFIA AI */}
                <NexaCard
                  variant="glass"
                  className="p-6 space-y-5 border border-nexa-border hover:border-blue-500/30 flex flex-col justify-between rounded-3xl transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Bot className="w-6 h-6" />
                      </div>
                      <NexaBadge variant="brand" className="rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                        B2B SaaS
                      </NexaBadge>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-display text-nexa-text-primary mb-1">
                        Ofia AI Platform
                      </h4>
                      <p className="text-xs text-nexa-text-secondary leading-relaxed">
                        15 autonomous agents, cold email relays, and token telemetry across organizations.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-nexa-bg-base/70 border border-nexa-border space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-nexa-text-muted">Relay:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">Resend API</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-nexa-text-muted">Deliverability:</span>
                        <span className="font-bold text-emerald-500">99.4%</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/ai" className="block pt-2">
                    <NexaButton size="sm" variant="secondary" className="w-full rounded-full font-bold justify-center">
                      Open AI Admin
                    </NexaButton>
                  </Link>
                </NexaCard>

                {/* APP 2: OFIA COMPASS */}
                <NexaCard
                  variant="glass"
                  className="p-6 space-y-5 border border-nexa-border hover:border-emerald-500/30 flex flex-col justify-between rounded-3xl transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <NexaBadge variant="green" className="rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                        Compass
                      </NexaBadge>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-display text-nexa-text-primary mb-1">
                        Ofia Compass
                      </h4>
                      <p className="text-xs text-nexa-text-secondary leading-relaxed">
                        99 Nigerian niche verticals, business verification badges, and milestone escrow.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-nexa-bg-base/70 border border-nexa-border space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-nexa-text-muted">Monthly GMV:</span>
                        <span className="font-bold text-emerald-500">₦84.25M</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-nexa-text-muted">Verified Pros:</span>
                        <span className="font-bold text-emerald-500">894 Badges</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/marketplace" className="block pt-2">
                    <NexaButton size="sm" variant="secondary" className="w-full rounded-full font-bold justify-center">
                      Open Marketplace
                    </NexaButton>
                  </Link>
                </NexaCard>

                {/* APP 3: MULTI-TENANT WORKSPACES */}
                <NexaCard
                  variant="glass"
                  className="p-6 space-y-5 border border-nexa-border hover:border-purple-500/30 flex flex-col justify-between rounded-3xl transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <NexaBadge variant="purple" className="rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                        Workspaces
                      </NexaBadge>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-display text-nexa-text-primary mb-1">
                        Enterprise Workspaces
                      </h4>
                      <p className="text-xs text-nexa-text-secondary leading-relaxed">
                        Tenant lifecycle control, plan tier upgrades, RBAC permissions, and MRR billing.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-nexa-bg-base/70 border border-nexa-border space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-nexa-text-muted">Enterprises:</span>
                        <span className="font-bold text-emerald-500">5 Active Orgs</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-nexa-text-muted">Monthly MRR:</span>
                        <span className="font-bold text-nexa-text-primary">₦1,180,000</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/tenants" className="block pt-2">
                    <NexaButton size="sm" variant="secondary" className="w-full rounded-full font-bold justify-center">
                      Manage Tenants
                    </NexaButton>
                  </Link>
                </NexaCard>
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR COLUMN (MATCHING /erp/admin ASIDE) */}
          <aside className="space-y-10">
            {/* CLUSTER MICROSERVICES STATUS */}
            <section>
              <NexaCard
                variant="glass"
                className="p-6 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20 rounded-3xl space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2 text-sm text-nexa-text-primary">
                    <Server className="w-5 h-5 text-emerald-500" />
                    Cluster Microservices
                  </h3>
                  <NexaBadge variant="success" className="rounded-full text-[10px]">
                    All Systems Healthy
                  </NexaBadge>
                </div>
                <p className="text-xs text-nexa-text-secondary leading-relaxed">
                  Real-time health telemetry across core Go backends, multi-tenant databases, and email queues.
                </p>
                <div className="bg-nexa-bg-base p-4 rounded-2xl border border-nexa-border flex items-center justify-between">
                  <span className="text-xs font-bold">Autonomous AI Swarm</span>
                  <button
                    type="button"
                    onClick={() => setIsSwarmActive(!isSwarmActive)}
                    className={cn(
                      "w-12 h-6 rounded-full relative p-1 transition-colors cursor-pointer",
                      isSwarmActive ? "bg-emerald-500" : "bg-slate-400"
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                        isSwarmActive ? "translate-x-6" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
                <div className="space-y-2.5 pt-1">
                  {[
                    { name: "ai_gtm_service", port: "8082", status: "HEALTHY" },
                    { name: "user_subscription_service", port: "8081", status: "HEALTHY" },
                    { name: "marketplace_service", port: "8085", status: "HEALTHY" },
                    { name: "erp_service", port: "8080", status: "HEALTHY" },
                  ].map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-nexa-bg-surface/50 border border-nexa-border font-mono"
                    >
                      <span className="font-semibold text-nexa-text-primary">{s.name}</span>
                      <span className="text-[10px] text-emerald-500 font-bold">{s.status}</span>
                    </div>
                  ))}
                </div>
              </NexaCard>
            </section>

            {/* LIVE ECOSYSTEM PULSE */}
            <section>
              <h3 className="text-lg font-extrabold mb-6 flex items-center gap-2 text-display text-nexa-text-primary">
                <TrendingUp className="w-5 h-5 text-nexa-brand" />
                Live Ecosystem Pulse
              </h3>
              <div className="space-y-3.5">
                {[
                  { term: "Lagos Technician Bookings", growth: "98.2% SLA", niche: "Ofia Compass" },
                  { term: "Autonomous Cold SDR Swarm", growth: "1,420 Dispatched", niche: "Ofia AI" },
                  { term: "Contracted Enterprise MRR", growth: "₦1.18M MRR", niche: "ERP Workspaces" },
                ].map((trend, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-nexa-bg-surface/50 border border-nexa-border hover:border-nexa-brand/30 transition-all cursor-default"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-nexa-text-primary">{trend.term}</span>
                      <span className="text-[10px] font-extrabold text-emerald-500">
                        {trend.growth}
                      </span>
                    </div>
                    <p className="text-[9px] text-nexa-text-faint font-bold uppercase tracking-widest">
                      {trend.niche}
                    </p>
                  </div>
                ))}
              </div>

              {/* GOVERNANCE NOTE */}
              <NexaCard
                variant="glass"
                className="mt-6 p-6 bg-nexa-brand/5 border-nexa-brand/10 rounded-3xl"
              >
                <h4 className="text-xs font-extrabold mb-1.5 flex items-center gap-1.5 text-display text-nexa-text-primary">
                  <ShieldCheck className="w-4 h-4 text-[#1A56DB]" />
                  Centralized Super Admin Governance
                </h4>
                <p className="text-xs text-nexa-text-secondary leading-relaxed">
                  Tenant quotas, security killswitches, and automated billing synchronization are centrally orchestrated across all 3 Ofia platforms.
                </p>
              </NexaCard>
            </section>
          </aside>
        </div>
      </div>
    </SuperAdminShell>
  );
}
