"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  Flame,
  Mail,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Store,
  TrendingUp,
  UserCheck,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge, NexaBadgeVariant } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";
import { WaitlistLeadItem } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const NIGERIAN_STATES = [
  "ALL",
  "Lagos",
  "Abuja FCT",
  "Rivers",
  "Kano",
  "Oyo",
  "Enugu",
  "Delta",
  "Anambra",
  "Ogun",
  "Kaduna",
];

const EXHAUSTIVE_BUSINESS_TYPES = [
  "ALL",
  "Retail Store / Supermarket / Minimart",
  "Fashion Boutique, Tailoring & Luxury Fabrics",
  "Solar, Inverter & Renewable Energy Systems",
  "Automotive Dealership, Garage & Spare Parts",
  "Pharmacy, Clinic, Hospital & Diagnostic Lab",
  "Logistics, Courier, Freight Haulage & Dispatch",
  "Restaurant, Lounge, Bakery & Cloud Kitchen",
  "Real Estate, Property Management & Facility Fitout",
  "Legal Firm, Accounting & Management Advisory",
  "Building Materials, Civil Engineering & Construction",
  "Software, IT Infrastructure, Telecoms & SaaS",
  "Education, Primary/Secondary School & Academy",
  "Events Planning, Hall Rental, Sound & Stage Lighting",
  "Beauty Salon, Spa Wellness, Barbershop & Cosmetics",
  "Agriculture, Poultry, Grain & Commodity Trading",
  "Manufacturing, Food Packaging & FMCG Factory",
  "Printing, Publishing & Corporate Branding",
  "Security Systems, AI Surveillance & CCTV Engineering",
  "Cleaning, Facility Fumigation & Janitorial Services",
  "Travel Agency, Tour Operator & Visa Advisory",
];

const EXHAUSTIVE_TOOL_TYPES = [
  "ALL",
  "Multiple Cuisines, Restaurant & Cloud Kitchen Suite",
  "Hospital, Clinic & Healthcare Management Suite",
  "Hotel, Resort & Hospitality Management Suite",
  "Pharmacy, Drugs & Prescription Dispensary Suite",
  "School, College & Academy Management Suite",
  "Real Estate, Facility & Tenant Management Suite",
  "Logistics, Haulage & Waybill Fleet Suite",
  "Solar, Inverter & Renewable Energy Field Suite",
  "Supermarket, Wholesale & Multi-Warehouse IMS Suite",
  "Automotive Garage, Dealership & Spare Parts Suite",
  "Law Firm, Legal Practice & Retainer Suite",
  "Event Center, Hall Rental & Sound Stage Suite",
  "Beauty Salon, Spa Wellness & Barbershop Suite",
  "Autonomous AI Outreach & SDR Marketing Swarm",
  "Multi-Store POS & Real-Time Cashier Registers",
  "Milestone Escrow & Automated Direct Invoicing",
  "Double-Entry Accounting & Charts of Accounts",
  "HR Roster, Staff Payroll, Attendance & KPI Appraisals",
  "WhatsApp Meta Cloud API CRM & Live Automation",
  "B2B Sales Pipelines, Deal Stages & Lead Tracking",
  "E-Commerce Shopping Cart, Paystack & Order Desk",
  "Field Service Dispatch, Quotations & Technician App",
];

const ROLES = ["ALL", "MERCHANT", "SERVICE_PRO", "ENTERPRISE", "CONSUMER"];
const STATUSES = ["ALL", "PENDING", "QUALIFIED", "INVITED", "ONBOARDED", "REJECTED"];

