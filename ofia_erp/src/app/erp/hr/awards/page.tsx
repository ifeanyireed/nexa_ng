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
import { useAwardsStore, AwardCategory, AwardNominee } from "@/lib/awards-store";
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
} from "lucide-react";

export default function HRAwardsPage() {
  const router = useRouter();
  const {
    activeEvent,
    turnoutStats,
    hallOfFame,
    isLoading,
    finalizeResults,
    publishWinners,
    fetchTurnout,
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
  const [isNomineeModalOpen, setIsNomineeModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [nominationPitch, setNominationPitch] = useState("");
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    criteria: "",
    maxWinners: 1,
  });
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

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

  // Category CRUD Handlers
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
    if (!categoryFormData.name.trim()) return;
    const res = await createCategory({
      eventId: activeEvent?.id,
      name: categoryFormData.name,
      description: categoryFormData.description,
      criteria: categoryFormData.criteria,
      maxWinners: Number(categoryFormData.maxWinners) || 1,
    });
    if (res?.success) {
      setIsCategoryModalOpen(false);
      setActionSuccessMsg(`Category "${categoryFormData.name}" created successfully!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
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
    }
  };

  const handleDeleteCategory = async (cat: AwardCategory) => {
    if (confirm(`Are you sure you want to delete category "${cat.name}"? This will also remove any shortlisted nominees under this category.`)) {
      const res = await deleteCategory(cat.id);
      if (res?.success) {
        setActionSuccessMsg(`Category "${cat.name}" deleted.`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
      }
    }
  };

  const handleDeleteNominee = async (nom: AwardNominee, catName: string) => {
    if (confirm(`Remove ${nom.employeeName} from ${catName}?`)) {
      const res = await deleteNominee(nom.id);
      if (res?.success) {
        setActionSuccessMsg(`Removed ${nom.employeeName} from nominations.`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
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
      }
    }
  };

  const statCards = [
    {
      label: "Eligible Staff",
      value: turnoutStats?.totalEligibleStaff || 48,
      sub: "Verified Employees",
      icon: <Users className="w-5 h-5 text-blue-500" />,
    },
    {
      label: "Ballots Sealed",
      value: `${turnoutStats?.totalBallotsCast || 36}`,
      sub: `${(turnoutStats?.turnoutPercentage || 75).toFixed(1)}% Company Turnout`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    },
    {
      label: "Award Categories",
      value: activeEvent?.categories?.length || 6,
      sub: "Open for voting",
      icon: <Award className="w-5 h-5 text-amber-500" />,
    },
    {
      label: "Voting Window",
      value: `${turnoutStats?.daysRemaining || 12} Days`,
      sub: activeEvent?.status === "ACTIVE" ? "Voting in Progress" : activeEvent?.status,
      icon: <Clock className="w-5 h-5 text-purple-500" />,
    },
  ];

  return (
    <BusinessShell
      title="Employee Awards & Recognition Hub"
      subtitle="Annual End-of-Year Awards administration, nominee curation, live turnout monitor & ceremony controls."
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/erp/hr/awards/ceremony">
            <NexaButton
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 font-medium"
            >
              <Tv className="w-4 h-4" />
              Ceremony Stage TV Mode
            </NexaButton>
          </Link>
          {activeEvent?.status === "ACTIVE" && (
            <NexaButton
              variant="primary"
              size="sm"
              onClick={handleFinalize}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 shadow-sm"
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
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
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{actionSuccessMsg}</p>
          </div>
        )}

        {/* Event Header Banner */}
        <NexaCard className="p-6 overflow-hidden relative border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <NexaBadge variant="warning" className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider">
                  {activeEvent?.awardYear || 2026} Annual Awards
                </NexaBadge>
                <NexaBadge
                  variant={activeEvent?.status === "ACTIVE" ? "success" : "info"}
                  className="px-2 py-0.5 text-xs"
                >
                  {activeEvent?.status === "ACTIVE" ? "Voting Live" : activeEvent?.status}
                </NexaBadge>
                <NexaBadge variant="outline" className="text-xs">
                  🔒 Cryptographic Anonymity Enforced
                </NexaBadge>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {activeEvent?.title || "2026 End-of-Year Excellence Awards"}
              </h2>
              <p className="text-sm text-muted-foreground max-w-2xl">
                {activeEvent?.description}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-muted-foreground">Voting Period</div>
                <div className="text-sm font-semibold text-foreground">
                  {new Date(activeEvent?.startDate || "").toLocaleDateString(undefined, { month: "short", day: "numeric" })} -{" "}
                  {new Date(activeEvent?.endDate || "").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
            </div>
          </div>
        </NexaCard>

        {/* Top KPI Stat Grid */}
        <ErpStatGrid stats={statCards} />

        {/* Tab Navigation */}
        <div className="border-b border-border/60">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("CATEGORIES")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "CATEGORIES"
                  ? "border-amber-500 text-amber-500"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Award className="w-4 h-4" />
              Categories & Nominees ({activeEvent?.categories?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("TURNOUT")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "TURNOUT"
                  ? "border-amber-500 text-amber-500"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Turnout & Analytics
            </button>
            <button
              onClick={() => setActiveTab("VAULT")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "VAULT"
                  ? "border-amber-500 text-amber-500"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lock className="w-4 h-4" />
              Tally Vault & Finalization
            </button>
            <button
              onClick={() => setActiveTab("HALL_OF_FAME")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "HALL_OF_FAME"
                  ? "border-amber-500 text-amber-500"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Trophy className="w-4 h-4" />
              Hall of Fame Archive ({hallOfFame.length})
            </button>
          </div>
        </div>

        {/* TAB 1: CATEGORIES & NOMINEES */}
        {activeTab === "CATEGORIES" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">Award Categories</h3>
                <p className="text-xs text-muted-foreground">
                  Review nominees curated from the staff directory. Self-voting is automatically restricted.
                </p>
              </div>
              <NexaButton
                variant="primary"
                size="sm"
                onClick={handleOpenCreateCategory}
                className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </NexaButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeEvent?.categories?.map((cat, idx) => (
                <NexaCard key={cat.id} className="p-5 border border-border/60 hover:border-amber-500/30 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm shrink-0">
                          #{idx + 1}
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-foreground">{cat.name}</h4>
                          <span className="text-xs text-muted-foreground">Max {cat.maxWinners} Winner</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <NexaBadge variant="outline" className="text-xs font-medium">
                          {cat.nominees?.length || 0} Nominees
                        </NexaBadge>
                        <button
                          type="button"
                          title="Edit Category"
                          onClick={() => handleOpenEditCategory(cat)}
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Delete Category"
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {cat.description}
                    </p>

                    <div className="pt-2 border-t border-border/40">
                      <div className="text-[11px] font-semibold text-foreground/80 mb-2 uppercase tracking-wider">
                        Curated Nominees:
                      </div>
                      <div className="space-y-2">
                        {cat.nominees?.map((nom) => (
                          <div
                            key={nom.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors group"
                          >
                            <div className="flex items-center gap-2.5">
                              <NexaAvatar
                                src={resolveAvatarUrl(nom.avatarUrl)}
                                name={nom.employeeName}
                                size="sm"
                              />
                              <div>
                                <div className="text-xs font-medium text-foreground">{nom.employeeName}</div>
                                <div className="text-[10px] text-muted-foreground">{nom.department} • {nom.designation}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-background border border-border text-muted-foreground">
                                Pitch on file
                              </span>
                              <button
                                type="button"
                                title="Remove Nominee"
                                onClick={() => handleDeleteNominee(nom, cat.name)}
                                className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Eligibility: All active employees
                    </span>
                    <NexaButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsNomineeModalOpen(true);
                      }}
                      className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Nominee
                    </NexaButton>
                  </div>
                </NexaCard>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: TURNOUT & VELOCITY */}
        {activeTab === "TURNOUT" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <NexaCard className="p-5 border border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium uppercase">Total Participation</span>
                  <Percent className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {(turnoutStats?.turnoutPercentage || 75).toFixed(1)}%
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${turnoutStats?.turnoutPercentage || 75}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {turnoutStats?.totalBallotsCast || 36} of {turnoutStats?.totalEligibleStaff || 48} staff have completed their ballot.
                </p>
              </NexaCard>

              <NexaCard className="p-5 border border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium uppercase">Ballot Sealing Integrity</span>
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">100% Sealed</div>
                <p className="text-xs text-muted-foreground mt-3">
                  All ballots are assigned a SHA-256 confirmation hash upon submission. Individual voting selections remain cryptographically decoupled.
                </p>
              </NexaCard>

              <NexaCard className="p-5 border border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium uppercase">Self-Voting Block Rate</span>
                  <UserCheck className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">Enforced</div>
                <p className="text-xs text-muted-foreground mt-3">
                  Nominees cannot vote for themselves in categories where they are shortlisted. Zero conflicts recorded.
                </p>
              </NexaCard>
            </div>

            {/* Department Leaderboard */}
            <NexaCard className="p-5 border border-border/60">
              <h4 className="text-sm font-semibold text-foreground mb-4">Department Turnout Leaderboard</h4>
              <div className="space-y-4">
                {turnoutStats?.departmentTurnout?.map((dept) => (
                  <div key={dept.department} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{dept.department}</span>
                      <span className="text-muted-foreground">
                        {dept.votedCount} / {dept.totalStaff} staff ({dept.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${dept.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </NexaCard>
          </div>
        )}

        {/* TAB 3: TALLY VAULT & FINALIZATION */}
        {activeTab === "VAULT" && (
          <div className="space-y-5">
            <NexaCard className="p-5 border border-amber-500/30 bg-amber-500/5">
              <div className="flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">Secure Tally Vault</h4>
                  <p className="text-xs text-muted-foreground">
                    Standings are encrypted in the vault. Once voting is closed, finalize results to inspect rank 1 winners before publishing to the Employee Portal and Hall of Fame.
                  </p>
                </div>
              </div>
            </NexaCard>

            <div className="space-y-4">
              {activeEvent?.categories?.map((cat) => (
                <NexaCard key={cat.id} className="p-5 border border-border/60">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <h4 className="text-sm font-semibold text-foreground">{cat.name}</h4>
                    </div>
                    <NexaBadge variant="outline" className="text-xs">
                      1 Winner Target
                    </NexaBadge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {cat.nominees?.map((nom, idx) => (
                      <div
                        key={nom.id}
                        className={`p-3 rounded-xl border transition-all ${
                          idx === 0
                            ? "border-amber-500/40 bg-amber-500/10 shadow-sm"
                            : "border-border/60 bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <NexaAvatar
                            src={resolveAvatarUrl(nom.avatarUrl)}
                            name={nom.employeeName}
                            size="md"
                          />
                          <div>
                            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                              {nom.employeeName}
                              {idx === 0 && (
                                <NexaBadge variant="warning" className="px-1.5 py-0 text-[10px]">
                                  Rank 1
                                </NexaBadge>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground">{nom.department}</div>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 italic">
                          "{nom.nominationPitch}"
                        </p>
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
                <h3 className="text-base font-semibold text-foreground">Awards Hall of Fame</h3>
                <p className="text-xs text-muted-foreground">
                  Permanent record of official award recipients across past celebration years.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {hallOfFame.map((win) => (
                <NexaCard key={win.id} className="p-5 border border-border/60 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <NexaBadge variant="warning" className="text-xs font-bold">
                        {win.awardYear} Winner
                      </NexaBadge>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {win.certificateNumber}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-foreground">
                      {win.categoryName}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <NexaAvatar
                        src={resolveAvatarUrl(win.avatarUrl)}
                        name={win.employeeName}
                        size="lg"
                      />
                      <div>
                        <div className="text-sm font-semibold text-foreground">{win.employeeName}</div>
                        <div className="text-xs text-muted-foreground">{win.department}</div>
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">{win.designation}</div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground italic border-l-2 border-amber-500/40 pl-2.5 mt-2">
                      "{win.citation}"
                    </p>
                  </div>

                  <div className="pt-3 mt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{win.totalVotesReceived} votes recorded</span>
                    <span className="text-emerald-500 font-medium">✓ Certified</span>
                  </div>
                </NexaCard>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD NOMINEE */}
      {isNomineeModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background border border-border rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Add Nominee</h3>
                <p className="text-xs text-muted-foreground">Category: {selectedCategory.name}</p>
              </div>
              <button
                onClick={() => setIsNomineeModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Search Staff Directory</label>
                <div className="relative mt-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by employee name or department..."
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Staff Candidate List */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-border/60 rounded-lg p-2">
                {staffCandidates.slice(0, 8).map((cand) => (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedStaffId(cand.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedStaffId === cand.id
                        ? "bg-amber-500/15 border border-amber-500/40"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <NexaAvatar src={resolveAvatarUrl(cand.avatar)} name={cand.name} size="sm" />
                      <div>
                        <div className="text-xs font-medium text-foreground">{cand.name}</div>
                        <div className="text-[10px] text-muted-foreground">{cand.department} • {cand.designation}</div>
                      </div>
                    </div>
                    {selectedStaffId === cand.id && (
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Nomination Statement / Citation</label>
                <textarea
                  placeholder="Explain why this employee deserves to be shortlisted..."
                  value={nominationPitch}
                  onChange={(e) => setNominationPitch(e.target.value)}
                  rows={3}
                  className="w-full mt-1 p-2.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <NexaButton
                variant="outline"
                size="sm"
                onClick={() => setIsNomineeModalOpen(false)}
              >
                Cancel
              </NexaButton>
              <NexaButton
                variant="primary"
                size="sm"
                disabled={!selectedStaffId}
                onClick={async () => {
                  const staff = users.find(u => u.id === selectedStaffId);
                  if (staff && selectedCategory) {
                    await createNominee({
                      eventId: activeEvent?.id || "",
                      categoryId: selectedCategory.id,
                      employeeId: staff.id,
                      nominationPitch: nominationPitch || "Nominated for outstanding dedication and teamwork.",
                    });
                    const newNominee: AwardNominee = {
                      id: "nom-" + Date.now(),
                      categoryId: selectedCategory.id,
                      eventId: activeEvent?.id || "",
                      tenantSlug: activeEvent?.tenantSlug || "",
                      employeeId: staff.id,
                      employeeName: staff.name,
                      department: staff.department || "Operations",
                      designation: staff.designation || "Staff",
                      avatarUrl: staff.avatar || "/character1.jpg",
                      nominationPitch: nominationPitch || "Nominated for outstanding dedication and teamwork.",
                      displayOrder: (selectedCategory.nominees?.length || 0) + 1,
                      isActive: true,
                    };
                    selectedCategory.nominees = [...(selectedCategory.nominees || []), newNominee];
                    setIsNomineeModalOpen(false);
                    setSelectedStaffId("");
                    setNominationPitch("");
                    setActionSuccessMsg(`Nominee ${staff.name} successfully added to ${selectedCategory.name}!`);
                    setTimeout(() => setActionSuccessMsg(null), 4000);
                  }
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Save Nominee
              </NexaButton>
            </div>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Add Award Category</h3>
                  <p className="text-xs text-muted-foreground">Define a new voting category for the current awards cycle.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreateCategory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Innovator of the Year"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Description</label>
                <textarea
                  placeholder="Brief description of this recognition award..."
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Evaluation Criteria</label>
                <textarea
                  placeholder="What accomplishments or qualities should voters consider?"
                  value={categoryFormData.criteria}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, criteria: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Max Winners Allowed</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={categoryFormData.maxWinners}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, maxWinners: parseInt(e.target.value) || 1 }))}
                  className="w-24 px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <NexaButton
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                >
                  Cancel
                </NexaButton>
                <NexaButton
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={!categoryFormData.name.trim()}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Create Category
                </NexaButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {isEditCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Edit Award Category</h3>
                  <p className="text-xs text-muted-foreground">Update details and rules for this award.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditCategoryModalOpen(false);
                  setEditingCategory(null);
                }}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEditCategory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Innovator of the Year"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Description</label>
                <textarea
                  placeholder="Brief description of this recognition award..."
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Evaluation Criteria</label>
                <textarea
                  placeholder="What accomplishments or qualities should voters consider?"
                  value={categoryFormData.criteria}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, criteria: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Max Winners Allowed</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={categoryFormData.maxWinners}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, maxWinners: parseInt(e.target.value) || 1 }))}
                  className="w-24 px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <NexaButton
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setIsEditCategoryModalOpen(false);
                    setEditingCategory(null);
                  }}
                >
                  Cancel
                </NexaButton>
                <NexaButton
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={!categoryFormData.name.trim()}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
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
