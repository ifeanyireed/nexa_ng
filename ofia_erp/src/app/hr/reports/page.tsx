"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useERPStore, PerformanceReview, User, getParentDept, Objective } from "@/lib/erp-store";
import ERPLayout from "@/components/nets_erp/Layout";

export default function HRReportsPage() {
  const router = useRouter();
  const { reviews, users, cycles } = useERPStore();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>("Fleet");

  useEffect(() => {
    const stored = localStorage.getItem("erp_current_user");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  if (!currentUser) return null;

  // Filter completed reviews
  const completedReviews = reviews.filter(r => r.status === "HR Approved");

  // Define departments list
  const depts = [
    "Fleet",
    "Marketing",
    "NOC",
    "Finance & Accounts",
    "Systems and IT",
    "Admin/HR",
    "Human Resources",
    "Legal",
    "Workshop",
    "Internal Control",
    "KHLC - Skillup"
  ];

  // Calculate Roster Review Summary (RRS)
  const rosterReviewSummary = depts.map(d => {
    const deptRevs = completedReviews.filter(
      r => getParentDept(r.department) === d && r.finalScore !== undefined
    );
    const avg =
      deptRevs.length > 0
        ? deptRevs.reduce((sum, r) => sum + (r.finalScore || 0), 0) / deptRevs.length
        : 0;

    // Calculate total expected evaluations for this dept (active reviews)
    const totalDeptRevs = reviews.filter(r => getParentDept(r.department) === d);
    const completedCount = deptRevs.length;
    const completionRate =
      totalDeptRevs.length > 0 ? (completedCount / totalDeptRevs.length) * 100 : 0;

    return {
      name: d,
      average: avg,
      completedCount,
      totalCount: totalDeptRevs.length,
      completionRate
    };
  });

  // Filter employees and reviews for the selected department
  const deptEmployees = users.filter(
    u => getParentDept(u.department) === selectedDept && u.role === "employee"
  );
  const deptEmpIds = deptEmployees.map(u => u.id);
  const deptReviews = reviews.filter(r => deptEmpIds.includes(r.employeeId));

  // Top & Needs-Attention Performers based on thresholds (> 9.0 and < 5.0)
  const topPerformers = completedReviews
    .filter(r => r.finalScore !== undefined && r.finalScore > 9.0)
    .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));

  const bottomPerformers = completedReviews
    .filter(r => r.finalScore !== undefined && r.finalScore < 5.0)
    .sort((a, b) => (a.finalScore || 0) - (b.finalScore || 0));

  // Helper to calculate self-assessment average using the 70% work / 30% compliance split
  const calculateSelfAverageForReview = (rev: PerformanceReview) => {
    let workWeightedSum = 0;
    let workTotalWeight = 0;
    let compWeightedSum = 0;
    let compTotalWeight = 0;

    rev.objectives.forEach(o => {
      if (o.selfScore !== undefined) {
        const normalized = o.type === "objective" ? o.selfScore / 10.0 : o.selfScore * 2.0;
        if (o.type === "objective") {
          workWeightedSum += normalized * o.weight;
          workTotalWeight += o.weight;
        } else {
          compWeightedSum += normalized * o.weight;
          compTotalWeight += o.weight;
        }
      }
    });

    const workAvg = workTotalWeight > 0 ? workWeightedSum / workTotalWeight : 0;
    const compAvg = compTotalWeight > 0 ? compWeightedSum / compTotalWeight : 0;

    if (workTotalWeight > 0 && compTotalWeight > 0) {
      return workAvg * 0.7 + compAvg * 0.3;
    } else if (workTotalWeight > 0) {
      return workAvg;
    } else if (compTotalWeight > 0) {
      return compAvg;
    }
    return 0;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return (
          <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
            Draft
          </span>
        );
      case "Submitted":
        return (
          <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
            Awaiting Mgr Evaluation
          </span>
        );
      case "Manager Reviewed":
        return (
          <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
            Awaiting HR Audit
          </span>
        );
      case "HR Approved":
        return (
          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
            HR Approved
          </span>
        );
      case "Returned":
        return (
          <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
            Returned
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <ERPLayout>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Performance Audit Reports</h1>
            <p className="text-xs text-slate-450 font-semibold mt-1">
              Roster review summaries, category averages, and top/bottom performer analysis.
            </p>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR: Roster Review Summary & Top/Bottom Performers */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Roster Review Summary (RRS) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Roster Review Summary</h3>
              
              <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                {rosterReviewSummary.map(dept => {
                  const isActive = selectedDept === dept.name;
                  return (
                    <div
                      key={dept.name}
                      onClick={() => setSelectedDept(dept.name)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                        isActive
                          ? "bg-blue-50/50 border-blue-200 shadow-sm"
                          : "bg-gray-50 border-transparent hover:border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-800">{dept.name}</span>
                        <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                          {dept.average > 0 ? `${dept.average.toFixed(1)} Avg` : "No approved scores"}
                        </span>
                      </div>
                      
                      {/* Department average mini-meter */}
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${dept.average * 10}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>{dept.completedCount} of {dept.totalCount} Audited</span>
                        <span>{dept.completionRate.toFixed(0)}% Done</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top & Needs-Attention Performers */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
              <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-gray-100">
                Top & Needs-Attention Performers
              </h3>

              <div className="space-y-4">
                {/* Top rated performers */}
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wide block">
                    Top Rated Performers (&gt; 9.0)
                  </span>
                  <div className="space-y-2 mt-2">
                    {topPerformers.length > 0 ? (
                      topPerformers.map(r => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between p-2.5 bg-emerald-50/30 border border-emerald-100/50 rounded-xl"
                        >
                          <span className="font-bold text-slate-700 text-xs">{r.employeeName}</span>
                          <span className="bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 rounded text-[11px]">
                            {r.finalScore?.toFixed(1)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[10px] text-slate-400 font-semibold py-1">
                        No performers with score &gt; 9.0
                      </div>
                    )}
                  </div>
                </div>

                {/* Needs attention / development */}
                <div>
                  <span className="text-[10px] font-extrabold text-red-700 uppercase tracking-wide block">
                    Needs Development (&lt; 5.0)
                  </span>
                  <div className="space-y-2 mt-2">
                    {bottomPerformers.length > 0 ? (
                      bottomPerformers.map(r => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between p-2.5 bg-red-50/20 border border-red-100/35 rounded-xl"
                        >
                          <span className="font-bold text-slate-700 text-xs">{r.employeeName}</span>
                          <span className="bg-red-100 text-red-700 font-black px-2 py-0.5 rounded text-[11px]">
                            {r.finalScore?.toFixed(1)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[10px] text-slate-400 font-semibold py-1">
                        No performers with score &lt; 5.0
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Department Performance Rating Details */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[500px] flex flex-col gap-4">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-150">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Department Performance Rating: <span className="text-blue-600">{selectedDept}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                    Individual employee standings and evaluation status breakdown.
                  </p>
                </div>
                <div className="bg-slate-50 border px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Total Staff:
                  </span>
                  <span className="font-black text-slate-800 text-xs">
                    {deptEmployees.length}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Employee</th>
                      <th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Status</th>
                      <th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Self Score</th>
                      <th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Approved Score</th>
                      <th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {deptEmployees.length > 0 ? (
                      deptEmployees.map(emp => {
                        const rev = deptReviews.find(r => r.employeeId === emp.id);
                        
                        // Calculate self average rating
                        let selfAvgStr = "—";
                        if (rev) {
                          const selfAvg = calculateSelfAverageForReview(rev);
                          selfAvgStr = selfAvg > 0 ? selfAvg.toFixed(1) : "—";
                        }

                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 flex items-center gap-3">
                              <img
                                src={emp.avatar || "/character1.jpg"}
                                alt={emp.name}
                                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                              />
                              <div>
                                <p className="font-bold text-slate-850 text-xs leading-tight">{emp.name}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                  {emp.id}
                                </p>
                              </div>
                            </td>
                            <td className="py-3">
                              {rev ? getStatusBadge(rev.status) : getStatusBadge("Not Started")}
                            </td>
                            <td className="py-3">
                              {selfAvgStr !== "—" ? (
                                <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-xs">
                                  {selfAvgStr}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-semibold text-xs">—</span>
                              )}
                            </td>
                            <td className="py-3 font-black text-slate-750">
                              {rev?.finalScore !== undefined ? (
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs">
                                  {rev.finalScore.toFixed(1)} / 10
                                </span>
                              ) : (
                                <span className="text-slate-400 font-semibold text-xs">—</span>
                              )}
                            </td>
                            <td className="py-3">
                              {rev ? (
                                <button
                                  onClick={() => router.push(`/hr/review/detail?employeeId=${emp.id}`)}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                                >
                                  View Audit
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="px-3 py-1 bg-gray-100 text-slate-400 font-bold rounded-xl text-[10px] uppercase tracking-wider opacity-60 cursor-not-allowed"
                                >
                                  Incomplete
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold text-xs">
                          No employees listed in the {selectedDept} department.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>

        </div>
      </div>
    </ERPLayout>
  );
}
