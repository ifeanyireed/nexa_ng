"use client";

import React from "react";
import { 
  Map as MapIcon, 
  Car, 
  User, 
  AlertCircle, 
  Filter,
  PhoneCall,
  Navigation,
  Radio,
  Clock
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function OpsCommandCentre() {
  return (
    <ErpAdminShell
      title="Live Operations Command Centre"
      subtitle="Real-time dispatch, tracking, and incident management."
      activeModule="mobility"
      action={
        <div className="flex items-center gap-2">
          <NexaButton size="sm" variant="outline" className="gap-2 text-xs">
            <Filter className="w-3.5 h-3.5" />
            Filter by Service
          </NexaButton>
          <NexaButton size="sm" variant="primary" className="gap-2 text-xs bg-red-600 hover:bg-red-700 text-white">
            <AlertCircle className="w-3.5 h-3.5" />
            Report Incident
          </NexaButton>
        </div>
      }
    >
      <div className="flex flex-col h-[calc(100vh-14rem)] bg-nexa-surface border border-nexa-border rounded-2xl overflow-hidden shadow-sm">
        {/* Main Content Area - Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Incoming & Live Requests */}
          <div className="w-80 flex-none border-r border-nexa-border bg-nexa-bg-base/40 overflow-y-auto">
            <div className="p-4 border-b border-nexa-border bg-nexa-surface sticky top-0 z-10">
              <h2 className="font-semibold text-sm text-nexa-text-primary">Dispatch Queue</h2>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded text-xs font-medium">On-Demand (5)</span>
                <span className="px-2 py-0.5 bg-nexa-border text-nexa-text-secondary rounded text-xs font-medium">Shuttle (2)</span>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-nexa-surface p-3 rounded-xl border border-nexa-border shadow-sm hover:border-blue-400 cursor-pointer transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Unassigned</span>
                    <span className="text-[10px] text-nexa-text-secondary">2 min ago</span>
                  </div>
                  <h3 className="font-medium text-sm text-nexa-text-primary">Ride Request • VIP</h3>
                  <div className="mt-2 space-y-1 text-xs text-nexa-text-secondary">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="truncate">12 Ademola Adetokunbo St</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                      <span className="truncate">Murtala Muhammed Airport</span>
                    </div>
                  </div>
                  <button className="w-full mt-3 py-1.5 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-lg text-xs font-semibold hover:bg-blue-500/20 transition-colors">
                    Assign Driver
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Center Panel - Live Map Area */}
          <div className="flex-1 bg-nexa-bg-base/70 relative flex items-center justify-center">
            {/* Map placeholder */}
            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            <div className="z-10 flex flex-col items-center text-center p-6 text-nexa-text-secondary">
              <MapIcon className="w-16 h-16 mb-4 text-blue-500/40" />
              <p className="font-semibold text-nexa-text-primary">Live Map Engine Ready</p>
              <p className="text-xs max-w-sm mt-1">Displays real-time vehicle telemetry, driver status, active trips, and geofenced service zones.</p>
            </div>

            {/* Map Controls (Floating) */}
            <div className="absolute top-4 right-4 bg-nexa-surface rounded-xl shadow border border-nexa-border p-1 space-y-1 z-20">
              <button className="p-2 hover:bg-nexa-bg-base rounded-lg text-nexa-text-secondary" title="Vehicles"><Car className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-nexa-bg-base rounded-lg text-nexa-text-secondary" title="Drivers"><User className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-nexa-bg-base rounded-lg text-nexa-text-secondary" title="Zones"><Navigation className="w-4 h-4" /></button>
            </div>

            {/* Mock Vehicle Popover on Map */}
            <div className="absolute bottom-10 left-10 bg-nexa-surface rounded-xl shadow-lg border border-nexa-border p-4 w-64 z-20">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-sm text-nexa-text-primary">AAA-123-XY</p>
                  <p className="text-xs text-blue-600 font-medium">Shuttle • Route 4</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1"></span>
              </div>
              <div className="space-y-1.5 text-xs text-nexa-text-secondary">
                <p className="flex justify-between"><span>Driver:</span> <span className="font-medium text-nexa-text-primary">John Doe</span></p>
                <p className="flex justify-between"><span>Speed:</span> <span>45 km/h</span></p>
                <p className="flex justify-between"><span>Pax:</span> <span>12/28</span></p>
                <p className="flex justify-between"><span>ETA Next:</span> <span className="text-emerald-500 font-semibold">4 mins</span></p>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-nexa-bg-base text-nexa-text-primary rounded-lg text-xs font-medium hover:bg-nexa-border transition-colors">
                  <PhoneCall className="w-3 h-3" /> Contact
                </button>
                <button className="flex-1 py-1.5 bg-nexa-bg-base text-nexa-text-primary rounded-lg text-xs font-medium hover:bg-nexa-border transition-colors">
                  Details
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Timeline & Operations */}
          <div className="w-96 flex-none border-l border-nexa-border bg-nexa-surface flex flex-col">
            <div className="p-4 border-b border-nexa-border">
              <h2 className="font-semibold text-sm text-nexa-text-primary">Today's Timeline</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="relative pl-6 pb-4 border-l-2 border-nexa-border">
                <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[7px] top-1 border-2 border-nexa-surface"></div>
                <p className="text-[11px] text-nexa-text-secondary mb-0.5">10:45 AM • Shuttle Route 4</p>
                <p className="text-xs font-semibold text-nexa-text-primary">Trip Completed Successfully</p>
                <p className="text-[11px] text-nexa-text-secondary mt-1">Driver: John Doe • 24 Passengers</p>
              </div>
              <div className="relative pl-6 pb-4 border-l-2 border-nexa-border">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1 border-2 border-nexa-surface"></div>
                <p className="text-[11px] text-nexa-text-secondary mb-0.5">10:30 AM • On-Demand VIP</p>
                <p className="text-xs font-semibold text-nexa-text-primary">Driver Arrived at Pickup</p>
                <p className="text-[11px] text-nexa-text-secondary mt-1">Driver: Mike Smith • Vehicle: KJA-992</p>
              </div>
              <div className="relative pl-6 pb-4 border-l-2 border-nexa-border">
                <div className="absolute w-3 h-3 bg-red-500 rounded-full -left-[7px] top-1 border-2 border-nexa-surface animate-pulse"></div>
                <p className="text-[11px] text-red-500 font-medium mb-0.5">10:15 AM • Alert</p>
                <p className="text-xs font-semibold text-red-600">Vehicle Breakdown Reported</p>
                <p className="text-[11px] text-nexa-text-secondary mt-1">Route 2 • Vehicle EPE-441 is stranded. Replacement requested.</p>
                <button className="mt-2 text-xs text-white bg-red-600 px-3 py-1 rounded-md hover:bg-red-700">Handle Incident</button>
              </div>
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-slate-400 rounded-full -left-[7px] top-1 border-2 border-nexa-surface"></div>
                <p className="text-[11px] text-nexa-text-secondary mb-0.5">09:00 AM • System</p>
                <p className="text-xs font-semibold text-nexa-text-primary">Morning Shift Started</p>
                <p className="text-[11px] text-nexa-text-secondary mt-1">42 drivers clocked in.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErpAdminShell>
  );
}
