"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/gtm/AppShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import {
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandLinkedin,
  IconBrandMeta,
  IconBrandOpenai,
  IconBrandGoogle,
  IconBrandAws,
  IconBrandZapier,
  IconBrandSlack,
  IconMailFast,
} from "@tabler/icons-react";

export default function IntegrationsPage() {
  const integrations = [
    {
      name: "Telegram CRO Bot (Free)",
      type: "Executive Conversational Bot & 1-Click Approvals",
      status: "Connected",
      details: "@OfiaGTM_CRO_Bot · 24/7 briefing & lead queries",
      icon: IconBrandTelegram,
      href: "/telegram",
      highlight: true,
      color: "#0088CC",
    },
    {
      name: "WhatsApp Business Cloud API (WABA)",
      type: "Autonomous Dialogue Outreach & Meetings",
      status: "Connected",
      details: "Meta WABA Quality: HIGH · Tier 3 (100k msg/day)",
      icon: IconBrandWhatsapp,
      href: "/settings",
      color: "#25D366",
    },
    {
      name: "Provider-Agnostic Email (SES / Resend)",
      type: "Cold Email Outreach & Verified Domains",
      status: "Connected",
      details: "DKIM / SPF / DMARC · 99.4% deliverability score",
      icon: IconMailFast,
      href: "/settings",
      color: "#1A56DB",
    },
    {
      name: "BYOK Model Gateway & Key Pools",
      type: "Custom AI Provider Allocation (Claude, GPT, Gemini)",
      status: "Connected",
      details: "Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro, Groq, Mistral",
      icon: IconBrandOpenai,
      href: "/settings",
      color: "#7E22CE",
    },
    {
      name: "LinkedIn Organization & Ads",
      type: "B2B Publishing & InMail Conversion",
      status: "Connected",
      details: "Connected to Company Page (14.2k followers)",
      icon: IconBrandLinkedin,
      href: "/settings",
      color: "#0A66C2",
    },
    {
      name: "Meta Facebook & Instagram Ads",
      type: "Paid Retargeting & Lead Generation",
      status: "Connected",
      details: "Active Daily Ad Spend: $150/day · ROAS: 3.8x",
      icon: IconBrandMeta,
      href: "/settings",
      color: "#1877F2",
    },
    {
      name: "Amazon SES & Cloud Deliverability",
      type: "High-Throughput Enterprise Email Pool",
      status: "Connected",
      details: "us-east-1 / eu-west-1 Dedicated Infrastructure",
      icon: IconBrandAws,
      href: "/settings",
      color: "#FF9900",
    },
    {
      name: "Zapier & Automation Webhooks",
      type: "CRM Event Streaming & Enrichment",
      status: "Connected",
      details: "Signed HMAC-SHA256 Payload Dispatches",
      icon: IconBrandZapier,
      href: "/settings",
      color: "#FF4A00",
    },
    {
      name: "Slack Deal Alerts & Approvals",
      type: "Real-Time Pipeline Notifications",
      status: "Connected",
      details: "#gtm-revenue-alerts (Live Webhook Stream)",
      icon: IconBrandSlack,
      href: "/settings",
      color: "#4A154B",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NexaBadge variant="brand" dot>
                6 Channels Active
              </NexaBadge>
              <span className="text-xs text-[var(--nexa-text-muted)]">
                API Gateways, Messaging & Outbound Pipes
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
              Channel Integrations
            </h1>
            <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
              Connect Telegram CRO bot, cold email sending inboxes, official WhatsApp WABA, and custom Model APIs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/telegram">
              <NexaButton size="sm" variant="primary" className="bg-[#0088CC] hover:bg-[#0077B5] text-white" leftIcon={<IconBrandTelegram className="w-4 h-4" />}>
                Setup Telegram Bot
              </NexaButton>
            </Link>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {integrations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NexaCard
                key={idx}
                variant="glass"
                padding="lg"
                className={`space-y-4 flex flex-col justify-between ${
                  item.highlight ? "border-2 border-[#0088CC]/40 shadow-sm" : ""
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${item.highlight ? "bg-[#0088CC]/15 text-[#0088CC]" : "bg-[#EBF5FF] dark:bg-[#3B82F6]/15 text-[#1A56DB]"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5">
                          {item.type}
                        </p>
                      </div>
                    </div>

                    <NexaBadge variant={item.highlight ? "cyan" : "success"} dot>
                      {item.status}
                    </NexaBadge>
                  </div>

                  <p className="text-xs text-[var(--nexa-text-secondary)] p-2.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-mono text-[11px]">
                    {item.details}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--nexa-border)]">
                  <span className="text-[11px] text-[var(--nexa-text-muted)]">
                    Sync Status: Healthy
                  </span>
                  <Link href={item.href}>
                    <NexaButton size="sm" variant={item.highlight ? "primary" : "outline"} className={item.highlight ? "bg-[#0088CC] hover:bg-[#0077B5] text-white" : ""}>
                      Configure
                    </NexaButton>
                  </Link>
                </div>
              </NexaCard>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
