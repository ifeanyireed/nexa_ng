"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  AlertCircle,
  Download,
  Filter,
  Calendar,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Activity,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
  LineChart, Line,
  ScatterChart, Scatter,
  PieChart, Pie
} from "recharts";

const revenueData = [
  { name: "Jan", revenue: 450000 }, { name: "Feb", revenue: 520000 },
  { name: "Mar", revenue: 480000 }, { name: "Apr", revenue: 610000 },
  { name: "May", revenue: 750000 }, { name: "Jun", revenue: 890000 },
];

const nicheData = [
  { name: "Electrical", count: 120 }, { name: "AC Repair", count: 98 },
  { name: "Plumbing", count: 86 }, { name: "Inverter", count: 74 },
  { name: "Cleaning", count: 52 },
];

export default function AdminPremiumAnalytics() {
  return (
    <div className="min-h-screen bg-nexa-bg-base p-8 space-y-8">
      {/* HEADER */}
      <header className="flex justify-between items-end mb-12">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                 <PieChartIcon className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-black">Premium Analytics</h1>
           </div>
           <p className="text-sm text-nexa-text-faint font-bold uppercase tracking-widest">NexaVerified Service Performance</p>
        </div>
        <div className="flex gap-3">
           <NexaButton size="sm" variant="secondary" className="h-10 border-nexa-border" leftIcon={<Filter className="w-4 h-4" />}>All Time</NexaButton>
           <NexaButton size="sm" className="bg-purple-600 hover:bg-purple-700 font-black h-10 px-6" leftIcon={<Download className="w-4 h-4" />}>Export CSV</NexaButton>
        </div>
      </header>

      {/* KPI GRID - ROW 1: REVENUE */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
         {[
           { label: "Total Premium Revenue", value: "₦14.2M", trend: "+24%", icon: <DollarSign />, color: "text-purple-600" },
           { label: "Avg Job Value", value: "₦18,500", trend: "+5%", icon: <TrendingUp />, color: "text-emerald-500" },
           { label: "Total GMV", value: "₦42.8M", trend: "+18%", icon: <Globe />, color: "text-blue-500" },
           { label: "Nexa Net Profit", value: "₦4.2M", trend: "+12%", icon: <ShieldCheck />, color: "text-purple-600" },
           { label: "MoM Growth", value: "18.4%", trend: "UP", icon: <Activity />, color: "text-emerald-500" },
         ].map((kpi, i) => (
           <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <NexaCard variant="glass" className="p-6 border-none bg-nexa-bg-surface/50 h-full">
                 <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-nexa-bg-base flex items-center justify-center text-nexa-text-faint">
                       {React.cloneElement(kpi.icon as React.ReactElement, { className: "w-4 h-4" })}
                    </div>
                    <span className="text-[9px] font-black text-nexa-text-faint uppercase tracking-widest">{kpi.label}</span>
                 </div>
                 <div className="flex items-baseline justify-between">
                    <p className="text-2xl font-black">{kpi.value}</p>
                    <span className={cn("text-[10px] font-black", kpi.trend.includes("+") ? "text-emerald-500" : "text-purple-500")}>{kpi.trend}</span>
                 </div>
              </NexaCard>
           </motion.div>
         ))}
      </section>

      {/* CHARTS ROW 1 */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2">
            <NexaCard variant="glass" className="p-8 border-nexa-border bg-nexa-bg-surface/30">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="font-black text-lg">Revenue Growth</h3>
                  <div className="flex gap-2">
                     {["Daily", "Weekly", "Monthly"].map(t => (
                       <button key={t} className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", t === "Monthly" ? "bg-purple-600 text-white" : "text-nexa-text-faint hover:text-nexa-text-primary")}>{t}</button>
                     ))}
                  </div>
               </div>
               <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={revenueData}>
                        <defs>
                           <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6D28D9" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#6D28D9" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--nexa-border)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "var(--nexa-text-faint)" }} />
                        <YAxis hide />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#6D28D9" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </NexaCard>
         </div>

         <div>
            <NexaCard variant="glass" className="p-8 border-nexa-border bg-nexa-bg-surface/30 h-full">
               <h3 className="font-black text-lg mb-8">Top Niches</h3>
               <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={nicheData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "var(--nexa-text-primary)" }} width={80} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                           {nicheData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={index === 0 ? "#6D28D9" : "#C084FC"} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </NexaCard>
         </div>
      </section>

      {/* KPI GRID - ROW 2: OPERATIONS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
         {[
           { label: "Jobs Completed", value: "1,240", sub: "98% rate", icon: <CheckCircle2Icon /> },
           { label: "Avg Assign Time", value: "4.2m", sub: "Goal: < 5m", icon: <ClockIcon /> },
           { label: "On-Time Rate", value: "96.4%", sub: "+2% MoM", icon: <MapPinIcon /> },
           { label: "SLA Breach Rate", value: "1.2%", sub: "Target: < 2%", icon: <AlertCircleIcon /> },
           { label: "Active Techs", value: "152", sub: "Online Now", icon: <UsersIcon /> },
         ].map((kpi, i) => (
           <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 + 0.3 }}>
              <NexaCard variant="glass" className="p-6 border-none bg-white/5 h-full">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">{kpi.label}</span>
                 <p className="text-2xl font-black mb-1">{kpi.value}</p>
                 <p className="text-[10px] font-bold text-nexa-text-faint">{kpi.sub}</p>
              </NexaCard>
           </motion.div>
         ))}
      </section>

      {/* BOTTOM ROW: DISPUTES & LEADERBOARD */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <NexaCard variant="glass" className="p-8 border-nexa-border bg-nexa-bg-surface/30">
            <div className="flex justify-between items-center mb-8">
               <h3 className="font-black text-lg">Technician Leaderboard</h3>
               <button className="text-xs font-black text-purple-600 flex items-center gap-2">View All <ArrowUpRight className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
               {[
                 { name: "Samuel O.", niche: "Electrical", rating: "4.98", jobs: 124 },
                 { name: "David E.", niche: "Generator", rating: "4.92", jobs: 98 },
                 { name: "Bola A.", niche: "Solar", rating: "4.88", jobs: 86 },
               ].map((tech, i) => (
                 <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-4">
                       <span className="text-sm font-black text-purple-600 w-4">#{i+1}</span>
                       <div>
                          <p className="text-sm font-bold">{tech.name}</p>
                          <p className="text-[10px] text-nexa-text-faint font-bold">{tech.niche}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black">{tech.rating}★</p>
                       <p className="text-[10px] text-nexa-text-faint font-bold">{tech.jobs} Jobs</p>
                    </div>
                 </div>
               ))}
            </div>
         </NexaCard>

         <NexaCard variant="glass" className="p-8 border-nexa-border bg-nexa-bg-surface/30">
            <h3 className="font-black text-lg mb-8">Dispute Resolution</h3>
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] font-black text-nexa-text-faint uppercase tracking-widest">Avg Resolution Time</span>
                     <p className="text-3xl font-black">18.2 <span className="text-xs font-bold text-nexa-text-faint">hrs</span></p>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] font-black text-nexa-text-faint uppercase tracking-widest">Customer CSAT</span>
                     <p className="text-3xl font-black text-emerald-500">4.8 <span className="text-xs font-bold text-nexa-text-faint">/ 5.0</span></p>
                  </div>
               </div>
               <div className="flex items-center justify-center p-4 bg-white/5 rounded-3xl border border-white/5">
                  <div className="text-center">
                     <p className="text-sm font-black text-purple-600">84%</p>
                     <p className="text-[9px] font-black text-nexa-text-faint uppercase tracking-widest mt-1">Resolved without Refund</p>
                  </div>
               </div>
            </div>
         </NexaCard>
      </section>
    </div>
  );
}

const CheckCircle2Icon = () => <CheckCircle2 className="w-4 h-4" />;
const ClockIcon = () => <Clock className="w-4 h-4" />;
const MapPinIcon = () => <MapPin className="w-4 h-4" />;
const AlertCircleIcon = () => <AlertCircle className="w-4 h-4" />;
const UsersIcon = () => <Users className="w-4 h-4" />;

import { CheckCircle2, Clock, MapPin } from "lucide-react";
