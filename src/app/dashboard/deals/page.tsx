"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Tag, 
  Plus, 
  Clock, 
  Eye, 
  MousePointerClick,
  MoreVertical,
  CheckCircle2,
  Calendar,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { CreateDealModal } from "@/components/nexa/CreateDealModal";

export default function DealsPromotionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDeals, setActiveDeals] = useState([
    {
      id: "D-101",
      title: "20% off Full House Painting",
      service: "Painting",
      discount: "20%",
      expires: "2 days left",
      views: 145,
      clicks: 32,
      status: "active"
    },
    {
      id: "D-102",
      title: "Free Inspection with Repair",
      service: "Plumbing",
      discount: "Free",
      expires: "Expires today",
      views: 89,
      clicks: 14,
      status: "ending_soon"
    }
  ]);

  const handleAddDeal = (newDeal: any) => {
    setActiveDeals([newDeal, ...activeDeals]);
  };

  const pastDeals = [
    {
      id: "D-099",
      title: "End of Year AC Servicing",
      service: "AC Repair",
      discount: "15%",
      expires: "Ended Dec 31",
      views: 520,
      clicks: 112,
      status: "expired"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-extrabold text-display mb-2">Deals & Promotions</h1>
            <p className="text-nexa-text-secondary">Attract more customers by offering exclusive discounts.</p>
         </div>
         <NexaButton size="lg" leftIcon={<Plus className="w-5 h-5" />} onClick={() => setIsModalOpen(true)}>
            Create Deal
         </NexaButton>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <NexaCard variant="glass" className="p-6 border-nexa-brand/20 bg-nexa-brand/5">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-full bg-nexa-brand/20 text-nexa-brand flex items-center justify-center">
                  <Tag className="w-5 h-5" />
               </div>
               <h3 className="font-bold">Active Deals</h3>
            </div>
            <p className="text-3xl font-extrabold">2</p>
         </NexaCard>
         <NexaCard variant="glass" className="p-6">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
               </div>
               <h3 className="font-bold">Total Views</h3>
            </div>
            <p className="text-3xl font-extrabold">234</p>
         </NexaCard>
         <NexaCard variant="glass" className="p-6">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <MousePointerClick className="w-5 h-5" />
               </div>
               <h3 className="font-bold">Total Clicks</h3>
            </div>
            <p className="text-3xl font-extrabold">46</p>
         </NexaCard>
      </div>

      {/* ACTIVE DEALS */}
      <section>
         <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Active Deals
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeDeals.map(deal => (
               <NexaCard key={deal.id} variant="flat" className="p-0 overflow-hidden border border-nexa-border">
                  <div className="p-6 border-b border-nexa-border flex items-start justify-between bg-nexa-bg-surface/50">
                     <div>
                        <NexaBadge variant={deal.status === "active" ? "success" : "warning"} className="mb-3">
                           {deal.status === "active" ? "Active" : "Ending Soon"}
                        </NexaBadge>
                        <h3 className="text-lg font-bold mb-1">{deal.title}</h3>
                        <p className="text-sm text-nexa-text-secondary">{deal.service}</p>
                     </div>
                     <button className="text-nexa-text-faint hover:text-nexa-text-primary">
                        <MoreVertical className="w-5 h-5" />
                     </button>
                  </div>
                  <div className="p-6 flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div>
                           <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-widest mb-1">Discount</p>
                           <p className="font-extrabold text-nexa-brand">{deal.discount}</p>
                        </div>
                        <div>
                           <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-widest mb-1">Expires</p>
                           <p className="font-bold text-sm flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              {deal.expires}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 text-center">
                        <div>
                           <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-widest mb-1">Views</p>
                           <p className="font-bold text-sm">{deal.views}</p>
                        </div>
                        <div>
                           <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-widest mb-1">Clicks</p>
                           <p className="font-bold text-sm">{deal.clicks}</p>
                        </div>
                     </div>
                  </div>
               </NexaCard>
            ))}
         </div>
      </section>

      {/* PAST DEALS */}
      <section className="pt-6">
         <h2 className="text-xl font-bold mb-6 text-nexa-text-secondary">Past Deals</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-75">
            {pastDeals.map(deal => (
               <NexaCard key={deal.id} variant="flat" className="p-6 border border-nexa-border">
                  <div className="flex items-start justify-between mb-4">
                     <div>
                        <NexaBadge variant="neutral" className="mb-2">Expired</NexaBadge>
                        <h3 className="font-bold">{deal.title}</h3>
                     </div>
                     <NexaButton size="sm" variant="secondary">Duplicate</NexaButton>
                  </div>
                  <div className="flex items-center justify-between text-sm text-nexa-text-secondary">
                     <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {deal.expires}</span>
                     <span>{deal.views} views • {deal.clicks} clicks</span>
                  </div>
               </NexaCard>
            ))}
         </div>
      </section>

      <CreateDealModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddDeal={handleAddDeal} 
      />
    </div>
  );
}
