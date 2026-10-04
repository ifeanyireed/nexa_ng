"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS, MOCK_SERVICES } from "@/data/mockStores";
import { VerticalType, Product, StoreService } from "@/types/storefront";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import { useCart } from "@/context/CartContext";
import {
  Search,
  SlidersHorizontal,
  X,
  ShoppingBag,
  ArrowRight,
  Tag,
  Clock,
  Layers,
  Check,
} from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialVertical = (searchParams.get("vertical") as VerticalType) || "all";

  const [query, setQuery] = useState(initialQuery);
  const [selectedVertical, setSelectedVertical] = useState<string>(initialVertical);
  const [activeTab, setActiveTab] = useState<"all" | "products" | "services">("all");
  const [sortBy, setSortBy] = useState<"relevance" | "price-asc" | "price-desc">("relevance");

  const currentStore =
    selectedVertical !== "all" && MOCK_STORES[selectedVertical as VerticalType]
      ? MOCK_STORES[selectedVertical as VerticalType]
      : MOCK_STORES["fashion"];

  const { addToCart, setIsCartOpen } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleQuickAdd = (product: Product) => {
    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      vertical: product.vertical,
    });
    setAddedId(product.id);
    setTimeout(() => {
      setAddedId(null);
      setIsCartOpen(true);
    }, 900);
  };

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((prod) => {
      const matchesVertical = selectedVertical === "all" || prod.vertical === selectedVertical;
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        prod.title.toLowerCase().includes(q) ||
        prod.description.toLowerCase().includes(q) ||
        prod.category.toLowerCase().includes(q) ||
        prod.tags?.some((t) => t.toLowerCase().includes(q));
      return matchesVertical && matchesQuery;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });
  }, [query, selectedVertical, sortBy]);

  const filteredServices = useMemo(() => {
    return MOCK_SERVICES.filter((srv) => {
      const matchesVertical = selectedVertical === "all" || srv.vertical === selectedVertical;
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        srv.title.toLowerCase().includes(q) ||
        srv.description.toLowerCase().includes(q) ||
        srv.category.toLowerCase().includes(q);
      return matchesVertical && matchesQuery;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });
  }, [query, selectedVertical, sortBy]);

  const verticalFilters = [
    { key: "all", label: "All Ecosystem" },
    { key: "fashion", label: "Fashion" },
    { key: "cars", label: "Cars" },
    { key: "food", label: "Food" },
    { key: "property", label: "Property" },
    { key: "gadgets", label: "Gadgets" },
    { key: "beauty", label: "Beauty" },
    { key: "home-living", label: "Home" },
    { key: "pharmacy", label: "Pharmacy" },
    { key: "hardware", label: "Hardware & Solar" },
    { key: "retail", label: "Retail & Gifts" },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between">
      <StoreHeader store={currentStore} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Search Header */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Ecosystem Search
          </h1>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across all 10 verticals: apparel, cars, food, solar inverters, medications, books..."
              className="w-full pl-12 pr-10 py-3.5 rounded-full border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Vertical Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {verticalFilters.map((vf) => (
              <button
                key={vf.key}
                onClick={() => setSelectedVertical(vf.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedVertical === vf.key
                    ? "bg-stone-900 text-white shadow-xs"
                    : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
              >
                {vf.label}
              </button>
            ))}
          </div>

          {/* Tabs & Sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-200">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === "all"
                    ? "bg-stone-200 text-stone-900 font-extrabold"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                All ({filteredProducts.length + filteredServices.length})
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === "products"
                    ? "bg-stone-200 text-stone-900 font-extrabold"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Products ({filteredProducts.length})
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === "services"
                    ? "bg-stone-200 text-stone-900 font-extrabold"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Services ({filteredServices.length})
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-400 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-stone-200 rounded-full px-3 py-1.5 text-xs font-semibold text-stone-700 focus:outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Area */}
        {filteredProducts.length === 0 && filteredServices.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
            <p className="text-base font-bold text-stone-800">No matching items found</p>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              We couldn't find anything matching &quot;{query}&quot;. Try adjusting your keywords or clearing the vertical filter.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setSelectedVertical("all");
              }}
              className="px-6 py-2.5 rounded-full bg-stone-900 text-white text-xs font-bold hover:bg-stone-800"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Products Grid */}
            {(activeTab === "all" || activeTab === "products") && filteredProducts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-stone-900">
                    Products ({filteredProducts.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((prod) => {
                    const isAdded = addedId === prod.id;
                    const detailHref =
                      prod.vertical === "cars"
                        ? `/cars/listing/${prod.id}`
                        : prod.vertical === "property"
                        ? `/property/listing/${prod.id}`
                        : prod.vertical === "food"
                        ? `/food/item/${prod.id}`
                        : `/${prod.vertical}/product/${prod.id}`;

                    return (
                      <div
                        key={prod.id}
                        className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <Link href={detailHref} className="block relative aspect-4/3 overflow-hidden bg-stone-100">
                            <img
                              src={prod.images[0]}
                              alt={prod.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 left-3">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-stone-800 shadow-xs">
                                {prod.vertical}
                              </span>
                            </div>
                          </Link>

                          <div className="p-4 space-y-1.5">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                              {prod.category}
                            </span>
                            <Link href={detailHref}>
                              <h3 className="font-bold text-sm text-stone-900 line-clamp-1 hover:text-emerald-700 transition-colors">
                                {prod.title}
                              </h3>
                            </Link>
                            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                              {prod.description}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between gap-2">
                          <span className="font-extrabold text-base text-stone-900">
                            ₦{prod.price.toLocaleString()}
                          </span>

                          <Link
                            href={detailHref}
                            className="px-4 py-2 rounded-full text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white transition-colors flex items-center gap-1.5"
                          >
                            <span>View Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Services Grid */}
            {(activeTab === "all" || activeTab === "services") && filteredServices.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-stone-900">
                    Services & Appointments ({filteredServices.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((srv) => {
                    const bookingHref =
                      srv.vertical === "beauty"
                        ? "/beauty/book-appointment"
                        : srv.vertical === "cars"
                        ? "/cars/listings"
                        : srv.vertical === "fashion"
                        ? "/fashion/custom-tailoring"
                        : srv.vertical === "gadgets"
                        ? "/gadgets/repairs"
                        : srv.vertical === "pharmacy"
                        ? "/pharmacy/consultation"
                        : srv.vertical === "hardware"
                        ? "/hardware/services"
                        : srv.vertical === "retail"
                        ? "/retail/customization"
                        : `/${srv.vertical}`;

                    return (
                      <div
                        key={srv.id}
                        className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative aspect-16/9 overflow-hidden bg-stone-100">
                            <img
                              src={srv.image}
                              alt={srv.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-stone-800 shadow-xs">
                                {srv.vertical} Service
                              </span>
                            </div>
                          </div>

                          <div className="p-5 space-y-2">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                              {srv.category}
                            </span>
                            <h3 className="font-bold text-sm text-stone-900 line-clamp-1">
                              {srv.title}
                            </h3>
                            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                              {srv.description}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-stone-400 pt-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{srv.durationMinutes} Minutes Session</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between gap-2">
                          <span className="font-extrabold text-base text-stone-900">
                            ₦{srv.price.toLocaleString()}
                          </span>

                          <Link
                            href={bookingHref}
                            className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white transition-colors flex items-center gap-1.5"
                          >
                            <span>Book Session</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <StoreFooter store={currentStore} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center p-8">Loading Search Index...</div>}>
      <SearchContent />
    </Suspense>
  );
}
