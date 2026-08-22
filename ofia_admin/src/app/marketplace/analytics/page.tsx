"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Award,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function MarketplaceAnalyticsPage() {
  const cityData = [
    { city: "Lagos (Lekki, VI, Ikeja)", bookings: "4,820", gmv: "₦26.4M", activePros: "1,840", growth: "+31%" },
    { city: "Abuja (Maitama, Garki, Wuse)", bookings: "1,940", gmv: "₦10.2M", activePros: "820", growth: "+22%" },
    { city: "Port Harcourt (GRA, Trans Amadi)", bookings: "780", gmv: "₦4.1M", activePros: "450", growth: "+18%" },
    { city: "Ibadan & Other States", bookings: "420", gmv: "₦2.1M", activePros: "310", growth: "+14%" },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/marketplace" className="text-xs font-bold text-[#0E9F6E] hover:underline">
                ← Marketplace Admin
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--nexa-text-primary)] flex items-center gap-2.5 mt-1">
              <TrendingUp className="w-6 h-6 text-[#7E3AF2]" />
              City & Geo Analytics Hub
            </h1>
            <p className="text-xs sm:text-sm text-[var(--nexa-text-muted)] mt-1">
              Geographic breakdown of search volume, completed transactions, and pro merchant coverage across Nigeria.
            </p>
          </div>

          <NexaBadge variant="purple">Real-time Telemetry</NexaBadge>
        </div>

        {/* CITY BREAKDOWN TABLE */}
        <NexaCard variant="glass" padding="none" className="overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[var(--nexa-border)]">
            <h3 className="font-extrabold text-sm sm:text-base text-[var(--nexa-text-primary)]">
              State & City Performance
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">City Hub</th>
                  <th className="py-3 px-4">Monthly Bookings</th>
                  <th className="py-3 px-4">Realized GMV</th>
                  <th className="py-3 px-4">Active Pros</th>
                  <th className="py-3 px-4 text-right">MoM Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] font-medium">
                {cityData.map((row) => (
                  <tr key={row.city} className="hover:bg-[var(--nexa-bg-surface)]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#1A56DB]" />
                      {row.city}
                    </td>
                    <td className="py-3.5 px-4 font-mono">{row.bookings}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0E9F6E]">{row.gmv}</td>
                    <td className="py-3.5 px-4">{row.activePros} pros</td>
                    <td className="py-3.5 px-4 font-bold text-[#0E9F6E] text-right">{row.growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NexaCard>
      </div>
    </AdminShell>
  );
}
