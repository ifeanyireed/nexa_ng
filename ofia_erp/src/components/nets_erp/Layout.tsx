"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useERPStore, Role, User } from "@/lib/erp-store";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "./LoadingScreen";
import { IconBuildingBank } from "@tabler/icons-react";

// Custom SVG Icons
const DashboardIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

const FileTextIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CycleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const BarChartIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="22" x2="9" y2="16" />
    <line x1="9" y1="16" x2="15" y2="16" />
    <line x1="15" y1="16" x2="15" y2="22" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="8" x2="15" y2="8" />
  </svg>
);

const FinanceIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const BankIcon = () => (
  <IconBuildingBank className="w-5 h-5" />
);

const BoxIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const TransactionsIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <path d="M6 21h12" />
    <path d="M12 17v4" />
  </svg>
);

const PaymentIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const CollapseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ExpandIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

interface SidebarItem {
  name: string;
  route: string;
  icon: React.ReactNode;
}

export default function ERPLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { users, isLoading } = useERPStore();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sync collapsed state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("erp_sidebar_collapsed");
      setIsCollapsed(stored === "true");
    }
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("erp_sidebar_collapsed", String(next));
  };

  const dbUser = currentUser ? users.find(u => u.id === currentUser.id) : null;
  const originalRole = dbUser?.role || (currentUser?.id === "260326" ? "hr" : currentUser?.id === "MD001" ? "md" : null);
  const canSwitchRole = originalRole === "hr" || originalRole === "md" || originalRole === "admin" || originalRole === "manager" || originalRole === "accountant";

  const toggleRoleView = () => {
    if (!currentUser || !originalRole) return;
    let targetRole = "";
    if (originalRole === "admin") {
      targetRole = currentUser.role === "admin" ? "hr" : "admin";
    } else if (originalRole === "md") {
      targetRole = currentUser.role === "md" ? "manager" : "md";
    } else if (originalRole === "hr") {
      if (currentUser.role === "hr") {
        targetRole = "manager";
      } else if (currentUser.role === "manager") {
        targetRole = "employee";
      } else {
        targetRole = "hr";
      }
    } else if (originalRole === "manager") {
      targetRole = currentUser.role === "manager" ? "employee" : "manager";
    } else if (originalRole === "accountant") {
      targetRole = currentUser.role === "accountant" ? "employee" : "accountant";
    } else {
      targetRole = "employee";
    }
    const updatedUser = { ...currentUser, role: targetRole as Role };
    setCurrentUser(updatedUser);
    localStorage.setItem("erp_current_user", JSON.stringify(updatedUser));
    router.push(`/${targetRole}`);
  };

  const getSwitchLabel = () => {
    if (!currentUser || !originalRole) return "";
    if (originalRole === "admin") {
      if (currentUser.role === "admin") return "Switch to HR View";
      return "Switch to Admin View";
    }
    if (originalRole === "hr") {
      if (currentUser.role === "hr") return "Switch to Manager View";
      if (currentUser.role === "manager") return "Switch to Employee View";
      return "Switch to HR View";
    }
    if (originalRole === "md") {
      if (currentUser.role === "md") return "Switch to Manager View";
      return "Switch to MD View";
    }
    if (originalRole === "manager") {
      if (currentUser.role === "manager") return "Switch to Employee View";
      return "Switch to Manager View";
    }
    if (originalRole === "accountant") {
      if (currentUser.role === "accountant") return "Switch to Employee View";
      return "Switch to Accountant View";
    }
    return "Switch View";
  };

  // Sync current user from local storage or set default employee
  useEffect(() => {
    if (users.length > 0) {
      const stored = localStorage.getItem("erp_current_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const found = users.find(u => u.id === parsed.id);
          if (found) {
            setCurrentUser({ ...found, role: parsed.role });
            return;
          }
        } catch {}
      }
      // Fallback default is Jane Doe (Employee)
      const defaultUser = users.find(u => u.id === "EMP001") || users[0];
      setCurrentUser(defaultUser);
      localStorage.setItem("erp_current_user", JSON.stringify(defaultUser));
    }
  }, [users]);

  // Enforce Role-Based Access Control (RBAC) client-side
  useEffect(() => {
    if (currentUser) {
      const role = currentUser.role;
      if (pathname.startsWith("/hr") && role !== "hr") {
        router.push(`/${role}`);
      } else if (pathname.startsWith("/manager") && role !== "manager") {
        router.push(`/${role}`);
      } else if (pathname.startsWith("/md") && role !== "md") {
        router.push(`/${role}`);
      } else if (pathname.startsWith("/admin") && role !== "admin") {
        router.push(`/${role}`);
      } else if (pathname.startsWith("/accountant") && role !== "accountant") {
        router.push(`/${role}`);
      }
    }
  }, [currentUser, pathname, router]);

  // Determine sidebar menu items based on role
  const getSidebarItems = (): SidebarItem[] => {
    if (!currentUser) return [];

    switch (currentUser.role) {
      case "employee":
        return [
          { name: "Dashboard", route: "/employee", icon: <DashboardIcon /> },
          { name: "My Reviews", route: "/employee/reviews", icon: <FileTextIcon /> },
          { name: "My Profile", route: "/employee/profile", icon: <UserIcon /> },
        ];
      case "manager":
        return [
          { name: "Team Dashboard", route: "/manager", icon: <DashboardIcon /> },
          { name: "Employee Profile", route: "/employee/profile", icon: <UserIcon /> },
        ];
      case "hr":
        return [
          { name: "HR Dashboard", route: "/hr", icon: <DashboardIcon /> },
          { name: "Reports", route: "/hr/reports", icon: <BarChartIcon /> },
          { name: "Cycles", route: "/hr/cycle", icon: <CycleIcon /> },
          { name: "Objectives", route: "/hr/objectives", icon: <FileTextIcon /> },
          { name: "Users & Roles", route: "/hr/users", icon: <UsersIcon /> },
        ];
      case "md":
        return [
          { name: "MD Dashboard", route: "/md", icon: <BarChartIcon /> },
          { name: "Department Details", route: "/md/department/detail?deptId=Fleet", icon: <BuildingIcon /> },
        ];
      case "admin":
        return [
          { name: "Admin Dashboard", route: "/admin", icon: <DashboardIcon /> },
        ];
      case "accountant":
        return [
          { name: "Finance Dashboard", route: "/accountant", icon: <FinanceIcon /> },
          { name: "Transactions", route: "/accountant/journal-entries", icon: <TransactionsIcon /> },
          { name: "Clients", route: "/accountant/clients", icon: <UsersIcon /> },
          { name: "Banking", route: "/accountant/bank-accounts", icon: <BankIcon /> },
          { name: "Inventory", route: "/accountant/products", icon: <BoxIcon /> },
          { name: "Reports", route: "/accountant/finance-reports", icon: <BarChartIcon /> },
          { name: "Payment", route: "/accountant/payment-processing", icon: <PaymentIcon /> },
        ];
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems();

  if (!currentUser) {
    return <LoadingScreen message="Authenticating session..." />;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#1E293B] font-sans antialiased flex flex-col md:flex-row w-full relative">
      
      {/* MOBILE TOP BAR */}
      <div className="flex md:hidden items-center justify-between bg-white border-b border-[#E2E5E9] px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/nets.webp" alt="Nets Logo" className="h-8 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-3">
          {canSwitchRole && originalRole && (
            <button
              onClick={toggleRoleView}
              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
              title={getSwitchLabel()}
            >
              <RefreshIcon />
            </button>
          )}
          
          <div className="w-[1px] h-5 bg-gray-200 mx-0.5" />
          
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover border border-gray-100"
          />

          <button
            onClick={() => {
              localStorage.removeItem("erp_current_user");
              router.push("/");
            }}
            className="p-1.5 text-slate-450 hover:text-red-650 hover:bg-red-50 rounded-xl transition-all duration-300 cursor-pointer"
            title="Logout"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>

      {/* SIDEBAR (Desktop Only) */}
      <aside className={`hidden md:flex ${isCollapsed ? "md:w-20 px-3" : "md:w-64 p-6"} bg-[#EAECEF]/60 border-r border-[#D2D5DA] py-6 flex-col justify-between shrink-0 transition-all duration-300`}>
        
        <div>
          {/* Logo & Toggle Button */}
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-6 mb-8">
              <img src="/favicon.png" alt="Nets Icon" className="h-8 w-8 object-contain" />
              <button 
                onClick={toggleCollapse}
                className="p-1.5 hover:bg-white/55 hover:text-slate-850 text-slate-500 rounded-lg transition-all duration-200 cursor-pointer shadow-sm border border-slate-200 bg-white"
                title="Expand Sidebar"
              >
                <ExpandIcon />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-8 px-1">
              <img src="/nets.webp" alt="Nets Logo" className="h-10 w-auto object-contain" />
              <button 
                onClick={toggleCollapse}
                className="p-1.5 hover:bg-white/55 hover:text-slate-850 text-slate-500 rounded-lg transition-all duration-200 cursor-pointer shadow-sm border border-slate-200 bg-white"
                title="Collapse Sidebar"
              >
                <CollapseIcon />
              </button>
            </div>
          )}

          {/* Menu Items */}
          <nav className="space-y-1.5">
            {sidebarItems.map((item) => {
              const isDashboard = ["/employee", "/manager", "/hr", "/md", "/admin", "/accountant"].includes(item.route);
              const otherItemMatches = sidebarItems
                .filter(sibling => sibling.route !== item.route && !["/employee", "/manager", "/hr", "/md", "/admin", "/accountant"].includes(sibling.route))
                .some(sibling => pathname === sibling.route || pathname.startsWith(sibling.route.split("?")[0] + "/"));

              const isActive = isDashboard 
                ? (pathname === item.route || (!otherItemMatches && pathname.startsWith(item.route)))
                : (pathname === item.route.split("?")[0] || 
                   pathname.startsWith(item.route.split("?")[0] + "/") ||
                   (item.route === "/accountant/clients" && (
                     pathname.startsWith("/accountant/vendors") || 
                     pathname.startsWith("/accountant/bills") || 
                     pathname.startsWith("/accountant/debit-notes") ||
                     pathname.startsWith("/accountant/proposals") ||
                     pathname.startsWith("/accountant/retainers") ||
                     pathname.startsWith("/accountant/estimates") ||
                     pathname.startsWith("/accountant/orders") ||
                     pathname.startsWith("/accountant/invoices") ||
                     pathname.startsWith("/accountant/payments") ||
                     pathname.startsWith("/accountant/credit-notes")
                   )) ||
                   (item.route === "/accountant/journal-entries" && (
                     pathname.startsWith("/accountant/recurring-journals") ||
                     pathname.startsWith("/accountant/reconcile") ||
                     pathname.startsWith("/accountant/budget-planner") ||
                     pathname.startsWith("/accountant/period-close") ||
                     pathname.startsWith("/accountant/audit-trail")
                   )) ||
                   (item.route === "/accountant/finance-reports" && (
                     pathname.startsWith("/accountant/ledger-summary") ||
                     pathname.startsWith("/accountant/trial-balance") ||
                     pathname.startsWith("/accountant/financial-position") ||
                     pathname.startsWith("/accountant/aged-receivables") ||
                     pathname.startsWith("/accountant/aged-payables")
                   )) ||
                   (item.route === "/accountant/payment-processing" && (
                     pathname.startsWith("/accountant/expenses") ||
                     pathname.startsWith("/accountant/payment-payroll") ||
                     pathname.startsWith("/accountant/payroll-payment-processing") ||
                     pathname.startsWith("/accountant/statutory-remittances") ||
                     pathname.startsWith("/accountant/employee-salaries") ||
                     pathname.startsWith("/accountant/email-notification-recipients")
                   )) ||
                   (item.route === "/accountant/bank-accounts" && pathname.startsWith("/accountant/banking")) ||
                   (item.route === "/accountant/products" && pathname.startsWith("/accountant/product-stock")));
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.route)}
                  className={`relative w-full flex items-center ${isCollapsed ? "justify-center px-1" : "gap-3.5 px-3.5"} py-2.5 rounded-xl text-[14px] font-semibold tracking-wide transition-all duration-300 ${
                    isActive
                      ? "text-blue-600 font-bold"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActiveBg"
                      className="absolute inset-0 bg-white rounded-xl z-0 border border-slate-100/50 shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? "text-blue-600" : "text-slate-450"}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="relative z-10">
                      {item.name}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="my-6 border-t border-[#D2D5DA]" />

          {/* Common System Menu */}
          <nav className="space-y-1.5">
            <button
              onClick={() => {
                localStorage.removeItem("erp_current_user");
                router.push("/");
              }}
              className={`w-full flex items-center ${isCollapsed ? "justify-center px-1" : "gap-3.5 px-3.5"} py-2.5 rounded-xl text-[14px] font-semibold tracking-wide text-slate-500 hover:text-slate-800 hover:bg-white/40 transition-all duration-300`}
              title={isCollapsed ? "Logout" : undefined}
            >
              <span className="text-slate-450"><LogoutIcon /></span>
              {!isCollapsed && "Logout"}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className={`hidden md:block text-[#A0AEC0] font-semibold mt-auto transition-all duration-300 text-center ${isCollapsed ? "text-[10px]" : "px-2 text-[11px]"}`}>
          {isCollapsed ? "NETS" : "© 2026 NETS System"}
        </div>

      </aside>

      {/* MAIN BODY AREA */}
      <main className="flex-1 p-6 md:p-8 pb-18 md:pb-8 overflow-y-auto flex flex-col gap-6 bg-[#F3F4F6]/90 relative">
        
        {/* TOP BAR / HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-extrabold">Performance Module</span>
            <h1 className="text-xl font-extrabold text-slate-850 capitalize">{currentUser.role} Dashboard</h1>
          </div>

          {/* User Profile Info (Desktop Only) */}
          <div className="hidden md:flex items-center gap-3">
            {canSwitchRole && originalRole && (
              <button
                onClick={toggleRoleView}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all duration-300 active:scale-95 cursor-pointer"
              >
                <RefreshIcon />
                {getSwitchLabel()}
              </button>
            )}

            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400 font-semibold">Logged in as</p>
              <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
            </div>

            <div className="flex items-center gap-2.5 px-3.5 py-2 bg-white border border-[#E2E5E9] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-gray-100"
              />
              <span className="text-[12px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                {currentUser.role}
              </span>
            </div>
          </div>
        </header>

        {/* MAIN PAGE CONTENT WRAPPER */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>
      {/* MOBILE BOTTOM NAVIGATION */}
      <nav 
        className="md:hidden fixed bottom-2 left-3 right-3 bg-white/[0.001] backdrop-blur-[2px] border rounded-2xl px-3 py-2 flex justify-around items-center z-50 shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.85),_0_8px_32px_rgba(0,0,0,0.06)]"
        style={{
          borderTopColor: "rgba(255,255,255,0.85)",
          borderLeftColor: "rgba(255,255,255,0.7)",
          borderBottomColor: "rgba(255,255,255,0.1)",
          borderRightColor: "rgba(255,255,255,0.1)",
        }}
      >
        {sidebarItems.map((item) => {
          const isDashboard = ["/employee", "/manager", "/hr", "/md", "/admin", "/accountant"].includes(item.route);
          
          // Check if any other sibling tab matches the current path to avoid overlapping activation
          const otherItemMatches = sidebarItems
            .filter(sibling => sibling.route !== item.route && !["/employee", "/manager", "/hr", "/md", "/admin", "/accountant"].includes(sibling.route))
            .some(sibling => pathname === sibling.route || pathname.startsWith(sibling.route.split("?")[0] + "/"));

          const isActive = isDashboard 
            ? (pathname === item.route || (!otherItemMatches && pathname.startsWith(item.route)))
            : (pathname === item.route.split("?")[0] || 
               pathname.startsWith(item.route.split("?")[0] + "/") ||
               (item.route === "/accountant/clients" && (
                 pathname.startsWith("/accountant/vendors") || 
                 pathname.startsWith("/accountant/bills") || 
                 pathname.startsWith("/accountant/debit-notes") ||
                 pathname.startsWith("/accountant/proposals") ||
                 pathname.startsWith("/accountant/retainers") ||
                 pathname.startsWith("/accountant/estimates") ||
                 pathname.startsWith("/accountant/orders") ||
                 pathname.startsWith("/accountant/invoices") ||
                 pathname.startsWith("/accountant/payments") ||
                 pathname.startsWith("/accountant/credit-notes")
               )) ||
               (item.route === "/accountant/journal-entries" && (
                 pathname.startsWith("/accountant/recurring-journals") ||
                 pathname.startsWith("/accountant/reconcile") ||
                 pathname.startsWith("/accountant/budget-planner") ||
                 pathname.startsWith("/accountant/period-close") ||
                 pathname.startsWith("/accountant/audit-trail")
               )) ||
               (item.route === "/accountant/finance-reports" && (
                 pathname.startsWith("/accountant/ledger-summary") ||
                 pathname.startsWith("/accountant/trial-balance") ||
                 pathname.startsWith("/accountant/financial-position") ||
                 pathname.startsWith("/accountant/aged-receivables") ||
                 pathname.startsWith("/accountant/aged-payables")
               )) ||
               (item.route === "/accountant/payment-processing" && (
                 pathname.startsWith("/accountant/expenses") ||
                 pathname.startsWith("/accountant/payment-payroll") ||
                 pathname.startsWith("/accountant/payroll-payment-processing") ||
                 pathname.startsWith("/accountant/statutory-remittances") ||
                 pathname.startsWith("/accountant/employee-salaries") ||
                 pathname.startsWith("/accountant/email-notification-recipients")
               )) ||
               (item.route === "/accountant/bank-accounts" && pathname.startsWith("/accountant/banking")) ||
               (item.route === "/accountant/products" && pathname.startsWith("/accountant/product-stock")));
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.route)}
              className={`flex flex-col items-center justify-center flex-1 py-2 relative transition-all duration-300 ${
                isActive ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <span className={`w-5 h-5 mb-0.5 flex items-center justify-center transition-all duration-300 ${
                isActive ? "text-blue-600 drop-shadow-[0_0_8px_rgba(37,99,235,0.65)]" : "text-slate-600"
              }`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-bold tracking-tight transition-colors duration-300 ${isActive ? "text-blue-600" : "text-slate-600"}`}>{item.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
