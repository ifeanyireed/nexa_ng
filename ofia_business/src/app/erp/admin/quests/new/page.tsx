"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import {
  Trophy,
  Users,
  Calendar,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Settings,
  Shield,
  Palette,
  Sliders,
  Flame,
} from "lucide-react";

export default function CreateQuestWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "2026 Annual Staff Retreat & Innovation Games",
    slug: "2026-staff-retreat",
    description: "Company-wide executive retreat featuring innovation hackathon sprints, trivia wars, and outdoor agility challenges.",
    coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    startsAt: "2026-08-22",
    endsAt: "2026-08-25",
    location: "Epe Resort & Spa, Lagos",
    visibility: "PUBLIC",
    participationType: "BOTH", // INDIVIDUAL, TEAM, BOTH
    teamCount: "8",
    autoBalance: true,
    scoringMode: "AUTOMATIC_WITH_JUDGE_OVERRIDE",
    allowManualAdjustments: true,
    primaryColor: "#1A56DB",
    accentColor: "#7E3AF2",
    enableStageTV: true,
  });

  const handleCreateQuest = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/erp/admin/quests/qst-retreat-2026`);
    }, 1200);
  };

  return (
    <BusinessShell
      title="Create New Team Quest"
      subtitle="Configure competition rules, teams, participant rosters, and branding."
      action={
        <Link href="/erp/admin/quests">
          <NexaButton size="sm" variant="outline">
            Cancel
          </NexaButton>
        </Link>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* STEP PROGRESS BAR */}
        <div className="grid grid-cols-5 gap-2 pb-4">
          {[
            { num: 1, title: "Basic Info" },
            { num: 2, title: "Participation" },
            { num: 3, title: "Scoring" },
            { num: 4, title: "Branding" },
            { num: 5, title: "Publish" },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                currentStep === s.num
                  ? "bg-[#1A56DB]/10 border-[#1A56DB] text-[#1A56DB]"
                  : currentStep > s.num
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                  : "bg-[var(--nexa-card-bg)] border-[var(--nexa-border)] text-[var(--nexa-text-muted)]"
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider font-bold">Step {s.num}</div>
              <div className="text-xs font-bold truncate">{s.title}</div>
            </div>
          ))}
        </div>

        {/* STEP 1: BASIC INFORMATION */}
        {currentStep === 1 && (
          <NexaCard variant="glass" padding="lg" className="space-y-4">
            <h3 className="text-base font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1A56DB]" /> Step 1: Quest Identity & Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                  Quest Name *
                </label>
                <NexaInput
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. 2026 Annual Staff Retreat"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                    Event Slug (URL identifier) *
                  </label>
                  <NexaInput
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="2026-staff-retreat"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                    Location / Venue *
                  </label>
                  <NexaInput
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Epe Resort & Spa, Lagos"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                  Quest Objective & Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                  placeholder="Explain the purpose, games, and incentives..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                    Start Date *
                  </label>
                  <NexaInput
                    type="date"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                    End Date *
                  </label>
                  <NexaInput
                    type="date"
                    value={formData.endsAt}
                    onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </NexaCard>
        )}

        {/* STEP 2: PARTICIPATION & TEAMS */}
        {currentStep === 2 && (
          <NexaCard variant="glass" padding="lg" className="space-y-4">
            <h3 className="text-base font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1A56DB]" /> Step 2: Participation & Team Allocations
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-2">
                  Participation Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "TEAM", title: "Team Based Only", desc: "Staff compete in assigned squads" },
                    { key: "INDIVIDUAL", title: "Individual Only", desc: "Every employee scores for themselves" },
                    { key: "BOTH", title: "Dual (Team & Individual MVP)", desc: "Squad scores + individual MVP leaderboard" },
                  ].map((p) => (
                    <div
                      key={p.key}
                      onClick={() => setFormData({ ...formData, participationType: p.key })}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.participationType === p.key
                          ? "bg-[#1A56DB]/10 border-[#1A56DB]"
                          : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)]"
                      }`}
                    >
                      <div className="text-xs font-bold text-[var(--nexa-text-primary)]">{p.title}</div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] mt-1">{p.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                    Number of Squads / Teams
                  </label>
                  <NexaInput
                    type="number"
                    value={formData.teamCount}
                    onChange={(e) => setFormData({ ...formData, teamCount: e.target.value })}
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--nexa-text-secondary)]">
                    <input
                      type="checkbox"
                      checked={formData.autoBalance}
                      onChange={(e) => setFormData({ ...formData, autoBalance: e.target.checked })}
                      className="rounded text-[#1A56DB]"
                    />
                    Auto-balance departments across teams (cross-functional squads)
                  </label>
                </div>
              </div>
            </div>
          </NexaCard>
        )}

        {/* STEP 3: SCORING RULES */}
        {currentStep === 3 && (
          <NexaCard variant="glass" padding="lg" className="space-y-4">
            <h3 className="text-base font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#1A56DB]" /> Step 3: Scoring System & Audit Ledger
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Transactional Accounting Scoring Engine
                </div>
                <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                  All points awarded are logged as immutable audit transactions in <code className="font-mono text-[#1A56DB]">erp.quest_scores</code>. Scores can be reviewed, bonus points awarded by judges, or erroneous entries reversed with full auditability.
                </p>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--nexa-text-secondary)]">
                <input
                  type="checkbox"
                  checked={formData.allowManualAdjustments}
                  onChange={(e) => setFormData({ ...formData, allowManualAdjustments: e.target.checked })}
                  className="rounded text-[#1A56DB]"
                />
                Allow Judges & HR Admins to award discretionary live challenge bonus points
              </label>
            </div>
          </NexaCard>
        )}

        {/* STEP 4: BRANDING & STAGE TV */}
        {currentStep === 4 && (
          <NexaCard variant="glass" padding="lg" className="space-y-4">
            <h3 className="text-base font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#1A56DB]" /> Step 4: Event Branding & Projector TV
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-[var(--nexa-border)]"
                    />
                    <NexaInput
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                    Accent / Gold Podium Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-[var(--nexa-border)]"
                    />
                    <NexaInput
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" /> Stage TV / Projector Live Scoreboard
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.enableStageTV}
                    onChange={(e) => setFormData({ ...formData, enableStageTV: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  Activates a zero-login, high-contrast full-screen projector view at <code className="text-amber-400 font-mono">/quests/{formData.slug}/scoreboard</code> for conference hall displays with auto-refreshing ranks and celebratory animations.
                </p>
              </div>
            </div>
          </NexaCard>
        )}

        {/* STEP 5: REVIEW & PUBLISH */}
        {currentStep === 5 && (
          <NexaCard variant="glass" padding="lg" className="space-y-4">
            <h3 className="text-base font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Step 5: Summary & Launch Quest
            </h3>

            <div className="p-4 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--nexa-text-muted)]">Event Name:</span>
                <span className="text-xs font-bold text-[var(--nexa-text-primary)]">{formData.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--nexa-text-muted)]">Dates & Venue:</span>
                <span className="text-xs font-semibold text-[var(--nexa-text-primary)]">{formData.startsAt} to {formData.endsAt} · {formData.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--nexa-text-muted)]">Squads:</span>
                <span className="text-xs font-semibold text-[var(--nexa-text-primary)]">{formData.teamCount} Balanced Teams</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--nexa-text-muted)]">Live Scoreboard URL:</span>
                <span className="text-xs font-mono text-[#1A56DB]">/quests/{formData.slug}/scoreboard</span>
              </div>
            </div>
          </NexaCard>
        )}

        {/* WIZARD CONTROLS */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--nexa-border)]">
          <NexaButton
            size="sm"
            variant="outline"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous
          </NexaButton>

          {currentStep < 5 ? (
            <NexaButton
              size="sm"
              variant="primary"
              onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Step {currentStep + 1}
            </NexaButton>
          ) : (
            <NexaButton
              size="sm"
              variant="primary"
              onClick={handleCreateQuest}
              isLoading={isSubmitting}
              leftIcon={<Flame className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Publish & Launch Quest
            </NexaButton>
          )}
        </div>
      </div>
    </BusinessShell>
  );
}
