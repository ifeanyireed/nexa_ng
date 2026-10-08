"use client";

import React from "react";
import { Plus, Truck, AlertCircle, TrendingUp } from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function CorporateVehiclesPage() {
  return (
    <ErpAdminShell
      title="Corporate Vehicles & ROI"
      subtitle="Track and manage your registered vehicles and their ROI."
      activeModule="mobility"
      action={
        <NexaButton size="sm" variant="primary" className="gap-2 text-xs">
          <Plus className="w-4 h-4" />
          Register Vehicle
        </NexaButton>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm p-6 flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-xl flex items-center justify-center text-3xl">
              🚌
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h2 className="font-bold text-base text-nexa-text-primary">Toyota Coaster (2018)</h2>
                <NexaBadge variant="emerald" size="sm">Active</NexaBadge>
              </div>
              <p className="text-nexa-text-secondary text-xs">Plate: AAA-17JL • 28 Seats</p>
              <div className="mt-4 pt-3 border-t border-nexa-border flex justify-between text-xs">
                <span className="text-nexa-text-secondary">Assigned Driver: <strong className="text-nexa-text-primary">Mr Ajit</strong></span>
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Monthly ROI: ₦450k
                </span>
              </div>
            </div>
          </div>

          <div className="bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm p-6 flex items-start gap-4">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl flex items-center justify-center text-3xl">
              🚐
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h2 className="font-bold text-base text-nexa-text-primary">Toyota Hiace</h2>
                <NexaBadge variant="amber" size="sm">Maintenance</NexaBadge>
              </div>
              <p className="text-nexa-text-secondary text-xs">Plate: GGE-990KL • 14 Seats</p>
              <div className="mt-4 pt-3 border-t border-nexa-border flex justify-between text-xs">
                <span className="text-nexa-text-secondary">Assigned Driver: <span className="text-nexa-text-secondary italic">Unassigned</span></span>
                <span className="font-medium text-nexa-text-secondary">Monthly ROI: ₦120k</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErpAdminShell>
  );
}
