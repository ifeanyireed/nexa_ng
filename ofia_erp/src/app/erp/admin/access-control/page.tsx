"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AccessControlPage() {
  const router = useRouter();

  useEffect(() => {
    // Role-based access control is now governed automatically by workspace provisioning
    // and dedicated role portals (Employee, Line Manager, MD, and Admin Console).
    router.replace("/erp/admin");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-700">
      <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <Loader2 className="w-5 h-5 animate-spin text-[#1A56DB]" />
        <span className="text-sm font-semibold">
          Redirecting to Workspace Console...
        </span>
      </div>
    </div>
  );
}
