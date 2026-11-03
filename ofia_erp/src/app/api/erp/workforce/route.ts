import { NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import {
  Candidate,
  JobOpening,
  WorkforcePerson,
  AcademyCourse,
  PracticalAssignment,
  WorkforceTask,
  AttendanceRecord,
  LeaveRequest,
  CompetencyMatrixItem,
  PromotionNomination,
  WorkforceRequest,
  DeploymentAllocation,
  ClientServiceAccount,
  ServiceTicket,
  DailyWorkLog,
  CompensationScale,
  WorkforceKpis,
} from "@/lib/workforce-types";
import {
  INITIAL_JOB_OPENINGS,
  INITIAL_CANDIDATES,
  INITIAL_PEOPLE,
  INITIAL_COURSES,
  INITIAL_ASSIGNMENTS,
  INITIAL_TASKS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_COMPETENCIES,
  INITIAL_PROMOTIONS,
  INITIAL_WORKFORCE_REQUESTS,
  INITIAL_DEPLOYMENTS,
  INITIAL_CLIENTS,
  INITIAL_TICKETS,
  INITIAL_WORK_LOGS,
  INITIAL_SCALES,
} from "@/lib/workforce-defaults";

function getTenantKey(request: Request): string | null {
  const url = new URL(request.url);
  const fromHeader = request.headers.get("x-tenant-slug") || request.headers.get("x-org-id");
  if (fromHeader && fromHeader.trim() !== "") {
    return fromHeader.toLowerCase().trim();
  }
  const fromQuery =
    url.searchParams.get("tenant") ||
    url.searchParams.get("tenant_slug") ||
    url.searchParams.get("org_id");
  if (fromQuery && fromQuery.trim() !== "") {
    return fromQuery.toLowerCase().trim();
  }
  return null;
}

const ensuredTenantDbs = new Set<string>();

async function ensureWorkforceTables(sql: any, tenantSlug: string) {
  if (!sql) return;
  const cleanSlug = tenantSlug.toLowerCase().trim();

  if (!ensuredTenantDbs.has(cleanSlug)) {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS workforce_job_openings (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          title VARCHAR(255) NOT NULL,
          department VARCHAR(100) NOT NULL,
          openings INT NOT NULL DEFAULT 1,
          filled INT NOT NULL DEFAULT 0,
          location VARCHAR(191) NOT NULL,
          type VARCHAR(50) NOT NULL,
          closing_date VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'open',
          required_skills JSONB DEFAULT '[]'::jsonb,
          stipend_or_salary VARCHAR(100) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_jobs_tenant_created ON workforce_job_openings(LOWER(tenant_slug), created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_wf_jobs_tenant_status ON workforce_job_openings(LOWER(tenant_slug), status);

        CREATE TABLE IF NOT EXISTS workforce_candidates (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          applied_role VARCHAR(255) NOT NULL,
          department VARCHAR(100) NOT NULL,
          stage VARCHAR(50) NOT NULL DEFAULT 'received',
          applied_date VARCHAR(50) NOT NULL,
          score INT NOT NULL DEFAULT 0,
          experience_years INT NOT NULL DEFAULT 0,
          education VARCHAR(255) NOT NULL DEFAULT '',
          skills JSONB DEFAULT '[]'::jsonb,
          resume_url TEXT DEFAULT '',
          interview_notes TEXT DEFAULT '',
          interviewer VARCHAR(255) DEFAULT '',
          offer_amount NUMERIC(15,2) DEFAULT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_cands_tenant_created ON workforce_candidates(LOWER(tenant_slug), created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_wf_cands_tenant_stage ON workforce_candidates(LOWER(tenant_slug), stage);

        CREATE TABLE IF NOT EXISTS workforce_people (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'intern',
          designation VARCHAR(255) NOT NULL,
          department VARCHAR(100) NOT NULL,
          cohort VARCHAR(100) DEFAULT '',
          status VARCHAR(50) NOT NULL DEFAULT 'active',
          location VARCHAR(191) NOT NULL,
          join_date VARCHAR(50) NOT NULL,
          current_client VARCHAR(255) DEFAULT '',
          manager_name VARCHAR(255) NOT NULL DEFAULT '',
          competency_score INT NOT NULL DEFAULT 0,
          skills JSONB DEFAULT '[]'::jsonb,
          active_tasks_count INT NOT NULL DEFAULT 0,
          attendance_rate INT NOT NULL DEFAULT 100,
          avatar TEXT DEFAULT '',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_people_tenant_created ON workforce_people(LOWER(tenant_slug), created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_wf_people_tenant_status ON workforce_people(LOWER(tenant_slug), status);
        CREATE INDEX IF NOT EXISTS idx_wf_people_tenant_dept ON workforce_people(LOWER(tenant_slug), department);

        CREATE TABLE IF NOT EXISTS workforce_courses (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          title VARCHAR(255) NOT NULL,
          track VARCHAR(100) NOT NULL,
          code VARCHAR(50) NOT NULL,
          modules_count INT NOT NULL DEFAULT 1,
          duration_weeks INT NOT NULL DEFAULT 1,
          enrolled_learners INT NOT NULL DEFAULT 0,
          completion_rate INT NOT NULL DEFAULT 0,
          instructor VARCHAR(255) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'active',
          competencies_granted JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_courses_tenant_created ON workforce_courses(LOWER(tenant_slug), created_at DESC);

        CREATE TABLE IF NOT EXISTS workforce_assignments (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          title VARCHAR(255) NOT NULL,
          course_title VARCHAR(255) NOT NULL,
          track VARCHAR(100) NOT NULL,
          assignee_name VARCHAR(255) NOT NULL,
          deadline VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'pending',
          score INT DEFAULT NULL,
          feedback TEXT DEFAULT '',
          submission_date VARCHAR(50) DEFAULT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_assigns_tenant_created ON workforce_assignments(LOWER(tenant_slug), created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_wf_assigns_tenant_status ON workforce_assignments(LOWER(tenant_slug), status);

        CREATE TABLE IF NOT EXISTS workforce_tasks (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          title VARCHAR(255) NOT NULL,
          project VARCHAR(255) NOT NULL,
          department VARCHAR(100) NOT NULL,
          assigned_to VARCHAR(255) NOT NULL,
          supervisor VARCHAR(255) NOT NULL,
          priority VARCHAR(50) NOT NULL DEFAULT 'medium',
          status VARCHAR(50) NOT NULL DEFAULT 'backlog',
          deadline VARCHAR(50) NOT NULL,
          score INT DEFAULT NULL,
          feedback TEXT DEFAULT '',
          deliverable_summary TEXT DEFAULT '',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_tasks_tenant_created ON workforce_tasks(LOWER(tenant_slug), created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_wf_tasks_tenant_status ON workforce_tasks(LOWER(tenant_slug), status);

        CREATE TABLE IF NOT EXISTS workforce_attendance (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          person_name VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL,
          date VARCHAR(50) NOT NULL,
          clock_in VARCHAR(50) NOT NULL,
          clock_out VARCHAR(50) DEFAULT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'present',
          location VARCHAR(255) NOT NULL,
          verified_gps BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_att_tenant_created ON workforce_attendance(LOWER(tenant_slug), created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_wf_att_tenant_date ON workforce_attendance(LOWER(tenant_slug), date);

        CREATE TABLE IF NOT EXISTS workforce_leave_requests (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          person_name VARCHAR(255) NOT NULL,
          department VARCHAR(100) NOT NULL,
          leave_type VARCHAR(50) NOT NULL,
          start_date VARCHAR(50) NOT NULL,
          end_date VARCHAR(50) NOT NULL,
          days_count INT NOT NULL DEFAULT 1,
          reason TEXT NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_leave_tenant_created ON workforce_leave_requests(LOWER(tenant_slug), created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_wf_leave_tenant_status ON workforce_leave_requests(LOWER(tenant_slug), status);

        CREATE TABLE IF NOT EXISTS workforce_competencies (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          competency VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          required_level VARCHAR(50) NOT NULL,
          total_certified_people INT NOT NULL DEFAULT 0,
          in_training_people INT NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_comp_tenant_created ON workforce_competencies(LOWER(tenant_slug), created_at DESC);

        CREATE TABLE IF NOT EXISTS workforce_promotions (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          person_name VARCHAR(255) NOT NULL,
          current_designation VARCHAR(255) NOT NULL,
          proposed_designation VARCHAR(255) NOT NULL,
          department VARCHAR(100) NOT NULL,
          nominated_by VARCHAR(255) NOT NULL,
          tenure_months INT NOT NULL DEFAULT 0,
          competency_rating INT NOT NULL DEFAULT 0,
          status VARCHAR(50) NOT NULL DEFAULT 'under_review',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_promo_tenant_created ON workforce_promotions(LOWER(tenant_slug), created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_wf_promo_tenant_status ON workforce_promotions(LOWER(tenant_slug), status);

        CREATE TABLE IF NOT EXISTS workforce_requests (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          client_name VARCHAR(255) NOT NULL,
          contract_title VARCHAR(255) NOT NULL,
          required_headcount INT NOT NULL DEFAULT 1,
          fulfilled_headcount INT NOT NULL DEFAULT 0,
          required_skills JSONB DEFAULT '[]'::jsonb,
          duration_months INT NOT NULL DEFAULT 1,
          location VARCHAR(255) NOT NULL,
          start_date VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'open',
          supervisor VARCHAR(255) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_req_tenant_created ON workforce_requests(LOWER(tenant_slug), created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_wf_req_tenant_status ON workforce_requests(LOWER(tenant_slug), status);

        CREATE TABLE IF NOT EXISTS workforce_deployments (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          person_id VARCHAR(64) NOT NULL,
          person_name VARCHAR(255) NOT NULL,
          role VARCHAR(255) NOT NULL,
          client_name VARCHAR(255) NOT NULL,
          contract_title VARCHAR(255) NOT NULL,
          start_date VARCHAR(50) NOT NULL,
          end_date VARCHAR(50) NOT NULL,
          allocation_percent INT NOT NULL DEFAULT 100,
          status VARCHAR(50) NOT NULL DEFAULT 'active',
          billing_rate_monthly NUMERIC(15,2) NOT NULL DEFAULT 0,
          cost_rate_monthly NUMERIC(15,2) NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_dep_tenant_created ON workforce_deployments(LOWER(tenant_slug), created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_wf_dep_tenant_status ON workforce_deployments(LOWER(tenant_slug), status);

        CREATE TABLE IF NOT EXISTS workforce_clients (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          client_name VARCHAR(255) NOT NULL,
          industry VARCHAR(100) NOT NULL,
          active_contracts_count INT NOT NULL DEFAULT 1,
          deployed_staff_count INT NOT NULL DEFAULT 1,
          monthly_contract_value NUMERIC(15,2) NOT NULL DEFAULT 0,
          sla_target_hours INT NOT NULL DEFAULT 4,
          sla_compliance_percent INT NOT NULL DEFAULT 100,
          account_manager VARCHAR(255) NOT NULL,
          health VARCHAR(50) NOT NULL DEFAULT 'healthy',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_cli_tenant_created ON workforce_clients(LOWER(tenant_slug), created_at DESC);

        CREATE TABLE IF NOT EXISTS workforce_tickets (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          ticket_number VARCHAR(100) NOT NULL,
          client_name VARCHAR(255) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          priority VARCHAR(50) NOT NULL DEFAULT 'P2',
          assigned_specialist VARCHAR(255) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'open',
          sla_minutes_remaining INT NOT NULL DEFAULT 120,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_tick_tenant_created ON workforce_tickets(LOWER(tenant_slug), created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_wf_tick_tenant_status ON workforce_tickets(LOWER(tenant_slug), status);

        CREATE TABLE IF NOT EXISTS workforce_work_logs (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          person_name VARCHAR(255) NOT NULL,
          client_name VARCHAR(255) NOT NULL,
          date VARCHAR(50) NOT NULL,
          hours_worked NUMERIC(6,2) NOT NULL DEFAULT 8,
          summary TEXT NOT NULL,
          supervisor_signed_off BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_logs_tenant_created ON workforce_work_logs(LOWER(tenant_slug), created_at DESC);

        CREATE TABLE IF NOT EXISTS workforce_compensation_scales (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          tier VARCHAR(100) NOT NULL,
          category VARCHAR(50) NOT NULL,
          monthly_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
          allowance NUMERIC(15,2) NOT NULL DEFAULT 0,
          total_monthly NUMERIC(15,2) NOT NULL DEFAULT 0,
          active_recipients INT NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_comp_scale_tenant_created ON workforce_compensation_scales(LOWER(tenant_slug), created_at DESC);
      `;
      ensuredTenantDbs.add(cleanSlug);
    } catch (e: any) {
      console.warn(`[Workforce DB] Table bootstrap notice for '${cleanSlug}':`, e.message);
    }
  }

  // Check if tenant has initial workforce records; seed if freshly created
  try {
    const existing = await sql`
      SELECT COUNT(*)::int as cnt FROM workforce_job_openings
      WHERE LOWER(tenant_slug) = ${cleanSlug};
    `;

    if (Number(existing[0]?.cnt || 0) === 0) {
      // 1. Seed Job Openings
      for (const j of INITIAL_JOB_OPENINGS) {
        await sql`
          INSERT INTO workforce_job_openings (
            id, tenant_slug, tenant_id, title, department, openings, filled,
            location, type, closing_date, status, required_skills, stipend_or_salary
          ) VALUES (
            ${j.id}, ${cleanSlug}, ${cleanSlug}, ${j.title}, ${j.department}, ${j.openings}, ${j.filled},
            ${j.location}, ${j.type}, ${j.closingDate}, ${j.status}, ${JSON.stringify(j.requiredSkills)}, ${j.stipendOrSalary}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      // 2. Seed Candidates
      for (const c of INITIAL_CANDIDATES) {
        await sql`
          INSERT INTO workforce_candidates (
            id, tenant_slug, tenant_id, name, email, phone, applied_role,
            department, stage, applied_date, score, experience_years, education,
            skills, interviewer, offer_amount
          ) VALUES (
            ${c.id}, ${cleanSlug}, ${cleanSlug}, ${c.name}, ${c.email}, ${c.phone}, ${c.appliedRole},
            ${c.department}, ${c.stage}, ${c.appliedDate}, ${c.score}, ${c.experienceYears}, ${c.education},
            ${JSON.stringify(c.skills)}, ${c.interviewer || ""}, ${c.offerAmount ?? null}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      // 3. Seed People
      for (const p of INITIAL_PEOPLE) {
        await sql`
          INSERT INTO workforce_people (
            id, tenant_slug, tenant_id, name, email, phone, role, designation,
            department, cohort, status, location, join_date, current_client,
            manager_name, competency_score, skills, active_tasks_count, attendance_rate
          ) VALUES (
            ${p.id}, ${cleanSlug}, ${cleanSlug}, ${p.name}, ${p.email}, ${p.phone}, ${p.role}, ${p.designation},
            ${p.department}, ${p.cohort || ""}, ${p.status}, ${p.location}, ${p.joinDate}, ${p.currentClient || ""},
            ${p.managerName}, ${p.competencyScore}, ${JSON.stringify(p.skills)}, ${p.activeTasksCount}, ${p.attendanceRate}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      // 4. Seed Courses
      for (const co of INITIAL_COURSES) {
        await sql`
          INSERT INTO workforce_courses (
            id, tenant_slug, tenant_id, title, track, code, modules_count,
            duration_weeks, enrolled_learners, completion_rate, instructor, status, competencies_granted
          ) VALUES (
            ${co.id}, ${cleanSlug}, ${cleanSlug}, ${co.title}, ${co.track}, ${co.code}, ${co.modulesCount},
            ${co.durationWeeks}, ${co.enrolledLearners}, ${co.completionRate}, ${co.instructor}, ${co.status}, ${JSON.stringify(co.competenciesGranted)}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      // 5. Seed Assignments
      for (const a of INITIAL_ASSIGNMENTS) {
        await sql`
          INSERT INTO workforce_assignments (
            id, tenant_slug, tenant_id, title, course_title, track,
            assignee_name, deadline, status, score, feedback, submission_date
          ) VALUES (
            ${a.id}, ${cleanSlug}, ${cleanSlug}, ${a.title}, ${a.courseTitle}, ${a.track},
            ${a.assigneeName}, ${a.deadline}, ${a.status}, ${a.score ?? null}, ${a.feedback || ""}, ${a.submissionDate || null}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      // 6. Seed Tasks
      for (const t of INITIAL_TASKS) {
        await sql`
          INSERT INTO workforce_tasks (
            id, tenant_slug, tenant_id, title, project, department,
            assigned_to, supervisor, priority, status, deadline, score, feedback, deliverable_summary
          ) VALUES (
            ${t.id}, ${cleanSlug}, ${cleanSlug}, ${t.title}, ${t.project}, ${t.department},
            ${t.assignedTo}, ${t.supervisor}, ${t.priority}, ${t.status}, ${t.deadline}, ${t.score ?? null}, ${t.feedback || ""}, ${t.deliverableSummary || ""}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      // 7. Seed Attendance
      for (const at of INITIAL_ATTENDANCE) {
        await sql`
          INSERT INTO workforce_attendance (
            id, tenant_slug, tenant_id, person_name, role, date,
            clock_in, clock_out, status, location, verified_gps
          ) VALUES (
            ${at.id}, ${cleanSlug}, ${cleanSlug}, ${at.personName}, ${at.role}, ${at.date},
            ${at.clockIn}, ${at.clockOut || null}, ${at.status}, ${at.location}, ${at.verifiedGps}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      // 8. Seed Leave
      for (const l of INITIAL_LEAVE_REQUESTS) {
        await sql`
          INSERT INTO workforce_leave_requests (
            id, tenant_slug, tenant_id, person_name, department,
            leave_type, start_date, end_date, days_count, reason, status
          ) VALUES (
            ${l.id}, ${cleanSlug}, ${cleanSlug}, ${l.personName}, ${l.department},
            ${l.leaveType}, ${l.startDate}, ${l.endDate}, ${l.daysCount}, ${l.reason}, ${l.status}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      // 9. Seed Competencies
      for (const cm of INITIAL_COMPETENCIES) {
        await sql`
          INSERT INTO workforce_competencies (
            id, tenant_slug, tenant_id, competency, category,
            required_level, total_certified_people, in_training_people
          ) VALUES (
            ${cm.id}, ${cleanSlug}, ${cleanSlug}, ${cm.competency}, ${cm.category},
            ${cm.requiredLevel}, ${cm.totalCertifiedPeople}, ${cm.inTrainingPeople}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      // 10. Seed Promotions
      for (const pr of INITIAL_PROMOTIONS) {
        await sql`
          INSERT INTO workforce_promotions (
            id, tenant_slug, tenant_id, person_name, current_designation,
            proposed_designation, department, nominated_by, tenure_months, competency_rating, status
          ) VALUES (
            ${pr.id}, ${cleanSlug}, ${cleanSlug}, ${pr.personName}, ${pr.currentDesignation},
            ${pr.proposedDesignation}, ${pr.department}, ${pr.nominatedBy}, ${pr.tenureMonths}, ${pr.competencyRating}, ${pr.status}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      // 11. Seed Requests
      for (const wr of INITIAL_WORKFORCE_REQUESTS) {
        await sql`
          INSERT INTO workforce_requests (
            id, tenant_slug, tenant_id, client_name, contract_title,
            required_headcount, fulfilled_headcount, required_skills, duration_months,
            location, start_date, status, supervisor
          ) VALUES (
            ${wr.id}, ${cleanSlug}, ${cleanSlug}, ${wr.clientName}, ${wr.contractTitle},
            ${wr.requiredHeadcount}, ${wr.fulfilledHeadcount}, ${JSON.stringify(wr.requiredSkills)}, ${wr.durationMonths},
            ${wr.location}, ${wr.startDate}, ${wr.status}, ${wr.supervisor}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      // 12. Seed Deployments
      for (const d of INITIAL_DEPLOYMENTS) {
        await sql`
          INSERT INTO workforce_deployments (
            id, tenant_slug, tenant_id, person_id, person_name, role,
            client_name, contract_title, start_date, end_date, allocation_percent,
            status, billing_rate_monthly, cost_rate_monthly
          ) VALUES (
            ${d.id}, ${cleanSlug}, ${cleanSlug}, ${d.personId}, ${d.personName}, ${d.role},
            ${d.clientName}, ${d.contractTitle}, ${d.startDate}, ${d.endDate}, ${d.allocationPercent},
            ${d.status}, ${d.billingRateMonthly}, ${d.costRateMonthly}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      // 13. Seed Clients
      for (const cl of INITIAL_CLIENTS) {
        await sql`
          INSERT INTO workforce_clients (
            id, tenant_slug, tenant_id, client_name, industry,
            active_contracts_count, deployed_staff_count, monthly_contract_value,
            sla_target_hours, sla_compliance_percent, account_manager, health
          ) VALUES (
            ${cl.id}, ${cleanSlug}, ${cleanSlug}, ${cl.clientName}, ${cl.industry},
            ${cl.activeContractsCount}, ${cl.deployedStaffCount}, ${cl.monthlyContractValue},
            ${cl.slaTargetHours}, ${cl.slaCompliancePercent}, ${cl.accountManager}, ${cl.health}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      // 14. Seed Tickets
      for (const tk of INITIAL_TICKETS) {
        await sql`
          INSERT INTO workforce_tickets (
            id, tenant_slug, tenant_id, ticket_number, client_name,
            subject, priority, assigned_specialist, status, sla_minutes_remaining
          ) VALUES (
            ${tk.id}, ${cleanSlug}, ${cleanSlug}, ${tk.ticketNumber}, ${tk.clientName},
            ${tk.subject}, ${tk.priority}, ${tk.assignedSpecialist}, ${tk.status}, ${tk.slaMinutesRemaining}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      // 15. Seed Logs
      for (const wl of INITIAL_WORK_LOGS) {
        await sql`
          INSERT INTO workforce_work_logs (
            id, tenant_slug, tenant_id, person_name, client_name,
            date, hours_worked, summary, supervisor_signed_off
          ) VALUES (
            ${wl.id}, ${cleanSlug}, ${cleanSlug}, ${wl.personName}, ${wl.clientName},
            ${wl.date}, ${wl.hoursWorked}, ${wl.summary}, ${wl.supervisorSignedOff}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      // 16. Seed Scales
      for (const sc of INITIAL_SCALES) {
        await sql`
          INSERT INTO workforce_compensation_scales (
            id, tenant_slug, tenant_id, tier, category,
            monthly_amount, allowance, total_monthly, active_recipients
          ) VALUES (
            ${sc.id}, ${cleanSlug}, ${cleanSlug}, ${sc.tier}, ${sc.category},
            ${sc.monthlyAmount}, ${sc.allowance}, ${sc.totalMonthly}, ${sc.activeRecipients}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }
    }
  } catch (err: any) {
    console.warn(`[Workforce DB] Initial seed notice for '${cleanSlug}':`, err.message);
  }
}

export async function GET(request: Request) {
  const tenantKey = getTenantKey(request);

  if (!tenantKey) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  const cleanSlug = tenantKey.toLowerCase().trim();

  try {
    const sql = await getTenantSql(cleanSlug);
    await ensureWorkforceTables(sql, cleanSlug);

    const [
      jobsRows,
      candidatesRows,
      peopleRows,
      coursesRows,
      assignmentsRows,
      tasksRows,
      attendanceRows,
      leaveRows,
      competenciesRows,
      promotionsRows,
      requestsRows,
      deploymentsRows,
      clientsRows,
      ticketsRows,
      workLogsRows,
      scalesRows,
    ] = await Promise.all([
      sql`SELECT * FROM workforce_job_openings WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
      sql`SELECT * FROM workforce_candidates WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
      sql`SELECT * FROM workforce_people WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
      sql`SELECT * FROM workforce_courses WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
      sql`SELECT * FROM workforce_assignments WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
      sql`SELECT * FROM workforce_tasks WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
      sql`SELECT * FROM workforce_attendance WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC LIMIT 50;`,
      sql`SELECT * FROM workforce_leave_requests WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
      sql`SELECT * FROM workforce_competencies WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
      sql`SELECT * FROM workforce_promotions WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
      sql`SELECT * FROM workforce_requests WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
      sql`SELECT * FROM workforce_deployments WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
      sql`SELECT * FROM workforce_clients WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
      sql`SELECT * FROM workforce_tickets WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
      sql`SELECT * FROM workforce_work_logs WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC LIMIT 50;`,
      sql`SELECT * FROM workforce_compensation_scales WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
    ]);

    // Map rows to typed models
    const jobOpenings: JobOpening[] = jobsRows.map((r: any) => ({
      id: r.id,
      title: r.title,
      department: r.department,
      openings: Number(r.openings || 1),
      filled: Number(r.filled || 0),
      location: r.location,
      type: r.type,
      closingDate: r.closing_date,
      status: r.status,
      requiredSkills: Array.isArray(r.required_skills) ? r.required_skills : [],
      stipendOrSalary: r.stipend_or_salary,
    }));

    const candidates: Candidate[] = candidatesRows.map((r: any) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      appliedRole: r.applied_role,
      department: r.department,
      stage: r.stage,
      appliedDate: r.applied_date,
      score: Number(r.score || 0),
      experienceYears: Number(r.experience_years || 0),
      education: r.education || "",
      skills: Array.isArray(r.skills) ? r.skills : [],
      resumeUrl: r.resume_url || undefined,
      interviewNotes: r.interview_notes || undefined,
      interviewer: r.interviewer || undefined,
      offerAmount: r.offer_amount != null ? Number(r.offer_amount) : undefined,
    }));

    const people: WorkforcePerson[] = peopleRows.map((r: any) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      role: r.role,
      designation: r.designation,
      department: r.department,
      cohort: r.cohort || undefined,
      status: r.status,
      location: r.location,
      joinDate: r.join_date,
      currentClient: r.current_client || undefined,
      managerName: r.manager_name,
      competencyScore: Number(r.competency_score || 0),
      skills: Array.isArray(r.skills) ? r.skills : [],
      activeTasksCount: Number(r.active_tasks_count || 0),
      attendanceRate: Number(r.attendance_rate || 100),
      avatar: r.avatar || undefined,
    }));

    const courses: AcademyCourse[] = coursesRows.map((r: any) => ({
      id: r.id,
      title: r.title,
      track: r.track,
      code: r.code,
      modulesCount: Number(r.modules_count || 1),
      durationWeeks: Number(r.duration_weeks || 1),
      enrolledLearners: Number(r.enrolled_learners || 0),
      completionRate: Number(r.completion_rate || 0),
      instructor: r.instructor,
      status: r.status,
      competenciesGranted: Array.isArray(r.competencies_granted) ? r.competencies_granted : [],
    }));

    const assignments: PracticalAssignment[] = assignmentsRows.map((r: any) => ({
      id: r.id,
      title: r.title,
      courseTitle: r.course_title,
      track: r.track,
      assigneeName: r.assignee_name,
      deadline: r.deadline,
      status: r.status,
      score: r.score != null ? Number(r.score) : undefined,
      feedback: r.feedback || undefined,
      submissionDate: r.submission_date || undefined,
    }));

    const tasks: WorkforceTask[] = tasksRows.map((r: any) => ({
      id: r.id,
      title: r.title,
      project: r.project,
      department: r.department,
      assignedTo: r.assigned_to,
      supervisor: r.supervisor,
      priority: r.priority,
      status: r.status,
      deadline: r.deadline,
      score: r.score != null ? Number(r.score) : undefined,
      feedback: r.feedback || undefined,
      deliverableSummary: r.deliverable_summary || undefined,
    }));

    const attendance: AttendanceRecord[] = attendanceRows.map((r: any) => ({
      id: r.id,
      personName: r.person_name,
      role: r.role,
      date: r.date,
      clockIn: r.clock_in,
      clockOut: r.clock_out || undefined,
      status: r.status,
      location: r.location,
      verifiedGps: Boolean(r.verified_gps),
    }));

    const leaveRequests: LeaveRequest[] = leaveRows.map((r: any) => ({
      id: r.id,
      personName: r.person_name,
      department: r.department,
      leaveType: r.leave_type,
      startDate: r.start_date,
      endDate: r.end_date,
      daysCount: Number(r.days_count || 1),
      reason: r.reason,
      status: r.status,
    }));

    const competencies: CompetencyMatrixItem[] = competenciesRows.map((r: any) => ({
      id: r.id,
      competency: r.competency,
      category: r.category,
      requiredLevel: r.required_level,
      totalCertifiedPeople: Number(r.total_certified_people || 0),
      inTrainingPeople: Number(r.in_training_people || 0),
    }));

    const promotions: PromotionNomination[] = promotionsRows.map((r: any) => ({
      id: r.id,
      personName: r.person_name,
      currentDesignation: r.current_designation,
      proposedDesignation: r.proposed_designation,
      department: r.department,
      nominatedBy: r.nominated_by,
      tenureMonths: Number(r.tenure_months || 0),
      competencyRating: Number(r.competency_rating || 0),
      status: r.status,
    }));

    const workforceRequests: WorkforceRequest[] = requestsRows.map((r: any) => ({
      id: r.id,
      clientName: r.client_name,
      contractTitle: r.contract_title,
      requiredHeadcount: Number(r.required_headcount || 1),
      fulfilledHeadcount: Number(r.fulfilled_headcount || 0),
      requiredSkills: Array.isArray(r.required_skills) ? r.required_skills : [],
      durationMonths: Number(r.duration_months || 1),
      location: r.location,
      startDate: r.start_date,
      status: r.status,
      supervisor: r.supervisor,
    }));

    const deployments: DeploymentAllocation[] = deploymentsRows.map((r: any) => ({
      id: r.id,
      personId: r.person_id,
      personName: r.person_name,
      role: r.role,
      clientName: r.client_name,
      contractTitle: r.contract_title,
      startDate: r.start_date,
      endDate: r.end_date,
      allocationPercent: Number(r.allocation_percent || 100),
      status: r.status,
      billingRateMonthly: Number(r.billing_rate_monthly || 0),
      costRateMonthly: Number(r.cost_rate_monthly || 0),
    }));

    const clients: ClientServiceAccount[] = clientsRows.map((r: any) => ({
      id: r.id,
      clientName: r.client_name,
      industry: r.industry,
      activeContractsCount: Number(r.active_contracts_count || 1),
      deployedStaffCount: Number(r.deployed_staff_count || 0),
      monthlyContractValue: Number(r.monthly_contract_value || 0),
      slaTargetHours: Number(r.sla_target_hours || 4),
      slaCompliancePercent: Number(r.sla_compliance_percent || 100),
      accountManager: r.account_manager,
      health: r.health,
    }));

    const tickets: ServiceTicket[] = ticketsRows.map((r: any) => ({
      id: r.id,
      ticketNumber: r.ticket_number,
      clientName: r.client_name,
      subject: r.subject,
      priority: r.priority,
      assignedSpecialist: r.assigned_specialist,
      status: r.status,
      createdAt: r.created_at ? new Date(r.created_at).toLocaleString() : "",
      slaMinutesRemaining: Number(r.sla_minutes_remaining || 0),
    }));

    const workLogs: DailyWorkLog[] = workLogsRows.map((r: any) => ({
      id: r.id,
      personName: r.person_name,
      clientName: r.client_name,
      date: r.date,
      hoursWorked: Number(r.hours_worked || 8),
      summary: r.summary,
      supervisorSignedOff: Boolean(r.supervisor_signed_off),
    }));

    const compensationScales: CompensationScale[] = scalesRows.map((r: any) => ({
      id: r.id,
      tier: r.tier,
      category: r.category,
      monthlyAmount: Number(r.monthly_amount || 0),
      allowance: Number(r.allowance || 0),
      totalMonthly: Number(r.total_monthly || 0),
      activeRecipients: Number(r.active_recipients || 0),
    }));

    // Dynamic KPI Computation
    const totalWorkforce = people.length;
    const activeEmployees = people.filter((p) => p.role === "employee").length;
    const activeInterns = people.filter((p) => p.role === "intern").length;
    const activeContractors = people.filter(
      (p) => p.role === "contractor" || p.role === "consultant"
    ).length;
    const currentlyDeployed = people.filter((p) => p.status === "deployed").length;
    const availableBench = people.filter((p) => p.status === "bench" || p.status === "active").length;
    const utilizationRatePercent = totalWorkforce > 0
      ? Math.round((currentlyDeployed / totalWorkforce) * 100)
      : 0;
    const openVacancies = jobOpenings.reduce(
      (sum, j) => sum + Math.max(0, j.openings - j.filled),
      0
    );
    const monthlyCost = compensationScales.reduce(
      (sum, s) => sum + s.totalMonthly * s.activeRecipients,
      0
    );
    const monthlyClientBilledRevenue = clients.reduce(
      (sum, c) => sum + c.monthlyContractValue,
      0
    );
    const grossMarginPercent = monthlyClientBilledRevenue > 0
      ? Math.round(
          ((monthlyClientBilledRevenue - monthlyCost) / monthlyClientBilledRevenue) * 100
        )
      : 0;

    const avgSla = clients.length > 0
      ? Number(
          (
            clients.reduce((acc, c) => acc + c.slaCompliancePercent, 0) / clients.length
          ).toFixed(1)
        )
      : 98.5;

    const kpis: WorkforceKpis = {
      totalWorkforce,
      activeEmployees,
      activeInterns,
      activeContractors,
      currentlyDeployed,
      availableBench,
      utilizationRatePercent,
      openVacancies,
      timeToHireDays: 18,
      timeToCompetenceWeeks: 3.5,
      averageSlaCompliancePercent: avgSla,
      monthlyCost,
      monthlyClientBilledRevenue,
      grossMarginPercent,
    };

    return NextResponse.json({
      success: true,
      tenant: cleanSlug,
      jobOpenings,
      candidates,
      people,
      courses,
      assignments,
      tasks,
      attendance,
      leaveRequests,
      competencies,
      promotions,
      workforceRequests,
      deployments,
      clients,
      tickets,
      workLogs,
      compensationScales,
      kpis,
    });
  } catch (err: any) {
    console.error(`[Workforce API] Error fetching data for tenant '${cleanSlug}':`, err);
    return NextResponse.json(
      { success: false, error: "Failed to query workforce data: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const tenantKey = getTenantKey(request);

  if (!tenantKey) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  const cleanSlug = tenantKey.toLowerCase().trim();

  try {
    const body = await request.json();
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Missing required 'action' parameter" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(cleanSlug);
    await ensureWorkforceTables(sql, cleanSlug);

    switch (action) {
      case "CREATE_JOB": {
        const id = payload.id || `job-${Date.now()}`;
        await sql`
          INSERT INTO workforce_job_openings (
            id, tenant_slug, tenant_id, title, department, openings, filled,
            location, type, closing_date, status, required_skills, stipend_or_salary
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.title}, ${payload.department},
            ${payload.openings || 1}, ${payload.filled || 0}, ${payload.location},
            ${payload.type || "intern"}, ${payload.closingDate}, ${payload.status || "open"},
            ${JSON.stringify(payload.requiredSkills || [])}, ${payload.stipendOrSalary}
          );
        `;
        return NextResponse.json({ success: true, id, message: "Job opening created successfully" });
      }

      case "UPDATE_CANDIDATE_STAGE": {
        await sql`
          UPDATE workforce_candidates
          SET stage = ${payload.stage}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${payload.candidateId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        return NextResponse.json({ success: true, message: "Candidate stage updated" });
      }

      case "ONBOARD_CANDIDATE": {
        // Blueprint Section 6.C: Candidate transforms into permanent person record
        const candidateRows = await sql`
          SELECT * FROM workforce_candidates
          WHERE id = ${payload.candidateId} AND LOWER(tenant_slug) = ${cleanSlug}
          LIMIT 1;
        `;
        if (!candidateRows.length) {
          return NextResponse.json({ success: false, error: "Candidate not found" }, { status: 404 });
        }
        const c = candidateRows[0];
        const personId = `person-${Date.now()}`;
        const role = payload.roleCategory || "intern";
        const designation = `${c.applied_role} (Onboarded)`;
        const joinDate = new Date().toISOString().split("T")[0];
        const parsedSkills = Array.isArray(c.skills) ? c.skills : [];
        const personSkills = parsedSkills.map((s: string) => ({
          name: s,
          level: "Intermediate",
          verified: true,
        }));

        await sql`
          UPDATE workforce_candidates
          SET stage = 'onboarded', updated_at = CURRENT_TIMESTAMP
          WHERE id = ${payload.candidateId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;

        await sql`
          INSERT INTO workforce_people (
            id, tenant_slug, tenant_id, name, email, phone, role, designation,
            department, status, location, join_date, manager_name, competency_score,
            skills, active_tasks_count, attendance_rate
          ) VALUES (
            ${personId}, ${cleanSlug}, ${cleanSlug}, ${c.name}, ${c.email}, ${c.phone},
            ${role}, ${designation}, ${c.department}, 'active', 'Lagos Headquarters',
            ${joinDate}, ${c.interviewer || "Department Head"}, ${c.score || 80},
            ${JSON.stringify(personSkills)}, 0, 100
          );
        `;

        return NextResponse.json({ success: true, personId, message: "Candidate onboarded into workforce directory" });
      }

      case "CREATE_PERSON": {
        const id = payload.id || `person-${Date.now()}`;
        await sql`
          INSERT INTO workforce_people (
            id, tenant_slug, tenant_id, name, email, phone, role, designation,
            department, cohort, status, location, join_date, current_client,
            manager_name, competency_score, skills, active_tasks_count, attendance_rate
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.name}, ${payload.email}, ${payload.phone},
            ${payload.role || "intern"}, ${payload.designation}, ${payload.department},
            ${payload.cohort || ""}, ${payload.status || "active"}, ${payload.location},
            ${payload.joinDate || new Date().toISOString().split("T")[0]}, ${payload.currentClient || ""},
            ${payload.managerName || ""}, ${payload.competencyScore || 0},
            ${JSON.stringify(payload.skills || [])}, ${payload.activeTasksCount || 0}, ${payload.attendanceRate || 100}
          );
        `;
        return NextResponse.json({ success: true, id, message: "Workforce member registered" });
      }

      case "CREATE_COURSE": {
        const id = payload.id || `course-${Date.now()}`;
        await sql`
          INSERT INTO workforce_courses (
            id, tenant_slug, tenant_id, title, track, code, modules_count,
            duration_weeks, enrolled_learners, completion_rate, instructor, status, competencies_granted
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.title}, ${payload.track}, ${payload.code},
            ${payload.modulesCount || 1}, ${payload.durationWeeks || 1}, ${payload.enrolledLearners || 0},
            ${payload.completionRate || 0}, ${payload.instructor}, ${payload.status || "active"},
            ${JSON.stringify(payload.competenciesGranted || [])}
          );
        `;
        return NextResponse.json({ success: true, id, message: "Academy course published" });
      }

      case "GRADE_ASSIGNMENT": {
        await sql`
          UPDATE workforce_assignments
          SET score = ${payload.score}, feedback = ${payload.feedback || ""},
              status = 'approved', updated_at = CURRENT_TIMESTAMP
          WHERE id = ${payload.assignmentId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        return NextResponse.json({ success: true, message: "Assignment graded successfully" });
      }

      case "CREATE_TASK": {
        const id = payload.id || `task-${Date.now()}`;
        await sql`
          INSERT INTO workforce_tasks (
            id, tenant_slug, tenant_id, title, project, department,
            assigned_to, supervisor, priority, status, deadline, score, feedback, deliverable_summary
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.title}, ${payload.project}, ${payload.department},
            ${payload.assignedTo}, ${payload.supervisor}, ${payload.priority || "medium"},
            ${payload.status || "backlog"}, ${payload.deadline}, ${payload.score ?? null},
            ${payload.feedback || ""}, ${payload.deliverableSummary || ""}
          );
        `;
        return NextResponse.json({ success: true, id, message: "Task assigned" });
      }

      case "UPDATE_TASK_STATUS": {
        await sql`
          UPDATE workforce_tasks
          SET status = ${payload.status},
              score = COALESCE(${payload.score ?? null}, score),
              feedback = COALESCE(${payload.feedback ?? null}, feedback),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${payload.taskId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        return NextResponse.json({ success: true, message: "Task status updated" });
      }

      case "CLOCK_IN": {
        const id = `att-${Date.now()}`;
        await sql`
          INSERT INTO workforce_attendance (
            id, tenant_slug, tenant_id, person_name, role, date,
            clock_in, status, location, verified_gps
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.personName}, ${payload.role || "intern"},
            ${payload.date}, ${payload.clockIn}, ${payload.status || "present"},
            ${payload.location}, ${payload.verifiedGps ?? true}
          );
        `;
        return NextResponse.json({ success: true, id, message: "Clock in recorded" });
      }

      case "CLOCK_OUT": {
        await sql`
          UPDATE workforce_attendance
          SET clock_out = ${payload.clockOut}
          WHERE id = ${payload.attendanceId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        return NextResponse.json({ success: true, message: "Clock out recorded" });
      }

      case "CREATE_LEAVE_REQUEST": {
        const id = payload.id || `leave-${Date.now()}`;
        await sql`
          INSERT INTO workforce_leave_requests (
            id, tenant_slug, tenant_id, person_name, department,
            leave_type, start_date, end_date, days_count, reason, status
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.personName}, ${payload.department},
            ${payload.leaveType}, ${payload.startDate}, ${payload.endDate},
            ${payload.daysCount || 1}, ${payload.reason}, 'pending'
          );
        `;
        return NextResponse.json({ success: true, id, message: "Leave request submitted" });
      }

      case "UPDATE_LEAVE_STATUS": {
        await sql`
          UPDATE workforce_leave_requests
          SET status = ${payload.status}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${payload.leaveId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        return NextResponse.json({ success: true, message: "Leave status updated" });
      }

      case "NOMINATE_PROMOTION": {
        const id = payload.id || `promo-${Date.now()}`;
        await sql`
          INSERT INTO workforce_promotions (
            id, tenant_slug, tenant_id, person_name, current_designation,
            proposed_designation, department, nominated_by, tenure_months, competency_rating, status
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.personName}, ${payload.currentDesignation},
            ${payload.proposedDesignation}, ${payload.department}, ${payload.nominatedBy},
            ${payload.tenureMonths || 0}, ${payload.competencyRating || 0}, 'under_review'
          );
        `;
        return NextResponse.json({ success: true, id, message: "Promotion nominated" });
      }

      case "CREATE_WORKFORCE_REQUEST": {
        const id = payload.id || `req-${Date.now()}`;
        await sql`
          INSERT INTO workforce_requests (
            id, tenant_slug, tenant_id, client_name, contract_title,
            required_headcount, fulfilled_headcount, required_skills, duration_months,
            location, start_date, status, supervisor
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.clientName}, ${payload.contractTitle},
            ${payload.requiredHeadcount || 1}, 0, ${JSON.stringify(payload.requiredSkills || [])},
            ${payload.durationMonths || 1}, ${payload.location}, ${payload.startDate},
            'open', ${payload.supervisor}
          );
        `;
        return NextResponse.json({ success: true, id, message: "Workforce deployment request created" });
      }

      case "CREATE_DEPLOYMENT": {
        const id = payload.id || `dep-${Date.now()}`;
        await sql`
          INSERT INTO workforce_deployments (
            id, tenant_slug, tenant_id, person_id, person_name, role,
            client_name, contract_title, start_date, end_date, allocation_percent,
            status, billing_rate_monthly, cost_rate_monthly
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.personId}, ${payload.personName},
            ${payload.role}, ${payload.clientName}, ${payload.contractTitle},
            ${payload.startDate}, ${payload.endDate}, ${payload.allocationPercent || 100},
            'active', ${payload.billingRateMonthly || 0}, ${payload.costRateMonthly || 0}
          );
        `;

        // Update the person's status to deployed
        await sql`
          UPDATE workforce_people
          SET status = 'deployed', current_client = ${payload.clientName}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${payload.personId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;

        return NextResponse.json({ success: true, id, message: "Staff deployed to client engagement" });
      }

      case "CREATE_CLIENT": {
        const id = payload.id || `client-${Date.now()}`;
        await sql`
          INSERT INTO workforce_clients (
            id, tenant_slug, tenant_id, client_name, industry,
            active_contracts_count, deployed_staff_count, monthly_contract_value,
            sla_target_hours, sla_compliance_percent, account_manager, health
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.clientName}, ${payload.industry},
            ${payload.activeContractsCount || 1}, ${payload.deployedStaffCount || 0},
            ${payload.monthlyContractValue || 0}, ${payload.slaTargetHours || 4},
            ${payload.slaCompliancePercent || 100}, ${payload.accountManager}, ${payload.health || "healthy"}
          );
        `;
        return NextResponse.json({ success: true, id, message: "Client service account registered" });
      }

      case "CREATE_TICKET": {
        const id = payload.id || `tick-${Date.now()}`;
        const ticketNumber = `INC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
        await sql`
          INSERT INTO workforce_tickets (
            id, tenant_slug, tenant_id, ticket_number, client_name,
            subject, priority, assigned_specialist, status, sla_minutes_remaining
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${ticketNumber}, ${payload.clientName},
            ${payload.subject}, ${payload.priority || "P2"}, ${payload.assignedSpecialist},
            'open', ${payload.slaMinutesRemaining || 120}
          );
        `;
        return NextResponse.json({ success: true, id, ticketNumber, message: "Service ticket logged" });
      }

      case "LOG_HOURS": {
        const id = payload.id || `log-${Date.now()}`;
        await sql`
          INSERT INTO workforce_work_logs (
            id, tenant_slug, tenant_id, person_name, client_name,
            date, hours_worked, summary, supervisor_signed_off
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.personName}, ${payload.clientName},
            ${payload.date}, ${payload.hoursWorked || 8}, ${payload.summary}, ${payload.supervisorSignedOff ?? false}
          );
        `;
        return NextResponse.json({ success: true, id, message: "Work log submitted" });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unrecognized action '${action}'` },
          { status: 400 }
        );
    }
  } catch (err: any) {
    console.error(`[Workforce API] POST mutation error for tenant '${cleanSlug}':`, err);
    return NextResponse.json(
      { success: false, error: "Mutation failed: " + err.message },
      { status: 500 }
    );
  }
}
