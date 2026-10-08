"use client";

import React from "react";
import { School, Users, AlertCircle, ShieldCheck, Plus } from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function SchoolServicePage() {
  return (
    <ErpAdminShell
      title="School Transport"
      subtitle="Manage school routes, student manifests, and parent profiles."
      activeModule="mobility"
      action={
        <NexaButton size="sm" variant="primary" className="gap-2 text-xs">
          <Plus className="w-3.5 h-3.5" /> Add School
        </NexaButton>
      }
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* School Profiles List */}
          <div className="md:col-span-2 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-nexa-border">
              <h2 className="font-semibold text-sm text-nexa-text-primary">Partner Schools</h2>
            </div>
            <div className="divide-y divide-nexa-border">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-nexa-text-primary">Greenwood International</p>
                    <p className="text-[11px] text-nexa-text-secondary">Lekki Phase 1 • 145 Students Enrolled</p>
                  </div>
                </div>
                <button className="text-xs text-blue-600 font-medium hover:underline">Manage Routes</button>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-nexa-text-primary">St. Saviour's School</p>
                    <p className="text-[11px] text-nexa-text-secondary">Ikoyi • 80 Students Enrolled</p>
                  </div>
                </div>
                <button className="text-xs text-blue-600 font-medium hover:underline">Manage Routes</button>
              </div>
            </div>
          </div>

          {/* Alerts & Missing */}
          <div className="space-y-4">
            <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm p-4">
              <h2 className="font-semibold text-xs text-nexa-text-primary border-b border-nexa-border pb-2 mb-3">Today's Missed Pickups</h2>
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-xs">David Ojo (Greenwood)</p>
                  <p className="text-[11px] mt-1 text-nexa-text-secondary">Parent marked absent via portal at 07:15 AM. Driver notified.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm p-4">
              <h2 className="font-semibold text-xs text-nexa-text-primary border-b border-nexa-border pb-2 mb-3">Guardian Approvals</h2>
              <div className="flex items-start gap-3 p-3 bg-nexa-bg-base/60 border border-nexa-border text-nexa-text-primary rounded-xl text-xs">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
                <div>
                  <p className="font-medium text-xs">Aisha Bello (St. Saviour's)</p>
                  <p className="text-[11px] mt-1 text-nexa-text-secondary">New authorized pickup person added by parent. Needs ID verification.</p>
                  <button className="mt-2 text-[10px] bg-nexa-surface border border-nexa-border px-2 py-0.5 rounded text-nexa-text-primary hover:bg-nexa-border">Review ID</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErpAdminShell>
  );
}
