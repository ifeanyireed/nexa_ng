"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Filter,
  Eye,
  FileText,
  AlertTriangle,
  Building2,
  MapPin,
  Star,
  ExternalLink,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaModal } from "@/components/nexa/NexaModal";

export default function MarketplaceProsVettingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "VERIFIED" | "REJECTED">("ALL");
  const [selectedPro, setSelectedPro] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [prosList, setProsList] = useState([
    {
      id: "pro-201",
      businessName: "Lekki Solar Energy Solutions",
      ownerName: "Babatunde Adeleke",
      email: "tunde@lekkisolar.ng",
      phone: "+234 803 123 4567",
      category: "Solar & Inverter Installation",
      niche: "home-services",
      city: "Lagos",
      area: "Lekki Phase 1",
      cacNumber: "RC-1849204",
      idDocType: "NIN Slip & Passport",
      status: "PENDING",
      submittedDate: "2026-08-21",
      bankAccount: "0123456789 (GTBank)",
      profileViews: 412,
    },
    {
      id: "pro-202",
      businessName: "Apex Cold Chain Refrigeration",
      ownerName: "Chukwudi Nwankwo",
      email: "service@apexcold.ng",
      phone: "+234 802 987 6543",
      category: "AC & Cold Room Repair",
      niche: "home-services",
      city: "Abuja",
      area: "Maitama",
      cacNumber: "BN-2938491",
      idDocType: "Driver's License",
      status: "PENDING",
      submittedDate: "2026-08-20",
      bankAccount: "1092837465 (Zenith Bank)",
      profileViews: 280,
    },
    {
      id: "pro-203",
      businessName: "Victoria Island Private Nursing",
      ownerName: "Nurse Grace Okafor",
      email: "grace@vinursing.ng",
      phone: "+234 810 555 1212",
      category: "Private Nurse & Caregiver",
      niche: "health",
      city: "Lagos",
      area: "Victoria Island",
      cacNumber: "BN-8472910",
      idDocType: "Nursing License & NIN",
      status: "VERIFIED",
      submittedDate: "2026-08-15",
      bankAccount: "2039485710 (Access Bank)",
      profileViews: 1250,
    },
    {
      id: "pro-204",
      businessName: "Port Harcourt Fast Logistics",
      ownerName: "Tariere Briggs",
      email: "dispatch@phclogistics.ng",
      phone: "+234 809 333 4444",
      category: "Last-Mile Delivery",
      niche: "logistics",
      city: "Port Harcourt",
      area: "GRA Phase 2",
      cacNumber: "RC-9283741",
      idDocType: "NIN & Dispatch Permit",
      status: "VERIFIED",
      submittedDate: "2026-08-10",
      bankAccount: "0019283746 (UBA)",
      profileViews: 890,
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApprove = (proId: string) => {
    setProsList((prev) =>
      prev.map((p) => (p.id === proId ? { ...p, status: "VERIFIED" } : p))
    );
    setSelectedPro(null);
    showToast("Badge issued! Pro is now marked 'Nexa Verified' with verified trust badge.");
  };

  const handleReject = (proId: string) => {
    setProsList((prev) =>
      prev.map((p) => (p.id === proId ? { ...p, status: "REJECTED" } : p))
    );
    setSelectedPro(null);
    showToast("Application rejected. Vendor notified to update verification credentials.");
  };

  const filteredPros = prosList.filter((pro) => {
    const matchesSearch =
      pro.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ? true : pro.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-[#0E9F6E] text-white text-xs font-bold shadow-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {toastMessage}
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/marketplace" className="text-xs font-bold text-[#0E9F6E] hover:underline">
                ← Marketplace Admin
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--nexa-text-primary)] flex items-center gap-2.5 mt-1">
              <Award className="w-6 h-6 text-[#0E9F6E]" />
              Pro & Merchant Vetting Center
            </h1>
            <p className="text-xs sm:text-sm text-[var(--nexa-text-muted)] mt-1">
              Inspect government identity credentials, verify CAC corporate registrations, and award <strong>Nexa Verified</strong> badges.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <NexaBadge variant="brand">2 Pending Review</NexaBadge>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nexa-text-muted)]" />
            <input
              type="text"
              placeholder="Search business, owner, city, or niche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#0E9F6E]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            {(["ALL", "PENDING", "VERIFIED", "REJECTED"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#0E9F6E] text-white shadow-sm"
                    : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)] hover:text-[var(--nexa-text-primary)]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* PROS TABLE */}
        <NexaCard variant="glass" padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Business & Owner</th>
                  <th className="py-3 px-4">Category & Niche</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">CAC Reg</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] font-medium">
                {filteredPros.map((pro) => (
                  <tr key={pro.id} className="hover:bg-[var(--nexa-bg-surface)]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[var(--nexa-text-primary)]">{pro.businessName}</div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)]">{pro.ownerName} • {pro.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[var(--nexa-text-primary)]">{pro.category}</div>
                      <div className="text-[10px] font-mono text-[var(--nexa-text-muted)]">{pro.niche}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[var(--nexa-text-primary)]">{pro.city}</div>
                      <div className="text-[10px] text-[var(--nexa-text-muted)]">{pro.area}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--nexa-text-primary)]">
                      {pro.cacNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      {pro.status === "VERIFIED" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0E9F6E] bg-[#0E9F6E]/10 px-2 py-0.5 rounded-full border border-[#0E9F6E]/20">
                          <ShieldCheck className="w-3 h-3" /> Nexa Verified
                        </span>
                      )}
                      {pro.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full border border-[#F59E0B]/20">
                          Pending Review
                        </span>
                      )}
                      {pro.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E02424] bg-[#E02424]/10 px-2 py-0.5 rounded-full border border-[#E02424]/20">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <NexaButton
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPro(pro)}
                        leftIcon={<Eye className="w-3 h-3" />}
                      >
                        Inspect
                      </NexaButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NexaCard>

        {/* INSPECTION MODAL */}
        {selectedPro && (
          <NexaModal
            isOpen={!!selectedPro}
            onClose={() => setSelectedPro(null)}
            title={`Vetting: ${selectedPro.businessName}`}
          >
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                <div className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center justify-between">
                  <span>{selectedPro.businessName}</span>
                  <NexaBadge variant={selectedPro.status === "VERIFIED" ? "brand" : "cyan"}>
                    {selectedPro.status}
                  </NexaBadge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--nexa-text-secondary)]">
                  <div>Owner: <strong>{selectedPro.ownerName}</strong></div>
                  <div>Phone: <strong>{selectedPro.phone}</strong></div>
                  <div>Email: <strong>{selectedPro.email}</strong></div>
                  <div>Location: <strong>{selectedPro.area}, {selectedPro.city}</strong></div>
                  <div>CAC Reg: <strong>{selectedPro.cacNumber}</strong></div>
                  <div>Submitted: <strong>{selectedPro.submittedDate}</strong></div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                <div className="font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0E9F6E]" />
                  Uploaded Verification Credentials
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)]">
                    <span>CAC Registration Certificate ({selectedPro.cacNumber}.pdf)</span>
                    <span className="text-[#0E9F6E] font-bold">Attached ✓</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)]">
                    <span>Identity Document ({selectedPro.idDocType})</span>
                    <span className="text-[#0E9F6E] font-bold">Attached ✓</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)]">
                    <span>Settlement Payout Account ({selectedPro.bankAccount})</span>
                    <span className="text-[#0E9F6E] font-bold">Verified ✓</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <NexaButton
                  size="sm"
                  variant="outline"
                  className="text-[#E02424] hover:bg-[#E02424]/10"
                  onClick={() => handleReject(selectedPro.id)}
                >
                  Reject Application
                </NexaButton>
                <NexaButton
                  size="sm"
                  variant="primary"
                  className="bg-[#0E9F6E] hover:bg-[#0B855B] text-white"
                  leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                  onClick={() => handleApprove(selectedPro.id)}
                >
                  Grant Nexa Verified Badge
                </NexaButton>
              </div>
            </div>
          </NexaModal>
        )}
      </div>
    </AdminShell>
  );
}
