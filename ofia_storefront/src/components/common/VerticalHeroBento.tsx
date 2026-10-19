"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface VerticalHeroBentoProps {
  eyebrow: string;
  headline: string;
  highlightText?: string;
  description?: string;
  ctaLabel: string;
  ctaHref: string;
  footnote: string;
  image: string;
  imageAlt?: string;
  badge?: string;
  bgColor?: string;
}

export default function VerticalHeroBento({
  eyebrow,
  headline,
  highlightText,
  description,
  ctaLabel,
  ctaHref,
  footnote,
  image,
  imageAlt = "Hero Visual",
  badge,
  bgColor = "#FAF9F5",
}: VerticalHeroBentoProps) {
  return (
    <div
      className="relative w-full rounded-[28px] lg:rounded-[32px] overflow-hidden flex flex-col md:flex-row h-full min-h-[380px] lg:min-h-0 shadow-xs"
      style={{ backgroundColor: bgColor }}
    >
      {/* Left Column: Text, Pill CTA, Footnote */}
      <div className="w-full md:w-[48%] lg:w-[45%] p-5 sm:p-6 lg:p-5 xl:p-7 z-20 flex flex-col justify-between shrink-0 h-full">
        <div className="space-y-2 lg:space-y-3">
          {/* Eyebrow & Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium tracking-wide text-stone-500">
              {eyebrow}
            </span>
            {badge && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-500/15 text-amber-900 border border-amber-500/25">
                {badge}
              </span>
            )}
          </div>

          {/* Large Bold Display Headline */}
          <h1 className="font-dropa text-2xl sm:text-4xl lg:text-3xl xl:text-4xl 2xl:text-[46px] font-bold text-zinc-950 tracking-tight leading-[1.08] whitespace-pre-line max-w-sm sm:max-w-md">
            {headline}
            {highlightText && (
              <>
                {" "}
                <span className="text-stone-500 font-light block">
                  {highlightText}
                </span>
              </>
            )}
          </h1>

          {description && (
            <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed max-w-md line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* CTA & Footnote */}
        <div className="space-y-2 lg:space-y-3 pt-2">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#111318] hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm tracking-tight shadow-md hover:scale-[1.02] active:scale-98 transition-all cursor-pointer self-start"
          >
            <span>{ctaLabel}</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-stone-500 font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="truncate">{footnote}</span>
          </div>
        </div>
      </div>

      {/* Right Column: Hero Image with Angled Transparency Gradient Mask */}
      <div className="relative md:absolute md:right-0 md:top-0 md:bottom-0 w-full md:w-[58%] lg:w-[62%] xl:w-[65%] h-64 md:h-full overflow-hidden z-10 pointer-events-none">
        <img
          src={image}
          alt={imageAlt}
          className="w-full h-full object-cover object-center hero-image-fade-mask"
        />
        {/* Soft atmospheric wash ensuring zero contrast clashes */}
        <div
          className="hidden md:block absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(112deg, ${bgColor} 0%, ${bgColor} 6%, ${bgColor}cc 18%, ${bgColor}4d 28%, transparent 42%)`,
          }}
        />
        {/* Mobile top-to-bottom subtle blend */}
        <div
          className="md:hidden absolute inset-x-0 top-0 h-16 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, ${bgColor}, transparent)`,
          }}
        />
      </div>
    </div>
  );
}
