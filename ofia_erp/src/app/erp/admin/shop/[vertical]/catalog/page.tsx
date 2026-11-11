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
  Check,
  Palette,
  ZoomIn,
  WifiOff,
  Tag,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaModal } from "@/components/nexa/NexaModal";
import { Pagination } from "@/components/nexa/Pagination";
import { ImageUploadInput } from "@/components/common/ImageUploadInput";
import { MultiImageUploadInput } from "@/components/common/MultiImageUploadInput";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";
import {
  VERTICAL_DEFINITIONS,
  getDefaultProductsForVertical,
  CommerceProductItem,
  ProductVariant,
  FabricPrint,
  AFRICAN_PRINT_PRESETS,
  VerticalKey,
  getStorefrontUrl,
  resolveColorHex,
} from "@/lib/verticals";

const AFRICAN_COLOR_PRESETS: Array<{ name: string; hex: string }> = [
  { name: "Midnight Black", hex: "#111111" },
  { name: "Emerald Green", hex: "#047857" },
  { name: "Royal Navy", hex: "#1E3A8A" },
  { name: "Terracotta Ochre", hex: "#C2410C" },
  { name: "Rich Gold", hex: "#D97706" },
  { name: "Ruby Wine", hex: "#991B1B" },
  { name: "Ivory Cream", hex: "#F8FAFC" },
  { name: "Sunset Coral", hex: "#FB7185" },
  { name: "Deep Amethyst", hex: "#581C87" },
];

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "Bespoke Cut"];

export interface CustomCategoryItem {
  id: string;
  name: string;
  description?: string;
}

export interface CustomCollectionItem {
  id: string;
  name: string;
  description?: string;
  season?: string;
  images?: string[];
}

const DEFAULT_CATEGORIES: CustomCategoryItem[] = [
  { id: "cat-1", name: "African Heritage", description: "Ceremonial textiles, hand-dyed damask, and heritage silks" },
  { id: "cat-2", name: "Haute Couture", description: "Bespoke architectural suits and structured tunics" },
  { id: "cat-3", name: "Suiting & Blazers", description: "Bespoke agbada suits, formal blazers and coats" },
  { id: "cat-4", name: "Bridal & Bespoke", description: "Royal agbadas, festive two-pieces, and wedding attire" },
  { id: "cat-5", name: "Resort Wear", description: "Breathable linen shirts, drawstring trousers, and resort slips" },
  { id: "cat-6", name: "Accessories & Wraps", description: "Headwraps, stoles, caps and artisanal accents" },
];

