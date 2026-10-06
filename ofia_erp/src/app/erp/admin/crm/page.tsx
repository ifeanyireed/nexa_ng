"use client";

import React, { useState, useEffect } from "react";
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
  Flame,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";
import {
  CrmDeal,
  CrmLead,
  CrmEmailBlast,
  CrmEmailList,
  CrmActivity,
  DEFAULT_CRM_DEALS,
  DEFAULT_CRM_LEADS,
  DEFAULT_CRM_BLASTS,
  DEFAULT_CRM_LISTS,
  DEFAULT_CRM_ACTIVITIES,
} from "@/lib/crm-service";

export default function CrmDashboardPage() {
  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [blasts, setBlasts] = useState<CrmEmailBlast[]>([]);
  const [lists, setLists] = useState<CrmEmailList[]>([]);
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Deal Modal
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [newDealTitle, setNewDealTitle] = useState("");
  const [newDealCompany, setNewDealCompany] = useState("");
  const [newDealContact, setNewDealContact] = useState("");
  const [newDealEmail, setNewDealEmail] = useState("");
  const [newDealPhone, setNewDealPhone] = useState("");
  const [newDealValue, setNewDealValue] = useState("₦5,000,000");
  const [newDealStage, setNewDealStage] = useState<CrmDeal["stage"]>("QUALIFIED");

  useEffect(() => {
    async function loadCrmData() {
      try {
        const [dealsRes, leadsRes, blastsRes, listsRes] = await Promise.all([
          fetch("/api/erp/crm/deals").then((r) => r.json()).catch(() => null),
          fetch("/api/erp/crm/leads").then((r) => r.json()).catch(() => null),
          fetch("/api/erp/crm/blasts").then((r) => r.json()).catch(() => null),
          fetch("/api/erp/crm/lists").then((r) => r.json()).catch(() => null),
        ]);

        if (dealsRes?.deals) setDeals(dealsRes.deals);
        else setDeals(DEFAULT_CRM_DEALS.map((d) => ({ ...d, tenantSlug: "default" })));

        if (leadsRes?.leads) setLeads(leadsRes.leads);
        else setLeads(DEFAULT_CRM_LEADS.map((l) => ({ ...l, tenantSlug: "default" })));

        if (blastsRes?.blasts) setBlasts(blastsRes.blasts);
        else setBlasts(DEFAULT_CRM_BLASTS.map((b) => ({ ...b, tenantSlug: "default" })));

        if (listsRes?.lists) setLists(listsRes.lists);
        else setLists(DEFAULT_CRM_LISTS.map((l) => ({ ...l, tenantSlug: "default" })));

        setActivities(DEFAULT_CRM_ACTIVITIES.map((a) => ({ ...a, tenantSlug: "default" })));
      } catch (err) {
        console.warn("Using offline CRM state:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCrmData();
  }, []);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealTitle.trim() || !newDealCompany.trim()) return;

    try {
      const res = await fetch("/api/erp/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newDealTitle.trim(),
          company: newDealCompany.trim(),
          contactName: newDealContact.trim() || "Decision Maker",
          email: newDealEmail.trim(),
          phone: newDealPhone.trim(),
          value: newDealValue.trim(),
          stage: newDealStage,
          owner: "Chioma Okon (Growth Marketer)",
          probability: newDealStage === "WON" ? 100 : newDealStage === "NEGOTIATION" ? 80 : 50,
          expectedClose: "Next Month",
        }),
      });
      const data = await res.json();
      if (data.deal) {
        setDeals((prev) => [data.deal, ...prev]);
      }
    } catch {
      // Local fallback
      const localDeal: CrmDeal = {
        id: `DEAL-${Date.now().toString().slice(-4)}`,
        tenantSlug: "default",
        title: newDealTitle,
        company: newDealCompany,
        contactName: newDealContact || "Decision Maker",
        email: newDealEmail,
        phone: newDealPhone,
        value: newDealValue,
        stage: newDealStage,
        owner: "Chioma Okon",
        probability: 60,
        expectedClose: "Nov 30, 2026",
        createdAt: new Date().toISOString(),
      };
      setDeals((prev) => [localDeal, ...prev]);
    }

    setIsDealModalOpen(false);
    setNewDealTitle("");
    setNewDealCompany("");
    setNewDealContact("");
    setNewDealEmail("");
    setNewDealPhone("");
  };

  const wonDeals = deals.filter((d) => d.stage === "WON");
  const openDeals = deals.filter((d) => d.stage !== "WON" && d.stage !== "LOST");

  return (
    <ErpAdminShell
      title="CRM & Email Marketing Command Center"
      subtitle="B2B sales pipelines, contact intelligence, audience segmentation, and scheduled email blast engine in one synchronized workspace."
      activeModule="crm"
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/crm/marketing">
            <NexaButton variant="secondary" className="gap-2 text-xs">
              <Send className="w-3.5 h-3.5" />
              Schedule Blast
            </NexaButton>
          </Link>
          <NexaButton
            variant="primary"
            className="gap-2 text-xs"
            onClick={() => setIsDealModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            New Deal
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI CARDS */}
        <ErpStatGrid
          stats={[
            {
              label: "Active Pipeline Value",
              value: "₦38.9M",
              change: "+24.5% vs last month",
              changeType: "success",
              icon: <DollarSign className="w-4 h-4 text-emerald-500" />,
            },
            {
              label: "Open Deal Opportunities",
              value: openDeals.length.toString(),
              change: `${wonDeals.length} won this quarter`,
              changeType: "success",
              icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
            },
            {
              label: "Enriched B2B Leads",
              value: leads.length.toString(),
              change: "100% ICP Scored",
              changeType: "success",
              icon: <Users className="w-4 h-4 text-purple-500" />,
            },
            {
              label: "Email Marketing Blasts",
              value: blasts.length.toString(),
              change: "59.1% avg open rate",
              changeType: "success",
              icon: <Mail className="w-4 h-4 text-pink-500" />,
            },
          ]}
        />

        {/* QUICK NAVIGATION MODULE TILES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/erp/admin/crm/pipeline">
            <NexaCard className="p-4 hover:border-[#1A56DB] transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-xs text-[var(--nexa-text-muted)] group-hover:text-[#1A56DB] flex items-center gap-1 font-bold">
                  View <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-[var(--nexa-text-primary)] mt-3">Deals Pipeline</h4>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-1">Kanban stage tracker with probability weights.</p>
            </NexaCard>
          </Link>

          <Link href="/erp/admin/crm/leads">
            <NexaCard className="p-4 hover:border-[#1A56DB] transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-xs text-[var(--nexa-text-muted)] group-hover:text-[#1A56DB] flex items-center gap-1 font-bold">
                  View <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-[var(--nexa-text-primary)] mt-3">Leads Directory</h4>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-1">AI-enriched prospects & buying signal detection.</p>
            </NexaCard>
          </Link>

          <Link href="/erp/admin/crm/marketing">
            <NexaCard className="p-4 hover:border-[#1A56DB] transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center font-bold">
                  <Send className="w-5 h-5" />
                </div>
                <span className="text-xs text-[var(--nexa-text-muted)] group-hover:text-[#1A56DB] flex items-center gap-1 font-bold">
                  View <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-[var(--nexa-text-primary)] mt-3">Email Marketing</h4>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-1">Schedule blasts, merge tags & delivery analytics.</p>
            </NexaCard>
          </Link>

          <Link href="/erp/admin/crm/lists">
            <NexaCard className="p-4 hover:border-[#1A56DB] transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs text-[var(--nexa-text-muted)] group-hover:text-[#1A56DB] flex items-center gap-1 font-bold">
                  View <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-[var(--nexa-text-primary)] mt-3">Audience Lists</h4>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-1">Segment subscribers by niche, size & tier.</p>
            </NexaCard>
          </Link>
        </div>

        {/* ACTIVE DEALS PIPELINE OVERVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">High-Priority Deals Pipeline</h3>
                <p className="text-xs text-[var(--nexa-text-muted)]">Commercial negotiations closing within the next 30 days.</p>
              </div>
              <Link href="/erp/admin/crm/pipeline" className="text-xs text-[#1A56DB] font-bold hover:underline flex items-center gap-1">
                Full Kanban Pipeline <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {deals.slice(0, 4).map((deal) => (
                <NexaCard key={deal.id} className="p-4 hover:border-[#1A56DB]/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[var(--nexa-text-muted)]">{deal.id}</span>
                        <h4 className="text-sm font-extrabold text-[var(--nexa-text-primary)]">{deal.title}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--nexa-text-muted)]">
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {deal.company}</span>
                        <span>•</span>
                        <span>{deal.contactName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-[#1A56DB]">{deal.value}</div>
                        <div className="text-[10px] text-[var(--nexa-text-muted)]">{deal.probability}% win probability</div>
                      </div>
                      <NexaBadge
                        variant={
                          deal.stage === "WON"
                            ? "success"
                            : deal.stage === "NEGOTIATION"
                            ? "warning"
                            : "brand"
                        }
                      >
                        {deal.stage}
                      </NexaBadge>
                    </div>
                  </div>
                </NexaCard>
              ))}
            </div>
          </div>

          {/* SCHEDULED EMAIL BLASTS & DISPATCH RADAR */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">Email Blasts & Outreach</h3>
                <p className="text-xs text-[var(--nexa-text-muted)]">Live delivery & engagement feed.</p>
              </div>
              <Link href="/erp/admin/crm/marketing" className="text-xs text-[#1A56DB] font-bold hover:underline flex items-center gap-1">
                All Blasts <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {blasts.map((blast) => (
                <NexaCard key={blast.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <NexaBadge
                      variant={blast.status === "SENT" ? "success" : blast.status === "SCHEDULED" ? "warning" : "neutral"}
                    >
                      {blast.status}
                    </NexaBadge>
                    <span className="text-[11px] text-[var(--nexa-text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {blast.scheduledAt ? new Date(blast.scheduledAt).toLocaleDateString() : "Draft"}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-[var(--nexa-text-primary)] line-clamp-1">{blast.subject}</h5>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] line-clamp-1 mt-0.5">{blast.title}</p>
                  </div>

                  <div className="pt-2 border-t border-[var(--nexa-border)] flex items-center justify-between text-[11px]">
                    <span className="text-[var(--nexa-text-muted)]">
                      {blast.totalRecipients} recipients
                    </span>
                    {blast.status === "SENT" ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {blast.openCount} opens ({(blast.openCount / (blast.totalRecipients || 1) * 100).toFixed(0)}%)
                      </span>
                    ) : (
                      <span className="text-[var(--nexa-text-muted)]">Queued</span>
                    )}
                  </div>
                </NexaCard>
              ))}
            </div>

            {/* UPCOMING ACTIVITIES */}
            <div className="pt-4 space-y-3">
              <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">Upcoming Sales Calls & Demos</h3>
              {activities.slice(0, 2).map((act) => (
                <div key={act.id} className="p-3 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[var(--nexa-text-primary)]">{act.title}</p>
                    <p className="text-[10px] text-[var(--nexa-text-muted)]">{act.company} • {act.rep}</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#1A56DB] bg-[#1A56DB]/10 px-2 py-0.5 rounded-full">
                    {act.dateTime}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE DEAL MODAL */}
      <NexaModal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        title="Create New Commercial Opportunity"
        subtitle="Record high-ACV pipeline deals, contact stakeholders, and expected revenue."
      >
        <form onSubmit={handleCreateDeal} className="space-y-4">
          <NexaInput
            label="Deal Title"
            value={newDealTitle}
            onChange={(e) => setNewDealTitle(e.target.value)}
            placeholder="e.g. 20kVA Solar Hybrid + CCTV Surveillance"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NexaInput
              label="Company Name"
              value={newDealCompany}
              onChange={(e) => setNewDealCompany(e.target.value)}
              placeholder="e.g. Flour Mills of Nigeria"
              required
            />
            <NexaInput
              label="Deal Value (₦)"
              value={newDealValue}
              onChange={(e) => setNewDealValue(e.target.value)}
              placeholder="e.g. ₦12,500,000"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NexaInput
              label="Key Contact Name"
              value={newDealContact}
              onChange={(e) => setNewDealContact(e.target.value)}
              placeholder="e.g. Babatunde Adeyemi"
            />
            <NexaInput
              label="Contact Email"
              type="email"
              value={newDealEmail}
              onChange={(e) => setNewDealEmail(e.target.value)}
              placeholder="contact@company.ng"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">Pipeline Stage</label>
            <select
              value={newDealStage}
              onChange={(e) => setNewDealStage(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-medium"
            >
              <option value="LEAD">LEAD (Initial Discovery)</option>
              <option value="QUALIFIED">QUALIFIED (Requirements Mapped)</option>
              <option value="PROPOSAL">PROPOSAL (SLA Dispatched)</option>
              <option value="NEGOTIATION">NEGOTIATION (Legal / Escrow Review)</option>
              <option value="WON">WON (Contract Executed)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <NexaButton variant="secondary" type="button" onClick={() => setIsDealModalOpen(false)}>
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
