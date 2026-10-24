import { getTenantSql } from "./tenant-db-resolver";
import { StorefrontOrderPayload } from "@/types/storefront";

/**
 * Decrements live inventory in the tenant's dedicated database
 * upon successful storefront checkout.
 */
export async function decrementStorefrontInventory(
  order: StorefrontOrderPayload
): Promise<{ success: boolean; decrementedCount: number }> {
  if (!order || !order.tenantSlug) {
    return { success: false, decrementedCount: 0 };
  }

  const clean = order.tenantSlug.toLowerCase().trim();
  const sql = await getTenantSql(clean);
  const items = order.items || [];
  if (items.length === 0 || !sql) {
    return { success: true, decrementedCount: 0 };
  }

  let decrementedCount = 0;

  try {
    for (const itm of items) {
      const qty = Number(itm.quantity) || 1;
      const prodId = itm.productId || itm.id || "";
      const prodSku = (itm as any).sku || "";
      const title = (itm.title || itm.name || "").trim();

      const updated = await sql`
        UPDATE shop_inventory
        SET current_stock = GREATEST(0, current_stock - ${qty}),
            status = CASE
              WHEN GREATEST(0, current_stock - ${qty}) = 0 THEN 'OUT_OF_STOCK'
              WHEN GREATEST(0, current_stock - ${qty}) <= min_stock THEN 'LOW_STOCK'
              ELSE 'IN_STOCK'
            END,
            updated_at = NOW()
        WHERE LOWER(tenant_slug) = ${clean}
          AND (
            product_id = ${prodId}
            OR sku = ${prodSku}
            OR LOWER(product_name) = LOWER(${title})
            OR LOWER(product_name) LIKE LOWER(${`%${title}%`})
          )
        RETURNING id, current_stock, status;
      `;

      if (updated && updated.length > 0) {
        decrementedCount += qty;
      }
    }
  } catch (err: any) {
    console.warn(`[Storefront Inventory Decrement] Warning for tenant '${clean}':`, err.message);
  }

  return { success: true, decrementedCount };
}
