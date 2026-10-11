"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeftIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import Link from "next/link";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";

export default function TicketDetailPage() {
  const routeParams = useParams();
  const ticketId = routeParams?.id as string;

  const [messages, setMessages] = useState<any[]>([]);
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchThread();
  }, [ticketId]);

  const fetchThread = async () => {
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("nexa_auth_token") || localStorage.getItem("resultspro_admin_token")
          : null;

      const tRes = await fetch(`/api/support/tickets/${ticketId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (tRes.ok) {
        const current = await tRes.json();
        setTicket(current || null);
        setError(null);
      } else {
        setTicket(null);
        setError(`Ticket #${ticketId} not found in database (HTTP ${tRes.status})`);
      }

      const res = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      setTicket(null);
      setMessages([]);
      setError("Database connection error: " + (err?.message || "Failed to reach server"));
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);

    const messageContent = reply;
    const newMsgObj = {
      id: `msg-${Date.now()}`,
      sender_type: "staff",
      sender_name: "Support & Editorial Lead",
      message: messageContent,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsgObj]);
    setReply("");

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("nexa_auth_token") || localStorage.getItem("resultspro_admin_token")
          : null;
      await fetch(`/api/support/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: messageContent,
          sender_type: "staff",
          sender_role: "staff",
          sender_name: "Support & Editorial Lead",
        }),
      });

      if (ticket?.status === "open") {
        updateStatus("in-progress");
      }
    } catch {} finally {
      setSending(false);
    }
  };

  const updateStatus = async (status: string) => {
    setUpdating(true);
    setTicket((prev: any) => ({ ...prev, status }));
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("nexa_auth_token") || localStorage.getItem("resultspro_admin_token")
          : null;
      await fetch(`/api/support/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
    } catch {} finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <SuperAdminShell
        title={`Ticket #${ticketId}`}
        subtitle="Loading ticket conversation thread..."
      >
        <div className="p-12 text-center text-xs text-[var(--nexa-text-muted)]">
          Loading ticket conversation...
        </div>
      </SuperAdminShell>
    );
  }

  if (!loading && (!ticket || error)) {
    return (
      <SuperAdminShell
        title={`Ticket #${ticketId}`}
        subtitle="Ticket not found or unavailable."
      >
        <div className="p-12 text-center space-y-4">
          <p className="text-xs text-rose-500 font-semibold">{error || "Ticket not found in database."}</p>
          <Link
            href="/support/tickets"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-nexa-brand hover:underline"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Return to Tickets Queue</span>
          </Link>
        </div>
      </SuperAdminShell>
    );
  }

  return (
    <SuperAdminShell
      title={`Ticket #${ticketId}`}
      subtitle={ticket?.subject || "Direct customer care message thread and resolution controls."}
      action={
        <div className="flex items-center gap-3">
          <Link
            href="/support/tickets"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--nexa-text-secondary)] hover:text-nexa-brand transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>All Tickets</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--nexa-text-muted)] font-medium">Status:</span>
            <select
              value={ticket?.status || "open"}
              disabled={updating}
              onChange={(e) => updateStatus(e.target.value)}
              className="bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs font-bold rounded-xl px-3 py-1.5 outline-none focus:border-nexa-brand cursor-pointer"
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Ticket Header Card */}
      <NexaCard variant="glass" padding="md" className="border border-[var(--nexa-border)] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-nexa-brand/10 text-nexa-brand">
                #{ticket?.id}
              </span>
              <span className="text-xs font-medium text-[var(--nexa-text-muted)]">
                {ticket?.category}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[var(--nexa-text-primary)]">
              {ticket?.subject}
            </h2>
            <p className="text-xs text-[var(--nexa-text-secondary)] mt-1">
              Requested by <strong className="text-[var(--nexa-text-primary)]">{ticket?.user_full_name}</strong> on{" "}
              {new Date(ticket?.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </NexaCard>

      {/* Conversation Thread */}
      <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] pb-2">
          Conversation Thread ({messages.length})
        </h3>

        <div className="space-y-4 min-h-[300px] max-h-[500px] overflow-y-auto p-2">
          {messages.map((m, idx) => {
            const isStaff = m.sender_type === "staff";
            return (
              <div
                key={m.id || idx}
                className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-2 mb-1 text-[11px] text-[var(--nexa-text-muted)]">
                  <span className="font-bold text-[var(--nexa-text-secondary)]">
                    {isStaff ? "Support Specialist (You)" : ticket?.user_full_name || "Merchant"}
                  </span>
                  <span>•</span>
                  <span>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>

                <div
                  className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                    isStaff
                      ? "bg-nexa-brand text-white rounded-tr-xs shadow-xs"
                      : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] border border-[var(--nexa-border)] rounded-tl-xs"
                  }`}
                >
                  {m.message}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply Form */}
        <form onSubmit={handleSendReply} className="pt-4 border-t border-[var(--nexa-border)]">
          <div className="flex gap-2.5">
            <input
              type="text"
              placeholder="Type your response to the merchant..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-nexa-brand"
            />
            <NexaButton
              variant="primary"
              size="sm"
              type="submit"
              disabled={sending || !reply.trim()}
              rightIcon={<PaperAirplaneIcon className="w-3.5 h-3.5" />}
            >
              {sending ? "Sending..." : "Send Reply"}
            </NexaButton>
          </div>
        </form>
      </NexaCard>
    </div>
    </SuperAdminShell>
  );
}
