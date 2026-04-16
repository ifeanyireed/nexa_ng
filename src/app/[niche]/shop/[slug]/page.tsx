"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Heart, 
  Share2, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Plus,
  Minus,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NICHE_DETAILS } from "@/lib/niche-data";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const nicheSlug = params.niche as string;
  const data = NICHE_DETAILS[nicheSlug] || NICHE_DETAILS["home-services"];
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      <div className="container mx-auto px-4 pt-32">
        <Link href={`/${nicheSlug}/shop`} className="inline-flex items-center gap-2 text-nexa-text-faint hover:text-nexa-brand transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-bold uppercase tracking-wider">Back to Marketplace</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* PRODUCT IMAGES */}
          <div className="space-y-6">
             <div className="aspect-square bg-slate-200 rounded-[40px] overflow-hidden shadow-2xl relative">
                {/* Main Product Image Placeholder */}
                <div className="absolute top-4 right-4 z-10">
                   <button className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-nexa-text-secondary shadow-lg">
                      <Heart className="w-6 h-6" />
                   </button>
                </div>
             </div>
             <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "aspect-square rounded-2xl bg-slate-200 cursor-pointer transition-all border-2",
                      activeImage === i ? "border-nexa-brand scale-95 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  />
                ))}
             </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="flex flex-col">
             <div className="mb-8">
                <NexaBadge variant="brand" className="mb-4">New Arrival</NexaBadge>
                <h1 className="text-3xl md:text-5xl font-extrabold text-display mb-4">
                  Premium {data.name.slice(0, -1)} Industrial Tool Set
                </h1>
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                      <span className="text-sm font-bold ml-2">4.9</span>
                      <span className="text-sm text-nexa-text-faint ml-1">(120 Reviews)</span>
                   </div>
                   <div className="w-px h-4 bg-nexa-border" />
                   <span className="text-sm text-emerald-500 font-bold">In Stock</span>
                </div>
             </div>

             <div className="mb-10">
                <div className="flex items-baseline gap-4 mb-2">
                   <span className="text-4xl font-extrabold text-nexa-brand">₦45,000</span>
                   <span className="text-xl text-nexa-text-faint line-through">₦60,000</span>
                   <NexaBadge variant="neutral" className="bg-coral/10 text-coral border-coral/20">-25% OFF</NexaBadge>
                </div>
                <p className="text-sm text-nexa-text-faint">Incl. all taxes and shipping in Lagos</p>
             </div>

             <div className="space-y-6 mb-10 pb-10 border-b border-nexa-border">
                <p className="text-nexa-text-secondary leading-relaxed">
                   The ultimate toolkit for {data.name.toLowerCase()} professionals. High-durability chrome-vanadium steel with ergonomic soft-grip handles. Includes 24 essential pieces for every industrial project.
                </p>
                
                <div className="flex items-center gap-4">
                   <div className="flex items-center bg-nexa-bg-surface border border-nexa-border rounded-xl p-1">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center text-nexa-text-secondary hover:text-nexa-brand transition-colors"
                      >
                         <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center text-nexa-text-secondary hover:text-nexa-brand transition-colors"
                      >
                         <Plus className="w-4 h-4" />
                      </button>
                   </div>
                   <NexaButton size="xl" className="flex-1 shadow-2xl" leftIcon={<ShoppingBag className="w-5 h-5" />}>
                      Add to Cart
                   </NexaButton>
                </div>
             </div>

             {/* SELLER CARD */}
             <NexaCard variant="glass" className="mb-10 flex items-center justify-between p-4 bg-nexa-bg-surface/50">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-2xl bg-nexa-brand/10 flex items-center justify-center text-xl font-bold">TP</div>
                   <div>
                      <div className="flex items-center gap-1 mb-1">
                         <h4 className="font-bold text-sm">Tunji Paints & Tools</h4>
                         <ShieldCheck className="w-3.5 h-3.5 text-nexa-brand" />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-nexa-text-faint font-bold uppercase">
                         <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                         <span>4.8 Rating • 5 years on Nexa</span>
                      </div>
                   </div>
                </div>
                <NexaButton variant="secondary" size="sm">View Shop</NexaButton>
             </NexaCard>

             {/* SHIPPING INFO */}
             <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-nexa-bg-base">
                   <Truck className="w-5 h-5 text-nexa-brand mt-1" />
                   <div>
                      <h5 className="font-bold text-xs mb-1">Fast Delivery</h5>
                      <p className="text-[10px] text-nexa-text-secondary">Arrives in 2-3 business days within Lagos.</p>
                   </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-nexa-bg-base">
                   <RotateCcw className="w-5 h-5 text-emerald-500 mt-1" />
                   <div>
                      <h5 className="font-bold text-xs mb-1">Easy Returns</h5>
                      <p className="text-[10px] text-nexa-text-secondary">7-day free return policy for all verified items.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
