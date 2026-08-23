"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface NexaAvatarProps {
  name: string;
  src?: string;
  role?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "working" | "idle" | "offline";
  className?: string;
}

export const getDeterministicAvatar = (seed: string) => {
  if (!seed) return "/character1.jpg";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = (Math.abs(hash) % 20) + 1;
  return `/character${index}.jpg`;
};

export const NexaAvatar = ({
  name,
  src,
  role,
  size = "md",
  status,
  className,
}: NexaAvatarProps) => {
  const [hasError, setHasError] = useState(false);

  const sizes = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const statusSizes = {
    xs: "w-1.5 h-1.5 ring-1",
    sm: "w-2 h-2 ring-1.5",
    md: "w-2.5 h-2.5 ring-2",
    lg: "w-3 h-3 ring-2",
    xl: "w-3.5 h-3.5 ring-2",
  };

  const statusColors = {
    online: "bg-[#0E9F6E] dark:bg-[#10B981]",
    working: "bg-[#1A56DB] dark:bg-[#3B82F6] animate-pulse",
    idle: "bg-[#C88A3A] dark:bg-[#F59E0B]",
    offline: "bg-[var(--nexa-text-faint)]",
  };

  const getInitials = (n: string) => {
    if (!n) return "OF";
    const parts = n.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  const avatarSrc = src || getDeterministicAvatar(name);

  return (
    <div className={cn("relative inline-flex shrink-0 select-none", className)}>
      <div
        className={cn(
          "rounded-full overflow-hidden border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] flex items-center justify-center font-bold text-white shadow-xs",
          sizes[size]
        )}
      >
        {!hasError ? (
          <img
            src={avatarSrc}
            alt={name || "Avatar"}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[var(--nexa-text-secondary)] uppercase font-bold text-xs">
            {getInitials(name)}
          </span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-[var(--nexa-bg-surface)]",
            statusColors[status],
            statusSizes[size]
          )}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
};
