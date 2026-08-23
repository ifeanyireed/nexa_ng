"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ErpTenantsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tenants");
  }, [router]);

  return (
    <div className="p-8 text-xs font-mono text-[var(--nexa-text-muted)]">
      Redirecting to Tenant Management...
    </div>
  );
}
