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
import { AdminStatGrid } from "@/components/admin/AdminStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function MarketplaceAnalyticsPage() {
  return (
    <SuperAdminShell
      title="Marketplace GMV & Financial Analytics"
      subtitle="Detailed breakdown of Gross Merchandise Value, Paystack transaction splits, merchant withdrawal volume, and category revenue."
    >
      <div className="space-y-8">
        <AdminStatGrid
          stats={[
            {
              label: "Total Cumulative GMV",
              value: "₦342,800,000",
              change: "+24% QoQ Growth",
              trend: "up",
              changeType: "success",
              icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
              sub: "Gross Merchandise Volume",
            },
            {
              label: "Platform Fee Yield (5%)",
              value: "₦17,140,000",
              change: "5% Direct Take",
              trend: "up",
              changeType: "info",
              icon: <Wallet className="w-5 h-5 text-blue-500" />,
              sub: "Direct revenue to Ofia treasury",
            },
            {
              label: "Merchant Escrow Held",
              value: "₦8,450,000",
              change: "Secured Escrow",
              trend: "up",
              changeType: "purple",
              icon: <ShoppingBag className="w-5 h-5 text-purple-500" />,
              sub: "Pending job completion confirmation",
            },
          ]}
          columns={3}
        />

        {/* State Breakdown */}
        <NexaCard variant="glass" className="p-7 space-y-5 border border-nexa-border rounded-3xl">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-display text-nexa-text-primary">
              Regional GMV Breakdown
            </h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono">
              3 Dominant States
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-5 rounded-2xl bg-nexa-bg-surface/50 border border-nexa-border space-y-2 hover:border-nexa-brand/30 transition-all">
              <div className="font-bold text-sm text-nexa-text-primary">Lagos State</div>
              <div className="text-2xl font-black font-mono text-emerald-500">₦52,400,000 (62%)</div>
              <p className="text-xs text-nexa-text-secondary leading-relaxed">Top Areas: Lekki, Ikeja, Victoria Island, Yaba</p>
            </div>
            <div className="p-5 rounded-2xl bg-nexa-bg-surface/50 border border-nexa-border space-y-2 hover:border-nexa-brand/30 transition-all">
              <div className="font-bold text-sm text-nexa-text-primary">Abuja FCT</div>
              <div className="text-2xl font-black font-mono text-blue-500">₦21,800,000 (26%)</div>
              <p className="text-xs text-nexa-text-secondary leading-relaxed">Top Areas: Maitama, Wuse 2, Garki, Jabi</p>
            </div>
            <div className="p-5 rounded-2xl bg-nexa-bg-surface/50 border border-nexa-border space-y-2 hover:border-nexa-brand/30 transition-all">
              <div className="font-bold text-sm text-nexa-text-primary">Rivers (Port Harcourt)</div>
              <div className="text-2xl font-black font-mono text-purple-500">₦10,050,000 (12%)</div>
              <p className="text-xs text-nexa-text-secondary leading-relaxed">Top Areas: GRA Phase 2, Peter Odili, Trans Amadi</p>
            </div>
          </div>
        </NexaCard>
      </div>
    </SuperAdminShell>
  );
}
