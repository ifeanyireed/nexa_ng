import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";

export const dynamic = "force-dynamic";

function extractTenantSlug(request: NextRequest, body?: any): string {
  const headerSlug = request.headers.get("x-tenant-slug");
  if (headerSlug && headerSlug.trim()) {
    return headerSlug.trim().toLowerCase();
  }
  if (body?.tenant && typeof body.tenant === "string" && body.tenant.trim()) {
    return body.tenant.trim().toLowerCase();
  }
  if (body?.tenantSlug && typeof body.tenantSlug === "string" && body.tenantSlug.trim()) {
    return body.tenantSlug.trim().toLowerCase();
  }
  try {
    const url = new URL(request.url);
    const querySlug =
      url.searchParams.get("tenant") ||
      url.searchParams.get("tenant_slug") ||
      url.searchParams.get("slug");
    if (querySlug && querySlug.trim()) {
      return querySlug.trim().toLowerCase();
    }
  } catch {}
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  if (host && host.includes(".")) {
    const parts = host.split(":")[0].split(".");
    const sub = parts[0].toLowerCase().trim();
    if (sub && !["www", "admin", "app", "api", "localhost", "ofia", "vercel"].includes(sub)) {
      return sub;
    }
  }
  return "";
}

export async function GET(request: NextRequest) {
  const tenantSlug = extractTenantSlug(request);

  if (!tenantSlug || tenantSlug === "default") {
    return NextResponse.json(
      {
        success: false,
        error: "Tenant slug is required. Provide a valid tenant in header or ?tenant=",
      },
      { status: 400 }
    );
  }

  try {
    const sql = await getTenantSql(tenantSlug);

    const dbDrivers = await sql`
      SELECT 
        d.id,
        d.name,
        COALESCE(d.employee_id, '') as employee_id,
        COALESCE(d.phone, '') as phone,
        COALESCE(d.email, '') as email,
        COALESCE(d.designation, 'Driver') as designation,
        COALESCE(d.region, 'General') as region,
        COALESCE(d.assigned_plate, '') as assigned_plate,
        COALESCE(d.assigned_vehicle_type, 'Fleet Vehicle') as assigned_vehicle_type,
        COALESCE(d.license_number, '') as license_number,
        COALESCE(d.license_expiry, '') as license_expiry,
        COALESCE(d.lasdri_certified, false) as lasdri_certified,
        COALESCE(d.status, 'Active') as status,
        COALESCE(d.rating, 4.80) as rating,
        COALESCE(d.total_trips, 0) as total_trips,
        COALESCE(d.total_incidents, 0) as total_incidents,
        COALESCE(d.total_cancellations, 0) as total_cancellations,
        COALESCE(d.service_category, 'Fleet Operations') as service_category,
        COALESCE(d.verification_identity, 'Verified') as verification_identity,
        COALESCE(d.verification_license, 'Verified') as verification_license,
        COALESCE(d.verification_background, 'Verified') as verification_background,
        COALESCE(d.verification_overall, 'Verified') as verification_overall,
        COALESCE(d.guarantor_name, '') as guarantor_name,
        COALESCE(d.guarantor_phone, '') as guarantor_phone,
        COALESCE(d.qualification, '') as qualification
      FROM fleet_drivers d
      WHERE LOWER(d.tenant_slug) = ${tenantSlug}
      ORDER BY d.created_at DESC, d.name ASC;
    `;

    let totalRatingSum = 0;
    let totalIncidentsSum = 0;
    let activeCount = 0;
    let pendingCount = 0;

    const drivers = dbDrivers.map((d: any) => {
      const numRating = Number(d.rating) || 4.8;
      totalRatingSum += numRating;
      totalIncidentsSum += Number(d.total_incidents) || 0;

      const st = d.status || "Active";
      if (["Active", "Online", "On Trip", "Assigned"].includes(st)) {
        activeCount++;
      }

      if (d.verification_overall !== "Verified") {
        pendingCount++;
      }

      return {
        id: d.id,
        name: d.name,
        employeeId: d.employee_id || `DRV-${d.id.slice(-4)}`,
        phone: d.phone,
        email: d.email,
        designation: d.designation,
        region: d.region,
        assignedPlate: d.assigned_plate,
        assignedVehicleType: d.assigned_vehicle_type,
        licenseNumber: d.license_number,
        licenseExpiry: d.license_expiry,
        lasdriCertified: Boolean(d.lasdri_certified),
        status: d.status,
        rating: Number(numRating.toFixed(1)),
        totalTrips: Number(d.total_trips) || 0,
        totalIncidents: Number(d.total_incidents) || 0,
        totalCancellations: Number(d.total_cancellations) || 0,
        serviceCategory: d.service_category,
        verifications: {
          identity: d.verification_identity,
          license: d.verification_license,
          background: d.verification_background,
          overall: d.verification_overall
        },
        guarantorName: d.guarantor_name,
        guarantorPhone: d.guarantor_phone,
        qualification: d.qualification
      };
    });

    const avgRating = drivers.length > 0 ? Number((totalRatingSum / drivers.length).toFixed(1)) : 4.8;
    const pendingReviewDrivers = drivers.filter((d: any) => d.verifications.overall !== "Verified");

    return NextResponse.json({
      success: true,
      drivers,
      pendingReview: pendingReviewDrivers,
      kpis: {
        activeDrivers: activeCount,
        avgRating,
        pendingReview: pendingCount,
        incidents30d: totalIncidentsSum
      }
    });
  } catch (error: any) {
    console.error(`[Mobility Drivers GET Error]:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch drivers: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  const tenantSlug = extractTenantSlug(request, body);
  if (!tenantSlug || tenantSlug === "default") {
    return NextResponse.json(
      { success: false, error: "Tenant slug is required." },
      { status: 400 }
    );
  }

  const { action } = body;

  try {
    const sql = await getTenantSql(tenantSlug);

    // ACTION: ADD DRIVER
    if (action === "add_driver") {
      const {
        name,
        employeeId,
        phone,
        email,
        designation,
        region,
        licenseNumber,
        licenseExpiry,
        lasdriCertified,
        assignedPlate
      } = body;

      if (!name || !name.trim()) {
        return NextResponse.json({ success: false, error: "Driver name is required" }, { status: 400 });
      }

      const cleanName = name.trim();
      const driverId = `drv-${tenantSlug}-${Date.now().toString().slice(-6)}`;
      const empId = employeeId && employeeId.trim() ? employeeId.trim().toUpperCase() : `NETS-${Math.floor(100 + Math.random() * 900)}`;

      await sql`
        INSERT INTO fleet_drivers (
          id, tenant_slug, tenant_id, employee_id, name, email,
          designation, phone, assigned_plate, assigned_vehicle_type,
          region, license_number, license_expiry, lasdri_certified,
          status, rating, total_trips, total_incidents,
          verification_identity, verification_license, verification_background,
          verification_overall
        ) VALUES (
          ${driverId}, ${tenantSlug}, ${tenantSlug}, ${empId}, ${cleanName}, ${email || ''},
          ${designation || 'In House Driver'}, ${phone || ''}, ${assignedPlate || ''},
          'Fleet Vehicle', ${region || 'Lagos'}, ${licenseNumber || `LIC-${empId}`},
          ${licenseExpiry || '2027-12-31'}, ${Boolean(lasdriCertified)}, 'Active',
          4.80, 0, 0, 'Verified', 'Verified', 'Verified', 'Verified'
        )
        ON CONFLICT (tenant_slug, name) DO UPDATE SET
          phone = EXCLUDED.phone,
          region = EXCLUDED.region,
          license_number = EXCLUDED.license_number,
          lasdri_certified = EXCLUDED.lasdri_certified,
          updated_at = CURRENT_TIMESTAMP;
      `;

      // If plate was assigned, also link vehicle
      if (assignedPlate && assignedPlate.trim()) {
        await sql`
          UPDATE fleet_vehicles
          SET assigned_driver_name = ${cleanName},
              assigned_driver_phone = ${phone || ''},
              assigned_driver_lasdri = ${Boolean(lasdriCertified)}
          WHERE LOWER(tenant_slug) = ${tenantSlug}
            AND plate_number = ${assignedPlate.trim()};
        `;
      }

      return NextResponse.json({ success: true, message: `Driver ${cleanName} added successfully` });
    }

    // ACTION: UPDATE STATUS
    if (action === "update_status") {
      const { driverId, status } = body;
      if (!driverId || !status) {
        return NextResponse.json({ success: false, error: "Driver ID and status required" }, { status: 400 });
      }

      await sql`
        UPDATE fleet_drivers
        SET status = ${status},
            updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(tenant_slug) = ${tenantSlug} AND id = ${driverId};
      `;

      return NextResponse.json({ success: true, message: "Driver status updated" });
    }

    // ACTION: VERIFY DRIVER
    if (action === "verify_driver") {
      const { driverId, identityStatus, licenseStatus, backgroundStatus } = body;
      if (!driverId) {
        return NextResponse.json({ success: false, error: "Driver ID required" }, { status: 400 });
      }

      const overall = (identityStatus === "Verified" && licenseStatus === "Verified" && backgroundStatus === "Verified")
        ? "Verified"
        : "Action Needed";

      await sql`
        UPDATE fleet_drivers
        SET verification_identity = ${identityStatus || 'Verified'},
            verification_license = ${licenseStatus || 'Verified'},
            verification_background = ${backgroundStatus || 'Verified'},
            verification_overall = ${overall},
            updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(tenant_slug) = ${tenantSlug} AND id = ${driverId};
      `;

      return NextResponse.json({ success: true, message: "Driver verifications updated", overall });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error(`[Mobility Drivers POST Error]:`, error);
    return NextResponse.json(
      { success: false, error: "Operation failed: " + error.message },
      { status: 500 }
    );
  }
}
