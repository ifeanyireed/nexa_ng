"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NexaModal } from "@/components/nexa/NexaModal";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Server,
  Key,
  Globe,
  Zap,
  AlertTriangle,
  Info,
  Layers,
  HelpCircle,
  X,
} from "lucide-react";

interface EmailSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  currentProvider?: string;
  hasApiKey?: boolean;
  onSelectProvider?: (provider: string) => void;
}

export const EmailSetupWizard: React.FC<EmailSetupWizardProps> = ({
  isOpen,
  onClose,
  currentProvider = "RESEND",
  hasApiKey = false,
  onSelectProvider,
}) => {
  const [step, setStep] = useState(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const steps = [
    {
      number: 1,
      title: "Choose Driver",
      shortDesc: "Pick email delivery engine",
      icon: Server,
    },
    {
      number: 2,
      title: "API Credentials",
      shortDesc: "Secure key storage",
      icon: Key,
    },
    {
      number: 3,
      title: "Sandbox Rule",
      shortDesc: "Recipient restrictions",
      icon: AlertTriangle,
    },
    {
      number: 4,
      title: "Domain DNS",
      shortDesc: "DKIM & SPF Records",
      icon: Globe,
    },
    {
      number: 5,
      title: "Dispatch Test",
      shortDesc: "Verify live handshake",
      icon: Zap,
    },
  ];

  return (
    <NexaModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1A56DB] to-[#7E3AF2] flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--nexa-text-primary)] text-display">
              Email Infrastructure Setup Wizard
            </h2>
            <p className="text-xs text-[var(--nexa-text-muted)]">
              Step {step} of 5 • Guided walkthrough for 100% email deliverability
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6 pt-2">
        {/* Step Progress Indicator */}
        <div className="grid grid-cols-5 gap-2 p-1.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = step > s.number;
            const isCurrent = step === s.number;

            return (
              <button
                key={s.number}
                onClick={() => setStep(s.number)}
                className={`flex flex-col items-center text-center p-2 rounded-xl transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[var(--nexa-bg-surface)] text-[#1A56DB] shadow-sm font-bold border border-[#1A56DB]/30"
                    : isCompleted
                    ? "text-[#0E9F6E] hover:bg-[var(--nexa-bg-surface)]"
                    : "text-[var(--nexa-text-muted)] hover:bg-[var(--nexa-bg-surface)] opacity-70"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0E9F6E]" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                  <span className="text-xs">{s.number}</span>
                </div>
                <span className="text-[11px] leading-tight line-clamp-1 hidden sm:block">
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* STEP 1: CHOOSE DRIVER */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-2xl bg-[#1A56DB]/10 border border-[#1A56DB]/20 text-[#1A56DB] flex items-start gap-3">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold">Step 1: Select your Platform Driver</span>
                <p className="text-[var(--nexa-text-secondary)] leading-relaxed">
                  Ofia AI uses this relay engine for all outbound cold emails, daily briefing alerts, and tenant onboarding before custom domains are connected.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Resend Option */}
              <div
                onClick={() => onSelectProvider?.("RESEND")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative space-y-2 ${
                  currentProvider === "RESEND"
                    ? "bg-[#1A56DB]/5 border-[#1A56DB] shadow-md ring-1 ring-[#1A56DB]"
                    : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] hover:border-[#1A56DB]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-[#1A56DB]" />
                    Resend API
                  </div>
                  <NexaBadge variant="purple">Recommended</NexaBadge>
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">
                  Fastest setup, 99.4% inbox deliverability, instant API key generation, and built-in sandbox.
                </p>
                <div className="text-[10px] text-[#1A56DB] font-semibold flex items-center gap-1 pt-1">
                  Format: <code>re_...</code>
                </div>
              </div>

              {/* Brevo Option */}
              <div
                onClick={() => onSelectProvider?.("BREVO")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative space-y-2 ${
                  currentProvider === "BREVO"
                    ? "bg-[#1A56DB]/5 border-[#1A56DB] shadow-md ring-1 ring-[#1A56DB]"
                    : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] hover:border-[#1A56DB]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#0E9F6E]" />
                    Brevo (v3)
                  </div>
                  <NexaBadge variant="cyan">300/day Free</NexaBadge>
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">
                  Standard v3 REST API, high volume transactional throughput, and auto spam complaint tracking.
                </p>
                <div className="text-[10px] text-[#0E9F6E] font-semibold flex items-center gap-1 pt-1">
                  Format: <code>xkeysib-...</code>
                </div>
              </div>

              {/* Amazon SES Option */}
              <div
                onClick={() => onSelectProvider?.("AWS_SES")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative space-y-2 ${
                  currentProvider === "AWS_SES"
                    ? "bg-[#1A56DB]/5 border-[#1A56DB] shadow-md ring-1 ring-[#1A56DB]"
                    : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] hover:border-[#1A56DB]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FF9900]" />
                    Amazon SES
                  </div>
                  <NexaBadge variant="neutral">Enterprise</NexaBadge>
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">
                  Lowest cost at scale ($0.10/10k emails). Requires IAM credentials and AWS region selection.
                </p>
                <div className="text-[10px] text-[#FF9900] font-semibold flex items-center gap-1 pt-1">
                  AWS IAM Access + Secret Key
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: API CREDENTIALS */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-2xl bg-[#0E9F6E]/10 border border-[#0E9F6E]/20 text-[#0E9F6E] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold">Step 2: Obtain & Save Your Master API Key</span>
                <p className="text-[var(--nexa-text-secondary)] leading-relaxed">
                  Keys are encrypted with <strong>AES-256-GCM zero-knowledge encryption</strong> in MySQL before storage.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Where to get your API Key:
                </span>
                <a
                  href={
                    currentProvider === "BREVO"
                      ? "https://app.brevo.com/settings/keys/api"
                      : currentProvider === "AWS_SES"
                      ? "https://console.aws.amazon.com/ses"
                      : "https://resend.com/api-keys"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#1A56DB] hover:underline flex items-center gap-1"
                >
                  Open {currentProvider} Dashboard
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <ol className="text-xs text-[var(--nexa-text-secondary)] space-y-2 list-decimal list-inside">
                <li>Log in to your <strong>{currentProvider}</strong> dashboard.</li>
                <li>
                  Navigate to <strong>API Keys</strong> and click <strong>Create API Key</strong>.
                </li>
                <li>Set permission to <strong>Full Access</strong> or <strong>Sending Access</strong>.</li>
                <li>Copy the generated key (starts with <code>{currentProvider === "BREVO" ? "xkeysib-" : currentProvider === "AWS_SES" ? "AKIA" : "re_"}</code>).</li>
                <li>Paste it into the <strong>Platform Master API Key</strong> field and click <strong>Save Global Configuration</strong>.</li>
              </ol>
            </div>
          </motion.div>
        )}

        {/* STEP 3: SANDBOX VS CUSTOM DOMAIN RULE */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold">Step 3: Crucial Provider Sandbox Rule</span>
                <p className="text-[var(--nexa-text-secondary)] leading-relaxed">
                  Why test dispatches to third-party emails fail on brand new accounts before domain verification.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                <div className="text-xs font-bold text-[#F59E0B] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Before Domain Verification (Sandbox Mode)
                </div>
                <p className="text-xs text-[var(--nexa-text-muted)] leading-relaxed">
                  Resend allows test sends via <code>onboarding@resend.dev</code> <strong>ONLY to the single email address registered on your Resend account</strong>.
                </p>
                <div className="p-2.5 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[11px] font-mono text-[var(--nexa-text-secondary)]">
                  Allowed: Your Account Email<br />
                  Blocked: Third-party emails (403 error)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[#0E9F6E]/30 space-y-2">
                <div className="text-xs font-bold text-[#0E9F6E] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  After Domain Verification (Production Mode)
                </div>
                <p className="text-xs text-[var(--nexa-text-muted)] leading-relaxed">
                  Once you add and verify <code>ofia.ng</code> (or your custom domain), you can dispatch emails to <strong>any recipient in the world</strong> from <code>outreach@ofia.ng</code>.
                </p>
                <div className="p-2.5 rounded-xl bg-[#0E9F6E]/10 border border-[#0E9F6E]/20 text-[11px] font-mono text-[#0E9F6E]">
                  Status: Full Production Scale<br />
                  From: outreach@ofia.ng
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4: DNS RECORDS */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-2xl bg-[#1A56DB]/10 border border-[#1A56DB]/20 text-[#1A56DB] flex items-start gap-3">
              <Globe className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold">Step 4: Add DNS Authentication Records to ofia.ng</span>
                <p className="text-[var(--nexa-text-secondary)] leading-relaxed">
                  Add these 3 DNS records in your DNS provider (Cloudflare, Namecheap, GoDaddy, Hostinger) to pass SPF, DKIM, and DMARC checks.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* DKIM */}
              <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                    <NexaBadge variant="brand">DKIM (TXT)</NexaBadge>
                    <code>resend._domainkey.ofia.ng</code>
                  </span>
                  <button
                    onClick={() => copyToClipboard("resend._domainkey", "dkim-name")}
                    className="text-[11px] font-bold text-[#1A56DB] flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    {copiedKey === "dkim-name" ? <Check className="w-3 h-3 text-[#0E9F6E]" /> : <Copy className="w-3 h-3" />}
                    Copy Name
                  </button>
                </div>
                <div className="p-2 rounded-xl bg-[var(--nexa-bg-surface)] text-[11px] font-mono text-[var(--nexa-text-muted)] flex items-center justify-between">
                  <span className="truncate">p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...</span>
                  <button
                    onClick={() => copyToClipboard("p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...", "dkim-val")}
                    className="text-xs text-[#1A56DB] ml-2 shrink-0 font-bold"
                  >
                    {copiedKey === "dkim-val" ? "Copied!" : "Copy Value"}
                  </button>
                </div>
              </div>

              {/* SPF */}
              <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                    <NexaBadge variant="cyan">SPF (TXT)</NexaBadge>
                    <code>ofia.ng</code> (or @)
                  </span>
                  <button
                    onClick={() => copyToClipboard("v=spf1 include:amazonses.com ~all", "spf-val")}
                    className="text-[11px] font-bold text-[#1A56DB] flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    {copiedKey === "spf-val" ? <Check className="w-3 h-3 text-[#0E9F6E]" /> : <Copy className="w-3 h-3" />}
                    Copy Value
                  </button>
                </div>
                <div className="p-2 rounded-xl bg-[var(--nexa-bg-surface)] text-[11px] font-mono text-[var(--nexa-text-muted)]">
                  v=spf1 include:amazonses.com ~all
                </div>
              </div>

              {/* DMARC */}
              <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                    <NexaBadge variant="purple">DMARC (TXT)</NexaBadge>
                    <code>_dmarc.ofia.ng</code>
                  </span>
                  <button
                    onClick={() => copyToClipboard("v=DMARC1; p=none;", "dmarc-val")}
                    className="text-[11px] font-bold text-[#1A56DB] flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    {copiedKey === "dmarc-val" ? <Check className="w-3 h-3 text-[#0E9F6E]" /> : <Copy className="w-3 h-3" />}
                    Copy Value
                  </button>
                </div>
                <div className="p-2 rounded-xl bg-[var(--nexa-bg-surface)] text-[11px] font-mono text-[var(--nexa-text-muted)]">
                  v=DMARC1; p=none; rua=mailto:dmarc@ofia.ng
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 5: RUN DISPATCH TEST */}
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-2xl bg-[#0E9F6E]/10 border border-[#0E9F6E]/20 text-[#0E9F6E] flex items-start gap-3">
              <Zap className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold">Step 5: Run the Live Verification Handshake</span>
                <p className="text-[var(--nexa-text-secondary)] leading-relaxed">
                  Test your connection directly on the page to confirm that your provider API key is functioning.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3 text-xs text-[var(--nexa-text-secondary)]">
              <h4 className="font-bold text-[var(--nexa-text-primary)]">Quick Test Checklist:</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0E9F6E]" />
                  <span>If testing before domain verification: enter your <strong>Resend account email</strong> (e.g. <code>reedbreednigeria@gmail.com</code>).</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0E9F6E]" />
                  <span>If domain is verified: enter any recipient email address.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0E9F6E]" />
                  <span>Click <strong>"Dispatch Test"</strong> and watch for the live confirmation toast!</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-[var(--nexa-border)] pt-4">
          <NexaButton
            size="sm"
            variant="outline"
            disabled={step === 1}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
          >
            Previous Step
          </NexaButton>

          <div className="flex items-center gap-2">
            {step < 5 ? (
              <NexaButton
                size="sm"
                variant="primary"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setStep((prev) => Math.min(5, prev + 1))}
              >
                Next Step
              </NexaButton>
            ) : (
              <NexaButton
                size="sm"
                variant="primary"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                onClick={onClose}
              >
                Done & Ready to Test
              </NexaButton>
            )}
          </div>
        </div>
      </div>
    </NexaModal>
  );
};
