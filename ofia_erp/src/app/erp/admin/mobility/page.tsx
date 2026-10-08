"use client";

import React from "react";
import { 
  Car, 
  Banknote, 
  Activity, 
  AlertTriangle,
  Clock, 
  ShieldAlert, 
  Users,
  TrendingUp,
  Radio
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import Link from "next/link";

export default function TenantFleetCommandCentre() {
  return (
    <ErpAdminShell
      title="Fleet Command Centre"
      subtitle="Your daily operations, revenue, and fleet status at a glance."
      activeModule="mobility"
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/ops/mobility">
            <NexaButton size="sm" variant="primary" className="gap-2 text-xs">
              <Radio className="w-4 h-4 animate-pulse" />
              Live Ops Console
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">

        {/* Top KPI Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Revenue Today</h3>
              <Banknote className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">₦1,245,000</p>
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +15% vs yesterday
            </p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Active Trips</h3>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">12</p>
            <p className="text-xs text-nexa-text-secondary mt-2">48 trips completed today</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Available Vehicles</h3>
              <Car className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">8 / 45</p>
            <p className="text-xs text-nexa-text-secondary mt-2">12 on trip, 5 in maintenance</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Available Drivers</h3>
              <Users className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">5 / 40</p>
            <p className="text-xs text-nexa-text-secondary mt-2">12 on trip, 2 on leave</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Fleet Status */}
          <section className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-nexa-text-primary mb-4">Fleet Status</h2>
            <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm p-6">
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-full border-8 border-nexa-border/60 flex items-center justify-center relative">
                  <span className="text-xl font-bold text-nexa-text-primary">45</span>
                  <span className="absolute bottom-6 text-xs text-nexa-text-secondary">Total</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span> Active (On Trip)
                    </span>
                    <span className="font-semibold text-nexa-text-primary">12</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Available (Parked)
                    </span>
                    <span className="font-semibold text-nexa-text-primary">8</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span> Maintenance
                    </span>
                    <span className="font-semibold text-nexa-text-primary">5</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-400"></span> Unavailable
                    </span>
                    <span className="font-semibold text-nexa-text-primary">20</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Attention Required */}
          <section>
            <h2 className="text-lg font-semibold text-nexa-text-primary mb-4">Attention Required</h2>
            <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm p-4 space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Document Expiring</p>
                  <p className="text-xs mt-1 text-nexa-text-secondary">Vehicle AAA-123 license expires in 2 days.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-lg">
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Overdue for Service</p>
                  <p className="text-xs mt-1 text-nexa-text-secondary">Vehicle KJA-882 is 500km past maintenance schedule.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 rounded-lg">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Trip Without Driver</p>
                  <p className="text-xs mt-1 text-nexa-text-secondary">Shuttle route 4 (2:00 PM) has no assigned driver.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ErpAdminShell>
  );
}
