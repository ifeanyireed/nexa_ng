"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  CheckSquare,
  Square,
  Filter,
  Search,
  RefreshCw,
  Sparkles,
  Building2,
  UserCheck,
  Shield,
  Settings,
  Eye,
  Edit3,
  ExternalLink,
  ChevronDown,
  Info,
  Globe,
  History,
  Clock,
  RotateCcw,
  FileText,
  X,
  Check,
  ArrowRight,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant, DatabaseTenant } from "@/lib/tenant-context";
import { resolveAvatarUrl } from "@/lib/avatar";
import { INITIAL_USERS } from "@/lib/erp-store";

interface StaffRecipient {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  designation?: string;
  avatar?: string;
}

const EMAIL_TEMPLATES = [
  {
    id: "active_review_cycle_instructions",
    name: "Active Review Cycle Instructions & Guide",
    subject: "Action Required: Complete Your Self-Appraisal for Active Review Cycle ({{name}})",
    body: `<p>Dear {{name}},</p>

<p>This is a formal directive from Human Resources regarding our <strong>Active Performance Review Cycle</strong>. All staff members are required to complete and submit their self-appraisal within the allotted cycle period.</p>

<div style="text-align: center; margin: 24px 0;">
  <a href="{{login_url}}" style="display: inline-block; background-color: #1a56db; color: #ffffff; font-weight: bold; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(26,86,219,0.3);">
    Click Here to Log In & Begin Appraisal
  </a>
  <p style="margin-top: 8px; font-size: 11px; color: #64748b;">
    Direct Login URL: <a href="{{login_url}}" style="color: #1a56db; font-weight: bold; text-decoration: underline;">{{login_url}}</a>
  </p>
</div>

<h3 style="color: #0f172a; font-size: 14px; margin-top: 18px; font-weight: bold;">Step-by-Step Navigation Guide (How to Complete Your Appraisal):</h3>

<ol style="color: #334155; font-size: 13px; line-height: 1.7; padding-left: 20px;">
  <li><strong>Log In to Your Workspace:</strong> Go to the corporate login portal at <a href="{{login_url}}" style="color: #1a56db; font-weight: bold; text-decoration: underline;">{{login_url}}</a> and sign in with your corporate email (<code style="background: #f1f5f9; padding: 2px 5px; border-radius: 4px;">{{email}}</code>) and password.</li>
  <li><strong>Access the Employee Portal:</strong>
    <ul>
      <li>In the left-hand navigation sidebar, click on <strong>"Employee Portal"</strong> (or navigate directly to <a href="{{portal_url}}" style="color: #1a56db; font-weight: bold; text-decoration: underline;">{{portal_url}}</a>).</li>
    </ul>
  </li>
  <li><strong>Locate Your Active Appraisal Cycle:</strong> Under the <em>Active Performance Appraisal</em> section, identify the current open cycle.</li>
  <li><strong>Start or Resume Self-Assessment:</strong> Click on the blue <strong>"Start Self-Appraisal"</strong> button (or <strong>"Continue Review"</strong> if already saved as a draft).</li>
  <li><strong>Rate Key Performance Objectives:</strong>
    <ul>
      <li>Evaluate your achievements against each allocated corporate objective and scoring milestone (from 1 to 5 stars).</li>
      <li>Provide specific reflections, documented milestones, and justification in the comments field.</li>
    </ul>
  </li>
  <li><strong>Submit to Your Line Manager:</strong> Review all inputs, then click <strong>"Submit Self-Appraisal"</strong> to forward your appraisal directly to your Line Manager and HR Lead for review.</li>
</ol>

<div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; margin: 18px 0; color: #92400e; font-size: 12px;">
  <strong>Allotted Submission Window:</strong> Please ensure your appraisal is submitted before the cycle cutoff date. Incomplete self-appraisals delay manager evaluations, moderation committees, and performance incentives.
</div>

<p style="color: #475569; font-size: 13px;">If you encounter any issues logging in at <a href="{{login_url}}" style="color: #1a56db; font-weight: bold; text-decoration: underline;">{{login_url}}</a> or navigating your appraisal form, please reach out to IT Support immediately.</p>

<p style="color: #334155; font-size: 13px; margin-top: 20px;">Warm regards,<br/><strong>Human Resources & People Operations</strong></p>`,
  },
  {
    id: "general_announcement",
    name: "General Announcement",
    subject: "Important Enterprise Update: {{name}}",
    body: `<p>Dear {{name}},</p>
<p>We are writing to share an important corporate update with all staff members across the organization.</p>
<p>Please review our latest strategic priorities and operational guidelines as we continue driving excellence across our departments.</p>
<p>If you have any questions or need further clarification, feel free to reach out to your team lead or Human Resources.</p>
<p>Warm regards,<br/><strong>Executive Leadership Team</strong></p>`,
  },
  {
    id: "system_maintenance",
    name: "Scheduled System Maintenance",
    subject: "Notice: Scheduled Platform Maintenance Window",
    body: `<p>Dear {{name}},</p>
<p>Please be advised that scheduled maintenance will be performed on the enterprise ERP platform this upcoming weekend.</p>
<p><strong>Impact Details:</strong></p>
<ul>
  <li><strong>Department:</strong> {{department}}</li>
  <li><strong>Downtime Duration:</strong> Approximately 45 minutes</li>
  <li><strong>Scope:</strong> Core database optimization, security enhancements, and ledger upgrades.</li>
</ul>
<p>Please ensure all active transactions, time logs, and performance appraisals are saved prior to this maintenance window.</p>
<p>Thank you for your cooperation.<br/><strong>Systems & IT Infrastructure</strong></p>`,
  },
  {
    id: "all_hands",
    name: "All-Hands Meeting Invitation",
    subject: "Invitation: Monthly All-Hands Assembly",
    body: `<p>Hi {{name}},</p>
<p>You are cordially invited to our upcoming Monthly All-Hands Assembly. During this session, executive leadership will review monthly milestones, financial performance, and department achievements.</p>
<p><strong>Your Details:</strong><br/>
Role: {{role}}<br/>
Department: {{department}}</p>
<p>We look forward to your active participation!</p>
<p>Best regards,<br/><strong>Human Resources & Talent Management</strong></p>`,
  },
  {
    id: "policy_compliance",
    name: "Policy & Compliance Memo",
    subject: "Action Required: Annual Policy & Code of Conduct Review",
    body: `<p>Dear {{name}},</p>
<p>This is a formal reminder to review and acknowledge our updated corporate code of conduct and workplace safety guidelines.</p>
<p>All staff members in <strong>{{department}}</strong> are kindly requested to complete their review within the next 5 business days.</p>
<p>Thank you for your prompt attention to this matter.</p>
<p>Sincerely,<br/><strong>Corporate Governance & Compliance</strong></p>`,
  },
];

