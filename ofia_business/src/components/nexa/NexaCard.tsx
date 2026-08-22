"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface NexaCardProps extends HTMLMotionProps<"div"> {
  variant?: "glass" | "flat" | "elevated" | "interactive" | "default";
  padding?: "none" | "sm" | "md" | "lg";
  hoverEffect?: boolean;
}

export const NexaCard = React.forwardRef<HTMLDivElement, NexaCardProps>(
  (
    {
      className,
      variant = "glass",
      padding = "md",
      hoverEffect = false,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      glass: "bg-[var(--nexa-bg-surface)]/80 backdrop-blur-md border border-[var(--nexa-border)]",
      default: "bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)]",
      flat: "bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)]",
      elevated: "bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] shadow-md",
      interactive:
        "bg-[var(--nexa-bg-surface)]/80 backdrop-blur-md border border-[var(--nexa-border)] cursor-pointer hover:border-[#1A56DB]/50 transition-all duration-300 shadow-sm hover:shadow-lg",
    };

    const paddings = {
      none: "p-0",
      sm: "p-3",
      md: "p-5",
      lg: "p-8",
    };

    const isInteractive = variant === "interactive" || hoverEffect;

    return (
      <motion.div
        ref={ref}
        whileHover={isInteractive ? { y: -4, scale: 1.005 } : undefined}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "rounded-2xl overflow-hidden",
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
