"use client";

import React from "react";
import Link from "next/link";
import { motion, useSpring, useTransform } from "framer-motion";
import {
  Layers,
  Boxes,
  ShoppingCart,
  Truck,
  PieChart,
  Users,
  Gift,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  Building2,
  CheckCircle2,
  BarChart3,
  Globe2,
  Sparkles,
} from "lucide-react";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { Footer } from "@/components/nexa/Footer";
import { cn } from "@/lib/utils";

const Counter = ({ value, label }: { value: string; label: string }) => {
  const displayValue = value.replace(/[,+★₦%M]/g, "");
  const numValue = parseInt(displayValue, 10) || 0;
  const spring = useSpring(0, { stiffness: 40, damping: 20 });
  const display = useTransform(spring, (current) => {
    const formatted = Math.floor(current).toLocaleString();
    return value.replace(displayValue, formatted);
  });

  React.useEffect(() => {
    spring.set(numValue);
  }, [numValue, spring]);

  return (
    <div className="text-center">
      <motion.div className="text-3xl lg:text-5xl font-extrabold text-display mb-2 text-[#1A56DB]">
        <motion.span>{display}</motion.span>
      </motion.div>
      <p className="text-xs font-bold text-nexa-text-faint uppercase tracking-widest">{label}</p>
    </div>
  );
};

