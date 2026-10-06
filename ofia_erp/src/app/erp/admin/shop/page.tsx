"use client";

import React, { useState } from "react";
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
  Calendar,
  ClipboardList,
  Palette,
  ExternalLink,
  Eye,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";
import {
  VERTICAL_DEFINITIONS,
  detectTenantVertical,
  VerticalKey,
} from "@/lib/verticals";

export default function ShopManagerDashboardPage() {
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);
  const detectedVertical = detectTenantVertical(activeTenant?.slug, activeTenant?.name);

  const [selectedVertical, setSelectedVertical] = useState<VerticalKey>(detectedVertical);
  const verticalDef = VERTICAL_DEFINITIONS[selectedVertical];

  const lowStockAlerts = [
    { id: "sku-101", name: "Hybrid Solar Inverter 5kVA", category: "Solar Power", currentStock: 2, minStock: 5, warehouse: "Ikeja Central Depot", unitCost: "₦420,000" },
    { id: "sku-104", name: "4K IP Bullet Camera 8CH", category: "Security", currentStock: 1, minStock: 10, warehouse: "Lekki Distribution Hub", unitCost: "₦38,000" },
  ];

  const recentSessions = [
    { id: "POS-SES-89", cashier: "Fatima Aliyu", register: "Register 01 (Lekki Flagship)", salesCount: 38, totalAmount: "₦1,845,000", status: "OPEN" },
  ];

  return (
    <BusinessShell
      title="Ofia Shop Manager & Commerce Workspace"
      subtitle={`Unified operating desk for ${verticalDef.name}: Omnichannel catalog, service bookings, POS counter, multi-warehouse inventory, and storefront studio.`}
      action={
        <div className="flex items-center gap-2">
          {/* Vertical Archetype Selector */}
          <select
            value={selectedVertical}
            onChange={(e) => setSelectedVertical(e.target.value as VerticalKey)}
            className="px-3 py-1.5 bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-full text-xs font-bold text-[var(--nexa-text-primary)] outline-none cursor-pointer"
          >
            {Object.values(VERTICAL_DEFINITIONS).map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          <Link href="/erp/admin/shop/store">
            <NexaButton size="sm" variant="outline" leftIcon={<Palette className="w-3.5 h-3.5" />} className="rounded-full">
              My Store Studio
            </NexaButton>
          </Link>

          <Link href="/erp/admin/shop/pos">
            <NexaButton size="sm" variant="primary" leftIcon={<ShoppingCart className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white rounded-full font-bold shadow-xs">
              Open POS Register
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
              label: "Today's Omnichannel Gross Sales",
              value: "₦4,610,000",
              change: "+24.5% vs yesterday",
              trend: "up",
              icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
              sub: "Online Storefront + In-Store POS",
            },
            {
              label: "Active Catalog Listings",
              value: `34 ${verticalDef.productTermPlural}`,
              change: verticalDef.badge,
              trend: "up",
              icon: <Package className="w-5 h-5 text-blue-500" />,
              sub: "Synced to web and mobile",
            },
            {
              label: "Pending Fulfillment & Bookings",
              value: "8 Requests",
              change: "Needs Staff Action",
              trend: "neutral",
              icon: <Clock className="w-5 h-5 text-amber-500" />,
              sub: "3 in prep, 5 appointments",
            },
            {
              label: "Multi-Warehouse Inventory",
              value: "₦48,250,000",
              change: "6 Regional Depots",
              trend: "up",
              icon: <Boxes className="w-5 h-5 text-purple-500" />,
              sub: "1,420 total units in stock",
            },
          ]}
        />

        {/* 6 CORE COMMERCE PILLARS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* PILLAR 1: VERTICAL CATALOG & LISTINGS */}
          <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] flex flex-col justify-between space-y-5 rounded-3xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <NexaBadge variant="brand" size="sm" className="rounded-full">{verticalDef.badge}</NexaBadge>
              </div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Catalog & Listings</h3>
              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Vertical-native product management with custom attribute schemas ({verticalDef.attributeFields.map(f => f.label).slice(0, 2).join(", ")}).
              </p>
            </div>
            <Link href="/erp/admin/shop/catalog" className="w-full">
              <NexaButton size="sm" variant="outline" className="w-full rounded-full font-bold">
                Manage {verticalDef.productTermPlural} →
              </NexaButton>
            </Link>
          </NexaCard>

          {/* PILLAR 2: SERVICES & APPOINTMENTS */}
          <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] flex flex-col justify-between space-y-5 rounded-3xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <NexaBadge variant="purple" size="sm" className="rounded-full">Bookings</NexaBadge>
              </div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Services & Bookings</h3>
              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Schedule {verticalDef.serviceTerm.toLowerCase()}, appoint staff providers, and handle client inquiries.
              </p>
            </div>
            <Link href="/erp/admin/shop/services" className="w-full">
              <NexaButton size="sm" variant="outline" className="w-full rounded-full font-bold">
                Manage Service Schedule →
              </NexaButton>
            </Link>
          </NexaCard>

          {/* PILLAR 3: OMNICHANNEL ORDERS */}
          <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] flex flex-col justify-between space-y-5 rounded-3xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <NexaBadge variant="green" size="sm" className="rounded-full">Live Feed</NexaBadge>
              </div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Orders & Fulfillment</h3>
              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Stream orders from online storefront and walk-in counter, assign dispatch riders, and track delivery waybills.
              </p>
            </div>
            <Link href="/erp/admin/shop/orders" className="w-full">
              <NexaButton size="sm" variant="outline" className="w-full rounded-full font-bold">
                View Orders Stream →
              </NexaButton>
            </Link>
          </NexaCard>

          {/* PILLAR 4: POINT OF SALE (POS) */}
          <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] flex flex-col justify-between space-y-5 rounded-3xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <NexaBadge variant="brand" size="sm" className="rounded-full">Cashier Desk</NexaBadge>
              </div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Point of Sale (POS)</h3>
              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                High-speed cashier counter, touchscreen checkout, cash/card/split payments, and thermal receipt printing.
              </p>
            </div>
            <Link href="/erp/admin/shop/pos" className="w-full">
              <NexaButton size="sm" variant="primary" className="w-full bg-[#1A56DB] text-white rounded-full font-bold">
                Launch POS Terminal →
              </NexaButton>
            </Link>
          </NexaCard>

          {/* PILLAR 5: INVENTORY MANAGEMENT (IMS) */}
          <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] flex flex-col justify-between space-y-5 rounded-3xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </div>
                <NexaBadge variant="amber" size="sm" className="rounded-full">Multi-Depot</NexaBadge>
              </div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Inventory (IMS)</h3>
              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Multi-depot stock tracking, inter-branch warehouse transfers, shrinkage adjustments, and reorder alerts.
              </p>
            </div>
            <Link href="/erp/admin/shop/inventory" className="w-full">
              <NexaButton size="sm" variant="outline" className="w-full rounded-full font-bold">
                Warehouse Stock →
              </NexaButton>
            </Link>
          </NexaCard>

          {/* PILLAR 6: MY STORE STUDIO */}
          <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] flex flex-col justify-between space-y-5 rounded-3xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <NexaBadge variant="purple" size="sm" className="rounded-full">Storefront Studio</NexaBadge>
              </div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">My Store Studio</h3>
              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Switch between the 10 Blueprint vertical templates, upload brand identity, and customize homepage sections.
              </p>
            </div>
            <Link href="/erp/admin/shop/store" className="w-full">
              <NexaButton size="sm" variant="outline" className="w-full rounded-full font-bold">
                Customize Storefront →
              </NexaButton>
            </Link>
          </NexaCard>
        </div>
      </div>
    </BusinessShell>
  );
}
