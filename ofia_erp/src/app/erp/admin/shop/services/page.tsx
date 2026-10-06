"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  DollarSign,
  Phone,
  Mail,
  UserCheck,
  Check,
  X,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";
import {
  VERTICAL_DEFINITIONS,
  detectTenantVertical,
  CommerceServiceItem,
  CommerceBookingItem,
  VerticalKey,
} from "@/lib/verticals";

export default function ServicesAndBookingsPage() {
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);
  const verticalKey = detectTenantVertical(activeTenant?.slug, activeTenant?.name);

  const [selectedVertical, setSelectedVertical] = useState<VerticalKey>(verticalKey);
  const currentVerticalDef = VERTICAL_DEFINITIONS[selectedVertical];

  const [services, setServices] = useState<CommerceServiceItem[]>([
    {
      id: "SRV-01",
      title: selectedVertical === "cars"
        ? "Comprehensive 150-Point Pre-Purchase Mechanical Inspection"
        : selectedVertical === "food"
        ? "Private Executive Chef Dining & On-Site Service"
        : selectedVertical === "fashion"
        ? "Custom Bespoke Tailoring & Fitting Session"
        : selectedVertical === "hardware"
        ? "Solar Energy Load Audit & Roof Site Inspection"
        : selectedVertical === "pharmacy"
        ? "Clinical Medication Therapy & Health Review"
        : "Standard Technical Diagnostic Consultation",
      price: selectedVertical === "cars" ? 35000 : selectedVertical === "hardware" ? 25000 : 15000,
      formattedPrice: selectedVertical === "cars" ? "₦35,000" : selectedVertical === "hardware" ? "₦25,000" : "₦15,000",
      durationMinutes: 60,
      providerName: "Engr. David Okon (Certified)",
      vertical: selectedVertical,
      status: "ACTIVE",
      description: "Complete hands-on inspection and diagnostic report delivery.",
    },
    {
      id: "SRV-02",
      title: selectedVertical === "cars"
        ? "Express Test-Drive Demonstration (30 Mins)"
        : selectedVertical === "food"
        ? "Gourmet Event Buffet Catering (Per 25 Guests)"
        : selectedVertical === "fashion"
        ? "Rush Hemline & Alteration Adjustment"
        : selectedVertical === "hardware"
        ? "Turnkey Inverter & Battery Bank Installation"
        : selectedVertical === "pharmacy"
        ? "Routine Chronic Condition Monitoring (Vitals/Sugar)"
        : "Express Device Screen & Battery Replacement",
      price: selectedVertical === "cars" ? 0 : selectedVertical === "hardware" ? 75000 : 10000,
      formattedPrice: selectedVertical === "cars" ? "Free" : selectedVertical === "hardware" ? "₦75,000" : "₦10,000",
      durationMinutes: 30,
      providerName: "Sales & Technical Desk",
      vertical: selectedVertical,
      status: "ACTIVE",
      description: "Quick turnaround test or setup session with customer care.",
    },
  ]);

  const [bookings, setBookings] = useState<CommerceBookingItem[]>([
    {
      id: "BK-101",
      customerName: "Dr. Emmanuel Adeleke",
      customerEmail: "emmanuel.adeleke@gmail.com",
      customerPhone: "+234 803 456 7890",
      serviceTitle: services[0]?.title || "Appointment",
      dateTime: "Tomorrow at 10:00 AM",
      status: "CONFIRMED",
      notes: "Customer requested morning slot before noon.",
      vertical: selectedVertical,
    },
    {
      id: "BK-102",
      customerName: "Mrs. Folashade Bakare",
      customerEmail: "fola.bakare@yahoo.com",
      customerPhone: "+234 812 987 6543",
      serviceTitle: services[1]?.title || "Appointment",
      dateTime: "Friday at 2:30 PM",
      status: "PENDING",
      notes: "Awaiting confirmation of vehicle or parts readiness.",
      vertical: selectedVertical,
    },
  ]);

  const handleUpdateBookingStatus = (id: string, newStatus: CommerceBookingItem["status"]) => {
    setBookings(
      bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  return (
    <BusinessShell
      title={`${currentVerticalDef.name} — Services & Bookings`}
      subtitle={`Configure ${currentVerticalDef.serviceTerm.toLowerCase()}, schedule appointment slots, and manage customer service requests.`}
      action={
        <div className="flex items-center gap-2">
          <select
            value={selectedVertical}
            onChange={(e) => setSelectedVertical(e.target.value as VerticalKey)}
            className="px-3 py-1.5 bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-full text-xs font-bold text-[var(--nexa-text-primary)] outline-none cursor-pointer"
          >
            {Object.values(VERTICAL_DEFINITIONS).map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          <NexaButton
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-[#1A56DB] text-white rounded-full font-bold shadow-xs"
            onClick={() => alert(`Add new ${currentVerticalDef.serviceTerm} service option`)}
          >
            Create Service Offering
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-8">
        {/* KPI CARDS */}
        <ErpStatGrid
          stats={[
            {
              label: "Active Services",
              value: `${services.length} Offerings`,
              change: "Storefront Bookable",
              trend: "up",
              icon: <Calendar className="w-5 h-5 text-blue-500" />,
              sub: `${currentVerticalDef.serviceTerm} enabled`,
            },
            {
              label: "Pending Appointments",
              value: `${bookings.filter((b) => b.status === "PENDING").length} Requests`,
              change: "Requires Confirmation",
              trend: "neutral",
              icon: <Clock className="w-5 h-5 text-amber-500" />,
              sub: "Awaiting staff review",
            },
            {
              label: "Confirmed Schedule",
              value: `${bookings.filter((b) => b.status === "CONFIRMED").length} Slots`,
              change: "Booked On Calendar",
              trend: "up",
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
              sub: "Ready for client arrival",
            },
            {
              label: "Vertical Specialization",
              value: currentVerticalDef.badge,
              change: currentVerticalDef.name,
              trend: "up",
              icon: <Sliders className="w-5 h-5 text-purple-500" />,
              sub: "Tailored to industry model",
            },
          ]}
        />

        {/* 2 COLUMN GRID: APPOINTMENTS SCHEDULE & SERVICE CATALOG */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* APPOINTMENT QUEUE (7 COLS) */}
          <NexaCard variant="glass" padding="lg" className="lg:col-span-7 space-y-4 rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
              <div>
                <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                  Upcoming Appointment Queue
                </h3>
                <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                  Client bookings submitted via online storefront or phone
                </p>
              </div>
              <NexaBadge variant="brand" size="sm" className="rounded-full">
                {bookings.length} Total
              </NexaBadge>
            </div>

            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-[var(--nexa-text-primary)]">{b.customerName}</span>
                      <span className="text-[11px] text-[var(--nexa-text-muted)] ml-2 font-mono">{b.dateTime}</span>
                    </div>
                    <NexaBadge
                      variant={b.status === "CONFIRMED" ? "green" : b.status === "PENDING" ? "amber" : "neutral"}
                      size="sm"
                      className="rounded-full"
                    >
                      {b.status}
                    </NexaBadge>
                  </div>

                  <p className="text-xs text-[var(--nexa-text-secondary)] font-medium">{b.serviceTitle}</p>

                  {b.notes && (
                    <p className="text-[11px] text-[var(--nexa-text-muted)] italic bg-[var(--nexa-bg-surface)] p-2 rounded-xl border border-[var(--nexa-border)]">
                      "{b.notes}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--nexa-border)] text-[11px]">
                    <span className="text-[var(--nexa-text-muted)] font-mono">{b.customerPhone}</span>
                    <div className="flex items-center gap-1.5">
                      {b.status === "PENDING" && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, "CONFIRMED")}
                          className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-xs cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Confirm
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateBookingStatus(b.id, "CANCELLED")}
                        className="px-2.5 py-1 rounded-full bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-rose-500 font-bold hover:border-red-500 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </NexaCard>

          {/* ACTIVE SERVICES DIRECTORY (5 COLS) */}
          <NexaCard variant="glass" padding="lg" className="lg:col-span-5 space-y-4 rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
              <div>
                <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                  Service Catalog Offerings
                </h3>
                <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                  Published services displayed on storefront
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[var(--nexa-text-primary)]">{srv.title}</h4>
                    <span className="font-bold text-xs text-[#1A56DB]">{srv.formattedPrice}</span>
                  </div>
                  <p className="text-[11px] text-[var(--nexa-text-secondary)] leading-relaxed">{srv.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--nexa-border)] text-[10px] text-[var(--nexa-text-muted)]">
                    <span>Duration: {srv.durationMinutes} mins</span>
                    <span className="font-semibold">{srv.providerName}</span>
                  </div>
                </div>
              ))}
            </div>
          </NexaCard>
        </div>
      </div>
    </BusinessShell>
  );
}
