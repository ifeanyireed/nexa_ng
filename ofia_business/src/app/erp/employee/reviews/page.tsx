"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useERPStore, PerformanceReview, User } from "@/lib/erp-store";
import ERPLayout from "@/components/nets_erp/Layout";

export default function MyPerformanceReviews() {
  const router = useRouter();
  const { reviews } = useERPStore();
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
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Returned</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{status}</span>;
    }
  };

  return (
    <ERPLayout>
      <div className="flex flex-col gap-6">
        
        {/* Header Block */}
        <div>
          <h2 className="text-[20px] font-black text-slate-800 tracking-tight">My Performance Reviews</h2>
          <p className="text-xs text-slate-450 font-semibold mt-1">History of all self-assessments and final ratings</p>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">Review Cycle</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">Final Score</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {userReviews.length > 0 ? (
                  userReviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-slate-800 text-sm">{rev.cycleName}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{rev.id}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-semibold text-xs">
                        Jan 01, 2026 - Jun 30, 2026
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(rev.status)}
                      </td>
                      <td className="px-6 py-4">
                        {rev.finalScore ? (
                          <span className="font-black text-slate-800 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs">
                            {rev.finalScore.toFixed(1)} / 10
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/employee/reviews/detail?id=${rev.id}`)}
                          className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl text-xs transition-all"
                        >
                          {rev.status === "Draft" || rev.status === "Returned" ? "Complete" : "View"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-semibold text-sm">
                      No reviews found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </ERPLayout>
  );
}
