"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useERPStore, PerformanceReview, User, getParentDept, getSignedInERPUser } from "@/lib/erp-store";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { Building2, Award, TrendingUp, Users, ArrowRight, UserCheck, Sliders } from "lucide-react";
import { useTenantProvisioning, isUserLineManager } from "@/lib/access-control";

export default function MDDashboard() {
  const router = useRouter();
  const { isModuleProvisioned } = useTenantProvisioning();
  const { reviews, users, cycles, isLoading: isStoreLoading } = useERPStore();
  const [currentUser, setCurrentUser] = useState<User>(() => getSignedInERPUser(users));
  const [departments, setDepartments] = useState<{ code: string; name: string; costCenter?: string; head?: string }[]>([]);
  const [isLoadingDepts, setIsLoadingDepts] = useState(true);

  const hasHrModule = isModuleProvisioned("hr");
  const hasAccountingModule = isModuleProvisioned("accounting");
  const isLineMgr = isUserLineManager(currentUser, users);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = getSignedInERPUser(users);
      setCurrentUser(active);
    }
  }, [users]);

  // Dynamically fetch tenant departments from the database / API
  useEffect(() => {
    async function loadDepartments() {
      try {
        setIsLoadingDepts(true);
        const res = await fetch("/api/erp/departments", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setDepartments(data);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch departments for MD dashboard:", err);
      } finally {
        setIsLoadingDepts(false);
      }
    }
    loadDepartments();
  }, []);

  // Filter completed reviews
  const completedReviews = reviews.filter(r => r.status === "HR Approved");

  // Dynamically compute Department Performance Ratings
  // If API returns departments, use them; otherwise extract unique departments dynamically from live users
  const activeDepartmentList = useMemo(() => {
    if (departments.length > 0) {
      return departments.map(d => d.name);
    }
    // Fallback: extract distinct department names dynamically from live users
    const userDepts = Array.from(new Set(users.map(u => getParentDept(u.department)).filter(Boolean)));
    return userDepts.length > 0 ? userDepts : ["Finance & Accounts", "Fleet Operations & Maintenance", "Systems & IT / ERP", "Human Resources & Talent", "Commercial & Growth", "Executive Directorate"];
  }, [departments, users]);

  const deptAverages = activeDepartmentList.map(deptName => {
    const deptRevs = completedReviews.filter(r => {
      const rDept = (r.department || "").toLowerCase().trim();
      const target = deptName.toLowerCase().trim();
      return (
        getParentDept(r.department) === deptName ||
        rDept.includes(target) ||
        target.includes(rDept)
      );
    });
    const avg = deptRevs.length > 0
      ? deptRevs.reduce((sum, r) => sum + (r.finalScore || 0), 0) / deptRevs.length
      : 0;
    return { name: deptName, average: avg, count: deptRevs.length };
  });

  // Top and Bottom Performers
  // Filter by thresholds: Top Rated > 9.0, Needs Development < 5.0
  const topPerformers = completedReviews
    .filter(r => r.finalScore !== undefined && r.finalScore > 9.0)
    .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
  const bottomPerformers = completedReviews
    .filter(r => r.finalScore !== undefined && r.finalScore < 5.0)
    .sort((a, b) => (a.finalScore || 0) - (b.finalScore || 0));

  // Overall Company stats (Option A: submitted/reviewed evaluations out of active cycle reviews)
  const activeCycle = cycles.find(c => c.status === "Active");
  const activeCycleReviews = activeCycle
    ? reviews.filter(r => r.cycleId === activeCycle.id)
    : reviews.filter(r => r.cycleId === "CYC001");
  const totalReviewsCount = activeCycleReviews.length;
  const cycleCompletedCount = activeCycleReviews.filter(r =>
    ["Submitted", "Manager Reviewed", "HR Approved"].includes(r.status)
  ).length;
  const auditProgressPercentage = totalReviewsCount > 0 ? (cycleCompletedCount / totalReviewsCount) * 100 : 0;

  return (
    <BusinessShell
      title="Executive Briefing & MD Governance"
      subtitle="Enterprise-wide appraisal calibrations, department rating benchmarks, and executive talent heatmaps."
      isLoading={isLoadingDepts || isStoreLoading}
    >
      <div className="space-y-6">
        
        {/* LINE MANAGER SWITCHER CARD (IF MD HAS DIRECT REPORTS) */}
        {isLineMgr && (
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Line Manager Evaluation Desk</h4>
                <p className="text-xs text-slate-500 mt-0.5">As Managing Director and Line Manager, you have direct reporting team members and department heads awaiting your verification.</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/erp/manager")}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
            >
              Open Manager Review Desk →
            </button>
          </div>
        )}

        {/* Company Overview Row */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {hasHrModule ? (
            <>
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
            </>
          ) : (
            <>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Active Workspace Divisions</span>
                <h2 className="text-2xl font-black text-slate-800 mt-1">{activeDepartmentList.length}</h2>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Operating business units</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Operational Status</span>
                <h2 className="text-2xl font-black text-emerald-600 mt-1">Optimal</h2>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Enterprise services synchronized</p>
              </div>
            </>
          )}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Total Corporate Headcount</span>
            <h2 className="text-2xl font-black text-slate-800 mt-1">{users.filter(u => u.role !== "admin").length}</h2>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Active corporate staff</p>
          </div>
        </section>

        {hasHrModule ? (
          /* Company Department Performance Chart (8cols) */
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
        ) : (
          /* Corporate Divisions List when HR is not provisioned */
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 text-sm">Corporate Organizational Divisions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {activeDepartmentList.map((deptName) => {
                const count = users.filter(u => getParentDept(u.department) === deptName || u.department.includes(deptName)).length;
                return (
                  <div key={deptName} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{deptName}</h4>
                      <span className="text-[10px] font-semibold text-slate-400">Headcount</span>
                    </div>
                    <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                      {count} {count === 1 ? "staff" : "staff"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </BusinessShell>
  );
}
