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
import { NexaModal } from "@/components/nexa/NexaModal";
import { Pagination } from "@/components/nexa/Pagination";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";
import {
  VERTICAL_DEFINITIONS,
  detectTenantVertical,
  getDefaultProductsForVertical,
  CommerceProductItem,
  VerticalKey,
} from "@/lib/verticals";

export default function CatalogManagementPage() {
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);
  const provisionedVertical = (activeTenant?.vertical as VerticalKey) || detectTenantVertical(activeTenant?.slug, activeTenant?.name);

  const [selectedVertical, setSelectedVertical] = useState<VerticalKey>(provisionedVertical);
  const currentVerticalDef = VERTICAL_DEFINITIONS[selectedVertical] || VERTICAL_DEFINITIONS.retail;

  // Strictly sync when activeTenant loads or updates
  React.useEffect(() => {
    if (activeTenant?.vertical && activeTenant.vertical in VERTICAL_DEFINITIONS) {
      setSelectedVertical(activeTenant.vertical as VerticalKey);
    }
  }, [activeTenant?.vertical]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Initial vertical-tailored catalog items
  const [products, setProducts] = useState<CommerceProductItem[]>(() =>
    getDefaultProductsForVertical(provisionedVertical)
  );

  // Re-seed products dynamically when vertical switches
  React.useEffect(() => {
    setProducts(getDefaultProductsForVertical(selectedVertical));
    setSelectedCategory("ALL");
  }, [selectedVertical]);

  // Modal State for adding new vertical item
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newStock, setNewStock] = useState("5");
  const [newSku, setNewSku] = useState("");
  const [newAttributes, setNewAttributes] = useState<Record<string, any>>({});

  const handleOpenAddModal = () => {
    setNewName("");
    setNewPrice("");
    setNewCategory(categories[0] || "General");
    setNewStock("5");
    setNewSku(`SKU-${selectedVertical.toUpperCase().slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`);
    setNewAttributes({});
    setIsAddModalOpen(true);
  };

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;

    const numPrice = parseFloat(newPrice.replace(/[^0-9.]/g, "")) || 0;
    const newItem: CommerceProductItem = {
      id: `PROD-${Date.now().toString().slice(-4)}`,
      name: newName,
      price: numPrice,
      formattedPrice: `₦${numPrice.toLocaleString()}`,
      category: newCategory || "General",
      stock: parseInt(newStock) || 1,
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
      vertical: selectedVertical,
      sku: newSku || `SKU-${Date.now().toString().slice(-4)}`,
      status: "ACTIVE",
      attributes: newAttributes,
    };

    setProducts([newItem, ...products]);
    setIsAddModalOpen(false);
  };

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
            className="bg-[#1A56DB] text-white rounded-full font-bold shadow-xs cursor-pointer"
            onClick={handleOpenAddModal}
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

      {/* DYNAMIC VERTICAL ADD ITEM MODAL */}
      <NexaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add New ${currentVerticalDef.productTerm}`}
        subtitle={`Configure standard merchandise pricing, physical stock inventory, and dynamic ${currentVerticalDef.badge} attributes.`}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveNewProduct} className="space-y-4 pt-2">
          {/* CORE FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                {currentVerticalDef.productTerm} Title / Model Name *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={`e.g. ${products[0]?.name || "Item title"}`}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Selling Price (₦) *
              </label>
              <input
                type="text"
                required
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="e.g. 150000"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Catalog Category *
              </label>
              <input
                type="text"
                required
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Featured / Executive"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Initial Physical Stock Units *
              </label>
              <input
                type="number"
                min="0"
                required
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                SKU / Barcode Reference
              </label>
              <input
                type="text"
                value={newSku}
                onChange={(e) => setNewSku(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold font-mono"
              />
            </div>
          </div>

          {/* DYNAMIC VERTICAL ATTRIBUTE FIELDS */}
          {currentVerticalDef.attributeFields.length > 0 && (
            <div className="pt-3 border-t border-[var(--nexa-border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[var(--nexa-text-primary)] uppercase tracking-wider">
                  {currentVerticalDef.badge} Attributes
                </span>
                <span className="text-[10px] text-[var(--nexa-text-muted)] font-mono">
                  Vertical: {selectedVertical}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentVerticalDef.attributeFields.map((field) => (
                  <div key={field.key} className={field.type === "tags" ? "sm:col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-[var(--nexa-text-secondary)] mb-1">
                      {field.label}
                    </label>

                    {field.type === "select" ? (
                      <select
                        value={newAttributes[field.key] || ""}
                        onChange={(e) =>
                          setNewAttributes({ ...newAttributes, [field.key]: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
                      >
                        <option value="">Select {field.label}...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "boolean" ? (
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!newAttributes[field.key]}
                          onChange={(e) =>
                            setNewAttributes({ ...newAttributes, [field.key]: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-[var(--nexa-text-primary)] font-medium">
                          Enabled / Yes
                        </span>
                      </label>
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        placeholder={field.placeholder}
                        value={newAttributes[field.key] || ""}
                        onChange={(e) =>
                          setNewAttributes({ ...newAttributes, [field.key]: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--nexa-border)]">
            <NexaButton
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </NexaButton>
            <NexaButton
              type="submit"
              variant="primary"
              size="sm"
              className="rounded-full bg-[#1A56DB] text-white font-bold"
            >
              Publish {currentVerticalDef.productTerm} to Catalog
            </NexaButton>
          </div>
        </form>
      </NexaModal>
    </BusinessShell>
  );
}
