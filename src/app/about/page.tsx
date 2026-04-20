"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Heart, 
  Target, 
  ShieldCheck, 
  Users, 
  Globe, 
  Zap,
  CheckCircle2,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";

export default function AboutPage() {
  const values = [
    { title: "Radical Transparency", desc: "We believe in clear pricing, verified reviews, and honest business practices.", icon: <ShieldCheck className="w-6 h-6" />, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Niche Authority", desc: "General directories are dead. We build dedicated marketplaces for every industry.", icon: <Target className="w-6 h-6" />, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Made for Nigeria", desc: "Built locally to solve local trust and discovery problems in our unique economy.", icon: <Heart className="w-6 h-6" />, color: "text-coral", bg: "bg-coral/10" },
    { title: "Empowering Growth", desc: "We provide the tools (CRM, Analytics, Shop) so small businesses can act like enterprises.", icon: <Zap className="w-6 h-6" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      {/* HERO STORY */}
      <section className="pt-32 pb-24 overflow-hidden border-b border-nexa-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
               <div className="inline-flex items-center gap-2 bg-nexa-brand/10 text-nexa-brand px-4 py-2 rounded-full border border-nexa-brand/20 mb-8">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">Our Mission</span>
               </div>
               <h1 className="text-5xl md:text-7xl font-extrabold text-display mb-10 leading-[1.1]">
                 We're building the <br />
                 <span className="text-nexa-brand">Trust Infrastructure</span> <br />
                 for Nigerian Commerce.
               </h1>
               <p className="text-2xl text-nexa-text-secondary leading-relaxed max-w-2xl">
                 Nexa is more than a directory. It's a specialized ecosystem where every business has a home and every customer finds exactly what they need.
               </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-24 bg-nexa-bg-surface">
        <div className="container mx-auto px-4">
           <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-extrabold text-display mb-4">The Nexa Way</h2>
              <p className="text-nexa-text-secondary">The principles that guide every feature we build.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <NexaCard className="h-full p-8 hover:border-nexa-brand/50 transition-all group">
                     <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", value.bg, value.color)}>
                        {value.icon}
                     </div>
                     <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                     <p className="text-sm text-nexa-text-secondary leading-relaxed">{value.desc}</p>
                  </NexaCard>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* TEAM / CULTURE */}
      <section className="py-24 overflow-hidden">
         <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-20 items-center">
               <div className="relative">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-nexa-brand/10 blur-[60px] rounded-full" />
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-nexa-accent/10 blur-[60px] rounded-full" />
                  <div className="aspect-square rounded-[40px] bg-slate-200 overflow-hidden shadow-2xl relative z-10">
                     <img 
                       src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
                       alt="Nexa Team" 
                       className="w-full h-full object-cover"
                     />
                  </div>
               </div>
               <div>
                  <h2 className="text-4xl font-extrabold text-display mb-8">Founded in Lagos, <br />Scaling for Nigeria.</h2>
                  <p className="text-lg text-nexa-text-secondary leading-relaxed mb-8">
                     Our team consists of engineers, designers, and industry specialists who understand the Nigerian market. From the bustling markets of Mushin to the tech hubs of Yaba, we've interviewed thousands of business owners to build a platform that actually works for them.
                  </p>
                  <div className="space-y-4 mb-10">
                     {[
                       "100% Remote-first local team",
                       "Supported by top Nigerian investors",
                       "Building the future of local SEO"
                     ].map(item => (
                       <div key={item} className="flex items-center gap-3 font-bold text-sm">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          <span>{item}</span>
                       </div>
                     ))}
                  </div>
                  <NexaButton size="lg" className="px-10">Join the Team</NexaButton>
               </div>
            </div>
         </div>
      </section>

      {/* STATS */}
      <section className="py-24 bg-nexa-bg-surface border-y border-nexa-border">
         <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {[
                 { label: "Verified Sellers", val: "10,000+" },
                 { label: "Monthly Leads", val: "50,000+" },
                 { label: "Cities Covered", val: "36" },
                 { label: "Niche Hubs", val: "50+" }
               ].map((s, i) => (
                 <div key={i} className="text-center">
                    <h4 className="text-4xl md:text-5xl font-extrabold text-nexa-brand mb-2">{s.val}</h4>
                    <p className="text-xs font-bold text-nexa-text-faint uppercase tracking-widest">{s.label}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      <NexaBottomBar />
    </main>
  );
}
