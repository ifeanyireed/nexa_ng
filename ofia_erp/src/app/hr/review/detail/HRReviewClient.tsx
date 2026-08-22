"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useERPStore, PerformanceReview, User, Objective } from "@/lib/erp-store";
import ERPLayout from "@/components/nets_erp/Layout";

const getCategoryBadgeStyle = (cat?: string) => {
  switch (cat?.toLowerCase()) {
    case "behavioural":
      return "bg-indigo-50 border-indigo-100 text-indigo-700";
    case "leadership":
      return "bg-purple-50 border-purple-100 text-purple-700";
    case "technical":
      return "bg-cyan-50 border-cyan-100 text-cyan-700";
    case "culture":
      return "bg-pink-50 border-pink-100 text-pink-700";
    case "role specific":
      return "bg-amber-50 border-amber-100 text-amber-700";
    case "self-development":
      return "bg-teal-50 border-teal-100 text-teal-700";
    default:
      return "bg-slate-50 border-slate-100 text-slate-700";
  }
};

export default function HRReviewClient() {
  const router = useRouter();
  const { reviews, users, updateReview } = useERPStore();

  const [employeeId, setEmployeeId] = useState<string>("");
  const [review, setReview] = useState<PerformanceReview | null>(null);
  const [employee, setEmployee] = useState<User | null>(null);
  const [hrComments, setHrComments] = useState("");
  const [improvementPlan, setImprovementPlan] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("employeeId") || "";
    setEmployeeId(id);
  }, []);

  useEffect(() => {
    if (employeeId) {
      if (reviews.length > 0) {
        const activeCycleId = "CYC001"; // current active cycle
        const foundReview = reviews.find(r => r.employeeId === employeeId && r.cycleId === activeCycleId);
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

  if (!review || !employee) {
    return (
      <ERPLayout>
        <div className="py-8 text-center text-slate-450 font-bold">Loading review details...</div>
      </ERPLayout>
    );
  }

  const handleApprove = () => {
    const updatedReview: PerformanceReview = {
      ...review,
      status: "HR Approved",
      hrComments,
      improvementPlan,
      updatedAt: new Date().toISOString(),
    };
    updateReview(updatedReview);
    alert("Evaluation verified and officially approved!");
    router.push("/hr");
  };

  const handleReject = () => {
    if (!hrComments.trim()) {
      alert("Please provide audit remarks/reasons in the HR comments section before returning.");
      return;
    }

    const updatedReview: PerformanceReview = {
      ...review,
      status: "Draft",
      hrComments,
      improvementPlan,
      updatedAt: new Date().toISOString(),
    };
    updateReview(updatedReview);
    alert("Review returned to employee and manager for corrections.");
    router.push("/hr");
  };

  const workObjectives = review.objectives.filter(o => o.type === "objective");
  const competencyObjectives = review.objectives.filter(o => o.type === "competency");

  const getSubAverage = (list: Objective[], field: "selfScore" | "managerScore") => {
    const scores = list.map(o => o[field]).filter((s): s is number => s !== undefined);
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  const renderAuditCard = (obj: Objective, index: number) => {
    const isWorkObj = obj.type === "objective";
    
    return (
      <div key={obj.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-150/40">
        <div>
          <div className="flex gap-2.5 items-center">
            <span className="text-[9px] font-extrabold text-slate-400 tracking-wide uppercase">
              Item {index + 1}{isWorkObj ? ` (${obj.weight}%)` : ""}
            </span>
            {!isWorkObj && (
              <>
                <span className="bg-slate-100 text-slate-600 font-extrabold text-[8px] px-2 py-0.5 rounded uppercase tracking-wider">
                  Expected Level: {obj.expectedLevel || 3} / 5
                </span>
                {obj.category && (
                  <span className={`font-extrabold text-[8px] px-2 py-0.5 rounded uppercase tracking-wider border ${getCategoryBadgeStyle(obj.category)}`}>
                    {obj.category}
                  </span>
                )}
              </>
            )}
          </div>
          <p className="font-bold text-slate-700 text-xs mt-0.5">{obj.text}</p>
          {obj.description && obj.description.length > 0 && (
            <ul className="list-disc pl-4 mt-1.5 space-y-0.5 text-slate-500 text-[10px] font-semibold">
              {obj.description.map((line, lIdx) => (
                <li key={lIdx}>{line}</li>
              ))}
            </ul>
          )}
          <p className="text-[10px] text-slate-500 italic mt-1 font-medium">Comments: "{obj.comments || "No comments"}"</p>
          {obj.managerFeedback && (
            <p className="text-[10px] text-emerald-700 italic mt-1 font-semibold">Manager Feedback: "{obj.managerFeedback}"</p>
          )}
        </div>
        <div className="flex gap-4 items-center flex-shrink-0">
          <div className="text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Self</span>
            <span className="inline-block font-bold text-xs bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-md mt-0.5">
              {obj.selfScore !== undefined ? (isWorkObj ? `${obj.selfScore}%` : `${obj.selfScore} / 5`) : "—"}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Manager</span>
            <span className="inline-block font-bold text-xs bg-emerald-50 text-emerald-750 px-2.5 py-0.5 rounded-md mt-0.5">
              {obj.managerScore !== undefined ? (isWorkObj ? `${obj.managerScore}%` : `${obj.managerScore} / 5`) : "—"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ERPLayout>
      <div className="flex flex-col gap-6">
        
        {/* Header navigation back */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div>
            <button
              onClick={() => router.push("/hr")}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to HR Queue
            </button>
            <h2 className="text-[20px] font-black text-slate-800 tracking-tight mt-1.5">Audit {employee.name} Evaluation</h2>
            <p className="text-xs text-slate-400 font-semibold">{employee.id} • {employee.department}</p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-450 block uppercase tracking-wide">Overall Manager Score (Normalized)</span>
            {review.finalScore !== undefined ? (
              <span className="inline-block mt-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold">
                {review.finalScore.toFixed(1)} / 10
              </span>
            ) : (
              <span className="text-slate-400 font-semibold text-xs">—</span>
            )}
          </div>
        </div>

        {/* WORK-RELATED OBJECTIVES AUDIT */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">1. Work-Related Objectives Audit (100% Scale)</h3>
            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">
              Self Avg: {getSubAverage(workObjectives, "selfScore").toFixed(0)}% | Mgr Avg: {getSubAverage(workObjectives, "managerScore").toFixed(0)}%
            </span>
          </div>
          <div className="space-y-3">
            {workObjectives.map((obj, index) => renderAuditCard(obj, index))}
          </div>
        </div>

        {/* CORE COMPETENCY RATINGS AUDIT */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">2. Core Competency Ratings Audit (1-5 Scale)</h3>
            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">
              Self Avg: {getSubAverage(competencyObjectives, "selfScore").toFixed(1)} / 5 | Mgr Avg: {getSubAverage(competencyObjectives, "managerScore").toFixed(1)} / 5
            </span>
          </div>
          <div className="space-y-3">
            {competencyObjectives.map((obj, index) => renderAuditCard(obj, index))}
          </div>
        </div>

        {/* Comments & Improvement Plan Audit */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-gray-100 pb-2">Overall Comments Audit</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Employee assessment summary</span>
                <p className="text-xs text-slate-650 bg-slate-50 p-4 rounded-2xl border border-gray-100 italic min-h-[80px]">
                  "{review.employeeComments || "No employee comments entered."}"
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Manager evaluation summary</span>
                <p className="text-xs text-slate-650 bg-slate-50 p-4 rounded-2xl border border-gray-100 italic min-h-[80px]">
                  "{review.managerComments || "No manager comments entered."}"
                </p>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Improvement Plan</span>
              <textarea
                placeholder="Detail the goals and actions for improvement over the next review cycle..."
                value={improvementPlan}
                onChange={(e) => setImprovementPlan(e.target.value)}
                rows={7}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
              />
            </div>
          </div>
        </div>

        {/* HR Remarks Box */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">HR Audit Remarks & Verification Comments</h3>
          <textarea
            placeholder="Provide HR evaluation comments, compliance flags, or audit notes. Visible to MD and employees once approved."
            value={hrComments}
            onChange={(e) => setHrComments(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 items-center justify-end py-2">
          <button
            onClick={handleReject}
            className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs transition-all border border-red-200"
          >
            Reject & Return for Correction
          </button>
          <button
            onClick={handleApprove}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            Approve & Sign-off Review
          </button>
        </div>

      </div>
    </ERPLayout>
  );
}
