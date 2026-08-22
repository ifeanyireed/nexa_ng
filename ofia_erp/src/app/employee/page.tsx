"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useERPStore, PerformanceReview, User } from "@/lib/erp-store";
import ERPLayout from "@/components/nets_erp/Layout";
import StatCards from "@/components/nets_erp/StatCards";

export default function EmployeeDashboard() {
  const router = useRouter();
  const { reviews, cycles } = useERPStore();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userReviews, setUserReviews] = useState<PerformanceReview[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("erp_current_user");
    if (stored) {
      const u = JSON.parse(stored);
      setCurrentUser(u);
      setUserReviews(reviews.filter(r => r.employeeId === u.id));
    }
  }, [reviews]);

  if (!currentUser) return null;

  // Find active cycle review
  const activeCycle = cycles.find(c => c.status === "Active");
  const currentReview = userReviews.find(r => r.cycleId === activeCycle?.id);

  // Status styling helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Draft</span>;
      case "Submitted":
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Submitted</span>;
      case "Manager Reviewed":
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Manager Reviewed</span>;
      case "HR Approved":
        return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase">HR Approved</span>;
      case "Returned":
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Needs Revision</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{status}</span>;
    }
  };

  return (
    <ERPLayout>
      <div className="flex flex-col gap-6">
        
        {/* Top Stat Cards */}
        <StatCards />
        
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-14 h-14 rounded-full object-cover border-2 border-blue-100" />
            <div>
              <h2 className="text-lg font-black text-slate-800">Welcome Back, {currentUser.name}!</h2>
              <p className="text-xs text-slate-400 font-semibold">{currentUser.department} • Manager: {currentUser.managerName || "N/A"}</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/employee/profile")}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl text-xs transition-all self-start md:self-auto"
          >
            View Profile & History
          </button>
        </div>

        {/* Current Review Stat block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Action Block (8cols) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="font-bold text-slate-800 text-md">Active Review Cycle</h3>
                {activeCycle && (
                  <span className="bg-blue-50 text-blue-600 text-xs font-extrabold px-2.5 py-0.5 rounded-md">
                    Due {new Date(activeCycle.endDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {currentReview ? (
                <div className="py-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-700">{currentReview.cycleName}</h4>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Status details and feedback</p>
                    </div>
                    {getStatusBadge(currentReview.status)}
                  </div>

                  {currentReview.status === "Returned" && (
                    <div className="bg-red-50 text-red-800 text-xs font-semibold p-4 rounded-2xl border border-red-100">
                      <span className="font-bold block mb-1">Feedback from Manager:</span>
                      "{currentReview.managerComments || "Please review and update your scores."}"
                    </div>
                  )}

                  {currentReview.status === "HR Approved" && (
                    <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold block mb-1">Final Score Approved:</span>
                        <span className="text-slate-500">Your performance reviews for this cycle are completed.</span>
                      </div>
                      <div className="text-center bg-emerald-600 text-white rounded-xl p-2 min-w-16 shadow-sm">
                        <p className="text-[10px] uppercase font-bold tracking-wider leading-none">Score</p>
                        <p className="text-lg font-black mt-1 leading-none">{currentReview.finalScore || "N/A"}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-450 font-bold">
                  No active reviews for this cycle.
                </div>
              )}
            </div>

            {/* Actions button */}
            {currentReview && (currentReview.status === "Draft" || currentReview.status === "Returned") && (
              <button
                onClick={() => router.push(`/employee/reviews/detail?id=${currentReview.id}`)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all text-xs"
              >
                {currentReview.status === "Returned" ? "Edit and Re-submit Review" : "Fill Performance Self-Assessment Form"}
              </button>
            )}
            {currentReview && currentReview.status === "Submitted" && (
              <button
                disabled
                className="w-full py-3 bg-gray-100 text-gray-400 font-bold rounded-xl text-xs cursor-not-allowed text-center"
              >
                Awaiting Manager Review
              </button>
            )}
            {currentReview && currentReview.status === "Manager Reviewed" && (
              <button
                disabled
                className="w-full py-3 bg-gray-100 text-gray-400 font-bold rounded-xl text-xs cursor-not-allowed text-center"
              >
                Awaiting HR Final Verification
              </button>
            )}
            {currentReview && currentReview.status === "HR Approved" && (
              <button
                onClick={() => router.push(`/employee/reviews/detail?id=${currentReview.id}`)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all text-center"
              >
                View Final Review Summary
              </button>
            )}
          </div>

          {/* Side Info Panel (4cols) - Notifications & Actions */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-4 flex flex-col gap-5">
            <h3 className="font-bold text-slate-800 text-md pb-3 border-b border-gray-100">Notifications</h3>
            
            <div className="space-y-3 flex-1 overflow-y-auto max-h-72">
              {[
                { title: "Review cycle active", text: "2026 Mid-Year Performance Cycle is open.", date: "July 01", isNew: true },
                { title: "Review revised", text: "Manager requested revision for 2026 Mid-Year.", date: "July 09", isWarning: true },
                { title: "Cycle closed", text: "2025 Annual Cycle has been fully archived.", date: "Dec 15", isNew: false }
              ].map((notif, i) => (
                <div key={i} className="flex gap-2.5 p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100/50 transition-colors">
                  <div className="mt-0.5">
                    {notif.isWarning ? (
                      <span className="w-2 h-2 rounded-full bg-red-500 block" />
                    ) : notif.isNew ? (
                      <span className="w-2 h-2 rounded-full bg-blue-500 block" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-300 block" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-700">{notif.title}</h5>
                    <p className="text-[11px] text-slate-450 font-semibold mt-0.5">{notif.text}</p>
                    <span className="text-[10px] text-slate-350 font-bold block mt-1">{notif.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </ERPLayout>
  );
}
