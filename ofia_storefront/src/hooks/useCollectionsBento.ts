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
    return {
      title: typeof rawTitle === "string" ? rawTitle.replace(/\\n/g, "\n") : rawTitle,
      count: c1?.count || defaults.card1.count,
      image: c1?.image || defaults.card1.image,
      href: c1?.href || defaults.card1.href,
      theme: (c1?.theme as ContrastTheme) || defaults.card1.theme || "light",
    };
  }, [config?.collections?.card1, defaults.card1]);

  const card2: CategoryCardData = useMemo(() => {
    const c2 = config?.collections?.card2;
    const rawTitle = c2?.title || defaults.card2.title;
    return {
      title: typeof rawTitle === "string" ? rawTitle.replace(/\\n/g, "\n") : rawTitle,
      count: c2?.count || defaults.card2.count,
      image: c2?.image || defaults.card2.image,
      href: c2?.href || defaults.card2.href,
      theme: (c2?.theme as ContrastTheme) || defaults.card2.theme || "light",
    };
  }, [config?.collections?.card2, defaults.card2]);

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

    // If catalog has fewer than 3 categories, fill remainder from defaults
    if (generated.length < 3 && defaults.card3.pills.length > generated.length) {
      for (let i = generated.length; i < 3 && i < defaults.card3.pills.length; i++) {
        generated.push(defaults.card3.pills[i]);
      }
    }

    return generated;
  }, [products, defaults.card3.pills, catalogPath, itemUnit]);

  // Mode defaults to "auto" if not explicitly set to "static"
  const mode = config?.collections?.card3?.mode || "auto";

  const card3 = useMemo(() => {
    const c3 = config?.collections?.card3;
    let pills = defaults.card3.pills;

    if (mode === "auto") {
      pills = autoPills;
    } else if (c3?.pills && Array.isArray(c3.pills) && c3.pills.length > 0) {
      pills = c3.pills;
    }

    const rawTitle = c3?.title || defaults.card3.title;
    return {
      title: typeof rawTitle === "string" ? rawTitle.replace(/\\n/g, "\n") : rawTitle,
      href: c3?.href || defaults.card3.href,
      backgroundImage: c3?.backgroundImage || defaults.card3.backgroundImage,
      theme: (c3?.theme as ContrastTheme) || defaults.card3.theme || "light",
      pills,
    };
  }, [config?.collections?.card3, defaults.card3, mode, autoPills]);

  return {
    isEnabled,
    mode,
    card1,
    card2,
    card3,
  };
}
