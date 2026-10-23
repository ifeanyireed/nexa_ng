import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { StorefrontOrderPayload, StorefrontBookingPayload } from "@/types/storefront";

const NEON_CONNECTION_STRING =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  "postgresql://neondb_owner:npg_YBd2DvyRxTG7@ep-falling-star-b4lrdr76-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

function getSql() {
  try {
    if (NEON_CONNECTION_STRING) {
      return neon(NEON_CONNECTION_STRING);
    }
  } catch (err) {
    console.warn("[Storefront Commerce Store] Neon SQL initialization warning:", err);
  }
  return null;
}

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

function mapRowToStorefrontOrder(r: any): StorefrontOrderPayload {
  let items: any[] = [];
  try {
    if (typeof r.items === "string") {
      items = JSON.parse(r.items);
    } else if (Array.isArray(r.items)) {
      items = r.items;
    }
  } catch {
    items = [];
  }

  return {
    id: r.id,
    orderNumber: r.order_number,
    tenantSlug: r.tenant_slug,
    tenantId: r.tenant_id || "",
    customerName: r.customer_name,
    customerEmail: r.customer_email || "",
    customerPhone: r.customer_phone || "",
    channel: (r.channel as any) || "STOREFRONT",
    shippingAddress: r.shipping_address || "",
    city: r.city || "Lagos",
    paymentMethod: r.payment_method || "card",
    items: items,
    itemsSummary: r.items_summary || "",
    itemCount: Number(r.item_count) || 1,
    totalAmount: r.total_amount || "₦0",
    rawAmount: Number(r.raw_amount) || 0,
    status: r.status,
    paymentStatus: r.payment_status || "PAID",
    deliveryMethod: r.delivery_method || "DISPATCH",
    createdAt: r.created_at
      ? new Date(r.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Recently",
    notes: r.notes || "",
  };
}

export async function getStorefrontOrders(tenantSlug?: string): Promise<StorefrontOrderPayload[]> {
  ensureStorageReady();
  const sql = getSql();
  const clean = tenantSlug ? tenantSlug.toLowerCase().trim() : null;

  // 1. Query Neon PostgreSQL
  if (sql) {
    try {
      let rows: any[] = [];
      if (clean) {
        rows = await sql`
          SELECT id, order_number, tenant_slug, COALESCE(tenant_id, '') as tenant_id,
                 customer_name, COALESCE(customer_email, '') as customer_email,
                 customer_phone, channel, status, payment_status, delivery_method,
                 COALESCE(shipping_address, '') as shipping_address,
                 COALESCE(city, 'Lagos') as city,
                 COALESCE(payment_method, 'card') as payment_method,
                 COALESCE(items_summary, '') as items_summary,
                 item_count, total_amount, raw_amount,
                 COALESCE(currency, '₦') as currency,
                 COALESCE(items, '[]'::jsonb) as items,
                 COALESCE(notes, '') as notes,
                 created_at, updated_at
          FROM shop_orders
          WHERE LOWER(tenant_slug) = ${clean}
          ORDER BY created_at DESC
          LIMIT 100
        `;
      } else {
        rows = await sql`
          SELECT id, order_number, tenant_slug, COALESCE(tenant_id, '') as tenant_id,
                 customer_name, COALESCE(customer_email, '') as customer_email,
                 customer_phone, channel, status, payment_status, delivery_method,
                 COALESCE(shipping_address, '') as shipping_address,
                 COALESCE(city, 'Lagos') as city,
                 COALESCE(payment_method, 'card') as payment_method,
                 COALESCE(items_summary, '') as items_summary,
                 item_count, total_amount, raw_amount,
                 COALESCE(currency, '₦') as currency,
                 COALESCE(items, '[]'::jsonb) as items,
                 COALESCE(notes, '') as notes,
                 created_at, updated_at
          FROM shop_orders
          ORDER BY created_at DESC
          LIMIT 100
        `;
      }

      if (rows && rows.length > 0) {
        const pgOrders = rows.map(mapRowToStorefrontOrder);
        try {
          fs.writeFileSync(ORDERS_FILE, JSON.stringify(pgOrders, null, 2), "utf8");
        } catch {}
        return pgOrders;
      }
    } catch (err) {
      console.warn("[Storefront Commerce Store] Neon orders query failed, using sync cache:", err);
    }
  }

  // 2. Fallback to local sync file cache
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

  if (!clean) return allOrders;
  const filtered = allOrders.filter(
    (o) => (o.tenantSlug || "").toLowerCase().trim() === clean
  );
  return filtered.length > 0 ? filtered : allOrders;
}

export async function getStorefrontOrderByIdOrRef(
  idOrRef: string,
  tenantSlug?: string
): Promise<StorefrontOrderPayload | null> {
  ensureStorageReady();
  const sql = getSql();
  const cleanRef = idOrRef.trim().toLowerCase();
  const cleanTenant = tenantSlug ? tenantSlug.trim().toLowerCase() : null;

  // 1. Direct query in Neon PostgreSQL
  if (sql) {
    try {
      let rows: any[] = [];
      if (cleanTenant) {
        rows = await sql`
          SELECT id, order_number, tenant_slug, COALESCE(tenant_id, '') as tenant_id,
                 customer_name, COALESCE(customer_email, '') as customer_email,
                 customer_phone, channel, status, payment_status, delivery_method,
                 COALESCE(shipping_address, '') as shipping_address,
                 COALESCE(city, 'Lagos') as city,
                 COALESCE(payment_method, 'card') as payment_method,
                 COALESCE(items_summary, '') as items_summary,
                 item_count, total_amount, raw_amount,
                 COALESCE(currency, '₦') as currency,
                 COALESCE(items, '[]'::jsonb) as items,
                 COALESCE(notes, '') as notes,
                 created_at, updated_at
          FROM shop_orders
          WHERE (LOWER(order_number) = ${cleanRef} OR LOWER(id) = ${cleanRef})
            AND LOWER(tenant_slug) = ${cleanTenant}
          LIMIT 1
        `;
      }

      if (!rows || rows.length === 0) {
        rows = await sql`
          SELECT id, order_number, tenant_slug, COALESCE(tenant_id, '') as tenant_id,
                 customer_name, COALESCE(customer_email, '') as customer_email,
                 customer_phone, channel, status, payment_status, delivery_method,
                 COALESCE(shipping_address, '') as shipping_address,
                 COALESCE(city, 'Lagos') as city,
                 COALESCE(payment_method, 'card') as payment_method,
                 COALESCE(items_summary, '') as items_summary,
                 item_count, total_amount, raw_amount,
                 COALESCE(currency, '₦') as currency,
                 COALESCE(items, '[]'::jsonb) as items,
                 COALESCE(notes, '') as notes,
                 created_at, updated_at
          FROM shop_orders
          WHERE LOWER(order_number) = ${cleanRef} OR LOWER(id) = ${cleanRef}
          LIMIT 1
        `;
      }

      if (rows && rows.length > 0) {
        return mapRowToStorefrontOrder(rows[0]);
      }
    } catch (err) {
      console.warn("[Storefront Commerce Store] Neon query by ref failed:", err);
    }
  }

  // 2. Fallback to cached orders
  const allOrders = await getStorefrontOrders();
  const match = allOrders.find(
    (o) =>
      o.id.toLowerCase() === cleanRef ||
      o.orderNumber.toLowerCase() === cleanRef ||
      o.orderNumber.toLowerCase().includes(cleanRef)
  );

  return match || null;
}

export async function saveStorefrontOrder(order: StorefrontOrderPayload): Promise<StorefrontOrderPayload> {
  ensureStorageReady();
  const sql = getSql();

  // 1. Save to Neon PostgreSQL
  if (sql) {
    try {
      await sql`
        INSERT INTO shop_orders (
          id, order_number, tenant_slug, tenant_id, customer_name, customer_email,
          customer_phone, channel, status, payment_status, delivery_method,
          shipping_address, city, payment_method, items_summary, item_count,
          total_amount, raw_amount, notes, items, created_at, updated_at
        ) VALUES (
          ${order.id}, ${order.orderNumber}, ${order.tenantSlug}, ${order.tenantId || ""},
          ${order.customerName}, ${order.customerEmail || ""}, ${order.customerPhone},
          ${order.channel || "STOREFRONT"}, ${order.status || "IN_PREPARATION"}, ${order.paymentStatus || "PAID"},
          ${order.deliveryMethod || "DISPATCH"}, ${order.shippingAddress || ""}, ${order.city || "Lagos"},
          ${order.paymentMethod || "card"}, ${order.itemsSummary || ""}, ${order.itemCount || 1},
          ${order.totalAmount || "₦0"}, ${order.rawAmount || 0}, ${order.notes || ""},
          ${JSON.stringify(order.items || [])}::jsonb, NOW(), NOW()
        )
        ON CONFLICT (tenant_slug, order_number) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = NOW()
      `;
    } catch (err) {
      console.warn("[Storefront Commerce Store] Neon saveOrder warning:", err);
    }
  }

  // 2. Deduplicate and save to local sync file
  const currentOrders = await getStorefrontOrders();
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
  const sql = getSql();

  // 1. Update Neon PostgreSQL
  if (sql) {
    try {
      await sql`
        UPDATE shop_orders
        SET status = ${newStatus}, updated_at = NOW()
        WHERE id = ${orderIdOrNum} OR order_number = ${orderIdOrNum}
      `;
    } catch (err) {
      console.warn("[Storefront Commerce Store] Neon update status warning:", err);
    }
  }

  // 2. Update local sync file
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
  const sql = getSql();
  const clean = tenantSlug ? tenantSlug.toLowerCase().trim() : null;

  // 1. Neon PostgreSQL query
  if (sql) {
    try {
      let rows: any[] = [];
      if (clean) {
        rows = await sql`
          SELECT id, booking_number, tenant_slug, COALESCE(tenant_id, '') as tenant_id,
                 customer_name, COALESCE(customer_email, '') as customer_email,
                 customer_phone, service_title, date_time, status, vertical,
                 COALESCE(notes, '') as notes, amount, created_at, updated_at
          FROM shop_bookings
          WHERE LOWER(tenant_slug) = ${clean}
          ORDER BY created_at DESC
          LIMIT 100
        `;
      } else {
        rows = await sql`
          SELECT id, booking_number, tenant_slug, COALESCE(tenant_id, '') as tenant_id,
                 customer_name, COALESCE(customer_email, '') as customer_email,
                 customer_phone, service_title, date_time, status, vertical,
                 COALESCE(notes, '') as notes, amount, created_at, updated_at
          FROM shop_bookings
          ORDER BY created_at DESC
          LIMIT 100
        `;
      }

      if (rows && rows.length > 0) {
        const pgBookings: StorefrontBookingPayload[] = rows.map((r) => ({
          id: r.id,
          bookingNumber: r.booking_number,
          tenantSlug: r.tenant_slug,
          tenantId: r.tenant_id,
          customerName: r.customer_name,
          customerEmail: r.customer_email,
          customerPhone: r.customer_phone,
          serviceTitle: r.service_title,
          dateTime: r.date_time,
          status: r.status,
          notes: r.notes,
          vertical: r.vertical,
          createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently",
        }));

        try {
          fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(pgBookings, null, 2), "utf8");
        } catch {}

        return pgBookings;
      }
    } catch (err) {
      console.warn("[Storefront Commerce Store] Neon bookings query failed, using sync cache:", err);
    }
  }

  // 2. Fallback to local sync file cache
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

  if (!clean) return allBookings;
  const filtered = allBookings.filter(
    (b) => (b.tenantSlug || "").toLowerCase().trim() === clean
  );
  return filtered.length > 0 ? filtered : allBookings;
}

