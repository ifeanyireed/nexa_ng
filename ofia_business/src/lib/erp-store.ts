"use client";

import { useEffect, useState, useCallback } from "react";

export type Role = "employee" | "manager" | "hr" | "md" | "admin" | "accountant";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  avatar: string;
  managerName?: string;
  managerId?: string;
  ratingTrend?: number[];
  designation?: string;
  gradeLevel?: string;
  employmentDate?: string;
  company?: string;
  location?: string;
  password?: string;
}

export function getParentDept(deptName: string): string {
  if (!deptName) return "Other";
  const name = deptName.trim();
  if (name.startsWith("Fleet")) return "Fleet";
  if (name.startsWith("Marketing")) return "Marketing";
  if (name.startsWith("NOC")) return "NOC";
  if (name.startsWith("Finance")) return "Finance & Accounts";
  if (name.startsWith("ERP/IT") || name.startsWith("Systems")) return "Systems and IT";
  if (name.startsWith("Admin/HR")) return "Admin/HR";
  if (name.startsWith("HR") || name.startsWith("Human")) return "Human Resources";
  if (name.startsWith("Legal")) return "Legal";
  if (name.startsWith("Workshop")) return "Workshop";
  if (name.startsWith("Internal Control")) return "Internal Control";
  if (name.startsWith("KHLC") || name.startsWith("SU ")) return "KHLC - Skillup";
  return "Other";
}

export function calculateSelfAverage(rev: PerformanceReview | null | undefined): number {
  if (!rev) return 0;
  
  if (rev.objectives && rev.objectives.length > 0) {
    let workWeightedSum = 0;
    let workTotalWeight = 0;
    let compWeightedSum = 0;
    let compTotalWeight = 0;
    let totalScoreSum = 0;
    let totalCount = 0;

    for (const o of rev.objectives) {
      if (o.selfScore !== undefined && o.selfScore !== null && !isNaN(o.selfScore)) {
        const isCompetency = o.type === "competency" || (o.expectedLevel !== undefined && o.expectedLevel !== null);
        // Normalize to 10-point scale:
        // Competency (1-5 scale) -> multiply by 2 (e.g. 4 -> 8.0, 5 -> 10.0)
        // Work objective (0-100% scale) -> divide by 10 (e.g. 90 -> 9.0, 80 -> 8.0)
        const normalized = isCompetency 
          ? (o.selfScore > 5 ? o.selfScore / 10.0 : o.selfScore * 2.0) 
          : (o.selfScore <= 10 ? o.selfScore : o.selfScore / 10.0);
        
        const weight = o.weight || 10;
        if (isCompetency) {
          compWeightedSum += normalized * weight;
          compTotalWeight += weight;
        } else {
          workWeightedSum += normalized * weight;
          workTotalWeight += weight;
        }
        totalScoreSum += normalized;
        totalCount += 1;
      }
    }

    if (workTotalWeight > 0 && compTotalWeight > 0) {
      return (workWeightedSum / workTotalWeight) * 0.7 + (compWeightedSum / compTotalWeight) * 0.3;
    } else if (workTotalWeight > 0) {
      return workWeightedSum / workTotalWeight;
    } else if (compTotalWeight > 0) {
      return compWeightedSum / compTotalWeight;
    } else if (totalCount > 0) {
      return totalScoreSum / totalCount;
    }
  }

  // If review has a finalScore or manager reviewed status, estimate self average
  if (rev.finalScore !== undefined && rev.finalScore !== null && rev.finalScore > 0) {
    // Self rating is typically within realistic margin of final score
    return Math.min(10, Math.max(1, Number(rev.finalScore.toFixed(1))));
  }

  return 0;
}

export function formatSelfAverage(rev: PerformanceReview | null | undefined): string {
  const avg = calculateSelfAverage(rev);
  return avg > 0 ? avg.toFixed(1) : "—";
}

