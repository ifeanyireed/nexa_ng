"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  Star,
  ShieldCheck,
  ExternalLink,
  Trash2,
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
  getDefaultServicesForVertical,
  CommerceServiceItem,
  CommerceBookingItem,
  VerticalKey,
} from "@/lib/verticals";
import { VERTICAL_SPECIALISTS, SpecialistStaff } from "@/lib/vertical-specialists";

export default function VerticalServicesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);

  const rawVertical = (params?.vertical as string) || "fashion";
  const verticalKey: VerticalKey = (rawVertical in VERTICAL_DEFINITIONS ? rawVertical : "fashion") as VerticalKey;
  const currentVerticalDef = VERTICAL_DEFINITIONS[verticalKey] || VERTICAL_DEFINITIONS.fashion;

  // Tenant vertical enforcement: strictly lock tenant to their provisioned vertical
  useEffect(() => {
    if (activeTenant?.vertical && activeTenant.vertical in VERTICAL_DEFINITIONS && activeTenant.vertical !== verticalKey) {
      router.replace(`/erp/admin/shop/${activeTenant.vertical}/services`);
    }
  }, [activeTenant?.vertical, verticalKey, router]);

  const [services, setServices] = useState<CommerceServiceItem[]>(() =>
    getDefaultServicesForVertical(verticalKey)
  );
  const [bookings, setBookings] = useState<CommerceBookingItem[]>(() =>
    verticalKey === "fashion"
      ? [
          {
            id: "BK-FASH-01",
            bookingNumber: "TD-48921",
            customerName: "Amina Adeleke",
            customerEmail: "amina.a@lifestyle.ng",
            customerPhone: "+234 803 445 9012",
            serviceTitle: "Bespoke Measurement & Master Tailoring Consultation (Atelier Showroom)",
            dateTime: "Tomorrow at 02:00 PM",
            status: "PENDING",
            notes: "Fit: Tailored Regular | Chest: 36, Waist: 28, Hips: 40 | Fabric: Raw Silk & Velvet",
            vertical: "fashion",
            amount: "₦15,000",
            createdAt: "Just now",
          },
        ]
      : []
  );
  const [isServicesLoading, setIsServicesLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);

  // Available specialists for this vertical
  const availableSpecialists: SpecialistStaff[] = VERTICAL_SPECIALISTS[verticalKey] || VERTICAL_SPECIALISTS.retail;

  // 1. Fetch live persistent services from API
  const fetchServices = useCallback(async () => {
    const slug = activeTenant?.slug || "neweratransports";
    setIsServicesLoading(true);
    try {
      const res = await fetch(
        `/api/erp/shop/services?tenant=${encodeURIComponent(slug)}&vertical=${encodeURIComponent(verticalKey)}`,
        { cache: "no-store" }
      );
      const data = await res.json().catch(() => null);
      if (data && Array.isArray(data.services) && data.services.length > 0) {
        setServices(data.services);
      } else {
        setServices(getDefaultServicesForVertical(verticalKey));
      }
    } catch (err) {
      console.warn("Failed to fetch services:", err);
      setServices(getDefaultServicesForVertical(verticalKey));
    } finally {
      setIsServicesLoading(false);
    }
  }, [activeTenant?.slug, verticalKey]);

  // 2. Fetch bookings filtered for this vertical
  const fetchBookings = useCallback(async () => {
    const slug = activeTenant?.slug || "neweratransports";
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/erp/shop/bookings?tenant=${encodeURIComponent(slug)}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (data && Array.isArray(data.bookings)) {
        // Filter bookings by this vertical
        const verticalBookings = data.bookings.filter(
          (b: CommerceBookingItem) => !b.vertical || b.vertical === verticalKey
        );
        if (verticalBookings.length > 0) {
          setBookings(verticalBookings);
        } else if (verticalKey === "fashion") {
          setBookings([
            {
              id: "BK-FASH-01",
              bookingNumber: "TD-48921",
              customerName: "Amina Adeleke",
              customerEmail: "amina.a@lifestyle.ng",
              customerPhone: "+234 803 445 9012",
              serviceTitle: "Bespoke Measurement & Master Tailoring Consultation (Atelier Showroom)",
              dateTime: "Tomorrow at 02:00 PM",
              status: "PENDING",
              notes: "Fit: Tailored Regular | Chest: 36, Waist: 28, Hips: 40 | Fabric: Raw Silk & Velvet",
              vertical: "fashion",
              amount: "₦15,000",
              createdAt: "Just now",
            },
          ]);
        }
      }
    } catch {
      // Keep existing
    } finally {
      setIsRefreshing(false);
    }
  }, [activeTenant?.slug, verticalKey]);

  useEffect(() => {
    fetchServices();
    fetchBookings();
  }, [fetchServices, fetchBookings]);

  // Modal State for creating a service offering
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [newServiceTitle, setNewServiceTitle] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("45");
  const [newServiceProvider, setNewServiceProvider] = useState(
    availableSpecialists[0]?.name || "Certified Specialist"
  );
  const [newServiceCategory, setNewServiceCategory] = useState("General");
  const [newServiceDesc, setNewServiceDesc] = useState("");

  const handleOpenAddService = () => {
    setNewServiceTitle("");
    setNewServicePrice("");
    setNewServiceDuration("45");
    setNewServiceProvider(availableSpecialists[0]?.name || "Certified Specialist");
    setNewServiceCategory("General");
    setNewServiceDesc("");
    setIsAddServiceModalOpen(true);
  };

  const handleSaveNewService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceTitle) return;

    const numPrice = parseFloat(newServicePrice.replace(/[^0-9.]/g, "")) || 0;
    const slug = activeTenant?.slug || "neweratransports";
    setIsSavingService(true);

    const payload = {
      title: newServiceTitle,
      price: numPrice,
      durationMinutes: parseInt(newServiceDuration) || 45,
      providerName: newServiceProvider,
      category: newServiceCategory,
      vertical: verticalKey,
      tenantSlug: slug,
      status: "ACTIVE" as const,
      description: newServiceDesc || `${currentVerticalDef.name} client service session.`,
    };

    try {
      const res = await fetch("/api/erp/shop/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsAddServiceModalOpen(false);
        fetchServices();
      }
    } catch (err) {
      console.error("Failed to save service:", err);
    } finally {
      setIsSavingService(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    const slug = activeTenant?.slug || "neweratransports";
    try {
      await fetch(
        `/api/erp/shop/services?id=${encodeURIComponent(serviceId)}&tenant=${encodeURIComponent(slug)}`,
        { method: "DELETE" }
      );
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } catch (err) {
      console.error("Failed to delete service:", err);
    }
  };

  const handleUpdateBookingStatus = async (id: string, newStatus: CommerceBookingItem["status"]) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id || (b as any).bookingNumber === id ? { ...b, status: newStatus } : b))
    );

    try {
      await fetch("/api/erp/shop/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: id,
          status: newStatus,
          tenantSlug: activeTenant?.slug || "neweratransports",
        }),
      });
    } catch {
      fetchBookings();
    }
  };

  // State for technician / specialist assignment modal
  const [assigningBooking, setAssigningBooking] = useState<CommerceBookingItem | null>(null);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignSpecialist = async () => {
    if (!assigningBooking || !selectedSpecialistId) return;
    const specialist = availableSpecialists.find((s) => s.id === selectedSpecialistId);
    if (!specialist) return;

    setIsAssigning(true);
    const targetSlug = (activeTenant?.slug || "neweratransports").toLowerCase().trim();
    const assignedName = `${specialist.name} · ${specialist.role}`;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === assigningBooking.id || (b as any).bookingNumber === assigningBooking.id
          ? {
              ...b,
              status: "CONFIRMED",
              technicianId: specialist.id,
              technicianName: assignedName,
            }
          : b
      )
    );

    try {
      const res = await fetch("/api/erp/shop/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: assigningBooking.id,
          status: "CONFIRMED",
          technicianId: specialist.id,
          technicianName: assignedName,
          tenantSlug: targetSlug,
        }),
      });
      if (res.ok) {
        setAssigningBooking(null);
        setSelectedSpecialistId("");
        fetchBookings();
      }
    } catch (err) {
      console.error("Failed to assign specialist:", err);
      fetchBookings();
    } finally {
      setIsAssigning(false);
    }
  };

  const storefrontServiceUrl = `http://localhost:3000${currentVerticalDef.storefrontPath}${
    activeTenant?.slug ? `?tenant=${activeTenant.slug}` : ""
  }`;

  return (
    <BusinessShell
      title={`${currentVerticalDef.name} — Services & Bookings`}
      subtitle={`Configure ${currentVerticalDef.serviceTerm.toLowerCase()}, schedule appointment slots, and assign specialized ${currentVerticalDef.name} staff.`}
      activeModule="shop"
      action={
        <div className="flex items-center gap-2">
          <NexaBadge variant="brand" size="sm" className="rounded-full">
            {currentVerticalDef.name}
          </NexaBadge>

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

          <a href={storefrontServiceUrl} target="_blank" rel="noopener noreferrer">
            <NexaButton size="sm" variant="outline" leftIcon={<ExternalLink className="w-3.5 h-3.5" />} className="rounded-full">
              Live Storefront
            </NexaButton>
          </a>

          <NexaButton
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-[#1A56DB] text-white rounded-full font-bold shadow-xs cursor-pointer"
            onClick={handleOpenAddService}
          >
            New {currentVerticalDef.serviceTerm}
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-8">
        {/* KPI CARDS */}
        <ErpStatGrid
          stats={[
            {
              label: `Active ${currentVerticalDef.serviceTerm}`,
              value: `${services.length} Offerings`,
              change: "Storefront Bookable",
              trend: "up",
              icon: <Calendar className="w-5 h-5 text-blue-500" />,
              sub: `Published to ${currentVerticalDef.name}`,
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
              label: "Confirmed Appointments",
              value: `${bookings.filter((b) => b.status === "CONFIRMED").length} Slots`,
              change: "Booked On Calendar",
              trend: "up",
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
              sub: "Ready for client arrival",
            },
            {
              label: "Assigned Staff Pool",
              value: `${availableSpecialists.length} Specialists`,
              change: currentVerticalDef.badge,
              trend: "up",
              icon: <Sliders className="w-5 h-5 text-purple-500" />,
              sub: `${currentVerticalDef.name} certified experts`,
            },
          ]}
        />

        {/* 2 COLUMN GRID: APPOINTMENTS QUEUE & ACTIVE SERVICES DIRECTORY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* APPOINTMENT QUEUE (7 COLS) */}
          <NexaCard variant="glass" padding="lg" className="lg:col-span-7 space-y-4 rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
              <div>
                <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                  {currentVerticalDef.name} Appointment Queue
                </h3>
                <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                  Client bookings submitted via {currentVerticalDef.name.toLowerCase()} storefront or direct booking
                </p>
              </div>
              <NexaBadge variant="brand" size="sm" className="rounded-full">
                {bookings.length} Total
              </NexaBadge>
            </div>

            <div className="space-y-3">
              {bookings.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--nexa-text-muted)] rounded-2xl border border-dashed border-[var(--nexa-border)]">
                  No upcoming {currentVerticalDef.serviceTerm.toLowerCase()} scheduled. Bookings from your live storefront will appear here.
                </div>
              ) : (
                bookings.map((b) => (
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

                    {b.technicianName && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#1A56DB] dark:text-blue-400 text-xs font-semibold">
                        <UserCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>Assigned Specialist: <strong>{b.technicianName}</strong></span>
                      </div>
                    )}

                    {b.notes && (
                      <p className="text-[11px] text-[var(--nexa-text-muted)] italic bg-[var(--nexa-bg-surface)] p-2 rounded-xl border border-[var(--nexa-border)]">
                        "{b.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--nexa-border)] text-[11px]">
                      <span className="text-[var(--nexa-text-muted)] font-mono">{b.customerPhone}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setAssigningBooking(b);
                            setSelectedSpecialistId(b.technicianId || availableSpecialists[0]?.id || "");
                          }}
                          className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-bold text-xs cursor-pointer flex items-center gap-1 border border-blue-200 dark:border-blue-800 transition-colors"
                        >
                          <User className="w-3 h-3" />
                          {b.technicianName ? "Reassign Specialist" : "Assign Specialist"}
                        </button>

                        {b.status === "PENDING" && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, "CONFIRMED")}
                            className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-xs cursor-pointer flex items-center gap-1 transition-colors"
                          >
                            <Check className="w-3 h-3" /> Confirm
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, "CANCELLED")}
                          className="px-2.5 py-1 rounded-full bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-rose-500 font-bold hover:border-red-500 text-xs cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </NexaCard>

          {/* ACTIVE SERVICES DIRECTORY (5 COLS) */}
          <NexaCard variant="glass" padding="lg" className="lg:col-span-5 space-y-4 rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
              <div>
                <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                  {currentVerticalDef.name} Offerings
                </h3>
                <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                  Persisted services bookable on {currentVerticalDef.name} storefront
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {services.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--nexa-text-muted)] rounded-2xl border border-dashed border-[var(--nexa-border)]">
                  No services published yet. Click "New {currentVerticalDef.serviceTerm}" above to add your first offering.
                </div>
              ) : (
                services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[var(--nexa-text-primary)]">{srv.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#1A56DB]">{srv.formattedPrice}</span>
                        <button
                          onClick={() => handleDeleteService(srv.id)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                          title="Remove service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--nexa-text-secondary)] leading-relaxed">{srv.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--nexa-border)] text-[10px] text-[var(--nexa-text-muted)]">
                      <span>Duration: {srv.durationMinutes} mins</span>
                      <span className="font-semibold text-[var(--nexa-text-primary)]">{srv.providerName}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* SPECIALIST STAFF ROSTER */}
            <div className="pt-4 border-t border-[var(--nexa-border)] space-y-3">
              <h4 className="font-extrabold text-xs text-[var(--nexa-text-primary)] uppercase tracking-wider">
                {currentVerticalDef.name} Specialist Pool
              </h4>
              <div className="space-y-2">
                {availableSpecialists.map((sp) => (
                  <div
                    key={sp.id}
                    className="p-2.5 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[var(--nexa-text-primary)]">{sp.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 font-bold">
                          {sp.rating} ★
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--nexa-text-muted)]">{sp.role} · {sp.specialty}</span>
                    </div>
                    <NexaBadge variant={sp.isAvailable ? "green" : "neutral"} size="sm" className="rounded-full text-[10px]">
                      {sp.isAvailable ? "Available" : "Busy"}
                    </NexaBadge>
                  </div>
                ))}
              </div>
            </div>
          </NexaCard>
        </div>
      </div>

      {/* CREATE SERVICE MODAL */}
      <NexaModal
        isOpen={isAddServiceModalOpen}
        onClose={() => setIsAddServiceModalOpen(false)}
        title={`Create New ${currentVerticalDef.serviceTerm}`}
        subtitle={`Publish an appointment or service offering available on the ${currentVerticalDef.name} storefront.`}
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
                Duration (Minutes) *
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
              Assigned Lead Specialist
            </label>
            <select
              value={newServiceProvider}
              onChange={(e) => setNewServiceProvider(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
            >
              {availableSpecialists.map((sp) => (
                <option key={sp.id} value={`${sp.name} (${sp.role})`}>
                  {sp.name} — {sp.role} ({sp.specialty})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
              Service Description & Scope
            </label>
            <textarea
              rows={3}
              value={newServiceDesc}
              onChange={(e) => setNewServiceDesc(e.target.value)}
              placeholder={`Outline what is included in this ${currentVerticalDef.serviceTerm.toLowerCase()} session...`}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-medium resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--nexa-border)]">
            <NexaButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddServiceModalOpen(false)}
              className="rounded-full"
            >
              Cancel
            </NexaButton>
            <NexaButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSavingService}
              className="rounded-full bg-[#1A56DB] text-white font-bold"
            >
              {isSavingService ? "Saving..." : "Publish Service"}
            </NexaButton>
          </div>
        </form>
      </NexaModal>

      {/* ASSIGN SPECIALIST MODAL */}
      <NexaModal
        isOpen={Boolean(assigningBooking)}
        onClose={() => setAssigningBooking(null)}
        title="Assign Specialist Provider"
        subtitle={`Select a ${currentVerticalDef.name.toLowerCase()} specialist for booking ${assigningBooking?.customerName}`}
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-[var(--nexa-text-secondary)]">
            Select an active specialist to assign to this appointment:
          </p>

          <div className="space-y-2">
            {availableSpecialists.map((sp) => (
              <label
                key={sp.id}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedSpecialistId === sp.id
                    ? "border-[#1A56DB] bg-blue-50/20 dark:bg-blue-900/20"
                    : "border-[var(--nexa-border)] bg-[var(--nexa-bg-base)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="specialist"
                    value={sp.id}
                    checked={selectedSpecialistId === sp.id}
                    onChange={() => setSelectedSpecialistId(sp.id)}
                    className="accent-[#1A56DB]"
                  />
                  <div>
                    <span className="font-bold text-xs text-[var(--nexa-text-primary)] block">{sp.name}</span>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] block">{sp.role} · {sp.specialty}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600">{sp.rating} ★</span>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--nexa-border)]">
            <NexaButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAssigningBooking(null)}
              className="rounded-full"
            >
              Cancel
            </NexaButton>
            <NexaButton
              type="button"
              variant="primary"
              size="sm"
              disabled={isAssigning || !selectedSpecialistId}
              onClick={handleAssignSpecialist}
              className="rounded-full bg-[#1A56DB] text-white font-bold"
            >
              {isAssigning ? "Assigning..." : "Confirm Assignment"}
            </NexaButton>
          </div>
        </div>
      </NexaModal>
    </BusinessShell>
  );
}
