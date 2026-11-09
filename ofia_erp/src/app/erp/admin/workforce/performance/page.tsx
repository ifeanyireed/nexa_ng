"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Star,
  TrendingUp,
  Target,
  CheckCircle2,
  Users,
  ShieldCheck,
  Plus,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Check,
  X,
  FileCheck2,
  Clock,
  Sliders,
  Calendar,
  ListTodo,
  CheckSquare,
  Square,
  MessageSquare,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";
import {
  PromotionNomination,
  CompetencyMatrixItem,
  EvaluationCycle,
  PerformanceScorecard,
  PerformanceImprovementPlan,
  WorkforceRoleCategory,
} from "@/lib/workforce-types";

export default function PerformanceCareerManagementPage() {
  const {
    competencies,
    promotions,
    people,
    evaluationCycles,
    scorecards,
    pips,
    nominatePromotion,
    approvePromotion,
    createEvaluationCycle,
    updateEvaluationCycleStatus,
    submitScorecard,
    createPip,
    updatePip,
  } = useWorkforceManager();

  const [activeTab, setActiveTab] = useState<"cycles" | "competencies" | "promotions" | "pips">("cycles");

  // Modals state
  const [isNominateModalOpen, setIsNominateModalOpen] = useState(false);
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [isScorecardModalOpen, setIsScorecardModalOpen] = useState(false);
  const [isPipModalOpen, setIsPipModalOpen] = useState(false);
  const [selectedScorecard, setSelectedScorecard] = useState<PerformanceScorecard | null>(null);

  // Filter state
  const [reviewerTypeFilter, setReviewerTypeFilter] = useState<string>("all");
  const [cycleFilter, setCycleFilter] = useState<string>("all");

  // Nominate Form state
  const [nomineeId, setNomineeId] = useState("");
  const [proposedRoleTitle, setProposedRoleTitle] = useState("");
  const [proposedCategory, setProposedCategory] = useState<WorkforceRoleCategory>("employee");
  const [nomineeDept, setNomineeDept] = useState("Technology");
  const [nomineeRating, setNomineeRating] = useState(90);
  const [nomineeJustification, setNomineeJustification] = useState("");
  const [proposedSalary, setProposedSalary] = useState(250000);

  // Cycle Form state
  const [cycleName, setCycleName] = useState("");
  const [cycleQuarter, setCycleQuarter] = useState<"Q1" | "Q2" | "Q3" | "Q4">("Q2");
  const [cycleYear, setCycleYear] = useState(2027);
  const [cycleStart, setCycleStart] = useState("2027-04-01");
  const [cycleEnd, setCycleEnd] = useState("2027-06-30");
  const [cycleDesc, setCycleDesc] = useState("");

  // Scorecard Form state
  const [scPersonId, setScPersonId] = useState("");
  const [scCycleId, setScCycleId] = useState("");
  const [scReviewerType, setScReviewerType] = useState<"self" | "supervisor" | "peer" | "client">("supervisor");
  const [scReviewerName, setScReviewerName] = useState("");
  const [scTechnical, setScTechnical] = useState(90);
  const [scDelivery, setScDelivery] = useState(88);
  const [scCulture, setScCulture] = useState(92);
  const [scStrengths, setScStrengths] = useState("");
  const [scImprovements, setScImprovements] = useState("");

  // PIP Form state
  const [pipPersonId, setPipPersonId] = useState("");
  const [pipSupervisorName, setPipSupervisorName] = useState("");
  const [pipReason, setPipReason] = useState("");
  const [pipFrequency, setPipFrequency] = useState<"weekly" | "bi-weekly" | "monthly">("weekly");
  const [pipStartDate, setPipStartDate] = useState("2027-05-01");
  const [pipEndDate, setPipEndDate] = useState("2027-06-30");
  const [pipItem1, setPipItem1] = useState("");
  const [pipItem2, setPipItem2] = useState("");
  const [pipItem3, setPipItem3] = useState("");

  // Ratify promotion state
  const [ratifyingId, setRatifyingId] = useState<string | null>(null);

  // Compute metrics
  const avgOverallRating = scorecards.length > 0
    ? (scorecards.reduce((sum, s) => sum + s.overallRating, 0) / scorecards.length).toFixed(1)
    : "88.5";

  const activeCyclesCount = evaluationCycles.filter((c) => c.status === "active").length;
  const pendingPromotionsCount = promotions.filter((p) => p.status === "under_review").length;
  const activePipsCount = pips.filter((p) => p.status === "active").length;

  const handleCreateNomination = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPerson = people.find((p) => p.id === nomineeId);
    const nomination: PromotionNomination = {
      id: `promo-${Date.now()}`,
      personId: targetPerson?.id || `person-${Date.now()}`,
      personName: targetPerson?.name || "Candidate",
      currentDesignation: targetPerson?.designation || "Intern",
      proposedDesignation: proposedRoleTitle,
      currentRole: targetPerson?.role || "intern",
      proposedRole: proposedCategory,
      department: nomineeDept,
      nominatedBy: "HR Talent Committee",
      tenureMonths: 6,
      competencyRating: nomineeRating,
      status: "under_review",
      justification: nomineeJustification,
      newSalaryMonthly: proposedSalary,
    };
    nominatePromotion(nomination);
    setIsNominateModalOpen(false);
  };

  const handleExecutePromotion = async (promotionId: string) => {
    setRatifyingId(promotionId);
    try {
      await approvePromotion(promotionId, "Executive Talent Directorate");
    } finally {
      setRatifyingId(null);
    }
  };

  const handleCreateCycle = (e: React.FormEvent) => {
    e.preventDefault();
    createEvaluationCycle({
      name: cycleName,
      quarter: cycleQuarter,
      year: Number(cycleYear),
      startDate: cycleStart,
      endDate: cycleEnd,
      status: "active",
      description: cycleDesc,
    });
    setIsCycleModalOpen(false);
  };

  const handleSubmitScorecard = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPerson = people.find((p) => p.id === scPersonId);
    const targetCycle = evaluationCycles.find((c) => c.id === scCycleId);
    const overall = Math.round((scTechnical * 0.4) + (scDelivery * 0.35) + (scCulture * 0.25));

    submitScorecard({
      cycleId: scCycleId || (evaluationCycles[0]?.id ?? "cycle-01"),
      cycleName: targetCycle?.name || "Mid-Year Appraisal",
      personId: scPersonId,
      personName: targetPerson?.name || "Staff Member",
      reviewerId: "rev-lead",
      reviewerName: scReviewerName || "Supervisor",
      reviewerType: scReviewerType,
      kpiScores: [
        { kpi: "Technical Competence & Execution", weight: 40, score: Math.round(scTechnical * 0.4), maxScore: 40, comments: "Evaluated during sprint delivery" },
        { kpi: "Delivery Velocity & Quality SLA", weight: 35, score: Math.round(scDelivery * 0.35), maxScore: 35, comments: "Evaluated on committed deliverables" },
        { kpi: "Culture, Collaboration & Punctuality", weight: 25, score: Math.round(scCulture * 0.25), maxScore: 25, comments: "Evaluated on team feedback" },
      ],
      overallRating: overall,
      technicalRating: scTechnical,
      deliveryRating: scDelivery,
      cultureRating: scCulture,
      strengths: scStrengths || "Demonstrates strong work ethic and adherence to enterprise guidelines.",
      areasForImprovement: scImprovements || "Continue expanding automated test coverage and documentation.",
      status: "signed_off",
    });
    setIsScorecardModalOpen(false);
  };

  const handleCreatePip = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPerson = people.find((p) => p.id === pipPersonId);
    const actionItems = [];
    if (pipItem1.trim()) actionItems.push({ id: `act-1`, item: pipItem1, deadline: pipEndDate, status: "pending" as const });
    if (pipItem2.trim()) actionItems.push({ id: `act-2`, item: pipItem2, deadline: pipEndDate, status: "pending" as const });
    if (pipItem3.trim()) actionItems.push({ id: `act-3`, item: pipItem3, deadline: pipEndDate, status: "pending" as const });

    createPip({
      personId: pipPersonId,
      personName: targetPerson?.name || "Staff Member",
      supervisorId: "sup-01",
      supervisorName: pipSupervisorName || "Talent Operations Lead",
      reason: pipReason,
      actionItems,
      startDate: pipStartDate,
      endDate: pipEndDate,
      reviewFrequency: pipFrequency,
      status: "active",
      outcomeNotes: "Improvement plan initiated by People Ops committee.",
    });
    setIsPipModalOpen(false);
  };

  const togglePipAction = (pipId: string, actionId: string) => {
    const targetPip = pips.find((p) => p.id === pipId);
    if (!targetPip) return;

    const updatedActions = targetPip.actionItems.map((act) =>
      act.id === actionId
        ? { ...act, status: act.status === "completed" ? ("pending" as const) : ("completed" as const) }
        : act
    );

    updatePip(pipId, { actionItems: updatedActions });
  };

  const filteredScorecards = scorecards.filter((sc) => {
    const matchesReviewer = reviewerTypeFilter === "all" || sc.reviewerType === reviewerTypeFilter;
    const matchesCycle = cycleFilter === "all" || sc.cycleId === cycleFilter;
    return matchesReviewer && matchesCycle;
  });

  return (
    <ErpAdminShell
      title="Performance & Competencies"
      subtitle="Module 06 · 360° Evaluation Cycles, Competency Radar, Performance Improvement Plans (PIP), and Automated Promotion Ratification."
      activeModule="workforce"
      action={
        <div className="flex items-center gap-2">
          <NexaButton
            size="sm"
            variant="secondary"
            className="gap-2 text-xs"
            onClick={() => setIsScorecardModalOpen(true)}
          >
            <Sliders className="w-4 h-4 text-blue-400" />
            Conduct 360° Appraisal
          </NexaButton>
          <NexaButton
            size="sm"
            variant="primary"
            className="gap-2 text-xs"
            onClick={() => setIsNominateModalOpen(true)}
          >
            <Award className="w-4 h-4" />
            Nominate for Promotion
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-8">
        {/* TOP PERFORMANCE METRICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Average Competency Score</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{avgOverallRating}%</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" /> Across {scorecards.length} multi-rater scorecards
            </p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Evaluation Cycles</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{evaluationCycles.length} Cycles</p>
            <p className="text-xs text-blue-400 mt-1 font-medium">
              {activeCyclesCount} Active Quarterly Appraisals
            </p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Promotion Pipeline</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{promotions.length} Nominations</p>
            <p className="text-xs text-purple-400 mt-1 font-medium">
              {pendingPromotionsCount} Awaiting Directorate Ratification
            </p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Corrective PIP Plans</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{activePipsCount} Active</p>
            <p className="text-xs text-amber-400 mt-1 font-medium">
              {activePipsCount > 0 ? "Under weekly review oversight" : "All staff meeting quality thresholds"}
            </p>
          </div>
        </section>

        {/* TAB CONTROLS */}
        <div className="flex border-b border-nexa-border gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("cycles")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "cycles"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Evaluation Cycles & 360° Scorecards ({scorecards.length})
          </button>
          <button
            onClick={() => setActiveTab("competencies")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "competencies"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <Award className="w-4 h-4" />
            Competency Matrix ({competencies.length})
          </button>
          <button
            onClick={() => setActiveTab("promotions")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "promotions"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Promotion & Career Pathways ({promotions.length})
          </button>
          <button
            onClick={() => setActiveTab("pips")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "pips"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Performance Improvement Plans ({pips.length})
          </button>
        </div>

        {/* TAB 1: EVALUATION CYCLES & 360° SCORECARDS */}
        {activeTab === "cycles" && (
          <div className="space-y-6">
            {/* Cycles Overview Cards */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-nexa-text-primary">Performance Evaluation Cycles</h3>
                <p className="text-xs text-nexa-text-secondary">
                  Structured multi-rater review schedules with completion quotas and department audit trails.
                </p>
              </div>
              <NexaButton
                size="sm"
                variant="secondary"
                className="gap-2 text-xs"
                onClick={() => setIsCycleModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Launch Evaluation Cycle
              </NexaButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluationCycles.map((cycle) => {
                const percentComplete = cycle.totalReviewsCount > 0
                  ? Math.round((cycle.completedReviewsCount / cycle.totalReviewsCount) * 100)
                  : 100;
                return (
                  <div
                    key={cycle.id}
                    className="p-5 bg-nexa-surface border border-nexa-border rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                          {cycle.quarter} {cycle.year}
                        </span>
                        <NexaBadge
                          variant={cycle.status === "active" ? "primary" : cycle.status === "closed" ? "secondary" : "warning"}
                          className="text-[10px] capitalize"
                        >
                          {cycle.status}
                        </NexaBadge>
                      </div>
                      <span className="text-xs text-nexa-text-secondary font-mono">
                        {cycle.startDate} → {cycle.endDate}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-nexa-text-primary">{cycle.name}</h4>
                    {cycle.description && (
                      <p className="text-xs text-nexa-text-secondary line-clamp-2">{cycle.description}</p>
                    )}

                    <div className="space-y-1.5 pt-2 border-t border-nexa-border/60">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-nexa-text-secondary font-medium">Reviews Progress</span>
                        <span className="text-nexa-text-primary font-bold font-mono">
                          {cycle.completedReviewsCount} / {cycle.totalReviewsCount} ({percentComplete}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-nexa-surface/80 overflow-hidden border border-nexa-border/40">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, percentComplete)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scorecards Table */}
            <div className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-nexa-text-primary">360° Multi-Rater Scorecard Registry</h3>
                  <p className="text-xs text-nexa-text-secondary">
                    Granular evaluations collected from Supervisors, Peers, Self-Appraisals, and Client Delivery Leads.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={reviewerTypeFilter}
                    onChange={(e) => setReviewerTypeFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-nexa-surface border border-nexa-border text-xs text-nexa-text-primary focus:outline-none"
                  >
                    <option value="all">All Reviewer Types</option>
                    <option value="supervisor">Supervisor Appraisal</option>
                    <option value="peer">Peer Review</option>
                    <option value="self">Self Evaluation</option>
                    <option value="client">Client Feedback</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-nexa-border/60">
                {filteredScorecards.map((sc) => (
                  <div
                    key={sc.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-nexa-surface/30 px-3 rounded-lg transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-nexa-text-primary">{sc.personName}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 capitalize font-medium">
                          {sc.reviewerType} Appraisal: {sc.reviewerName}
                        </span>
                        <NexaBadge variant="secondary" className="text-[10px]">
                          {sc.cycleName}
                        </NexaBadge>
                      </div>

                      <p className="text-xs text-nexa-text-secondary">
                        <strong className="text-emerald-400 font-medium">Strengths:</strong> {sc.strengths}
                      </p>
                      <p className="text-xs text-nexa-text-secondary">
                        <strong className="text-amber-400 font-medium">Improvement Focus:</strong> {sc.areasForImprovement}
                      </p>

                      <div className="flex items-center gap-4 text-xs pt-1 font-mono">
                        <span className="text-blue-400">Tech: {sc.technicalRating}%</span>
                        <span className="text-emerald-400">Delivery: {sc.deliveryRating}%</span>
                        <span className="text-purple-400">Culture: {sc.cultureRating}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-nexa-text-secondary font-semibold">Overall Rating</span>
                        <p className={`text-xl font-bold font-mono ${sc.overallRating >= 85 ? "text-emerald-400" : sc.overallRating >= 70 ? "text-amber-400" : "text-rose-400"}`}>
                          {sc.overallRating}%
                        </p>
                      </div>
                      <NexaButton
                        size="sm"
                        variant="secondary"
                        className="text-xs"
                        onClick={() => setSelectedScorecard(sc)}
                      >
                        View Breakdown
                      </NexaButton>
                    </div>
                  </div>
                ))}

                {filteredScorecards.length === 0 && (
                  <div className="py-8 text-center text-xs text-nexa-text-secondary">
                    No scorecards found matching the selected filter.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPETENCY MATRIX */}
        {activeTab === "competencies" && (
          <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-nexa-text-primary">Enterprise Competency Radar</h3>
                <p className="text-xs text-nexa-text-secondary">
                  Standards required to qualify staff for specialized roles and revenue client deployments.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competencies.map((comp) => (
                <div
                  key={comp.id}
                  className="p-5 bg-nexa-surface/70 border border-nexa-border rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {comp.category}
                    </span>
                    <NexaBadge variant="secondary" className="text-[10px]">
                      Target: {comp.requiredLevel}
                    </NexaBadge>
                  </div>

                  <h4 className="text-sm font-bold text-nexa-text-primary">{comp.competency}</h4>

                  <div className="pt-2 border-t border-nexa-border/60 flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {comp.totalCertifiedPeople} Certified Personnel
                    </span>
                    <span className="text-nexa-text-secondary font-mono">
                      {comp.inTrainingPeople} in Training
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: PROMOTIONS */}
        {activeTab === "promotions" && (
          <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-nexa-text-primary">Promotion Nominations & Execution Engine</h3>
                <p className="text-xs text-nexa-text-secondary">
                  Direct state machine progression: ratifying a nomination automatically updates the employee&apos;s title, role, and salary scales.
                </p>
              </div>
              <NexaButton
                size="sm"
                variant="primary"
                className="gap-2 text-xs"
                onClick={() => setIsNominateModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Nominate for Promotion
              </NexaButton>
            </div>

            <div className="divide-y divide-nexa-border/60">
              {promotions.map((p) => (
                <div key={p.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-nexa-text-primary">{p.personName}</h4>
                      <NexaBadge variant="secondary" className="text-[10px] py-0">
                        {p.department}
                      </NexaBadge>
                      <NexaBadge
                        variant={p.status === "approved" ? "primary" : "secondary"}
                        className="text-[10px] capitalize"
                      >
                        {p.status.replace(/_/g, " ")}
                      </NexaBadge>
                      {p.proposedRole && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-semibold">
                          Transition: {p.currentRole || "intern"} → {p.proposedRole}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-nexa-text-secondary flex items-center gap-2">
                      <span>{p.currentDesignation}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                      <strong className="text-emerald-400">{p.proposedDesignation}</strong>
                    </p>

                    {p.justification && (
                      <p className="text-xs text-nexa-text-secondary italic">
                        &quot;{p.justification}&quot;
                      </p>
                    )}

                    <div className="text-[11px] text-nexa-text-secondary flex items-center gap-3 pt-1">
                      <span>Nominated by: <strong className="text-nexa-text-primary">{p.nominatedBy}</strong></span>
                      <span>·</span>
                      <span>Tenure: <strong className="text-nexa-text-primary">{p.tenureMonths} Months</strong></span>
                      <span>·</span>
                      <span>Competency Score: <strong className="text-emerald-400">{p.competencyRating}%</strong></span>
                      {p.newSalaryMonthly && (
                        <>
                          <span>·</span>
                          <span>Proposed Salary: <strong className="text-emerald-400">₦{p.newSalaryMonthly.toLocaleString()} / mo</strong></span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {p.status === "approved" ? (
                      <div className="text-right">
                        <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-4 h-4" /> Ratified & Executed
                        </span>
                        {p.approvedBy && (
                          <span className="text-[10px] text-nexa-text-secondary font-mono block">
                            By {p.approvedBy}
                          </span>
                        )}
                      </div>
                    ) : (
                      <NexaButton
                        size="sm"
                        variant="primary"
                        className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                        disabled={ratifyingId === p.id}
                        onClick={() => handleExecutePromotion(p.id)}
                      >
                        <UserCheck className="w-4 h-4" />
                        {ratifyingId === p.id ? "Ratifying..." : "Ratify & Execute"}
                      </NexaButton>
                    )}
                  </div>
                </div>
              ))}

              {promotions.length === 0 && (
                <div className="py-8 text-center text-xs text-nexa-text-secondary">
                  No promotions currently nominated.
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB 4: PIPS */}
        {activeTab === "pips" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-nexa-text-primary">Performance Improvement Plans (PIP)</h3>
                <p className="text-xs text-nexa-text-secondary">
                  Formal oversight track for employees requiring actionable remediation and weekly supervisor check-ins.
                </p>
              </div>
              <NexaButton
                size="sm"
                variant="secondary"
                className="gap-2 text-xs"
                onClick={() => setIsPipModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Initiate Performance Plan
              </NexaButton>
            </div>

            {pips.length === 0 ? (
              <div className="p-8 bg-nexa-surface border border-nexa-border rounded-xl text-center space-y-3">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-nexa-text-primary">Zero Active Corrective Action Plans</h4>
                <p className="text-xs text-nexa-text-secondary max-w-sm mx-auto">
                  All workforce members are currently meeting or exceeding deliverable benchmarks.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pips.map((pip) => {
                  const completedItems = pip.actionItems.filter((i) => i.status === "completed").length;
                  const totalItems = pip.actionItems.length;
                  const isCompleted = totalItems > 0 && completedItems === totalItems;
                  return (
                    <div
                      key={pip.id}
                      className="p-5 bg-nexa-surface border border-nexa-border rounded-xl space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-nexa-text-primary">{pip.personName}</h4>
                          <NexaBadge
                            variant={pip.status === "successful" ? "primary" : pip.status === "active" ? "warning" : "secondary"}
                            className="text-[10px] capitalize"
                          >
                            {pip.status}
                          </NexaBadge>
                        </div>
                        <span className="text-[10px] font-mono text-nexa-text-secondary">
                          {pip.startDate} → {pip.endDate}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] text-nexa-text-secondary uppercase font-semibold">Diagnosis / Reason:</span>
                        <p className="text-xs text-nexa-text-primary">{pip.reason}</p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-nexa-border/60">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-nexa-text-secondary flex items-center gap-1.5">
                            <ListTodo className="w-3.5 h-3.5" /> Action Remediation Items ({completedItems}/{totalItems})
                          </span>
                          <span className="text-emerald-400 font-mono font-bold">
                            Review: {pip.reviewFrequency}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {pip.actionItems.map((act) => (
                            <div
                              key={act.id}
                              onClick={() => togglePipAction(pip.id, act.id)}
                              className="flex items-start gap-2.5 p-2 rounded-lg bg-nexa-surface/70 border border-nexa-border/60 cursor-pointer hover:border-nexa-border transition-colors text-xs"
                            >
                              {act.status === "completed" ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <Square className="w-4 h-4 text-nexa-text-secondary shrink-0 mt-0.5" />
                              )}
                              <span className={`flex-1 ${act.status === "completed" ? "line-through text-nexa-text-secondary" : "text-nexa-text-primary"}`}>
                                {act.item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {pip.outcomeNotes && (
                        <p className="text-[11px] text-nexa-text-secondary italic pt-1 border-t border-nexa-border/40">
                          Notes: {pip.outcomeNotes}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-nexa-text-secondary">
                          Supervisor: <strong>{pip.supervisorName}</strong>
                        </span>
                        {pip.status === "active" && (
                          <NexaButton
                            size="sm"
                            variant="secondary"
                            className="text-xs text-emerald-400 hover:text-emerald-300"
                            onClick={() => updatePip(pip.id, { status: "successful", outcomeNotes: "Plan successfully completed. Benchmarks fulfilled." })}
                          >
                            Mark Successful
                          </NexaButton>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MODAL 1: NOMINATE PROMOTION */}
        {isNominateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Nominate for Promotion</h3>
                <button
                  onClick={() => setIsNominateModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNomination} className="space-y-3 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Team Member</label>
                  <select
                    value={nomineeId}
                    onChange={(e) => {
                      setNomineeId(e.target.value);
                      const person = people.find((p) => p.id === e.target.value);
                      if (person) setNomineeDept(person.department);
                    }}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  >
                    <option value="">Select candidate for promotion...</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {p.designation} ({p.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Proposed New Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Associate Software Engineer (Full-Time)"
                    value={proposedRoleTitle}
                    onChange={(e) => setProposedRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Role Category</label>
                    <select
                      value={proposedCategory}
                      onChange={(e) => setProposedCategory(e.target.value as WorkforceRoleCategory)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      <option value="employee">Full-Time Employee</option>
                      <option value="contractor">Contractor Consultant</option>
                      <option value="intern">Intern</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">New Salary (₦/Month)</label>
                    <input
                      type="number"
                      value={proposedSalary}
                      onChange={(e) => setProposedSalary(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Competency Score Rating (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={nomineeRating}
                    onChange={(e) => setNomineeRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Executive Justification</label>
                  <textarea
                    rows={3}
                    placeholder="Provide evidence of sprint velocity, architectural mastery, and leadership..."
                    value={nomineeJustification}
                    onChange={(e) => setNomineeJustification(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsNominateModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Submit Nomination
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: LAUNCH EVALUATION CYCLE */}
        {isCycleModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Launch Evaluation Cycle</h3>
                <button
                  onClick={() => setIsCycleModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCycle} className="space-y-3 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Cycle Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q3 2027 Mid-Year 360° Appraisal"
                    value={cycleName}
                    onChange={(e) => setCycleName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Quarter</label>
                    <select
                      value={cycleQuarter}
                      onChange={(e) => setCycleQuarter(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      <option value="Q1">Q1</option>
                      <option value="Q2">Q2</option>
                      <option value="Q3">Q3</option>
                      <option value="Q4">Q4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Year</label>
                    <input
                      type="number"
                      value={cycleYear}
                      onChange={(e) => setCycleYear(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={cycleStart}
                      onChange={(e) => setCycleStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={cycleEnd}
                      onChange={(e) => setCycleEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Description & Strategic Objectives</label>
                  <textarea
                    rows={2}
                    placeholder="Focus on customer success delivery, SLA adherence, and code quality..."
                    value={cycleDesc}
                    onChange={(e) => setCycleDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsCycleModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Initiate Cycle
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: CONDUCT 360° APPRAISAL */}
        {isScorecardModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Record 360° Performance Appraisal</h3>
                <button
                  onClick={() => setIsScorecardModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitScorecard} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Evaluatee (Personnel)</label>
                    <select
                      value={scPersonId}
                      onChange={(e) => setScPersonId(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      <option value="">Select team member...</option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.designation})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Evaluation Cycle</label>
                    <select
                      value={scCycleId}
                      onChange={(e) => setScCycleId(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      <option value="">Select active cycle...</option>
                      {evaluationCycles.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Rater Perspective</label>
                    <select
                      value={scReviewerType}
                      onChange={(e) => setScReviewerType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      <option value="supervisor">Supervisor Appraisal</option>
                      <option value="peer">Peer Colleague</option>
                      <option value="self">Self Evaluation</option>
                      <option value="client">Client Lead</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Reviewer Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tunde Bakare"
                      value={scReviewerName}
                      onChange={(e) => setScReviewerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-nexa-surface/70 border border-nexa-border rounded-xl space-y-3">
                  <span className="font-semibold text-nexa-text-primary block">KPI Competency Sliders</span>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-nexa-text-secondary">Technical Architecture & Execution</span>
                      <span className="text-emerald-400 font-bold font-mono">{scTechnical}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={scTechnical}
                      onChange={(e) => setScTechnical(Number(e.target.value))}
                      className="w-full accent-rose-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-nexa-text-secondary">Delivery Velocity & Quality SLA</span>
                      <span className="text-blue-400 font-bold font-mono">{scDelivery}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={scDelivery}
                      onChange={(e) => setScDelivery(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-nexa-text-secondary">Culture, Mentorship & Collaboration</span>
                      <span className="text-purple-400 font-bold font-mono">{scCulture}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={scCulture}
                      onChange={(e) => setScCulture(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Observed Strengths</label>
                  <textarea
                    rows={2}
                    placeholder="Specific achievements, problem-solving skills, and initiative..."
                    value={scStrengths}
                    onChange={(e) => setScStrengths(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Areas for Development</label>
                  <textarea
                    rows={2}
                    placeholder="Suggested skill training, time-management practices..."
                    value={scImprovements}
                    onChange={(e) => setScImprovements(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsScorecardModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Submit Appraisal
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: INITIATE PIP */}
        {isPipModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Initiate Performance Improvement Plan</h3>
                <button
                  onClick={() => setIsPipModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePip} className="space-y-3 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Personnel Under Remediation</label>
                  <select
                    value={pipPersonId}
                    onChange={(e) => setPipPersonId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  >
                    <option value="">Select team member...</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Assigned Supervisor</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tunde Bakare"
                      value={pipSupervisorName}
                      onChange={(e) => setPipSupervisorName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Review Cadence</label>
                    <select
                      value={pipFrequency}
                      onChange={(e) => setPipFrequency(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      <option value="weekly">Weekly Check-in</option>
                      <option value="bi-weekly">Bi-Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Performance Shortfall Reason</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Specify delayed tasks, missed client SLAs, or lack of progress in LMS..."
                    value={pipReason}
                    onChange={(e) => setPipReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-nexa-text-secondary">Action Remediation Deliverables</label>
                  <input
                    type="text"
                    required
                    placeholder="Action Item 1: e.g. Pass LMS Academy Course 02"
                    value={pipItem1}
                    onChange={(e) => setPipItem1(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Action Item 2: e.g. Submit all daily work logs on time"
                    value={pipItem2}
                    onChange={(e) => setPipItem2(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Action Item 3: e.g. Shadow Senior Specialist on client calls"
                    value={pipItem3}
                    onChange={(e) => setPipItem3(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={pipStartDate}
                      onChange={(e) => setPipStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Target End Date</label>
                    <input
                      type="date"
                      required
                      value={pipEndDate}
                      onChange={(e) => setPipEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsPipModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Initiate Plan
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 5: SCORECARD BREAKDOWN DETAIL */}
        {selectedScorecard && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <div>
                  <h3 className="text-base font-bold text-nexa-text-primary">{selectedScorecard.personName}</h3>
                  <span className="text-xs text-nexa-text-secondary font-mono capitalize">
                    {selectedScorecard.reviewerType} Appraisal by {selectedScorecard.reviewerName}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedScorecard(null)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-nexa-surface/80 border border-nexa-border rounded-xl flex items-center justify-between">
                  <span className="font-semibold text-nexa-text-secondary uppercase">Overall Appraisal Score</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    {selectedScorecard.overallRating}%
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-nexa-text-primary block">KPI Metrics Breakdown</span>
                  {selectedScorecard.kpiScores.map((kpi, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-nexa-surface/60 border border-nexa-border/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-nexa-text-primary">{kpi.kpi}</span>
                        <span className="font-mono text-emerald-400 font-bold">{kpi.score} / {kpi.maxScore}</span>
                      </div>
                      {kpi.comments && (
                        <p className="text-[11px] text-nexa-text-secondary">{kpi.comments}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2 border-t border-nexa-border/60">
                  <div>
                    <span className="text-emerald-400 font-semibold block">Key Strengths</span>
                    <p className="text-nexa-text-secondary mt-0.5">{selectedScorecard.strengths}</p>
                  </div>
                  <div>
                    <span className="text-amber-400 font-semibold block">Development Areas</span>
                    <p className="text-nexa-text-secondary mt-0.5">{selectedScorecard.areasForImprovement}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-nexa-border flex justify-end">
                <NexaButton
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedScorecard(null)}
                >
                  Close
                </NexaButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErpAdminShell>
  );
}
