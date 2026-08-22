"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export const NexaThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:border-[#1A56DB]/40 transition-all cursor-pointer overflow-hidden"
      )}
      title="Toggle Dark/Light Mode"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" ? (
          <motion.div
            key="sun"
            initial={{ rotate: -180, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 180, scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="w-4 h-4 text-[#F59E0B]" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: -180, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 180, scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="w-4 h-4 text-[#3B82F6]" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};
