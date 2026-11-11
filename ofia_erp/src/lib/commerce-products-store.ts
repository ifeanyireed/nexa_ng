import fs from "fs";
import path from "path";
import { CommerceProductItem, VerticalKey, AFRICAN_PRINT_PRESETS } from "./verticals";
import { getTenantSql, getTenantDatabaseConfig } from "./tenant-db-resolver";

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
      const sizes = typeof attrs.sizes === "string"
        ? attrs.sizes.split(",").map((s: string) => s.trim()).filter(Boolean)
        : Array.isArray(attrs.sizes) ? attrs.sizes : ["S", "M", "L", "XL"];

      const rawColors = attrs.fashionColors || attrs.colors;
      let colors: Array<{ name: string; hex: string }> = [];
      if (Array.isArray(rawColors) && rawColors.length > 0) {
        colors = rawColors.map((c: any) => {
          if (typeof c === "string") {
            const name = c.trim();
            return { name, hex: resolveColorHex(name, undefined, attrs.variants) };
          }
          const name = c.name || "Default";
          return { name, hex: resolveColorHex(name, c.hex, attrs.variants) };
        }).filter((c) => c.name);
      } else if (typeof rawColors === "string" && rawColors.trim()) {
        colors = rawColors.split(",").map((c: string) => {
          const name = c.trim();
          return { name, hex: resolveColorHex(name, undefined, attrs.variants) };
        }).filter((c) => c.name);
      } else if (Array.isArray(attrs.variants) && attrs.variants.length > 0) {
        const uniqueColors = Array.from(new Set(attrs.variants.map((v: any) => v.color).filter(Boolean))) as string[];
        if (uniqueColors.length > 0) {
          colors = uniqueColors.map((name) => {
            const vMatch = attrs.variants.find((v: any) => v.color === name);
            return { name, hex: resolveColorHex(name, vMatch?.colorHex, attrs.variants) };
          });
        }
      }
      if (colors.length === 0) {
        colors = [{ name: "Rich Gold", hex: "#D97706" }];
      }

      const rawPrints = attrs.fashionPrints || attrs.prints;
      let prints: any[] = [];
      if (Array.isArray(rawPrints) && rawPrints.length > 0) {
        prints = rawPrints.map((p) => {
          if (typeof p === "string") {
            const trimmed = p.trim();
            const found = AFRICAN_PRINT_PRESETS.find((pre) => pre.name.toLowerCase() === trimmed.toLowerCase());
            const vMatch = Array.isArray(attrs.variants)
              ? attrs.variants.find((v: any) => v.print?.toLowerCase() === trimmed.toLowerCase())
              : null;
            return {
              name: trimmed,
              image: vMatch?.printImage || found?.image || "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
              description: found?.description || "Artisanal African fabric print",
            };
          }
          return {
            name: p.name || "African Print",
            image: p.image || "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
            description: p.description || "Artisanal African fabric print",
          };
        });
      } else if (typeof rawPrints === "string" && rawPrints.trim()) {
        prints = rawPrints.split(",").map((s: string) => {
          const name = s.trim();
          const found = AFRICAN_PRINT_PRESETS.find((pre) => pre.name.toLowerCase() === name.toLowerCase());
          const vMatch = Array.isArray(attrs.variants)
            ? attrs.variants.find((v: any) => v.print?.toLowerCase() === name.toLowerCase())
            : null;
          return {
            name,
            image: vMatch?.printImage || found?.image || "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
            description: found?.description || "Artisanal African fabric print",
          };
        }).filter((p) => p.name);
      } else if (attrs.variants && Array.isArray(attrs.variants)) {
        const uniquePrintNames = Array.from(new Set(attrs.variants.map((v: any) => v.print).filter(Boolean)));
        prints = uniquePrintNames.map((name) => {
          const varMatch = attrs.variants.find((v: any) => v.print === name);
          const found = AFRICAN_PRINT_PRESETS.find((pre) => pre.name.toLowerCase() === (name as string).toLowerCase());
          return {
            name,
            image: varMatch?.printImage || found?.image || "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
            description: found?.description || "Artisanal African fabric print",
          };
        });
      }

      return {
        sizes,
        colors,
        prints,
        materials: typeof attrs.material === "string" ? [attrs.material] : ["Sustainable African Heritage Fabric"],
        fit: attrs.fit || "Tailored Contemporary Fit",
        careInstructions: "Specialist dry clean or gentle hand wash recommended.",
        sizeGuide: [
          { size: "S", chest: "36 in", waist: "30 in", hips: "38 in" },
          { size: "M", chest: "38 in", waist: "32 in", hips: "40 in" },
          { size: "L", chest: "40 in", waist: "34 in", hips: "42 in" },
          { size: "XL", chest: "44 in", waist: "36 in", hips: "44 in" },
          { size: "2XL", chest: "48 in", waist: "40 in", hips: "48 in" },
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
          let tenantVertical: VerticalKey | undefined = undefined;
          try {
            const dbConf = await getTenantDatabaseConfig(normalizedSlug);
            if (dbConf.vertical) {
              tenantVertical = dbConf.vertical as VerticalKey;
            }
          } catch {}

          const effectiveVertical: VerticalKey = (vertical || tenantVertical || "retail") as VerticalKey;
          const verticalFallbacks = VERTICAL_EDITORIAL_FALLBACK_IMAGES[effectiveVertical] || VERTICAL_EDITORIAL_FALLBACK_IMAGES.retail;

          const masterRows = rows.filter((r: any) => {
            const meta = (typeof r.metadata === "string" ? JSON.parse(r.metadata || "{}") : r.metadata) || {};
            return !meta.parentId;
          });

          return masterRows.map((r: any, idx: number) => {
            const meta = (typeof r.metadata === "string" ? JSON.parse(r.metadata || "{}") : r.metadata) || {};
            const imgs: string[] = Array.isArray(meta.images) && meta.images.length > 0
              ? meta.images.filter(Boolean)
              : (r.image_url ? [r.image_url] : []);
            const fallbackImg = verticalFallbacks[idx % verticalFallbacks.length];
            const primaryImg = (r.image_url && r.image_url.trim()) || imgs[0] || fallbackImg;

            return {
              id: r.product_id || r.id,
              name: r.product_name,
              price: Number(r.unit_price) || 0,
              formattedPrice: `₦${Number(r.unit_price || 0).toLocaleString()}`,
              category: r.category || "General",
              stock: Number(r.current_stock) || 0,
              image: primaryImg,
              images: imgs.length > 0 ? imgs : [primaryImg],
              vertical: effectiveVertical,
              sku: r.sku,
              status: r.status === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "ACTIVE",
              attributes: meta.attributes || (meta.image ? meta : {}),
              variants: Array.isArray(meta.variants) ? meta.variants : [],
            };
          });
        }
        return [];
      }
    } catch (dbErr) {
      console.warn("[ERPCommerceProductsStore] Neon database error:", dbErr);
      throw new Error("Connect to Internet");
    }
  }

  return [];
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
  const hasVariants = Array.isArray(item.variants) && item.variants.length > 0;
  const stock = hasVariants
    ? item.variants!.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
    : Number(item.stock) || 5;
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
        variants: item.variants || [],
        fashionMeta: item.vertical === "fashion" ? mapAttributesToVerticalMeta("fashion", attrs) : undefined,
      };

      // 1a. Upsert parent master product record
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

      // 1b. Upsert discrete SKU matrix variant inventory records for checkout synchronization
      if (hasVariants) {
        for (const v of item.variants!) {
          const varSku = v.sku || `${sku}-${(v.size || "STD").toUpperCase()}`;
          const varPrice = Number(v.price) || numPrice;
          const varStock = Number(v.stock) || 0;
          const varTitle = `${title} (${[v.print, v.color, v.size].filter(Boolean).join(" · ")})`;
          const varMeta = {
            ...v,
            parentId: id,
            parentSku: sku,
            image: v.image || primaryImage,
          };

          await sql`
            INSERT INTO shop_inventory (
              id, tenant_slug, tenant_id, product_id, sku, product_name, category,
              warehouse, current_stock, min_stock, unit_cost, unit_price, status, supplier,
              image_url, metadata, created_at, updated_at
            ) VALUES (
              ${v.id || `${id}-${varSku}`}, ${cleanSlug}, ${`org-${cleanSlug}`}, ${id}, ${varSku},
              ${varTitle}, ${item.category || "General"}, 'Main Warehouse', ${varStock}, 1,
              ${Math.round(varPrice * 0.7)}, ${varPrice}, ${varStock > 0 ? "IN_STOCK" : "OUT_OF_STOCK"}, 'Direct Supplier',
              ${v.image || primaryImage}, ${JSON.stringify(varMeta)}::jsonb, NOW(), NOW()
            )
            ON CONFLICT (tenant_slug, sku) DO UPDATE SET
              product_name = EXCLUDED.product_name,
              current_stock = EXCLUDED.current_stock,
              unit_price = EXCLUDED.unit_price,
              status = EXCLUDED.status,
              image_url = EXCLUDED.image_url,
              metadata = EXCLUDED.metadata,
              updated_at = NOW();
          `;
        }
      }
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
    variants: item.variants || [],
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
