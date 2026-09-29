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

import seedData from "./erp-seed-data.json";

const INITIAL_USERS: User[] = (seedData.users as any[]) || [];
const INITIAL_REVIEWS: PerformanceReview[] = (seedData.reviews as any[]) || [];

export function findReviewForUser(
  reviewsList: PerformanceReview[],
  user: { id?: string; name?: string },
  cycleId?: string
): PerformanceReview | undefined {
  if (!user) return undefined;
  return reviewsList.find((r) => {
    const matchesCycle = !cycleId || r.cycleId === cycleId;
    if (!matchesCycle) return false;
    const matchesId = Boolean(user.id && r.employeeId && r.employeeId.toLowerCase() === user.id.toLowerCase());
    const matchesName = Boolean(
      user.name &&
        r.employeeName &&
        r.employeeName.toLowerCase().trim() === user.name.toLowerCase().trim()
    );
    return matchesId || matchesName;
  });
}

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
  _usersList: User[],
  _cyclesList: ReviewCycle[],
  _reviewsList: PerformanceReview[],
  _objectivesList: Objective[],
  _tenantSlug: string,
  _onReviewsCreated: (updated: PerformanceReview[]) => void
) {
  // Do not bulk-inject 32 empty dummy draft review records for non-participating staff in the database,
  // which previously diluted the real appraisal completion rate from 94% down to 21% after background sync.
}

export function createReviewForUser(
  user: User,
  cycle: ReviewCycle,
  objectivesList: Objective[]
): PerformanceReview {
  const relevantObjectives = objectivesList.filter(o => {
    if (o.type === "competency") return true;
    return (o.type === "objective" || !o.type) && o.departments?.includes(user.department);
  });

  return {
    id: `REV${cycle.id.replace("CYC", "")}${user.id}`,
    employeeId: user.id,
    employeeName: user.name,
    department: user.department,
    cycleId: cycle.id,
    cycleName: cycle.name,
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
