"use client";

import React, { useState } from "react";
import {
  Bot,
  CheckCircle2,
  Eye,
  EyeOff,
  Key,
  Lock,
  MessageSquare,
  Save,
  ShieldCheck,
  Zap,
  PhoneCall,
  Volume2,
  Clock,
  PhoneForwarded,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";

export default function TenantBYOKPage() {
  const [anthropicKey, setAnthropicKey] = useState("sk-ant-api03-••••••••••••••••••••••••");
  const [openaiKey, setOpenaiKey] = useState("sk-proj-••••••••••••••••••••••••");
  const [geminiKey, setGeminiKey] = useState("AIzaSy••••••••••••••••••••••••");
  const [whatsappKey, setWhatsappKey] = useState("EAAQ••••••••••••••••••••••••");

  // Voice Agent Telephony & Speech States
  const [telephonyProvider, setTelephonyProvider] = useState("voicebip");
  const [telephonyFromNumber, setTelephonyFromNumber] = useState("+234 1 888 0000");
  const [voicebipKey, setVoicebipKey] = useState("");
  const [voicebipSecret, setVoicebipSecret] = useState("");
  const [voicebipSip, setVoicebipSip] = useState("sip.voicebip.com:5060");
  const [termiiApiKey, setTermiiApiKey] = useState("");
  const [twilioSid, setTwilioSid] = useState("");
  const [twilioAuth, setTwilioAuth] = useState("");
  const [voiceAgentName, setVoiceAgentName] = useState("Ofia Executive Voice Assistant");
  const [voiceAccent, setVoiceAccent] = useState("en-NG-Standard-A");
  const [aiDisclosure, setAiDisclosure] = useState(
    "Hello, I am Ofia's automated executive assistant calling on behalf of the corporate mobility team."
  );
  const [closerPhone, setCloserPhone] = useState("+234 800 000 0000");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <BusinessShell
      title="Bring-Your-Own-Key (BYOK) & Voice Agent Vault"
      subtitle="Connect your custom API keys for Google Gemini, Telephony (Termii / Twilio), and WhatsApp. Encrypted with AES-256."
      action={
        <NexaButton
          size="sm"
          variant="primary"
          onClick={handleSave}
          leftIcon={<Save className="w-3.5 h-3.5" />}
          className="bg-[#1A56DB] text-white"
        >
          {isSaved ? "Saved Vault!" : "Save Keys"}
        </NexaButton>
      }
    >
      <div className="space-y-6 max-w-3xl">
        {/* VOICE AGENT TELEPHONY INFRASTRUCTURE */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)]">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#1A56DB]" />
              Voice Agent Telephony & Nigerian Carrier (PSTN/GSM)
            </h3>
            <NexaBadge variant="brand">PSTN & SIP</NexaBadge>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Telephony Carrier Pipeline
              </label>
              <select
                value={telephonyProvider}
                onChange={(e) => setTelephonyProvider(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none text-[var(--nexa-text-primary)] font-semibold"
              >
                <option value="voicebip">Voicebip Service (Enterprise Nigerian PSTN & SIP +234)</option>
                <option value="termii">Termii Voice (Local Nigerian Direct Routes +234)</option>
                <option value="twilio">Twilio Programmable SIP & Media Streams</option>
                <option value="africas_talking">Africa's Talking Voice</option>
                <option value="webrtc_browser">In-Browser WebRTC Simulator (Testing)</option>
              </select>
            </div>

            <NexaInput
              label="Outbound Caller ID (From Phone Number)"
              value={telephonyFromNumber}
              onChange={(e) => setTelephonyFromNumber(e.target.value)}
              helperText="Verified Nigerian phone number shown on the prospect's mobile screen."
            />

            {telephonyProvider === "voicebip" && (
              <div className="space-y-3">
                <NexaInput
                  label="Voicebip API Key / Token"
                  type="password"
                  value={voicebipKey}
                  onChange={(e) => setVoicebipKey(e.target.value)}
                  helperText="Voicebip Console &rarr; API & SIP Tokens."
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <NexaInput
                    label="Voicebip API Secret"
                    type="password"
                    value={voicebipSecret}
                    onChange={(e) => setVoicebipSecret(e.target.value)}
                    helperText="HMAC signature secret."
                  />
                  <NexaInput
                    label="Voicebip SIP Endpoint"
                    value={voicebipSip}
                    onChange={(e) => setVoicebipSip(e.target.value)}
                    helperText="Direct SIP URI for streaming."
                  />
                </div>
              </div>
            )}

            {telephonyProvider === "termii" && (
              <NexaInput
                label="Termii Voice API Key"
                value={termiiApiKey}
                onChange={(e) => setTermiiApiKey(e.target.value)}
                helperText="Used for low-latency GSM termination across MTN, Airtel, and Glo."
              />
            )}

            {telephonyProvider === "twilio" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <NexaInput
                  label="Twilio Account SID"
                  value={twilioSid}
                  onChange={(e) => setTwilioSid(e.target.value)}
                />
                <NexaInput
                  label="Twilio Auth Token"
                  value={twilioAuth}
                  onChange={(e) => setTwilioAuth(e.target.value)}
                />
              </div>
            )}
          </div>
        </NexaCard>

        {/* VOICE PERSONA & COMPLIANCE GUARDRAILS */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)]">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-600" />
              Voice Persona & Compliance Guardrails
            </h3>
            <NexaBadge variant="green">Regulatory Safe</NexaBadge>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NexaInput
                label="Spoken Agent Name"
                value={voiceAgentName}
                onChange={(e) => setVoiceAgentName(e.target.value)}
                helperText="Name used in greeting."
              />
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Voice Accent & Cadence
                </label>
                <select
                  value={voiceAccent}
                  onChange={(e) => setVoiceAccent(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none text-[var(--nexa-text-primary)] font-semibold"
                >
                  <option value="en-NG-Standard-A">Nigerian English (Lagos Business Professional)</option>
                  <option value="en-GB-Standard-B">British English (Corporate International)</option>
                  <option value="af-ZA-Standard-A">Neutral African English</option>
                </select>
              </div>
            </div>

            <NexaInput
              label="Human Closer Transfer Phone (+234...)"
              value={closerPhone}
              onChange={(e) => setCloserPhone(e.target.value)}
              helperText="Call bridges to this number if the prospect requests a human sales director."
            />

            <div>
              <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                Mandatory AI Identity Disclosure
              </label>
              <textarea
                rows={2}
                value={aiDisclosure}
                onChange={(e) => setAiDisclosure(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none text-[var(--nexa-text-primary)] resize-none"
              />
              <span className="text-[10px] text-[var(--nexa-text-muted)] block mt-1">
                Required by telecommunications regulations before pitching corporate mobility services.
              </span>
            </div>
          </div>
        </NexaCard>

        {/* LLM INTELLIGENCE PROVIDERS */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)]">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Key className="w-4 h-4 text-[#1A56DB]" />
              LLM Intelligence Providers
            </h3>
            <NexaBadge variant="brand">AES-256 Vault</NexaBadge>
          </div>

          <div className="space-y-4">
            <NexaInput
              label="Google Gemini 1.5 / 2.0 Key"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              helperText="Primary brain for Ofia Voice Agent real-time conversation and post-call CRM qualification."
            />
            <NexaInput
              label="Anthropic Claude API Key"
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              helperText="Optional secondary intelligence engine."
            />
            <NexaInput
              label="OpenAI API Key"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              helperText="Used for embeddings and fallback analysis."
            />
          </div>
        </NexaCard>

        {/* MESSAGING & WHATSAPP */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)]">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#0E9F6E]" />
              Post-Call WhatsApp Relay
            </h3>
            <NexaBadge variant="green">Connected</NexaBadge>
          </div>

          <div className="space-y-4">
            <NexaInput
              label="Meta WhatsApp Cloud API Token"
              value={whatsappKey}
              onChange={(e) => setWhatsappKey(e.target.value)}
              helperText="Immediately dispatches corporate shuttle PDF brochures to interested prospects on WhatsApp."
            />
          </div>
        </NexaCard>
      </div>
    </BusinessShell>
  );
}
