"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Truck,
  Building2,
  Store,
  CreditCard,
  PhoneCall,
  Zap,
  Smartphone,
  Navigation,
  Radio,
  ArrowRight,
} from "lucide-react";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const plans = [
    {
      id: "entry",
      name: "Entry Plan",
      badge: "Founding Offer",
      badgeVariant: "emerald" as const,
      monthlyPrice: 5000,
      annualPricePerMonth: 4000,
      annualBilledTotal: 48000,
      note: "Founding-offer pricing for the first 500 businesses.",
      features: [
        "Custom branded online shop (.ofia.shop)",
        "Mobile-optimized catalog & WhatsApp checkout",
        "Core ERP sales & inventory dashboard",
        "Single cashier register & POS mobile mode",
        "Integrated escrow checkout protection",
        "Standard WhatsApp community support",
      ],
      cta: "Claim Founding Offer",
      popular: false,
    },
    {
      id: "sme",
      name: "SME Plan",
      badge: "Most Popular",
      badgeVariant: "brand" as const,
      monthlyPrice: 25000,
      annualPricePerMonth: 20000,
      annualBilledTotal: 240000,
      note: "Full digital storefront + operational modules for active retail & trade teams.",
      features: [
        "Everything in Entry plan",
        "Custom domain support (yourbrand.com / .ng)",
        "Advanced inventory, purchase orders & barcode generator",
        "Automated accounting, P&L, VAT & expense logs",
        "Autonomous AI marketing assistant & WhatsApp bot",
        "Priority SEO indexing & custom search metadata",
        "Up to 5 staff accounts with custom permission gates",
        "Direct nationwide courier & fleet dispatch",
      ],
      cta: "Start 14-Day Free Trial",
      popular: true,
    },
    {
      id: "growth",
      name: "Growth Plan",
      badge: "Multi-Location",
      badgeVariant: "purple" as const,
      monthlyPrice: 75000,
      annualPricePerMonth: 60000,
      annualBilledTotal: 720000,
      note: "Complete operational horsepower for multi-branch retailers and distributors.",
      features: [
        "Everything in SME plan",
        "Multi-warehouse & multi-branch ledger consolidation",
        "Full HR, employee shift management & payroll slips",
        "Advanced customer retention & predictive analytics",
        "Custom API & webhook developer access",
        "Dedicated Account Manager & VIP phone support",
        "Unlimited staff accounts & unlimited POS registers",
        "Quarterly business review & inventory audit support",
      ],
      cta: "Scale with Growth",
      popular: false,
    },
  ];

  const mobileApps = [
    {
      id: "customer-app",
      name: "Ofia Customer Mobile App",
      badge: "iOS & Android",
      badgeVariant: "emerald" as const,
      category: "Mobile Commerce",
      pricingTag: "Included in Storefronts",
      desc: "Native shopping & on-demand logistics for consumers. Browse local storefronts (.ofia.shop), order products, book independent parcel dispatch, and track orders with live map telemetry.",
      features: [
        "Multi-merchant storefront discovery & cart checkout",
        "Standalone last-mile dispatch booking (no store purchase needed)",
        "Real-time GPS parcel map tracking with dynamic status island",
        "Integrated escrow checkout protection & digital receipts",
      ],
      icon: <Smartphone className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-500/10",
      borderHover: "hover:border-emerald-500/40",
    },
    {
      id: "mobility-app",
      name: "Ofia Passenger Mobility App",
      badge: "White-Label Ready",
      badgeVariant: "brand" as const,
      category: "Passenger Mobility",
      pricingTag: "Transport OS Suite",
      desc: "Turnkey passenger booking app for transport operators, shuttles, and schools. Passengers book interstate coaches, reserve shuttle seats, plan charters, and track school buses.",
      features: [
        "Interactive seat selection maps & instant QR boarding pass",
        "Live vehicle telemetry & arrival time tracking on map",
        "Integrated passenger digital fare wallet with saved cards",
        "Emergency SOS triggers & verified guardian school tracking",
      ],
      icon: <Navigation className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-500/10",
      borderHover: "hover:border-blue-500/40",
    },
    {
      id: "driver-app",
      name: "Ofia Universal Driver App",
      badge: "Universal Cockpit",
      badgeVariant: "purple" as const,
      category: "Driver Operations",
      pricingTag: "Fleet Ops Add-On",
      desc: "Unified driver cockpit across all transit operations: interstate routes, intra-city shuttles, school routes, charters, and staff commutes with passenger manifests.",
      features: [
        "Digital passenger manifest with instant QR scan check-in",
        "Turn-by-turn route navigation with assigned stop sequences",
        "Daily pre-trip digital vehicle safety inspection checklist",
        "Driver trip earnings wallet, performance rating & payouts",
      ],
      icon: <Radio className="w-5 h-5 text-purple-600" />,
      bg: "bg-purple-500/10",
      borderHover: "hover:border-purple-500/40",
    },
    {
      id: "rider-app",
      name: "Courier Rider Mobile App",
      badge: "Logistics Native",
      badgeVariant: "amber" as const,
      category: "Logistics & Couriers",
      pricingTag: "Dispatch Module",
      desc: "Dedicated mobile tool for motorcycle, van, and haulage delivery couriers. Accepts broadcast delivery job offers across store orders, vendor dispatch, and customer shipments.",
      features: [
        "Real-time broadcast dispatch job offers with distance & fare preview",
        "Optimized pickup & drop-off waypoint turn-by-turn navigation",
        "Recipient OTP verification for zero-dispute proof-of-delivery",
        "Instant wallet payouts & daily delivery performance metrics",
      ],
      icon: <Truck className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-500/10",
      borderHover: "hover:border-amber-500/40",
    },
  ];

  const faqs = [
    {
      q: "What is included in the Founding-Offer price?",
      a: "The Entry Plan is locked in at ₦5,000/month for the lifetime of your continuous active subscription as part of our initial 500 merchant cohort. You get full access to your dedicated storefront, omnichannel POS, and foundational ERP dashboard.",
    },
    {
      q: "Can I upgrade or downgrade between plans at any time?",
      a: "Yes. You can switch your tier at any moment through your Ofia Merchant App or Billing Dashboard. Unused balances are automatically prorated and credited to your new invoice.",
    },
    {
      q: "Do I need separate bank accounts or payment gateways?",
      a: "No! Ofia Payments comes pre-integrated. You can instantly accept direct bank transfers via automated virtual accounts, debit cards, USSD, and scan-to-pay QR codes. Funds settle automatically into your registered commercial bank account.",
    },
    {
      q: "How does the annual discount work?",
      a: "When you pay annually upfront, you receive two full months free (a 20% discount across all tiers). We also assign an onboarding specialist to help upload your product catalog and train your floor staff.",
    },
    {
      q: "How does Ofia protect against courier delivery fraud?",
      a: "Every transaction through Ofia Shops can be backed by Ofia Escrow. The customer funds are held safely until our integrated courier collects the OTP from the buyer upon delivery.",
    },
    {
      q: "Can I white-label the mobile applications under my own business brand?",
      a: "Yes. Our Flutter mobile applications (Ofia Passenger Mobility, Ofia Universal Driver, Ofia Customer, and Courier Rider) are architected on a multi-tenant engine. You can customize app branding, logos, splash screens, color palettes, and active service modules directly from Ofia ERP without requiring separate codebases or custom builds.",
    },
  ];

  return (
    <main className="bg-nexa-bg-base min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-nexa-brand/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[50%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* HERO TITLE & BILLING TOGGLE */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 bg-nexa-brand/10 text-nexa-brand px-4 py-1.5 rounded-full border border-nexa-brand/20 mb-6">
              <Sparkles className="w-4 h-4 text-nexa-brand" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">
                Predictable Transparent Subscriptions
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 55 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-display tracking-tight text-slate-900 mb-6"
          >
            One Subscription.{" "}
            <span className="text-nexa-brand">Zero Hidden Surprises.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg sm:text-xl text-nexa-text-secondary leading-relaxed"
          >
            Designed specifically for Nigerian commerce. Choose a plan that matches
            your velocity today, and unlock more capacity as you expand.
          </motion.p>

          {/* BILLING CYCLE SELECTOR */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-4 mt-10"
          >
            <span
              className={`text-sm font-semibold transition-colors cursor-pointer ${
                billingCycle === "monthly" ? "text-slate-900" : "text-slate-400"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly Billing
            </span>

            <button
              type="button"
              role="switch"
              aria-checked={billingCycle === "annually"}
              onClick={() =>
                setBillingCycle(billingCycle === "monthly" ? "annually" : "monthly")
              }
              className="w-14 h-8 bg-slate-200 rounded-full p-1 transition-colors relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-nexa-brand"
              style={{
                backgroundColor: billingCycle === "annually" ? "#0069FF" : undefined,
              }}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                  billingCycle === "annually" ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>

            <span
              className={`text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                billingCycle === "annually" ? "text-slate-900" : "text-slate-400"
              }`}
              onClick={() => setBillingCycle("annually")}
            >
              Annual Billing
              <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </span>
          </motion.div>
        </div>

        {/* PRICING CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
          {plans.map((plan, idx) => {
            const displayPrice =
              billingCycle === "monthly"
                ? plan.monthlyPrice.toLocaleString()
                : plan.annualPricePerMonth.toLocaleString();

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: idx * 0.15, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className={`h-full flex ${plan.popular ? "relative z-20" : "relative z-10"}`}
              >
                <NexaCard
                  variant={plan.popular ? "elevated" : "glass"}
                  padding="lg"
                  className={`h-full flex flex-col justify-between w-full relative ${
                    plan.popular
                      ? "border-2 border-nexa-brand shadow-2xl ring-4 ring-nexa-brand/10 bg-white overflow-visible z-20"
                      : "border-nexa-border hover:border-nexa-brand/40 transition-all duration-300"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30">
                      <span className="bg-nexa-brand text-white px-4 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                      {!plan.popular && (
                        <NexaBadge variant={plan.badgeVariant} size="sm">
                          {plan.badge}
                        </NexaBadge>
                      )}
                    </div>

                    <p className="text-xs text-nexa-text-secondary mb-6 h-10">
                      {plan.note}
                    </p>

                    {/* Price Display */}
                    <div className="mb-6 pb-6 border-b border-nexa-border/60">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                          ₦{displayPrice}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">
                          / month
                        </span>
                      </div>
                      {billingCycle === "annually" && (
                        <p className="text-xs text-emerald-600 font-medium mt-1.5">
                          Billed annually at ₦{plan.annualBilledTotal.toLocaleString()} / year
                        </p>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 mb-8">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        What&apos;s Included
                      </div>
                      {plan.features.map((feature, fIdx) => (
                        <div
                          key={fIdx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-normal"
                        >
                          <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4 border-t border-nexa-border/60">
                    <Link href="http://localhost:3000/join" className="w-full">
                      <NexaButton
                        variant={plan.popular ? "primary" : "secondary"}
                        size="lg"
                        className="w-full font-bold shadow-sm"
                      >
                        {plan.cta}
                      </NexaButton>
                    </Link>
                  </div>
                </NexaCard>
              </motion.div>
            );
          })}
        </div>

        {/* NATIVE MOBILE APPLICATIONS */}
        <div className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Native Mobile Ecosystem
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3"
            >
              Turnkey Mobile Applications
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm sm:text-base text-nexa-text-secondary"
            >
              Four production-ready Flutter mobile applications designed for shoppers, passengers, fleet drivers, and delivery couriers — available across iOS &amp; Android with multi-tenant white-label branding.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {mobileApps.map((app, idx) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 55 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <NexaCard
                  variant="glass"
                  padding="md"
                  className={`h-full border-nexa-border ${app.borderHover} transition-all duration-300 flex flex-col justify-between`}
                >
                  <div>
                    {/* Top Icon & Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${app.bg}`}
                      >
                        {app.icon}
                      </div>
                      <NexaBadge variant={app.badgeVariant} size="sm" dot>
                        {app.badge}
                      </NexaBadge>
                    </div>

                    {/* App Category & Name */}
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      {app.category}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-1 leading-snug">
                      {app.name}
                    </h4>
                    <div className="text-xs font-extrabold text-nexa-brand mb-2.5">
                      {app.pricingTag}
                    </div>
                    <p className="text-xs text-nexa-text-secondary leading-relaxed mb-4">
                      {app.desc}
                    </p>

                    {/* Feature bullets */}
                    <div className="space-y-2 pt-3 border-t border-nexa-border/60">
                      {app.features.map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-700 leading-tight"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card bottom action */}
                  <div className="pt-4 mt-5 border-t border-nexa-border/60">
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-nexa-brand hover:underline"
                    >
                      <span>Explore specifications</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </NexaCard>
              </motion.div>
            ))}
          </div>

          {/* White-Label Banner */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.65, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-slate-900/5 border border-nexa-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Need Custom White-Labeling for Your Transport Fleet or Brand?
                  </div>
                  <div className="text-xs text-nexa-text-secondary">
                    All Flutter mobile codebases support tenant-specific branding, logos, splash screens, and localized service controls out of the box.
                  </div>
                </div>
              </div>
              <Link href="mailto:enterprise@ofia.ng" className="shrink-0 w-full sm:w-auto">
                <NexaButton variant="secondary" size="sm" className="w-full sm:w-auto text-xs font-bold">
                  Inquire White-Label Deployment
                </NexaButton>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS ACCORDION */}
        <div className="max-w-3xl mx-auto mb-24">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Frequently Asked Questions
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="text-2xl sm:text-3xl font-extrabold text-slate-900"
            >
              Got Questions? We&apos;ve Got Answers.
            </motion.h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 45 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: index * 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                >
                  <NexaCard
                    variant="glass"
                    padding="none"
                    className="border-nexa-border overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer group"
                    >
                      <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-nexa-brand transition-colors">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 shrink-0 ml-4 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-nexa-brand" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-nexa-text-secondary leading-relaxed border-t border-nexa-border/40">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </NexaCard>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ENTERPRISE & ADVISORY BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 65, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <NexaCard
            variant="glass"
            padding="lg"
            className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-[#0A1628] text-white border-0 shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-nexa-brand/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center p-4 sm:p-6">
              <div className="lg:col-span-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex items-center gap-2 bg-white/10 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                  Custom Enterprise Deployments
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.75, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="text-2xl sm:text-3xl font-extrabold text-white mb-3"
                >
                  Operating 10+ retail locations or a wholesale distributor?
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 45 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.75, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="text-slate-300 text-sm leading-relaxed max-w-2xl"
                >
                  We provide tailored SLA agreements, dedicated cloud server clusters, custom
                  ERP data migration from legacy accounting tools, and hands-on staff training.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end"
              >
                <Link href="mailto:enterprise@ofia.ng" className="w-full">
                  <NexaButton
                    variant="primary"
                    size="lg"
                    className="w-full font-bold"
                  >
                    Speak with an Architect
                  </NexaButton>
                </Link>
                <Link href="http://localhost:3000/join" className="w-full">
                  <NexaButton
                    variant="white"
                    size="lg"
                    className="w-full font-bold"
                  >
                    Join Founding Cohort
                  </NexaButton>
                </Link>
              </motion.div>
            </div>
          </NexaCard>
        </motion.div>
      </div>
    </main>
  );
}
