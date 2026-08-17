"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaModal } from "@/components/nexa/NexaModal";
import { NexaInput } from "@/components/nexa/NexaInput";
import {
  Check,
  Zap,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Cpu,
  Layers,
  PhoneCall,
  DollarSign,
  Lock,
} from "lucide-react";
import {
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandLinkedin,
  IconBrandOpenai,
} from "@tabler/icons-react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [leadSlider, setLeadSlider] = useState<number>(5000);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({ name: "", email: "", company: "", size: "10-50" });
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const discountMultiplier = billingCycle === "annual" ? 0.8 : 1.0;

  const tiers = [
    {
      id: "FREE_TRIAL",
      name: "Free Trial",
      tagline: "Explore the navigation tools with zero commitment",
      monthlyPrice: 0,
      badge: "14 Days",
      badgeVariant: "neutral" as const,
      popular: false,
      leads: "100 Enriched Leads",
      campaigns: "1 Active Campaign",
      seats: "1 Team Seat",
      dailyEmails: "50 emails / day",
      channels: ["Email Outreach (SES)"],
      features: [
        "Full access to all 14 Autonomous AI Specialists",
        "Lead Hunter extraction & basic email enrichment",
        "Digital Machete automated campaign sequences",
        "Community Slack & Comprehensive Documentation",
      ],
      missingFeatures: [
        "Telegram CRO Real-time Bot",
        "WhatsApp Business Cloud API",
        "LinkedIn Auto Connect & InMail",
        "Bring Your Own API Keys (BYOK)",
        "Priority 24/7 SLA Support",
      ],
      ctaText: "Start Free 14-Day Trial",
      ctaHref: "/signup?plan=FREE_TRIAL",
    },
    {
      id: "STARTER",
      name: "Starter Swarm",
      tagline: "Clear operational clutter and navigate boutique outreach",
      monthlyPrice: 450,
      badge: "Founder Essential",
      badgeVariant: "brand" as const,
      popular: false,
      leads: "1,000 Verified Leads / mo",
      campaigns: "3 Active Campaigns",
      seats: "3 Team Seats",
      dailyEmails: "250 emails / day",
      channels: ["Email (SES)", "WhatsApp Business (WABA)"],
      features: [
        "All 14 Autonomous Revenue Agents",
        "WhatsApp Cloud API automated conversations",
        "Weekly GTM Strategy synthesis & market mapping",
        "Tripwire Circuit Breaker bounce protection (<3%)",
        "Standard Email & Telegram Support",
      ],
      missingFeatures: [
        "Telegram CRO Mobile Control Bot",
        "LinkedIn Autonomous Outreach",
        "Meta Lookalike Ad Campaign Automation",
        "Dedicated Account Strategist",
      ],
      ctaText: "Deploy Starter Swarm",
      ctaHref: "/signup?plan=STARTER",
    },
    {
      id: "GROWTH",
      name: "Growth Swarm",
      tagline: "Slash through friction and dominate multi-channel terrain",
      monthlyPrice: 1200,
      badge: "High ROI Pick",
      badgeVariant: "brand" as const,
      popular: false,
      leads: "5,000 Verified Leads / mo",
      campaigns: "10 Active Campaigns",
      seats: "8 Team Seats",
      dailyEmails: "1,000 emails / day",
      channels: ["Email (SES)", "WhatsApp", "LinkedIn Messaging"],
      features: [
        "Revenue Compass: Telegram CRO with 1-Click Approvals",
        "LinkedIn Automated Prospecting & InMail",
        "Multi-domain AWS SES Inbox Rotation & Warmup",
        "Lead Hunter Deep Apollo & Crunchbase Enrichment",
        "Fertile Ground: BYOK Model Gateway (Claude & GPT-4o)",
        "Monthly AI Strategy Review with Growth Lead",
      ],
      missingFeatures: [
        "Meta Ads Autonomous Budget Optimizer",
        "Dedicated Custom Agent Fine-Tuning",
      ],
      ctaText: "Deploy Growth Swarm",
      ctaHref: "/signup?plan=GROWTH",
    },
    {
      id: "SCALE",
      name: "Scale Dominance",
      tagline: "Aggressive market conquest for 8-figure revenue teams",
      monthlyPrice: 2400,
      badge: "Most Popular",
      badgeVariant: "purple" as const,
      popular: true,
      leads: "20,000 Verified Leads / mo",
      campaigns: "25 Active Campaigns",
      seats: "20 Team Seats",
      dailyEmails: "4,000 emails / day",
      channels: ["Email (SES)", "WhatsApp (WABA)", "LinkedIn", "Meta Ads"],
      features: [
        "Full 14-Agent Synchronized Execution Swarm",
        "Meta Lookalike Ad Audiences & Creative Director Sync",
        "Dedicated SES Multi-Region IP Warmup Pools",
        "Continuous Autonomous Learning & Persona Calibration",
        "Custom Lead Scraping Webhooks & Database Sync",
        "24/7 Dedicated Slack Channel & Strategy Architect",
      ],
      missingFeatures: [
        "Bespoke On-Premises Isolated LLM Clusters",
      ],
      ctaText: "Deploy Scale Dominance",
      ctaHref: "/signup?plan=SCALE",
    },
    {
      id: "ENTERPRISE",
      name: "Custom Enterprise",
      tagline: "Dedicated navigation architecture & bespoke agent swarms",
      monthlyPrice: 5000,
      badge: "Full Custom",
      badgeVariant: "brand" as const,
      popular: false,
      leads: "Unlimited Enriched Leads",
      campaigns: "Unlimited Concurrent Campaigns",
      seats: "Unlimited Team Seats",
      dailyEmails: "Unlimited via Dedicated SES Cluster",
      channels: ["All Channels + Custom CRM Integrations"],
      features: [
        "Custom Fine-Tuned Local LLM Deployment (Mistral / Llama)",
        "Full Salesforce / HubSpot Bidirectional Pipeline Sync",
        "Dedicated VPC Instance & Custom Security SLA",
        "Custom Scraping Scanners for Proprietary Verticals",
        "Quarterly On-Site Growth Strategy & Swarm Calibration",
        "Dedicated Technical Account Manager & SLA < 15min",
      ],
      missingFeatures: [],
      ctaText: "Contact Enterprise Sales",
      ctaHref: "#demo-modal",
      isModalTrigger: true,
    },
  ];

  // ROI Calculator Math
  const calculatedSent = leadSlider;
  const calculatedReplies = Math.round(leadSlider * 0.082); // 8.2% avg reply rate
  const calculatedMeetings = Math.round(calculatedReplies * 0.28); // 28% meeting conversion
  const calculatedPipelineUSD = calculatedMeetings * 18500; // $18.5k avg deal pipeline value

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
    setTimeout(() => {
      setIsDemoModalOpen(false);
      setDemoSubmitted(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)]">
      <PublicNav />

      {/* Hero Header */}
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] dark:bg-[#1A56DB]/20 border border-[#1A56DB]/30 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          Autonomous Navigation Instruments & Tiers
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-display tracking-tight text-[var(--nexa-text-primary)]">
          Predictable Pricing to <br />
          <span className="text-[#1A56DB]">Conquer Business Complexity</span>
        </h1>

        <p className="text-sm sm:text-base text-[var(--nexa-text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Equip your company with the digital machete and compass. Clear operational clutter, navigate enterprise sales cycles, and cultivate compound pipeline growth.
        </p>

        {/* Billing Cycle Switcher */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <div className="p-1 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] inline-flex items-center">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] shadow-sm"
                  : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-[#1A56DB] text-white shadow-sm"
                  : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#0E9F6E] text-white">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-4 items-stretch">
          {tiers.map((tier) => {
            const finalPrice = Math.round(tier.monthlyPrice * discountMultiplier);
            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl p-5 flex flex-col justify-between transition-all ${
                  tier.popular
                    ? "bg-[var(--nexa-bg-surface)] border-2 border-[#1A56DB] shadow-xl shadow-[#1A56DB]/10 scale-[1.02] z-10"
                    : "bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-[var(--nexa-border-strong)]"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-[#1A56DB] text-white uppercase tracking-wider shadow-sm">
                    Most Popular Swarm
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-base text-[var(--nexa-text-primary)] text-display">
                        {tier.name}
                      </h3>
                      <NexaBadge variant={tier.badgeVariant}>{tier.badge}</NexaBadge>
                    </div>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] mt-1 line-clamp-2">
                      {tier.tagline}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="py-2 border-y border-[var(--nexa-border)]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black font-mono text-[var(--nexa-text-primary)]">
                        ${finalPrice}
                      </span>
                      <span className="text-xs text-[var(--nexa-text-muted)] font-medium">/ month</span>
                    </div>
                    {billingCycle === "annual" && tier.monthlyPrice > 0 && (
                      <div className="text-[10px] text-[#0E9F6E] font-semibold mt-0.5">
                        Billed annually (${finalPrice * 12}/yr)
                      </div>
                    )}
                  </div>

                  {/* Quotas Pill Specs */}
                  <div className="space-y-1.5 text-xs font-medium text-[var(--nexa-text-secondary)]">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1A56DB]" />
                      <span>{tier.leads}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F6E]" />
                      <span>{tier.campaigns}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7E22CE]" />
                      <span>{tier.seats}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E3A008]" />
                      <span>{tier.dailyEmails}</span>
                    </div>
                  </div>

                  {/* Included Channels */}
                  <div className="pt-2 border-t border-[var(--nexa-border)] space-y-1">
                    <div className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)] tracking-wider">
                      Channels Active
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tier.channels.map((ch) => (
                        <span
                          key={ch}
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)]"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
                    <div className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)] tracking-wider">
                      What's Included
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-[var(--nexa-text-secondary)]">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#0E9F6E] shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Action */}
                <div className="pt-6">
                  {tier.isModalTrigger ? (
                    <NexaButton
                      size="md"
                      variant={tier.popular ? "primary" : "secondary"}
                      onClick={() => setIsDemoModalOpen(true)}
                      className="w-full font-bold text-xs"
                      rightIcon={<PhoneCall className="w-3.5 h-3.5" />}
                    >
                      {tier.ctaText}
                    </NexaButton>
                  ) : (
                    <Link href={tier.ctaHref} className="block w-full">
                      <NexaButton
                        size="md"
                        variant={tier.popular ? "primary" : "secondary"}
                        className="w-full font-bold text-xs"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        {tier.ctaText}
                      </NexaButton>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive ROI & Pipeline Calculator */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <NexaCard variant="glass" padding="lg" className="border-2 border-[#1A56DB]/30 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Slider Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E9F6E]/10 text-[#0E9F6E] text-xs font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                Live Revenue Simulator
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--nexa-text-primary)] text-display">
                Estimate Your Monthly Pipeline Attributed to the Swarm
              </h2>
              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Drag the lead volume slider to simulate meeting volume, positive reply rates, and attributed enterprise revenue pipeline generated by our 14 autonomous agents.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Monthly Lead Prospecting Volume</span>
                  <span className="font-mono text-[#1A56DB] text-base">{leadSlider.toLocaleString()} Leads / mo</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={50000}
                  step={500}
                  value={leadSlider}
                  onChange={(e) => setLeadSlider(Number(e.target.value))}
                  className="w-full h-2.5 bg-[var(--nexa-bg-base)] rounded-lg appearance-none cursor-pointer accent-[#1A56DB]"
                />
                <div className="flex items-center justify-between text-[10px] text-[var(--nexa-text-muted)] font-mono">
                  <span>500 Leads (Starter)</span>
                  <span>10,000 Leads (Growth)</span>
                  <span>50,000 Leads (Enterprise)</span>
                </div>
              </div>
            </div>

            {/* Right Output Scorecard */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-4">
              <div className="text-xs font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider">
                Simulated 30-Day Output
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)]">
                  <div className="text-[10px] text-[var(--nexa-text-muted)]">Positive Replies (8.2%)</div>
                  <div className="text-xl font-black font-mono text-[#1A56DB] mt-1">
                    ~{calculatedReplies.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)]">
                  <div className="text-[10px] text-[var(--nexa-text-muted)]">Booked Demos (28%)</div>
                  <div className="text-xl font-black font-mono text-[#0E9F6E] mt-1">
                    ~{calculatedMeetings.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1A56DB]/10 border border-[#1A56DB]/30 space-y-1">
                <div className="text-xs font-bold text-[#1A56DB]">Projected Attributed Pipeline</div>
                <div className="text-3xl font-black font-mono text-[var(--nexa-text-primary)]">
                  ${calculatedPipelineUSD.toLocaleString()}
                </div>
                <div className="text-[10px] text-[var(--nexa-text-muted)]">
                  Based on a conservative $18,500 enterprise ACV deal size.
                </div>
              </div>

              <Link href={`/signup?leads=${leadSlider}`} className="block">
                <NexaButton size="md" variant="primary" className="w-full font-extrabold text-xs" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Lock in This Capacity Now
                </NexaButton>
              </Link>
            </div>
          </div>
        </NexaCard>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-display text-[var(--nexa-text-primary)]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[var(--nexa-text-secondary)]">
            Everything you need to know about our autonomous swarm infrastructure.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "How does the Telegram CRO Bot approval mechanism work?",
              a: "Whenever Julian Cross (AI Copywriter) or Noah Sterling (Outreach Manager) prepares a batch of high-stakes outreach or changes ad budgets, an interactive card is sent directly to your Telegram bot. You tap 'Approve' or 'Revise' in 1 click right from your phone.",
            },
            {
              q: "What is Bring Your Own Key (BYOK) and how does it save costs?",
              a: "BYOK allows you to plug your own OpenAI, Anthropic, Mistral, or DeepSeek API keys directly into our Model Gateway. You pay raw token costs at wholesale provider rates, with 0% markup from us on LLM execution.",
            },
            {
              q: "How do you protect our sender reputation and domain health?",
              a: "Our system includes built-in Circuit Breakers. If bounce rates exceed 3% or spam complaints trigger, the system automatically pauses that domain, engages automated warmup sequences via AWS SES, and shifts capacity to alternate verified pool inboxes.",
            },
            {
              q: "Can I upgrade, downgrade, or cancel at any time?",
              a: "Yes! There are no long-term contracts. You can upgrade between Starter, Growth, and Scale whenever your outreach volume increases, or cancel anytime from your Workspace Settings.",
            },
          ].map((faq, idx) => (
            <NexaCard key={idx} variant="glass" padding="md" className="space-y-2">
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#1A56DB] shrink-0" />
                {faq.q}
              </h3>
              <p className="text-xs text-[var(--nexa-text-secondary)] pl-6 leading-relaxed">
                {faq.a}
              </p>
            </NexaCard>
          ))}
        </div>
      </section>

      {/* Enterprise Consultation Modal */}
      <NexaModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        title="Schedule Enterprise Swarm Consultation"
      >
        {demoSubmitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#0E9F6E]/20 text-[#0E9F6E] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--nexa-text-primary)]">
              Consultation Request Received
            </h3>
            <p className="text-xs text-[var(--nexa-text-muted)] max-w-sm mx-auto">
              Our Chief Revenue Officer and Enterprise Solutions team will contact you within 2 business hours with a custom SLA proposal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleDemoSubmit} className="space-y-4">
            <p className="text-xs text-[var(--nexa-text-muted)]">
              Speak with our senior GTM engineers to tailor a private swarm cluster, custom LLM fine-tuning, and dedicated multi-channel orchestration.
            </p>
            <NexaInput
              label="Full Name"
              required
              placeholder="e.g. Adebayo Ogunlesi"
              value={demoForm.name}
              onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
            />
            <NexaInput
              label="Work Email"
              type="email"
              required
              placeholder="adebayo@enterprise.com"
              value={demoForm.email}
              onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <NexaInput
                label="Company Name"
                required
                placeholder="Enterprise Inc."
                value={demoForm.company}
                onChange={(e) => setDemoForm({ ...demoForm, company: e.target.value })}
              />
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--nexa-text-secondary)]">Team Size</label>
                <select
                  value={demoForm.size}
                  onChange={(e) => setDemoForm({ ...demoForm, size: e.target.value })}
                  className="w-full h-11 px-3 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none"
                >
                  <option value="10-50">10 - 50 Employees</option>
                  <option value="50-250">50 - 250 Employees</option>
                  <option value="250-1000">250 - 1,000 Employees</option>
                  <option value="1000+">1,000+ Employees</option>
                </select>
              </div>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <NexaButton type="button" variant="ghost" size="sm" onClick={() => setIsDemoModalOpen(false)}>
                Cancel
              </NexaButton>
              <NexaButton type="submit" variant="primary" size="md" className="font-extrabold text-xs">
                Request VIP Consultation
              </NexaButton>
            </div>
          </form>
        )}
      </NexaModal>

      <PublicFooter />
    </div>
  );
}
