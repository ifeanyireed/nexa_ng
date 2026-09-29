"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Mail,
  Plus,
  Shield,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "TENANT_OWNER" | "ADMIN" | "ACCOUNTANT" | "HR" | "MANAGER" | "EMPLOYEE" | "VIEWER";
  status: "ACTIVE" | "INVITED";
}

const MEMBERS: TeamMember[] = [
  { id: "tm-1", name: "Adeyemi Peters", email: "adeyemi@edusuite.ng", role: "TENANT_OWNER", status: "ACTIVE" },
  { id: "tm-2", name: "Khalil Ibrahim", email: "khalil@edusuite.ng", role: "ADMIN", status: "ACTIVE" },
  { id: "tm-3", name: "Chidinma Okoro", email: "chidinma@edusuite.ng", role: "ACCOUNTANT", status: "ACTIVE" },
  { id: "tm-4", name: "Femi Adebayo", email: "femi@edusuite.ng", role: "HR", status: "ACTIVE" },
];

export default function TenantTeamPage() {
  return (
    <BusinessShell
      title="Team Members & Seat Management"
      subtitle="Invite teammates, allocate available seats (4 / 5 Used), and manage access permissions across ERP portals."
      action={
        <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
          Invite Teammate
        </NexaButton>
      }
    >
      <div className="space-y-6">
        <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-semibold">
              <tr>
                <th className="py-3 px-4">Teammate</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
              {MEMBERS.map((m) => (
                <tr key={m.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold">{m.name}</div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)] font-mono">{m.email}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <NexaBadge
                      variant={
                        m.role === "TENANT_OWNER"
                          ? "brand"
                          : m.role === "ADMIN"
                          ? "purple"
                          : m.role === "ACCOUNTANT"
                          ? "green"
                          : "neutral"
                      }
                      className="text-[9px] font-bold"
                    >
                      {m.role}
                    </NexaBadge>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-[11px] text-[#0E9F6E] font-bold">● {m.status}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {m.role !== "TENANT_OWNER" && (
                      <NexaButton size="sm" variant="ghost" className="text-[#E02424] hover:bg-[#E02424]/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </NexaButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BusinessShell>
  );
}
