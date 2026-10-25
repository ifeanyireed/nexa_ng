"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export interface FeatureBannerProps {
  customBanner?: {
    enabled?: boolean;
    eyebrow?: string;
    headline?: string;
    description?: string;
    ctaLabel?: string;
    ctaHref?: string;
    image?: string;
  };
  defaultEyebrow: string;
  defaultHeadline: string;
  defaultDescription: string;
  defaultCtaLabel: string;
  defaultCtaHref: string;
  defaultImage: string;
  bgClassName?: string;
  accentTextClassName?: string;
  ctaIcon?: React.ReactNode;
  isVisible?: boolean;
}

export default function StorefrontFeatureBanner({
  customBanner,
  defaultEyebrow,
  defaultHeadline,
  defaultDescription,
  defaultCtaLabel,
  defaultCtaHref,
  defaultImage,
  bgClassName = "bg-amber-900 text-white border-amber-800",
  accentTextClassName = "text-amber-300",
  ctaIcon,
  isVisible = true,
}: FeatureBannerProps) {
  if (isVisible === false || customBanner?.enabled === false) return null;

  const eyebrow = customBanner?.eyebrow || defaultEyebrow;
  const headline = customBanner?.headline || defaultHeadline;
  const description = customBanner?.description || defaultDescription;
  const ctaLabel = customBanner?.ctaLabel || defaultCtaLabel;
  const ctaHref = customBanner?.ctaHref || defaultCtaHref;
  const image = customBanner?.image || defaultImage;

  return (
    <section className={`rounded-3xl ${bgClassName} p-8 sm:p-12 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border`}>
      <div className="max-w-xl space-y-4 z-10">
        <span className={`text-xs sm:text-sm font-bold tracking-widest ${accentTextClassName} uppercase block`}>
          {eyebrow}
        </span>
        <h3 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
          {headline}
        </h3>
        <p className="text-white/85 text-sm sm:text-base font-light leading-relaxed">
          {description}
        </p>
        <div className="pt-2">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white text-zinc-900 hover:bg-stone-100 font-bold text-sm sm:text-base transition-all shadow-md group"
          >
            <span>{ctaLabel}</span>
            {ctaIcon || <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </Link>
        </div>
      </div>

      <div className="relative w-full md:w-80 aspect-square rounded-2xl overflow-hidden border border-white/20 shadow-2xl shrink-0">
        <img
          src={image}
          alt={headline}
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
}
