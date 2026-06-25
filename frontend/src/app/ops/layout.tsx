"use client";

import React from "react";
import { OpsSidebar, OpsHeader } from "@/components/nexa/OpsNav";
import { RoleGuard } from "@/components/nexa/RoleGuard";

export default function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["ADMIN", "OPS"]}>
      <div className="min-h-screen bg-[#020617] flex selection:bg-blue-500 selection:text-white">
        <OpsSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <OpsHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  </RoleGuard>
  );
}
