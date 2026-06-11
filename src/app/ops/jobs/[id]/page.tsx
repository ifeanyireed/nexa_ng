"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  User, 
  ChevronLeft,
  ArrowRight,
  MoreVertical,
  History,
  FileText,
  MessageSquare,
  Zap,
  AlertCircle,
  RotateCcw,
  Ban,
  Flag,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function OpsJobDetail() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState("timeline");

  const timeline = [
    { time: "09:00 AM", event: "Booking Created", actor: "Customer", icon: <Clock /> },
    { time: "09:05 AM", event: "Payment Confirmed", actor: "System", icon: <DollarSign /> },
    { time: "09:12 AM", event: "Staff Assigned", actor: "Ops (Auto)", icon: <Zap /> },
    { time: "09:15 AM", event: "Job Accepted", actor: "Samuel O.", icon: <ShieldCheck /> },
    { time: "10:30 AM", event: "Check-in (GPS Verified)", actor: "Samuel O.", icon: <MapPin /> },
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex bg-[#020617] text-white">
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-white/5">
        <header className="p-8 border-b border-white/5 bg-[#0B1120]">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                 <Link href="/ops/assignments" className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                 </Link>
                 <div>
                    <h1 className="text-2xl font-black">{id}</h1>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">NexaVerified Premium</span>
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          <Clock className="w-3 h-3" /> SLA: 4m Assignment
                       </span>
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 text-xs font-black uppercase tracking-widest">
                    In Progress
                 </div>
              </div>
           </div>

           <div className="flex gap-8">
              {["timeline", "details", "ops-notes"].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "text-xs font-black uppercase tracking-[0.2em] pb-4 transition-all relative",
                    activeTab === tab ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {tab.replace("-", " ")}
                  {activeTab === tab && (
                    <motion.div layoutId="ops-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full" />
                  )}
                </button>
              ))}
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
           <AnimatePresence mode="wait">
              {activeTab === "timeline" && (
                <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-8">
                   {timeline.map((item, i) => (
                     <div key={i} className="flex gap-6 relative">
                        {i < timeline.length - 1 && <div className="absolute top-8 left-5 w-px h-12 bg-white/5" />}
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 shrink-0 relative z-10">
                           {React.cloneElement(item.icon as React.ReactElement, { className: "w-4 h-4" })}
                        </div>
                        <div className="flex-1 py-1">
                           <div className="flex justify-between items-start mb-1">
                              <h4 className="text-sm font-bold">{item.event}</h4>
                              <span className="text-[10px] font-bold text-slate-500">{item.time}</span>
                           </div>
                           <p className="text-xs text-slate-500">Action by <span className="text-slate-300 font-bold">{item.actor}</span></p>
                        </div>
                     </div>
                   ))}
                </motion.div>
              )}

              {activeTab === "details" && (
                <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-8">
                   <div className="space-y-8">
                      <section>
                         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Customer</h3>
                         <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                            <h4 className="text-lg font-black mb-1">Chidi O.</h4>
                            <p className="text-xs text-slate-500 mb-4">Plot 12, Alexander Road, Ikoyi</p>
                            <NexaButton size="sm" variant="secondary" className="h-8 text-[10px] border-white/10">View Masked Data</NexaButton>
                         </div>
                      </section>
                      <section>
                         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Technician</h3>
                         <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                            <h4 className="text-lg font-black mb-1">Samuel O.</h4>
                            <p className="text-xs text-slate-500 mb-4">Staff ID: NX-881920 • Electrical</p>
                            <div className="flex gap-2">
                               <NexaButton size="sm" variant="secondary" className="h-8 text-[10px] border-white/10">Message Tech</NexaButton>
                               <NexaButton size="sm" variant="secondary" className="h-8 text-[10px] border-white/10">Call Tech</NexaButton>
                            </div>
                         </div>
                      </section>
                   </div>
                   <div className="space-y-8">
                      <section>
                         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Financials</h3>
                         <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                            <div className="flex justify-between">
                               <span className="text-xs text-slate-500">Service Fee</span>
                               <span className="text-xs font-bold font-mono">₦20,000.00</span>
                            </div>
                            <div className="flex justify-between">
                               <span className="text-xs text-slate-500">Nexa Premium Fee</span>
                               <span className="text-xs font-bold font-mono">₦5,000.00</span>
                            </div>
                            <div className="h-px bg-white/5" />
                            <div className="flex justify-between">
                               <span className="text-xs font-black uppercase tracking-wider text-blue-400">Total GMV</span>
                               <span className="text-sm font-black font-mono">₦25,000.00</span>
                            </div>
                         </div>
                      </section>
                   </div>
                </motion.div>
              )}

              {activeTab === "ops-notes" && (
                <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full max-w-2xl">
                   <div className="flex-1 space-y-4 mb-8">
                      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                         <div className="flex justify-between mb-2">
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Ops Admin</span>
                            <span className="text-[9px] text-slate-500">10:45 AM</span>
                         </div>
                         <p className="text-xs font-medium leading-relaxed">Spoke to customer. They confirmed tech arrived on time but had a slight issue with tools. Samuel resolving now.</p>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <input className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-xs text-white outline-none focus:border-blue-500 transition-all" placeholder="Add an internal note..." />
                      <NexaButton size="sm" className="bg-blue-600 font-black h-10 px-6">Post</NexaButton>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>

      {/* ACTION SIDEBAR */}
      <aside className="w-80 bg-[#0B1120] p-8 space-y-8">
         <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-8">Job Actions</h3>
         
         <div className="space-y-3">
            <NexaButton size="lg" variant="secondary" className="w-full h-14 justify-start border-white/5 hover:bg-white/5" leftIcon={<RotateCcw className="w-5 h-5 text-blue-400" />}>
               Reassign Tech
            </NexaButton>
            <NexaButton size="lg" variant="secondary" className="w-full h-14 justify-start border-white/5 hover:bg-white/5" leftIcon={<Clock className="w-5 h-5 text-amber-500" />}>
               Pause Service
            </NexaButton>
            <NexaButton size="lg" variant="secondary" className="w-full h-14 justify-start border-white/5 hover:bg-red-500/10 text-red-500" leftIcon={<Ban className="w-5 h-5" />}>
               Cancel Job
            </NexaButton>
            <div className="h-px bg-white/5 my-6" />
            <NexaButton size="lg" variant="secondary" className="w-full h-14 justify-start border-white/5 hover:bg-white/5" leftIcon={<Flag className="w-5 h-5 text-purple-400" />}>
               Flag for Review
            </NexaButton>
            <NexaButton size="lg" variant="secondary" className="w-full h-14 justify-start border-white/5 hover:bg-white/5" leftIcon={<DollarSign className="w-5 h-5 text-emerald-400" />}>
               Initiate Refund
            </NexaButton>
         </div>

         <div className="mt-auto pt-12">
            <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
               <div className="flex items-center gap-2 mb-2 text-amber-500">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">SLA Alert</span>
               </div>
               <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                  Job check-in was 15m later than appointment window. Monitor for quality escalation.
               </p>
            </div>
         </div>
      </aside>
    </div>
  );
}
