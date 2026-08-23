"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Cpu,
  CreditCard,
  Plus,
  Printer,
  Radio,
  Sliders,
  Smartphone,
  Wifi,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

const TERMINALS = [
  { id: "TERM-01", name: "Moniepoint Android SmartPOS (Lekki)", type: "SMART_POS", serial: "MP-849204-NG", branch: "Lekki Hub Register 1", status: "ONLINE", battery: "94%", lastSynced: "Just now" },
  { id: "TERM-02", name: "OPay SmartPOS Pro (Ikeja)", type: "SMART_POS", serial: "OP-119284-NG", branch: "Ikeja Depot Register 2", status: "ONLINE", battery: "88%", lastSynced: "2 mins ago" },
  { id: "TERM-03", name: "Epson TM-T88VI Thermal Printer", type: "THERMAL_PRINTER", serial: "EP-559281-USB", branch: "Lekki Hub Register 1", status: "CONNECTED", battery: "AC Power", lastSynced: "Online" },
];

export default function POSTerminalsPage() {
  return (
    <BusinessShell
      title="POS Hardware & Payment Terminals"
      subtitle="Pair Android SmartPOS terminals (Moniepoint, OPay) and network ESC/POS thermal printers."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/shop/pos">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to POS
            </NexaButton>
          </Link>
          <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
            Pair New Terminal
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TERMINALS.map((t) => (
            <NexaCard key={t.id} variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {t.type === "SMART_POS" ? <Smartphone className="w-5 h-5 text-[#0E9F6E]" /> : <Printer className="w-5 h-5 text-[#1A56DB]" />}
                    <span className="font-mono text-xs text-[var(--nexa-text-muted)]">{t.id}</span>
                  </div>
                  <NexaBadge variant="green" dot>{t.status}</NexaBadge>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">{t.name}</h3>
                  <div className="text-xs text-[var(--nexa-text-muted)] font-mono mt-0.5">S/N: {t.serial}</div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--nexa-text-muted)]">Assigned Station:</span>
                    <span className="font-bold text-[var(--nexa-text-primary)]">{t.branch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--nexa-text-muted)]">Battery / Power:</span>
                    <span className="font-bold text-[#0E9F6E]">{t.battery}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-between">
                <span className="text-xs text-[var(--nexa-text-muted)]">Test Print / Ping</span>
                <NexaButton size="sm" variant="outline">
                  Diagnostic Test
                </NexaButton>
              </div>
            </NexaCard>
          ))}
        </div>
      </div>
    </BusinessShell>
  );
}
