export type VerticalType =
  | "fashion"
  | "cars"
  | "food"
  | "property"
  | "gadgets"
  | "beauty"
  | "home-living"
  | "pharmacy"
  | "hardware"
  | "retail"
  | "dispatch";

export interface VendorStore {
  id: string;
  slug: string;
  name: string;
  vertical: VerticalType;
  tagline: string;
  description: string;
  logo: string;
  coverImage: string;
  primaryColor: string;
  accentColor: string;
  currency: string;
  contact: {
    phone: string;
    email: string;
    address: string;
    whatsapp?: string;
    operatingHours: string;
  };
  badges: string[];
  features: string[];
}

export interface FabricPrint {
  name: string;
  image: string;
  description?: string;
}

export const AFRICAN_PRINT_PRESETS: FabricPrint[] = [
  {
    name: "Ankara Wax",
    image: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=400&q=80",
    description: "Vibrant high-density wax-resist Dutch cotton print",
  },
  {
    name: "Aso-Oke",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80",
    description: "Hand-loomed Yoruba ceremonial cloth with metallic threading",
  },
  {
    name: "Adire Tie-Dye",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80",
    description: "Indigo resist-dyed artisanal cotton weave with swirl motifs",
  },
  {
    name: "Kente",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80",
    description: "Royal Ghanaian Ashanti silk-and-cotton geometric tapestry",
  },
  {
    name: "Lace Brocade",
    image: "https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?auto=format&fit=crop&w=400&q=80",
    description: "Embroidered Swiss voile brocade for festive celebration",
  },
  {
    name: "Bogolan Mudcloth",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80",
    description: "Malian fermented river mud-dyed handspun cotton textile",
  },
  {
    name: "Senegalese Bazin",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    description: "Glazed Guinea damask fabric with luminous textured sheen",
  },
  {
    name: "Plain Silk-Linen",
    image: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=400&q=80",
    description: "Breathable raw silk-linen core woven for bespoke tailoring",
  },
];

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  inStock: boolean;
  color?: string;
  colorHex?: string;
  size?: string;
  storage?: string;
  material?: string;
  portion?: string;
  print?: string;
  printImage?: string;
  image?: string;
  stock?: number;
}

export interface ApparelAccessoryItem {
  id: string;
  name: string;
  price: number;
  image: string;
  stock?: number;
  sku?: string;
  isOptional?: boolean;
}

export interface Product {
  id: string;
  sku?: string;
  storeSlug: string;
  vertical: VerticalType;
  title: string;
  subtitle?: string;
  price: number;
  originalPrice?: number;
  category: string;
  collection?: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  isFeatured?: boolean;
  isNewDrop?: boolean;
  description: string;
  highlights: string[];
  variants?: ProductVariant[];
  accessories?: ApparelAccessoryItem[];
  tags?: string[];

  // Vertical-Specific Metadata:
  // 1. Fashion
  fashionMeta?: {
    sizes: string[];
    colors: Array<{ name: string; hex: string }>;
    prints?: Array<string | FabricPrint>;
    collection?: string;
    season?: string;
    materials: string[];
    fit: string;
    careInstructions: string;
    sizeGuide: Array<{ size: string; chest: string; waist: string; hips: string }>;
  };

  // 2. Cars
  carMeta?: {
    make: string;
    model: string;
    year: number;
    mileage: string;
    transmission: "Automatic" | "Manual";
    fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric";
    condition: "Brand New" | "Foreign Used" | "Certified Pre-Owned";
    engine: string;
    horsepower: string;
    drivetrain: "AWD" | "FWD" | "RWD" | "4x4";
    vin: string;
    inspectionScore: number;
    inspectionHighlights: string[];
  };

  // 3. Food
  foodMeta?: {
    prepTime: string;
    calories?: number;
    dietary: Array<"Vegan" | "Gluten-Free" | "Halal" | "Spicy" | "Vegetarian" | "Chef Special">;
    portionSizes: Array<{ name: string; price: number; serves: string }>;
    addOns: Array<{ name: string; price: number }>;
    isAvailableToday: boolean;
  };

  // 4. Property
  propertyMeta?: {
    propertyType: "Apartment" | "Penthouse" | "Villa" | "Townhouse" | "Short-let";
    location: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    furnished: "Fully Furnished" | "Semi-Furnished" | "Unfurnished";
    amenities: string[];
    rentalTerms: string;
    availableFrom: string;
    virtualTourAvailable: boolean;
  };

