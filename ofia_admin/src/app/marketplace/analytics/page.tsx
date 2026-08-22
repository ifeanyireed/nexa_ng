"use client";

import React, { useState } from "react";
import {
  CreditCard,
  DollarSign,
  Layers,
  PieChart,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function MarketplaceAnalyticsPage() {
  return (
    <SuperAdminShell
      title="Marketplace GMV & Financial Analytics"
      subtitle="Detailed breakdown of Gross Merchandise Value, Paystack transaction splits, merchant withdrawal volume, and category revenue."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#0E9F6E]">
            <span className="text-xs text-[var(--nexa-text-muted)] font-semibold">Total Cumulative GMV</span>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">₦342,800,000</div>
            <div className="text-[11px] text-[#0E9F6E] font-bold">+24% QoQ Growth</div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#1A56DB]">
            <span className="text-xs text-[var(--nexa-text-muted)] font-semibold">Platform Fee Yield (5%)</span>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">₦17,140,000</div>
            <div className="text-[11px] text-[var(--nexa-text-muted)]">Direct revenue to Ofia treasury</div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#7E3AF2]">
            <span className="text-xs text-[var(--nexa-text-muted)] font-semibold">Merchant Escrow Held</span>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">₦8,450,000</div>
            <div className="text-[11px] text-[#7E3AF2] font-semibold">Pending customer completion confirmation</div>
          </NexaCard>
        </div>

        {/* State Breakdown */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)]">
          <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Regional GMV Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1">
              <div className="font-bold text-sm">Lagos State</div>
              <div className="text-xl font-bold text-[#0E9F6E]">₦52,400,000 (62%)</div>
              <p className="text-xs text-[var(--nexa-text-muted)]">Top Areas: Lekki, Ikeja, Victoria Island, Yaba</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1">
              <div className="font-bold text-sm">Abuja FCT</div>
              <div className="text-xl font-bold text-[#1A56DB]">₦21,800,000 (26%)</div>
              <p className="text-xs text-[var(--nexa-text-muted)]">Top Areas: Maitama, Wuse 2, Garki, Jabi</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1">
              <div className="font-bold text-sm">Rivers (Port Harcourt)</div>
              <div className="text-xl font-bold text-[#7E3AF2]">₦10,050,000 (12%)</div>
              <p className="text-xs text-[var(--nexa-text-muted)]">Top Areas: GRA Phase 2, Peter Odili, Trans Amadi</p>
            </div>
          </div>
        </NexaCard>
      </div>
    </SuperAdminShell>
  );
}
