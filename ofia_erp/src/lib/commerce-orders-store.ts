import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { CommerceOrderItem, CommerceBookingItem } from "./verticals";
import { decrementInventoryForOrder } from "./commerce-inventory-store";
import { sendOrderStatusNotification } from "./commerce-notifications";

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
    console.warn("[Commerce Store] Neon SQL initialization warning:", err);
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
  const sql = getSql();
  const clean = tenantSlug ? tenantSlug.toLowerCase().trim() : null;

  // 1. Query Neon PostgreSQL database
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
        const pgOrders: CommerceOrderItem[] = rows.map((r) => ({
          id: r.id,
          orderNumber: r.order_number,
          tenantSlug: r.tenant_slug,
          tenantId: r.tenant_id,
          customerName: r.customer_name,
          customerEmail: r.customer_email,
          customerPhone: r.customer_phone,
          channel: r.channel || "STOREFRONT",
          itemsSummary: r.items_summary,
          itemCount: Number(r.item_count) || 1,
          totalAmount: r.total_amount,
          rawAmount: Number(r.raw_amount) || 0,
          status: r.status,
          paymentStatus: r.payment_status || "PAID",
          deliveryMethod: r.delivery_method || "DISPATCH",
          shippingAddress: r.shipping_address,
          createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently",
          notes: r.notes,
        }));

        // Mirror to local cache
        try {
          fs.writeFileSync(ORDERS_FILE, JSON.stringify(pgOrders, null, 2), "utf8");
        } catch {}

        return pgOrders;
      }
    } catch (err) {
      console.warn("[Commerce Store] Neon orders query failed, using sync cache:", err);
    }
  }

  // 2. Fallback to local sync file cache
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
  const matched = allOrders.filter(
    (o) => (o.tenantSlug || "").toLowerCase().trim() === clean
  );

  return matched.length > 0 ? matched : allOrders;
}

export async function saveErpOrder(order: Partial<CommerceOrderItem>): Promise<CommerceOrderItem> {
  ensureStorageReady();
  const sql = getSql();
  if (!order.tenantSlug) {
    throw new Error("tenantSlug is required for saving orders");
  }
  const slug = order.tenantSlug.toLowerCase().trim();
  const orderId = order.id || `ORD-${Date.now().toString().slice(-6)}`;
  const orderNum = order.orderNumber || `OFIA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: CommerceOrderItem = {
    id: orderId,
    orderNumber: orderNum,
    tenantSlug: slug,
    tenantId: order.tenantId || `org-${slug}`,
    customerName: order.customerName || "Customer",
    customerEmail: order.customerEmail || "",
    customerPhone: order.customerPhone || "",
    channel: order.channel || "STOREFRONT",
    itemsSummary: order.itemsSummary || "Merchandise",
    itemCount: order.itemCount || 1,
    totalAmount: order.totalAmount || "₦0",
    rawAmount: order.rawAmount || 0,
    status: order.status || "IN_PREPARATION",
    paymentStatus: order.paymentStatus || "PAID",
    deliveryMethod: order.deliveryMethod || "DISPATCH",
    shippingAddress: order.shippingAddress || "",
    city: order.city || "Lagos",
    paymentMethod: order.paymentMethod || "card",
    createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    notes: order.notes || "",
    items: order.items || [],
  };

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
          ${newOrder.id}, ${newOrder.orderNumber}, ${newOrder.tenantSlug}, ${newOrder.tenantId},
          ${newOrder.customerName}, ${newOrder.customerEmail}, ${newOrder.customerPhone},
          ${newOrder.channel}, ${newOrder.status}, ${newOrder.paymentStatus}, ${newOrder.deliveryMethod},
          ${newOrder.shippingAddress}, ${newOrder.city || "Lagos"}, ${newOrder.paymentMethod || "card"},
          ${newOrder.itemsSummary}, ${newOrder.itemCount}, ${newOrder.totalAmount}, ${newOrder.rawAmount},
          ${newOrder.notes}, ${JSON.stringify(newOrder.items || [])}::jsonb, NOW(), NOW()
        )
        ON CONFLICT (tenant_slug, order_number) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = NOW()
      `;

      // Trigger automatic inventory decrement for purchased items
      if (newOrder.items && newOrder.items.length > 0) {
        decrementInventoryForOrder({ tenantSlug: slug, items: newOrder.items }).catch(() => null);
      }
    } catch (err) {
      console.warn("[Commerce Store] Neon saveOrder failed:", err);
    }
  }

  // 2. Save to local sync file
  const current = await getErpOrders(slug);
  const filtered = current.filter((o) => o.id !== newOrder.id && o.orderNumber !== newOrder.orderNumber);
  const updated = [newOrder, ...filtered];
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(updated, null, 2), "utf8");
  } catch {
    memoryOrders = updated;
  }

  return newOrder;
}

