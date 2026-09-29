"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Menu, X, ChevronRight } from "lucide-react";

export default function Navbar() {
  const [activeTab, setActiveTab] = useState("Home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = ["Home", "Properties", "Blog", "FAQ"];

  return (
    <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
      <div className="flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Custom geometric architectural brand icon with #0069ff */}
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-[#0069ff] transition-transform duration-300 group-hover:scale-105"
            >
              <rect x="3" y="11" width="5" height="17" rx="2" fill="currentColor" fillOpacity="0.85" />
              <rect x="11" y="5" width="5" height="23" rx="2" fill="currentColor" />
              <rect x="19" y="9" width="5" height="19" rx="2" fill="currentColor" fillOpacity="0.9" />
              <rect x="27" y="15" width="4" height="13" rx="2" fill="currentColor" fillOpacity="0.75" />
            </svg>
          </div>
          <span className="font-dropa text-2xl font-bold tracking-tight text-[#111318]">
            Veloura
          </span>
        </Link>

        {/* Center Pill Navigation Bar */}
        <nav className="hidden md:flex items-center bg-[#111216] rounded-full p-1.5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] border border-white/10">
          {navItems.map((item) => {
            const isActive = activeTab === item;
            return (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-[#0069ff] text-white shadow-[0_4px_16px_rgba(0,105,255,0.4)]"
                    : "text-zinc-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {item}
              </button>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-stone-700 hover:text-[#0069ff] px-3 py-2 transition-colors duration-200"
          >
            Login
          </Link>
          <button className="flex items-center gap-2 bg-[#0069ff] hover:bg-[#0056d6] text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-[0_6px_20px_rgba(0,105,255,0.32)] transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer">
            <span>Book Call</span>
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Phone className="w-3 h-3 text-white" />
            </div>
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-stone-800 hover:text-[#0069ff] rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 p-4 bg-[#111216] text-white rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                setActiveTab(item);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                activeTab === item
                  ? "bg-[#0069ff] text-white"
                  : "text-zinc-300 hover:bg-white/5"
              }`}
            >
              <span>{item}</span>
              {activeTab === item && <ChevronRight className="w-4 h-4 text-white" />}
            </button>
          ))}
          <div className="pt-3 mt-1 border-t border-white/10 flex items-center justify-between">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-300 hover:text-white px-2 py-1"
            >
              Login
            </Link>
            <button className="flex items-center gap-2 bg-[#0069ff] text-white px-4 py-2 rounded-full text-sm font-medium">
              <span>Book Call</span>
              <Phone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
