"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  Filter, 
  ArrowRight,
  Heart,
  Star
} from "lucide-react";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaInput } from "@/components/nexa/NexaInput";
import Link from "next/link";

export default function ShopClient({ data, nicheSlug }: { data: any, nicheSlug: string }) {
  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      {/* SHOP HEADER */}
      <section className="pt-24 pb-8 bg-nexa-bg-surface border-b border-nexa-border sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
             <div>
                <NexaBadge variant="brand" className="mb-2">NexaShop</NexaBadge>
                <h1 className="text-2xl font-bold text-display">{data.name} Marketplace</h1>
             </div>
             <div className="flex items-center gap-3 w-full md:w-auto">
                <NexaInput variant="search" placeholder="Search products..." className="flex-1 md:w-64" />
                <button className="w-12 h-12 rounded-xl bg-nexa-bg-base border border-nexa-border flex items-center justify-center relative">
                   <ShoppingBag className="w-5 h-5" />
                   <span className="absolute -top-1 -right-1 w-5 h-5 bg-nexa-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">2</span>
                </button>
             </div>
          </div>
          
          <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
             <NexaButton variant="secondary" size="sm" leftIcon={<Filter className="w-4 h-4" />}>All Filters</NexaButton>
             <div className="h-4 w-px bg-nexa-border" />
             {["Best Sellers", "New Arrivals", "Price: Low to High", "Verified Sellers"].map(f => (
               <button key={f} className="px-4 py-1.5 rounded-full bg-nexa-bg-base border border-nexa-border text-xs font-medium hover:border-nexa-brand transition-colors whitespace-nowrap">
                 {f}
               </button>
             ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* PRODUCT CATEGORIES */}
        <section className="mb-12">
           <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold">Categories</h2>
              <NexaButton variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>View All</NexaButton>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {data.subServices.map((service: string) => (
                <div key={service} className="p-4 rounded-2xl bg-nexa-bg-surface border border-nexa-border flex flex-col items-center text-center hover:border-nexa-brand transition-all cursor-pointer group">
                   <div className="w-12 h-12 rounded-full bg-nexa-bg-base flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-5 h-5 text-nexa-brand" />
                   </div>
                   <span className="text-xs font-bold">{service}</span>
                </div>
              ))}
           </div>
        </section>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
           {[...Array(12)].map((_, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: (i % 4) * 0.1 }}
             >
                <Link href={`/${nicheSlug}/shop/product-${i}`}>
                   <NexaCard variant="flat" padding="none" className="group h-full flex flex-col">
                      <div className="aspect-square relative overflow-hidden bg-slate-100">
                         <div className="absolute top-3 left-3 z-10">
                            <NexaBadge variant="neutral" className="bg-white/80 backdrop-blur-sm border-none shadow-sm text-black">New</NexaBadge>
                         </div>
                         <button className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-nexa-text-faint hover:text-coral transition-colors">
                            <Heart className="w-4 h-4" />
                         </button>
                         {/* Product Image Placeholder */}
                         <div className="w-full h-full bg-slate-200 transition-transform duration-500 group-hover:scale-110" />
                         
                         <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                            <NexaButton className="w-full shadow-xl">Quick Add</NexaButton>
                         </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-nexa-text-faint uppercase tracking-wider">Verified Seller</span>
                            <div className="flex items-center gap-1">
                               <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                               <span className="text-[10px] font-bold">4.9</span>
                            </div>
                         </div>
                         <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-nexa-brand transition-colors">
                            Premium {data.name.slice(0, -1)} Industrial Tool Set - Heavy Duty
                         </h3>
                         <div className="mt-auto flex items-center justify-between">
                            <p className="font-extrabold text-nexa-brand text-lg">₦{(15000 + i * 2500).toLocaleString()}</p>
                            <span className="text-[10px] text-nexa-text-faint line-through">₦{(20000 + i * 2500).toLocaleString()}</span>
                         </div>
                      </div>
                   </NexaCard>
                </Link>
             </motion.div>
           ))}
        </div>
        
        {/* PAGINATION */}
        <div className="mt-16 flex justify-center">
           <NexaButton variant="secondary" size="lg" className="px-12">
              Load More Products
           </NexaButton>
        </div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
