"use client";

import React from "react";
import {
  Ruler,
  Scissors,
  Truck,
  RefreshCw,
  ShieldCheck,
  Clock,
  Sparkles,
  Zap,
  Award,
  CheckCircle2,
  Package,
  Heart,
  Flame,
  ChefHat,
  BadgePercent,
  LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  ruler: Ruler,
  scissors: Scissors,
  truck: Truck,
  refresh: RefreshCw,
  refreshcw: RefreshCw,
  shield: ShieldCheck,
  shieldcheck: ShieldCheck,
  clock: Clock,
  sparkles: Sparkles,
  zap: Zap,
  award: Award,
  check: CheckCircle2,
  package: Package,
  heart: Heart,
  flame: Flame,
  chef: ChefHat,
  discount: BadgePercent,
};

export interface ValueBadgeItem {
  title: string;
  description: string;
  icon?: string | React.ReactNode;
}

interface StorefrontValueBadgesProps {
  customBadges?: Array<{ title: string; description: string; icon?: string }>;
  defaultBadges: Array<{ title: string; description: string; icon: React.ReactNode }>;
  accentColor?: string;
  isVisible?: boolean;
}

export default function StorefrontValueBadges({
  customBadges,
  defaultBadges,
  accentColor = "text-amber-600",
  isVisible = true,
}: StorefrontValueBadgesProps) {
  if (isVisible === false) return null;

  // Use custom badges if merchant populated any with title, otherwise fallback to vertical defaults
  const activeBadges =
    customBadges && customBadges.length > 0 && customBadges.some((b) => b.title?.trim())
      ? customBadges.slice(0, 4)
      : null;

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
      {activeBadges
        ? activeBadges.map((badge, idx) => {
            const iconKey = (badge.icon || "").toLowerCase().trim();
            const IconComponent = ICON_MAP[iconKey] || (idx === 0 ? Ruler : idx === 1 ? Award : idx === 2 ? Truck : RefreshCw);
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5"
              >
                <IconComponent className={`w-7 h-7 ${accentColor} shrink-0`} />
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-zinc-900">{badge.title}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">{badge.description}</p>
                </div>
              </div>
            );
          })
        : defaultBadges.map((badge, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5"
            >
              <div className="shrink-0">{badge.icon}</div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">{badge.title}</h4>
                <p className="text-xs text-stone-500 mt-0.5">{badge.description}</p>
              </div>
            </div>
          ))}
    </section>
  );
}
