import fs from "fs";
import path from "path";
import { CommerceOrderItem, CommerceBookingItem } from "./verticals";

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
const ORDERS_FILE = path.join(SYNC_DIR, "orders.json");
const BOOKINGS_FILE = path.join(SYNC_DIR, "bookings.json");

// In-memory fallback
let memoryOrders: CommerceOrderItem[] = [];
let memoryBookings: CommerceBookingItem[] = [];

// Fallback Seed Orders
const SEED_ORDERS: CommerceOrderItem[] = [
  {
    id: "ORD-9021",
    orderNumber: "OFIA-2026-9021",
    tenantSlug: "neweratransports",
    tenantId: "org-01",
    customerName: "Chief Babatunde Alabi",
    customerEmail: "babatunde.alabi@gmail.com",
    customerPhone: "+234 802 334 5566",
    channel: "STOREFRONT",
    itemsSummary: "2024 Mercedes-Benz GLE 450 4MATIC (Executive Edition)",
    itemCount: 1,
    totalAmount: "₦98,000,000",
    rawAmount: 98000000,
    status: "IN_PREPARATION",
    paymentStatus: "PAID",
    deliveryMethod: "DISPATCH",
    shippingAddress: "Plot 12, Alexander Road, Ikoyi, Lagos",
    createdAt: "Today at 09:15 AM",
  },
  {
    id: "ORD-9020",
    orderNumber: "OFIA-2026-9020",
    tenantSlug: "neweratransports",
    tenantId: "org-01",
    customerName: "Mrs. Amaka Okoye",
    customerEmail: "amaka.okoye@yahoo.com",
    channel: "POS_COUNTER",
    itemsSummary: "Custom Leather Steering Wrap + 4x RunFlat Tires",
    itemCount: 5,
    totalAmount: "₦1,250,000",
    rawAmount: 1250000,
    status: "READY_DISPATCH",
    paymentStatus: "PAID",
    deliveryMethod: "STORE_PICKUP",
    createdAt: "Today at 10:45 AM",
  },
  {
    id: "ORD-9018",
    orderNumber: "OFIA-2026-9018",
    tenantSlug: "reedbreed",
    tenantId: "org-02",
    customerName: "Engr. Nnamdi Eze",
    customerEmail: "nnamdi.eze@techcorp.ng",
    customerPhone: "+234 809 112 3344",
    channel: "STOREFRONT",
    itemsSummary: "Apple MacBook Pro 16\" M3 Max (36GB RAM / 1TB SSD)",
    itemCount: 1,
    totalAmount: "₦4,350,000",
    rawAmount: 4350000,
    status: "CONFIRMED",
    paymentStatus: "PAID",
    deliveryMethod: "DISPATCH",
    shippingAddress: "Block 4, Lekki Phase 1, Lagos",
    createdAt: "Today at 10:30 AM",
  },
];

const SEED_BOOKINGS: CommerceBookingItem[] = [
  {
    id: "BK-101",
    bookingNumber: "TD-88219",
    tenantSlug: "neweratransports",
    tenantId: "org-01",
    customerName: "Dr. Emmanuel Adeleke",
    customerEmail: "emmanuel.adeleke@gmail.com",
    customerPhone: "+234 803 456 7890",
    serviceTitle: "Comprehensive 150-Point Pre-Purchase Mechanical Inspection",
    dateTime: "Tomorrow at 10:00 AM",
    status: "CONFIRMED",
    vertical: "cars",
    notes: "Customer requested morning slot before noon at showroom.",
    createdAt: "Today at 08:00 AM",
  },
];

function ensureStorageReady() {
  try {
    if (!fs.existsSync(SYNC_DIR)) {
      fs.mkdirSync(SYNC_DIR, { recursive: true });
    }
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(SEED_ORDERS, null, 2), "utf8");
    }
    if (!fs.existsSync(BOOKINGS_FILE)) {
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(SEED_BOOKINGS, null, 2), "utf8");
    }
  } catch {}
}

export async function getErpOrders(tenantSlug?: string): Promise<CommerceOrderItem[]> {
  ensureStorageReady();
  let allOrders: CommerceOrderItem[] = [];

  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, "utf8");
      const parsed = JSON.parse(data);
      allOrders = Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_ORDERS;
    } else {
      allOrders = memoryOrders.length > 0 ? memoryOrders : SEED_ORDERS;
    }
  } catch {
    allOrders = memoryOrders.length > 0 ? memoryOrders : SEED_ORDERS;
  }

  if (!tenantSlug) return allOrders;
  const clean = tenantSlug.toLowerCase().trim();
  const matched = allOrders.filter(
    (o) => (o.tenantSlug || "").toLowerCase().trim() === clean
  );

  return matched.length > 0 ? matched : allOrders;
}

export async function updateErpOrderStatus(
  orderIdOrNum: string,
  newStatus: CommerceOrderItem["status"]
): Promise<boolean> {
  ensureStorageReady();
  const current = await getErpOrders();
  let found = false;

  const updated = current.map((o) => {
    if (o.id === orderIdOrNum || o.orderNumber === orderIdOrNum) {
      found = true;
      return { ...o, status: newStatus };
    }
    return o;
  });

  if (found) {
    try {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(updated, null, 2), "utf8");
    } catch {
      memoryOrders = updated;
    }
  }

  return found;
}

export async function getErpBookings(tenantSlug?: string): Promise<CommerceBookingItem[]> {
  ensureStorageReady();
  let allBookings: CommerceBookingItem[] = [];

  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, "utf8");
      const parsed = JSON.parse(data);
      allBookings = Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_BOOKINGS;
    } else {
      allBookings = memoryBookings.length > 0 ? memoryBookings : SEED_BOOKINGS;
    }
  } catch {
    allBookings = memoryBookings.length > 0 ? memoryBookings : SEED_BOOKINGS;
  }

  if (!tenantSlug) return allBookings;
  const clean = tenantSlug.toLowerCase().trim();
  const matched = allBookings.filter(
    (b) => (b.tenantSlug || "").toLowerCase().trim() === clean
  );

  return matched.length > 0 ? matched : allBookings;
}

export async function updateErpBookingStatus(
  bookingIdOrNum: string,
  newStatus: CommerceBookingItem["status"]
): Promise<boolean> {
  ensureStorageReady();
  const current = await getErpBookings();
  let found = false;

  const updated = current.map((b) => {
    if (b.id === bookingIdOrNum || (b as any).bookingNumber === bookingIdOrNum) {
      found = true;
      return { ...b, status: newStatus };
    }
    return b;
  });

  if (found) {
    try {
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(updated, null, 2), "utf8");
    } catch {
      memoryBookings = updated;
    }
  }

  return found;
}
