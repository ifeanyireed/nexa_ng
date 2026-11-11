"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { resolveAvatarUrl } from "@/lib/avatar";
import { useAwardsStore, AwardCategory, AwardNominee, AwardEvent } from "@/lib/awards-store";
import { useERPStore } from "@/lib/erp-store";
import {
  Award,
  Trophy,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  BarChart3,
  Tv,
  Plus,
  Search,
  Lock,
  ChevronRight,
  Calendar,
  Share2,
  FileCheck,
  Percent,
  UserCheck,
  X,
  AlertCircle,
  Eye,
  Edit3,
  Trash2,
  Settings,
  FolderPlus,
  ChevronDown,
} from "lucide-react";

export default function HRAwardsPage() {
  const router = useRouter();
  const {
    activeEvent,
    setActiveEvent,
    eventsList,
    turnoutStats,
    hallOfFame,
    isLoading,
    fetchEvents,
    fetchActiveEvent,
    fetchTurnout,
    createEvent,
    updateEvent,
    deleteEvent,
    finalizeResults,
    publishWinners,
    createCategory,
    updateCategory,
    deleteCategory,
    createNominee,
    deleteNominee,
  } = useAwardsStore();

  const { users } = useERPStore();

  const [activeTab, setActiveTab] = useState<"CATEGORIES" | "TURNOUT" | "VAULT" | "HALL_OF_FAME">("CATEGORIES");
  const [selectedCategory, setSelectedCategory] = useState<AwardCategory | null>(null);
  const [editingCategory, setEditingCategory] = useState<AwardCategory | null>(null);

  // Modals state
  const [isNomineeModalOpen, setIsNomineeModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);

  // Form states
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [nominationPitch, setNominationPitch] = useState("");
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    criteria: "",
    maxWinners: 1,
  });

  const [eventFormData, setEventFormData] = useState<{
    title: string;
    awardYear: number;
    startDate: string;
    endDate: string;
    description: string;
    bannerUrl: string;
    status: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED" | "FINALIZED" | "PUBLISHED";
    isAnonymous: boolean;
    allowVoteEditing: boolean;
    isPublicVisible: boolean;
  }>({
    title: "",
    awardYear: new Date().getFullYear(),
    startDate: "",
    endDate: "",
    description: "",
    bannerUrl: "",
    status: "ACTIVE",
    isAnonymous: true,
    allowVoteEditing: false,
    isPublicVisible: true,
  });

  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (activeEvent?.id) {
      fetchTurnout(activeEvent.id);
    }
  }, [activeEvent?.id, fetchTurnout]);

  // Filter staff candidates
  const staffCandidates = users.filter((u) => {
    if (!staffSearchQuery) return true;
    const q = staffSearchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q) ||
      u.designation?.toLowerCase().includes(q)
    );
  });

  // --- EVENT CRUD HANDLERS ---
  const handleOpenCreateEvent = () => {
    const today = new Date();
    const twoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    setEventFormData({
      title: `${today.getFullYear()} Excellence & Recognition Awards`,
      awardYear: today.getFullYear(),
      startDate: today.toISOString().slice(0, 10),
      endDate: twoWeeks.toISOString().slice(0, 10),
      description: "Recognising exceptional people and teams whose dedication, innovation, and leadership drove our organization forward.",
      bannerUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80",
      status: "ACTIVE",
      isAnonymous: true,
      allowVoteEditing: false,
      isPublicVisible: true,
    });
    setIsCreateEventModalOpen(true);
  };

  const handleSubmitCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventFormData.title.trim()) return;

    const res = await createEvent(eventFormData);
    if (res?.success) {
      setIsCreateEventModalOpen(false);
      setActionSuccessMsg(`Event "${eventFormData.title}" created successfully!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } else {
      setActionErrorMsg(res?.error || "Failed to create award event");
      setTimeout(() => setActionErrorMsg(null), 4000);
    }
  };

  const handleOpenEditEvent = () => {
    if (!activeEvent) return;
    setEventFormData({
      title: activeEvent.title || "",
      awardYear: activeEvent.awardYear || new Date().getFullYear(),
      startDate: activeEvent.startDate ? new Date(activeEvent.startDate).toISOString().slice(0, 10) : "",
      endDate: activeEvent.endDate ? new Date(activeEvent.endDate).toISOString().slice(0, 10) : "",
      description: activeEvent.description || "",
      bannerUrl: activeEvent.bannerUrl || "",
      status: activeEvent.status || "ACTIVE",
      isAnonymous: activeEvent.isAnonymous !== false,
      allowVoteEditing: activeEvent.allowVoteEditing === true,
      isPublicVisible: activeEvent.isPublicVisible !== false,
    });
    setIsEditEventModalOpen(true);
  };

  const handleSubmitEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !eventFormData.title.trim()) return;

    const res = await updateEvent(activeEvent.id, eventFormData);
    if (res?.success) {
      setIsEditEventModalOpen(false);
      setActionSuccessMsg(`Event "${eventFormData.title}" updated successfully!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } else {
      setActionErrorMsg(res?.error || "Failed to update award event");
      setTimeout(() => setActionErrorMsg(null), 4000);
    }
  };

  const handleDeleteEvent = async () => {
    if (!activeEvent) return;
    if (
      confirm(
        `Are you sure you want to permanently delete event "${activeEvent.title}"? This will delete all its categories, shortlisted nominees, ballots, and results.`
      )
    ) {
      const res = await deleteEvent(activeEvent.id);
      if (res?.success) {
        setIsEditEventModalOpen(false);
        setActionSuccessMsg(`Event "${activeEvent.title}" deleted.`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
      } else {
        setActionErrorMsg(res?.error || "Failed to delete event");
        setTimeout(() => setActionErrorMsg(null), 4000);
      }
    }
  };

  // --- CATEGORY CRUD HANDLERS ---
  const handleOpenCreateCategory = () => {
    setCategoryFormData({
      name: "",
      description: "",
      criteria: "",
      maxWinners: 1,
    });
    setIsCategoryModalOpen(true);
  };

  const handleSubmitCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim() || !activeEvent?.id) return;
    const res = await createCategory({
      eventId: activeEvent.id,
      name: categoryFormData.name,
      description: categoryFormData.description,
      criteria: categoryFormData.criteria,
      maxWinners: Number(categoryFormData.maxWinners) || 1,
    });
    if (res?.success) {
      setIsCategoryModalOpen(false);
      setActionSuccessMsg(`Category "${categoryFormData.name}" created successfully!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } else {
      setActionErrorMsg(res?.error || "Failed to create category");
      setTimeout(() => setActionErrorMsg(null), 4000);
    }
  };

  const handleOpenEditCategory = (cat: AwardCategory) => {
    setEditingCategory(cat);
    setCategoryFormData({
      name: cat.name,
      description: cat.description || "",
      criteria: cat.criteria || "",
      maxWinners: cat.maxWinners || 1,
    });
    setIsEditCategoryModalOpen(true);
  };

  const handleSubmitEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !categoryFormData.name.trim()) return;
    const res = await updateCategory(editingCategory.id, {
      name: categoryFormData.name,
      description: categoryFormData.description,
      criteria: categoryFormData.criteria,
      maxWinners: Number(categoryFormData.maxWinners) || 1,
    });
    if (res?.success) {
      setIsEditCategoryModalOpen(false);
      setEditingCategory(null);
      setActionSuccessMsg(`Category "${categoryFormData.name}" updated successfully!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } else {
      setActionErrorMsg(res?.error || "Failed to update category");
      setTimeout(() => setActionErrorMsg(null), 4000);
    }
  };

  const handleDeleteCategory = async (cat: AwardCategory) => {
    if (confirm(`Are you sure you want to delete category "${cat.name}"? This will also remove any shortlisted nominees under this category.`)) {
      const res = await deleteCategory(cat.id);
      if (res?.success) {
        setActionSuccessMsg(`Category "${cat.name}" deleted.`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
      } else {
        setActionErrorMsg(res?.error || "Failed to delete category");
        setTimeout(() => setActionErrorMsg(null), 4000);
      }
    }
  };

  const handleDeleteNominee = async (nom: AwardNominee, catName: string) => {
    if (confirm(`Remove ${nom.employeeName} from ${catName}?`)) {
      const res = await deleteNominee(nom.id);
      if (res?.success) {
        setActionSuccessMsg(`Removed ${nom.employeeName} from nominations.`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
      } else {
        setActionErrorMsg(res?.error || "Failed to remove nominee");
        setTimeout(() => setActionErrorMsg(null), 4000);
      }
    }
  };

  const handleFinalize = async () => {
    if (!activeEvent?.id) return;
    if (confirm("Are you sure you want to finalize voting? This locks all cast ballots and calculates category winner tallies.")) {
      const res = await finalizeResults(activeEvent.id);
      if (res?.success) {
        setActionSuccessMsg("Voting successfully closed & results calculated into vault!");
        setActiveTab("VAULT");
        setTimeout(() => setActionSuccessMsg(null), 5000);
      } else {
        setActionErrorMsg(res?.error || "Failed to finalize results");
        setTimeout(() => setActionErrorMsg(null), 4000);
      }
    }
  };

  const handlePublish = async () => {
    if (!activeEvent?.id) return;
    if (confirm("Publish official winners to Employee Portal and Hall of Fame? Employees will immediately be able to view winners.")) {
      const res = await publishWinners(activeEvent.id);
      if (res?.success) {
        setActionSuccessMsg("Winners officially published to Employee Portal & Hall of Fame!");
        setActiveTab("HALL_OF_FAME");
        setTimeout(() => setActionSuccessMsg(null), 5000);
      } else {
        setActionErrorMsg(res?.error || "Failed to publish winners");
        setTimeout(() => setActionErrorMsg(null), 4000);
      }
    }
  };

  const statCards = [
    {
      label: "Eligible Staff",
      value: turnoutStats?.totalEligibleStaff || users.length || 0,
      sub: "Verified Employees",
      icon: <Users className="w-5 h-5 text-blue-500" />,
    },
    {
      label: "Ballots Sealed",
      value: `${turnoutStats?.totalBallotsCast || 0}`,
      sub: `${(turnoutStats?.turnoutPercentage || 0).toFixed(1)}% Company Turnout`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    },
    {
      label: "Award Categories",
      value: activeEvent?.categories?.length || 0,
      sub: "Active Categories",
      icon: <Award className="w-5 h-5 text-amber-500" />,
    },
    {
      label: "Voting Window",
      value: `${turnoutStats?.daysRemaining || 0} Days`,
      sub: activeEvent?.status === "ACTIVE" ? "Voting in Progress" : (activeEvent?.status || "Draft"),
      icon: <Clock className="w-5 h-5 text-purple-500" />,
    },
  ];

  return (
    <BusinessShell
      title="Employee Awards & Recognition Hub"
      subtitle="Annual End-of-Year Awards administration, nominee curation, live turnout monitor & ceremony controls."
      action={
        <div className="flex flex-wrap items-center gap-2">
          {/* Event Switcher Dropdown (if multiple events exist) */}
          {eventsList.length > 1 && (
            <div className="relative">
              <select
                value={activeEvent?.id || ""}
                onChange={(e) => fetchActiveEvent(e.target.value)}
                className="text-xs font-bold py-1.5 px-3 rounded-full border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] cursor-pointer"
              >
                {eventsList.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.awardYear} — {ev.title} ({ev.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* New Event Button */}
          <NexaButton
            variant="primary"
            size="sm"
            onClick={handleOpenCreateEvent}
            className="bg-[#1A56DB] hover:bg-[#1A56DB]/90 text-white rounded-full flex items-center gap-1.5 shadow-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            New Event
          </NexaButton>

          {activeEvent && (
            <>
              <NexaButton
                variant="outline"
                size="sm"
                onClick={handleOpenEditEvent}
                className="rounded-full flex items-center gap-1.5 text-xs font-bold border-[var(--nexa-border)]"
                title="Edit Event Details & Status"
              >
                <Settings className="w-3.5 h-3.5" />
                Edit Event
              </NexaButton>

              <Link href="/erp/hr/awards/ceremony">
                <NexaButton
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 font-medium rounded-full"
                >
                  <Tv className="w-4 h-4" />
                  Ceremony Stage TV
                </NexaButton>
              </Link>
            </>
          )}

          {activeEvent?.status === "ACTIVE" && (
            <NexaButton
              variant="primary"
              size="sm"
              onClick={handleFinalize}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 shadow-sm rounded-full font-bold"
            >
              <Lock className="w-4 h-4" />
              Finalize Results
            </NexaButton>
          )}

          {activeEvent?.status === "FINALIZED" && (
            <NexaButton
              variant="primary"
              size="sm"
              onClick={handlePublish}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm rounded-full font-bold"
            >
              <Sparkles className="w-4 h-4" />
              Publish to Hall of Fame
            </NexaButton>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Success Alert */}
        {actionSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{actionSuccessMsg}</p>
          </div>
        )}

        {/* Error Alert */}
        {actionErrorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{actionErrorMsg}</p>
          </div>
        )}

        {/* EMPTY STATE: NO ACTIVE EVENT CONFIGURED */}
        {!activeEvent && !isLoading && (
          <NexaCard
            variant="glass"
            padding="lg"
            className="rounded-3xl border border-[var(--nexa-border)] p-12 text-center flex flex-col items-center justify-center space-y-4"
          >
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-lg">
              <Trophy className="w-10 h-10" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h3 className="text-lg font-black text-[var(--nexa-text-primary)]">
                No Award Events Found
              </h3>
              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Create your first annual recognition event (e.g. "2026 End-of-Year Excellence Awards") to begin adding voting categories, shortlisting nominees, and launching confidential company voting.
              </p>
            </div>
            <NexaButton
              variant="primary"
              size="md"
              onClick={handleOpenCreateEvent}
              className="bg-[#1A56DB] hover:bg-[#1A56DB]/90 text-white rounded-full font-bold px-6 shadow-md mt-2"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create First Award Event
            </NexaButton>
          </NexaCard>
        )}

        {/* ACTIVE EVENT BANNER & TABS */}
        {activeEvent && (
          <>
            {/* Event Header Banner */}
            <NexaCard
              variant="glass"
              padding="lg"
              className="rounded-3xl border border-[var(--nexa-border)] bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <NexaBadge variant="amber" className="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                      {activeEvent.awardYear} Annual Awards
                    </NexaBadge>
                    <NexaBadge
                      variant={activeEvent.status === "ACTIVE" ? "green" : "brand"}
                      className="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase"
                    >
                      {activeEvent.status === "ACTIVE" ? "Voting Live" : activeEvent.status}
                    </NexaBadge>
                    {activeEvent.isAnonymous && (
                      <NexaBadge variant="secondary" className="rounded-full text-xs font-medium">
                        🔒 Cryptographic Anonymity Enforced
                      </NexaBadge>
                    )}
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-[var(--nexa-text-primary)]">
                    {activeEvent.title}
                  </h2>
                  <p className="text-xs text-[var(--nexa-text-muted)] max-w-2xl font-medium">
                    {activeEvent.description || "Company recognition and awards celebration."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-[11px] text-[var(--nexa-text-muted)] font-medium">Voting Period</div>
                    <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                      {activeEvent.startDate ? new Date(activeEvent.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Open"}{" "}
                      -{" "}
                      {activeEvent.endDate ? new Date(activeEvent.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Ongoing"}
                    </div>
                  </div>
                </div>
              </div>
            </NexaCard>

            {/* Top KPI Stat Grid */}
            <ErpStatGrid stats={statCards} />

            {/* Tab Navigation — Rounded Pills */}
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                {[
                  { id: "CATEGORIES", label: `Categories & Nominees (${activeEvent.categories?.length || 0})`, icon: <Award className="w-3.5 h-3.5" /> },
                  { id: "TURNOUT", label: "Turnout & Analytics", icon: <BarChart3 className="w-3.5 h-3.5" /> },
                  { id: "VAULT", label: "Tally Vault & Finalization", icon: <Lock className="w-3.5 h-3.5" /> },
                  { id: "HALL_OF_FAME", label: `Hall of Fame Archive (${hallOfFame.length})`, icon: <Trophy className="w-3.5 h-3.5" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === tab.id
                        ? "bg-[#1A56DB] text-white shadow-md shadow-[#1A56DB]/20"
                        : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)] border border-transparent hover:border-[var(--nexa-border)]"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: CATEGORIES & NOMINEES */}
            {activeTab === "CATEGORIES" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[var(--nexa-text-primary)]">Award Categories</h3>
                    <p className="text-xs text-[var(--nexa-text-muted)] font-medium">
                      Define award titles, criteria, and shortlist employee candidates from the directory.
                    </p>
                  </div>
                  <NexaButton
                    variant="primary"
                    size="sm"
                    onClick={handleOpenCreateCategory}
                    className="bg-[#1A56DB] hover:bg-[#1A56DB]/90 text-white rounded-full flex items-center gap-1.5 shadow-sm font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    Add Category
                  </NexaButton>
                </div>

                {(!activeEvent.categories || activeEvent.categories.length === 0) ? (
                  <div className="p-8 rounded-3xl border border-[var(--nexa-border)] text-center bg-[var(--nexa-bg-surface)]">
                    <Award className="w-8 h-8 text-[var(--nexa-text-muted)] mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold text-[var(--nexa-text-primary)]">No categories defined yet</p>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] mt-1">
                      Click "+ Add Category" above to create your first recognition award (e.g. Employee of the Year).
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeEvent.categories.map((cat) => (
                      <NexaCard key={cat.id} variant="glass" padding="md" className="rounded-3xl border border-[var(--nexa-border)] space-y-3">
                        <div className="flex items-start justify-between gap-3 border-b border-[var(--nexa-border)] pb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold shrink-0">
                              <Award className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-sm font-extrabold text-[var(--nexa-text-primary)] leading-tight">{cat.name}</h4>
                              <p className="text-[11px] text-[var(--nexa-text-muted)] line-clamp-1">{cat.description || "Recognition Category"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleOpenEditCategory(cat)}
                              className="p-1.5 text-[var(--nexa-text-muted)] hover:text-[#1A56DB] rounded-lg hover:bg-[var(--nexa-bg-base)] transition-colors cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1.5 text-[var(--nexa-text-muted)] hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {cat.criteria && (
                          <div className="text-[11px] text-[var(--nexa-text-secondary)] bg-[var(--nexa-bg-base)] p-2 rounded-xl border border-[var(--nexa-border)]">
                            <span className="font-bold text-[var(--nexa-text-primary)]">Criteria: </span>
                            {cat.criteria}
                          </div>
                        )}

                        {/* Nominees list */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[var(--nexa-text-primary)]">
                              Nominees ({cat.nominees?.length || 0})
                            </span>
                            <button
                              onClick={() => {
                                setSelectedCategory(cat);
                                setIsNomineeModalOpen(true);
                              }}
                              className="text-[#1A56DB] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              Add Nominee
                            </button>
                          </div>

                          {(!cat.nominees || cat.nominees.length === 0) ? (
                            <p className="text-[11px] text-[var(--nexa-text-muted)] italic py-1">
                              No nominees added yet. Click "+ Add Nominee" to shortlist staff.
                            </p>
                          ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {cat.nominees.map((nom) => (
                                <div
                                  key={nom.id}
                                  className="flex items-center justify-between p-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <NexaAvatar src={resolveAvatarUrl(nom.avatarUrl)} name={nom.employeeName} size="sm" />
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-[var(--nexa-text-primary)] truncate">{nom.employeeName}</p>
                                      <p className="text-[10px] text-[var(--nexa-text-muted)] truncate">{nom.department} • {nom.designation}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteNominee(nom, cat.name)}
                                    className="text-[var(--nexa-text-muted)] hover:text-red-500 p-1 rounded transition-colors shrink-0 cursor-pointer"
                                    title="Remove Nominee"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </NexaCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: TURNOUT & ANALYTICS */}
            {activeTab === "TURNOUT" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NexaCard variant="glass" padding="md" className="rounded-3xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-[var(--nexa-text-muted)] font-bold uppercase tracking-wider">Audit Hash Integrity</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-2xl font-black text-[var(--nexa-text-primary)]">SHA-256 Sealed</div>
                    </div>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium mt-3 leading-relaxed">
                      All ballots are assigned a cryptographic confirmation hash upon submission. Individual selections remain strictly decoupled and anonymous.
                    </p>
                  </NexaCard>

                  <NexaCard variant="glass" padding="md" className="rounded-3xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-[var(--nexa-text-muted)] font-bold uppercase tracking-wider">Self-Voting Block</span>
                        <UserCheck className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="text-2xl font-black text-[var(--nexa-text-primary)]">Enforced 100%</div>
                    </div>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium mt-3 leading-relaxed">
                      Nominees cannot vote for themselves in categories where they are shortlisted. Zero conflicts recorded.
                    </p>
                  </NexaCard>
                </div>

                {/* Department Turnout Leaderboard */}
                <NexaCard variant="glass" padding="md" className="rounded-3xl space-y-4">
                  <h4 className="text-sm font-extrabold text-[var(--nexa-text-primary)]">Department Turnout Leaderboard</h4>
                  {(!turnoutStats?.departmentTurnout || turnoutStats.departmentTurnout.length === 0) ? (
                    <p className="text-xs text-[var(--nexa-text-muted)] italic">No department participation recorded yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {turnoutStats.departmentTurnout.map((dept) => (
                        <div key={dept.department} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-[var(--nexa-text-primary)]">{dept.department}</span>
                            <span className="text-[var(--nexa-text-muted)]">
                              {dept.votedCount} / {dept.totalStaff} staff ({dept.percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#1A56DB] h-2 rounded-full transition-all duration-500"
                              style={{ width: `${dept.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </NexaCard>
              </div>
            )}

            {/* TAB 3: TALLY VAULT & FINALIZATION */}
            {activeTab === "VAULT" && (
              <div className="space-y-5">
                <NexaCard variant="glass" padding="md" className="rounded-3xl border border-amber-500/30 bg-amber-500/5">
                  <div className="flex items-start gap-3.5">
                    <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-[var(--nexa-text-primary)]">Secure Tally Vault</h4>
                      <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                        Ballots are encrypted. When voting concludes, click "Finalize Results" to lock ballots and calculate the standings before publishing to the Employee Portal and Hall of Fame.
                      </p>
                    </div>
                  </div>
                </NexaCard>

                <div className="space-y-4">
                  {activeEvent.categories?.map((cat) => (
                    <NexaCard key={cat.id} variant="glass" padding="md" className="rounded-3xl">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--nexa-border)]">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <h4 className="text-sm font-bold text-[var(--nexa-text-primary)]">{cat.name}</h4>
                        </div>
                        <NexaBadge variant="secondary" className="rounded-full text-[10px] font-bold">
                          {cat.maxWinners} Winner Target
                        </NexaBadge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {cat.nominees?.map((nom, idx) => (
                          <div
                            key={nom.id}
                            className={`p-3.5 rounded-2xl border transition-all ${
                              idx === 0
                                ? "border-amber-500/40 bg-amber-500/10 shadow-sm"
                                : "border-[var(--nexa-border)] bg-[var(--nexa-bg-base)]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <NexaAvatar
                                src={resolveAvatarUrl(nom.avatarUrl)}
                                name={nom.employeeName}
                                size="md"
                              />
                              <div>
                                <div className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                                  {nom.employeeName}
                                  {idx === 0 && (
                                    <NexaBadge variant="amber" className="rounded-full px-2 py-0 text-[10px] font-bold">
                                      Leading
                                    </NexaBadge>
                                  )}
                                </div>
                                <div className="text-[11px] text-[var(--nexa-text-muted)] font-medium">{nom.department}</div>
                              </div>
                            </div>
                            {nom.nominationPitch && (
                              <p className="text-[11px] text-[var(--nexa-text-secondary)] mt-2 line-clamp-2 italic font-medium">
                                "{nom.nominationPitch}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </NexaCard>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: HALL OF FAME ARCHIVE */}
            {activeTab === "HALL_OF_FAME" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[var(--nexa-text-primary)]">Awards Hall of Fame</h3>
                    <p className="text-xs text-[var(--nexa-text-muted)] font-medium">
                      Permanent certified record of official award recipients across past celebration events.
                    </p>
                  </div>
                </div>

                {hallOfFame.length === 0 ? (
                  <div className="p-8 rounded-3xl border border-[var(--nexa-border)] text-center bg-[var(--nexa-bg-surface)]">
                    <Trophy className="w-8 h-8 text-[var(--nexa-text-muted)] mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold text-[var(--nexa-text-primary)]">Hall of Fame is currently empty</p>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] mt-1">
                      Once voting is finalized and you click "Publish to Hall of Fame", winners and citations will be certified here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {hallOfFame.map((win) => (
                      <NexaCard key={win.id} variant="glass" padding="md" className="rounded-3xl hover:border-amber-500/40 transition-all flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none" />
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <NexaBadge variant="amber" className="rounded-full text-xs font-bold">
                              {win.awardYear} Winner
                            </NexaBadge>
                            <span className="text-[10px] font-mono text-[var(--nexa-text-muted)]">
                              {win.certificateNumber}
                            </span>
                          </div>

                          <div className="text-sm font-extrabold text-[var(--nexa-text-primary)]">
                            {win.categoryName}
                          </div>

                          <div className="flex items-center gap-3 pt-2">
                            <NexaAvatar
                              src={resolveAvatarUrl(win.avatarUrl)}
                              name={win.employeeName}
                              size="lg"
                            />
                            <div>
                              <div className="text-xs font-bold text-[var(--nexa-text-primary)]">{win.employeeName}</div>
                              <div className="text-[11px] text-[var(--nexa-text-muted)] font-medium">{win.department}</div>
                              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">{win.designation}</div>
                            </div>
                          </div>

                          {win.citation && (
                            <p className="text-xs text-[var(--nexa-text-secondary)] italic border-l-2 border-amber-500/40 pl-2.5 mt-2">
                              "{win.citation}"
                            </p>
                          )}
                        </div>

                        <div className="pt-3 mt-4 border-t border-[var(--nexa-border)] flex items-center justify-between text-[11px] text-[var(--nexa-text-muted)] font-medium">
                          <span>{win.totalVotesReceived} votes recorded</span>
                          <span className="text-emerald-500 font-bold">✓ Certified</span>
                        </div>
                      </NexaCard>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL 1: CREATE AWARD EVENT */}
      {isCreateEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1A56DB]/15 text-[#1A56DB] flex items-center justify-center font-bold">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--nexa-text-primary)]">Create Award Event</h3>
                  <p className="text-xs text-[var(--nexa-text-muted)] font-medium">Launch a new recognition and voting celebration.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateEventModalOpen(false)}
                className="text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] p-1 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreateEvent} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026 End-of-Year Excellence Awards"
                  value={eventFormData.title}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">Award Year</label>
                  <input
                    type="number"
                    min={2020}
                    max={2035}
                    value={eventFormData.awardYear}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, awardYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">Status</label>
                  <select
                    value={eventFormData.status}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB]"
                  >
                    <option value="ACTIVE">ACTIVE (Voting Open)</option>
                    <option value="DRAFT">DRAFT (Admin Only)</option>
                    <option value="PAUSED">PAUSED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={eventFormData.startDate}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">End Date</label>
                  <input
                    type="date"
                    value={eventFormData.endDate}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">Description</label>
                <textarea
                  placeholder="Summary of this celebration event..."
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--nexa-border)]">
                <NexaButton
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setIsCreateEventModalOpen(false)}
                  className="rounded-full"
                >
                  Cancel
                </NexaButton>
                <NexaButton
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={!eventFormData.title.trim()}
                  className="bg-[#1A56DB] hover:bg-[#1A56DB]/90 text-white rounded-full font-bold shadow-sm"
                >
                  Create Event
                </NexaButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT ACTIVE EVENT */}
      {isEditEventModalOpen && activeEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--nexa-text-primary)]">Edit Award Event</h3>
                  <p className="text-xs text-[var(--nexa-text-muted)] font-medium">Update event metadata, status, and dates.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditEventModalOpen(false)}
                className="text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] p-1 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEditEvent} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={eventFormData.title}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">Status</label>
                  <select
                    value={eventFormData.status}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] font-bold"
                  >
                    <option value="ACTIVE">ACTIVE (Voting Open)</option>
                    <option value="DRAFT">DRAFT (Configuring)</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="FINALIZED">FINALIZED</option>
                    <option value="PUBLISHED">PUBLISHED (Winners Live)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">Award Year</label>
                  <input
                    type="number"
                    value={eventFormData.awardYear}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, awardYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={eventFormData.startDate}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">End Date</label>
                  <input
                    type="date"
                    value={eventFormData.endDate}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">Description</label>
                <textarea
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB]"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--nexa-border)]">
                <NexaButton
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={handleDeleteEvent}
                  className="text-red-500 hover:bg-red-500/10 border-red-500/30 rounded-full"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete Event
                </NexaButton>

                <div className="flex items-center gap-2">
                  <NexaButton
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setIsEditEventModalOpen(false)}
                    className="rounded-full"
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton
                    variant="primary"
                    size="sm"
                    type="submit"
                    className="bg-[#1A56DB] hover:bg-[#1A56DB]/90 text-white rounded-full font-bold shadow-sm"
                  >
                    Save Changes
                  </NexaButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NOMINEE */}
      {isNomineeModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--nexa-text-primary)]">Add Nominee</h3>
                <p className="text-xs text-[var(--nexa-text-muted)] font-medium">Category: {selectedCategory.name}</p>
              </div>
              <button
                onClick={() => setIsNomineeModalOpen(false)}
                className="text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] p-1 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Search Staff Directory</label>
                <div className="relative mt-1">
                  <Search className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by employee name or department..."
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Staff Candidate List */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-[var(--nexa-border)] rounded-2xl p-2 bg-[var(--nexa-bg-base)]">
                {staffCandidates.length === 0 ? (
                  <p className="text-xs text-[var(--nexa-text-muted)] p-3 text-center">No staff found matching query.</p>
                ) : (
                  staffCandidates.slice(0, 10).map((cand) => (
                    <div
                      key={cand.id}
                      onClick={() => setSelectedStaffId(cand.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                        selectedStaffId === cand.id
                          ? "bg-amber-500/15 border border-amber-500/40"
                          : "hover:bg-[var(--nexa-bg-surface)] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <NexaAvatar src={resolveAvatarUrl(cand.avatar)} name={cand.name} size="sm" />
                        <div>
                          <div className="text-xs font-bold text-[var(--nexa-text-primary)]">{cand.name}</div>
                          <div className="text-[10px] text-[var(--nexa-text-muted)] font-medium">{cand.department} • {cand.designation}</div>
                        </div>
                      </div>
                      {selectedStaffId === cand.id && (
                        <CheckCircle2 className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Nomination Statement / Citation</label>
                <textarea
                  placeholder="Explain why this employee deserves to be shortlisted..."
                  value={nominationPitch}
                  onChange={(e) => setNominationPitch(e.target.value)}
                  rows={3}
                  className="w-full mt-1 p-2.5 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--nexa-border)]">
              <NexaButton
                variant="outline"
                size="sm"
                onClick={() => setIsNomineeModalOpen(false)}
                className="rounded-full"
              >
                Cancel
              </NexaButton>
              <NexaButton
                variant="primary"
                size="sm"
                disabled={!selectedStaffId}
                onClick={async () => {
                  const staff = users.find(u => u.id === selectedStaffId);
                  if (staff && selectedCategory && activeEvent) {
                    const res = await createNominee({
                      eventId: activeEvent.id,
                      categoryId: selectedCategory.id,
                      employeeId: staff.id,
                      employeeName: staff.name,
                      department: staff.department || "Operations",
                      designation: staff.designation || "Staff",
                      avatarUrl: staff.avatar || "/character1.jpg",
                      nominationPitch: nominationPitch || "Nominated for outstanding dedication and teamwork.",
                    });
                    if (res?.success) {
                      setIsNomineeModalOpen(false);
                      setSelectedStaffId("");
                      setNominationPitch("");
                      setActionSuccessMsg(`Nominee ${staff.name} successfully added to ${selectedCategory.name}!`);
                      setTimeout(() => setActionSuccessMsg(null), 4000);
                    } else {
                      setActionErrorMsg(res?.error || "Failed to add nominee");
                      setTimeout(() => setActionErrorMsg(null), 4000);
                    }
                  }
                }}
                className="bg-[#1A56DB] hover:bg-[#1A56DB]/90 text-white rounded-full font-bold shadow-sm"
              >
                Save Nominee
              </NexaButton>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD CATEGORY */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--nexa-text-primary)]">Add Award Category</h3>
                  <p className="text-xs text-[var(--nexa-text-muted)] font-medium">Define a new voting category for {activeEvent?.title}.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] p-1 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreateCategory} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Employee of the Year"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">Description</label>
                <textarea
                  placeholder="Brief description of this recognition award..."
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">Evaluation Criteria</label>
                <textarea
                  placeholder="What accomplishments or qualities should voters consider?"
                  value={categoryFormData.criteria}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, criteria: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">Max Winners Allowed</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={categoryFormData.maxWinners}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, maxWinners: parseInt(e.target.value) || 1 }))}
                  className="w-24 px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-amber-500 transition-colors font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--nexa-border)]">
                <NexaButton
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="rounded-full"
                >
                  Cancel
                </NexaButton>
                <NexaButton
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={!categoryFormData.name.trim()}
                  className="bg-[#1A56DB] hover:bg-[#1A56DB]/90 text-white rounded-full font-bold shadow-sm"
                >
                  Create Category
                </NexaButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT CATEGORY */}
      {isEditCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--nexa-text-primary)]">Edit Award Category</h3>
                  <p className="text-xs text-[var(--nexa-text-muted)] font-medium">Update details and rules for this award.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditCategoryModalOpen(false);
                  setEditingCategory(null);
                }}
                className="text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] p-1 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEditCategory} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">Description</label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">Evaluation Criteria</label>
                <textarea
                  value={categoryFormData.criteria}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, criteria: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">Max Winners Allowed</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={categoryFormData.maxWinners}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, maxWinners: parseInt(e.target.value) || 1 }))}
                  className="w-24 px-3 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-amber-500 transition-colors font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--nexa-border)]">
                <NexaButton
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setIsEditCategoryModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="rounded-full"
                >
                  Cancel
                </NexaButton>
                <NexaButton
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={!categoryFormData.name.trim()}
                  className="bg-[#1A56DB] hover:bg-[#1A56DB]/90 text-white rounded-full font-bold shadow-sm"
                >
                  Save Changes
                </NexaButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </BusinessShell>
  );
}
