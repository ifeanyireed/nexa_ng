"use client";

import React from "react";
import { Users, Clock, Settings, Search, Plus } from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function ShuttleServicePage() {
  return (
    <ErpAdminShell
      title="Shuttle Service"
      subtitle="Manage daily commuter routes, schedules, and passenger manifests."
      activeModule="mobility"
      action={
        <div className="flex gap-2">
          <NexaButton size="sm" variant="outline" className="gap-2 text-xs">
            <Settings className="w-3.5 h-3.5" /> Configure Seats
          </NexaButton>
          <NexaButton size="sm" variant="primary" className="gap-2 text-xs">
            <Plus className="w-3.5 h-3.5" /> Add Schedule
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Col - Schedules & Routes */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm overflow-hidden">
              <div className="p-4 border-b border-nexa-border flex justify-between items-center">
                <h2 className="font-semibold text-sm text-nexa-text-primary">Today's Active Schedules</h2>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-nexa-text-secondary" />
                  <input 
                    type="text" 
                    placeholder="Search route..." 
                    className="pl-8 pr-3 py-1.5 bg-nexa-bg-base border border-nexa-border rounded-lg text-xs w-56 text-nexa-text-primary focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-nexa-bg-base/50 border-b border-nexa-border text-xs text-nexa-text-secondary">
                  <tr>
                    <th className="p-4 font-semibold">Route</th>
                    <th className="p-4 font-semibold">Time</th>
                    <th className="p-4 font-semibold">Vehicle & Driver</th>
                    <th className="p-4 font-semibold">Bookings</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nexa-border text-xs">
                  <tr className="hover:bg-blue-500/5 cursor-pointer">
                    <td className="p-4 font-medium text-blue-600">RTE-01: VI &rarr; Lekki</td>
                    <td className="p-4">
                      <p className="font-medium text-nexa-text-primary">08:00 AM</p>
                      <p className="text-[11px] text-nexa-text-secondary">Arrives 09:15 AM</p>
                    </td>
                    <td className="p-4">
                      <p className="text-nexa-text-primary">KJA-992 (Coaster)</p>
                      <p className="text-[11px] text-nexa-text-secondary">John Doe</p>
                    </td>
                    <td className="p-4 font-medium text-nexa-text-primary">24 / 28</td>
                    <td className="p-4">
                      <NexaBadge variant="emerald" size="sm">Boarding</NexaBadge>
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-500/5 cursor-pointer">
                    <td className="p-4 font-medium text-blue-600">RTE-02: Yaba &rarr; VI</td>
                    <td className="p-4">
                      <p className="font-medium text-nexa-text-primary">09:30 AM</p>
                      <p className="text-[11px] text-nexa-text-secondary">Arrives 10:45 AM</p>
                    </td>
                    <td className="p-4">
                      <p className="text-nexa-text-primary">EPE-441 (Hiace)</p>
                      <p className="text-[11px] text-nexa-text-secondary">Mike Smith</p>
                    </td>
                    <td className="p-4 font-medium text-nexa-text-primary">12 / 14</td>
                    <td className="p-4">
                      <NexaBadge variant="slate" size="sm">Scheduled</NexaBadge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Col - Seat Map & Manifest */}
          <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm p-4 flex flex-col h-[560px]">
            <h2 className="font-semibold text-sm text-nexa-text-primary border-b border-nexa-border pb-3 mb-4">Passenger Manifest (RTE-01)</h2>
            
            {/* Seat Map Visualizer */}
            <div className="bg-nexa-bg-base/60 rounded-xl p-5 flex flex-col items-center justify-center mb-4 flex-none border border-nexa-border">
               <div className="w-full max-w-[120px] bg-nexa-surface border-2 border-nexa-border p-2 rounded-t-3xl rounded-b-lg shadow-inner">
                 <div className="flex justify-between mb-4 px-2">
                   <div className="w-6 h-6 border border-nexa-border rounded flex items-center justify-center text-[10px] bg-nexa-bg-base font-bold text-nexa-text-secondary">D</div>
                   <div className="w-6 h-6"></div> {/* Door */}
                 </div>
                 
                 {/* Mock Seats */}
                 {[1, 2, 3, 4, 5].map((row) => (
                   <div key={row} className="flex justify-between mb-2">
                     <div className="flex gap-1">
                       <div className="w-6 h-6 bg-blue-600 rounded text-white text-[10px] flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"></div>
                       <div className="w-6 h-6 bg-blue-600 rounded text-white text-[10px] flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"></div>
                     </div>
                     <div className="w-6 h-6 bg-nexa-border/80 rounded text-nexa-text-secondary text-[10px] flex items-center justify-center border border-nexa-border border-dashed"></div>
                   </div>
                 ))}
                 <div className="flex justify-between">
                     <div className="w-6 h-6 bg-blue-600 rounded text-white text-[10px] flex items-center justify-center"></div>
                     <div className="w-6 h-6 bg-blue-600 rounded text-white text-[10px] flex items-center justify-center"></div>
                     <div className="w-6 h-6 bg-blue-600 rounded text-white text-[10px] flex items-center justify-center"></div>
                 </div>
               </div>
               <p className="text-[11px] text-nexa-text-secondary mt-3 text-center">Click a blue seat to view passenger</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              <h3 className="text-xs font-semibold text-nexa-text-secondary mb-2">Selected Passenger: Seat 3A</h3>
              <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-xs text-nexa-text-primary">Sarah Jenkins</p>
                  <NexaBadge variant="emerald" size="sm">Boarded</NexaBadge>
                </div>
                <p className="text-xs text-nexa-text-secondary">Booking Ref: #BK-8932</p>
                <p className="text-xs text-nexa-text-secondary">Pickup: Ademola Adetokunbo St</p>
                <p className="text-xs text-nexa-text-secondary">Drop-off: CMS Bus Stop</p>
                <button className="mt-2 text-xs text-blue-600 font-medium hover:underline">View Full Booking</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErpAdminShell>
  );
}
