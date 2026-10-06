"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Phone,
  Mail,
  Users,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  Building2,
  FileText,
  Filter,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";
import { CrmActivity, DEFAULT_CRM_ACTIVITIES } from "@/lib/crm-service";

export default function SalesActivitiesPage() {
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // New Activity Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [type, setType] = useState<CrmActivity["type"]>("CALL");
  const [rep, setRep] = useState("Chioma Okon");
  const [dateTime, setDateTime] = useState("Today, 03:00 PM");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setActivities(DEFAULT_CRM_ACTIVITIES.map((a) => ({ ...a, tenantSlug: "default" })));
  }, []);

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;

    const newAct: CrmActivity = {
      id: `ACT-${Date.now().toString().slice(-3)}`,
      tenantSlug: "default",
      title: title.trim(),
      company: company.trim(),
      type,
      rep,
      dateTime,
      status: "UPCOMING",
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    setActivities((prev) => [newAct, ...prev]);
    setIsModalOpen(false);
    setTitle("");
    setCompany("");
  };

  const handleMarkComplete = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "COMPLETED" } : a))
    );
  };

  const filtered = activities.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      a.title.toLowerCase().includes(q) ||
      a.company.toLowerCase().includes(q) ||
      a.rep.toLowerCase().includes(q);
    const matchType = typeFilter === "ALL" || a.type === typeFilter;
    return matchSearch && matchType;
  });

  const getActivityIcon = (actType: string) => {
    switch (actType) {
      case "CALL":
        return <Phone className="w-4 h-4 text-blue-500" />;
      case "EMAIL":
        return <Mail className="w-4 h-4 text-emerald-500" />;
      case "DEMO":
        return <Users className="w-4 h-4 text-purple-500" />;
      default:
        return <Calendar className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <ErpAdminShell
      title="Sales & Client Activities"
      subtitle="Track customer calls, live system demos, email outreach logs, and stakeholder meeting notes."
      activeModule="crm"
      action={
        <NexaButton
          variant="primary"
          className="gap-2 text-xs"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Log Activity
        </NexaButton>
      }
    >
      <div className="space-y-6">
        <ErpStatGrid
          stats={[
            {
              label: "Upcoming Engagements",
              value: activities.filter((a) => a.status === "UPCOMING").length.toString(),
              change: "Scheduled calls & demos",
              changeType: "neutral",
              icon: <Clock className="w-4 h-4 text-amber-500" />,
            },
            {
              label: "Completed Interactions",
              value: activities.filter((a) => a.status === "COMPLETED").length.toString(),
              change: "Dispatched & logged",
              changeType: "success",
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            },
            {
              label: "Active Sales Reps",
              value: "3",
              change: "Field coverage across NG",
              changeType: "success",
              icon: <Users className="w-4 h-4 text-blue-500" />,
            },
          ]}
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <NexaInput
              placeholder="Search activity, company, or rep..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "CALL", "EMAIL", "DEMO"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  typeFilter === t
                    ? "bg-[#1A56DB] text-white shadow-xs"
                    : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] border border-[var(--nexa-border)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((act) => (
            <NexaCard key={act.id} className="p-4 hover:border-[#1A56DB]/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex items-center justify-center shrink-0">
                    {getActivityIcon(act.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">{act.title}</h4>
                      <NexaBadge variant={act.status === "COMPLETED" ? "success" : "warning"}>
                        {act.status}
                      </NexaBadge>
                    </div>
                    <p className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                      {act.company} • Rep: <span className="font-medium text-[var(--nexa-text-primary)]">{act.rep}</span>
                    </p>
                    {act.notes && (
                      <p className="text-xs text-[var(--nexa-text-muted)] mt-1.5 bg-[var(--nexa-bg-surface)] p-2 rounded-lg border border-[var(--nexa-border)] max-w-xl">
                        {act.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-bold text-[#1A56DB] bg-[#1A56DB]/10 px-2.5 py-1 rounded-full">
                    {act.dateTime}
                  </span>
                  {act.status === "UPCOMING" && (
                    <button
                      onClick={() => handleMarkComplete(act.id)}
                      className="text-xs font-bold px-3 py-1 rounded-lg border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              </div>
            </NexaCard>
          ))}
        </div>
      </div>

      <NexaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Sales Activity"
        subtitle="Schedule a call, demo, or record client meeting notes."
      >
        <form onSubmit={handleCreateActivity} className="space-y-4">
          <NexaInput
            label="Activity Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. In-person Demonstration of Shop POS & Cash Register"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NexaInput
              label="Company Name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Hubmart Supermarkets"
              required
            />
            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-medium"
              >
                <option value="CALL">Call</option>
                <option value="DEMO">Product Demo</option>
                <option value="EMAIL">Email Outreach</option>
                <option value="MEETING">Meeting</option>
                <option value="NOTE">Internal Note</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NexaInput
              label="Assigned Sales Rep"
              value={rep}
              onChange={(e) => setRep(e.target.value)}
            />
            <NexaInput
              label="Date / Time"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              placeholder="Tomorrow, 11:00 AM"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">Notes & Follow-up</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record outcome or action items..."
              className="w-full px-3 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <NexaButton variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton variant="primary" type="submit">
              Save Activity
            </NexaButton>
          </div>
        </form>
      </NexaModal>
    </ErpAdminShell>
  );
}
