export type VerticalKey =
  | "fashion"
  | "cars"
  | "food"
  | "property"
  | "gadgets"
  | "beauty"
  | "home-living"
  | "pharmacy"
  | "hardware"
  | "retail";

export interface VerticalDefinition {
  id: VerticalKey;
  name: string;
  tagline: string;
  badge: string;
  icon: string;
  productTerm: string;
  productTermPlural: string;
  serviceTerm: string;
  storefrontPath: string;
  attributeFields: {
    key: string;
    label: string;
    type: "text" | "number" | "select" | "boolean" | "tags";
    options?: string[];
    placeholder?: string;
    helpText?: string;
  }[];
}

export const VERTICAL_DEFINITIONS: Record<VerticalKey, VerticalDefinition> = {
  fashion: {
    id: "fashion",
    name: "Fashion & Apparel",
    tagline: "Collections, lookbooks, size/color matrices and seasonal drops",
    badge: "Apparel & Style",
    icon: "Shirt",
    productTerm: "Apparel Item",
    productTermPlural: "Apparel & Accessories",
    serviceTerm: "Tailoring & Alterations",
    storefrontPath: "/fashion",
    attributeFields: [
      { key: "sizes", label: "Available Sizes", type: "tags", placeholder: "e.g. XS, S, M, L, XL, XXL" },
      { key: "colors", label: "Color Palette", type: "tags", placeholder: "e.g. Midnight Black, Emerald Green, Ivory" },
      { key: "material", label: "Fabric & Material", type: "text", placeholder: "e.g. 100% Egyptian Cotton, Raw Silk" },
      { key: "season", label: "Collection / Season", type: "select", options: ["Spring/Summer 2026", "Fall/Winter 2026", "All-Season Core", "Bridal & Ceremonial"] },
    ],
  },
  cars: {
    id: "cars",
    name: "Cars & Automotive",
    tagline: "Vehicle galleries, specifications, mileage, inspection & test drives",
    badge: "Auto & Mobility",
    icon: "Car",
    productTerm: "Vehicle Listing",
    productTermPlural: "Vehicle Fleet & Parts",
    serviceTerm: "Test Drive & Inspection",
    storefrontPath: "/cars",
    attributeFields: [
      { key: "make", label: "Vehicle Make", type: "text", placeholder: "e.g. Toyota, Mercedes-Benz, Lexus" },
      { key: "model", label: "Model & Trim", type: "text", placeholder: "e.g. Land Cruiser 300 VXR, GLE 450" },
      { key: "year", label: "Year of Manufacture", type: "number", placeholder: "2024" },
      { key: "mileage", label: "Mileage (km)", type: "number", placeholder: "35000" },
      { key: "transmission", label: "Transmission", type: "select", options: ["Automatic", "Manual", "Dual-Clutch / Tiptronic", "EV Direct Drive"] },
      { key: "fuelType", label: "Powertrain / Fuel", type: "select", options: ["Petrol", "Diesel", "Hybrid", "Electric (EV)"] },
      { key: "condition", label: "Condition Rating", type: "select", options: ["Brand New (0km)", "Foreign Used (Tokunbo)", "Locally Certified Pre-Owned"] },
      { key: "vin", label: "VIN / Chassis No.", type: "text", placeholder: "17-character chassis number" },
    ],
  },
  food: {
    id: "food",
    name: "Food & Groceries",
    tagline: "Menus, meal portions, kitchen prep time, availability & catering",
    badge: "Dining & Pantry",
    icon: "Utensils",
    productTerm: "Menu Dish",
    productTermPlural: "Menu & Pantry Items",
    serviceTerm: "Catering & Event Orders",
    storefrontPath: "/food",
    attributeFields: [
      { key: "prepTime", label: "Prep Time (minutes)", type: "number", placeholder: "25" },
      { key: "portion", label: "Portion Size", type: "select", options: ["Single Portion", "Double / Sharing", "Family Platter", "Bulk Tray (5-10 Pax)"] },
      { key: "dietary", label: "Dietary Badges", type: "tags", placeholder: "e.g. Halal, Vegan, Gluten-Free, Spicy" },
      { key: "temperature", label: "Serving Temperature", type: "select", options: ["Cooked Hot-to-Order", "Chilled", "Frozen", "Room Temperature"] },
      { key: "isAvailableToday", label: "Available Today", type: "boolean" },
    ],
  },
  property: {
    id: "property",
    name: "Property Rentals",
    tagline: "Apartments, short-lets, commercial spaces, viewings & amenities",
    badge: "Real Estate & Stays",
    icon: "Building",
    productTerm: "Property Listing",
    productTermPlural: "Listings & Spaces",
    serviceTerm: "Physical Viewing Inspection",
    storefrontPath: "/property",
    attributeFields: [
      { key: "propertyType", label: "Property Type", type: "select", options: ["Short-Let Luxury Apartment", "Duplex / Villa", "Commercial Office Suite", "Self-Contain Studio", "Warehouse Space"] },
      { key: "bedrooms", label: "Bedrooms", type: "number", placeholder: "3" },
      { key: "bathrooms", label: "Bathrooms", type: "number", placeholder: "3.5" },
      { key: "areaSqm", label: "Floor Area (sqm)", type: "number", placeholder: "240" },
      { key: "furnished", label: "Furnishing Status", type: "select", options: ["Fully Furnished & Serviced", "Semi-Furnished", "Unfurnished"] },
      { key: "leaseTerm", label: "Rental Cadence", type: "select", options: ["Daily Rate (Short-let)", "Monthly Retainer", "Annual Lease"] },
    ],
  },
  gadgets: {
    id: "gadgets",
    name: "Gadgets & Electronics",
    tagline: "Smartphones, laptops, hardware specs, warranty & device repair",
    badge: "Tech & Devices",
    icon: "Smartphone",
    productTerm: "Electronic Device",
    productTermPlural: "Gadgets & Tech",
    serviceTerm: "Device Diagnostics & Repair",
    storefrontPath: "/gadgets",
    attributeFields: [
      { key: "brand", label: "Manufacturer Brand", type: "text", placeholder: "e.g. Apple, Samsung, Dell, Sony" },
      { key: "storage", label: "Storage Capacity", type: "select", options: ["128GB", "256GB", "512GB", "1TB", "2TB+"] },
      { key: "ram", label: "System RAM", type: "select", options: ["8GB", "16GB", "32GB", "64GB"] },
      { key: "warrantyMonths", label: "Warranty Coverage (Months)", type: "number", placeholder: "12" },
      { key: "condition", label: "Grade Condition", type: "select", options: ["Brand New Sealed", "Certified Open Box", "Refurbished Grade A"] },
    ],
  },
  beauty: {
    id: "beauty",
    name: "Beauty & Personal Care",
    tagline: "Skincare, cosmetics, salon appointments, treatments & spas",
    badge: "Wellness & Salon",
    icon: "Sparkles",
    productTerm: "Beauty Product",
    productTermPlural: "Products & Treatments",
    serviceTerm: "Salon & Spa Appointment",
    storefrontPath: "/beauty",
    attributeFields: [
      { key: "beautyCategory", label: "Category", type: "select", options: ["Skincare & Serums", "Hair Care & Extensions", "Luxury Fragrance", "Makeup & Color", "Spa & Body Essentials"] },
      { key: "skinType", label: "Skin/Hair Type", type: "tags", placeholder: "e.g. All Skin Types, Sensitive, Oily, Curly" },
      { key: "volume", label: "Net Volume / Weight", type: "text", placeholder: "e.g. 50ml / 1.7 fl oz" },
      { key: "organicCertified", label: "Cruelty-Free / Organic", type: "boolean" },
    ],
  },
  "home-living": {
    id: "home-living",
    name: "Home & Living",
    tagline: "Furniture, dimensions, interior materials, delivery & installation",
    badge: "Furnishings & Decor",
    icon: "Home",
    productTerm: "Furniture Item",
    productTermPlural: "Home & Decor Items",
    serviceTerm: "Assembly & White-Glove Setup",
    storefrontPath: "/home-living",
    attributeFields: [
      { key: "roomType", label: "Room Category", type: "select", options: ["Living Room", "Executive Office", "Master Bedroom", "Dining Room", "Outdoor & Patio"] },
      { key: "dimensions", label: "Dimensions (W x D x H cm)", type: "text", placeholder: "e.g. 210 x 95 x 85 cm" },
      { key: "primaryMaterial", label: "Crafting Material", type: "text", placeholder: "e.g. Solid Teak Wood, Italian Top-Grain Leather" },
      { key: "assemblyRequired", label: "Assembly Required On Delivery", type: "boolean" },
    ],
  },
  pharmacy: {
    id: "pharmacy",
    name: "Health & Pharmacy",
    tagline: "Medications, active ingredients, batch expiry & prescription approvals",
    badge: "Healthcare & OTC",
    icon: "Activity",
    productTerm: "Medication / Drug",
    productTermPlural: "Medicines & Health Supplies",
    serviceTerm: "Pharmacist Tele-Consultation",
    storefrontPath: "/pharmacy",
    attributeFields: [
      { key: "activeIngredient", label: "Active Pharmaceutical Ingredient", type: "text", placeholder: "e.g. Paracetamol 500mg, Amoxicillin 250mg" },
      { key: "dosageForm", label: "Dosage Form", type: "select", options: ["Film-Coated Tablets", "Oral Suspension Syrup", "Injectable Ampoule", "Capsules", "Topical Gel/Ointment"] },
      { key: "batchNumber", label: "Batch Lot Number", type: "text", placeholder: "e.g. BATCH-2026-X89" },
      { key: "expiryDate", label: "Expiry Date (MM/YYYY)", type: "text", placeholder: "12/2027" },
      { key: "prescriptionRequired", label: "Doctor's Prescription Required (Rx)", type: "boolean" },
      { key: "nafdacNumber", label: "NAFDAC Reg No.", type: "text", placeholder: "A4-1234" },
    ],
  },
  hardware: {
    id: "hardware",
    name: "Hardware, Energy & Industrial",
    tagline: "Solar panels, inverters, kVA ratings, electrical supplies & contractor RFQs",
    badge: "Energy & Industrial",
    icon: "Zap",
    productTerm: "Equipment / SKU",
    productTermPlural: "Power & Building Equipment",
    serviceTerm: "Solar Sizing & Site Installation",
    storefrontPath: "/hardware",
    attributeFields: [
      { key: "powerRatingKva", label: "Power Output (kVA / kW)", type: "text", placeholder: "e.g. 5.0 kVA / 48V Pure Sine Wave" },
      { key: "batteryCapacityAh", label: "Battery Chemistry & Ah", type: "text", placeholder: "e.g. 100Ah 51.2V LiFePO4" },
      { key: "voltageTier", label: "Nominal Voltage", type: "select", options: ["12V DC", "24V DC", "48V DC", "220V - 240V AC", "3-Phase 415V Industrial"] },
      { key: "warrantyYears", label: "Manufacturer Warranty (Years)", type: "number", placeholder: "5" },
      { key: "contractorBulkDiscount", label: "Contractor Tiered Pricing Available", type: "boolean" },
    ],
  },
  retail: {
    id: "retail",
    name: "General Retail & Specialty Goods",
    tagline: "Multi-department catalog, dynamic attribute tags, bundles & personalization",
    badge: "General Commerce",
    icon: "ShoppingBag",
    productTerm: "Retail SKU",
    productTermPlural: "Retail Products",
    serviceTerm: "Personalization & Gift Packaging",
    storefrontPath: "/retail",
    attributeFields: [
      { key: "department", label: "Store Department", type: "select", options: ["Books & Stationery", "Sports & Fitness", "Baby & Nursery", "Hobby, Art & Crafts", "Specialty Gifts"] },
      { key: "brand", label: "Brand / Publisher", type: "text", placeholder: "e.g. Penguin, Nike, Faber-Castell" },
      { key: "barcode", label: "UPC / EAN Barcode", type: "text", placeholder: "012345678905" },
      { key: "personalizationOption", label: "Custom Engraving / Monogramming", type: "boolean" },
    ],
  },
};

