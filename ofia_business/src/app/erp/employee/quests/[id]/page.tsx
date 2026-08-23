"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import {
  Trophy,
  Flame,
  Camera,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  Upload,
  Play,
  FileQuestion,
  Users,
  Target,
  Tv,
  X,
} from "lucide-react";

export default function EmployeeQuestConsolePage() {
  const params = useParams();
  const questId = params?.id || "qst-retreat-2026";

  const [activeChallengeModal, setActiveChallengeModal] = useState<any | null>(null);
  const [photoCaption, setPhotoCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const challenges = [
    {
      id: "chl-01",
      name: "Executive Company & Industry Trivia",
      type: "Speed Quiz",
      status: "COMPLETED",
      score: "+150 pts awarded",
      badgeVariant: "green",
      desc: "Speed quiz testing corporate history and product milestones.",
    },
    {
      id: "chl-02",
      name: "Best Creative Team Mascot Photo",
      type: "Photo Evidence",
      status: "ACTIVE",
      score: "Max +200 pts",
      badgeVariant: "brand",
      desc: "Staged team photograph embodying your team motto with natural resort scenery.",
      deadline: "Closes in 38 minutes",
    },
    {
      id: "chl-03",
      name: "2-Hour Product Innovation Pitch",
      type: "Panel Pitch",
      status: "UPCOMING",
      score: "Max +300 pts",
      badgeVariant: "secondary",
      desc: "Pitch an AI-driven workflow to executive panel.",
      deadline: "Starts at 5:00 PM",
    },
  ];

  const handleSubmitProof = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setActiveChallengeModal(null);
      }, 1500);
    }, 1000);
  };

  return (
    <BusinessShell
      title="Player Console — 2026 Staff Retreat"
      subtitle="Team Alpha (Blue Eagles) · Current Standings: Rank #1 (840 points)"
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/quests/2026-staff-retreat/scoreboard" target="_blank">
            <NexaButton size="sm" variant="outline" leftIcon={<Tv className="w-4 h-4 text-[#1A56DB]" />}>
              Stage TV Scoreboard
            </NexaButton>
          </Link>
          <Link href="/erp/employee/quests">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              All Quests
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* TEAM IDENTITY BANNER */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1A56DB] to-[#1E429F] text-white shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-mono font-black text-xl backdrop-blur-md">
              A
            </div>
            <div>
              <div className="text-xs font-bold text-white/80 uppercase tracking-wider">Your Squad</div>
              <h2 className="text-xl font-black">Team Alpha (Blue Eagles)</h2>
              <p className="text-xs text-white/80">&ldquo;Swift, Strategic, Unstoppable&rdquo; · 15 Members</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-white/80 uppercase font-bold">Total Points</div>
            <div className="text-3xl font-black text-amber-300">840 pts</div>
            <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 mt-1 justify-end">
              <Trophy className="w-3.5 h-3.5 text-amber-300" /> Rank 1 of 8
            </span>
          </div>
        </div>

        {/* CHALLENGES LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Target className="w-4 h-4 text-[#1A56DB]" /> Challenge Track
            </h3>
            <span className="text-xs text-[var(--nexa-text-muted)]">3 Activities Available</span>
          </div>

          <div className="space-y-3">
            {challenges.map((chl) => (
              <NexaCard
                key={chl.id}
                variant="glass"
                padding="md"
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[var(--nexa-text-primary)]">{chl.name}</h4>
                    <NexaBadge variant={chl.badgeVariant as any} size="sm">
                      {chl.status}
                    </NexaBadge>
                  </div>
                  <p className="text-xs text-[var(--nexa-text-secondary)]">{chl.desc}</p>
                  <div className="text-[11px] text-[var(--nexa-text-muted)] flex items-center gap-3 pt-1">
                    <span>{chl.type}</span>
                    <span>·</span>
                    <strong className="text-[var(--nexa-text-primary)]">{chl.score}</strong>
                    {chl.deadline && (
                      <>
                        <span>·</span>
                        <span className="text-amber-500 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {chl.deadline}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  {chl.status === "ACTIVE" ? (
                    <NexaButton
                      size="sm"
                      variant="primary"
                      onClick={() => setActiveChallengeModal(chl)}
                      leftIcon={<Upload className="w-4 h-4" />}
                    >
                      Submit Evidence
                    </NexaButton>
                  ) : chl.status === "COMPLETED" ? (
                    <NexaBadge variant="green" size="md">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Score Logged
                    </NexaBadge>
                  ) : (
                    <NexaButton size="sm" variant="outline" disabled>
                      Locked
                    </NexaButton>
                  )}
                </div>
              </NexaCard>
            ))}
          </div>
        </div>

        {/* SUBMISSION MODAL */}
        {activeChallengeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--nexa-card-bg)] border border-[var(--nexa-border)] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
                <h3 className="text-sm font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#1A56DB]" /> Submit Proof for Mascot Photo
                </h3>
                <button
                  onClick={() => setActiveChallengeModal(null)}
                  className="text-xs text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isSubmitted ? (
                <div className="py-8 text-center space-y-2 text-emerald-500">
                  <CheckCircle2 className="w-10 h-10 mx-auto" />
                  <h4 className="text-base font-bold">Submission Received!</h4>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Judges will review the mascot photo and award up to +200 points.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 border-2 border-dashed border-[var(--nexa-border)] rounded-xl text-center space-y-2 cursor-pointer hover:border-[#1A56DB] bg-[var(--nexa-bg-base)]">
                    <Upload className="w-8 h-8 mx-auto text-[var(--nexa-text-muted)]" />
                    <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                      Click to upload team photo (JPG/PNG)
                    </div>
                    <div className="text-[10px] text-[var(--nexa-text-muted)]">Max 15MB file size</div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                      Team Caption / Notes
                    </label>
                    <NexaInput
                      value={photoCaption}
                      onChange={(e) => setPhotoCaption(e.target.value)}
                      placeholder="e.g. Team Alpha flying our eagle wings at the lake pier!"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <NexaButton size="sm" variant="outline" onClick={() => setActiveChallengeModal(null)}>
                      Cancel
                    </NexaButton>
                    <NexaButton
                      size="sm"
                      variant="primary"
                      onClick={handleSubmitProof}
                      isLoading={isSubmitting}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Submit for Judging
                    </NexaButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </BusinessShell>
  );
}
