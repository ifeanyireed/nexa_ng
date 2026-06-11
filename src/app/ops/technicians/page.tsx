"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  Star, 
  ChevronRight, 
  MoreVertical,
  X,
  ShieldCheck,
  Ban,
  MessageSquare,
  FileText,
  TrendingUp,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";

export default function OpsTechDirectory() {
  const [selectedTech, setSelectedTech] = useState<any | null>(null);

  const techs = [
    { id: "NX-881920", name: "Samuel O.", niche: "Electrical", city: "Lagos", status: "Active", rating: "4.92", jobs: 124 },
    { id: "NX-881925", name: "David E.", niche: "Generator", city: "Abuja", status: "Active", rating: "4.85", jobs: 89 },
    { id: "NX-881930", name: "Blessing T.", niche: "Plumbing", city: "Lagos", status: "Pending", rating: "0.00", jobs: 0 },
    { id: "NX-881935", name: "Amara K.", niche: "Cleaning", city: "PH", status: "Suspended", rating: "4.20", jobs: 45 },
    { id: "NX-881940", name: "Chidi O.", niche: "Appliance", city: "Lagos", status: "Active", rating: "4.98", jobs: 210 },
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex bg-[#020617] text-white overflow-hidden relative">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="p-8 border-b border-white/5 bg-[#0B1120]">
           <div className="flex justify-between items-end mb-8">
              <div>
                 <h1 className="text-3xl font-black mb-2">Staff Directory</h1>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Managing 452 Verified Technicians</p>
              </div>
              <div className="flex gap-3">
                 <NexaButton size="sm" variant="secondary" className="h-10 border-white/10" leftIcon={<Filter className="w-4 h-4" />}>Filter</NexaButton>
                 <NexaButton size="sm" className="bg-blue-600 font-black h-10 px-6">Add New Tech</NexaButton>
              </div>
           </div>

           <div className="flex items-center bg-white/5 px-4 py-3 rounded-xl border border-white/10 gap-3 w-full max-w-xl">
              <Search className="w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Search by name, staff ID, or niche..." className="bg-transparent text-sm text-white outline-none w-full" />
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
           <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                 <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-6 pb-2">Name & ID</th>
                    <th className="px-6 pb-2">Niche</th>
                    <th className="px-6 pb-2">City</th>
                    <th className="px-6 pb-2">Rating</th>
                    <th className="px-6 pb-2">Jobs</th>
                    <th className="px-6 pb-2">Status</th>
                    <th className="px-6 pb-2">Actions</th>
                 </tr>
              </thead>
              <tbody>
                 {techs.map((tech) => (
                   <tr 
                      key={tech.id}
                      onClick={() => setSelectedTech(tech)}
                      className="group cursor-pointer hover:bg-white/5 transition-all"
                   >
                      <td className="px-6 py-4 bg-white/5 rounded-l-2xl border-y border-l border-white/5 first:border-l">
                         <div className="flex items-center gap-3">
                            <NexaAvatar size="sm" name={tech.name} />
                            <div>
                               <p className="text-sm font-bold">{tech.name}</p>
                               <p className="text-[10px] text-slate-500 font-bold">{tech.id}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4 bg-white/5 border-y border-white/5 text-xs font-bold text-slate-400">{tech.niche}</td>
                      <td className="px-6 py-4 bg-white/5 border-y border-white/5 text-xs font-bold text-slate-400">{tech.city}</td>
                      <td className="px-6 py-4 bg-white/5 border-y border-white/5">
                         <div className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span className="text-xs font-black">{tech.rating}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 bg-white/5 border-y border-white/5 text-xs font-black">{tech.jobs}</td>
                      <td className="px-6 py-4 bg-white/5 border-y border-white/5">
                         <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                            tech.status === "Active" ? "bg-emerald-500/10 text-emerald-500" :
                            tech.status === "Pending" ? "bg-blue-500/10 text-blue-400" :
                            "bg-red-500/10 text-red-500"
                         )}>
                            {tech.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 bg-white/5 border-y border-r border-white/5 rounded-r-2xl text-right">
                         <button className="p-2 hover:bg-white/10 rounded-lg text-slate-500 group-hover:text-white transition-colors">
                            <MoreVertical className="w-4 h-4" />
                         </button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

      {/* TECH PROFILE DRAWER */}
      <AnimatePresence>
         {selectedTech && (
           <>
              <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }}
                 onClick={() => setSelectedTech(null)}
                 className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
              />
              <motion.div 
                 initial={{ x: "100%" }} 
                 animate={{ x: 0 }} 
                 exit={{ x: "100%" }}
                 transition={{ type: "spring", damping: 25, stiffness: 200 }}
                 className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0B1120] border-l border-white/10 shadow-2xl z-[70] flex flex-col"
              >
                 <header className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-black">Staff Profile</h2>
                    <button onClick={() => setSelectedTech(null)} className="p-2 hover:bg-white/5 rounded-xl">
                       <X className="w-6 h-6 text-slate-500" />
                    </button>
                 </header>

                 <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="flex items-center gap-6">
                       <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-black text-blue-400">
                          {selectedTech.name.charAt(0)}
                       </div>
                       <div>
                          <h3 className="text-2xl font-black">{selectedTech.name}</h3>
                          <p className="text-sm font-bold text-slate-500">{selectedTech.id} • {selectedTech.status}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Completion Rate</p>
                          <p className="text-xl font-black">98.4%</p>
                       </div>
                       <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Rating</p>
                          <p className="text-xl font-black text-amber-500">{selectedTech.rating}★</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Compliance Documents</h4>
                       <div className="space-y-2">
                          {["Government ID", "Trade License", "Address Proof"].map((doc) => (
                             <div key={doc} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                <span className="text-xs font-bold">{doc}</span>
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Service Map</h4>
                       <div className="h-40 rounded-2xl bg-slate-900 border border-white/5 relative overflow-hidden flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-blue-500 opacity-20" />
                       </div>
                    </div>
                 </div>

                 <footer className="p-8 border-t border-white/5 space-y-3">
                    <NexaButton size="lg" className="w-full bg-blue-600 font-black" leftIcon={<MessageSquare className="w-5 h-5" />}>Send Message</NexaButton>
                    <NexaButton size="lg" variant="secondary" className="w-full border-white/10 text-red-500 hover:bg-red-500/5" leftIcon={<Ban className="w-5 h-5" />}>Suspend Account</NexaButton>
                 </footer>
              </motion.div>
           </>
         )}
      </AnimatePresence>
    </div>
  );
}
