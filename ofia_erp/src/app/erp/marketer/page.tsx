"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";

interface DealItem {
  id: string;
  title: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  value: string;
  stage: "LEAD" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON";
  owner: string;
  probability: number;
  expectedClose: string;
}

const DEMO_DEALS: DealItem[] = [
  {
    id: "DEAL-501",
    title: "15kVA Commercial Solar Hybrid System",
    company: "Standard Chartered Bank Victoria Island",
    contactName: "Babatunde Adeyemi",
    email: "b.adeyemi@scb.ng",
    phone: "+2348031122334",
    value: "₦18,500,000",
    stage: "NEGOTIATION",
    owner: "Chioma Okon (Growth Marketer)",
    probability: 85,
    expectedClose: "Aug 30, 2026",
  },
  {
    id: "DEAL-502",
    title: "Enterprise 32-Channel 4K CCTV & AI Security",
    company: "Eko Atlantic Horizon Towers",
    contactName: "Engr. Nnamdi Eze",
    email: "eze@ekoatlantic.com",
    phone: "+2348029988776",
    value: "₦9,200,000",
    stage: "PROPOSAL",
    owner: "Emeka Okafor",
    probability: 60,
    expectedClose: "Sep 05, 2026",
  },
  {
    id: "DEAL-503",
    title: "Annual ERP & POS Multi-Branch Subscription",
    company: "Hubmart Supermarkets Nigeria",
    contactName: "Amina Bello",
    email: "amina.b@hubmart.ng",
    phone: "+2348054433221",
    value: "₦4,800,000",
    stage: "QUALIFIED",
    owner: "Chioma Okon (Growth Marketer)",
    probability: 45,
    expectedClose: "Sep 12, 2026",
  },
  {
    id: "DEAL-504",
    title: "Cold Chain IoT Telemetry System",
    company: "Ahnara Global Health Pharmacies",
    contactName: "Dr. Kunle Alabi",
    email: "k.alabi@ahnara.org",
    phone: "+2348098877665",
    value: "₦6,400,000",
    stage: "WON",
    owner: "Ibrahim Musa",
    probability: 100,
    expectedClose: "Aug 20, 2026",
  },
  {
    id: "DEAL-505",
    title: "Solar Streetlight Inverter Package (30 Units)",
    company: "Lekki Phase 1 Residents Association",
    contactName: "Chief Femi Johnson",
    email: "femi.j@lekkiphase1.ng",
    phone: "+2348037776655",
    value: "₦14,200,000",
    stage: "LEAD",
    owner: "Chioma Okon (Growth Marketer)",
    probability: 25,
    expectedClose: "Sep 25, 2026",
  },
];

