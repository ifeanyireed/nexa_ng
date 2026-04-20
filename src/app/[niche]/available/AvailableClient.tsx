"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  ArrowRight,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function AvailableClient({ data }: { data: any }) {
  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      {/* HEADER */}
      <section className="pt-32 pb-12 bg-nexa-bg-surface border-b border-nexa-border">
         <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
               <div>
                  <div className="flex items-center gap-2 mb-3">
                     <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                     <NexaBadge variant="brand">Instant Hiring</NexaBadge>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-display">
                    Available {data.name} Experts
                  </h1>
                  <p className="text-nexa-text-secondary mt-4 max-w-xl">
                    Professionals who are ready to start your project today or have confirmed availability this week.
                  </p>
               </div>
               <div className="flex items-center gap-3">
                  <NexaButton variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>Filters</NexaButton>
                  <NexaButton leftIcon={<Calendar className="w-4 h-4" />}>View Calendar</NexaButton>
               </div>
            </div>
         </div>
      </section>

      <div className="container mx-auto px-4 py-12">
         {/* AVAILABILITY TABS */}
         <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 no-scrollbar">
            {["Available Today", "Available Tomorrow", "Later this Week"].map((tab, i) => (
               <button key={tab} className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                  i === 0 ? "bg-nexa-brand text-white shadow-lg shadow-nexa-brand/20" : "bg-nexa-bg-surface border border-nexa-border text-nexa-text-faint hover:text-nexa-text-secondary"
               )}>
                  {tab}
               </button>
            ))}
         </div>

         {/* FEED GRID */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(9)].map((_, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.05 }}
               >
                  <NexaCard variant="interactive" className="p-6">
                     <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 rounded-[24px] bg-nexa-brand/10 flex items-center justify-center text-2xl font-bold">
                              {["AS", "BO", "KM", "TD", "UN"][i % 5]}
                           </div>
                           <div>
                              <div className="flex items-center gap-1 mb-1">
                                 <h3 className="font-bold">Expert Provider {i+1}</h3>
                                 <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                              </div>
                              <div className="flex items-center gap-2">
                                 <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                    <span className="text-xs font-bold">4.9</span>
                                 </div>
                                 <span className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-tighter">120+ Jobs</span>
                              </div>
                           </div>
                        </div>
                        <NexaBadge variant="success">Available Now</NexaBadge>
                     </div>

                     <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-xs text-nexa-text-secondary">
                           <MapPin className="w-4 h-4" />
                           <span>Lekki, Lagos • 2.5km away</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-nexa-text-secondary">
                           <Clock className="w-4 h-4" />
                           <span>Responds in &lt; 10 minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                           {["Certified", "Quick Turnaround", "Top Rated"].map(tag => (
                             <span key={tag} className="px-2 py-0.5 rounded-md bg-nexa-bg-base text-[9px] font-bold text-nexa-text-faint uppercase">
                               {tag}
                             </span>
                           ))}
                        </div>
                     </div>

                     <div className="pt-6 border-t border-nexa-border flex items-center justify-between">
                        <div>
                           <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-widest mb-1">Starts from</p>
                           <p className="text-lg font-extrabold">₦7,500</p>
                        </div>
                        <NexaButton rightIcon={<ArrowRight className="w-4 h-4" />}>Book Now</NexaButton>
                     </div>
                  </NexaCard>
               </motion.div>
            ))}
         </div>

         {/* EMPTY STATE / CALL TO ACTION */}
         <div className="mt-20">
            <NexaCard variant="glass" className="bg-nexa-bg-surface/50 p-12 text-center border-dashed border-2">
               <h3 className="text-2xl font-bold mb-4">Don't see your preferred professional?</h3>
               <p className="text-nexa-text-secondary mb-8 max-w-lg mx-auto">
                  You can still book any professional in the {data.name} niche and schedule a time that works for you.
               </p>
               <NexaButton size="lg" variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Browse All {data.name}
               </NexaButton>
            </NexaCard>
         </div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