export default function EnterpriseERPLanding() {
  const corePillars = [
    {
      icon: <Boxes />,
      title: "Multi-Warehouse Inventory (IMS)",
      body: "Master SKU catalogs, barcode verification, inter-branch Goods Received Notes (GRN), depot bin tracking, and automated restock purchase orders.",
    },
    {
      icon: <ShoppingCart />,
      title: "Point of Sale (POS) Cashier Register",
      body: "Touchscreen cashier terminal, barcode scanning, multi-tender split checkout (Cash, Card, Bank Transfer), and automated shift Z-report balancing.",
    },
    {
      icon: <Truck />,
      title: "Logistics Command & Fleet Dispatch",
      body: "Automated nearest-courier dispatch, 4x6 QR waybill shipping labels, live GPS rider map, and automated Nigerian regional zonal rate calculator.",
    },
    {
      icon: <PieChart />,
      title: "General Ledger & Double-Entry Accounting",
      body: "GAAP/IFRS compliant General Ledger, real-time Balance Sheet & P&L statements, multi-bank feed reconciliation, and automated FIRS 7.5% VAT / WHT ledger.",
    },
    {
      icon: <Users />,
      title: "HR 360 Appraisals & Enterprise OKRs",
      body: "Multi-department staff directories, enterprise objective banks, structured KPI appraisal cycles, subordinate grading desks, and staff self-service.",
    },
    {
      icon: <Gift />,
      title: "Viral Referral & Affiliate Engine",
      body: "Customizable referral reward campaigns, unique partner vanity links, anti-fraud device fingerprinting, and automated batch Paystack bank commission payouts.",
    },
  ];

  const steps = [
    {
      title: "Provision Workspace",
      body: "Setup your isolated enterprise tenant on tenant.ofia.ng with custom branding, user roles, and Nigerian tax parameters.",
    },
    {
      title: "Sync Catalog & Warehouses",
      body: "Import multi-warehouse SKU inventory, link cashier POS terminals, set regional delivery rate zones, and configure Chart of Accounts.",
    },
    {
      title: "Onboard Staff & Desks",
      body: "Invite branch accountants, cashier operators, inventory depot managers, and dispatch couriers into their role-scoped workspaces.",
    },
    {
      title: "Scale Autonomous Operations",
      body: "Watch store sales, restock POs, dispatch waybills, and financial journals balance automatically across all synchronized modules.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="bg-nexa-bg-base min-h-screen">
      <NexaNavbar />

      {/* HERO SECTION — EXACT /nexa-verified AESTHETIC & TRANSLUCENT OVERLAY */}
      <section className="relative min-h-screen flex items-center justify-start pt-32 overflow-hidden">
        {/* Background image & gradient blur overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/nexa-guaranteed-1.jpeg"
            alt="Ofia Enterprise ERP Background"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Water translucent blurry overlay resolving to zero opacity/blur to the right */}
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: "blur(24px) saturate(220%) brightness(1.05)",
              WebkitBackdropFilter: "blur(24px) saturate(220%) brightness(1.05)",
              maskImage: "linear-gradient(to right, black 25%, transparent 75%)",
              WebkitMaskImage: "linear-gradient(to right, black 25%, transparent 75%)",
            }}
          />
          {/* Vertical gradient tending towards header */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white via-white/90 to-transparent" />
          {/* Left horizontal gradient to shield text content */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 via-30% to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-12 lg:px-20 relative z-10 text-left flex flex-col items-start">
          {/* Rotating Badge */}
          <motion.div
            initial={{ rotate: 0, scale: 0 }}
            animate={{ rotate: 360, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-20 h-20 bg-[#1A56DB]/10 rounded-full flex items-center justify-center mb-8 border border-[#1A56DB]/30 backdrop-blur-md shadow-lg"
          >
            <Layers className="w-10 h-10 text-[#1A56DB]" />
          </motion.div>

          {/* Staggered Animated Headline */}
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-display text-slate-900 mb-6 tracking-tighter text-left leading-[1.1]"
          >
            <span className="block mb-2">
              {"Your Entire Enterprise.".split(" ").map((word, i) => (
                <motion.span key={`w1-${i}`} variants={itemVariants} className="inline-block mr-2">
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="block">
              {"Orchestrated by Ofia ERP.".split(" ").map((word, i) => (
                <motion.span
                  key={`w2-${i}`}
                  variants={itemVariants}
                  className="inline-block mr-2 text-[#1A56DB]"
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-lg md:text-xl text-slate-700 max-w-2xl text-left mb-12"
          >
            Unify multi-warehouse inventory, high-speed POS registers, automated logistics dispatch, double-entry General Ledger, 360 appraisals, and viral referral rewards in one cohesive engine.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col lg:flex-row items-center justify-start gap-6 w-full"
          >
            <Link href="/join/register" className="w-full lg:w-auto">
              <NexaButton
                size="xl"
                className="bg-[#1A56DB] text-white font-extrabold hover:bg-[#1545B0] border-none shadow-xl w-full lg:w-auto px-10"
              >
                Launch Enterprise Workspace
              </NexaButton>
            </Link>
            <a
              href="#capabilities"
              className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-widest text-xs hover:text-[#1A56DB] transition-colors group"
            >
              Explore Capabilities
              <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* CORE PILLARS / CAPABILITY GRID */}
      <section id="capabilities" className="py-24 lg:py-32 container mx-auto px-4">
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] font-bold text-xs uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Complete Operating System
          </div>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-display mb-4">
            Six Critical Systems. Zero Silos.
          </h2>
          <p className="text-nexa-text-muted max-w-2xl mx-auto font-medium">
            Everything your business needs to manage stock, sales, logistics, finance, and people across Nigeria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {corePillars.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="liquid-glass p-8 rounded-2xl group hover:border-[#1A56DB]/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1A56DB]/10 flex items-center justify-center text-[#1A56DB] mb-6 group-hover:scale-110 transition-transform">
                {React.cloneElement(pillar.icon as React.ReactElement<any>, {
                  className: "w-6 h-6",
                })}
              </div>
              <h3 className="text-xl font-extrabold mb-4 text-display">{pillar.title}</h3>
              <p className="text-sm text-nexa-text-secondary leading-relaxed">{pillar.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS / DEPLOYMENT FLOW */}
      <section className="py-24 lg:py-32 bg-nexa-bg-surface border-y border-nexa-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-display mb-6">
              Simple, Secure, Seamless.
            </h2>
            <p className="text-nexa-text-muted max-w-xl mx-auto font-medium">
              Deploy your entire enterprise stack in four structured, frictionless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative"
              >
                <div className="text-[120px] font-black text-slate-900/5 dark:text-white/5 absolute -top-6 -right-4 select-none pointer-events-none leading-none">
                  {i + 1}
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-[#1A56DB] text-white flex items-center justify-center font-black mb-6 shadow-lg shadow-[#1A56DB]/20">
                    {i + 1}
                  </div>
                  <h4 className="text-lg font-extrabold mb-3 text-display">{step.title}</h4>
                  <p className="text-sm text-nexa-text-secondary leading-relaxed">{step.body}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-[2px] bg-gradient-to-r from-[#1A56DB]/20 to-transparent -ml-6" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / COUNTERS */}
      <section className="py-24 lg:py-32 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">
          <Counter value="₦18.4B+" label="Transactions Processed" />
          <Counter value="99.9%" label="Platform Uptime SLA" />
          <Counter value="45,000+" label="Active Shifts Closed" />
        </div>

        <div className="liquid-glass p-12 rounded-3xl bg-[#1A56DB] text-white overflow-hidden relative group max-w-fit mx-auto">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full -mr-64 -mt-64 blur-[100px] group-hover:scale-110 transition-transform duration-1000" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full overflow-hidden bg-white/10 border border-white/20 mb-6 w-max">
                <Building2 className="w-4 h-4 text-white" />
                <span className="text-[10px] font-extrabold text-white uppercase tracking-wider relative z-10">
                  Enterprise Infrastructure
                </span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-6">
                Ready to modernize your operations?
              </h2>
              <p className="text-lg text-white font-medium leading-relaxed">
                Connect your physical stores, remote fulfillment depots, field delivery fleet, and corporate ledger onto one platform.
              </p>
            </div>
            <Link href="/join/register" className="w-full lg:w-auto">
              <NexaButton
                size="xl"
                variant="secondary"
                className="bg-white text-[#1A56DB] hover:bg-slate-100 w-full"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Setup Enterprise Tenant
              </NexaButton>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <NexaBottomBar />
    </main>
  );
}
