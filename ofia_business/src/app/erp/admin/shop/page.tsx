"use client";

import React from "react";
import Link from "next/link";
import {
  Boxes,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  Gift,
  Package,
  Plus,
  Printer,
  Receipt,
  RotateCcw,
  Share2,
  ShoppingCart,
  Sliders,
  Store,
  Tag,
  TrendingUp,
  Truck,
  Users,
  Warehouse,
  Zap,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function ShopManagerDashboardPage() {
  const lowStockAlerts = [
    { id: "sku-101", name: "Hybrid Solar Inverter 5kVA", category: "Solar Power", currentStock: 2, minStock: 5, warehouse: "Ikeja Central Depot", unitCost: "₦420,000" },
    { id: "sku-104", name: "4K IP Bullet Camera 8CH", category: "Security", currentStock: 1, minStock: 10, warehouse: "Lekki Distribution Hub", unitCost: "₦38,000" },
    { id: "sku-209", name: "Cat6 Outdoor Shielded Cable 305m", category: "Networking", currentStock: 3, minStock: 8, warehouse: "Ikeja Central Depot", unitCost: "₦65,000" },
  ];

  const recentSessions = [
    { id: "POS-SES-89", cashier: "Fatima Aliyu", register: "Register 01 (Lekki Flagship)", salesCount: 38, totalAmount: "₦1,845,000", status: "OPEN" },
    { id: "POS-SES-88", cashier: "Ifeanyi Nwachukwu", register: "Register 02 (Ikeja Depot)", salesCount: 24, totalAmount: "₦920,000", status: "CLOSED" },
  ];

  const topAffiliates = [
    { id: "AFF-101", name: "Khalil Ibrahim Tech Ltd", link: "ofia.ng/join?ref=khalil2026", referrals: 142, conversions: 89, totalEarned: "₦1,420,000", tier: "GOLD" },
    { id: "AFF-102", name: "SolarInstallers Hub NG", link: "ofia.ng/join?ref=solarhub", referrals: 98, conversions: 61, totalEarned: "₦980,000", tier: "SILVER" },
  ];

  return (
    <BusinessShell
      title="Ofia Shop Manager"
      subtitle="Unified retail command desk: Point of Sale (POS) cashiering, multi-warehouse inventory (IMS), and viral customer referral growth."
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/erp/admin/shop/pos">
            <NexaButton size="sm" variant="primary" leftIcon={<ShoppingCart className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
              Launch POS Counter
            </NexaButton>
          </Link>
          <Link href="/erp/admin/shop/inventory/items">
            <NexaButton size="sm" variant="outline" leftIcon={<Boxes className="w-3.5 h-3.5" />}>
              Master SKUs
            </NexaButton>
          </Link>
          <Link href="/erp/admin/shop/referrals/campaigns">
            <NexaButton size="sm" variant="outline" leftIcon={<Gift className="w-3.5 h-3.5" />}>
              Campaigns
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
              label: "Today's POS Gross Sales",
              value: "₦2,765,000",
              change: "+18.4% vs yesterday",
              trend: "up",
              icon: <ShoppingCart className="w-5 h-5 text-blue-500" />,
              sub: "62 successful transactions",
            },
            {
              label: "Total Inventory Valuation",
              value: "₦48,250,000",
              change: "6 Regional Depots",
              trend: "neutral",
              icon: <Boxes className="w-5 h-5 text-emerald-500" />,
              sub: "1,420 total SKU units in stock",
            },
            {
              label: "Critical Low Stock",
              value: "3 SKUs",
              change: "Requires restock PO",
              trend: "down",
              icon: <Warehouse className="w-5 h-5 text-amber-500" />,
              sub: "Below safety threshold",
            },
            {
              label: "Viral Referral Growth",
              value: "₦4,500,000",
              change: "K-Factor 1.48x",
              trend: "up",
              icon: <Gift className="w-5 h-5 text-purple-500" />,
              sub: "450 promoters, 265 converted",
            },
          ]}
        />

        {/* 3 CORE PILLARS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PILLAR 1: POINT OF SALE (POS) */}
          <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[var(--nexa-text-primary)]">Point of Sale (POS)</h2>
                    <p className="text-[11px] text-[var(--nexa-text-muted)]">Counter cashiering & sessions</p>
                  </div>
                </div>
                <NexaBadge variant="brand" size="sm">Active</NexaBadge>
              </div>

              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Fast touchscreen checkout, barcode scanning, split payments, and thermal receipt printing for retail counters.
              </p>

              <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--nexa-text-muted)]">Active Cashier Shifts</div>
                {recentSessions.map((ses) => (
                  <div key={ses.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs">
                    <div>
                      <div className="font-bold text-[var(--nexa-text-primary)]">{ses.cashier}</div>
                      <div className="text-[10px] text-[var(--nexa-text-muted)]">{ses.register}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#1A56DB]">{ses.totalAmount}</div>
                      <div className="text-[10px] text-[var(--nexa-text-muted)]">{ses.salesCount} txns</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link href="/erp/admin/shop/pos" className="w-full">
                <NexaButton size="sm" variant="primary" className="w-full bg-[#1A56DB] text-white">
                  Open Terminal
                </NexaButton>
              </Link>
              <Link href="/erp/admin/shop/pos/sessions" className="w-full">
                <NexaButton size="sm" variant="outline" className="w-full">
                  Shift Sessions
                </NexaButton>
              </Link>
            </div>
          </NexaCard>

          {/* PILLAR 2: INVENTORY MANAGEMENT (IMS) */}
          <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[var(--nexa-text-primary)]">Inventory (IMS)</h2>
                    <p className="text-[11px] text-[var(--nexa-text-muted)]">Multi-warehouse stock & SKUs</p>
                  </div>
                </div>
                <NexaBadge variant="amber" size="sm">3 Low Stock</NexaBadge>
              </div>

              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Real-time multi-depot stock monitoring, inter-branch transfers, vendor purchase orders, and shrinkage audits.
              </p>

              <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--nexa-text-muted)]">Low Stock Alerts</div>
                {lowStockAlerts.map((sku) => (
                  <div key={sku.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs">
                    <div className="truncate max-w-[150px]">
                      <div className="font-bold text-[var(--nexa-text-primary)] truncate">{sku.name}</div>
                      <div className="text-[10px] text-[var(--nexa-text-muted)]">{sku.warehouse}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-rose-500 font-extrabold">{sku.currentStock} left</span>
                      <div className="text-[10px] text-[var(--nexa-text-muted)]">Min: {sku.minStock}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link href="/erp/admin/shop/inventory" className="w-full">
                <NexaButton size="sm" variant="outline" className="w-full">
                  Stock Overview
                </NexaButton>
              </Link>
              <Link href="/erp/admin/shop/inventory/items" className="w-full">
                <NexaButton size="sm" variant="outline" className="w-full">
                  Master Catalog
                </NexaButton>
              </Link>
            </div>
          </NexaCard>

          {/* PILLAR 3: VIRAL REFERRALS */}
          <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[var(--nexa-text-primary)]">Viral Referrals</h2>
                    <p className="text-[11px] text-[var(--nexa-text-muted)]">Affiliates & dual-sided rewards</p>
                  </div>
                </div>
                <NexaBadge variant="green" size="sm">K-Factor 1.48</NexaBadge>
              </div>

              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Dual-sided customer incentive campaigns (Give ₦5k / Get ₦5k), tiered promoter payouts, and viral attribution loops.
              </p>

              <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--nexa-text-muted)]">Top Promoters</div>
                {topAffiliates.map((aff) => (
                  <div key={aff.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs">
                    <div>
                      <div className="font-bold text-[var(--nexa-text-primary)]">{aff.name}</div>
                      <div className="text-[10px] text-[var(--nexa-text-muted)]">{aff.referrals} referrals ({aff.conversions} paid)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-600">{aff.totalEarned}</div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-bold font-mono">{aff.tier}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link href="/erp/admin/shop/referrals" className="w-full">
                <NexaButton size="sm" variant="outline" className="w-full">
                  Referral Console
                </NexaButton>
              </Link>
              <Link href="/erp/admin/shop/referrals/campaigns" className="w-full">
                <NexaButton size="sm" variant="outline" className="w-full">
                  Reward Rules
                </NexaButton>
              </Link>
            </div>
          </NexaCard>
        </div>
      </div>
    </BusinessShell>
  );
}
