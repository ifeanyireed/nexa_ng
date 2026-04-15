"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

interface NexaToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  onClose: (id: string) => void;
  duration?: number;
}

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-nexa-accent" />,
  error: <XCircle className="w-5 h-5 text-nexa-coral" />,
  warning: <AlertCircle className="w-5 h-5 text-nexa-amber" />,
  info: <Info className="w-5 h-5 text-nexa-brand" />,
};

export const NexaToast = ({ id, type, title, message, onClose, duration = 5000 }: NexaToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <motion.div
      layout
      initial={{ x: "120%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "120%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      className="liquid-glass p-4 min-w-[320px] max-w-[400px] flex gap-3 shadow-xl rounded-xl"
    >
      <div className="flex-shrink-0 pt-0.5">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-nexa-text-primary leading-tight">{title}</h4>
        {message && <p className="mt-1 text-xs text-nexa-text-secondary leading-normal">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-nexa-text-faint hover:text-nexa-text-secondary h-min"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
