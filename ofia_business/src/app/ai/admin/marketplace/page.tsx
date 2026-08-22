"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BusinessShell } from "@/components/business/BusinessShell";
import { motion } from "framer-motion";
import {
  Briefcase,
  Sparkles,
  ShoppingBag,
  Building2,
  Mail,
  Award,
  AlertOctagon,
  Layers,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

export default function ERPAdminMarketplacePage() {
  const [mktSubTab, setMktSubTab] = useState<"overview" | "vetting" | "categories" | "disputes" | "cities">("overview");

  const [proVettingList, setProVettingList] = useState([
    { id: "pro-1", business: "Lekki Solar Energy Co.", owner: "Tunde Bakare", city: "Lagos", category: "Solar & Inverter", cac: "RC-1849204", status: "PENDING" },
    { id: "pro-2", business: "Apex Cold Chain Services", owner: "Chukwudi Nwankwo", city: "Abuja", category: "AC & Refrigeration", cac: "BN-2938491", status: "PENDING" },
    { id: "pro-3", business: "VI Private Caregivers", owner: "Nurse Grace Okafor", city: "Lagos", category: "Health Caregiver", cac: "BN-8472910", status: "VERIFIED" },
    { id: "pro-4", business: "PHC Fast Logistics", owner: "Tariere Briggs", city: "Port Harcourt", category: "Haulage & Delivery", cac: "RC-9283741", status: "VERIFIED" },
  ]);

  const handleApprovePro = (id: string) => {
    setProVettingList(prev => prev.map(p => p.id === id ? { ...p, status: "VERIFIED" } : p));
  };

  const handleRejectPro = (id: string) => {
    setProVettingList(prev => prev.map(p => p.id === id ? { ...p, status: "REJECTED" } : p));
  };

  return (
    <BusinessShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* TOP MULTIPAGE TOGGLE SLIDER */}
        <div className="p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl flex items-center justify-between gap-2 select-none">
          <div className="flex items-center gap-1.5 w-full">
            <Link
              href="/erp/admin"
              className="relative flex-1 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all"
            >
              <Briefcase className="w-4 h-4" />
              <span>ERP Staff & Access Control</span>
            </Link>

            <Link
              href="/erp/admin/ai"
              className="relative flex-1 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Ofia AI (GTM Swarm)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-400">
                15 Agents
              </span>
            </Link>

            <Link
              href="/erp/admin/marketplace"
              className="relative flex-1 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 text-white font-black shadow-lg"
            >
              <motion.div
                layoutId="admin-active-tab-indicator"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
              <ShoppingBag className="w-4 h-4 text-emerald-300" />
              <span>Ofia Marketplace</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/20 text-white">
                3,420 Pros
              </span>
            </Link>
          </div>
        </div>

        {/* MARKETPLACE SUB-NAVIGATION */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: "overview", label: "Marketplace GMV", icon: ShoppingBag },
              { id: "vetting", label: "Pro Vetting & Badges", icon: Award },
              { id: "categories", label: "99+ Categories", icon: Layers },
              { id: "disputes", label: "Escrow Disputes", icon: AlertOctagon },
              { id: "cities", label: "City Analytics", icon: TrendingUp },
            ].map((st) => {
              const Icon = st.icon;
              const active = mktSubTab === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setMktSubTab(st.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    active
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            2 Pros Awaiting Review
          </span>
        </div>

        {/* MKT SUBTAB 1: OVERVIEW */}
        {mktSubTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total GMV</span>
                <div className="text-2xl font-black text-slate-800">₦42,850,000</div>
                <span className="text-[11px] text-emerald-600 font-bold">+24% vs Last Month</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Verified Pros</span>
                <div className="text-2xl font-black text-emerald-600">3,420</div>
                <span className="text-[11px] text-slate-500">Across 36 states + FCT</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Escrow in Transit</span>
                <div className="text-2xl font-black text-blue-600">₦3,240,000</div>
                <span className="text-[11px] text-slate-500">Paystack Protected</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Platform Commissions</span>
                <div className="text-2xl font-black text-emerald-700">₦4,285,000</div>
                <span className="text-[11px] text-slate-500">10% average fee</span>
              </div>
            </div>
          </div>
        )}

        {/* MKT SUBTAB 2: PRO VETTING */}
        {mktSubTab === "vetting" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-800">Pro Merchant Verification Queue</h3>
              <span className="text-xs text-slate-500 font-bold">{proVettingList.length} Records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Business & Owner</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">CAC Number</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {proVettingList.map((pro) => (
                    <tr key={pro.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {pro.business}
                        <div className="text-[11px] font-normal text-slate-400">{pro.owner}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{pro.category}</td>
                      <td className="py-3.5 px-4 text-slate-700">{pro.city}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">{pro.cac}</td>
                      <td className="py-3.5 px-4">
                        {pro.status === "VERIFIED" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {pro.status !== "VERIFIED" && (
                          <button
                            onClick={() => handleApprovePro(pro.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                          >
                            Approve Badge
                          </button>
                        )}
                        {pro.status === "PENDING" && (
                          <button
                            onClick={() => handleRejectPro(pro.id)}
                            className="px-2.5 py-1 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MKT SUBTAB 3: CATEGORIES */}
        {mktSubTab === "categories" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-800">99+ Categories & Escrow Commissions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800">Home Services & Solar</span>
                <p className="text-[11px] text-slate-500">18 Sub-niches • 10% Commission</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800">Artisans & Handyman</span>
                <p className="text-[11px] text-slate-500">14 Sub-niches • 12% Commission</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800">Healthcare & Private Nurses</span>
                <p className="text-[11px] text-slate-500">8 Sub-niches • 15% Commission</p>
              </div>
            </div>
          </div>
        )}

        {/* MKT SUBTAB 4: DISPUTES */}
        {mktSubTab === "disputes" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-800">Active Escrow Disputes (2)</h3>
            <div className="space-y-2 text-xs">
              <div className="p-3.5 rounded-xl bg-red-50/40 border border-red-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">DSP-8401: Lekki Solar Energy Co. (₦145,000)</div>
                  <div className="text-[11px] text-slate-500">Incomplete cabling upon delivery • Client: Amina Yusuf</div>
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold">Arbitrate</button>
              </div>
            </div>
          </div>
        )}

        {/* MKT SUBTAB 5: CITIES */}
        {mktSubTab === "cities" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-800">City-by-City Booking Heatmaps</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800">Lagos (Lekki, VI, Ikeja)</span>
                <p className="text-[11px] text-emerald-600 font-bold">4,820 Bookings (₦26.4M GMV)</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800">Abuja (Maitama, Garki)</span>
                <p className="text-[11px] text-emerald-600 font-bold">1,940 Bookings (₦10.2M GMV)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </BusinessShell>
  );
}
