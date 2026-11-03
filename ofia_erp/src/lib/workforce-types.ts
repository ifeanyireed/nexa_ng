export type WorkforceRoleCategory = "intern" | "employee" | "contractor" | "consultant";

export type ApplicationStage =
  | "received"
  | "screening"
  | "shortlisted"
  | "assessment"
  | "interview"
  | "final_selection"
  | "offer_issued"
  | "offer_accepted"
  | "onboarded"
  | "rejected";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  appliedRole: string;
  department: string;
  stage: ApplicationStage;
  appliedDate: string;
  score: number;
  experienceYears: number;
  education: string;
  skills: string[];
  resumeUrl?: string;
  interviewNotes?: string;
  interviewer?: string;
  offerAmount?: number;
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  openings: number;
  filled: number;
  location: string;
  type: WorkforceRoleCategory;
  closingDate: string;
  status: "open" | "closing_soon" | "filled" | "paused";
  requiredSkills: string[];
  stipendOrSalary: string;
}

export interface WorkforcePerson {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: WorkforceRoleCategory;
  designation: string;
  department: string;
  cohort?: string;
  status: "active" | "deployed" | "bench" | "leave" | "offboarded";
  location: string;
  joinDate: string;
  currentClient?: string;
  managerName: string;
  competencyScore: number;
  skills: { name: string; level: "Basic" | "Intermediate" | "Advanced" | "Expert"; verified: boolean }[];
  activeTasksCount: number;
  attendanceRate: number;
  avatar?: string;
}

export interface AcademyCourse {
  id: string;
  title: string;
  track: string;
  code: string;
  modulesCount: number;
  durationWeeks: number;
  enrolledLearners: number;
  completionRate: number;
  instructor: string;
  status: "active" | "draft" | "archived";
  competenciesGranted: string[];
}

export interface PracticalAssignment {
  id: string;
  title: string;
  courseTitle: string;
  track: string;
  assigneeName: string;
  deadline: string;
  status: "pending" | "submitted" | "approved" | "needs_revision";
  score?: number;
  feedback?: string;
  submissionDate?: string;
}

export interface WorkforceTask {
  id: string;
  title: string;
  project: string;
  department: string;
  assignedTo: string;
  supervisor: string;
  priority: "high" | "medium" | "low" | "critical";
  status: "backlog" | "in_progress" | "review" | "approved";
  deadline: string;
  score?: number;
  feedback?: string;
  deliverableSummary?: string;
}

export interface AttendanceRecord {
  id: string;
  personName: string;
  role: WorkforceRoleCategory;
  date: string;
  clockIn: string;
  clockOut?: string;
  status: "present" | "late" | "absent" | "leave" | "remote";
  location: string;
  verifiedGps: boolean;
}

export interface LeaveRequest {
  id: string;
  personName: string;
  department: string;
  leaveType: "Annual" | "Sick" | "Study" | "Maternity" | "Compassionate";
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

export interface CompetencyMatrixItem {
  id: string;
  competency: string;
  category: "Technical" | "Customer Success" | "Design" | "Operations" | "Compliance";
  requiredLevel: "Basic" | "Intermediate" | "Advanced" | "Expert";
  totalCertifiedPeople: number;
  inTrainingPeople: number;
}

export interface PromotionNomination {
  id: string;
  personName: string;
  currentDesignation: string;
  proposedDesignation: string;
  department: string;
  nominatedBy: string;
  tenureMonths: number;
  competencyRating: number;
  status: "under_review" | "approved" | "rejected";
}

export interface WorkforceRequest {
  id: string;
  clientName: string;
  contractTitle: string;
  requiredHeadcount: number;
  fulfilledHeadcount: number;
  requiredSkills: string[];
  durationMonths: number;
  location: string;
  startDate: string;
  status: "open" | "partially_fulfilled" | "fulfilled" | "closed";
  supervisor: string;
}

export interface DeploymentAllocation {
  id: string;
  personId: string;
  personName: string;
  role: string;
  clientName: string;
  contractTitle: string;
  startDate: string;
  endDate: string;
  allocationPercent: number;
  status: "active" | "ending_soon" | "completed";
  billingRateMonthly: number;
  costRateMonthly: number;
}

export interface ClientServiceAccount {
  id: string;
  clientName: string;
  industry: string;
  activeContractsCount: number;
  deployedStaffCount: number;
  monthlyContractValue: number;
  slaTargetHours: number;
  slaCompliancePercent: number;
  accountManager: string;
  health: "healthy" | "warning" | "critical";
}

export interface ServiceTicket {
  id: string;
  ticketNumber: string;
  clientName: string;
  subject: string;
  priority: "P1" | "P2" | "P3";
  assignedSpecialist: string;
  status: "open" | "in_progress" | "resolved" | "escalated";
  createdAt: string;
  slaMinutesRemaining: number;
}

export interface DailyWorkLog {
  id: string;
  personName: string;
  clientName: string;
  date: string;
  hoursWorked: number;
  summary: string;
  supervisorSignedOff: boolean;
}

export interface CompensationScale {
  id: string;
  tier: string;
  category: WorkforceRoleCategory;
  monthlyAmount: number;
  allowance: number;
  totalMonthly: number;
  activeRecipients: number;
}

export interface WorkforceKpis {
  totalWorkforce: number;
  activeEmployees: number;
  activeInterns: number;
  activeContractors: number;
  currentlyDeployed: number;
  availableBench: number;
  utilizationRatePercent: number;
  openVacancies: number;
  timeToHireDays: number;
  timeToCompetenceWeeks: number;
  averageSlaCompliancePercent: number;
  monthlyCost: number;
  monthlyClientBilledRevenue: number;
  grossMarginPercent: number;
}
