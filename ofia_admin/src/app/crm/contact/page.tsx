"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Filter,
  HelpCircle,
  LifeBuoy,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge, NexaBadgeVariant } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaModal } from "@/components/nexa/NexaModal";
import { ContactMessageItem } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const SUBJECT_OPTIONS = [
  "ALL",
  "General Inquiry",
  "Technical Issue",
  "Business Partnership",
  "Billing / Payments",
  "Report a Business",
];

const STATUS_OPTIONS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITY_OPTIONS = ["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"];

export default function ContactCRMPage() {
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");

  // Drawer state
  const [activeTicket, setActiveTicket] = useState<ContactMessageItem | null>(null);
  const [activeNotes, setActiveNotes] = useState("");
  const [activeAssignee, setActiveAssignee] = useState("");
  const [updating, setUpdating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (selectedSubject !== "ALL") params.set("subject", selectedSubject);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedPriority !== "ALL") params.set("priority", selectedPriority);

      const res = await fetch(`/api/crm/contact?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to fetch contact inquiries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedSubject, selectedStatus, selectedPriority]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMessages();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenDrawer = (ticket: ContactMessageItem) => {
    setActiveTicket(ticket);
    setActiveNotes(ticket.resolutionNotes || "");
    setActiveAssignee(ticket.assignedTo || "");
  };

  const handleCloseDrawer = () => {
    setActiveTicket(null);
  };

  const handleUpdateTicket = async (ticketId: string, updates: Partial<ContactMessageItem>) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/crm/contact/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updated = await res.json();
        setMessages((prev) =>
          prev.map((item) => (item.id === ticketId ? updated : item))
        );
        if (activeTicket && activeTicket.id === ticketId) {
          setActiveTicket(updated);
        }
        setFeedbackMessage(`Updated ticket ${updated.ticketNumber}`);
        setTimeout(() => setFeedbackMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to update ticket", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveDrawer = async () => {
    if (!activeTicket) return;
    await handleUpdateTicket(activeTicket.id, {
      resolutionNotes: activeNotes,
      assignedTo: activeAssignee,
    });
  };

  const getPriorityBadgeVariant = (priority: string): NexaBadgeVariant => {
    switch (priority) {
      case "URGENT":
        return "danger";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "brand";
      default:
        return "neutral";
    }
  };

  const getStatusBadgeVariant = (status: string): NexaBadgeVariant => {
    switch (status) {
      case "RESOLVED":
        return "success";
      case "IN_PROGRESS":
        return "brand";
      case "OPEN":
        return "warning";
      default:
        return "neutral";
    }
  };

  return (
    <SuperAdminShell
      title="Contact Form Inquiries & Support Tickets"
      subtitle="Manage, triage, and resolve incoming inbound messages and support requests submitted via the public /contact page."
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/crm/waitlist">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Waitlist Pipeline
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* TOAST FEEDBACK NOTIFICATION */}
        {feedbackMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{feedbackMessage}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* KPI BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#1A56DB]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Total Inbound Tickets</span>
              <Mail className="w-4 h-4 text-[#1A56DB]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              {messages.length} Messages
            </div>
            <div className="text-[11px] text-[#1A56DB] font-semibold">
              Live queue from /contact portal
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#C88A3A]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Open / Action Required</span>
              <Clock className="w-4 h-4 text-[#C88A3A]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              {messages.filter((m) => m.status === "OPEN").length} Pending
            </div>
            <div className="text-[11px] text-[#C88A3A] font-semibold">
              Requires immediate triage
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#0E9F6E]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">In Progress</span>
              <Sparkles className="w-4 h-4 text-[#0E9F6E]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              {messages.filter((m) => m.status === "IN_PROGRESS").length} Active
            </div>
            <div className="text-[11px] text-[#0E9F6E] font-semibold">
              Assigned to specialist reps
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#7E22CE]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Resolution Rate</span>
              <CheckCircle2 className="w-4 h-4 text-[#7E22CE]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              92.4%
            </div>
            <div className="text-[11px] text-[#7E22CE] font-semibold">
              Average response time &lt; 1.5 hrs
            </div>
          </NexaCard>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <NexaCard variant="glass" padding="sm">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search ticket #, sender name, email, phone, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] transition-all placeholder:text-[var(--nexa-text-faint)]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs font-semibold text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] cursor-pointer"
              >
                <option value="ALL">All Subjects</option>
                {SUBJECT_OPTIONS.filter((s) => s !== "ALL").map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs font-semibold text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                {STATUS_OPTIONS.filter((s) => s !== "ALL").map((s) => (
                  <option key={s} value={s}>
                    Status: {s}
                  </option>
                ))}
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs font-semibold text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                {PRIORITY_OPTIONS.filter((p) => p !== "ALL").map((p) => (
                  <option key={p} value={p}>
                    Priority: {p}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={fetchMessages}
                className="h-10 px-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:text-[#1A56DB] flex items-center justify-center transition-colors cursor-pointer"
                title="Refresh Table"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              </button>
            </div>
          </div>
        </NexaCard>

        {/* INQUIRIES TABLE */}
        <div className="rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Ticket & Sender</th>
                  <th className="py-3.5 px-4">Subject & Excerpt</th>
                  <th className="py-3.5 px-3">Priority</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Assigned Agent</th>
                  <th className="py-3.5 px-3">Received</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <tr
                      key={msg.id}
                      className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDrawer(msg)}
                    >
                      {/* Ticket & Sender */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-[#1A56DB] border border-blue-200 dark:border-blue-800">
                            {msg.ticketNumber}
                          </span>
                          <div>
                            <div className="font-bold text-xs">{msg.name}</div>
                            <div className="text-[10px] text-[var(--nexa-text-muted)]">{msg.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Subject & Excerpt */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-[#1A56DB]">{msg.subject}</div>
                        <div className="text-[11px] text-[var(--nexa-text-muted)] line-clamp-1 mt-0.5">
                          {msg.message}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-3">
                        <NexaBadge variant={getPriorityBadgeVariant(msg.priority)}>
                          {msg.priority}
                        </NexaBadge>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <NexaBadge variant={getStatusBadgeVariant(msg.status)}>
                          {msg.status}
                        </NexaBadge>
                      </td>

                      {/* Assigned Agent */}
                      <td className="py-3.5 px-3">
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          {msg.assignedTo || "Unassigned"}
                        </span>
                      </td>

                      {/* Received Date */}
                      <td className="py-3.5 px-3 font-mono text-[10px] text-[var(--nexa-text-muted)]">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {msg.phone && (
                            <a
                              href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Hello ${msg.name}, this is Ofia Support following up on your ticket ${msg.ticketNumber} regarding "${msg.subject}".`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-[#25D366] hover:bg-[#25D366]/10"
                              title="Reply on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <a
                            href={`mailto:${msg.email}?subject=${encodeURIComponent(
                              `[${msg.ticketNumber}] Response to: ${msg.subject}`
                            )}`}
                            className="p-1.5 rounded-lg text-[#1A56DB] hover:bg-blue-50 dark:hover:bg-blue-950"
                            title="Reply via Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(msg)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <div className="font-bold text-xs">No contact tickets found</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Inbound messages submitted on /contact will appear in this queue.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TICKET DETAIL INSPECTION DRAWER */}
      {activeTicket && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={handleCloseDrawer} />
          <div className="relative w-full max-w-lg bg-[var(--nexa-bg-surface)] h-full shadow-2xl border-l border-[var(--nexa-border)] flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-[var(--nexa-border)] flex items-center justify-between bg-[var(--nexa-bg-base)]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-[#1A56DB] text-white">
                    {activeTicket.ticketNumber}
                  </span>
                  <NexaBadge variant={getStatusBadgeVariant(activeTicket.status)}>
                    {activeTicket.status}
                  </NexaBadge>
                  <NexaBadge variant={getPriorityBadgeVariant(activeTicket.priority)}>
                    {activeTicket.priority} Priority
                  </NexaBadge>
                </div>
                <h3 className="text-base font-black text-[var(--nexa-text-primary)] mt-1.5">
                  {activeTicket.subject}
                </h3>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="w-8 h-8 rounded-full bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-left">
              {/* Quick Communication Actions */}
              <div className="grid grid-cols-2 gap-3">
                {activeTicket.phone ? (
                  <a
                    href={`https://wa.me/${activeTicket.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Hello ${activeTicket.name}, this is Ofia Support following up on your ticket ${activeTicket.ticketNumber} regarding "${activeTicket.subject}".`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Chat</span>
                  </a>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>No Phone Provided</span>
                  </div>
                )}
                <a
                  href={`mailto:${activeTicket.email}?subject=${encodeURIComponent(
                    `[${activeTicket.ticketNumber}] Response: ${activeTicket.subject}`
                  )}`}
                  className="p-3 rounded-xl bg-[#1A56DB] hover:bg-[#1545B0] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Mail className="w-4 h-4" />
                  <span>Direct Email</span>
                </a>
              </div>

              {/* Message Content */}
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--nexa-text-muted)] block">
                  Inbound Message Details
                </span>
                <div className="p-3.5 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {activeTicket.message}
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
                  <div>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] block">Sender</span>
                    <span className="font-bold">{activeTicket.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] block">Email</span>
                    <span className="font-bold truncate block">{activeTicket.email}</span>
                  </div>
                </div>
              </div>

              {/* Triage & Status Controls */}
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--nexa-text-muted)] block">
                  Triage & Assignment
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--nexa-text-muted)] mb-1">
                      Status:
                    </label>
                    <select
                      value={activeTicket.status}
                      onChange={(e) => handleUpdateTicket(activeTicket.id, { status: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-xs font-bold text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] cursor-pointer"
                    >
                      {STATUS_OPTIONS.filter((s) => s !== "ALL").map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[var(--nexa-text-muted)] mb-1">
                      Priority:
                    </label>
                    <select
                      value={activeTicket.priority}
                      onChange={(e) => handleUpdateTicket(activeTicket.id, { priority: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-xs font-bold text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] cursor-pointer"
                    >
                      {PRIORITY_OPTIONS.filter((p) => p !== "ALL").map((pr) => (
                        <option key={pr} value={pr}>
                          {pr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--nexa-text-muted)] mb-1">
                    Assigned Agent / Department:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Enterprise BD Team, Tech Support (Niyi)"
                    value={activeAssignee}
                    onChange={(e) => setActiveAssignee(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB]"
                  />
                </div>
              </div>

              {/* Internal Resolution Notes */}
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--nexa-text-muted)] block">
                  Internal Resolution Notes & Call Log
                </span>
                <textarea
                  rows={3}
                  placeholder="Record customer response, internal discussion, or resolution details..."
                  value={activeNotes}
                  onChange={(e) => setActiveNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] transition-all placeholder:text-[var(--nexa-text-faint)]"
                />
                <div className="flex justify-end">
                  <NexaButton
                    size="sm"
                    variant="primary"
                    disabled={updating}
                    onClick={handleSaveDrawer}
                    className="bg-[#1A56DB] text-white hover:bg-[#1545B0] cursor-pointer"
                  >
                    {updating ? "Saving..." : "Save Ticket Changes"}
                  </NexaButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SuperAdminShell>
  );
}
