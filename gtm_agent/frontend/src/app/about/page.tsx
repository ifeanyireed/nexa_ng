"use client";

import React from "react";
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
  Globe2,
  Users,
  Target,
  Layers,
  ArrowRight,
  TrendingUp,
  Lock,
  Workflow,
  CheckCircle2,
  Compass,
  TreePine,
} from "lucide-react";
import {
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandLinkedin,
  IconBrandOpenai,
} from "@tabler/icons-react";

export default function AboutPage() {
  const agents = [
    { key: "cro", name: "Sterling Vance", role: "Chief Revenue Officer", category: "Executive", avatar: "/avatar1.png", desc: "Sets macro revenue targets, monitors pipeline velocity, and synthesizes cross-channel conversion." },
    { key: "researcher", name: "Dr. Elena Rostova", role: "Market Researcher", category: "Intelligence", avatar: "/avatar2.png", desc: "Analyzes competitor movements, macroeconomic signals, and industry pricing shifts in real time." },
    { key: "lead_hunter", name: "Olivia Chen", role: "Lead Hunter", category: "Intelligence", avatar: "/avatar3.png", desc: "Extracts decision-maker verified emails, direct phone lines, and verified LinkedIn profiles." },
    { key: "gtm_strategist", name: "Marcus Aurel", role: "GTM Strategist", category: "Strategy", avatar: "/avatar4.png", desc: "Defines ICP personas, positioning narratives, and value-proposition framing for distinct target verticals." },
    { key: "content_strategist", name: "Maya Lin", role: "Content Strategist", category: "Content", avatar: "/avatar5.png", desc: "Structures high-value downloadable whitepapers, case studies, and visual teardown assets." },
    { key: "copywriter", name: "Julian Cross", role: "AI Copywriter", category: "Content", avatar: "/avatar6.png", desc: "Generates high-converting 3-line pattern-interrupt subject lines and localized message variations." },
    { key: "campaign_manager", name: "Devon Reed", role: "Campaign Manager", category: "Strategy", avatar: "/avatar7.png", desc: "Orchestrates multi-step sequence timings, timezone optimization, and warmup drops." },
    { key: "outreach_manager", name: "Noah Sterling", role: "Outreach Manager", category: "Outreach", avatar: "/avatar8.png", desc: "Dispatches personalized email drops through rotated, verified AWS SES domain inboxes." },
    { key: "whatsapp_manager", name: "Amara Obi", role: "WhatsApp Manager", category: "Outreach", avatar: "/avatar9.png", desc: "Engages warm B2B prospects via Meta Cloud WABA with interactive quick-reply templates." },
    { key: "creative_director", name: "Chloe Vane", role: "Creative Director", category: "Content", avatar: "/avatar10.png", desc: "Curates image assets, dynamic visual mockups, and UI preview carousels." },
    { key: "ads_strategist", name: "Kieran Patel", role: "Ads Strategist", category: "Strategy", avatar: "/avatar11.png", desc: "Monitors paid CAC and optimizes lookalike audiences across Meta and LinkedIn campaign pools." },
    { key: "analytics_manager", name: "Siddharth Rao", role: "Analytics Manager", category: "Intelligence", avatar: "/avatar12.png", desc: "Tracks blended pipeline attribution, domain bounce metrics, and closed revenue conversion." },
    { key: "growth_advisor", name: "Zara Thorne", role: "Growth Advisor", category: "Advisory", avatar: "/avatar13.png", desc: "Identifies ecosystem co-marketing opportunities and high-leverage strategic partnerships." },
    { key: "learning_agent", name: "Nexus Core", role: "Learning & Memory Agent", category: "Advisory", avatar: "/avatar14.png", desc: "Distills feedback from every sent message into continuous prompt calibration." },
  ];

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)]">
      <PublicNav />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] dark:bg-[#1A56DB]/20 border border-[#1A56DB]/30 text-xs font-bold">
          <Workflow className="w-3.5 h-3.5" />
          The "Ofia" Philosophy & Brand Story
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-display tracking-tight text-[var(--nexa-text-primary)]">
          Navigating Business Complexity. Cultivating <span className="text-[#1A56DB]">Hidden Potential</span>
        </h1>

        <p className="text-sm sm:text-base text-[var(--nexa-text-secondary)] max-w-3xl mx-auto leading-relaxed">
          In Nigerian tech, successful brands flip traditional meanings. In African tradition, the <em>Ofia</em> is not just a place of wild trees; it is a massive repository of untapped wealth, fertile soil, and hidden paths. The forest is only dangerous to those without a map or a machete.
        </p>
      </section>

      {/* Core Philosophical Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NexaCard variant="glass" padding="lg" className="space-y-4 border-t-4 border-t-red-500/80">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <TreePine className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-wider">The Hook / Problem</span>
              <h3 className="font-extrabold text-lg text-[var(--nexa-text-primary)] text-display">
                The Growth Jungle
              </h3>
            </div>
            <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
              Every founder starts with a vision, but as the business grows, it morphs into a jungle. Managing outreach, fragmented data, cold inboxes, and compliance can feel like being lost in a thick, unmapped forest. In the corporate world, <strong>chaos kills momentum</strong>.
            </p>
          </NexaCard>

          <NexaCard variant="glass" padding="lg" className="space-y-4 border-t-4 border-t-[#0E9F6E]">
            <div className="w-12 h-12 rounded-2xl bg-[#0E9F6E]/10 text-[#0E9F6E] flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#0E9F6E] uppercase tracking-wider">The Paradigm Shift</span>
              <h3 className="font-extrabold text-lg text-[var(--nexa-text-primary)] text-display">
                Untapped Wealth & Fertile Soil
              </h3>
            </div>
            <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
              We reject the fear of market complexity. The B2B terrain is rich with high-value enterprise accounts and hidden growth vectors. It is only treacherous if you enter without autonomous instruments and precision navigation.
            </p>
          </NexaCard>

          <NexaCard variant="glass" padding="lg" className="space-y-4 border-t-4 border-t-[#1A56DB]">
            <div className="w-12 h-12 rounded-2xl bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center">
              <Workflow className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#1A56DB] uppercase tracking-wider">The Solution</span>
              <h3 className="font-extrabold text-lg text-[var(--nexa-text-primary)] text-display">
                The Digital Machete & Compass
              </h3>
            </div>
            <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
              Ofia is the ultimate business navigation platform. We provide the <strong>digital machete</strong> that clears operational clutter, the <strong>compass</strong> that guides revenue decisions, and the <strong>fertile soil</strong> that feeds your scaling. We don't change the terrain; we give you the tools to conquer it.
            </p>
          </NexaCard>
        </div>
      </section>

      {/* 14-Agent Swarm Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-8">
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            The 14 Autonomous Specialists
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-display text-[var(--nexa-text-primary)]">
            Meet the Agents Powering Your Revenue Swarm
          </h2>
          <p className="text-xs text-[var(--nexa-text-secondary)]">
            Each agent possesses distinct reasoning models, tailored prompt constraints, and specialized autonomous execution loops.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => (
            <NexaCard
              key={agent.key}
              variant="glass"
              padding="md"
              className="space-y-3 hover:border-[var(--nexa-border-strong)] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[var(--nexa-border)] shadow-sm shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                      {agent.name}
                    </h3>
                    <div className="text-[11px] text-[#1A56DB] font-semibold">
                      {agent.role}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                  {agent.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--nexa-border)] flex items-center justify-between">
                <NexaBadge
                  variant={
                    agent.category === "Executive"
                      ? "brand"
                      : agent.category === "Intelligence"
                      ? "purple"
                      : agent.category === "Outreach"
                      ? "success"
                      : "neutral"
                  }
                >
                  {agent.category}
                </NexaBadge>
                <span className="text-[10px] font-mono text-[#0E9F6E] flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F6E] animate-pulse" />
                  ONLINE
                </span>
              </div>
            </NexaCard>
          ))}
        </div>
      </section>

      {/* Global Infrastructure & Security Standard */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <NexaCard variant="glass" padding="lg" className="border-2 border-[#0E9F6E]/30 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E9F6E]/10 text-[#0E9F6E] text-xs font-bold mb-2">
                <Globe2 className="w-3.5 h-3.5" />
                Enterprise Security & Reliability
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--nexa-text-primary)] text-display">
                Engineered for High-Scale Enterprise Deliverability
              </h2>
            </div>
            <Link href="/contact">
              <NexaButton size="md" variant="secondary" className="font-bold text-xs whitespace-nowrap">
                Request Security Whitepaper
              </NexaButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5">
              <div className="text-xs font-bold text-[var(--nexa-text-primary)]">AWS SES Integration</div>
              <div className="text-xs text-[var(--nexa-text-secondary)]">Dedicated IP pools with automated SPF, DKIM, and DMARC verification.</div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5">
              <div className="text-xs font-bold text-[var(--nexa-text-primary)]">Meta Cloud WABA</div>
              <div className="text-xs text-[var(--nexa-text-secondary)]">Official Meta WhatsApp Business Cloud API with high-throughput tier approval.</div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5">
              <div className="text-xs font-bold text-[var(--nexa-text-primary)]">SOC2 & 256-bit AES</div>
              <div className="text-xs text-[var(--nexa-text-secondary)]">All tenant data, credentials, and API keys are stored encrypted at rest and in transit.</div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5">
              <div className="text-xs font-bold text-[var(--nexa-text-primary)]">Telegram Webhooks</div>
              <div className="text-xs text-[var(--nexa-text-secondary)]">Instant encrypted callback webhooks delivering mobile approvals under 120ms.</div>
            </div>
          </div>
        </NexaCard>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--nexa-text-primary)] text-display">
          Ready to Conquer Your Market Terrain?
        </h2>
        <p className="text-xs sm:text-sm text-[var(--nexa-text-secondary)] max-w-xl mx-auto">
          Equip your business with the digital machete and compass. Start your 14-day free trial, meet your 14 autonomous specialists, and cultivate enterprise revenue.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/signup">
            <NexaButton size="lg" variant="primary" className="font-extrabold text-sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start 14-Day Free Trial
            </NexaButton>
          </Link>
          <Link href="/pricing">
            <NexaButton size="lg" variant="secondary" className="font-bold text-sm">
              View All Tiers
            </NexaButton>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
