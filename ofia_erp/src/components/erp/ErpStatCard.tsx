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
  className,
}: {
  stats: ErpStatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const colClass =
    columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : columns === 3
      ? "grid-cols-1 md:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2";

  return (
    <section className={cn("grid gap-6 justify-center", colClass, className)}>
      {stats.map((kpi, i) => (
        <NexaCard
          key={i}
          variant="glass"
          className="p-6 relative overflow-hidden group hover:border-nexa-brand/30 transition-all rounded-3xl"
        >
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              {kpi.icon}
            </div>
            {kpi.change && (
              <span
                className={cn(
                  "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0",
                  kpi.changeType === "danger"
                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                    : kpi.changeType === "warning"
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    : kpi.changeType === "info"
                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    : kpi.changeType === "neutral"
                    ? "bg-neutral-500/10 text-[var(--nexa-text-muted)] border-[var(--nexa-border)]"
                    : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                )}
              >
                {kpi.change}
              </span>
            )}
          </div>
          <p className="text-xs text-nexa-text-faint font-bold uppercase tracking-wider mb-1 truncate whitespace-nowrap">
            {kpi.label}
          </p>
          <h3 className="text-2xl font-extrabold text-display text-nexa-text-primary mb-1 truncate whitespace-nowrap">
            {kpi.value}
          </h3>
          {kpi.sub && (
            <p className="text-[11px] text-nexa-text-secondary font-medium truncate whitespace-nowrap">{kpi.sub}</p>
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
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
          {props.icon}
        </div>
        {props.change && (
          <span
            className={cn(
              "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0",
              props.changeType === "danger"
                ? "bg-red-500/10 text-red-500 border-red-500/20"
                : props.changeType === "warning"
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : props.changeType === "info"
                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                : props.changeType === "neutral"
                ? "bg-neutral-500/10 text-[var(--nexa-text-muted)] border-[var(--nexa-border)]"
                : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
            )}
          >
            {props.change}
          </span>
        )}
      </div>
      <p className="text-xs text-nexa-text-faint font-bold uppercase tracking-wider mb-1 truncate whitespace-nowrap">
        {props.label}
      </p>
      <h3 className="text-2xl font-extrabold text-display text-nexa-text-primary mb-1 truncate whitespace-nowrap">
        {props.value}
      </h3>
      {props.sub && (
        <p className="text-[11px] text-nexa-text-secondary font-medium truncate whitespace-nowrap">{props.sub}</p>
      )}
    </NexaCard>
  );
}
