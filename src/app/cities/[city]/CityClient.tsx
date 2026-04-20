"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Search, 
  ArrowRight, 
  Star,
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import Link from "next/link";
import { useParams } from "next/navigation";
import { NICHES } from "@/components/nexa/NicheSwitcher";

export default function CityLandingPage() {
  const params = useParams();
  const citySlug = params.city as string;
  const cityName = citySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      {/* CITY HERO */}
      <section className="pt-32 pb-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-nexa-brand/10 via-nexa-bg-base to-nexa-accent/10 z-0" />
         
         <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-nexa-brand/10 text-nexa-brand px-4 py-2 rounded-full border border-nexa-brand/20 mb-6">
               <MapPin className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-widest">{cityName}, Nigeria</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-display mb-6 tracking-tight">
               Verified Professionals in <br />
               <span className="text-nexa-brand">{cityName}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-nexa-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
               From expert plumbers in Lekki to corporate lawyers in Ikeja. Discover top-rated services near you, instantly.
            </p>

            <div className="liquid-glass p-2 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-2 shadow-xl border border-white/20 mx-auto max-w-2xl">
               <div className="flex-1 flex items-center px-4 bg-white/50 dark:bg-slate-800/50 rounded-xl h-14 border border-nexa-border">
                  <Search className="w-5 h-5 text-nexa-text-faint" />
                  <input 
                    type="text" 
                    placeholder={`What do you need in ${cityName}? (e.g. Electrician, Tailor)`}
                    className="bg-transparent border-none outline-none w-full px-3 text-nexa-text-primary"
                  />
               </div>
               <NexaButton size="lg" className="rounded-xl h-14 px-8 shadow-lg shadow-nexa-brand/20">
                  Search
               </NexaButton>
            </div>
         </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-24">
         
         {/* NICHE HUBS IN THIS CITY */}
         <section>
            <div className="text-center mb-12">
               <h2 className="text-3xl font-extrabold text-display mb-4">Explore {cityName} Services</h2>
               <p className="text-nexa-text-secondary max-w-2xl mx-auto">
                  We've organized the city's best professionals into dedicated hubs. Find exactly what you need.
               </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
               {NICHES.slice(0, 10).map((niche, i) => (
                  <motion.div
                     key={niche.id}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.05 }}
                  >
                     <Link href={`/${niche.slug}?city=${citySlug}`}>
                        <NexaCard 
                           variant="interactive" 
                           padding="none" 
                           className="h-full group overflow-hidden border-none shadow-lg bg-nexa-bg-surface hover:shadow-xl transition-all"
                        >
                           <div className={cn("h-32 flex items-center justify-center relative", niche.color)}>
                              <img src={niche.icon} alt={niche.name} className="w-16 h-16 object-contain z-10 transition-transform group-hover:scale-110" />
                              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                           </div>
                           <div className="p-5 text-center">
                              <h3 className="font-bold text-sm mb-1 group-hover:text-nexa-brand transition-colors">{niche.name}</h3>
                              <p className="text-[10px] text-nexa-text-secondary font-medium uppercase tracking-wider">{niche.tagline}</p>
                           </div>
                        </NexaCard>
                     </Link>
                  </motion.div>
               ))}
            </div>
         </section>

         {/* TRENDING IN CITY */}
         <section className="bg-nexa-bg-surface rounded-[40px] p-8 md:p-12 border border-nexa-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-nexa-brand/10 blur-[80px] rounded-full" />
            <div className="relative z-10">
               <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4 text-center md:text-left">
                  <div>
                     <h2 className="text-3xl font-extrabold flex items-center justify-center md:justify-start gap-3 mb-2">
                        <TrendingUp className="w-8 h-8 text-nexa-brand" />
                        Trending in {cityName}
                     </h2>
                     <p className="text-nexa-text-secondary">The most booked services in your city this week.</p>
                  </div>
                  <NexaButton variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>Explore All</NexaButton>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                     { name: "Emergency Plumbers", bookings: "1,204 bookings" },
                     { name: "Bespoke Tailors", bookings: "856 bookings" },
                     { name: "Home Tutors", bookings: "642 bookings" },
                     { name: "Car Mechanics", bookings: "590 bookings" },
                  ].map((trend, i) => (
                     <NexaCard key={i} variant="glass" className="p-6 text-center hover:border-nexa-brand/50 transition-colors cursor-pointer group">
                        <div className="w-12 h-12 rounded-full bg-nexa-bg-base border border-nexa-border flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform text-lg font-extrabold">
                           #{i+1}
                        </div>
                        <h3 className="font-bold mb-1 group-hover:text-nexa-brand transition-colors">{trend.name}</h3>
                        <p className="text-xs text-nexa-text-faint font-bold">{trend.bookings}</p>
                     </NexaCard>
                  ))}
               </div>
            </div>
         </section>

         {/* JOIN CTA */}
         <section className="text-center max-w-3xl mx-auto pb-12">
            <h2 className="text-3xl font-extrabold mb-4">Own a Business in {cityName}?</h2>
            <p className="text-nexa-text-secondary mb-8">
               Join over 10,000 verified professionals getting leads and bookings directly on NexaNG.
            </p>
            <Link href="/join/register">
               <NexaButton size="lg" className="px-12 rounded-full h-14 text-lg shadow-xl shadow-nexa-brand/20">
                  List Your Business for Free
               </NexaButton>
            </Link>
         </section>
         
      </div>
    </main>
  );
}
