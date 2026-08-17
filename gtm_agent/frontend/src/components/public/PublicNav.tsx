"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useTheme } from "@/components/nexa/ThemeProvider";
import {
  Sun,
  Moon,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Layers,
  DollarSign,
  Info,
  Phone,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandLinkedin,
} from "@tabler/icons-react";

export const PublicNav: React.FC = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Swarm Features", href: "/#features" },
    { label: "Live Agents", href: "/#agents" },
    { label: "Pricing & Tiers", href: "/pricing" },
    { label: "About Mission", href: "/about" },
    { label: "Contact Sales", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[var(--nexa-bg-surface)]/85 border-b border-[var(--nexa-border)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Ofia AI Logo"
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-[var(--nexa-text-primary)] text-display tracking-tight">
                  Ofia AI
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1A56DB]/10 text-[#1A56DB] dark:bg-[#1A56DB]/20 border border-[#1A56DB]/30">
                  Swarm v2.6
                </span>
              </div>
              <span className="text-[10px] font-mono text-[var(--nexa-text-muted)] tracking-wider">
                Autonomous Business Navigation
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "text-[#1A56DB] bg-[#1A56DB]/10 font-bold"
                      : "text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-base)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="w-9 h-9 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] hover:bg-[var(--nexa-border)]/50 text-[var(--nexa-text-secondary)] flex items-center justify-center transition-all cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-[#E3A008]" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            <Link href="/login">
              <NexaButton size="sm" variant="ghost" className="font-bold text-xs">
                Sign In
              </NexaButton>
            </Link>

            <Link href="/signup">
              <NexaButton
                size="sm"
                variant="primary"
                className="font-extrabold text-xs shadow-md shadow-[#1A56DB]/20"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Deploy Swarm Free
              </NexaButton>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="w-9 h-9 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] flex items-center justify-center"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-[#E3A008]" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] px-4 py-6 space-y-4 animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-2">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-base)]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-[var(--nexa-border)] flex flex-col gap-2.5">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <NexaButton size="md" variant="secondary" className="w-full font-bold">
                Client / Team Sign In
              </NexaButton>
            </Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
              <NexaButton size="md" variant="primary" className="w-full font-extrabold" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start 14-Day Free Trial
              </NexaButton>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
