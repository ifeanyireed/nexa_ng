"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  CreditCard,
  ShieldCheck,
  History,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function LeadWalletPage() {
  const transactions = [
    { id: "TX-9901", type: "deduction", amount: "₦2,500", date: "Oct 20, 2026", description: "Lead Acquired: Plumbing Repair" },
    { id: "TX-9902", type: "topup", amount: "₦20,000", date: "Oct 18, 2026", description: "Wallet Top-up via Card" },
    { id: "TX-9903", type: "deduction", amount: "₦1,500", date: "Oct 15, 2026", description: "Lead Acquired: Tap Installation" },
    { id: "TX-9904", type: "deduction", amount: "₦3,000", date: "Oct 14, 2026", description: "Lead Acquired: Full Piping" },
    { id: "TX-9905", type: "refund", amount: "₦1,500", date: "Oct 12, 2026", description: "Refund: Invalid Lead" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-extrabold text-display mb-2">Lead Wallet</h1>
            <p className="text-nexa-text-secondary">Manage your balance to acquire Pay-Per-Lead inquiries.</p>
         </div>
         <NexaButton size="lg" leftIcon={<Plus className="w-5 h-5" />} className="shadow-lg shadow-nexa-brand/20">
            Top Up Wallet
         </NexaButton>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* LEFT COL: BALANCE & QUICK ACTIONS */}
         <div className="space-y-6">
            <NexaCard variant="glass" className="p-8 bg-gradient-to-br from-nexa-brand to-nexa-accent text-white border-none shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-20">
                  <Wallet className="w-32 h-32" />
               </div>
               <div className="relative z-10">
                  <p className="text-white/80 font-bold uppercase tracking-widest text-xs mb-2">Available Balance</p>
                  <h2 className="text-5xl font-extrabold mb-6">₦42,500</h2>
                  <div className="flex flex-col gap-3">
                     <button className="w-full bg-white text-nexa-brand font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors">
                        <Plus className="w-5 h-5" /> Add Funds
                     </button>
                     <button className="w-full bg-black/20 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black/30 transition-colors backdrop-blur-sm">
                        <CreditCard className="w-5 h-5" /> Manage Cards
                     </button>
                  </div>
               </div>
            </NexaCard>

            <NexaCard variant="flat" className="p-6 border border-nexa-border bg-nexa-bg-surface/50">
               <h3 className="font-bold flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Low Balance Alert
               </h3>
               <p className="text-sm text-nexa-text-secondary mb-4">
                  Automatically top up your wallet when your balance falls below ₦5,000 to never miss a lead.
               </p>
               <NexaButton variant="secondary" className="w-full">Configure Auto-Topup</NexaButton>
            </NexaCard>
         </div>

         {/* RIGHT COL: TRANSACTION HISTORY */}
         <div className="lg:col-span-2">
            <NexaCard variant="flat" className="p-0 overflow-hidden h-full flex flex-col">
               <div className="p-6 border-b border-nexa-border bg-nexa-bg-surface/50 flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                     <History className="w-5 h-5 text-nexa-brand" />
                     Recent Transactions
                  </h3>
                  <NexaButton variant="ghost" size="sm">View All</NexaButton>
               </div>
               
               <div className="divide-y divide-nexa-border flex-1 overflow-y-auto max-h-[600px] no-scrollbar">
                  {transactions.map(tx => (
                     <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-nexa-bg-surface/30 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center",
                              tx.type === "topup" ? "bg-emerald-500/10 text-emerald-500" :
                              tx.type === "refund" ? "bg-blue-500/10 text-blue-500" :
                              "bg-amber-500/10 text-amber-500"
                           )}>
                              {tx.type === "topup" || tx.type === "refund" ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                           </div>
                           <div>
                              <p className="font-bold text-sm mb-1">{tx.description}</p>
                              <div className="flex items-center gap-2 text-[10px] text-nexa-text-faint font-extrabold uppercase tracking-wider">
                                 <span>{tx.date}</span>
                                 <span>•</span>
                                 <span>{tx.id}</span>
                              </div>
                           </div>
                        </div>
                        <div className={cn(
                           "text-right font-extrabold",
                           tx.type === "topup" || tx.type === "refund" ? "text-emerald-500" : "text-nexa-text-primary"
                        )}>
                           {tx.type === "topup" || tx.type === "refund" ? "+" : "-"}{tx.amount}
                        </div>
                     </div>
                  ))}
               </div>
            </NexaCard>
         </div>
      </div>
    </div>
  );
}
