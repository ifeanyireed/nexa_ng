"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";
import { ShopInventoryItem } from "@/lib/commerce-inventory-store";

export default function InventoryDashboardPage() {
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);

  const [activeFilter, setActiveFilter] = useState("all");
  const [inventory, setInventory] = useState<ShopInventoryItem[]>([]);
  const [valuation, setValuation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [restockingSku, setRestockingSku] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    const slug = activeTenant?.slug;
    if (!slug) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/erp/shop/inventory?tenant=${encodeURIComponent(slug)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.inventory)) {
        setInventory(data.inventory);
        setValuation(data.valuation || 0);
      }
    } catch {
      // Keep state
    } finally {
      setIsLoading(false);
    }
  }, [activeTenant?.slug]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleRestock = async (sku: string) => {
    const slug = activeTenant?.slug;
    if (!slug || restockingSku) return;
    setRestockingSku(sku);
    try {
      const res = await fetch("/api/erp/shop/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku, tenantSlug: slug, quantity: 10 }),
      });
      if (res.ok) {
        fetchInventory();
      }
    } catch {
      // Error
    } finally {
      setRestockingSku(null);
    }
  };

  const lowStockAlerts = inventory.filter(
    (i) => i.currentStock <= i.minStock || i.status === "LOW_STOCK" || i.status === "OUT_OF_STOCK"
  );

  const displayedItems = activeFilter === "alerts" ? lowStockAlerts : inventory;

  return (
    <BusinessShell
      title={`Inventory Management System (IMS)${activeTenant?.name ? ` — ${activeTenant.name}` : ""}`}
      subtitle="Real-time multi-warehouse stock monitoring, asset valuation, barcode SKUs, and restock forecasting backed by PostgreSQL."
      action={
        <div className="flex items-center gap-2.5">
          <NexaButton
            size="sm"
            variant="outline"
            onClick={fetchInventory}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-600" : ""}`} />}
          >
            Refresh Stock
          </NexaButton>
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
        {/* TOP 4 KPI CARDS */}
        <ErpStatGrid
          stats={[
            {
              label: "Stock Valuation (IMS)",
              value: valuation > 0 ? `₦${(valuation / 1000000).toFixed(2)}M` : "₦0.00",
              change: activeTenant?.slug ? `${activeTenant.slug}` : "Live Tenant",
              trend: "up",
              icon: <Boxes className="w-5 h-5 text-emerald-500" />,
              sub: `${inventory.length} Active SKUs in Lakebase`,
            },
            {
              label: "Low Stock Warnings",
              value: `${lowStockAlerts.length} SKUs Alert`,
              change: lowStockAlerts.length > 0 ? "Action Needed" : "Optimal",
              changeType: lowStockAlerts.length > 0 ? "danger" : "neutral",
              trend: lowStockAlerts.length > 0 ? "up" : "down",
              icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
              sub: "Below safety threshold",
            },
            {
              label: "Stock Turnover Rate",
              value: "6.4x / year",
              change: "+18% velocity",
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
              sub: "Ikeja • Lekki • Showroom",
            },
          ]}
        />

        {/* LOW STOCK & INVENTORY TABLE */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-black text-[var(--nexa-text-primary)] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E02424]" />
                Live Stock & Reorder Stream
              </h2>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-2.5 py-1 rounded-full font-bold transition-colors ${
                    activeFilter === "all"
                      ? "bg-zinc-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  All Items ({inventory.length})
                </button>
                <button
                  onClick={() => setActiveFilter("alerts")}
                  className={`px-2.5 py-1 rounded-full font-bold transition-colors ${
                    activeFilter === "alerts"
                      ? "bg-red-600 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Critical Alerts ({lowStockAlerts.length})
                </button>
              </div>
            </div>

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
                {displayedItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-stone-500 text-xs">
                      {isLoading ? "Loading inventory from Lakebase PostgreSQL..." : "No inventory items registered for this tenant yet."}
                    </td>
                  </tr>
                ) : (
                  displayedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-xs">{item.productName}</div>
                        <div className="font-mono text-[10px] text-[var(--nexa-text-muted)]">{item.sku}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <NexaBadge variant="neutral">{item.category}</NexaBadge>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`font-black px-2 py-0.5 rounded-full border text-[11px] ${
                            item.currentStock === 0
                              ? "text-red-700 bg-red-100 border-red-300"
                              : item.currentStock <= item.minStock
                              ? "text-amber-700 bg-amber-100 border-amber-300"
                              : "text-emerald-700 bg-emerald-100 border-emerald-300"
                          }`}
                        >
                          {item.currentStock} Units Left
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[var(--nexa-text-muted)]">{item.minStock} Units</td>
                      <td className="py-3.5 px-3 text-xs">{item.warehouse}</td>
                      <td className="py-3.5 px-3 text-xs text-[var(--nexa-text-muted)]">{item.supplier}</td>
                      <td className="py-3.5 px-3 font-bold text-xs">₦{Number(item.unitCost).toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleRestock(item.sku)}
                          disabled={restockingSku === item.sku}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors disabled:opacity-50"
                        >
                          {restockingSku === item.sku ? "Restocking..." : "+10 Restock"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
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
