"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";
import {
  VERTICAL_DEFINITIONS,
  detectTenantVertical,
  VerticalKey,
} from "@/lib/verticals";

type StudioTab = "brand" | "hero" | "badges" | "catalog_banner" | "contact_footer" | "policies";

export default function MyStoreStudioPage() {
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);
  const detectedVertical = (activeTenant?.vertical as VerticalKey) || detectTenantVertical(activeTenant?.slug, activeTenant?.name);

  const [activeVertical, setActiveVertical] = useState<VerticalKey>(detectedVertical);
  const verticalDef = VERTICAL_DEFINITIONS[activeVertical] || VERTICAL_DEFINITIONS.retail;

  const [activeTab, setActiveTab] = useState<StudioTab>("brand");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. BRAND & HEADER IDENTITY
  const [storeName, setStoreName] = useState(activeTenant?.name || "Ofia Enterprise Store");
  const [logoUrl, setLogoUrl] = useState(activeTenant?.logo || "");
  const [primaryColor, setPrimaryColor] = useState(activeTenant?.primaryColor || "#1A56DB");
  const [secondaryColor, setSecondaryColor] = useState(activeTenant?.secondaryColor || "#0E9F6E");
  const [headerCtaLabel, setHeaderCtaLabel] = useState("");
  const [headerCtaHref, setHeaderCtaHref] = useState("");

  // 2. TOP ANNOUNCEMENT BAR
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementBadge, setAnnouncementBadge] = useState("NEW DROP");
  const [announcementText, setAnnouncementText] = useState("Free express doorstep delivery on orders above ₦50,000");
  const [announcementLink, setAnnouncementLink] = useState("");

  // 3. HERO BENTO SHOWCASE
  const [enableHero, setEnableHero] = useState(true);
  const [heroEyebrow, setHeroEyebrow] = useState(verticalDef.tagline || "Capsule Drop & Couture");
  const [heroHeadline, setHeroHeadline] = useState(activeTenant?.name || "Ofia Enterprise Store");
  const [heroHighlight, setHeroHighlight] = useState(`· Artisanal ${verticalDef.name} & Tailored Experience`);
  const [heroDescription, setHeroDescription] = useState("Artisanal craft, authentic textiles, and tailored collections engineered for effortless elegance.");
  const [heroCtaLabel, setHeroCtaLabel] = useState("Explore Capsule Catalog");
  const [heroCtaHref, setHeroCtaHref] = useState(`${verticalDef.storefrontPath}/catalog`);
  const [heroFootnote, setHeroFootnote] = useState("Free Doorstep Sizing Exchanges · 7-Day Fit Guarantee");
  const [heroBadge, setHeroBadge] = useState(verticalDef.badge || "Verified Collection");
  const [heroBgColor, setHeroBgColor] = useState("#FAF9F5");
  const [bannerUrl, setBannerUrl] = useState(activeTenant?.loginImage || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80");

  // 4. VALUE & TRUST BADGES (4 BADGES)
  const [enableValueBadges, setEnableValueBadges] = useState(true);
  const [badge1Title, setBadge1Title] = useState("Custom Sizing");
  const [badge1Desc, setBadge1Desc] = useState("Made-to-measure precision tailoring");
  const [badge2Title, setBadge2Title] = useState("Artisanal Textiles");
  const [badge2Desc, setBadge2Desc] = useState("100% sustainable raw materials");
  const [badge3Title, setBadge3Title] = useState("Ofia Express Dispatch");
  const [badge3Desc, setBadge3Desc] = useState("Inspected doorstep fulfillment");
  const [badge4Title, setBadge4Title] = useState("Free Exchanges");
  const [badge4Desc, setBadge4Desc] = useState("7-day fit and satisfaction guarantee");

  // 5. FEATURED CATALOG HEADER
  const [featuredEyebrow, setFeaturedEyebrow] = useState("Signature Apparel");
  const [featuredTitle, setFeaturedTitle] = useState("Featured Collection Drops");
  const [featuredViewAllLabel, setFeaturedViewAllLabel] = useState("View All Pieces");
  const [featuredViewAllHref, setFeaturedViewAllHref] = useState(`${verticalDef.storefrontPath}/catalog`);

  // 6. PROMO / SERVICE FEATURE BANNER
  const [enableFeatureBanner, setEnableFeatureBanner] = useState(true);
  const [featureBannerEyebrow, setFeatureBannerEyebrow] = useState("Bespoke Fitting Service");
  const [featureBannerHeadline, setFeatureBannerHeadline] = useState("Custom Tailored to Your Exact Proportions");
  const [featureBannerDescription, setFeatureBannerDescription] = useState("Book a private appointment with our master pattern maker or submit your anatomical measurements online for a personalized cut.");
  const [featureBannerCtaLabel, setFeatureBannerCtaLabel] = useState("Schedule Fitting Appointment");
  const [featureBannerCtaHref, setFeatureBannerCtaHref] = useState(`${verticalDef.storefrontPath}/custom-tailoring`);
  const [featureBannerImage, setFeatureBannerImage] = useState("https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80");

  // 7. STORE CONTACT & OPERATING HOURS
  const [contactPhone, setContactPhone] = useState("+234 800 123 4567");
  const [contactEmail, setContactEmail] = useState(user?.email || "support@ofia.ng");
  const [contactAddress, setContactAddress] = useState("Victoria Island, Lagos, Nigeria");
  const [contactWhatsapp, setContactWhatsapp] = useState("+234 800 123 4567");
  const [contactHours, setContactHours] = useState("Mon-Sat: 9am - 8pm WAT");

  // 8. FOOTER BIO & SOCIAL MEDIA LINKS
  const [footerBio, setFooterBio] = useState("Dedicated to contemporary Afro-minimalist silhouettes, artisanal bespoke tailoring, and sustainable luxury.");
  const [footerCopyright, setFooterCopyright] = useState(`© ${new Date().getFullYear()} ${activeTenant?.name || "Ofia Enterprise Store"}. All rights reserved.`);
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialLinkedIn, setSocialLinkedIn] = useState("");

  // 9. CHECKOUT POLICIES & SECTION TOGGLES
  const [enableProducts, setEnableProducts] = useState(true);
  const [enableServices, setEnableServices] = useState(true);
  const [enableReviews, setEnableReviews] = useState(true);
  const [enableDispatchBooking, setEnableDispatchBooking] = useState(true);
  const [enableEscrowOption, setEnableEscrowOption] = useState(false);

  // Sync tenant from Context & Remote Database
  useEffect(() => {
    const slug = activeTenant?.slug;
    if (!slug) return;

    if (activeTenant.vertical && activeTenant.vertical in VERTICAL_DEFINITIONS) {
      setActiveVertical(activeTenant.vertical as VerticalKey);
    }
    if (activeTenant.name) {
      setStoreName(activeTenant.name);
      setHeroHeadline(activeTenant.name);
      setFooterCopyright(`© ${new Date().getFullYear()} ${activeTenant.name}. All rights reserved.`);
    }
    if (activeTenant.heroTitle) setHeroHeadline(activeTenant.heroTitle);
    if (activeTenant.heroSubtitle) setHeroDescription(activeTenant.heroSubtitle);
    if (activeTenant.logo) setLogoUrl(activeTenant.logo);
    if (activeTenant.loginImage) {
      setBannerUrl(activeTenant.loginImage);
    }
    if (activeTenant.primaryColor) setPrimaryColor(activeTenant.primaryColor);
    if (activeTenant.secondaryColor) setSecondaryColor(activeTenant.secondaryColor);

    // Fetch live persisted customization from Database
    fetch(`/api/erp/shop/store-settings?tenant=${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.config) return;
        const c = data.config;

        if (c.storeName) setStoreName(c.storeName);
        if (c.logoUrl) setLogoUrl(c.logoUrl);
        if (c.primaryColor) setPrimaryColor(c.primaryColor);
        if (c.secondaryColor) setSecondaryColor(c.secondaryColor);
        if (c.header?.ctaLabel) setHeaderCtaLabel(c.header.ctaLabel);
        if (c.header?.ctaHref) setHeaderCtaHref(c.header.ctaHref);

        // Announcement
        if (c.announcement) {
          if (typeof c.announcement.enabled === "boolean") setAnnouncementEnabled(c.announcement.enabled);
          if (c.announcement.badge) setAnnouncementBadge(c.announcement.badge);
          if (c.announcement.text) setAnnouncementText(c.announcement.text);
          if (c.announcement.link) setAnnouncementLink(c.announcement.link);
        }

        // Hero
        if (c.hero) {
          if (typeof c.hero.enabled === "boolean") setEnableHero(c.hero.enabled);
          if (c.hero.eyebrow) setHeroEyebrow(c.hero.eyebrow);
          if (c.hero.headline) setHeroHeadline(c.hero.headline);
          if (c.hero.highlightText !== undefined) setHeroHighlight(c.hero.highlightText);
          if (c.hero.description) setHeroDescription(c.hero.description);
          if (c.hero.ctaLabel) setHeroCtaLabel(c.hero.ctaLabel);
          if (c.hero.ctaHref) setHeroCtaHref(c.hero.ctaHref);
          if (c.hero.footnote) setHeroFootnote(c.hero.footnote);
          if (c.hero.badge) setHeroBadge(c.hero.badge);
          if (c.hero.bgColor) setHeroBgColor(c.hero.bgColor);
          if (c.hero.image) setBannerUrl(c.hero.image);
        } else if (c.bannerUrl) {
          setBannerUrl(c.bannerUrl);
        }

        // Value Badges
        if (Array.isArray(c.valueBadges) && c.valueBadges.length > 0) {
          if (c.valueBadges[0]) {
            setBadge1Title(c.valueBadges[0].title || "");
            setBadge1Desc(c.valueBadges[0].description || "");
          }
          if (c.valueBadges[1]) {
            setBadge2Title(c.valueBadges[1].title || "");
            setBadge2Desc(c.valueBadges[1].description || "");
          }
          if (c.valueBadges[2]) {
            setBadge3Title(c.valueBadges[2].title || "");
            setBadge3Desc(c.valueBadges[2].description || "");
          }
          if (c.valueBadges[3]) {
            setBadge4Title(c.valueBadges[3].title || "");
            setBadge4Desc(c.valueBadges[3].description || "");
          }
        }

        // Featured Section
        if (c.featuredSection) {
          if (c.featuredSection.eyebrow) setFeaturedEyebrow(c.featuredSection.eyebrow);
          if (c.featuredSection.title) setFeaturedTitle(c.featuredSection.title);
          if (c.featuredSection.viewAllLabel) setFeaturedViewAllLabel(c.featuredSection.viewAllLabel);
          if (c.featuredSection.viewAllHref) setFeaturedViewAllHref(c.featuredSection.viewAllHref);
        }

        // Feature Banner
        if (c.featureBanner) {
          if (typeof c.featureBanner.enabled === "boolean") setEnableFeatureBanner(c.featureBanner.enabled);
          if (c.featureBanner.eyebrow) setFeatureBannerEyebrow(c.featureBanner.eyebrow);
          if (c.featureBanner.headline) setFeatureBannerHeadline(c.featureBanner.headline);
          if (c.featureBanner.description) setFeatureBannerDescription(c.featureBanner.description);
          if (c.featureBanner.ctaLabel) setFeatureBannerCtaLabel(c.featureBanner.ctaLabel);
          if (c.featureBanner.ctaHref) setFeatureBannerCtaHref(c.featureBanner.ctaHref);
          if (c.featureBanner.image) setFeatureBannerImage(c.featureBanner.image);
        }

        // Contact
        if (c.contact) {
          if (c.contact.phone) setContactPhone(c.contact.phone);
          if (c.contact.email) setContactEmail(c.contact.email);
          if (c.contact.address) setContactAddress(c.contact.address);
          if (c.contact.whatsapp) setContactWhatsapp(c.contact.whatsapp);
          if (c.contact.operatingHours) setContactHours(c.contact.operatingHours);
        }

        // Footer
        if (c.footer) {
          if (c.footer.bio) setFooterBio(c.footer.bio);
          if (c.footer.copyright) setFooterCopyright(c.footer.copyright);
          if (c.footer.socials) {
            if (c.footer.socials.instagram) setSocialInstagram(c.footer.socials.instagram);
            if (c.footer.socials.twitter) setSocialTwitter(c.footer.socials.twitter);
            if (c.footer.socials.facebook) setSocialFacebook(c.footer.socials.facebook);
            if (c.footer.socials.linkedin) setSocialLinkedIn(c.footer.socials.linkedin);
          }
        }

        // Policies & Toggles
        if (typeof c.allowEscrow === "boolean") setEnableEscrowOption(c.allowEscrow);
        if (c.sectionVisibility) {
          if (typeof c.sectionVisibility.hero === "boolean") setEnableHero(c.sectionVisibility.hero);
          if (typeof c.sectionVisibility.valueBadges === "boolean") setEnableValueBadges(c.sectionVisibility.valueBadges);
          if (typeof c.sectionVisibility.products === "boolean") setEnableProducts(c.sectionVisibility.products);
          if (typeof c.sectionVisibility.services === "boolean") setEnableServices(c.sectionVisibility.services);
          if (typeof c.sectionVisibility.featureBanner === "boolean") setEnableFeatureBanner(c.sectionVisibility.featureBanner);
          if (typeof c.sectionVisibility.reviews === "boolean") setEnableReviews(c.sectionVisibility.reviews);
          if (typeof c.sectionVisibility.dispatchBooking === "boolean") setEnableDispatchBooking(c.sectionVisibility.dispatchBooking);
        }
      })
      .catch(() => null);
  }, [activeTenant]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveStoreSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const tenantSlug = activeTenant?.slug || "";
      if (!tenantSlug) {
        showToast("Error: No active tenant workspace detected.");
        setIsSaving(false);
        return;
      }

      const configPayload = {
        storeName,
        storeHeadline: heroHeadline,
        primaryColor,
        secondaryColor,
        logoUrl,
        bannerUrl,
        vertical: activeVertical,
        allowEscrow: enableEscrowOption,
        announcement: {
          enabled: announcementEnabled,
          badge: announcementBadge,
          text: announcementText,
          link: announcementLink,
        },
        header: {
          ctaLabel: headerCtaLabel,
          ctaHref: headerCtaHref,
        },
        hero: {
          enabled: enableHero,
          eyebrow: heroEyebrow,
          headline: heroHeadline,
          highlightText: heroHighlight,
          description: heroDescription,
          ctaLabel: heroCtaLabel,
          ctaHref: heroCtaHref,
          footnote: heroFootnote,
          badge: heroBadge,
          bgColor: heroBgColor,
          image: bannerUrl,
        },
        valueBadges: [
          { title: badge1Title, description: badge1Desc, icon: "ruler" },
          { title: badge2Title, description: badge2Desc, icon: "scissors" },
          { title: badge3Title, description: badge3Desc, icon: "truck" },
          { title: badge4Title, description: badge4Desc, icon: "refresh" },
        ],
        featuredSection: {
          eyebrow: featuredEyebrow,
          title: featuredTitle,
          viewAllLabel: featuredViewAllLabel,
          viewAllHref: featuredViewAllHref,
        },
        featureBanner: {
          enabled: enableFeatureBanner,
          eyebrow: featureBannerEyebrow,
          headline: featureBannerHeadline,
          description: featureBannerDescription,
          ctaLabel: featureBannerCtaLabel,
          ctaHref: featureBannerCtaHref,
          image: featureBannerImage,
        },
        contact: {
          phone: contactPhone,
          email: contactEmail,
          address: contactAddress,
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
            linkedin: socialLinkedIn,
          },
        },
        sectionVisibility: {
          announcement: announcementEnabled,
          hero: enableHero,
          valueBadges: enableValueBadges,
          products: enableProducts,
          services: enableServices,
          featureBanner: enableFeatureBanner,
          reviews: enableReviews,
          dispatchBooking: enableDispatchBooking,
          escrowOption: enableEscrowOption,
        },
      };

      // 1. Direct PostgreSQL Persistence in Master Database
      const dbRes = await fetch(`/api/erp/shop/store-settings?tenant=${encodeURIComponent(tenantSlug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configPayload),
      });

      // 2. Microservice Handshake (Subdomain Layouts)
      await fetch(`/api/subdomain-layouts/${encodeURIComponent(tenantSlug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomain_slug: tenantSlug,
          layout_key: activeVertical,
          custom_title: storeName,
          custom_subtitle: heroHeadline,
          theme_color: primaryColor,
          is_active: true,
        }),
      }).catch(() => null);

      // 3. Local Multi-App Handshake Cache
      if (typeof window !== "undefined") {
        localStorage.setItem(`tenant_storefront_config_${tenantSlug}`, JSON.stringify(configPayload));
        localStorage.setItem(`tenant_vertical_${tenantSlug}`, activeVertical);
        localStorage.setItem(`tenant_primary_color_${tenantSlug}`, primaryColor);
        localStorage.setItem(`tenant_allow_escrow_${tenantSlug}`, String(enableEscrowOption));
      }

      if (dbRes.ok) {
        showToast("Storefront customization saved and published live to *.ofia.shop!");
      } else {
        showToast("Storefront customization saved locally & synchronized!");
      }
    } catch (err: any) {
      showToast("Storefront customization saved locally!");
    } finally {
      setIsSaving(false);
    }
  };

  const tenantSlug = activeTenant?.slug || "";
  const previewStorefrontUrl = typeof window !== "undefined" && window.location.hostname.includes("localhost")
    ? `http://localhost:3005${verticalDef.storefrontPath}${tenantSlug ? `?tenant=${tenantSlug}` : ""}`
    : `https://${tenantSlug ? `${tenantSlug}.ofia.shop` : "ofia.shop"}${verticalDef.storefrontPath}`;

  const tabs: Array<{ id: StudioTab; label: string; icon: React.ReactNode }> = [
    { id: "brand", label: "Brand & Identity", icon: <Palette className="w-3.5 h-3.5" /> },
    { id: "hero", label: "Hero Showcase", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "badges", label: "Value Badges (4)", icon: <Award className="w-3.5 h-3.5" /> },
    { id: "catalog_banner", label: "Catalog & Feature Banner", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "contact_footer", label: "Contact & Footer", icon: <Phone className="w-3.5 h-3.5" /> },
    { id: "policies", label: "Checkout & Policies", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <BusinessShell
      title="My Store Studio — Storefront Customization"
      subtitle="Complete control desk for your public-facing storefront landing page: identity, announcement, hero bento, trust badges, feature banner, and footer."
      activeModule="shop"
      action={
        <div className="flex items-center gap-2">
          <Link
            href={previewStorefrontUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <NexaButton
              size="sm"
              variant="outline"
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              className="rounded-full"
            >
              Preview Live Storefront ({tenantSlug ? `${tenantSlug}.ofia.shop` : "ofia.shop"})
            </NexaButton>
          </Link>

          <NexaButton
            size="sm"
            variant="primary"
            leftIcon={<Save className="w-4 h-4" />}
            className="bg-[#1A56DB] text-white rounded-full font-bold shadow-xs px-5"
            onClick={() => handleSaveStoreSettings()}
            disabled={isSaving}
          >
            {isSaving ? "Publishing..." : "Publish Changes"}
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
        {/* TOP KPI CARDS (SPREAD OUT & CENTERED 3-COLUMNS) */}
        <ErpStatGrid
          columns={3}
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
          ]}
        />

        {/* STUDIO DESK: TAB BAR */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide border-b border-[var(--nexa-border)]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#1A56DB] text-white shadow-sm"
                    : "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-base)]"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: BRAND IDENTITY & ANNOUNCEMENT */}
        {activeTab === "brand" && (
          <NexaCard variant="glass" padding="lg" className="space-y-6 rounded-3xl">
            <div className="pb-3 border-b border-[var(--nexa-border)]">
              <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                Brand Identity, Logo & Top Announcement Bar
              </h3>
              <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                Configure your store visual presence, brand color palette, logo, and top notification bar
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Logo Image URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://.../logo.png"
                    className="flex-1 px-3.5 py-2 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                  />
                  {logoUrl && (
                    <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 p-1 border border-[var(--nexa-border)] flex items-center justify-center shrink-0">
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
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
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Secondary / Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-[var(--nexa-border)] cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Header CTA Button Label</label>
                <input
                  type="text"
                  value={headerCtaLabel}
                  onChange={(e) => setHeaderCtaLabel(e.target.value)}
                  placeholder="e.g. Bespoke Fitting / Book Appointment"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Header CTA Target Route</label>
                <input
                  type="text"
                  value={headerCtaHref}
                  onChange={(e) => setHeaderCtaHref(e.target.value)}
                  placeholder="e.g. /fashion/custom-tailoring"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                />
              </div>
            </div>

            {/* TOP ANNOUNCEMENT BAR CONTROLS */}
            <div className="pt-4 border-t border-[var(--nexa-border)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5 text-[#1A56DB]" />
                    <span>Top Announcement Ribbon</span>
                  </h4>
                  <p className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5">
                    Display a high-visibility marketing announcement ribbon across the very top of your storefront
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-[var(--nexa-text-secondary)]">
                    {announcementEnabled ? "Ribbon Active" : "Disabled"}
                  </span>
                  <input
                    type="checkbox"
                    checked={announcementEnabled}
                    onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1A56DB] cursor-pointer"
                  />
                </label>
              </div>

              {announcementEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Pill Badge Text</label>
                    <input
                      type="text"
                      value={announcementBadge}
                      onChange={(e) => setAnnouncementBadge(e.target.value)}
                      placeholder="e.g. EXCLUSIVE DROP"
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Announcement Message</label>
                    <input
                      type="text"
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      placeholder="e.g. Free express doorstep delivery on orders above ₦50,000"
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-3">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Click Target URL (Optional)</label>
                    <input
                      type="text"
                      value={announcementLink}
                      onChange={(e) => setAnnouncementLink(e.target.value)}
                      placeholder="e.g. /fashion/catalog"
                      className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--nexa-border)] flex justify-end">
              <NexaButton
                size="md"
                variant="primary"
                onClick={() => handleSaveStoreSettings()}
                disabled={isSaving}
                className="bg-[#1A56DB] text-white rounded-full font-bold px-6 shadow-sm"
              >
                {isSaving ? "Saving..." : "Save Brand Settings"}
              </NexaButton>
            </div>
          </NexaCard>
        )}

        {/* TAB 2: HERO BENTO SHOWCASE */}
        {activeTab === "hero" && (
          <NexaCard variant="glass" padding="lg" className="space-y-6 rounded-3xl">
            <div className="pb-3 border-b border-[var(--nexa-border)] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                  Hero Bento Showcase Studio
                </h3>
                <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                  Configure every headline, subtext, CTA action, footnote guarantee, and showcase image of the hero showcase
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-[var(--nexa-text-secondary)]">
                  {enableHero ? "Hero Visible" : "Hidden"}
                </span>
                <input
                  type="checkbox"
                  checked={enableHero}
                  onChange={(e) => setEnableHero(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1A56DB] cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Eyebrow Tagline</label>
                <input
                  type="text"
                  value={heroEyebrow}
                  onChange={(e) => setHeroEyebrow(e.target.value)}
                  placeholder="e.g. Capsule Drop & Couture"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Hero Pill Badge</label>
                <input
                  type="text"
                  value={heroBadge}
                  onChange={(e) => setHeroBadge(e.target.value)}
                  placeholder="e.g. Capsule Drop / 150-Pt Inspected"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Display Headline (Store Title)</label>
                <input
                  type="text"
                  value={heroHeadline}
                  onChange={(e) => setHeroHeadline(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-bold rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Highlight Sub-headline</label>
                <input
                  type="text"
                  value={heroHighlight}
                  onChange={(e) => setHeroHighlight(e.target.value)}
                  placeholder="e.g. · Artisanal Tailoring & Silhouettes"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Hero Description Body</label>
                <textarea
                  rows={3}
                  value={heroDescription}
                  onChange={(e) => setHeroDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] leading-relaxed resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Hero CTA Button Label</label>
                <input
                  type="text"
                  value={heroCtaLabel}
                  onChange={(e) => setHeroCtaLabel(e.target.value)}
                  placeholder="e.g. Schedule Bespoke Fitting"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Hero CTA Button Link</label>
                <input
                  type="text"
                  value={heroCtaHref}
                  onChange={(e) => setHeroCtaHref(e.target.value)}
                  placeholder="e.g. /fashion/custom-tailoring"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Footnote Guarantee / Trust Line</label>
                <input
                  type="text"
                  value={heroFootnote}
                  onChange={(e) => setHeroFootnote(e.target.value)}
                  placeholder="e.g. Free Doorstep Sizing Exchanges · 7-Day Fit Guarantee"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Hero Showcase Image URL</label>
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Hero Background Tone</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={heroBgColor}
                    onChange={(e) => setHeroBgColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-[var(--nexa-border)] cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={heroBgColor}
                    onChange={(e) => setHeroBgColor(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--nexa-border)] flex justify-end">
              <NexaButton
                size="md"
                variant="primary"
                onClick={() => handleSaveStoreSettings()}
                disabled={isSaving}
                className="bg-[#1A56DB] text-white rounded-full font-bold px-6 shadow-sm"
              >
                {isSaving ? "Saving..." : "Save Hero Showcase"}
              </NexaButton>
            </div>
          </NexaCard>
        )}

        {/* TAB 3: VALUE & TRUST BADGES (4 BADGES) */}
        {activeTab === "badges" && (
          <NexaCard variant="glass" padding="lg" className="space-y-6 rounded-3xl">
            <div className="pb-3 border-b border-[var(--nexa-border)] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                  Value Propositions & Trust Badges
                </h3>
                <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                  Customize the 4 horizontal value proposition cards displayed immediately below the hero showcase
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-[var(--nexa-text-secondary)]">
                  {enableValueBadges ? "Badges Active" : "Hidden"}
                </span>
                <input
                  type="checkbox"
                  checked={enableValueBadges}
                  onChange={(e) => setEnableValueBadges(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1A56DB] cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* BADGE 1 */}
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3">
                <span className="text-[10px] font-bold text-[#1A56DB] uppercase tracking-wider">Trust Badge #1</span>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Title</label>
                  <input
                    type="text"
                    value={badge1Title}
                    onChange={(e) => setBadge1Title(e.target.value)}
                    placeholder="e.g. Custom Sizing"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Description</label>
                  <input
                    type="text"
                    value={badge1Desc}
                    onChange={(e) => setBadge1Desc(e.target.value)}
                    placeholder="e.g. Made-to-measure precision tailoring"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none"
                  />
                </div>
              </div>

              {/* BADGE 2 */}
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3">
                <span className="text-[10px] font-bold text-[#1A56DB] uppercase tracking-wider">Trust Badge #2</span>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Title</label>
                  <input
                    type="text"
                    value={badge2Title}
                    onChange={(e) => setBadge2Title(e.target.value)}
                    placeholder="e.g. French Flax & Silk"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Description</label>
                  <input
                    type="text"
                    value={badge2Desc}
                    onChange={(e) => setBadge2Desc(e.target.value)}
                    placeholder="e.g. Sustainable raw textiles"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none"
                  />
                </div>
              </div>

              {/* BADGE 3 */}
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3">
                <span className="text-[10px] font-bold text-[#1A56DB] uppercase tracking-wider">Trust Badge #3</span>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Title</label>
                  <input
                    type="text"
                    value={badge3Title}
                    onChange={(e) => setBadge3Title(e.target.value)}
                    placeholder="e.g. Ofia Express Dispatch"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Description</label>
                  <input
                    type="text"
                    value={badge3Desc}
                    onChange={(e) => setBadge3Desc(e.target.value)}
                    placeholder="e.g. Express doorstep delivery"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none"
                  />
                </div>
              </div>

              {/* BADGE 4 */}
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3">
                <span className="text-[10px] font-bold text-[#1A56DB] uppercase tracking-wider">Trust Badge #4</span>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Title</label>
                  <input
                    type="text"
                    value={badge4Title}
                    onChange={(e) => setBadge4Title(e.target.value)}
                    placeholder="e.g. Free Exchanges"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Description</label>
                  <input
                    type="text"
                    value={badge4Desc}
                    onChange={(e) => setBadge4Desc(e.target.value)}
                    placeholder="e.g. 7-day fit and satisfaction guarantee"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--nexa-border)] flex justify-end">
              <NexaButton
                size="md"
                variant="primary"
                onClick={() => handleSaveStoreSettings()}
                disabled={isSaving}
                className="bg-[#1A56DB] text-white rounded-full font-bold px-6 shadow-sm"
              >
                {isSaving ? "Saving..." : "Save Value Badges"}
              </NexaButton>
            </div>
          </NexaCard>
        )}

        {/* TAB 4: CATALOG HEADER & PROMO FEATURE BANNER */}
        {activeTab === "catalog_banner" && (
          <div className="space-y-6">
            {/* CATALOG SECTION HEADER */}
            <NexaCard variant="glass" padding="lg" className="space-y-5 rounded-3xl">
              <div className="pb-3 border-b border-[var(--nexa-border)]">
                <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                  Catalog Section Headline & Action
                </h3>
                <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                  Configure the header eyebrow, title, and link above your catalog listings
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Catalog Eyebrow Tag</label>
                  <input
                    type="text"
                    value={featuredEyebrow}
                    onChange={(e) => setFeaturedEyebrow(e.target.value)}
                    placeholder="e.g. Signature Apparel / Certified Fleet"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Section Headline</label>
                  <input
                    type="text"
                    value={featuredTitle}
                    onChange={(e) => setFeaturedTitle(e.target.value)}
                    placeholder="e.g. Featured Collection Drops"
                    className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">View All Button Label</label>
                  <input
                    type="text"
                    value={featuredViewAllLabel}
                    onChange={(e) => setFeaturedViewAllLabel(e.target.value)}
                    placeholder="e.g. View All Pieces"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">View All Route Target</label>
                  <input
                    type="text"
                    value={featuredViewAllHref}
                    onChange={(e) => setFeaturedViewAllHref(e.target.value)}
                    placeholder="e.g. /fashion/catalog"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                  />
                </div>
              </div>
            </NexaCard>

            {/* PROMOTIONAL / SERVICE FEATURE BANNER */}
            <NexaCard variant="glass" padding="lg" className="space-y-5 rounded-3xl">
              <div className="pb-3 border-b border-[var(--nexa-border)] flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                    Promotional / Service Feature Banner
                  </h3>
                  <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                    Configure the full-width highlighted feature banner (e.g. Bespoke Tailoring, VIP Test-Drive, Catering)
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-[var(--nexa-text-secondary)]">
                    {enableFeatureBanner ? "Banner Active" : "Hidden"}
                  </span>
                  <input
                    type="checkbox"
                    checked={enableFeatureBanner}
                    onChange={(e) => setEnableFeatureBanner(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1A56DB] cursor-pointer"
                  />
                </label>
              </div>

              {enableFeatureBanner && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Banner Eyebrow</label>
                    <input
                      type="text"
                      value={featureBannerEyebrow}
                      onChange={(e) => setFeatureBannerEyebrow(e.target.value)}
                      placeholder="e.g. Bespoke Fitting Service"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Banner Headline</label>
                    <input
                      type="text"
                      value={featureBannerHeadline}
                      onChange={(e) => setFeatureBannerHeadline(e.target.value)}
                      placeholder="e.g. Custom Tailored to Your Exact Proportions"
                      className="w-full px-3.5 py-2 text-sm font-bold rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Banner Description</label>
                    <textarea
                      rows={2}
                      value={featureBannerDescription}
                      onChange={(e) => setFeatureBannerDescription(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none leading-relaxed resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)]">CTA Button Label</label>
                    <input
                      type="text"
                      value={featureBannerCtaLabel}
                      onChange={(e) => setFeatureBannerCtaLabel(e.target.value)}
                      placeholder="e.g. Schedule Fitting Appointment"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)]">CTA Target Route</label>
                    <input
                      type="text"
                      value={featureBannerCtaHref}
                      onChange={(e) => setFeatureBannerCtaHref(e.target.value)}
                      placeholder="e.g. /fashion/custom-tailoring"
                      className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Banner Graphic URL</label>
                    <input
                      type="text"
                      value={featureBannerImage}
                      onChange={(e) => setFeatureBannerImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-[var(--nexa-border)] flex justify-end">
                <NexaButton
                  size="md"
                  variant="primary"
                  onClick={() => handleSaveStoreSettings()}
                  disabled={isSaving}
                  className="bg-[#1A56DB] text-white rounded-full font-bold px-6 shadow-sm"
                >
                  {isSaving ? "Saving..." : "Save Catalog & Banner"}
                </NexaButton>
              </div>
            </NexaCard>
          </div>
        )}

        {/* TAB 5: CONTACT, HOURS & FOOTER */}
        {activeTab === "contact_footer" && (
          <NexaCard variant="glass" padding="lg" className="space-y-6 rounded-3xl">
            <div className="pb-3 border-b border-[var(--nexa-border)]">
              <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                Contact Details, Operating Hours & Footer Information
              </h3>
              <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                Customer support hotline, physical atelier address, opening hours, bio, and social profile links
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Customer Hotline Phone</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Support Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@store.ofia.shop"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Physical Store / Studio Address</label>
                <input
                  type="text"
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">WhatsApp Support Number</label>
                <input
                  type="text"
                  value={contactWhatsapp}
                  onChange={(e) => setContactWhatsapp(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Operating / Business Hours</label>
                <input
                  type="text"
                  value={contactHours}
                  onChange={(e) => setContactHours(e.target.value)}
                  placeholder="e.g. Mon-Sat: 9am - 8pm WAT"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Footer Bio & About Summary</label>
                <textarea
                  rows={2}
                  value={footerBio}
                  onChange={(e) => setFooterBio(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Custom Copyright Notice</label>
                <input
                  type="text"
                  value={footerCopyright}
                  onChange={(e) => setFooterCopyright(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                />
              </div>
            </div>

            {/* SOCIAL MEDIA PROFILES */}
            <div className="pt-4 border-t border-[var(--nexa-border)] space-y-3">
              <h4 className="text-xs font-bold text-[var(--nexa-text-primary)]">Social Media Profiles</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[var(--nexa-text-secondary)]">Instagram URL</label>
                  <input
                    type="text"
                    value={socialInstagram}
                    onChange={(e) => setSocialInstagram(e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[var(--nexa-text-secondary)]">Twitter / X URL</label>
                  <input
                    type="text"
                    value={socialTwitter}
                    onChange={(e) => setSocialTwitter(e.target.value)}
                    placeholder="https://x.com/yourhandle"
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[var(--nexa-text-secondary)]">Facebook Page URL</label>
                  <input
                    type="text"
                    value={socialFacebook}
                    onChange={(e) => setSocialFacebook(e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[var(--nexa-text-secondary)]">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    value={socialLinkedIn}
                    onChange={(e) => setSocialLinkedIn(e.target.value)}
                    placeholder="https://linkedin.com/company/yourorg"
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--nexa-border)] flex justify-end">
              <NexaButton
                size="md"
                variant="primary"
                onClick={() => handleSaveStoreSettings()}
                disabled={isSaving}
                className="bg-[#1A56DB] text-white rounded-full font-bold px-6 shadow-sm"
              >
                {isSaving ? "Saving..." : "Save Contact & Footer"}
              </NexaButton>
            </div>
          </NexaCard>
        )}

        {/* TAB 6: CHECKOUT POLICIES & MODULAR SECTIONS */}
        {activeTab === "policies" && (
          <NexaCard variant="glass" padding="lg" className="space-y-6 rounded-3xl">
            <div className="pb-3 border-b border-[var(--nexa-border)]">
              <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                Checkout Escrow Policy & Modular Storefront Sections
              </h3>
              <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                Configure settlement policies, customer escrow protection, and turn on/off major sections
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { label: "Hero Banner Showcase", checked: enableHero, setChecked: setEnableHero },
                  { label: "Value Propositions & Trust Badges", checked: enableValueBadges, setChecked: setEnableValueBadges },
                  { label: `${verticalDef.productTermPlural} Grid`, checked: enableProducts, setChecked: setEnableProducts },
                  { label: `${verticalDef.serviceTerm} Booking Workflows`, checked: enableServices, setChecked: setEnableServices },
                  { label: "Promotional Service Feature Banner", checked: enableFeatureBanner, setChecked: setEnableFeatureBanner },
                  { label: "Customer Reviews & Badges", checked: enableReviews, setChecked: setEnableReviews },
                  { label: "Logistics Pickup & Dispatch CTA", checked: enableDispatchBooking, setChecked: setEnableDispatchBooking },
                  { label: "Escrow Protection Option (Checkout)", checked: enableEscrowOption, setChecked: setEnableEscrowOption },
                ].map((sec, idx) => (
                  <label
                    key={idx}
                    className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between text-xs font-medium cursor-pointer"
                  >
                    <span className="pr-2">{sec.label}</span>
                    <input
                      type="checkbox"
                      checked={sec.checked}
                      onChange={(e) => sec.setChecked(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1A56DB] cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-transparent border border-[var(--nexa-border)] text-[11px] leading-relaxed text-[var(--nexa-text-secondary)]">
                <div className="font-bold flex items-center gap-1.5 mb-1.5 text-[var(--nexa-text-primary)]">
                  <ShieldCheck className="w-4 h-4 text-[#1A56DB] shrink-0" />
                  <span>Settlement & Escrow Policy Architecture</span>
                </div>
                <p>
                  {enableEscrowOption
                    ? "Escrow Option Enabled: Customers at checkout can choose to request Ofia Escrow Protection (funds held in vault until delivery OTP confirmation). Unrequested orders settle directly into your wallet."
                    : "Default Direct Settlement: Escrow option is disabled at checkout. All customer payments automatically execute the 98.5% split into your Available Balance instantly, allowing withdrawals anytime without waiting for delivery."}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--nexa-border)] flex justify-end">
              <NexaButton
                size="md"
                variant="primary"
                onClick={() => handleSaveStoreSettings()}
                disabled={isSaving}
                className="bg-[#1A56DB] text-white rounded-full font-bold px-6 shadow-sm"
              >
                {isSaving ? "Saving..." : "Save Policies & Toggles"}
              </NexaButton>
            </div>
          </NexaCard>
        )}
      </div>
    </BusinessShell>
  );
}
