"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGuard } from "@/components/auth/RoleGuard";
import {
  LayoutDashboard,
  Bot,
  ShoppingBag,
  Boxes,
  ShoppingCart,
  Gift,
  Package,
  ClipboardList,
  Palette,
  Truck,
  Trophy,
  PieChart,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowRight,
  RotateCcw,
  Eye,
  FileText,
  Tag,
  ShieldCheck,
  Zap,
  Check,
  CheckCheck,
  Store,
  Warehouse,
  Printer,
  Calendar,
  Activity,
  Plus,
  MessageSquare,
  BarChart3,
  Sliders,
  DollarSign,
  Send,
  Building2,
  FolderKanban,
  FileSpreadsheet,
  Layers,
  Key,
  Database,
  Radio,
  FileCheck2,
  Target,
  UserCheck,
  Sparkles,
  Mail,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { resolveAvatarUrl } from "@/lib/avatar";
import { NexaThemeToggle } from "@/components/nexa/NexaThemeToggle";
import { useAuth } from "@/components/nexa/AuthContext";
import {
  getTenantPermissionMatrix,
  fetchTenantPermissionMatrix,
  PermissionMatrix,
  DEFAULT_PERMISSION_MATRIX,
  RoleKey,
  isNavItemVisibleForRole,
  isUserLineManager,
} from "@/lib/access-control";
import {
  fetchDatabaseTenants,
  resolveTenantFromList,
  extractSubdomainOrParam,
  DEFAULT_TENANT_BRANDING,
  slugToTenantName,
} from "@/lib/tenant-context";
import { DashboardSkeleton } from "@/components/nexa/PageSkeleton";

export const OFIA_DEFAULT_LOGO = "/icon.png";

export interface SubNavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface ErpAdminShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  activeModule?: "mission" | "ai" | "crm" | "marketplace" | "shop" | "inventory" | "pos" | "referrals" | "logistics" | "quests" | "finance" | "hr" | "md" | "employee" | "users" | "departments";
  subTabs?: SubNavItem[];
  isLoading?: boolean;
}

interface OriginPortal {
  path: string;
  label: string;
  title: string;
  roleKey: string;
  badgeColor: string;
  iconBg: string;
}

