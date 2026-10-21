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
  RefreshCw,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaModal } from "@/components/nexa/NexaModal";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";
import {
  VERTICAL_DEFINITIONS,
  detectTenantVertical,
  getDefaultServicesForVertical,
  CommerceServiceItem,
  CommerceBookingItem,
  VerticalKey,
} from "@/lib/verticals";

export default function ServicesAndBookingsPage() {
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);
  const provisionedVertical = (activeTenant?.vertical as VerticalKey) || detectTenantVertical(activeTenant?.slug, activeTenant?.name);

  const [selectedVertical, setSelectedVertical] = useState<VerticalKey>(provisionedVertical);
  const currentVerticalDef = VERTICAL_DEFINITIONS[selectedVertical] || VERTICAL_DEFINITIONS.retail;

  // Strictly sync when activeTenant loads or updates
  React.useEffect(() => {
    if (activeTenant?.vertical && activeTenant.vertical in VERTICAL_DEFINITIONS) {
      setSelectedVertical(activeTenant.vertical as VerticalKey);
    }
  }, [activeTenant?.vertical]);

  const [services, setServices] = useState<CommerceServiceItem[]>(() =>
    getDefaultServicesForVertical(provisionedVertical)
  );

  React.useEffect(() => {
    setServices(getDefaultServicesForVertical(selectedVertical));
  }, [selectedVertical]);

  // Modal State for creating a service offering
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [newServiceTitle, setNewServiceTitle] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("45");
  const [newServiceProvider, setNewServiceProvider] = useState("Senior Specialist");
  const [newServiceDesc, setNewServiceDesc] = useState("");

  const handleOpenAddService = () => {
    setNewServiceTitle("");
    setNewServicePrice("");
    setNewServiceDuration("45");
    setNewServiceProvider("Certified Specialist");
    setNewServiceDesc("");
    setIsAddServiceModalOpen(true);
  };

  const handleSaveNewService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceTitle) return;

    const numPrice = parseFloat(newServicePrice.replace(/[^0-9.]/g, "")) || 0;
    const newSrv: CommerceServiceItem = {
      id: `SRV-${Date.now().toString().slice(-4)}`,
      title: newServiceTitle,
      price: numPrice,
      formattedPrice: numPrice === 0 ? "Free Consultation" : `₦${numPrice.toLocaleString()}`,
      durationMinutes: parseInt(newServiceDuration) || 30,
      providerName: newServiceProvider || "Specialist",
      vertical: selectedVertical,
      status: "ACTIVE",
      description: newServiceDesc || "Comprehensive customer appointment and service session.",
    };

    setServices([newSrv, ...services]);
    setIsAddServiceModalOpen(false);
  };

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

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBookings = React.useCallback(async () => {
    const slug = activeTenant?.slug || "neweratransports";
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/erp/shop/bookings?tenant=${encodeURIComponent(slug)}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (data && Array.isArray(data.bookings) && data.bookings.length > 0) {
        setBookings(data.bookings);
      }
    } catch {
      // Keep existing
    } finally {
      setIsRefreshing(false);
    }
  }, [activeTenant?.slug]);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdateBookingStatus = async (id: string, newStatus: CommerceBookingItem["status"]) => {
    // Optimistic update
    setBookings((prev) =>
      prev.map((b) => (b.id === id || (b as any).bookingNumber === id ? { ...b, status: newStatus } : b))
    );

    try {
      await fetch("/api/erp/shop/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, status: newStatus }),
      });
    } catch {
      fetchBookings();
    }
  };

  return (
    <BusinessShell
      title={`${currentVerticalDef.name} — Services & Bookings`}
      subtitle={`Configure ${currentVerticalDef.serviceTerm.toLowerCase()}, schedule appointment slots, and manage customer service requests.`}
      action={
        <div className="flex items-center gap-2">
          <NexaButton
            size="sm"
            variant="outline"
            onClick={fetchBookings}
            disabled={isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />}
            className="rounded-full"
          >
            {isRefreshing ? "Syncing..." : "Sync Bookings"}
          </NexaButton>

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
            className="bg-[#1A56DB] text-white rounded-full font-bold shadow-xs cursor-pointer"
            onClick={handleOpenAddService}
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

      {/* CREATE SERVICE MODAL */}
      <NexaModal
        isOpen={isAddServiceModalOpen}
        onClose={() => setIsAddServiceModalOpen(false)}
        title={`Create New ${currentVerticalDef.serviceTerm}`}
        subtitle={`Publish an appointment or service offering available for customer scheduling on the ${currentVerticalDef.name} storefront.`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveNewService} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
              Service Offering Title *
            </label>
            <input
              type="text"
              required
              value={newServiceTitle}
              onChange={(e) => setNewServiceTitle(e.target.value)}
              placeholder={`e.g. VIP ${currentVerticalDef.serviceTerm}`}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Fee / Consultation Price (₦) *
              </label>
              <input
                type="text"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                placeholder="e.g. 25000 (0 for Free)"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                Estimated Duration (Minutes) *
              </label>
              <input
                type="number"
                min="5"
                step="5"
                required
                value={newServiceDuration}
                onChange={(e) => setNewServiceDuration(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
              Assigned Specialist / Lead Provider
            </label>
            <input
              type="text"
              value={newServiceProvider}
              onChange={(e) => setNewServiceProvider(e.target.value)}
              placeholder="e.g. Certified Specialist / Lead Consultant"
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
              Service Description & Scope
            </label>
            <textarea
              rows={3}
              value={newServiceDesc}
              onChange={(e) => setNewServiceDesc(e.target.value)}
              placeholder="Outline what is included in this appointment session..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-medium resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--nexa-border)]">
            <NexaButton
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setIsAddServiceModalOpen(false)}
            >
              Cancel
            </NexaButton>
            <NexaButton
              type="submit"
              variant="primary"
              size="sm"
              className="rounded-full bg-[#1A56DB] text-white font-bold"
            >
              Publish {currentVerticalDef.serviceTerm}
            </NexaButton>
          </div>
        </form>
      </NexaModal>
    </BusinessShell>
  );
}
