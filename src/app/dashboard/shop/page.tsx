"use client";

import React, { useState } from "react";
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
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function ShopManagerPage() {
  const [viewMode, setViewMode] = useState("grid");
  
  const products = [
    { id: "PRD-01", name: "Premium PVC Pipe 4-inch", price: "₦12,500", stock: 15, status: "active", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400" },
    { id: "PRD-02", name: "Industrial Grade Wrench Set", price: "₦45,000", stock: 0, status: "out_of_stock", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400" },
    { id: "PRD-03", name: "Heavy Duty Drain Unclogger", price: "₦8,200", stock: 8, status: "active", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=400" },
    { id: "PRD-04", name: "Leak Sealant Spray 500ml", price: "₦3,500", stock: 42, status: "active", image: "https://images.unsplash.com/photo-1509391366360-feaffa648bd8?auto=format&fit=crop&q=80&w=400" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-display">NexaShop Manager</h1>
          <p className="text-nexa-text-secondary text-sm mt-1">Manage your inventory, pricing, and product visibility.</p>
        </div>
        <div className="flex items-center gap-3">
          <NexaButton variant="secondary" leftIcon={<Eye className="w-4 h-4" />}>View My Shop</NexaButton>
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
                           <img src={prd.image} alt={prd.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                           <div className="absolute top-3 left-3">
                              {prd.status === "active" ? (
                                 <NexaBadge variant="success">Active</NexaBadge>
                              ) : (
                                 <NexaBadge variant="neutral" className="bg-red-500 text-white border-none">Out of Stock</NexaBadge>
                              )}
                           </div>
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <button className="w-10 h-10 rounded-full bg-white text-nexa-text-primary flex items-center justify-center hover:scale-110 transition-transform"><Edit3 className="w-4 h-4" /></button>
                              <button className="w-10 h-10 rounded-full bg-white text-red-500 flex items-center justify-center hover:scale-110 transition-transform"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                           <h4 className="font-bold text-sm mb-1 line-clamp-1 group-hover:text-nexa-brand transition-colors">{prd.name}</h4>
                           <div className="mt-auto flex items-center justify-between">
                              <p className="text-nexa-brand font-extrabold text-lg">{prd.price}</p>
                              <p className="text-[10px] font-bold text-nexa-text-faint uppercase">Stock: {prd.stock}</p>
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
                           <img src={prd.image} alt={prd.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-sm truncate">{prd.name}</h4>
                           <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-widest">{prd.id}</p>
                        </div>
                        <div className="text-center w-24">
                           <p className="text-sm font-extrabold text-nexa-brand">{prd.price}</p>
                        </div>
                        <div className="text-center w-24">
                           <p className="text-xs font-bold">{prd.stock} units</p>
                        </div>
                        <div className="w-32">
                           {prd.status === "active" ? (
                              <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase">
                                 <CheckCircle2 className="w-3 h-3" /> Active
                              </div>
                           ) : (
                              <div className="flex items-center gap-1.5 text-red-500 font-bold text-[10px] uppercase">
                                 <XCircle className="w-3 h-3" /> Out of Stock
                              </div>
                           )}
                        </div>
                        <div className="flex items-center gap-2">
                           <button className="p-2 hover:bg-white rounded-lg transition-colors"><Edit3 className="w-4 h-4 text-nexa-text-secondary" /></button>
                           <button className="p-2 hover:bg-white rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* FOOTER ACTIONS */}
         <div className="p-6 bg-nexa-bg-base/30 border-t border-nexa-border flex items-center justify-between">
            <p className="text-xs text-nexa-text-faint font-medium italic">Showing 4 of 24 products in your inventory.</p>
            <NexaButton variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>Manage Categories</NexaButton>
         </div>
      </div>
    </div>
  );
}
