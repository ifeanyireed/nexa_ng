export type VerticalType =
  | "fashion"
  | "cars"
  | "food"
  | "property"
  | "gadgets"
  | "beauty"
  | "home-living";

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

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  inStock: boolean;
  colorHex?: string;
  size?: string;
  storage?: string;
  material?: string;
  portion?: string;
}

export interface Product {
  id: string;
  storeSlug: string;
  vertical: VerticalType;
  title: string;
  subtitle?: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  isFeatured?: boolean;
  isNewDrop?: boolean;
  description: string;
  highlights: string[];
  variants?: ProductVariant[];
  tags?: string[];

  // Vertical-Specific Metadata:
  // 1. Fashion
  fashionMeta?: {
    sizes: string[];
    colors: Array<{ name: string; hex: string }>;
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
  title: string;
  price: number;
  image: string;
  quantity: number;
  vertical: VerticalType;
  selectedVariant?: string;
  selectedColor?: string;
  selectedSize?: string;
  selectedPortion?: string;
  selectedAddOns?: string[];
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
