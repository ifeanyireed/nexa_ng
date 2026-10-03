"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useERPStore,
  PerformanceReview,
  User,
  getSignedInERPUser,
  createReviewForUser,
  findReviewForUser,
} from "@/lib/erp-store";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ArrowLeft, Clock, Plus, ChevronRight, Award, AlertCircle } from "lucide-react";

export default function MyPerformanceReviews() {
  const router = useRouter();
  const { reviews, cycles, users, objectives, updateReview, isLoading } = useERPStore();
  const [currentUser, setCurrentUser] = useState<User>(() => getSignedInERPUser(users));
  const [userReviews, setUserReviews] = useState<PerformanceReview[]>([]);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = getSignedInERPUser(users);
      setCurrentUser(active);
      const userRevs = reviews.filter(
        (r) =>
          (active.id && r.employeeId && r.employeeId.toLowerCase() === active.id.toLowerCase()) ||
          (r.employeeName &&
            active.name &&
            r.employeeName.toLowerCase().trim() === active.name.toLowerCase().trim())
      );
      setUserReviews(userRevs);
    }
  }, [reviews, users]);

  // Find active cycle (case-insensitive)
  const activeCycle = cycles.find(
    (c) => c.status === "Active" || c.status?.toLowerCase() === "active"
  );

  const currentReview = activeCycle
    ? findReviewForUser(userReviews, currentUser, activeCycle.id)
    : undefined;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Draft
          </span>
        );
      case "Submitted":
        return (
          <span className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Submitted
          </span>
        );
      case "Manager Reviewed":
        return (
          <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Manager Reviewed
          </span>
        );
      case "HR Approved":
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            HR Approved
          </span>
        );
      case "Returned":
        return (
          <span className="bg-red-100 text-red-800 border border-red-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Needs Revision
          </span>
        );
      case "Closed":
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Archived
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  const getCyclePeriod = (cycleId: string) => {
    const cycle = cycles.find((c) => c.id === cycleId);
    if (!cycle) return "Jan 01, 2026 - Jun 30, 2026";
    try {
      const s = new Date(cycle.startDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const e = new Date(cycle.endDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${s} - ${e}`;
    } catch {
      return `${cycle.startDate} - ${cycle.endDate}`;
    }
  };

  const handleStartSelfAssessment = async () => {
    if (!activeCycle) return;
    setIsSubmittingNew(true);
    try {
      const newRev = createReviewForUser(currentUser, activeCycle, objectives);
      await updateReview(newRev);
      router.push(`/erp/employee/reviews/detail?id=${newRev.id}`);
    } catch (err) {
      console.error("Failed to initialize self-assessment:", err);
    } finally {
      setIsSubmittingNew(false);
    }
  };

  return (
    <BusinessShell
      title="My Performance Appraisals"
      subtitle="History of all self-assessments, manager calibrations, and approved competency scores."
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Header Block with Back Shortcut */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/erp/employee"
                className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Employee Portal</span>
              </Link>
            </div>
            <h2 className="text-[22px] font-black text-slate-800 tracking-tight mt-1">
              My Performance Reviews
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              History of all self-assessments and final ratings for {currentUser.name}
            </p>
          </div>

          {activeCycle && !currentReview && (
            <button
              onClick={handleStartSelfAssessment}
              disabled={isSubmittingNew}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmittingNew ? "Starting..." : "Start Active Self-Assessment"}</span>
            </button>
          )}
        </div>

        {/* Active Cycle Callout Banner if Available */}
        {activeCycle && (
          <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/70 rounded-3xl p-5 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider">
                  Active Review Cycle
                </span>
                <span className="text-xs text-slate-400 font-semibold">•</span>
                <span className="text-xs text-slate-600 font-bold">
                  Due {new Date(activeCycle.endDate).toLocaleDateString()}
                </span>
              </div>
              <h4 className="text-base font-black text-slate-800 mt-1">
                {activeCycle.name}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                {currentReview
                  ? `Your appraisal for this cycle is currently in ${currentReview.status} status.`
                  : "You have not started your self-assessment for this active cycle. Begin your assessment now."}
              </p>
            </div>
            <div className="shrink-0">
              {currentReview ? (
                <button
                  onClick={() => router.push(`/erp/employee/reviews/detail?id=${currentReview.id}`)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <span>{currentReview.status === "Draft" || currentReview.status === "Returned" ? "Continue Form" : "View Dossier"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleStartSelfAssessment}
                  disabled={isSubmittingNew}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <span>Start Assessment →</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Reviews Table */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Review Cycle
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Final Score
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {userReviews.length > 0 ? (
                  userReviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-slate-800 text-sm">
                          {rev.cycleName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {rev.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-semibold text-xs">
                        {getCyclePeriod(rev.cycleId)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(rev.status)}
                      </td>
                      <td className="px-6 py-4">
                        {rev.finalScore !== undefined && rev.finalScore !== null && rev.finalScore > 0 ? (
                          <span className="font-black text-slate-800 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-lg text-xs inline-block">
                            {rev.finalScore.toFixed(1)} / 10
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => router.push(`/erp/employee/reviews/detail?id=${rev.id}`)}
                          className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl text-xs transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>{rev.status === "Draft" || rev.status === "Returned" ? "Complete" : "View"}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-semibold text-sm">
                      No review records found for this account.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BusinessShell>
  );
}