function getRoleTagClasses(role: string): string {
  const r = (role || "").toLowerCase().replace(/_/g, " ");
  if (r.includes("admin")) {
    return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50";
  }
  if (r.includes("md") || r.includes("exec")) {
    return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50";
  }
  if (r.includes("manager")) {
    return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50";
  }
  if (r.includes("hr")) {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50";
  }
  if (r.includes("accountant") || r.includes("finance")) {
    return "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50";
  }
  if (r.includes("marketer") || r.includes("sales")) {
    return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50";
  }
  if (r.includes("cashier") || r.includes("pos")) {
    return "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/50";
  }
  if (r.includes("dispatch") || r.includes("logistics")) {
    return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50";
  }
  // Default Employee / Staff
  return "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50";
}

function MassMessagingContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tenantSlugParam = searchParams.get("tenant") || searchParams.get("tenantSlug") || "";
  const { activeTenant, tenants, setActiveTenant } = useActiveTenant(user?.email, tenantSlugParam);

  const [users, setUsers] = useState<StaffRecipient[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");

  // SMTP Status state
  const [smtpConfigured, setSmtpConfigured] = useState<boolean | null>(null);
  const [smtpSenderEmail, setSmtpSenderEmail] = useState<string>("");
  const [smtpProviderName, setSmtpProviderName] = useState<string>("");

  // Email Composer states (defaults to Active Review Cycle Instructions)
  const [subject, setSubject] = useState(EMAIL_TEMPLATES[0].subject);
  const [bodyHtml, setBodyHtml] = useState(EMAIL_TEMPLATES[0].body);
  const [selectedTemplate, setSelectedTemplate] = useState("active_review_cycle_instructions");
  const [previewMode, setPreviewMode] = useState(false);

  // Dispatch states
  const [isSending, setIsSending] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [campaignProgress, setCampaignProgress] = useState<{
    id: string;
    total: number;
    sent: number;
    failed: number;
    pending: number;
    status: string;
    progressPercent: number;
    errors: Array<{ email: string; error: string }>;
  } | null>(null);

  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
    total?: number;
    sent?: number;
    failed?: number;
    errors?: Array<{ email: string; error: string }>;
  } | null>(null);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");

  // History states
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("ALL");

  // Audit modal states
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState<any | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [detailTab, setDetailTab] = useState<"recipients" | "preview">("recipients");
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientStatusFilter, setRecipientStatusFilter] = useState("ALL");

  // Fetch campaigns list
  const fetchCampaigns = async (silent: boolean = false) => {
    const slug = (activeTenant?.slug || tenantSlugParam || "neweratransports").trim();
    if (!silent) setIsLoadingCampaigns(true);
    try {
      const res = await fetch(`/api/erp/mass-email?tenantSlug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.warn("Failed to load campaigns:", err);
    } finally {
      if (!silent) setIsLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [activeTenant?.slug, tenantSlugParam]);

  const handleInspectCampaign = async (id: string, silent: boolean = false) => {
    setInspectModalOpen(true);
    if (!silent) {
      setIsLoadingDetail(true);
      setSelectedCampaignDetail(null);
      setDetailTab("recipients");
      setRecipientSearch("");
      setRecipientStatusFilter("ALL");
    }

    try {
      const res = await fetch(`/api/erp/mass-email?campaignId=${encodeURIComponent(id)}&details=true`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCampaignDetail(data.campaign || null);
      }
    } catch (err) {
      console.warn("Failed to load campaign audit details:", err);
    } finally {
      if (!silent) setIsLoadingDetail(false);
    }
  };

  const handleRetryFailed = async (id: string) => {
    if (!id || isRetrying) return;
    setIsRetrying(true);
    try {
      const res = await fetch("/api/erp/mass-email/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: id }),
      });
      if (res.ok) {
        await handleInspectCampaign(id);
        await fetchCampaigns();
      }
    } catch (err) {
      console.warn("Failed to retry emails:", err);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleReuseCampaign = (camp: any) => {
    if (camp.messageHtml) {
      setSubject(camp.subject);
      setBodyHtml(camp.messageHtml);
      setSelectedTemplate("custom");
      setActiveTab("compose");
      setInspectModalOpen(false);
    } else {
      fetch(`/api/erp/mass-email?campaignId=${encodeURIComponent(camp.id)}&details=true`)
        .then((r) => r.json())
        .then((data) => {
          if (data.campaign?.messageHtml) {
            setSubject(data.campaign.subject);
            setBodyHtml(data.campaign.messageHtml);
            setSelectedTemplate("custom");
          }
          setActiveTab("compose");
          setInspectModalOpen(false);
        });
    }
  };

  // Check if any campaigns have pending work
  const hasActiveCampaignWork = useMemo(() => {
    return campaigns.some(
      (c) => c.status === "queued" || c.status === "processing" || (c.sent + c.failed < c.total)
    );
  }, [campaigns]);

  const [isDrainingQueue, setIsDrainingQueue] = useState(false);

  // Manual trigger to accelerate queue delivery
  const handleAccelerateQueue = async () => {
    setIsDrainingQueue(true);
    try {
      await fetch("/api/erp/mass-email/cron", { method: "POST" });
      await fetchCampaigns(true);
      if (selectedCampaignDetail?.id) {
        await handleInspectCampaign(selectedCampaignDetail.id, true);
      }
    } catch (e) {
      console.warn("Manual accelerate error:", e);
    } finally {
      setIsDrainingQueue(false);
    }
  };

  // Poll campaign progress until all queued emails are sent (Compose tab banner)
  useEffect(() => {
    if (!activeCampaignId) return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        // Kick cron processor endpoint to accelerate queue dispatch
        fetch("/api/erp/mass-email/cron", { method: "POST" }).catch(() => {});

        const res = await fetch(`/api/erp/mass-email?campaignId=${encodeURIComponent(activeCampaignId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data.campaign) return;

        setCampaignProgress(data.campaign);

        if (data.campaign.status === "completed" || (data.campaign.pending === 0 && data.campaign.total > 0)) {
          clearInterval(pollInterval);
          fetchCampaigns(true);
        }
      } catch (err) {
        console.warn("Campaign progress polling error:", err);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [activeCampaignId]);

  // Global auto-poll when on History tab OR whenever any campaign is queued/processing
  useEffect(() => {
    if (activeTab !== "history" && !hasActiveCampaignWork) return;

    let isMounted = true;
    const pollTimer = setInterval(async () => {
      try {
        // If there is active work in queue, ping cron endpoint to process next batch
        if (hasActiveCampaignWork) {
          fetch("/api/erp/mass-email/cron", { method: "POST" }).catch(() => {});
        }

        if (isMounted) {
          await fetchCampaigns(true);
          // If inspection modal is currently viewing an in-progress campaign, refresh its items live
          if (
            selectedCampaignDetail &&
            (selectedCampaignDetail.status === "queued" ||
              selectedCampaignDetail.status === "processing" ||
              (selectedCampaignDetail.sent + selectedCampaignDetail.failed < selectedCampaignDetail.total))
          ) {
            const detailRes = await fetch(`/api/erp/mass-email?campaignId=${encodeURIComponent(selectedCampaignDetail.id)}&details=true`);
            if (detailRes.ok) {
              const d = await detailRes.json();
              if (isMounted && d.campaign) {
                setSelectedCampaignDetail(d.campaign);
              }
            }
          }
        }
      } catch (err) {
        // silent background poll
      }
    }, hasActiveCampaignWork ? 3000 : 7000);

    return () => {
      isMounted = false;
      clearInterval(pollTimer);
    };
  }, [activeTab, hasActiveCampaignWork, selectedCampaignDetail?.id, selectedCampaignDetail?.status, selectedCampaignDetail?.sent, selectedCampaignDetail?.failed, selectedCampaignDetail?.total]);

  // Test email state
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testRecipientEmail, setTestRecipientEmail] = useState("ifeanyireed@gmail.com");

  // Compute active tenant login URL
  const defaultLoginUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      if (activeTenant?.domain) {
        return activeTenant.domain.startsWith("http")
          ? `${activeTenant.domain}/login`
          : `https://${activeTenant.domain}/login`;
      }
      if (activeTenant?.slug) {
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        if (isLocal) {
          return `${window.location.origin}/login?tenant=${encodeURIComponent(activeTenant.slug)}`;
        }
        return `https://${activeTenant.slug}.ofia.ng/login`;
      }
      return `${window.location.origin}/login`;
    }
    return activeTenant?.slug ? `https://${activeTenant.slug}.ofia.ng/login` : "https://app.ofia.ng/login";
  }, [activeTenant]);

  const [customLoginUrl, setCustomLoginUrl] = useState<string>("");

  useEffect(() => {
    if (defaultLoginUrl && !customLoginUrl) {
      setCustomLoginUrl(defaultLoginUrl);
    }
  }, [defaultLoginUrl]);

  const currentLoginUrl = customLoginUrl.trim() || defaultLoginUrl;

  const currentPortalUrl = useMemo(() => {
    const base = currentLoginUrl.replace(/\/login(\?.*)?$/i, "");
    const search = currentLoginUrl.includes("?") ? currentLoginUrl.substring(currentLoginUrl.indexOf("?")) : "";
    return `${base}/erp/employee${search}`;
  }, [currentLoginUrl]);

  // Fetch SMTP status
  useEffect(() => {
    const slug = activeTenant?.slug || "org-01";
    fetch(`/api/erp/smtp-settings?tenant=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.configured && data.settings) {
          setSmtpConfigured(true);
          setSmtpSenderEmail(data.settings.fromEmail || "");
          setSmtpProviderName(data.settings.provider || "SMTP");
        } else {
          setSmtpConfigured(false);
        }
      })
      .catch(() => setSmtpConfigured(false));
  }, [activeTenant?.slug]);

  // Fetch users for active tenant
  useEffect(() => {
    setIsLoadingUsers(true);
    const slug = activeTenant?.slug || "";
    const url = slug ? `/api/erp/users?tenant=${encodeURIComponent(slug)}` : "/api/erp/users";

    fetch(url, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        let rawList: any[] = [];
        if (Array.isArray(data) && data.length > 0) {
          rawList = data;
        } else if (INITIAL_USERS && INITIAL_USERS.length > 0) {
          rawList = INITIAL_USERS;
        }

        const mapped: StaffRecipient[] = rawList
          .map((u: any, idx: number) => ({
            id: String(u.id || u.ID || `USR-${idx + 1}`),
            name: u.name || u.Name || "Staff Member",
            email: u.email || u.Email || "",
            role: (u.role || u.Role || "employee").replace(/_/g, " "),
            department: u.department || u.Department || "General Directorate",
            designation: u.designation || u.Designation || "",
            avatar: resolveAvatarUrl(u.avatar || u.Avatar, u.name || u.email, idx),
          }))
          .filter((u) => u.email && u.email.includes("@"));

        setUsers(mapped);
        // By default, select all users with valid emails
        setSelectedIds(new Set(mapped.map((u) => u.id)));
      })
      .catch((err) => {
        console.warn("Failed to fetch users:", err);
      })
      .finally(() => {
        setIsLoadingUsers(false);
      });
  }, [activeTenant?.slug]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.department) set.add(u.department);
    });
    return Array.from(set).sort();
  }, [users]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesDept = selectedDepartment === "ALL" || u.department === selectedDepartment;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q);
      return matchesDept && matchesSearch;
    });
  }, [users, selectedDepartment, searchQuery]);

  // Filtered campaigns for history tab
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesStatus = historyStatusFilter === "ALL" || c.status?.toLowerCase() === historyStatusFilter.toLowerCase();
      const q = historySearch.toLowerCase();
      const matchesSearch = !q || c.subject?.toLowerCase().includes(q) || c.id?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [campaigns, historyStatusFilter, historySearch]);

  // Filtered recipients inside audit modal
  const filteredModalRecipients = useMemo(() => {
    if (!selectedCampaignDetail?.recipients) return [];
    return selectedCampaignDetail.recipients.filter((r: any) => {
      const matchesStatus = recipientStatusFilter === "ALL" || r.status?.toLowerCase() === recipientStatusFilter.toLowerCase();
      const q = recipientSearch.toLowerCase();
      const matchesSearch =
        !q ||
        r.recipientName?.toLowerCase().includes(q) ||
        r.recipientEmail?.toLowerCase().includes(q) ||
        r.recipientDepartment?.toLowerCase().includes(q) ||
        r.recipientRole?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [selectedCampaignDetail, recipientStatusFilter, recipientSearch]);

  // Selection handlers
  const handleToggleUser = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredUsers.forEach((u) => next.add(u.id));
      return next;
    });
  };

  const handleDeselectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredUsers.forEach((u) => next.delete(u.id));
      return next;
    });
  };

  const handleSelectAllTotal = () => {
    setSelectedIds(new Set(users.map((u) => u.id)));
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const isAllFilteredSelected =
    filteredUsers.length > 0 && filteredUsers.every((u) => selectedIds.has(u.id));

  // Selected recipient objects
  const selectedRecipients = useMemo(() => {
    return users.filter((u) => selectedIds.has(u.id));
  }, [users, selectedIds]);

  // Template change
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId === "custom") return;
    const found = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (found) {
      setSubject(found.subject);
      setBodyHtml(found.body);
    }
  };

  // Insert placeholder tag helper
  const handleInsertTag = (tag: string) => {
    setBodyHtml((prev) => prev + " " + tag);
  };

  // Send test email to self
  const handleSendTestToSelf = async () => {
    const adminEmail = user?.email || (users.length > 0 ? users[0].email : "");
    if (!adminEmail) {
      setTestResult({ success: false, message: "No recipient email found for test dispatch." });
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const slug = activeTenant?.slug || "org-01";
      const res = await fetch("/api/erp/mass-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          recipients: [
            {
              email: adminEmail,
              name: user?.name || "Admin User",
              role: "Administrator",
              department: "Executive Directorate",
            },
          ],
          subject: `[TEST PREVIEW] ${subject}`,
          messageHtml: bodyHtml,
          loginUrl: currentLoginUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch test email");
      }

      setTestResult({
        success: true,
        message: `Test email successfully sent to ${adminEmail}`,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Failed to send test email.",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Dispatch mass email
  const handleSendMassEmail = async () => {
    if (selectedRecipients.length === 0) {
      alert("Please select at least one recipient.");
      return;
    }

    if (!subject.trim()) {
      alert("Please enter an email subject line.");
      return;
    }

    if (!bodyHtml.trim()) {
      alert("Please write a message body.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to dispatch this email to ${selectedRecipients.length} selected recipient(s)? Delivery will be processed safely in the background via the queue.`
    );
    if (!confirmed) return;

    setIsSending(true);
    setSendResult(null);
    setCampaignProgress(null);

    try {
      const slug = activeTenant?.slug || "org-01";
      const res = await fetch("/api/erp/mass-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          recipients: selectedRecipients.map((r) => ({
            email: r.email,
            name: r.name,
            role: r.role,
            department: r.department,
          })),
          subject,
          messageHtml: bodyHtml,
          loginUrl: currentLoginUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Mass email dispatch failed");
      }

      if (data.campaignId) {
        setActiveCampaignId(data.campaignId);
        setCampaignProgress({
          id: data.campaignId,
          total: data.total || selectedRecipients.length,
          sent: data.sent || 0,
          failed: data.failed || 0,
          pending: data.pending ?? Math.max(0, (data.total || selectedRecipients.length) - ((data.sent || 0) + (data.failed || 0))),
          status: data.status || "processing",
          progressPercent: data.total > 0 ? Math.round((((data.sent || 0) + (data.failed || 0)) / data.total) * 100) : 0,
          errors: [],
        });
      }

      setSendResult({
        success: true,
        message: data.message || `Queued ${data.total || selectedRecipients.length} staff emails. Background delivery underway.`,
        total: data.total || selectedRecipients.length,
        sent: data.sent || 0,
        failed: data.failed || 0,
        errors: [],
      });
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err.message || "An error occurred while queueing mass emails.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const sampleRecipient = selectedRecipients[0] || {
    name: "Alexander Vance",
    email: "a.vance@ofia.ng",
    role: "Senior Operations Director",
    department: "Executive Directorate",
  };

  const previewSubject = subject
    .replace(/{{name}}/gi, sampleRecipient.name)
    .replace(/{{role}}/gi, sampleRecipient.role)
    .replace(/{{department}}/gi, sampleRecipient.department)
    .replace(/{{login_url}}/gi, currentLoginUrl)
    .replace(/{{loginUrl}}/gi, currentLoginUrl)
    .replace(/{{portal_url}}/gi, currentPortalUrl)
    .replace(/{{portalUrl}}/gi, currentPortalUrl);

  const previewHtml = bodyHtml
    .replace(/{{name}}/gi, sampleRecipient.name)
    .replace(/{{email}}/gi, sampleRecipient.email)
    .replace(/{{role}}/gi, sampleRecipient.role)
    .replace(/{{department}}/gi, sampleRecipient.department)
    .replace(/{{login_url}}/gi, currentLoginUrl)
    .replace(/{{loginUrl}}/gi, currentLoginUrl)
    .replace(/{{portal_url}}/gi, currentPortalUrl)
    .replace(/{{portalUrl}}/gi, currentPortalUrl);

  return (
    <ErpAdminShell
      title="Mass Email Messaging & Broadcasts"
      subtitle={`Send bulk emails, corporate memos, and announcements to staff members of '${activeTenant?.name || "Workspace"}'.`}
      action={
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/tenant/settings" className="shrink-0">
            <NexaButton
              variant="secondary"
              size="sm"
              leftIcon={<Settings className="w-3.5 h-3.5 shrink-0" />}
              className="rounded-full text-xs whitespace-nowrap"
            >
              Workspace SMTP Settings
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* TOP TABS NAVIGATION */}
        <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("compose")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "compose"
                  ? "bg-[#1A56DB] text-white shadow-xs"
                  : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)] border border-transparent hover:border-[var(--nexa-border)]"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Compose & Dispatch</span>
              {selectedRecipients.length > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    activeTab === "compose"
                      ? "bg-white/20 text-white"
                      : "bg-blue-500/15 text-[#1A56DB] dark:text-blue-300 border border-blue-500/20"
                  }`}
                >
                  {selectedRecipients.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("history");
                fetchCampaigns();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-[#1A56DB] text-white shadow-xs"
                  : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)] border border-transparent hover:border-[var(--nexa-border)]"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Broadcast History & Logs</span>
              {campaigns.length > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    activeTab === "history"
                      ? "bg-white/20 text-white"
                      : "bg-blue-500/15 text-[#1A56DB] dark:text-blue-300 border border-blue-500/20"
                  }`}
                >
                  {campaigns.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "history" && (
              <button
                type="button"
                onClick={() => fetchCampaigns()}
                disabled={isLoadingCampaigns}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-[#1A56DB] text-[var(--nexa-text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCampaigns ? "animate-spin" : ""}`} />
                <span>Refresh Logs</span>
              </button>
            )}
          </div>
        </div>

        {/* COMPOSE TAB VIEW */}
        {activeTab === "compose" && (
          <div className="space-y-6">
            {/* SMTP STATUS BANNER */}
        {smtpConfigured === false && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">SMTP Mail Server Not Configured</h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  Mass emails require an authenticated SMTP provider. Please configure your Gmail, SendGrid, Amazon SES, or custom SMTP server.
                </p>
              </div>
            </div>
            <Link href="/tenant/settings" className="shrink-0">
              <button className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer whitespace-nowrap">
                <span>Configure SMTP Settings</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </button>
            </Link>
          </div>
        )}

        {smtpConfigured === true && (
          <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 text-xs">
                <span className="font-bold text-[var(--nexa-text-primary)] mr-2">
                  SMTP Dispatch Engine Ready:
                </span>
                <span className="text-[var(--nexa-text-secondary)]">
                  Connected to <strong className="text-[var(--nexa-text-primary)]">{smtpProviderName.toUpperCase()}</strong>. Outgoing emails will be sent from{" "}
                  <code className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[#1A56DB] dark:text-blue-400 font-bold">
                    {smtpSenderEmail}
                  </code>
                </span>
              </div>
            </div>
            <Link
              href="/tenant/settings"
              className="text-xs font-bold text-[#1A56DB] hover:text-blue-700 dark:hover:text-blue-300 hover:underline shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors shadow-2xs"
            >
              <span>Change Settings</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <NexaCard variant="glass" padding="md" className="border border-[var(--nexa-border)] shadow-xs rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider">
                Total Staff
              </span>
              <Users className="w-4 h-4 text-[#1A56DB]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] mt-1.5">
              {users.length}
            </div>
            <div className="text-[10px] text-[var(--nexa-text-muted)] mt-0.5">
              Available in directory
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="border border-[var(--nexa-border)] shadow-xs rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider">
                Selected Recipients
              </span>
              <UserCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
              {selectedRecipients.length}
            </div>
            <div className="text-[10px] text-[var(--nexa-text-muted)] mt-0.5">
              Will receive this email
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="border border-[var(--nexa-border)] shadow-xs rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider">
                Departments
              </span>
              <Building2 className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1.5">
              {departments.length}
            </div>
            <div className="text-[10px] text-[var(--nexa-text-muted)] mt-0.5">
              Target operational units
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="border border-[var(--nexa-border)] shadow-xs rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider">
                Dispatcher Engine
              </span>
              <Mail className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-lg font-bold text-[var(--nexa-text-primary)] mt-2 truncate">
              {smtpConfigured ? smtpProviderName.toUpperCase() : "Needs Setup"}
            </div>
            <div className="text-[10px] text-[var(--nexa-text-muted)] mt-0.5">
              {smtpConfigured ? "Verified & active" : "Configure in Settings"}
            </div>
          </NexaCard>
        </div>

        {/* MAIN SPLIT WORKSPACE: RECIPIENTS ON LEFT, COMPOSER ON RIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: RECIPIENT SELECTION (5 COLS) */}
          <div className="lg:col-span-5 space-y-4">
            <NexaCard variant="glass" padding="md" className="border border-[var(--nexa-border)] shadow-xs rounded-3xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1A56DB]" />
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                    Select Recipients ({selectedRecipients.length}/{users.length})
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSelectAllTotal}
                    className="text-[11px] font-bold text-[#1A56DB] hover:underline cursor-pointer"
                  >
                    All ({users.length})
                  </button>
                  <span className="text-[var(--nexa-text-muted)]">•</span>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* SEARCH & DEPARTMENT FILTER */}
              <div className="space-y-2">
                <div className="flex items-center bg-[var(--nexa-bg-base)] px-3 py-2 rounded-xl border border-[var(--nexa-border)] gap-2">
                  <Search className="w-3.5 h-3.5 text-[var(--nexa-text-muted)] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, role..."
                    className="bg-transparent text-xs outline-none w-full text-[var(--nexa-text-primary)]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full appearance-none pl-3 pr-8 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none text-[var(--nexa-text-primary)] font-medium cursor-pointer"
                    >
                      <option value="ALL">All Departments ({departments.length})</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--nexa-text-muted)]" />
                  </div>

                  <button
                    type="button"
                    onClick={isAllFilteredSelected ? handleDeselectAllFiltered : handleSelectAllFiltered}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-[#1A56DB] text-[var(--nexa-text-primary)] shrink-0 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    {isAllFilteredSelected ? (
                      <>
                        <Square className="w-3.5 h-3.5 text-red-500" />
                        <span>Deselect</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-3.5 h-3.5 text-[#1A56DB]" />
                        <span>Select Filtered</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* USER LIST (SCROLLABLE) */}
              <div className="border border-[var(--nexa-border)] rounded-2xl overflow-hidden divide-y divide-[var(--nexa-border)] max-h-[480px] overflow-y-auto bg-[var(--nexa-bg-base)]/50">
                {isLoadingUsers ? (
                  <div className="p-8 text-center text-xs text-[var(--nexa-text-muted)] flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#1A56DB]" />
                    <span>Loading staff directory...</span>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--nexa-text-muted)]">
                    No staff found matching the filter criteria.
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelected = selectedIds.has(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => handleToggleUser(u.id)}
                        className={`p-3 flex items-center justify-between gap-3 hover:bg-blue-500/5 transition-colors cursor-pointer ${
                          isSelected ? "bg-blue-500/10 dark:bg-blue-900/20" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by row click
                            className="w-4 h-4 rounded text-[#1A56DB] cursor-pointer accent-[#1A56DB]"
                          />
                          <NexaAvatar
                            src={u.avatar}
                            name={u.name}
                            size="sm"
                            className="shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-[var(--nexa-text-primary)] truncate">
                              {u.name}
                            </div>
                            <div className="text-[11px] text-[var(--nexa-text-muted)] truncate font-mono">
                              {u.email}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold capitalize inline-block ${getRoleTagClasses(u.role)}`}
                          >
                            {u.role}
                          </span>
                          <div className="text-[9px] text-[var(--nexa-text-muted)] truncate max-w-[110px] mt-0.5">
                            {u.department}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </NexaCard>
          </div>

          {/* RIGHT COLUMN: EMAIL COMPOSER & PREVIEW (7 COLS) */}
          <div className="lg:col-span-7 space-y-4">
            <NexaCard variant="glass" padding="md" className="border border-[var(--nexa-border)] shadow-xs rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#1A56DB]" />
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                    Email Composer
                  </h3>
                </div>

                {/* EDIT / PREVIEW TOGGLE */}
                <div className="flex items-center bg-[var(--nexa-bg-base)] p-1 rounded-xl border border-[var(--nexa-border)]">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      !previewMode
                        ? "bg-[#1A56DB] text-white shadow-xs"
                        : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      previewMode
                        ? "bg-[#1A56DB] text-white shadow-xs"
                        : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Preview</span>
                  </button>
                </div>
              </div>

              {/* QUICK TEMPLATES & PLACEHOLDER TAGS */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Load Email Template
                  </label>
                  <div className="relative">
                    <select
                      value={selectedTemplate}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none text-[var(--nexa-text-primary)] font-semibold cursor-pointer"
                    >
                      <option value="custom">-- Custom Message --</option>
                      {EMAIL_TEMPLATES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--nexa-text-muted)]" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-[var(--nexa-text-muted)] mr-1">
                    Insert Personalization:
                  </span>
                  {[
                    { label: "Full Name", tag: "{{name}}" },
                    { label: "Email", tag: "{{email}}" },
                    { label: "Role", tag: "{{role}}" },
                    { label: "Department", tag: "{{department}}" },
                    { label: "Login Page URL", tag: "{{login_url}}" },
                    { label: "Employee Portal", tag: "{{portal_url}}" },
                  ].map((p) => (
                    <button
                      key={p.tag}
                      type="button"
                      onClick={() => handleInsertTag(p.tag)}
                      className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-[var(--nexa-bg-base)] hover:bg-[#1A56DB]/10 border border-[var(--nexa-border)] text-[#1A56DB] cursor-pointer transition-colors"
                      title={`Insert ${p.tag}`}
                    >
                      + {p.tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* WORKSPACE LOGIN URL DESTINATION */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-[#1A56DB] shrink-0">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                      <span>Workspace Login URL</span>
                      <span className="text-[10px] font-normal text-[var(--nexa-text-muted)]">(Injected into <code className="font-mono text-[#1A56DB]">&#123;&#123;login_url&#125;&#125;</code>)</span>
                    </div>
                    <p className="text-[10px] text-[var(--nexa-text-muted)]">Direct login page URL sent to staff in action buttons & navigation guide</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-1 max-w-sm sm:max-w-md">
                  <input
                    type="text"
                    value={customLoginUrl}
                    onChange={(e) => setCustomLoginUrl(e.target.value)}
                    placeholder={defaultLoginUrl}
                    className="w-full px-2.5 py-1 text-xs font-mono rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-medium"
                  />
                  {customLoginUrl !== defaultLoginUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomLoginUrl(defaultLoginUrl)}
                      title="Reset to default computed login URL"
                      className="px-2 py-1 text-[10px] font-bold rounded-md border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:bg-[#1A56DB] hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* SUBJECT LINE */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Subject Line <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Important Corporate Update: {{name}}"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
                />
              </div>

              {/* MESSAGE BODY (EDIT OR PREVIEW) */}
              {!previewMode ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                      Message Body (HTML or Plain Text) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-[var(--nexa-text-muted)]">
                      Supports HTML tags: &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, etc.
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                    placeholder="Write your email announcement here..."
                    className="w-full p-3.5 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] leading-relaxed resize-y"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
                    <span>Previewing recipient: <strong>{sampleRecipient.name}</strong> ({sampleRecipient.email})</span>
                    <NexaBadge variant="secondary" size="sm">Mock Preview</NexaBadge>
                  </div>
                  <div className="border border-[var(--nexa-border)] rounded-2xl p-5 bg-white text-slate-800 space-y-3 min-h-[260px] shadow-inner">
                    <div className="border-b border-slate-200 pb-2">
                      <div className="text-xs text-slate-500">
                        <strong>From:</strong> {smtpSenderEmail || "admin@ofia.ng"}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        <strong>To:</strong> {sampleRecipient.name} &lt;{sampleRecipient.email}&gt;
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-2">
                        {previewSubject}
                      </div>
                    </div>
                    <div
                      className="text-xs leading-relaxed text-slate-700 prose prose-sm max-w-none pt-2"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  </div>
                </div>
              )}

              {/* ACTION BAR: TEST EMAIL & DISPATCH */}
              <div className="pt-3 border-t border-[var(--nexa-border)] space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSendTestToSelf}
                    disabled={isSendingTest || isSending}
                    className="px-4 py-2 text-xs font-bold rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-[#1A56DB] text-[var(--nexa-text-primary)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                  >
                    {isSendingTest ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Sending Test...
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5 text-[#1A56DB]" />
                        Send Test to Me
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSendMassEmail}
                    disabled={isSending || isSendingTest || selectedRecipients.length === 0}
                    className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#1A56DB] hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending to {selectedRecipients.length} Recipients...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send to {selectedRecipients.length} Selected Recipients</span>
                      </>
                    )}
                  </button>
                </div>

                {/* TEST DISPATCH RESULT */}
                {testResult && (
                  <div
                    className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border shadow-xs ${
                      testResult.success
                        ? "bg-emerald-100 text-emerald-950 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-500 font-semibold"
                        : "bg-rose-100 text-rose-950 border-rose-400 dark:bg-rose-950 dark:text-rose-100 dark:border-rose-500 font-semibold"
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-800 dark:text-emerald-300 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-800 dark:text-rose-300 mt-0.5" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                {/* MASS DISPATCH QUEUE PROGRESS & RESULT */}
                {(sendResult || campaignProgress) && (
                  <div className="p-4 rounded-2xl text-xs space-y-3 border shadow-xs bg-[var(--nexa-bg-base)] border-[var(--nexa-border)]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold text-sm text-[var(--nexa-text-primary)]">
                        {campaignProgress?.status === "completed" ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          </div>
                        )}
                        <span>
                          {campaignProgress?.status === "completed"
                            ? "All Emails Delivered Successfully!"
                            : "Background Queue Processing Underway"}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          campaignProgress?.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                            : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 animate-pulse"
                        }`}
                      >
                        {campaignProgress?.status || "queued"}
                      </span>
                    </div>

                    {/* PROGRESS BAR */}
                    {campaignProgress && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center text-[11px] font-bold text-[var(--nexa-text-secondary)]">
                          <span>
                            Progress: {campaignProgress.sent} of {campaignProgress.total} delivered
                          </span>
                          <span>{campaignProgress.progressPercent}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-blue-950/10 dark:bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              campaignProgress.status === "completed"
                                ? "bg-emerald-500"
                                : "bg-gradient-to-r from-blue-600 to-indigo-600"
                            }`}
                            style={{ width: `${Math.max(4, campaignProgress.progressPercent)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* METRICS ROW */}
                    <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                      <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <div className="text-[10px] text-blue-700 dark:text-blue-300 font-bold uppercase">Total</div>
                        <div className="text-sm font-black text-blue-600 dark:text-blue-400">
                          {campaignProgress?.total ?? sendResult?.total ?? 0}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">Sent</div>
                        <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          {campaignProgress?.sent ?? sendResult?.sent ?? 0}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">In Queue</div>
                        <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                          {campaignProgress?.pending ?? 0}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <div className="text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase">Failed</div>
                        <div className="text-sm font-black text-rose-600 dark:text-rose-400">
                          {campaignProgress?.failed ?? sendResult?.failed ?? 0}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-[var(--nexa-text-muted)] italic pt-1">
                      ℹ️ Safe for production: Email delivery runs as an isolated background queue worker. You may safely close this tab or navigate away.
                    </p>

                    {/* ERRORS DISPLAY */}
                    {campaignProgress?.errors && campaignProgress.errors.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-900/50 space-y-1">
                        <div className="font-bold text-[11px] text-red-600 dark:text-red-400">
                          Failed Recipients ({campaignProgress.errors.length}):
                        </div>
                        {campaignProgress.errors.slice(0, 5).map((e, idx) => (
                          <div key={idx} className="text-[10px] font-mono text-red-600 dark:text-red-300">
                            {e.email}: {e.error}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </NexaCard>
          </div>
        </div>
          </div>
        )}

        {/* BROADCAST HISTORY & LOGS TAB VIEW */}
        {activeTab === "history" && (
          <div className="space-y-6">
            {/* SEARCH & FILTERS BAR */}
            <NexaCard variant="glass" padding="md" className="border border-[var(--nexa-border)] shadow-xs rounded-2xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center bg-[var(--nexa-bg-base)] px-3 py-2 rounded-xl border border-[var(--nexa-border)] gap-2 flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 text-[var(--nexa-text-muted)] shrink-0" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search broadcasts by subject or ID..."
                    className="bg-transparent text-xs outline-none w-full text-[var(--nexa-text-primary)]"
                  />
                  {historySearch && (
                    <button
                      type="button"
                      onClick={() => setHistorySearch("")}
                      className="text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {["ALL", "completed", "processing", "failed"].map((st) => {
                    const isSelected = historyStatusFilter.toLowerCase() === st.toLowerCase();
                    const count =
                      st === "ALL"
                        ? campaigns.length
                        : campaigns.filter((c) => c.status?.toLowerCase() === st.toLowerCase()).length;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setHistoryStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-[#1A56DB] text-white shadow-xs"
                            : "bg-[var(--nexa-bg-surface)] hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-[#1A56DB] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)] shadow-2xs"
                        }`}
                      >
                        <span className="capitalize">{st.toLowerCase()}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-blue-500/15 text-[#1A56DB] dark:text-blue-300 border border-blue-500/20"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}

                  {hasActiveCampaignWork && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#1A56DB] text-xs font-semibold animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span>Delivering...</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAccelerateQueue}
                    disabled={isDrainingQueue}
                    title="Dispatch pending emails from queue immediately"
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-[var(--nexa-bg-surface)] hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-[#1A56DB] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)] shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDrainingQueue ? "animate-spin text-[#1A56DB]" : ""}`} />
                    <span>{isDrainingQueue ? "Delivering..." : "Process Queue"}</span>
                  </button>
                </div>
              </div>
            </NexaCard>

            {/* CAMPAIGN LIST */}
            {isLoadingCampaigns && campaigns.length === 0 ? (
              <div className="p-12 text-center text-xs text-[var(--nexa-text-muted)] flex flex-col items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#1A56DB]" />
                <span className="font-bold">Loading broadcast history...</span>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] shadow-xs rounded-3xl text-center py-14 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#1A56DB] flex items-center justify-center mx-auto">
                  <History className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[var(--nexa-text-primary)]">
                    {campaigns.length === 0 ? "No Broadcasts Dispatched Yet" : "No Matching Campaigns Found"}
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)] max-w-sm mx-auto">
                    {campaigns.length === 0
                      ? "Compose your first corporate announcement, appraisal directive, or memo to see it tracked here."
                      : "Try clearing your search query or switching your status filter."}
                  </p>
                </div>
                <NexaButton
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab("compose")}
                  className="rounded-xl mx-auto"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  <span>Compose New Broadcast</span>
                </NexaButton>
              </NexaCard>
            ) : (
              <div className="space-y-4">
                {filteredCampaigns.map((camp) => {
                  const isCompleted = camp.status === "completed";
                  const isProcessing = camp.status === "processing" || camp.status === "queued";
                  const isFailed = camp.status === "failed";

                  const formattedDate = camp.createdAt
                    ? new Date(camp.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recently";

                  return (
                    <NexaCard
                      key={camp.id}
                      variant="glass"
                      padding="md"
                      className="border border-[var(--nexa-border)] shadow-xs rounded-3xl space-y-4 hover:border-blue-400/50 transition-colors"
                    >
                      {/* HEADER */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--nexa-border)] pb-3.5">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-[var(--nexa-text-primary)] truncate">
                              {camp.subject}
                            </h4>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                                isCompleted
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                  : isProcessing
                                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 animate-pulse"
                                  : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                              }`}
                            >
                              {camp.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-[var(--nexa-text-muted)]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formattedDate}</span>
                            </span>
                            <span>•</span>
                            <span className="font-mono text-[10px]">ID: {camp.id}</span>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleInspectCampaign(camp.id)}
                            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#1A56DB] hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Delivery</span>
                          </button>

                          {camp.failed > 0 && (
                            <button
                              type="button"
                              onClick={() => handleRetryFailed(camp.id)}
                              disabled={isRetrying}
                              className="px-3 py-2 text-xs font-bold rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                              title="Retry delivery to failed recipients"
                            >
                              <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
                              <span>Retry ({camp.failed})</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleReuseCampaign(camp)}
                            className="p-2 text-xs font-bold rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-[#1A56DB] text-[var(--nexa-text-primary)] transition-colors cursor-pointer shadow-2xs"
                            title="Reuse this email copy in composer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* PROGRESS BAR & STATS */}
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[11px] font-bold text-[var(--nexa-text-secondary)]">
                            <span>
                              Delivery Progress: {camp.sent} of {camp.total} delivered
                            </span>
                            <span>{camp.progressPercent}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-blue-950/10 dark:bg-white/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCompleted
                                  ? "bg-emerald-500"
                                  : "bg-gradient-to-r from-blue-600 to-indigo-600"
                              }`}
                              style={{ width: `${Math.max(4, camp.progressPercent)}%` }}
                            />
                          </div>
                        </div>

                        {/* METRICS ROW */}
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <div className="text-[10px] text-blue-700 dark:text-blue-300 font-bold uppercase">Total</div>
                            <div className="text-sm font-black text-blue-600 dark:text-blue-400">{camp.total}</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">Sent</div>
                            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">{camp.sent}</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">In Queue</div>
                            <div className="text-sm font-black text-amber-600 dark:text-amber-400">{camp.pending}</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                            <div className="text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase">Failed</div>
                            <div className="text-sm font-black text-rose-600 dark:text-rose-400">{camp.failed}</div>
                          </div>
                        </div>
                      </div>
                    </NexaCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RECIPIENT DELIVERY AUDIT MODAL */}
        {inspectModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] shadow-2xl rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* MODAL HEADER */}
              <div className="p-5 border-b border-[var(--nexa-border)] flex items-start justify-between gap-4 bg-[var(--nexa-bg-base)]">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-500/15 text-[#1A56DB] dark:text-blue-300 border border-blue-500/25">
                      Audit Dossier
                    </span>
                    <span className="font-mono text-[10px] text-[var(--nexa-text-muted)]">
                      {selectedCampaignDetail?.id}
                    </span>
                  </div>
                  <h3 className="font-black text-base text-[var(--nexa-text-primary)] truncate">
                    {selectedCampaignDetail?.subject || "Campaign Details"}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectModalOpen(false)}
                  className="w-8 h-8 rounded-full border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:bg-blue-500/10 hover:text-[#1A56DB] dark:hover:bg-white/10 flex items-center justify-center text-[var(--nexa-text-secondary)] transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* MODAL METRICS STRIP */}
              <div className="p-4 border-b border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs font-semibold flex-wrap">
                  <div className="px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
                    <span className="font-normal opacity-75">Total: </span>
                    <strong className="font-bold">{selectedCampaignDetail?.total ?? 0}</strong>
                  </div>
                  <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    <span className="font-normal opacity-75">Delivered: </span>
                    <strong className="font-bold">{selectedCampaignDetail?.sent ?? 0}</strong>
                  </div>
                  <div className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
                    <span className="font-normal opacity-75">In Queue: </span>
                    <strong className="font-bold">{selectedCampaignDetail?.pending ?? 0}</strong>
                  </div>
                  <div className="px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                    <span className="font-normal opacity-75">Failed: </span>
                    <strong className="font-bold">{selectedCampaignDetail?.failed ?? 0}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedCampaignDetail && selectedCampaignDetail.failed > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRetryFailed(selectedCampaignDetail.id)}
                      disabled={isRetrying}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
                      <span>Retry All Failed ({selectedCampaignDetail.failed})</span>
                    </button>
                  )}

                  {selectedCampaignDetail && (
                    <button
                      type="button"
                      onClick={() => handleReuseCampaign(selectedCampaignDetail)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-[#1A56DB] text-[var(--nexa-text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Reuse Copy</span>
                    </button>
                  )}
                </div>
              </div>

              {/* MODAL TABS */}
              <div className="px-5 border-b border-[var(--nexa-border)] flex items-center gap-4 bg-[var(--nexa-bg-base)]">
                <button
                  type="button"
                  onClick={() => setDetailTab("recipients")}
                  className={`py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    detailTab === "recipients"
                      ? "border-[#1A56DB] text-[#1A56DB]"
                      : "border-transparent text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Recipients Audit Log ({selectedCampaignDetail?.recipients?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDetailTab("preview")}
                  className={`py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    detailTab === "preview"
                      ? "border-[#1A56DB] text-[#1A56DB]"
                      : "border-transparent text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Email Copy Preview</span>
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="flex-1 overflow-y-auto p-5">
                {isLoadingDetail ? (
                  <div className="p-12 text-center text-xs text-[var(--nexa-text-muted)] flex flex-col items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#1A56DB]" />
                    <span>Loading audit records...</span>
                  </div>
                ) : detailTab === "recipients" ? (
                  <div className="space-y-4">
                    {/* RECIPIENT SEARCH & STATUS FILTER */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex items-center bg-[var(--nexa-bg-base)] px-3 py-1.5 rounded-xl border border-[var(--nexa-border)] gap-2 flex-1 max-w-sm">
                        <Search className="w-3.5 h-3.5 text-[var(--nexa-text-muted)] shrink-0" />
                        <input
                          type="text"
                          value={recipientSearch}
                          onChange={(e) => setRecipientSearch(e.target.value)}
                          placeholder="Filter recipients by name, email, department..."
                          className="bg-transparent text-xs outline-none w-full text-[var(--nexa-text-primary)]"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        {["ALL", "sent", "failed", "pending"].map((st) => {
                          const isSel = recipientStatusFilter.toLowerCase() === st.toLowerCase();
                          const count =
                            st === "ALL"
                              ? selectedCampaignDetail?.recipients?.length || 0
                              : selectedCampaignDetail?.recipients?.filter(
                                  (r: any) => r.status?.toLowerCase() === st.toLowerCase()
                                ).length || 0;
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setRecipientStatusFilter(st)}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSel
                                  ? "bg-[#1A56DB] text-white shadow-xs"
                                  : "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)] hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-[#1A56DB] shadow-2xs"
                              }`}
                            >
                              <span className="capitalize">{st.toLowerCase()}</span>
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                                  isSel
                                    ? "bg-white/20 text-white"
                                    : "bg-blue-500/15 text-[#1A56DB] dark:text-blue-300 border border-blue-500/20"
                                }`}
                              >
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* RECIPIENTS AUDIT TABLE */}
                    <div className="border border-[var(--nexa-border)] rounded-2xl overflow-hidden divide-y divide-[var(--nexa-border)] bg-[var(--nexa-bg-base)]/40">
                      {filteredModalRecipients.length === 0 ? (
                        <div className="p-8 text-center text-xs text-[var(--nexa-text-muted)]">
                          No recipients match your criteria.
                        </div>
                      ) : (
                        filteredModalRecipients.map((rec: any, idx: number) => {
                          const isDelivered = rec.status === "sent";
                          const isFailedRec = rec.status === "failed";
                          const isPendingRec = rec.status === "pending" || rec.status === "processing";

                          const sentDateStr = rec.sentAt
                            ? new Date(rec.sentAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : null;

                          return (
                            <div key={rec.id || idx} className="p-3.5 space-y-2 hover:bg-[var(--nexa-bg-surface)] transition-colors">
                              <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs shrink-0">
                                    {(rec.recipientName || rec.recipientEmail || "U").charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-xs text-[var(--nexa-text-primary)] truncate">
                                      {rec.recipientName || "Staff Member"}
                                    </div>
                                    <div className="text-[11px] text-[var(--nexa-text-muted)] truncate">
                                      {rec.recipientEmail} {rec.recipientDepartment && `• ${rec.recipientDepartment}`}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {sentDateStr && (
                                    <span className="text-[10px] text-[var(--nexa-text-muted)] font-mono">
                                      {sentDateStr}
                                    </span>
                                  )}
                                  <span
                                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                      isDelivered
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                        : isFailedRec
                                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                                    }`}
                                  >
                                    {rec.status}
                                  </span>
                                </div>
                              </div>

                              {rec.errorMessage && (
                                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-700 dark:text-rose-300 font-mono flex items-start gap-2">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  <span>{rec.errorMessage}</span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  /* EMAIL COPY PREVIEW */
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1">
                      <div className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider">
                        Subject Line
                      </div>
                      <div className="text-sm font-bold text-[var(--nexa-text-primary)]">
                        {selectedCampaignDetail?.subject}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] p-6 overflow-x-auto shadow-xs">
                      <div
                        className="prose prose-sm max-w-none text-slate-800 dark:text-slate-100"
                        dangerouslySetInnerHTML={{ __html: selectedCampaignDetail?.messageHtml || "" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ErpAdminShell>
  );
}

export default function MassMessagingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[var(--nexa-text-muted)]">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1A56DB]" />
          Loading Mass Messaging...
        </div>
      }
    >
      <MassMessagingContent />
    </Suspense>
  );
}
