"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useERPStore, PerformanceReview, User, Objective } from "@/lib/erp-store";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { ArrowLeft, CheckCircle2, XCircle, Star, UserCheck, AlertCircle } from "lucide-react";

export default function HRReviewClient() {
  const router = useRouter();
  const { reviews, users, cycles, updateReview } = useERPStore();

  const [reviewId, setReviewId] = useState<string>("");
  const [cycleId, setCycleId] = useState<string>("");
  const [employeeId, setEmployeeId] = useState<string>("");
  const [review, setReview] = useState<PerformanceReview | null>(null);
  const [employee, setEmployee] = useState<User | null>(null);
  const [hrComments, setHrComments] = useState("");
  const [improvementPlan, setImprovementPlan] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setReviewId(searchParams.get("id") || "");
      setCycleId(searchParams.get("cycleId") || "");
      setEmployeeId(searchParams.get("employeeId") || "");
    }
  }, []);

  useEffect(() => {
    if (reviews.length > 0) {
      let foundReview: PerformanceReview | undefined;
      if (reviewId) {
        foundReview = reviews.find(r => r.id === reviewId);
      }
      if (!foundReview && employeeId && cycleId) {
        foundReview = reviews.find(r => r.employeeId === employeeId && r.cycleId === cycleId);
      }
      if (!foundReview && employeeId) {
        const activeCycle = cycles.find(c => c.status === "Active");
        if (activeCycle) {
          foundReview = reviews.find(r => r.employeeId === employeeId && r.cycleId === activeCycle.id);
        }
        if (!foundReview) {
          foundReview = reviews.find(r => r.employeeId === employeeId);
        }
      }

      if (foundReview) {
        setReview(foundReview);
        setHrComments(foundReview.hrComments || "");
        setImprovementPlan(foundReview.improvementPlan || "");
      }
    }

    if (users.length > 0) {
      const targetEmpId = employeeId || review?.employeeId;
      if (targetEmpId) {
        const foundEmp = users.find(u => u.id === targetEmpId);
        if (foundEmp) {
          setEmployee(foundEmp);
        }
      }
    }
  }, [reviews, users, cycles, reviewId, cycleId, employeeId, review?.employeeId]);

  const activeEmployee = employee || users.find(u => u.id === (employeeId || "EMP001")) || {
    id: employeeId || "EMP001",
    name: "Jane Doe",
    department: "Marketing",
    role: "employee" as const,
  };

  const activeReview = review || reviews[0] || {
    id: "REV001",
    employeeId: employeeId || "EMP001",
    employeeName: "Jane Doe",
    department: "Marketing",
    cycleId: "CYC001",
    status: "Manager Reviewed",
    finalScore: 8.5,
    objectives: [],
    employeeComments: "Delivered Q3 campaign with 120% target achievement.",
    managerComments: "Outstanding initiative and teamwork throughout the cycle.",
  };

  const reviewCycle = cycles.find(c => c.id === activeReview.cycleId);
  const isClosed = activeReview.status === "Closed" || (reviewCycle && reviewCycle.status === "Completed" && activeReview.status !== "HR Approved");

  const handleApprove = () => {
    if (isClosed) return;
    const updatedReview: PerformanceReview = {
      ...activeReview,
      status: "HR Approved",
      hrComments,
      improvementPlan,
      updatedAt: new Date().toISOString(),
    };
    updateReview(updatedReview);
    alert("Evaluation verified and officially approved!");
    router.push("/erp/hr");
  };

  const handleReject = () => {
    if (isClosed) return;
    if (!hrComments.trim()) {
      alert("Please provide audit remarks/reasons in the HR comments section before returning.");
      return;
    }

    const updatedReview: PerformanceReview = {
      ...activeReview,
      status: "Returned",
      hrComments,
      improvementPlan,
      updatedAt: new Date().toISOString(),
    };
    updateReview(updatedReview);
    alert("Evaluation returned to line manager for correction.");
    router.push("/erp/hr");
  };

  const workObjectives = (activeReview.objectives || []).filter(o => o.type !== "competency");
  const competencyObjectives = (activeReview.objectives || []).filter(o => o.type === "competency");

  return (
    <BusinessShell
      title={`Audit Dossier — ${activeEmployee.name}`}
      subtitle={`${activeEmployee.id} • ${activeEmployee.department} • Cycle: ${reviewCycle?.name || activeReview.cycleId} • Normalized Score: ${activeReview.finalScore?.toFixed(1) || "8.5"} / 10`}
      action={
        <Link href="/erp/hr">
          <NexaButton size="sm" variant="outline" className="rounded-full" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to HR Queue
          </NexaButton>
        </Link>
      }
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* TOP SUMMARY CARD */}
        <NexaCard variant="glass" padding="lg" className="rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center font-mono font-black text-xl">
              {activeEmployee.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-black text-[var(--nexa-text-primary)]">{activeEmployee.name}</h2>
              <p className="text-xs text-[var(--nexa-text-muted)] font-medium">
                {activeEmployee.id} • {activeEmployee.department} • Line Manager Evaluated
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider block">
              Calibrated Final Rating
            </span>
            <div className="text-2xl font-black text-emerald-500 font-mono">
              {activeReview.finalScore ? `${activeReview.finalScore.toFixed(1)} / 10` : "8.5 / 10"}
            </div>
          </div>
        </NexaCard>

        {/* COMMENTS AND REFLECTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NexaCard variant="glass" padding="lg" className="space-y-2 rounded-3xl">
            <span className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider block">
              Employee Self-Reflection
            </span>
            <p className="text-xs text-[var(--nexa-text-secondary)] italic leading-relaxed bg-[var(--nexa-bg-base)] p-4 rounded-2xl border border-[var(--nexa-border)] min-h-[90px]">
              &ldquo;{activeReview.employeeComments || "Delivered all assigned milestones on schedule with positive stakeholder feedback."}&rdquo;
            </p>
          </NexaCard>

          <NexaCard variant="glass" padding="lg" className="space-y-2 rounded-3xl">
            <span className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider block">
              Line Manager Appraisal
            </span>
            <p className="text-xs text-[var(--nexa-text-secondary)] italic leading-relaxed bg-[var(--nexa-bg-base)] p-4 rounded-2xl border border-[var(--nexa-border)] min-h-[90px]">
              &ldquo;{activeReview.managerComments || "Consistently met KPI criteria and collaborated effectively across departments."}&rdquo;
            </p>
          </NexaCard>
        </div>

        {isClosed && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-900">Review Cycle Closed</p>
              <p className="text-amber-700 text-[11px]">This appraisal belongs to a completed cycle ({reviewCycle?.name || activeReview.cycleId}) or has been closed. Verifications are locked in read-only mode.</p>
            </div>
          </div>
        )}

        {/* HR REMARKS & ACTIONS */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 rounded-3xl">
          <h3 className="text-xs font-bold text-[var(--nexa-text-primary)] uppercase tracking-wider">
            HR Audit Remarks & Verification Notes
          </h3>
          <textarea
            placeholder="Provide HR calibration comments, corporate compliance flags, or audit notes..."
            value={hrComments}
            onChange={(e) => setHrComments(e.target.value)}
            disabled={isClosed}
            rows={4}
            className={`w-full p-3.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-2xl text-xs text-[var(--nexa-text-primary)] outline-none ${isClosed ? "opacity-60 cursor-not-allowed" : ""}`}
          />

          <div className="flex gap-3 justify-end pt-2 border-t border-[var(--nexa-border)]">
            {isClosed ? (
              <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-full font-bold text-xs">
                Appraisal Closed — Read Only
              </span>
            ) : (
              <>
                <NexaButton
                  size="md"
                  variant="outline"
                  onClick={handleReject}
                  className="rounded-full text-red-500 border-red-500/20 hover:bg-red-500/10"
                >
                  Return for Correction
                </NexaButton>
                <NexaButton
                  size="md"
                  variant="primary"
                  onClick={handleApprove}
                  className="rounded-full bg-[#1A56DB] text-white"
                >
                  Approve & Sign-Off Appraisal
                </NexaButton>
              </>
            )}
          </div>
        </NexaCard>
      </div>
    </BusinessShell>
  );
}
