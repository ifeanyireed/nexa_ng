"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Wallet, 
  Star, 
  Clock, 
  MapPin, 
  ChevronRight,
  Shield,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import Link from "next/link";

export default function TechDashboard() {
  const [isAvailable, setIsAvailable] = useState(true);

  const kpis = [
    { label: "Today's Jobs", value: "4", icon: <Briefcase className="w-5 h-5" />, color: "bg-blue-500" },
    { label: "Earnings Today", value: "₦12.5k", icon: <Wallet className="w-5 h-5" />, color: "bg-emerald-500" },
    { label: "Weekly Rating", value: "4.92", icon: <Star className="w-5 h-5" />, color: "bg-amber-500" },
  ];

  const jobs = [
    { id: "NXV-78291", type: "AC Repair", time: "09:00 AM", area: "Lekki Phase 1", customer: "Amara K.", status: "completed" },
    { id: "NXV-78292", type: "Generator Service", time: "11:30 AM", area: "Ikoyi", customer: "Chidi O.", status: "in-progress" },
    { id: "NXV-78293", type: "Electrical Wiring", time: "02:00 PM", area: "Victoria Island", customer: "Bola A.", status: "upcoming" },
    { id: "NXV-78294", type: "Solar Maintenance", time: "04:30 PM", area: "Lekki Phase 2", customer: "David E.", status: "upcoming" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* AVAILABILITY TOGGLE */}
      <section className="bg-nexa-bg-surface p-6 rounded-b-[40px] border-b border-nexa-border shadow-sm">
        <div className="flex items-center justify-between gap-4">
           <div>
              <p className="text-[10px] font-black text-nexa-text-faint uppercase tracking-widest mb-1">Current Status</p>
              <h3 className={cn("text-2xl font-black", isAvailable ? "text-nexa-accent" : "text-nexa-text-faint")}>
                {isAvailable ? "Online & Ready" : "Currently Offline"}
              </h3>
           </div>
           <button 
              onClick={() => setIsAvailable(!isAvailable)}
              className={cn(
                "relative w-32 h-14 rounded-full p-1 transition-all duration-500",
                isAvailable ? "bg-nexa-accent shadow-lg shadow-nexa-accent/20" : "bg-nexa-border"
              )}
           >
              <motion.div 
                animate={{ x: isAvailable ? 72 : 0 }}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md"
              >
                 <Zap className={cn("w-6 h-6", isAvailable ? "text-nexa-accent" : "text-nexa-text-faint")} />
              </motion.div>
           </button>
        </div>
      </section>

      {/* KPI CARDS */}
      <section className="px-4">
        <div className="grid grid-cols-3 gap-3">
           {kpis.map((kpi, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="liquid-glass p-4 rounded-2xl flex flex-col items-center text-center gap-2 border-nexa-accent/10"
             >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm", kpi.color)}>
                   {kpi.icon}
                </div>
                <div>
                   <p className="text-[8px] font-black text-nexa-text-faint uppercase tracking-wider mb-0.5">{kpi.label}</p>
                   <p className="text-sm font-black">{kpi.value}</p>
                </div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* ACTIVE JOB CALLOUT (If any) */}
      <section className="px-4">
         <div className="bg-nexa-accent p-6 rounded-[32px] text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-4">
                  <div className="px-2 py-0.5 bg-white/20 rounded-md text-[8px] font-black uppercase tracking-widest">Active Now</div>
                  <div className="flex-1 h-px bg-white/20" />
               </div>
               <div className="flex justify-between items-start mb-6">
                  <div>
                     <h4 className="text-2xl font-black mb-1">Generator Service</h4>
                     <p className="text-xs font-bold text-white/80">Chidi O. • Ikoyi, Lagos</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                     <Clock className="w-6 h-6" />
                  </div>
               </div>
               <Link href="/tech/jobs/NXV-78292">
                  <NexaButton size="lg" variant="secondary" className="w-full bg-white text-nexa-accent hover:bg-slate-100 h-14 font-black">
                     Resume Job Detail
                  </NexaButton>
               </Link>
            </div>
         </div>
      </section>

      {/* TODAY'S TIMELINE */}
      <section className="px-4 space-y-6">
         <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-display">Today's Schedule</h3>
            <span className="text-xs font-bold text-nexa-text-faint">Oct 12, 2026</span>
         </div>

         <div className="space-y-4 relative">
            <div className="absolute top-0 left-4 bottom-0 w-px bg-nexa-border" />
            
            {jobs.map((job, i) => (
              <Link key={job.id} href={`/tech/jobs/${job.id}`}>
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 group cursor-pointer"
                >
                   <div className={cn(
                      "w-8 h-8 rounded-full border-4 border-nexa-bg-base flex items-center justify-center relative z-10 transition-colors",
                      job.status === "completed" ? "bg-emerald-500" : 
                      job.status === "in-progress" ? "bg-nexa-accent animate-pulse" : "bg-nexa-border"
                   )}>
                      {job.status === "completed" && <CheckIcon className="w-3 h-3 text-white" />}
                   </div>
                   
                   <div className="flex-1 liquid-glass p-5 rounded-3xl group-hover:border-nexa-accent/30 transition-all">
                      <div className="flex justify-between items-start mb-2">
                         <div>
                            <p className="text-[10px] font-black text-nexa-accent uppercase tracking-widest mb-1">{job.id}</p>
                            <h4 className="font-extrabold">{job.type}</h4>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-black">{job.time}</p>
                            <p className="text-[10px] font-bold text-nexa-text-faint">{job.area}</p>
                         </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-nexa-border">
                         <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-nexa-bg-base flex items-center justify-center text-[10px] font-bold">{job.customer.charAt(0)}</div>
                            <span className="text-xs font-bold text-nexa-text-secondary">{job.customer}</span>
                         </div>
                         <ChevronRight className="w-4 h-4 text-nexa-text-faint group-hover:text-nexa-accent transition-colors" />
                      </div>
                   </div>
                </motion.div>
              </Link>
            ))}
         </div>
      </section>

      {/* ANNOUNCEMENTS / OPS ALERTS */}
      <section className="px-4">
         <NexaCard variant="glass" className="p-6 border-nexa-accent/20 bg-nexa-accent/5">
            <div className="flex items-center gap-3 mb-4">
               <Shield className="w-5 h-5 text-nexa-accent" />
               <h4 className="text-sm font-extrabold uppercase tracking-widest">Ops Update</h4>
            </div>
            <p className="text-xs text-nexa-text-secondary leading-relaxed font-medium">
               New safety protocols for in-home generator servicing are now active. Please review the documentation in your profile.
            </p>
         </NexaCard>
      </section>
    </div>
  );
}

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);
