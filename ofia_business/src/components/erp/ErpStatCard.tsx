"use client";

import React from "react";
import { NexaCard } from "@/components/nexa/NexaCard";
import { cn } from "@/lib/utils";

export interface ErpStatItem {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  changeType?: "success" | "warning" | "danger" | "info" | "neutral";
  icon: React.ReactNode;
  sub?: string;
  iconBg?: string;
}

export function ErpStatGrid({
  stats,
  columns = 4,
}: {
  stats: ErpStatItem[];
  columns?: 2 | 3 | 4;
}) {
  const colClass =
    columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : columns === 3
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2";

  return (
    <section className={cn("grid gap-6", colClass)}>
      {stats.map((kpi, i) => (
        <NexaCard
          key={i}
          variant="glass"
          className="p-6 relative overflow-hidden group hover:border-nexa-brand/30 transition-all rounded-3xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center group-hover:scale-110 transition-transform">
              {kpi.icon}
            </div>
            {kpi.change && (
              <span
                className={cn(
                  "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border",
                  kpi.changeType === "danger"
                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                    : kpi.changeType === "warning"
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                )}
              >
                {kpi.change}
              </span>
            )}
          </div>
          <p className="text-xs text-nexa-text-faint font-bold uppercase tracking-wider mb-1">
            {kpi.label}
          </p>
          <h3 className="text-2xl font-extrabold text-display text-nexa-text-primary mb-1">
            {kpi.value}
          </h3>
          {kpi.sub && (
            <p className="text-[11px] text-nexa-text-secondary font-medium">{kpi.sub}</p>
          )}
        </NexaCard>
      ))}
    </section>
  );
}

export function ErpStatCard(props: ErpStatItem) {
  return (
    <NexaCard
      variant="glass"
      className="p-6 relative overflow-hidden group hover:border-nexa-brand/30 transition-all rounded-3xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-11 h-11 rounded-2xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center group-hover:scale-110 transition-transform">
          {props.icon}
        </div>
        {props.change && (
          <span
            className={cn(
              "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border",
              props.changeType === "danger"
                ? "bg-red-500/10 text-red-500 border-red-500/20"
                : props.changeType === "warning"
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
            )}
          >
            {props.change}
          </span>
        )}
      </div>
      <p className="text-xs text-nexa-text-faint font-bold uppercase tracking-wider mb-1">
        {props.label}
      </p>
      <h3 className="text-2xl font-extrabold text-display text-nexa-text-primary mb-1">
        {props.value}
      </h3>
      {props.sub && (
        <p className="text-[11px] text-nexa-text-secondary font-medium">{props.sub}</p>
      )}
    </NexaCard>
  );
}
