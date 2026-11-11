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

export default function PublicAwardsDisplayPage() {
  const params = useParams();
  const tenantSlug = (params?.tenantSlug as string) || "ofia";
  const yearParam = parseInt((params?.year as string) || String(new Date().getFullYear()), 10);

  const [selectedYear, setSelectedYear] = useState<number>(yearParam);
  const [winners, setWinners] = useState<PublicAwardWinner[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/erp/awards/hall-of-fame?tenant=${encodeURIComponent(tenantSlug)}&year=${selectedYear}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.winners && Array.isArray(data.winners)) {
          setWinners(data.winners);
        } else {
          setWinners([]);
        }
      })
      .catch(() => {
        setWinners([]);
      })
      .finally(() => {
        setIsLoading(false);
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
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer"
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
          Honoring the remarkable dedication, leadership, and outstanding contributions of colleagues who embody the highest standards of our culture.
        </p>

        {/* Year Selector Pills */}
        <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 mt-4">
          {[new Date().getFullYear(), new Date().getFullYear() - 1].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
        {isLoading ? (
          <div className="py-16 text-center text-white/50 text-xs font-medium">
            Loading official published winners...
          </div>
        ) : winners.length === 0 ? (
          <div className="p-12 rounded-3xl border border-white/10 bg-white/[0.02] text-center max-w-md mx-auto space-y-3">
            <Trophy className="w-10 h-10 text-amber-400 opacity-60 mx-auto" />
            <h3 className="text-base font-bold text-white">No Certified Awards Published Yet</h3>
            <p className="text-xs text-white/50">
              Official award winners for {selectedYear} will be certified and showcased here once voting and finalization conclude.
            </p>
          </div>
        ) : (
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

                  {win.citation && (
                    <p className="text-xs text-white/70 italic border-l-2 border-amber-400/60 pl-3 leading-relaxed">
                      "{win.citation}"
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                  <span>Certified Recipient</span>
                  <span className="text-emerald-400 font-semibold">✓ Verified</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/40">
        <p>© {new Date().getFullYear()} {companyDisplayName} · Powered by Ofia ERP Enterprise Suite</p>
      </footer>
    </div>
  );
}
