"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NexaButton } from "./NexaButton";
import { NexaBadge } from "./NexaBadge";
import { ArrowRight, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
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
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2"
          >
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
              The unified multi-tenant business operating system for African trade. Run industry storefronts, enterprise ERP, white-label mobility, multi-carrier dispatch, and an autonomous AI swarm from a single login.
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
          </motion.div>

          {/* COLUMN 2: 5 STRATEGIC PILLARS */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h4 className="font-bold mb-6 text-display tracking-widest uppercase text-[11px] text-nexa-brand">
              The 5 Pillars
            </h4>
            <ul className="space-y-3 text-sm text-nexa-text-secondary">
              <li>
                <Link href="/products" className="hover:text-nexa-brand transition-colors font-medium">
                  All Products Overview
                </Link>
              </li>
              <li>
                <Link href="/products?category=storefronts" className="hover:text-nexa-brand transition-colors">
                  Commerce &amp; 10 Storefronts
                </Link>
              </li>
              <li>
                <Link href="/products?category=erp" className="hover:text-nexa-brand transition-colors">
                  Enterprise ERP Suite
                </Link>
              </li>
              <li>
                <Link href="/products?category=mobility" className="hover:text-nexa-brand transition-colors">
                  Mobility &amp; Transport OS
                </Link>
              </li>
              <li>
                <Link href="/products?category=logistics" className="hover:text-nexa-brand transition-colors">
                  Logistics &amp; Fulfillment
                </Link>
              </li>
              <li>
                <Link href="/products?category=ai" className="hover:text-nexa-brand transition-colors">
                  Autonomous AI Swarm
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* COLUMN 3: PLATFORM & PRICING */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
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
                <Link href="/waitlist" className="hover:text-nexa-brand transition-colors font-medium">
                  Join VIP Waitlist
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
          </motion.div>

          {/* COLUMN 4: NEWSLETTER */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.75, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
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
          </motion.div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[var(--nexa-border)] text-xs text-nexa-text-muted"
        >
          <p>© {new Date().getFullYear()} Ofia Technologies Ltd. All rights reserved.</p>
          <p className="mt-3 sm:mt-0 flex items-center gap-1.5 font-medium">
            Engineered with pride for Nigeria &amp; West Africa 🇳🇬
          </p>
        </motion.div>
      </div>
    </footer>
  );
};
