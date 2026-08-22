"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NexaTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const NexaTextarea = React.forwardRef<HTMLTextAreaElement, NexaTextareaProps>(
  ({ className, label, error, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      onBlur?.(e);
    };

    const isFloating = isFocused || hasValue;

    return (
      <div className="flex flex-col gap-1 w-full">
        <div
          className={cn(
            "relative flex flex-col rounded-lg border-[0.5px] bg-nexa-bg-surface transition-all duration-200",
            isFocused ? "border-nexa-brand shadow-[0_0_0_0.5px_var(--nexa-brand-glow)]" : "border-nexa-border",
            error && "border-nexa-coral animate-[shake_0.4s_ease-in-out]",
            className
          )}
        >
          <div className="relative flex-1 min-h-[120px] px-3 py-2">
            {label && (
              <motion.label
                initial={false}
                animate={{
                  y: isFloating ? -20 : 0,
                  scale: isFloating ? 0.85 : 1,
                  color: isFocused ? "var(--nexa-brand)" : "var(--nexa-text-muted)",
                  backgroundColor: isFloating ? "var(--nexa-bg-surface)" : "transparent",
                  paddingLeft: isFloating ? "4px" : "0px",
                  paddingRight: isFloating ? "4px" : "0px",
                }}
                className="absolute left-3 top-3 origin-left pointer-events-none transition-[color,padding,background-color] z-10"
              >
                {label}
              </motion.label>
            )}
            <textarea
              ref={ref}
              className={cn(
                "w-full h-full bg-transparent outline-none text-nexa-text-primary pt-2 resize-none transition-all",
                "placeholder:text-nexa-text-faint placeholder:transition-opacity placeholder:duration-200",
                "placeholder:opacity-0 hover:placeholder:opacity-100 focus:placeholder:opacity-100",
                !label && "pt-0"
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
        </div>
        {error && <span className="text-xs text-nexa-coral px-1">{error}</span>}
      </div>
    );
  }
);

NexaTextarea.displayName = "NexaTextarea";