/**
 * Detect the active commerce vertical for an organization based on tenant slug,
 * business name, or stored preferences.
 */
export function detectTenantVertical(
  tenantSlug?: string | null,
  organizationName?: string | null
): VerticalKey {
  const slug = (tenantSlug || "").toLowerCase();
  const name = (organizationName || "").toLowerCase();
  const combined = `${slug} ${name}`;

  if (combined.includes("transport") || combined.includes("nets") || combined.includes("car") || combined.includes("auto") || combined.includes("fleet")) {
    return "cars";
  }
  if (combined.includes("food") || combined.includes("kitchen") || combined.includes("restaurant") || combined.includes("bites") || combined.includes("cafe")) {
    return "food";
  }
  if (combined.includes("fashion") || combined.includes("apparel") || combined.includes("wear") || combined.includes("couture") || combined.includes("style")) {
    return "fashion";
  }
  if (combined.includes("health") || combined.includes("pharma") || combined.includes("pulse") || combined.includes("med") || combined.includes("clinic")) {
    return "pharmacy";
  }
  if (combined.includes("solar") || combined.includes("energy") || combined.includes("power") || combined.includes("hardware") || combined.includes("tool")) {
    return "hardware";
  }
  if (combined.includes("estate") || combined.includes("prop") || combined.includes("rent") || combined.includes("suites") || combined.includes("apart")) {
    return "property";
  }
  if (combined.includes("gadget") || combined.includes("tech") || combined.includes("phone") || combined.includes("device")) {
    return "gadgets";
  }
  if (combined.includes("beauty") || combined.includes("salon") || combined.includes("spa") || combined.includes("glow")) {
    return "beauty";
  }
  if (combined.includes("home") || combined.includes("living") || combined.includes("decor") || combined.includes("furnish")) {
    return "home-living";
  }

  // Default fallback to General Retail / Specialty Goods
  return "retail";
}

