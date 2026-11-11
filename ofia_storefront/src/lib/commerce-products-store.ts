import fs from "fs";
import path from "path";
import { Product, VerticalType, AFRICAN_PRINT_PRESETS } from "@/types/storefront";
import { getTenantSql, getTenantDatabaseConfig } from "./tenant-db-resolver";
import { SEED_TENANT_HANDSHAKES } from "./storefront-tenant";

function getSyncDir() {
  const candidates = [
    path.resolve(process.cwd(), "..", ".commerce_sync"),
    path.resolve(process.cwd(), ".commerce_sync"),
    "/Volumes/ReedBreedCC/ofia_ng/.commerce_sync",
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

const SYNC_DIR = getSyncDir();
const PRODUCTS_FILE = path.join(SYNC_DIR, "products.json");

// In-memory fallback
let memoryProducts: Product[] = [];

// Helper to ensure file exists
function ensureProductsFile(): void {
  try {
    if (!fs.existsSync(SYNC_DIR)) {
      fs.mkdirSync(SYNC_DIR, { recursive: true });
    }
    if (!fs.existsSync(PRODUCTS_FILE)) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2), "utf-8");
      memoryProducts = [];
    }
  } catch (err) {
    console.warn("[CommerceProductsStore] File system access warning, using in-memory store:", err);
    if (memoryProducts.length === 0) {
      memoryProducts = [];
    }
  }
}

export const VERTICAL_EDITORIAL_FALLBACK_IMAGES: Record<string, string[]> = {
  fashion: [
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
  ],
  cars: [
    "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
  ],
  food: [
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
  ],
  beauty: [
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1608248597359-5735b5a2bf61?auto=format&fit=crop&w=800&q=80",
  ],
  gadgets: [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  ],
  "home-living": [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80",
  ],
  hardware: [
    "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
  ],
  pharmacy: [
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
  ],
  property: [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  ],
  retail: [
    "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
  ],
};

export const KNOWN_COLOR_HEX_MAP: Record<string, string> = {
  "midnight black": "#111111",
  "obsidian black": "#111111",
  "black": "#111111",
  "emerald green": "#047857",
  "forest emerald": "#1F4E3D",
  "green": "#16A34A",
  "olive": "#4A5240",
  "olive moss": "#4A5240",
  "royal navy": "#1E3A8A",
  "midnight navy": "#152238",
  "deep indigo": "#1E2A38",
  "navy": "#1E3A8A",
  "blue": "#2563EB",
  "terracotta ochre": "#C2410C",
  "terracotta clay": "#9E4731",
  "terracotta": "#C2410C",
  "rich gold": "#D97706",
  "champagne gold": "#DFD3B6",
  "gold": "#D97706",
  "ruby wine": "#991B1B",
  "ruby": "#991B1B",
  "wine": "#722F37",
  "burgundy": "#800020",
  "maroon": "#800000",
  "ivory cream": "#F8FAFC",
  "ivory": "#FFFFF0",
  "cream": "#FFFDD0",
  "raw sandstone": "#D6C7B2",
  "camel taupe": "#C2A383",
  "taupe": "#B38B6D",
  "sand": "#C2B280",
  "white": "#FFFFFF",
  "sunset coral": "#FB7185",
  "coral": "#F87171",
  "peach": "#FDBA74",
  "deep amethyst": "#581C87",
  "amethyst": "#9333EA",
  "purple": "#9333EA",
  "violet": "#7C3AED",
  "yellow": "#EAB308",
  "mustard": "#CA8A04",
  "orange": "#F97316",
  "red": "#DC2626",
  "crimson": "#DC2626",
  "pink": "#EC4899",
  "rose": "#F43F5E",
  "brown": "#78350F",
  "chocolate": "#451A03",
  "bronze": "#CD7F32",
  "copper": "#B87333",
  "silver": "#94A3B8",
  "grey": "#6B7280",
  "gray": "#6B7280",
  "charcoal": "#374151",
  "teal": "#0D9488",
  "cyan": "#06B6D4",
  "khaki": "#A3A380",
  "beige": "#F5F5DC",
  "tan": "#D2B48C",
};

