"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useERPStore, PerformanceReview, User } from "@/lib/erp-store";
import ERPLayout from "@/components/nets_erp/Layout";
import StatCards from "@/components/nets_erp/StatCards";

export default function ManagerDashboard() {
  const router = useRouter();
  const { reviews, users, cycles } = useERPStore();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("erp_current_user");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  if (!currentUser) return null;

  // Filter reviews of employees who report to this manager
  // In our mock store, EMP001, EMP002, EMP003 report to John Smith (MGR001)
  const reportingEmployees = users.filter(u => u.managerName === currentUser.name);
  const reportingEmpIds = reportingEmployees.map(u => u.id);
  const teamReviews = reviews.filter(r => reportingEmpIds.includes(r.employeeId));

  const pendingApprovals = teamReviews.filter(r => r.status === "Submitted");
  const completedReviews = teamReviews.filter(r => r.status === "HR Approved" || r.status === "Manager Reviewed");

  // Calculate statistics
  const totalEmployeesCount = reportingEmployees.length;
  const completedCount = teamReviews.filter(r => ["Submitted", "Manager Reviewed", "HR Approved"].includes(r.status)).length;
  const completionPercentage = totalEmployeesCount > 0 ? (completedCount / totalEmployeesCount) * 100 : 0;

  // Average team score
  const gradedReviews = teamReviews.filter(r => r.finalScore !== undefined);
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
      default:
        return <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  return (
    <ERPLayout>
      <div className="flex flex-col gap-6">
        
        {/* Top Stat Cards */}
        <StatCards />
        
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
                    const selfScores = rev.objectives.map(o => o.selfScore).filter((s): s is number => s !== undefined);
                    const selfAvg = selfScores.length > 0 ? (selfScores.reduce((a, b) => a + b, 0) / selfScores.length).toFixed(1) : "—";
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
                        <td className="py-4 text-xs font-semibold text-slate-500">{rev.cycleName.split(" ")[0]}</td>
                        <td className="py-4">
                          <span className="bg-blue-50 text-blue-700 font-black px-2 py-0.5 rounded text-xs">{selfAvg}</span>
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => router.push(`/manager/review/detail?employeeId=${rev.employeeId}`)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
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
                {reportingEmployees.map((emp) => {
                  const cycle = cycles.find(c => c.status === "Active");
                  const rev = teamReviews.find(r => r.employeeId === emp.id && r.cycleId === cycle?.id);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 flex items-center gap-3">
                        <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover border" />
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
                            onClick={() => router.push(rev.status === "Submitted" ? `/manager/review/detail?employeeId=${emp.id}` : `/employee/reviews/detail?id=${rev.id}`)}
                            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-slate-650 font-bold rounded-xl text-xs transition-all border border-gray-200"
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

      </div>
    </ERPLayout>
  );
}
