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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { NexaThemeToggle } from "@/components/nexa/NexaThemeToggle";
import { useAuth } from "@/components/nexa/AuthContext";
import {
  getTenantPermissionMatrix,
  fetchTenantPermissionMatrix,
  PermissionMatrix,
  DEFAULT_PERMISSION_MATRIX,
  RoleKey,
} from "@/lib/access-control";

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
  activeModule?: "mission" | "ai" | "crm" | "marketplace" | "shop" | "inventory" | "pos" | "referrals" | "logistics" | "quests" | "finance" | "hr" | "md" | "employee" | "access_control";
  subTabs?: SubNavItem[];
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
    title: "Tenant Administrator",
    roleKey: "admin",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    iconBg: "from-blue-600 to-indigo-600",
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [tenantName, setTenantName] = useState<string>("EduSuite");
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>(DEFAULT_PERMISSION_MATRIX);
  const [currentRole, setCurrentRole] = useState<RoleKey>("admin");
  const [userName, setUserName] = useState<string>("EduSuite Staff");
  const [userEmail, setUserEmail] = useState<string>("staff@edusuite.ng");

  const getRoleDisplayName = (role: RoleKey) => {
    switch (role) {
      case "admin": return "Tenant Administrator";
      case "md": return "Managing Director";
      case "hr": return "HR Director";
      case "accountant": return "Chief Accountant";
      case "marketer": return "Growth Marketer";
      case "manager": return "Line Manager";
      case "employee": return "General Employee";
      case "cashier": return "POS Cashier";
      case "inventory_officer": return "Warehouse Officer";
      case "dispatcher": return "Fleet Dispatcher";
      default: return `${tenantName} Staff`;
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
    if (typeof window !== "undefined") {
      const host = window.location.host.toLowerCase();
      const hostParts = host.split(":")[0].split(".");
      const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
      let sub = "";
      if (isLocal && hostParts.length > 1 && hostParts[0] !== "localhost" && hostParts[0] !== "www") {
        sub = hostParts[0];
      } else if (!isLocal && hostParts.length > 2) {
        sub = hostParts[0];
      }
      let tName = "EduSuite";
      if (sub && sub !== "erp" && sub !== "admin" && sub !== "www" && sub !== "app") {
        tName = sub.charAt(0).toUpperCase() + sub.slice(1);
      } else if (user?.email && user.email.includes("@")) {
        const domain = user.email.split("@")[1].split(".")[0];
        if (domain && domain !== "ofia" && domain !== "gmail" && domain !== "yahoo") {
          tName = domain.charAt(0).toUpperCase() + domain.slice(1);
        }
      } else {
        const stored = localStorage.getItem("nexa_org_name") || localStorage.getItem("nexa_user_email");
        if (stored && stored.includes("@")) {
          const domain = stored.split("@")[1].split(".")[0];
          tName = domain.charAt(0).toUpperCase() + domain.slice(1);
        }
      }
      setTenantName(tName);
      setPermissionMatrix(getTenantPermissionMatrix(tName));

      // Listen to MySQL database on load to determine Super Admin allowed modules
      fetchTenantPermissionMatrix(tName).then((remote) => {
        if (remote && Object.keys(remote).length > 0) {
          setPermissionMatrix(remote);
        }
      });

      // Track and remember home/origin portal
      let origin: OriginPortal | null = null;
      if (pathname.startsWith("/erp/admin")) {
        origin = {
          path: "/erp/admin",
          label: "Admin",
          title: "Tenant Administrator",
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
      }

      if (origin) {
        sessionStorage.setItem("erp_origin_portal", JSON.stringify(origin));
        setOriginPortal(origin);
      } else {
        const storedOrigin = sessionStorage.getItem("erp_origin_portal");
        if (storedOrigin) {
          try {
            setOriginPortal(JSON.parse(storedOrigin));
          } catch {}
        } else {
          // Default fallback origin based on primary user role
          const storedUser = localStorage.getItem("erp_current_user");
          let primary = "admin";
          if (storedUser) {
            try {
              const u = JSON.parse(storedUser);
              if (u.role) primary = u.role;
            } catch {}
          }
          if (primary === "md") {
            setOriginPortal({
              path: "/erp/md",
              label: "MD",
              title: "Managing Director",
              roleKey: "md",
              badgeColor: "bg-purple-500/20 text-purple-300 border-purple-400/30",
              iconBg: "from-purple-600 to-indigo-600",
            });
          } else if (primary === "hr") {
            setOriginPortal({
              path: "/erp/hr",
              label: "HR",
              title: "Human Resources",
              roleKey: "hr",
              badgeColor: "bg-rose-500/20 text-rose-300 border-rose-400/30",
              iconBg: "from-rose-600 to-pink-600",
            });
          } else if (primary === "accountant") {
            setOriginPortal({
              path: "/erp/accountant",
              label: "Accountant",
              title: "Chief Accountant",
              roleKey: "accountant",
              badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
              iconBg: "from-emerald-600 to-teal-600",
            });
          } else if (primary === "manager") {
            setOriginPortal({
              path: "/erp/manager",
              label: "Manager",
              title: "Line Manager",
              roleKey: "manager",
              badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/30",
              iconBg: "from-amber-600 to-orange-600",
            });
          } else {
            setOriginPortal({
              path: "/erp/admin",
              label: "Admin",
              title: "Tenant Administrator",
              roleKey: "admin",
              badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/30",
              iconBg: "from-blue-600 to-indigo-600",
            });
          }
        }
      }

      // Resolve user active session role, name, and email
      let resolvedRole: RoleKey = "admin";
      let resolvedName = user?.name || `${tName} Admin`;
      let resolvedEmail = user?.email || "admin@edusuite.ng";
      let hasStoredRole = false;

      const storedErpUser = localStorage.getItem("erp_current_user");
      if (storedErpUser) {
        try {
          const parsed = JSON.parse(storedErpUser);
          if (parsed) {
            if (parsed.role) {
              resolvedRole = parsed.role as RoleKey;
              hasStoredRole = true;
            }
            if (parsed.name) resolvedName = parsed.name;
            if (parsed.email) resolvedEmail = parsed.email;
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
        }
      }

      setCurrentRole(resolvedRole);
      setUserName(resolvedName);
      setUserEmail(resolvedEmail);

      // Role Protection Guard:
      // If a non-admin role lands directly on /erp/admin (root admin overview) or /erp/admin/access-control:
      // redirect them immediately to their designated home dashboard!
      if (resolvedRole !== "admin" && (pathname === "/erp/admin" || pathname === "/erp/admin/access-control")) {
        if (resolvedRole === "md") {
          window.location.href = "/erp/md";
          return;
        } else if (resolvedRole === "hr") {
          window.location.href = "/erp/hr";
          return;
        } else if (resolvedRole === "accountant") {
          window.location.href = "/erp/accountant";
          return;
        } else if (resolvedRole === "manager") {
          window.location.href = "/erp/manager";
          return;
        } else if (resolvedRole === "employee") {
          window.location.href = "/erp/employee";
          return;
        }
      }

      const handleRbacUpdate = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail && customEvent.detail.matrix) {
          setPermissionMatrix(customEvent.detail.matrix);
        }
      };

      window.addEventListener("ofia_rbac_updated", handleRbacUpdate);
      return () => window.removeEventListener("ofia_rbac_updated", handleRbacUpdate);
    }
  }, [user, pathname]);

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
    { label: "Overview", icon: <LayoutDashboard className="w-5 h-5" />, href: "/erp/admin", key: "overview", section: "Operations" },
    { label: "Ofia AI Swarm", icon: <Bot className="w-5 h-5" />, href: "/erp/admin/ai", badge: "15 AI", key: "ai", section: "Operations" },
    { label: "Ofia Compass Manager", icon: <ShoppingBag className="w-5 h-5" />, href: "/erp/admin/marketplace", key: "marketplace", section: "Operations" },
    { label: "Ofia Shop Manager", icon: <Store className="w-5 h-5" />, href: "/erp/admin/shop", badge: "Retail", key: "shop", section: "Operations" },
    { label: "Ofia Logistics Manager", icon: <Truck className="w-5 h-5" />, href: "/erp/admin/logistics", key: "logistics", section: "Operations" },

    // 2. OFIA ENTERPRISE SUITE
    { label: "CRM and Sales", icon: <BarChart3 className="w-5 h-5" />, href: "/erp/marketer", badge: "Sales", key: "crm", section: "Ofia Enterprise Suite" },
    { label: "Access Control", icon: <ShieldCheck className="w-5 h-5" />, href: "/erp/admin/access-control", badge: "RBAC", key: "access_control", section: "Ofia Enterprise Suite" },
    { label: "Accounting & Ledgers", icon: <Layers className="w-5 h-5" />, href: "/erp/accountant", badge: "GL", key: "accounting", section: "Ofia Enterprise Suite" },
    { label: "HR & Appraisals", icon: <Users className="w-5 h-5" />, href: "/erp/hr", key: "hr", section: "Ofia Enterprise Suite" },

    // 3. PORTALS & WORKSPACES
    { label: "Employee Portal", icon: <UserCheck className="w-5 h-5" />, href: "/erp/employee", key: "employee", section: "Portals & Team" },
    { label: "Manager Portal", icon: <Sliders className="w-5 h-5" />, href: "/erp/manager", key: "manager", section: "Portals & Team" },
    { label: "MD Executive", icon: <TrendingUp className="w-5 h-5" />, href: "/erp/md", key: "md", section: "Portals & Team" },
  ];

  // Automatic sub navigation tabs according to current pathname
  const getSubTabs = (): SubNavItem[] => {
    if (subTabs !== undefined) return subTabs;

    if (pathname.startsWith("/erp/admin/access-control")) {
      return [];
    }

    if (pathname.startsWith("/erp/marketer")) {
      return [
        { label: "CRM Overview", href: "/erp/marketer", icon: <BarChart3 className="w-3.5 h-3.5" /> },
        { label: "Deals Pipeline", href: "/erp/marketer/pipeline", icon: <TrendingUp className="w-3.5 h-3.5" /> },
        { label: "Leads Directory", href: "/erp/marketer/leads", icon: <Users className="w-3.5 h-3.5" /> },
        { label: "Accounts & Clients", href: "/erp/marketer/accounts", icon: <Building2 className="w-3.5 h-3.5" /> },
        { label: "Sales Activities", href: "/erp/marketer/activities", icon: <Calendar className="w-3.5 h-3.5" /> },
      ];
    }

    if (pathname.startsWith("/erp/admin/ai")) {
      return [
        { label: "Command Center", href: "/erp/admin/ai", icon: <Bot className="w-3.5 h-3.5" /> },
        { label: "Campaigns", href: "/erp/admin/ai/campaigns", icon: <Send className="w-3.5 h-3.5" /> },
        { label: "Leads Pipeline", href: "/erp/admin/ai/leads", icon: <Users className="w-3.5 h-3.5" /> },
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
        { label: "Point of Sale (POS)", href: "/erp/admin/shop/pos", icon: <ShoppingCart className="w-3.5 h-3.5" /> },
        { label: "Shift Sessions", href: "/erp/admin/shop/pos/sessions", icon: <Clock className="w-3.5 h-3.5" /> },
        { label: "Digital Receipts", href: "/erp/admin/shop/pos/receipts", icon: <Printer className="w-3.5 h-3.5" /> },
        { label: "Hardware Terminals", href: "/erp/admin/shop/pos/terminals", icon: <Layers className="w-3.5 h-3.5" /> },
        { label: "Stock Overview", href: "/erp/admin/shop/inventory", icon: <Boxes className="w-3.5 h-3.5" /> },
        { label: "Master SKUs", href: "/erp/admin/shop/inventory/items", icon: <Tag className="w-3.5 h-3.5" /> },
        { label: "Warehouses", href: "/erp/admin/shop/inventory/warehouses", icon: <Warehouse className="w-3.5 h-3.5" /> },
        { label: "Suppliers & Vendors", href: "/erp/admin/shop/inventory/suppliers", icon: <Building2 className="w-3.5 h-3.5" /> },
        { label: "Branch Transfers", href: "/erp/admin/shop/inventory/transfers", icon: <Truck className="w-3.5 h-3.5" /> },
        { label: "Stock Adjustments", href: "/erp/admin/shop/inventory/adjustments", icon: <Sliders className="w-3.5 h-3.5" /> },
        { label: "Viral Referrals", href: "/erp/admin/shop/referrals", icon: <Gift className="w-3.5 h-3.5" /> },
        { label: "Affiliates", href: "/erp/admin/shop/referrals/affiliates", icon: <Users className="w-3.5 h-3.5" /> },
        { label: "Campaign Rules", href: "/erp/admin/shop/referrals/campaigns", icon: <Zap className="w-3.5 h-3.5" /> },
        { label: "Payout Batches", href: "/erp/admin/shop/referrals/payouts", icon: <DollarSign className="w-3.5 h-3.5" /> },
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

    return [];
  };

  const activeSubTabs = getSubTabs();

  return (
    <div className="min-h-screen bg-nexa-bg-base text-nexa-text-primary flex relative font-sans">
      {/* SIDEBAR — EXACT OFIA MARKETPLACE VERBATIM STYLING */}
      <aside
        className={cn(
          "bg-nexa-bg-surface border-r border-nexa-border transition-all duration-300 flex flex-col z-50 sticky top-0 h-screen",
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
          {isSidebarOpen ? (
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Ofia ERP Logo" className="w-8 h-8 object-contain shrink-0" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-base font-extrabold text-display leading-tight text-[var(--nexa-text-primary)]">
                    Ofia ERP
                  </span>
                  <span className="text-[10px] font-extrabold font-mono uppercase text-[#1A56DB] bg-[#1A56DB]/10 border border-[#1A56DB]/20 px-2 py-0.5 rounded-full">
                    {tenantName.toUpperCase()}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider mt-0.5">
                  ERP Overview
                </span>
              </div>
            </Link>
          ) : (
            <img src="/logo.png" alt="Ofia ERP Logo" className="w-8 h-8 mx-auto" />
          )}
        </div>

        {/* SEARCH BAR — DIRECTLY UNDER LOGO AND TITLE */}
        <div className="px-4 py-2">
          {isSidebarOpen ? (
            <div className="flex items-center bg-nexa-bg-base px-3.5 py-2 rounded-full border border-nexa-border gap-2.5 w-full focus-within:border-nexa-brand transition-all">
              <Search className="w-3.5 h-3.5 text-nexa-text-faint shrink-0" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs outline-none w-full text-nexa-text-primary placeholder:text-nexa-text-faint font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-nexa-text-faint hover:text-nexa-text-primary cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 mx-auto rounded-full bg-nexa-bg-base border border-nexa-border flex items-center justify-center text-nexa-text-faint hover:text-nexa-brand transition-colors cursor-pointer"
              title="Search ERP modules"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* NAV ITEMS WITH SECTION GROUPINGS */}
        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
          {(() => {
            const filtered = navItems.filter((item) => {
              const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase());
              if (!matchesSearch) return false;

              // The '/erp/admin' Overview page is strictly for the Tenant Administrator
              if (item.key === "overview" || item.href === "/erp/admin") {
                return currentRole === "admin";
              }

              // The role access tab is strictly for the Tenant Administrator on the admin portal
              if (item.key === "access_control") {
                return currentRole === "admin" && pathname.startsWith("/erp/admin");
              }

              // Determine if module is allowed to the tenant by the Super Admin in the database
              const isTenantAllowed = permissionMatrix.admin?.[item.key] !== false;

              // If Super Admin disabled the module for this tenant in MySQL, hide it completely
              if (!isTenantAllowed) {
                return false;
              }

              // Tenant Administrator receives ALL modules allowed to the tenant by default
              if (currentRole === "admin") {
                return true;
              }

              // For subordinate staff roles (md, hr, accountant, marketer, manager, employee, etc.):
              // check if granted in the tenant RBAC matrix
              return Boolean(permissionMatrix[currentRole]?.[item.key]);
            });

            let currentSection = "";

            return filtered.map((item, i) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/erp/admin" && pathname.startsWith(item.href)) ||
                (item.href === "/erp/admin" && pathname === "/erp/admin");

              const showSectionHeader = item.section && item.section !== currentSection;
              if (showSectionHeader) {
                currentSection = item.section;
              }

              return (
                <React.Fragment key={item.key || i}>
                  {showSectionHeader && (
                    <div className={cn("pt-3 pb-1", i === 0 && "pt-0")}>
                      {isSidebarOpen ? (
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-nexa-text-faint px-3 flex items-center gap-1.5">
                          <span>{item.section}</span>
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
                          : "text-nexa-text-faint hover:bg-nexa-bg-base hover:text-nexa-text-primary font-semibold"
                      )}
                    >
                      <div
                        className={cn(
                          "transition-transform group-hover:scale-110",
                          isActive ? "text-white" : "text-nexa-brand"
                        )}
                      >
                        {item.icon}
                      </div>
                      {isSidebarOpen && (
                        <div className="flex-1 flex items-center justify-between text-left">
                          <span className="text-xs">{item.label}</span>
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
          })()}
        </nav>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-nexa-border space-y-2 relative">
          {/* USER PROFILE & NOTIFICATION ROW */}
          <div className="relative" ref={dropdownRef}>
            {isSidebarOpen ? (
              <div className="flex items-center justify-between p-2 rounded-2xl bg-nexa-bg-base/70 border border-nexa-border">
                <div className="flex items-center gap-2.5 min-w-0">
                  <NexaAvatar size="sm" isOnline name={userName || user?.name || tenantName} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-nexa-text-primary truncate">
                      {userName || user?.name || `${tenantName} Staff`}
                    </p>
                    <p
                      className={cn(
                        "text-[9px] font-extrabold uppercase tracking-wider truncate inline-block px-1.5 py-0.5 rounded-full border mt-0.5",
                        getRoleBadgeColor(currentRole)
                      )}
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
                <NexaAvatar size="sm" isOnline name={userName || user?.name || tenantName} />
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
                          <span className="text-[10px] text-nexa-text-faint font-semibold">
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

          <Link href="/tenant/settings">
            <button
              className={cn(
                "w-full flex items-center gap-3.5 p-3 rounded-full transition-all text-nexa-text-faint hover:bg-nexa-bg-base hover:text-nexa-text-primary cursor-pointer",
                pathname === "/tenant/settings" && "bg-nexa-brand text-white shadow-md shadow-nexa-brand/20"
              )}
            >
              <Settings className="w-5 h-5 text-nexa-brand" />
              {isSidebarOpen && <span className="font-bold text-xs">Workspace Settings</span>}
            </button>
          </Link>
          <div className="flex items-center gap-1.5 justify-between">
            <button
              onClick={logout}
              className={cn(
                "flex items-center gap-3.5 p-3 rounded-full text-red-500 hover:bg-red-500/10 transition-all text-left cursor-pointer",
                isSidebarOpen ? "flex-1" : "w-full justify-center"
              )}
              title="Logout"
            >
              <LogOut className="w-5 h-5 shrink-0" />
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
        <div className="p-8 space-y-6 flex-1">
          {/* HEADER TITLE & ACTIONS (IF PROVIDED) */}
          {(title || action) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {title && (
                  <h1 className="text-2xl font-black text-display tracking-tight text-nexa-text-primary">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs text-nexa-text-secondary mt-1 leading-relaxed max-w-3xl">
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
                const isTabActive =
                  pathname === tab.href ||
                  (tab.href !== "/erp/admin" &&
                    tab.href !== "/erp/admin/access-control" &&
                    tab.href !== "/erp/admin/ai" &&
                    tab.href !== "/erp/marketer" &&
                    tab.href !== "/erp/admin/shop" &&
                    tab.href !== "/erp/admin/shop/inventory" &&
                    tab.href !== "/erp/admin/shop/pos" &&
                    tab.href !== "/erp/admin/shop/referrals" &&
                    tab.href !== "/erp/admin/logistics" &&
                    tab.href !== "/erp/admin/marketplace" &&
                    tab.href !== "/erp/accountant" &&
                    tab.href !== "/erp/hr" &&
                    pathname.startsWith(tab.href));
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
        </div>
      </main>

      {/* BOTTOM RIGHT SWITCH TO [ROLE] BUTTON */}
      {(() => {
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
    </div>
  );
}