export function resolveColorHex(colorName: string, existingHex?: string, variants?: any[]): string {
  const normName = (colorName || "").trim().toLowerCase();
  if (existingHex && existingHex.startsWith("#") && existingHex.length >= 4) {
    const normHex = existingHex.toLowerCase();
    if (normHex !== "#111111" && normHex !== "#000000" && normHex !== "#111") {
      return existingHex;
    }
    if (normName.includes("black") || normName.includes("obsidian") || normName.includes("dark")) {
      return existingHex;
    }
  }

  if (Array.isArray(variants)) {
    const varMatch = variants.find(
      (v: any) =>
        v.color?.toLowerCase() === normName &&
        v.colorHex &&
        v.colorHex !== "#111111" &&
        v.colorHex !== "#000000"
    );
    if (varMatch?.colorHex) return varMatch.colorHex;
  }

  if (KNOWN_COLOR_HEX_MAP[normName]) {
    return KNOWN_COLOR_HEX_MAP[normName];
  }

  for (const [key, hex] of Object.entries(KNOWN_COLOR_HEX_MAP)) {
    if (normName.includes(key) || key.includes(normName)) {
      return hex;
    }
  }

  return existingHex || "#D97706";
}

export async function getStorefrontProducts(
  tenantSlug?: string,
  vertical?: VerticalType
): Promise<{ products: Product[]; isLiveMerchantCatalog: boolean; error?: string | null; dbError?: boolean }> {
  ensureProductsFile();

  const normalizedSlug = tenantSlug ? tenantSlug.toLowerCase().trim() : null;
  const cleanSlug = normalizedSlug ? normalizedSlug.replace(/-/g, "") : "";

  // 1. Check live merchant inventory on their dedicated database
  if (normalizedSlug) {
    // Resolve tenant's registered vertical
    let tenantVertical: VerticalType | undefined = SEED_TENANT_HANDSHAKES[normalizedSlug]?.vertical;
    if (!tenantVertical) {
      try {
        const dbConf = await getTenantDatabaseConfig(normalizedSlug);
        if (dbConf.vertical) {
          tenantVertical = dbConf.vertical as VerticalType;
        }
      } catch {}
    }

    // STRICT ISOLATION GUARD:
    // If a specific vertical was requested (e.g. "fashion"), but this tenant is registered under a DIFFERENT vertical (e.g. "cars"),
    // do NOT serve car inventory as fashion products.
    if (vertical && tenantVertical && tenantVertical !== vertical) {
      return { products: [], isLiveMerchantCatalog: false, error: null };
    }

    try {
      const sql = await getTenantSql(normalizedSlug);
      if (sql) {
        let rows: any[] = [];
        try {
          rows = await sql`
            SELECT id, product_id, sku, product_name, category, current_stock, unit_price, status,
                   COALESCE(image_url, '') as image_url,
                   COALESCE(metadata, '{}'::jsonb) as metadata
            FROM shop_inventory
            WHERE (
              LOWER(tenant_slug) = ${normalizedSlug}
              OR REPLACE(LOWER(tenant_slug), '-', '') = ${cleanSlug}
            )
            AND (
              metadata->>'parentId' IS NULL
              OR metadata->>'parentId' = ''
            )
            ORDER BY (current_stock > 0) DESC, created_at DESC
            LIMIT 100
          `;
        } catch {
          rows = await sql`
            SELECT id, product_id, sku, product_name, category, current_stock, unit_price, status
            FROM shop_inventory
            WHERE (
              LOWER(tenant_slug) = ${normalizedSlug}
              OR REPLACE(LOWER(tenant_slug), '-', '') = ${cleanSlug}
            )
            ORDER BY (current_stock > 0) DESC, created_at DESC
            LIMIT 250
          `;
        }

        if (rows && rows.length > 0) {
          const resolvedVertical: VerticalType = (tenantVertical || vertical || "retail") as VerticalType;
          const isFashion = resolvedVertical === "fashion";
          const verticalFallbacks = VERTICAL_EDITORIAL_FALLBACK_IMAGES[resolvedVertical] || VERTICAL_EDITORIAL_FALLBACK_IMAGES.retail;

          const FASHION_PALETTES = [
            [
              { name: "Raw Sandstone", hex: "#D6C7B2" },
              { name: "Deep Indigo", hex: "#1E2A38" },
              { name: "Terracotta Clay", hex: "#9E4731" },
              { name: "Olive Moss", hex: "#4A5240" },
            ],
            [
              { name: "Obsidian Black", hex: "#111111" },
              { name: "Camel Taupe", hex: "#C2A383" },
              { name: "Ivory Cream", hex: "#F5F2EB" },
            ],
            [
              { name: "Forest Emerald", hex: "#1F4E3D" },
              { name: "Midnight Navy", hex: "#152238" },
              { name: "Champagne Gold", hex: "#DFD3B6" },
            ],
          ];

          const masterRows = rows.filter((r: any) => {
            const meta = (typeof r.metadata === "string" ? JSON.parse(r.metadata || "{}") : r.metadata) || {};
            return !meta.parentId;
          });

          // Deduplicate rows by product_id / id so that duplicate entries are excluded
          const seenIds = new Set<string>();
          const uniqueMasterRows: any[] = [];
          for (const r of masterRows) {
            const key = r.product_id || r.id;
            if (key && !seenIds.has(key)) {
              seenIds.add(key);
              uniqueMasterRows.push(r);
            } else if (!key) {
              uniqueMasterRows.push(r);
            }
          }

          const liveProducts: Product[] = uniqueMasterRows.map((r: any, idx: number) => {
            const meta = (typeof r.metadata === "string" ? JSON.parse(r.metadata || "{}") : r.metadata) || {};
            const metaImages: string[] = Array.isArray(meta.images) && meta.images.length > 0
              ? meta.images
              : (r.image_url ? [r.image_url] : []);
            const fallbackImg = verticalFallbacks[idx % verticalFallbacks.length];
            const primaryImg = (r.image_url && r.image_url.trim()) || metaImages[0] || fallbackImg;
            const resolvedImages = metaImages.length > 0 ? metaImages : [primaryImg];

            return {
              id: r.product_id || r.id,
              storeSlug: normalizedSlug,
              vertical: resolvedVertical,
              title: r.product_name,
              subtitle: isFashion
                ? "Artisanal cut tailored with sustainable heritage textiles"
                : undefined,
              price: Number(r.unit_price) || 0,
              category: r.category || (isFashion ? "Couture & Tailoring" : "General"),
              collection: meta.collection || meta.attributes?.collection || undefined,
              images: resolvedImages,
              rating: 4.9,
              reviewsCount: 18 + idx * 7,
              inStock: r.current_stock > 0 && r.status !== "OUT_OF_STOCK",
              isFeatured: true,
              isNewDrop: idx === 0,
              highlights: [
                `SKU: ${r.sku}`,
                `${r.current_stock} units ready in atelier`,
                "Artisanal Tailored Fit",
              ],
              description: `${r.product_name} · Sourced directly from merchant live inventory.`,
              fashionMeta: isFashion
                ? {
                    collection: meta.collection || meta.attributes?.collection || undefined,
                    season: meta.season || meta.attributes?.season || undefined,
                    sizes:
                      meta.fashionSizes ||
                      meta.fashionMeta?.sizes ||
                      (typeof meta.sizes === "string"
                        ? meta.sizes.split(",").map((s: string) => s.trim()).filter(Boolean)
                        : meta.sizes) ||
                      meta.attributes?.sizes ||
                      ["XS", "S", "M", "L", "XL", "Bespoke Cut"],
                    colors: (() => {
                      const raw =
                        meta.fashionColors ||
                        meta.fashionMeta?.colors ||
                        meta.colors ||
                        meta.attributes?.fashionColors ||
                        meta.attributes?.colors ||
                        meta.attributes?.fashionMeta?.colors;

                      let parsed: Array<{ name: string; hex: string }> = [];

                      if (Array.isArray(raw) && raw.length > 0) {
                        parsed = raw
                          .map((c: any) => {
                            if (typeof c === "string") {
                              const name = c.trim();
                              return {
                                name,
                                hex: resolveColorHex(name, undefined, meta.variants),
                              };
                            }
                            const name = c?.name || "Default";
                            return {
                              name,
                              hex: resolveColorHex(name, c?.hex, meta.variants),
                            };
                          })
                          .filter((c) => c.name);
                      } else if (typeof raw === "string" && raw.trim()) {
                        parsed = raw
                          .split(",")
                          .map((s: string) => {
                            const name = s.trim();
                            return {
                              name,
                              hex: resolveColorHex(name, undefined, meta.variants),
                            };
                          })
                          .filter((c) => c.name);
                      } else if (Array.isArray(meta.variants) && meta.variants.length > 0) {
                        const uniqueColors = Array.from(
                          new Set(meta.variants.map((v: any) => v.color).filter(Boolean))
                        ) as string[];
                        if (uniqueColors.length > 0) {
                          parsed = uniqueColors.map((name) => {
                            const vMatch = meta.variants.find((v: any) => v.color === name);
                            return {
                              name,
                              hex: resolveColorHex(name, vMatch?.colorHex, meta.variants),
                            };
                          });
                        }
                      }

                      if (parsed.length === 0) {
                        parsed = FASHION_PALETTES[idx % FASHION_PALETTES.length];
                      }

                      return parsed;
                    })(),
                    prints: (() => {
                      const raw =
                        meta.fashionPrints ||
                        meta.fashionMeta?.prints ||
                        meta.prints ||
                        meta.attributes?.fashionPrints ||
                        meta.attributes?.prints ||
                        meta.attributes?.fashionMeta?.prints;

                      if (Array.isArray(raw) && raw.length > 0) {
                        return raw.map((p: any) => {
                          if (typeof p === "string") {
                            const trimmed = p.trim();
                            const found = AFRICAN_PRINT_PRESETS.find(
                              (pre) => pre.name.toLowerCase() === trimmed.toLowerCase()
                            );
                            const varMatch = Array.isArray(meta.variants)
                              ? meta.variants.find((v: any) => v.print?.toLowerCase() === trimmed.toLowerCase())
                              : null;
                            return {
                              name: trimmed,
                              image:
                                varMatch?.printImage ||
                                found?.image ||
                                "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
                              description: found?.description || "Artisanal African fabric print",
                            };
                          }
                          return {
                            name: p?.name || "African Wax Print",
                            image:
                              p?.image ||
                              "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
                            description: p?.description || "Artisanal African fabric print",
                          };
                        });
                      }

                      if (typeof raw === "string" && raw.trim()) {
                        return raw
                          .split(",")
                          .map((s: string) => {
                            const name = s.trim();
                            const found = AFRICAN_PRINT_PRESETS.find(
                              (pre) => pre.name.toLowerCase() === name.toLowerCase()
                            );
                            const varMatch = Array.isArray(meta.variants)
                              ? meta.variants.find((v: any) => v.print?.toLowerCase() === name.toLowerCase())
                              : null;
                            return {
                              name,
                              image:
                                varMatch?.printImage ||
                                found?.image ||
                                "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
                              description: found?.description || "Artisanal African fabric print",
                            };
                          })
                          .filter((p) => p.name);
                      }

                      if (Array.isArray(meta.variants) && meta.variants.length > 0) {
                        const uniquePrintNames = Array.from(
                          new Set(meta.variants.map((v: any) => v.print).filter(Boolean))
                        );
                        if (uniquePrintNames.length > 0) {
                          return uniquePrintNames.map((name) => {
                            const varMatch = meta.variants.find((v: any) => v.print === name);
                            const found = AFRICAN_PRINT_PRESETS.find(
                              (pre) => pre.name.toLowerCase() === (name as string).toLowerCase()
                            );
                            return {
                              name: name as string,
                              image:
                                varMatch?.printImage ||
                                found?.image ||
                                "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
                              description: found?.description || "Artisanal African fabric print",
                            };
                          });
                        }
                      }

                      return [AFRICAN_PRINT_PRESETS[0], AFRICAN_PRINT_PRESETS[1]];
                    })(),
                    materials: meta.material ? [meta.material] : ["100% Normandy Flax Linen", "Handwoven Aso-Oke"],
                    fit: meta.fit || "Relaxed tailored silhouette with comfortable drape",
                    careInstructions: "Specialist dry clean or delicate cold hand wash.",
                    sizeGuide: [
                      { size: "S", chest: "36 - 38 in", waist: "30 - 32 in", hips: "36 - 38 in" },
                      { size: "M", chest: "40 - 42 in", waist: "33 - 35 in", hips: "40 - 42 in" },
                      { size: "L", chest: "44 - 46 in", waist: "36 - 38 in", hips: "44 - 46 in" },
                      { size: "XL", chest: "48 - 50 in", waist: "40 - 42 in", hips: "48 - 50 in" },
                    ],
                  }
                : undefined,
              variants: Array.isArray(meta.variants) ? meta.variants : [],
              accessories: Array.isArray(meta.accessories)
                ? meta.accessories
                : Array.isArray(meta.attributes?.accessories)
                ? meta.attributes.accessories
                : [],
              tags: [r.category || (isFashion ? "Fashion" : "General"), "Bespoke"],
            };
          });

          return { products: liveProducts, isLiveMerchantCatalog: true, error: null };
        }
        return { products: [], isLiveMerchantCatalog: true, error: null };
      }
    } catch (err: any) {
      console.warn(`[CommerceProductsStore] Database lookup error for tenant '${normalizedSlug}':`, err);
      return {
        products: [],
        isLiveMerchantCatalog: false,
        error: "Connect to Internet",
        dbError: true,
      };
    }
  }

  return { products: [], isLiveMerchantCatalog: false, error: null };
}

