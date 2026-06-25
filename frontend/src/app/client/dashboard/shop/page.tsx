"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/nexa/AuthContext";

export default function ClientShopPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    router.replace("/shop");
  }, [router]);

  return (
    <div className="min-h-screen bg-nexa-bg-base flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-nexa-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
