"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TicketIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetchTickets();
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

  const filteredTickets = tickets.filter((t) => {
    if (filter !== "all" && t.status !== filter) return false;
    if (
      search &&
      !t.subject.toLowerCase().includes(search.toLowerCase()) &&
      !(t.user_full_name || "").toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <SuperAdminShell
      title="Support Tickets Queue"
      subtitle="Active merchant assistance queue, triage requests, and escalate technical blockers."
      action={
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by subject or merchant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none rounded-xl py-2 pl-9 pr-3 text-xs text-[var(--nexa-text-primary)] focus:border-nexa-brand transition-colors"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none rounded-xl py-2 px-3 text-xs text-[var(--nexa-text-primary)] focus:border-nexa-brand font-semibold cursor-pointer"
          >
            <option value="all">All Statuses ({tickets.length})</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
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

      {/* Tickets List */}
      <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] shadow-sm">
        {loading ? (
          <div className="text-[var(--nexa-text-muted)] py-12 text-center text-xs">
            Loading tickets...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-[var(--nexa-text-muted)] py-12 text-center text-xs">
            No tickets match your filter criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((t) => (
              <Link key={t.id} href={`/support/tickets/${t.id}`} className="block group">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-[var(--nexa-border)] rounded-2xl bg-[var(--nexa-bg-surface)] hover:border-nexa-brand/50 hover:shadow-xs transition-all cursor-pointer gap-3">
                  <div className="flex items-start gap-4 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                        t.status === "open"
                          ? "bg-rose-500/10 text-rose-500"
                          : t.status === "resolved"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      <TicketIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[var(--nexa-text-primary)] group-hover:text-nexa-brand transition-colors truncate">
                        {t.subject}
                      </h4>
                      <p className="text-xs text-[var(--nexa-text-secondary)] mt-0.5">
                        <span className="font-semibold text-[var(--nexa-text-primary)]">
                          {t.user_full_name || "Unknown Merchant"}
                        </span>{" "}
                        • <span className="font-medium capitalize">{t.category}</span>
                      </p>
                      {t.message && (
                        <p className="text-[11px] text-[var(--nexa-text-muted)] mt-1.5 line-clamp-1 italic bg-[var(--nexa-bg-base)] px-2.5 py-1 rounded-lg border border-[var(--nexa-border)]">
                          &ldquo;{t.message}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start sm:flex-col sm:items-end gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--nexa-border)]/50">
                    <span
                      className={`px-2.5 py-0.5 text-[9px] font-mono font-extrabold uppercase rounded-full border ${
                        t.status === "open"
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          : t.status === "resolved"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }`}
                    >
                      {t.status}
                    </span>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] font-medium">
                      {new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </NexaCard>
    </div>
    </SuperAdminShell>
  );
}
