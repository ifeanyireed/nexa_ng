"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type NexaBadgeVariant =
  | "brand"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "purple"
  | "cyan"
  | "green"
  | "amber"
  | "coral";

interface NexaBadgeProps {
  variant?: NexaBadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const NexaBadge = ({
  variant = "neutral",
  children,
  className,
  dot = false,
}: NexaBadgeProps) => {
  const variants: Record<NexaBadgeVariant, string> = {
    brand: "bg-[#EBF5FF] text-[#1A56DB] dark:bg-[#3B82F6]/15 dark:text-[#60A5FA]",
    secondary: "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-primary)] border border-[var(--nexa-border)]",
    success: "bg-[#ECFDF5] text-[#0E9F6E] dark:bg-[#10B981]/15 dark:text-[#34D399]",
    green: "bg-[#ECFDF5] text-[#0E9F6E] dark:bg-[#10B981]/15 dark:text-[#34D399]",
    warning: "bg-[#FFFBEB] text-[#C88A3A] dark:bg-[#F59E0B]/15 dark:text-[#FBBF24]",
    amber: "bg-[#FFFBEB] text-[#C88A3A] dark:bg-[#F59E0B]/15 dark:text-[#FBBF24]",
    danger: "bg-[#FEF2F2] text-[#E02424] dark:bg-[#EF4444]/15 dark:text-[#F87171]",
    coral: "bg-[#FEF2F2] text-[#E02424] dark:bg-[#EF4444]/15 dark:text-[#F87171]",
    neutral: "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)]",
    purple: "bg-[#F3E8FF] text-[#7E22CE] dark:bg-[#9333EA]/15 dark:text-[#C084FC]",
    cyan: "bg-[#ECFEFF] text-[#0E7490] dark:bg-[#06B6D4]/15 dark:text-[#22D3EE]",
  };

  const dotColors: Record<NexaBadgeVariant, string> = {
    brand: "bg-[#1A56DB] dark:bg-[#60A5FA]",
    secondary: "bg-[var(--nexa-text-muted)]",
    success: "bg-[#0E9F6E] dark:bg-[#34D399]",
    green: "bg-[#0E9F6E] dark:bg-[#34D399]",
    warning: "bg-[#C88A3A] dark:bg-[#FBBF24]",
    amber: "bg-[#C88A3A] dark:bg-[#FBBF24]",
    danger: "bg-[#E02424] dark:bg-[#F87171]",
    coral: "bg-[#E02424] dark:bg-[#F87171]",
    neutral: "bg-[var(--nexa-text-faint)]",
    purple: "bg-[#7E22CE] dark:bg-[#C084FC]",
    cyan: "bg-[#0E7490] dark:bg-[#22D3EE]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-tight shrink-0 select-none",
        variants[variant] || variants.neutral,
        className
      )}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dotColors[variant] || dotColors.neutral)}
        />
      )}
      {children}
    </div>
  );
};
