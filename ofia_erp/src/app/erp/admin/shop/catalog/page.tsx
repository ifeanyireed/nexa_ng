"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  Eye,
  Edit,
  Trash2,
  Sliders,
  Store,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { Pagination } from "@/components/nexa/Pagination";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";
import {
  VERTICAL_DEFINITIONS,
  detectTenantVertical,
  CommerceProductItem,
  VerticalKey,
} from "@/lib/verticals";

export default function CatalogManagementPage() {
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);
  const verticalKey = detectTenantVertical(activeTenant?.slug, activeTenant?.name);
  const verticalDef = VERTICAL_DEFINITIONS[verticalKey];

  const [selectedVertical, setSelectedVertical] = useState<VerticalKey>(verticalKey);
  const currentVerticalDef = VERTICAL_DEFINITIONS[selectedVertical];

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Initial vertical-tailored catalog items
  const [products, setProducts] = useState<CommerceProductItem[]>([
    {
      id: "PROD-001",
      name: selectedVertical === "cars"
        ? "Toyota Land Cruiser 300 VXR 3.5L V6 Twin-Turbo"
        : selectedVertical === "food"
        ? "Smoked Seafood Jollof Feast Bowl"
        : selectedVertical === "fashion"
        ? "Raw Silk Agbada with Hand-Stitched Embroidery"
        : selectedVertical === "pharmacy"
        ? "Artemether + Lumefantrine 80/480mg High-Potency"
        : selectedVertical === "hardware"
        ? "Felicity 5kVA 48V Pure Sine Wave Solar Inverter"
        : "Executive Wireless Noise-Cancelling Headset Pro",
      price: selectedVertical === "cars" ? 185000000 : selectedVertical === "hardware" ? 485000 : 12500,
      formattedPrice: selectedVertical === "cars" ? "₦185,000,000" : selectedVertical === "hardware" ? "₦485,000" : "₦12,500",
      category: selectedVertical === "cars" ? "Luxury SUVs" : selectedVertical === "food" ? "Chef Specials" : "Featured",
      stock: 4,
      image: "https://res.cloudinary.com/ihfqdysu/image/upload/v1790736847/ofia_ng_assets/emfgp9dinkhpkaevpnsx.png",
      vertical: selectedVertical,
      sku: "SKU-AUTO-01",
      status: "ACTIVE",
      attributes: {
        condition: "Brand New (0km)",
        year: 2024,
        mileage: 0,
        fuel: "Petrol V6",
        prepTime: 20,
        sizes: "M, L, XL",
      },
    },
    {
      id: "PROD-002",
      name: selectedVertical === "cars"
        ? "Mercedes-Benz GLE 450 4MATIC AMG Line"
        : selectedVertical === "food"
        ? "Charcoal-Grilled Peppered Chicken Platter"
        : selectedVertical === "fashion"
        ? "Structured Double-Breasted Wool Blazer"
        : selectedVertical === "pharmacy"
        ? "Multivitamin & Zinc Immune Support Syrup 200ml"
        : selectedVertical === "hardware"
        ? "100Ah 51.2V LiFePO4 Lithium Wall-Mount Battery"
        : "Ultra-Fast 65W GaN Dual USB-C Charger",
      price: selectedVertical === "cars" ? 120000000 : selectedVertical === "hardware" ? 1250000 : 8500,
      formattedPrice: selectedVertical === "cars" ? "₦120,000,000" : selectedVertical === "hardware" ? "₦1,250,000" : "₦8,500",
      category: selectedVertical === "cars" ? "Executive Sedans" : selectedVertical === "food" ? "Appetizers" : "Standard",
      stock: 2,
      image: "https://res.cloudinary.com/ihfqdysu/image/upload/v1790736847/ofia_ng_assets/emfgp9dinkhpkaevpnsx.png",
      vertical: selectedVertical,
      sku: "SKU-AUTO-02",
      status: "ACTIVE",
      attributes: {
        condition: "Foreign Used (Tokunbo)",
        year: 2022,
        mileage: 28000,
      },
    },
    {
      id: "PROD-003",
      name: selectedVertical === "cars"
        ? "Lexus RX 350 F-Sport AWD Panoramic"
        : selectedVertical === "food"
        ? "Slow-Cooked Goat Meat Asun Special"
        : selectedVertical === "fashion"
        ? "Italian Leather Chelsea Ankle Boots"
        : selectedVertical === "pharmacy"
        ? "Blood Glucose Monitoring Device Kit + 50 Strips"
        : selectedVertical === "hardware"
        ? "550W Mono PERC Half-Cell Solar Panel Tier-1"
        : "Mechanical Gaming Keyboard RGB Backlit",
      price: selectedVertical === "cars" ? 78000000 : selectedVertical === "hardware" ? 115000 : 92000,
      formattedPrice: selectedVertical === "cars" ? "₦78,000,000" : selectedVertical === "hardware" ? "₦115,000" : "₦92,000",
      category: selectedVertical === "cars" ? "Crossover SUVs" : selectedVertical === "food" ? "Grills" : "Accessories",
      stock: 1,
      image: "https://res.cloudinary.com/ihfqdysu/image/upload/v1790736847/ofia_ng_assets/emfgp9dinkhpkaevpnsx.png",
      vertical: selectedVertical,
      sku: "SKU-AUTO-03",
      status: "LOW_STOCK",
      attributes: {
        condition: "Locally Pre-Owned",
        year: 2021,
        mileage: 45000,
      },
    },
  ]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [products]);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <BusinessShell
      title={`${currentVerticalDef.name} — Catalog & Listings`}
      subtitle={`Manage ${currentVerticalDef.productTermPlural.toLowerCase()}, vertical attributes, inventory availability, and storefront presentation.`}
      action={
        <div className="flex items-center gap-2">
          {/* Vertical Switcher Pill Dropdown */}
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

          <Link
            href={`/erp/admin/shop/store`}
            className="p-2 rounded-full border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] transition-colors"
            title="Preview Storefront"
          >
            <Eye className="w-4 h-4 text-[#1A56DB]" />
          </Link>

          <NexaButton
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-[#1A56DB] text-white rounded-full font-bold shadow-xs"
            onClick={() => alert(`Open dynamic add modal for ${currentVerticalDef.productTerm}`)}
          >
            Add {currentVerticalDef.productTerm}
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-8">
        {/* TOP KPI CARDS */}
        <ErpStatGrid
          stats={[
            {
              label: `Total ${currentVerticalDef.productTermPlural}`,
              value: `${products.length} Active`,
              change: "100% In Catalog",
              trend: "up",
              icon: <Package className="w-5 h-5 text-blue-500" />,
              sub: "Ready for storefront display",
            },
            {
              label: "Inventory Units",
              value: `${products.reduce((acc, p) => acc + p.stock, 0)} Units`,
              change: "POS & Web Synced",
              trend: "neutral",
              icon: <Boxes className="w-5 h-5 text-emerald-500" />,
              sub: "Physical stock on hand",
            },
            {
              label: "Vertical Schema",
              value: currentVerticalDef.badge,
              change: `${currentVerticalDef.attributeFields.length} Custom Fields`,
              trend: "up",
              icon: <Sliders className="w-5 h-5 text-purple-500" />,
              sub: currentVerticalDef.tagline,
            },
            {
              label: "Live Storefront Route",
              value: currentVerticalDef.storefrontPath,
              change: "Customer Facing",
              trend: "up",
              icon: <ExternalLink className="w-5 h-5 text-amber-500" />,
              sub: "Blueprint Section 3 Template",
            },
          ]}
        />

        {/* CATALOG TABLE CARD */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 rounded-3xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-[var(--nexa-border)]">
            <div>
              <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                {currentVerticalDef.productTermPlural} Directory
              </h3>
              <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                {currentVerticalDef.tagline}
              </p>
            </div>

            {/* Search & Category Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[var(--nexa-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${currentVerticalDef.productTermPlural.toLowerCase()}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-medium rounded-full text-xs outline-none focus:border-[#1A56DB] transition-all w-48 sm:w-60"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-bold rounded-full text-xs outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--nexa-border)] text-[var(--nexa-text-muted)]">
                  <th className="pb-3 px-3 font-bold uppercase tracking-wider">{currentVerticalDef.productTerm}</th>
                  <th className="pb-3 px-3 font-bold uppercase tracking-wider">Category</th>
                  <th className="pb-3 px-3 font-bold uppercase tracking-wider">Price</th>
                  <th className="pb-3 px-3 font-bold uppercase tracking-wider">Stock</th>
                  <th className="pb-3 px-3 font-bold uppercase tracking-wider">Vertical Attributes</th>
                  <th className="pb-3 px-3 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-medium">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-center font-bold text-xs text-[#1A56DB]">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[var(--nexa-text-primary)]">{item.name}</div>
                          <div className="text-[10px] text-[var(--nexa-text-muted)] font-mono">{item.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-[var(--nexa-text-secondary)]">{item.category}</td>
                    <td className="py-3 px-3 font-bold text-[#1A56DB]">{item.formattedPrice}</td>
                    <td className="py-3 px-3">
                      <NexaBadge variant={item.stock > 2 ? "green" : "amber"} size="sm" className="rounded-full">
                        {item.stock} in stock
                      </NexaBadge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(item.attributes).map(([k, v]) => (
                          <span
                            key={k}
                            className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-secondary)]"
                          >
                            {k}: {String(v)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <NexaButton size="sm" variant="outline" className="rounded-full text-xs h-7">
                          Edit
                        </NexaButton>
                        <NexaButton size="sm" variant="outline" className="rounded-full text-xs h-7 text-rose-500 hover:border-red-500">
                          Delete
                        </NexaButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NexaCard>
      </div>
    </BusinessShell>
  );
}
