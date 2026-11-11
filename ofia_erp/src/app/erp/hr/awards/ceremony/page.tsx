"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAwardsStore } from "@/lib/awards-store";
import { resolveAvatarUrl } from "@/lib/avatar";
import {
  Trophy,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Tv,
  ArrowLeft,
  Eye,
  CheckCircle2,
  Crown,
} from "lucide-react";

export default function AwardsCeremonyPage() {
  const router = useRouter();
  const { activeEvent, hallOfFame } = useAwardsStore();

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const categories = activeEvent?.categories || [];
  const currentCategory = categories[currentCategoryIndex];
  // Determine winner for current category: default to rank 1 nominee or hall of fame winner
  const winnerNominee = currentCategory?.nominees?.[0];

  const handleNext = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex((prev) => prev + 1);
      setIsRevealed(false);
    }
  };

  const handlePrev = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((prev) => prev - 1);
      setIsRevealed(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === " " || e.key === "Enter") {
        setIsRevealed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentCategoryIndex, categories.length]);

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-between p-6 md:p-12 relative overflow-hidden select-none">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header / Presenter Navigation */}
      <header className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/erp/hr/awards"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-xs font-medium border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit Stage
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wider uppercase">
            <Tv className="w-3.5 h-3.5" />
            Live Ceremony Stage Mode
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs uppercase tracking-widest text-white/50">Event Year</div>
            <div className="text-sm font-bold text-amber-400">{activeEvent?.awardYear || 2026} Celebration</div>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Central Announcement Showcase */}
      {categories.length === 0 ? (
        <main className="my-auto py-8 flex flex-col items-center justify-center text-center z-10 max-w-xl mx-auto space-y-4">
          <Trophy className="w-16 h-16 text-amber-400 opacity-60 mx-auto" />
          <h2 className="text-2xl font-bold text-white">No Ceremony Categories Yet</h2>
          <p className="text-xs text-white/60">
            Define categories and add nominees in the Awards Hub before launching the live ceremony stage.
          </p>
          <Link
            href="/erp/hr/awards"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-lg"
          >
            Configure Awards Hub
          </Link>
        </main>
      ) : (
        <main className="my-auto py-8 flex flex-col items-center justify-center text-center z-10 max-w-4xl mx-auto space-y-6">
          {/* Category Number Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-300 text-xs font-semibold tracking-widest uppercase">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            Category {currentCategoryIndex + 1} of {categories.length}
          </div>

          {/* Category Title */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
              {currentCategory?.name || "Recognition Category"}
            </h1>
            <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto font-light">
              {currentCategory?.criteria || currentCategory?.description}
            </p>
          </div>

          {/* Winner Card / Reveal Section */}
          <div className="w-full max-w-xl mt-4">
            {!isRevealed ? (
              /* Sealed Envelope / Teaser State */
              <div
                onClick={() => setIsRevealed(true)}
                className="p-10 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-amber-500/30 backdrop-blur-md shadow-2xl cursor-pointer hover:border-amber-400/60 transition-all transform hover:scale-[1.02] group"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 group-hover:rotate-6 transition-transform">
                  <Trophy className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white mb-2">
                  Winner Sealed in Vault
                </h3>
                <p className="text-xs text-white/60 mb-6">
                  Press Spacebar or Click anywhere to unveil the official winner
                </p>
                <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25">
                  Reveal Winner
                </button>
              </div>
            ) : (
              /* Unveiled Winner Reveal */
              <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-amber-500/20 via-white/5 to-white/5 border-2 border-amber-400/80 backdrop-blur-lg shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="relative inline-block mb-4">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-4 border-amber-400 shadow-2xl mx-auto">
                    <img
                      src={resolveAvatarUrl(winnerNominee?.avatarUrl)}
                      alt={winnerNominee?.employeeName || "Winner"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black flex items-center justify-center font-black shadow-lg">
                    🏆
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-amber-400">
                    {activeEvent?.awardYear || 2026} Official Winner
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white">
                    {winnerNominee?.employeeName || "Nominee Name"}
                  </h2>
                  <div className="text-sm font-medium text-white/80">
                    {winnerNominee?.department} • {winnerNominee?.designation}
                  </div>
                </div>

                {winnerNominee?.nominationPitch && (
                  <p className="text-xs sm:text-sm text-white/70 italic border-l-2 border-amber-400/60 pl-3 max-w-lg mx-auto text-left mb-6">
                    "{winnerNominee.nominationPitch}"
                  </p>
                )}

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Winner Confirmed & Certified
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* Bottom Stage Progression Controls */}
      <footer className="flex items-center justify-between z-10 border-t border-white/10 pt-4">
        <button
          onClick={handlePrev}
          disabled={currentCategoryIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 text-xs font-semibold tracking-wider uppercase transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Category
        </button>

        <div className="flex items-center gap-1.5">
          {categories.map((_, idx) => (
            <div
              key={idx}
              onClick={() => {
                setCurrentCategoryIndex(idx);
                setIsRevealed(false);
              }}
              className={`h-2 rounded-full cursor-pointer transition-all ${
                idx === currentCategoryIndex
                  ? "w-8 bg-amber-400"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentCategoryIndex === categories.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 text-xs font-semibold tracking-wider uppercase transition-colors"
        >
          Next Category
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}
