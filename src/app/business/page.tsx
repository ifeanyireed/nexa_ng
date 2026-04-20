"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  BarChart3, 
  Target, 
  Zap, 
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Users,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";

export default function BusinessSolutionsPage() {
  const solutions = [
    { title: "Niche Hub Advertising", desc: "Get featured at the top of your specific service hub. Reach customers exactly when they need you.", icon: <Target className="w-6 h-6" /> },
    { title: "Enterprise CRM", desc: "Manage thousands of leads and bookings with our advanced pipeline tools designed for scale.", icon: <BarChart3 className="w-6 h-6" /> },
    { title: "Verified Partner Program", desc: "Gain the 'Nexa Gold' badge. Unlock higher trust and priority in search results.", icon: <CheckCircle2 className="w-6 h-6" /> },
    { title: "Custom API Access", desc: "Integrate Nexa's booking and discovery engine directly into your own corporate website.", icon: <Globe className="w-6 h-6" /> },
  ];

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12 text-nexa-text-primary">
      <NexaNavbar />
      
      {/* B2B HERO */}
      <section className="pt-32 pb-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-nexa-brand/20 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full border border-white/20 mb-8 backdrop-blur-md">
                   <Briefcase className="w-4 h-4 text-nexa-brand" />
                   <span className="text-[10px] font-bold uppercase tracking-[0.2em]">B2B & Enterprise Solutions</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1]">
                  Scale your <br />
                  <span className="text-nexa-brand">Business Engine</span> <br />
                  with Nexa.
                </h1>
                <p className="text-xl text-slate-300 leading-relaxed mb-10 max-w-xl">
                  Custom advertising, advanced analytics, and enterprise-grade tools for businesses looking to dominate their niche.
                </p>
                <div className="flex flex-wrap gap-4">
                   <NexaButton size="lg" className="px-10 h-16 rounded-2xl">Get Started</NexaButton>
                   <NexaButton variant="secondary" size="lg" className="px-10 h-16 rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10">Talk to Sales</NexaButton>
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* SOLUTIONS GRID */}
      <section className="py-24">
         <div className="container mx-auto px-4">
            <div className="text-center mb-20">
               <h2 className="text-3xl md:text-5xl font-extrabold text-display mb-4">Enterprise Growth Tools</h2>
               <p className="text-nexa-text-secondary">Tailored solutions for every stage of your business journey.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {solutions.map((sol, i) => (
                 <NexaCard key={i} variant="interactive" className="p-8 h-full flex flex-col group">
                    <div className="w-14 h-14 rounded-2xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       {sol.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4">{sol.title}</h3>
                    <p className="text-sm text-nexa-text-secondary leading-relaxed flex-1 mb-8">{sol.desc}</p>
                    <NexaButton variant="ghost" className="p-0 h-auto justify-start text-nexa-brand font-extrabold" rightIcon={<ArrowRight className="w-4 h-4" />}>Learn More</NexaButton>
                 </NexaCard>
               ))}
            </div>
         </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-24 bg-nexa-bg-surface border-y border-nexa-border">
         <div className="container mx-auto px-4 text-center max-w-2xl">
            <div className="w-20 h-20 bg-nexa-brand/10 text-nexa-brand rounded-full flex items-center justify-center mx-auto mb-8">
               <Zap className="w-10 h-10" />
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-display mb-6">Ready to lead your niche?</h2>
            <p className="text-lg text-nexa-text-secondary mb-10">
               Join over 500+ top-tier businesses currently using Nexa Enterprise to scale their operations across Nigeria.
            </p>
            <NexaButton size="lg" className="px-12 h-16 rounded-2xl shadow-2xl shadow-nexa-brand/30">Activate Business Hub</NexaButton>
         </div>
      </section>

      <NexaBottomBar />
    </main>
  );
}
