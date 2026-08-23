"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileSpreadsheet,
  History,
  Lock,
  Printer,
  User,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

const SHIFT_SESSIONS = [
  { id: "SESS-2026-088", cashier: "Kehinde Adebayo", register: "Register 1 (Lekki Hub)", openingFloat: "₦50,000", cashSales: "₦420,500", cardSales: "₦780,000", transferSales: "₦210,000", totalRevenue: "₦1,410,500", openedAt: "Today, 08:00 AM", closedAt: "Today, 04:00 PM", status: "CLOSED", variance: "₦0 (Balanced)" },
  { id: "SESS-2026-087", cashier: "Fatima Garba", register: "Register 2 (Ikeja Depot)", openingFloat: "₦50,000", cashSales: "₦310,000", cardSales: "₦650,000", transferSales: "₦140,000", totalRevenue: "₦1,100,000", openedAt: "Today, 08:30 AM", closedAt: "In Progress", status: "ACTIVE", variance: "Live" },
];

export default function POSSessionsPage() {
  return (
    <BusinessShell
      title="POS Shift History & Register Drawer (Z-Report)"
      subtitle="Track daily cashier shift floats, cash-drawer reconciliation, and generate end-of-day Z-Reports."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/shop/pos">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to POS
            </NexaButton>
          </Link>
          <NexaButton size="sm" variant="primary" leftIcon={<Printer className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
            Print Daily Z-Report
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-semibold">
              <tr>
                <th className="py-3 px-4">Session ID</th>
                <th className="py-3 px-4">Cashier & Terminal</th>
                <th className="py-3 px-3">Opening Float</th>
                <th className="py-3 px-3">Cash / Card Split</th>
                <th className="py-3 px-3">Total Shift Volume</th>
                <th className="py-3 px-3">Time Range</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Drawer Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
              {SHIFT_SESSIONS.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold font-mono text-[#1A56DB]">{s.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold">{s.cashier}</div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)]">{s.register}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono">{s.openingFloat}</td>
                  <td className="py-3.5 px-3 font-mono text-[11px]">
                    <div>Cash: {s.cashSales}</div>
                    <div>Card: {s.cardSales}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-[#0E9F6E]">{s.totalRevenue}</td>
                  <td className="py-3.5 px-3 text-[11px] text-[var(--nexa-text-secondary)]">
                    <div>{s.openedAt}</div>
                    <div>{s.closedAt}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <NexaBadge variant={s.status === "ACTIVE" ? "green" : "brand"} dot>
                      {s.status}
                    </NexaBadge>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0E9F6E]">{s.variance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BusinessShell>
  );
}
