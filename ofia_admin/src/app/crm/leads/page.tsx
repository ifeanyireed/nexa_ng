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
import { AdminStatGrid } from "@/components/admin/AdminStatCard";
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
        <AdminStatGrid
          stats={[
            {
              label: "Total Pipeline Value",
              value: "₦31,100,000",
              change: "4 Major Deals",
              trend: "up",
              changeType: "info",
              icon: <DollarSign className="w-5 h-5 text-blue-500" />,
              sub: "Across 4 qualified enterprise proposals",
            },
            {
              label: "Average Deal Size (ACV)",
              value: "₦7,775,000",
              change: "Annual Contract",
              trend: "up",
              changeType: "success",
              icon: <Building2 className="w-5 h-5 text-emerald-500" />,
              sub: "Annual Contract Value per organization",
            },
            {
              label: "Conversion Probability",
              value: "78.5%",
              change: "High Intent",
              trend: "up",
              changeType: "purple",
              icon: <Sparkles className="w-5 h-5 text-purple-500" />,
              sub: "High intent enterprise inquiries",
            },
          ]}
          columns={3}
        />

        {/* Search */}
        <div className="w-80">
          <input
            type="text"
            placeholder="Search enterprise company, contact, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 px-4 rounded-full bg-nexa-bg-surface border border-nexa-border text-xs text-nexa-text-primary focus:outline-none focus:border-nexa-brand placeholder:text-nexa-text-faint"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-3xl border border-nexa-border bg-nexa-bg-surface shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-nexa-bg-base text-nexa-text-muted border-b border-nexa-border font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Deal ID & Company</th>
                <th className="py-3 px-3">Lead Contact</th>
                <th className="py-3 px-3">Locations & Seats</th>
                <th className="py-3 px-3">Est. ACV</th>
                <th className="py-3 px-3">Pipeline Stage</th>
                <th className="py-3 px-4 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexa-border text-nexa-text-primary">
              {filtered.map((deal) => (
                <tr key={deal.id} className="hover:bg-nexa-bg-base/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-xs">{deal.company}</div>
                    <div className="font-mono text-[10px] text-nexa-text-faint">{deal.id}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold">{deal.contactName}</div>
                    <div className="text-[10px] text-nexa-text-faint">{deal.title}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div>{deal.locations}</div>
                    <div className="text-[10px] font-bold text-nexa-brand">{deal.estimatedSeats}</div>
                  </td>
                  <td className="py-3.5 px-3 font-bold font-mono text-emerald-500">{deal.dealValue}</td>
                  <td className="py-3.5 px-3">
                    <NexaBadge variant="brand">{deal.status}</NexaBadge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`https://wa.me/${deal.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`mailto:${deal.email}`}
                        className="p-1.5 rounded-full text-nexa-brand hover:bg-nexa-brand/10 transition-colors"
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
