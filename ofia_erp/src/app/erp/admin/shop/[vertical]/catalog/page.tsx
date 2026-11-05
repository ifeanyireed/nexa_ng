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
  ProductVariant,
  VerticalKey,
  getStorefrontUrl,
} from "@/lib/verticals";

const AFRICAN_PRINT_PRESETS = [
  "Ankara Wax",
  "Aso-Oke",
  "Adire Tie-Dye",
  "Kente",
  "Lace Brocade",
  "Bogolan Mudcloth",
  "Senegalese Bazin",
  "Plain Silk-Linen",
];

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

  // African Fashion Matrix Studio States
  const [fashionPrints, setFashionPrints] = useState<string[]>(["Ankara Wax", "Aso-Oke"]);
  const [fashionColors, setFashionColors] = useState<Array<{ name: string; hex: string }>>([
    AFRICAN_COLOR_PRESETS[0],
    AFRICAN_COLOR_PRESETS[1],
  ]);
  const [fashionSizes, setFashionSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [fashionVariants, setFashionVariants] = useState<ProductVariant[]>([]);
  const [useMatrix, setUseMatrix] = useState<boolean>(true);
  const [newCustomPrint, setNewCustomPrint] = useState("");
  const [newCustomColorName, setNewCustomColorName] = useState("");
  const [newCustomColorHex, setNewCustomColorHex] = useState("#C2410C");
  const [newCustomSize, setNewCustomSize] = useState("");

  const generateVariantsFromSelections = useCallback(
    (
      prints: string[],
      colors: Array<{ name: string; hex: string }>,
      sizes: string[],
      basePriceNum: number,
      baseStockNum: number,
      baseSkuStr: string,
      existingVariants: ProductVariant[] = []
    ): ProductVariant[] => {
      const list: ProductVariant[] = [];
      const printList = prints.length > 0 ? prints : [""];
      const colorList = colors.length > 0 ? colors : [{ name: "", hex: "" }];
      const sizeList = sizes.length > 0 ? sizes : [""];

      const cleanBaseSku = (baseSkuStr || "SKU-FASH").replace(/[^a-zA-Z0-9-]/g, "").toUpperCase();

      for (const p of printList) {
        for (const c of colorList) {
          for (const s of sizeList) {
            const pCode = p ? p.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() : "";
            const cCode = c.name ? c.name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() : "";
            const sCode = s ? s.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : "";

            const skuParts = [cleanBaseSku, pCode, cCode, sCode].filter(Boolean);
            const varSku = skuParts.join("-");
            const varName = [p, c.name, s].filter(Boolean).join(" · ") || "Standard";

            const matched = existingVariants.find(
              (v) => (v.print || "") === p && (v.color || "") === c.name && (v.size || "") === s
            );

            list.push({
              id: matched?.id || `var_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              sku: matched?.sku || varSku,
              name: varName,
              print: p || undefined,
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
  const togglePrint = (printName: string) => {
    setFashionPrints((prev) => {
      const next = prev.includes(printName)
        ? prev.filter((p) => p !== printName)
        : [...prev, printName];
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

  const addCustomPrint = () => {
    const trimmed = newCustomPrint.trim();
    if (!trimmed) return;
    setFashionPrints((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
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
    setNewCustomPrint("");
  };

  const removePrint = (printName: string) => {
    setFashionPrints((prev) => {
      const next = prev.filter((p) => p !== printName);
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
    const initSku = `SKU-${verticalKey.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`;
    setFormName("");
    setFormPrice(verticalKey === "fashion" ? "65000" : "");
    setFormCategory(verticalKey === "fashion" ? "African Heritage" : "General");
    setFormStock("10");
    setFormSku(initSku);
    setFormImage("");
    const initAttrs: Record<string, any> = {};
    currentVerticalDef.attributeFields.forEach((field) => {
      initAttrs[field.key] = field.type === "boolean" ? true : "";
    });

    if (verticalKey === "fashion") {
      const defPrints = ["Ankara Wax", "Aso-Oke"];
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
        10,
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
    if (!formName) return;

    const slug = activeTenant?.slug || "neweratransports";
    const numPrice = parseFloat(formPrice.replace(/[^0-9.]/g, "")) || 0;
    const finalStock =
      verticalKey === "fashion" && useMatrix && fashionVariants.length > 0
        ? totalVariantStock
        : parseInt(formStock) || 0;

    setIsSaving(true);

    const mergedAttributes = {
      ...formAttributes,
      ...(verticalKey === "fashion"
        ? {
            prints: fashionPrints,
            colors: fashionColors.map((c) => c.name).join(", "),
            sizes: fashionSizes.join(", "),
            material: formAttributes.material || "100% African Wax Cotton",
            season: formAttributes.season || "Harmattan Capsule",
          }
        : {}),
    };

    const payload = {
      id: editingProduct?.id || `PROD-${Date.now().toString().slice(-6)}`,
      name: formName,
      price: numPrice,
      category: formCategory,
      stock: finalStock,
      sku: formSku,
      image: formImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
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

    if (verticalKey === "fashion") {
      // 1. Prints
      const rawPrints = product.attributes?.prints;
      let parsedPrints: string[] = [];
      if (Array.isArray(rawPrints)) {
        parsedPrints = rawPrints;
      } else if (typeof rawPrints === "string" && rawPrints.trim()) {
        parsedPrints = rawPrints.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (parsedPrints.length === 0 && product.variants) {
        parsedPrints = Array.from(new Set(product.variants.map((v) => v.print).filter(Boolean) as string[]));
      }
      const finalPrints = parsedPrints.length > 0 ? parsedPrints : ["Ankara Wax"];
      setFashionPrints(finalPrints);

      // 2. Colors
      const rawColors = product.attributes?.colors;
      let parsedColorNames: string[] = [];
      if (Array.isArray(rawColors)) {
        parsedColorNames = rawColors.map((c) => (typeof c === "string" ? c : c.name));
      } else if (typeof rawColors === "string" && rawColors.trim()) {
        parsedColorNames = rawColors.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (parsedColorNames.length === 0 && product.variants) {
        parsedColorNames = Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean) as string[]));
      }
      const distinctColorNames = Array.from(new Set(parsedColorNames));
      const finalColors = (distinctColorNames.length > 0 ? distinctColorNames : [AFRICAN_COLOR_PRESETS[0].name]).map(
        (name) => {
          const presetMatch = AFRICAN_COLOR_PRESETS.find((p) => p.name.toLowerCase() === name.toLowerCase());
          const variantMatch = product.variants?.find((v) => v.color?.toLowerCase() === name.toLowerCase());
          return {
            name,
            hex: variantMatch?.colorHex || presetMatch?.hex || "#111111",
          };
        }
      );
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
          product.stock || 5,
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

            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Category
              </label>
              <input
                type="text"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                placeholder="e.g. African Heritage, Haute Couture, Suiting"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
              />
            </div>

            <div>
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

              {/* 1. African Fabric Prints */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                    <span>African Fabric Prints & Weaves</span>
                    <span className="text-[10px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-md font-mono">
                      {fashionPrints.length} selected
                    </span>
                  </label>
                  <span className="text-[10px] text-[var(--nexa-text-muted)]">Click chip to toggle on/off</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {AFRICAN_PRINT_PRESETS.map((print) => {
                    const isSelected = fashionPrints.includes(print);
                    return (
                      <button
                        type="button"
                        key={print}
                        onClick={() => togglePrint(print)}
                        className={`px-2.5 py-1 text-xs rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                          isSelected
                            ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                            : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border-[var(--nexa-border)] hover:border-amber-500/40"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                        <span>{print}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Print Input */}
                <div className="flex items-center gap-2 pt-1">
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
                    placeholder="Add custom print (e.g. Akwete, Adire Alabere, Guipure Lace)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-amber-500 text-[var(--nexa-text-primary)]"
                  />
                  <button
                    type="button"
                    onClick={addCustomPrint}
                    disabled={!newCustomPrint.trim()}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--nexa-bg-surface)] hover:bg-amber-500/10 text-amber-600 border border-[var(--nexa-border)] hover:border-amber-500/40 disabled:opacity-50 cursor-pointer"
                  >
                    + Add Print
                  </button>
                </div>

                {fashionPrints.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-[var(--nexa-text-muted)] font-medium">Active Prints:</span>
                    {fashionPrints.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-medium border border-amber-500/20"
                      >
                        <span>{p}</span>
                        <button
                          type="button"
                          onClick={() => removePrint(p)}
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
                                {v.colorHex && (
                                  <div
                                    className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                                    style={{ backgroundColor: v.colorHex }}
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
    </BusinessShell>
  );
}
