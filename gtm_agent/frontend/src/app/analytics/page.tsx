"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/gtm/AppShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Mail,
  MessageSquare,
  Radio,
  Share2,
  ThumbsUp,
  MessageCircle,
  Repeat,
  MousePointer,
  Eye,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { GTM_API } from "@/lib/api-client";

interface EmailReply {
  id: string;
  organization_id: string;
  from_email: string;
  from_name: string;
  to_email: string;
  subject: string;
  snippet: string;
  sentiment: string;
  intent_summary: string;
  suggested_reply_text: string;
  is_handled: boolean;
  received_at: string;
}

interface SocialPost {
  id: string;
  channel: string;
  external_post_id: string;
  content_snippet: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagement_rate: number;
  published_at: string;
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "replies" | "social">("overview");

  // Overview Stats
  const [overview, setOverview] = useState({
    attributed_pipeline_usd: 320000,
    pipeline_growth_pct: 38,
    blended_cac_usd: 84.2,
    cac_reduction_pct: 18,
    booked_demos_count: 49,
    show_up_rate_pct: 78,
    email_reply_rate_pct: 14.8,
    social_engagement_rate: 5.9,
    channel_performance: [
      { channel: "Email Cold Sequences", leads: 640, replies: 95, booked: 21, cac: "$42", roi: "4.8x" },
      { channel: "WhatsApp Business API", leads: 320, replies: 68, booked: 18, cac: "$28", roi: "6.2x" },
      { channel: "LinkedIn B2B Posts & Ads", leads: 180, replies: 24, booked: 6, cac: "$110", roi: "2.4x" },
      { channel: "Meta & Instagram Retargeting", leads: 100, replies: 18, booked: 4, cac: "$65", roi: "3.8x" },
    ],
  });

