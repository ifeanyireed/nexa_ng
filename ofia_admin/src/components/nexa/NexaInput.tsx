"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NexaInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  variant?: "default" | "search";
  error?: string;
  prefix?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const NexaInput = React.forwardRef<HTMLInputElement, NexaInputProps>(
  (
    {
      className,
      label,
      variant = "default",
      error,
      prefix,
      leftIcon,
      rightIcon,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

    React.useEffect(() => {
      if (props.value !== undefined) {
        setHasValue(!!props.value);
      }
    }, [props.value]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      onBlur?.(e);
    };

    const isFloating = isFocused || hasValue;

    return (
      <div className="flex flex-col gap-1 w-full">
        <div
          className={cn(
            "relative flex items-center h-11 rounded-xl border-[0.5px] bg-[var(--nexa-bg-surface)] transition-all duration-200",
            isFocused
              ? "border-[#1A56DB] dark:border-[#3B82F6] shadow-[0_0_0_2px_rgba(26,86,219,0.15)]"
              : "border-[var(--nexa-border)]",
            error && "border-[#E02424]",
            className
          )}
        >
          {variant === "search" && (
            <div className="pl-3 pr-2 text-[var(--nexa-text-faint)]">
              <Search className="w-4 h-4" />
            </div>
          )}

          {leftIcon && (
            <div className="pl-3 pr-1 text-[var(--nexa-text-faint)]">{leftIcon}</div>
          )}

          {prefix && <div className="pl-3 pr-2 text-sm text-[var(--nexa-text-muted)]">{prefix}</div>}

          <div className="relative flex-1 h-full px-3">
            {label && (
              <motion.label
                initial={false}
                animate={{
                  y: isFloating ? -22 : 0,
                  scale: isFloating ? 0.8 : 1,
                  color: isFocused ? "#1A56DB" : "var(--nexa-text-muted)",
                  backgroundColor: isFloating ? "var(--nexa-bg-surface)" : "transparent",
                  paddingLeft: isFloating ? "4px" : "0px",
                  paddingRight: isFloating ? "4px" : "0px",
                }}
                className={cn(
                  "absolute left-3 top-2.5 origin-left pointer-events-none transition-[color,padding,background-color] z-10 text-sm font-medium whitespace-nowrap",
                  (leftIcon || variant === "search") && !isFloating && "left-0"
                )}
              >
                {label}
              </motion.label>
            )}
            <input
              ref={ref}
              className={cn(
                "w-full h-full bg-transparent outline-none text-sm text-[var(--nexa-text-primary)] transition-all",
                "placeholder:text-[var(--nexa-text-faint)]",
                label && isFloating ? "pt-2" : "pt-0"
              )}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={(e) => {
                setHasValue(!!e.target.value);
                props.onChange?.(e);
              }}
              {...props}
            />
          </div>

          {rightIcon && (
            <div className="pr-3 pl-1 text-[var(--nexa-text-faint)]">{rightIcon}</div>
          )}
        </div>
        {error && <span className="text-xs text-[#E02424] px-1">{error}</span>}
      </div>
    );
  }
);

NexaInput.displayName = "NexaInput";
