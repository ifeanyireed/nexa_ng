"use client";

import React, { useState, useEffect } from "react";
import { BusinessShell } from "@/components/business/BusinessShell";
import {
  ERP_ROLES,
  ERP_MODULES,
  RoleKey,
  RoleInfo,
  ErpModuleDef,
  PermissionMatrix,
  DEFAULT_PERMISSION_MATRIX,
  getTenantPermissionMatrix,
  saveTenantPermissionMatrix,
  fetchTenantPermissionMatrix,
  saveTenantPermissionMatrixRemote,
} from "@/lib/access-control";
import {
  ShieldCheck,
  Shield,
  KeyRound,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Users,
  Eye,
  Sliders,
  Check,
  Layers,
  Building2,
  Lock,
  Unlock,
  Info,
  ArrowRight,
  Database,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/nexa/AuthContext";

export default function AccessControlPage() {
  const { user } = useAuth();
  const [tenantName, setTenantName] = useState<string>("EduSuite");
  const [selectedRole, setSelectedRole] = useState<RoleKey>("employee");
  const [matrix, setMatrix] = useState<PermissionMatrix>(DEFAULT_PERMISSION_MATRIX);
  const [isSavedToast, setIsSavedToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("Permissions Synchronized with MySQL");
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Determine active tenant name and look up RBAC matrix from MySQL database on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      let tName = "EduSuite";
      const host = window.location.host.toLowerCase();
      const hostParts = host.split(":")[0].split(".");
      const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
      let sub = "";
      if (isLocal && hostParts.length > 1 && hostParts[0] !== "localhost" && hostParts[0] !== "www") {
        sub = hostParts[0];
      } else if (!isLocal && hostParts.length > 2) {
        sub = hostParts[0];
      }
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

      // Instant local cache render first
      const cached = getTenantPermissionMatrix(tName);
      setMatrix(cached);

      // Look up live tenant RBAC matrix from MySQL database table TenantRolePermission on load
      setIsLoadingDb(true);
      fetchTenantPermissionMatrix(tName)
        .then((remote) => {
          setMatrix(remote);
        })
        .finally(() => {
          setIsLoadingDb(false);
        });
    }
  }, [user]);

  // Handle individual toggle with remote MySQL persistence
  const handleToggleModule = async (moduleKey: string) => {
    const currentStatus = matrix[selectedRole]?.[moduleKey] ?? false;
    const updated: PermissionMatrix = {
      ...matrix,
      [selectedRole]: {
        ...matrix[selectedRole],
        [moduleKey]: !currentStatus,
      },
    };
    setMatrix(updated);
    const res = await saveTenantPermissionMatrixRemote(tenantName, updated);
    triggerSaveToast(res.message || "Permissions Synchronized with MySQL");
  };

  // Bulk actions for selected role with remote MySQL persistence
  const handleGrantAll = async () => {
    const allTrue: Record<string, boolean> = {};
    ERP_MODULES.forEach((m) => {
      allTrue[m.key] = true;
    });
    const updated: PermissionMatrix = {
      ...matrix,
      [selectedRole]: allTrue,
    };
    setMatrix(updated);
    const res = await saveTenantPermissionMatrixRemote(tenantName, updated);
    triggerSaveToast(res.message || "All modules granted & saved to database");
  };

  const handleRevokeAll = async () => {
    const allFalse: Record<string, boolean> = {};
    ERP_MODULES.forEach((m) => {
      allFalse[m.key] = false;
    });
    const updated: PermissionMatrix = {
      ...matrix,
      [selectedRole]: allFalse,
    };
    setMatrix(updated);
    const res = await saveTenantPermissionMatrixRemote(tenantName, updated);
    triggerSaveToast(res.message || "Modules revoked & saved to database");
  };

  const handleResetDefaults = async () => {
    const updated: PermissionMatrix = {
      ...matrix,
      [selectedRole]: { ...DEFAULT_PERMISSION_MATRIX[selectedRole] },
    };
    setMatrix(updated);
    const res = await saveTenantPermissionMatrixRemote(tenantName, updated);
    triggerSaveToast(res.message || "Role defaults reset & saved to database");
  };

  const triggerSaveToast = (msg?: string) => {
    if (msg) setToastMessage(msg);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  const currentRoleInfo = ERP_ROLES.find((r) => r.key === selectedRole) || ERP_ROLES[0];
  const rolePermissions = matrix[selectedRole] || {};
  const activeCount = Object.values(rolePermissions).filter(Boolean).length;

  const categories = ["all", "Core Control", "Operations", "Finance & HR", "Portals & Team"];

  const filteredModules = ERP_MODULES.filter((m) => {
    const matchesCategory = selectedCategory === "all" || m.category === selectedCategory;
    const matchesSearch =
      m.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.key.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <BusinessShell
      title="Tenant Access Control & RBAC Matrix"
      subtitle={`Configure role-based dashboard visibility and module access rules for workspace '${tenantName}'. Looked up directly from MySQL database u721451974_nexa_db.`}
      subTabs={[]}
      action={
        <div className="flex items-center gap-2.5">
          {/* Database Live Telemetry Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A56DB]/10 border border-[#1A56DB]/20 text-[#1A56DB] text-xs font-mono font-bold">
            <Database className="w-3.5 h-3.5 text-[#1A56DB]" />
            <span>MySQL: TenantRolePermission</span>
            {isLoadingDb && <RefreshCw className="w-3 h-3 animate-spin text-[#1A56DB]" />}
          </div>

          {isSavedToast && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{toastMessage}</span>
            </div>
          )}
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-nexa-border bg-nexa-bg-base text-xs font-bold text-nexa-text-primary hover:bg-nexa-border transition-colors cursor-pointer"
            title="Reset this role to system default settings"
          >
            <RotateCcw className="w-3.5 h-3.5 text-nexa-text-faint" />
            Reset Role Defaults
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* STATS CARDS (UNIFORM WITH MISSION CONTROL) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-nexa-bg-surface border border-nexa-border shadow-xs hover:border-nexa-brand/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-nexa-text-faint">
                Active Tenant
              </span>
              <Building2 className="w-4 h-4 text-nexa-brand" />
            </div>
            <div className="text-2xl font-black text-display text-nexa-text-primary mt-2">
              {tenantName}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Multi-Tenant RBAC Active</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-nexa-bg-surface border border-nexa-border shadow-xs hover:border-nexa-brand/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-nexa-text-faint">
                Defined User Roles
              </span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-display text-nexa-text-primary mt-2">
              {ERP_ROLES.length} Personas
            </div>
            <div className="text-[11px] font-bold text-nexa-text-faint mt-1">
              Admin, MD, HR, Finance, Staff, POS
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-nexa-bg-surface border border-nexa-border shadow-xs hover:border-nexa-brand/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-nexa-text-faint">
                Available Modules
              </span>
              <Layers className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-display text-nexa-text-primary mt-2">
              {ERP_MODULES.length} Systems
            </div>
            <div className="text-[11px] font-bold text-nexa-text-faint mt-1">
              IMS, POS, AI, GL, Quests, HR, Portals
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-nexa-bg-surface border border-nexa-border shadow-xs hover:border-nexa-brand/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-nexa-text-faint">
                Role Permissions
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-display text-nexa-text-primary mt-2">
              {activeCount} / {ERP_MODULES.length} Active
            </div>
            <div className="text-[11px] font-bold text-emerald-500 mt-1">
              For {currentRoleInfo.label}
            </div>
          </div>
        </div>

        {/* ROLE PERSONA SELECTOR CARDS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-nexa-brand" />
              <span className="font-extrabold text-sm text-display">Select User Type / Role</span>
            </div>
            <span className="text-xs text-nexa-text-faint font-semibold">
              Click a role to configure which modules appear in their workspace
            </span>
          </div>

          <div className="flex items-stretch gap-3.5 overflow-x-auto pb-3 pt-1 scrollbar-hide snap-x">
            {ERP_ROLES.map((role) => {
              const isSelected = selectedRole === role.key;
              const permissions = matrix[role.key] || {};
              const enabledNum = Object.values(permissions).filter(Boolean).length;

              return (
                <button
                  key={role.key}
                  onClick={() => setSelectedRole(role.key)}
                  className={cn(
                    "w-72 sm:w-80 shrink-0 text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between cursor-pointer snap-start",
                    isSelected
                      ? "border-nexa-brand bg-nexa-brand/5 dark:bg-nexa-brand/10 shadow-md ring-2 ring-nexa-brand/20"
                      : "border-nexa-border bg-nexa-bg-surface hover:bg-nexa-bg-base/60"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${role.color}15`,
                          color: role.color,
                          borderColor: `${role.color}30`,
                        }}
                      >
                        {role.badge}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-nexa-text-faint">
                        {enabledNum}/{ERP_MODULES.length} on
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-nexa-text-primary leading-snug">
                      {role.label}
                    </h3>
                    <p className="text-[11px] text-nexa-text-secondary mt-1 line-clamp-2 leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-nexa-border flex items-center justify-between text-[11px] font-bold">
                    <span className={isSelected ? "text-nexa-brand" : "text-nexa-text-faint"}>
                      {isSelected ? "Currently Editing" : "Click to Configure"}
                    </span>
                    <ArrowRight
                      className={cn(
                        "w-3.5 h-3.5 transition-transform",
                        isSelected ? "text-nexa-brand translate-x-0.5" : "text-nexa-text-faint"
                      )}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ROLE CONFIGURATION PANEL */}
        <div className="p-6 rounded-3xl bg-nexa-bg-surface border border-nexa-border space-y-6 shadow-xs">
          {/* ROLE HEADER BANNER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-nexa-border">
            <div className="flex items-center gap-3.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm shrink-0"
                style={{ backgroundColor: currentRoleInfo.color }}
              >
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-display text-nexa-text-primary">
                    Module Access for: {currentRoleInfo.label}
                  </h2>
                  <span
                    className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: `${currentRoleInfo.color}15`,
                      color: currentRoleInfo.color,
                      borderColor: `${currentRoleInfo.color}30`,
                    }}
                  >
                    {currentRoleInfo.badge}
                  </span>
                </div>
                <p className="text-xs text-nexa-text-secondary mt-0.5">
                  {currentRoleInfo.description}
                </p>
              </div>
            </div>

            {/* QUICK BULK ACTIONS */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={handleGrantAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                Grant All Modules
              </button>
              <button
                onClick={handleRevokeAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                Revoke All
              </button>
            </div>
          </div>

          {/* FILTERS & SEARCH */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 cursor-pointer",
                    selectedCategory === cat
                      ? "bg-nexa-brand text-white shadow-xs"
                      : "bg-nexa-bg-base text-nexa-text-faint hover:text-nexa-text-primary"
                  )}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search modules..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full px-3.5 py-1.5 bg-nexa-bg-base border border-nexa-border rounded-full text-xs outline-none focus:border-nexa-brand text-nexa-text-primary placeholder:text-nexa-text-faint"
              />
            </div>
          </div>

          {/* MODULE TOGGLE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredModules.map((module) => {
              const isEnabled = matrix[selectedRole]?.[module.key] ?? false;

              return (
                <div
                  key={module.key}
                  className={cn(
                    "p-4 rounded-2xl border transition-all flex items-center justify-between gap-4",
                    isEnabled
                      ? "bg-nexa-bg-surface border-nexa-border hover:border-nexa-brand/40 shadow-xs"
                      : "bg-nexa-bg-base/40 border-nexa-border/60 opacity-70"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-nexa-text-primary truncate">
                        {module.label}
                      </span>
                      {module.badge && (
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.2 rounded-full bg-nexa-brand/10 text-nexa-brand border border-nexa-brand/20 shrink-0">
                          {module.badge}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-nexa-text-faint bg-nexa-bg-base px-2 py-0.5 rounded-md border border-nexa-border shrink-0 hidden sm:inline">
                        {module.href}
                      </span>
                    </div>
                    <p className="text-[11px] text-nexa-text-secondary line-clamp-2 leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  {/* TOGGLE SWITCH */}
                  <button
                    type="button"
                    onClick={() => handleToggleModule(module.key)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      isEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    )}
                    role="switch"
                    aria-checked={isEnabled}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                        isEnabled ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {filteredModules.length === 0 && (
            <div className="py-12 text-center text-nexa-text-faint space-y-2">
              <Info className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-sm font-semibold">No modules match your search filter.</p>
              <button
                onClick={() => {
                  setSearchFilter("");
                  setSelectedCategory("all");
                }}
                className="text-xs text-nexa-brand font-bold hover:underline cursor-pointer"
              >
                Clear Search & Category Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </BusinessShell>
  );
}
