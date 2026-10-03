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
import { resolveAvatarUrl, getAvatarFallbackUrl } from "@/lib/avatar";
import { BusinessShell } from "@/components/business/BusinessShell";
import {
  UserCheck,
  Star,
  Award,
  CheckCircle2,
  ArrowRight,
  Store,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Sparkles,
  ClipboardList,
  Target,
  ShieldCheck,
} from "lucide-react";
import { useTenantProvisioning } from "@/lib/access-control";

export default function EmployeeDashboard() {
  const router = useRouter();
  const { isModuleProvisioned } = useTenantProvisioning();
  const { reviews, cycles, users, objectives, updateReview, isLoading } = useERPStore();
  const [currentUser, setCurrentUser] = useState<User>(() => getSignedInERPUser(users));
  const [userReviews, setUserReviews] = useState<PerformanceReview[]>([]);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  const hasShopModule = isModuleProvisioned("shop");

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

  // Find active cycle (case-insensitive status check)
  const activeCycle = cycles.find(
    (c) => c.status === "Active" || c.status?.toLowerCase() === "active"
  );

  // Match review for active cycle
  const currentReview = activeCycle
    ? findReviewForUser(userReviews, currentUser, activeCycle.id)
    : undefined;

  // Completed past reviews
  const completedReviews = userReviews.filter(
    (r) =>
      r.status === "HR Approved" ||
      r.status === "Closed" ||
      (r.finalScore !== undefined && r.finalScore !== null && r.finalScore > 0)
  );

  const latestCompletedReview = completedReviews[0];

  // Relevant competencies for this user's department
  const userCompetencies = objectives.filter(
    (o) =>
      o.type === "competency" ||
      !o.departments ||
      o.departments.length === 0 ||
      (currentUser.department && o.departments.includes(currentUser.department))
  );

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
      title={`Employee Portal — ${currentUser.name}`}
      subtitle={`${currentUser.department} • Self-appraisals, quarterly performance milestones, and competency progression.`}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Welcome Profile Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <img
              src={resolveAvatarUrl(currentUser.avatar, currentUser.name || currentUser.id)}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-100 shadow-sm"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getAvatarFallbackUrl(
                  currentUser.name || currentUser.id
                );
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-800">
                  Welcome Back, {currentUser.name}!
                </h2>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-blue-100">
                  {currentUser.role || "Employee"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {currentUser.department} • Manager:{" "}
                <strong className="text-slate-700">
                  {currentUser.managerName || "Company Leadership"}
                </strong>
                {currentUser.location && ` • Location: ${currentUser.location}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <Link
              href="/erp/employee/reviews"
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-all border border-slate-200 flex items-center gap-1.5"
            >
              <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
              <span>All Appraisals</span>
            </Link>
            <Link
              href="/erp/employee/profile"
              className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl text-xs transition-all border border-blue-100 flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>View Profile</span>
            </Link>
          </div>
        </div>

        {/* Cashier / POS Banner (if applicable) */}
        {hasShopModule && (currentUser.role === "cashier" || currentUser.role === "admin") && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold">Point of Sale Counter Terminal</h4>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Quick cashiering, customer checkout, and daily register reconciliation.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/erp/admin/shop/pos")}
              className="px-4 py-2 bg-white text-emerald-700 font-bold rounded-xl text-xs hover:bg-emerald-50 transition-colors cursor-pointer shrink-0"
            >
              Open POS Register →
            </button>
          </div>
        )}

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Active Cycle */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Active Cycle
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-base font-black text-slate-800 truncate" title={activeCycle?.name}>
                {activeCycle?.name || "No Active Cycle"}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {activeCycle ? (
                  currentReview ? (
                    <span className="text-blue-600 font-bold">
                      Status: {currentReview.status}
                    </span>
                  ) : (
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Self-Assessment Open
                    </span>
                  )
                ) : (
                  "Next cycle pending"
                )}
              </p>
            </div>
          </div>

          {/* 2. Latest Approved Rating */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Latest Score
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-800">
                  {latestCompletedReview?.finalScore !== undefined
                    ? `${latestCompletedReview.finalScore.toFixed(1)}`
                    : "—"}
                </h3>
                {latestCompletedReview?.finalScore !== undefined && (
                  <span className="text-xs font-bold text-slate-400">/ 10</span>
                )}
                {latestCompletedReview?.status === "HR Approved" && (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-100">
                    Approved
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1 truncate" title={latestCompletedReview?.cycleName}>
                {latestCompletedReview?.cycleName || "No finalized ratings yet"}
              </p>
            </div>
          </div>

          {/* 3. Completed Reviews */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Appraisals History
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-800">
                {userReviews.length}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {completedReviews.length} completed review{completedReviews.length === 1 ? "" : "s"} on file
              </p>
            </div>
          </div>

          {/* 4. Evaluated Competencies */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Core Metrics
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-800">
                {userCompetencies.length > 0 ? userCompetencies.length : "6"}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Role KPIs & Behavioural competencies
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid: Active Cycle Action Center (8 cols) & Side Intelligence (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Action Block (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Active Cycle Spotlight Box */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <h3 className="font-extrabold text-slate-800 text-base">
                    Active Appraisal Cycle
                  </h3>
                </div>
                {activeCycle && (
                  <span className="bg-blue-50 text-blue-700 text-xs font-extrabold px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-blue-600" />
                    Due {new Date(activeCycle.endDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {activeCycle ? (
                currentReview ? (
                  <div className="py-5 space-y-5">
                    {/* Review Header Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Review Cycle
                        </span>
                        <h4 className="font-black text-base text-slate-800 mt-0.5">
                          {currentReview.cycleName}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          Review ID: <span className="font-mono">{currentReview.id}</span>
                        </p>
                      </div>
                      <div className="self-start sm:self-auto">
                        {getStatusBadge(currentReview.status)}
                      </div>
                    </div>

                    {/* Status Feedback Notes */}
                    {currentReview.status === "Returned" && (
                      <div className="bg-red-50 text-red-800 text-xs font-semibold p-4 rounded-2xl border border-red-200">
                        <span className="font-extrabold block mb-1 flex items-center gap-1.5 text-red-900">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          Feedback from Manager:
                        </span>
                        "{currentReview.managerComments || "Please review and update your scores."}"
                      </div>
                    )}

                    {currentReview.status === "Submitted" && (
                      <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 text-xs font-medium text-blue-900">
                        <div className="flex items-center gap-2 font-bold text-blue-800 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          Self-Assessment Successfully Submitted
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          Your self-assessment has been received. Your reporting line manager is currently conducting calibration ratings and constructive feedback.
                        </p>
                      </div>
                    )}

                    {currentReview.status === "Manager Reviewed" && (
                      <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 text-xs font-medium text-indigo-900">
                        <div className="flex items-center gap-2 font-bold text-indigo-800 mb-1">
                          <UserCheck className="w-4 h-4 text-indigo-600" />
                          Manager Calibration Completed
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          Your line manager has concluded calibration and provided comments. The dossier is now awaiting final confirmation and approval by HR.
                        </p>
                      </div>
                    )}

                    {currentReview.status === "HR Approved" && (
                      <div className="bg-emerald-50 text-emerald-900 text-xs font-semibold p-4 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="font-extrabold text-sm block mb-1 text-emerald-800 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            Final Score Approved
                          </span>
                          <span className="text-slate-600">
                            Your performance appraisal for this cycle is fully approved and finalized.
                          </span>
                        </div>
                        <div className="text-center bg-emerald-600 text-white rounded-2xl p-3 min-w-24 shadow-sm shrink-0">
                          <p className="text-[10px] uppercase font-bold tracking-wider leading-none">
                            Approved Score
                          </p>
                          <p className="text-xl font-black mt-1 leading-none">
                            {currentReview.finalScore !== undefined ? currentReview.finalScore.toFixed(1) : "N/A"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action CTA Button */}
                    <div className="pt-2">
                      {(currentReview.status === "Draft" || currentReview.status === "Returned") && (
                        <button
                          onClick={() => router.push(`/erp/employee/reviews/detail?id=${currentReview.id}`)}
                          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-md shadow-blue-500/20 transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>{currentReview.status === "Returned" ? "Edit and Re-submit Review" : "Continue Self-Assessment Form"}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                      {(currentReview.status === "Submitted" || currentReview.status === "Manager Reviewed") && (
                        <button
                          onClick={() => router.push(`/erp/employee/reviews/detail?id=${currentReview.id}`)}
                          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
                        >
                          <FileText className="w-4 h-4 text-slate-500" />
                          <span>View Submitted Appraisal Dossier</span>
                        </button>
                      )}
                      {currentReview.status === "HR Approved" && (
                        <button
                          onClick={() => router.push(`/erp/employee/reviews/detail?id=${currentReview.id}`)}
                          className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-2xl shadow-md transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>View Final Appraisal Report</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Active cycle exists, but employee hasn't started self-assessment yet */
                  <div className="py-6 space-y-5">
                    <div className="p-5 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
                            Self-Appraisal Window Open
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-800 mt-1">
                          {activeCycle.name}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium mt-1 max-w-xl leading-relaxed">
                          Your participation is required. Complete your self-assessment to record your scores, task evidence, and career progression notes for this cycle.
                        </p>
                      </div>
                      <div className="shrink-0">
                        <span className="bg-white text-slate-700 font-extrabold text-xs px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm inline-block">
                          Due {new Date(activeCycle.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleStartSelfAssessment}
                      disabled={isSubmittingNew}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-md shadow-blue-500/25 transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{isSubmittingNew ? "Initializing Self-Assessment..." : "Start Performance Self-Assessment Now"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )
              ) : (
                <div className="py-10 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-700">
                    No Review Cycles Currently Active
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    All current performance appraisal cycles are closed. You will be notified when the next quarterly or annual evaluation window opens.
                  </p>
                </div>
              )}
            </div>

            {/* Previous Completed Appraisals & History Table */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">
                    Appraisal History & Past Reviews
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    Completed reviews, manager feedback, and approved scores
                  </p>
                </div>
                <Link
                  href="/erp/employee/reviews"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                >
                  <span>View All ({userReviews.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="mt-4 overflow-x-auto">
                {userReviews.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">
                        <th className="py-3 px-3">Review Cycle</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Final Score</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs">
                      {userReviews.map((rev) => (
                        <tr key={rev.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="font-black text-slate-800">{rev.cycleName}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {rev.id}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            {getStatusBadge(rev.status)}
                          </td>
                          <td className="py-3.5 px-3">
                            {rev.finalScore !== undefined && rev.finalScore !== null && rev.finalScore > 0 ? (
                              <span className="font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg text-xs inline-block">
                                {rev.finalScore.toFixed(1)} / 10
                              </span>
                            ) : (
                              <span className="text-slate-400 font-semibold">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              onClick={() => router.push(`/erp/employee/reviews/detail?id=${rev.id}`)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl text-xs transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <span>{rev.status === "Draft" || rev.status === "Returned" ? "Complete" : "View Dossier"}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-8 text-center text-slate-400 font-semibold text-xs">
                    No past reviews on record for this account.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side Intelligence Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Core Competencies Being Evaluated */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-extrabold text-slate-800 text-sm">
                  Evaluation Framework
                </h3>
                <span className="text-[10px] font-extrabold uppercase bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md">
                  {currentUser.department || "General"}
                </span>
              </div>
              <div className="mt-4 space-y-2.5">
                {[
                  { name: "Leadership & Accountability", cat: "Leadership", weight: "10%" },
                  { name: "Initiative & Perseverance", cat: "Behavioural", weight: "10%" },
                  { name: "Communication & Teamwork", cat: "Behavioural", weight: "10%" },
                  { name: "Work Ethics & Attendance", cat: "Culture", weight: "10%" },
                  { name: "Functional Department KPIs", cat: "Role Specific", weight: "40%" },
                  { name: "Continuous Self-Improvement", cat: "Development", weight: "10%" },
                ].map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between hover:bg-slate-100/60 transition-colors"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-700">{comp.name}</h5>
                      <span className="text-[10px] text-slate-400 font-semibold">{comp.cat}</span>
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                      {comp.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications & Live Updates */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
              <h3 className="font-extrabold text-slate-800 text-sm pb-2 border-b border-gray-100">
                Appraisal Updates
              </h3>
              
              <div className="space-y-3">
                {activeCycle && (
                  <div className="flex gap-3 p-3 bg-blue-50/60 rounded-2xl border border-blue-100">
                    <span className="w-2 h-2 rounded-full bg-blue-600 block mt-1.5 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">{activeCycle.name}</h5>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Active cycle is open. Deadline: {new Date(activeCycle.endDate).toLocaleDateString()}.
                      </p>
                    </div>
                  </div>
                )}

                {latestCompletedReview && (
                  <div className="flex gap-3 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 block mt-1.5 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">
                        {latestCompletedReview.cycleName} Finalized
                      </h5>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Approved score: {latestCompletedReview.finalScore?.toFixed(1)} / 10 ({latestCompletedReview.status}).
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-slate-400 block mt-1.5 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-700">Self-Service Profile</h5>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Ensure your designation and contact credentials in profile remain up to date.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 text-white shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Quick Shortcuts
              </h4>
              <div className="space-y-2">
                <Link
                  href="/erp/employee/reviews"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-all text-xs font-bold"
                >
                  <span className="flex items-center gap-2">
                    <ClipboardList className="w-3.5 h-3.5 text-blue-400" />
                    My Performance Reviews Table
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/erp/employee/quests"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-all text-xs font-bold"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Company Retreat Quests
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/erp/employee/profile"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-all text-xs font-bold"
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    My Career Profile & Growth
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BusinessShell>
  );
}
