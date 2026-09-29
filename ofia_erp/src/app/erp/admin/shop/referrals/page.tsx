"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  DollarSign,
  Gift,
  Link as LinkIcon,
  Percent,
  Plus,
  Share2,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function ReferralEngineDashboardPage() {
  const topAffiliates = [
    { id: "AFF-101", name: "Khalil Ibrahim Tech Ltd", link: "ofia.ng/join?ref=khalil2026", referrals: 142, conversions: 89, totalEarned: "₦1,420,000", pendingPayout: "₦180,000", tier: "GOLD" },
    { id: "AFF-102", name: "SolarInstallers Hub NG", link: "ofia.ng/join?ref=solarhub", referrals: 98, conversions: 61, totalEarned: "₦980,000", pendingPayout: "₦120,000", tier: "SILVER" },
    { id: "AFF-103", name: "TechPoint West Africa", link: "ofia.ng/join?ref=techpoint", referrals: 210, conversions: 115, totalEarned: "₦2,100,000", pendingPayout: "₦350,000", tier: "PLATINUM" },
  ];

  return (
    <BusinessShell
      title="Viral Referral & Affiliate Growth Engine"
      subtitle="Dual-sided rewards (Give ₦5k / Get ₦5k), tiered affiliate commissions, automated Paystack payouts, and viral attribution funnels."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/shop/referrals/campaigns">
            <NexaButton size="sm" variant="outline" leftIcon={<Gift className="w-3.5 h-3.5" />}>
              Reward Rules
            </NexaButton>
          </Link>
          <Link href="/erp/admin/shop/referrals/payouts">
            <NexaButton size="sm" variant="outline" leftIcon={<DollarSign className="w-3.5 h-3.5" />}>
              Process Payouts
            </NexaButton>
          </Link>
          <Link href="/erp/admin/shop/referrals/campaigns">
            <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
              Launch Referral Campaign
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* KPI CARDS */}
        <ErpStatGrid
          stats={[
            {
              label: "Viral K-Factor",
              value: "1.48 (Viral Growth)",
              change: "+34% Virality",
              sub: "Every 100 users invite 148 leads",
              icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
              iconBg: "bg-blue-500/10 text-blue-500",
            },
            {
              label: "Referral Revenue Attributed",
              value: "₦34,500,000",
              change: "+42% Growth",
              sub: "Direct word-of-mouth conversion",
              icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
              iconBg: "bg-emerald-500/10 text-emerald-500",
            },
            {
              label: "Active Affiliates & Promoters",
              value: "184 Partners",
              change: "68 Active This Week",
              sub: "Automated tracking links",
              icon: <Users className="w-5 h-5 text-purple-500" />,
              iconBg: "bg-purple-500/10 text-purple-500",
            },
            {
              label: "Pending Commissions",
              value: "₦650,000",
              change: "3 Payouts Ready",
              sub: "Paystack transfer batch prepared",
              icon: <Gift className="w-5 h-5 text-amber-500" />,
              iconBg: "bg-amber-500/10 text-amber-500",
            },
          ]}
        />

        {/* TOP AFFILIATE PARTNERS TABLE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1A56DB]" />
              Top Affiliate Performers & Leaderboard
            </h2>
            <Link href="/erp/admin/shop/referrals/affiliates" className="text-xs text-[#1A56DB] font-bold hover:underline flex items-center gap-1">
              <span>View All 184 Affiliates</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-semibold">
                <tr>
                  <th className="py-3 px-4">Affiliate Partner</th>
                  <th className="py-3 px-4">Referral Link / Code</th>
                  <th className="py-3 px-3">Tier</th>
                  <th className="py-3 px-3">Total Clicks / Invites</th>
                  <th className="py-3 px-3">Conversions</th>
                  <th className="py-3 px-3">Total Earned</th>
                  <th className="py-3 px-4 text-right">Pending Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
                {topAffiliates.map((aff) => (
                  <tr key={aff.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-xs text-[var(--nexa-text-primary)]">{aff.name}</div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] font-mono">{aff.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#1A56DB] font-semibold">{aff.link}</td>
                    <td className="py-3.5 px-3">
                      <NexaBadge variant="purple" className="text-[9px]">{aff.tier}</NexaBadge>
                    </td>
                    <td className="py-3.5 px-3 font-mono">{aff.referrals} Invites</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#0E9F6E]">{aff.conversions} Sales</td>
                    <td className="py-3.5 px-3 font-mono font-extrabold text-[var(--nexa-text-primary)]">{aff.totalEarned}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#F59E0B]">{aff.pendingPayout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* QUICK REFERRAL SHORTCUTS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/erp/admin/shop/referrals/campaigns" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#1A56DB] transition-all">
              <Gift className="w-5 h-5 text-[#1A56DB]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Campaign Rules</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Configure dual-sided ₦5k rewards and % commissions.</p>
            </NexaCard>
          </Link>

          <Link href="/erp/admin/shop/referrals/affiliates" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#0E9F6E] transition-all">
              <Users className="w-5 h-5 text-[#0E9F6E]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Affiliate Directory</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Manage 184 partner accounts, KYC, and custom links.</p>
            </NexaCard>
          </Link>

          <Link href="/erp/admin/shop/referrals/payouts" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#9061F9] transition-all">
              <DollarSign className="w-5 h-5 text-[#9061F9]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Paystack Batch Payouts</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Instant commission bank transfers with 1-click.</p>
            </NexaCard>
          </Link>

          <Link href="/erp/admin/shop/referrals/analytics" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#F59E0B] transition-all">
              <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Attribution & Anti-Fraud</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Track click journeys and detect self-referrals.</p>
            </NexaCard>
          </Link>
        </div>
      </div>
    </BusinessShell>
  );
}
