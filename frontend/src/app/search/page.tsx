"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Star, 
  Clock, 
  LayoutGrid, 
  List, 
  ChevronDown, 
  SlidersHorizontal,
  Search,
  Zap,
  ShieldCheck,
  ShoppingBag,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaInput } from "@/components/nexa/NexaInput";
import Link from "next/link";

export default function GlobalSearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeCategory, setActiveCategory] = useState("all");

  const results = [
    { id: 1, name: "Kola Handyman Services", category: "Services", sub: "Plumbing", rating: 4.9, reviews: 124, price: "₦5,000", location: "Lekki", image: "", color: "bg-amber-500", niche: "home-services" },
    { id: 2, name: "Industrial Wrench Set", category: "Products", sub: "Tools", rating: 4.8, reviews: 56, price: "₦15,000", location: "Ships to Lagos", image: "", color: "bg-blue-500", niche: "industrial" },
    { id: 3, name: "Amina's Braiding Studio", category: "Services", sub: "Hair", rating: 5.0, reviews: 89, price: "₦12,000", location: "Ikeja", image: "", color: "bg-pink-500", niche: "lifestyle" },
    { id: 4, name: "Elite Driving School", category: "Services", sub: "Education", rating: 4.7, reviews: 42, price: "₦45,000", location: "Surulere", image: "", color: "bg-emerald-500", niche: "education" },
    { id: 5, name: "Lekki Tech Hub", category: "Services", sub: "Development", rating: 4.9, reviews: 15, price: "₦150k/mo", location: "Victoria Island", image: "", color: "bg-indigo-500", niche: "tech" },
    { id: 6, name: "Premium Solar Panels", category: "Products", sub: "Energy", rating: 4.6, reviews: 28, price: "₦250,000", location: "Ships to Nigeria", image: "", color: "bg-yellow-500", niche: "industrial" }
  ];

  const filteredResults = activeCategory === "all" 
    ? results 
    : results.filter(r => r.category.toLowerCase() === activeCategory);

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
                placeholder="Search everything on Nexa..." 
                defaultValue={query}
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
             <NexaButton variant="ghost" size="sm" rightIcon={<ChevronDown className="w-4 h-4" />}>
               Sort: Recommended
             </NexaButton>
          </div>
        </div>

        <div className={cn(
          "grid gap-6",
          viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredResults.map((item, i) => (
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
                  "relative flex items-center justify-center",
                  item.color,
                  viewMode === "grid" ? "h-48" : "h-48 md:h-auto md:w-64 shrink-0"
                )}>
                  <div className="absolute top-3 left-3 z-10">
                    <NexaBadge variant="verified">Verified</NexaBadge>
                  </div>
                  {item.category === "Services" ? <Calendar className="w-12 h-12 text-white/50" /> : <ShoppingBag className="w-12 h-12 text-white/50" />}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-nexa-brand">{item.sub}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="text-xs font-bold">{item.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1 group-hover:text-nexa-brand transition-colors line-clamp-1">{item.name}</h3>
                  
                  <div className="flex items-center gap-4 text-xs text-nexa-text-secondary mb-6">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{item.location}</span>
                    </div>
                    {item.category === "Services" && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Instant Booking</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-nexa-border">
                    <p className="text-lg font-extrabold text-nexa-text-primary">{item.price}</p>
                    <Link href={`/${item.niche}/${item.name.toLowerCase().replace(/ /g, "-")}`}>
                      <NexaButton size="sm">View {item.category === "Services" ? "Profile" : "Product"}</NexaButton>
                    </Link>
                  </div>
                </div>
              </NexaCard>
            </motion.div>
          ))}
        </div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
