"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export type NexaBadgeVariant =
  | "brand"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "verified"
  | "purple"
  | "green"
  | "cyan"
  | "amber"
  | "coral";

export interface NexaBadgeProps {
  variant?: NexaBadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const NexaBadge = ({
  variant = "neutral",
  dot = false,
  children,
  className,
}: NexaBadgeProps) => {
  const variants: Record<NexaBadgeVariant, string> = {
    brand: "bg-[#1A56DB]/10 text-[#1A56DB] border border-[#1A56DB]/20",
    secondary: "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-primary)] border border-[var(--nexa-border)]",
    success: "bg-[#0E9F6E]/10 text-[#0E9F6E] border border-[#0E9F6E]/20",
    green: "bg-[#0E9F6E]/10 text-[#0E9F6E] border border-[#0E9F6E]/20",
    purple: "bg-[#9061F9]/10 text-[#9061F9] border border-[#9061F9]/20",
    cyan: "bg-[#0694A2]/10 text-[#0694A2] border border-[#0694A2]/20",
    warning: "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
    amber: "bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20",
    danger: "bg-[#E02424]/10 text-[#E02424] border border-[#E02424]/20",
    coral: "bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/20",
    neutral: "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)]",
    verified: "bg-[#FEF9C3] text-[#A16207] dark:bg-[#A16207]/20 dark:text-[#FDE047] border border-[#FEF08A]/30 flex items-center gap-1",
  };

  const dotColors: Record<NexaBadgeVariant, string> = {
    brand: "bg-[#1A56DB]",
    secondary: "bg-[var(--nexa-text-secondary)]",
    success: "bg-[#0E9F6E]",
    green: "bg-[#0E9F6E]",
    purple: "bg-[#9061F9]",
    cyan: "bg-[#0694A2]",
    warning: "bg-[#F59E0B]",
    amber: "bg-[#D97706]",
    danger: "bg-[#E02424]",
    coral: "bg-[#FF5A1F]",
    neutral: "bg-neutral-400",
    verified: "bg-[#A16207]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold relative overflow-hidden shrink-0",
        variants[variant],
        className
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse", dotColors[variant])} />
      )}
      {variant === "verified" && (
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
      )}
      {children}
    </span>
  );
};
