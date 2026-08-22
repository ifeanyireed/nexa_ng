"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useERPStore, PerformanceReview, User, getParentDept } from "@/lib/erp-store";
import ERPLayout from "@/components/nets_erp/Layout";

export default function DepartmentPerformancePage() {
  const router = useRouter();
  const { reviews, users } = useERPStore();

  const [deptId, setDeptId] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("deptId") || "";
    setDeptId(id);

    const stored = localStorage.getItem("erp_current_user");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  if (!currentUser) return null;

  // Filter employees and reviews for this department
  const deptEmployees = users.filter(u => getParentDept(u.department) === deptId && u.role === "employee");
  const deptEmpIds = deptEmployees.map(u => u.id);
  const deptReviews = reviews.filter(r => deptEmpIds.includes(r.employeeId));

  // Averages by Department
  const depts = ["Fleet", "Marketing", "NOC", "Finance & Accounts", "Systems and IT", "Admin/HR", "Human Resources", "Legal", "Workshop", "Internal Control", "KHLC - Skillup"];
  const allDeptAverages = depts.map(d => {
    const deptRevs = reviews.filter(r => getParentDept(r.department) === d && r.status === "HR Approved" && r.finalScore !== undefined);
    const avg = deptRevs.length > 0
      ? (deptRevs.reduce((sum, r) => sum + (r.finalScore || 0), 0) / deptRevs.length)
      : 0;
    return { name: d, average: avg };
  }).sort((a, b) => b.average - a.average);

  // Find department rank
  const rank = allDeptAverages.findIndex(d => d.name === deptId) + 1;
  const currentDeptAvg = allDeptAverages.find(d => d.name === deptId)?.average || 0;

  return (
    <ERPLayout>
      <div className="flex flex-col gap-6">
        
        {/* Header navigation back */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div>
            <button
              onClick={() => router.push("/md")}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Overview
            </button>
            <h2 className="text-[20px] font-black text-slate-800 tracking-tight mt-1.5">{deptId} Department Performance</h2>
            <p className="text-xs text-slate-450 font-semibold">Detailed rankings and roster evaluation audits</p>
          </div>

          <div className="flex gap-4">
            <div className="text-center bg-white border px-4 py-2 rounded-2xl shadow-sm">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Dept Rank</span>
              <span className="block font-black text-blue-700 text-lg leading-tight mt-0.5">#{rank}</span>
            </div>
            <div className="text-center bg-white border px-4 py-2 rounded-2xl shadow-sm">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Avg Score</span>
              <span className="block font-black text-emerald-700 text-lg leading-tight mt-0.5">
                {currentDeptAvg > 0 ? currentDeptAvg.toFixed(1) : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Employee reviews listing */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <h3 className="font-bold text-slate-800 text-sm">Roster Reviews Summary</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Employee</th>
                  <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Self Avg Rating</th>
                  <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Final Approved Rating</th>
                  <th className="pb-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deptEmployees.map((emp) => {
                  const rev = deptReviews.find(r => r.employeeId === emp.id);
                  const selfScores = rev?.objectives.map(o => o.selfScore).filter((s): s is number => s !== undefined) || [];
                  const selfAvg = selfScores.length > 0 ? (selfScores.reduce((a, b) => a + b, 0) / selfScores.length).toFixed(1) : "—";
                  
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 flex items-center gap-3">
                        <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover border" />
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{emp.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{emp.id}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        {rev ? (
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                            {rev.status}
                          </span>
                        ) : (
                          <span className="bg-gray-150 text-gray-550 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">Not Started</span>
                        )}
                      </td>
                      <td className="py-4">
                        <span className="bg-blue-50 text-blue-800 font-black px-2.5 py-0.5 rounded text-xs">{selfAvg}</span>
                      </td>
                      <td className="py-4 font-black text-slate-750">
                        {rev?.finalScore ? (
                          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded text-xs">{rev.finalScore.toFixed(1)} / 10</span>
                        ) : (
                          <span className="text-slate-400 font-semibold text-xs">—</span>
                        )}
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => {
                            router.push(`/employee/profile?id=${emp.id}`);
                          }}
                          className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl text-xs transition-all shadow-sm"
                        >
                          Audit Profile
                        </button>
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
