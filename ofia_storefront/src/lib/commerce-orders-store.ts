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
    isEscrow: Boolean(r.is_escrow),
    escrowStatus: r.escrow_status || (r.is_escrow ? "HELD" : "NONE"),
    settlementStatus: r.settlement_status || (r.is_escrow ? "HELD_ESCROW" : "AVAILABLE"),
    merchantAmount: Number(r.merchant_amount) || 0,
    platformFee: Number(r.platform_fee) || 0,
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
               COALESCE(is_escrow, FALSE) as is_escrow,
               COALESCE(escrow_status, 'NONE') as escrow_status,
               COALESCE(settlement_status, 'AVAILABLE') as settlement_status,
               COALESCE(merchant_amount, 0) as merchant_amount,
               COALESCE(platform_fee, 0) as platform_fee,
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
               COALESCE(is_escrow, FALSE) as is_escrow,
               COALESCE(escrow_status, 'NONE') as escrow_status,
               COALESCE(settlement_status, 'AVAILABLE') as settlement_status,
               COALESCE(merchant_amount, 0) as merchant_amount,
               COALESCE(platform_fee, 0) as platform_fee,
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

  const rawAmount = Number(order.rawAmount) || 0;
  const platformFee = order.platformFee ?? Math.round(rawAmount * 0.015 * 100) / 100; // 1.5% commission
  const merchantAmount = order.merchantAmount ?? Math.max(0, rawAmount - platformFee); // 98.5%
  const isEscrow = Boolean(order.isEscrow);
  const escrowStatus = isEscrow ? "HELD" : "NONE";
  const settlementStatus = isEscrow ? "HELD_ESCROW" : "AVAILABLE";

  const sql = await getTenantSql(cleanTenant);

  // 1. Save to dedicated Neon PostgreSQL database
  if (sql) {
    try {
      await sql`
        INSERT INTO shop_orders (
          id, order_number, tenant_slug, tenant_id, customer_name, customer_email,
          customer_phone, channel, status, payment_status, delivery_method,
          shipping_address, city, payment_method, items_summary, item_count,
          total_amount, raw_amount, is_escrow, escrow_status, settlement_status,
          merchant_amount, platform_fee, notes, items, created_at, updated_at
        ) VALUES (
          ${order.id}, ${order.orderNumber}, ${cleanTenant}, ${order.tenantId || ""},
          ${order.customerName}, ${order.customerEmail || ""}, ${order.customerPhone},
          ${order.channel || "STOREFRONT"}, ${order.status || "IN_PREPARATION"}, ${order.paymentStatus || "PAID"},
          ${order.deliveryMethod || "DISPATCH"}, ${order.shippingAddress || ""}, ${order.city || "Lagos"},
          ${order.paymentMethod || "card"}, ${order.itemsSummary || ""}, ${order.itemCount || 1},
          ${order.totalAmount || "₦0"}, ${rawAmount}, ${isEscrow}, ${escrowStatus}, ${settlementStatus},
          ${merchantAmount}, ${platformFee}, ${order.notes || ""},
          ${JSON.stringify(order.items || [])}::jsonb, NOW(), NOW()
        )
        ON CONFLICT (tenant_slug, order_number) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = NOW()
      `;

      // 1b. Multi-Tenant Wallet Credit & Split Execution
      if (rawAmount > 0) {
        const walletId = `wal-${cleanTenant}`;
        const txId = `tx-${Date.now().toString().slice(-8)}`;

        if (isEscrow) {
          // Escrow: Lock 98.5% into escrow_balance pending delivery OTP confirmation
          await sql`
            INSERT INTO tenant_wallets (
              id, tenant_slug, tenant_id, available_balance, escrow_balance, total_withdrawn, currency, created_at, updated_at
            ) VALUES (
              ${walletId}, ${cleanTenant}, ${order.tenantId || ""}, 0, ${merchantAmount}, 0, 'NGN', NOW(), NOW()
            )
            ON CONFLICT (tenant_slug) DO UPDATE SET
              escrow_balance = tenant_wallets.escrow_balance + ${merchantAmount},
              updated_at = NOW()
          `;

          await sql`
            INSERT INTO tenant_wallet_transactions (
              id, tenant_slug, tenant_id, type, amount, reference, description, channel, is_escrow, status, created_at
            ) VALUES (
              ${txId}, ${cleanTenant}, ${order.tenantId || ""}, 'ESCROW_HOLD', ${merchantAmount},
              ${order.orderNumber}, ${`Order #${order.orderNumber} placed into Ofia Escrow Vault pending delivery confirmation.`},
              ${order.channel || "STOREFRONT"}, TRUE, 'SUCCESS', NOW()
            )
          `;
        } else {
          // Default Direct Settlement: Instant split, credit available_balance immediately for anytime withdrawal
          await sql`
            INSERT INTO tenant_wallets (
              id, tenant_slug, tenant_id, available_balance, escrow_balance, total_withdrawn, currency, created_at, updated_at
            ) VALUES (
              ${walletId}, ${cleanTenant}, ${order.tenantId || ""}, ${merchantAmount}, 0, 0, 'NGN', NOW(), NOW()
            )
            ON CONFLICT (tenant_slug) DO UPDATE SET
              available_balance = tenant_wallets.available_balance + ${merchantAmount},
              updated_at = NOW()
          `;

          await sql`
            INSERT INTO tenant_wallet_transactions (
              id, tenant_slug, tenant_id, type, amount, reference, description, channel, is_escrow, status, created_at
            ) VALUES (
              ${txId}, ${cleanTenant}, ${order.tenantId || ""}, 'SALE_CREDIT', ${merchantAmount},
              ${order.orderNumber}, ${`Instant sale settlement (98.5% split) credited for order #${order.orderNumber}. Available for immediate withdrawal.`},
              ${order.channel || "STOREFRONT"}, FALSE, 'SUCCESS', NOW()
            )
          `;
        }
      }
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
      if (newStatus === "DELIVERED") {
        // Check if order was held under Escrow Protection
        const existing = await sql`
          SELECT id, order_number, raw_amount, merchant_amount, is_escrow, escrow_status
          FROM shop_orders
          WHERE (id = ${cleanRef} OR order_number = ${cleanRef})
            AND LOWER(tenant_slug) = ${cleanTenant}
          LIMIT 1
        `;

        if (existing.length > 0 && existing[0].is_escrow && existing[0].escrow_status === "HELD") {
          const ord = existing[0];
          const mAmount = Number(ord.merchant_amount) || Math.max(0, Number(ord.raw_amount) * 0.985);

          await sql`
            UPDATE shop_orders
            SET status = 'DELIVERED',
                escrow_status = 'RELEASED',
                settlement_status = 'AVAILABLE',
                updated_at = NOW()
            WHERE (id = ${cleanRef} OR order_number = ${cleanRef})
              AND LOWER(tenant_slug) = ${cleanTenant}
          `;

          await sql`
            UPDATE tenant_wallets
            SET escrow_balance = GREATEST(0, escrow_balance - ${mAmount}),
                available_balance = available_balance + ${mAmount},
                updated_at = NOW()
            WHERE LOWER(tenant_slug) = ${cleanTenant}
          `;

          const releaseTxId = `tx-rel-${Date.now().toString().slice(-8)}`;
          await sql`
            INSERT INTO tenant_wallet_transactions (
              id, tenant_slug, tenant_id, type, amount, reference, description, channel, is_escrow, status, created_at
            ) VALUES (
              ${releaseTxId}, ${cleanTenant}, '', 'ESCROW_RELEASE', ${mAmount},
              ${ord.order_number}, ${`Escrow payout released for order #${ord.order_number} upon delivery OTP confirmation. Credited to available balance.`},
              'STOREFRONT', FALSE, 'SUCCESS', NOW()
            )
          `;
        } else {
          await sql`
            UPDATE shop_orders
            SET status = ${newStatus}, updated_at = NOW()
            WHERE (id = ${cleanRef} OR order_number = ${cleanRef})
              AND LOWER(tenant_slug) = ${cleanTenant}
          `;
        }
      } else {
        await sql`
          UPDATE shop_orders
          SET status = ${newStatus}, updated_at = NOW()
          WHERE (id = ${cleanRef} OR order_number = ${cleanRef})
            AND LOWER(tenant_slug) = ${cleanTenant}
        `;
      }
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
               customer_phone,
               COALESCE(service_title, service_name, 'Inspection / Service') as service_title,
               COALESCE(date_time, slot_date || ' ' || slot_time, 'TBD') as date_time,
               status, COALESCE(vertical, 'cars') as vertical,
               COALESCE(notes, '') as notes,
               COALESCE(total_amount, '₦0') as amount,
               COALESCE(technician_id, '') as technician_id,
               COALESCE(technician_name, '') as technician_name,
               created_at, updated_at
        FROM shop_bookings
        WHERE LOWER(tenant_slug) = ${clean}
        ORDER BY created_at DESC
        LIMIT 100
      `;

      if (rows && rows.length > 0) {
        return rows.map((r: any) => ({
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
          technicianId: r.technician_id || undefined,
          technicianName: r.technician_name || undefined,
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

  const rawAmount = Number((booking as any).rawAmount || (booking as any).amount) || 0;
  const isEscrow = Boolean(booking.isEscrow);
  const platformFee = Math.round(rawAmount * 0.015 * 100) / 100;
  const merchantAmount = Math.max(0, rawAmount - platformFee);
  const escrowStatus = isEscrow ? "HELD" : "NONE";
  const settlementStatus = isEscrow ? "HELD_ESCROW" : "AVAILABLE";

  const sql = await getTenantSql(cleanTenant);

  // 1. Save to dedicated Neon PostgreSQL database
  if (sql) {
    try {
      await sql`
        INSERT INTO shop_bookings (
          id, booking_number, tenant_slug, tenant_id, customer_name, customer_email,
          customer_phone, service_title, date_time, status, vertical, notes,
          raw_amount, is_escrow, escrow_status, settlement_status, merchant_amount,
          platform_fee, created_at, updated_at
        ) VALUES (
          ${booking.id}, ${booking.bookingNumber}, ${cleanTenant}, ${booking.tenantId || ""},
          ${booking.customerName}, ${booking.customerEmail || ""}, ${booking.customerPhone},
          ${booking.serviceTitle}, ${booking.dateTime}, ${booking.status || "CONFIRMED"},
          ${booking.vertical || "cars"}, ${booking.notes || ""},
          ${rawAmount}, ${isEscrow}, ${escrowStatus}, ${settlementStatus}, ${merchantAmount},
          ${platformFee}, NOW(), NOW()
        )
        ON CONFLICT (tenant_slug, booking_number) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = NOW()
      `;

      // 1b. Update tenant wallet
      if (rawAmount > 0) {
        const walletId = `wal-${cleanTenant}`;
        const txId = `tx-bk-${Date.now().toString().slice(-8)}`;

        if (isEscrow) {
          await sql`
            INSERT INTO tenant_wallets (
              id, tenant_slug, tenant_id, available_balance, escrow_balance, total_withdrawn, currency, created_at, updated_at
            ) VALUES (
              ${walletId}, ${cleanTenant}, ${booking.tenantId || ""}, 0, ${merchantAmount}, 0, 'NGN', NOW(), NOW()
            )
            ON CONFLICT (tenant_slug) DO UPDATE SET
              escrow_balance = tenant_wallets.escrow_balance + ${merchantAmount},
              updated_at = NOW()
          `;

          await sql`
            INSERT INTO tenant_wallet_transactions (
              id, tenant_slug, tenant_id, type, amount, reference, description, channel, is_escrow, status, created_at
            ) VALUES (
              ${txId}, ${cleanTenant}, ${booking.tenantId || ""}, 'ESCROW_HOLD', ${merchantAmount},
              ${booking.bookingNumber}, ${`Service booking #${booking.bookingNumber} (${booking.serviceTitle}) held in Escrow pending service completion.`},
              'STOREFRONT_BOOKING', TRUE, 'SUCCESS', NOW()
            )
          `;
        } else {
          await sql`
            INSERT INTO tenant_wallets (
              id, tenant_slug, tenant_id, available_balance, escrow_balance, total_withdrawn, currency, created_at, updated_at
            ) VALUES (
              ${walletId}, ${cleanTenant}, ${booking.tenantId || ""}, ${merchantAmount}, 0, 0, 'NGN', NOW(), NOW()
            )
            ON CONFLICT (tenant_slug) DO UPDATE SET
              available_balance = tenant_wallets.available_balance + ${merchantAmount},
              updated_at = NOW()
          `;

          await sql`
            INSERT INTO tenant_wallet_transactions (
              id, tenant_slug, tenant_id, type, amount, reference, description, channel, is_escrow, status, created_at
            ) VALUES (
              ${txId}, ${cleanTenant}, ${booking.tenantId || ""}, 'SALE_CREDIT', ${merchantAmount},
              ${booking.bookingNumber}, ${`Direct split settlement (98.5%) for service booking #${booking.bookingNumber}. Available for immediate withdrawal.`},
              'STOREFRONT_BOOKING', FALSE, 'SUCCESS', NOW()
            )
          `;
        }
      }
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
  tenantSlug: string,
  technicianId?: string,
  technicianName?: string
): Promise<boolean> {
  ensureStorageReady();
  const cleanTenant = (tenantSlug || "").trim().toLowerCase();
  const cleanRef = (bookingIdOrNum || "").trim();
  if (!cleanTenant || !cleanRef) return false;

  const sql = await getTenantSql(cleanTenant);

  // 1. Update dedicated Neon PostgreSQL strictly partitioned by tenant_slug
  if (sql) {
    try {
      if (newStatus === "COMPLETED") {
        const existing = await sql`
          SELECT id, booking_number, raw_amount, merchant_amount, is_escrow, escrow_status
          FROM shop_bookings
          WHERE (id = ${cleanRef} OR booking_number = ${cleanRef})
            AND LOWER(tenant_slug) = ${cleanTenant}
          LIMIT 1
        `;

        if (existing.length > 0 && existing[0].is_escrow && existing[0].escrow_status === "HELD") {
          const bk = existing[0];
          const mAmount = Number(bk.merchant_amount) || Math.max(0, Number(bk.raw_amount) * 0.985);

          await sql`
            UPDATE shop_bookings
            SET status = 'COMPLETED',
                escrow_status = 'RELEASED',
                settlement_status = 'AVAILABLE',
                technician_id = COALESCE(${technicianId || null}, technician_id),
                technician_name = COALESCE(${technicianName || null}, technician_name),
                updated_at = NOW()
            WHERE (id = ${cleanRef} OR booking_number = ${cleanRef})
              AND LOWER(tenant_slug) = ${cleanTenant}
          `;

          await sql`
            UPDATE tenant_wallets
            SET escrow_balance = GREATEST(0, escrow_balance - ${mAmount}),
                available_balance = available_balance + ${mAmount},
                updated_at = NOW()
            WHERE LOWER(tenant_slug) = ${cleanTenant}
          `;

          const releaseTxId = `tx-bk-rel-${Date.now().toString().slice(-8)}`;
          await sql`
            INSERT INTO tenant_wallet_transactions (
              id, tenant_slug, tenant_id, type, amount, reference, description, channel, is_escrow, status, created_at
            ) VALUES (
              ${releaseTxId}, ${cleanTenant}, '', 'ESCROW_RELEASE', ${mAmount},
              ${bk.booking_number}, ${`Escrow released for service #${bk.booking_number} upon completion. Credited to available balance.`},
              'STOREFRONT_BOOKING', FALSE, 'SUCCESS', NOW()
            )
          `;
        } else {
          await sql`
            UPDATE shop_bookings
            SET status = ${newStatus},
                technician_id = COALESCE(${technicianId || null}, technician_id),
                technician_name = COALESCE(${technicianName || null}, technician_name),
                updated_at = NOW()
            WHERE (id = ${cleanRef} OR booking_number = ${cleanRef})
              AND LOWER(tenant_slug) = ${cleanTenant}
          `;
        }
      } else {
        await sql`
          UPDATE shop_bookings
          SET status = ${newStatus},
              technician_id = COALESCE(${technicianId || null}, technician_id),
              technician_name = COALESCE(${technicianName || null}, technician_name),
              updated_at = NOW()
          WHERE (id = ${cleanRef} OR booking_number = ${cleanRef})
            AND LOWER(tenant_slug) = ${cleanTenant}
        `;
      }
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
            return {
              ...b,
              status: newStatus,
              technicianId: technicianId || b.technicianId,
              technicianName: technicianName || b.technicianName,
            };
          }
          return b;
        });
        fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(updated, null, 2), "utf8");
      }
    }
  } catch {}

  return true;
}
