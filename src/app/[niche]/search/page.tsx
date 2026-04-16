"use client";

import React, { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Filter, 
  Star, 
  Clock, 
  LayoutGrid, 
  List, 
  ChevronDown, 
  SlidersHorizontal 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NICHE_DETAILS } from "@/lib/niche-data";

export default function NicheSearchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const nicheSlug = params.niche as string;
  const query = searchParams.get("q") || "";
  
  const data = NICHE_DETAILS[nicheSlug] || NICHE_DETAILS["home-services"];
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      {/* SEARCH HEADER */}
      <section className="pt-24 pb-8 bg-nexa-bg-surface border-b border-nexa-border sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <NexaInput 
                variant="search" 
                placeholder={`Search ${data.name}...`} 
                defaultValue={query}
                className="bg-nexa-bg-base"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <NexaButton variant="secondary" className="flex-1 md:flex-none" leftIcon={<MapPin className="w-4 h-4" />}>
                Lagos
              </NexaButton>
              <NexaButton variant="secondary" className="flex-1 md:flex-none" leftIcon={<SlidersHorizontal className="w-4 h-4" />}>
                Filters
              </NexaButton>
            </div>
          </div>
          
          {/* QUICK NICHE FILTERS */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
            <span className="text-xs font-bold text-nexa-text-faint uppercase mr-2 whitespace-nowrap">Filter by:</span>
            {data.subServices.map(service => (
              <button key={service} className="px-3 py-1.5 rounded-full bg-nexa-bg-base border border-nexa-border text-xs font-medium hover:border-nexa-brand transition-colors whitespace-nowrap">
                {service}
              </button>
            ))}
            <button className="px-3 py-1.5 rounded-full bg-nexa-bg-base border border-nexa-border text-xs font-medium hover:border-nexa-brand transition-colors whitespace-nowrap">
              Top Rated
            </button>
            <button className="px-3 py-1.5 rounded-full bg-nexa-bg-base border border-nexa-border text-xs font-medium hover:border-nexa-brand transition-colors whitespace-nowrap">
              Verified Only
            </button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* RESULTS BAR */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-nexa-text-secondary">
            Showing <span className="font-bold text-nexa-text-primary">24</span> results for <span className="font-bold text-nexa-brand">"{query || data.name}"</span>
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
        <div className={cn(
          "grid gap-6",
          viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <NexaCard variant="interactive" padding="none" className={cn(
                "overflow-hidden group",
                viewMode === "list" && "flex flex-col md:flex-row"
              )}>
                <div className={cn(
                  "relative bg-slate-200",
                  viewMode === "grid" ? "h-48" : "h-48 md:h-auto md:w-64"
                )}>
                  <div className="absolute top-3 left-3 z-10">
                    <NexaBadge variant="verified">Verified</NexaBadge>
                  </div>
                </div>
                <div className="p-5 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-nexa-brand">{data.subServices[i % data.subServices.length]}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="text-xs font-bold">4.8</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-1 group-hover:text-nexa-brand transition-colors">Expert {data.subServices[i % data.subServices.length].slice(0, -1)} Service</h3>
                  <div className="flex items-center gap-4 text-xs text-nexa-text-secondary mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>Lekki, Lagos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>15m response</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {["Fast Delivery", "Certified", "Insurance"].map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-nexa-bg-base text-[10px] font-bold text-nexa-text-faint uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-nexa-border">
                    <p className="text-sm font-bold">From ₦5,000</p>
                    <NexaButton size="sm">Book Now</NexaButton>
                  </div>
                </div>
              </NexaCard>
            </motion.div>
          ))}
        </div>
        
        {/* PAGINATION */}
        <div className="mt-12 flex justify-center">
           <div className="flex items-center gap-2">
              <NexaButton variant="secondary" size="sm" disabled>Prev</NexaButton>
              <div className="flex items-center gap-1">
                 {[1, 2, 3, "...", 8].map((p, i) => (
                   <button key={i} className={cn(
                     "w-8 h-8 rounded-lg text-sm font-bold transition-all",
                     p === 1 ? "bg-nexa-brand text-white shadow-lg shadow-nexa-brand/20" : "hover:bg-nexa-bg-surface"
                   )}>
                     {p}
                   </button>
                 ))}
              </div>
              <NexaButton variant="secondary" size="sm">Next</NexaButton>
           </div>
        </div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