export const DEPARTMENTS = [
  "Admin/HR 1 (Front Desk & Account Support)",
  "Admin/HR 2 (Front Desk)",
  "Admin/HR 3 (Office Assistant)",
  "ERP/IT 1 (ERP/IT Officer)",
  "Finance 1 (Acc Payable)",
  "Finance 2 (Acc Receivable)",
  "Finance 3 (Accountant)",
  "Finance 4 (Finance Analyst)",
  "Finance 5 (Head of Finance)",
  "Fleet 1 (Bus Assistant)",
  "Fleet 2 (Fleet Officer)",
  "Fleet 3 (Fleet Support Officer)",
  "Fleet 4 (Facility Manager)",
  "Fleet 5 (Fleet Maintenance North)",
  "Fleet 6 (Fleet Operations Manager)",
  "Fleet 7 (HSE Executive)",
  "Fleet 8 (Fleet Supervisor)",
  "HR 1 (HR Executive 1)",
  "HR 2 (HR Executive 2)",
  "HR 3 (Head of HR)",
  "Head of Operations",
  "Internal Control 1 (Internal Control)",
  "Legal 1 (Legal Counsel & EA)",
  "Legal 2 (Legal Counsel & PM)",
  "Marketing 1 (Head of Marketing)",
  "Marketing 2 (Marketing Executive & CSR)",
  "Marketing 3 (Marketing Executive)",
  "Marketing 4 (Marketing Manager)",
  "Marketing 5 (Social Media Executive)",
  "Marketing 6 (Sales Closer)",
  "NOC 1 (Fleet Monitoring & NOC Supervisor)",
  "NOC 2 (Fleet Monitoring Officer)",
  "Workshop 1 (Mechanic)",
  "Workshop 2 (Workshop Assistant)",
  "Workshop 3 (Workshop Manager)",
  "KHLC 1 (Instructor)",
  "KHLC 2 (Supervisor)",
  "KHLC 3 (Program Coordinator)",
  "KHLC 4 (Admin Officer)",
  "KHLC 5 (Head of C&R/CBT)",
  "KHLC 6 (IT/Technical Support)",
  "SU 1 (Program Coordinator)"
] as const;

export interface ReviewCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "Draft" | "Active" | "Completed";
  departments: string[];
}

export interface Objective {
  id: string;
  text: string;
  weight: number; // percentage
  type: "competency" | "objective"; // Categorized rating
  expectedLevel?: number; // Expected competency level (1-5)
  category?: "Behavioural" | "Leadership" | "Technical" | "Culture" | "Role Specific" | "Self-Development" | string;
  departments?: string[];
  selfScore?: number;
  managerScore?: number;
  comments?: string;
  evidence?: string;
  managerFeedback?: string;
  description?: string[];
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  cycleId: string;
  cycleName: string;
  status: "Draft" | "Submitted" | "Manager Reviewed" | "HR Approved" | "Returned";
  objectives: Objective[];
  employeeComments?: string;
  managerComments?: string;
  hrComments?: string;
  improvementPlan?: string;
  finalScore?: number;
  updatedAt: string;
}

const INITIAL_CYCLES: ReviewCycle[] = [
  {
    id: "CYC001",
    name: "2026 Mid-Year Performance Cycle",
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    status: "Active",
    departments: [...DEPARTMENTS],
  },
  {
    id: "CYC002",
    name: "2025 Annual Review Cycle",
    startDate: "2025-11-01",
    endDate: "2025-12-31",
    status: "Completed",
    departments: [...DEPARTMENTS],
  },
];

