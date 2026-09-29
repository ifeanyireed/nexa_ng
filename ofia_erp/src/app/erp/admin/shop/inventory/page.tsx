"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Building2,
  CheckCircle2,
  DollarSign,
  Download,
  Filter,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Truck,
  Warehouse,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function InventoryDashboardPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const lowStockAlerts = [
    { id: "sku-101", name: "Hybrid Solar Inverter 5kVA", category: "Solar Power", currentStock: 2, minStock: 5, warehouse: "Ikeja Central Depot", supplier: "SunTech Energy Ltd", unitCost: "₦420,000" },
    { id: "sku-104", name: "4K IP Bullet Camera 8CH", category: "Security", currentStock: 1, minStock: 10, warehouse: "Lekki Distribution Hub", supplier: "HikTech Solutions", unitCost: "₦38,000" },
    { id: "sku-209", name: "Cat6 Outdoor Shielded Cable 305m", category: "Networking", currentStock: 3, minStock: 8, warehouse: "Ikeja Central Depot", supplier: "D-Link West Africa", unitCost: "₦65,000" },
  ];

  return (
    <BusinessShell
      title="Inventory Management System (IMS)"
      subtitle="Real-time multi-warehouse stock monitoring, asset valuation, barcode SKUs, and restock forecasting."
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/erp/admin/shop/inventory/items">
            <NexaButton size="sm" variant="outline" leftIcon={<Package className="w-3.5 h-3.5" />}>
              Master Catalog
            </NexaButton>
          </Link>
          <Link href="/erp/admin/shop/inventory/transfers">
            <NexaButton size="sm" variant="outline" leftIcon={<Truck className="w-3.5 h-3.5" />}>
              Stock Transfers
            </NexaButton>
          </Link>
          <Link href="/erp/admin/shop/inventory/suppliers">
            <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
              Create Restock PO
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-10">
        {/* TOP 4 KPI CARDS — MATCHING /erp/admin VERBATIM */}
        <ErpStatGrid
          stats={[
            {
              label: "Stock Valuation (IMS)",
              value: "₦48.65M",
              change: "4 Depot Hubs",
              trend: "up",
              icon: <Boxes className="w-5 h-5 text-emerald-500" />,
              sub: "348 Active SKUs",
            },
            {
              label: "Low Stock Warnings",
              value: "3 Critical SKUs",
              change: "Action Needed",
              changeType: "danger",
              trend: "up",
              icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
              sub: "Below safety threshold",
            },
            {
              label: "Stock Turnover Rate",
              value: "6.4x / year",
              change: "+18% vs Q1",
              trend: "up",
              icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
              sub: "High velocity turnover",
            },
            {
              label: "Active Depot Hubs",
              value: "3 Locations",
              change: "100% Online",
              trend: "up",
              icon: <Warehouse className="w-5 h-5 text-purple-500" />,
              sub: "Ikeja • Lekki • Abuja",
            },
          ]}
        />

        {/* LOW STOCK ALERTS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[var(--nexa-text-primary)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#E02424]" />
              Critical Reorder Alerts
            </h2>
            <Link href="/erp/admin/shop/inventory/suppliers" className="text-xs text-[#1A56DB] font-bold hover:underline flex items-center gap-1">
              <span>Automate Reorder POs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-semibold">
                <tr>
                  <th className="py-3 px-4">SKU / Item Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Available Stock</th>
                  <th className="py-3 px-3">Safety Min</th>
                  <th className="py-3 px-3">Warehouse Hub</th>
                  <th className="py-3 px-3">Primary Supplier</th>
                  <th className="py-3 px-3">Est. Unit Cost</th>
                  <th className="py-3 px-4 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
                {lowStockAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-xs">{alert.name}</div>
                      <div className="font-mono text-[10px] text-[var(--nexa-text-muted)]">{alert.id.toUpperCase()}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <NexaBadge variant="neutral">{alert.category}</NexaBadge>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-black text-[#E02424] bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                        {alert.currentStock} Units Left
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[var(--nexa-text-muted)]">{alert.minStock} Units</td>
                    <td className="py-3.5 px-3 text-xs">{alert.warehouse}</td>
                    <td className="py-3.5 px-3 text-xs text-[var(--nexa-text-muted)]">{alert.supplier}</td>
                    <td className="py-3.5 px-3 font-bold text-xs">{alert.unitCost}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href="/erp/admin/shop/inventory/suppliers">
                        <NexaButton size="sm" variant="outline" className="text-xs h-7">
                          Create PO
                        </NexaButton>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* WAREHOUSE DISTRIBUTION MAP / CARDS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-[#1A56DB]" />
              Depot Storage Capacity & Stock Distribution
            </h2>
            <Link href="/erp/admin/shop/inventory/warehouses" className="text-xs text-[#1A56DB] font-bold hover:underline flex items-center gap-1">
              <span>Manage Warehouses</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Ikeja Central Distribution Depot", capacity: "85%", skus: 94, city: "Lagos Mainland", isPrimary: true },
              { name: "Lekki Fulfillment & Rapid Hub", capacity: "62%", skus: 48, city: "Lagos Island", isPrimary: false },
              { name: "Abuja Regional Transit Depot", capacity: "40%", skus: 32, city: "Federal Capital Territory", isPrimary: false },
            ].map((hub, i) => (
              <NexaCard key={i} variant="glass" padding="md" className="space-y-3 border border-[var(--nexa-border)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#1A56DB]" />
                    <span className="text-xs font-bold text-[var(--nexa-text-primary)]">{hub.name}</span>
                  </div>
                  {hub.isPrimary && <NexaBadge variant="brand">Primary</NexaBadge>}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--nexa-text-muted)]">Capacity Utilization</span>
                    <span className="font-bold text-[var(--nexa-text-primary)]">{hub.capacity}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-[#1A56DB] rounded-full" style={{ width: hub.capacity }} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)] pt-1 border-t border-[var(--nexa-border)]">
                  <span>{hub.city}</span>
                  <span className="font-semibold text-[#1A56DB]">{hub.skus} SKUs Stored</span>
                </div>
              </NexaCard>
            ))}
          </div>
        </div>
      </div>
    </BusinessShell>
  );
}
