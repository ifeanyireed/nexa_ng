"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NexaAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isOnline?: boolean;
  className?: string;
}

export const NexaAvatar = ({ src, alt, fallback, name, size = "md", isOnline, className }: NexaAvatarProps) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const statusSizes = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
    xl: "w-4 h-4",
  };

  const displayFallback = fallback || name || "NG";

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "rounded-full overflow-hidden border border-nexa-border bg-gradient-to-br from-nexa-brand-light to-nexa-brand/10 flex items-center justify-center text-nexa-brand font-bold uppercase",
          sizes[size]
        )}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span>{displayFallback.slice(0, 2)}</span>
        )}
      </div>
      
      {isOnline && (
        <div className={cn("absolute bottom-0 right-0", statusSizes[size])}>
          <div className="absolute inset-0 bg-nexa-accent rounded-full animate-ping" />
          <div className="relative w-full h-full bg-nexa-accent rounded-full border border-nexa-bg-surface" />
        </div>
      )}
    </div>
  );
};
