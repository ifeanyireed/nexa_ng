"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaModal } from "@/components/nexa/NexaModal";
import { NexaInput } from "@/components/nexa/NexaInput";
import { INITIAL_FEATURE_FLAGS, FeatureFlag } from "@/lib/admin-data";
import {
  ToggleLeft,
  ToggleRight,
  Sliders,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Search,
} from "lucide-react";

export default function AdminFeaturesPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FEATURE_FLAGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFlagForEdit, setSelectedFlagForEdit] = useState<FeatureFlag | null>(null);

  const toggleFlag = (id: string) => {
    setFlags((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, isEnabledGlobally: !f.isEnabledGlobally } : f
      )
    );
  };

  const updateRolloutPct = (id: string, pct: number) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, rolloutPercentage: pct } : f))
    );
  };

  const filteredFlags = flags.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.key.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    );
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NexaBadge variant="purple" dot>
                Staged Rollout Controller
              </NexaBadge>
              <span className="text-xs text-[var(--nexa-text-muted)]">
                Dynamic Runtime Toggles
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
              Feature Flags & Rollout Management
            </h1>
            <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
              Enable cutting-edge AI capabilities, configure percentage-based canary releases, and manage tenant whitelists.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Create Feature Flag
            </NexaButton>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center justify-between p-3 rounded-2xl liquid-glass border border-[var(--glass-border)]">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--nexa-text-faint)]" />
            <input
              type="text"
              placeholder="Search feature flags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#7E22CE]"
            />
          </div>

          <div className="text-xs text-[var(--nexa-text-muted)]">
            <strong>{flags.filter((f) => f.isEnabledGlobally).length}</strong> of {flags.length} Globally Enabled
          </div>
        </div>

        {/* Feature Flags Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredFlags.map((flag) => (
            <NexaCard key={flag.id} variant="glass" padding="lg" className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <NexaBadge
                        variant={
                          flag.category === "AI Engine"
                            ? "purple"
                            : flag.category === "Enterprise"
                            ? "brand"
                            : "cyan"
                        }
                      >
                        {flag.category}
                      </NexaBadge>
                      <span className="text-[11px] font-mono text-[var(--nexa-text-muted)]">
                        {flag.key}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-[var(--nexa-text-primary)] text-display mt-1">
                      {flag.name}
                    </h3>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleFlag(flag.id)}
                    className="cursor-pointer text-2xl transition-transform hover:scale-110"
                    title={flag.isEnabledGlobally ? "Disable globally" : "Enable globally"}
                  >
                    {flag.isEnabledGlobally ? (
                      <ToggleRight className="w-8 h-8 text-[#0E9F6E]" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-[var(--nexa-text-faint)]" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                  {flag.description}
                </p>

                {/* Staged Rollout Slider */}
                <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[var(--nexa-text-muted)]">Canary Rollout</span>
                    <span className="text-mono font-bold text-[#7E22CE] dark:text-[#C084FC]">
                      {flag.rolloutPercentage}% of Tenants
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={flag.rolloutPercentage}
                    onChange={(e) => updateRolloutPct(flag.id, parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-[var(--nexa-border)] rounded-lg appearance-none cursor-pointer accent-[#7E22CE]"
                  />
                </div>

                {/* Whitelist Tags */}
                {flag.whitelistedOrgIds.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="font-semibold text-[var(--nexa-text-muted)]">Whitelisted:</span>
                    {flag.whitelistedOrgIds.map((orgId) => (
                      <span
                        key={orgId}
                        className="px-2 py-0.5 rounded-md bg-[var(--nexa-brand-light)] text-[#1A56DB] dark:bg-white/10 dark:text-[#60A5FA] font-mono text-[10px]"
                      >
                        {orgId}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-between text-[11px] text-[var(--nexa-text-muted)]">
                <span>By {flag.updatedBy}</span>
                <span className="font-mono">{flag.lastUpdated}</span>
              </div>
            </NexaCard>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
