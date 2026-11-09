"use client";

import { useMemo } from "react";
import { Product } from "@/types/storefront";
import { CategoryCardData, FloatingPillItem } from "@/components/common/VerticalCategoryBentoGrid";
import { ContrastTheme } from "@/hooks/useImageContrast";

export interface BentoDefaultConfig {
  card1: CategoryCardData;
  card2: CategoryCardData;
  card3: {
    title: string;
    backgroundImage: string;
    href: string;
    theme?: ContrastTheme;
    pills: FloatingPillItem[];
  };
}

export interface UseCollectionsBentoProps {
  config?: any;
  products?: Product[];
  defaults: BentoDefaultConfig;
  catalogPath?: string;
  itemUnit?: string;
}

export function useCollectionsBento({
  config,
  products = [],
  defaults,
  catalogPath = "/catalog",
  itemUnit = "pieces",
}: UseCollectionsBentoProps) {
  // Section visibility: visible unless explicitly turned off
  const isEnabled =
    config?.sectionVisibility?.collections !== false &&
    config?.collections?.enabled !== false;

  const card1: CategoryCardData = useMemo(() => {
    const c1 = config?.collections?.card1;
    const rawTitle = c1?.title || defaults.card1.title;

    // Resolve sliding images:
    let resolvedImages: string[] = [];
    if (Array.isArray(c1?.images) && c1.images.length > 0) {
      resolvedImages = c1.images.filter(Boolean);
    } else if (Array.isArray(c1?.productIds) && c1.productIds.length > 0) {
      const selectedProducts = products.filter((p) => c1.productIds.includes(p.id));
      resolvedImages = selectedProducts
        .map((p) => (p.images && p.images[0]) || (p as any).image || "")
        .filter(Boolean);
    }

    if (resolvedImages.length === 0 && products.length > 0) {
      // Pick first half of products for Collection 1
      const half = Math.ceil(products.length / 2);
      const pool = products.slice(0, half);
      resolvedImages = pool
        .map((p) => (p.images && p.images[0]) || (p as any).image || "")
        .filter(Boolean)
        .slice(0, 5);
    }

    if (resolvedImages.length === 0) {
      resolvedImages = defaults.card1.images || (defaults.card1.image ? [defaults.card1.image] : []);
    }

    const primaryImage = resolvedImages[0] || c1?.image || defaults.card1.image;

    return {
      title: typeof rawTitle === "string" ? rawTitle.replace(/\\n/g, "\n") : rawTitle,
      count:
        c1?.count ||
        (products.length > 0
          ? `${Math.ceil(products.length / 2)} ${itemUnit}`
          : defaults.card1.count),
      image: primaryImage,
      images: resolvedImages,
      href: c1?.href || defaults.card1.href,
      theme: (c1?.theme as ContrastTheme) || defaults.card1.theme || "light",
    };
  }, [config?.collections?.card1, defaults.card1, products, itemUnit]);

  const card2: CategoryCardData = useMemo(() => {
    const c2 = config?.collections?.card2;
    const rawTitle = c2?.title || defaults.card2.title;

    // Resolve sliding images:
    let resolvedImages: string[] = [];
    if (Array.isArray(c2?.images) && c2.images.length > 0) {
      resolvedImages = c2.images.filter(Boolean);
    } else if (Array.isArray(c2?.productIds) && c2.productIds.length > 0) {
      const selectedProducts = products.filter((p) => c2.productIds.includes(p.id));
      resolvedImages = selectedProducts
        .map((p) => (p.images && p.images[0]) || (p as any).image || "")
        .filter(Boolean);
    }

    if (resolvedImages.length === 0 && products.length > 0) {
      // Pick second half of products for Collection 2
      const half = Math.ceil(products.length / 2);
      const pool = products.slice(half);
      resolvedImages = (pool.length > 0 ? pool : products)
        .map((p) => (p.images && p.images[0]) || (p as any).image || "")
        .filter(Boolean)
        .slice(0, 5);
    }

    if (resolvedImages.length === 0) {
      resolvedImages = defaults.card2.images || (defaults.card2.image ? [defaults.card2.image] : []);
    }

    const primaryImage = resolvedImages[0] || c2?.image || defaults.card2.image;

    return {
      title: typeof rawTitle === "string" ? rawTitle.replace(/\\n/g, "\n") : rawTitle,
      count:
        c2?.count ||
        (products.length > 0
          ? `${Math.floor(products.length / 2)} ${itemUnit}`
          : defaults.card2.count),
      image: primaryImage,
      images: resolvedImages,
      href: c2?.href || defaults.card2.href,
      theme: (c2?.theme as ContrastTheme) || defaults.card2.theme || "light",
    };
  }, [config?.collections?.card2, defaults.card2, products, itemUnit]);

  // Compute live categories from catalog products
  const autoPills: FloatingPillItem[] = useMemo(() => {
    if (!products || products.length === 0) {
      return defaults.card3.pills;
    }

    const categoryMap = new Map<string, { count: number; image: string }>();
    for (const p of products) {
      const cat = (p.category || "").trim();
      if (!cat) continue;
      const existing = categoryMap.get(cat);
      const firstImage = (p.images && p.images[0]) || "";
      if (existing) {
        existing.count += 1;
        if (!existing.image && firstImage) existing.image = firstImage;
      } else {
        categoryMap.set(cat, {
          count: 1,
          image: firstImage,
        });
      }
    }

    if (categoryMap.size === 0) {
      return defaults.card3.pills;
    }

    const sorted = Array.from(categoryMap.entries()).sort(
      (a, b) => b[1].count - a[1].count
    );

    const generated = sorted.slice(0, 3).map(([cat, data], idx) => ({
      label: cat,
      count: `${data.count} ${data.count === 1 ? (itemUnit.endsWith("s") ? itemUnit.slice(0, -1) : itemUnit) : itemUnit}`,
      image:
        data.image ||
        defaults.card3.pills[idx]?.image ||
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=120&q=80",
      href: `${catalogPath}?category=${encodeURIComponent(cat)}`,
    }));

    return generated;
  }, [products, defaults.card3.pills, catalogPath, itemUnit]);

  const card3 = useMemo(() => {
    const c3 = config?.collections?.card3;
    return {
      title: c3?.title || defaults.card3.title,
      backgroundImage: c3?.backgroundImage || defaults.card3.backgroundImage,
      href: c3?.href || defaults.card3.href,
      theme: (c3?.theme as ContrastTheme) || defaults.card3.theme || "light",
      pills: autoPills,
    };
  }, [config?.collections?.card3, defaults.card3, autoPills]);

  return {
    isEnabled,
    card1,
    card2,
    card3,
  };
}
