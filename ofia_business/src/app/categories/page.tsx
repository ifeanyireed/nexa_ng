"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ChevronRight, 
  ArrowRight,
  Home,
  Scissors,
  Briefcase,
  GraduationCap,
  PartyPopper,
  Pill,
  Truck,
  Car,
  UtensilsCrossed,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NICHE_DETAILS } from "@/lib/niche-data";

export default function CategoriesPage() {
  const mainNiches = Object.entries(NICHE_DETAILS).filter(([_, data]) => !data.parentNicheId);

  const getNicheIcon = (id: string) => {
    switch (id) {
      case "home-services": return <Home className="w-6 h-6" />;
      case "fashion-grooming": return <Scissors className="w-6 h-6" />;
      case "professional-services": return <Briefcase className="w-6 h-6" />;
      case "education-skills": return <GraduationCap className="w-6 h-6" />;
      case "events-entertainment": return <PartyPopper className="w-6 h-6" />;
      case "health-wellness": return <Pill className="w-6 h-6" />;
      case "logistics-transport": return <Truck className="w-6 h-6" />;
      case "automotive-services": return <Car className="w-6 h-6" />;
      case "food-agribusiness": return <UtensilsCrossed className="w-6 h-6" />;
      case "real-estate-construction": return <Building2 className="w-6 h-6" />;
      default: return <ChevronRight className="w-6 h-6" />;
    }
  };

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      <section className="pt-32 pb-16 bg-nexa-bg-surface border-b border-nexa-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-display mb-6">Browse Categories</h1>
          <p className="text-xl text-nexa-text-secondary max-w-2xl leading-relaxed">
            Discover thousands of verified businesses and professionals across Nigeria, organized by industry.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mainNiches.map(([slug, data], i) => (
            <motion.div
              key={slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <NexaCard variant="interactive" className="h-full flex flex-col p-8 group">
                <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center text-white mb-8 shadow-xl transition-transform group-hover:scale-110", data.colorClass)}>
                  {getNicheIcon(slug)}
                </div>
                
                <h3 className="text-2xl font-extrabold mb-4 group-hover:text-nexa-brand transition-colors">{data.name}</h3>
                <p className="text-nexa-text-secondary mb-8 flex-1 leading-relaxed">
                  {data.heroTitle} — {data.personality.toLowerCase()}.
                </p>

                <div className="space-y-4 mb-8">
                  <p className="text-[10px] font-bold text-nexa-text-faint uppercase tracking-widest">Sub-Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(NICHE_DETAILS)
                      .filter(([_, sub]) => sub.parentNicheId === slug)
                      .map(([subSlug, subData]) => (
                        <Link key={subSlug} href={`/${subSlug}`}>
                          <span className="px-3 py-1 rounded-full bg-nexa-bg-base border border-nexa-border text-xs font-medium hover:border-nexa-brand hover:text-nexa-brand transition-colors">
                            {subData.name}
                          </span>
                        </Link>
                      ))}
                  </div>
                </div>

                <Link href={`/${slug}`}>
                  <NexaButton variant="secondary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Explore All
                  </NexaButton>
                </Link>
              </NexaCard>
            </motion.div>
          ))}
        </div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
