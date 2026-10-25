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
  SHOP_SUB_MODULES,
  MOBILITY_SUB_MODULES,
  TENANT_VERTICAL_ARCHETYPES,
  ShopSubModuleItem,
  MobilitySubModuleItem,
  VerticalArchetype,
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
  Bike,
  Gift,
  Trophy,
  Users,
  Database,
  RefreshCw,
  FolderTree,
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
  Car,
  Package,
  ClipboardList,
  Palette,
  Utensils,
  Shirt,
  Laptop,
  Home,
  Radio,
  Wrench,
  MapPin,
  Calculator,
  Clock,
  Navigation,
  School,
  Eye,
  EyeOff,
  AlertCircle,
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
    case "Bike":
      return <Bike className="w-4 h-4" />;
    case "Gift":
      return <Gift className="w-4 h-4" />;
    case "Trophy":
      return <Trophy className="w-4 h-4" />;
    case "Users":
      return <Users className="w-4 h-4" />;
    case "ShieldCheck":
      return <ShieldCheck className="w-4 h-4" />;
    case "Building2":
    case "Building":
      return <Building2 className="w-4 h-4" />;
    case "Car":
      return <Car className="w-4 h-4" />;
    case "Layers":
      return <Layers className="w-4 h-4" />;
    case "Package":
      return <Package className="w-4 h-4" />;
    case "Calendar":
      return <Calendar className="w-4 h-4" />;
    case "ClipboardList":
      return <ClipboardList className="w-4 h-4" />;
    case "Palette":
      return <Palette className="w-4 h-4" />;
    case "Utensils":
      return <Utensils className="w-4 h-4" />;
    case "Shirt":
      return <Shirt className="w-4 h-4" />;
    case "Laptop":
      return <Laptop className="w-4 h-4" />;
    case "Home":
      return <Home className="w-4 h-4" />;
    case "Activity":
      return <Activity className="w-4 h-4" />;
    case "Zap":
      return <Zap className="w-4 h-4" />;
    case "Sparkles":
      return <Sparkles className="w-4 h-4" />;
    case "Radio":
      return <Radio className="w-4 h-4" />;
    case "Wrench":
      return <Wrench className="w-4 h-4" />;
    case "MapPin":
      return <MapPin className="w-4 h-4" />;
    case "Calculator":
      return <Calculator className="w-4 h-4" />;
    case "Clock":
      return <Clock className="w-4 h-4" />;
    case "Navigation":
      return <Navigation className="w-4 h-4" />;
    case "School":
      return <School className="w-4 h-4" />;
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
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [newOrgDomain, setNewOrgDomain] = useState("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [newPlanTier, setNewPlanTier] = useState<TenantOrg["planTier"]>("GROWTH");
  const [newErpModules, setNewErpModules] = useState<Record<string, boolean>>({
    ai: true,
    crm: true,
    marketplace: true,
    shop: true,
    accounting: true,
    hr: true,
    mobility: true,
    dispatch: true,
    users: true,
  });
  const [newVertical, setNewVertical] = useState<string>("retail");

  // Dedicated Infrastructure (BYODB & BYOS) for New Tenant
  const [newDatabaseUrl, setNewDatabaseUrl] = useState("");
  const [newCloudinaryUrl, setNewCloudinaryUrl] = useState("");

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
  const [editTenantDatabaseUrl, setEditTenantDatabaseUrl] = useState("");
  const [editTenantCloudinaryUrl, setEditTenantCloudinaryUrl] = useState("");
  const [editDbMode, setEditDbMode] = useState<"DEDICATED">("DEDICATED");
  const [showDbPassword, setShowDbPassword] = useState(false);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; latencyMs?: number; version?: string; error?: string } | null>(null);
  const [isProvisioningDb, setIsProvisioningDb] = useState(false);
  const [provisionResult, setProvisionResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [savingModuleKeys, setSavingModuleKeys] = useState<Record<string, boolean>>({});

  // Tenant Deletion State
  const [tenantToDelete, setTenantToDelete] = useState<TenantOrg | null>(null);
  const [isDeletingTenant, setIsDeletingTenant] = useState<boolean>(false);

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
        // 1. Fetch live organizations from Postgres database (platform_tenants registry)
        let remoteOrgs: any[] | null = null;
        try {
          const adminTenantsRes = await fetch("/api/admin/tenants", { cache: "no-store" });
          if (adminTenantsRes.ok) {
            const data = await adminTenantsRes.json();
            if (data.success && Array.isArray(data.tenants) && data.tenants.length > 0) {
              remoteOrgs = data.tenants;
            }
          }
        } catch {}

        if (!remoteOrgs) {
          remoteOrgs = await GTM_API.getAdminOrganizations().catch(() => null);
        }
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
              vertical: org.vertical || org.Vertical || "retail",
              erpModules: org.erp_modules || org.erpModules || { ...INITIAL_TENANTS[0].erpModules },
              shopSubModules: org.shop_sub_modules || org.shopSubModules || {
                pos: true,
                inventory: true,
                catalog: true,
                services: true,
                orders: true,
                store: true,
                referrals: true,
              },
              mobilitySubModules: org.mobility_sub_modules || org.mobilitySubModules || {
                ops: false,
                vehicles: false,
                drivers: false,
                maintenance: false,
                routes: false,
                finance: false,
                shuttle: false,
                interstate: false,
                on_demand: false,
                rental: false,
                school: false,
                staff: false,
              },
              databaseUrl: org.database_url || org.databaseUrl || "",
              cloudinaryUrl: org.cloudinary_url || org.cloudinaryUrl || "",
              isCustomDb: Boolean(org.is_custom_db || org.isCustomDb || org.database_url || org.databaseUrl),
              isCustomStorage: Boolean(org.is_custom_storage || org.isCustomStorage || org.cloudinary_url || org.cloudinaryUrl),
              createdAt: org.createdAt || org.created_at
                ? new Date(org.createdAt || org.created_at).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
            };
          });

          baseList = mappedRemote;
        }

        if (isMounted) {
          setTenants(baseList);
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
  const focusedTenant = selectedTenantId !== "all" ? tenants.find((t) => t.id === selectedTenantId || t.slug === selectedTenantId) : null;

  const handleImpersonate = (t: TenantOrg) => {
    const isLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const targetUrl = isLocal
      ? `http://localhost:3002/erp/admin?tenant=${encodeURIComponent(t.slug)}`
      : t.domain.includes(".")
      ? `https://${t.domain}/erp/admin`
      : `https://${t.slug}.ofia.ng/erp/admin`;
    window.open(targetUrl, "_blank");
  };

  // Toggle single module for a tenant with remote DB persistence in platform_tenants & TenantRolePermission
  const handleToggleModule = async (tenantId: string, moduleKey: string) => {
    const tenant = tenants.find((t) => t.id === tenantId || t.slug === tenantId);
    if (!tenant) return;

    const currentModules = tenant.erpModules || {};
    const newStatus = !currentModules[moduleKey];
    const updatedModules = { ...currentModules, [moduleKey]: newStatus };

    // Update local state immediately
    setTenants((prev) =>
      prev.map((t) => (t.id === tenant.id || t.slug === tenant.slug ? { ...t, erpModules: updatedModules } : t))
    );

    // Persist to Neon Postgres database table platform_tenants & TenantRolePermission
    setSavingModuleKeys((prev) => ({ ...prev, [moduleKey]: true }));
    setIsSavingDb(true);
    try {
      const targetSlug = tenant.slug || tenant.id;
      const res = await fetch(`/api/admin/tenants/${encodeURIComponent(targetSlug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tenant.id,
          slug: tenant.slug,
          erp_modules: updatedModules,
          shop_sub_modules: tenant.shopSubModules,
          mobility_sub_modules: tenant.mobilitySubModules,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      showToast(`⚡ ${tenant.name}: '${moduleKey.toUpperCase()}' module synced to Neon Postgres`);

      // Extra background sync to central user service without blocking UI
      const defaultRoleKeys = [
        "tenant_provision",
        "admin",
        "md",
        "manager",
        "employee",
        "hr",
        "accountant",
        "dispatcher",
        "sales_closer",
        "marketer",
      ];
      const matrixPayload: Record<string, Record<string, boolean>> = {};
      const isCrmActive = updatedModules.crm ?? (moduleKey === "crm" ? newStatus : false);
      const isUsersActive = updatedModules.users ?? (moduleKey === "users" ? newStatus : false);

      defaultRoleKeys.forEach((role) => {
        if (role === "employee") {
          matrixPayload[role] = {
            employee: isUsersActive,
            quests: updatedModules.quests ?? true,
            mission: false,
            ai: false,
            crm: false,
            sales_closer: false,
            users: isUsersActive,
            marketplace: false,
            shop: false,
            inventory: false,
            pos: false,
            referrals: false,
            accounting: false,
            hr: false,
            manager: false,
            md: false,
            mobility: false,
            dispatch: false,
          };
        } else if (role === "sales_closer") {
          matrixPayload[role] = {
            employee: isUsersActive,
            quests: true,
            crm: isCrmActive,
            sales_closer: isCrmActive,
            mission: false,
            ai: false,
            users: isUsersActive,
            marketplace: false,
            shop: false,
            inventory: false,
            pos: false,
            referrals: false,
            accounting: false,
            hr: false,
            manager: false,
            md: false,
            mobility: false,
            dispatch: false,
          };
        } else if (role === "marketer") {
          matrixPayload[role] = {
            employee: isUsersActive,
            quests: true,
            crm: isCrmActive,
            sales_closer: isCrmActive,
            ai: updatedModules.ai ?? true,
            marketplace: updatedModules.marketplace ?? true,
            users: isUsersActive,
            ...(tenant.shopSubModules || {}),
          };
        } else {
          matrixPayload[role] = {
            ...updatedModules,
            users: isUsersActive,
            employee: isUsersActive,
            manager: isUsersActive,
            md: isUsersActive,
            sales_closer: isCrmActive,
            ...(tenant.shopSubModules || {}),
            ...(tenant.mobilitySubModules || {}),
          };
          if (!newStatus) {
            matrixPayload[role][moduleKey] = false;
          }
        }
      });
      USER_API.saveTenantRBAC(tenant.slug, matrixPayload).catch(() => null);
    } catch (err: any) {
      console.warn("Failed to persist module toggle:", err);
      showToast(`⚠️ Failed to persist module: ${err.message || "Network error"}`);
      // Revert on failure
      setTenants((prev) =>
        prev.map((t) => (t.id === tenant.id || t.slug === tenant.slug ? { ...t, erpModules: currentModules } : t))
      );
    } finally {
      setIsSavingDb(false);
      setSavingModuleKeys((prev) => ({ ...prev, [moduleKey]: false }));
    }
  };

  // Bulk toggle for a tenant
  const handleBulkToggleTenant = async (tenantId: string, enableAll: boolean) => {
    const tenant = tenants.find((t) => t.id === tenantId || t.slug === tenantId);
    if (!tenant) return;

    const previousModules = tenant.erpModules || {};
    const updatedModules: Record<string, boolean> = {};
    SUPER_ADMIN_ERP_MODULES.forEach((m) => {
      updatedModules[m.key] = enableAll;
    });

    setTenants((prev) =>
      prev.map((t) => (t.id === tenant.id || t.slug === tenant.slug ? { ...t, erpModules: updatedModules } : t))
    );

    setIsSavingDb(true);
    try {
      const targetSlug = tenant.slug || tenant.id;
      const res = await fetch(`/api/admin/tenants/${encodeURIComponent(targetSlug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tenant.id,
          slug: tenant.slug,
          erp_modules: updatedModules,
          shop_sub_modules: tenant.shopSubModules,
          mobility_sub_modules: tenant.mobilitySubModules,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      showToast(`⚡ ${tenant.name}: All modules ${enableAll ? "granted" : "revoked"} in Neon Postgres`);

      const defaultRoleKeys = [
        "tenant_provision",
        "admin",
        "md",
        "manager",
        "employee",
        "hr",
        "accountant",
        "dispatcher",
        "sales_closer",
        "marketer",
      ];
      const matrixPayload: Record<string, Record<string, boolean>> = {};
      defaultRoleKeys.forEach((role) => {
        if (role === "employee") {
          matrixPayload[role] = {
            employee: true,
            quests: enableAll,
            mission: false,
            ai: false,
            crm: false,
            sales_closer: false,
            users: false,
            marketplace: false,
            shop: false,
            inventory: false,
            pos: false,
            referrals: false,
            accounting: false,
            hr: false,
            manager: false,
            md: false,
            mobility: false,
            dispatch: false,
          };
        } else if (role === "sales_closer") {
          matrixPayload[role] = {
            employee: true,
            quests: true,
            crm: enableAll,
            sales_closer: enableAll,
            mission: false,
            ai: false,
            users: false,
            marketplace: false,
            shop: false,
            inventory: false,
            pos: false,
            referrals: false,
            accounting: false,
            hr: false,
            manager: false,
            md: false,
            mobility: false,
            dispatch: false,
          };
        } else if (role === "marketer") {
          matrixPayload[role] = {
            employee: true,
            quests: true,
            crm: enableAll,
            sales_closer: enableAll,
            ai: enableAll,
            marketplace: enableAll,
            ...(tenant.shopSubModules || {}),
          };
        } else {
          matrixPayload[role] = {
            ...updatedModules,
            sales_closer: enableAll,
            ...(tenant.shopSubModules || {}),
            ...(tenant.mobilitySubModules || {}),
          };
        }
      });
      USER_API.saveTenantRBAC(tenant.slug, matrixPayload).catch(() => null);
    } catch (err: any) {
      console.warn("Failed to persist bulk modules toggle:", err);
      showToast(`⚠️ Failed to persist modules: ${err.message || "Error"}`);
      setTenants((prev) =>
        prev.map((t) => (t.id === tenant.id || t.slug === tenant.slug ? { ...t, erpModules: previousModules } : t))
      );
    } finally {
      setIsSavingDb(false);
    }
  };

  // Toggle individual Shop Sub-Module (pos, inventory, catalog, services, orders, store, referrals)
  const handleToggleShopSubModule = async (tenantId: string, subKey: string) => {
    const tenant = tenants.find((t) => t.id === tenantId || t.slug === tenantId);
    if (!tenant) return;

    const currentSubs = tenant.shopSubModules || {
      pos: true,
      inventory: true,
      catalog: true,
      services: true,
      orders: true,
      store: true,
      referrals: true,
    };
    const newStatus = !currentSubs[subKey];
    const updatedSubs = { ...currentSubs, [subKey]: newStatus };
    const updatedModules = { ...(tenant.erpModules || {}), [subKey]: newStatus };

    // Update local state immediately
    setTenants((prev) =>
      prev.map((t) =>
        t.id === tenant.id || t.slug === tenant.slug
          ? { ...t, shopSubModules: updatedSubs, erpModules: updatedModules }
          : t
      )
    );

    // Persist to Neon Postgres DB
    setSavingModuleKeys((prev) => ({ ...prev, [`shop_${subKey}`]: true }));
    setIsSavingDb(true);
    try {
      const targetSlug = tenant.slug || tenant.id;
      const res = await fetch(`/api/admin/tenants/${encodeURIComponent(targetSlug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tenant.id,
          slug: tenant.slug,
          erp_modules: tenant.erpModules,
          shop_sub_modules: updatedSubs,
          mobility_sub_modules: tenant.mobilitySubModules,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const subItem = SHOP_SUB_MODULES.find((s) => s.key === subKey);
      showToast(`⚡ ${tenant.name}: '${subItem?.shortLabel || subKey}' sub-module ${newStatus ? "enabled" : "disabled"}`);

      const defaultRoleKeys = ["tenant_provision", "admin", "md", "manager", "employee", "hr", "accountant"];
      const matrixPayload: Record<string, Record<string, boolean>> = {};
      defaultRoleKeys.forEach((role) => {
        matrixPayload[role] = {
          ...(tenant.erpModules || {}),
          ...updatedSubs,
        };
      });
      USER_API.saveTenantRBAC(tenant.slug, matrixPayload).catch(() => null);
      GTM_API.updateAdminOrganization(tenant.id, { shopSubModules: updatedSubs }).catch(() => null);
    } catch (err: any) {
      console.warn("Failed to persist shop sub-module toggle:", err);
      showToast(`⚠️ Failed to persist sub-module: ${err.message || "Error"}`);
      setTenants((prev) =>
        prev.map((t) =>
          t.id === tenant.id || t.slug === tenant.slug
            ? { ...t, shopSubModules: currentSubs, erpModules: tenant.erpModules }
            : t
        )
      );
    } finally {
      setIsSavingDb(false);
      setSavingModuleKeys((prev) => ({ ...prev, [`shop_${subKey}`]: false }));
    }
  };

  // Bulk toggle Shop Sub-Modules
  const handleBulkToggleShopSubModules = async (tenantId: string, enableAll: boolean) => {
    const tenant = tenants.find((t) => t.id === tenantId || t.slug === tenantId);
    if (!tenant) return;

    const previousSubs = tenant.shopSubModules || {};
    const updatedSubs: Record<string, boolean> = {};
    SHOP_SUB_MODULES.forEach((s) => {
      updatedSubs[s.key] = enableAll;
    });
    const updatedModules = { ...(tenant.erpModules || {}), ...updatedSubs };

    setTenants((prev) =>
      prev.map((t) =>
        t.id === tenant.id || t.slug === tenant.slug
          ? { ...t, shopSubModules: updatedSubs, erpModules: updatedModules }
          : t
      )
    );

    setIsSavingDb(true);
    try {
      const targetSlug = tenant.slug || tenant.id;
      const res = await fetch(`/api/admin/tenants/${encodeURIComponent(targetSlug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tenant.id,
          slug: tenant.slug,
          erp_modules: tenant.erpModules,
          shop_sub_modules: updatedSubs,
          mobility_sub_modules: tenant.mobilitySubModules,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      showToast(`⚡ ${tenant.name}: All Shop sub-modules ${enableAll ? "enabled" : "disabled"}`);

      const defaultRoleKeys = ["tenant_provision", "admin", "md", "manager", "employee", "hr", "accountant"];
      const matrixPayload: Record<string, Record<string, boolean>> = {};
      defaultRoleKeys.forEach((role) => {
        matrixPayload[role] = {
          ...(tenant.erpModules || {}),
          ...updatedSubs,
        };
      });
      USER_API.saveTenantRBAC(tenant.slug, matrixPayload).catch(() => null);
      GTM_API.updateAdminOrganization(tenant.id, { shopSubModules: updatedSubs }).catch(() => null);
    } catch (err: any) {
      console.warn("Failed to persist bulk shop sub-modules:", err);
      showToast(`⚠️ Failed to persist: ${err.message || "Error"}`);
      setTenants((prev) =>
        prev.map((t) =>
          t.id === tenant.id || t.slug === tenant.slug
            ? { ...t, shopSubModules: previousSubs, erpModules: tenant.erpModules }
            : t
        )
      );
    } finally {
      setIsSavingDb(false);
    }
  };

  // Toggle individual Mobility Sub-Module (ops, vehicles, drivers, maintenance, routes, finance, shuttle, interstate, on_demand, rental, school, staff)
  const handleToggleMobilitySubModule = async (tenantId: string, subKey: string) => {
    const tenant = tenants.find((t) => t.id === tenantId || t.slug === tenantId);
    if (!tenant) return;

    const currentSubs = tenant.mobilitySubModules || {
      ops: true,
      vehicles: true,
      drivers: true,
      maintenance: true,
      routes: true,
      finance: true,
      shuttle: true,
      interstate: true,
      on_demand: true,
      rental: true,
      school: true,
      staff: true,
    };
    const newStatus = !currentSubs[subKey];
    const updatedSubs = { ...currentSubs, [subKey]: newStatus };
    const updatedModules = { ...(tenant.erpModules || {}), [subKey]: newStatus };

    // Update local state immediately
    setTenants((prev) =>
      prev.map((t) =>
        t.id === tenant.id || t.slug === tenant.slug
          ? { ...t, mobilitySubModules: updatedSubs, erpModules: updatedModules }
          : t
      )
    );

    // Persist to Neon Postgres DB
    setSavingModuleKeys((prev) => ({ ...prev, [`mobility_${subKey}`]: true }));
    setIsSavingDb(true);
    try {
      const targetSlug = tenant.slug || tenant.id;
      const res = await fetch(`/api/admin/tenants/${encodeURIComponent(targetSlug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tenant.id,
          slug: tenant.slug,
          erp_modules: tenant.erpModules,
          shop_sub_modules: tenant.shopSubModules,
          mobility_sub_modules: updatedSubs,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const subItem = MOBILITY_SUB_MODULES.find((s) => s.key === subKey);
      showToast(`⚡ ${tenant.name}: '${subItem?.shortLabel || subKey}' sub-module ${newStatus ? "enabled" : "disabled"}`);

      const defaultRoleKeys = ["tenant_provision", "admin", "md", "manager", "employee", "hr", "accountant", "dispatcher"];
      const matrixPayload: Record<string, Record<string, boolean>> = {};
      defaultRoleKeys.forEach((role) => {
        matrixPayload[role] = {
          ...(tenant.erpModules || {}),
          ...(tenant.shopSubModules || {}),
          ...updatedSubs,
          "on-demand": updatedSubs.on_demand !== undefined ? updatedSubs.on_demand : Boolean(updatedSubs["on-demand"]),
        };
      });
      USER_API.saveTenantRBAC(tenant.slug, matrixPayload).catch(() => null);
    } catch (err: any) {
      console.warn("Failed to persist mobility sub-module toggle:", err);
      showToast(`⚠️ Failed to persist sub-module: ${err.message || "Error"}`);
      setTenants((prev) =>
        prev.map((t) =>
          t.id === tenant.id || t.slug === tenant.slug
            ? { ...t, mobilitySubModules: currentSubs, erpModules: tenant.erpModules }
            : t
        )
      );
    } finally {
      setIsSavingDb(false);
      setSavingModuleKeys((prev) => ({ ...prev, [`mobility_${subKey}`]: false }));
    }
  };

  // Bulk toggle Mobility Sub-Modules
  const handleBulkToggleMobilitySubModules = async (tenantId: string, enableAll: boolean) => {
    const tenant = tenants.find((t) => t.id === tenantId || t.slug === tenantId);
    if (!tenant) return;

    const previousSubs = tenant.mobilitySubModules || {};
    const updatedSubs: Record<string, boolean> = {};
    MOBILITY_SUB_MODULES.forEach((s) => {
      updatedSubs[s.key] = enableAll;
    });
    const updatedModules = { ...(tenant.erpModules || {}), ...updatedSubs };

    setTenants((prev) =>
      prev.map((t) =>
        t.id === tenant.id || t.slug === tenant.slug
          ? { ...t, mobilitySubModules: updatedSubs, erpModules: updatedModules }
          : t
      )
    );

    setIsSavingDb(true);
    try {
      const targetSlug = tenant.slug || tenant.id;
      const res = await fetch(`/api/admin/tenants/${encodeURIComponent(targetSlug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tenant.id,
          slug: tenant.slug,
          erp_modules: tenant.erpModules,
          shop_sub_modules: tenant.shopSubModules,
          mobility_sub_modules: updatedSubs,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      showToast(`⚡ ${tenant.name}: All Mobility sub-modules ${enableAll ? "enabled" : "disabled"}`);

      const defaultRoleKeys = ["tenant_provision", "admin", "md", "manager", "employee", "hr", "accountant", "dispatcher"];
      const matrixPayload: Record<string, Record<string, boolean>> = {};
      defaultRoleKeys.forEach((role) => {
        matrixPayload[role] = {
          ...(tenant.erpModules || {}),
          ...(tenant.shopSubModules || {}),
          ...updatedSubs,
          "on-demand": updatedSubs.on_demand !== undefined ? updatedSubs.on_demand : Boolean(updatedSubs["on-demand"]),
        };
      });
      USER_API.saveTenantRBAC(tenant.slug, matrixPayload).catch(() => null);
    } catch (err: any) {
      console.warn("Failed to persist bulk mobility toggle:", err);
      showToast(`⚠️ Failed to persist: ${err.message || "Error"}`);
      setTenants((prev) =>
        prev.map((t) =>
          t.id === tenant.id || t.slug === tenant.slug
            ? { ...t, mobilitySubModules: previousSubs, erpModules: tenant.erpModules }
            : t
        )
      );
    } finally {
      setIsSavingDb(false);
    }
  };

  // Assign Industry Vertical Archetype for Tenant
  const handleAssignVertical = async (tenantId: string, verticalKey: string) => {
    const tenant = tenants.find((t) => t.id === tenantId || t.slug === tenantId);
    if (!tenant) return;

    const prevVertical = tenant.vertical;
    setTenants((prev) =>
      prev.map((t) => (t.id === tenant.id || t.slug === tenant.slug ? { ...t, vertical: verticalKey } : t))
    );

    setIsSavingDb(true);
    try {
      const targetSlug = tenant.slug || tenant.id;
      const res = await fetch(`/api/admin/tenants/${encodeURIComponent(targetSlug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tenant.id,
          slug: tenant.slug,
          vertical: verticalKey,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      await GTM_API.updateAdminOrganization(tenant.id, {
        vertical: verticalKey,
      }).catch(() => null);

      const vertObj = TENANT_VERTICAL_ARCHETYPES.find((v) => v.id === verticalKey);
      showToast(`⚡ ${tenant.name}: Assigned to '${vertObj?.name || verticalKey}' vertical`);
    } catch (err: any) {
      console.warn("Failed to persist vertical assignment:", err);
      showToast(`⚠️ Failed to persist vertical: ${err.message || "Error"}`);
      setTenants((prev) =>
        prev.map((t) => (t.id === tenant.id || t.slug === tenant.slug ? { ...t, vertical: prevVertical } : t))
      );
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
      const targetSlug = selectedTenantForQuota.slug || selectedTenantForQuota.id;
      const res = await fetch(`/api/admin/tenants/${encodeURIComponent(targetSlug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTenantForQuota.id,
          slug: selectedTenantForQuota.slug,
          plan_tier: editPlanTier,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      await GTM_API.updateAdminOrganization(selectedTenantForQuota.id, {
        plan_tier: editPlanTier,
      }).catch(() => null);

      showToast(`Updated subscription limits for ${selectedTenantForQuota.name} in Neon Postgres!`);
      setTenants((prev) =>
        prev.map((t) =>
          t.id === selectedTenantForQuota.id || t.slug === selectedTenantForQuota.slug
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
    } catch (err: any) {
      console.warn("Failed to persist quota:", err);
      showToast(`⚠️ Failed to update quota: ${err.message || "Error"}`);
    } finally {
      setIsSavingDb(false);
    }
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
    setEditTenantDatabaseUrl(t.databaseUrl || "");
    setEditTenantCloudinaryUrl(t.cloudinaryUrl || "");
    setEditDbMode("DEDICATED");
    setShowDbPassword(false);
    setDbTestResult(null);
    setProvisionResult(null);
    setLogoUploadError(null);
  };

  // Test custom database connection
  const handleTestCustomDb = async (url: string) => {
    if (!url || !url.trim()) {
      setDbTestResult({ success: false, error: "Please enter a PostgreSQL connection URL to test." });
      return;
    }
    setIsTestingDb(true);
    setDbTestResult(null);
    try {
      const res = await fetch("/api/admin/tenants/test-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ databaseUrl: url.trim() }),
      });
      const data = await res.json();
      setDbTestResult(data);
    } catch (err: any) {
      setDbTestResult({ success: false, error: err.message || "Diagnostic test request failed." });
    } finally {
      setIsTestingDb(false);
    }
  };

  // Bootstrap commerce tables on dedicated standalone database
  const handleProvisionCustomDb = async (url: string) => {
    if (!url || !url.trim()) {
      showToast("Please provide a valid PostgreSQL connection string first.");
      return;
    }
    setIsProvisioningDb(true);
    setProvisionResult(null);
    try {
      const res = await fetch("/api/admin/tenants/provision-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ databaseUrl: url.trim() }),
      });
      const data = await res.json();
      setProvisionResult(data);
      if (data.success) {
        showToast("Dedicated database provisioned with commerce schemas!");
      } else {
        showToast("Schema bootstrap warning: " + (data.error || data.message));
      }
    } catch (err: any) {
      setProvisionResult({ success: false, message: err.message });
    } finally {
      setIsProvisioningDb(false);
    }
  };

  // Save Edited Tenant Details to Neon Postgres database
  const handleSaveEditTenant = async () => {
    if (!selectedTenantForEdit) return;

    const isDedicated = editDbMode === "DEDICATED" && Boolean(editTenantDatabaseUrl.trim());

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
      database_url: editTenantDatabaseUrl.trim(),
      cloudinary_url: editTenantCloudinaryUrl.trim(),
      db_mode: editDbMode,
      is_custom_db: isDedicated,
      erp_modules: selectedTenantForEdit.erpModules,
      shop_sub_modules: selectedTenantForEdit.shopSubModules,
      mobility_sub_modules: selectedTenantForEdit.mobilitySubModules,
    };

    setIsSavingDb(true);
    try {
      const targetSlug = selectedTenantForEdit.slug || selectedTenantForEdit.id;
      // 1. Persist directly to Neon platform_tenants registry & trigger automatic module alignment
      const res = await fetch(`/api/admin/tenants/${encodeURIComponent(targetSlug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      // 2. Sync to microservices
      await GTM_API.updateAdminOrganization(selectedTenantForEdit.id, updatedData).catch(() => null);

      showToast(`⚡ ${editTenantName}: Profile and Database-Per-Tenant architecture saved!`);

      // Update local state directly with updatedData
      setTenants((prev) =>
        prev.map((t) =>
          t.id === selectedTenantForEdit.id || t.slug === selectedTenantForEdit.slug
            ? {
                ...t,
                ...updatedData,
                databaseUrl: editTenantDatabaseUrl.trim(),
                cloudinaryUrl: editTenantCloudinaryUrl.trim(),
                isCustomDb: Boolean(editTenantDatabaseUrl.trim()),
                isCustomStorage: Boolean(editTenantCloudinaryUrl.trim()),
                logo: editTenantLogo,
              }
            : t
        )
      );
      setSelectedTenantForEdit(null);
    } catch (err: any) {
      console.warn("Remote tenant update failed:", err);
      showToast(`⚠️ Failed to save tenant: ${err.message || "Error"}`);
    } finally {
      setIsSavingDb(false);
    }
  };

  // Permanently delete a tenant from platform_tenants registry
  const handleDeleteTenant = async (tenant: TenantOrg) => {
    setIsDeletingTenant(true);
    try {
      const targetSlug = tenant.slug || tenant.id;
      const res = await fetch(`/api/admin/tenants/${encodeURIComponent(targetSlug)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Tenant '${tenant.name}' deleted successfully.`);
        setTenants((prev) => prev.filter((t) => t.id !== tenant.id && t.slug !== tenant.slug));
        if (selectedTenantId === tenant.id || selectedTenantId === tenant.slug) {
          setSelectedTenantId("all");
          router.push("/tenants?tenant=all");
        }
        setTenantToDelete(null);
      } else {
        alert("Failed to delete tenant: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error deleting tenant: " + (err.message || "Network error"));
    } finally {
      setIsDeletingTenant(false);
    }
  };

  // Toggle tenant suspension and persist status to Postgres database
  const handleToggleSuspend = async (id: string) => {
    const tenant = tenants.find((t) => t.id === id || t.slug === id);
    if (!tenant) return;
    const nextStatus: TenantOrg["status"] = tenant.status === "Suspended" ? "Active" : "Suspended";

    setIsSavingDb(true);
    try {
      const targetSlug = tenant.slug || tenant.id;
      const res = await fetch(`/api/admin/tenants/${encodeURIComponent(targetSlug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tenant.id,
          slug: tenant.slug,
          status: nextStatus,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      await GTM_API.updateAdminOrganization(tenant.id, {
        status: nextStatus === "Suspended" ? "SUSPENDED" : "ACTIVE",
      }).catch(() => null);

      showToast(`${tenant.name} status updated to ${nextStatus} in Postgres!`);
      setTenants((prev) => prev.map((t) => (t.id === tenant.id || t.slug === tenant.slug ? { ...t, status: nextStatus } : t)));
    } catch (err: any) {
      console.warn("Remote status update failed:", err);
      showToast(`⚠️ Failed to update status: ${err.message || "Error"}`);
    } finally {
      setIsSavingDb(false);
    }
  };

  // Create new tenant and persist to Postgres database
  const handleCreateTenant = async () => {
    if (!newOrgName || (!newOrgDomain && !newOrgSlug)) {
      alert("Please provide organization name and domain or slug.");
      return;
    }

    // Enforce 1:1 identity: Workspace slug and Storefront slug are always identical as specified on the provisioning form
    const rawSpecifiedSlug =
      newOrgSlug.trim() ||
      (newOrgDomain.includes(".ofia.") ? newOrgDomain.split(".")[0] : "") ||
      normalizeSubdomainSlug(newOrgName);
    const slug = normalizeSubdomainSlug(rawSpecifiedSlug);

    const existingSlugs = new Set(tenants.map((t) => t.slug));
    const check = validateSubdomainAvailability(slug, existingSlugs);

    if (!check.isAvailable) {
      alert(`Cannot provision tenant: ${check.message}\nSuggested: ${check.suggestions.join(", ")}`);
      return;
    }

    // Always keep workspace & storefront domain aligned with slug if on .ofia.ng / .ofia.shop
    const domain =
      newOrgDomain.trim() && !newOrgDomain.endsWith(".ofia.ng") && !newOrgDomain.endsWith(".ofia.shop")
        ? newOrgDomain.trim()
        : `${slug}.ofia.ng`;

    setIsSavingDb(true);
    const defaultShopSubs: Record<string, boolean> = {};
    SHOP_SUB_MODULES.forEach((s) => {
      defaultShopSubs[s.key] = true;
    });
    const defaultMobilitySubs: Record<string, boolean> = {};
    MOBILITY_SUB_MODULES.forEach((s) => {
      defaultMobilitySubs[s.key] = true;
    });

    const newTenant: TenantOrg = {
      id: `org-${Date.now()}`,
      name: newOrgName,
      slug,
      domain,
      ownerName: newOwnerName || "System Admin",
      ownerEmail: newOwnerEmail || `admin@${domain}`,
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
      shopSubModules: defaultShopSubs,
      mobilitySubModules: defaultMobilitySubs,
      databaseUrl: newDatabaseUrl.trim(),
      cloudinaryUrl: newCloudinaryUrl.trim(),
      isCustomDb: Boolean(newDatabaseUrl.trim()),
      isCustomStorage: Boolean(newCloudinaryUrl.trim()),
      vertical: newVertical || "retail",
      createdAt: new Date().toISOString().split("T")[0],
    };

    try {
      // 1. Primary persistence: Save directly to Neon platform_tenants table & trigger auto-alignment
      const createRes = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newTenant.id,
          name: newOrgName,
          slug,
          domain,
          ownerName: newOwnerName,
          ownerEmail: newOwnerEmail,
          planTier: newPlanTier,
          dbMode: "DEDICATED",
          databaseUrl: newDatabaseUrl.trim(),
          cloudinaryUrl: newCloudinaryUrl.trim(),
          isCustomDb: Boolean(newDatabaseUrl.trim()),
          isCustomStorage: Boolean(newCloudinaryUrl.trim()),
          mrr: newTenant.mrr,
          vertical: newVertical || "retail",
          erp_modules: newErpModules,
          shop_sub_modules: defaultShopSubs,
          mobility_sub_modules: defaultMobilitySubs,
        }),
      });

      if (!createRes.ok) {
        const errJson = await createRes.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to create tenant: HTTP ${createRes.status}`);
      }

      const createData = await createRes.json();
      if (createData.tenant?.id) {
        newTenant.id = createData.tenant.id;
      }

      // 2. Sync to microservices in background
      GTM_API.createAdminOrganization({
        name: newOrgName,
        slug,
        domain,
        owner_name: newOwnerName || "System Admin",
        owner_email: newOwnerEmail || `admin@${domain}`,
        plan_tier: newPlanTier,
        billing_cycle: "MONTHLY",
        vertical: newVertical || "retail",
        shop_sub_modules: defaultShopSubs,
        database_url: newDatabaseUrl.trim(),
        cloudinary_url: newCloudinaryUrl.trim(),
      }).catch(() => null);

      showToast(`Tenant '${newOrgName}' successfully created & saved to Postgres!`);
      setTenants([newTenant, ...tenants]);
      setIsNewTenantModalOpen(false);
      setSelectedTenantId(newTenant.id);
      router.push(`/tenants?tenant=${newTenant.id}`);

      // Reset form
      setNewOrgName("");
      setNewOrgSlug("");
      setNewOrgDomain("");
      setNewOwnerName("");
      setNewOwnerEmail("");
      setNewDatabaseUrl("");
      setNewCloudinaryUrl("");
      setNewVertical("retail");
    } catch (err: any) {
      console.error("Tenant creation error:", err);
      alert("Failed to create tenant: " + (err.message || "Network error"));
    } finally {
      setIsSavingDb(false);
    }
  };

  return (
    <SuperAdminShell
      title="Tenant Management & Module Provisioning"
      subTabs={[
        { label: "Tenant Organizations", href: "/tenants", icon: <Building2 className="w-3.5 h-3.5" /> },
        { label: "Plan Tiers & Quotas", href: "/subscriptions", icon: <CreditCard className="w-3.5 h-3.5" /> },
      ]}
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
                  sub: "AI, IMS, POS, Referrals, HR",
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
                          {focusedTenant.isCustomDb ? (
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 uppercase flex items-center gap-1">
                              <Database className="w-3 h-3" />
                              BYODB: Neon Dedicated
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20 uppercase">
                              DB: Shared Platform
                            </span>
                          )}
                          {focusedTenant.isCustomStorage && (
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 uppercase flex items-center gap-1">
                              <UploadCloud className="w-3 h-3" />
                              BYOS: Cloudinary
                            </span>
                          )}
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

                      <button
                        onClick={() => setTenantToDelete(focusedTenant)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        title="Delete Workspace"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Tenant</span>
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
                          Grant All {SUPER_ADMIN_ERP_MODULES.length} Modules
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

                        if (mod.key === "shop") {
                          const activeVerticalKey = focusedTenant.vertical || "retail";
                          const activeVerticalObj =
                            TENANT_VERTICAL_ARCHETYPES.find((v) => v.id === activeVerticalKey) ||
                            TENANT_VERTICAL_ARCHETYPES[9];
                          const shopSubs = focusedTenant.shopSubModules || {
                            pos: true,
                            inventory: true,
                            catalog: true,
                            services: true,
                            orders: true,
                            store: true,
                            referrals: true,
                          };

                          return (
                            <div
                              key={mod.key}
                              className={cn(
                                "col-span-1 sm:col-span-2 lg:col-span-3 p-5 sm:p-6 rounded-3xl border transition-all space-y-5",
                                isEnabled
                                  ? "bg-[var(--nexa-bg-base)] border-[#1A56DB]/40 shadow-sm ring-1 ring-[#1A56DB]/15"
                                  : "bg-[var(--nexa-bg-base)]/30 border-[var(--nexa-border)]/50 opacity-75"
                              )}
                            >
                              {/* SHOP CARD HEADER */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--nexa-border)]">
                                <div className="flex items-center gap-3.5">
                                  <div
                                    className={cn(
                                      "w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg shrink-0 shadow-sm transition-transform",
                                      isEnabled ? "bg-[#10B981]" : "bg-slate-400 dark:bg-slate-700 opacity-50"
                                    )}
                                  >
                                    <Store className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="text-base font-black text-[var(--nexa-text-primary)]">
                                        Ofia Shop Manager
                                      </h4>
                                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 uppercase">
                                        Retail & Commerce
                                      </span>
                                      <span
                                        className={cn(
                                          "text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase",
                                          isEnabled
                                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                            : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                        )}
                                      >
                                        {isEnabled ? "Module Active" : "Module Disabled"}
                                      </span>
                                    </div>
                                    <p className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                                      Multi-warehouse inventory (IMS), POS cashier counter, catalog schemas, service bookings, and viral referrals.
                                    </p>
                                  </div>
                                </div>

                                {/* MASTER TOGGLE BUTTON */}
                                <div className="flex items-center gap-3 self-end sm:self-center">
                                  <span className="text-xs font-bold text-[var(--nexa-text-secondary)]">
                                    {isEnabled ? "Enabled" : "Disabled"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isSaving) handleToggleModule(focusedTenant.id, "shop");
                                    }}
                                    disabled={isSaving}
                                    className={cn(
                                      "w-12 h-6 rounded-full p-0.5 transition-colors shrink-0 relative cursor-pointer",
                                      isEnabled ? "bg-[#10B981]" : "bg-slate-300 dark:bg-slate-700"
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform flex items-center justify-center",
                                        isEnabled ? "translate-x-6" : "translate-x-0"
                                      )}
                                    >
                                      {isSaving && (
                                        <Loader2 className="w-3 h-3 text-[#10B981] animate-spin" />
                                      )}
                                    </div>
                                  </button>
                                </div>
                              </div>

                              {/* VERTICAL ASSIGNMENT SELECTOR */}
                              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-3">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Layers className="w-4 h-4 text-[#1A56DB]" />
                                      <h5 className="text-xs font-black uppercase tracking-wider text-[var(--nexa-text-primary)]">
                                        Assigned Vertical Archetype Template
                                      </h5>
                                    </div>
                                    <p className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5">
                                      Determines industry-native schema, product terms, booking models, and storefront presentation across all 11 Blueprint verticals.
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2.5">
                                    <div className="relative min-w-[240px] sm:min-w-[280px]">
                                      <select
                                        value={activeVerticalKey}
                                        disabled={!isEnabled}
                                        onChange={(e) => handleAssignVertical(focusedTenant.id, e.target.value)}
                                        className={cn(
                                          "w-full px-3.5 py-2 rounded-xl text-xs font-bold border transition-all appearance-none cursor-pointer outline-none",
                                          isEnabled
                                            ? "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-primary)] hover:border-[#1A56DB] focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/15"
                                            : "bg-[var(--nexa-bg-base)]/50 border-[var(--nexa-border)]/50 text-[var(--nexa-text-muted)] cursor-not-allowed"
                                        )}
                                      >
                                        {TENANT_VERTICAL_ARCHETYPES.map((vert) => (
                                          <option key={vert.id} value={vert.id}>
                                            {vert.name} ({vert.badge})
                                          </option>
                                        ))}
                                      </select>
                                      <ChevronDown className="w-4 h-4 text-[var(--nexa-text-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                  </div>
                                </div>

                                {/* ACTIVE VERTICAL PREVIEW PILL */}
                                <div className="flex items-center gap-2.5 pt-2 border-t border-[var(--nexa-border)]/60 text-xs flex-wrap">
                                  <div className="w-6 h-6 rounded-lg bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center shrink-0">
                                    {getModuleIcon(activeVerticalObj.icon)}
                                  </div>
                                  <span className="font-extrabold text-[var(--nexa-text-primary)]">
                                    {activeVerticalObj.name}
                                  </span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] border border-[#1A56DB]/20">
                                    {activeVerticalObj.badge}
                                  </span>
                                  <span className="text-[11px] text-[var(--nexa-text-muted)] truncate">
                                    — {activeVerticalObj.tagline}
                                  </span>
                                  <a
                                    href={
                                      typeof window !== "undefined" && window.location.hostname.includes("localhost")
                                        ? `http://${focusedTenant.slug}.localhost:3005${activeVerticalObj.storefrontPath}`
                                        : `https://${focusedTenant.slug}.ofia.ng${activeVerticalObj.storefrontPath}`
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ml-auto text-[11px] font-mono text-[#1A56DB] hover:underline flex items-center gap-1"
                                    title={`Subdomain: ${focusedTenant.slug}.ofia.ng`}
                                  >
                                    Preview Storefront ({focusedTenant.slug}.ofia.ng) <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>

                              {/* SHOP SUB-MODULES GRID */}
                              <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <Boxes className="w-4 h-4 text-[#10B981]" />
                                    <h5 className="text-xs font-black uppercase tracking-wider text-[var(--nexa-text-primary)]">
                                      Ofia Shop Manager Sub-Modules ({SHOP_SUB_MODULES.length} Features)
                                    </h5>
                                  </div>

                                  {isEnabled && (
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleBulkToggleShopSubModules(focusedTenant.id, true)}
                                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 transition-colors cursor-pointer"
                                      >
                                        Enable All Sub-Modules
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleBulkToggleShopSubModules(focusedTenant.id, false)}
                                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors cursor-pointer"
                                      >
                                        Disable All
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {!isEnabled ? (
                                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2.5">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    <span>
                                      Ofia Shop Manager is currently toggled OFF. Turn on the main module switch above to configure and activate individual sub-modules.
                                    </span>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {SHOP_SUB_MODULES.map((sub) => {
                                      const isSubEnabled = shopSubs[sub.key] ?? true;
                                      const isSubSaving = savingModuleKeys[`shop_${sub.key}`];

                                      return (
                                        <div
                                          key={sub.key}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isSubSaving) handleToggleShopSubModule(focusedTenant.id, sub.key);
                                          }}
                                          className={cn(
                                            "p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none group",
                                            isSubEnabled
                                              ? "bg-[var(--nexa-bg-surface)] border-[var(--nexa-border)] hover:border-[#10B981]/50 shadow-xs"
                                              : "bg-[var(--nexa-bg-surface)]/40 border-[var(--nexa-border)]/50 opacity-60 hover:opacity-100",
                                            isSubSaving && "opacity-75 cursor-wait"
                                          )}
                                        >
                                          <div className="flex items-center gap-2.5 min-w-0">
                                            <div
                                              className={cn(
                                                "w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs shrink-0 transition-transform group-hover:scale-105",
                                                isSubEnabled
                                                  ? "bg-[#10B981] shadow-xs"
                                                  : "bg-slate-400 dark:bg-slate-700 opacity-50"
                                              )}
                                            >
                                              {getModuleIcon(sub.iconName)}
                                            </div>
                                            <div className="min-w-0">
                                              <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-bold text-[var(--nexa-text-primary)] truncate">
                                                  {sub.shortLabel}
                                                </span>
                                                {sub.badge && isSubEnabled && (
                                                  <span className="text-[8px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#10B981]/15 text-[#10B981]">
                                                    {sub.badge}
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-[10px] text-[var(--nexa-text-muted)] truncate max-w-[150px]">
                                                {sub.description}
                                              </p>
                                            </div>
                                          </div>

                                          {/* SUB-TOGGLE SWITCH */}
                                          <div
                                            className={cn(
                                              "w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 relative",
                                              isSubEnabled ? "bg-[#10B981]" : "bg-slate-300 dark:bg-slate-700"
                                            )}
                                          >
                                            <div
                                              className={cn(
                                                "w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform flex items-center justify-center",
                                                isSubEnabled ? "translate-x-4" : "translate-x-0"
                                              )}
                                            >
                                              {isSubSaving && (
                                                <Loader2 className="w-2.5 h-2.5 text-[#10B981] animate-spin" />
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }

                        if (mod.key === "mobility") {
                          const mobilitySubs = focusedTenant.mobilitySubModules || {
                            ops: true,
                            vehicles: true,
                            drivers: true,
                            maintenance: true,
                            routes: true,
                            finance: true,
                            shuttle: true,
                            interstate: true,
                            on_demand: true,
                            rental: true,
                            school: true,
                            staff: true,
                          };

                          return (
                            <div
                              key={mod.key}
                              className={cn(
                                "col-span-1 sm:col-span-2 lg:col-span-3 p-5 sm:p-6 rounded-3xl border transition-all space-y-5",
                                isEnabled
                                  ? "bg-[var(--nexa-bg-base)] border-[#F59E0B]/40 shadow-sm ring-1 ring-[#F59E0B]/15"
                                  : "bg-[var(--nexa-bg-base)]/30 border-[var(--nexa-border)]/50 opacity-75"
                              )}
                            >
                              {/* MOBILITY CARD HEADER */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--nexa-border)]">
                                <div className="flex items-center gap-3.5">
                                  <div
                                    className={cn(
                                      "w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg shrink-0 shadow-sm transition-transform",
                                      isEnabled ? "bg-[#F59E0B]" : "bg-slate-400 dark:bg-slate-700 opacity-50"
                                    )}
                                  >
                                    <Car className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="text-base font-black text-[var(--nexa-text-primary)]">
                                        Ofia Mobility Manager
                                      </h4>
                                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 uppercase">
                                        Transport OS & Mobility
                                      </span>
                                      <span
                                        className={cn(
                                          "text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase",
                                          isEnabled
                                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                            : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                        )}
                                      >
                                        {isEnabled ? "Module Active" : "Module Disabled"}
                                      </span>
                                    </div>
                                    <p className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                                      Operations control center, corporate vehicles & ROI, fleet ops & compliance hub, routine inspections, route corridors, pricing margins, and 6 mobility service lines.
                                    </p>
                                  </div>
                                </div>

                                {/* MASTER TOGGLE BUTTON */}
                                <div className="flex items-center gap-3 self-end sm:self-center">
                                  <span className="text-xs font-bold text-[var(--nexa-text-secondary)]">
                                    {isEnabled ? "Enabled" : "Disabled"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isSaving) handleToggleModule(focusedTenant.id, "mobility");
                                    }}
                                    disabled={isSaving}
                                    className={cn(
                                      "w-12 h-6 rounded-full p-0.5 transition-colors shrink-0 relative cursor-pointer",
                                      isEnabled ? "bg-[#F59E0B]" : "bg-slate-300 dark:bg-slate-700"
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform flex items-center justify-center",
                                        isEnabled ? "translate-x-6" : "translate-x-0"
                                      )}
                                    >
                                      {isSaving && (
                                        <Loader2 className="w-3 h-3 text-[#F59E0B] animate-spin" />
                                      )}
                                    </div>
                                  </button>
                                </div>
                              </div>

                              {/* MOBILITY QUICK STATS & CONSOLE LAUNCHER */}
                              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-3">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Radio className="w-4 h-4 text-[#F59E0B]" />
                                      <h5 className="text-xs font-black uppercase tracking-wider text-[var(--nexa-text-primary)]">
                                        Mobility Services & Dispatch Console
                                      </h5>
                                    </div>
                                    <p className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5">
                                      Live telemetry, driver allocation queue, multi-tenant route scheduling, and automated pricing margins across 6 distinct passenger verticals.
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2.5">
                                    <a
                                      href="/erp/ops/mobility"
                                      target="_blank"
                                      rel="noreferrer"
                                      className={cn(
                                        "px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5",
                                        isEnabled
                                          ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B] hover:bg-[#F59E0B]/20"
                                          : "bg-[var(--nexa-bg-base)]/50 border-[var(--nexa-border)]/50 text-[var(--nexa-text-muted)] pointer-events-none opacity-50"
                                      )}
                                    >
                                      <span>Launch Live Ops Console</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>

                                {/* ACTIVE SERVICE LINES PREVIEW PILL */}
                                <div className="flex items-center gap-2.5 pt-2 border-t border-[var(--nexa-border)]/60 text-xs flex-wrap">
                                  <div className="w-6 h-6 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center shrink-0">
                                    <Truck className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-extrabold text-[var(--nexa-text-primary)]">
                                    Transport OS Suite
                                  </span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                                    12 Sub-Modules Active: {MOBILITY_SUB_MODULES.filter((s) => mobilitySubs[s.key] ?? true).length}/12
                                  </span>
                                  <span className="text-[11px] text-[var(--nexa-text-muted)] truncate">
                                    — Shuttle, Interstate, On-Demand, Rental, School & Corporate Staff
                                  </span>
                                  <a
                                    href="/erp/admin/mobility"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ml-auto text-[11px] font-mono text-[#F59E0B] hover:underline flex items-center gap-1"
                                  >
                                    Admin Command Centre <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>

                              {/* MOBILITY SUB-MODULES GRID */}
                              <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <Boxes className="w-4 h-4 text-[#F59E0B]" />
                                    <h5 className="text-xs font-black uppercase tracking-wider text-[var(--nexa-text-primary)]">
                                      Ofia Mobility Manager Sub-Modules ({MOBILITY_SUB_MODULES.length} Features)
                                    </h5>
                                  </div>

                                  {isEnabled && (
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleBulkToggleMobilitySubModules(focusedTenant.id, true)}
                                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20 transition-colors cursor-pointer"
                                      >
                                        Enable All Sub-Modules
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleBulkToggleMobilitySubModules(focusedTenant.id, false)}
                                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors cursor-pointer"
                                      >
                                        Disable All
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {!isEnabled ? (
                                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2.5">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    <span>
                                      Ofia Mobility Manager is currently toggled OFF. Turn on the main module switch above to configure and activate individual mobility sub-modules.
                                    </span>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {MOBILITY_SUB_MODULES.map((sub) => {
                                      const isSubEnabled = mobilitySubs[sub.key] ?? true;
                                      const isSubSaving = savingModuleKeys[`mobility_${sub.key}`];

                                      return (
                                        <div
                                          key={sub.key}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isSubSaving) handleToggleMobilitySubModule(focusedTenant.id, sub.key);
                                          }}
                                          className={cn(
                                            "p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none group",
                                            isSubEnabled
                                              ? "bg-[var(--nexa-bg-surface)] border-[var(--nexa-border)] hover:border-[#F59E0B]/50 shadow-xs"
                                              : "bg-[var(--nexa-bg-surface)]/40 border-[var(--nexa-border)]/50 opacity-60 hover:opacity-100",
                                            isSubSaving && "opacity-75 cursor-wait"
                                          )}
                                        >
                                          <div className="flex items-center gap-2.5 min-w-0">
                                            <div
                                              className={cn(
                                                "w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs shrink-0 transition-transform group-hover:scale-105",
                                                isSubEnabled
                                                  ? "bg-[#F59E0B] shadow-xs"
                                                  : "bg-slate-400 dark:bg-slate-700 opacity-50"
                                              )}
                                            >
                                              {getModuleIcon(sub.iconName)}
                                            </div>
                                            <div className="min-w-0">
                                              <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-bold text-[var(--nexa-text-primary)] truncate">
                                                  {sub.shortLabel}
                                                </span>
                                                {sub.badge && isSubEnabled && (
                                                  <span className="text-[8px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#F59E0B]/15 text-[#F59E0B]">
                                                    {sub.badge}
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-[10px] text-[var(--nexa-text-muted)] truncate max-w-[150px]">
                                                {sub.description}
                                              </p>
                                            </div>
                                          </div>

                                          {/* SUB-TOGGLE SWITCH */}
                                          <div
                                            className={cn(
                                              "w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 relative",
                                              isSubEnabled ? "bg-[#F59E0B]" : "bg-slate-300 dark:bg-slate-700"
                                            )}
                                          >
                                            <div
                                              className={cn(
                                                "w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform flex items-center justify-center",
                                                isSubEnabled ? "translate-x-4" : "translate-x-0"
                                              )}
                                            >
                                              {isSubSaving && (
                                                <Loader2 className="w-2.5 h-2.5 text-[#F59E0B] animate-spin" />
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }

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
                                {tenant.databaseUrl ? (
                                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 uppercase flex items-center gap-1">
                                    <Database className="w-2.5 h-2.5" />
                                    Dedicated DB Configured
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase flex items-center gap-1">
                                    <Database className="w-2.5 h-2.5" />
                                    Dedicated DB (Pending Setup)
                                  </span>
                                )}
                                {tenant.isCustomStorage && (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 uppercase flex items-center gap-1">
                                    <UploadCloud className="w-2.5 h-2.5" />
                                    BYOS
                                  </span>
                                )}
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

                            <button
                              onClick={() => setTenantToDelete(tenant)}
                              className="p-2 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs transition-colors cursor-pointer"
                              title="Delete Tenant Workspace"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
                            const isShop = mod.key === "shop";
                            const isMobility = mod.key === "mobility";
                            const vertKey = tenant.vertical || "retail";
                            const vertObj =
                              TENANT_VERTICAL_ARCHETYPES.find((v) => v.id === vertKey) ||
                              TENANT_VERTICAL_ARCHETYPES[9];
                            const activeShopSubsCount = isShop
                              ? SHOP_SUB_MODULES.filter((s) => tenant.shopSubModules?.[s.key] ?? true).length
                              : 0;
                            const activeMobilitySubsCount = isMobility
                              ? MOBILITY_SUB_MODULES.filter((s) => tenant.mobilitySubModules?.[s.key] ?? true).length
                              : 0;

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
                                        ? isShop
                                          ? "bg-[#10B981]/15 text-[#10B981]"
                                          : isMobility
                                          ? "bg-[#F59E0B]/15 text-[#F59E0B]"
                                          : "bg-[#1A56DB]/10 text-[#1A56DB]"
                                        : "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-muted)]"
                                    )}
                                  >
                                    {getModuleIcon(mod.iconName)}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-xs font-bold text-[var(--nexa-text-primary)] truncate">
                                        {mod.label}
                                      </p>
                                      {isShop && isEnabled && (
                                        <span className="text-[8px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#10B981]/15 text-[#10B981] truncate">
                                          {vertObj.badge}
                                        </span>
                                      )}
                                      {isMobility && isEnabled && (
                                        <span className="text-[8px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] truncate">
                                          Mobility
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[9px] text-[var(--nexa-text-muted)] font-mono truncate">
                                      {isShop && isEnabled
                                        ? `${activeShopSubsCount}/7 subs · ${vertObj.name}`
                                        : isMobility && isEnabled
                                        ? `${activeMobilitySubsCount}/${MOBILITY_SUB_MODULES.length} services · Active`
                                        : `/erp/${mod.key}`}
                                    </p>
                                  </div>
                                </div>

                                <div
                                  className={cn(
                                    "w-8 h-4.5 rounded-full p-0.5 transition-colors shrink-0",
                                    isEnabled
                                      ? isShop
                                        ? "bg-[#10B981]"
                                        : isMobility
                                        ? "bg-[#F59E0B]"
                                        : "bg-[#1A56DB]"
                                      : "bg-[var(--nexa-border)]"
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
              placeholder="e.g. Funmy Clothing"
              value={newOrgName}
              onChange={(e) => {
                const val = e.target.value;
                setNewOrgName(val);
                const s = normalizeSubdomainSlug(val);
                setNewOrgSlug(s);
                if (!newOrgDomain || newOrgDomain.endsWith(".ofia.ng") || newOrgDomain.endsWith(".ofia.shop")) {
                  setNewOrgDomain(s ? `${s}.ofia.ng` : "");
                }
              }}
              className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs outline-none focus:border-[#1A56DB]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center justify-between">
              <span>Workspace & Storefront Slug *</span>
              <span className="text-[10px] text-[#1A56DB] font-semibold">Strict 1:1 Identity Enforced</span>
            </label>
            <input
              type="text"
              placeholder="e.g. funmyclothing"
              value={newOrgSlug}
              onChange={(e) => {
                const s = normalizeSubdomainSlug(e.target.value);
                setNewOrgSlug(s);
                if (!newOrgDomain || newOrgDomain.endsWith(".ofia.ng") || newOrgDomain.endsWith(".ofia.shop")) {
                  setNewOrgDomain(s ? `${s}.ofia.ng` : "");
                }
              }}
              className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-mono outline-none focus:border-[#1A56DB]"
            />
            <p className="text-[11px] text-[var(--nexa-text-secondary)]">
              Identical identifier for workspace (<span className="font-mono text-[#1A56DB]">{newOrgSlug || "slug"}.ofia.ng</span>) and digital storefront (<span className="font-mono text-[#1A56DB]">{newOrgSlug || "slug"}.ofia.shop</span>).
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
              Domain / Subdomain *
            </label>
            <input
              type="text"
              placeholder="e.g. funmyclothing.ofia.ng"
              value={newOrgDomain}
              onChange={(e) => {
                const val = e.target.value;
                setNewOrgDomain(val);
                if (val.includes(".ofia.")) {
                  const sub = val.split(".")[0];
                  setNewOrgSlug(normalizeSubdomainSlug(sub));
                }
              }}
              className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs outline-none focus:border-[#1A56DB]"
            />
            {(newOrgSlug || newOrgName) && (
              <div className="mt-1">
                {(() => {
                  const s = normalizeSubdomainSlug(newOrgSlug || newOrgName);
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
                          ? `Workspace '${res.workspaceDomain}' & storefront '${res.storefrontDomain}' are available and identical`
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Subscription Plan
              </label>
              <select
                value={newPlanTier}
                onChange={(e) => setNewPlanTier(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-bold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
              >
                <option value="GROWTH">GROWTH (₦24,000 / mo)</option>
                <option value="ENTERPRISE">ENTERPRISE (₦100,000 / mo)</option>
                <option value="SCALE">SCALE (₦48,000 / mo)</option>
                <option value="STARTER">STARTER (₦9,000 / mo)</option>
                <option value="FREE_TRIAL">FREE TRIAL (14-Day Pilot)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Industry Vertical Archetype *
              </label>
              <select
                value={newVertical}
                onChange={(e) => setNewVertical(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-bold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
              >
                {TENANT_VERTICAL_ARCHETYPES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.badge})
                  </option>
                ))}
              </select>
            </div>
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

          {/* DEDICATED INFRASTRUCTURE (DATABASE-PER-TENANT MANDATE) */}
          <div className="space-y-3 pt-3 border-t border-[var(--nexa-border)]">
            <div>
              <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#1A56DB]" />
                Dedicated Infrastructure (DEDICATED Database-Per-Tenant Architecture)
              </label>
              <p className="text-[11px] text-[var(--nexa-text-secondary)]">
                Every tenant workspace operates strictly in DEDICATED database mode. Configure the tenant&apos;s isolated PostgreSQL connection string (Neon) for direct persistence.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[var(--nexa-text-secondary)]">
                Dedicated Neon Database URL (Pooled)
              </label>
              <input
                type="password"
                placeholder="postgresql://neondb_owner:***@ep-xxxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
                value={newDatabaseUrl}
                onChange={(e) => setNewDatabaseUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-mono outline-none focus:border-[#1A56DB]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[var(--nexa-text-secondary)]">
                Dedicated Cloudinary Storage URL
              </label>
              <input
                type="password"
                placeholder="cloudinary://api_key:api_secret@cloud_name"
                value={newCloudinaryUrl}
                onChange={(e) => setNewCloudinaryUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-mono outline-none focus:border-[#1A56DB]"
              />
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
                Workspace & Storefront Slug *
              </label>
              <input
                type="text"
                value={editTenantSlug}
                onChange={(e) => {
                  const clean = normalizeSubdomainSlug(e.target.value);
                  setEditTenantSlug(clean);
                  if (!editTenantDomain || editTenantDomain.endsWith(".ofia.ng") || editTenantDomain.endsWith(".ofia.shop")) {
                    setEditTenantDomain(`${clean}.ofia.ng`);
                  }
                }}
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

          {/* DATABASE-PER-TENANT ARCHITECTURE & DEDICATED PERSISTENCE */}
          <div className="space-y-4 pt-3 border-t border-[var(--nexa-border)]">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[#1A56DB]" />
                  <span>Database-Per-Tenant Architecture</span>
                </label>
                <p className="text-[11px] text-[var(--nexa-text-secondary)] mt-0.5">
                  Strict dedicated persistence: this tenant connects directly to their standalone PostgreSQL database.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-extrabold uppercase flex items-center gap-1">
                <Database className="w-3 h-3" />
                DEDICATED ONLY
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[#1A56DB]/30 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                      <span>Dedicated PostgreSQL Connection String</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-bold uppercase">
                        Direct Dynamic Connection
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowDbPassword(!showDbPassword)}
                      className="text-[11px] font-bold text-[#1A56DB] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {showDbPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showDbPassword ? "Mask Password" : "Show URL"}</span>
                    </button>
                  </div>
                  <input
                    type={showDbPassword ? "text" : "password"}
                    placeholder="postgresql://neondb_owner:***@ep-dedicated-tenant.us-east-2.aws.neon.tech/neondb?sslmode=require"
                    value={editTenantDatabaseUrl}
                    onChange={(e) => {
                      setEditTenantDatabaseUrl(e.target.value);
                      setDbTestResult(null);
                      setProvisionResult(null);
                    }}
                    className="w-full px-3.5 py-2.5 bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-xl text-xs font-mono outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                  />
                  <p className="text-[10px] text-[var(--nexa-text-muted)]">
                    All commerce routes, storefront orders, ERP inventory, and dispatch tracking dynamically connect to this standalone database for this tenant.
                  </p>
                </div>

                {/* Diagnostic & Provisioning Buttons */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleTestCustomDb(editTenantDatabaseUrl)}
                    disabled={isTestingDb || !editTenantDatabaseUrl.trim()}
                    className="px-3.5 py-1.5 rounded-xl border border-[var(--nexa-border)] hover:bg-[var(--nexa-bg-surface)] text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {isTestingDb ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-[#1A56DB]" />
                        <span>Pinging Database...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>Test Connection</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProvisionCustomDb(editTenantDatabaseUrl)}
                    disabled={isProvisioningDb || !editTenantDatabaseUrl.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {isProvisioningDb ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Provisioning Schemas...</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-3 h-3" />
                        <span>Bootstrap Commerce Tables</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Real-Time Diagnostic Test Result Banner */}
                {dbTestResult && (
                  <div
                    className={cn(
                      "p-3 rounded-xl border text-xs flex items-start gap-2.5",
                      dbTestResult.success
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300"
                    )}
                  >
                    {dbTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-0.5">
                      <div className="font-bold">
                        {dbTestResult.success
                          ? `Connection Verified in ${dbTestResult.latencyMs}ms`
                          : "Connection Failed"}
                      </div>
                      <p className="text-[11px] opacity-90">
                        {dbTestResult.success
                          ? `Successfully connected to standalone engine. ${dbTestResult.version ? `Server: ${dbTestResult.version.split(" on ")[0]}` : ""}`
                          : dbTestResult.error}
                      </p>
                    </div>
                  </div>
                )}

                {/* Provision Result Banner */}
                {provisionResult && (
                  <div
                    className={cn(
                      "p-3 rounded-xl border text-xs flex items-start gap-2.5",
                      provisionResult.success
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-300"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300"
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold">Schema Provisioning</div>
                      <p className="text-[11px] opacity-90">{provisionResult.message}</p>
                    </div>
                  </div>
                )}
              </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[var(--nexa-text-secondary)]">
                Dedicated Cloudinary Storage URL (BYOS - Optional)
              </label>
              <input
                type="password"
                placeholder="cloudinary://api_key:api_secret@cloud_name"
                value={editTenantCloudinaryUrl}
                onChange={(e) => setEditTenantCloudinaryUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-mono outline-none focus:border-[#1A56DB]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                const toDel = selectedTenantForEdit;
                setSelectedTenantForEdit(null);
                setTenantToDelete(toDel);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Workspace</span>
            </button>
            <div className="flex items-center gap-2">
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
        </div>
      </NexaModal>

      {/* CONFIRM DELETE TENANT MODAL */}
      <NexaModal
        isOpen={Boolean(tenantToDelete)}
        onClose={() => {
          if (!isDeletingTenant) setTenantToDelete(null);
        }}
        title="Delete Tenant Workspace"
        subtitle="Permanently remove this organization from the master platform registry."
        maxWidth="md"
      >
        {tenantToDelete && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-rose-700 dark:text-rose-400">
                  Are you sure you want to delete {tenantToDelete.name}?
                </p>
                <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                  This action will permanently remove <span className="font-mono font-bold text-[var(--nexa-text-primary)]">@{tenantToDelete.slug}</span> from the master tenant registry. All routing entries and cached connection credentials will be immediately cleared.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--nexa-text-muted)]">Tenant Name:</span>
                <span className="font-semibold text-[var(--nexa-text-primary)]">{tenantToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--nexa-text-muted)]">Slug / Domain:</span>
                <span className="font-mono text-[var(--nexa-text-primary)]">{tenantToDelete.slug} ({tenantToDelete.domain})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--nexa-text-muted)]">Vertical:</span>
                <span className="font-medium capitalize text-[var(--nexa-text-primary)]">{tenantToDelete.vertical}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-end gap-2">
              <NexaButton
                size="sm"
                variant="outline"
                disabled={isDeletingTenant}
                onClick={() => setTenantToDelete(null)}
              >
                Cancel
              </NexaButton>
              <NexaButton
                size="sm"
                variant="danger"
                disabled={isDeletingTenant}
                onClick={() => handleDeleteTenant(tenantToDelete)}
                className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
              >
                {isDeletingTenant ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </NexaButton>
            </div>
          </div>
        )}
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
