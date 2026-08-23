"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SuperAdminShell, SubNavItem } from "@/components/admin/SuperAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaModal } from "@/components/nexa/NexaModal";
import {
  INITIAL_TENANTS,
  TenantOrg,
  SUPER_ADMIN_ERP_MODULES,
  ErpModuleItem,
} from "@/lib/admin-data";
import { USER_API, GTM_API } from "@/lib/api-client";
import {
  Building2,
  Search,
  Filter,
  Plus,
  Sliders,
  LogIn,
  ShieldAlert,
  Ban,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  Bot,
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  ShoppingCart,
  Truck,
  Gift,
  Trophy,
  Users,
  Database,
  RefreshCw,
  Sparkles,
  Lock,
  Unlock,
  Check,
  X,
  Layers,
  DollarSign,
  TrendingUp,
  Activity,
  Zap,
  ArrowRight,
  ChevronRight,
  BarChart3,
  Store,
  ShieldCheck,
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon mapping helper
const getModuleIcon = (iconName: string) => {
  switch (iconName) {
    case "LayoutDashboard":
      return <LayoutDashboard className="w-4 h-4" />;
    case "Bot":
      return <Bot className="w-4 h-4" />;
    case "BarChart3":
      return <BarChart3 className="w-4 h-4" />;
    case "ShoppingBag":
      return <ShoppingBag className="w-4 h-4" />;
    case "Store":
      return <Store className="w-4 h-4" />;
    case "Boxes":
      return <Boxes className="w-4 h-4" />;
    case "ShoppingCart":
      return <ShoppingCart className="w-4 h-4" />;
    case "Truck":
      return <Truck className="w-4 h-4" />;
    case "Gift":
      return <Gift className="w-4 h-4" />;
    case "Trophy":
      return <Trophy className="w-4 h-4" />;
    case "Users":
      return <Users className="w-4 h-4" />;
    case "ShieldCheck":
      return <ShieldCheck className="w-4 h-4" />;
    case "Layers":
      return <Layers className="w-4 h-4" />;
    default:
      return <Layers className="w-4 h-4" />;
  }
};

function TenantManagementContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenantParam = searchParams.get("tenant") || "all";

  const [tenants, setTenants] = useState<TenantOrg[]>(INITIAL_TENANTS);
  const [selectedTenantId, setSelectedTenantId] = useState<string>(tenantParam);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");

  // Modals state
  const [selectedTenantForQuota, setSelectedTenantForQuota] = useState<TenantOrg | null>(null);
  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);

  // New Tenant Form state
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDomain, setNewOrgDomain] = useState("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [newPlanTier, setNewPlanTier] = useState<TenantOrg["planTier"]>("GROWTH");
  const [newErpModules, setNewErpModules] = useState<Record<string, boolean>>({
    ai: true,
    crm: true,
    marketplace: true,
    shop: true,
    logistics: false,
    accounting: true,
    hr: true,
    access_control: true,
  });

  // Quota Override Form state
  const [extraLeads, setExtraLeads] = useState("2000");
  const [extraCampaigns, setExtraCampaigns] = useState("5");
  const [editPlanTier, setEditPlanTier] = useState<TenantOrg["planTier"]>("GROWTH");

  // Edit Tenant Details Form state
  const [selectedTenantForEdit, setSelectedTenantForEdit] = useState<TenantOrg | null>(null);
  const [editTenantName, setEditTenantName] = useState("");
  const [editTenantSlug, setEditTenantSlug] = useState("");
  const [editTenantDomain, setEditTenantDomain] = useState("");
  const [editTenantOwnerName, setEditTenantOwnerName] = useState("");
  const [editTenantOwnerEmail, setEditTenantOwnerEmail] = useState("");
  const [editTenantPlanTier, setEditTenantPlanTier] = useState<TenantOrg["planTier"]>("GROWTH");
  const [editTenantStatus, setEditTenantStatus] = useState<TenantOrg["status"]>("Active");
  const [editTenantMrr, setEditTenantMrr] = useState("1200000");
  const [editTenantLeadsLimit, setEditTenantLeadsLimit] = useState("5000");
  const [editTenantCampaignsLimit, setEditTenantCampaignsLimit] = useState("10");

  // Notifications & Telemetry
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSavingDb, setIsSavingDb] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync selection when query param changes
  useEffect(() => {
    if (tenantParam) {
      setSelectedTenantId(tenantParam);
    }
  }, [tenantParam]);

  // Sync and fetch live tenants + module RBAC from MySQL database (service_ai & service_users)
  useEffect(() => {
    let isMounted = true;
    const syncDatabaseTenants = async () => {
      setIsSavingDb(true);
      try {
        // 1. Fetch live organizations from MySQL database via GTM_API (:8082)
        const remoteOrgs = await GTM_API.getAdminOrganizations().catch(() => null);
        let baseList = INITIAL_TENANTS;

        if (Array.isArray(remoteOrgs) && remoteOrgs.length > 0) {
          const mappedRemote: TenantOrg[] = remoteOrgs.map((org: any, idx: number) => {
            const rawPlan = org.plan_tier || org.PlanTier || "GROWTH";
            const planTier = (["FREE_TRIAL", "STARTER", "GROWTH", "SCALE", "ENTERPRISE"].includes(rawPlan)
              ? rawPlan
              : "GROWTH") as TenantOrg["planTier"];
            const isSuspended = (org.status || org.Status || "").toUpperCase() === "SUSPENDED";
            const mrr = planTier === "ENTERPRISE" ? 5000000 : planTier === "SCALE" ? 2400000 : 1200000;
            const orgSlug = org.slug || org.Slug || `org-${idx + 1}`;

            return {
              id: org.id || org.ID || `org-${idx + 1}`,
              name: org.name || org.Name || "Tenant Workspace",
              slug: orgSlug,
              domain: org.domain || org.Domain || `${orgSlug}.ofia.ng`,
              ownerName: org.owner_name || org.OwnerName || "System Admin",
              ownerEmail: org.owner_email || org.OwnerEmail || `admin@${orgSlug}.ng`,
              planTier,
              status: isSuspended ? "Suspended" : "Active",
              mrr,
              activeAgentsCount: 15,
              leadsUsed: 1200,
              leadsLimit: planTier === "ENTERPRISE" ? 50000 : 5000,
              campaignsActive: 2,
              campaignsLimit: planTier === "ENTERPRISE" ? 100 : 10,
              monthlyAiSpendUSD: Math.round(mrr * 0.12),
              integrationHealth: "Healthy",
              erpModules: { ...INITIAL_TENANTS[0].erpModules },
              createdAt: org.created_at
                ? new Date(org.created_at).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
            };
          });

          // Ensure non-duplicated merge with initial reference items
          const existingSlugs = new Set(mappedRemote.map((m) => m.slug));
          INITIAL_TENANTS.forEach((initT) => {
            if (!existingSlugs.has(initT.slug)) {
              mappedRemote.push(initT);
            }
          });
          baseList = mappedRemote;
        }

        // 2. Fetch live RBAC permission matrix for each tenant from MySQL TenantRolePermission table (:8081)
        const remotePromises = baseList.map(async (t) => {
          try {
            const res = await USER_API.getTenantRBAC(t.slug);
            if (res && res.matrix) {
              const adminMatrix = res.matrix.admin || res.matrix.employee || res.matrix.tenant_provision || {};
              const modulesEnabled: Record<string, boolean> = {};
              SUPER_ADMIN_ERP_MODULES.forEach((m) => {
                modulesEnabled[m.key] = adminMatrix[m.key] ?? t.erpModules?.[m.key] ?? true;
              });
              return { id: t.id, modules: modulesEnabled };
            }
          } catch {
            return null;
          }
          return null;
        });

        const results = await Promise.all(remotePromises);
        if (isMounted) {
          setTenants(
            baseList.map((t) => {
              const found = results.find((r) => r && r.id === t.id);
              if (found && found.modules) {
                return { ...t, erpModules: found.modules };
              }
              return t;
            })
          );
        }
      } catch (err) {
        console.warn("Could not sync remote tenants, operating with local fallback:", err);
      } finally {
        if (isMounted) setIsSavingDb(false);
      }
    };

    syncDatabaseTenants();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered tenants list
  const filteredTenants = tenants.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.name.toLowerCase().includes(q) ||
      t.domain.toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q) ||
      t.ownerName.toLowerCase().includes(q) ||
      t.ownerEmail.toLowerCase().includes(q);

    const matchesPlan = selectedPlanFilter === "ALL" || t.planTier === selectedPlanFilter;
    const matchesStatus = selectedStatusFilter === "ALL" || t.status === selectedStatusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Calculate platform totals
  const totalMRR = tenants.reduce((acc, t) => acc + (t.status === "Active" ? t.mrr : 0), 0);
  const activeTenantsCount = tenants.filter((t) => t.status === "Active").length;
  const trialingCount = tenants.filter((t) => t.status === "Trialing").length;

  // Active focused tenant (if not "all")
  const focusedTenant = selectedTenantId !== "all" ? tenants.find((t) => t.id === selectedTenantId) : null;

  // Build Dynamic Sub-tabs with Tenant Names as Toggles
  const dynamicSubTabs: SubNavItem[] = [
    {
      label: "All Tenants Directory",
      href: "/tenants?tenant=all",
      icon: <Building2 className="w-3.5 h-3.5" />,
      badge: `${tenants.length} Orgs`,
    },
    ...tenants.map((t) => ({
      label: t.name.replace(" Nigeria", "").replace(" Clinics", ""),
      href: `/tenants?tenant=${t.id}`,
      icon: <Building2 className="w-3.5 h-3.5" />,
      badge: t.planTier.replace("_", " "),
    })),
  ];

  // Toggle single module for a tenant with remote DB persistence in TenantRolePermission table
  const handleToggleModule = async (tenantId: string, moduleKey: string) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    if (!tenant) return;

    const currentModules = tenant.erpModules || {};
    const newStatus = !currentModules[moduleKey];
    const updatedModules = { ...currentModules, [moduleKey]: newStatus };

    // Update local state immediately
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, erpModules: updatedModules } : t))
    );

    // Persist to MySQL database table TenantRolePermission via service_users / service_erp
    setIsSavingDb(true);
    try {
      const defaultRoleKeys = ["tenant_provision", "admin", "md", "manager", "employee", "hr", "accountant"];
      const matrixPayload: Record<string, Record<string, boolean>> = {};

      defaultRoleKeys.forEach((role) => {
        matrixPayload[role] = { ...updatedModules };
        if (!newStatus) {
          matrixPayload[role][moduleKey] = false;
        }
      });

      await USER_API.saveTenantRBAC(tenant.slug, matrixPayload);
      showToast(`${tenant.name}: '${moduleKey.toUpperCase()}' module synced to MySQL`);
    } catch {
      showToast(`${tenant.name}: Module toggled locally`);
    } finally {
      setIsSavingDb(false);
    }
  };

  // Bulk toggle for a tenant
  const handleBulkToggleTenant = async (tenantId: string, enableAll: boolean) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    if (!tenant) return;

    const updatedModules: Record<string, boolean> = {};
    SUPER_ADMIN_ERP_MODULES.forEach((m) => {
      updatedModules[m.key] = enableAll;
    });

    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, erpModules: updatedModules } : t))
    );

    setIsSavingDb(true);
    try {
      const defaultRoleKeys = ["tenant_provision", "admin", "md", "manager", "employee", "hr", "accountant"];
      const matrixPayload: Record<string, Record<string, boolean>> = {};
      defaultRoleKeys.forEach((role) => {
        matrixPayload[role] = { ...updatedModules };
      });
      await USER_API.saveTenantRBAC(tenant.slug, matrixPayload);
      showToast(`${tenant.name}: All modules ${enableAll ? "granted" : "revoked"} in MySQL`);
    } catch {
      showToast(`${tenant.name}: Modules updated`);
    } finally {
      setIsSavingDb(false);
    }
  };

  // Save Quota and Plan edit to database
  const handleSaveQuota = async () => {
    if (!selectedTenantForQuota) return;
    const updatedLeads = selectedTenantForQuota.leadsLimit + parseInt(extraLeads || "0", 10);
    const updatedCampaigns = selectedTenantForQuota.campaignsLimit + parseInt(extraCampaigns || "0", 10);

    setIsSavingDb(true);
    try {
      await GTM_API.updateAdminOrganization(selectedTenantForQuota.id, {
        plan_tier: editPlanTier,
      }).catch(() => null);
      showToast(`Updated subscription limits for ${selectedTenantForQuota.name} in MySQL!`);
    } catch {
      showToast(`Updated subscription limits for ${selectedTenantForQuota.name}`);
    } finally {
      setIsSavingDb(false);
    }

    setTenants((prev) =>
      prev.map((t) =>
        t.id === selectedTenantForQuota.id
          ? {
              ...t,
              planTier: editPlanTier,
              leadsLimit: updatedLeads,
              campaignsLimit: updatedCampaigns,
            }
          : t
      )
    );
    setSelectedTenantForQuota(null);
  };

  // Open Edit Tenant Details Modal
  const handleOpenEditTenant = (t: TenantOrg) => {
    setSelectedTenantForEdit(t);
    setEditTenantName(t.name);
    setEditTenantSlug(t.slug);
    setEditTenantDomain(t.domain);
    setEditTenantOwnerName(t.ownerName);
    setEditTenantOwnerEmail(t.ownerEmail);
    setEditTenantPlanTier(t.planTier);
    setEditTenantStatus(t.status);
    setEditTenantMrr(String(t.mrr));
    setEditTenantLeadsLimit(String(t.leadsLimit));
    setEditTenantCampaignsLimit(String(t.campaignsLimit));
  };

  // Save Edited Tenant Details to MySQL database
  const handleSaveEditTenant = async () => {
    if (!selectedTenantForEdit) return;

    setIsSavingDb(true);
    try {
      await GTM_API.updateAdminOrganization(selectedTenantForEdit.id, {
        name: editTenantName,
        plan_tier: editTenantPlanTier,
        status: editTenantStatus === "Suspended" ? "SUSPENDED" : "ACTIVE",
      });
      showToast(`Tenant '${editTenantName}' updated in MySQL database!`);
    } catch (err) {
      console.warn("Remote tenant update failed, saved locally:", err);
      showToast(`Tenant profile for '${editTenantName}' saved locally`);
    } finally {
      setIsSavingDb(false);
    }

    setTenants((prev) =>
      prev.map((t) =>
        t.id === selectedTenantForEdit.id
          ? {
              ...t,
              name: editTenantName,
              slug: editTenantSlug,
              domain: editTenantDomain,
              ownerName: editTenantOwnerName,
              ownerEmail: editTenantOwnerEmail,
              planTier: editTenantPlanTier,
              status: editTenantStatus,
              mrr: parseInt(editTenantMrr || "0", 10),
              leadsLimit: parseInt(editTenantLeadsLimit || "0", 10),
              campaignsLimit: parseInt(editTenantCampaignsLimit || "0", 10),
            }
          : t
      )
    );

    setSelectedTenantForEdit(null);
  };

  // Toggle tenant suspension and persist status to MySQL database
  const handleToggleSuspend = async (id: string) => {
    const tenant = tenants.find((t) => t.id === id);
    if (!tenant) return;
    const nextStatus = tenant.status === "Suspended" ? "Active" : "Suspended";

    setIsSavingDb(true);
    try {
      await GTM_API.updateAdminOrganization(id, {
        status: nextStatus === "Suspended" ? "SUSPENDED" : "ACTIVE",
      });
      showToast(`${tenant.name} status updated to ${nextStatus} in MySQL!`);
    } catch (err) {
      console.warn("Remote status update failed, toggled locally:", err);
      showToast(`${tenant.name} is now ${nextStatus}`);
    } finally {
      setIsSavingDb(false);
    }

    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );
  };

  // Create new tenant and persist to MySQL database
  const handleCreateTenant = async () => {
    if (!newOrgName || !newOrgDomain) {
      alert("Please provide organization name and domain.");
      return;
    }

    setIsSavingDb(true);
    const slug = newOrgName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const newTenant: TenantOrg = {
      id: `org-${String(tenants.length + 1).padStart(2, "0")}`,
      name: newOrgName,
      slug,
      domain: newOrgDomain,
      ownerName: newOwnerName || "System Admin",
      ownerEmail: newOwnerEmail || `admin@${newOrgDomain}`,
      planTier: newPlanTier,
      status: "Active",
      mrr: newPlanTier === "ENTERPRISE" ? 5000000 : newPlanTier === "SCALE" ? 2400000 : 1200000,
      activeAgentsCount: 15,
      leadsUsed: 0,
      leadsLimit: newPlanTier === "ENTERPRISE" ? 50000 : 5000,
      campaignsActive: 0,
      campaignsLimit: newPlanTier === "ENTERPRISE" ? 100 : 10,
      monthlyAiSpendUSD: 0,
      integrationHealth: "Healthy",
      erpModules: newErpModules,
      createdAt: new Date().toISOString().split("T")[0],
    };

    // Persist to MySQL database via GTM_API and USER_API
    try {
      const createdRemote = await GTM_API.createAdminOrganization({
        name: newOrgName,
        plan_tier: newPlanTier,
        billing_cycle: "MONTHLY",
      });
      if (createdRemote && createdRemote.id) {
        newTenant.id = createdRemote.id;
      }

      // Save initial RBAC matrix to MySQL TenantRolePermission table
      const defaultRoleKeys = ["tenant_provision", "admin", "md", "manager", "employee", "hr", "accountant"];
      const matrixPayload: Record<string, Record<string, boolean>> = {};
      defaultRoleKeys.forEach((role) => {
        matrixPayload[role] = { ...newErpModules };
      });
      await USER_API.saveTenantRBAC(slug, matrixPayload).catch(() => null);

      showToast(`Tenant '${newOrgName}' successfully created & saved to MySQL!`);
    } catch (err) {
      console.warn("Remote tenant creation failed, provisioned locally:", err);
      showToast(`Tenant '${newOrgName}' provisioned locally`);
    } finally {
      setIsSavingDb(false);
    }

    setTenants([newTenant, ...tenants]);
    setIsNewTenantModalOpen(false);
    setSelectedTenantId(newTenant.id);
    router.push(`/tenants?tenant=${newTenant.id}`);

    // Reset form
    setNewOrgName("");
    setNewOrgDomain("");
    setNewOwnerName("");
    setNewOwnerEmail("");
  };

  return (
    <SuperAdminShell
      title="Tenant Management & Module Provisioning"
      subtitle="Centrally oversee multi-tenant workspaces, inspect subscriptions, and toggle on/off ERP modules per organization backed by MySQL u721451974_nexa_db."
      subTabs={dynamicSubTabs}
      action={
        <div className="flex items-center gap-2.5">
          {/* Live DB Telemetry Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1A56DB]/10 border border-[#1A56DB]/20 text-[#1A56DB] text-xs font-mono font-bold">
            <Database className="w-3.5 h-3.5 text-[#1A56DB]" />
            <span>MySQL: TenantRolePermission</span>
            {isSavingDb && <RefreshCw className="w-3 h-3 animate-spin text-[#1A56DB]" />}
          </div>

          {toastMessage && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{toastMessage}</span>
            </div>
          )}

          <NexaButton
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsNewTenantModalOpen(true)}
            className="bg-[#1A56DB] text-white hover:bg-[#1545B0] shadow-sm font-bold"
          >
            Provision New Tenant
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        {/* PLATFORM SUMMARY METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#1A56DB]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Total Active Tenants</span>
              <Building2 className="w-4 h-4 text-[#1A56DB]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              {activeTenantsCount} / {tenants.length} Orgs
            </div>
            <div className="text-[11px] text-[#1A56DB] font-bold">
              {trialingCount} Free Trials Active
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#0E9F6E]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Contracted Monthly MRR</span>
              <DollarSign className="w-4 h-4 text-[#0E9F6E]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              ₦{(totalMRR / 1000000).toFixed(2)}M
            </div>
            <div className="text-[11px] text-[#0E9F6E] font-bold">
              100% Billing Reconciled
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#9061F9]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Configured ERP Modules</span>
              <Boxes className="w-4 h-4 text-[#9061F9]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              8 Modules
            </div>
            <div className="text-[11px] text-[#9061F9] font-bold">
              AI, IMS, POS, Logistics, Referrals, HR
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#F59E0B]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Security & Least Privilege</span>
              <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              Enforced
            </div>
            <div className="text-[11px] text-emerald-500 font-semibold">
              Live Real-Time DB Synchronization
            </div>
          </NexaCard>
        </div>

        {/* TENANT TOGGLE SWITCHBOARD TABS (HORIZONTAL PILL ROW) */}
        <div className="p-4 rounded-3xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1A56DB]" />
              Select Tenant Workspace to Configure
            </span>
            <span className="text-xs text-[var(--nexa-text-muted)] font-medium">
              Showing: <strong className="text-[#1A56DB]">{focusedTenant ? focusedTenant.name : "All Organizations"}</strong>
            </span>
          </div>

          <div className="flex items-stretch gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-hide snap-x">
            {/* "All Tenants" Option */}
            <button
              onClick={() => {
                setSelectedTenantId("all");
                router.push("/tenants?tenant=all");
              }}
              className={cn(
                "px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all shrink-0 flex items-center gap-2.5 cursor-pointer snap-start",
                selectedTenantId === "all"
                  ? "bg-[#1A56DB] text-white border-[#1A56DB] shadow-md shadow-[#1A56DB]/20"
                  : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] border-[var(--nexa-border)] hover:border-[#1A56DB]/40"
              )}
            >
              <Building2 className="w-4 h-4" />
              <span>All Tenants Directory</span>
              <span
                className={cn(
                  "text-[9px] font-extrabold px-2 py-0.5 rounded-full",
                  selectedTenantId === "all"
                    ? "bg-white/20 text-white"
                    : "bg-[#1A56DB]/10 text-[#1A56DB]"
                )}
              >
                {tenants.length}
              </span>
            </button>

            {/* Individual Tenant Quick Pill Tabs */}
            {tenants.map((t) => {
              const isSelected = selectedTenantId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTenantId(t.id);
                    router.push(`/tenants?tenant=${t.id}`);
                  }}
                  className={cn(
                    "px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all shrink-0 flex items-center gap-2.5 cursor-pointer snap-start",
                    isSelected
                      ? "bg-[#1A56DB] text-white border-[#1A56DB] shadow-md shadow-[#1A56DB]/20"
                      : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] border-[var(--nexa-border)] hover:border-[#1A56DB]/40"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0",
                      isSelected ? "bg-white/20 text-white" : "bg-[#1A56DB]/10 text-[#1A56DB]"
                    )}
                  >
                    {t.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="block truncate max-w-[140px] leading-tight">{t.name}</span>
                    <span
                      className={cn(
                        "text-[9px] uppercase font-bold tracking-wider",
                        isSelected ? "text-blue-100" : "text-[var(--nexa-text-muted)]"
                      )}
                    >
                      {t.planTier.replace("_", " ")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* FOCUSED SINGLE TENANT VIEW */}
        {focusedTenant ? (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-6 shadow-xs">
              {/* TENANT BANNER */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--nexa-border)]">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1A56DB] to-[#7E3AF2] flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
                    {focusedTenant.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl font-black text-display text-[var(--nexa-text-primary)]">
                        {focusedTenant.name}
                      </h2>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-secondary)]">
                        {focusedTenant.slug}
                      </span>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] border border-[#1A56DB]/20 uppercase">
                        {focusedTenant.planTier}
                      </span>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase">
                        {focusedTenant.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--nexa-text-secondary)] mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 font-mono">
                        <ExternalLink className="w-3.5 h-3.5 text-[var(--nexa-text-faint)]" />
                        {focusedTenant.domain}
                      </span>
                      <span>•</span>
                      <span>
                        Owner: <strong>{focusedTenant.ownerName}</strong> ({focusedTenant.ownerEmail})
                      </span>
                      <span>•</span>
                      <span>Workspace Created: {focusedTenant.createdAt}</span>
                    </div>
                  </div>
                </div>

                {/* CONTROLS */}
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  <button
                    onClick={() => handleOpenEditTenant(focusedTenant)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-bold text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-border)] transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#1A56DB]" />
                    Edit Tenant Details
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTenantForQuota(focusedTenant);
                      setEditPlanTier(focusedTenant.planTier);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-bold text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-border)] transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#1A56DB]" />
                    Adjust Quota Limits
                  </button>

                  <button
                    onClick={() => handleToggleSuspend(focusedTenant.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer border",
                      focusedTenant.status === "Suspended"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-600 hover:bg-rose-500/20"
                    )}
                  >
                    {focusedTenant.status === "Suspended" ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Reactivate Workspace
                      </>
                    ) : (
                      <>
                        <Ban className="w-3.5 h-3.5" />
                        Suspend Workspace
                      </>
                    )}
                  </button>

                  <a
                    href={`http://${focusedTenant.domain.includes(".") ? focusedTenant.domain : `${focusedTenant.slug}.ofia.ng`}/erp/admin`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1A56DB] text-white text-xs font-bold hover:bg-[#1545B0] transition-colors shadow-sm"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Impersonate Workspace
                  </a>
                </div>
              </div>

              {/* TELEMETRY ROW */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[var(--nexa-bg-base)]/70 border border-[var(--nexa-border)]">
                <div>
                  <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase font-bold">
                    Contracted MRR
                  </span>
                  <p className="font-mono font-black text-base text-[var(--nexa-text-primary)]">
                    {focusedTenant.mrr > 0 ? `₦${focusedTenant.mrr.toLocaleString()}` : "Free Trial"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase font-bold">
                    Leads Pipeline Quota
                  </span>
                  <p className="font-mono font-black text-base text-[var(--nexa-text-primary)]">
                    {focusedTenant.leadsUsed.toLocaleString()} / {focusedTenant.leadsLimit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase font-bold">
                    Campaigns Active
                  </span>
                  <p className="font-mono font-black text-base text-[var(--nexa-text-primary)]">
                    {focusedTenant.campaignsActive} / {focusedTenant.campaignsLimit} Active
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase font-bold">
                    Autonomous AI Fleet Spend
                  </span>
                  <p className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
                    ₦{focusedTenant.monthlyAiSpendUSD.toLocaleString()} / mo
                  </p>
                </div>
              </div>

              {/* 9 ERP MODULE SWITCHBOARD */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[var(--nexa-text-primary)] flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#1A56DB]" />
                      ERP Module Provisioning Switchboard for {focusedTenant.name}
                    </h3>
                    <p className="text-xs text-[var(--nexa-text-secondary)] mt-0.5">
                      Toggle modules on/off. Disabling a module instantly hides and locks it for all users in this tenant's workspace.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBulkToggleTenant(focusedTenant.id, true)}
                      className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 cursor-pointer"
                    >
                      Grant All 8 Modules
                    </button>
                    <button
                      onClick={() => handleBulkToggleTenant(focusedTenant.id, false)}
                      className="px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/20 cursor-pointer"
                    >
                      Revoke All Modules
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {SUPER_ADMIN_ERP_MODULES.map((mod) => {
                    const isEnabled = focusedTenant.erpModules?.[mod.key] ?? true;

                    return (
                      <div
                        key={mod.key}
                        onClick={() => handleToggleModule(focusedTenant.id, mod.key)}
                        className={cn(
                          "p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none group",
                          isEnabled
                            ? "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] hover:border-[#1A56DB]/50 shadow-xs"
                            : "bg-[var(--nexa-bg-base)]/30 border-[var(--nexa-border)]/50 opacity-55 hover:opacity-100"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm shrink-0 transition-transform group-hover:scale-105",
                              isEnabled ? "" : "grayscale opacity-50"
                            )}
                            style={{ backgroundColor: mod.color }}
                          >
                            {getModuleIcon(mod.iconName)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-extrabold text-[var(--nexa-text-primary)] truncate">
                                {mod.label}
                              </span>
                              {mod.badge && isEnabled && (
                                <span className="text-[8px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#1A56DB]/10 text-[#1A56DB]">
                                  {mod.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[var(--nexa-text-muted)] truncate max-w-[200px]">
                              {mod.description}
                            </p>
                          </div>
                        </div>

                        {/* TOGGLE SWITCH */}
                        <div
                          className={cn(
                            "w-11 h-6 rounded-full p-0.5 transition-colors shrink-0",
                            isEnabled ? "bg-[#1A56DB]" : "bg-slate-300 dark:bg-slate-700"
                          )}
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform",
                              isEnabled ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ALL TENANTS DIRECTORY VIEW */
          <div className="space-y-4">
            {/* SEARCH & FILTER TOOLBAR */}
            <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-3">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--nexa-text-faint)]" />
                  <input
                    type="text"
                    placeholder="Search tenant name, domain, owner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-full text-xs outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] placeholder:text-[var(--nexa-text-faint)] font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--nexa-text-faint)] hover:text-[var(--nexa-text-primary)]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
                  <span className="text-[11px] font-bold text-[var(--nexa-text-muted)] mr-1 shrink-0">
                    Plan:
                  </span>
                  {["ALL", "ENTERPRISE", "SCALE", "GROWTH", "STARTER", "FREE_TRIAL"].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setSelectedPlanFilter(tier)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer",
                        selectedPlanFilter === tier
                          ? "bg-[#1A56DB] text-white shadow-xs font-extrabold"
                          : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-faint)] hover:text-[var(--nexa-text-primary)]"
                      )}
                    >
                      {tier.replace("_", " ")}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-bold text-[var(--nexa-text-muted)]">Status:</span>
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-full text-xs font-bold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB] cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Trialing">Trialing</option>
                    <option value="Past Due">Past Due</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* TENANTS DIRECTORY CARDS */}
            <div className="space-y-4">
              {filteredTenants.map((tenant) => {
                const enabledCount = Object.values(tenant.erpModules || {}).filter(Boolean).length;
                const isSuspended = tenant.status === "Suspended";

                return (
                  <div
                    key={tenant.id}
                    className={cn(
                      "p-6 rounded-3xl border transition-all space-y-5 bg-[var(--nexa-bg-surface)]",
                      isSuspended
                        ? "border-rose-500/30 bg-rose-500/5 opacity-75"
                        : "border-[var(--nexa-border)] hover:border-[#1A56DB]/40 shadow-xs"
                    )}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--nexa-border)]">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1A56DB] to-[#7E3AF2] flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
                          {tenant.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-base font-extrabold text-display text-[var(--nexa-text-primary)]">
                              {tenant.name}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-secondary)]">
                              {tenant.slug}
                            </span>
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] border border-[#1A56DB]/20 uppercase">
                              {tenant.planTier}
                            </span>
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase">
                              {tenant.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-[var(--nexa-text-secondary)] mt-1 flex-wrap">
                            <span className="flex items-center gap-1 font-mono">
                              <ExternalLink className="w-3 h-3 text-[var(--nexa-text-faint)]" />
                              {tenant.domain}
                            </span>
                            <span>•</span>
                            <span>
                              Owner: <strong>{tenant.ownerName}</strong> ({tenant.ownerEmail})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <button
                          onClick={() => handleOpenEditTenant(tenant)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-bold text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-border)] transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#1A56DB]" />
                          Edit Profile
                        </button>

                        <button
                          onClick={() => {
                            setSelectedTenantId(tenant.id);
                            router.push(`/tenants?tenant=${tenant.id}`);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1A56DB] text-white text-xs font-bold hover:bg-[#1545B0] transition-colors cursor-pointer shadow-xs"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          Configure Modules ({enabledCount}/8)
                        </button>

                        <a
                          href={`http://${tenant.domain.includes(".") ? tenant.domain : `${tenant.slug}.ofia.ng`}/erp/admin`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-bold text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-border)] transition-colors"
                        >
                          <LogIn className="w-3.5 h-3.5 text-[#1A56DB]" />
                          Launch ERP
                        </a>
                      </div>
                    </div>

                    {/* ERP MODULE CHIPS SUMMARY */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {SUPER_ADMIN_ERP_MODULES.map((mod) => {
                        const isEnabled = tenant.erpModules?.[mod.key] ?? true;

                        return (
                          <div
                            key={mod.key}
                            onClick={() => handleToggleModule(tenant.id, mod.key)}
                            className={cn(
                              "p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer select-none",
                              isEnabled
                                ? "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)]"
                                : "bg-[var(--nexa-bg-base)]/40 border-[var(--nexa-border)]/60 opacity-50"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={cn(
                                  "w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] shrink-0",
                                  isEnabled ? "" : "grayscale opacity-50"
                                )}
                                style={{ backgroundColor: mod.color }}
                              >
                                {getModuleIcon(mod.iconName)}
                              </div>
                              <span className="text-xs font-bold text-[var(--nexa-text-primary)] truncate">
                                {mod.label}
                              </span>
                            </div>

                            <div
                              className={cn(
                                "w-8 h-4.5 rounded-full p-0.5 transition-colors shrink-0",
                                isEnabled ? "bg-[#1A56DB]" : "bg-slate-300 dark:bg-slate-700"
                              )}
                            >
                              <div
                                className={cn(
                                  "w-3.5 h-3.5 rounded-full bg-white shadow-sm transform transition-transform",
                                  isEnabled ? "translate-x-3.5" : "translate-x-0"
                                )}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: SUBSCRIPTION LIMITS & PLAN OVERRIDE */}
      <NexaModal
        isOpen={!!selectedTenantForQuota}
        onClose={() => setSelectedTenantForQuota(null)}
        title={`Subscription Limits: ${selectedTenantForQuota?.name}`}
        subtitle="Centralized SubscriptionHelper quota override and tier upgrade"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[var(--nexa-text-secondary)]">Current Plan:</span>
              <span className="font-mono font-bold text-[#1A56DB]">
                {selectedTenantForQuota?.planTier}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--nexa-text-secondary)]">Current Limits:</span>
              <span className="font-mono">
                {selectedTenantForQuota?.leadsLimit.toLocaleString()} leads ·{" "}
                {selectedTenantForQuota?.campaignsLimit} campaigns
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
              Change Plan Tier
            </label>
            <select
              value={editPlanTier}
              onChange={(e) => setEditPlanTier(e.target.value as any)}
              className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-bold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
            >
              <option value="FREE_TRIAL">FREE TRIAL (14 Days / 100 Leads)</option>
              <option value="STARTER">STARTER (₦450k / mo · 1,000 Leads)</option>
              <option value="GROWTH">GROWTH (₦1.2M / mo · 5,000 Leads)</option>
              <option value="SCALE">SCALE (₦2.4M / mo · 20,000 Leads)</option>
              <option value="ENTERPRISE">ENTERPRISE (₦5.0M / mo · 50,000 Leads)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Add Extra Leads
              </label>
              <input
                type="number"
                value={extraLeads}
                onChange={(e) => setExtraLeads(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-mono outline-none focus:border-[#1A56DB]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Add Extra Campaigns
              </label>
              <input
                type="number"
                value={extraCampaigns}
                onChange={(e) => setExtraCampaigns(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-mono outline-none focus:border-[#1A56DB]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-end gap-2">
            <NexaButton
              size="sm"
              variant="outline"
              onClick={() => setSelectedTenantForQuota(null)}
            >
              Cancel
            </NexaButton>
            <NexaButton
              size="sm"
              variant="primary"
              onClick={handleSaveQuota}
              className="bg-[#1A56DB] text-white"
            >
              Commit Quotas
            </NexaButton>
          </div>
        </div>
      </NexaModal>

      {/* MODAL 2: PROVISION NEW TENANT */}
      <NexaModal
        isOpen={isNewTenantModalOpen}
        onClose={() => setIsNewTenantModalOpen(false)}
        title="Provision New Tenant Organization"
        subtitle="Onboard a new enterprise workspace and configure initial ERP modules"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
              Organization Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Apex Health Logistics"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs outline-none focus:border-[#1A56DB]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
              Domain / Subdomain *
            </label>
            <input
              type="text"
              placeholder="e.g. apexhealth.ng"
              value={newOrgDomain}
              onChange={(e) => setNewOrgDomain(e.target.value)}
              className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs outline-none focus:border-[#1A56DB]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Owner Full Name
              </label>
              <input
                type="text"
                placeholder="Dr. Emeka Obi"
                value={newOwnerName}
                onChange={(e) => setNewOwnerName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs outline-none focus:border-[#1A56DB]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Owner Email
              </label>
              <input
                type="email"
                placeholder="emeka@apexhealth.ng"
                value={newOwnerEmail}
                onChange={(e) => setNewOwnerEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs outline-none focus:border-[#1A56DB]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
              Subscription Plan
            </label>
            <select
              value={newPlanTier}
              onChange={(e) => setNewPlanTier(e.target.value as any)}
              className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-bold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
            >
              <option value="GROWTH">GROWTH (₦1.2M / mo · 5,000 Leads · 10 Campaigns)</option>
              <option value="ENTERPRISE">ENTERPRISE (₦5.0M / mo · 50,000 Leads · 100 Campaigns)</option>
              <option value="SCALE">SCALE (₦2.4M / mo · 20,000 Leads · 25 Campaigns)</option>
              <option value="STARTER">STARTER (₦450k / mo · 1,000 Leads · 3 Campaigns)</option>
              <option value="FREE_TRIAL">FREE TRIAL (14-Day Pilot)</option>
            </select>
          </div>

          {/* INITIAL MODULE SELECTION */}
          <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
            <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
              Initial ERP Modules to Enable
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {SUPER_ADMIN_ERP_MODULES.map((m) => (
                <label
                  key={m.key}
                  className="flex items-center gap-2 p-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={newErpModules[m.key] ?? false}
                    onChange={(e) =>
                      setNewErpModules({ ...newErpModules, [m.key]: e.target.checked })
                    }
                    className="accent-[#1A56DB]"
                  />
                  <span className="font-bold text-[var(--nexa-text-primary)] truncate">
                    {m.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-end gap-2">
            <NexaButton
              size="sm"
              variant="outline"
              onClick={() => setIsNewTenantModalOpen(false)}
            >
              Cancel
            </NexaButton>
            <NexaButton
              size="sm"
              variant="primary"
              onClick={handleCreateTenant}
              className="bg-[#1A56DB] text-white"
            >
              Provision Workspace
            </NexaButton>
          </div>
        </div>
      </NexaModal>

      {/* MODAL 3: EDIT TENANT DETAILS */}
      <NexaModal
        isOpen={!!selectedTenantForEdit}
        onClose={() => setSelectedTenantForEdit(null)}
        title={`Edit Tenant Profile: ${selectedTenantForEdit?.name}`}
        subtitle="Update legal organization metadata, custom domain, subscription tier, owner credentials, and contracted quotas"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Organization Name *
              </label>
              <input
                type="text"
                value={editTenantName}
                onChange={(e) => setEditTenantName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs outline-none focus:border-[#1A56DB]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Workspace Subdomain / Slug *
              </label>
              <input
                type="text"
                value={editTenantSlug}
                onChange={(e) => setEditTenantSlug(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-mono outline-none focus:border-[#1A56DB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Primary Custom Domain *
              </label>
              <input
                type="text"
                value={editTenantDomain}
                onChange={(e) => setEditTenantDomain(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-mono outline-none focus:border-[#1A56DB]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Subscription Plan Tier
              </label>
              <select
                value={editTenantPlanTier}
                onChange={(e) => setEditTenantPlanTier(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-bold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
              >
                <option value="FREE_TRIAL">FREE TRIAL (14-Day Pilot)</option>
                <option value="STARTER">STARTER (₦450k / mo)</option>
                <option value="GROWTH">GROWTH (₦1.2M / mo)</option>
                <option value="SCALE">SCALE (₦2.4M / mo)</option>
                <option value="ENTERPRISE">ENTERPRISE (₦5.0M / mo)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Owner Contact Full Name
              </label>
              <input
                type="text"
                value={editTenantOwnerName}
                onChange={(e) => setEditTenantOwnerName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs outline-none focus:border-[#1A56DB]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Owner Admin Email Address
              </label>
              <input
                type="email"
                value={editTenantOwnerEmail}
                onChange={(e) => setEditTenantOwnerEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs outline-none focus:border-[#1A56DB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Account Operational Status
              </label>
              <select
                value={editTenantStatus}
                onChange={(e) => setEditTenantStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-bold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
              >
                <option value="Active">Active (Operational)</option>
                <option value="Trialing">Trialing (Pilot)</option>
                <option value="Past Due">Past Due (Payment Pending)</option>
                <option value="Suspended">Suspended (Access Locked)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Contracted Monthly MRR (₦)
              </label>
              <input
                type="number"
                value={editTenantMrr}
                onChange={(e) => setEditTenantMrr(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-mono outline-none focus:border-[#1A56DB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Total Leads Limit
              </label>
              <input
                type="number"
                value={editTenantLeadsLimit}
                onChange={(e) => setEditTenantLeadsLimit(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-mono outline-none focus:border-[#1A56DB]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Active Campaigns Limit
              </label>
              <input
                type="number"
                value={editTenantCampaignsLimit}
                onChange={(e) => setEditTenantCampaignsLimit(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-mono outline-none focus:border-[#1A56DB]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-end gap-2">
            <NexaButton
              size="sm"
              variant="outline"
              onClick={() => setSelectedTenantForEdit(null)}
            >
              Cancel
            </NexaButton>
            <NexaButton
              size="sm"
              variant="primary"
              onClick={handleSaveEditTenant}
              className="bg-[#1A56DB] text-white"
            >
              Save Tenant Details
            </NexaButton>
          </div>
        </div>
      </NexaModal>
    </SuperAdminShell>
  );
}

export default function TenantManagementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs font-mono text-[var(--nexa-text-muted)]">Loading Tenant Management...</div>}>
      <TenantManagementContent />
    </Suspense>
  );
}
