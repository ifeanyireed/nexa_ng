"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NexaModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | string;
  children: React.ReactNode;
  className?: string;
  backdropClassName?: string;
}

export const NexaModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = "lg",
  children,
  className,
  backdropClassName,
}: NexaModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const maxWMap: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
  };

  const maxWClass = maxWMap[maxWidth] || `max-w-[${maxWidth}]`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={cn("absolute inset-0 bg-black/50 backdrop-blur-md", backdropClassName)}
          />

          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={cn(
              "relative bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] w-full rounded-2xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto",
              maxWClass,
              className
            )}
          >
            {(title || subtitle) && (
              <div className="flex items-start justify-between mb-4 border-b border-[var(--nexa-border)] pb-3">
                <div className="space-y-0.5">
                  {typeof title === "string" ? (
                    <h3 className="text-base font-bold text-[var(--nexa-text-primary)]">{title}</h3>
                  ) : (
                    title
                  )}
                  {subtitle && <p className="text-xs text-[var(--nexa-text-muted)]">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-base)] transition-colors shrink-0 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
