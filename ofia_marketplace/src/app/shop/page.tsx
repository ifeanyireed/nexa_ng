"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  Filter, 
  Search, 
  MapPin, 
  SlidersHorizontal,
  Star,
  Heart,
  Truck,
  CreditCard,
  X
} from "lucide-react";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaInput } from "@/components/nexa/NexaInput";
import { Footer } from "@/components/nexa/Footer";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { NICHE_DETAILS } from "@/lib/niche-data";
import { useFavorites } from "@/lib/useFavorites";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu"];

function CentralShopContent() {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [homeDelivery, setHomeDelivery] = useState(false);
  const [acceptsPos, setAcceptsPos] = useState(false);
  
  // Mobile Filters Overlay
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.append("q", searchQuery.trim());
        if (selectedNiche && selectedNiche !== "all") params.append("niche", selectedNiche);
        if (selectedCity && selectedCity !== "all") params.append("city", selectedCity);
        if (minPrice) params.append("min_price", minPrice);
        if (maxPrice) params.append("max_price", maxPrice);
        if (homeDelivery) params.append("home_delivery", "true");
        if (acceptsPos) params.append("accepts_pos", "true");

        const result = await api.get(`/discovery/products?${params.toString()}`);
        setProducts(result || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedNiche, selectedCity, minPrice, maxPrice, homeDelivery, acceptsPos]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedNiche("all");
    setSelectedCity("all");
    setMinPrice("");
    setMaxPrice("");
    setHomeDelivery(false);
    setAcceptsPos(false);
  };

  const getProductDetailUrl = (product: any) => {
    const nicheSlug = product.proProfile?.niche || "handyman-finders";
    return `/${nicheSlug}/shop/${product.id}`;
  };

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      {/* SHOP HEADER */}
      <section className="pt-24 pb-8 bg-nexa-bg-surface border-b border-nexa-border sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
             <div>
                <NexaBadge variant="brand" className="mb-2">Nexa Central Shop</NexaBadge>
                <h1 className="text-3xl font-extrabold text-display">Nexa Central Marketplace</h1>
                <p className="text-xs text-nexa-text-secondary mt-1">Browse and buy verified products from verified service networks nationwide.</p>
             </div>
             <div className="flex items-center gap-3 w-full md:w-auto">
                <NexaInput 
                   variant="search" 
                   placeholder="Search all products..." 
                   className="flex-1 md:w-80" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden w-12 h-12 rounded-xl bg-nexa-bg-base border border-nexa-border flex items-center justify-center text-nexa-text-primary"
                >
                   <SlidersHorizontal className="w-5 h-5" />
                </button>
             </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          
          {/* SIDEBAR FILTERS (DESKTOP) */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-6">
            <NexaCard className="p-6 sticky top-52">
              <div className="flex items-center justify-between pb-4 border-b border-nexa-border mb-6">
                <span className="font-extrabold text-sm flex items-center gap-2">
                  <Filter className="w-4 h-4 text-nexa-brand" />
                  Filters
                </span>
                <button 
                  onClick={clearFilters} 
                  className="text-xs font-bold text-nexa-brand hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* Niche Categories */}
              <div className="space-y-3 mb-6">
                <h4 className="font-bold text-xs text-nexa-text-faint uppercase tracking-wider">Categories</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                  <button 
                    onClick={() => setSelectedNiche("all")}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all",
                      selectedNiche === "all" ? "bg-nexa-brand/10 text-nexa-brand" : "text-nexa-text-secondary hover:bg-nexa-bg-base"
                    )}
                  >
                    All Categories
                  </button>
                  {Object.entries(NICHE_DETAILS).map(([slug, details]) => (
                    <button 
                      key={slug}
                      onClick={() => setSelectedNiche(slug)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all truncate",
                        selectedNiche === slug ? "bg-nexa-brand/10 text-nexa-brand" : "text-nexa-text-secondary hover:bg-nexa-bg-base"
                      )}
                    >
                      {details.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* City Selection */}
              <div className="space-y-3 mb-6">
                <h4 className="font-bold text-xs text-nexa-text-faint uppercase tracking-wider">Location</h4>
                <select 
                  value={selectedCity} 
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-nexa-bg-base border border-nexa-border rounded-xl px-3 py-2 text-xs font-bold focus:ring-0 focus:outline-none"
                >
                  <option value="all">All Locations</option>
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div className="space-y-3 mb-6">
                <h4 className="font-bold text-xs text-nexa-text-faint uppercase tracking-wider">Price Range (₦)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice} 
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-nexa-bg-base border border-nexa-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-nexa-bg-base border border-nexa-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Delivery and Payments */}
              <div className="space-y-4 pt-4 border-t border-nexa-border">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={homeDelivery} 
                    onChange={(e) => setHomeDelivery(e.target.checked)}
                    className="w-4 h-4 rounded text-nexa-brand border-nexa-border focus:ring-0 focus:outline-none cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-nexa-text-primary group-hover:text-nexa-brand transition-colors">Nationwide Delivery</span>
                    <span className="text-[10px] text-nexa-text-faint">Home delivery options</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={acceptsPos} 
                    onChange={(e) => setAcceptsPos(e.target.checked)}
                    className="w-4 h-4 rounded text-nexa-brand border-nexa-border focus:ring-0 focus:outline-none cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-nexa-text-primary group-hover:text-nexa-brand transition-colors">Pay on Delivery</span>
                    <span className="text-[10px] text-nexa-text-faint">Accepts POS / card on delivery</span>
                  </div>
                </label>
              </div>
            </NexaCard>
          </aside>

          {/* PRODUCT LIST GRID */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-3xl bg-nexa-bg-surface animate-pulse" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 3) * 0.05 }}
                  >
                    <NexaCard variant="flat" padding="none" className="group h-full flex flex-col cursor-pointer overflow-hidden border border-nexa-border/30 hover:border-nexa-brand/30">
                      <Link href={getProductDetailUrl(product)} className="flex-1 flex flex-col">
                        <div className="aspect-square relative overflow-hidden bg-slate-100/10">
                          {/* Badges */}
                          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                            {product.proProfile?.homeDelivery && (
                              <NexaBadge variant="neutral" className="bg-emerald-500/15 text-emerald-500 border-none backdrop-blur-md text-[9px] px-2 py-0.5">
                                Delivery
                              </NexaBadge>
                            )}
                            {product.proProfile?.acceptsPos && (
                              <NexaBadge variant="neutral" className="bg-blue-500/15 text-blue-500 border-none backdrop-blur-md text-[9px] px-2 py-0.5">
                                Pay on Delivery
                              </NexaBadge>
                            )}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(product.id, e);
                            }} 
                            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center text-nexa-text-faint hover:text-rose-500 transition-colors shadow-sm"
                          >
                            <Heart className={cn("w-4 h-4 transition-colors", isFavorite(product.id) ? "fill-rose-500 text-rose-500" : "")} />
                          </button>
                          <img 
                            src={product.image || "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400"} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            alt={product.name}
                          />
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-extrabold text-nexa-text-faint uppercase tracking-wider">
                              {product.proProfile?.businessName || "Verified Supply"}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span className="text-[10px] font-bold">{product.proProfile?.rating || "5.0"}</span>
                            </div>
                          </div>
                          
                          <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-nexa-brand transition-colors">
                            {product.name}
                          </h3>

                          {product.proProfile?.city && (
                            <div className="flex items-center gap-1 text-[10px] text-nexa-text-secondary mb-4 mt-auto">
                              <MapPin className="w-3 h-3" />
                              <span>{product.proProfile.city}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-nexa-border">
                            <p className="font-extrabold text-nexa-brand text-base">₦{product.price.toLocaleString()}</p>
                            <span className="text-[9px] text-nexa-text-faint line-through">₦{(product.price * 1.2).toLocaleString()}</span>
                          </div>
                        </div>
                      </Link>
                    </NexaCard>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center space-y-6 bg-nexa-bg-surface/10 rounded-[32px] border border-dashed border-nexa-border/80">
                <div className="w-20 h-20 rounded-full bg-nexa-bg-surface flex items-center justify-center mx-auto text-nexa-text-faint">
                   <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold">No products found</h3>
                <p className="text-nexa-text-secondary text-sm max-w-sm mx-auto">We couldn't find any products matching your active filters. Try clearing your filters or tweaking your search term.</p>
                <NexaButton variant="secondary" onClick={clearFilters}>Reset Filters</NexaButton>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MOBILE FILTERS DRAWER */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black z-50 lg:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-80 bg-nexa-bg-surface border-l border-nexa-border p-6 z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-nexa-border mb-6">
                <span className="font-extrabold text-sm flex items-center gap-2">
                  <Filter className="w-4 h-4 text-nexa-brand" />
                  Filters
                </span>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 hover:bg-nexa-bg-base rounded-lg text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-2 no-scrollbar">
                {/* Niche Categories */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-nexa-text-faint uppercase tracking-wider">Categories</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-2 no-scrollbar">
                    <button 
                      onClick={() => setSelectedNiche("all")}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all",
                        selectedNiche === "all" ? "bg-nexa-brand/10 text-nexa-brand" : "text-nexa-text-secondary hover:bg-nexa-bg-base"
                      )}
                    >
                      All Categories
                    </button>
                    {Object.entries(NICHE_DETAILS).map(([slug, details]) => (
                      <button 
                        key={slug}
                        onClick={() => setSelectedNiche(slug)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all truncate",
                          selectedNiche === slug ? "bg-nexa-brand/10 text-nexa-brand" : "text-nexa-text-secondary hover:bg-nexa-bg-base"
                        )}
                      >
                        {details.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* City Selection */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-nexa-text-faint uppercase tracking-wider">Location</h4>
                  <select 
                    value={selectedCity} 
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-nexa-bg-base border border-nexa-border rounded-xl px-3 py-2 text-xs font-bold focus:ring-0 focus:outline-none"
                  >
                    <option value="all">All Locations</option>
                    {CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Price Filter */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-nexa-text-faint uppercase tracking-wider">Price Range (₦)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={minPrice} 
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-nexa-bg-base border border-nexa-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-100"
                    />
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={maxPrice} 
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-nexa-bg-base border border-nexa-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Delivery and Payments */}
                <div className="space-y-4 pt-4 border-t border-nexa-border">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={homeDelivery} 
                      onChange={(e) => setHomeDelivery(e.target.checked)}
                      className="w-4 h-4 rounded text-nexa-brand border-nexa-border focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-nexa-text-primary">Nationwide Delivery</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={acceptsPos} 
                      onChange={(e) => setAcceptsPos(e.target.checked)}
                      className="w-4 h-4 rounded text-nexa-brand border-nexa-border focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-nexa-text-primary">Pay on Delivery</span>
                  </label>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-nexa-border flex gap-3">
                <NexaButton 
                  variant="secondary" 
                  className="flex-1"
                  onClick={clearFilters}
                >
                  Reset
                </NexaButton>
                <NexaButton 
                  className="flex-1"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Apply Filters
                </NexaButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
      <NexaBottomBar />
    </main>
  );
}

export default function CentralShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-nexa-bg-base flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-nexa-brand border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CentralShopContent />
    </Suspense>
  );
}
