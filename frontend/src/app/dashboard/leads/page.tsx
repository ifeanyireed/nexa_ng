"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  Phone, 
  MessageSquare, 
  MoreHorizontal,
  Clock,
  ArrowRight,
  TrendingUp,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { NexaInput } from "@/components/nexa/NexaInput";
import { AddLeadModal } from "@/components/nexa/AddLeadModal";

const COLUMNS = [
  { id: "new", title: "New Leads", color: "bg-blue-500", count: 3 },
  { id: "contacted", title: "Contacted", color: "bg-amber-500", count: 2 },
  { id: "negotiating", title: "Negotiating", color: "bg-purple-500", count: 1 },
  { id: "won", title: "Won / Booked", color: "bg-emerald-500", count: 5 },
  { id: "lost", title: "Lost", color: "bg-slate-500", count: 0 },
];

export default function LeadsCRMPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leads, setLeads] = useState([
    { id: "L-101", name: "Chidi Okafor", service: "Plumbing Installation", date: "2 hrs ago", column: "new", phone: "+234 803 111 2222", value: "₦45,000" },
    { id: "L-102", name: "Sarah Bolarinwa", service: "Bathroom Leak", date: "5 hrs ago", column: "new", phone: "+234 812 333 4444", value: "₦15,000" },
    { id: "L-103", name: "Tunde Bakare", service: "Water Heater Setup", date: "1 day ago", column: "new", phone: "+234 705 555 6666", value: "₦85,000" },
    { id: "L-104", name: "Grace Effiong", service: "Full House Repiping", date: "2 days ago", column: "contacted", phone: "+234 809 777 8888", value: "₦350,000" },
    { id: "L-105", name: "David Nwachukwu", service: "Kitchen Sink Repair", date: "3 days ago", column: "contacted", phone: "+234 802 999 0000", value: "₦20,000" },
    { id: "L-106", name: "Bola Ahmed", service: "Outdoor Tap Installation", date: "4 days ago", column: "negotiating", phone: "+234 818 111 3333", value: "₦12,000" },
  ]);

  const handleAddLead = (newLead: any) => {
    setLeads([newLead, ...leads]);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-extrabold text-display mb-2">Leads CRM</h1>
            <p className="text-nexa-text-secondary">Track and convert your prospective customers.</p>
         </div>
         <div className="flex items-center gap-3">
            <NexaInput 
              variant="search" 
              placeholder="Search leads..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64"
            />
            <NexaButton variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>Filter</NexaButton>
            <NexaButton leftIcon={<Users className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>Add Lead</NexaButton>
         </div>
      </header>

      {/* KPI SNAPSHOT */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: "Total Leads", value: "11", trend: "+2 this week" },
           { label: "Conversion Rate", value: "45%", trend: "+5% vs last mo" },
           { label: "Avg. Response Time", value: "15m", trend: "Top 10% in Niche" },
           { label: "Pipeline Value", value: "₦527,000", trend: "Estimated" },
         ].map((stat, i) => (
           <NexaCard key={i} variant="flat" className="p-4 border border-nexa-border bg-nexa-bg-surface/50">
              <p className="text-nexa-text-faint text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-xl font-extrabold mb-1">{stat.value}</h3>
              <p className="text-[10px] text-emerald-500 font-bold">{stat.trend}</p>
           </NexaCard>
         ))}
      </div>

      {/* KANBAN BOARD */}
      <div className="flex-1 overflow-x-auto pb-4 no-scrollbar">
         <div className="flex gap-6 min-w-max h-full">
            {COLUMNS.map(column => (
               <div key={column.id} className="w-80 flex flex-col h-full bg-nexa-bg-surface/30 rounded-3xl p-3 border border-nexa-border/50">
                  {/* COLUMN HEADER */}
                  <div className="flex items-center justify-between mb-4 px-2">
                     <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", column.color)} />
                        <h3 className="font-bold">{column.title}</h3>
                     </div>
                     <span className="bg-nexa-bg-base border border-nexa-border text-xs font-extrabold px-2 py-0.5 rounded-full">
                        {column.count}
                     </span>
                  </div>

                  {/* COLUMN ITEMS */}
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                     {leads.filter(l => l.column === column.id).map(lead => (
                        <NexaCard key={lead.id} variant="flat" padding="none" className="p-4 bg-nexa-bg-base border border-nexa-border shadow-sm cursor-grab active:cursor-grabbing hover:border-nexa-brand/50 transition-colors group">
                           <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                 <NexaAvatar fallback={lead.name.charAt(0)} size="sm" />
                                 <div>
                                    <h4 className="font-bold text-sm leading-tight">{lead.name}</h4>
                                    <span className="text-[10px] text-nexa-text-faint font-extrabold tracking-wider uppercase">{lead.id}</span>
                                 </div>
                              </div>
                              <button className="text-nexa-text-faint opacity-0 group-hover:opacity-100 transition-opacity">
                                 <MoreHorizontal className="w-4 h-4" />
                              </button>
                           </div>
                           
                           <div className="space-y-2 mb-4">
                              <div className="bg-nexa-bg-surface p-2 rounded-lg text-xs font-medium border border-nexa-border/50">
                                 {lead.service}
                              </div>
                              <div className="flex items-center justify-between text-[10px] font-bold text-nexa-text-secondary">
                                 <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lead.date}</span>
                                 <span className="text-emerald-500">{lead.value}</span>
                              </div>
                           </div>

                           <div className="flex items-center gap-2 pt-3 border-t border-nexa-border">
                              <NexaButton variant="secondary" size="sm" className="flex-1 h-8 text-[10px]" leftIcon={<MessageSquare className="w-3 h-3" />}>Chat</NexaButton>
                              <NexaButton variant="secondary" size="sm" className="flex-1 h-8 text-[10px]" leftIcon={<Phone className="w-3 h-3" />}>Call</NexaButton>
                           </div>
                        </NexaCard>
                     ))}
                     {leads.filter(l => l.column === column.id).length === 0 && (
                        <div className="h-24 border-2 border-dashed border-nexa-border rounded-2xl flex items-center justify-center text-nexa-text-faint text-xs font-bold">
                           No leads here
                        </div>
                     )}
                  </div>
               </div>
            ))}
         </div>
      </div>

      <AddLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddLead={handleAddLead} 
      />
    </div>
  );
}
