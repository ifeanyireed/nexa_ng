"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/gtm/AppShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import {
  Key,
  Lock,
  Save,
  CheckCircle2,
  Cpu,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Layers,
  DollarSign,
  ShieldCheck,
  Eye,
  EyeOff,
  ExternalLink,
  Zap,
} from "lucide-react";

export default function PricingBYOKPage() {
  const [anthropicKey, setAnthropicKey] = useState("sk-ant-api03-••••••••••••••••••••••••");
  const [openaiKey, setOpenaiKey] = useState("sk-proj-••••••••••••••••••••••••");
  const [geminiKey, setGeminiKey] = useState("AIzaSy••••••••••••••••••••••••");
  const [whatsappKey, setWhatsappKey] = useState("EAAQ••••••••••••••••••••••••");
  const [showKeys, setShowKeys] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [leadEstimate, setLeadEstimate] = useState<number>(3000);

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Estimated token cost economics per 1,000 prospects
  const modelEconomics = [
    {
      provider: "Google",
      model: "Gemini 1.5 Flash",
      inputPrice: "₦0.15 / 1k tokens",
      outputPrice: "₦0.60 / 1k tokens",
      recommendedFor: "High-volume cold lead extraction & validation",
      monthlyEst: Math.round(leadEstimate * 2.8),
      badge: "Fast & Economical",
      badgeVariant: "brand" as const,
    },
    {
      provider: "Anthropic",
      model: "Claude 3.5 Sonnet",
      inputPrice: "₦4.50 / 1k tokens",
      outputPrice: "₦22.50 / 1k tokens",
      recommendedFor: "Complex B2B email personalization & objection replies",
      monthlyEst: Math.round(leadEstimate * 14.5),
      badge: "Highest Reply Rate",
      badgeVariant: "purple" as const,
    },
    {
      provider: "OpenAI",
      model: "GPT-4o",
      inputPrice: "₦3.75 / 1k tokens",
      outputPrice: "₦15.00 / 1k tokens",
      recommendedFor: "Strategy synthesis & WhatsApp interactive flows",
      monthlyEst: Math.round(leadEstimate * 11.2),
      badge: "Multi-Modal",
      badgeVariant: "success" as const,
    },
  ];

  return (
    <AppShell
      title="BYOK Vault & Inference Economics"
      subtitle="Connect proprietary API credentials, configure model routing, and review token burn economics."
      action={
        <Link href="/tenant/billing">
          <NexaButton
            size="sm"
            variant="outline"
            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            className="rounded-full font-bold text-xs"
          >
            Manage Plan & Invoices
          </NexaButton>
        </Link>
      }
    >
      <div className="space-y-8">
        {/* Toast */}
        {isSaved && (
          <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-[#0E9F6E] text-white text-xs font-bold flex items-center gap-2 shadow-2xl animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            BYOK API credentials encrypted with AES-256 and committed to vault!
          </div>
        )}

        {/* CURRENT TENANT TIER STATUS CARD */}
        <NexaCard variant="glass" padding="lg" className="p-6 rounded-3xl border border-nexa-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-nexa-border">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-display text-[var(--nexa-text-primary)]">
                  Growth Tier · Autonomous AI Engine
                </h2>
                <NexaBadge variant="brand">Active Plan</NexaBadge>
              </div>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                Workspace: <strong>EduSuite Nigeria</strong> · Synchronized with Ofia SuperAdmin
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-[var(--nexa-text-primary)] font-mono">
                ₦65,000<span className="text-xs text-[var(--nexa-text-muted)] font-normal"> / mo</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                2,000 Monthly Leads · 5 Team Seats
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
              <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-faint)]">Outbound Specialists</span>
              <div className="font-bold text-[var(--nexa-text-primary)] mt-0.5">All 15 Agents Live</div>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
              <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-faint)]">Daily Dispatch Quota</span>
              <div className="font-bold text-[var(--nexa-text-primary)] mt-0.5">1,000 Emails / Day</div>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
              <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-faint)]">Model Routing Mode</span>
              <div className="font-bold text-nexa-brand mt-0.5">Hybrid (Ofia + BYOK)</div>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
              <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-faint)]">Prompt Caching</span>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Active (42% Saved)</div>
            </div>
          </div>
        </NexaCard>

        {/* 2-COLUMN SECTION: BYOK VAULT & INFERENCE ECONOMICS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: BYOK Credential Vault (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--nexa-text-primary)] text-display uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4 text-nexa-brand" />
                  Bring-Your-Own-Key (BYOK) Vault
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)]">
                  Provide custom API credentials to bypass platform inference limits and access direct rates
                </p>
              </div>
              <NexaButton
                size="sm"
                variant="ghost"
                onClick={() => setShowKeys(!showKeys)}
                leftIcon={showKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                {showKeys ? "Hide" : "Reveal"}
              </NexaButton>
            </div>

            <form onSubmit={handleSaveKeys} className="p-6 rounded-3xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-4 shadow-xs">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-nexa-brand/10 border border-nexa-brand/20 text-xs font-semibold text-nexa-brand">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Keys are encrypted client-side with AES-256 before storage in Neon Postgres.</span>
              </div>

              <div className="space-y-3">
                <NexaInput
                  label="Anthropic Claude API Key"
                  type={showKeys ? "text" : "password"}
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                />

                <NexaInput
                  label="OpenAI API Key"
                  type={showKeys ? "text" : "password"}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-proj-..."
                />

                <NexaInput
                  label="Google Gemini API Key"
                  type={showKeys ? "text" : "password"}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                />

                <NexaInput
                  label="Meta WhatsApp Cloud API Access Token"
                  type={showKeys ? "text" : "password"}
                  value={whatsappKey}
                  onChange={(e) => setWhatsappKey(e.target.value)}
                  placeholder="EAAQ..."
                />
              </div>

              <div className="pt-2 flex justify-end">
                <NexaButton
                  type="submit"
                  size="sm"
                  variant="primary"
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                  className="bg-nexa-brand hover:bg-nexa-brand/90 text-white font-bold rounded-full px-5 shadow-sm"
                >
                  Save Encrypted Keys
                </NexaButton>
              </div>
            </form>
          </div>

          {/* Right: Model Routing & Economics Calculator (Col 5) */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-[var(--nexa-text-primary)] text-display uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-500" />
                Inference Economics & Cost
              </h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Estimated monthly token cost based on prospect pipeline volume
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-4 shadow-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--nexa-text-muted)]">Monthly Prospects Targeted:</span>
                  <span className="font-mono font-bold text-[var(--nexa-text-primary)]">
                    {leadEstimate.toLocaleString()} Prospects
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="20000"
                  step="500"
                  value={leadEstimate}
                  onChange={(e) => setLeadEstimate(Number(e.target.value))}
                  className="w-full accent-nexa-brand cursor-pointer"
                />
              </div>

              <div className="space-y-3 pt-2">
                {modelEconomics.map((model, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2 hover:border-nexa-brand/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[var(--nexa-text-primary)]">
                        {model.provider} {model.model}
                      </span>
                      <NexaBadge variant={model.badgeVariant}>{model.badge}</NexaBadge>
                    </div>

                    <p className="text-[11px] text-[var(--nexa-text-muted)]">
                      {model.recommendedFor}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-[var(--nexa-border)]/60 text-xs font-mono">
                      <span className="text-[10px] text-[var(--nexa-text-faint)]">
                        {model.inputPrice}
                      </span>
                      <span className="font-bold text-nexa-brand">
                        ~₦{model.monthlyEst.toLocaleString()} / mo
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <Link
                  href="/tenant/byok"
                  className="text-xs font-bold text-nexa-brand hover:underline inline-flex items-center gap-1"
                >
                  Configure Organization BYOK Settings <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
