"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  PhoneForwarded,
  Calendar,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  Building2,
  User,
  Filter,
  Play,
  Pause,
  RotateCcw,
  Tag,
  FileText,
  AlertCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  ShieldCheck,
  Check,
  Flame,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";
import { Pagination } from "@/components/nexa/Pagination";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { CrmCall, CrmLead } from "@/lib/crm-service";
import { crmFetch } from "@/lib/crm-client";
import { useAuth } from "@/components/nexa/AuthContext";
import { cn } from "@/lib/utils";

type OutcomeType =
  | "CONNECTED_INTERESTED"
  | "CONNECTED_NEGOTIATING"
  | "CONNECTED_WON"
  | "CONNECTED_FOLLOWUP"
  | "NOT_INTERESTED"
  | "VOICEMAIL"
  | "NO_ANSWER"
  | "BUSY"
  | "WRONG_NUMBER";

const OUTCOME_CONFIG: Record<
  OutcomeType,
  { label: string; badge: "success" | "primary" | "warning" | "danger" | "neutral" | "purple"; group: "connected" | "unreached" | "negative" }
> = {
  CONNECTED_INTERESTED: { label: "Interested & Qualified", badge: "success", group: "connected" },
  CONNECTED_NEGOTIATING: { label: "Proposal / Negotiating", badge: "purple", group: "connected" },
  CONNECTED_WON: { label: "Deal Closed / Won", badge: "success", group: "connected" },
  CONNECTED_FOLLOWUP: { label: "Callback Scheduled", badge: "primary", group: "connected" },
  NOT_INTERESTED: { label: "Not Interested", badge: "danger", group: "negative" },
  VOICEMAIL: { label: "Left Voicemail", badge: "warning", group: "unreached" },
  NO_ANSWER: { label: "No Answer / Ringing", badge: "neutral", group: "unreached" },
  BUSY: { label: "Busy / Line Busy", badge: "neutral", group: "unreached" },
  WRONG_NUMBER: { label: "Wrong Number", badge: "danger", group: "negative" },
};

function SalesCloserCallLoggerContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  // Closer Identity Resolution
  const closerName = useMemo(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("erp_current_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.name) return parsed.name;
        } catch {}
      }
      const nexaName = localStorage.getItem("nexa_user_name") || localStorage.getItem("erp_user_name");
      if (nexaName) return nexaName;
    }
    return user?.name || "Abosede Ajayi";
  }, [user]);

  const closerEmail = useMemo(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("erp_current_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.email) return parsed.email;
        } catch {}
      }
      const nexaEmail = localStorage.getItem("nexa_user_email") || localStorage.getItem("erp_user_email");
      if (nexaEmail) return nexaEmail;
    }
    return user?.email || "";
  }, [user]);

  // Data State
  const [calls, setCalls] = useState<CrmCall[]>([]);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOutcome, setFilterOutcome] = useState<string>("ALL");
  const [filterDirection, setFilterDirection] = useState<string>("ALL");

  // Call Logging Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [contactName, setContactName] = useState("");
  const [company, setCompany] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [direction, setDirection] = useState<"OUTBOUND" | "INBOUND">("OUTBOUND");
  const [outcome, setOutcome] = useState<OutcomeType>("CONNECTED_INTERESTED");
  const [notes, setNotes] = useState("");
  const [followupDate, setFollowupDate] = useState("");

  // Live Stopwatch
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [manualDurationMinutes, setManualDurationMinutes] = useState("");
  const [manualDurationSeconds, setManualDurationSeconds] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Search inside lead selector
  const [leadSearchText, setLeadSearchText] = useState("");
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Stopwatch timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Load Calls strictly for this Sales Closer
  const loadData = async () => {
    setIsLoading(true);
    try {
      const repQuery = encodeURIComponent(closerEmail || closerName || "");
      const [callsRes, leadsRes] = await Promise.all([
        crmFetch(`/api/erp/crm/calls?rep=${repQuery}`)
          .then((r) => r.json())
          .catch(() => null),
        crmFetch("/api/erp/crm/leads")
          .then((r) => r.json())
          .catch(() => null),
      ]);

      if (Array.isArray(leadsRes?.leads)) {
        setLeads(leadsRes.leads);
      } else {
        setLeads([]);
      }

      const rawCalls: CrmCall[] = Array.isArray(callsRes?.calls) ? callsRes.calls : [];

      // STRICT CLOSER ISOLATION:
      // Guarantee that ONLY calls logged under the active closer's identity are displayed
      const closerNameNorm = closerName.trim().toLowerCase();
      const closerEmailNorm = closerEmail.trim().toLowerCase();

      const closerCalls = rawCalls.filter((c) => {
        const cEmail = (c.repEmail || "").trim().toLowerCase();
        const cName = (c.repName || "").trim().toLowerCase();

        if (closerEmailNorm && cEmail && cEmail === closerEmailNorm) return true;
        if (closerNameNorm && cName) {
          if (cName === closerNameNorm || cName.includes(closerNameNorm) || closerNameNorm.includes(cName)) {
            return true;
          }
        }
        // If no rep was tagged and user is logged in, only include if rep matches
        return false;
      });

      setCalls(closerCalls);
    } catch (err) {
      console.warn("Failed to load sales closer call logs:", err);
      setCalls([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [closerName, closerEmail]);

  // Handle URL query parameters to prefill modal
  useEffect(() => {
    const qLeadId = searchParams.get("leadId");
    const qPhone = searchParams.get("phone");
    const qName = searchParams.get("name");
    const qCompany = searchParams.get("company");

    if (qLeadId || qPhone || qName || qCompany) {
      if (qLeadId) setSelectedLeadId(qLeadId);
      if (qPhone) setPhoneNumber(qPhone);
      if (qName) setContactName(qName);
      if (qCompany) setCompany(qCompany);
      setIsModalOpen(true);
    }
  }, [searchParams]);

  // Select Lead from dropdown
  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    if (!leadId) return;
    const l = leads.find((item) => item.id === leadId);
    if (l) {
      setContactName(l.contactName || (l as any).name || "");
      setCompany(l.companyName || (l as any).company || "");
      setPhoneNumber(l.contactPhone || (l as any).phone || "");
    }
  };

  const handleStartCallTimer = () => setIsTimerRunning(true);
  const handlePauseCallTimer = () => setIsTimerRunning(false);
  const handleResetCallTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const formatDurationDisplay = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  };

  const handleOpenLogModal = (prefillLead?: CrmLead) => {
    if (prefillLead) {
      handleSelectLead(prefillLead.id);
    } else {
      setSelectedLeadId("");
      setContactName("");
      setCompany("");
      setPhoneNumber("");
    }
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setManualDurationMinutes("");
    setManualDurationSeconds("");
    setOutcome("CONNECTED_INTERESTED");
    setNotes("");
    setFollowupDate("");
    setIsModalOpen(true);
  };

  const handleSaveCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !phoneNumber.trim()) {
      alert("Please provide the contact name and telephone number.");
      return;
    }

    let effectiveDuration = timerSeconds;
    if (manualDurationMinutes || manualDurationSeconds) {
      const m = parseInt(manualDurationMinutes, 10) || 0;
      const s = parseInt(manualDurationSeconds, 10) || 0;
      effectiveDuration = m * 60 + s;
    }

    setIsSaving(true);
    try {
      const payload = {
        leadId: selectedLeadId || undefined,
        contactName: contactName.trim(),
        company: company.trim(),
        phoneNumber: phoneNumber.trim(),
        repName: closerName,
        repEmail: closerEmail,
        direction,
        outcome,
        durationSeconds: effectiveDuration,
        notes: notes.trim(),
        followupDate: followupDate.trim() || undefined,
      };

      const res = await crmFetch("/api/erp/crm/calls", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to log call");
      }

      setIsModalOpen(false);
      handleResetCallTimer();
      await loadData();
    } catch (err: any) {
      alert("Error saving call: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCall = async (id: string, contact: string) => {
    if (!confirm(`Are you sure you want to delete your logged call for "${contact}"?`)) return;
    setIsDeletingId(id);
    try {
      const res = await crmFetch(`/api/erp/crm/calls?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCalls((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.warn("Delete error:", err);
    } finally {
      setIsDeletingId(null);
    }
  };

  // Filtered Calls
  const filteredCalls = useMemo(() => {
    return calls.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.contactName.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        c.phoneNumber.includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q));

      const matchOutcome =
        filterOutcome === "ALL" ||
        (filterOutcome === "CONNECTED" && c.outcome.startsWith("CONNECTED")) ||
        (filterOutcome === "WON" && c.outcome === "CONNECTED_WON") ||
        (filterOutcome === "UNREACHED" && (c.outcome === "VOICEMAIL" || c.outcome === "NO_ANSWER" || c.outcome === "BUSY")) ||
        c.outcome === filterOutcome;

      const matchDirection = filterDirection === "ALL" || c.direction === filterDirection;

      return matchSearch && matchOutcome && matchDirection;
    });
  }, [calls, searchQuery, filterOutcome, filterDirection]);

  // Closer Personal Metrics & Stats
  const closerStats = useMemo(() => {
    const totalCalls = calls.length;
    const connectedCalls = calls.filter((c) => c.outcome.startsWith("CONNECTED")).length;
    const wonCount = calls.filter((c) => c.outcome === "CONNECTED_WON").length;
    const totalSecs = calls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);
    const avgSecs = totalCalls > 0 ? Math.round(totalSecs / totalCalls) : 0;
    const connectRate = totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0;

    const todayStr = new Date().toDateString();
    const todayCalls = calls.filter((c) => {
      if (!c.callDate) return false;
      return new Date(c.callDate).toDateString() === todayStr;
    }).length;

    return {
      totalCalls,
      connectedCalls,
      connectRate,
      wonCount,
      totalTalkTimeHours: (totalSecs / 3600).toFixed(1),
      avgDurationDisplay: formatDurationDisplay(avgSecs),
      todayCalls,
    };
  }, [calls]);

  // Paginated calls
  const totalPages = Math.ceil(filteredCalls.length / pageSize) || 1;
  const paginatedCalls = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCalls.slice(start, start + pageSize);
  }, [filteredCalls, currentPage, pageSize]);

  // Lead search inside modal
  const filteredModalLeads = useMemo(() => {
    if (!leadSearchText.trim()) return leads.slice(0, 8);
    const q = leadSearchText.toLowerCase();
    return leads
      .filter((l) => {
        const name = (l.contactName || (l as any).name || "").toLowerCase();
        const comp = (l.companyName || (l as any).company || "").toLowerCase();
        const phone = (l.contactPhone || (l as any).phone || "").toLowerCase();
        return name.includes(q) || comp.includes(q) || phone.includes(q);
      })
      .slice(0, 8);
  }, [leads, leadSearchText]);

  return (
    <ErpAdminShell
      activeModule="crm"
      title="Sales Closer Call Desk"
      subtitle={`Dedicated closing workstation for ${closerName}: live call timing, structured outcome logging, and personal closing metrics.`}
    >
      <div className="space-y-6">
        {/* CLOSER BANNER & CALL ACTIONS */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-display text-[var(--nexa-text-primary)]">
                  My Call Logger & Pitch Desk
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  Isolated Desk
                </span>
              </div>
              <p className="text-xs text-[var(--nexa-text-secondary)] mt-0.5">
                Closer: <strong className="text-[var(--nexa-text-primary)] font-bold">{closerName}</strong>
                {closerEmail ? ` (${closerEmail})` : ""} — only displaying calls logged under your persona.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-card)] text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:border-emerald-500/30 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="Refresh My Calls"
            >
              <RefreshCw className={cn("w-4 h-4 text-emerald-600", isLoading && "animate-spin")} />
            </button>

            <Link href="/erp/ops/crm?tab=leads">
              <NexaButton
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold"
              >
                Assigned Leads Directory
              </NexaButton>
            </Link>

            <NexaButton
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => handleOpenLogModal()}
              className="rounded-xl text-xs font-bold bg-[#1A56DB] hover:bg-[#1545B0] text-white shadow-md shadow-[#1A56DB]/20"
            >
              Log New Call
            </NexaButton>
          </div>
        </div>

        {/* PERSONAL KPI METRICS */}
        <ErpStatGrid
          stats={[
            {
              label: "My Calls Logged",
              value: closerStats.totalCalls.toLocaleString(),
              change: `${closerStats.todayCalls} today`,
              trend: "up",
              changeType: "info",
              icon: <Phone className="w-5 h-5" />,
            },
            {
              label: "My Connect Rate",
              value: `${closerStats.connectRate}%`,
              change: `${closerStats.connectedCalls} answered`,
              trend: closerStats.connectRate >= 40 ? "up" : "neutral",
              changeType: closerStats.connectRate >= 40 ? "success" : "warning",
              icon: <PhoneIncoming className="w-5 h-5" />,
            },
            {
              label: "Deals Closed / Won",
              value: closerStats.wonCount.toLocaleString(),
              change: "Milestone win",
              trend: "up",
              changeType: "success",
              icon: <Award className="w-5 h-5" />,
            },
            {
              label: "Total Talk Time",
              value: `${closerStats.totalTalkTimeHours}h`,
              change: `Avg ${closerStats.avgDurationDisplay}/call`,
              trend: "up",
              changeType: "info",
              icon: <Clock className="w-5 h-5" />,
            },
          ]}
        />

        {/* CONTROLS & FILTER BAR */}
        <NexaCard className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nexa-text-muted)]" />
              <input
                type="text"
                placeholder="Search by prospect name, company, phone number, or notes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] placeholder-[var(--nexa-text-muted)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Outcome filter */}
              <select
                value={filterOutcome}
                onChange={(e) => {
                  setFilterOutcome(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">All Outcomes</option>
                <option value="CONNECTED">Connected (All Positive)</option>
                <option value="WON">Deals Won / Converted</option>
                <option value="CONNECTED_INTERESTED">Interested & Qualified</option>
                <option value="CONNECTED_NEGOTIATING">Negotiating / Proposal</option>
                <option value="CONNECTED_FOLLOWUP">Callback Scheduled</option>
                <option value="UNREACHED">Unreached (Voicemail / No Answer)</option>
                <option value="NOT_INTERESTED">Not Interested</option>
              </select>

              {/* Direction filter */}
              <select
                value={filterDirection}
                onChange={(e) => {
                  setFilterDirection(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">All Directions</option>
                <option value="OUTBOUND">Outbound Calls</option>
                <option value="INBOUND">Inbound Calls</option>
              </select>
            </div>
          </div>

          {/* CALL LOGS TABLE */}
          <div className="overflow-x-auto rounded-xl border border-[var(--nexa-border)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-surface)] border-b border-[var(--nexa-border)] font-bold text-[var(--nexa-text-muted)]">
                <tr>
                  <th className="py-3 px-3.5">Prospect & Company</th>
                  <th className="py-3 px-3">Direction</th>
                  <th className="py-3 px-3">Call Outcome</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Follow-up / Notes</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)]">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[var(--nexa-text-muted)]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                        <span className="text-xs font-medium">Loading your call history...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedCalls.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[var(--nexa-text-muted)]">
                      <div className="max-w-sm mx-auto space-y-2">
                        <PhoneMissed className="w-8 h-8 text-[var(--nexa-text-muted)] mx-auto opacity-50" />
                        <p className="font-bold text-[var(--nexa-text-primary)]">No calls found</p>
                        <p className="text-xs text-[var(--nexa-text-secondary)]">
                          {searchQuery || filterOutcome !== "ALL" || filterDirection !== "ALL"
                            ? "Try broadening your search or outcome filters."
                            : "You haven't logged any calls yet. Use the Log New Call button to begin tracking your pitches."}
                        </p>
                        <div className="pt-2">
                          <NexaButton
                            size="sm"
                            leftIcon={<Plus className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenLogModal()}
                            className="rounded-full text-xs font-bold"
                          >
                            Log Your First Call
                          </NexaButton>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCalls.map((call) => {
                    const outcomeConf = OUTCOME_CONFIG[call.outcome as OutcomeType] || {
                      label: call.outcome,
                      badge: "neutral",
                    };

                    return (
                      <tr key={call.id} className="hover:bg-[var(--nexa-bg-surface)]/60 transition-colors">
                        {/* Prospect & Company */}
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[var(--nexa-text-muted)] shrink-0" />
                            <span>{call.contactName}</span>
                          </div>
                          {call.company && (
                            <div className="text-[11px] text-[var(--nexa-text-muted)] flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[180px]">{call.company}</span>
                            </div>
                          )}
                          <div className="text-[10px] text-[var(--nexa-text-muted)] font-mono mt-0.5">
                            {call.phoneNumber}
                          </div>
                        </td>

                        {/* Direction */}
                        <td className="py-3 px-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                              call.direction === "INBOUND"
                                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            )}
                          >
                            {call.direction === "INBOUND" ? (
                              <PhoneIncoming className="w-3 h-3" />
                            ) : (
                              <PhoneOutgoing className="w-3 h-3" />
                            )}
                            {call.direction}
                          </span>
                        </td>

                        {/* Outcome */}
                        <td className="py-3 px-3">
                          <NexaBadge variant={outcomeConf.badge} size="sm">
                            {outcomeConf.label}
                          </NexaBadge>
                        </td>

                        {/* Duration */}
                        <td className="py-3 px-3">
                          <span className="font-mono text-xs font-semibold text-[var(--nexa-text-primary)]">
                            {formatDurationDisplay(call.durationSeconds || 0)}
                          </span>
                        </td>

                        {/* Date & Time */}
                        <td className="py-3 px-3 text-[11px] text-[var(--nexa-text-muted)]">
                          <div className="font-medium text-[var(--nexa-text-primary)]">
                            {call.callDate ? new Date(call.callDate).toLocaleDateString() : "Today"}
                          </div>
                          <div className="text-[10px]">
                            {call.callDate ? new Date(call.callDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                          </div>
                        </td>

                        {/* Follow-up / Notes */}
                        <td className="py-3 px-3 max-w-xs">
                          {call.followupDate && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-1">
                              <Calendar className="w-3 h-3" />
                              Follow-up: {call.followupDate}
                            </div>
                          )}
                          <p className="text-[11px] text-[var(--nexa-text-secondary)] line-clamp-2 leading-relaxed">
                            {call.notes || "—"}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`tel:${call.phoneNumber}`}
                              className="p-1.5 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-card)] text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                              title={`Dial ${call.phoneNumber}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => handleDeleteCall(call.id, call.contactName)}
                              disabled={isDeletingId === call.id}
                              className="p-1.5 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-card)] text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete this call log"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </NexaCard>
      </div>

      {/* LOG CALL MODAL */}
      <NexaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Sales Call Outcome"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveCall} className="space-y-4">
          {/* Closer Identification Banner */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Logging as Sales Closer: <strong>{closerName}</strong>
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 font-bold">
              Personal Closer Desk
            </span>
          </div>

          {/* Lead Picker Search */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
              Attach to Assigned Lead (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search leads directory to autofill contact details..."
                value={leadSearchText}
                onChange={(e) => setLeadSearchText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] placeholder-[var(--nexa-text-muted)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {filteredModalLeads.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {filteredModalLeads.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      handleSelectLead(l.id);
                      setLeadSearchText("");
                    }}
                    className={cn(
                      "text-[10px] px-2 py-1 rounded-lg border transition-all text-left",
                      selectedLeadId === l.id
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold"
                        : "bg-[var(--nexa-bg-surface)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:border-emerald-500/30"
                    )}
                  >
                    <strong>{l.contactName || (l as any).name}</strong> ({l.companyName || (l as any).company || "No company"})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                Contact Person *
              </label>
              <NexaInput
                placeholder="e.g. Alhaji Babatunde"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                Company / Organization
              </label>
              <NexaInput
                placeholder="e.g. Dangote Logistics Ltd"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                Phone Number *
              </label>
              <NexaInput
                placeholder="e.g. +234 803 123 4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                Call Direction
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] cursor-pointer"
              >
                <option value="OUTBOUND">Outbound (Direct Pitch / Follow-up)</option>
                <option value="INBOUND">Inbound (Customer Inquired)</option>
              </select>
            </div>
          </div>

          {/* CALL DURATION & LIVE STOPWATCH */}
          <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Call Duration & Live Stopwatch
              </span>
              <span className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400">
                {formatDurationDisplay(timerSeconds)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!isTimerRunning ? (
                <button
                  type="button"
                  onClick={handleStartCallTimer}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Start Timer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseCallTimer}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Pause className="w-3 h-3 fill-current" />
                  Pause
                </button>
              )}

              <button
                type="button"
                onClick={handleResetCallTimer}
                className="px-2.5 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-card)] text-xs font-bold text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>

              <div className="text-[11px] text-[var(--nexa-text-muted)] ml-auto flex items-center gap-1.5">
                <span>Or manual:</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={manualDurationMinutes}
                  onChange={(e) => setManualDurationMinutes(e.target.value)}
                  className="w-14 px-2 py-1 rounded-lg text-xs bg-[var(--nexa-bg-card)] border border-[var(--nexa-border)] text-center text-[var(--nexa-text-primary)]"
                  min="0"
                />
                <span>m</span>
                <input
                  type="number"
                  placeholder="Sec"
                  value={manualDurationSeconds}
                  onChange={(e) => setManualDurationSeconds(e.target.value)}
                  className="w-14 px-2 py-1 rounded-lg text-xs bg-[var(--nexa-bg-card)] border border-[var(--nexa-border)] text-center text-[var(--nexa-text-primary)]"
                  min="0"
                  max="59"
                />
                <span>s</span>
              </div>
            </div>
          </div>

          {/* CALL OUTCOME SELECTION */}
          <div>
            <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1.5">
              Call Outcome *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {(Object.keys(OUTCOME_CONFIG) as OutcomeType[]).map((key) => {
                const conf = OUTCOME_CONFIG[key];
                const isSelected = outcome === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setOutcome(key)}
                    className={cn(
                      "p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between",
                      isSelected
                        ? "bg-[#1A56DB]/10 border-[#1A56DB] text-[#1A56DB] dark:text-[#3B82F6] font-bold shadow-xs"
                        : "bg-[var(--nexa-bg-surface)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:border-[#1A56DB]/30"
                    )}
                  >
                    <span className="truncate">{conf.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#1A56DB] shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
              Scheduled Follow-up Date (Optional)
            </label>
            <input
              type="date"
              value={followupDate}
              onChange={(e) => setFollowupDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] cursor-pointer"
            />
          </div>

          {/* Call Notes */}
          <div>
            <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
              Pitch Notes & Conversation Highlights
            </label>
            <textarea
              rows={3}
              placeholder="Record objection handles, budget discussions, agreed next steps, or customer feedback..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] placeholder-[var(--nexa-text-muted)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--nexa-border)]">
            <NexaButton
              variant="secondary"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </NexaButton>
            <NexaButton
              type="submit"
              disabled={isSaving}
              className="bg-[#1A56DB] hover:bg-[#1545B0] text-white font-bold"
            >
              {isSaving ? "Saving Call..." : "Save Call Log"}
            </NexaButton>
          </div>
        </form>
      </NexaModal>
    </ErpAdminShell>
  );
}

export default function SalesCloserCallLoggerPage() {
  return (
    <RoleGuard allowedRoles={["admin", "md", "sales_closer"]}>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[var(--nexa-bg-base)]">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        }
      >
        <SalesCloserCallLoggerContent />
      </Suspense>
    </RoleGuard>
  );
}
