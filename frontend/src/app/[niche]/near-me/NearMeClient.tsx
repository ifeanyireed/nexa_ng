"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Navigation, 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  Star
} from "lucide-react";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { getProLink } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { api } from "@/lib/api";
import Link from "next/link";

export default function NearMeClient({ data }: { data: any }) {
  const [radius, setRadius] = useState(5);
  const [pros, setPros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPros = async () => {
      setLoading(true);
      try {
        const result = await api.get(`/discovery/pros?niche=${data.id}`);
        setPros(result);
      } catch (error) {
        console.error("Failed to fetch pros near me:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPros();
  }, [data.id]);
  
  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-0">
      <NexaNavbar />
      
      <div className="pt-20 h-[calc(100vh-64px)] lg:h-screen flex flex-col lg:flex-row overflow-hidden">
        {/* SIDEBAR LIST */}
        <aside className="w-full lg:w-[400px] bg-nexa-bg-surface border-r border-nexa-border flex flex-col z-20">
           <div className="p-6 border-b border-nexa-border">
              <div className="flex items-center justify-between mb-6">
                 <h1 className="text-xl font-bold">Near Me</h1>
                 <NexaBadge variant="brand">{data.name}</NexaBadge>
              </div>
              <div className="space-y-4">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexa-text-faint" />
                    <input 
                      type="text" 
                      placeholder={`Find ${data.name.toLowerCase()}...`}
                      className="w-full h-11 pl-10 pr-4 bg-nexa-bg-base border border-nexa-border rounded-xl text-sm focus:outline-none"
                    />
                 </div>
                 <div className="flex items-center gap-2">
                    <NexaButton variant="secondary" size="sm" className="flex-1" leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}>
                       Filters
                    </NexaButton>
                    <div className="flex-1 px-3 h-9 bg-nexa-bg-base border border-nexa-border rounded-lg flex items-center justify-between">
                       <span className="text-xs font-bold text-nexa-text-secondary">{radius}km radius</span>
                       <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {loading ? (
                <div className="py-12 text-center">
                   <div className="inline-block w-6 h-6 border-2 border-nexa-brand border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                pros.map((pro, i) => (
                  <Link href={getProLink(pro)} key={pro.id}>
                    <NexaCard variant="interactive" className="p-4 cursor-pointer group">
                       <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-nexa-brand/10 flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-nexa-brand">
                             {pro.user?.name?.[0]}
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-sm line-clamp-1 group-hover:text-nexa-brand transition-colors">{pro.user?.name}</h3>
                                <div className="flex items-center gap-1 text-[10px] font-bold">
                                   <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                   <span>{pro.rating}</span>
                                </div>
                             </div>
                             <p className="text-[10px] text-nexa-text-secondary mb-2">{(0.5 + i * 0.4).toFixed(1)}km • Lagos, Nigeria</p>
                             <div className="flex items-center gap-2">
                                <NexaBadge variant="success" className="text-[9px] py-0">Available</NexaBadge>
                                <span className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-tighter">Fast Response</span>
                             </div>
                          </div>
                       </div>
                    </NexaCard>
                  </Link>
                ))
              )}
              {!loading && pros.length === 0 && (
                <div className="py-12 text-center text-nexa-text-faint italic px-6">
                  No professionals found near your location.
                </div>
              )}
           </div>
        </aside>

        {/* MAP VIEW */}
        <section className="flex-1 relative bg-slate-100 overflow-hidden">
           <div className="absolute inset-0 bg-[#e5e7eb] flex items-center justify-center">
              <div className="text-nexa-text-faint flex flex-col items-center gap-4">
                 <Navigation className="w-12 h-12 animate-pulse" />
                 <p className="font-bold text-sm uppercase tracking-widest text-center px-6">
                    {loading ? "Initializing Map..." : `Showing ${pros.length} results near Lagos`}
                 </p>
              </div>
           </div>

           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              <NexaButton size="lg" className="rounded-full shadow-2xl px-8" leftIcon={<Navigation className="w-5 h-5" />}>
                 Recenter Map
              </NexaButton>
           </div>
           
           <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
              <button className="w-12 h-12 rounded-xl liquid-glass flex items-center justify-center shadow-lg text-nexa-text-primary">
                 <Plus className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 rounded-xl liquid-glass flex items-center justify-center shadow-lg text-nexa-text-primary">
                 <Minus className="w-5 h-5" />
              </button>
           </div>
        </section>
      </div>

      <div className="lg:hidden">
         <NexaBottomBar />
      </div>
    </main>
  );
}

const Plus = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const Minus = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>;
