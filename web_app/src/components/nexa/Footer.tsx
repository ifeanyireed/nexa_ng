"use client";

import React from "react";
import Link from "next/link";
import {
  IconBrandX,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandLinkedin,
} from "@tabler/icons-react";
import { NexaButton } from "./NexaButton";

export const Footer = () => {
  const socials = [
    { icon: <IconBrandX className="w-5 h-5" />, href: "#" },
    { icon: <IconBrandInstagram className="w-5 h-5" />, href: "#" },
    { icon: <IconBrandFacebook className="w-5 h-5" />, href: "#" },
    { icon: <IconBrandLinkedin className="w-5 h-5" />, href: "#" },
  ];

  return (
    <footer className="pt-24 pb-12 bg-nexa-bg-base border-t-2 border-nexa-brand/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <img src="/logo.png" alt="Nexa Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-display">Nexa</span>
            </div>
            <p className="text-nexa-text-secondary text-sm mb-6 leading-relaxed">
              Nigeria's #1 business discovery and conversion platform. Empowering local businesses and consumers through technology.
            </p>
            <div className="flex gap-4">
              {socials.map((social, i) => (
                <div key={i} className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center cursor-pointer hover:bg-nexa-brand hover:text-white transition-all">
                  {social.icon}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-display tracking-widest uppercase text-[10px]">Company</h4>
            <ul className="space-y-4 text-sm text-nexa-text-secondary">
              <Link href="/about"><li className="hover:text-nexa-brand cursor-pointer transition-colors">Our Story</li></Link>
              <Link href="/nexa-verified"><li className="hover:text-nexa-brand cursor-pointer transition-colors font-bold text-nexa-amber">Nexa Guaranteed</li></Link>
              <Link href="/trending"><li className="hover:text-nexa-brand cursor-pointer transition-colors">Trending</li></Link>
              <Link href="/contact"><li className="hover:text-nexa-brand cursor-pointer transition-colors">Contact & Support</li></Link>
              <Link href="/legal/privacy"><li className="hover:text-nexa-brand cursor-pointer transition-colors">Privacy Policy</li></Link>
              <Link href="/legal/terms"><li className="hover:text-nexa-brand cursor-pointer transition-colors">Terms of Service</li></Link>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-display tracking-widest uppercase text-[10px]">Business</h4>
            <ul className="space-y-4 text-sm text-nexa-text-secondary">
              <Link href="/join">
                <li className="hover:text-nexa-brand cursor-pointer transition-colors font-bold text-nexa-brand">List your Business</li>
              </Link>
              <Link href="/business"><li className="hover:text-nexa-brand cursor-pointer transition-colors">Enterprise Solutions</li></Link>
              <Link href="/business"><li className="hover:text-nexa-brand cursor-pointer transition-colors">Advertising</li></Link>
              <Link href="/success-stories"><li className="hover:text-nexa-brand cursor-pointer transition-colors">Success Stories</li></Link>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Newsletter</h4>
            <p className="text-sm text-nexa-text-secondary mb-4">Get the best local deals and business tips delivered to you.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="email@nexa.ng" className="flex-1 bg-nexa-bg-surface border border-nexa-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-nexa-brand-glow" />
              <NexaButton size="sm">Join</NexaButton>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-nexa-border text-xs text-nexa-text-faint">
          <p>© 2026 Nexa Technologies. All rights reserved.</p>
          <p className="mt-4 md:mt-0 flex items-center gap-1">Made with ❤️ for Nigeria 🇳🇬</p>
        </div>
      </div>
    </footer>
  );
};
