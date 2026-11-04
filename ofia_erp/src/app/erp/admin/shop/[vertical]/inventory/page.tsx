"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Boxes,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Warehouse,
  Truck,
  RotateCcw,
  Sliders,
  DollarSign,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaModal } from "@/components/nexa/NexaModal";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";
import {
  VERTICAL_DEFINITIONS,
  getDefaultProductsForVertical,
  CommerceProductItem,
  VerticalKey,
} from "@/lib/verticals";

interface InventoryRow {
  id: string;
  sku: string;
  name: string;
  category: string;
  warehouse: string;
  currentStock: number;
  minStock: number;
  unitCost: number;
  unitPrice: number;
  status: "OPTIMAL" | "LOW" | "DEPLETED";
}

export default function VerticalInventoryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);

  const rawVertical = (params?.vertical as string) || "fashion";
  const verticalKey: VerticalKey = (rawVertical in VERTICAL_DEFINITIONS ? rawVertical : "fashion") as VerticalKey;
  const currentVerticalDef = VERTICAL_DEFINITIONS[verticalKey] || VERTICAL_DEFINITIONS.fashion;

  // Tenant vertical enforcement: strictly lock tenant to their provisioned vertical
  React.useEffect(() => {
    if (activeTenant?.vertical && activeTenant.vertical in VERTICAL_DEFINITIONS && activeTenant.vertical !== verticalKey) {
      router.replace(`/erp/admin/shop/${activeTenant.vertical}/inventory`);
    }
  }, [activeTenant?.vertical, verticalKey, router]);

  const initialRows: InventoryRow[] = useMemo(() => {
    const products = getDefaultProductsForVertical(verticalKey);
    const depots = ["Ikeja Central Hub", "Lekki Distribution Depot", "Abuja Regional Facility"];
    return products.map((p, idx) => {
      const stock = p.stock || 15;
      const minStock = 5;
      return {
        id: p.id,
        sku: p.sku || `SKU-${verticalKey.toUpperCase().slice(0, 3)}-${idx + 101}`,
        name: p.name,
        category: p.category,
        warehouse: depots[idx % depots.length],
        currentStock: stock,
        minStock,
        unitCost: Math.round(p.price * 0.65),
        unitPrice: p.price,
        status: stock === 0 ? "DEPLETED" : stock <= minStock ? "LOW" : "OPTIMAL",
      };
    });
  }, [verticalKey]);

  const [rows, setRows] = useState<InventoryRow[]>(initialRows);
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("ALL");
  const [adjustingItem, setAdjustingItem] = useState<InventoryRow | null>(null);
  const [adjustmentDelta, setAdjustmentDelta] = useState("5");
  const [adjustmentType, setAdjustmentType] = useState<"ADD" | "REMOVE">("ADD");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);

  const fetchInventory = React.useCallback(async () => {
    const slug = activeTenant?.slug || "neweratransports";
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/erp/shop/inventory?tenant=${encodeURIComponent(slug)}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (data && Array.isArray(data.inventory) && data.inventory.length > 0) {
        const mapped: InventoryRow[] = data.inventory.map((i: any) => ({
          id: i.id || i.productId,
          sku: i.sku,
          name: i.productName,
          category: i.category || "General",
          warehouse: i.warehouse || "Ikeja Central Hub",
          currentStock: Number(i.currentStock) || 0,
          minStock: Number(i.minStock) || 5,
          unitCost: Number(i.unitCost) || Math.round((Number(i.unitPrice) || 0) * 0.65),
          unitPrice: Number(i.unitPrice) || 0,
          status:
            Number(i.currentStock) === 0
              ? "DEPLETED"
              : Number(i.currentStock) <= (Number(i.minStock) || 5)
              ? "LOW"
              : "OPTIMAL",
        }));
        setRows(mapped);
      }
    } catch {
      // Keep existing rows
    } finally {
      setIsRefreshing(false);
    }
  }, [activeTenant?.slug]);

  React.useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const warehouses = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => set.add(r.warehouse));
    return ["ALL", ...Array.from(set)];
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.sku.toLowerCase().includes(search.toLowerCase());
      const matchWh = warehouseFilter === "ALL" || r.warehouse === warehouseFilter;
      return matchSearch && matchWh;
    });
  }, [rows, search, warehouseFilter]);

  const totalValuation = useMemo(() => {
    return rows.reduce((sum, r) => sum + r.currentStock * r.unitCost, 0);
  }, [rows]);

  const lowStockCount = useMemo(() => {
    return rows.filter((r) => r.status === "LOW" || r.status === "DEPLETED").length;
  }, [rows]);

  const handleApplyAdjustment = async () => {
    if (!adjustingItem) return;
    const delta = parseInt(adjustmentDelta) || 0;
    const modifier = adjustmentType === "ADD" ? delta : -delta;
    const slug = activeTenant?.slug || "neweratransports";

    // Optimistic UI update
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === adjustingItem.id) {
          const newStock = Math.max(0, r.currentStock + modifier);
          const newStatus =
            newStock === 0 ? "DEPLETED" : newStock <= r.minStock ? "LOW" : "OPTIMAL";
          return {
            ...r,
            currentStock: newStock,
            status: newStatus,
          };
        }
        return r;
      })
    );

    setIsAdjusting(true);
    try {
      await fetch("/api/erp/shop/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          sku: adjustingItem.sku,
          quantity: modifier,
        }),
      });
      fetchInventory();
    } catch (err) {
      console.warn("Inventory adjustment sync warning:", err);
    } finally {
      setIsAdjusting(false);
      setAdjustingItem(null);
    }
  };

  return (
    <BusinessShell
      title={`${currentVerticalDef.name} — Inventory (IMS)`}
      subtitle={`Multi-warehouse stock control, transfer orders, and low threshold reconciliation for ${currentVerticalDef.name.toLowerCase()}.`}
      activeModule="shop"
      action={
        <div className="flex items-center gap-2">
          <NexaBadge variant="brand" size="sm" className="rounded-full">
            {currentVerticalDef.name}
          </NexaBadge>

          <NexaButton
            size="sm"
            variant="outline"
            onClick={fetchInventory}
            disabled={isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />}
            className="rounded-full"
          >
            {isRefreshing ? "Syncing..." : "Sync Stock"}
          </NexaButton>

          <Link href={`/erp/admin/shop/${verticalKey}/catalog`}>
            <NexaButton size="sm" variant="outline" className="rounded-full">
              Manage Catalog
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI CARDS */}
        <ErpStatGrid
          stats={[
            {
              label: `${currentVerticalDef.name} Stock Valuation`,
              value: `₦${totalValuation.toLocaleString()}`,
              change: "Cost Basis",
              trend: "up",
              icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
              sub: "Asset valuation across depots",
            },
            {
              label: "Tracked SKU Items",
              value: `${rows.length} Active SKUs`,
              change: currentVerticalDef.badge,
              trend: "up",
              icon: <Boxes className="w-5 h-5 text-blue-500" />,
              sub: `${currentVerticalDef.name} inventory matrix`,
            },
            {
              label: "Low Stock Warnings",
              value: `${lowStockCount} Items`,
              change: "Action Required",
              trend: "down",
              icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
              sub: "Below safety buffer",
            },
            {
              label: "Active Regional Depots",
              value: "3 Depots",
              change: "Ikeja / Lekki / Abuja",
              trend: "neutral",
              icon: <Warehouse className="w-5 h-5 text-purple-500" />,
              sub: "Multi-location distribution",
            },
          ]}
        />

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--nexa-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${currentVerticalDef.productTermPlural.toLowerCase()}...`}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-[var(--nexa-text-muted)]">Depot:</span>
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="px-3 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-bold text-[var(--nexa-text-primary)] outline-none cursor-pointer"
            >
              {warehouses.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* INVENTORY TABLE */}
        <NexaCard variant="glass" padding="none" className="rounded-3xl border border-[var(--nexa-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-muted)] uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="p-4">SKU / Item</th>
                  <th className="p-4">Depot Location</th>
                  <th className="p-4">In Stock</th>
                  <th className="p-4">Buffer Threshold</th>
                  <th className="p-4">Unit Cost</th>
                  <th className="p-4">Health Status</th>
                  <th className="p-4 text-right">Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)]">
                {filteredRows.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--nexa-bg-surface)]/50 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-[var(--nexa-text-primary)] block">{r.name}</span>
                      <span className="text-[10px] text-[var(--nexa-text-muted)] font-mono">{r.sku} · {r.category}</span>
                    </td>
                    <td className="p-4 font-medium text-[var(--nexa-text-secondary)]">
                      {r.warehouse}
                    </td>
                    <td className="p-4 font-mono font-bold text-sm text-[var(--nexa-text-primary)]">
                      {r.currentStock} Units
                    </td>
                    <td className="p-4 font-mono text-[var(--nexa-text-muted)]">
                      Min {r.minStock} Units
                    </td>
                    <td className="p-4 font-mono text-[var(--nexa-text-secondary)]">
                      ₦{r.unitCost.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <NexaBadge
                        variant={
                          r.status === "OPTIMAL"
                            ? "green"
                            : r.status === "LOW"
                            ? "amber"
                            : "rose"
                        }
                        size="sm"
                        className="rounded-full text-[10px]"
                      >
                        {r.status}
                      </NexaBadge>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setAdjustingItem(r)}
                        className="px-2.5 py-1 rounded-full bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-blue-500 text-xs font-bold text-[var(--nexa-text-primary)] transition-colors cursor-pointer"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NexaCard>
      </div>

      {/* ADJUST STOCK MODAL */}
      <NexaModal
        isOpen={Boolean(adjustingItem)}
        onClose={() => setAdjustingItem(null)}
        title="Adjust Inventory Count"
        subtitle={`Update physical stock quantity for ${adjustingItem?.name} (${adjustingItem?.warehouse})`}
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAdjustmentType("ADD")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                adjustmentType === "ADD"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)]"
              }`}
            >
              + Inbound Shipment
            </button>
            <button
              type="button"
              onClick={() => setAdjustmentType("REMOVE")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                adjustmentType === "REMOVE"
                  ? "bg-rose-600 text-white border-rose-600"
                  : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)]"
              }`}
            >
              - Shrinkage / Return
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
              Quantity to {adjustmentType === "ADD" ? "Add" : "Deduct"}
            </label>
            <input
              type="number"
              min="1"
              value={adjustmentDelta}
              onChange={(e) => setAdjustmentDelta(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-mono font-bold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--nexa-border)]">
            <NexaButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAdjustingItem(null)}
              className="rounded-full"
            >
              Cancel
            </NexaButton>
            <NexaButton
              type="button"
              variant="primary"
              size="sm"
              onClick={handleApplyAdjustment}
              disabled={isAdjusting}
              className="rounded-full bg-[#1A56DB] text-white font-bold"
            >
              {isAdjusting ? "Applying..." : "Apply Adjustment"}
            </NexaButton>
          </div>
        </div>
      </NexaModal>
    </BusinessShell>
  );
}
