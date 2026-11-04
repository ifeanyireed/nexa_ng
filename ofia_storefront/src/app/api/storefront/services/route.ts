import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { VerticalType } from "@/types/storefront";

export const dynamic = "force-dynamic";

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = (searchParams.get("tenant") || searchParams.get("slug") || "neweratransports").toLowerCase().trim();
  const vertical = searchParams.get("vertical") as VerticalType | null;

  // 1. Neon DB lookup
  try {
    const sql = await getTenantSql(tenantSlug);
    if (sql) {
      let queryResult: any[] = [];
      if (vertical) {
        queryResult = await sql`
          SELECT id, service_code, vertical, title, category, description,
                 price, currency, duration_minutes, provider_name, provider_role,
                 status, is_bookable, attributes
          FROM shop_services
          WHERE LOWER(tenant_slug) = ${tenantSlug}
            AND vertical = ${vertical}
            AND status = 'ACTIVE'
          ORDER BY created_at DESC;
        `;
      } else {
        queryResult = await sql`
          SELECT id, service_code, vertical, title, category, description,
                 price, currency, duration_minutes, provider_name, provider_role,
                 status, is_bookable, attributes
          FROM shop_services
          WHERE LOWER(tenant_slug) = ${tenantSlug}
            AND status = 'ACTIVE'
          ORDER BY created_at DESC;
        `;
      }

      if (queryResult && queryResult.length > 0) {
        const services = queryResult.map((r: any) => ({
          id: r.id || r.service_code,
          title: r.title,
          price: Number(r.price) || 0,
          formattedPrice: Number(r.price) === 0 ? "Free Consultation" : `${r.currency || "₦"}${Number(r.price).toLocaleString()}`,
          durationMinutes: Number(r.duration_minutes) || 45,
          providerName: r.provider_name || "Specialist",
          vertical: r.vertical,
          status: r.status,
          description: r.description,
          category: r.category,
        }));

        return NextResponse.json({
          success: true,
          tenantSlug,
          vertical: vertical || null,
          count: services.length,
          source: "database",
          services,
        });
      }
    }
  } catch (err) {
    console.warn("[StorefrontServices] Neon lookup fallback:", err);
  }

  // 2. Local JSON Sync File
  let allServices: any[] = [];
  try {
    if (fs.existsSync(SERVICES_FILE)) {
      const raw = fs.readFileSync(SERVICES_FILE, "utf8");
      allServices = JSON.parse(raw);
    }
  } catch {}

  let filtered = allServices.filter(
    (s: any) => !s.tenantSlug || s.tenantSlug.toLowerCase().trim() === tenantSlug
  );

  if (vertical) {
    filtered = filtered.filter((s: any) => s.vertical === vertical);
  }

  return NextResponse.json({
    success: true,
    tenantSlug,
    vertical: vertical || null,
    count: filtered.length,
    source: "sync_cache",
    services: filtered,
  });
}
