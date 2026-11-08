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
  WorkforceDepartment,
  WorkforceBranch,
  WorkforceDocument,
  WorkforceAuditLog,
  WorkforceInterview,
  WorkforceOffer,
  WorkforceOnboardingPacket,
  CourseModule,
  CourseEnrollment,
  CourseCertificate,
  WorkforceProject,
  WorkforceDeliverable,
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
  INITIAL_DEPARTMENTS,
  INITIAL_BRANCHES,
  INITIAL_DOCUMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_INTERVIEWS,
  INITIAL_OFFERS,
  INITIAL_ONBOARDING_PACKETS,
  INITIAL_COURSE_MODULES,
  INITIAL_ENROLLMENTS,
  INITIAL_CERTIFICATES,
  INITIAL_PROJECTS,
  INITIAL_DELIVERABLES,
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

        CREATE TABLE IF NOT EXISTS workforce_departments (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          name VARCHAR(100) NOT NULL,
          code VARCHAR(50) NOT NULL,
          head_person_id VARCHAR(64) DEFAULT '',
          head_person_name VARCHAR(255) NOT NULL DEFAULT '',
          budget_monthly NUMERIC(15,2) DEFAULT 0,
          target_headcount INT DEFAULT 1,
          active_headcount INT DEFAULT 0,
          description TEXT DEFAULT '',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_dept_tenant_created ON workforce_departments(LOWER(tenant_slug), created_at DESC);

        CREATE TABLE IF NOT EXISTS workforce_branches (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          name VARCHAR(100) NOT NULL,
          city VARCHAR(100) NOT NULL,
          state VARCHAR(100) NOT NULL,
          address TEXT NOT NULL,
          is_headquarters BOOLEAN DEFAULT FALSE,
          manager_name VARCHAR(255) NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_branch_tenant_created ON workforce_branches(LOWER(tenant_slug), created_at DESC);

        CREATE TABLE IF NOT EXISTS workforce_documents (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          person_id VARCHAR(64) NOT NULL,
          document_type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          file_url TEXT NOT NULL,
          file_size_bytes BIGINT DEFAULT 0,
          uploaded_by VARCHAR(255) NOT NULL,
          verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_docs_tenant_person ON workforce_documents(LOWER(tenant_slug), person_id);

        CREATE TABLE IF NOT EXISTS workforce_audit_logs (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          entity_type VARCHAR(50) NOT NULL,
          entity_id VARCHAR(64) NOT NULL,
          action VARCHAR(100) NOT NULL,
          actor_name VARCHAR(255) NOT NULL,
          changes JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_audit_tenant_entity ON workforce_audit_logs(LOWER(tenant_slug), entity_id);

        CREATE TABLE IF NOT EXISTS workforce_interviews (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          candidate_id VARCHAR(64) NOT NULL,
          candidate_name VARCHAR(255) NOT NULL,
          applied_role VARCHAR(255) NOT NULL,
          stage VARCHAR(50) NOT NULL DEFAULT 'preliminary',
          scheduled_start TIMESTAMPTZ NOT NULL,
          scheduled_end TIMESTAMPTZ NOT NULL,
          meeting_url TEXT DEFAULT '',
          location_details TEXT DEFAULT '',
          panel_members JSONB DEFAULT '[]'::jsonb,
          status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
          interviewer_notes TEXT DEFAULT '',
          score INT DEFAULT NULL,
          token VARCHAR(128) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_int_tenant_created ON workforce_interviews(LOWER(tenant_slug), created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_wf_int_token ON workforce_interviews(LOWER(tenant_slug), token);

        CREATE TABLE IF NOT EXISTS workforce_offers (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          candidate_id VARCHAR(64) NOT NULL,
          candidate_name VARCHAR(255) NOT NULL,
          candidate_email VARCHAR(255) NOT NULL,
          role_category VARCHAR(50) NOT NULL DEFAULT 'employee',
          offered_designation VARCHAR(255) NOT NULL,
          department VARCHAR(100) NOT NULL,
          monthly_stipend_salary NUMERIC(15,2) NOT NULL DEFAULT 0,
          allowances NUMERIC(15,2) NOT NULL DEFAULT 0,
          total_monthly NUMERIC(15,2) NOT NULL DEFAULT 0,
          start_date VARCHAR(50) NOT NULL,
          expiry_date VARCHAR(50) NOT NULL,
          offer_letter_text TEXT NOT NULL,
          token VARCHAR(128) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'issued',
          accepted_at TIMESTAMPTZ DEFAULT NULL,
          candidate_signature TEXT DEFAULT '',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_offers_tenant_created ON workforce_offers(LOWER(tenant_slug), created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_wf_offers_token ON workforce_offers(LOWER(tenant_slug), token);

        CREATE TABLE IF NOT EXISTS workforce_onboarding_packets (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          candidate_id VARCHAR(64) NOT NULL,
          person_id VARCHAR(64) DEFAULT '',
          candidate_name VARCHAR(255) NOT NULL,
          candidate_email VARCHAR(255) NOT NULL,
          designation VARCHAR(255) NOT NULL,
          department VARCHAR(100) NOT NULL,
          role_category VARCHAR(50) NOT NULL DEFAULT 'employee',
          token VARCHAR(128) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'pending_intake',
          nin VARCHAR(50) DEFAULT '',
          bvn VARCHAR(50) DEFAULT '',
          residential_address TEXT DEFAULT '',
          bank_details JSONB DEFAULT '{}'::jsonb,
          next_of_kin JSONB DEFAULT '{}'::jsonb,
          equipment_requisition JSONB DEFAULT '{}'::jsonb,
          system_account JSONB DEFAULT '{}'::jsonb,
          documents_submitted JSONB DEFAULT '{}'::jsonb,
          submitted_at TIMESTAMPTZ DEFAULT NULL,
          approved_at TIMESTAMPTZ DEFAULT NULL,
          provisioned_at TIMESTAMPTZ DEFAULT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_onb_tenant_created ON workforce_onboarding_packets(LOWER(tenant_slug), created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_wf_onb_token ON workforce_onboarding_packets(LOWER(tenant_slug), token);

        CREATE TABLE IF NOT EXISTS workforce_course_modules (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          course_id VARCHAR(64) NOT NULL,
          title VARCHAR(255) NOT NULL,
          order_index INT NOT NULL DEFAULT 1,
          duration_hours INT NOT NULL DEFAULT 2,
          summary TEXT NOT NULL,
          lessons JSONB DEFAULT '[]'::jsonb,
          quiz JSONB DEFAULT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_mod_tenant_course ON workforce_course_modules(LOWER(tenant_slug), course_id, order_index);

        CREATE TABLE IF NOT EXISTS workforce_course_enrollments (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          course_id VARCHAR(64) NOT NULL,
          person_id VARCHAR(64) NOT NULL,
          person_name VARCHAR(255) NOT NULL,
          progress_percentage INT NOT NULL DEFAULT 0,
          completed_lessons JSONB DEFAULT '[]'::jsonb,
          status VARCHAR(50) NOT NULL DEFAULT 'enrolled',
          final_score NUMERIC(5,2) DEFAULT NULL,
          enrolled_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMPTZ DEFAULT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_wf_enr_tenant_course ON workforce_course_enrollments(LOWER(tenant_slug), course_id);
        CREATE INDEX IF NOT EXISTS idx_wf_enr_tenant_person ON workforce_course_enrollments(LOWER(tenant_slug), person_id);

        CREATE TABLE IF NOT EXISTS workforce_certificates (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          certificate_number VARCHAR(100) NOT NULL,
          course_id VARCHAR(64) NOT NULL,
          course_title VARCHAR(255) NOT NULL,
          person_id VARCHAR(64) NOT NULL,
          person_name VARCHAR(255) NOT NULL,
          issue_date VARCHAR(50) NOT NULL,
          grade VARCHAR(50) NOT NULL,
          verification_hash VARCHAR(128) NOT NULL,
          competencies_awarded JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_cert_tenant_hash ON workforce_certificates(LOWER(tenant_slug), verification_hash);
        CREATE INDEX IF NOT EXISTS idx_wf_cert_tenant_created ON workforce_certificates(LOWER(tenant_slug), created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_wf_cert_tenant_person ON workforce_certificates(LOWER(tenant_slug), person_id);

        ALTER TABLE workforce_people ADD COLUMN IF NOT EXISTS residential_address TEXT DEFAULT '';
        ALTER TABLE workforce_people ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}'::jsonb;
        ALTER TABLE workforce_people ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE workforce_people ADD COLUMN IF NOT EXISTS employment_history JSONB DEFAULT '[]'::jsonb;

        CREATE TABLE IF NOT EXISTS workforce_projects (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          title VARCHAR(255) NOT NULL,
          code VARCHAR(50) NOT NULL,
          department VARCHAR(100) NOT NULL,
          client_id VARCHAR(64) DEFAULT '',
          client_name VARCHAR(255) DEFAULT '',
          lead_person_id VARCHAR(64) DEFAULT '',
          lead_person_name VARCHAR(255) DEFAULT '',
          budget NUMERIC(15,2) DEFAULT 0,
          spent NUMERIC(15,2) DEFAULT 0,
          status VARCHAR(50) DEFAULT 'active',
          priority VARCHAR(50) DEFAULT 'medium',
          start_date VARCHAR(50) NOT NULL,
          end_date VARCHAR(50) DEFAULT '',
          description TEXT DEFAULT '',
          deliverables_count INT DEFAULT 0,
          tasks_count INT DEFAULT 0,
          completed_tasks_count INT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_proj_tenant_created ON workforce_projects(LOWER(tenant_slug), created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_wf_proj_tenant_status ON workforce_projects(LOWER(tenant_slug), status);

        CREATE TABLE IF NOT EXISTS workforce_deliverables (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          project_id VARCHAR(64) NOT NULL,
          task_id VARCHAR(64) NOT NULL,
          title VARCHAR(255) NOT NULL,
          submitted_by_id VARCHAR(64) NOT NULL,
          submitted_by_name VARCHAR(255) NOT NULL,
          file_url TEXT NOT NULL,
          file_type VARCHAR(50) NOT NULL,
          file_size_bytes BIGINT DEFAULT 0,
          version INT DEFAULT 1,
          status VARCHAR(50) DEFAULT 'pending_review',
          review_feedback TEXT DEFAULT '',
          reviewed_by VARCHAR(255) DEFAULT '',
          reviewed_at TIMESTAMPTZ DEFAULT NULL,
          submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_wf_deliv_tenant_proj ON workforce_deliverables(LOWER(tenant_slug), project_id);
        CREATE INDEX IF NOT EXISTS idx_wf_deliv_tenant_task ON workforce_deliverables(LOWER(tenant_slug), task_id);

        ALTER TABLE workforce_tasks ADD COLUMN IF NOT EXISTS project_id VARCHAR(64) DEFAULT '';
        ALTER TABLE workforce_tasks ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE workforce_tasks ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC(6,2) DEFAULT 0;
        ALTER TABLE workforce_tasks ADD COLUMN IF NOT EXISTS actual_hours NUMERIC(6,2) DEFAULT 0;
        ALTER TABLE workforce_tasks ADD COLUMN IF NOT EXISTS assignees JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE workforce_tasks ADD COLUMN IF NOT EXISTS deliverable_id VARCHAR(64) DEFAULT '';
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

    // Check if departments table has data, seed if empty
    const existingDepts = await sql`
      SELECT COUNT(*)::int as cnt FROM workforce_departments
      WHERE LOWER(tenant_slug) = ${cleanSlug};
    `;

    if (Number(existingDepts[0]?.cnt || 0) === 0) {
      for (const d of INITIAL_DEPARTMENTS) {
        await sql`
          INSERT INTO workforce_departments (
            id, tenant_slug, tenant_id, name, code, head_person_id, head_person_name,
            budget_monthly, target_headcount, active_headcount, description
          ) VALUES (
            ${d.id}, ${cleanSlug}, ${cleanSlug}, ${d.name}, ${d.code}, ${d.headPersonId || ""}, ${d.headPersonName},
            ${d.budgetMonthly}, ${d.targetHeadcount}, ${d.activeHeadcount}, ${d.description}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      for (const b of INITIAL_BRANCHES) {
        await sql`
          INSERT INTO workforce_branches (
            id, tenant_slug, tenant_id, name, city, state, address, is_headquarters, manager_name
          ) VALUES (
            ${b.id}, ${cleanSlug}, ${cleanSlug}, ${b.name}, ${b.city}, ${b.state}, ${b.address}, ${b.isHeadquarters}, ${b.managerName}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // Check if documents table has data, seed if empty
    const existingDocs = await sql`
      SELECT COUNT(*)::int as cnt FROM workforce_documents
      WHERE LOWER(tenant_slug) = ${cleanSlug};
    `;

    if (Number(existingDocs[0]?.cnt || 0) === 0) {
      for (const doc of INITIAL_DOCUMENTS) {
        await sql`
          INSERT INTO workforce_documents (
            id, tenant_slug, tenant_id, person_id, document_type, title,
            file_url, file_size_bytes, uploaded_by, verified
          ) VALUES (
            ${doc.id}, ${cleanSlug}, ${cleanSlug}, ${doc.personId}, ${doc.documentType},
            ${doc.title}, ${doc.fileUrl}, ${doc.fileSizeBytes}, ${doc.uploadedBy}, ${doc.verified}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      for (const a of INITIAL_AUDIT_LOGS) {
        await sql`
          INSERT INTO workforce_audit_logs (
            id, tenant_slug, tenant_id, entity_type, entity_id, action, actor_name, changes
          ) VALUES (
            ${a.id}, ${cleanSlug}, ${cleanSlug}, ${a.entityType}, ${a.entityId},
            ${a.action}, ${a.actorName}, ${JSON.stringify(a.changes)}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // Check if interviews table has data, seed if empty
    const existingInts = await sql`
      SELECT COUNT(*)::int as cnt FROM workforce_interviews
      WHERE LOWER(tenant_slug) = ${cleanSlug};
    `;

    if (Number(existingInts[0]?.cnt || 0) === 0) {
      for (const it of INITIAL_INTERVIEWS) {
        await sql`
          INSERT INTO workforce_interviews (
            id, tenant_slug, tenant_id, candidate_id, candidate_name, applied_role,
            stage, scheduled_start, scheduled_end, meeting_url, location_details,
            panel_members, status, interviewer_notes, score, token
          ) VALUES (
            ${it.id}, ${cleanSlug}, ${cleanSlug}, ${it.candidateId}, ${it.candidateName}, ${it.appliedRole},
            ${it.stage}, ${it.scheduledStart}, ${it.scheduledEnd}, ${it.meetingUrl || ""}, ${it.locationDetails || ""},
            ${JSON.stringify(it.panelMembers)}, ${it.status}, ${it.interviewerNotes || ""}, ${it.score ?? null}, ${it.token}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      for (const ofr of INITIAL_OFFERS) {
        await sql`
          INSERT INTO workforce_offers (
            id, tenant_slug, tenant_id, candidate_id, candidate_name, candidate_email,
            role_category, offered_designation, department, monthly_stipend_salary,
            allowances, total_monthly, start_date, expiry_date, offer_letter_text,
            token, status, accepted_at, candidate_signature
          ) VALUES (
            ${ofr.id}, ${cleanSlug}, ${cleanSlug}, ${ofr.candidateId}, ${ofr.candidateName}, ${ofr.candidateEmail},
            ${ofr.roleCategory}, ${ofr.offeredDesignation}, ${ofr.department}, ${ofr.monthlyStipendSalary},
            ${ofr.allowances}, ${ofr.totalMonthly}, ${ofr.startDate}, ${ofr.expiryDate}, ${ofr.offerLetterText},
            ${ofr.token}, ${ofr.status}, ${ofr.acceptedAt || null}, ${ofr.candidateSignature || ""}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // Check if onboarding packets table has data, seed if empty
    const existingPackets = await sql`
      SELECT COUNT(*)::int as cnt FROM workforce_onboarding_packets
      WHERE LOWER(tenant_slug) = ${cleanSlug};
    `;

    if (Number(existingPackets[0]?.cnt || 0) === 0) {
      for (const p of INITIAL_ONBOARDING_PACKETS) {
        await sql`
          INSERT INTO workforce_onboarding_packets (
            id, tenant_slug, tenant_id, candidate_id, person_id, candidate_name,
            candidate_email, designation, department, role_category, token, status,
            nin, bvn, residential_address, bank_details, next_of_kin, equipment_requisition,
            system_account, documents_submitted, submitted_at
          ) VALUES (
            ${p.id}, ${cleanSlug}, ${cleanSlug}, ${p.candidateId}, ${p.personId || ""}, ${p.candidateName},
            ${p.candidateEmail}, ${p.designation}, ${p.department}, ${p.roleCategory}, ${p.token}, ${p.status},
            ${p.nin || ""}, ${p.bvn || ""}, ${p.residentialAddress || ""},
            ${JSON.stringify(p.bankDetails || {})}, ${JSON.stringify(p.nextOfKin || {})},
            ${JSON.stringify(p.equipmentRequisition || {})}, ${JSON.stringify(p.systemAccount || {})},
            ${JSON.stringify(p.documentsSubmitted || {})}, ${p.submittedAt || null}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // Check if course modules table has data, seed if empty
    const existingMods = await sql`
      SELECT COUNT(*)::int as cnt FROM workforce_course_modules
      WHERE LOWER(tenant_slug) = ${cleanSlug};
    `;

    if (Number(existingMods[0]?.cnt || 0) === 0) {
      for (const m of INITIAL_COURSE_MODULES) {
        await sql`
          INSERT INTO workforce_course_modules (
            id, tenant_slug, tenant_id, course_id, title, order_index,
            duration_hours, summary, lessons, quiz
          ) VALUES (
            ${m.id}, ${cleanSlug}, ${cleanSlug}, ${m.courseId}, ${m.title}, ${m.orderIndex},
            ${m.durationHours}, ${m.summary}, ${JSON.stringify(m.lessons)}, ${m.quiz ? JSON.stringify(m.quiz) : null}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      for (const enr of INITIAL_ENROLLMENTS) {
        await sql`
          INSERT INTO workforce_course_enrollments (
            id, tenant_slug, tenant_id, course_id, person_id, person_name,
            progress_percentage, completed_lessons, status, final_score, enrolled_at, completed_at
          ) VALUES (
            ${enr.id}, ${cleanSlug}, ${cleanSlug}, ${enr.courseId}, ${enr.personId}, ${enr.personName},
            ${enr.progressPercentage}, ${JSON.stringify(enr.completedLessons)}, ${enr.status},
            ${enr.finalScore ?? null}, ${enr.enrolledAt}, ${enr.completedAt || null}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      for (const cert of INITIAL_CERTIFICATES) {
        await sql`
          INSERT INTO workforce_certificates (
            id, tenant_slug, tenant_id, certificate_number, course_id, course_title,
            person_id, person_name, issue_date, grade, verification_hash, competencies_awarded
          ) VALUES (
            ${cert.id}, ${cleanSlug}, ${cleanSlug}, ${cert.certificateNumber}, ${cert.courseId}, ${cert.courseTitle},
            ${cert.personId}, ${cert.personName}, ${cert.issueDate}, ${cert.grade},
            ${cert.verificationHash}, ${JSON.stringify(cert.competenciesAwarded)}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // Check if projects table has data, seed if empty
    const existingProjects = await sql`
      SELECT COUNT(*)::int as cnt FROM workforce_projects
      WHERE LOWER(tenant_slug) = ${cleanSlug};
    `;

    if (Number(existingProjects[0]?.cnt || 0) === 0) {
      for (const pr of INITIAL_PROJECTS) {
        await sql`
          INSERT INTO workforce_projects (
            id, tenant_slug, tenant_id, title, code, department,
            client_id, client_name, lead_person_id, lead_person_name,
            budget, spent, status, priority, start_date, end_date,
            description, deliverables_count, tasks_count, completed_tasks_count
          ) VALUES (
            ${pr.id}, ${cleanSlug}, ${cleanSlug}, ${pr.title}, ${pr.code}, ${pr.department},
            ${pr.clientId || ""}, ${pr.clientName || ""}, ${pr.leadPersonId || ""}, ${pr.leadPersonName},
            ${pr.budget}, ${pr.spent}, ${pr.status}, ${pr.priority}, ${pr.startDate}, ${pr.endDate || ""},
            ${pr.description}, ${pr.deliverablesCount}, ${pr.tasksCount}, ${pr.completedTasksCount}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      for (const dl of INITIAL_DELIVERABLES) {
        await sql`
          INSERT INTO workforce_deliverables (
            id, tenant_slug, tenant_id, project_id, task_id, title,
            submitted_by_id, submitted_by_name, file_url, file_type,
            file_size_bytes, version, status, review_feedback,
            reviewed_by, reviewed_at, submitted_at
          ) VALUES (
            ${dl.id}, ${cleanSlug}, ${cleanSlug}, ${dl.projectId}, ${dl.taskId}, ${dl.title},
            ${dl.submittedById}, ${dl.submittedByName}, ${dl.fileUrl}, ${dl.fileType},
            ${dl.fileSizeBytes}, ${dl.version}, ${dl.status}, ${dl.reviewFeedback || ""},
            ${dl.reviewedBy || ""}, ${dl.reviewedAt || null}, ${dl.submittedAt}
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
      departmentsRows,
      branchesRows,
      documentsRows,
      auditLogsRows,
      interviewsRows,
      offersRows,
      onboardingRows,
      modulesRows,
      enrollmentsRows,
      certificatesRows,
      projectsRows,
      deliverablesRows,
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
      sql`SELECT * FROM workforce_departments WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at ASC;`,
      sql`SELECT * FROM workforce_branches WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY is_headquarters DESC, created_at ASC;`,
      sql`SELECT * FROM workforce_documents WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
      sql`SELECT * FROM workforce_audit_logs WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC LIMIT 100;`,
      sql`SELECT * FROM workforce_interviews WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY scheduled_start ASC;`,
      sql`SELECT * FROM workforce_offers WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
      sql`SELECT * FROM workforce_onboarding_packets WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
      sql`SELECT * FROM workforce_course_modules WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY order_index ASC;`,
      sql`SELECT * FROM workforce_course_enrollments WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY enrolled_at DESC;`,
      sql`SELECT * FROM workforce_certificates WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
      sql`SELECT * FROM workforce_projects WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY created_at DESC;`,
      sql`SELECT * FROM workforce_deliverables WHERE LOWER(tenant_slug) = ${cleanSlug} ORDER BY submitted_at DESC;`,
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
      residentialAddress: r.residential_address || undefined,
      emergencyContact: typeof r.emergency_contact === "object" && r.emergency_contact !== null && r.emergency_contact.name ? r.emergency_contact : undefined,
      education: Array.isArray(r.education) ? r.education : [],
      employmentHistory: Array.isArray(r.employment_history) ? r.employment_history : [],
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
      projectId: r.project_id || undefined,
      department: r.department,
      assignedTo: r.assigned_to,
      assignees: Array.isArray(r.assignees) ? r.assignees : [],
      supervisor: r.supervisor,
      priority: r.priority,
      status: r.status,
      deadline: r.deadline,
      estimatedHours: r.estimated_hours != null ? Number(r.estimated_hours) : undefined,
      actualHours: r.actual_hours != null ? Number(r.actual_hours) : undefined,
      dependencies: Array.isArray(r.dependencies) ? r.dependencies : [],
      score: r.score != null ? Number(r.score) : undefined,
      feedback: r.feedback || undefined,
      deliverableSummary: r.deliverable_summary || undefined,
      deliverableId: r.deliverable_id || undefined,
      createdAt: r.created_at ? new Date(r.created_at).toLocaleString() : undefined,
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

    const departments: WorkforceDepartment[] = departmentsRows.map((r: any) => {
      const matchingPeople = people.filter(
        (p) =>
          p.department.toLowerCase() === r.name.toLowerCase() ||
          p.department.toLowerCase().includes(r.code.toLowerCase())
      );
      return {
        id: r.id,
        name: r.name,
        code: r.code,
        headPersonId: r.head_person_id || undefined,
        headPersonName: r.head_person_name || "Unassigned",
        budgetMonthly: Number(r.budget_monthly || 0),
        targetHeadcount: Number(r.target_headcount || 1),
        activeHeadcount: matchingPeople.length > 0 ? matchingPeople.length : Number(r.active_headcount || 0),
        description: r.description || "",
      };
    });

    const branches: WorkforceBranch[] = branchesRows.map((r: any) => ({
      id: r.id,
      name: r.name,
      city: r.city,
      state: r.state,
      address: r.address,
      isHeadquarters: Boolean(r.is_headquarters),
      managerName: r.manager_name || "Branch Supervisor",
    }));

    const documents: WorkforceDocument[] = documentsRows.map((r: any) => ({
      id: r.id,
      personId: r.person_id,
      documentType: r.document_type,
      title: r.title,
      fileUrl: r.file_url,
      fileSizeBytes: Number(r.file_size_bytes || 0),
      uploadedBy: r.uploaded_by,
      verified: Boolean(r.verified),
      createdAt: r.created_at ? new Date(r.created_at).toLocaleString() : "",
    }));

    const auditLogs: WorkforceAuditLog[] = auditLogsRows.map((r: any) => ({
      id: r.id,
      entityType: r.entity_type,
      entityId: r.entity_id,
      action: r.action,
      actorName: r.actor_name,
      changes: typeof r.changes === "object" && r.changes !== null ? r.changes : {},
      createdAt: r.created_at ? new Date(r.created_at).toLocaleString() : "",
    }));

    const interviews: WorkforceInterview[] = interviewsRows.map((r: any) => ({
      id: r.id,
      candidateId: r.candidate_id,
      candidateName: r.candidate_name,
      appliedRole: r.applied_role,
      stage: r.stage,
      scheduledStart: r.scheduled_start ? new Date(r.scheduled_start).toISOString() : "",
      scheduledEnd: r.scheduled_end ? new Date(r.scheduled_end).toISOString() : "",
      meetingUrl: r.meeting_url || undefined,
      locationDetails: r.location_details || undefined,
      panelMembers: Array.isArray(r.panel_members) ? r.panel_members : [],
      status: r.status,
      interviewerNotes: r.interviewer_notes || undefined,
      score: r.score != null ? Number(r.score) : undefined,
      token: r.token,
      createdAt: r.created_at ? new Date(r.created_at).toLocaleString() : "",
    }));

    const offers: WorkforceOffer[] = offersRows.map((r: any) => ({
      id: r.id,
      candidateId: r.candidate_id,
      candidateName: r.candidate_name,
      candidateEmail: r.candidate_email,
      roleCategory: r.role_category,
      offeredDesignation: r.offered_designation,
      department: r.department,
      monthlyStipendSalary: Number(r.monthly_stipend_salary || 0),
      allowances: Number(r.allowances || 0),
      totalMonthly: Number(r.total_monthly || 0),
      startDate: r.start_date,
      expiryDate: r.expiry_date,
      offerLetterText: r.offer_letter_text,
      token: r.token,
      status: r.status,
      acceptedAt: r.accepted_at ? new Date(r.accepted_at).toISOString() : undefined,
      candidateSignature: r.candidate_signature || undefined,
      createdAt: r.created_at ? new Date(r.created_at).toLocaleString() : "",
    }));

    const onboardingPackets: WorkforceOnboardingPacket[] = onboardingRows.map((r: any) => ({
      id: r.id,
      candidateId: r.candidate_id,
      personId: r.person_id || undefined,
      candidateName: r.candidate_name,
      candidateEmail: r.candidate_email,
      designation: r.designation,
      department: r.department,
      roleCategory: r.role_category,
      token: r.token,
      status: r.status,
      nin: r.nin || undefined,
      bvn: r.bvn || undefined,
      residentialAddress: r.residential_address || undefined,
      bankDetails: typeof r.bank_details === "object" && r.bank_details !== null && r.bank_details.bankName ? r.bank_details : undefined,
      nextOfKin: typeof r.next_of_kin === "object" && r.next_of_kin !== null && r.next_of_kin.name ? r.next_of_kin : undefined,
      equipmentRequisition: typeof r.equipment_requisition === "object" && r.equipment_requisition !== null ? r.equipment_requisition : undefined,
      systemAccount: typeof r.system_account === "object" && r.system_account !== null ? r.system_account : undefined,
      documentsSubmitted: typeof r.documents_submitted === "object" && r.documents_submitted !== null ? r.documents_submitted : undefined,
      submittedAt: r.submitted_at ? new Date(r.submitted_at).toISOString() : undefined,
      approvedAt: r.approved_at ? new Date(r.approved_at).toISOString() : undefined,
      provisionedAt: r.provisioned_at ? new Date(r.provisioned_at).toISOString() : undefined,
      createdAt: r.created_at ? new Date(r.created_at).toLocaleString() : "",
    }));

    const courseModules: CourseModule[] = modulesRows.map((r: any) => ({
      id: r.id,
      courseId: r.course_id,
      title: r.title,
      orderIndex: Number(r.order_index || 1),
      durationHours: Number(r.duration_hours || 1),
      summary: r.summary || "",
      lessons: Array.isArray(r.lessons) ? r.lessons : [],
      quiz: typeof r.quiz === "object" && r.quiz !== null ? r.quiz : undefined,
    }));

    const courseEnrollments: CourseEnrollment[] = enrollmentsRows.map((r: any) => ({
      id: r.id,
      courseId: r.course_id,
      personId: r.person_id,
      personName: r.person_name,
      progressPercentage: Number(r.progress_percentage || 0),
      completedLessons: Array.isArray(r.completed_lessons) ? r.completed_lessons : [],
      status: r.status,
      finalScore: r.final_score != null ? Number(r.final_score) : undefined,
      enrolledAt: r.enrolled_at ? new Date(r.enrolled_at).toISOString() : "",
      completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : undefined,
    }));

    const certificates: CourseCertificate[] = certificatesRows.map((r: any) => ({
      id: r.id,
      certificateNumber: r.certificate_number,
      courseId: r.course_id,
      courseTitle: r.course_title,
      personId: r.person_id,
      personName: r.person_name,
      issueDate: r.issue_date,
      grade: r.grade,
      verificationHash: r.verification_hash,
      competenciesAwarded: Array.isArray(r.competencies_awarded) ? r.competencies_awarded : [],
    }));

    const projects: WorkforceProject[] = projectsRows.map((r: any) => ({
      id: r.id,
      title: r.title,
      code: r.code,
      department: r.department,
      clientId: r.client_id || undefined,
      clientName: r.client_name || undefined,
      leadPersonId: r.lead_person_id || undefined,
      leadPersonName: r.lead_person_name || "Unassigned",
      budget: Number(r.budget || 0),
      spent: Number(r.spent || 0),
      status: r.status,
      priority: r.priority,
      startDate: r.start_date,
      endDate: r.end_date || undefined,
      description: r.description || "",
      deliverablesCount: Number(r.deliverables_count || 0),
      tasksCount: Number(r.tasks_count || 0),
      completedTasksCount: Number(r.completed_tasks_count || 0),
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : "",
    }));

    const deliverables: WorkforceDeliverable[] = deliverablesRows.map((r: any) => ({
      id: r.id,
      projectId: r.project_id,
      projectTitle: projects.find((p) => p.id === r.project_id)?.title,
      taskId: r.task_id,
      taskTitle: tasks.find((t) => t.id === r.task_id)?.title,
      title: r.title,
      submittedById: r.submitted_by_id,
      submittedByName: r.submitted_by_name,
      fileUrl: r.file_url,
      fileType: r.file_type,
      fileSizeBytes: Number(r.file_size_bytes || 0),
      version: Number(r.version || 1),
      status: r.status,
      reviewFeedback: r.review_feedback || undefined,
      reviewedBy: r.reviewed_by || undefined,
      reviewedAt: r.reviewed_at ? new Date(r.reviewed_at).toISOString() : undefined,
      submittedAt: r.submitted_at ? new Date(r.submitted_at).toISOString() : "",
    }));

    // Shortcut for public certificate verification
    const certHash = new URL(request.url).searchParams.get("certHash");
    if (certHash) {
      const match = certificates.find((c) => c.verificationHash.toLowerCase() === certHash.toLowerCase());
      if (match) {
        return NextResponse.json({ success: true, certificate: match });
      }
      return NextResponse.json(
        { success: false, error: "Cryptographic Certificate Record not found or unverified" },
        { status: 404 }
      );
    }

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
      departments,
      branches,
      documents,
      auditLogs,
      interviews,
      offers,
      onboardingPackets,
      courses,
      courseModules,
      courseEnrollments,
      certificates,
      projects,
      deliverables,
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

      case "SUBMIT_APPLICATION": {
        const id = payload.id || `cand-${Date.now()}`;
        const appliedDate = payload.appliedDate || new Date().toISOString().split("T")[0];
        await sql`
          INSERT INTO workforce_candidates (
            id, tenant_slug, tenant_id, name, email, phone, applied_role,
            department, stage, applied_date, score, experience_years,
            education, skills, resume_url, interview_notes
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.name}, ${payload.email},
            ${payload.phone || ""}, ${payload.appliedRole}, ${payload.department || "Operations"},
            'received', ${appliedDate}, ${payload.score || 0}, ${payload.experienceYears || 0},
            ${payload.education || ""}, ${JSON.stringify(payload.skills || [])},
            ${payload.resumeUrl || ""}, ${payload.coverNote || ""}
          );
        `;
        return NextResponse.json({ success: true, id, referenceId: id, message: "Application submitted successfully" });
      }

      case "UPDATE_CANDIDATE_SCORE": {
        await sql`
          UPDATE workforce_candidates
          SET score = ${payload.score}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${payload.candidateId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        return NextResponse.json({ success: true, message: "Candidate assessment score recorded" });
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

        let autoCertificate = null;
        if (Number(payload.score) >= 80) {
          const asgRows = await sql`
            SELECT title, course_title, track, assignee_name FROM workforce_assignments
            WHERE id = ${payload.assignmentId} AND LOWER(tenant_slug) = ${cleanSlug}
            LIMIT 1;
          `;
          if (asgRows.length > 0) {
            const asg = asgRows[0];
            const personRows = await sql`
              SELECT id, name FROM workforce_people
              WHERE LOWER(name) = LOWER(${asg.assignee_name}) AND LOWER(tenant_slug) = ${cleanSlug}
              LIMIT 1;
            `;
            const personId = personRows[0]?.id || `person-${Date.now()}`;
            const personName = personRows[0]?.name || asg.assignee_name;

            const certId = `cert-${Date.now()}`;
            const certNumber = `OFIA-CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
            const randomHex = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
            const verificationHash = `sha256_${Date.now()}_${randomHex}`;
            const gradeText = Number(payload.score) >= 90 ? `Distinction (${payload.score}%)` : `Merit (${payload.score}%)`;

            await sql`
              INSERT INTO workforce_certificates (
                id, tenant_slug, tenant_id, certificate_number, course_id, course_title,
                person_id, person_name, issue_date, grade, verification_hash, competencies_awarded
              ) VALUES (
                ${certId}, ${cleanSlug}, ${cleanSlug}, ${certNumber}, 'course-custom', ${asg.course_title || asg.title},
                ${personId}, ${personName}, ${new Date().toISOString().split("T")[0]}, ${gradeText},
                ${verificationHash}, ${JSON.stringify([asg.track || "Professional Competence", "Verified Practical Assessment"])}
              ) ON CONFLICT (id) DO NOTHING;
            `;

            autoCertificate = {
              id: certId,
              certificateNumber: certNumber,
              verificationHash,
            };

            await sql`
              UPDATE workforce_people
              SET competency_score = LEAST(100, competency_score + 10),
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ${personId} AND LOWER(tenant_slug) = ${cleanSlug};
            `;
          }
        }

        return NextResponse.json({
          success: true,
          message: "Assignment graded successfully",
          autoCertificate,
        });
      }

      case "CREATE_COURSE_MODULE": {
        const id = payload.id || `mod-${Date.now()}`;
        await sql`
          INSERT INTO workforce_course_modules (
            id, tenant_slug, tenant_id, course_id, title, order_index,
            duration_hours, summary, lessons, quiz
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.courseId}, ${payload.title},
            ${payload.orderIndex || 1}, ${payload.durationHours || 2}, ${payload.summary || ""},
            ${JSON.stringify(payload.lessons || [])}, ${payload.quiz ? JSON.stringify(payload.quiz) : null}
          );
        `;
        await sql`
          UPDATE workforce_courses
          SET modules_count = modules_count + 1, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${payload.courseId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        return NextResponse.json({ success: true, id, message: "Course module published" });
      }

      case "ENROLL_LEARNER": {
        const id = payload.id || `enr-${Date.now()}`;
        await sql`
          INSERT INTO workforce_course_enrollments (
            id, tenant_slug, tenant_id, course_id, person_id, person_name,
            progress_percentage, completed_lessons, status, enrolled_at
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.courseId}, ${payload.personId}, ${payload.personName},
            0, '[]'::jsonb, 'enrolled', CURRENT_TIMESTAMP
          );
        `;
        await sql`
          UPDATE workforce_courses
          SET enrolled_learners = enrolled_learners + 1, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${payload.courseId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        return NextResponse.json({ success: true, id, message: "Learner enrolled in course" });
      }

      case "UPDATE_LESSON_PROGRESS": {
        const { enrollmentId, lessonId, isCompleted, totalLessonsCount } = payload;
        const rows = await sql`
          SELECT completed_lessons, course_id, person_id, person_name FROM workforce_course_enrollments
          WHERE id = ${enrollmentId} AND LOWER(tenant_slug) = ${cleanSlug}
          LIMIT 1;
        `;
        if (rows.length === 0) {
          return NextResponse.json({ success: false, error: "Enrollment not found" }, { status: 404 });
        }
        let completed: string[] = Array.isArray(rows[0].completed_lessons) ? rows[0].completed_lessons : [];
        if (isCompleted && !completed.includes(lessonId)) {
          completed.push(lessonId);
        } else if (!isCompleted && completed.includes(lessonId)) {
          completed = completed.filter((id: string) => id !== lessonId);
        }
        const total = totalLessonsCount || 5;
        const progress = Math.min(100, Math.round((completed.length / total) * 100));
        const isDone = progress >= 100;
        const status = isDone ? "completed" : progress > 0 ? "in_progress" : "enrolled";

        await sql`
          UPDATE workforce_course_enrollments
          SET completed_lessons = ${JSON.stringify(completed)},
              progress_percentage = ${progress},
              status = ${status},
              completed_at = ${isDone ? sql`CURRENT_TIMESTAMP` : null}
          WHERE id = ${enrollmentId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;

        if (isDone) {
          await sql`
            UPDATE workforce_people
            SET competency_score = LEAST(100, competency_score + 5),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${rows[0].person_id} AND LOWER(tenant_slug) = ${cleanSlug};
          `;
        }

        return NextResponse.json({ success: true, progress, status, completedLessons: completed });
      }

      case "ISSUE_CERTIFICATE": {
        const id = payload.id || `cert-${Date.now()}`;
        const randomHex = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
        const verificationHash = payload.verificationHash || `sha256_${Date.now()}_${randomHex}`;
        const certNumber = payload.certificateNumber || `OFIA-CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        await sql`
          INSERT INTO workforce_certificates (
            id, tenant_slug, tenant_id, certificate_number, course_id, course_title,
            person_id, person_name, issue_date, grade, verification_hash, competencies_awarded
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${certNumber}, ${payload.courseId}, ${payload.courseTitle},
            ${payload.personId}, ${payload.personName}, ${payload.issueDate || new Date().toISOString().split("T")[0]},
            ${payload.grade || "Distinction (90%)"}, ${verificationHash},
            ${JSON.stringify(payload.competenciesAwarded || [])}
          );
        `;

        if (payload.personId) {
          await sql`
            UPDATE workforce_people
            SET competency_score = LEAST(100, competency_score + 10),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${payload.personId} AND LOWER(tenant_slug) = ${cleanSlug};
          `;
        }

        await sql`
          INSERT INTO workforce_audit_logs (
            id, tenant_slug, tenant_id, entity_type, entity_id, action, actor_name, changes
          ) VALUES (
            ${`audit-${Date.now()}`}, ${cleanSlug}, ${cleanSlug}, 'certificate', ${id},
            'ISSUE_CERTIFICATE', 'Academy Registrar',
            ${JSON.stringify({ certificateNumber: certNumber, personName: payload.personName, courseTitle: payload.courseTitle })}
          );
        `;

        return NextResponse.json({
          success: true,
          id,
          certificateNumber: certNumber,
          verificationHash,
          message: "Certificate generated and cryptographically registered"
        });
      }

      case "CREATE_PROJECT": {
        const id = payload.id || `proj-${Date.now()}`;
        await sql`
          INSERT INTO workforce_projects (
            id, tenant_slug, tenant_id, title, code, department,
            client_id, client_name, lead_person_id, lead_person_name,
            budget, spent, status, priority, start_date, end_date,
            description, deliverables_count, tasks_count, completed_tasks_count
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.title}, ${payload.code}, ${payload.department},
            ${payload.clientId || ""}, ${payload.clientName || ""}, ${payload.leadPersonId || ""}, ${payload.leadPersonName || "Unassigned"},
            ${payload.budget || 0}, ${payload.spent || 0}, ${payload.status || "active"}, ${payload.priority || "medium"},
            ${payload.startDate || new Date().toISOString().split("T")[0]}, ${payload.endDate || ""},
            ${payload.description || ""}, ${payload.deliverablesCount || 0}, ${payload.tasksCount || 0}, ${payload.completedTasksCount || 0}
          );
        `;
        return NextResponse.json({ success: true, id, message: "Project created successfully" });
      }

      case "UPDATE_PROJECT": {
        await sql`
          UPDATE workforce_projects
          SET status = COALESCE(${payload.status ?? null}, status),
              budget = COALESCE(${payload.budget ?? null}, budget),
              spent = COALESCE(${payload.spent ?? null}, spent),
              lead_person_name = COALESCE(${payload.leadPersonName ?? null}, lead_person_name),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${payload.projectId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        return NextResponse.json({ success: true, message: "Project updated" });
      }

      case "CREATE_TASK": {
        const id = payload.id || `task-${Date.now()}`;
        await sql`
          INSERT INTO workforce_tasks (
            id, tenant_slug, tenant_id, title, project, department,
            assigned_to, supervisor, priority, status, deadline, score, feedback, deliverable_summary,
            project_id, dependencies, estimated_hours, actual_hours, assignees
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.title}, ${payload.project}, ${payload.department},
            ${payload.assignedTo}, ${payload.supervisor}, ${payload.priority || "medium"},
            ${payload.status || "backlog"}, ${payload.deadline}, ${payload.score ?? null},
            ${payload.feedback || ""}, ${payload.deliverableSummary || ""},
            ${payload.projectId || ""}, ${JSON.stringify(payload.dependencies || [])},
            ${payload.estimatedHours || 0}, ${payload.actualHours || 0},
            ${JSON.stringify(payload.assignees || [])}
          );
        `;
        if (payload.projectId) {
          await sql`
            UPDATE workforce_projects
            SET tasks_count = tasks_count + 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${payload.projectId} AND LOWER(tenant_slug) = ${cleanSlug};
          `;
        }
        return NextResponse.json({ success: true, id, message: "Task assigned" });
      }

      case "UPDATE_TASK_STATUS": {
        await sql`
          UPDATE workforce_tasks
          SET status = ${payload.status},
              score = COALESCE(${payload.score ?? null}, score),
              feedback = COALESCE(${payload.feedback ?? null}, feedback),
              actual_hours = COALESCE(${payload.actualHours ?? null}, actual_hours),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${payload.taskId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        if (payload.status === "approved") {
          const tRows = await sql`
            SELECT project_id FROM workforce_tasks
            WHERE id = ${payload.taskId} AND LOWER(tenant_slug) = ${cleanSlug}
            LIMIT 1;
          `;
          if (tRows.length > 0 && tRows[0].project_id) {
            await sql`
              UPDATE workforce_projects
              SET completed_tasks_count = completed_tasks_count + 1, updated_at = CURRENT_TIMESTAMP
              WHERE id = ${tRows[0].project_id} AND LOWER(tenant_slug) = ${cleanSlug};
            `;
          }
        }
        return NextResponse.json({ success: true, message: "Task status updated" });
      }

      case "SUBMIT_DELIVERABLE": {
        const id = payload.id || `deliv-${Date.now()}`;
        await sql`
          INSERT INTO workforce_deliverables (
            id, tenant_slug, tenant_id, project_id, task_id, title,
            submitted_by_id, submitted_by_name, file_url, file_type,
            file_size_bytes, version, status, review_feedback,
            reviewed_by, submitted_at
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.projectId}, ${payload.taskId}, ${payload.title},
            ${payload.submittedById}, ${payload.submittedByName}, ${payload.fileUrl}, ${payload.fileType || "document"},
            ${payload.fileSizeBytes || 0}, ${payload.version || 1}, 'pending_review', '', '', CURRENT_TIMESTAMP
          );
        `;
        await sql`
          UPDATE workforce_tasks
          SET deliverable_id = ${id}, status = 'review', updated_at = CURRENT_TIMESTAMP
          WHERE id = ${payload.taskId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        if (payload.projectId) {
          await sql`
            UPDATE workforce_projects
            SET deliverables_count = deliverables_count + 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${payload.projectId} AND LOWER(tenant_slug) = ${cleanSlug};
          `;
        }
        return NextResponse.json({ success: true, id, message: "Deliverable uploaded to vault and placed under review" });
      }

      case "REVIEW_DELIVERABLE": {
        const isApproved = payload.status === "approved";
        await sql`
          UPDATE workforce_deliverables
          SET status = ${payload.status},
              review_feedback = ${payload.feedback || ""},
              reviewed_by = ${payload.reviewerName || "Supervisor"},
              reviewed_at = CURRENT_TIMESTAMP
          WHERE id = ${payload.deliverableId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;

        if (payload.taskId) {
          await sql`
            UPDATE workforce_tasks
            SET status = ${isApproved ? "approved" : "in_progress"},
                score = COALESCE(${payload.score ?? null}, score),
                feedback = ${payload.feedback || ""},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${payload.taskId} AND LOWER(tenant_slug) = ${cleanSlug};
          `;
        }

        if (isApproved && payload.submittedById) {
          await sql`
            UPDATE workforce_people
            SET competency_score = LEAST(100, competency_score + 5),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${payload.submittedById} AND LOWER(tenant_slug) = ${cleanSlug};
          `;
        }

        return NextResponse.json({ success: true, message: `Deliverable marked as ${payload.status}` });
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

      case "CREATE_DEPARTMENT": {
        const id = payload.id || `dept-${Date.now()}`;
        await sql`
          INSERT INTO workforce_departments (
            id, tenant_slug, tenant_id, name, code, head_person_id, head_person_name,
            budget_monthly, target_headcount, active_headcount, description
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.name}, ${payload.code ? payload.code.toUpperCase() : "GEN"},
            ${payload.headPersonId || ""}, ${payload.headPersonName || "Unassigned"},
            ${payload.budgetMonthly || 0}, ${payload.targetHeadcount || 1},
            ${payload.activeHeadcount || 0}, ${payload.description || ""}
          );
        `;
        return NextResponse.json({ success: true, id, message: "Department created successfully" });
      }

      case "UPDATE_DEPARTMENT": {
        await sql`
          UPDATE workforce_departments
          SET name = COALESCE(${payload.name}, name),
              code = COALESCE(${payload.code ? payload.code.toUpperCase() : null}, code),
              head_person_id = COALESCE(${payload.headPersonId}, head_person_id),
              head_person_name = COALESCE(${payload.headPersonName}, head_person_name),
              budget_monthly = COALESCE(${payload.budgetMonthly}, budget_monthly),
              target_headcount = COALESCE(${payload.targetHeadcount}, target_headcount),
              description = COALESCE(${payload.description}, description),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${payload.departmentId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        return NextResponse.json({ success: true, message: "Department updated successfully" });
      }

      case "DELETE_DEPARTMENT": {
        await sql`
          DELETE FROM workforce_departments
          WHERE id = ${payload.departmentId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        return NextResponse.json({ success: true, message: "Department removed" });
      }

      case "CREATE_BRANCH": {
        const id = payload.id || `branch-${Date.now()}`;
        await sql`
          INSERT INTO workforce_branches (
            id, tenant_slug, tenant_id, name, city, state, address, is_headquarters, manager_name
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.name}, ${payload.city}, ${payload.state},
            ${payload.address}, ${payload.isHeadquarters || false}, ${payload.managerName || "Branch Manager"}
          );
        `;
        return NextResponse.json({ success: true, id, message: "Branch created successfully" });
      }

      case "UPDATE_BRANCH": {
        await sql`
          UPDATE workforce_branches
          SET name = COALESCE(${payload.name}, name),
              city = COALESCE(${payload.city}, city),
              state = COALESCE(${payload.state}, state),
              address = COALESCE(${payload.address}, address),
              is_headquarters = COALESCE(${payload.isHeadquarters}, is_headquarters),
              manager_name = COALESCE(${payload.managerName}, manager_name),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${payload.branchId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        return NextResponse.json({ success: true, message: "Branch updated successfully" });
      }

      case "DELETE_BRANCH": {
        await sql`
          DELETE FROM workforce_branches
          WHERE id = ${payload.branchId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        return NextResponse.json({ success: true, message: "Branch removed" });
      }

      case "UPLOAD_DOCUMENT": {
        const id = payload.id || `doc-${Date.now()}`;
        await sql`
          INSERT INTO workforce_documents (
            id, tenant_slug, tenant_id, person_id, document_type, title,
            file_url, file_size_bytes, uploaded_by, verified
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.personId}, ${payload.documentType || "other"},
            ${payload.title}, ${payload.fileUrl || ""}, ${payload.fileSizeBytes || 0},
            ${payload.uploadedBy || "HR Officer"}, ${payload.verified ?? false}
          );
        `;
        const auditId = `audit-${Date.now()}`;
        await sql`
          INSERT INTO workforce_audit_logs (
            id, tenant_slug, tenant_id, entity_type, entity_id, action, actor_name, changes
          ) VALUES (
            ${auditId}, ${cleanSlug}, ${cleanSlug}, 'person', ${payload.personId},
            'DOCUMENT_UPLOADED', ${payload.uploadedBy || "HR Officer"},
            ${JSON.stringify({ documentTitle: payload.title, documentType: payload.documentType })}
          );
        `;
        return NextResponse.json({ success: true, id, message: "Document uploaded successfully" });
      }

      case "VERIFY_DOCUMENT": {
        await sql`
          UPDATE workforce_documents
          SET verified = true
          WHERE id = ${payload.documentId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        const auditId = `audit-${Date.now()}`;
        await sql`
          INSERT INTO workforce_audit_logs (
            id, tenant_slug, tenant_id, entity_type, entity_id, action, actor_name, changes
          ) VALUES (
            ${auditId}, ${cleanSlug}, ${cleanSlug}, 'document', ${payload.documentId},
            'DOCUMENT_VERIFIED', ${payload.verifiedBy || "Compliance Officer"},
            ${JSON.stringify({ verified: true })}
          );
        `;
        return NextResponse.json({ success: true, message: "Document verified" });
      }

      case "DELETE_DOCUMENT": {
        await sql`
          DELETE FROM workforce_documents
          WHERE id = ${payload.documentId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        return NextResponse.json({ success: true, message: "Document removed" });
      }

      case "UPDATE_PERSON_PROFILE": {
        await sql`
          UPDATE workforce_people
          SET name = COALESCE(${payload.name}, name),
              phone = COALESCE(${payload.phone}, phone),
              email = COALESCE(${payload.email}, email),
              designation = COALESCE(${payload.designation}, designation),
              department = COALESCE(${payload.department}, department),
              role = COALESCE(${payload.role}, role),
              location = COALESCE(${payload.location}, location),
              status = COALESCE(${payload.status}, status),
              manager_name = COALESCE(${payload.managerName}, manager_name),
              residential_address = COALESCE(${payload.residentialAddress}, residential_address),
              emergency_contact = COALESCE(${payload.emergencyContact ? JSON.stringify(payload.emergencyContact) : null}::jsonb, emergency_contact),
              education = COALESCE(${payload.education ? JSON.stringify(payload.education) : null}::jsonb, education),
              employment_history = COALESCE(${payload.employmentHistory ? JSON.stringify(payload.employmentHistory) : null}::jsonb, employment_history),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${payload.personId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        const auditId = `audit-${Date.now()}`;
        await sql`
          INSERT INTO workforce_audit_logs (
            id, tenant_slug, tenant_id, entity_type, entity_id, action, actor_name, changes
          ) VALUES (
            ${auditId}, ${cleanSlug}, ${cleanSlug}, 'person', ${payload.personId},
            'PROFILE_UPDATED', ${payload.actorName || "Admin"},
            ${JSON.stringify(payload)}
          );
        `;
        return NextResponse.json({ success: true, message: "Personnel dossier updated" });
      }

      case "RECORD_AUDIT_LOG": {
        const id = payload.id || `audit-${Date.now()}`;
        await sql`
          INSERT INTO workforce_audit_logs (
            id, tenant_slug, tenant_id, entity_type, entity_id, action, actor_name, changes
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.entityType}, ${payload.entityId},
            ${payload.action}, ${payload.actorName || "System"}, ${JSON.stringify(payload.changes || {})}
          );
        `;
        return NextResponse.json({ success: true, id, message: "Audit event recorded" });
      }

      case "SCHEDULE_INTERVIEW": {
        const id = payload.id || `int-${Date.now()}`;
        const token = payload.token || `tok_int_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await sql`
          INSERT INTO workforce_interviews (
            id, tenant_slug, tenant_id, candidate_id, candidate_name, applied_role,
            stage, scheduled_start, scheduled_end, meeting_url, location_details,
            panel_members, status, interviewer_notes, score, token
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.candidateId}, ${payload.candidateName},
            ${payload.appliedRole}, ${payload.stage || "technical"}, ${payload.scheduledStart},
            ${payload.scheduledEnd}, ${payload.meetingUrl || ""}, ${payload.locationDetails || ""},
            ${JSON.stringify(payload.panelMembers || [])}, 'scheduled', ${payload.interviewerNotes || ""},
            ${payload.score ?? null}, ${token}
          );
        `;
        await sql`
          UPDATE workforce_candidates
          SET stage = 'interview',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${payload.candidateId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        const auditId = `audit-${Date.now()}`;
        await sql`
          INSERT INTO workforce_audit_logs (
            id, tenant_slug, tenant_id, entity_type, entity_id, action, actor_name, changes
          ) VALUES (
            ${auditId}, ${cleanSlug}, ${cleanSlug}, 'candidate', ${payload.candidateId},
            'INTERVIEW_SCHEDULED', ${payload.actorName || "Talent Lead"},
            ${JSON.stringify({ interviewId: id, stage: payload.stage, scheduledStart: payload.scheduledStart })}
          );
        `;
        return NextResponse.json({ success: true, id, token, message: "Interview scheduled successfully" });
      }

      case "UPDATE_INTERVIEW_STATUS": {
        await sql`
          UPDATE workforce_interviews
          SET status = COALESCE(${payload.status}, status),
              score = COALESCE(${payload.score ?? null}, score),
              interviewer_notes = COALESCE(${payload.interviewerNotes}, interviewer_notes)
          WHERE (id = ${payload.interviewId} OR token = ${payload.interviewId}) AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        if (payload.score != null && payload.candidateId) {
          await sql`
            UPDATE workforce_candidates
            SET score = GREATEST(score, ${payload.score}),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${payload.candidateId} AND LOWER(tenant_slug) = ${cleanSlug};
          `;
        }
        return NextResponse.json({ success: true, message: "Interview evaluation saved" });
      }

      case "ISSUE_OFFER": {
        const id = payload.id || `offer-${Date.now()}`;
        const token = payload.token || `tok_offer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await sql`
          INSERT INTO workforce_offers (
            id, tenant_slug, tenant_id, candidate_id, candidate_name, candidate_email,
            role_category, offered_designation, department, monthly_stipend_salary,
            allowances, total_monthly, start_date, expiry_date, offer_letter_text,
            token, status
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.candidateId}, ${payload.candidateName},
            ${payload.candidateEmail}, ${payload.roleCategory || "employee"}, ${payload.offeredDesignation},
            ${payload.department}, ${payload.monthlyStipendSalary || 0}, ${payload.allowances || 0},
            ${payload.totalMonthly || 0}, ${payload.startDate}, ${payload.expiryDate},
            ${payload.offerLetterText}, ${token}, 'issued'
          );
        `;
        await sql`
          UPDATE workforce_candidates
          SET stage = 'offer_issued',
              offer_amount = ${payload.totalMonthly || 0},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${payload.candidateId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        const auditId = `audit-${Date.now()}`;
        await sql`
          INSERT INTO workforce_audit_logs (
            id, tenant_slug, tenant_id, entity_type, entity_id, action, actor_name, changes
          ) VALUES (
            ${auditId}, ${cleanSlug}, ${cleanSlug}, 'candidate', ${payload.candidateId},
            'OFFER_ISSUED', ${payload.actorName || "Talent Lead"},
            ${JSON.stringify({ offerId: id, totalMonthly: payload.totalMonthly, offeredDesignation: payload.offeredDesignation })}
          );
        `;
        return NextResponse.json({ success: true, id, token, message: "Offer issued successfully" });
      }

      case "ACCEPT_OFFER": {
        await sql`
          UPDATE workforce_offers
          SET status = 'accepted',
              accepted_at = CURRENT_TIMESTAMP,
              candidate_signature = ${payload.signature || "Candidate Electronic Signature"}
          WHERE token = ${payload.token} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        if (payload.candidateId) {
          await sql`
            UPDATE workforce_candidates
            SET stage = 'offer_accepted',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${payload.candidateId} AND LOWER(tenant_slug) = ${cleanSlug};
          `;
          const auditId = `audit-${Date.now()}`;
          await sql`
            INSERT INTO workforce_audit_logs (
              id, tenant_slug, tenant_id, entity_type, entity_id, action, actor_name, changes
            ) VALUES (
              ${auditId}, ${cleanSlug}, ${cleanSlug}, 'candidate', ${payload.candidateId},
              'OFFER_ACCEPTED', ${payload.candidateName || "Candidate"},
              ${JSON.stringify({ token: payload.token, signature: payload.signature })}
            );
          `;

          // Auto-initiate onboarding packet if not existing
          const onbId = `onb-${Date.now()}`;
          const onbToken = `tok_onb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await sql`
            INSERT INTO workforce_onboarding_packets (
              id, tenant_slug, tenant_id, candidate_id, candidate_name, candidate_email,
              designation, department, role_category, token, status
            ) VALUES (
              ${onbId}, ${cleanSlug}, ${cleanSlug}, ${payload.candidateId},
              ${payload.candidateName || "New Hire"}, ${payload.candidateEmail || ""},
              ${payload.offeredDesignation || "Team Member"}, ${payload.department || "General"},
              ${payload.roleCategory || "employee"}, ${onbToken}, 'pending_intake'
            );
          `;
        }
        return NextResponse.json({ success: true, message: "Offer letter signed & accepted" });
      }

      case "DECLINE_OFFER": {
        await sql`
          UPDATE workforce_offers
          SET status = 'declined'
          WHERE token = ${payload.token} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        if (payload.candidateId) {
          const auditId = `audit-${Date.now()}`;
          await sql`
            INSERT INTO workforce_audit_logs (
              id, tenant_slug, tenant_id, entity_type, entity_id, action, actor_name, changes
            ) VALUES (
              ${auditId}, ${cleanSlug}, ${cleanSlug}, 'candidate', ${payload.candidateId},
              'OFFER_DECLINED', ${payload.candidateName || "Candidate"},
              ${JSON.stringify({ token: payload.token, reason: payload.reason || "Declined by candidate" })}
            );
          `;
        }
        return NextResponse.json({ success: true, message: "Offer declined" });
      }

      case "INITIATE_ONBOARDING": {
        const id = payload.id || `onb-${Date.now()}`;
        const token = payload.token || `tok_onb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await sql`
          INSERT INTO workforce_onboarding_packets (
            id, tenant_slug, tenant_id, candidate_id, person_id, candidate_name,
            candidate_email, designation, department, role_category, token, status,
            equipment_requisition, system_account
          ) VALUES (
            ${id}, ${cleanSlug}, ${cleanSlug}, ${payload.candidateId}, ${payload.personId || ""},
            ${payload.candidateName}, ${payload.candidateEmail}, ${payload.designation},
            ${payload.department}, ${payload.roleCategory || "employee"}, ${token}, 'pending_intake',
            ${JSON.stringify(payload.equipmentRequisition || {})},
            ${JSON.stringify(payload.systemAccount || {})}
          );
        `;
        const auditId = `audit-${Date.now()}`;
        await sql`
          INSERT INTO workforce_audit_logs (
            id, tenant_slug, tenant_id, entity_type, entity_id, action, actor_name, changes
          ) VALUES (
            ${auditId}, ${cleanSlug}, ${cleanSlug}, 'onboarding', ${id},
            'ONBOARDING_INITIATED', ${payload.actorName || "Talent Operations"},
            ${JSON.stringify({ candidateId: payload.candidateId, designation: payload.designation })}
          );
        `;
        return NextResponse.json({ success: true, id, token, message: "Onboarding initiated successfully" });
      }

      case "SUBMIT_ONBOARDING_DOSSIER": {
        await sql`
          UPDATE workforce_onboarding_packets
          SET nin = COALESCE(${payload.nin}, nin),
              bvn = COALESCE(${payload.bvn}, bvn),
              residential_address = COALESCE(${payload.residentialAddress}, residential_address),
              bank_details = COALESCE(${payload.bankDetails ? JSON.stringify(payload.bankDetails) : null}::jsonb, bank_details),
              next_of_kin = COALESCE(${payload.nextOfKin ? JSON.stringify(payload.nextOfKin) : null}::jsonb, next_of_kin),
              equipment_requisition = COALESCE(${payload.equipmentRequisition ? JSON.stringify(payload.equipmentRequisition) : null}::jsonb, equipment_requisition),
              documents_submitted = COALESCE(${payload.documentsSubmitted ? JSON.stringify(payload.documentsSubmitted) : null}::jsonb, documents_submitted),
              status = 'in_review',
              submitted_at = CURRENT_TIMESTAMP
          WHERE token = ${payload.token} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        const auditId = `audit-${Date.now()}`;
        await sql`
          INSERT INTO workforce_audit_logs (
            id, tenant_slug, tenant_id, entity_type, entity_id, action, actor_name, changes
          ) VALUES (
            ${auditId}, ${cleanSlug}, ${cleanSlug}, 'onboarding', ${payload.token},
            'ONBOARDING_DOSSIER_SUBMITTED', ${payload.candidateName || "Candidate"},
            ${JSON.stringify({ token: payload.token, submittedAt: new Date().toISOString() })}
          );
        `;
        return NextResponse.json({ success: true, message: "Onboarding packet submitted for HR review" });
      }

      case "APPROVE_ONBOARDING_DOSSIER": {
        await sql`
          UPDATE workforce_onboarding_packets
          SET status = 'approved',
              approved_at = CURRENT_TIMESTAMP
          WHERE (id = ${payload.packetId} OR token = ${payload.packetId}) AND LOWER(tenant_slug) = ${cleanSlug};
        `;
        const auditId = `audit-${Date.now()}`;
        await sql`
          INSERT INTO workforce_audit_logs (
            id, tenant_slug, tenant_id, entity_type, entity_id, action, actor_name, changes
          ) VALUES (
            ${auditId}, ${cleanSlug}, ${cleanSlug}, 'onboarding', ${payload.packetId},
            'ONBOARDING_APPROVED', ${payload.actorName || "HR Lead"},
            ${JSON.stringify({ packetId: payload.packetId })}
          );
        `;
        return NextResponse.json({ success: true, message: "Onboarding packet approved" });
      }

      case "PROVISION_SYSTEM_USER": {
        const personId = payload.personId || `per-${Date.now()}`;
        const corporateEmail = payload.corporateEmail || `${payload.candidateName.toLowerCase().replace(/\s+/g, ".")}@ofia.ng`;

        await sql`
          UPDATE workforce_onboarding_packets
          SET status = 'provisioned',
              person_id = ${personId},
              provisioned_at = CURRENT_TIMESTAMP,
              system_account = jsonb_set(
                COALESCE(system_account, '{}'::jsonb),
                '{isProvisioned}',
                'true'::jsonb
              )
          WHERE (id = ${payload.packetId} OR token = ${payload.packetId}) AND LOWER(tenant_slug) = ${cleanSlug};
        `;

        await sql`
          INSERT INTO workforce_people (
            id, tenant_slug, tenant_id, name, email, phone, role, designation,
            department, status, location, join_date, residential_address, manager_name
          ) VALUES (
            ${personId}, ${cleanSlug}, ${cleanSlug}, ${payload.candidateName},
            ${corporateEmail}, ${payload.phone || ""}, ${payload.roleCategory || "employee"},
            ${payload.designation}, ${payload.department}, 'active',
            ${payload.location || "Lagos HQ"}, ${new Date().toISOString().split("T")[0]},
            ${payload.residentialAddress || ""}, ${payload.managerName || "HR Lead"}
          ) ON CONFLICT (id) DO UPDATE SET
            status = 'active',
            email = EXCLUDED.email,
            designation = EXCLUDED.designation,
            department = EXCLUDED.department;
        `;

        if (payload.candidateId) {
          await sql`
            UPDATE workforce_candidates
            SET stage = 'onboarded',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${payload.candidateId} AND LOWER(tenant_slug) = ${cleanSlug};
          `;
        }

        const auditId = `audit-${Date.now()}`;
        await sql`
          INSERT INTO workforce_audit_logs (
            id, tenant_slug, tenant_id, entity_type, entity_id, action, actor_name, changes
          ) VALUES (
            ${auditId}, ${cleanSlug}, ${cleanSlug}, 'person', ${personId},
            'SYSTEM_USER_PROVISIONED', ${payload.actorName || "IT & People Ops"},
            ${JSON.stringify({ corporateEmail, designation: payload.designation, accessRole: payload.accessRole })}
          );
        `;
        return NextResponse.json({
          success: true,
          personId,
          corporateEmail,
          message: "System user provisioned and personnel profile activated",
        });
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
