import fs from "fs";
import path from "path";
import { Product, VerticalType } from "@/types/storefront";
import { MOCK_PRODUCTS } from "@/data/mockStores";

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

  const normalizedSlug = tenantSlug ? tenantSlug.toLowerCase().trim() : null;

  // 1. If tenant is specified, search for merchant-specific products
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
      }
      return { products: merchantProducts, isLiveMerchantCatalog: true };
    }
  }

  // 2. Fallback to vertical mock seeds
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
