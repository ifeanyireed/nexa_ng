"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Package,
  AlertTriangle,
  ArrowRight,
  Eye,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { cn, getProLink } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { api } from "@/lib/api";
import { useAuth } from "@/components/nexa/AuthContext";
import Link from "next/link";

export default function ShopManagerPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState("grid");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const proId = user?.pro_profile?.id || user?.pro_profile?.ID;
      if (!proId) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.get(`/discovery/products?proId=${proId}`);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProducts();
    }
  }, [user]);

  if (loading) return (
     <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-nexa-bg-surface rounded-[32px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[1, 2, 3].map(i => <div key={i} className="h-24 bg-nexa-bg-surface rounded-2xl" />)}
        </div>
        <div className="h-96 bg-nexa-bg-surface rounded-3xl" />
     </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-display">NexaShop Manager</h1>
          <p className="text-nexa-text-secondary text-sm mt-1">Manage your inventory, pricing, and product visibility.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={user?.pro_profile ? getProLink({ ...user.pro_profile, user }) + "/shop" : "#"}>
             <NexaButton variant="secondary" leftIcon={<Eye className="w-4 h-4" />}>View My Shop</NexaButton>
          </Link>
          <NexaButton leftIcon={<Plus className="w-4 h-4" />}>Add New Product</NexaButton>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <NexaCard variant="glass" className="p-6 bg-nexa-brand/5 border-nexa-brand/10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center">
                  <Package className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-extrabold uppercase text-nexa-text-faint tracking-widest">Total Products</p>
                  <h4 className="text-2xl font-extrabold">24</h4>
               </div>
            </div>
         </NexaCard>
         <NexaCard variant="glass" className="p-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-extrabold uppercase text-nexa-text-faint tracking-widest">Total Sales</p>
                  <h4 className="text-2xl font-extrabold">112</h4>
               </div>
            </div>
         </NexaCard>
         <NexaCard variant="glass" className="p-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-extrabold uppercase text-nexa-text-faint tracking-widest">Low Stock Alert</p>
                  <h4 className="text-2xl font-extrabold">3 Items</h4>
               </div>
            </div>
         </NexaCard>
      </div>

      <div className="bg-nexa-bg-surface border border-nexa-border rounded-3xl overflow-hidden">
         {/* TOOLBAR */}
         <div className="p-6 border-b border-nexa-border flex flex-col md:row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nexa-text-faint" />
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="w-full h-11 pl-11 pr-4 bg-nexa-bg-base border border-nexa-border rounded-xl focus:outline-none focus:ring-2 focus:ring-nexa-brand/20 transition-all text-sm"
                  />
               </div>
               <NexaButton variant="secondary" size="sm" className="h-11 px-4" leftIcon={<Filter className="w-4 h-4" />}>Filters</NexaButton>
            </div>
            
            <div className="flex items-center gap-2 bg-nexa-bg-base p-1 rounded-xl border border-nexa-border">
               <button 
                 onClick={() => setViewMode("grid")}
                 className={cn("p-2 rounded-lg transition-all", viewMode === "grid" ? "bg-white dark:bg-slate-800 shadow-sm text-nexa-brand" : "text-nexa-text-faint")}
               >
                  <LayoutGrid className="w-4 h-4" />
               </button>
               <button 
                 onClick={() => setViewMode("list")}
                 className={cn("p-2 rounded-lg transition-all", viewMode === "list" ? "bg-white dark:bg-slate-800 shadow-sm text-nexa-brand" : "text-nexa-text-faint")}
               >
                  <List className="w-4 h-4" />
               </button>
            </div>
         </div>

         {/* PRODUCT CONTENT */}
         <div className="p-6">
            {viewMode === "grid" ? (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {products.map((prd) => (
                     <NexaCard key={prd.id} variant="flat" padding="none" className="group overflow-hidden flex flex-col border-none bg-nexa-bg-base/50">
                        <div className="aspect-square relative overflow-hidden bg-white">
                           <img src={prd.image || "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400"} alt={prd.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                           <div className="absolute top-3 left-3">
                              <NexaBadge variant="success">Active</NexaBadge>
                           </div>
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <button className="w-10 h-10 rounded-full bg-white text-nexa-text-primary flex items-center justify-center hover:scale-110 transition-transform"><Edit3 className="w-4 h-4" /></button>
                              <button className="w-10 h-10 rounded-full bg-white text-red-500 flex items-center justify-center hover:scale-110 transition-transform"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                           <h4 className="font-bold text-sm mb-1 line-clamp-1 group-hover:text-nexa-brand transition-colors">{prd.name}</h4>
                           <div className="mt-auto flex items-center justify-between">
                              <p className="text-nexa-brand font-extrabold text-lg">₦{prd.price.toLocaleString()}</p>
                              <p className="text-[10px] font-bold text-nexa-text-faint uppercase">Stock: ∞</p>
                           </div>
                        </div>
                     </NexaCard>
                  ))}
               </div>
            ) : (
               <div className="space-y-4">
                  {products.map((prd) => (
                     <div key={prd.id} className="flex items-center gap-6 p-4 rounded-2xl bg-nexa-bg-base/50 border border-nexa-border hover:border-nexa-brand/30 transition-all group">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0">
                           <img src={prd.image || "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400"} alt={prd.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-sm truncate">{prd.name}</h4>
                           <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-widest">{prd.id.slice(-8)}</p>
                        </div>
                        <div className="text-center w-24">
                           <p className="text-sm font-extrabold text-nexa-brand">₦{prd.price.toLocaleString()}</p>
                        </div>
                        <div className="text-center w-24">
                           <p className="text-xs font-bold">In Stock</p>
                        </div>
                        <div className="w-32">
                           <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase">
                              <CheckCircle2 className="w-3 h-3" /> Active
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button className="p-2 hover:bg-white rounded-lg transition-colors"><Edit3 className="w-4 h-4 text-nexa-text-secondary" /></button>
                           <button className="p-2 hover:bg-white rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
            
            {products.length === 0 && (
               <div className="py-12 text-center space-y-4">
                  <Package className="w-12 h-12 text-nexa-text-faint mx-auto mb-4" />
                  <h3 className="font-bold text-xl">No products found</h3>
                  <p className="text-nexa-text-secondary">You haven't added any products to your shop yet.</p>
               </div>
            )}
         </div>

         {/* FOOTER ACTIONS */}
         <div className="p-6 bg-nexa-bg-base/30 border-t border-nexa-border flex items-center justify-between">
            <p className="text-xs text-nexa-text-faint font-medium italic">Showing {products.length} products in your inventory.</p>
            <NexaButton variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>Manage Categories</NexaButton>
         </div>
      </div>
    </div>
  );
}
