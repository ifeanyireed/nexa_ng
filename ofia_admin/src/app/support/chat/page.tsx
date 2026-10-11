"use client";

import React, { useState, useEffect, useRef } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { Volume2, VolumeX, Bell, Radio } from "lucide-react";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";
import { playSupportChime } from "@/lib/audio-chime";

interface ChatMessage {
  id: string;
  session_id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export default function SupportChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [sessionsData, setSessionsData] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [showMobileThread, setShowMobileThread] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentPing, setRecentPing] = useState<{ id: string; sender: string; text: string } | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const knownMsgIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  const triggerPing = (msg: { id: string; sender: string; text: string }) => {
    if (soundEnabled) {
      playSupportChime();
    }
    setRecentPing(msg);
    setTimeout(() => {
      setRecentPing((curr) => (curr?.id === msg.id ? null : curr));
    }, 4500);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("nexa_auth_token") || localStorage.getItem("resultspro_admin_token")
          : null;
      const res = await fetch(`/api/support/chat/sessions`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data: any[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setSessionsData(data);
          if (!activeSession) {
            setActiveSession(data[0].session_id);
            fetchHistory(data[0].session_id);
          }
        } else {
          setSessionsData([]);
          setActiveSession(null);
        }
      } else {
        setSessionsData([]);
        setActiveSession(null);
      }
    } catch {
      setSessionsData([]);
      setActiveSession(null);
    }
  };

  const fetchHistory = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/support/chat/history?session_id=${sessionId}`);
      if (res.ok) {
        const data: ChatMessage[] = await res.json();
        if (Array.isArray(data)) {
          // Play realtime chime when a new message arrives from a visitor/customer
          if (!isInitialLoadRef.current && knownMsgIdsRef.current.size > 0) {
            const newVisitorMsg = data.find(
              (m) =>
                !knownMsgIdsRef.current.has(m.id) &&
                m.sender !== "Support" &&
                m.sender !== "Support Staff" &&
                m.sender !== "Support Lead"
            );
            if (newVisitorMsg) {
              triggerPing(newVisitorMsg);
            }
          }

          data.forEach((m) => knownMsgIdsRef.current.add(m.id));

          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = data.filter((m: ChatMessage) => !existingIds.has(m.id));
            if (newMsgs.length === 0) return prev;
            return [...prev, ...newMsgs].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
          });
        }
      }
    } catch {} finally {
      isInitialLoadRef.current = false;
    }
  };

  const handleSessionClick = (sessionId: string) => {
    setActiveSession(sessionId);
    fetchHistory(sessionId);
    setShowMobileThread(true);
  };

  useEffect(() => {
    if (activeSession) {
      fetchHistory(activeSession);
    }
  }, [activeSession]);

  // Periodic realtime synchronization: poll sessions & active history every 3.5s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSessions();
      if (activeSession) {
        fetchHistory(activeSession);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [activeSession]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = process.env.NEXT_PUBLIC_USERS_API
      ? process.env.NEXT_PUBLIC_USERS_API.replace(/^http/, "ws") + "/api/v1/support/ws?role=staff"
      : `${protocol}//localhost:8081/api/v1/support/ws?role=staff`;

    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const newMsg = JSON.parse(event.data);
          if (newMsg.type === "status") return;

          if (!knownMsgIdsRef.current.has(newMsg.id)) {
            knownMsgIdsRef.current.add(newMsg.id);
            if (
              newMsg.sender !== "Support" &&
              newMsg.sender !== "Support Staff" &&
              newMsg.sender !== "Support Lead"
            ) {
              triggerPing(newMsg);
            }
          }

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          if (newMsg.sender === "Guest" && !activeSession) {
            setActiveSession(newMsg.session_id);
          }
        } catch {}
      };

      ws.current.onerror = () => {
        setConnected(false);
      };

      ws.current.onclose = () => {
        setConnected(false);
      };
    } catch {
      setConnected(false);
    }

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeSession) return;

    const currentMsgText = message.trim();
    const msgObj: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "Support",
      session_id: activeSession,
      text: currentMsgText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, msgObj]);
    setMessage("");

    // Send via WebSocket if live
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msgObj));
    }

    // Persist via HTTP API
    try {
      await fetch(`/api/support/chat/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: activeSession,
          sender: "Support Lead",
          text: currentMsgText,
        }),
      });
    } catch {}
  };

  const displayMessages = messages.filter((m) => m.session_id === activeSession);

  const activeSessionIds = Array.from(
    new Set([
      ...sessionsData.map((s) => s.session_id),
      ...messages.map((m) => m.session_id).filter(Boolean),
    ])
  );

  return (
    <SuperAdminShell
      title="Live Support Chat"
      subtitle="Real-time WebSocket conversations with storefront visitors and merchants."
    >
      <div className="space-y-4">
        <NexaCard
          variant="glass"
          padding="none"
          className="flex flex-col md:flex-row h-[calc(100vh-230px)] min-h-[480px] border border-[var(--nexa-border)] rounded-3xl overflow-hidden shadow-sm"
        >
          {/* Sessions Sidebar */}
          <div
            className={`w-full md:w-1/3 md:max-w-xs border-r border-[var(--nexa-border)] flex-col bg-[var(--nexa-bg-base)]/50 ${
              showMobileThread ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="p-4 border-b border-[var(--nexa-border)] flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--nexa-text-muted)]">
                Active Conversations
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-nexa-brand/10 text-nexa-brand font-bold">
                {activeSessionIds.length} Sessions
              </span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeSessionIds.length === 0 ? (
                <p className="text-xs text-[var(--nexa-text-muted)] p-6 text-center">No active chats</p>
              ) : (
                activeSessionIds.map((sessionId) => {
                  const sessionMsgs = messages.filter((m) => m.session_id === sessionId);
                  let lastMsg = sessionMsgs[sessionMsgs.length - 1];

                  if (!lastMsg) {
                    lastMsg = sessionsData.find((s) => s.session_id === sessionId);
                  }

                  const isActive = activeSession === sessionId;

                  return (
                    <div
                      key={sessionId}
                      onClick={() => handleSessionClick(sessionId)}
                      className={`p-4 border-b border-[var(--nexa-border)] cursor-pointer transition-colors ${
                        isActive
                          ? "bg-nexa-brand/10 border-l-4 border-l-nexa-brand"
                          : "hover:bg-[var(--nexa-bg-base)] border-l-4 border-l-transparent"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-xs text-[var(--nexa-text-primary)]">
                          Visitor {sessionId.replace("sess-", "")}
                        </span>
                        <span className="text-[10px] text-[var(--nexa-text-muted)]">
                          {lastMsg
                            ? new Date(lastMsg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--nexa-text-secondary)] truncate">
                        {lastMsg ? lastMsg.text : "..."}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div
            className={`flex-1 flex-col relative bg-[var(--nexa-bg-surface)] ${
              !showMobileThread ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Chat Header */}
            <div className="p-3.5 sm:p-4 border-b border-[var(--nexa-border)] flex justify-between items-center bg-[var(--nexa-bg-base)]/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setShowMobileThread(false)}
                  className="md:hidden px-2.5 py-1 rounded-xl border border-[var(--nexa-border)] text-nexa-text-secondary hover:text-nexa-text-primary hover:bg-[var(--nexa-bg-base)] text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>←</span>
                  <span>Chats</span>
                </button>
                <h3 className="text-xs sm:text-sm font-bold text-[var(--nexa-text-primary)] truncate">
                  {activeSession
                    ? `Visitor ${activeSession.replace("sess-", "")}`
                    : "Select a chat session"}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Audio Chime Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !soundEnabled;
                    setSoundEnabled(next);
                    if (next) playSupportChime();
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    soundEnabled
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                      : "bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20"
                  }`}
                  title={soundEnabled ? "Audio Chime Enabled (Click to Mute)" : "Audio Chime Muted (Click to Unmute)"}
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="hidden sm:inline">Chime On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline">Chime Muted</span>
                    </>
                  )}
                </button>

                {/* Test Sound Button */}
                <button
                  type="button"
                  onClick={() => playSupportChime()}
                  className="px-2 py-1 rounded-xl text-[11px] font-semibold text-nexa-text-muted hover:text-nexa-text-primary border border-[var(--nexa-border)] hover:bg-[var(--nexa-bg-base)] transition-colors cursor-pointer hidden sm:inline-block"
                  title="Test notification chime tone"
                >
                  Test Sound
                </button>

                {/* Gateway Status Badge */}
                <div className="flex items-center gap-1.5 pl-1.5 border-l border-[var(--nexa-border)]">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      connected ? "bg-emerald-500 animate-pulse" : "bg-blue-500 animate-pulse"
                    }`}
                  />
                  <span className="text-[11px] font-semibold text-[var(--nexa-text-muted)] hidden md:inline">
                    {connected ? "Gateway Online" : "Neon Live Sync"}
                  </span>
                </div>
              </div>
            </div>

            {/* Realtime Ping Alert Banner */}
            {recentPing && (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center gap-2 truncate">
                  <Bell className="w-4 h-4 text-emerald-200 animate-bounce shrink-0" />
                  <span className="truncate">
                    New message from <span className="underline">{recentPing.sender}</span>: &quot;{recentPing.text}&quot;
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full font-mono shrink-0 ml-2">
                  Realtime Ping
                </span>
              </div>
            )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[var(--nexa-bg-base)]/20">
            {!activeSession ? (
              <div className="flex h-full items-center justify-center text-xs text-[var(--nexa-text-muted)]">
                Select a conversation from the left to start responding
              </div>
            ) : displayMessages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-xs text-[var(--nexa-text-muted)] space-y-2">
                <span>Waiting for incoming customer messages...</span>
                <span className="text-[10px] text-nexa-text-muted font-mono">
                  Session Token: {activeSession}
                </span>
              </div>
            ) : (
              displayMessages.map((m, idx) => {
                const isSupport = m.sender === "Support";
                return (
                  <div
                    key={m.id || idx}
                    className={`flex flex-col ${isSupport ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[10px] text-[var(--nexa-text-muted)]">
                      <span className="font-bold">{isSupport ? "You (Support)" : m.sender}</span>
                      <span>•</span>
                      <span>
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isSupport
                          ? "bg-nexa-brand text-white rounded-tr-xs shadow-xs"
                          : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] border border-[var(--nexa-border)] rounded-tl-xs"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={activeSession ? "Type your live reply..." : "Select a session first"}
                disabled={!activeSession}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-nexa-brand"
              />
              <NexaButton
                variant="primary"
                size="sm"
                type="submit"
                disabled={!message.trim() || !activeSession}
                rightIcon={<PaperAirplaneIcon className="w-3.5 h-3.5" />}
              >
                Send
              </NexaButton>
            </div>
          </form>
        </div>
      </NexaCard>
    </div>
    </SuperAdminShell>
  );
}
