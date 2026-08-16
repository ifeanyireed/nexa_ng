"use client";

import React from "react";
import Link from "next/link";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import {
  ShieldCheck,
  Zap,
  Lock,
  Globe2,
  Mail,
  Server,
  Cpu,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import {
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandLinkedin,
  IconBrandOpenai,
} from "@tabler/icons-react";

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-[var(--nexa-bg-base)] border-t border-[var(--nexa-border)] text-[var(--nexa-text-secondary)]">
      {/* Top Value Banner */}
      <div className="border-b border-[var(--nexa-border)]/60 bg-[var(--nexa-bg-surface)]/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--nexa-text-primary)]">14 Autonomous Agents</div>
              <div className="text-[10px] text-[var(--nexa-text-muted)]">Zero Human Fatigue Outreach</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-[#0E9F6E]/10 text-[#0E9F6E] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--nexa-text-primary)]">Circuit Breaker Active</div>
              <div className="text-[10px] text-[var(--nexa-text-muted)]">Automatic Bounce & Risk Killswitches</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-[#7E22CE]/10 text-[#7E22CE] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--nexa-text-primary)]">BYOK & Hybrid Models</div>
              <div className="text-[10px] text-[var(--nexa-text-muted)]">OpenAI, Claude, Mistral & DeepSeek</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-[#E3A008]/10 text-[#E3A008] flex items-center justify-center">
              <IconBrandTelegram className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--nexa-text-primary)]">Telegram CRO Bot</div>
              <div className="text-[10px] text-[var(--nexa-text-muted)]">Real-time Approval & Command Center</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-[var(--nexa-border)] p-1 flex items-center justify-center">
                <img src="/logo.png" alt="GTM AI Agency Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-base text-[var(--nexa-text-primary)] text-display">
                GTM AI Agency
              </span>
            </Link>
            <p className="text-xs text-[var(--nexa-text-muted)] max-w-sm leading-relaxed">
              The world's premier Autonomous Revenue Swarm for high-growth SaaS, enterprise software, and B2B institutions. Engineered to discover, enrich, message, and close enterprise deals with zero manual fatigue.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://t.me/NexaGTM_CRO_Bot"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex items-center justify-center text-[#1A56DB] hover:bg-[#1A56DB] hover:text-white transition-all"
                aria-label="Telegram"
              >
                <IconBrandTelegram className="w-4 h-4" />
              </a>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex items-center justify-center text-[#0E9F6E] hover:bg-[#0E9F6E] hover:text-white transition-all"
                aria-label="WhatsApp"
              >
                <IconBrandWhatsapp className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex items-center justify-center text-[#1A56DB] hover:bg-[#1A56DB] hover:text-white transition-all"
                aria-label="LinkedIn"
              >
                <IconBrandLinkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 1: Platform & Swarm */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--nexa-text-primary)] text-display">
              Autonomous Swarm
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#agents" className="hover:text-[#1A56DB] transition-colors">
                  14 Agent Swarm Map
                </Link>
              </li>
              <li>
                <Link href="/#telegram-cro" className="hover:text-[#1A56DB] transition-colors flex items-center gap-1">
                  Telegram CRO Bot <NexaBadge variant="brand">Active</NexaBadge>
                </Link>
              </li>
              <li>
                <Link href="/#waba" className="hover:text-[#1A56DB] transition-colors">
                  WhatsApp Business Engine
                </Link>
              </li>
              <li>
                <Link href="/#email-infra" className="hover:text-[#1A56DB] transition-colors">
                  AWS SES Auto Warmup
                </Link>
              </li>
              <li>
                <Link href="/#byok" className="hover:text-[#1A56DB] transition-colors">
                  Model Gateway (BYOK)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Solutions & Tiers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--nexa-text-primary)] text-display">
              Plans & Pricing
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/pricing" className="hover:text-[#1A56DB] transition-colors">
                  Free Trial (14 Days)
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#1A56DB] transition-colors">
                  Starter Swarm ($450/mo)
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#1A56DB] transition-colors">
                  Growth Swarm ($1,200/mo)
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#1A56DB] transition-colors flex items-center gap-1">
                  Scale Dominance ($2,400/mo) <NexaBadge variant="purple">Popular</NexaBadge>
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#1A56DB] transition-colors">
                  Custom Enterprise ($4,500/mo)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--nexa-text-primary)] text-display">
              Company & Security
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-[#1A56DB] transition-colors">
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#1A56DB] transition-colors">
                  Book Enterprise Demo
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#1A56DB] transition-colors">
                  Support & SLAs
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#1A56DB] transition-colors">
                  Operator Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-[#1A56DB] transition-colors">
                  Provision Workspace
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="mt-12 pt-8 border-t border-[var(--nexa-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--nexa-text-muted)]">
          <div>
            © {new Date().getFullYear()} GTM AI Agency. All rights reserved. Powered by Nexa Swarm Architecture.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#0E9F6E] animate-pulse" />
              All 14 Autonomous Agents Operational
            </span>
            <span className="text-mono text-[10px]">v2.6.4-prod</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
