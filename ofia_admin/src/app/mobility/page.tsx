"use client";

import React, { useState } from 'react';
import { Building, Car, CreditCard, Activity, Users, AlertTriangle, ShieldCheck, CheckCircle2, Search, ArrowUpRight } from 'lucide-react';
import { SuperAdminShell } from '@/components/admin/SuperAdminShell';
import { AdminStatGrid, AdminStatItem } from '@/components/admin/AdminStatCard';
import { NexaCard } from '@/components/nexa/NexaCard';
import { NexaBadge } from '@/components/nexa/NexaBadge';
import { NexaButton } from '@/components/nexa/NexaButton';

export default function MobilitySuperAdminDashboard() {
  const kpis: AdminStatItem[] = [
    {
      label: "Active Transport Orgs",
      value: "24 Fleets",
      change: "+3 Pending Onboarding",
      trend: "up",
      changeType: "success",
      icon: <Building className="w-5 h-5 text-blue-500" />,
      sub: "Verified Commute Carriers",
    },
    {
      label: "Total Fleet Vehicles",
      value: "1,842 Units",
      change: "Across All Tenants",
      trend: "up",
      changeType: "info",
      icon: <Car className="w-5 h-5 text-purple-500" />,
      sub: "Buses, Shuttles & Vans",
    },
    {
      label: "Mobility Platform Revenue",
      value: "₦42.5M",
      change: "+12% MoM Growth",
      trend: "up",
      changeType: "success",
      icon: <CreditCard className="w-5 h-5 text-emerald-500" />,
      sub: "Commission & Route Fares",
    },
    {
      label: "Active Live Trips",
      value: "156 In-Transit",
      change: "Live Telemetry Active",
      trend: "up",
      changeType: "warning",
      icon: <Activity className="w-5 h-5 text-amber-500" />,
      sub: "Operating Across Corridors",
    },
  ];

  const tenants = [
    { name: 'CityTransit Co.', status: 'Active', plan: 'Enterprise', vehicles: 450, routes: '14 Active' },
    { name: 'MetroLines Ltd.', status: 'Onboarding', plan: 'Pro', vehicles: 120, routes: '6 Pending' },
    { name: 'CampusShuttle NG', status: 'Active', plan: 'Basic', vehicles: 15, routes: '3 Dedicated' },
    { name: 'New Era Transports', status: 'Active', plan: 'Growth', vehicles: 85, routes: '8 Interstate' },
  ];

  return (
    <SuperAdminShell
      title="Ofia Mobility Manager"
      subtitle="Super Admin telemetry and operations control layer for Transport Companies, corporate commute, and fleet intelligence."
    >
      <div className="space-y-8">
        {/* KPI STAT CARDS */}
        <AdminStatGrid stats={kpis} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tenant Fleet Activity */}
          <NexaCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-nexa-text-primary">Tenant Fleet Activity</h2>
                <p className="text-xs text-nexa-text-muted mt-0.5">Commercial transport operators onboarded on Ofia</p>
              </div>
              <NexaBadge variant="brand" className="text-xs">24 Active</NexaBadge>
            </div>
            <div className="divide-y divide-nexa-border">
              {tenants.map((tenant, i) => (
                <div key={i} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-nexa-bg-base border border-nexa-border rounded-xl flex items-center justify-center">
                      <Car className="w-5 h-5 text-nexa-brand" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-nexa-text-primary">{tenant.name}</p>
                      <p className="text-xs text-nexa-text-muted">{tenant.plan} Plan • {tenant.vehicles} Vehicles • {tenant.routes}</p>
                    </div>
                  </div>
                  <div>
                    <NexaBadge
                      variant={tenant.status === 'Active' ? 'success' : 'warning'}
                      className="text-xs"
                    >
                      {tenant.status}
                    </NexaBadge>
                  </div>
                </div>
              ))}
            </div>
          </NexaCard>

          {/* System Alerts */}
          <NexaCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-nexa-text-primary">Mobility System Alerts</h2>
                <p className="text-xs text-nexa-text-muted mt-0.5">Real-time telemetry and dispatch warnings</p>
              </div>
              <NexaBadge variant="warning" className="text-xs">Live Telemetry</NexaBadge>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">Payment Gateway Delay</p>
                  <p className="text-[11px] mt-0.5 opacity-90 text-nexa-text-muted">Paystack webhook settlements experiencing minor 5-min transit queues. Monitoring situation.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl">
                <Users className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">Tenant Quota Threshold</p>
                  <p className="text-[11px] mt-0.5 opacity-90 text-nexa-text-muted">CityTransit Co. is at 98% of their assigned driver allocation capacity for this billing month.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">GPS Telemetry Engine Operational</p>
                  <p className="text-[11px] mt-0.5 opacity-90 text-nexa-text-muted">All active vehicle transponders reporting live 30s heartbeat telemetry across expressways.</p>
                </div>
              </div>
            </div>
          </NexaCard>
        </div>
      </div>
    </SuperAdminShell>
  );
}
