"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface NexaChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  count?: number;
  className?: string;
  size?: "sm" | "md";
}

export const NexaChip: React.FC<NexaChipProps> = ({
  label,
  selected = false,
  onClick,
  icon,
  count,
  className,
  size = "md",
}) => {
  return (
    <motion.button
      whileHover={{ y: -1, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border transition-all cursor-pointer font-medium select-none whitespace-nowrap",
        size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm",
        selected
          ? "bg-nexa-brand text-white border-nexa-brand shadow-sm"
          : "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-secondary)] border-[var(--nexa-border)] hover:border-nexa-brand/40 hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-base)]",
        className
      )}
    >
      {icon && <span className="text-current opacity-80">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "text-[10px] font-bold rounded-full px-1.5 py-0.2",
            selected ? "bg-white/20 text-white" : "bg-black/5 text-slate-500"
          )}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
};
