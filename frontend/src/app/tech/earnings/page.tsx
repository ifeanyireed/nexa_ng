"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  ArrowUpRight,
  Info,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

const data = [
  { name: "W1", amount: 45000 },
  { name: "W2", amount: 52000 },
  { name: "W3", amount: 38000 },
  { name: "W4", amount: 61000 },
  { name: "W5", amount: 48000 },
  { name: "W6", amount: 55000 },
  { name: "W7", amount: 67000 },
  { name: "W8", amount: 59000 },
];

export default function TechEarnings() {
  const stats = [
    { label: "This Week", value: "₦59,000", sub: "+12% vs last week", color: "text-nexa-accent" },
    { label: "Pending", value: "₦12,500", sub: "3 jobs awaiting confirm", color: "text-amber-500" },
    { label: "Lifetime", value: "₦1.2M", sub: "Since April 2026", color: "text-nexa-brand" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER SECTION */}
      <section className="bg-nexa-bg-surface p-8 rounded-b-[40px] border-b border-nexa-border shadow-sm">
        <div className="flex justify-between items-start mb-8">
           <div>
              <p className="text-[10px] font-black text-nexa-text-faint uppercase tracking-widest mb-1">Total Balance</p>
              <h1 className="text-4xl font-black text-display">₦71,500</h1>
           </div>
           <div className="w-12 h-12 bg-nexa-accent/10 rounded-2xl flex items-center justify-center text-nexa-accent">
              <Wallet className="w-6 h-6" />
           </div>
        </div>
        
        <div className="flex flex-col gap-4">
           <NexaButton size="lg" className="w-full bg-nexa-accent hover:bg-nexa-accent/90 h-16 rounded-[24px] text-lg font-black shadow-xl shadow-nexa-accent/20">
              Request Early Payout
           </NexaButton>
           <p className="text-[10px] text-center text-nexa-text-faint font-bold uppercase tracking-widest">Next Scheduled Payout: Friday, Oct 16</p>
        </div>
      </section>

      {/* STATS GRID */}
      <section className="px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {stats.map((stat, i) => (
             <NexaCard key={i} variant="glass" className="p-6 border-none bg-nexa-bg-surface/50">
                <p className="text-[10px] font-black text-nexa-text-faint uppercase tracking-widest mb-2">{stat.label}</p>
                <p className={cn("text-2xl font-black mb-1", stat.color)}>{stat.value}</p>
                <p className="text-[10px] font-bold text-nexa-text-secondary">{stat.sub}</p>
             </NexaCard>
           ))}
        </div>
      </section>

      {/* CHART SECTION */}
      <section className="px-4">
         <div className="liquid-glass p-8 rounded-[40px] border-nexa-accent/10">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-black text-lg">Earnings Trend</h3>
               <div className="flex items-center gap-2 text-[10px] font-black text-nexa-accent uppercase tracking-widest">
                  <TrendingUp className="w-4 h-4" /> Last 8 Weeks
               </div>
            </div>
            
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--nexa-border)" />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: "var(--nexa-text-faint)" }} 
                        dy={10}
                     />
                     <Tooltip 
                        cursor={{ fill: 'var(--nexa-accent)', opacity: 0.05 }}
                        content={({ active, payload }) => {
                           if (active && payload && payload.length) {
                              return (
                                 <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-nexa-border shadow-xl">
                                    <p className="text-xs font-black text-nexa-accent">₦{payload[0].value?.toLocaleString()}</p>
                                 </div>
                              );
                           }
                           return null;
                        }}
                     />
                     <Bar dataKey="amount" radius={[6, 6, 6, 6]}>
                        {data.map((entry, index) => (
                          <Cell 
                             key={`cell-${index}`} 
                             fill={index === data.length - 1 ? "var(--nexa-accent)" : "var(--nexa-accent-light)"} 
                             fillOpacity={index === data.length - 1 ? 1 : 0.3}
                          />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </section>

      {/* PAYOUT HISTORY */}
      <section className="px-4 space-y-6">
         <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-display">Payout History</h3>
            <button className="text-xs font-bold text-nexa-brand flex items-center gap-1">
               View All <ChevronRight className="w-4 h-4" />
            </button>
         </div>

         <div className="space-y-3">
            {[
               { date: "Oct 09, 2026", amount: "₦42,800", status: "Paid", ref: "TXN-99120" },
               { date: "Oct 02, 2026", amount: "₦55,200", status: "Paid", ref: "TXN-99118" },
               { date: "Sep 25, 2026", amount: "₦38,150", status: "Paid", ref: "TXN-99115" },
            ].map((payout, i) => (
               <div key={i} className="liquid-glass p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-nexa-accent/30 transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <CheckCircle2 className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-xs font-black">{payout.amount}</p>
                        <p className="text-[10px] font-bold text-nexa-text-faint">{payout.date} • {payout.ref}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{payout.status}</span>
                     <ArrowUpRight className="w-4 h-4 text-nexa-text-faint group-hover:text-nexa-accent transition-colors" />
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* INFO CALLOUT */}
      <section className="px-4">
         <div className="p-6 rounded-3xl bg-nexa-bg-surface border border-nexa-border flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-nexa-bg-base flex items-center justify-center text-nexa-text-faint shrink-0">
               <Info className="w-5 h-5" />
            </div>
            <div>
               <h4 className="text-xs font-black uppercase tracking-widest mb-1">Pay Structure</h4>
               <p className="text-[10px] text-nexa-text-secondary leading-relaxed font-medium">
                  NexaVerified staff earn 70% of the job fee. Bonuses are applied for 5-star ratings and same-day emergency callouts.
               </p>
            </div>
         </div>
      </section>
    </div>
  );
}
