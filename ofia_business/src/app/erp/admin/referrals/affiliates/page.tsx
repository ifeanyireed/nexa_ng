"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Copy,
  ExternalLink,
  Plus,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";

const AFFILIATES = [
  { id: "AFF-101", name: "Khalil Ibrahim", email: "khalil@techhub.ng", phone: "+2348011223344", bank: "GTBank (0123456789)", refCode: "khalil2026", tier: "GOLD", totalReferrals: 142, conversionRate: "62%", earnings: "₦1,420,000", status: "VERIFIED" },
  { id: "AFF-102", name: "SolarInstallers Hub", email: "contact@solarhub.ng", phone: "+2348099887766", bank: "Zenith Bank (2089123456)", refCode: "solarhub", tier: "SILVER", totalReferrals: 98, conversionRate: "58%", earnings: "₦980,000", status: "VERIFIED" },
  { id: "AFF-103", name: "TechPoint West Africa", email: "partners@techpoint.africa", phone: "+2348055443322", bank: "Access Bank (0099887766)", refCode: "techpoint", tier: "PLATINUM", totalReferrals: 210, conversionRate: "71%", earnings: "₦2,100,000", status: "VERIFIED" },
];

export default function AffiliatesDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <BusinessShell
      title="Affiliate Partners & Ambassador Directory"
      subtitle="Manage 184 registered affiliates, vanity referral URLs, Nigerian bank accounts, and tier status."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/referrals">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Referral Hub
            </NexaButton>
          </Link>
          <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
            Register New Affiliate
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-96">
            <NexaInput
              placeholder="Search by name, email, ref code..."
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
                <th className="py-3 px-4">Affiliate Name</th>
                <th className="py-3 px-4">Referral Code & Link</th>
                <th className="py-3 px-3">Bank Account</th>
                <th className="py-3 px-3">Tier</th>
                <th className="py-3 px-3">Invites & CVR</th>
                <th className="py-3 px-3">Total Earnings</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
              {AFFILIATES.map((aff) => (
                <tr key={aff.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[var(--nexa-text-primary)]">{aff.name}</div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)]">{aff.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[#1A56DB] font-bold">
                      {aff.refCode}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-[var(--nexa-text-secondary)]">{aff.bank}</td>
                  <td className="py-3.5 px-3">
                    <NexaBadge variant="purple" className="text-[9px]">{aff.tier}</NexaBadge>
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    <div>{aff.totalReferrals} Clicks</div>
                    <div className="text-[11px] text-[#0E9F6E] font-bold">{aff.conversionRate} Conv</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-[#0E9F6E]">{aff.earnings}</td>
                  <td className="py-3.5 px-4 text-right">
                    <NexaBadge variant="green" dot>{aff.status}</NexaBadge>
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
