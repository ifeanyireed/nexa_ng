"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusIcon,
  PlayIcon,
  StopIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";

export default function SupportDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [staffActive, setStaffActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("Platform");
  const [newMessage, setNewMessage] = useState("");
  const [newUserName, setNewUserName] = useState("");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
    fetchStaffStatus();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("nexa_auth_token") || localStorage.getItem("resultspro_admin_token")
          : null;
      const res = await fetch(`/api/support/admin/tickets`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
        setError(null);
      } else {
        setTickets([]);
        setError(`Database query error (HTTP ${res.status})`);
      }
    } catch (err: any) {
      setTickets([]);
      setError("Database connection error: " + (err?.message || "Failed to reach server"));
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffStatus = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("nexa_auth_token") || localStorage.getItem("resultspro_admin_token")
          : null;
      const res = await fetch(`/api/support/staff/status`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setStaffActive(data?.is_active ?? true);
      }
    } catch {}
  };

  const toggleStaffStatus = async (status: boolean) => {
    setStaffActive(status);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("nexa_auth_token") || localStorage.getItem("resultspro_admin_token")
          : null;
      await fetch(`/api/support/staff/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ is_active: status }),
      });
    } catch {}
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("nexa_auth_token") || localStorage.getItem("resultspro_admin_token")
          : null;
      const res = await fetch(`/api/support/admin/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject: newSubject,
          user_full_name: newUserName || "Merchant Partner",
          category: newCategory,
          message: newMessage,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setTickets([created, ...tickets]);
      } else {
        const newT = {
          id: `t-${Date.now().toString().slice(-4)}`,
          subject: newSubject,
          user_full_name: newUserName || "Merchant Partner",
          category: newCategory,
          message: newMessage,
          status: "open",
          created_at: new Date().toISOString(),
        };
        setTickets([newT, ...tickets]);
      }
    } catch {
      const newT = {
        id: `t-${Date.now().toString().slice(-4)}`,
        subject: newSubject,
        user_full_name: newUserName || "Merchant Partner",
        category: newCategory,
        message: newMessage,
        status: "open",
        created_at: new Date().toISOString(),
      };
      setTickets([newT, ...tickets]);
    }
    setNewSubject("");
    setNewMessage("");
    setNewUserName("");
    setShowNewModal(false);
  };

  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgressTickets = tickets.filter((t) => t.status === "in-progress").length;
  const resolvedTickets = tickets.filter((t) => t.status === "resolved").length;

  return (
    <SuperAdminShell
      title="Support System Dashboard"
      subtitle="Manage and resolve incoming merchant support tickets, live chats, and shift operations."
      action={
        <NexaButton
          variant="primary"
          size="sm"
          onClick={() => setShowNewModal(true)}
          leftIcon={<PlusIcon className="w-4 h-4" />}
        >
          Create Ticket
        </NexaButton>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button
              onClick={() => fetchTickets()}
              className="text-[11px] underline hover:text-rose-600 font-bold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}
        {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NexaCard variant="glass" padding="md" className="border border-[var(--nexa-border)] shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 mb-1">
            Open Queue
          </p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[var(--nexa-text-primary)]">{openTickets}</span>
            <NexaBadge variant="rose" size="sm">Urgent</NexaBadge>
          </div>
          <p className="text-[11px] text-[var(--nexa-text-muted)] mt-2">Awaiting first response</p>
        </NexaCard>

        <NexaCard variant="glass" padding="md" className="border border-[var(--nexa-border)] shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 mb-1">
            In Progress
          </p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[var(--nexa-text-primary)]">{inProgressTickets}</span>
            <NexaBadge variant="amber" size="sm">Active</NexaBadge>
          </div>
          <p className="text-[11px] text-[var(--nexa-text-muted)] mt-2">Under staff investigation</p>
        </NexaCard>

        <NexaCard variant="glass" padding="md" className="border border-[var(--nexa-border)] shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500 mb-1">
            Resolved
          </p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[var(--nexa-text-primary)]">{resolvedTickets}</span>
            <NexaBadge variant="emerald" size="sm">Closed</NexaBadge>
          </div>
          <p className="text-[11px] text-[var(--nexa-text-muted)] mt-2">Satisfied merchant tickets</p>
        </NexaCard>

        <NexaCard variant="glass" padding="md" className="border border-[var(--nexa-border)] shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500 mb-1">
            Average Resolution
          </p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[var(--nexa-text-primary)]">1.2h</span>
            <NexaBadge variant="brand" size="sm">98% CSAT</NexaBadge>
          </div>
          <p className="text-[11px] text-[var(--nexa-text-muted)] mt-2">Sub-2h SLA achievement</p>
        </NexaCard>
      </div>

      {/* Main Grid: Tickets on Left, Shift on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--nexa-text-primary)]">
                  Live Ticket Queue
                </h3>
                <p className="text-xs text-[var(--nexa-text-secondary)]">
                  Click any ticket to enter the resolution conversation thread.
                </p>
              </div>
              <Link href="/support/tickets" className="text-xs font-bold text-nexa-brand hover:underline">
                View All Queue →
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-[var(--nexa-text-muted)]">
                Loading support tickets...
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--nexa-text-muted)]">
                No active tickets in queue.
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <Link href={`/support/tickets/${t.id}`} key={t.id} className="block group">
                    <div className="p-4 rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:border-nexa-brand/50 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            t.status === "open"
                              ? "bg-rose-500/10 text-rose-500"
                              : t.status === "in-progress"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-emerald-500/10 text-emerald-500"
                          }`}
                        >
                          <TicketIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[var(--nexa-text-primary)] group-hover:text-nexa-brand transition-colors truncate">
                            {t.subject}
                          </h4>
                          <p className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5">
                            <span className="font-semibold text-[var(--nexa-text-secondary)]">
                              {t.user_full_name || "Merchant"}
                            </span>{" "}
                            • <span className="capitalize">{t.category}</span>
                          </p>
                          {t.message && (
                            <p className="text-[11px] text-[var(--nexa-text-muted)] mt-1.5 line-clamp-1 italic bg-[var(--nexa-bg-base)] px-2.5 py-1 rounded-lg border border-[var(--nexa-border)]">
                              &ldquo;{t.message}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-start sm:flex-col sm:items-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--nexa-border)]/50">
                        <span
                          className={`px-2 py-0.5 text-[9px] font-mono font-extrabold uppercase rounded-full border ${
                            t.status === "open"
                              ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                              : t.status === "in-progress"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          }`}
                        >
                          {t.status}
                        </span>
                        <span className="text-[10px] text-[var(--nexa-text-muted)]">
                          {new Date(t.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </NexaCard>
        </div>

        {/* Right Column: Shift Status & Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--nexa-text-muted)] mb-3">
              Staff Shift Status
            </h3>

            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-center">
              <span
                className={`text-2xl font-black font-display tracking-tight mb-4 ${
                  staffActive ? "text-emerald-500" : "text-[var(--nexa-text-muted)]"
                }`}
              >
                {staffActive ? "🟢 ON SHIFT (ONLINE)" : "⚪ OFF SHIFT (OFFLINE)"}
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleStaffStatus(true)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                    staffActive
                      ? "bg-emerald-500 text-white ring-4 ring-emerald-500/20"
                      : "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)] hover:bg-emerald-500 hover:text-white"
                  }`}
                  title="Go Online"
                >
                  <PlayIcon className="w-5 h-5 ml-0.5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleStaffStatus(false)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                    !staffActive
                      ? "bg-rose-500 text-white ring-4 ring-rose-500/20"
                      : "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)] hover:bg-rose-500 hover:text-white"
                  }`}
                  title="Go Offline"
                >
                  <StopIcon className="w-5 h-5" />
                </button>
              </div>

              <p className="text-[11px] text-[var(--nexa-text-muted)] mt-4 leading-relaxed">
                When active on shift, incoming merchant tickets and live chats are automatically routed to your operator console.
              </p>
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="border border-[var(--nexa-border)] shadow-xs">
            <h4 className="text-xs font-bold text-[var(--nexa-text-primary)] mb-2">
              Support Channels
            </h4>
            <div className="space-y-2">
              <Link
                href="/support/chat"
                className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-nexa-brand/10 border border-[var(--nexa-border)] transition-colors text-xs font-semibold"
              >
                <span>Live Chat Support</span>
                <span className="text-[10px] text-emerald-500 font-bold">Online</span>
              </Link>
              <Link
                href="/support/kb"
                className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-nexa-brand/10 border border-[var(--nexa-border)] transition-colors text-xs font-semibold"
              >
                <span>Knowledge Base Guides</span>
                <span className="text-[10px] text-blue-500 font-bold">12 Docs</span>
              </Link>
            </div>
          </NexaCard>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
              <h3 className="text-base font-bold text-[var(--nexa-text-primary)]">Create Support Ticket</h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                  Merchant / Requester Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alaba Electronics Hub"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-nexa-brand"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-nexa-brand"
                >
                  <option value="Storefronts">Commerce & Storefronts</option>
                  <option value="ERP & POS">Enterprise ERP & POS</option>
                  <option value="Logistics">Logistics & Dispatch</option>
                  <option value="Mobility">Mobility & Transit</option>
                  <option value="Ofia Voice Agent">Ofia Voice Agent & Automation</option>
                  <option value="Billing">Billing & Subscription</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                  Ticket Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="Summary of issue"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-nexa-brand"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                  Issue Details
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide complete error messages or steps to reproduce..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-nexa-brand"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <NexaButton
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowNewModal(false)}
                >
                  Cancel
                </NexaButton>
                <NexaButton variant="primary" size="sm" type="submit">
                  Submit Ticket
                </NexaButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </SuperAdminShell>
  );
}