export async function saveStorefrontProduct(product: Partial<Product> & { storeSlug: string; vertical: VerticalType }): Promise<Product> {
  ensureProductsFile();

  let allProducts: Product[] = [];

  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      allProducts = JSON.parse(raw);
    } else {
      allProducts = memoryProducts;
    }
  } catch {
    allProducts = memoryProducts;
  }

  const id = product.id || `prod-${Date.now().toString().slice(-6)}`;
  const existingIdx = allProducts.findIndex((p) => p.id === id);

  const fullProduct: Product = {
    id: id,
    storeSlug: product.storeSlug.toLowerCase().trim(),
    vertical: product.vertical,
    title: product.title || "Untitled Product",
    subtitle: product.subtitle || "",
    price: Number(product.price) || 0,
    originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
    category: product.category || "General",
    images: product.images && product.images.length > 0 ? product.images : [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
    ],
    rating: product.rating ?? 5.0,
    reviewsCount: product.reviewsCount ?? 0,
    inStock: product.inStock ?? true,
    isFeatured: product.isFeatured ?? false,
    isNewDrop: product.isNewDrop ?? false,
    description: product.description || "Premium merchant catalog item.",
    highlights: product.highlights || ["Verified authentic", "Fast dispatch"],
    variants: product.variants || [],
    tags: product.tags || [],
    // Vertical Metadata Preserved
    fashionMeta: (product as any).fashionMeta,
    carMeta: (product as any).carMeta,
    foodMeta: (product as any).foodMeta,
    propertyMeta: (product as any).propertyMeta,
    gadgetMeta: (product as any).gadgetMeta,
    beautyMeta: (product as any).beautyMeta,
    homeLivingMeta: (product as any).homeLivingMeta,
    pharmacyMeta: (product as any).pharmacyMeta,
    hardwareMeta: (product as any).hardwareMeta,
    retailMeta: (product as any).retailMeta,
  };

  if (existingIdx >= 0) {
    allProducts[existingIdx] = { ...allProducts[existingIdx], ...fullProduct };
  } else {
    allProducts.unshift(fullProduct);
  }

  memoryProducts = allProducts;

  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(allProducts, null, 2), "utf-8");
  } catch (err) {
    console.error("[CommerceProductsStore] Error writing to products file:", err);
  }

  return fullProduct;
}

export async function deleteStorefrontProduct(id: string, tenantSlug?: string): Promise<boolean> {
  ensureProductsFile();

  let allProducts: Product[] = [];
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      allProducts = JSON.parse(raw);
    } else {
      allProducts = memoryProducts;
    }
  } catch {
    allProducts = memoryProducts;
  }

  const prevLength = allProducts.length;
  allProducts = allProducts.filter((p) => {
    if (p.id !== id) return true;
    if (tenantSlug && p.storeSlug?.toLowerCase() !== tenantSlug.toLowerCase().trim()) return true;
    return false;
  });

  if (allProducts.length !== prevLength) {
    memoryProducts = allProducts;
    try {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(allProducts, null, 2), "utf-8");
    } catch (err) {
      console.error("[CommerceProductsStore] Error writing to products file on delete:", err);
    }
    return true;
  }

  return false;
}
