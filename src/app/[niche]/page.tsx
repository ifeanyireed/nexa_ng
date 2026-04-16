"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Filter, 
  Star, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ShoppingBag, 
  FileText, 
  Tag, 
  ChevronRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  MessageSquare,
  Plus,
  Eye,
  Edit3,
  BarChart3,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaRating } from "@/components/nexa/NexaRating";
import { useNiche } from "@/components/nexa/NicheContext";
import { NICHE_DETAILS } from "@/lib/niche-data";
import Link from "next/link";

// --- COMPONENTS ---

const SectionHeader = ({ title, viewAll = true, href }: { title: string, viewAll?: boolean, href?: string }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-bold text-display">{title}</h2>
    {viewAll && href && (
      <Link href={href}>
        <NexaButton variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
          View All
        </NexaButton>
      </Link>
    )}
  </div>
);

// --- BUYER MODE SECTIONS ---

const BuyerModeLayout = ({ data, activeSubService, setActiveSubService }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 1. INTENT HERO */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className={cn("absolute inset-0 z-0 opacity-10", data.colorClass)} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <NexaBadge variant="neutral" className="mb-4">{data.name}</NexaBadge>
            <h1 className="text-4xl md:text-6xl font-extrabold text-display mb-8 leading-tight">
              {data.heroTitle} <br />
              <span className={cn("text-nexa-brand", `text-${data.id}`)}>{data.name} in Lagos.</span>
            </h1>

            <div className="liquid-glass p-2 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-2 shadow-xl border border-white/20">
              <div className="flex-1 flex items-center px-4">
                <Search className="w-5 h-5 text-nexa-text-faint" />
                <input 
                  type="text" 
                  placeholder={`Find a ${activeSubService.slice(0, -1)}...`}
                  className="bg-transparent border-none outline-none w-full h-12 px-3 text-nexa-text-primary"
                />
              </div>
              <div className="hidden md:block w-px h-8 bg-nexa-border" />
              <Link href={`/${data.id}/near-me`} className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-white/10 rounded-xl transition-colors">
                <MapPin className="w-5 h-5 text-nexa-brand" />
                <span className="text-sm font-medium whitespace-nowrap">Lekki, Lagos</span>
              </Link>
              <NexaButton size="lg" className="rounded-xl shadow-lg shadow-nexa-brand/20">
                Search
              </NexaButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. SUB-SERVICE FINDER GRID */}
      <section className="py-12 bg-nexa-bg-surface">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {data.subServices.map((service: string) => (
              <NexaCard 
                key={service}
                variant={activeSubService === service ? "glass" : "flat"}
                onClick={() => setActiveSubService(service)}
                className={cn(
                  "cursor-pointer flex flex-col items-center justify-center p-6 text-center transition-all group",
                  activeSubService === service ? "border-nexa-brand ring-1 ring-nexa-brand/20" : "hover:border-nexa-brand/50"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                  activeSubService === service ? "bg-nexa-brand text-white" : "bg-nexa-bg-base text-nexa-brand"
                )}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold">{service}</span>
              </NexaCard>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-24">
        {/* 3. TOP RATED NEAR YOU */}
        <section>
          <SectionHeader title={`Top Rated ${activeSubService} Near You`} href={`/${data.id}/search`} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <Link href={`/${data.id}/business-${i}`} key={i}>
                <NexaCard variant="glass" className="p-0 overflow-hidden group">
                  <div className="relative h-48 bg-slate-200">
                    <div className="absolute top-3 right-3 z-10">
                      <NexaBadge variant="verified">Verified</NexaBadge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <NexaRating value={4.9} />
                      <span className="text-white text-xs font-bold">(48 reviews)</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-1">Expert {activeSubService.slice(0, -1)} {i}</h3>
                    <div className="flex items-center gap-2 text-nexa-text-secondary text-xs mb-4">
                      <MapPin className="w-3 h-3" />
                      <span>2.4km • Lekki Phase 1</span>
                      <span className="mx-1">•</span>
                      <Clock className="w-3 h-3" />
                      <span className="text-emerald-500 font-bold">15m response</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-nexa-border">
                      <span className="text-xs font-bold text-nexa-brand uppercase tracking-wider">Available Today</span>
                      <NexaButton variant="ghost" size="sm" className="h-8 px-0 text-nexa-brand">Book Now</NexaButton>
                    </div>
                  </div>
                </NexaCard>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. AVAILABLE FOR HIRE FEED */}
        <section className="bg-nexa-brand/5 -mx-4 px-4 py-16 rounded-[40px] border border-nexa-brand/10">
          <SectionHeader title="Available for Hire Right Now" href={`/${data.id}/available`} />
          <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex-shrink-0 w-72">
                <NexaCard variant="glass" className="bg-white/80 dark:bg-slate-900/80">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-nexa-brand/10 border border-nexa-brand/20 flex items-center justify-center text-nexa-brand font-bold text-xl">
                      JD
                    </div>
                    <div>
                      <h4 className="font-bold">John Doe</h4>
                      <div className="flex items-center gap-1 text-[10px] text-nexa-text-faint uppercase font-bold">
                        <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>Instant Booking</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-nexa-text-secondary line-clamp-2 mb-4">
                    Experienced {activeSubService.slice(0, -1)} ready to handle your task immediately with quality tools.
                  </p>
                  <div className="flex items-center justify-between">
                    <NexaBadge variant="neutral" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      Available Today
                    </NexaBadge>
                    <NexaButton size="sm" className="h-8">Hire</NexaButton>
                  </div>
                </NexaCard>
              </div>
            ))}
          </div>
        </section>

        {/* 5. NICHE PRODUCT SHOP */}
        <section>
          <SectionHeader title={`${data.name} Supplies & Tools`} href={`/${data.id}/shop`} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {data.products.map((product: any, i: number) => (
              <Link href={`/${data.id}/shop/product-${i}`} key={i}>
                <NexaCard variant="flat" padding="none" className="group cursor-pointer h-full flex flex-col">
                  <div className="aspect-square relative overflow-hidden bg-slate-100">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute bottom-2 right-2">
                      <button className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-nexa-brand">
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex-1">
                    <h4 className="text-sm font-bold mb-1 line-clamp-2">{product.name}</h4>
                    <p className="text-nexa-brand font-bold mt-auto">{product.price}</p>
                  </div>
                </NexaCard>
              </Link>
            ))}
          </div>
        </section>

        {/* 6. ARTICLES & INSIGHT FEED */}
        <section>
          <SectionHeader title="Expert Articles & Guides" href={`/${data.id}/articles`} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <Link href={`/${data.id}/articles/article-${i}`} key={i}>
                <div className="group cursor-pointer">
                  <div className="aspect-video bg-slate-200 rounded-2xl mb-4 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <NexaBadge variant="neutral" className="text-[10px] py-0">{activeSubService.slice(0, -1)} Guide</NexaBadge>
                    <span className="text-[10px] text-nexa-text-faint font-bold uppercase">5 min read</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-nexa-brand transition-colors line-clamp-2">
                    How to choose the best {activeSubService.slice(0, -1)} for your project in Lagos
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-nexa-brand/10 flex items-center justify-center text-[10px] font-bold">JD</div>
                    <span className="text-xs text-nexa-text-secondary font-medium">by John Doe • Verified Seller</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 7. VERIFIED PROFESSIONALS */}
        <section className="py-12 border-y border-nexa-border">
          <SectionHeader title="Verified Excellence" viewAll={false} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <NexaCard key={i} variant="glass" className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-24 h-24 rounded-2xl bg-nexa-brand/10 flex items-center justify-center relative flex-shrink-0">
                  <ShieldCheck className="w-12 h-12 text-nexa-brand" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-bold mb-1">Corporate {data.name} Ltd</h3>
                  <p className="text-sm text-nexa-text-secondary mb-3">150+ successful jobs • CAC Verified • 5 years on Nexa</p>
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <NexaButton size="sm" variant="secondary">View Profile</NexaButton>
                    <span className="text-xs font-bold text-emerald-500">Highly Recommended</span>
                  </div>
                </div>
              </NexaCard>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

