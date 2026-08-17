"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface NexaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "success" | "glass";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const NexaButton = React.forwardRef<HTMLButtonElement, NexaButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-[#1A56DB] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] border-[0.5px] border-[#1A56DB]/40 hover:bg-[#1A56DB]/90 dark:bg-[#3B82F6] dark:hover:bg-[#3B82F6]/90",
      secondary:
        "liquid-glass text-[var(--nexa-text-primary)] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-[0.5px] border-black/5 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/10",
      glass:
        "liquid-glass text-[var(--nexa-text-primary)] hover:border-[#1A56DB]/40 dark:hover:border-[#3B82F6]/40",
      ghost:
        "hover:bg-[#EBF5FF] text-[#1A56DB] dark:text-[#60A5FA] dark:hover:bg-white/5",
      danger:
        "bg-[#E02424] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_4px_rgba(0,0,0,0.1)] border-[0.5px] border-[#E02424]/30 hover:bg-[#E02424]/90",
      outline:
        "border border-[var(--nexa-border)] bg-transparent text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)] hover:text-[var(--nexa-text-primary)] dark:border-[var(--nexa-border-mid)]",
      success:
        "bg-[#0E9F6E] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_4px_rgba(0,0,0,0.1)] border-[0.5px] border-[#0E9F6E]/30 hover:bg-[#0E9F6E]/90 dark:bg-[#10B981] dark:hover:bg-[#10B981]/90",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-10 px-4 text-sm rounded-xl gap-2",
      lg: "h-12 px-6 text-base rounded-xl gap-2.5",
      xl: "h-14 px-8 text-lg font-semibold rounded-2xl gap-3",
    };

    return (
      <motion.button
        ref={ref as any}
        whileHover={{ y: -1.5 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={cn(
          "relative flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/30 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden select-none cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || disabled}
        {...(props as any)}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span className={cn(isLoading && "opacity-0", "truncate")}>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);

NexaButton.displayName = "NexaButton";
