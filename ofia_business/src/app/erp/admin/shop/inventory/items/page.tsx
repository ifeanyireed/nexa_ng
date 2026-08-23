"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Barcode,
  Edit,
  Filter,
  Package,
  Plus,
  QrCode,
  Search,
  Trash2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";

const INVENTORY_ITEMS = [
  { id: "SKU-SOL-001", barcode: "615100984920", name: "Hybrid Solar Inverter 5kVA 48V", category: "Solar Power", costPrice: "₦420,000", sellingPrice: "₦580,000", inStock: 8, warehouse: "Ikeja Central", status: "IN_STOCK" },
  { id: "SKU-SOL-002", barcode: "615100984921", name: "Lithium LiFePO4 Battery 48V 100Ah", category: "Solar Power", costPrice: "₦850,000", sellingPrice: "₦1,150,000", inStock: 14, warehouse: "Ikeja Central", status: "IN_STOCK" },
  { id: "SKU-SEC-001", barcode: "615100984922", name: "4K IP Bullet Camera 8CH AI Face Rec", category: "Security", costPrice: "₦28,000", sellingPrice: "₦45,000", inStock: 2, warehouse: "Lekki Hub", status: "LOW_STOCK" },
  { id: "SKU-SEC-002", barcode: "615100984923", name: "NVR 16-Channel 4K POE Switch Port", category: "Security", costPrice: "₦95,000", sellingPrice: "₦140,000", inStock: 6, warehouse: "Lekki Hub", status: "IN_STOCK" },
  { id: "SKU-NET-001", barcode: "615100984924", name: "Cat6 Outdoor Shielded Cable 305m Drum", category: "Networking", costPrice: "₦45,000", sellingPrice: "₦65,000", inStock: 3, warehouse: "Abuja Depot", status: "LOW_STOCK" },
];

export default function InventoryItemsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = INVENTORY_ITEMS.filter(
    (i) =>
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.barcode.includes(searchTerm)
  );

  return (
    <BusinessShell
      title="Master SKU Catalog & Barcode Registry"
      subtitle="Configure product barcodes, cost vs selling prices, unit margins, and safety stock levels."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/shop/inventory">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Overview
            </NexaButton>
          </Link>
          <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
            Add New SKU Item
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-8">
        {/* KPI CARDS */}
        <ErpStatGrid
          stats={[
            {
              label: "Catalog SKUs",
              value: "142 Active",
              change: "+12 Added",
              sub: "All product categories",
              icon: <Package className="w-5 h-5 text-blue-500" />,
              iconBg: "bg-blue-500/10 text-blue-500",
            },
            {
              label: "Average Margin",
              value: "34.8%",
              change: "+4.2% Margin",
              sub: "Cost vs selling spread",
              icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
              iconBg: "bg-emerald-500/10 text-emerald-500",
            },
            {
              label: "Stock Reorders",
              value: "2 SKUs",
              change: "Low Stock",
              changeType: "danger",
              sub: "Below reorder threshold",
              icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
              iconBg: "bg-red-500/10 text-red-500",
            },
            {
              label: "Barcodes Scanned",
              value: "100% EAN-13",
              change: "Verified",
              sub: "Ready for POS checkout",
              icon: <Barcode className="w-5 h-5 text-purple-500" />,
              iconBg: "bg-purple-500/10 text-purple-500",
            },
          ]}
        />

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-96">
            <NexaInput
              placeholder="Search by SKU, Barcode, or Product Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="search"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <NexaBadge variant="neutral">{filteredItems.length} SKUs Listed</NexaBadge>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-semibold">
              <tr>
                <th className="py-3 px-4">SKU / Barcode</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Cost Price</th>
                <th className="py-3 px-3">Selling Price</th>
                <th className="py-3 px-3">Stock Count</th>
                <th className="py-3 px-3">Primary Location</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold font-mono text-[#1A56DB]">{item.id}</div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)] font-mono flex items-center gap-1">
                      <Barcode className="w-3 h-3" />
                      {item.barcode}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold">{item.name}</td>
                  <td className="py-3.5 px-3">
                    <NexaBadge variant="purple" className="text-[9px]">{item.category}</NexaBadge>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[var(--nexa-text-muted)]">{item.costPrice}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-[#0E9F6E]">{item.sellingPrice}</td>
                  <td className="py-3.5 px-3">
                    <NexaBadge variant={item.status === "LOW_STOCK" ? "danger" : "green"} className="text-[9px]">
                      {item.inStock} Units
                    </NexaBadge>
                  </td>
                  <td className="py-3.5 px-3 text-[var(--nexa-text-secondary)]">{item.warehouse}</td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <NexaButton size="sm" variant="ghost">
                      <Edit className="w-3.5 h-3.5" />
                    </NexaButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BusinessShell>
  );
}
