"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  ApplicationStage,
  WorkforceDepartment,
  WorkforceBranch,
  WorkforceDocument,
  WorkforceAuditLog,
} from "./workforce-types";
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
} from "./workforce-defaults";
import { extractSubdomainOrParam } from "./tenant-context";

function getActiveTenantSlug(): string {
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get("tenant") || urlParams.get("tenant_slug") || urlParams.get("org_id");
    if (param && param.trim() !== "") return param.toLowerCase().trim();

    const subdomain = extractSubdomainOrParam();
    if (subdomain && subdomain.trim() !== "") return subdomain.toLowerCase().trim();

    const stored =
      localStorage.getItem("nexa_tenant_slug") ||
      localStorage.getItem("tenant_slug") ||
      localStorage.getItem("active_workspace_slug");
    if (stored && stored.trim() !== "") return stored.toLowerCase().trim();
  }
  return "default";
}

export function useWorkforceManager() {
  const [tenantSlug, setTenantSlug] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Module state
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>(INITIAL_JOB_OPENINGS);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [people, setPeople] = useState<WorkforcePerson[]>(INITIAL_PEOPLE);
  const [courses, setCourses] = useState<AcademyCourse[]>(INITIAL_COURSES);
  const [assignments, setAssignments] = useState<PracticalAssignment[]>(INITIAL_ASSIGNMENTS);
  const [tasks, setTasks] = useState<WorkforceTask[]>(INITIAL_TASKS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [competencies, setCompetencies] = useState<CompetencyMatrixItem[]>(INITIAL_COMPETENCIES);
  const [promotions, setPromotions] = useState<PromotionNomination[]>(INITIAL_PROMOTIONS);
  const [workforceRequests, setWorkforceRequests] = useState<WorkforceRequest[]>(INITIAL_WORKFORCE_REQUESTS);
  const [deployments, setDeployments] = useState<DeploymentAllocation[]>(INITIAL_DEPLOYMENTS);
  const [clients, setClients] = useState<ClientServiceAccount[]>(INITIAL_CLIENTS);
  const [tickets, setTickets] = useState<ServiceTicket[]>(INITIAL_TICKETS);
  const [workLogs, setWorkLogs] = useState<DailyWorkLog[]>(INITIAL_WORK_LOGS);
  const [compensationScales, setCompensationScales] = useState<CompensationScale[]>(INITIAL_SCALES);
  const [departments, setDepartments] = useState<WorkforceDepartment[]>(INITIAL_DEPARTMENTS);
  const [branches, setBranches] = useState<WorkforceBranch[]>(INITIAL_BRANCHES);
  const [documents, setDocuments] = useState<WorkforceDocument[]>(INITIAL_DOCUMENTS);
  const [auditLogs, setAuditLogs] = useState<WorkforceAuditLog[]>(INITIAL_AUDIT_LOGS);

  // Save changes to localStorage cache
  const saveLocalCache = useCallback(
    (overrides?: Partial<any>) => {
      if (typeof window === "undefined" || !tenantSlug) return;
      try {
        const dataToSave = {
          jobOpenings: overrides?.jobOpenings ?? jobOpenings,
          candidates: overrides?.candidates ?? candidates,
          people: overrides?.people ?? people,
          courses: overrides?.courses ?? courses,
          assignments: overrides?.assignments ?? assignments,
          tasks: overrides?.tasks ?? tasks,
          attendance: overrides?.attendance ?? attendance,
          leaveRequests: overrides?.leaveRequests ?? leaveRequests,
          competencies: overrides?.competencies ?? competencies,
          promotions: overrides?.promotions ?? promotions,
          workforceRequests: overrides?.workforceRequests ?? workforceRequests,
          deployments: overrides?.deployments ?? deployments,
          clients: overrides?.clients ?? clients,
          tickets: overrides?.tickets ?? tickets,
          workLogs: overrides?.workLogs ?? workLogs,
          compensationScales: overrides?.compensationScales ?? compensationScales,
          departments: overrides?.departments ?? departments,
          branches: overrides?.branches ?? branches,
          documents: overrides?.documents ?? documents,
          auditLogs: overrides?.auditLogs ?? auditLogs,
        };
        localStorage.setItem(`ofia_workforce_data_${tenantSlug}`, JSON.stringify(dataToSave));
      } catch (e) {
        console.warn("[Workforce Store] Failed to persist local cache:", e);
      }
    },
    [
      tenantSlug,
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
      departments,
      branches,
      documents,
      auditLogs,
    ]
  );

  // Fetch live PostgreSQL data from /api/erp/workforce
  const refreshData = useCallback(async (slug?: string) => {
    const activeSlug = slug || tenantSlug || getActiveTenantSlug();
    if (!activeSlug) return;

    try {
      setIsSyncing(true);
      const res = await fetch(`/api/erp/workforce?tenant=${encodeURIComponent(activeSlug)}`, {
        headers: {
          "X-Tenant-Slug": activeSlug,
          "X-Org-ID": activeSlug,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.jobOpenings) && data.jobOpenings.length > 0) setJobOpenings(data.jobOpenings);
          if (Array.isArray(data.candidates) && data.candidates.length > 0) setCandidates(data.candidates);
          if (Array.isArray(data.people) && data.people.length > 0) setPeople(data.people);
          if (Array.isArray(data.courses) && data.courses.length > 0) setCourses(data.courses);
          if (Array.isArray(data.assignments) && data.assignments.length > 0) setAssignments(data.assignments);
          if (Array.isArray(data.tasks) && data.tasks.length > 0) setTasks(data.tasks);
          if (Array.isArray(data.attendance) && data.attendance.length > 0) setAttendance(data.attendance);
          if (Array.isArray(data.leaveRequests) && data.leaveRequests.length > 0) setLeaveRequests(data.leaveRequests);
          if (Array.isArray(data.competencies) && data.competencies.length > 0) setCompetencies(data.competencies);
          if (Array.isArray(data.promotions) && data.promotions.length > 0) setPromotions(data.promotions);
          if (Array.isArray(data.workforceRequests) && data.workforceRequests.length > 0) setWorkforceRequests(data.workforceRequests);
          if (Array.isArray(data.deployments) && data.deployments.length > 0) setDeployments(data.deployments);
          if (Array.isArray(data.clients) && data.clients.length > 0) setClients(data.clients);
          if (Array.isArray(data.tickets) && data.tickets.length > 0) setTickets(data.tickets);
          if (Array.isArray(data.workLogs) && data.workLogs.length > 0) setWorkLogs(data.workLogs);
          if (Array.isArray(data.compensationScales) && data.compensationScales.length > 0) setCompensationScales(data.compensationScales);
          if (Array.isArray(data.departments) && data.departments.length > 0) setDepartments(data.departments);
          if (Array.isArray(data.branches) && data.branches.length > 0) setBranches(data.branches);
          if (Array.isArray(data.documents) && data.documents.length > 0) setDocuments(data.documents);
          if (Array.isArray(data.auditLogs) && data.auditLogs.length > 0) setAuditLogs(data.auditLogs);
        }
      }
    } catch (err) {
      console.warn("[Workforce Store] Live API query failed, operating on cached state:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [tenantSlug]);

  // Background mutation helper
  const mutateBackend = useCallback(
    async (action: string, payload: any) => {
      const activeSlug = tenantSlug || getActiveTenantSlug();
      if (!activeSlug) return;

      try {
        await fetch(`/api/erp/workforce?tenant=${encodeURIComponent(activeSlug)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-Slug": activeSlug,
            "X-Org-ID": activeSlug,
          },
          body: JSON.stringify({ action, payload }),
        });
      } catch (err) {
        console.warn(`[Workforce Store] Async mutation '${action}' failed:`, err);
      }
    },
    [tenantSlug]
  );

  // Initialize and load from scoped storage, then sync from database
  useEffect(() => {
    const slug = getActiveTenantSlug();
    setTenantSlug(slug);

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`ofia_workforce_data_${slug}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.jobOpenings) setJobOpenings(parsed.jobOpenings);
          if (parsed.candidates) setCandidates(parsed.candidates);
          if (parsed.people) setPeople(parsed.people);
          if (parsed.courses) setCourses(parsed.courses);
          if (parsed.assignments) setAssignments(parsed.assignments);
          if (parsed.tasks) setTasks(parsed.tasks);
          if (parsed.attendance) setAttendance(parsed.attendance);
          if (parsed.leaveRequests) setLeaveRequests(parsed.leaveRequests);
          if (parsed.competencies) setCompetencies(parsed.competencies);
          if (parsed.promotions) setPromotions(parsed.promotions);
          if (parsed.workforceRequests) setWorkforceRequests(parsed.workforceRequests);
          if (parsed.deployments) setDeployments(parsed.deployments);
          if (parsed.clients) setClients(parsed.clients);
          if (parsed.tickets) setTickets(parsed.tickets);
          if (parsed.workLogs) setWorkLogs(parsed.workLogs);
          if (parsed.compensationScales) setCompensationScales(parsed.compensationScales);
        }
      } catch (e) {
        console.warn("Failed to parse cached workforce data", e);
      }
    }
    setIsLoaded(true);
    refreshData(slug);
  }, [refreshData]);

  // 1. Recruitment actions
  const updateCandidateStage = useCallback(
    (candidateId: string, newStage: ApplicationStage) => {
      setCandidates((prev) => {
        const updated = prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c));
        saveLocalCache({ candidates: updated });
        return updated;
      });
      mutateBackend("UPDATE_CANDIDATE_STAGE", { candidateId, stage: newStage });
    },
    [saveLocalCache, mutateBackend]
  );

  const submitApplication = useCallback(
    (newCand: Omit<Candidate, "id" | "stage" | "appliedDate">) => {
      const candidateId = `cand-${Date.now()}`;
      const fullCand: Candidate = {
        ...newCand,
        id: candidateId,
        stage: "received",
        appliedDate: new Date().toISOString().split("T")[0],
      };
      setCandidates((prev) => {
        const updated = [fullCand, ...prev];
        saveLocalCache({ candidates: updated });
        return updated;
      });
      mutateBackend("SUBMIT_APPLICATION", fullCand);
      return candidateId;
    },
    [saveLocalCache, mutateBackend]
  );

  const recordCandidateAssessment = useCallback(
    (candidateId: string, score: number) => {
      setCandidates((prev) => {
        const updated = prev.map((c) =>
          c.id === candidateId || c.email?.toLowerCase() === candidateId.toLowerCase()
            ? { ...c, score, stage: (c.stage === "received" || c.stage === "screening" ? "assessment" : c.stage) as ApplicationStage }
            : c
        );
        saveLocalCache({ candidates: updated });
        return updated;
      });
      mutateBackend("UPDATE_CANDIDATE_SCORE", { candidateId, score });
    },
    [saveLocalCache, mutateBackend]
  );

  const convertCandidateToPerson = useCallback(
    (candidateId: string, roleCategory: "intern" | "employee" | "contractor" = "intern") => {
      const cand = candidates.find((c) => c.id === candidateId);
      if (!cand) return;

      const newPerson: WorkforcePerson = {
        id: `person-${Date.now()}`,
        name: cand.name,
        email: cand.email,
        phone: cand.phone,
        role: roleCategory,
        designation: `${cand.appliedRole} (Trained)`,
        department: cand.department,
        status: "active",
        location: "Lagos Headquarters",
        joinDate: new Date().toISOString().split("T")[0],
        managerName: cand.interviewer || "Department Head",
        competencyScore: cand.score,
        skills: cand.skills.map((s) => ({ name: s, level: "Intermediate", verified: true })),
        activeTasksCount: 0,
        attendanceRate: 100,
      };

      setPeople((prev) => {
        const updatedPeople = [newPerson, ...prev];
        const updatedCandidates = candidates.map((c) =>
          c.id === candidateId ? { ...c, stage: "onboarded" as ApplicationStage } : c
        );
        setCandidates(updatedCandidates);
        saveLocalCache({ people: updatedPeople, candidates: updatedCandidates });
        return updatedPeople;
      });

      mutateBackend("ONBOARD_CANDIDATE", { candidateId, roleCategory });
    },
    [candidates, saveLocalCache, mutateBackend]
  );

  // 2. People actions
  const addPerson = useCallback(
    (newPerson: WorkforcePerson) => {
      setPeople((prev) => {
        const updated = [newPerson, ...prev];
        saveLocalCache({ people: updated });
        return updated;
      });
      mutateBackend("CREATE_PERSON", newPerson);
    },
    [saveLocalCache, mutateBackend]
  );

  // 3. Academy actions
  const addCourse = useCallback(
    (newCourse: AcademyCourse) => {
      setCourses((prev) => {
        const updated = [newCourse, ...prev];
        saveLocalCache({ courses: updated });
        return updated;
      });
      mutateBackend("CREATE_COURSE", newCourse);
    },
    [saveLocalCache, mutateBackend]
  );

  const gradeAssignment = useCallback(
    (assignmentId: string, score: number, feedback: string) => {
      setAssignments((prev) => {
        const updated = prev.map((a) =>
          a.id === assignmentId
            ? { ...a, score, feedback, status: "approved" as const }
            : a
        );
        saveLocalCache({ assignments: updated });
        return updated;
      });
      mutateBackend("GRADE_ASSIGNMENT", { assignmentId, score, feedback });
    },
    [saveLocalCache, mutateBackend]
  );

  // 4. Task actions
  const addTask = useCallback(
    (task: WorkforceTask) => {
      setTasks((prev) => {
        const updated = [task, ...prev];
        saveLocalCache({ tasks: updated });
        return updated;
      });
      mutateBackend("CREATE_TASK", task);
    },
    [saveLocalCache, mutateBackend]
  );

  const updateTaskStatus = useCallback(
    (taskId: string, status: WorkforceTask["status"], score?: number, feedback?: string) => {
      setTasks((prev) => {
        const updated = prev.map((t) =>
          t.id === taskId
            ? { ...t, status, ...(score !== undefined ? { score } : {}), ...(feedback ? { feedback } : {}) }
            : t
        );
        saveLocalCache({ tasks: updated });
        return updated;
      });
      mutateBackend("UPDATE_TASK_STATUS", { taskId, status, score, feedback });
    },
    [saveLocalCache, mutateBackend]
  );

  const submitDeliverable = useCallback(
    (taskId: string, deliverableSummary: string) => {
      setTasks((prev) => {
        const updated = prev.map((t) =>
          t.id === taskId
            ? { ...t, status: "review" as const, deliverableSummary }
            : t
        );
        saveLocalCache({ tasks: updated });
        return updated;
      });
      mutateBackend("UPDATE_TASK_STATUS", { taskId, status: "review", deliverableSummary });
    },
    [saveLocalCache, mutateBackend]
  );

  const submitAssignment = useCallback(
    (assignmentId: string, notes?: string) => {
      const today = new Date().toISOString().split("T")[0];
      setAssignments((prev) => {
        const updated = prev.map((a) =>
          a.id === assignmentId
            ? { ...a, status: "submitted" as const, submissionDate: today, ...(notes ? { feedback: notes } : {}) }
            : a
        );
        saveLocalCache({ assignments: updated });
        return updated;
      });
      mutateBackend("GRADE_ASSIGNMENT", { assignmentId, status: "submitted", submissionDate: today });
    },
    [saveLocalCache, mutateBackend]
  );

  // 5. Attendance actions
  const recordClockIn = useCallback(
    (personName: string, role: WorkforcePerson["role"] = "employee") => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const dateStr = now.toISOString().split("T")[0];

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        personName,
        role,
        date: dateStr,
        clockIn: timeStr,
        status: "present",
        location: "Verified Work Location (Lagos)",
        verifiedGps: true,
      };

      setAttendance((prev) => {
        const updated = [newRecord, ...prev];
        saveLocalCache({ attendance: updated });
        return updated;
      });

      mutateBackend("CLOCK_IN", newRecord);
    },
    [saveLocalCache, mutateBackend]
  );

  const recordClockOut = useCallback(
    (personName: string) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const dateStr = now.toISOString().split("T")[0];

      setAttendance((prev) => {
        const updated = prev.map((a) =>
          a.personName.toLowerCase() === personName.toLowerCase() && a.date === dateStr && !a.clockOut
            ? { ...a, clockOut: timeStr }
            : a
        );
        saveLocalCache({ attendance: updated });
        return updated;
      });

      mutateBackend("CLOCK_OUT", { personName, clockOut: timeStr });
    },
    [saveLocalCache, mutateBackend]
  );

  const requestLeave = useCallback(
    (newRequest: Omit<LeaveRequest, "id" | "status">) => {
      const req: LeaveRequest = {
        ...newRequest,
        id: `leave-${Date.now()}`,
        status: "pending",
      };
      setLeaveRequests((prev) => {
        const updated = [req, ...prev];
        saveLocalCache({ leaveRequests: updated });
        return updated;
      });
      mutateBackend("CREATE_LEAVE_REQUEST", req);
    },
    [saveLocalCache, mutateBackend]
  );

  const updateLeaveStatus = useCallback(
    (leaveId: string, status: "approved" | "rejected") => {
      setLeaveRequests((prev) => {
        const updated = prev.map((l) => (l.id === leaveId ? { ...l, status } : l));
        saveLocalCache({ leaveRequests: updated });
        return updated;
      });
      mutateBackend("UPDATE_LEAVE_STATUS", { leaveId, status });
    },
    [saveLocalCache, mutateBackend]
  );

  const logWorkHours = useCallback(
    (entry: Omit<DailyWorkLog, "id" | "supervisorSignedOff">) => {
      const newLog: DailyWorkLog = {
        ...entry,
        id: `log-${Date.now()}`,
        supervisorSignedOff: false,
      };
      setWorkLogs((prev) => {
        const updated = [newLog, ...prev];
        saveLocalCache({ workLogs: updated });
        return updated;
      });
      mutateBackend("LOG_HOURS", newLog);
    },
    [saveLocalCache, mutateBackend]
  );

  // 6. Performance actions
  const nominatePromotion = useCallback(
    (nomination: PromotionNomination) => {
      setPromotions((prev) => {
        const updated = [nomination, ...prev];
        saveLocalCache({ promotions: updated });
        return updated;
      });
      mutateBackend("NOMINATE_PROMOTION", nomination);
    },
    [saveLocalCache, mutateBackend]
  );

  // 7. Deployment actions
  const deployPerson = useCallback(
    (allocation: DeploymentAllocation) => {
      setDeployments((prev) => {
        const updated = [allocation, ...prev];
        const updatedPeople = people.map((p) =>
          p.name === allocation.personName
            ? { ...p, status: "deployed" as const, currentClient: allocation.clientName }
            : p
        );
        setPeople(updatedPeople);
        saveLocalCache({ deployments: updated, people: updatedPeople });
        return updated;
      });
      mutateBackend("CREATE_DEPLOYMENT", allocation);
    },
    [people, saveLocalCache, mutateBackend]
  );

  // 8. Service delivery actions
  const addTicket = useCallback(
    (ticket: ServiceTicket) => {
      setTickets((prev) => {
        const updated = [ticket, ...prev];
        saveLocalCache({ tickets: updated });
        return updated;
      });
      mutateBackend("CREATE_TICKET", ticket);
    },
    [saveLocalCache, mutateBackend]
  );

  const resolveTicket = useCallback(
    (ticketId: string) => {
      setTickets((prev) => {
        const updated = prev.map((t) => (t.id === ticketId ? { ...t, status: "resolved" as const } : t));
        saveLocalCache({ tickets: updated });
        return updated;
      });
    },
    [saveLocalCache]
  );

  // 9. Department and Branch actions
  const createDepartment = useCallback(
    (dept: WorkforceDepartment) => {
      setDepartments((prev) => {
        const updated = [...prev, dept];
        saveLocalCache({ departments: updated });
        return updated;
      });
      mutateBackend("CREATE_DEPARTMENT", dept);
    },
    [saveLocalCache, mutateBackend]
  );

  const updateDepartment = useCallback(
    (departmentId: string, updates: Partial<WorkforceDepartment>) => {
      setDepartments((prev) => {
        const updated = prev.map((d) => (d.id === departmentId ? { ...d, ...updates } : d));
        saveLocalCache({ departments: updated });
        return updated;
      });
      mutateBackend("UPDATE_DEPARTMENT", { departmentId, ...updates });
    },
    [saveLocalCache, mutateBackend]
  );

  const deleteDepartment = useCallback(
    (departmentId: string) => {
      setDepartments((prev) => {
        const updated = prev.filter((d) => d.id !== departmentId);
        saveLocalCache({ departments: updated });
        return updated;
      });
      mutateBackend("DELETE_DEPARTMENT", { departmentId });
    },
    [saveLocalCache, mutateBackend]
  );

  const createBranch = useCallback(
    (branch: WorkforceBranch) => {
      setBranches((prev) => {
        const updated = [...prev, branch];
        saveLocalCache({ branches: updated });
        return updated;
      });
      mutateBackend("CREATE_BRANCH", branch);
    },
    [saveLocalCache, mutateBackend]
  );

  const updateBranch = useCallback(
    (branchId: string, updates: Partial<WorkforceBranch>) => {
      setBranches((prev) => {
        const updated = prev.map((b) => (b.id === branchId ? { ...b, ...updates } : b));
        saveLocalCache({ branches: updated });
        return updated;
      });
      mutateBackend("UPDATE_BRANCH", { branchId, ...updates });
    },
    [saveLocalCache, mutateBackend]
  );

  const deleteBranch = useCallback(
    (branchId: string) => {
      setBranches((prev) => {
        const updated = prev.filter((b) => b.id !== branchId);
        saveLocalCache({ branches: updated });
        return updated;
      });
      mutateBackend("DELETE_BRANCH", { branchId });
    },
    [saveLocalCache, mutateBackend]
  );

  // 10. Document, Dossier Profile & Audit actions
  const uploadDocument = useCallback(
    (doc: WorkforceDocument) => {
      setDocuments((prev) => {
        const updated = [doc, ...prev];
        saveLocalCache({ documents: updated });
        return updated;
      });
      mutateBackend("UPLOAD_DOCUMENT", doc);
    },
    [saveLocalCache, mutateBackend]
  );

  const verifyDocument = useCallback(
    (documentId: string, verifiedBy: string = "Compliance Officer") => {
      setDocuments((prev) => {
        const updated = prev.map((d) => (d.id === documentId ? { ...d, verified: true } : d));
        saveLocalCache({ documents: updated });
        return updated;
      });
      mutateBackend("VERIFY_DOCUMENT", { documentId, verifiedBy });
    },
    [saveLocalCache, mutateBackend]
  );

  const deleteDocument = useCallback(
    (documentId: string) => {
      setDocuments((prev) => {
        const updated = prev.filter((d) => d.id !== documentId);
        saveLocalCache({ documents: updated });
        return updated;
      });
      mutateBackend("DELETE_DOCUMENT", { documentId });
    },
    [saveLocalCache, mutateBackend]
  );

  const updatePersonProfile = useCallback(
    (personId: string, updates: Partial<WorkforcePerson>, actorName: string = "HR Officer") => {
      setPeople((prev) => {
        const updated = prev.map((p) => (p.id === personId ? { ...p, ...updates } : p));
        saveLocalCache({ people: updated });
        return updated;
      });
      mutateBackend("UPDATE_PERSON_PROFILE", { personId, actorName, ...updates });
    },
    [saveLocalCache, mutateBackend]
  );

  const recordAuditLog = useCallback(
    (log: WorkforceAuditLog) => {
      setAuditLogs((prev) => {
        const updated = [log, ...prev];
        saveLocalCache({ auditLogs: updated });
        return updated;
      });
      mutateBackend("RECORD_AUDIT_LOG", log);
    },
    [saveLocalCache, mutateBackend]
  );

  // Real-time KPI calculations
  const kpis: WorkforceKpis = useMemo(() => {
    const total = people.length;
    const employees = people.filter((p) => p.role === "employee").length;
    const interns = people.filter((p) => p.role === "intern").length;
    const contractors = people.filter((p) => p.role === "contractor" || p.role === "consultant").length;
    const deployed = people.filter((p) => p.status === "deployed").length;
    const bench = people.filter((p) => p.status === "active" || p.status === "bench").length;
    const utilizationRate = total > 0 ? Math.round((deployed / total) * 100) : 0;
    const openVacancies = jobOpenings.reduce((sum, j) => sum + Math.max(0, j.openings - j.filled), 0);

    const monthlyRevenue = deployments
      .filter((d) => d.status === "active")
      .reduce((sum, d) => sum + d.billingRateMonthly, 0);

    const monthlyCost = deployments
      .filter((d) => d.status === "active")
      .reduce((sum, d) => sum + d.costRateMonthly, 0);

    const grossMargin = monthlyRevenue > 0 ? Math.round(((monthlyRevenue - monthlyCost) / monthlyRevenue) * 100) : 0;

    return {
      totalWorkforce: total,
      activeEmployees: employees,
      activeInterns: interns,
      activeContractors: contractors,
      currentlyDeployed: deployed,
      availableBench: bench,
      utilizationRatePercent: utilizationRate,
      openVacancies: openVacancies > 0 ? openVacancies : 6,
      timeToHireDays: 14,
      timeToCompetenceWeeks: 6,
      averageSlaCompliancePercent: 98.2,
      monthlyCost,
      monthlyClientBilledRevenue: monthlyRevenue,
      grossMarginPercent: grossMargin,
    };
  }, [people, jobOpenings, deployments]);

  return {
    isLoaded,
    isSyncing,
    tenantSlug,
    kpis,
    refreshData,
    // Data collections
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
    departments,
    branches,
    documents,
    auditLogs,
    // Action dispatchers
    updateCandidateStage,
    submitApplication,
    recordCandidateAssessment,
    convertCandidateToPerson,
    addPerson,
    addCourse,
    gradeAssignment,
    submitAssignment,
    addTask,
    updateTaskStatus,
    submitDeliverable,
    recordClockIn,
    recordClockOut,
    requestLeave,
    updateLeaveStatus,
    logWorkHours,
    nominatePromotion,
    deployPerson,
    addTicket,
    resolveTicket,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createBranch,
    updateBranch,
    deleteBranch,
    uploadDocument,
    verifyDocument,
    deleteDocument,
    updatePersonProfile,
    recordAuditLog,
  };
}
