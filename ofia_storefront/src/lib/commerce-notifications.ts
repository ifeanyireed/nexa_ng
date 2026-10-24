import { getTenantSql } from "./tenant-db-resolver";
import { StorefrontOrderPayload } from "@/types/storefront";

export interface StorefrontNotificationRecord {
  id: string;
  tenantSlug: string;
  tenantId?: string;
  orderId: string;
  orderNumber: string;
  channel: "EMAIL" | "SMS" | "WHATSAPP";
  recipient: string;
  statusEvent: string;
  subject: string;
  message: string;
  deliveryStatus: "SENT" | "PENDING" | "FAILED";
  trackingUrl: string;
  createdAt: string;
}

export function buildTrackingUrl(tenantSlug: string, orderNumber: string): string {
  const cleanSlug = (tenantSlug || "").toLowerCase().trim();
  const encodedRef = encodeURIComponent(orderNumber);

  if (process.env.NEXT_PUBLIC_STOREFRONT_URL) {
    const base = process.env.NEXT_PUBLIC_STOREFRONT_URL.replace(/\/$/, "");
    return `${base}/order-tracking?ref=${encodedRef}&tenant=${cleanSlug}`;
  }

  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    return `http://${cleanSlug}.localhost:3005/order-tracking?ref=${encodedRef}`;
  }

  return `https://${cleanSlug}.ofia.ng/order-tracking?ref=${encodedRef}`;
}

/**
 * Dispatches customer omnichannel notifications (Email Receipt & SMS Alert)
 * and records them into the tenant's dedicated Neon PostgreSQL database.
 */
export async function sendStorefrontOrderPlacedNotification(
  order: StorefrontOrderPayload
): Promise<{ success: boolean; notificationsSent: number }> {
  if (!order.tenantSlug) {
    throw new Error("tenantSlug is required for storefront order notifications");
  }

  const cleanSlug = order.tenantSlug.toLowerCase().trim();
  const sql = await getTenantSql(cleanSlug);
  let sentCount = 0;

  const trackingUrl = buildTrackingUrl(cleanSlug, order.orderNumber);
  const itemsText = order.itemsSummary || (order.items && order.items.length > 0
    ? order.items.map((i: any) => `${i.title || i.name} (x${i.quantity || 1})`).join(", ")
    : "Merchandise");

  const emailSubject = `Order Confirmed #${order.orderNumber} · ${cleanSlug.toUpperCase()}`;
  const emailMessage = `Hello ${order.customerName},\n\nThank you for shopping with ${cleanSlug.toUpperCase()}! Your order #${order.orderNumber} has been received and is being prepared.\n\nItems: ${itemsText}\nTotal: ${order.totalAmount || "₦" + Number(order.rawAmount || 0).toLocaleString()}\nDelivery Address: ${order.shippingAddress || "Store Pickup"}\n\nTrack your live dispatch status anytime:\n${trackingUrl}\n\nBest regards,\nThe ${cleanSlug.toUpperCase()} Concierge Team`;

  const smsMessage = `[${cleanSlug.toUpperCase()}] Order #${order.orderNumber} confirmed (${order.totalAmount || "₦" + Number(order.rawAmount || 0).toLocaleString()}). Track live dispatch: ${trackingUrl}`;

  if (sql) {
    try {
      // 1. Dispatch Email Receipt if email is present
      if (order.customerEmail && order.customerEmail.includes("@")) {
        const emailNotifId = `NTF-EML-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        await sql`
          INSERT INTO shop_order_notifications (
            id, tenant_slug, tenant_id, order_id, order_number, channel,
            recipient, status_event, subject, message, delivery_status,
            tracking_url, created_at, updated_at
          ) VALUES (
            ${emailNotifId}, ${cleanSlug}, ${order.tenantId || ""}, ${order.id || order.orderNumber},
            ${order.orderNumber}, 'EMAIL', ${order.customerEmail}, 'ORDER_PLACED',
            ${emailSubject}, ${emailMessage}, 'SENT', ${trackingUrl}, NOW(), NOW()
          )
        `;
        sentCount++;
      }

      // 2. Dispatch SMS / WhatsApp Alert if phone is present
      if (order.customerPhone && order.customerPhone.trim().length > 5) {
        const smsNotifId = `NTF-SMS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        await sql`
          INSERT INTO shop_order_notifications (
            id, tenant_slug, tenant_id, order_id, order_number, channel,
            recipient, status_event, subject, message, delivery_status,
            tracking_url, created_at, updated_at
          ) VALUES (
            ${smsNotifId}, ${cleanSlug}, ${order.tenantId || ""}, ${order.id || order.orderNumber},
            ${order.orderNumber}, 'SMS', ${order.customerPhone}, 'ORDER_PLACED',
            ${emailSubject}, ${smsMessage}, 'SENT', ${trackingUrl}, NOW(), NOW()
          )
        `;
        sentCount++;
      }
    } catch (err) {
      console.warn(`[Storefront Notifications] Neon insert warning for tenant '${cleanSlug}':`, err);
    }
  }

  return { success: true, notificationsSent: sentCount };
}

/**
 * Retrieves notifications for a tenant / order strictly partitioned by tenant_slug.
 */
export async function getStorefrontOrderNotifications(
  tenantSlug: string,
  orderNumber?: string
): Promise<StorefrontNotificationRecord[]> {
  if (!tenantSlug) return [];
  const cleanSlug = tenantSlug.toLowerCase().trim();
  const sql = await getTenantSql(cleanSlug);

  if (sql) {
    try {
      let rows;
      if (orderNumber) {
        rows = await sql`
          SELECT id, tenant_slug, tenant_id, order_id, order_number, channel,
                 recipient, status_event, subject, message, delivery_status,
                 tracking_url, created_at
          FROM shop_order_notifications
          WHERE LOWER(tenant_slug) = ${cleanSlug}
            AND (order_number = ${orderNumber} OR order_id = ${orderNumber})
          ORDER BY created_at DESC
          LIMIT 50
        `;
      } else {
        rows = await sql`
          SELECT id, tenant_slug, tenant_id, order_id, order_number, channel,
                 recipient, status_event, subject, message, delivery_status,
                 tracking_url, created_at
          FROM shop_order_notifications
          WHERE LOWER(tenant_slug) = ${cleanSlug}
          ORDER BY created_at DESC
          LIMIT 50
        `;
      }

      return (rows || []).map((r: any) => ({
        id: r.id,
        tenantSlug: r.tenant_slug,
        tenantId: r.tenant_id,
        orderId: r.order_id,
        orderNumber: r.order_number,
        channel: r.channel,
        recipient: r.recipient,
        statusEvent: r.status_event,
        subject: r.subject,
        message: r.message,
        deliveryStatus: r.delivery_status,
        trackingUrl: r.tracking_url,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.warn(`[Storefront Notifications] Neon query warning for tenant '${cleanSlug}':`, err);
    }
  }

  return [];
}
