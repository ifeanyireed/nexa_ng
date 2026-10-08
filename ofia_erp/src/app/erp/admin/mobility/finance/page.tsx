"use client";

import React from "react";
import { Calculator, DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function FinancePricingPage() {
  return (
    <ErpAdminShell
      title="Pricing Engine & Finance"
      subtitle="Analyze profitability, simulate trip margins, and manage fleet finances."
      activeModule="mobility"
    >
      <div className="space-y-8">
        {/* Finance KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Gross Revenue (MTD)</h3>
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">₦12.4M</p>
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> 8% vs last month
            </p>
          </div>
          <div className="p-5 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Operating Costs</h3>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">₦4.1M</p>
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> 12% vs last month
            </p>
          </div>
          <div className="p-5 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Net Margin</h3>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">67%</p>
            <p className="text-xs text-emerald-500 mt-2 font-medium">Healthy</p>
          </div>
          <div className="p-5 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Driver Payouts (Pending)</h3>
              <DollarSign className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">₦845k</p>
            <button className="text-xs text-blue-500 font-medium hover:underline mt-2">Process Payouts</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pricing Simulator */}
          <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm p-6">
            <div className="flex items-center gap-2 border-b border-nexa-border pb-4 mb-4">
              <Calculator className="w-6 h-6 text-blue-500" />
              <h2 className="text-base font-semibold text-nexa-text-primary">Trip Profitability Simulator</h2>
            </div>
            <p className="text-xs text-nexa-text-secondary mb-6">Calculate expected profit and margin for hypothetical trips.</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-nexa-text-secondary mb-1">Estimated Distance (KM)</label>
                  <input type="number" defaultValue={150} className="w-full bg-nexa-bg-base border border-nexa-border rounded-lg px-3 py-2 text-sm text-nexa-text-primary focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-nexa-text-secondary mb-1">Duration (Days)</label>
                  <input type="number" defaultValue={2} className="w-full bg-nexa-bg-base border border-nexa-border rounded-lg px-3 py-2 text-sm text-nexa-text-primary focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-nexa-text-secondary mb-1">Fuel Cost (Est)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-nexa-text-secondary text-sm">₦</span>
                    <input type="number" defaultValue={25000} className="w-full bg-nexa-bg-base border border-nexa-border rounded-lg pl-7 pr-3 py-2 text-sm text-nexa-text-primary focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-nexa-text-secondary mb-1">Driver Cost</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-nexa-text-secondary text-sm">₦</span>
                    <input type="number" defaultValue={30000} className="w-full bg-nexa-bg-base border border-nexa-border rounded-lg pl-7 pr-3 py-2 text-sm text-nexa-text-primary focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-nexa-text-secondary mb-1">Tolls & Other Costs</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-nexa-text-secondary text-sm">₦</span>
                    <input type="number" defaultValue={5000} className="w-full bg-nexa-bg-base border border-nexa-border rounded-lg pl-7 pr-3 py-2 text-sm text-nexa-text-primary focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-nexa-text-secondary mb-1">Target Markup (%)</label>
                  <input type="number" defaultValue={30} className="w-full bg-nexa-bg-base border border-nexa-border rounded-lg px-3 py-2 text-sm text-nexa-text-primary focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 flex flex-col items-center">
                <p className="text-xs text-blue-600 font-medium mb-1">Suggested Customer Price</p>
                <p className="text-3xl font-bold text-blue-600">₦78,000</p>
                <div className="flex gap-4 mt-3 text-xs">
                  <span className="text-nexa-text-secondary">Total Cost: <strong className="text-nexa-text-primary">₦60,000</strong></span>
                  <span className="text-emerald-500">Expected Profit: <strong>₦18,000</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Fleet Health & Profitability */}
          <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm p-6">
            <h2 className="text-base font-semibold text-nexa-text-primary border-b border-nexa-border pb-4 mb-4">Fleet Profitability Intelligence</h2>
            <div className="space-y-4">
              <div className="p-4 border border-emerald-500/30 rounded-xl flex items-center justify-between bg-emerald-500/5">
                <div>
                  <p className="font-bold text-sm text-nexa-text-primary">KJA-992 (Coaster)</p>
                  <p className="text-xs text-nexa-text-secondary mt-1">Generated ₦1.2M • Maintenance: ₦45k</p>
                </div>
                <div className="text-right">
                  <NexaBadge variant="emerald" size="sm">Excellent</NexaBadge>
                  <p className="text-xs font-bold text-emerald-500 mt-1.5">96% ROI</p>
                </div>
              </div>

              <div className="p-4 border border-nexa-border rounded-xl flex items-center justify-between bg-nexa-surface">
                <div>
                  <p className="font-bold text-sm text-nexa-text-primary">EPE-441 (Hiace)</p>
                  <p className="text-xs text-nexa-text-secondary mt-1">Generated ₦850k • Maintenance: ₦120k</p>
                </div>
                <div className="text-right">
                  <NexaBadge variant="brand" size="sm">Healthy</NexaBadge>
                  <p className="text-xs font-bold text-blue-500 mt-1.5">85% ROI</p>
                </div>
              </div>

              <div className="p-4 border border-red-500/30 rounded-xl flex items-center justify-between bg-red-500/5">
                <div>
                  <p className="font-bold text-sm text-nexa-text-primary">AAA-123 (Camry)</p>
                  <p className="text-xs text-nexa-text-secondary mt-1">Generated ₦200k • Maintenance: ₦250k</p>
                  <p className="text-xs text-red-500 font-medium mt-1">Destroying margin due to excessive repairs.</p>
                </div>
                <div className="text-right">
                  <NexaBadge variant="amber" size="sm">Replace</NexaBadge>
                  <p className="text-xs font-bold text-red-500 mt-1.5">-25% ROI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErpAdminShell>
  );
}
