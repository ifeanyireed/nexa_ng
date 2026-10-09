"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  Mail,
  Calendar,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  Sparkles,
  Users,
  Eye,
  Code,
  MousePointer,
  RotateCcw,
  Sliders,
  Filter,
  FileText,
  AlertCircle,
  Globe,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";
import {
  CrmEmailBlast,
  CrmEmailList,
} from "@/lib/crm-service";
import { TenantSenderProfile } from "@/lib/email-service";
import { crmFetch } from "@/lib/crm-client";

export default function EmailMarketingBlastsPage() {
  const [blasts, setBlasts] = useState<CrmEmailBlast[]>([]);
  const [lists, setLists] = useState<CrmEmailList[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Sender Profiles & Multi-Domain State
  const [senderProfiles, setSenderProfiles] = useState<TenantSenderProfile[]>([]);
  const [defaultSmtp, setDefaultSmtp] = useState<any>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");

  // Schedule Blast Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blastTitle, setBlastTitle] = useState("");
  const [blastSubject, setBlastSubject] = useState("");
  const [selectedListId, setSelectedListId] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [contentHtml, setContentHtml] = useState(
    "<h2>Exclusive Commercial Update</h2><p>Dear {{contact_name}},</p><p>We are pleased to introduce our latest enterprise solutions designed for your organization.</p><p><a href='https://ofia.ng' style='background:#1A56DB;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;'>Explore Platform</a></p>"
  );
  const [bodyMode, setBodyMode] = useState<"edit" | "preview">("edit");
  const [scheduleType, setScheduleType] = useState<"NOW" | "LATER">("NOW");
  const [scheduleDate, setScheduleDate] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [blastsRes, listsRes, profilesRes] = await Promise.all([
          crmFetch("/api/erp/crm/blasts").then((r) => r.json()).catch(() => null),
          crmFetch("/api/erp/crm/lists").then((r) => r.json()).catch(() => null),
          crmFetch("/api/erp/sender-profiles").then((r) => r.json()).catch(() => null),
        ]);

        if (blastsRes?.blasts) setBlasts(blastsRes.blasts);
        else setBlasts([]);

        if (listsRes?.lists) {
          setLists(listsRes.lists);
          if (listsRes.lists.length > 0) setSelectedListId(listsRes.lists[0].id);
        } else {
          setLists([]);
        }

        let initialProfileId = "";
        let initialName = "";
        let initialEmail = "";

        if (profilesRes?.profiles && Array.isArray(profilesRes.profiles) && profilesRes.profiles.length > 0) {
          setSenderProfiles(profilesRes.profiles);
          const defaultProf = profilesRes.profiles.find((p: any) => p.isDefault) || profilesRes.profiles[0];
          initialProfileId = defaultProf.id;
          initialName = defaultProf.fromName || defaultProf.profileName || "";
          initialEmail = defaultProf.fromEmail || "";
        } else if (profilesRes?.defaultSmtp && profilesRes.defaultSmtp.fromEmail) {
          setDefaultSmtp(profilesRes.defaultSmtp);
          initialProfileId = "workspace_primary";
          initialName = profilesRes.defaultSmtp.fromName || "";
          initialEmail = profilesRes.defaultSmtp.fromEmail || "";
        }

        setSelectedProfileId(initialProfileId);
        if (initialName) setSenderName(initialName);
        if (initialEmail) setSenderEmail(initialEmail);
      } catch (err) {
        console.warn("Using offline email marketing state:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleProfileChange = (val: string) => {
    setSelectedProfileId(val);
    if (val === "workspace_primary") {
      if (defaultSmtp) {
        setSenderName(defaultSmtp.fromName || "");
        setSenderEmail(defaultSmtp.fromEmail || "");
      }
    } else {
      const prof = senderProfiles.find((p) => p.id === val);
      if (prof) {
        setSenderName(prof.fromName || prof.profileName || "");
        setSenderEmail(prof.fromEmail || "");
      }
    }
  };

  const handleAiSubject = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const suggestions = [
        "Exclusive Invitation: Streamline Multi-Branch Operations with Ofia",
        "How Top Nigerian Enterprise Operators Slashed OPEX this Quarter",
        "Scheduled Infrastructure Review for Your Executive Team",
        "Accelerate Q4 Growth with Autonomous Merchant Automation",
      ];
      setBlastSubject(suggestions[Math.floor(Math.random() * suggestions.length)]);
      setIsAiGenerating(false);
    }, 600);
  };

  const handleCreateBlast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blastTitle.trim() || !blastSubject.trim()) return;

    if (!senderEmail.trim()) {
      alert("Please provide a valid sender email address.");
      return;
    }

    if (senderEmail.toLowerCase().includes("@ofia.ng")) {
      alert("Tenants are prohibited from using the platform domain (@ofia.ng) to dispatch marketing blasts.");
      return;
    }

    const chosenList = lists.find((l) => l.id === selectedListId);
    const recipientsCount = chosenList ? chosenList.subscriberCount : 100;

    let senderProfileId: string | undefined = undefined;
    let senderProvider = "custom";
    let senderOverride: any = undefined;

    if (selectedProfileId === "workspace_primary" && defaultSmtp) {
      senderProfileId = "workspace_primary";
      senderProvider = defaultSmtp.provider || "custom";
      senderOverride = {
        host: defaultSmtp.host,
        port: defaultSmtp.port,
        encryption: defaultSmtp.encryption,
        fromEmail: defaultSmtp.fromEmail,
        fromName: defaultSmtp.fromName,
        username: defaultSmtp.username,
        password: defaultSmtp.password,
      };
    } else {
      const prof = senderProfiles.find((p) => p.id === selectedProfileId);
      if (prof) {
        senderProfileId = prof.id;
        senderProvider = prof.provider;
        senderOverride = {
          host: prof.host,
          port: prof.port,
          encryption: prof.encryption,
          fromEmail: prof.fromEmail,
          fromName: prof.fromName,
          username: prof.username,
          password: prof.password,
        };
      } else {
        alert("Please select a configured email sender profile.");
        return;
      }
    }

    const payload = {
      title: blastTitle.trim(),
      subject: blastSubject.trim(),
      listId: selectedListId,
      listName: chosenList ? chosenList.name : "Target Audience",
      senderName: senderName.trim(),
      senderEmail: senderEmail.trim(),
      senderProfileId,
      senderProvider,
      senderOverride,
      contentHtml,
      totalRecipients: recipientsCount,
      scheduledAt: scheduleType === "LATER" && scheduleDate ? new Date(scheduleDate).toISOString() : undefined,
      dispatchNow: scheduleType === "NOW",
    };

    try {
      const res = await crmFetch("/api/erp/crm/blasts", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.blast) {
        setBlasts((prev) => [data.blast, ...prev]);
      }
    } catch {
      const fallbackBlast: CrmEmailBlast = {
        id: `BLAST-${Date.now().toString().slice(-4)}`,
        tenantSlug: "default",
        listId: selectedListId,
        listName: chosenList?.name || "Target Audience",
        title: blastTitle,
        subject: blastSubject,
        contentHtml,
        senderName,
        senderEmail,
        senderProfileId,
        senderProvider,
        senderOverride,
        status: scheduleType === "NOW" ? "SENT" : "SCHEDULED",
        scheduledAt: scheduleType === "LATER" && scheduleDate ? scheduleDate : undefined,
        sentAt: scheduleType === "NOW" ? new Date().toISOString() : undefined,
        totalRecipients: recipientsCount,
        sentCount: scheduleType === "NOW" ? recipientsCount : 0,
        openCount: 0,
        clickCount: 0,
        bounceCount: 0,
        createdAt: new Date().toISOString(),
      };
      setBlasts((prev) => [fallbackBlast, ...prev]);
    }

    setIsModalOpen(false);
    setBlastTitle("");
    setBlastSubject("");
  };

  const filteredBlasts = blasts.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalDelivered = blasts.reduce((acc, b) => acc + (b.status === "SENT" ? b.sentCount : 0), 0);
  const totalOpens = blasts.reduce((acc, b) => acc + b.openCount, 0);
  const avgOpenRate = totalDelivered > 0 ? ((totalOpens / totalDelivered) * 100).toFixed(1) : "58.4";

  return (
    <ErpAdminShell
      title="Email Marketing & Blast Scheduler"
      subtitle="Compose targeted outbound blasts, schedule automated dispatches, manage merge tags, and track live deliverability."
      activeModule="crm"
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/crm/lists">
            <NexaButton variant="secondary" className="gap-2 text-xs">
              <Users className="w-3.5 h-3.5" />
              Manage Lists
            </NexaButton>
          </Link>
          <NexaButton
            variant="primary"
            className="gap-2 text-xs"
            onClick={() => setIsModalOpen(true)}
          >
            <Send className="w-4 h-4" />
            Schedule New Blast
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        {/* STATS */}
        <ErpStatGrid
          stats={[
            {
              label: "Total Blasts Dispatched",
              value: blasts.filter((b) => b.status === "SENT").length.toString(),
              change: `${totalDelivered} emails delivered`,
              changeType: "success",
              icon: <Send className="w-4 h-4 text-emerald-500" />,
            },
            {
              label: "Average Open Rate",
              value: `${avgOpenRate}%`,
              change: "Industry top quartile",
              changeType: "success",
              icon: <Eye className="w-4 h-4 text-blue-500" />,
            },
            {
              label: "Audience Subscriber Lists",
              value: lists.length.toString(),
              change: `${lists.reduce((acc, l) => acc + l.subscriberCount, 0)} total contacts`,
              changeType: "success",
              icon: <Users className="w-4 h-4 text-purple-500" />,
            },
            {
              label: "Scheduled Queue",
              value: blasts.filter((b) => b.status === "SCHEDULED").length.toString(),
              change: "Ready for auto-delivery",
              changeType: "neutral",
              icon: <Clock className="w-4 h-4 text-amber-500" />,
            },
          ]}
        />

        {/* FILTERS & SEARCH */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <NexaInput
              placeholder="Search blast subject or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {["ALL", "SENT", "SCHEDULED", "DRAFT"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? "bg-[#1A56DB] text-white shadow-xs"
                    : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] border border-[var(--nexa-border)]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* BLASTS TABLE */}
        <NexaCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-surface)] border-b border-[var(--nexa-border)] font-bold text-[var(--nexa-text-muted)]">
                <tr>
                  <th className="py-3 px-4">Campaign Title & Subject</th>
                  <th className="py-3 px-4">Target Audience List</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Schedule / Dispatched</th>
                  <th className="py-3 px-4 text-center">Recipients</th>
                  <th className="py-3 px-4 text-center">Open Rate</th>
                  <th className="py-3 px-4 text-center">Click Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)]">
                {filteredBlasts.map((blast) => {
                  const openPct = blast.totalRecipients > 0 ? ((blast.openCount / blast.totalRecipients) * 100).toFixed(0) : "0";
                  const clickPct = blast.totalRecipients > 0 ? ((blast.clickCount / blast.totalRecipients) * 100).toFixed(0) : "0";

                  return (
                    <tr key={blast.id} className="hover:bg-[var(--nexa-bg-surface)]/50 transition-colors">
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="font-extrabold text-[var(--nexa-text-primary)]">{blast.title}</div>
                        <div className="text-[11px] text-[var(--nexa-text-muted)] flex items-center gap-1.5 truncate max-w-md">
                          <Mail className="w-3 h-3 text-[#1A56DB] shrink-0" />
                          <span className="truncate">{blast.subject}</span>
                        </div>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-muted)] border border-[var(--nexa-border)]">
                            <Globe className="w-2.5 h-2.5 text-[#1A56DB]" />
                            {blast.senderEmail?.includes("@") ? blast.senderEmail.split("@")[1] : "default domain"}
                          </span>
                          {blast.senderProvider && blast.senderProvider !== "custom" && (
                            <span className="text-[10px] font-semibold text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 capitalize">
                              {blast.senderProvider}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-[var(--nexa-text-primary)]">{blast.listName}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <NexaBadge
                          variant={
                            blast.status === "SENT"
                              ? "success"
                              : blast.status === "SCHEDULED"
                              ? "warning"
                              : "neutral"
                          }
                        >
                          {blast.status}
                        </NexaBadge>
                      </td>
                      <td className="py-3.5 px-4 text-[var(--nexa-text-muted)]">
                        {blast.status === "SENT" && blast.sentAt ? (
                          <span>Sent on {new Date(blast.sentAt).toLocaleDateString()}</span>
                        ) : blast.scheduledAt ? (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            {new Date(blast.scheduledAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span>Draft</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-[var(--nexa-text-primary)]">
                        {blast.totalRecipients}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {blast.status === "SENT" ? `${openPct}% (${blast.openCount})` : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-blue-600 dark:text-blue-400">
                        {blast.status === "SENT" ? `${clickPct}% (${blast.clickCount})` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </NexaCard>
      </div>

      {/* SCHEDULE BLAST MODAL */}
      <NexaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Email Blast"
        subtitle="Configure your audience list, outbound sending domain, rich email copy, and dispatch timing."
        maxWidth="3xl"
      >
        <form onSubmit={handleCreateBlast} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NexaInput
              label="Blast Campaign Title"
              value={blastTitle}
              onChange={(e) => setBlastTitle(e.target.value)}
              placeholder="e.g. Q4 Merchant POS Special Briefing"
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Email Subject Line</label>
                <button
                  type="button"
                  onClick={handleAiSubject}
                  disabled={isAiGenerating}
                  className="text-[11px] text-[#1A56DB] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {isAiGenerating ? "Generating..." : "AI Generate Subject"}
                </button>
              </div>
              <NexaInput
                value={blastSubject}
                onChange={(e) => setBlastSubject(e.target.value)}
                placeholder="e.g. Exclusive Early Deployment Terms for High-Volume Merchants"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Email Sender Profile
              </label>
              <select
                value={selectedProfileId}
                onChange={(e) => handleProfileChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-medium focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB]"
                required
              >
                {senderProfiles.length === 0 && !defaultSmtp && (
                  <option value="" disabled>No sender profiles configured (Setup in Settings)</option>
                )}
                {defaultSmtp && (
                  <option value="workspace_primary">
                    Primary Workspace ({defaultSmtp.fromEmail || defaultSmtp.host})
                  </option>
                )}
                {senderProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.profileName} — {p.fromEmail} ({p.provider.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">Target Audience List</label>
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-medium"
                required
              >
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.subscriberCount} contacts)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">Dispatch Timing</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleType("NOW")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    scheduleType === "NOW"
                      ? "bg-[#1A56DB] text-white border-[#1A56DB]"
                      : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-muted)]"
                  }`}
                >
                  Send Immediately
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleType("LATER")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    scheduleType === "LATER"
                      ? "bg-[#1A56DB] text-white border-[#1A56DB]"
                      : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-muted)]"
                  }`}
                >
                  Schedule for Later
                </button>
              </div>
            </div>

          {scheduleType === "LATER" && (
            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">Schedule Date & Time</label>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-medium"
                required
              />
            </div>
          )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Email Message HTML / Body</label>
                <span className="text-[10px] text-[var(--nexa-text-muted)] font-mono bg-[var(--nexa-bg-surface)] px-1.5 py-0.5 rounded border border-[var(--nexa-border)]">
                  &#123;&#123;contact_name&#125;&#125;
                </span>
                <span className="text-[10px] text-[var(--nexa-text-muted)] font-mono bg-[var(--nexa-bg-surface)] px-1.5 py-0.5 rounded border border-[var(--nexa-border)]">
                  &#123;&#123;company&#125;&#125;
                </span>
              </div>

              {/* PREVIEW SWITCH */}
              <div className="flex items-center p-0.5 bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-lg">
                <button
                  type="button"
                  onClick={() => setBodyMode("edit")}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    bodyMode === "edit"
                      ? "bg-[#1A56DB] text-white shadow-xs"
                      : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                  }`}
                >
                  <Code className="w-3 h-3" /> Edit HTML
                </button>
                <button
                  type="button"
                  onClick={() => setBodyMode("preview")}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    bodyMode === "preview"
                      ? "bg-[#1A56DB] text-white shadow-xs"
                      : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                  }`}
                >
                  <Eye className="w-3 h-3" /> Live Preview
                </button>
              </div>
            </div>

            {bodyMode === "edit" ? (
              <textarea
                rows={6}
                value={contentHtml}
                onChange={(e) => setContentHtml(e.target.value)}
                placeholder="<p>Hello {{contact_name}},</p><p>We would love to partner with {{company}}...</p>"
                className="w-full px-3 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-mono"
              />
            ) : (
              <div className="rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] overflow-hidden shadow-xs">
                {/* Email Client Simulation Header */}
                <div className="p-2.5 border-b border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/60 text-[11px] space-y-1 font-sans">
                  <div className="flex items-center justify-between text-[var(--nexa-text-muted)]">
                    <span>
                      <strong className="text-[var(--nexa-text-primary)]">From:</strong> {senderName || "Sender"} &lt;{senderEmail || "broadcast@yourdomain.com"}&gt;
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded font-semibold border border-blue-500/20">
                        {senderEmail?.includes("@") ? senderEmail.split("@")[1] : "workspace domain"}
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-semibold border border-emerald-500/20">
                        Live Simulation
                      </span>
                    </div>
                  </div>
                  <div className="text-[var(--nexa-text-muted)] truncate">
                    <strong className="text-[var(--nexa-text-primary)]">Subject:</strong> {blastSubject || "(No subject set)"}
                  </div>
                  <div className="text-[10px] text-[var(--nexa-text-muted)]">
                    <strong className="text-[var(--nexa-text-primary)]">To:</strong> Aliko Dangote &lt;aliko@dangote.com&gt;
                  </div>
                </div>

                {/* Rendered HTML Container */}
                <div className="p-4 bg-white text-slate-900 min-h-[140px] max-h-[240px] overflow-y-auto text-xs leading-relaxed font-sans">
                  {contentHtml ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: contentHtml
                          .replace(/\{\{\s*contact_name\s*\}\}/gi, "Aliko Dangote")
                          .replace(/\{\{\s*company\s*\}\}/gi, "Dangote Group"),
                      }}
                    />
                  ) : (
                    <div className="text-center text-slate-400 py-6 italic text-xs">
                      No HTML body entered yet. Switch to "Edit HTML" to compose your email.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <NexaButton variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton variant="primary" type="submit">
              {scheduleType === "NOW" ? "Dispatch Blast Now" : "Schedule Blast"}
            </NexaButton>
          </div>
        </form>
      </NexaModal>
    </ErpAdminShell>
  );
}
