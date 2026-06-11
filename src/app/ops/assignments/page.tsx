"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Users, 
  Zap, 
  AlertCircle,
  Filter,
  ArrowRight,
  MoreVertical,
  Navigation
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function OpsAssignments() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const kpis = [
    { label: "Unassigned", value: "14", alert: true },
    { label: "Active Jobs", value: "32", alert: false },
    { label: "SLA at Risk", value: "3", alert: true, pulse: true },
    { label: "Available Techs", value: "18", alert: false },
    { label: "Avg Assignment", value: "4m", alert: false },
  ];

  const unassignedJobs = [
    { id: "NXV-89102", service: "AC Installation", area: "Lekki", time: "10:30 AM", sla: "12m" },
    { id: "NXV-89105", service: "Inverter Repair", area: "Ikeja", time: "11:00 AM", sla: "28m" },
    { id: "NXV-89108", service: "Plumbing Emergency", area: "VI", time: "09:45 AM", sla: "2m", priority: true },
    { id: "NXV-89110", service: "Solar Panel Fix", area: "Ajah", time: "12:30 PM", sla: "45m" },
  ];

  const suggestedTechs = [
    { name: "Samuel O.", distance: "1.2km", rating: "4.9", status: "available" },
    { name: "David E.", distance: "3.5km", rating: "4.8", status: "en-route" },
    { name: "Blessing T.", distance: "4.1km", rating: "4.7", status: "available" },
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#020617] text-white overflow-hidden">
      {/* KPI BAR */}
      <section className="h-16 border-b border-white/5 flex items-center px-6 gap-8 bg-[#0B1120]">
        {kpis.map((kpi, i) => (
          <div key={i} className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</span>
            <div className="flex items-center gap-2">
               <span className={cn("text-lg font-black", kpi.alert ? "text-red-500" : "text-white")}>{kpi.value}</span>
               {kpi.pulse && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
            </div>
          </div>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-3">
           <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400"><Filter className="w-4 h-4" /></button>
           <div className="h-6 w-px bg-white/10" />
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Auto-Refresh: 60s</p>
        </div>
      </section>

      <div className="flex-1 flex min-h-0">
        {/* LEFT PANEL: QUEUE */}
        <aside className="w-80 border-r border-white/5 flex flex-col bg-[#0B1120]/50">
           <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Incoming Queue</h3>
              <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded">Real-time</span>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {unassignedJobs.map((job) => (
                <button 
                  key={job.id}
                  onClick={() => setSelectedJob(job.id)}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all text-left group",
                    selectedJob === job.id ? "bg-blue-500/10 border-blue-500/30" : "bg-white/5 border-white/5 hover:border-white/20"
                  )}
                >
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{job.id}</span>
                      <div className={cn(
                        "flex items-center gap-1 text-[9px] font-black uppercase tracking-widest",
                        job.priority ? "text-red-500" : "text-slate-400"
                      )}>
                         <Clock className="w-3 h-3" /> {job.sla}
                      </div>
                   </div>
                   <h4 className="font-bold text-sm mb-1">{job.service}</h4>
                   <p className="text-[10px] font-bold text-slate-500">{job.area} • Appointment: {job.time}</p>
                </button>
              ))}
           </div>
        </aside>

        {/* CENTER PANEL: MAP MOCK */}
        <main className="flex-1 relative bg-slate-900 overflow-hidden">
           {/* Grid Pattern Background */}
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
           
           {/* Mock Tech Pins */}
           {[
             { x: "20%", y: "30%", status: "available" },
             { x: "60%", y: "20%", status: "en-route" },
             { x: "40%", y: "70%", status: "available" },
             { x: "75%", y: "65%", status: "in-progress" },
           ].map((tech, i) => (
             <div key={i} className="absolute" style={{ top: tech.y, left: tech.x }}>
                <div className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center bg-slate-800 shadow-2xl transition-transform hover:scale-125 cursor-pointer",
                  tech.status === "available" ? "border-emerald-500" : tech.status === "en-route" ? "border-amber-500" : "border-blue-500"
                )}>
                   <Navigation className={cn("w-5 h-5", tech.status === "available" ? "text-emerald-500" : tech.status === "en-route" ? "text-amber-500" : "text-blue-500")} />
                </div>
             </div>
           ))}

           {/* Map Controls */}
           <div className="absolute bottom-6 left-6 flex flex-col gap-2">
              <button className="w-10 h-10 bg-[#0B1120] border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors">+</button>
              <button className="w-10 h-10 bg-[#0B1120] border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors">-</button>
           </div>
        </main>

        {/* RIGHT PANEL: CONTEXTUAL DETAIL */}
        <aside className="w-80 border-l border-white/5 bg-[#0B1120] flex flex-col">
           {selectedJob ? (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col h-full">
                <div className="p-6 border-b border-white/5">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-6">Job Dispatch</h3>
                   <div className="space-y-4 mb-8">
                      <div>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Service Type</p>
                         <h4 className="text-xl font-black">AC Installation</h4>
                      </div>
                      <div className="flex gap-4">
                         <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Time</p>
                            <p className="text-sm font-bold">10:30 AM</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Value</p>
                            <p className="text-sm font-bold text-emerald-500">₦25,000</p>
                         </div>
                      </div>
                   </div>
                   <NexaButton size="sm" className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-black" leftIcon={<Zap className="w-4 h-4" />}>
                      Auto-Assign Nearest
                   </NexaButton>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                   <h5 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Recommended Staff</h5>
                   <div className="space-y-3">
                      {suggestedTechs.map((tech, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-white/20 transition-all">
                           <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-[10px]">SO</div>
                                 <div>
                                    <p className="text-xs font-bold">{tech.name}</p>
                                    <p className="text-[9px] font-medium text-slate-500">{tech.distance} • {tech.rating}★</p>
                                 </div>
                              </div>
                              <div className={cn("w-1.5 h-1.5 rounded-full", tech.status === "available" ? "bg-emerald-500" : "bg-amber-500")} />
                           </div>
                           <NexaButton size="sm" variant="secondary" className="w-full h-8 text-[10px] border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              Assign Staff
                           </NexaButton>
                        </div>
                      ))}
                   </div>
                </div>
             </motion.div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm font-bold">Select a job from the queue to start assignment</p>
             </div>
           )}
        </aside>
      </div>
    </div>
  );
}
