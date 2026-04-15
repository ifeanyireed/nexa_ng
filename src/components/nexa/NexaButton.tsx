"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface NexaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const NexaButton = React.forwardRef<HTMLButtonElement, NexaButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, leftIcon, rightIcon, children, ...props }, ref) => {
    const variants = {
      primary: "bg-nexa-brand text-white shadow-[0_1px_3px_0_rgba(26,86,219,0.4)_inset,0_10px_20px_-5px_rgba(26,86,219,0.3)_inset,0_8px_32px_0_rgba(0,0,0,0.3)] border-[0.5px] border-nexa-brand/20 border-t-white/30 hover:bg-nexa-brand/90",
      secondary: "liquid-glass text-nexa-text-primary shadow-[0_1px_3px_0_rgba(255,255,255,0.15)_inset,0_10px_20px_-5px_rgba(255,255,255,0.1)_inset,0_8px_32px_0_rgba(0,0,0,0.3)] border-[0.5px] border-white/10 border-t-white/20",
      ghost: "hover:bg-nexa-brand-light text-nexa-brand dark:hover:bg-white/5",
      danger: "bg-nexa-coral text-white shadow-[0_1px_3px_0_rgba(224,36,36,0.4)_inset,0_10px_20px_-5px_rgba(224,36,36,0.3)_inset,0_8px_32px_0_rgba(0,0,0,0.3)] border-[0.5px] border-nexa-coral/20 border-t-white/30",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      xl: "h-14 px-8 text-lg font-semibold",
    };

    return (
      <motion.button
        ref={ref as any}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={cn(
          "relative flex items-center justify-center gap-2 rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-nexa-brand-glow disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading}
        {...(props as any)}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && leftIcon}
        <span className={cn(isLoading && "opacity-0")}>{children}</span>
        {!isLoading && rightIcon}
        
        {/* Ripple effect placeholder - complex ripple would need a separate component or hook */}
        <motion.span
          initial={{ scale: 0, opacity: 0.35 }}
          whileTap={{ scale: 4, opacity: 0 }}
          className="absolute inset-0 bg-white/35 rounded-full pointer-events-none"
          transition={{ duration: 0.5 }}
        />
      </motion.button>
    );
  }
);

NexaButton.displayName = "NexaButton";
