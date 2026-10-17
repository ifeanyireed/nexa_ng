import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export const dynamic = "force-dynamic";

const ERP_BASE = process.env.ERP_SERVICE_URL || process.env.NEXT_PUBLIC_ERP_SERVICE_URL || "https://ofia-erp-service.onrender.com";

const DIRECT_NEON_SUBPATHS = new Set(["reviews", "users", "cycles", "objectives", "departments"]);

function getTenantSlug(request: Request, url: URL): string {
  const headerSlug = request.headers.get("x-tenant-slug");
  if (headerSlug) return headerSlug;

  const querySlug = url.searchParams.get("tenant") || url.searchParams.get("tenant_slug");
  if (querySlug) return querySlug;

  return "";
}

async function queryNeonDirectly(subPath: string, tenantSlug: string, searchParams: URLSearchParams) {
  const pool = getDbPool();

  if (subPath === "reviews") {
    const id = searchParams.get("id");
    const employeeId = searchParams.get("employeeId");
    if (id) {
      const res = await pool.query(
        `SELECT id, "tenantSlug", "employeeId", "employeeName", department, "cycleId", "cycleName", status, "employeeComments", "managerComments", "hrComments", "improvementPlan", "finalScore", "objectivesJson", to_char("updatedAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "updatedAt" FROM "PerformanceReview" WHERE id = $1`,
        [id]
      );
      if (res.rows.length > 0) {
        const r = res.rows[0];
        let objs = [];
        try { objs = JSON.parse(r.objectivesJson || "[]"); } catch {}
        return { ...r, objectives: objs };
      }
      return null;
    }
    let query = `SELECT id, "tenantSlug", "employeeId", "employeeName", department, "cycleId", "cycleName", status, "employeeComments", "managerComments", "hrComments", "improvementPlan", "finalScore", "objectivesJson", to_char("updatedAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "updatedAt" FROM "PerformanceReview"`;
    const args: any[] = [];
    if (employeeId && tenantSlug) {
      query += ` WHERE "employeeId" = $1 AND "tenantSlug" = $2`;
      args.push(employeeId, tenantSlug);
    } else if (employeeId) {
      query += ` WHERE "employeeId" = $1`;
      args.push(employeeId);
    } else if (tenantSlug) {
      query += ` WHERE "tenantSlug" = $1`;
      args.push(tenantSlug);
    }
    query += ` ORDER BY "updatedAt" DESC`;
    const res = await pool.query(query, args);
    return res.rows.map((r: any) => {
      let objs = [];
      try { objs = JSON.parse(r.objectivesJson || "[]"); } catch {}
      return { ...r, objectives: objs };
    });
  }

  if (subPath === "users") {
    try {
      await pool.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "assignedPages" JSONB DEFAULT '[]'::jsonb;`);
    } catch {}

    const id = searchParams.get("id");
    const email = searchParams.get("email");
    if (id || email) {
      let query = `SELECT id, "tenantSlug", name, email, role, department, avatar, "managerName", "managerId", "ratingTrend", designation, "gradeLevel", "employmentDate", company, location, "assignedPages" FROM "User" WHERE `;
      const args: any[] = [];
      if (id) {
        query += `id = $1`;
        args.push(id);
      } else {
        query += `LOWER(email) = LOWER($1)`;
        args.push(email);
      }
      if (tenantSlug) {
        query += ` AND "tenantSlug" = $${args.length + 1}`;
        args.push(tenantSlug);
      }
      const res = await pool.query(query, args);
      return res.rows[0] || null;
    }
    let query = `SELECT id, "tenantSlug", name, email, role, department, avatar, "managerName", "managerId", "ratingTrend", designation, "gradeLevel", "employmentDate", company, location, "assignedPages" FROM "User"`;
    const args: any[] = [];
    if (tenantSlug) {
      query += ` WHERE "tenantSlug" = $1`;
      args.push(tenantSlug);
    }
    query += ` ORDER BY name ASC`;
    const res = await pool.query(query, args);
    return res.rows;
  }

  if (subPath === "cycles") {
    let query = `SELECT id, "tenantSlug", name, "startDate", "endDate", status, departments FROM "ReviewCycle"`;
    const args: any[] = [];
    if (tenantSlug) {
      query += ` WHERE "tenantSlug" = $1`;
      args.push(tenantSlug);
    }
    query += ` ORDER BY id ASC`;
    const res = await pool.query(query, args);
    return res.rows.map((c: any) => {
      let depts = [];
      try {
        depts = typeof c.departments === "string" ? JSON.parse(c.departments) : c.departments;
      } catch {}
      return { ...c, departments: depts };
    });
  }

  if (subPath === "objectives") {
    let query = `SELECT id, "tenantSlug", text, weight, type, "expectedLevel", category, departments, description FROM "Objective"`;
    const args: any[] = [];
    if (tenantSlug) {
      query += ` WHERE "tenantSlug" = $1`;
      args.push(tenantSlug);
    }
    query += ` ORDER BY id ASC`;
    const res = await pool.query(query, args);
    return res.rows.map((o: any) => {
      let depts = [];
      try { depts = typeof o.departments === "string" ? JSON.parse(o.departments) : o.departments; } catch {}
      let desc = [];
      try { desc = typeof o.description === "string" ? JSON.parse(o.description) : o.description; } catch {}
      return { ...o, departments: depts, description: desc };
    });
  }

  if (subPath === "departments") {
    let query = `SELECT code, "tenantSlug", name, head, "headCount", budget, "costCenter" FROM "Department"`;
    const args: any[] = [];
    if (tenantSlug) {
      query += ` WHERE "tenantSlug" = $1`;
      args.push(tenantSlug);
    }
    query += ` ORDER BY code ASC`;
    const res = await pool.query(query, args);
    return res.rows;
  }

  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path?: string[] }> | { path?: string[] } }
) {
  const resolvedParams = await params;
  const path = Array.isArray(resolvedParams?.path) ? resolvedParams.path : [];
  const subPath = path.join("/");
  const url = new URL(request.url);
  const tenantSlug = getTenantSlug(request, url);

  if (DIRECT_NEON_SUBPATHS.has(subPath)) {
    try {
      const data = await queryNeonDirectly(subPath, tenantSlug, url.searchParams);
      if (data === null) {
        return NextResponse.json({ error: `${subPath} record not found` }, { status: 404 });
      }
      return NextResponse.json(data);
    } catch (err: any) {
      return NextResponse.json(
        { error: `Database error querying '${subPath}': ${err.message}` },
        { status: 500 }
      );
    }
  }

  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tenantSlug) {
      headers["x-tenant-slug"] = tenantSlug;
    }

    const res = await fetch(targetUrl, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "ERP service connection error: " + err.message },
      { status: 502 }
    );
  }
}

async function upsertNeonDirectly(subPath: string, tenantSlug: string, bodyText: string) {
  const pool = getDbPool();
  const parsed = JSON.parse(bodyText || "{}");

  if (subPath === "reviews") {
    const pr = parsed;
    const effectiveSlug = tenantSlug || pr.tenantSlug || "";
    const objsStr = typeof pr.objectives === "string" ? pr.objectives : JSON.stringify(pr.objectives || []);
    await pool.query(
      `INSERT INTO "PerformanceReview" 
        (id, "tenantSlug", "employeeId", "employeeName", department, "cycleId", "cycleName", status, "employeeComments", "managerComments", "hrComments", "improvementPlan", "finalScore", "objectivesJson", "updatedAt") 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        ON CONFLICT (id) DO UPDATE SET 
        status = EXCLUDED.status, 
        department = EXCLUDED.department,
        "employeeName" = EXCLUDED."employeeName",
        "employeeComments" = EXCLUDED."employeeComments", 
        "managerComments" = EXCLUDED."managerComments", 
        "hrComments" = EXCLUDED."hrComments", 
        "improvementPlan" = EXCLUDED."improvementPlan",
        "finalScore" = EXCLUDED."finalScore", 
        "objectivesJson" = EXCLUDED."objectivesJson", 
        "tenantSlug" = CASE WHEN EXCLUDED."tenantSlug" != '' THEN EXCLUDED."tenantSlug" ELSE "PerformanceReview"."tenantSlug" END,
        "updatedAt" = NOW()`,
      [pr.id, effectiveSlug, pr.employeeId, pr.employeeName, pr.department, pr.cycleId, pr.cycleName, pr.status, pr.employeeComments, pr.managerComments, pr.hrComments, pr.improvementPlan, pr.finalScore, objsStr]
    );
    return { success: true, id: pr.id };
  }

  if (subPath === "cycles") {
    const c = parsed;
    const effectiveSlug = tenantSlug || c.tenantSlug || "";
    const deptsStr = typeof c.departments === "string" ? c.departments : JSON.stringify(c.departments || []);
    await pool.query(
      `INSERT INTO "ReviewCycle" (id, "tenantSlug", name, "startDate", "endDate", status, departments) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET 
          name = EXCLUDED.name, 
          "startDate" = EXCLUDED."startDate", 
          "endDate" = EXCLUDED."endDate", 
          status = EXCLUDED.status, 
          departments = EXCLUDED.departments,
          "tenantSlug" = CASE WHEN EXCLUDED."tenantSlug" != '' THEN EXCLUDED."tenantSlug" ELSE "ReviewCycle"."tenantSlug" END`,
      [c.id, effectiveSlug, c.name, c.startDate, c.endDate, c.status, deptsStr]
    );
    return { success: true, id: c.id };
  }

  if (subPath === "objectives") {
    const o = parsed;
    const effectiveSlug = tenantSlug || o.tenantSlug || "";
    const deptsStr = typeof o.departments === "string" ? o.departments : JSON.stringify(o.departments || []);
    const descStr = typeof o.description === "string" ? o.description : JSON.stringify(o.description || []);
    await pool.query(
      `INSERT INTO "Objective" (id, "tenantSlug", text, weight, type, "expectedLevel", category, departments, description) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET 
          text = EXCLUDED.text, 
          weight = EXCLUDED.weight, 
          type = EXCLUDED.type, 
          "expectedLevel" = EXCLUDED."expectedLevel", 
          category = EXCLUDED.category, 
          departments = EXCLUDED.departments, 
          description = EXCLUDED.description,
          "tenantSlug" = CASE WHEN EXCLUDED."tenantSlug" != '' THEN EXCLUDED."tenantSlug" ELSE "Objective"."tenantSlug" END`,
      [o.id, effectiveSlug, o.text, o.weight, o.type, o.expectedLevel, o.category, deptsStr, descStr]
    );
    return { success: true, id: o.id };
  }

  if (subPath === "users") {
    const u = parsed;
    const effectiveSlug = tenantSlug || u.tenantSlug || "";
    const assignedPagesStr = Array.isArray(u.assignedPages)
      ? JSON.stringify(u.assignedPages)
      : (typeof u.assignedPages === "string" ? u.assignedPages : "[]");

    await pool.query(
      `INSERT INTO "User" (id, "tenantSlug", name, email, role, department, designation, avatar, "managerName", "managerId", company, location, "assignedPages", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          role = EXCLUDED.role,
          department = EXCLUDED.department,
          designation = EXCLUDED.designation,
          avatar = EXCLUDED.avatar,
          "managerName" = EXCLUDED."managerName",
          "managerId" = EXCLUDED."managerId",
          company = EXCLUDED.company,
          location = EXCLUDED.location,
          "assignedPages" = EXCLUDED."assignedPages",
          "tenantSlug" = CASE WHEN EXCLUDED."tenantSlug" != '' THEN EXCLUDED."tenantSlug" ELSE "User"."tenantSlug" END`,
      [
        u.id,
        effectiveSlug,
        u.name,
        u.email,
        u.role,
        u.department,
        u.designation || "Corporate Officer",
        u.avatar || "/character1.jpg",
        u.managerName || null,
        u.managerId || null,
        u.company || null,
        u.location || null,
        assignedPagesStr,
      ]
    );
    return { success: true, id: u.id };
  }

  return null;
}

async function deleteNeonDirectly(subPath: string, tenantSlug: string, id: string) {
  const pool = getDbPool();

  if (subPath === "cycles") {
    if (tenantSlug) {
      await pool.query(`DELETE FROM "ReviewCycle" WHERE id = $1 AND "tenantSlug" = $2`, [id, tenantSlug]);
    } else {
      await pool.query(`DELETE FROM "ReviewCycle" WHERE id = $1`, [id]);
    }
    return { success: true, id };
  }
  if (subPath === "objectives") {
    if (tenantSlug) {
      await pool.query(`DELETE FROM "Objective" WHERE id = $1 AND "tenantSlug" = $2`, [id, tenantSlug]);
    } else {
      await pool.query(`DELETE FROM "Objective" WHERE id = $1`, [id]);
    }
    return { success: true, id };
  }
  if (subPath === "users") {
    if (tenantSlug) {
      await pool.query(`DELETE FROM "User" WHERE id = $1 AND "tenantSlug" = $2`, [id, tenantSlug]);
    } else {
      await pool.query(`DELETE FROM "User" WHERE id = $1`, [id]);
    }
    return { success: true, id };
  }
  if (subPath === "reviews") {
    await pool.query(`DELETE FROM "PerformanceReview" WHERE id = $1`, [id]);
    return { success: true, id };
  }

  return null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path?: string[] }> | { path?: string[] } }
) {
  const resolvedParams = await params;
  const path = Array.isArray(resolvedParams?.path) ? resolvedParams.path : [];
  const subPath = path.join("/");
  const url = new URL(request.url);
  const tenantSlug = getTenantSlug(request, url);

  const body = await request.text();

  if (DIRECT_NEON_SUBPATHS.has(subPath)) {
    try {
      const direct = await upsertNeonDirectly(subPath, tenantSlug, body);
      return NextResponse.json(direct, { status: 200 });
    } catch (err: any) {
      return NextResponse.json(
        { error: `Failed to persist ${subPath} to database: ` + err.message },
        { status: 500 }
      );
    }
  }

  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tenantSlug) {
      headers["x-tenant-slug"] = tenantSlug;
    }

    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: body || "{}",
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "ERP service connection error: " + err.message },
      { status: 502 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ path?: string[] }> | { path?: string[] } }
) {
  return POST(request, { params });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ path?: string[] }> | { path?: string[] } }
) {
  const resolvedParams = await params;
  const path = Array.isArray(resolvedParams?.path) ? resolvedParams.path : [];
  const subPath = path.join("/");
  const url = new URL(request.url);
  const tenantSlug = getTenantSlug(request, url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing 'id' parameter for delete operation" }, { status: 400 });
  }

  if (DIRECT_NEON_SUBPATHS.has(subPath)) {
    try {
      const res = await deleteNeonDirectly(subPath, tenantSlug, id);
      return NextResponse.json(res, { status: 200 });
    } catch (err: any) {
      return NextResponse.json(
        { error: `Failed to delete ${subPath} from database: ` + err.message },
        { status: 500 }
      );
    }
  }

  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tenantSlug) {
      headers["x-tenant-slug"] = tenantSlug;
    }

    const res = await fetch(targetUrl, {
      method: "DELETE",
      headers,
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "ERP service connection error: " + err.message },
      { status: 502 }
    );
  }
}
