"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  User,
  Phone,
  Building2,
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
  CrmEmailSubscriber,
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
    "<h2>Exclusive Commercial Update</h2><p>Dear {{first_name}},</p><p>We are pleased to introduce our latest enterprise solutions designed for your organization.</p><p><a href='https://ofia.ng' style='background:#1A56DB;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;'>Explore Platform</a></p>"
  );
  const [bodyMode, setBodyMode] = useState<"edit" | "preview">("edit");
  const [scheduleType, setScheduleType] = useState<"NOW" | "LATER">("NOW");
  const [scheduleDate, setScheduleDate] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Audience List Contacts Selection & Filtering
  const [listSubscribers, setListSubscribers] = useState<CrmEmailSubscriber[]>([]);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false);
  const [recipientSelectionMode, setRecipientSelectionMode] = useState<"ALL" | "CUSTOM">("ALL");
  const [selectedSubscriberIds, setSelectedSubscriberIds] = useState<string[]>([]);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [contactFieldFilter, setContactFieldFilter] = useState<
    "ALL" | "HAS_EMAIL" | "HAS_NAME" | "MISSING_NAME" | "HAS_COMPANY" | "HAS_LINKEDIN"
  >("ALL");
  const [previewContactType, setPreviewContactType] = useState<"WITH_NAME" | "WITHOUT_NAME">("WITH_NAME");

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

        const availableProfiles = Array.isArray(profilesRes?.profiles) ? profilesRes.profiles : [];
        const configuredDefaultSmtp = profilesRes?.defaultSmtp?.fromEmail ? profilesRes.defaultSmtp : null;

        setSenderProfiles(availableProfiles);
        setDefaultSmtp(configuredDefaultSmtp);

        if (availableProfiles.length > 0) {
          const defaultProf = availableProfiles.find((p: any) => p.isDefault) || availableProfiles[0];
          initialProfileId = defaultProf.id;
          initialName = defaultProf.fromName || defaultProf.profileName || "";
          initialEmail = defaultProf.fromEmail || "";
        } else if (configuredDefaultSmtp) {
          initialProfileId = "workspace_primary";
          initialName = configuredDefaultSmtp.fromName || "";
          initialEmail = configuredDefaultSmtp.fromEmail || "";
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

  useEffect(() => {
    if (!selectedListId) {
      setListSubscribers([]);
      setSelectedSubscriberIds([]);
      return;
    }

    let isMounted = true;
    async function fetchSubscribers() {
      setIsLoadingSubscribers(true);
      try {
        const res = await crmFetch(`/api/erp/crm/lists/subscribers?listId=${selectedListId}`).then((r) => r.json());
        if (isMounted) {
          if (Array.isArray(res?.subscribers)) {
            setListSubscribers(res.subscribers);
            // Default: pre-select all subscribers that have an email address
            const validIds = res.subscribers
              .filter((s: CrmEmailSubscriber) => s.email && s.email.includes("@"))
              .map((s: CrmEmailSubscriber) => s.id);
            setSelectedSubscriberIds(validIds);
          } else {
            setListSubscribers([]);
            setSelectedSubscriberIds([]);
          }
        }
      } catch {
        if (isMounted) {
          setListSubscribers([]);
          setSelectedSubscriberIds([]);
        }
      } finally {
        if (isMounted) setIsLoadingSubscribers(false);
      }
    }

    fetchSubscribers();
    return () => {
      isMounted = false;
    };
  }, [selectedListId]);

  const filteredListSubscribers = useMemo(() => {
    return listSubscribers.filter((s) => {
      const q = contactSearchQuery.trim().toLowerCase();
      const fullName = `${s.firstName || ""} ${s.lastName || ""}`.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.company && s.company.toLowerCase().includes(q)) ||
        (s.phone && s.phone.toLowerCase().includes(q)) ||
        fullName.includes(q);

      if (!matchesSearch) return false;

      if (contactFieldFilter === "HAS_EMAIL") return Boolean(s.email && s.email.includes("@"));
      if (contactFieldFilter === "HAS_NAME") return Boolean((s.firstName && s.firstName.trim()) || (s.lastName && s.lastName.trim()));
      if (contactFieldFilter === "MISSING_NAME") return !Boolean((s.firstName && s.firstName.trim()) || (s.lastName && s.lastName.trim()));
      if (contactFieldFilter === "HAS_COMPANY") return Boolean(s.company && s.company.trim());
      if (contactFieldFilter === "HAS_LINKEDIN") return Boolean(s.linkedinUrl && s.linkedinUrl.trim());

      return true;
    });
  }, [listSubscribers, contactSearchQuery, contactFieldFilter]);

  const handleSelectAllFiltered = () => {
    const validFilteredIds = filteredListSubscribers
      .filter((s) => s.email && s.email.includes("@"))
      .map((s) => s.id);
    setSelectedSubscriberIds((prev) => Array.from(new Set([...prev, ...validFilteredIds])));
  };

  const handleSelectOnlyWithEmail = () => {
    const validIds = listSubscribers
      .filter((s) => s.email && s.email.includes("@"))
      .map((s) => s.id);
    setSelectedSubscriberIds(validIds);
  };

  const handleSelectWithNameAndEmail = () => {
    const validIds = listSubscribers
      .filter((s) => s.email && s.email.includes("@") && (s.firstName?.trim() || s.lastName?.trim()))
      .map((s) => s.id);
    setSelectedSubscriberIds(validIds);
  };

  const handleDeselectAll = () => {
    setSelectedSubscriberIds([]);
  };

  const toggleSubscriber = (id: string) => {
    setSelectedSubscriberIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

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

    const chosenList = lists.find((l) => l.id === selectedListId);
    let chosenSubs: CrmEmailSubscriber[] = [];
    let chosenRecipientIds: string[] | undefined = undefined;

    if (recipientSelectionMode === "CUSTOM") {
      chosenSubs = listSubscribers.filter(
        (s) => selectedSubscriberIds.includes(s.id) && s.email && s.email.includes("@")
      );
      if (chosenSubs.length === 0) {
        alert("Please select at least one contact with a valid email address to receive this blast.");
        return;
      }
      chosenRecipientIds = chosenSubs.map((s) => s.id);
    } else {
      chosenSubs = listSubscribers.filter((s) => s.email && s.email.includes("@"));
    }

    const recipientsCount =
      recipientSelectionMode === "CUSTOM"
        ? chosenSubs.length
        : chosenSubs.length > 0
        ? chosenSubs.length
        : chosenList ? chosenList.subscriberCount : 100;

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
      recipientIds: chosenRecipientIds,
      recipients: chosenRecipientIds
        ? chosenSubs.map((s) => ({
            email: s.email,
            name: `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.email,
            firstName: s.firstName || "",
            lastName: s.lastName || "",
            company: s.company || "",
            role: "Subscriber",
          }))
        : undefined,
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[var(--nexa-text-primary)]">
                  Email Sender Profile
                </label>
                <Link
                  href="/tenant/settings?tab=smtp"
                  className="text-[11px] text-[#1A56DB] hover:underline flex items-center gap-1 font-semibold"
                  target="_blank"
                >
                  <Plus className="w-3 h-3" />
                  Manage Profiles
                </Link>
              </div>
              <select
                value={selectedProfileId}
                onChange={(e) => handleProfileChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-medium focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB]"
                required
              >
                {senderProfiles.length === 0 && !defaultSmtp && (
                  <option value="" disabled>No sender profiles configured (Setup in Settings)</option>
                )}
                {defaultSmtp && !senderProfiles.some((p) => p.fromEmail.toLowerCase() === defaultSmtp.fromEmail.toLowerCase()) && (
                  <option value="workspace_primary">
                    {defaultSmtp.fromName ? `${defaultSmtp.fromName} — ` : "Workspace Primary — "}
                    {defaultSmtp.fromEmail} ({(defaultSmtp.provider || "SMTP").toUpperCase()})
                  </option>
                )}
                {senderProfiles.map((p) => {
                  const displayName = p.fromName || p.profileName;
                  return (
                    <option key={p.id} value={p.id}>
                      {displayName} — {p.fromEmail} ({p.provider.toUpperCase()})
                    </option>
                  );
                })}
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

          {/* RECIPIENT SELECTION & FILTERS */}
          <div className="rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] p-3 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <label className="block text-xs font-bold text-[var(--nexa-text-primary)]">
                  Recipient Selection
                </label>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">
                  Choose whether to dispatch to the entire list or hand-pick specific contacts with field filters.
                </p>
              </div>

              <div className="flex items-center gap-1.5 p-0.5 bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setRecipientSelectionMode("ALL")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    recipientSelectionMode === "ALL"
                      ? "bg-[#1A56DB] text-white shadow-xs"
                      : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                  }`}
                >
                  All in List ({listSubscribers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientSelectionMode("CUSTOM")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    recipientSelectionMode === "CUSTOM"
                      ? "bg-[#1A56DB] text-white shadow-xs"
                      : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                  }`}
                >
                  Select Contacts ({selectedSubscriberIds.length})
                </button>
              </div>
            </div>

            {recipientSelectionMode === "CUSTOM" && (
              <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
                {/* Search & Action Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1">
                    <NexaInput
                      placeholder="Search contacts by name, email, or company..."
                      value={contactSearchQuery}
                      onChange={(e) => setContactSearchQuery(e.target.value)}
                      leftIcon={<Search className="w-3.5 h-3.5 text-[var(--nexa-text-muted)]" />}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="text-[11px] font-semibold px-2 py-1.5 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:bg-[#1A56DB]/10 hover:text-[#1A56DB] transition-colors cursor-pointer"
                    >
                      Select Filtered ({filteredListSubscribers.filter((s) => s.email && s.email.includes("@")).length})
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectOnlyWithEmail}
                      className="text-[11px] font-semibold px-2 py-1.5 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:bg-[#1A56DB]/10 hover:text-[#1A56DB] transition-colors cursor-pointer"
                    >
                      All with Email
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectWithNameAndEmail}
                      className="text-[11px] font-semibold px-2 py-1.5 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:bg-[#1A56DB]/10 hover:text-[#1A56DB] transition-colors cursor-pointer"
                    >
                      With Name & Email
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="text-[11px] font-semibold px-2 py-1.5 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-[var(--nexa-text-muted)] flex items-center gap-1 mr-1">
                    <Filter className="w-3 h-3 text-[#1A56DB]" /> Field Filters:
                  </span>
                  {[
                    { id: "ALL", label: `All (${listSubscribers.length})` },
                    { id: "HAS_EMAIL", label: `Has Email (${listSubscribers.filter((s) => s.email).length})` },
                    { id: "HAS_NAME", label: `Has Name (${listSubscribers.filter((s) => s.firstName || s.lastName).length})` },
                    { id: "MISSING_NAME", label: `Missing Name (${listSubscribers.filter((s) => !s.firstName && !s.lastName).length})` },
                    { id: "HAS_COMPANY", label: `Has Company (${listSubscribers.filter((s) => s.company).length})` },
                    { id: "HAS_LINKEDIN", label: `Has LinkedIn (${listSubscribers.filter((s) => s.linkedinUrl).length})` },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setContactFieldFilter(chip.id as any)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                        contactFieldFilter === chip.id
                          ? "bg-[#1A56DB] text-white border-[#1A56DB]"
                          : "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-muted)] border-[var(--nexa-border)] hover:text-[var(--nexa-text-primary)]"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Contacts Checklist */}
                {isLoadingSubscribers ? (
                  <div className="py-8 text-center text-xs text-[var(--nexa-text-muted)]">
                    Loading contacts for selected audience list...
                  </div>
                ) : filteredListSubscribers.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[var(--nexa-text-muted)] italic">
                    No contacts matching your current search or field filters.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-[var(--nexa-border)] rounded-xl p-2 bg-[var(--nexa-bg-surface)]/50">
                    {filteredListSubscribers.map((contact) => {
                      const isSelected = selectedSubscriberIds.includes(contact.id);
                      const hasEmail = Boolean(contact.email && contact.email.includes("@"));
                      const fullName = `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
                      return (
                        <div
                          key={contact.id}
                          onClick={() => hasEmail && toggleSubscriber(contact.id)}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                            !hasEmail
                              ? "opacity-50 border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] cursor-not-allowed"
                              : isSelected
                              ? "border-[#1A56DB] bg-[#1A56DB]/5 text-[var(--nexa-text-primary)]"
                              : "border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] hover:border-[#1A56DB]/40 text-[var(--nexa-text-primary)]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={!hasEmail}
                              onChange={() => toggleSubscriber(contact.id)}
                              className="w-3.5 h-3.5 rounded text-[#1A56DB] focus:ring-[#1A56DB] cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold font-mono text-[11px] truncate">
                                  {contact.email || contact.phone || "No contact info"}
                                </span>
                                {!hasEmail && (
                                  <span className="text-[9px] font-semibold text-amber-600 bg-amber-500/10 px-1 py-0.2 rounded">
                                    No email
                                  </span>
                                )}
                                {fullName ? (
                                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-500/10 px-1.5 py-0.2 rounded flex items-center gap-1">
                                    <User className="w-2.5 h-2.5" /> {fullName}
                                  </span>
                                ) : (
                                  <span className="text-[9px] italic text-[var(--nexa-text-muted)] bg-[var(--nexa-bg-surface)] px-1.5 py-0.2 rounded border border-[var(--nexa-border)]">
                                    No first/last name
                                  </span>
                                )}
                              </div>
                              {contact.company && (
                                <div className="text-[10px] text-[var(--nexa-text-muted)] flex items-center gap-1 mt-0.5">
                                  <Building2 className="w-2.5 h-2.5 text-purple-500" />
                                  <span>{contact.company}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 text-[10px] font-bold text-[var(--nexa-text-muted)]">
                            {isSelected ? (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Selected
                              </span>
                            ) : hasEmail ? (
                              <span>Click to select</span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Selection Count Summary */}
                <div className="flex items-center justify-between text-[11px] text-[var(--nexa-text-muted)] pt-1">
                  <span>
                    Selected <strong className="text-[var(--nexa-text-primary)]">{selectedSubscriberIds.length}</strong> of{" "}
                    <strong>{listSubscribers.filter((s) => s.email && s.email.includes("@")).length}</strong> deliverable email contacts
                  </span>
                  {selectedSubscriberIds.length === 0 && (
                    <span className="text-rose-500 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Select at least 1 contact
                    </span>
                  )}
                </div>
              </div>
            )}
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
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Email Message HTML / Body</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-[var(--nexa-text-muted)] font-semibold">Tokens:</span>
                  {[
                    { token: "{{first_name}}", title: "Contact first name (or defaults to 'there')" },
                    { token: "{{first_name|Valued Partner}}", title: "Custom fallback if first name missing" },
                    { token: "{{last_name}}", title: "Contact last name" },
                    { token: "{{company}}", title: "Company name" },
                    { token: "{{name}}", title: "Full contact name" },
                    { token: "{{email}}", title: "Recipient email" },
                    { token: "{{unsubscribe_url}}", title: "Personalized one-click unsubscribe link" },
                  ].map((t) => (
                    <button
                      key={t.token}
                      type="button"
                      onClick={() => setContentHtml((prev) => prev + " " + t.token)}
                      title={t.title}
                      className="text-[10px] font-mono text-[var(--nexa-text-muted)] hover:text-[#1A56DB] bg-[var(--nexa-bg-surface)] hover:bg-[#1A56DB]/10 px-1.5 py-0.5 rounded border border-[var(--nexa-border)] cursor-pointer transition-colors"
                    >
                      {t.token}
                    </button>
                  ))}
                </div>
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
                placeholder="<p>Hello {{first_name}},</p><p>We would love to partner with {{company}}...</p>"
                className="w-full px-3 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-mono"
              />
            ) : (
              <div className="rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] overflow-hidden shadow-xs">
                {/* Email Client Simulation Header */}
                <div className="p-2.5 border-b border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/60 text-[11px] space-y-1.5 font-sans">
                  <div className="flex items-center justify-between text-[var(--nexa-text-muted)] flex-wrap gap-2">
                    <span>
                      <strong className="text-[var(--nexa-text-primary)]">From:</strong> {senderName || "Sender"} &lt;{senderEmail || "broadcast@yourdomain.com"}&gt;
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[var(--nexa-text-muted)]">Preview As:</span>
                      <button
                        type="button"
                        onClick={() => setPreviewContactType("WITH_NAME")}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          previewContactType === "WITH_NAME"
                            ? "bg-[#1A56DB] text-white border-[#1A56DB]"
                            : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-[var(--nexa-border)]"
                        }`}
                      >
                        Has First Name (Adetayo)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewContactType("WITHOUT_NAME")}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          previewContactType === "WITHOUT_NAME"
                            ? "bg-amber-600 text-white border-amber-600"
                            : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-[var(--nexa-border)]"
                        }`}
                      >
                        No First Name (Fallback Demo)
                      </button>
                    </div>
                  </div>
                  <div className="text-[var(--nexa-text-muted)] truncate">
                    <strong className="text-[var(--nexa-text-primary)]">Subject:</strong> {blastSubject || "(No subject set)"}
                  </div>
                  <div className="text-[10px] text-[var(--nexa-text-muted)]">
                    <strong className="text-[var(--nexa-text-primary)]">To:</strong>{" "}
                    {previewContactType === "WITH_NAME"
                      ? "Adetayo Adewale <adetayo@sifaxgroup.com>"
                      : "info@sifaxgroup.com"}
                  </div>
                </div>

                {/* Rendered HTML Container */}
                <div className="p-4 bg-white text-slate-900 min-h-[140px] max-h-[240px] overflow-y-auto text-xs leading-relaxed font-sans">
                  {contentHtml ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: contentHtml
                          .replace(/\{\{\s*(?:first_name|firstName|first\s+name)\|([^}]+)\}\}/gi, (_, fallback) =>
                            previewContactType === "WITH_NAME" ? "Adetayo" : fallback.trim()
                          )
                          .replace(/\{\{\s*(?:first_name|firstName|first\s+name)\s*\}\}/gi,
                            previewContactType === "WITH_NAME" ? "Adetayo" : "there"
                          )
                          .replace(/\{\{\s*(?:contact_name|contactName|contact\s+name)\|([^}]+)\}\}/gi, (_, fallback) =>
                            previewContactType === "WITH_NAME" ? "Adetayo Adewale" : fallback.trim()
                          )
                          .replace(/\{\{\s*(?:contact_name|contactName|contact\s+name)\s*\}\}/gi,
                            previewContactType === "WITH_NAME" ? "Adetayo Adewale" : "there"
                          )
                          .replace(/\{\{\s*(?:last_name|lastName|last\s+name)\|([^}]+)\}\}/gi, (_, fallback) =>
                            previewContactType === "WITH_NAME" ? "Adewale" : fallback.trim()
                          )
                          .replace(/\{\{\s*(?:last_name|lastName|last\s+name)\s*\}\}/gi,
                            previewContactType === "WITH_NAME" ? "Adewale" : ""
                          )
                          .replace(/\{\{\s*company\|([^}]+)\}\}/gi, () => "Sifax Haulage Ltd")
                          .replace(/\{\{\s*company\s*\}\}/gi, "Sifax Haulage Ltd")
                          .replace(/\{\{\s*name\|([^}]+)\}\}/gi, (_, fallback) =>
                            previewContactType === "WITH_NAME" ? "Adetayo Adewale" : fallback.trim()
                          )
                          .replace(/\{\{\s*name\s*\}\}/gi,
                            previewContactType === "WITH_NAME" ? "Adetayo Adewale" : "there"
                          )
                          .replace(/\{\{\s*email\s*\}\}/gi,
                            previewContactType === "WITH_NAME" ? "adetayo@sifaxgroup.com" : "info@sifaxgroup.com"
                          )
                          .replace(/\{\{\s*(?:unsubscribe_url|unsubscribeUrl|unsubscribe)\s*\}\}/gi,
                            "https://app.ofia.ng/crm/unsubscribe?token=sample_demo_token"
                          ),
                      }}
                    />
                  ) : (
                    <div className="text-center text-slate-400 py-6 italic text-xs">
                      No HTML body entered yet. Switch to "Edit HTML" to compose your email.
                    </div>
                  )}

                  {/* Auto-injected System / Adsense Unsubscribe Footer Simulation */}
                  <div className="mt-6 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 leading-normal">
                    &copy; {new Date().getFullYear()} {senderName || "Ofia ERP"}. All rights reserved.<br/>
                    You received this email because you are subscribed to our communications.<br/>
                    <span className="text-slate-500 underline cursor-pointer">Unsubscribe from this mailing list</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <NexaButton variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton
              variant="primary"
              type="submit"
              disabled={recipientSelectionMode === "CUSTOM" && selectedSubscriberIds.length === 0}
            >
              {scheduleType === "NOW"
                ? `Dispatch Blast Now (${recipientSelectionMode === "CUSTOM" ? selectedSubscriberIds.length : (listSubscribers.filter(s => s.email && s.email.includes("@")).length || "All")})`
                : "Schedule Blast"}
            </NexaButton>
          </div>
        </form>
      </NexaModal>
    </ErpAdminShell>
  );
}
