"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  ArrowRight,
  Filter
} from "lucide-react";
import { cn, getProLink } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { api } from "@/lib/api";
import Link from "next/link";

export default function AvailableClient({ data }: { data: any }) {
  const [pros, setPros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchPros = async () => {
      setLoading(true);
      try {
        const result = await api.get(`/discovery/pros?niche=${data.id}`);
        setPros(result);
      } catch (error) {
        console.error("Failed to fetch available pros:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPros();
  }, [data.id]);

  const getProAvailability = (proId: string) => {
    let sum = 0;
    for (let i = 0; i < proId.length; i++) {
      sum += proId.charCodeAt(i);
    }
    return sum % 3;
  };

  const uniqueSpecialties = Array.from(
    new Set(
      pros
        .flatMap((p) => p.specialties?.split(",") || [])
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );

  const filteredPros = pros.filter((pro) => {
    if (getProAvailability(pro.id) !== activeTab) return false;
    
    if (selectedSpecialty) {
       const specs = pro.specialties?.split(",").map((s: string) => s.trim()) || [];
       if (!specs.includes(selectedSpecialty)) return false;
    }
    
    if (minRating && pro.rating < minRating) return false;
    
    return true;
  });

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      <section className="pt-32 pb-12 bg-nexa-bg-surface border-b border-nexa-border">
         <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
               <div>
                  <div className="flex items-center gap-2 mb-3">
                     <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                     <NexaBadge variant="brand">Instant Hiring</NexaBadge>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-display leading-[1.1] md:leading-[1.1]">
                    Available {data.name} Experts
                  </h1>
                  <p className="text-nexa-text-secondary mt-4 max-w-xl">
                    Professionals who are ready to start your project today or have confirmed availability this week.
                  </p>
               </div>
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                   <NexaButton 
                      size="lg" 
                      variant="secondary" 
                      className={cn("whitespace-nowrap", showFilters && "bg-nexa-brand/10 border-nexa-brand/35 text-nexa-brand")}
                      onClick={() => setShowFilters(!showFilters)}
                      leftIcon={<Filter className="w-5 h-5" />}
                   >
                      Filters
                   </NexaButton>
                   <NexaButton size="lg" className="whitespace-nowrap" leftIcon={<Calendar className="w-5 h-5" />}>View Calendar</NexaButton>
                </div>
            </div>
         </div>
      </section>

      <div className="container mx-auto px-4 py-12">
         <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 no-scrollbar">
            {["Available Today", "Available Tomorrow", "Later this Week"].map((tab, i) => (
               <button 
                  key={tab} 
                  onClick={() => {
                     setActiveTab(i);
                     setSelectedSpecialty(null);
                     setMinRating(null);
                  }}
                  className={cn(
                     "px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                     i === activeTab ? "bg-nexa-brand text-white shadow-lg shadow-nexa-brand/20" : "bg-nexa-bg-surface border border-nexa-border text-nexa-text-faint hover:text-nexa-text-secondary"
                  )}
               >
                  {tab}
               </button>
            ))}
         </div>

         <AnimatePresence>
            {showFilters && (
               <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="mb-8 p-6 rounded-3xl bg-nexa-bg-surface border border-nexa-border overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6"
               >
                  <div>
                     <h4 className="text-xs font-bold text-nexa-text-faint uppercase tracking-wider mb-3">Specialty</h4>
                     <div className="flex flex-wrap gap-2">
                        <button
                           onClick={() => setSelectedSpecialty(null)}
                           className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                              !selectedSpecialty ? "bg-nexa-brand text-white border-nexa-brand" : "bg-nexa-bg-surface border-nexa-border text-nexa-text-secondary hover:text-nexa-text-primary"
                           )}
                        >
                           All
                        </button>
                        {uniqueSpecialties.map((spec: any) => (
                           <button
                              key={spec}
                              onClick={() => setSelectedSpecialty(spec)}
                              className={cn(
                                 "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                                 selectedSpecialty === spec ? "bg-nexa-brand text-white border-nexa-brand" : "bg-nexa-bg-surface border-nexa-border text-nexa-text-secondary hover:text-nexa-text-primary"
                              )}
                           >
                              {spec}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div>
                     <h4 className="text-xs font-bold text-nexa-text-faint uppercase tracking-wider mb-3">Minimum Rating</h4>
                     <div className="flex gap-2">
                        {[null, 4.0, 4.5].map((val) => (
                           <button
                              key={val ?? "all"}
                              onClick={() => setMinRating(val)}
                              className={cn(
                                 "px-4 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1",
                                 minRating === val ? "bg-nexa-brand text-white border-nexa-brand" : "bg-nexa-bg-surface border-nexa-border text-nexa-text-secondary hover:text-nexa-text-primary"
                              )}
                           >
                              {val ? `${val}★ & up` : "All Ratings"}
                           </button>
                        ))}
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {loading ? (
            <div className="py-24 text-center">
               <div className="inline-block w-8 h-8 border-4 border-nexa-brand border-t-transparent rounded-full animate-spin" />
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredPros.map((pro, i) => (
                  <motion.div
                     key={pro.id}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.05 }}
                  >
                     <NexaCard variant="interactive" className="p-6">
                        <div className="flex items-start justify-between mb-6">
                           <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-[24px] bg-nexa-brand/10 flex items-center justify-center text-2xl font-bold">
                                 {pro.user?.name?.[0] || "P"}
                              </div>
                              <div>
                                 <div className="flex items-center gap-1 mb-1">
                                    <h3 className="font-bold">{pro.user?.name}</h3>
                                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                       <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                       <span className="text-xs font-bold">{pro.rating}</span>
                                    </div>
                                    <span className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-tighter">Verified Provider</span>
                                 </div>
                              </div>
                           </div>
                           <NexaBadge 
                              variant={activeTab === 0 ? "success" : activeTab === 1 ? "brand" : "secondary"}
                           >
                              {activeTab === 0 ? "Available Now" : activeTab === 1 ? "Tomorrow" : "Later this Week"}
                           </NexaBadge>
                        </div>

                        <div className="space-y-4 mb-8">
                           <div className="flex items-center gap-3 text-xs text-nexa-text-secondary">
                              <MapPin className="w-4 h-4" />
                              <span>Lagos • Nigeria</span>
                           </div>
                           <div className="flex items-center gap-3 text-xs text-nexa-text-secondary">
                              <Clock className="w-4 h-4" />
                              <span>Responds quickly</span>
                           </div>
                           <div className="flex items-center gap-2">
                              {pro.specialties?.split(",").slice(0, 3).map((tag: string) => (
                                <span key={tag} className="px-2 py-0.5 rounded-md bg-nexa-bg-base text-[9px] font-bold text-nexa-text-faint uppercase">
                                  {tag.trim()}
                                </span>
                              ))}
                           </div>
                        </div>

                        <div className="pt-6 border-t border-nexa-border flex items-center justify-between">
                           <div>
                              <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-widest mb-1">Starts from</p>
                              <p className="text-lg font-extrabold">₦{(pro.hourlyRate || pro.hourly_rate || 4000).toLocaleString()}</p>
                           </div>
                           <Link href={getProLink(pro)}>
                              <NexaButton rightIcon={<ArrowRight className="w-4 h-4" />}>Book Now</NexaButton>
                           </Link>
                        </div>
                     </NexaCard>
                  </motion.div>
               ))}
               {filteredPros.length === 0 && (
                  <div className="col-span-full py-24 text-center text-nexa-text-faint italic bg-nexa-bg-surface/10 rounded-3xl border border-dashed border-nexa-border">
                     No experts currently listed as available for this period.
                  </div>
               )}
            </div>
         )}

         <div className="mt-20">
            <NexaCard variant="glass" className="bg-nexa-bg-surface/50 p-12 text-center border-dashed border-2">
               <h3 className="text-2xl font-bold mb-4">Don't see your preferred professional?</h3>
               <p className="text-nexa-text-secondary mb-8 max-w-lg mx-auto">
                  You can still book any professional in the {data.name} niche and schedule a time that works for you.
               </p>
               <Link href={`/${data.id}/search`}>
                  <NexaButton size="lg" variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                     Browse All {data.name}
                  </NexaButton>
               </Link>
            </NexaCard>
         </div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
