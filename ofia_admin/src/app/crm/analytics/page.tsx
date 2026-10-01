"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Globe,
  MapPin,
  PieChart,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";
import { AdminStatGrid } from "@/components/admin/AdminStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function CRMAnalyticsPage() {
  return (
    <SuperAdminShell
      title="Waitlist & Lead Conversion Analytics"
      subtitle="Funnel metrics, regional heatmaps, viral referral velocity, and persona conversion benchmarks."
      action={
        <Link href="/crm/waitlist">
          <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />} className="rounded-full">
            Waitlist Pipeline
          </NexaButton>
        </Link>
      }
    >
      <div className="space-y-8">
        {/* Top Funnel Metrics */}
        <AdminStatGrid
          stats={[
            {
              label: "Total Waitlist Traffic",
              value: "19,420 Visits",
              change: "14.6% Conversion",
              trend: "up",
              changeType: "info",
              icon: <Users className="w-5 h-5 text-blue-500" />,
              sub: "Conversion to waitlist signup",
            },
            {
              label: "Viral Referral Multiplier",
              value: "1.42x K-Factor",
              change: "+0.3x QoQ",
              trend: "up",
              changeType: "success",
              icon: <Sparkles className="w-5 h-5 text-emerald-500" />,
              sub: "Each registrant invites ~1.4 peers",
            },
            {
              label: "Wave 1 Acceptance Rate",
              value: "86.2% Rate",
              change: "High Activation",
              trend: "up",
              changeType: "purple",
              icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
              sub: "Invited merchants activating",
            },
            {
              label: "Estimated Day 1 MRR",
              value: "₦18,250,000",
              change: "Projected Yield",
              trend: "up",
              changeType: "warning",
              icon: <BarChart3 className="w-5 h-5 text-amber-500" />,
              sub: "Projected from qualified tier mix",
            },
          ]}
          columns={4}
        />

        {/* Regional Breakdown & Industry Mix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <NexaCard variant="glass" className="p-7 space-y-5 border border-nexa-border rounded-3xl">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-extrabold text-display text-nexa-text-primary flex items-center gap-2">
                <MapPin className="w-4 h-4 text-nexa-brand" />
                <span>Geographic Distribution (Nigeria)</span>
              </h4>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-mono">
                5 Major States
              </span>
            </div>
            <div className="space-y-3.5 text-xs pt-1">
              {[
                { state: "Lagos State", count: "1,310 leads", pct: 46, color: "bg-blue-600" },
                { state: "Abuja FCT", count: "626 leads", pct: 22, color: "bg-blue-400" },
                { state: "Rivers (Port Harcourt)", count: "398 leads", pct: 14, color: "bg-emerald-500" },
                { state: "Kano State", count: "284 leads", pct: 10, color: "bg-purple-500" },
                { state: "Oyo & Other States", count: "230 leads", pct: 8, color: "bg-amber-500" },
              ].map((item) => (
                <div key={item.state} className="p-3.5 rounded-2xl bg-nexa-bg-surface/50 border border-nexa-border space-y-2">
                  <div className="flex justify-between font-bold text-xs text-nexa-text-primary">
                    <span>{item.state}</span>
                    <span className="text-nexa-text-muted font-mono">{item.count} ({item.pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-nexa-bg-base overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </NexaCard>

          <NexaCard variant="glass" className="p-7 space-y-5 border border-nexa-border rounded-3xl">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-extrabold text-display text-nexa-text-primary flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-500" />
                <span>Industry Niche Segmentation</span>
              </h4>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono">
                99 Verticals
              </span>
            </div>
            <div className="space-y-3.5 text-xs pt-1">
              {[
                { niche: "Retail, Supermarkets & Storefronts", pct: 32, color: "bg-emerald-500" },
                { niche: "Professional & Field Technicians", pct: 24, color: "bg-blue-600" },
                { niche: "Logistics, Courier & Waybill Fleet", pct: 18, color: "bg-purple-500" },
                { niche: "Home & Solar Inverter Installation", pct: 14, color: "bg-amber-500" },
                { niche: "Fashion, Healthcare & Food", pct: 12, color: "bg-rose-500" },
              ].map((item) => (
                <div key={item.niche} className="p-3.5 rounded-2xl bg-nexa-bg-surface/50 border border-nexa-border space-y-2">
                  <div className="flex justify-between font-bold text-xs text-nexa-text-primary">
                    <span>{item.niche}</span>
                    <span className="text-emerald-500 font-mono font-bold">{item.pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-nexa-bg-base overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
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
