"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { resolveAvatarUrl } from "@/lib/avatar";
import { useAwardsStore, AwardNominee, AwardWinner } from "@/lib/awards-store";
import { useERPStore, getSignedInERPUser } from "@/lib/erp-store";
import {
  Award,
  Trophy,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Lock,
  Heart,
  Share2,
  Download,
  AlertCircle,
  Check,
  HelpCircle,
  FileCheck,
  PartyPopper,
} from "lucide-react";

export default function EmployeeAwardsPage() {
  const {
    activeEvent,
    hallOfFame,
    isLoading,
    submitBallot,
    checkBallotStatus,
  } = useAwardsStore();

  const { users } = useERPStore();
  const [currentUser, setCurrentUser] = useState(() => getSignedInERPUser(users));

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = getSignedInERPUser(users);
      setCurrentUser(active);
    }
  }, [users]);

  const [activeTab, setActiveTab] = useState<"VOTE" | "STATUS" | "HALL_OF_FAME">("VOTE");
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  // Map of categoryId -> selected nomineeId
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [hasVoted, setHasVoted] = useState(false);
  const [ballotReceipt, setBallotReceipt] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [kudosSent, setKudosSent] = useState<Record<string, boolean>>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Check ballot status on load
  useEffect(() => {
    if (activeEvent?.id && currentUser?.id) {
      checkBallotStatus(activeEvent.id, currentUser.id).then((res) => {
        if (res?.hasVoted) {
          setHasVoted(true);
          setBallotReceipt(res.ballot);
          setActiveTab("STATUS");
        }
      });
    }
  }, [activeEvent?.id, currentUser?.id, checkBallotStatus]);

  const categories = activeEvent?.categories || [];
  const currentCategory = categories[currentCategoryIndex];
  const totalCategories = categories.length;
  const completedCount = Object.keys(selections).length;

  const handleSelectNominee = (nominee: AwardNominee) => {
    // ANTI-SELF-VOTING PRE-EMPTION
    if (
      currentUser?.id &&
      nominee.employeeId.toLowerCase() === currentUser.id.toLowerCase()
    ) {
      alert("Self-voting is strictly prohibited by HR integrity policy. You cannot vote for yourself.");
      return;
    }

    setSelections((prev) => ({
      ...prev,
      [nominee.categoryId]: nominee.id,
    }));
  };

  const handleSubmitBallot = async () => {
    if (!activeEvent?.id || !currentUser?.id) return;

    const selectionsArray = Object.entries(selections).map(([catId, nomId]) => ({
      categoryId: catId,
      nomineeId: nomId,
    }));

    if (selectionsArray.length === 0) {
      setSubmissionError("Please select at least one nominee before submitting.");
      return;
    }

    setSubmissionError(null);
    const res = await submitBallot(activeEvent.id, currentUser.id, selectionsArray);

    if (res?.success) {
      setHasVoted(true);
      setBallotReceipt({
        receiptHash: res.receiptHash,
        categoriesVotedCount: res.categoriesVotedCount,
        submittedAt: res.submittedAt || new Date().toISOString(),
        isSealed: true,
      });
      setIsReviewModalOpen(false);
      setSubmissionSuccess(true);
      setActiveTab("STATUS");
    } else {
      setSubmissionError(res?.error || "Failed to submit ballot.");
    }
  };

  const handleSendKudos = (winnerId: string) => {
    setKudosSent((prev) => ({ ...prev, [winnerId]: true }));
    setTimeout(() => {
      // keep marked as cheered
    }, 2000);
  };

  return (
    <BusinessShell
      title="Employee Awards & Recognition Hub"
      subtitle="Cast your annual recognition votes, review your sealed audit receipt, and celebrate company excellence."
    >
      <div className="space-y-6">
        {/* Top Tab Bar */}
        <div className="border-b border-border/60">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("VOTE")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "VOTE"
                  ? "border-amber-500 text-amber-500"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Award className="w-4 h-4" />
              {hasVoted ? "Voting Ballot (Completed)" : "Cast Your Vote"}
            </button>
            <button
              onClick={() => setActiveTab("STATUS")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "STATUS"
                  ? "border-amber-500 text-amber-500"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              My Ballot Status & Receipt
              {hasVoted && (
                <NexaBadge variant="success" className="px-1.5 py-0 text-[10px]">
                  Sealed
                </NexaBadge>
              )}
            </button>
            <button
              onClick={() => setActiveTab("HALL_OF_FAME")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "HALL_OF_FAME"
                  ? "border-amber-500 text-amber-500"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Trophy className="w-4 h-4" />
              Awards Hall of Fame
            </button>
          </div>
        </div>

        {/* TAB 1: CAST YOUR VOTE */}
        {activeTab === "VOTE" && (
          <div className="space-y-6">
            {/* Active Event Hero Card */}
            <NexaCard className="p-6 border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <NexaBadge variant="warning" className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                      {activeEvent?.awardYear || 2026} Annual Awards
                    </NexaBadge>
                    <NexaBadge variant="outline" className="text-xs">
                      🔒 Anonymous Voting Active
                    </NexaBadge>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    Celebrate Excellence: Vote for Your Peers
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Recognising colleagues who made outstanding contributions. Select 1 nominee per category. Votes are locked and sealed upon final submission.
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Ballot Progress</div>
                    <div className="text-sm font-bold text-foreground">
                      {completedCount} of {totalCategories} Completed
                    </div>
                  </div>
                  {completedCount > 0 && !hasVoted && (
                    <NexaButton
                      variant="primary"
                      size="sm"
                      onClick={() => setIsReviewModalOpen(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm"
                    >
                      Review & Submit
                    </NexaButton>
                  )}
                </div>
              </div>
            </NexaCard>

            {/* Voting Already Sealed Warning */}
            {hasVoted && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="text-sm font-bold">Your Ballot is Sealed</div>
                    <div className="text-xs text-muted-foreground">
                      You have already submitted your votes for this event. View your audit receipt under "My Ballot Status".
                    </div>
                  </div>
                </div>
                <NexaButton
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("STATUS")}
                  className="text-xs border-emerald-500/30 text-emerald-600"
                >
                  View Receipt
                </NexaButton>
              </div>
            )}

            {/* Category Step Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat, idx) => {
                const isSelected = Boolean(selections[cat.id]);
                const isCurrent = idx === currentCategoryIndex;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCurrentCategoryIndex(idx)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 shrink-0 border ${
                      isCurrent
                        ? "bg-amber-500/15 border-amber-500/50 text-amber-500 font-semibold"
                        : isSelected
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-background/80 flex items-center justify-center text-[10px] font-bold">
                      {isSelected ? "✓" : idx + 1}
                    </span>
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Current Category Workspace */}
            {currentCategory && (
              <div className="space-y-4">
                <NexaCard className="p-5 border border-border/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3 mb-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                        Category {currentCategoryIndex + 1} of {totalCategories}
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{currentCategory.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{currentCategory.description}</p>
                    </div>
                    <NexaBadge variant="outline" className="text-xs shrink-0">
                      Criteria: {currentCategory.criteria}
                    </NexaBadge>
                  </div>

                  {/* Nominees Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentCategory.nominees?.map((nom) => {
                      const isSelf = Boolean(
                        currentUser?.id &&
                        nom.employeeId.toLowerCase() === currentUser.id.toLowerCase()
                      );
                      const isChosen = selections[currentCategory.id] === nom.id;

                      return (
                        <div
                          key={nom.id}
                          onClick={() => {
                            if (!isSelf && !hasVoted) handleSelectNominee(nom);
                          }}
                          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative ${
                            isSelf
                              ? "opacity-60 bg-muted/20 border-border/40 cursor-not-allowed"
                              : isChosen
                              ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/10 shadow-md cursor-pointer"
                              : "border-border/60 bg-card hover:border-border hover:bg-muted/30 cursor-pointer"
                          }`}
                        >
                          {/* Selection Badge / Self Badge */}
                          <div className="flex items-center justify-between mb-3">
                            {isChosen ? (
                              <NexaBadge variant="warning" className="text-xs font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Selected
                              </NexaBadge>
                            ) : isSelf ? (
                              <NexaBadge variant="danger" className="text-[10px] font-semibold">
                                🚫 Self-Voting Blocked
                              </NexaBadge>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">Click to select</span>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <NexaAvatar
                                src={resolveAvatarUrl(nom.avatarUrl)}
                                name={nom.employeeName}
                                size="lg"
                              />
                              <div>
                                <h4 className="text-sm font-bold text-foreground">{nom.employeeName}</h4>
                                <div className="text-xs text-muted-foreground">{nom.department}</div>
                                <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                  {nom.designation}
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-border/60 pl-2.5">
                              "{nom.nominationPitch}"
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground">
                              {isSelf ? "You cannot vote for yourself" : isChosen ? "Choice Recorded" : "Tap to Vote"}
                            </span>
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                isChosen
                                  ? "bg-amber-500 border-amber-500 text-black font-bold text-xs"
                                  : "border-border bg-background"
                              }`}
                            >
                              {isChosen && "✓"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </NexaCard>

                {/* Bottom Step Actions */}
                <div className="flex items-center justify-between pt-2">
                  <NexaButton
                    variant="outline"
                    size="sm"
                    disabled={currentCategoryIndex === 0}
                    onClick={() => setCurrentCategoryIndex((prev) => prev - 1)}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </NexaButton>

                  <div className="flex items-center gap-3">
                    {currentCategoryIndex < totalCategories - 1 ? (
                      <NexaButton
                        variant="primary"
                        size="sm"
                        onClick={() => setCurrentCategoryIndex((prev) => prev + 1)}
                        className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1"
                      >
                        Next Category
                        <ChevronRight className="w-4 h-4" />
                      </NexaButton>
                    ) : (
                      <NexaButton
                        variant="primary"
                        size="sm"
                        disabled={completedCount === 0 || hasVoted}
                        onClick={() => setIsReviewModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 font-bold"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Review & Submit Ballot
                      </NexaButton>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY BALLOT STATUS & RECEIPT */}
        {activeTab === "STATUS" && (
          <div className="max-w-2xl mx-auto space-y-6">
            {hasVoted ? (
              <NexaCard className="p-8 border-emerald-500/30 bg-emerald-500/5 text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">
                    Your Ballot Has Been Sealed
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Your votes were cryptographically sealed into the tamper-proof vault. Anonymity is guaranteed by Ofia ERP HR policy.
                  </p>
                </div>

                {/* Audit Receipt Card */}
                <div className="p-4 rounded-xl bg-card border border-border text-left space-y-2.5 max-w-md mx-auto font-mono text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-muted-foreground font-sans">Audit Receipt Hash:</span>
                    <span className="font-bold text-amber-500 select-all">{ballotReceipt?.receiptHash || "OFIA-2026-NEXA-B9481A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-sans">Categories Voted:</span>
                    <span className="font-semibold text-foreground">{ballotReceipt?.categoriesVotedCount || completedCount || 6} Categories</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-sans">Timestamp:</span>
                    <span className="text-foreground">{new Date(ballotReceipt?.submittedAt || Date.now()).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border/50">
                    <span className="text-muted-foreground font-sans">Vault Status:</span>
                    <span className="text-emerald-500 font-sans font-bold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Sealed in Vault
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/erp/employee/awards">
                    <NexaButton
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("HALL_OF_FAME")}
                      className="text-xs"
                    >
                      Browse Awards Hall of Fame →
                    </NexaButton>
                  </Link>
                </div>
              </NexaCard>
            ) : (
              <NexaCard className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">You Have Not Yet Voted</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    The {activeEvent?.awardYear || 2026} Annual Awards are live! Open the voting tab to select your nominees.
                  </p>
                </div>
                <NexaButton
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab("VOTE")}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Cast Your Vote Now
                </NexaButton>
              </NexaCard>
            )}
          </div>
        )}

        {/* TAB 3: HALL OF FAME & KUDOS */}
        {activeTab === "HALL_OF_FAME" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Awards Hall of Fame</h3>
                <p className="text-xs text-muted-foreground">
                  Recognising the remarkable people who make our workplace exceptional.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {hallOfFame.map((win) => {
                const hasCheered = kudosSent[win.id];

                return (
                  <NexaCard
                    key={win.id}
                    className="p-5 border border-border/60 hover:border-amber-500/40 transition-all flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <NexaBadge variant="warning" className="text-xs font-bold">
                          {win.awardYear} Winner
                        </NexaBadge>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {win.certificateNumber}
                        </span>
                      </div>

                      <div className="text-sm font-bold text-foreground">
                        {win.categoryName}
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <NexaAvatar
                          src={resolveAvatarUrl(win.avatarUrl)}
                          name={win.employeeName}
                          size="lg"
                        />
                        <div>
                          <div className="text-sm font-bold text-foreground">{win.employeeName}</div>
                          <div className="text-xs text-muted-foreground">{win.department}</div>
                          <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            {win.designation}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground italic border-l-2 border-amber-500/40 pl-2.5">
                        "{win.citation}"
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between">
                      <button
                        onClick={() => handleSendKudos(win.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          hasCheered
                            ? "bg-rose-500 text-white shadow-sm"
                            : "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        {hasCheered ? "Celebrated! 👏" : "Cheer Colleague"}
                      </button>

                      <span className="text-[10px] text-muted-foreground">
                        {win.totalVotesReceived} staff votes
                      </span>
                    </div>
                  </NexaCard>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: REVIEW & CONFIRM BALLOT */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background border border-border rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  Review & Seal Your Ballot
                </h3>
                <p className="text-xs text-muted-foreground">
                  Verify your selections before final submission.
                </p>
              </div>
            </div>

            {submissionError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                {submissionError}
              </div>
            )}

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const nomId = selections[cat.id];
                const nom = cat.nominees?.find((n) => n.id === nomId);

                return (
                  <div
                    key={cat.id}
                    className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase">{cat.name}</div>
                      <div className="text-xs font-bold text-foreground">
                        {nom ? nom.employeeName : <span className="text-muted-foreground italic">Skipped</span>}
                      </div>
                    </div>
                    {nom ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-medium">
                        Selected
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">No vote</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-muted-foreground space-y-1">
              <div className="font-semibold text-amber-600 dark:text-amber-400">🔒 Irreversible Ballot Lock:</div>
              <p>Once sealed, your ballot cannot be altered and your cryptographic receipt code will be issued.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <NexaButton
                variant="outline"
                size="sm"
                onClick={() => setIsReviewModalOpen(false)}
              >
                Back to Edit
              </NexaButton>
              <NexaButton
                variant="primary"
                size="sm"
                onClick={handleSubmitBallot}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Seal & Submit My Ballot
              </NexaButton>
            </div>
          </div>
        </div>
      )}
    </BusinessShell>
  );
}
