"use client";

import React from "react";
import { NexaSkeleton } from "./NexaSkeleton";

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-7 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <NexaSkeleton width="140px" height="24px" className="rounded-lg" />
          <NexaSkeleton width="280px" height="36px" className="rounded-xl" />
        </div>
        <div className="flex items-center gap-3">
          <NexaSkeleton width="120px" height="38px" className="rounded-xl" />
          <NexaSkeleton width="140px" height="38px" className="rounded-xl" />
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-2">
            <div className="flex justify-between items-center">
              <NexaSkeleton width="80px" height="16px" />
              <NexaSkeleton width="20px" height="20px" variant="circular" />
            </div>
            <NexaSkeleton width="100px" height="28px" />
            <NexaSkeleton width="120px" height="14px" />
          </div>
        ))}
      </div>

      {/* Main Grid Split Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Briefing Card) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-4">
            <div className="flex items-center gap-3">
              <NexaSkeleton width="44px" height="44px" variant="circular" />
              <div className="space-y-1.5 flex-1">
                <NexaSkeleton width="180px" height="18px" />
                <NexaSkeleton width="120px" height="14px" />
              </div>
            </div>
            <NexaSkeleton height="120px" className="rounded-2xl" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <NexaSkeleton height="40px" className="rounded-xl" />
              <NexaSkeleton height="40px" className="rounded-xl" />
            </div>
          </div>
        </div>

        {/* Right Column (Swarm Pulse) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-5 rounded-3xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-3">
            <NexaSkeleton width="160px" height="20px" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <NexaSkeleton width="32px" height="32px" variant="circular" />
                  <div className="space-y-1">
                    <NexaSkeleton width="90px" height="14px" />
                    <NexaSkeleton width="60px" height="10px" />
                  </div>
                </div>
                <NexaSkeleton width="50px" height="20px" className="rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <NexaSkeleton width="120px" height="20px" className="rounded-lg" />
          <NexaSkeleton width="240px" height="32px" className="rounded-xl" />
        </div>
        <NexaSkeleton width="140px" height="38px" className="rounded-xl" />
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex justify-between">
        <NexaSkeleton width="240px" height="36px" className="rounded-xl" />
        <NexaSkeleton width="100px" height="36px" className="rounded-xl" />
      </div>

      {/* Table Box */}
      <div className="p-4 rounded-3xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-3">
        <NexaSkeleton height="30px" className="rounded-xl mb-4" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 border-b border-[var(--nexa-border)]">
            <div className="flex items-center gap-3">
              <NexaSkeleton width="36px" height="36px" variant="circular" />
              <div className="space-y-1">
                <NexaSkeleton width="140px" height="16px" />
                <NexaSkeleton width="90px" height="12px" />
              </div>
            </div>
            <NexaSkeleton width="100px" height="18px" />
            <NexaSkeleton width="80px" height="24px" className="rounded-lg" />
            <NexaSkeleton width="60px" height="30px" className="rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardsGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <NexaSkeleton width="130px" height="22px" className="rounded-lg" />
          <NexaSkeleton width="260px" height="32px" className="rounded-xl" />
        </div>
        <NexaSkeleton width="150px" height="38px" className="rounded-xl" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-5 rounded-3xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <NexaSkeleton width="44px" height="44px" variant="circular" />
                <div className="space-y-1.5">
                  <NexaSkeleton width="110px" height="16px" />
                  <NexaSkeleton width="70px" height="12px" />
                </div>
              </div>
              <NexaSkeleton width="60px" height="22px" className="rounded-md" />
            </div>
            <NexaSkeleton height="60px" className="rounded-xl" />
            <div className="grid grid-cols-3 gap-2">
              <NexaSkeleton height="45px" className="rounded-lg" />
              <NexaSkeleton height="45px" className="rounded-lg" />
              <NexaSkeleton height="45px" className="rounded-lg" />
            </div>
            <div className="pt-2 border-t border-[var(--nexa-border)] flex justify-between items-center">
              <NexaSkeleton width="90px" height="14px" />
              <NexaSkeleton width="80px" height="28px" className="rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const StrategyCanvasSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <NexaSkeleton width="140px" height="24px" className="rounded-lg" />
          <NexaSkeleton width="300px" height="36px" className="rounded-xl" />
        </div>
        <NexaSkeleton width="160px" height="38px" className="rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-3">
            <NexaSkeleton width="50px" height="16px" />
            <NexaSkeleton height="18px" />
            <NexaSkeleton height="80px" className="rounded-xl" />
            <NexaSkeleton height="20px" className="rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};
