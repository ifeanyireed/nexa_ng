"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MarketerPipelineRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/erp/admin/crm/pipeline");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-sm text-[var(--nexa-text-muted)]">
      Redirecting to Deals Pipeline...
    </div>
  );
}
