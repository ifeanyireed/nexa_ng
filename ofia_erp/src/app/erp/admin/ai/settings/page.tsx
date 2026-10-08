"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/gtm/AppShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { EmailInfrastructureWizard } from "@/components/gtm/EmailInfrastructureWizard";
import { WhatsAppInfrastructureWizard } from "@/components/gtm/WhatsAppInfrastructureWizard";
import { TelegramInfrastructureWizard } from "@/components/gtm/TelegramInfrastructureWizard";
import { SocialInfrastructureWizard } from "@/components/gtm/SocialInfrastructureWizard";
import { ModelGatewayWizard } from "@/components/gtm/ModelGatewayWizard";
import {
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandLinkedin,
  IconBrandOpenai,
  IconMailFast,
} from "@tabler/icons-react";
import {
  ShieldCheck,
  Users,
  Key,
  ExternalLink,
  Lock,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"email" | "waba" | "telegram" | "byok" | "social" | "guardrails">("email");

  return (
    <AppShell
      title="Integrations & AI Settings"
      subtitle="Configure outreach delivery pipes, Meta WhatsApp WABA, free Telegram CRO chatbot, custom AI Model keys (BYOK), and autonomous safety thresholds."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/users">
            <NexaButton
              size="sm"
              variant="outline"
              leftIcon={<Users className="w-3.5 h-3.5" />}
              className="rounded-full text-xs font-bold"
            >
              Workspace Staff & Roles
            </NexaButton>
          </Link>
          <Link href="/erp/admin/ai/pricing">
            <NexaButton
              size="sm"
              variant="outline"
              leftIcon={<Key className="w-3.5 h-3.5" />}
              className="rounded-full text-xs font-bold text-nexa-brand"
            >
              BYOK Vault
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[var(--nexa-border)] pb-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("email")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "email"
                ? "bg-[#1A56DB] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <IconMailFast className="w-4 h-4" /> Email & SMTP
          </button>
          <button
            onClick={() => setActiveTab("waba")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "waba"
                ? "bg-[#0E9F6E] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <IconBrandWhatsapp className="w-4 h-4" /> Meta WhatsApp (WABA)
          </button>
          <button
            onClick={() => setActiveTab("telegram")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "telegram"
                ? "bg-[#0088CC] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <IconBrandTelegram className="w-4 h-4" /> Telegram CRO Bot (Free)
          </button>
          <button
            onClick={() => setActiveTab("byok")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "byok"
                ? "bg-[#7E22CE] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <IconBrandOpenai className="w-4 h-4" /> Model APIs (BYOK)
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "social"
                ? "bg-[#C88A3A] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <IconBrandLinkedin className="w-4 h-4" /> Social & Webhooks
          </button>
          <button
            onClick={() => setActiveTab("guardrails")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "guardrails"
                ? "bg-[var(--nexa-text-primary)] text-[var(--nexa-bg-base)] shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Safety Guardrails
          </button>
        </div>

        {/* Tab 1: Provider-Agnostic Email Infrastructure & 3-Step Guided Domain Wizard */}
        {activeTab === "email" && <EmailInfrastructureWizard />}

        {/* Tab 2: WhatsApp Meta Cloud API Wizard */}
        {activeTab === "waba" && <WhatsAppInfrastructureWizard />}

        {/* Tab 3: Telegram CRO Copilot Wizard (Free) */}
        {activeTab === "telegram" && <TelegramInfrastructureWizard />}

        {/* Tab 4: BYOK Model Gateway & Multi-Key Pools Wizard */}
        {activeTab === "byok" && <ModelGatewayWizard />}

        {/* Tab 5: Social Publishing Channels & Outbound Webhooks Wizard */}
        {activeTab === "social" && <SocialInfrastructureWizard />}

        {/* Tab 6: Safety Guardrails */}
        {activeTab === "guardrails" && (
          <NexaCard variant="glass" padding="lg" className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div>
                <h3 className="font-bold text-base text-[var(--nexa-text-primary)] text-display flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#E02424]" />
                  Autonomous Safety & Human-in-the-Loop Thresholds
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)]">
                  Set hard limits where AI agents can execute automatically vs require human sign-off in the Approval Center.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Email Sequence Approvals
                </div>
                <div className="text-[11px] text-[var(--nexa-text-muted)]">
                  Always require manual review for cold email sequences sent to &gt; 100 prospects.
                </div>
                <NexaBadge variant="brand">Enforced</NexaBadge>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Ad Budget Scaling Limit
                </div>
                <div className="text-[11px] text-[var(--nexa-text-muted)]">
                  Kieran Patel can scale daily ad spend by max 20% without requiring explicit authorization.
                </div>
                <NexaBadge variant="cyan">Max +20% / Day</NexaBadge>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Automatic Circuit Breakers
                </div>
                <div className="text-[11px] text-[var(--nexa-text-muted)]">
                  Automatically trip Noah Sterling if cold email bounce rate exceeds 4.0%.
                </div>
                <NexaBadge variant="danger">Bounce &gt; 4%</NexaBadge>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[var(--nexa-text-primary)]">Human Staff Authorization Scopes</span>
                <p className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5">
                  Configure which employees in your organization can approve campaigns or override circuit breakers.
                </p>
              </div>
              <Link href="/erp/admin/users">
                <NexaButton size="sm" variant="outline" className="text-xs font-bold rounded-full">
                  Configure Users
                </NexaButton>
              </Link>
            </div>
          </NexaCard>
        )}
      </div>
    </AppShell>
  );
}
