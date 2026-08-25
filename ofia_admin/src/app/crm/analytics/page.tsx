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
          <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Waitlist Pipeline
          </NexaButton>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Top Funnel Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NexaCard variant="glass" padding="md" className="border-l-4 border-l-[#1A56DB]">
            <div className="text-xs text-[var(--nexa-text-muted)] font-semibold">Total Waitlist Traffic</div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] mt-1">19,420 Visits</div>
            <div className="text-[11px] text-[#1A56DB] font-bold mt-1">14.6% Conversion to Signup</div>
          </NexaCard>
          <NexaCard variant="glass" padding="md" className="border-l-4 border-l-[#0E9F6E]">
            <div className="text-xs text-[var(--nexa-text-muted)] font-semibold">Viral Referral Multiplier (K-Factor)</div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] mt-1">1.42x</div>
            <div className="text-[11px] text-[#0E9F6E] font-bold mt-1">Each registrant invites ~1.4 peers</div>
          </NexaCard>
          <NexaCard variant="glass" padding="md" className="border-l-4 border-l-[#7E22CE]">
            <div className="text-xs text-[var(--nexa-text-muted)] font-semibold">Wave 1 Acceptance Rate</div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] mt-1">86.2%</div>
            <div className="text-[11px] text-[#7E22CE] font-bold mt-1">Invited merchants activating</div>
          </NexaCard>
          <NexaCard variant="glass" padding="md" className="border-l-4 border-l-[#C88A3A]">
            <div className="text-xs text-[var(--nexa-text-muted)] font-semibold">Estimated Day 1 MRR</div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] mt-1">₦18,250,000</div>
            <div className="text-[11px] text-[#C88A3A] font-bold mt-1">Projected from qualified tier mix</div>
          </NexaCard>
        </div>

        {/* Regional Breakdown & Industry Mix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NexaCard variant="glass" padding="lg" className="space-y-4">
            <h4 className="text-sm font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1A56DB]" />
              <span>Geographic Distribution (Nigeria)</span>
            </h4>
            <div className="space-y-3 text-xs">
              {[
                { state: "Lagos State", count: "1,310 leads", pct: 46, color: "bg-[#1A56DB]" },
                { state: "Abuja FCT", count: "626 leads", pct: 22, color: "bg-[#3F83F8]" },
                { state: "Rivers (Port Harcourt)", count: "398 leads", pct: 14, color: "bg-[#0E9F6E]" },
                { state: "Kano State", count: "284 leads", pct: 10, color: "bg-[#9061F9]" },
                { state: "Oyo & Other States", count: "230 leads", pct: 8, color: "bg-[#C88A3A]" },
              ].map((item) => (
                <div key={item.state} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>{item.state}</span>
                    <span className="text-[var(--nexa-text-muted)]">{item.count} ({item.pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--nexa-bg-base)] overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="lg" className="space-y-4">
            <h4 className="text-sm font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#0E9F6E]" />
              <span>Industry Niche Segmentation</span>
            </h4>
            <div className="space-y-3 text-xs">
              {[
                { niche: "Retail, Supermarkets & Storefronts", pct: 32, color: "bg-emerald-500" },
                { niche: "Professional & Field Technicians", pct: 24, color: "bg-blue-600" },
                { niche: "Logistics, Courier & Waybill Fleet", pct: 18, color: "bg-indigo-500" },
                { niche: "Home & Solar Inverter Installation", pct: 14, color: "bg-amber-500" },
                { niche: "Fashion, Healthcare & Food", pct: 12, color: "bg-purple-500" },
              ].map((item) => (
                <div key={item.niche} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>{item.niche}</span>
                    <span className="text-[var(--nexa-text-muted)]">{item.pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--nexa-bg-base)] overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
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
