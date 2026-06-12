"use client";

import React, { useState, useEffect } from "react";
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
  Tag,
  Info
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
import { api } from "@/lib/api";

export default function SubServicePage() {
  const params = useParams();
  const nicheSlug = params.niche as string;
  const categorySlug = params.slug as string;
  
  const data = NICHE_DETAILS[nicheSlug] || NICHE_DETAILS["home-services"];
  const categoryName = categorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const [activeFilter, setActiveFilter] = useState("All");
  const [pros, setPros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const subFilters = ["All", "Premium", "Verified", "Available Now"];

  useEffect(() => {
    const fetchPros = async () => {
      try {
        // We use the niche ID and the category name as the specialty
        // e.g. /discovery/pros?niche=home-services&specialty=Painter
        const specialty = categoryName.endsWith('s') ? categoryName.slice(0, -1) : categoryName;
        const result = await api.get(`/discovery/pros?niche=${data.id}&specialty=${specialty}`);
        setPros(result);
      } catch (error) {
        console.error("Error fetching category pros:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPros();
  }, [data.id, categoryName]);

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
         
         {/* RESULTS FEED */}
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
                  </div>
               </NexaCard>
            </aside>

            {/* RESULTS FEED */}
            <div className="flex-1 space-y-6">
               {loading ? (
                 <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                       <div key={i} className="h-48 rounded-[32px] bg-nexa-bg-surface animate-pulse" />
                    ))}
                 </div>
               ) : pros.length > 0 ? (
                 <>
                    <div className="flex items-center justify-between">
                       <p className="font-bold text-nexa-text-secondary">Showing {pros.length} {categoryName}s near Lekki</p>
                       <select className="bg-transparent border-none font-bold text-sm focus:outline-none cursor-pointer">
                          <option>Recommended</option>
                          <option>Highest Rated</option>
                          <option>Nearest to me</option>
                       </select>
                    </div>

                    {pros.map((pro, i) => (
                       <Link href={`/${nicheSlug}/business-${pro.id}`} key={pro.id} className="block">
                          <NexaCard variant="glass" className="p-0 overflow-hidden flex flex-col sm:flex-row group hover:border-nexa-brand/50 transition-colors">
                             <div className="sm:w-64 h-48 sm:h-auto bg-slate-200 relative flex-shrink-0">
                                <img 
                                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${pro.user?.name}`} 
                                  className="w-full h-full object-cover" 
                                  alt={pro.user?.name}
                                />
                                {pro.verified && (
                                  <div className="absolute top-3 right-3 z-10">
                                     <NexaBadge variant="verified">Verified</NexaBadge>
                                  </div>
                                )}
                             </div>
                             <div className="p-6 flex-1 flex flex-col justify-center">
                                <div className="flex items-start justify-between mb-2">
                                   <div>
                                      <h3 className="text-xl font-bold group-hover:text-nexa-brand transition-colors">{pro.user?.name}</h3>
                                      <p className="text-sm text-nexa-text-secondary">{pro.specialties?.split(',')[0]} • {Math.floor(Math.random() * 5) + 1} years active</p>
                                   </div>
                                   <div className="flex items-center gap-1.5 bg-nexa-bg-base px-2 py-1 rounded-lg border border-nexa-border">
                                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                      <span className="font-bold">{pro.rating || "5.0"}</span>
                                   </div>
                                </div>
                                <p className="text-sm text-nexa-text-faint line-clamp-2 mb-6">
                                   {pro.bio || "Professional service provider on the Nexa platform, dedicated to excellence."}
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                   <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-1 text-xs font-bold text-nexa-text-secondary">
                                         <Clock className="w-3.5 h-3.5" />
                                         Fast Response
                                      </div>
                                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                                         <Zap className="w-3.5 h-3.5 fill-current" />
                                         Available
                                      </div>
                                   </div>
                                   <NexaButton variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                                      View Profile
                                   </NexaButton>
                                </div>
                             </div>
                          </NexaCard>
                       </Link>
                    ))}
                 </>
               ) : (
                 <div className="py-24 text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-nexa-bg-surface flex items-center justify-center mx-auto text-nexa-text-faint">
                       <Info className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold">No {categoryName}s found yet</h3>
                    <p className="text-nexa-text-secondary max-w-sm mx-auto">We couldn't find any professionals in this category right now. Try adjusting your filters or search area.</p>
                    <NexaButton variant="secondary" onClick={() => window.history.back()}>Go Back</NexaButton>
                 </div>
               )}
            </div>
         </section>
      </div>

      <NexaBottomBar />
    </main>
  );
}
