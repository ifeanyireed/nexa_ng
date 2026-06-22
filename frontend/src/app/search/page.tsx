"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Star, 
  Clock, 
  LayoutGrid, 
  List, 
  ChevronDown, 
  SlidersHorizontal,
  Calendar
} from "lucide-react";
import { cn, getProImage, getProLink } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaInput } from "@/components/nexa/NexaInput";
import { useLocation } from "@/components/nexa/LocationContext";
import { LocationDropdown } from "@/components/nexa/LocationDropdown";
import { NexaChip } from "@/components/nexa/NexaChip";
import { api } from "@/lib/api";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentCity } = useLocation();
  const query = searchParams.get("q") || "";
  
  const openNow = searchParams.get("open_now") === "true";
  const verified = searchParams.get("verified") === "true";
  const acceptsPos = searchParams.get("accepts_pos") === "true";
  const homeDelivery = searchParams.get("home_delivery") === "true";
  const nearMe = searchParams.get("near_me") === "true";
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeCategory, setActiveCategory] = useState("all");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);
  const [sortBy, setSortBy] = useState<"recommended" | "price_asc" | "price_desc" | "rating">("recommended");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const toggleFilter = (key: string, value: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, "true");
    } else {
      params.delete(key);
    }
    router.push(`/search?${params.toString()}`);
  };

  const activeFiltersCount = [openNow, verified, acceptsPos, homeDelivery, nearMe].filter(Boolean).length;

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await api.get(`/discovery/pros?q=${query}`);
        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set("q", searchInput.trim());
    if (openNow) params.set("open_now", "true");
    if (verified) params.set("verified", "true");
    if (acceptsPos) params.set("accepts_pos", "true");
    if (homeDelivery) params.set("home_delivery", "true");
    if (nearMe) params.set("near_me", "true");
    
    router.push(`/search?${params.toString()}`);
  };

  const getProAvailability = (proId: string) => {
    let sum = 0;
    for (let i = 0; i < proId.length; i++) {
      sum += proId.charCodeAt(i);
    }
    return sum % 3 === 0;
  };

  const hasPos = (proId: string) => {
    let sum = 0;
    for (let i = 0; i < proId.length; i++) {
      sum += proId.charCodeAt(i);
    }
    return sum % 2 === 0;
  };

  const hasDelivery = (proId: string) => {
    let sum = 0;
    for (let i = 0; i < proId.length; i++) {
      sum += proId.charCodeAt(i);
    }
    return (sum + 1) % 3 === 0;
  };

  const filteredResults = results.filter((pro) => {
    if (verified && !pro.verified) return false;
    if (openNow && !getProAvailability(pro.id)) return false;
    if (acceptsPos && !(pro.acceptsPos || pro.accepts_pos)) return false;
    if (homeDelivery && !(pro.homeDelivery || pro.home_delivery)) return false;
    if (nearMe && pro.city && currentCity && pro.city.toLowerCase() !== currentCity.name.toLowerCase()) return false;
    return true;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === "price_asc") {
      const rateA = a.hourlyRate || a.hourly_rate || 4000;
      const rateB = b.hourlyRate || b.hourly_rate || 4000;
      return rateA - rateB;
    }
    if (sortBy === "price_desc") {
      const rateA = a.hourlyRate || a.hourly_rate || 4000;
      const rateB = b.hourlyRate || b.hourly_rate || 4000;
      return rateB - rateA;
    }
    if (sortBy === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === "recommended") {
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      <section className="pt-24 pb-8 bg-nexa-bg-surface border-b border-nexa-border sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <NexaInput 
                variant="search" 
                placeholder="Search everything on Nexa..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-nexa-bg-base"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <LocationDropdown 
                className="flex-1 md:flex-none w-full md:w-auto"
                buttonClassName="rounded-xl border-[0.5px] border-black/5 dark:border-white/10 h-10 w-full justify-center text-sm text-nexa-text-primary"
              />
              <NexaButton type="submit" size="md" className="flex-1 md:flex-none rounded-xl">
                Search
              </NexaButton>
            </div>
          </form>

          <div className="flex flex-wrap justify-start gap-2 mt-4">
            {[
              { label: "Open Now", key: "open_now", active: openNow },
              { label: "Verified Only", key: "verified", active: verified },
              { label: "Accepts POS", key: "accepts_pos", active: acceptsPos },
              { label: "Home Delivery", key: "home_delivery", active: homeDelivery },
              { label: "Near Me", key: "near_me", active: nearMe },
            ].map((tag) => (
              <NexaChip
                key={tag.key}
                label={tag.label}
                selected={tag.active}
                onSelect={() => toggleFilter(tag.key, !tag.active)}
                className={cn(
                  "border border-slate-200/60 shadow-sm transition-all duration-200 cursor-pointer",
                  tag.active
                    ? "bg-blue-600 text-white shadow-md shadow-nexa-brand-glow"
                    : "bg-white/70 hover:bg-white text-slate-700 hover:text-slate-900 dark:bg-slate-800/70 dark:hover:bg-slate-800 dark:text-slate-300"
                )}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-4 mt-6 overflow-x-auto pb-2 no-scrollbar">
            {["all", "services", "products"].map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                  activeCategory === cat 
                    ? "bg-nexa-brand text-white shadow-lg shadow-nexa-brand/20" 
                    : "bg-nexa-bg-base border border-nexa-border text-nexa-text-secondary hover:border-nexa-brand/50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-nexa-text-secondary">
            Found <span className="font-bold text-nexa-text-primary">{filteredResults.length}</span> results matching <span className="font-bold text-nexa-brand">"{query || "anything"}"</span>
          </p>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center bg-nexa-bg-surface rounded-lg p-1 border border-nexa-border">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={cn("p-1.5 rounded-md transition-all", viewMode === "grid" ? "bg-nexa-bg-base shadow-sm text-nexa-brand" : "text-nexa-text-faint")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={cn("p-1.5 rounded-md transition-all", viewMode === "list" ? "bg-nexa-bg-base shadow-sm text-nexa-brand" : "text-nexa-text-faint")}
                >
                  <List className="w-4 h-4" />
                </button>
             </div>
              <div className="relative inline-block text-left z-20">
                <NexaButton 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  variant="ghost" 
                  size="sm" 
                  rightIcon={<ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isSortOpen && "rotate-180")} />}
                >
                  Sort: {
                    sortBy === "recommended" ? "Recommended" :
                    sortBy === "price_asc" ? "Price: Low to High" :
                    sortBy === "price_desc" ? "Price: High to Low" : "Top Rated"
                  }
                </NexaButton>

                <AnimatePresence>
                  {isSortOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-nexa-border rounded-xl shadow-xl z-50 py-1 overflow-hidden"
                      >
                        {[
                          { value: "recommended", label: "Recommended" },
                          { value: "rating", label: "Top Rated" },
                          { value: "price_asc", label: "Price: Low to High" },
                          { value: "price_desc", label: "Price: High to Low" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setSortBy(opt.value as any);
                              setIsSortOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2 text-xs font-bold transition-colors",
                              sortBy === opt.value
                                ? "bg-nexa-brand/10 text-nexa-brand"
                                : "hover:bg-slate-100 dark:hover:bg-white/5 text-nexa-text-secondary hover:text-nexa-text-primary"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-4 border-nexa-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {sortedResults.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <NexaCard variant="interactive" padding="none" className={cn(
                  "overflow-hidden group",
                  viewMode === "list" && "flex flex-col md:flex-row"
                )}>
                  <div className={cn(
                    "relative flex items-center justify-center bg-nexa-brand/10 overflow-hidden",
                    viewMode === "grid" ? "h-48" : "h-48 md:h-auto md:w-64 shrink-0"
                  )}>
                    <div className="absolute top-3 left-3 z-10">
                      {item.verified && <NexaBadge variant="verified">Verified</NexaBadge>}
                    </div>
                    <img 
                      src={getProImage(item.specialties, item.subService)} 
                      alt={item.user?.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-nexa-brand">{item.specialties?.split(",")[0]}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="text-xs font-bold">{item.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-1 group-hover:text-nexa-brand transition-colors line-clamp-1">{item.user?.name}</h3>
                    
                    <div className="flex items-center gap-4 text-xs text-nexa-text-secondary mb-6">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>Lagos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Fast Response</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-nexa-border">
                      <p className="text-lg font-extrabold text-nexa-text-primary">₦{(item.hourlyRate || item.hourly_rate || 4000).toLocaleString()}/hr</p>
                      <Link href={getProLink(item)}>
                        <NexaButton size="sm">View Profile</NexaButton>
                      </Link>
                    </div>
                  </div>
                </NexaCard>
              </motion.div>
            ))}
            {sortedResults.length === 0 && (
               <div className="col-span-full py-24 text-center text-nexa-text-faint italic bg-nexa-bg-surface/10 rounded-3xl border border-dashed border-nexa-border">
                  No professionals found matching your search and active filters.
               </div>
            )}
          </div>
        )}
      </div>

      <NexaBottomBar />
    </main>
  );
}

export default function GlobalSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-nexa-bg-base flex items-center justify-center"><div className="w-8 h-8 border-4 border-nexa-brand border-t-transparent rounded-full animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
