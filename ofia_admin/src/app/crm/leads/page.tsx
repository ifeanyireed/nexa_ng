"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  DollarSign,
  Download,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

const ENTERPRISE_INQUIRIES = [
  {
    id: "ENT-901",
    company: "Eko Atlantic Horizon Towers",
    contactName: "Engr. Nnamdi Eze",
    title: "Managing Director",
    email: "eze@ekoatlantic.com",
    phone: "+2348029988776",
    locations: "Victoria Island, Lagos",
    estimatedSeats: "50+ Users",
    dealValue: "₦12,500,000 / yr",
    tier: "ENTERPRISE",
    status: "DEMO_SCHEDULED",
    date: "Aug 24, 2026",
  },
  {
    id: "ENT-902",
    company: "Trans-Niger Cold Chain Logistics",
    contactName: "Chidiebere Okonkwo",
    title: "Head of Fleet Operations",
    email: "c.okonkwo@transniger.com",
    phone: "+2348037776655",
    locations: "Port Harcourt & Aba",
    estimatedSeats: "25 Users",
    dealValue: "₦6,800,000 / yr",
    tier: "GROWTH",
    status: "CONTRACT_SENT",
    date: "Aug 23, 2026",
  },
  {
    id: "ENT-903",
    company: "Solarking Power Systems Ltd",
    contactName: "Dr. Babatunde Adeyemi",
    title: "CEO / Chief Engineer",
    email: "babatunde@solarking.ng",
    phone: "+2348031122334",
    locations: "Ikeja, Abuja, Ibadan",
    estimatedSeats: "30 Users",
    dealValue: "₦8,200,000 / yr",
    tier: "ENTERPRISE",
    status: "QUALIFIED",
    date: "Aug 22, 2026",
  },
  {
    id: "ENT-904",
    company: "Amina Luxury Fabrics & Couture",
    contactName: "Hajiya Amina Bello",
    title: "Founder & Lead Merchant",
    email: "amina.bello@fabrics.ng",
    phone: "+2348054433221",
    locations: "Abuja & Kano",
    estimatedSeats: "12 Users",
    dealValue: "₦3,600,000 / yr",
    tier: "GROWTH",
    status: "DISCOVERY_CALL",
    date: "Aug 21, 2026",
  },
];

export default function EnterpriseLeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = ENTERPRISE_INQUIRIES.filter(
    (l) =>
      l.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SuperAdminShell
      title="Enterprise CRM Inquiries & B2B Pipeline"
      subtitle="High-ACV enterprise accounts and merchant chains requesting dedicated tenant deployments and custom SLA agreements."
      action={
        <div className="flex items-center gap-2">
          <Link href="/crm/waitlist">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Waitlist Pipeline
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NexaCard variant="glass" padding="md" className="border-l-4 border-l-[#1A56DB]">
            <div className="text-xs text-[var(--nexa-text-muted)] font-semibold">Total Pipeline Value</div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] mt-1">₦31,100,000</div>
            <div className="text-[11px] text-[#1A56DB] font-bold mt-1">Across 4 Major B2B Deals</div>
          </NexaCard>
          <NexaCard variant="glass" padding="md" className="border-l-4 border-l-[#0E9F6E]">
            <div className="text-xs text-[var(--nexa-text-muted)] font-semibold">Average Deal Size</div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] mt-1">₦7,775,000</div>
            <div className="text-[11px] text-[#0E9F6E] font-bold mt-1">Annual Contract Value (ACV)</div>
          </NexaCard>
          <NexaCard variant="glass" padding="md" className="border-l-4 border-l-[#7E22CE]">
            <div className="text-xs text-[var(--nexa-text-muted)] font-semibold">Conversion Probability</div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] mt-1">78.5%</div>
            <div className="text-[11px] text-[#7E22CE] font-bold mt-1">High Intent Enterprise Inquiries</div>
          </NexaCard>
        </div>

        {/* Search */}
        <div className="w-80">
          <input
            type="text"
            placeholder="Search enterprise company, contact, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB]"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Deal ID & Company</th>
                <th className="py-3 px-3">Lead Contact</th>
                <th className="py-3 px-3">Locations & Seats</th>
                <th className="py-3 px-3">Est. ACV</th>
                <th className="py-3 px-3">Pipeline Stage</th>
                <th className="py-3 px-4 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
              {filtered.map((deal) => (
                <tr key={deal.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-xs">{deal.company}</div>
                    <div className="font-mono text-[10px] text-[var(--nexa-text-muted)]">{deal.id}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold">{deal.contactName}</div>
                    <div className="text-[10px] text-[var(--nexa-text-muted)]">{deal.title}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div>{deal.locations}</div>
                    <div className="text-[10px] font-bold text-[#1A56DB]">{deal.estimatedSeats}</div>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600">{deal.dealValue}</td>
                  <td className="py-3.5 px-3">
                    <NexaBadge variant="brand">{deal.status}</NexaBadge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`https://wa.me/${deal.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`mailto:${deal.email}`}
                        className="p-1.5 rounded-lg text-[#1A56DB] hover:bg-blue-50 dark:hover:bg-blue-950"
                      >
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
    </SuperAdminShell>
  );
}
