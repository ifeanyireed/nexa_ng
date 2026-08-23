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
  Gavel,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Clock,
  Camera,
  Play,
  Flame,
  Award,
  Users,
  Eye,
} from "lucide-react";

interface SubmissionItem {
  id: string;
  teamName: string;
  logo: string;
  submittedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  scoreAwarded?: number;
  evidenceUrl: string;
  caption: string;
}

const DEMO_SUBMISSIONS: SubmissionItem[] = [
  {
    id: "sub-01",
    teamName: "Team Alpha (Blue Eagles)",
    logo: "A",
    submittedAt: "2:45 PM",
    status: "APPROVED",
    scoreAwarded: 195,
    evidenceUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    caption: "All 15 members flying our eagle wings in front of the lake pier!",
  },
  {
    id: "sub-02",
    teamName: "Team Bravo (Red Vipers)",
    logo: "B",
    submittedAt: "3:10 PM",
    status: "PENDING",
    evidenceUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80",
    caption: "Red Vipers striking pose by the main palm garden gazebo.",
  },
  {
    id: "sub-03",
    teamName: "Team Delta (Green Lions)",
    logo: "D",
    submittedAt: "3:15 PM",
    status: "PENDING",
    evidenceUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
    caption: "Green Lions unified circle formation.",
  },
];

export default function ChallengeControlRoomPage() {
  const params = useParams();
  const questId = params?.id || "qst-retreat-2026";
  const challengeId = params?.challengeId || "chl-photo-02";

  const [submissions, setSubmissions] = useState<SubmissionItem[]>(DEMO_SUBMISSIONS);
  const [selectedSub, setSelectedSub] = useState<SubmissionItem | null>(DEMO_SUBMISSIONS[1]);
  const [gradeScore, setGradeScore] = useState("180");
  const [judgeNote, setJudgeNote] = useState("Excellent team spirit and full attendance in colors.");

  const handleGrade = (status: "APPROVED" | "REJECTED") => {
    if (!selectedSub) return;
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === selectedSub.id
          ? {
              ...s,
              status,
              scoreAwarded: status === "APPROVED" ? parseInt(gradeScore || "0", 10) : 0,
            }
          : s
      )
    );
    setSelectedSub(null);
  };

  return (
    <BusinessShell
      title="Judge Control Room — Mascot Photo Challenge"
      subtitle="Review live photo submissions, evaluate against criteria, and award transactional score ledger points."
      action={
        <Link href={`/erp/admin/quests/${questId}`}>
          <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Quest
          </NexaButton>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* TOP STATUS BAR */}
        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gavel className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-xs font-bold">Best Creative Team Mascot Photo (Max +200 pts)</div>
              <div className="text-[11px] text-gray-400">3 Submissions Received · 2 Pending Review · Time Remaining: 42m</div>
            </div>
          </div>
          <NexaBadge variant="green" size="sm" className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-emerald-300" /> JUDGING ACTIVE
          </NexaBadge>
        </div>

        {/* SUBMISSION REVIEW & GRADING WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SUBMISSIONS LIST */}
          <NexaCard variant="glass" padding="md" className="space-y-3">
            <h3 className="text-xs font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider">
              Squad Submissions
            </h3>

            <div className="space-y-2.5">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSub(sub)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedSub?.id === sub.id
                      ? "bg-[#1A56DB]/10 border-[#1A56DB]"
                      : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                      <span>{sub.logo}</span>
                      <span>{sub.teamName}</span>
                    </span>
                    <NexaBadge
                      variant={
                        sub.status === "APPROVED"
                          ? "green"
                          : sub.status === "PENDING"
                          ? "brand"
                          : "red"
                      }
                      size="sm"
                    >
                      {sub.status}
                    </NexaBadge>
                  </div>
                  <p className="text-[11px] text-[var(--nexa-text-muted)] line-clamp-1">{sub.caption}</p>
                  <div className="text-[10px] text-[var(--nexa-text-muted)] mt-1 flex items-center justify-between">
                    <span>Submitted: {sub.submittedAt}</span>
                    {sub.scoreAwarded !== undefined && (
                      <strong className="text-emerald-500">+{sub.scoreAwarded} pts</strong>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </NexaCard>

          {/* EVIDENCE PREVIEW & SCORE ENTRY DESK */}
          <NexaCard variant="glass" padding="lg" className="space-y-5 lg:col-span-2">
            {selectedSub ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                      <span>{selectedSub.logo}</span>
                      <span>{selectedSub.teamName}</span>
                    </h3>
                    <div className="text-xs text-[var(--nexa-text-muted)]">Submitted at {selectedSub.submittedAt}</div>
                  </div>
                  <NexaBadge variant={selectedSub.status === "APPROVED" ? "green" : "brand"}>
                    {selectedSub.status}
                  </NexaBadge>
                </div>

                {/* IMAGE EVIDENCE */}
                <div className="rounded-xl overflow-hidden border border-[var(--nexa-border)] bg-black/40 h-72">
                  <img
                    src={selectedSub.evidenceUrl}
                    alt="Proof"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-3 rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-secondary)]">
                  <strong>Squad Caption: </strong> &ldquo;{selectedSub.caption}&rdquo;
                </div>

                {/* JUDGE SCORING FORM */}
                <div className="p-4 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-card-bg)] space-y-3">
                  <h4 className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" /> Judge Score Entry Desk
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-[var(--nexa-text-secondary)] block mb-1">
                        Award Points (Max 200)
                      </label>
                      <NexaInput
                        type="number"
                        value={gradeScore}
                        onChange={(e) => setGradeScore(e.target.value)}
                        placeholder="180"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[var(--nexa-text-secondary)] block mb-1">
                        Judge Evaluation Feedback
                      </label>
                      <NexaInput
                        value={judgeNote}
                        onChange={(e) => setJudgeNote(e.target.value)}
                        placeholder="Feedback note..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <NexaButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleGrade("REJECTED")}
                      leftIcon={<XCircle className="w-4 h-4 text-red-500" />}
                    >
                      Reject Submission
                    </NexaButton>
                    <NexaButton
                      size="sm"
                      variant="primary"
                      onClick={() => handleGrade("APPROVED")}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Award {gradeScore} pts & Post to Scoreboard
                    </NexaButton>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-[var(--nexa-text-muted)] space-y-2">
                <Camera className="w-8 h-8 text-[var(--nexa-text-muted)]" />
                <p className="text-xs">Select a squad submission from the left panel to review proof and score.</p>
              </div>
            )}
          </NexaCard>
        </div>
      </div>
    </BusinessShell>
  );
}
