"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Plus,
  Trash2,
  Edit,
  X,
  Tag,
  CheckSquare,
  Square,
  ChevronRight,
  Upload,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaModal } from "@/components/nexa/NexaModal";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";
import {
  VERTICAL_DEFINITIONS,
  VerticalKey,
  getStorefrontUrl,
  AFRICAN_PRINT_PRESETS,
} from "@/lib/verticals";

type StudioTab = "branding" | "hero" | "taxonomy" | "badges" | "footer" | "policies";

export interface CustomCollectionItem {
  id: string;
  name: string;
  description?: string;
  season?: string;
  images: string[];
  productIds?: string[];
  isHero1?: boolean;
  isHero2?: boolean;
}

export interface CustomCategoryItem {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export interface CustomAfricanPrintItem {
  id: string;
  name: string;
  image: string;
  description?: string;
}

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
  const [season, setSeason] = useState("Harmattan / Resort 2026");
  const [collectionName, setCollectionName] = useState("Heritage Noir Capsule");
  const [collectionDescription, setCollectionDescription] = useState(
    "Curated hand-embroidered tunics, bespoke two-pieces, and structured seasonal outerwear."
  );
  const [primaryColor, setPrimaryColor] = useState("#1A56DB");
  const [badges, setBadges] = useState<string[]>([
    `${currentVerticalDef.name} Certified`,
    "Express Delivery",
    "Verified Escrow Protection",
  ]);
  const [newBadgeInput, setNewBadgeInput] = useState("");

  // Hero Featured Collections (2 Collections with sliding cover images)
  const [hero1Title, setHero1Title] = useState("Vida Collection");
  const [hero1Count, setHero1Count] = useState("Exclusive 12+ pieces");
  const [hero1Href, setHero1Href] = useState("/fashion/catalog?collection=vida");
  const [hero1Images, setHero1Images] = useState<string[]>([
    "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
  ]);
  const [hero1ProductIds, setHero1ProductIds] = useState<string[]>([]);
  const [newHero1ImageInput, setNewHero1ImageInput] = useState("");

  const [hero2Title, setHero2Title] = useState("Adetola Collection");
  const [hero2Count, setHero2Count] = useState("Artisanal 16+ pieces");
  const [hero2Href, setHero2Href] = useState("/fashion/catalog?collection=adetola");
  const [hero2Images, setHero2Images] = useState<string[]>([
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
  ]);
  const [hero2ProductIds, setHero2ProductIds] = useState<string[]>([]);
  const [newHero2ImageInput, setNewHero2ImageInput] = useState("");

