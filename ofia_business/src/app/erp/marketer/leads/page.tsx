"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Filter,
  Mail,
  Phone,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";

const LEADS = [
  { id: "LEAD-801", name: "Engr. Nnamdi Eze", company: "Eko Atlantic Horizon Towers", email: "eze@ekoatlantic.com", phone: "+2348029988776", source: "Website Inbound", status: "CONTACTED", interest: "CCTV AI Surveillance", date: "Today, 11:30 AM" },
  { id: "LEAD-802", name: "Babatunde Adeyemi", company: "Standard Chartered Bank VI", email: "b.adeyemi@scb.ng", phone: "+2348031122334", source: "Growth Marketer Outreach", status: "QUALIFIED", interest: "15kVA Solar Hybrid", date: "Yesterday, 04:15 PM" },
  { id: "LEAD-803", name: "Amina Bello", company: "Hubmart Supermarkets NG", email: "amina.b@hubmart.ng", phone: "+2348054433221", source: "Referral Partner", status: "DEMO_SCHEDULED", interest: "ERP Multi-Store POS", date: "Aug 21, 2026" },
  { id: "LEAD-804", name: "Chief Femi Johnson", company: "Lekki Phase 1 Association", email: "femi.j@lekkiphase1.ng", phone: "+2348037776655", source: "WhatsApp Channel", status: "NEW", interest: "Streetlight Inverters", date: "Aug 20, 2026" },
];

export default function CRMLeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <BusinessShell
      title="B2B Leads Directory & Inquiries"
      subtitle="Capture, qualify, and route incoming enterprise prospects to assigned Growth Marketers and Sales Executives."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/marketer">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              CRM Overview
            </NexaButton>
          </Link>
          <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
            Add Prospect Lead
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-80">
            <NexaInput
              placeholder="Search lead name, company, or email..."
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
                <th className="py-3 px-4">Lead ID & Name</th>
                <th className="py-3 px-3">Organization</th>
                <th className="py-3 px-3">Interest / Need</th>
                <th className="py-3 px-3">Lead Source</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Captured</th>
                <th className="py-3 px-4 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
              {LEADS.map((lead) => (
                <tr key={lead.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-xs">{lead.name}</div>
                    <div className="font-mono text-[10px] text-[var(--nexa-text-muted)]">{lead.id}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold">{lead.company}</div>
                    <div className="text-[10px] text-[var(--nexa-text-muted)]">{lead.email}</div>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-[#1A56DB]">{lead.interest}</td>
                  <td className="py-3.5 px-3 text-[var(--nexa-text-muted)]">{lead.source}</td>
                  <td className="py-3.5 px-3">
                    <NexaBadge variant="brand">{lead.status}</NexaBadge>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[10px] text-[var(--nexa-text-muted)]">{lead.date}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a href={`tel:${lead.phone}`} className="p-1.5 rounded-lg hover:bg-[var(--nexa-bg-base)] text-slate-500 hover:text-[#1A56DB]">
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a href={`mailto:${lead.email}`} className="p-1.5 rounded-lg hover:bg-[var(--nexa-bg-base)] text-slate-500 hover:text-[#1A56DB]">
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
    </BusinessShell>
  );
}
