"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, Sparkles, X, ArrowRight, Play, Pause } from "lucide-react";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";

interface VoiceAssistantHUDProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (action: string) => void;
}

export const VoiceAssistantHUD = ({
  isOpen,
  onClose,
  onSelectAction,
}: VoiceAssistantHUDProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");

  const samplePrompts = [
    "What's happening today?",
    "What is Olivia working on right now?",
    "How are our school campaigns performing?",
    "What needs my approval today?",
    "Ask Noah to pause the email follow-up sequence.",
  ];

  useEffect(() => {
    if (isOpen) {
      setIsListening(true);
      setTranscript("");
      setResponse("");
      const timer = setTimeout(() => {
        setTranscript("What's happening today across our revenue engine?");
        setIsListening(false);
        setIsSpeaking(true);
        setResponse(
          "Good morning! Yesterday your AI revenue team researched 1,240 organizations, sent 342 personalized touchpoints, and booked 4 qualified enterprise meetings. Today Olivia is qualifying 200 more school leads in Abuja, and there are 3 campaign items waiting for your approval in the Approval Center."
        );
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handlePromptClick = (prompt: string) => {
    setTranscript(prompt);
    setIsListening(false);
    setIsSpeaking(true);

    if (prompt.includes("Olivia")) {
      setResponse(
        "Olivia Chen (Lead Hunter) is currently extracting verified K-12 administrators in Abuja and Lagos. Her task progress is at 94% with 186 qualified ICP records so far."
      );
    } else if (prompt.includes("approval")) {
      setResponse(
        "You have 3 items awaiting approval: 1) Batch 2 cold outreach email sequence to 450 school principals, 2) Meta Ads budget increase of $150/day on high-ROAS carousels, and 3) WhatsApp broadcast to 120 opt-in leads."
      );
    } else if (prompt.includes("campaigns")) {
      setResponse(
        "Your top-performing campaign is 'Private Schools Operational Leap' pacing at a 14.8% reply rate and $84,000 in pipeline value across 28 booked discovery calls."
      );
    } else {
      setResponse(
        `Understood. I have routed your instruction "${prompt}" to Sterling Vance (CRO) and Devon Reed (Campaign Manager) for immediate coordination.`
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Voice HUD Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl liquid-glass rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--glass-border)] z-10 overflow-hidden bg-[var(--nexa-bg-surface)]/95"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--nexa-border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1A56DB]/10 dark:bg-[#3B82F6]/20 flex items-center justify-center text-[#1A56DB] dark:text-[#60A5FA]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--nexa-text-primary)] text-display">
                    Executive Voice Assistant
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Hands-free natural language intelligence & command center
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[var(--nexa-text-faint)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-base)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Waveform / Orb */}
            <div className="py-8 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                {/* Glowing pulsating outer rings */}
                <motion.div
                  animate={{
                    scale: isListening || isSpeaking ? [1, 1.4, 1] : 1,
                    opacity: isListening || isSpeaking ? [0.3, 0.7, 0.3] : 0.2,
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-[#1A56DB]/30 to-[#0E9F6E]/30 blur-xl pointer-events-none"
                />

                <motion.div
                  animate={{
                    scale: isListening ? [1, 1.15, 1] : isSpeaking ? [1, 1.08, 1] : 1,
                  }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-24 h-24 rounded-full liquid-glass flex items-center justify-center shadow-lg border-2 border-[#1A56DB]/40 dark:border-[#3B82F6]/50 bg-gradient-to-tr from-[#1A56DB]/20 to-[#3F83F8]/10"
                >
                  {isListening ? (
                    <Mic className="w-10 h-10 text-[#1A56DB] dark:text-[#60A5FA] animate-pulse" />
                  ) : isSpeaking ? (
                    <Volume2 className="w-10 h-10 text-[#0E9F6E] dark:text-[#34D399] animate-bounce" />
                  ) : (
                    <MicOff className="w-10 h-10 text-[var(--nexa-text-faint)]" />
                  )}
                </motion.div>
              </div>

              {/* Status pill */}
              <div className="mt-4">
                <NexaBadge
                  variant={isListening ? "brand" : isSpeaking ? "success" : "neutral"}
                  dot
                >
                  {isListening
                    ? "Listening for executive command..."
                    : isSpeaking
                    ? "Executive Voice Response Active"
                    : "Ready"}
                </NexaBadge>
              </div>
            </div>

            {/* Transcript & Response Area */}
            <div className="space-y-3 bg-[var(--nexa-bg-base)]/70 rounded-2xl p-4 border border-[var(--nexa-border)] mb-6">
              {transcript && (
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider shrink-0 mt-0.5">
                    You:
                  </span>
                  <p className="text-sm font-semibold text-[var(--nexa-text-primary)]">
                    "{transcript}"
                  </p>
                </div>
              )}

              {response ? (
                <div className="flex items-start gap-2 pt-2 border-t border-[var(--nexa-border)]">
                  <span className="text-xs font-bold text-[#1A56DB] dark:text-[#60A5FA] uppercase tracking-wider shrink-0 mt-0.5">
                    GTM Engine:
                  </span>
                  <p className="text-sm text-[var(--nexa-text-secondary)] leading-relaxed">
                    {response}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[var(--nexa-text-faint)] italic text-center py-1">
                  Say something or select a quick command below...
                </p>
              )}
            </div>

            {/* Quick Command Suggestions */}
            <div>
              <div className="text-xs font-semibold text-[var(--nexa-text-muted)] uppercase tracking-wider mb-2">
                Suggested Executive Prompts
              </div>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(p)}
                    className="text-xs px-3 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:border-[#1A56DB]/40 hover:text-[#1A56DB] dark:hover:text-[#60A5FA] text-[var(--nexa-text-secondary)] transition-all flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <span>{p}</span>
                    <ArrowRight className="w-3 h-3 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
