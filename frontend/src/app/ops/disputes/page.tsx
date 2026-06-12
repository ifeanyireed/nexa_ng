"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  MessageSquare, 
  X,
  ShieldCheck,
  AlertTriangle,
  History,
  Camera,
  DollarSign,
  Ban,
  RotateCcw,
  Flag,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function OpsDisputes() {
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const columns = [
    { id: "new", label: "New Disputes" },
    { id: "review", label: "In Review" },
    { id: "pending", label: "Pending Response" },
    { id: "resolved", label: "Resolved" },
  ];

  const tickets = [
    { id: "TKT-782910", type: "Property Damage", ref: "NXV-89102", severity: "P1", status: "new", customer: "John D.", tech: "Samuel O." },
    { id: "TKT-782915", type: "Poor Quality", ref: "NXV-89105", severity: "P2", status: "review", customer: "Amara K.", tech: "David E." },
    { id: "TKT-782920", type: "Overcharged", ref: "NXV-89108", severity: "P3", status: "review", customer: "Bola A.", tech: "Samuel O." },
    { id: "TKT-782925", type: "Safety Concern", ref: "NXV-89110", severity: "P1", status: "pending", customer: "David E.", tech: "Blessing T." },
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#020617] text-white overflow-hidden">
      <header className="p-8 border-b border-white/5 bg-[#0B1120]">
         <div className="flex justify-between items-end mb-8">
            <div>
               <h1 className="text-3xl font-black mb-2">Dispute Manager</h1>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Triage and Resolution Center</p>
            </div>
            <div className="flex gap-3">
               <NexaButton size="sm" variant="secondary" className="h-10 border-white/10" leftIcon={<Filter className="w-4 h-4" />}>Filter Queue</NexaButton>
            </div>
         </div>
      </header>

      <div className="flex-1 overflow-x-auto p-8">
         <div className="flex gap-6 h-full min-w-[1200px]">
            {columns.map((col) => (
              <div key={col.id} className="flex-1 flex flex-col min-w-[300px]">
                 <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{col.label}</h3>
                    <span className="text-[10px] font-black text-slate-600 bg-white/5 px-2 py-0.5 rounded">
                       {tickets.filter(t => t.status === col.id).length}
                    </span>
                 </div>
                 
                 <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar pb-8">
                    {tickets.filter(t => t.status === col.id).map((ticket) => (
                      <motion.button
                        layoutId={ticket.id}
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={cn(
                          "w-full p-6 rounded-[32px] bg-white/5 border text-left group hover:border-white/20 transition-all",
                          ticket.severity === "P1" ? "border-red-500/30" : "border-white/5"
                        )}
                      >
                         <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{ticket.id}</span>
                            <span className={cn(
                               "text-[8px] font-black px-1.5 py-0.5 rounded",
                               ticket.severity === "P1" ? "bg-red-500 text-white" :
                               ticket.severity === "P2" ? "bg-amber-500 text-white" :
                               "bg-slate-500 text-white"
                            )}>
                               {ticket.severity}
                            </span>
                         </div>
                         <h4 className="font-bold text-sm mb-1">{ticket.type}</h4>
                         <p className="text-[10px] text-slate-400 font-medium mb-6">Booking: {ticket.ref}</p>
                         
                         <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex -space-x-2">
                               <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-[#0B1120] flex items-center justify-center text-[8px] font-black">C</div>
                               <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0B1120] flex items-center justify-center text-[8px] font-black">T</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                         </div>
                      </motion.button>
                    ))}
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* DISPUTE DETAIL PANEL */}
      <AnimatePresence>
         {selectedTicket && (
           <>
              <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }}
                 onClick={() => setSelectedTicket(null)}
                 className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
              />
              <motion.div 
                 initial={{ x: "100%" }} 
                 animate={{ x: 0 }} 
                 exit={{ x: "100%" }}
                 transition={{ type: "spring", damping: 25, stiffness: 200 }}
                 className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-[#0B1120] border-l border-white/10 shadow-2xl z-[70] flex flex-col"
              >
                 <header className="p-8 border-b border-white/5 flex items-center justify-between bg-[#020617]/50">
                    <div>
                       <h2 className="text-xl font-black">Dispute Resolution</h2>
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Ticket {selectedTicket.id}</p>
                    </div>
                    <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-white/5 rounded-xl">
                       <X className="w-6 h-6 text-slate-500" />
                    </button>
                 </header>

                 <div className="flex-1 overflow-y-auto p-8 space-y-12">
                    <section className="grid grid-cols-2 gap-8">
                       <div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Complaint</h4>
                          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                             <p className="text-sm font-medium leading-relaxed italic">"The technician accidentally spilled oil on my premium rug while servicing the generator. I want a professional cleaning refund."</p>
                             <div className="flex gap-2">
                                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center"><Camera className="w-5 h-5 opacity-20" /></div>
                             </div>
                          </div>
                       </div>
                       <div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Tech Summary</h4>
                          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                             <p className="text-xs text-slate-400">Samuel O. (NX-881920)</p>
                             <p className="text-sm font-medium leading-relaxed text-slate-300">"Completed job. Customer seemed happy at sign-off. Did not notice any spills."</p>
                          </div>
                       </div>
                    </section>

                    <section>
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Resolution Actions</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <button className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-left hover:bg-emerald-500/20 transition-all group">
                             <DollarSign className="w-6 h-6 text-emerald-500 mb-3" />
                             <h5 className="font-black text-sm mb-1">Issue Full Refund</h5>
                             <p className="text-[10px] text-slate-500 font-bold leading-tight">Escrow released to customer. Tech not paid.</p>
                          </button>
                          <button className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-left hover:bg-amber-500/20 transition-all group">
                             <RotateCcw className="w-6 h-6 text-amber-500 mb-3" />
                             <h5 className="font-black text-sm mb-1">Schedule Re-service</h5>
                             <p className="text-[10px] text-slate-500 font-bold leading-tight">Dispatch new tech at no extra cost.</p>
                          </button>
                          <button className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-left hover:bg-red-500/20 transition-all group">
                             <Ban className="w-6 h-6 text-red-500 mb-3" />
                             <h5 className="font-black text-sm mb-1">Apply Tech Penalty</h5>
                             <p className="text-[10px] text-slate-500 font-bold leading-tight">Deduct from tech's lifetime earnings.</p>
                          </button>
                          <button className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-left hover:bg-blue-500/20 transition-all group">
                             <Flag className="w-6 h-6 text-blue-500 mb-3" />
                             <h5 className="font-black text-sm mb-1">Escalate to Manager</h5>
                             <p className="text-[10px] text-slate-500 font-bold leading-tight">Flags to Senior Ops for arbitration.</p>
                          </button>
                       </div>
                    </section>

                    <section className="space-y-6">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Communication Thread</h4>
                       <div className="space-y-4">
                          <div className="flex gap-4">
                             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-black shrink-0">OPS</div>
                             <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex-1">
                                <p className="text-xs font-medium">Hello John, we've received your complaint regarding the spill. We are reviewing the technician's photos now.</p>
                                <span className="text-[8px] text-slate-500 mt-2 block font-bold">11:30 AM</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex gap-3">
                          <input className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-xs text-white outline-none focus:border-blue-500 transition-all h-12" placeholder="Send message to customer..." />
                          <NexaButton size="sm" className="bg-blue-600 font-black h-12 px-6">Send</NexaButton>
                       </div>
                    </section>
                 </div>
              </motion.div>
           </>
         )}
      </AnimatePresence>
    </div>
  );
}
