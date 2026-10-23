import fs from "fs";
import path from "path";
import { StorefrontOrderPayload, StorefrontBookingPayload } from "@/types/storefront";
import { getTenantSql, MASTER_CONNECTION_STRING } from "./tenant-db-resolver";

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

function ensureStorageReady() {
  try {
    if (!fs.existsSync(SYNC_DIR)) {
      fs.mkdirSync(SYNC_DIR, { recursive: true });
    }
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, "[]", "utf8");
    }
    if (!fs.existsSync(BOOKINGS_FILE)) {
      fs.writeFileSync(BOOKINGS_FILE, "[]", "utf8");
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

/**
 * Retrieves orders strictly partitioned by tenantSlug against their dedicated database.
 */
export async function getStorefrontOrders(tenantSlug: string): Promise<StorefrontOrderPayload[]> {
  ensureStorageReady();
  const clean = (tenantSlug || "").toLowerCase().trim();
  if (!clean) return [];

  const sql = await getTenantSql(clean);

  // 1. Query dedicated Neon PostgreSQL database
  if (sql) {
    try {
      const rows = await sql`
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

      if (rows && rows.length > 0) {
        return rows.map(mapRowToStorefrontOrder);
      }
    } catch (err) {
      console.warn(`[Storefront Commerce Store] Dedicated orders query failed for tenant '${clean}':`, err);
    }
  }

  // 2. Fallback to local sync file cache strictly partitioned by tenant
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, "utf8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((o) => (o.tenantSlug || "").toLowerCase().trim() === clean);
      }
    }
  } catch {}

  return memoryOrders.filter((o) => (o.tenantSlug || "").toLowerCase().trim() === clean);
}

/**
 * Retrieves a single order by ID or orderNumber strictly scoped to the tenant.
 */
export async function getStorefrontOrderByIdOrRef(
  idOrRef: string,
  tenantSlug: string
): Promise<StorefrontOrderPayload | null> {
  ensureStorageReady();
  const cleanRef = (idOrRef || "").trim().toLowerCase();
  const cleanTenant = (tenantSlug || "").trim().toLowerCase();
  if (!cleanRef || !cleanTenant) return null;

  const sql = await getTenantSql(cleanTenant);

  // 1. Direct query in dedicated Neon PostgreSQL strictly scoped to tenant
  if (sql) {
    try {
      const rows = await sql`
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

      if (rows && rows.length > 0) {
        return mapRowToStorefrontOrder(rows[0]);
      }
    } catch (err) {
      console.warn(`[Storefront Commerce Store] Query by ref failed for tenant '${cleanTenant}':`, err);
    }
  }

  // 2. Fallback to cached orders strictly filtered by tenant
  const tenantOrders = await getStorefrontOrders(cleanTenant);
  const match = tenantOrders.find(
    (o) =>
      o.id.toLowerCase() === cleanRef ||
      o.orderNumber.toLowerCase() === cleanRef ||
      o.orderNumber.toLowerCase().includes(cleanRef)
  );

  return match || null;
}

/**
 * Saves a new storefront order strictly into the tenant's dedicated database.
 */
export async function saveStorefrontOrder(order: StorefrontOrderPayload): Promise<StorefrontOrderPayload> {
  ensureStorageReady();
  const cleanTenant = (order.tenantSlug || "").toLowerCase().trim();
  if (!cleanTenant) {
    throw new Error("[Storefront Commerce Store] tenantSlug is required to save storefront order.");
  }

  const sql = await getTenantSql(cleanTenant);

  // 1. Save to dedicated Neon PostgreSQL database
  if (sql) {
    try {
      await sql`
        INSERT INTO shop_orders (
          id, order_number, tenant_slug, tenant_id, customer_name, customer_email,
          customer_phone, channel, status, payment_status, delivery_method,
          shipping_address, city, payment_method, items_summary, item_count,
          total_amount, raw_amount, notes, items, created_at, updated_at
        ) VALUES (
          ${order.id}, ${order.orderNumber}, ${cleanTenant}, ${order.tenantId || ""},
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
      console.warn(`[Storefront Commerce Store] Dedicated saveOrder warning for tenant '${cleanTenant}':`, err);
    }
  }

  // 2. Deduplicate and save to local sync file
  try {
    let allOrders: StorefrontOrderPayload[] = [];
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, "utf8");
      allOrders = JSON.parse(data);
      if (!Array.isArray(allOrders)) allOrders = [];
    }
    const filtered = allOrders.filter(
      (o) => o.id !== order.id && o.orderNumber !== order.orderNumber
    );
    const updated = [order, ...filtered];
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(updated, null, 2), "utf8");
  } catch {
    memoryOrders = [order, ...memoryOrders.filter((o) => o.id !== order.id)];
  }

  return order;
}

/**
 * Updates order status strictly scoped to tenant.
 */
export async function updateStorefrontOrderStatus(
  orderIdOrNum: string,
  newStatus: StorefrontOrderPayload["status"],
  tenantSlug: string
): Promise<boolean> {
  ensureStorageReady();
  const cleanTenant = (tenantSlug || "").trim().toLowerCase();
  const cleanRef = (orderIdOrNum || "").trim();
  if (!cleanTenant || !cleanRef) return false;

  const sql = await getTenantSql(cleanTenant);

  // 1. Update dedicated Neon PostgreSQL strictly partitioned by tenant_slug
  if (sql) {
    try {
      await sql`
        UPDATE shop_orders
        SET status = ${newStatus}, updated_at = NOW()
        WHERE (id = ${cleanRef} OR order_number = ${cleanRef})
          AND LOWER(tenant_slug) = ${cleanTenant}
      `;
    } catch (err) {
      console.warn(`[Storefront Commerce Store] Update status failed for tenant '${cleanTenant}':`, err);
    }
  }

  // 2. Update local sync file for this tenant
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, "utf8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        const updated = parsed.map((o) => {
          if (
            (o.id === cleanRef || o.orderNumber === cleanRef) &&
            (o.tenantSlug || "").toLowerCase().trim() === cleanTenant
          ) {
            return { ...o, status: newStatus };
          }
          return o;
        });
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(updated, null, 2), "utf8");
      }
    }
  } catch {}

  return true;
}

/**
 * Retrieves bookings strictly partitioned by tenantSlug.
 */
export async function getStorefrontBookings(tenantSlug: string): Promise<StorefrontBookingPayload[]> {
  ensureStorageReady();
  const clean = (tenantSlug || "").toLowerCase().trim();
  if (!clean) return [];

  const sql = await getTenantSql(clean);

  // 1. Neon PostgreSQL query strictly scoped to tenant
  if (sql) {
    try {
      const rows = await sql`
        SELECT id, booking_number, tenant_slug, COALESCE(tenant_id, '') as tenant_id,
               customer_name, COALESCE(customer_email, '') as customer_email,
               customer_phone, service_title, date_time, status, vertical,
               COALESCE(notes, '') as notes, amount, created_at, updated_at
        FROM shop_bookings
        WHERE LOWER(tenant_slug) = ${clean}
        ORDER BY created_at DESC
        LIMIT 100
      `;

      if (rows && rows.length > 0) {
        return rows.map((r) => ({
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
          createdAt: r.created_at
            ? new Date(r.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Recently",
        }));
      }
    } catch (err) {
      console.warn(`[Storefront Commerce Store] Bookings query failed for tenant '${clean}':`, err);
    }
  }

  // 2. Fallback to local sync file cache strictly partitioned by tenant
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, "utf8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((b) => (b.tenantSlug || "").toLowerCase().trim() === clean);
      }
    }
  } catch {}

  return memoryBookings.filter((b) => (b.tenantSlug || "").toLowerCase().trim() === clean);
}

/**
 * Saves a new booking strictly into the tenant's dedicated database.
 */
export async function saveStorefrontBooking(
  booking: StorefrontBookingPayload
): Promise<StorefrontBookingPayload> {
  ensureStorageReady();
  const cleanTenant = (booking.tenantSlug || "").toLowerCase().trim();
  if (!cleanTenant) {
    throw new Error("[Storefront Commerce Store] tenantSlug is required to save storefront booking.");
  }

  const sql = await getTenantSql(cleanTenant);

  // 1. Save to dedicated Neon PostgreSQL database
  if (sql) {
    try {
      await sql`
        INSERT INTO shop_bookings (
          id, booking_number, tenant_slug, tenant_id, customer_name, customer_email,
          customer_phone, service_title, date_time, status, vertical, notes, created_at, updated_at
        ) VALUES (
          ${booking.id}, ${booking.bookingNumber}, ${cleanTenant}, ${booking.tenantId || ""},
          ${booking.customerName}, ${booking.customerEmail || ""}, ${booking.customerPhone},
          ${booking.serviceTitle}, ${booking.dateTime}, ${booking.status || "CONFIRMED"},
          ${booking.vertical || "cars"}, ${booking.notes || ""}, NOW(), NOW()
        )
        ON CONFLICT (tenant_slug, booking_number) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = NOW()
      `;
    } catch (err) {
      console.warn(`[Storefront Commerce Store] Dedicated saveBooking warning for tenant '${cleanTenant}':`, err);
    }
  }

  // 2. Deduplicate and save to local sync file
  try {
    let allBookings: StorefrontBookingPayload[] = [];
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, "utf8");
      allBookings = JSON.parse(data);
      if (!Array.isArray(allBookings)) allBookings = [];
    }
    const filtered = allBookings.filter(
      (b) => b.id !== booking.id && b.bookingNumber !== booking.bookingNumber
    );
    const updated = [booking, ...filtered];
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(updated, null, 2), "utf8");
  } catch {
    memoryBookings = [booking, ...memoryBookings.filter((b) => b.id !== booking.id)];
  }

  return booking;
}

/**
 * Updates booking status strictly scoped to tenant.
 */
export async function updateStorefrontBookingStatus(
  bookingIdOrNum: string,
  newStatus: StorefrontBookingPayload["status"],
  tenantSlug: string
): Promise<boolean> {
  ensureStorageReady();
  const cleanTenant = (tenantSlug || "").trim().toLowerCase();
  const cleanRef = (bookingIdOrNum || "").trim();
  if (!cleanTenant || !cleanRef) return false;

  const sql = await getTenantSql(cleanTenant);

  // 1. Update dedicated Neon PostgreSQL strictly partitioned by tenant_slug
  if (sql) {
    try {
      await sql`
        UPDATE shop_bookings
        SET status = ${newStatus}, updated_at = NOW()
        WHERE (id = ${cleanRef} OR booking_number = ${cleanRef})
          AND LOWER(tenant_slug) = ${cleanTenant}
      `;
    } catch (err) {
      console.warn(`[Storefront Commerce Store] Update booking status failed for tenant '${cleanTenant}':`, err);
    }
  }

  // 2. Update local sync file
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, "utf8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        const updated = parsed.map((b) => {
          if (
            (b.id === cleanRef || b.bookingNumber === cleanRef) &&
            (b.tenantSlug || "").toLowerCase().trim() === cleanTenant
          ) {
            return { ...b, status: newStatus };
          }
          return b;
        });
        fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(updated, null, 2), "utf8");
      }
    }
  } catch {}

  return true;
}