const INITIAL_USERS: User[] = [
  { id: "EMP001", name: "Asiegbu Chioma John", email: "chioma.asiegbu@ofia.ng", role: "employee", department: "Marketing 2 (Marketing Executive & CSR)", avatar: "/character1.jpg", company: "NETS", designation: "Marketing Executive" },
  { id: "EMP002", name: "Saheed Akanbi Yusuf", email: "saheed.akanbi@ofia.ng", role: "employee", department: "Fleet 4 (Facility Manager)", avatar: "/character2.jpg", company: "NETS", designation: "Facility Manager" },
  { id: "EMP003", name: "Iheukwumere Friday Kelechi", email: "kelechi.friday@ofia.ng", role: "employee", department: "Fleet 8 (Fleet Supervisor)", avatar: "/character3.jpg", company: "NETS", designation: "Fleet Supervisor" },
  { id: "EMP004", name: "Tunmie Johnson Ekanmbakumo", email: "tunmie.johnson@ofia.ng", role: "employee", department: "Fleet 8 (Fleet Supervisor)", avatar: "/character4.jpg", company: "NETS", designation: "Fleet Supervisor" },
  { id: "EMP005", name: "Aremu Abiodun Najeem", email: "abiodun.aremu@ofia.ng", role: "employee", department: "Fleet 8 (Fleet Supervisor)", avatar: "/character5.jpg", company: "NETS", designation: "Fleet Supervisor" },
  { id: "EMP006", name: "Babatunde Adeleke", email: "babatunde.adeleke@ofia.ng", role: "employee", department: "Fleet 2 (Fleet Officer)", avatar: "/character6.jpg", company: "NETS", designation: "Fleet Officer" },
  { id: "EMP007", name: "Chukwuma Eze", email: "chukwuma.eze@ofia.ng", role: "employee", department: "NOC 1 (Fleet Monitoring & NOC Supervisor)", avatar: "/character7.jpg", company: "NETS", designation: "NOC Supervisor" },
  { id: "EMP008", name: "Amina Bello", email: "amina.bello@ofia.ng", role: "employee", department: "Marketing 1 (Head of Marketing)", avatar: "/character8.jpg", company: "NETS", designation: "Head of Marketing" },
  { id: "EMP010", name: "Oladipo Samuel", email: "samuel.oladipo@ofia.ng", role: "employee", department: "ERP/IT 1 (ERP/IT Officer)", avatar: "/character10.jpg", company: "NETS", designation: "ERP/IT Officer" },
  { id: "EMP011", name: "Ngozi Okeke", email: "ngozi.okeke@ofia.ng", role: "employee", department: "Finance 1 (Acc Payable)", avatar: "/character11.jpg", company: "NETS", designation: "Accounts Payable" },
  { id: "EMP012", name: "Yusuf Haruna", email: "yusuf.haruna@ofia.ng", role: "employee", department: "Workshop 3 (Workshop Manager)", avatar: "/character12.jpg", company: "NETS", designation: "Workshop Manager" },
  { id: "EMP034", name: "Banwo Ibisola Yetunde", email: "ibisola.banwo@ofia.ng", role: "employee", department: "KHLC 2 (Supervisor)", avatar: "/character13.jpg", company: "KHLC", designation: "Supervisor" },
  { id: "EMP035", name: "Iniobong Christiana Okokon", email: "iniobong.okokon@ofia.ng", role: "employee", department: "SU 1 (Program Coordinator)", avatar: "/character14.jpg", company: "KHLC", designation: "Program Coordinator" },
  { id: "EMP036", name: "Nwantu Faith Titus", email: "faith.nwantu@ofia.ng", role: "employee", department: "KHLC 1 (Instructor)", avatar: "/character15.jpg", company: "KHLC", designation: "Instructor" },
  { id: "EMP037", name: "Favour Ezekiel Oladapo", email: "favour.oladapo@ofia.ng", role: "employee", department: "KHLC 6 (IT/Technical Support)", avatar: "/character16.jpg", company: "KHLC", designation: "IT Support" },
  { id: "EMP038", name: "Faniyi Olawale Tosin", email: "olawale.faniyi@ofia.ng", role: "employee", department: "KHLC 1 (Instructor)", avatar: "/character17.jpg", company: "KHLC", designation: "Instructor" },
  { id: "ACC001", name: "Victoria Aghogho Otojareri", email: "victoria.otojareri@ofia.ng", role: "employee", department: "Finance 3 (Accountant)", avatar: "/character18.jpg", company: "NETS", designation: "Accountant" },
  { id: "HR001", name: "HR Administrator", email: "hr@ofia.ng", role: "hr", department: "Human Resources", avatar: "/character19.jpg", designation: "HR Lead" },
];

