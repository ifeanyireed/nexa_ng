"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Filter,
  Flame,
  Globe,
  PieChart,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function ReferralAnalyticsPage() {
  return (
    <BusinessShell
      title="Referral Funnels & Anti-Fraud Detection"
      subtitle="Inspect click-to-customer conversion velocities, multi-touch attribution, and automatic self-referral prevention."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/shop/referrals">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Referral Hub
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ATTRIBUTION STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)]">
            <div className="text-xs text-[var(--nexa-text-muted)] font-semibold flex items-center justify-between">
              <span>Attribution Window</span>
              <Globe className="w-4 h-4 text-[#1A56DB]" />
            </div>
            <div className="text-xl font-bold text-[var(--nexa-text-primary)]">60-Day Cookie Window</div>
            <p className="text-[11px] text-[var(--nexa-text-muted)]">Last-touch affiliate receives conversion credit</p>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)]">
            <div className="text-xs text-[var(--nexa-text-muted)] font-semibold flex items-center justify-between">
              <span>Anti-Fraud Shield</span>
              <ShieldAlert className="w-4 h-4 text-[#0E9F6E]" />
            </div>
            <div className="text-xl font-bold text-[#0E9F6E]">Active & Enforced</div>
            <p className="text-[11px] text-[var(--nexa-text-muted)]">Device fingerprint & same-IP self-referrals blocked</p>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)]">
            <div className="text-xs text-[var(--nexa-text-muted)] font-semibold flex items-center justify-between">
              <span>Top Channel Source</span>
              <Flame className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-xl font-bold text-[var(--nexa-text-primary)]">WhatsApp Share (68%)</div>
            <p className="text-[11px] text-[var(--nexa-text-muted)]">Followed by LinkedIn (21%) & Direct (11%)</p>
          </NexaCard>
        </div>

        {/* CONVERSION FUNNEL STEPS */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)]">
          <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Click-to-Customer Viral Conversion Funnel</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1">
              <div className="text-[var(--nexa-text-muted)]">1. Link Clicks</div>
              <div className="text-lg font-black font-mono text-[var(--nexa-text-primary)]">4,280</div>
              <div className="text-[10px] text-[#1A56DB]">100% Top of Funnel</div>
            </div>
            <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1">
              <div className="text-[var(--nexa-text-muted)]">2. Landing Visits</div>
              <div className="text-lg font-black font-mono text-[var(--nexa-text-primary)]">3,640</div>
              <div className="text-[10px] text-[#0E9F6E]">85% Retention</div>
            </div>
            <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1">
              <div className="text-[var(--nexa-text-muted)]">3. User Signups</div>
              <div className="text-lg font-black font-mono text-[var(--nexa-text-primary)]">1,120</div>
              <div className="text-[10px] text-[#9061F9]">30.7% Signup CVR</div>
            </div>
            <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1">
              <div className="text-[var(--nexa-text-muted)]">4. Paid Conversion</div>
              <div className="text-lg font-black font-mono text-[#0E9F6E]">482</div>
              <div className="text-[10px] text-[#0E9F6E] font-bold">43% Activation</div>
            </div>
          </div>
        </NexaCard>
      </div>
    </BusinessShell>
  );
}
