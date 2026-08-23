"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import {
  Trophy,
  Flame,
  Key,
  Users,
  Target,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Tv,
} from "lucide-react";

export default function EmployeeMyQuestsPage() {
  const [claimCode, setClaimCode] = useState("");
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  const handleClaim = () => {
    if (!claimCode.trim()) return;
    setClaimStatus("Claiming...");
    setTimeout(() => {
      setClaimStatus("SUCCESS");
    }, 1000);
  };

  return (
    <BusinessShell
      title="My Team Quests"
      subtitle="Competitions, company retreats, hackathons, and team agility challenges."
      action={
        <Link href="/quests/2026-staff-retreat/scoreboard" target="_blank">
          <NexaButton size="sm" variant="outline" leftIcon={<Tv className="w-4 h-4 text-[#1A56DB]" />}>
            Stage Scoreboard
          </NexaButton>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* CLAIM CODE BANNER */}
        <NexaCard variant="glass" padding="md" className="border-l-4 border-l-[#1A56DB]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                <Key className="w-4 h-4 text-[#1A56DB]" /> Have an Event Claim Code?
              </h3>
              <p className="text-xs text-[var(--nexa-text-secondary)]">
                Enter your unique pass code (e.g. <code className="font-mono text-[#1A56DB]">QST-82K</code>) from your invite email to unlock your team assignment.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <NexaInput
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value)}
                placeholder="QST-82K"
                className="w-32 font-mono uppercase"
              />
              <NexaButton size="sm" variant="primary" onClick={handleClaim}>
                Claim Pass
              </NexaButton>
            </div>
          </div>

          {claimStatus === "SUCCESS" && (
            <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-500 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Enrolled in 2026 Annual Staff Retreat! You are assigned to Team Alpha (Blue Eagles).
            </div>
          )}
        </NexaCard>

        {/* ACTIVE ENROLLED QUEST CARD */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider">
            Active Competitions
          </h3>

          <NexaCard variant="glass" padding="none" className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="relative h-48 md:h-auto overflow-hidden bg-gray-900">
                <img
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80"
                  alt="Retreat"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute top-3 left-3">
                  <NexaBadge variant="green" size="sm" className="flex items-center gap-1 rounded-full">
                    <Flame className="w-3 h-3 text-emerald-400" /> LIVE COMPETITION
                  </NexaBadge>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-[11px] text-white/80 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Epe Resort & Spa · Aug 22–25
                  </div>
                  <h4 className="text-sm font-bold">2026 Annual Staff Retreat</h4>
                </div>
              </div>

              <div className="p-6 md:col-span-2 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--nexa-text-muted)]">Your Assigned Squad:</span>
                    <NexaBadge variant="brand" size="sm" className="rounded-full">Rank #1 in Quest</NexaBadge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center font-mono font-black text-lg">
                      A
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[var(--nexa-text-primary)]">
                        Team Alpha (Blue Eagles)
                      </h3>
                      <div className="text-xs text-[var(--nexa-text-secondary)]">
                        &ldquo;Swift, Strategic, Unstoppable&rdquo; · 15 Teammates
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 py-3 border-y border-[var(--nexa-border)] text-center text-xs">
                  <div>
                    <div className="text-[var(--nexa-text-muted)]">Team Points</div>
                    <div className="text-base font-black text-[#1A56DB]">840 pts</div>
                  </div>
                  <div>
                    <div className="text-[var(--nexa-text-muted)]">Active Challenges</div>
                    <div className="text-base font-black text-amber-500">1 Live</div>
                  </div>
                  <div>
                    <div className="text-[var(--nexa-text-muted)]">Your Contributions</div>
                    <div className="text-base font-black text-emerald-500">150 pts</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-[var(--nexa-text-muted)]">
                    Next Challenge: <strong>Creative Team Mascot Photo</strong>
                  </div>
                  <Link href="/erp/employee/quests/qst-retreat-2026">
                    <NexaButton size="sm" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Enter Player Console
                    </NexaButton>
                  </Link>
                </div>
              </div>
            </div>
          </NexaCard>
        </div>
      </div>
    </BusinessShell>
  );
}
