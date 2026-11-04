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
  UserCheck,
  Zap,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaModal } from "@/components/nexa/NexaModal";
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

interface AffiliatePartner {
  id: string;
  name: string;
  channel: string;
  refCode: string;
  tier: "PLATINUM" | "GOLD" | "SILVER";
  clicks: number;
  conversions: number;
  earnings: string;
  status: "VERIFIED" | "PENDING";
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

  const [affiliates] = useState<AffiliatePartner[]>([
    {
      id: "AFF-101",
      name: "Eki Silk & Style",
      channel: "Instagram / Fashion Blog",
      refCode: "EKISTYLE",
      tier: "PLATINUM",
      clicks: 284,
      conversions: 28,
      earnings: "₦210,000",
      status: "VERIFIED",
    },
    {
      id: "AFF-102",
      name: "Lekki Sartorial Society",
      channel: "YouTube Menswear Show",
      refCode: "SARTORIAL26",
      tier: "GOLD",
      clicks: 142,
      conversions: 19,
      earnings: "₦142,500",
      status: "VERIFIED",
    },
    {
      id: "AFF-103",
      name: "AfroChic Wardrobe Reviews",
      channel: "TikTok / Runway Reels",
      refCode: "AFROCHIC",
      tier: "SILVER",
      clicks: 94,
      conversions: 12,
      earnings: "₦90,000",
      status: "VERIFIED",
    },
  ]);

  const [copiedLink, setCopiedLink] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newRewardType, setNewRewardType] = useState<"PERCENT" | "FLAT">("PERCENT");
  const [newRewardValue, setNewRewardValue] = useState("10%");
  const [newMinPurchase, setNewMinPurchase] = useState("₦30,000");

  const tenantSlug = activeTenant?.slug || (verticalKey === "fashion" ? "funmyclothing" : verticalKey === "cars" ? "neweratransports" : "reedbreed");
  const referralBaseUrl = `https://${tenantSlug}.ofia.store/${verticalKey}?ref=AFF-`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(referralBaseUrl + "PARTNER");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleToggleCampaignStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "ACTIVE" ? "PAUSED" : "ACTIVE" } : c
      )
    );
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCamp: CampaignItem = {
      id: `CAMP-${Date.now().toString().slice(-4)}`,
      title: newTitle.trim(),
      rewardType: newRewardType,
      rewardValue: newRewardValue.trim(),
      minPurchase: newMinPurchase.trim() || "None",
      clicks: 0,
      conversions: 0,
      totalPaid: "₦0",
      status: "ACTIVE",
    };

    setCampaigns((prev) => [newCamp, ...prev]);
    setIsCreateModalOpen(false);
    setNewTitle("");
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
            <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
          </button>

          <NexaButton
            size="sm"
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="rounded-full bg-[#1A56DB] text-white font-bold"
          >
            New Campaign
          </NexaButton>
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

            <NexaButton
              size="sm"
              variant="outline"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="rounded-full"
            >
              Add Campaign
            </NexaButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[var(--nexa-text-primary)]">{camp.title}</h4>
                  <button
                    type="button"
                    onClick={() => handleToggleCampaignStatus(camp.id)}
                    className="cursor-pointer"
                  >
                    <NexaBadge
                      variant={camp.status === "ACTIVE" ? "green" : "neutral"}
                      size="sm"
                      className="rounded-full text-[10px]"
                    >
                      {camp.status} · Click to {camp.status === "ACTIVE" ? "Pause" : "Activate"}
                    </NexaBadge>
                  </button>
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

        {/* AFFILIATE CREATOR DIRECTORY LEADERBOARD */}
        <NexaCard variant="glass" padding="lg" className="rounded-3xl border border-[var(--nexa-border)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
            <div>
              <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                Top {currentVerticalDef.name} Creator Advocates
              </h3>
              <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                Verified brand ambassadors generating qualified leads and sales for {currentVerticalDef.name.toLowerCase()}
              </p>
            </div>
            <NexaBadge variant="brand" size="sm" className="rounded-full font-mono text-[10px]">
              {affiliates.length} Active Partners
            </NexaBadge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--nexa-border)] text-[var(--nexa-text-muted)] uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="p-3">Partner / Channel</th>
                  <th className="p-3">Referral Code</th>
                  <th className="p-3">Partner Tier</th>
                  <th className="p-3">Clicks & Orders</th>
                  <th className="p-3">Commissions Earned</th>
                  <th className="p-3 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)]">
                {affiliates.map((aff) => (
                  <tr key={aff.id} className="hover:bg-[var(--nexa-bg-surface)]/50 transition-colors">
                    <td className="p-3">
                      <span className="font-bold text-[var(--nexa-text-primary)] block">{aff.name}</span>
                      <span className="text-[10px] text-[var(--nexa-text-muted)]">{aff.channel}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                        {aff.refCode}
                      </span>
                    </td>
                    <td className="p-3">
                      <NexaBadge
                        variant={aff.tier === "PLATINUM" ? "purple" : aff.tier === "GOLD" ? "amber" : "neutral"}
                        size="sm"
                        className="rounded-full text-[10px]"
                      >
                        {aff.tier}
                      </NexaBadge>
                    </td>
                    <td className="p-3 font-mono">
                      <span className="font-bold text-[var(--nexa-text-primary)]">{aff.conversions} Orders</span>
                      <span className="text-[10px] text-[var(--nexa-text-muted)] block">{aff.clicks} clicks</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600">
                      {aff.earnings}
                    </td>
                    <td className="p-3 text-right">
                      <NexaBadge variant="green" size="sm" className="rounded-full text-[10px]">
                        {aff.status}
                      </NexaBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NexaCard>
      </div>

      {/* CREATE CAMPAIGN MODAL */}
      <NexaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={`New ${currentVerticalDef.name} Bounty Campaign`}
        subtitle="Set commission rewards, minimum thresholds, and viral promotion incentives"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
              Campaign Title
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Bridal Party Ambassador Reward"
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Reward Type
              </label>
              <select
                value={newRewardType}
                onChange={(e) => setNewRewardType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-bold text-[var(--nexa-text-primary)] outline-none"
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="FLAT">Flat Fee (₦)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Reward Amount
              </label>
              <input
                type="text"
                required
                value={newRewardValue}
                onChange={(e) => setNewRewardValue(e.target.value)}
                placeholder={newRewardType === "PERCENT" ? "10%" : "₦5,000"}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-mono font-bold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
              Minimum Order Spend Threshold
            </label>
            <input
              type="text"
              value={newMinPurchase}
              onChange={(e) => setNewMinPurchase(e.target.value)}
              placeholder="e.g. ₦30,000 or None"
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--nexa-border)]">
            <NexaButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-full"
            >
              Cancel
            </NexaButton>
            <NexaButton
              type="submit"
              variant="primary"
              size="sm"
              className="rounded-full bg-[#1A56DB] text-white font-bold"
            >
              Launch Campaign
            </NexaButton>
          </div>
        </form>
      </NexaModal>
    </BusinessShell>
  );
}
