"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import {
  PhoneCall,
  Radio,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Clock,
  Sparkles,
  PhoneForwarded,
  Sliders,
  ExternalLink,
} from "lucide-react";

export default function VoiceSettingsPage() {
  const [activeTab, setActiveTab] = useState<"telephony" | "persona" | "guardrails">("telephony");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Telephony & Voicebip State
  const [telephonyProvider, setTelephonyProvider] = useState<"voicebip" | "webrtc_browser" | "termii" | "twilio">("voicebip");
  const [voicebipApiKey, setVoicebipApiKey] = useState("");
  const [voicebipApiSecret, setVoicebipApiSecret] = useState("");
  const [voicebipSipEndpoint, setVoicebipSipEndpoint] = useState("sip.voicebip.com:5060");
  const [fromPhoneNumber, setFromPhoneNumber] = useState("+234 1 888 0000");
  const [termiiApiKey, setTermiiApiKey] = useState("");
  const [twilioAccountSid, setTwilioAccountSid] = useState("");
  const [twilioAuthToken, setTwilioAuthToken] = useState("");

  // Persona State
  const [agentName, setAgentName] = useState("Ofia Executive Voice Assistant");
  const [voiceId, setVoiceId] = useState("en-NG-Standard-A");
  const [modelName, setModelName] = useState("gemini-1.5-flash");
  const [openingHook, setOpeningHook] = useState(
    "We help corporate teams in Lagos and Abuja streamline staff transportation with dedicated buses and real-time tracking."
  );
  const [valueProposition, setValueProposition] = useState(
    "25-35% cost reduction on corporate transport with guaranteed standby replacement buses."
  );
  const [maxDurationSec, setMaxDurationSec] = useState(300);
  const [humanEscalationPhone, setHumanEscalationPhone] = useState("+2348000000000");

  // Guardrails State
  const [aiDisclosureEnabled, setAiDisclosureEnabled] = useState(true);
  const [aiDisclosureText, setAiDisclosureText] = useState(
    "Hello, I am Ofia's automated executive assistant calling on behalf of the corporate mobility team."
  );
  const [callingHoursStart, setCallingHoursStart] = useState("09:00");
  const [callingHoursEnd, setCallingHoursEnd] = useState("17:00");
  const [maxRetries, setMaxRetries] = useState(2);
  const [autoWhatsAppDeck, setAutoWhatsAppDeck] = useState(true);

  // Load existing config on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/erp/byok?slug=default");
        if (res.ok) {
          const data = await res.json();
          if (data.voiceConfig) {
            const vc = data.voiceConfig;
            if (vc.telephony_provider) {
              const prov = vc.telephony_provider.toLowerCase();
              if (prov === "voicebip" || prov === "webrtc_browser" || prov === "termii" || prov === "twilio") {
                setTelephonyProvider(prov as any);
              }
            }
            if (vc.voicebip_api_key) setVoicebipApiKey(vc.voicebip_api_key);
            if (vc.voicebip_api_secret) setVoicebipApiSecret(vc.voicebip_api_secret);
            if (vc.voicebip_sip_endpoint) setVoicebipSipEndpoint(vc.voicebip_sip_endpoint);
            if (vc.from_phone_number) setFromPhoneNumber(vc.from_phone_number);
            if (vc.termii_api_key) setTermiiApiKey(vc.termii_api_key);
            if (vc.telephony_account_sid) setTwilioAccountSid(vc.telephony_account_sid);
            if (vc.telephony_auth_token) setTwilioAuthToken(vc.telephony_auth_token);
            if (vc.agent_name) setAgentName(vc.agent_name);
            if (vc.voice_id) setVoiceId(vc.voice_id);
            if (vc.model_name) setModelName(vc.model_name);
            if (vc.opening_hook) setOpeningHook(vc.opening_hook);
            if (vc.value_proposition) setValueProposition(vc.value_proposition);
            if (vc.max_duration_sec) setMaxDurationSec(vc.max_duration_sec);
            if (vc.human_escalation_phone) setHumanEscalationPhone(vc.human_escalation_phone);
            if (vc.ai_disclosure_enabled !== undefined) setAiDisclosureEnabled(vc.ai_disclosure_enabled);
            if (vc.ai_disclosure_text) setAiDisclosureText(vc.ai_disclosure_text);
            if (vc.calling_hours_start) setCallingHoursStart(vc.calling_hours_start);
            if (vc.calling_hours_end) setCallingHoursEnd(vc.calling_hours_end);
            if (vc.max_retries !== undefined) setMaxRetries(vc.max_retries);
            if (vc.auto_whatsapp_deck !== undefined) setAutoWhatsAppDeck(vc.auto_whatsapp_deck);
          }
        }
      } catch (err) {
        console.warn("Could not load remote voice config, using defaults", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg(null);
    try {
      const payload = {
        action: "save_voice",
        tenantSlug: "default",
        voiceConfig: {
          telephony_provider: telephonyProvider.toUpperCase(),
          voicebip_api_key: voicebipApiKey,
          voicebip_api_secret: voicebipApiSecret,
          voicebip_sip_endpoint: voicebipSipEndpoint,
          from_phone_number: fromPhoneNumber,
          termii_api_key: termiiApiKey,
          telephony_account_sid: twilioAccountSid,
          telephony_auth_token: twilioAuthToken,
          agent_name: agentName,
          voice_id: voiceId,
          model_name: modelName,
          opening_hook: openingHook,
          value_proposition: valueProposition,
          max_duration_sec: Number(maxDurationSec),
          human_escalation_phone: humanEscalationPhone,
          ai_disclosure_enabled: aiDisclosureEnabled,
          ai_disclosure_text: aiDisclosureText,
          calling_hours_start: callingHoursStart,
          calling_hours_end: callingHoursEnd,
          max_retries: Number(maxRetries),
          auto_whatsapp_deck: autoWhatsAppDeck,
        },
      };

      const res = await fetch("/api/erp/byok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatusMsg({ type: "success", text: "Voice Agent and Voicebip settings saved successfully." });
      } else {
        const data = await res.json().catch(() => ({}));
        setStatusMsg({ type: "error", text: data?.error || "Failed to persist voice configuration." });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Connection error: " + err.message });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  return (
    <ErpAdminShell
      activeModule="ai"
      title="Voice & Telephony Settings"
      subtitle="Configure Voicebip PSTN/SIP gateway, Gemini dialogue parameters, and autonomous outreach compliance guardrails."
      action={
        <div className="flex items-center gap-2">
          <Link href="/tenant/settings">
            <NexaButton size="sm" variant="outline" className="rounded-full text-xs font-bold">
              Workspace Settings
            </NexaButton>
          </Link>
          <NexaButton
            size="sm"
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full text-xs font-bold shadow-sm"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {isSaving ? "Saving..." : "Save Settings"}
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6 max-w-5xl">
        {statusMsg && (
          <div
            className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold ${
              statusMsg.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* 3 Clean Horizontal Sub Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--nexa-border)] pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("telephony")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "telephony"
                ? "bg-[#1A56DB] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <Radio className="w-4 h-4" />
            Voicebip Telephony & Carrier
          </button>
          <button
            onClick={() => setActiveTab("persona")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "persona"
                ? "bg-[#7E22CE] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Voice Persona & Gemini LLM
          </button>
          <button
            onClick={() => setActiveTab("guardrails")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "guardrails"
                ? "bg-[#0E9F6E] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Compliance & Guardrails
          </button>
        </div>

        {/* Tab 1: Voicebip Telephony Carrier */}
        {activeTab === "telephony" && (
          <div className="space-y-6">
            <NexaCard variant="glass" padding="lg" className="space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
                <div>
                  <h3 className="font-bold text-base text-[var(--nexa-text-primary)] flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[#1A56DB]" />
                    Telephony Carrier Pipeline
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                    Select Voicebip for direct Nigerian PSTN termination (+234) and enterprise SIP trunking.
                  </p>
                </div>
                <NexaBadge variant="brand">Voicebip Direct</NexaBadge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[
                  {
                    id: "voicebip",
                    title: "Voicebip Service",
                    badge: "Recommended",
                    desc: "Direct Nigerian PSTN termination & SIP trunking (+234)",
                  },
                  {
                    id: "webrtc_browser",
                    title: "In-Browser WebRTC",
                    badge: "Testing",
                    desc: "Interactive microphone simulation without carrier charges",
                  },
                  {
                    id: "termii",
                    title: "Termii Voice",
                    badge: "Fallback",
                    desc: "Local Nigerian Telco routes (MTN/Airtel/Glo)",
                  },
                  {
                    id: "twilio",
                    title: "Twilio Voice",
                    badge: "International",
                    desc: "Global SIP media stream connectivity",
                  },
                ].map((p) => {
                  const isSelected = telephonyProvider === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTelephonyProvider(p.id as any)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#1A56DB]/10 border-[#1A56DB] text-[#1A56DB] font-bold shadow-xs"
                          : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:border-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{p.title}</span>
                        <NexaBadge size="sm" variant={isSelected ? "brand" : "neutral"}>
                          {p.badge}
                        </NexaBadge>
                      </div>
                      <p className="text-[11px] text-[var(--nexa-text-muted)] line-clamp-2">
                        {p.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <NexaInput
                  label="Outbound Caller ID (From Phone CLI)"
                  value={fromPhoneNumber}
                  onChange={(e) => setFromPhoneNumber(e.target.value)}
                  placeholder="+234 1 888 0000"
                  helperText="Verified Nigerian phone number presented on corporate prospect screens."
                />

                {telephonyProvider === "voicebip" && (
                  <>
                    <NexaInput
                      label="Voicebip API Key / Token"
                      type="password"
                      value={voicebipApiKey}
                      onChange={(e) => setVoicebipApiKey(e.target.value)}
                      placeholder="vb_live_••••••••••••••••"
                      helperText="Obtained from Voicebip Portal &rarr; API & SIP Credentials."
                    />
                    <NexaInput
                      label="Voicebip API Secret"
                      type="password"
                      value={voicebipApiSecret}
                      onChange={(e) => setVoicebipApiSecret(e.target.value)}
                      placeholder="••••••••••••••••"
                      helperText="Secret key used for HMAC signature on outbound call requests."
                    />
                    <NexaInput
                      label="Voicebip SIP Endpoint / Trunk"
                      value={voicebipSipEndpoint}
                      onChange={(e) => setVoicebipSipEndpoint(e.target.value)}
                      placeholder="sip.voicebip.com:5060"
                      helperText="Dedicated VoIP SIP URI for low-latency bi-directional audio stream."
                    />
                  </>
                )}

                {telephonyProvider === "termii" && (
                  <NexaInput
                    label="Termii API Key"
                    type="password"
                    value={termiiApiKey}
                    onChange={(e) => setTermiiApiKey(e.target.value)}
                    placeholder="TL••••••••••••••••"
                    helperText="Termii Dashboard &rarr; Settings &rarr; API Tokens."
                  />
                )}

                {telephonyProvider === "twilio" && (
                  <>
                    <NexaInput
                      label="Twilio Account SID"
                      value={twilioAccountSid}
                      onChange={(e) => setTwilioAccountSid(e.target.value)}
                      placeholder="AC••••••••••••••••"
                    />
                    <NexaInput
                      label="Twilio Auth Token"
                      type="password"
                      value={twilioAuthToken}
                      onChange={(e) => setTwilioAuthToken(e.target.value)}
                      placeholder="••••••••••••••••"
                    />
                  </>
                )}

                {telephonyProvider === "webrtc_browser" && (
                  <div className="sm:col-span-2 p-3.5 rounded-xl bg-blue-500/10 text-xs text-[#1A56DB] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>In-Browser testing mode uses local WebRTC and WebSockets. External telephony carrier credits are not billed.</span>
                  </div>
                )}
              </div>
            </NexaCard>
          </div>
        )}

        {/* Tab 2: Persona & Dialogue LLM */}
        {activeTab === "persona" && (
          <NexaCard variant="glass" padding="lg" className="space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div>
                <h3 className="font-bold text-base text-[var(--nexa-text-primary)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#7E22CE]" />
                  Voice Persona & Dialogue Intelligence
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                  Configure spoken dialogue cadence, tone, objection handling logic, and escalation triggers.
                </p>
              </div>
              <NexaBadge variant="purple">Gemini Direct</NexaBadge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NexaInput
                label="Voice Agent Identity Name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                helperText="Spoken persona name used during prospect introductions."
              />

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Voice Dialect & Accent
                </label>
                <select
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none font-semibold text-[var(--nexa-text-primary)]"
                >
                  <option value="en-NG-Standard-A">Nigerian English (Professional Corporate - Female)</option>
                  <option value="en-NG-Standard-B">Nigerian English (Authoritative Executive - Male)</option>
                  <option value="en-GB-Standard-A">British English (Polite Corporate)</option>
                  <option value="en-US-Standard-C">North American (Neutral Business)</option>
                </select>
                <span className="text-[10px] text-[var(--nexa-text-muted)] block">
                  Optimized for B2B corporate decision-makers in Lagos, Abuja, and Port Harcourt.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Dialogue LLM Model
                </label>
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none font-semibold text-[var(--nexa-text-primary)]"
                >
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Sub-400ms Spoken Latency)</option>
                  <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Streaming Native Voice)</option>
                </select>
              </div>

              <NexaInput
                label="Human Closer Escalation Phone"
                value={humanEscalationPhone}
                onChange={(e) => setHumanEscalationPhone(e.target.value)}
                placeholder="+2348000000000"
                helperText="Where calls are transferred when a prospect requests an immediate live human closer."
              />

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Opening Hook (Spoken Introduction)
                </label>
                <textarea
                  rows={2}
                  value={openingHook}
                  onChange={(e) => setOpeningHook(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none text-[var(--nexa-text-primary)]"
                />
                <span className="text-[10px] text-[var(--nexa-text-muted)] block">
                  Crisp, 1-2 sentence elevator hook spoken immediately after confirming the prospect identity.
                </span>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Value Proposition & ROI Pitch
                </label>
                <textarea
                  rows={2}
                  value={valueProposition}
                  onChange={(e) => setValueProposition(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none text-[var(--nexa-text-primary)]"
                />
                <span className="text-[10px] text-[var(--nexa-text-muted)] block">
                  Core quantified business benefit used when handling price or need objections.
                </span>
              </div>
            </div>
          </NexaCard>
        )}

        {/* Tab 3: Safety Guardrails */}
        {activeTab === "guardrails" && (
          <NexaCard variant="glass" padding="lg" className="space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div>
                <h3 className="font-bold text-base text-[var(--nexa-text-primary)] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0E9F6E]" />
                  Outreach Compliance & Safety Guardrails
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                  Set hard operational boundaries to protect brand reputation and observe telecom regulations.
                </p>
              </div>
              <NexaBadge variant="success">Enforced</NexaBadge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[var(--nexa-text-primary)]">
                      Mandatory AI Identity Disclosure
                    </span>
                    <p className="text-[11px] text-[var(--nexa-text-muted)]">
                      Immediately declare AI nature within the first 5 seconds of the conversation.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiDisclosureEnabled}
                    onChange={(e) => setAiDisclosureEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#1A56DB] rounded cursor-pointer"
                  />
                </div>
                {aiDisclosureEnabled && (
                  <textarea
                    rows={2}
                    value={aiDisclosureText}
                    onChange={(e) => setAiDisclosureText(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none text-[var(--nexa-text-primary)] font-mono"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                  Nigerian Calling Window
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={callingHoursStart}
                    onChange={(e) => setCallingHoursStart(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none text-[var(--nexa-text-primary)]"
                  />
                  <span className="text-xs text-[var(--nexa-text-muted)]">to</span>
                  <input
                    type="time"
                    value={callingHoursEnd}
                    onChange={(e) => setCallingHoursEnd(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none text-[var(--nexa-text-primary)]"
                  />
                </div>
                <span className="text-[10px] text-[var(--nexa-text-muted)] mt-1 block">
                  Outbound calls strictly disallowed outside business hours (WAT / UTC+1).
                </span>
              </div>

              <NexaInput
                label="Max Call Duration (Seconds)"
                type="number"
                value={maxDurationSec.toString()}
                onChange={(e) => setMaxDurationSec(parseInt(e.target.value) || 300)}
                helperText="Call automatically wraps up and logs structured summary after this limit."
              />

              <NexaInput
                label="Max Retries per Prospect"
                type="number"
                value={maxRetries.toString()}
                onChange={(e) => setMaxRetries(parseInt(e.target.value) || 2)}
                helperText="Maximum retry attempts on NO_ANSWER or BUSY before moving to dead lead."
              />

              <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[var(--nexa-text-primary)] block">
                    Auto-Dispatch WhatsApp Deck
                  </span>
                  <span className="text-[11px] text-[var(--nexa-text-muted)]">
                    Trigger PDF brochure on CONNECTED_INTERESTED qualification.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoWhatsAppDeck}
                  onChange={(e) => setAutoWhatsAppDeck(e.target.checked)}
                  className="w-4 h-4 text-[#1A56DB] rounded cursor-pointer"
                />
              </div>
            </div>
          </NexaCard>
        )}
      </div>
    </ErpAdminShell>
  );
}
