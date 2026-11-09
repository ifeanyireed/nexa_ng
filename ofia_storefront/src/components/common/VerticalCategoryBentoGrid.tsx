"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SwipeToggle from "@/components/common/SwipeToggle";
import { useImageContrast, ContrastTheme } from "@/hooks/useImageContrast";

export interface CategoryCardData {
  title: string;
  count: string;
  image: string;
  images?: string[];
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

function CollectionCardSlideView({
  card,
}: {
  card: CategoryCardData;
}) {
  const images =
    Array.isArray(card.images) && card.images.length > 0
      ? card.images
      : [card.image];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto slide cover images every 3.5s if not hovered and multiple designs exist
  useEffect(() => {
    if (images.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [images.length, isHovered]);

  const activeImage = images[currentIndex] || card.image;
  const isDark = useImageContrast(activeImage, card.theme);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="lg:col-span-3 relative group rounded-[28px] lg:rounded-[32px] overflow-hidden bg-stone-200 h-full min-h-[340px] lg:min-h-0 flex flex-col justify-between p-4 sm:p-5 lg:p-4 xl:p-5 shadow-xs select-none"
    >
      {/* Sliding Images with crossfade */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {images.map((imgUrl, idx) => (
          <img
            key={idx}
            src={imgUrl}
            alt={`${card.title.replace("\n", " ")} - Design ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-in-out group-hover:scale-105 ${
              idx === currentIndex
                ? "opacity-100 scale-100 z-1"
                : "opacity-0 scale-95 z-0"
            }`}
          />
        ))}
      </div>

      {/* Adaptive Scrim Gradient Overlay for Contrast */}
      <div
        className={`absolute inset-0 pointer-events-none z-2 transition-opacity duration-300 ${
          isDark
            ? "bg-gradient-to-b from-black/55 via-black/15 to-black/45"
            : "bg-gradient-to-b from-black/20 via-transparent to-black/20"
        }`}
      />

      {/* Top Header: Title & Count + Slide Indicator Dots */}
      <div className="relative z-10 transition-colors duration-300 flex items-start justify-between">
        <div>
          <h3
            className={`font-semibold text-base sm:text-lg xl:text-xl tracking-tight leading-snug whitespace-pre-line max-w-[130px] sm:max-w-[160px] transition-colors duration-300 ${
              isDark
                ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                : "text-zinc-950"
            }`}
          >
            {card.title}
          </h3>
          <p
            className={`text-xs font-medium mt-0.5 transition-colors duration-300 ${
              isDark
                ? "text-white/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                : "text-stone-600"
            }`}
          >
            {card.count}
          </p>
        </div>

        {/* Multi-design slide indicators */}
        {images.length > 1 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/35 backdrop-blur-md border border-white/20">
            {images.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(dotIdx);
                }}
                className={`transition-all rounded-full ${
                  dotIdx === currentIndex
                    ? "w-3 h-1.5 bg-white shadow-xs"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                }`}
                title={`Design ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Manual Slide Arrows (shown on hover if >1 image) */}
      {images.length > 1 && (
        <div className="absolute inset-y-0 inset-x-2 z-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
            }}
            className="pointer-events-auto w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs text-xs font-bold transition"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % images.length);
            }}
            className="pointer-events-auto w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs text-xs font-bold transition"
          >
            ›
          </button>
        </div>
      )}

      {/* Bottom-Center Frosted Glass Swipe Toggle */}
      <div className="relative z-10 flex justify-center w-full">
        <SwipeToggle href={card.href} label="View All" />
      </div>
    </div>
  );
}

export default function VerticalCategoryBentoGrid({
  card1,
  card2,
  card3,
}: VerticalCategoryBentoGridProps) {
  const isCard3Dark = useImageContrast(card3.backgroundImage, card3.theme);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-4 w-full h-full items-stretch">
      {/* Card 1: Featured Collection 1 (Sliding Cover Images) */}
      <CollectionCardSlideView card={card1} />

      {/* Card 2: Featured Collection 2 (Sliding Cover Images) */}
      <CollectionCardSlideView card={card2} />

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
