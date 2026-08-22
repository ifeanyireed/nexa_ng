"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/nexa/AuthContext";
import DashboardOverview from "./DashboardOverview";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "PRO" && user.role !== "ADMIN") {
      router.replace("/client/dashboard");
    }
  }, [user, router]);

  return <DashboardOverview />;
}
