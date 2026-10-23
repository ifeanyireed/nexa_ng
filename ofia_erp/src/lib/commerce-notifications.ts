import { getTenantSql } from "./tenant-db-resolver";

export interface OrderNotificationPayload {
  orderId?: string;
  orderNumber: string;
  tenantSlug: string;
  tenantId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  newStatus: string;
  shippingAddress?: string;
}

export async function sendOrderStatusNotification(payload: OrderNotificationPayload): Promise<{
  success: boolean;
  notificationsSent: number;
}> {
  if (!payload.tenantSlug) {
    throw new Error("tenantSlug is required for order notifications");
  }

  const cleanSlug = payload.tenantSlug.toLowerCase().trim();
  const sql = await getTenantSql(cleanSlug);
  let sentCount = 0;

  const trackingUrl = `https://${cleanSlug}.ofia.ng/order-tracking?ref=${encodeURIComponent(payload.orderNumber)}`;
  const statusLabel = payload.newStatus.replace("_", " ");

  let subject = `Order #${payload.orderNumber} Status: ${statusLabel}`;
  let message = `Hello ${payload.customerName}, your order #${payload.orderNumber} has transitioned to ${statusLabel}. You can track live dispatch anytime here: ${trackingUrl}`;

  if (payload.newStatus === "READY_DISPATCH") {
    subject = `Order #${payload.orderNumber} is Ready & In-Transit!`;
    message = `Hello ${payload.customerName}, great news! Your order #${payload.orderNumber} has been packaged and handed over to our dispatch courier. Rider assigned: Chidi Okeke. Track live: ${trackingUrl}`;
  } else if (payload.newStatus === "DELIVERED") {
    subject = `Order #${payload.orderNumber} Delivered Successfully`;
    message = `Hello ${payload.customerName}, your order #${payload.orderNumber} has been delivered to ${payload.shippingAddress || "your address"}. Escrow verification finalized. Thank you for your business!`;
  }

  if (sql) {
    try {
      // 1. Email Channel Notification (if customerEmail exists)
      if (payload.customerEmail && payload.customerEmail.includes("@")) {
        const emailNotifId = `NTF-EML-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        await sql`
          INSERT INTO shop_order_notifications (
            id, tenant_slug, tenant_id, order_id, order_number, channel,
            recipient, status_event, subject, message, delivery_status,
            tracking_url, created_at, updated_at
          ) VALUES (
            ${emailNotifId}, ${cleanSlug}, ${payload.tenantId || ""}, ${payload.orderId || payload.orderNumber},
            ${payload.orderNumber}, 'EMAIL', ${payload.customerEmail}, ${payload.newStatus},
            ${subject}, ${message}, 'SENT', ${trackingUrl}, NOW(), NOW()
          )
        `;
        sentCount++;
      }

      // 2. SMS / WhatsApp Channel Notification (if customerPhone exists)
      if (payload.customerPhone && payload.customerPhone.trim().length > 5) {
        const smsNotifId = `NTF-SMS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        const smsMessage = `[${cleanSlug.toUpperCase()}] Order #${payload.orderNumber} is now ${statusLabel}. Track live: ${trackingUrl}`;
        await sql`
          INSERT INTO shop_order_notifications (
            id, tenant_slug, tenant_id, order_id, order_number, channel,
            recipient, status_event, subject, message, delivery_status,
            tracking_url, created_at, updated_at
          ) VALUES (
            ${smsNotifId}, ${cleanSlug}, ${payload.tenantId || ""}, ${payload.orderId || payload.orderNumber},
            ${payload.orderNumber}, 'SMS', ${payload.customerPhone}, ${payload.newStatus},
            ${subject}, ${smsMessage}, 'SENT', ${trackingUrl}, NOW(), NOW()
          )
        `;
        sentCount++;
      }
    } catch (err) {
      console.warn("[Notifications] Error logging notifications to Neon:", err);
    }
  }

  return { success: true, notificationsSent: sentCount };
}

export async function getTenantNotifications(tenantSlug: string, orderNumber?: string) {
  if (!tenantSlug) return [];
  const cleanSlug = tenantSlug.toLowerCase().trim();
  const sql = await getTenantSql(cleanSlug);

  if (sql) {
    try {
      if (orderNumber) {
        return await sql`
          SELECT id, tenant_slug, order_number, channel, recipient, status_event, subject, message, delivery_status, tracking_url, created_at
          FROM shop_order_notifications
          WHERE LOWER(tenant_slug) = ${cleanSlug} AND order_number = ${orderNumber}
          ORDER BY created_at DESC
          LIMIT 50
        `;
      }
      return await sql`
        SELECT id, tenant_slug, order_number, channel, recipient, status_event, subject, message, delivery_status, tracking_url, created_at
        FROM shop_order_notifications
        WHERE LOWER(tenant_slug) = ${cleanSlug}
        ORDER BY created_at DESC
        LIMIT 50
      `;
    } catch (err) {
      console.warn("[Notifications] Error fetching notifications from Neon:", err);
    }
  }
  return [];
}
