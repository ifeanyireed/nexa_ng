"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MousePointer2, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  Globe,
  MapPin,
  Filter,
  Download,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function AnalyticsPage() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const kpis = [
    { label: "Total Views", value: "8,432", change: "+12.5%", trend: "up", icon: <Users className="w-5 h-5 text-blue-500" /> },
    { label: "Click-Through", value: "4.2%", change: "+0.8%", trend: "up", icon: <MousePointer2 className="w-5 h-5 text-emerald-500" /> },
    { label: "New Leads", value: "124", change: "-2.1%", trend: "down", icon: <TrendingUp className="w-5 h-5 text-amber-500" /> },
    { label: "Conversion", value: "18%", change: "+4.2%", trend: "up", icon: <BarChart3 className="w-5 h-5 text-fuchsia-500" /> },
  ];

  const chartData = [40, 70, 45, 90, 65, 80, 55, 30, 95, 60, 75, 50];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-display">Business Analytics</h1>
          <p className="text-nexa-text-secondary text-sm mt-1">Deep insights into your profile performance and customer behavior.</p>
        </div>
        <div className="flex items-center gap-3">
          <NexaButton variant="secondary" leftIcon={<Calendar className="w-4 h-4" />}>Last 30 Days</NexaButton>
          <NexaButton variant="secondary" leftIcon={<Download className="w-4 h-4" />}>Export PDF</NexaButton>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <NexaCard key={i} variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-nexa-bg-base flex items-center justify-center">
                {kpi.icon}
              </div>
              <div className={cn(
                "flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full",
                kpi.trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
              )}>
                {kpi.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </div>
            </div>
            <p className="text-nexa-text-faint text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
            <h3 className="text-2xl font-extrabold">{kpi.value}</h3>
          </NexaCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MAIN CHART PLACEHOLDER */}
        <NexaCard className="lg:col-span-2 p-8 h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
             <h3 className="font-extrabold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-nexa-brand" />
                Traffic Overview
             </h3>
             <div className="flex gap-2">
                {["Views", "Leads"].map(l => (
                   <div key={l} className="flex items-center gap-2 px-3 py-1 bg-nexa-bg-base rounded-full border border-nexa-border">
                      <div className={cn("w-2 h-2 rounded-full", l === "Views" ? "bg-nexa-brand" : "bg-emerald-500")} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{l}</span>
                   </div>
                ))}
             </div>
          </div>
          <div className="flex-1 w-full bg-nexa-bg-base/30 rounded-3xl border border-dashed border-nexa-border flex items-end justify-between px-8 pb-4 relative overflow-hidden">
             {chartData.map((h, i) => (
                <div 
                   key={i} 
                   className="flex-1 flex flex-col items-center group relative h-full justify-end"
                   onMouseEnter={() => setHoveredBar(i)}
                   onMouseLeave={() => setHoveredBar(null)}
                >
                   <AnimatePresence>
                      {hoveredBar === i && (
                         <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            className="absolute bottom-[calc(h+20%)] mb-2 px-3 py-1.5 bg-nexa-text-primary text-white text-[10px] font-bold rounded-lg shadow-xl z-20 whitespace-nowrap"
                            style={{ bottom: `${h + 5}%` }}
                         >
                            {h * 12} Views
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-nexa-text-primary rotate-45" />
                         </motion.div>
                      )}
                   </AnimatePresence>
                   <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: `${h}%` }}
                     transition={{ delay: i * 0.05, duration: 1, type: "spring", stiffness: 100 }}
                     className={cn(
                        "w-4 md:w-8 rounded-t-xl transition-all relative",
                        hoveredBar === i ? "bg-nexa-brand shadow-lg shadow-nexa-brand/20" : "bg-nexa-brand/20"
                     )}
                   />
                </div>
             ))}
          </div>
        </NexaCard>

        {/* SIDE DATA: SEARCH KEYWORDS */}
        <NexaCard className="p-8">
           <h3 className="font-extrabold text-lg mb-8 flex items-center gap-2">
              <Search className="w-5 h-5 text-nexa-brand" />
              Search Keywords
           </h3>
           <div className="space-y-6">
              {[
                { term: "emergency plumber lekki", count: "420", growth: "+15%" },
                { term: "leaking pipe repair", count: "312", growth: "+8%" },
                { term: "clogged drain fix", count: "185", growth: "+24%" },
                { term: "plumbing maintenance", count: "142", growth: "-3%" },
                { term: "best handyman lagos", count: "98", growth: "+12%" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                   <div className="space-y-0.5">
                      <p className="text-sm font-bold">{item.term}</p>
                      <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-wider">{item.count} searches</p>
                   </div>
                   <span className={cn(
                     "text-[10px] font-extrabold",
                     item.growth.startsWith('+') ? "text-emerald-500" : "text-red-500"
                   )}>{item.growth}</span>
                </div>
              ))}
           </div>
           <NexaButton variant="ghost" className="w-full mt-10 text-[10px] font-extrabold uppercase tracking-widest">View All 42 Keywords</NexaButton>
        </NexaCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* TOP LOCATIONS */}
         <NexaCard className="p-8">
            <h3 className="font-extrabold text-lg mb-8 flex items-center gap-2">
               <MapPin className="w-5 h-5 text-nexa-brand" />
               Customer Locations
            </h3>
            <div className="space-y-6">
               {[
                 { area: "Lekki Phase 1", share: 45 },
                 { area: "Victoria Island", share: 25 },
                 { area: "Ikoyi", share: 15 },
                 { area: "Ajah / Sangotedo", share: 10 },
                 { area: "Surulere", share: 5 },
               ].map((area, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                       <span>{area.area}</span>
                       <span className="text-nexa-text-faint">{area.share}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-nexa-bg-base rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${area.share}%` }}
                         className="h-full bg-nexa-brand"
                       />
                    </div>
                 </div>
               ))}
            </div>
         </NexaCard>

         {/* DEVICE BREAKDOWN */}
         <NexaCard className="p-8">
            <h3 className="font-extrabold text-lg mb-8 flex items-center gap-2">
               <Globe className="w-5 h-5 text-nexa-brand" />
               Lead Source
            </h3>
            <div className="flex items-center justify-center h-48 relative">
               {/* DONUT CHART MOCKUP */}
               <div className="w-32 h-32 rounded-full border-[12px] border-nexa-brand relative flex items-center justify-center">
                  <div className="absolute -inset-[12px] rounded-full border-[12px] border-emerald-500 border-t-transparent border-l-transparent -rotate-45" />
                  <div className="text-center">
                     <p className="text-xl font-extrabold leading-none">82%</p>
                     <p className="text-[8px] text-nexa-text-faint font-bold uppercase">Mobile</p>
                  </div>
               </div>
               <div className="ml-12 space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full bg-nexa-brand" />
                     <span className="text-xs font-bold text-nexa-text-secondary">Direct Hub Browse</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full bg-emerald-500" />
                     <span className="text-xs font-bold text-nexa-text-secondary">Google Search</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full bg-amber-500" />
                     <span className="text-xs font-bold text-nexa-text-secondary">WhatsApp Share</span>
                  </div>
               </div>
            </div>
         </NexaCard>
      </div>
    </div>
  );
}
