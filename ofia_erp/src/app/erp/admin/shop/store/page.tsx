"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Palette,
  Store,
  Eye,
  Sliders,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Save,
  Upload,
  Globe,
  Layout,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";
import {
  VERTICAL_DEFINITIONS,
  detectTenantVertical,
  VerticalKey,
} from "@/lib/verticals";

export default function MyStoreStudioPage() {
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);
  const detectedVertical = detectTenantVertical(activeTenant?.slug, activeTenant?.name);

  const [activeVertical, setActiveVertical] = useState<VerticalKey>(detectedVertical);
  const verticalDef = VERTICAL_DEFINITIONS[activeVertical];

  const [storeName, setStoreName] = useState(activeTenant?.name || "Ofia Enterprise Store");
  const [storeHeadline, setStoreHeadline] = useState("Premium Products, Seamless Deliveries, Unmatched Value");
  const [primaryColor, setPrimaryColor] = useState("#1A56DB");
  const [secondaryColor, setSecondaryColor] = useState("#0E9F6E");
  const [bannerUrl, setBannerUrl] = useState("https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=1200&q=80");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Section Toggles
  const [enableHero, setEnableHero] = useState(true);
  const [enableProducts, setEnableProducts] = useState(true);
  const [enableServices, setEnableServices] = useState(true);
  const [enableReviews, setEnableReviews] = useState(true);
  const [enableDispatchBooking, setEnableDispatchBooking] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast("Storefront theme and template settings saved!");
    }, 600);
  };

  return (
    <BusinessShell
      title="My Store Studio — Storefront Customization"
      subtitle="Design your public-facing storefront, select an industry-native vertical template, and configure brand settings."
      action={
        <div className="flex items-center gap-2">
          <Link
            href={`http://localhost:3003${verticalDef.storefrontPath}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <NexaButton
              size="sm"
              variant="outline"
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              className="rounded-full"
            >
              Preview Live Storefront
            </NexaButton>
          </Link>

          <NexaButton
            size="sm"
            variant="primary"
            leftIcon={<Save className="w-4 h-4" />}
            className="bg-[#1A56DB] text-white rounded-full font-bold shadow-xs"
            onClick={handleSaveStoreSettings}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Publish Changes"}
          </NexaButton>
        </div>
      }
    >
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold flex items-center gap-2 shadow-2xl animate-in fade-in backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {toastMessage}
        </div>
      )}

      <div className="space-y-8">
        {/* KPI CARDS */}
        <ErpStatGrid
          stats={[
            {
              label: "Active Vertical Template",
              value: verticalDef.name,
              change: verticalDef.badge,
              trend: "up",
              icon: <Store className="w-5 h-5 text-blue-500" />,
              sub: `Route: ${verticalDef.storefrontPath}`,
            },
            {
              label: "Storefront Domain",
              value: activeTenant?.slug ? `${activeTenant.slug}.ofia.shop` : "ofia.shop",
              change: "SSL Active",
              trend: "up",
              icon: <Globe className="w-5 h-5 text-emerald-500" />,
              sub: "Canonical web address",
            },
            {
              label: "Active Homepage Modules",
              value: "5 Sections",
              change: "Omnichannel Layout",
              trend: "neutral",
              icon: <Layout className="w-5 h-5 text-purple-500" />,
              sub: "Responsive web & mobile",
            },
            {
              label: "Logistics Integration",
              value: "Direct Dispatch",
              change: "Rider Pickup",
              trend: "up",
              icon: <ShieldCheck className="w-5 h-5 text-amber-500" />,
              sub: "Integrated courier checkout",
            },
          ]}
        />

        {/* 2 COLUMN STUDIO: THEME CONFIG & TEMPLATE SELECTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: 10 VERTICAL TEMPLATE SWITCHER (5 COLS) */}
          <NexaCard variant="glass" padding="lg" className="lg:col-span-5 space-y-4 rounded-3xl">
            <div className="pb-3 border-b border-[var(--nexa-border)]">
              <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                10 Vertical Experience Templates
              </h3>
              <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                Choose the industry archetype that best powers your customer experience
              </p>
            </div>

            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {Object.values(VERTICAL_DEFINITIONS).map((v) => {
                const isSelected = activeVertical === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setActiveVertical(v.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-[#1A56DB]/10 border-[#1A56DB] shadow-sm"
                        : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] hover:border-slate-400"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[var(--nexa-text-primary)]">{v.name}</span>
                        {isSelected && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#1A56DB] text-white font-bold uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--nexa-text-secondary)] mt-0.5">{v.tagline}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#1A56DB]">{v.storefrontPath}</span>
                  </div>
                );
              })}
            </div>
          </NexaCard>

          {/* RIGHT: BRAND & LAYOUT CONTROLS (7 COLS) */}
          <NexaCard variant="glass" padding="lg" className="lg:col-span-7 space-y-6 rounded-3xl">
            <div className="pb-3 border-b border-[var(--nexa-border)]">
              <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                Storefront Brand Identity & Sections
              </h3>
              <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                Customize identity, headline copy, color palette, and homepage modular sections
              </p>
            </div>

            <form onSubmit={handleSaveStoreSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Store Display Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Primary Brand Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-[var(--nexa-border)] cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Hero Headline Copy</label>
                <input
                  type="text"
                  value={storeHeadline}
                  onChange={(e) => setStoreHeadline(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Hero Wallpaper URL</label>
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none font-mono text-[11px]"
                />
              </div>

              {/* SECTION TOGGLES */}
              <div className="pt-3 border-t border-[var(--nexa-border)] space-y-3">
                <h4 className="text-xs font-bold text-[var(--nexa-text-primary)]">Modular Storefront Sections</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { label: "Hero Banner & Value Props", checked: enableHero, setChecked: setEnableHero },
                    { label: `${verticalDef.productTermPlural} Grid`, checked: enableProducts, setChecked: setEnableProducts },
                    { label: `${verticalDef.serviceTerm} Booking`, checked: enableServices, setChecked: setEnableServices },
                    { label: "Customer Reviews & Badges", checked: enableReviews, setChecked: setEnableReviews },
                    { label: "Logistics Pickup & Dispatch CTA", checked: enableDispatchBooking, setChecked: setEnableDispatchBooking },
                  ].map((sec, idx) => (
                    <label
                      key={idx}
                      className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between text-xs font-medium cursor-pointer"
                    >
                      <span>{sec.label}</span>
                      <input
                        type="checkbox"
                        checked={sec.checked}
                        onChange={(e) => sec.setChecked(e.target.checked)}
                        className="w-4 h-4 rounded text-[#1A56DB] cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--nexa-border)] flex justify-end">
                <NexaButton
                  size="md"
                  variant="primary"
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#1A56DB] text-white rounded-full font-bold px-6 shadow-sm"
                >
                  {isSaving ? "Saving Settings..." : "Save Store Customization"}
                </NexaButton>
              </div>
            </form>
          </NexaCard>
        </div>
      </div>
    </BusinessShell>
  );
}
