"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Barcode,
  Bot,
  Boxes,
  Building2,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Gift,
  Layers,
  LayoutDashboard,
  Mail,
  MapPin,
  Package,
  Percent,
  PieChart,
  Printer,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sliders,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
  Users,
  Warehouse,
  Zap,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function AdminCommandCenterPage() {
  return (
    <BusinessShell
      title="Admin Mission Control"
      subtitle="Complete operational control over Autonomous AI GTM, Marketplace Store, Inventory (IMS), Point of Sale (POS), Referrals, and Logistics."
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/erp/admin/pos">
            <NexaButton
              size="sm"
              variant="primary"
              leftIcon={<ShoppingCart className="w-3.5 h-3.5" />}
              className="bg-[#0E9F6E] text-white hover:bg-[#046C4E]"
            >
              Open POS Cashier
            </NexaButton>
          </Link>
          <Link href="/erp/admin/ai/campaigns/new">
            <NexaButton
              size="sm"
              variant="primary"
              leftIcon={<Zap className="w-3.5 h-3.5" />}
              className="bg-[#1A56DB] text-white hover:bg-[#1545B0]"
            >
              Launch AI Campaign
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* TOP METRICS BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#1A56DB]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">AI Outbound Pipeline</span>
              <Bot className="w-4 h-4 text-[#1A56DB]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              1,480 Leads
            </div>
            <div className="text-[11px] text-[#1A56DB] font-semibold">
              15 Autonomous Agents Active
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#0E9F6E]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Stock Valuation (IMS)</span>
              <Boxes className="w-4 h-4 text-[#0E9F6E]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              ₦48,650,000
            </div>
            <div className="text-[11px] text-[#0E9F6E] font-bold">
              142 SKUs Across 3 Warehouses
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#9061F9]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Viral Referral K-Factor</span>
              <TrendingUp className="w-4 h-4 text-[#9061F9]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              1.48 (Viral)
            </div>
            <div className="text-[11px] text-[#9061F9] font-bold">
              184 Active Affiliate Partners
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#F59E0B]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Live Logistics SLA</span>
              <Truck className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              98.2% On-Time
            </div>
            <div className="text-[11px] text-[#0E9F6E] font-semibold">
              14 In-Transit Shipments
            </div>
          </NexaCard>
        </div>

        {/* CORE OPERATIONAL MODULE HUBS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* MODULE 1: INVENTORY (IMS) */}
          <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] flex flex-col justify-between hover:border-[#0E9F6E] transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#0E9F6E]/10 text-[#0E9F6E] flex items-center justify-center font-bold">
                  <Boxes className="w-5 h-5" />
                </div>
                <NexaBadge variant="green">142 SKUs</NexaBadge>
              </div>
              <div>
                <h3 className="font-black text-base text-[var(--nexa-text-primary)]">Inventory Management (IMS)</h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                  Multi-warehouse stock tracking, barcode registry, inter-branch transfers (GRN), and restock PO forecasting.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--nexa-border)] flex items-center justify-between">
              <span className="text-xs text-[#0E9F6E] font-bold">₦48.6M Asset Value</span>
              <Link href="/erp/admin/inventory">
                <NexaButton size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Manage Stock
                </NexaButton>
              </Link>
            </div>
          </NexaCard>

          {/* MODULE 2: POINT OF SALE (POS) */}
          <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] flex flex-col justify-between hover:border-[#1A56DB] transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center font-bold">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <NexaBadge variant="brand">Active Register</NexaBadge>
              </div>
              <div>
                <h3 className="font-black text-base text-[var(--nexa-text-primary)]">Point of Sale (POS) Terminal</h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                  Touch catalog grid, barcode scanning, multi-tender split payments (Cash, Card, Transfer), and thermal receipt printing.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--nexa-border)] flex items-center justify-between">
              <span className="text-xs text-[#1A56DB] font-bold">Z-Report Shift Ready</span>
              <Link href="/erp/admin/pos">
                <NexaButton size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Launch Cashier
                </NexaButton>
              </Link>
            </div>
          </NexaCard>

          {/* MODULE 3: REFERRAL ENGINE */}
          <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] flex flex-col justify-between hover:border-[#9061F9] transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#9061F9]/10 text-[#9061F9] flex items-center justify-center font-bold">
                  <Gift className="w-5 h-5" />
                </div>
                <NexaBadge variant="purple">K-Factor 1.48</NexaBadge>
              </div>
              <div>
                <h3 className="font-black text-base text-[var(--nexa-text-primary)]">Viral Referral & Affiliates</h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                  Dual-sided rewards (Give ₦5k / Get ₦5k), vanity affiliate links, and automated Paystack commission transfers.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--nexa-border)] flex items-center justify-between">
              <span className="text-xs text-[#9061F9] font-bold">184 Affiliates</span>
              <Link href="/erp/admin/referrals">
                <NexaButton size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Referral Hub
                </NexaButton>
              </Link>
            </div>
          </NexaCard>

          {/* MODULE 4: LOGISTICS COMMAND CENTER */}
          <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] flex flex-col justify-between hover:border-[#F59E0B] transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <NexaBadge variant="warning">98.2% SLA</NexaBadge>
              </div>
              <div>
                <h3 className="font-black text-base text-[var(--nexa-text-primary)]">Logistics & Dispatch</h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                  Live waybill tracking, automated proximity technician dispatch, fleet GPS telemetry, and rate calculation matrix.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--nexa-border)] flex items-center justify-between">
              <span className="text-xs text-[#F59E0B] font-bold">14 In-Flight</span>
              <Link href="/erp/admin/logistics">
                <NexaButton size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Dispatch Console
                </NexaButton>
              </Link>
            </div>
          </NexaCard>

          {/* MODULE 5: AUTONOMOUS AI GTM */}
          <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] flex flex-col justify-between hover:border-[#1A56DB] transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <NexaBadge variant="brand">15 AI Agents</NexaBadge>
              </div>
              <div>
                <h3 className="font-black text-base text-[var(--nexa-text-primary)]">Autonomous AI GTM Swarm</h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                  Multi-channel cold email, WhatsApp, and LinkedIn outreach with 1-tap Telegram mobile human-in-the-loop approvals.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--nexa-border)] flex items-center justify-between">
              <span className="text-xs text-[#1A56DB] font-bold">1,480 Active Leads</span>
              <Link href="/erp/admin/ai">
                <NexaButton size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Open AI Swarm
                </NexaButton>
              </Link>
            </div>
          </NexaCard>

          {/* MODULE 6: MARKETPLACE & STOREFRONT */}
          <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] flex flex-col justify-between hover:border-[#0E9F6E] transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#0E9F6E]/10 text-[#0E9F6E] flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <NexaBadge variant="green">Digital Storefront</NexaBadge>
              </div>
              <div>
                <h3 className="font-black text-base text-[var(--nexa-text-primary)]">Marketplace Merchant Store</h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                  Public merchant catalog, appointment booking schedule, customer inquiries, and Paystack wallet disbursements.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--nexa-border)] flex items-center justify-between">
              <span className="text-xs text-[#0E9F6E] font-bold">₦14.85M GMV</span>
              <Link href="/erp/admin/marketplace">
                <NexaButton size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Manage Store
                </NexaButton>
              </Link>
            </div>
          </NexaCard>
        </div>
      </div>
    </BusinessShell>
  );
}