const INITIAL_REVIEWS: PerformanceReview[] = [
  {
    id: "REV001EMP034",
    employeeId: "EMP034",
    employeeName: "Banwo Ibisola Yetunde",
    department: "KHLC 2 (Supervisor)",
    cycleId: "CYC001",
    cycleName: "2026 Mid-Year Performance Cycle",
    status: "Manager Reviewed",
    finalScore: 8.4,
    employeeComments: "Successfully supervised daily operations while teaching and maintaining high standards of quality, safety and professionalism. Ensured compliance with organizational policies.",
    managerComments: "Ibisola, you have been a dependable and committed supervisor who consistently demonstrates professionalism, responsibility, and a genuine willingness to support the team.",
    objectives: [],
    updatedAt: "2026-07-15T14:40:32.000Z",
  },
  {
    id: "REV001EMP035",
    employeeId: "EMP035",
    employeeName: "Iniobong Christiana Okokon",
    department: "SU 1 (Program Coordinator)",
    cycleId: "CYC001",
    cycleName: "2026 Mid-Year Performance Cycle",
    status: "Manager Reviewed",
    finalScore: 7.3,
    employeeComments: "During the first half of the year, I have demonstrated strong commitment and ownership in coordinating SkillUp Academy's programs and daily operations.",
    managerComments: "You have demonstrated strong commitment to the day-to-day operations and contributed significantly to ensuring training programs run smoothly.",
    objectives: [],
    updatedAt: "2026-07-16T11:42:16.000Z",
  },
  {
    id: "REV001EMP036",
    employeeId: "EMP036",
    employeeName: "Nwantu Faith Titus",
    department: "KHLC 1 (Instructor)",
    cycleId: "CYC001",
    cycleName: "2026 Mid-Year Performance Cycle",
    status: "Manager Reviewed",
    finalScore: 7.6,
    employeeComments: "Delivered curriculum on schedule, maintained 95% student retention and conducted hands-on robotics workshops.",
    managerComments: "You have done an excellent job, and your hard work is truly commendable. Keep striving for excellence.",
    objectives: [],
    updatedAt: "2026-07-17T10:18:55.000Z",
  },
  {
    id: "REV001EMP038",
    employeeId: "EMP038",
    employeeName: "Faniyi Olawale Tosin",
    department: "KHLC 1 (Instructor)",
    cycleId: "CYC001",
    cycleName: "2026 Mid-Year Performance Cycle",
    status: "Manager Reviewed",
    finalScore: 8.7,
    employeeComments: "I consistently carried out my responsibilities with professionalism and dedication, delivered lessons effectively, and supported students' learning and development.",
    managerComments: "The Instructor has consistently carried out responsibilities with professionalism. He delivers lessons effectively and supports student development.",
    objectives: [],
    updatedAt: "2026-07-17T11:30:00.000Z",
  },
  {
    id: "REV001EMP006",
    employeeId: "EMP006",
    employeeName: "Babatunde Adeleke",
    department: "Fleet 2 (Fleet Officer)",
    cycleId: "CYC001",
    cycleName: "2026 Mid-Year Performance Cycle",
    status: "Manager Reviewed",
    finalScore: 8.1,
    employeeComments: "Managed daily route dispatch, conducted vehicle pre-trip inspections, and kept turnaround time under 15 minutes.",
    managerComments: "Prompt, thorough with vehicle health records, and resolves dispatch bottlenecks proactively.",
    objectives: [],
    updatedAt: "2026-07-18T09:15:00.000Z",
  },
  {
    id: "REV001EMP007",
    employeeId: "EMP007",
    employeeName: "Chukwuma Eze",
    department: "NOC 1 (Fleet Monitoring & NOC Supervisor)",
    cycleId: "CYC001",
    cycleName: "2026 Mid-Year Performance Cycle",
    status: "Manager Reviewed",
    finalScore: 8.8,
    employeeComments: "24/7 telematics monitoring achieved 99.4% uptime. Geofencing alert response time reduced to 3 minutes.",
    managerComments: "Exemplary vigilance and fast emergency escalation protocols. Excellent leadership of the monitoring desk.",
    objectives: [],
    updatedAt: "2026-07-18T14:20:00.000Z",
  },
  {
    id: "REV001EMP008",
    employeeId: "EMP008",
    employeeName: "Amina Bello",
    department: "Marketing 1 (Head of Marketing)",
    cycleId: "CYC001",
    cycleName: "2026 Mid-Year Performance Cycle",
    status: "Manager Reviewed",
    finalScore: 9.1,
    employeeComments: "Achieved 32% increase in qualified corporate leads and launched successful multi-channel Q2 branding campaign.",
    managerComments: "Strategic mindset, strong campaign ROI, and effective cross-departmental alignment.",
    objectives: [],
    updatedAt: "2026-07-19T10:00:00.000Z",
  },
  {
    id: "REV001EMP010",
    employeeId: "EMP010",
    employeeName: "Oladipo Samuel",
    department: "ERP/IT 1 (ERP/IT Officer)",
    cycleId: "CYC001",
    cycleName: "2026 Mid-Year Performance Cycle",
    status: "Manager Reviewed",
    finalScore: 8.5,
    employeeComments: "Delivered ERP automated module updates, 99.8% network uptime, and resolved 94% of helpdesk tickets within SLA.",
    managerComments: "Very dependable technical problem solver with rapid resolution turnaround.",
    objectives: [],
    updatedAt: "2026-07-19T16:45:00.000Z",
  },
  {
    id: "REV001EMP011",
    employeeId: "EMP011",
    employeeName: "Ngozi Okeke",
    department: "Finance 1 (Acc Payable)",
    cycleId: "CYC001",
    cycleName: "2026 Mid-Year Performance Cycle",
    status: "Manager Reviewed",
    finalScore: 8.2,
    employeeComments: "Maintained 100% accurate vendor payment schedules, zero late penalties, and full audit documentation.",
    managerComments: "High accuracy rate in reconciliations and timely payment processing across all supplier categories.",
    objectives: [],
    updatedAt: "2026-07-20T08:30:00.000Z",
  },
  {
    id: "REV001EMP012",
    employeeId: "EMP012",
    employeeName: "Yusuf Haruna",
    department: "Workshop 3 (Workshop Manager)",
    cycleId: "CYC001",
    cycleName: "2026 Mid-Year Performance Cycle",
    status: "Manager Reviewed",
    finalScore: 8.6,
    employeeComments: "Reduced vehicle overhaul downtime by 22% and introduced structured preventive maintenance checklists.",
    managerComments: "Outstanding workshop supervision, high technical standards, and disciplined parts inventory management.",
    objectives: [],
    updatedAt: "2026-07-20T11:10:00.000Z",
  },
  {
    id: "REV001EMP001",
    employeeId: "EMP001",
    employeeName: "Asiegbu Chioma John",
    department: "Marketing 2 (Marketing Executive & CSR)",
    cycleId: "CYC001",
    cycleName: "2026 Mid-Year Performance Cycle",
    status: "HR Approved",
    finalScore: 7.8,
    employeeComments: "Maintained strong client relationships by responding promptly to inquiries and supporting marketing activities.",
    managerComments: "Performing satisfactorily with steady improvement in customer follow-up.",
    hrComments: "Audited and confirmed by HR. Development plan approved.",
    objectives: [],
    updatedAt: "2026-07-17T12:42:55.000Z",
  },
  {
    id: "REV001EMP002",
    employeeId: "EMP002",
    employeeName: "Saheed Akanbi Yusuf",
    department: "Fleet 4 (Facility Manager)",
    cycleId: "CYC001",
    cycleName: "2026 Mid-Year Performance Cycle",
    status: "HR Approved",
    finalScore: 9.1,
    employeeComments: "Completed all scheduled facility maintenance checks and resolved electrical and plumbing issues within 24 hours.",
    managerComments: "Very active and proactive in premises management.",
    hrComments: "Audit complete. Facility maintenance standards verified.",
    objectives: [],
    updatedAt: "2026-07-17T12:45:23.000Z",
  },
  {
    id: "REV001EMP003",
    employeeId: "EMP003",
    employeeName: "Iheukwumere Friday Kelechi",
    department: "Fleet 8 (Fleet Supervisor)",
    cycleId: "CYC001",
    cycleName: "2026 Mid-Year Performance Cycle",
    status: "HR Approved",
    finalScore: 9.5,
    employeeComments: "Achieved 100% regulatory compliance, zero vehicle impoundments, and 98% on-time trip dispatches.",
    managerComments: "Exceptionally dependable supervisor with high operational leadership.",
    hrComments: "Highest category rating verified.",
    objectives: [],
    updatedAt: "2026-07-20T09:14:58.000Z",
  },
  {
    id: "REV001EMP004",
    employeeId: "EMP004",
    employeeName: "Tunmie Johnson Ekanmbakumo",
    department: "Fleet 8 (Fleet Supervisor)",
    cycleId: "CYC001",
    cycleName: "2026 Mid-Year Performance Cycle",
    status: "HR Approved",
    finalScore: 5.4,
    employeeComments: "Remained committed to achieving responsibilities and following company standards.",
    managerComments: "Efforts noted, but needs greater proactive planning and adherence to reporting schedules.",
    hrComments: "Performance improvement plan initiated with supervisor.",
    objectives: [],
    updatedAt: "2026-07-20T09:16:55.000Z",
  },
  {
    id: "REV001EMP005",
    employeeId: "EMP005",
    employeeName: "Aremu Abiodun Najeem",
    department: "Fleet 8 (Fleet Supervisor)",
    cycleId: "CYC001",
    cycleName: "2026 Mid-Year Performance Cycle",
    status: "HR Approved",
    finalScore: 8.5,
    employeeComments: "Completed weekly incident reports on time and supported driver welfare programs.",
    managerComments: "Reliable team player with sound vehicle inspection execution.",
    hrComments: "Verified and signed off.",
    objectives: [],
    updatedAt: "2026-07-17T12:48:20.000Z",
  },
  {
    id: "REV001EMP037",
    employeeId: "EMP037",
    employeeName: "Favour Ezekiel Oladapo",
    department: "KHLC 6 (IT/Technical Support)",
    cycleId: "CYC001",
    cycleName: "2026 Mid-Year Performance Cycle",
    status: "Submitted",
    finalScore: 0,
    employeeComments: "I have done well so far, but I believe I can do better.",
    objectives: [],
    updatedAt: "2026-07-20T15:13:07.000Z",
  },
  {
    id: "REV001ACC001",
    employeeId: "ACC001",
    employeeName: "Victoria Aghogho Otojareri",
    department: "Finance 3 (Accountant)",
    cycleId: "CYC001",
    cycleName: "2026 Mid-Year Performance Cycle",
    status: "Draft",
    objectives: [],
    updatedAt: "2026-07-17T23:21:34.000Z",
  },
];

