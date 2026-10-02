"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(`/erp/admin/departments${qs ? `?${qs}` : ""}`);
  }, [router, searchParams]);

  return null;
}

export default function RedirectToDepartments() {
  return (
    <Suspense fallback={null}>
      <RedirectContent />
    </Suspense>
  );
}
