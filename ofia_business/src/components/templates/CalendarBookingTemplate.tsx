"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  Star,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  User,
  GraduationCap,
  Sparkles,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { AhnaraAvatar } from "@/components/ahnara/AhnaraAvatar";

interface ArtisanPro {
  id: string;
  name: string;
  title: string;
  avatarIndex: number;
  rating: number;
  reviews: number;
  location: string;
  sessionFee: number;
  duration: string;
  specialties: string[];
  availableDates: { date: string; label: string; slots: string[] }[];
}

const DEFAULT_PROS: ArtisanPro[] = [
  {
    id: "pro-01",
    name: "Engr. Julian Cross",
    title: "Advanced STEM & Physics Tutor (WAEC / Cambridge A-Levels)",
    avatarIndex: 6,
    rating: 4.98,
    reviews: 64,
    location: "Ikoyi & Virtual Online",
    sessionFee: 25000,
    duration: "90 Minutes",
    specialties: ["Pure Mathematics", "Physics Mechanics", "Cambridge Exam Prep"],
    availableDates: [
      { date: "2026-08-28", label: "Fri, Aug 28", slots: ["10:00 AM", "01:30 PM", "04:00 PM"] },
      { date: "2026-08-29", label: "Sat, Aug 29", slots: ["09:00 AM", "11:30 AM", "02:00 PM", "05:00 PM"] },
      { date: "2026-08-30", label: "Sun, Aug 30", slots: ["02:00 PM", "04:30 PM"] },
    ],
  },
  {
    id: "pro-02",
    name: "Folashade Aina",
    title: "Executive Wellness & Therapeutic Massage Practitioner",
    avatarIndex: 5,
    rating: 4.92,
    reviews: 48,
    location: "Victoria Island & Mobile Home Visit",
    sessionFee: 35000,
    duration: "60 Minutes",
    specialties: ["Deep Tissue", "Swedish Relaxation", "Sports Recovery"],
    availableDates: [
      { date: "2026-08-28", label: "Fri, Aug 28", slots: ["11:00 AM", "02:00 PM", "04:30 PM"] },
      { date: "2026-08-29", label: "Sat, Aug 29", slots: ["10:00 AM", "01:00 PM", "03:30 PM"] },
    ],
  },
  {
    id: "pro-03",
    name: "Adeyemi Phillips",
    title: "Master Barber & Bespoke Grooming Specialist",
    avatarIndex: 4,
    rating: 4.89,
    reviews: 82,
    location: "Lekki Phase 1, Lagos",
    sessionFee: 15000,
    duration: "45 Minutes",
    specialties: ["Skin Fade & Shape-up", "Beard Sculpting", "Hot Towel Facial"],
    availableDates: [
      { date: "2026-08-28", label: "Fri, Aug 28", slots: ["09:00 AM", "10:30 AM", "01:00 PM", "03:00 PM"] },
      { date: "2026-08-29", label: "Sat, Aug 29", slots: ["08:30 AM", "11:00 AM", "02:30 PM", "04:00 PM"] },
    ],
  },
];

interface CalendarBookingTemplateProps {
  title?: string;
  subtitle?: string;
  subdomain?: string;
}

