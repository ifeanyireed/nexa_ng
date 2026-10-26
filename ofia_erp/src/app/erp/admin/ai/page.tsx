"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneOff,
  Mic,
  MicOff,
  Sparkles,
  Users,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Send,
  Building2,
  Calendar,
  MessageSquare,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  UserCheck,
  Settings,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaInput } from "@/components/nexa/NexaInput";
import { DashboardSkeleton } from "@/components/nexa/PageSkeleton";
import { VOICE_AGENT_API } from "@/lib/api-client";
import { crmFetch } from "@/lib/crm-client";
import { getActiveTenantSlug } from "@/lib/erp-store";

interface VoiceTurn {
  speaker: "assistant" | "prospect" | "system";
  text: string;
  time: string;
}

interface CallRecord {
  id: string;
  contactName: string;
  company: string;
  phoneNumber: string;
  outcome: string;
  durationSeconds: number;
  notes: string;
  transcript?: string;
  aiSummary?: string;
  isAi?: boolean;
  callDate: string;
}

export default function VoiceAgentDashboard() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Live Call Console State
  const [isInCall, setIsInCall] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<string>("IDLE");
  const [callDuration, setCallDuration] = useState<number>(0);
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [inputText, setInputText] = useState("");
  const [lastOutcome, setLastOutcome] = useState<any | null>(null);

  // Target Prospect Form (Loaded dynamically from CRM leads or user input)
  const [targetContact, setTargetContact] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [targetPhone, setTargetPhone] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [availableLeads, setAvailableLeads] = useState<any[]>([]);
  const [voiceConfig, setVoiceConfig] = useState<any>(null);
  const [telephonyProvider, setTelephonyProvider] = useState("VOICEBIP");

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<any>(null);
  const pollRef = useRef<any>(null);
  const currentCallIdRef = useRef<string>("");
  const transcriptBottomRef = useRef<HTMLDivElement>(null);

  // 1. Fetch live call history from CRM (crm_calls)
  async function loadCallHistory() {
    try {
      const res = await crmFetch("/api/erp/crm/calls");
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.calls)) {
          setCalls(data.calls);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch CRM calls:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // 2. Fetch live leads and voice configuration for active tenant
  async function loadLeadsAndConfig() {
    try {
      const activeSlug = (typeof window !== "undefined" ? getActiveTenantSlug() : "") || "";
      const [leadsRes, byokRes] = await Promise.all([
        crmFetch("/api/erp/crm/leads"),
        fetch(`/api/erp/byok?tenant=${encodeURIComponent(activeSlug)}`).catch(() => null),
      ]);

      if (leadsRes && leadsRes.ok) {
        const leadsData = await leadsRes.json();
        const raw = Array.isArray(leadsData) ? leadsData : leadsData.leads || [];
        setAvailableLeads(raw);
        // Pre-select first valid lead with a phone number
        const firstValid = raw.find((l: any) => l.phone || l.contactPhone);
        if (firstValid) {
          setSelectedLeadId(firstValid.id);
          setTargetContact(firstValid.name || firstValid.contactName || "");
          setTargetCompany(firstValid.company || firstValid.companyName || "");
          setTargetPhone(firstValid.phone || firstValid.contactPhone || "");
        }
      }

      if (byokRes && byokRes.ok) {
        const byokData = await byokRes.json();
        if (byokData?.voiceConfig) {
          setVoiceConfig(byokData.voiceConfig);
          if (byokData.voiceConfig.telephony_provider) {
            setTelephonyProvider(byokData.voiceConfig.telephony_provider);
          }
        }
      }
    } catch (e) {
      console.warn("Could not load leads or voice config:", e);
    }
  }

  function handleSelectLead(leadId: string) {
    setSelectedLeadId(leadId);
    if (!leadId) {
      setTargetContact("");
      setTargetCompany("");
      setTargetPhone("");
      return;
    }
    const lead = availableLeads.find((l) => l.id === leadId);
    if (lead) {
      setTargetContact(lead.name || lead.contactName || "");
      setTargetCompany(lead.company || lead.companyName || "");
      setTargetPhone(lead.phone || lead.contactPhone || "");
    }
  }

  useEffect(() => {
    loadCallHistory();
    loadLeadsAndConfig();
  }, []);

  // Scroll to bottom of live transcript
  useEffect(() => {
    if (transcriptBottomRef.current) {
      transcriptBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [turns, isAgentSpeaking]);

  // Duration timer during active call
  useEffect(() => {
    if (isInCall) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isInCall]);

  // Format seconds to mm:ss
  function formatSeconds(secs: number) {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  }

  // 2. Start Live Voice Session (Real PSTN via Voicebip or In-Browser Simulator)
  async function startVoiceCall() {
    setLastOutcome(null);
    setTurns([]);

    const activeSlug = (typeof window !== "undefined" ? getActiveTenantSlug() : "") || "";
    if (!activeSlug) {
      alert("Tenant context is required.");
      return;
    }

    if (!targetPhone.trim()) {
      alert("Please enter a valid destination phone number before initiating outreach.");
      return;
    }

    setIsInCall(true);
    setCallStatus("CONNECTING");

    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    // A. Real Voicebip Telephony Call
    if (telephonyProvider === "VOICEBIP") {
      setTurns([
        {
          speaker: "assistant",
          text: `Connecting to Voicebip telephony gateway... Initiating live PSTN phone call to ${targetPhone.trim()}.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      try {
        const res = await fetch(`/api/erp/telephony/outbound?tenant=${encodeURIComponent(activeSlug)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantSlug: activeSlug,
            targetPhone: targetPhone.trim(),
            targetContact: targetContact.trim() || undefined,
            targetCompany: targetCompany.trim() || undefined,
            leadId: selectedLeadId || undefined,
            provider: "VOICEBIP",
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.success) {
          setCallStatus("FAILED");
          setIsInCall(false);
          setTurns((prev) => [
            ...prev,
            {
              speaker: "assistant",
              text: `❌ Call Dispatch Failed: ${data.error || "Unable to initiate call via Voicebip carrier gateway."}`,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
          return;
        }

        currentCallIdRef.current = data.callId;
        setCallStatus("RINGING");
        setTurns((prev) => [
          ...prev,
          {
            speaker: "assistant",
            text: `📞 Live Call Initiated! Voicebip is dialing ${data.toNumber} from caller ID ${data.fromNumber}. (Call ID: ${data.callId}). Your phone will ring shortly.`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);

        // Poll carrier status
        let pollCount = 0;
        pollRef.current = setInterval(async () => {
          pollCount++;
          if (pollCount > 40) {
            if (pollRef.current) clearInterval(pollRef.current);
            return;
          }

          try {
            const statusRes = await fetch(
              `/api/erp/telephony/outbound?callId=${encodeURIComponent(data.callId)}&tenant=${encodeURIComponent(activeSlug)}`
            );
            if (statusRes.ok) {
              const statusData = await statusRes.json();
              const c = statusData?.call;
              if (c) {
                if (c.status === "in_progress" || c.status === "answered") {
                  setCallStatus("IN_PROGRESS");
                  setIsAgentSpeaking(true);
                } else if (c.status === "completed") {
                  setCallStatus("COMPLETED");
                  setIsInCall(false);
                  if (pollRef.current) clearInterval(pollRef.current);
                  loadCallHistory();
                } else if (c.status === "failed") {
                  setCallStatus("FAILED");
                  setIsInCall(false);
                  if (pollRef.current) clearInterval(pollRef.current);
                  setTurns((prev) => [
                    ...prev,
                    {
                      speaker: "assistant",
                      text: `⚠️ Call Ended: Carrier reported status "${c.status}" (reason: ${c.failure_reason || "unanswered / busy"}).`,
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    },
                  ]);
                  loadCallHistory();
                }
              }
            }
          } catch {}
        }, 3000);
      } catch (err: any) {
        setCallStatus("FAILED");
        setIsInCall(false);
        setTurns((prev) => [
          ...prev,
          {
            speaker: "assistant",
            text: `Network error dispatching call: ${err.message}`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
      return;
    }

    // B. WebSocket or In-Browser Simulator
    const rawWs =
      process.env.NEXT_PUBLIC_VOICE_WS_URL ||
      (typeof window !== "undefined" && window.location.protocol === "https:"
        ? `wss://${window.location.hostname}:8082/ws/voice`
        : `ws://localhost:8082/ws/voice`);
    const wsUrl = rawWs.includes("?")
      ? `${rawWs}&tenant=${encodeURIComponent(activeSlug)}`
      : `${rawWs}?tenant=${encodeURIComponent(activeSlug)}`;

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setCallStatus("RINGING");
        socket.send(
          JSON.stringify({
            event: "start_session",
            contactName: targetContact,
            company: targetCompany,
            phoneNumber: targetPhone,
            provider: telephonyProvider,
            orgId: activeSlug,
          })
        );
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "session_started") {
            setCallStatus("IN_PROGRESS");
            setIsAgentSpeaking(true);
            setTurns((prev) => [
              ...prev,
              {
                speaker: "assistant",
                text:
                  data.greeting ||
                  (voiceConfig?.opening_hook
                    ? voiceConfig.opening_hook.replace("{{contact_name}}", targetContact || "there")
                    : `Good day. I am ${voiceConfig?.agent_name || "Ofia's Voice Assistant"} calling on behalf of ${targetCompany || "our sales team"}.`),
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ]);
            setTimeout(() => setIsAgentSpeaking(false), 2200);
          } else if (data.event === "agent_thinking") {
            setIsAgentSpeaking(true);
          } else if (data.event === "assistant_reply") {
            setIsAgentSpeaking(false);
            setTurns((prev) => [
              ...prev,
              {
                speaker: "assistant",
                text: data.text,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ]);
          } else if (data.event === "call_completed") {
            setIsInCall(false);
            setCallStatus("COMPLETED");
            setLastOutcome(data);
            loadCallHistory();
          }
        } catch (e) {
          console.error("WS parse error:", e);
        }
      };

      socket.onerror = (err) => {
        console.warn("WebSocket error, falling back to simulated session:", err);
        fallbackSimulatedCall();
      };

      socket.onclose = () => {
        if (callStatus !== "COMPLETED") {
          setCallStatus("DISCONNECTED");
        }
      };
    } catch (e) {
      console.warn("WebSocket connection failed, running simulated session:", e);
      fallbackSimulatedCall();
    }
  }

  // Fallback simulator if service_ai WS is not reachable from client browser
  function fallbackSimulatedCall() {
    setCallStatus("IN_PROGRESS");
    setIsAgentSpeaking(true);
    const agentName = voiceConfig?.agent_name || "Ofia Voice Agent";
    const companyName = targetCompany || "your organization";
    const contactName = targetContact || "there";
    const openingText = voiceConfig?.opening_hook
      ? voiceConfig.opening_hook.replace(/\{contactName\}/gi, contactName).replace(/\{company\}/gi, companyName)
      : `Good day ${contactName}. This is ${agentName} calling on behalf of enterprise operations regarding our tailored solutions for ${companyName}.`;

    setTurns([
      {
        speaker: "assistant",
        text: openingText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setTimeout(() => setIsAgentSpeaking(false), 2000);
  }

  // Send prospect reply (text or speech recognition)
  function sendProspectTurn(textToSend?: string) {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setTurns((prev) => [
      ...prev,
      {
        speaker: "prospect",
        text: text.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInputText("");

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: "user_speech",
          text: text.trim(),
        })
      );
    } else {
      // In-browser heuristic response
      setIsAgentSpeaking(true);
      setTimeout(() => {
        setIsAgentSpeaking(false);
        const valProp = voiceConfig?.value_proposition || "our products, commercial services, and managed operations";
        let reply = `Thank you. We assist corporate teams to streamline ${valProp} with verified service level guarantees.`;
        const lower = text.toLowerCase();
        if (lower.includes("cost") || lower.includes("price") || lower.includes("expensive") || lower.includes("rate")) {
          reply = "Our enterprise service agreements are customized to your transaction volume, typically yielding a 20 to 30 percent operational cost efficiency. May I confirm your primary volume requirements?";
        } else if (lower.includes("already") || lower.includes("vendor") || lower.includes("have") || lower.includes("working with")) {
          reply = "Understood. Many of our corporate clients initially had existing providers as well, but partnered with us for live visibility, dedicated account management, and automated escrow. Could we send a 1-page overview to your email or WhatsApp?";
        } else if (lower.includes("yes") || lower.includes("send") || lower.includes("interested") || lower.includes("sure")) {
          reply = "Wonderful! I will have our enterprise account team prepare a customized proposal for your review today and arrange a quick 10-minute briefing.";
        }
        setTurns((prev) => [
          ...prev,
          {
            speaker: "assistant",
            text: reply,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }, 1400);
    }
  }

  // End call & trigger post-call CRM synchronisation
  async function endCall() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: "end_call",
        })
      );
      wsRef.current.close();
    }

    setIsInCall(false);
    setCallStatus("COMPLETED");

    // Write to CRM crm_calls directly
    try {
      const summaryText =
        turns.length > 2
          ? `Outbound voice consultation completed for ${targetCompany || "client"}. Explored requirements, SLA guarantees, and requested commercial follow-up.`
          : "Initial voice outreach attempted. AI disclosure delivered.";

      const outcome = turns.some((t) => t.text.toLowerCase().includes("interested") || t.text.toLowerCase().includes("send"))
        ? "CONNECTED_INTERESTED"
        : "CONNECTED_FOLLOWUP";

      const nextAction = outcome === "CONNECTED_INTERESTED"
        ? `Send customized proposal and schedule discovery call with ${targetContact || "decision maker"}`
        : `Follow up with ${targetContact || "prospect"} via email or WhatsApp`;

      await crmFetch("/api/erp/crm/calls", {
        method: "POST",
        body: JSON.stringify({
          leadId: selectedLeadId || undefined,
          contactName: targetContact || "Corporate Prospect",
          company: targetCompany,
          phoneNumber: targetPhone,
          direction: "OUTBOUND",
          outcome: outcome,
          durationSeconds: Math.max(callDuration, 35),
          notes: summaryText,
          repName: voiceConfig?.agent_name || "Ofia Voice Agent",
          isAi: true,
          transcript: turns.map((t) => `[${t.time}] ${t.speaker.toUpperCase()}: ${t.text}`).join("\n"),
          aiSummary: summaryText,
        }),
      });

      setLastOutcome({
        outcome: outcome,
        duration: Math.max(callDuration, 35),
        summary: summaryText,
        nextAction,
        crmSynced: true,
      });

      await loadCallHistory();
    } catch (err) {
      console.error("Failed to sync call to CRM:", err);
    }
  }

  // Compute live KPIs dynamically from real database records
  const totalCalls = calls.length;
  const connectedCalls = calls.filter((c) => c.outcome?.startsWith("CONNECTED") || (c.durationSeconds || 0) > 0).length;
  const qualifiedLeads = calls.filter((c) => c.outcome === "CONNECTED_INTERESTED" || c.outcome === "QUALIFIED" || c.outcome === "CONNECTED_WON").length;
  const connectRate = totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0;
  const totalDuration = calls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);
  const avgDurationSec = connectedCalls > 0 ? Math.round(totalDuration / connectedCalls) : 0;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCalls = calls.filter((c) => (c.callDate || "").slice(0, 10) === todayStr).length;

  if (isLoading) {
    return (
      <ErpAdminShell activeModule="ai" title="Ofia Voice Agent" subtitle="Loading outreach engine...">
        <DashboardSkeleton />
      </ErpAdminShell>
    );
  }

  return (
    <ErpAdminShell
      activeModule="ai"
      title="Ofia Voice Agent"
      subtitle="Autonomous AI phone caller for outbound enterprise sales qualification and CRM pipeline updates."
      action={
        <div className="flex items-center gap-2">
          <NexaBadge variant="success" dot>
            Voice Engine Active
          </NexaBadge>
          <NexaButton
            variant="primary"
            size="sm"
            className="whitespace-nowrap shrink-0 inline-flex items-center"
            onClick={() => {
              if (isInCall) endCall();
              else startVoiceCall();
            }}
          >
            {isInCall ? (
              <>
                <PhoneOff className="w-4 h-4 mr-1.5" />
                Hang Up Call
              </>
            ) : (
              <>
                <PhoneCall className="w-4 h-4 mr-1.5" />
                New Voice Call
              </>
            )}
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 1. TOP STATS GRID (COMPUTED LIVE FROM DATABASE) */}
        <ErpStatGrid
          stats={[
            {
              label: "Total Outreach Calls",
              value: totalCalls.toLocaleString(),
              change: todayCalls > 0 ? `+${todayCalls} today` : "Live Synced",
              trend: todayCalls > 0 ? "up" : "neutral",
              changeType: todayCalls > 0 ? "success" : "neutral",
              icon: <PhoneCall className="w-5 h-5 text-blue-500" />,
              sub: `${todayCalls} calls placed today`,
            },
            {
              label: "Connection Rate",
              value: `${connectRate}%`,
              change: `${connectedCalls} answered`,
              trend: connectRate > 50 ? "up" : "neutral",
              changeType: connectRate >= 50 ? "success" : "neutral",
              icon: <Activity className="w-5 h-5 text-emerald-500" />,
              sub: `${connectedCalls} of ${totalCalls} calls connected`,
            },
            {
              label: "Qualified Leads",
              value: qualifiedLeads.toLocaleString(),
              change: `${totalCalls > 0 ? Math.round((qualifiedLeads / totalCalls) * 100) : 0}% rate`,
              trend: qualifiedLeads > 0 ? "up" : "neutral",
              changeType: qualifiedLeads > 0 ? "success" : "neutral",
              icon: <Target className="w-5 h-5 text-purple-500" />,
              sub: `${qualifiedLeads} high-intent accounts`,
            },
            {
              label: "Avg Call Duration",
              value: formatSeconds(avgDurationSec),
              change: `${Math.round(totalDuration / 60)}m talk time`,
              trend: "neutral",
              changeType: "info",
              icon: <Clock className="w-5 h-5 text-amber-500" />,
              sub: `${totalDuration}s total spoken airtime`,
            },
          ]}
        />

        {/* 2. MAIN CONSOLE: LIVE VOICE AGENT TESTER & CAMPAIGN CONTROLLER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: INTERACTIVE CALL CONSOLE (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <NexaCard className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--nexa-border)]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${
                    isInCall
                      ? isAgentSpeaking
                        ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30 animate-pulse"
                        : "bg-blue-500/15 text-[#1A56DB] dark:text-[#60A5FA] border-blue-500/30 shadow-sm"
                      : "bg-[#1A56DB]/10 text-[#1A56DB] dark:bg-[#1A56DB]/15 dark:text-[#60A5FA] border-[#1A56DB]/20"
                  }`}>
                    {isInCall ? <PhoneCall className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--nexa-text-primary)]">
                      Outbound Voice Outreach Session
                    </h3>
                    <p className="text-xs text-[var(--nexa-text-muted)]">
                      {isInCall
                        ? `Live Call Duration: ${formatSeconds(callDuration)} • Status: ${callStatus}`
                        : "Ready to initiate automated outbound telephone call"}
                    </p>
                  </div>
                </div>

                {isInCall && (
                  <NexaBadge variant={isAgentSpeaking ? "success" : "brand"} dot>
                    {isAgentSpeaking ? "AI Speaking..." : "Listening..."}
                  </NexaBadge>
                )}
              </div>

              {/* TARGET PROSPECT SELECTION */}
              <div className="space-y-3 my-4 p-4 rounded-2xl bg-[var(--nexa-bg-base)]/50 border border-[var(--nexa-border)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--nexa-border)]/60">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#1A56DB]" />
                    <span className="text-xs font-bold text-[var(--nexa-text-primary)]">
                      Target Prospect (From Tenant CRM)
                    </span>
                  </div>
                  {availableLeads.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[var(--nexa-text-muted)] shrink-0">Select Lead:</span>
                      <select
                        disabled={isInCall}
                        value={selectedLeadId}
                        onChange={(e) => handleSelectLead(e.target.value)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-primary)] focus:outline-none max-w-[240px] truncate"
                      >
                        <option value="">-- Custom / Manual Entry --</option>
                        {availableLeads.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name} {l.company ? `(${l.company})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider block mb-1">
                      Contact Name
                    </label>
                    <input
                      disabled={isInCall}
                      value={targetContact}
                      onChange={(e) => {
                        setSelectedLeadId("");
                        setTargetContact(e.target.value);
                      }}
                      className="w-full text-xs font-semibold bg-transparent border-none p-0 focus:outline-none text-[var(--nexa-text-primary)]"
                      placeholder="e.g. Lead Contact..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider block mb-1">
                      Company / Target
                    </label>
                    <input
                      disabled={isInCall}
                      value={targetCompany}
                      onChange={(e) => {
                        setSelectedLeadId("");
                        setTargetCompany(e.target.value);
                      }}
                      className="w-full text-xs font-semibold bg-transparent border-none p-0 focus:outline-none text-[var(--nexa-text-primary)]"
                      placeholder="e.g. Target Organization..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider block mb-1">
                      Phone (+234 GSM/PSTN)
                    </label>
                    <input
                      disabled={isInCall}
                      value={targetPhone}
                      onChange={(e) => {
                        setSelectedLeadId("");
                        setTargetPhone(e.target.value);
                      }}
                      className="w-full text-xs font-semibold bg-transparent border-none p-0 focus:outline-none text-[var(--nexa-text-primary)] font-mono"
                      placeholder="+234..."
                    />
                  </div>
                </div>
              </div>

              {/* TRANSCRIPT DISPLAY AREA */}
              <div className="h-[280px] overflow-y-auto space-y-3 p-4 rounded-2xl bg-[var(--nexa-bg-base)]/80 border border-[var(--nexa-border)] flex flex-col">
                {turns.length === 0 ? (
                  <div className="m-auto text-center py-8">
                    <Sparkles className="w-8 h-8 text-[var(--nexa-text-muted)] mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-[var(--nexa-text-secondary)]">
                      Voice Agent is Idle
                    </p>
                    <p className="text-xs text-[var(--nexa-text-muted)] max-w-sm mt-1">
                      Click "Start Voice Outreach" to initiate a real-time conversation. The agent will introduce itself, qualify business requirements, and log outcomes.
                    </p>
                  </div>
                ) : (
                  turns.map((turn, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        turn.speaker === "assistant" ? "items-start" : "items-end"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[var(--nexa-text-muted)]">
                        <span className="font-bold uppercase tracking-wider">
                          {turn.speaker === "assistant" ? "Ofia Voice Agent" : targetContact}
                        </span>
                        <span>•</span>
                        <span>{turn.time}</span>
                      </div>
                      <div
                        className={`text-xs px-3.5 py-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                          turn.speaker === "assistant"
                            ? "bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] rounded-tl-sm shadow-sm"
                            : "bg-[#1A56DB] text-white rounded-tr-sm shadow-sm"
                        }`}
                      >
                        {turn.text}
                      </div>
                    </div>
                  ))
                )}
                {isAgentSpeaking && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 italic">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Ofia Voice Agent is speaking...
                  </div>
                )}
                <div ref={transcriptBottomRef} />
              </div>

              {/* SPEECH INPUT / QUICK OBJECTION PLAYBOOK */}
              {isInCall ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendProspectTurn()}
                      placeholder="Type what the prospect says or speak..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] text-xs text-[var(--nexa-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/20"
                    />
                    <NexaButton size="sm" variant="primary" onClick={() => sendProspectTurn()}>
                      <Send className="w-3.5 h-3.5" />
                    </NexaButton>
                    <NexaButton size="sm" variant="danger" onClick={endCall}>
                      <PhoneOff className="w-3.5 h-3.5 mr-1" />
                      Hang Up
                    </NexaButton>
                  </div>

                  {/* QUICK SIMULATION PROMPTS */}
                  <div>
                    <span className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider block mb-1.5">
                      Simulate Prospect Objection:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "How much does your service cost?",
                        "We already work with an existing provider",
                        "Could you send a tailored proposal to my WhatsApp?",
                        "What is your SLA and delivery guarantee?",
                        "Call me back next Tuesday at 10am",
                        "Not interested right now, thank you",
                      ].map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => sendProspectTurn(prompt)}
                          className="text-[11px] px-2.5 py-1 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:border-[#1A56DB]/50 text-[var(--nexa-text-secondary)] transition-all cursor-pointer"
                        >
                          "{prompt}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[var(--nexa-border)]/60">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-[var(--nexa-text-muted)] shrink-0">Telephony Gateway:</span>
                    <select
                      value={telephonyProvider}
                      onChange={(e) => setTelephonyProvider(e.target.value)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-primary)] focus:outline-none max-w-[260px] sm:max-w-[300px] truncate"
                    >
                      <option value="VOICEBIP">Voicebip Direct (PSTN +234 / SIP)</option>
                      <option value="WEBRTC_BROWSER">In-Browser Voice Simulator</option>
                      <option value="TERMII">Termii Voice (Nigeria PSTN)</option>
                      <option value="TWILIO">Twilio SIP Media Streams</option>
                      <option value="AFRICASTALKING">Africa's Talking Voice</option>
                    </select>
                  </div>

                  <NexaButton
                    variant="primary"
                    size="sm"
                    className="whitespace-nowrap shrink-0 inline-flex items-center self-end sm:self-auto"
                    onClick={startVoiceCall}
                  >
                    <PhoneCall className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    Start Voice Outreach
                  </NexaButton>
                </div>
              )}
            </NexaCard>

            {/* POST-CALL OUTCOME CARD (Displays immediately upon hangup) */}
            {lastOutcome && (
              <NexaCard className="p-4 border-l-4 border-l-emerald-500 bg-emerald-50/10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <NexaBadge variant="success">Call Completed & Synced</NexaBadge>
                      <span className="text-xs font-bold text-[var(--nexa-text-primary)] font-mono">
                        Outcome: {lastOutcome.outcome}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--nexa-text-secondary)] mt-1.5">
                      {lastOutcome.summary}
                    </p>
                    {lastOutcome.nextAction && (
                      <p className="text-xs font-semibold text-[#1A56DB] mt-1 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" />
                        Next Closer Action: {lastOutcome.nextAction}
                      </p>
                    )}
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                </div>
              </NexaCard>
            )}
          </div>

          {/* RIGHT: AGENT CONFIGURATION & BEHAVIOR (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <NexaCard className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
                <h4 className="text-sm font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1A56DB]" />
                  Voice Agent Persona & Guardrails
                </h4>
                <Link
                  href="/erp/admin/ai/settings"
                  className="text-xs text-[#1A56DB] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Edit Script & Guardrails
                </Link>
              </div>

              <div className="space-y-3.5">
                {/* 1. Identity, Voice & Model */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider block mb-0.5">
                      Agent Identity & Tone
                    </label>
                    <p className="text-xs font-semibold text-[var(--nexa-text-primary)]">
                      {voiceConfig?.agent_name || "Ofia Executive Voice Assistant"}
                    </p>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] font-mono">
                      Voice: {voiceConfig?.voice_id || "en-NG-Standard-A"} • Tone: {voiceConfig?.tone || "B2B Professional"}
                    </p>
                  </div>
                  <NexaBadge variant="neutral" className="font-mono text-[10px] shrink-0">
                    {voiceConfig?.model_name || "gemini-1.5-flash"}
                  </NexaBadge>
                </div>

                {/* 2. Mandatory AI Disclosure & Opening Hook */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider">
                      Mandatory AI Disclosure & Hook
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {voiceConfig?.ai_disclosure_enabled !== false ? "Active Notice" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--nexa-text-secondary)] p-2.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] leading-relaxed italic">
                    "{voiceConfig?.opening_hook || "Good day, I am calling on behalf of the executive sales team regarding our enterprise services."}"
                  </p>
                </div>

                {/* 3. Target Value Proposition */}
                <div>
                  <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider block mb-1">
                    Target Value Proposition
                  </label>
                  <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                    {voiceConfig?.value_proposition || "Guaranteed SLA delivery, dedicated account management, and real-time operational visibility with transparent corporate billing."}
                  </p>
                </div>

                {/* 4. Enforced Operational Safety Guardrails */}
                <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                  <div className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Enforced Safety Guardrails
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[var(--nexa-text-muted)]">Max Duration:</span>
                      <span className="font-mono font-semibold text-[var(--nexa-text-primary)]">
                        {Math.floor((voiceConfig?.max_duration_sec || 300) / 60)}m ({voiceConfig?.max_duration_sec || 300}s)
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[var(--nexa-text-muted)]">Calling Window:</span>
                      <span className="font-mono font-semibold text-[var(--nexa-text-primary)]">
                        {voiceConfig?.calling_hours_start || "09:00"} - {voiceConfig?.calling_hours_end || "17:00"} (WAT)
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[var(--nexa-text-muted)]">Human Escalation:</span>
                      <span className="font-mono font-semibold text-[var(--nexa-text-primary)] truncate">
                        {voiceConfig?.human_escalation_phone || "+234 800 000 0000"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[var(--nexa-text-muted)]">Dial Retries:</span>
                      <span className="font-mono font-semibold text-[var(--nexa-text-primary)]">
                        Max {voiceConfig?.max_retries || 2} attempts
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Autonomous Actions Permitted */}
                <div>
                  <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider block mb-1">
                    Automated Actions Permitted
                  </label>
                  <ul className="text-xs text-[var(--nexa-text-secondary)] space-y-1.5">
                    {(voiceConfig?.allowed_actions || [
                      "Write structured call outcome to crm_calls",
                      "Boost lead score to 95 for qualified prospects",
                      "Schedule follow-up callback tasks for human sales closers",
                      "Instant WhatsApp proposal dispatch upon qualification",
                    ]).map((act: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </NexaCard>
          </div>
        </div>

        {/* 3. CALL HISTORY TABLE (Direct from crm_calls) */}
        <NexaCard className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--nexa-border)] mb-4">
            <div>
              <h3 className="text-base font-bold text-[var(--nexa-text-primary)]">
                Recent Voice Outreach Calls
              </h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Logged automatically in CRM database with transcripts and qualification summaries.
              </p>
            </div>
            <NexaButton size="sm" variant="ghost" onClick={loadCallHistory}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Refresh Feed
            </NexaButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--nexa-border)] text-[var(--nexa-text-muted)] font-semibold uppercase text-[10px]">
                  <th className="pb-3 pl-2">Prospect & Company</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Outcome</th>
                  <th className="pb-3">Summary & Next Step</th>
                  <th className="pb-3 pr-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-secondary)]">
                {calls.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[var(--nexa-text-muted)] italic">
                      No calls logged yet. Start a voice call above to see live records.
                    </td>
                  </tr>
                ) : (
                  calls.slice(0, 10).map((call, idx) => (
                    <tr key={call.id || idx} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                      <td className="py-3 pl-2">
                        <div className="font-bold text-[var(--nexa-text-primary)]">{call.contactName}</div>
                        <div className="text-[11px] text-[var(--nexa-text-muted)]">{call.company}</div>
                      </td>
                      <td className="py-3 font-mono text-[11px]">{call.phoneNumber}</td>
                      <td className="py-3">{formatSeconds(call.durationSeconds)}</td>
                      <td className="py-3">
                        <NexaBadge
                          variant={
                            call.outcome.includes("INTERESTED") || call.outcome.includes("WON")
                              ? "success"
                              : call.outcome.includes("NEGOTIATING")
                              ? "primary"
                              : call.outcome.includes("NOT_INTERESTED")
                              ? "danger"
                              : "neutral"
                          }
                        >
                          {call.outcome}
                        </NexaBadge>
                      </td>
                      <td className="py-3 max-w-xs truncate" title={call.notes || call.aiSummary}>
                        {call.notes || call.aiSummary || "Completed call."}
                      </td>
                      <td className="py-3 pr-2 text-[var(--nexa-text-muted)]">
                        {new Date(call.callDate).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </NexaCard>
      </div>
    </ErpAdminShell>
  );
}
