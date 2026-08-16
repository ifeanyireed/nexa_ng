"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/gtm/AppShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import {
  Send,
  Bot,
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  Zap,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  QrCode,
  Terminal,
  HelpCircle,
} from "lucide-react";
import { IconBrandTelegram } from "@tabler/icons-react";

export default function TelegramSetupPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [customToken, setCustomToken] = useState("");
  const [testChatId, setTestChatId] = useState("748291048");
  const [isTestSent, setIsTestSent] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const officialBotLink = "https://t.me/NexaGTM_CRO_Bot?start=org_01";

  const commands = [
    {
      command: "/briefing",
      description: "Delivers today's complete executive revenue briefing, lead counts, and CRO recommendations.",
      exampleOutput: "[Summary] Yesterday: 186 leads qualified (+24%), $84k pipeline added. Recommendation: Boost school outreach by 35%.",
    },
    {
      command: "/leads",
      description: "Returns the top 3 hottest qualified leads discovered today with ICP fit scores and buying signals.",
      exampleOutput: "[Top Lead] 1. Corona International Schools (98% fit) · Adeyemi Phillips · Signal: Term fee reconciliation leak.",
    },
    {
      command: "/approvals",
      description: "Lists pending cold email & WhatsApp campaigns with inline 1-click authorization buttons.",
      exampleOutput: "[Action Required] Batch 2: Principal Direct Outreach (450 Schools). [Authorize 1-Click] [Request Rewrite]",
    },
    {
      command: "/status",
      description: "Shows live 15-agent swarm telemetry floor, throughput in tasks/min, and circuit breaker health.",
      exampleOutput: "[Swarm Health] 15/15 Agents Healthy · Olivia Chen: 142 t/min · Noah Sterling: 0.01% bounce · All Systems Operational",
    },
  ];

  const naturalQueries = [
    "Sterling, how many schools replied to our tuition leak campaign?",
    "What's our cold email open rate in Abuja this week?",
    "Show me yesterday's meetings booked by Amara on WhatsApp",
    "Pause outreach sequences until 9:00 AM tomorrow",
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSendTest = () => {
    setIsTestSent(true);
    setTimeout(() => setIsTestSent(false), 3500);
  };

  const handleSaveCustomBot = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <AppShell>
      <div className="space-y-7 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NexaBadge variant="cyan" dot>
                Free Integration · Zero API Markup
              </NexaBadge>
              <span className="text-xs text-[var(--nexa-text-muted)]">
                Mobile Executive Command Channel
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight flex items-center gap-3">
              <IconBrandTelegram className="w-8 h-8 text-[#0088CC]" />
              Telegram CRO Bot Setup & Guide
            </h1>
            <p className="text-xs sm:text-sm text-[var(--nexa-text-muted)] mt-1">
              Chat directly with <strong>Sterling Vance (Chief Revenue Officer)</strong> on Telegram to review morning briefings, inspect hot leads, and execute 1-click campaign approvals on your phone.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a href={officialBotLink} target="_blank" rel="noreferrer">
              <NexaButton
                size="sm"
                variant="primary"
                className="bg-[#0088CC] hover:bg-[#0077B5] text-white font-bold"
                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Launch on Telegram
              </NexaButton>
            </a>
          </div>
        </div>

        {isTestSent && (
          <div className="p-3.5 rounded-2xl bg-[#ECFDF5] text-[#0E9F6E] dark:bg-[#10B981]/20 dark:text-[#34D399] border border-[#0E9F6E]/30 text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> Test alert successfully dispatched to your Telegram chat!
          </div>
        )}

        {isSaved && (
          <div className="p-3.5 rounded-2xl bg-[#ECFDF5] text-[#0E9F6E] dark:bg-[#10B981]/20 dark:text-[#34D399] border border-[#0E9F6E]/30 text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> Custom Telegram Bot Token saved and webhook registered!
          </div>
        )}

        {/* Quick Connect Hero Card */}
        <NexaCard
          variant="glass"
          padding="lg"
          className="relative overflow-hidden border-2 border-[#0088CC]/40 bg-gradient-to-r from-[#0088CC]/10 via-[var(--nexa-bg-surface)] to-[var(--nexa-bg-base)]"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#0088CC] text-white flex items-center justify-center shadow-md">
                  <IconBrandTelegram className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base sm:text-lg text-[var(--nexa-text-primary)] text-display">
                    Connect to @NexaGTM_CRO_Bot
                  </h2>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Official Free Executive Assistant for EduSuite Nigeria
                  </p>
                </div>
              </div>

              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Click the button below to open Telegram. Hit <strong>Start</strong> and the bot will automatically link your workspace ID (<code className="font-mono text-[#0088CC] bg-[var(--nexa-bg-base)] px-1.5 py-0.5 rounded">org_01</code>). No configuration required!
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a href={officialBotLink} target="_blank" rel="noreferrer">
                  <NexaButton
                    size="sm"
                    variant="primary"
                    className="bg-[#0088CC] hover:bg-[#0077B5] text-white font-bold"
                    leftIcon={<ExternalLink className="w-4 h-4" />}
                  >
                    Open @NexaGTM_CRO_Bot
                  </NexaButton>
                </a>
                <button
                  onClick={() => handleCopy(officialBotLink, 999)}
                  className="px-3 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] hover:border-[#0088CC] text-xs font-semibold text-[var(--nexa-text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedIndex === 999 ? "Link Copied!" : "Copy Deep Link"}
                </button>
              </div>
            </div>

            {/* Status Card */}
            <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)]/90 border border-[var(--nexa-border)] space-y-2.5 text-xs min-w-[220px]">
              <div className="flex items-center justify-between">
                <span className="text-[var(--nexa-text-muted)]">Bot Status:</span>
                <NexaBadge variant="success" dot>
                  Online
                </NexaBadge>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-[var(--nexa-text-muted)]">Bound Workspace:</span>
                <span className="font-bold text-[var(--nexa-text-primary)]">EduSuite Nigeria</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-[var(--nexa-text-muted)]">Chat ID:</span>
                <span className="font-bold text-[#0088CC]">{testChatId}</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-[var(--nexa-text-muted)]">Webhook Latency:</span>
                <span className="font-bold text-[#0E9F6E]">42ms</span>
              </div>
              <div className="pt-2 border-t border-[var(--nexa-border)]">
                <button
                  onClick={handleSendTest}
                  className="w-full py-1.5 rounded-lg bg-[var(--nexa-bg-base)] hover:bg-[#0088CC]/10 hover:text-[#0088CC] text-[11px] font-bold text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3 h-3" /> Test Connection Ping
                </button>
              </div>
            </div>
          </div>
        </NexaCard>

        {/* Step-by-Step Setup Guide */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--nexa-text-muted)] flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#0088CC]" />
            3-Step Setup & Instructional Guide
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <NexaCard variant="glass" padding="md" className="space-y-2.5 border-t-4 border-t-[#0088CC]">
              <div className="w-7 h-7 rounded-xl bg-[#0088CC]/15 text-[#0088CC] font-extrabold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                Open Official Bot on Telegram
              </h3>
              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Click <a href={officialBotLink} target="_blank" rel="noreferrer" className="text-[#0088CC] font-bold hover:underline">@NexaGTM_CRO_Bot</a> on your mobile or desktop device and press <strong>Start</strong>.
              </p>
            </NexaCard>

            {/* Step 2 */}
            <NexaCard variant="glass" padding="md" className="space-y-2.5 border-t-4 border-t-[#7E22CE]">
              <div className="w-7 h-7 rounded-xl bg-[#7E22CE]/15 text-[#7E22CE] font-extrabold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                Instant Automatic Workspace Binding
              </h3>
              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                The bot securely stores your Telegram Chat ID in <code className="font-mono text-[10px] text-[#7E22CE]">gtm_tenant_settings</code>. No tokens or server setup required.
              </p>
            </NexaCard>

            {/* Step 3 */}
            <NexaCard variant="glass" padding="md" className="space-y-2.5 border-t-4 border-t-[#0E9F6E]">
              <div className="w-7 h-7 rounded-xl bg-[#0E9F6E]/15 text-[#0E9F6E] font-extrabold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                Chat, Query & 1-Click Approve
              </h3>
              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Send <code className="font-mono text-[10px] text-[#0E9F6E]">/briefing</code> or ask any business question. Approve cold email sequences with interactive inline buttons!
              </p>
            </NexaCard>
          </div>
        </div>

        {/* Slash Commands & Interactive Cheatsheet */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--nexa-text-muted)] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#7E22CE]" />
                Supported Telegram Slash Commands
              </h2>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                Type any of these commands directly into your Telegram chat with Sterling Vance
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commands.map((cmd, idx) => (
              <NexaCard key={idx} variant="glass" padding="md" className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-[#0088CC] bg-[var(--nexa-bg-base)] px-2.5 py-1 rounded-xl border border-[var(--nexa-border)]">
                    {cmd.command}
                  </span>
                  <button
                    onClick={() => handleCopy(cmd.command, idx)}
                    className="p-1 rounded-lg text-[var(--nexa-text-muted)] hover:text-[#0088CC] transition-colors cursor-pointer"
                    title="Copy command"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-[var(--nexa-text-primary)] font-medium">
                  {cmd.description}
                </p>

                <div className="p-2.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-mono text-[11px] text-[var(--nexa-text-secondary)]">
                  {cmd.exampleOutput}
                </div>
              </NexaCard>
            ))}
          </div>
        </div>

        {/* Natural Language Queries Card */}
        <NexaCard variant="glass" padding="lg" className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[var(--nexa-border)] pb-3">
            <Bot className="w-5 h-5 text-[#0088CC]" />
            <div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] text-display">
                Natural Language Conversational Queries
              </h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Sterling Vance reasons using Claude 3.5 Sonnet to answer natural business questions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {naturalQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleCopy(q, idx + 10)}
                className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] hover:border-[#0088CC] text-left text-xs text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] transition-all cursor-pointer flex items-center justify-between group"
              >
                <span>&quot;{q}&quot;</span>
                <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#0088CC] shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </NexaCard>

        {/* Custom White-Label Bot Setup (Optional) */}
        <NexaCard variant="glass" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] text-display">
                Custom White-Label Telegram Bot (Optional)
              </h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Deploy your own branded bot (e.g. @YourCompanyGTMBot) using BotFather credentials
              </p>
            </div>
            <NexaBadge variant="neutral">Enterprise</NexaBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NexaInput
              label="Bot Token (From @BotFather)"
              placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              type="password"
              value={customToken}
              onChange={(e) => setCustomToken(e.target.value)}
            />

            <NexaInput
              label="Target Chat ID"
              placeholder="748291048"
              value={testChatId}
              onChange={(e) => setTestChatId(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--nexa-border)]">
            <NexaButton size="sm" variant="primary" onClick={handleSaveCustomBot}>
              Save Custom Bot Token
            </NexaButton>
          </div>
        </NexaCard>
      </div>
    </AppShell>
  );
}
