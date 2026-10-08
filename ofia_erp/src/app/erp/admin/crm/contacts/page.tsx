"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Tag,
  ExternalLink,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";
import { CrmAccount, DEFAULT_CRM_ACCOUNTS } from "@/lib/crm-service";

export default function ContactsAccountsPage() {
  const [accounts, setAccounts] = useState<CrmAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // New Account Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("Corporate");
  const [location, setLocation] = useState("Lagos");
  const [keyContact, setKeyContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<CrmAccount["status"]>("CLIENT");

  useEffect(() => {
    async function loadAccounts() {
      try {
        const res = await fetch("/api/erp/crm/accounts").then((r) => r.json());
        if (res?.accounts) setAccounts(res.accounts);
        else setAccounts(DEFAULT_CRM_ACCOUNTS.map((a) => ({ ...a, tenantSlug: "default" })));
      } catch {
        setAccounts(DEFAULT_CRM_ACCOUNTS.map((a) => ({ ...a, tenantSlug: "default" })));
      } finally {
        setIsLoading(false);
      }
    }
    loadAccounts();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;

    const payload = {
      company: company.trim(),
      industry: industry.trim(),
      location: location.trim(),
      status,
      keyContact: keyContact.trim() || "Decision Maker",
      email: email.trim() || "info@company.ng",
      phone: phone.trim(),
      totalDeals: "₦0",
    };

    try {
      const res = await fetch("/api/erp/crm/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.account) {
        setAccounts((prev) => [data.account, ...prev]);
      }
    } catch {
      const newAcc: CrmAccount = {
        id: `ACC-${Date.now().toString().slice(-3)}`,
        tenantSlug: "default",
        ...payload,
        createdAt: new Date().toISOString(),
      };
      setAccounts((prev) => [newAcc, ...prev]);
    }

    setIsModalOpen(false);
    setCompany("");
    setKeyContact("");
    setEmail("");
    setPhone("");
  };

  const filtered = accounts.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      a.company.toLowerCase().includes(q) ||
      a.keyContact.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <ErpAdminShell
      title="Client Accounts & Key Contacts"
      subtitle="Corporate organizations, institutional clients, contract histories, and stakeholder directories."
      activeModule="crm"
      action={
        <NexaButton
          variant="primary"
          className="gap-2 text-xs"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Account
        </NexaButton>
      }
    >
      <div className="space-y-6">
        <ErpStatGrid
          stats={[
            {
              label: "Total Managed Accounts",
              value: accounts.length.toString(),
              change: "Institutional entities",
              changeType: "success",
              icon: <Building2 className="w-4 h-4 text-blue-500" />,
            },
            {
              label: "Active Clients",
              value: accounts.filter((a) => a.status === "CLIENT").length.toString(),
              change: "Active recurring contracts",
              changeType: "success",
              icon: <Users className="w-4 h-4 text-emerald-500" />,
            },
            {
              label: "High-Growth Prospects",
              value: accounts.filter((a) => a.status === "PROSPECT").length.toString(),
              change: "In pipeline evaluation",
              changeType: "neutral",
              icon: <TrendingUp className="w-4 h-4 text-purple-500" />,
            },
          ]}
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <NexaInput
              placeholder="Search company, contact, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "CLIENT", "PROSPECT", "PARTNER"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? "bg-[#1A56DB] text-white shadow-xs"
                    : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] border border-[var(--nexa-border)]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((acc) => (
            <NexaCard key={acc.id} className="p-5 flex flex-col justify-between hover:border-[#1A56DB]/50 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[var(--nexa-text-muted)]">{acc.id}</span>
                  <NexaBadge
                    variant={acc.status === "CLIENT" ? "success" : acc.status === "PROSPECT" ? "brand" : "neutral"}
                  >
                    {acc.status}
                  </NexaBadge>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">{acc.company}</h4>
                  <div className="text-xs text-[var(--nexa-text-muted)] flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {acc.location}</span>
                    <span>•</span>
                    <span>{acc.industry}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-1">
                  <div className="text-[11px] font-bold text-[var(--nexa-text-primary)]">{acc.keyContact}</div>
                  <div className="text-[10px] text-[var(--nexa-text-muted)] flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#1A56DB]" /> {acc.email}
                  </div>
                  {acc.phone && (
                    <div className="text-[10px] text-[var(--nexa-text-muted)] flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-500" /> {acc.phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[var(--nexa-border)] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[var(--nexa-text-muted)]">Historical Value</span>
                  <p className="font-bold text-[#1A56DB]">{acc.totalDeals}</p>
                </div>
                <Link
                  href="/erp/admin/crm/pipeline"
                  className="text-xs font-bold text-[#1A56DB] hover:underline flex items-center gap-1"
                >
                  Deals <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </NexaCard>
          ))}
        </div>
      </div>

      <NexaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Client Account"
        subtitle="Record an institutional company account."
      >
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <NexaInput
            label="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. TotalEnergies Marketing Nigeria"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NexaInput
              label="Industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="Energy & Utilities"
            />
            <NexaInput
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Victoria Island, Lagos"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NexaInput
              label="Key Contact"
              value={keyContact}
              onChange={(e) => setKeyContact(e.target.value)}
              placeholder="Head of Procurement"
            />
            <NexaInput
              label="Contact Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="procurement@total.ng"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-medium"
            >
              <option value="CLIENT">CLIENT (Active Customer)</option>
              <option value="PROSPECT">PROSPECT (Evaluating Proposal)</option>
              <option value="PARTNER">PARTNER (Channel Partner)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <NexaButton variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton variant="primary" type="submit">
              Save Account
            </NexaButton>
          </div>
        </form>
      </NexaModal>
    </ErpAdminShell>
  );
}
