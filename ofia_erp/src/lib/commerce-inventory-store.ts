import fs from "fs";
import path from "path";
import { getTenantSql } from "./tenant-db-resolver";

export interface ShopInventoryItem {
  id: string;
  tenantSlug: string;
  tenantId?: string;
  productId: string;
  sku: string;
  productName: string;
  category: string;
  warehouse: string;
  currentStock: number;
  minStock: number;
  unitCost: number;
  unitPrice: number;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  supplier: string;
  updatedAt: string;
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
const INVENTORY_FILE = path.join(SYNC_DIR, "inventory.json");

let memoryInventory: ShopInventoryItem[] = [];

function ensureInventoryFileReady() {
  try {
    if (!fs.existsSync(SYNC_DIR)) {
      fs.mkdirSync(SYNC_DIR, { recursive: true });
    }
  } catch {}
}

function mapRowToInventory(r: any): ShopInventoryItem {
  return {
    id: r.id,
    tenantSlug: r.tenant_slug,
    tenantId: r.tenant_id || "",
    productId: r.product_id,
    sku: r.sku,
    productName: r.product_name,
    category: r.category || "General",
    warehouse: r.warehouse || "Ikeja Central Depot",
    currentStock: Number(r.current_stock) || 0,
    minStock: Number(r.min_stock) || 3,
    unitCost: Number(r.unit_cost) || 0,
    unitPrice: Number(r.unit_price) || 0,
    status: r.status || "IN_STOCK",
    supplier: r.supplier || "Supplier",
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
  };
}

export async function getTenantInventory(tenantSlug: string): Promise<ShopInventoryItem[]> {
  if (!tenantSlug) return [];
  ensureInventoryFileReady();
  const clean = tenantSlug.toLowerCase().trim();
  const sql = await getTenantSql(clean);

  // 1. Query Neon PostgreSQL
  if (sql) {
    try {
      const rows = await sql`
        SELECT id, tenant_slug, COALESCE(tenant_id, '') as tenant_id, product_id, sku,
               product_name, category, warehouse, current_stock, min_stock,
               unit_cost, unit_price, status, supplier, updated_at
        FROM shop_inventory
        WHERE LOWER(tenant_slug) = ${clean}
        ORDER BY status = 'OUT_OF_STOCK' DESC, status = 'LOW_STOCK' DESC, product_name ASC
      `;

      if (rows && rows.length > 0) {
        const items = rows.map(mapRowToInventory);
        try {
          fs.writeFileSync(INVENTORY_FILE, JSON.stringify(items, null, 2), "utf8");
        } catch {}
        return items;
      }
    } catch (err) {
      console.warn("[Inventory Store] Neon query failed:", err);
    }
  }

  // 2. Fallback to cache file
  try {
    if (fs.existsSync(INVENTORY_FILE)) {
      const data = JSON.parse(fs.readFileSync(INVENTORY_FILE, "utf8"));
      if (Array.isArray(data)) {
        return data.filter((i) => i.tenantSlug?.toLowerCase() === clean);
      }
    }
  } catch {}

  return memoryInventory.filter((i) => i.tenantSlug?.toLowerCase() === clean);
}

export async function getLowStockAlerts(tenantSlug: string): Promise<ShopInventoryItem[]> {
  if (!tenantSlug) return [];
  const all = await getTenantInventory(tenantSlug);
  return all.filter((i) => i.currentStock <= i.minStock || i.status === "LOW_STOCK" || i.status === "OUT_OF_STOCK");
}

export async function decrementInventoryForOrder(order: {
  tenantSlug: string;
  items?: Array<{ id?: string; productId?: string; sku?: string; title?: string; name?: string; quantity?: number }>;
}): Promise<{ success: boolean; decremented: number; triggeredLowStock: ShopInventoryItem[] }> {
  if (!order || !order.tenantSlug) {
    return { success: false, decremented: 0, triggeredLowStock: [] };
  }
  ensureInventoryFileReady();
  const clean = order.tenantSlug.toLowerCase().trim();
  const sql = await getTenantSql(clean);
  const items = order.items || [];
  if (items.length === 0) return { success: true, decremented: 0, triggeredLowStock: [] };

  const triggeredLowStock: ShopInventoryItem[] = [];
  let decrementedCount = 0;

  if (sql) {
    try {
      for (const itm of items) {
        const qty = Number(itm.quantity) || 1;
        const prodId = itm.productId || itm.id || "";
        const prodSku = itm.sku || "";
        const title = (itm.title || itm.name || "").trim();

        // Match by product_id, sku, or partial product_name
        const updatedRows = await sql`
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
          RETURNING id, tenant_slug, COALESCE(tenant_id, '') as tenant_id, product_id, sku, product_name, category, warehouse,
                    current_stock, min_stock, unit_cost, unit_price, status, supplier, updated_at
        `;

        if (updatedRows && updatedRows.length > 0) {
          decrementedCount += qty;
          for (const row of updatedRows) {
            const item = mapRowToInventory(row);
            if (item.currentStock <= item.minStock) {
              triggeredLowStock.push(item);
            }
          }
        }
      }
    } catch (err) {
      console.warn("[Inventory Store] Neon decrement inventory warning:", err);
    }
  }

  return { success: true, decremented: decrementedCount, triggeredLowStock };
}

export async function restockInventoryItem(
  skuOrId: string,
  tenantSlug: string,
  restockQty: number = 10
): Promise<ShopInventoryItem | null> {
  if (!skuOrId || !tenantSlug) return null;
  ensureInventoryFileReady();
  const clean = tenantSlug.toLowerCase().trim();
  const sql = await getTenantSql(clean);
  const cleanKey = skuOrId.trim();

  if (sql) {
    try {
      const rows = await sql`
        UPDATE shop_inventory
        SET current_stock = current_stock + ${restockQty},
            status = CASE
              WHEN (current_stock + ${restockQty}) <= min_stock THEN 'LOW_STOCK'
              ELSE 'IN_STOCK'
            END,
            updated_at = NOW()
        WHERE LOWER(tenant_slug) = ${clean}
          AND (sku = ${cleanKey} OR id = ${cleanKey} OR product_id = ${cleanKey})
        RETURNING id, tenant_slug, COALESCE(tenant_id, '') as tenant_id, product_id, sku, product_name, category, warehouse,
                  current_stock, min_stock, unit_cost, unit_price, status, supplier, updated_at
      `;

      if (rows && rows.length > 0) {
        return mapRowToInventory(rows[0]);
      }
    } catch (err) {
      console.warn("[Inventory Store] Neon restock item warning:", err);
    }
  }

  return null;
}
