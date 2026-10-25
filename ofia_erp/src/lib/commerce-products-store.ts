import fs from "fs";
import path from "path";
import { CommerceProductItem, VerticalKey } from "./verticals";
import { getTenantSql } from "./tenant-db-resolver";

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
let memoryProducts: any[] = [];

function ensureProductsFile(): void {
  try {
    if (!fs.existsSync(SYNC_DIR)) {
      fs.mkdirSync(SYNC_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("[ERPCommerceProductsStore] File system access warning:", err);
  }
}

// Map attributes to vertical metadata for storefront compatibility
function mapAttributesToVerticalMeta(vertical: VerticalKey, attrs: Record<string, any>) {
  switch (vertical) {
    case "cars":
      return {
        make: attrs.make || "Luxury Auto",
        model: attrs.model || "",
        year: Number(attrs.year) || 2024,
        mileage: attrs.mileage ? `${attrs.mileage} km` : "0 km",
        transmission: attrs.transmission || "Automatic",
        fuelType: attrs.fuelType || "Petrol",
        condition: attrs.condition || "Brand New",
        engine: attrs.engine || "V6 / Electric",
        vin: attrs.vin || "",
        horsepower: attrs.horsepower || "400+ HP",
        drivetrain: attrs.drivetrain || "AWD",
        inspectionScore: 98,
        inspectionHighlights: ["Engine diagnostic passed", "Original paintwork"],
      };
    case "fashion":
      return {
        sizes: typeof attrs.sizes === "string" ? attrs.sizes.split(",").map((s) => s.trim()) : attrs.sizes || ["S", "M", "L", "XL"],
        colors: typeof attrs.colors === "string" ? attrs.colors.split(",").map((c) => ({ name: c.trim(), hex: "#111111" })) : [{ name: "Default", hex: "#111111" }],
        materials: typeof attrs.material === "string" ? [attrs.material] : ["Sustainable Fabric"],
        fit: attrs.fit || "Tailored Contemporary Fit",
        careInstructions: "Specialist dry clean recommended.",
        sizeGuide: [
          { size: "S", chest: "36 in", waist: "30 in", hips: "38 in" },
          { size: "M", chest: "38 in", waist: "32 in", hips: "40 in" },
          { size: "L", chest: "40 in", waist: "34 in", hips: "42 in" },
          { size: "XL", chest: "44 in", waist: "36 in", hips: "44 in" },
        ],
      };
    case "food":
      return {
        prepTime: attrs.prepTime || "25-35 mins",
        calories: Number(attrs.calories) || 550,
        dietary: attrs.dietary ? (Array.isArray(attrs.dietary) ? attrs.dietary : [attrs.dietary]) : ["Chef Special"],
        portionSizes: [
          { name: "Single Portion", price: 0, serves: "1 person" },
          { name: "Family Platter", price: 5000, serves: "3-4 persons" },
        ],
        addOns: [],
        isAvailableToday: true,
      };
    case "beauty":
      return {
        skinType: attrs.skinType ? (Array.isArray(attrs.skinType) ? attrs.skinType : [attrs.skinType]) : ["All Skin Types"],
        routineStep: attrs.routineStep || "Moisturize",
        volume: attrs.volume || "50ml",
        ingredientsHighlights: attrs.ingredientsHighlights || ["Shea Butter", "Vitamin E", "Niacinamide"],
        crueltyFree: true,
        organic: true,
      };
    case "property":
      return {
        propertyType: attrs.propertyType || "Apartment",
        location: attrs.location || "Victoria Island, Lagos",
        bedrooms: Number(attrs.bedrooms) || 3,
        bathrooms: Number(attrs.bathrooms) || 3,
        squareFeet: Number(attrs.squareFeet) || 2800,
        furnished: attrs.furnished || "Fully Furnished",
        amenities: ["24/7 Power", "Swimming Pool", "Treated Water", "Private Security"],
        rentalTerms: "Annual upfront or quarterly serviced",
        availableFrom: "Immediate",
        virtualTourAvailable: true,
      };
    case "gadgets":
      return {
        brand: attrs.brand || "Apple",
        modelYear: Number(attrs.modelYear) || 2025,
        storageOptions: attrs.storageOptions || ["256GB", "512GB", "1TB"],
        colorOptions: [{ name: "Space Black", hex: "#1c1c1e" }, { name: "Natural Titanium", hex: "#9a968f" }],
        specs: attrs.specs || { Display: "Super Retina OLED", Battery: "All-day life", Chip: "Flagship Bionic" },
        warrantyYears: Number(attrs.warrantyYears) || 2,
        warrantyDetails: "Official OEM warranty with express repair replacement",
        inTheBox: ["Device", "Fast Charging Cable", "Quick Start Guide"],
      };
    case "home-living":
      return {
        room: attrs.room || "Living Room",
        dimensions: attrs.dimensions || { height: "85 cm", width: "220 cm", depth: "95 cm", weight: "45 kg" },
        materials: attrs.materials || ["Solid Teak Wood", "Linen Upholstery"],
        finishes: [{ name: "Natural Matte", colorCode: "#C8B29B" }],
        assemblyRequired: false,
        assemblyTimeMinutes: 0,
      };
    case "pharmacy":
      return {
        dosageForm: attrs.dosageForm || "Tablet",
        strength: attrs.strength || "500mg",
        activeIngredients: attrs.activeIngredients || ["Clinical Active Compound"],
        prescriptionRequired: Boolean(attrs.prescriptionRequired),
        batchNumber: `NAF-${Math.floor(100000 + Math.random() * 900000)}`,
        expiryDate: attrs.expiryDate || "12/2027",
        packSize: attrs.packSize || "Box of 20",
        nafdacNumber: attrs.nafdacNumber || "B4-1920",
        warnings: ["Keep out of reach of children", "Store below 25°C"],
        usageInstructions: attrs.usageInstructions || "Take as prescribed by registered medical practitioner.",
      };
    case "hardware":
      return {
        powerRating: attrs.powerRating || "5kVA / 48V",
        voltage: attrs.voltage || "230V AC",
        capacity: attrs.capacity || "10.24 kWh",
        systemType: attrs.systemType || "Hybrid Inverter",
        contractorPrice: Number(attrs.contractorPrice) || 0,
        warrantyYears: Number(attrs.warrantyYears) || 5,
        installationEligible: true,
      };
    case "retail":
      return {
        department: attrs.department || "Specialty Gifts",
        authorOrBrand: attrs.authorOrBrand || "Artisan Guild",
        isbnOrSku: attrs.isbnOrSku || `SKU-${Date.now().toString().slice(-4)}`,
        giftWrapAvailable: true,
        customEngravingAvailable: true,
      };
    case "dispatch":
      return {
        vehicleType: attrs.vehicleType || "Motorbike Courier",
        maxWeightKg: Number(attrs.maxWeightKg) || 15,
        serviceZone: attrs.serviceZone || "Lagos Metro",
        deliverySpeed: attrs.deliverySpeed || "Instant Express (< 45 mins)",
      };
    default:
      return {};
  }
}

export async function getErpProducts(tenantSlug?: string, vertical?: VerticalKey): Promise<CommerceProductItem[]> {
  ensureProductsFile();

  const normalizedSlug = tenantSlug ? tenantSlug.toLowerCase().trim() : null;

  // 1. Direct query in dedicated Neon PostgreSQL database
  if (normalizedSlug) {
    try {
      const sql = await getTenantSql(normalizedSlug);
      if (sql) {
        let rows: any[] = [];
        try {
          rows = await sql`
            SELECT id, tenant_slug, COALESCE(tenant_id, '') as tenant_id, product_id, sku,
                   product_name, category, warehouse, current_stock, min_stock,
                   unit_cost, unit_price, status, supplier,
                   COALESCE(image_url, '') as image_url,
                   COALESCE(metadata, '{}'::jsonb) as metadata,
                   created_at, updated_at
            FROM shop_inventory
            WHERE LOWER(tenant_slug) = ${normalizedSlug}
            ORDER BY created_at DESC;
          `;
        } catch (colErr) {
          rows = await sql`
            SELECT id, tenant_slug, COALESCE(tenant_id, '') as tenant_id, product_id, sku,
                   product_name, category, warehouse, current_stock, min_stock,
                   unit_cost, unit_price, status, supplier, created_at, updated_at
            FROM shop_inventory
            WHERE LOWER(tenant_slug) = ${normalizedSlug}
            ORDER BY created_at DESC;
          `;
        }

        if (rows && rows.length > 0) {
          return rows.map((r: any) => {
            const meta = (typeof r.metadata === "string" ? JSON.parse(r.metadata || "{}") : r.metadata) || {};
            const imgs: string[] = Array.isArray(meta.images) && meta.images.length > 0
              ? meta.images
              : (r.image_url ? [r.image_url] : []);
            const primaryImg = r.image_url || imgs[0] || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80";

            return {
              id: r.product_id || r.id,
              name: r.product_name,
              price: Number(r.unit_price) || 0,
              formattedPrice: `₦${Number(r.unit_price || 0).toLocaleString()}`,
              category: r.category || "General",
              stock: Number(r.current_stock) || 0,
              image: primaryImg,
              images: imgs.length > 0 ? imgs : [primaryImg],
              vertical: (vertical || "retail") as VerticalKey,
              sku: r.sku,
              status: r.status === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "ACTIVE",
              attributes: meta.attributes || (meta.image ? meta : {}),
            };
          });
        }
      }
    } catch (dbErr) {
      console.warn("[ERPCommerceProductsStore] Neon query warning:", dbErr);
    }
  }

  // 2. Fallback to local sync file
  let allProducts: any[] = [];
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      allProducts = JSON.parse(raw);
    } else {
      allProducts = memoryProducts;
    }
  } catch (err) {
    allProducts = memoryProducts;
  }

  let filtered = allProducts;
  if (normalizedSlug) {
    const tenantSpecific = allProducts.filter(
      (p) =>
        p.storeSlug?.toLowerCase() === normalizedSlug ||
        p.tenantSlug?.toLowerCase() === normalizedSlug
    );
    if (tenantSpecific.length > 0) {
      filtered = tenantSpecific;
    }
  }

  if (vertical) {
    filtered = filtered.filter((p) => p.vertical === vertical);
  }

  return filtered.map((p) => ({
    id: p.id,
    name: p.title || p.name || "Untitled Item",
    price: Number(p.price) || 0,
    formattedPrice: p.formattedPrice || `₦${Number(p.price || 0).toLocaleString()}`,
    category: p.category || "General",
    stock: p.stock ?? (p.inStock ? 10 : 0),
    image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"),
    vertical: p.vertical as VerticalKey,
    sku: p.sku || `SKU-${p.id.slice(-4).toUpperCase()}`,
    status: p.status || (p.inStock ? "ACTIVE" : "OUT_OF_STOCK"),
    attributes: p.attributes || {},
  }));
}

