"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Store,
  CheckCircle2,
  ExternalLink,
  Save,
  Globe,
  Layout,
  ShieldCheck,
  Megaphone,
  Sparkles,
  Layers,
  Award,
  Phone,
  Sliders,
  Palette,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Eye,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";
import {
  VERTICAL_DEFINITIONS,
  VerticalKey,
} from "@/lib/verticals";

type StudioTab = "branding" | "hero" | "badges" | "policies";

export default function VerticalStoreStudioPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);

  const rawVertical = (params?.vertical as string) || "fashion";
  const verticalKey: VerticalKey = (rawVertical in VERTICAL_DEFINITIONS ? rawVertical : "fashion") as VerticalKey;
  const currentVerticalDef = VERTICAL_DEFINITIONS[verticalKey] || VERTICAL_DEFINITIONS.fashion;

  // Tenant vertical enforcement: strictly lock tenant to their provisioned vertical
  useEffect(() => {
    if (activeTenant?.vertical && activeTenant.vertical in VERTICAL_DEFINITIONS && activeTenant.vertical !== verticalKey) {
      router.replace(`/erp/admin/shop/${activeTenant.vertical}/store`);
    }
  }, [activeTenant?.vertical, verticalKey, router]);

  const [activeTab, setActiveTab] = useState<StudioTab>("branding");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Studio form states tailored to vertical
  const [storeName, setStoreName] = useState(
    activeTenant?.name ? `${activeTenant.name} (${currentVerticalDef.name})` : `Ofia ${currentVerticalDef.name}`
  );
  const [tagline, setTagline] = useState(currentVerticalDef.tagline);
  const [heroHeading, setHeroHeading] = useState(
    `Exclusive ${currentVerticalDef.name} Collections & ${currentVerticalDef.serviceTerm}`
  );
  const [heroSubheading, setHeroSubheading] = useState(
    `Curated by master practitioners with verified warranty, express dispatch across Nigeria, and physical showroom viewings.`
  );
  const [heroCtaText, setHeroCtaText] = useState(`Explore ${currentVerticalDef.productTermPlural}`);
  const [primaryColor, setPrimaryColor] = useState("#1A56DB");
  const [badges, setBadges] = useState<string[]>([
    `${currentVerticalDef.name} Certified`,
    "Express Delivery",
    "Verified Escrow Protection",
  ]);
  const [newBadgeInput, setNewBadgeInput] = useState("");

  const handleAddBadge = () => {
    if (!newBadgeInput.trim()) return;
    if (!badges.includes(newBadgeInput.trim())) {
      setBadges([...badges, newBadgeInput.trim()]);
    }
    setNewBadgeInput("");
  };

  const handleRemoveBadge = (badge: string) => {
    setBadges(badges.filter((b) => b !== badge));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    const slug = activeTenant?.slug || "neweratransports";

    const payload = {
      tenantSlug: slug,
      vertical: verticalKey,
      storeName,
      tagline,
      heroHeading,
      heroSubheading,
      heroCtaText,
      primaryColor,
      badges,
    };

    try {
      await fetch("/api/erp/shop/store-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setToastMessage("Storefront studio configuration saved successfully!");
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Failed to save store settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const storefrontLiveUrl = `http://localhost:3000${currentVerticalDef.storefrontPath}${
    activeTenant?.slug ? `?tenant=${activeTenant.slug}` : ""
  }`;

  return (
    <BusinessShell
      title={`${currentVerticalDef.name} — Storefront Studio`}
      subtitle={`Visual studio and brand theme customizer for your ${currentVerticalDef.name.toLowerCase()} consumer storefront.`}
      activeModule="shop"
      action={
        <div className="flex items-center gap-2">
          <NexaBadge variant="brand" size="sm" className="rounded-full">
            {currentVerticalDef.name}
          </NexaBadge>

          <a href={storefrontLiveUrl} target="_blank" rel="noopener noreferrer">
            <NexaButton size="sm" variant="outline" leftIcon={<ExternalLink className="w-3.5 h-3.5" />} className="rounded-full">
              Preview Store
            </NexaButton>
          </a>

          <NexaButton
            size="sm"
            variant="primary"
            onClick={handleSaveSettings}
            disabled={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
            className="rounded-full bg-[#1A56DB] text-white font-bold"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        {toastMessage && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 border-b border-[var(--nexa-border)] pb-2 overflow-x-auto">
          {[
            { id: "branding", label: "Brand & Colors", icon: <Palette className="w-3.5 h-3.5" /> },
            { id: "hero", label: "Hero Banner", icon: <Layout className="w-3.5 h-3.5" /> },
            { id: "badges", label: "Trust Badges", icon: <Award className="w-3.5 h-3.5" /> },
            { id: "policies", label: "Store Policies", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudioTab)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? "bg-[#1A56DB] text-white shadow-xs"
                  : "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)] hover:border-gray-400"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: BRANDING */}
        {activeTab === "branding" && (
          <NexaCard variant="glass" padding="lg" className="rounded-3xl border border-[var(--nexa-border)] space-y-4 max-w-2xl">
            <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
              {currentVerticalDef.name} Storefront Identity
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                  Public Store Title
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                  Tagline / Subheading
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                  Brand Theme Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-32 px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-mono font-semibold text-[var(--nexa-text-primary)]"
                  />
                </div>
              </div>
            </div>
          </NexaCard>
        )}

        {/* TAB 2: HERO BANNER */}
        {activeTab === "hero" && (
          <NexaCard variant="glass" padding="lg" className="rounded-3xl border border-[var(--nexa-border)] space-y-4 max-w-2xl">
            <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
              Hero Banner Copy & Call to Action
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                  Headline Text
                </label>
                <input
                  type="text"
                  value={heroHeading}
                  onChange={(e) => setHeroHeading(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                  Sub-Headline Story
                </label>
                <textarea
                  rows={3}
                  value={heroSubheading}
                  onChange={(e) => setHeroSubheading(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-medium text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB] resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={heroCtaText}
                  onChange={(e) => setHeroCtaText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                />
              </div>
            </div>
          </NexaCard>
        )}

        {/* TAB 3: TRUST BADGES */}
        {activeTab === "badges" && (
          <NexaCard variant="glass" padding="lg" className="rounded-3xl border border-[var(--nexa-border)] space-y-4 max-w-2xl">
            <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
              Storefront Trust & Accreditation Badges
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newBadgeInput}
                onChange={(e) => setNewBadgeInput(e.target.value)}
                placeholder="e.g. Master Tailor Certified, 2-Year Warranty"
                className="flex-1 px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs font-semibold text-[var(--nexa-text-primary)] outline-none"
              />
              <NexaButton
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAddBadge}
                className="rounded-xl bg-[#1A56DB] text-white font-bold"
              >
                Add Badge
              </NexaButton>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {badges.map((b) => (
                <div
                  key={b}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-xs font-bold text-[var(--nexa-text-primary)]"
                >
                  <Award className="w-3.5 h-3.5 text-blue-500" />
                  <span>{b}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBadge(b)}
                    className="text-gray-400 hover:text-red-500 cursor-pointer ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </NexaCard>
        )}

        {/* TAB 4: POLICIES */}
        {activeTab === "policies" && (
          <NexaCard variant="glass" padding="lg" className="rounded-3xl border border-[var(--nexa-border)] space-y-4 max-w-2xl">
            <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
              {currentVerticalDef.name} Fulfillment & Return Policy
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                <span className="font-bold text-[var(--nexa-text-primary)] block">Standard Delivery Policy</span>
                <p className="text-[var(--nexa-text-secondary)] leading-relaxed">
                  Orders are dispatched within 24-48 hours via vetted dispatch riders and interstate couriers. Tracking number is issued automatically via SMS and WhatsApp.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                <span className="font-bold text-[var(--nexa-text-primary)] block">Service Appointment Rescheduling</span>
                <p className="text-[var(--nexa-text-secondary)] leading-relaxed">
                  Appointments can be rescheduled up to 12 hours prior to the scheduled slot without penalty. Contact the showroom concierge for urgent alterations.
                </p>
              </div>
            </div>
          </NexaCard>
        )}
      </div>
    </BusinessShell>
  );
}
