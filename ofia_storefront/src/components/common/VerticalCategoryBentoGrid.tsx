"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SwipeToggle from "@/components/common/SwipeToggle";
import { useImageContrast, ContrastTheme } from "@/hooks/useImageContrast";

export interface CategoryCardData {
  title: string;
  count: string;
  image: string;
  href: string;
  theme?: ContrastTheme;
}

export interface FloatingPillItem {
  label: string;
  count: string;
  image: string;
  href: string;
}

export interface VerticalCategoryBentoGridProps {
  card1: CategoryCardData;
  card2: CategoryCardData;
  card3: {
    title?: string;
    href: string;
    backgroundImage: string;
    pills: FloatingPillItem[];
    theme?: ContrastTheme;
  };
}

export default function VerticalCategoryBentoGrid({
  card1,
  card2,
  card3,
}: VerticalCategoryBentoGridProps) {
  const isCard1Dark = useImageContrast(card1.image, card1.theme);
  const isCard2Dark = useImageContrast(card2.image, card2.theme);
  const isCard3Dark = useImageContrast(card3.backgroundImage, card3.theme);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-4 w-full h-full items-stretch">
      {/* Card 1: Portrait Category - Covers 25% of width on lg (first 2 cards together cover 50%) */}
      <div className="lg:col-span-3 relative group rounded-[28px] lg:rounded-[32px] overflow-hidden bg-stone-200 h-full min-h-[340px] lg:min-h-0 flex flex-col justify-between p-4 sm:p-5 lg:p-4 xl:p-5 shadow-xs">
        {/* Background Image fills the card completely edge-to-edge */}
        <img
          src={card1.image}
          alt={card1.title.replace("\n", " ")}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        {/* Adaptive Scrim Gradient Overlay for Contrast */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
            isCard1Dark
              ? "bg-gradient-to-b from-black/50 via-black/10 to-black/35"
              : "bg-gradient-to-b from-black/15 via-transparent to-black/15"
          }`}
        />

        {/* Top-Left Header: Contrast-Sensitive Typography */}
        <div className="relative z-10 transition-colors duration-300">
          <h3
            className={`font-semibold text-base sm:text-lg xl:text-xl tracking-tight leading-snug whitespace-pre-line max-w-[130px] sm:max-w-[160px] transition-colors duration-300 ${
              isCard1Dark
                ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                : "text-zinc-950"
            }`}
          >
            {card1.title}
          </h3>
          <p
            className={`text-xs font-medium mt-0.5 transition-colors duration-300 ${
              isCard1Dark
                ? "text-white/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                : "text-stone-600"
            }`}
          >
            {card1.count}
          </p>
        </div>

        {/* Bottom-Center Frosted Glass Swipe Toggle */}
        <div className="relative z-10 flex justify-center w-full">
          <SwipeToggle href={card1.href} label="View All" />
        </div>
      </div>

      {/* Card 2: Portrait Category - Covers 25% of width on lg (first 2 cards together cover 50%) */}
      <div className="lg:col-span-3 relative group rounded-[28px] lg:rounded-[32px] overflow-hidden bg-stone-200 h-full min-h-[340px] lg:min-h-0 flex flex-col justify-between p-4 sm:p-5 lg:p-4 xl:p-5 shadow-xs">
        {/* Background Image fills the card completely edge-to-edge */}
        <img
          src={card2.image}
          alt={card2.title.replace("\n", " ")}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        {/* Adaptive Scrim Gradient Overlay for Contrast */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
            isCard2Dark
              ? "bg-gradient-to-b from-black/50 via-black/10 to-black/35"
              : "bg-gradient-to-b from-black/15 via-transparent to-black/15"
          }`}
        />

        {/* Top-Left Header: Contrast-Sensitive Typography */}
        <div className="relative z-10 transition-colors duration-300">
          <h3
            className={`font-semibold text-base sm:text-lg xl:text-xl tracking-tight leading-snug whitespace-pre-line max-w-[130px] sm:max-w-[160px] transition-colors duration-300 ${
              isCard2Dark
                ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                : "text-zinc-950"
            }`}
          >
            {card2.title}
          </h3>
          <p
            className={`text-xs font-medium mt-0.5 transition-colors duration-300 ${
              isCard2Dark
                ? "text-white/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                : "text-stone-600"
            }`}
          >
            {card2.count}
          </p>
        </div>

        {/* Bottom-Center Frosted Glass Swipe Toggle matching moodboard */}
        <div className="relative z-10 flex justify-center w-full">
          <SwipeToggle href={card2.href} label="View All" />
        </div>
      </div>

      {/* Card 3: Wide Curated "Top Collation" - Alone covers 50% of width on lg */}
      <div className="md:col-span-2 lg:col-span-6 relative group rounded-[28px] lg:rounded-[32px] overflow-hidden bg-stone-200 h-full min-h-[340px] lg:min-h-0 flex flex-col justify-between p-4 sm:p-5 lg:p-4 xl:p-5 shadow-xs">
        {/* Background Image fills the card completely edge-to-edge */}
        <img
          src={card3.backgroundImage}
          alt="Top Collation"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        {/* Adaptive Scrim Gradient Overlay for Contrast */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
            isCard3Dark
              ? "bg-gradient-to-b from-black/50 via-black/10 to-black/35"
              : "bg-black/15"
          }`}
        />

        {/* Top Header & Arrow matching moodboard */}
        <div className="relative z-10 flex items-center justify-between">
          <h3
            className={`font-semibold text-base sm:text-lg xl:text-xl tracking-tight transition-colors duration-300 ${
              isCard3Dark
                ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                : "text-zinc-950"
            }`}
          >
            {card3.title || "Top Collation"}
          </h3>
          <Link
            href={card3.href}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-zinc-950 backdrop-blur-md shadow-md flex items-center justify-center transition-all hover:scale-110"
            title="Browse All Collections"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Floating Pills matching moodboard (Clothe's, Shoe's, Bag's) */}
        <div className="relative z-10 flex flex-wrap gap-2 sm:gap-2.5 items-end justify-start pt-3">
          {card3.pills.map((pill, idx) => (
            <Link
              key={idx}
              href={pill.href}
              className="group/pill inline-flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-white/80 shadow-md transition-all hover:scale-105"
            >
              <img
                src={pill.image}
                alt={pill.label}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-stone-200 shrink-0"
              />
              <div className="text-left">
                <span className="block text-xs font-bold text-zinc-950 leading-tight group-hover/pill:text-blue-600 transition-colors">
                  {pill.label}
                </span>
                <span className="block text-[10px] text-stone-500 font-medium">
                  {pill.count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
