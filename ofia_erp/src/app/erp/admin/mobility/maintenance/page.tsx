"use client";

import React from "react";
import { Wrench, Calendar, AlertTriangle, PenTool, ShieldAlert } from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function MaintenancePage() {
  return (
    <ErpAdminShell
      title="Maintenance & Compliance"
      subtitle="Track vehicle health, schedule repairs, and monitor compliance expiry."
      activeModule="mobility"
      action={
        <NexaButton size="sm" variant="primary" className="gap-2 text-xs">
          <Wrench className="w-4 h-4" />
          Log Maintenance
        </NexaButton>
      }
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Active Jobs</h3>
              <PenTool className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">5</p>
            <p className="text-xs text-nexa-text-secondary mt-2">Vehicles currently in workshop</p>
          </div>
          <div className="p-5 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Overdue Service</h3>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">2</p>
            <p className="text-xs text-nexa-text-secondary mt-2">Past mileage interval</p>
          </div>
          <div className="p-5 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Compliance Alerts</h3>
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">1</p>
            <p className="text-xs text-nexa-text-secondary mt-2">Insurance/Papers expiring</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Maintenance Schedule & Jobs */}
          <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="p-4 border-b border-nexa-border flex justify-between items-center">
              <h2 className="font-semibold text-sm text-nexa-text-primary">Recent & Scheduled Maintenance</h2>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-nexa-bg-base/50 border-b border-nexa-border text-xs text-nexa-text-secondary">
                <tr>
                  <th className="p-4 font-semibold">Vehicle</th>
                  <th className="p-4 font-semibold">Job Description</th>
                  <th className="p-4 font-semibold">Cost</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nexa-border text-xs">
                <tr>
                  <td className="p-4">
                    <p className="font-medium text-blue-600">KJA-992</p>
                    <p className="text-nexa-text-secondary">Toyota Coaster</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-nexa-text-primary">10,000km Routine Service</p>
                    <p className="text-nexa-text-secondary">Oil change, filters, brakes</p>
                  </td>
                  <td className="p-4 font-medium text-nexa-text-primary">₦45,000</td>
                  <td className="p-4">
                    <NexaBadge variant="brand" size="sm">In Workshop</NexaBadge>
                  </td>
                </tr>
                <tr>
                  <td className="p-4">
                    <p className="font-medium text-blue-600">EPE-441</p>
                    <p className="text-nexa-text-secondary">Toyota Hiace</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-nexa-text-primary">A/C Compressor Replacement</p>
                    <p className="text-nexa-text-secondary">Reported by driver</p>
                  </td>
                  <td className="p-4 font-medium text-nexa-text-primary">₦120,000</td>
                  <td className="p-4">
                    <NexaBadge variant="slate" size="sm">Scheduled</NexaBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Compliance Alerts */}
          <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm p-4 h-fit">
            <div className="border-b border-nexa-border pb-3 mb-4">
              <h2 className="font-semibold text-sm text-nexa-text-primary">Compliance & Expiry Tracker</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="w-full">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-xs text-red-600">Vehicle Insurance Expired</p>
                    <button className="text-[10px] bg-red-500/20 px-2 py-0.5 rounded font-medium hover:bg-red-500/30">Update</button>
                  </div>
                  <p className="text-xs mt-1 font-medium text-nexa-text-primary">AAA-123 (Toyota Camry)</p>
                  <p className="text-[11px] mt-1 text-nexa-text-secondary">Expired on Oct 04, 2026. Vehicle has been auto-flagged as unavailable for trips.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl">
                <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="w-full">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-xs text-amber-600">Road Worthiness Expiring</p>
                    <button className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded font-medium hover:bg-amber-500/30">Update</button>
                  </div>
                  <p className="text-xs mt-1 font-medium text-nexa-text-primary">LSR-901 (Mercedes Sprinter)</p>
                  <p className="text-[11px] mt-1 text-nexa-text-secondary">Expires in 14 days (Oct 20, 2026).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErpAdminShell>
  );
}
