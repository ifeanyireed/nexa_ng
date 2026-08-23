"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import {
  Target,
  Sparkles,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Sliders,
  Clock,
  Award,
  Layers,
  FileQuestion,
  Camera,
  Gavel,
  Users,
} from "lucide-react";

export default function CreateChallengePage() {
  const params = useParams();
  const router = useRouter();
  const questId = params?.id || "qst-retreat-2026";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [challengeData, setChallengeData] = useState({
    name: "Best Creative Team Mascot Photo",
    type: "SUBMISSION", // QUIZ, SUBMISSION, MANUAL_JUDGING, TIMED_TASK
    participationType: "TEAM",
    points: "200",
    description: "Staged team photograph embodying your team motto with natural resort scenery.",
    instructions: "Upload 1 high-resolution photo with all members present in team colors.",
    submissionType: "IMAGE", // NONE, TEXT, IMAGE, VIDEO, FILE, QUIZ
    reviewMode: "JUDGE_APPROVAL", // AUTOMATIC, JUDGE_APPROVAL
    timeLimitMinutes: "60",
  });

  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/erp/admin/quests/${questId}`);
    }, 1000);
  };

  return (
    <BusinessShell
      title="Create New Challenge"
      subtitle="Generic competition template: Trivia, evidence upload, timed race, or manual panel judging."
      action={
        <Link href={`/erp/admin/quests/${questId}`}>
          <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Quest
          </NexaButton>
        </Link>
      }
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <NexaCard variant="glass" padding="lg" className="space-y-5">
          {/* CHALLENGE TYPE TEMPLATES */}
          <div>
            <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-2">
              Challenge Format / Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: "QUIZ", title: "Speed Trivia / Quiz", icon: FileQuestion, desc: "Automated multiple choice quiz" },
                { key: "SUBMISSION", title: "Media / Photo Proof", icon: Camera, desc: "Photo/Video evidence review" },
                { key: "MANUAL_JUDGING", title: "Judge Presentation", icon: Gavel, desc: "Live pitch scoring" },
                { key: "TIMED_TASK", title: "Agility / Relay", icon: Clock, desc: "Timed outdoor activity" },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = challengeData.type === t.key;
                return (
                  <div
                    key={t.key}
                    onClick={() => setChallengeData({ ...challengeData, type: t.key })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1 ${
                      isSelected
                        ? "bg-[#1A56DB]/10 border-[#1A56DB] text-[#1A56DB]"
                        : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-primary)]"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#1A56DB]" />
                    <div className="text-xs font-bold">{t.title}</div>
                    <div className="text-[10px] text-[var(--nexa-text-muted)] leading-tight">{t.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                Challenge Name *
              </label>
              <NexaInput
                value={challengeData.name}
                onChange={(e) => setChallengeData({ ...challengeData, name: e.target.value })}
                placeholder="e.g. 2-Hour Product Hackathon Sprint"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                  Points Awarded *
                </label>
                <NexaInput
                  type="number"
                  value={challengeData.points}
                  onChange={(e) => setChallengeData({ ...challengeData, points: e.target.value })}
                  placeholder="200"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                  Time Window (Minutes)
                </label>
                <NexaInput
                  type="number"
                  value={challengeData.timeLimitMinutes}
                  onChange={(e) => setChallengeData({ ...challengeData, timeLimitMinutes: e.target.value })}
                  placeholder="60"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                Instructions & Evaluation Criteria
              </label>
              <textarea
                value={challengeData.instructions}
                onChange={(e) => setChallengeData({ ...challengeData, instructions: e.target.value })}
                rows={3}
                className="w-full p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                placeholder="Detail what participants must do to score full points..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                  Scoring Verification
                </label>
                <select
                  value={challengeData.reviewMode}
                  onChange={(e) => setChallengeData({ ...challengeData, reviewMode: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] outline-none"
                >
                  <option value="AUTOMATIC">Instant Automatic Scoring</option>
                  <option value="JUDGE_APPROVAL">Requires Judge Verification & Scoring</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                  Participation Unit
                </label>
                <select
                  value={challengeData.participationType}
                  onChange={(e) => setChallengeData({ ...challengeData, participationType: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] outline-none"
                >
                  <option value="TEAM">Squad / Team Activity</option>
                  <option value="INDIVIDUAL">Individual Employee Task</option>
                  <option value="EVERYONE">Everyone Participates</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--nexa-border)]">
            <Link href={`/erp/admin/quests/${questId}`}>
              <NexaButton size="sm" variant="outline">
                Cancel
              </NexaButton>
            </Link>
            <NexaButton
              size="sm"
              variant="primary"
              onClick={handleSave}
              isLoading={isSubmitting}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Save & Activate Challenge
            </NexaButton>
          </div>
        </NexaCard>
      </div>
    </BusinessShell>
  );
}
