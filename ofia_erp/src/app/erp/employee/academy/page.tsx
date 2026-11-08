"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BusinessShell } from "@/components/business/BusinessShell";
import { useTenantProvisioning } from "@/lib/access-control";
import { useERPStore, getSignedInERPUser, User } from "@/lib/erp-store";
import { useWorkforceManager } from "@/lib/workforce-store";
import { AcademyCourse, PracticalAssignment } from "@/lib/workforce-types";
import {
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  ArrowRight,
  PlayCircle,
  FileCheck,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  Search,
  Check,
  ShieldAlert,
} from "lucide-react";

export default function EmployeeAcademyPage() {
  const { isModuleProvisioned, isLoading: isProvisioningLoading } = useTenantProvisioning();
  const { users } = useERPStore();
  const [currentUser, setCurrentUser] = useState<User>(() => getSignedInERPUser(users));
  const { courses, assignments, submitAssignment, isLoaded: isWorkforceLoaded } = useWorkforceManager();

  const [activeTab, setActiveTab] = useState<"courses" | "assignments" | "exams" | "certifications">("courses");
  const [selectedCourse, setSelectedCourse] = useState<AcademyCourse | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<PracticalAssignment | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const [assignmentSubmittedSuccess, setAssignmentSubmittedSuccess] = useState(false);

  // Interactive Quiz / Exam State
  const [activeExamStarted, setActiveExamStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = getSignedInERPUser(users);
      setCurrentUser(active);
    }
  }, [users]);

  const isWorkforceProvisioned = isModuleProvisioned("workforce");

  // Sample Quiz Questions for Knowledge Check
  const sampleQuizQuestions = [
    {
      question: "In the Ofia Enterprise architecture, how is tenant data isolation strictly enforced?",
      options: [
        "A single shared database with a tenant column filter only",
        "Strict database-per-tenant isolation using getTenantSql(tenantSlug) and dedicated Neon connections",
        "Public endpoints with client-side local storage routing",
        "Global in-memory cache shared by all corporate instances",
      ],
      correct: 1,
      explanation: "All enterprise tenants operate in DEDICATED database mode with dynamic resolver resolution.",
    },
    {
      question: "What is the mandatory caching TTL for tenant database configurations to prevent redundant lookups?",
      options: ["5 seconds", "60 seconds", "10 minutes", "No caching allowed"],
      correct: 1,
      explanation: "Resolver standard enforces an in-memory 60-second TTL to balance freshness and high performance.",
    },
    {
      question: "Which table holds permanent individual records across a person's entire career progression?",
      options: ["workforce_candidates", "workforce_people", "workforce_contracts", "user_sessions"],
      correct: 1,
      explanation: "Permanent identity design uses the 'people' entity so interns, employees, and contractors maintain a single lifecycle history.",
    },
    {
      question: "For outsourced IT technicians deployed to client accounts, what determines allocation suitability?",
      options: [
        "Only candidate interview score",
        "Random lottery allocation",
        "Competency levels, verified certifications, availability, and client SLA requirements",
        "Direct manager friendship",
      ],
      correct: 2,
      explanation: "WorkforceOS matches personnel using verified competencies, certifications, and availability.",
    },
  ];

  const handleAnswerSelect = (optionIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIdx,
    }));
  };

  const handleFinishExam = () => {
    let correctCount = 0;
    sampleQuizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) correctCount++;
    });
    const calculated = Math.round((correctCount / sampleQuizQuestions.length) * 100);
    setExamScore(calculated);
    setExamSubmitted(true);
  };

  const resetExam = () => {
    setActiveExamStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setExamSubmitted(false);
    setExamScore(null);
  };

  const handleSubmitAssignmentForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setIsSubmittingAssignment(true);

    try {
      submitAssignment(selectedAssignment.id, assignmentNotes);
      setAssignmentSubmittedSuccess(true);
      setTimeout(() => {
        setIsSubmittingAssignment(false);
        setSelectedAssignment(null);
        setAssignmentNotes("");
        setAssignmentSubmittedSuccess(false);
      }, 1000);
    } catch (err) {
      console.error("Failed to submit assignment:", err);
      setIsSubmittingAssignment(false);
    }
  };

  if (!isProvisioningLoading && !isWorkforceProvisioned) {
    return (
      <BusinessShell
        title="Talent Academy & Learning"
        subtitle="Workforce Management module is not provisioned for this organization."
      >
        <div className="bg-white rounded-3xl p-12 text-center max-w-xl mx-auto border border-gray-100 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-800">Talent Academy Not Activated</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            The <strong>Talent Academy & LMS</strong> module is not provisioned on this tenant&apos;s enterprise plan.
            Contact your organization administrator to activate WorkforceOS.
          </p>
          <div className="pt-2">
            <Link
              href="/erp/employee"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
            >
              <span>Back to Employee Overview</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </BusinessShell>
    );
  }

  // Filter personal assignments
  const userAssignments = assignments.filter((a) => {
    if (!currentUser.name) return true;
    return (
      a.assigneeName.toLowerCase().trim() === currentUser.name.toLowerCase().trim() ||
      a.assigneeName.toLowerCase().includes(currentUser.name.toLowerCase().split(" ")[0])
    );
  });
  const displayedAssignments = userAssignments.length > 0 ? userAssignments : assignments;

  return (
    <BusinessShell
      title={`Talent Academy & Learning — ${currentUser.name}`}
      subtitle="Interactive training courses, practical homework deliverables, competency assessments, and verified credentials."
      isLoading={isProvisioningLoading || !isWorkforceLoaded}
    >
      <div className="space-y-6">
        {/* Cohort & Academy Spotlight Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 border border-blue-500/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-blue-400/20 text-blue-200 border border-blue-300/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                {currentUser.designation?.toLowerCase().includes("intern") ? "Internship Academy" : "Professional Upskilling"}
              </span>
              <span className="text-xs text-blue-200/80 font-semibold">
                Cohort 2027A • 8-Week Professional Development Cycle
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight">
              Master Competencies. Deliver Real Value.
            </h3>
            <p className="text-xs text-blue-100/90 max-w-xl leading-relaxed">
              Complete assigned course lessons, submit practical deliverables for supervisor scoring, and earn verified competencies that qualify you for high-impact project deployments.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => setActiveTab("exams")}
              className="px-4 py-2.5 bg-white text-indigo-900 font-extrabold rounded-xl text-xs hover:bg-blue-50 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Take Competency Test</span>
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>My Assignments ({displayedAssignments.length})</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 overflow-x-auto">
          {[
            { id: "courses", label: "Enrolled Courses", count: courses.length, icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: "assignments", label: "Practical Assignments", count: displayedAssignments.length, icon: <FileCheck className="w-3.5 h-3.5" /> },
            { id: "exams", label: "Examination Centre", icon: <HelpCircle className="w-3.5 h-3.5" /> },
            { id: "certifications", label: "My Certifications & Badges", icon: <Award className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-gray-100"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: Enrolled Courses */}
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md border border-blue-100">
                      {course.track}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {course.code}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-800 leading-snug">
                    {course.title}
                  </h4>

                  <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold">
                    <span>{course.modulesCount} Modules</span>
                    <span>• {course.durationWeeks} Weeks</span>
                    <span>• Instructor: <strong className="text-slate-700">{course.instructor}</strong></span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-500">Curriculum Progress</span>
                      <span className="text-blue-600">{course.completionRate}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${course.completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Competencies Granted */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Competencies Awarded:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {course.competenciesGranted.map((c, i) => (
                        <span
                          key={i}
                          className="bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-bold px-2 py-0.5 rounded-md"
                        >
                          ✓ {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">
                    {course.enrolledLearners} Peers Enrolled
                  </span>
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Open Classroom</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: Practical Assignments */}
        {activeTab === "assignments" && (
          <div className="space-y-4">
            {displayedAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:border-blue-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      {assignment.track}
                    </span>
                    <span className="text-xs text-slate-400 font-medium truncate max-w-sm">
                      {assignment.courseTitle}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-800 leading-snug">
                    {assignment.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Deadline: {assignment.deadline}
                    </span>
                    {assignment.submissionDate && (
                      <span className="text-slate-400">
                        Submitted: {assignment.submissionDate}
                      </span>
                    )}
                  </div>

                  {/* Feedback block */}
                  {assignment.feedback && (
                    <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 text-xs text-emerald-900 mt-2">
                      <span className="font-black text-emerald-800 block mb-0.5">
                        Supervisor Feedback {assignment.score ? `(Score: ${assignment.score}/100)` : ""}:
                      </span>
                      {assignment.feedback}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <div>
                    {assignment.status === "approved" && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Approved ({assignment.score}/100)
                      </span>
                    )}
                    {assignment.status === "submitted" && (
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        Awaiting Evaluation
                      </span>
                    )}
                    {assignment.status === "pending" && (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Pending Submission
                      </span>
                    )}
                  </div>

                  {assignment.status === "pending" && (
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setAssignmentNotes("");
                      }}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Assignment</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Examination Centre */}
        {activeTab === "exams" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm max-w-2xl mx-auto space-y-6">
            {!activeExamStarted ? (
              <div className="text-center space-y-4 py-6">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                    Competency Knowledge Check
                  </span>
                  <h3 className="text-xl font-black text-slate-800 mt-1">
                    Enterprise Workforce & Tenancy Exam
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                    Test your understanding of multi-tenant database isolation, SLA management, and people operations. Passing score (75%+) records a verified competency to your profile.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl max-w-sm mx-auto text-left text-xs text-slate-600 space-y-1.5 font-medium border border-slate-100">
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <strong className="text-slate-800">{sampleQuizQuestions.length} Items</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Limit:</span>
                    <strong className="text-slate-800">10 Minutes</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Passing Threshold:</span>
                    <strong className="text-emerald-700">75%</strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveExamStarted(true);
                    setExamSubmitted(false);
                    setSelectedAnswers({});
                  }}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Begin Examination</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : examSubmitted ? (
              <div className="text-center space-y-4 py-6">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${
                    (examScore || 0) >= 75
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-amber-50 text-amber-600 border-amber-100"
                  }`}
                >
                  {(examScore || 0) >= 75 ? <Award className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Exam Completed
                  </span>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">
                    Your Score: {examScore}%
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">
                    {(examScore || 0) >= 75
                      ? "Congratulations! You have passed the competency benchmark and earned the Multi-Tenancy Architecture badge."
                      : "You did not achieve the 75% threshold. Review the learning materials and retake the test."}
                  </p>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={resetExam}
                    className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    Retake Assessment
                  </button>
                  <button
                    onClick={() => setActiveTab("certifications")}
                    className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    View My Badges
                  </button>
                </div>
              </div>
            ) : (
              /* Ongoing Exam Form */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-xs font-black text-indigo-700">
                    Question {currentQuestionIndex + 1} of {sampleQuizQuestions.length}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Active Assessment
                  </span>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-800 leading-relaxed">
                    {sampleQuizQuestions[currentQuestionIndex].question}
                  </h4>

                  <div className="space-y-2.5">
                    {sampleQuizQuestions[currentQuestionIndex].options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleAnswerSelect(oIdx)}
                        className={`w-full text-left p-3.5 rounded-2xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          selectedAnswers[currentQuestionIndex] === oIdx
                            ? "bg-indigo-50/80 border-indigo-400 text-indigo-900 shadow-sm"
                            : "bg-slate-50/80 border-slate-200/80 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span>{opt}</span>
                        {selectedAnswers[currentQuestionIndex] === oIdx && (
                          <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    className="px-4 py-2 bg-slate-100 disabled:opacity-30 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < sampleQuizQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      className="px-5 py-2.5 bg-indigo-600 text-white font-extrabold text-xs rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
                    >
                      Next Question →
                    </button>
                  ) : (
                    <button
                      onClick={handleFinishExam}
                      className="px-6 py-2.5 bg-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-700 shadow-md transition-all cursor-pointer"
                    >
                      Submit Exam Now
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Certifications & Badges */}
        {activeTab === "certifications" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: "Multi-Tenant Cloud Architecture",
                category: "Engineering Track",
                level: "Advanced",
                date: "April 2027",
                id: "CERT-2027-ENG-089",
                verified: true,
              },
              {
                title: "Client Service SLA Governance",
                category: "Client Operations",
                level: "Expert",
                date: "March 2027",
                id: "CERT-2027-OPS-034",
                verified: true,
              },
              {
                title: "Nigerian Labor & Statutory Compliance",
                category: "Governance & HR",
                level: "Intermediate",
                date: "February 2027",
                id: "CERT-2027-GOV-012",
                verified: true,
              },
            ].map((cert, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-bl-full pointer-events-none" />

                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                    <Award className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
                      {cert.category}
                    </span>
                    <h4 className="text-base font-black text-slate-800 mt-0.5 leading-snug">
                      {cert.title}
                    </h4>
                  </div>

                  <div className="space-y-1 text-xs text-slate-500 font-semibold">
                    <div className="flex justify-between">
                      <span>Proficiency Level:</span>
                      <strong className="text-slate-800">{cert.level}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Awarded:</span>
                      <strong className="text-slate-800">{cert.date}</strong>
                    </div>
                    <div className="flex justify-between font-mono text-[10px]">
                      <span>Credential ID:</span>
                      <span className="text-purple-700">{cert.id}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-emerald-700 bg-emerald-50 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified Credential
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Course Classroom Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 space-y-5 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                    {selectedCourse.code} • {selectedCourse.track}
                  </span>
                  <h3 className="text-lg font-black text-slate-800 mt-0.5">
                    {selectedCourse.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Instructor: <strong className="text-slate-800">{selectedCourse.instructor}</strong></span>
                  <span>{selectedCourse.modulesCount} Modules • {selectedCourse.durationWeeks} Weeks</span>
                </div>

                <div className="space-y-2.5">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Syllabus Modules
                  </h5>
                  {[
                    "Module 1: Foundations & Architecture Core",
                    "Module 2: Practical Implementation Patterns & APIs",
                    "Module 3: Security, Governance & Isolation Verification",
                    "Module 4: Supervised Real-World Case Study",
                  ].map((mod, i) => (
                    <div
                      key={i}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700"
                    >
                      <div className="flex items-center gap-2.5">
                        <PlayCircle className="w-4 h-4 text-blue-600" />
                        <span>{mod}</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {i === 0 ? "Completed" : i === 1 ? "In Progress" : "Upcoming"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="px-5 py-2.5 bg-slate-900 text-white font-extrabold text-xs rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  Close Classroom
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Practical Assignment Submission Modal */}
        {selectedAssignment && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                    Submit Practical Assignment
                  </span>
                  <h3 className="text-base font-black text-slate-800 mt-0.5">
                    {selectedAssignment.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {assignmentSubmittedSuccess ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-slate-800">
                    Assignment Submitted for Grading!
                  </h4>
                  <p className="text-xs text-slate-500">
                    Your submission has been queued for instructor grading and competency evaluation.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitAssignmentForm} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Assignment Notes / Deliverable Summary <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Outline your methodology, findings, code link, or solution details..."
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAssignment(null)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAssignment || !assignmentNotes.trim()}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingAssignment ? "Submitting..." : "Submit to Instructor"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </BusinessShell>
  );
}
