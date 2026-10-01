"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Layers,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Store,
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

export default function MarketplaceOverviewPage() {
  const [filterPeriod, setFilterPeriod] = useState("30d");

  const kpis: AdminStatItem[] = [
    {
      label: "Gross Merchandise Value (GMV)",
      value: "₦84,250,000",
      change: "+18.4% this mo",
      trend: "up",
      changeType: "success",
      icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
      sub: "Across 99 Nigerian Verticals",
    },
    {
      label: "Platform Commission (5%)",
      value: "₦4,212,500",
      change: "Paystack Split",
      trend: "up",
      changeType: "info",
      icon: <CreditCard className="w-5 h-5 text-blue-500" />,
      sub: "Automated Subaccount Settlements",
    },
    {
      label: "Active Pro Merchants",
      value: "1,420 Pros",
      change: "63% Verified",
      trend: "up",
      changeType: "success",
      icon: <Store className="w-5 h-5 text-purple-500" />,
      sub: "894 Nexa Verified Badges",
    },
    {
      label: "Fulfillment Success Rate",
      value: "98.2%",
      change: "4,810 Bookings",
      trend: "up",
      changeType: "warning",
      icon: <Award className="w-5 h-5 text-amber-500" />,
      sub: "Dispute Rate Under 0.2%",
    },
  ];

  return (
    <SuperAdminShell
      title="Ofia Compass Overview"
      subtitle="Executive oversight of 99+ Nigerian niche verticals, merchant verification, booking fulfillment, and GMV revenue streams."
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/marketplace/merchants">
            <NexaButton
              size="sm"
              variant="outline"
              leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
              className="rounded-full border-nexa-border hover:border-emerald-500/30 font-bold px-4"
            >
              Verify Merchants
            </NexaButton>
          </Link>
          <Link href="/marketplace/disputes">
            <NexaButton
              size="sm"
              variant="primary"
              leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full px-4 shadow-md shadow-emerald-600/20"
            >
              Dispute Queue (2)
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-10">
        {/* TOP STATS CARDS */}
        <AdminStatGrid stats={kpis} columns={4} />

        {/* QUICK LINK GRID */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-extrabold flex items-center gap-2 text-display text-nexa-text-primary">
              <Zap className="w-5 h-5 text-nexa-brand" />
              Core Marketplace Management
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/marketplace/merchants" className="block group">
              <NexaCard
                variant="interactive"
                className="p-7 space-y-4 border border-nexa-border bg-nexa-bg-surface/50 hover:bg-nexa-bg-surface hover:shadow-xl transition-all rounded-3xl group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-nexa-text-muted group-hover:text-emerald-500 transition-colors" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-display text-nexa-text-primary group-hover:text-emerald-600 transition-colors mb-1">
                    Merchant Verification
                  </h3>
                  <p className="text-xs text-nexa-text-secondary leading-relaxed">
                    Review business CAC certificates, identity vetting, and assign Nexa Verified trust badges.
                  </p>
                </div>
              </NexaCard>
            </Link>

            <Link href="/marketplace/assignments" className="block group">
              <NexaCard
                variant="interactive"
                className="p-7 space-y-4 border border-nexa-border bg-nexa-bg-surface/50 hover:bg-nexa-bg-surface hover:shadow-xl transition-all rounded-3xl group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-nexa-text-muted group-hover:text-blue-500 transition-colors" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-display text-nexa-text-primary group-hover:text-blue-600 transition-colors mb-1">
                    On-Demand Dispatch Queue
                  </h3>
                  <p className="text-xs text-nexa-text-secondary leading-relaxed">
                    Match incoming client requests with available certified field technicians across states in real time.
                  </p>
                </div>
              </NexaCard>
            </Link>

            <Link href="/marketplace/disputes" className="block group">
              <NexaCard
                variant="interactive"
                className="p-7 space-y-4 border border-nexa-border bg-nexa-bg-surface/50 hover:bg-nexa-bg-surface hover:shadow-xl transition-all rounded-3xl group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-nexa-text-muted group-hover:text-rose-500 transition-colors" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-display text-nexa-text-primary group-hover:text-rose-600 transition-colors mb-1">
                    Escrow & Disputes
                  </h3>
                  <p className="text-xs text-nexa-text-secondary leading-relaxed">
                    Review payment milestones, arbitrate customer grievances, and release secured escrow payouts.
                  </p>
                </div>
              </NexaCard>
            </Link>
          </div>
        </div>

        {/* TOP REVENUE VERTICALS & REAL-TIME BOOKINGS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Categories */}
          <NexaCard variant="glass" className="p-7 space-y-5 border border-nexa-border rounded-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-display text-nexa-text-primary">
                    Top Performing Niche Verticals
                  </h3>
                  <p className="text-xs text-nexa-text-muted">Ranking by monthly GMV and pros</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                99 Active Verticals
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { name: "Home Services & Plumbing", gmv: "₦28,400,000", share: 34, pros: 310 },
                { name: "Electrical & Solar Installation", gmv: "₦21,650,000", share: 26, pros: 245 },
                { name: "Automotive & Logistics", gmv: "₦16,200,000", share: 19, pros: 180 },
                { name: "Beauty, Wellness & Spas", gmv: "₦11,000,000", share: 13, pros: 420 },
                { name: "Legal & Corporate Services", gmv: "₦7,000,000", share: 8, pros: 95 },
              ].map((v) => (
                <div
                  key={v.name}
                  className="p-4 rounded-2xl bg-nexa-bg-surface/50 border border-nexa-border space-y-2 hover:border-nexa-brand/30 transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-nexa-text-primary">{v.name}</span>
                    <span className="text-emerald-500 font-mono">{v.gmv}</span>
                  </div>
                  <div className="w-full bg-nexa-bg-base h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${v.share}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-nexa-text-muted">
                    <span>{v.pros} Verified Pros</span>
                    <span>{v.share}% of Platform GMV</span>
                  </div>
                </div>
              ))}
            </div>
          </NexaCard>

          {/* Recent Escrow & Ops Activity */}
          <NexaCard variant="glass" className="p-7 space-y-5 border border-nexa-border rounded-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-display text-nexa-text-primary">
                    Live Ops & Escrow Activity
                  </h3>
                  <p className="text-xs text-nexa-text-muted">Real-time dispute and settlement stream</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-mono">
                Real-Time
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { id: "ESC-891", title: "Complete Inverter Rewiring", amount: "₦145,000", pro: "Tunde Solar Ltd", status: "Escrow Held", time: "12m ago" },
                { id: "ESC-890", title: "Commercial Plumbing Repiping", amount: "₦320,000", pro: "Lagos Master Plumbers", status: "Released", time: "45m ago" },
                { id: "ESC-889", title: "Office Deep Cleaning & Fumigation", amount: "₦85,000", pro: "CleanPro Cleaners", status: "Released", time: "2h ago" },
                { id: "DISP-104", title: "Late Arrival / Incomplete AC Repair", amount: "₦40,000", pro: "CoolBreeze Tech", status: "In Mediation", time: "3h ago" },
              ].map((act) => (
                <div
                  key={act.id}
                  className="p-4 rounded-2xl bg-nexa-bg-surface/50 border border-nexa-border flex items-center justify-between text-xs hover:border-nexa-brand/30 transition-all"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-nexa-text-primary">{act.title}</div>
                    <div className="text-[11px] text-nexa-text-muted">
                      {act.pro} • <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{act.id}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1.5">
                    <div className="font-mono font-bold text-nexa-text-primary">{act.amount}</div>
                    <span
                      className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                        act.status === "Released"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : act.status === "In Mediation"
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                      }`}
                    >
                      {act.status}
                    </span>
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
