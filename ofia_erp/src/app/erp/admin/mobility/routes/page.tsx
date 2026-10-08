"use client";

import React from "react";
import { Plus, MapPin } from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function TenantRoutesPage() {
  return (
    <ErpAdminShell
      title="Routes & Schedules"
      subtitle="Manage your shuttle and interstate routes, bus stops, and schedules."
      activeModule="mobility"
      action={
        <NexaButton size="sm" variant="primary" className="gap-2 text-xs">
          <Plus className="w-4 h-4" />
          Create Route
        </NexaButton>
      }
    >
      <div className="space-y-6">
        <div className="bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-nexa-bg-base/50 border-b border-nexa-border text-xs text-nexa-text-secondary">
              <tr>
                <th className="p-4 font-semibold">Route Code</th>
                <th className="p-4 font-semibold">Origin &rarr; Destination</th>
                <th className="p-4 font-semibold">Service Type</th>
                <th className="p-4 font-semibold">Base Price</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexa-border text-xs">
              <tr>
                <td className="p-4 font-bold text-blue-600">RTE-401</td>
                <td className="p-4 text-nexa-text-primary">Ademola Adetokunbo &rarr; CMS</td>
                <td className="p-4 text-nexa-text-secondary">Shuttle</td>
                <td className="p-4 font-medium text-nexa-text-primary">₦1,200</td>
                <td className="p-4">
                  <NexaBadge variant="emerald" size="sm">Active</NexaBadge>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-blue-600">RTE-402</td>
                <td className="p-4 text-nexa-text-primary">Lekki Phase 1 &rarr; VI</td>
                <td className="p-4 text-nexa-text-secondary">Shuttle</td>
                <td className="p-4 font-medium text-nexa-text-primary">₦1,500</td>
                <td className="p-4">
                  <NexaBadge variant="emerald" size="sm">Active</NexaBadge>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-blue-600">INT-105</td>
                <td className="p-4 text-nexa-text-primary">Lagos &rarr; Abuja</td>
                <td className="p-4 text-nexa-text-secondary">Interstate</td>
                <td className="p-4 font-medium text-nexa-text-primary">₦35,000</td>
                <td className="p-4">
                  <NexaBadge variant="emerald" size="sm">Active</NexaBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ErpAdminShell>
  );
}
