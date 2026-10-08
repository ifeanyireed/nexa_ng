"use client";

import React from "react";
import { Plus } from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function StaffCommutePage() {
  return (
    <ErpAdminShell
      title="Staff Transport"
      subtitle="Manage employee transport subscriptions and assigned routes."
      activeModule="mobility"
      action={
        <NexaButton size="sm" variant="primary" className="gap-2 text-xs">
          <Plus className="w-3.5 h-3.5" /> Add Employee
        </NexaButton>
      }
    >
      <div className="space-y-6">
        <div className="bg-nexa-surface rounded-2xl border border-nexa-border shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-nexa-bg-base/50 border-b border-nexa-border text-xs text-nexa-text-secondary">
              <tr>
                <th className="p-4 font-semibold">Employee</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Assigned Route</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexa-border text-xs">
              <tr>
                <td className="p-4">
                  <p className="font-bold text-nexa-text-primary">Ifeanyi Ibeh</p>
                  <p className="text-nexa-text-secondary">ifeanyi@techcorp.com</p>
                </td>
                <td className="p-4 text-nexa-text-secondary">Engineering</td>
                <td className="p-4 text-nexa-text-primary">Mainland Hub &rarr; Island Office</td>
                <td className="p-4">
                  <NexaBadge variant="emerald" size="sm">Active</NexaBadge>
                </td>
                <td className="p-4">
                  <button className="text-blue-600 font-medium hover:underline">Edit</button>
                </td>
              </tr>
              <tr>
                <td className="p-4">
                  <p className="font-bold text-nexa-text-primary">Jane Doe</p>
                  <p className="text-nexa-text-secondary">jane@techcorp.com</p>
                </td>
                <td className="p-4 text-nexa-text-secondary">Marketing</td>
                <td className="p-4 text-nexa-text-primary">Ikeja City &rarr; Island Office</td>
                <td className="p-4">
                  <NexaBadge variant="slate" size="sm">Suspended</NexaBadge>
                </td>
                <td className="p-4">
                  <button className="text-blue-600 font-medium hover:underline">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ErpAdminShell>
  );
}
