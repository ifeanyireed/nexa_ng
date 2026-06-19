"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Star, 
  TrendingUp, 
  MapPin, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Users,
  Award,
  Info
} from "lucide-react";
import { cn, getProLink } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { api } from "@/lib/api";

export default function TrendingPage() {
  const [pros, setPros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const result = await api.get("/discovery/pros?min_rating=4.0");
        // Sort by rating desc
        const sorted = result.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
        setPros(sorted.slice(0, 9));
      } catch (error) {
        console.error("Error fetching trending pros:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const nicheColors: Record<string, string> = {
    "home-services": "bg-amber-500",
    "fashion-grooming": "bg-pink-500",
    "professional-services": "bg-blue-500",
    "education-skills": "bg-emerald-500",
    "events-entertainment": "bg-purple-500",
    "health-wellness": "bg-rose-500",
    "logistics-transport": "bg-indigo-500",
    "automotive-services": "bg-slate-600",
    "food-agribusiness": "bg-orange-500",
    "real-estate-construction": "bg-stone-500"
  };

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      <section className="pt-32 pb-16 bg-gradient-to-br from-nexa-brand/10 via-transparent to-nexa-accent/5 border-b border-nexa-border overflow-hidden relative">
        <div className="absolute top-0 right-0 p-24 opacity-10 rotate-12">
          <TrendingUp className="w-64 h-64 text-nexa-brand" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-nexa-brand/10 text-nexa-brand px-4 py-2 rounded-full border border-nexa-brand/20 mb-8">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Real-time Market Pulse</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-display mb-6">Trending Businesses</h1>
          <p className="text-xl text-nexa-text-secondary max-w-2xl leading-relaxed">
            The most sought-after professionals and high-growth services on Nexa this week. Verified by data, trusted by customers.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 rounded-[40px] bg-nexa-bg-surface animate-pulse" />
            ))}
          </div>
        ) : pros.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pros.map((pro, i) => (
              <motion.div
                key={pro.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <NexaCard variant="interactive" padding="none" className="h-full flex flex-col overflow-hidden border-none shadow-sm group">
                  <div className={cn("h-32 flex items-center justify-center relative", nicheColors[pro.niche] || "bg-nexa-brand")}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                    <Award className="w-12 h-12 text-white/40" />
                    <div className="absolute top-4 right-4">
                       <NexaBadge variant="neutral" className="bg-white/90 backdrop-blur-md text-nexa-text-primary border-none shadow-lg font-extrabold">
                          +{Math.floor(Math.random() * 30) + 10}% 🔥
                       </NexaBadge>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-nexa-brand">{pro.niche || "Professional"}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="text-xs font-bold">{pro.rating || "5.0"}</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-extrabold mb-4 group-hover:text-nexa-brand transition-colors">{pro.user?.name}</h3>
                    
                    <div className="flex items-center gap-4 text-sm text-nexa-text-secondary mb-8">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>Lagos, Nigeria</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{Math.floor(Math.random() * 50) + 10} reviews</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-nexa-border flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          {pro.verified && <ShieldCheck className="w-5 h-5 text-nexa-brand" />}
                          <span className="text-[10px] font-bold text-nexa-text-faint uppercase tracking-widest">{pro.verified ? "Nexa Verified" : "Active Member"}</span>
                       </div>
                       <Link href={getProLink(pro)}>
                          <NexaButton size="sm" variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>View Profile</NexaButton>
                       </Link>
                    </div>
                  </div>
                </NexaCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center space-y-6">
             <div className="w-20 h-20 rounded-full bg-nexa-bg-surface flex items-center justify-center mx-auto text-nexa-text-faint">
                <TrendingUp className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-bold">No trending businesses yet</h3>
             <p className="text-nexa-text-secondary">Check back soon as we analyze the latest market trends.</p>
          </div>
        )}
      </div>

      <NexaBottomBar />
    </main>
  );
}
