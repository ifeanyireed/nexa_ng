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
  Mail,
  MapPin,
  Clock,
  MessageCircle,
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

type StudioTab = "branding" | "hero" | "badges" | "footer" | "policies";

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
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
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

  // Contact details in footer config
  const [contactAddress, setContactAddress] = useState(
    verticalKey === "fashion"
      ? "14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria"
      : "Victoria Island, Lagos, Nigeria"
  );
  const [contactPhone, setContactPhone] = useState("+234 803 123 4567");
  const [contactEmail, setContactEmail] = useState(
    activeTenant?.slug ? `concierge@${activeTenant.slug}.ofia.store` : "concierge@funmyclothing.com"
  );
  const [contactWhatsapp, setContactWhatsapp] = useState("+234 812 345 6789");
  const [contactHours, setContactHours] = useState("Mon - Sat: 9:00 AM - 8:00 PM WAT");

  // Footer branding, bio, and socials
  const [footerBio, setFooterBio] = useState(
    `Dedicated to contemporary Afro-minimalist silhouettes, artisanal bespoke tailoring, and sustainable luxury.`
  );
  const [footerCopyright, setFooterCopyright] = useState(
    `© ${new Date().getFullYear()} ${activeTenant?.name || currentVerticalDef.name}. All rights reserved.`
  );
  const [socialInstagram, setSocialInstagram] = useState("https://instagram.com/funmyclothing");
  const [socialTwitter, setSocialTwitter] = useState("https://twitter.com/funmyclothing");
  const [socialFacebook, setSocialFacebook] = useState("https://facebook.com/funmyclothing");
  const [socialLinkedin, setSocialLinkedin] = useState("https://linkedin.com/company/funmyclothing");

  // Fetch saved settings from Neon on mount
  const fetchStoreSettings = React.useCallback(async () => {
    const slug = activeTenant?.slug || (verticalKey === "fashion" ? "funmyclothing" : verticalKey === "cars" ? "neweratransports" : "reedbreed");
    setIsLoadingSettings(true);
    try {
      const res = await fetch(`/api/erp/shop/store-settings?tenant=${encodeURIComponent(slug)}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (data && data.success && data.config) {
        const cfg = data.config;
        if (cfg.storeName) setStoreName(cfg.storeName);
        if (cfg.tagline || cfg.hero?.eyebrow) setTagline(cfg.tagline || cfg.hero?.eyebrow);
        if (cfg.heroHeading || cfg.hero?.headline) setHeroHeading(cfg.heroHeading || cfg.hero?.headline);
        if (cfg.heroSubheading || cfg.hero?.description) setHeroSubheading(cfg.heroSubheading || cfg.hero?.description);
        if (cfg.heroCtaText || cfg.hero?.ctaLabel) setHeroCtaText(cfg.heroCtaText || cfg.hero?.ctaLabel);
        if (cfg.primaryColor) setPrimaryColor(cfg.primaryColor);
        if (Array.isArray(cfg.badges) && cfg.badges.length > 0) setBadges(cfg.badges);

        // Hydrate contact details
        if (cfg.contact) {
          if (cfg.contact.address) setContactAddress(cfg.contact.address);
          if (cfg.contact.phone) setContactPhone(cfg.contact.phone);
          if (cfg.contact.email) setContactEmail(cfg.contact.email);
          if (cfg.contact.whatsapp) setContactWhatsapp(cfg.contact.whatsapp);
          if (cfg.contact.operatingHours) setContactHours(cfg.contact.operatingHours);
        }

        // Hydrate footer config
        if (cfg.footer) {
          if (cfg.footer.bio) setFooterBio(cfg.footer.bio);
          if (cfg.footer.copyright) setFooterCopyright(cfg.footer.copyright);
          if (cfg.footer.socials) {
            if (cfg.footer.socials.instagram) setSocialInstagram(cfg.footer.socials.instagram);
            if (cfg.footer.socials.twitter) setSocialTwitter(cfg.footer.socials.twitter);
            if (cfg.footer.socials.facebook) setSocialFacebook(cfg.footer.socials.facebook);
            if (cfg.footer.socials.linkedin) setSocialLinkedin(cfg.footer.socials.linkedin);
          }
        }
      }
    } catch (err) {
      console.warn("Could not load existing store settings:", err);
    } finally {
      setIsLoadingSettings(false);
    }
  }, [activeTenant?.slug, verticalKey]);

  useEffect(() => {
    fetchStoreSettings();
  }, [fetchStoreSettings]);

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
    const slug = activeTenant?.slug || (verticalKey === "fashion" ? "funmyclothing" : verticalKey === "cars" ? "neweratransports" : "reedbreed");

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
      contact: {
        address: contactAddress,
        phone: contactPhone,
        email: contactEmail,
        whatsapp: contactWhatsapp,
        operatingHours: contactHours,
      },
      footer: {
        bio: footerBio,
        copyright: footerCopyright,
        socials: {
          instagram: socialInstagram,
          twitter: socialTwitter,
          facebook: socialFacebook,
          linkedin: socialLinkedin,
        },
      },
    };

    try {
      const res = await fetch(`/api/erp/shop/store-settings?tenant=${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (data && data.success) {
        setToastMessage("Storefront studio & footer configuration saved successfully!");
      } else {
        setToastMessage("Configuration updated.");
      }
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Failed to save store settings:", err);
      setToastMessage("Failed to save storefront configuration.");
      setTimeout(() => setToastMessage(null), 4000);
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
            { id: "footer", label: "Footer & Contact", icon: <Phone className="w-3.5 h-3.5" /> },
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

        {/* TAB 4: FOOTER & CONTACT DETAILS */}
        {activeTab === "footer" && (
          <div className="space-y-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CONTACT DETAILS CARD */}
              <NexaCard variant="glass" padding="lg" className="rounded-3xl border border-[var(--nexa-border)] space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--nexa-border)]">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                      Showroom & Studio Contact
                    </h3>
                    <span className="text-[10px] text-[var(--nexa-text-muted)]">
                      Displayed on consumer storefront footer & order receipts
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[var(--nexa-text-primary)] mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" /> Physical Showroom / Atelier Address
                    </label>
                    <input
                      type="text"
                      value={contactAddress}
                      onChange={(e) => setContactAddress(e.target.value)}
                      placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[var(--nexa-text-primary)] mb-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" /> Customer Support Phone
                      </label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+234 803 123 4567"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-mono font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--nexa-text-primary)] mb-1 flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-green-500" /> WhatsApp Line
                      </label>
                      <input
                        type="text"
                        value={contactWhatsapp}
                        onChange={(e) => setContactWhatsapp(e.target.value)}
                        placeholder="+234 812 345 6789"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-mono font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[var(--nexa-text-primary)] mb-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-purple-500" /> Concierge / Support Email
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="concierge@store.com"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--nexa-text-primary)] mb-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" /> Studio Operating Hours
                      </label>
                      <input
                        type="text"
                        value={contactHours}
                        onChange={(e) => setContactHours(e.target.value)}
                        placeholder="Mon - Sat: 9:00 AM - 8:00 PM WAT"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                      />
                    </div>
                  </div>
                </div>
              </NexaCard>

              {/* FOOTER BRAND & SOCIALS CARD */}
              <NexaCard variant="glass" padding="lg" className="rounded-3xl border border-[var(--nexa-border)] space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--nexa-border)]">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                      Footer Bio & Social Channels
                    </h3>
                    <span className="text-[10px] text-[var(--nexa-text-muted)]">
                      Brand narrative and social links rendered across all storefront pages
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                      Footer Brand Bio / Atelier Narrative
                    </label>
                    <textarea
                      rows={2}
                      value={footerBio}
                      onChange={(e) => setFooterBio(e.target.value)}
                      placeholder="Brief 1-2 sentence brand philosophy shown in the footer."
                      className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-medium text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                      Copyright Notice
                    </label>
                    <input
                      type="text"
                      value={footerCopyright}
                      onChange={(e) => setFooterCopyright(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                        Instagram Profile URL
                      </label>
                      <input
                        type="url"
                        value={socialInstagram}
                        onChange={(e) => setSocialInstagram(e.target.value)}
                        placeholder="https://instagram.com/yourhandle"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                        Twitter / X URL
                      </label>
                      <input
                        type="url"
                        value={socialTwitter}
                        onChange={(e) => setSocialTwitter(e.target.value)}
                        placeholder="https://twitter.com/yourhandle"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                        Facebook URL
                      </label>
                      <input
                        type="url"
                        value={socialFacebook}
                        onChange={(e) => setSocialFacebook(e.target.value)}
                        placeholder="https://facebook.com/yourpage"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={socialLinkedin}
                        onChange={(e) => setSocialLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/company/yourbrand"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                      />
                    </div>
                  </div>
                </div>
              </NexaCard>
            </div>

            {/* LIVE FOOTER PREVIEW CARD */}
            <NexaCard variant="glass" padding="lg" className="rounded-3xl border border-[var(--nexa-border)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--nexa-border)]">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--nexa-text-primary)]">
                    Live Storefront Footer Preview
                  </h4>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Real-time synchronization
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-white text-zinc-900 border border-zinc-200 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
                  {/* Col 1 */}
                  <div className="space-y-2">
                    <span className="font-extrabold text-sm text-zinc-900 block">{storeName}</span>
                    <p className="text-zinc-500 text-[11px] leading-relaxed line-clamp-3">
                      {footerBio}
                    </p>
                    <div className="flex gap-2 pt-1">
                      {socialInstagram && <span className="text-[10px] text-pink-600 font-bold">Instagram</span>}
                      {socialTwitter && <span className="text-[10px] text-sky-500 font-bold">Twitter</span>}
                      {socialFacebook && <span className="text-[10px] text-blue-600 font-bold">Facebook</span>}
                    </div>
                  </div>

                  {/* Col 2 */}
                  <div className="space-y-1.5 text-zinc-600">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-900 block">Catalog Drops</span>
                    <div>Ceremonial Wear</div>
                    <div>Bespoke Tailoring</div>
                    <div>Ready-To-Wear</div>
                  </div>

                  {/* Col 3 */}
                  <div className="space-y-1.5 text-zinc-600">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-900 block">Atelier Services</span>
                    <div>Custom Fitting Session</div>
                    <div>Garment Alteration</div>
                    <div>Luxury Wardrobe Styling</div>
                  </div>

                  {/* Col 4 */}
                  <div className="space-y-2 text-zinc-600">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-900 block">Showroom & Hours</span>
                    <div className="flex items-start gap-1.5 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span>{contactAddress}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{contactPhone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-800">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{contactHours}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row justify-between text-[11px] text-zinc-400">
                  <span>{footerCopyright}</span>
                  <div className="flex gap-3">
                    <span>Privacy Policy</span>
                    <span>·</span>
                    <span>Terms of Service</span>
                    <span>·</span>
                    <span>Delivery Guarantees</span>
                  </div>
                </div>
              </div>
            </NexaCard>
          </div>
        )}

        {/* TAB 5: POLICIES */}
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
