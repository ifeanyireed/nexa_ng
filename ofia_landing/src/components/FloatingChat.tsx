"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Sparkles, Headphones } from "lucide-react";

interface ChatMessage {
  id?: string;
  sender: string;
  text: string;
  timestamp: string;
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStaffOnline, setIsStaffOnline] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const USERS_API = process.env.NEXT_PUBLIC_USERS_API || "http://localhost:8081";
  const ADMIN_API = process.env.NEXT_PUBLIC_ADMIN_API || "http://localhost:3003";

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  // Restore previous chat history if available
  useEffect(() => {
    const fetchHistory = async (sid: string) => {
      try {
        const res = await fetch(`${ADMIN_API}/api/support/chat/history?session_id=${sid}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setMessages(data);
            return;
          }
        }
      } catch {}

      try {
        const res = await fetch(`${USERS_API}/api/v1/support/chat/history?session_id=${sid}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setMessages(data);
          }
        }
      } catch {}
    };

    if (typeof window !== "undefined") {
      const sid = localStorage.getItem("ofia_support_chat_session");
      if (sid) {
        fetchHistory(sid);
      }
    }
  }, [USERS_API, ADMIN_API]);

  // Periodic sync when chat is open to receive staff replies
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(async () => {
      if (typeof window === "undefined") return;
      const sid = localStorage.getItem("ofia_support_chat_session");
      if (!sid) return;

      try {
        const res = await fetch(`${ADMIN_API}/api/support/chat/history?session_id=${sid}`);
        if (res.ok) {
          const data: ChatMessage[] = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setMessages((prev) => {
              const prevLen = prev.length;
              if (data.length > prevLen) {
                return data;
              }
              return prev;
            });
          }
        }
      } catch {}
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, ADMIN_API]);

  // Connect to WebSocket when chat opens
  useEffect(() => {
    if (isOpen && !ws.current && typeof window !== "undefined") {
      let sessionId = localStorage.getItem("ofia_support_chat_session");
      if (!sessionId) {
        sessionId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `guest-${Date.now()}`;
        localStorage.setItem("ofia_support_chat_session", sessionId);
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      let wsUrl = USERS_API.startsWith("http")
        ? USERS_API.replace(/^http/, "ws") + "/api/v1/support/ws"
        : `${protocol}//localhost:8081/api/v1/support/ws`;

      wsUrl += `?role=guest&session_id=${sessionId}`;

      try {
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          setIsStaffOnline(true);
        };

        ws.current.onmessage = (event) => {
          try {
            const newMsg = JSON.parse(event.data);
            if (newMsg.type === "status") {
              setIsStaffOnline(newMsg.staff_online ?? true);
            } else {
              setMessages((prev) => [...prev, newMsg]);
              if (!isOpen) {
                setUnreadCount((c) => c + 1);
              }
            }
          } catch {}
        };

        ws.current.onerror = () => {
          setIsStaffOnline(false);
        };

        ws.current.onclose = () => {
          ws.current = null;
        };
      } catch {
        setIsStaffOnline(false);
      }
    }
  }, [isOpen, USERS_API]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userText = message.trim();
    setMessage("");

    const msgObj: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "Guest",
      text: userText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, msgObj]);

    // Persist to Admin PostgreSQL API and receive Gemini 3.8 Flash autoreply if staff is offline
    if (typeof window !== "undefined") {
      const sid = localStorage.getItem("ofia_support_chat_session") || `guest-${Date.now()}`;
      fetch(`${ADMIN_API}/api/support/chat/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sid,
          sender: "Guest Visitor",
          text: userText,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.ai_reply) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.ai_reply.id)) return prev;
              return [...prev, data.ai_reply];
            });
          }
        })
        .catch(() => {});
    }

    // Send over WebSocket if connected
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify(msgObj));
      } catch {}
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl shadow-2xl mb-4 w-[360px] max-w-[calc(100vw-32px)] max-h-[520px] flex flex-col overflow-hidden transition-all origin-bottom-right animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1A56DB] to-[#1545B0] text-white p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <img
                src="https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png"
                alt="Ofia Support Logo"
                className="w-7 h-7 object-contain brightness-0 invert shrink-0"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <div>
                <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                  Ofia Support Desk
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isStaffOnline ? "bg-emerald-400 animate-pulse" : "bg-white/50"
                    }`}
                  />
                  <p className="text-white/80 text-[11px] font-medium">
                    {isStaffOnline ? "Specialists Active Online" : "Typically replies in minutes"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={toggleChat}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 bg-[var(--nexa-bg-base)] min-h-[300px] max-h-[360px] flex flex-col gap-3 overflow-y-auto">
            {messages.length === 0 && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-nexa-brand/10 text-nexa-brand flex items-center justify-center shrink-0 border border-nexa-brand/20">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] p-3.5 rounded-2xl rounded-tl-xs text-xs text-[var(--nexa-text-primary)] shadow-xs leading-relaxed max-w-[85%]">
                  👋 Hello! Welcome to Ofia. How can we help your business operations today?
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              const isGuest = msg.sender === "Guest";
              return (
                <div
                  key={msg.id || i}
                  className={`flex items-start gap-2 ${isGuest ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                      isGuest
                        ? "bg-slate-800 text-white"
                        : "bg-nexa-brand text-white shadow-xs"
                    }`}
                  >
                    {isGuest ? "You" : "OS"}
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-xs max-w-[82%] leading-relaxed shadow-xs ${
                      isGuest
                        ? "bg-nexa-brand text-white rounded-tr-xs font-medium"
                        : "bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] rounded-tl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-[var(--nexa-bg-surface)] border-t border-[var(--nexa-border)]"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask a question or request support..."
                className="w-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] rounded-full py-2.5 pl-4 pr-11 focus:outline-none focus:border-nexa-brand transition-colors"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="absolute right-1 w-8 h-8 bg-nexa-brand hover:bg-[#1545B0] disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed"
                aria-label="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={toggleChat}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl shadow-[#1A56DB]/30 transition-all hover:scale-105 active:scale-95 cursor-pointer relative ${
          isOpen ? "bg-slate-900" : "bg-gradient-to-tr from-[#1A56DB] to-[#2B6CB0]"
        }`}
        aria-label="Toggle Live Chat Support"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-[10px] font-extrabold flex items-center justify-center text-white border-2 border-[var(--nexa-bg-base)] animate-bounce">
                {unreadCount}
              </span>
            )}
            <span className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[var(--nexa-bg-base)]" />
          </>
        )}
      </button>
    </div>
  );
}
