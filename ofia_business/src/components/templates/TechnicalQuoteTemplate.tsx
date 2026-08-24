"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  Zap,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  HelpCircle,
  Lock,
} from "lucide-react";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

interface WorkCategory {
  id: string;
  name: string;
  estPriceRange: string;
  surveyFee: number;
}

const WORK_CATEGORIES: WorkCategory[] = [
  { id: "cat-solar", name: "Solar Inverter 5kVA / 10kVA Installation", estPriceRange: "₦850,000 - ₦2,400,000", surveyFee: 15000 },
  { id: "cat-plumb", name: "Industrial Pipe Leak & Borehole Piping", estPriceRange: "₦45,000 - ₦180,000", surveyFee: 10000 },
  { id: "cat-elect", name: "Complete 3-Phase Building Rewiring & Surge Protection", estPriceRange: "₦150,000 - ₦650,000", surveyFee: 12000 },
  { id: "cat-roof", name: "Roof Leak Sealing & Aluminium Gutter Repair", estPriceRange: "₦80,000 - ₦350,000", surveyFee: 15000 },
  { id: "cat-ac", name: "Commercial VRF Central Air Conditioning Installation", estPriceRange: "₦350,000 - ₦1,200,000", surveyFee: 20000 },
];

interface TechnicalQuoteTemplateProps {
  title?: string;
  subtitle?: string;
  subdomain?: string;
}

export const TechnicalQuoteTemplate: React.FC<TechnicalQuoteTemplateProps> = ({
  title = "Technical Scope & Quote Estimate",
  subtitle = "Request itemized technical quotes, upload fault photos, and hire certified civil, electrical, and plumbing engineering artisans.",
  subdomain = "handyman",
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("cat-solar");
  const [projectLocation, setProjectLocation] = useState("Lekki Phase 1, Lagos");
  const [scopeDescription, setScopeDescription] = useState(
    "Need a 5kVA solar inverter system with 48V Lithium battery to power a 4-bedroom duplex."
  );
  const [requestType, setRequestType] = useState<"survey" | "estimate">("survey");

  const activeCategory = WORK_CATEGORIES.find((c) => c.id === selectedCategory) || WORK_CATEGORIES[0];

  return (
    <div className="space-y-6 pb-20">
      {/* HERO BANNER & SCOPE BUILDER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1A56DB]/10 via-[var(--nexa-bg-surface)] to-[var(--nexa-bg-base)] border border-[#1A56DB]/20 space-y-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <NexaBadge variant="brand" className="font-mono text-xs font-bold uppercase tracking-wider">
            <FileSpreadsheet className="w-3.5 h-3.5 inline mr-1" />
            Technical Quote & Estimate • {subdomain}.ofia.ng
          </NexaBadge>
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#0E9F6E] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Milestone Escrow Protection</span>
          </div>
        </div>

        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--nexa-text-primary)] tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--nexa-text-secondary)] leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* WORK CATEGORY & LOCATION FORM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] shadow-inner">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[var(--nexa-text-muted)] block font-bold">
              Engineering Work Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[var(--nexa-text-primary)] outline-none cursor-pointer"
            >
              {WORK_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[var(--nexa-bg-surface)]">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[var(--nexa-text-muted)] block font-bold">
              Site / Project Location
            </label>
            <input
              type="text"
              value={projectLocation}
              onChange={(e) => setProjectLocation(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[var(--nexa-text-primary)] outline-none"
            />
          </div>
        </div>
      </div>

      {/* SCOPE DETAILS & FAULT UPLOAD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <NexaCard variant="glass" padding="md" className="space-y-4 border border-[var(--nexa-border)]">
            <div className="space-y-1.5">
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                Project Scope of Work & Specifications
              </h3>
              <p className="text-[11px] text-[var(--nexa-text-muted)]">
                Provide as much technical detail as possible for accurate material and labor breakdown.
              </p>
            </div>

            <textarea
              rows={4}
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
              className="w-full p-3 text-xs bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-2xl outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] shadow-inner"
              placeholder="Describe your requirements, dimensions, issues, or specific materials needed..."
            />

            {/* FAULT PHOTO UPLOAD DROPZONE */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-[var(--nexa-border)] hover:border-[#1A56DB] bg-[var(--nexa-bg-base)] text-center space-y-2 cursor-pointer transition-all">
              <UploadCloud className="w-8 h-8 text-[#1A56DB] mx-auto" />
              <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Upload Site Photos or Electrical Diagrams
              </div>
              <p className="text-[10px] text-[var(--nexa-text-muted)]">
                PNG, JPG, or PDF up to 15MB. Helps engineers prepare exact technical estimates.
              </p>
            </div>
          </NexaCard>
        </div>

        {/* MILESTONE ESCROW BREAKDOWN & ACTIONS */}
        <div className="space-y-4">
          <NexaCard variant="glass" padding="md" className="space-y-4 border border-[var(--nexa-border)]">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[var(--nexa-text-muted)] uppercase font-bold">
                Typical Cost Range:
              </span>
              <div className="text-sm font-black font-mono text-[#0E9F6E]">
                {activeCategory.estPriceRange}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
              <span className="text-[10px] font-mono uppercase text-[var(--nexa-text-muted)] font-bold block">
                Escrow Milestone Security:
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between p-2 rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  <span>Phase 1: Materials (40%)</span>
                  <span className="text-[#0E9F6E] font-bold">Escrow Held</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  <span>Phase 2: Installation (40%)</span>
                  <span className="text-[#0E9F6E] font-bold">Upon Progress</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  <span>Phase 3: Final Sign-off (20%)</span>
                  <span className="text-[#0E9F6E] font-bold">Client Approval</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/book/nexa-verified/checkout">
                <NexaButton variant="primary" className="w-full bg-[#1A56DB] hover:bg-[#1545B0] text-white font-bold text-xs justify-center py-2.5">
                  Book Site Survey (₦{activeCategory.surveyFee.toLocaleString()}) <ArrowRight className="w-4 h-4 ml-1.5" />
                </NexaButton>
              </Link>
            </div>
          </NexaCard>
        </div>
      </div>
    </div>
  );
};
