"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/gtm/AppShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import {
  Sparkles,
  Copy,
  Check,
  Send,
  Edit3,
  Image as ImageIcon,
  Layers,
  CheckSquare,
  Wand2,
} from "lucide-react";

export default function StudioPage() {
  const [contentType, setContentType] = useState<"email" | "whatsapp" | "linkedin" | "ad">("email");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const sampleVariants = [
    {
      title: "Angle A: Tuition Leakage & Manual Audit Pain",
      hook: "Are manual bank tellers causing registration delays at {{company_name}}?",
      body: "Hi {{first_name}},\n\nMost private school proprietors lose 15-20 hours every week reconciling manual bank alerts with student fee logs.\n\nWe built an automated system that reconciles 100% of school fees instantaneously through dedicated virtual accounts.\n\nOpen to a quick 7-minute look before next term resumes?",
    },
    {
      title: "Angle B: Prestige & Parent WhatsApp Receipts",
      hook: "Upgrade {{company_name}}'s parent payment experience this term",
      body: "Hi {{first_name}},\n\nParents hate queuing for paper receipts. Our system sends instant branded WhatsApp payment receipts the second a parent transfers tuition.\n\nOver 40 leading schools in Lagos have eliminated bursary queues completely.\n\nWould you like a brief demonstration?",
    },
  ];

  const handleCopy = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NexaBadge variant="purple" dot>
                Julian Cross & Chloe Vane Active
              </NexaBadge>
              <span className="text-xs text-[var(--nexa-text-muted)]">
                Autonomous Copywriting & Creative Studio
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
              Content & Creative Studio
            </h1>
            <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
              Multi-variant copy generation, creative testing angles, and asset staging.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NexaButton
              size="sm"
              variant="primary"
              leftIcon={<Wand2 className="w-3.5 h-3.5" />}
            >
              Generate 5 New Angles
            </NexaButton>
          </div>
        </div>

        {/* Content Type Tabs */}
        <div className="flex items-center gap-2 p-2 rounded-2xl liquid-glass border border-[var(--glass-border)]">
          {(["email", "whatsapp", "linkedin", "ad"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setContentType(t)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                contentType === t
                  ? "bg-[#1A56DB] text-white shadow-sm dark:bg-[#3B82F6]"
                  : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-brand-light)] hover:text-[#1A56DB] dark:hover:bg-white/5"
              }`}
            >
              {t === "email" ? "Cold Outreach Email" : t === "whatsapp" ? "WhatsApp Business" : t === "linkedin" ? "LinkedIn Post" : "Ad Creative Copy"}
            </button>
          ))}
        </div>

        {/* Multi-Variant Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleVariants.map((variant, idx) => (
            <NexaCard key={idx} variant="glass" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
                <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] text-display">
                  {variant.title}
                </h3>
                <NexaBadge variant="brand">Variant #{idx + 1}</NexaBadge>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-[var(--nexa-text-muted)]">
                  Subject / Opening Hook:
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs font-bold text-[var(--nexa-text-primary)]">
                  {variant.hook}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-[var(--nexa-text-muted)]">
                  Body Content:
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] whitespace-pre-line leading-relaxed">
                  {variant.body}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--nexa-border)]">
                <NexaButton
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(idx, `${variant.hook}\n\n${variant.body}`)}
                  leftIcon={copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-[#0E9F6E]" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedIndex === idx ? "Copied!" : "Copy Text"}
                </NexaButton>

                <NexaButton
                  size="sm"
                  variant="primary"
                  leftIcon={<CheckSquare className="w-3.5 h-3.5" />}
                >
                  Queue for Approval
                </NexaButton>
              </div>
            </NexaCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
