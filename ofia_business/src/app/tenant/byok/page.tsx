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
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <BusinessShell
      title="Bring-Your-Own-Key (BYOK) Vault"
      subtitle="Connect your custom API keys for Anthropic Claude, OpenAI, Google Gemini, and Meta WhatsApp Cloud API. Encrypted with AES-256."
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
              label="Anthropic Claude API Key"
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              helperText="Powering the 15 autonomous AI agents."
            />
            <NexaInput
              label="OpenAI API Key"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              helperText="Used for fallback embeddings & semantic routing."
            />
            <NexaInput
              label="Google Gemini 2.5 Pro Key"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              helperText="Multimodal image generation & visual analysis."
            />
          </div>
        </NexaCard>

        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)]">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#0E9F6E]" />
              Messaging & Multi-Channel Relays
            </h3>
            <NexaBadge variant="green">Connected</NexaBadge>
          </div>

          <div className="space-y-4">
            <NexaInput
              label="Meta WhatsApp Cloud API Token"
              value={whatsappKey}
              onChange={(e) => setWhatsappKey(e.target.value)}
              helperText="Used for automated 2-way client WhatsApp follow-ups."
            />
          </div>
        </NexaCard>
      </div>
    </BusinessShell>
  );
}
