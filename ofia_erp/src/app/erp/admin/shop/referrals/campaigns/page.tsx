"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Gift,
  Percent,
  Plus,
  Sliders,
  Sparkles,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

const CAMPAIGNS = [
  { id: "CMP-01", name: "Give ₦5,000 / Get ₦5,000 Referral Double", type: "DUAL_SIDED", referrerReward: "₦5,000 Wallet Credit", refereeDiscount: "₦5,000 Off 1st Booking", trigger: "On 1st Completed Booking", status: "ACTIVE", totalConversions: 84 },
  { id: "CMP-02", name: "Solar Pro 10% Lifetime Rev-Share", type: "RECURRING_REV_SHARE", referrerReward: "10% of Invoice Total", refereeDiscount: "5% Welcome Discount", trigger: "On Every Paid Invoice", status: "ACTIVE", totalConversions: 35 },
  { id: "CMP-03", name: "Student Ambassador ₦2,500 Bonus", type: "FLAT_FEE", referrerReward: "₦2,500 Cash", refereeDiscount: "Free Onboarding Kit", trigger: "On Tenant Registration", status: "PAUSED", totalConversions: 19 },
];

export default function ReferralCampaignsPage() {
  return (
    <BusinessShell
      title="Referral Campaign Rules & Reward Builder"
      subtitle="Configure dual-sided rewards, percentage rev-share, tiered partner incentives, and minimum spend rules."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/shop/referrals">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Referral Hub
            </NexaButton>
          </Link>
          <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
            Create Campaign Rule
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CAMPAIGNS.map((c) => (
            <NexaCard key={c.id} variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[var(--nexa-text-muted)]">{c.id}</span>
                  <NexaBadge variant={c.status === "ACTIVE" ? "green" : "neutral"} dot>
                    {c.status}
                  </NexaBadge>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">{c.name}</h3>
                  <div className="text-xs text-[#1A56DB] font-semibold mt-0.5">{c.type}</div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--nexa-text-muted)]">Referrer Gets:</span>
                    <span className="font-bold text-[#0E9F6E]">{c.referrerReward}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--nexa-text-muted)]">Referee Gets:</span>
                    <span className="font-bold text-[#1A56DB]">{c.refereeDiscount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--nexa-text-muted)]">Total Sales Generated:</span>
                    <span className="font-bold text-[var(--nexa-text-primary)] font-mono">{c.totalConversions} Conversions</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-between">
                <span className="text-xs text-[var(--nexa-text-muted)]">{c.trigger}</span>
                <NexaButton size="sm" variant="outline">
                  Edit Rules
                </NexaButton>
              </div>
            </NexaCard>
          ))}
        </div>
      </div>
    </BusinessShell>
  );
}
