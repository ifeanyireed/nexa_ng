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

export default function ManagerReviewClient() {
  const router = useRouter();
  const { reviews, users, updateReview } = useERPStore();

  const [employeeId, setEmployeeId] = useState<string>("");
  const [review, setReview] = useState<PerformanceReview | null>(null);
  const [employee, setEmployee] = useState<User | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [managerComments, setManagerComments] = useState("");
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
          setObjectives(foundReview.objectives);
          setManagerComments(foundReview.managerComments || "");
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

  const handleScoreChange = (originalIndex: number, score: number) => {
    const updated = [...objectives];
    updated[originalIndex].managerScore = score;
    setObjectives(updated);

    const updatedReview: PerformanceReview = {
      ...review,
      objectives: updated,
      managerComments,
      improvementPlan,
      updatedAt: new Date().toISOString(),
    };
    updateReview(updatedReview);
  };

  const handleFeedbackChange = (originalIndex: number, feedback: string) => {
    const updated = [...objectives];
    updated[originalIndex].managerFeedback = feedback;
    setObjectives(updated);
  };

  // Normalized overall self score out of 10 (70% work-related, 30% core-compliance competencies)
  const calculateSelfAverage = () => {
    let workWeightedSum = 0;
    let workTotalWeight = 0;
    let compWeightedSum = 0;
    let compTotalWeight = 0;

    objectives.forEach(o => {
      if (o.selfScore !== undefined) {
        const normalized = o.type === "objective" ? (o.selfScore / 10) : (o.selfScore * 2);
        if (o.type === "objective") {
          workWeightedSum += normalized * o.weight;
          workTotalWeight += o.weight;
        } else {
          compWeightedSum += normalized * o.weight;
          compTotalWeight += o.weight;
        }
      }
    });

    const workAvg = workTotalWeight > 0 ? (workWeightedSum / workTotalWeight) : 0;
    const compAvg = compTotalWeight > 0 ? (compWeightedSum / compTotalWeight) : 0;

    if (workTotalWeight > 0 && compTotalWeight > 0) {
      return (workAvg * 0.7) + (compAvg * 0.3);
    } else if (workTotalWeight > 0) {
      return workAvg;
    } else if (compTotalWeight > 0) {
      return compAvg;
    }
    return 0;
  };

  // Normalized composite score out of 10 (30% self-score, 70% manager-score)
  const calculateFinalAverage = () => {
    let selfWorkWeightedSum = 0;
    let selfWorkTotalWeight = 0;
    let selfCompWeightedSum = 0;
    let selfCompTotalWeight = 0;

    let mgrWorkWeightedSum = 0;
    let mgrWorkTotalWeight = 0;
    let mgrCompWeightedSum = 0;
    let mgrCompTotalWeight = 0;

    objectives.forEach(o => {
      if (o.selfScore !== undefined) {
        const normalized = o.type === "objective" ? (o.selfScore / 10) : (o.selfScore * 2);
        if (o.type === "objective") {
          selfWorkWeightedSum += normalized * o.weight;
          selfWorkTotalWeight += o.weight;
        } else {
          selfCompWeightedSum += normalized * o.weight;
          selfCompTotalWeight += o.weight;
        }
      }
      if (o.managerScore !== undefined) {
        const normalized = o.type === "objective" ? (o.managerScore / 10) : (o.managerScore * 2);
        if (o.type === "objective") {
          mgrWorkWeightedSum += normalized * o.weight;
          mgrWorkTotalWeight += o.weight;
        } else {
          mgrCompWeightedSum += normalized * o.weight;
          mgrCompTotalWeight += o.weight;
        }
      }
    });

    const selfWorkAvg = selfWorkTotalWeight > 0 ? (selfWorkWeightedSum / selfWorkTotalWeight) : 0;
    const selfCompAvg = selfCompTotalWeight > 0 ? (selfCompWeightedSum / selfCompTotalWeight) : 0;

    let selfAvg = 0;
    if (selfWorkTotalWeight > 0 && selfCompTotalWeight > 0) {
      selfAvg = (selfWorkAvg * 0.7) + (selfCompAvg * 0.3);
    } else if (selfWorkTotalWeight > 0) {
      selfAvg = selfWorkAvg;
    } else if (selfCompTotalWeight > 0) {
      selfAvg = selfCompAvg;
    }

    const mgrWorkAvg = mgrWorkTotalWeight > 0 ? (mgrWorkWeightedSum / mgrWorkTotalWeight) : 0;
    const mgrCompAvg = mgrCompTotalWeight > 0 ? (mgrCompWeightedSum / mgrCompTotalWeight) : 0;

    let mgrAvg = 0;
    if (mgrWorkTotalWeight > 0 && mgrCompTotalWeight > 0) {
      mgrAvg = (mgrWorkAvg * 0.7) + (mgrCompAvg * 0.3);
    } else if (mgrWorkTotalWeight > 0) {
      mgrAvg = mgrWorkAvg;
    } else if (mgrCompTotalWeight > 0) {
      mgrAvg = mgrCompAvg;
    }

    return (selfAvg * 0.3) + (mgrAvg * 0.7);
  };

  const handleApprove = () => {
    // Validate manager scores are filled
    const missing = objectives.some(o => o.managerScore === undefined);
    if (missing) {
      alert("Please assign a score for all objectives and competencies before approving.");
      return;
    }

    const finalScore = calculateFinalAverage();
    const updatedReview: PerformanceReview = {
      ...review,
      status: "Manager Reviewed",
      objectives,
      managerComments,
      improvementPlan,
      finalScore,
      updatedAt: new Date().toISOString(),
    };
    updateReview(updatedReview);
    alert("Evaluation submitted! Awaiting HR review.");
    router.push("/manager");
  };

  const handleReturn = () => {
    if (!managerComments.trim()) {
      alert("Please provide return comments/feedback in the manager comments section.");
      return;
    }

    const updatedReview: PerformanceReview = {
      ...review,
      status: "Draft",
      managerComments,
      improvementPlan,
      updatedAt: new Date().toISOString(),
    };
    updateReview(updatedReview);
    alert("Review returned to employee for revision.");
    router.push("/manager");
  };

  const workObjectives = objectives.filter(o => o.type === "objective");
  const competencyObjectives = objectives.filter(o => o.type === "competency");

  const getSubAverage = (list: Objective[], field: "selfScore" | "managerScore") => {
    const scores = list.map(o => o[field]).filter((s): s is number => s !== undefined);
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  const renderObjectiveFormCard = (obj: Objective, index: number, originalIndex: number) => {
    const isWorkObj = obj.type === "objective";
    
    return (
      <div key={obj.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex gap-2.5 items-center">
              <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block">
                Item {index + 1}{isWorkObj ? ` (${obj.weight}%)` : ""}
              </span>
              {!isWorkObj && (
                <>
                  <span className="bg-slate-100 text-slate-600 font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Expected Level: {obj.expectedLevel || 3} / 5
                  </span>
                  {obj.category && (
                    <span className={`font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider border ${getCategoryBadgeStyle(obj.category)}`}>
                      {obj.category}
                    </span>
                  )}
                </>
              )}
            </div>
            <h4 className="font-bold text-slate-855 text-sm mt-1">{obj.text}</h4>
            {obj.description && obj.description.length > 0 && (
              <ul className="list-disc pl-4 mt-1.5 space-y-0.5 text-slate-500 text-[11px] font-semibold">
                {obj.description.map((line, lIdx) => (
                  <li key={lIdx}>{line}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Employee Self Score */}
            <div className="text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Self Score</span>
              <span className="inline-block mt-1 font-bold text-xs bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg">
                {obj.selfScore !== undefined ? (isWorkObj ? `${obj.selfScore}%` : `${obj.selfScore} / 5`) : "—"}
              </span>
            </div>

            {/* Manager Rating Score Input */}
            <div className="flex flex-col items-end">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                {isWorkObj ? "Score (0-100%)" : "Rating (1-5)"}
              </label>
              <select
                value={obj.managerScore ?? ""}
                onChange={(e) => handleScoreChange(originalIndex, Number(e.target.value))}
                className="pl-3 pr-8 py-1.5 border border-gray-205 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                <option value="">Select</option>
                {isWorkObj ? (
                  [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(s => (
                    <option key={s} value={s}>{s}%</option>
                  ))
                ) : (
                  [1, 2, 3, 4, 5].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Employee feedback / Manager evaluation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Employee Self-Comment</span>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-gray-100 italic">
              {obj.comments || "No comments entered by employee."}
            </p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-emerald-700/80 uppercase tracking-wider block mb-1">Objective Evaluation Summary</span>
            <textarea
              placeholder="Provide manager guidance / evaluation feedback..."
              value={obj.managerFeedback || ""}
              onChange={(e) => handleFeedbackChange(originalIndex, e.target.value)}
              onBlur={() => {
                const updatedReview: PerformanceReview = {
                  ...review,
                  objectives,
                  managerComments,
                  improvementPlan,
                  updatedAt: new Date().toISOString(),
                };
                updateReview(updatedReview);
              }}
              rows={2}
              className="w-full px-3.5 py-2.5 bg-white border border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold"
            />
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
              onClick={() => router.push("/manager")}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Team
            </button>
            <h2 className="text-[20px] font-black text-slate-800 tracking-tight mt-1.5">Evaluate {employee.name}</h2>
            <p className="text-xs text-slate-400 font-semibold">{employee.id} • {employee.department}</p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-450 block uppercase tracking-wide">Self Score Avg (Normalized)</span>
            <span className="inline-block mt-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[11px] font-bold">
              {calculateSelfAverage().toFixed(1)} / 10
            </span>
          </div>
        </div>

        {/* WORK-RELATED OBJECTIVES SECTION */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">1. Work-Related Objectives (100% Scale)</h3>
            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">
              Self Avg: {getSubAverage(workObjectives, "selfScore").toFixed(0)}%
              {objectives.some(o => o.managerScore !== undefined) && ` | Mgr Avg: ${getSubAverage(workObjectives, "managerScore").toFixed(0)}%`}
            </span>
          </div>
          <div className="flex flex-col gap-5">
            {workObjectives.map((obj, index) => {
              const originalIndex = objectives.findIndex(item => item.id === obj.id);
              return renderObjectiveFormCard(obj, index, originalIndex);
            })}
          </div>
        </div>

        {/* CORE COMPETENCY RATINGS SECTION */}
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">2. Core Competency Ratings (1-5 Scale)</h3>
            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">
              Self Avg: {getSubAverage(competencyObjectives, "selfScore").toFixed(1)} / 5
              {objectives.some(o => o.managerScore !== undefined) && ` | Mgr Avg: ${getSubAverage(competencyObjectives, "managerScore").toFixed(1)} / 5`}
            </span>
          </div>
          <div className="flex flex-col gap-5">
            {competencyObjectives.map((obj, index) => {
              const originalIndex = objectives.findIndex(item => item.id === obj.id);
              return renderObjectiveFormCard(obj, index, originalIndex);
            })}
          </div>
        </div>

        {/* Manager feedback evaluation & Overall comments */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-gray-100 pb-2">Overall Comments</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Employee Assessment Summary</span>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-gray-200 italic min-h-[80px]">
                {review.employeeComments || "No employee comments entered."}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Improvement Plan</span>
              <textarea
                placeholder="Detail the goals and actions for improvement over the next review cycle..."
                value={improvementPlan}
                onChange={(e) => setImprovementPlan(e.target.value)}
                onBlur={() => {
                  const updatedReview: PerformanceReview = {
                    ...review,
                    objectives,
                    managerComments,
                    improvementPlan,
                    updatedAt: new Date().toISOString(),
                  };
                  updateReview(updatedReview);
                }}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Manager Evaluation Summary & Comments</span>
            <textarea
              placeholder="Provide a comprehensive evaluation of employee achievements, strengths, and areas requiring development. This comment will be visible to HR/MD audits and employee."
              value={managerComments}
              onChange={(e) => setManagerComments(e.target.value)}
              onBlur={() => {
                const updatedReview: PerformanceReview = {
                  ...review,
                  objectives,
                  managerComments,
                  improvementPlan,
                  updatedAt: new Date().toISOString(),
                };
                updateReview(updatedReview);
              }}
              rows={3}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 items-center justify-end py-2">
          <button
            onClick={handleReturn}
            className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs transition-all border border-red-200"
          >
            Return for Correction
          </button>
          <button
            onClick={handleApprove}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            Approve & Submit
          </button>
        </div>

      </div>
    </ERPLayout>
  );
}