export default function WaitlistCRMPage() {
  const [leads, setLeads] = useState<WaitlistLeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedBusinessType, setSelectedBusinessType] = useState("ALL");
  const [selectedToolType, setSelectedToolType] = useState("ALL");
  const [selectedState, setSelectedState] = useState("ALL");

  // Lead Detail Drawer State
  const [activeLead, setActiveLead] = useState<WaitlistLeadItem | null>(null);
  const [activeNotes, setActiveNotes] = useState("");
  const [updatingLead, setUpdatingLead] = useState(false);

  // Manual Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalFullName, setModalFullName] = useState("");
  const [modalBusinessName, setModalBusinessName] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalRole, setModalRole] = useState<any>("MERCHANT");
  const [modalBusinessType, setModalBusinessType] = useState(EXHAUSTIVE_BUSINESS_TYPES[1]);
  const [modalCustomBusinessType, setModalCustomBusinessType] = useState("");
  const [modalToolType, setModalToolType] = useState(EXHAUSTIVE_TOOL_TYPES[1]);
  const [modalCustomToolType, setModalCustomToolType] = useState("");
  const [modalState, setModalState] = useState("Lagos");
  const [modalCity, setModalCity] = useState("");
  const [modalStatus, setModalStatus] = useState<any>("QUALIFIED");
  const [creatingLead, setCreatingLead] = useState(false);

  // Toast / Feedback message
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedRole !== "ALL") params.set("role", selectedRole);
      if (selectedBusinessType !== "ALL") params.set("businessType", selectedBusinessType);
      if (selectedToolType !== "ALL") params.set("toolType", selectedToolType);
      if (selectedState !== "ALL") params.set("state", selectedState);

      const res = await fetch(`/api/crm/waitlist?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error("Failed to fetch CRM leads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [selectedStatus, selectedRole, selectedBusinessType, selectedToolType, selectedState]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchLeads();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleOpenDrawer = (lead: WaitlistLeadItem) => {
    setActiveLead(lead);
    setActiveNotes(lead.notes || "");
  };

  const handleCloseDrawer = () => {
    setActiveLead(null);
  };

  const handleUpdateStatus = async (
    leadId: string,
    newStatus: string,
    generateInvite: boolean = false
  ) => {
    setUpdatingLead(true);
    try {
      const res = await fetch(`/api/crm/waitlist/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: activeNotes,
          generateInviteCode: generateInvite,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setLeads((prev) =>
          prev.map((item) => (item.id === leadId ? updated : item))
        );
        if (activeLead && activeLead.id === leadId) {
          setActiveLead(updated);
        }
        setFeedbackMessage(`Updated ${updated.businessName} to ${newStatus}`);
        setTimeout(() => setFeedbackMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdatingLead(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!activeLead) return;
    setUpdatingLead(true);
    try {
      const res = await fetch(`/api/crm/waitlist/${activeLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: activeNotes,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setLeads((prev) =>
          prev.map((item) => (item.id === activeLead.id ? updated : item))
        );
        setActiveLead(updated);
        setFeedbackMessage("Admin notes saved successfully");
        setTimeout(() => setFeedbackMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to save notes", err);
    } finally {
      setUpdatingLead(false);
    }
  };

  const handleAddLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalFullName || !modalBusinessName || !modalEmail || !modalPhone) return;

    setCreatingLead(true);
    try {
      const resolvedBiz = modalCustomBusinessType.trim() || modalBusinessType;
      const resolvedTool = modalCustomToolType.trim() || modalToolType;

      const res = await fetch("/api/crm/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: modalFullName,
          businessName: modalBusinessName,
          email: modalEmail,
          phone: modalPhone,
          role: modalRole,
          businessType: resolvedBiz,
          toolType: resolvedTool,
          customBusinessType: modalCustomBusinessType,
          customToolType: modalCustomToolType,
          state: modalState,
          city: modalCity,
          status: modalStatus,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setModalFullName("");
        setModalBusinessName("");
        setModalEmail("");
        setModalPhone("");
        setModalCustomBusinessType("");
        setModalCustomToolType("");
        fetchLeads();
        setFeedbackMessage("Lead added directly to waitlist pipeline");
        setTimeout(() => setFeedbackMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to add lead", err);
    } finally {
      setCreatingLead(false);
    }
  };

  const getStatusBadgeVariant = (status: string): NexaBadgeVariant => {
    switch (status) {
      case "QUALIFIED":
        return "success";
      case "INVITED":
        return "brand";
      case "ONBOARDED":
        return "purple";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "danger";
      default:
        return "neutral";
    }
  };

  return (
    <SuperAdminShell
      title="Platform Waitlist & Growth CRM"
      subtitle="Direct CRM pipeline managing incoming Nigerian merchants, service technicians, and enterprise partners requesting early VIP access."
      action={
        <div className="flex items-center gap-2.5">
          <a href="/api/crm/waitlist/export" download>
            <NexaButton
              size="sm"
              variant="outline"
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV
            </NexaButton>
          </a>
          <NexaButton
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#1A56DB] text-white hover:bg-[#1545B0] shadow-sm cursor-pointer"
          >
            Add Inbound Lead
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        {/* TOAST FEEDBACK NOTIFICATION */}
        {feedbackMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{feedbackMessage}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* EXECUTIVE KPI BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Waitlist Signups */}
          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#1A56DB]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Total Waitlist Signups</span>
              <Users className="w-4 h-4 text-[#1A56DB]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              2,848 Leads
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#0E9F6E] font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% Week-over-Week</span>
            </div>
          </NexaCard>

          {/* Pro Merchants & Storefronts */}
          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#0E9F6E]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Verified Pro & Enterprise</span>
              <Store className="w-4 h-4 text-[#0E9F6E]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              1,642 Businesses
            </div>
            <div className="text-[11px] text-[#0E9F6E] font-semibold">
              57.6% of entire waitlist pool
            </div>
          </NexaCard>

          {/* Wave 1 VIP Invites Sent */}
          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#7E22CE]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Wave 1 VIP Invites</span>
              <Sparkles className="w-4 h-4 text-[#7E22CE]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              414 Dispatched
            </div>
            <div className="text-[11px] text-[#7E22CE] font-semibold">
              14.5% Early Activation Rate
            </div>
          </NexaCard>

          {/* Regional Hubs */}
          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#C88A3A]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Top Regional Cluster</span>
              <MapPin className="w-4 h-4 text-[#C88A3A]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              Lagos (46%)
            </div>
            <div className="text-[11px] text-[var(--nexa-text-muted)] font-semibold">
              Followed by Abuja (22%) & Rivers (14%)
            </div>
          </NexaCard>
        </div>

        {/* SEARCH & MULTI-FILTER TOOLBAR */}
        <NexaCard variant="glass" padding="sm">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search applicant, business type, requested tool, phone, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] transition-all placeholder:text-[var(--nexa-text-faint)]"
              />
            </div>

            {/* Filter Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs font-semibold text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                {STATUSES.filter((s) => s !== "ALL").map((s) => (
                  <option key={s} value={s}>
                    Status: {s}
                  </option>
                ))}
              </select>

              {/* Role Filter */}
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs font-semibold text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                {ROLES.filter((r) => r !== "ALL").map((r) => (
                  <option key={r} value={r}>
                    Role: {r}
                  </option>
                ))}
              </select>

              {/* Business Type Filter */}
              <select
                value={selectedBusinessType}
                onChange={(e) => setSelectedBusinessType(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs font-semibold text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] cursor-pointer max-w-[170px] truncate"
              >
                <option value="ALL">All Business Types</option>
                {EXHAUSTIVE_BUSINESS_TYPES.filter((n) => n !== "ALL").map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              {/* Tool Type Filter */}
              <select
                value={selectedToolType}
                onChange={(e) => setSelectedToolType(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs font-semibold text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] cursor-pointer max-w-[170px] truncate"
              >
                <option value="ALL">All Tools of Interest</option>
                {EXHAUSTIVE_TOOL_TYPES.filter((t) => t !== "ALL").map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {/* State Filter */}
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs font-semibold text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] cursor-pointer"
              >
                <option value="ALL">All States</option>
                {NIGERIAN_STATES.filter((st) => st !== "ALL").map((st) => (
                  <option key={st} value={st}>
                    State: {st}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={fetchLeads}
                className="h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:text-[#1A56DB] flex items-center justify-center transition-colors cursor-pointer"
                title="Refresh Table"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              </button>
            </div>
          </div>
        </NexaCard>

        {/* LEADS CRM PIPELINE TABLE */}
        <div className="rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Queue & Applicant</th>
                  <th className="py-3.5 px-4">Business & Location</th>
                  <th className="py-3.5 px-3">Category & Tool of Interest</th>
                  <th className="py-3.5 px-3">Direct Contact</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">VIP Code</th>
                  <th className="py-3.5 px-4 text-right">CRM Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
                {leads.length > 0 ? (
                  leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDrawer(lead)}
                    >
                      {/* Queue & Applicant */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md bg-[#1A56DB]/10 text-[#1A56DB] border border-[#1A56DB]/20">
                            #{lead.queueNumber}
                          </span>
                          <div>
                            <div className="font-bold text-xs text-[var(--nexa-text-primary)]">
                              {lead.fullName}
                            </div>
                            <div className="text-[10px] font-mono text-[var(--nexa-text-muted)]">
                              Code: {lead.referralCode}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Business & Location */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold">{lead.businessName}</div>
                        <div className="flex items-center gap-1 text-[10px] text-[var(--nexa-text-muted)] mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                          <span>
                            {lead.city ? `${lead.city}, ` : ""}
                            {lead.state}
                          </span>
                        </div>
                      </td>

                      {/* Category & Tool of Interest */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-1 items-start max-w-[220px]">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate w-full">
                            {lead.businessType || lead.niche}
                          </span>
                          <span className="text-[10px] text-[#1A56DB] font-semibold truncate w-full" title={lead.toolType || (lead.featuresInterest && lead.featuresInterest[0])}>
                            {lead.toolType || (lead.featuresInterest && lead.featuresInterest[0]) || "General Suite"}
                          </span>
                        </div>
                      </td>

                      {/* Direct Contact (with WhatsApp Link) */}
                      <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              `Hello ${lead.fullName}, this is the Ofia Executive Onboarding team regarding your VIP waitlist spot (#OFIA-${lead.queueNumber}) for ${lead.businessName}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                            title="Direct WhatsApp Chat"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`mailto:${lead.email}?subject=${encodeURIComponent(
                              `Your VIP Early Access to Ofia Business OS (#OFIA-${lead.queueNumber})`
                            )}`}
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#1A56DB] hover:bg-blue-100 transition-colors"
                            title="Send Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                          <span className="text-[11px] font-mono text-[var(--nexa-text-muted)] truncate max-w-[110px]">
                            {lead.phone}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <NexaBadge variant={getStatusBadgeVariant(lead.status)}>
                          {lead.status}
                        </NexaBadge>
                      </td>

                      {/* VIP Code */}
                      <td className="py-3.5 px-3">
                        {lead.inviteCode ? (
                          <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            {lead.inviteCode}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[var(--nexa-text-faint)] italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.status !== "INVITED" && lead.status !== "ONBOARDED" ? (
                            <NexaButton
                              size="sm"
                              variant="outline"
                              leftIcon={<Send className="w-3 h-3 text-[#1A56DB]" />}
                              onClick={() => handleUpdateStatus(lead.id, "INVITED", true)}
                              className="text-[10px] h-7 px-2.5 border-[#1A56DB]/30 text-[#1A56DB] hover:bg-[#1A56DB]/10 cursor-pointer"
                            >
                              Invite
                            </NexaButton>
                          ) : (
                            <NexaButton
                              size="sm"
                              variant="secondary"
                              leftIcon={<BadgeCheck className="w-3 h-3 text-emerald-600" />}
                              onClick={() => handleOpenDrawer(lead)}
                              className="text-[10px] h-7 px-2.5 cursor-pointer"
                            >
                              Invited
                            </NexaButton>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(lead)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Inspect Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <div className="font-bold text-xs">No waitlist leads found</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Try adjusting your search criteria or filter options.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SLIDE-OVER LEAD DETAIL INSPECTION DRAWER */}
      {activeLead && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={handleCloseDrawer}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-lg bg-[var(--nexa-bg-surface)] h-full shadow-2xl border-l border-[var(--nexa-border)] flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-[var(--nexa-border)] flex items-center justify-between bg-[var(--nexa-bg-base)]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-[#1A56DB] text-white">
                    #OFIA-{activeLead.queueNumber}
                  </span>
                  <NexaBadge variant={getStatusBadgeVariant(activeLead.status)}>
                    {activeLead.status}
                  </NexaBadge>
                </div>
                <h3 className="text-base font-black text-[var(--nexa-text-primary)] mt-1.5">
                  {activeLead.businessName}
                </h3>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="w-8 h-8 rounded-full bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-left">
              {/* Quick Communication Actions */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/${activeLead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Hello ${activeLead.fullName}, this is the Ofia Executive Onboarding team regarding your VIP waitlist spot (#OFIA-${activeLead.queueNumber}) for ${activeLead.businessName}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Chat</span>
                </a>
                <a
                  href={`mailto:${activeLead.email}?subject=${encodeURIComponent(
                    `Your VIP Early Access to Ofia Business OS (#OFIA-${activeLead.queueNumber})`
                  )}`}
                  className="p-3 rounded-xl bg-[#1A56DB] hover:bg-[#1545B0] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Mail className="w-4 h-4" />
                  <span>Direct Email</span>
                </a>
              </div>

              {/* Dossier Information Grid */}
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--nexa-text-muted)] block">
                  Lead Profile & Dossier
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] block">
                      Lead Contact
                    </span>
                    <span className="font-bold text-[var(--nexa-text-primary)]">
                      {activeLead.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] block">
                      Email Address
                    </span>
                    <span className="font-bold text-[var(--nexa-text-primary)] truncate block">
                      {activeLead.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] block">
                      Phone Number
                    </span>
                    <span className="font-bold font-mono text-[var(--nexa-text-primary)]">
                      {activeLead.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] block">
                      Location
                    </span>
                    <span className="font-bold text-[var(--nexa-text-primary)]">
                      {activeLead.city ? `${activeLead.city}, ` : ""}
                      {activeLead.state}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] block">
                      Role Persona
                    </span>
                    <span className="font-bold text-[var(--nexa-text-primary)]">
                      {activeLead.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] block">
                      Business Type / Industry
                    </span>
                    <span className="font-bold text-[#1A56DB] block truncate" title={activeLead.businessType || activeLead.niche}>
                      {activeLead.businessType || activeLead.niche}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-[var(--nexa-text-muted)] block">
                      Primary Tool of Interest
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {activeLead.toolType || (activeLead.featuresInterest && activeLead.featuresInterest[0]) || "Full Ecosystem"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] block">
                      Referral Code
                    </span>
                    <span className="font-mono font-bold text-[var(--nexa-text-primary)]">
                      {activeLead.referralCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] block">
                      Registration Date
                    </span>
                    <span className="font-mono text-[10px] text-[var(--nexa-text-muted)]">
                      {new Date(activeLead.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Invite Code Controls */}
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--nexa-text-muted)] block">
                  Status & Invite Token Lifecycle
                </span>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-[var(--nexa-text-muted)] mb-1">
                      Lead Pipeline Stage:
                    </label>
                    <select
                      value={activeLead.status}
                      onChange={(e) =>
                        handleUpdateStatus(activeLead.id, e.target.value, false)
                      }
                      className="w-full h-10 px-3 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-xs font-bold text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] cursor-pointer"
                    >
                      {STATUSES.filter((s) => s !== "ALL").map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[var(--nexa-text-muted)] mb-1">
                      VIP Token:
                    </label>
                    <NexaButton
                      size="sm"
                      variant="primary"
                      onClick={() =>
                        handleUpdateStatus(activeLead.id, "INVITED", true)
                      }
                      className="h-10 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                    >
                      {activeLead.inviteCode ? "Re-issue Code" : "Generate Token"}
                    </NexaButton>
                  </div>
                </div>

                {activeLead.inviteCode && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-extrabold flex items-center justify-between">
                    <span>Token: {activeLead.inviteCode}</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-600">
                      Active
                    </span>
                  </div>
                )}
              </div>

              {/* Internal Admin Notes */}
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--nexa-text-muted)] block">
                  Internal CRM Notes & Log
                </span>
                <textarea
                  rows={3}
                  placeholder="Add notes about merchant requirements, follow-up calls, or custom terms..."
                  value={activeNotes}
                  onChange={(e) => setActiveNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] transition-all placeholder:text-[var(--nexa-text-faint)]"
                />
                <div className="flex justify-end">
                  <NexaButton
                    size="sm"
                    variant="primary"
                    disabled={updatingLead}
                    onClick={handleSaveNotes}
                    className="bg-[#1A56DB] text-white hover:bg-[#1545B0] cursor-pointer"
                  >
                    {updatingLead ? "Saving..." : "Save Notes"}
                  </NexaButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL ADD LEAD MODAL */}
      <NexaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Inbound Prospect Lead"
        subtitle="Manually register an inbound partner, corporate account, or merchant onto the Ofia waitlist pipeline."
      >
        <form onSubmit={handleAddLeadSubmit} className="space-y-4 text-xs text-left">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Chief Femi Johnson"
                value={modalFullName}
                onChange={(e) => setModalFullName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB]"
              />
            </div>
            <div>
              <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                Business Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lekki Phase 1 Association"
                value={modalBusinessName}
                onChange={(e) => setModalBusinessName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                Work Email *
              </label>
              <input
                type="email"
                required
                placeholder="femi.j@lekkiphase1.ng"
                value={modalEmail}
                onChange={(e) => setModalEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB]"
              />
            </div>
            <div>
              <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                WhatsApp Phone *
              </label>
              <input
                type="tel"
                required
                placeholder="+234 803 777 6655"
                value={modalPhone}
                onChange={(e) => setModalPhone(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB]"
              />
            </div>
          </div>

          {/* Business Type Dropdown + Free text */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[var(--nexa-text-primary)]">
              Business Type / Industry Category
            </label>
            <select
              value={modalBusinessType}
              onChange={(e) => setModalBusinessType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] cursor-pointer"
            >
              {EXHAUSTIVE_BUSINESS_TYPES.filter((b) => b !== "ALL").map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or specify custom business niche / category..."
              value={modalCustomBusinessType}
              onChange={(e) => setModalCustomBusinessType(e.target.value)}
              className="w-full h-8 px-3 rounded-lg bg-[var(--nexa-bg-surface)] border border-dashed border-[var(--nexa-border)] text-[11px] text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] placeholder:italic"
            />
          </div>

          {/* Tool Type Dropdown + Free text */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[var(--nexa-text-primary)]">
              Tool of Interest
            </label>
            <select
              value={modalToolType}
              onChange={(e) => setModalToolType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] cursor-pointer"
            >
              {EXHAUSTIVE_TOOL_TYPES.filter((t) => t !== "ALL").map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or specify custom tool / module..."
              value={modalCustomToolType}
              onChange={(e) => setModalCustomToolType(e.target.value)}
              className="w-full h-8 px-3 rounded-lg bg-[var(--nexa-bg-surface)] border border-dashed border-[var(--nexa-border)] text-[11px] text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] placeholder:italic"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                Role Persona
              </label>
              <select
                value={modalRole}
                onChange={(e) => setModalRole(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] cursor-pointer"
              >
                {ROLES.filter((r) => r !== "ALL").map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                State
              </label>
              <select
                value={modalState}
                onChange={(e) => setModalState(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] cursor-pointer"
              >
                {NIGERIAN_STATES.filter((st) => st !== "ALL").map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                Pipeline Stage
              </label>
              <select
                value={modalStatus}
                onChange={(e) => setModalStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] cursor-pointer"
              >
                {STATUSES.filter((s) => s !== "ALL").map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--nexa-border)]">
            <NexaButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </NexaButton>
            <NexaButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={creatingLead}
              className="bg-[#1A56DB] text-white hover:bg-[#1545B0]"
            >
              {creatingLead ? "Adding..." : "Add to Pipeline"}
            </NexaButton>
          </div>
        </form>
      </NexaModal>
    </SuperAdminShell>
  );
}