export const CalendarBookingTemplate: React.FC<CalendarBookingTemplateProps> = ({
  title = "Calendar Appointment Booking",
  subtitle = "Schedule verified 1-on-1 private sessions, tutors, beauty stylists, and consultants with instant appointment confirmations.",
  subdomain = "tutors",
}) => {
  const [selectedPro, setSelectedPro] = useState<ArtisanPro>(DEFAULT_PROS[0]);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string>(
    DEFAULT_PROS[0].availableDates[0].slots[0]
  );
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const activeDate = selectedPro.availableDates[selectedDateIndex] || selectedPro.availableDates[0];

  return (
    <div className="space-y-6 pb-20">
      {/* HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#9061F9]/10 via-[var(--nexa-bg-surface)] to-[var(--nexa-bg-base)] border border-[#9061F9]/20 space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <NexaBadge variant="purple" className="font-mono text-xs font-bold uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5 inline mr-1" />
            Calendar Booking • {subdomain}.ofia.ng
          </NexaBadge>
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#0E9F6E] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Escrow Held Until Session Completion</span>
          </div>
        </div>

        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--nexa-text-primary)] tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--nexa-text-secondary)] leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* PROS LIST & CALENDAR SLOT PICKER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {DEFAULT_PROS.map((pro) => {
          const isSelected = selectedPro.id === pro.id;
          return (
            <NexaCard
              key={pro.id}
              variant="glass"
              padding="md"
              className={`border transition-all flex flex-col justify-between ${
                isSelected
                  ? "border-[#9061F9] ring-1 ring-[#9061F9] bg-[#9061F9]/5"
                  : "border-[var(--nexa-border)] hover:border-[#9061F9]/40"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AhnaraAvatar name={pro.name} size="lg" />
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">{pro.name}</h3>
                      <BadgeCheck className="w-4 h-4 text-[#0E9F6E] shrink-0" />
                    </div>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] line-clamp-1">{pro.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px]">
                      <span className="flex items-center gap-1 text-[#C88A3A] font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        {pro.rating}
                      </span>
                      <span className="text-[var(--nexa-text-muted)]">({pro.reviews} sessions)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {pro.specialties.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md bg-[var(--nexa-bg-base)] text-[10px] font-mono text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)]"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* DATE SELECTOR STRIP */}
                <div className="space-y-1.5 pt-2 border-t border-[var(--nexa-border)]">
                  <span className="text-[10px] font-mono uppercase text-[var(--nexa-text-muted)] font-bold">
                    Select Available Date:
                  </span>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {pro.availableDates.map((d, idx) => (
                      <button
                        key={d.date}
                        onClick={() => {
                          setSelectedPro(pro);
                          setSelectedDateIndex(idx);
                          setSelectedSlot(d.slots[0]);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                          isSelected && selectedDateIndex === idx
                            ? "bg-[#9061F9] text-white"
                            : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)]"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TIME SLOTS GRID */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-[var(--nexa-text-muted)] font-bold">
                    Time Slots ({activeDate?.label}):
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {activeDate?.slots.map((slot) => {
                      const isSlotActive = isSelected && selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => {
                            setSelectedPro(pro);
                            setSelectedSlot(slot);
                          }}
                          className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            isSlotActive
                              ? "bg-[#0E9F6E] text-white shadow-xs"
                              : "bg-[var(--nexa-bg-base)] hover:bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-primary)] border border-[var(--nexa-border)]"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--nexa-border)] mt-3 flex items-center justify-between">
                <div>
                  <span className="text-base font-black font-mono text-[var(--nexa-text-primary)]">
                    ₦{pro.sessionFee.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[var(--nexa-text-muted)] font-mono"> / {pro.duration}</span>
                </div>

                <NexaButton
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setSelectedPro(pro);
                    setIsBookingModalOpen(true);
                  }}
                  className="bg-[#9061F9] hover:bg-[#7E3AF2] text-white text-xs font-bold"
                >
                  Book Slot
                </NexaButton>
              </div>
            </NexaCard>
          );
        })}
      </div>

      {/* CONFIRMATION APPOINTMENT MODAL */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Confirm Booking Appointment</h3>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">{selectedPro.name}</p>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[var(--nexa-bg-base)] flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[var(--nexa-text-muted)]">Specialist:</span>
                <span className="font-bold text-[var(--nexa-text-primary)]">{selectedPro.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--nexa-text-muted)]">Scheduled Date:</span>
                <span className="font-bold text-[#9061F9]">{activeDate?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--nexa-text-muted)]">Selected Slot:</span>
                <span className="font-bold text-[#0E9F6E]">{selectedSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--nexa-text-muted)]">Session Duration:</span>
                <span className="font-bold text-[var(--nexa-text-primary)]">{selectedPro.duration}</span>
              </div>
              <div className="pt-2 border-t border-[var(--nexa-border)] flex justify-between text-sm font-black">
                <span>Total Escrow:</span>
                <span className="text-[#0E9F6E]">₦{selectedPro.sessionFee.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <NexaButton
                variant="outline"
                onClick={() => setIsBookingModalOpen(false)}
                className="w-1/2 justify-center text-xs"
              >
                Cancel
              </NexaButton>
              <Link href="/book/nexa-verified/checkout" className="w-1/2">
                <NexaButton variant="primary" className="w-full bg-[#9061F9] hover:bg-[#7E3AF2] text-white justify-center text-xs font-bold">
                  Confirm & Reserve
                </NexaButton>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
