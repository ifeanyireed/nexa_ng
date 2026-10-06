"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MarketerActivitiesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/erp/admin/crm/activities");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-sm text-[var(--nexa-text-muted)]">
      Redirecting to Sales Activities...
    </div>
  );
}
