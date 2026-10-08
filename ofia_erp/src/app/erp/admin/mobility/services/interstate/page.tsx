"use client";

import React from "react";
import { Users, Ticket, QrCode, Plus } from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function InterstateServicePage() {
  return (
    <ErpAdminShell
      title="Interstate Transit"
      subtitle="Manage city-to-city routes, terminals, and boarding operations."
      activeModule="mobility"
      action={
        <div className="flex gap-2">
          <NexaButton size="sm" variant="outline" className="text-xs">
            Manage Terminals
          </NexaButton>
          <NexaButton size="sm" variant="primary" className="gap-2 text-xs">
            <Plus className="w-3.5 h-3.5" /> Schedule Departure
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Departures Today</h3>
              <Ticket className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">8</p>
          </div>
          <div className="p-5 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Total Passengers</h3>
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">342</p>
          </div>
        </div>

        <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-nexa-border">
            <h2 className="font-semibold text-sm text-nexa-text-primary">Active Terminals & Boarding Status</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-nexa-bg-base/50 border-b border-nexa-border text-xs text-nexa-text-secondary">
              <tr>
                <th className="p-4 font-semibold">Terminal</th>
                <th className="p-4 font-semibold">Destination</th>
                <th className="p-4 font-semibold">Time</th>
                <th className="p-4 font-semibold">Capacity</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexa-border text-xs">
              <tr>
                <td className="p-4">
                  <p className="font-medium text-nexa-text-primary">Jibowu Terminal, Lagos</p>
                </td>
                <td className="p-4">
                  <p className="font-medium text-nexa-text-primary">Utako, Abuja</p>
                  <p className="text-nexa-text-secondary">Night Bus</p>
                </td>
                <td className="p-4 text-nexa-text-primary">19:00 PM</td>
                <td className="p-4 text-nexa-text-primary font-medium">42/50 Booked</td>
                <td className="p-4">
                  <button className="text-blue-600 font-medium flex items-center gap-1 hover:underline">
                    <QrCode className="w-3.5 h-3.5"/> View Manifest
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ErpAdminShell>
  );
}