  // 5. Gadgets
  gadgetMeta?: {
    brand: string;
    modelYear: number;
    storageOptions: string[];
    colorOptions: Array<{ name: string; hex: string }>;
    specs: Record<string, string>;
    warrantyYears: number;
    warrantyDetails: string;
    inTheBox: string[];
  };

  // 6. Beauty
  beautyMeta?: {
    skinType: string[];
    routineStep: "Cleanse" | "Tone" | "Treat" | "Moisturize" | "Protect";
    volume: string;
    ingredientsHighlights: string[];
    crueltyFree: boolean;
    organic: boolean;
    shadeOptions?: Array<{ name: string; hex: string }>;
  };

  // 7. Home & Living
  homeLivingMeta?: {
    room: "Living Room" | "Bedroom" | "Dining" | "Office" | "Outdoor";
    dimensions: {
      height: string;
      width: string;
      depth: string;
      seatHeight?: string;
      weight: string;
    };
    materials: string[];
    finishes: Array<{ name: string; colorCode: string }>;
    assemblyRequired: boolean;
    assemblyTimeMinutes: number;
  };

  // 8. Health & Pharmacy
  pharmacyMeta?: {
    dosageForm: "Tablet" | "Capsule" | "Syrup" | "Topical Cream" | "Drops" | "Medical Device" | "Injection";
    strength?: string;
    activeIngredients: string[];
    prescriptionRequired: boolean;
    batchNumber?: string;
    expiryDate: string;
    packSize: string;
    nafdacNumber?: string;
    warnings: string[];
    usageInstructions: string;
  };

  // 9. Hardware, Energy & Industrial
  hardwareMeta?: {
    powerRating?: string;
    voltage?: string;
    capacity?: string;
    systemType: "Solar Panel" | "Hybrid Inverter" | "Lithium Battery" | "Generator" | "Industrial Tool" | "Electrical Supply";
    contractorPrice?: number;
    warrantyYears: number;
    specSheetUrl?: string;
    installationEligible: boolean;
  };

  // 10. General Retail & Specialty Goods
  retailMeta?: {
    department: "Books & Stationery" | "Sports & Fitness" | "Baby & Toys" | "Crafts & Hobbies" | "Specialty Gifts";
    authorOrBrand?: string;
    isbnOrSku?: string;
    ageGroup?: string;
    weightOrDimension?: string;
    giftWrapAvailable: boolean;
    customEngravingAvailable: boolean;
    isPreOrder?: boolean;
    releaseDate?: string;
  };
}

export interface StoreService {
  id: string;
  storeSlug: string;
  vertical: VerticalType;
  title: string;
  category: string;
  description: string;
  price: number;
  durationMinutes: number;
  specialistName?: string;
  specialistRole?: string;
  specialistAvatar?: string;
  image?: string;
  availableDays?: string[];
}

export interface CartItem {
  id: string;
  productId: string;
  sku?: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  vertical: VerticalType;
  selectedVariant?: string;
  selectedColor?: string;
  selectedSize?: string;
  selectedPrint?: string;
  selectedPrintImage?: string;
  selectedPortion?: string;
  selectedAddOns?: string[];
  selectedAccessories?: Array<{ id: string; name: string; price: number; image?: string }>;
  specialInstructions?: string;
  deliveryOption?: string;
}

export interface TestDriveRequest {
  vehicleId: string;
  vehicleName: string;
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTimeSlot: string;
  testDriveType: "Dealership Showroom" | "At-Home Valet";
  driversLicenseNumber?: string;
}

export interface ViewingRequest {
  propertyId: string;
  propertyTitle: string;
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTimeSlot: string;
  viewingType: "In-Person Guided Tour" | "Live Video Walkthrough";
  notes?: string;
}

export interface AppointmentBooking {
  serviceId: string;
  serviceName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  specialistName: string;
  date: string;
  timeSlot: string;
  notes?: string;
}

export interface CustomOrderRequest {
  storeSlug: string;
  eventType?: string;
  targetDate: string;
  guestCount?: number;
  flavorsOrThemes?: string;
  budgetRange?: string;
  fullName: string;
  email: string;
  phone: string;
  customNotes: string;
}