const DEFAULT_OBJECTIVES: Objective[] = [];

const API_BASE_URL = typeof window !== "undefined" ? "/api/erp" : (process.env.ERP_SERVICE_URL || process.env.NEXT_PUBLIC_ERP_SERVICE_URL || "https://ofia-erp-service.onrender.com");

export function getActiveTenantSlug(): string {
  if (typeof window === "undefined") return "";

  // 1. Check URL search parameters
  const urlParams = new URLSearchParams(window.location.search);
  const param = urlParams.get("tenant") || urlParams.get("tenant_slug") || urlParams.get("company");
  if (param) return param.toLowerCase().trim();

  // 2. Check Hostname Subdomain
  const host = window.location.host.toLowerCase();
  const hostParts = host.split(":")[0].split(".");
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");

  if (!isLocal && hostParts.length > 2) {
    const sub = hostParts[0];
    if (!["www", "ofia", "app", "nexa", "erp"].includes(sub)) {
      return sub;
    }
  }

  // 3. Check Session / Local Storage
  try {
    const storedTenant = localStorage.getItem("nexa_org_id");
    if (storedTenant && !["ofia", "www", "app", "erp"].includes(storedTenant)) {
      return storedTenant.toLowerCase().trim();
    }
    const storedUser = localStorage.getItem("erp_current_user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed?.tenantSlug) return parsed.tenantSlug.toLowerCase().trim();
    }
  } catch {}

  return "";
}

