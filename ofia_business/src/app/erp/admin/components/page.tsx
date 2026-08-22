"use client";

import React, { useState } from "react";
import {
  Activity,
  Bot,
  Building2,
  CheckCircle2,
  Copy,
  Eye,
  Layers,
  Lock,
  MessageSquare,
  Moon,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Zap,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";

export default function ComponentsShowcasePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [copiedToken, setCopiedToken] = useState("");

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedToken(code);
    setTimeout(() => setCopiedToken(""), 2000);
  };

  return (
    <BusinessShell
      title="Nexa Design System & Components"
      subtitle="Liquid-glass design tokens, reusable atomic primitives, and multi-tenant UI components."
      action={
        <NexaButton
          size="sm"
          variant="primary"
          onClick={() => setModalOpen(true)}
          leftIcon={<Sparkles className="w-3.5 h-3.5" />}
        >
          Open Modal Demo
        </NexaButton>
      }
    >
      <div className="space-y-10">
        {/* 1. BUTTONS */}
        <section className="space-y-4">
          <div className="border-b border-[var(--nexa-border)] pb-2 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--nexa-text-primary)]">1. Button Primitives</h2>
              <p className="text-xs text-[var(--nexa-text-muted)]">NexaButton variants, sizes, and states</p>
            </div>
            <NexaBadge variant="brand">NexaButton</NexaBadge>
          </div>

          <NexaCard variant="glass" padding="lg" className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <NexaButton variant="primary">Primary Brand</NexaButton>
              <NexaButton variant="secondary">Secondary</NexaButton>
              <NexaButton variant="outline">Outline</NexaButton>
              <NexaButton variant="ghost">Ghost</NexaButton>
              <NexaButton variant="danger">Danger</NexaButton>
              <NexaButton variant="primary" isLoading>Loading State</NexaButton>
              <NexaButton variant="primary" leftIcon={<Zap className="w-4 h-4" />}>With Icon</NexaButton>
              <NexaButton variant="primary" size="sm">Small</NexaButton>
              <NexaButton variant="primary" size="lg">Large Button</NexaButton>
            </div>
          </NexaCard>
        </section>

        {/* 2. BADGES */}
        <section className="space-y-4">
          <div className="border-b border-[var(--nexa-border)] pb-2 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--nexa-text-primary)]">2. Status Badges & Pills</h2>
              <p className="text-xs text-[var(--nexa-text-muted)]">NexaBadge color tokens and live pulsing indicator dots</p>
            </div>
            <NexaBadge variant="purple">NexaBadge</NexaBadge>
          </div>

          <NexaCard variant="glass" padding="lg" className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <NexaBadge variant="brand" dot>Brand Active</NexaBadge>
              <NexaBadge variant="success" dot>Success</NexaBadge>
              <NexaBadge variant="green" dot>Green Pro</NexaBadge>
              <NexaBadge variant="purple" dot>AI Swarm</NexaBadge>
              <NexaBadge variant="cyan" dot>Verified</NexaBadge>
              <NexaBadge variant="warning" dot>Warning</NexaBadge>
              <NexaBadge variant="amber" dot>Amber Status</NexaBadge>
              <NexaBadge variant="danger" dot>Danger / Escalated</NexaBadge>
              <NexaBadge variant="coral" dot>Coral Critical</NexaBadge>
              <NexaBadge variant="neutral">Neutral Pill</NexaBadge>
            </div>
          </NexaCard>
        </section>

        {/* 3. CARDS & LIQUID GLASS SURFACES */}
        <section className="space-y-4">
          <div className="border-b border-[var(--nexa-border)] pb-2 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--nexa-text-primary)]">3. Surface Cards & Liquid Glass</h2>
              <p className="text-xs text-[var(--nexa-text-muted)]">NexaCard variants with backdrop-blur and border highlights</p>
            </div>
            <NexaBadge variant="cyan">NexaCard</NexaBadge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#1A56DB]">
              <span className="text-xs text-[var(--nexa-text-muted)] font-semibold">Glass Surface Card</span>
              <div className="text-xl font-bold text-[var(--nexa-text-primary)]">variant="glass"</div>
              <p className="text-xs text-[var(--nexa-text-secondary)]">Translucent backdrop-blur card matching dark/light mode.</p>
            </NexaCard>

            <NexaCard variant="default" padding="md" className="space-y-2 border-l-4 border-l-[#0E9F6E]">
              <span className="text-xs text-[var(--nexa-text-muted)] font-semibold">Solid Surface Card</span>
              <div className="text-xl font-bold text-[var(--nexa-text-primary)]">variant="default"</div>
              <p className="text-xs text-[var(--nexa-text-secondary)]">High-contrast solid background card for data dense views.</p>
            </NexaCard>

            <NexaCard variant="glass" padding="md" hoverEffect className="space-y-2 border-l-4 border-l-[#9061F9]">
              <span className="text-xs text-[var(--nexa-text-muted)] font-semibold">Interactive Card</span>
              <div className="text-xl font-bold text-[var(--nexa-text-primary)]">hoverEffect=true</div>
              <p className="text-xs text-[var(--nexa-text-secondary)]">Subtle elevation and shadow hover animations.</p>
            </NexaCard>
          </div>
        </section>

        {/* 4. FORM INPUTS */}
        <section className="space-y-4">
          <div className="border-b border-[var(--nexa-border)] pb-2 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--nexa-text-primary)]">4. Inputs & Form Controls</h2>
              <p className="text-xs text-[var(--nexa-text-muted)]">NexaInput with validation states, helper text, and left/right icons</p>
            </div>
            <NexaBadge variant="brand">NexaInput</NexaBadge>
          </div>

          <NexaCard variant="glass" padding="lg" className="space-y-4 max-w-xl">
            <NexaInput
              label="Organization Name"
              placeholder="e.g. EduSuite Technologies Ltd"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              helperText="Displayed across all public tenant shopfronts."
            />
            <NexaInput
              label="Work Email Address"
              placeholder="you@company.com"
              type="email"
            />
          </NexaCard>
        </section>
      </div>

      {/* DEMO MODAL */}
      <NexaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Interactive NexaModal Dialog"
      >
        <div className="space-y-4 text-xs text-[var(--nexa-text-secondary)]">
          <p>
            This is a standardized modal dialog with focus management, backdrop blur, and escape-key dismissal.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--nexa-border)]">
            <NexaButton variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton variant="primary" size="sm" onClick={() => setModalOpen(false)}>
              Confirm Action
            </NexaButton>
          </div>
        </div>
      </NexaModal>
    </BusinessShell>
  );
}
