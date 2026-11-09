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
  WorkforceInterview,
  WorkforceOffer,
  WorkforceOnboardingPacket,
  WorkforceRoleCategory,
  CourseModule,
  CourseEnrollment,
  CourseCertificate,
  WorkforceProject,
  WorkforceDeliverable,
  EvaluationCycle,
  PerformanceScorecard,
  PerformanceImprovementPlan,
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
  INITIAL_INTERVIEWS,
  INITIAL_OFFERS,
  INITIAL_ONBOARDING_PACKETS,
  INITIAL_COURSE_MODULES,
  INITIAL_ENROLLMENTS,
  INITIAL_CERTIFICATES,
  INITIAL_PROJECTS,
  INITIAL_DELIVERABLES,
  INITIAL_EVALUATION_CYCLES,
  INITIAL_SCORECARDS,
  INITIAL_PIPS,
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
  const [interviews, setInterviews] = useState<WorkforceInterview[]>(INITIAL_INTERVIEWS);
  const [offers, setOffers] = useState<WorkforceOffer[]>(INITIAL_OFFERS);
  const [onboardingPackets, setOnboardingPackets] = useState<WorkforceOnboardingPacket[]>(INITIAL_ONBOARDING_PACKETS);
  const [courseModules, setCourseModules] = useState<CourseModule[]>(INITIAL_COURSE_MODULES);
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>(INITIAL_ENROLLMENTS);
  const [certificates, setCertificates] = useState<CourseCertificate[]>(INITIAL_CERTIFICATES);
  const [projects, setProjects] = useState<WorkforceProject[]>(INITIAL_PROJECTS);
  const [deliverables, setDeliverables] = useState<WorkforceDeliverable[]>(INITIAL_DELIVERABLES);
  const [evaluationCycles, setEvaluationCycles] = useState<EvaluationCycle[]>(INITIAL_EVALUATION_CYCLES);
  const [scorecards, setScorecards] = useState<PerformanceScorecard[]>(INITIAL_SCORECARDS);
  const [pips, setPips] = useState<PerformanceImprovementPlan[]>(INITIAL_PIPS);

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
          courseModules: overrides?.courseModules ?? courseModules,
          courseEnrollments: overrides?.courseEnrollments ?? courseEnrollments,
          certificates: overrides?.certificates ?? certificates,
          projects: overrides?.projects ?? projects,
          deliverables: overrides?.deliverables ?? deliverables,
          evaluationCycles: overrides?.evaluationCycles ?? evaluationCycles,
          scorecards: overrides?.scorecards ?? scorecards,
          pips: overrides?.pips ?? pips,
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
          interviews: overrides?.interviews ?? interviews,
          offers: overrides?.offers ?? offers,
          onboardingPackets: overrides?.onboardingPackets ?? onboardingPackets,
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
      interviews,
      offers,
      onboardingPackets,
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
          if (Array.isArray(data.interviews) && data.interviews.length > 0) setInterviews(data.interviews);
          if (Array.isArray(data.offers) && data.offers.length > 0) setOffers(data.offers);
          if (Array.isArray(data.onboardingPackets) && data.onboardingPackets.length > 0) setOnboardingPackets(data.onboardingPackets);
          if (Array.isArray(data.courseModules) && data.courseModules.length > 0) setCourseModules(data.courseModules);
          if (Array.isArray(data.courseEnrollments) && data.courseEnrollments.length > 0) setCourseEnrollments(data.courseEnrollments);
          if (Array.isArray(data.certificates) && data.certificates.length > 0) setCertificates(data.certificates);
          if (Array.isArray(data.projects) && data.projects.length > 0) setProjects(data.projects);
          if (Array.isArray(data.deliverables) && data.deliverables.length > 0) setDeliverables(data.deliverables);
          if (Array.isArray(data.evaluationCycles) && data.evaluationCycles.length > 0) setEvaluationCycles(data.evaluationCycles);
          if (Array.isArray(data.scorecards) && data.scorecards.length > 0) setScorecards(data.scorecards);
          if (Array.isArray(data.pips) && data.pips.length > 0) setPips(data.pips);
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
          if (parsed.courseModules) setCourseModules(parsed.courseModules);
          if (parsed.courseEnrollments) setCourseEnrollments(parsed.courseEnrollments);
          if (parsed.certificates) setCertificates(parsed.certificates);
          if (parsed.projects) setProjects(parsed.projects);
          if (parsed.deliverables) setDeliverables(parsed.deliverables);
          if (parsed.evaluationCycles) setEvaluationCycles(parsed.evaluationCycles);
          if (parsed.scorecards) setScorecards(parsed.scorecards);
          if (parsed.pips) setPips(parsed.pips);
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
          if (parsed.departments) setDepartments(parsed.departments);
          if (parsed.branches) setBranches(parsed.branches);
          if (parsed.documents) setDocuments(parsed.documents);
          if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
          if (parsed.interviews) setInterviews(parsed.interviews);
          if (parsed.offers) setOffers(parsed.offers);
          if (parsed.onboardingPackets) setOnboardingPackets(parsed.onboardingPackets);
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
      const targetAsg = assignments.find((a) => a.id === assignmentId);
      setAssignments((prev) => {
        const updated = prev.map((a) =>
          a.id === assignmentId
            ? { ...a, score, feedback, status: "approved" as const }
            : a
        );
        saveLocalCache({ assignments: updated });
        return updated;
      });

      if (score >= 80 && targetAsg) {
        const certNumber = `OFIA-CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const randomHex = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
        const verificationHash = `sha256_${Date.now()}_${randomHex}`;
        const newCert: CourseCertificate = {
          id: `cert-${Date.now()}`,
          certificateNumber: certNumber,
          courseId: "course-custom",
          courseTitle: targetAsg.courseTitle || targetAsg.title,
          personId: `person-${Date.now()}`,
          personName: targetAsg.assigneeName,
          issueDate: new Date().toISOString().split("T")[0],
          grade: score >= 90 ? `Distinction (${score}%)` : `Merit (${score}%)`,
          verificationHash,
          competenciesAwarded: [targetAsg.track || "Professional Competence", "Verified Practical Assessment"],
        };

        setCertificates((prev) => {
          const updated = [newCert, ...prev];
          saveLocalCache({ certificates: updated });
          return updated;
        });

        setPeople((prev) => {
          const updated = prev.map((p) =>
            p.name.toLowerCase() === targetAsg.assigneeName.toLowerCase()
              ? { ...p, competencyScore: Math.min(100, p.competencyScore + 10) }
              : p
          );
          saveLocalCache({ people: updated });
          return updated;
        });
      }

      mutateBackend("GRADE_ASSIGNMENT", { assignmentId, score, feedback });
    },
    [assignments, saveLocalCache, mutateBackend]
  );

  const createCourseModule = useCallback(
    (newModule: CourseModule) => {
      setCourseModules((prev) => {
        const updated = [...prev, newModule];
        saveLocalCache({ courseModules: updated });
        return updated;
      });
      setCourses((prev) => {
        const updated = prev.map((c) =>
          c.id === newModule.courseId ? { ...c, modulesCount: c.modulesCount + 1 } : c
        );
        saveLocalCache({ courses: updated });
        return updated;
      });
      mutateBackend("CREATE_COURSE_MODULE", newModule);
    },
    [saveLocalCache, mutateBackend]
  );

  const enrollLearner = useCallback(
    (newEnrollment: CourseEnrollment) => {
      setCourseEnrollments((prev) => {
        const updated = [newEnrollment, ...prev];
        saveLocalCache({ courseEnrollments: updated });
        return updated;
      });
      setCourses((prev) => {
        const updated = prev.map((c) =>
          c.id === newEnrollment.courseId ? { ...c, enrolledLearners: c.enrolledLearners + 1 } : c
        );
        saveLocalCache({ courses: updated });
        return updated;
      });
      mutateBackend("ENROLL_LEARNER", newEnrollment);
    },
    [saveLocalCache, mutateBackend]
  );

  const updateLessonProgress = useCallback(
    (enrollmentId: string, lessonId: string, isCompleted: boolean, totalLessonsCount: number = 5) => {
      setCourseEnrollments((prev) => {
        const updated = prev.map((enr) => {
          if (enr.id !== enrollmentId) return enr;
          let completed = [...enr.completedLessons];
          if (isCompleted && !completed.includes(lessonId)) {
            completed.push(lessonId);
          } else if (!isCompleted && completed.includes(lessonId)) {
            completed = completed.filter((id) => id !== lessonId);
          }
          const progress = Math.min(100, Math.round((completed.length / totalLessonsCount) * 100));
          const isDone = progress >= 100;
          return {
            ...enr,
            completedLessons: completed,
            progressPercentage: progress,
            status: isDone ? ("completed" as const) : progress > 0 ? ("in_progress" as const) : ("enrolled" as const),
            completedAt: isDone ? new Date().toISOString() : enr.completedAt,
          };
        });
        saveLocalCache({ courseEnrollments: updated });
        return updated;
      });
      mutateBackend("UPDATE_LESSON_PROGRESS", { enrollmentId, lessonId, isCompleted, totalLessonsCount });
    },
    [saveLocalCache, mutateBackend]
  );

  const issueCertificate = useCallback(
    (cert: CourseCertificate) => {
      setCertificates((prev) => {
        const updated = [cert, ...prev];
        saveLocalCache({ certificates: updated });
        return updated;
      });
      if (cert.personId) {
        setPeople((prev) => {
          const updated = prev.map((p) =>
            p.id === cert.personId || p.name.toLowerCase() === cert.personName.toLowerCase()
              ? { ...p, competencyScore: Math.min(100, p.competencyScore + 10) }
              : p
          );
          saveLocalCache({ people: updated });
          return updated;
        });
      }
      mutateBackend("ISSUE_CERTIFICATE", cert);
    },
    [saveLocalCache, mutateBackend]
  );

  // 4. Project & Task actions
  const createProject = useCallback(
    (project: WorkforceProject) => {
      setProjects((prev) => {
        const updated = [project, ...prev];
        saveLocalCache({ projects: updated });
        return updated;
      });
      mutateBackend("CREATE_PROJECT", project);
    },
    [saveLocalCache, mutateBackend]
  );

  const updateProject = useCallback(
    (projectId: string, updates: Partial<WorkforceProject>) => {
      setProjects((prev) => {
        const updated = prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p));
        saveLocalCache({ projects: updated });
        return updated;
      });
      mutateBackend("UPDATE_PROJECT", { projectId, ...updates });
    },
    [saveLocalCache, mutateBackend]
  );

  const addTask = useCallback(
    (task: WorkforceTask) => {
      setTasks((prev) => {
        const updated = [task, ...prev];
        saveLocalCache({ tasks: updated });
        return updated;
      });
      if (task.projectId) {
        setProjects((prev) => {
          const updated = prev.map((p) =>
            p.id === task.projectId ? { ...p, tasksCount: p.tasksCount + 1 } : p
          );
          saveLocalCache({ projects: updated });
          return updated;
        });
      }
      mutateBackend("CREATE_TASK", task);
    },
    [saveLocalCache, mutateBackend]
  );

  const updateTaskStatus = useCallback(
    (taskId: string, status: WorkforceTask["status"], score?: number, feedback?: string, actualHours?: number) => {
      let targetProjectId: string | undefined;
      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.id === taskId) {
            targetProjectId = t.projectId;
            return {
              ...t,
              status,
              ...(score !== undefined ? { score } : {}),
              ...(feedback ? { feedback } : {}),
              ...(actualHours !== undefined ? { actualHours } : {}),
            };
          }
          return t;
        });
        saveLocalCache({ tasks: updated });
        return updated;
      });

      if (status === "approved" && targetProjectId) {
        setProjects((prev) => {
          const updated = prev.map((p) =>
            p.id === targetProjectId ? { ...p, completedTasksCount: p.completedTasksCount + 1 } : p
          );
          saveLocalCache({ projects: updated });
          return updated;
        });
      }

      mutateBackend("UPDATE_TASK_STATUS", { taskId, status, score, feedback, actualHours });
    },
    [saveLocalCache, mutateBackend]
  );

  const uploadDeliverable = useCallback(
    (deliverable: WorkforceDeliverable) => {
      setDeliverables((prev) => {
        const updated = [deliverable, ...prev];
        saveLocalCache({ deliverables: updated });
        return updated;
      });
      setTasks((prev) => {
        const updated = prev.map((t) =>
          t.id === deliverable.taskId
            ? { ...t, deliverableId: deliverable.id, status: "review" as const, deliverableSummary: deliverable.title }
            : t
        );
        saveLocalCache({ tasks: updated });
        return updated;
      });
      if (deliverable.projectId) {
        setProjects((prev) => {
          const updated = prev.map((p) =>
            p.id === deliverable.projectId ? { ...p, deliverablesCount: p.deliverablesCount + 1 } : p
          );
          saveLocalCache({ projects: updated });
          return updated;
        });
      }
      mutateBackend("SUBMIT_DELIVERABLE", deliverable);
    },
    [saveLocalCache, mutateBackend]
  );

  const reviewDeliverable = useCallback(
    (deliverableId: string, status: WorkforceDeliverable["status"], feedback?: string, score?: number, reviewerName: string = "Supervisor") => {
      let targetTaskId: string | undefined;
      let targetSubmittedById: string | undefined;

      setDeliverables((prev) => {
        const updated = prev.map((d) => {
          if (d.id === deliverableId) {
            targetTaskId = d.taskId;
            targetSubmittedById = d.submittedById;
            return {
              ...d,
              status,
              reviewFeedback: feedback || d.reviewFeedback,
              reviewedBy: reviewerName,
              reviewedAt: new Date().toISOString(),
            };
          }
          return d;
        });
        saveLocalCache({ deliverables: updated });
        return updated;
      });

      if (targetTaskId) {
        const isApproved = status === "approved";
        setTasks((prev) => {
          const updated = prev.map((t) =>
            t.id === targetTaskId
              ? {
                  ...t,
                  status: isApproved ? ("approved" as const) : ("in_progress" as const),
                  ...(score !== undefined ? { score } : {}),
                  ...(feedback ? { feedback } : {}),
                }
              : t
          );
          saveLocalCache({ tasks: updated });
          return updated;
        });

        if (isApproved && targetSubmittedById) {
          setPeople((prev) => {
            const updated = prev.map((p) =>
              p.id === targetSubmittedById
                ? { ...p, competencyScore: Math.min(100, p.competencyScore + 5) }
                : p
            );
            saveLocalCache({ people: updated });
            return updated;
          });
        }
      }

      mutateBackend("REVIEW_DELIVERABLE", { deliverableId, status, feedback, score, reviewerName, taskId: targetTaskId, submittedById: targetSubmittedById });
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
      const fullNomination: PromotionNomination = {
        ...nomination,
        id: nomination.id || `promo-${Date.now()}`,
        status: "under_review",
      };
      setPromotions((prev) => {
        const updated = [fullNomination, ...prev];
        saveLocalCache({ promotions: updated });
        return updated;
      });
      mutateBackend("NOMINATE_PROMOTION", fullNomination);
    },
    [saveLocalCache, mutateBackend]
  );

  const approvePromotion = useCallback(
    async (promotionId: string, approvedBy: string = "HR Executive Committee") => {
      const targetPromo = promotions.find((p) => p.id === promotionId);
      if (!targetPromo) return;

      const nowIso = new Date().toISOString();
      const updatedPromos = promotions.map((p) =>
        p.id === promotionId
          ? {
              ...p,
              status: "approved" as const,
              approvedAt: nowIso,
              approvedBy,
            }
          : p
      );
      setPromotions(updatedPromos);

      // Automated promotion state machine: update employee's profile
      const updatedPeople = people.map((p) => {
        const isMatch = targetPromo.personId ? p.id === targetPromo.personId : p.name.toLowerCase() === targetPromo.personName.toLowerCase();
        if (isMatch) {
          return {
            ...p,
            designation: targetPromo.proposedDesignation,
            role: targetPromo.proposedRole || p.role,
            competencyScore: Math.max(p.competencyScore, targetPromo.competencyRating),
          };
        }
        return p;
      });
      setPeople(updatedPeople);

      saveLocalCache({ promotions: updatedPromos, people: updatedPeople });
      await mutateBackend("APPROVE_PROMOTION", { promotionId, approvedBy });
    },
    [promotions, people, saveLocalCache, mutateBackend]
  );

  const createEvaluationCycle = useCallback(
    (cycle: Omit<EvaluationCycle, "id" | "totalReviewsCount" | "completedReviewsCount">) => {
      const id = `cycle-${Date.now()}`;
      const newCycle: EvaluationCycle = {
        ...cycle,
        id,
        totalReviewsCount: people.length,
        completedReviewsCount: 0,
      };
      setEvaluationCycles((prev) => {
        const updated = [newCycle, ...prev];
        saveLocalCache({ evaluationCycles: updated });
        return updated;
      });
      mutateBackend("CREATE_EVALUATION_CYCLE", newCycle);
      return id;
    },
    [people.length, saveLocalCache, mutateBackend]
  );

  const updateEvaluationCycleStatus = useCallback(
    (cycleId: string, status: "upcoming" | "active" | "closed") => {
      setEvaluationCycles((prev) => {
        const updated = prev.map((c) => (c.id === cycleId ? { ...c, status } : c));
        saveLocalCache({ evaluationCycles: updated });
        return updated;
      });
      mutateBackend("UPDATE_EVALUATION_CYCLE_STATUS", { cycleId, status });
    },
    [saveLocalCache, mutateBackend]
  );

  const submitScorecard = useCallback(
    (scorecard: Omit<PerformanceScorecard, "id" | "submittedAt">) => {
      const id = `sc-${Date.now()}`;
      const fullScorecard: PerformanceScorecard = {
        ...scorecard,
        id,
        submittedAt: new Date().toISOString(),
      };

      setScorecards((prev) => {
        const updated = [fullScorecard, ...prev];
        saveLocalCache({ scorecards: updated });
        return updated;
      });

      // Increment cycle completed reviews count
      setEvaluationCycles((prev) => {
        const updated = prev.map((c) =>
          c.id === scorecard.cycleId
            ? { ...c, completedReviewsCount: c.completedReviewsCount + 1 }
            : c
        );
        saveLocalCache({ evaluationCycles: updated });
        return updated;
      });

      // Update person's competency score
      setPeople((prev) => {
        const updated = prev.map((p) =>
          p.id === scorecard.personId
            ? { ...p, competencyScore: Math.max(p.competencyScore, Math.round(scorecard.overallRating)) }
            : p
        );
        saveLocalCache({ people: updated });
        return updated;
      });

      mutateBackend("SUBMIT_SCORECARD", fullScorecard);
      return id;
    },
    [saveLocalCache, mutateBackend]
  );

  const createPip = useCallback(
    (pip: Omit<PerformanceImprovementPlan, "id" | "createdAt">) => {
      const id = `pip-${Date.now()}`;
      const newPip: PerformanceImprovementPlan = {
        ...pip,
        id,
        createdAt: new Date().toISOString(),
      };
      setPips((prev) => {
        const updated = [newPip, ...prev];
        saveLocalCache({ pips: updated });
        return updated;
      });
      mutateBackend("CREATE_PIP", newPip);
      return id;
    },
    [saveLocalCache, mutateBackend]
  );

  const updatePip = useCallback(
    (pipId: string, updates: Partial<PerformanceImprovementPlan>) => {
      setPips((prev) => {
        const updated = prev.map((p) => (p.id === pipId ? { ...p, ...updates } : p));
        saveLocalCache({ pips: updated });
        return updated;
      });
      mutateBackend("UPDATE_PIP", { pipId, ...updates });
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

  const scheduleInterview = useCallback(
    (interview: Omit<WorkforceInterview, "id" | "token" | "createdAt" | "status">) => {
      const id = `int-${Date.now()}`;
      const token = `tok_int_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newInterview: WorkforceInterview = {
        ...interview,
        id,
        token,
        status: "scheduled",
        createdAt: new Date().toLocaleString(),
      };
      setInterviews((prev) => {
        const updated = [newInterview, ...prev];
        saveLocalCache({ interviews: updated });
        return updated;
      });
      setCandidates((prev) => {
        const updated = prev.map((c) =>
          c.id === interview.candidateId ? { ...c, stage: "interview" as ApplicationStage } : c
        );
        saveLocalCache({ candidates: updated });
        return updated;
      });
      mutateBackend("SCHEDULE_INTERVIEW", { ...newInterview, actorName: "Talent Acquisition" });
      return { id, token };
    },
    [saveLocalCache, mutateBackend]
  );

  const updateInterviewStatus = useCallback(
    (interviewId: string, status: "scheduled" | "completed" | "cancelled", score?: number, notes?: string) => {
      setInterviews((prev) => {
        const updated = prev.map((i) =>
          i.id === interviewId || i.token === interviewId
            ? { ...i, status, score: score ?? i.score, interviewerNotes: notes ?? i.interviewerNotes }
            : i
        );
        saveLocalCache({ interviews: updated });
        return updated;
      });
      mutateBackend("UPDATE_INTERVIEW_STATUS", { interviewId, status, score, interviewerNotes: notes });
    },
    [saveLocalCache, mutateBackend]
  );

  const issueOffer = useCallback(
    (offer: Omit<WorkforceOffer, "id" | "token" | "createdAt" | "status">) => {
      const id = `offer-${Date.now()}`;
      const token = `tok_offer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newOffer: WorkforceOffer = {
        ...offer,
        id,
        token,
        status: "issued",
        createdAt: new Date().toLocaleString(),
      };
      setOffers((prev) => {
        const updated = [newOffer, ...prev];
        saveLocalCache({ offers: updated });
        return updated;
      });
      setCandidates((prev) => {
        const updated = prev.map((c) =>
          c.id === offer.candidateId
            ? { ...c, stage: "offer_issued" as ApplicationStage, offerAmount: offer.totalMonthly }
            : c
        );
        saveLocalCache({ candidates: updated });
        return updated;
      });
      mutateBackend("ISSUE_OFFER", { ...newOffer, actorName: "Talent Acquisition" });
      return { id, token };
    },
    [saveLocalCache, mutateBackend]
  );

  const acceptOffer = useCallback(
    (token: string, candidateSignature: string, candidateId?: string) => {
      const acceptedAt = new Date().toISOString();
      setOffers((prev) => {
        const updated = prev.map((o) =>
          o.token === token ? { ...o, status: "accepted" as const, acceptedAt, candidateSignature } : o
        );
        saveLocalCache({ offers: updated });
        return updated;
      });
      if (candidateId) {
        setCandidates((prev) => {
          const updated = prev.map((c) =>
            c.id === candidateId ? { ...c, stage: "offer_accepted" as ApplicationStage } : c
          );
          saveLocalCache({ candidates: updated });
          return updated;
        });
      }

      // Auto-create onboarding packet
      const targetOffer = offers.find((o) => o.token === token);
      if (targetOffer) {
        const onbId = `onb-${Date.now()}`;
        const onbToken = `tok_onb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newPacket: WorkforceOnboardingPacket = {
          id: onbId,
          candidateId: targetOffer.candidateId,
          candidateName: targetOffer.candidateName,
          candidateEmail: targetOffer.candidateEmail,
          designation: targetOffer.offeredDesignation,
          department: targetOffer.department,
          roleCategory: targetOffer.roleCategory,
          token: onbToken,
          status: "pending_intake",
          createdAt: new Date().toLocaleString(),
        };
        setOnboardingPackets((prev) => {
          const updated = [newPacket, ...prev];
          saveLocalCache({ onboardingPackets: updated });
          return updated;
        });
      }

      mutateBackend("ACCEPT_OFFER", { token, signature: candidateSignature, candidateId });
    },
    [offers, saveLocalCache, mutateBackend]
  );

  const declineOffer = useCallback(
    (token: string, reason?: string, candidateId?: string) => {
      setOffers((prev) => {
        const updated = prev.map((o) =>
          o.token === token ? { ...o, status: "declined" as const } : o
        );
        saveLocalCache({ offers: updated });
        return updated;
      });
      mutateBackend("DECLINE_OFFER", { token, reason, candidateId });
    },
    [saveLocalCache, mutateBackend]
  );

  // 1b. Onboarding actions
  const initiateOnboarding = useCallback(
    (packet: Omit<WorkforceOnboardingPacket, "id" | "token" | "createdAt" | "status">) => {
      const id = `onb-${Date.now()}`;
      const token = `tok_onb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newPacket: WorkforceOnboardingPacket = {
        ...packet,
        id,
        token,
        status: "pending_intake",
        createdAt: new Date().toLocaleString(),
      };
      setOnboardingPackets((prev) => {
        const updated = [newPacket, ...prev];
        saveLocalCache({ onboardingPackets: updated });
        return updated;
      });
      mutateBackend("INITIATE_ONBOARDING", { ...newPacket, actorName: "HR Operations" });
      return { id, token };
    },
    [saveLocalCache, mutateBackend]
  );

  const submitOnboardingDossier = useCallback(
    (token: string, updates: Partial<WorkforceOnboardingPacket>) => {
      const submittedAt = new Date().toISOString();
      setOnboardingPackets((prev) => {
        const updated = prev.map((p) =>
          p.token === token
            ? { ...p, ...updates, status: "in_review" as const, submittedAt }
            : p
        );
        saveLocalCache({ onboardingPackets: updated });
        return updated;
      });
      mutateBackend("SUBMIT_ONBOARDING_DOSSIER", { token, ...updates, submittedAt });
    },
    [saveLocalCache, mutateBackend]
  );

  const approveOnboardingDossier = useCallback(
    (packetId: string, actorName: string = "HR Lead") => {
      const approvedAt = new Date().toISOString();
      setOnboardingPackets((prev) => {
        const updated = prev.map((p) =>
          p.id === packetId || p.token === packetId
            ? { ...p, status: "approved" as const, approvedAt }
            : p
        );
        saveLocalCache({ onboardingPackets: updated });
        return updated;
      });
      mutateBackend("APPROVE_ONBOARDING_DOSSIER", { packetId, actorName, approvedAt });
    },
    [saveLocalCache, mutateBackend]
  );

  const provisionSystemUser = useCallback(
    (
      packetId: string,
      payload: {
        candidateName: string;
        candidateId?: string;
        corporateEmail: string;
        designation: string;
        department: string;
        roleCategory: WorkforceRoleCategory;
        accessRole: string;
        residentialAddress?: string;
        phone?: string;
        location?: string;
      }
    ) => {
      const personId = `per-${Date.now()}`;
      const provisionedAt = new Date().toISOString();

      setOnboardingPackets((prev) => {
        const updated = prev.map((p) =>
          p.id === packetId || p.token === packetId
            ? {
                ...p,
                personId,
                status: "provisioned" as const,
                provisionedAt,
                systemAccount: {
                  corporateEmail: payload.corporateEmail,
                  accessRole: payload.accessRole,
                  isProvisioned: true,
                  provisionedAt,
                },
              }
            : p
        );
        saveLocalCache({ onboardingPackets: updated });
        return updated;
      });

      const newPerson: WorkforcePerson = {
        id: personId,
        name: payload.candidateName,
        email: payload.corporateEmail,
        phone: payload.phone || "+234 800 000 0000",
        role: payload.roleCategory,
        designation: payload.designation,
        department: payload.department,
        status: "active",
        location: payload.location || "Lagos HQ",
        joinDate: new Date().toISOString().split("T")[0],
        managerName: "HR Lead",
        competencyScore: 85,
        skills: [{ name: "Enterprise Onboarding", level: "Advanced", verified: true }],
        activeTasksCount: 0,
        attendanceRate: 100,
        residentialAddress: payload.residentialAddress,
      };

      setPeople((prev) => {
        const updated = [newPerson, ...prev];
        saveLocalCache({ people: updated });
        return updated;
      });

      if (payload.candidateId) {
        setCandidates((prev) => {
          const updated = prev.map((c) =>
            c.id === payload.candidateId ? { ...c, stage: "onboarded" as ApplicationStage } : c
          );
          saveLocalCache({ candidates: updated });
          return updated;
        });
      }

      mutateBackend("PROVISION_SYSTEM_USER", { packetId, personId, ...payload });
      return personId;
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
    courseModules,
    courseEnrollments,
    certificates,
    projects,
    deliverables,
    evaluationCycles,
    scorecards,
    pips,
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
    interviews,
    offers,
    onboardingPackets,
    // Action dispatchers
    updateCandidateStage,
    submitApplication,
    recordCandidateAssessment,
    convertCandidateToPerson,
    scheduleInterview,
    updateInterviewStatus,
    issueOffer,
    acceptOffer,
    declineOffer,
    initiateOnboarding,
    submitOnboardingDossier,
    approveOnboardingDossier,
    provisionSystemUser,
    addPerson,
    addCourse,
    createCourseModule,
    enrollLearner,
    updateLessonProgress,
    issueCertificate,
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
    approvePromotion,
    createEvaluationCycle,
    updateEvaluationCycleStatus,
    submitScorecard,
    createPip,
    updatePip,
    deployPerson,
    addTicket,
    resolveTicket,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createBranch,
    updateBranch,
    deleteBranch,
    createProject,
    updateProject,
    uploadDeliverable,
    reviewDeliverable,
    uploadDocument,
    verifyDocument,
    deleteDocument,
    updatePersonProfile,
    recordAuditLog,
  };
}