export function getSignedInERPUser(users: User[]): User {
  const fallbackUser: User = {
    id: "USR-ADMIN-01",
    name: "Workspace Admin",
    email: "admin@ofia.ng",
    role: "admin",
    department: "Executive Directorate",
    avatar: "/character1.jpg",
  };

  if (typeof window === "undefined") {
    return users.length > 0 ? users[0] : fallbackUser;
  }

  try {
    const storedName = localStorage.getItem("nexa_user_name");
    const storedEmail = localStorage.getItem("nexa_user_email");
    const storedRole = localStorage.getItem("nexa_user_role") || "admin";
    const tenantSlug = getActiveTenantSlug() || "neweratransports";
    const tenantAdminName =
      localStorage.getItem("tenant_admin_name_" + tenantSlug) ||
      localStorage.getItem("tenant_admin_name_org-01") ||
      localStorage.getItem("tenant_admin_name_neweratransports");
    const tenantAdminEmail =
      localStorage.getItem("tenant_admin_email_" + tenantSlug) ||
      localStorage.getItem("tenant_admin_email_org-01") ||
      localStorage.getItem("tenant_admin_email_neweratransports");

    let parsed: any = null;
    const storedUser = localStorage.getItem("erp_current_user");
    if (storedUser) {
      try {
        parsed = JSON.parse(storedUser);
      } catch {}
    }

    const effectiveName =
      (storedRole === "admin" && tenantAdminName) ||
      storedName ||
      parsed?.name ||
      tenantAdminName ||
      (users.length > 0 ? users[0].name : "Workspace Admin");

    const effectiveEmail =
      storedEmail ||
      parsed?.email ||
      tenantAdminEmail ||
      (users.length > 0 ? users[0].email : "admin@ofia.ng");

    const effectiveRole =
      storedRole ||
      parsed?.role ||
      "admin";

    // 1. If live database users list has a match by ID, Email, or Name
    if (users && users.length > 0) {
      const match = users.find(
        (u) =>
          (parsed?.id && u.id === parsed.id) ||
          (effectiveEmail && u.email && u.email.toLowerCase() === effectiveEmail.toLowerCase()) ||
          (effectiveName && u.name && u.name.toLowerCase() === effectiveName.toLowerCase())
      );
      if (match) {
        const syncedUser: User = {
          ...match,
          name: effectiveName || match.name,
          email: effectiveEmail || match.email,
          role: effectiveRole || match.role,
        };
        return syncedUser;
      }
    }

    // 2. If the user is logged in with custom details or as Admin/Manager/Employee
    if (effectiveName || effectiveEmail) {
      return {
        id: parsed?.id || (effectiveRole === "admin" ? "USR-ADMIN-01" : "EMP001"),
        name: effectiveName,
        email: effectiveEmail,
        role: effectiveRole,
        department: parsed?.department || "Executive Directorate",
        designation:
          parsed?.designation ||
          (effectiveRole === "admin"
            ? "Executive Director & Workspace Admin"
            : effectiveRole === "manager"
            ? "Operations & Line Manager"
            : "Staff Member"),
        avatar: parsed?.avatar || "/character1.jpg",
        company: parsed?.company || "Organization",
        managerName: parsed?.managerName,
        managerId: parsed?.managerId,
      };
    }
  } catch (e) {
    console.warn("Failed to parse signed-in ERP user session:", e);
  }

  return users.length > 0 ? users[0] : fallbackUser;
}

async function fetchFromApi<T>(endpoint: string, fallbackData: T, tenantSlug?: string): Promise<T> {
  const activeSlug = tenantSlug || getActiveTenantSlug();
  const sep = endpoint.includes("?") ? "&" : "?";
  const urlWithTenant = activeSlug
    ? `${API_BASE_URL}${endpoint}${sep}tenant=${encodeURIComponent(activeSlug)}`
    : `${API_BASE_URL}${endpoint}`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (activeSlug) {
      headers["x-tenant-slug"] = activeSlug;
    }

    const res = await fetch(urlWithTenant, {
      cache: "no-store",
      headers,
    });
    if (!res.ok) {
      return fallbackData;
    }
    const data = await res.json().catch(() => null);
    if (!data) return fallbackData;
    if (Array.isArray(fallbackData) && (!Array.isArray(data) || data.length === 0)) {
      return fallbackData;
    }
    return data;
  } catch (err) {
    return fallbackData;
  }
}

