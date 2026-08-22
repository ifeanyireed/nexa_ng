"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useERPStore, PerformanceReview, User, getParentDept } from "@/lib/erp-store";
import ERPLayout from "@/components/nets_erp/Layout";
import StatCards from "@/components/nets_erp/StatCards";

export default function MDDashboard() {
  const router = useRouter();
  const { reviews, users } = useERPStore();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("erp_current_user");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  if (!currentUser) return null;

  // Filter completed reviews
  const completedReviews = reviews.filter(r => r.status === "HR Approved");

  // Averages by Department
  const depts = ["Fleet", "Marketing", "NOC", "Finance & Accounts", "Systems and IT", "Admin/HR", "Human Resources", "Legal", "Workshop", "Internal Control", "KHLC - Skillup"];
  const deptAverages = depts.map(d => {
    const deptRevs = completedReviews.filter(r => getParentDept(r.department) === d && r.finalScore !== undefined);
    const avg = deptRevs.length > 0
      ? (deptRevs.reduce((sum, r) => sum + (r.finalScore || 0), 0) / deptRevs.length)
      : 0;
    return { name: d, average: avg, count: deptRevs.length };
  });

  // Top and Bottom Performers
  // Filter by thresholds: Top Rated > 9.0, Needs Development < 5.0
  const topPerformers = completedReviews
    .filter(r => r.finalScore !== undefined && r.finalScore > 9.0)
    .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
  const bottomPerformers = completedReviews
    .filter(r => r.finalScore !== undefined && r.finalScore < 5.0)
    .sort((a, b) => (a.finalScore || 0) - (b.finalScore || 0));

  // Overall Company stats
  const totalReviewsCount = reviews.length;
  const auditCompletedCount = completedReviews.length;
  const auditProgressPercentage = totalReviewsCount > 0 ? (auditCompletedCount / totalReviewsCount) * 100 : 0;

  return (
    <ERPLayout>
      <div className="flex flex-col gap-6">
        
        {/* Top Stat Cards */}
        <StatCards />
        
        {/* Company Overview Row */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Audit Completion Progress</span>
            <h2 className="text-2xl font-black text-slate-800 mt-1">{auditProgressPercentage.toFixed(0)}%</h2>
            <div className="w-full bg-gray-150 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${auditProgressPercentage}%` }} />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Approved Company Rating</span>
            <h2 className="text-2xl font-black text-slate-800 mt-1">
              {completedReviews.length > 0
                ? (completedReviews.reduce((sum, r) => sum + (r.finalScore || 0), 0) / completedReviews.length).toFixed(1)
                : "N/A"
              }
              <span className="text-xs text-slate-400 font-bold"> / 10</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Weighted average across cycles</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Total Corporate Headcount</span>
            <h2 className="text-2xl font-black text-slate-800 mt-1">{users.filter(u => u.role !== "admin").length}</h2>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Active corporate staff</p>
          </div>
        </section>

        {/* Company Department Performance Chart (8cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Department averages (7cols) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-7 flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 text-sm">Department Performance Ratings</h3>
            
            <div className="space-y-4 py-2">
              {deptAverages.map((dept) => (
                <div
                  key={dept.name}
                  onClick={() => router.push(`/md/department/detail?deptId=${encodeURIComponent(dept.name)}`)}
                  className="p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 cursor-pointer transition-all flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-700">{dept.name}</span>
                    <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {dept.average > 0 ? `${dept.average.toFixed(1)} Avg` : "No approved scores"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${dept.average * 10}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">{dept.count} reviews audited</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performers breakdown panels (5cols) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-5 flex flex-col gap-5">
            <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-gray-100">Top & Needs-Attention Performers</h3>
            
            <div className="space-y-4">
              {/* Top performers */}
              <div>
                <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wide">Top Rated Performers</span>
                <div className="space-y-2 mt-2">
                  {topPerformers.length > 0 ? (
                    topPerformers.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-2.5 bg-emerald-50/30 border border-emerald-100/50 rounded-xl">
                        <span className="font-bold text-slate-700 text-xs">{r.employeeName}</span>
                        <span className="bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 rounded text-[11px]">
                          {r.finalScore?.toFixed(1)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-slate-400 font-semibold py-1">No performers with score &gt; 9.0</div>
                  )}
                </div>
              </div>

              {/* Needs attention */}
              <div>
                <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wide text-red-600">Needs Development</span>
                <div className="space-y-2 mt-2">
                  {bottomPerformers.length > 0 ? (
                    bottomPerformers.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-2.5 bg-red-50/20 border border-red-100/35 rounded-xl">
                        <span className="font-bold text-slate-700 text-xs">{r.employeeName}</span>
                        <span className="bg-red-100 text-red-700 font-black px-2 py-0.5 rounded text-[11px]">
                          {r.finalScore?.toFixed(1)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-slate-400 font-semibold py-1">No performers with score &lt; 5.0</div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </ERPLayout>
  );
}