// --- SELLER MODE MODULES ---

const SellerModeLayout = ({ data }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 pt-32 pb-24"
    >
      <div className="flex flex-col gap-12">
        {/* 1. MY LIVE PROFILE PREVIEW */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Live Profile Preview</h2>
            <NexaButton variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
              View Live Page
            </NexaButton>
          </div>
          <div className="rounded-3xl border-8 border-nexa-bg-surface shadow-2xl overflow-hidden aspect-[16/7] relative group">
             <div className="absolute inset-0 bg-slate-200 animate-pulse" />
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <NexaButton variant="secondary" leftIcon={<Edit3 className="w-4 h-4" />}>Edit Profile</NexaButton>
             </div>
             <div className="absolute top-4 right-4">
                <NexaBadge variant="verified">Live Now</NexaBadge>
             </div>
          </div>
        </section>

        {/* 2. PERFORMANCE SNAPSHOT */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Profile Views", value: "1,240", change: "+12%", icon: <Eye className="w-5 h-5 text-blue-500" /> },
            { label: "New Leads", value: "48", change: "+5%", icon: <Zap className="w-5 h-5 text-amber-500" /> },
            { label: "Bookings", value: "12", change: "0%", icon: <Calendar className="w-5 h-5 text-emerald-500" /> },
            { label: "Earnings", value: "₦420k", change: "+8%", icon: <TrendingUp className="w-5 h-5 text-fuchsia-500" /> },
          ].map((kpi, i) => (
            <NexaCard key={i} variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-nexa-bg-base flex items-center justify-center">
                  {kpi.icon}
                </div>
                <span className="text-xs font-bold text-emerald-500">{kpi.change}</span>
              </div>
              <p className="text-nexa-text-faint text-xs font-bold uppercase tracking-wider mb-1">{kpi.label}</p>
              <h3 className="text-2xl font-extrabold">{kpi.value}</h3>
            </NexaCard>
          ))}
        </section>

        {/* 3. QUICK ACTIONS HUB */}
        <section>
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Add Photo", icon: <Plus className="w-6 h-6" /> },
              { label: "Create Deal", icon: <Tag className="w-6 h-6" /> },
              { label: "Write Article", icon: <FileText className="w-6 h-6" /> },
              { label: "Bookings", icon: <Calendar className="w-6 h-6" /> },
              { label: "Add Product", icon: <ShoppingBag className="w-6 h-6" /> },
              { label: "Messages", icon: <MessageSquare className="w-6 h-6" /> },
            ].map((action, i) => (
              <button key={i} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-nexa-bg-surface hover:bg-nexa-bg-glass border border-nexa-border transition-all group">
                <div className="w-12 h-12 rounded-full bg-nexa-brand/10 text-nexa-brand flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
                <span className="text-xs font-bold">{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 4. NICHE PULSE FEED */}
        <div className="grid md:grid-cols-2 gap-8">
           <NexaCard variant="glass" className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-nexa-brand" />
                <h3 className="font-bold">Trending in {data.name}</h3>
              </div>
              <div className="space-y-4">
                {["Emergency Repair", "Weekend Service", "Premium Materials"].map((term, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-nexa-bg-base/50">
                    <span className="text-sm font-medium">{term}</span>
                    <NexaBadge variant="neutral" className="text-[10px]">+{(30 - i*5)}%</NexaBadge>
                  </div>
                ))}
              </div>
           </NexaCard>
           
           <NexaCard variant="glass" className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-nexa-brand" />
                <h3 className="font-bold">Niche Leaderboard</h3>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((pos) => (
                  <div key={pos} className={cn(
                    "flex items-center justify-between p-3 rounded-xl",
                    pos === 2 ? "bg-nexa-brand/10 border border-nexa-brand/20" : "bg-nexa-bg-base/50"
                  )}>
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-bold w-4">{pos}</span>
                       <div className="w-8 h-8 rounded-full bg-slate-300" />
                       <span className="text-sm font-medium">Business {pos} {pos === 2 && "(You)"}</span>
                    </div>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                ))}
              </div>
           </NexaCard>
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN PAGE ---

export default function NicheHubPage() {
  const params = useParams();
  const nicheSlug = params.niche as string;
  const { mode, setCurrentNiche } = useNiche();
  
  const data = NICHE_DETAILS[nicheSlug] || NICHE_DETAILS["home-services"];
  
  const [activeSubService, setActiveSubService] = useState(data.subServices[0]);

  useEffect(() => {
    setCurrentNiche(data.id);
    return () => setCurrentNiche(null);
  }, [data.id, setCurrentNiche]);

  return (
    <main className="bg-nexa-bg-base min-h-screen">
      <NexaNavbar />
      
      <AnimatePresence mode="wait">
        {mode === "buyer" ? (
          <BuyerModeLayout 
            key="buyer"
            data={data} 
            activeSubService={activeSubService} 
            setActiveSubService={setActiveSubService} 
          />
        ) : (
          <SellerModeLayout 
            key="seller"
            data={data} 
          />
        )}
      </AnimatePresence>

      <NexaBottomBar />
    </main>
  );
}
