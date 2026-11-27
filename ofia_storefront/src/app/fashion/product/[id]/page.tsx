"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_STORES } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import SwipeableImageGallery from "@/components/common/SwipeableImageGallery";
import { useCart } from "@/context/CartContext";
import { useStorefrontProducts } from "@/hooks/useStorefrontProducts";
import { useStorefrontTenant } from "@/context/StorefrontTenantContext";
import {
  useBuyerAuth,
  BespokeMeasurements,
  BuyerMeasurementPreset,
} from "@/context/BuyerAuthContext";
import { AFRICAN_PRINT_PRESETS, ApparelAccessoryItem } from "@/types/storefront";
import {
  Ruler,
  ShoppingBag,
  Check,
  Plus,
  Bookmark,
  Truck,
  ShieldCheck,
  X,
  ZoomIn,
  WifiOff,
  Loader2,
  Sparkles,
  Scissors,
  Save,
} from "lucide-react";

const EMPTY_MEASUREMENTS: BespokeMeasurements = {
  chest: "",
  waist: "",
  hips: "",
  shoulder: "",
  sleeveLength: "",
  garmentLength: "",
  neck: "",
  notes: "",
  unit: "in",
};

export default function FashionProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { store: dynamicStore, tenantSlug } = useStorefrontTenant();
  const { products: liveProducts, isLoading, error: productsError, refetch } =
    useStorefrontProducts("fashion");
  const {
    buyer,
    isAuthenticated,
    saveMeasurementPreset,
    toggleSaveProduct,
    isProductSaved,
    requireAuthModal,
  } = useBuyerAuth();
  const tenantQuery = tenantSlug ? `?tenant=${tenantSlug}` : "";

  const store = {
    ...MOCK_STORES.fashion,
    ...(dynamicStore || {}),
  };
  const { addToCart } = useCart();

  const productId = (params?.id as string) || "";
  const product = liveProducts.find((p) => p.id === productId);

  const normalizedPrints = useMemo(() => {
    const rawPrints =
      product?.fashionMeta?.prints ||
      (product as any)?.prints ||
      (product as any)?.attributes?.prints ||
      (product as any)?.attributes?.fashionPrints;

    if (Array.isArray(rawPrints) && rawPrints.length > 0) {
      return rawPrints.map((p) => {
        if (typeof p === "string") {
          const trimmed = p.trim();
          const found = AFRICAN_PRINT_PRESETS.find(
            (pre) => pre.name.toLowerCase() === trimmed.toLowerCase()
          );
          const varMatch = product?.variants?.find(
            (v) => v.print?.toLowerCase() === trimmed.toLowerCase()
          );
          return {
            name: trimmed,
            image:
              varMatch?.printImage ||
              found?.image ||
              "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
            description: found?.description || "Artisanal African fabric print",
          };
        }
        return {
          name: p?.name || "African Print",
          image:
            p?.image ||
            "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
          description: p?.description || "Artisanal African fabric print",
        };
      });
    }

    if (Array.isArray(product?.variants) && product.variants.length > 0) {
      const uniquePrintNames = Array.from(
        new Set(product.variants.map((v) => v.print).filter(Boolean))
      );
      if (uniquePrintNames.length > 0) {
        return uniquePrintNames.map((name) => {
          const varMatch = product.variants?.find((v) => v.print === name);
          const found = AFRICAN_PRINT_PRESETS.find(
            (pre) => pre.name.toLowerCase() === (name as string).toLowerCase()
          );
          return {
            name: name as string,
            image:
              varMatch?.printImage ||
              found?.image ||
              "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
            description: found?.description || "Artisanal African fabric print",
          };
        });
      }
    }

    return [];
  }, [product]);

  // Ensure "Bespoke Cut" is always available in size options
  const availableSizes = useMemo(() => {
    const baseSizes = Array.isArray(product?.fashionMeta?.sizes)
      ? [...product.fashionMeta.sizes]
      : ["S", "M", "L", "XL", "XXL"];
    const hasBespoke = baseSizes.some((s) => s.toLowerCase().includes("bespoke"));
    if (!hasBespoke) {
      baseSizes.push("Bespoke Cut");
    }
    return baseSizes;
  }, [product?.fashionMeta?.sizes]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedPrint, setSelectedPrint] = useState("");
  const [selectedPrintImage, setSelectedPrintImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);

  // Bespoke Cut Measurements & Preset States
  const [bespokeMeasurements, setBespokeMeasurements] =
    useState<BespokeMeasurements>(EMPTY_MEASUREMENTS);
  const [showBespokeModal, setShowBespokeModal] = useState(false);
  const [bespokeError, setBespokeError] = useState<string | null>(null);
  const [presetNameInput, setPresetNameInput] = useState("");
  const [activePresetName, setActivePresetName] = useState("");
  const [pendingAddToCartAfterBespoke, setPendingAddToCartAfterBespoke] = useState(false);

  const isBespokeSelected = useMemo(
    () => selectedSize.toLowerCase().includes("bespoke"),
    [selectedSize]
  );

  const hasCompleteBespokeMeasurements = useMemo(() => {
    return Boolean(
      bespokeMeasurements.chest.trim() &&
        bespokeMeasurements.waist.trim() &&
        bespokeMeasurements.hips.trim() &&
        bespokeMeasurements.shoulder.trim() &&
        bespokeMeasurements.sleeveLength.trim() &&
        bespokeMeasurements.garmentLength.trim()
    );
  }, [bespokeMeasurements]);

  // Auto-sync selected print when product/normalizedPrints loads
  useEffect(() => {
    if (normalizedPrints.length > 0) {
      if (!selectedPrint || !normalizedPrints.some((p) => p.name === selectedPrint)) {
        setSelectedPrint(normalizedPrints[0].name);
        setSelectedPrintImage(normalizedPrints[0].image);
      }
    }
  }, [normalizedPrints, selectedPrint]);

  // Auto-sync selected color when product colors load
  useEffect(() => {
    if (product?.fashionMeta?.colors && product.fashionMeta.colors.length > 0) {
      if (!selectedColor || !product.fashionMeta.colors.some((c) => c.name === selectedColor)) {
        setSelectedColor(product.fashionMeta.colors[0].name);
      }
    }
  }, [product?.fashionMeta?.colors, selectedColor]);

  // Auto-sync selected size when product sizes load
  useEffect(() => {
    if (availableSizes.length > 0) {
      if (!selectedSize || !availableSizes.includes(selectedSize)) {
        setSelectedSize(availableSizes[0] || "M");
      }
    }
  }, [availableSizes, selectedSize]);

  // African Fabric Print Preview Modal/Frame
  const [previewPrint, setPreviewPrint] = useState<{
    name: string;
    image: string;
    description?: string;
  } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewPrint(null);
      }
    };
    if (previewPrint) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewPrint]);

  // Find exact SKU matrix variant match (Print + Color + Size)
  const matchingVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    return product.variants.find((v) => {
      const matchSize = !v.size || v.size === selectedSize;
      const matchColor = !v.color || v.color === selectedColor;
      const matchPrint = !v.print || v.print === selectedPrint;
      return matchSize && matchColor && matchPrint;
    });
  }, [product?.variants, selectedSize, selectedColor, selectedPrint]);

  // Auto-sync selected image when matching variant has a specific image
  useEffect(() => {
    if (matchingVariant?.image && product?.images) {
      const idx = product.images.findIndex((img) => img === matchingVariant.image);
      if (idx !== -1) {
        setSelectedImage(idx);
      }
    }
  }, [matchingVariant?.image, product?.images]);

  const accessories: ApparelAccessoryItem[] = useMemo(() => {
    const raw =
      product?.accessories ||
      (product as any)?.attributes?.accessories ||
      (product as any)?.metadata?.accessories;
    return Array.isArray(raw) ? raw : [];
  }, [product]);

  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [previewAccessory, setPreviewAccessory] = useState<ApparelAccessoryItem | null>(null);

  const toggleAccessory = (accId: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(accId) ? prev.filter((id) => id !== accId) : [...prev, accId]
    );
  };

  const selectedAccessoriesData = useMemo(() => {
    return accessories.filter((acc) => selectedAccessories.includes(acc.id));
  }, [accessories, selectedAccessories]);

  const accessoriesTotal = useMemo(() => {
    return selectedAccessoriesData.reduce((sum, acc) => sum + (Number(acc.price) || 0), 0);
  }, [selectedAccessoriesData]);

  if (productsError) {
    return (
      <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col justify-between">
        <StoreHeader store={store} />
        <main className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-700 mx-auto">
            <WifiOff className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-amber-950">Connect to Internet</h2>
            <p className="text-xs text-amber-800 mt-1">
              Unable to reach store catalog database. Please verify your internet connection.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-5 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Retry Connection
          </button>
        </main>
        <StoreFooter store={store} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <StoreHeader store={store} />
        <div className="my-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-xs text-stone-500">Loading apparel piece...</p>
        </div>
        <StoreFooter store={store} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col justify-between">
        <StoreHeader store={store} />
        <main className="max-w-md mx-auto my-20 p-8 rounded-3xl border border-dashed border-stone-300 text-center space-y-4">
          <p className="text-base font-bold text-zinc-900">Piece Not Found</p>
          <p className="text-xs text-stone-500">
            This design is no longer available in the active atelier catalog.
          </p>
          <Link
            href={`/fashion/catalog${tenantQuery}`}
            className="inline-block px-5 py-2 rounded-full bg-zinc-900 hover:bg-amber-600 text-white text-xs font-bold transition"
          >
            Explore Catalog
          </Link>
        </main>
        <StoreFooter store={store} />
      </div>
    );
  }

  const basePrice = matchingVariant?.price || product.price;
  const effectivePrice = basePrice + accessoriesTotal;
  const isVariantOutOfStock = matchingVariant
    ? matchingVariant.stock !== undefined && matchingVariant.stock <= 0
    : !product.inStock;

  const productSaved = isProductSaved(product.id);

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    if (size.toLowerCase().includes("bespoke")) {
      setBespokeError(null);
      setShowBespokeModal(true);
    }
  };

  const handleToggleSaveProductToProfile = () => {
    const performSave = async () => {
      const res = await toggleSaveProduct({
        productId: product.id,
        title: product.title,
        price: effectivePrice,
        image: matchingVariant?.image || product.images[selectedImage] || product.images[0],
        vertical: "fashion",
        storeSlug: tenantSlug || store.slug,
        selectedPrint: selectedPrint || undefined,
        selectedColor: selectedColor || undefined,
        selectedSize: selectedSize || undefined,
      });
      setProfileNotice(
        res.saved
          ? "Saved piece & style selection to your storefront profile!"
          : "Removed piece from your saved profile items."
      );
      setTimeout(() => setProfileNotice(null), 3500);
    };

    if (!isAuthenticated) {
      requireAuthModal(
        "Sign in or create a storefront account to save this piece and your style preferences to your profile.",
        performSave
      );
      return;
    }
    performSave();
  };

  const handleSavePresetToProfile = () => {
    if (!hasCompleteBespokeMeasurements) {
      setBespokeError(
        "Please enter all required anatomical measurements (Chest, Waist, Hips, Shoulder, Sleeve, and Garment Length) before saving a preset."
      );
      return;
    }

    const doSavePreset = async () => {
      const label =
        presetNameInput.trim() ||
        activePresetName ||
        `${product.title.slice(0, 18)} Bespoke Fit`;
      const saved = await saveMeasurementPreset({
        name: label,
        measurements: bespokeMeasurements,
        preferredPrint: selectedPrint || undefined,
        preferredColor: selectedColor || undefined,
      });
      if (saved) {
        setActivePresetName(saved.name);
        setPresetNameInput(saved.name);
        setBespokeError(null);
        setProfileNotice(`Saved "${saved.name}" preset to your storefront profile!`);
        setTimeout(() => setProfileNotice(null), 4000);
      }
    };

    if (!isAuthenticated) {
      requireAuthModal(
        "Sign in or create a storefront account to save bespoke measurement presets to your profile.",
        doSavePreset
      );
      return;
    }
    doSavePreset();
  };

  const handleApplySavedPreset = (preset: BuyerMeasurementPreset) => {
    setBespokeMeasurements({
      ...EMPTY_MEASUREMENTS,
      ...preset.measurements,
    });
    setActivePresetName(preset.name);
    setPresetNameInput(preset.name);
    if (preset.preferredPrint && normalizedPrints.some((p) => p.name === preset.preferredPrint)) {
      const found = normalizedPrints.find((p) => p.name === preset.preferredPrint);
      setSelectedPrint(preset.preferredPrint);
      if (found?.image) setSelectedPrintImage(found.image);
    }
    if (
      preset.preferredColor &&
      product.fashionMeta?.colors?.some((c) => c.name === preset.preferredColor)
    ) {
      setSelectedColor(preset.preferredColor);
    }
    setBespokeError(null);
  };

  const executeAddToCart = () => {
    const measurementSummary = isBespokeSelected
      ? `Bespoke (${bespokeMeasurements.unit || "in"}): Chest ${bespokeMeasurements.chest}, Waist ${bespokeMeasurements.waist}, Hips ${bespokeMeasurements.hips}, Shoulder ${bespokeMeasurements.shoulder}, Sleeve ${bespokeMeasurements.sleeveLength}, Length ${bespokeMeasurements.garmentLength}${
          bespokeMeasurements.neck ? `, Neck ${bespokeMeasurements.neck}` : ""
        }${bespokeMeasurements.notes ? ` · Notes: ${bespokeMeasurements.notes}` : ""}`
      : undefined;

    addToCart({
      productId: product.id,
      sku: matchingVariant?.sku || product.sku,
      title: product.title,
      price: effectivePrice,
      image: matchingVariant?.image || product.images[selectedImage] || product.images[0],
      quantity: 1,
      vertical: "fashion",
      selectedColor,
      selectedSize,
      selectedPrint: selectedPrint || undefined,
      selectedPrintImage: selectedPrintImage || matchingVariant?.printImage || undefined,
      selectedAccessories: selectedAccessoriesData.map((a) => ({
        id: a.id,
        name: a.name,
        price: Number(a.price) || 0,
        image: a.image,
      })),
      bespokeMeasurements: isBespokeSelected
        ? {
            ...bespokeMeasurements,
            presetName: activePresetName || presetNameInput || undefined,
          }
        : undefined,
      specialInstructions: measurementSummary,
    });

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  const handleAddToCart = () => {
    // When Bespoke Cut is selected, prompt the user to enter required measurements before adding to cart
    if (isBespokeSelected && !hasCompleteBespokeMeasurements) {
      setPendingAddToCartAfterBespoke(true);
      setBespokeError(
        "Please complete your required Bespoke Cut measurements below before adding this piece to your bag."
      );
      setShowBespokeModal(true);
      return;
    }

    executeAddToCart();
  };

  const handleConfirmBespokeMeasurements = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasCompleteBespokeMeasurements) {
      setBespokeError(
        "Please enter Chest/Bust, Waist, Hips, Shoulder Width, Sleeve Length, and Garment Length."
      );
      return;
    }
    setBespokeError(null);
    setShowBespokeModal(false);
    if (pendingAddToCartAfterBespoke) {
      setPendingAddToCartAfterBespoke(false);
      executeAddToCart();
    }
  };

  const savedPresets = buyer?.measurementPresets || [];

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">
        {/* Breadcrumbs */}
        <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
          <div className="flex items-center gap-2 min-w-0">
            <Link href={`/fashion${tenantQuery}`} className="hover:text-zinc-900 transition-colors">
              {store.name}
            </Link>
            <span>/</span>
            <Link href={`/fashion/catalog${tenantQuery}`} className="hover:text-zinc-900 transition-colors">
              Catalog
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-semibold truncate">{product.title}</span>
          </div>

          <button
            type="button"
            onClick={handleToggleSaveProductToProfile}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              productSaved
                ? "bg-amber-700 text-white border-amber-700 shadow-xs"
                : "bg-white text-stone-700 border-stone-200 hover:border-amber-700/50"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${productSaved ? "fill-current" : ""}`} />
            <span>{productSaved ? "Saved to Profile" : "Save Piece"}</span>
          </button>
        </div>

        {/* Product Workspace: Gallery (Left Vertical Thumbnails + Reduced Desktop Height) + Configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Gallery (7 cols) - Vertical Left Carousel on Desktop + Floating Sticky Above Bottom Nav on Mobile */}
          <div className="lg:col-span-7">
            <SwipeableImageGallery
              images={product.images}
              title={product.title}
              selectedIndex={selectedImage}
              onSelectIndex={setSelectedImage}
              aspectRatioClass="aspect-[4/5]"
              desktopVerticalLeft={true}
              desktopImageHeightClass="lg:h-[520px] lg:aspect-auto"
              thumbnailShapeClass="w-16 h-20 rounded-2xl"
              activeThumbnailClass="border-amber-700 shadow-md scale-105 ring-2 ring-amber-700/20"
              inactiveThumbnailClass="border-transparent opacity-70 hover:opacity-100"
              badges={
                product.isNewDrop ? (
                  <div className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                    New Drop
                  </div>
                ) : null
              }
            />
          </div>

          {/* Right Product Configurator & Purchasing (5 cols) */}
          <div className="lg:col-span-5 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                {product.category}
              </span>
              <h1 className="font-dropa text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mt-1">
                {product.title}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light leading-relaxed">
                {product.subtitle}
              </p>

              <div className="flex items-baseline gap-3 mt-4 flex-wrap">
                <span className="text-2xl font-bold text-zinc-900">
                  ₦{effectivePrice.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    ₦{product.originalPrice.toLocaleString()}
                  </span>
                )}
                {isVariantOutOfStock ? (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    Sold Out for this Variant
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    In Stock &amp; Ready
                  </span>
                )}
              </div>
            </div>

            {profileNotice && (
              <div className="px-4 py-2.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{profileNotice}</span>
              </div>
            )}

            {/* AFRICAN FABRIC PRINT SELECTION WITH TEXTURE SNAPSHOTS & EXPANDABLE PREVIEW */}
            {normalizedPrints && normalizedPrints.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-zinc-900">African Fabric Print:</span>
                    <span className="font-semibold text-amber-700">{selectedPrint || "Select Print"}</span>
                  </div>
                  <span className="text-[11px] text-stone-400">Click circle to expand swatch</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {normalizedPrints.map((p) => {
                    const isSelected = selectedPrint === p.name;
                    return (
                      <button
                        type="button"
                        key={p.name}
                        onClick={() => {
                          setSelectedPrint(p.name);
                          setSelectedPrintImage(p.image);
                        }}
                        className={`group relative px-2.5 py-2 rounded-full border transition-all cursor-pointer flex items-center gap-2 text-left ${
                          isSelected
                            ? "bg-amber-900/10 border-amber-700 text-amber-950 shadow-sm ring-1 ring-amber-700"
                            : "bg-white border-stone-200 text-stone-700 hover:border-amber-700/40 hover:bg-stone-50/80"
                        }`}
                        title={p.description || p.name}
                      >
                        {/* Circular Swatch with Zoom Indicator & Expand Trigger */}
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewPrint(p);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              setPreviewPrint(p);
                            }
                          }}
                          className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-stone-200 shrink-0 shadow-xs bg-stone-100 cursor-zoom-in group/circle hover:border-amber-600 hover:ring-2 hover:ring-amber-500/30 transition-all duration-200"
                          title={`Click circle to expand ${p.name} fabric preview`}
                        >
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/circle:scale-125"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-amber-800">
                              {p.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/circle:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <ZoomIn className="w-3.5 h-3.5 text-white drop-shadow-md stroke-[2.5]" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold block truncate leading-tight">{p.name}</span>
                          <span className="text-[10px] text-stone-400 font-medium block truncate">
                            African Weave
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-amber-700 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* EXPANDED FABRIC SWATCH PREVIEW FRAME */}
            {previewPrint && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
                onClick={() => setPreviewPrint(null)}
              >
                <div
                  className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-200/80 overflow-hidden animate-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Fabric Swatch Inspection
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewPrint(null)}
                      className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                      title="Close Preview"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative mt-3.5 aspect-square w-full rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 group shadow-inner">
                    <img
                      src={previewPrint.image}
                      alt={previewPrint.name}
                      className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-135"
                    />
                    <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-[11px] font-semibold text-white flex items-center gap-1.5 shadow-sm">
                      <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                      <span>Hover to magnify weave texture</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-base font-extrabold text-zinc-900">{previewPrint.name}</h3>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wide">
                        African Textile
                      </span>
                    </div>
                    {previewPrint.description && (
                      <p className="text-xs text-stone-500 leading-relaxed pt-0.5">
                        {previewPrint.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPrint(previewPrint.name);
                        setSelectedPrintImage(previewPrint.image);
                        setPreviewPrint(null);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-full bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Select This Print</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewPrint(null)}
                      className="py-2.5 px-4 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* EXPANDED ACCESSORY PREVIEW MODAL */}
            {previewAccessory && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
                onClick={() => setPreviewAccessory(null)}
              >
                <div
                  className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-200/80 overflow-hidden animate-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Accessory Detail
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewAccessory(null)}
                      className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                      title="Close Preview"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative mt-3.5 aspect-square w-full rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-inner">
                    <img
                      src={previewAccessory.image}
                      alt={previewAccessory.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="mt-4 space-y-1">
                    <h3 className="text-base font-extrabold text-zinc-900">{previewAccessory.name}</h3>
                    <p className="text-sm font-bold text-amber-700">
                      ₦{Number(previewAccessory.price || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedAccessories.includes(previewAccessory.id)) {
                          toggleAccessory(previewAccessory.id);
                        }
                        setPreviewAccessory(null);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-full bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>
                        {selectedAccessories.includes(previewAccessory.id)
                          ? "Already Added"
                          : "Add to Order"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewAccessory(null)}
                      className="py-2.5 px-4 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* COLOR SELECTION */}
            {product.fashionMeta?.colors && (
              <div className="space-y-2 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-900">Color:</span>
                  <span className="font-semibold text-amber-700">{selectedColor}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {product.fashionMeta.colors.map((c) => (
                    <button
                      type="button"
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`relative w-8 h-8 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                        selectedColor === c.name
                          ? "border-amber-700 scale-110 shadow-md ring-2 ring-amber-700/20"
                          : "border-stone-200 hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor === c.name && (
                        <Check
                          className={`w-4 h-4 ${
                            c.hex === "#111111" || c.hex === "#1E2A38"
                              ? "text-white"
                              : "text-zinc-900"
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SIZE SELECTION & BESPOKE CUT TRIGGER */}
            <div className="space-y-2.5 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-900">Select Size:</span>
                  <span className="font-mono font-bold text-amber-700">{selectedSize}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  className="px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableSizes.map((s) => {
                  const isBespokeBtn = s.toLowerCase().includes("bespoke");
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => handleSelectSize(s)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedSize === s
                          ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                          : isBespokeBtn
                          ? "bg-amber-50/70 text-amber-900 border-amber-300 hover:bg-amber-100/80"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {isBespokeBtn && <Scissors className="w-3.5 h-3.5" />}
                      <span>{s}</span>
                    </button>
                  );
                })}
              </div>

              {/* BESPOKE CUT INLINE SUMMARY & PRESET BAR */}
              {isBespokeSelected && (
                <div className="mt-3 p-4 rounded-3xl bg-amber-50/70 border border-amber-200/90 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-amber-800 shrink-0" />
                      <span className="text-xs font-bold text-amber-950">
                        Bespoke Cut Anatomical Measurements
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBespokeError(null);
                        setShowBespokeModal(true);
                      }}
                      className="px-3 py-1 rounded-full bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      {hasCompleteBespokeMeasurements ? "Edit Measurements" : "Enter Measurements"}
                    </button>
                  </div>

                  {hasCompleteBespokeMeasurements ? (
                    <div className="text-[11px] text-amber-900 font-medium bg-white/90 px-3.5 py-2 rounded-2xl border border-amber-200/70 flex flex-wrap gap-x-3 gap-y-1">
                      {activePresetName && (
                        <span className="font-bold text-amber-800">Preset: {activePresetName} ·</span>
                      )}
                      <span>Chest: {bespokeMeasurements.chest}&quot;</span>
                      <span>Waist: {bespokeMeasurements.waist}&quot;</span>
                      <span>Hips: {bespokeMeasurements.hips}&quot;</span>
                      <span>Shoulder: {bespokeMeasurements.shoulder}&quot;</span>
                      <span>Sleeve: {bespokeMeasurements.sleeveLength}&quot;</span>
                      <span>Length: {bespokeMeasurements.garmentLength}&quot;</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-800">
                      Required before adding to bag: Please enter your anatomical measurements or load a saved preset from your storefront profile.
                    </p>
                  )}

                  {savedPresets.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        Saved Profile Presets:
                      </span>
                      {savedPresets.map((pr) => (
                        <button
                          key={pr.id}
                          type="button"
                          onClick={() => handleApplySavedPreset(pr)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                            activePresetName === pr.name
                              ? "bg-amber-800 text-white border-amber-800"
                              : "bg-white text-amber-900 border-amber-300 hover:bg-amber-100"
                          }`}
                        >
                          {pr.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* COMPANION ACCESSORIES & ADD-ONS (FULLY ROUNDED CORNERS + PLUS ICON) */}
            {accessories.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                      Complete the Look / Matching Accessories
                    </span>
                  </div>
                  {accessoriesTotal > 0 && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      +₦{accessoriesTotal.toLocaleString()} added
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  {accessories.map((acc) => {
                    const isSelected = selectedAccessories.includes(acc.id);
                    return (
                      <div
                        key={acc.id}
                        onClick={() => toggleAccessory(acc.id)}
                        className={`px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full border transition-all cursor-pointer flex items-center justify-between gap-3 min-h-[68px] shadow-2xs hover:shadow-xs ${
                          isSelected
                            ? "bg-amber-900/10 border-amber-700 text-amber-950 shadow-sm ring-1 ring-amber-700"
                            : "bg-white border-stone-200 text-stone-700 hover:border-amber-700/40 hover:bg-stone-50/80"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {acc.image ? (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewAccessory(acc);
                              }}
                              className="relative w-12 h-12 rounded-full overflow-hidden border border-stone-200 shrink-0 bg-stone-100 cursor-zoom-in group/circle hover:ring-2 hover:ring-amber-500/40 transition-all shadow-2xs"
                              title="Click to zoom accessory image"
                            >
                              <img
                                src={acc.image}
                                alt={acc.name}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover/circle:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/circle:opacity-100 transition-opacity flex items-center justify-center">
                                <ZoomIn className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-amber-800 shrink-0">
                              {acc.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-bold block truncate text-zinc-900 leading-tight">
                              {acc.name}
                            </span>
                            <span className="text-xs font-semibold text-amber-700 font-mono block mt-0.5">
                              {acc.price > 0 ? `+₦${Number(acc.price).toLocaleString()}` : "Included in Set"}
                            </span>
                          </div>
                        </div>

                        {/* Circular Plus Icon Trigger (Check when selected) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAccessory(acc.id);
                          }}
                          aria-label={isSelected ? `Remove ${acc.name}` : `Add ${acc.name}`}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                            isSelected
                              ? "bg-amber-700 border-amber-700 text-white shadow-xs"
                              : "border-stone-300 bg-stone-50 text-stone-700 hover:bg-amber-50 hover:border-amber-600 hover:text-amber-800"
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS (ALL ROUNDED-FULL) */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isVariantOutOfStock}
                className={`w-full py-4 rounded-full font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isVariantOutOfStock
                    ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                    : "bg-amber-700 hover:bg-amber-800 text-white active:scale-98"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isVariantOutOfStock
                    ? `Sold Out (${[selectedPrint, selectedColor, selectedSize].filter(Boolean).join(" · ")})`
                    : isBespokeSelected && !hasCompleteBespokeMeasurements
                    ? `Enter Bespoke Measurements · ₦${effectivePrice.toLocaleString()}`
                    : `Add to Bag · ₦${effectivePrice.toLocaleString()}${
                        selectedAccessoriesData.length > 0
                          ? ` (+${selectedAccessoriesData.length} accessories)`
                          : ""
                      }`}
                </span>
              </button>

              {addedSuccess && (
                <div className="p-3 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Added to your bag! You can proceed to checkout anytime.</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSize("Bespoke Cut");
                    setBespokeError(null);
                    setShowBespokeModal(true);
                  }}
                  className="flex-1 py-3 px-4 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Scissors className="w-3.5 h-3.5 text-amber-700" />
                  <span>Bespoke Measurement Presets</span>
                </button>

                <Link
                  href="/fashion/custom-tailoring"
                  className="flex-1 py-3 px-4 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold text-center block transition-colors"
                >
                  Request Atelier Fitting
                </Link>
              </div>
            </div>

            {/* Assurance Perks */}
            <div className="pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Dispatched via Ofia Logistics within 24 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Genuine Heritage Fabric Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Garment Highlights & Care */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
          <h2 className="font-dropa text-xl font-bold text-zinc-900">
            Garment Craftsmanship &amp; Details
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
            {product.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
                Key Highlights
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-600 list-disc pl-4 font-light">
                {product.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
                Fit &amp; Care Notes
              </h4>
              <p className="text-xs text-stone-600 font-light mb-1">
                <strong>Fit:</strong> {product.fashionMeta?.fit}
              </p>
              <p className="text-xs text-stone-600 font-light">
                <strong>Care:</strong> {product.fashionMeta?.careInstructions}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* BESPOKE CUT MEASUREMENTS & PROFILE PRESETS MODAL */}
      {showBespokeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowBespokeModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-dropa font-bold text-lg text-zinc-900">
                    Bespoke Cut Measurements
                  </h3>
                  <p className="text-xs text-stone-500">
                    Required anatomical dimensions for custom tailoring ({product.title})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBespokeModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Load or Save Profile Presets Bar */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-zinc-900">
                  Storefront Profile Measurement Presets
                </span>
                {!isAuthenticated && (
                  <button
                    type="button"
                    onClick={() =>
                      requireAuthModal(
                        "Sign in or create a storefront account to load and save your bespoke measurement presets."
                      )
                    }
                    className="px-3 py-1 rounded-full bg-zinc-900 text-white text-[11px] font-bold cursor-pointer"
                  >
                    Sign In to Load Presets
                  </button>
                )}
              </div>

              {isAuthenticated && savedPresets.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {savedPresets.map((pr) => (
                    <button
                      key={pr.id}
                      type="button"
                      onClick={() => handleApplySavedPreset(pr)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        activePresetName === pr.name
                          ? "bg-amber-700 text-white border-amber-700 shadow-xs"
                          : "bg-white text-stone-700 border-stone-300 hover:border-amber-700"
                      }`}
                    >
                      {pr.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-stone-500">
                  {isAuthenticated
                    ? "You have no saved measurement presets yet. Fill your dimensions below and click 'Save Preset to Profile'."
                    : "Sign in to your storefront profile to load saved measurements or save a reusable preset."}
                </p>
              )}
            </div>

            {bespokeError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {bespokeError}
              </div>
            )}

            <form onSubmit={handleConfirmBespokeMeasurements} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Chest / Bust (in) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 42"
                    value={bespokeMeasurements.chest}
                    onChange={(e) =>
                      setBespokeMeasurements({ ...bespokeMeasurements, chest: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-full border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Waist (in) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 34"
                    value={bespokeMeasurements.waist}
                    onChange={(e) =>
                      setBespokeMeasurements({ ...bespokeMeasurements, waist: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-full border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Hips (in) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 43"
                    value={bespokeMeasurements.hips}
                    onChange={(e) =>
                      setBespokeMeasurements({ ...bespokeMeasurements, hips: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-full border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Shoulder Width (in) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 18.5"
                    value={bespokeMeasurements.shoulder}
                    onChange={(e) =>
                      setBespokeMeasurements({ ...bespokeMeasurements, shoulder: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-full border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Sleeve Length (in) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 25"
                    value={bespokeMeasurements.sleeveLength}
                    onChange={(e) =>
                      setBespokeMeasurements({
                        ...bespokeMeasurements,
                        sleeveLength: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-full border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Garment Length (in) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 36"
                    value={bespokeMeasurements.garmentLength}
                    onChange={(e) =>
                      setBespokeMeasurements({
                        ...bespokeMeasurements,
                        garmentLength: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-full border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Neck / Collar (in, optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 16.5"
                    value={bespokeMeasurements.neck || ""}
                    onChange={(e) =>
                      setBespokeMeasurements({ ...bespokeMeasurements, neck: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-full border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Tailoring Notes (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Relaxed senator fit, tapered ankle"
                    value={bespokeMeasurements.notes || ""}
                    onChange={(e) =>
                      setBespokeMeasurements({ ...bespokeMeasurements, notes: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-full border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              </div>

              {/* Save Preset to Profile Row */}
              <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  placeholder="Preset name (e.g. My Senator Fit)"
                  value={presetNameInput}
                  onChange={(e) => setPresetNameInput(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-full border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
                <button
                  type="button"
                  onClick={handleSavePresetToProfile}
                  className="px-4 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Preset to Profile</span>
                </button>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBespokeModal(false)}
                  className="px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {pendingAddToCartAfterBespoke
                      ? "Confirm Measurements & Add to Bag"
                      : "Apply Bespoke Measurements"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIZE GUIDE MODAL */}
      {showSizeGuide && product.fashionMeta?.sizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-amber-700" />
                <h3 className="font-dropa font-bold text-lg text-zinc-900">Atelier Size Guide</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-zinc-900 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500 font-light">
              Measurements reflect anatomical body dimensions in inches. For custom bespoke tailored fit, select &ldquo;Bespoke Cut&rdquo; on the product page.
            </p>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold">
                  <th className="p-2.5">Size</th>
                  <th className="p-2.5">Chest / Bust</th>
                  <th className="p-2.5">Waist</th>
                  <th className="p-2.5">Hips</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {product.fashionMeta.sizeGuide.map((row) => (
                  <tr key={row.size} className="hover:bg-amber-50/50">
                    <td className="p-2.5 font-bold text-zinc-900">{row.size}</td>
                    <td className="p-2.5 text-stone-600">{row.chest}</td>
                    <td className="p-2.5 text-stone-600">{row.waist}</td>
                    <td className="p-2.5 text-stone-600">{row.hips}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="px-5 py-2 rounded-full bg-zinc-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      <StoreFooter store={store} />
    </div>
  );
}
