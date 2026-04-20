"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  ChevronDown, 
  ArrowRight, 
  Star, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  X,
  Store,
  Info,
  ArrowLeft,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function StorefrontClient({ data }: { data: any }) {
  const params = useParams();
  const businessSlug = params.business as string;
  const businessName = businessSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const addToCart = (product: any) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.name === product.name);
      if (exists) {
        return prev.map(item => item.name === product.name ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (name: string) => {
    setCartItems(prev => prev.filter(item => item.name !== name));
  };

  const updateQty = (name: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.name === name) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cartItems.reduce((acc, item) => {
    const price = parseInt(item.price.replace(/[^\d]/g, ""));
    return acc + (price * item.qty);
  }, 0);

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      {/* STOREFRONT HEADER */}
      <section className="pt-32 pb-12 bg-nexa-bg-surface border-b border-nexa-border">
         <div className="container mx-auto px-4">
            <Link href={`/${params.niche}/${businessSlug}`} className="inline-flex items-center gap-2 text-nexa-text-faint hover:text-nexa-brand transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
               <ArrowLeft className="w-4 h-4" /> Back to Profile
            </Link>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex items-center gap-6">
                  <div className={cn("w-20 h-20 md:w-24 md:h-24 rounded-[32px] flex items-center justify-center text-white text-3xl font-extrabold shadow-2xl", data.colorClass)}>
                     {businessName.charAt(0)}
                  </div>
                  <div>
                     <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl md:text-4xl font-extrabold text-display tracking-tight">{businessName} Store</h1>
                        <ShieldCheck className="w-6 h-6 text-nexa-brand" />
                     </div>
                     <p className="text-nexa-text-secondary text-sm font-medium">Official storefront for verified {data.name.toLowerCase()} supplies.</p>
                  </div>
               </div>
               
               <button 
                 onClick={() => setIsCartOpen(true)}
                 className="relative group bg-white dark:bg-slate-800 p-4 rounded-2xl border border-nexa-border shadow-xl active:scale-95 transition-all"
               >
                  <ShoppingBag className="w-6 h-6 text-nexa-brand group-hover:scale-110 transition-transform" />
                  {cartItems.length > 0 && (
                     <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-nexa-brand text-white text-[10px] font-extrabold flex items-center justify-center shadow-lg animate-in zoom-in">
                        {cartItems.length}
                     </div>
                  )}
               </button>
            </div>
         </div>
      </section>

      <div className="container mx-auto px-4 py-12">
         <div className="flex flex-col lg:flex-row gap-12">
            
            {/* SIDEBAR FILTERS */}
            <aside className="w-full lg:w-64 space-y-10 shrink-0">
               <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-nexa-text-faint mb-6">Categories</h3>
                  <div className="space-y-2">
                     {["All Products", "Tools & Hardware", "Spare Parts", "Maintenance Kits", "Special Deals"].map((cat, i) => (
                        <button key={i} className={cn(
                           "w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all",
                           i === 0 ? "bg-nexa-brand/10 text-nexa-brand" : "text-nexa-text-secondary hover:bg-nexa-bg-surface hover:text-nexa-text-primary"
                        )}>
                           {cat}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="p-6 rounded-3xl bg-nexa-brand/5 border border-nexa-brand/10">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                     <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                     Nexa Verified Shop
                  </h4>
                  <p className="text-[10px] text-nexa-text-secondary leading-relaxed">
                     All items in this shop are verified by Nexa. Enjoy secure payment and guaranteed delivery.
                  </p>
               </div>
            </aside>

            {/* PRODUCT GRID */}
            <div className="flex-1">
               <div className="flex items-center justify-between mb-10">
                  <div className="relative w-full max-w-md">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nexa-text-faint" />
                     <input type="text" placeholder="Search in this shop..." className="w-full h-12 pl-12 pr-4 bg-nexa-bg-surface border border-nexa-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-nexa-brand/20 transition-all text-sm" />
                  </div>
                  <NexaButton variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>Sort</NexaButton>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {data.products.map((product: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                       <NexaCard variant="interactive" padding="none" className="group overflow-hidden flex flex-col h-full border-none shadow-sm hover:shadow-2xl transition-all duration-500">
                          <div className="aspect-square relative overflow-hidden bg-white">
                             <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                             <div className="absolute top-3 right-3 translate-x-12 group-hover:translate-x-0 transition-transform">
                                <NexaBadge variant="neutral" className="bg-white/90 backdrop-blur-md text-nexa-text-primary shadow-lg border-none text-[10px]">New Arrival</NexaBadge>
                             </div>
                          </div>
                          <div className="p-5 flex-1 flex flex-col">
                             <h3 className="font-bold text-sm mb-2 group-hover:text-nexa-brand transition-colors line-clamp-2">{product.name}</h3>
                             <div className="mt-auto flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                   <p className="text-lg font-extrabold text-nexa-brand">{product.price}</p>
                                   <div className="flex items-center gap-0.5 text-amber-500">
                                      <Star className="w-3 h-3 fill-current" />
                                      <span className="text-[10px] font-bold text-nexa-text-faint">4.8</span>
                                   </div>
                                </div>
                                <NexaButton 
                                  size="sm" 
                                  className="w-full rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => addToCart(product)}
                                >
                                   Add to Cart
                                </NexaButton>
                             </div>
                          </div>
                       </NexaCard>
                    </motion.div>
                  ))}
                  
                  {/* Mocking more products */}
                  {[...Array(4)].map((_, i) => (
                     <NexaCard key={`extra-${i}`} variant="flat" padding="none" className="group overflow-hidden flex flex-col h-full border-none opacity-40 hover:opacity-100 transition-opacity">
                        <div className="aspect-square bg-slate-200" />
                        <div className="p-5 flex-1 flex flex-col gap-2">
                           <div className="h-4 w-3/4 bg-slate-300 rounded animate-pulse" />
                           <div className="h-3 w-1/2 bg-slate-200 rounded animate-pulse" />
                           <div className="mt-auto h-6 w-1/3 bg-slate-300 rounded animate-pulse" />
                        </div>
                     </NexaCard>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* SHOPPING CART OVERLAY / SLIDE-OUT */}
      <AnimatePresence>
         {isCartOpen && (
            <>
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }}
                 onClick={() => setIsCartOpen(false)}
                 className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" 
               />
               <motion.div 
                 initial={{ x: "100%" }} 
                 animate={{ x: 0 }} 
                 exit={{ x: "100%" }}
                 transition={{ type: "spring", damping: 30, stiffness: 300 }}
                 className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-nexa-bg-base shadow-2xl z-[110] flex flex-col"
               >
                  <div className="p-8 border-b border-nexa-border flex items-center justify-between bg-nexa-bg-surface">
                     <div className="flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-nexa-brand" />
                        <h2 className="text-xl font-extrabold">Your Cart</h2>
                        <NexaBadge variant="neutral" className="bg-nexa-brand/10 text-nexa-brand border-none">{cartItems.length}</NexaBadge>
                     </div>
                     <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-nexa-bg-base rounded-xl transition-colors">
                        <X className="w-6 h-6" />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                     {cartItems.length > 0 ? cartItems.map((item, i) => (
                        <div key={i} className="flex gap-4 group">
                           <div className="w-20 h-20 rounded-2xl bg-white overflow-hidden border border-nexa-border shrink-0">
                              <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                           </div>
                           <div className="flex-1 min-w-0 py-1">
                              <h4 className="font-bold text-sm mb-1 truncate">{item.name}</h4>
                              <p className="text-nexa-brand font-extrabold text-sm mb-3">{item.price}</p>
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3 bg-nexa-bg-surface rounded-lg p-1 border border-nexa-border">
                                    <button onClick={() => updateQty(item.name, -1)} className="p-1 hover:bg-white rounded transition-colors"><Minus className="w-3 h-3" /></button>
                                    <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                                    <button onClick={() => updateQty(item.name, 1)} className="p-1 hover:bg-white rounded transition-colors"><Plus className="w-3 h-3" /></button>
                                 </div>
                                 <button onClick={() => removeFromCart(item.name)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                              </div>
                           </div>
                        </div>
                     )) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                           <ShoppingBag className="w-20 h-20 mb-6" />
                           <h3 className="text-xl font-bold">Your cart is empty</h3>
                           <p className="text-sm mt-2">Looks like you haven't added anything to your cart yet.</p>
                        </div>
                     )}
                  </div>

                  <div className="p-8 bg-nexa-bg-surface border-t border-nexa-border">
                     <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-sm font-medium text-nexa-text-secondary">
                           <span>Subtotal</span>
                           <span>₦{cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium text-nexa-text-secondary">
                           <span>Delivery Fee</span>
                           <span>₦2,500</span>
                        </div>
                        <div className="h-px bg-nexa-border w-full" />
                        <div className="flex justify-between text-xl font-extrabold">
                           <span>Total</span>
                           <span className="text-nexa-brand">₦{(cartTotal + 2500).toLocaleString()}</span>
                        </div>
                     </div>
                     <Link href="/checkout">
                        <NexaButton size="lg" className="w-full h-14 rounded-2xl shadow-xl shadow-nexa-brand/20 font-extrabold text-lg" disabled={cartItems.length === 0}>
                           Proceed to Checkout
                        </NexaButton>
                     </Link>
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>

      <NexaBottomBar />
    </main>
  );
}