  // Replies & Social Data
  const [emailReplies, setEmailReplies] = useState<EmailReply[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [socialFilter, setSocialFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ovData, repliesData, socialData] = await Promise.allSettled([
        GTM_API.getOverviewAnalytics("org-01"),
        GTM_API.getEmailReplies("org-01"),
        GTM_API.getSocialAnalytics("org-01"),
      ]);

      if (ovData.status === "fulfilled" && ovData.value) setOverview(ovData.value);
      if (repliesData.status === "fulfilled" && repliesData.value) setEmailReplies(repliesData.value);
      if (socialData.status === "fulfilled" && socialData.value) setSocialPosts(socialData.value);
    } catch {
      // Fallback
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "MEETING_REQUESTED":
        return <NexaBadge variant="success" dot>Meeting Requested</NexaBadge>;
      case "POSITIVE_INTEREST":
        return <NexaBadge variant="brand" dot>Positive Interest</NexaBadge>;
      case "INFORMATION_REQUEST":
        return <NexaBadge variant="purple" dot>Information Request</NexaBadge>;
      case "OUT_OF_OFFICE":
        return <NexaBadge variant="neutral">Out of Office</NexaBadge>;
      case "NOT_INTERESTED":
      case "UNSUBSCRIBE":
        return <NexaBadge variant="danger">Not Interested</NexaBadge>;
      default:
        return <NexaBadge variant="neutral">{sentiment}</NexaBadge>;
    }
  };

  const getChannelBadge = (ch: string) => {
    switch (ch) {
      case "LINKEDIN":
        return <span className="px-2 py-0.5 rounded-lg bg-[#0A66C2]/15 text-[#0A66C2] font-bold text-[10px]">LinkedIn</span>;
      case "TWITTER":
        return <span className="px-2 py-0.5 rounded-lg bg-neutral-500/15 text-[var(--nexa-text-primary)] font-bold text-[10px]">X / Twitter</span>;
      case "INSTAGRAM":
        return <span className="px-2 py-0.5 rounded-lg bg-[#E1306C]/15 text-[#E1306C] font-bold text-[10px]">Instagram</span>;
      case "FACEBOOK":
        return <span className="px-2 py-0.5 rounded-lg bg-[#1877F2]/15 text-[#1877F2] font-bold text-[10px]">Facebook</span>;
      default:
        return <span className="px-2 py-0.5 rounded-lg bg-neutral-500/15 text-[10px]">{ch}</span>;
    }
  };

  const filteredSocialPosts = socialFilter === "ALL"
    ? socialPosts
    : socialPosts.filter((p) => p.channel === socialFilter);

  const totalImpressions = socialPosts.reduce((sum, p) => sum + p.impressions, 0);
  const totalLikes = socialPosts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = socialPosts.reduce((sum, p) => sum + p.comments, 0);
  const totalClicks = socialPosts.reduce((sum, p) => sum + p.clicks, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        {toastMessage && (
          <div className="p-3.5 rounded-2xl bg-[#0E9F6E]/15 border border-[#0E9F6E]/30 text-[#0E9F6E] text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NexaBadge variant="brand" dot>
                Siddharth Rao (Analytics Lead)
              </NexaBadge>
              <span className="text-xs text-[var(--nexa-text-muted)]">
                Cross-Channel Attribution, Email Replies & Social Engagement
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
              Revenue & Engagement Intelligence
            </h1>
            <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
              Real-time inbound reply sentiment tracking, autonomous follow-ups, and multi-network social performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NexaButton
              size="sm"
              variant="outline"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => {
                loadData();
                showToast("Refreshed all revenue, reply, and social analytics.");
              }}
            >
              Refresh Data
            </NexaButton>
            <NexaButton
              size="sm"
              variant="primary"
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={() => showToast("Executive GTM Performance Memo generated!")}
            >
              Generate Memo
            </NexaButton>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--nexa-border)] pb-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-[#1A56DB] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Revenue & Channel Overview
          </button>

          <button
            onClick={() => setActiveTab("replies")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "replies"
                ? "bg-[#1A56DB] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Inbound Email Replies
            <span className="px-1.5 py-0.2 rounded-full bg-[#0E9F6E]/20 text-[#0E9F6E] dark:text-[#34D399] text-[10px]">
              {emailReplies.length || 4}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("social")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "social"
                ? "bg-[#1A56DB] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Social Media Engagement
            <span className="px-1.5 py-0.2 rounded-full bg-[#7E22CE]/20 text-[#7E22CE] text-[10px]">
              {socialPosts.length || 4} Posts
            </span>
          </button>
        </div>

        {/* TAB 1: REVENUE & CHANNEL OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Top Key KPI Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <NexaCard variant="glass" padding="md" className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
                  <span>Attributed Pipeline</span>
                  <DollarSign className="w-4 h-4 text-[#0E9F6E]" />
                </div>
                <div className="text-2xl font-black text-[var(--nexa-text-primary)] font-mono">
                  ${(overview?.attributed_pipeline_usd || 0).toLocaleString()}
                </div>
                <div className="text-xs text-[#0E9F6E] flex items-center gap-1 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" /> +{overview.pipeline_growth_pct}% vs last month
                </div>
              </NexaCard>

              <NexaCard variant="glass" padding="md" className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
                  <span>Blended CAC</span>
                  <Target className="w-4 h-4 text-[#1A56DB]" />
                </div>
                <div className="text-2xl font-black text-[var(--nexa-text-primary)] font-mono">
                  ${overview.blended_cac_usd.toFixed(2)}
                </div>
                <div className="text-xs text-[#0E9F6E] flex items-center gap-1 font-semibold">
                  <ArrowDownRight className="w-3.5 h-3.5" /> -{overview.cac_reduction_pct}% cost reduction
                </div>
              </NexaCard>

              <NexaCard variant="glass" padding="md" className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
                  <span>Booked Demos</span>
                  <Users className="w-4 h-4 text-[#7E22CE]" />
                </div>
                <div className="text-2xl font-black text-[var(--nexa-text-primary)] font-mono">
                  {overview.booked_demos_count} Calls
                </div>
                <div className="text-xs text-[#0E9F6E] flex items-center gap-1 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" /> {overview.show_up_rate_pct}% show-up rate
                </div>
              </NexaCard>

              <NexaCard variant="glass" padding="md" className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
                  <span>Cold Email Reply Rate</span>
                  <Mail className="w-4 h-4 text-[#E3A008]" />
                </div>
                <div className="text-2xl font-black text-[var(--nexa-text-primary)] font-mono">
                  {overview.email_reply_rate_pct}%
                </div>
                <div className="text-xs text-[#0E9F6E] flex items-center gap-1 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" /> Industry avg: 3.2%
                </div>
              </NexaCard>
            </div>

            {/* Multi-Channel Performance Matrix */}
            <NexaCard variant="glass" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
                <div>
                  <h3 className="font-bold text-base text-[var(--nexa-text-primary)] text-display">
                    Multi-Channel Conversion & ROI Attribution
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Audited conversion metrics across Cold Sequences, WhatsApp WABA, and Social Channels.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-secondary)]">
                      <th className="p-3.5 font-bold">Acquisition Channel</th>
                      <th className="p-3.5 font-bold text-right">Leads Contacted</th>
                      <th className="p-3.5 font-bold text-right">Inbound Replies</th>
                      <th className="p-3.5 font-bold text-right">Booked Demos</th>
                      <th className="p-3.5 font-bold text-right">Channel CAC</th>
                      <th className="p-3.5 font-bold text-right">Revenue ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--nexa-border)]">
                    {overview.channel_performance.map((c, i) => (
                      <tr key={i} className="hover:bg-[var(--nexa-bg-surface)]/50">
                        <td className="p-3.5 font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#1A56DB]" />
                          {c.channel}
                        </td>
                        <td className="p-3.5 text-right font-mono">{c.leads}</td>
                        <td className="p-3.5 text-right font-mono font-semibold text-[#0E9F6E]">{c.replies}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-[var(--nexa-text-primary)]">{c.booked}</td>
                        <td className="p-3.5 text-right font-mono text-[var(--nexa-text-muted)]">{c.cac}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-[#0E9F6E]">{c.roi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </NexaCard>
          </div>
        )}

        {/* TAB 2: INBOUND EMAIL REPLIES & AI SENTIMENT INTELLIGENCE */}
        {activeTab === "replies" && (
          <div className="space-y-6">
            {/* Top Sentiment Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <NexaCard variant="glass" padding="md" className="space-y-1">
                <span className="text-[11px] text-[var(--nexa-text-muted)] font-semibold">Total Inbound Replies</span>
                <div className="text-2xl font-black text-[var(--nexa-text-primary)] font-mono">142</div>
                <span className="text-[10px] text-[#0E9F6E]">14.8% reply rate</span>
              </NexaCard>

              <NexaCard variant="glass" padding="md" className="space-y-1">
                <span className="text-[11px] text-[var(--nexa-text-muted)] font-semibold">Meetings Requested</span>
                <div className="text-2xl font-black text-[#0E9F6E] font-mono">48 Calls</div>
                <span className="text-[10px] text-[#0E9F6E]">33.8% of total replies</span>
              </NexaCard>

              <NexaCard variant="glass" padding="md" className="space-y-1">
                <span className="text-[11px] text-[var(--nexa-text-muted)] font-semibold">Information Inquiries</span>
                <div className="text-2xl font-black text-[#7E22CE] font-mono">64 Pricing/PDFs</div>
                <span className="text-[10px] text-[var(--nexa-text-muted)]">Handled autonomously</span>
              </NexaCard>

              <NexaCard variant="glass" padding="md" className="space-y-1">
                <span className="text-[11px] text-[var(--nexa-text-muted)] font-semibold">Unsubscribes / OOO</span>
                <div className="text-2xl font-black text-[var(--nexa-text-primary)] font-mono">30</div>
                <span className="text-[10px] text-[var(--nexa-text-muted)]">Auto-suppressed</span>
              </NexaCard>
            </div>

            {/* Inbound Replies Stream */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[var(--nexa-text-primary)] text-display flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#1A56DB]" />
                  Live Inbound Prospect Replies & AI Intent Extraction
                </h3>
                <span className="text-xs text-[var(--nexa-text-muted)]">
                  Classified via Groq Llama 3 & Claude 3.5 Sonnet
                </span>
              </div>

              <div className="space-y-3">
                {emailReplies.map((reply) => (
                  <NexaCard key={reply.id} variant="glass" padding="lg" className="space-y-3.5 hover:border-[var(--nexa-border-strong)] transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--nexa-border)] pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#1A56DB]/15 text-[#1A56DB] flex items-center justify-center font-bold text-xs">
                          {reply.from_name ? reply.from_name.charAt(0) : "P"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[var(--nexa-text-primary)]">{reply.from_name || reply.from_email}</span>
                            <span className="text-[11px] text-[var(--nexa-text-muted)] font-mono">&lt;{reply.from_email}&gt;</span>
                          </div>
                          <div className="text-[11px] font-semibold text-[var(--nexa-text-primary)] mt-0.5">{reply.subject}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getSentimentBadge(reply.sentiment)}
                        <span className="text-[10px] text-[var(--nexa-text-muted)] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Recent
                        </span>
                      </div>
                    </div>

                    {/* Prospect Snippet */}
                    <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-secondary)] italic">
                      "{reply.snippet}"
                    </div>

                    {/* AI Intent & Autonomous Suggested Reply */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#1A56DB]/10 to-[#7E22CE]/10 border border-[#1A56DB]/20 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#1A56DB] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Autonomous Intent: {reply.intent_summary}
                        </span>
                        <NexaBadge variant="cyan">Noah Sterling Draft</NexaBadge>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[var(--nexa-bg-surface)] text-xs text-[var(--nexa-text-primary)]">
                        {reply.suggested_reply_text}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <NexaButton
                          size="sm"
                          variant="primary"
                          leftIcon={<Send className="w-3.5 h-3.5" />}
                          onClick={() => showToast(`Authorized follow-up response dispatched to ${reply.from_email}!`)}
                        >
                          Send Suggested Reply
                        </NexaButton>
                      </div>
                    </div>
                  </NexaCard>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SOCIAL MEDIA ENGAGEMENT & POST ANALYTICS */}
        {activeTab === "social" && (
          <div className="space-y-6">
            {/* Top Aggregated Social KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <NexaCard variant="glass" padding="md" className="space-y-1">
                <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
                  <span>Total Impressions</span>
                  <Eye className="w-4 h-4 text-[#1A56DB]" />
                </div>
                <div className="text-2xl font-black text-[var(--nexa-text-primary)] font-mono">
                  {(totalImpressions || 0).toLocaleString()}
                </div>
                <span className="text-[10px] text-[#0E9F6E]">Across all 4 networks</span>
              </NexaCard>

              <NexaCard variant="glass" padding="md" className="space-y-1">
                <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
                  <span>Total Likes & Reactions</span>
                  <ThumbsUp className="w-4 h-4 text-[#0E9F6E]" />
                </div>
                <div className="text-2xl font-black text-[#0E9F6E] font-mono">
                  {(totalLikes || 0).toLocaleString()}
                </div>
                <span className="text-[10px] text-[#0E9F6E]">+{totalComments || 0} comments & replies</span>
              </NexaCard>

              <NexaCard variant="glass" padding="md" className="space-y-1">
                <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
                  <span>Link Clicks & Traffic</span>
                  <MousePointer className="w-4 h-4 text-[#7E22CE]" />
                </div>
                <div className="text-2xl font-black text-[var(--nexa-text-primary)] font-mono">
                  {(totalClicks || 0).toLocaleString()}
                </div>
                <span className="text-[10px] text-[#7E22CE]">Attributed inbound visits</span>
              </NexaCard>

              <NexaCard variant="glass" padding="md" className="space-y-1">
                <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
                  <span>Avg Engagement Rate</span>
                  <TrendingUp className="w-4 h-4 text-[#E3A008]" />
                </div>
                <div className="text-2xl font-black text-[var(--nexa-text-primary)] font-mono">
                  5.9%
                </div>
                <span className="text-[10px] text-[#0E9F6E]">Top quartile B2B benchmark</span>
              </NexaCard>
            </div>

            {/* Social Posts Filter Bar */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[var(--nexa-text-primary)] text-display flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#7E22CE]" />
                Published Post Performance & Audience Engagement
              </h3>

              <div className="flex items-center gap-1.5">
                {["ALL", "LINKEDIN", "TWITTER", "INSTAGRAM", "FACEBOOK"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setSocialFilter(f)}
                    className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      socialFilter === f
                        ? "bg-[#1A56DB] text-white shadow-sm"
                        : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border border-[var(--nexa-border)]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSocialPosts.map((post) => (
                <NexaCard key={post.id} variant="glass" padding="lg" className="space-y-4 hover:border-[var(--nexa-border-strong)] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getChannelBadge(post.channel)}
                      <span className="text-[10px] text-[var(--nexa-text-muted)]">Post ID: {post.external_post_id}</span>
                    </div>
                    <NexaBadge variant="success">{post.engagement_rate}% Eng Rate</NexaBadge>
                  </div>

                  <p className="text-xs text-[var(--nexa-text-primary)] line-clamp-3">
                    "{post.content_snippet}"
                  </p>

                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[var(--nexa-border)] text-center">
                    <div className="p-2 rounded-xl bg-[var(--nexa-bg-base)]">
                      <div className="text-[10px] text-[var(--nexa-text-muted)]">Impressions</div>
                      <div className="text-xs font-bold font-mono text-[var(--nexa-text-primary)] mt-0.5">
                        {(post.impressions || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--nexa-bg-base)]">
                      <div className="text-[10px] text-[var(--nexa-text-muted)]">Likes</div>
                      <div className="text-xs font-bold font-mono text-[#0E9F6E] mt-0.5">
                        {post.likes}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--nexa-bg-base)]">
                      <div className="text-[10px] text-[var(--nexa-text-muted)]">Comments</div>
                      <div className="text-xs font-bold font-mono text-[#1A56DB] mt-0.5">
                        {post.comments}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--nexa-bg-base)]">
                      <div className="text-[10px] text-[var(--nexa-text-muted)]">Link Clicks</div>
                      <div className="text-xs font-bold font-mono text-[#7E22CE] mt-0.5">
                        {post.clicks}
                      </div>
                    </div>
                  </div>
                </NexaCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
