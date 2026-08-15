"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Quote, 
  TrendingUp, 
  MapPin, 
  ArrowRight,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";

export default function SuccessStoriesPage() {
  const stories = [
    {
      name: "Tunji Bakare",
      business: "Tunji Paints & Tools",
      location: "Gbagada, Lagos",
      growth: "4x Revenue",
      story: "Before Nexa, I relied entirely on walk-in customers and word of mouth. Now, 70% of my leads come from the Home Services hub. The shop feature alone saved me the cost of building a separate website.",
      stats: ["210+ Verified Reviews", "85% Conversion Rate", "1.5k Store Views/mo"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
      niche: "Home Services"
    },
    {
      name: "Sarah Okafor",
      business: "Sarah's Culinary Hub",
      location: "Abuja",
      growth: "300% Monthly Leads",
      story: "The Niche Hub approach is brilliant. I'm not just lost in a general directory; I'm visible to people specifically looking for private chefs and catering. The leads are much higher quality than what I got on social media.",
      stats: ["92% Client Retention", "24hr Response Time", "Featured in Food Hub"],
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
      niche: "Food & Agro"
    }
  ];

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12 text-nexa-text-primary">
      <NexaNavbar />
      
      <section className="pt-32 pb-24 bg-nexa-bg-surface border-b border-nexa-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h1 className="text-5xl md:text-7xl font-extrabold text-display mb-8">
                  Nexa <br />
                  <span className="text-nexa-brand">Success Stories</span>.
                </h1>
                <p className="text-xl text-nexa-text-secondary leading-relaxed">
                  Meet the entrepreneurs and specialists who are building the future of their industries on the Nexa platform.
                </p>
             </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-24 space-y-32">
        {stories.map((story, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              "flex flex-col lg:flex-row items-center gap-16 lg:gap-32",
              i % 2 !== 0 && "lg:flex-row-reverse"
            )}
          >
            <div className="w-full lg:w-1/2">
               <div className="relative">
                  <div className="absolute -inset-4 bg-nexa-brand/5 blur-3xl rounded-full" />
                  <div className="aspect-[4/5] rounded-[48px] bg-slate-200 overflow-hidden shadow-2xl relative z-10 border-8 border-white dark:border-slate-900">
                     <img src={story.image} className="w-full h-full object-cover" alt={story.name} />
                  </div>
                  <div className="absolute -bottom-10 -right-10 lg:-right-20 z-20">
                     <NexaCard className="p-8 shadow-2xl border-nexa-border bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                        <TrendingUp className="w-8 h-8 text-emerald-500 mb-4" />
                        <h4 className="text-3xl font-extrabold text-display leading-none mb-1">{story.growth}</h4>
                        <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-widest">Growth in 12 Months</p>
                     </NexaCard>
                  </div>
               </div>
            </div>

            <div className="w-full lg:w-1/2 space-y-10">
               <div>
                  <div className="flex items-center gap-3 text-nexa-brand font-bold text-xs uppercase tracking-widest mb-4">
                     <Star className="w-4 h-4 fill-current" />
                     {story.niche} Case Study
                  </div>
                  <h2 className="text-4xl md:text-5xl font-extrabold text-display mb-4">{story.business}</h2>
                  <div className="flex items-center gap-2 text-nexa-text-secondary font-bold text-sm">
                     <MapPin className="w-4 h-4" />
                     {story.location}
                  </div>
               </div>

               <div className="relative">
                  <Quote className="absolute -top-6 -left-12 w-16 h-16 text-nexa-brand/10" />
                  <p className="text-2xl text-nexa-text-secondary leading-relaxed font-medium italic relative z-10">
                    "{story.story}"
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {story.stats.map((stat, j) => (
                    <div key={j} className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-emerald-500" />
                       <span className="text-xs font-bold text-nexa-text-primary uppercase tracking-wider">{stat}</span>
                    </div>
                  ))}
               </div>

               <div className="pt-8 border-t border-nexa-border flex items-center">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-nexa-bg-surface flex items-center justify-center border border-nexa-border">
                        <ShieldCheck className="w-6 h-6 text-nexa-brand" />
                     </div>
                     <div>
                        <p className="text-sm font-bold">{story.name}</p>
                        <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-widest">Verified Seller since 2024</p>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA SECTION */}
      <section className="py-24 bg-gradient-to-br from-nexa-brand to-nexa-brand-mid text-white overflow-hidden relative shadow-2xl">
         {/* Decorative Background Gradients */}
         <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full blur-[100px] pointer-events-none" />
         
         <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-8 text-display">Your success story starts here.</h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
               Join thousands of Nigerian businesses who have abandoned generic directories for Nexa's high-performance niche hubs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <NexaButton size="lg" className="h-16 px-12 rounded-2xl bg-white text-nexa-brand hover:bg-white/90 shadow-xl shadow-black/10 font-bold">List My Business</NexaButton>
               <NexaButton variant="secondary" size="lg" className="h-16 px-12 rounded-2xl bg-black/10 border-white/20 text-white hover:bg-black/20 backdrop-blur-md">Browse Case Studies</NexaButton>
            </div>
         </div>
      </section>

      <NexaBottomBar />
    </main>
  );
}
