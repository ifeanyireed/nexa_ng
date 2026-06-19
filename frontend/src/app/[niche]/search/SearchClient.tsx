"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Star, 
  Clock, 
  LayoutGrid, 
  List, 
  ChevronDown, 
  SlidersHorizontal 
} from "lucide-react";
import { cn, getProLink } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaInput } from "@/components/nexa/NexaInput";
import { api } from "@/lib/api";
import Link from "next/link";

export default function SearchClient({ data }: { data: any }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);
  const [activeSpecialty, setActiveSpecialty] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        let url = `/discovery/pros?niche=${data.id}&q=${query}`;
        if (activeSpecialty) {
          url += `&specialty=${encodeURIComponent(activeSpecialty)}`;
        }
        if (minRating) {
          url += `&min_rating=${minRating}`;
        }
        const result = await api.get(url);
        setResults(result);
      } catch (error) {
        console.error("Niche search failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [data.id, query, activeSpecialty, minRating]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/${data.id}/search?q=${encodeURIComponent(searchInput)}`);
  };

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      {/* SEARCH HEADER */}
      <section className="pt-24 pb-8 bg-nexa-bg-surface border-b border-nexa-border sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <NexaInput 
                variant="search" 
                placeholder={`Search ${data.name}...`} 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-nexa-bg-base"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <NexaButton variant="secondary" type="button" className="flex-1 md:flex-none" leftIcon={<MapPin className="w-4 h-4" />}>
                Lagos
              </NexaButton>
              <NexaButton 
                onClick={() => setShowFilters(!showFilters)}
                type="button"
                variant={showFilters ? "primary" : "secondary"}
                className="flex-1 md:flex-none" 
                leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              >
                Filters
              </NexaButton>
            </div>
          </form>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-nexa-border/60 mt-4 pt-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-2">
                  {/* Minimum Rating */}
                  <div>
                    <label className="block text-xs font-bold text-nexa-text-secondary uppercase mb-2">Minimum Rating</label>
                    <div className="flex gap-2">
                      {["", "4.0", "4.5", "4.8"].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setMinRating(val)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg border text-xs font-bold transition-all",
                            minRating === val
                              ? "bg-nexa-brand text-white border-nexa-brand"
                              : "bg-nexa-bg-base border-nexa-border hover:border-nexa-brand text-nexa-text-secondary"
                          )}
                        >
                          {val ? `${val} ★` : "All"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div>
                    <label className="block text-xs font-bold text-nexa-text-secondary uppercase mb-2">Verification Status</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg border text-xs font-bold bg-nexa-brand text-white border-nexa-brand"
                      >
                        All Pros
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg border text-xs font-bold bg-nexa-bg-base border-nexa-border text-nexa-text-faint cursor-not-allowed"
                        disabled
                      >
                        Verified Only
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-nexa-text-secondary uppercase mb-2">Sort By</label>
                    <NexaButton variant="secondary" size="sm" className="w-full justify-between" rightIcon={<ChevronDown className="w-4 h-4" />}>
                      Recommended
                    </NexaButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* QUICK NICHE FILTERS */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
            <span className="text-xs font-bold text-nexa-text-faint uppercase mr-2 whitespace-nowrap">Filter by:</span>
            {data.subServices.map((service: string) => {
              const spec = service.replace(" Finder", "");
              return (
                <button 
                  key={service} 
                  onClick={() => setActiveSpecialty(activeSpecialty === spec ? "" : spec)}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-xs font-medium transition-colors whitespace-nowrap",
                    activeSpecialty === spec 
                      ? "bg-nexa-brand text-white border-nexa-brand" 
                      : "bg-nexa-bg-base border-nexa-border hover:border-nexa-brand"
                  )}
                >
                  {service}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* RESULTS BAR */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-nexa-text-secondary">
            Showing <span className="font-bold text-nexa-text-primary">{results.length}</span> results for <span className="font-bold text-nexa-brand">"{query || data.name}"</span>
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
             <NexaButton variant="ghost" size="sm" rightIcon={<ChevronDown className="w-4 h-4" />}>
               Sort: Recommended
             </NexaButton>
          </div>
        </div>

        {/* RESULTS GRID/LIST */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-4 border-nexa-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {results.map((item, i) => (
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
                    "relative bg-nexa-brand/10 flex items-center justify-center",
                    viewMode === "grid" ? "h-48" : "h-48 md:h-auto md:w-64"
                  )}>
                    <div className="absolute top-3 left-3 z-10">
                      {item.verified && <NexaBadge variant="verified">Verified</NexaBadge>}
                    </div>
                    <Star className="w-12 h-12 text-nexa-brand/30" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-nexa-brand">{item.specialties?.split(",")[0]}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="text-xs font-bold">{item.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-1 group-hover:text-nexa-brand transition-colors">{item.user?.name}</h3>
                    <div className="flex items-center gap-4 text-xs text-nexa-text-secondary mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>Lagos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Fast response</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {["Certified", "Reliable"].map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-nexa-bg-base text-[10px] font-bold text-nexa-text-faint uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-auto border-t border-nexa-border">
                      <p className="text-sm font-bold">₦{(item.hourlyRate || item.hourly_rate || 4000).toLocaleString()}/hr</p>
                      <Link href={getProLink(item)}>
                        <NexaButton size="sm">Book Now</NexaButton>
                      </Link>
                    </div>
                  </div>
                </NexaCard>
              </motion.div>
            ))}
            {results.length === 0 && (
              <div className="col-span-full py-24 text-center text-nexa-text-faint italic bg-nexa-bg-surface/10 rounded-3xl border border-dashed border-nexa-border">
                No professionals found matching your search in this category.
              </div>
            )}
          </div>
        )}
        
        {/* PAGINATION */}
        <div className="mt-12 flex justify-center">
           <div className="flex items-center gap-2">
              <NexaButton variant="secondary" size="sm" disabled>Prev</NexaButton>
              <div className="flex items-center gap-1">
                 {[1].map((p, i) => (
                   <button key={i} className={cn(
                     "w-8 h-8 rounded-lg text-sm font-bold transition-all",
                     p === 1 ? "bg-nexa-brand text-white shadow-lg shadow-nexa-brand/20" : "hover:bg-nexa-bg-surface"
                   )}>
                     {p}
                   </button>
                 ))}
              </div>
              <NexaButton variant="secondary" size="sm" disabled>Next</NexaButton>
           </div>
        </div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
