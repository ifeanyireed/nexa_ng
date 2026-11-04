import fs from "fs";
import path from "path";
import { CommerceServiceItem, VerticalKey, getDefaultServicesForVertical, VERTICAL_DEFINITIONS } from "./verticals";
import { getTenantSql } from "./tenant-db-resolver";
import { publishCommerceEvent } from "./commerce-event-hub";

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
const SERVICES_FILE = path.join(SYNC_DIR, "services.json");

let memoryServices: CommerceServiceItem[] = [];

// Helper to seed services for all verticals on first run
function getInitialSeedServices(): CommerceServiceItem[] {
  const seed: CommerceServiceItem[] = [];
  const allKeys = Object.keys(VERTICAL_DEFINITIONS) as VerticalKey[];
  for (const key of allKeys) {
    const defaultList = getDefaultServicesForVertical(key);
    for (const item of defaultList) {
      seed.push({
        ...item,
        tenantSlug: "neweratransports",
      } as any);
    }
  }
  return seed;
}

function ensureStorageReady() {
  try {
    if (!fs.existsSync(SYNC_DIR)) {
      fs.mkdirSync(SYNC_DIR, { recursive: true });
    }
    if (!fs.existsSync(SERVICES_FILE)) {
      const initial = getInitialSeedServices();
      fs.writeFileSync(SERVICES_FILE, JSON.stringify(initial, null, 2), "utf8");
      memoryServices = initial;
    }
  } catch (err) {
    if (memoryServices.length === 0) {
      memoryServices = getInitialSeedServices();
    }
  }
}

export async function getErpServices(tenantSlug?: string, vertical?: VerticalKey): Promise<CommerceServiceItem[]> {
  ensureStorageReady();
  const cleanSlug = (tenantSlug || "neweratransports").toLowerCase().trim();
  const sql = await getTenantSql(cleanSlug);

  // 1. Direct query in dedicated Neon PostgreSQL database
  if (sql) {
    try {
      let queryResult: any[] = [];
      if (vertical) {
        queryResult = await sql`
          SELECT id, service_code, tenant_slug, COALESCE(tenant_id, '') as tenant_id,
                 vertical, title, COALESCE(category, 'General') as category,
                 COALESCE(description, '') as description, price,
                 COALESCE(currency, '₦') as currency,
                 duration_minutes, COALESCE(provider_name, '') as provider_name,
                 COALESCE(provider_role, '') as provider_role,
                 COALESCE(status, 'ACTIVE') as status,
                 COALESCE(is_bookable, TRUE) as is_bookable,
                 COALESCE(attributes, '{}'::jsonb) as attributes,
                 created_at, updated_at
          FROM shop_services
          WHERE LOWER(tenant_slug) = ${cleanSlug}
            AND vertical = ${vertical}
          ORDER BY created_at DESC;
        `;
      } else {
        queryResult = await sql`
          SELECT id, service_code, tenant_slug, COALESCE(tenant_id, '') as tenant_id,
                 vertical, title, COALESCE(category, 'General') as category,
                 COALESCE(description, '') as description, price,
                 COALESCE(currency, '₦') as currency,
                 duration_minutes, COALESCE(provider_name, '') as provider_name,
                 COALESCE(provider_role, '') as provider_role,
                 COALESCE(status, 'ACTIVE') as status,
                 COALESCE(is_bookable, TRUE) as is_bookable,
                 COALESCE(attributes, '{}'::jsonb) as attributes,
                 created_at, updated_at
          FROM shop_services
          WHERE LOWER(tenant_slug) = ${cleanSlug}
          ORDER BY created_at DESC;
        `;
      }

      if (queryResult && queryResult.length > 0) {
        return queryResult.map((r: any) => ({
          id: r.id || r.service_code,
          title: r.title,
          price: Number(r.price) || 0,
          formattedPrice: Number(r.price) === 0 ? "Free Consultation" : `${r.currency || "₦"}${Number(r.price).toLocaleString()}`,
          durationMinutes: Number(r.duration_minutes) || 45,
          providerName: r.provider_name || "Specialist",
          vertical: r.vertical as VerticalKey,
          status: (r.status === "PAUSED" ? "PAUSED" : "ACTIVE") as "ACTIVE" | "PAUSED",
          description: r.description,
          category: r.category,
          specialistRole: r.provider_role,
        }));
      }
    } catch (err) {
      console.warn("[CommerceServicesStore] Neon services query fallback:", err);
    }
  }

  // 2. Fallback to local sync file cache
  let allServices: any[] = [];
  try {
    if (fs.existsSync(SERVICES_FILE)) {
      const data = fs.readFileSync(SERVICES_FILE, "utf8");
      allServices = JSON.parse(data);
    } else {
      allServices = memoryServices;
    }
  } catch {
    allServices = memoryServices;
  }

  let filtered = allServices.filter(
    (s) => !s.tenantSlug || s.tenantSlug.toLowerCase().trim() === cleanSlug
  );

  if (vertical) {
    filtered = filtered.filter((s) => s.vertical === vertical);
  }

  if (filtered.length === 0 && vertical) {
    return getDefaultServicesForVertical(vertical);
  }

  return filtered.map((s) => ({
    id: s.id,
    title: s.title,
    price: Number(s.price) || 0,
    formattedPrice: s.formattedPrice || (Number(s.price) === 0 ? "Free Consultation" : `₦${Number(s.price || 0).toLocaleString()}`),
    durationMinutes: Number(s.durationMinutes) || 45,
    providerName: s.providerName || "Specialist",
    vertical: s.vertical as VerticalKey,
    status: s.status || "ACTIVE",
    description: s.description || "",
    category: s.category || "General",
    specialistRole: s.specialistRole,
  }));
}

