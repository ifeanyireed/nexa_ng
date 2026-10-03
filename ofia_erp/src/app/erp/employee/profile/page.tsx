"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useERPStore,
  User,
  PerformanceReview,
  Objective,
  getSignedInERPUser,
} from "@/lib/erp-store";
import { resolveAvatarUrl, getAvatarFallbackUrl } from "@/lib/avatar";
import { BusinessShell } from "@/components/business/BusinessShell";
import {
  Award,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
  TrendingUp,
  UserCheck,
  ChevronRight,
  Star,
  MessageSquare,
  Target,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Calendar,
  Building2,
  Mail,
  BadgeCheck,
  ExternalLink,
  ClipboardList,
} from "lucide-react";

export default function EmployeeProfilePage() {
  const router = useRouter();
  const { reviews, cycles, users, isLoading } = useERPStore();
  const [currentUser, setCurrentUser] = useState<User>(() => getSignedInERPUser(users));
  const [profileUser, setProfileUser] = useState<User>(() => getSignedInERPUser(users));
  const [userReviews, setUserReviews] = useState<PerformanceReview[]>([]);
  const [selectedReviewId, setSelectedReviewId] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = getSignedInERPUser(users);
      setCurrentUser(active);

      // Check if there is an "id" query parameter in the URL
      const params = new URLSearchParams(window.location.search);
      const targetId = params.get("id");

      let resolvedUser = active;
      if (targetId && users.length > 0) {
        const found = users.find(
          (u) =>
            u.id.toLowerCase() === targetId.toLowerCase() ||
            (u.email && u.email.toLowerCase() === targetId.toLowerCase())
        );
        if (found) {
          resolvedUser = found;
        }
      }

      setProfileUser(resolvedUser);

      // Case-insensitive ID and Name matching for user reviews
      const userRevs = reviews.filter(
        (r) =>
          (resolvedUser.id &&
            r.employeeId &&
            r.employeeId.toLowerCase() === resolvedUser.id.toLowerCase()) ||
          (r.employeeName &&
            resolvedUser.name &&
            r.employeeName.toLowerCase().trim() === resolvedUser.name.toLowerCase().trim())
      );

      setUserReviews(userRevs);

      // Set default selected review to the latest completed/approved review
      if (userRevs.length > 0) {
        const sorted = [...userRevs].sort((a, b) => {
          const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return timeB - timeA;
        });
        const preferred =
          sorted.find(
            (r) =>
              r.status === "HR Approved" ||
              (r.finalScore !== undefined && r.finalScore !== null && r.finalScore > 0)
          ) || sorted[0];
        setSelectedReviewId(preferred.id);
      }
    }
  }, [reviews, users]);

  // Sorted user reviews (newest first for table/history listings)
  const sortedUserReviews = [...userReviews].sort((a, b) => {
    const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return timeB - timeA;
  });

  // Active selected review for deep-dive inspection
  const selectedReview =
    userReviews.find((r) => r.id === selectedReviewId) ||
    sortedUserReviews.find(
      (r) =>
        r.status === "HR Approved" ||
        (r.finalScore !== undefined && r.finalScore !== null && r.finalScore > 0)
    ) ||
    sortedUserReviews[0];

  // Parse objectives safely whether stored as array or JSON string
  const parseObjectives = (rev?: PerformanceReview): Objective[] => {
    if (!rev || !rev.objectives) return [];
    if (Array.isArray(rev.objectives)) return rev.objectives;
    if (typeof rev.objectives === "string") {
      try {
        return JSON.parse(rev.objectives);
      } catch {
        return [];
      }
    }
    return [];
  };

  const selectedObjectives = parseObjectives(selectedReview);

  // Group competencies and functional KPIs
  const competencies = selectedObjectives.filter(
    (o) => o.type === "competency" || (o.category && o.category !== "Functional")
  );
  const functionalKPIs = selectedObjectives.filter(
    (o) => o.type === "objective" || !o.type || o.category === "Functional"
  );

  // Completed reviews with finalized scores (newest first)
  const completedReviews = sortedUserReviews.filter(
    (r) =>
      r.status === "HR Approved" ||
      r.status === "Closed" ||
      (r.finalScore !== undefined && r.finalScore !== null && r.finalScore > 0)
  );

  const latestCompletedReview = completedReviews[0];

  // Date-specific certified milestone evaluations sorted chronologically (oldest to newest)
  const reviewsWithScores = userReviews
    .filter(
      (r) =>
        r.finalScore !== undefined &&
        r.finalScore !== null &&
        r.finalScore > 0 &&
        (r.status === "HR Approved" || r.status === "Closed")
    )
    .sort((a, b) => {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return timeA - timeB;
    });

  const milestones = reviewsWithScores.map((r, idx) => {
    const cycle = cycles.find((c) => c.id === r.cycleId);
    const dateSource = r.updatedAt || cycle?.endDate || "2025-01-01";
    const dateObj = new Date(dateSource);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const shortDate = !isNaN(dateObj.getTime())
      ? `${monthNames[dateObj.getMonth()]} '${String(dateObj.getFullYear()).slice(-2)}`
      : "N/A";
    const fullDate = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "Approved";

    const score = Number((r.finalScore || 0).toFixed(1));
    const prevScore = idx > 0 ? Number((reviewsWithScores[idx - 1].finalScore || 0).toFixed(1)) : null;
    const deltaFromPrev = prevScore !== null ? Number((score - prevScore).toFixed(1)) : null;

    return {
      reviewId: r.id,
      cycleId: r.cycleId,
      cycleName: r.cycleName,
      shortCycleName: r.cycleName.replace("Performance Cycle", "").replace("Review Cycle", "").trim(),
      dateObj,
      shortDate,
      fullDate,
      score,
      deltaFromPrev,
      status: r.status,
    };
  });

  const milestoneCount = milestones.length;
  const earliestMilestone = milestoneCount > 0 ? milestones[0] : null;
  const latestMilestone = milestoneCount > 0 ? milestones[milestoneCount - 1] : null;
  const netDelta =
    milestoneCount >= 2 && earliestMilestone && latestMilestone
      ? Number((latestMilestone.score - earliestMilestone.score).toFixed(1))
      : null;

  // Dynamic SVG plotting coordinates
  const minScore = milestoneCount > 0 ? Math.min(...milestones.map((m) => m.score), 6.0) : 6.0;
  const maxScore = milestoneCount > 0 ? Math.max(...milestones.map((m) => m.score), 10.0) : 10.0;
  const scoreSpan = Math.max(1.0, maxScore - minScore);

  const getMilestoneX = (index: number) => {
    if (milestoneCount <= 1) return 170;
    const padding = 45;
    return padding + index * ((340 - padding * 2) / (milestoneCount - 1));
  };

  const getMilestoneY = (score: number) => {
    const ratio = (score - minScore) / scoreSpan;
    return 82 - ratio * 54;
  };

  const linePath =
    milestoneCount >= 2
      ? milestones
          .map((m, i) => `${i === 0 ? "M" : "L"} ${getMilestoneX(i).toFixed(1)} ${getMilestoneY(m.score).toFixed(1)}`)
          .join(" ")
      : "";

  const areaPath =
    milestoneCount >= 2
      ? `${linePath} L ${getMilestoneX(milestoneCount - 1).toFixed(1)} 96 L ${getMilestoneX(0).toFixed(1)} 96 Z`
      : "";

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
      default:
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  return (
    <BusinessShell
      title={`Employee Profile — ${profileUser.name}`}
      subtitle={`${profileUser.department} • Appraisal dossier details, competency calibrations, and performance progression.`}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <img
              src={resolveAvatarUrl(profileUser.avatar, profileUser.name || profileUser.id)}
              alt={profileUser.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-50 shadow-sm"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getAvatarFallbackUrl(
                  profileUser.name || profileUser.id
                );
              }}
            />
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl font-black text-slate-800 leading-tight">
                  {profileUser.name}
                </h2>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-blue-100">
                  {profileUser.role || "Employee"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                {profileUser.department}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-3 text-xs text-slate-500 font-semibold justify-center sm:justify-start">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {profileUser.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-slate-400" />
                  ID: <span className="font-mono">{profileUser.id}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl min-w-48 text-center self-stretch sm:self-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Reporting Line Manager
              </span>
              <span className="text-sm font-black text-blue-700 mt-0.5 block">
                {profileUser.managerName || "Company Leadership"}
              </span>
            </div>
            <Link
              href="/erp/employee/reviews"
              className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs transition-all border border-slate-200 flex items-center justify-center gap-1.5 self-stretch sm:self-auto"
            >
              <ClipboardList className="w-4 h-4 text-slate-500" />
              <span>All Appraisals</span>
            </Link>
          </div>
        </div>

        {/* 4 Score Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Latest Approved Score */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Approved Rating
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-800">
                  {latestCompletedReview?.finalScore !== undefined
                    ? latestCompletedReview.finalScore.toFixed(1)
                    : "—"}
                </h3>
                {latestCompletedReview?.finalScore !== undefined && (
                  <span className="text-xs font-bold text-slate-400">/ 10</span>
                )}
                {latestCompletedReview && (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-100">
                    HR Approved
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1 truncate" title={latestCompletedReview?.cycleName}>
                {latestCompletedReview?.cycleName || "No approved score yet"}
              </p>
            </div>
          </div>

          {/* Card 2: Competency Score Average */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Core Competencies
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-800">
                  {competencies.length > 0
                    ? `${(
                        competencies.reduce((acc, c) => acc + (c.managerScore || c.selfScore || 4), 0) /
                        competencies.length
                      ).toFixed(1)}`
                    : "4.5"}
                </h3>
                <span className="text-xs font-bold text-slate-400">/ 5.0</span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {competencies.length} behavioural & leadership traits
              </p>
            </div>
          </div>

          {/* Card 3: Appraisals Completed */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Completed Cycles
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-800">
                {completedReviews.length}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Total appraisals recorded: {userReviews.length}
              </p>
            </div>
          </div>

          {/* Card 4: Review Dossier Status */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Previous Cycle
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-base font-black text-slate-800 truncate" title={selectedReview?.cycleName}>
                {selectedReview ? selectedReview.cycleName : "No Reviews"}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {selectedReview ? (
                  <span className="text-emerald-600 font-bold">
                    Status: {selectedReview.status}
                  </span>
                ) : (
                  "Pending evaluation"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Review Dossier Section */}
        {selectedReview ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
            {/* Dossier Header & Cycle Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
                    Appraisal Dossier Details
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-800 mt-1">
                  {selectedReview.cycleName}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Dossier ID: <span className="font-mono">{selectedReview.id}</span> • Department: {selectedReview.department}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* If user has multiple review cycles, render cycle switcher pills */}
                {userReviews.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                    {sortedUserReviews.map((rev) => (
                      <button
                        key={rev.id}
                        onClick={() => setSelectedReviewId(rev.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedReview?.id === rev.id
                            ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {rev.cycleName.replace("Performance Cycle", "").replace("Review Cycle", "").trim()}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedReview.status)}
                  <Link
                    href={`/erp/employee/reviews/detail?id=${selectedReview.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <span>Full Dossier</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Score & Evaluation Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Final Approved Rating
                  </span>
                  <span className="text-2xl font-black text-slate-800 mt-0.5 block">
                    {selectedReview.finalScore !== undefined ? `${selectedReview.finalScore.toFixed(1)} / 10` : "—"}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                  {selectedReview.finalScore !== undefined && selectedReview.finalScore >= 8.5
                    ? "A+"
                    : selectedReview.finalScore !== undefined && selectedReview.finalScore >= 7.5
                    ? "A"
                    : "B"}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Evaluated Objectives
                  </span>
                  <span className="text-2xl font-black text-slate-800 mt-0.5 block">
                    {selectedObjectives.length} Metrics
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                  {functionalKPIs.length} KPIs
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Dossier Verification
                  </span>
                  <span className="text-sm font-extrabold text-slate-800 mt-1 block">
                    {selectedReview.status === "HR Approved" ? "Verified & Concluded" : selectedReview.status}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* 2-Column Feedback & Commentary Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Manager Calibration Comments */}
              <div className="bg-slate-50/70 p-5 rounded-3xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Line Manager Calibration Notes
                    </h4>
                  </div>
                  <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {profileUser.managerName || "Manager Feedback"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
                  {selectedReview.managerComments
                    ? `"${selectedReview.managerComments}"`
                    : "The line manager completed evaluation scoring for this appraisal cycle."}
                </p>
              </div>

              {/* Employee Self-Reflection */}
              <div className="bg-slate-50/70 p-5 rounded-3xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Employee Self-Appraisal Submission
                    </h4>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Self-Assessment
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
                  {selectedReview.employeeComments
                    ? `"${selectedReview.employeeComments}"`
                    : "Self-assessment ratings and achievements recorded for this appraisal cycle."}
                </p>
              </div>

              {/* HR Verification Comments (if present) */}
              {selectedReview.hrComments && (
                <div className="bg-slate-50/70 p-5 rounded-3xl border border-slate-200/80 space-y-3 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                        Human Resources Verification & Sign-Off
                      </h4>
                    </div>
                    <span className="text-[10px] font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                      HR Department
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
                    "{selectedReview.hrComments}"
                  </p>
                </div>
              )}

              {/* Improvement & Development Plan */}
              {selectedReview.improvementPlan && (
                <div className="bg-amber-50/60 p-5 rounded-3xl border border-amber-200/70 space-y-3 lg:col-span-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                      Career Development & Progression Plan
                    </h4>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed font-medium bg-white/80 p-4 rounded-2xl border border-amber-100">
                    "{selectedReview.improvementPlan}"
                  </p>
                </div>
              )}
            </div>

            {/* Individual Objectives & Competencies Breakdown */}
            {selectedObjectives.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    Evaluated Competencies & KPI Breakdown ({selectedObjectives.length})
                  </h4>
                  <span className="text-xs text-slate-400 font-semibold">
                    Weights & Calibration Scores
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {selectedObjectives.map((obj, i) => (
                    <div
                      key={obj.id || i}
                      className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2 hover:bg-slate-100/60 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 inline-block">
                            {obj.category || (obj.type === "competency" ? "Competency" : "KPI")}
                          </span>
                          <h5 className="text-xs font-bold text-slate-800 mt-1">
                            {obj.text}
                          </h5>
                        </div>
                        {obj.weight && (
                          <span className="text-[11px] font-black text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shrink-0">
                            {obj.weight}%
                          </span>
                        )}
                      </div>

                      {/* Ratings comparison */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-400">Self Rating:</span>
                          <strong className="text-slate-700">
                            {obj.selfScore !== undefined ? obj.selfScore : "—"}
                          </strong>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-400">Manager Rating:</span>
                          <strong className="text-blue-700 font-black">
                            {obj.managerScore !== undefined ? obj.managerScore : "—"}
                          </strong>
                        </div>
                      </div>

                      {/* Feedback snippet if any */}
                      {(obj.managerFeedback || obj.comments) && (
                        <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-xl border border-slate-100 mt-1">
                          {obj.managerFeedback ? `Manager: "${obj.managerFeedback}"` : `Self: "${obj.comments}"`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center space-y-2 border border-gray-100 shadow-sm">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-extrabold text-slate-700">
              No Previous Review Dossier Found
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You do not have any completed performance reviews on file yet. Once your self-assessment for the active cycle is evaluated and finalized, your score and calibration details will appear here.
            </p>
          </div>
        )}

        {/* Details & Trend Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Performance Trend Chart (7 cols) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Historical Rating Progression
                  </h3>
                </div>
                {milestoneCount >= 2 && (
                  <div className="flex items-center gap-2">
                    {netDelta !== null && netDelta > 0 && (
                      <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span>+{netDelta} pts</span>
                        <span>Trajectory Growth</span>
                      </span>
                    )}
                    {netDelta !== null && netDelta < 0 && (
                      <span className="text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span>{netDelta} pts</span>
                        <span>Trajectory Shift</span>
                      </span>
                    )}
                    {netDelta !== null && netDelta === 0 && (
                      <span className="text-[10px] font-extrabold bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full">
                        Stable Trajectory
                      </span>
                    )}
                    <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">
                      {milestones.length} Cycles
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-slate-400 font-semibold">
                  {milestoneCount >= 2 && earliestMilestone && latestMilestone
                    ? `${earliestMilestone.shortDate} – ${latestMilestone.shortDate} • Certified evaluation trajectory`
                    : "Chronological rating progression from certified evaluation cycles"}
                </p>
                {milestoneCount > 0 && (
                  <span className="text-[10px] font-bold text-slate-400">
                    Scale: 1.0 – 10.0
                  </span>
                )}
              </div>
            </div>

            {/* SVG Sparkline or Single / Empty Milestone State */}
            {milestoneCount >= 2 ? (
              <div className="h-48 w-full mt-4 flex flex-col justify-between">
                <div className="flex-1 w-full relative">
                  <svg viewBox="0 0 340 120" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Reference baseline guidelines */}
                    <line
                      x1="25"
                      y1={getMilestoneY(minScore)}
                      x2="315"
                      y2={getMilestoneY(minScore)}
                      stroke="#F1F5F9"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                    <line
                      x1="25"
                      y1={getMilestoneY(maxScore)}
                      x2="315"
                      y2={getMilestoneY(maxScore)}
                      stroke="#F1F5F9"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />

                    {/* Area fill */}
                    {areaPath && <path d={areaPath} fill="url(#trendGrad)" />}

                    {/* Graph Line */}
                    {linePath && (
                      <path
                        d={linePath}
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Rating dots */}
                    {milestones.map((m, i) => {
                      const cx = getMilestoneX(i);
                      const cy = getMilestoneY(m.score);
                      const isSelected = selectedReview?.id === m.reviewId;
                      return (
                        <g
                          key={m.reviewId}
                          onClick={() => setSelectedReviewId(m.reviewId)}
                          className="cursor-pointer group"
                        >
                          {/* Outer highlight ring on hover or when selected */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isSelected ? "11" : "8"}
                            fill={isSelected ? "#DBEAFE" : "transparent"}
                            className="transition-all duration-200 group-hover:fill-blue-100"
                          />

                          {/* Main node dot */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r="5.5"
                            fill={isSelected ? "#1D4ED8" : "#2563EB"}
                            stroke="#FFFFFF"
                            strokeWidth="2.5"
                            className="transition-all duration-200 shadow-sm"
                          />

                          {/* Score badge above node */}
                          <rect
                            x={cx - 16}
                            y={cy - 24}
                            width="32"
                            height="16"
                            rx="8"
                            fill={isSelected ? "#1E293B" : "#F8FAFC"}
                            stroke={isSelected ? "#0F172A" : "#CBD5E1"}
                            strokeWidth="1"
                          />
                          <text
                            x={cx}
                            y={cy - 13}
                            textAnchor="middle"
                            className={`text-[9.5px] font-black ${
                              isSelected ? "fill-white" : "fill-slate-800"
                            }`}
                          >
                            {m.score.toFixed(1)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="flex justify-between items-start text-center px-1 mt-2 pt-2 border-t border-slate-100">
                  {milestones.map((m) => {
                    const isSelected = selectedReview?.id === m.reviewId;
                    return (
                      <button
                        key={m.reviewId}
                        type="button"
                        onClick={() => setSelectedReviewId(m.reviewId)}
                        className={`flex flex-col items-center flex-1 transition-all p-1 rounded-xl cursor-pointer ${
                          isSelected ? "bg-blue-50/80" : "hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`text-[11px] font-black tracking-tight ${
                            isSelected ? "text-blue-700 font-extrabold" : "text-slate-700"
                          }`}
                        >
                          {m.shortDate}
                        </span>
                        <span className="text-[9.5px] font-bold text-slate-400 truncate max-w-[85px]">
                          {m.shortCycleName}
                        </span>
                        {m.deltaFromPrev !== null && (
                          <span
                            className={`text-[9px] font-black mt-0.5 ${
                              m.deltaFromPrev > 0
                                ? "text-emerald-600"
                                : m.deltaFromPrev < 0
                                ? "text-amber-600"
                                : "text-slate-400"
                            }`}
                          >
                            {m.deltaFromPrev > 0 ? `+${m.deltaFromPrev}` : m.deltaFromPrev}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : milestoneCount === 1 ? (
              <div className="py-6 px-4 my-auto bg-slate-50/60 rounded-2xl border border-slate-100 flex flex-col items-center text-center mt-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-800">
                    {milestones[0].score.toFixed(1)} / 10
                  </span>
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Approved
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700 mt-1">
                  {milestones[0].cycleName}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Calibrated on {milestones[0].fullDate}</span>
                </div>
                <p className="text-[11px] text-slate-400 max-w-sm mt-3 leading-relaxed">
                  One official evaluation on file. Multi-cycle trajectory curves and progression slopes will plot automatically upon completion of the active 2026 cycle.
                </p>
              </div>
            ) : (
              <div className="py-8 px-4 my-auto bg-slate-50/60 rounded-2xl border border-slate-100 flex flex-col items-center text-center mt-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  No Finalized Appraisals on Record
                </h4>
                <p className="text-[11px] text-slate-400 max-w-sm mt-1 leading-relaxed">
                  Historical rating progression is plotted strictly from certified HR-approved review cycles. Active appraisal (2026 Mid-Year) concludes on Aug 31, 2026.
                </p>
              </div>
            )}
          </div>

          {/* Review History Summary Card (5 cols) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-slate-800 text-sm">
                  All Recorded Cycles
                </h3>
              </div>
              <Link
                href="/erp/employee/reviews"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View Full Table</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-64">
              {sortedUserReviews.length > 0 ? (
                sortedUserReviews.map((rev) => {
                  const cycle = cycles.find((c) => c.id === rev.cycleId);
                  const dateSource = rev.updatedAt || cycle?.endDate;
                  const formattedDate = dateSource
                    ? new Date(dateSource).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : rev.status === "Draft"
                    ? "In Progress"
                    : "Pending";

                  return (
                    <div
                      key={rev.id}
                      onClick={() => setSelectedReviewId(rev.id)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        selectedReview?.id === rev.id
                          ? "bg-blue-50/60 border-blue-200 shadow-2xs"
                          : "bg-gray-50/80 border-gray-100 hover:bg-gray-100/70"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs font-black text-slate-800 truncate">
                          {rev.cycleName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            {rev.status}
                          </span>
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-[10px] font-medium text-slate-500">
                            {rev.status === "HR Approved" || rev.status === "Closed"
                              ? `Calibrated ${formattedDate}`
                              : `Due ${cycle?.endDate || "Aug 31, 2026"}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        {rev.finalScore !== undefined && rev.finalScore !== null && rev.finalScore > 0 ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-black px-2.5 py-1 rounded-xl text-xs">
                            {rev.finalScore.toFixed(1)} / 10
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-bold px-2">—</span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 font-semibold text-xs">
                  No review records found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BusinessShell>
  );
}