export async function saveErpProduct(item: Partial<CommerceProductItem> & { tenantSlug: string; vertical: VerticalKey }): Promise<any> {
  ensureProductsFile();

  if (!item.tenantSlug) {
    throw new Error("tenantSlug is required to save product in dedicated database");
  }

  const cleanSlug = item.tenantSlug.toLowerCase().trim();
  const id = item.id || `PROD-${Date.now().toString().slice(-6)}`;
  const title = item.name || "Untitled Item";
  const numPrice = Number(item.price) || 0;
  const stock = Number(item.stock) || 5;
  const sku = item.sku || `SKU-${cleanSlug.toUpperCase().slice(0, 4)}-${Date.now().toString().slice(-4)}`;
  const attrs = item.attributes || {};
  const verticalMetaKey = `${item.vertical === "home-living" ? "homeLiving" : item.vertical}Meta`;

  const resolvedImages: string[] = Array.isArray(item.images) && item.images.length > 0
    ? item.images.filter(Boolean)
    : (item.image ? [item.image] : []);
  const primaryImage: string = item.image || resolvedImages[0] || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80";
  const finalImagesList: string[] = resolvedImages.length > 0 ? resolvedImages : [primaryImage];

  // 1. Direct persistence to Neon PostgreSQL shop_inventory table
  try {
    const sql = await getTenantSql(cleanSlug);
    if (sql) {
      try {
        await sql`ALTER TABLE shop_inventory ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';`;
        await sql`ALTER TABLE shop_inventory ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;`;
      } catch {}

      const productMetadata = {
        ...attrs,
        image: primaryImage,
        images: finalImagesList,
      };

      await sql`
        INSERT INTO shop_inventory (
          id, tenant_slug, tenant_id, product_id, sku, product_name, category,
          warehouse, current_stock, min_stock, unit_cost, unit_price, status, supplier,
          image_url, metadata, created_at, updated_at
        ) VALUES (
          ${id}, ${cleanSlug}, ${`org-${cleanSlug}`}, ${id}, ${sku},
          ${title}, ${item.category || "General"}, 'Main Warehouse', ${stock}, 2,
          ${Math.round(numPrice * 0.7)}, ${numPrice}, ${stock > 0 ? "IN_STOCK" : "OUT_OF_STOCK"}, 'Direct Supplier',
          ${primaryImage}, ${JSON.stringify(productMetadata)}::jsonb, NOW(), NOW()
        )
        ON CONFLICT (tenant_slug, sku) DO UPDATE SET
          product_name = EXCLUDED.product_name,
          category = EXCLUDED.category,
          current_stock = EXCLUDED.current_stock,
          unit_price = EXCLUDED.unit_price,
          status = EXCLUDED.status,
          image_url = EXCLUDED.image_url,
          metadata = EXCLUDED.metadata,
          updated_at = NOW();
      `;
    }
  } catch (err: any) {
    console.warn("[ERPCommerceProductsStore] Neon saveProduct warning:", err.message);
  }

  // 2. Mirror to local file for cache compatibility
  const syncProduct: any = {
    id: id,
    storeSlug: cleanSlug,
    tenantSlug: cleanSlug,
    vertical: item.vertical,
    title: title,
    subtitle: attrs.subtitle || "",
    price: numPrice,
    formattedPrice: `₦${numPrice.toLocaleString()}`,
    category: item.category || "General",
    stock: stock,
    image: primaryImage,
    images: finalImagesList,
    rating: 5.0,
    reviewsCount: 12,
    inStock: stock > 0,
    isFeatured: true,
    isNewDrop: true,
    description: attrs.description || `Premium ${item.vertical} item offered with certified quality standards.`,
    highlights: ["Verified quality", "Immediate dispatch available"],
    sku: sku,
    status: item.status || (stock > 0 ? "ACTIVE" : "OUT_OF_STOCK"),
    attributes: attrs,
    [verticalMetaKey]: mapAttributesToVerticalMeta(item.vertical, attrs),
    updatedAt: new Date().toISOString(),
  };

  let allProducts: any[] = [];
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

  const existingIdx = allProducts.findIndex((p) => p.id === id || p.sku === sku);
  if (existingIdx >= 0) {
    allProducts[existingIdx] = { ...allProducts[existingIdx], ...syncProduct };
  } else {
    syncProduct.createdAt = new Date().toISOString();
    allProducts.unshift(syncProduct);
  }

  memoryProducts = allProducts;
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(allProducts, null, 2), "utf-8");
  } catch {}

  return syncProduct;
}

export async function deleteErpProduct(id: string, tenantSlug?: string): Promise<boolean> {
  ensureProductsFile();

  if (tenantSlug) {
    const cleanSlug = tenantSlug.toLowerCase().trim();
    try {
      const sql = await getTenantSql(cleanSlug);
      if (sql) {
        await sql`
          DELETE FROM shop_inventory
          WHERE (id = ${id} OR product_id = ${id} OR sku = ${id})
            AND LOWER(tenant_slug) = ${cleanSlug};
        `;
      }
    } catch (err: any) {
      console.warn("[ERPCommerceProductsStore] Neon deleteProduct warning:", err.message);
    }
  }

  let allProducts: any[] = [];
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

  const prevLen = allProducts.length;
  allProducts = allProducts.filter((p) => {
    if (p.id !== id && p.sku !== id) return true;
    if (tenantSlug && p.storeSlug?.toLowerCase() !== tenantSlug.toLowerCase().trim()) return true;
    return false;
  });

  if (allProducts.length !== prevLen) {
    memoryProducts = allProducts;
    try {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(allProducts, null, 2), "utf-8");
    } catch {}
    return true;
  }

  return true;
}
