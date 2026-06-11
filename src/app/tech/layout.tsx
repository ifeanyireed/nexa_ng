"use client";

import React from "react";
import { TechNavbar, TechBottomNav } from "@/components/nexa/TechNav";
import { usePathname } from "next/navigation";

export default function TechLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isOnboarding = pathname === "/tech/onboarding";

  return (
    <div className="min-h-screen bg-nexa-bg-base font-sans selection:bg-nexa-accent selection:text-white">
      {!isOnboarding && <TechNavbar />}
      
      <main className={isOnboarding ? "min-h-screen" : "pt-16 pb-24"}>
        {children}
      </main>

      {!isOnboarding && <TechBottomNav />}
    </div>
  );
}
