"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Award,
  AlertOctagon,
  Layers,
  TrendingUp,
  Store,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Filter,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function MarketplaceAdminOverviewPage() {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "verified">("all");

  const recentPros = [
    { id: "pro-101", business: "Lekki Power & Solar Co.", owner: "Tunde Bakare", category: "Solar Installation", city: "Lagos", rating: 4.9, gmv: "₦4.8M", verified: true, date: "2 hrs ago" },
    { id: "pro-102", business: "Prime Plumbing Services", owner: "Emeka Okafor", category: "Plumbing", city: "Abuja", rating: 4.7, gmv: "₦1.9M", verified: false, date: "5 hrs ago" },
    { id: "pro-103", business: "CleanPro Industrial Cleaning", owner: "Fatima Bello", category: "Commercial Cleaning", city: "Port Harcourt", rating: 4.8, gmv: "₦2.4M", verified: true, date: "Yesterday" },
    { id: "pro-104", business: "Apex HVAC & Cold Chain", owner: "Chukwudi Nnamdi", category: "AC & Refrigeration", city: "Lagos", rating: 4.6, gmv: "₦3.1M", verified: false, date: "2 days ago" },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--nexa-text-primary)] flex items-center gap-2.5">
              <ShoppingBag className="w-6 h-6 text-[#0E9F6E]" />
              Ofia Marketplace Admin
            </h1>
            <p className="text-xs sm:text-sm text-[var(--nexa-text-muted)] mt-1">
              Superadmin oversight for 99+ Nigerian niche directories, merchant verification, and Paystack escrow pipelines.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/marketplace/pros">
              <NexaButton size="sm" variant="primary" className="bg-[#0E9F6E] hover:bg-[#0B855B] text-white">
                Review Pending Pros (12)
              </NexaButton>
            </Link>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NexaCard variant="glass" padding="md" className="space-y-1">
            <span className="text-xs font-bold text-[var(--nexa-text-muted)] uppercase">Gross Marketplace Volume</span>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] flex items-center justify-between">
              <span>₦42,850,000</span>
              <span className="text-xs font-bold text-[#0E9F6E] flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> +24%</span>
            </div>
            <p className="text-[11px] text-[var(--nexa-text-muted)]">Past 30 days completed bookings</p>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-1">
            <span className="text-xs font-bold text-[var(--nexa-text-muted)] uppercase">Verified Pro Merchants</span>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] flex items-center justify-between">
              <span>3,420</span>
              <NexaBadge variant="brand">99.1% active</NexaBadge>
            </div>
            <p className="text-[11px] text-[var(--nexa-text-muted)]">Across 36 states + FCT</p>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-1">
            <span className="text-xs font-bold text-[var(--nexa-text-muted)] uppercase">Escrow Held</span>
            <div className="text-2xl font-black text-[#1A56DB] flex items-center justify-between">
              <span>₦3,240,000</span>
              <NexaBadge variant="purple">Protected</NexaBadge>
            </div>
            <p className="text-[11px] text-[var(--nexa-text-muted)]">Awaiting client completion code</p>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-1">
            <span className="text-xs font-bold text-[var(--nexa-text-muted)] uppercase">Platform Commissions</span>
            <div className="text-2xl font-black text-[#0E9F6E] flex items-center justify-between">
              <span>₦4,285,000</span>
              <span className="text-xs font-bold text-[#0E9F6E]">10% avg</span>
            </div>
            <p className="text-[11px] text-[var(--nexa-text-muted)]">Realized net revenue</p>
          </NexaCard>
        </div>

        {/* QUICK NAVIGATION TILES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          <Link href="/marketplace/pros" className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-[#0E9F6E]/50 transition-all space-y-2 group">
            <div className="flex items-center justify-between">
              <Award className="w-5 h-5 text-[#0E9F6E]" />
              <NexaBadge variant="cyan">12 Pending</NexaBadge>
            </div>
            <h4 className="font-bold text-sm text-[var(--nexa-text-primary)] group-hover:text-[#0E9F6E] transition-colors">
              Pro Vetting & Badges
            </h4>
            <p className="text-xs text-[var(--nexa-text-muted)]">
              Verify CAC certificates, national IDs, and issue Nexa Verified badges.
            </p>
          </Link>

          <Link href="/marketplace/categories" className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-[#0E9F6E]/50 transition-all space-y-2 group">
            <div className="flex items-center justify-between">
              <Layers className="w-5 h-5 text-[#1A56DB]" />
              <NexaBadge variant="brand">99+ Niches</NexaBadge>
            </div>
            <h4 className="font-bold text-sm text-[var(--nexa-text-primary)] group-hover:text-[#1A56DB] transition-colors">
              Niches & Commissions
            </h4>
            <p className="text-xs text-[var(--nexa-text-muted)]">
              Manage category taxonomy, commission percentages, and SEO slugs.
            </p>
          </Link>

          <Link href="/marketplace/disputes" className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-[#0E9F6E]/50 transition-all space-y-2 group">
            <div className="flex items-center justify-between">
              <AlertOctagon className="w-5 h-5 text-[#E02424]" />
              <NexaBadge variant="danger">2 Active</NexaBadge>
            </div>
            <h4 className="font-bold text-sm text-[var(--nexa-text-primary)] group-hover:text-[#E02424] transition-colors">
              Escrow Disputes
            </h4>
            <p className="text-xs text-[var(--nexa-text-muted)]">
              Arbitrate job disputes between clients and merchants before payout.
            </p>
          </Link>

          <Link href="/marketplace/analytics" className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-[#0E9F6E]/50 transition-all space-y-2 group">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-5 h-5 text-[#7E3AF2]" />
              <NexaBadge variant="purple">Live Heatmaps</NexaBadge>
            </div>
            <h4 className="font-bold text-sm text-[var(--nexa-text-primary)] group-hover:text-[#7E3AF2] transition-colors">
              City & Geo Analytics
            </h4>
            <p className="text-xs text-[var(--nexa-text-muted)]">
              State-by-state booking density, average ticket size, and pro coverage.
            </p>
          </Link>
        </div>

        {/* RECENT MERCHANTS TABLE */}
        <NexaCard variant="glass" padding="none" className="overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[var(--nexa-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[var(--nexa-text-primary)]">
                Recent Merchant & Pro Registrations
              </h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Live feed of pros onboarding into the 99+ niche network.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/marketplace/pros" className="text-xs font-bold text-[#0E9F6E] hover:underline">
                View All 3,420 Pros →
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Business & Owner</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Total GMV</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] font-medium">
                {recentPros.map((pro) => (
                  <tr key={pro.id} className="hover:bg-[var(--nexa-bg-surface)]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[var(--nexa-text-primary)]">{pro.business}</div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)]">{pro.owner} • {pro.date}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--nexa-text-secondary)]">{pro.category}</td>
                    <td className="py-3.5 px-4 text-[var(--nexa-text-secondary)]">{pro.city}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[var(--nexa-text-primary)]">{pro.gmv}</td>
                    <td className="py-3.5 px-4">
                      {pro.verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0E9F6E] bg-[#0E9F6E]/10 px-2 py-0.5 rounded-full border border-[#0E9F6E]/20">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full border border-[#F59E0B]/20">
                          Pending Review
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/marketplace/pros`} className="text-xs font-bold text-[#1A56DB] hover:underline">
                        Manage
                      </Link>
                    </td>
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
