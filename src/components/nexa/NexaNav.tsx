"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, ChevronDown, Menu, User, Home, Grid, PlusSquare, Bell, Compass, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { NexaButton } from "./NexaButton";
import { NexaThemeToggle } from "./NexaThemeToggle";
import { NexaAvatar } from "./NexaAvatar";
import { NexaModeToggle } from "./NexaModeToggle";
import { useNiche } from "./NicheContext";
import { NicheSwitcher } from "./NicheSwitcher";

export const NexaNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const { mode, setMode } = useNiche();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          scrolled ? "h-16 liquid-glass shadow-lg" : "h-20 bg-transparent"
        )}
      >
        <div className="container mx-auto h-full px-4 flex items-center justify-between">
          {/* LOGO & NICHE SWITCHER */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 cursor-pointer group">
              <img src="/logo.png" alt="Nexa Logo" className="w-8 h-8 object-contain transition-all group-hover:scale-110" />
              <span className="text-xl font-bold text-display text-nexa-text-primary hidden sm:block">
                Nexa
              </span>
            </Link>
            
            <button 
              onClick={() => setIsSwitcherOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-nexa-bg-glass transition-colors group"
            >
              <LayoutGrid className="w-4 h-4 text-nexa-text-faint group-hover:text-nexa-brand transition-colors" />
              <span className="text-sm font-bold text-nexa-text-secondary">Explore Niches</span>
            </button>
          </div>

          {/* MODE TOGGLE - DESKTOP */}
          <div className="hidden lg:block">
            <NexaModeToggle mode={mode} onChange={setMode} />
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 liquid-glass rounded-full cursor-pointer hover:border-nexa-brand transition-all mr-2">
              <MapPin className="w-4 h-4 text-nexa-brand" />
              <span className="text-sm font-medium">Lagos</span>
              <ChevronDown className="w-3.5 h-3.5 text-nexa-text-faint" />
            </div>
            
            <NexaThemeToggle />
            <div className="hidden sm:flex items-center gap-3">
              {mode === "seller" ? (
                <Link href="/dashboard">
                  <NexaButton size="sm" leftIcon={<Grid className="w-4 h-4" />}>
                    Dashboard
                  </NexaButton>
                </Link>
              ) : (
                <Link href="/join">
                  <NexaButton variant="ghost" size="sm" className="text-nexa-text-secondary">
                    List Business
                  </NexaButton>
                </Link>
              )}
              <Link href="/login">
                <NexaButton variant="secondary" size="sm" leftIcon={<User className="w-4 h-4" />}>
                  Sign In
                </NexaButton>
              </Link>
            </div>
            <NexaAvatar size="sm" isOnline className="sm:hidden" />
            <button className="lg:hidden p-2 text-nexa-text-primary">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <NicheSwitcher isOpen={isSwitcherOpen} onClose={() => setIsSwitcherOpen(false)} />
    </>
  );
};

export const NexaBottomBar = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { mode, setMode } = useNiche();

  const tabs = [
    { icon: <Home />, label: "Home", href: "/" },
    { icon: <Compass />, label: "Discover", href: "/categories" },
    { icon: <PlusSquare />, label: "Join", href: "/join" },
    { icon: <Bell />, label: "Alerts", href: "/account?tab=settings" },
    { icon: <User />, label: "Account", href: "/account" },
  ];

  return (
    <>
      {/* FLOATING MODE TOGGLE - MOBILE */}
      <div className="fixed bottom-24 right-4 z-40 lg:hidden">
        <NexaModeToggle mode={mode} onChange={setMode} className="shadow-2xl scale-90 origin-right" />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden liquid-glass rounded-t-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.10)] px-2 pb-safe">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab, i) => (
            <Link key={i} href={tab.href}>
              <button
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
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};
