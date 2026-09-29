"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  Users,
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle2,
  Wifi,
  Tv,
  Zap,
  Coffee,
  ArrowRight,
  SlidersHorizontal,
  Lock,
} from "lucide-react";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

interface StayProperty {
  id: string;
  name: string;
  type: string;
  location: string;
  pricePerNight: number;
  rating: number;
  reviewsCount: number;
  bedrooms: number;
  maxGuests: number;
  images: string[];
  amenities: string[];
  hostVerified: boolean;
}

const DEFAULT_PROPERTIES: StayProperty[] = [
  {
    id: "stay-01",
    name: "Luxury 3-Bedroom Waterfront Shortlet with Private Pool",
    type: "Shortlet Apartment",
    location: "Admiralty Way, Lekki Phase 1, Lagos",
    pricePerNight: 120000,
    rating: 4.95,
    reviewsCount: 42,
    bedrooms: 3,
    maxGuests: 6,
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600"],
    amenities: ["24/7 Power", "High-Speed WiFi", "Swimming Pool", "Chef on Demand", "Smart Lock"],
    hostVerified: true,
  },
  {
    id: "stay-02",
    name: "Executive 1-Bedroom Studio (Smart Home Automated)",
    type: "Studio Shortlet",
    location: "Victoria Island, Lagos",
    pricePerNight: 55000,
    rating: 4.88,
    reviewsCount: 29,
    bedrooms: 1,
    maxGuests: 2,
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600"],
    amenities: ["24/7 Power", "Dedicated Workspace", "Gym Access", "Smart Lock", "Netflix & DStv"],
    hostVerified: true,
  },
  {
    id: "stay-03",
    name: "Grand 5-Bedroom Villa with Snooker Lounge & Cinema",
    type: "Luxury Villa",
    location: "Maitama, Abuja",
    pricePerNight: 280000,
    rating: 5.0,
    reviewsCount: 16,
    bedrooms: 5,
    maxGuests: 12,
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600"],
    amenities: ["Private Cinema", "Snooker Board", "Armed Security", "24/7 Power", "Infinity Pool"],
    hostVerified: true,
  },
];

interface BookingStayTemplateProps {
  title?: string;
  subtitle?: string;
  subdomain?: string;
}

export const BookingStayTemplate: React.FC<BookingStayTemplateProps> = ({
  title = "Hotels & Verified Shortlets",
  subtitle = "Reserve luxury apartments, boutique hotels, and serviced villas with guaranteed 24/7 power and verified escrow protection.",
  subdomain = "hotels",
}) => {
  const [checkIn, setCheckIn] = useState("2026-08-28");
  const [checkOut, setCheckOut] = useState("2026-08-31");
  const [guests, setGuests] = useState(2);
  const [selectedProperty, setSelectedProperty] = useState<StayProperty | null>(null);

  // Compute stay duration in nights
  const nights = Math.max(
    1,
    Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    ) || 1
  );

  return (
    <div className="space-y-6 pb-20">
      {/* HERO BANNER & SEARCH DOCK */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1A56DB]/10 via-[var(--nexa-bg-surface)] to-[var(--nexa-bg-base)] border border-[#1A56DB]/20 space-y-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <NexaBadge variant="brand" className="font-mono text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 inline mr-1" />
            Rental & Stay Booking • {subdomain}.ofia.ng
          </NexaBadge>
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#0E9F6E] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Escrow Protected Booking</span>
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

        {/* DATE PICKER & GUEST STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] shadow-inner">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[var(--nexa-text-muted)] block font-bold">
              Check-In Date
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[var(--nexa-text-primary)] outline-none cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[var(--nexa-text-muted)] block font-bold">
              Check-Out Date
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[var(--nexa-text-primary)] outline-none cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[var(--nexa-text-muted)] block font-bold">
              Guests & Duration
            </label>
            <div className="flex items-center justify-between text-xs font-bold text-[var(--nexa-text-primary)]">
              <span>{guests} Guests</span>
              <span className="font-mono text-[#1A56DB]">{nights} Nights</span>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <NexaButton size="sm" variant="primary" className="w-full bg-[#1A56DB] text-white justify-center">
              Update Stays
            </NexaButton>
          </div>
        </div>
      </div>

      {/* PROPERTIES LISTINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {DEFAULT_PROPERTIES.map((prop) => (
          <NexaCard
            key={prop.id}
            variant="glass"
            padding="none"
            className="overflow-hidden border border-[var(--nexa-border)] hover:border-[#1A56DB]/40 transition-all flex flex-col justify-between"
          >
            <div className="relative h-48 w-full bg-[var(--nexa-bg-base)]">
              <img src={prop.images[0]} alt={prop.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <NexaBadge variant="neutral" className="bg-[#0B0F19]/80 backdrop-blur-md text-white text-[10px] border-none font-bold">
                  {prop.type}
                </NexaBadge>
              </div>
              <div className="absolute top-3 right-3">
                <div className="px-2 py-1 rounded-lg bg-[#0B0F19]/80 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 text-[#C88A3A] fill-current" />
                  {prop.rating}
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-[11px] text-[var(--nexa-text-muted)]">
                  <MapPin className="w-3 h-3 text-[#E02424]" />
                  <span>{prop.location}</span>
                </div>
                <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] leading-snug">
                  {prop.name}
                </h3>
              </div>

              {/* AMENITIES CHIPS */}
              <div className="flex flex-wrap gap-1">
                {prop.amenities.slice(0, 3).map((am) => (
                  <span
                    key={am}
                    className="px-2 py-0.5 rounded-md bg-[var(--nexa-bg-base)] text-[10px] font-mono text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)]"
                  >
                    {am}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-between">
                <div>
                  <span className="text-base font-black font-mono text-[var(--nexa-text-primary)]">
                    ₦{prop.pricePerNight.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[var(--nexa-text-muted)] font-mono"> / night</span>
                </div>

                <NexaButton
                  size="sm"
                  variant="primary"
                  onClick={() => setSelectedProperty(prop)}
                  className="bg-[#1A56DB] text-white text-xs font-bold"
                >
                  Reserve ({nights}n)
                </NexaButton>
              </div>
            </div>
          </NexaCard>
        ))}
      </div>

      {/* INSTANT RESERVATION MODAL */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                  Confirm Stay Reservation
                </h3>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">{selectedProperty.name}</p>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="w-7 h-7 rounded-full bg-[var(--nexa-bg-base)] flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Check-In:</span>
                  <span className="font-bold text-[var(--nexa-text-primary)]">{checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Check-Out:</span>
                  <span className="font-bold text-[var(--nexa-text-primary)]">{checkOut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Duration:</span>
                  <span className="font-bold text-[#1A56DB]">{nights} Nights</span>
                </div>
                <div className="pt-2 border-t border-[var(--nexa-border)] flex justify-between text-sm font-black">
                  <span>Total Escrow Amount:</span>
                  <span className="text-[#0E9F6E]">₦{(selectedProperty.pricePerNight * nights).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[var(--nexa-text-muted)]">
                <Lock className="w-3.5 h-3.5 text-[#0E9F6E]" />
                <span>Funds held in secure escrow until check-in inspection.</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <NexaButton
                variant="outline"
                onClick={() => setSelectedProperty(null)}
                className="w-1/2 justify-center text-xs"
              >
                Cancel
              </NexaButton>
              <Link href="/book/nexa-verified/checkout" className="w-1/2">
                <NexaButton variant="primary" className="w-full bg-[#1A56DB] text-white justify-center text-xs">
                  Pay with Escrow
                </NexaButton>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
