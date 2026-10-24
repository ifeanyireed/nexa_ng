import { neon } from "@neondatabase/serverless";
import { MASTER_CONNECTION_STRING, getTenantDatabaseConfig, invalidateTenantDbCache } from "./tenant-db-resolver";
import { randomUUID } from "crypto";

const USER_SERVICE_DB_URL =
  process.env.USERS_DATABASE_URL ||
  "postgresql://neondb_owner:npg_YBd2DvyRxTG7@ep-falling-star-b4lrdr76-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export interface TenantModulePreset {
  erpModules: Record<string, boolean>;
  shopSubModules: Record<string, boolean>;
  mobilitySubModules: Record<string, boolean>;
}

export const SUPER_ADMIN_MODULE_KEYS = [
  "ai",
  "crm",
  "marketplace",
  "shop",
  "accounting",
  "hr",
  "mobility",
  "dispatch",
  "users",
] as const;

export const SHOP_SUB_MODULE_KEYS = [
  "pos",
  "inventory",
  "catalog",
  "services",
  "orders",
  "store",
  "referrals",
] as const;

export const MOBILITY_SUB_MODULE_KEYS = [
  "ops",
  "vehicles",
  "drivers",
  "maintenance",
  "routes",
  "finance",
  "shuttle",
  "interstate",
  "on_demand",
  "rental",
  "school",
  "staff",
  "mobility_ops",
  "dispatch_ops",
] as const;

export const ALL_ROLES = [
  "tenant_provision",
  "admin",
  "md",
  "manager",
  "employee",
  "hr",
  "accountant",
  "marketer",
  "sales_closer",
  "dispatcher",
] as const;

/**
 * Derives default module access based on the tenant's business vertical.
 */
export function getDefaultModulesForVertical(vertical: string = "retail"): TenantModulePreset {
  const norm = (vertical || "retail").toLowerCase().trim();

  // Retail, fashion, food, lifestyle & consumer service workspaces
  if (
    norm === "fashion" ||
    norm === "retail" ||
    norm === "supermarket" ||
    norm === "restaurant" ||
    norm === "beauty" ||
    norm === "home-services" ||
    norm === "health-wellness" ||
    norm === "services"
  ) {
    return {
      erpModules: {
        ai: true,
        crm: true,
        marketplace: true,
        shop: true,
        accounting: true,
        hr: true,
        users: true,
        mobility: false,
        dispatch: false,
      },
      shopSubModules: {
        pos: true,
        inventory: true,
        catalog: true,
        services: true,
        orders: true,
        store: true,
        referrals: true,
      },
      mobilitySubModules: {
        ops: false,
        vehicles: false,
        drivers: false,
        maintenance: false,
        routes: false,
        finance: false,
        shuttle: false,
        interstate: false,
        on_demand: false,
        rental: false,
        school: false,
        staff: false,
        mobility_ops: false,
        dispatch_ops: false,
      },
    };
  }

  // Transportation, automotive, logistics & fleet dispatch workspaces
  if (norm === "cars" || norm === "logistics" || norm === "transport" || norm === "fleet") {
    return {
      erpModules: {
        ai: true,
        crm: true,
        marketplace: true,
        shop: false,
        accounting: true,
        hr: true,
        users: true,
        mobility: true,
        dispatch: true,
      },
      shopSubModules: {
        pos: false,
        inventory: false,
        catalog: false,
        services: false,
        orders: false,
        store: false,
        referrals: false,
      },
      mobilitySubModules: {
        ops: true,
        vehicles: true,
        drivers: true,
        maintenance: true,
        routes: true,
        finance: true,
        shuttle: true,
        interstate: true,
        on_demand: true,
        rental: true,
        school: true,
        staff: true,
        mobility_ops: true,
        dispatch_ops: true,
      },
    };
  }

  // Generic enterprise fallback (shop-enabled, transport-disabled)
  return {
    erpModules: {
      ai: true,
      crm: true,
      marketplace: true,
      shop: true,
      accounting: true,
      hr: true,
      users: true,
      mobility: false,
      dispatch: false,
    },
    shopSubModules: {
      pos: true,
      inventory: true,
      catalog: true,
      services: true,
      orders: true,
      store: true,
      referrals: true,
    },
    mobilitySubModules: {
      ops: false,
      vehicles: false,
      drivers: false,
      maintenance: false,
      routes: false,
      finance: false,
      shuttle: false,
      interstate: false,
      on_demand: false,
      rental: false,
      school: false,
      staff: false,
      mobility_ops: false,
      dispatch_ops: false,
    },
  };
}

