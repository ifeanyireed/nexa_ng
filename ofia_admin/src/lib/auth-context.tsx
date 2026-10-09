"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  SuperAdminUser,
  AdminRole,
  RolePermissions,
  getPermissionsForRole,
  ROLE_PERMISSIONS,
} from "./jwt-auth";

interface AdminAuthContextType {
  user: SuperAdminUser | null;
  role: AdminRole | null;
  permissions: RolePermissions;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const defaultPermissions: RolePermissions = ROLE_PERMISSIONS.VIEWER;

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  role: null,
  permissions: defaultPermissions,
  isLoading: true,
  isAuthenticated: false,
  logout: async () => {},
  refreshSession: async () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SuperAdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    // 1. Check cached session for instant UX
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("ofia_superadmin_user");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (
            parsed.id === "admin-root-01" ||
            parsed.name?.toLowerCase().includes("adeyemi") ||
            parsed.email?.toLowerCase().includes("adeyemi") ||
            parsed.email?.toLowerCase().includes("superadmin@ofia.ng")
          ) {
            parsed.name = "Grace Jude";
            parsed.email = "grace.jude@ofia.ng";
            sessionStorage.setItem("ofia_superadmin_user", JSON.stringify(parsed));
          }
          setUser(parsed);
        } catch {}
      }
    }

    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const isTargetAdmin =
            data.user.id === "admin-root-01" ||
            data.user.name?.toLowerCase().includes("adeyemi") ||
            data.user.email?.toLowerCase().includes("adeyemi") ||
            data.user.email?.toLowerCase().includes("superadmin@ofia.ng");
          const sanitizedUser = {
            ...data.user,
            name: isTargetAdmin ? "Grace Jude" : data.user.name,
            email: isTargetAdmin ? "grace.jude@ofia.ng" : data.user.email,
          };
          setUser(sanitizedUser);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("ofia_superadmin_user", JSON.stringify(sanitizedUser));
          }
          setIsLoading(false);
          return;
        }
      }

      // If response is not ok or no user
      setUser(null);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("ofia_superadmin_user");
      }

      if (pathname !== "/login") {
        router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      }
    } catch {
      setUser(null);
      if (pathname !== "/login") {
        router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("ofia_superadmin_user");
    }
    window.location.href = "/login";
  };

  const role = user?.role || null;
  const permissions = role ? getPermissionsForRole(role) : defaultPermissions;

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        role,
        permissions,
        isLoading,
        isAuthenticated: !!user,
        logout,
        refreshSession: fetchSession,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
