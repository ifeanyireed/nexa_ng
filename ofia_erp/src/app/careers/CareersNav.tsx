"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Search,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  Menu,
  X,
  Compass,
} from "lucide-react";

export function CareersNav() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Opportunities", href: "/careers" },
    { label: "Track Application", href: "/careers/status" },
    { label: "Assessment Centre", href: "/careers/assessment" },
    { label: "Interview Booking", href: "/careers/interview/schedule" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-3.5"
          : "bg-white border-b border-gray-100 py-5"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/careers" className="flex items-center gap-3 group">
          <img
            src="https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png"
            alt="Ofia Careers"
            className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900 text-lg tracking-tight">Ofia</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                Careers
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 block -mt-0.5">
              WorkforceOS Talent Network
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/60">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA & Login */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors"
          >
            Staff Login
          </Link>
          <Link
            href="/careers#positions"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <span>Explore Vacancies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-xs font-bold ${
                  pathname === link.href
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <Link
              href="/careers#positions"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 bg-blue-600 text-white font-extrabold rounded-xl text-xs text-center shadow-sm"
            >
              Explore Open Positions
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs text-center"
            >
              Staff Portal Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
