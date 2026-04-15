"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface NexaBadgeProps {
  variant?: "brand" | "success" | "warning" | "danger" | "neutral" | "verified";
  children: React.ReactNode;
  className?: string;
}

export const NexaBadge = ({ variant = "neutral", children, className }: NexaBadgeProps) => {
  const variants = {
    brand: "bg-nexa-brand-light text-nexa-brand",
    success: "bg-nexa-accent-light text-nexa-accent",
    warning: "bg-nexa-amber-light text-nexa-amber",
    danger: "bg-red-50 text-nexa-coral dark:bg-red-900/10",
    neutral: "bg-nexa-bg-base text-nexa-text-secondary border border-nexa-border",
    verified: "bg-[#FEF9C3] text-[#A16207] dark:bg-[#A16207]/10 dark:text-[#FDE047] flex items-center gap-1",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold relative overflow-hidden",
        variants[variant],
        className
      )}
    >
      {variant === "verified" && (
        <div className="relative">
          <ShieldCheck className="w-3 h-3" />
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-white/40 skew-x-12 blur-[2px]"
          />
        </div>
      )}
      {children}
    </div>
  );
};
