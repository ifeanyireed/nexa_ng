export type JobType = 
  | "STORE_ORDER"      // Type A: Store order delivery
  | "VENDOR_DISPATCH"  // Type B: Vendor-initiated dispatch
  | "CUSTOMER_PICKUP"  // Type C: Customer pickup request
  | "VENDOR_PICKUP";   // Type D: Vendor pickup request

export type JobStatus =
  | "PENDING"
  | "ASSIGNED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "EXCEPTION"
  | "CANCELLED";

export type JobPriority = "STANDARD" | "HIGH" | "URGENT";

export interface WaypointItem {
  id: string;
  location: string;
  status: JobStatus;
  timestamp: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface CourierDriver {
  id: string;
  name: string;
  phone: string;
  vehicleType: "MOTORBIKE" | "VAN" | "BICYCLE" | "TRUCK";
  plateNumber: string;
  isAvailable: boolean;
  currentLat: number;
  currentLng: number;
  currentZone: string;
  rating: number;
  totalTrips: number;
  activeJobs: number;
}

export interface DispatchJob {
  id: string;
  orderNumber: string;
  trackingNumber: string;
  type: JobType;
  status: JobStatus;
  priority: JobPriority;
  
  // Initiator & Pickup
  initiatorName: string;
  initiatorPhone: string;
  pickupAddress: string;
  pickupCity: string;
  pickupCoords: { lat: number; lng: number };
  
  // Recipient & Destination
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: string;
  destCoords: { lat: number; lng: number };
  
  // Parcel Details
  parcelDescription: string;
  weightKg: number;
  shippingFee: number;
  currency: string;
  
  // Fulfillment & Assignment
  estimatedDelivery: string;
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  courierPlate?: string;
  courierVehicle?: string;
  courierRating?: number;
  deliveryOtp?: string;
  
  // Exception handling
  exceptionReason?: string;
  exceptionNotes?: string;
  
