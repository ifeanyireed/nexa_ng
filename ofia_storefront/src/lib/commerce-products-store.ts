import fs from "fs";
import path from "path";
import { Product, VerticalType } from "@/types/storefront";
import { MOCK_PRODUCTS } from "@/data/mockStores";
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

// Helper to ensure file exists with seed data
function ensureProductsFile(): void {
  try {
    if (!fs.existsSync(SYNC_DIR)) {
      fs.mkdirSync(SYNC_DIR, { recursive: true });
    }
    if (!fs.existsSync(PRODUCTS_FILE)) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(MOCK_PRODUCTS, null, 2), "utf-8");
      memoryProducts = [...MOCK_PRODUCTS];
    }
  } catch (err) {
    console.warn("[CommerceProductsStore] File system access warning, using in-memory store:", err);
    if (memoryProducts.length === 0) {
      memoryProducts = [...MOCK_PRODUCTS];
    }
  }
}

export async function getStorefrontProducts(
  tenantSlug?: string,
  vertical?: VerticalType
): Promise<{ products: Product[]; isLiveMerchantCatalog: boolean }> {
  ensureProductsFile();

  const normalizedSlug = tenantSlug ? tenantSlug.toLowerCase().trim() : null;

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
    // do NOT serve car inventory as fashion products! Return the vertical's curated template products.
    if (vertical && tenantVertical && tenantVertical !== vertical) {
      const fallbackList = MOCK_PRODUCTS.filter((p) => p.vertical === vertical);
      return { products: fallbackList, isLiveMerchantCatalog: false };
    }

    try {
      const sql = await getTenantSql(normalizedSlug);
      if (sql) {
        const rows = await sql`
          SELECT id, product_id, sku, product_name, category, current_stock, unit_price, status
          FROM shop_inventory
          WHERE LOWER(tenant_slug) = ${normalizedSlug}
          ORDER BY (current_stock > 0) DESC, created_at DESC
          LIMIT 100
        `;

        if (rows && rows.length > 0) {
          const resolvedVertical = tenantVertical || vertical || "retail";
          const isFashion = resolvedVertical === "fashion";

          const FASHION_EDITORIAL_IMAGES = [
            "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
          ];

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

          const liveProducts: Product[] = rows.map((r: any, idx: number) => ({
            id: r.product_id || r.id,
            storeSlug: normalizedSlug,
            vertical: resolvedVertical,
            title: r.product_name,
            subtitle: isFashion
              ? "Artisanal cut tailored with sustainable heritage textiles"
              : undefined,
            price: Number(r.unit_price) || 0,
            category: r.category || (isFashion ? "Couture & Tailoring" : "General"),
            images: isFashion
              ? [FASHION_EDITORIAL_IMAGES[idx % FASHION_EDITORIAL_IMAGES.length]]
              : [
                  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
                ],
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
                  sizes: ["XS", "S", "M", "L", "XL", "Bespoke Fit"],
                  colors: FASHION_PALETTES[idx % FASHION_PALETTES.length],
                  materials: ["100% Normandy Flax Linen", "Handwoven Aso-Oke"],
                  fit: "Relaxed tailored silhouette with comfortable drape",
                  careInstructions: "Specialist dry clean or delicate cold hand wash.",
                  sizeGuide: [
                    { size: "S", chest: "36 - 38 in", waist: "30 - 32 in", hips: "36 - 38 in" },
                    { size: "M", chest: "40 - 42 in", waist: "33 - 35 in", hips: "40 - 42 in" },
                    { size: "L", chest: "44 - 46 in", waist: "36 - 38 in", hips: "44 - 46 in" },
                    { size: "XL", chest: "48 - 50 in", waist: "40 - 42 in", hips: "48 - 50 in" },
                  ],
                }
              : undefined,
            variants: [],
            tags: [r.category || (isFashion ? "Fashion" : "General"), "Bespoke"],
          }));

          return { products: liveProducts, isLiveMerchantCatalog: true };
        }
      }
    } catch (err) {
      console.warn(`[CommerceProductsStore] Live inventory lookup error for tenant '${normalizedSlug}':`, err);
    }
  }

  let allProducts: Product[] = [];

  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      allProducts = JSON.parse(raw);
    } else {
      allProducts = memoryProducts;
    }
  } catch (err) {
    console.error("[CommerceProductsStore] Error reading products file:", err);
    allProducts = memoryProducts.length > 0 ? memoryProducts : MOCK_PRODUCTS;
  }

  // 2. If tenant is specified, search for merchant-specific products in local cache
  if (normalizedSlug) {
    const merchantProducts = allProducts.filter(
      (p) =>
        p.storeSlug?.toLowerCase() === normalizedSlug ||
        (p as any).tenantSlug?.toLowerCase() === normalizedSlug
    );

    if (merchantProducts.length > 0) {
      if (vertical) {
        const filtered = merchantProducts.filter((p) => p.vertical === vertical);
        if (filtered.length > 0) {
          return { products: filtered, isLiveMerchantCatalog: true };
        }
        // If merchant has cached products but none match the requested vertical, fall back to mock products
        const fallbackList = MOCK_PRODUCTS.filter((p) => p.vertical === vertical);
        return { products: fallbackList, isLiveMerchantCatalog: false };
      }
      return { products: merchantProducts, isLiveMerchantCatalog: true };
    }
  }

  // 3. Fallback to vertical mock seeds
  let fallbackList = allProducts;
  if (vertical) {
    fallbackList = allProducts.filter((p) => p.vertical === vertical);
    if (fallbackList.length === 0) {
      fallbackList = MOCK_PRODUCTS.filter((p) => p.vertical === vertical);
    }
  }

  return { products: fallbackList, isLiveMerchantCatalog: false };
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
