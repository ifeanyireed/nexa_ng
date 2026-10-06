"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Plus,
  Search,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  Filter,
  MoreVertical,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";
import { CrmDeal, DEFAULT_CRM_DEALS } from "@/lib/crm-service";

const STAGES: { key: CrmDeal["stage"]; label: string; color: string }[] = [
  { key: "LEAD", label: "Lead Discovery", color: "border-slate-500/40 text-slate-500" },
  { key: "QUALIFIED", label: "Qualified", color: "border-blue-500/40 text-blue-500" },
  { key: "PROPOSAL", label: "Proposal / SLA", color: "border-purple-500/40 text-purple-500" },
  { key: "NEGOTIATION", label: "Negotiation", color: "border-amber-500/40 text-amber-500" },
  { key: "WON", label: "Contract Won", color: "border-emerald-500/40 text-emerald-500" },
];

export default function DealsPipelinePage() {
  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // New Deal Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [val, setVal] = useState("₦5,000,000");
  const [stage, setStage] = useState<CrmDeal["stage"]>("QUALIFIED");

  useEffect(() => {
    async function loadDeals() {
      try {
        const res = await fetch("/api/erp/crm/deals").then((r) => r.json());
        if (res?.deals) setDeals(res.deals);
        else setDeals(DEFAULT_CRM_DEALS.map((d) => ({ ...d, tenantSlug: "default" })));
      } catch {
        setDeals(DEFAULT_CRM_DEALS.map((d) => ({ ...d, tenantSlug: "default" })));
      } finally {
        setIsLoading(false);
      }
    }
    loadDeals();
  }, []);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;

    const payload = {
      title: title.trim(),
      company: company.trim(),
      contactName: contactName.trim() || "Decision Maker",
      email: email.trim(),
      phone: phone.trim(),
      value: val.trim(),
      stage,
      owner: "Chioma Okon (Growth Marketer)",
      probability: stage === "WON" ? 100 : stage === "NEGOTIATION" ? 85 : 50,
      expectedClose: "Nov 30, 2026",
    };

    try {
      const res = await fetch("/api/erp/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.deal) setDeals((prev) => [data.deal, ...prev]);
    } catch {
      const localDeal: CrmDeal = {
        id: `DEAL-${Date.now().toString().slice(-4)}`,
        tenantSlug: "default",
        ...payload,
        createdAt: new Date().toISOString(),
      };
      setDeals((prev) => [localDeal, ...prev]);
    }

    setIsModalOpen(false);
    setTitle("");
    setCompany("");
  };

  const handleStageChange = (dealId: string, newStage: CrmDeal["stage"]) => {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId
          ? {
              ...d,
              stage: newStage,
              probability: newStage === "WON" ? 100 : newStage === "NEGOTIATION" ? 85 : d.probability,
            }
          : d
      )
    );
  };

  const filteredDeals = deals.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ErpAdminShell
      title="Commercial Deals Pipeline"
      subtitle="Visual stage progression, win probabilities, expected close dates, and contract value tracking."
      activeModule="crm"
      action={
        <NexaButton
          variant="primary"
          className="gap-2 text-xs"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Opportunity
        </NexaButton>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <NexaInput
              placeholder="Search deals, company, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* KANBAN BOARD COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STAGES.map((st) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === st.key);
            return (
              <div
                key={st.key}
                className="bg-[var(--nexa-bg-surface)]/60 rounded-2xl p-3 border border-[var(--nexa-border)] flex flex-col min-w-[240px]"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)] mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${st.color.split(" ")[1].replace("text-", "bg-")}`} />
                    <h4 className="text-xs font-extrabold text-[var(--nexa-text-primary)]">{st.label}</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border border-[var(--nexa-border)]">
                    {stageDeals.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-320px)]">
                  {stageDeals.map((deal) => (
                    <NexaCard
                      key={deal.id}
                      className="p-3.5 hover:border-[#1A56DB] transition-all cursor-pointer group shadow-xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-bold text-[var(--nexa-text-primary)] line-clamp-2">
                          {deal.title}
                        </h5>
                      </div>

                      <div className="space-y-1 text-[11px] text-[var(--nexa-text-muted)]">
                        <div className="flex items-center gap-1.5 font-medium truncate">
                          <Building2 className="w-3 h-3 text-[#1A56DB]" />
                          {deal.company}
                        </div>
                        <div className="text-[10px] truncate">{deal.contactName}</div>
                      </div>

                      <div className="pt-2 border-t border-[var(--nexa-border)] flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#1A56DB]">{deal.value}</span>
                        <select
                          value={deal.stage}
                          onChange={(e) => handleStageChange(deal.id, e.target.value as any)}
                          className="text-[10px] bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-md px-1.5 py-0.5 font-bold cursor-pointer"
                        >
                          <option value="LEAD">LEAD</option>
                          <option value="QUALIFIED">QUALIFIED</option>
                          <option value="PROPOSAL">PROPOSAL</option>
                          <option value="NEGOTIATION">NEGOTIATION</option>
                          <option value="WON">WON</option>
                        </select>
                      </div>
                    </NexaCard>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="h-24 rounded-xl border border-dashed border-[var(--nexa-border)] flex items-center justify-center text-[11px] text-[var(--nexa-text-muted)]">
                      No deals in {st.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE DEAL MODAL */}
      <NexaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Commercial Deal"
        subtitle="Record an enterprise revenue opportunity."
      >
        <form onSubmit={handleCreateDeal} className="space-y-4">
          <NexaInput
            label="Deal Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 50-Seat Enterprise ERP Rollout"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NexaInput
              label="Company Name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Standard Chartered Bank VI"
              required
            />
            <NexaInput
              label="Value (₦)"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="e.g. ₦18,500,000"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NexaInput
              label="Contact Name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Babatunde Adeyemi"
            />
            <NexaInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@company.ng"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-medium"
            >
              <option value="LEAD">LEAD</option>
              <option value="QUALIFIED">QUALIFIED</option>
              <option value="PROPOSAL">PROPOSAL</option>
              <option value="NEGOTIATION">NEGOTIATION</option>
              <option value="WON">WON</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <NexaButton variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton variant="primary" type="submit">
              Save Opportunity
            </NexaButton>
          </div>
        </form>
      </NexaModal>
    </ErpAdminShell>
  );
}