export function ErpAdminShell({
  children,
  title,
  subtitle,
  action,
  activeModule,
  subTabs,
  isLoading,
}: ErpAdminShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExitBannerDismissed, setIsExitBannerDismissed] = useState(false);
  const [originPortal, setOriginPortal] = useState<OriginPortal>({
    path: "/erp/admin",
    label: "Admin",
    title: "Admin",
    roleKey: "admin",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    iconBg: "from-blue-600 to-indigo-600",
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);
  const [isShellReady, setIsShellReady] = useState<boolean>(false);
  const [tenantName, setTenantName] = useState<string>("");
  const [tenantLogo, setTenantLogo] = useState<string>("");
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>(DEFAULT_PERMISSION_MATRIX);
  const [currentRole, setCurrentRole] = useState<RoleKey>("admin");
  const [isLineManager, setIsLineManager] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string>("");

  const isEffectiveLoading = !isShellReady || Boolean(isLoading);

  const getRoleDisplayName = (role: RoleKey) => {
    switch (role) {
      case "admin": return "Admin";
      case "md": return "Executive";
      case "hr": return "HR Director";
      case "accountant": return "Chief Accountant";
      case "marketer": return "Growth Marketer";
      case "manager": return "Line Manager";
      case "employee": return "General Employee";
      case "cashier": return "POS Cashier";
      case "inventory_officer": return "Warehouse Officer";
      case "dispatcher": return "Fleet Dispatcher";
      default: return "Staff";
    }
  };

  const getRoleBadgeColor = (role: RoleKey) => {
    switch (role) {
      case "admin": return "text-[#1A56DB] bg-[#1A56DB]/10 border-[#1A56DB]/20";
      case "md": return "text-purple-600 bg-purple-500/10 border-purple-500/20";
      case "hr": return "text-rose-600 bg-rose-500/10 border-rose-500/20";
      case "accountant": return "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
      case "marketer": return "text-pink-600 bg-pink-500/10 border-pink-500/20";
      case "manager": return "text-amber-600 bg-amber-500/10 border-amber-500/20";
      case "cashier": return "text-cyan-600 bg-cyan-500/10 border-cyan-500/20";
      case "inventory_officer": return "text-amber-600 bg-amber-500/10 border-amber-500/20";
      case "dispatcher": return "text-blue-600 bg-blue-500/10 border-blue-500/20";
      default: return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    }
  };

  const getRoleHomePortal = (role: RoleKey): { path: string; label: string; roleKey: RoleKey } => {
    switch (role) {
      case "hr":
        return { path: "/erp/hr", label: "HR", roleKey: "hr" };
      case "manager":
        return { path: "/erp/manager", label: "Manager", roleKey: "manager" };
      case "md":
        return { path: "/erp/md", label: "MD", roleKey: "md" };
      case "accountant":
        return { path: "/erp/accountant", label: "Accountant", roleKey: "accountant" };
      case "marketer":
        return { path: "/erp/marketer", label: "CRM", roleKey: "marketer" };
      case "employee":
        return { path: "/erp/employee", label: "Employee", roleKey: "employee" };
      case "cashier":
        return { path: "/erp/admin/shop/pos", label: "POS", roleKey: "cashier" };
      case "inventory_officer":
        return { path: "/erp/admin/shop/inventory", label: "Inventory", roleKey: "inventory_officer" };
      case "dispatcher":
        return { path: "/erp/admin/logistics", label: "Logistics", roleKey: "dispatcher" };
      case "admin":
      default:
        return { path: "/erp/admin", label: "Admin", roleKey: "admin" };
    }
  };

  useEffect(() => {
    setIsMounted(true);
    let isCurrent = true;

    // Restore cached tenant branding from localStorage upon client mount
    const slug = extractSubdomainOrParam();
    const cachedName =
      localStorage.getItem("tenant_name_" + slug) ||
      localStorage.getItem("nexa_tenant_name") ||
      (slug ? slugToTenantName(slug) : "");
    const cachedLogo =
      localStorage.getItem("tenant_logo_" + slug) ||
      localStorage.getItem("nexa_tenant_logo") ||
      (slug && DEFAULT_TENANT_BRANDING[slug]?.logo) ||
      "";
    if (cachedName) setTenantName(cachedName);
    if (cachedLogo) setTenantLogo(cachedLogo);

    const initShell = async () => {
      const list = await fetchDatabaseTenants();
      if (!isCurrent) return;
      const matched = resolveTenantFromList(list, user?.email);
      const activeName = matched?.name || cachedName || "";
      const tenantKey = matched?.slug || matched?.id || slug || "neweratransports";
      setTenantName(activeName);
      if (matched?.logo) {
        setTenantLogo(matched.logo);
      }

      // Fetch live provisioned matrix from Postgres backend before revealing
      try {
        const remote = await fetchTenantPermissionMatrix(tenantKey);
        if (remote && Object.keys(remote).length > 0 && isCurrent) {
          setPermissionMatrix(remote);
        } else if (isCurrent) {
          setPermissionMatrix(getTenantPermissionMatrix(tenantKey));
        }
      } catch (err) {
        if (isCurrent) setPermissionMatrix(getTenantPermissionMatrix(tenantKey));
      }

      // Track and remember home/origin portal
      let origin: OriginPortal | null = null;
      if (pathname.startsWith("/erp/admin")) {
        origin = {
          path: "/erp/admin",
          label: "Admin",
          title: "Admin",
          roleKey: "admin",
          badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/30",
          iconBg: "from-blue-600 to-indigo-600",
        };
      } else if (
        pathname.startsWith("/erp/md") &&
        !pathname.includes("employee") &&
        !pathname.includes("manager") &&
        !pathname.includes("hr") &&
        !pathname.includes("accountant")
      ) {
        origin = {
          path: "/erp/md",
          label: "MD",
          title: "Managing Director",
          roleKey: "md",
          badgeColor: "bg-purple-500/20 text-purple-300 border-purple-400/30",
          iconBg: "from-purple-600 to-indigo-600",
        };
      } else if (
        pathname.startsWith("/erp/hr") &&
        !pathname.includes("employee") &&
        !pathname.includes("manager")
      ) {
        origin = {
          path: "/erp/hr",
          label: "HR",
          title: "Human Resources",
          roleKey: "hr",
          badgeColor: "bg-rose-500/20 text-rose-300 border-rose-400/30",
          iconBg: "from-rose-600 to-pink-600",
        };
      } else if (
        pathname.startsWith("/erp/accountant") &&
        !pathname.includes("employee") &&
        !pathname.includes("manager")
      ) {
        origin = {
          path: "/erp/accountant",
          label: "Accountant",
          title: "Chief Accountant",
          roleKey: "accountant",
          badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
          iconBg: "from-emerald-600 to-teal-600",
        };
      } else if (
        pathname.startsWith("/erp/marketer") &&
        !pathname.includes("employee") &&
        !pathname.includes("manager")
      ) {
        origin = {
          path: "/erp/marketer",
          label: "CRM",
          title: "Growth Marketer",
          roleKey: "marketer",
          badgeColor: "bg-pink-500/20 text-pink-300 border-pink-400/30",
          iconBg: "from-pink-600 to-rose-600",
        };
      } else if (
        pathname.startsWith("/erp/manager") &&
        !pathname.includes("employee")
      ) {
        origin = {
          path: "/erp/manager",
          label: "Manager",
          title: "Line Manager",
          roleKey: "manager",
          badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/30",
          iconBg: "from-amber-600 to-orange-600",
        };
      } else if (pathname.startsWith("/erp/employee")) {
        origin = {
          path: "/erp/employee",
          label: "Employee",
          title: "General Employee",
          roleKey: "employee",
          badgeColor: "bg-slate-500/20 text-slate-300 border-slate-400/30",
          iconBg: "from-slate-600 to-gray-600",
        };
      }

      if (origin) {
        setOriginPortal(origin);
        try {
          sessionStorage.setItem("erp_origin_portal", JSON.stringify(origin));
        } catch {}
      } else {
        try {
          const storedOrigin = sessionStorage.getItem("erp_origin_portal");
          if (storedOrigin) {
            setOriginPortal(JSON.parse(storedOrigin));
          }
        } catch {}
      }

      // Resolve user active session role, name, and email
      let resolvedRole: RoleKey = "employee";
      let resolvedName = user?.name || (activeName ? `${activeName} Staff` : "Staff");
      let resolvedEmail = user?.email || "";
      let hasStoredRole = false;

      let resolvedLineManager = false;
      let parsedUser: any = null;
      const storedErpUser = localStorage.getItem("erp_current_user");
      if (storedErpUser) {
        try {
          const parsed = JSON.parse(storedErpUser);
          if (parsed) {
            parsedUser = parsed;
            if (parsed.role) {
              resolvedRole = parsed.role as RoleKey;
              hasStoredRole = true;
            }
            if (parsed.name) resolvedName = parsed.name;
            if (parsed.email) resolvedEmail = parsed.email;
            if (parsed.role === "manager" || parsed.isLineManager === true) {
              resolvedLineManager = true;
            }
          }
        } catch {}
      }

      if (!hasStoredRole) {
        const storedRole = localStorage.getItem("nexa_user_role");
        const storedName = localStorage.getItem("nexa_user_name");
        const storedEmail = localStorage.getItem("nexa_user_email");
        if (storedRole) {
          resolvedRole = storedRole as RoleKey;
          hasStoredRole = true;
        }
        if (storedName) resolvedName = storedName;
        if (storedEmail) resolvedEmail = storedEmail;
      }

      // If user object provides active role
      if (user?.role && !hasStoredRole) {
        resolvedRole = user.role as RoleKey;
        hasStoredRole = true;
      }

      // Sanitize legacy stored roles or brackets from resolvedName
      if (resolvedName) {
        resolvedName = resolvedName
          .replace(/\s*\((MD\s*\/?\s*Founder|MD|Founder|Admin|Accounts|Fleet Mgr|Client Relations|Retail & POS)\)/gi, "")
          .trim();
      }

      // If no stored role is present in session, fallback to current route
      if (!hasStoredRole) {
        if (pathname.startsWith("/erp/employee")) {
          resolvedRole = "employee";
        } else if (pathname.startsWith("/erp/manager")) {
          resolvedRole = "manager";
        } else if (pathname.startsWith("/erp/md")) {
          resolvedRole = "md";
        } else if (pathname.startsWith("/erp/hr")) {
          resolvedRole = "hr";
        } else if (pathname.startsWith("/erp/accountant")) {
          resolvedRole = "accountant";
        } else if (pathname.startsWith("/erp/marketer")) {
          resolvedRole = "marketer";
        } else if (pathname.startsWith("/erp/admin")) {
          resolvedRole = "admin";
        }
      }

      // Check if user is line manager (has direct reports)
      if (resolvedRole === "manager") {
        resolvedLineManager = true;
      } else if (resolvedRole === "md") {
        // MD is a line manager if they manage direct reports or are configured as such
        resolvedLineManager = parsedUser?.isLineManager !== false;
      }

      let resolvedAvatar = "";
      if (parsedUser?.avatar) resolvedAvatar = parsedUser.avatar;
      if (!resolvedAvatar && (user as any)?.avatar) resolvedAvatar = (user as any).avatar;
      resolvedAvatar = resolveAvatarUrl(resolvedAvatar, resolvedName || resolvedEmail || "Staff");

      setCurrentRole(resolvedRole);
      setIsLineManager(resolvedLineManager);
      setUserName(resolvedName);
      setUserEmail(resolvedEmail);
      setUserAvatar(resolvedAvatar);

      // Strict Role & Portal Protection Guard:
      if (resolvedRole === "employee") {
        if (!pathname.startsWith("/erp/employee")) {
          window.location.href = "/erp/employee";
          return;
        }
      } else if (resolvedRole === "manager") {
        if (!pathname.startsWith("/erp/manager") && !pathname.startsWith("/erp/employee")) {
          window.location.href = "/erp/manager";
          return;
        }
      } else if (resolvedRole !== "admin" && pathname === "/erp/admin") {
        if (resolvedRole === "md") {
          window.location.href = "/erp/md";
          return;
        } else if (resolvedRole === "hr") {
          window.location.href = "/erp/hr";
          return;
        } else if (resolvedRole === "accountant") {
          window.location.href = "/erp/accountant";
          return;
        } else if (resolvedRole === "marketer") {
          window.location.href = "/erp/marketer";
          return;
        } else if (resolvedRole === "dispatcher") {
          window.location.href = "/erp/admin/logistics";
          return;
        } else if (resolvedRole === "cashier") {
          window.location.href = "/erp/admin/shop/pos";
          return;
        } else if (resolvedRole === "inventory_officer") {
          window.location.href = "/erp/admin/shop/inventory";
          return;
        }
      }

      if (isCurrent) {
        setIsShellReady(true);
        hasInitializedRef.current = true;
      }
    };

    initShell();

    const handleRbacUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.matrix) {
        setPermissionMatrix(customEvent.detail.matrix);
      }
    };

    window.addEventListener("ofia_rbac_updated", handleRbacUpdate);
    return () => {
      isCurrent = false;
      window.removeEventListener("ofia_rbac_updated", handleRbacUpdate);
    };
  }, [user, pathname]);

  // Synchronize document.title with Tenant Name First across all ERP pages
  useEffect(() => {
    if (typeof document !== "undefined") {
      const activeTenantName =
        tenantName ||
        (typeof window !== "undefined"
          ? localStorage.getItem("nexa_tenant_name") ||
            localStorage.getItem("tenant_name") ||
            ""
          : "") ||
        "Ofia ERP";

      let pageHeading = title;
      if (!pageHeading) {
        if (pathname.includes("/admin/shop/inventory")) pageHeading = "Inventory Management";
        else if (pathname.includes("/admin/shop/pos")) pageHeading = "Point of Sale (POS)";
        else if (pathname.includes("/admin/shop/referrals")) pageHeading = "Referrals & Rewards";
        else if (pathname.includes("/admin/shop")) pageHeading = "Shop & Retail";
        else if (pathname.includes("/admin/logistics")) pageHeading = "Logistics & Fleet Dispatch";
        else if (pathname.includes("/admin/users")) pageHeading = "Staff Directory & Roles";
        else if (pathname.includes("/admin/ai")) pageHeading = "AI Swarm & Operations";
        else if (pathname.includes("/admin/marketplace")) pageHeading = "Marketplace & Compass";
        else if (pathname.startsWith("/erp/accountant")) pageHeading = "Finance & Accounting";
        else if (pathname.startsWith("/erp/hr")) pageHeading = "HR & Appraisals";
        else if (pathname.startsWith("/erp/md")) pageHeading = "Managing Director Command";
        else if (pathname.startsWith("/erp/manager")) pageHeading = "Line Manager Portal";
        else if (pathname.startsWith("/erp/employee")) pageHeading = "Employee Workspace";
        else if (pathname.startsWith("/tenant/settings")) pageHeading = "Workspace Settings";
        else if (pathname.startsWith("/tenant/billing")) pageHeading = "Billing & Subscriptions";
        else if (pathname.startsWith("/tenant/team")) pageHeading = "Team Members";
        else if (pathname.startsWith("/tenant/usage")) pageHeading = "Platform Usage";
        else if (pathname === "/erp/admin" || pathname === "/erp") pageHeading = "Executive Command Center";
        else if (originPortal?.title) pageHeading = originPortal.title;
        else pageHeading = "Enterprise Workspace";
      }

      document.title = `${activeTenantName} — ${pageHeading} | Ofia ERP`;
    }
  }, [tenantName, title, pathname, originPortal]);

  const notifications = [
    { id: "1", title: "New AI Lead Qualified", message: "Adeyemi from Lagos verified interest in ERP Enterprise.", type: "AI", time: "2m ago", isRead: false },
    { id: "2", title: "Low Stock Alert: SKU-8492", message: "Solar Inverter 5kVa down to 3 units in Ikeja Depot.", type: "IMS", time: "14m ago", isRead: false },
    { id: "3", title: "POS Shift Closed", message: "Terminal 01 closed with ₦420,500 total balanced cash/card.", type: "POS", time: "1h ago", isRead: true },
  ];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems: {
    label: string;
    icon: React.ReactNode;
    href: string;
    badge?: string;
    key: string;
    section: "Operations" | "Ofia Enterprise Suite" | "Portals & Team";
  }[] = [
    // 1. OPERATIONS & REVENUE APPS
    { label: "Overview", icon: <LayoutDashboard className="w-6 h-6" />, href: "/erp/admin", key: "overview", section: "Operations" },
    { label: "Ofia AI Swarm", icon: <Bot className="w-6 h-6" />, href: "/erp/admin/ai", badge: "15 AI", key: "ai", section: "Operations" },
    { label: "Ofia Compass Manager", icon: <ShoppingBag className="w-6 h-6" />, href: "/erp/admin/marketplace", key: "marketplace", section: "Operations" },
    { label: "Ofia Shop Manager", icon: <Store className="w-6 h-6" />, href: "/erp/admin/shop", badge: "Retail", key: "shop", section: "Operations" },
    { label: "Ofia Logistics Manager", icon: <Truck className="w-6 h-6" />, href: "/erp/admin/logistics", key: "logistics", section: "Operations" },

    // 2. OFIA ENTERPRISE SUITE
    { label: "CRM & Marketing", icon: <BarChart3 className="w-6 h-6" />, href: "/erp/admin/crm", badge: "CRM", key: "crm", section: "Ofia Enterprise Suite" },
    { label: "Accounting & Ledgers", icon: <Layers className="w-6 h-6" />, href: "/erp/accountant", badge: "GL", key: "accounting", section: "Ofia Enterprise Suite" },
    { label: "HR & Appraisals", icon: <Users className="w-6 h-6" />, href: "/erp/hr", key: "hr", section: "Ofia Enterprise Suite" },
    { label: "User Management", icon: <UserCheck className="w-6 h-6" />, href: "/erp/admin/users", badge: "Staff", key: "users", section: "Ofia Enterprise Suite" },

    // 3. PORTALS & WORKSPACES
    { label: "Employee Portal", icon: <UserCheck className="w-6 h-6" />, href: "/erp/employee", key: "employee", section: "Portals & Team" },
    { label: "Manager Portal", icon: <Sliders className="w-6 h-6" />, href: "/erp/manager", key: "manager", section: "Portals & Team" },
    { label: "Executive Portal", icon: <TrendingUp className="w-6 h-6" />, href: "/erp/md", key: "md", section: "Portals & Team" },
  ];

  // Automatic sub navigation tabs according to current pathname
  const getSubTabs = (): SubNavItem[] => {
    if (subTabs !== undefined) return subTabs;

    if (pathname.startsWith("/erp/admin/users") || pathname.startsWith("/erp/admin/departments")) {
      return [
        { label: "Staff Directory", href: "/erp/admin/users", icon: <Users className="w-3.5 h-3.5" /> },
        { label: "Departments", href: "/erp/admin/departments", icon: <Building2 className="w-3.5 h-3.5" /> },
        { label: "Mass Messaging", href: "/erp/admin/users/mass-messaging", icon: <Mail className="w-3.5 h-3.5" /> },
      ];
    }

    if (pathname.startsWith("/erp/admin/crm") || pathname.startsWith("/erp/marketer")) {
      return [
        { label: "Command Center", href: "/erp/admin/crm", icon: <BarChart3 className="w-3.5 h-3.5" /> },
        { label: "Deals Pipeline", href: "/erp/admin/crm/pipeline", icon: <TrendingUp className="w-3.5 h-3.5" /> },
        { label: "Leads Directory", href: "/erp/admin/crm/leads", icon: <Users className="w-3.5 h-3.5" /> },
        { label: "Contacts & Accounts", href: "/erp/admin/crm/contacts", icon: <Building2 className="w-3.5 h-3.5" /> },
        { label: "Email Blasts", href: "/erp/admin/crm/marketing", icon: <Send className="w-3.5 h-3.5" />, badge: "Email" },
        { label: "Audience Lists", href: "/erp/admin/crm/lists", icon: <Users className="w-3.5 h-3.5" /> },
        { label: "Sales Activities", href: "/erp/admin/crm/activities", icon: <Calendar className="w-3.5 h-3.5" /> },
      ];
    }

    if (pathname.startsWith("/erp/admin/ai")) {
      return [
        { label: "Command Center", href: "/erp/admin/ai", icon: <Bot className="w-3.5 h-3.5" /> },
        { label: "Campaigns", href: "/erp/admin/ai/campaigns", icon: <Send className="w-3.5 h-3.5" /> },
        { label: "AI Studio", href: "/erp/admin/ai/studio", icon: <Zap className="w-3.5 h-3.5" /> },
        { label: "Strategy", href: "/erp/admin/ai/strategy", icon: <TrendingUp className="w-3.5 h-3.5" /> },
        { label: "Knowledge Base", href: "/erp/admin/ai/knowledge", icon: <Database className="w-3.5 h-3.5" /> },
        { label: "Analytics", href: "/erp/admin/ai/analytics", icon: <BarChart3 className="w-3.5 h-3.5" /> },
        { label: "Team", href: "/erp/admin/ai/team", icon: <Users className="w-3.5 h-3.5" /> },
        { label: "Telegram Bot", href: "/erp/admin/ai/telegram", icon: <Radio className="w-3.5 h-3.5" /> },
        { label: "Approvals", href: "/erp/admin/ai/approvals", icon: <FileCheck2 className="w-3.5 h-3.5" /> },
        { label: "Integrations", href: "/erp/admin/ai/integrations", icon: <Key className="w-3.5 h-3.5" /> },
        { label: "Pricing / BYOK", href: "/erp/admin/ai/pricing", icon: <DollarSign className="w-3.5 h-3.5" /> },
        { label: "Settings", href: "/erp/admin/ai/settings", icon: <Settings className="w-3.5 h-3.5" /> },
      ];
    }

    if (pathname.startsWith("/erp/admin/shop")) {
      return [
        { label: "Shop Overview", href: "/erp/admin/shop", icon: <Store className="w-3.5 h-3.5" /> },
        { label: "Catalog & Listings", href: "/erp/admin/shop/catalog", icon: <Package className="w-3.5 h-3.5" />, badge: "Items" },
        { label: "Services & Bookings", href: "/erp/admin/shop/services", icon: <Calendar className="w-3.5 h-3.5" />, badge: "Bookings" },
        { label: "Orders & Requests", href: "/erp/admin/shop/orders", icon: <ClipboardList className="w-3.5 h-3.5" />, badge: "Orders" },
        { label: "Inventory (IMS)", href: "/erp/admin/shop/inventory", icon: <Boxes className="w-3.5 h-3.5" />, badge: "IMS" },
        { label: "Point of Sale (POS)", href: "/erp/admin/shop/pos", icon: <ShoppingCart className="w-3.5 h-3.5" />, badge: "POS" },
        { label: "My Store Studio", href: "/erp/admin/shop/store", icon: <Palette className="w-3.5 h-3.5" />, badge: "Studio" },
        { label: "Viral Referrals", href: "/erp/admin/shop/referrals", icon: <Gift className="w-3.5 h-3.5" />, badge: "Growth" },
      ];
    }

    if (pathname.startsWith("/erp/admin/logistics")) {
      return [
        { label: "Logistics Overview", href: "/erp/admin/logistics", icon: <Truck className="w-3.5 h-3.5" /> },
        { label: "Courier Dispatch Desk", href: "/erp/admin/logistics/dispatch", icon: <Send className="w-3.5 h-3.5" /> },
        { label: "Live Fleet Map", href: "/erp/admin/logistics/fleet", icon: <Activity className="w-3.5 h-3.5" /> },
        { label: "Zonal Shipping Rates", href: "/erp/admin/logistics/rates", icon: <DollarSign className="w-3.5 h-3.5" /> },
        { label: "Waybill Shipments", href: "/erp/admin/logistics/shipments", icon: <FileText className="w-3.5 h-3.5" /> },
      ];
    }

    if (pathname.startsWith("/erp/admin/marketplace")) {
      return [
        { label: "Storefront Overview", href: "/erp/admin/marketplace", icon: <ShoppingBag className="w-3.5 h-3.5" /> },
        { label: "Shop Products", href: "/erp/admin/marketplace/shop", icon: <ShoppingCart className="w-3.5 h-3.5" /> },
        { label: "Service Bookings", href: "/erp/admin/marketplace/bookings", icon: <Clock className="w-3.5 h-3.5" /> },
        { label: "Incoming Leads", href: "/erp/admin/marketplace/leads", icon: <Users className="w-3.5 h-3.5" /> },
        { label: "Promotions & Deals", href: "/erp/admin/marketplace/deals", icon: <Gift className="w-3.5 h-3.5" /> },
        { label: "Articles & Guides", href: "/erp/admin/marketplace/articles", icon: <FileText className="w-3.5 h-3.5" /> },
        { label: "Earnings Wallet", href: "/erp/admin/marketplace/wallet", icon: <DollarSign className="w-3.5 h-3.5" /> },
        { label: "Store Settings", href: "/erp/admin/marketplace/settings", icon: <Settings className="w-3.5 h-3.5" /> },
      ];
    }

    if (pathname.startsWith("/erp/accountant")) {
      return [
        { label: "Finance Overview", href: "/erp/accountant", icon: <PieChart className="w-3.5 h-3.5" /> },
        { label: "Chart of Accounts", href: "/erp/accountant/coa", icon: <FolderKanban className="w-3.5 h-3.5" /> },
        { label: "Invoices & Billing", href: "/erp/accountant/invoices", icon: <FileText className="w-3.5 h-3.5" /> },
        { label: "Expenses", href: "/erp/accountant/expenses", icon: <DollarSign className="w-3.5 h-3.5" /> },
        { label: "Trial Balance", href: "/erp/accountant/trial-balance", icon: <Layers className="w-3.5 h-3.5" /> },
        { label: "Income Statement", href: "/erp/accountant/income-statement", icon: <TrendingUp className="w-3.5 h-3.5" /> },
        { label: "Financial Position", href: "/erp/accountant/financial-position", icon: <Building2 className="w-3.5 h-3.5" /> },
        { label: "Banking Feeds", href: "/erp/accountant/banking", icon: <DollarSign className="w-3.5 h-3.5" /> },
        { label: "Reconcile", href: "/erp/accountant/reconcile", icon: <Check className="w-3.5 h-3.5" /> },
        { label: "Salaries / Payroll", href: "/erp/accountant/employee-salaries", icon: <Users className="w-3.5 h-3.5" /> },
        { label: "FIRS Tax / Remittances", href: "/erp/accountant/statutory-remittances", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
        { label: "Audit Trail", href: "/erp/accountant/audit-trail", icon: <Activity className="w-3.5 h-3.5" /> },
      ];
    }

    if (pathname.startsWith("/erp/hr")) {
      return [
        { label: "Appraisal Overview", href: "/erp/hr", icon: <Activity className="w-3.5 h-3.5" /> },
        { label: "Staff Directory", href: "/erp/hr/users", icon: <Users className="w-3.5 h-3.5" /> },
        { label: "Objective Banks", href: "/erp/hr/objectives", icon: <Target className="w-3.5 h-3.5" /> },
        { label: "Appraisal Cycles", href: "/erp/hr/cycle", icon: <Calendar className="w-3.5 h-3.5" /> },
        { label: "Reports & Ranking", href: "/erp/hr/reports", icon: <BarChart3 className="w-3.5 h-3.5" /> },
        { label: "Team Quests", href: "/erp/hr/quests", icon: <Trophy className="w-3.5 h-3.5" /> },
      ];
    }

    if (pathname.startsWith("/erp/employee")) {
      const tabs: SubNavItem[] = [
        { label: "My Overview", href: "/erp/employee", icon: <UserCheck className="w-3.5 h-3.5" /> },
        { label: "Performance Reviews", href: "/erp/employee/reviews", icon: <Activity className="w-3.5 h-3.5" /> },
        { label: "My Team Quests", href: "/erp/employee/quests", icon: <Trophy className="w-3.5 h-3.5" /> },
        { label: "My Profile & Growth", href: "/erp/employee/profile", icon: <Users className="w-3.5 h-3.5" /> },
      ];
      if (currentRole === "manager") {
        tabs.unshift({ label: "← Back to Manager Portal", href: "/erp/manager", icon: <Sliders className="w-3.5 h-3.5" /> });
      } else if (currentRole === "md") {
        tabs.unshift({ label: "← Back to MD Portal", href: "/erp/md", icon: <TrendingUp className="w-3.5 h-3.5" /> });
      }
      return tabs;
    }

    if (pathname.startsWith("/erp/manager")) {
      return [
        { label: "Manager Overview", href: "/erp/manager", icon: <Sliders className="w-3.5 h-3.5" /> },
        { label: "Team Reviews", href: "/erp/manager/reviews", icon: <Activity className="w-3.5 h-3.5" /> },
        { label: "My Self-Service (Employee Portal)", href: "/erp/employee", icon: <UserCheck className="w-3.5 h-3.5" /> },
      ];
    }

    if (pathname.startsWith("/erp/md")) {
      const tabs: SubNavItem[] = [
        { label: "Executive Cockpit", href: "/erp/md", icon: <TrendingUp className="w-3.5 h-3.5" /> },
      ];
      if (isLineManager) {
        tabs.push({ label: "Team Reviews (Manager Portal)", href: "/erp/manager", icon: <Sliders className="w-3.5 h-3.5" /> });
      }
      tabs.push({ label: "My Self-Service (Employee Portal)", href: "/erp/employee", icon: <UserCheck className="w-3.5 h-3.5" /> });
      return tabs;
    }

    return [];
  };

  const activeSubTabs = getSubTabs();

  const filteredNavItems = navItems.filter((item) => {
    const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (currentRole === "employee") {
      return (
        item.key === "employee" ||
        item.href === "/erp/employee" ||
        item.href.startsWith("/erp/employee/")
      );
    }

    if (item.key === "overview" || item.href === "/erp/admin") {
      return currentRole === "admin";
    }

    const isProvisioned = (key: string) => {
      if (key === "overview" || key === "employee") return true;
      if (key === "departments") {
        const isAdminAllowed = permissionMatrix.admin?.users !== false;
        const isTpAllowed = (permissionMatrix as any).tenant_provision?.users !== false;
        return isAdminAllowed && isTpAllowed;
      }
      const isAdminAllowed = permissionMatrix.admin?.[key] !== false;
      const isTpAllowed = (permissionMatrix as any).tenant_provision?.[key] !== false;
      return isAdminAllowed && isTpAllowed;
    };

    return isNavItemVisibleForRole(
      item.key,
      currentRole,
      isLineManager,
      isProvisioned
    );
  });


  return (
    <div className="min-h-screen bg-nexa-bg-base text-nexa-text-primary flex flex-col md:flex-row relative font-sans">
      {/* MOBILE TOP HEADER */}
      <header className="md:hidden sticky top-0 left-0 right-0 h-14 bg-nexa-bg-surface border-b border-nexa-border z-40 flex items-center justify-between px-4 shrink-0 shadow-sm">
        <Link
          href={currentRole === "employee" ? "/erp/employee" : getRoleHomePortal(currentRole)?.path || "/erp/admin"}
          className="flex items-center gap-2 min-w-0"
        >
          <img
            src={tenantLogo || OFIA_DEFAULT_LOGO}
            alt="Logo"
            className="w-7 h-7 object-contain shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).src = OFIA_DEFAULT_LOGO; }}
          />
          <div className="flex flex-col min-w-0">
            <span className="font-black text-sm text-[var(--nexa-text-primary)] truncate">{tenantName || "Ofia ERP"}</span>
            <span className="text-[9px] font-black text-[#1A56DB] uppercase tracking-wider">{currentRole}</span>
          </div>
        </Link>
        <div className="flex items-center gap-3 shrink-0">
          <NexaThemeToggle />
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-1.5 rounded-full text-nexa-text-secondary hover:bg-nexa-bg-base"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-nexa-bg-surface" />
            )}
          </button>
          <button onClick={logout} className="p-1.5 rounded-full text-red-500 hover:bg-red-500/10">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* NOTIFICATIONS DROPDOWN ON MOBILE (Absolutely positioned below header) */}
      {isNotifOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 bottom-24 z-30 bg-nexa-bg-surface border-b border-nexa-border overflow-y-auto shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Notifications</h3>
            <button onClick={() => setIsNotifOpen(false)} className="p-1 rounded-lg hover:bg-nexa-bg-base">
              <X className="w-4 h-4" />
            </button>
          </div>
          {notifications.length === 0 ? (
            <div className="text-center py-6 text-nexa-text-muted text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-3 rounded-xl bg-nexa-bg-base border border-nexa-border">
                  <div className="flex items-center gap-2 text-[10px] text-nexa-text-muted mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border font-medium uppercase tracking-wider">
                      {notif.type}
                    </span>
                    <span>{notif.time}</span>
                  </div>
                  <h4 className="text-xs font-bold">{notif.title}</h4>
                  <p className="text-[10px] text-nexa-text-secondary mt-1">{notif.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SIDEBAR — EXACT OFIA MARKETPLACE VERBATIM STYLING */}
      <aside
        className={cn(
          "hidden md:flex bg-nexa-bg-surface border-r border-nexa-border transition-all duration-300 flex-col z-50 sticky top-0 h-screen",
          isSidebarOpen ? "w-72" : "w-20"
        )}
      >
        {/* COLLAPSE TOGGLE BUTTON WITH PURE WHITE BACKGROUND */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 w-6 h-6 !bg-white bg-white border border-slate-200 shadow-md rounded-full flex items-center justify-center text-slate-700 hover:text-[#1A56DB] hover:scale-110 transition-transform z-[60] cursor-pointer"
        >
          {isSidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* LOGO AREA */}
        <div className="p-6 pb-2 flex items-center justify-between">
          {!isShellReady ? (
            <div className="flex items-center gap-2.5 min-w-0 w-full animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/60 shrink-0" />
              {isSidebarOpen && (
                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                  <div className="h-3.5 w-28 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
                  <div className="h-2.5 w-16 bg-slate-100/70 dark:bg-slate-800/40 rounded-md" />
                </div>
              )}
            </div>
          ) : isSidebarOpen ? (
            <Link
              href={
                currentRole === "employee"
                  ? "/erp/employee"
                  : getRoleHomePortal(currentRole)?.path || "/erp/admin"
              }
              className="flex items-center gap-2.5 min-w-0"
            >
              <img
                src={tenantLogo || OFIA_DEFAULT_LOGO}
                alt={tenantName || "Ofia ERP"}
                className="w-8 h-8 object-contain shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = OFIA_DEFAULT_LOGO;
                }}
              />
              <div className="flex flex-col min-w-0">
                <span
                  className="text-sm font-black text-display leading-tight text-[var(--nexa-text-primary)] truncate max-w-[180px]"
                  title={tenantName || "Ofia ERP"}
                >
                  {tenantName || "Ofia ERP"}
                </span>
                <span className="text-[11px] font-black text-[#1A56DB] tracking-wide uppercase mt-0.5">
                  OFIA ERP
                </span>
                <span className="text-[9px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider">
                  Enterprise Workspace
                </span>
              </div>
            </Link>
          ) : (
            <img
              src={tenantLogo || OFIA_DEFAULT_LOGO}
              alt={tenantName || "Ofia ERP"}
              className="w-8 h-8 object-contain shrink-0 mx-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).src = OFIA_DEFAULT_LOGO;
              }}
            />
          )}
        </div>

        {/* SEARCH BAR — DIRECTLY UNDER LOGO AND TITLE */}
        <div className="px-4 py-2">
          {isSidebarOpen ? (
            <div className="flex items-center bg-nexa-bg-base px-3.5 py-2 rounded-full border border-nexa-border gap-2.5 w-full focus-within:border-nexa-brand transition-all">
              <Search className="w-3.5 h-3.5 text-nexa-text-muted shrink-0" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs outline-none w-full text-nexa-text-primary placeholder:text-nexa-text-muted font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-nexa-text-muted hover:text-nexa-text-primary cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 mx-auto rounded-full bg-nexa-bg-base border border-nexa-border flex items-center justify-center text-nexa-text-muted hover:text-nexa-text-primary hover:border-nexa-brand/30 transition-colors cursor-pointer"
              title="Search ERP modules"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* NAV ITEMS WITH SECTION GROUPINGS */}
        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
          {!isShellReady ? (
            <div className="space-y-1.5 py-2 animate-pulse">
              <div className="px-3 pb-1">
                <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800/50 rounded-full" />
              </div>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-full flex items-center gap-3.5 p-3 rounded-full mb-1"
                >
                  <div className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-800/60 shrink-0" />
                  {isSidebarOpen && (
                    <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800/60 flex-1 max-w-[120px]" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            (() => {
            let currentSection = "";

            return filteredNavItems.map((item, i) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/erp/admin" && pathname.startsWith(item.href)) ||
                (item.href === "/erp/admin" && pathname === "/erp/admin") ||
                (item.key === "users" && pathname.startsWith("/erp/admin/departments"));

              const showSectionHeader = item.section && item.section !== currentSection;
              if (showSectionHeader) {
                currentSection = item.section;
              }
              const displaySection = currentRole === "employee" ? "Employee Workspace" : item.section;

              return (
                <React.Fragment key={item.key || i}>
                  {showSectionHeader && (
                    <div className={cn("pt-3 pb-1", i === 0 && "pt-0")}>
                      {isSidebarOpen ? (
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-nexa-text-muted px-3 flex items-center gap-1.5">
                          <span>{displaySection}</span>
                        </div>
                      ) : (
                        <div className="w-8 h-[1px] bg-nexa-border mx-auto my-1" />
                      )}
                    </div>
                  )}
                  <Link href={item.href}>
                    <button
                      className={cn(
                        "w-full flex items-center gap-3.5 p-3 rounded-full transition-all group mb-1 cursor-pointer",
                        isActive
                          ? "bg-nexa-brand text-white shadow-lg shadow-nexa-brand/20 font-bold"
                          : "text-nexa-text-secondary hover:bg-nexa-bg-base hover:text-nexa-text-primary font-semibold"
                      )}
                    >
                      <div
                        className={cn(
                          "transition-transform group-hover:scale-110",
                          isActive ? "text-white" : "text-nexa-text-muted group-hover:text-nexa-brand transition-colors"
                        )}
                      >
                        {item.icon}
                      </div>
                      {isSidebarOpen && (
                        <div className="flex-1 flex items-center justify-between text-left">
                          <span className="text-[15px]">{item.label}</span>
                          {item.badge && (
                            <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  </Link>
                </React.Fragment>
              );
            });
          })()
        )}
        </nav>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-nexa-border space-y-2 relative">
          {/* USER PROFILE & NOTIFICATION ROW */}
          <div className="relative" ref={dropdownRef}>
            {!isShellReady ? (
              <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-nexa-bg-base/40 border border-nexa-border/60 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/60 shrink-0" />
                {isSidebarOpen && (
                  <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800/60 rounded-full" />
                    <div className="h-2 w-12 bg-slate-100/70 dark:bg-slate-800/40 rounded-full" />
                  </div>
                )}
              </div>
            ) : isSidebarOpen ? (
              <div className="flex items-center justify-between p-2 rounded-2xl bg-nexa-bg-base/70 border border-nexa-border">
                <div className="flex items-center gap-2.5 min-w-0">
                  <NexaAvatar size="sm" isOnline src={userAvatar} name={isMounted ? (userName || user?.name || "Staff") : "Staff"} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-nexa-text-primary truncate" suppressHydrationWarning>
                      {isMounted ? (userName || user?.name || (tenantName ? `${tenantName} Staff` : "Staff")) : "Staff"}
                    </p>
                    <p
                      className={cn(
                        "text-[9px] font-extrabold uppercase tracking-wider truncate inline-block px-1.5 py-0.5 rounded-full border mt-0.5",
                        getRoleBadgeColor(currentRole)
                      )}
                      suppressHydrationWarning
                    >
                      {getRoleDisplayName(currentRole)}
                    </p>
                  </div>
                </div>

                {/* NOTIFICATION BELL BUTTON */}
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-1.5 hover:bg-nexa-bg-surface rounded-full cursor-pointer text-nexa-text-secondary focus:outline-none transition-colors border border-nexa-border shrink-0 ml-1.5"
                  title="Live Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 bg-red-500 rounded-full text-[8px] font-extrabold text-white flex items-center justify-center px-0.5 shadow-sm animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <NexaAvatar size="sm" isOnline src={userAvatar} name={userName || user?.name || tenantName} />
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 hover:bg-nexa-bg-base rounded-full cursor-pointer text-nexa-text-secondary focus:outline-none transition-colors border border-nexa-border"
                  title="Live Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 bg-red-500 rounded-full text-[8px] font-extrabold text-white flex items-center justify-center px-0.5 shadow-sm animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* NOTIFICATION CENTER DROPDOWN */}
            {isNotifOpen && (
              <div className="absolute left-full bottom-0 ml-3 w-80 sm:w-96 bg-nexa-bg-surface border border-nexa-border rounded-3xl shadow-2xl z-[100] overflow-hidden flex flex-col max-h-[500px]">
                <div className="p-4 border-b border-nexa-border flex items-center justify-between bg-nexa-bg-base/50">
                  <span className="font-extrabold text-sm text-display">ERP Live Alerts</span>
                  <span className="text-xs text-[#1A56DB] font-bold">Real-Time Sync</span>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-nexa-border max-h-[350px]">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        "p-4 transition-colors flex gap-3 items-start relative group hover:bg-nexa-bg-base/30",
                        !notif.isRead && "bg-nexa-brand/5 dark:bg-nexa-brand/10"
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider bg-blue-500/10 text-blue-500 border-blue-500/20">
                            {notif.type}
                          </span>
                          <span className="text-[10px] text-nexa-text-muted font-semibold">
                            {notif.time}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-nexa-text-primary">{notif.title}</h4>
                        <p className="text-xs text-nexa-text-secondary mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {currentRole === "admin" && (
            <Link href="/tenant/settings">
              <button
                className={cn(
                  "w-full flex items-center gap-3.5 p-3 rounded-full transition-all group cursor-pointer",
                  pathname === "/tenant/settings"
                    ? "bg-nexa-brand text-white shadow-md shadow-nexa-brand/20 font-bold"
                    : "text-nexa-text-secondary hover:bg-nexa-bg-base hover:text-nexa-text-primary font-semibold"
                )}
              >
                <div
                  className={cn(
                    "transition-transform group-hover:scale-110",
                    pathname === "/tenant/settings"
                      ? "text-white"
                      : "text-nexa-text-muted group-hover:text-nexa-brand transition-colors"
                  )}
                >
                  <Settings className="w-6 h-6" />
                </div>
                {isSidebarOpen && <span className="font-bold text-xs">Workspace Settings</span>}
              </button>
            </Link>
          )}
          <div className="flex items-center gap-1.5 justify-between">
            <button
              onClick={logout}
              className={cn(
                "flex items-center gap-3.5 p-3 rounded-full text-red-500 hover:bg-red-500/10 transition-all text-left cursor-pointer",
                isSidebarOpen ? "flex-1" : "w-full justify-center"
              )}
              title="Logout"
            >
              <LogOut className="w-6 h-6 shrink-0" />
              {isSidebarOpen && <span className="font-bold text-xs">Logout</span>}
            </button>

            {isSidebarOpen ? (
              <div className="shrink-0">
                <NexaThemeToggle />
              </div>
            ) : null}
          </div>
          {!isSidebarOpen && (
            <div className="flex justify-center pt-1">
              <NexaThemeToggle />
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* CONTENT WRAPPER */}
        <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-6 flex-1">
          {isEffectiveLoading ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* HEADER TITLE & ACTIONS (IF PROVIDED) */}
              {(title || action) && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    {title && (
                      <h1 className="text-2xl font-black text-display tracking-tight text-nexa-text-primary" suppressHydrationWarning>
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className="text-xs text-nexa-text-secondary mt-1 leading-relaxed max-w-3xl" suppressHydrationWarning>
                        {subtitle}
                      </p>
                    )}
                  </div>
                  {action && <div className="shrink-0 flex items-center gap-2.5">{action}</div>}
                </div>
              )}

              {/* HORIZONTAL SUB-NAVIGATION PILL TABS */}
              {activeSubTabs.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-nexa-border pt-1">
                  {activeSubTabs.map((tab, idx) => {
                    const isTabActive = (() => {
                      if (pathname === tab.href) return true;
                      if (tab.href === "/erp/admin/shop") return pathname === "/erp/admin/shop";
                      if (tab.href === "/erp/admin/shop/catalog") return pathname.startsWith("/erp/admin/shop/catalog");
                      if (tab.href === "/erp/admin/shop/services") return pathname.startsWith("/erp/admin/shop/services");
                      if (tab.href === "/erp/admin/shop/orders") return pathname.startsWith("/erp/admin/shop/orders");
                      if (tab.href === "/erp/admin/shop/inventory") return pathname.startsWith("/erp/admin/shop/inventory");
                      if (tab.href === "/erp/admin/shop/pos") return pathname.startsWith("/erp/admin/shop/pos");
                      if (tab.href === "/erp/admin/shop/store") return pathname.startsWith("/erp/admin/shop/store");
                      if (tab.href === "/erp/admin/shop/referrals") return pathname.startsWith("/erp/admin/shop/referrals");
                      if (tab.href === "/erp/admin/users") return pathname === "/erp/admin/users";
                      if (tab.href === "/erp/admin/departments") return pathname.startsWith("/erp/admin/departments");
                      if (
                        tab.href === "/erp/admin" ||
                        tab.href === "/erp/admin/ai" ||
                        tab.href === "/erp/marketer" ||
                        tab.href === "/erp/admin/logistics" ||
                        tab.href === "/erp/admin/marketplace" ||
                        tab.href === "/erp/accountant" ||
                        tab.href === "/erp/hr" ||
                        tab.href === "/erp/employee" ||
                        tab.href === "/erp/manager"
                      ) {
                        return false;
                      }
                      return pathname.startsWith(tab.href);
                    })();
                    return (
                      <Link href={tab.href} key={idx} className="shrink-0">
                        <button
                          className={cn(
                            "px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm",
                            isTabActive
                              ? "bg-[#1A56DB] text-white shadow-md shadow-[#1A56DB]/25 font-bold border border-[#1A56DB]"
                              : "bg-nexa-bg-surface hover:bg-nexa-bg-surface/80 text-nexa-text-secondary hover:text-nexa-text-primary border border-nexa-border hover:border-nexa-brand/30"
                          )}
                        >
                          {tab.icon && <span>{tab.icon}</span>}
                          <span>{tab.label}</span>
                          {tab.badge && (
                            <span
                              className={cn(
                                "text-[9px] px-1.5 py-0.2 rounded-full font-extrabold",
                                isTabActive ? "bg-white text-[#1A56DB]" : "bg-[#1A56DB]/10 text-[#1A56DB]"
                              )}
                            >
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* PAGE BODY */}
              <div className="pt-2">
                <RoleGuard requiredModule={activeModule}>
                  {children}
                </RoleGuard>
              </div>
            </>
          )}
        </div>
      </main>

      {/* BOTTOM RIGHT SWITCH TO [ROLE] BUTTON */}
      {(() => {
        if (isEffectiveLoading || currentRole === "employee") return null;
        const sessionHome = getRoleHomePortal(currentRole);
        const isAwayFromRoleHome =
          sessionHome &&
          pathname !== sessionHome.path &&
          !pathname.startsWith(sessionHome.path + "/");

        if (!isAwayFromRoleHome || !sessionHome) return null;

        return (
          <div className="fixed bottom-6 right-6 z-[100] animate-bounce-subtle">
            <Link href={sessionHome.path}>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1A56DB] hover:bg-[#1546b8] text-white text-xs font-bold transition-all shadow-xl hover:shadow-2xl cursor-pointer border border-blue-400/40 active:scale-95 ring-2 ring-black/10"
                title={`Switch to ${sessionHome.label}`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Switch to {sessionHome.label}</span>
              </button>
            </Link>
          </div>
        );
      })()}

      {/* MOBILE BOTTOM NAV MENU */}
      {!isEffectiveLoading && (
        <nav
          className="md:hidden fixed left-4 right-4 z-[100] flex items-center overflow-x-auto no-scrollbar px-2 py-2 rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[inset_0_2px_6px_rgba(255,255,255,1),inset_0_-2px_6px_rgba(255,255,255,0.5),0_10px_30px_rgba(0,0,0,0.15)]"
          style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {filteredNavItems.map((item, i) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/erp/admin" && pathname.startsWith(item.href)) ||
              (item.href === "/erp/admin" && pathname === "/erp/admin") ||
              (item.key === "users" && pathname.startsWith("/erp/admin/departments"));

            return (
              <Link href={item.href} key={i} className={cn("flex flex-col items-center justify-center min-w-[72px] max-w-[80px] shrink-0 p-1.5 rounded-xl gap-1.5 transition-colors cursor-pointer", isActive ? "text-[#1A56DB]" : "text-slate-500 hover:text-slate-800")}>
                <div className={cn("p-1.5 rounded-lg transition-colors", isActive ? "bg-[#1A56DB]/10" : "")}>
                  {React.cloneElement(item.icon as any, { className: "w-5 h-5 shrink-0" })}
                </div>
                <span className={cn("text-[9px] font-bold truncate w-full text-center tracking-wide", isActive ? "text-[#1A56DB]" : "text-slate-500")}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1A56DB] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1A56DB]"></span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}