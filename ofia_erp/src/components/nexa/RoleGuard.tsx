"use client";

import { useAuth } from "@/components/nexa/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function RoleGuard({ 
  children, 
  allowedRoles,
  fallbackRoute = "/login"
}: { 
  children: React.ReactNode; 
  allowedRoles: string[];
  fallbackRoute?: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(fallbackRoute);
      } else if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === "ADMIN" || user.role === "OPS") router.push("/ops/assignments");
        else if (user.role === "TECHNICIAN") router.push("/tech/dashboard");
        else router.push("/dashboard");
      }
    }
  }, [user, loading, allowedRoles, router, fallbackRoute]);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-nexa-bg-base text-nexa-text-secondary font-bold">Verifying Access...</div>;

  if (!user || !allowedRoles.includes(user.role)) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
