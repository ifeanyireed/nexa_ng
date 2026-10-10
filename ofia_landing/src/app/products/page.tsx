"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Target,
  Users,
  CreditCard,
  Building2,
  Truck,
  Navigation,
  Car,
  Store,
  HeartPulse,
  GraduationCap,
  Hotel,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaChip } from "@/components/nexa/NexaChip";

interface ProductItem {
  id: string;
  name: string;
  category: "enterprise" | "operations" | "mobility" | "commerce" | "verticals";
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
  { id: "all", label: "All Products & Managers" },
  { id: "enterprise", label: "Enterprise & Finance" },
  { id: "operations", label: "Facility Management" },
  { id: "mobility", label: "Mobility, Fleet & Dispatch" },
  { id: "commerce", label: "Commerce & Retail" },
  { id: "verticals", label: "Specialized Industry Suites" },
];

const PRODUCTS: ProductItem[] = [
  // ==========================================
  // 1. CRM and Marketing
  // ==========================================
  {
    id: "crm-marketing",
    name: "CRM and Marketing",
    category: "enterprise",
    categoryLabel: "Growth & Customer Lifecycle",
    badge: "Omnichannel CRM",
    badgeVariant: "brand",
    tagline: "Automated lead pipeline, customer engagement & marketing campaigns",
    description:
      "End-to-end customer relationship and growth automation engine. Capture inbound leads, track multi-stage visual deal pipelines, run segmented email and WhatsApp marketing broadcasts, and automate customer lifecycle interactions from initial touchpoint to repeat retention.",
    features: [
      "Visual Kanban deal pipeline with deal stages and revenue forecasting",
      "Omnichannel lead capture with automated SDR triage & qualification",
      "Targeted audience marketing lists with WhatsApp & email broadcast tools",
      "Complete customer interaction timeline (calls, emails, meetings, tasks)",
      "Real-time sales velocity, lead conversion funnels & campaign ROI analytics",
    ],
    icon: <Target className="w-6 h-6" />,
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-600",
    href: "/pricing",
  },

  // ==========================================
  // 2. HR
  // ==========================================
  {
    id: "hr",
    name: "HR",
    category: "enterprise",
    categoryLabel: "Human Capital",
    badge: "360° Appraisals",
    badgeVariant: "purple",
    tagline: "People operations, performance appraisal cycles, OKRs & governance",
    description:
      "Modern workforce governance and human capital operations. Structure quarterly 360-degree milestone review cycles, calibrate supervisor scorecards, align departmental OKR objective banks, and organize company hierarchies with dynamic permission inheritance.",
    features: [
      "Structured milestone 360 review cycles with manager calibration desk",
      "Enterprise OKR Objectives Bank with weighted key results scoring",
      "Dynamic organizational department hierarchies & granular tab permissions",
      "Employee self-service portal, peer reviews, quests & growth roadmap",
      "Leave administration, attendance monitoring, and staff directory records",
    ],
    icon: <Users className="w-6 h-6" />,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600",
    href: "/pricing",
  },

  // ==========================================
  // 3. Accounting
  // ==========================================
  {
    id: "accounting",
    name: "Accounting",
    category: "enterprise",
    categoryLabel: "Financial Governance",
    badge: "FIRS Tax Compliant",
    badgeVariant: "emerald",
    tagline: "Double-entry ledgers, automated Nigerian tax compliance & banking",
    description:
      "Comprehensive corporate accounting and financial reporting built for Nigerian compliance. Automated double-entry general ledger, FIRS 7.5% VAT and withholding tax (WHT) calculations, real-time bank reconciliation, multi-currency invoicing, and real-time P&L reporting.",
    features: [
      "Automated FIRS 7.5% VAT and WHT remittance reporting",
      "Double-entry General Ledger, Chart of Accounts, and instant Trial Balance",
      "Automated bank statement reconciliation with discrepancy & variance flags",
      "Invoices, estimates, retainers, and aged payables/receivables",
      "Multi-branch ledger consolidation, audit logs, and real-time P&L / balance sheet",
    ],
    icon: <CreditCard className="w-6 h-6" />,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    href: "/pricing",
  },

  // ==========================================
  // 4. Facility Manager
  // ==========================================
  {
    id: "facility-manager",
    name: "Facility Manager",
    category: "operations",
    categoryLabel: "Infrastructure & Assets",
    badge: "95%+ Uptime OS",
    badgeVariant: "amber",
    tagline: "Infrastructure uptime, utility management & preventive maintenance",
    description:
      "Centralized operations desk for commercial properties, corporate estates, and facilities. Supervise power systems (solar, generator, grid), track preventive equipment maintenance, manage vendor service contracts, and resolve facility work orders with rapid SLA tracking.",
    features: [
      "Critical facility uptime monitoring (electricity, generators, water, HVAC & lighting)",
      "Preventive maintenance scheduling & digital work order ticketing desk",
      "Vendor service agreements, maintenance records & expense documentation",
      "Building asset register with depreciation and replacement logs",
      "Safety compliance auditing (fire systems, alarms, and emergency protocols)",
    ],
    icon: <Building2 className="w-6 h-6" />,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
    href: "/pricing",
  },

  // ==========================================
  // 5. Fleet Manager
  // ==========================================
  {
    id: "fleet-manager",
    name: "Fleet Manager",
    category: "mobility",
    categoryLabel: "Fleet Intelligence",
    badge: "Asset Intelligence",
    badgeVariant: "cyan",
    tagline: "Vehicle asset lifecycles, fuel telemetry & maintenance scheduling",
    description:
      "Dedicated command center for transport companies and corporate fleet operators. Oversee vehicle asset lifecycles, fuel consumption analytics, driver rosters, vehicle documentation compliance, and asset payback horizons.",
    features: [
      "Vehicle asset register with VIN, documentation & expiry alerts (insurance, roadworthiness)",
      "Fuel consumption logs, fuel allowance monitoring & cost-per-km metrics",
      "Preventive vehicle maintenance schedules & spare parts tracking",
      "Driver roster scheduling, license verification & safety performance ratings",
      "Vehicle ROI, depreciation analysis, and operational revenue tracking",
    ],
    icon: <Truck className="w-6 h-6" />,
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-600",
    href: "/pricing",
  },

  // ==========================================
  // 6. Dispatch Manager
  // ==========================================
  {
    id: "dispatch-manager",
    name: "Dispatch Manager",
    category: "mobility",
    categoryLabel: "Last-Mile Fulfillment",
    badge: "Real-Time Dispatch",
    badgeVariant: "emerald",
    tagline: "Universal dispatch routing, rider tracking & proof of delivery",
    description:
      "Integrated delivery management coordinating in-house dispatch riders and third-party logistics carriers. Manage 4 universal delivery job types, broadcast jobs to nearby riders, generate digital waybills, and ensure foolproof delivery confirmation with recipient OTP codes.",
    features: [
      "4 universal delivery job types: Store Orders, Vendor Dispatch, Customer Pickups & Transfers",
      "Multi-carrier routing: in-house bike/van fleet or 3rd-party logistics APIs (GIGL, DHL, Sendbox)",
      "Real-time GPS parcel map telemetry with dynamic status island updates",
      "Recipient OTP verification for zero-dispute proof of delivery",
      "Zone-based rate matrices, automated digital waybills, and barcode tracking",
    ],
    icon: <Navigation className="w-6 h-6" />,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    href: "/pricing",
  },

  // ==========================================
  // 7. Mobility Manager(with services)
  // ==========================================
  {
    id: "mobility-manager",
    name: "Mobility Manager (with services)",
    category: "mobility",
    categoryLabel: "Transit & Passenger OS",
    badge: "6 Transit Modes",
    badgeVariant: "brand",
    tagline: "Unified passenger transit OS across 6 dedicated mobility services",
    description:
      "Complete passenger transit operating system powering modern commercial mobility. Operate ticketing, terminal manifests, route scheduling, seat selection, and passenger booking apps across 6 dedicated mobility service lines from a single unified platform.",
    features: [
      "Interstate Travel: Terminal booking desks, route manifests & QR boarding passes",
      "Intra-City Shuttles: Scheduled fixed routes with virtual boarding stops",
      "Bus Rentals & Charters: Custom itinerary planning with automated charter pricing calculator",
      "School Bus Runs: Student passenger rosters & verified guardian pickup/drop-off tracking",
      "Corporate Staff Commute: B2B scheduled employee shuttle contracts & attendance logs",
      "On-Demand Hailing & Booking: Real-time passenger trip dispatch with integrated digital wallet",
    ],
    icon: <Car className="w-6 h-6" />,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
    href: "/pricing",
  },

  // ==========================================
  // 8. Shop Manager (With submodules)
  // ==========================================
  {
    id: "shop-manager",
    name: "Shop Manager (With submodules)",
    category: "commerce",
    categoryLabel: "Retail & Commerce Hub",
    badge: "Omnichannel Suite",
    badgeVariant: "purple",
    tagline: "Omnichannel retail operating desk with 6 core commerce submodules",
    description:
      "Complete commerce and retail management hub. Seamlessly manage physical storefronts, cashier registers, multi-warehouse stock, and online web stores with specialized submodules that keep stock, sales, and orders synchronized in real time.",
    features: [
      "Catalog & Listings: Multi-variant product catalog, attributes & SKU categorization",
      "Point of Sale (POS): Offline-first cashier billing, barcode scanning & thermal receipts",
      "Inventory Management (IMS): Multi-warehouse stock tracking, transfers & reorder alerts",
      "Orders & Fulfillment: Unified omnichannel order pipeline & dispatch waybills",
      "Services & Bookings: Appointment scheduling, service calendars & staff allocation",
      "Store Studio & Referrals: Branded storefront customization, affiliate codes & loyalty",
    ],
    icon: <Store className="w-6 h-6" />,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600",
    href: "/pricing",
  },

  // ==========================================
  // 9. Hospital Manager
  // ==========================================
  {
    id: "hospital-manager",
    name: "Hospital Manager",
    category: "verticals",
    categoryLabel: "Healthcare & Clinical",
    badge: "Clinical OS",
    badgeVariant: "cyan",
    tagline: "Clinical records, doctor appointments, pharmacy & patient billing",
    description:
      "Purpose-built healthcare operating software for hospitals, clinics, and diagnostic centers. Streamline electronic medical records (EMR), doctor consultation appointments, clinical laboratory investigations, pharmacy dispensing, and insurance/HMO billing.",
    features: [
      "Confidential Electronic Medical Records (EMR) with patient history & clinical notes",
      "Doctor appointment scheduling, clinic queue triage, and front-desk reception",
      "In-house pharmacy inventory, prescription verification & medication dispensing",
      "Diagnostic laboratory test ordering, specimen tracking, and digital result delivery",
      "HMO health insurance claims processing, copays, and consolidated hospital billing",
    ],
    icon: <HeartPulse className="w-6 h-6" />,
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-600",
    href: "/pricing",
  },

  // ==========================================
  // 10. School Manager
  // ==========================================
  {
    id: "school-manager",
    name: "School Manager",
    category: "verticals",
    categoryLabel: "Education & Academics",
    badge: "EdTech OS",
    badgeVariant: "amber",
    tagline: "Student academic records, term fee billing, attendance & guardian portal",
    description:
      "Comprehensive academic and institution management system for schools and academies. Coordinate student admissions, academic grading and report cards, term fee billing with automated payment receipts, teacher rosters, and parent communication channels.",
    features: [
      "Student admissions, comprehensive bio-data records & digital student IDs",
      "Academic grading engine, term report card generation & continuous assessment tracking",
      "School fees billing, installment payment plans, automated receipts & debtor tracking",
      "Daily classroom attendance monitoring, timetable scheduling & teacher allocations",
      "Guardian parent portal with SMS/email notifications for results, events & announcements",
    ],
    icon: <GraduationCap className="w-6 h-6" />,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
    href: "/pricing",
  },

  // ==========================================
  // 11. Hotel Manager
  // ==========================================
  {
    id: "hotel-manager",
    name: "Hotel Manager",
    category: "verticals",
    categoryLabel: "Hospitality & Stays",
    badge: "Hospitality OS",
    badgeVariant: "emerald",
    tagline: "Room reservation engine, front-desk check-in, housekeeping & guest billing",
    description:
      "Dedicated property and guest hospitality software for hotels, boutique lodges, and short-let operators. Automate room availability calendars, direct guest reservations, keycard front-desk check-ins, housekeeping room turnarounds, and restaurant/bar guest folio billing.",
    features: [
      "Visual room reservation calendar with real-time status (Clean, Occupied, Maintenance)",
      "Fast front-desk guest check-in / check-out with ID scanning & digital registration cards",
      "Housekeeping room turnover dispatch with mobile room inspection checklists",
      "Guest folio billing: consolidate room charges, dining, bar, laundry, and room service",
      "Dynamic seasonal tariff pricing, direct booking engine, and OTA channel sync",
    ],
    icon: <Hotel className="w-6 h-6" />,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    href: "/pricing",
  },
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const syncCategoryFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get("category");
        if (cat) {
          if (["enterprise", "operations", "mobility", "commerce", "verticals", "all"].includes(cat)) {
            setSelectedCategory(cat);
          } else if (cat === "erp") {
            setSelectedCategory("enterprise");
          } else if (cat === "storefronts") {
            setSelectedCategory("commerce");
          } else if (cat === "logistics") {
            setSelectedCategory("mobility");
          }
        }
      };

      syncCategoryFromUrl();
      window.addEventListener("popstate", syncCategoryFromUrl);
      return () => window.removeEventListener("popstate", syncCategoryFromUrl);
    }
  }, []);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (catId === "all") {
        url.searchParams.delete("category");
      } else {
        url.searchParams.set("category", catId);
      }
      window.history.pushState({}, "", url.toString());
    }
  };

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
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 bg-nexa-brand/10 text-nexa-brand px-4 py-1.5 rounded-full border border-nexa-brand/20 mb-6">
              <Sparkles className="w-4 h-4 text-nexa-brand" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">
                Complete African Enterprise Architecture
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 55 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-display tracking-tight text-slate-900 mb-6"
          >
            Eleven Specialized Products,{" "}
            <span className="text-nexa-brand">One Unified Operating System.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg sm:text-xl text-nexa-text-secondary leading-relaxed"
          >
            From CRM, HR, and accounting to fleet, dispatch, mobility, shop operations, and specialized industry managers — explore the complete suite of products powering modern African enterprise.
          </motion.p>

          {/* CATEGORY FILTER CHIPS */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center justify-center gap-2.5 mt-10"
          >
            {CATEGORIES.map((cat) => (
              <NexaChip
                key={cat.id}
                label={cat.label}
                selected={selectedCategory === cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                count={
                  cat.id === "all"
                    ? PRODUCTS.length
                    : PRODUCTS.filter((p) => p.category === cat.id).length
                }
              />
            ))}
          </motion.div>
        </div>

        {/* PRODUCTS GRID */}
        <div id="catalog" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (idx % 3) * 0.12, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
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
          initial={{ opacity: 0, y: 65, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
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
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex items-center gap-2 bg-white/10 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md"
                >
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  Unified Architecture · One Shared Data Plane
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.75, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="text-2xl sm:text-4xl font-extrabold text-white mb-4"
                >
                  Data Enters Once. Synchronizes Everywhere.
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 45 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.75, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl"
                >
                  Add inventory once: it reflects across your storefront, counter POS, warehouse ledger, and dispatch routes. Book a courier, schedule student transit, or log guest reservations: operations and accounting update in real time. Zero CSV exports, zero manual re-entry.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end"
              >
                <Link href="/pricing" className="w-full">
                  <NexaButton
                    variant="primary"
                    size="lg"
                    className="w-full font-bold"
                  >
                    View Pricing &amp; Plans
                  </NexaButton>
                </Link>
                <Link href="/pricing" className="w-full">
                  <NexaButton
                    variant="white"
                    size="lg"
                    className="w-full font-bold"
                  >
                    Get Started Free
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
