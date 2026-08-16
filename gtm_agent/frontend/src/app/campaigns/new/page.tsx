"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/gtm/AppShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Mail,
  MessageSquare,
  Radio,
  Layers,
  Target,
  Zap,
} from "lucide-react";

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState("K-12 Tuition Automation Blitz Q3");
  const [goal, setGoal] = useState("Book 30 enterprise demos with private school bursars");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["Email", "WhatsApp"]);
  const [audience, setAudience] = useState("Private school proprietors in Lagos & Abuja (250+ students)");
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleChannel = (ch: string) => {
    if (selectedChannels.includes(ch)) {
      setSelectedChannels(selectedChannels.filter((c) => c !== ch));
    } else {
      setSelectedChannels([...selectedChannels, ch]);
    }
  };

  const handleDeploy = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      router.push("/campaigns");
    }, 2000);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Campaigns
          </Link>

          <NexaBadge variant="brand">Step {step} of 3</NexaBadge>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
            Deploy New Autonomous Campaign
          </h1>
          <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
            Specify your goal. Your AI revenue team will craft the strategy, extract leads, and prepare execution assets.
          </p>
        </div>

        {/* Step 1: Goal & Name */}
        {step === 1 && (
          <NexaCard variant="glass" padding="lg" className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--nexa-border)]">
              <div className="p-2.5 rounded-xl bg-[#1A56DB] text-white">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--nexa-text-primary)]">
                  Step 1: Campaign Objective & Core Offer
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)]">
                  What business outcome should your AI team achieve?
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <NexaInput
                label="Campaign Name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--nexa-text-muted)]">
                  Primary Outcome / Target KPI
                </label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-sm rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                  placeholder="e.g. Book 30 demos with school directors in Lagos"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-start gap-2.5 text-xs text-[var(--nexa-text-secondary)]">
                <Sparkles className="w-4 h-4 text-[#1A56DB] shrink-0 mt-0.5" />
                <span>
                  <strong>AI Suggestion:</strong> Marcus Aurel (GTM Strategist) recommends focusing on "Tuition Leakage Prevention" as the core hook.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[var(--nexa-border)]">
              <NexaButton
                size="md"
                variant="primary"
                onClick={() => setStep(2)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Channels & Audience
              </NexaButton>
            </div>
          </NexaCard>
        )}

        {/* Step 2: Audience & Channels */}
        {step === 2 && (
          <NexaCard variant="glass" padding="lg" className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--nexa-border)]">
              <div className="p-2.5 rounded-xl bg-[#0E9F6E] text-white">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--nexa-text-primary)]">
                  Step 2: Audience & Multi-Channel Mix
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)]">
                  Select where your agents will identify and engage prospects.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--nexa-text-muted)]">
                  Target Audience Description
                </label>
                <textarea
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-sm rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--nexa-text-muted)] block mb-2">
                  Select Execution Channels
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {["Email", "WhatsApp", "LinkedIn", "Meta Ads"].map((ch) => {
                    const isSelected = selectedChannels.includes(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleChannel(ch)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                          isSelected
                            ? "bg-[#1A56DB] text-white border-[#1A56DB] shadow-sm dark:bg-[#3B82F6]"
                            : "bg-[var(--nexa-bg-surface)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:border-[#1A56DB]/40"
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[var(--nexa-border)]">
              <NexaButton size="md" variant="outline" onClick={() => setStep(1)}>
                Back
              </NexaButton>
              <NexaButton
                size="md"
                variant="primary"
                onClick={() => setStep(3)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Review & Auto-Generate
              </NexaButton>
            </div>
          </NexaCard>
        )}

        {/* Step 3: Synthesis & Auto-Generation */}
        {step === 3 && (
          <NexaCard variant="glass" padding="lg" className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--nexa-border)]">
              <div className="p-2.5 rounded-xl bg-[#7E22CE] text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--nexa-text-primary)]">
                  Step 3: AI Swarm Orchestration Summary
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)]">
                  Review the deployment blueprint before agents commence execution.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 bg-[var(--nexa-bg-base)] p-4 rounded-2xl border border-[var(--nexa-border)]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--nexa-text-muted)]">Campaign:</span>
                <span className="font-bold text-[var(--nexa-text-primary)]">{campaignName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--nexa-text-muted)]">Target KPI:</span>
                <span className="text-[var(--nexa-text-primary)]">{goal}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--nexa-text-muted)]">Channels:</span>
                <span className="text-[#1A56DB] dark:text-[#60A5FA] font-bold">
                  {selectedChannels.join(" + ")}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--nexa-text-muted)]">Orchestrating Agents:</span>
                <span className="text-[var(--nexa-text-secondary)]">
                  Olivia (Leads), Julian (Copy), Devon (Manager), Noah (Outreach)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFBEB] dark:bg-[#F59E0B]/10 border border-[#C88A3A]/20 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#C88A3A] shrink-0 mt-0.5" />
              <div className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                <strong>Human-in-the-Loop Safe:</strong> All generated email sequences, WhatsApp dialogs, and ad copies will be routed to your <strong>Approval Center</strong> for one-click authorization before sending.
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[var(--nexa-border)]">
              <NexaButton size="md" variant="outline" onClick={() => setStep(2)}>
                Back
              </NexaButton>
              <NexaButton
                size="md"
                variant="primary"
                isLoading={isGenerating}
                onClick={handleDeploy}
                leftIcon={<Zap className="w-4 h-4" />}
              >
                Deploy AI Revenue Swarm
              </NexaButton>
            </div>
          </NexaCard>
        )}
      </div>
    </AppShell>
  );
}
