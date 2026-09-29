"use client";

import React, { useState, useEffect } from "react";
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
import { api } from "@/lib/api";

export default function LeadWalletPage() {
  const [wallet, setWallet] = useState<any>({
    balance: 185000,
    currency: "NGN",
    transactions: [
      { id: "tx-1", type: "credit", amount: 50000, description: "Card Topup (Paystack)", date: "2026-08-22", createdAt: "2026-08-22T10:00:00Z", status: "success" },
      { id: "tx-2", type: "debit", amount: 3500, description: "Lead Unlock: Enterprise Office Fitout", date: "2026-08-21", createdAt: "2026-08-21T14:30:00Z", status: "success" },
      { id: "tx-3", type: "debit", amount: 2000, description: "Lead Unlock: Solar Inverter Installation", date: "2026-08-20", createdAt: "2026-08-20T09:15:00Z", status: "success" },
      { id: "tx-4", type: "credit", amount: 100000, description: "Bank Transfer Topup (GTBank)", date: "2026-08-18", createdAt: "2026-08-18T16:45:00Z", status: "success" },
      { id: "tx-5", type: "debit", amount: 4500, description: "Lead Unlock: Commercial Cold Room Maintenance", date: "2026-08-17", createdAt: "2026-08-17T11:20:00Z", status: "success" }
    ]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const data = await api.get("/wallet");
        if (data && typeof data === "object") {
          setWallet(data);
        }
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const transactions = wallet?.transactions || [];

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
                  <h2 className="text-5xl font-extrabold mb-6">₦{(wallet?.balance || 0).toLocaleString()}</h2>
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
                  {transactions.map((tx: any) => (
                     <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-nexa-bg-surface/30 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center",
                              tx.type === "DEPOSIT" ? "bg-emerald-500/10 text-emerald-500" :
                              tx.type === "REFUND" ? "bg-blue-500/10 text-blue-500" :
                              "bg-amber-500/10 text-amber-500"
                           )}>
                              {tx.type === "DEPOSIT" || tx.type === "REFUND" ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                           </div>
                           <div>
                              <p className="font-bold text-sm mb-1">{tx.type} - {tx.status}</p>
                              <div className="flex items-center gap-2 text-[10px] text-nexa-text-faint font-extrabold uppercase tracking-wider">
                                 <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                                 <span>•</span>
                                 <span>#{tx.id.slice(-6).toUpperCase()}</span>
                              </div>
                           </div>
                        </div>
                        <div className={cn(
                           "text-right font-extrabold",
                           tx.type === "DEPOSIT" || tx.type === "REFUND" ? "text-emerald-500" : "text-nexa-text-primary"
                        )}>
                           {tx.type === "DEPOSIT" || tx.type === "REFUND" ? "+" : "-"}₦{tx.amount.toLocaleString()}
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
