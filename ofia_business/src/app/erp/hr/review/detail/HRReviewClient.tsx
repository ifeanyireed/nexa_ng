"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useERPStore, PerformanceReview, User, Objective } from "@/lib/erp-store";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { ArrowLeft, CheckCircle2, XCircle, Star, UserCheck } from "lucide-react";

export default function HRReviewClient() {
  const router = useRouter();
  const { reviews, users, updateReview } = useERPStore();

  const [employeeId, setEmployeeId] = useState<string>("");
  const [review, setReview] = useState<PerformanceReview | null>(null);
  const [employee, setEmployee] = useState<User | null>(null);
  const [hrComments, setHrComments] = useState("");
  const [improvementPlan, setImprovementPlan] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const id = searchParams.get("employeeId") || "EMP001";
      setEmployeeId(id);
    }
  }, []);

  useEffect(() => {
    if (employeeId) {
      if (reviews.length > 0) {
        const foundReview = reviews.find(r => r.employeeId === employeeId);
        if (foundReview) {
          setReview(foundReview);
          setHrComments(foundReview.hrComments || "");
          setImprovementPlan(foundReview.improvementPlan || "");
        }
      }
      if (users.length > 0) {
        const foundEmp = users.find(u => u.id === employeeId);
        if (foundEmp) {
          setEmployee(foundEmp);
        }
      }
    }
  }, [reviews, users, employeeId]);

  const activeEmployee = employee || users.find(u => u.id === "EMP001") || {
    id: "EMP001",
    name: "Jane Doe",
    department: "Marketing",
    role: "employee" as const,
  };

  const activeReview = review || reviews[0] || {
    id: "REV001",
    employeeId: "EMP001",
    employeeName: "Jane Doe",
    department: "Marketing",
    status: "Manager Reviewed",
    finalScore: 8.5,
    objectives: [],
    employeeComments: "Delivered Q3 campaign with 120% target achievement.",
    managerComments: "Outstanding initiative and teamwork throughout the cycle.",
  };

  const handleApprove = () => {
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
      subtitle={`${activeEmployee.id} • ${activeEmployee.department} • Normalized Score: ${activeReview.finalScore?.toFixed(1) || "8.5"} / 10`}
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

        {/* HR REMARKS & ACTIONS */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 rounded-3xl">
          <h3 className="text-xs font-bold text-[var(--nexa-text-primary)] uppercase tracking-wider">
            HR Audit Remarks & Verification Notes
          </h3>
          <textarea
            placeholder="Provide HR calibration comments, corporate compliance flags, or audit notes..."
            value={hrComments}
            onChange={(e) => setHrComments(e.target.value)}
            rows={4}
            className="w-full p-3.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-2xl text-xs text-[var(--nexa-text-primary)] outline-none"
          />

          <div className="flex gap-3 justify-end pt-2 border-t border-[var(--nexa-border)]">
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
          </div>
        </NexaCard>
      </div>
    </BusinessShell>
  );
}
