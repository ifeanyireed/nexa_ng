"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Download,
  Flame,
  Plus,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

const TIERS = [
  { name: "Starter", price: "₦25,000", leads: "500 Leads", emails: "200 / day", seats: "2 Seats", desc: "Best for early stage founders & solopreneurs." },
  { name: "Growth", price: "₦65,000", leads: "2,000 Leads", emails: "500 / day", seats: "5 Seats", desc: "For scaling B2B teams & growing service agencies.", current: true },
  { name: "Scale", price: "₦150,000", leads: "10,000 Leads", emails: "2,500 / day", seats: "15 Seats", desc: "For established enterprise departments with large sales swarms." },
  { name: "Enterprise", price: "Custom", leads: "Unlimited", emails: "Dedicated IP", seats: "Unlimited", desc: "Custom SLA, dedicated account manager, on-prem AI models." },
];

export default function TenantBillingPage() {
  return (
    <BusinessShell
      title="Subscription Plans & Invoices"
      subtitle="Manage your organization's active tier, quota allowances, Paystack card billing, and tax receipts."
      action={
        <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#0E9F6E] text-white">
          Add Payment Card
        </NexaButton>
      }
    >
      <div className="space-y-8">
        {/* CURRENT SUBSCRIPTION SUMMARY */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] border-l-4 border-l-[#1A56DB]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-[var(--nexa-text-primary)]">Growth Tier Subscription</h3>
                <NexaBadge variant="brand">Active Plan</NexaBadge>
              </div>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                Renews automatically on <span className="font-bold text-[var(--nexa-text-primary)]">September 22, 2026</span> via Paystack.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-[var(--nexa-text-primary)] font-mono">₦65,000<span className="text-xs text-[var(--nexa-text-muted)] font-normal"> / mo</span></div>
              <div className="text-[11px] text-[#0E9F6E] font-bold">5 Team Seats • 2,000 Leads</div>
            </div>
          </div>
        </NexaCard>

        {/* TIERS MATRIX */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-[var(--nexa-text-primary)]">Available Subscription Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIERS.map((t) => (
              <NexaCard
                key={t.name}
                variant="glass"
                padding="md"
                className={`space-y-4 border flex flex-col justify-between ${
                  t.current ? "border-[#1A56DB] bg-[#1A56DB]/5 shadow-md" : "border-[var(--nexa-border)]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[var(--nexa-text-primary)]">{t.name}</h4>
                    {t.current && <NexaBadge variant="brand" className="text-[9px]">Current</NexaBadge>}
                  </div>
                  <div className="text-xl font-black text-[var(--nexa-text-primary)] font-mono">{t.price}</div>
                  <p className="text-xs text-[var(--nexa-text-secondary)]">{t.desc}</p>
                  <div className="space-y-1 pt-2 border-t border-[var(--nexa-border)] text-xs text-[var(--nexa-text-muted)]">
                    <div>• {t.leads}</div>
                    <div>• {t.emails}</div>
                    <div>• {t.seats}</div>
                  </div>
                </div>

                <div className="pt-2">
                  {t.current ? (
                    <NexaButton size="sm" variant="outline" className="w-full justify-center" disabled>
                      Active Tier
                    </NexaButton>
                  ) : (
                    <NexaButton size="sm" variant="primary" className="w-full bg-[#1A56DB] text-white justify-center">
                      Upgrade
                    </NexaButton>
                  )}
                </div>
              </NexaCard>
            ))}
          </div>
        </div>
      </div>
    </BusinessShell>
  );
}
