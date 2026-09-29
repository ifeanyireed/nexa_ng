"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  GripVertical,
  Mail,
  Phone,
  Plus,
  Sparkles,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

interface KanbanCard {
  id: string;
  title: string;
  company: string;
  value: string;
  contact: string;
  phone: string;
  daysInStage: number;
  owner: string;
}

const COLUMNS: { id: string; title: string; color: string; total: string; deals: KanbanCard[] }[] = [
  {
    id: "LEAD",
    title: "New Inquiries",
    color: "border-slate-500/30 bg-slate-500/5",
    total: "₦14.2M",
    deals: [
      { id: "DEAL-505", title: "Solar Streetlight Inverters (30 Units)", company: "Lekki Phase 1 Association", value: "₦14,200,000", contact: "Chief Femi Johnson", phone: "+2348037776655", daysInStage: 2, owner: "Chioma Okon" },
    ],
  },
  {
    id: "QUALIFIED",
    title: "Discovery & Qualification",
    color: "border-blue-500/30 bg-blue-500/5",
    total: "₦4.8M",
    deals: [
      { id: "DEAL-503", title: "Annual ERP & Multi-Branch POS", company: "Hubmart Supermarkets", value: "₦4,800,000", contact: "Amina Bello", phone: "+2348054433221", daysInStage: 5, owner: "Chioma Okon" },
    ],
  },
  {
    id: "PROPOSAL",
    title: "Proposal / Demo Delivered",
    color: "border-purple-500/30 bg-purple-500/5",
    total: "₦9.2M",
    deals: [
      { id: "DEAL-502", title: "32-Channel 4K CCTV AI Security", company: "Eko Atlantic Towers", value: "₦9,200,000", contact: "Engr. Nnamdi Eze", phone: "+2348029988776", daysInStage: 8, owner: "Emeka Okafor" },
    ],
  },
  {
    id: "NEGOTIATION",
    title: "Contract Negotiation",
    color: "border-amber-500/30 bg-amber-500/5",
    total: "₦18.5M",
    deals: [
      { id: "DEAL-501", title: "15kVA Commercial Solar Hybrid", company: "Standard Chartered Bank VI", value: "₦18,500,000", contact: "Babatunde Adeyemi", phone: "+2348031122334", daysInStage: 12, owner: "Chioma Okon" },
    ],
  },
  {
    id: "WON",
    title: "Closed Won",
    color: "border-emerald-500/30 bg-emerald-500/5",
    total: "₦6.4M",
    deals: [
      { id: "DEAL-504", title: "Cold Chain IoT Telemetry System", company: "Ahnara Global Health", value: "₦6,400,000", contact: "Dr. Kunle Alabi", phone: "+2348098877665", daysInStage: 1, owner: "Ibrahim Musa" },
    ],
  },
];

export default function CRMPipelinePage() {
  return (
    <BusinessShell
      title="Interactive Kanban Deals Pipeline"
      subtitle="Drag-and-drop opportunity progression across sales lifecycle stages with real-time value aggregations."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/marketer">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              CRM Overview
            </NexaButton>
          </Link>
          <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
            Add Deal Card
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)]/60 min-w-[260px] p-3 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--nexa-border)]">
                <div>
                  <h3 className="text-xs font-black text-[var(--nexa-text-primary)]">{col.title}</h3>
                  <p className="text-[10px] font-mono text-[#1A56DB] font-extrabold">{col.total}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500">
                  {col.deals.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {col.deals.map((deal) => (
                  <NexaCard key={deal.id} variant="glass" padding="sm" className="space-y-2 border border-[var(--nexa-border)] shadow-xs hover:border-[#1A56DB] cursor-grab transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-[var(--nexa-text-muted)] font-bold">{deal.id}</span>
                      <span className="text-[9px] font-bold text-amber-500">{deal.daysInStage}d in stage</span>
                    </div>
                    <h4 className="text-xs font-bold text-[var(--nexa-text-primary)] leading-snug">{deal.title}</h4>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{deal.company}</span>
                    </p>
                    <div className="pt-2 border-t border-[var(--nexa-border)] flex items-center justify-between">
                      <span className="font-mono font-black text-xs text-[#1A56DB]">{deal.value}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-pink-500/10 text-pink-600 font-bold">{deal.owner.split(" ")[0]}</span>
                    </div>
                  </NexaCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </BusinessShell>
  );
}
