"use client";

import React from "react";
import { Map, Zap, Settings, TrendingUp, Plus } from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function OnDemandServicePage() {
  return (
    <ErpAdminShell
      title="On-Demand Dispatch"
      subtitle="Configure ride-hailing service zones, base fares, and dynamic pricing rules."
      activeModule="mobility"
      action={
        <NexaButton size="sm" variant="primary" className="gap-2 text-xs">
          <Plus className="w-3.5 h-3.5" /> Create Zone
        </NexaButton>
      }
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Zones Configuration */}
          <div className="lg:col-span-2 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-nexa-border flex items-center gap-2">
              <Map className="w-4 h-4 text-blue-500" />
              <h2 className="font-semibold text-sm text-nexa-text-primary">Operating Zones & Base Fares</h2>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-nexa-bg-base/50 border-b border-nexa-border text-xs text-nexa-text-secondary">
                <tr>
                  <th className="p-4 font-semibold">Zone Name</th>
                  <th className="p-4 font-semibold">Operating Hours</th>
                  <th className="p-4 font-semibold">Base Fare</th>
                  <th className="p-4 font-semibold">Per KM</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nexa-border text-xs">
                <tr>
                  <td className="p-4 font-medium text-nexa-text-primary">Lagos Island / VI</td>
                  <td className="p-4 text-nexa-text-secondary">24/7</td>
                  <td className="p-4 font-medium text-nexa-text-primary">₦1,500</td>
                  <td className="p-4 text-nexa-text-secondary">₦200</td>
                  <td className="p-4">
                    <NexaBadge variant="emerald" size="sm">Active</NexaBadge>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-nexa-text-primary">Mainland Central</td>
                  <td className="p-4 text-nexa-text-secondary">05:00 - 23:00</td>
                  <td className="p-4 font-medium text-nexa-text-primary">₦1,000</td>
                  <td className="p-4 text-nexa-text-secondary">₦150</td>
                  <td className="p-4">
                    <NexaBadge variant="emerald" size="sm">Active</NexaBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Peak Pricing Rules */}
          <div className="space-y-4">
            <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm p-4">
              <div className="flex items-center gap-2 border-b border-nexa-border pb-3 mb-3">
                <Zap className="w-4 h-4 text-amber-500" />
                <h2 className="font-semibold text-sm text-nexa-text-primary">Surge & Peak Pricing</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-nexa-bg-base/60 rounded-xl border border-nexa-border">
                  <div>
                    <p className="font-semibold text-xs text-nexa-text-primary">Morning Rush Hour</p>
                    <p className="text-[11px] text-nexa-text-secondary">Mon-Fri, 07:00 - 09:30 AM</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-500 text-sm">1.5x</p>
                    <NexaBadge variant="amber" size="sm">Active</NexaBadge>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-nexa-bg-base/60 rounded-xl border border-nexa-border">
                  <div>
                    <p className="font-semibold text-xs text-nexa-text-primary">Rain / Bad Weather</p>
                    <p className="text-[11px] text-nexa-text-secondary">Manual Trigger Required</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-500 text-sm">2.0x</p>
                    <button className="mt-1 text-xs bg-nexa-surface border border-nexa-border px-2 py-0.5 rounded text-nexa-text-primary hover:bg-nexa-border">Activate</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErpAdminShell>
  );
}
