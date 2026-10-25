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
  detectTenantVertical,
  getDefaultProductsForVertical,
  CommerceProductItem,
  VerticalKey,
} from "@/lib/verticals";

function ProductImageManager({
  imageUrl,
  setImageUrl,
  images,
  setImages,
  urlInput,
  setUrlInput,
  isUploading,
  uploadError,
  onUploadFile,
  productTerm,
}: {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  urlInput: string;
  setUrlInput: (val: string) => void;
  isUploading: boolean;
  uploadError: string;
  onUploadFile: (file: File) => void;
  productTerm: string;
}) {
  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!images.includes(trimmed)) {
      setImages((prev) => [...prev, trimmed]);
    }
    if (!imageUrl) {
      setImageUrl(trimmed);
    }
    setUrlInput("");
  };

  const handleRemoveImage = (targetUrl: string) => {
    const next = images.filter((img) => img !== targetUrl);
    setImages(next);
    if (imageUrl === targetUrl) {
      setImageUrl(next[0] || "");
    }
  };

  return (
    <div className="pt-3 border-t border-[var(--nexa-border)] space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold text-[var(--nexa-text-primary)] uppercase tracking-wider block">
            {productTerm} Media & Image Slots
          </span>
          <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
            Upload cover photo and high-resolution gallery angles for your live storefront.
          </p>
        </div>
        {imageUrl ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Cover Set
          </span>
        ) : (
          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            No Photo Attached
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
        {/* Visual Primary Preview Slot */}
        <div className="sm:col-span-1">
          <div className="relative aspect-square w-full rounded-2xl border-2 border-dashed border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] overflow-hidden flex flex-col items-center justify-center group hover:border-[#1A56DB] transition-all shadow-inner">
            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt="Product preview"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(imageUrl)}
                    className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-lg cursor-pointer"
                    title="Remove primary image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/75 text-white backdrop-blur-sm">
                  Primary Cover
                </span>
              </>
            ) : (
              <div className="p-4 text-center">
                <ImageIcon className="w-8 h-8 text-[var(--nexa-text-muted)] mx-auto mb-1.5 opacity-40" />
                <span className="text-[11px] font-bold text-[var(--nexa-text-secondary)] block">
                  Image Slot Empty
                </span>
                <span className="text-[9px] text-[var(--nexa-text-muted)] block mt-0.5">
                  Browse file or paste link
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Upload Controls & URL input */}
        <div className="sm:col-span-2 space-y-3">
          {/* File Upload Option */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--nexa-text-primary)] mb-1">
              Upload from Device
            </label>
            <div className="flex items-center gap-2.5">
              <label
                className={`cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  isUploading
                    ? "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-muted)] cursor-not-allowed"
                    : "bg-[#1A56DB] hover:bg-blue-700 text-white border-blue-600 shadow-sm"
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading Photo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Image File</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUploadFile(file);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </label>
              <span className="text-[10px] text-[var(--nexa-text-muted)] font-medium">
                JPG, PNG, WEBP (Max 8MB)
              </span>
            </div>
            {uploadError && (
              <p className="text-[10px] text-rose-500 font-semibold mt-1">
                {uploadError}
              </p>
            )}
          </div>

          {/* Web URL Option */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--nexa-text-primary)] mb-1">
              Or Paste Web Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-... or upload from device"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-mono"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                disabled={!urlInput.trim()}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] hover:border-[#1A56DB] text-[var(--nexa-text-primary)] disabled:opacity-40 transition-colors cursor-pointer"
              >
                Attach
              </button>
              <label
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isUploading
                    ? "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-muted)] cursor-not-allowed"
                    : "bg-[#1A56DB] hover:bg-blue-700 text-white border-blue-600 shadow-sm"
                }`}
                title="Upload image from device to tenant Cloudinary storage"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{isUploading ? "Uploading..." : "Upload File"}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUploadFile(file);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Gallery Slots */}
          {images.length > 0 && (
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider">
                  Gallery Slots ({images.length}) · Click any slot to set as cover
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {images.map((imgUrl, i) => (
                  <div
                    key={i}
                    className={`relative w-12 h-12 rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
                      imageUrl === imgUrl
                        ? "border-[#1A56DB] ring-2 ring-blue-500/40 scale-105 shadow-md"
                        : "border-[var(--nexa-border)] opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setImageUrl(imgUrl)}
                    title="Click to set as primary cover"
                  >
                    <img
                      src={imgUrl}
                      alt={`Gallery slot ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(imgUrl);
                      }}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
                      title="Delete image slot"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initial vertical-tailored catalog items
  const [products, setProducts] = useState<CommerceProductItem[]>(() =>
    getDefaultProductsForVertical(provisionedVertical)
  );

  // Load products from dedicated database / live sync API
  const loadLiveProducts = async (slug?: string, vert?: VerticalKey) => {
    const targetSlug = (slug || activeTenant?.slug || "").toLowerCase().trim();
    if (!targetSlug) return;
    const targetVert = vert || selectedVertical;
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/erp/shop/products?tenant=${encodeURIComponent(targetSlug)}&vertical=${encodeURIComponent(targetVert)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          return;
        }
      }
      setProducts(getDefaultProductsForVertical(targetVert));
    } catch (err) {
      console.warn("Failed to load live ERP products, falling back to seeds:", err);
      setProducts(getDefaultProductsForVertical(targetVert));
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch products dynamically when vertical or active tenant switches
  React.useEffect(() => {
    if (activeTenant?.slug) {
      loadLiveProducts(activeTenant.slug, selectedVertical);
    }
    setSelectedCategory("ALL");
  }, [selectedVertical, activeTenant?.slug]);

  // Modal State for adding new vertical item
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newStock, setNewStock] = useState("5");
  const [newSku, setNewSku] = useState("");
  const [newAttributes, setNewAttributes] = useState<Record<string, any>>({});
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newUrlInput, setNewUrlInput] = useState("");
  const [isUploadingNewImage, setIsUploadingNewImage] = useState(false);
  const [addUploadError, setAddUploadError] = useState("");

  // Modal State for editing item
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CommerceProductItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editStock, setEditStock] = useState("5");
  const [editSku, setEditSku] = useState("");
  const [editAttributes, setEditAttributes] = useState<Record<string, any>>({});
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editUrlInput, setEditUrlInput] = useState("");
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);
  const [editUploadError, setEditUploadError] = useState("");

  const uploadProductImage = async (
    file: File,
    onSuccess: (url: string) => void,
    setLoading: (loading: boolean) => void,
    setError: (error: string) => void
  ) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("Image file exceeds 8MB limit.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result;
          let currentTenant = activeTenant?.slug || activeTenant?.id || "";
          if (!currentTenant && typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            currentTenant = params.get("tenant") || "";
          }

          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: base64Image,
              tenantId: currentTenant,
              tenantSlug: currentTenant,
            }),
          });
          const data = await res.json();
          if (res.ok && data.url) {
            onSuccess(data.url);
          } else {
            setError(data.error || "Upload failed. Please check connection or enter image URL directly.");
          }
        } catch (uploadErr: any) {
          setError(uploadErr.message || "Failed to upload image.");
        } finally {
          setLoading(false);
        }
      };
    } catch (err: any) {
      setError(err.message || "Failed to process image file.");
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setNewName("");
    setNewPrice("");
    setNewCategory(categories[0] || "General");
    setNewStock("5");
    setNewSku(`SKU-${selectedVertical.toUpperCase().slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`);
    setNewAttributes({});
    setNewImageUrl("");
    setNewImages([]);
    setNewUrlInput("");
    setAddUploadError("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item: CommerceProductItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditCategory(item.category);
    setEditStock(String(item.stock));
    setEditSku(item.sku);
    setEditAttributes(item.attributes || {});
    const existingImages = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : (item.image ? [item.image] : []);
    setEditImages(existingImages);
    setEditImageUrl(item.image || existingImages[0] || "");
    setEditUrlInput("");
    setEditUploadError("");
    setIsEditModalOpen(true);
  };

  const handleSaveNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;

    const targetSlug = (activeTenant?.slug || "").toLowerCase().trim();
    if (!targetSlug) return;

    const numPrice = parseFloat(newPrice.replace(/[^0-9.]/g, "")) || 0;
    const finalImages = newImages.length > 0
      ? newImages
      : (newImageUrl.trim() ? [newImageUrl.trim()] : []);
    const primaryImg = newImageUrl.trim() || finalImages[0] || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80";

    const newItem: CommerceProductItem = {
      id: `PROD-${Date.now().toString().slice(-6)}`,
      name: newName,
      price: numPrice,
      formattedPrice: `₦${numPrice.toLocaleString()}`,
      category: newCategory || "General",
      stock: parseInt(newStock) || 1,
      image: primaryImg,
      images: finalImages.length > 0 ? finalImages : [primaryImg],
      vertical: selectedVertical,
      sku: newSku || `SKU-${Date.now().toString().slice(-4)}`,
      status: "ACTIVE",
      attributes: newAttributes,
    };

    setIsSaving(true);
    try {
      const res = await fetch("/api/erp/shop/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newItem,
          tenantSlug: targetSlug,
        }),
      });
      if (res.ok) {
        setProducts((prev) => [newItem, ...prev]);
        setIsAddModalOpen(false);
        loadLiveProducts(targetSlug, selectedVertical);
      } else {
        setProducts((prev) => [newItem, ...prev]);
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error("Error saving product:", err);
      setProducts((prev) => [newItem, ...prev]);
      setIsAddModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editName) return;

    const targetSlug = (activeTenant?.slug || "").toLowerCase().trim();
    if (!targetSlug) return;

    const numPrice = parseFloat(editPrice.replace(/[^0-9.]/g, "")) || 0;
    const finalImages = editImages.length > 0
      ? editImages
      : (editImageUrl.trim() ? [editImageUrl.trim()] : (editingItem.images || []));
    const primaryImg = editImageUrl.trim() || finalImages[0] || editingItem.image;

    const updatedItem: CommerceProductItem = {
      ...editingItem,
      name: editName,
      price: numPrice,
      formattedPrice: `₦${numPrice.toLocaleString()}`,
      category: editCategory || "General",
      stock: parseInt(editStock) || 0,
      sku: editSku || editingItem.sku,
      image: primaryImg,
      images: finalImages.length > 0 ? finalImages : [primaryImg],
      status: (parseInt(editStock) || 0) > 0 ? "ACTIVE" : "OUT_OF_STOCK",
      attributes: editAttributes,
    };

    setIsSaving(true);
    try {
      const res = await fetch("/api/erp/shop/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedItem,
          tenantSlug: targetSlug,
        }),
      });
      if (res.ok) {
        setProducts((prev) => prev.map((p) => (p.id === updatedItem.id ? updatedItem : p)));
        setIsEditModalOpen(false);
        loadLiveProducts(targetSlug, selectedVertical);
      } else {
        setProducts((prev) => prev.map((p) => (p.id === updatedItem.id ? updatedItem : p)));
        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error("Error updating product:", err);
      setProducts((prev) => prev.map((p) => (p.id === updatedItem.id ? updatedItem : p)));
      setIsEditModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const targetSlug = (activeTenant?.slug || "").toLowerCase().trim();
    if (!targetSlug) return;
    try {
      await fetch(
        `/api/erp/shop/products?id=${encodeURIComponent(id)}&tenant=${encodeURIComponent(targetSlug)}`,
        { method: "DELETE" }
      );
      setProducts((prev) => prev.filter((p) => p.id !== id));
      loadLiveProducts(targetSlug, selectedVertical);
    } catch (err) {
      console.error("Error deleting product:", err);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
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
          {/* Live Sync button */}
          <NexaButton
            size="sm"
            variant="outline"
            onClick={() => loadLiveProducts(activeTenant?.slug, selectedVertical)}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-600" : ""}`} />}
            className="rounded-full"
          >
            {isLoading ? "Syncing..." : "Sync DB"}
          </NexaButton>

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
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                  {currentVerticalDef.productTermPlural} Directory
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Storefront Sync
                </span>
              </div>
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
                        <div className="w-10 h-10 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-center font-bold text-xs text-[#1A56DB] overflow-hidden shrink-0 shadow-sm relative">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <Package className="w-4 h-4" />
                          )}
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
                        <NexaButton
                          size="sm"
                          variant="outline"
                          className="rounded-full text-xs h-7 text-blue-600 hover:border-blue-500 cursor-pointer"
                          onClick={() => handleOpenEditModal(item)}
                          leftIcon={<Edit className="w-3 h-3" />}
                        >
                          Edit
                        </NexaButton>
                        <NexaButton
                          size="sm"
                          variant="outline"
                          className="rounded-full text-xs h-7 text-rose-500 hover:border-red-500 cursor-pointer"
                          onClick={() => handleDeleteProduct(item.id)}
                        >
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

          {/* PRODUCT IMAGE & MEDIA SLOTS */}
          <ProductImageManager
            imageUrl={newImageUrl}
            setImageUrl={setNewImageUrl}
            images={newImages}
            setImages={setNewImages}
            urlInput={newUrlInput}
            setUrlInput={setNewUrlInput}
            isUploading={isUploadingNewImage}
            uploadError={addUploadError}
            onUploadFile={(file) =>
              uploadProductImage(
                file,
                (url) => {
                  setNewImageUrl(url);
                  setNewImages((prev) => (prev.includes(url) ? prev : [url, ...prev]));
                },
                setIsUploadingNewImage,
                setAddUploadError
              )
            }
            productTerm={currentVerticalDef.productTerm}
          />

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

      {/* EDIT ITEM MODAL */}
      <NexaModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit ${editingItem?.name || currentVerticalDef.productTerm}`}
        subtitle={`Update selling price, inventory stock count, high-res photos, and attributes in dedicated database.`}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveEditProduct} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
              Product Title / Model Name *
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Selling Price (₦) *
              </label>
              <input
                type="text"
                required
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                SKU / Barcode Reference
              </label>
              <input
                type="text"
                value={editSku}
                onChange={(e) => setEditSku(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold font-mono"
              />
            </div>
          </div>

          {/* PRODUCT IMAGE & MEDIA SLOTS */}
          <ProductImageManager
            imageUrl={editImageUrl}
            setImageUrl={setEditImageUrl}
            images={editImages}
            setImages={setEditImages}
            urlInput={editUrlInput}
            setUrlInput={setEditUrlInput}
            isUploading={isUploadingEditImage}
            uploadError={editUploadError}
            onUploadFile={(file) =>
              uploadProductImage(
                file,
                (url) => {
                  setEditImageUrl(url);
                  setEditImages((prev) => (prev.includes(url) ? prev : [url, ...prev]));
                },
                setIsUploadingEditImage,
                setEditUploadError
              )
            }
            productTerm={currentVerticalDef.productTerm}
          />

          {/* DYNAMIC VERTICAL ATTRIBUTE FIELDS IN EDIT MODAL */}
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
                        value={editAttributes[field.key] || ""}
                        onChange={(e) =>
                          setEditAttributes({ ...editAttributes, [field.key]: e.target.value })
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
                          checked={!!editAttributes[field.key]}
                          onChange={(e) =>
                            setEditAttributes({ ...editAttributes, [field.key]: e.target.checked })
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
                        value={editAttributes[field.key] || ""}
                        onChange={(e) =>
                          setEditAttributes({ ...editAttributes, [field.key]: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--nexa-border)]">
            <NexaButton
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setIsEditModalOpen(false)}
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
              {isSaving ? "Saving..." : "Save Changes"}
            </NexaButton>
          </div>
        </form>
      </NexaModal>
    </BusinessShell>
  );
}
