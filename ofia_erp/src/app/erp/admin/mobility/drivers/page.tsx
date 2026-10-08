"use client";

import React from "react";
import { User, Star, Shield, Car, CheckCircle, Clock, Plus } from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function DriverManagementPage() {
  return (
    <ErpAdminShell
      title="Driver Management"
      subtitle="Manage driver profiles, performance, and onboarding verifications."
      activeModule="mobility"
      action={
        <NexaButton size="sm" variant="primary" className="gap-2 text-xs">
          <Plus className="w-4 h-4" />
          Add Driver
        </NexaButton>
      }
    >
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Active Drivers</h3>
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">142</p>
            <p className="text-xs text-nexa-text-secondary mt-2">Currently online or on trip</p>
          </div>
          <div className="p-5 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Avg. Rating</h3>
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">4.8</p>
            <p className="text-xs text-nexa-text-secondary mt-2">Based on 12k ratings</p>
          </div>
          <div className="p-5 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Pending Review</h3>
              <Shield className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">8</p>
            <p className="text-xs text-nexa-text-secondary mt-2">Documents awaiting approval</p>
          </div>
          <div className="p-5 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Incidents (30d)</h3>
              <Car className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">3</p>
            <p className="text-xs text-nexa-text-secondary mt-2">Reported across all services</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Driver List */}
          <div className="lg:col-span-2 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="p-4 border-b border-nexa-border flex justify-between items-center">
              <h2 className="font-semibold text-nexa-text-primary text-sm">Active Drivers</h2>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Search name or ID..." 
                  className="px-3 py-1.5 bg-nexa-bg-base border border-nexa-border rounded-lg text-xs w-48 text-nexa-text-primary focus:outline-none focus:border-blue-500" 
                />
              </div>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-nexa-bg-base/50 border-b border-nexa-border text-xs text-nexa-text-secondary">
                <tr>
                  <th className="p-4 font-semibold">Driver</th>
                  <th className="p-4 font-semibold">Performance</th>
                  <th className="p-4 font-semibold">Current Assignment</th>
                  <th className="p-4 font-semibold">License/Compliance</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nexa-border text-xs">
                <tr>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">MO</div>
                      <div>
                        <p className="font-medium text-nexa-text-primary">Michael Okon</p>
                        <p className="text-nexa-text-secondary">ID: DRV-8012</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3 h-3 fill-current" /> <span className="font-semibold text-nexa-text-primary">4.9</span>
                    </div>
                    <p className="text-nexa-text-secondary mt-0.5">452 Trips • 0 Incidents</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-nexa-text-primary">On-Demand</p>
                    <p className="text-nexa-text-secondary">Lexus ES350 (KJA-192)</p>
                  </td>
                  <td className="p-4">
                    <span className="text-emerald-500 flex items-center gap-1 font-medium"><CheckCircle className="w-3 h-3"/> Valid</span>
                  </td>
                  <td className="p-4">
                    <NexaBadge variant="emerald" size="sm">Online</NexaBadge>
                  </td>
                </tr>
                <tr>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-purple-500/10 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">SP</div>
                      <div>
                        <p className="font-medium text-nexa-text-primary">Samuel Peters</p>
                        <p className="text-nexa-text-secondary">ID: DRV-7210</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3 h-3 fill-current" /> <span className="font-semibold text-nexa-text-primary">4.5</span>
                    </div>
                    <p className="text-nexa-text-secondary mt-0.5">1,204 Trips • 2 Canceled</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-nexa-text-primary">Shuttle (RTE-04)</p>
                    <p className="text-nexa-text-secondary">Toyota Coaster (EPE-331)</p>
                  </td>
                  <td className="p-4">
                    <span className="text-amber-500 flex items-center gap-1 font-medium"><Clock className="w-3 h-3"/> Exp. in 12 days</span>
                  </td>
                  <td className="p-4">
                    <NexaBadge variant="brand" size="sm">On Trip</NexaBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Onboarding & Document Review */}
          <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm p-4 h-fit">
            <div className="border-b border-nexa-border pb-3 mb-4">
              <h2 className="font-semibold text-sm text-nexa-text-primary">Pending Onboarding Review</h2>
              <p className="text-xs text-nexa-text-secondary">Background and document verifications</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-nexa-bg-base/60 border border-nexa-border rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-xs text-nexa-text-primary">Emeka Udo</p>
                  <NexaBadge variant="amber" size="sm">Action Needed</NexaBadge>
                </div>
                <ul className="text-xs space-y-2 mt-3 mb-4">
                  <li className="flex justify-between text-emerald-500"><span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> Identity</span> <span>Verified</span></li>
                  <li className="flex justify-between text-emerald-500"><span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> Driver's License</span> <span>Verified</span></li>
                  <li className="flex justify-between text-nexa-text-secondary"><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> Background Check</span> <span>Pending API</span></li>
                </ul>
                <NexaButton size="sm" variant="outline" className="w-full text-xs">Review Profile</NexaButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErpAdminShell>
  );
}
