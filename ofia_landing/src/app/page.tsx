"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Store,
  Layers,
  Bot,
  Truck,
  Building2,
  Users,
  Compass,
  CheckCircle2,
  Cpu,
  BarChart3,
  CreditCard,
  Sparkles,
  ChevronRight,
  Database,
  Radio,
} from "lucide-react";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function Home() {
  const pillars = [
    {
      title: "Establish",
      badge: "Presence",
      desc: "Instantly launch your brand online with a custom digital storefront (.ofia.shop) and a verified discoverable profile on Ofia Compass.",
      icon: <Store className="w-6 h-6 text-blue-500" />,
      bg: "bg-blue-500/10",
      accent: "text-blue-500",
    },
    {
      title: "Operate",
      badge: "Core ERP",
      desc: "Run retail POS, multi-location inventory, staff directories, attendance, and chart-of-accounts bookkeeping with offline edge-sync resilience.",
      icon: <Layers className="w-6 h-6 text-emerald-500" />,
      bg: "bg-emerald-500/10",
      accent: "text-emerald-500",
    },
    {
      title: "Sell & Connect",
      badge: "Commerce",
      desc: "Manage catalogs, take Paystack payments, book field technicians, and dispatch shipments with automated rider tracking and escrow.",
      icon: <Truck className="w-6 h-6 text-amber-500" />,
      bg: "bg-amber-500/10",
      accent: "text-amber-500",
    },
    {
      title: "Grow",
      badge: "Autonomous AI",
      desc: "Deploy a 15-agent AI swarm that qualifies leads 24/7 across WhatsApp & email, drafts campaigns, and runs automated customer follow-ups.",
      icon: <Bot className="w-6 h-6 text-purple-500" />,
      bg: "bg-purple-500/10",
      accent: "text-purple-500",
    },
  ];

  const stats = [
    { label: "Architecture", value: "5 Microservices", sub: "Go & Neon Postgres" },
    { label: "Offline First", value: "100% Edge Sync", sub: "Never lose a sale in transit" },
    { label: "Autonomous AI", value: "15 Specialized Agents", sub: "Continuous 24/7 Outreach" },
    { label: "Dispatch Fleet", value: "36 States", sub: "Real-time Waybill tracking" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden border-b border-[var(--nexa-border)]">
        {/* Glowing atmospheric backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-nexa-brand/15 via-blue-500/10 to-transparent blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <div className="liquid-glass px-4 py-1.5 rounded-full flex items-center gap-2 border border-nexa-brand/30 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-nexa-brand animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-nexa-brand">
                Master Operating System · 2026 Edition
              </span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-display tracking-tight text-[var(--nexa-text-primary)] mb-8 leading-[1.08] max-w-5xl mx-auto"
          >
            The Operating System <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-nexa-brand to-blue-400">
              Nigerian Businesses
            </span>{" "}
            Run On.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-lg sm:text-xl text-nexa-text-secondary max-w-3xl mx-auto mb-10 leading-relaxed font-normal"
          >
            Not a fragmented collection of disjointed apps. A unified multi-tenant ecosystem — custom storefront, ERP operations, autonomous AI, logistics, and marketplace discovery — so you enter data once, and it coordinates everywhere.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/pricing" className="w-full sm:w-auto">
              <NexaButton size="xl" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />} className="w-full sm:w-auto shadow-lg shadow-blue-500/20">
                Claim Founding Offer (₦5,000/mo)
              </NexaButton>
            </Link>
            <Link href="/products" className="w-full sm:w-auto">
              <NexaButton size="xl" variant="secondary" className="w-full sm:w-auto">
                Explore the 12 Products
              </NexaButton>
            </Link>
          </motion.div>

          {/* KPI Ticker in Liquid Glass */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto"
          >
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="liquid-glass p-5 rounded-2xl border border-[var(--nexa-border)] text-left hover:border-nexa-brand/40 transition-all duration-200"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-nexa-text-muted mb-1">
                  {s.label}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-display text-[var(--nexa-text-primary)] mb-1">
                  {s.value}
                </p>
                <p className="text-xs text-nexa-text-secondary font-medium truncate">
                  {s.sub}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. THE FOUR PILLARS */}
      <section className="py-24 bg-[var(--nexa-bg-surface)] border-b border-[var(--nexa-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <NexaBadge variant="brand" size="md" dot className="mb-4">
              End-to-End Capabilities
            </NexaBadge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-display text-[var(--nexa-text-primary)] mb-6">
              What Ofia does for an African business
            </h2>
            <p className="text-base sm:text-lg text-nexa-text-secondary">
              Everything required to establish credibility, streamline day-to-day work, sell with trust, and scale aggressively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, i) => (
              <NexaCard
                key={i}
                variant="interactive"
                padding="lg"
                className="flex flex-col h-full group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${pillar.bg}`}>
                    {pillar.icon}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${pillar.accent}`}>
                    {pillar.badge}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-display text-[var(--nexa-text-primary)] mb-3">
                  {pillar.title}
                </h3>
                <p className="text-sm text-nexa-text-secondary leading-relaxed flex-1">
                  {pillar.desc}
                </p>
              </NexaCard>
            ))}
          </div>
        </div>
      </section>

      {/* 3. UNIFIED ARCHITECTURE: "DATA ENTERS ONCE" */}
      <section className="py-24 bg-[var(--nexa-bg-base)] border-b border-[var(--nexa-border)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <NexaBadge variant="amber" size="md">
                Cross-Module Synchronization
              </NexaBadge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-display text-[var(--nexa-text-primary)] leading-tight">
                Enter your data once. <br />
                <span className="text-nexa-brand">It coordinates everywhere.</span>
              </h2>
              <p className="text-base text-nexa-text-secondary leading-relaxed">
                Most platforms force business owners to use five separate vendors: one for accounting, one for point of sale, one for delivery riders, and another for their website.
              </p>
              <div className="space-y-4 pt-2">
                {[
                  {
                    title: "Inventory Syncs to Storefront & POS",
                    desc: "When a cashier sells an item at your physical shop, online stock drops instantly across your web store and Compass.",
                  },
                  {
                    title: "Automated Fleet & Waybill Dispatch",
                    desc: "Confirming an order generates a waybill and dispatches the closest rider with live GPS and proof-of-delivery.",
                  },
                  {
                    title: "Autonomous Lead Re-engagement",
                    desc: "Unclosed chat inquiries automatically trigger your AI GTM Swarm to follow up on WhatsApp with personalized product links.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-full bg-nexa-brand/10 text-nexa-brand flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[var(--nexa-text-primary)]">{item.title}</h4>
                      <p className="text-xs text-nexa-text-secondary leading-relaxed mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Card Diagram */}
            <div className="lg:col-span-7">
              <div className="liquid-glass p-8 sm:p-10 rounded-3xl border border-[var(--nexa-border)] shadow-xl relative">
                <div className="flex items-center justify-between pb-6 border-b border-[var(--nexa-border)] mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono font-bold text-nexa-text-muted ml-2">tenant_runtime_matrix.json</span>
                  </div>
                  <NexaBadge variant="brand" size="sm">Single Tenant ID</NexaBadge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[var(--nexa-bg-surface)] p-4 rounded-xl border border-[var(--nexa-border)] text-center">
                    <Store className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="font-bold text-xs">Ofia Shop</p>
                    <p className="text-[10px] text-nexa-text-muted">Direct Web Storefront</p>
                  </div>
                  <div className="bg-[var(--nexa-bg-surface)] p-4 rounded-xl border border-[var(--nexa-border)] text-center">
                    <Layers className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-xs">Ofia ERP</p>
                    <p className="text-[10px] text-nexa-text-muted">POS &amp; Staff Ledger</p>
                  </div>
                  <div className="bg-[var(--nexa-bg-surface)] p-4 rounded-xl border border-[var(--nexa-border)] text-center">
                    <Compass className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                    <p className="font-bold text-xs">Ofia Compass</p>
                    <p className="text-[10px] text-nexa-text-muted">Marketplace Discovery</p>
                  </div>
                </div>

                <div className="bg-nexa-brand/5 border border-nexa-brand/20 p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-6 h-6 text-nexa-brand" />
                    <div>
                      <p className="text-xs font-bold text-[var(--nexa-text-primary)]">Unified Neon PostgreSQL Engine</p>
                      <p className="text-[10px] text-nexa-text-secondary">Instant cross-service communication with sub-second replication</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-nexa-brand text-white px-2.5 py-1 rounded-md">LIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOUNDING OFFER BANNER */}
      <section className="py-20 bg-[var(--nexa-bg-surface)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A101D] text-white p-8 sm:p-14 overflow-hidden shadow-2xl border border-slate-700">
            {/* Background circular accent */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 blur-[90px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Founding Cohort · Limited to First 500 Businesses</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-display text-white mb-6 leading-tight">
                Get full platform access for <span className="text-blue-400">₦5,000/mo</span>
              </h2>
              <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
                Join our founding cohort today. Lock in founder rates for life, get dedicated onboarding support, and deploy your business on Nigeria&apos;s fastest-growing enterprise infrastructure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/pricing">
                  <NexaButton size="lg" variant="primary" className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl">
                    Claim Founding Plan Now
                  </NexaButton>
                </Link>
                <Link href="/products">
                  <NexaButton size="lg" variant="white">
                    Read Product Documentation
                  </NexaButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
