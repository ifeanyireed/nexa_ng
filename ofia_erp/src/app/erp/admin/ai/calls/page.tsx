"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  PhoneCall,
  Search,
  Filter,
  RotateCcw,
  Clock,
  Sparkles,
  Calendar,
  Building2,
  Phone,
  FileText,
  Play,
  CheckCircle2,
  AlertTriangle,
  Radio,
  X,
  Target,
  ArrowRight,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";
import { crmFetch } from "@/lib/crm-client";

interface CallLogItem {
  id: string;
  leadId?: string;
  contactName: string;
  company: string;
  phoneNumber: string;
  callDate: string;
  durationSeconds: number;
  outcome: string;
  notes?: string;
  aiSummary?: string;
  transcript?: string;
  recordingUrl?: string;
  qualificationJson?: string;
  isAi?: boolean;
}

export default function VoiceCallLogsPage() {
  const [calls, setCalls] = useState<CallLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("ALL");
  const [selectedCall, setSelectedCall] = useState<CallLogItem | null>(null);

  async function loadCalls() {
    setIsLoading(true);
    try {
      const res = await crmFetch("/api/erp/crm/calls");
      if (res.ok) {
        const data = await res.json();
        const mapped: CallLogItem[] = (Array.isArray(data) ? data : data.calls || []).map((c: any) => ({
          id: c.id,
          leadId: c.lead_id || c.leadId,
          contactName: c.contact_name || c.contactName || "Corporate Lead",
          company: c.company || "Enterprise Corp",
          phoneNumber: c.phone_number || c.phoneNumber || "+234 800 000 0000",
          callDate: c.call_date || c.callDate || new Date().toISOString(),
          durationSeconds: c.duration_seconds || c.durationSeconds || 0,
          outcome: c.outcome || "COMPLETED",
          notes: c.notes,
          aiSummary: c.ai_summary || c.aiSummary || c.notes,
          transcript: c.transcript,
          recordingUrl: c.recording_url || c.recordingUrl,
          qualificationJson: c.qualification_json || c.qualificationJson,
          isAi: c.is_ai ?? true,
        }));
        setCalls(mapped);
      }
    } catch (err) {
      console.warn("Could not load calls:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCalls();
  }, []);

  const filteredCalls = useMemo(() => {
    return calls.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.contactName.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.phoneNumber.includes(q);

      const matchesOutcome =
        outcomeFilter === "ALL" ||
        (outcomeFilter === "QUALIFIED" && (c.outcome.includes("INTERESTED") || c.outcome.includes("WON"))) ||
        (outcomeFilter === "UNQUALIFIED" && c.outcome.includes("NOT_INTERESTED")) ||
        c.outcome === outcomeFilter;

      return matchesSearch && matchesOutcome;
    });
  }, [calls, searchQuery, outcomeFilter]);

  const totalDuration = calls.reduce((acc, c) => acc + c.durationSeconds, 0);
  const avgDurationSec = calls.length > 0 ? Math.round(totalDuration / calls.length) : 0;
  const connectedCalls = calls.filter((c) => !c.outcome.includes("NO_ANSWER") && !c.outcome.includes("BUSY")).length;
  const connectRate = calls.length > 0 ? Math.round((connectedCalls / calls.length) * 100) : 0;
  const qualifiedCount = calls.filter((c) => c.outcome.includes("INTERESTED") || c.outcome.includes("WON")).length;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const parseTranscript = (raw?: string) => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Plain text transcript lines
      return raw.split("\n").filter(Boolean).map((line) => {
        const isAssistant = line.toLowerCase().startsWith("assistant:") || line.toLowerCase().startsWith("ai:");
        return {
          speaker: isAssistant ? "assistant" : "prospect",
          text: line.replace(/^(assistant|ai|prospect|user):\s*/i, ""),
        };
      });
    }
    return [];
  };

  const parseQualification = (raw?: string) => {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  return (
    <ErpAdminShell
      activeModule="ai"
      title="Voice Call Logs & Transcripts"
      subtitle="Complete audio recordings, turn-by-turn dialogue transcripts, and automated CRM qualification records."
      action={
        <div className="flex items-center gap-2">
          <NexaButton size="sm" variant="ghost" onClick={loadCalls} disabled={isLoading}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </NexaButton>
          <Link href="/erp/admin/ai">
            <NexaButton size="sm" variant="primary">
              <PhoneCall className="w-3.5 h-3.5 mr-1.5" />
              New Call
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* STATS */}
        <ErpStatGrid
          stats={[
            {
              label: "Logged Outreach Calls",
              value: calls.length.toString(),
              change: "All recorded sessions",
              trend: "neutral",
              icon: <PhoneCall className="w-5 h-5 text-blue-500" />,
            },
            {
              label: "Connection Rate",
              value: `${connectRate}%`,
              change: `${connectedCalls} answered calls`,
              trend: "up",
              icon: <Radio className="w-5 h-5 text-emerald-500" />,
            },
            {
              label: "Qualified Corporate Leads",
              value: qualifiedCount.toString(),
              change: "High purchase intent",
              trend: "up",
              icon: <Target className="w-5 h-5 text-purple-500" />,
            },
            {
              label: "Avg Call Duration",
              value: formatSeconds(avgDurationSec),
              change: `${totalDuration}s total spoken airtime`,
              trend: "neutral",
              icon: <Clock className="w-5 h-5 text-amber-500" />,
            },
          ]}
        />

        {/* FILTER BAR */}
        <NexaCard padding="md" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 max-w-md">
              <NexaInput
                placeholder="Search by prospect name, company, or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-[var(--nexa-text-muted)]" />}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {[
                { id: "ALL", label: "All Calls" },
                { id: "QUALIFIED", label: "Qualified (Interested / Won)" },
                { id: "UNQUALIFIED", label: "Not Interested" },
                { id: "BUSY", label: "Busy" },
                { id: "NO_ANSWER", label: "No Answer" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setOutcomeFilter(opt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    outcomeFilter === opt.id
                      ? "bg-[#1A56DB] text-white shadow-xs"
                      : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </NexaCard>

        {/* CALLS LIST TABLE */}
        <NexaCard padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-surface)] border-b border-[var(--nexa-border)] text-[var(--nexa-text-muted)] uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Prospect & Company</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Outcome</th>
                  <th className="py-3 px-3">AI Intelligence & Summary</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-secondary)]">
                {filteredCalls.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-[var(--nexa-text-muted)] italic">
                      No matching voice call logs found.
                    </td>
                  </tr>
                ) : (
                  filteredCalls.map((call) => {
                    const isQualified =
                      call.outcome.includes("INTERESTED") || call.outcome.includes("WON");
                    const isRejected = call.outcome.includes("NOT_INTERESTED");

                    return (
                      <tr
                        key={call.id}
                        className="hover:bg-[var(--nexa-bg-surface)]/60 transition-colors cursor-pointer"
                        onClick={() => setSelectedCall(call)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[var(--nexa-text-primary)] text-sm">
                            {call.contactName}
                          </div>
                          <div className="text-[11px] text-[var(--nexa-text-muted)] flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" />
                            {call.company}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-[11px]">
                          {call.phoneNumber}
                        </td>
                        <td className="py-3.5 px-3 font-medium">
                          {formatSeconds(call.durationSeconds)}
                        </td>
                        <td className="py-3.5 px-3">
                          <NexaBadge
                            variant={
                              isQualified
                                ? "success"
                                : isRejected
                                ? "danger"
                                : call.outcome.includes("NEGOTIATING")
                                ? "brand"
                                : "neutral"
                            }
                          >
                            {call.outcome}
                          </NexaBadge>
                        </td>
                        <td className="py-3.5 px-3 max-w-sm truncate" title={call.aiSummary || call.notes}>
                          <span className="text-[11px]">
                            {call.aiSummary || call.notes || "Call completed."}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-[11px] text-[var(--nexa-text-muted)] whitespace-nowrap">
                          {new Date(call.callDate).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <NexaButton
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCall(call);
                            }}
                            className="text-xs font-semibold rounded-lg"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1 text-[#1A56DB]" />
                            Transcript
                          </NexaButton>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </NexaCard>
      </div>

      {/* TRANSCRIPT & QUALIFICATION DETAILS MODAL */}
      <NexaModal
        isOpen={Boolean(selectedCall)}
        onClose={() => setSelectedCall(null)}
        title="Call Dialogue Transcript & CRM Summary"
        maxWidth="2xl"
      >
        {selectedCall && (
          <div className="space-y-5">
            {/* Call Meta Header */}
            <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-base text-[var(--nexa-text-primary)]">
                  {selectedCall.contactName} &bull; {selectedCall.company}
                </h4>
                <div className="text-xs text-[var(--nexa-text-muted)] flex items-center gap-3 mt-1">
                  <span className="font-mono">{selectedCall.phoneNumber}</span>
                  <span>Duration: {formatSeconds(selectedCall.durationSeconds)}</span>
                  <span>
                    Date: {new Date(selectedCall.callDate).toLocaleString()}
                  </span>
                </div>
              </div>
              <NexaBadge
                size="md"
                variant={
                  selectedCall.outcome.includes("INTERESTED") || selectedCall.outcome.includes("WON")
                    ? "success"
                    : selectedCall.outcome.includes("NOT_INTERESTED")
                    ? "danger"
                    : "neutral"
                }
              >
                {selectedCall.outcome}
              </NexaBadge>
            </div>

            {/* AI Summary Box */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1.5">
              <span className="text-xs font-bold text-[#1A56DB] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Executive Summary
              </span>
              <p className="text-xs text-[var(--nexa-text-primary)] leading-relaxed">
                {selectedCall.aiSummary || selectedCall.notes || "No automated summary generated."}
              </p>
            </div>

            {/* Structured Qualification Breakdown (if present) */}
            {(() => {
              const qual = parseQualification(selectedCall.qualificationJson);
              if (!qual) return null;
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase font-bold block">
                      Qualification Score
                    </span>
                    <span className="font-bold text-[#1A56DB] text-sm">
                      {qual.score ? `${qual.score}/100` : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase font-bold block">
                      Fleet Size Est.
                    </span>
                    <span className="font-semibold text-[var(--nexa-text-primary)]">
                      {qual.fleet_size_estimate || "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase font-bold block">
                      Budget Confirmed
                    </span>
                    <span className="font-semibold text-[var(--nexa-text-primary)]">
                      {qual.budget_confirmed ? "Yes" : "Pending"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase font-bold block">
                      Next Step
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {qual.reason || "Follow up scheduled"}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Audio Recording Player (if present) */}
            {selectedCall.recordingUrl && (
              <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 text-[#1A56DB]" />
                  Call Audio Recording
                </span>
                <audio controls src={selectedCall.recordingUrl} className="h-8" />
              </div>
            )}

            {/* Turn-by-Turn Dialogue Transcript */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--nexa-text-primary)] block">
                Turn-by-Turn Conversation Transcript
              </span>
              <div className="max-h-80 overflow-y-auto space-y-2.5 p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                {parseTranscript(selectedCall.transcript).length === 0 ? (
                  <p className="text-xs text-[var(--nexa-text-muted)] italic text-center py-6">
                    No transcript audio turns recorded for this session.
                  </p>
                ) : (
                  parseTranscript(selectedCall.transcript).map((turn: any, idx: number) => {
                    const isAssistant = turn.speaker === "assistant";
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}
                      >
                        <span className="text-[10px] font-bold text-[var(--nexa-text-muted)] mb-0.5 px-1">
                          {isAssistant ? "Ofia Voice Agent" : selectedCall.contactName}
                        </span>
                        <div
                          className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                            isAssistant
                              ? "bg-blue-600 text-white rounded-tl-none shadow-xs"
                              : "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-primary)] border border-[var(--nexa-border)] rounded-tr-none"
                          }`}
                        >
                          {turn.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <NexaButton variant="primary" onClick={() => setSelectedCall(null)}>
                Close Viewer
              </NexaButton>
            </div>
          </div>
        )}
      </NexaModal>
    </ErpAdminShell>
  );
}