export interface CommerceProductItem {
  id: string;
  name: string;
  price: number;
  formattedPrice: string;
  category: string;
  stock: number;
  image: string;
  vertical: VerticalKey;
  sku: string;
  status: "ACTIVE" | "LOW_STOCK" | "OUT_OF_STOCK" | "DRAFT";
  attributes: Record<string, any>;
}

export interface CommerceServiceItem {
  id: string;
  title: string;
  price: number;
  formattedPrice: string;
  durationMinutes: number;
  providerName: string;
  vertical: VerticalKey;
  status: "ACTIVE" | "PAUSED";
  description: string;
}

export interface CommerceBookingItem {
  id: string;
  bookingNumber?: string;
  tenantSlug?: string;
  tenantId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceTitle: string;
  dateTime: string;
  status: "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELLED";
  notes?: string;
  vertical: VerticalKey;
  createdAt?: string;
}

export interface CommerceOrderItem {
  id: string;
  orderNumber: string;
  tenantSlug?: string;
  tenantId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  channel: "STOREFRONT" | "POS_COUNTER" | "INQUIRY";
  itemsSummary: string;
  itemCount: number;
  totalAmount: string;
  rawAmount: number;
  status: "PENDING" | "CONFIRMED" | "IN_PREPARATION" | "READY_DISPATCH" | "DELIVERED";
  paymentStatus: "PAID" | "PENDING" | "REFUNDED";
  createdAt: string;
  deliveryMethod: "DISPATCH" | "STORE_PICKUP";
  shippingAddress?: string;
  city?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface TenantStorefrontHandshake {
  tenantId: string;
  slug: string;
  name: string;
  domain: string;
  subdomain: string;
  vertical: VerticalKey;
  provisioning: {
    isShopEnabled: boolean;
    planTier: string;
    shopSubModules: {
      pos?: boolean;
      inventory?: boolean;
      catalog?: boolean;
      services?: boolean;
      orders?: boolean;
      store?: boolean;
      referrals?: boolean;
      [key: string]: boolean | undefined;
    };
  };
  storefrontConfig: {
    storeName: string;
    headline: string;
    description?: string;
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    bannerUrl?: string;
    currency: string;
    contact?: {
      phone?: string;
      email?: string;
      address?: string;
      whatsapp?: string;
      operatingHours?: string;
    };
    sectionVisibility: {
      hero: boolean;
      products: boolean;
      services: boolean;
      reviews: boolean;
      dispatchBooking: boolean;
    };
    badges: string[];
  };
}

export interface PosProductItem {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  sku: string;
  vertical?: VerticalKey;
}

export function getDefaultProductsForVertical(v: VerticalKey): CommerceProductItem[] {
  switch (v) {
    case "cars":
      return [
        {
          id: "PROD-CAR-01",
          name: "Toyota Land Cruiser 300 VXR 3.5L V6 Twin-Turbo",
          price: 185000000,
          formattedPrice: "₦185,000,000",
          category: "Luxury SUVs",
          stock: 4,
          image: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=80",
          vertical: "cars",
          sku: "CAR-LC300-24",
          status: "ACTIVE",
          attributes: { condition: "Brand New (0km)", year: 2024, mileage: 0, fuel: "Petrol V6", transmission: "Automatic" },
        },
        {
          id: "PROD-CAR-02",
          name: "Mercedes-Benz GLE 450 4MATIC AMG Line",
          price: 120000000,
          formattedPrice: "₦120,000,000",
          category: "Executive SUVs",
          stock: 2,
          image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
          vertical: "cars",
          sku: "CAR-GLE450-23",
          status: "ACTIVE",
          attributes: { condition: "Foreign Used (Tokunbo)", year: 2023, mileage: 18500, fuel: "Hybrid", transmission: "Automatic" },
        },
        {
          id: "PROD-CAR-03",
          name: "Lexus RX 350 F-Sport AWD Panoramic",
          price: 78000000,
          formattedPrice: "₦78,000,000",
          category: "Crossover SUVs",
          stock: 1,
          image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
          vertical: "cars",
          sku: "CAR-RX350-22",
          status: "LOW_STOCK",
          attributes: { condition: "Locally Pre-Owned", year: 2022, mileage: 36000, fuel: "Petrol", transmission: "Automatic" },
        },
      ];
    case "fashion":
      return [
        {
          id: "PROD-FASH-01",
          name: "Hand-Embroidered Raw Silk Agbada 3-Piece Set",
          price: 145000,
          formattedPrice: "₦145,000",
          category: "Ceremonial Wear",
          stock: 8,
          image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
          vertical: "fashion",
          sku: "FASH-AGB-01",
          status: "ACTIVE",
          attributes: { sizes: "M, L, XL, XXL", material: "Raw Silk", colors: "Royal Ivory, Emerald", season: "Harmattan 2026" },
        },
        {
          id: "PROD-FASH-02",
          name: "Structured Double-Breasted Wool Blazer",
          price: 85000,
          formattedPrice: "₦85,000",
          category: "Tailored Outerwear",
          stock: 12,
          image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
          vertical: "fashion",
          sku: "FASH-BLZ-02",
          status: "ACTIVE",
          attributes: { sizes: "38R, 40R, 42R", material: "Super 130s Merino Wool", colors: "Midnight Navy, Charcoal", season: "All-Season Core" },
        },
        {
          id: "PROD-FASH-03",
          name: "Handcrafted Italian Leather Chelsea Boots",
          price: 95000,
          formattedPrice: "₦95,000",
          category: "Footwear",
          stock: 3,
          image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
          vertical: "fashion",
          sku: "FASH-BOT-03",
          status: "LOW_STOCK",
          attributes: { sizes: "41, 42, 43, 44, 45", material: "Calfskin Leather", colors: "Cognac Brown, Black", season: "Permanent Drop" },
        },
      ];
    case "food":
      return [
        {
          id: "PROD-FOOD-01",
          name: "Signature Smoked Seafood Jollof Feast Bowl",
          price: 18500,
          formattedPrice: "₦18,500",
          category: "Chef Signature Mains",
          stock: 45,
          image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
          vertical: "food",
          sku: "FOOD-JOL-01",
          status: "ACTIVE",
          attributes: { prepTime: 25, portion: "Double / Sharing", dietary: "Halal, Spicy, Shellfish", isAvailableToday: true },
        },
        {
          id: "PROD-FOOD-02",
          name: "Slow-Roasted Honey Glazed Goat Meat Asun",
          price: 14000,
          formattedPrice: "₦14,000",
          category: "Grills & Small Chops",
          stock: 30,
          image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
          vertical: "food",
          sku: "FOOD-ASN-02",
          status: "ACTIVE",
          attributes: { prepTime: 20, portion: "Single Portion", dietary: "Spicy, Gluten-Free", isAvailableToday: true },
        },
        {
          id: "PROD-FOOD-03",
          name: "Fresh Cold-Pressed Hibiscus Zobo Elixir 1L",
          price: 3500,
          formattedPrice: "₦3,500",
          category: "Artisanal Drinks",
          stock: 5,
          image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
          vertical: "food",
          sku: "FOOD-ZOB-03",
          status: "LOW_STOCK",
          attributes: { prepTime: 5, portion: "1 Litre Carafe", dietary: "Vegan, Organic", isAvailableToday: true },
        },
      ];
    case "pharmacy":
      return [
        {
          id: "PROD-PHARM-01",
          name: "Artemether + Lumefantrine 80/480mg High-Potency",
          price: 4800,
          formattedPrice: "₦4,800",
          category: "Antimalarials & Fever",
          stock: 120,
          image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
          vertical: "pharmacy",
          sku: "PHARM-ACT-01",
          status: "ACTIVE",
          attributes: { activeIngredient: "Artemether 80mg / Lumefantrine 480mg", dosageForm: "Film-Coated Tablets", prescriptionRequired: false, nafdacNumber: "A4-0129" },
        },
        {
          id: "PROD-PHARM-02",
          name: "Multivitamin & Zinc Immune Support Syrup 200ml",
          price: 6500,
          formattedPrice: "₦6,500",
          category: "Vitamins & Supplements",
          stock: 75,
          image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80",
          vertical: "pharmacy",
          sku: "PHARM-VIT-02",
          status: "ACTIVE",
          attributes: { activeIngredient: "Vitamin A, B-Complex, C, D3, Zinc", dosageForm: "Oral Suspension Syrup", prescriptionRequired: false, nafdacNumber: "B4-9901" },
        },
        {
          id: "PROD-PHARM-03",
          name: "Digital Blood Pressure Arm Monitor (Automatic)",
          price: 28500,
          formattedPrice: "₦28,500",
          category: "Medical Diagnostics",
          stock: 4,
          image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
          vertical: "pharmacy",
          sku: "PHARM-BPM-03",
          status: "LOW_STOCK",
          attributes: { activeIngredient: "Oscillometric Sensor", dosageForm: "Diagnostic Hardware", prescriptionRequired: false, warrantyMonths: 24 },
        },
      ];
    case "property":
      return [
        {
          id: "PROD-PROP-01",
          name: "3-Bedroom Fully Serviced Waterfront Apartment",
          price: 28000000,
          formattedPrice: "₦28,000,000/yr",
          category: "Serviced Apartments",
          stock: 1,
          image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
          vertical: "property",
          sku: "PROP-IKY-01",
          status: "ACTIVE",
          attributes: { propertyType: "Short-Let Luxury Apartment", bedrooms: 3, bathrooms: 3.5, areaSqm: 260, furnished: "Fully Furnished & Serviced" },
        },
        {
          id: "PROD-PROP-02",
          name: "Contemporary 4-Bedroom Smart Villa with Pool",
          price: 180000000,
          formattedPrice: "₦180,000,000",
          category: "Residential For Sale",
          stock: 1,
          image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
          vertical: "property",
          sku: "PROP-LEK-02",
          status: "ACTIVE",
          attributes: { propertyType: "Duplex / Villa", bedrooms: 4, bathrooms: 5, areaSqm: 480, furnished: "Semi-Furnished" },
        },
        {
          id: "PROD-PROP-03",
          name: "Grade-A Open-Plan Commercial Office Floor",
          price: 45000000,
          formattedPrice: "₦45,000,000/yr",
          category: "Commercial Office Suites",
          stock: 2,
          image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
          vertical: "property",
          sku: "PROP-VIC-03",
          status: "LOW_STOCK",
          attributes: { propertyType: "Commercial Office Suite", areaSqm: 650, furnished: "Unfurnished", leaseTerm: "Annual Lease" },
        },
      ];
    case "gadgets":
      return [
        {
          id: "PROD-GAD-01",
          name: "Apple MacBook Pro 16\" M3 Max (36GB RAM / 1TB SSD)",
          price: 4850000,
          formattedPrice: "₦4,850,000",
          category: "Laptops & Computers",
          stock: 5,
          image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
          vertical: "gadgets",
          sku: "GAD-MBP16-01",
          status: "ACTIVE",
          attributes: { brand: "Apple", ram: "36GB", storage: "1TB", condition: "Brand New Sealed", warrantyMonths: 12 },
        },
        {
          id: "PROD-GAD-02",
          name: "iPhone 16 Pro Max 256GB Natural Titanium",
          price: 2150000,
          formattedPrice: "₦2,150,000",
          category: "Smartphones",
          stock: 8,
          image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
          vertical: "gadgets",
          sku: "GAD-IP16P-02",
          status: "ACTIVE",
          attributes: { brand: "Apple", storage: "256GB", condition: "Brand New Sealed", warrantyMonths: 12 },
        },
        {
          id: "PROD-GAD-03",
          name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
          price: 450000,
          formattedPrice: "₦450,000",
          category: "Audio & Accessories",
          stock: 3,
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
          vertical: "gadgets",
          sku: "GAD-SONY-03",
          status: "LOW_STOCK",
          attributes: { brand: "Sony", condition: "Brand New Sealed", warrantyMonths: 12 },
        },
      ];
    case "beauty":
      return [
        {
          id: "PROD-BEAU-01",
          name: "Advanced Vitamin C + Hyaluronic Brightening Serum 50ml",
          price: 24500,
          formattedPrice: "₦24,500",
          category: "Skincare Treatments",
          stock: 35,
          image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
          vertical: "beauty",
          sku: "BEAU-VITC-01",
          status: "ACTIVE",
          attributes: { beautyCategory: "Skincare & Serums", skinType: "All Skin Types", volume: "50ml", organicCertified: true },
        },
        {
          id: "PROD-BEAU-02",
          name: "Luxury Royal Oud & Smoked Amber Eau de Parfum 100ml",
          price: 85000,
          formattedPrice: "₦85,000",
          category: "Luxury Fragrance",
          stock: 14,
          image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80",
          vertical: "beauty",
          sku: "BEAU-OUD-02",
          status: "ACTIVE",
          attributes: { beautyCategory: "Luxury Fragrance", volume: "100ml", organicCertified: false },
        },
        {
          id: "PROD-BEAU-03",
          name: "Moroccan Argan & Keratin Deep Conditioning Hair Mask",
          price: 18000,
          formattedPrice: "₦18,000",
          category: "Hair Care & Spa",
          stock: 4,
          image: "https://images.unsplash.com/photo-1608248597359-5735b5a2bf61?auto=format&fit=crop&w=800&q=80",
          vertical: "beauty",
          sku: "BEAU-ARG-03",
          status: "LOW_STOCK",
          attributes: { beautyCategory: "Hair Care & Extensions", skinType: "Curly, Dry Hair", volume: "250ml", organicCertified: true },
        },
      ];
    case "home-living":
      return [
        {
          id: "PROD-HOME-01",
          name: "Modular Feather-Filled Cloud Sectional Sofa 4-Piece",
          price: 2800000,
          formattedPrice: "₦2,800,000",
          category: "Living Room Seating",
          stock: 2,
          image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
          vertical: "home-living",
          sku: "HOME-SOF-01",
          status: "ACTIVE",
          attributes: { roomType: "Living Room", dimensions: "320 x 180 x 85 cm", primaryMaterial: "High-Performance Belgian Linen", assemblyRequired: true },
        },
        {
          id: "PROD-HOME-02",
          name: "Solid Teak Wood 8-Seater Architectural Dining Table",
          price: 1650000,
          formattedPrice: "₦1,650,000",
          category: "Dining Furniture",
          stock: 3,
          image: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80",
          vertical: "home-living",
          sku: "HOME-TAB-02",
          status: "ACTIVE",
          attributes: { roomType: "Dining Room", dimensions: "240 x 100 x 76 cm", primaryMaterial: "Kiln-Dried Solid Teak", assemblyRequired: true },
        },
        {
          id: "PROD-HOME-03",
          name: "Ergonomic High-Back Executive Office Chair",
          price: 320000,
          formattedPrice: "₦320,000",
          category: "Executive Office",
          stock: 5,
          image: "https://images.unsplash.com/photo-1580481077112-25e141a0e05d?auto=format&fit=crop&w=800&q=80",
          vertical: "home-living",
          sku: "HOME-CHR-03",
          status: "ACTIVE",
          attributes: { roomType: "Executive Office", primaryMaterial: "Breathable Mesh & Aluminum", assemblyRequired: false },
        },
      ];
    case "hardware":
      return [
        {
          id: "PROD-HARD-01",
          name: "Felicity 5kVA 48V Pure Sine Wave Solar Inverter",
          price: 680000,
          formattedPrice: "₦680,000",
          category: "Solar Inverters",
          stock: 14,
          image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
          vertical: "hardware",
          sku: "HARD-INV-01",
          status: "ACTIVE",
          attributes: { powerRatingKva: "5.0 kVA / 48V", voltageTier: "48V DC", warrantyYears: 3, contractorBulkDiscount: true },
        },
        {
          id: "PROD-HARD-02",
          name: "100Ah 51.2V LiFePO4 Lithium Wall-Mount Battery",
          price: 1250000,
          formattedPrice: "₦1,250,000",
          category: "Lithium Energy Storage",
          stock: 9,
          image: "https://images.unsplash.com/photo-1558441719-8b489c63f77a?auto=format&fit=crop&w=800&q=80",
          vertical: "hardware",
          sku: "HARD-BAT-02",
          status: "ACTIVE",
          attributes: { batteryCapacityAh: "100Ah 51.2V 5.12kWh", voltageTier: "48V DC", warrantyYears: 5, contractorBulkDiscount: true },
        },
        {
          id: "PROD-HARD-03",
          name: "550W Tier-1 Mono PERC Half-Cell Solar Panel",
          price: 1150000,
          formattedPrice: "₦115,000",
          category: "Photovoltaic Panels",
          stock: 45,
          image: "https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80",
          vertical: "hardware",
          sku: "HARD-PNL-03",
          status: "ACTIVE",
          attributes: { powerRatingKva: "550W Half-Cut Mono", warrantyYears: 12, contractorBulkDiscount: true },
        },
      ];
    case "retail":
    default:
      return [
        {
          id: "PROD-RET-01",
          name: "Executive Top-Grain Leather Journal & Pen Set",
          price: 18500,
          formattedPrice: "₦18,500",
          category: "Stationery & Corporate",
          stock: 40,
          image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
          vertical: "retail",
          sku: "RET-JRN-01",
          status: "ACTIVE",
          attributes: { department: "Books & Stationery", brand: "Ofia Atelier", barcode: "012345678901", personalizationOption: true },
        },
        {
          id: "PROD-RET-02",
          name: "Stainless Steel Double-Wall Thermal Bottle 1L",
          price: 12000,
          formattedPrice: "₦12,000",
          category: "Lifestyle & Travel",
          stock: 65,
          image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
          vertical: "retail",
          sku: "RET-BTL-02",
          status: "ACTIVE",
          attributes: { department: "Sports & Fitness", brand: "HydroPro", barcode: "012345678902", personalizationOption: true },
        },
        {
          id: "PROD-RET-03",
          name: "Heavy-Duty Waxed Canvas Weekend Duffel",
          price: 48000,
          formattedPrice: "₦48,000",
          category: "Luggage & Bags",
          stock: 6,
          image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
          vertical: "retail",
          sku: "RET-BAG-03",
          status: "LOW_STOCK",
          attributes: { department: "Specialty Gifts", brand: "Heritage Goods", barcode: "012345678903", personalizationOption: false },
        },
      ];
  }
}

export function getDefaultServicesForVertical(v: VerticalKey): CommerceServiceItem[] {
  switch (v) {
    case "cars":
      return [
        { id: "SRV-CAR-01", title: "Comprehensive 150-Point Pre-Purchase Mechanical Inspection", price: 45000, formattedPrice: "₦45,000", durationMinutes: 90, providerName: "Chief Technical Inspector", vertical: "cars", status: "ACTIVE", description: "Complete engine, transmission, OBD2 diagnostics, suspension, and chassis audit." },
        { id: "SRV-CAR-02", title: "At-Home Valet Test-Drive & Executive Escort", price: 25000, formattedPrice: "₦25,000", durationMinutes: 60, providerName: "Mobility Fleet Specialist", vertical: "cars", status: "ACTIVE", description: "Valet delivery of the vehicle to your home or office with a certified automotive escort." },
      ];
    case "fashion":
      return [
        { id: "SRV-FASH-01", title: "Bespoke Measurement & Master Tailoring Consultation", price: 15000, formattedPrice: "₦15,000", durationMinutes: 45, providerName: "Master Couturier", vertical: "fashion", status: "ACTIVE", description: "Precise anatomic measurements, fabric selection, and bespoke pattern drafting." },
        { id: "SRV-FASH-02", title: "Express Garment Alterations & Rapid Hemming", price: 8500, formattedPrice: "₦8,500", durationMinutes: 30, providerName: "Atelier Tailoring Team", vertical: "fashion", status: "ACTIVE", description: "Same-day hem adjustments, waist tapering, and buttonhole reinforcement." },
      ];
    case "food":
      return [
        { id: "SRV-FOOD-01", title: "VIP Private Dining Table Reservation", price: 50000, formattedPrice: "₦50,000", durationMinutes: 120, providerName: "Head Maître d'", vertical: "food", status: "ACTIVE", description: "Reserved chef's table, curated welcome cocktail, and personalized table setup." },
        { id: "SRV-FOOD-02", title: "Corporate Buffet & Event Catering Consultation", price: 150000, formattedPrice: "₦150,000", durationMinutes: 60, providerName: "Executive Head Chef", vertical: "food", status: "ACTIVE", description: "Menu tasting session, dietary matrix planning, and live station logistics." },
      ];
    case "pharmacy":
      return [
        { id: "SRV-PHARM-01", title: "Clinical Pharmacist Medication Therapy Review", price: 8000, formattedPrice: "₦8,000", durationMinutes: 30, providerName: "Licensed Lead Pharmacist", vertical: "pharmacy", status: "ACTIVE", description: "Comprehensive drug-drug interaction audit, dosage optimization, and counseling." },
        { id: "SRV-PHARM-02", title: "Preventative Health Screening & Vitals Diagnostic", price: 5000, formattedPrice: "₦5,000", durationMinutes: 20, providerName: "Clinical Care Associate", vertical: "pharmacy", status: "ACTIVE", description: "Blood pressure, blood glucose, BMI, and rapid cholesterol screening." },
      ];
    case "property":
      return [
        { id: "SRV-PROP-01", title: "Guided Private Physical Property Viewing", price: 20000, formattedPrice: "₦20,000", durationMinutes: 60, providerName: "Licensed Realtor", vertical: "property", status: "ACTIVE", description: "Accompanied tour of the estate, building amenities, infrastructure, and title brief." },
        { id: "SRV-PROP-02", title: "Title Deed Verification & Legal Search Consultation", price: 75000, formattedPrice: "₦75,000", durationMinutes: 45, providerName: "Real Estate Legal Counsel", vertical: "property", status: "ACTIVE", description: "Governor's consent verification, land registry search, and encumbrance audit." },
      ];
    case "gadgets":
      return [
        { id: "SRV-GAD-01", title: "Hardware Diagnostic & Logic Board Bench Testing", price: 15000, formattedPrice: "₦15,000", durationMinutes: 45, providerName: "Certified Apple & Android Tech", vertical: "gadgets", status: "ACTIVE", description: "Complete multimeter testing, thermal imaging, power rails, and sensor audit." },
        { id: "SRV-GAD-02", title: "Express OLED Screen & Battery Replacement", price: 45000, formattedPrice: "₦45,000", durationMinutes: 60, providerName: "Hardware Lab Technician", vertical: "gadgets", status: "ACTIVE", description: "OEM replacement with dust/water-resistant gasket re-sealing." },
      ];
    case "beauty":
      return [
        { id: "SRV-BEAU-01", title: "Deluxe Hydrafacial & Deep Pore Infusion Treatment", price: 35000, formattedPrice: "₦35,000", durationMinutes: 75, providerName: "Licensed Aesthetician", vertical: "beauty", status: "ACTIVE", description: "Deep ultrasonic cleanse, gentle extraction, and antioxidant peptide infusion." },
        { id: "SRV-BEAU-02", title: "Master Hair Styling, Treatment & Silk Press", price: 28000, formattedPrice: "₦28,000", durationMinutes: 90, providerName: "Senior Salon Stylist", vertical: "beauty", status: "ACTIVE", description: "Steam conditioning, scalp treatment, precision trim, and sleek silk press." },
      ];
    case "home-living":
      return [
        { id: "SRV-HOME-01", title: "White-Glove Delivery & Architectural Assembly", price: 35000, formattedPrice: "₦35,000", durationMinutes: 120, providerName: "Senior Carpentry Lead", vertical: "home-living", status: "ACTIVE", description: "Careful uncrating, room-of-choice placement, precision assembly, and debris removal." },
        { id: "SRV-HOME-02", title: "Interior Space Planning & Ergonomic Consultation", price: 65000, formattedPrice: "₦65,000", durationMinutes: 60, providerName: "Interior Design Director", vertical: "home-living", status: "ACTIVE", description: "3D layout floor plan, fabric matching, lighting recommendations, and dimension audit." },
      ];
    case "hardware":
      return [
        { id: "SRV-HARD-01", title: "Solar Load Audit & Photovoltaic Sizing Assessment", price: 30000, formattedPrice: "₦30,000", durationMinutes: 90, providerName: "Renewable Energy Engineer", vertical: "hardware", status: "ACTIVE", description: "On-site power consumption analysis, peak surge audit, and tailored PV system design." },
        { id: "SRV-HARD-02", title: "Certified Solar Inverter Installation & Commissioning", price: 65000, formattedPrice: "₦65,000", durationMinutes: 180, providerName: "Master Electrical Tech", vertical: "hardware", status: "ACTIVE", description: "Full DC/AC breaker cabling, earthing inspection, inverter programming, and handover." },
      ];
    case "retail":
    default:
      return [
        { id: "SRV-RET-01", title: "Custom Laser Engraving & Personalization", price: 5000, formattedPrice: "₦5,000", durationMinutes: 30, providerName: "Atelier Craftsman", vertical: "retail", status: "ACTIVE", description: "Precision laser etching of names, logos, or serial marks on leather and metal." },
        { id: "SRV-RET-02", title: "Luxury Corporate Gift Packaging & Card Calligraphy", price: 3500, formattedPrice: "₦3,500", durationMinutes: 20, providerName: "Packaging Specialist", vertical: "retail", status: "ACTIVE", description: "Embossed gift boxes, silk ribbons, and hand-written calligraphy cards." },
      ];
  }
}

export function getDefaultPosProductsForVertical(v: VerticalKey): PosProductItem[] {
  switch (v) {
    case "cars":
      return [
        { id: "POS-CAR-1", name: "RunFlat All-Season Tire 275/40R20", price: 240000, category: "Tires", stock: 8, sku: "POS-TIRE-20" },
        { id: "POS-CAR-2", name: "Synthetic Motor Oil 5W-30 (5 Litres)", price: 38000, category: "Fluids", stock: 24, sku: "POS-OIL-5W30" },
        { id: "POS-CAR-3", name: "Ceramic Front Brake Pads Set", price: 55000, category: "Brakes", stock: 12, sku: "POS-BRK-FR" },
        { id: "POS-CAR-4", name: "Smart Keyless Entry Key Fob Battery (2-Pack)", price: 4500, category: "Accessories", stock: 80, sku: "POS-FOB-BAT" },
        { id: "POS-CAR-5", name: "Windshield Wiper Blades Premium Pair", price: 16500, category: "Wipers", stock: 35, sku: "POS-WIP-PREM" },
      ];
    case "fashion":
      return [
        { id: "POS-FASH-1", name: "Pure Silk Pocket Square & Cufflink Pair", price: 14500, category: "Accessories", stock: 45, sku: "POS-ACC-CUF" },
        { id: "POS-FASH-2", name: "Italian Top-Grain Leather Reversible Belt", price: 28000, category: "Leather Goods", stock: 20, sku: "POS-BELT-IT" },
        { id: "POS-FASH-3", name: "Cedarwood Suit Contoured Hangers (Pack of 4)", price: 9500, category: "Care", stock: 30, sku: "POS-HNG-WOD" },
        { id: "POS-FASH-4", name: "Compact Garment Steamer & Lint Shaver", price: 22000, category: "Apparel Care", stock: 15, sku: "POS-STM-CMP" },
        { id: "POS-FASH-5", name: "Mercerized Cotton Dress Socks (3-Pack)", price: 7500, category: "Hosiery", stock: 60, sku: "POS-SCK-MRC" },
      ];
    case "food":
      return [
        { id: "POS-FOOD-1", name: "Executive Bento Lunch Box Platter", price: 9500, category: "Meals", stock: 30, sku: "POS-LNC-BOX" },
        { id: "POS-FOOD-2", name: "Sweet Fried Plantain (Dodo) Side Portion", price: 2500, category: "Sides", stock: 60, sku: "POS-SID-DOD" },
        { id: "POS-FOOD-3", name: "Suya Spice Authentic Dry Rub Glass Jar", price: 4000, category: "Pantry", stock: 50, sku: "POS-SP-JAR" },
        { id: "POS-FOOD-4", name: "Chilled Passion Fruit & Ginger Mocktail", price: 3000, category: "Beverages", stock: 40, sku: "POS-BEV-PAS" },
        { id: "POS-FOOD-5", name: "Golden Meat Pie & Sausage Roll Combo", price: 3500, category: "Pastries", stock: 25, sku: "POS-PAS-CMB" },
      ];
    case "pharmacy":
      return [
        { id: "POS-PHARM-1", name: "Paracetamol 500mg Extra Relief (20 Caplets)", price: 1200, category: "Pain Relief", stock: 200, sku: "POS-PARA-500" },
        { id: "POS-PHARM-2", name: "Vitamin C 1000mg Effervescent (20 Tablets)", price: 3500, category: "Immunity", stock: 120, sku: "POS-VITC-EFF" },
        { id: "POS-PHARM-3", name: "First Aid Antiseptic Wound Dressing Kit", price: 4500, category: "First Aid", stock: 45, sku: "POS-FA-KIT" },
        { id: "POS-PHARM-4", name: "Surgical 3-Ply Face Mask (Box of 50)", price: 2800, category: "Sanitation", stock: 80, sku: "POS-MSK-50" },
        { id: "POS-PHARM-5", name: "Oral Rehydration Salts (ORS) (Pack of 5)", price: 1500, category: "Hydration", stock: 150, sku: "POS-ORS-PK" },
      ];
    case "property":
      return [
        { id: "POS-PROP-1", name: "Tenancy Agreement & Onboarding Legal Pack", price: 15000, category: "Legal & Docs", stock: 50, sku: "POS-TEN-AGR" },
        { id: "POS-PROP-2", name: "Smart RFID Building Keycard Replacement", price: 8000, category: "Access", stock: 40, sku: "POS-RFID-CRD" },
        { id: "POS-PROP-3", name: "Automated Estate Barrier Vehicle Barcode Tag", price: 5000, category: "Access", stock: 100, sku: "POS-BAR-TAG" },
        { id: "POS-PROP-4", name: "Emergency High-Security Padlock with 4 Keys", price: 18000, category: "Security", stock: 20, sku: "POS-SEC-LCK" },
      ];
    case "gadgets":
      return [
        { id: "POS-GAD-1", name: "65W GaN Dual USB-C Fast Charger", price: 18500, category: "Chargers", stock: 40, sku: "POS-CHG-65W" },
        { id: "POS-GAD-2", name: "Braided Thunderbolt 4 Cable 2.0m", price: 22000, category: "Cables", stock: 35, sku: "POS-CBL-TB4" },
        { id: "POS-GAD-3", name: "9H Edge-to-Edge Tempered Glass Protector", price: 5000, category: "Protection", stock: 120, sku: "POS-GLS-9H" },
        { id: "POS-GAD-4", name: "MagSafe 10000mAh Magnetic Power Bank", price: 28000, category: "Power", stock: 25, sku: "POS-MAG-10K" },
        { id: "POS-GAD-5", name: "Precision Electronics Cleaning Putty Kit", price: 6500, category: "Maintenance", stock: 50, sku: "POS-CLN-KIT" },
      ];
    case "beauty":
      return [
        { id: "POS-BEAU-1", name: "Organic Shea Butter Lip Treatment Balm", price: 3500, category: "Lip Care", stock: 80, sku: "POS-LIP-BLM" },
        { id: "POS-BEAU-2", name: "Pure Mulberry Silk Hair Bonnet & Scrunchie", price: 8500, category: "Hair Accessories", stock: 45, sku: "POS-SLK-BNT" },
        { id: "POS-BEAU-3", name: "Natural Rosewater Hydrating Face Mist 150ml", price: 6500, category: "Skincare", stock: 40, sku: "POS-ROS-MST" },
        { id: "POS-BEAU-4", name: "Jade Stone Facial Roller & Gua Sha Tool", price: 12000, category: "Tools", stock: 30, sku: "POS-JAD-GUA" },
      ];
    case "home-living":
      return [
        { id: "POS-HOME-1", name: "Artisanal Soy Wax Candle in Ceramic Vessel", price: 12500, category: "Decor & Scent", stock: 35, sku: "POS-CND-SOY" },
        { id: "POS-HOME-2", name: "Natural Linen Cushion Covers (Set of 2)", price: 16000, category: "Textiles", stock: 25, sku: "POS-CSH-LIN" },
        { id: "POS-HOME-3", name: "Natural Beeswax Wood Furniture Polish Balm", price: 6500, category: "Care", stock: 50, sku: "POS-WOD-POL" },
        { id: "POS-HOME-4", name: "Heavyweight Brass Coaster Set (4-Pack)", price: 18000, category: "Tableware", stock: 20, sku: "POS-BRS-CST" },
      ];
    case "hardware":
      return [
        { id: "POS-HARD-1", name: "MC4 Solar PV Cable Connectors (Pair)", price: 2500, category: "Solar", stock: 150, sku: "POS-MC4-CON" },
        { id: "POS-HARD-2", name: "32A DC Miniature Circuit Breaker 500V", price: 14500, category: "Switchgear", stock: 45, sku: "POS-MCB-32A" },
        { id: "POS-HARD-3", name: "16mm² Double Insulated Solar DC Cable (10m)", price: 38000, category: "Cabling", stock: 30, sku: "POS-CBL-16MM" },
        { id: "POS-HARD-4", name: "Digital Auto-Ranging Multimeter with Probe", price: 22000, category: "Test Tools", stock: 20, sku: "POS-DMM-PRO" },
        { id: "POS-HARD-5", name: "Heavy-Duty Battery Lug Crimping Plier", price: 28000, category: "Tools", stock: 15, sku: "POS-CRM-PLR" },
      ];
    case "retail":
    default:
      return [
        { id: "POS-RET-1", name: "Smooth Gel Ink Retractable Pens (Pack of 5)", price: 4500, category: "Stationery", stock: 90, sku: "POS-PEN-GEL" },
        { id: "POS-RET-2", name: "Microfiber Lens & Screen Polishing Cloth", price: 1500, category: "Accessories", stock: 150, sku: "POS-MIC-CLT" },
        { id: "POS-RET-3", name: "Heavyweight Kraft Paper Gift Bag with Ribbon", price: 2000, category: "Packaging", stock: 120, sku: "POS-BAG-KRF" },
        { id: "POS-RET-4", name: "Universal Worldwide Travel Adapter (All-in-One)", price: 8500, category: "Travel", stock: 40, sku: "POS-TRV-ADP" },
      ];
  }
}
