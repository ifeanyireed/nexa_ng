"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Search, 
  Filter, 
  Star, 
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaRating } from "@/components/nexa/NexaRating";
import Link from "next/link";
import { useParams } from "next/navigation";
import { NICHE_DETAILS } from "@/lib/niche-data";

export default function SubServicePage() {
  const params = useParams();
  const nicheSlug = params.niche as string;
  const categorySlug = params.slug as string;
  
  const data = NICHE_DETAILS[nicheSlug] || NICHE_DETAILS["home-services"];
  const categoryName = categorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const [activeFilter, setActiveFilter] = useState("All");
  const subFilters = ["All", "Interior", "Exterior", "Industrial", "Epoxy Flooring"];

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      {/* HEADER HERO */}
      <section className={cn("pt-32 pb-16 relative overflow-hidden", data.colorClass)}>
         <div className="absolute inset-0 bg-black/20" />
         <div className="absolute inset-0 bg-gradient-to-t from-nexa-bg-base via-nexa-bg-base/50 to-transparent" />
         
         <div className="container mx-auto px-4 relative z-10 text-center">
            <NexaBadge variant="neutral" className="mb-4 bg-white/20 backdrop-blur-md text-white border-white/30">{data.name}</NexaBadge>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Find a <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">{categoryName}</span><br />
              in Lagos
            </h1>

            {/* SEARCH & FILTERS */}
            <div className="max-w-2xl mx-auto liquid-glass p-2 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-2 shadow-2xl border border-white/20 mb-8">
               <div className="flex-1 flex items-center px-4 bg-white/10 rounded-xl h-12 border border-white/10">
                  <Search className="w-5 h-5 text-white/70" />
                  <input 
                    type="text" 
                    placeholder={`Search within ${categoryName}...`}
                    className="bg-transparent border-none outline-none w-full px-3 text-white placeholder:text-white/60"
                  />
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl h-12 border border-white/10 cursor-pointer hover:bg-white/20 transition-colors">
                  <MapPin className="w-5 h-5 text-white" />
                  <span className="text-sm font-medium text-white whitespace-nowrap">Lekki, Lagos</span>
               </div>
               <NexaButton size="lg" className="rounded-xl bg-white text-black hover:bg-white/90">
                  Find Now
               </NexaButton>
            </div>

            {/* SUB-FILTERS PILLS */}
            <div className="flex flex-wrap items-center justify-center gap-2">
               {subFilters.map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                       "px-4 py-1.5 rounded-full text-xs font-bold transition-colors border",
                       activeFilter === filter 
                         ? "bg-white text-black border-white" 
                         : "bg-black/20 text-white border-white/20 hover:bg-white/20"
                    )}
                  >
                     {filter}
                  </button>
               ))}
            </div>
         </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">
         
         {/* AVAILABLE NOW HIGHLIGHT */}
         <section>
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
                  Available Now
               </h2>
               <Link href={`/${nicheSlug}/available`}>
                  <NexaButton variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>View All Map</NexaButton>
               </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
               {[...Array(4)].map((_, i) => (
                  <NexaCard key={i} variant="interactive" className="p-4 flex gap-4 group">
                     <div className="w-16 h-16 rounded-2xl bg-slate-200 flex-shrink-0" />
                     <div>
                        <h3 className="font-bold text-sm mb-1 group-hover:text-nexa-brand transition-colors">Swift {categoryName} {i+1}</h3>
                        <div className="flex items-center gap-1 mb-2">
                           <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                           <span className="text-xs font-bold">4.9</span>
                        </div>
                        <NexaBadge variant="success" className="text-[10px] py-0 px-2">Ready to dispatch</NexaBadge>
                     </div>
                  </NexaCard>
               ))}
            </div>
         </section>

         {/* MAIN LISTINGS */}
         <section className="flex flex-col lg:flex-row gap-8">
            {/* SIDEBAR FILTERS */}
            <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
               <NexaCard variant="flat" className="p-6 border-nexa-border sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold">Filters</h3>
                     <Filter className="w-4 h-4 text-nexa-text-faint" />
                  </div>
                  
                  <div className="space-y-6">
                     <div>
                        <p className="text-xs font-bold text-nexa-text-faint uppercase tracking-widest mb-3">Rating</p>
                        <div className="space-y-2">
                           {[4, 3, 2, 1].map(star => (
                              <label key={star} className="flex items-center gap-2 cursor-pointer group">
                                 <input type="checkbox" className="w-4 h-4 rounded border-nexa-border text-nexa-brand focus:ring-nexa-brand" />
                                 <div className="flex items-center gap-1">
                                    {[...Array(star)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />)}
                                    <span className="text-sm font-medium group-hover:text-nexa-text-primary transition-colors">& Up</span>
                                 </div>
                              </label>
                           ))}
                        </div>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-nexa-text-faint uppercase tracking-widest mb-3">Distance</p>
                        <input type="range" className="w-full accent-nexa-brand" min="1" max="50" defaultValue="10" />
                        <div className="flex justify-between text-xs font-medium text-nexa-text-faint mt-2">
                           <span>1km</span>
                           <span>10km</span>
                           <span>50km</span>
                        </div>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-nexa-text-faint uppercase tracking-widest mb-3">Features</p>
                        <div className="space-y-2">
                           {["Verified", "Has Portfolio", "Offers Guarantee", "Accepts NexaPay"].map((feature, i) => (
                              <label key={i} className="flex items-center gap-2 cursor-pointer group">
                                 <input type="checkbox" className="w-4 h-4 rounded border-nexa-border text-nexa-brand focus:ring-nexa-brand" />
                                 <span className="text-sm font-medium text-nexa-text-secondary group-hover:text-nexa-text-primary transition-colors">{feature}</span>
                              </label>
                           ))}
                        </div>
                     </div>
                  </div>
               </NexaCard>
            </aside>

            {/* RESULTS FEED */}
            <div className="flex-1 space-y-6">
               <div className="flex items-center justify-between">
                  <p className="font-bold text-nexa-text-secondary">Showing 24 {categoryName}s near Lekki</p>
                  <select className="bg-transparent border-none font-bold text-sm focus:outline-none cursor-pointer">
                     <option>Recommended</option>
                     <option>Highest Rated</option>
                     <option>Nearest to me</option>
                  </select>
               </div>

               {[...Array(6)].map((_, i) => (
                  <Link href={`/${nicheSlug}/business-${i}`} key={i} className="block">
                     <NexaCard variant="glass" className="p-0 overflow-hidden flex flex-col sm:flex-row group hover:border-nexa-brand/50 transition-colors">
                        <div className="sm:w-64 h-48 sm:h-auto bg-slate-200 relative flex-shrink-0">
                           <div className="absolute top-3 right-3 z-10">
                              <NexaBadge variant="verified">Verified</NexaBadge>
                           </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-center">
                           <div className="flex items-start justify-between mb-2">
                              <div>
                                 <h3 className="text-xl font-bold group-hover:text-nexa-brand transition-colors">Professional {categoryName} Services</h3>
                                 <p className="text-sm text-nexa-text-secondary">by John Doe • 5 years active</p>
                              </div>
                              <div className="flex items-center gap-1.5 bg-nexa-bg-base px-2 py-1 rounded-lg border border-nexa-border">
                                 <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                 <span className="font-bold">4.8</span>
                              </div>
                           </div>
                           
                           <p className="text-sm text-nexa-text-secondary line-clamp-2 mb-4">
                              We specialize in high-quality {categoryName.toLowerCase()} jobs for residential and commercial properties. Guarantee on all workmanship.
                           </p>

                           <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-nexa-text-faint mt-auto">
                              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Lekki Phase 1 (2.5km)</span>
                              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> 120+ Jobs</span>
                              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> CAC Registered</span>
                           </div>
                        </div>
                     </NexaCard>
                  </Link>
               ))}
               
               <div className="pt-8 flex justify-center">
                  <NexaButton variant="secondary" size="lg" className="w-full sm:w-auto px-12">Load More</NexaButton>
               </div>
            </div>
         </section>

         {/* DEALS IN THIS CATEGORY */}
         <section className="pt-12 border-t border-nexa-border">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
               <Tag className="w-6 h-6 text-nexa-brand" />
               Deals on {categoryName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[1, 2].map(i => (
                  <NexaCard key={i} variant="flat" className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 border-nexa-brand/20 bg-nexa-brand/5 group cursor-pointer">
                     <div className="w-20 h-20 rounded-2xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center font-extrabold text-2xl">
                        20%
                     </div>
                     <div className="text-center sm:text-left flex-1">
                        <NexaBadge variant="warning" className="mb-2">Ends in 2 days</NexaBadge>
                        <h3 className="text-lg font-bold mb-1 group-hover:text-nexa-brand transition-colors">Discount on Full House Services</h3>
                        <p className="text-sm text-nexa-text-secondary mb-3">Claim this deal from Top Rated {categoryName} Ltd.</p>
                        <div className="flex items-center justify-center sm:justify-start gap-4">
                           <NexaButton size="sm">Claim Deal</NexaButton>
                           <span className="text-xs font-bold text-nexa-text-faint">15 claimed today</span>
                        </div>
                     </div>
                  </NexaCard>
               ))}
            </div>
         </section>

      </div>
    </main>
  );
}
