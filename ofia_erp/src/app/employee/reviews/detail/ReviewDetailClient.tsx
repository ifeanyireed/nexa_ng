"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useERPStore, PerformanceReview, Objective } from "@/lib/erp-store";
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

export default function ReviewDetailClient() {
  const router = useRouter();
  const { reviews, updateReview } = useERPStore();
  
  const [reviewId, setReviewId] = useState<string>("");
  const [review, setReview] = useState<PerformanceReview | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [employeeComments, setEmployeeComments] = useState("");
  const [improvementPlan, setImprovementPlan] = useState("");
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("id") || "";
    setReviewId(id);
  }, []);

  useEffect(() => {
    if (reviewId && reviews.length > 0) {
      const found = reviews.find(r => r.id === reviewId);
      if (found) {
        setReview(found);
        setObjectives(found.objectives);
        setEmployeeComments(found.employeeComments || "");
        setImprovementPlan(found.improvementPlan || "");
      }
    }
  }, [reviews, reviewId]);

  if (!review) {
    return (
      <ERPLayout>
        <div className="py-8 text-center text-slate-450 font-bold">Loading review details...</div>
      </ERPLayout>
    );
  }

  const isEditable = review.status === "Draft" || review.status === "Returned";

  const handleScoreChange = (originalIndex: number, score: number) => {
    const updated = [...objectives];
    updated[originalIndex].selfScore = score;
    setObjectives(updated);

    const updatedReview: PerformanceReview = {
      ...review,
      objectives: updated,
      employeeComments,
      improvementPlan,
      updatedAt: new Date().toISOString(),
    };
    updateReview(updatedReview);
  };

  const handleCommentChange = (originalIndex: number, comment: string) => {
    const updated = [...objectives];
    updated[originalIndex].comments = comment;
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
        // Work objectives (0-100) -> normalized to 10 is score/10
        // Competencies (1-5) -> normalized to 10 is score*2
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

  const workObjectives = objectives.filter(o => o.type === "objective");
  const competencyObjectives = objectives.filter(o => o.type === "competency");

  const getSubAverage = (list: Objective[], field: "selfScore" | "managerScore") => {
    const scores = list.map(o => o[field]).filter((s): s is number => s !== undefined);
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  const handleSaveDraft = () => {
    const updatedReview: PerformanceReview = {
      ...review,
      objectives,
      employeeComments,
      improvementPlan,
      updatedAt: new Date().toISOString(),
    };
    updateReview(updatedReview);
    alert("Draft saved successfully!");
  };

  const handleSubmit = () => {
    // Validate that all objectives have self-scores
    const incomplete = objectives.some(o => o.selfScore === undefined);
    if (incomplete) {
      alert("Please provide a self-score for all objectives and competencies before submitting.");
      return;
    }

    const updatedReview: PerformanceReview = {
      ...review,
      status: "Submitted",
      objectives,
      employeeComments,
      improvementPlan,
      updatedAt: new Date().toISOString(),
    };
    updateReview(updatedReview);
    setIsSubmittedSuccess(true);
  };

  if (isSubmittedSuccess) {
    const selfAvg = calculateSelfAverage();
    return (
      <ERPLayout>
        <div className="max-w-2xl mx-auto bg-white rounded-[28px] border border-gray-150/40 p-8 flex flex-col items-center gap-6 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Self-Assessment Submitted!</h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">Your response has been logged and sent to your manager.</p>
          </div>

          <div className="w-full bg-gray-50 p-5 rounded-2xl flex flex-col gap-4 text-left border border-gray-100">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-xs font-extrabold text-slate-455 uppercase tracking-wide">Review Code</span>
              <span className="text-xs font-black text-slate-800">{review.id}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-xs font-extrabold text-slate-455 uppercase tracking-wide">Cycle</span>
              <span className="text-xs font-bold text-slate-700">{review.cycleName}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-xs font-extrabold text-slate-455 uppercase tracking-wide">Work Objectives Avg</span>
              <span className="font-bold text-slate-800 text-xs">
                {getSubAverage(workObjectives, "selfScore").toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-xs font-extrabold text-slate-455 uppercase tracking-wide">Competencies Avg</span>
              <span className="font-bold text-slate-800 text-xs">
                {getSubAverage(competencyObjectives, "selfScore").toFixed(1)} / 5
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-slate-455 uppercase tracking-wide">Overall Rating (Normalized)</span>
              <span className="bg-blue-50 text-blue-700 font-black px-2.5 py-1 rounded-lg text-xs">
                {selfAvg.toFixed(1)} / 10
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push("/employee")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
          >
            Back to Dashboard
          </button>
        </div>
      </ERPLayout>
    );
  }

  const renderObjectiveCard = (obj: Objective, index: number, originalIndex: number) => {
    const isWorkObj = obj.type === "objective";
    
    return (
      <div key={obj.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex gap-2.5 items-center">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">
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
            <h4 className="font-bold text-slate-800 text-sm mt-1">{obj.text}</h4>
            {obj.description && obj.description.length > 0 && (
              <ul className="list-disc pl-4 mt-1.5 space-y-0.5 text-slate-500 text-[11px] font-semibold">
                {obj.description.map((line, lIdx) => (
                  <li key={lIdx}>{line}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Score Input/Display */}
          <div className="flex-shrink-0">
            {isEditable ? (
              <div className="flex flex-col items-end">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  {isWorkObj ? "Score (0-100%)" : "Rating (1-5)"}
                </label>
                <select
                  value={obj.selfScore ?? ""}
                  onChange={(e) => handleScoreChange(originalIndex, Number(e.target.value))}
                  className="pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
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
            ) : (
              <div className="flex gap-3 text-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Self</span>
                  <span className="inline-block mt-1 font-bold text-xs bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg">
                    {obj.selfScore !== undefined ? (isWorkObj ? `${obj.selfScore}%` : `${obj.selfScore} / 5`) : "—"}
                  </span>
                </div>
                {obj.managerScore !== undefined && (
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Manager</span>
                    <span className="inline-block mt-1 font-bold text-xs bg-emerald-50 text-emerald-750 px-2.5 py-1 rounded-lg">
                      {isWorkObj ? `${obj.managerScore}%` : `${obj.managerScore} / 5`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Comments box */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Self Comments / Evidence</label>
          {isEditable ? (
            <textarea
              placeholder={isWorkObj ? "Enter key performance indicators achieved, targets reached..." : "Provide behavioral evidence, collaborative highlights..."}
              value={obj.comments || ""}
              onChange={(e) => handleCommentChange(originalIndex, e.target.value)}
              onBlur={() => {
                const updatedReview: PerformanceReview = {
                  ...review,
                  objectives,
                  employeeComments,
                  improvementPlan,
                  updatedAt: new Date().toISOString(),
                };
                updateReview(updatedReview);
              }}
              rows={2}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
            />
          ) : (
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-gray-100 italic">
              {obj.comments || "No comments entered."}
            </p>
          )}
        </div>

        {obj.managerFeedback && (
          <div className="mt-2.5 pt-2.5 border-t border-gray-100">
            <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block mb-1">Manager Feedback</label>
            <p className="text-xs text-emerald-900 bg-emerald-50/20 p-3 rounded-xl border border-emerald-100/30 italic">
              {obj.managerFeedback}
            </p>
          </div>
        )}
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
              onClick={() => router.push(review.employeeId === "EMP001" ? "/employee/reviews" : "/manager")}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>
            <h2 className="text-[20px] font-black text-slate-800 tracking-tight mt-1.5">{review.cycleName}</h2>
            <p className="text-xs text-slate-400 font-semibold">Employee Self-Assessment Form</p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-450 block uppercase tracking-wide">Status</span>
            <span className="inline-block mt-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[11px] font-bold uppercase">
              {review.status}
            </span>
          </div>
        </div>

        {/* WORK-RELATED OBJECTIVES SECTION */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">1. Work-Related Objectives (100% Scale)</h3>
            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">
              Self Avg: {getSubAverage(workObjectives, "selfScore").toFixed(0)}%
              {review.status !== "Draft" && review.status !== "Submitted" && ` | Mgr Avg: ${getSubAverage(workObjectives, "managerScore").toFixed(0)}%`}
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {workObjectives.map((obj, index) => {
              const originalIndex = objectives.findIndex(item => item.id === obj.id);
              return renderObjectiveCard(obj, index, originalIndex);
            })}
          </div>
        </div>

        {/* CORE COMPETENCY RATINGS SECTION */}
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">2. Core Competency Ratings (1-5 Scale)</h3>
            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">
              Self Avg: {getSubAverage(competencyObjectives, "selfScore").toFixed(1)} / 5
              {review.status !== "Draft" && review.status !== "Submitted" && ` | Mgr Avg: ${getSubAverage(competencyObjectives, "managerScore").toFixed(1)} / 5`}
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {competencyObjectives.map((obj, index) => {
              const originalIndex = objectives.findIndex(item => item.id === obj.id);
              return renderObjectiveCard(obj, index, originalIndex);
            })}
          </div>
        </div>

        {/* Global review comments block */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Overall Comments</h3>
          {isEditable ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Self Comments / Summary</label>
                <textarea
                  placeholder="Provide a summary of your performance, highlights, and career development goals..."
                  value={employeeComments}
                  onChange={(e) => setEmployeeComments(e.target.value)}
                  onBlur={() => {
                    const updatedReview: PerformanceReview = {
                      ...review,
                      objectives,
                      employeeComments,
                      improvementPlan,
                      updatedAt: new Date().toISOString(),
                    };
                    updateReview(updatedReview);
                  }}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Improvement Plan</label>
                <textarea
                  placeholder="Detail your goals and actions for improvement over the next review cycle..."
                  value={improvementPlan}
                  onChange={(e) => setImprovementPlan(e.target.value)}
                  onBlur={() => {
                    const updatedReview: PerformanceReview = {
                      ...review,
                      objectives,
                      employeeComments,
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
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Employee Assessment Summary</h4>
                  <p className="text-xs text-slate-700 mt-1 italic">{review.employeeComments || "No employee comments."}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Improvement Plan</h4>
                  <p className="text-xs text-slate-700 mt-1 italic">{review.improvementPlan || "No improvement plan entered."}</p>
                </div>
              </div>
              {review.managerComments && (
                <div className="pt-3 border-t border-gray-100">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Manager Evaluation</h4>
                  <p className="text-xs text-slate-700 mt-1 italic">{review.managerComments}</p>
                </div>
              )}
              {review.hrComments && (
                <div className="pt-3 border-t border-gray-100">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">HR Audit Feedback</h4>
                  <p className="text-xs text-slate-700 mt-1 italic">{review.hrComments}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Bar */}
        {isEditable && (
          <div className="flex gap-4 items-center justify-end py-2">
            <button
              onClick={handleSaveDraft}
              className="px-6 py-2.5 bg-white border border-gray-250 text-slate-650 font-bold rounded-xl text-xs hover:bg-gray-50 active:scale-98 transition-all shadow-sm"
            >
              Save Draft
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md active:scale-98 transition-all"
            >
              Submit Evaluation
            </button>
          </div>
        )}

      </div>
    </ERPLayout>
  );
}
