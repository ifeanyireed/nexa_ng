"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Heart,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Search,
  Share2,
  ShoppingBag,
  Star,
  Zap,
} from "lucide-react";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaThemeToggle } from "@/components/nexa/NexaThemeToggle";

export default function TenantPublicShopfrontPage() {
  const [activeTab, setActiveTab] = useState<"featured" | "services" | "products" | "about">("featured");

  const sampleProducts = [
    { id: "p1", name: "Premium Solar Inverter Hybrid 5kVA", price: "₦680,000", badge: "Best Seller", rating: 4.9, reviews: 34, inStock: true },
    { id: "p2", name: "Commercial CCTV 8-Camera 4K Kit", price: "₦320,000", badge: "Pro Grade", rating: 4.8, reviews: 21, inStock: true },
    { id: "p3", name: "Lithium Battery Bank 48V 100Ah", price: "₦1,250,000", badge: "Warranty 5Y", rating: 5.0, reviews: 18, inStock: true },
  ];

  const sampleServices = [
    { id: "s1", name: "Solar Inverter Site Audit & Sizing", price: "₦25,000", duration: "2 Hours", desc: "Complete electrical load assessment and sizing for home/office." },
    { id: "s2", name: "CCTV Installation & IP Cloud Setup", price: "₦45,000", duration: "4 Hours", desc: "Mounting, cable routing, NVR configuration, and mobile remote view setup." },
  ];

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] font-sans flex flex-col">
      {/* PUBLIC STORE TOPBAR */}
      <header className="sticky top-0 z-30 h-16 border-b border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/85 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1A56DB] to-[#0E9F6E] p-0.5 shadow-sm">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center text-white font-black text-sm">
              EN
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base text-[var(--nexa-text-primary)]">
                EduSuite Nigeria Pro Store
              </span>
              <NexaBadge variant="green" className="text-[9px] py-0 px-1.5 font-bold uppercase">
                <BadgeCheck className="w-3 h-3 inline mr-0.5" />
                Nexa Verified
              </NexaBadge>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[var(--nexa-text-muted)]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#E02424]" />
                Lekki Phase 1, Lagos
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#C88A3A] font-bold">
                <Star className="w-3 h-3 fill-current" />
                4.9 (54 Reviews)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NexaThemeToggle />
          <Link href="/shopfront/book">
            <NexaButton size="sm" variant="primary" leftIcon={<Calendar className="w-3.5 h-3.5" />} className="bg-[#0E9F6E] text-white hover:bg-[#0B855D]">
              Book Appointment
            </NexaButton>
          </Link>
        </div>
      </header>

      {/* STORE HERO BANNER */}
      <div className="border-b border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <NexaBadge variant="brand" className="font-mono text-xs">
              Official Digital Shopfront • client_slug.domain.shop
            </NexaBadge>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--nexa-text-primary)] tracking-tight">
              Enterprise Power, Solar Inverters & Security Systems
            </h1>
            <p className="text-xs sm:text-sm text-[var(--nexa-text-secondary)] leading-relaxed">
              Certified solar technicians and smart security installations across Lagos and nationwide. Same-day emergency response with 100% verified escrow protection.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <a
              href="https://wa.me/2348000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 font-bold text-xs hover:bg-[#25D366]/20 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp Us
            </a>
            <Link href="/shopfront/shop">
              <NexaButton variant="outline" size="sm" leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}>
                Browse Catalog
              </NexaButton>
            </Link>
          </div>
        </div>
      </div>

      {/* STORE CONTENT CONTAINER */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-8 space-y-8 flex-1">
        {/* NAV TABS */}
        <div className="flex items-center gap-2 border-b border-[var(--nexa-border)] pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("featured")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "featured"
                ? "bg-[#1A56DB] text-white shadow-xs"
                : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
            }`}
          >
            Featured Products
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "services"
                ? "bg-[#0E9F6E] text-white shadow-xs"
                : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
            }`}
          >
            Bookable Services (2)
          </button>
        </div>

        {/* PRODUCTS GRID */}
        {activeTab === "featured" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-[var(--nexa-text-primary)] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#1A56DB]" />
                Top Available Products
              </h2>
              <Link href="/shopfront/shop" className="text-xs text-[#1A56DB] font-bold hover:underline flex items-center gap-1">
                <span>View Full Catalog</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {sampleProducts.map((p) => (
                <NexaCard key={p.id} variant="glass" padding="md" className="space-y-3 border border-[var(--nexa-border)] hover:border-[#1A56DB]/40 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <NexaBadge variant="purple" className="text-[10px]">{p.badge}</NexaBadge>
                      <span className="text-[11px] text-[#0E9F6E] font-bold">In Stock</span>
                    </div>
                    <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">{p.name}</h3>
                    <div className="text-base font-black text-[var(--nexa-text-primary)] font-mono">{p.price}</div>
                  </div>

                  <div className="pt-2 border-t border-[var(--nexa-border)] flex items-center justify-between">
                    <span className="text-xs text-[var(--nexa-text-muted)] flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#C88A3A] fill-current" />
                      {p.rating} ({p.reviews})
                    </span>
                    <NexaButton size="sm" variant="primary" className="bg-[#1A56DB] text-white">
                      Order Now
                    </NexaButton>
                  </div>
                </NexaCard>
              ))}
            </div>
          </div>
        )}

        {/* SERVICES GRID */}
        {activeTab === "services" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-[var(--nexa-text-primary)] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0E9F6E]" />
                Certified On-Demand Services
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleServices.map((s) => (
                <NexaCard key={s.id} variant="glass" padding="md" className="space-y-3 border border-[var(--nexa-border)] flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">{s.name}</h3>
                      <span className="text-xs font-mono font-bold text-[#0E9F6E]">{s.price}</span>
                    </div>
                    <p className="text-xs text-[var(--nexa-text-secondary)]">{s.desc}</p>
                    <div className="text-[11px] text-[var(--nexa-text-muted)] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Duration: {s.duration}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--nexa-border)] flex justify-end">
                    <Link href="/shopfront/book">
                      <NexaButton size="sm" variant="primary" className="bg-[#0E9F6E] text-white">
                        Book Service
                      </NexaButton>
                    </Link>
                  </div>
                </NexaCard>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* PUBLIC FOOTER */}
      <footer className="border-t border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] py-6 px-4 sm:px-8 text-center text-xs text-[var(--nexa-text-muted)] space-y-1">
        <p>Powered by <span className="font-bold text-[var(--nexa-text-primary)]">Ofia Business</span> • Verified Merchant Partner</p>
        <p className="text-[11px] font-mono">100% Escrow Protection via Nexa Verified</p>
      </footer>
    </div>
  );
}
