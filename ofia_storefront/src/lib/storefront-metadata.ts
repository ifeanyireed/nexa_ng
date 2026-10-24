import { headers } from "next/headers";
import type { Metadata } from "next";
import { extractSubdomainFromHost, SEED_TENANT_HANDSHAKES } from "./storefront-tenant";
import { neon } from "@neondatabase/serverless";
import { MASTER_REGISTRY_URL } from "./tenant-db-resolver";

/**
 * Dynamically resolves the meta title and description for storefront pages.
 * Architectural Mandate: On tenant subdomains/custom domains, the meta Title
 * MUST strictly be the Tenant's name (e.g. "Funmy Clothing", "New Era Transports", etc.).
 */
export async function resolveStorefrontMetadata(
  fallbackTitle: string = "Ofia Storefront",
  fallbackDescription: string = "Enterprise multi-vertical commerce platform."
): Promise<Metadata> {
  try {
    const headerList = await headers();
    const host = headerList.get("x-forwarded-host") || headerList.get("host");
    const subdomain = extractSubdomainFromHost(host);
    const headerTenant = headerList.get("x-tenant-slug");
    const tenantSlug = (subdomain || headerTenant || "").toLowerCase().trim();

    if (tenantSlug) {
      // 1. Query platform_tenants master database dynamically
      try {
        const sql = neon(MASTER_REGISTRY_URL);
        const rows = await sql`
          SELECT name, logo, hero_title, hero_subtitle FROM platform_tenants
          WHERE LOWER(slug) = ${tenantSlug}
             OR REPLACE(LOWER(slug), '-', '') = REPLACE(${tenantSlug}, '-', '')
          LIMIT 1;
        `;
        if (rows && rows.length > 0 && rows[0].name) {
          const tenantName = rows[0].name.trim();
          const logoUrl = rows[0].logo ? rows[0].logo.trim() : "";
          const meta: Metadata = {
            title: tenantName,
            description: rows[0].hero_subtitle || rows[0].hero_title || fallbackDescription,
          };
          if (logoUrl) {
            meta.icons = {
              icon: logoUrl,
              shortcut: logoUrl,
              apple: logoUrl,
            };
          }
          return meta;
        }
      } catch (err) {
        console.warn(`[Storefront Metadata] Failed to query platform_tenants for '${tenantSlug}':`, err);
      }

      // 2. Fallback to known seed handshakes if database is unreachable
      const seed = SEED_TENANT_HANDSHAKES[tenantSlug];
      if (seed?.name) {
        const meta: Metadata = {
          title: seed.name,
          description: seed.storefrontConfig?.description || seed.storefrontConfig?.headline || fallbackDescription,
        };
        if (seed.storefrontConfig?.logoUrl) {
          meta.icons = {
            icon: seed.storefrontConfig.logoUrl,
            shortcut: seed.storefrontConfig.logoUrl,
            apple: seed.storefrontConfig.logoUrl,
          };
        }
        return meta;
      }

      // 3. Fallback to title-cased slug
      const formattedName = tenantSlug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      return {
        title: formattedName,
        description: fallbackDescription,
      };
    }
  } catch {}

  return {
    title: fallbackTitle,
    description: fallbackDescription,
  };
}
