import fs from "fs";
import path from "path";
import { CommerceProductItem, VerticalKey } from "./verticals";

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
    default:
      return {};
  }
}

export async function getErpProducts(tenantSlug?: string, vertical?: VerticalKey): Promise<CommerceProductItem[]> {
  ensureProductsFile();

  let allProducts: any[] = [];
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      allProducts = JSON.parse(raw);
    } else {
      allProducts = memoryProducts;
    }
  } catch (err) {
    console.error("[ERPCommerceProductsStore] Error reading products:", err);
    allProducts = memoryProducts;
  }

  const normalizedSlug = tenantSlug ? tenantSlug.toLowerCase().trim() : null;

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

  // Convert to CommerceProductItem format
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

  const id = item.id || `PROD-${Date.now().toString().slice(-6)}`;
  const title = item.name || "Untitled Item";
  const numPrice = Number(item.price) || 0;
  const attrs = item.attributes || {};
  const verticalMetaKey = `${item.vertical === "home-living" ? "homeLiving" : item.vertical}Meta`;

  const syncProduct: any = {
    id: id,
    storeSlug: item.tenantSlug.toLowerCase().trim(),
    tenantSlug: item.tenantSlug.toLowerCase().trim(),
    vertical: item.vertical,
    title: title,
    subtitle: attrs.subtitle || "",
    price: numPrice,
    formattedPrice: `₦${numPrice.toLocaleString()}`,
    category: item.category || "General",
    stock: Number(item.stock) || 5,
    images: item.image ? [item.image] : ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"],
    rating: 5.0,
    reviewsCount: 12,
    inStock: (Number(item.stock) || 5) > 0,
    isFeatured: true,
    isNewDrop: true,
    description: attrs.description || `Premium ${item.vertical} item offered with certified quality standards.`,
    highlights: ["Verified quality", "Immediate dispatch available"],
    sku: item.sku || `SKU-${Date.now().toString().slice(-4)}`,
    status: item.status || "ACTIVE",
    attributes: attrs,
    [verticalMetaKey]: mapAttributesToVerticalMeta(item.vertical, attrs),
    updatedAt: new Date().toISOString(),
  };

  const existingIdx = allProducts.findIndex((p) => p.id === id);
  if (existingIdx >= 0) {
    allProducts[existingIdx] = { ...allProducts[existingIdx], ...syncProduct };
  } else {
    syncProduct.createdAt = new Date().toISOString();
    allProducts.unshift(syncProduct);
  }

  memoryProducts = allProducts;

  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(allProducts, null, 2), "utf-8");
  } catch (err) {
    console.error("[ERPCommerceProductsStore] Error writing to products file:", err);
  }

  return syncProduct;
}

export async function deleteErpProduct(id: string, tenantSlug?: string): Promise<boolean> {
  ensureProductsFile();

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
    if (p.id !== id) return true;
    if (tenantSlug && p.storeSlug?.toLowerCase() !== tenantSlug.toLowerCase().trim()) return true;
    return false;
  });

  if (allProducts.length !== prevLen) {
    memoryProducts = allProducts;
    try {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(allProducts, null, 2), "utf-8");
    } catch (err) {
      console.error("[ERPCommerceProductsStore] Error writing products file on delete:", err);
    }
    return true;
  }

  return false;
}
