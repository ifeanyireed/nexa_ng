"use client";

import React, { useState, useEffect } from "react";
import { useERPStore, User, PerformanceReview } from "@/lib/erp-store";
import ERPLayout from "@/components/nets_erp/Layout";

export default function EmployeeProfilePage() {
  const { reviews, users } = useERPStore();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userReviews, setUserReviews] = useState<PerformanceReview[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("erp_current_user");
    if (stored) {
      const loggedInUser = JSON.parse(stored);
      setCurrentUser(loggedInUser);

      // Check if there is an "id" query parameter in the URL (client-side only query read)
      const params = new URLSearchParams(window.location.search);
      const targetId = params.get("id");

      if (targetId && users.length > 0) {
        const found = users.find(u => u.id === targetId);
        if (found) {
          setProfileUser(found);
          setUserReviews(reviews.filter(r => r.employeeId === found.id));
          return;
        }
      }

      setProfileUser(loggedInUser);
      setUserReviews(reviews.filter(r => r.employeeId === loggedInUser.id));
    }
  }, [reviews, users]);

  if (!currentUser || !profileUser) return null;

  // Compute dynamic trend data: historical plus completed cycles in DB
  const completedScores = userReviews
    .filter(r => r.status === "HR Approved" && r.finalScore !== undefined)
    .map(r => Number((r.finalScore || 0).toFixed(1)));

  const trendData = profileUser.ratingTrend && profileUser.ratingTrend.length > 0
    ? [...profileUser.ratingTrend, ...completedScores]
    : [7.0, 7.5, 8.0, ...completedScores];

  // Dynamic SVG coordinates
  const getX = (index: number) => {
    if (trendData.length <= 1) return 150;
    return 15 + (index * (270 / (trendData.length - 1)));
  };

  const linePath = trendData.map((val, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${100 - (val * 9)}`).join(" ");
  const areaPath = trendData.length > 0
    ? `${linePath} L ${getX(trendData.length - 1)} 100 L 15 100 Z`
    : "";

  const getLabel = (index: number, total: number) => {
    if (total === 3) {
      if (index === 0) return "2024 Annual";
      if (index === 1) return "2025 Mid-Year";
      return "2025 Annual";
    }
    if (total === 4) {
      if (index === 0) return "2024 Annual";
      if (index === 1) return "2025 Mid-Year";
      if (index === 2) return "2025 Annual";
      return "2026 Mid-Year";
    }
    return `Cycle ${index + 1}`;
  };

  return (
    <ERPLayout>
      <div className="flex flex-col gap-6">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <img src={profileUser.avatar} alt={profileUser.name} className="w-20 h-20 rounded-full object-cover border-4 border-blue-50 shadow-sm" />
            <div>
              <h2 className="text-xl font-black text-slate-800 leading-tight">{profileUser.name}</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{profileUser.role} • {profileUser.department}</p>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-3 text-xs text-slate-500 font-semibold justify-center sm:justify-start">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  {profileUser.email}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  ID: {profileUser.id}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl min-w-48 flex flex-col items-center justify-center text-center self-stretch sm:self-auto">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Manager / Reporting Officer</span>
            <span className="text-sm font-black text-blue-700 mt-1">{profileUser.managerName || "Alice Johnson (HR)"}</span>
          </div>
        </div>

        {/* Details & Trend Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Performance Trend Chart (7cols) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-7 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm pb-3 border-b border-gray-100">Performance rating trend</h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">Summary of ratings across previous cycles</p>
            </div>

            {/* SVG Sparkline */}
            <div className="h-44 w-full mt-6 flex flex-col justify-between">
              <div className="flex-1 w-full relative">
                <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area fill */}
                  {areaPath && (
                    <path d={areaPath} fill="url(#trendGrad)" />
                  )}

                  {/* Graph Line */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  
                  {/* Rating dots */}
                  {trendData.map((val, i) => {
                    const cx = getX(i);
                    const cy = 100 - (val * 9);
                    return (
                      <g key={i}>
                        <circle cx={cx} cy={cy} r="5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
                        <text x={cx} y={cy - 10} textAnchor="middle" className="text-[10px] font-black fill-slate-700">{val.toFixed(1)}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2 mt-2">
                {trendData.map((_, i) => (
                  <span key={i}>{getLabel(i, trendData.length)}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Review History Logs (5cols) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-5 flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 text-sm pb-3 border-b border-gray-100">Review History</h3>
            
            <div className="space-y-3 overflow-y-auto max-h-56">
              {userReviews.map((rev) => (
                <div key={rev.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">{rev.cycleName.split(" ")[0]} Cycle</h4>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{rev.status}</span>
                  </div>
                  {rev.finalScore ? (
                    <span className="bg-emerald-50 text-emerald-700 font-black px-2 py-0.5 rounded text-xs">
                      {rev.finalScore.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs font-bold">—</span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </ERPLayout>
  );
}