  waypoints: WaypointItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ZoneRate {
  id: string;
  zoneName: string;
  originCity: string;
  destCity: string;
  baseFee: number;
  perKgFee: number;
  estimatedDays: number;
}

export const INITIAL_COURIERS: CourierDriver[] = [
  {
    id: "drv-1",
    name: "Ibrahim Musa",
    phone: "+234 803 334 4455",
    vehicleType: "MOTORBIKE",
    plateNumber: "KJA-482-XA",
    isAvailable: true,
    currentLat: 6.4698,
    currentLng: 3.5852,
    currentZone: "Lekki Phase 1",
    rating: 4.9,
    totalTrips: 184,
    activeJobs: 1,
  },
  {
    id: "drv-2",
    name: "Emeka Okafor",
    phone: "+234 807 778 8899",
    vehicleType: "VAN",
    plateNumber: "APP-912-LK",
    isAvailable: true,
    currentLat: 6.5244,
    currentLng: 3.3792,
    currentZone: "Ikeja GRA",
    rating: 4.8,
    totalTrips: 98,
    activeJobs: 0,
  },
  {
    id: "drv-3",
    name: "Babatunde Shola",
    phone: "+234 812 555 1234",
    vehicleType: "MOTORBIKE",
    plateNumber: "LND-320-YY",
    isAvailable: true,
    currentLat: 6.4281,
    currentLng: 3.4219,
    currentZone: "Victoria Island",
    rating: 4.95,
    totalTrips: 312,
    activeJobs: 1,
  },
  {
    id: "drv-4",
    name: "Chukwudi Nnamdi",
    phone: "+234 809 111 7766",
    vehicleType: "VAN",
    plateNumber: "EKY-741-AB",
    isAvailable: false,
    currentLat: 6.5000,
    currentLng: 3.3600,
    currentZone: "Surulere",
    rating: 4.7,
    totalTrips: 145,
    activeJobs: 2,
  },
  {
    id: "drv-5",
    name: "Fatima Al-Hassan",
    phone: "+234 805 222 9900",
    vehicleType: "MOTORBIKE",
    plateNumber: "AGL-504-QC",
    isAvailable: true,
    currentLat: 6.5140,
    currentLng: 3.3850,
    currentZone: "Yaba Tech Corridor",
    rating: 5.0,
    totalTrips: 76,
    activeJobs: 0,
  },
];

export const INITIAL_DISPATCH_JOBS: DispatchJob[] = [
  {
    id: "JOB-2026-8491",
    orderNumber: "OFIA-2026-9021",
    trackingNumber: "NX-849204-NG",
    type: "STORE_ORDER",
    status: "IN_TRANSIT",
    priority: "HIGH",
    initiatorName: "Ofia Tech Hardware Store",
    initiatorPhone: "+234 801 112 2233",
    pickupAddress: "14 Admiralty Way, Lekki Phase 1",
    pickupCity: "Lagos",
    pickupCoords: { lat: 6.4698, lng: 3.5852 },
    recipientName: "Chief Babatunde Alabi",
    recipientPhone: "+234 809 998 8877",
    recipientAddress: "Plot 1, Commercial Ave, Ikeja GRA",
    recipientCity: "Lagos",
    destCoords: { lat: 6.5922, lng: 3.3421 },
    parcelDescription: "Felicity 5kVA Solar Inverter + Lithium Battery Pack (Fragile)",
    weightKg: 28.5,
    shippingFee: 14500,
    currency: "NGN",
    estimatedDelivery: "Today, 03:30 PM",
    courierId: "drv-1",
    courierName: "Ibrahim Musa",
    courierPhone: "+234 803 334 4455",
    courierPlate: "KJA-482-XA",
    courierVehicle: "MOTORBIKE",
    courierRating: 4.9,
    deliveryOtp: "4829",
    waypoints: [
      { id: "wp-1", location: "Lekki Phase 1 Hub", status: "PICKED_UP", timestamp: "10:15 AM", notes: "Verified battery seal" },
      { id: "wp-2", location: "Third Mainland Bridge Checkpoint", status: "IN_TRANSIT", timestamp: "11:30 AM", notes: "Driver in transit to Mainland" },
    ],
    createdAt: "Today at 09:15 AM",
    updatedAt: "Today at 11:30 AM",
  },
  {
    id: "JOB-2026-8492",
    orderNumber: "VD-8812",
    trackingNumber: "NX-849205-NG",
    type: "VENDOR_DISPATCH",
    status: "PENDING",
    priority: "URGENT",
    initiatorName: "Zina Couture Lagos",
    initiatorPhone: "+234 802 345 6789",
    pickupAddress: "Shop 4, Palms Mall, Lekki",
    pickupCity: "Lagos",
    pickupCoords: { lat: 6.4380, lng: 3.4560 },
    recipientName: "Dr. Ngozi Eze",
    recipientPhone: "+234 803 123 4567",
    recipientAddress: "Ahmadu Bello Way, Victoria Island",
    recipientCity: "Lagos",
    destCoords: { lat: 6.4281, lng: 3.4219 },
    parcelDescription: "Handmade Bridal Silk Gown & Accessories (Express)",
    weightKg: 2.2,
    shippingFee: 3500,
    currency: "NGN",
    estimatedDelivery: "Today, 01:15 PM",
    deliveryOtp: "9130",
    waypoints: [],
    createdAt: "Today at 10:45 AM",
    updatedAt: "Today at 10:45 AM",
  },
  {
    id: "JOB-2026-8493",
    orderNumber: "CP-4401",
    trackingNumber: "NX-849206-NG",
    type: "CUSTOMER_PICKUP",
    status: "PENDING",
    priority: "STANDARD",
    initiatorName: "Emeka Chinedu (Customer)",
    initiatorPhone: "+234 816 777 2200",
    pickupAddress: "22 Herbert Macaulay Way, Yaba",
    pickupCity: "Lagos",
    pickupCoords: { lat: 6.5140, lng: 3.3850 },
    recipientName: "Grace Adekunle",
    recipientPhone: "+234 802 888 1144",
    recipientAddress: "Bode Thomas St, Surulere",
    recipientCity: "Lagos",
    destCoords: { lat: 6.4950, lng: 3.3550 },
    parcelDescription: "Confidential Legal Contracts & Passports",
    weightKg: 0.8,
    shippingFee: 2500,
    currency: "NGN",
    estimatedDelivery: "Today, 02:00 PM",
    deliveryOtp: "7721",
    waypoints: [],
    createdAt: "Today at 11:00 AM",
    updatedAt: "Today at 11:00 AM",
  },
  {
    id: "JOB-2026-8494",
    orderNumber: "VP-1029",
    trackingNumber: "NX-849207-NG",
    type: "VENDOR_PICKUP",
    status: "ASSIGNED",
    priority: "STANDARD",
    initiatorName: "Ofia Central Warehouse",
    initiatorPhone: "+234 809 333 4411",
    pickupAddress: "Supplier Depot, Oshodi Industrial Estate",
    pickupCity: "Lagos",
    pickupCoords: { lat: 6.5350, lng: 3.3400 },
    recipientName: "Ofia Hub Ikeja Storage",
    recipientPhone: "+234 809 333 4411",
    recipientAddress: "10 Obafemi Awolowo Way, Ikeja",
    recipientCity: "Lagos",
    destCoords: { lat: 6.6018, lng: 3.3515 },
    parcelDescription: "Raw Fabric Rolls (10 Bundles)",
    weightKg: 45.0,
    shippingFee: 18000,
    currency: "NGN",
    estimatedDelivery: "Today, 04:30 PM",
    courierId: "drv-2",
    courierName: "Emeka Okafor",
    courierPhone: "+234 807 778 8899",
    courierPlate: "APP-912-LK",
    courierVehicle: "VAN",
    courierRating: 4.8,
    deliveryOtp: "6304",
    waypoints: [
      { id: "wp-21", location: "Oshodi Warehouse Gates", status: "ASSIGNED", timestamp: "11:15 AM", notes: "Van driver dispatched for warehouse pickup" },
    ],
    createdAt: "Today at 10:20 AM",
    updatedAt: "Today at 11:15 AM",
  },
  {
    id: "JOB-2026-8495",
    orderNumber: "OFIA-2026-8990",
    trackingNumber: "NX-849190-NG",
    type: "STORE_ORDER",
    status: "EXCEPTION",
    priority: "URGENT",
    initiatorName: "Crispy Bites Eatery",
    initiatorPhone: "+234 803 765 4321",
    pickupAddress: "18 Isaac John St, Ikeja GRA",
    pickupCity: "Lagos",
    pickupCoords: { lat: 6.5890, lng: 3.3550 },
    recipientName: "Engr. Kunle Bello",
    recipientPhone: "+234 805 123 9988",
    recipientAddress: "Block B, Gbagada Phase 2 Estate",
    recipientCity: "Lagos",
    destCoords: { lat: 6.5500, lng: 3.3900 },
    parcelDescription: "Warm Gourmet Family Meal Combo (Perishable)",
    weightKg: 3.5,
    shippingFee: 3000,
    currency: "NGN",
    estimatedDelivery: "11:45 AM",
    courierId: "drv-5",
    courierName: "Fatima Al-Hassan",
    courierPhone: "+234 805 222 9900",
    courierPlate: "AGL-504-QC",
    courierVehicle: "MOTORBIKE",
    courierRating: 5.0,
    exceptionReason: "Customer Unreachable",
    exceptionNotes: "Recipient mobile phone switched off after 4 calls; estate security denied entry without resident gate pass.",
    deliveryOtp: "2209",
    waypoints: [
      { id: "wp-31", location: "Crispy Bites Ikeja", status: "PICKED_UP", timestamp: "10:30 AM", notes: "Sealed food container checked" },
      { id: "wp-32", location: "Gbagada Phase 2 Gate", status: "EXCEPTION", timestamp: "11:25 AM", notes: "Security gate blocked; recipient unreachable" },
    ],
    createdAt: "Today at 10:05 AM",
    updatedAt: "Today at 11:25 AM",
  },
  {
    id: "JOB-2026-8490",
    orderNumber: "OFIA-2026-8975",
    trackingNumber: "NX-849180-NG",
    type: "STORE_ORDER",
    status: "DELIVERED",
    priority: "STANDARD",
    initiatorName: "Nexa Pharmacy Lekki",
    initiatorPhone: "+234 802 999 4433",
    pickupAddress: "Block 12, Admiralty Way, Lekki Phase 1",
    pickupCity: "Lagos",
    pickupCoords: { lat: 6.4650, lng: 3.5800 },
    recipientName: "Mrs. Folashade Johnson",
    recipientPhone: "+234 808 333 7711",
    recipientAddress: "Chevy View Estate, Chevron Tollgate",
    recipientCity: "Lagos",
    destCoords: { lat: 6.4400, lng: 3.5400 },
    parcelDescription: "Prescription Medications & Health Supplement Care Pack",
    weightKg: 1.1,
    shippingFee: 2500,
    currency: "NGN",
    estimatedDelivery: "Today, 10:15 AM",
    courierId: "drv-3",
    courierName: "Babatunde Shola",
    courierPhone: "+234 812 555 1234",
    courierPlate: "LND-320-YY",
    courierVehicle: "MOTORBIKE",
    courierRating: 4.95,
    deliveryOtp: "5512",
    waypoints: [
      { id: "wp-41", location: "Nexa Pharmacy Lekki", status: "PICKED_UP", timestamp: "09:30 AM", notes: "Temperature verified" },
      { id: "wp-42", location: "Chevy View Estate Gate", status: "DELIVERED", timestamp: "10:10 AM", notes: "Handed to recipient; OTP verified" },
    ],
    createdAt: "Today at 09:00 AM",
    updatedAt: "Today at 10:10 AM",
  },
];

export const INITIAL_ZONE_RATES: ZoneRate[] = [
  { id: "zn-1", zoneName: "Lagos Mainland Intrazone", originCity: "Lagos (Mainland)", destCity: "Lagos (Mainland)", baseFee: 2000, perKgFee: 350, estimatedDays: 1 },
  { id: "zn-2", zoneName: "Lagos Island Intrazone", originCity: "Lagos (Island/Lekki)", destCity: "Lagos (Island/Lekki)", baseFee: 2200, perKgFee: 400, estimatedDays: 1 },
  { id: "zn-3", zoneName: "Cross-Lagoon Express (Mainland ↔ Island)", originCity: "Lagos (Mainland)", destCity: "Lagos (Island)", baseFee: 3200, perKgFee: 450, estimatedDays: 1 },
  { id: "zn-4", zoneName: "Greater Lagos / Outskirts (Ikorodu, Epe, Badagry)", originCity: "Lagos", destCity: "Lagos Outskirts", baseFee: 4500, perKgFee: 600, estimatedDays: 1 },
  { id: "zn-5", zoneName: "Interstate Express (Lagos ↔ Abuja)", originCity: "Lagos", destCity: "Abuja", baseFee: 6500, perKgFee: 900, estimatedDays: 2 },
  { id: "zn-6", zoneName: "Interstate Express (Lagos ↔ Port Harcourt)", originCity: "Lagos", destCity: "Port Harcourt", baseFee: 7000, perKgFee: 950, estimatedDays: 2 },
];
