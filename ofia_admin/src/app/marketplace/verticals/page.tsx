"use client";

import React, { useState } from "react";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import {
  INITIAL_COMPASS_VERTICALS,
  INITIAL_COMPASS_SUBCATEGORIES,
  LAYOUT_TEMPLATES_CATALOG,
  VerticalSector,
  SubcategoryItem,
  VerticalLayoutTemplate,
} from "@/lib/verticals-data";
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  Globe,
  SlidersHorizontal,
  ExternalLink,
  Edit2,
  Eye,
  Zap,
  Scissors,
  Home,
  Building2,
  Sparkles,
  HeartPulse,
  Briefcase,
  GraduationCap,
  Car,
  Truck,
  UtensilsCrossed,
  MapPin,
  ShieldCheck,
  X,
} from "lucide-react";

export default function VerticalsAndSubcategoriesPage() {
  const [activeTab, setActiveTab] = useState<"subcategories" | "verticals" | "layouts">("subcategories");
  const [verticals, setVerticals] = useState<VerticalSector[]>(INITIAL_COMPASS_VERTICALS);
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>(INITIAL_COMPASS_SUBCATEGORIES);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParentVertical, setSelectedParentVertical] = useState<string>("ALL");
  const [filterRecurringOnly, setFilterRecurringOnly] = useState(false);
  const [selectedLayoutFilter, setSelectedLayoutFilter] = useState<string>("ALL");

  // Edit / Add Subcategory Modal State
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<SubcategoryItem | null>(null);

  // Form states
  const [subName, setSubName] = useState("");
  const [subSlug, setSubSlug] = useState("");
  const [subParentSlug, setSubParentSlug] = useState("home-services");
  const [subLayout, setSubLayout] = useState<VerticalLayoutTemplate>("TECHNICAL_ESTIMATE_QUOTE");
  const [subHighRecurring, setSubHighRecurring] = useState(false);
  const [subRecurringTag, setSubRecurringTag] = useState("");
  const [subCommission, setSubCommission] = useState(8.0);
  const [subDescription, setSubDescription] = useState("");
  const [subSeoTitle, setSubSeoTitle] = useState("");
  const [subSeoDesc, setSubSeoDesc] = useState("");
  const [subSubdomain, setSubSubdomain] = useState(true);

  // Layout Template Preview Modal State
  const [previewTemplate, setPreviewTemplate] = useState<VerticalLayoutTemplate | null>(null);

  // KPI Metrics Calculation
  const totalSubcats = subcategories.length;
  const totalVerts = verticals.length;
  const highRecurringCount = subcategories.filter((s) => s.highRecurring).length;
  const activeSubdomainsCount = subcategories.filter((s) => s.subdomainEnabled).length;

  // Filter Subcategories
  const filteredSubcategories = subcategories.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.parentVerticalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesVertical =
      selectedParentVertical === "ALL" || sub.parentVerticalSlug === selectedParentVertical;

    const matchesRecurring = !filterRecurringOnly || sub.highRecurring;

    const matchesLayout =
      selectedLayoutFilter === "ALL" || sub.layoutTemplate === selectedLayoutFilter;

    return matchesSearch && matchesVertical && matchesRecurring && matchesLayout;
  });

  const openAddSubcategoryModal = () => {
    setEditingSubcategory(null);
    setSubName("");
    setSubSlug("");
    setSubParentSlug("home-services");
    setSubLayout("TECHNICAL_ESTIMATE_QUOTE");
    setSubHighRecurring(false);
    setSubRecurringTag("");
    setSubCommission(8.0);
    setSubDescription("");
    setSubSeoTitle("");
    setSubSeoDesc("");
    setSubSubdomain(true);
    setIsSubcategoryModalOpen(true);
  };

  const openEditSubcategoryModal = (sub: SubcategoryItem) => {
    setEditingSubcategory(sub);
    setSubName(sub.name);
    setSubSlug(sub.slug);
    setSubParentSlug(sub.parentVerticalSlug);
    setSubLayout(sub.layoutTemplate);
    setSubHighRecurring(sub.highRecurring);
    setSubRecurringTag(sub.recurringTag || "");
    setSubCommission(sub.commissionRate);
    setSubDescription(sub.description);
    setSubSeoTitle(sub.seoMetaTitle);
    setSubSeoDesc(sub.seoMetaDescription);
    setSubSubdomain(sub.subdomainEnabled);
    setIsSubcategoryModalOpen(true);
  };

  const handleSaveSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName || !subSlug) return;

    const parentVert = verticals.find((v) => v.slug === subParentSlug);
    const parentName = parentVert ? parentVert.name : "Home & Maintenance";

    if (editingSubcategory) {
      // Update
      setSubcategories((prev) =>
        prev.map((item) =>
          item.id === editingSubcategory.id
            ? {
                ...item,
                name: subName,
                slug: subSlug.toLowerCase().trim(),
                parentVerticalSlug: subParentSlug,
                parentVerticalName: parentName,
                layoutTemplate: subLayout,
                highRecurring: subHighRecurring,
                recurringTag: subHighRecurring ? subRecurringTag : undefined,
                commissionRate: Number(subCommission),
                description: subDescription,
                seoMetaTitle: subSeoTitle,
                seoMetaDescription: subSeoDesc,
                subdomainEnabled: subSubdomain,
              }
            : item
        )
      );
    } else {
      // Add new
      const newItem: SubcategoryItem = {
        id: `sub-${Date.now()}`,
        name: subName,
        slug: subSlug.toLowerCase().trim(),
        parentVerticalSlug: subParentSlug,
        parentVerticalName: parentName,
        layoutTemplate: subLayout,
        highRecurring: subHighRecurring,
        recurringTag: subHighRecurring ? subRecurringTag : undefined,
        commissionRate: Number(subCommission),
        description: subDescription || `Comprehensive ${subName} services on Ofia Compass.`,
        servicesCount: 4,
        services: [`${subName} Specialist Finder`],
        activeMerchants: 12,
        monthlyBookings: 150,
        status: "ACTIVE",
        seoMetaTitle: subSeoTitle || `${subName} Services in Nigeria | Ofia Compass`,
        seoMetaDescription: subSeoDesc || `Find verified ${subName} providers on Ofia Compass.`,
        subdomainEnabled: subSubdomain,
      };
      setSubcategories([newItem, ...subcategories]);
    }

    setIsSubcategoryModalOpen(false);
  };

  const handleInlineLayoutChange = (subId: string, newLayout: VerticalLayoutTemplate) => {
    setSubcategories((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, layoutTemplate: newLayout } : s))
    );
  };

  const handleInlineCommissionChange = (subId: string, newRate: number) => {
    setSubcategories((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, commissionRate: newRate } : s))
    );
  };

  const handleToggleSubdomain = (subId: string) => {
    setSubcategories((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, subdomainEnabled: !s.subdomainEnabled } : s))
    );
  };

  const getVerticalIcon = (iconName: string) => {
    switch (iconName) {
      case "Home":
        return <Home className="w-5 h-5" />;
      case "Scissors":
        return <Scissors className="w-5 h-5" />;
      case "Briefcase":
        return <Briefcase className="w-5 h-5" />;
      case "GraduationCap":
        return <GraduationCap className="w-5 h-5" />;
      case "Sparkles":
        return <Sparkles className="w-5 h-5" />;
      case "HeartPulse":
        return <HeartPulse className="w-5 h-5" />;
      case "Truck":
        return <Truck className="w-5 h-5" />;
      case "Car":
        return <Car className="w-5 h-5" />;
      case "UtensilsCrossed":
        return <UtensilsCrossed className="w-5 h-5" />;
      case "Building2":
        return <Building2 className="w-5 h-5" />;
      default:
        return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <SuperAdminShell
      title="Verticals & Subcategories Manager"
      subtitle="Configure master marketplace sectors, SEO one-word slugs, subdomain routing, and high-recurring vertical transaction layouts."
      action={
        <div className="flex items-center gap-2">
          <NexaButton
            size="sm"
            variant="outline"
            onClick={() => setActiveTab("layouts")}
            leftIcon={<Eye className="w-4 h-4 text-[#1A56DB]" />}
            className="bg-white dark:bg-slate-900 border-[var(--nexa-border)]"
          >
            Layout Catalog
          </NexaButton>
          <NexaButton
            size="sm"
            variant="primary"
            onClick={openAddSubcategoryModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-[#1A56DB] text-white"
          >
            Add Subcategory
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6 font-sans">
        {/* KPI SUMMARY METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NexaCard className="p-4 border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--nexa-text-muted)] uppercase tracking-wider">
                Master Verticals
              </span>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#1A56DB]">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[var(--nexa-text-primary)] mt-2">
              {totalVerts} Sectors
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Operational Status
            </div>
          </NexaCard>

          <NexaCard className="p-4 border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--nexa-text-muted)] uppercase tracking-wider">
                Subcategory Groups
              </span>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[var(--nexa-text-primary)] mt-2">
              {totalSubcats} Subcategories
            </div>
            <div className="text-xs text-[var(--nexa-text-muted)] mt-1">
              All mapped to 1-word SEO slugs
            </div>
          </NexaCard>

          <NexaCard className="p-4 border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--nexa-text-muted)] uppercase tracking-wider">
                High-Recurring Verticals
              </span>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[var(--nexa-text-primary)] mt-2">
              {highRecurringCount} Verticals
            </div>
            <div className="text-xs text-amber-600 font-medium mt-1">
              Specialized fast transaction UX
            </div>
          </NexaCard>

          <NexaCard className="p-4 border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--nexa-text-muted)] uppercase tracking-wider">
                Edge Subdomains
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[var(--nexa-text-primary)] mt-2">
              {activeSubdomainsCount} / {totalSubcats} Live
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              {"{slug}.ofia.ng"} edge rewrite
            </div>
          </NexaCard>
        </div>

        {/* NAVIGATION PILL TABS */}
        <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("subcategories")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === "subcategories"
                  ? "bg-[#1A56DB] text-white shadow-xs"
                  : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-surface)]"
              }`}
            >
              <Globe className="w-4 h-4" />
              Subcategories Directory ({subcategories.length})
            </button>
            <button
              onClick={() => setActiveTab("verticals")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === "verticals"
                  ? "bg-[#1A56DB] text-white shadow-xs"
                  : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-surface)]"
              }`}
            >
              <Layers className="w-4 h-4" />
              Master Verticals (10 Sectors)
            </button>
            <button
              onClick={() => setActiveTab("layouts")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === "layouts"
                  ? "bg-[#1A56DB] text-white shadow-xs"
                  : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-surface)]"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Layout Engine & Recurring UX
            </button>
          </div>
        </div>

        {/* TAB 1: SUBCATEGORIES MANAGER */}
        {activeTab === "subcategories" && (
          <div className="space-y-4">
            {/* FILTER BAR */}
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-[var(--nexa-bg-surface)] p-3 rounded-xl border border-[var(--nexa-border)]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nexa-text-muted)]" />
                <input
                  type="text"
                  placeholder="Search subcategory by name, one-word slug, service tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-[var(--nexa-text-primary)] placeholder-[var(--nexa-text-muted)] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/20 focus:border-[#1A56DB]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Parent Vertical Selector */}
                <select
                  value={selectedParentVertical}
                  onChange={(e) => setSelectedParentVertical(e.target.value)}
                  aria-label="Filter by Master Vertical"
                  className="py-2 px-3 text-xs font-medium bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-[var(--nexa-text-primary)] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]"
                >
                  <option value="ALL">All Master Verticals</option>
                  {verticals.map((v) => (
                    <option key={v.slug} value={v.slug}>
                      {v.name}
                    </option>
                  ))}
                </select>

                {/* Layout Template Selector */}
                <select
                  value={selectedLayoutFilter}
                  onChange={(e) => setSelectedLayoutFilter(e.target.value)}
                  aria-label="Filter by Layout Template"
                  className="py-2 px-3 text-xs font-medium bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-[var(--nexa-text-primary)] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]"
                >
                  <option value="ALL">All Layout Templates</option>
                  {Object.entries(LAYOUT_TEMPLATES_CATALOG).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </select>

                {/* High Recurring Filter Button */}
                <button
                  onClick={() => setFilterRecurringOnly(!filterRecurringOnly)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                    filterRecurringOnly
                      ? "bg-amber-500/10 border-amber-500 text-amber-600 font-bold"
                      : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  High-Recurring Only
                </button>
              </div>
            </div>

            {/* SUBCATEGORIES TABLE */}
            <div className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--nexa-bg-base)]/70 text-[var(--nexa-text-muted)] text-[11px] font-semibold uppercase tracking-wider border-b border-[var(--nexa-border)]">
                    <tr>
                      <th className="py-3 px-4">Subcategory & Slug</th>
                      <th className="py-3 px-3">Parent Vertical</th>
                      <th className="py-3 px-3">Transaction Layout UX</th>
                      <th className="py-3 px-3">Cadence & Recurring</th>
                      <th className="py-3 px-3">Commission</th>
                      <th className="py-3 px-3">Merchants & Volume</th>
                      <th className="py-3 px-3 text-center">Subdomain</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
                    {filteredSubcategories.map((sub) => {
                      return (
                        <tr
                          key={sub.id}
                          className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors"
                        >
                          {/* Name & Slug */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                              {sub.name}
                              {sub.highRecurring && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                  HOT
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-xs text-[#1A56DB] bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/40">
                                /{sub.slug}
                              </span>
                              <span className="text-[11px] text-[var(--nexa-text-muted)]">
                                {sub.servicesCount} services
                              </span>
                            </div>
                          </td>

                          {/* Parent Vertical */}
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-[var(--nexa-text-primary)]">
                              {sub.parentVerticalName}
                            </span>
                          </td>

                          {/* Layout Template Selector */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <select
                                value={sub.layoutTemplate}
                                onChange={(e) =>
                                  handleInlineLayoutChange(
                                    sub.id,
                                    e.target.value as VerticalLayoutTemplate
                                  )
                                }
                                aria-label={`Select layout for ${sub.name}`}
                                className="text-xs font-medium py-1 px-2 rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]"
                              >
                                {Object.entries(LAYOUT_TEMPLATES_CATALOG).map(([key, meta]) => (
                                  <option key={key} value={key}>
                                    {meta.badge} — {meta.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => setPreviewTemplate(sub.layoutTemplate)}
                                className="p-1 text-[var(--nexa-text-muted)] hover:text-[#1A56DB] transition-colors"
                                title="Preview Layout Template"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* High Recurring Tag */}
                          <td className="py-3 px-3">
                            {sub.highRecurring ? (
                              <div className="flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                                  {sub.recurringTag || "Recurring"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-[var(--nexa-text-muted)]">
                                On-Demand / Quote
                              </span>
                            )}
                          </td>

                          {/* Commission Rate */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="30"
                                value={sub.commissionRate}
                                onChange={(e) =>
                                  handleInlineCommissionChange(sub.id, parseFloat(e.target.value) || 0)
                                }
                                aria-label={`Commission rate for ${sub.name}`}
                                className="w-14 py-1 px-1.5 text-xs font-mono text-center bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-md text-[var(--nexa-text-primary)]"
                              />
                              <span className="text-xs text-[var(--nexa-text-muted)] font-mono">%</span>
                            </div>
                          </td>

                          {/* Merchants & Volume */}
                          <td className="py-3 px-3">
                            <div className="text-xs font-semibold text-[var(--nexa-text-primary)]">
                              {sub.activeMerchants} pros
                            </div>
                            <div className="text-[11px] text-[var(--nexa-text-muted)]">
                              {sub.monthlyBookings.toLocaleString()} orders/mo
                            </div>
                          </td>

                          {/* Subdomain Switcher */}
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleToggleSubdomain(sub.id)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold transition-colors ${
                                sub.subdomainEnabled
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                              }`}
                              title={
                                sub.subdomainEnabled
                                  ? `Live at https://${sub.slug}.ofia.ng`
                                  : "Subdomain disabled"
                              }
                            >
                              <Globe className="w-3 h-3" />
                              {sub.subdomainEnabled ? `${sub.slug}.ofia` : "Disabled"}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditSubcategoryModal(sub)}
                                className="p-1.5 text-slate-500 hover:text-[#1A56DB] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="Edit Subcategory Details"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <a
                                href={`https://${sub.slug}.ofia.ng`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title={`Open ${sub.slug}.ofia.ng`}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MASTER VERTICALS (10 SECTORS) */}
        {activeTab === "verticals" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verticals.map((vert) => {
              const childSubcats = subcategories.filter((s) => s.parentVerticalSlug === vert.slug);

              return (
                <NexaCard
                  key={vert.id}
                  className="p-5 border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:border-[#1A56DB]/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                          style={{ backgroundColor: vert.color }}
                        >
                          {getVerticalIcon(vert.iconName)}
                        </div>
                        <div>
                          <h3 className="font-bold text-[var(--nexa-text-primary)] text-base">
                            {vert.name}
                          </h3>
                          <span className="font-mono text-xs text-[#1A56DB]">
                            /{vert.slug}
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {vert.status}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[var(--nexa-text-muted)] mt-3 leading-relaxed">
                      {vert.description}
                    </p>

                    {/* Subcategories Chips */}
                    <div className="mt-4 pt-3 border-t border-[var(--nexa-border)]">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nexa-text-muted)] mb-2">
                        Subcategory Niches ({childSubcats.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {childSubcats.map((c) => (
                          <span
                            key={c.slug}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-mono text-[var(--nexa-text-primary)]"
                          >
                            /{c.slug}
                            {c.highRecurring && <Zap className="w-2.5 h-2.5 text-amber-500" />}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="mt-5 pt-3 border-t border-[var(--nexa-border)] flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)]">Monthly GMV</div>
                      <div className="text-sm font-bold text-[var(--nexa-text-primary)]">
                        {vert.monthlyGMV}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-[var(--nexa-text-muted)]">Active Pros</div>
                      <div className="text-sm font-bold text-emerald-600">
                        {vert.activeMerchants} Vetted Pros
                      </div>
                    </div>
                  </div>
                </NexaCard>
              );
            })}
          </div>
        )}

        {/* TAB 3: LAYOUT ENGINE & HIGH-RECURRING VERTICALS */}
        {activeTab === "layouts" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-[#1A56DB] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                    Ofia High-Recurring Vertical Transaction Engine
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                    High-recurring verticals (Food, Hotels, Rides, Dispatch, Beauty, Apartments, Cars, Laundry, Tutors, Autocare, Properties) require tailored UX layouts rather than generic directory listings. Below are the 7 active layout blueprints currently powering Ofia Compass.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(LAYOUT_TEMPLATES_CATALOG).map(([key, meta]) => {
                const assignedSubcats = subcategories.filter(
                  (s) => s.layoutTemplate === (key as VerticalLayoutTemplate)
                );

                return (
                  <NexaCard
                    key={key}
                    className="p-5 border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className="px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-xs"
                          style={{ backgroundColor: meta.color }}
                        >
                          {meta.badge}
                        </span>
                        <button
                          onClick={() => setPreviewTemplate(key as VerticalLayoutTemplate)}
                          className="text-xs font-semibold text-[#1A56DB] hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Wireframe
                        </button>
                      </div>

                      <h3 className="font-bold text-[var(--nexa-text-primary)] text-base mt-3">
                        {meta.label}
                      </h3>
                      <p className="text-xs text-[var(--nexa-text-muted)] mt-1.5 leading-relaxed">
                        {meta.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-[var(--nexa-border)] space-y-1.5">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nexa-text-muted)]">
                          Core UX Features:
                        </div>
                        {meta.features.map((feat, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-[var(--nexa-text-primary)] flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            {feat}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[var(--nexa-border)]">
                      <div className="text-[11px] text-[var(--nexa-text-muted)] mb-1.5">
                        Assigned Subcategories ({assignedSubcats.length}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {assignedSubcats.map((s) => (
                          <span
                            key={s.slug}
                            className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[#1A56DB]"
                          >
                            /{s.slug}
                          </span>
                        ))}
                      </div>
                    </div>
                  </NexaCard>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT SUBCATEGORY */}
        {isSubcategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsSubcategoryModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-bold text-[var(--nexa-text-primary)] mb-1">
                {editingSubcategory ? "Edit Subcategory Configuration" : "Add New Niche Subcategory"}
              </h2>
              <p className="text-xs text-[var(--nexa-text-muted)] mb-4">
                Define the SEO one-word slug, layout template, and transaction rules for this Compass niche.
              </p>

              <form onSubmit={handleSaveSubcategory} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--nexa-text-primary)] mb-1">
                      Subcategory Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bespoke Tailoring"
                      value={subName}
                      onChange={(e) => setSubName(e.target.value)}
                      className="w-full py-2 px-3 text-sm bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-[var(--nexa-text-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--nexa-text-primary)] mb-1">
                      One-Word SEO Slug *
                    </label>
                    <div className="flex items-center">
                      <span className="py-2 px-2.5 bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-500 border border-r-0 border-[var(--nexa-border)] rounded-l-lg">
                        ofia.ng/
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="tailor"
                        value={subSlug}
                        onChange={(e) => setSubSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        className="w-full py-2 px-3 text-sm font-mono bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-r-lg text-[var(--nexa-text-primary)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--nexa-text-primary)] mb-1">
                      Parent Vertical Sector
                    </label>
                    <select
                      value={subParentSlug}
                      onChange={(e) => setSubParentSlug(e.target.value)}
                      className="w-full py-2 px-3 text-sm bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-[var(--nexa-text-primary)]"
                    >
                      {verticals.map((v) => (
                        <option key={v.slug} value={v.slug}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--nexa-text-primary)] mb-1">
                      Transaction Layout UX Template
                    </label>
                    <select
                      value={subLayout}
                      onChange={(e) => setSubLayout(e.target.value as VerticalLayoutTemplate)}
                      className="w-full py-2 px-3 text-sm bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-[var(--nexa-text-primary)]"
                    >
                      {Object.entries(LAYOUT_TEMPLATES_CATALOG).map(([key, meta]) => (
                        <option key={key} value={key}>
                          {meta.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-[var(--nexa-border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      High-Recurring Vertical?
                    </label>
                    <input
                      type="checkbox"
                      checked={subHighRecurring}
                      onChange={(e) => setSubHighRecurring(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1A56DB] focus:ring-0"
                    />
                  </div>
                  {subHighRecurring && (
                    <div>
                      <input
                        type="text"
                        placeholder="e.g. Daily E-Commerce Courier / Weekly Pickup"
                        value={subRecurringTag}
                        onChange={(e) => setSubRecurringTag(e.target.value)}
                        className="w-full py-1.5 px-3 text-xs bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-[var(--nexa-text-primary)]"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--nexa-text-primary)] mb-1">
                      Commission Take Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="30"
                      value={subCommission}
                      onChange={(e) => setSubCommission(parseFloat(e.target.value) || 0)}
                      className="w-full py-2 px-3 text-sm font-mono bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-[var(--nexa-text-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--nexa-text-primary)] mb-1">
                      Enable Subdomain ({"{slug}.ofia.ng"})
                    </label>
                    <div className="flex items-center h-9">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--nexa-text-primary)]">
                        <input
                          type="checkbox"
                          checked={subSubdomain}
                          onChange={(e) => setSubSubdomain(e.target.checked)}
                          className="w-4 h-4 rounded text-[#1A56DB]"
                        />
                        Activate Edge Subdomain Route
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--nexa-text-primary)] mb-1">
                    SEO Meta Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Verified Tailors in Lagos | Ofia Compass"
                    value={subSeoTitle}
                    onChange={(e) => setSubSeoTitle(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-[var(--nexa-text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--nexa-text-primary)] mb-1">
                    Description & Scope
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief summary of services included in this subcategory..."
                    value={subDescription}
                    onChange={(e) => setSubDescription(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-[var(--nexa-text-primary)]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--nexa-border)]">
                  <NexaButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSubcategoryModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-[#1A56DB] text-white"
                  >
                    {editingSubcategory ? "Save Changes" : "Create Subcategory"}
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: LAYOUT TEMPLATE WIREFRAME PREVIEW */}
        {previewTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2.5 py-0.5 rounded text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: LAYOUT_TEMPLATES_CATALOG[previewTemplate].color }}
                >
                  {LAYOUT_TEMPLATES_CATALOG[previewTemplate].badge}
                </span>
                <h2 className="text-lg font-bold text-[var(--nexa-text-primary)]">
                  {LAYOUT_TEMPLATES_CATALOG[previewTemplate].label}
                </h2>
              </div>
              <p className="text-xs text-[var(--nexa-text-muted)] mb-5">
                {LAYOUT_TEMPLATES_CATALOG[previewTemplate].description}
              </p>

              {/* WIREFRAME MOCKUP */}
              <div className="border border-[var(--nexa-border)] rounded-xl p-4 bg-[var(--nexa-bg-base)] space-y-3">
                {previewTemplate === "QUICK_ORDER_FOOD" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-[var(--nexa-bg-surface)] p-2.5 rounded-lg border border-[var(--nexa-border)]">
                      <div className="text-xs font-bold">🍔 Restaurant Menu & Fast Cart</div>
                      <div className="text-xs text-red-500 font-mono font-bold">⏱ Prep Time: 25 mins</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-[var(--nexa-bg-surface)] rounded-lg border border-[var(--nexa-border)] text-xs">
                        <div className="font-bold">Smokey Jollof Feast</div>
                        <div className="text-[11px] text-[var(--nexa-text-muted)]">₦4,500 • Custom sides</div>
                        <button className="mt-2 text-[10px] bg-red-500 text-white px-2 py-0.5 rounded">+ Add to Order</button>
                      </div>
                      <div className="p-3 bg-[var(--nexa-bg-surface)] rounded-lg border border-[var(--nexa-border)] text-xs">
                        <div className="font-bold">Grilled Catfish Point</div>
                        <div className="text-[11px] text-[var(--nexa-text-muted)]">₦8,000 • Spicy chips</div>
                        <button className="mt-2 text-[10px] bg-red-500 text-white px-2 py-0.5 rounded">+ Add to Order</button>
                      </div>
                    </div>
                  </div>
                )}

                {previewTemplate === "ON_DEMAND_DISPATCH" && (
                  <div className="space-y-3">
                    <div className="bg-[var(--nexa-bg-surface)] p-3 rounded-lg border border-[var(--nexa-border)] text-xs space-y-2">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <MapPin className="w-4 h-4" /> Pickup: Victoria Island Lagos
                      </div>
                      <div className="flex items-center gap-2 text-blue-600 font-bold">
                        <MapPin className="w-4 h-4" /> Dropoff: Ikeja GRA
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[var(--nexa-border)]">
                        <span className="font-mono text-xs">Distance: 18.4 km</span>
                        <span className="font-bold text-sm text-[#1A56DB]">₦2,800 Instant Fare</span>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-[#1A56DB] text-white rounded-lg text-xs font-bold">
                      ⚡ Request Nearest Dispatch Rider
                    </button>
                  </div>
                )}

                {previewTemplate === "CALENDAR_BOOKING" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {["Today 2:00 PM", "Today 3:30 PM", "Tomorrow 10:00 AM"].map((time, i) => (
                        <div key={i} className="p-2 bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-lg text-center text-xs font-mono hover:border-purple-500 cursor-pointer">
                          {time}
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-[var(--nexa-bg-surface)] rounded-lg border border-[var(--nexa-border)] flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold">Lead Specialist: Chioma Okonkwo</div>
                        <div className="text-[11px] text-[var(--nexa-text-muted)]">5.0 ★ (120 reviews) • 60 mins session</div>
                      </div>
                      <div className="font-bold text-purple-600">₦15,000</div>
                    </div>
                  </div>
                )}

                {previewTemplate === "RENTAL_STAY_BOOKING" && (
                  <div className="space-y-3">
                    <div className="p-3 bg-[var(--nexa-bg-surface)] rounded-lg border border-[var(--nexa-border)] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[11px] text-[var(--nexa-text-muted)]">Check-In</span>
                        <div className="font-bold">Aug 25, 2026</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-[var(--nexa-text-muted)]">Check-Out</span>
                        <div className="font-bold">Aug 28, 2026 (3 nights)</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span>Total (incl. Caution Escrow):</span>
                      <span className="text-emerald-600 text-sm">₦185,000</span>
                    </div>
                  </div>
                )}

                {previewTemplate === "VEHICLE_INSPECTION_LISTING" && (
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-[var(--nexa-bg-surface)] rounded-lg border border-[var(--nexa-border)] flex justify-between items-center">
                      <span className="font-mono">Plate: LAG-420-AA (Toyota Corolla 2022)</span>
                      <span className="text-amber-600 font-bold">Bay #3</span>
                    </div>
                    <div className="p-2.5 bg-[var(--nexa-bg-surface)] rounded-lg border border-[var(--nexa-border)] space-y-1">
                      <div className="text-[11px] font-bold text-emerald-600">✓ Brake Pads Inspection: Pass</div>
                      <div className="text-[11px] font-bold text-red-500">✗ AC Compressor Diagnostic: Low Pressure</div>
                    </div>
                  </div>
                )}

                {previewTemplate === "SUBSCRIPTION_PICKUP" && (
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-[var(--nexa-bg-surface)] rounded-lg border border-[var(--nexa-border)] flex justify-between items-center">
                      <span className="font-bold">Standard Wash & Fold (15kg Bag)</span>
                      <span className="font-bold text-cyan-600">₦12,500/week</span>
                    </div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)]">
                      Doorstep collection every Tuesday 9:00 AM • 48hr turnaround.
                    </div>
                  </div>
                )}

                {previewTemplate === "TECHNICAL_ESTIMATE_QUOTE" && (
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-[var(--nexa-bg-surface)] rounded-lg border border-[var(--nexa-border)]">
                      <div className="font-bold">Project Scope: 10KVA Solar System Installation</div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)]">Site inspection date scheduled • Milestone Escrow</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 flex justify-end">
                <NexaButton
                  variant="primary"
                  size="sm"
                  onClick={() => setPreviewTemplate(null)}
                  className="bg-[#1A56DB] text-white"
                >
                  Close Preview
                </NexaButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminShell>
  );
}
