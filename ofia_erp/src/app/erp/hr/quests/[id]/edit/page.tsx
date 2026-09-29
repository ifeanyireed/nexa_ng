"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function QuestEditRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const questId = (params?.id as string) || "reignite-2026";

  useEffect(() => {
    router.replace(`/erp/hr/quests/new?edit=${questId}`);
  }, [questId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--nexa-bg-base)] text-xs text-slate-500 font-medium">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
        <span>Loading Quest Editor...</span>
      </div>
    </div>
  );
}
