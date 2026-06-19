"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronDown, Check, Search, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, CITIES } from "./LocationContext";

export function LocationDropdown({ className, buttonClassName }: { className?: string; buttonClassName?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { currentCity, setCurrentCity } = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCities = CITIES.filter((city) =>
    city.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAutoDetect = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // In a real app, we would reverse geocode these coordinates.
          // For now, we'll just show a toast or message.
          console.log("Location detected:", position.coords);
          // Simulate detection for demo
          alert("Auto-detection successful! Your location has been set to the nearest hub.");
        },
        (error) => {
          console.error("Error detecting location", error);
          alert("Please enable location services to use auto-detection.");
        }
      );
    }
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 liquid-glass rounded-full hover:border-nexa-brand transition-all",
          buttonClassName
        )}
      >
        <MapPin className="w-4 h-4 text-nexa-brand" />
        <span className="text-sm font-medium">{currentCity.name}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-current opacity-60 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 left-0 w-64 bg-nexa-bg-base border border-nexa-border rounded-2xl shadow-2xl z-[500] overflow-hidden"
          >
            <div className="p-3 border-b border-nexa-border">
              <div className="relative flex items-center bg-nexa-bg-surface rounded-xl px-3 h-10 border border-nexa-border">
                <Search className="w-4 h-4 text-nexa-text-faint" />
                <input
                  type="text"
                  placeholder="Search city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none outline-none w-full px-2 text-xs font-medium"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto p-2 no-scrollbar">
              <button
                onClick={handleAutoDetect}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-nexa-brand/10 text-nexa-brand transition-colors text-left mb-1"
              >
                <Navigation className="w-4 h-4" />
                <span className="text-xs font-extrabold uppercase tracking-wider">Detect Location</span>
              </button>

              <div className="h-px bg-nexa-border my-1 mx-2" />

              {filteredCities.map((city) => (
                <button
                  key={city.slug}
                  onClick={() => {
                    setCurrentCity(city);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-left",
                    currentCity.slug === city.slug ? "bg-nexa-bg-surface text-nexa-brand" : "hover:bg-nexa-bg-surface"
                  )}
                >
                  <span className="text-sm font-bold">{city.name}</span>
                  {currentCity.slug === city.slug && <Check className="w-4 h-4" />}
                </button>
              ))}

              {filteredCities.length === 0 && (
                <div className="p-4 text-center text-xs text-nexa-text-faint italic">
                  No cities found matching your search.
                </div>
              )}
            </div>

            <div className="p-3 bg-nexa-bg-surface border-t border-nexa-border">
              <p className="text-[10px] text-nexa-text-faint font-bold text-center uppercase tracking-widest">
                More cities coming soon
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
