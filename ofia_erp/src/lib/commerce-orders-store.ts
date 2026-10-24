import fs from "fs";
import path from "path";
import { CommerceOrderItem, CommerceBookingItem } from "./verticals";
import { decrementInventoryForOrder } from "./commerce-inventory-store";
import { sendOrderStatusNotification } from "./commerce-notifications";
import { publishCommerceEvent } from "./commerce-event-hub";
import { getTenantSql } from "./tenant-db-resolver";

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

// Fallback Seed Lists (strictly dynamic - zero hardcoded tenant data)
const SEED_ORDERS: CommerceOrderItem[] = [];
const SEED_BOOKINGS: CommerceBookingItem[] = [];

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
  if (!tenantSlug) return [];
  ensureStorageReady();
  const clean = tenantSlug.toLowerCase().trim();
  const sql = await getTenantSql(clean);

  // 1. Query Neon PostgreSQL database
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
        const pgOrders: CommerceOrderItem[] = rows.map((r: any) => ({
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
          isEscrow: Boolean(r.is_escrow),
          escrowStatus: r.escrow_status || (r.is_escrow ? "HELD" : "NONE"),
          settlementStatus: r.settlement_status || (r.is_escrow ? "HELD_ESCROW" : "AVAILABLE"),
          merchantAmount: Number(r.merchant_amount) || 0,
          platformFee: Number(r.platform_fee) || 0,
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
      allOrders = Array.isArray(parsed) && parsed.length > 0 ? parsed : [];
    } else {
      allOrders = memoryOrders.length > 0 ? memoryOrders : [];
    }
  } catch {
    allOrders = memoryOrders.length > 0 ? memoryOrders : [];
  }

  return allOrders.filter(
    (o) => (o.tenantSlug || "").toLowerCase().trim() === clean
  );
}

