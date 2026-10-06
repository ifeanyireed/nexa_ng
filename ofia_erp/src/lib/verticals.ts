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
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceTitle: string;
  dateTime: string;
  status: "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELLED";
  notes?: string;
  vertical: VerticalKey;
}

export interface CommerceOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  channel: "STOREFRONT" | "POS_COUNTER" | "INQUIRY";
  itemsSummary: string;
  itemCount: number;
  totalAmount: string;
  rawAmount: number;
  status: "PENDING" | "CONFIRMED" | "IN_PREPARATION" | "READY_DISPATCH" | "DELIVERED";
  paymentStatus: "PAID" | "PENDING" | "REFUNDED";
  createdAt: string;
  deliveryMethod: "DISPATCH" | "STORE_PICKUP";
}
