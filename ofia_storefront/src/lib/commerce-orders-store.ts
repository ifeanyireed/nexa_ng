import fs from "fs";
import path from "path";
import { StorefrontOrderPayload, StorefrontBookingPayload } from "@/types/storefront";

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

// In-memory fallback in case of strict ephemeral serverless runtimes
let memoryOrders: StorefrontOrderPayload[] = [];
let memoryBookings: StorefrontBookingPayload[] = [];

// Initial Seed Orders for standard test tenants
const SEED_ORDERS: StorefrontOrderPayload[] = [
  {
    id: "ORD-9021",
    orderNumber: "OFIA-2026-9021",
    tenantSlug: "neweratransports",
    tenantId: "org-01",
    customerName: "Chief Babatunde Alabi",
    customerEmail: "babatunde.alabi@gmail.com",
    customerPhone: "+234 802 334 5566",
    channel: "STOREFRONT",
    items: [
      {
        id: "item-01",
        productId: "car-001",
        title: "2024 Mercedes-Benz GLE 450 4MATIC (Executive Edition)",
        price: 98000000,
        quantity: 1,
      },
    ],
    itemsSummary: "2024 Mercedes-Benz GLE 450 4MATIC",
    itemCount: 1,
    totalAmount: "₦98,000,000",
    rawAmount: 98000000,
    status: "IN_PREPARATION",
    paymentStatus: "PAID",
    deliveryMethod: "DISPATCH",
    shippingAddress: "Plot 12, Alexander Road, Ikoyi, Lagos",
    city: "Lagos",
    paymentMethod: "card",
    createdAt: "Today at 09:15 AM",
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
    items: [
      {
        id: "item-02",
        productId: "gadget-001",
        title: "Apple MacBook Pro 16\" M3 Max (36GB RAM / 1TB SSD)",
        price: 4350000,
        quantity: 1,
      },
    ],
    itemsSummary: "Apple MacBook Pro 16\" M3 Max",
    itemCount: 1,
    totalAmount: "₦4,350,000",
    rawAmount: 4350000,
    status: "CONFIRMED",
    paymentStatus: "PAID",
    deliveryMethod: "DISPATCH",
    shippingAddress: "Block 4, Lekki Phase 1, Lagos",
    city: "Lagos",
    paymentMethod: "transfer",
    createdAt: "Today at 10:30 AM",
  },
];

const SEED_BOOKINGS: StorefrontBookingPayload[] = [
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
  } catch (err) {
    // If filesystem not writeable, fall back to memory
  }
}

export async function getStorefrontOrders(tenantSlug?: string): Promise<StorefrontOrderPayload[]> {
  ensureStorageReady();
  let allOrders: StorefrontOrderPayload[] = [];

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
  return allOrders.filter(
    (o) => (o.tenantSlug || "").toLowerCase().trim() === clean
  );
}

export async function saveStorefrontOrder(order: StorefrontOrderPayload): Promise<StorefrontOrderPayload> {
  ensureStorageReady();
  const currentOrders = await getStorefrontOrders();

  // Deduplicate by id or orderNumber
  const filtered = currentOrders.filter(
    (o) => o.id !== order.id && o.orderNumber !== order.orderNumber
  );
  const updated = [order, ...filtered];

  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(updated, null, 2), "utf8");
  } catch {
    memoryOrders = updated;
  }

  return order;
}

export async function updateStorefrontOrderStatus(
  orderIdOrNum: string,
  newStatus: StorefrontOrderPayload["status"]
): Promise<boolean> {
  ensureStorageReady();
  const currentOrders = await getStorefrontOrders();
  let found = false;

  const updated = currentOrders.map((o) => {
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

export async function getStorefrontBookings(tenantSlug?: string): Promise<StorefrontBookingPayload[]> {
  ensureStorageReady();
  let allBookings: StorefrontBookingPayload[] = [];

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
  return allBookings.filter(
    (b) => (b.tenantSlug || "").toLowerCase().trim() === clean
  );
}

export async function saveStorefrontBooking(
  booking: StorefrontBookingPayload
): Promise<StorefrontBookingPayload> {
  ensureStorageReady();
  const current = await getStorefrontBookings();

  const filtered = current.filter(
    (b) => b.id !== booking.id && b.bookingNumber !== booking.bookingNumber
  );
  const updated = [booking, ...filtered];

  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(updated, null, 2), "utf8");
  } catch {
    memoryBookings = updated;
  }

  return booking;
}

export async function updateStorefrontBookingStatus(
  bookingIdOrNum: string,
  newStatus: StorefrontBookingPayload["status"]
): Promise<boolean> {
  ensureStorageReady();
  const current = await getStorefrontBookings();
  let found = false;

  const updated = current.map((b) => {
    if (b.id === bookingIdOrNum || b.bookingNumber === bookingIdOrNum) {
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
