"use client";

import React, { useState } from "react";
import {
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  MapPin,
  Phone,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  Store,
  UserCheck,
  XCircle,
} from "lucide-react";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";

interface ProMerchant {
  id: string;
  businessName: string;
  ownerName: string;
  category: string;
  city: string;
  area: string;
  phone: string;
  rating: number;
  totalBookings: number;
  cacNumber: string;
  verified: boolean;
  status: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED";
  joinedDate: string;
}

const INITIAL_PROS: ProMerchant[] = [
  {
    id: "pro_01",
    businessName: "Lagos Master Plumbers Ltd",
    ownerName: "Tunde Bakare",
    category: "Plumbing & Piping",
    city: "Lagos",
    area: "Lekki Phase 1",
    phone: "+234 802 123 4567",
    rating: 4.9,
    totalBookings: 248,
    cacNumber: "RC-1849204",
    verified: true,
    status: "ACTIVE",
    joinedDate: "Jan 12, 2026",
  },
  {
    id: "pro_02",
    businessName: "Abuja Solar & Inverter Tech",
    ownerName: "Ibrahim Musa",
    category: "Electrical & Solar",
    city: "Abuja",
    area: "Maitama",
    phone: "+234 803 987 6543",
    rating: 4.8,
    totalBookings: 182,
    cacNumber: "RC-1928371",
    verified: true,
    status: "ACTIVE",
    joinedDate: "Feb 03, 2026",
  },
  {
    id: "pro_03",
    businessName: "Apex Auto Mechanics & Diagnostics",
    ownerName: "Emeka Okafor",
    category: "Automotive Services",
    city: "Lagos",
    area: "Ikeja",
    phone: "+234 818 555 1234",
    rating: 4.6,
    totalBookings: 94,
    cacNumber: "RC-2049182",
    verified: false,
    status: "PENDING_VERIFICATION",
    joinedDate: "Mar 10, 2026",
  },
  {
    id: "pro_04",
    businessName: "SparkleClean Office Services",
    ownerName: "Blessing Adeyemi",
    category: "Cleaning & Facilities",
    city: "Port Harcourt",
    area: "GRA Phase 2",
    phone: "+234 809 333 4444",
    rating: 4.7,
    totalBookings: 130,
    cacNumber: "BN-4918274",
    verified: true,
    status: "ACTIVE",
    joinedDate: "Feb 18, 2026",
  },
  {
    id: "pro_05",
    businessName: "Rapid Express Haulage",
    ownerName: "Kayode Daniels",
    category: "Logistics & Moving",
    city: "Lagos",
    area: "Victoria Island",
    phone: "+234 805 777 8888",
    rating: 4.2,
    totalBookings: 67,
    cacNumber: "Pending Upload",
    verified: false,
    status: "PENDING_VERIFICATION",
    joinedDate: "Mar 15, 2026",
  },
];

export default function MarketplaceMerchantsPage() {
  const [pros, setPros] = useState<ProMerchant[]>(INITIAL_PROS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const toggleVerification = (id: string) => {
    setPros((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              verified: !p.verified,
              status: !p.verified ? "ACTIVE" : "PENDING_VERIFICATION",
            }
          : p
      )
    );
  };

  const filtered = pros.filter((p) => {
    const matchesSearch =
      p.businessName.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "VERIFIED" && p.verified) ||
      (statusFilter === "PENDING" && !p.verified);
    return matchesSearch && matchesStatus;
  });

  return (
    <SuperAdminShell
      title="Pro Merchants & Verification"
      subtitle="Review merchant credentials, inspect CAC business registrations, and issue Nexa Verified Trust Badges."
      action={
        <div className="flex items-center gap-2">
          <NexaBadge variant="green" className="py-1 px-2.5 text-xs font-bold">
            {pros.filter((p) => p.verified).length} / {pros.length} Verified
          </NexaBadge>
        </div>
      }
    >
      <div className="space-y-4">
        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by business, owner, city, or CAC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#0E9F6E]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "ALL"
                  ? "bg-[#0E9F6E] text-white"
                  : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
              }`}
            >
              All Pros ({pros.length})
            </button>
            <button
              onClick={() => setStatusFilter("VERIFIED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "VERIFIED"
                  ? "bg-[#0E9F6E] text-white"
                  : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "PENDING"
                  ? "bg-[#0E9F6E] text-white"
                  : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
              }`}
            >
              Pending
            </button>
          </div>
        </div>

        {/* PRO TABLE */}
        <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-semibold">
              <tr>
                <th className="py-3 px-4">Business & Owner</th>
                <th className="py-3 px-3">Vertical / Niche</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">CAC Reg</th>
                <th className="py-3 px-3">Bookings & Rating</th>
                <th className="py-3 px-3">Badge Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
              {filtered.map((pro) => (
                <tr key={pro.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <NexaAvatar name={pro.ownerName} size="sm" />
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          <span>{pro.businessName}</span>
                          {pro.verified && (
                            <ShieldCheck className="w-4 h-4 text-[#0E9F6E] shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5">
                          {pro.ownerName} • {pro.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <NexaBadge variant="neutral">{pro.category}</NexaBadge>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                      <span>{pro.area}, {pro.city}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px]">
                    {pro.cacNumber}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1 font-bold">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                      <span>{pro.rating}</span>
                      <span className="text-[10px] text-[var(--nexa-text-muted)] font-normal">
                        ({pro.totalBookings} orders)
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <NexaBadge variant={pro.verified ? "green" : "amber"}>
                      {pro.verified ? "Nexa Verified" : "Pending Vetting"}
                    </NexaBadge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <NexaButton
                      size="sm"
                      variant={pro.verified ? "outline" : "primary"}
                      onClick={() => toggleVerification(pro.id)}
                      className={!pro.verified ? "bg-[#0E9F6E] text-white hover:bg-[#0B855D]" : ""}
                    >
                      {pro.verified ? "Revoke Badge" : "Grant Verified Badge"}
                    </NexaButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminShell>
  );
}