export async function updateErpOrderStatus(
  orderIdOrNum: string,
  newStatus: CommerceOrderItem["status"],
  tenantSlug?: string
): Promise<boolean> {
  ensureStorageReady();
  const sql = getSql();
  const cleanTenant = tenantSlug ? tenantSlug.toLowerCase().trim() : null;

  // 1. Update Neon PostgreSQL & dispatch customer notification
  if (sql) {
    try {
      let matchedOrder: any = null;
      if (cleanTenant) {
        const rows = await sql`
          SELECT id, order_number, tenant_slug, tenant_id, customer_name, customer_email, customer_phone, shipping_address
          FROM shop_orders
          WHERE (id = ${orderIdOrNum} OR order_number = ${orderIdOrNum})
            AND LOWER(tenant_slug) = ${cleanTenant}
          LIMIT 1
        `;
        if (rows && rows.length > 0) matchedOrder = rows[0];
      } else {
        const rows = await sql`
          SELECT id, order_number, tenant_slug, tenant_id, customer_name, customer_email, customer_phone, shipping_address
          FROM shop_orders
          WHERE id = ${orderIdOrNum} OR order_number = ${orderIdOrNum}
          LIMIT 1
        `;
        if (rows && rows.length > 0) matchedOrder = rows[0];
      }

      await sql`
        UPDATE shop_orders
        SET status = ${newStatus}, updated_at = NOW()
        WHERE id = ${orderIdOrNum} OR order_number = ${orderIdOrNum}
      `;

      if (matchedOrder) {
        sendOrderStatusNotification({
          orderId: matchedOrder.id,
          orderNumber: matchedOrder.order_number,
          tenantSlug: matchedOrder.tenant_slug,
          tenantId: matchedOrder.tenant_id,
          customerName: matchedOrder.customer_name,
          customerEmail: matchedOrder.customer_email,
          customerPhone: matchedOrder.customer_phone,
          shippingAddress: matchedOrder.shipping_address,
          newStatus: newStatus,
        }).catch(() => null);
      }
    } catch (err) {
      console.warn("[Commerce Store] Neon update order status failed:", err);
    }
  }

  // 2. Update local sync file
  const current = await getErpOrders(cleanTenant || undefined);
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
  const sql = getSql();
  const clean = tenantSlug ? tenantSlug.toLowerCase().trim() : null;

  // 1. Query Neon PostgreSQL database
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
        const pgBookings: CommerceBookingItem[] = rows.map((r) => ({
          id: r.id,
          customerName: r.customer_name,
          customerEmail: r.customer_email,
          customerPhone: r.customer_phone,
          serviceTitle: r.service_title,
          dateTime: r.date_time,
          status: r.status,
          notes: r.notes,
          vertical: r.vertical,
        }));

        try {
          fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(pgBookings, null, 2), "utf8");
        } catch {}

        return pgBookings;
      }
    } catch (err) {
      console.warn("[Commerce Store] Neon bookings query failed, using sync cache:", err);
    }
  }

  // 2. Fallback to local sync file cache
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
  const matched = allBookings.filter(
    (b) => (b.tenantSlug || "").toLowerCase().trim() === clean
  );

  return matched.length > 0 ? matched : allBookings;
}

export async function saveErpBooking(booking: Partial<CommerceBookingItem>): Promise<CommerceBookingItem> {
  ensureStorageReady();
  const sql = getSql();
  if (!booking.tenantSlug) {
    throw new Error("tenantSlug is required for saving bookings");
  }
  const slug = booking.tenantSlug.toLowerCase().trim();
  const bookingId = booking.id || `BK-${Date.now().toString().slice(-6)}`;
  const bookingNum = (booking as any).bookingNumber || `TD-${Math.floor(10000 + Math.random() * 90000)}`;

  const newBooking: CommerceBookingItem = {
    id: bookingId,
    customerName: booking.customerName || "Customer",
    customerEmail: booking.customerEmail || "",
    customerPhone: booking.customerPhone || "",
    serviceTitle: booking.serviceTitle || "Service Appointment",
    dateTime: booking.dateTime || "Tomorrow at 10:00 AM",
    status: booking.status || "PENDING",
    notes: booking.notes || "",
    vertical: booking.vertical || "cars",
    tenantSlug: slug,
  };

  // 1. Save to Neon PostgreSQL
  if (sql) {
    try {
      await sql`
        INSERT INTO shop_bookings (
          id, booking_number, tenant_slug, customer_name, customer_email,
          customer_phone, service_title, date_time, status, vertical, notes, created_at, updated_at
        ) VALUES (
          ${newBooking.id}, ${bookingNum}, ${slug}, ${newBooking.customerName},
          ${newBooking.customerEmail}, ${newBooking.customerPhone}, ${newBooking.serviceTitle},
          ${newBooking.dateTime}, ${newBooking.status}, ${newBooking.vertical}, ${newBooking.notes},
          NOW(), NOW()
        )
        ON CONFLICT (tenant_slug, booking_number) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = NOW()
      `;
    } catch (err) {
      console.warn("[Commerce Store] Neon saveBooking failed:", err);
    }
  }

  // 2. Save to local sync file
  const current = await getErpBookings();
  const filtered = current.filter((b) => b.id !== newBooking.id);
  const updated = [newBooking, ...filtered];
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(updated, null, 2), "utf8");
  } catch {
    memoryBookings = updated;
  }

  return newBooking;
}

export async function updateErpBookingStatus(
  bookingIdOrNum: string,
  newStatus: CommerceBookingItem["status"]
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
      console.warn("[Commerce Store] Neon booking status update failed:", err);
    }
  }

  // 2. Update local sync file
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
