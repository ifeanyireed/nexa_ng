"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Loader2,
  X,
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
  getDefaultProductsForVertical,
  CommerceProductItem,
  VerticalKey,
} from "@/lib/verticals";

export default function VerticalCatalogPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);

  const rawVertical = (params?.vertical as string) || "fashion";
  const verticalKey: VerticalKey = (rawVertical in VERTICAL_DEFINITIONS ? rawVertical : "fashion") as VerticalKey;
  const currentVerticalDef = VERTICAL_DEFINITIONS[verticalKey] || VERTICAL_DEFINITIONS.fashion;

  // Tenant vertical enforcement: strictly lock tenant to their provisioned vertical
  useEffect(() => {
    if (activeTenant?.vertical && activeTenant.vertical in VERTICAL_DEFINITIONS && activeTenant.vertical !== verticalKey) {
      router.replace(`/erp/admin/shop/${activeTenant.vertical}/catalog`);
    }
  }, [activeTenant?.vertical, verticalKey, router]);

  const [products, setProducts] = useState<CommerceProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add / Edit Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CommerceProductItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [formStock, setFormStock] = useState("10");
  const [formSku, setFormSku] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formAttributes, setFormAttributes] = useState<Record<string, any>>({});

  const loadProducts = useCallback(async () => {
    const slug = activeTenant?.slug || "neweratransports";
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/erp/shop/products?tenant=${encodeURIComponent(slug)}&vertical=${encodeURIComponent(verticalKey)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          setIsLoading(false);
          return;
        }
      }
      setProducts(getDefaultProductsForVertical(verticalKey));
    } catch {
      setProducts(getDefaultProductsForVertical(verticalKey));
    } finally {
      setIsLoading(false);
    }
  }, [activeTenant?.slug, verticalKey]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleOpenAddModal = () => {
    setFormName("");
    setFormPrice("");
    setFormCategory("General");
    setFormStock("10");
    setFormSku(`SKU-${verticalKey.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`);
    setFormImage("");
    const initAttrs: Record<string, any> = {};
    currentVerticalDef.attributeFields.forEach((field) => {
      initAttrs[field.key] = field.type === "boolean" ? true : "";
    });
    setFormAttributes(initAttrs);
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    const slug = activeTenant?.slug || "neweratransports";
    const numPrice = parseFloat(formPrice.replace(/[^0-9.]/g, "")) || 0;
    setIsSaving(true);

    const payload = {
      id: editingProduct?.id || `PROD-${Date.now().toString().slice(-6)}`,
      name: formName,
      price: numPrice,
      category: formCategory,
      stock: parseInt(formStock) || 0,
      sku: formSku,
      image: formImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
      vertical: verticalKey,
      tenantSlug: slug,
      status: (parseInt(formStock) || 0) > 0 ? "ACTIVE" : "OUT_OF_STOCK",
      attributes: formAttributes,
    };

    try {
      await fetch("/api/erp/shop/products", {
        method: editingProduct ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      console.error("Failed to save product:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const slug = activeTenant?.slug || "neweratransports";
    try {
      await fetch(
        `/api/erp/shop/products?id=${encodeURIComponent(id)}&tenant=${encodeURIComponent(slug)}`,
        { method: "DELETE" }
      );
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const handleOpenEdit = (product: CommerceProductItem) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(String(product.price));
    setFormCategory(product.category);
    setFormStock(String(product.stock));
    setFormSku(product.sku || "");
    setFormImage(product.image || "");
    setFormAttributes(product.attributes || {});
    setIsEditModalOpen(true);
  };

  // Filtered & Paginated items
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
      const matchCat = categoryFilter === "ALL" || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, categoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const storefrontCatalogUrl = `http://localhost:3000${currentVerticalDef.storefrontPath}${
    activeTenant?.slug ? `?tenant=${activeTenant.slug}` : ""
  }`;

  return (
    <BusinessShell
      title={`${currentVerticalDef.name} — ${currentVerticalDef.productTermPlural} Catalog`}
      subtitle={`Manage ${currentVerticalDef.name.toLowerCase()} listings, custom attributes (${currentVerticalDef.attributeFields.map(f => f.label).slice(0, 2).join(", ")}), stock counts, and live pricing.`}
      activeModule="shop"
      action={
        <div className="flex items-center gap-2">
          <NexaBadge variant="brand" size="sm" className="rounded-full">
            {currentVerticalDef.name}
          </NexaBadge>

          <NexaButton
            size="sm"
            variant="outline"
            onClick={loadProducts}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-600" : ""}`} />}
            className="rounded-full"
          >
            {isLoading ? "Syncing..." : "Sync"}
          </NexaButton>

          <a href={storefrontCatalogUrl} target="_blank" rel="noopener noreferrer">
            <NexaButton size="sm" variant="outline" leftIcon={<ExternalLink className="w-3.5 h-3.5" />} className="rounded-full">
              Live Storefront
            </NexaButton>
          </a>

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
      <div className="space-y-6">
        {/* KPI CARDS */}
        <ErpStatGrid
          stats={[
            {
              label: `Total ${currentVerticalDef.productTermPlural}`,
              value: `${products.length} Items`,
              change: currentVerticalDef.badge,
              trend: "up",
              icon: <Package className="w-5 h-5 text-blue-500" />,
              sub: "Published on storefront",
            },
            {
              label: "In Stock & Bookable",
              value: `${products.filter((p) => p.stock > 0).length} Available`,
              change: "Ready for Checkout",
              trend: "up",
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
              sub: "Active inventory units",
            },
            {
              label: "Low or Depleted Stock",
              value: `${products.filter((p) => p.stock <= 2).length} Items`,
              change: "Restock Recommended",
              trend: "down",
              icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
              sub: "Reorder triggered",
            },
            {
              label: "Vertical Specialization",
              value: currentVerticalDef.name,
              change: `${currentVerticalDef.attributeFields.length} Custom Fields`,
              trend: "neutral",
              icon: <Sliders className="w-5 h-5 text-purple-500" />,
              sub: "Tailored attribute model",
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
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={`Search ${currentVerticalDef.productTermPlural.toLowerCase()}...`}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-[var(--nexa-text-muted)]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-bold text-[var(--nexa-text-primary)] outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {paginatedProducts.length === 0 ? (
          <NexaCard variant="glass" padding="lg" className="text-center py-12 rounded-3xl border border-dashed border-[var(--nexa-border)]">
            <Package className="w-10 h-10 text-[var(--nexa-text-muted)] mx-auto mb-2 opacity-50" />
            <h4 className="font-bold text-sm text-[var(--nexa-text-primary)]">No {currentVerticalDef.productTermPlural} Found</h4>
            <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
              Add your first {currentVerticalDef.productTerm.toLowerCase()} using the button above.
            </p>
          </NexaCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((p) => (
              <div
                key={p.id}
                className="group p-4 rounded-3xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="relative aspect-square w-full rounded-2xl bg-[var(--nexa-bg-base)] overflow-hidden border border-[var(--nexa-border)]">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/75 text-white backdrop-blur-xs">
                      {p.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-[var(--nexa-text-primary)] line-clamp-1">{p.name}</h4>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] font-mono">{p.sku}</span>
                  </div>

                  {/* Vertical-specific attribute preview */}
                  {p.attributes && Object.keys(p.attributes).length > 0 && (
                    <div className="p-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[10px] text-[var(--nexa-text-secondary)] space-y-0.5">
                      {Object.entries(p.attributes)
                        .slice(0, 2)
                        .map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between">
                            <span className="text-[var(--nexa-text-muted)] capitalize">{k}:</span>
                            <span className="font-bold truncate max-w-[120px]">{String(v)}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[var(--nexa-border)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] block">Price</span>
                    <span className="font-bold text-xs text-[#1A56DB]">{p.formattedPrice}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded-lg bg-[var(--nexa-bg-base)] hover:bg-blue-500/10 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1.5 rounded-lg bg-[var(--nexa-bg-base)] hover:bg-red-500/10 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* ADD / EDIT PRODUCT MODAL WITH VERTICAL ATTRIBUTES */}
      <NexaModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        title={`${editingProduct ? "Edit" : "Create"} ${currentVerticalDef.productTerm}`}
        subtitle={`Configure listing parameters and vertical attributes for the ${currentVerticalDef.name} storefront.`}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                {currentVerticalDef.productTerm} Title *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={`e.g. Premium ${currentVerticalDef.productTerm}`}
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
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="e.g. 85000"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Initial Stock Qty *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Category
              </label>
              <input
                type="text"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                placeholder="e.g. Haute Couture, Suiting, Footwear"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                SKU / Barcode Code
              </label>
              <input
                type="text"
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Image URL (Unsplash or CDN link)
              </label>
              <input
                type="url"
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
              />
            </div>
          </div>

          {/* DYNAMIC VERTICAL-SPECIFIC ATTRIBUTES */}
          <div className="pt-3 border-t border-[var(--nexa-border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[var(--nexa-text-primary)] uppercase tracking-wider block">
                {currentVerticalDef.name} Specific Attributes
              </span>
              <NexaBadge variant="brand" size="sm" className="rounded-full">
                {currentVerticalDef.badge}
              </NexaBadge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentVerticalDef.attributeFields.map((field) => (
                <div key={field.key} className={field.type === "tags" ? "sm:col-span-2" : ""}>
                  <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                    {field.label}
                  </label>
                  {field.type === "select" && field.options ? (
                    <select
                      value={formAttributes[field.key] || ""}
                      onChange={(e) =>
                        setFormAttributes({ ...formAttributes, [field.key]: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
                    >
                      <option value="">Select option</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "boolean" ? (
                    <label className="flex items-center gap-2 text-xs font-semibold text-[var(--nexa-text-primary)] cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        checked={Boolean(formAttributes[field.key])}
                        onChange={(e) =>
                          setFormAttributes({ ...formAttributes, [field.key]: e.target.checked })
                        }
                        className="rounded accent-[#1A56DB]"
                      />
                      <span>Enable for this item</span>
                    </label>
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      value={formAttributes[field.key] || ""}
                      onChange={(e) =>
                        setFormAttributes({ ...formAttributes, [field.key]: e.target.value })
                      }
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--nexa-border)]">
            <NexaButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setEditingProduct(null);
              }}
              className="rounded-full"
            >
              Cancel
            </NexaButton>
            <NexaButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving}
              className="rounded-full bg-[#1A56DB] text-white font-bold"
            >
              {isSaving ? "Saving..." : editingProduct ? "Save Changes" : `Create ${currentVerticalDef.productTerm}`}
            </NexaButton>
          </div>
        </form>
      </NexaModal>
    </BusinessShell>
  );
}
