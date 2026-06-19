"use client";

import React, { useState, useEffect } from "react";
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
import { api } from "@/lib/api";

export default function StorefrontClient({ data }: { data: any }) {
  const params = useParams();
  const businessSlug = params.business as string;
  
  const [pro, setPro] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const proId = businessSlug.includes("business-") 
    ? businessSlug.split("business-")[1] 
    : businessSlug;

  useEffect(() => {
    const fetchPro = async () => {
      try {
        const result = await api.get(`/discovery/pros/${proId}`);
        setPro(result);
      } catch (error) {
        console.error("Error fetching pro for shop:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPro();
  }, [proId]);

  const addToCart = (product: any) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cartItems.reduce((acc, item) => {
    return acc + (item.price * item.qty);
  }, 0);

  if (loading) {
    return (
      <main className="bg-nexa-bg-base min-h-screen pt-32 pb-24">
        <NexaNavbar />
        <div className="container mx-auto px-4 animate-pulse space-y-8">
           <div className="h-48 bg-nexa-bg-surface rounded-[40px]" />
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-nexa-bg-surface rounded-3xl" />)}
           </div>
        </div>
      </main>
    );
  }

  if (!pro) return null;

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      {/* STOREFRONT HEADER */}
      <section className="pt-32 pb-12 bg-nexa-bg-surface border-b border-nexa-border">
         <div className="container mx-auto px-4">
            <Link href={`/${params.niche}/${params.state}/${params.lga}/${businessSlug}`} className="inline-flex items-center gap-2 text-nexa-text-faint hover:text-nexa-brand transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
               <ArrowLeft className="w-4 h-4" /> Back to Profile
            </Link>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex items-center gap-6">
                  <div className={cn("w-20 h-20 md:w-24 md:h-24 rounded-[32px] flex items-center justify-center text-white text-3xl font-extrabold shadow-2xl", data.colorClass)}>
                     {pro.user?.name.charAt(0)}
                  </div>
                  <div>
                     <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl md:text-4xl font-extrabold text-display tracking-tight">{pro.user?.name} Store</h1>
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
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                      {cartItems.length}
                    </span>
                  )}
               </button>
            </div>
         </div>
      </section>

      {/* PRODUCTS GRID */}
      <div className="container mx-auto px-4 py-16">
         {pro.products?.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {pro.products.map((product: any) => (
                 <NexaCard key={product.id} variant="interactive" className="p-0 overflow-hidden flex flex-col group h-full">
                    <div className="aspect-square bg-slate-100 relative overflow-hidden">
                       <img 
                          src={product.image || "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400"} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          alt={product.name} 
                       />
                       <div className="absolute top-3 left-3">
                          <NexaBadge className="bg-white/80 backdrop-blur-md border-none text-black">New Arrival</NexaBadge>
                       </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                       <h3 className="text-lg font-bold mb-2 group-hover:text-nexa-brand transition-colors">{product.name}</h3>
                       <p className="text-xs text-nexa-text-faint mb-4 line-clamp-2">{product.description || "Premium quality supplies verified by Nexa."}</p>
                       
                       <div className="mt-auto flex items-center justify-between">
                          <span className="text-xl font-extrabold text-nexa-text-primary">₦{product.price.toLocaleString()}</span>
                          <button 
                            onClick={() => addToCart(product)}
                            className="w-10 h-10 rounded-xl bg-nexa-brand text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-nexa-brand/20"
                          >
                             <Plus className="w-5 h-5" />
                          </button>
                       </div>
                    </div>
                 </NexaCard>
              ))}
           </div>
         ) : (
           <div className="py-24 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-nexa-bg-surface flex items-center justify-center mx-auto text-nexa-text-faint">
                 <ShoppingBag className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold">Store is Empty</h3>
              <p className="text-nexa-text-secondary">This business hasn't added any products to their storefront yet.</p>
              <NexaButton variant="secondary" onClick={() => window.history.back()}>Go Back</NexaButton>
           </div>
         )}
      </div>

      {/* CART DRAWER */}
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
                 className="fixed top-0 right-0 h-full w-full max-w-md bg-nexa-bg-base shadow-2xl z-[110] flex flex-col"
               >
                  <div className="p-6 border-b border-nexa-border flex items-center justify-between bg-nexa-bg-surface">
                     <div className="flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-nexa-brand" />
                        <h2 className="text-xl font-extrabold text-display">My Cart</h2>
                     </div>
                     <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-nexa-bg-base rounded-xl transition-colors">
                        <X className="w-6 h-6" />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                     {cartItems.length > 0 ? cartItems.map((item) => (
                        <div key={item.id} className="flex gap-4">
                           <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0">
                              <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                           </div>
                           <div className="flex-1 space-y-2">
                              <div className="flex justify-between">
                                 <h4 className="font-bold text-sm">{item.name}</h4>
                                 <button onClick={() => removeFromCart(item.id)} className="text-nexa-text-faint hover:text-rose-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                              <p className="text-xs text-nexa-text-faint">Verified Supply</p>
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3 bg-nexa-bg-surface rounded-lg px-2 py-1 border border-nexa-border">
                                    <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:text-nexa-brand"><Minus className="w-3 h-3" /></button>
                                    <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                                    <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:text-nexa-brand"><Plus className="w-3 h-3" /></button>
                                 </div>
                                 <span className="font-bold text-sm">₦{(item.price * item.qty).toLocaleString()}</span>
                              </div>
                           </div>
                        </div>
                     )) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                           <ShoppingBag className="w-16 h-16" />
                           <p className="font-bold">Your cart is empty</p>
                        </div>
                     )}
                  </div>

                  {cartItems.length > 0 && (
                     <div className="p-8 border-t border-nexa-border bg-nexa-bg-surface space-y-6">
                        <div className="space-y-2">
                           <div className="flex justify-between text-sm">
                              <span className="text-nexa-text-secondary">Subtotal</span>
                              <span className="font-bold">₦{cartTotal.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                              <span className="text-nexa-text-secondary">Delivery</span>
                              <span className="text-emerald-500 font-bold">Calculated at checkout</span>
                           </div>
                           <div className="flex justify-between text-lg pt-4 border-t border-nexa-border">
                              <span className="font-extrabold text-display">Total</span>
                              <span className="font-extrabold text-nexa-brand">₦{cartTotal.toLocaleString()}</span>
                           </div>
                        </div>
                        
                        <Link href="/checkout">
                           <NexaButton size="lg" className="w-full h-14" rightIcon={<ArrowRight className="w-5 h-5" />}>
                              Checkout Now
                           </NexaButton>
                        </Link>
                     </div>
                  )}
               </motion.div>
            </>
         )}
      </AnimatePresence>

      <NexaBottomBar />
    </main>
  );
}
