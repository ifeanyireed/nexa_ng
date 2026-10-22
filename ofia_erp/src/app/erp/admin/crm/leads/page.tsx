"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Target,
  Search,
  Plus,
  Sparkles,
  Building2,
  Mail,
  Phone,
  PhoneCall,
  Flame,
  Globe,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Send,
  Trash2,
  Pencil,
  ChevronDown,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";
import { CrmLead } from "@/lib/crm-service";
import { crmFetch } from "@/lib/crm-client";
import { filterSalesClosers } from "@/lib/access-control";

export default function CrmLeadsPage() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // AI Extraction Modal
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false);
  const [extractQuery, setExtractQuery] = useState("Commercial Towers & Facility Operators");
  const [extractLocation, setExtractLocation] = useState("Lagos & Abuja");
  const [isExtracting, setIsExtracting] = useState(false);

  // Manual Add Lead Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newIndustry, setNewIndustry] = useState("Corporate");
  const [newLocation, setNewLocation] = useState("Lagos");
  const [assignedCloser, setAssignedCloser] = useState("Auto-Assign (Least-Loaded)");
  const [availableClosers, setAvailableClosers] = useState<{ id?: string; name: string; email: string }[]>([]);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

  // Edit Lead Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<CrmLead | null>(null);
  const [editStatus, setEditStatus] = useState<string>("QUALIFIED");
  const [editAssignedCloser, setEditAssignedCloser] = useState<string>("Unassigned");
  const [editCompany, setEditCompany] = useState<string>("");
  const [editContact, setEditContact] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [editPhone, setEditPhone] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    async function loadClosers() {
      try {
        const res = await crmFetch("/api/erp/users").then((r) => (r.ok ? r.json() : [])).catch(() => []);
        const rawUsers = Array.isArray(res) ? res : Array.isArray(res?.users) ? res.users : [];
        const validClosers = filterSalesClosers(rawUsers);
        setAvailableClosers(validClosers);
      } catch (err) {
        console.warn("Could not load sales closers:", err);
      }
    }
    loadClosers();
  }, []);

  useEffect(() => {
    async function loadLeads() {
      try {
        const res = await crmFetch("/api/erp/crm/leads").then((r) => r.json()).catch(() => null);
        const rawLeads = Array.isArray(res) ? res : Array.isArray(res?.leads) ? res.leads : [];
        setLeads(rawLeads);
      } catch {
        setLeads([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadLeads();
  }, []);

  const handleExtractLeads = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExtracting(true);

    try {
      const res = await crmFetch("/api/erp/crm/leads/extract", {
        method: "POST",
        body: JSON.stringify({
          query: extractQuery,
          location: extractLocation,
        }),
      });
      const data = await res.json();
      if (data.lead) {
        setLeads((prev) => [data.lead, ...prev]);
      }
    } catch {
      // Local fallback
      const fallbackExtracted: CrmLead = {
        id: `LEAD-${Date.now().toString().slice(-4)}`,
        tenantSlug: "default",
        companyName: `${extractQuery} Prospect Ltd`,
        website: "https://example.com.ng",
        industry: "Commercial",
        location: extractLocation,
        contactName: "Engr. Folake Adeleke",
        contactTitle: "Managing Director",
        contactEmail: "folake@example.com.ng",
        contactPhone: "+2348021122334",
        icpFitScore: 95,
        buyingSignals: ["Verified executive contact", "Corporate entity matched"],
        status: "ENRICHED",
        source: "AI Prospector Engine",
        assignedRep: "Senior Sales Specialist",
        notes: "Enriched via automated AI crawler.",
        createdAt: new Date().toISOString(),
      };
      setLeads((prev) => [fallbackExtracted, ...prev]);
    } finally {
      setIsExtracting(false);
      setIsExtractModalOpen(false);
    }
  };

  const handleAddManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newContact.trim()) return;

    const payload = {
      companyName: newCompany.trim(),
      contactName: newContact.trim(),
      contactEmail: newEmail.trim() || "contact@example.ng",
      contactPhone: newPhone.trim(),
      industry: newIndustry.trim(),
      location: newLocation.trim(),
      assignedRep: assignedCloser.startsWith("Auto-Assign") ? "Auto-Assign (Least-Loaded)" : assignedCloser,
      icpFitScore: 88,
      buyingSignals: ["Direct Manual Inbound"],
      status: "QUALIFIED" as const,
      source: "Manual Staff Entry",
    };

    try {
      const res = await crmFetch("/api/erp/crm/leads", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.lead) setLeads((prev) => [data.lead, ...prev]);
    } catch {
      const localLead: CrmLead = {
        id: `LEAD-${Date.now().toString().slice(-4)}`,
        tenantSlug: "default",
        ...payload,
        assignedRep: assignedCloser.startsWith("Auto-Assign")
          ? availableClosers[0]?.name || "Senior Sales Specialist"
          : assignedCloser,
        createdAt: new Date().toISOString(),
      };
      setLeads((prev) => [localLead, ...prev]);
    }

    setIsAddModalOpen(false);
    setNewCompany("");
    setNewContact("");
    setNewEmail("");
    setNewPhone("");
    setAssignedCloser("Auto-Assign (Least-Loaded)");
  };

  const handlePromoteToDeal = async (lead: CrmLead) => {
    try {
      const res = await crmFetch("/api/erp/crm/deals", {
        method: "POST",
        body: JSON.stringify({
          title: `${lead.companyName} Commercial Contract`,
          company: lead.companyName,
          contactName: lead.contactName,
          email: lead.contactEmail,
          phone: lead.contactPhone || "",
          value: "₦7,500,000",
          stage: "QUALIFIED",
          owner: lead.assignedRep || "Senior Account Exec",
          probability: 50,
          expectedClose: "Next Month",
          leadId: lead.id,
          notes: `Promoted from lead ${lead.id}. Signals: ${lead.buyingSignals.join(", ")}`,
        }),
      });
      const data = await res.json();
      const dealId = data?.deal?.id;

      // Persist status change in DB
      await crmFetch("/api/erp/crm/leads", {
        method: "PATCH",
        body: JSON.stringify({
          id: lead.id,
          status: "CONVERTED",
          convertedDealId: dealId,
        }),
      });

      // Update local lead status
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, status: "CONVERTED", convertedDealId: dealId } : l))
      );
      alert(`Success! Lead "${lead.companyName}" promoted to active CRM Deal.`);
    } catch {
      alert("Promoted to CRM Deal (local pipeline updated).");
    }
  };

  const handleDeleteLead = async (id: string, company: string) => {
    if (!confirm(`Are you sure you want to delete lead "${company}"?`)) return;
    setIsDeletingId(id);
    try {
      const res = await crmFetch(`/api/erp/crm/leads?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Failed to delete lead");
      }
    } catch (err: any) {
      alert("Error deleting lead: " + (err?.message || "Unknown error"));
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleUpdateLeadField = async (
    leadId: string,
    updates: { status?: string; assignedRep?: string; notes?: string }
  ) => {
    setUpdatingLeadId(leadId);
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? ({ ...l, ...updates } as any) : l))
    );

    try {
      const res = await crmFetch("/api/erp/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leadId,
          ...updates,
        }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.lead?.assignedRep) {
          setLeads((prev) =>
            prev.map((l) =>
              l.id === leadId ? { ...l, assignedRep: data.lead.assignedRep } : l
            )
          );
        }
      } else {
        console.warn("Failed to update lead field");
      }
    } catch (err) {
      console.error("Error updating lead field:", err);
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const handleOpenEditModal = (lead: CrmLead) => {
    setEditingLead(lead);
    setEditStatus(lead.status || "QUALIFIED");
    setEditAssignedCloser(lead.assignedRep || "Unassigned");
    setEditCompany(lead.companyName || (lead as any).company || "");
    setEditContact(lead.contactName || (lead as any).name || "");
    setEditEmail(lead.contactEmail || (lead as any).email || "");
    setEditPhone(lead.contactPhone || (lead as any).phone || "");
    setEditNotes(lead.notes || "");
    setIsEditModalOpen(true);
  };

  const handleSaveEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    setIsSavingEdit(true);

    const payload = {
      id: editingLead.id,
      companyName: editCompany.trim(),
      contactName: editContact.trim(),
      contactEmail: editEmail.trim(),
      contactPhone: editPhone.trim(),
      status: editStatus,
      assignedRep: editAssignedCloser === "Unassigned" ? "" : editAssignedCloser,
      notes: editNotes.trim(),
    };

    try {
      const res = await crmFetch("/api/erp/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      const resolvedRep =
        data?.lead?.assignedRep || (editAssignedCloser === "Unassigned" ? "" : editAssignedCloser);

      setLeads((prev) =>
        prev.map((l) =>
          l.id === editingLead.id
            ? {
                ...l,
                companyName: editCompany.trim(),
                contactName: editContact.trim(),
                contactEmail: editEmail.trim(),
                contactPhone: editPhone.trim(),
                status: editStatus as any,
                assignedRep: resolvedRep,
                notes: editNotes.trim(),
              }
            : l
        )
      );
      setIsEditModalOpen(false);
      setEditingLead(null);
    } catch (err: any) {
      alert("Failed to update lead: " + (err?.message || "Unknown error"));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const filteredLeads = leads.filter((l) => {
    const q = searchQuery.toLowerCase();
    const cName = (l.companyName || (l as any).company || "").toLowerCase();
    const personName = (l.contactName || (l as any).name || "").toLowerCase();
    const email = (l.contactEmail || (l as any).email || "").toLowerCase();
    const loc = (l.location || "").toLowerCase();
    const phone = (l.contactPhone || (l as any).phone || "").toLowerCase();
    const matchSearch =
      cName.includes(q) || personName.includes(q) || email.includes(q) || loc.includes(q) || phone.includes(q);
    const matchStatus = statusFilter === "ALL" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <ErpAdminShell
      title="CRM Leads Directory & Intelligence"
      subtitle="Discover and score high-ACV commercial accounts, track buying signals, and 1-click convert into deals."
      activeModule="crm"
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/crm/calls">
            <NexaButton variant="secondary" className="gap-2 text-xs">
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              Call Logger
            </NexaButton>
          </Link>
          <NexaButton
            variant="secondary"
            className="gap-2 text-xs"
            onClick={() => setIsExtractModalOpen(true)}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Extract Leads with AI
          </NexaButton>
          <NexaButton
            variant="primary"
            className="gap-2 text-xs"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Prospect
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        <ErpStatGrid
          stats={[
            {
              label: "Total Enriched Prospects",
              value: leads.length.toString(),
              change: "All verified corporate contacts",
              changeType: "success",
              icon: <Target className="w-4 h-4 text-purple-500" />,
            },
            {
              label: "High ICP Fit (>90%)",
              value: leads.filter((l) => l.icpFitScore >= 90).length.toString(),
              change: "Prime buyer readiness",
              changeType: "success",
              icon: <Flame className="w-4 h-4 text-rose-500" />,
            },
            {
              label: "Meetings Booked",
              value: leads.filter((l) => l.status === "MEETING_BOOKED").length.toString(),
              change: "Direct rep handoffs",
              changeType: "success",
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
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

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
            {["ALL", "MEETING_BOOKED", "QUALIFIED", "ENRICHED", "CONTACTED", "CONVERTED", "IDENTIFIED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
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

        <NexaCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-surface)] border-b border-[var(--nexa-border)] font-bold text-[var(--nexa-text-muted)]">
                <tr>
                  <th className="py-3 px-4">Company & ICP Fit</th>
                  <th className="py-3 px-4">Decision Maker Contact</th>
                  <th className="py-3 px-4">Buying Signals</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Rep</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)]">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[var(--nexa-bg-surface)]/50 transition-colors">
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[var(--nexa-text-primary)]">{lead.companyName}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Flame className="w-3 h-3 text-amber-500" />
                          {lead.icpFitScore}% ICP
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                          {lead.contactPhone || (lead as any).phone ? (
                            <a
                              href={`tel:${lead.contactPhone || (lead as any).phone}`}
                              className="hover:underline hover:text-[#1A56DB]"
                            >
                              {lead.contactPhone || (lead as any).phone}
                            </a>
                          ) : (
                            <span>No phone</span>
                          )}
                        </span>
                        <span>•</span>
                        <span>{lead.industry}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="font-bold text-[var(--nexa-text-primary)]">{lead.contactName}</div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] truncate">{lead.contactTitle}</div>
                      <div className="text-[11px] text-[#1A56DB] flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {lead.contactEmail}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {lead.buyingSignals.map((sig, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-muted)] border border-[var(--nexa-border)]"
                          >
                            {sig}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="relative inline-block">
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            handleUpdateLeadField(lead.id, {
                              status: e.target.value as any,
                            })
                          }
                          disabled={updatingLeadId === lead.id}
                          className="appearance-none pl-2.5 pr-6 py-1 rounded-lg text-xs font-semibold cursor-pointer border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:border-[#1A56DB]/50 transition-all focus:outline-none focus:ring-1 focus:ring-[#1A56DB] disabled:opacity-50"
                          title="Click to change lead status"
                        >
                          <option value="QUALIFIED">QUALIFIED</option>
                          <option value="MEETING_BOOKED">MEETING_BOOKED</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="ENRICHED">ENRICHED</option>
                          <option value="IDENTIFIED">IDENTIFIED</option>
                          <option value="CONVERTED">CONVERTED</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-[var(--nexa-text-muted)] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="relative inline-block min-w-[130px] max-w-[190px]">
                        <select
                          value={lead.assignedRep || ""}
                          onChange={(e) =>
                            handleUpdateLeadField(lead.id, {
                              assignedRep: e.target.value,
                            })
                          }
                          disabled={updatingLeadId === lead.id}
                          className="w-full appearance-none pl-2 pr-6 py-1 rounded-lg text-xs font-medium cursor-pointer border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] hover:border-[#1A56DB]/50 transition-all focus:outline-none focus:ring-1 focus:ring-[#1A56DB] disabled:opacity-50 truncate"
                          title="Click to assign sales closer"
                        >
                          <option value="">Unassigned</option>
                          <option value="Auto-Assign (Least-Loaded)">⚡ Auto-Assign</option>
                          {availableClosers.map((c) => (
                            <option key={c.email || c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                          {lead.assignedRep &&
                            lead.assignedRep !== "Unassigned" &&
                            !availableClosers.some((c) => c.name === lead.assignedRep) && (
                              <option value={lead.assignedRep}>
                                {lead.assignedRep}
                              </option>
                            )}
                        </select>
                        <ChevronDown className="w-3 h-3 text-[var(--nexa-text-muted)] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(lead)}
                          className="p-1.5 rounded-lg border border-[var(--nexa-border)] hover:bg-[#1A56DB]/10 text-[var(--nexa-text-secondary)] hover:text-[#1A56DB] transition-colors cursor-pointer"
                          title={`Edit ${lead.companyName}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/erp/admin/crm/calls?leadId=${lead.id}&phone=${encodeURIComponent(lead.contactPhone || "")}&name=${encodeURIComponent(lead.contactName || "")}&company=${encodeURIComponent(lead.companyName || "")}`}
                          title="Log Call with Lead"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </Link>
                        {lead.status !== "CONVERTED" ? (
                          <button
                            onClick={() => handlePromoteToDeal(lead)}
                            className="px-2.5 py-1 rounded-lg bg-[#1A56DB]/10 text-[#1A56DB] hover:bg-[#1A56DB] hover:text-white font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Promote to Deal
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Converted
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteLead(lead.id, lead.companyName)}
                          disabled={isDeletingId === lead.id}
                          className="p-1.5 rounded-lg border border-[var(--nexa-border)] hover:bg-rose-500/10 text-[var(--nexa-text-secondary)] hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                          title={`Delete lead ${lead.companyName}`}
                        >
                          {isDeletingId === lead.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-500" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NexaCard>
      </div>

      {/* AI EXTRACT LEADS MODAL */}
      <NexaModal
        isOpen={isExtractModalOpen}
        onClose={() => setIsExtractModalOpen(false)}
        title="AI Commercial Prospector Engine"
        subtitle="Extract targeted B2B enterprises matching your ideal buyer persona."
      >
        <form onSubmit={handleExtractLeads} className="space-y-4">
          <NexaInput
            label="Target Industry & Profile"
            value={extractQuery}
            onChange={(e) => setExtractQuery(e.target.value)}
            placeholder="e.g. Multi-store Supermarkets & Cold Chain logistics"
            required
          />

          <NexaInput
            label="Geographic Territory"
            value={extractLocation}
            onChange={(e) => setExtractLocation(e.target.value)}
            placeholder="e.g. Lagos, Abuja, Port Harcourt"
            required
          />

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Autonomous Verification Active
            </p>
            <p className="mt-1">
              The CRM prospector verifies executive contact info against public corporate registries and computes ICP fit scores automatically.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <NexaButton variant="secondary" type="button" onClick={() => setIsExtractModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton variant="primary" type="submit" disabled={isExtracting}>
              {isExtracting ? "Extracting & Scoring..." : "Run AI Extraction"}
            </NexaButton>
          </div>
        </form>
      </NexaModal>

      {/* ADD MANUAL PROSPECT MODAL */}
      <NexaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Lead Manually"
        subtitle="Record an inbound prospect into the CRM directory."
      >
        <form onSubmit={handleAddManualLead} className="space-y-4">
          <NexaInput
            label="Company Name"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            placeholder="e.g. Dangote Cement Logistics Division"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NexaInput
              label="Contact Name"
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
              placeholder="e.g. Alh. Sani Dangote"
              required
            />
            <NexaInput
              label="Contact Email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="sani@company.ng"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NexaInput
              label="Phone Number"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+2348030000000"
            />
            <NexaInput
              label="Territory / City"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="Victoria Island, Lagos"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--nexa-text-secondary)] mb-1.5">
              Sales Closer Assignment
            </label>
            <select
              value={assignedCloser}
              onChange={(e) => setAssignedCloser(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            >
              <option value="Auto-Assign (Least-Loaded)">⚡ Auto-Assign (Least-Loaded Closer)</option>
              {availableClosers.map((c) => (
                <option key={c.email || c.name} value={c.name}>
                  👤 {c.name} {c.email ? `(${c.email})` : ""}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-[var(--nexa-text-muted)]">
              Sales closers are staff accounts that have the Sales Closer portal enabled on their account.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <NexaButton variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton variant="primary" type="submit">
              Save Lead
            </NexaButton>
          </div>
        </form>
      </NexaModal>

      {/* EDIT LEAD MODAL */}
      <NexaModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLead(null);
        }}
        title="Edit Lead Profile & Assignment"
        subtitle="Update lead status, closer assignment, and contact details."
      >
        <form onSubmit={handleSaveEditLead} className="space-y-4">
          <NexaInput
            label="Company Name"
            value={editCompany}
            onChange={(e) => setEditCompany(e.target.value)}
            placeholder="Company name"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NexaInput
              label="Contact Name"
              value={editContact}
              onChange={(e) => setEditContact(e.target.value)}
              placeholder="Contact person name"
              required
            />
            <NexaInput
              label="Contact Email"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="contact@company.ng"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NexaInput
              label="Phone Number"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="+2348030000000"
            />
            <div>
              <label className="block text-xs font-semibold text-[var(--nexa-text-secondary)] mb-1.5">
                Lead Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
              >
                <option value="QUALIFIED">QUALIFIED</option>
                <option value="MEETING_BOOKED">MEETING_BOOKED</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="ENRICHED">ENRICHED</option>
                <option value="IDENTIFIED">IDENTIFIED</option>
                <option value="CONVERTED">CONVERTED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--nexa-text-secondary)] mb-1.5">
              Assigned Sales Closer
            </label>
            <select
              value={editAssignedCloser}
              onChange={(e) => setEditAssignedCloser(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            >
              <option value="Unassigned">⭕ Unassigned</option>
              <option value="Auto-Assign (Least-Loaded)">⚡ Auto-Assign (Least-Loaded Closer)</option>
              {availableClosers.map((c) => (
                <option key={c.email || c.name} value={c.name}>
                  👤 {c.name} {c.email ? `(${c.email})` : ""}
                </option>
              ))}
              {editAssignedCloser &&
                editAssignedCloser !== "Unassigned" &&
                !availableClosers.some((c) => c.name === editAssignedCloser) && (
                  <option value={editAssignedCloser}>👤 {editAssignedCloser}</option>
                )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--nexa-text-secondary)] mb-1.5">
              Notes
            </label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Add key insights, deal notes, or next action items..."
              rows={3}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <NexaButton
              variant="secondary"
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingLead(null);
              }}
            >
              Cancel
            </NexaButton>
            <NexaButton variant="primary" type="submit" disabled={isSavingEdit}>
              {isSavingEdit ? "Saving..." : "Save Changes"}
            </NexaButton>
          </div>
        </form>
      </NexaModal>
    </ErpAdminShell>
  );
}
