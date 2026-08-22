"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Calendar,
  MessageSquare,
  User,
  Settings,
  Store,
  Wallet,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function MarketplaceClientPortalOverviewPage() {
  const clientRoutes = [
    { label: "Client Dashboard", href: "/marketplace/client/dashboard", icon: ShoppingBag, desc: "Overview of your bookings, messages, and orders." },
    { label: "Bookings & Appointments", href: "/marketplace/client/dashboard/bookings", icon: Calendar, desc: "Track active on-site technician and pro bookings." },
    { label: "Direct Messages", href: "/marketplace/client/dashboard/messages", icon: MessageSquare, desc: "Chat in real-time with assigned verified service providers." },
    { label: "Purchases & Orders", href: "/marketplace/client/dashboard/shop", icon: Store, desc: "Track e-commerce product deliveries and purchases." },
    { label: "Client Escrow Wallet", href: "/marketplace/client/dashboard/wallet", icon: Wallet, desc: "Manage payments, Paystack receipts, and escrow releases." },
    { label: "Profile & Preferences", href: "/marketplace/client/dashboard/profile", icon: User, desc: "Update your delivery addresses, phone, and profile." },
  ];

  return (
    <BusinessShell>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--nexa-text-primary)] flex items-center gap-2.5">
              <ShoppingBag className="w-6 h-6 text-[#0E9F6E]" />
              Marketplace Client & Customer Portal
            </h1>
            <p className="text-xs sm:text-sm text-[var(--nexa-text-muted)] mt-1">
              Manage your verified service bookings, merchant purchases, direct chat messages, and escrow wallet.
            </p>
          </div>

          <Link href="/marketplace/client/dashboard">
            <NexaButton size="sm" variant="primary" className="bg-[#0E9F6E] hover:bg-[#0B855B] text-white">
              Go to Client Dashboard
            </NexaButton>
          </Link>
        </div>

        {/* TILES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientRoutes.map((route) => {
            const Icon = route.icon;
            return (
              <Link
                key={route.href}
                href={route.href}
                className="p-5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-[#0E9F6E]/50 transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-[#0E9F6E]/10 text-[#0E9F6E]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--nexa-text-muted)] group-hover:text-[#0E9F6E] group-hover:translate-x-1 transition-all" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] group-hover:text-[#0E9F6E] transition-colors">
                    {route.label}
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)] mt-1 leading-relaxed">
                    {route.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </BusinessShell>
  );
}
