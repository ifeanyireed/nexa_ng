"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Target,
  ShoppingBag,
  Briefcase,
  Send,
  Users,
  CheckSquare,
  Sparkles,
  Calendar,
  Wallet,
  Landmark,
  Award,
  ArrowRight,
  TrendingUp,
  Store,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function BusinessSuiteOverviewPage() {
  return (
    <BusinessShell>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--nexa-text-primary)] flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-[#1A56DB]" />
              Ofia Business Suite Command Center
            </h1>
            <p className="text-xs sm:text-sm text-[var(--nexa-text-muted)] mt-1">
              Unified operating cockpit spanning <strong>Autonomous AI GTM</strong>, <strong>Marketplace Merchant Storefronts</strong>, and <strong>Enterprise ERP</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <NexaBadge variant="brand">Enterprise Tier</NexaBadge>
          </div>
        </div>

        {/* 3 BUSINESS MODULE SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* MODULE 1: AUTONOMOUS AI GTM */}
          <NexaCard variant="glass" padding="md" className="space-y-4 border-l-4 border-l-[#1A56DB]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#1A56DB]/10 text-[#1A56DB]">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">Autonomous GTM</h3>
                  <p className="text-[11px] text-[var(--nexa-text-muted)]">AI Cold Outreach & Swarm</p>
                </div>
              </div>
              <NexaBadge variant="brand">Active</NexaBadge>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--nexa-border)]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Active Campaigns</span>
                <p className="text-lg font-black text-[var(--nexa-text-primary)]">3 Live</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Enriched Leads</span>
                <p className="text-lg font-black text-[#0E9F6E]">1,420</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Email Deliverability</span>
                <p className="text-sm font-bold text-[#1A56DB]">99.4%</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Pending Approvals</span>
                <p className="text-sm font-bold text-[#F59E0B]">2 Pending</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--nexa-border)] text-xs">
              <Link href="/gtm" className="font-bold text-[#1A56DB] hover:underline flex items-center gap-1">
                Open GTM Cockpit <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/gtm/campaigns" className="text-[11px] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]">
                Campaigns →
              </Link>
            </div>
          </NexaCard>

          {/* MODULE 2: MARKETPLACE STOREFRONT */}
          <NexaCard variant="glass" padding="md" className="space-y-4 border-l-4 border-l-[#0E9F6E]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#0E9F6E]/10 text-[#0E9F6E]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">Marketplace Storefront</h3>
                  <p className="text-[11px] text-[var(--nexa-text-muted)]">Merchant & Service Pro</p>
                </div>
              </div>
              <NexaBadge variant="cyan">Pro Verified</NexaBadge>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--nexa-border)]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Total Sales</span>
                <p className="text-lg font-black text-[var(--nexa-text-primary)]">₦4.85M</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">New Bookings</span>
                <p className="text-lg font-black text-[#0E9F6E]">8 New</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Escrow Balance</span>
                <p className="text-sm font-bold text-[#1A56DB]">₦420,000</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Store Products</span>
                <p className="text-sm font-bold text-[var(--nexa-text-primary)]">24 Listed</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--nexa-border)] text-xs">
              <Link href="/merchant" className="font-bold text-[#0E9F6E] hover:underline flex items-center gap-1">
                Open Merchant Hub <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/merchant/shop" className="text-[11px] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]">
                Shop Catalog →
              </Link>
            </div>
          </NexaCard>

          {/* MODULE 3: ENTERPRISE ERP */}
          <NexaCard variant="glass" padding="md" className="space-y-4 border-l-4 border-l-[#7E3AF2]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#7E3AF2]/10 text-[#7E3AF2]">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">Enterprise ERP</h3>
                  <p className="text-[11px] text-[var(--nexa-text-muted)]">Finance, HR & Payroll</p>
                </div>
              </div>
              <NexaBadge variant="purple">120 Staff</NexaBadge>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--nexa-border)]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Departments</span>
                <p className="text-lg font-black text-[var(--nexa-text-primary)]">14 Active</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Monthly Payroll</span>
                <p className="text-lg font-black text-[#7E3AF2]">₦18.4M</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">Appraisal Progress</span>
                <p className="text-sm font-bold text-[#0E9F6E]">98.6%</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">General Ledger</span>
                <p className="text-sm font-bold text-[#1A56DB]">Balanced ✓</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--nexa-border)] text-xs">
              <Link href="/erp/finance" className="font-bold text-[#7E3AF2] hover:underline flex items-center gap-1">
                Open Finance Ledger <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/erp/hr" className="text-[11px] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]">
                HR & KPIs →
              </Link>
            </div>
          </NexaCard>
        </div>

        {/* WORKFLOW ACTION ITEMS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm sm:text-base text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F59E0B]" />
              Action Items Requiring Attention
            </h3>
            <NexaBadge variant="warning">3 Pending Tasks</NexaBadge>
          </div>

          <div className="space-y-2.5">
            <div className="p-3.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#1A56DB]/10 text-[#1A56DB]">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-[var(--nexa-text-primary)]">GTM Outreach Approval Required</div>
                  <div className="text-[11px] text-[var(--nexa-text-muted)]">Noah Sterling queued 45 personalized cold emails for 'Fintech CTOs' campaign.</div>
                </div>
              </div>
              <Link href="/gtm/approvals">
                <NexaButton size="sm" variant="primary" className="bg-[#1A56DB] text-white">
                  Review Approvals
                </NexaButton>
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0E9F6E]/10 text-[#0E9F6E]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-[var(--nexa-text-primary)]">8 New Inbound Booking Requests</div>
                  <div className="text-[11px] text-[var(--nexa-text-muted)]">Customers requested on-site technician visit in Lekki & Victoria Island.</div>
                </div>
              </div>
              <Link href="/merchant/bookings">
                <NexaButton size="sm" variant="outline" className="text-[#0E9F6E] border-[#0E9F6E]/30 hover:bg-[#0E9F6E]/10">
                  Accept Bookings
                </NexaButton>
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#7E3AF2]/10 text-[#7E3AF2]">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-[var(--nexa-text-primary)]">Q3 Performance Appraisal Cycle Closing</div>
                  <div className="text-[11px] text-[var(--nexa-text-muted)]">2 direct reports awaiting manager review scores in Fleet Operations.</div>
                </div>
              </div>
              <Link href="/erp/manager">
                <NexaButton size="sm" variant="outline" className="text-[#7E3AF2] border-[#7E3AF2]/30 hover:bg-[#7E3AF2]/10">
                  Grade Reviews
                </NexaButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </BusinessShell>
  );
}
