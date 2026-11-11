"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Trophy,
  Award,
  Sparkles,
  Share2,
  Check,
  Building2,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Tv,
} from "lucide-react";
import { resolveAvatarUrl } from "@/lib/avatar";

interface PublicAwardWinner {
  id: string;
  categoryName: string;
  employeeName: string;
  department: string;
  designation: string;
  avatarUrl: string;
  citation: string;
  certificateNumber: string;
  awardYear: number;
}

const SAMPLE_PUBLIC_WINNERS: Record<number, PublicAwardWinner[]> = {
  2026: [
    {
      id: "pub-1",
      categoryName: "Employee of the Year",
      employeeName: "Chioma Okonjo",
      department: "Finance & Accounts",
      designation: "Senior Financial Analyst",
      avatarUrl: "/character1.jpg",
      citation: "Spearheaded the unified reconciliation framework, reducing month-end close by 5 business days and preventing billing discrepancies.",
      certificateNumber: "OFIA-2026-AWD-001",
      awardYear: 2026,
    },
    {
      id: "pub-2",
      categoryName: "Best Team Player",
      employeeName: "Fatima Al-Hassan",
      department: "NOC Central",
      designation: "Support Team Lead",
      avatarUrl: "/character4.jpg",
      citation: "Exemplifying selfless collaboration, continuous training, and round-the-clock support for all operational teams.",
      certificateNumber: "OFIA-2026-AWD-002",
      awardYear: 2026,
    },
    {
      id: "pub-3",
      categoryName: "Most Innovative Employee",
      employeeName: "Dapo Williams",
      department: "Systems & IT",
      designation: "DevOps & Automation Specialist",
      avatarUrl: "/character6.jpg",
      citation: "Created the automated deployment pipeline that reduced staging deployment cycles from 45 minutes to 4 minutes.",
      certificateNumber: "OFIA-2026-AWD-003",
      awardYear: 2026,
    },
    {
      id: "pub-4",
      categoryName: "Most Punctual & Disciplined",
      employeeName: "Ibrahim Musa",
      department: "Fleet Operations",
      designation: "Senior Dispatcher",
      avatarUrl: "/character8.jpg",
      citation: "Zero late clock-ins across 260 operating days; first to open depot dispatch desk daily.",
      certificateNumber: "OFIA-2026-AWD-004",
      awardYear: 2026,
    },
    {
      id: "pub-5",
      categoryName: "Outstanding Leadership",
      employeeName: "Olumide Bakare",
      department: "NOC Central",
      designation: "Operations Manager",
      avatarUrl: "/character2.jpg",
      citation: "Steered the 24/7 Operations Center through high-volume surge periods while maintaining team morale.",
      certificateNumber: "OFIA-2026-AWD-005",
      awardYear: 2026,
    },
    {
      id: "pub-6",
      categoryName: "Best Performing Department",
      employeeName: "Fleet & Logistics Operations",
      department: "Operations",
      designation: "Whole Department",
      avatarUrl: "/character4.jpg",
      citation: "Delivered 450,000+ orders across 4 metro regions with 98.7% SLA fulfillment.",
      certificateNumber: "OFIA-2026-AWD-006",
      awardYear: 2026,
    },
  ],
  2025: [
    {
      id: "pub-2025-1",
      categoryName: "Employee of the Year",
      employeeName: "Amarachi Eze",
      department: "Systems & IT",
      designation: "Principal Backend Architect",
      avatarUrl: "/character3.jpg",
      citation: "Pioneered the offline-first enterprise data engine and microservices backbone.",
      certificateNumber: "OFIA-2025-AWD-001",
      awardYear: 2025,
    },
    {
      id: "pub-2025-2",
      categoryName: "Best Team Player",
      employeeName: "Fatima Al-Hassan",
      department: "NOC Central",
      designation: "Support Team Lead",
      avatarUrl: "/character4.jpg",
      citation: "Exemplary mentorship across regional depot dispatchers.",
      certificateNumber: "OFIA-2025-AWD-002",
      awardYear: 2025,
    },
  ],
};

export default function PublicAwardsDisplayPage() {
  const params = useParams();
  const tenantSlug = (params?.tenantSlug as string) || "ofia";
  const yearParam = parseInt((params?.year as string) || "2026", 10);

  const [selectedYear, setSelectedYear] = useState<number>(yearParam);
  const [winners, setWinners] = useState<PublicAwardWinner[]>(SAMPLE_PUBLIC_WINNERS[yearParam] || SAMPLE_PUBLIC_WINNERS[2026]);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Attempt live fetch from public hall-of-fame endpoint
    fetch(`/api/erp/awards/hall-of-fame?tenant=${tenantSlug}&year=${selectedYear}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.winners && Array.isArray(data.winners) && data.winners.length > 0) {
          setWinners(data.winners);
        } else {
          setWinners(SAMPLE_PUBLIC_WINNERS[selectedYear] || []);
        }
      })
      .catch(() => {
        setWinners(SAMPLE_PUBLIC_WINNERS[selectedYear] || []);
      });
  }, [tenantSlug, selectedYear]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const companyDisplayName =
    tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1) + " Enterprise";

  return (
    <div className="min-h-screen bg-[#080b11] text-white selection:bg-amber-500 selection:text-black">
      {/* Ambient background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Navigation Bar */}
      <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50 bg-[#080b11]/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-black shadow-lg shadow-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
                Annual Awards
              </div>
              <div className="text-sm font-bold text-white tracking-tight">
                {companyDisplayName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              {isCopied ? "Link Copied!" : "Share Link"}
            </button>
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20"
            >
              Employee Portal
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-10 text-center space-y-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          Official Recognition Showcase
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300">
          Celebrating Excellence
        </h1>
        <p className="text-sm sm:text-base text-white/60 max-w-2xl mx-auto leading-relaxed font-light">
          Honoring the remarkable dedication, leadership, and outstanding contributions of our colleagues who embody the highest standards of our company culture.
        </p>

        {/* Year Selector Pills */}
        <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 mt-4">
          {[2026, 2025].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedYear === yr
                  ? "bg-amber-400 text-black shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {yr} Awards
            </button>
          ))}
        </div>
      </section>

      {/* Main Winners Grid */}
      <main className="max-w-6xl mx-auto px-6 pb-24 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {winners.map((win, idx) => (
            <div
              key={win.id || idx}
              className="p-6 rounded-3xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between relative group overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                    {win.awardYear || selectedYear} Winner
                  </span>
                  <span className="text-[11px] font-mono text-white/40">
                    {win.certificateNumber}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                    {win.categoryName}
                  </h3>
                </div>

                <div className="flex items-center gap-3.5 pt-2">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400/50 shrink-0 shadow-md">
                    <img
                      src={resolveAvatarUrl(win.avatarUrl)}
                      alt={win.employeeName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{win.employeeName}</h4>
                    <div className="text-xs text-white/60">{win.department}</div>
                    <div className="text-[11px] text-amber-400 font-medium">{win.designation}</div>
                  </div>
                </div>

                <p className="text-xs text-white/70 italic border-l-2 border-amber-400/60 pl-3 leading-relaxed">
                  "{win.citation}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                <span>Certified Recipient</span>
                <span className="text-emerald-400 font-semibold">✓ Verified</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/40">
        <p>© {new Date().getFullYear()} {companyDisplayName} · Powered by Ofia ERP Enterprise Suite</p>
      </footer>
    </div>
  );
}
