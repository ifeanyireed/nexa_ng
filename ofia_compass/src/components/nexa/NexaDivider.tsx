"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface NexaDividerProps {
  label?: string;
  className?: string;
}

export const NexaDivider = ({ label, className }: NexaDividerProps) => {
  return (
    <div className={cn("relative flex items-center w-full my-6", className)}>
      <div className="flex-1 h-px bg-nexa-border" />
      {label && (
        <span className="mx-4 text-xs font-semibold text-nexa-text-faint uppercase tracking-wider">
          {label}
        </span>
      )}
      <div className="flex-1 h-px bg-nexa-border" />
    </div>
  );
};
