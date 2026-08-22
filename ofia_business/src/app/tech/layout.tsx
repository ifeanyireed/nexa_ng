"use client";

import React from "react";
import { TechNavbar, TechBottomNav } from "@/components/nexa/TechNav";
import { usePathname } from "next/navigation";
import { RoleGuard } from "@/components/nexa/RoleGuard";

export default function TechLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["TECHNICIAN"]}>
      <div className="min-h-screen bg-nexa-bg-base font-sans selection:bg-nexa-accent selection:text-white">
        <TechNavbar />
        
        <main className="pt-16 pb-24">
          {children}
        </main>

        <TechBottomNav />
      </div>
    </RoleGuard>
  );
}
