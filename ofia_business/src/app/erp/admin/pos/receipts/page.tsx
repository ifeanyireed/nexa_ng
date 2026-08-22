"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Download,
  Eye,
  MessageSquare,
  Printer,
  Receipt,
  Search,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";

const RECEIPTS = [
  { id: "REC-9821-2026", customer: "Dangote Energy Ltd", items: "1x Solar Inverter 5kVA, 4x MC4 Connectors", amount: "₦582,500", tender: "CARD (Moniepoint)", cashier: "Kehinde Adebayo", timestamp: "Today, 11:42 AM", status: "PAID" },
  { id: "REC-9820-2026", customer: "Walk-in Cash Customer", items: "2x 4K IP Security Camera", amount: "₦90,000", tender: "CASH", cashier: "Kehinde Adebayo", timestamp: "Today, 10:15 AM", status: "PAID" },
  { id: "REC-9819-2026", customer: "Chukwudi & Sons", items: "1x Cat6 Cable Drum 305m", amount: "₦65,000", tender: "BANK TRANSFER", cashier: "Fatima Garba", timestamp: "Today, 09:30 AM", status: "PAID" },
];

export default function POSReceiptsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <BusinessShell
      title="POS Thermal Receipt Archive"
      subtitle="Search, reprint 58mm/80mm ESC/POS slips, and dispatch instant WhatsApp digital receipts."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/pos">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to POS
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-96">
            <NexaInput
              placeholder="Search receipt #, customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="search"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-semibold">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Customer & Items</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3">Payment Tender</th>
                <th className="py-3 px-3">Cashier</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-4 text-right">Reprint / Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
              {RECEIPTS.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold font-mono text-[#1A56DB]">{r.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold">{r.customer}</div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)]">{r.items}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-[#0E9F6E]">{r.amount}</td>
                  <td className="py-3.5 px-3">
                    <NexaBadge variant="neutral">{r.tender}</NexaBadge>
                  </td>
                  <td className="py-3.5 px-3 text-[var(--nexa-text-secondary)]">{r.cashier}</td>
                  <td className="py-3.5 px-3 text-[var(--nexa-text-muted)]">{r.timestamp}</td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <NexaButton size="sm" variant="ghost" title="Print Thermal Slip">
                      <Printer className="w-3.5 h-3.5 text-[#1A56DB]" />
                    </NexaButton>
                    <NexaButton size="sm" variant="ghost" title="Send WhatsApp Slip">
                      <MessageSquare className="w-3.5 h-3.5 text-[#0E9F6E]" />
                    </NexaButton>
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
