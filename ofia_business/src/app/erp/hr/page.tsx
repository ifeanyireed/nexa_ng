"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useERPStore, PerformanceReview, User } from "@/lib/erp-store";
import ERPLayout from "@/components/nets_erp/Layout";
import StatCards from "@/components/nets_erp/StatCards";

export default function HRDashboard() {
  const router = useRouter();
  const { reviews, users, cycles } = useERPStore();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [queuePage, setQueuePage] = useState(1);
  const [submissionsStatusFilter, setSubmissionsStatusFilter] = useState("");
  const [submissionsDeptFilter, setSubmissionsDeptFilter] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    const stored = localStorage.getItem("erp_current_user");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  const departmentsList = Array.from(new Set(reviews.map(r => r.department))).filter(Boolean).sort();

  // Filter reviews awaiting HR action (status = "Manager Reviewed")
  const pendingReviews = reviews.filter(r => r.status === "Manager Reviewed");
  const completedReviews = reviews.filter(r => r.status === "HR Approved");

  // Statistics
  const activeCycle = cycles.find(c => c.status === "Active");
  const activeCycleReviews = activeCycle
    ? reviews.filter(r => r.cycleId === activeCycle.id)
    : reviews.filter(r => r.cycleId === "CYC001");
  const totalEvaluations = activeCycleReviews.length;
  const cycleSubmitted = activeCycleReviews.filter(r => ["Submitted", "Manager Reviewed", "HR Approved"].includes(r.status)).length;
  const companyCompletionRate = totalEvaluations > 0 ? (cycleSubmitted / totalEvaluations) * 100 : 0;
  const finalScoreAverages = completedReviews.map(r => r.finalScore).filter((s): s is number => s !== undefined);
  const companyAverageRating = finalScoreAverages.length > 0
    ? (finalScoreAverages.reduce((a, b) => a + b, 0) / finalScoreAverages.length).toFixed(1)
    : "N/A";

  // Filter all submissions
  const filteredReviews = reviews.filter(r => {
    const matchesStatus = submissionsStatusFilter === "" || r.status === submissionsStatusFilter;
    const matchesDept = submissionsDeptFilter === "" || r.department === submissionsDeptFilter;
    return matchesStatus && matchesDept;
  });

  const submissionsTotalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  
  useEffect(() => {
    if (submissionsPage > submissionsTotalPages && submissionsTotalPages > 0) {
      setSubmissionsPage(submissionsTotalPages);
    }
  }, [submissionsTotalPages, submissionsPage]);

  const submissionsStartIndex = (submissionsPage - 1) * itemsPerPage;
  const paginatedReviews = filteredReviews.slice(submissionsStartIndex, submissionsStartIndex + itemsPerPage);

  const queueTotalPages = Math.ceil(pendingReviews.length / itemsPerPage);
  
  useEffect(() => {
    if (queuePage > queueTotalPages && queueTotalPages > 0) {
      setQueuePage(queueTotalPages);
    }
  }, [queueTotalPages, queuePage]);

  const queueStartIndex = (queuePage - 1) * itemsPerPage;
  const paginatedPendingReviews = pendingReviews.slice(queueStartIndex, queueStartIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">Draft</span>;
      case "Submitted":
        return <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">Awaiting Mgr Evaluation</span>;
      case "Manager Reviewed":
        return <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">Awaiting HR Audit</span>;
      case "HR Approved":
        return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">HR Approved</span>;
      case "Returned":
        return <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">Returned</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  if (!currentUser) return null;

  return (
    <ERPLayout>
      <div className="flex flex-col gap-6">
        
        {/* Top Stat Cards */}
        <StatCards />
        
        {/* KPI Panel */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Company Completion Rate</span>
            <h2 className="text-2xl font-black text-slate-800 mt-1">{companyCompletionRate.toFixed(0)}%</h2>
              <div className="w-full bg-gray-150 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${companyCompletionRate}%` }} />
              </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Company Average Score</span>
            <h2 className="text-2xl font-black text-slate-800 mt-1">{companyAverageRating} <span className="text-xs text-slate-400 font-bold">/ 10</span></h2>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Based on approved audits</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wide">Awaiting HR Audit</span>
            <h2 className="text-2xl font-black text-blue-600 mt-1">{pendingReviews.length} <span className="text-xs text-slate-400 font-bold">Awaiting Action</span></h2>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Ready for HR final sign-off</p>
          </div>
        </section>

        {/* HR Queue Table */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-150">
            <h3 className="font-bold text-slate-800 text-sm">Review Queue Awaiting HR Verification</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Employee</th>
                  <th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Department</th>
                  <th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Manager Score</th>
                  <th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedPendingReviews.length > 0 ? (
                  paginatedPendingReviews.map((rev) => {
                    const emp = users.find(u => u.id === rev.employeeId);
                    return (
                      <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 flex items-center gap-3">
                          <img src={emp?.avatar || "/character1.jpg"} alt={rev.employeeName} className="w-8 h-8 rounded-full object-cover border" />
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{rev.employeeName}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{rev.employeeId}</p>
                          </div>
                        </td>
                        <td className="py-4 text-xs font-semibold text-slate-500">{rev.department}</td>
                        <td className="py-4">
                          {rev.finalScore !== undefined ? (
                            <span className="bg-blue-50 text-blue-800 font-black px-2.5 py-0.5 rounded text-xs">
                              {rev.finalScore.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-semibold text-xs">—</span>
                          )}
                        </td>
                        <td className="py-4">
                          {getStatusBadge(rev.status)}
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => router.push(`/hr/review/detail?employeeId=${rev.employeeId}`)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                          >
                            Audit & Sign-off
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 font-semibold text-xs">
                      No reviews currently in HR verification queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Queue Pagination controls */}
          {queueTotalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-2">
              <p className="text-[11px] text-slate-455 font-bold">
                Showing {queueStartIndex + 1} to {Math.min(queueStartIndex + itemsPerPage, pendingReviews.length)} of {pendingReviews.length} reviews
              </p>
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setQueuePage(prev => Math.max(prev - 1, 1))}
                  disabled={queuePage === 1}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-slate-700 disabled:opacity-40 disabled:hover:bg-gray-50 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                {Array.from({ length: queueTotalPages }, (_, i) => i + 1).map(page => {
                  const shouldShow = page === 1 || page === queueTotalPages || Math.abs(page - queuePage) <= 1;
                  if (!shouldShow) {
                    if (page === 2 || page === queueTotalPages - 1) {
                      return <span key={`dots-${page}`} className="text-[10px] text-slate-400 font-bold px-1">...</span>;
                    }
                    return null;
                  }
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setQueuePage(page)}
                      className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                        queuePage === page
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white border border-gray-200 text-slate-600 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setQueuePage(prev => Math.min(prev + 1, queueTotalPages))}
                  disabled={queuePage === queueTotalPages}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-slate-700 disabled:opacity-40 disabled:hover:bg-gray-50 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>        {/* All Reviews Progress Standings */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-gray-150">
            <h3 className="font-bold text-slate-800 text-sm">All Company Review Submissions</h3>
            
            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Department Filter */}
              <select
                value={submissionsDeptFilter}
                onChange={(e) => {
                  setSubmissionsDeptFilter(e.target.value);
                  setSubmissionsPage(1);
                }}
                className="pl-3 pr-8 py-1.5 bg-gray-50 border border-gray-200 text-slate-700 font-bold rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="">All Departments</option>
                {departmentsList.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={submissionsStatusFilter}
                onChange={(e) => {
                  setSubmissionsStatusFilter(e.target.value);
                  setSubmissionsPage(1);
                }}
                className="pl-3 pr-8 py-1.5 bg-gray-50 border border-gray-200 text-slate-700 font-bold rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Awaiting Mgr Evaluation</option>
                <option value="Manager Reviewed">Awaiting HR Audit</option>
                <option value="HR Approved">HR Approved</option>
                <option value="Returned">Returned</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Employee</th>
                  <th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Department</th>
                  <th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Score</th>
                  <th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedReviews.length > 0 ? (
                  paginatedReviews.map((rev) => {
                    const emp = users.find(u => u.id === rev.employeeId);
                    return (
                      <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 flex items-center gap-3">
                          <img src={emp?.avatar || "/character1.jpg"} alt={rev.employeeName} className="w-8 h-8 rounded-full object-cover border" />
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{rev.employeeName}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{rev.employeeId}</p>
                          </div>
                        </td>
                        <td className="py-4 text-xs font-semibold text-slate-500">{rev.department}</td>
                        <td className="py-4">{getStatusBadge(rev.status)}</td>
                        <td className="py-4">
                          {rev.finalScore ? (
                            <span className="font-black text-slate-700 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-xs">{rev.finalScore.toFixed(1)}</span>
                          ) : (
                            <span className="text-slate-400 text-xs font-bold">—</span>
                          )}
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => router.push(rev.status === "Manager Reviewed" ? `/hr/review/detail?employeeId=${rev.employeeId}` : `/employee/reviews/detail?id=${rev.id}`)}
                            className="px-3 py-1 bg-gray-50 border border-gray-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-gray-100 transition-all cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 font-semibold text-xs">
                      No review submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {filteredReviews.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-2">
              <p className="text-[11px] text-slate-455 font-bold">
                Showing {filteredReviews.length === 0 ? 0 : submissionsStartIndex + 1} to {Math.min(submissionsStartIndex + itemsPerPage, filteredReviews.length)} of {filteredReviews.length} reviews
              </p>
              {submissionsTotalPages > 1 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSubmissionsPage(prev => Math.max(prev - 1, 1))}
                    disabled={submissionsPage === 1}
                    className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-slate-700 disabled:opacity-40 disabled:hover:bg-gray-50 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  {Array.from({ length: submissionsTotalPages }, (_, i) => i + 1).map(page => {
                    const shouldShow = page === 1 || page === submissionsTotalPages || Math.abs(page - submissionsPage) <= 1;
                    if (!shouldShow) {
                      if (page === 2 || page === submissionsTotalPages - 1) {
                        return <span key={`dots-${page}`} className="text-[10px] text-slate-400 font-bold px-1">...</span>;
                      }
                      return null;
                    }
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setSubmissionsPage(page)}
                        className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                          submissionsPage === page
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-white border border-gray-200 text-slate-600 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setSubmissionsPage(prev => Math.min(prev + 1, submissionsTotalPages))}
                    disabled={submissionsPage === submissionsTotalPages}
                    className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-slate-700 disabled:opacity-40 disabled:hover:bg-gray-50 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </ERPLayout>
  );
}
