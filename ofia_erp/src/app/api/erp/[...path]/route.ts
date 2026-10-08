import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

const ERP_BASE = process.env.ERP_SERVICE_URL || process.env.NEXT_PUBLIC_ERP_SERVICE_URL || "https://ofia-erp-service.onrender.com";

function getTenantSlug(request: Request, url: URL): string {
  const headerSlug = request.headers.get("x-tenant-slug");
  if (headerSlug) return headerSlug;

  const querySlug = url.searchParams.get("tenant") || url.searchParams.get("tenant_slug");
  if (querySlug) return querySlug;

  return "";
}

async function queryNeonDirectly(subPath: string, tenantSlug: string, searchParams: URLSearchParams) {
  const pool = getDbPool();
  if (!pool) return null;

  try {
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
      return res.rows.map(r => {
        let objs = [];
        try { objs = JSON.parse(r.objectivesJson || "[]"); } catch {}
        return { ...r, objectives: objs };
      });
    }

    if (subPath === "users") {
      const id = searchParams.get("id");
      if (id) {
        const res = await pool.query(
          `SELECT id, "tenantSlug", name, email, role, department, avatar, "managerName", "managerId", "ratingTrend", designation, "gradeLevel", "employmentDate", company, location FROM "User" WHERE id = $1`,
          [id]
        );
        return res.rows[0] || null;
      }
      let query = `SELECT id, "tenantSlug", name, email, role, department, avatar, "managerName", "managerId", "ratingTrend", designation, "gradeLevel", "employmentDate", company, location FROM "User"`;
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
      return res.rows.map(c => {
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
      return res.rows.map(o => {
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
  } catch (err) {
    console.warn("Direct Neon query error in erp route:", err);
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const subPath = path.join("/");
  const url = new URL(request.url);
  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;
  const tenantSlug = getTenantSlug(request, url);

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
    });

    const data = await res.json().catch(() => null);
    if (res.ok && data !== null && (Array.isArray(data) ? true : Object.keys(data).length > 0)) {
      return NextResponse.json(data, { status: res.status });
    }

    // Direct Neon Database Fallback
    const directData = await queryNeonDirectly(subPath, tenantSlug, url.searchParams);
    if (directData !== null) {
      return NextResponse.json(directData);
    }

    return NextResponse.json(data || [], { status: res.status });
  } catch (err: any) {
    const directData = await queryNeonDirectly(subPath, tenantSlug, url.searchParams);
    if (directData !== null) {
      return NextResponse.json(directData);
    }
    return NextResponse.json({ error: "ERP backend connection error: " + err.message }, { status: 502 });
  }
}

async function upsertNeonDirectly(subPath: string, tenantSlug: string, bodyText: string) {
  const pool = getDbPool();
  if (!pool) return null;

  try {
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
      return { status: "success", message: "Review persisted directly to database" };
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
      return { status: "success", message: "Cycle persisted directly to database" };
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
      return { status: "success", message: "Objective persisted directly to database" };
    }
  } catch (e) {
    console.warn("Direct Neon upsert error:", e);
  }
  return null;
}

async function deleteNeonDirectly(subPath: string, tenantSlug: string, id: string) {
  const pool = getDbPool();
  if (!pool || !id) return null;
  try {
    if (subPath === "cycles") {
      if (tenantSlug) {
        await pool.query(`DELETE FROM "ReviewCycle" WHERE id = $1 AND "tenantSlug" = $2`, [id, tenantSlug]);
      } else {
        await pool.query(`DELETE FROM "ReviewCycle" WHERE id = $1`, [id]);
      }
      return { status: "success" };
    }
    if (subPath === "objectives") {
      if (tenantSlug) {
        await pool.query(`DELETE FROM "Objective" WHERE id = $1 AND "tenantSlug" = $2`, [id, tenantSlug]);
      } else {
        await pool.query(`DELETE FROM "Objective" WHERE id = $1`, [id]);
      }
      return { status: "success" };
    }
    if (subPath === "users") {
      if (tenantSlug) {
        await pool.query(`DELETE FROM "User" WHERE id = $1 AND "tenantSlug" = $2`, [id, tenantSlug]);
      } else {
        await pool.query(`DELETE FROM "User" WHERE id = $1`, [id]);
      }
      return { status: "success" };
    }
    if (subPath === "reviews") {
      await pool.query(`DELETE FROM "PerformanceReview" WHERE id = $1`, [id]);
      return { status: "success" };
    }
  } catch (e) {
    console.warn("Direct Neon delete error:", e);
  }
  return null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const subPath = path.join("/");
  const url = new URL(request.url);
  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;
  const tenantSlug = getTenantSlug(request, url);

  try {
    const body = await request.text();
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
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
    }

    const direct = await upsertNeonDirectly(subPath, tenantSlug, body);
    if (direct) {
      return NextResponse.json(direct, { status: 200 });
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    const body = await request.text().catch(() => "");
    const direct = await upsertNeonDirectly(subPath, tenantSlug, body);
    if (direct) {
      return NextResponse.json(direct, { status: 200 });
    }
    return NextResponse.json({ error: "ERP backend error: " + err.message }, { status: 502 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return POST(request, { params });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const subPath = path.join("/");
  const url = new URL(request.url);
  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;
  const tenantSlug = getTenantSlug(request, url);

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
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
    }

    const id = url.searchParams.get("id");
    if (id) {
      const direct = await deleteNeonDirectly(subPath, tenantSlug, id);
      if (direct) return NextResponse.json(direct, { status: 200 });
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    const id = url.searchParams.get("id");
    if (id) {
      const direct = await deleteNeonDirectly(subPath, tenantSlug, id);
      if (direct) return NextResponse.json(direct, { status: 200 });
    }
    return NextResponse.json({ error: "ERP backend error: " + err.message }, { status: 502 });
  }
}
