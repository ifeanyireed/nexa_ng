"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Compass,
  ShoppingBag,
  Smartphone,
  Layers,
  Cpu,
  Truck,
  Building2,
  ShieldCheck,
  CreditCard,
  Briefcase,
  Store,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Boxes,
  Zap,
} from "lucide-react";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaChip } from "@/components/nexa/NexaChip";

interface ProductItem {
  id: string;
  name: string;
  category: "storefronts" | "erp" | "ai" | "logistics";
  categoryLabel: string;
  badge: string;
  badgeVariant: "brand" | "emerald" | "amber" | "purple" | "cyan";
  tagline: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  href: string;
}

const CATEGORIES = [
  { id: "all", label: "All Modules" },
  { id: "storefronts", label: "Digital Storefronts" },
  { id: "erp", label: "Operations & ERP" },
  { id: "ai", label: "Autonomous AI & CRM" },
  { id: "logistics", label: "Logistics & Physical" },
];

const PRODUCTS: ProductItem[] = [
  {
    id: "compass",
    name: "Ofia Compass",
    category: "storefronts",
    categoryLabel: "Discovery Marketplace",
    badge: "Public Discovery",
    badgeVariant: "brand",
    tagline: "Be discovered by millions of Nigerian shoppers",
    description:
      "A high-intent commercial discovery directory with 100+ niche hubs. Connect buyer searches directly to verified local merchants, service experts, and product catalogs.",
    features: [
      "Verified merchant badges & trust rank",
      "Niche hub categorical listings",
      "Direct WhatsApp & instant quote requests",
      "Customer reviews & verified proof-of-work",
    ],
    icon: <Compass className="w-6 h-6" />,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
    href: "http://localhost:3000",
  },
  {
    id: "shops",
    name: "Ofia Shops",
    category: "storefronts",
    categoryLabel: "Digital Storefronts",
    badge: "E-Commerce",
    badgeVariant: "brand",
    tagline: "Dedicated branded storefront (.ofia.shop)",
    description:
      "Turnkey online store with lightning-fast mobile checkout, live inventory synchronization, dynamic product filters, and built-in buyer financing options.",
    features: [
      "Custom subdomain or connect your own domain",
      "Mobile-first responsive purchasing flow",
      "Instant inventory sync with Ofia ERP",
      "Zero coding required to launch",
    ],
    icon: <ShoppingBag className="w-6 h-6" />,
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-600",
    href: "/pricing",
  },
  {
    id: "merchant-app",
    name: "Ofia Merchant App",
    category: "storefronts",
    categoryLabel: "Mobile Suite",
    badge: "Mobile iOS & Android",
    badgeVariant: "emerald",
    tagline: "Your entire company in your pocket",
    description:
      "A handheld operating hub for business owners and store managers. Monitor daily revenue, approve invoices, assign rider pickups, and chat with customers on the move.",
    features: [
      "Real-time cashflow & sales push notifications",
      "Quick barcode & QR stock scanning",
      "Staff shift & terminal management",
      "Customer support chat & CRM triage",
    ],
    icon: <Smartphone className="w-6 h-6" />,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    href: "/pricing",
  },
  {
    id: "erp",
    name: "Ofia ERP",
    category: "erp",
    categoryLabel: "Back-Office Engine",
    badge: "Enterprise Core",
    badgeVariant: "purple",
    tagline: "The central nervous system for Nigerian enterprise",
    description:
      "End-to-end operational software tailored for Nigerian tax laws, multi-warehouse supply chains, branch reconciliations, and payroll compliances.",
    features: [
      "Multi-store & multi-branch ledger consolidation",
      "Batch & expiry-date inventory tracking",
      "Automated VAT & withholding tax reports",
      "Role-based staff permissions & audit trails",
    ],
    icon: <Layers className="w-6 h-6" />,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600",
    href: "/pricing",
  },
  {
    id: "verticals",
    name: "Vertical Experiences",
    category: "storefronts",
    categoryLabel: "Industry Templates",
    badge: "Specialized",
    badgeVariant: "cyan",
    tagline: "Deep vertical architectures ready out of the box",
    description:
      "Purpose-built software workflows designed for Auto dealerships (VIN lookups), Restaurants (table QR ordering & kitchen display), Shortlets, and Health clinics.",
    features: [
      "Automotive inventory with VIN & spec lookup",
      "Restaurant KDS & table ordering pipelines",
      "Hotel & shortlet calendar synchronization",
      "Specialized service booking workflows",
    ],
    icon: <Boxes className="w-6 h-6" />,
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-600",
    href: "/pricing",
  },
  {
    id: "ai",
    name: "Ofia AI Swarms",
    category: "ai",
    categoryLabel: "Autonomous AI",
    badge: "AI Powered",
    badgeVariant: "amber",
    tagline: "24/7 autonomous marketing & sales agents",
    description:
      "Autonomous AI workers that qualify inbound leads on WhatsApp, draft product descriptions, optimize pricing, and re-engage dormant customers without extra headcount.",
    features: [
      "Autonomous WhatsApp sales triage & order booking",
      "AI product photography enhancement & copywriter",
      "Predictive restock demand forecasting",
      "Automated churn prevention campaigns",
    ],
    icon: <Cpu className="w-6 h-6" />,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
    href: "/pricing",
  },
  {
    id: "logistics",
    name: "Ofia Logistics",
    category: "logistics",
    categoryLabel: "Fulfillment",
    badge: "Nationwide",
    badgeVariant: "emerald",
    tagline: "Automated fleet dispatch and last-mile tracking",
    description:
      "Integrated delivery network linking your warehouse or retail floor directly with vetted motorcycle, van, and interstate haulage operators across Nigeria.",
    features: [
      "Instant automated rider assignment & dispatch",
      "Live GPS tracking for buyers and store staff",
      "Digital proof-of-delivery with OTP & photo verification",
      "Pre-negotiated competitive courier rates",
    ],
    icon: <Truck className="w-6 h-6" />,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    href: "/pricing",
  },
  {
    id: "virtual-office",
    name: "Virtual Office",
    category: "logistics",
    categoryLabel: "Business Presence",
    badge: "Corporate Address",
    badgeVariant: "brand",
    tagline: "Prestigious corporate identity in key commercial capitals",
    description:
      "Give your business instant credibility with prime corporate addresses in Lagos and Abuja, physical mail scanning, phone reception, and boardroom booking credits.",
    features: [
      "CAC-compliant registered business address",
      "Mail receipt, digital scanning, and forwarding",
      "Executive conference room access on demand",
      "Dedicated professional phone answering",
    ],
    icon: <Building2 className="w-6 h-6" />,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
    href: "/pricing",
  },
  {
    id: "escrow",
    name: "Ofia Escrow",
    category: "storefronts",
    categoryLabel: "Trust & Safety",
    badge: "Zero Fraud",
    badgeVariant: "emerald",
    tagline: "Milestone-backed financial security for both parties",
    description:
      "Eliminate 'pay on delivery' disputes and bad debts. Buyer funds are securely escrowed in partner commercial banks and automatically released upon buyer inspection or OTP confirmation.",
    features: [
      "Automated settlement upon courier OTP verification",
      "Fair multi-tier dispute resolution protocol",
      "Support for high-ticket commercial equipment",
      "Eliminates rider cash-handling risks",
    ],
    icon: <ShieldCheck className="w-6 h-6" />,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    href: "/pricing",
  },
  {
    id: "business-hub",
    name: "Ofia Business Hub",
    category: "logistics",
    categoryLabel: "Physical Spaces",
    badge: "Co-Working",
    badgeVariant: "amber",
    tagline: "Modern physical hubs with uninterrupted power & fibre",
    description:
      "Physical work centers with 24/7 solar + generator redundancy, high-speed fibre optic internet, podcast recording studios, and merchant networking events.",
    features: [
      "Uninterrupted 24/7 power & high-speed backup internet",
      "Hot desks, dedicated pods, and private team suites",
      "Monthly founder mixers & masterclasses",
      "Exclusive discounts for Ofia platform subscribers",
    ],
    icon: <Briefcase className="w-6 h-6" />,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
    href: "/pricing",
  },
  {
    id: "pos",
    name: "Ofia POS",
    category: "erp",
    categoryLabel: "In-Store Hardware",
    badge: "Offline First",
    badgeVariant: "cyan",
    tagline: "Fast counter billing that never stops for network dips",
    description:
      "Smart Android and desktop point-of-sale systems that cache catalog and transaction records offline. When connection drops, sales keep ringing; data syncs when back online.",
    features: [
      "Full offline-mode sales recording & local receipts",
      "Thermal printer & barcode scanner USB/Bluetooth sync",
      "Split bills across cash, cards, and bank transfer",
      "Cashier shift closing and blind drop reports",
    ],
    icon: <Store className="w-6 h-6" />,
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-600",
    href: "/pricing",
  },
  {
    id: "payments",
    name: "Ofia Payments",
    category: "erp",
    categoryLabel: "Financial Rails",
    badge: "Multi-Rail",
    badgeVariant: "brand",
    tagline: "Instant reconciliation across all Nigerian payment rails",
    description:
      "Accept customer payments seamlessly via dynamic virtual accounts, instant bank transfers, cards, and USSD with sub-second webhook notifications directly into your ERP ledger.",
    features: [
      "Dedicated dynamic virtual accounts per order",
      "Real-time bank transfer confirmation without receipt checks",
      "Instant next-day automated merchant settlements",
      "Built-in chargeback protection & fraud flags",
    ],
    icon: <CreditCard className="w-6 h-6" />,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
    href: "/pricing",
  },
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProducts =
    selectedCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === selectedCategory);

  return (
    <main className="bg-nexa-bg-base min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-nexa-brand/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-nexa-accent/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 bg-nexa-brand/10 text-nexa-brand px-4 py-1.5 rounded-full border border-nexa-brand/20 mb-6">
              <Sparkles className="w-4 h-4 text-nexa-brand" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">
                Complete Commerce Stack
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-display tracking-tight text-slate-900 mb-6">
              Twelve Product Families,{" "}
              <span className="text-nexa-brand">One Unified System.</span>
            </h1>

            <p className="text-lg sm:text-xl text-nexa-text-secondary leading-relaxed">
              Every tool a growing Nigerian business needs to be found, operate
              friction-free, fulfill orders with trust, and scale exponentially.
            </p>
          </motion.div>

          {/* CATEGORY FILTER CHIPS */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-10">
            {CATEGORIES.map((cat) => (
              <NexaChip
                key={cat.id}
                label={cat.label}
                selected={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                count={
                  cat.id === "all"
                    ? PRODUCTS.length
                    : PRODUCTS.filter((p) => p.category === cat.id).length
                }
              />
            ))}
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              className="h-full"
            >
              <NexaCard
                variant="interactive"
                padding="lg"
                className="h-full flex flex-col justify-between group border-nexa-border hover:border-nexa-brand/50 transition-all duration-300"
              >
                <div>
                  {/* Top Bar with Icon and Category */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${product.iconBg} ${product.iconColor} group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                    >
                      {product.icon}
                    </div>
                    <NexaBadge
                      variant={product.badgeVariant}
                      size="sm"
                      dot
                    >
                      {product.badge}
                    </NexaBadge>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-nexa-brand transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs font-semibold text-nexa-brand mb-3 uppercase tracking-wider">
                    {product.tagline}
                  </p>

                  <p className="text-sm text-nexa-text-secondary leading-relaxed mb-6">
                    {product.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-4 border-t border-nexa-border/60 mb-6">
                    {product.features.map((feat, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-start gap-2 text-xs text-slate-700"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-nexa-border/60">
                  <Link href={product.href} className="w-full">
                    <NexaButton
                      variant="secondary"
                      size="md"
                      className="w-full text-xs font-bold justify-between group-hover:border-nexa-brand/30"
                      rightIcon={
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      }
                    >
                      Explore {product.name}
                    </NexaButton>
                  </Link>
                </div>
              </NexaCard>
            </motion.div>
          ))}
        </div>

        {/* BOTTOM ARCHITECTURE CALLOUT */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mt-20"
        >
          <NexaCard
            variant="glass"
            padding="lg"
            className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-[#0A1628] text-white border-0 shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-nexa-brand/20 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center p-4 sm:p-6">
              <div className="lg:col-span-8">
                <div className="inline-flex items-center gap-2 bg-white/10 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  No Integration Headaches
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
                  Data Enters Once. Synchronizes Everywhere.
                </h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                  Add a product once to your inventory. It publishes automatically to your
                  Compass profile, your branded shop, your counter POS, and your warehouse ledger.
                  No CSV exports. No manual sync errors.
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
                <Link href="/pricing" className="w-full">
                  <NexaButton
                    variant="primary"
                    size="lg"
                    className="w-full font-bold"
                  >
                    View Pricing &amp; Plans
                  </NexaButton>
                </Link>
                <Link href="http://localhost:3000" className="w-full">
                  <NexaButton
                    variant="white"
                    size="lg"
                    className="w-full font-bold"
                  >
                    Visit Ofia Compass
                  </NexaButton>
                </Link>
              </div>
            </div>
          </NexaCard>
        </motion.div>
      </div>
    </main>
  );
}
