"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Layers,
  Users,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  PieChart,
  ArrowRight,
  Plus,
  Coins,
  FileText,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";
import { CompensationScale } from "@/lib/workforce-types";

export default function CompensationCostingPage() {
  const {
    compensationScales,
    deployments,
    kpis,
    people,
  } = useWorkforceManager();

  const totalMonthlyBilled = deployments.reduce((sum, d) => sum + d.billingRateMonthly, 0);
  const totalMonthlyCost = deployments.reduce((sum, d) => sum + d.costRateMonthly, 0);
  const grossMonthlyMargin = totalMonthlyBilled - totalMonthlyCost;
  const grossMarginPercent = totalMonthlyBilled > 0 ? Math.round((grossMonthlyMargin / totalMonthlyBilled) * 100) : 0;

  return (
    <ErpAdminShell
      title="Compensation & Workforce Costing"
      subtitle="Module 09 · Stipend disbursement scales, direct labor costing, and client contract profitability margins."
      activeModule="workforce"
      action={
        <Link href="/erp/accountant/employee-salaries">
          <NexaButton size="sm" variant="secondary" className="gap-2 text-xs">
            <Layers className="w-4 h-4 text-emerald-400" />
            General Ledger Payroll Feeds
          </NexaButton>
        </Link>
      }
    >
      <div className="space-y-8">
        {/* TOP FINANCIAL METRICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Billed Client Revenue</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              ₦{totalMonthlyBilled.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-400 mt-1 font-medium">Monthly retainers across deployments</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Direct Workforce Cost</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              ₦{totalMonthlyCost.toLocaleString()}
            </p>
            <p className="text-xs text-nexa-text-secondary mt-1">Stipends, contractor & staff pay</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Monthly Gross Margin</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              ₦{grossMonthlyMargin.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-400 mt-1 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> {grossMarginPercent}% Contract Gross Margin
            </p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Stipend Recipients</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              {compensationScales.reduce((sum, s) => sum + s.activeRecipients, 0)} Members
            </p>
            <p className="text-xs text-nexa-text-secondary mt-1">Across 3 approved scales</p>
          </div>
        </section>

        {/* COMPENSATION TIERS & STIPEND SCALES */}
        <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-500" />
                Workforce Compensation & Stipend Scales
              </h2>
              <p className="text-xs text-nexa-text-secondary">
                Standardised remuneration framework for interns, technical contractors, and permanent staff.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {compensationScales.map((scale) => (
              <div
                key={scale.id}
                className="p-5 bg-nexa-surface/70 rounded-xl border border-nexa-border space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {scale.category}
                  </span>
                  <NexaBadge variant="secondary" className="text-[10px]">
                    {scale.activeRecipients} Active
                  </NexaBadge>
                </div>

                <h3 className="text-sm font-bold text-nexa-text-primary">{scale.tier}</h3>

                <div className="space-y-1.5 py-2 border-y border-nexa-border/60 text-xs">
                  <div className="flex justify-between">
                    <span className="text-nexa-text-secondary">Base Stipend/Salary:</span>
                    <span className="font-mono text-nexa-text-primary">₦{scale.monthlyAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nexa-text-secondary">Transport / Data Allowance:</span>
                    <span className="font-mono text-nexa-text-primary">₦{scale.allowance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-nexa-border/40 text-emerald-400">
                    <span>Total Monthly Package:</span>
                    <span className="font-mono">₦{scale.totalMonthly.toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-[11px] text-nexa-text-secondary">
                  Total Monthly Allocation: <strong>₦{(scale.totalMonthly * scale.activeRecipients).toLocaleString()}</strong>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CLIENT CONTRACT PROFITABILITY & DIRECT COST ALLOCATION */}
        <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-nexa-text-primary">Contract Profitability & Labor Margin Analysis</h3>
              <p className="text-xs text-nexa-text-secondary">
                Direct monthly billable hours compared against personnel stipend and labor costs.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-nexa-surface/60 text-nexa-text-secondary uppercase text-[10px] tracking-wider border-b border-nexa-border">
                <tr>
                  <th className="py-3 px-4">Client Organization</th>
                  <th className="py-3 px-4">Deployed Specialist</th>
                  <th className="py-3 px-4">Contract Scope</th>
                  <th className="py-3 px-4">Monthly Client Fee</th>
                  <th className="py-3 px-4">Direct Labor Cost</th>
                  <th className="py-3 px-4">Net Contribution</th>
                  <th className="py-3 px-4 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nexa-border/60">
                {deployments.map((d) => {
                  const net = d.billingRateMonthly - d.costRateMonthly;
                  const pct = Math.round((net / d.billingRateMonthly) * 100);
                  return (
                    <tr key={d.id} className="hover:bg-nexa-surface/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-nexa-text-primary">{d.clientName}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-nexa-text-primary">{d.personName}</div>
                        <div className="text-[10px] text-nexa-text-secondary">{d.role}</div>
                      </td>
                      <td className="py-3.5 px-4 text-nexa-text-secondary">{d.contractTitle}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        ₦{d.billingRateMonthly.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-nexa-text-secondary">
                        ₦{d.costRateMonthly.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                        ₦{net.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                        +{pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </ErpAdminShell>
  );
}
