"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import {
  Sparkles,
  Cpu,
  ShieldCheck,
  Zap,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Users,
  MessageSquare,
  Mail,
  DollarSign,
  Layers,
  Lock,
  Globe2,
  Play,
  Share2,
  BarChart3,
  Calendar,
} from "lucide-react";
import {
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandLinkedin,
  IconBrandOpenai,
  IconBrandMeta,
} from "@tabler/icons-react";

export default function LandingPage() {
  const [activeAgentCategory, setActiveAgentCategory] = useState<string>("ALL");
  const [roiLeads, setRoiLeads] = useState<number>(5000);

  const agents = [
    { key: "cro", name: "Sterling Vance", role: "Chief Revenue Officer", category: "Executive", avatar: "/avatar1.png", quote: "Pacing to generate $142.5k pipeline across private school ERP segments." },
    { key: "researcher", name: "Dr. Elena Rostova", role: "Market Researcher", category: "Intelligence", avatar: "/avatar2.png", quote: "Detected 20% competitor price increases in Abuja market. Re-framing value hook." },
    { key: "lead_hunter", name: "Olivia Chen", role: "Lead Hunter", category: "Intelligence", avatar: "/avatar3.png", quote: "Extracted 450 verified school principal emails and WhatsApp direct lines." },
    { key: "gtm_strategist", name: "Marcus Aurel", role: "GTM Strategist", category: "Strategy", avatar: "/avatar4.png", quote: "Framed offer around Automated Tuition Recovery rather than complex software." },
    { key: "copywriter", name: "Julian Cross", role: "AI Copywriter", category: "Content", avatar: "/avatar6.png", quote: "Drafted 3-line pattern interrupt emails with 42% projected open rate." },
    { key: "outreach_manager", name: "Noah Sterling", role: "Outreach Manager", category: "Outreach", avatar: "/avatar8.png", quote: "Dispatched Batch 1 via AWS SES warm pool. Zero bounces detected." },
    { key: "whatsapp_manager", name: "Amara Obi", role: "WhatsApp Manager", category: "Outreach", avatar: "/avatar9.png", quote: "14 warm replies received on WhatsApp Cloud. Triggering demo links." },
    { key: "analytics_manager", name: "Siddharth Rao", role: "Analytics Manager", category: "Intelligence", avatar: "/avatar12.png", quote: "Hybrid Email + WhatsApp sequence converting 3.1x higher than cold email alone." },
  ];

  const filteredAgents =
    activeAgentCategory === "ALL"
      ? agents
      : agents.filter((a) => a.category.toUpperCase() === activeAgentCategory);

  const calculatedMeetings = Math.round(roiLeads * 0.082 * 0.28);
  const calculatedPipeline = calculatedMeetings * 18500;

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] selection:bg-[#1A56DB] selection:text-white">
      <PublicNav />

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] dark:bg-[#1A56DB]/20 border border-[#1A56DB]/30 text-xs font-extrabold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "6s" }} />
            The Autonomous GTM Swarm Era
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-display tracking-tight text-[var(--nexa-text-primary)] leading-[1.08]">
            Replace 10 Disconnected Tools with a <span className="text-[#1A56DB]">14-Agent Revenue Swarm</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-[var(--nexa-text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Autonomous market research, verified lead extraction, high-converting copy, multi-channel dispatch, and instant Telegram mobile approvals — synchronized 24/7.
          </p>

          {/* CTA Group */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <NexaButton
                size="lg"
                variant="primary"
                className="w-full sm:w-auto font-black text-sm shadow-xl shadow-[#1A56DB]/25 h-13 px-8 rounded-2xl"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start 14-Day Free Trial
              </NexaButton>
            </Link>
            <Link href="/dashboard">
              <NexaButton
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto font-bold text-sm h-13 px-8 rounded-2xl"
                leftIcon={<Play className="w-4 h-4 text-[#1A56DB]" />}
              >
                Launch Swarm Console
              </NexaButton>
            </Link>
          </div>

          {/* Trust Badges Strip */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--nexa-text-muted)] font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0E9F6E]" /> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0E9F6E]" /> SOC2 & AES-256 Encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0E9F6E]" /> Setup in Under 10 Minutes
            </span>
          </div>
        </div>

        {/* Live Swarm Coordination Simulator Preview */}
        <div className="mt-14 max-w-5xl mx-auto">
          <NexaCard variant="glass" padding="none" className="border-2 border-[#1A56DB]/25 shadow-2xl overflow-hidden">
            {/* Window Top Bar */}
            <div className="p-3.5 bg-[var(--nexa-bg-surface)] border-b border-[var(--nexa-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-[var(--nexa-text-muted)]">
                  swarm-orchestrator@cluster-01:~ [LIVE TELEMETRY]
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0E9F6E]/10 text-[#0E9F6E] border border-[#0E9F6E]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F6E] animate-pulse" />
                  14 AGENTS ONLINE
                </span>
              </div>
            </div>

            {/* Simulated Live Action Stream */}
            <div className="p-6 bg-[var(--nexa-bg-base)]/90 space-y-4 font-mono text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)]">
                <img src="/avatar1.png" alt="Sterling Vance" className="w-8 h-8 rounded-lg object-cover" />
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--nexa-text-primary)]">Sterling Vance (Chief Revenue Officer)</span>
                    <span className="text-[10px] text-[var(--nexa-text-muted)]">09:15:02 WAT</span>
                  </div>
                  <p className="text-[var(--nexa-text-secondary)] font-sans">
                    "Identified private schools vertical with $45M TAM. Olivia, extract 450 verified Principal emails and WhatsApp contacts in Lagos."
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] ml-4 sm:ml-8">
                <img src="/avatar3.png" alt="Olivia Chen" className="w-8 h-8 rounded-lg object-cover" />
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--nexa-text-primary)]">Olivia Chen (Lead Hunter)</span>
                    <span className="text-[10px] text-[var(--nexa-text-muted)]">09:15:28 WAT</span>
                  </div>
                  <p className="text-[var(--nexa-text-secondary)] font-sans">
                    "450 school decision makers enriched. 0% syntax errors. Dispatched payload to Julian Cross for personalized 3-line copy generation."
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#1A56DB]/10 border border-[#1A56DB]/30 ml-8 sm:ml-16">
                <div className="w-8 h-8 rounded-lg bg-[#1A56DB] text-white flex items-center justify-center shrink-0">
                  <IconBrandTelegram className="w-5 h-5" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1A56DB]">Telegram CRO Bot (@OfiaGTM_CRO_Bot)</span>
                    <span className="text-[10px] text-[#0E9F6E] font-bold">1-TAP APPROVED</span>
                  </div>
                  <p className="text-[var(--nexa-text-primary)] font-sans text-[11px]">
                    Interactive Approval Card sent to Operator: 'Approve 450-Drop Batch 1 to Private Schools?' $\rightarrow$ Operator tapped <strong>[APPROVE]</strong>. Dispatched across AWS SES & WhatsApp WABA.
                  </p>
                </div>
              </div>
            </div>
          </NexaCard>
        </div>
      </section>

      {/* Metrics & Proof Banner */}
      <section className="border-y border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#1A56DB]">$142.5K</div>
            <div className="text-xs font-bold text-[var(--nexa-text-primary)]">Avg Attributed Pipeline</div>
            <div className="text-[11px] text-[var(--nexa-text-muted)]">Per 30-day active campaign</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#0E9F6E]">3.1x</div>
            <div className="text-xs font-bold text-[var(--nexa-text-primary)]">Higher Meeting Booking</div>
            <div className="text-[11px] text-[var(--nexa-text-muted)]">Email + WABA hybrid sequences</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#7E22CE]">14 Agents</div>
            <div className="text-xs font-bold text-[var(--nexa-text-primary)]">Coordinated In Real-Time</div>
            <div className="text-[11px] text-[var(--nexa-text-muted)]">Zero human SDR fatigue</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#E3A008]">&lt; 1.2%</div>
            <div className="text-xs font-bold text-[var(--nexa-text-primary)]">Domain Bounce Rate</div>
            <div className="text-[11px] text-[var(--nexa-text-muted)]">Protected by Circuit Breakers</div>
          </div>
        </div>
      </section>

      {/* The 4 Pillars (Sales Closer) */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <NexaBadge variant="brand">Autonomous Revenue Infrastructure</NexaBadge>
          <h2 className="text-3xl sm:text-5xl font-black text-display text-[var(--nexa-text-primary)]">
            Engineered to Outperform Entire SDR Teams
          </h2>
          <p className="text-xs sm:text-sm text-[var(--nexa-text-secondary)]">
            Everything high-growth B2B software companies need to scale outreach without hiring armies of reps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature 1 */}
          <NexaCard variant="glass" padding="lg" className="space-y-4 border-l-4 border-l-[#1A56DB]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[var(--nexa-text-primary)] text-display">
                  Multi-Channel Outreach Engine
                </h3>
                <span className="text-xs text-[var(--nexa-text-muted)]">Email · WhatsApp · LinkedIn · Meta</span>
              </div>
            </div>
            <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
              Don't rely solely on crowded inboxes. Our swarm orchestrates verified AWS SES drops, sends official Meta Cloud WhatsApp interactive templates, and connects directly on LinkedIn with contextualized personalization.
            </p>
          </NexaCard>

          {/* Feature 2 */}
          <NexaCard variant="glass" padding="lg" className="space-y-4 border-l-4 border-l-[#0E9F6E]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0E9F6E]/10 text-[#0E9F6E] flex items-center justify-center">
                <IconBrandTelegram className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[var(--nexa-text-primary)] text-display">
                  Telegram CRO Mobile Command
                </h3>
                <span className="text-xs text-[var(--nexa-text-muted)]">1-Click Mobile Approvals & Alerts</span>
              </div>
            </div>
            <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
              Run your entire GTM agency straight from Telegram. Whenever copy is drafted or high-value replies arrive, interactive cards appear on your phone. Tap 'Approve' or query your CRO with voice in real time.
            </p>
          </NexaCard>

          {/* Feature 3 */}
          <NexaCard variant="glass" padding="lg" className="space-y-4 border-l-4 border-l-[#7E22CE]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#7E22CE]/10 text-[#7E22CE] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[var(--nexa-text-primary)] text-display">
                  Tripwire Circuit Breakers
                </h3>
                <span className="text-xs text-[var(--nexa-text-muted)]">Zero Risk of Burned Domains</span>
              </div>
            </div>
            <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
              Domain health is paramount. If hard bounces breach 3%, the system automatically throttles the domain, triggers automated SES warmup schedules, and shifts outbound capacity to secondary verified inbox pools.
            </p>
          </NexaCard>

          {/* Feature 4 */}
          <NexaCard variant="glass" padding="lg" className="space-y-4 border-l-4 border-l-[#E3A008]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E3A008]/10 text-[#E3A008] flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[var(--nexa-text-primary)] text-display">
                  Model Gateway (BYOK)
                </h3>
                <span className="text-xs text-[var(--nexa-text-muted)]">OpenAI · Claude · Mistral · DeepSeek</span>
              </div>
            </div>
            <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
              Enjoy 100% price transparency. Plug your own LLM API keys directly into our model gateway to pay raw token costs at wholesale provider rates, with 0% markup on model inference.
            </p>
          </NexaCard>
        </div>
      </section>

      {/* Live 14-Agent Swarm Explorer */}
      <section id="agents" className="py-20 bg-[var(--nexa-bg-surface)]/40 border-y border-[var(--nexa-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <NexaBadge variant="brand">Autonomous Specialists</NexaBadge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-display text-[var(--nexa-text-primary)] mt-1">
                Explore the 14-Agent Swarm
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {["ALL", "EXECUTIVE", "INTELLIGENCE", "STRATEGY", "CONTENT", "OUTREACH"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveAgentCategory(cat)}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeAgentCategory === cat
                      ? "bg-[#1A56DB] text-white shadow-sm"
                      : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border border-[var(--nexa-border)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredAgents.map((agent) => (
              <NexaCard
                key={agent.key}
                variant="glass"
                padding="md"
                className="space-y-3 hover:border-[var(--nexa-border-strong)] transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-11 h-11 rounded-xl object-cover border border-[var(--nexa-border)] shadow-sm shrink-0"
                    />
                    <div>
                      <div className="font-bold text-xs text-[var(--nexa-text-primary)]">
                        {agent.name}
                      </div>
                      <div className="text-[10px] text-[#1A56DB] font-semibold">
                        {agent.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--nexa-text-secondary)] italic leading-relaxed">
                    "{agent.quote}"
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--nexa-border)] flex items-center justify-between text-[10px]">
                  <NexaBadge variant="neutral">{agent.category}</NexaBadge>
                  <span className="text-[#0E9F6E] font-bold font-mono">● ONLINE</span>
                </div>
              </NexaCard>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison: GTM AI Agency vs Traditional SDR Team */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-display text-[var(--nexa-text-primary)]">
            How We Compare to Traditional Outbound
          </h2>
          <p className="text-xs sm:text-sm text-[var(--nexa-text-secondary)]">
            Why leading B2B SaaS and enterprise providers choose autonomous swarm execution.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--nexa-border)] text-[var(--nexa-text-muted)] uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Capability</th>
                <th className="py-3 px-4 text-[#1A56DB] bg-[#1A56DB]/5 rounded-t-xl">
                  Ofia GTM Agents Swarm
                </th>
                <th className="py-3 px-4">Traditional 3-Person SDR Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-medium">
              <tr>
                <td className="py-4 px-4 font-bold">Monthly Operating Cost</td>
                <td className="py-4 px-4 font-black text-[#0E9F6E] bg-[#1A56DB]/5">$450 - $2,400 / mo</td>
                <td className="py-4 px-4 text-red-500 font-mono">$18,000+ / mo (Salaries + Benefits)</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-bold">Outreach Channels</td>
                <td className="py-4 px-4 bg-[#1A56DB]/5 text-[#1A56DB] font-bold">
                  Email (SES), WhatsApp, LinkedIn, Meta Ads
                </td>
                <td className="py-4 px-4 text-[var(--nexa-text-secondary)]">Cold Email Only</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-bold">Ramp Time / Onboarding</td>
                <td className="py-4 px-4 bg-[#1A56DB]/5 font-bold text-[#0E9F6E]">Under 10 Minutes</td>
                <td className="py-4 px-4 text-[var(--nexa-text-secondary)]">3 - 6 Months Hiring & Training</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-bold">Operating Hours</td>
                <td className="py-4 px-4 bg-[#1A56DB]/5 font-bold text-[#0E9F6E]">24/7/365 Continuous</td>
                <td className="py-4 px-4 text-[var(--nexa-text-secondary)]">8 Hours / Day (High Burnout)</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-bold">Domain Protection</td>
                <td className="py-4 px-4 bg-[#1A56DB]/5 font-bold text-[#0E9F6E]">Automatic Circuit Breakers & SES Pools</td>
                <td className="py-4 px-4 text-red-500">Manual monitoring (frequent burn)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Final Sales Closer Call-To-Action */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <NexaCard variant="glass" padding="lg" className="border-2 border-[#1A56DB] shadow-2xl text-center space-y-6 bg-gradient-to-b from-[#1A56DB]/10 to-transparent">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A56DB]/20 text-[#1A56DB] text-xs font-black">
            <Sparkles className="w-4 h-4" />
            Instant Provisioning Available
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-display text-[var(--nexa-text-primary)]">
            Ready to Generate $100K+ in Pipeline This Month?
          </h2>

          <p className="text-xs sm:text-sm text-[var(--nexa-text-secondary)] max-w-xl mx-auto leading-relaxed">
            Start your 14-day free trial. Deploy your 14 autonomous agents and launch your first synchronized campaign in under 10 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/signup">
              <NexaButton
                size="lg"
                variant="primary"
                className="w-full sm:w-auto font-black text-sm px-8 h-13 rounded-2xl shadow-xl shadow-[#1A56DB]/25"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start 14-Day Free Trial
              </NexaButton>
            </Link>
            <Link href="/contact">
              <NexaButton size="lg" variant="secondary" className="w-full sm:w-auto font-bold text-sm h-13 px-8 rounded-2xl">
                Book Strategy Consultation
              </NexaButton>
            </Link>
          </div>
        </NexaCard>
      </section>

      <PublicFooter />
    </div>
  );
}