const DEFAULT_COLLECTIONS: CustomCollectionItem[] = [
  {
    id: "col-vida",
    name: "Vida Collection",
    season: "Harmattan / Resort 2026",
    description: "Artisanal resort silhouettes and bespoke linen tunics.",
  },
  {
    id: "col-adetola",
    name: "Adetola Collection",
    season: "Harmattan / Resort 2026",
    description: "Hand-embroidered ceremonial kaftans and agbada two-pieces.",
  },
  {
    id: "col-royal",
    name: "Royal Heritage Capsule",
    season: "Capsule Drop 2026",
    description: "Regal Aso-Oke, Brocade, and velvet statement outerwear.",
  },
];

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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [collectionFilter, setCollectionFilter] = useState("ALL");
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
  const [formStock, setFormStock] = useState("1");
  const [formSku, setFormSku] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formAttributes, setFormAttributes] = useState<Record<string, any>>({});

  // African Fashion Matrix Studio States
  const [tenantAfricanPrints, setTenantAfricanPrints] = useState<FabricPrint[]>(AFRICAN_PRINT_PRESETS);
  const [tenantCategories, setTenantCategories] = useState<string[]>([]);
  const [tenantCategoriesList, setTenantCategoriesList] = useState<CustomCategoryItem[]>(DEFAULT_CATEGORIES);
  const [tenantCollectionsList, setTenantCollectionsList] = useState<CustomCollectionItem[]>(DEFAULT_COLLECTIONS);
  const [formCollection, setFormCollection] = useState("Vida Collection");

  // Category inline & modal edit states
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [editingCategory, setEditingCategory] = useState<CustomCategoryItem | null>(null);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [catEditName, setCatEditName] = useState("");
  const [catEditDesc, setCatEditDesc] = useState("");

  // Collection inline & modal edit states
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionSeason, setNewCollectionSeason] = useState("");
  const [editingCollection, setEditingCollection] = useState<CustomCollectionItem | null>(null);
  const [isEditCollectionModalOpen, setIsEditCollectionModalOpen] = useState(false);
  const [colEditName, setColEditName] = useState("");
  const [colEditSeason, setColEditSeason] = useState("");
  const [colEditDesc, setColEditDesc] = useState("");
  const [fashionPrints, setFashionPrints] = useState<FabricPrint[]>([
    AFRICAN_PRINT_PRESETS[0],
    AFRICAN_PRINT_PRESETS[1],
  ]);
  const [fashionColors, setFashionColors] = useState<Array<{ name: string; hex: string }>>([
    AFRICAN_COLOR_PRESETS[0],
    AFRICAN_COLOR_PRESETS[1],
  ]);
  const [fashionSizes, setFashionSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [fashionVariants, setFashionVariants] = useState<ProductVariant[]>([]);
  const [useMatrix, setUseMatrix] = useState<boolean>(true);
  const [newCustomPrint, setNewCustomPrint] = useState("");
  const [newCustomPrintImage, setNewCustomPrintImage] = useState("");
  const [isUploadingSwatch, setIsUploadingSwatch] = useState(false);
  const [newCustomColorName, setNewCustomColorName] = useState("");
  const [newCustomColorHex, setNewCustomColorHex] = useState("#C2410C");
  const [newCustomSize, setNewCustomSize] = useState("");

  // Swatch inspection preview state
  const [previewingSwatch, setPreviewingSwatch] = useState<FabricPrint | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewingSwatch(null);
      }
    };
    if (previewingSwatch) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewingSwatch]);

  const handleUploadCustomPrintSwatch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSwatch(true);
    try {
      const slug = activeTenant?.slug || "neweratransports";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tenantSlug", slug);
      formData.append("folder", "fabric_swatches");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setNewCustomPrintImage(data.url);
      }
    } catch (err) {
      console.error("Swatch upload failed:", err);
    } finally {
      setIsUploadingSwatch(false);
      e.target.value = "";
    }
  };

  // African Print Library Management States
  const [editingLibraryPrint, setEditingLibraryPrint] = useState<FabricPrint | null>(null);
  const [isEditPrintModalOpen, setIsEditPrintModalOpen] = useState(false);
  const [printEditName, setPrintEditName] = useState("");
  const [printEditImage, setPrintEditImage] = useState("");
  const [printEditDesc, setPrintEditDesc] = useState("");
  const [isUploadingPrintEdit, setIsUploadingPrintEdit] = useState(false);
  const [isManagePrintsModalOpen, setIsManagePrintsModalOpen] = useState(false);
  const [saveCustomToLibrary, setSaveCustomToLibrary] = useState(true);

  const persistTenantAfricanPrints = async (newPrints: FabricPrint[]) => {
    const slug = activeTenant?.slug || (verticalKey === "fashion" ? "funmyclothing" : "reedbreed");
    try {
      await fetch(`/api/erp/shop/store-settings?tenant=${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          vertical: verticalKey,
          africanPrints: newPrints,
        }),
      });
    } catch (err) {
      console.error("Failed to persist African prints:", err);
    }
  };

  const persistCategories = async (updated: CustomCategoryItem[]) => {
    const slug = activeTenant?.slug || (verticalKey === "fashion" ? "funmyclothing" : "reedbreed");
    try {
      await fetch(`/api/erp/shop/store-settings?tenant=${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          vertical: verticalKey,
          categories: updated,
        }),
      });
    } catch (err) {
      console.error("Failed to persist categories:", err);
    }
  };

  const persistCollections = async (updated: CustomCollectionItem[]) => {
    const slug = activeTenant?.slug || (verticalKey === "fashion" ? "funmyclothing" : "reedbreed");
    try {
      await fetch(`/api/erp/shop/store-settings?tenant=${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          vertical: verticalKey,
          collectionsList: updated,
        }),
      });
    } catch (err) {
      console.error("Failed to persist collections:", err);
    }
  };

  const handleAddCategory = async () => {
    const name = newCategoryInput.trim();
    if (!name) return;
    if (tenantCategoriesList.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setFormCategory(name);
      setNewCategoryInput("");
      return;
    }
    const newCat: CustomCategoryItem = {
      id: `cat-${Date.now()}`,
      name,
    };
    const updated = [...tenantCategoriesList, newCat];
    setTenantCategoriesList(updated);
    setTenantCategories(updated.map((c) => c.name));
    setFormCategory(name);
    setNewCategoryInput("");
    await persistCategories(updated);
  };

  const handleOpenEditCategory = (cat: CustomCategoryItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setEditingCategory(cat);
    setCatEditName(cat.name);
    setCatEditDesc(cat.description || "");
    setIsEditCategoryModalOpen(true);
  };

  const handleSaveEditCategory = async () => {
    if (!editingCategory || !catEditName.trim()) return;
    const oldName = editingCategory.name;
    const newName = catEditName.trim();
    const updated = tenantCategoriesList.map((c) =>
      c.id === editingCategory.id ? { ...c, name: newName, description: catEditDesc.trim() } : c
    );
    setTenantCategoriesList(updated);
    setTenantCategories(updated.map((c) => c.name));
    if (formCategory.toLowerCase() === oldName.toLowerCase()) {
      setFormCategory(newName);
    }
    setIsEditCategoryModalOpen(false);
    setEditingCategory(null);
    await persistCategories(updated);
  };

  const handleDeleteCategory = async (idOrName: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const updated = tenantCategoriesList.filter(
      (c) => c.id !== idOrName && c.name.toLowerCase() !== idOrName.toLowerCase()
    );
    setTenantCategoriesList(updated);
    setTenantCategories(updated.map((c) => c.name));
    if (formCategory.toLowerCase() === idOrName.toLowerCase()) {
      setFormCategory(updated[0]?.name || "General");
    }
    await persistCategories(updated);
  };

  const handleAddCollection = async () => {
    const name = newCollectionName.trim();
    if (!name) return;
    if (tenantCollectionsList.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setFormCollection(name);
      setNewCollectionName("");
      setNewCollectionSeason("");
      return;
    }
    const newCol: CustomCollectionItem = {
      id: `col-${Date.now()}`,
      name,
      season: newCollectionSeason.trim() || undefined,
    };
    const updated = [...tenantCollectionsList, newCol];
    setTenantCollectionsList(updated);
    setFormCollection(name);
    setNewCollectionName("");
    setNewCollectionSeason("");
    await persistCollections(updated);
  };

  const handleOpenEditCollection = (col: CustomCollectionItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setEditingCollection(col);
    setColEditName(col.name);
    setColEditSeason(col.season || "");
    setColEditDesc(col.description || "");
    setIsEditCollectionModalOpen(true);
  };

  const handleSaveEditCollection = async () => {
    if (!editingCollection || !colEditName.trim()) return;
    const oldName = editingCollection.name;
    const newName = colEditName.trim();
    const updated = tenantCollectionsList.map((c) =>
      c.id === editingCollection.id
        ? { ...c, name: newName, season: colEditSeason.trim() || undefined, description: colEditDesc.trim() || undefined }
        : c
    );
    setTenantCollectionsList(updated);
    if (formCollection.toLowerCase() === oldName.toLowerCase()) {
      setFormCollection(newName);
    }
    setIsEditCollectionModalOpen(false);
    setEditingCollection(null);
    await persistCollections(updated);
  };

  const handleDeleteCollection = async (idOrName: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const updated = tenantCollectionsList.filter(
      (c) => c.id !== idOrName && c.name.toLowerCase() !== idOrName.toLowerCase()
    );
    setTenantCollectionsList(updated);
    if (formCollection.toLowerCase() === idOrName.toLowerCase()) {
      setFormCollection(updated[0]?.name || "General");
    }
    await persistCollections(updated);
  };

  const handleDeleteLibraryPrint = async (printName: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const updated = tenantAfricanPrints.filter(
      (p) => p.name.toLowerCase() !== printName.toLowerCase()
    );
    setTenantAfricanPrints(updated);
    setFashionPrints((prev) => {
      const next = prev.filter((p) => p.name.toLowerCase() !== printName.toLowerCase());
      const numPrice = parseFloat(formPrice.replace(/[^0-9.]/g, "")) || 0;
      const numStock = parseInt(formStock) || 0;
      setFashionVariants((curVars) =>
        generateVariantsFromSelections(next, fashionColors, fashionSizes, numPrice, numStock, formSku, curVars)
      );
      return next;
    });
    await persistTenantAfricanPrints(updated);
  };

  const handleOpenEditPrintModal = (print: FabricPrint, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setEditingLibraryPrint(print);
    setPrintEditName(print.name);
    setPrintEditImage(print.image || "");
    setPrintEditDesc(print.description || "");
    setIsEditPrintModalOpen(true);
  };

  const handleUploadPrintEditSwatch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPrintEdit(true);
    try {
      const slug = activeTenant?.slug || (verticalKey === "fashion" ? "funmyclothing" : "reedbreed");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tenantSlug", slug);
      formData.append("folder", "fabric_swatches");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data?.url) {
        setPrintEditImage(data.url);
      }
    } catch (err) {
      console.error("Swatch upload failed:", err);
    } finally {
      setIsUploadingPrintEdit(false);
    }
  };

  const handleSaveEditedPrint = async () => {
    if (!editingLibraryPrint || !printEditName.trim()) return;
    const updatedPrint: FabricPrint = {
      name: printEditName.trim(),
      image:
        printEditImage.trim() ||
        editingLibraryPrint.image ||
        "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
      description: printEditDesc.trim() || editingLibraryPrint.description,
    };
    const updatedList = tenantAfricanPrints.map((p) =>
      p.name.toLowerCase() === editingLibraryPrint.name.toLowerCase() ? updatedPrint : p
    );
    setTenantAfricanPrints(updatedList);
    setFashionPrints((prev) =>
      prev.map((p) =>
        p.name.toLowerCase() === editingLibraryPrint.name.toLowerCase() ? updatedPrint : p
      )
    );
    setFashionVariants((curVars) =>
      curVars.map((v) =>
        v.print?.toLowerCase() === editingLibraryPrint.name.toLowerCase()
          ? { ...v, print: updatedPrint.name, printImage: updatedPrint.image }
          : v
      )
    );
    setIsEditPrintModalOpen(false);
    setEditingLibraryPrint(null);
    await persistTenantAfricanPrints(updatedList);
  };

  const generateVariantsFromSelections = useCallback(
    (
      prints: FabricPrint[],
      colors: Array<{ name: string; hex: string }>,
      sizes: string[],
      basePriceNum: number,
      baseStockNum: number,
      baseSkuStr: string,
      existingVariants: ProductVariant[] = []
    ): ProductVariant[] => {
      const list: ProductVariant[] = [];
      const printList = prints.length > 0 ? prints : [{ name: "", image: "" }];
      const colorList = colors.length > 0 ? colors : [{ name: "", hex: "" }];
      const sizeList = sizes.length > 0 ? sizes : [""];

      const cleanBaseSku = (baseSkuStr || "SKU-FASH").replace(/[^a-zA-Z0-9-]/g, "").toUpperCase();

      for (const p of printList) {
        for (const c of colorList) {
          for (const s of sizeList) {
            const pCode = p.name ? p.name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() : "";
            const cCode = c.name ? c.name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() : "";
            const sCode = s ? s.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : "";

            const skuParts = [cleanBaseSku, pCode, cCode, sCode].filter(Boolean);
            const varSku = skuParts.join("-");
            const varName = [p.name, c.name, s].filter(Boolean).join(" · ") || "Standard";

            const matched = existingVariants.find(
              (v) => (v.print || "") === p.name && (v.color || "") === c.name && (v.size || "") === s
            );

            list.push({
              id: matched?.id || `var_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              sku: matched?.sku || varSku,
              name: varName,
              print: p.name || undefined,
              printImage: p.image || matched?.printImage || undefined,
              color: c.name || undefined,
              colorHex: c.hex || undefined,
              size: s || undefined,
              price: matched?.price !== undefined ? matched.price : basePriceNum,
              stock: matched?.stock !== undefined ? matched.stock : baseStockNum,
              inStock: (matched?.stock !== undefined ? matched.stock : baseStockNum) > 0,
            });
          }
        }
      }
      return list;
    },
    []
  );

  const totalVariantStock = useMemo(() => {
    if (verticalKey !== "fashion" || !useMatrix || fashionVariants.length === 0) {
      return parseInt(formStock) || 0;
    }
    return fashionVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }, [verticalKey, useMatrix, fashionVariants, formStock]);

  // African Fashion Studio Matrix Helpers
  const togglePrint = (preset: FabricPrint) => {
    setFashionPrints((prev) => {
      const exists = prev.some((p) => p.name.toLowerCase() === preset.name.toLowerCase());
      const next = exists
        ? prev.filter((p) => p.name.toLowerCase() !== preset.name.toLowerCase())
        : [...prev, preset];
      const numPrice = parseFloat(formPrice.replace(/[^0-9.]/g, "")) || 0;
      const numStock = parseInt(formStock) || 0;
      setFashionVariants((curVars) =>
        generateVariantsFromSelections(
          next,
          fashionColors,
          fashionSizes,
          numPrice,
          numStock,
          formSku,
          curVars
        )
      );
      return next;
    });
  };

  const addCustomPrint = async () => {
    const trimmed = newCustomPrint.trim();
    if (!trimmed) return;
    const swatchImg = newCustomPrintImage || "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80";
    const newPrintObj: FabricPrint = {
      name: trimmed,
      image: swatchImg,
      description: "Bespoke studio fabric print",
    };

    setFashionPrints((prev) => {
      if (prev.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) return prev;
      const next = [...prev, newPrintObj];
      const numPrice = parseFloat(formPrice.replace(/[^0-9.]/g, "")) || 0;
      const numStock = parseInt(formStock) || 0;
      setFashionVariants((curVars) =>
        generateVariantsFromSelections(
          next,
          fashionColors,
          fashionSizes,
          numPrice,
          numStock,
          formSku,
          curVars
        )
      );
      return next;
    });

    if (saveCustomToLibrary) {
      if (!tenantAfricanPrints.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
        const updatedList = [...tenantAfricanPrints, newPrintObj];
        setTenantAfricanPrints(updatedList);
        await persistTenantAfricanPrints(updatedList);
      }
    }

    setNewCustomPrint("");
    setNewCustomPrintImage("");
  };

  const removePrint = (printName: string) => {
    setFashionPrints((prev) => {
      const next = prev.filter((p) => p.name.toLowerCase() !== printName.toLowerCase());
      const numPrice = parseFloat(formPrice.replace(/[^0-9.]/g, "")) || 0;
      const numStock = parseInt(formStock) || 0;
      setFashionVariants((curVars) =>
        generateVariantsFromSelections(
          next,
          fashionColors,
          fashionSizes,
          numPrice,
          numStock,
          formSku,
          curVars
        )
      );
      return next;
    });
  };

  const toggleColor = (colorPreset: { name: string; hex: string }) => {
    setFashionColors((prev) => {
      const exists = prev.some((c) => c.name.toLowerCase() === colorPreset.name.toLowerCase());
      const next = exists
        ? prev.filter((c) => c.name.toLowerCase() !== colorPreset.name.toLowerCase())
        : [...prev, colorPreset];
      const numPrice = parseFloat(formPrice.replace(/[^0-9.]/g, "")) || 0;
      const numStock = parseInt(formStock) || 0;
      setFashionVariants((curVars) =>
        generateVariantsFromSelections(
          fashionPrints,
          next,
          fashionSizes,
          numPrice,
          numStock,
          formSku,
          curVars
        )
      );
      return next;
    });
  };

  const addCustomColor = () => {
    const name = newCustomColorName.trim();
    if (!name) return;
    setFashionColors((prev) => {
      if (prev.some((c) => c.name.toLowerCase() === name.toLowerCase())) return prev;
      const next = [...prev, { name, hex: newCustomColorHex || "#111111" }];
      const numPrice = parseFloat(formPrice.replace(/[^0-9.]/g, "")) || 0;
      const numStock = parseInt(formStock) || 0;
      setFashionVariants((curVars) =>
        generateVariantsFromSelections(
          fashionPrints,
          next,
          fashionSizes,
          numPrice,
          numStock,
          formSku,
          curVars
        )
      );
      return next;
    });
    setNewCustomColorName("");
  };

  const removeColor = (colorName: string) => {
    setFashionColors((prev) => {
      const next = prev.filter((c) => c.name.toLowerCase() !== colorName.toLowerCase());
      const numPrice = parseFloat(formPrice.replace(/[^0-9.]/g, "")) || 0;
      const numStock = parseInt(formStock) || 0;
      setFashionVariants((curVars) =>
        generateVariantsFromSelections(
          fashionPrints,
          next,
          fashionSizes,
          numPrice,
          numStock,
          formSku,
          curVars
        )
      );
      return next;
    });
  };

  const toggleSize = (sizeName: string) => {
    setFashionSizes((prev) => {
      const next = prev.includes(sizeName)
        ? prev.filter((s) => s !== sizeName)
        : [...prev, sizeName];
      const numPrice = parseFloat(formPrice.replace(/[^0-9.]/g, "")) || 0;
      const numStock = parseInt(formStock) || 0;
      setFashionVariants((curVars) =>
        generateVariantsFromSelections(
          fashionPrints,
          fashionColors,
          next,
          numPrice,
          numStock,
          formSku,
          curVars
        )
      );
      return next;
    });
  };

  const addCustomSize = () => {
    const trimmed = newCustomSize.trim();
    if (!trimmed) return;
    setFashionSizes((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      const numPrice = parseFloat(formPrice.replace(/[^0-9.]/g, "")) || 0;
      const numStock = parseInt(formStock) || 0;
      setFashionVariants((curVars) =>
        generateVariantsFromSelections(
          fashionPrints,
          fashionColors,
          next,
          numPrice,
          numStock,
          formSku,
          curVars
        )
      );
      return next;
    });
    setNewCustomSize("");
  };

  const removeSize = (sizeName: string) => {
    setFashionSizes((prev) => {
      const next = prev.filter((s) => s !== sizeName);
      const numPrice = parseFloat(formPrice.replace(/[^0-9.]/g, "")) || 0;
      const numStock = parseInt(formStock) || 0;
      setFashionVariants((curVars) =>
        generateVariantsFromSelections(
          fashionPrints,
          fashionColors,
          next,
          numPrice,
          numStock,
          formSku,
          curVars
        )
      );
      return next;
    });
  };

  const handleRegenerateMatrix = () => {
    const numPrice = parseFloat(formPrice.replace(/[^0-9.]/g, "")) || 0;
    const numStock = parseInt(formStock) || 0;
    const list = generateVariantsFromSelections(
      fashionPrints,
      fashionColors,
      fashionSizes,
      numPrice,
      numStock,
      formSku,
      fashionVariants
    );
    setFashionVariants(list);
  };

  const applyBasePriceToAll = () => {
    const numPrice = parseFloat(formPrice.replace(/[^0-9.]/g, "")) || 0;
    setFashionVariants((prev) => prev.map((v) => ({ ...v, price: numPrice })));
  };

  const applyBaseStockToAll = () => {
    const numStock = parseInt(formStock) || 0;
    setFashionVariants((prev) =>
      prev.map((v) => ({ ...v, stock: numStock, inStock: numStock > 0 }))
    );
  };

  const updateVariantPrice = (id: string, price: number) => {
    setFashionVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, price } : v))
    );
  };

  const updateVariantStock = (id: string, stock: number) => {
    setFashionVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, stock, inStock: stock > 0 } : v))
    );
  };

  const updateVariantSku = (id: string, sku: string) => {
    setFashionVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, sku } : v))
    );
  };

  const deleteVariant = (id: string) => {
    setFashionVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const loadProducts = useCallback(async () => {
    if (!activeTenant?.slug) return;
    const slug = activeTenant.slug;
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(
        `/api/erp/shop/products?tenant=${encodeURIComponent(slug)}&vertical=${encodeURIComponent(verticalKey)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data.products) ? data.products : []);
        setFetchError(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        setProducts([]);
        setFetchError(errData.error === "Connect to Internet" ? "Connect to Internet" : "Connect to Internet");
      }
    } catch {
      setProducts([]);
      setFetchError("Connect to Internet");
    } finally {
      setIsLoading(false);
    }
  }, [activeTenant?.slug, verticalKey]);

  useEffect(() => {
    if (activeTenant?.slug) {
      loadProducts();
      fetch(`/api/erp/shop/store-settings?tenant=${encodeURIComponent(activeTenant.slug)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.config) {
            if (Array.isArray(data.config.africanPrints) && data.config.africanPrints.length > 0) {
              setTenantAfricanPrints(data.config.africanPrints);
            }
            if (Array.isArray(data.config.categories) && data.config.categories.length > 0) {
              const mapped: CustomCategoryItem[] = data.config.categories.map((c: any, i: number) =>
                typeof c === "string" ? { id: `cat-${i + 1}`, name: c } : c
              );
              setTenantCategoriesList(mapped);
              setTenantCategories(mapped.map((m: any) => m.name));
            }
            const rawCols =
              data.config.collectionsList ||
              data.config.collections?.collectionsList ||
              (Array.isArray(data.config.collections) ? data.config.collections : null);
            if (Array.isArray(rawCols) && rawCols.length > 0) {
              const mappedCols: CustomCollectionItem[] = rawCols.map((col: any, i: number) =>
                typeof col === "string" ? { id: `col-${i + 1}`, name: col } : col
              );
              setTenantCollectionsList(mappedCols);
            }
          }
        })
        .catch(() => {});
    }
  }, [activeTenant?.slug, loadProducts]);

  const handleOpenAddModal = () => {
    const initSku = `SKU-${verticalKey.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`;
    setFormName("");
    setFormPrice(verticalKey === "fashion" ? "65000" : "");
    setFormCategory(tenantCategoriesList[0]?.name || (verticalKey === "fashion" ? "African Heritage" : "General"));
    setFormCollection(tenantCollectionsList[0]?.name || "Vida Collection");
    setFormStock("1");
    setFormSku(initSku);
    setFormImage("");
    setFormImages([]);
    const initAttrs: Record<string, any> = {};
    currentVerticalDef.attributeFields.forEach((field) => {
      initAttrs[field.key] = field.type === "boolean" ? true : "";
    });

    if (verticalKey === "fashion") {
      const defPrints = [AFRICAN_PRINT_PRESETS[0], AFRICAN_PRINT_PRESETS[1]];
      const defColors = [AFRICAN_COLOR_PRESETS[0], AFRICAN_COLOR_PRESETS[1]];
      const defSizes = ["S", "M", "L", "XL"];
      setFashionPrints(defPrints);
      setFashionColors(defColors);
      setFashionSizes(defSizes);
      setUseMatrix(true);
      const initialVars = generateVariantsFromSelections(
        defPrints,
        defColors,
        defSizes,
        65000,
        1,
        initSku
      );
      setFashionVariants(initialVars);
      initAttrs.material = "100% Premium African Wax Cotton";
      initAttrs.season = "Harmattan Capsule";
    }

    setFormAttributes(initAttrs);
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !activeTenant?.slug) return;

    const slug = activeTenant.slug;
    const numPrice = parseFloat(formPrice.replace(/[^0-9.]/g, "")) || 0;
    const finalStock =
      verticalKey === "fashion" && useMatrix && fashionVariants.length > 0
        ? totalVariantStock
        : parseInt(formStock) || 0;

    setIsSaving(true);

    const finalImages = formImages.filter(Boolean);
    const primaryImage =
      finalImages[0] ||
      formImage ||
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80";
    const imagesToSave = finalImages.length > 0 ? finalImages : [primaryImage];

    const mergedAttributes = {
      ...formAttributes,
      images: imagesToSave,
      collection: formCollection,
      ...(verticalKey === "fashion"
        ? {
            prints: fashionPrints,
            fashionPrints: fashionPrints,
            colors: fashionColors,
            fashionColors: fashionColors,
            colorsString: fashionColors.map((c) => c.name).join(", "),
            sizes: fashionSizes,
            fashionSizes: fashionSizes,
            material: formAttributes.material || "100% African Wax Cotton",
            collection: formCollection,
            season:
              tenantCollectionsList.find(
                (c) => c.name.toLowerCase() === formCollection.toLowerCase()
              )?.season || formAttributes.season || "Harmattan Capsule",
          }
        : {}),
    };

    const payload = {
      id: editingProduct?.id || `PROD-${Date.now().toString().slice(-6)}`,
      name: formName,
      price: numPrice,
      category: formCategory,
      collection: formCollection,
      stock: finalStock,
      sku: formSku,
      image: primaryImage,
      images: imagesToSave,
      vertical: verticalKey,
      tenantSlug: slug,
      status: finalStock > 0 ? "ACTIVE" : "OUT_OF_STOCK",
      attributes: mergedAttributes,
      variants: verticalKey === "fashion" && useMatrix ? fashionVariants : undefined,
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
    if (!activeTenant?.slug) return;
    const slug = activeTenant.slug;
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
    setFormCategory(product.category || tenantCategoriesList[0]?.name || "African Heritage");
    const activeCol =
      product.collection ||
      product.attributes?.collection ||
      (product as any).collection ||
      tenantCollectionsList[0]?.name ||
      "Vida Collection";
    setFormCollection(activeCol);
    setFormStock(String(product.stock !== undefined ? product.stock : 1));
    setFormSku(product.sku || "");
    const initialImages = Array.isArray(product.images) && product.images.length > 0
      ? product.images.filter(Boolean)
      : Array.isArray(product.attributes?.images) && product.attributes.images.length > 0
      ? product.attributes.images.filter(Boolean)
      : (product.image ? [product.image] : []);
    setFormImages(initialImages);
    setFormImage(initialImages[0] || product.image || "");
    setFormAttributes(product.attributes || {});

    if (verticalKey === "fashion") {
      // 1. Prints
      const rawPrints =
        product.attributes?.fashionPrints ||
        product.attributes?.prints ||
        (product as any)?.fashionPrints ||
        (product as any)?.prints;
      let parsedPrints: FabricPrint[] = [];
      if (Array.isArray(rawPrints)) {
        parsedPrints = rawPrints.map((p) => {
          if (typeof p === "string") {
            const trimmed = p.trim();
            const found =
              tenantAfricanPrints.find((pre) => pre.name.toLowerCase() === trimmed.toLowerCase()) ||
              AFRICAN_PRINT_PRESETS.find((pre) => pre.name.toLowerCase() === trimmed.toLowerCase());
            const varMatch = product.variants?.find((v) => v.print?.toLowerCase() === trimmed.toLowerCase());
            return {
              name: trimmed,
              image:
                varMatch?.printImage ||
                found?.image ||
                "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
              description: found?.description,
            };
          }
          return {
            name: p.name,
            image:
              p.image ||
              "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
            description: p.description,
          };
        });
      } else if (typeof rawPrints === "string" && rawPrints.trim()) {
        parsedPrints = rawPrints
          .split(",")
          .map((s) => {
            const name = s.trim();
            const found =
              tenantAfricanPrints.find((pre) => pre.name.toLowerCase() === name.toLowerCase()) ||
              AFRICAN_PRINT_PRESETS.find((pre) => pre.name.toLowerCase() === name.toLowerCase());
            const varMatch = product.variants?.find((v) => v.print?.toLowerCase() === name.toLowerCase());
            return {
              name,
              image:
                varMatch?.printImage ||
                found?.image ||
                "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
              description: found?.description,
            };
          })
          .filter((p) => p.name);
      }
      if (parsedPrints.length === 0 && product.variants) {
        const uniquePrintNames = Array.from(new Set(product.variants.map((v) => v.print).filter(Boolean) as string[]));
        parsedPrints = uniquePrintNames.map((name) => {
          const varMatch = product.variants?.find((v) => v.print === name);
          const found =
            tenantAfricanPrints.find((pre) => pre.name.toLowerCase() === name.toLowerCase()) ||
            AFRICAN_PRINT_PRESETS.find((pre) => pre.name.toLowerCase() === name.toLowerCase());
          return {
            name,
            image:
              varMatch?.printImage ||
              found?.image ||
              "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
            description: found?.description,
          };
        });
      }
      const finalPrints = parsedPrints.length > 0 ? parsedPrints : [AFRICAN_PRINT_PRESETS[0], AFRICAN_PRINT_PRESETS[1]];
      setFashionPrints(finalPrints);

      // 2. Colors
      const rawColors =
        product.attributes?.fashionColors ||
        product.attributes?.colors ||
        (product as any)?.fashionColors ||
        (product as any)?.colors;
      let finalColors: Array<{ name: string; hex: string }> = [];

      if (Array.isArray(rawColors) && rawColors.length > 0) {
        finalColors = rawColors
          .map((c) => {
            if (typeof c === "string") {
              const name = c.trim();
              return { name, hex: resolveColorHex(name, undefined, product.variants) };
            }
            const name = c?.name || "Default";
            return { name, hex: resolveColorHex(name, c?.hex, product.variants) };
          })
          .filter((c) => c.name);
      } else if (typeof rawColors === "string" && rawColors.trim()) {
        finalColors = rawColors
          .split(",")
          .map((s) => {
            const name = s.trim();
            return { name, hex: resolveColorHex(name, undefined, product.variants) };
          })
          .filter((c) => c.name);
      } else if (product.variants && product.variants.length > 0) {
        const uniqueNames = Array.from(
          new Set(product.variants.map((v) => v.color).filter(Boolean) as string[])
        );
        finalColors = uniqueNames.map((name) => {
          const vMatch = product.variants?.find((v) => v.color?.toLowerCase() === name.toLowerCase());
          return {
            name,
            hex: resolveColorHex(name, vMatch?.colorHex, product.variants),
          };
        });
      }

      if (finalColors.length === 0) {
        finalColors = [
          { name: AFRICAN_COLOR_PRESETS[0].name, hex: AFRICAN_COLOR_PRESETS[0].hex },
          { name: AFRICAN_COLOR_PRESETS[1].name, hex: AFRICAN_COLOR_PRESETS[1].hex },
        ];
      }
      setFashionColors(finalColors);

      // 3. Sizes
      const rawSizes = product.attributes?.sizes;
      let parsedSizes: string[] = [];
      if (Array.isArray(rawSizes)) {
        parsedSizes = rawSizes;
      } else if (typeof rawSizes === "string" && rawSizes.trim()) {
        parsedSizes = rawSizes.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (parsedSizes.length === 0 && product.variants) {
        parsedSizes = Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean) as string[]));
      }
      const finalSizes = parsedSizes.length > 0 ? parsedSizes : ["S", "M", "L"];
      setFashionSizes(finalSizes);

      // 4. Variants
      if (product.variants && product.variants.length > 0) {
        setFashionVariants(product.variants);
        setUseMatrix(true);
      } else {
        const gen = generateVariantsFromSelections(
          finalPrints,
          finalColors,
          finalSizes,
          product.price || 0,
          product.stock !== undefined ? product.stock : 1,
          product.sku || "SKU-FASH"
        );
        setFashionVariants(gen);
        setUseMatrix(true);
      }
    }
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
      const prodCol = (p as any).collection || p.attributes?.collection || "";
      const matchCol =
        collectionFilter === "ALL" ||
        prodCol.toLowerCase() === collectionFilter.toLowerCase();
      return matchSearch && matchCat && matchCol;
    });
  }, [products, search, categoryFilter, collectionFilter]);

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
    tenantCategories.forEach((c) => set.add(c));
    return Array.from(set);
  }, [products, tenantCategories]);

  const uniqueCollections = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      const col = (p as any).collection || p.attributes?.collection;
      if (col) set.add(col);
    });
    tenantCollectionsList.forEach((c) => set.add(c.name));
    return Array.from(set);
  }, [products, tenantCollectionsList]);

  const storefrontCatalogUrl = getStorefrontUrl(verticalKey, activeTenant);

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
        {fetchError && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-700 dark:text-amber-400">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs font-bold">{fetchError}</p>
                <p className="text-[11px] opacity-80">Unable to reach store database. Please verify your internet connection.</p>
              </div>
            </div>
            <button
              onClick={() => loadProducts()}
              className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}
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
                    {p.images && p.images.length > 1 && (
                      <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/75 text-white backdrop-blur-xs flex items-center gap-1">
                        <ImageIcon className="w-2.5 h-2.5" />
                        <span>{p.images.length} photos</span>
                      </span>
                    )}
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
        maxWidth="3xl"
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
                {verticalKey === "fashion" && useMatrix ? "Base Stock per Variant *" : "Initial Stock Qty *"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  required
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold font-mono"
                />
                {verticalKey === "fashion" && useMatrix && fashionVariants.length > 0 && (
                  <span className="absolute right-2.5 top-2 text-[10px] text-amber-600 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                    Total: {totalVariantStock} pcs
                  </span>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Master SKU Prefix
              </label>
              <input
                type="text"
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold font-mono"
              />
            </div>

            {/* Category Selection & Management */}
            <div className="sm:col-span-2 space-y-2 p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Apparel Category</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md font-mono font-bold">
                    {formCategory || "None"}
                  </span>
                </label>
                <span className="text-[10px] text-[var(--nexa-text-muted)]">Click chip to select active category</span>
              </div>

              {/* Category Chips with Select, Edit, Delete */}
              <div className="flex flex-wrap gap-2">
                {tenantCategoriesList.map((cat) => {
                  const isSelected = (formCategory || "").toLowerCase() === cat.name.toLowerCase();
                  return (
                    <div
                      key={cat.id || cat.name}
                      className={`group relative flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs rounded-xl font-medium transition-all border ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-secondary)] border-[var(--nexa-border)] hover:border-emerald-500/40"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setFormCategory(cat.name)}
                        className="flex items-center gap-1.5 cursor-pointer outline-none font-semibold"
                      >
                        <span>{cat.name}</span>
                        {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </button>

                      <div className="flex items-center ml-1 border-l border-white/20 pl-1 gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditCategory(cat, e)}
                          className={`p-1 rounded-md transition cursor-pointer ${
                            isSelected ? "hover:bg-white/20 text-white" : "hover:bg-emerald-500/10 text-stone-400 hover:text-emerald-600"
                          }`}
                          title={`Edit category ${cat.name}`}
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCategory(cat.id || cat.name, e)}
                          className={`p-1 rounded-md transition cursor-pointer ${
                            isSelected ? "hover:bg-red-500/30 text-white" : "hover:bg-red-50 text-stone-400 hover:text-red-600"
                          }`}
                          title={`Delete category ${cat.name}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Category Inline */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  placeholder="Add new category (e.g. Kaftans, Agbada Sets, Evening Gowns)..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none focus:border-emerald-500 text-[var(--nexa-text-primary)]"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={!newCategoryInput.trim()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <MultiImageUploadInput
                label={`${currentVerticalDef.productTerm} Images & Gallery`}
                value={formImages}
                onChange={(urls) => {
                  setFormImages(urls);
                  setFormImage(urls[0] || "");
                }}
                tenantSlug={activeTenant?.slug}
                folder="catalog"
                helperText="Upload multiple high-resolution photos for this apparel item. The first photo serves as the primary storefront cover, while the others appear in the product gallery carousel."
              />
            </div>
          </div>

          {/* DYNAMIC VERTICAL-SPECIFIC ATTRIBUTES OR AFRICAN FASHION STUDIO */}
          {verticalKey === "fashion" ? (
            <div className="pt-3 border-t border-[var(--nexa-border)] space-y-4">
              {/* African Fashion Studio Banner */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--nexa-text-primary)]">African Heritage Fashion Studio</h4>
                    <p className="text-[11px] text-[var(--nexa-text-secondary)]">
                      Select African prints, luxury color swatches, and sizes to auto-build your inventory matrix.
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-[var(--nexa-text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useMatrix}
                    onChange={(e) => setUseMatrix(e.target.checked)}
                    className="rounded accent-amber-600 cursor-pointer"
                  />
                  <span>Enable SKU Matrix</span>
                </label>
              </div>

              {/* 0. Designer Collection / Capsule Drop */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    <span>Collection / Seasonal Capsule</span>
                    <span className="text-[10px] text-purple-600 bg-purple-500/10 px-1.5 py-0.5 rounded-md font-mono font-bold">
                      {formCollection || "None"}
                    </span>
                  </label>
                  <span className="text-[10px] text-[var(--nexa-text-muted)]">Assign this apparel piece to a designer capsule</span>
                </div>

                {/* Collection Chips with Select, Edit, Delete */}
                <div className="flex flex-wrap gap-2">
                  {tenantCollectionsList.map((col) => {
                    const isSelected = (formCollection || "").toLowerCase() === col.name.toLowerCase();
                    return (
                      <div
                        key={col.id || col.name}
                        className={`group relative flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs rounded-xl font-medium transition-all border ${
                          isSelected
                            ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                            : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border-[var(--nexa-border)] hover:border-purple-500/40"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setFormCollection(col.name)}
                          className="flex items-center gap-1.5 cursor-pointer outline-none font-semibold"
                        >
                          <span>{col.name}</span>
                          {col.season && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                                isSelected ? "bg-white/20 text-white" : "bg-stone-200 text-stone-600"
                              }`}
                            >
                              {col.season}
                            </span>
                          )}
                          {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                        </button>

                        <div className="flex items-center ml-1 border-l border-white/20 pl-1 gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditCollection(col, e)}
                            className={`p-1 rounded-md transition cursor-pointer ${
                              isSelected ? "hover:bg-white/20 text-white" : "hover:bg-purple-500/10 text-stone-400 hover:text-purple-600"
                            }`}
                            title={`Edit collection ${col.name}`}
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCollection(col.id || col.name, e)}
                            className={`p-1 rounded-md transition cursor-pointer ${
                              isSelected ? "hover:bg-red-500/30 text-white" : "hover:bg-red-50 text-stone-400 hover:text-red-600"
                            }`}
                            title={`Delete collection ${col.name}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Collection Inline */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="Collection Name (e.g. Adetola Collection, Royal Heritage)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-purple-500 text-[var(--nexa-text-primary)]"
                  />
                  <input
                    type="text"
                    value={newCollectionSeason}
                    onChange={(e) => setNewCollectionSeason(e.target.value)}
                    placeholder="Season (e.g. Harmattan / Resort 2026)..."
                    className="w-full sm:w-48 px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-purple-500 text-[var(--nexa-text-primary)] font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddCollection}
                    disabled={!newCollectionName.trim()}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create Collection</span>
                  </button>
                </div>
              </div>

              {/* 1. African Fabric Prints */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                    <span>African Fabric Prints & Weaves</span>
                    <span className="text-[10px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-md font-mono">
                      {fashionPrints.length} selected
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsManagePrintsModalOpen(true)}
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Manage Library</span>
                    </button>
                    <span className="text-[10px] text-[var(--nexa-text-muted)]">Click chip to toggle</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tenantAfricanPrints.map((print) => {
                    const isSelected = fashionPrints.some(
                      (p) => p.name.toLowerCase() === print.name.toLowerCase()
                    );
                    return (
                      <div
                        key={print.name}
                        className={`group relative flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs rounded-xl font-medium transition-all border ${
                          isSelected
                            ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                            : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border-[var(--nexa-border)] hover:border-amber-500/40"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => togglePrint(print)}
                          className="flex items-center gap-2 cursor-pointer outline-none"
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewingSwatch(print);
                            }}
                            className="relative w-4 h-4 rounded-full overflow-hidden border border-white/40 shrink-0 shadow-xs cursor-zoom-in hover:scale-125 transition-transform"
                            title="Click circle to preview fabric swatch"
                          >
                            <img
                              src={print.image}
                              alt={print.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <ZoomIn className="w-2.5 h-2.5 text-white" />
                            </div>
                          </div>
                          <span>{print.name}</span>
                          {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                        </button>

                        <div className="flex items-center ml-1 border-l border-white/20 pl-1 gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditPrintModal(print, e)}
                            className={`p-1 rounded-md transition cursor-pointer ${
                              isSelected ? "hover:bg-white/20 text-white" : "hover:bg-amber-500/10 text-stone-400 hover:text-amber-600"
                            }`}
                            title={`Edit ${print.name}`}
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteLibraryPrint(print.name, e)}
                            className={`p-1 rounded-md transition cursor-pointer ${
                              isSelected ? "hover:bg-red-500/30 text-white" : "hover:bg-red-50 text-stone-400 hover:text-red-600"
                            }`}
                            title={`Delete ${print.name} from library`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {tenantAfricanPrints.length === 0 && (
                    <p className="text-xs text-[var(--nexa-text-muted)] italic">
                      No prints in library yet. Add your custom fabric prints below.
                    </p>
                  )}
                </div>

                {/* Custom Print Input with Device Swatch Upload */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newCustomPrint}
                    onChange={(e) => setNewCustomPrint(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomPrint();
                      }
                    }}
                    placeholder="Custom print name (e.g. Akwete, Adire Alabere, Guipure Lace)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-amber-500 text-[var(--nexa-text-primary)]"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] hover:border-amber-500/40 text-[var(--nexa-text-secondary)] cursor-pointer">
                      <Upload className="w-3 h-3 text-amber-600" />
                      <span>{isUploadingSwatch ? "Uploading..." : newCustomPrintImage ? "Swatch Attached" : "Upload Swatch"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingSwatch}
                        onChange={handleUploadCustomPrintSwatch}
                        className="hidden"
                      />
                    </label>

                    {newCustomPrintImage && (
                      <div className="relative group shrink-0">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewingSwatch({
                              name: newCustomPrint.trim() || "Custom Fabric Swatch",
                              image: newCustomPrintImage,
                              description: "Custom uploaded African fabric swatch texture",
                            });
                          }}
                          className="w-7 h-7 rounded-full overflow-hidden border border-[var(--nexa-border)] cursor-zoom-in hover:scale-110 transition-transform relative group/cswatch"
                          title="Click circle to preview fabric swatch"
                        >
                          <img
                            src={newCustomPrintImage}
                            alt="Custom Swatch"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/cswatch:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <ZoomIn className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewCustomPrintImage("")}
                          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={addCustomPrint}
                      disabled={!newCustomPrint.trim()}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--nexa-bg-surface)] hover:bg-amber-500/10 text-amber-600 border border-[var(--nexa-border)] hover:border-amber-500/40 disabled:opacity-50 cursor-pointer"
                    >
                      + Add Print
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <label className="flex items-center gap-1.5 text-[11px] text-[var(--nexa-text-secondary)] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={saveCustomToLibrary}
                      onChange={(e) => setSaveCustomToLibrary(e.target.checked)}
                      className="rounded accent-amber-600 cursor-pointer w-3.5 h-3.5"
                    />
                    <span>Save to store print library (available across all catalog products)</span>
                  </label>
                </div>

                {fashionPrints.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-[var(--nexa-text-muted)] font-medium">Active Prints:</span>
                    {fashionPrints.map((p) => (
                      <span
                        key={p.name}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-medium border border-amber-500/20"
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewingSwatch(p);
                          }}
                          className="w-3.5 h-3.5 rounded-full overflow-hidden border border-amber-500/30 shrink-0 cursor-zoom-in hover:scale-125 transition-transform"
                          title="Click circle to preview fabric swatch"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span>{p.name}</span>
                        <button
                          type="button"
                          onClick={() => removePrint(p.name)}
                          className="hover:text-red-500 cursor-pointer ml-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. African Luxury Color Swatches */}
              <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-600" />
                    <span>African Royal Palette & Swatches</span>
                    <span className="text-[10px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-md font-mono">
                      {fashionColors.length} selected
                    </span>
                  </label>
                  <span className="text-[10px] text-[var(--nexa-text-muted)]">Click swatch to toggle</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AFRICAN_COLOR_PRESETS.map((color) => {
                    const isSelected = fashionColors.some(
                      (c) => c.name.toLowerCase() === color.name.toLowerCase()
                    );
                    return (
                      <button
                        type="button"
                        key={color.name}
                        onClick={() => toggleColor(color)}
                        className={`p-2 rounded-xl text-left transition-all flex items-center gap-2 cursor-pointer border ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500 ring-1 ring-amber-500"
                            : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] hover:border-gray-400"
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-xs"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs font-medium text-[var(--nexa-text-primary)] truncate flex-1">
                          {color.name}
                        </span>
                        {isSelected && <Check className="w-3 h-3 text-amber-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="color"
                    value={newCustomColorHex}
                    onChange={(e) => setNewCustomColorHex(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    title="Pick custom hex color"
                  />
                  <input
                    type="text"
                    value={newCustomColorName}
                    onChange={(e) => setNewCustomColorName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomColor();
                      }
                    }}
                    placeholder="Custom Color Name (e.g. Benin Bronze, Palm Leaf Green)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-amber-500 text-[var(--nexa-text-primary)]"
                  />
                  <button
                    type="button"
                    onClick={addCustomColor}
                    disabled={!newCustomColorName.trim()}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--nexa-bg-surface)] hover:bg-amber-500/10 text-amber-600 border border-[var(--nexa-border)] hover:border-amber-500/40 disabled:opacity-50 cursor-pointer"
                  >
                    + Add Color
                  </button>
                </div>

                {fashionColors.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-[var(--nexa-text-muted)] font-medium">Active Palette:</span>
                    {fashionColors.map((c) => (
                      <span
                        key={c.name}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] text-[11px] font-medium border border-[var(--nexa-border)]"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full border border-black/20"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                        <button
                          type="button"
                          onClick={() => removeColor(c.name)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Apparel Sizes */}
              <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                    <span>Apparel Sizes & Bespoke Cuts</span>
                    <span className="text-[10px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-md font-mono">
                      {fashionSizes.length} selected
                    </span>
                  </label>
                  <span className="text-[10px] text-[var(--nexa-text-muted)]">Toggle standard sizes</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {SIZE_PRESETS.map((sz) => {
                    const isSelected = fashionSizes.includes(sz);
                    return (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => toggleSize(sz)}
                        className={`px-3 py-1 text-xs rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                          isSelected
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs"
                            : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border-[var(--nexa-border)] hover:border-gray-400"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                        <span>{sz}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newCustomSize}
                    onChange={(e) => setNewCustomSize(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomSize();
                      }
                    }}
                    placeholder="Add custom size (e.g. 4XL, Agbada Free-Size, Custom Tailored)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-amber-500 text-[var(--nexa-text-primary)]"
                  />
                  <button
                    type="button"
                    onClick={addCustomSize}
                    disabled={!newCustomSize.trim()}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--nexa-bg-surface)] hover:bg-amber-500/10 text-amber-600 border border-[var(--nexa-border)] hover:border-amber-500/40 disabled:opacity-50 cursor-pointer"
                  >
                    + Add Size
                  </button>
                </div>
              </div>

              {/* 4. Fabric Material & Season */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--nexa-border)]">
                <div>
                  <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                    Fabric & Material Composition
                  </label>
                  <input
                    type="text"
                    value={formAttributes.material || ""}
                    onChange={(e) => setFormAttributes({ ...formAttributes, material: e.target.value })}
                    placeholder="e.g. 100% Cotton African Wax Print, Handloomed Aso-Oke"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                    Collection / Season
                  </label>
                  <select
                    value={formAttributes.season || "Harmattan Capsule"}
                    onChange={(e) => setFormAttributes({ ...formAttributes, season: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
                  >
                    <option value="Harmattan Capsule">Harmattan Capsule</option>
                    <option value="Bridal & Ceremonial">Bridal & Ceremonial</option>
                    <option value="All-Season Core">All-Season Core</option>
                    <option value="Spring/Summer 2026">Spring/Summer 2026</option>
                    <option value="Fall/Winter 2026">Fall/Winter 2026</option>
                  </select>
                </div>
              </div>

              {/* 5. Variant SKU Matrix Table & Bulk Controls */}
              {useMatrix && (
                <div className="pt-2 border-t border-[var(--nexa-border)] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[var(--nexa-text-primary)] uppercase tracking-wider">
                          Variant Inventory Matrix
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          {fashionVariants.length} Combinations
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5">
                        Total Stock: <strong className="text-[var(--nexa-text-primary)]">{totalVariantStock} units</strong> across all discrete SKUs
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={applyBasePriceToAll}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[var(--nexa-bg-surface)] hover:bg-blue-500/10 text-[#1A56DB] border border-[var(--nexa-border)] hover:border-blue-500/40 cursor-pointer"
                        title="Apply master Selling Price to all variants"
                      >
                        Apply ₦{formPrice || 0} to All
                      </button>
                      <button
                        type="button"
                        onClick={applyBaseStockToAll}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[var(--nexa-bg-surface)] hover:bg-emerald-500/10 text-emerald-600 border border-[var(--nexa-border)] hover:border-emerald-500/40 cursor-pointer"
                        title="Apply master Initial Stock to all variants"
                      >
                        Apply {formStock || 0} pcs to All
                      </button>
                      <button
                        type="button"
                        onClick={handleRegenerateMatrix}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[var(--nexa-bg-surface)] hover:bg-gray-200 dark:hover:bg-zinc-800 text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)] cursor-pointer flex items-center gap-1"
                        title="Re-generate all combinations from selections"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset Matrix</span>
                      </button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-[var(--nexa-bg-base)] border-b border-[var(--nexa-border)] text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider">
                        <tr>
                          <th className="py-2 px-3">Variant Specification</th>
                          <th className="py-2 px-3">Discrete SKU</th>
                          <th className="py-2 px-3 w-28">Price (₦)</th>
                          <th className="py-2 px-3 w-24">Stock (Qty)</th>
                          <th className="py-2 px-2 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--nexa-border)]">
                        {fashionVariants.map((v, idx) => (
                          <tr key={v.id || idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                {v.printImage && (
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewingSwatch({
                                        name: v.print || "Fabric Swatch",
                                        image: v.printImage || "",
                                        description: `Variant SKU: ${v.sku} · Size: ${v.size || "Standard"} · Color: ${v.color || "Standard"}`,
                                      });
                                    }}
                                    className="w-4 h-4 rounded-full overflow-hidden border border-black/20 shrink-0 shadow-xs cursor-zoom-in hover:scale-125 transition-transform"
                                    title={`Click circle to preview fabric swatch: ${v.print}`}
                                  >
                                    <img
                                      src={v.printImage}
                                      alt={v.print || "Fabric Swatch"}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                {v.colorHex && (
                                  <div
                                    className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                                    style={{ backgroundColor: v.colorHex }}
                                    title={`Color: ${v.color}`}
                                  />
                                )}
                                <span className="font-semibold text-[var(--nexa-text-primary)]">
                                  {[v.print, v.color, v.size].filter(Boolean).join(" · ")}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px]">
                              <input
                                type="text"
                                value={v.sku}
                                onChange={(e) => updateVariantSku(v.id, e.target.value)}
                                className="w-full px-2 py-1 text-[11px] rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-mono outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="0"
                                value={v.price ?? ""}
                                onChange={(e) => updateVariantPrice(v.id, parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-xs rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-mono font-semibold outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="0"
                                value={v.stock ?? ""}
                                onChange={(e) => updateVariantStock(v.id, parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-xs rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-mono font-semibold outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => deleteVariant(v.id)}
                                className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                                title="Remove variant"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* DYNAMIC VERTICAL-SPECIFIC ATTRIBUTES FOR NON-FASHION VERTICALS */
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
          )}

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

      {/* EXPANDED FABRIC SWATCH PREVIEW FRAME */}
      {previewingSwatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setPreviewingSwatch(null)}
        >
          <div
            className="relative w-full max-w-sm bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-200 text-[var(--nexa-text-primary)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Title and Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--nexa-text-secondary)]">
                  African Fabric Swatch Inspection
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingSwatch(null)}
                className="w-7 h-7 rounded-full bg-[var(--nexa-bg-base)] hover:bg-rose-500/10 text-[var(--nexa-text-secondary)] hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                title="Close Preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Expanded Swatch in a Bigger Frame with Macro Zoom */}
            <div className="relative mt-3.5 aspect-square w-full rounded-2xl overflow-hidden border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] group shadow-inner">
              <img
                src={previewingSwatch.image}
                alt={previewingSwatch.name}
                className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-135"
              />
              <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-[11px] font-semibold text-white flex items-center gap-1.5 shadow-sm">
                <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Hover to inspect weave texture</span>
              </div>
            </div>

            {/* Swatch Details */}
            <div className="mt-4 space-y-1">
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-extrabold text-[var(--nexa-text-primary)]">
                  {previewingSwatch.name}
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 uppercase tracking-wide border border-amber-500/30">
                  Fabric Weave
                </span>
              </div>
              {previewingSwatch.description && (
                <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed pt-0.5">
                  {previewingSwatch.description}
                </p>
              )}
            </div>

            {/* Close Action */}
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewingSwatch(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[var(--nexa-border)] text-[var(--nexa-text-primary)] text-xs font-bold transition-colors cursor-pointer border border-[var(--nexa-border)]"
              >
                Close Swatch Preview
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: MANAGE AFRICAN PRINTS LIBRARY */}
      <NexaModal
        isOpen={isManagePrintsModalOpen}
        onClose={() => setIsManagePrintsModalOpen(false)}
        title="African Prints & Fabric Library"
        subtitle="Manage textile swatches, prints, and custom fabric patterns available for all catalog designs."
        maxWidth="3xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--nexa-border)]">
            <span className="text-xs font-bold text-[var(--nexa-text-primary)]">
              {tenantAfricanPrints.length} Prints in Library
            </span>
            <Link
              href={`/erp/admin/shop/${verticalKey}/store`}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Full Store Studio Settings</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto p-1">
            {tenantAfricanPrints.map((prt) => (
              <div
                key={prt.name}
                className="p-2.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex flex-col justify-between space-y-2 group"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 border border-[var(--nexa-border)]">
                  <img src={prt.image} alt={prt.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[var(--nexa-text-primary)] block truncate">
                    {prt.name}
                  </span>
                  {prt.description && (
                    <p className="text-[10px] text-[var(--nexa-text-secondary)] line-clamp-1">
                      {prt.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-end gap-1 pt-1 border-t border-[var(--nexa-border)]">
                  <button
                    type="button"
                    onClick={(e) => handleOpenEditPrintModal(prt, e)}
                    className="p-1 rounded-lg hover:bg-stone-200 text-stone-600 transition cursor-pointer"
                    title="Edit Print"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteLibraryPrint(prt.name, e)}
                    className="p-1 rounded-lg hover:bg-red-100 text-red-500 transition cursor-pointer"
                    title="Delete Print"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {tenantAfricanPrints.length === 0 && (
              <div className="col-span-full py-8 text-center text-xs text-[var(--nexa-text-muted)] italic">
                No prints in library yet. Add your custom prints from the product matrix editor.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[var(--nexa-border)] flex justify-end">
            <NexaButton size="sm" variant="outline" onClick={() => setIsManagePrintsModalOpen(false)}>
              Done
            </NexaButton>
          </div>
        </div>
      </NexaModal>

      {/* MODAL: EDIT AFRICAN PRINT */}
      <NexaModal
        isOpen={isEditPrintModalOpen}
        onClose={() => setIsEditPrintModalOpen(false)}
        title="Edit Fabric Print"
        subtitle="Update print details, upload a new textile swatch, and save live to your store library."
        maxWidth="md"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
              Print / Pattern Name
            </label>
            <input
              type="text"
              value={printEditName}
              onChange={(e) => setPrintEditName(e.target.value)}
              placeholder="e.g. Yoruba Indigo Adire"
              className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
              Swatch / Pattern Image
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={printEditImage}
                onChange={(e) => setPrintEditImage(e.target.value)}
                placeholder="https://... or upload file"
                className="flex-1 px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none font-mono text-[11px]"
              />
              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-amber-500 text-amber-600 font-bold text-xs cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingPrintEdit ? "Uploading..." : "Upload"}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingPrintEdit}
                  onChange={handleUploadPrintEditSwatch}
                  className="hidden"
                />
              </label>
            </div>
            {printEditImage && (
              <div className="mt-2 flex items-center gap-2">
                <img src={printEditImage} alt="Preview" className="w-10 h-10 rounded-xl object-cover border border-[var(--nexa-border)]" />
                <span className="text-[10px] text-[var(--nexa-text-secondary)]">Swatch Texture Preview</span>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
              Heritage Story / Description
            </label>
            <textarea
              rows={2}
              value={printEditDesc}
              onChange={(e) => setPrintEditDesc(e.target.value)}
              placeholder="e.g. Traditional resist-dyed Yoruba cotton fabric..."
              className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none resize-none focus:border-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-[var(--nexa-border)] flex justify-end gap-2">
            <NexaButton size="sm" variant="outline" onClick={() => setIsEditPrintModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton size="sm" variant="primary" onClick={handleSaveEditedPrint} className="bg-amber-600 text-white font-bold cursor-pointer">
              Save Print
            </NexaButton>
          </div>
        </div>
      </NexaModal>

      {/* MODAL: EDIT CATEGORY */}
      <NexaModal
        isOpen={isEditCategoryModalOpen}
        onClose={() => {
          setIsEditCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        title="Edit Apparel Category"
        subtitle="Rename or update taxonomy description for this fashion category."
        maxWidth="md"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
              Category Name *
            </label>
            <input
              type="text"
              value={catEditName}
              onChange={(e) => setCatEditName(e.target.value)}
              placeholder="e.g. African Heritage"
              className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={catEditDesc}
              onChange={(e) => setCatEditDesc(e.target.value)}
              placeholder="Brief description of this apparel category..."
              className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none resize-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-[var(--nexa-border)] flex justify-end gap-2">
            <NexaButton size="sm" variant="outline" onClick={() => setIsEditCategoryModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton size="sm" variant="primary" onClick={handleSaveEditCategory} className="bg-emerald-600 text-white font-bold cursor-pointer">
              Save Category
            </NexaButton>
          </div>
        </div>
      </NexaModal>

      {/* MODAL: EDIT COLLECTION */}
      <NexaModal
        isOpen={isEditCollectionModalOpen}
        onClose={() => {
          setIsEditCollectionModalOpen(false);
          setEditingCollection(null);
        }}
        title="Edit Designer Collection"
        subtitle="Update capsule name, seasonal drop label, and editorial notes."
        maxWidth="md"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
              Collection Name *
            </label>
            <input
              type="text"
              value={colEditName}
              onChange={(e) => setColEditName(e.target.value)}
              placeholder="e.g. Vida Collection"
              className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
              Season / Capsule Drop Label
            </label>
            <input
              type="text"
              value={colEditSeason}
              onChange={(e) => setColEditSeason(e.target.value)}
              placeholder="e.g. Harmattan / Resort 2026"
              className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-mono outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={colEditDesc}
              onChange={(e) => setColEditDesc(e.target.value)}
              placeholder="Editorial story and design philosophy of this collection..."
              className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none resize-none focus:border-purple-500"
            />
          </div>

          <div className="pt-3 border-t border-[var(--nexa-border)] flex justify-end gap-2">
            <NexaButton size="sm" variant="outline" onClick={() => setIsEditCollectionModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton size="sm" variant="primary" onClick={handleSaveEditCollection} className="bg-purple-600 text-white font-bold cursor-pointer">
              Save Collection
            </NexaButton>
          </div>
        </div>
      </NexaModal>
    </BusinessShell>
  );
}
