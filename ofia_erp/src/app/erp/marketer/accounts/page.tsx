"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  DollarSign,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";

const ACCOUNTS = [
  { id: "ACC-101", company: "Standard Chartered Bank Nigeria", industry: "Banking & Finance", location: "Victoria Island, Lagos", totalDeals: "₦18.5M", status: "CLIENT", keyContact: "Babatunde Adeyemi", email: "b.adeyemi@scb.ng" },
  { id: "ACC-102", company: "Eko Atlantic Horizon Towers", industry: "Real Estate & Facility", location: "Eko Atlantic City, Lagos", totalDeals: "₦9.2M", status: "PROSPECT", keyContact: "Engr. Nnamdi Eze", email: "eze@ekoatlantic.com" },
  { id: "ACC-103", company: "Hubmart Supermarkets Ltd", industry: "Retail & FMCG", location: "Ikeja, Lagos", totalDeals: "₦4.8M", status: "PROSPECT", keyContact: "Amina Bello", email: "amina.b@hubmart.ng" },
  { id: "ACC-104", company: "Ahnara Global Health Pharmacies", industry: "Healthcare & Pharmaceuticals", location: "Garki 2, Abuja", totalDeals: "₦6.4M", status: "CLIENT", keyContact: "Dr. Kunle Alabi", email: "k.alabi@ahnara.org" },
];

export default function CRMAccountsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <BusinessShell
      title="Corporate Accounts & Client Directory"
      subtitle="Master B2B corporate customer profiles, multiple stakeholder contacts, and lifetime contract values."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/marketer">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              CRM Overview
            </NexaButton>
          </Link>
          <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
            Add Corporate Account
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ACCOUNTS.map((acc) => (
            <NexaCard key={acc.id} variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">{acc.company}</h3>
                    <p className="text-xs text-[var(--nexa-text-muted)]">{acc.industry}</p>
                  </div>
                </div>
                <NexaBadge variant={acc.status === "CLIENT" ? "green" : "brand"}>{acc.status}</NexaBadge>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs">
                <div>
                  <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase font-bold">Key Contact</span>
                  <div className="font-bold text-[var(--nexa-text-primary)]">{acc.keyContact}</div>
                  <div className="text-[11px] text-[var(--nexa-text-muted)] truncate">{acc.email}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase font-bold">Pipeline / LTV</span>
                  <div className="font-mono font-extrabold text-sm text-[#1A56DB]">{acc.totalDeals}</div>
                  <div className="text-[10px] text-[var(--nexa-text-muted)]">{acc.location}</div>
                </div>
              </div>
            </NexaCard>
          ))}
        </div>
      </div>
    </BusinessShell>
  );
}
