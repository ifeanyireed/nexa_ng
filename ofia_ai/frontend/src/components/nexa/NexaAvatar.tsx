"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface NexaAvatarProps {
  name: string;
  src?: string;
  role?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "working" | "idle" | "offline";
  className?: string;
}

export const NexaAvatar = ({
  name,
  src,
  role,
  size = "md",
  status,
  className,
}: NexaAvatarProps) => {
  const sizes = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-13 h-13 text-base",
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
    if (!n) return "AI";
    const parts = n.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  // Generate consistent color hash for avatar background
  const getGradient = (n: string) => {
    const colors = [
      "from-blue-600 to-indigo-700",
      "from-emerald-600 to-teal-700",
      "from-purple-600 to-indigo-800",
      "from-amber-500 to-orange-600",
      "from-rose-500 to-pink-600",
      "from-cyan-600 to-blue-700",
    ];
    let hash = 0;
    for (let i = 0; i < n.length; i++) hash = n.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={cn("relative inline-flex shrink-0 select-none", className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            "rounded-full object-cover ring-1 ring-[var(--nexa-border)]",
            sizes[size]
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-full flex items-center justify-center font-bold text-white shadow-sm bg-gradient-to-tr",
            getGradient(name),
            sizes[size]
          )}
        >
          {getInitials(name)}
        </div>
      )}

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
