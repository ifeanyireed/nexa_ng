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
  Star,
  ShieldCheck,
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

export interface SpecialistStaff {
  id: string;
  name: string;
  role: string;
  rating: number;
  completedJobs: number;
  isAvailable: boolean;
  specialty: string;
}

export const VERTICAL_SPECIALISTS: Record<string, SpecialistStaff[]> = {
  cars: [
    { id: "TECH-01", name: "Engr. Babatunde Lawal", role: "Master Diagnostic Technician", rating: 4.9, completedJobs: 142, isAvailable: true, specialty: "Engine Diagnostics & OBD-II" },
    { id: "TECH-02", name: "Chibuike Okonkwo", role: "Certified Vehicle Inspector", rating: 4.8, completedJobs: 98, isAvailable: true, specialty: "Pre-Purchase & Safety Audits" },
    { id: "TECH-03", name: "Amina Yusuf", role: "Automotive Electrical Specialist", rating: 5.0, completedJobs: 87, isAvailable: false, specialty: "ECU Tuning & Hybrid Systems" },
  ],
  fashion: [
    { id: "STYL-01", name: "Damilola Adebayo", role: "Lead Bespoke Stylist", rating: 4.9, completedJobs: 120, isAvailable: true, specialty: "Haute Couture & Tailoring" },
    { id: "STYL-02", name: "Grace Effiong", role: "Personal Shopper & Fitter", rating: 4.8, completedJobs: 85, isAvailable: true, specialty: "Bridal & Red Carpet" },
  ],
  beauty: [
    { id: "SPA-01", name: "Zainab Bello", role: "Senior Medical Esthetician", rating: 4.9, completedJobs: 210, isAvailable: true, specialty: "Skin Therapy & Peels" },
    { id: "SPA-02", name: "Kehinde Daniels", role: "Master Hair Artiste & Therapist", rating: 4.8, completedJobs: 135, isAvailable: true, specialty: "Trichology & Treatments" },
  ],
  gadgets: [
    { id: "GAD-01", name: "Samuel Okafor", role: "Apple / Android Certified Tech", rating: 4.9, completedJobs: 340, isAvailable: true, specialty: "Logic Board & Screen Repair" },
    { id: "GAD-02", name: "Emeka Peters", role: "Drone & Camera Specialist", rating: 4.7, completedJobs: 72, isAvailable: true, specialty: "Sensor Calibration & Firmware" },
  ],
  retail: [
    { id: "CS-01", name: "Folake Williams", role: "Senior Client Specialist", rating: 4.9, completedJobs: 160, isAvailable: true, specialty: "Consultations & Fitting" },
    { id: "CS-02", name: "Ibrahim Musa", role: "Product Specialist", rating: 4.8, completedJobs: 95, isAvailable: true, specialty: "Demonstrations & Onboarding" },
  ],
  dispatch: [
    { id: "RDR-01", name: "Chidi Okeke", role: "Senior Fleet Rider", rating: 4.9, completedJobs: 380, isAvailable: true, specialty: "Express Motorcycle Courier" },
    { id: "RDR-02", name: "Tunde Bakare", role: "Van Freight Specialist", rating: 4.8, completedJobs: 215, isAvailable: true, specialty: "Bulk Cargo & Interstate Haulage" },
    { id: "RDR-03", name: "Emeka Obi", role: "Cold-Chain Logistics Courier", rating: 4.9, completedJobs: 145, isAvailable: true, specialty: "Pharmaceutical & Perishable Delivery" },
  ],
};

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

  const availableSpecialists = VERTICAL_SPECIALISTS[selectedVertical] || VERTICAL_SPECIALISTS.retail;

  const handleAssignSpecialist = async () => {
    if (!assigningBooking || !selectedSpecialistId) return;
    const specialist = availableSpecialists.find((s) => s.id === selectedSpecialistId);
    if (!specialist) return;

    setIsAssigning(true);
    const targetSlug = (activeTenant?.slug || "neweratransports").toLowerCase().trim();
    const assignedName = `${specialist.name} · ${specialist.role}`;

    // Optimistic UI update
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
      console.error("Failed to assign technician:", err);
      fetchBookings();
    } finally {
      setIsAssigning(false);
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

      {/* ASSIGN TECHNICIAN / SPECIALIST MODAL */}
      <NexaModal
        isOpen={!!assigningBooking}
        onClose={() => setAssigningBooking(null)}
        title={`Assign Specialist · Booking #${assigningBooking?.id || (assigningBooking as any)?.bookingNumber}`}
        subtitle={`Select a verified ${currentVerticalDef.name} specialist or technician to fulfill this appointment.`}
        maxWidth="lg"
      >
        <div className="space-y-4 pt-2">
          {/* Appointment Snapshot */}
          <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[var(--nexa-text-primary)]">
                {assigningBooking?.customerName}
              </span>
              <NexaBadge variant="brand" size="sm" className="rounded-full font-mono">
                {assigningBooking?.dateTime}
              </NexaBadge>
            </div>
            <p className="text-xs text-[var(--nexa-text-secondary)] font-medium">
              {assigningBooking?.serviceTitle}
            </p>
            {assigningBooking?.notes && (
              <p className="text-[11px] text-[var(--nexa-text-muted)] italic">
                "{assigningBooking.notes}"
              </p>
            )}
          </div>

          {/* Specialist List */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--nexa-text-primary)] block">
              Available {currentVerticalDef.name} Staff & Certified Specialists
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {availableSpecialists.map((spec) => (
                <div
                  key={spec.id}
                  onClick={() => setSelectedSpecialistId(spec.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedSpecialistId === spec.id
                      ? "border-[#1A56DB] bg-blue-50/60 dark:bg-blue-950/40 shadow-xs"
                      : "border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[var(--nexa-text-primary)]">{spec.name}</span>
                        {spec.isAvailable ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Available
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            On Session
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--nexa-text-secondary)] font-medium">
                        {spec.role} · <span className="text-[var(--nexa-text-muted)]">{spec.specialty}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[11px]">
                    <div className="font-bold text-amber-500 flex items-center gap-0.5 justify-end">
                      <Star className="w-3 h-3 fill-amber-400" /> {spec.rating}
                    </div>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] font-mono">
                      {spec.completedJobs} completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--nexa-border)]">
            <NexaButton
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setAssigningBooking(null)}
            >
              Cancel
            </NexaButton>
            <NexaButton
              type="button"
              variant="primary"
              size="sm"
              disabled={!selectedSpecialistId || isAssigning}
              className="rounded-full bg-[#1A56DB] text-white font-bold"
              onClick={handleAssignSpecialist}
            >
              {isAssigning ? "Assigning..." : "Confirm Staff Allocation"}
            </NexaButton>
          </div>
        </div>
      </NexaModal>
    </BusinessShell>
  );
}
