"use client";

import React from "react";
import { Calendar, Car, DollarSign, Clock, CheckCircle, XCircle, Plus } from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function RentalServicePage() {
  return (
    <ErpAdminShell
      title="Bus Rental Service"
      subtitle="Manage private hires, corporate rentals, and pricing configurations."
      activeModule="mobility"
      action={
        <NexaButton size="sm" variant="primary" className="gap-2 text-xs">
          <Plus className="w-3.5 h-3.5" /> New Rental Booking
        </NexaButton>
      }
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Bookings Today</h3>
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">14</p>
          </div>
          <div className="p-5 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Pending Requests</h3>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">5</p>
          </div>
          <div className="p-5 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Available Buses</h3>
              <Car className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">12</p>
          </div>
          <div className="p-5 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-nexa-text-secondary">Est. Revenue</h3>
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">₦850k</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-nexa-surface rounded-xl border border-nexa-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-nexa-border flex justify-between items-center">
              <h2 className="font-semibold text-sm text-nexa-text-primary">Pending Rental Requests</h2>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-nexa-bg-base/50 border-b border-nexa-border text-xs text-nexa-text-secondary">
                <tr>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Details</th>
                  <th className="p-4 font-semibold">Dates</th>
                  <th className="p-4 font-semibold">Est. Quote</th>
                  <th className="p-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nexa-border text-xs">
                <tr>
                  <td className="p-4">
                    <p className="font-medium text-nexa-text-primary">Chevron Corp</p>
                    <p className="text-nexa-text-secondary">Corporate</p>
                  </td>
                  <td className="p-4">
                    <p className="text-nexa-text-primary">30-Seater Coaster</p>
                    <p className="text-nexa-text-secondary">Lagos to Ibadan</p>
                  </td>
                  <td className="p-4">
                    <p className="text-nexa-text-primary">Oct 12 - Oct 14</p>
                    <p className="text-nexa-text-secondary">3 Days</p>
                  </td>
                  <td className="p-4 font-medium text-nexa-text-primary">₦450,000</td>
                  <td className="p-4 flex gap-2">
                    <button className="text-emerald-500 hover:text-emerald-600"><CheckCircle className="w-5 h-5" /></button>
                    <button className="text-red-500 hover:text-red-600"><XCircle className="w-5 h-5" /></button>
                  </td>
                </tr>
                <tr>
                  <td className="p-4">
                    <p className="font-medium text-nexa-text-primary">Chinedu Eze</p>
                    <p className="text-nexa-text-secondary">Individual</p>
                  </td>
                  <td className="p-4">
                    <p className="text-nexa-text-primary">14-Seater Hiace</p>
                    <p className="text-nexa-text-secondary">Intra-city (Lagos)</p>
                  </td>
                  <td className="p-4">
                    <p className="text-nexa-text-primary">Oct 15</p>
                    <p className="text-nexa-text-secondary">1 Day</p>
                  </td>
                  <td className="p-4 font-medium text-nexa-text-primary">₦80,000</td>
                  <td className="p-4 flex gap-2">
                    <button className="text-emerald-500 hover:text-emerald-600"><CheckCircle className="w-5 h-5" /></button>
                    <button className="text-red-500 hover:text-red-600"><XCircle className="w-5 h-5" /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-nexa-surface rounded-xl border border-nexa-border shadow-sm p-5 space-y-4 h-fit">
            <h2 className="font-semibold text-sm text-nexa-text-primary border-b border-nexa-border pb-3">Pricing Configuration</h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-nexa-border pb-2">
                <span className="text-nexa-text-secondary">Base Day Rate (Coaster)</span>
                <span className="font-semibold text-nexa-text-primary">₦120,000/day</span>
              </div>
              <div className="flex justify-between items-center border-b border-nexa-border pb-2">
                <span className="text-nexa-text-secondary">Base Day Rate (Hiace)</span>
                <span className="font-semibold text-nexa-text-primary">₦60,000/day</span>
              </div>
              <div className="flex justify-between items-center border-b border-nexa-border pb-2">
                <span className="text-nexa-text-secondary">Driver Allowance</span>
                <span className="font-semibold text-nexa-text-primary">₦15,000/day</span>
              </div>
              <div className="flex justify-between items-center border-b border-nexa-border pb-2">
                <span className="text-nexa-text-secondary">Out of State Fuel Surcharge</span>
                <span className="font-semibold text-nexa-text-primary">+30%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-nexa-text-secondary">Standard Markup</span>
                <span className="font-semibold text-nexa-text-primary">20%</span>
              </div>
              <NexaButton size="sm" variant="outline" className="w-full mt-4 text-xs">
                Edit Pricing Rules
              </NexaButton>
            </div>
          </div>
        </div>
      </div>
    </ErpAdminShell>
  );
}
