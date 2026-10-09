"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NexaButton } from "./NexaButton";
import { NexaBadge } from "./NexaBadge";
import { Menu, X, ArrowRight, Compass, ShieldCheck, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide top navigation bar on single blog post pages (e.g. /blog/[slug])
  const isSinglePostPage = Boolean(
    pathname && pathname.startsWith("/blog/") && pathname !== "/blog" && pathname !== "/blog/"
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isSinglePostPage) {
    return null;
  }

  const navLinks = [
    { label: "Products", href: "/products" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "h-16 liquid-glass shadow-sm bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border-b border-nexa-border"
            : "h-20 bg-transparent border-b border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* LOGO */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm flex items-center justify-center transition-transform group-hover:scale-105">
                <img
                  src="https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png"
                  alt="Ofia Ecosystem Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-display text-[var(--nexa-text-primary)]">
                Ofia
              </span>
              <NexaBadge variant="brand" size="sm" dot className="hidden sm:inline-flex">
                OS v1.0
              </NexaBadge>
            </Link>
          </div>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-1 bg-[var(--nexa-bg-surface)]/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-[var(--nexa-border)] shadow-xs">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-nexa-brand text-white shadow-xs"
                      : "text-nexa-text-secondary hover:text-nexa-brand hover:bg-nexa-brand-light"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="h-4 w-[1px] bg-[var(--nexa-border)] mx-1" />

            <a
              href="https://ofia.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-nexa-text-secondary hover:text-nexa-brand transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-nexa-brand" />
              <span>Compass</span>
            </a>
          </nav>

          {/* RIGHT ACTION BUTTONS */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/pricing"
              className="text-xs font-bold uppercase tracking-wider text-nexa-text-secondary hover:text-nexa-brand px-3 py-2 transition-colors"
            >
              Founding Offer
            </Link>
            <Link href="/pricing">
              <NexaButton size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Get Started
              </NexaButton>
            </Link>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-nexa-text-secondary hover:bg-nexa-bg-surface transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-[var(--nexa-bg-surface)] border-b border-[var(--nexa-border)] shadow-xl p-6 md:hidden"
          >
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl font-bold text-base text-nexa-text-primary hover:bg-nexa-brand-light hover:text-nexa-brand transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-[1px] bg-[var(--nexa-border)] my-2" />
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full"
              >
                <NexaButton variant="primary" size="lg" className="w-full">
                  Get Started Free
                </NexaButton>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
