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
  RefreshCw,
  Edit3,
  Trash2,
  ExternalLink,
  Download,
  Check,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";
import { Pagination } from "@/components/nexa/Pagination";
import {
  CrmEmailBlast,
  CrmEmailList,
  CrmEmailSubscriber,
} from "@/lib/crm-service";
import { TenantSenderProfile } from "@/lib/email-service";
import { crmFetch } from "@/lib/crm-client";
import { filterSalesClosers } from "@/lib/access-control";

export default function EmailMarketingBlastsPage() {
  const [blasts, setBlasts] = useState<CrmEmailBlast[]>([]);
  const [lists, setLists] = useState<CrmEmailList[]>([]);
  const [selectedBlastForLogs, setSelectedBlastForLogs] = useState<CrmEmailBlast | null>(null);
  const [blastLogs, setBlastLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState<"ALL" | "OPENED" | "CLICKED" | "UNOPENED" | "FAILED">("ALL");
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Editing & Deletion State
  const [editingBlastId, setEditingBlastId] = useState<string | null>(null);
  const [blastToDelete, setBlastToDelete] = useState<CrmEmailBlast | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResumingBlastId, setIsResumingBlastId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sender Profiles & Multi-Domain State
  const [senderProfiles, setSenderProfiles] = useState<TenantSenderProfile[]>([]);
  const [defaultSmtp, setDefaultSmtp] = useState<any>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");

  // Prospect Assignment & Sales Closers
  const [salesClosers, setSalesClosers] = useState<{ id?: string; name: string; email: string }[]>([]);
  const [existingLeadsMap, setExistingLeadsMap] = useState<Record<string, { id: string; assignedRep: string; contactName?: string }>>({});
  const [selectedCloserForLog, setSelectedCloserForLog] = useState<Record<string, string>>({});
  const [activeAssignPopoverLogId, setActiveAssignPopoverLogId] = useState<string | null>(null);
  const [isAddingProspectId, setIsAddingProspectId] = useState<string | null>(null);
  const [toastBanner, setToastBanner] = useState<{ message: string; type: "success" | "error" } | null>(null);

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
        const [blastsRes, listsRes, profilesRes, usersRes, leadsRes] = await Promise.all([
          crmFetch("/api/erp/crm/blasts").then((r) => r.json()).catch(() => null),
          crmFetch("/api/erp/crm/lists").then((r) => r.json()).catch(() => null),
          crmFetch("/api/erp/sender-profiles").then((r) => r.json()).catch(() => null),
          crmFetch("/api/erp/users").then((r) => (r.ok ? r.json() : [])).catch(() => []),
          crmFetch("/api/erp/crm/leads").then((r) => r.json()).catch(() => null),
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

        const rawUsers = Array.isArray(usersRes)
          ? usersRes
          : Array.isArray(usersRes?.users)
          ? usersRes.users
          : [];
        const validClosers = filterSalesClosers(rawUsers);
        setSalesClosers(validClosers);

        const rawLeads = Array.isArray(leadsRes)
          ? leadsRes
          : Array.isArray(leadsRes?.leads)
          ? leadsRes.leads
          : [];
        const lMap: Record<string, { id: string; assignedRep: string; contactName?: string }> = {};
        rawLeads.forEach((l: any) => {
          const email = (l.contactEmail || l.email || l.contact_email || "").trim().toLowerCase();
          const rep = l.assignedRep || l.owner || l.assigned_rep || "Assigned Closer";
          if (email) {
            lMap[email] = {
              id: l.id,
              assignedRep: rep,
              contactName: l.contactName || l.name,
            };
          }
          const name = (l.contactName || l.name || l.contact_name || "").trim().toLowerCase();
          if (name && name !== "recipient" && name !== "campaign recipient") {
            lMap[`name:${name}`] = {
              id: l.id,
              assignedRep: rep,
              contactName: l.contactName || l.name,
            };
          }
        });
        setExistingLeadsMap(lMap);
      } catch (err) {
        console.warn("Using offline email marketing state:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Polling for live blast dispatch progress when any blast is SENDING
  useEffect(() => {
    const hasActiveSending = blasts.some((b) => b.status === "SENDING");
    if (!hasActiveSending) return;

    const interval = setInterval(async () => {
      try {
        const res = await crmFetch("/api/erp/crm/blasts").then((r) => r.json());
        if (res?.blasts) {
          setBlasts(res.blasts);
        }
      } catch {}
    }, 3000);

    return () => clearInterval(interval);
  }, [blasts]);

  async function openBlastLogs(blast: CrmEmailBlast) {
    setSelectedBlastForLogs(blast);
    setLogFilter("ALL");
    setLogSearchQuery("");
    setIsLoadingLogs(true);
    setActiveAssignPopoverLogId(null);
    try {
      const [blastRes, leadsRes] = await Promise.all([
        crmFetch(`/api/erp/crm/blasts?id=${blast.id}`).then((r) => r.json()).catch(() => null),
        crmFetch("/api/erp/crm/leads").then((r) => r.json()).catch(() => null),
      ]);

      if (blastRes?.blast?.recipients) {
        setBlastLogs(blastRes.blast.recipients);
      } else {
        setBlastLogs([]);
      }
      if (blastRes?.blast) {
        setSelectedBlastForLogs(blastRes.blast);
      }

      const rawLeads = Array.isArray(leadsRes)
        ? leadsRes
        : Array.isArray(leadsRes?.leads)
        ? leadsRes.leads
        : [];
      const lMap: Record<string, { id: string; assignedRep: string; contactName?: string }> = {};
      rawLeads.forEach((l: any) => {
        const email = (l.contactEmail || l.email || l.contact_email || "").trim().toLowerCase();
        const rep = l.assignedRep || l.owner || l.assigned_rep || "Assigned Closer";
        if (email) {
          lMap[email] = {
            id: l.id,
            assignedRep: rep,
            contactName: l.contactName || l.name,
          };
        }
        const name = (l.contactName || l.name || l.contact_name || "").trim().toLowerCase();
        if (name && name !== "recipient" && name !== "campaign recipient") {
          lMap[`name:${name}`] = {
            id: l.id,
            assignedRep: rep,
            contactName: l.contactName || l.name,
          };
        }
      });
      setExistingLeadsMap(lMap);
    } catch {
      setBlastLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  }

  async function refreshBlastLogs() {
    if (!selectedBlastForLogs) return;
    setIsLoadingLogs(true);
    try {
      const [blastRes, leadsRes] = await Promise.all([
        crmFetch(`/api/erp/crm/blasts?id=${selectedBlastForLogs.id}`).then((r) => r.json()).catch(() => null),
        crmFetch("/api/erp/crm/leads").then((r) => r.json()).catch(() => null),
      ]);
      if (blastRes?.blast?.recipients) {
        setBlastLogs(blastRes.blast.recipients);
      }
      if (blastRes?.blast) {
        setSelectedBlastForLogs(blastRes.blast);
      }
      const rawLeads = Array.isArray(leadsRes)
        ? leadsRes
        : Array.isArray(leadsRes?.leads)
        ? leadsRes.leads
        : [];
      const lMap: Record<string, { id: string; assignedRep: string; contactName?: string }> = {};
      rawLeads.forEach((l: any) => {
        const email = (l.contactEmail || l.email || l.contact_email || "").trim().toLowerCase();
        const rep = l.assignedRep || l.owner || l.assigned_rep || "Assigned Closer";
        if (email) {
          lMap[email] = {
            id: l.id,
            assignedRep: rep,
            contactName: l.contactName || l.name,
          };
        }
        const name = (l.contactName || l.name || l.contact_name || "").trim().toLowerCase();
        if (name && name !== "recipient" && name !== "campaign recipient") {
          lMap[`name:${name}`] = {
            id: l.id,
            assignedRep: rep,
            contactName: l.contactName || l.name,
          };
        }
      });
      setExistingLeadsMap(lMap);
    } catch {
    } finally {
      setIsLoadingLogs(false);
    }
  }

  const getExistingLead = (log: any) => {
    if (!log) return null;
    const email = (log.email || "").trim().toLowerCase();
    if (email && existingLeadsMap[email]) {
      return existingLeadsMap[email];
    }
    const name = (log.name || "").trim().toLowerCase();
    if (name && existingLeadsMap[`name:${name}`]) {
      return existingLeadsMap[`name:${name}`];
    }
    return null;
  };

  const handleAddLeadAsProspect = async (log: any) => {
    setIsAddingProspectId(log.id);
    const chosenCloser = selectedCloserForLog[log.id] || "Auto-Assign (Least-Loaded)";

    const isOpened = Boolean(log.openedAt || (log.openCount && log.openCount > 0));
    const isClicked = Boolean(log.clickedAt || (log.clickCount && log.clickCount > 0));

    const recipientName = (log.name && log.name.trim()) ? log.name.trim() : "Campaign Recipient";
    const recipientEmail = (log.email || "").trim();

    const payload = {
      companyName: log.name && log.name.trim() ? `${log.name.trim()} Enterprise` : "Inbound Enterprise",
      contactName: recipientName,
      contactEmail: recipientEmail,
      contactPhone: "",
      source: `Email Blast: ${selectedBlastForLogs?.title || "Campaign"}`,
      assignedRep: chosenCloser.startsWith("Auto-Assign") ? "Auto-Assign (Least-Loaded)" : chosenCloser,
      status: isClicked ? "QUALIFIED" : (isOpened ? "CONTACTED" : "IDENTIFIED"),
      icpFitScore: isClicked ? 92 : (isOpened ? 82 : 65),
      buyingSignals: [
        `Email Campaign: ${selectedBlastForLogs?.subject || "Update"}`,
        isClicked ? `Clicked campaign links (${log.clickCount || 1}x)` : (isOpened ? `Opened email blast (${log.openCount || 1}x)` : "Dispatched via email campaign")
      ],
      notes: `Added as prospect from campaign "${selectedBlastForLogs?.title}". Delivery status: ${log.status}. Opens: ${log.openCount || 0}, Clicks: ${log.clickCount || 0}.`,
    };

    try {
      const res = await crmFetch("/api/erp/crm/leads", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to create prospect (HTTP ${res.status})`);
      }

      const data = await res.json().catch(() => ({}));
      const repAssigned = data?.lead?.assignedRep || data?.lead?.owner || (chosenCloser.startsWith("Auto-Assign") ? (salesClosers[0]?.name || "Sales Closer") : chosenCloser);

      setExistingLeadsMap((prev) => {
        const updated = { ...prev };
        if (recipientEmail) {
          updated[recipientEmail.toLowerCase()] = {
            id: data?.lead?.id || `LED-${Date.now()}`,
            assignedRep: repAssigned,
            contactName: recipientName,
          };
        }
        if (recipientName && recipientName !== "Campaign Recipient") {
          updated[`name:${recipientName.toLowerCase()}`] = {
            id: data?.lead?.id || `LED-${Date.now()}`,
            assignedRep: repAssigned,
            contactName: recipientName,
          };
        }
        return updated;
      });

      setActiveAssignPopoverLogId(null);
      setToastBanner({
        message: `Successfully added ${recipientEmail || recipientName} to CRM Leads (Assigned Closer: ${repAssigned})!`,
        type: "success",
      });
      setTimeout(() => setToastBanner(null), 5000);
    } catch (err: any) {
      setToastBanner({
        message: `Error adding prospect: ${err.message}`,
        type: "error",
      });
      setTimeout(() => setToastBanner(null), 5000);
    } finally {
      setIsAddingProspectId(null);
    }
  };

  function exportLogsToCSV() {
    if (!blastLogs.length || !selectedBlastForLogs) return;
    const headers = ["Recipient Name", "Email", "Status", "Sent At", "Opened At", "Open Count", "Clicked At", "Click Count", "Error Message"];
    const rows = blastLogs.map((r) => [
      `"${(r.name || "").replace(/"/g, '""')}"`,
      `"${(r.email || "").replace(/"/g, '""')}"`,
      `"${(r.status || "").replace(/"/g, '""')}"`,
      `"${r.sentAt ? new Date(r.sentAt).toISOString() : ""}"`,
      `"${r.openedAt ? new Date(r.openedAt).toISOString() : ""}"`,
      r.openCount || 0,
      `"${r.clickedAt ? new Date(r.clickedAt).toISOString() : ""}"`,
      r.clickCount || 0,
      `"${(r.errorMessage || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `delivery-engagement-logs-${selectedBlastForLogs.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const logStats = useMemo(() => {
    const total = blastLogs.length;
    const opened = blastLogs.filter((l) => l.openedAt || (l.openCount && l.openCount > 0)).length;
    const clicked = blastLogs.filter((l) => l.clickedAt || (l.clickCount && l.clickCount > 0)).length;
    const failed = blastLogs.filter((l) => l.status === "FAILED").length;
    const sent = blastLogs.filter((l) => l.status === "SENT").length;
    const unopened = blastLogs.filter((l) => l.status === "SENT" && !l.openedAt && (!l.openCount || l.openCount === 0)).length;

    const openRate = sent > 0 ? Math.round((opened / sent) * 100) : 0;
    const clickRate = sent > 0 ? Math.round((clicked / sent) * 100) : 0;

    return { total, opened, clicked, failed, sent, unopened, openRate, clickRate };
  }, [blastLogs]);

  const filteredBlastLogs = useMemo(() => {
    return blastLogs.filter((log) => {
      const q = logSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (log.email && log.email.toLowerCase().includes(q)) ||
        (log.name && log.name.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      const isOpened = Boolean(log.openedAt || (log.openCount && log.openCount > 0));
      const isClicked = Boolean(log.clickedAt || (log.clickCount && log.clickCount > 0));

      if (logFilter === "OPENED") return isOpened;
      if (logFilter === "CLICKED") return isClicked;
      if (logFilter === "UNOPENED") return !isOpened && log.status === "SENT";
      if (logFilter === "FAILED") return log.status === "FAILED";

      return true;
    });
  }, [blastLogs, logFilter, logSearchQuery]);

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
      const fullName = (s.name || `${s.firstName || ""} ${s.lastName || ""}`).trim().toLowerCase();
      const matchesSearch =
        !q ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.company && s.company.toLowerCase().includes(q)) ||
        (s.phone && s.phone.toLowerCase().includes(q)) ||
        fullName.includes(q);

      if (!matchesSearch) return false;

      if (contactFieldFilter === "HAS_EMAIL") return Boolean(s.email && s.email.includes("@"));
      if (contactFieldFilter === "HAS_NAME") return Boolean((s.name && s.name.trim()) || (s.firstName && s.firstName.trim()) || (s.lastName && s.lastName.trim()));
      if (contactFieldFilter === "MISSING_NAME") return !Boolean((s.name && s.name.trim()) || (s.firstName && s.firstName.trim()) || (s.lastName && s.lastName.trim()));
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
      recipients: (chosenRecipientIds ? chosenSubs : listSubscribers)
        .filter((s) => s.email && s.email.includes("@"))
        .map((s) => {
          const derivedName = `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.name || s.email;
          let derivedFn = (s.firstName || "").trim();
          let derivedLn = (s.lastName || "").trim();
          if (!derivedFn && derivedName && !derivedName.includes("@")) {
            const parts = derivedName.split(/\s+/);
            if (parts.length > 0) derivedFn = parts[0];
            if (!derivedLn && parts.length > 1) derivedLn = parts.slice(1).join(" ");
          }
          return {
            id: s.id,
            email: s.email,
            name: derivedName,
            firstName: derivedFn,
            lastName: derivedLn,
            company: s.company || "",
            role: "Subscriber",
          };
        }),
      contentHtml,
      totalRecipients: recipientsCount,
      scheduledAt: scheduleType === "LATER" && scheduleDate ? new Date(scheduleDate).toISOString() : undefined,
      dispatchNow: scheduleType === "NOW",
    };

    setIsSaving(true);
    if (editingBlastId) {
      const editPayload = {
        id: editingBlastId,
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
        scheduledAt: scheduleType === "LATER" && scheduleDate ? new Date(scheduleDate).toISOString() : undefined,
        status: scheduleType === "NOW" ? "SENT" : "SCHEDULED",
      };

      try {
        await crmFetch(`/api/erp/crm/blasts?id=${encodeURIComponent(editingBlastId)}`, {
          method: "PUT",
          body: JSON.stringify(editPayload),
        });
      } catch (err) {
        console.warn("Error updating blast via API, updating local state:", err);
      }

      setBlasts((prev) =>
        prev.map((b) =>
          b.id === editingBlastId
            ? {
                ...b,
                title: blastTitle.trim(),
                subject: blastSubject.trim(),
                listId: selectedListId,
                listName: chosenList ? chosenList.name : b.listName,
                senderName: senderName.trim(),
                senderEmail: senderEmail.trim(),
                senderProfileId,
                senderProvider,
                contentHtml,
                scheduledAt: scheduleType === "LATER" && scheduleDate ? scheduleDate : undefined,
                status: scheduleType === "NOW" ? "SENT" : "SCHEDULED",
              }
            : b
        )
      );

      setIsSaving(false);
      setIsModalOpen(false);
      setEditingBlastId(null);
      setBlastTitle("");
      setBlastSubject("");
      return;
    }

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
    } finally {
      setIsSaving(false);
    }

    setIsModalOpen(false);
    setBlastTitle("");
    setBlastSubject("");
  };

  function handleOpenCreateModal() {
    setEditingBlastId(null);
    setBlastTitle("");
    setBlastSubject("");
    if (lists.length > 0) setSelectedListId(lists[0].id);
    if (senderProfiles.length > 0) {
      const defaultProf = senderProfiles.find((p: any) => p.isDefault) || senderProfiles[0];
      setSelectedProfileId(defaultProf.id);
      setSenderName(defaultProf.fromName || defaultProf.profileName || "");
      setSenderEmail(defaultProf.fromEmail || "");
    }
    setContentHtml(
      "<h2>Exclusive Commercial Update</h2><p>Dear {{first_name}},</p><p>We are pleased to introduce our latest enterprise solutions designed for your organization.</p><p><a href='https://ofia.ng' style='background:#1A56DB;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;'>Explore Platform</a></p>"
    );
    setScheduleType("NOW");
    setScheduleDate("");
    setRecipientSelectionMode("ALL");
    setIsModalOpen(true);
  }

  function handleOpenEditModal(blast: CrmEmailBlast) {
    setEditingBlastId(blast.id);
    setBlastTitle(blast.title || "");
    setBlastSubject(blast.subject || "");
    setSelectedListId(blast.listId || (lists[0]?.id ?? ""));
    setSenderName(blast.senderName || "");
    setSenderEmail(blast.senderEmail || "");
    if (blast.senderProfileId) {
      setSelectedProfileId(blast.senderProfileId);
    }
    setContentHtml(blast.contentHtml || "");
    if (blast.scheduledAt) {
      setScheduleType("LATER");
      try {
        setScheduleDate(new Date(blast.scheduledAt).toISOString().slice(0, 16));
      } catch {
        setScheduleDate(blast.scheduledAt);
      }
    } else {
      setScheduleType("NOW");
      setScheduleDate("");
    }
    setIsModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!blastToDelete) return;
    setIsDeleting(true);
    try {
      await crmFetch(`/api/erp/crm/blasts?id=${encodeURIComponent(blastToDelete.id)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Error deleting blast via API, updating local state:", err);
    } finally {
      setBlasts((prev) => prev.filter((b) => b.id !== blastToDelete.id));
      setBlastToDelete(null);
      setIsDeleting(false);
    }
  }

  const [isRetryingBlastId, setIsRetryingBlastId] = useState<string | null>(null);
  const [isRetryingRecipientId, setIsRetryingRecipientId] = useState<string | null>(null);
  const [retryProfileId, setRetryProfileId] = useState<string>("");

  const handleResumeBlast = async (blast: CrmEmailBlast) => {
    try {
      setIsResumingBlastId(blast.id);
      const res = await crmFetch(`/api/erp/crm/blasts?id=${encodeURIComponent(blast.id)}&action=resume`, {
        method: "PUT",
        body: JSON.stringify({
          id: blast.id,
          status: "SENDING",
        }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || "Failed to resume blast delivery");
      }

      setBlasts((prev) =>
        prev.map((b) => (b.id === blast.id ? { ...b, status: "SENDING" } : b))
      );
      if (selectedBlastForLogs && selectedBlastForLogs.id === blast.id) {
        setSelectedBlastForLogs((prev) => prev ? { ...prev, status: "SENDING" } : null);
        refreshBlastLogs();
      }
    } catch (err: any) {
      console.error("Error resuming blast:", err);
      alert("Could not resume blast: " + (err.message || "Unknown error"));
    } finally {
      setIsResumingBlastId(null);
    }
  };

  const handleRetryBlast = async (blast: CrmEmailBlast, newProfileId?: string) => {
    try {
      setIsRetryingBlastId(blast.id);
      const res = await crmFetch(`/api/erp/crm/blasts?id=${encodeURIComponent(blast.id)}&action=retry`, {
        method: "PUT",
        body: JSON.stringify({
          id: blast.id,
          status: "RETRY",
          senderProfileId: newProfileId || blast.senderProfileId,
        }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || "Failed to trigger retry for failed recipients");
      }

      setBlasts((prev) =>
        prev.map((b) => (b.id === blast.id ? { ...b, status: "SENDING", failedCount: 0 } : b))
      );
      if (selectedBlastForLogs && selectedBlastForLogs.id === blast.id) {
        setSelectedBlastForLogs((prev) => prev ? { ...prev, status: "SENDING", failedCount: 0 } : null);
        refreshBlastLogs();
      }
    } catch (err: any) {
      console.error("Error retrying blast:", err);
      alert("Could not retry blast: " + (err.message || "Unknown error"));
    } finally {
      setIsRetryingBlastId(null);
    }
  };

  const handleRetryRecipient = async (blastId: string, recipientId: string) => {
    try {
      setIsRetryingRecipientId(recipientId);
      const res = await crmFetch(
        `/api/erp/crm/blasts?id=${encodeURIComponent(blastId)}&action=retry_recipient&recipient_id=${encodeURIComponent(recipientId)}`,
        {
          method: "PUT",
          body: JSON.stringify({ id: blastId }),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to retry recipient");
      }
      setBlastLogs((prev) =>
        prev.map((l) => (l.id === recipientId ? { ...l, status: "PENDING", errorMessage: null } : l))
      );
      if (selectedBlastForLogs) {
        setSelectedBlastForLogs((prev) => (prev ? { ...prev, status: "SENDING" } : null));
      }
    } catch (err: any) {
      alert("Failed to retry recipient: " + err.message);
    } finally {
      setIsRetryingRecipientId(null);
    }
  };

  // Active blasts excluding any deleted or archived campaigns
  const activeBlasts = useMemo(() => {
    return blasts.filter((b) => {
      if (!b || !b.id) return false;
      const statusStr = String(b.status || "").toUpperCase();
      if ((b as any).isDeleted || statusStr === "DELETED" || statusStr === "ARCHIVED" || (b as any).deletedAt) {
        return false;
      }
      return true;
    });
  }, [blasts]);

  const filteredBlasts = useMemo(() => {
    return activeBlasts.filter((b) => {
      const matchSearch =
        !searchQuery.trim() ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.listName && b.listName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.senderEmail && b.senderEmail.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [activeBlasts, searchQuery, statusFilter]);

  // Reset page on search or status change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalItems = filteredBlasts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedBlasts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredBlasts.slice(startIndex, startIndex + pageSize);
  }, [filteredBlasts, currentPage, pageSize]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshBlasts = async () => {
    setIsRefreshing(true);
    try {
      const res = await crmFetch("/api/erp/crm/blasts").then((r) => r.json());
      if (res?.blasts) {
        setBlasts(res.blasts);
      }
    } catch {}
    finally {
      setIsRefreshing(false);
    }
  };

  // Top stats calculations based strictly on the currently listed campaigns (filteredBlasts), not including deleted ones
  const statsCalculations = useMemo(() => {
    const targetBlasts = filteredBlasts;

    const totalDelivered = targetBlasts.reduce((acc, b) => {
      const sent = Number(b.sentCount) || 0;
      if (sent > 0) return acc + sent;
      if (b.status === "SENT") return acc + (Number(b.totalRecipients) || 0);
      return acc;
    }, 0);

    const totalOpens = targetBlasts.reduce((acc, b) => acc + (Number(b.openCount) || 0), 0);
    const totalClicks = targetBlasts.reduce((acc, b) => acc + (Number(b.clickCount) || 0), 0);
    const totalTargeted = targetBlasts.reduce((acc, b) => acc + (Number(b.totalRecipients) || 0), 0);

    const totalDispatched = targetBlasts.filter(
      (b) => b.status === "SENT" || b.status === "SENDING" || (Number(b.sentCount) || 0) > 0
    ).length;

    const avgOpenRate =
      totalDelivered > 0
        ? Math.min(100, (totalOpens / totalDelivered) * 100).toFixed(1)
        : totalOpens > 0
        ? "100.0"
        : "0.0";

    const avgClickRate =
      totalDelivered > 0
        ? Math.min(100, (totalClicks / totalDelivered) * 100).toFixed(1)
        : totalClicks > 0
        ? "100.0"
        : "0.0";

    const listedListIds = new Set(targetBlasts.map((b) => b.listId || b.listName).filter(Boolean));
    const activeListCount = listedListIds.size;

    return {
      totalDispatched,
      totalDelivered,
      totalOpens,
      totalClicks,
      totalTargeted,
      avgOpenRate,
      avgClickRate,
      activeListCount,
    };
  }, [filteredBlasts]);

  return (
    <ErpAdminShell
      title="Email Marketing & Blast Scheduler"
      subtitle="Compose targeted outbound blasts, schedule automated dispatches, manage merge tags, and track live deliverability."
      activeModule="crm"
      action={
        <div className="flex items-center gap-2">
          <NexaButton
            variant="secondary"
            className="gap-2 text-xs"
            onClick={refreshBlasts}
            disabled={isRefreshing}
            title="Refresh blast deliverability stats"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#1A56DB]" : ""}`} />
            {isRefreshing ? "Syncing..." : "Refresh"}
          </NexaButton>
          <Link href="/erp/admin/crm/lists">
            <NexaButton variant="secondary" className="gap-2 text-xs">
              <Users className="w-3.5 h-3.5" />
              Manage Lists
            </NexaButton>
          </Link>
          <NexaButton
            variant="primary"
            className="gap-2 text-xs"
            onClick={handleOpenCreateModal}
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
              value: statsCalculations.totalDispatched.toString(),
              change: `${statsCalculations.totalDelivered.toLocaleString()} emails delivered`,
              changeType: "success",
              icon: <Send className="w-4 h-4 text-emerald-500" />,
            },
            {
              label: "Average Open Rate",
              value: `${statsCalculations.avgOpenRate}%`,
              change: `${statsCalculations.totalOpens.toLocaleString()} total verified opens`,
              changeType: "success",
              icon: <Eye className="w-4 h-4 text-blue-500" />,
            },
            {
              label: "Audience Subscriber Lists",
              value: (statsCalculations.activeListCount > 0 ? statsCalculations.activeListCount : lists.length).toString(),
              change: `${statsCalculations.totalTargeted > 0 ? statsCalculations.totalTargeted.toLocaleString() + " recipients targeted" : lists.reduce((acc, l) => acc + l.subscriberCount, 0).toLocaleString() + " total contacts"}`,
              changeType: "success",
              icon: <Users className="w-4 h-4 text-purple-500" />,
            },
            {
              label: "Tracked Click Rate",
              value: `${statsCalculations.avgClickRate}%`,
              change: `${statsCalculations.totalClicks.toLocaleString()} unique link clicks`,
              changeType: "success",
              icon: <Sparkles className="w-4 h-4 text-amber-500" />,
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
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4">Schedule / Dispatched</th>
                  <th className="py-3 px-4 text-center">Recipients</th>
                  <th className="py-3 px-4 text-center">Open Rate</th>
                  <th className="py-3 px-4 text-center">Click Rate</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)]">
                {paginatedBlasts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[var(--nexa-text-muted)]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Mail className="w-8 h-8 text-[var(--nexa-text-muted)]/50" />
                        <span className="text-xs font-semibold">No email campaigns found</span>
                        <span className="text-[11px] text-[var(--nexa-text-muted)]">
                          {searchQuery || statusFilter !== "ALL"
                            ? "Try adjusting your search or status filter."
                            : "Click 'Schedule New Blast' to create your first outbound campaign."}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedBlasts.map((blast) => {
                    const openCount = Number(blast.openCount) || 0;
                    const clickCount = Number(blast.clickCount) || 0;
                    const sentCount = Number(blast.sentCount) || 0;
                    const totalRecipients = Number(blast.totalRecipients) || 0;
                    const effectiveBase = sentCount > 0 ? sentCount : totalRecipients;
                    const openPct = effectiveBase > 0 ? ((openCount / effectiveBase) * 100).toFixed(0) : "0";
                    const clickPct = effectiveBase > 0 ? ((clickCount / effectiveBase) * 100).toFixed(0) : "0";

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
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <NexaBadge
                            className="whitespace-nowrap inline-flex items-center"
                            variant={
                              blast.status === "SENT"
                                ? "success"
                                : blast.status === "SCHEDULED"
                                ? "warning"
                                : blast.status === "SENDING"
                                ? "brand"
                                : blast.status === "FAILED"
                                ? "danger"
                                : "neutral"
                            }
                          >
                            {blast.status === "SENDING" ? (
                              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                <RefreshCw className="w-3 h-3 animate-spin text-[#0069FF] shrink-0" />
                                <span>SENDING ({sentCount}/{totalRecipients})</span>
                              </span>
                            ) : blast.status === "SENT" ? (
                              <span className="whitespace-nowrap">SENT ({sentCount}/{totalRecipients})</span>
                            ) : (
                              <span className="whitespace-nowrap">{blast.status}</span>
                            )}
                          </NexaBadge>
                        </td>
                        <td className="py-3.5 px-4 text-[var(--nexa-text-muted)]">
                          {blast.status === "SENT" && blast.sentAt ? (
                            <span>Sent on {new Date(blast.sentAt).toLocaleDateString()}</span>
                          ) : blast.status === "SENDING" ? (
                            <span className="text-blue-600 dark:text-blue-400 font-medium">In Progress...</span>
                          ) : blast.scheduledAt ? (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                              {new Date(blast.scheduledAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span>Draft</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-[var(--nexa-text-primary)]">
                          {totalRecipients}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                          {blast.status === "SENT" ? `${openPct}% (${openCount})` : blast.status === "SENDING" && openCount > 0 ? `${openCount} opens` : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-blue-600 dark:text-blue-400">
                          {blast.status === "SENT" ? `${clickPct}% (${clickCount})` : blast.status === "SENDING" && clickCount > 0 ? `${clickCount} clicks` : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Retry Failed Sends for FAILED blasts or blasts with failed recipients */}
                            {((blast.failedCount || 0) > 0 || blast.status === "FAILED") && (
                              <button
                                type="button"
                                onClick={() => handleRetryBlast(blast)}
                                disabled={isRetryingBlastId === blast.id}
                                title="Retry all failed sends"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {isRetryingBlastId === blast.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <RotateCcw className="w-3.5 h-3.5" />
                                )}
                                Retry ({blast.failedCount || "All"})
                              </button>
                            )}

                            {/* Resume / Send Remaining for stalled SENDING blasts */}
                            {blast.status === "SENDING" && (
                              <button
                                type="button"
                                onClick={() => handleResumeBlast(blast)}
                                disabled={isResumingBlastId === blast.id}
                                title="Resume sending remaining emails"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {isResumingBlastId === blast.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Send className="w-3.5 h-3.5" />
                                )}
                                Resume
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openBlastLogs(blast)}
                              title="View delivery logs"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold text-[#1A56DB] hover:bg-[#1A56DB]/10 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Logs
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(blast)}
                              title="Edit campaign"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold text-[var(--nexa-text-muted)] hover:text-[#1A56DB] hover:bg-[#1A56DB]/10 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setBlastToDelete(blast)}
                              title="Delete campaign"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination Controller & Page Size Selector */}
          <div className="p-3 border-t border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[var(--nexa-text-muted)]">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-semibold text-[var(--nexa-text-primary)] focus:outline-none focus:ring-1 focus:ring-[#1A56DB] cursor-pointer"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={pageSize}
              onPageChange={setCurrentPage}
              className="pt-0 border-t-0"
            />
          </div>
        </NexaCard>
      </div>

      {/* SCHEDULE / EDIT BLAST MODAL */}
      <NexaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBlastId(null);
        }}
        title={editingBlastId ? "Edit Email Campaign" : "Schedule Email Blast"}
        subtitle={
          editingBlastId
            ? "Update campaign details, subject line, audience list, and email content copy."
            : "Configure your audience list, outbound sending domain, rich email copy, and dispatch timing."
        }
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
                    { id: "HAS_NAME", label: `Has Name (${listSubscribers.filter((s) => s.name || s.firstName || s.lastName).length})` },
                    { id: "MISSING_NAME", label: `Missing Name (${listSubscribers.filter((s) => !s.name && !s.firstName && !s.lastName).length})` },
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
            <NexaButton
              variant="secondary"
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingBlastId(null);
              }}
            >
              Cancel
            </NexaButton>
            <NexaButton
              variant="primary"
              type="submit"
              disabled={isSaving || (recipientSelectionMode === "CUSTOM" && selectedSubscriberIds.length === 0)}
              isLoading={isSaving}
            >
              {isSaving
                ? "Saving..."
                : editingBlastId
                ? "Save Changes"
                : scheduleType === "NOW"
                ? `Dispatch Blast Now (${recipientSelectionMode === "CUSTOM" ? selectedSubscriberIds.length : (listSubscribers.filter((s) => s.email && s.email.includes("@")).length || "All")})`
                : "Schedule Blast"}
            </NexaButton>
          </div>
        </form>
      </NexaModal>

      {/* DELIVERY & ENGAGEMENT LOGS MODAL */}
      <NexaModal
        isOpen={Boolean(selectedBlastForLogs)}
        onClose={() => setSelectedBlastForLogs(null)}
        title={`Delivery & Engagement Logs: ${selectedBlastForLogs?.title || ""}`}
        maxWidth="5xl"
      >
        <div className="space-y-4 max-h-[78vh] flex flex-col">
          {/* Notification Toast */}
          {toastBanner && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between border ${
                toastBanner.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {toastBanner.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{toastBanner.message}</span>
                {toastBanner.type === "success" && (
                  <Link
                    href="/erp/admin/crm/leads"
                    className="underline text-[#1A56DB] dark:text-[#3B82F6] ml-2 font-bold"
                  >
                    View in Leads Directory →
                  </Link>
                )}
              </div>
              <button
                type="button"
                onClick={() => setToastBanner(null)}
                className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
          {/* Header Summary Strip */}
          <div className="p-3.5 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--nexa-text-primary)] truncate">
                    {selectedBlastForLogs?.subject}
                  </span>
                  <NexaBadge
                    variant={
                      selectedBlastForLogs?.status === "SENT"
                        ? "success"
                        : selectedBlastForLogs?.status === "SENDING"
                        ? "brand"
                        : selectedBlastForLogs?.status === "FAILED"
                        ? "danger"
                        : "warning"
                    }
                    size="sm"
                  >
                    {selectedBlastForLogs?.status}
                  </NexaBadge>
                </div>
                <div className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5 flex items-center gap-2">
                  <span>Audience: <strong className="text-[var(--nexa-text-secondary)]">{selectedBlastForLogs?.listName || "Target Audience"}</strong></span>
                  <span>•</span>
                  <span>Dispatched: {selectedBlastForLogs?.sentAt ? new Date(selectedBlastForLogs.sentAt).toLocaleString() : "Pending"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedBlastForLogs && (selectedBlastForLogs.status === "SENDING" || selectedBlastForLogs.status === "FAILED" || logStats.sent < logStats.total) && (
                  <button
                    type="button"
                    onClick={() => handleResumeBlast(selectedBlastForLogs)}
                    disabled={isResumingBlastId === selectedBlastForLogs.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isResumingBlastId === selectedBlastForLogs.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Resume Delivery ({logStats.total - logStats.sent} remaining)
                  </button>
                )}
                <button
                  type="button"
                  onClick={refreshBlastLogs}
                  disabled={isLoadingLogs}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] text-xs font-semibold text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-card)] transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? "animate-spin text-[#0069FF]" : ""}`} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={exportLogsToCSV}
                  disabled={blastLogs.length === 0}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] text-xs font-semibold text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-card)] transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--nexa-border)]">
              <div className="p-2 rounded-lg bg-[var(--nexa-bg-card)] border border-[var(--nexa-border)] text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--nexa-text-muted)]">Dispatched</div>
                <div className="text-base font-extrabold text-[var(--nexa-text-primary)] mt-0.5">
                  {logStats.sent} <span className="text-[11px] font-normal text-[var(--nexa-text-muted)]">/ {logStats.total}</span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Total Opened</div>
                <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                  <Eye className="w-4 h-4 inline" />
                  {logStats.opened}
                  <span className="text-xs font-bold opacity-80">({logStats.openRate}%)</span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/20 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Total Clicked</div>
                <div className="text-base font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 flex items-center justify-center gap-1">
                  <ExternalLink className="w-4 h-4 inline" />
                  {logStats.clicked}
                  <span className="text-xs font-bold opacity-80">({logStats.clickRate}%)</span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-[var(--nexa-bg-card)] border border-[var(--nexa-border)] text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--nexa-text-muted)]">Unopened / Failed</div>
                <div className="text-base font-extrabold text-[var(--nexa-text-primary)] mt-0.5">
                  {logStats.unopened} <span className="text-xs font-normal text-red-500">({logStats.failed} fail)</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAILED SEND RETRY BANNER */}
          {logStats.failed > 0 && selectedBlastForLogs && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-bold text-xs text-red-700 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{logStats.failed} recipient(s) failed delivery</span>
                </div>
                <p className="text-[11px] text-red-600/80 dark:text-red-400/80">
                  Commonly caused by TLS/port timeouts (e.g. Hostinger on port 465). Switch to port 587 or pick a relay below to retry immediately.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {senderProfiles.length > 0 && (
                  <select
                    value={retryProfileId || selectedBlastForLogs.senderProfileId || ""}
                    onChange={(e) => setRetryProfileId(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-[var(--nexa-text-primary)] cursor-pointer"
                  >
                    <option value="">Keep Campaign Profile</option>
                    {senderProfiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.profileName} ({p.provider.toUpperCase()})
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => handleRetryBlast(selectedBlastForLogs, retryProfileId || undefined)}
                  disabled={isRetryingBlastId === selectedBlastForLogs.id}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isRetryingBlastId === selectedBlastForLogs.id ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Retrying Sends...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retry All Failed ({logStats.failed})
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Filter Tabs & Search Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="inline-flex rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setLogFilter("ALL")}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  logFilter === "ALL"
                    ? "bg-[var(--nexa-bg-card)] text-[var(--nexa-text-primary)] shadow-sm"
                    : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-secondary)]"
                }`}
              >
                All ({logStats.total})
              </button>
              <button
                type="button"
                onClick={() => setLogFilter("OPENED")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  logFilter === "OPENED"
                    ? "bg-[var(--nexa-bg-card)] text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-[var(--nexa-text-muted)] hover:text-emerald-600"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Opened ({logStats.opened})
              </button>
              <button
                type="button"
                onClick={() => setLogFilter("CLICKED")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  logFilter === "CLICKED"
                    ? "bg-[var(--nexa-bg-card)] text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-[var(--nexa-text-muted)] hover:text-blue-600"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Clicked ({logStats.clicked})
              </button>
              <button
                type="button"
                onClick={() => setLogFilter("UNOPENED")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  logFilter === "UNOPENED"
                    ? "bg-[var(--nexa-bg-card)] text-[var(--nexa-text-primary)] shadow-sm"
                    : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-secondary)]"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                Unopened ({logStats.unopened})
              </button>
              {logStats.failed > 0 && (
                <button
                  type="button"
                  onClick={() => setLogFilter("FAILED")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                    logFilter === "FAILED"
                      ? "bg-[var(--nexa-bg-card)] text-red-600 shadow-sm"
                      : "text-red-500 hover:text-red-600"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  Failed ({logStats.failed})
                </button>
              )}
            </div>

            {/* Recipient Search */}
            <div className="relative min-w-[220px] max-w-xs flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nexa-text-muted)] pointer-events-none" />
              <input
                type="text"
                placeholder="Search recipient or email..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] text-xs text-[var(--nexa-text-primary)] placeholder-[var(--nexa-text-muted)] focus:outline-none focus:ring-1 focus:ring-[#0069FF]"
              />
            </div>
          </div>

          {/* Recipient Table */}
          <div className="flex-1 overflow-y-auto min-h-[260px] border border-[var(--nexa-border)] rounded-lg">
            {isLoadingLogs ? (
              <div className="text-center py-16 text-xs text-[var(--nexa-text-muted)] flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#0069FF]" />
                Refreshing recipient engagement activity...
              </div>
            ) : filteredBlastLogs.length === 0 ? (
              <div className="text-center py-16 text-xs text-[var(--nexa-text-muted)]">
                {blastLogs.length === 0
                  ? "No recipient delivery logs recorded for this blast yet."
                  : "No recipients match the selected engagement filter or search query."}
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--nexa-bg-surface)] border-b border-[var(--nexa-border)] font-bold text-[var(--nexa-text-muted)] sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Delivery Status</th>
                    <th className="py-2.5 px-3">Email Opens</th>
                    <th className="py-2.5 px-3">Link Clicks</th>
                    <th className="py-2.5 px-3">Details / Errors</th>
                    <th className="py-2.5 px-3">CRM Lead Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--nexa-border)]">
                  {filteredBlastLogs.map((log) => {
                    const isOpened = Boolean(log.openedAt || (log.openCount && log.openCount > 0));
                    const isClicked = Boolean(log.clickedAt || (log.clickCount && log.clickCount > 0));

                    return (
                      <tr key={log.id} className="hover:bg-[var(--nexa-bg-surface)]/50 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-[var(--nexa-text-primary)]">
                            {log.name && log.name.trim() ? log.name : "Recipient"}
                          </div>
                          <div className="text-[11px] text-[var(--nexa-text-muted)] font-mono">{log.email}</div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <NexaBadge
                              variant={
                                log.status === "SENT"
                                  ? "success"
                                  : log.status === "FAILED"
                                  ? "danger"
                                  : "neutral"
                              }
                              size="sm"
                            >
                              {log.status}
                            </NexaBadge>
                          </div>
                          {log.sentAt && (
                            <div className="text-[10px] text-[var(--nexa-text-muted)] mt-0.5">
                              {new Date(log.sentAt).toLocaleTimeString()} ({new Date(log.sentAt).toLocaleDateString()})
                            </div>
                          )}
                        </td>

                        <td className="py-2.5 px-3">
                          {isOpened ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <Eye className="w-3 h-3" />
                                Opened ({log.openCount || 1}x)
                              </span>
                              {log.openedAt && (
                                <div className="text-[10px] text-[var(--nexa-text-muted)] mt-0.5">
                                  {new Date(log.openedAt).toLocaleTimeString()} ({new Date(log.openedAt).toLocaleDateString()})
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-500/10 text-slate-500 border border-slate-500/20">
                              Unopened
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3">
                          {isClicked ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                <ExternalLink className="w-3 h-3" />
                                Clicked ({log.clickCount || 1}x)
                              </span>
                              {log.clickedAt && (
                                <div className="text-[10px] text-[var(--nexa-text-muted)] mt-0.5">
                                  {new Date(log.clickedAt).toLocaleTimeString()} ({new Date(log.clickedAt).toLocaleDateString()})
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-[var(--nexa-text-muted)]">—</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-[11px] text-[var(--nexa-text-muted)]">
                          {log.errorMessage ? (
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-red-500 font-mono text-[10px] leading-tight block max-w-xs break-words">
                                {log.errorMessage}
                              </span>
                              {selectedBlastForLogs && (
                                <button
                                  type="button"
                                  onClick={() => handleRetryRecipient(selectedBlastForLogs.id, log.id)}
                                  disabled={isRetryingRecipientId === log.id}
                                  className="text-[10px] text-red-600 dark:text-red-400 hover:underline font-bold px-1.5 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
                                  title="Retry this single recipient"
                                >
                                  {isRetryingRecipientId === log.id ? (
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <RotateCcw className="w-2.5 h-2.5" />
                                  )}
                                  Retry
                                </button>
                              )}
                            </div>
                          ) : log.status === "SENT" ? (
                            <span className="text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-1 font-medium">
                              <Check className="w-3 h-3" /> Delivered
                            </span>
                          ) : (
                            <span>Pending</span>
                          )}
                        </td>

                        {/* CRM Prospect Lead Action */}
                        <td className="py-2.5 px-3">
                          {(() => {
                            const existingLead = getExistingLead(log);
                            if (existingLead) {
                              return (
                                <div className="flex flex-col gap-1 items-start">
                                  <button
                                    type="button"
                                    disabled
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 text-[11px] font-bold cursor-not-allowed opacity-75 shadow-none whitespace-nowrap"
                                    title={`Already a prospect in CRM Leads (Assigned Closer: ${existingLead.assignedRep})`}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                    <span>Prospect in Leads</span>
                                  </button>
                                  <div className="text-[10px] text-[var(--nexa-text-muted)] flex items-center gap-1">
                                    <span className="truncate max-w-[140px]">
                                      Closer: <strong className="text-[var(--nexa-text-secondary)] font-semibold">{existingLead.assignedRep}</strong>
                                    </span>
                                    <Link
                                      href="/erp/admin/crm/leads"
                                      className="text-[#1A56DB] dark:text-[#3B82F6] hover:underline shrink-0"
                                      title="Open Leads Directory"
                                    >
                                      <ExternalLink className="w-2.5 h-2.5 inline" />
                                    </Link>
                                  </div>
                                </div>
                              );
                            }

                            if (activeAssignPopoverLogId === log.id) {
                              return (
                                <div className="p-2.5 rounded-xl bg-[var(--nexa-bg-card)] border border-[#1A56DB]/40 shadow-lg space-y-2 min-w-[220px] animate-in fade-in duration-150">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-[var(--nexa-text-primary)]">
                                    <span>Assign Closer:</span>
                                    <button
                                      type="button"
                                      onClick={() => setActiveAssignPopoverLogId(null)}
                                      className="text-[var(--nexa-text-muted)] hover:text-rose-500 text-xs px-1 cursor-pointer"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  <select
                                    value={selectedCloserForLog[log.id] || "Auto-Assign (Least-Loaded)"}
                                    onChange={(e) =>
                                      setSelectedCloserForLog((prev) => ({
                                        ...prev,
                                        [log.id]: e.target.value,
                                      }))
                                    }
                                    className="w-full px-2 py-1.5 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] text-xs font-semibold text-[var(--nexa-text-primary)] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1A56DB]"
                                  >
                                    <option value="Auto-Assign (Least-Loaded)">⚡ Auto-Assign (Least-Loaded)</option>
                                    {salesClosers.map((c) => (
                                      <option key={c.email || c.name} value={c.name}>
                                        {c.name}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="flex items-center gap-1.5 justify-end pt-1">
                                    <button
                                      type="button"
                                      onClick={() => setActiveAssignPopoverLogId(null)}
                                      className="px-2 py-1 rounded-md text-[10px] font-bold text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)] cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isAddingProspectId === log.id}
                                      onClick={() => handleAddLeadAsProspect(log)}
                                      className="px-2.5 py-1 rounded-md bg-[#1A56DB] hover:bg-[#1545B0] text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                    >
                                      {isAddingProspectId === log.id ? (
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Check className="w-3 h-3" />
                                      )}
                                      Save Prospect
                                    </button>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveAssignPopoverLogId(log.id);
                                  if (!selectedCloserForLog[log.id]) {
                                    setSelectedCloserForLog((prev) => ({
                                      ...prev,
                                      [log.id]: "Auto-Assign (Least-Loaded)",
                                    }));
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1A56DB]/10 hover:bg-[#1A56DB]/20 text-[#1A56DB] dark:text-[#3B82F6] border border-[#1A56DB]/25 text-[11px] font-bold transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                                title="Add recipient as a prospect to CRM Leads page"
                              >
                                <Plus className="w-3 h-3" />
                                Add Prospect
                              </button>
                            );
                          })()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[var(--nexa-border)]">
            <span className="text-xs text-[var(--nexa-text-muted)]">
              Showing {filteredBlastLogs.length} of {blastLogs.length} recipients
            </span>
            <NexaButton variant="secondary" onClick={() => setSelectedBlastForLogs(null)}>
              Close
            </NexaButton>
          </div>
        </div>
      </NexaModal>

      {/* DELETE CONFIRMATION MODAL */}
      <NexaModal
        isOpen={Boolean(blastToDelete)}
        onClose={() => setBlastToDelete(null)}
        title="Delete Email Campaign"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-[var(--nexa-text-muted)] leading-relaxed">
            Are you sure you want to delete <strong className="text-[var(--nexa-text-primary)] font-bold">{blastToDelete?.title ? `"${blastToDelete.title}"` : "this campaign"}</strong>? This will permanently remove the campaign record and all associated recipient delivery logs. This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <NexaButton
              variant="secondary"
              type="button"
              disabled={isDeleting}
              onClick={() => setBlastToDelete(null)}
            >
              Cancel
            </NexaButton>
            <NexaButton
              variant="danger"
              type="button"
              disabled={isDeleting}
              isLoading={isDeleting}
              onClick={handleConfirmDelete}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              {isDeleting ? "Deleting..." : "Delete Campaign"}
            </NexaButton>
          </div>
        </div>
      </NexaModal>
    </ErpAdminShell>
  );
}
