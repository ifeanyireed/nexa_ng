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
          <Link href="/erp/admin/inventory/items">
            <NexaButton size="sm" variant="outline" leftIcon={<Package className="w-3.5 h-3.5" />}>
              Master Catalog
            </NexaButton>
          </Link>
          <Link href="/erp/admin/inventory/transfers">
            <NexaButton size="sm" variant="outline" leftIcon={<Truck className="w-3.5 h-3.5" />}>
              Stock Transfers
            </NexaButton>
          </Link>
          <Link href="/erp/admin/inventory/suppliers">
            <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
              Create Restock PO
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#1A56DB]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Total Stock Valuation</span>
              <DollarSign className="w-4 h-4 text-[#1A56DB]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">₦48,650,000</div>
            <div className="text-[11px] text-[#1A56DB] font-bold">142 Unique SKUs Across 3 Hubs</div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#E02424]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Low Stock Warnings</span>
              <AlertTriangle className="w-4 h-4 text-[#E02424]" />
            </div>
            <div className="text-2xl font-black text-[#E02424]">3 Items Critical</div>
            <div className="text-[11px] text-[#E02424] font-semibold">Below Safety Thresholds</div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#0E9F6E]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Stock Turnover Rate</span>
              <TrendingUp className="w-4 h-4 text-[#0E9F6E]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">6.4x / year</div>
            <div className="text-[11px] text-[#0E9F6E] font-bold">+18% Efficiency vs Q1</div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#9061F9]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Warehouses Active</span>
              <Warehouse className="w-4 h-4 text-[#9061F9]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">3 Locations</div>
            <div className="text-[11px] text-[#9061F9] font-mono">Ikeja • Lekki • Abuja</div>
          </NexaCard>
        </div>

        {/* LOW STOCK ALERTS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[var(--nexa-text-primary)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#E02424]" />
              Critical Reorder Alerts
            </h2>
            <Link href="/erp/admin/inventory/suppliers" className="text-xs text-[#1A56DB] font-bold hover:underline flex items-center gap-1">
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
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Current Stock</th>
                  <th className="py-3 px-3">Min Level</th>
                  <th className="py-3 px-3">Unit Cost</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
                {lowStockAlerts.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold">{item.name}</div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] font-mono">{item.id}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <NexaBadge variant="purple" className="text-[9px]">{item.category}</NexaBadge>
                    </td>
                    <td className="py-3.5 px-3 text-[var(--nexa-text-secondary)]">{item.warehouse}</td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-[#E02424] font-mono">{item.currentStock} Units</span>
                    </td>
                    <td className="py-3.5 px-3 text-[var(--nexa-text-muted)] font-mono">{item.minStock} Units</td>
                    <td className="py-3.5 px-3 font-bold font-mono">{item.unitCost}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/erp/admin/inventory/suppliers?item=${item.id}`}>
                        <NexaButton size="sm" variant="primary" className="bg-[#E02424] text-white hover:bg-[#C81E1E]">
                          Reorder Now
                        </NexaButton>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* QUICK IMS SHORTCUTS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/erp/admin/inventory/items" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#1A56DB] transition-all">
              <Package className="w-5 h-5 text-[#1A56DB]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">SKU Item Catalog</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Manage 142 SKUs, barcodes, and cost markups.</p>
            </NexaCard>
          </Link>

          <Link href="/erp/admin/inventory/warehouses" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#0E9F6E] transition-all">
              <Warehouse className="w-5 h-5 text-[#0E9F6E]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Warehouse Bins</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Aisle, rack, and bin storage allocations.</p>
            </NexaCard>
          </Link>

          <Link href="/erp/admin/inventory/transfers" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#9061F9] transition-all">
              <Truck className="w-5 h-5 text-[#9061F9]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Branch Transfers</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Dispatch and GRN receipt between branches.</p>
            </NexaCard>
          </Link>

          <Link href="/erp/admin/inventory/adjustments" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#F59E0B] transition-all">
              <RefreshCw className="w-5 h-5 text-[#F59E0B]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Stock Audit & Shrinkage</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Physical variance audit write-offs.</p>
            </NexaCard>
          </Link>
        </div>
      </div>
    </BusinessShell>
  );
}
