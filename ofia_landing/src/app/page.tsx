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
  CheckCircle2,
  Cpu,
  BarChart3,
  CreditCard,
  Sparkles,
  ChevronRight,
  Database,
  Radio,
  PhoneCall,
} from "lucide-react";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function Home() {
  const pillars = [
    {
      title: "Commerce & Storefronts",
      badge: "Pillar 01",
      desc: "10 industry-specific digital storefronts (.ofia.shop) with vertical workflows, instant online ordering, and milestone escrow.",
      icon: <Store className="w-6 h-6 text-blue-500" />,
      bg: "bg-blue-500/10",
      accent: "text-blue-500",
    },
    {
      title: "Enterprise ERP Suite",
      badge: "Pillar 02",
      desc: "Operations command, General Ledger, FIRS 7.5% VAT, 360 appraisals, offline-edge POS, and 4 persona portals.",
      icon: <Layers className="w-6 h-6 text-purple-500" />,
      bg: "bg-purple-500/10",
      accent: "text-purple-500",
    },
    {
      title: "Mobility & Transport OS",
      badge: "Pillar 03",
      desc: "White-label passenger mobility across Interstate, Shuttles, Charters, School, Staff, and universal driver cockpits.",
      icon: <Radio className="w-6 h-6 text-cyan-500" />,
      bg: "bg-cyan-500/10",
      accent: "text-cyan-500",
    },
    {
      title: "Logistics & Fulfillment",
      badge: "Pillar 04",
      desc: "Universal dispatch across 4 delivery job types, in-house & 3rd-party courier APIs, courier rider app, and waypoint GPS tracking.",
      icon: <Truck className="w-6 h-6 text-emerald-500" />,
      bg: "bg-emerald-500/10",
      accent: "text-emerald-500",
    },
    {
      title: "Ofia AI Voice Agent",
      badge: "Pillar 05",
      desc: "Autonomous telephone outreach and sales qualification engine. Connects through Voicebip direct Nigerian PSTN routes (+234) and Gemini intelligence to qualify B2B accounts, transcribe conversations, and sync outcomes into CRM.",
      icon: <PhoneCall className="w-6 h-6 text-amber-500" />,
      bg: "bg-amber-500/10",
      accent: "text-amber-500",
    },
  ];

  const stats = [
    { label: "Core Architecture", value: "5 Microservices", sub: "Go & Neon Lakebase Postgres" },
    { label: "Vertical Stores", value: "10 Industry Engines", sub: "Auto, Food, Fashion, Health & more" },
    { label: "Mobility & Transit", value: "6 Transport Lines", sub: "Interstate, Shuttle, Charter, Driver App" },
    { label: "Voice Intelligence", value: "Real-Time AI Voice Agent", sub: "Voicebip (+234) & CRM Sync" },
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
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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
            initial={{ opacity: 0, y: 55 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
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
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg sm:text-xl text-nexa-text-secondary max-w-3xl mx-auto mb-10 leading-relaxed font-normal"
          >
            Not a fragmented collection of disjointed apps. A unified multi-tenant ecosystem — custom storefront, ERP operations, autonomous Voice AI, logistics, and marketplace discovery — so you enter data once, and it coordinates everywhere.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {stats.map((s, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 45 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.48 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -2 }}
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. THE FIVE STRATEGIC PILLARS */}
      <section className="py-24 bg-[var(--nexa-bg-surface)] border-b border-[var(--nexa-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <NexaBadge variant="brand" size="md" dot className="mb-4">
                Five Strategic Pillars
              </NexaBadge>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl sm:text-5xl font-extrabold text-display text-[var(--nexa-text-primary)] mb-6"
            >
              The full spectrum of what Ofia delivers
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.75, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="text-base sm:text-lg text-nexa-text-secondary"
            >
              A unified operating system engineered specifically for Nigerian and West African commerce, transit, logistics, and enterprise scale.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {pillars.map((pillar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.75, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <NexaCard
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. UNIFIED ARCHITECTURE: "DATA ENTERS ONCE" */}
      <section className="py-24 bg-[var(--nexa-bg-base)] border-b border-[var(--nexa-border)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <NexaBadge variant="amber" size="md">
                  Cross-Module Synchronization
                </NexaBadge>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-3xl sm:text-4xl font-extrabold text-display text-[var(--nexa-text-primary)] leading-tight"
              >
                Enter your data once. <br />
                <span className="text-nexa-brand">It coordinates everywhere.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-base text-nexa-text-secondary leading-relaxed"
              >
                Most platforms force business owners to use five separate vendors: one for accounting, one for point of sale, one for delivery riders, and another for their website.
              </motion.p>
              <div className="space-y-4 pt-2">
                {[
                  {
                    title: "Inventory Syncs to Storefront & POS",
                    desc: "When a cashier sells an item at your physical shop, online stock drops instantly across your web store and central inventory ledger.",
                  },
                  {
                    title: "Automated Fleet & Waybill Dispatch",
                    desc: "Confirming an order generates a waybill and dispatches the closest rider with live GPS and proof-of-delivery.",
                  },
                  {
                    title: "Autonomous Voice Outreach & Qualification",
                    desc: "Authorize corporate sales outreach calls placed through Voicebip telecom lines with real-time objection handling, live transcripts, and instant CRM pipeline updates.",
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, delay: 0.25 + idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className="flex gap-4 items-start"
                  >
                    <div className="w-6 h-6 rounded-full bg-nexa-brand/10 text-nexa-brand flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[var(--nexa-text-primary)]">{item.title}</h4>
                      <p className="text-xs text-nexa-text-secondary leading-relaxed mt-1">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Architecture Card Diagram */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7"
            >
              <div className="liquid-glass p-8 sm:p-10 rounded-3xl border border-[var(--nexa-border)] shadow-xl relative">
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-between pb-6 border-b border-[var(--nexa-border)] mb-8"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono font-bold text-nexa-text-muted ml-2">tenant_runtime_matrix.json</span>
                  </div>
                  <NexaBadge variant="brand" size="sm">Single Tenant ID</NexaBadge>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {[
                    { title: "Ofia Shop", sub: "Direct Web Storefront", icon: <Store className="w-6 h-6 text-blue-500 mx-auto mb-2" /> },
                    { title: "Ofia ERP", sub: "POS & Staff Ledger", icon: <Layers className="w-6 h-6 text-emerald-500 mx-auto mb-2" /> },
                    { title: "Ofia Dispatch", sub: "Fleet & Waybill Routing", icon: <Truck className="w-6 h-6 text-amber-500 mx-auto mb-2" /> },
                  ].map((subCard, scIdx) => (
                    <motion.div
                      key={scIdx}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.65, delay: 0.2 + scIdx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ y: -3 }}
                      className="bg-[var(--nexa-bg-surface)] p-4 rounded-xl border border-[var(--nexa-border)] text-center transition-all"
                    >
                      {subCard.icon}
                      <p className="font-bold text-xs">{subCard.title}</p>
                      <p className="text-[10px] text-nexa-text-muted">{subCard.sub}</p>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-nexa-brand/5 border border-nexa-brand/20 p-5 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Cpu className="w-6 h-6 text-nexa-brand" />
                    <div>
                      <p className="text-xs font-bold text-[var(--nexa-text-primary)]">Unified Neon PostgreSQL Engine</p>
                      <p className="text-[10px] text-nexa-text-secondary">Instant cross-service communication with sub-second replication</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-nexa-brand text-white px-2.5 py-1 rounded-md">LIVE</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. FOUNDING OFFER BANNER */}
      <section className="py-20 bg-[var(--nexa-bg-surface)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 65, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A101D] text-white p-8 sm:p-14 overflow-hidden shadow-2xl border border-slate-700"
          >
            {/* Background circular accent */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 blur-[90px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-6"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Founding Cohort · Limited to First 500 Businesses</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.75, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="text-3xl sm:text-5xl font-extrabold text-display text-white mb-6 leading-tight"
              >
                Get full platform access for <span className="text-blue-400">₦5,000/mo</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 45 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.75, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed"
              >
                Join our founding cohort today. Lock in founder rates for life, get dedicated onboarding support, and deploy your business on Nigeria&apos;s fastest-growing enterprise infrastructure.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row gap-4"
              >
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
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
