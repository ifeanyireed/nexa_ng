"use client";

import React from "react";
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
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function TrendingPage() {
  const trendingBusinesses = [
    { name: "Kola Handyman Services", niche: "Home Services", rating: 4.9, reviews: 124, growth: "+45%", location: "Lekki, Lagos", color: "bg-amber-500", slug: "home-services/kola-handyman-services" },
    { name: "Amina's Salon & Spa", niche: "Fashion & Grooming", rating: 5.0, reviews: 89, growth: "+32%", location: "Ikeja, Lagos", color: "bg-pink-500", slug: "fashion-grooming/aminas-salon" },
    { name: "Lekki Tech Hub", niche: "Professional Services", rating: 4.8, reviews: 56, growth: "+28%", location: "Victoria Island, Lagos", color: "bg-blue-500", slug: "professional-services/lekki-tech-hub" },
    { name: "Elite Driving School", niche: "Education & Skills", rating: 4.7, reviews: 42, growth: "+22%", location: "Surulere, Lagos", color: "bg-emerald-500", slug: "education-skills/elite-driving-school" },
    { name: "Tunji Paints & Tools", niche: "Home Services", rating: 4.9, reviews: 210, growth: "+18%", location: "Gbagada, Lagos", color: "bg-orange-500", slug: "home-services/tunji-paints" },
    { name: "Rapid Dispatch Logistics", niche: "Logistics & Transport", rating: 4.6, reviews: 156, growth: "+15%", location: "Yaba, Lagos", color: "bg-indigo-500", slug: "logistics-transport/rapid-dispatch" },
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trendingBusinesses.map((business, i) => (
            <motion.div
              key={business.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <NexaCard variant="interactive" padding="none" className="h-full flex flex-col overflow-hidden border-none shadow-sm group">
                <div className={cn("h-32 flex items-center justify-center relative", business.color)}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                  <Award className="w-12 h-12 text-white/40" />
                  <div className="absolute top-4 right-4">
                     <NexaBadge variant="neutral" className="bg-white/90 backdrop-blur-md text-nexa-text-primary border-none shadow-lg font-extrabold">
                        {business.growth} 🔥
                     </NexaBadge>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-nexa-brand">{business.niche}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span className="text-xs font-bold">{business.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-extrabold mb-4 group-hover:text-nexa-brand transition-colors">{business.name}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-nexa-text-secondary mb-8">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{business.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>{business.reviews} reviews</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-8 border-t border-nexa-border flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-nexa-brand" />
                        <span className="text-[10px] font-bold text-nexa-text-faint uppercase tracking-widest">Nexa Verified</span>
                     </div>
                     <Link href={`/${business.slug}`}>
                        <NexaButton size="sm" variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>View Profile</NexaButton>
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