export async function saveErpService(
  item: Partial<CommerceServiceItem> & { tenantSlug: string; vertical: VerticalKey }
): Promise<CommerceServiceItem> {
  ensureStorageReady();
  const cleanSlug = (item.tenantSlug || "neweratransports").toLowerCase().trim();
  const id = item.id || `SRV-${item.vertical.toUpperCase().slice(0, 4)}-${Date.now().toString().slice(-4)}`;
  const title = item.title || "New Service";
  const numPrice = Number(item.price) || 0;
  const duration = Number(item.durationMinutes) || 45;
  const provider = item.providerName || "Specialist";
  const desc = item.description || "";
  const status = item.status || "ACTIVE";
  const cat = item.category || "General";

  const savedItem: CommerceServiceItem & { tenantSlug: string } = {
    id,
    title,
    price: numPrice,
    formattedPrice: numPrice === 0 ? "Free Consultation" : `₦${numPrice.toLocaleString()}`,
    durationMinutes: duration,
    providerName: provider,
    vertical: item.vertical,
    status,
    description: desc,
    category: cat,
    tenantSlug: cleanSlug,
  };

  // 1. Neon DB Upsert
  const sql = await getTenantSql(cleanSlug);
  if (sql) {
    try {
      await sql`
        INSERT INTO shop_services (
          id, service_code, tenant_slug, vertical, title, category, description,
          price, currency, duration_minutes, provider_name, provider_role,
          status, is_bookable, attributes, created_at, updated_at
        ) VALUES (
          ${id}, ${id}, ${cleanSlug}, ${item.vertical}, ${title}, ${cat}, ${desc},
          ${numPrice}, '₦', ${duration}, ${provider}, 'Specialist',
          ${status}, TRUE, '{}'::jsonb, NOW(), NOW()
        )
        ON CONFLICT (tenant_slug, service_code) DO UPDATE SET
          title = EXCLUDED.title,
          price = EXCLUDED.price,
          duration_minutes = EXCLUDED.duration_minutes,
          provider_name = EXCLUDED.provider_name,
          description = EXCLUDED.description,
          status = EXCLUDED.status,
          updated_at = NOW();
      `;
    } catch (err) {
      console.warn("[CommerceServicesStore] Neon upsert failed, continuing with file sync:", err);
    }
  }

  // 2. File Sync
  let current: any[] = [];
  try {
    if (fs.existsSync(SERVICES_FILE)) {
      current = JSON.parse(fs.readFileSync(SERVICES_FILE, "utf8"));
    } else {
      current = memoryServices;
    }
  } catch {
    current = memoryServices;
  }

  const idx = current.findIndex((s) => s.id === id);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...savedItem };
  } else {
    current.unshift(savedItem);
  }

  try {
    fs.writeFileSync(SERVICES_FILE, JSON.stringify(current, null, 2), "utf8");
    memoryServices = current;
  } catch (writeErr) {
    memoryServices = current;
  }

  try {
    publishCommerceEvent(cleanSlug, {
      type: "SERVICE_CATALOG_UPDATED",
      data: savedItem,
    });
  } catch {}

  return savedItem;
}

export async function deleteErpService(id: string, tenantSlug: string): Promise<boolean> {
  ensureStorageReady();
  const cleanSlug = (tenantSlug || "neweratransports").toLowerCase().trim();
  const sql = await getTenantSql(cleanSlug);

  if (sql) {
    try {
      await sql`
        DELETE FROM shop_services
        WHERE (id = ${id} OR service_code = ${id})
          AND LOWER(tenant_slug) = ${cleanSlug}
      `;
    } catch {}
  }

  let current: any[] = [];
  try {
    if (fs.existsSync(SERVICES_FILE)) {
      current = JSON.parse(fs.readFileSync(SERVICES_FILE, "utf8"));
    }
  } catch {}

  const next = current.filter((s) => !(s.id === id && (s.tenantSlug || "").toLowerCase().trim() === cleanSlug));
  try {
    fs.writeFileSync(SERVICES_FILE, JSON.stringify(next, null, 2), "utf8");
  } catch {}

  return true;
}