  // Custom Collections, Categories & African Prints
  const [collectionsList, setCollectionsList] = useState<CustomCollectionItem[]>([
    {
      id: "col-vida",
      name: "Vida Collection",
      description: "Artisanal resort silhouettes and bespoke linen tunics.",
      season: "Harmattan / Resort 2026",
      images: [
        "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
      ],
      isHero1: true,
    },
    {
      id: "col-adetola",
      name: "Adetola Collection",
      description: "Hand-embroidered ceremonial kaftans and agbada two-pieces.",
      season: "Harmattan / Resort 2026",
      images: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
      ],
      isHero2: true,
    },
    {
      id: "col-heritage-noir",
      name: "Heritage Noir Capsule",
      description: "Raw indigo textiles paired with obsidian embroidery.",
      season: "Resort 2026",
      images: [
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80",
      ],
    },
  ]);

  const [categoriesList, setCategoriesList] = useState<CustomCategoryItem[]>([
    { id: "cat-1", name: "African Heritage", description: "Ceremonial textiles, hand-dyed damask, and heritage silks" },
    { id: "cat-2", name: "Couture & Tailoring", description: "Bespoke architectural suits and structured tunics" },
    { id: "cat-3", name: "Ceremonial Wear", description: "Royal agbadas, festive two-pieces, and wedding attire" },
    { id: "cat-4", name: "Casual Luxury", description: "Breathable linen shirts, drawstring trousers, and resort slips" },
    { id: "cat-5", name: "Bespoke Two-Pieces", description: "Coordinated separates cut from matched print textiles" },
  ]);

  const [africanPrintsList, setAfricanPrintsList] = useState<CustomAfricanPrintItem[]>(
    AFRICAN_PRINT_PRESETS.map((p, idx) => ({
      id: `print-preset-${idx + 1}`,
      name: p.name,
      image: p.image,
      description: p.description,
    }))
  );

  // Live Catalog Products (for design selection)
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);

  // Modals for CRUD
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CustomCollectionItem | null>(null);
  const [colModalName, setColModalName] = useState("");
  const [colModalDesc, setColModalDesc] = useState("");
  const [colModalSeason, setColModalSeason] = useState("");
  const [colModalImages, setColModalImages] = useState<string[]>([]);
  const [colModalImageInput, setColModalImageInput] = useState("");

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomCategoryItem | null>(null);
  const [catModalName, setCatModalName] = useState("");
  const [catModalDesc, setCatModalDesc] = useState("");
  const [catModalImage, setCatModalImage] = useState("");

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [editingPrint, setEditingPrint] = useState<CustomAfricanPrintItem | null>(null);
  const [printModalName, setPrintModalName] = useState("");
  const [printModalImage, setPrintModalImage] = useState("");
  const [printModalDesc, setPrintModalDesc] = useState("");

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
        if (cfg.season || cfg.hero?.season) setSeason(cfg.season || cfg.hero?.season);
        if (cfg.collectionName || cfg.hero?.collectionName) setCollectionName(cfg.collectionName || cfg.hero?.collectionName);
        if (cfg.collectionDescription || cfg.hero?.collectionDescription) setCollectionDescription(cfg.collectionDescription || cfg.hero?.collectionDescription);
        if (cfg.primaryColor) setPrimaryColor(cfg.primaryColor);
        if (Array.isArray(cfg.badges) && cfg.badges.length > 0) setBadges(cfg.badges);

        // Hydrate Hero Featured Collections
        if (cfg.collections?.card1) {
          const c1 = cfg.collections.card1;
          if (c1.title) setHero1Title(c1.title);
          if (c1.count) setHero1Count(c1.count);
          if (c1.href) setHero1Href(c1.href);
          if (Array.isArray(c1.images) && c1.images.length > 0) setHero1Images(c1.images);
          if (Array.isArray(c1.productIds)) setHero1ProductIds(c1.productIds);
        }
        if (cfg.collections?.card2) {
          const c2 = cfg.collections.card2;
          if (c2.title) setHero2Title(c2.title);
          if (c2.count) setHero2Count(c2.count);
          if (c2.href) setHero2Href(c2.href);
          if (Array.isArray(c2.images) && c2.images.length > 0) setHero2Images(c2.images);
          if (Array.isArray(c2.productIds)) setHero2ProductIds(c2.productIds);
        }

        // Hydrate Collections List, Categories, African Prints
        if (Array.isArray(cfg.collectionsList)) {
          setCollectionsList(cfg.collectionsList);
        }
        if (Array.isArray(cfg.categories)) {
          setCategoriesList(cfg.categories);
        }
        if (Array.isArray(cfg.africanPrints)) {
          setAfricanPrintsList(cfg.africanPrints);
        }

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

  // Load catalog products for design selection
  useEffect(() => {
    const slug = activeTenant?.slug || (verticalKey === "fashion" ? "funmyclothing" : "reedbreed");
    fetch(`/api/erp/shop/products?tenant=${encodeURIComponent(slug)}&vertical=${encodeURIComponent(verticalKey)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.products)) {
          setCatalogProducts(data.products);
        }
      })
      .catch(() => {});
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

  // Toggle attaching a catalog product cover to Hero Collection 1
  const toggleHero1Product = (prod: any) => {
    const img = (prod.images && prod.images[0]) || prod.image;
    if (!img) return;

    if (hero1ProductIds.includes(prod.id)) {
      setHero1ProductIds(hero1ProductIds.filter((id) => id !== prod.id));
      setHero1Images(hero1Images.filter((src) => src !== img));
    } else {
      setHero1ProductIds([...hero1ProductIds, prod.id]);
      if (!hero1Images.includes(img)) {
        setHero1Images([...hero1Images, img]);
      }
    }
  };

  // Toggle attaching a catalog product cover to Hero Collection 2
  const toggleHero2Product = (prod: any) => {
    const img = (prod.images && prod.images[0]) || prod.image;
    if (!img) return;

    if (hero2ProductIds.includes(prod.id)) {
      setHero2ProductIds(hero2ProductIds.filter((id) => id !== prod.id));
      setHero2Images(hero2Images.filter((src) => src !== img));
    } else {
      setHero2ProductIds([...hero2ProductIds, prod.id]);
      if (!hero2Images.includes(img)) {
        setHero2Images([...hero2Images, img]);
      }
    }
  };

  // Set collection from taxonomy list as Hero 1 or Hero 2
  const assignHeroCollection = (col: CustomCollectionItem, slot: 1 | 2) => {
    if (slot === 1) {
      setHero1Title(col.name);
      setHero1Count(col.season || `${col.images.length} pieces`);
      setHero1Href(`/fashion/catalog?collection=${encodeURIComponent(col.name.toLowerCase().replace(/\s+/g, "-"))}`);
      if (col.images && col.images.length > 0) {
        setHero1Images(col.images);
      }
      setCollectionsList((prev) =>
        prev.map((c) => ({
          ...c,
          isHero1: c.id === col.id,
          isHero2: c.id === col.id ? false : c.isHero2,
        }))
      );
    } else {
      setHero2Title(col.name);
      setHero2Count(col.season || `${col.images.length} pieces`);
      setHero2Href(`/fashion/catalog?collection=${encodeURIComponent(col.name.toLowerCase().replace(/\s+/g, "-"))}`);
      if (col.images && col.images.length > 0) {
        setHero2Images(col.images);
      }
      setCollectionsList((prev) =>
        prev.map((c) => ({
          ...c,
          isHero2: c.id === col.id,
          isHero1: c.id === col.id ? false : c.isHero1,
        }))
      );
    }
    setToastMessage(`Assigned "${col.name}" to Hero Slot ${slot}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // CRUD for Collections
  const handleOpenCollectionModal = (col?: CustomCollectionItem) => {
    if (col) {
      setEditingCollection(col);
      setColModalName(col.name);
      setColModalDesc(col.description || "");
      setColModalSeason(col.season || "");
      setColModalImages(col.images || []);
    } else {
      setEditingCollection(null);
      setColModalName("");
      setColModalDesc("");
      setColModalSeason(season);
      setColModalImages([]);
    }
    setColModalImageInput("");
    setIsCollectionModalOpen(true);
  };

  const [isUploadingPrintSwatch, setIsUploadingPrintSwatch] = useState(false);

  const handleUploadPrintModalImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPrintSwatch(true);
    try {
      const slug = activeTenant?.slug || (verticalKey === "fashion" ? "funmyclothing" : "reedbreed");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tenantSlug", slug);
      formData.append("folder", "fabric_swatches");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data?.url) {
        setPrintModalImage(data.url);
      }
    } catch (err) {
      console.error("Print swatch upload failed:", err);
    } finally {
      setIsUploadingPrintSwatch(false);
    }
  };

  const persistTaxonomyField = async (field: "africanPrints" | "categories" | "collectionsList", data: any[]) => {
    const slug = activeTenant?.slug || (verticalKey === "fashion" ? "funmyclothing" : "reedbreed");
    try {
      await fetch(`/api/erp/shop/store-settings?tenant=${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          vertical: verticalKey,
          [field]: data,
        }),
      });
      setToastMessage("Taxonomy updated & saved live to database!");
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error(`Auto-save error for ${field}:`, err);
    }
  };

  const handleSaveCollectionModal = async () => {
    if (!colModalName.trim()) return;
    let updated: CustomCollectionItem[];
    if (editingCollection) {
      updated = collectionsList.map((c) =>
        c.id === editingCollection.id
          ? {
              ...c,
              name: colModalName.trim(),
              description: colModalDesc.trim(),
              season: colModalSeason.trim(),
              images: colModalImages,
            }
          : c
      );
    } else {
      const newCol: CustomCollectionItem = {
        id: `col_${Date.now()}`,
        name: colModalName.trim(),
        description: colModalDesc.trim(),
        season: colModalSeason.trim(),
        images: colModalImages.length > 0 ? colModalImages : [hero1Images[0] || "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80"],
      };
      updated = [...collectionsList, newCol];
    }
    setCollectionsList(updated);
    setIsCollectionModalOpen(false);
    await persistTaxonomyField("collectionsList", updated);
  };

  const handleDeleteCollection = async (id: string) => {
    const updated = collectionsList.filter((c) => c.id !== id);
    setCollectionsList(updated);
    await persistTaxonomyField("collectionsList", updated);
  };

  // CRUD for Categories
  const handleOpenCategoryModal = (cat?: CustomCategoryItem) => {
    if (cat) {
      setEditingCategory(cat);
      setCatModalName(cat.name);
      setCatModalDesc(cat.description || "");
      setCatModalImage(cat.image || "");
    } else {
      setEditingCategory(null);
      setCatModalName("");
      setCatModalDesc("");
      setCatModalImage("");
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategoryModal = async () => {
    if (!catModalName.trim()) return;
    let updated: CustomCategoryItem[];
    if (editingCategory) {
      updated = categoriesList.map((c) =>
        c.id === editingCategory.id
          ? { ...c, name: catModalName.trim(), description: catModalDesc.trim(), image: catModalImage.trim() }
          : c
      );
    } else {
      const newCat: CustomCategoryItem = {
        id: `cat_${Date.now()}`,
        name: catModalName.trim(),
        description: catModalDesc.trim(),
        image: catModalImage.trim(),
      };
      updated = [...categoriesList, newCat];
    }
    setCategoriesList(updated);
    setIsCategoryModalOpen(false);
    await persistTaxonomyField("categories", updated);
  };

  const handleDeleteCategory = async (id: string) => {
    const updated = categoriesList.filter((c) => c.id !== id);
    setCategoriesList(updated);
    await persistTaxonomyField("categories", updated);
  };

  // CRUD for African Prints
  const handleOpenPrintModal = (prt?: CustomAfricanPrintItem) => {
    if (prt) {
      setEditingPrint(prt);
      setPrintModalName(prt.name);
      setPrintModalImage(prt.image);
      setPrintModalDesc(prt.description || "");
    } else {
      setEditingPrint(null);
      setPrintModalName("");
      setPrintModalImage("");
      setPrintModalDesc("");
    }
    setIsPrintModalOpen(true);
  };

  const handleSavePrintModal = async () => {
    if (!printModalName.trim()) return;
    const finalImg =
      printModalImage.trim() ||
      "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80";

    let updated: CustomAfricanPrintItem[];
    if (editingPrint) {
      updated = africanPrintsList.map((p) =>
        p.id === editingPrint.id
          ? { ...p, name: printModalName.trim(), image: finalImg, description: printModalDesc.trim() }
          : p
      );
    } else {
      const newPrt: CustomAfricanPrintItem = {
        id: `print_${Date.now()}`,
        name: printModalName.trim(),
        image: finalImg,
        description: printModalDesc.trim(),
      };
      updated = [...africanPrintsList, newPrt];
    }
    setAfricanPrintsList(updated);
    setIsPrintModalOpen(false);
    await persistTaxonomyField("africanPrints", updated);
  };

  const handleDeletePrint = async (id: string) => {
    const updated = africanPrintsList.filter((p) => p.id !== id);
    setAfricanPrintsList(updated);
    await persistTaxonomyField("africanPrints", updated);
  };

  // Save everything to Neon Database
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
      season,
      collectionName,
      collectionDescription,
      primaryColor,
      badges,
      collections: {
        card1: {
          title: hero1Title,
          count: hero1Count,
          href: hero1Href,
          images: hero1Images,
          image: hero1Images[0] || "",
          productIds: hero1ProductIds,
        },
        card2: {
          title: hero2Title,
          count: hero2Count,
          href: hero2Href,
          images: hero2Images,
          image: hero2Images[0] || "",
          productIds: hero2ProductIds,
        },
      },
      collectionsList,
      categories: categoriesList,
      africanPrints: africanPrintsList,
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
        setToastMessage("Storefront studio, collections & taxonomy saved successfully!");
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

  const storefrontLiveUrl = getStorefrontUrl(verticalKey, activeTenant);

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
            <NexaButton size="sm" variant="outline" leftIcon={<ExternalLink className="w-3.5 h-3.5" />} className="rounded-full cursor-pointer">
              Preview Store
            </NexaButton>
          </a>

          <NexaButton
            size="sm"
            variant="primary"
            onClick={handleSaveSettings}
            disabled={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
            className="rounded-full bg-[#1A56DB] text-white font-bold cursor-pointer"
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
            { id: "hero", label: "Hero Banner & Collections", icon: <Layout className="w-3.5 h-3.5" /> },
            { id: "taxonomy", label: "Prints, Categories & Collections", icon: <Layers className="w-3.5 h-3.5" /> },
            { id: "badges", label: "Trust Badges", icon: <Award className="w-3.5 h-3.5" /> },
            { id: "footer", label: "Footer & Contact", icon: <Phone className="w-3.5 h-3.5" /> },
            { id: "policies", label: "Store Policies", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudioTab)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
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
                    className="w-10 h-10 rounded-xl cursor-pointer border border-[var(--nexa-border)]"
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

        {/* TAB 2: HERO BANNER & 2 FEATURED COLLECTIONS */}
        {activeTab === "hero" && (
          <div className="space-y-6 max-w-4xl">
            {/* Main Hero Copy */}
            <NexaCard variant="glass" padding="lg" className="rounded-3xl border border-[var(--nexa-border)] space-y-4">
              <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                Hero Banner Copy & Runway Story
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
                    rows={2}
                    value={heroSubheading}
                    onChange={(e) => setHeroSubheading(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-medium text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                  <div>
                    <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                      Season / Runway Drop Badge
                    </label>
                    <input
                      type="text"
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      placeholder="e.g. Harmattan / Resort 2026"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                    />
                  </div>
                </div>
              </div>
            </NexaCard>

            {/* 2 FEATURED COLLECTIONS FOR HERO SECTION */}
            <NexaCard variant="glass" padding="lg" className="rounded-3xl border border-[var(--nexa-border)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--nexa-border)] pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Hero Featured Collections (2 Dynamic Slots)</span>
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-secondary)] mt-0.5">
                    Select 2 collections to feature in the hero bento grid. Each card dynamically slides cover images of designs in that collection.
                  </p>
                </div>
                <NexaBadge variant="brand" size="sm" className="rounded-full w-fit">
                  Live Carousel Active
                </NexaBadge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SLOT 1: FEATURED COLLECTION 1 (e.g. Vida Collection) */}
                <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Hero Slot 1
                    </span>
                    <span className="text-[11px] text-[var(--nexa-text-muted)] font-semibold">
                      {hero1Images.length} Sliding Cover{hero1Images.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                        Collection Name
                      </label>
                      <input
                        type="text"
                        value={hero1Title}
                        onChange={(e) => setHero1Title(e.target.value)}
                        placeholder="e.g. Vida Collection"
                        className="w-full px-3 py-1.5 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] font-bold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                        Subtitle / Piece Count
                      </label>
                      <input
                        type="text"
                        value={hero1Count}
                        onChange={(e) => setHero1Count(e.target.value)}
                        placeholder="e.g. Exclusive 12+ pieces"
                        className="w-full px-3 py-1.5 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                        Catalog Link
                      </label>
                      <input
                        type="text"
                        value={hero1Href}
                        onChange={(e) => setHero1Href(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] font-mono text-[11px] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                      />
                    </div>

                    {/* Sliding Cover Images Preview */}
                    <div>
                      <label className="block font-bold text-[var(--nexa-text-primary)] mb-1.5">
                        Sliding Design Covers ({hero1Images.length})
                      </label>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {hero1Images.map((img, idx) => (
                          <div key={idx} className="relative group/cover shrink-0 w-16 h-20 rounded-xl overflow-hidden border border-[var(--nexa-border)] bg-stone-100">
                            <img src={img} alt={`Slot 1 cover ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setHero1Images(hero1Images.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] opacity-0 group-hover/cover:opacity-100 transition cursor-pointer"
                              title="Remove cover"
                            >
                              ×
                            </button>
                            <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-black/50 text-[9px] text-white font-mono">
                              {idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Add Image URL */}
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          value={newHero1ImageInput}
                          onChange={(e) => setNewHero1ImageInput(e.target.value)}
                          placeholder="Paste design image URL..."
                          className="flex-1 px-3 py-1 text-[11px] rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newHero1ImageInput.trim()) {
                              setHero1Images([...hero1Images, newHero1ImageInput.trim()]);
                              setNewHero1ImageInput("");
                            }
                          }}
                          className="px-3 py-1 rounded-xl bg-[#1A56DB] text-white text-[11px] font-bold cursor-pointer shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Quick Pick Designs from Live Catalog */}
                    {catalogProducts.length > 0 && (
                      <div className="pt-2 border-t border-[var(--nexa-border)]">
                        <label className="block font-bold text-[11px] text-[var(--nexa-text-muted)] mb-1.5 uppercase">
                          Click Catalog Designs to Include in Slider
                        </label>
                        <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                          {catalogProducts.map((p) => {
                            const isSelected = hero1ProductIds.includes(p.id);
                            const img = (p.images && p.images[0]) || p.image;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => toggleHero1Product(p)}
                                className={`w-full flex items-center gap-2 p-1.5 rounded-xl border text-left transition cursor-pointer ${
                                  isSelected
                                    ? "bg-blue-500/10 border-blue-500/40 text-[var(--nexa-text-primary)]"
                                    : "bg-[var(--nexa-bg-surface)] border-transparent hover:border-[var(--nexa-border)] text-[var(--nexa-text-secondary)]"
                                }`}
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                )}
                                {img && (
                                  <img src={img} alt={p.name} className="w-6 h-6 rounded-md object-cover shrink-0" />
                                )}
                                <span className="text-[11px] font-medium truncate flex-1">{p.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SLOT 2: FEATURED COLLECTION 2 (e.g. Adetola Collection) */}
                <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                      Hero Slot 2
                    </span>
                    <span className="text-[11px] text-[var(--nexa-text-muted)] font-semibold">
                      {hero2Images.length} Sliding Cover{hero2Images.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                        Collection Name
                      </label>
                      <input
                        type="text"
                        value={hero2Title}
                        onChange={(e) => setHero2Title(e.target.value)}
                        placeholder="e.g. Adetola Collection"
                        className="w-full px-3 py-1.5 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] font-bold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                        Subtitle / Piece Count
                      </label>
                      <input
                        type="text"
                        value={hero2Count}
                        onChange={(e) => setHero2Count(e.target.value)}
                        placeholder="e.g. Artisanal 16+ pieces"
                        className="w-full px-3 py-1.5 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                        Catalog Link
                      </label>
                      <input
                        type="text"
                        value={hero2Href}
                        onChange={(e) => setHero2Href(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] font-mono text-[11px] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                      />
                    </div>

                    {/* Sliding Cover Images Preview */}
                    <div>
                      <label className="block font-bold text-[var(--nexa-text-primary)] mb-1.5">
                        Sliding Design Covers ({hero2Images.length})
                      </label>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {hero2Images.map((img, idx) => (
                          <div key={idx} className="relative group/cover shrink-0 w-16 h-20 rounded-xl overflow-hidden border border-[var(--nexa-border)] bg-stone-100">
                            <img src={img} alt={`Slot 2 cover ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setHero2Images(hero2Images.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] opacity-0 group-hover/cover:opacity-100 transition cursor-pointer"
                              title="Remove cover"
                            >
                              ×
                            </button>
                            <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-black/50 text-[9px] text-white font-mono">
                              {idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Add Image URL */}
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          value={newHero2ImageInput}
                          onChange={(e) => setNewHero2ImageInput(e.target.value)}
                          placeholder="Paste design image URL..."
                          className="flex-1 px-3 py-1 text-[11px] rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newHero2ImageInput.trim()) {
                              setHero2Images([...hero2Images, newHero2ImageInput.trim()]);
                              setNewHero2ImageInput("");
                            }
                          }}
                          className="px-3 py-1 rounded-xl bg-[#1A56DB] text-white text-[11px] font-bold cursor-pointer shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Quick Pick Designs from Live Catalog */}
                    {catalogProducts.length > 0 && (
                      <div className="pt-2 border-t border-[var(--nexa-border)]">
                        <label className="block font-bold text-[11px] text-[var(--nexa-text-muted)] mb-1.5 uppercase">
                          Click Catalog Designs to Include in Slider
                        </label>
                        <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                          {catalogProducts.map((p) => {
                            const isSelected = hero2ProductIds.includes(p.id);
                            const img = (p.images && p.images[0]) || p.image;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => toggleHero2Product(p)}
                                className={`w-full flex items-center gap-2 p-1.5 rounded-xl border text-left transition cursor-pointer ${
                                  isSelected
                                    ? "bg-purple-500/10 border-purple-500/40 text-[var(--nexa-text-primary)]"
                                    : "bg-[var(--nexa-bg-surface)] border-transparent hover:border-[var(--nexa-border)] text-[var(--nexa-text-secondary)]"
                                }`}
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                )}
                                {img && (
                                  <img src={img} alt={p.name} className="w-6 h-6 rounded-md object-cover shrink-0" />
                                )}
                                <span className="text-[11px] font-medium truncate flex-1">{p.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </NexaCard>
          </div>
        )}

        {/* TAB 3: TAXONOMY, CATEGORIES, COLLECTIONS & AFRICAN PRINTS */}
        {activeTab === "taxonomy" && (
          <div className="space-y-6 max-w-4xl">
            {/* 1. COLLECTIONS MANAGEMENT */}
            <NexaCard variant="glass" padding="lg" className="rounded-3xl border border-[var(--nexa-border)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span>Store Collections Management</span>
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-secondary)]">
                    Create, edit, and organize seasonal capsules. Select which collections appear in Hero Bento Slots.
                  </p>
                </div>
                <NexaButton
                  size="sm"
                  variant="primary"
                  onClick={() => handleOpenCollectionModal()}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="rounded-full bg-[#1A56DB] text-white font-bold cursor-pointer"
                >
                  Create Collection
                </NexaButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {collectionsList.map((col) => (
                  <div
                    key={col.id}
                    className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-bold text-xs text-[var(--nexa-text-primary)] line-clamp-1">
                          {col.name}
                        </span>
                        {col.isHero1 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
                            Hero 1
                          </span>
                        ) : col.isHero2 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20 shrink-0">
                            Hero 2
                          </span>
                        ) : null}
                      </div>

                      {col.season && (
                        <span className="text-[10px] text-stone-500 font-mono block mb-1">
                          {col.season}
                        </span>
                      )}

                      <p className="text-[11px] text-[var(--nexa-text-secondary)] line-clamp-2">
                        {col.description || "No collection description."}
                      </p>

                      {col.images && col.images.length > 0 && (
                        <div className="flex gap-1.5 mt-2 overflow-hidden">
                          {col.images.slice(0, 3).map((img, i) => (
                            <img key={i} src={img} alt="" className="w-10 h-12 rounded-lg object-cover" />
                          ))}
                          {col.images.length > 3 && (
                            <div className="w-10 h-12 rounded-lg bg-stone-200 text-stone-600 flex items-center justify-center text-[10px] font-bold">
                              +{col.images.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[var(--nexa-border)] flex items-center justify-between text-xs">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => assignHeroCollection(col, 1)}
                          className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 text-[10px] font-bold transition cursor-pointer"
                          title="Feature in Hero Slot 1"
                        >
                          Hero 1
                        </button>
                        <button
                          type="button"
                          onClick={() => assignHeroCollection(col, 2)}
                          className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 text-[10px] font-bold transition cursor-pointer"
                          title="Feature in Hero Slot 2"
                        >
                          Hero 2
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenCollectionModal(col)}
                          className="p-1 rounded-lg hover:bg-stone-200 text-stone-600 transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCollection(col.id)}
                          className="p-1 rounded-lg hover:bg-red-100 text-red-500 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </NexaCard>

            {/* 2. CATEGORIES MANAGEMENT */}
            <NexaCard variant="glass" padding="lg" className="rounded-3xl border border-[var(--nexa-border)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-500" />
                    <span>Product Categories</span>
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-secondary)]">
                    Manage taxonomy filters and apparel departments visible across the catalog.
                  </p>
                </div>
                <NexaButton
                  size="sm"
                  variant="primary"
                  onClick={() => handleOpenCategoryModal()}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="rounded-full bg-emerald-600 text-white font-bold cursor-pointer"
                >
                  Add Category
                </NexaButton>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categoriesList.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-[var(--nexa-text-primary)] block truncate">
                        {cat.name}
                      </span>
                      {cat.description && (
                        <p className="text-[10px] text-[var(--nexa-text-secondary)] line-clamp-1">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenCategoryModal(cat)}
                        className="p-1 rounded-lg hover:bg-stone-200 text-stone-600 transition cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1 rounded-lg hover:bg-red-100 text-red-500 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </NexaCard>

            {/* 3. AFRICAN PRINTS LIBRARY (FASHION) */}
            <NexaCard variant="glass" padding="lg" className="rounded-3xl border border-[var(--nexa-border)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>African Fabric Prints Library</span>
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-secondary)]">
                    Curate fabric patterns, swatches, and artisanal textiles available for bespoke tailoring & variant matrices.
                  </p>
                </div>
                <NexaButton
                  size="sm"
                  variant="primary"
                  onClick={() => handleOpenPrintModal()}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="rounded-full bg-amber-600 text-white font-bold cursor-pointer"
                >
                  Add Fabric Print
                </NexaButton>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {africanPrintsList.map((prt) => (
                  <div
                    key={prt.id}
                    className="p-2.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex flex-col justify-between space-y-2 group"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 border border-[var(--nexa-border)]">
                      <img src={prt.image} alt={prt.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>

                    <div>
                      <span className="font-bold text-xs text-[var(--nexa-text-primary)] block truncate">
                        {prt.name}
                      </span>
                      {prt.description && (
                        <p className="text-[10px] text-[var(--nexa-text-secondary)] line-clamp-1">
                          {prt.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-1 pt-1 border-t border-[var(--nexa-border)]">
                      <button
                        type="button"
                        onClick={() => handleOpenPrintModal(prt)}
                        className="p-1 rounded-lg hover:bg-stone-200 text-stone-600 transition cursor-pointer"
                        title="Edit Print"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePrint(prt.id)}
                        className="p-1 rounded-lg hover:bg-red-100 text-red-500 transition cursor-pointer"
                        title="Delete Print"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </NexaCard>
          </div>
        )}

        {/* TAB 4: TRUST BADGES */}
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
                className="rounded-xl bg-[#1A56DB] text-white font-bold cursor-pointer"
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

        {/* TAB 5: FOOTER & CONTACT */}
        {activeTab === "footer" && (
          <div className="space-y-6 max-w-4xl">
            <NexaCard variant="glass" padding="lg" className="rounded-3xl border border-[var(--nexa-border)] space-y-4">
              <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                Physical Showroom, Operating Hours & Concierge Contact
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                    Showroom Physical Address
                  </label>
                  <input
                    type="text"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                    Customer Care Phone Number
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                    Concierge Email Address
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                    WhatsApp Orders Direct Line
                  </label>
                  <input
                    type="text"
                    value={contactWhatsapp}
                    onChange={(e) => setContactWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
                    Operating / Showroom Hours
                  </label>
                  <input
                    type="text"
                    value={contactHours}
                    onChange={(e) => setContactHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                  />
                </div>
              </div>
            </NexaCard>
          </div>
        )}

        {/* TAB 6: POLICIES */}
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

      {/* MODAL: ADD / EDIT COLLECTION */}
      <NexaModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        title={editingCollection ? "Edit Collection" : "Create New Collection"}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
              Collection Name
            </label>
            <input
              type="text"
              value={colModalName}
              onChange={(e) => setColModalName(e.target.value)}
              placeholder="e.g. Lagos Riviera Resort Capsule"
              className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
              Season / Drop Label
            </label>
            <input
              type="text"
              value={colModalSeason}
              onChange={(e) => setColModalSeason(e.target.value)}
              placeholder="e.g. Harmattan 2026"
              className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={colModalDesc}
              onChange={(e) => setColModalDesc(e.target.value)}
              placeholder="Editorial story of this collection..."
              className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none resize-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
              Cover Images ({colModalImages.length})
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 mb-2">
              {colModalImages.map((src, i) => (
                <div key={i} className="relative group/mimg shrink-0 w-12 h-14 rounded-lg overflow-hidden bg-stone-100 border border-[var(--nexa-border)]">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setColModalImages(colModalImages.filter((_, idx) => idx !== i))}
                    className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center text-[8px]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={colModalImageInput}
                onChange={(e) => setColModalImageInput(e.target.value)}
                placeholder="Paste cover image URL..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (colModalImageInput.trim()) {
                    setColModalImages([...colModalImages, colModalImageInput.trim()]);
                    setColModalImageInput("");
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-[#1A56DB] text-white text-xs font-bold"
              >
                Add
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--nexa-border)] flex justify-end gap-2">
            <NexaButton size="sm" variant="outline" onClick={() => setIsCollectionModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton size="sm" variant="primary" onClick={handleSaveCollectionModal} className="bg-[#1A56DB] text-white">
              Save Collection
            </NexaButton>
          </div>
        </div>
      </NexaModal>

      {/* MODAL: ADD / EDIT CATEGORY */}
      <NexaModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Add Category"}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
              Category Name
            </label>
            <input
              type="text"
              value={catModalName}
              onChange={(e) => setCatModalName(e.target.value)}
              placeholder="e.g. Ceremonial Silk"
              className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={catModalDesc}
              onChange={(e) => setCatModalDesc(e.target.value)}
              placeholder="Brief description..."
              className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[var(--nexa-border)] flex justify-end gap-2">
            <NexaButton size="sm" variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton size="sm" variant="primary" onClick={handleSaveCategoryModal} className="bg-emerald-600 text-white">
              Save Category
            </NexaButton>
          </div>
        </div>
      </NexaModal>

      {/* MODAL: ADD / EDIT AFRICAN PRINT */}
      <NexaModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={editingPrint ? "Edit Fabric Print" : "Add African Fabric Print"}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
              Print / Pattern Name
            </label>
            <input
              type="text"
              value={printModalName}
              onChange={(e) => setPrintModalName(e.target.value)}
              placeholder="e.g. Yoruba Indigo Adire"
              className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
              Swatch / Pattern Image
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={printModalImage}
                onChange={(e) => setPrintModalImage(e.target.value)}
                placeholder="https://... or upload from device"
                className="flex-1 px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none font-mono text-[11px]"
              />
              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-amber-500 text-amber-600 font-bold text-xs cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingPrintSwatch ? "Uploading..." : "Upload Swatch"}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingPrintSwatch}
                  onChange={handleUploadPrintModalImage}
                  className="hidden"
                />
              </label>
            </div>
            {printModalImage && (
              <div className="mt-2 flex items-center gap-2">
                <img src={printModalImage} alt="Preview" className="w-10 h-10 rounded-xl object-cover border border-[var(--nexa-border)]" />
                <span className="text-[10px] text-[var(--nexa-text-secondary)]">Swatch Preview</span>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-[var(--nexa-text-primary)] mb-1">
              Heritage Story / Description
            </label>
            <textarea
              rows={2}
              value={printModalDesc}
              onChange={(e) => setPrintModalDesc(e.target.value)}
              placeholder="e.g. Resist-dyed Yoruba indigo patterned cotton..."
              className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none resize-none"
            />
          </div>

          <div className="pt-3 border-t border-[var(--nexa-border)] flex justify-end gap-2">
            <NexaButton size="sm" variant="outline" onClick={() => setIsPrintModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton size="sm" variant="primary" onClick={handleSavePrintModal} className="bg-amber-600 text-white">
              Save Print
            </NexaButton>
          </div>
        </div>
      </NexaModal>
    </BusinessShell>
  );
}
