"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Search,
  CheckCircle2,
  Percent,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function MarketplaceCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "cat-1", name: "Home Services & Repairs", slug: "home-services", nichesCount: 18, totalPros: 940, commission: "10%", status: "ACTIVE" },
    { id: "cat-2", name: "Solar & Renewable Energy", slug: "solar-energy", nichesCount: 6, totalPros: 412, commission: "8%", status: "ACTIVE" },
    { id: "cat-3", name: "Artisans & Handyman Finders", slug: "handyman-finders", nichesCount: 14, totalPros: 680, commission: "12%", status: "ACTIVE" },
    { id: "cat-4", name: "Automotive & Fleet Mechanics", slug: "auto-mechanics", nichesCount: 10, totalPros: 320, commission: "10%", status: "ACTIVE" },
    { id: "cat-5", name: "Private Health & Caregivers", slug: "health-finders", nichesCount: 8, totalPros: 215, commission: "15%", status: "ACTIVE" },
    { id: "cat-6", name: "Last-Mile Delivery & Haulage", slug: "logistics", nichesCount: 12, totalPros: 540, commission: "8%", status: "ACTIVE" },
    { id: "cat-7", name: "Events & Catering Pros", slug: "catering-events", nichesCount: 16, totalPros: 313, commission: "10%", status: "ACTIVE" },
  ];

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Layers className="w-6 h-6 text-[#0E9F6E]" />
              99+ Niche Categories & Commission Rules
            </h1>
            <p className="text-xs sm:text-sm text-[var(--nexa-text-muted)] mt-1">
              Configure marketplace vertical taxonomy, SEO slug hierarchies, and platform escrow take-rates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#0E9F6E] hover:bg-[#0B855B] text-white">
              Add Category Vertical
            </NexaButton>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nexa-text-muted)]" />
            <input
              type="text"
              placeholder="Filter by category name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#0E9F6E]"
            />
          </div>
          <span className="text-xs text-[var(--nexa-text-muted)] font-mono">
            {filteredCategories.length} Verticals Listed
          </span>
        </div>

        {/* CATEGORIES TABLE */}
        <NexaCard variant="glass" padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Category Vertical</th>
                  <th className="py-3 px-4">SEO Slug</th>
                  <th className="py-3 px-4">Sub-Niches</th>
                  <th className="py-3 px-4">Active Pros</th>
                  <th className="py-3 px-4">Take Rate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] font-medium">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[var(--nexa-bg-surface)]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[var(--nexa-text-primary)]">
                      {cat.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--nexa-text-secondary)]">
                      /{cat.slug}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--nexa-text-primary)]">
                      {cat.nichesCount} sub-services
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0E9F6E]">
                      {cat.totalPros} pros
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1A56DB]">
                      {cat.commission}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0E9F6E] bg-[#0E9F6E]/10 px-2 py-0.5 rounded-full border border-[#0E9F6E]/20">
                        {cat.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button className="text-xs font-bold text-[#1A56DB] hover:underline cursor-pointer">
                        Edit
                      </button>
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
