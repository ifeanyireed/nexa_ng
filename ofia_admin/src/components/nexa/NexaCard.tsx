"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface NexaCardProps extends HTMLMotionProps<"div"> {
  variant?: "glass" | "flat" | "elevated" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
}

export const NexaCard = React.forwardRef<HTMLDivElement, NexaCardProps>(
  ({ className, variant = "glass", padding = "md", children, ...props }, ref) => {
    const variants = {
      glass: "liquid-glass",
      flat: "bg-[var(--nexa-bg-surface)] border-[0.5px] border-[var(--nexa-border)]",
      elevated: "bg-[var(--nexa-bg-surface)] border-[0.5px] border-[var(--nexa-border)] shadow-md",
      interactive:
        "liquid-glass cursor-pointer hover:border-[#1A56DB]/40 dark:hover:border-[#3B82F6]/40 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)]",
    };

    const paddings = {
      none: "p-0",
      sm: "p-3",
      md: "p-5",
      lg: "p-7",
    };

    const isInteractive = variant === "interactive";

    return (
      <motion.div
        ref={ref}
        whileHover={isInteractive ? { y: -4, scale: 1.005 } : undefined}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "rounded-2xl overflow-hidden relative",
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

NexaCard.displayName = "NexaCard";