async function ensureReviewsForActiveCycles(
  usersList: User[],
  cyclesList: ReviewCycle[],
  reviewsList: PerformanceReview[],
  objectivesList: Objective[],
  tenantSlug: string,
  onReviewsCreated: (updated: PerformanceReview[]) => void
) {
  const activeCycle = cyclesList.find(c => c.status === "Active");
  if (!activeCycle || usersList.length === 0 || objectivesList.length === 0) return;

  let updatedReviews = [...reviewsList];
  let newReviewsToPost: PerformanceReview[] = [];

  for (const user of usersList) {
    const hasReview = updatedReviews.some(r => r.employeeId === user.id && r.cycleId === activeCycle.id);
    if (!hasReview) {
      const relevantObjectives = objectivesList.filter(o => {
        if (o.type === "competency") return true;
        return (o.type === "objective" || !o.type) && o.departments?.includes(user.department);
      });

      const newReviewId = `REV${activeCycle.id.replace("CYC", "")}${user.id}`;
      const newReview: PerformanceReview = {
        id: newReviewId,
        employeeId: user.id,
        employeeName: user.name,
        department: user.department,
        cycleId: activeCycle.id,
        cycleName: activeCycle.name,
        status: "Draft",
        objectives: relevantObjectives.map(o => ({
          ...o,
          selfScore: undefined,
          managerScore: undefined,
          comments: undefined,
          evidence: undefined,
          managerFeedback: undefined
        })),
        updatedAt: new Date().toISOString()
      };

      updatedReviews.push(newReview);
      newReviewsToPost.push(newReview);
    }
  }

  if (newReviewsToPost.length > 0) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (tenantSlug) headers["x-tenant-slug"] = tenantSlug;

      await fetch(`${API_BASE_URL}/reviews${tenantSlug ? `?tenant=${encodeURIComponent(tenantSlug)}` : ""}`, {
        method: "POST",
        headers,
        body: JSON.stringify(newReviewsToPost)
      });
    } catch (e) {
      console.warn("Failed to sync auto-created reviews batch", e);
    }
    onReviewsCreated(updatedReviews);
  }
}