export default function CRMDashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");

  const filteredDeals = DEMO_DEALS.filter((deal) => {
    const matchesSearch =
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === "ALL" || deal.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const getStageBadge = (stage: DealItem["stage"]) => {
    switch (stage) {
      case "LEAD":
        return <NexaBadge variant="neutral" size="sm">New Lead</NexaBadge>;
      case "QUALIFIED":
        return <NexaBadge variant="brand" size="sm">Discovery / Qualified</NexaBadge>;
      case "PROPOSAL":
        return <NexaBadge variant="purple" size="sm">Proposal Sent</NexaBadge>;
      case "NEGOTIATION":
        return <NexaBadge variant="amber" size="sm">In Negotiation</NexaBadge>;
      case "WON":
        return <NexaBadge variant="green" size="sm">Closed Won</NexaBadge>;
    }
  };

  return (
    <BusinessShell
      title="CRM and Sales"
      subtitle="Enterprise sales pipeline, high-value deal stages, B2B account contacts, and revenue quota tracking for Growth Marketers."
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/erp/marketer/pipeline">
            <NexaButton size="sm" variant="outline" leftIcon={<TrendingUp className="w-3.5 h-3.5" />}>
              Kanban Pipeline
            </NexaButton>
          </Link>
          <Link href="/erp/marketer/leads">
            <NexaButton size="sm" variant="outline" leftIcon={<Users className="w-3.5 h-3.5" />}>
              Leads Directory
            </NexaButton>
          </Link>
          <Link href="/erp/marketer/pipeline">
            <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
              Create Deal / Lead
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* TOP 4 KPI CARDS */}
        <ErpStatGrid
          stats={[
            {
              label: "Active Pipeline Value",
              value: "₦53,100,000",
              change: "+₦12.4M this month",
              trend: "up",
              icon: <DollarSign className="w-5 h-5 text-blue-500" />,
              sub: "5 active enterprise opportunities",
            },
            {
              label: "Closed Won Revenue",
              value: "₦42,800,000",
              change: "Quota Pace: 112%",
              trend: "up",
              icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
              sub: "₦6.4M won this week",
            },
            {
              label: "Win Conversion Rate",
              value: "28.4%",
              change: "+3.2% vs last quarter",
              trend: "up",
              icon: <Target className="w-5 h-5 text-purple-500" />,
              sub: "Lead-to-closed contract velocity",
            },
            {
              label: "Inbound Leads & Accounts",
              value: "320 Accounts",
              change: "18 new this week",
              trend: "up",
              icon: <Users className="w-5 h-5 text-amber-500" />,
              sub: "Lagos & Abuja commercial hubs",
            },
          ]}
        />

        {/* SALES PIPELINE STAGE SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {[
            { stage: "LEAD", label: "1. New Leads", count: 1, sum: "₦14.2M", color: "border-slate-500/20 bg-slate-500/5" },
            { stage: "QUALIFIED", label: "2. Qualified", count: 1, sum: "₦4.8M", color: "border-blue-500/20 bg-blue-500/5" },
            { stage: "PROPOSAL", label: "3. Proposal Sent", count: 1, sum: "₦9.2M", color: "border-purple-500/20 bg-purple-500/5" },
            { stage: "NEGOTIATION", label: "4. In Negotiation", count: 1, sum: "₦18.5M", color: "border-amber-500/20 bg-amber-500/5" },
            { stage: "WON", label: "5. Closed Won", count: 1, sum: "₦6.4M", color: "border-emerald-500/20 bg-emerald-500/5" },
          ].map((col) => (
            <button
              key={col.stage}
              onClick={() => setStageFilter(stageFilter === col.stage ? "ALL" : col.stage)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${col.color} ${stageFilter === col.stage ? "ring-2 ring-[#1A56DB] shadow-md" : "hover:border-slate-400"}`}
            >
              <div className="text-[11px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider">{col.label}</div>
              <div className="text-lg font-black text-[var(--nexa-text-primary)] mt-1">{col.sum}</div>
              <div className="text-[10px] text-[var(--nexa-text-secondary)] font-medium mt-0.5">{col.count} Opportunity</div>
            </button>
          ))}
        </div>

        {/* ACTIVE DEALS REGISTRY TABLE */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-[var(--nexa-text-primary)] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1A56DB]" />
                Active Enterprise Deals & Accounts
              </h2>
              <p className="text-xs text-[var(--nexa-text-muted)]">Track contract negotiations, deal values, and assigned sales owners.</p>
            </div>
            <div className="w-72">
              <NexaInput
                placeholder="Search deal, company, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="search"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Deal / Opportunity</th>
                  <th className="py-3.5 px-3">Company & Contact</th>
                  <th className="py-3.5 px-3">Deal Value</th>
                  <th className="py-3.5 px-3">Stage</th>
                  <th className="py-3.5 px-3">Probability</th>
                  <th className="py-3.5 px-3">Marketer / Owner</th>
                  <th className="py-3.5 px-3">Expected Close</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-xs text-[var(--nexa-text-primary)]">{deal.title}</div>
                      <div className="text-[10px] text-[var(--nexa-text-muted)] font-mono">{deal.id}</div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="font-bold text-[var(--nexa-text-primary)]">{deal.company}</div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] flex items-center gap-1.5 mt-0.5">
                        <span>{deal.contactName}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px]">{deal.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 font-mono font-extrabold text-sm text-[#1A56DB]">
                      {deal.value}
                    </td>
                    <td className="py-4 px-3">
                      {getStageBadge(deal.stage)}
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${deal.probability}%` }} />
                        </div>
                        <span className="font-mono text-[10px] font-bold">{deal.probability}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-xs text-[var(--nexa-text-secondary)]">
                      <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 font-medium text-[11px]">
                        {deal.owner}
                      </span>
                    </td>
                    <td className="py-4 px-3 font-mono text-[11px] text-[var(--nexa-text-muted)]">
                      {deal.expectedClose}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a href={`tel:${deal.phone}`} className="p-1.5 rounded-lg hover:bg-[var(--nexa-bg-base)] text-slate-500 hover:text-[#1A56DB] transition-colors" title="Call Contact">
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a href={`mailto:${deal.email}`} className="p-1.5 rounded-lg hover:bg-[var(--nexa-bg-base)] text-slate-500 hover:text-[#1A56DB] transition-colors" title="Email Contact">
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BusinessShell>
  );
}
