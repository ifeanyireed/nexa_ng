"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, CheckCircle2, Clock, FileText, ArrowUpRight, Zap } from "lucide-react";
import { AIAgent } from "@/lib/gtm-data";
import { GTM_API } from "@/lib/api-client";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

interface AgentDrawerProps {
  agent: AIAgent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AgentDrawer = ({ agent, isOpen, onClose }: AgentDrawerProps) => {
  const [activeTab, setActiveTab] = useState<"chat" | "tasks" | "outputs">("chat");
  const [messages, setMessages] = useState<
    { sender: "user" | "agent"; text: string; time: string; model?: string }[]
  >([
    {
      sender: "agent",
      text: "Hello! I am actively executing our GTM plan. How can I assist you with this stream of work?",
      time: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  if (!agent) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userPrompt = inputText;
    const newMsg = {
      sender: "user" as const,
      text: userPrompt,
      time: "Just now",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const resp = await GTM_API.chatWithAgent("org-01", agent.id, userPrompt);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: resp.text,
          time: "Just now",
          model: resp.model_used,
        },
      ]);
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: `Understood. As your ${agent.role}, I'm prioritizing this right away. I will incorporate these guidelines into my current task: "${agent.currentTask}".`,
          time: "Just now",
        },
      ]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-screen max-w-xl liquid-glass bg-[var(--nexa-bg-surface)]/95 shadow-2xl border-l border-[var(--glass-border)] flex flex-col h-full z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-[var(--nexa-border)] shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <NexaAvatar
                      name={agent.name}
                      src={agent.avatar}
                      size="lg"
                      status={agent.status}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-[var(--nexa-text-primary)] text-display">
                          {agent.name}
                        </h2>
                        <NexaBadge
                          variant={agent.status === "working" ? "brand" : "success"}
                          dot
                        >
                          {agent.status === "working" ? "Working" : "Active"}
                        </NexaBadge>
                      </div>
                      <p className="text-xs font-medium text-[var(--nexa-text-muted)]">
                        {agent.role} · {agent.category}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl text-[var(--nexa-text-faint)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-base)] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Current Live Task Banner */}
                <div className="mt-4 p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--nexa-text-muted)] mb-1.5">
                    <span className="flex items-center gap-1.5 text-[#1A56DB] dark:text-[#60A5FA]">
                      <Zap className="w-3.5 h-3.5" />
                      Live Task
                    </span>
                    <span className="text-mono">{agent.taskProgress}% Complete</span>
                  </div>
                  <p className="text-xs text-[var(--nexa-text-secondary)] font-medium">
                    {agent.currentTask}
                  </p>
                  <div className="w-full bg-[var(--nexa-border)] h-1.5 rounded-full overflow-hidden mt-2.5">
                    <div
                      className="bg-gradient-to-r from-[#1A56DB] to-[#0E9F6E] h-full rounded-full transition-all duration-500"
                      style={{ width: `${agent.taskProgress}%` }}
                    />
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4 pt-1">
                  {(["chat", "tasks", "outputs"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all capitalize cursor-pointer ${
                        activeTab === tab
                          ? "bg-[#1A56DB] text-white shadow-sm dark:bg-[#3B82F6]"
                          : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-base)]"
                      }`}
                    >
                      {tab === "chat" ? "Conversation" : tab === "tasks" ? "Today's Work" : "Deliverables"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeTab === "chat" && (
                  <div className="flex flex-col h-full justify-between gap-4">
                    <div className="space-y-3.5">
                      {messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-col ${
                            msg.sender === "user" ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                              msg.sender === "user"
                                ? "bg-[#1A56DB] text-white rounded-br-none"
                                : "liquid-glass bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] border border-[var(--nexa-border)] rounded-bl-none"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[10px] text-[var(--nexa-text-faint)] mt-1 px-1">
                            {msg.time}
                          </span>
                        </div>
                      ))}

                      {isTyping && (
                        <div className="flex items-center gap-2 text-xs text-[var(--nexa-text-muted)]">
                          <span className="w-2 h-2 rounded-full bg-[#1A56DB] animate-bounce" />
                          <span>{agent.name} is reasoning...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "tasks" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl liquid-glass border border-[var(--nexa-border)]">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--nexa-text-muted)] mb-3">
                        Today's Telemetry
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {agent.todayStats.map((stat, i) => (
                          <div key={i} className="p-2.5 bg-[var(--nexa-bg-base)] rounded-xl">
                            <div className="text-[10px] text-[var(--nexa-text-muted)] truncate">
                              {stat.label}
                            </div>
                            <div className="text-base font-bold text-[var(--nexa-text-primary)] text-mono mt-0.5">
                              {stat.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FFFBEB] dark:bg-[#F59E0B]/10 border border-[#C88A3A]/20">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#C88A3A] mb-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Agent Recommendation
                      </div>
                      <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                        "{agent.recommendation}"
                      </p>
                      <div className="mt-3 flex justify-end">
                        <NexaButton size="sm" variant="primary">
                          Adopt Recommendation
                        </NexaButton>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "outputs" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--nexa-text-muted)] mb-2">
                      Recent Deliverables & Artifacts
                    </h4>
                    {agent.recentOutputs.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl liquid-glass border border-[var(--nexa-border)] flex items-center justify-between hover:border-[#1A56DB]/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-[#EBF5FF] dark:bg-[#3B82F6]/20 text-[#1A56DB] dark:text-[#60A5FA]">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[var(--nexa-text-primary)] group-hover:text-[#1A56DB] transition-colors">
                              {item.title}
                            </div>
                            <div className="text-[10px] text-[var(--nexa-text-faint)] flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3 h-3" /> {item.timestamp} · <span className="capitalize">{item.type}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[var(--nexa-text-faint)] group-hover:text-[#1A56DB] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              {activeTab === "chat" && (
                <div className="p-4 border-t border-[var(--nexa-border)] shrink-0 bg-[var(--nexa-bg-surface)]">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Direct message to ${agent.name}...`}
                      className="flex-1 h-11 px-4 text-sm rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB] dark:focus:border-[#3B82F6]"
                    />
                    <NexaButton type="submit" size="md" variant="primary" rightIcon={<Send className="w-3.5 h-3.5" />}>
                      Send
                    </NexaButton>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