/**
 * Ensures the TenantRolePermission table and index exist in a given database.
 */
async function ensureRBACTable(targetSql: any) {
  await targetSql`
    CREATE TABLE IF NOT EXISTS "TenantRolePermission" (
      id VARCHAR(191) PRIMARY KEY,
      "tenantId" VARCHAR(191) NOT NULL,
      role VARCHAR(50) NOT NULL,
      "moduleKey" VARCHAR(100) NOT NULL,
      "isEnabled" BOOLEAN NOT NULL DEFAULT true,
      "allowedActions" JSON DEFAULT '[]'::json,
      "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await targetSql`
    CREATE UNIQUE INDEX IF NOT EXISTS tenant_role_module_uniq 
    ON "TenantRolePermission" ("tenantId", role, "moduleKey");
  `;
}

/**
 * Builds the granular role-by-role RBAC permission matrix for a tenant.
 */
function buildRoleMatrix(
  tenantSlug: string,
  erpModules: Record<string, boolean>,
  shopSubs: Record<string, boolean>,
  mobilitySubs: Record<string, boolean>
): Array<{ id: string; tenantId: string; role: string; moduleKey: string; isEnabled: boolean }> {
  const records: Array<{ id: string; tenantId: string; role: string; moduleKey: string; isEnabled: boolean }> = [];

  const isShopActive = Boolean(erpModules.shop);
  const isMobilityActive = Boolean(erpModules.mobility);
  const isDispatchActive = Boolean(erpModules.dispatch);
  const isCrmActive = Boolean(erpModules.crm);
  const isAccountingActive = Boolean(erpModules.accounting);
  const isHrActive = Boolean(erpModules.hr);
  const isAiActive = Boolean(erpModules.ai);
  const isMarketplaceActive = Boolean(erpModules.marketplace);
  const isUsersActive = Boolean(erpModules.users);

  // All module keys to evaluate
  const allModuleKeys: string[] = [
    ...SUPER_ADMIN_MODULE_KEYS,
    ...SHOP_SUB_MODULE_KEYS,
    ...MOBILITY_SUB_MODULE_KEYS,
    "sales_closer",
    "employee",
    "manager",
    "md",
    "mission",
    "overview",
  ];

  ALL_ROLES.forEach((role) => {
    allModuleKeys.forEach((key) => {
      let isEnabled = false;

      // 1. Super Admin baseline ('tenant_provision') and Tenant Administrator ('admin')
      if (role === "tenant_provision" || role === "admin") {
        if (key === "mission" || key === "overview") {
          isEnabled = true;
        } else if (key === "shop") {
          isEnabled = isShopActive;
        } else if (key === "mobility") {
          isEnabled = isMobilityActive;
        } else if (key === "dispatch") {
          isEnabled = isDispatchActive;
        } else if (key === "crm") {
          isEnabled = isCrmActive;
        } else if (key === "accounting") {
          isEnabled = isAccountingActive;
        } else if (key === "hr") {
          isEnabled = isHrActive;
        } else if (key === "ai") {
          isEnabled = isAiActive;
        } else if (key === "marketplace") {
          isEnabled = isMarketplaceActive;
        } else if (key === "users") {
          isEnabled = isUsersActive;
        } else if (key === "sales_closer") {
          isEnabled = isCrmActive;
        } else if (key === "mobility_ops") {
          isEnabled = isMobilityActive;
        } else if (key === "dispatch_ops") {
          isEnabled = isDispatchActive;
        } else if (SHOP_SUB_MODULE_KEYS.includes(key as any)) {
          isEnabled = isShopActive && Boolean(shopSubs[key]);
        } else if (MOBILITY_SUB_MODULE_KEYS.includes(key as any)) {
          isEnabled = isMobilityActive && Boolean(mobilitySubs[key]);
        } else if (key === "employee" || key === "manager" || key === "md") {
          isEnabled = true;
        }
      } else if (role === "md") {
        // MD Executive Role
        if (key === "mission" || key === "overview" || key === "md" || key === "employee") {
          isEnabled = true;
        } else if (key === "accounting") {
          isEnabled = isAccountingActive;
        } else if (key === "hr") {
          isEnabled = isHrActive;
        } else if (key === "crm") {
          isEnabled = isCrmActive;
        } else if (key === "shop") {
          isEnabled = isShopActive;
        } else if (key === "mobility" || key === "mobility_ops") {
          isEnabled = isMobilityActive;
        }
      } else if (role === "manager") {
        // Line Manager
        if (key === "mission" || key === "manager" || key === "employee") {
          isEnabled = true;
        } else if (key === "hr") {
          isEnabled = isHrActive;
        }
      } else if (role === "accountant") {
        // Chief Accountant
        if (key === "mission" || key === "accounting" || key === "employee") {
          isEnabled = true;
        } else if (key === "orders" || key === "store") {
          isEnabled = isShopActive;
        }
      } else if (role === "hr") {
        // HR Director
        if (key === "mission" || key === "hr" || key === "users" || key === "employee") {
          isEnabled = true;
        }
      } else if (role === "sales_closer") {
        // Sales Closer Portal
        if (key === "mission" || key === "employee") {
          isEnabled = true;
        } else if (key === "sales_closer" || key === "crm") {
          isEnabled = isCrmActive;
        }
      } else if (role === "marketer") {
        // Growth Marketer
        if (key === "mission" || key === "employee") {
          isEnabled = true;
        } else if (key === "crm" || key === "sales_closer") {
          isEnabled = isCrmActive;
        } else if (key === "marketplace") {
          isEnabled = isMarketplaceActive;
        } else if (key === "ai") {
          isEnabled = isAiActive;
        }
      } else if (role === "dispatcher") {
        // Fleet Dispatcher
        if (key === "mission" || key === "employee") {
          isEnabled = true;
        } else if (key === "dispatch" || key === "dispatch_ops") {
          isEnabled = isDispatchActive;
        } else if (key === "mobility" || key === "mobility_ops") {
          isEnabled = isMobilityActive;
        }
      } else if (role === "employee") {
        // General Employee
        if (key === "mission" || key === "employee") {
          isEnabled = true;
        }
      }

      records.push({
        id: `${tenantSlug}_${role}_${key}`,
        tenantId: tenantSlug,
        role,
        moduleKey: key,
        isEnabled,
      });
    });
  });

  return records;
}

/**
 * Persists the permission records into a target PostgreSQL database.
 */
async function syncRecordsToDatabase(targetSql: any, tenantSlug: string, records: ReturnType<typeof buildRoleMatrix>) {
  await ensureRBACTable(targetSql);

  const jsonStr = JSON.stringify(records);
  await targetSql`
    INSERT INTO "TenantRolePermission" (
      id, "tenantId", role, "moduleKey", "isEnabled", "createdAt", "updatedAt"
    )
    SELECT 
      x.id,
      x."tenantId",
      x.role,
      x."moduleKey",
      x."isEnabled",
      NOW(),
      NOW()
    FROM json_to_recordset(${jsonStr}::json) AS x(
      id VARCHAR(191),
      "tenantId" VARCHAR(191),
      role VARCHAR(50),
      "moduleKey" VARCHAR(100),
      "isEnabled" BOOLEAN
    )
    ON CONFLICT ("tenantId", role, "moduleKey")
    DO UPDATE SET
      "isEnabled" = EXCLUDED."isEnabled",
      "updatedAt" = NOW();
  `;
}

/**
 * Automatically inspects a tenant's configured modules, resolves vertical alignments,
 * and forces synchronization into:
 * 1. Master platform_tenants registry (Master DB)
 * 2. Tenant's dedicated PostgreSQL database (Tenant DB)
 * 3. Central user-service database (service_users DB)
 */
export async function alignTenantModules(
  tenantSlug: string,
  customModules?: {
    erpModules?: Record<string, boolean>;
    shopSubModules?: Record<string, boolean>;
    mobilitySubModules?: Record<string, boolean>;
  }
): Promise<{
  success: boolean;
  tenantSlug: string;
  erpModules: Record<string, boolean>;
  shopSubModules: Record<string, boolean>;
  mobilitySubModules: Record<string, boolean>;
  recordsSynced: number;
}> {
  const cleanSlug = (tenantSlug || "").toLowerCase().trim();
  if (!cleanSlug) {
    throw new Error("tenantSlug parameter is required for module alignment");
  }

  const masterSql = neon(MASTER_CONNECTION_STRING);

  // 1. Fetch current tenant record from platform_tenants
  const rows = await masterSql`
    SELECT id, name, slug, vertical, database_url, erp_modules, shop_sub_modules, mobility_sub_modules
    FROM platform_tenants
    WHERE LOWER(slug) = ${cleanSlug}
    LIMIT 1;
  `;

  if (!rows || rows.length === 0) {
    throw new Error(`Tenant '${cleanSlug}' not found in platform_tenants registry`);
  }

  const tenant = rows[0];
  const vertical = tenant.vertical || "retail";
  const defaultPreset = getDefaultModulesForVertical(vertical);

  // 2. Resolve effective modules (custom override > configured in DB > vertical default)
  let erpModules: Record<string, boolean> = {
    ...defaultPreset.erpModules,
    ...(tenant.erp_modules || {}),
    ...(customModules?.erpModules || {}),
  };

  let shopSubModules: Record<string, boolean> = {
    ...defaultPreset.shopSubModules,
    ...(tenant.shop_sub_modules || {}),
    ...(customModules?.shopSubModules || {}),
  };

  let mobilitySubModules: Record<string, boolean> = {
    ...defaultPreset.mobilitySubModules,
    ...(tenant.mobility_sub_modules || {}),
    ...(customModules?.mobilitySubModules || {}),
  };

  // Guardrail: Enforce vertical boundaries if not explicitly customized
  const normVertical = vertical.toLowerCase().trim();
  if (
    (normVertical === "fashion" || normVertical === "retail" || normVertical === "supermarket") &&
    !customModules?.erpModules?.mobility
  ) {
    erpModules.mobility = false;
    erpModules.dispatch = false;
    Object.keys(mobilitySubModules).forEach((k) => {
      mobilitySubModules[k] = false;
    });
  }

  // 3. Update master registry platform_tenants table
  await masterSql`
    UPDATE platform_tenants
    SET erp_modules = ${JSON.stringify(erpModules)}::jsonb,
        shop_sub_modules = ${JSON.stringify(shopSubModules)}::jsonb,
        mobility_sub_modules = ${JSON.stringify(mobilitySubModules)}::jsonb,
        updated_at = NOW()
    WHERE LOWER(slug) = ${cleanSlug};
  `;

  // 4. Build granular permission matrix
  const permissionRecords = buildRoleMatrix(cleanSlug, erpModules, shopSubModules, mobilitySubModules);

  // 5. Sync to dedicated tenant database
  const dedicatedConfig = await getTenantDatabaseConfig(cleanSlug);
  if (dedicatedConfig && dedicatedConfig.connectionString) {
    try {
      const dedicatedSql = neon(dedicatedConfig.connectionString);
      await syncRecordsToDatabase(dedicatedSql, cleanSlug, permissionRecords);
    } catch (err: any) {
      console.warn(`[Module Aligner] Dedicated DB sync warning for '${cleanSlug}':`, err.message);
    }
  }

  // 6. Sync to central users database (service_users)
  try {
    const userSql = neon(USER_SERVICE_DB_URL);
    await syncRecordsToDatabase(userSql, cleanSlug, permissionRecords);
  } catch (err: any) {
    console.warn(`[Module Aligner] Central Users DB sync warning for '${cleanSlug}':`, err.message);
  }

  // Invalidate in-memory caches
  invalidateTenantDbCache(cleanSlug);

  return {
    success: true,
    tenantSlug: cleanSlug,
    erpModules,
    shopSubModules,
    mobilitySubModules,
    recordsSynced: permissionRecords.length,
  };
}

/**
 * Inspects all platform tenants and forces alignment for any tenant missing RBAC records.
 */
export async function alignAllTenants(): Promise<number> {
  const masterSql = neon(MASTER_CONNECTION_STRING);
  const rows = await masterSql`SELECT slug, vertical, database_url FROM platform_tenants;`;

  let alignedCount = 0;
  for (const t of rows) {
    try {
      await alignTenantModules(t.slug);
      alignedCount++;
    } catch (err: any) {
      console.warn(`[Module Aligner] Auto-align skipped for '${t.slug}':`, err.message);
    }
  }

  return alignedCount;
}