export async function saveErpOrder(order: Partial<CommerceOrderItem>): Promise<CommerceOrderItem> {
  ensureStorageReady();
  if (!order.tenantSlug) {
    throw new Error("tenantSlug is required for saving orders");
  }
  const slug = order.tenantSlug.toLowerCase().trim();
  const sql = await getTenantSql(slug);
  const orderId = order.id || `ORD-${Date.now().toString().slice(-6)}`;
  const orderNum = order.orderNumber || `OFIA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const rawAmount = Number(order.rawAmount) || 0;
  const platformFee = order.platformFee ?? Math.round(rawAmount * 0.015 * 100) / 100; // 1.5% commission
  const merchantAmount = order.merchantAmount ?? Math.max(0, rawAmount - platformFee); // 98.5% split
  const isEscrow = Boolean(order.isEscrow);
  const escrowStatus = isEscrow ? "HELD" : "NONE";
  const settlementStatus = isEscrow ? "HELD_ESCROW" : "AVAILABLE";

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
    rawAmount: rawAmount,
    isEscrow: isEscrow,
    escrowStatus: escrowStatus,
    settlementStatus: settlementStatus,
    merchantAmount: merchantAmount,
    platformFee: platformFee,
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
          total_amount, raw_amount, is_escrow, escrow_status, settlement_status,
          merchant_amount, platform_fee, notes, items, created_at, updated_at
        ) VALUES (
          ${newOrder.id}, ${newOrder.orderNumber}, ${newOrder.tenantSlug}, ${newOrder.tenantId},
          ${newOrder.customerName}, ${newOrder.customerEmail}, ${newOrder.customerPhone},
          ${newOrder.channel}, ${newOrder.status}, ${newOrder.paymentStatus}, ${newOrder.deliveryMethod},
          ${newOrder.shippingAddress}, ${newOrder.city || "Lagos"}, ${newOrder.paymentMethod || "card"},
          ${newOrder.itemsSummary}, ${newOrder.itemCount}, ${newOrder.totalAmount}, ${rawAmount},
          ${isEscrow}, ${escrowStatus}, ${settlementStatus}, ${merchantAmount}, ${platformFee},
          ${newOrder.notes}, ${JSON.stringify(newOrder.items || [])}::jsonb, NOW(), NOW()
        )
        ON CONFLICT (tenant_slug, order_number) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = NOW()
      `;

      // 1b. Multi-Tenant Wallet Credit & Split Execution
      if (rawAmount > 0) {
        const walletId = `wal-${slug}`;
        const txId = `tx-${Date.now().toString().slice(-8)}`;

        if (isEscrow) {
          // Escrow: Lock funds into escrow_balance pending delivery OTP confirmation
          await sql`
            INSERT INTO tenant_wallets (
              id, tenant_slug, tenant_id, available_balance, escrow_balance, total_withdrawn, currency, created_at, updated_at
            ) VALUES (
              ${walletId}, ${slug}, ${newOrder.tenantId || ""}, 0, ${merchantAmount}, 0, 'NGN', NOW(), NOW()
            )
            ON CONFLICT (tenant_slug) DO UPDATE SET
              escrow_balance = tenant_wallets.escrow_balance + ${merchantAmount},
              updated_at = NOW()
          `;

          await sql`
            INSERT INTO tenant_wallet_transactions (
              id, tenant_slug, tenant_id, type, amount, reference, description, channel, is_escrow, status, created_at
            ) VALUES (
              ${txId}, ${slug}, ${newOrder.tenantId || ""}, 'ESCROW_HOLD', ${merchantAmount},
              ${newOrder.orderNumber}, ${`Order #${newOrder.orderNumber} placed into Ofia Escrow Vault pending delivery confirmation.`},
              ${newOrder.channel || "STOREFRONT"}, TRUE, 'SUCCESS', NOW()
            )
          `;
        } else {
          // Default Direct Settlement: Instant automated 98.5% split into available_balance for immediate withdrawal
          await sql`
            INSERT INTO tenant_wallets (
              id, tenant_slug, tenant_id, available_balance, escrow_balance, total_withdrawn, currency, created_at, updated_at
            ) VALUES (
              ${walletId}, ${slug}, ${newOrder.tenantId || ""}, ${merchantAmount}, 0, 0, 'NGN', NOW(), NOW()
            )
            ON CONFLICT (tenant_slug) DO UPDATE SET
              available_balance = tenant_wallets.available_balance + ${merchantAmount},
              updated_at = NOW()
          `;

          await sql`
            INSERT INTO tenant_wallet_transactions (
              id, tenant_slug, tenant_id, type, amount, reference, description, channel, is_escrow, status, created_at
            ) VALUES (
              ${txId}, ${slug}, ${newOrder.tenantId || ""}, 'SALE_CREDIT', ${merchantAmount},
              ${newOrder.orderNumber}, ${`Direct split settlement (98.5%) for order #${newOrder.orderNumber}. Available for immediate withdrawal.`},
              ${newOrder.channel || "STOREFRONT"}, FALSE, 'SUCCESS', NOW()
            )
          `;
        }
      }

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

  // Publish real-time SSE commerce event
  try {
    publishCommerceEvent(slug, { type: "ORDER_CREATED", data: newOrder });
  } catch {}

  return newOrder;
}

export async function updateErpOrderStatus(
  orderIdOrNum: string,
  newStatus: CommerceOrderItem["status"],
  tenantSlug?: string
): Promise<boolean> {
  if (!tenantSlug) {
    throw new Error("tenantSlug is required for multi-tenant isolation");
  }
  ensureStorageReady();
  const cleanTenant = tenantSlug.toLowerCase().trim();
  const sql = await getTenantSql(cleanTenant);
  let matchedOrder: any = null;

  // 1. Update Neon PostgreSQL & dispatch customer notification
  if (sql) {
    try {
      const rows = await sql`
        SELECT id, order_number, tenant_slug, tenant_id, customer_name, customer_email,
               customer_phone, shipping_address, raw_amount, merchant_amount, is_escrow, escrow_status
        FROM shop_orders
        WHERE (id = ${orderIdOrNum} OR order_number = ${orderIdOrNum})
          AND LOWER(tenant_slug) = ${cleanTenant}
        LIMIT 1
      `;
      if (rows && rows.length > 0) matchedOrder = rows[0];

      if (newStatus === "DELIVERED" && matchedOrder?.is_escrow && matchedOrder?.escrow_status === "HELD") {
        const mAmount = Number(matchedOrder.merchant_amount) || Math.max(0, Number(matchedOrder.raw_amount) * 0.985);

        // Escrow Release upon delivery
        await sql`
          UPDATE shop_orders
          SET status = 'DELIVERED',
              escrow_status = 'RELEASED',
              settlement_status = 'AVAILABLE',
              updated_at = NOW()
          WHERE (id = ${orderIdOrNum} OR order_number = ${orderIdOrNum})
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
            ${releaseTxId}, ${cleanTenant}, ${matchedOrder.tenant_id || ""}, 'ESCROW_RELEASE', ${mAmount},
            ${matchedOrder.order_number}, ${`Escrow payout released for order #${matchedOrder.order_number} upon delivery verification. Credited to available balance.`},
            'STOREFRONT', FALSE, 'SUCCESS', NOW()
          )
        `;
      } else {
        await sql`
          UPDATE shop_orders
          SET status = ${newStatus}, updated_at = NOW()
          WHERE (id = ${orderIdOrNum} OR order_number = ${orderIdOrNum})
            AND LOWER(tenant_slug) = ${cleanTenant}
        `;
      }

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
  const current = await getErpOrders(cleanTenant);
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

  const eventSlug = matchedOrder?.tenant_slug || cleanTenant;
  if (eventSlug) {
    try {
      publishCommerceEvent(eventSlug, {
        type: "ORDER_STATUS_CHANGED",
        data: { id: orderIdOrNum, status: newStatus },
      });
    } catch {}
  }

  return found;
}

export async function getErpBookings(tenantSlug?: string): Promise<CommerceBookingItem[]> {
  if (!tenantSlug) return [];
  ensureStorageReady();
  const clean = tenantSlug.toLowerCase().trim();
  const sql = await getTenantSql(clean);

  // 1. Query Neon PostgreSQL database
  if (sql) {
    try {
      const rows = await sql`
        SELECT id, booking_number, tenant_slug, COALESCE(tenant_id, '') as tenant_id,
               customer_name, COALESCE(customer_email, '') as customer_email,
               customer_phone,
               COALESCE(service_title, service_name, 'Service Appointment') as service_title,
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
        const pgBookings: CommerceBookingItem[] = rows.map((r: any) => ({
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
          amount: r.amount,
          technicianId: r.technician_id || undefined,
          technicianName: r.technician_name || undefined,
          createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently",
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
      allBookings = Array.isArray(parsed) && parsed.length > 0 ? parsed : [];
    } else {
      allBookings = memoryBookings.length > 0 ? memoryBookings : [];
    }
  } catch {
    allBookings = memoryBookings.length > 0 ? memoryBookings : [];
  }

  return allBookings.filter(
    (b) => (b.tenantSlug || "").toLowerCase().trim() === clean
  );
}

export async function saveErpBooking(booking: Partial<CommerceBookingItem>): Promise<CommerceBookingItem> {
  ensureStorageReady();
  if (!booking.tenantSlug) {
    throw new Error("tenantSlug is required for saving bookings");
  }
  const slug = booking.tenantSlug.toLowerCase().trim();
  const sql = await getTenantSql(slug);
  const bookingId = booking.id || `BK-${Date.now().toString().slice(-6)}`;
  const bookingNum = booking.bookingNumber || `TD-${Math.floor(10000 + Math.random() * 90000)}`;

  const rawAmount = typeof booking.amount === "number" ? booking.amount : (booking.amount ? parseFloat(String(booking.amount).replace(/[^0-9.]/g, "")) || 0 : 0);
  const isEscrow = Boolean(booking.isEscrow);
  const platformFee = Math.round(rawAmount * 0.015 * 100) / 100;
  const merchantAmount = Math.max(0, rawAmount - platformFee);
  const escrowStatus = isEscrow ? "HELD" : "NONE";
  const settlementStatus = isEscrow ? "HELD_ESCROW" : "AVAILABLE";

  const newBooking: CommerceBookingItem = {
    id: bookingId,
    bookingNumber: bookingNum,
    tenantSlug: slug,
    tenantId: booking.tenantId || `org-${slug}`,
    customerName: booking.customerName || "Customer",
    customerEmail: booking.customerEmail || "",
    customerPhone: booking.customerPhone || "",
    serviceTitle: booking.serviceTitle || "Service Appointment",
    dateTime: booking.dateTime || "Tomorrow at 10:00 AM",
    status: booking.status || "PENDING",
    notes: booking.notes || "",
    vertical: booking.vertical || "cars",
    amount: booking.amount || (rawAmount > 0 ? `₦${rawAmount.toLocaleString()}` : "₦0"),
    technicianId: booking.technicianId || "",
    technicianName: booking.technicianName || "",
    createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
  };

  // 1. Save to Neon PostgreSQL
  if (sql) {
    try {
      await sql`
        INSERT INTO shop_bookings (
          id, booking_number, tenant_slug, tenant_id, service_id, service_name,
          customer_name, customer_email, customer_phone, service_title, date_time,
          slot_date, slot_time, total_amount, raw_amount, status, payment_status,
          vertical, notes, technician_id, technician_name, is_escrow, escrow_status,
          settlement_status, merchant_amount, platform_fee, created_at, updated_at
        ) VALUES (
          ${newBooking.id}, ${bookingNum}, ${slug}, ${newBooking.tenantId || ""},
          ${newBooking.id}, ${newBooking.serviceTitle},
          ${newBooking.customerName}, ${newBooking.customerEmail}, ${newBooking.customerPhone},
          ${newBooking.serviceTitle}, ${newBooking.dateTime},
          ${newBooking.dateTime}, 'Morning Slot', ${newBooking.amount || "₦0"}, ${rawAmount},
          ${newBooking.status}, 'PAID', ${newBooking.vertical}, ${newBooking.notes},
          ${newBooking.technicianId || null}, ${newBooking.technicianName || null},
          ${isEscrow}, ${escrowStatus}, ${settlementStatus}, ${merchantAmount}, ${platformFee},
          NOW(), NOW()
        )
        ON CONFLICT (tenant_slug, booking_number) DO UPDATE SET
          status = EXCLUDED.status,
          technician_id = COALESCE(EXCLUDED.technician_id, shop_bookings.technician_id),
          technician_name = COALESCE(EXCLUDED.technician_name, shop_bookings.technician_name),
          updated_at = NOW()
      `;

      // 1b. Update tenant wallet
      if (rawAmount > 0) {
        const walletId = `wal-${slug}`;
        const txId = `tx-bk-${Date.now().toString().slice(-8)}`;

        if (isEscrow) {
          await sql`
            INSERT INTO tenant_wallets (
              id, tenant_slug, tenant_id, available_balance, escrow_balance, total_withdrawn, currency, created_at, updated_at
            ) VALUES (
              ${walletId}, ${slug}, ${newBooking.tenantId || ""}, 0, ${merchantAmount}, 0, 'NGN', NOW(), NOW()
            )
            ON CONFLICT (tenant_slug) DO UPDATE SET
              escrow_balance = tenant_wallets.escrow_balance + ${merchantAmount},
              updated_at = NOW()
          `;

          await sql`
            INSERT INTO tenant_wallet_transactions (
              id, tenant_slug, tenant_id, type, amount, reference, description, channel, is_escrow, status, created_at
            ) VALUES (
              ${txId}, ${slug}, ${newBooking.tenantId || ""}, 'ESCROW_HOLD', ${merchantAmount},
              ${bookingNum}, ${`Service booking #${bookingNum} (${newBooking.serviceTitle}) held in Escrow pending service completion.`},
              'SERVICE_BOOKING', TRUE, 'SUCCESS', NOW()
            )
          `;
        } else {
          await sql`
            INSERT INTO tenant_wallets (
              id, tenant_slug, tenant_id, available_balance, escrow_balance, total_withdrawn, currency, created_at, updated_at
            ) VALUES (
              ${walletId}, ${slug}, ${newBooking.tenantId || ""}, ${merchantAmount}, 0, 0, 'NGN', NOW(), NOW()
            )
            ON CONFLICT (tenant_slug) DO UPDATE SET
              available_balance = tenant_wallets.available_balance + ${merchantAmount},
              updated_at = NOW()
          `;

          await sql`
            INSERT INTO tenant_wallet_transactions (
              id, tenant_slug, tenant_id, type, amount, reference, description, channel, is_escrow, status, created_at
            ) VALUES (
              ${txId}, ${slug}, ${newBooking.tenantId || ""}, 'SALE_CREDIT', ${merchantAmount},
              ${bookingNum}, ${`Direct split settlement (98.5%) for service #${bookingNum}. Available for immediate withdrawal.`},
              'SERVICE_BOOKING', FALSE, 'SUCCESS', NOW()
            )
          `;
        }
      }
    } catch (err) {
      console.warn("[Commerce Store] Neon saveBooking failed:", err);
    }
  }

  // 2. Save to local sync file
  const current = await getErpBookings(slug);
  const filtered = current.filter((b) => b.id !== newBooking.id && b.bookingNumber !== newBooking.bookingNumber);
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
  newStatus: CommerceBookingItem["status"],
  tenantSlug: string,
  technicianId?: string,
  technicianName?: string
): Promise<boolean> {
  if (!tenantSlug) {
    throw new Error("tenantSlug is required for multi-tenant isolation");
  }
  ensureStorageReady();
  const cleanSlug = tenantSlug.toLowerCase().trim();
  const sql = await getTenantSql(cleanSlug);

  // 1. Update Neon PostgreSQL
  if (sql) {
    try {
      if (newStatus === "COMPLETED") {
        const rows = await sql`
          SELECT id, booking_number, raw_amount, merchant_amount, is_escrow, escrow_status
          FROM shop_bookings
          WHERE (id = ${bookingIdOrNum} OR booking_number = ${bookingIdOrNum})
            AND LOWER(tenant_slug) = ${cleanSlug}
          LIMIT 1
        `;

        if (rows.length > 0 && rows[0].is_escrow && rows[0].escrow_status === "HELD") {
          const bk = rows[0];
          const mAmount = Number(bk.merchant_amount) || Math.max(0, Number(bk.raw_amount) * 0.985);

          await sql`
            UPDATE shop_bookings
            SET status = 'COMPLETED',
                escrow_status = 'RELEASED',
                settlement_status = 'AVAILABLE',
                technician_id = COALESCE(${technicianId || null}, technician_id),
                technician_name = COALESCE(${technicianName || null}, technician_name),
                updated_at = NOW()
            WHERE (id = ${bookingIdOrNum} OR booking_number = ${bookingIdOrNum})
              AND LOWER(tenant_slug) = ${cleanSlug}
          `;

          await sql`
            UPDATE tenant_wallets
            SET escrow_balance = GREATEST(0, escrow_balance - ${mAmount}),
                available_balance = available_balance + ${mAmount},
                updated_at = NOW()
            WHERE LOWER(tenant_slug) = ${cleanSlug}
          `;

          const releaseTxId = `tx-bk-rel-${Date.now().toString().slice(-8)}`;
          await sql`
            INSERT INTO tenant_wallet_transactions (
              id, tenant_slug, tenant_id, type, amount, reference, description, channel, is_escrow, status, created_at
            ) VALUES (
              ${releaseTxId}, ${cleanSlug}, '', 'ESCROW_RELEASE', ${mAmount},
              ${bk.booking_number}, ${`Escrow payout released for service #${bk.booking_number} upon completion. Credited to available balance.`},
              'SERVICE_BOOKING', FALSE, 'SUCCESS', NOW()
            )
          `;
        } else {
          await sql`
            UPDATE shop_bookings
            SET status = ${newStatus},
                technician_id = COALESCE(${technicianId || null}, technician_id),
                technician_name = COALESCE(${technicianName || null}, technician_name),
                updated_at = NOW()
            WHERE (id = ${bookingIdOrNum} OR booking_number = ${bookingIdOrNum})
              AND LOWER(tenant_slug) = ${cleanSlug}
          `;
        }
      } else {
        await sql`
          UPDATE shop_bookings
          SET status = ${newStatus},
              technician_id = COALESCE(${technicianId || null}, technician_id),
              technician_name = COALESCE(${technicianName || null}, technician_name),
              updated_at = NOW()
          WHERE (id = ${bookingIdOrNum} OR booking_number = ${bookingIdOrNum})
            AND LOWER(tenant_slug) = ${cleanSlug}
        `;
      }
    } catch (err) {
      console.warn("[Commerce Store] Neon booking status update failed:", err);
    }
  }

  // 2. Update local sync file
  const current = await getErpBookings(cleanSlug);
  let found = false;

  const updated = current.map((b) => {
    if (b.id === bookingIdOrNum || b.bookingNumber === bookingIdOrNum) {
      found = true;
      return {
        ...b,
        status: newStatus,
        technicianId: technicianId || b.technicianId,
        technicianName: technicianName || b.technicianName,
      };
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
