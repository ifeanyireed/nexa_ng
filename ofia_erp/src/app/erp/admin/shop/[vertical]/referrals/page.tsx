"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Gift,
  Share2,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Copy,
  Check,
  Percent,
  Plus,
  Sliders,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";
import {
  VERTICAL_DEFINITIONS,
  VerticalKey,
} from "@/lib/verticals";

interface CampaignItem {
  id: string;
  title: string;
  rewardType: "PERCENT" | "FLAT";
  rewardValue: string;
  minPurchase: string;
  clicks: number;
  conversions: number;
  totalPaid: string;
  status: "ACTIVE" | "PAUSED";
}

export default function VerticalReferralsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);

  const rawVertical = (params?.vertical as string) || "fashion";
  const verticalKey: VerticalKey = (rawVertical in VERTICAL_DEFINITIONS ? rawVertical : "fashion") as VerticalKey;
  const currentVerticalDef = VERTICAL_DEFINITIONS[verticalKey] || VERTICAL_DEFINITIONS.fashion;

  // Tenant vertical enforcement: strictly lock tenant to their provisioned vertical
  React.useEffect(() => {
    if (activeTenant?.vertical && activeTenant.vertical in VERTICAL_DEFINITIONS && activeTenant.vertical !== verticalKey) {
      router.replace(`/erp/admin/shop/${activeTenant.vertical}/referrals`);
    }
  }, [activeTenant?.vertical, verticalKey, router]);

  const [campaigns, setCampaigns] = useState<CampaignItem[]>([
    {
      id: "CAMP-01",
      title: `${currentVerticalDef.name} VIP Customer Referral`,
      rewardType: "PERCENT",
      rewardValue: "7.5%",
      minPurchase: "₦25,000",
      clicks: 420,
      conversions: 38,
      totalPaid: "₦142,500",
      status: "ACTIVE",
    },
    {
      id: "CAMP-02",
      title: `${currentVerticalDef.serviceTerm} Booking Bounty`,
      rewardType: "FLAT",
      rewardValue: "₦5,000",
      minPurchase: "Any Booking",
      clicks: 180,
      conversions: 14,
      totalPaid: "₦70,000",
      status: "ACTIVE",
    },
  ]);

  const [copiedLink, setCopiedLink] = useState(false);
  const referralBaseUrl = `https://${activeTenant?.slug || "store"}.ofia.store/${verticalKey}?ref=AFF-`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(referralBaseUrl + "PARTNER");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <BusinessShell
      title={`${currentVerticalDef.name} — Viral Referrals & Affiliates`}
      subtitle={`Affiliate commission rules, creator bounties, and viral referral loops for ${currentVerticalDef.name.toLowerCase()}.`}
      activeModule="shop"
      action={
        <div className="flex items-center gap-2">
          <NexaBadge variant="brand" size="sm" className="rounded-full">
            {currentVerticalDef.name}
          </NexaBadge>

          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-full bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-[#1A56DB] text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "Link Copied!" : "Copy Affiliate Link"}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI CARDS */}
        <ErpStatGrid
          stats={[
            {
              label: "Affiliate Attributed Sales",
              value: "₦2,450,000",
              change: "+31.2% this month",
              trend: "up",
              icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
              sub: `From ${currentVerticalDef.name} partner links`,
            },
            {
              label: "Active Referral Partners",
              value: "42 Creators",
              change: currentVerticalDef.badge,
              trend: "up",
              icon: <Users className="w-5 h-5 text-blue-500" />,
              sub: "Registered advocates",
            },
            {
              label: "Conversion Rate",
              value: "8.6%",
              change: "Industry Leading",
              trend: "up",
              icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
              sub: "Clicks converted to sales",
            },
            {
              label: "Commissions Paid Out",
              value: "₦212,500",
              change: "Auto-Settled",
              trend: "neutral",
              icon: <Gift className="w-5 h-5 text-amber-500" />,
              sub: "Paid to partner bank accounts",
            },
          ]}
        />

        {/* ACTIVE CAMPAIGNS CARD */}
        <NexaCard variant="glass" padding="lg" className="rounded-3xl border border-[var(--nexa-border)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
            <div>
              <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                Active {currentVerticalDef.name} Bounty Campaigns
              </h3>
              <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                Incentivize influencers and existing clients to recommend your {currentVerticalDef.productTermPlural.toLowerCase()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[var(--nexa-text-primary)]">{camp.title}</h4>
                  <NexaBadge variant="green" size="sm" className="rounded-full text-[10px]">
                    {camp.status}
                  </NexaBadge>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[var(--nexa-bg-surface)] text-[10px]">
                  <div>
                    <span className="text-[var(--nexa-text-muted)] block">Reward</span>
                    <span className="font-bold text-[#1A56DB] text-xs">{camp.rewardValue}</span>
                  </div>
                  <div>
                    <span className="text-[var(--nexa-text-muted)] block">Conversions</span>
                    <span className="font-bold text-[var(--nexa-text-primary)] text-xs">{camp.conversions} Orders</span>
                  </div>
                  <div>
                    <span className="text-[var(--nexa-text-muted)] block">Paid Out</span>
                    <span className="font-bold text-emerald-600 text-xs">{camp.totalPaid}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--nexa-text-muted)] pt-1">
                  <span>Threshold: {camp.minPurchase}</span>
                  <span className="font-mono">{camp.clicks} Clicks</span>
                </div>
              </div>
            ))}
          </div>
        </NexaCard>
      </div>
    </BusinessShell>
  );
}
