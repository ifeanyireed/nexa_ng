"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Target,
  Search,
  Plus,
  Phone,
  PhoneCall,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  User,
  Users,
  TrendingUp,
  MapPin,
  ExternalLink,
  Sparkles,
  FileText,
  Filter,
  RefreshCw,
  Sliders,
  Flame,
  Check,
  X,
  ChevronDown,
  Trash2,
  Edit3,
  Globe,
  Radio,
  ArrowRight,
  Lock,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";
import { CrmLead, CrmActivity } from "@/lib/crm-service";
import { crmFetch } from "@/lib/crm-client";
import { useAuth } from "@/components/nexa/AuthContext";
import { useTenantProvisioning } from "@/lib/access-control";
import { cn } from "@/lib/utils";

const LEAD_STATUSES: { key: CrmLead["status"]; label: string; color: string }[] = [
  { key: "IDENTIFIED", label: "Identified", color: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
  { key: "ENRICHED", label: "Enriched", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { key: "CONTACTED", label: "Contacted", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { key: "QUALIFIED", label: "Qualified", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { key: "MEETING_BOOKED", label: "Meeting / Demo Booked", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { key: "CONVERTED", label: "Deal Won / Converted", color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40" },
  { key: "ARCHIVED", label: "Archived", color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" },
];

function SalesCloserPortalContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isModuleProvisioned, isLoading: isProvisioningLoading } = useTenantProvisioning();

  const tabParam = searchParams.get("tab") || "leads";
  const [activeTab, setActiveTab] = useState<"leads" | "activities">(
    tabParam === "activities" ? "activities" : "leads"
  );

  useEffect(() => {
    if (!isProvisioningLoading && !isModuleProvisioned("crm")) {
      const fallback = user?.role === "admin" ? "/erp/admin" : "/erp/employee";
      router.replace(fallback);
    }
  }, [isProvisioningLoading, isModuleProvisioned, user?.role, router]);

  useEffect(() => {
    if (tabParam === "activities" || tabParam === "leads") {
      setActiveTab(tabParam as "leads" | "activities");
    }
  }, [tabParam]);

  // Current Closer Identity from Session / Auth
  const currentCloserName = useMemo(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("erp_current_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.name) return parsed.name;
        } catch {}
      }
      const nexaName = localStorage.getItem("nexa_user_name");
      if (nexaName) return nexaName;
    }
    return user?.name || "Abosede Ajayi";
  }, [user]);

  // Data states
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Closer filter: "my" = assigned to currentCloserName, "all" = show all closers, or specific closer name
  const [closerFilter, setCloserFilter] = useState<string>("my");

  // Leads filters
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("ALL");

  // Activities filters
  const [activitySearch, setActivitySearch] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState("ALL");
  const [activityStatusFilter, setActivityStatusFilter] = useState("ALL");

  // Log Activity Modal state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [actTitle, setActTitle] = useState("");
  const [actCompany, setActCompany] = useState("");
  const [actType, setActType] = useState<CrmActivity["type"]>("CALL");
  const [actDateTime, setActDateTime] = useState("Today, 03:00 PM");
  const [actRep, setActRep] = useState(currentCloserName);
  const [actNotes, setActNotes] = useState("");
  const [actLeadId, setActLeadId] = useState<string | undefined>(undefined);
  const [isSavingActivity, setIsSavingActivity] = useState(false);

  // Add Lead Modal state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newContactTitle, setNewContactTitle] = useState("Managing Director");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newIndustry, setNewIndustry] = useState("Corporate Commercial");
  const [newLocation, setNewLocation] = useState("Lagos, Nigeria");
  const [newWebsite, setNewWebsite] = useState("");
  const [newStatus, setNewStatus] = useState<CrmLead["status"]>("QUALIFIED");
  const [newNotes, setNewNotes] = useState("");
  const [newLeadCloser, setNewLeadCloser] = useState<string>("");
  const [staffClosers, setStaffClosers] = useState<{ name: string; email: string }[]>([]);
  const [isSavingLead, setIsSavingLead] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [leadsRes, actsRes, usersRes] = await Promise.all([
        crmFetch("/api/erp/crm/leads").then((r) => r.json()).catch(() => ({ leads: [] })),
        crmFetch("/api/erp/crm/activities").then((r) => r.json()).catch(() => ({ activities: [] })),
        crmFetch("/api/erp/users").then((r) => (r.ok ? r.json() : [])).catch(() => []),
      ]);

      if (Array.isArray(leadsRes?.leads)) {
        setLeads(leadsRes.leads);
      } else {
        setLeads([]);
      }

      if (Array.isArray(actsRes?.activities)) {
        setActivities(actsRes.activities);
      } else {
        setActivities([]);
      }

      if (Array.isArray(usersRes)) {
        const closers = usersRes.filter((u: any) => {
          const role = (u.role || u.Role || "").toLowerCase();
          const desig = (u.designation || u.Designation || "").toLowerCase();
          let assignedPages: string[] = [];
          if (Array.isArray(u.assignedPages)) {
            assignedPages = u.assignedPages;
          } else if (typeof u.assignedPages === "string") {
            try {
              assignedPages = JSON.parse(u.assignedPages || "[]");
            } catch {}
          }
          return (
            assignedPages.includes("sales_closer") ||
            role === "sales_closer" ||
            desig.includes("closer") ||
            desig.includes("sales")
          );
        });
        setStaffClosers(
          closers.map((u: any) => ({
            name: u.name || u.email,
            email: u.email || "",
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load CRM closer data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Distinct closer rep names found in data
  const availableClosers = useMemo(() => {
    const set = new Set<string>();
    if (currentCloserName) set.add(currentCloserName);
    staffClosers.forEach((c) => {
      if (c.name && c.name.trim()) set.add(c.name.trim());
    });
    leads.forEach((l) => {
      if (l.assignedRep && l.assignedRep.trim()) set.add(l.assignedRep.trim());
    });
    activities.forEach((a) => {
      if (a.rep && a.rep.trim()) set.add(a.rep.trim());
    });
    return Array.from(set);
  }, [leads, activities, currentCloserName, staffClosers]);

  // Closer matching helper (case-insensitive substring/partial match)
  const isMatchCloser = (repName?: string) => {
    if (closerFilter === "all") return true;
    const target = closerFilter === "my" ? currentCloserName : closerFilter;
    if (!target) return true;
    if (!repName) return false;
    const rLower = repName.toLowerCase();
    const tLower = target.toLowerCase();
    return rLower.includes(tLower) || tLower.includes(rLower);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const rep = l.assignedRep || (l as any).owner || "";
      const matchesCloser = isMatchCloser(rep);
      const cName = (l.companyName || (l as any).company || "").toLowerCase();
      const personName = (l.contactName || (l as any).name || "").toLowerCase();
      const email = (l.contactEmail || (l as any).email || "").toLowerCase();
      const loc = (l.location || "").toLowerCase();
      const q = leadSearch.toLowerCase();
      const matchesSearch = cName.includes(q) || personName.includes(q) || email.includes(q) || loc.includes(q);
      const matchesStatus = leadStatusFilter === "ALL" || l.status === leadStatusFilter;
      return matchesCloser && matchesSearch && matchesStatus;
    });
  }, [leads, closerFilter, leadSearch, leadStatusFilter, currentCloserName]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchesCloser = isMatchCloser(a.rep);
      const matchesSearch =
        a.title.toLowerCase().includes(activitySearch.toLowerCase()) ||
        a.company.toLowerCase().includes(activitySearch.toLowerCase()) ||
        (a.notes && a.notes.toLowerCase().includes(activitySearch.toLowerCase()));
      const matchesType = activityTypeFilter === "ALL" || a.type === activityTypeFilter;
      const matchesStatus = activityStatusFilter === "ALL" || a.status === activityStatusFilter;
      return matchesCloser && matchesSearch && matchesType && matchesStatus;
    });
  }, [activities, closerFilter, activitySearch, activityTypeFilter, activityStatusFilter, currentCloserName]);

  // Quick stats
  const leadsStats = useMemo(() => {
    const total = filteredLeads.length;
    const highFit = filteredLeads.filter((l) => l.icpFitScore >= 90).length;
    const meetings = filteredLeads.filter((l) => l.status === "MEETING_BOOKED").length;
    const converted = filteredLeads.filter((l) => l.status === "CONVERTED").length;
    return { total, highFit, meetings, converted };
  }, [filteredLeads]);

  const activityStats = useMemo(() => {
    const total = filteredActivities.length;
    const upcoming = filteredActivities.filter((a) => a.status === "UPCOMING").length;
    const completed = filteredActivities.filter((a) => a.status === "COMPLETED").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 100;
    return { total, upcoming, completed, rate };
  }, [filteredActivities]);

  // Quick status update for Lead
  const handleUpdateLeadStatus = async (leadId: string, status: CrmLead["status"]) => {
    try {
      const res = await crmFetch("/api/erp/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      showToast(`Lead status updated to ${status.replace("_", " ")}`);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
    } catch {
      showToast("Error updating lead status");
    }
  };

  // Quick complete activity
  const handleToggleActivityStatus = async (act: CrmActivity) => {
    const newStatus: CrmActivity["status"] = act.status === "COMPLETED" ? "UPCOMING" : "COMPLETED";
    try {
      const res = await crmFetch("/api/erp/crm/activities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: act.id, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update activity");
      showToast(`Activity marked as ${newStatus}`);
      setActivities((prev) => prev.map((a) => (a.id === act.id ? { ...a, status: newStatus } : a)));
    } catch {
      showToast("Error updating activity");
    }
  };

  // Open Log Activity modal prefilled with lead
  const handleOpenLogActivityForLead = (lead: CrmLead) => {
    setActLeadId(lead.id);
    setActCompany(lead.companyName);
    setActTitle(`Follow-up call with ${lead.contactName}`);
    setActType("CALL");
    setActDateTime("Today, 03:00 PM");
    setActRep(currentCloserName);
    setActNotes(`Discuss proposal terms for ${lead.companyName}.`);
    setIsActivityModalOpen(true);
  };

  // Save new activity
  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim() || !actCompany.trim()) return;

    try {
      setIsSavingActivity(true);
      const payload: Partial<CrmActivity> = {
        title: actTitle.trim(),
        company: actCompany.trim(),
        type: actType,
        dateTime: actDateTime.trim() || "Scheduled",
        rep: actRep.trim() || currentCloserName,
        status: "UPCOMING",
        notes: actNotes.trim() || undefined,
        leadId: actLeadId,
      };

      const res = await crmFetch("/api/erp/crm/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create activity");
      const data = await res.json();
      showToast("Sales activity logged successfully!");
      if (data?.activity) {
        setActivities((prev) => [data.activity, ...prev]);
      } else {
        await loadData();
      }
      setIsActivityModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Error saving sales activity");
    } finally {
      setIsSavingActivity(false);
    }
  };

  // Save new lead
  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim() || !newContactName.trim()) return;

    try {
      setIsSavingLead(true);
      const payload: Partial<CrmLead> = {
        companyName: newCompanyName.trim(),
        contactName: newContactName.trim(),
        contactTitle: newContactTitle.trim() || undefined,
        contactEmail: newContactEmail.trim() || `${newContactName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        contactPhone: newContactPhone.trim() || undefined,
        industry: newIndustry.trim() || "Corporate",
        location: newLocation.trim() || "Lagos, Nigeria",
        website: newWebsite.trim() || undefined,
        icpFitScore: 92,
        buyingSignals: ["Direct outreach lead", "High closing probability"],
        status: newStatus,
        assignedRep: newLeadCloser && newLeadCloser.startsWith("Auto-Assign")
          ? "Auto-Assign (Least-Loaded)"
          : (newLeadCloser || currentCloserName),
        source: "Sales Closer Outreach",
        notes: newNotes.trim() || undefined,
      };

      const res = await crmFetch("/api/erp/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save lead");
      const data = await res.json();
      showToast("Prospect added to your leads directory!");
      if (data?.lead) {
        setLeads((prev) => [data.lead, ...prev]);
      } else {
        await loadData();
      }
      setIsLeadModalOpen(false);
      // Reset form
      setNewCompanyName("");
      setNewContactName("");
      setNewContactEmail("");
      setNewContactPhone("");
      setNewNotes("");
      setNewLeadCloser(currentCloserName);
    } catch (err) {
      console.error(err);
      showToast("Error adding new lead");
    } finally {
      setIsSavingLead(false);
    }
  };

  if (!isProvisioningLoading && !isModuleProvisioned("crm")) {
    return (
      <ErpAdminShell title="Sales Closer Portal">
        <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 rounded-3xl bg-nexa-surface border border-nexa-border shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto border border-amber-500/20">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-nexa-text-primary">
              CRM & Marketing Module Required
            </h2>
            <p className="text-xs text-nexa-text-secondary leading-relaxed">
              The Sales Closer Portal is tied to the <strong>CRM & Marketing</strong> module. This workspace does not currently have access to this module.
            </p>
            <div className="pt-2">
              <Link href={user?.role === "admin" ? "/erp/admin" : "/erp/employee"}>
                <NexaButton size="sm" variant="primary" className="rounded-full font-bold">
                  Return to Dashboard
                </NexaButton>
              </Link>
            </div>
          </div>
        </div>
      </ErpAdminShell>
    );
  }

  return (
    <ErpAdminShell
      title="Sales Closer Portal"
      subtitle="Dedicated closing desk: assigned corporate leads directory, activity logs, calls, demos, and closing milestones."
      activeModule="crm"
      action={
        <div className="flex items-center gap-2 flex-wrap">
          {/* Closer Scope Switcher */}
          <div className="flex items-center gap-1.5 bg-nexa-surface border border-nexa-border rounded-full px-3 py-1 shadow-xs">
            <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-[11px] font-bold text-nexa-text-secondary shrink-0">Closer:</span>
            <select
              value={closerFilter}
              onChange={(e) => setCloserFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-nexa-text-primary outline-none cursor-pointer pr-1"
            >
              <option value="my">My Pipeline ({currentCloserName})</option>
              <option value="all">All Sales Closers</option>
              {availableClosers
                .filter((name) => name !== currentCloserName)
                .map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
            </select>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-full border border-nexa-border bg-nexa-surface hover:bg-nexa-bg-base text-nexa-text-secondary transition-colors cursor-pointer"
            title="Refresh directory and activities"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-blue-600", isLoading && "animate-spin")} />
          </button>

          <Link href="/erp/admin/crm/calls">
            <NexaButton
              size="sm"
              variant="outline"
              leftIcon={<PhoneCall className="w-3.5 h-3.5 text-blue-600" />}
              className="rounded-full text-xs font-bold"
            >
              Call Logger
            </NexaButton>
          </Link>

          <NexaButton
            size="sm"
            variant="outline"
            leftIcon={<Calendar className="w-3.5 h-3.5 text-amber-500" />}
            className="rounded-full text-xs font-bold"
            onClick={() => {
              setActLeadId(undefined);
              setActCompany("");
              setActTitle("Discovery Call");
              setActType("CALL");
              setActDateTime("Today, 04:00 PM");
              setActRep(currentCloserName);
              setActNotes("");
              setIsActivityModalOpen(true);
            }}
          >
            Log Activity
          </NexaButton>

          <NexaButton
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            onClick={() => setIsLeadModalOpen(true)}
          >
            Add Lead
          </NexaButton>
        </div>
      }
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-2 shadow-2xl animate-in fade-in backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {toastMessage}
        </div>
      )}

      <div className="space-y-6">
        {/* SUB-TABS NAVIGATION BAR */}
        <div className="flex items-center justify-between border-b border-nexa-border pb-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab("leads");
                router.replace("/erp/ops/crm?tab=leads");
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer border",
                activeTab === "leads"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-xs"
                  : "bg-nexa-surface text-nexa-text-secondary border-nexa-border hover:text-nexa-text-primary"
              )}
            >
              <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Leads Directory
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                {filteredLeads.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("activities");
                router.replace("/erp/ops/crm?tab=activities");
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer border",
                activeTab === "activities"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-xs"
                  : "bg-nexa-surface text-nexa-text-secondary border-nexa-border hover:text-nexa-text-primary"
              )}
            >
              <Calendar className="w-4 h-4 text-amber-500" />
              Sales Activity
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                {filteredActivities.length}
              </span>
            </button>
          </div>

          <Link
            href="/erp/admin/crm"
            className="text-[11px] font-bold text-nexa-text-secondary hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <span>Master CRM & Marketing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* TAB 1: LEADS DIRECTORY */}
        {activeTab === "leads" && (
          <div className="space-y-6">
            {/* KPI STATS */}
            <ErpStatGrid
              stats={[
                {
                  label: "Assigned Leads",
                  value: `${leadsStats.total} Prospects`,
                  change: `${leadsStats.highFit} High-ICP`,
                  trend: "up",
                  icon: <Target className="w-5 h-5 text-emerald-500" />,
                  sub: `Filtered to ${closerFilter === "my" ? currentCloserName : closerFilter === "all" ? "All Closers" : closerFilter}`,
                },
                {
                  label: "Meetings & Demos",
                  value: `${leadsStats.meetings} Booked`,
                  change: "Active Pipeline",
                  trend: "up",
                  icon: <Sparkles className="w-5 h-5 text-purple-500" />,
                  sub: "Demonstrations confirmed",
                },
                {
                  label: "Deals Won / Converted",
                  value: `${leadsStats.converted} Accounts`,
                  change: "Revenue Closed",
                  trend: "up",
                  icon: <CheckCircle2 className="w-5 h-5 text-blue-500" />,
                  sub: "Signed corporate agreements",
                },
                {
                  label: "Lead Fit Quality",
                  value: "92% Avg ICP",
                  change: "Enterprise Grade",
                  trend: "up",
                  icon: <Flame className="w-5 h-5 text-amber-500" />,
                  sub: "Autonomous CAC & B2B scored",
                },
              ]}
            />

            {/* LEADS FILTER & LIST CARD */}
            <NexaCard variant="glass" padding="lg" className="space-y-4 rounded-3xl">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-nexa-border">
                <div>
                  <h3 className="font-extrabold text-sm text-nexa-text-primary flex items-center gap-2">
                    Corporate Leads Directory
                    <span className="text-[11px] font-normal text-nexa-text-muted">
                      ({filteredLeads.length} leads assigned)
                    </span>
                  </h3>
                  <p className="text-[11px] text-nexa-text-muted font-medium">
                    High-ticket corporate prospects, qualification stages, and direct closer outreach channels
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-nexa-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search company, contact, city..."
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-nexa-bg-base border border-nexa-border text-nexa-text-primary font-medium rounded-full text-xs outline-none focus:border-emerald-500 transition-all w-48 sm:w-64"
                    />
                  </div>

                  <select
                    value={leadStatusFilter}
                    onChange={(e) => setLeadStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-nexa-bg-base border border-nexa-border text-nexa-text-primary font-bold rounded-full text-xs outline-none cursor-pointer"
                  >
                    <option value="ALL">All Stages</option>
                    {LEAD_STATUSES.map((st) => (
                      <option key={st.key} value={st.key}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* LEADS DIRECTORY LIST */}
              {isLoading ? (
                <div className="py-12 text-center text-xs text-nexa-text-muted font-medium">
                  <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-emerald-600" />
                  Loading assigned leads directory...
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="py-12 text-center text-xs text-nexa-text-muted space-y-2">
                  <Target className="w-8 h-8 mx-auto text-nexa-text-muted/50 mb-1" />
                  <p className="font-bold text-nexa-text-primary">No assigned leads match your filters.</p>
                  <p className="text-[11px]">Click "Add Lead" above to onboard a new target corporate account.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredLeads.map((lead) => {
                    const statusObj = LEAD_STATUSES.find((s) => s.key === lead.status) || LEAD_STATUSES[0];
                    return (
                      <div
                        key={lead.id}
                        className="p-4 rounded-2xl bg-nexa-surface border border-nexa-border hover:border-emerald-500/50 transition-all shadow-xs space-y-3 flex flex-col justify-between"
                      >
                        <div>
                          {/* Top row: Company, ICP Score, Status */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-black text-sm text-nexa-text-primary truncate">
                                  {lead.companyName}
                                </h4>
                                {lead.website && (
                                  <a
                                    href={lead.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-nexa-text-muted hover:text-blue-500 inline-flex items-center"
                                    title={lead.website}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                              <p className="text-[11px] text-nexa-text-muted flex items-center gap-1.5 mt-0.5">
                                <Building2 className="w-3 h-3 text-nexa-text-muted shrink-0" />
                                <span>{lead.industry || "Corporate Commercial"}</span>
                                <span>•</span>
                                <MapPin className="w-3 h-3 text-nexa-text-muted shrink-0" />
                                <span>{lead.location || "Lagos, Nigeria"}</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-black border",
                                  lead.icpFitScore >= 90
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                    : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                )}
                                title={`ICP Match Score: ${lead.icpFitScore}%`}
                              >
                                {lead.icpFitScore}% Fit
                              </span>
                            </div>
                          </div>

                          {/* Contact Details */}
                          <div className="mt-3 p-2.5 rounded-xl bg-nexa-bg-base/60 border border-nexa-border/60 flex items-center justify-between gap-3 text-xs">
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-nexa-text-primary truncate">
                                {lead.contactName}
                              </p>
                              <p className="text-[10px] text-nexa-text-secondary truncate">
                                {lead.contactTitle || "Key Decision Maker"}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {lead.contactEmail && (
                                <a
                                  href={`mailto:${lead.contactEmail}`}
                                  className="p-1.5 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-secondary hover:text-blue-600 hover:border-blue-400 transition-colors"
                                  title={`Email ${lead.contactEmail}`}
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {lead.contactPhone && (
                                <a
                                  href={`tel:${lead.contactPhone}`}
                                  className="p-1.5 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-secondary hover:text-emerald-600 hover:border-emerald-400 transition-colors"
                                  title={`Call ${lead.contactPhone}`}
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Buying Signals */}
                          {lead.buyingSignals && lead.buyingSignals.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-1">
                              {lead.buyingSignals.map((signal, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 inline-flex items-center gap-1"
                                >
                                  <Flame className="w-2.5 h-2.5 text-amber-500" />
                                  {signal}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Notes */}
                          {lead.notes && (
                            <p className="mt-2 text-[11px] text-nexa-text-muted italic bg-nexa-bg-base/40 p-2 rounded-lg border border-nexa-border/40">
                              "{lead.notes}"
                            </p>
                          )}
                        </div>

                        {/* Bottom Row: Stage selector + Closer Tag + Actions */}
                        <div className="mt-3 pt-2.5 border-t border-nexa-border flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-nexa-text-muted">Stage:</span>
                            <select
                              value={lead.status}
                              onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as CrmLead["status"])}
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-lg border outline-none cursor-pointer",
                                statusObj.color
                              )}
                            >
                              {LEAD_STATUSES.map((s) => (
                                <option key={s.key} value={s.key}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/erp/admin/crm/calls?leadId=${lead.id}&phone=${encodeURIComponent(lead.contactPhone || "")}&name=${encodeURIComponent(lead.contactName || "")}&company=${encodeURIComponent(lead.companyName || "")}`}
                              className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border border-blue-500/20 cursor-pointer transition-colors flex items-center gap-1"
                              title="Start Phone Call & Log Outcome"
                            >
                              <PhoneCall className="w-3 h-3" />
                              Call
                            </Link>

                            <button
                              onClick={() => handleOpenLogActivityForLead(lead)}
                              className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 cursor-pointer transition-colors flex items-center gap-1"
                              title="Log Call, Meeting or Demo"
                            >
                              <Calendar className="w-3 h-3" />
                              Log Activity
                            </button>

                            {lead.status !== "CONVERTED" && (
                              <button
                                onClick={() => handleUpdateLeadStatus(lead.id, "CONVERTED")}
                                className="px-2 py-1 text-[10px] font-bold rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border border-blue-500/20 cursor-pointer transition-colors"
                                title="Mark deal as closed/converted"
                              >
                                Win Deal
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </NexaCard>
          </div>
        )}

        {/* TAB 2: SALES ACTIVITY */}
        {activeTab === "activities" && (
          <div className="space-y-6">
            {/* KPI STATS */}
            <ErpStatGrid
              stats={[
                {
                  label: "Total Activities",
                  value: `${activityStats.total} Logs`,
                  change: `${activityStats.upcoming} Pending`,
                  trend: "up",
                  icon: <Calendar className="w-5 h-5 text-amber-500" />,
                  sub: `Outreach by ${closerFilter === "my" ? currentCloserName : closerFilter === "all" ? "All Closers" : closerFilter}`,
                },
                {
                  label: "Upcoming Calls & Demos",
                  value: `${activityStats.upcoming} Scheduled`,
                  change: "Next Actions",
                  trend: "up",
                  icon: <Clock className="w-5 h-5 text-blue-500" />,
                  sub: "Pipeline follow-ups queue",
                },
                {
                  label: "Completed Milestones",
                  value: `${activityStats.completed} Closed Out`,
                  change: `${activityStats.rate}% Execution`,
                  trend: "up",
                  icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
                  sub: "Delivered presentations & calls",
                },
                {
                  label: "Closing Momentum",
                  value: "Active Streak",
                  change: "High Engagement",
                  trend: "up",
                  icon: <Flame className="w-5 h-5 text-purple-500" />,
                  sub: "Daily lead contact rate",
                },
              ]}
            />

            {/* ACTIVITY FEED CARD */}
            <NexaCard variant="glass" padding="lg" className="space-y-4 rounded-3xl">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-nexa-border">
                <div>
                  <h3 className="font-extrabold text-sm text-nexa-text-primary flex items-center gap-2">
                    Sales Activity Log & Timeline
                    <span className="text-[11px] font-normal text-nexa-text-muted">
                      ({filteredActivities.length} activities logged)
                    </span>
                  </h3>
                  <p className="text-[11px] text-nexa-text-muted font-medium">
                    Scheduled calls, customer product demos, contract milestones, and deal discussions
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-nexa-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search activity title, company..."
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-nexa-bg-base border border-nexa-border text-nexa-text-primary font-medium rounded-full text-xs outline-none focus:border-amber-500 transition-all w-48 sm:w-60"
                    />
                  </div>

                  <select
                    value={activityTypeFilter}
                    onChange={(e) => setActivityTypeFilter(e.target.value)}
                    className="px-3 py-1.5 bg-nexa-bg-base border border-nexa-border text-nexa-text-primary font-bold rounded-full text-xs outline-none cursor-pointer"
                  >
                    <option value="ALL">All Types</option>
                    <option value="CALL">Calls</option>
                    <option value="DEMO">Product Demos</option>
                    <option value="MEETING">Meetings</option>
                    <option value="EMAIL">Emails</option>
                    <option value="NOTE">Notes</option>
                  </select>

                  <select
                    value={activityStatusFilter}
                    onChange={(e) => setActivityStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-nexa-bg-base border border-nexa-border text-nexa-text-primary font-bold rounded-full text-xs outline-none cursor-pointer"
                  >
                    <option value="ALL">All Status</option>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* ACTIVITIES LIST */}
              {isLoading ? (
                <div className="py-12 text-center text-xs text-nexa-text-muted font-medium">
                  <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-amber-500" />
                  Loading sales activities...
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="py-12 text-center text-xs text-nexa-text-muted space-y-2">
                  <Calendar className="w-8 h-8 mx-auto text-nexa-text-muted/50 mb-1" />
                  <p className="font-bold text-nexa-text-primary">No activities match your filters.</p>
                  <p className="text-[11px]">Click "Log Activity" above to schedule a call or record notes.</p>
                </div>
              ) : (
                <div className="divide-y divide-nexa-border">
                  {filteredActivities.map((act) => {
                    const isUpcoming = act.status === "UPCOMING";
                    const isCompleted = act.status === "COMPLETED";

                    return (
                      <div
                        key={act.id}
                        className="py-3.5 flex items-start justify-between gap-3 hover:bg-nexa-bg-base/50 transition-colors rounded-xl px-2.5"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {/* Type Icon Badge */}
                          <div
                            className={cn(
                              "p-2.5 rounded-xl border shrink-0 mt-0.5",
                              act.type === "CALL" && "bg-blue-500/10 text-blue-600 border-blue-500/20",
                              act.type === "DEMO" && "bg-purple-500/10 text-purple-600 border-purple-500/20",
                              act.type === "MEETING" && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                              act.type === "EMAIL" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                              act.type === "NOTE" && "bg-slate-500/10 text-slate-600 border-slate-500/20"
                            )}
                          >
                            {act.type === "CALL" && <Phone className="w-4 h-4" />}
                            {act.type === "DEMO" && <Sparkles className="w-4 h-4" />}
                            {act.type === "MEETING" && <Users className="w-4 h-4" />}
                            {act.type === "EMAIL" && <Mail className="w-4 h-4" />}
                            {act.type === "NOTE" && <FileText className="w-4 h-4" />}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-xs text-nexa-text-primary">
                                {act.title}
                              </h4>
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-nexa-bg-base border border-nexa-border text-nexa-text-secondary">
                                {act.company}
                              </span>
                              <span
                                className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-full font-black border",
                                  isCompleted
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                    : isUpcoming
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                )}
                              >
                                {act.status}
                              </span>
                            </div>

                            <p className="text-[11px] text-nexa-text-muted flex items-center gap-2">
                              <Clock className="w-3 h-3 text-nexa-text-muted shrink-0" />
                              <span>{act.dateTime}</span>
                              <span>•</span>
                              <User className="w-3 h-3 text-nexa-text-muted shrink-0" />
                              <span className="font-semibold text-nexa-text-secondary">{act.rep}</span>
                            </p>

                            {act.notes && (
                              <p className="text-xs text-nexa-text-secondary bg-nexa-bg-base/70 p-2 rounded-xl border border-nexa-border/60 mt-1.5">
                                {act.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 self-center">
                          <button
                            onClick={() => handleToggleActivityStatus(act)}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1",
                              isCompleted
                                ? "bg-nexa-bg-base text-nexa-text-secondary border-nexa-border hover:bg-nexa-bg-base/80"
                                : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-xs"
                            )}
                            title={isCompleted ? "Re-open activity" : "Mark activity as done"}
                          >
                            <Check className="w-3 h-3" />
                            {isCompleted ? "Done" : "Complete"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </NexaCard>
          </div>
        )}
      </div>

      {/* LOG ACTIVITY MODAL */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-lg bg-nexa-bg-surface border border-nexa-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-nexa-border pb-3">
              <div>
                <h2 className="text-base font-black text-nexa-text-primary">
                  Log Sales Activity
                </h2>
                <p className="text-xs text-nexa-text-secondary">
                  Record a discovery call, demo, or customer note in your timeline.
                </p>
              </div>
              <button
                onClick={() => setIsActivityModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-nexa-bg-base text-nexa-text-muted hover:text-nexa-text-primary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-nexa-text-primary">
                    Activity Type *
                  </label>
                  <select
                    value={actType}
                    onChange={(e) => setActType(e.target.value as CrmActivity["type"])}
                    className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-nexa-bg-base border border-nexa-border outline-none focus:border-amber-500 text-nexa-text-primary cursor-pointer"
                  >
                    <option value="CALL">Phone Call</option>
                    <option value="DEMO">Product Demo</option>
                    <option value="MEETING">Executive Meeting</option>
                    <option value="EMAIL">Follow-Up Email</option>
                    <option value="NOTE">Internal Note</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-nexa-text-primary">
                    Target Company *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hubmart Supermarkets"
                    value={actCompany}
                    onChange={(e) => setActCompany(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-nexa-bg-base border border-nexa-border outline-none focus:border-amber-500 text-nexa-text-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-nexa-text-primary">
                  Activity Title / Agenda *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discovery call on 15kVA solar financing terms"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-nexa-bg-base border border-nexa-border outline-none focus:border-amber-500 text-nexa-text-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-nexa-text-primary">
                    Schedule / Date Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Today, 03:00 PM"
                    value={actDateTime}
                    onChange={(e) => setActDateTime(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-nexa-bg-base border border-nexa-border outline-none focus:border-amber-500 text-nexa-text-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-nexa-text-primary">
                    Closer / Rep
                  </label>
                  <input
                    type="text"
                    placeholder={currentCloserName}
                    value={actRep}
                    onChange={(e) => setActRep(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-nexa-bg-base border border-nexa-border outline-none focus:border-amber-500 text-nexa-text-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-nexa-text-primary">
                  Meeting Notes & Key Objections
                </label>
                <textarea
                  rows={3}
                  placeholder="Key discussion points, pricing feedback, next action agreed..."
                  value={actNotes}
                  onChange={(e) => setActNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-nexa-bg-base border border-nexa-border outline-none focus:border-amber-500 text-nexa-text-primary resize-none"
                />
              </div>

              <div className="pt-3 border-t border-nexa-border flex items-center justify-end gap-2">
                <NexaButton
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="rounded-full px-4 font-bold"
                >
                  Cancel
                </NexaButton>
                <NexaButton
                  size="sm"
                  variant="primary"
                  type="submit"
                  disabled={isSavingActivity}
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-full font-bold px-4 shadow-sm"
                >
                  {isSavingActivity ? "Saving Activity..." : "Log Activity"}
                </NexaButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD LEAD MODAL */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-lg bg-nexa-bg-surface border border-nexa-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-nexa-border pb-3">
              <div>
                <h2 className="text-base font-black text-nexa-text-primary">
                  Add Corporate Prospect
                </h2>
                <p className="text-xs text-nexa-text-secondary">
                  Onboard a new high-value corporate lead directly assigned to you.
                </p>
              </div>
              <button
                onClick={() => setIsLeadModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-nexa-bg-base text-nexa-text-muted hover:text-nexa-text-primary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-nexa-text-primary">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zenith Towers Ltd"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-nexa-bg-base border border-nexa-border outline-none focus:border-emerald-500 text-nexa-text-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-nexa-text-primary">
                    Industry Sector
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Real Estate & Facilities"
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-nexa-bg-base border border-nexa-border outline-none focus:border-emerald-500 text-nexa-text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-nexa-text-primary">
                    Decision Maker Contact *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engr. Bolaji Dawodu"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-nexa-bg-base border border-nexa-border outline-none focus:border-emerald-500 text-nexa-text-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-nexa-text-primary">
                    Contact Title / Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Head of Facilities"
                    value={newContactTitle}
                    onChange={(e) => setNewContactTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-nexa-bg-base border border-nexa-border outline-none focus:border-emerald-500 text-nexa-text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-nexa-text-primary">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    placeholder="bolaji@zenithtowers.com"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-nexa-bg-base border border-nexa-border outline-none focus:border-emerald-500 text-nexa-text-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-nexa-text-primary">
                    Direct Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+234 802 000 1122"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-nexa-bg-base border border-nexa-border outline-none focus:border-emerald-500 text-nexa-text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-nexa-text-primary">
                    Location / Office
                  </label>
                  <input
                    type="text"
                    placeholder="Victoria Island, Lagos"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-nexa-bg-base border border-nexa-border outline-none focus:border-emerald-500 text-nexa-text-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-nexa-text-primary">
                    Initial Stage
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as CrmLead["status"])}
                    className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-nexa-bg-base border border-nexa-border outline-none focus:border-emerald-500 text-nexa-text-primary cursor-pointer"
                  >
                    <option value="QUALIFIED">Qualified</option>
                    <option value="MEETING_BOOKED">Meeting / Demo Booked</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="IDENTIFIED">Identified</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-nexa-text-primary">
                  Assigned Sales Closer
                </label>
                <select
                  value={newLeadCloser || currentCloserName}
                  onChange={(e) => setNewLeadCloser(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-nexa-bg-base border border-nexa-border outline-none focus:border-emerald-500 text-nexa-text-primary cursor-pointer"
                >
                  <option value={currentCloserName}>Myself ({currentCloserName})</option>
                  <option value="Auto-Assign (Least-Loaded)">⚡ Auto-Assign (Least-Loaded Closer)</option>
                  {availableClosers
                    .filter((c) => c !== currentCloserName)
                    .map((c) => (
                      <option key={c} value={c}>
                        👤 {c}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-nexa-text-primary">
                  Strategic Notes & Opportunity Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Details on client budget, system requirements, closing notes..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-nexa-bg-base border border-nexa-border outline-none focus:border-emerald-500 text-nexa-text-primary resize-none"
                />
              </div>

              <div className="pt-3 border-t border-nexa-border flex items-center justify-end gap-2">
                <NexaButton
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="rounded-full px-4 font-bold"
                >
                  Cancel
                </NexaButton>
                <NexaButton
                  size="sm"
                  variant="primary"
                  type="submit"
                  disabled={isSavingLead}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold px-4 shadow-sm"
                >
                  {isSavingLead ? "Adding Prospect..." : "Save Lead"}
                </NexaButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpAdminShell>
  );
}

export default function SalesCloserPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8 text-center text-xs text-nexa-text-muted bg-nexa-bg-base">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading Sales Closer Portal...</span>
          </div>
        </div>
      }
    >
      <SalesCloserPortalContent />
    </Suspense>
  );
}
