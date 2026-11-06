"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
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
  Star,
  Flame,
  Check,
  CheckSquare,
  Square,
  Share2,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";
import { Pagination } from "@/components/nexa/Pagination";
import {
  CrmCall,
  CrmLead,
  CallScoreBreakdown,
  CALL_SCORE_CRITERIA,
  computeCallScore,
  getCallScoreBadge,
} from "@/lib/crm-service";
import { crmFetch } from "@/lib/crm-client";
import { useAuth } from "@/components/nexa/AuthContext";
import { filterSalesClosers } from "@/lib/access-control";

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

export default function CrmCallLoggerPage() {
  const { user } = useAuth();
  const [calls, setCalls] = useState<CrmCall[]>([]);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [closers, setClosers] = useState<string[]>([]);
  const [availableClosers, setAvailableClosers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [stats, setStats] = useState({
    totalCalls: 0,
    connectedCalls: 0,
    connectRate: 0,
    positiveCount: 0,
    wonCount: 0,
    avgDurationSec: 0,
    todayCalls: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOutcome, setFilterOutcome] = useState<string>("ALL");
  const [filterDirection, setFilterDirection] = useState<string>("ALL");
  const [filterRep, setFilterRep] = useState<string>("ALL");
  const [filterScore, setFilterScore] = useState<string>("ALL");

  // Call Logging Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [contactName, setContactName] = useState("");
  const [company, setCompany] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [repName, setRepName] = useState("");
  const [repEmail, setRepEmail] = useState("");
  const [direction, setDirection] = useState<"OUTBOUND" | "INBOUND">("OUTBOUND");
  const [outcome, setOutcome] = useState<OutcomeType>("CONNECTED_INTERESTED");
  const [notes, setNotes] = useState("");
  const [followupDate, setFollowupDate] = useState("");

  // Call Score Breakdown State (Scale 0 - 12):
  // 1. Caller's name: 3 pts
  // 2. Request for Proposal: 1 pt
  // 3. Got a different email/phone: 2 pts
  // 4. Reschedule follow-up call: 2 pts
  // 5. Got referred (name and phone): 4 pts
  const [scoreBreakdown, setScoreBreakdown] = useState<CallScoreBreakdown>({
    callerName: false,
    rfp: false,
    differentContact: false,
    rescheduleFollowup: false,
    referral: false,
    alternateContact: "",
    referralDetails: "",
  });

  const currentCallScore = useMemo(() => {
    return computeCallScore(scoreBreakdown);
  }, [scoreBreakdown]);

  // Live Timer for Call Duration
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [manualDurationMinutes, setManualDurationMinutes] = useState("");
  const [manualDurationSeconds, setManualDurationSeconds] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Lead search input within modal
  const [leadSearchText, setLeadSearchText] = useState("");
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Initialize current user name as default closer
  useEffect(() => {
    if (user?.name) {
      setRepName((prev) => prev || user.name);
      setRepEmail((prev) => prev || user.email || "");
    } else if (typeof window !== "undefined") {
      const stored = localStorage.getItem("nexa_user_name") || localStorage.getItem("erp_user_name");
      if (stored) setRepName((prev) => prev || stored);
    }
  }, [user]);

  // Keep repEmail in sync with repName
  useEffect(() => {
    if (repName && availableClosers.length > 0) {
      const match = availableClosers.find(
        (c) => c.name.toLowerCase() === repName.trim().toLowerCase()
      );
      if (match?.email) {
        setRepEmail(match.email);
      }
    }
  }, [repName, availableClosers]);

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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [callsRes, leadsRes, usersRes] = await Promise.all([
        crmFetch("/api/erp/crm/calls").then((r) => r.json()).catch(() => null),
        crmFetch("/api/erp/crm/leads").then((r) => r.json()).catch(() => null),
        crmFetch("/api/erp/users").then((r) => (r.ok ? r.json() : [])).catch(() => []),
      ]);

      if (callsRes?.calls) {
        setCalls(callsRes.calls);
        if (callsRes.stats) {
          const s = callsRes.stats;
          const totalCalls = s.totalCalls ?? callsRes.calls.length ?? 0;
          const connectedCalls = s.connectedCalls ?? s.connectedCount ?? 0;
          const connectRate = s.connectRate ?? (totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0);
          const positiveCount = s.positiveCount ?? 0;
          const wonCount = s.wonCount ?? 0;
          const avgDurationSec = s.avgDurationSec ?? (connectedCalls > 0 ? Math.round((s.totalDurationSeconds || 0) / connectedCalls) : 0);
          const todayCalls = s.todayCalls ?? s.todayCount ?? 0;

          setStats({
            totalCalls,
            connectedCalls,
            connectRate,
            positiveCount,
            wonCount,
            avgDurationSec,
            todayCalls,
          });
        }
      } else {
        setCalls([]);
      }

      let loadedLeads: CrmLead[] = [];
      if (leadsRes?.leads) {
        loadedLeads = leadsRes.leads;
        setLeads(loadedLeads);
      }

      // Extract ONLY employees who are strictly given access to the Sales Closer page
      const rawUsers = Array.isArray(usersRes)
        ? usersRes
        : Array.isArray(usersRes?.users)
        ? usersRes.users
        : [];

      const closerUsers = filterSalesClosers(rawUsers);
      setAvailableClosers(closerUsers);
      const closerNames = Array.from(new Set(closerUsers.map((u) => u.name).filter(Boolean)));
      setClosers(closerNames);

      // Check URL search params for prefilled lead / closer assignment
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const qLeadId = params?.get("leadId");
      const qRep = params?.get("rep") || params?.get("assignedRep") || params?.get("closer");
      const matchedLead = qLeadId ? loadedLeads.find((l) => l.id === qLeadId) : null;
      const leadRep = matchedLead?.assignedRep;

      // Pre-select repName
      if (closerNames.length > 0) {
        setRepName((prev) => {
          if (qRep && closerNames.includes(qRep)) return qRep;
          if (leadRep && closerNames.includes(leadRep)) return leadRep;
          if (prev && closerNames.includes(prev)) return prev;
          if (user?.name && closerNames.includes(user.name)) return user.name;
          return qRep || leadRep || prev || closerNames[0];
        });
      } else if (qRep || leadRep) {
        setRepName(qRep || leadRep || "");
      }
    } catch (err) {
      console.warn("Failed to load call logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Check URL search params for prefilled lead / contact info
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qLeadId = params.get("leadId");
      const qPhone = params.get("phone");
      const qName = params.get("name");
      const qCompany = params.get("company");
      const qRep = params.get("rep") || params.get("assignedRep") || params.get("closer");
      if (qLeadId || qPhone || qName || qCompany || qRep) {
        if (qLeadId) setSelectedLeadId(qLeadId);
        if (qPhone) setPhoneNumber(qPhone);
        if (qName) setContactName(qName);
        if (qCompany) setCompany(qCompany);
        if (qRep) setRepName(qRep);
        setIsModalOpen(true);
      }
    }
  }, []);

  // When a lead is selected from dropdown, prefill contact info
  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    if (!leadId) return;
    const l = leads.find((item) => item.id === leadId);
    if (l) {
      const name = l.contactName || (l as any).name || "";
      setContactName(name);
      setCompany(l.companyName || (l as any).company || "");
      setPhoneNumber(l.contactPhone || (l as any).phone || "");
      if (l.assignedRep) setRepName(l.assignedRep);
      if (name.trim()) {
        setScoreBreakdown((prev) => ({ ...prev, callerName: true }));
      }
    }
  };

  const handleStartCallTimer = () => {
    setIsTimerRunning(true);
  };

  const handlePauseCallTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetCallTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const formatDurationDisplay = (totalSecs: number | undefined | null) => {
    const validSecs = Math.max(0, Math.floor(Number(totalSecs) || 0));
    const mins = Math.floor(validSecs / 60);
    const secs = validSecs % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  };

  const handleOpenLogModal = (prefillLead?: CrmLead) => {
    if (prefillLead) {
      handleSelectLead(prefillLead.id);
      setScoreBreakdown({
        callerName: Boolean(prefillLead.contactName || (prefillLead as any).name),
        rfp: false,
        differentContact: false,
        rescheduleFollowup: false,
        referral: false,
        alternateContact: "",
        referralDetails: "",
      });
    } else {
      setSelectedLeadId("");
      setContactName("");
      setCompany("");
      setPhoneNumber("");
      setScoreBreakdown({
        callerName: false,
        rfp: false,
        differentContact: false,
        rescheduleFollowup: false,
        referral: false,
        alternateContact: "",
        referralDetails: "",
      });
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
      alert("Please provide contact name and phone number.");
      return;
    }

    // Determine total duration
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
        repName: repName.trim() || user?.name || "Sales Closer",
        repEmail: repEmail.trim() || user?.email || "",
        direction,
        outcome,
        durationSeconds: effectiveDuration,
        callScore: currentCallScore,
        scoreBreakdown,
        notes: notes.trim(),
        followupDate: followupDate.trim() || undefined,
      };

      const res = await crmFetch("/api/erp/crm/calls", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save call log");
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
    if (!confirm(`Are you sure you want to delete the call log for "${contact}"?`)) return;
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

  // Filtered Calls list
  const filteredCalls = useMemo(() => {
    return calls.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.contactName.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        c.phoneNumber.includes(q) ||
        c.repName.toLowerCase().includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q));

      const matchOutcome =
        filterOutcome === "ALL" ||
        (filterOutcome === "CONNECTED" && c.outcome.startsWith("CONNECTED")) ||
        (filterOutcome === "WON" && c.outcome === "CONNECTED_WON") ||
        (filterOutcome === "UNREACHED" && (c.outcome === "VOICEMAIL" || c.outcome === "NO_ANSWER" || c.outcome === "BUSY")) ||
        c.outcome === filterOutcome;

      const matchDirection = filterDirection === "ALL" || c.direction === filterDirection;
      const matchRep = filterRep === "ALL" || c.repName.toLowerCase() === filterRep.toLowerCase();

      const scoreVal = Math.min(12, Math.max(0, Number(c.callScore) || 0));
      const matchScore =
        filterScore === "ALL" ||
        (filterScore === "HIGH" && scoreVal >= 8) ||
        (filterScore === "MID" && scoreVal >= 4 && scoreVal < 8) ||
        (filterScore === "LOW" && scoreVal < 4);

      return matchSearch && matchOutcome && matchDirection && matchRep && matchScore;
    });
  }, [calls, searchQuery, filterOutcome, filterDirection, filterRep, filterScore]);

  const totalItems = filteredCalls.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedCalls = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCalls.slice(start, start + pageSize);
  }, [filteredCalls, currentPage, pageSize]);

  // Derived dynamic stats respecting filters or falling back to overall stats
  const displayStats = useMemo(() => {
    const isFiltered = filterRep !== "ALL" || filterOutcome !== "ALL" || filterDirection !== "ALL" || filterScore !== "ALL" || searchQuery.trim() !== "";
    const activeCalls = isFiltered ? filteredCalls : calls;

    if (activeCalls.length === 0) {
      if (!isFiltered && stats.totalCalls > 0) {
        return {
          ...stats,
          avgCallScore: "0.0",
          highScoreCount: 0,
        };
      }
      return {
        totalCalls: 0,
        connectedCalls: 0,
        connectRate: 0,
        positiveCount: 0,
        wonCount: 0,
        avgDurationSec: 0,
        todayCalls: 0,
        avgCallScore: "0.0",
        highScoreCount: 0,
      };
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    let totalDur = 0;
    let connected = 0;
    let positive = 0;
    let won = 0;
    let today = 0;
    let totalScore = 0;
    let highScore = 0;

    for (const c of activeCalls) {
      const dur = Number(c.durationSeconds) || 0;
      totalDur += dur;
      if (c.outcome?.startsWith("CONNECTED") || dur > 0) {
        connected++;
      }
      if (
        c.outcome === "CONNECTED_INTERESTED" ||
        c.outcome === "CONNECTED_NEGOTIATING" ||
        c.outcome === "CONNECTED_WON" ||
        (c.outcome as string) === "QUALIFIED"
      ) {
        positive++;
      }
      if (c.outcome === "CONNECTED_WON") {
        won++;
      }
      const callDateStr = (c.callDate ? new Date(c.callDate).toISOString() : "").slice(0, 10);
      if (callDateStr === todayStr) {
        today++;
      }

      const sc = Math.min(12, Math.max(0, Number(c.callScore) || 0));
      totalScore += sc;
      if (sc >= 7) highScore++;
    }

    const total = activeCalls.length;
    const rate = total > 0 ? Math.round((connected / total) * 100) : 0;
    const avgSec = connected > 0 ? Math.round(totalDur / connected) : (total > 0 ? Math.round(totalDur / total) : 0);
    const avgScore = total > 0 ? (totalScore / total).toFixed(1) : "0.0";

    return {
      totalCalls: total,
      connectedCalls: connected,
      connectRate: rate,
      positiveCount: positive,
      wonCount: won,
      avgDurationSec: avgSec,
      todayCalls: today,
      avgCallScore: avgScore,
      highScoreCount: highScore,
    };
  }, [calls, filteredCalls, filterRep, filterOutcome, filterDirection, filterScore, searchQuery, stats]);

  // Quick Tags
  const quickNotesTags = [
    "#InterestedInERP",
    "#DemoRequested",
    "#ProposalNeeded",
    "#DecisionMakerConfirmed",
    "#BudgetReview",
    "#CallbackScheduled",
    "#FollowUpRequired",
  ];

  return (
    <ErpAdminShell
      title="Sales Call Logger & Outreach Console"
      subtitle="Log client phone interactions, record call dispositions, track talk time, and advance deals through the sales closer pipeline."
      activeModule="crm"
      action={
        <div className="flex items-center gap-2">
          <NexaButton
            variant="secondary"
            className="gap-2 text-xs"
            onClick={loadData}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </NexaButton>

          <NexaButton
            variant="primary"
            className="gap-2 text-xs bg-[#1A56DB] hover:bg-[#1545B0] text-white"
            onClick={() => handleOpenLogModal()}
            leftIcon={<PhoneCall className="w-4 h-4" />}
          >
            Log New Call
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        {/* STATS OVERVIEW */}
        <ErpStatGrid
          stats={[
            {
              label: "Total Calls Logged",
              value: displayStats.totalCalls.toLocaleString(),
              change: `${displayStats.todayCalls} calls today`,
              changeType: "neutral",
              icon: <Phone className="w-4 h-4 text-[#1A56DB]" />,
            },
            {
              label: "Connection Rate",
              value: `${displayStats.connectRate}%`,
              change: `${displayStats.connectedCalls} answered calls`,
              changeType: "success",
              icon: <PhoneIncoming className="w-4 h-4 text-emerald-600" />,
            },
            {
              label: "Avg. Call Score",
              value: `${displayStats.avgCallScore} / 12`,
              change: `${displayStats.highScoreCount} qualified (7+ pts)`,
              changeType: Number(displayStats.avgCallScore) >= 7 ? "success" : "neutral",
              icon: <Star className="w-4 h-4 text-amber-500 fill-current" />,
            },
            {
              label: "Qualified & Deals Won",
              value: displayStats.positiveCount.toLocaleString(),
              change: `${displayStats.wonCount} won directly on call`,
              changeType: "success",
              icon: <Award className="w-4 h-4 text-purple-600" />,
            },
            {
              label: "Avg. Call Duration",
              value: formatDurationDisplay(displayStats.avgDurationSec),
              change: "Connected conversations",
              changeType: "neutral",
              icon: <Clock className="w-4 h-4 text-amber-500" />,
            },
          ]}
        />

        {/* QUICK SEARCH & FILTERS */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <NexaInput
              placeholder="Search by contact name, company, phone number, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-[var(--nexa-text-muted)]" />}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Outcome Filter Chips */}
            <div className="inline-flex rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] p-1 text-xs font-bold">
              {[
                { id: "ALL", label: "All Calls" },
                { id: "CONNECTED", label: "Connected" },
                { id: "WON", label: "Deals Won" },
                { id: "UNREACHED", label: "Unreached / Missed" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setFilterOutcome(f.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    filterOutcome === f.id
                      ? "bg-[#1A56DB] text-white shadow-xs"
                      : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Score Filter */}
            <select
              value={filterScore}
              onChange={(e) => {
                setFilterScore(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] cursor-pointer"
              title="Filter by Call Score (0 - 12)"
            >
              <option value="ALL">All Scores (0 - 12)</option>
              <option value="HIGH">🌟 High Value (8 - 12 pts)</option>
              <option value="MID">⚡ Developing (4 - 7 pts)</option>
              <option value="LOW">❄️ Low (0 - 3 pts)</option>
            </select>

            {/* Direction Filter */}
            <select
              value={filterDirection}
              onChange={(e) => {
                setFilterDirection(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] cursor-pointer"
            >
              <option value="ALL">All Directions</option>
              <option value="OUTBOUND">Outbound Calls</option>
              <option value="INBOUND">Inbound Calls</option>
            </select>

            {/* Sales Closer Filter */}
            {closers.length > 0 && (
              <select
                value={filterRep}
                onChange={(e) => {
                  setFilterRep(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] cursor-pointer"
              >
                <option value="ALL">All Sales Closers</option>
                {closers.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* CALL LOGS TABLE */}
        <NexaCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-surface)] border-b border-[var(--nexa-border)] font-bold text-[var(--nexa-text-muted)]">
                <tr>
                  <th className="py-3 px-4">Contact & Company</th>
                  <th className="py-3 px-4">Direction & Phone</th>
                  <th className="py-3 px-4">Call Outcome</th>
                  <th className="py-3 px-4 text-center">Call Score</th>
                  <th className="py-3 px-4 text-center">Duration</th>
                  <th className="py-3 px-4">Sales Closer</th>
                  <th className="py-3 px-4">Discussion Notes & Follow-up</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)]">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-xs text-[var(--nexa-text-muted)]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-[#1A56DB]" />
                        <span>Loading sales call logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedCalls.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-xs text-[var(--nexa-text-muted)]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <PhoneMissed className="w-8 h-8 text-[var(--nexa-text-muted)]/50" />
                        <span className="font-bold text-sm text-[var(--nexa-text-primary)]">No call logs found</span>
                        <p className="text-xs text-[var(--nexa-text-muted)] max-w-sm">
                          {searchQuery || filterOutcome !== "ALL" || filterScore !== "ALL"
                            ? "No calls match your active filter criteria."
                            : "Start logging client calls with sales closers to record dispositions and advance deals."}
                        </p>
                        <NexaButton
                          variant="primary"
                          size="sm"
                          className="mt-2 text-xs bg-[#1A56DB] text-white"
                          onClick={() => handleOpenLogModal()}
                          leftIcon={<PhoneCall className="w-3.5 h-3.5" />}
                        >
                          Log First Call
                        </NexaButton>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCalls.map((call) => {
                    const outcomeMeta = OUTCOME_CONFIG[call.outcome as OutcomeType] || {
                      label: call.outcome,
                      badge: "neutral",
                    };
                    const isWon = call.outcome === "CONNECTED_WON";
                    const isOutbound = call.direction === "OUTBOUND";

                    return (
                      <tr key={call.id} className="hover:bg-[var(--nexa-bg-surface)]/50 transition-colors">
                        {/* Contact & Company */}
                        <td className="py-3 px-4">
                          <div className="font-extrabold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#1A56DB]" />
                            <span>{call.contactName}</span>
                          </div>
                          {call.company ? (
                            <div className="text-[11px] text-[var(--nexa-text-muted)] flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-purple-500" />
                              <span>{call.company}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[var(--nexa-text-muted)]">Direct Client</span>
                          )}
                        </td>

                        {/* Direction & Phone */}
                        <td className="py-3 px-4 space-y-1">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[var(--nexa-text-primary)]">
                            <a
                              href={`tel:${call.phoneNumber}`}
                              className="hover:underline hover:text-[#1A56DB] flex items-center gap-1"
                              title="Click to dial"
                            >
                              <Phone className="w-3 h-3 text-[#1A56DB]" />
                              <span>{call.phoneNumber}</span>
                            </a>
                          </div>
                          <div className="flex items-center gap-1">
                            {isOutbound ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">
                                <PhoneOutgoing className="w-2.5 h-2.5" /> Outbound
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                <PhoneIncoming className="w-2.5 h-2.5" /> Inbound
                              </span>
                            )}
                            <span className="text-[10px] text-[var(--nexa-text-muted)]">
                              {new Date(call.callDate || call.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </td>

                        {/* Call Outcome */}
                        <td className="py-3 px-4">
                          <NexaBadge variant={outcomeMeta.badge} size="sm" className="font-bold">
                            {isWon && <Sparkles className="w-3 h-3 mr-1 fill-current" />}
                            {outcomeMeta.label}
                          </NexaBadge>
                        </td>

                        {/* Call Score (Scale 0 - 12) */}
                        <td className="py-3 px-4 text-center">
                          {(() => {
                            const score = Math.min(12, Math.max(0, Number(call.callScore) || 0));
                            const badge = getCallScoreBadge(score);
                            const bd = (call.scoreBreakdown || {}) as CallScoreBreakdown;
                            const earned: string[] = [];
                            if (bd.callerName) earned.push("Caller Name (+3)");
                            if (bd.rfp) earned.push("RFP (+1)");
                            if (bd.differentContact) earned.push("Alt Contact (+2)");
                            if (bd.rescheduleFollowup) earned.push("Follow-up (+2)");
                            if (bd.referral) earned.push("Referral (+4)");

                            return (
                              <div className="inline-flex flex-col items-center">
                                <span
                                  className={`inline-flex items-center gap-1 font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full ${badge.colorClass}`}
                                  title={earned.length > 0 ? `Scoring Breakdown:\n• ${earned.join("\n• ")}` : "No qualification criteria met (0/12)"}
                                >
                                  {score >= 10 && <Flame className="w-3 h-3 text-emerald-500 fill-current" />}
                                  {score >= 7 && score < 10 && <Star className="w-3 h-3 text-blue-500 fill-current" />}
                                  {score}/12
                                </span>
                                <span className="text-[9px] text-[var(--nexa-text-muted)] font-semibold mt-0.5">
                                  {badge.rating}
                                </span>
                              </div>
                            );
                          })()}
                        </td>

                        {/* Duration */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                              call.durationSeconds > 0
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                                : "text-[var(--nexa-text-muted)] border border-[var(--nexa-border)]"
                            }`}
                          >
                            {formatDurationDisplay(call.durationSeconds)}
                          </span>
                        </td>

                        {/* Sales Closer */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[var(--nexa-text-primary)] text-xs">
                            {call.repName || "Sales Closer"}
                          </div>
                          <div className="text-[10px] text-[var(--nexa-text-muted)] font-mono">
                            {new Date(call.callDate || call.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Notes & Follow-up */}
                        <td className="py-3 px-4 max-w-xs">
                          {call.notes ? (
                            <p className="text-[11px] text-[var(--nexa-text-secondary)] line-clamp-2 leading-relaxed">
                              {call.notes}
                            </p>
                          ) : (
                            <span className="text-[10px] text-[var(--nexa-text-muted)] italic">No notes recorded</span>
                          )}
                          {call.followupDate && (
                            <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              <Calendar className="w-2.5 h-2.5" />
                              <span>Follow-up: {call.followupDate}</span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`tel:${call.phoneNumber}`}
                              className="p-1.5 rounded-lg border border-[var(--nexa-border)] hover:bg-[#1A56DB]/10 text-[var(--nexa-text-secondary)] hover:text-[#1A56DB] transition-colors"
                              title="Call Again"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteCall(call.id, call.contactName)}
                              disabled={isDeletingId === call.id}
                              className="p-1.5 rounded-lg border border-[var(--nexa-border)] hover:bg-rose-500/10 text-[var(--nexa-text-secondary)] hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete call log"
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
                {[10, 15, 25, 50].map((size) => (
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

      {/* LOG CALL MODAL */}
      <NexaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Client Phone Call"
        subtitle="Record call details, talk time duration, customer sentiment, and update lead pipeline status."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveCall} className="space-y-4">
          {/* DIRECTION & LEAD LINKING */}
          <div className="p-3 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setDirection("OUTBOUND")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  direction === "OUTBOUND"
                    ? "bg-[#1A56DB] text-white shadow-xs"
                    : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                }`}
              >
                <PhoneOutgoing className="w-3.5 h-3.5" />
                Outbound Outreach
              </button>
              <button
                type="button"
                onClick={() => setDirection("INBOUND")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  direction === "INBOUND"
                    ? "bg-[#1A56DB] text-white shadow-xs"
                    : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                }`}
              >
                <PhoneIncoming className="w-3.5 h-3.5" />
                Inbound Call
              </button>
            </div>

            {/* Link Existing Lead Dropdown */}
            {leads.length > 0 && (
              <div className="flex-1 min-w-[200px]">
                <select
                  value={selectedLeadId}
                  onChange={(e) => handleSelectLead(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-medium text-[var(--nexa-text-primary)]"
                >
                  <option value="">— Link to Existing Lead (Optional) —</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.contactName || (l as any).name} ({l.companyName || (l as any).company})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* CONTACT INFO FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => {
                  const val = e.target.value;
                  setContactName(val);
                  if (val.trim().length >= 2 && val.trim().toLowerCase() !== "corporate prospect") {
                    setScoreBreakdown((prev) => ({ ...prev, callerName: true }));
                  }
                }}
                placeholder="e.g. Adetayo Adewale"
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Sifax Logistics Ltd"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +2348031234567"
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-mono"
              />
            </div>
          </div>

          {/* CLOSER & CALL DURATION STOPWATCH */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Sales Closer / Logged By *
              </label>
              <select
                value={repName}
                onChange={(e) => {
                  const val = e.target.value;
                  setRepName(val);
                  const matched = availableClosers.find((c) => c.name === val);
                  if (matched?.email) setRepEmail(matched.email);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
                required
              >
                {isLoading && closers.length === 0 ? (
                  <option value="">⏳ Loading sales closers...</option>
                ) : closers.length === 0 ? (
                  <option value="">No sales closers provisioned</option>
                ) : null}
                {closers.map((c) => (
                  <option key={c} value={c}>
                    👤 {c}
                  </option>
                ))}
                {repName && !closers.includes(repName) && (
                  <option value={repName}>👤 {repName}</option>
                )}
              </select>
            </div>

            {/* CALL DURATION TIMER / MANUAL ENTRY */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Talk Time Duration
                </label>
                <span className="text-[10px] text-[var(--nexa-text-muted)]">Live Timer or Manual</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Stopwatch Widget */}
                <div className="flex items-center gap-1.5 p-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] flex-1">
                  <span className="font-mono text-sm font-extrabold px-2 text-[var(--nexa-text-primary)]">
                    {formatDurationDisplay(timerSeconds)}
                  </span>
                  {!isTimerRunning ? (
                    <button
                      type="button"
                      onClick={handleStartCallTimer}
                      className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                      title="Start call timer"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePauseCallTimer}
                      className="p-1 rounded bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer"
                      title="Pause call timer"
                    >
                      <Pause className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleResetCallTimer}
                    className="p-1 rounded text-[var(--nexa-text-muted)] hover:text-red-500 transition-colors cursor-pointer"
                    title="Reset timer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>

                {/* Manual entry fallback */}
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="Mins"
                    value={manualDurationMinutes}
                    onChange={(e) => setManualDurationMinutes(e.target.value)}
                    className="w-16 px-2 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-center font-mono"
                  />
                  <span className="text-xs text-[var(--nexa-text-muted)]">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Secs"
                    value={manualDurationSeconds}
                    onChange={(e) => setManualDurationSeconds(e.target.value)}
                    className="w-16 px-2 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-center font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CALL OUTCOME DISPOSITIONS */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--nexa-text-primary)]">
              Call Outcome / Disposition <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(OUTCOME_CONFIG) as OutcomeType[]).map((key) => {
                const conf = OUTCOME_CONFIG[key];
                const isSelected = outcome === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setOutcome(key);
                      if (key === "CONNECTED_FOLLOWUP") {
                        setScoreBreakdown((prev) => ({ ...prev, rescheduleFollowup: true }));
                      }
                      if (key === "CONNECTED_NEGOTIATING") {
                        setScoreBreakdown((prev) => ({ ...prev, rfp: true }));
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#1A56DB]/10 border-[#1A56DB] text-[#1A56DB] font-bold shadow-xs ring-1 ring-[#1A56DB]"
                        : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:border-slate-400 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs truncate">{conf.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#1A56DB] shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FOLLOW-UP DATE (CONDITIONAL) */}
          {outcome === "CONNECTED_FOLLOWUP" && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <label className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Scheduled Callback Date & Time
              </label>
              <input
                type="text"
                value={followupDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setFollowupDate(val);
                  if (val.trim()) {
                    setScoreBreakdown((prev) => ({ ...prev, rescheduleFollowup: true }));
                  }
                }}
                placeholder="e.g. Tomorrow at 10:00 AM, Next Monday 2 PM"
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)]"
              />
            </div>
          )}

          {/* CALL SCORE & QUALIFICATION (SCALE 0 - 12) */}
          {(() => {
            const scoreBadge = getCallScoreBadge(currentCallScore);
            return (
              <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#1A56DB]" />
                      <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                        Call Score & Qualification (0 – 12 pts)
                      </label>
                    </div>
                    <p className="text-[10px] text-[var(--nexa-text-muted)] mt-0.5">
                      Tick all benchmarks earned during outreach. Total points determine opportunity quality.
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 font-mono text-xs font-extrabold px-2.5 py-1 rounded-full ${scoreBadge.colorClass}`}>
                      {currentCallScore >= 10 && <Flame className="w-3.5 h-3.5 text-emerald-500 fill-current" />}
                      {currentCallScore >= 7 && currentCallScore < 10 && <Star className="w-3.5 h-3.5 text-blue-500 fill-current" />}
                      Score: {currentCallScore} / 12 pts
                    </span>
                    <div className="text-[9px] text-[var(--nexa-text-muted)] font-semibold mt-0.5">
                      {scoreBadge.rating}
                    </div>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full bg-[var(--nexa-border)] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      currentCallScore >= 10
                        ? "bg-emerald-500"
                        : currentCallScore >= 7
                        ? "bg-[#1A56DB]"
                        : currentCallScore >= 4
                        ? "bg-amber-500"
                        : currentCallScore > 0
                        ? "bg-slate-400"
                        : "bg-transparent"
                    }`}
                    style={{ width: `${Math.round((currentCallScore / 12) * 100)}%` }}
                  />
                </div>

                {/* Scoring Criteria Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* 1. Caller's Name Obtained (3 pts) */}
                  <button
                    type="button"
                    onClick={() => setScoreBreakdown((prev) => ({ ...prev, callerName: !prev.callerName }))}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      scoreBreakdown.callerName
                        ? "bg-blue-500/10 border-[#1A56DB] text-[var(--nexa-text-primary)] shadow-2xs"
                        : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:border-slate-400"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        scoreBreakdown.callerName
                          ? "bg-[#1A56DB] border-[#1A56DB] text-white"
                          : "border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]"
                      }`}
                    >
                      {scoreBreakdown.callerName && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">Caller's Name Obtained</span>
                        <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-blue-500/15 text-[#1A56DB] shrink-0">
                          +3 pts
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--nexa-text-muted)] line-clamp-1">
                        Obtained verified contact full name & role
                      </p>
                    </div>
                  </button>

                  {/* 2. Request for Proposal (1 pt) */}
                  <button
                    type="button"
                    onClick={() => setScoreBreakdown((prev) => ({ ...prev, rfp: !prev.rfp }))}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      scoreBreakdown.rfp
                        ? "bg-blue-500/10 border-[#1A56DB] text-[var(--nexa-text-primary)] shadow-2xs"
                        : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:border-slate-400"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        scoreBreakdown.rfp
                          ? "bg-[#1A56DB] border-[#1A56DB] text-white"
                          : "border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]"
                      }`}
                    >
                      {scoreBreakdown.rfp && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">Request for Proposal (RFP)</span>
                        <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-blue-500/15 text-[#1A56DB] shrink-0">
                          +1 pt
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--nexa-text-muted)] line-clamp-1">
                        Client requested quote, pricing, or RFP
                      </p>
                    </div>
                  </button>

                  {/* 3. Got Different Email / Phone (2 pts) */}
                  <button
                    type="button"
                    onClick={() => setScoreBreakdown((prev) => ({ ...prev, differentContact: !prev.differentContact }))}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      scoreBreakdown.differentContact
                        ? "bg-blue-500/10 border-[#1A56DB] text-[var(--nexa-text-primary)] shadow-2xs"
                        : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:border-slate-400"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        scoreBreakdown.differentContact
                          ? "bg-[#1A56DB] border-[#1A56DB] text-white"
                          : "border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]"
                      }`}
                    >
                      {scoreBreakdown.differentContact && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">Got Different Email / Phone</span>
                        <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-blue-500/15 text-[#1A56DB] shrink-0">
                          +2 pts
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--nexa-text-muted)] line-clamp-1">
                        Acquired direct phone, mobile, or direct email
                      </p>
                    </div>
                  </button>

                  {/* 4. Reschedule Follow-up Call (2 pts) */}
                  <button
                    type="button"
                    onClick={() => setScoreBreakdown((prev) => ({ ...prev, rescheduleFollowup: !prev.rescheduleFollowup }))}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      scoreBreakdown.rescheduleFollowup
                        ? "bg-blue-500/10 border-[#1A56DB] text-[var(--nexa-text-primary)] shadow-2xs"
                        : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:border-slate-400"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        scoreBreakdown.rescheduleFollowup
                          ? "bg-[#1A56DB] border-[#1A56DB] text-white"
                          : "border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]"
                      }`}
                    >
                      {scoreBreakdown.rescheduleFollowup && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">Reschedule Follow-up Call</span>
                        <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-blue-500/15 text-[#1A56DB] shrink-0">
                          +2 pts
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--nexa-text-muted)] line-clamp-1">
                        Agreed callback date & time scheduled
                      </p>
                    </div>
                  </button>

                  {/* 5. Got Referred (Name & Phone) (4 pts) */}
                  <button
                    type="button"
                    onClick={() => setScoreBreakdown((prev) => ({ ...prev, referral: !prev.referral }))}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 sm:col-span-2 ${
                      scoreBreakdown.referral
                        ? "bg-blue-500/10 border-[#1A56DB] text-[var(--nexa-text-primary)] shadow-2xs"
                        : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:border-slate-400"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        scoreBreakdown.referral
                          ? "bg-[#1A56DB] border-[#1A56DB] text-white"
                          : "border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]"
                      }`}
                    >
                      {scoreBreakdown.referral && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">Got Referred (Name and Phone)</span>
                        <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                          +4 pts
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--nexa-text-muted)]">
                        Client provided a referral introduction with contact name and phone number
                      </p>
                    </div>
                  </button>
                </div>

                {/* Optional captured details when alternate contact or referral checked */}
                {(scoreBreakdown.differentContact || scoreBreakdown.referral) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[var(--nexa-border)]">
                    {scoreBreakdown.differentContact && (
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--nexa-text-secondary)] mb-0.5">
                          Alternate Email or Phone Captured:
                        </label>
                        <input
                          type="text"
                          value={scoreBreakdown.alternateContact || ""}
                          onChange={(e) => setScoreBreakdown((prev) => ({ ...prev, alternateContact: e.target.value }))}
                          placeholder="e.g. direct@company.com or 0803..."
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                        />
                      </div>
                    )}
                    {scoreBreakdown.referral && (
                      <div className={scoreBreakdown.differentContact ? "" : "sm:col-span-2"}>
                        <label className="block text-[10px] font-bold text-[var(--nexa-text-secondary)] mb-0.5">
                          Referral Prospect Details (Name & Phone):
                        </label>
                        <input
                          type="text"
                          value={scoreBreakdown.referralDetails || ""}
                          onChange={(e) => setScoreBreakdown((prev) => ({ ...prev, referralDetails: e.target.value }))}
                          placeholder="e.g. Engr. Bolaji - 08021234567"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* DISCUSSION NOTES & TAGS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Call Notes & Client Objections
              </label>
              <div className="flex items-center gap-1 flex-wrap">
                {quickNotesTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setNotes((prev) => (prev ? `${prev} ${tag}` : tag))}
                    className="text-[10px] text-[#1A56DB] hover:underline bg-[var(--nexa-bg-surface)] px-1.5 py-0.5 rounded border border-[var(--nexa-border)] cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record customer questions, pricing discussed, decision timeline, or action items..."
              className="w-full px-3 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-sans text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--nexa-border)]">
            <NexaButton
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </NexaButton>
            <NexaButton
              type="submit"
              variant="primary"
              disabled={isSaving}
              isLoading={isSaving}
              className="bg-[#1A56DB] hover:bg-[#1545B0] text-white"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {isSaving ? "Saving Call..." : "Save Call Log"}
            </NexaButton>
          </div>
        </form>
      </NexaModal>
    </ErpAdminShell>
  );
}