export function useERPStore(explicitTenantSlug?: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeTenantSlug = explicitTenantSlug || (typeof window !== "undefined" ? getActiveTenantSlug() : "");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const usersData = await fetchFromApi<User[]>("/users", INITIAL_USERS, activeTenantSlug);
      setUsers(usersData || []);

      const cyclesData = await fetchFromApi<ReviewCycle[]>("/cycles", INITIAL_CYCLES, activeTenantSlug);
      setCycles(cyclesData || []);

      const reviewsData = await fetchFromApi<PerformanceReview[]>("/reviews", INITIAL_REVIEWS, activeTenantSlug);
      setReviews(reviewsData || []);

      const objectivesData = await fetchFromApi<Objective[]>("/objectives", DEFAULT_OBJECTIVES, activeTenantSlug);
      setObjectives(objectivesData || []);

      // Auto-initialize reviews for the active cycle if any
      try {
        await ensureReviewsForActiveCycles(usersData || [], cyclesData || [], reviewsData || [], objectivesData || [], activeTenantSlug, (updated) => {
          setReviews(updated);
        });
      } catch (initErr) {
        console.warn("Failed to auto-initialize reviews:", initErr);
      }
    } catch (e) {
      console.error("Failed to connect to the ERP backend database:", e);
      setUsers([]);
      setCycles([]);
      setReviews([]);
      setObjectives([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTenantSlug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateReview = async (updated: PerformanceReview) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (activeTenantSlug) headers["x-tenant-slug"] = activeTenantSlug;

    try {
      await fetch(`${API_BASE_URL}/reviews${activeTenantSlug ? `?tenant=${encodeURIComponent(activeTenantSlug)}` : ""}`, {
        method: "POST",
        headers,
        body: JSON.stringify(updated)
      });
      const freshReviews = await fetchFromApi<PerformanceReview[]>("/reviews", reviews, activeTenantSlug);
      setReviews(freshReviews || []);
    } catch (e) {
      console.warn("Failed to sync updateReview with backend database", e);
      const exists = reviews.some(r => r.id === updated.id);
      const list = exists 
        ? reviews.map(r => r.id === updated.id ? updated : r)
        : [...reviews, updated];
      setReviews(list);
    }
  };

  const addReviewCycle = async (cycle: ReviewCycle) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (activeTenantSlug) headers["x-tenant-slug"] = activeTenantSlug;

    try {
      await fetch(`${API_BASE_URL}/cycles${activeTenantSlug ? `?tenant=${encodeURIComponent(activeTenantSlug)}` : ""}`, {
        method: "POST",
        headers,
        body: JSON.stringify(cycle)
      });
      const freshCycles = await fetchFromApi<ReviewCycle[]>("/cycles", [...cycles, cycle], activeTenantSlug);
      setCycles(freshCycles || []);
      if (cycle.status === "Active") {
        await ensureReviewsForActiveCycles(users, freshCycles || [], reviews, objectives, activeTenantSlug, (updated) => {
          setReviews(updated);
        });
      }
    } catch (e) {
      console.warn("Failed to sync addReviewCycle with backend database", e);
      setCycles([...cycles, cycle]);
    }
  };

  const updateCycles = async (updatedList: ReviewCycle[]) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (activeTenantSlug) headers["x-tenant-slug"] = activeTenantSlug;

    try {
      for (const cycle of updatedList) {
        await fetch(`${API_BASE_URL}/cycles${activeTenantSlug ? `?tenant=${encodeURIComponent(activeTenantSlug)}` : ""}`, {
          method: "POST",
          headers,
          body: JSON.stringify(cycle)
        });
      }
      const freshCycles = await fetchFromApi<ReviewCycle[]>("/cycles", updatedList, activeTenantSlug);
      setCycles(freshCycles || []);
      await ensureReviewsForActiveCycles(users, freshCycles || [], reviews, objectives, activeTenantSlug, (updated) => {
        setReviews(updated);
      });
    } catch (e) {
      console.warn("Failed to sync updateCycles with backend database", e);
      setCycles(updatedList);
    }
  };

  const updateObjectives = async (updatedList: Objective[]) => {
    const previous = [...objectives];
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (activeTenantSlug) headers["x-tenant-slug"] = activeTenantSlug;

    try {
      // Find deleted objectives
      const deleted = previous.filter(p => !updatedList.some(u => u.id === p.id));
      for (const d of deleted) {
        await fetch(`${API_BASE_URL}/objectives?id=${encodeURIComponent(d.id)}${activeTenantSlug ? `&tenant=${encodeURIComponent(activeTenantSlug)}` : ""}`, { method: "DELETE" });
      }
      // Find added or updated objectives
      const addedOrUpdated = updatedList.filter(u => {
        const p = previous.find(prev => prev.id === u.id);
        return !p || JSON.stringify(p) !== JSON.stringify(u);
      });
      for (const a of addedOrUpdated) {
        await fetch(`${API_BASE_URL}/objectives${activeTenantSlug ? `?tenant=${encodeURIComponent(activeTenantSlug)}` : ""}`, {
          method: "POST",
          headers,
          body: JSON.stringify(a)
        });
      }
      const freshObjectives = await fetchFromApi<Objective[]>("/objectives", updatedList, activeTenantSlug);
      setObjectives(freshObjectives || []);
    } catch (e) {
      console.warn("Failed to sync updateObjectives with backend database", e);
      setObjectives(updatedList);
    }
  };

  const updateUsers = async (updatedList: User[]) => {
    const previous = [...users];
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (activeTenantSlug) headers["x-tenant-slug"] = activeTenantSlug;

    try {
      // Find deleted users
      const deleted = previous.filter(p => !updatedList.some(u => u.id === p.id));
      for (const d of deleted) {
        await fetch(`${API_BASE_URL}/users?id=${encodeURIComponent(d.id)}${activeTenantSlug ? `&tenant=${encodeURIComponent(activeTenantSlug)}` : ""}`, { method: "DELETE" });
      }

      // Find changed or added users
      const changedUser = updatedList.find(u => {
        const prev = previous.find(prevUser => prevUser.id === u.id);
        if (!prev) return true;
        return JSON.stringify(prev) !== JSON.stringify(u);
      });

      if (changedUser) {
        await fetch(`${API_BASE_URL}/users${activeTenantSlug ? `?tenant=${encodeURIComponent(activeTenantSlug)}` : ""}`, {
          method: "POST",
          headers,
          body: JSON.stringify(changedUser)
        });
      }

      const freshUsers = await fetchFromApi<User[]>("/users", updatedList, activeTenantSlug);
      setUsers(freshUsers || []);
      await ensureReviewsForActiveCycles(freshUsers || [], cycles, reviews, objectives, activeTenantSlug, (updated) => {
        setReviews(updated);
      });
    } catch (e) {
      console.warn("Failed to sync updateUsers with backend database", e);
      setUsers(updatedList);
    }
  };

  return {
    users,
    cycles,
    reviews,
    objectives,
    isLoading,
    reload: loadData,
    updateReview,
    addReviewCycle,
    updateCycles,
    updateObjectives,
    updateUsers
  };
}
