"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useERPStore, PerformanceReview, Objective } from "@/lib/erp-store";
import { BusinessShell } from "@/components/business/BusinessShell";

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

const getStatusBadge = (status?: string) => {
  const s = status?.toLowerCase() || "draft";
  switch (s) {
    case "submitted":
      return { bg: "bg-blue-50 text-blue-700 border-blue-200", label: "Submitted" };
    case "in review":
      return { bg: "bg-purple-50 text-purple-700 border-purple-200", label: "In Review" };
    case "completed":
    case "closed":
      return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Completed" };
    case "returned":
      return { bg: "bg-rose-50 text-rose-700 border-rose-200", label: "Returned for Revision" };
    case "draft":
    default:
      return { bg: "bg-amber-50 text-amber-700 border-amber-200", label: "Draft - In Progress" };
  }
};

export default function ReviewDetailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { reviews, updateReview } = useERPStore();

  const [reviewId, setReviewId] = useState<string>("");
  const [review, setReview] = useState<PerformanceReview | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [employeeComments, setEmployeeComments] = useState("");
  const [improvementPlan, setImprovementPlan] = useState("");
  const [isLoadingReview, setIsLoadingReview] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Track the ID of the currently loaded review to prevent overwriting active user edits
  const loadedReviewIdRef = useRef<string>("");

  const loadReviewIntoState = useCallback((r: PerformanceReview) => {
    setReview(r);
    loadedReviewIdRef.current = r.id;

    let parsedObjs: Objective[] = [];
    if (Array.isArray(r.objectives)) {
      parsedObjs = r.objectives;
    } else if (typeof (r as any).objectives === "string") {
      try {
        parsedObjs = JSON.parse((r as any).objectives);
      } catch (e) {
        console.warn("Failed to parse review objectives JSON string:", e);
        parsedObjs = [];
      }
    }
    setObjectives(parsedObjs);
    setEmployeeComments(r.employeeComments || "");
    setImprovementPlan(r.improvementPlan || "");
  }, []);

  // Fetch or sync review on ID change or store update
  useEffect(() => {
    const rawId = searchParams.get("id") || (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("id") || "" : "");
    const id = rawId.trim();

    if (!id) {
      setIsLoadingReview(false);
      setLoadError("No review ID provided in the URL.");
      return;
    }

    setReviewId(id);

    // If this review is already loaded in local state, do not overwrite any pending user inputs
    if (loadedReviewIdRef.current.toLowerCase() === id.toLowerCase() && review) {
      return;
    }

    // 1. Try finding in in-memory store first
    const cached = reviews.find(r => r.id.toLowerCase() === id.toLowerCase());
    if (cached) {
      loadReviewIntoState(cached);
      setIsLoadingReview(false);
      setLoadError(null);
      return;
    }

    // 2. Fetch directly from ERP backend API by ID
    let isMounted = true;
    setIsLoadingReview(true);
    setLoadError(null);

    const activeSlug = typeof window !== "undefined" ? localStorage.getItem("tenant_slug") || "" : "";
    const url = `/api/erp/reviews?id=${encodeURIComponent(id)}${activeSlug ? `&tenant=${encodeURIComponent(activeSlug)}` : ""}`;

    fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(activeSlug ? { "x-tenant-slug": activeSlug } : {})
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Review with ID "${id}" could not be retrieved (Status ${res.status})`);
        }
        const data = await res.json();
        if (!isMounted) return;
        if (data && data.id) {
          loadReviewIntoState(data);
          setIsLoadingReview(false);
        } else {
          throw new Error(`Review "${id}" was not found or is empty.`);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load review by ID:", err);
        setLoadError(err.message || "Failed to load review record.");
        setIsLoadingReview(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchParams, reviews, review, loadReviewIntoState]);

  // Loading state
  if (isLoadingReview && !review) {
    return (
      <BusinessShell title="Performance Review Dossier" subtitle="Loading self-appraisal submission...">
        <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Loading Review Details...</h3>
            <p className="text-xs text-slate-400 mt-1">Retrieving KPI targets, competency criteria, and appraisal form.</p>
          </div>
        </div>
      </BusinessShell>
    );
  }

  // Not found state
  if (!review) {
    return (
      <BusinessShell title="Review Dossier Not Found" subtitle="Unable to load the requested performance appraisal record">
        <div className="py-16 text-center max-w-md mx-auto bg-white rounded-2xl border border-gray-200/70 p-8 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-sm font-black text-slate-800 tracking-tight">Review Could Not Be Found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            {loadError || `No performance review record found with ID "${reviewId || "unknown"}".`}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.push("/erp/employee/reviews")}
              className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
            >
              Return to My Reviews
            </button>
          </div>
        </div>
      </BusinessShell>
    );
  }

  const isEditable = review.status?.toLowerCase() === "draft" || review.status?.toLowerCase() === "returned";

  const handleScoreChange = (originalIndex: number, score: number) => {
    const updated = [...objectives];
    updated[originalIndex] = {
      ...updated[originalIndex],
      selfScore: score,
    };
    setObjectives(updated);

    const updatedReview: PerformanceReview = {
      ...review,
      objectives: updated,
      employeeComments,
      improvementPlan,
      updatedAt: new Date().toISOString(),
    };
    setReview(updatedReview);
    updateReview(updatedReview);
  };

  const handleCommentChange = (originalIndex: number, comment: string) => {
    const updated = [...objectives];
    updated[originalIndex] = {
      ...updated[originalIndex],
      comments: comment,
    };
    setObjectives(updated);
  };

  const syncStateOnBlur = () => {
    const updatedReview: PerformanceReview = {
      ...review,
      objectives,
      employeeComments,
      improvementPlan,
      updatedAt: new Date().toISOString(),
    };
    setReview(updatedReview);
    updateReview(updatedReview);
  };

  // Normalized overall self score out of 10 (70% work-related, 30% core-compliance competencies)
  const calculateSelfAverage = () => {
    let workWeightedSum = 0;
    let workTotalWeight = 0;
    let compWeightedSum = 0;
    let compTotalWeight = 0;

    objectives.forEach(o => {
      if (o.selfScore !== undefined && o.selfScore !== null && !isNaN(o.selfScore)) {
        const isCompetency = o.type === "competency" || !!o.expectedLevel;
        // Work objectives (0-100) -> normalized to 10 is score/10
        // Competencies (1-5) -> normalized to 10 is score*2
        const normalized = !isCompetency ? (o.selfScore / 10) : (o.selfScore * 2);
        const weight = o.weight || 10;
        if (!isCompetency) {
          workWeightedSum += normalized * weight;
          workTotalWeight += weight;
        } else {
          compWeightedSum += normalized * weight;
          compTotalWeight += weight;
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

  const workObjectives = objectives.filter(o => o.type === "objective" || (!o.type && !o.expectedLevel));
  const competencyObjectives = objectives.filter(o => o.type === "competency" || !!o.expectedLevel);

  const getSubAverage = (list: Objective[], field: "selfScore" | "managerScore") => {
    const scores = list.map(o => o[field]).filter((s): s is number => s !== undefined && s !== null && !isNaN(s));
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    const updatedReview: PerformanceReview = {
      ...review,
      objectives,
      employeeComments,
      improvementPlan,
      updatedAt: new Date().toISOString(),
    };
    setReview(updatedReview);

    try {
      await updateReview(updatedReview);
      alert("Draft appraisal saved successfully!");
    } catch (err) {
      console.warn("Failed to sync draft appraisal with backend:", err);
      alert("Draft saved locally.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    // Validate that all objectives have self-scores
    const unrated = objectives.filter(o => o.selfScore === undefined || o.selfScore === null || isNaN(o.selfScore));
    if (unrated.length > 0) {
      alert(`Please provide a self-score for all ${objectives.length} items before submitting. (${unrated.length} item${unrated.length > 1 ? "s" : ""} remaining)`);
      return;
    }

    setIsSubmitting(true);
    const updatedReview: PerformanceReview = {
      ...review,
      status: "Submitted",
      objectives,
      employeeComments,
      improvementPlan,
      updatedAt: new Date().toISOString(),
    };
    setReview(updatedReview);

    try {
      await updateReview(updatedReview);
      setIsSubmittedSuccess(true);
    } catch (err) {
      console.error("Failed to submit review:", err);
      // Keep optimistic submitted success screen
      setIsSubmittedSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmittedSuccess) {
    const selfAvg = calculateSelfAverage();
    return (
      <BusinessShell title="Appraisal Submission Success" subtitle="Your self-appraisal score and responses have been logged.">
        <div className="max-w-2xl mx-auto bg-white rounded-[28px] border border-gray-150/40 p-8 flex flex-col items-center gap-6 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Self-Assessment Submitted!</h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">Your response has been logged and forwarded to your Line Manager for evaluation.</p>
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
              <span className="text-xs font-extrabold text-slate-455 uppercase tracking-wide">Employee</span>
              <span className="text-xs font-bold text-slate-800">{review.employeeName} ({review.department})</span>
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
              <span className="text-sm font-black text-blue-600">
                {selfAvg.toFixed(1)} / 10
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push("/erp/employee/reviews")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
          >
            Return to My Reviews
          </button>
        </div>
      </BusinessShell>
    );
  }

  const renderObjectiveCard = (obj: Objective, index: number, originalIndex: number) => {
    const isWorkObj = obj.type === "objective" || (!obj.type && !obj.expectedLevel);
    
    return (
      <div key={obj.id || index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">
                Item {index + 1}{obj.weight ? ` (${obj.weight}%)` : ""}
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
              <ul className="list-disc pl-4 mt-2 space-y-1 text-slate-500 text-[11px] font-semibold">
                {obj.description.map((line, lIdx) => (
                  <li key={lIdx}>{line}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Score Input / Display */}
          <div className="flex-shrink-0">
            {isEditable ? (
              <div className="flex flex-col items-end">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  {isWorkObj ? "Self Score (0-100%)" : "Self Rating (1-5)"}
                </label>
                <select
                  value={obj.selfScore ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? undefined : Number(e.target.value);
                    if (val !== undefined) {
                      handleScoreChange(originalIndex, val);
                    }
                  }}
                  className="pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="">Select Score</option>
                  {isWorkObj ? (
                    [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(s => (
                      <option key={s} value={s}>{s}%</option>
                    ))
                  ) : (
                    [
                      { val: 1, label: "1 - Unsatisfactory" },
                      { val: 2, label: "2 - Needs Improvement" },
                      { val: 3, label: "3 - Meets Expectations" },
                      { val: 4, label: "4 - Exceeds Expectations" },
                      { val: 5, label: "5 - Outstanding" },
                    ].map(item => (
                      <option key={item.val} value={item.val}>{item.label}</option>
                    ))
                  )}
                </select>
              </div>
            ) : (
              <div className="flex gap-3 text-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Self</span>
                  <span className="inline-block mt-1 font-bold text-xs bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg">
                    {obj.selfScore !== undefined && obj.selfScore !== null ? (isWorkObj ? `${obj.selfScore}%` : `${obj.selfScore} / 5`) : "—"}
                  </span>
                </div>
                {obj.managerScore !== undefined && obj.managerScore !== null && (
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
              placeholder={isWorkObj ? "Enter key performance indicators achieved, targets reached, supporting evidence..." : "Provide behavioral evidence, collaborative highlights, project instances..."}
              value={obj.comments || ""}
              onChange={(e) => handleCommentChange(originalIndex, e.target.value)}
              onBlur={syncStateOnBlur}
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

  const statusBadge = getStatusBadge(review.status);
  const selfAvg = calculateSelfAverage();

  return (
    <BusinessShell
      title={review.cycleName}
      subtitle="Employee Self-Assessment & Competency Appraisal Dossier"
    >
      <div className="space-y-6">
        
        {/* Header navigation back */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
          <div>
            <button
              onClick={() => router.push("/erp/employee/reviews")}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1.5 cursor-pointer mb-2"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to My Reviews
            </button>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-[20px] font-black text-slate-800 tracking-tight">{review.cycleName}</h2>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}>
                {statusBadge.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              {review.employeeName} &bull; {review.department} &bull; Review Code: <span className="font-bold text-slate-600">{review.id}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl px-4 py-2 text-right">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Self Score Rating</span>
              <span className="text-base font-black text-blue-600 tracking-tight">
                {selfAvg > 0 ? `${selfAvg.toFixed(1)} / 10` : "Not Scored"}
              </span>
            </div>
          </div>
        </div>

        {/* Read-only notification if already submitted */}
        {!isEditable && (
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-center gap-3 text-blue-800 text-xs">
            <svg className="w-5 h-5 flex-shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-bold">This appraisal has been submitted.</span> It is currently locked for review by your Line Manager.
            </div>
          </div>
        )}

        {/* WORK-RELATED OBJECTIVES SECTION */}
        {workObjectives.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                1. Work-Related Objectives (100% Scale)
              </h3>
              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">
                Self Avg: {getSubAverage(workObjectives, "selfScore").toFixed(0)}%
                {review.status !== "Draft" && review.status !== "Submitted" && ` | Mgr Avg: ${getSubAverage(workObjectives, "managerScore").toFixed(0)}%`}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {workObjectives.map((obj, index) => {
                const originalIndex = objectives.findIndex(item => item.id === obj.id);
                return renderObjectiveCard(obj, index, originalIndex >= 0 ? originalIndex : index);
              })}
            </div>
          </div>
        )}

        {/* CORE COMPETENCY RATINGS SECTION */}
        {competencyObjectives.length > 0 && (
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                2. Core Competency Ratings (1-5 Scale)
              </h3>
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">
                Self Avg: {getSubAverage(competencyObjectives, "selfScore").toFixed(1)} / 5
                {review.status !== "Draft" && review.status !== "Submitted" && ` | Mgr Avg: ${getSubAverage(competencyObjectives, "managerScore").toFixed(1)} / 5`}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {competencyObjectives.map((obj, index) => {
                const originalIndex = objectives.findIndex(item => item.id === obj.id);
                return renderObjectiveCard(obj, index, originalIndex >= 0 ? originalIndex : index);
              })}
            </div>
          </div>
        )}

        {/* Global review comments block */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Self Summary & Improvement Plan</h3>
          {isEditable ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  Self Comments / Executive Summary
                </label>
                <textarea
                  placeholder="Provide a summary of your performance highlights, key contributions, and career development achievements during this cycle..."
                  value={employeeComments}
                  onChange={(e) => setEmployeeComments(e.target.value)}
                  onBlur={syncStateOnBlur}
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  Improvement Plan / Action Goals
                </label>
                <textarea
                  placeholder="Detail your personal goals, training courses, and concrete actions for improvement over the upcoming cycle..."
                  value={improvementPlan}
                  onChange={(e) => setImprovementPlan(e.target.value)}
                  onBlur={syncStateOnBlur}
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Employee Assessment Summary</h4>
                  <p className="text-xs text-slate-700 mt-1 italic bg-slate-50 p-3 rounded-xl border border-gray-100">
                    {review.employeeComments || "No employee summary entered."}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Improvement Plan</h4>
                  <p className="text-xs text-slate-700 mt-1 italic bg-slate-50 p-3 rounded-xl border border-gray-100">
                    {review.improvementPlan || "No improvement plan entered."}
                  </p>
                </div>
              </div>
              {review.managerComments && (
                <div className="pt-3 border-t border-gray-100">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Manager Evaluation</h4>
                  <p className="text-xs text-slate-700 mt-1 italic bg-emerald-50/30 p-3 rounded-xl border border-emerald-100/50">
                    {review.managerComments}
                  </p>
                </div>
              )}
              {review.hrComments && (
                <div className="pt-3 border-t border-gray-100">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">HR Audit Feedback</h4>
                  <p className="text-xs text-slate-700 mt-1 italic bg-purple-50/30 p-3 rounded-xl border border-purple-100/50">
                    {review.hrComments}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Bar */}
        {isEditable && (
          <div className="flex gap-4 items-center justify-end py-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveDraft}
              className="px-6 py-2.5 bg-white border border-gray-250 text-slate-650 font-bold rounded-xl text-xs hover:bg-gray-50 active:scale-98 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md active:scale-98 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                "Submit Evaluation"
              )}
            </button>
          </div>
        )}
      </div>
    </BusinessShell>
  );
}
