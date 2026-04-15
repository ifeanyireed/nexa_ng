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
      flat: "bg-nexa-bg-surface border-[0.5px] border-nexa-border",
      elevated: "bg-nexa-bg-surface border-[0.5px] border-nexa-border shadow-md",
      interactive: "liquid-glass cursor-pointer hover:border-nexa-brand/50 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]",
    };

    const paddings = {
      none: "p-0",
      sm: "p-3",
      md: "p-5",
      lg: "p-8",
    };

    const isInteractive = variant === "interactive";

    return (
      <motion.div
        ref={ref}
        whileHover={isInteractive ? { y: -8, scale: 1.01 } : undefined}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
