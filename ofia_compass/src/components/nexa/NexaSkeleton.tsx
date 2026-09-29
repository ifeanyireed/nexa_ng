"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface NexaSkeletonProps {
  variant?: "card" | "list-item" | "profile" | "text" | "circular";
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const NexaSkeleton = ({
  variant = "text",
  width,
  height,
  className,
  style,
}: NexaSkeletonProps) => {
  const baseClasses = "skeleton-shimmer bg-[var(--nexa-bg-surface)]/70 rounded-md relative overflow-hidden";

  const customStyle: React.CSSProperties = {
    ...style,
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  if (variant === "circular") {
    return (
      <div
        className={cn(baseClasses, "rounded-full shrink-0", className)}
        style={customStyle}
      />
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn("p-4 rounded-xl flex flex-col gap-4 border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/50", className)}
        style={customStyle}
      >
        <div className={cn("w-full h-40", baseClasses)} />
        <div className="space-y-2">
          <div className={cn("w-3/4 h-5", baseClasses)} />
          <div className={cn("w-1/2 h-4", baseClasses)} />
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className={cn("w-20 h-8 rounded-lg", baseClasses)} />
          <div className={cn("w-12 h-6 rounded-full", baseClasses)} />
        </div>
      </div>
    );
  }

  if (variant === "list-item") {
    return (
      <div
        className={cn("flex items-center gap-4 py-3 border-b border-[var(--nexa-border)]", className)}
        style={customStyle}
      >
        <div className={cn("w-12 h-12 rounded-lg shrink-0", baseClasses)} />
        <div className="flex-1 space-y-2">
          <div className={cn("w-1/3 h-4", baseClasses)} />
          <div className={cn("w-2/3 h-3", baseClasses)} />
        </div>
      </div>
    );
  }

  if (variant === "profile") {
    return (
      <div
        className={cn("flex items-center gap-3", className)}
        style={customStyle}
      >
        <div className={cn("w-10 h-10 rounded-full shrink-0", baseClasses)} />
        <div className="flex-1 space-y-1">
          <div className={cn("w-24 h-4", baseClasses)} />
          <div className={cn("w-16 h-3", baseClasses)} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, "w-full h-4", className)}
      style={customStyle}
    />
  );
};
