"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface NexaAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isOnline?: boolean;
  status?: "working" | "online" | "idle" | "busy" | "offline" | string;
  className?: string;
}

export const NexaAvatar = ({
  src,
  alt,
  fallback,
  name,
  size = "md",
  isOnline,
  status,
  className,
}: NexaAvatarProps) => {
  const [imgError, setImgError] = useState(false);

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

  const getDeterministicAvatar = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = (Math.abs(hash) % 20) + 1;
    return `/character${index}.jpg`;
  };

  const avatarSrc = src || getDeterministicAvatar(displayFallback);

  const statusColor =
    status === "working"
      ? "bg-[#1A56DB]"
      : status === "online"
      ? "bg-[#0E9F6E]"
      : status === "busy"
      ? "bg-[#E02424]"
      : status === "idle"
      ? "bg-[#F59E0B]"
      : "bg-[#0E9F6E]";

  return (
    <div className={cn("relative inline-flex items-center justify-center shrink-0", className)}>
      <div
        className={cn(
          "rounded-full overflow-hidden border border-[var(--nexa-border)] bg-gradient-to-br from-[#1A56DB]/15 via-slate-100 to-[#0E9F6E]/15 dark:via-slate-800 flex items-center justify-center text-[#1A56DB] font-extrabold uppercase shadow-sm select-none",
          sizes[size]
        )}
      >
        {!imgError ? (
          <img
            src={avatarSrc}
            alt={alt || displayFallback}
            className="w-full h-full object-cover object-center rounded-full"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="font-extrabold tracking-wider">{displayFallback.slice(0, 2).toUpperCase()}</span>
        )}
      </div>

      {(isOnline || status) && (
        <div className={cn("absolute bottom-0.5 right-0.5 pointer-events-none", statusSizes[size])}>
          <div className={cn("absolute inset-0 rounded-full animate-ping opacity-75", statusColor)} />
          <div className={cn("relative w-full h-full rounded-full ring-2 ring-white dark:ring-slate-900", statusColor)} />
        </div>
      )}
    </div>
  );
};
