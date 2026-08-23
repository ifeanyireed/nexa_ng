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
} from "lucide-react";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function MarketplaceOverviewPage() {
  const [filterPeriod, setFilterPeriod] = useState("30d");

  return (
    <SuperAdminShell
      title="Marketplace Overview"
      subtitle="Executive oversight of 99+ Nigerian niche verticals, merchant verification, booking fulfillment, and GMV revenue streams."
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/marketplace/merchants">
            <NexaButton size="sm" variant="outline" leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-[#0E9F6E]" />}>
              Verify Merchants
            </NexaButton>
          </Link>
          <Link href="/marketplace/disputes">
            <NexaButton size="sm" variant="primary" leftIcon={<ShieldAlert className="w-3.5 h-3.5" />} className="bg-[#0E9F6E] text-white hover:bg-[#0B855D]">
              Dispute Queue (2)
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* TOP STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#0E9F6E]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Gross Merchandise Value (GMV)</span>
              <DollarSign className="w-4 h-4 text-[#0E9F6E]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              ₦84,250,000
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#0E9F6E] font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% this month</span>
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#1A56DB]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Platform Commission (5%)</span>
              <CreditCard className="w-4 h-4 text-[#1A56DB]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              ₦4,212,500
            </div>
            <div className="text-[11px] text-[var(--nexa-text-muted)] font-mono">
              Net collected via Paystack split
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#7E3AF2]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Active Pro Merchants</span>
              <Store className="w-4 h-4 text-[#7E3AF2]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              1,420 Pros
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#7E3AF2] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0E9F6E]" />
              <span>894 Nexa Verified (63%)</span>
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#F59E0B]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Fulfillment Success Rate</span>
              <Award className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              98.2%
            </div>
            <div className="text-[11px] text-[#0E9F6E] font-semibold">
              4,810 Completed Bookings
            </div>
          </NexaCard>
        </div>

        {/* QUICK LINK GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/marketplace/merchants" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#0E9F6E] transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#0E9F6E]/10 text-[#0E9F6E]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--nexa-text-muted)] group-hover:text-[#0E9F6E] transition-colors" />
              </div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Merchant Verification</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Review business CAC certificates, identity vetting, and assign Nexa Verified badges.
              </p>
            </NexaCard>
          </Link>

          <Link href="/marketplace/assignments" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#1A56DB] transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#1A56DB]/10 text-[#1A56DB]">
                  <Wrench className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--nexa-text-muted)] group-hover:text-[#1A56DB] transition-colors" />
              </div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">On-Demand Dispatch Queue</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Match incoming client requests with available certified field technicians in real time.
              </p>
            </NexaCard>
          </Link>

          <Link href="/marketplace/disputes" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#E02424] transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#E02424]/10 text-[#E02424]">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--nexa-text-muted)] group-hover:text-[#E02424] transition-colors" />
              </div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Escrow & Disputes</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Review payment milestones, arbitrate customer grievances, and release escrow funds.
              </p>
            </NexaCard>
          </Link>
        </div>

        {/* TOP REVENUE VERTICALS & REAL-TIME BOOKINGS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Categories */}
          <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0E9F6E]" />
                Top Performing Niche Verticals
              </h3>
              <NexaBadge variant="green">99 Active Verticals</NexaBadge>
            </div>

            <div className="space-y-3">
              {[
                { name: "Home Services & Plumbing", gmv: "₦28,400,000", share: 34, pros: 310 },
                { name: "Electrical & Solar Installation", gmv: "₦21,650,000", share: 26, pros: 245 },
                { name: "Automotive & Logistics", gmv: "₦16,200,000", share: 19, pros: 180 },
                { name: "Beauty, Wellness & Spas", gmv: "₦11,000,000", share: 13, pros: 420 },
                { name: "Legal & Corporate Services", gmv: "₦7,000,000", share: 8, pros: 95 },
              ].map((v) => (
                <div key={v.name} className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{v.name}</span>
                    <span className="text-[#0E9F6E]">{v.gmv}</span>
                  </div>
                  <div className="w-full bg-[var(--nexa-bg-surface)] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0E9F6E] h-full rounded-full" style={{ width: `${v.share}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--nexa-text-muted)]">
                    <span>{v.pros} Verified Pros</span>
                    <span>{v.share}% of Platform GMV</span>
                  </div>
                </div>
              ))}
            </div>
          </NexaCard>

          {/* Recent Escrow & Ops Activity */}
          <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#1A56DB]" />
                Live Ops & Escrow Activity
              </h3>
              <NexaBadge variant="brand">Real-Time</NexaBadge>
            </div>

            <div className="space-y-2.5">
              {[
                { id: "ESC-891", title: "Complete Inverter Rewiring", amount: "₦145,000", pro: "Tunde Solar Ltd", status: "Escrow Held", time: "12m ago" },
                { id: "ESC-890", title: "Commercial Plumbing Repiping", amount: "₦320,000", pro: "Lagos Master Plumbers", status: "Released", time: "45m ago" },
                { id: "ESC-889", title: "Office Deep Cleaning & Fumigation", amount: "₦85,000", pro: "CleanPro Cleaners", status: "Released", time: "2h ago" },
                { id: "DISP-104", title: "Late Arrival / Incomplete AC Repair", amount: "₦40,000", pro: "CoolBreeze Tech", status: "In Mediation", time: "3h ago" },
              ].map((act) => (
                <div key={act.id} className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-[var(--nexa-text-primary)]">{act.title}</div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)]">
                      {act.pro} • <span className="font-mono text-[#1A56DB]">{act.id}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="font-mono font-bold text-[var(--nexa-text-primary)]">{act.amount}</div>
                    <NexaBadge
                      variant={
                        act.status === "Released"
                          ? "green"
                          : act.status === "In Mediation"
                          ? "coral"
                          : "purple"
                      }
                      className="text-[9px] py-0"
                    >
                      {act.status}
                    </NexaBadge>
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
