"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Home as HomeIcon,
  Tag,
  Search,
  Check,
} from "lucide-react";

export default function Hero() {
  const [location, setLocation] = useState("New York");
  const [propertyType, setPropertyType] = useState("Modern House");
  const [budget, setBudget] = useState("$2M");

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const locations = [
    "New York",
    "Lekki Peninsula, Lagos",
    "Ikoyi, Lagos",
    "Malibu, CA",
    "Dubai Marina, UAE",
  ];

  const propertyTypes = [
    "Modern House",
    "Beachfront Villa",
    "Luxury Penthouse",
    "Serviced Apartment",
  ];

  const budgetRanges = [
    "$1.5M",
    "$2M",
    "$3.5M",
    "$5M+",
  ];

  const toggleDropdown = (key: string) => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-12">
      {/* Centered Hero Headline & Typography */}
      <div className="max-w-4xl mx-auto text-center mb-6 sm:mb-8">
        <h1 className="font-dropa text-3xl sm:text-5xl md:text-[58px] lg:text-[66px] font-normal text-[#111318] tracking-tight leading-[1.12]">
          <span>Luxury </span>
          <span className="font-cormorant italic text-[#0069ff] font-normal tracking-wide">
            Living
          </span>
          <span> Designed Around</span>
          <br className="hidden sm:inline" />
          <span className="inline-flex items-center flex-wrap justify-center gap-2 sm:gap-3 mt-1 sm:mt-1">
            {/* Inline architectural house badge */}
            <span className="inline-block relative h-8 sm:h-11 w-14 sm:w-20 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm align-middle -translate-y-0.5 sm:-translate-y-1 hover:scale-105 transition-transform duration-300">
              <Image
                src="https://res.cloudinary.com/ihfqdysu/image/upload/v1790686502/ofia_ng_assets/usto1bnehtvsvyzwylav.png"
                alt="Architectural Villa"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 56px, 80px"
              />
            </span>

            <span>Your Lifestyle</span>

            {/* Overlapping client social proof badge */}
            <span className="inline-block relative h-6 sm:h-9 w-20 sm:w-28 rounded-full overflow-hidden align-middle -translate-y-0.5 sm:-translate-y-1 ml-0.5 sm:ml-1">
              <Image
                src="https://res.cloudinary.com/ihfqdysu/image/upload/v1790686502/ofia_ng_assets/agcjipf9ork4gixb7fib.png"
                alt="50k+ Trusted Clients"
                fill
                className="object-contain"
                sizes="(max-width: 640px) 80px, 112px"
              />
            </span>
          </span>
        </h1>

        {/* Subtitle / Lede */}
        <p className="max-w-xl mx-auto text-stone-500 text-xs sm:text-sm md:text-base mt-3 sm:mt-4 font-normal leading-relaxed">
          Discover premium residences, modern architecture, and curated living spaces
          crafted for comfort, prestige, and long-term value.
        </p>
      </div>

      {/* Main Architectural Hero Visual & Floating Filter Card */}
      <div className="relative w-full rounded-2xl sm:rounded-[32px] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.14)] border border-stone-200/60 h-[480px] sm:h-[540px] md:h-[580px]">
        {/* Background Image: Coastal Dunes Luxury Residences */}
        <Image
          src="https://res.cloudinary.com/ihfqdysu/image/upload/v1790686504/ofia_ng_assets/wuuq3envwns5v2hbkjr3.jpg"
          alt="Coastal Modern Residences and Villas"
          fill
          priority
          className="object-cover object-[50%_35%] transition-transform duration-1000 scale-[1.01] hover:scale-105"
          sizes="(max-width: 1280px) 100vw, 1280px"
        />

        {/* Subtle Atmospheric Gradient Overlay on Left */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent md:bg-gradient-to-r md:from-black/55 md:via-black/15 md:to-transparent pointer-events-none" />

        {/* Floating Glassmorphism Search & Filter Card */}
        <div className="absolute left-4 sm:left-8 md:left-10 bottom-4 sm:bottom-6 md:bottom-8 z-20 w-[calc(100%-2rem)] sm:w-[320px] md:w-[350px]">
          <div className="glass-filter-card rounded-2xl sm:rounded-[24px] p-4 sm:p-5 text-white space-y-2.5 sm:space-y-3">
            
            {/* Field 1: Location */}
            <div className="relative">
              <label className="text-[10px] sm:text-[11px] font-medium text-white/60 mb-1 block">
                Location
              </label>
              <div
                onClick={() => toggleDropdown("location")}
                className="bg-white/[0.08] hover:bg-white/[0.13] border border-white/15 rounded-xl sm:rounded-2xl px-3.5 py-2 sm:py-2.5 flex items-center justify-between cursor-pointer transition-all duration-200 group"
              >
                <span className="text-xs sm:text-sm font-medium text-white truncate">
                  {location}
                </span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 flex items-center justify-center text-white/80 group-hover:text-white group-hover:bg-[#0069ff] transition-all">
                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>

              {/* Location Dropdown */}
              {activeDropdown === "location" && (
                <div className="absolute left-0 right-0 bottom-full mb-2 bg-[#17181F]/95 backdrop-blur-xl border border-white/20 rounded-xl p-1.5 shadow-2xl z-30 space-y-0.5">
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setLocation(loc);
                        setActiveDropdown(null);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-200 hover:text-white hover:bg-[#0069ff]/20 text-left transition-colors"
                    >
                      <span>{loc}</span>
                      {location === loc && (
                        <Check className="w-3 h-3 text-[#0069ff]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Field 2: Property Type */}
            <div className="relative">
              <label className="text-[10px] sm:text-[11px] font-medium text-white/60 mb-1 block">
                Property Type
              </label>
              <div
                onClick={() => toggleDropdown("propertyType")}
                className="bg-white/[0.08] hover:bg-white/[0.13] border border-white/15 rounded-xl sm:rounded-2xl px-3.5 py-2 sm:py-2.5 flex items-center justify-between cursor-pointer transition-all duration-200 group"
              >
                <span className="text-xs sm:text-sm font-medium text-white truncate">
                  {propertyType}
                </span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 flex items-center justify-center text-white/80 group-hover:text-white group-hover:bg-[#0069ff] transition-all">
                  <HomeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>

              {/* Property Type Dropdown */}
              {activeDropdown === "propertyType" && (
                <div className="absolute left-0 right-0 bottom-full mb-2 bg-[#17181F]/95 backdrop-blur-xl border border-white/20 rounded-xl p-1.5 shadow-2xl z-30 space-y-0.5">
                  {propertyTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setPropertyType(type);
                        setActiveDropdown(null);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-200 hover:text-white hover:bg-[#0069ff]/20 text-left transition-colors"
                    >
                      <span>{type}</span>
                      {propertyType === type && (
                        <Check className="w-3 h-3 text-[#0069ff]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Field 3: Budget Range */}
            <div className="relative">
              <label className="text-[10px] sm:text-[11px] font-medium text-white/60 mb-1 block">
                Budget Range
              </label>
              <div
                onClick={() => toggleDropdown("budget")}
                className="bg-white/[0.08] hover:bg-white/[0.13] border border-white/15 rounded-xl sm:rounded-2xl px-3.5 py-2 sm:py-2.5 flex items-center justify-between cursor-pointer transition-all duration-200 group"
              >
                <span className="text-xs sm:text-sm font-medium text-white truncate">
                  {budget}
                </span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 flex items-center justify-center text-white/80 group-hover:text-white group-hover:bg-[#0069ff] transition-all">
                  <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>

              {/* Budget Dropdown */}
              {activeDropdown === "budget" && (
                <div className="absolute left-0 right-0 bottom-full mb-2 bg-[#17181F]/95 backdrop-blur-xl border border-white/20 rounded-xl p-1.5 shadow-2xl z-30 space-y-0.5">
                  {budgetRanges.map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        setBudget(b);
                        setActiveDropdown(null);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-200 hover:text-white hover:bg-[#0069ff]/20 text-left transition-colors"
                    >
                      <span>{b}</span>
                      {budget === b && (
                        <Check className="w-3 h-3 text-[#0069ff]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Primary Action Button with Electric Blue #0069ff */}
            <button className="w-full bg-[#0069ff] hover:bg-[#0056d6] active:scale-[0.98] text-white font-medium py-3 px-5 rounded-full text-center transition-all duration-200 shadow-[0_8px_22px_rgba(0,105,255,0.45)] hover:shadow-[0_10px_28px_rgba(0,105,255,0.6)] flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer mt-1">
              <span>Budget Range</span>
            </button>
          </div>
        </div>

        {/* Floating Property Tag on Top-Right */}
        <div className="hidden sm:flex absolute right-6 sm:right-8 top-6 sm:top-8 z-20 items-center gap-2 bg-black/40 backdrop-blur-md border border-white/15 rounded-full py-1.5 px-3.5 text-white text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-[#0069ff] animate-pulse" />
          <span>Coastal Dune Residences · Limited Units</span>
        </div>
      </div>
    </section>
  );
}
