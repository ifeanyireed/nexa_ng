"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function OpsDispatchRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search;
      router.replace(`/erp/admin/dispatch${search || "?tab=queue"}`);
    }
  }, [router]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-nexa-bg-base text-nexa-text-secondary text-sm">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      <p>Redirecting to Ofia Dispatch Command & Operations...</p>
    </div>
  );
}
