"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useERPStore, PerformanceReview, User, formatSelfAverage, getSignedInERPUser, findReviewForUser } from "@/lib/erp-store";
import { resolveAvatarUrl, getAvatarFallbackUrl } from "@/lib/avatar";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { Users, Star, Clock, CheckCircle2, ArrowRight, UserCheck } from "lucide-react";
import { useTenantProvisioning } from "@/lib/access-control";

export default function ManagerDashboard() {
  const router = useRouter();
  const { isModuleProvisioned } = useTenantProvisioning();
  const { reviews, users, cycles, isLoading } = useERPStore();
  const [currentUser, setCurrentUser] = useState<User>(() => getSignedInERPUser(users));
  const [selectedCycleId, setSelectedCycleId] = useState<string>("ACTIVE");

  const hasHrModule = isModuleProvisioned("hr");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = getSignedInERPUser(users);
      setCurrentUser(active);
    }
  }, [users]);

  const activeCycle = cycles.find((c) => c.status === "Active") || cycles[0];
  const effectiveCycleId = selectedCycleId === "ALL" ? null : (selectedCycleId === "ACTIVE" ? activeCycle?.id : selectedCycleId);

  // Filter reviews of employees who report to this manager
  const reportingEmployees = users.filter((u) => {
    if (u.id === currentUser.id) return false;
    const matchesManagerName = Boolean(u.managerName && currentUser.name && u.managerName.toLowerCase().trim() === currentUser.name.toLowerCase().trim());
    const matchesManagerId = Boolean(u.managerId && currentUser.id && u.managerId === currentUser.id);
    const isLeadership = currentUser.role === "md" || currentUser.role === "admin";
    
    return matchesManagerName || matchesManagerId || isLeadership;
  });

  const allTeamReviews = reviews.filter(r =>
    reportingEmployees.some(u => u.id === r.employeeId || (u.name && r.employeeName && u.name.toLowerCase().trim() === r.employeeName.toLowerCase().trim()))
  );

  const teamReviews = allTeamReviews.filter(r =>
    !effectiveCycleId || r.cycleId === effectiveCycleId
  );

  const pendingApprovals = teamReviews.filter(r => r.status === "Submitted");
  const completedReviews = teamReviews.filter(r => r.status === "HR Approved" || r.status === "Manager Reviewed");

  // Calculate statistics (Option A: submitted/calibrated evaluations out of active cycle reviews)
  const totalEvaluationsCount = teamReviews.length;
  const completedCount = teamReviews.filter(r => ["Submitted", "Manager Reviewed", "HR Approved"].includes(r.status)).length;
  const completionPercentage = totalEvaluationsCount > 0 ? (completedCount / totalEvaluationsCount) * 100 : 0;

  // Average team score
  const gradedReviews = teamReviews.filter(r => r.finalScore != null && r.finalScore > 0);
  const averageTeamScore = gradedReviews.length > 0
    ? (gradedReviews.reduce((sum, r) => sum + (r.finalScore || 0), 0) / gradedReviews.length).toFixed(1)
    : "N/A";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">Draft</span>;
      case "Submitted":
        return <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">Awaiting My Review</span>;
      case "Manager Reviewed":
        return <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">Awaiting HR Audit</span>;
      case "HR Approved":
        return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">Completed</span>;
      case "Returned":
        return <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">Revision Requested</span>;
      case "Closed":
        return <span className="bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">Closed</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  return (
    <BusinessShell
      title={`Line Manager Desk — ${currentUser.name}`}
      subtitle={`${currentUser.department} • Team self-appraisal submissions, scoring verification, and performance feedback.`}
      isLoading={isLoading}
      action={
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500">Cycle:</span>
          <select
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="ACTIVE">Active Cycle ({activeCycle ? activeCycle.name.split(" ")[0] : "None"})</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.status})
              </option>
            ))}
            <option value="ALL">All Cycles</option>
          </select>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* QUICK LINK TO EMPLOYEE PORTAL */}
        <div className="bg-blue-50 border border-blue-200/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Line Manager + Employee Access</h4>
              <p className="text-xs text-slate-500 mt-0.5">As a manager, you have access to both your team management tools and your personal employee self-service desk.</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/erp/employee")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
          >
            Open My Employee Portal →
          </button>
        </div>

        {hasHrModule ? (
          <>
            {/* Statistics Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Team Completion Rate</span>
                <h2 className="text-2xl font-black text-slate-800 mt-1">{completionPercentage.toFixed(0)}%</h2>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${completionPercentage}%` }} />
                  </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Average Team Score</span>
                <h2 className="text-2xl font-black text-slate-800 mt-1">{averageTeamScore} <span className="text-xs text-slate-400 font-bold">/ 10</span></h2>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Based on graded reviews</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Pending Team Assessments</span>
                <h2 className="text-2xl font-black text-amber-600 mt-1">{pendingApprovals.length} <span className="text-xs text-slate-400 font-bold">Awaiting Action</span></h2>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Ready for Manager evaluation</p>
              </div>
            </section>

            {/* Pending Approvals Table */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-150">
                <h3 className="font-bold text-slate-800 text-sm">Team Reviews Awaiting My Evaluation</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Employee</th>
                      <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Department</th>
                      <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Review Cycle</th>
                      <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Self-Score Average</th>
                      <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingApprovals.length > 0 ? (
                      pendingApprovals.map((rev) => {
                        const emp = users.find(u => u.id === rev.employeeId);
                        const selfAvg = formatSelfAverage(rev);
                        return (
                          <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 flex items-center gap-3">
                              <img
                                src={resolveAvatarUrl(emp?.avatar, rev.employeeName || rev.employeeId)}
                                alt={rev.employeeName}
                                className="w-8 h-8 rounded-full object-cover border border-[var(--nexa-border)] shadow-xs"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = getAvatarFallbackUrl(rev.employeeName || rev.employeeId);
                                }}
                              />
                              <div>
                                <p className="font-bold text-slate-800 text-xs">{rev.employeeName}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{rev.employeeId}</p>
                              </div>
                            </td>
                            <td className="py-4 text-xs font-semibold text-slate-500">{rev.department}</td>
                            <td className="py-4 text-xs font-semibold text-slate-500">{rev.cycleName.split(" ")[0]}</td>
                            <td className="py-4">
                              {selfAvg !== "—" ? (
                                <span className="bg-blue-50 text-blue-700 font-black px-2 py-0.5 rounded text-xs">{selfAvg} / 10</span>
                              ) : (
                                <span className="text-slate-400 font-semibold text-xs">—</span>
                              )}
                            </td>
                            <td className="py-4">
                              <button
                                onClick={() => router.push(`/erp/manager/review/detail?id=${rev.id}&cycleId=${rev.cycleId}&employeeId=${rev.employeeId}`)}
                                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                              >
                                Evaluate Performance
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400 font-semibold text-xs">
                          No reviews currently awaiting your evaluation.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* All Team Members Overview */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-150">
                <h3 className="font-bold text-slate-800 text-sm">All Team Members Review Progress</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Employee</th>
                      <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Department</th>
                      <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Status</th>
                      <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Final Score</th>
                      <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportingEmployees.map((emp, idx) => {
                      const targetCycleId = effectiveCycleId || activeCycle?.id;
                      const rev = findReviewForUser(teamReviews, emp, targetCycleId) || findReviewForUser(reviews, emp, targetCycleId);
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 flex items-center gap-3">
                            <img
                              src={resolveAvatarUrl(emp.avatar, emp.name || emp.id, idx)}
                              alt={emp.name}
                              className="w-8 h-8 rounded-full object-cover border border-[var(--nexa-border)] shadow-xs"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = getAvatarFallbackUrl(emp.name || emp.id, idx);
                              }}
                            />
                            <div>
                              <p className="font-bold text-slate-800 text-xs">{emp.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{emp.id}</p>
                            </div>
                          </td>
                          <td className="py-4 text-xs font-semibold text-slate-500">{emp.department}</td>
                          <td className="py-4">
                            {rev ? getStatusBadge(rev.status) : <span className="bg-gray-150 text-gray-500 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">Not Started</span>}
                          </td>
                          <td className="py-4">
                            {rev?.finalScore ? (
                              <span className="bg-emerald-50 text-emerald-700 font-black px-2 py-0.5 rounded text-xs">{rev.finalScore.toFixed(1)} / 10</span>
                            ) : (
                              <span className="text-slate-400 font-semibold text-xs">—</span>
                            )}
                          </td>
                          <td className="py-4">
                            {rev ? (
                              <button
                                onClick={() => router.push(rev.status === "Submitted" ? `/erp/manager/review/detail?id=${rev.id}&cycleId=${rev.cycleId}&employeeId=${emp.id}` : `/erp/employee/reviews/detail?id=${rev.id}`)}
                                className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-slate-650 font-bold rounded-xl text-xs transition-all border border-gray-200 cursor-pointer"
                              >
                                View
                              </button>
                            ) : (
                              <span className="text-slate-400 text-xs font-semibold">No active cycle form</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* When HR module is not in the workspace, show the Team Members Roster directly */
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-150">
              <h3 className="font-bold text-slate-800 text-sm">Reporting Team Roster ({reportingEmployees.length} Members)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Employee</th>
                    <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Department</th>
                    <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Role / Designation</th>
                    <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportingEmployees.map((emp, idx) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 flex items-center gap-3">
                        <img
                          src={resolveAvatarUrl(emp.avatar, emp.name || emp.id, idx)}
                          alt={emp.name}
                          className="w-8 h-8 rounded-full object-cover border border-[var(--nexa-border)] shadow-xs"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = getAvatarFallbackUrl(emp.name || emp.id, idx);
                          }}
                        />
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{emp.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{emp.email}</p>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-semibold text-slate-500">{emp.department}</td>
                      <td className="py-4 text-xs font-bold text-slate-700">{emp.designation || emp.role}</td>
                      <td className="py-4 text-xs font-medium text-slate-500">{emp.location || "Office"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </BusinessShell>
  );
}
