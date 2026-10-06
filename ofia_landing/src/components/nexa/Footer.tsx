"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NexaButton } from "./NexaButton";
import { NexaBadge } from "./NexaBadge";
import { ArrowRight, ShieldCheck, Heart, Sparkles } from "lucide-react";
import {
  IconBrandX,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandLinkedin,
} from "@tabler/icons-react";

export const Footer = () => {
  const [subEmail, setSubEmail] = useState("");
  const [subDone, setSubDone] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail) return;
    try {
      const api = process.env.NEXT_PUBLIC_USERS_API || "http://localhost:8081";
      await fetch(`${api}/api/v1/cms/blog/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail }),
      });
      setSubDone(true);
    } catch {
      setSubDone(true);
    }
  };

  const socials = [
    { icon: <IconBrandX className="w-4 h-4" />, href: "#", name: "X (Twitter)" },
    { icon: <IconBrandInstagram className="w-4 h-4" />, href: "#", name: "Instagram" },
    { icon: <IconBrandFacebook className="w-4 h-4" />, href: "#", name: "Facebook" },
    { icon: <IconBrandLinkedin className="w-4 h-4" />, href: "#", name: "LinkedIn" },
  ];

  return (
    <footer className="pt-24 pb-12 bg-[var(--nexa-bg-base)] border-t border-[var(--nexa-border)] relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-nexa-brand/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* COLUMN 1: BRAND */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-6 group inline-flex">
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs flex items-center justify-center">
                <img
                  src="https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png"
                  alt="Ofia Ecosystem Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-extrabold text-display tracking-tight text-[var(--nexa-text-primary)]">
                Ofia
              </span>
            </Link>

            <p className="text-nexa-text-secondary text-sm mb-6 leading-relaxed max-w-sm">
              The unified multi-tenant business operating system for African trade. Run storefronts, ERP operations, autonomous AI lead generation, and nationwide logistics from a single login.
            </p>

            <div className="flex items-center gap-3 mb-6">
              <NexaBadge variant="verified" size="sm">
                Verified Commercial Infrastructure
              </NexaBadge>
            </div>

            <div className="flex gap-3">
              {socials.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  aria-label={social.name}
                  className="w-9 h-9 rounded-full liquid-glass flex items-center justify-center text-nexa-text-secondary hover:bg-nexa-brand hover:text-white transition-all duration-200 hover:scale-105"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* COLUMN 2: SUITE PRODUCTS */}
          <div>
            <h4 className="font-bold mb-6 text-display tracking-widest uppercase text-[11px] text-nexa-brand">
              The Ecosystem
            </h4>
            <ul className="space-y-3.5 text-sm text-nexa-text-secondary">
              <li>
                <Link href="/products" className="hover:text-nexa-brand transition-colors font-medium">
                  Products Overview
                </Link>
              </li>
              <li>
                <a href="https://ofia.ng" target="_blank" rel="noopener noreferrer" className="hover:text-nexa-brand transition-colors">
                  Ofia Compass Discovery
                </a>
              </li>
              <li>
                <Link href="/products" className="hover:text-nexa-brand transition-colors">
                  Dedicated Digital Shops
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-nexa-brand transition-colors">
                  Autonomous AI GTM Swarm
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-nexa-brand transition-colors">
                  Ofia Dispatch &amp; Logistics
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-nexa-brand transition-colors">
                  Enterprise ERP Suite
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: PLATFORM & PRICING */}
          <div>
            <h4 className="font-bold mb-6 text-display tracking-widest uppercase text-[11px] text-nexa-text-muted">
              Platform &amp; Plans
            </h4>
            <ul className="space-y-3.5 text-sm text-nexa-text-secondary">
              <li>
                <Link href="/pricing" className="hover:text-nexa-brand transition-colors font-semibold text-nexa-brand">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-nexa-brand transition-colors">
                  Founding Offer (First 500)
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-nexa-brand transition-colors">
                  Ofia Journal &amp; Updates
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-nexa-brand transition-colors">
                  Enterprise Quotas &amp; BYOK
                </Link>
              </li>
              <li>
                <a href="https://ofia.ng" target="_blank" rel="noopener noreferrer" className="hover:text-nexa-brand transition-colors">
                  Merchant Escrow Guarantees
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: NEWSLETTER */}
          <div>
            <h4 className="font-bold mb-6 text-display tracking-widest uppercase text-[11px] text-nexa-text-muted">
              Stay Informed
            </h4>
            <p className="text-xs text-nexa-text-secondary mb-4 leading-relaxed">
              Join 5,000+ business owners receiving quarterly insights on commerce automation and Nigerian trade.
            </p>
            {subDone ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                ✓ Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder="name@business.ng"
                  required
                  className="w-full bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-xl px-3.5 py-2.5 text-xs text-nexa-text-primary placeholder:text-nexa-text-faint focus:outline-none focus:ring-2 focus:ring-nexa-brand-glow focus:border-nexa-brand transition-all"
                />
                <NexaButton type="submit" size="sm" variant="primary" className="w-full">
                  Subscribe
                </NexaButton>
              </form>
            )}
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[var(--nexa-border)] text-xs text-nexa-text-muted">
          <p>© {new Date().getFullYear()} Ofia Technologies Ltd. All rights reserved.</p>
          <p className="mt-3 sm:mt-0 flex items-center gap-1.5 font-medium">
            Engineered with pride for Nigeria &amp; West Africa 🇳🇬
          </p>
        </div>
      </div>
    </footer>
  );
};
