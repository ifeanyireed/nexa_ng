"use client";

import React from "react";
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
import { AdminStatGrid, AdminStatItem } from "@/components/admin/AdminStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function MasterOverviewPage() {
  const kpis: AdminStatItem[] = [
    {
      label: "Ecosystem Volume (YTD)",
      value: "₦427,050,000",
      change: "+34% YoY",
      trend: "up",
      changeType: "success",
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
      changeType: "success",
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
      icon: <Building2 className="w-5 h-5" />,
      desc: "5 Orgs & Workspaces",
      href: "/tenants",
    },
    {
      label: "Email Infrastructure",
      icon: <Mail className="w-5 h-5" />,
      desc: "Relay & Domain DNS",
      href: "/ai/email",
    },
    {
      label: "Escrow & Disputes",
      icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
      desc: "2 Open Grievances",
      href: "/marketplace/disputes",
    },
    {
      label: "AI Specialist Swarm",
      icon: <Bot className="w-5 h-5 text-blue-500" />,
      desc: "15 Autonomous Agents",
      href: "/ai/swarm",
    },
    {
      label: "Growth & Waitlist",
      icon: <Users className="w-5 h-5 text-emerald-500" />,
      desc: "2,848 Pre-Launch Leads",
      href: "/crm/waitlist",
    },
    {
      label: "LLM Observability",
      icon: <Activity className="w-5 h-5 text-purple-500" />,
      desc: "Token Traces & Latency",
      href: "/ai/observability",
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

        {/* QUICK MANAGEMENT & OPERATIONS (MIRRORING ERP) */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-extrabold flex items-center gap-2 text-display text-nexa-text-primary">
              <Zap className="w-5 h-5 text-nexa-brand" />
              Quick Management & Operations
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, i) => (
              <Link href={action.href} key={i}>
                <NexaCard
                  variant="interactive"
                  className="p-5 flex flex-col items-center text-center group cursor-pointer border border-nexa-border bg-nexa-bg-surface/50 hover:bg-nexa-bg-surface hover:shadow-xl transition-all rounded-3xl"
                >
                  <div className="w-12 h-12 rounded-2xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-nexa-brand group-hover:text-white transition-all shadow-sm">
                    {action.icon}
                  </div>
                  <h4 className="font-bold text-xs mb-1 text-nexa-text-primary group-hover:text-nexa-brand transition-colors">
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

        {/* 3 APPLICATION HUBS - GROUPED GLASS CARDS */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-extrabold flex items-center gap-2 text-display text-nexa-text-primary">
              <Layers className="w-5 h-5 text-nexa-brand" />
              Ecosystem Application Platforms
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* APP 1: OFIA AI SWARM */}
            <NexaCard
              variant="glass"
              className="p-7 space-y-6 border border-nexa-border hover:border-blue-500/30 flex flex-col justify-between relative overflow-hidden rounded-3xl transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-display text-nexa-text-primary">Ofia AI Platform</h3>
                      <p className="text-[11px] text-nexa-text-muted font-mono">Autonomous GTM & AI Swarm</p>
                    </div>
                  </div>
                  <NexaBadge variant="brand" className="rounded-full px-3 py-0.5 text-[10px] font-bold">
                    B2B SaaS
                  </NexaBadge>
                </div>

                <p className="text-xs text-nexa-text-secondary leading-relaxed">
                  Centralized management of cold email infrastructure (Resend/Brevo/SES), multi-tenant organizations, 15 specialized AI agents, and LLM telemetry.
                </p>

                <div className="p-4 rounded-2xl bg-nexa-bg-base/70 border border-nexa-border space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-nexa-text-muted">Active Relay Provider:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">Resend REST API</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-nexa-text-muted">Inbox Deliverability:</span>
                    <span className="font-bold text-emerald-500">99.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-nexa-text-muted">LLM Token Latency:</span>
                    <span className="font-bold text-nexa-text-primary">142ms Avg</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-nexa-border">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Link
                    href="/ai/email"
                    className="p-2.5 rounded-2xl bg-nexa-bg-surface hover:bg-blue-500/10 hover:text-blue-600 border border-nexa-border transition-all flex items-center justify-between font-semibold"
                  >
                    <span>Email Console</span>
                    <ArrowRight className="w-3.5 h-3.5 text-nexa-text-muted" />
                  </Link>
                  <Link
                    href="/ai/organizations"
                    className="p-2.5 rounded-2xl bg-nexa-bg-surface hover:bg-blue-500/10 hover:text-blue-600 border border-nexa-border transition-all flex items-center justify-between font-semibold"
                  >
                    <span>Tenants & Plans</span>
                    <ArrowRight className="w-3.5 h-3.5 text-nexa-text-muted" />
                  </Link>
                  <Link
                    href="/ai/observability"
                    className="p-2.5 rounded-2xl bg-nexa-bg-surface hover:bg-blue-500/10 hover:text-blue-600 border border-nexa-border transition-all flex items-center justify-between font-semibold"
                  >
                    <span>Token Traces</span>
                    <ArrowRight className="w-3.5 h-3.5 text-nexa-text-muted" />
                  </Link>
                  <Link
                    href="/ai/swarm"
                    className="p-2.5 rounded-2xl bg-nexa-bg-surface hover:bg-blue-500/10 hover:text-blue-600 border border-nexa-border transition-all flex items-center justify-between font-semibold"
                  >
                    <span>Agent Swarm (15)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-nexa-text-muted" />
                  </Link>
                </div>

                <Link href="/ai" className="block pt-1">
                  <NexaButton
                    size="sm"
                    variant="primary"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full py-2.5 justify-center shadow-md shadow-blue-600/20"
                  >
                    Open AI Platform Admin
                  </NexaButton>
                </Link>
              </div>
            </NexaCard>

            {/* APP 2: OFIA MARKETPLACE */}
            <NexaCard
              variant="glass"
              className="p-7 space-y-6 border border-nexa-border hover:border-emerald-500/30 flex flex-col justify-between relative overflow-hidden rounded-3xl transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-display text-nexa-text-primary">Ofia Compass</h3>
                      <p className="text-[11px] text-nexa-text-muted font-mono">B2B/B2C Discovery Platform</p>
                    </div>
                  </div>
                  <NexaBadge variant="green" className="rounded-full px-3 py-0.5 text-[10px] font-bold">
                    Compass
                  </NexaBadge>
                </div>

                <p className="text-xs text-nexa-text-secondary leading-relaxed">
                  Supervision of 99+ Nigerian niche verticals, business verification (Nexa Verified), on-demand technician job dispatch, and escrow dispute arbitration.
                </p>

                <div className="p-4 rounded-2xl bg-nexa-bg-base/70 border border-nexa-border space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-nexa-text-muted">Monthly GMV:</span>
                    <span className="font-bold text-emerald-500">₦84,250,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-nexa-text-muted">Verified Businesses:</span>
                    <span className="font-bold text-emerald-500">894 Badges Issued</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-nexa-text-muted">Dispute Queue:</span>
                    <span className="font-bold text-rose-500">2 Open Grievances</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-nexa-border">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Link
                    href="/marketplace/merchants"
                    className="p-2.5 rounded-2xl bg-nexa-bg-surface hover:bg-emerald-500/10 hover:text-emerald-600 border border-nexa-border transition-all flex items-center justify-between font-semibold"
                  >
                    <span>Pro Merchants</span>
                    <ArrowRight className="w-3.5 h-3.5 text-nexa-text-muted" />
                  </Link>
                  <Link
                    href="/marketplace/assignments"
                    className="p-2.5 rounded-2xl bg-nexa-bg-surface hover:bg-emerald-500/10 hover:text-emerald-600 border border-nexa-border transition-all flex items-center justify-between font-semibold"
                  >
                    <span>Job Dispatch</span>
                    <ArrowRight className="w-3.5 h-3.5 text-nexa-text-muted" />
                  </Link>
                  <Link
                    href="/marketplace/disputes"
                    className="p-2.5 rounded-2xl bg-nexa-bg-surface hover:bg-emerald-500/10 hover:text-emerald-600 border border-nexa-border transition-all flex items-center justify-between font-semibold"
                  >
                    <span>Disputes & Escrow</span>
                    <ArrowRight className="w-3.5 h-3.5 text-nexa-text-muted" />
                  </Link>
                  <Link
                    href="/marketplace/technicians"
                    className="p-2.5 rounded-2xl bg-nexa-bg-surface hover:bg-emerald-500/10 hover:text-emerald-600 border border-nexa-border transition-all flex items-center justify-between font-semibold"
                  >
                    <span>Field Technicians</span>
                    <ArrowRight className="w-3.5 h-3.5 text-nexa-text-muted" />
                  </Link>
                </div>

                <Link href="/marketplace" className="block pt-1">
                  <NexaButton
                    size="sm"
                    variant="primary"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full py-2.5 justify-center shadow-md shadow-emerald-600/20"
                  >
                    Open Ofia Compass
                  </NexaButton>
                </Link>
              </div>
            </NexaCard>

            {/* APP 3: MULTI-TENANT WORKSPACES */}
            <NexaCard
              variant="glass"
              className="p-7 space-y-6 border border-nexa-border hover:border-purple-500/30 flex flex-col justify-between relative overflow-hidden rounded-3xl transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-display text-nexa-text-primary">Multi-Tenant Workspaces</h3>
                      <p className="text-[11px] text-nexa-text-muted font-mono">Provisioning, Quotas & MRR</p>
                    </div>
                  </div>
                  <NexaBadge variant="purple" className="rounded-full px-3 py-0.5 text-[10px] font-bold">
                    Multi-Tenant
                  </NexaBadge>
                </div>

                <p className="text-xs text-nexa-text-secondary leading-relaxed">
                  Centralized tenant lifecycle control, custom domains, automated plan tier upgrades, enterprise RBAC module permissions, and live MRR telemetry.
                </p>

                <div className="p-4 rounded-2xl bg-nexa-bg-base/70 border border-nexa-border space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-nexa-text-muted">Active Enterprises:</span>
                    <span className="font-bold text-emerald-500">5 Organizations</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-nexa-text-muted">Monthly Recurring Revenue:</span>
                    <span className="font-bold text-nexa-text-primary">₦1,180,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-nexa-text-muted">RBAC Modules Managed:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">9 Modules</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-nexa-border">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Link
                    href="/tenants?tenant=org-01"
                    className="p-2.5 rounded-2xl bg-nexa-bg-surface hover:bg-purple-500/10 hover:text-purple-600 border border-nexa-border transition-all flex items-center justify-between font-semibold"
                  >
                    <span>EduSuite Console</span>
                    <ArrowRight className="w-3.5 h-3.5 text-nexa-text-muted" />
                  </Link>
                  <Link
                    href="/tenants"
                    className="p-2.5 rounded-2xl bg-nexa-bg-surface hover:bg-purple-500/10 hover:text-purple-600 border border-nexa-border transition-all flex items-center justify-between font-semibold"
                  >
                    <span>Directory</span>
                    <ArrowRight className="w-3.5 h-3.5 text-nexa-text-muted" />
                  </Link>
                </div>

                <Link href="/tenants" className="block pt-1">
                  <NexaButton
                    size="sm"
                    variant="primary"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full py-2.5 justify-center shadow-md shadow-purple-600/20"
                  >
                    Manage Tenant Hub
                  </NexaButton>
                </Link>
              </div>
            </NexaCard>
          </div>
        </div>

        {/* SYSTEM CLUSTER & MICROSERVICES STATUS */}
        <NexaCard variant="glass" className="p-7 space-y-6 border border-nexa-border rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-display text-nexa-text-primary">
                  Infrastructure & Microservices Cluster Topology
                </h3>
                <p className="text-xs text-nexa-text-muted mt-0.5">
                  Real-time health status of core Go backends and multi-tenant databases
                </p>
              </div>
            </div>
            <span className="self-start sm:self-center text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Clusters Healthy
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: "ai_gtm_service",
                port: "8082",
                tech: "Go 1.26 + GORM",
                status: "HEALTHY",
                desc: "Autonomous Swarm & Email Relay",
              },
              {
                name: "user_subscription_service",
                port: "8081",
                tech: "Go 1.26 + JWT",
                status: "HEALTHY",
                desc: "Auth, Multi-Tenant RBAC & Quotas",
              },
              {
                name: "marketplace_service",
                port: "8085",
                tech: "Go 1.26 + REST",
                status: "HEALTHY",
                desc: "99 Niche Directories & Bookings",
              },
              {
                name: "erp_service",
                port: "8080/8085",
                tech: "Go 1.26 + MySQL",
                status: "HEALTHY",
                desc: "Finance & HR Microservices",
              },
            ].map((srv) => (
              <div
                key={srv.name}
                className="p-4 rounded-2xl bg-nexa-bg-surface/50 border border-nexa-border space-y-2 text-xs hover:border-nexa-brand/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-nexa-text-primary">{srv.name}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono">
                    {srv.status}
                  </span>
                </div>
                <div className="text-[11px] text-nexa-text-muted leading-relaxed">{srv.desc}</div>
                <div className="flex justify-between text-[10px] text-nexa-text-muted pt-2 border-t border-nexa-border font-mono">
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
