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

export interface PersonEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface PersonEducation {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export interface PersonEmploymentHistory {
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  summary?: string;
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
  residentialAddress?: string;
  emergencyContact?: PersonEmergencyContact;
  education?: PersonEducation[];
  employmentHistory?: PersonEmploymentHistory[];
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

export interface TaskAssignee {
  id: string;
  name: string;
  role: string;
}

export interface WorkforceProject {
  id: string;
  title: string;
  code: string;
  department: string;
  clientId?: string;
  clientName?: string;
  leadPersonId?: string;
  leadPersonName: string;
  budget: number;
  spent: number;
  status: "planning" | "active" | "on_hold" | "completed";
  priority: "high" | "medium" | "low" | "critical";
  startDate: string;
  endDate?: string;
  description: string;
  deliverablesCount: number;
  tasksCount: number;
  completedTasksCount: number;
  createdAt: string;
}

export interface WorkforceTask {
  id: string;
  title: string;
  project: string;
  projectId?: string;
  department: string;
  assignedTo: string;
  assignees?: TaskAssignee[];
  supervisor: string;
  priority: "high" | "medium" | "low" | "critical";
  status: "backlog" | "in_progress" | "review" | "approved";
  deadline: string;
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: string[];
  score?: number;
  feedback?: string;
  deliverableSummary?: string;
  deliverableId?: string;
  createdAt?: string;
}

export interface WorkforceDeliverable {
  id: string;
  projectId: string;
  projectTitle?: string;
  taskId: string;
  taskTitle?: string;
  title: string;
  submittedById: string;
  submittedByName: string;
  fileUrl: string;
  fileType: "pdf" | "zip" | "github_pr" | "figma" | "document" | "code";
  fileSizeBytes: number;
  version: number;
  status: "pending_review" | "approved" | "rejected" | "revision_requested";
  reviewFeedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt: string;
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

export interface WorkforceDepartment {
  id: string;
  name: string;
  code: string;
  headPersonId?: string;
  headPersonName: string;
  budgetMonthly: number;
  targetHeadcount: number;
  activeHeadcount: number;
  description: string;
}

export interface WorkforceBranch {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  isHeadquarters: boolean;
  managerName: string;
}

export interface WorkforceDocument {
  id: string;
  personId: string;
  documentType: "cv" | "contract" | "nda" | "certificate" | "id_card" | "other";
  title: string;
  fileUrl: string;
  fileSizeBytes: number;
  uploadedBy: string;
  verified: boolean;
  createdAt: string;
}

export interface WorkforceAuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorName: string;
  changes: Record<string, any>;
  createdAt: string;
}

export interface WorkforceInterview {
  id: string;
  candidateId: string;
  candidateName: string;
  appliedRole: string;
  stage: "preliminary" | "technical" | "partner" | "final";
  scheduledStart: string;
  scheduledEnd: string;
  meetingUrl?: string;
  locationDetails?: string;
  panelMembers: { name: string; designation: string }[];
  status: "scheduled" | "completed" | "cancelled";
  interviewerNotes?: string;
  score?: number;
  token: string;
  createdAt: string;
}

export interface WorkforceOffer {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  roleCategory: WorkforceRoleCategory;
  offeredDesignation: string;
  department: string;
  monthlyStipendSalary: number;
  allowances: number;
  totalMonthly: number;
  startDate: string;
  expiryDate: string;
  offerLetterText: string;
  token: string;
  status: "issued" | "accepted" | "declined" | "expired";
  acceptedAt?: string;
  candidateSignature?: string;
  createdAt: string;
}

export type OnboardingStatus =
  | "pending_intake"
  | "in_review"
  | "approved"
  | "rejected"
  | "provisioned";

export interface OnboardingBankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  pfaName?: string;
  rsaPin?: string;
}

export interface OnboardingNextOfKin {
  name: string;
  relationship: string;
  phone: string;
  address?: string;
}

export interface OnboardingEquipmentRequisition {
  laptopPreference: "MacBook Pro / M-Series" | "Lenovo ThinkPad X1" | "Dell XPS Enterprise" | "Bring Your Own Device (BYOD)";
  requiresMonitor: boolean;
  requiresSecurityKey: boolean;
  assetTag?: string;
  serialNumber?: string;
  dispatchStatus: "pending" | "assigned" | "dispatched" | "received";
}

export interface OnboardingSystemAccount {
  corporateEmail: string;
  initialPassword?: string;
  accessRole: string;
  isProvisioned: boolean;
  provisionedAt?: string;
}

export interface OnboardingDocumentsSubmitted {
  offerLetterSigned: boolean;
  proofOfAddress: boolean;
  nyscCertificate: boolean;
  governmentId: boolean;
  passportPhoto: boolean;
}

export interface WorkforceOnboardingPacket {
  id: string;
  candidateId: string;
  personId?: string;
  candidateName: string;
  candidateEmail: string;
  designation: string;
  department: string;
  roleCategory: WorkforceRoleCategory;
  token: string;
  status: OnboardingStatus;
  nin?: string;
  bvn?: string;
  residentialAddress?: string;
  bankDetails?: OnboardingBankDetails;
  nextOfKin?: OnboardingNextOfKin;
  equipmentRequisition?: OnboardingEquipmentRequisition;
  systemAccount?: OnboardingSystemAccount;
  documentsSubmitted?: OnboardingDocumentsSubmitted;
  submittedAt?: string;
  approvedAt?: string;
  provisionedAt?: string;
  createdAt: string;
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

export interface CourseModuleLesson {
  id: string;
  title: string;
  durationMinutes: number;
  content: string;
  resources?: { title: string; url: string }[];
}

export interface CourseModuleQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  durationHours: number;
  summary: string;
  lessons: CourseModuleLesson[];
  quiz?: {
    questionsCount: number;
    passPercentage: number;
    questions?: CourseModuleQuizQuestion[];
  };
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  personId: string;
  personName: string;
  progressPercentage: number;
  completedLessons: string[];
  status: "enrolled" | "in_progress" | "completed";
  finalScore?: number;
  enrolledAt: string;
  completedAt?: string;
}

export interface CourseCertificate {
  id: string;
  certificateNumber: string;
  courseId: string;
  courseTitle: string;
  personId: string;
  personName: string;
  issueDate: string;
  grade: string;
  verificationHash: string;
  competenciesAwarded: string[];
}

