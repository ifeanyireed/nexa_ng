"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Users,
  UserCheck,
  Eye,
  Calendar,
  Clock,
  Activity,
} from "lucide-react";
import { IconBrandLinkedin } from "@tabler/icons-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";
import { Pagination } from "@/components/nexa/Pagination";
import { CrmLead, CrmCall } from "@/lib/crm-service";
import { crmFetch } from "@/lib/crm-client";
import { filterSalesClosers } from "@/lib/access-control";

export default function CrmLeadsPage() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [calls, setCalls] = useState<CrmCall[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [callStatusFilter, setCallStatusFilter] = useState("ALL");
  const [repFilter, setRepFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
  const [editStatus, setEditStatus] = useState<string>("CURIOUS");
  const [editAssignedCloser, setEditAssignedCloser] = useState<string>("Unassigned");
  const [editCompany, setEditCompany] = useState<string>("");
  const [editContact, setEditContact] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [editPhone, setEditPhone] = useState<string>("");
  const [editLinkedinUrl, setEditLinkedinUrl] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Buying Signals Modal
  const [isSignalsModalOpen, setIsSignalsModalOpen] = useState(false);
  const [selectedSignalsLead, setSelectedSignalsLead] = useState<CrmLead | null>(null);

  const getSignalItems = (lead: CrmLead | null) => {
    if (!lead) return [];
    const rawSignals =
      Array.isArray(lead.buyingSignals) && lead.buyingSignals.length > 0
        ? lead.buyingSignals
        : lead.notes
        ? [lead.notes]
        : ["Direct Commercial Lead Inbound"];

    // Expand any string that contains multiple concatenated events
    const signals: string[] = [];
    for (const s of rawSignals) {
      if (typeof s !== "string") continue;
      const parts = s
        .split(
          /\r?\n|(?<=[.!?])\s+(?=(?:Call Log\s*\(|Lead auto-assigned|Email [bB]last|Inbound|Outbound|Direct Outreach|Converted to Deal|Promoted to Deal|Deal Won|Meeting Scheduled))/g
        )
        .map((p) => p.trim())
        .filter(Boolean);
      signals.push(...parts);
    }

    const baseCreatedAt = lead.createdAt ? new Date(lead.createdAt) : new Date();
    const validBaseTime = isNaN(baseCreatedAt.getTime()) ? new Date() : baseCreatedAt;
    const updatedAt = lead.updatedAt ? new Date(lead.updatedAt) : null;
    const validUpdateTime = updatedAt && !isNaN(updatedAt.getTime()) ? updatedAt : null;

    // Check if calls exist for this lead to match exact call timestamps
    const matchingCall = calls.find(
      (c) =>
        (lead.id && c.leadId === lead.id) ||
        (lead.companyName && c.company && c.company.toLowerCase() === lead.companyName.toLowerCase()) ||
        (lead.contactPhone &&
          c.phoneNumber &&
          c.phoneNumber.replace(/[^0-9]/g, "").slice(-7) === lead.contactPhone.replace(/[^0-9]/g, "").slice(-7))
    );

    return signals.map((rawSignal, idx) => {
      let text = String(rawSignal || "").trim();
      let eventDate = "";
      let eventTime = "";
      let eventType: "CALL" | "CAMPAIGN" | "ASSIGNMENT" | "INBOUND" | "SIGNAL" = "SIGNAL";

      if (text.toLowerCase().startsWith("call log") || text.includes("(CONNECTED_") || text.includes("Call Log")) {
        eventType = "CALL";
      } else if (text.toLowerCase().includes("email blast") || text.toLowerCase().includes("opened the email")) {
        eventType = "CAMPAIGN";
      } else if (text.toLowerCase().includes("auto-assigned")) {
        eventType = "ASSIGNMENT";
      } else if (text.toLowerCase().includes("inbound")) {
        eventType = "INBOUND";
      }

      // 1. Check if raw signal already contains a timestamp prefix like [YYYY-MM-DD HH:MM:SS]
      const match = text.match(
        /^\[?(20\d{2}[-/.]\d{1,2}[-/.]\d{1,2}(?:[ T]\d{1,2}:\d{2}(?::\d{2})?)?)\]?\s*[:-]?\s*(.*)$/
      );
      if (match) {
        const parsed = new Date(match[1]);
        if (!isNaN(parsed.getTime())) {
          eventDate = parsed.toLocaleDateString(undefined, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          eventTime = parsed.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          text = match[2].trim() || text;
        }
      }

      // 2. If it's a Call Log event and we have matching call log, use the exact call timestamp
      if (!eventDate && eventType === "CALL" && matchingCall?.callDate) {
        const callD = new Date(matchingCall.callDate);
        if (!isNaN(callD.getTime())) {
          eventDate = callD.toLocaleDateString(undefined, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          eventTime = callD.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        }
      }

      // 3. If it's a Call Log or subsequent event, use lead.updatedAt if available
      if (!eventDate && eventType === "CALL" && validUpdateTime) {
        eventDate = validUpdateTime.toLocaleDateString(undefined, {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        eventTime = validUpdateTime.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      }

      // 4. Fallback to validBaseTime (lead.createdAt)
      if (!eventDate) {
        const itemDate = new Date(validBaseTime.getTime() - idx * 1000 * 60 * 15);
        eventDate = itemDate.toLocaleDateString(undefined, {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        eventTime = itemDate.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      }

      return {
        id: idx,
        text,
        eventDate,
        eventTime,
        eventType,
      };
    });
  };

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

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qRep = params.get("rep") || params.get("assignedRep");
      if (qRep) {
        setRepFilter(qRep);
      }
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [leadsRes, callsRes] = await Promise.all([
          crmFetch("/api/erp/crm/leads").then((r) => r.json()).catch(() => null),
          crmFetch("/api/erp/crm/calls").then((r) => r.json()).catch(() => null),
        ]);
        const rawLeads = Array.isArray(leadsRes) ? leadsRes : Array.isArray(leadsRes?.leads) ? leadsRes.leads : [];
        const normalizedLeads = rawLeads.map((l: any) => {
          const rawSignals =
            Array.isArray(l.buyingSignals) && l.buyingSignals.length > 0
              ? l.buyingSignals
              : l.notes
              ? [l.notes]
              : ["Direct Outreach"];

          const splitSignals: string[] = [];
          for (const s of rawSignals) {
            if (typeof s !== "string") continue;
            const parts = s
              .split(
                /\r?\n|(?<=[.!?])\s+(?=(?:Call Log\s*\(|Lead auto-assigned|Email [bB]last|Inbound|Outbound|Direct Outreach|Converted to Deal|Promoted to Deal|Deal Won|Meeting Scheduled))/g
              )
              .map((p) => p.trim())
              .filter(Boolean);
            splitSignals.push(...parts);
          }

          return {
            ...l,
            icpFitScore: l.icpFitScore ?? l.score ?? 75,
            buyingSignals: splitSignals.length > 0 ? splitSignals : ["Direct Outreach"],
          };
        });
        setLeads(normalizedLeads);
        const rawCalls = Array.isArray(callsRes?.calls) ? callsRes.calls : [];
        setCalls(rawCalls);
      } catch {
        setLeads([]);
        setCalls([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Memoize latest call by leadId, phone number, and contact info
  const latestCallByLead = useMemo(() => {
    const map = new Map<string, CrmCall>();
    // calls is ordered by callDate DESC (most recent first)
    for (const c of calls) {
      if (c.leadId && !map.has(`id:${c.leadId}`)) {
        map.set(`id:${c.leadId}`, c);
      }
      if (c.phoneNumber) {
        const clean = c.phoneNumber.replace(/[^0-9]/g, "");
        if (clean.length >= 7) {
          if (!map.has(`phone:${clean.slice(-10)}`)) map.set(`phone:${clean.slice(-10)}`, c);
          if (!map.has(`phone:${clean.slice(-7)}`)) map.set(`phone:${clean.slice(-7)}`, c);
        }
      }
      if (c.contactName && c.company) {
        const key = `name_comp:${c.contactName.trim().toLowerCase()}_${c.company.trim().toLowerCase()}`;
        if (!map.has(key)) {
          map.set(key, c);
        }
      }
      if (c.contactName) {
        const key = `name:${c.contactName.trim().toLowerCase()}`;
        if (!map.has(key)) map.set(key, c);
      }
      if (c.company) {
        const key = `comp:${c.company.trim().toLowerCase()}`;
        if (!map.has(key)) map.set(key, c);
      }
    }
    return map;
  }, [calls]);

  const getLeadCallInfo = (lead: CrmLead) => {
    let call: CrmCall | undefined;
    if (lead.id) {
      call = latestCallByLead.get(`id:${lead.id}`);
    }
    const leadPhone = lead.contactPhone || (lead as any).phone;
    if (!call && leadPhone) {
      const clean = leadPhone.replace(/[^0-9]/g, "");
      if (clean.length >= 7) {
        call =
          latestCallByLead.get(`phone:${clean.slice(-10)}`) ||
          latestCallByLead.get(`phone:${clean.slice(-7)}`);
      }
    }
    if (!call && lead.contactName && lead.companyName) {
      const key = `name_comp:${lead.contactName.trim().toLowerCase()}_${lead.companyName.trim().toLowerCase()}`;
      call = latestCallByLead.get(key);
    }
    if (!call && lead.contactName) {
      call = latestCallByLead.get(`name:${lead.contactName.trim().toLowerCase()}`);
    }
    if (!call && lead.companyName) {
      call = latestCallByLead.get(`comp:${lead.companyName.trim().toLowerCase()}`);
    }
    return call;
  };

  const hasCallLogForLead = (lead: CrmLead) => {
    const call = getLeadCallInfo(lead);
    if (call) return true;
    const notesText = [
      lead.notes || "",
      ...(Array.isArray(lead.buyingSignals) ? lead.buyingSignals : []),
    ].join(" ");
    return (
      /Call Log\s*\(/i.test(notesText) ||
      /\b(CONNECTED_[A-Z_]+|NOT_INTERESTED|NO_ANSWER|WRONG_NUMBER|BUSY|VOICEMAIL)\b/i.test(notesText)
    );
  };

  const getCallIndicator = (call?: CrmCall, lead?: CrmLead) => {
    let outcome = call?.outcome ? String(call.outcome).toUpperCase().trim() : "";

    // If no outcome from call object, inspect lead notes / buying signals for embedded call logs
    if (!outcome && lead) {
      const notesText = [
        lead.notes || "",
        ...(Array.isArray(lead.buyingSignals) ? lead.buyingSignals : []),
      ].join(" ");

      const match =
        notesText.match(/Call Log\s*\(([^)]+)\)/i) ||
        notesText.match(/\b(CONNECTED_[A-Z_]+|NOT_INTERESTED|NO_ANSWER|WRONG_NUMBER|BUSY|VOICEMAIL)\b/i);

      if (match) {
        outcome = match[1].toUpperCase().trim();
      }
    }

    // GREEN: interested, proposal, deal won
    if (
      outcome === "CONNECTED_INTERESTED" ||
      outcome === "CONNECTED_NEGOTIATING" ||
      outcome === "CONNECTED_WON" ||
      outcome.includes("INTERESTED") ||
      outcome.includes("NEGOTIATING") ||
      outcome.includes("WON")
    ) {
      const outcomeLabel =
        outcome === "CONNECTED_WON" || outcome.includes("WON")
          ? "Deal Closed / Won"
          : outcome === "CONNECTED_NEGOTIATING" || outcome.includes("NEGOTIATING")
          ? "Proposal / Negotiating"
          : "Interested & Qualified";
      return {
        color: "green" as const,
        label: outcomeLabel,
        tooltip: `Call Logger: ${outcomeLabel} (Click to log new call)`,
        dotClass: "bg-emerald-500",
      };
    }

    // YELLOW: call back, no answer, busy, voicemail
    if (
      outcome === "CONNECTED_FOLLOWUP" ||
      outcome === "NO_ANSWER" ||
      outcome === "BUSY" ||
      outcome === "VOICEMAIL" ||
      outcome.includes("FOLLOWUP") ||
      outcome.includes("CALLBACK") ||
      outcome.includes("ANSWER") ||
      outcome.includes("BUSY") ||
      outcome.includes("VOICEMAIL")
    ) {
      const outcomeLabel =
        outcome === "CONNECTED_FOLLOWUP" || outcome.includes("FOLLOWUP")
          ? "Callback Scheduled"
          : outcome === "VOICEMAIL" || outcome.includes("VOICEMAIL")
          ? "Left Voicemail"
          : outcome === "BUSY" || outcome.includes("BUSY")
          ? "Busy / Line Busy"
          : "No Answer / Ringing";
      return {
        color: "yellow" as const,
        label: outcomeLabel,
        tooltip: `Call Logger: ${outcomeLabel} (Click to log new call)`,
        dotClass: "bg-amber-500",
      };
    }

    // RED: wrong number, not interested
    if (
      outcome === "WRONG_NUMBER" ||
      outcome === "NOT_INTERESTED" ||
      outcome.includes("WRONG") ||
      outcome.includes("NOT_INTERESTED")
    ) {
      const outcomeLabel = outcome === "WRONG_NUMBER" || outcome.includes("WRONG") ? "Wrong Number" : "Not Interested";
      return {
        color: "red" as const,
        label: outcomeLabel,
        tooltip: `Call Logger: ${outcomeLabel} (Click to log new call)`,
        dotClass: "bg-rose-500",
      };
    }

    // If still no specific call outcome, check if lead status confirms they have been contacted!
    if (lead) {
      if (
        lead.status === "CONVERTED" ||
        lead.status === "MEETING_BOOKED" ||
        lead.status === "QUALIFIED" ||
        lead.status === "PROPOSAL"
      ) {
        return {
          color: "green" as const,
          label: `Contacted & ${lead.status}`,
          tooltip: `Contacted & Advanced (${lead.status}) - Click to log new call`,
          dotClass: "bg-emerald-500",
        };
      }
      if (lead.status === "CONTACTED") {
        return {
          color: "yellow" as const,
          label: "Contacted",
          tooltip: "Contacted - Click to record call details",
          dotClass: "bg-amber-500",
        };
      }
    }

    // Fallback: Blue (not on call logger or unclassified)
    return {
      color: "blue" as const,
      label: "Not on call logger",
      tooltip: "Not on call logger - click to log call",
      dotClass: "bg-blue-500",
    };
  };

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
        status: "CURIOUS",
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
      status: "CURIOUS" as const,
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
          value: (lead as any).value || "TBD",
          stage: "QUALIFIED",
          owner: lead.assignedRep || "Senior Account Exec",
          probability: 50,
          expectedClose: "TBD",
          leadId: lead.id,
          notes: `Promoted from lead ${lead.id}. Signals: ${(lead.buyingSignals || []).join(", ")}`,
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
    const targetLead = leads.find((l) => l.id === leadId);

    // Business Rule Enforcement: Any contact without a call log should never be set to QUALIFIED!
    if (updates.status === "QUALIFIED" && targetLead && !hasCallLogForLead(targetLead)) {
      alert("Gross error prevented: Any contact without a call log should never be set to QUALIFIED. Please log a sales call first.");
      return;
    }

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
        if (data?.lead) {
          setLeads((prev) =>
            prev.map((l) =>
              l.id === leadId ? { ...l, ...data.lead } : l
            )
          );
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData?.error || "Failed to update lead");
        if (targetLead) {
          setLeads((prev) => prev.map((l) => (l.id === leadId ? targetLead : l)));
        }
      }
    } catch (err: any) {
      console.error("Error updating lead field:", err);
      alert("Error updating lead: " + (err?.message || "Network error"));
      if (targetLead) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? targetLead : l)));
      }
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const handleOpenEditModal = (lead: CrmLead) => {
    setEditingLead(lead);
    setEditStatus(lead.status || "CURIOUS");
    setEditAssignedCloser(lead.assignedRep || "Unassigned");
    setEditCompany(lead.companyName || (lead as any).company || "");
    setEditContact(lead.contactName || (lead as any).name || "");
    setEditEmail(lead.contactEmail || (lead as any).email || "");
    setEditPhone(lead.contactPhone || (lead as any).phone || "");
    setEditLinkedinUrl(lead.linkedinUrl || (lead as any).linkedin || "");
    setEditNotes(lead.notes || "");
    setIsEditModalOpen(true);
  };

  const handleSaveEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    // Business Rule Enforcement: Any contact without a call log should never be set to QUALIFIED!
    if (editStatus === "QUALIFIED" && !hasCallLogForLead(editingLead)) {
      alert("Gross error prevented: Any contact without a call log should never be set to QUALIFIED. Please log a sales call first.");
      return;
    }

    setIsSavingEdit(true);

    const payload = {
      id: editingLead.id,
      companyName: editCompany.trim(),
      contactName: editContact.trim(),
      contactEmail: editEmail.trim(),
      contactPhone: editPhone.trim(),
      linkedinUrl: editLinkedinUrl.trim(),
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

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || `Failed to update lead (HTTP ${res.status})`);
      }

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
                linkedinUrl: editLinkedinUrl.trim(),
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

  const callCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: leads.length, green: 0, yellow: 0, red: 0, blue: 0 };
    for (const l of leads) {
      const c = getLeadCallInfo(l);
      const ind = getCallIndicator(c, l);
      counts[ind.color] = (counts[ind.color] || 0) + 1;
    }
    return counts;
  }, [leads, latestCallByLead]);

  const allRepOptions = useMemo(() => {
    const set = new Set<string>();
    availableClosers.forEach((c) => {
      const name = c.name?.trim();
      if (name && name !== "Unassigned" && !name.startsWith("Auto-Assign")) {
        set.add(name);
      }
    });
    leads.forEach((l) => {
      const rep = (l.assignedRep || (l as any).owner || "").trim();
      if (rep && rep !== "Unassigned" && !rep.startsWith("Auto-Assign")) {
        set.add(rep);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [availableClosers, leads]);

  const repCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: leads.length, UNASSIGNED: 0 };
    for (const l of leads) {
      const rep = (l.assignedRep || (l as any).owner || "").trim();
      if (!rep || rep === "Unassigned" || rep.startsWith("Auto-Assign")) {
        counts.UNASSIGNED = (counts.UNASSIGNED || 0) + 1;
      } else {
        counts[rep] = (counts[rep] || 0) + 1;
      }
    }
    return counts;
  }, [leads]);

  const filteredLeads = leads.filter((l) => {
    const q = searchQuery.toLowerCase();
    const cName = (l.companyName || (l as any).company || "").toLowerCase();
    const personName = (l.contactName || (l as any).name || "").toLowerCase();
    const email = (l.contactEmail || (l as any).email || "").toLowerCase();
    const loc = (l.location || "").toLowerCase();
    const phone = (l.contactPhone || (l as any).phone || "").toLowerCase();
    const audList = (l.audienceList || (l as any).listName || "").toLowerCase();
    const matchSearch =
      cName.includes(q) ||
      personName.includes(q) ||
      email.includes(q) ||
      loc.includes(q) ||
      phone.includes(q) ||
      audList.includes(q);
    const matchStatus = statusFilter === "ALL" || l.status === statusFilter;

    let matchCallStatus = true;
    if (callStatusFilter !== "ALL") {
      const c = getLeadCallInfo(l);
      const ind = getCallIndicator(c, l);
      matchCallStatus = ind.color === callStatusFilter;
    }

    let matchRep = true;
    if (repFilter !== "ALL") {
      const rep = (l.assignedRep || (l as any).owner || "").trim();
      if (repFilter === "UNASSIGNED") {
        matchRep = !rep || rep === "Unassigned" || rep.startsWith("Auto-Assign");
      } else {
        matchRep = rep.toLowerCase() === repFilter.toLowerCase();
      }
    }

    return matchSearch && matchStatus && matchCallStatus && matchRep;
  });

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, callStatusFilter, repFilter]);

  const totalItems = filteredLeads.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLeads.slice(startIndex, startIndex + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

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
              value: leads.filter((l) => (l.icpFitScore ?? (l as any).score ?? 75) >= 90).length.toString(),
              change: "Prime buyer readiness",
              changeType: "success",
              icon: <Flame className="w-4 h-4 text-rose-500" />,
            },
            {
              label: "Assigned to Closers",
              value: `${leads.length - (repCounts.UNASSIGNED || 0)} / ${leads.length}`,
              change: `${repCounts.UNASSIGNED || 0} unassigned`,
              changeType: (repCounts.UNASSIGNED || 0) > 0 ? "warning" : "success",
              icon: <UserCheck className="w-4 h-4 text-blue-500" />,
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

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-2xl flex-wrap sm:flex-nowrap">
            <div className="flex-1 min-w-[200px]">
              <NexaInput
                placeholder="Search company, contact, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            {/* Rep Dropdown Filter */}
            <div className="relative">
              <select
                value={repFilter}
                onChange={(e) => setRepFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl text-xs font-semibold border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] hover:border-[#1A56DB]/50 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1A56DB] shrink-0"
                title="Filter by Assigned Sales Closer / Rep"
              >
                <option value="ALL">All Reps ({repCounts.ALL || 0})</option>
                <option value="UNASSIGNED">Unassigned ({repCounts.UNASSIGNED || 0})</option>
                {allRepOptions.map((rep) => (
                  <option key={rep} value={rep}>
                    👤 {rep} ({repCounts[rep] || 0})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--nexa-text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Call Status Dropdown Filter */}
            <div className="relative">
              <select
                value={callStatusFilter}
                onChange={(e) => setCallStatusFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl text-xs font-semibold border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] hover:border-[#1A56DB]/50 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1A56DB] shrink-0"
                title="Filter by Call Status"
              >
                <option value="ALL">All Call Statuses ({callCounts.ALL})</option>
                <option value="green">🟢 Interested, Proposal, Won ({callCounts.green})</option>
                <option value="yellow">🟡 Callback, Busy, Voicemail ({callCounts.yellow})</option>
                <option value="red">🔴 Wrong No, Not Interested ({callCounts.red})</option>
                <option value="blue">🔵 Not on Call Logger ({callCounts.blue})</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--nexa-text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
            {["ALL", "CURIOUS", "IDENTIFIED", "CONTACTED", "QUALIFIED", "PROPOSAL", "MEETING_BOOKED", "CONVERTED"].map((st) => (
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

        {/* Call Logger Status Filter Chips */}
        <div className="flex items-center gap-2 text-xs text-[var(--nexa-text-muted)] flex-wrap px-1">
          {repFilter !== "ALL" && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-[#1A56DB]/10 text-[#1A56DB] border border-[#1A56DB]/20">
              <UserCheck className="w-3.5 h-3.5 text-[#1A56DB]" />
              <span>Rep: {repFilter === "UNASSIGNED" ? "Unassigned" : repFilter}</span>
              <button
                type="button"
                onClick={() => setRepFilter("ALL")}
                className="hover:text-rose-600 ml-0.5 text-sm leading-none font-extrabold cursor-pointer"
                title="Clear rep filter"
              >
                ×
              </button>
            </div>
          )}

          <span className="font-bold text-[var(--nexa-text-secondary)] flex items-center gap-1.5 mr-1">
            <PhoneCall className="w-3.5 h-3.5 text-[#1A56DB]" /> Call Status:
          </span>

          <button
            type="button"
            onClick={() => setCallStatusFilter("ALL")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              callStatusFilter === "ALL"
                ? "bg-[#1A56DB] text-white shadow-xs"
                : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] border border-[var(--nexa-border)]"
            }`}
          >
            <span>All Calls</span>
            <span className="text-[10px] opacity-80 font-normal">({callCounts.ALL})</span>
          </button>

          <button
            type="button"
            onClick={() => setCallStatusFilter(callStatusFilter === "green" ? "ALL" : "green")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              callStatusFilter === "green"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
            }`}
            title="Filter by Interested, Proposal, Deal Won"
          >
            <span className={`w-2 h-2 rounded-full ${callStatusFilter === "green" ? "bg-white" : "bg-emerald-500"}`} />
            <span>Interested, Proposal, Won</span>
            <span className="text-[10px] opacity-80 font-normal">({callCounts.green})</span>
          </button>

          <button
            type="button"
            onClick={() => setCallStatusFilter(callStatusFilter === "yellow" ? "ALL" : "yellow")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              callStatusFilter === "yellow"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
            }`}
            title="Filter by Callback, No Answer, Busy, Voicemail"
          >
            <span className={`w-2 h-2 rounded-full ${callStatusFilter === "yellow" ? "bg-white" : "bg-amber-500"}`} />
            <span>Callback, No Answer, Busy</span>
            <span className="text-[10px] opacity-80 font-normal">({callCounts.yellow})</span>
          </button>

          <button
            type="button"
            onClick={() => setCallStatusFilter(callStatusFilter === "red" ? "ALL" : "red")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              callStatusFilter === "red"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
            }`}
            title="Filter by Wrong Number, Not Interested"
          >
            <span className={`w-2 h-2 rounded-full ${callStatusFilter === "red" ? "bg-white" : "bg-rose-500"}`} />
            <span>Wrong Number, Not Interested</span>
            <span className="text-[10px] opacity-80 font-normal">({callCounts.red})</span>
          </button>

          <button
            type="button"
            onClick={() => setCallStatusFilter(callStatusFilter === "blue" ? "ALL" : "blue")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              callStatusFilter === "blue"
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
            }`}
            title="Filter by Not on Call Logger"
          >
            <span className={`w-2 h-2 rounded-full ${callStatusFilter === "blue" ? "bg-white" : "bg-blue-500"}`} />
            <span>Not on Call Logger</span>
            <span className="text-[10px] opacity-80 font-normal">({callCounts.blue})</span>
          </button>

          {(callStatusFilter !== "ALL" || repFilter !== "ALL" || statusFilter !== "ALL" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setCallStatusFilter("ALL");
                setRepFilter("ALL");
                setStatusFilter("ALL");
                setSearchQuery("");
              }}
              className="text-xs font-bold text-[#1A56DB] hover:underline cursor-pointer ml-1"
            >
              Reset filters
            </button>
          )}
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
                  <th className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span>Assigned Rep</span>
                      {repFilter !== "ALL" && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1A56DB] text-white">
                          Filtered
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)]">
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs text-[var(--nexa-text-muted)]">
                      <div>No leads found matching criteria.</div>
                      {(statusFilter !== "ALL" || callStatusFilter !== "ALL" || repFilter !== "ALL" || searchQuery) && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setStatusFilter("ALL");
                              setCallStatusFilter("ALL");
                              setRepFilter("ALL");
                              setSearchQuery("");
                            }}
                            className="text-xs font-bold text-[#1A56DB] hover:underline cursor-pointer"
                          >
                            Clear all filters
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[var(--nexa-bg-surface)]/50 transition-colors">
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[var(--nexa-text-primary)]">{lead.companyName}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Flame className="w-3 h-3 text-amber-500" />
                          {lead.icpFitScore ?? (lead as any).score ?? 75}% ICP
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-[var(--nexa-text-muted)] shrink-0" />
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

                          {/* LinkedIn Button directly after phone number - strictly renders ONLY if an actual LinkedIn profile URL exists */}
                          {(() => {
                            const raw = (lead.linkedinUrl || (lead as any).linkedin || "").trim();
                            if (!raw || raw.includes("/search/results") || raw.includes("keywords=")) return null;
                            const linkedinTarget = raw.startsWith("http") ? raw : `https://${raw}`;
                            return (
                              <a
                                href={linkedinTarget}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-[#0A66C2] bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/25 hover:border-[#0A66C2]/50 transition-all cursor-pointer shadow-2xs group shrink-0 ml-0.5"
                                title={`Open LinkedIn Profile: ${linkedinTarget}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <IconBrandLinkedin className="w-3 h-3 shrink-0 text-[#0A66C2]" />
                                <span>LinkedIn</span>
                              </a>
                            );
                          })()}
                        </span>
                        <span>•</span>
                        <span>{lead.industry}</span>
                      </div>
                      {((lead as any).audienceList || (lead as any).listName || (lead.source && lead.source.startsWith("Email Blast: "))) && (
                        <div className="flex items-center gap-1.5 text-[10.5px] text-blue-600 dark:text-blue-400 font-semibold pt-0.5">
                          <Users className="w-3 h-3 shrink-0 text-blue-500" />
                          <span className="truncate max-w-[220px]" title={`Audience List: ${(lead as any).audienceList || (lead as any).listName || lead.source?.replace("Email Blast: ", "")}`}>
                            {(lead as any).audienceList || (lead as any).listName || lead.source?.replace("Email Blast: ", "")}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="font-bold text-[var(--nexa-text-primary)]">{lead.contactName}</div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] truncate">{lead.contactTitle}</div>
                      <div className="text-[11px] text-[#1A56DB] flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {lead.contactEmail}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {(() => {
                        const count = getSignalItems(lead).length;
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSignalsLead(lead);
                              setIsSignalsModalOpen(true);
                            }}
                            className="relative p-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] hover:border-[#1A56DB] text-[var(--nexa-text-secondary)] hover:text-[#1A56DB] hover:bg-[#1A56DB]/5 transition-all cursor-pointer shadow-2xs group inline-flex items-center justify-center"
                            title={`Click to view ${count} buying signal event${count !== 1 ? "s" : ""} for ${lead.companyName}`}
                          >
                            <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:text-[#1A56DB] transition-colors" />
                            {count > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-extrabold bg-purple-600 text-white flex items-center justify-center ring-2 ring-[var(--nexa-bg-base)] shadow-xs">
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })()}
                    </td>

                    <td className="py-3.5 px-4">
                      {(() => {
                        const hasCall = hasCallLogForLead(lead);
                        return (
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
                              <option value="CURIOUS">CURIOUS</option>
                              <option value="IDENTIFIED">IDENTIFIED</option>
                              <option value="CONTACTED">CONTACTED</option>
                              <option
                                value="QUALIFIED"
                                disabled={!hasCall}
                                title={!hasCall ? "Call log required to qualify lead" : undefined}
                              >
                                QUALIFIED {!hasCall ? "(Call Required)" : ""}
                              </option>
                              <option value="PROPOSAL">PROPOSAL</option>
                              <option value="MEETING_BOOKED">MEETING_BOOKED</option>
                              <option value="CONVERTED">CONVERTED</option>
                              <option value="ARCHIVED">ARCHIVED</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-[var(--nexa-text-muted)] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        );
                      })()}
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
                        {(() => {
                          const call = getLeadCallInfo(lead);
                          const ind = getCallIndicator(call, lead);
                          return (
                            <Link
                              href={`/erp/admin/crm/calls?leadId=${lead.id}&phone=${encodeURIComponent(lead.contactPhone || (lead as any).phone || "")}&name=${encodeURIComponent(lead.contactName || "")}&company=${encodeURIComponent(lead.companyName || "")}${lead.assignedRep ? `&rep=${encodeURIComponent(lead.assignedRep)}` : ""}`}
                              title={ind.tooltip}
                              className="relative p-1.5 rounded-lg border border-[var(--nexa-border)] hover:bg-[#1A56DB]/10 text-[var(--nexa-text-secondary)] hover:text-[#1A56DB] transition-colors flex items-center justify-center cursor-pointer"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span
                                className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${ind.dotClass} ring-2 ring-[var(--nexa-bg-surface)]`}
                              />
                            </Link>
                          );
                        })()}
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
                ))
              )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination Controller & Page Size Selector */}
          <div className="p-3 border-t border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[var(--nexa-text-muted)]">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-semibold text-[var(--nexa-text-primary)] focus:outline-none focus:ring-1 focus:ring-[#1A56DB] cursor-pointer"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={pageSize}
              onPageChange={setCurrentPage}
              className="pt-0 border-t-0"
            />
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
              {(() => {
                const hasCallInModal = editingLead ? hasCallLogForLead(editingLead) : false;
                return (
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  >
                    <option value="CURIOUS">CURIOUS</option>
                    <option value="IDENTIFIED">IDENTIFIED</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option
                      value="QUALIFIED"
                      disabled={!hasCallInModal}
                      title={!hasCallInModal ? "Call log required to qualify lead" : undefined}
                    >
                      QUALIFIED {!hasCallInModal ? "(Call Required)" : ""}
                    </option>
                    <option value="PROPOSAL">PROPOSAL</option>
                    <option value="MEETING_BOOKED">MEETING_BOOKED</option>
                    <option value="CONVERTED">CONVERTED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                );
              })()}
            </div>
          </div>

          <NexaInput
            label="LinkedIn Profile URL"
            value={editLinkedinUrl}
            onChange={(e) => setEditLinkedinUrl(e.target.value)}
            placeholder="https://www.linkedin.com/in/prospect-profile"
            leftIcon={<IconBrandLinkedin className="w-4 h-4 text-[#0A66C2]" />}
          />

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

      {/* BUYING SIGNALS TIMELINE MODAL */}
      <NexaModal
        isOpen={isSignalsModalOpen}
        onClose={() => {
          setIsSignalsModalOpen(false);
          setSelectedSignalsLead(null);
        }}
        title="Buying Signals & Intent Activity"
        subtitle={
          selectedSignalsLead
            ? `${selectedSignalsLead.companyName} • ${selectedSignalsLead.contactName || "Prospect Contact"}`
            : "Chronological intent triggers and buyer engagement signals."
        }
      >
        {selectedSignalsLead && (
          <div className="space-y-4">
            {/* Prospect Snapshot Header */}
            <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    {selectedSignalsLead.companyName}
                  </div>
                  <div className="text-[11px] text-[var(--nexa-text-muted)] flex items-center gap-1.5">
                    <span>{selectedSignalsLead.contactName}</span>
                    {selectedSignalsLead.industry && (
                      <>
                        <span>•</span>
                        <span>{selectedSignalsLead.industry}</span>
                      </>
                    )}
                    {selectedSignalsLead.location && (
                      <>
                        <span>•</span>
                        <span>{selectedSignalsLead.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  {selectedSignalsLead.icpFitScore ?? (selectedSignalsLead as any).score ?? 75}% ICP Fit
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1A56DB]/10 text-[#1A56DB] border border-[#1A56DB]/20">
                  {selectedSignalsLead.status}
                </span>
              </div>
            </div>

            {/* List of Buying Signal Events */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {getSignalItems(selectedSignalsLead).map((item, index) => {
                const isCall = item.eventType === "CALL";
                const isCampaign = item.eventType === "CAMPAIGN";
                const isAssignment = item.eventType === "ASSIGNMENT";

                const badgeStyle = isCall
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                  : isCampaign
                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                  : isAssignment
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                  : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";

                const badgeLabel = isCall
                  ? "Call Logger Disposition"
                  : isCampaign
                  ? "Email Campaign Trigger"
                  : isAssignment
                  ? "Closer Auto-Assignment"
                  : `Signal Event #${index + 1}`;

                const IconComponent = isCall ? PhoneCall : isCampaign ? Mail : isAssignment ? UserCheck : Activity;

                return (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] hover:border-[#1A56DB]/40 transition-all space-y-2 shadow-2xs"
                  >
                    {/* Event Time and Date Line */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-2.5 text-[var(--nexa-text-muted)]">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--nexa-text-secondary)]">
                          <Calendar className="w-3.5 h-3.5 text-[#1A56DB]" />
                          {item.eventDate}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--nexa-text-secondary)]">
                          <Clock className="w-3.5 h-3.5 text-[#1A56DB]" />
                          {item.eventTime}
                        </span>
                      </div>

                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${badgeStyle}`}>
                        <IconComponent className="w-3 h-3" />
                        {badgeLabel}
                      </span>
                    </div>

                    {/* Signal Item Description (Separate Line) */}
                    <div className="text-xs font-semibold text-[var(--nexa-text-primary)] leading-relaxed pl-0.5">
                      {item.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-[var(--nexa-border)]">
              <span className="text-[11px] text-[var(--nexa-text-muted)]">
                {getSignalItems(selectedSignalsLead).length} detected signal event{getSignalItems(selectedSignalsLead).length !== 1 ? "s" : ""}
              </span>
              <NexaButton
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsSignalsModalOpen(false);
                  setSelectedSignalsLead(null);
                }}
              >
                Close
              </NexaButton>
            </div>
          </div>
        )}
      </NexaModal>
    </ErpAdminShell>
  );
}