export async function saveStorefrontBooking(
  booking: StorefrontBookingPayload
): Promise<StorefrontBookingPayload> {
  ensureStorageReady();
  const sql = getSql();

  // 1. Save to Neon PostgreSQL
  if (sql) {
    try {
      await sql`
        INSERT INTO shop_bookings (
          id, booking_number, tenant_slug, tenant_id, customer_name, customer_email,
          customer_phone, service_title, date_time, status, vertical, notes, created_at, updated_at
        ) VALUES (
          ${booking.id}, ${booking.bookingNumber}, ${booking.tenantSlug}, ${booking.tenantId || ""},
          ${booking.customerName}, ${booking.customerEmail || ""}, ${booking.customerPhone},
          ${booking.serviceTitle}, ${booking.dateTime}, ${booking.status || "CONFIRMED"},
          ${booking.vertical || "cars"}, ${booking.notes || ""}, NOW(), NOW()
        )
        ON CONFLICT (tenant_slug, booking_number) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = NOW()
      `;
    } catch (err) {
      console.warn("[Storefront Commerce Store] Neon saveBooking warning:", err);
    }
  }

  // 2. Deduplicate and save to local sync file
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
  const sql = getSql();

  // 1. Update Neon PostgreSQL
  if (sql) {
    try {
      await sql`
        UPDATE shop_bookings
        SET status = ${newStatus}, updated_at = NOW()
        WHERE id = ${bookingIdOrNum} OR booking_number = ${bookingIdOrNum}
      `;
    } catch (err) {
      console.warn("[Storefront Commerce Store] Neon update booking status warning:", err);
    }
  }

  // 2. Update local sync file
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
