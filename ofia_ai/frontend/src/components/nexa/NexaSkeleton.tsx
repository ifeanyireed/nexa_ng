"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface NexaSkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
}

export const NexaSkeleton = ({
  className,
  variant = "rectangular",
  width,
  height,
}: NexaSkeletonProps) => {
  const variants = {
    text: "h-4 w-full rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-xl",
    card: "h-32 w-full rounded-2xl",
  };

  return (
    <div
      style={{
        width: width,
        height: height,
      }}
      className={cn(
        "bg-[var(--nexa-border)] overflow-hidden relative skeleton-shimmer",
        variants[variant],
        className
      )}
    />
  );
};