export interface TenantStorefrontHandshake {
  tenantId: string;
  slug: string;
  name: string;
  domain: string;
  subdomain: string;
  vertical: VerticalType;
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
    season?: string;
    collectionName?: string;
    collectionDescription?: string;
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
    allowEscrow?: boolean;
    sectionVisibility: {
      hero?: boolean;
      collections?: boolean;
      valueBadges?: boolean;
      products?: boolean;
      services?: boolean;
      featureBanner?: boolean;
      reviews?: boolean;
      dispatchBooking?: boolean;
      escrowOption?: boolean;
      announcement?: boolean;
    };
    announcement?: {
      enabled?: boolean;
      text?: string;
      link?: string;
      badge?: string;
    };
    header?: {
      ctaLabel?: string;
      ctaHref?: string;
    };
    hero?: {
      enabled?: boolean;
      eyebrow?: string;
      headline?: string;
      highlightText?: string;
      description?: string;
      ctaLabel?: string;
      ctaHref?: string;
      footnote?: string;
      badge?: string;
      bgColor?: string;
      image?: string;
    };
    valueBadges?: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
    collections?: {
      enabled?: boolean;
      card1?: {
        title?: string;
        count?: string;
        image?: string;
        images?: string[];
        productIds?: string[];
        href?: string;
        theme?: "light" | "dark";
      };
      card2?: {
        title?: string;
        count?: string;
        image?: string;
        images?: string[];
        productIds?: string[];
        href?: string;
        theme?: "light" | "dark";
      };
      card3?: {
        mode?: "static" | "auto";
        title?: string;
        backgroundImage?: string;
        theme?: "light" | "dark";
        href?: string;
        pills?: Array<{
          label: string;
          count: string;
          image: string;
          href: string;
        }>;
      };
    };
    collectionsList?: Array<{
      id: string;
      name: string;
      description?: string;
      season?: string;
      images: string[];
      productIds?: string[];
      isHero1?: boolean;
      isHero2?: boolean;
    }>;
    categories?: Array<{
      id: string;
      name: string;
      description?: string;
      image?: string;
    }>;
    africanPrints?: Array<{
      id: string;
      name: string;
      image: string;
      description?: string;
    }>;
    featuredSection?: {
      eyebrow?: string;
      title?: string;
      viewAllLabel?: string;
      viewAllHref?: string;
    };
    featureBanner?: {
      enabled?: boolean;
      eyebrow?: string;
      headline?: string;
      description?: string;
      ctaLabel?: string;
      ctaHref?: string;
      image?: string;
    };
    footer?: {
      bio?: string;
      copyright?: string;
      socials?: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
        linkedin?: string;
      };
    };
    badges: string[];
  };
}

export interface StorefrontOrderPayload {
  id: string;
  orderNumber: string;
  tenantSlug: string;
  tenantId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  channel: "STOREFRONT" | "POS_COUNTER" | "INQUIRY";
  shippingAddress: string;
  city?: string;
  paymentMethod?: string;
  items: Array<{
    id: string;
    productId?: string;
    title?: string;
    name?: string;
    price: number;
    quantity: number;
    image?: string;
    selectedVariant?: string;
  }>;
  itemsSummary: string;
  itemCount: number;
  totalAmount: string;
  rawAmount: number;
  status: "PENDING" | "CONFIRMED" | "IN_PREPARATION" | "READY_DISPATCH" | "DELIVERED";
  paymentStatus: "PAID" | "PENDING" | "REFUNDED";
  deliveryMethod: "DISPATCH" | "STORE_PICKUP";
  isEscrow?: boolean;
  escrowStatus?: "NONE" | "DIRECT_SETTLEMENT" | "HELD" | "RELEASED" | "REFUNDED";
  settlementStatus?: "AVAILABLE" | "HELD_ESCROW" | "WITHDRAWN";
  merchantAmount?: number;
  platformFee?: number;
  createdAt?: string;
  notes?: string;
}

export interface StorefrontBookingPayload {
  id: string;
  bookingNumber: string;
  tenantSlug: string;
  tenantId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceTitle: string;
  dateTime: string;
  status: "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELLED";
  notes?: string;
  vertical: VerticalType;
  createdAt: string;
  technicianId?: string;
  technicianName?: string;
  isEscrow?: boolean;
  escrowStatus?: "NONE" | "DIRECT_SETTLEMENT" | "HELD" | "RELEASED" | "REFUNDED";
  settlementStatus?: "AVAILABLE" | "HELD_ESCROW" | "WITHDRAWN";
  merchantAmount?: number;
  platformFee?: number;
}
