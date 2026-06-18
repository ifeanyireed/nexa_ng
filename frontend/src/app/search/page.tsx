"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaInput } from "@/components/nexa/NexaInput";
import { api } from "@/lib/api";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeCategory, setActiveCategory] = useState("all");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);

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
    router.push(`/search?q=${encodeURIComponent(searchInput)}`);
  };

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
              <NexaButton variant="secondary" className="flex-1 md:flex-none" leftIcon={<MapPin className="w-4 h-4" />}>
                Nigeria
              </NexaButton>
              <NexaButton variant="secondary" className="flex-1 md:flex-none" leftIcon={<SlidersHorizontal className="w-4 h-4" />}>
                Filters
              </NexaButton>
            </div>
          </form>
          
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
            Found <span className="font-bold text-nexa-text-primary">{results.length}</span> results matching <span className="font-bold text-nexa-brand">"{query || "anything"}"</span>
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
                    "relative flex items-center justify-center bg-nexa-brand/10",
                    viewMode === "grid" ? "h-48" : "h-48 md:h-auto md:w-64 shrink-0"
                  )}>
                    <div className="absolute top-3 left-3 z-10">
                      {item.verified && <NexaBadge variant="verified">Verified</NexaBadge>}
                    </div>
                    <Calendar className="w-12 h-12 text-nexa-brand/30" />
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
                      <p className="text-lg font-extrabold text-nexa-text-primary">₦{item.hourly_rate?.toLocaleString()}/hr</p>
                      <Link href={`/${item.niche}/business-${item.id}`}>
                        <NexaButton size="sm">View Profile</NexaButton>
                      </Link>
                    </div>
                  </div>
                </NexaCard>
              </motion.div>
            ))}
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
