"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";
import { detectTenantVertical, VERTICAL_DEFINITIONS, VerticalKey } from "@/lib/verticals";
import { Loader2 } from "lucide-react";

export default function CatalogRedirectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeTenant, isLoading } = useActiveTenant(user?.email);

  useEffect(() => {
    if (isLoading) return;
    const rawVertical =
      (activeTenant?.vertical as string) ||
      detectTenantVertical(activeTenant?.slug, activeTenant?.name) ||
      "fashion";
    const verticalKey: VerticalKey =
      rawVertical in VERTICAL_DEFINITIONS ? (rawVertical as VerticalKey) : "fashion";

    if (typeof document !== "undefined") {
      document.cookie = `nexa_tenant_vertical=${verticalKey}; path=/; max-age=2592000; SameSite=Lax`;
    }

    router.replace(`/erp/admin/shop/${verticalKey}/catalog`);
  }, [activeTenant, isLoading, router]);

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
      <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">
        Navigating to your vertical catalog...
      </h3>
      <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
        Unspecialized shop routes are restricted. Redirecting to your vertical workspace.
      </p>
    </div>
  );
}
