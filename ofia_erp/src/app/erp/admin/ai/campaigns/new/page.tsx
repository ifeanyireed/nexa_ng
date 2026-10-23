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
  PhoneCall,
  Radio,
  Target,
  Zap,
} from "lucide-react";

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState("Lagos Corporate Staff Commute Outreach");
  const [goal, setGoal] = useState("Qualify 50 corporate accounts for dedicated 30-seater staff shuttle contracts");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["Voicebip PSTN", "WhatsApp Deck"]);
  const [audience, setAudience] = useState("HR & Operations Directors in Victoria Island, Ikeja, and Lekki (100+ employees)");
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
      router.push("/erp/admin/ai/campaigns");
    }, 1200);
  };

  return (
    <AppShell
      title="Create Voice Outreach Campaign"
      subtitle="Configure target corporate list, qualifying criteria, and Voicebip telephony batch dialing."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/erp/admin/ai/campaigns"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Campaigns
          </Link>

          <NexaBadge variant="brand">Step {step} of 3</NexaBadge>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
            Launch Autonomous Voice Campaign
          </h1>
          <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
            Specify your qualification objective. The Voice Agent will place outbound calls through Voicebip and log outcomes into CRM.
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
                  Step 1: Campaign Objective & Qualification Goal
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)]">
                  What business outcome should the Voice Agent qualify?
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
                  Target Qualification Goal / KPI
                </label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-sm rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                  placeholder="e.g. Qualify 50 corporate accounts for dedicated staff shuttle contracts"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-start gap-2.5 text-xs text-[var(--nexa-text-secondary)]">
                <Sparkles className="w-4 h-4 text-[#1A56DB] shrink-0 mt-0.5" />
                <span>
                  <strong>Recommended Strategy:</strong> Highlight &ldquo;Zero transit downtime &amp; 30% staff commute cost reduction&rdquo; as the primary hook.
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
                Proceed to Audience & Carrier
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
                  Step 2: Target Audience & Delivery Carrier
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)]">
                  Select target corporate criteria and delivery channels.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--nexa-text-muted)]">
                  Target Corporate Audience Description
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {["Voicebip PSTN", "WhatsApp Deck", "CRM Activity Sync"].map((ch) => {
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
                Review & Activate
              </NexaButton>
            </div>
          </NexaCard>
        )}

        {/* Step 3: Synthesis & Activation */}
        {step === 3 && (
          <NexaCard variant="glass" padding="lg" className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--nexa-border)]">
              <div className="p-2.5 rounded-xl bg-[#7E22CE] text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--nexa-text-primary)]">
                  Step 3: Voice Outreach Blueprint
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)]">
                  Confirm parameters before starting automated qualification calls.
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
                <span className="font-semibold text-[var(--nexa-text-muted)]">Telephony Carrier:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Voicebip Direct (PSTN +234)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                <strong>CRM Auto-Logging:</strong> Every completed call will automatically sync transcripts, sentiment, and qualification tags directly into <code>crm_calls</code> and <code>crm_leads</code>.
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
                leftIcon={<PhoneCall className="w-4 h-4" />}
              >
                Launch Voice Outreach
              </NexaButton>
            </div>
          </NexaCard>
        )}
      </div>
    </AppShell>
  );
}
