"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, ChevronDown, Menu, User, Home, Grid, PlusSquare, Bell, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "./NexaButton";
import { NexaThemeToggle } from "./NexaThemeToggle";
import { NexaAvatar } from "./NexaAvatar";

export const NexaNavbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled ? "h-16 liquid-glass shadow-lg" : "h-20 bg-transparent"
      )}
    >
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <img src="/logo.png" alt="Nexa Logo" className="w-8 h-8 object-contain transition-all group-hover:scale-110" />
          <span className="text-xl font-bold text-display text-nexa-text-primary hidden sm:block">
            Nexa
          </span>
        </div>

        {/* LOCATION SELECTOR */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 liquid-glass rounded-full cursor-pointer hover:border-nexa-brand transition-all">
          <MapPin className="w-4 h-4 text-nexa-brand" />
          <span className="text-sm font-medium">Lagos, Nigeria</span>
          <ChevronDown className="w-3.5 h-3.5 text-nexa-text-faint" />
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          <NexaThemeToggle />
          <NexaButton variant="ghost" size="sm" className="hidden lg:flex">
            List a Business
          </NexaButton>
          <div className="hidden sm:flex items-center gap-3">
            <NexaButton variant="secondary" size="sm" leftIcon={<User className="w-4 h-4" />}>
              Sign In
            </NexaButton>
          </div>
          <NexaAvatar size="sm" isOnline className="sm:hidden" />
          <button className="lg:hidden p-2 text-nexa-text-primary">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export const NexaBottomBar = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { icon: <Home />, label: "Home" },
    { icon: <Compass />, label: "Discover" },
    { icon: <PlusSquare />, label: "Add" },
    { icon: <Bell />, label: "Alerts" },
    { icon: <User />, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden liquid-glass rounded-t-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.10)] px-2 pb-safe">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={cn(
              "relative flex flex-col items-center justify-center w-12 h-12 transition-colors",
              activeTab === i ? "text-nexa-brand" : "text-nexa-text-faint"
            )}
          >
            {React.cloneElement(tab.icon as React.ReactElement, {
              className: "w-6 h-6",
            })}
            {activeTab === i && (
              <motion.div
                layoutId="active-indicator"
                className="absolute -top-1 w-1 h-1 rounded-full bg-nexa-brand"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
