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
  Ruler,
  ShoppingBag,
  Check,
  Truck,
  ShieldCheck,
  ChevronLeft,
  Share2,
  X,
  Info,
  ZoomIn,
  WifiOff,
  Loader2,
} from "lucide-react";

export default function FashionProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { store: dynamicStore, tenantSlug } = useStorefrontTenant();
  const { products: liveProducts, isLoading, error: productsError, refetch } = useStorefrontProducts("fashion");
  const tenantQuery = tenantSlug ? `?tenant=${tenantSlug}` : "";

  const store = {
    ...MOCK_STORES.fashion,
    ...(dynamicStore || {}),
  };
  const { addToCart } = useCart();

  const productId = (params?.id as string) || "";
  const product = liveProducts.find((p) => p.id === productId);

  const normalizedPrints = useMemo(() => {
    if (!product?.fashionMeta?.prints || !Array.isArray(product.fashionMeta.prints)) return [];
    return product.fashionMeta.prints.map((p) => {
      if (typeof p === "string") {
        return {
          name: p,
          image: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
          description: "Artisanal African fabric print",
        };
      }
      return {
        name: p.name,
        image: p.image || "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
        description: p.description || "Artisanal African fabric print",
      };
    });
  }, [product?.fashionMeta?.prints]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedPrint, setSelectedPrint] = useState(
    normalizedPrints[0]?.name || (typeof product?.fashionMeta?.prints?.[0] === "string" ? product.fashionMeta.prints[0] : (product?.fashionMeta?.prints?.[0] as any)?.name) || ""
  );
  const [selectedPrintImage, setSelectedPrintImage] = useState(
    normalizedPrints[0]?.image || (product?.fashionMeta?.prints?.[0] as any)?.image || ""
  );
  const [selectedColor, setSelectedColor] = useState(
    product?.fashionMeta?.colors[0]?.name || "Raw Sandstone"
  );
  const [selectedSize, setSelectedSize] = useState(
    product?.fashionMeta?.sizes[1] || "M"
  );
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

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

  if (productsError) {
    return (
      <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col justify-between">
        <StoreHeader store={store} />
        <main className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-700 mx-auto">
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

  const effectivePrice = matchingVariant?.price || product.price;
  const isVariantOutOfStock = matchingVariant
    ? (matchingVariant.stock !== undefined && matchingVariant.stock <= 0)
    : !product.inStock;

  const handleAddToCart = () => {
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
    });

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-stone-500">
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

        {/* Product Workspace: Gallery + Size/Color Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Gallery (7 cols) - Swipeable Across Multiple Uploaded Angles */}
          <div className="lg:col-span-7">
            <SwipeableImageGallery
              images={product.images}
              title={product.title}
              selectedIndex={selectedImage}
              onSelectIndex={setSelectedImage}
              aspectRatioClass="aspect-[4/5]"
              thumbnailShapeClass="w-20 h-24 rounded-2xl"
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

              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-2xl font-bold text-zinc-900">
                  ₦{effectivePrice.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    ₦{product.originalPrice.toLocaleString()}
                  </span>
                )}
                {isVariantOutOfStock ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    Sold Out for this Variant
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    In Stock & Ready
                  </span>
                )}
              </div>
            </div>

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
                      <div
                        key={p.name}
                        onClick={() => {
                          setSelectedPrint(p.name);
                          setSelectedPrintImage(p.image);
                        }}
                        className={`group relative p-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 text-left ${
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
                          className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-stone-200 shrink-0 shadow-xs bg-stone-100 cursor-zoom-in group/circle hover:border-amber-600 hover:ring-2 hover:ring-amber-500/30 transition-all duration-200"
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
                          {/* Zoom Indicator on Hover */}
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
                      </div>
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
                  {/* Top Bar with Title and Close Button */}
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

                  {/* Expanded Swatch in a Bigger Frame */}
                  <div className="relative mt-3.5 aspect-square w-full rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 group shadow-inner">
                    <img
                      src={previewPrint.image}
                      alt={previewPrint.name}
                      className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-135"
                    />
                    <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-[11px] font-semibold text-white flex items-center gap-1.5 shadow-sm">
                      <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                      <span>Hover to magnify weave texture</span>
                    </div>
                  </div>

                  {/* Fabric Print Details */}
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

                  {/* Buttons */}
                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPrint(previewPrint.name);
                        setSelectedPrintImage(previewPrint.image);
                        setPreviewPrint(null);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Select This Print</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewPrint(null)}
                      className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
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

            {/* SIZE SELECTION & SIZE GUIDE TRIGGER */}
            {product.fashionMeta?.sizes && (
              <div className="space-y-2 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-zinc-900">Select Size:</span>
                    <span className="font-mono font-bold text-amber-700">{selectedSize}</span>
                  </div>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Guide</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {product.fashionMeta.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        selectedSize === s
                          ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <button
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
                    : `Add to Bag (${[selectedPrint, selectedColor, selectedSize].filter(Boolean).join(" · ")})`}
                </span>
              </button>

              {addedSuccess && (
                <div className="p-3 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Added to your bag! You can proceed to checkout anytime.</span>
                </div>
              )}

              <Link
                href="/fashion/custom-tailoring"
                className="w-full py-3 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold text-center block transition-colors"
              >
                Need custom measurements? Request Atelier Bespoke Fitting
              </Link>
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
          <h2 className="font-dropa text-xl font-bold text-zinc-900">Garment Craftsmanship & Details</h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
            {product.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">Key Highlights</h4>
              <ul className="space-y-1.5 text-xs text-stone-600 list-disc pl-4 font-light">
                {product.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">Fit & Care Notes</h4>
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
                onClick={() => setShowSizeGuide(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500 font-light">
              Measurements reflect anatomical body dimensions in inches. For custom bespoke tailored fit, choose "Bespoke Fit" during checkout.
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
                onClick={() => setShowSizeGuide(false)}
                className="px-5 py-2 rounded-full bg-zinc-900 text-white font-bold text-xs"
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
