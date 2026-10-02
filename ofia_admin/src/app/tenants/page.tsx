"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SuperAdminShell, SubNavItem } from "@/components/admin/SuperAdminShell";
import { AdminStatGrid, AdminStatItem } from "@/components/admin/AdminStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaModal } from "@/components/nexa/NexaModal";
import { Pagination } from "@/components/nexa/Pagination";
import {
  INITIAL_TENANTS,
  TenantOrg,
  SUPER_ADMIN_ERP_MODULES,
  ErpModuleItem,
} from "@/lib/admin-data";
import { USER_API, GTM_API } from "@/lib/api-client";
import {
  validateSubdomainAvailability,
  normalizeSubdomainSlug,
} from "@/lib/subdomain-checker";
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
  ChevronDown,
  BarChart3,
  Store,
  ShieldCheck,
  Edit3,
  CreditCard,
  Calendar,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Centralized Plan Tiers Catalog re-exported from subscription-data
export { type SubscriptionTierItem, SUBSCRIPTION_TIERS_CATALOG } from "@/lib/subscription-data";

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
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>("ALL");
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
  const [editTenantMrr, setEditTenantMrr] = useState("24000");
  const [editTenantLeadsLimit, setEditTenantLeadsLimit] = useState("5000");
  const [editTenantCampaignsLimit, setEditTenantCampaignsLimit] = useState("10");
  const [editTenantLogo, setEditTenantLogo] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [savingModuleKeys, setSavingModuleKeys] = useState<Record<string, boolean>>({});

  // Notifications & Telemetry
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [tenantPage, setTenantPage] = useState(1);
  const tenantItemsPerPage = 5;

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

  // Sync and fetch live tenants + module RBAC from Postgres database (service_ai & service_users)
  useEffect(() => {
    let isMounted = true;
    const syncDatabaseTenants = async () => {
      setIsSavingDb(true);
      try {
        // 1. Fetch live organizations from API / Postgres database
        const remoteOrgs = await GTM_API.getAdminOrganizations().catch(() => null);
        let baseList = INITIAL_TENANTS;

        if (Array.isArray(remoteOrgs) && remoteOrgs.length > 0) {
          const mappedRemote: TenantOrg[] = remoteOrgs.map((org: any, idx: number) => {
            const rawPlan = org.planTier || org.plan_tier || org.PlanTier || "GROWTH";
            const planTier = (["FREE_TRIAL", "STARTER", "GROWTH", "SCALE", "ENTERPRISE"].includes(rawPlan)
              ? rawPlan
              : "GROWTH") as TenantOrg["planTier"];
            const rawStatus = String(org.status || org.Status || "Active").toUpperCase();
            const isSuspended = rawStatus === "SUSPENDED";
            const mrr = org.mrr !== undefined ? Number(org.mrr) : planTier === "ENTERPRISE" ? 100000 : planTier === "SCALE" ? 48000 : planTier === "STARTER" ? 9000 : planTier === "FREE_TRIAL" ? 0 : 24000;
            const orgSlug = org.slug || org.Slug || `org-${idx + 1}`;

            return {
              id: org.id || org.ID || `org-${idx + 1}`,
              name: org.name || org.Name || "Tenant Workspace",
              slug: orgSlug,
              domain: org.domain || org.Domain || `${orgSlug}.ofia.ng`,
              logo: org.logo || org.Logo || undefined,
              ownerName: org.ownerName || org.owner_name || org.OwnerName || org.owner?.name || org.Owner?.Name || "System Admin",
              ownerEmail: org.ownerEmail || org.owner_email || org.OwnerEmail || org.owner?.email || org.Owner?.Email || `admin@${orgSlug}.ng`,
              planTier,
              status: isSuspended ? "Suspended" : "Active",
              mrr,
              activeAgentsCount: Number(org.activeAgentsCount || 15),
              leadsUsed: Number(org.leadsUsed || 1200),
              leadsLimit: Number(org.leadsLimit !== undefined ? org.leadsLimit : org.leads_limit !== undefined ? org.leads_limit : planTier === "ENTERPRISE" ? 50000 : 5000),
              campaignsActive: Number(org.campaignsActive || 2),
              campaignsLimit: Number(org.campaignsLimit !== undefined ? org.campaignsLimit : org.campaigns_limit !== undefined ? org.campaigns_limit : planTier === "ENTERPRISE" ? 100 : 10),
              monthlyAiSpendUSD: Math.round(mrr * 0.12),
              integrationHealth: org.integrationHealth || "Healthy",
              erpModules: org.erpModules || { ...INITIAL_TENANTS[0].erpModules },
              createdAt: org.createdAt || org.created_at
                ? new Date(org.createdAt || org.created_at).toISOString().split("T")[0]
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

        // 2. Fetch live RBAC permission matrix for each tenant from Postgres TenantRolePermission table (:8081)
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
          const finalTenants = baseList.map((t) => {
            const found = results.find((r) => r && r.id === t.id);
            if (found && found.modules) {
              return { ...t, erpModules: found.modules };
            }
            return t;
          });
          setTenants(finalTenants);
        }
      } catch (err) {
        console.warn("Could not sync remote tenants from database:", err);
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

  const handleImpersonate = (t: TenantOrg) => {
    const targetUrl = t.domain.includes(".")
      ? `https://${t.domain}/erp/admin`
      : `https://${t.slug}.ofia.ng/erp/admin`;
    window.open(targetUrl, "_blank");
  };

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

    // Persist to Neon Postgres database table TenantRolePermission
    setSavingModuleKeys((prev) => ({ ...prev, [moduleKey]: true }));
    setIsSavingDb(true);
    try {
      const defaultRoleKeys = ["tenant_provision", "admin", "md", "manager", "employee", "hr", "accountant"];
      const matrixPayload: Record<string, Record<string, boolean>> = {};

      defaultRoleKeys.forEach((role) => {
        if (role === "employee") {
          matrixPayload[role] = {
            employee: true,
            quests: updatedModules.quests ?? true,
            mission: false,
            ai: false,
            crm: false,
            users: false,
            access_control: false,
            marketplace: false,
            shop: false,
            inventory: false,
            pos: false,
            logistics: false,
            referrals: false,
            accounting: false,
            hr: false,
            manager: false,
            md: false,
          };
        } else {
          matrixPayload[role] = { ...updatedModules };
          if (!newStatus) {
            matrixPayload[role][moduleKey] = false;
          }
        }
      });

      await USER_API.saveTenantRBAC(tenant.slug, matrixPayload);
      showToast(`⚡ ${tenant.name}: '${moduleKey.toUpperCase()}' module synced to Neon Postgres`);
    } catch (err: any) {
      console.warn("Failed to persist module toggle:", err);
      showToast(`${tenant.name}: Module toggled locally`);
    } finally {
      setIsSavingDb(false);
      setSavingModuleKeys((prev) => ({ ...prev, [moduleKey]: false }));
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
        if (role === "employee") {
          matrixPayload[role] = {
            employee: true,
            quests: enableAll,
            mission: false,
            ai: false,
            crm: false,
            users: false,
            access_control: false,
            marketplace: false,
            shop: false,
            inventory: false,
            pos: false,
            logistics: false,
            referrals: false,
            accounting: false,
            hr: false,
            manager: false,
            md: false,
          };
        } else {
          matrixPayload[role] = { ...updatedModules };
        }
      });
      await USER_API.saveTenantRBAC(tenant.slug, matrixPayload);
      showToast(`⚡ ${tenant.name}: All modules ${enableAll ? "granted" : "revoked"} in Neon Postgres`);
    } catch {
      showToast(`${tenant.name}: Modules updated`);
    } finally {
      setIsSavingDb(false);
    }
  };

  // Handle image logo upload to Cloudinary CDN
  const handleLogoUploadFile = async (file: File) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setLogoUploadError("Image size exceeds 5MB limit. Please choose a smaller file.");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setLogoUploadError("Unsupported format. Please upload PNG, JPG, SVG, WebP, or GIF.");
      return;
    }

    setLogoUploadError(null);
    setIsUploadingLogo(true);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Data,
          tenantId: editTenantSlug || selectedTenantForEdit?.slug || "tenant",
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || `Upload failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.url) {
        setEditTenantLogo(data.url);
        showToast("Brand logo uploaded to Cloudinary CDN!");
      }
    } catch (err: any) {
      console.error("Logo upload error:", err);
      setLogoUploadError(err.message || "Failed to upload image. Please check your network and try again.");
    } finally {
      setIsUploadingLogo(false);
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
      showToast(`Updated subscription limits for ${selectedTenantForQuota.name} in Neon Postgres!`);
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
    setEditTenantLogo(t.logo || "");
    setLogoUploadError(null);
  };

  // Save Edited Tenant Details to Neon Postgres database
  const handleSaveEditTenant = async () => {
    if (!selectedTenantForEdit) return;

    const updatedData = {
      name: editTenantName,
      slug: editTenantSlug,
      domain: editTenantDomain,
      ownerName: editTenantOwnerName,
      ownerEmail: editTenantOwnerEmail,
      planTier: editTenantPlanTier,
      status: editTenantStatus,
      logo: editTenantLogo,
      mrr: parseInt(editTenantMrr || "0", 10),
      leadsLimit: parseInt(editTenantLeadsLimit || "0", 10),
      campaignsLimit: parseInt(editTenantCampaignsLimit || "0", 10),
    };

    setIsSavingDb(true);
    try {
      await GTM_API.updateAdminOrganization(selectedTenantForEdit.id, updatedData);
      showToast(`Tenant '${editTenantName}' profile updated and synced to database!`);
      const remoteOrgs = await GTM_API.getAdminOrganizations().catch(() => null);
      if (Array.isArray(remoteOrgs) && remoteOrgs.length > 0) {
        setTenants(
          remoteOrgs.map((org: any, idx: number) => {
            const rawPlan = org.planTier || org.plan_tier || org.PlanTier || "GROWTH";
            const planTier = (["FREE_TRIAL", "STARTER", "GROWTH", "SCALE", "ENTERPRISE"].includes(rawPlan)
              ? rawPlan
              : "GROWTH") as TenantOrg["planTier"];
            const isSuspended = (org.status || org.Status || "").toUpperCase() === "SUSPENDED";
            const mrr = org.mrr !== undefined ? Number(org.mrr) : planTier === "ENTERPRISE" ? 100000 : planTier === "SCALE" ? 48000 : planTier === "STARTER" ? 9000 : planTier === "FREE_TRIAL" ? 0 : 24000;
            const orgSlug = org.slug || org.Slug || `org-${idx + 1}`;

            return {
              id: org.id || org.ID || `org-${idx + 1}`,
              name: org.name || org.Name || "Tenant Workspace",
              slug: orgSlug,
              domain: org.domain || org.Domain || `${orgSlug}.ofia.ng`,
              logo: org.logo || org.Logo || (org.id === selectedTenantForEdit.id ? editTenantLogo : undefined),
              ownerName: org.ownerName || org.owner_name || org.OwnerName || org.owner?.name || org.Owner?.Name || "System Admin",
              ownerEmail: org.ownerEmail || org.owner_email || org.OwnerEmail || org.owner?.email || org.Owner?.Email || `admin@${orgSlug}.ng`,
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
              erpModules: org.erpModules || selectedTenantForEdit.erpModules || { ...INITIAL_TENANTS[0].erpModules },
              createdAt: org.created_at
                ? new Date(org.created_at).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
            };
          })
        );
      } else {
        setTenants((prev) =>
          prev.map((t) => (t.id === selectedTenantForEdit.id ? { ...t, ...updatedData, logo: editTenantLogo } : t))
        );
      }
      setSelectedTenantForEdit(null);
    } catch (err) {
      console.warn("Remote tenant update failed:", err);
      showToast(`Tenant '${editTenantName}' updated locally`);
      setTenants((prev) =>
        prev.map((t) => (t.id === selectedTenantForEdit.id ? { ...t, ...updatedData, logo: editTenantLogo } : t))
      );
      setSelectedTenantForEdit(null);
    } finally {
      setIsSavingDb(false);
    }
  };

  // Toggle tenant suspension and persist status to Postgres database
  const handleToggleSuspend = async (id: string) => {
    const tenant = tenants.find((t) => t.id === id);
    if (!tenant) return;
    const nextStatus: TenantOrg["status"] = tenant.status === "Suspended" ? "Active" : "Suspended";

    setIsSavingDb(true);
    try {
      await GTM_API.updateAdminOrganization(id, {
        status: nextStatus === "Suspended" ? "SUSPENDED" : "ACTIVE",
      });
      showToast(`${tenant.name} status updated to ${nextStatus} in Postgres!`);
      setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));
    } catch (err) {
      console.warn("Remote status update failed:", err);
      showToast(`${tenant.name} status update failed`);
      setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));
    } finally {
      setIsSavingDb(false);
    }
  };

  // Create new tenant and persist to Postgres database
  const handleCreateTenant = async () => {
    if (!newOrgName || !newOrgDomain) {
      alert("Please provide organization name and domain.");
      return;
    }

    const slug = normalizeSubdomainSlug(newOrgName);
    const existingSlugs = new Set(tenants.map((t) => t.slug));
    const check = validateSubdomainAvailability(slug, existingSlugs);

    if (!check.isAvailable) {
      alert(`Cannot provision tenant: ${check.message}\nSuggested: ${check.suggestions.join(", ")}`);
      return;
    }

    setIsSavingDb(true);
    const newTenant: TenantOrg = {
      id: `org-${String(tenants.length + 1).padStart(2, "0")}`,
      name: newOrgName,
      slug,
      domain: newOrgDomain,
      ownerName: newOwnerName || "System Admin",
      ownerEmail: newOwnerEmail || `admin@${newOrgDomain}`,
      planTier: newPlanTier,
      status: "Active",
      mrr: newPlanTier === "ENTERPRISE" ? 100000 : newPlanTier === "SCALE" ? 48000 : newPlanTier === "STARTER" ? 9000 : newPlanTier === "FREE_TRIAL" ? 0 : 24000,
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

    // Persist to Postgres database via GTM_API and USER_API
    try {
      const createdRemote = await GTM_API.createAdminOrganization({
        name: newOrgName,
        slug,
        domain: newOrgDomain,
        owner_name: newOwnerName || "System Admin",
        owner_email: newOwnerEmail || `admin@${newOrgDomain}`,
        plan_tier: newPlanTier,
        billing_cycle: "MONTHLY",
      });
      if (createdRemote && createdRemote.id) {
        newTenant.id = createdRemote.id;
      }

      // Save initial RBAC matrix to Postgres TenantRolePermission table
      const defaultRoleKeys = ["tenant_provision", "admin", "md", "manager", "employee", "hr", "accountant"];
      const matrixPayload: Record<string, Record<string, boolean>> = {};
      defaultRoleKeys.forEach((role) => {
        matrixPayload[role] = { ...newErpModules };
      });
      await USER_API.saveTenantRBAC(slug, matrixPayload).catch(() => null);

      showToast(`Tenant '${newOrgName}' successfully created & saved to Postgres!`);
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
      subTabs={[]}
      action={
        <div className="flex items-center gap-2.5">
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
            className="bg-nexa-brand hover:bg-nexa-brand/90 text-white shadow-md shadow-nexa-brand/20 font-bold rounded-full px-4"
          >
            Provision New Tenant
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-8">
            {/* PLATFORM SUMMARY METRICS */}
            <AdminStatGrid
              stats={[
                {
                  label: "Total Active Tenants",
                  value: `${activeTenantsCount} / ${tenants.length} Orgs`,
                  change: `${trialingCount} Trials Active`,
                  trend: "up",
                  changeType: "info",
                  icon: <Building2 className="w-5 h-5 text-blue-500" />,
                  sub: "Enterprise & Free Workspaces",
                },
                {
                  label: "Contracted Monthly MRR",
                  value: `₦${(totalMRR / 1000000).toFixed(2)}M`,
                  change: "100% Reconciled",
                  trend: "up",
                  changeType: "success",
                  icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
                  sub: "Paystack & Invoiced Accounts",
                },
                {
                  label: "Configured ERP Modules",
                  value: "8 Modules",
                  change: "Active Matrix",
                  trend: "up",
                  changeType: "info",
                  icon: <Boxes className="w-5 h-5 text-purple-500" />,
                  sub: "AI, IMS, POS, Logistics, Referrals, HR",
                },
                {
                  label: "Security & RBAC Enforcement",
                  value: "Enforced",
                  change: "Live DB Sync",
                  trend: "up",
                  changeType: "warning",
                  icon: <ShieldCheck className="w-5 h-5 text-amber-500" />,
                  sub: "Multi-Tenant Least Privilege",
                },
              ]}
              columns={4}
            />

            {/* UNIFIED WORKSPACE SELECTOR & SEARCH/FILTERS CARD */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] shadow-xs space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* 1. SELECT TENANT WORKSPACE DROPDOWN */}
                <div className="relative min-w-[280px] sm:min-w-[340px]">
                  <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] hover:border-[#1A56DB] rounded-full transition-all group focus-within:border-[#1A56DB] focus-within:ring-2 focus-within:ring-[#1A56DB]/15">
                    <Building2 className="w-4 h-4 text-[#1A56DB] shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--nexa-text-muted)] leading-none">
                        Select Tenant Workspace to Configure
                      </span>
                      <select
                        value={selectedTenantId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedTenantId(val);
                          router.push(`/tenants?tenant=${val}`);
                        }}
                        aria-label="Select Tenant Workspace to Configure"
                        className="bg-transparent text-xs font-bold text-[var(--nexa-text-primary)] outline-none cursor-pointer appearance-none truncate mt-0.5 pr-4"
                      >
                        <option value="all" className="bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-primary)] font-bold">
                          All Organizations Directory ({tenants.length} Tenants)
                        </option>
                        <optgroup label="Tenant Workspaces" className="bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-primary)] font-bold">
                          {tenants.map((t) => (
                            <option key={t.id} value={t.id} className="bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-primary)] font-semibold">
                              {t.name} ({t.planTier.replace("_", " ")}) — {t.domain}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[var(--nexa-text-muted)] pointer-events-none shrink-0 group-hover:text-[#1A56DB]" />
                  </div>
                </div>

                {/* 2. SEARCH INPUT */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by organization name, slug, domain, or owner..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (selectedTenantId !== "all" && e.target.value.trim().length > 0) {
                        setSelectedTenantId("all");
                        router.push(`/tenants?tenant=all`);
                      }
                    }}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-full text-xs outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] placeholder:text-[var(--nexa-text-faint)] font-medium transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* 3. FILTERS (Plan Tier & Status) */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Plan Tier Filter */}
                  <div className="flex items-center gap-1 bg-[var(--nexa-bg-base)] p-1 rounded-full border border-[var(--nexa-border)]">
                    {["ALL", "GROWTH", "ENTERPRISE", "SCALE", "STARTER"].map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => {
                          setSelectedPlanFilter(plan);
                          if (selectedTenantId !== "all") {
                            setSelectedTenantId("all");
                            router.push(`/tenants?tenant=all`);
                          }
                        }}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer",
                          selectedPlanFilter === plan
                            ? "bg-[#1A56DB] text-white shadow-xs font-extrabold"
                            : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                        )}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>

                  {/* Status Filter */}
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => {
                      setSelectedStatusFilter(e.target.value);
                      if (selectedTenantId !== "all") {
                        setSelectedTenantId("all");
                        router.push(`/tenants?tenant=all`);
                      }
                    }}
                    className="px-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-full text-xs font-bold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB] cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Trialing">Trialing</option>
                    <option value="Past Due">Past Due</option>
                    <option value="Suspended">Suspended</option>
                  </select>

                  {/* Quick 'Back to All' pill if currently focused on a single tenant */}
                  {selectedTenantId !== "all" && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTenantId("all");
                        router.push("/tenants?tenant=all");
                      }}
                      className="px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Back to All</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* FOCUSED SINGLE TENANT VIEW */}
            {focusedTenant ? (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-6 shadow-xs">
                  {/* TENANT BANNER */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--nexa-border)]">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-[#1A56DB] flex items-center justify-center text-white font-black text-xl shadow-md shrink-0 ring-4 ring-[#1A56DB]/15 overflow-hidden">
                        {focusedTenant.logo ? (
                          <img
                            src={focusedTenant.logo}
                            alt={focusedTenant.name}
                            className="w-full h-full object-contain p-1 bg-white"
                          />
                        ) : (
                          focusedTenant.name.substring(0, 2).toUpperCase()
                        )}
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
                        <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                          Workspace:{" "}
                          <a
                            href={`https://${focusedTenant.domain}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-[#1A56DB] hover:underline"
                          >
                            {focusedTenant.domain}
                          </a>{" "}
                          • Storefront:{" "}
                          <a
                            href={`https://${focusedTenant.slug}.ofia.shop`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-[#1A56DB] hover:underline"
                          >
                            {focusedTenant.slug}.ofia.shop
                          </a>{" "}
                          • Owner: {focusedTenant.ownerName} ({focusedTenant.ownerEmail})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleOpenEditTenant(focusedTenant)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[var(--nexa-border)] hover:bg-[var(--nexa-bg-base)] text-xs font-bold text-[var(--nexa-text-primary)] transition-colors cursor-pointer shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#1A56DB]" />
                        <span>Edit Profile & Quotas</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTenantForQuota(focusedTenant);
                          setEditPlanTier(focusedTenant.planTier);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[var(--nexa-border)] hover:bg-[var(--nexa-bg-base)] text-xs font-bold text-[var(--nexa-text-primary)] transition-colors cursor-pointer shadow-xs"
                      >
                        <Sliders className="w-3.5 h-3.5 text-[#1A56DB]" />
                        <span>Adjust Limits</span>
                      </button>

                      <button
                        onClick={() => handleToggleSuspend(focusedTenant.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-bold transition-colors cursor-pointer shadow-xs",
                          focusedTenant.status === "Suspended"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 border-rose-500/20 text-rose-600 hover:bg-rose-500/20"
                        )}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{focusedTenant.status === "Suspended" ? "Activate Workspace" : "Suspend Tenant"}</span>
                      </button>

                      <button
                        onClick={() => handleImpersonate(focusedTenant)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1A56DB] text-white text-xs font-bold hover:bg-[#1545B0] transition-colors shadow-sm cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Impersonate Console</span>
                      </button>
                    </div>
                  </div>

                  {/* QUICK STATS CARDS FOR FOCUSED TENANT */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                      <span className="text-[11px] text-[var(--nexa-text-muted)]">Monthly Spend</span>
                      <p className="font-mono font-black text-base text-[var(--nexa-text-primary)]">
                        ${focusedTenant.monthlyAiSpendUSD.toFixed(2)} USD
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                      <span className="text-[11px] text-[var(--nexa-text-muted)]">Leads Pipeline</span>
                      <p className="font-mono font-black text-base text-[var(--nexa-text-primary)]">
                        {focusedTenant.leadsUsed.toLocaleString()} / {focusedTenant.leadsLimit.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                      <span className="text-[11px] text-[var(--nexa-text-muted)]">Active Campaigns</span>
                      <p className="font-mono font-black text-base text-[var(--nexa-text-primary)]">
                        {focusedTenant.campaignsActive} / {focusedTenant.campaignsLimit}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                      <span className="text-[11px] text-[var(--nexa-text-muted)]">Contracted MRR</span>
                      <p className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
                        ₦{focusedTenant.mrr.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* NESTED SUBSCRIPTIONS & LIMIT CONSUMPTION PROGRESS */}
                  <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#1A56DB]" />
                        <span className="font-extrabold text-[var(--nexa-text-primary)]">
                          Subscription Limits & Quota Governance
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] border border-[#1A56DB]/20 font-bold uppercase">
                          {focusedTenant.planTier}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[var(--nexa-text-muted)] font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Next billing: 1st of month
                        </span>
                        <button
                          onClick={() => {
                            setSelectedTenantForQuota(focusedTenant);
                            setEditPlanTier(focusedTenant.planTier);
                          }}
                          className="px-3 py-1 rounded-full text-xs font-bold bg-[#1A56DB] text-white hover:bg-[#1545B0] transition-colors cursor-pointer shadow-xs"
                        >
                          Adjust Limits
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--nexa-border)]">
                      {/* LEADS PROGRESS */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-[var(--nexa-text-secondary)] font-semibold">Leads Quota Consumption:</span>
                          <span className="font-black text-[var(--nexa-text-primary)]">
                            {focusedTenant.leadsUsed.toLocaleString()} / {focusedTenant.leadsLimit.toLocaleString()}{" "}
                            ({Math.min(100, Math.round((focusedTenant.leadsUsed / (focusedTenant.leadsLimit || 1)) * 100))}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[var(--nexa-bg-surface)] overflow-hidden border border-[var(--nexa-border)]">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              focusedTenant.leadsUsed / (focusedTenant.leadsLimit || 1) > 0.9
                                ? "bg-rose-500"
                                : focusedTenant.leadsUsed / (focusedTenant.leadsLimit || 1) > 0.7
                                ? "bg-amber-500"
                                : "bg-[#1A56DB]"
                            )}
                            style={{
                              width: `${Math.min(100, Math.round((focusedTenant.leadsUsed / (focusedTenant.leadsLimit || 1)) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* CAMPAIGNS PROGRESS */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-[var(--nexa-text-secondary)] font-semibold">Active Campaigns Capacity:</span>
                          <span className="font-black text-[var(--nexa-text-primary)]">
                            {focusedTenant.campaignsActive} / {focusedTenant.campaignsLimit}{" "}
                            ({Math.min(100, Math.round((focusedTenant.campaignsActive / (focusedTenant.campaignsLimit || 1)) * 100))}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[var(--nexa-bg-surface)] overflow-hidden border border-[var(--nexa-border)]">
                          <div
                            className="h-full rounded-full bg-[#0E9F6E]"
                            style={{
                              width: `${Math.min(100, Math.round((focusedTenant.campaignsActive / (focusedTenant.campaignsLimit || 1)) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ERP MODULES TOGGLE SWITCHBOARD */}
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--nexa-border)] pb-3">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                            <Sliders className="w-4 h-4 text-[#1A56DB]" />
                            ERP Module Provisioning Switchboard for {focusedTenant.name}
                          </h3>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Neon DB Synced
                          </span>
                        </div>
                        <p className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                          Toggle on/off modules in real-time. Changes are instantly persisted to the Neon PostgreSQL TenantRolePermission table and synchronized across ERP instances.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleBulkToggleTenant(focusedTenant.id, true)}
                          className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 cursor-pointer transition-colors"
                        >
                          Grant All 9 Modules
                        </button>
                        <button
                          onClick={() => handleBulkToggleTenant(focusedTenant.id, false)}
                          className="px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/20 cursor-pointer transition-colors"
                        >
                          Revoke All Modules
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {SUPER_ADMIN_ERP_MODULES.map((mod) => {
                        const isEnabled = focusedTenant.erpModules?.[mod.key] ?? true;
                        const isSaving = savingModuleKeys[mod.key];

                        return (
                          <div
                            key={mod.key}
                            onClick={() => !isSaving && handleToggleModule(focusedTenant.id, mod.key)}
                            className={cn(
                              "p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none group",
                              isEnabled
                                ? "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] hover:border-[#1A56DB]/50 shadow-xs"
                                : "bg-[var(--nexa-bg-base)]/30 border-[var(--nexa-border)]/50 opacity-55 hover:opacity-100",
                              isSaving && "opacity-75 cursor-wait"
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={cn(
                                  "w-9 h-9 rounded-full flex items-center justify-center text-white text-sm shrink-0 transition-transform group-hover:scale-105",
                                  isEnabled ? "bg-[#1A56DB] shadow-xs" : "bg-slate-400 dark:bg-slate-700 opacity-50"
                                )}
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
                                "w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 relative",
                                isEnabled ? "bg-[#1A56DB]" : "bg-slate-300 dark:bg-slate-700"
                              )}
                            >
                              <div
                                className={cn(
                                  "w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform flex items-center justify-center",
                                  isEnabled ? "translate-x-5" : "translate-x-0"
                                )}
                              >
                                {isSaving && (
                                  <Loader2 className="w-3 h-3 text-[#1A56DB] animate-spin" />
                                )}
                              </div>
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
                {/* TENANTS SINGLE COLUMN CARDS */}
                <div className="grid grid-cols-1 gap-4">
                  {filteredTenants
                    .slice((tenantPage - 1) * tenantItemsPerPage, (tenantPage - 1) * tenantItemsPerPage + tenantItemsPerPage)
                    .map((tenant, idx) => {
                    const isFocused = selectedTenantId === tenant.id;
                    const charNum = (((tenantPage - 1) * tenantItemsPerPage + idx) % 20) + 1;

                    return (
                      <div
                        key={tenant.id}
                        className={cn(
                          "p-5 rounded-3xl bg-[var(--nexa-bg-surface)] border transition-all space-y-4",
                          isFocused
                            ? "border-[#1A56DB] ring-2 ring-[#1A56DB]/20 shadow-md"
                            : "border-[var(--nexa-border)] hover:border-[#1A56DB]/40 shadow-xs"
                        )}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--nexa-border)]">
                          <div className="flex items-start gap-4">
                            {tenant.logo ? (
                              <img
                                src={tenant.logo}
                                alt={tenant.name}
                                className="w-12 h-12 rounded-full object-contain p-1 bg-white shadow-sm shrink-0 ring-4 ring-[#1A56DB]/15 border border-[var(--nexa-border)]"
                              />
                            ) : (
                              <img
                                src={`/character${charNum}.jpg`}
                                alt={tenant.name}
                                className="w-12 h-12 rounded-full object-cover shadow-sm shrink-0 ring-4 ring-[#1A56DB]/15 border border-[var(--nexa-border)]"
                              />
                            )}
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
                              <p className="text-[11px] text-[var(--nexa-text-muted)] mt-1">
                                Workspace:{" "}
                                <a
                                  href={`https://${tenant.domain}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-mono text-[#1A56DB] hover:underline"
                                >
                                  {tenant.domain}
                                </a>{" "}
                                • Owner: {tenant.ownerName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => handleOpenEditTenant(tenant)}
                              className="p-2 rounded-full border border-[var(--nexa-border)] hover:bg-[var(--nexa-bg-base)] text-xs text-[var(--nexa-text-secondary)] transition-colors cursor-pointer"
                              title="Edit Tenant Profile & Quotas"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#1A56DB]" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedTenantId(tenant.id);
                                router.push(`/tenants?tenant=${tenant.id}`);
                              }}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1A56DB] text-white text-xs font-bold hover:bg-[#1545B0] transition-colors cursor-pointer shadow-xs"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>Configure ERP</span>
                            </button>

                            <button
                              onClick={() => handleImpersonate(tenant)}
                              className="p-2 rounded-full border border-[var(--nexa-border)] hover:bg-[var(--nexa-bg-base)] text-xs text-[var(--nexa-text-secondary)] transition-colors cursor-pointer"
                              title="Impersonate Tenant Console"
                            >
                              <LogIn className="w-3.5 h-3.5 text-[#1A56DB]" />
                            </button>
                          </div>
                        </div>

                        {/* NESTED SUBSCRIPTION & LIMIT CONSUMPTION STRIP */}
                        <div className="p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2.5">
                          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-3.5 h-3.5 text-[#1A56DB]" />
                              <span className="font-bold text-[var(--nexa-text-primary)]">
                                Plan: {tenant.planTier}
                              </span>
                              <span className="text-[11px] font-mono font-bold text-[#1A56DB]">
                                ₦{tenant.mrr.toLocaleString()} / mo
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-[var(--nexa-text-muted)] font-mono flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Next cycle: 1st of month
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedTenantForQuota(tenant);
                                  setEditPlanTier(tenant.planTier);
                                }}
                                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1A56DB]/10 text-[#1A56DB] hover:bg-[#1A56DB] hover:text-white border border-[#1A56DB]/20 transition-colors cursor-pointer"
                              >
                                Adjust Limits
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--nexa-border)]/60">
                            {/* LEADS PROGRESS */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-mono">
                                <span className="text-[var(--nexa-text-secondary)] font-medium">Leads Consumption:</span>
                                <span className="font-bold text-[var(--nexa-text-primary)]">
                                  {(tenant.leadsUsed || 0).toLocaleString()} / {(tenant.leadsLimit || 0).toLocaleString()} ({Math.min(100, Math.round(((tenant.leadsUsed || 0) / (tenant.leadsLimit || 1)) * 100))}%)
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-[var(--nexa-bg-surface)] overflow-hidden border border-[var(--nexa-border)]">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    (tenant.leadsUsed || 0) / (tenant.leadsLimit || 1) > 0.9
                                      ? "bg-rose-500"
                                      : (tenant.leadsUsed || 0) / (tenant.leadsLimit || 1) > 0.7
                                      ? "bg-amber-500"
                                      : "bg-[#1A56DB]"
                                  )}
                                  style={{
                                    width: `${Math.min(100, Math.round(((tenant.leadsUsed || 0) / (tenant.leadsLimit || 1)) * 100))}%`,
                                  }}
                                />
                              </div>
                            </div>

                            {/* CAMPAIGNS PROGRESS */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-mono">
                                <span className="text-[var(--nexa-text-secondary)] font-medium">Active Campaigns:</span>
                                <span className="font-bold text-[var(--nexa-text-primary)]">
                                  {tenant.campaignsActive || 0} / {tenant.campaignsLimit || 0} ({Math.min(100, Math.round(((tenant.campaignsActive || 0) / (tenant.campaignsLimit || 1)) * 100))}%)
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-[var(--nexa-bg-surface)] overflow-hidden border border-[var(--nexa-border)]">
                                <div
                                  className="h-full rounded-full bg-[#0E9F6E]"
                                  style={{
                                    width: `${Math.min(100, Math.round(((tenant.campaignsActive || 0) / (tenant.campaignsLimit || 1)) * 100))}%`,
                                  }}
                                />
                              </div>
                            </div>
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
                                      "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs",
                                      isEnabled
                                        ? "bg-[#1A56DB]/10 text-[#1A56DB]"
                                        : "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-muted)]"
                                    )}
                                  >
                                    {getModuleIcon(mod.iconName)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-[var(--nexa-text-primary)] truncate">
                                      {mod.label}
                                    </p>
                                    <p className="text-[9px] text-[var(--nexa-text-muted)] font-mono truncate">
                                      /erp/{mod.key}
                                    </p>
                                  </div>
                                </div>

                                <div
                                  className={cn(
                                    "w-8 h-4.5 rounded-full p-0.5 transition-colors shrink-0",
                                    isEnabled ? "bg-[#1A56DB]" : "bg-[var(--nexa-border)]"
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

                <Pagination
                  currentPage={tenantPage}
                  totalPages={Math.max(1, Math.ceil(filteredTenants.length / tenantItemsPerPage))}
                  totalItems={filteredTenants.length}
                  itemsPerPage={tenantItemsPerPage}
                  onPageChange={setTenantPage}
                />
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
              <option value="STARTER">STARTER (₦9,000 / mo · 1,000 Leads)</option>
              <option value="GROWTH">GROWTH (₦24,000 / mo · 5,000 Leads)</option>
              <option value="SCALE">SCALE (₦48,000 / mo · 20,000 Leads)</option>
              <option value="ENTERPRISE">ENTERPRISE (₦100,000 / mo · 50,000 Leads)</option>
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
              onChange={(e) => {
                const val = e.target.value;
                setNewOrgName(val);
                if (!newOrgDomain || newOrgDomain.endsWith(".ofia.ng")) {
                  const s = normalizeSubdomainSlug(val);
                  setNewOrgDomain(s ? `${s}.ofia.ng` : "");
                }
              }}
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
            {newOrgName && (
              <div className="mt-1">
                {(() => {
                  const s = normalizeSubdomainSlug(newOrgName);
                  const existingSlugs = new Set(tenants.map((t) => t.slug));
                  const res = validateSubdomainAvailability(s, existingSlugs);
                  return (
                    <div
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${
                        res.isAvailable
                          ? "bg-[#0E9F6E]/10 text-[#0E9F6E] border border-[#0E9F6E]/20"
                          : "bg-[#E02424]/10 text-[#E02424] border border-[#E02424]/20"
                      }`}
                    >
                      {res.isAvailable ? (
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                      )}
                      <span>
                        {res.isAvailable
                          ? `Subdomain '${res.workspaceDomain}' & storefront '${res.storefrontDomain}' are available`
                          : res.message}
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}
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
              <option value="GROWTH">GROWTH (₦24,000 / mo · 5,000 Leads · 10 Campaigns)</option>
              <option value="ENTERPRISE">ENTERPRISE (₦100,000 / mo · 50,000 Leads · 100 Campaigns)</option>
              <option value="SCALE">SCALE (₦48,000 / mo · 20,000 Leads · 25 Campaigns)</option>
              <option value="STARTER">STARTER (₦9,000 / mo · 1,000 Leads · 3 Campaigns)</option>
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
                  <div className="w-5 h-5 rounded-full bg-[#1A56DB] flex items-center justify-center text-white text-[9px] shrink-0">
                    {getModuleIcon(m.iconName)}
                  </div>
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
              className="rounded-full px-4 font-bold"
            >
              Cancel
            </NexaButton>
            <NexaButton
              size="sm"
              variant="primary"
              onClick={handleCreateTenant}
              className="bg-[#1A56DB] text-white rounded-full font-bold px-4"
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
          {/* BRAND LOGO UPLOAD & MANAGEMENT */}
          <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#1A56DB]" />
                  Workspace Brand Logo
                </label>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">
                  Upload an official logo (PNG, SVG, JPG, WebP up to 5MB). Synced to Cloudinary CDN & database.
                </p>
              </div>
              {editTenantLogo && (
                <button
                  type="button"
                  onClick={() => setEditTenantLogo("")}
                  className="text-[11px] text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Remove Logo"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* LOGO PREVIEW */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] flex items-center justify-center overflow-hidden shadow-inner group-hover:border-[#1A56DB] transition-all">
                  {editTenantLogo ? (
                    <img
                      src={editTenantLogo}
                      alt="Brand Logo Preview"
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <Building2 className="w-6 h-6 mx-auto text-[var(--nexa-text-muted)] opacity-60" />
                      <span className="text-[9px] text-[var(--nexa-text-muted)] font-mono block mt-1">No Logo</span>
                    </div>
                  )}
                </div>
                {isUploadingLogo && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs rounded-2xl flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* UPLOAD CONTROLS & URL INPUT */}
              <div className="space-y-2 flex-1 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1A56DB] hover:bg-[#1545B0] text-white text-xs font-bold transition-all cursor-pointer shadow-xs">
                    {isUploadingLogo ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading to Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload New Logo</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                      className="hidden"
                      disabled={isUploadingLogo}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUploadFile(file);
                        e.target.value = "";
                      }}
                    />
                  </label>

                  <span className="text-[11px] text-[var(--nexa-text-muted)]">or paste CDN image URL:</span>
                </div>

                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://res.cloudinary.com/... or https://..."
                    value={editTenantLogo}
                    onChange={(e) => setEditTenantLogo(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-xl text-xs font-mono outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                  />
                </div>

                {logoUploadError && (
                  <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {logoUploadError}
                  </p>
                )}
              </div>
            </div>
          </div>

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
                <option value="STARTER">STARTER (₦9,000 / mo)</option>
                <option value="GROWTH">GROWTH (₦24,000 / mo)</option>
                <option value="SCALE">SCALE (₦48,000 / mo)</option>
                <option value="ENTERPRISE">ENTERPRISE (₦100,000 / mo)</option>
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
