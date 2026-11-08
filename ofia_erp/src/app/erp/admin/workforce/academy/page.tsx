"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Users,
  Search,
  Filter,
  FileCheck2,
  Star,
  Plus,
  Play,
  Layers,
  ChevronRight,
  TrendingUp,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Copy,
  Check,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";
import {
  AcademyCourse,
  PracticalAssignment,
  CourseModule,
  CourseEnrollment,
  CourseCertificate,
} from "@/lib/workforce-types";

export default function TalentAcademyLmsPage() {
  const {
    courses,
    courseModules,
    courseEnrollments,
    certificates,
    assignments,
    people,
    gradeAssignment,
    addCourse,
    enrollLearner,
    issueCertificate,
  } = useWorkforceManager();

  const [activeTab, setActiveTab] = useState<"courses" | "assignments" | "certifications">("courses");
  const [selectedAssignment, setSelectedAssignment] = useState<PracticalAssignment | null>(null);
  const [gradingScore, setGradingScore] = useState<number>(90);
  const [gradingFeedback, setGradingFeedback] = useState<string>("");
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isIssueCertModalOpen, setIsIssueCertModalOpen] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<AcademyCourse | null>(null);

  // New course form
  const [newTitle, setNewTitle] = useState("");
  const [newTrack, setNewTrack] = useState("Technology");
  const [newCode, setNewCode] = useState("OFA-TECH-202");
  const [newModules, setNewModules] = useState(6);
  const [newInstructor, setNewInstructor] = useState("Tunde Bakare");

  // Enroll form
  const [enrollPersonId, setEnrollPersonId] = useState("");

  // Manual Cert form
  const [certPersonId, setCertPersonId] = useState("");
  const [certCourseId, setCertCourseId] = useState("");
  const [certGrade, setCertGrade] = useState("Distinction (95%)");
  const [certCompetencies, setCertCompetencies] = useState("Enterprise Systems Architecture, Multi-Tenant Security");

  // Copy hash feedback
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    gradeAssignment(selectedAssignment.id, gradingScore, gradingFeedback || "Passed competency requirements.");
    setSelectedAssignment(null);
    setGradingFeedback("");
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const course: AcademyCourse = {
      id: `course-${Date.now()}`,
      title: newTitle,
      track: newTrack,
      code: newCode,
      modulesCount: newModules,
      durationWeeks: 4,
      enrolledLearners: 0,
      completionRate: 0,
      instructor: newInstructor,
      status: "active",
      competenciesGranted: ["Core Domain Knowledge", "Operational Verification"],
    };

    addCourse(course);
    setIsNewCourseModalOpen(false);
    setNewTitle("");
  };

  const handleEnrollLearner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForEnroll || !enrollPersonId) return;

    const person = people.find((p) => p.id === enrollPersonId);
    if (!person) return;

    const newEnrollment: CourseEnrollment = {
      id: `enr-${Date.now()}`,
      courseId: selectedCourseForEnroll.id,
      personId: person.id,
      personName: person.name,
      progressPercentage: 0,
      completedLessons: [],
      status: "enrolled",
      enrolledAt: new Date().toISOString(),
    };

    enrollLearner(newEnrollment);
    setIsEnrollModalOpen(false);
    setEnrollPersonId("");
    setSelectedCourseForEnroll(null);
  };

  const handleIssueCert = (e: React.FormEvent) => {
    e.preventDefault();
    const person = people.find((p) => p.id === certPersonId);
    const course = courses.find((c) => c.id === certCourseId);
    if (!person || !course) return;

    const randomHex = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
    const verificationHash = `sha256_${Date.now()}_${randomHex}`;
    const certNumber = `OFIA-CERT-${new Date().getFullYear()}-${course.code.split("-")[1] || "OPS"}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCert: CourseCertificate = {
      id: `cert-${Date.now()}`,
      certificateNumber: certNumber,
      courseId: course.id,
      courseTitle: course.title,
      personId: person.id,
      personName: person.name,
      issueDate: new Date().toISOString().split("T")[0],
      grade: certGrade,
      verificationHash,
      competenciesAwarded: certCompetencies.split(",").map((c) => c.trim()).filter(Boolean),
    };

    issueCertificate(newCert);
    setIsIssueCertModalOpen(false);
    setCertPersonId("");
    setCertCourseId("");
  };

  const totalCertifiedCount = certificates.length;
  const activeLearnersCount = courseEnrollments.filter((e) => e.status !== "completed").length;

  return (
    <ErpAdminShell
      title="Talent Academy & Competency LMS"
      subtitle="Module 03 · Cohort learning tracks, curriculum delivery, practical assignments, and verified competency certifications."
      activeModule="workforce"
      action={
        <div className="flex items-center gap-2">
          <NexaButton
            size="sm"
            variant="secondary"
            className="gap-2 text-xs"
            onClick={() => setIsIssueCertModalOpen(true)}
          >
            <Award className="w-4 h-4 text-purple-400" />
            Issue Certificate
          </NexaButton>
          <NexaButton
            size="sm"
            variant="primary"
            className="gap-2 text-xs"
            onClick={() => setIsNewCourseModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Create Course
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-8">
        {/* TOP ACADEMY METRICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Active Learners</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              {courseEnrollments.length} Enrolled
            </p>
            <p className="text-xs text-purple-400 mt-1 font-medium">
              {activeLearnersCount} in active syllabus study
            </p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Available Programmes</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{courses.length} Courses</p>
            <p className="text-xs text-nexa-text-secondary mt-1">
              {courseModules.length} Modular Syllabus Units
            </p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Practical Assignments</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{assignments.length} Submissions</p>
            <p className="text-xs text-emerald-400 mt-1">
              {assignments.filter((a) => a.status === "approved").length} Graded & Verified
            </p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Verified Certifications</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{totalCertifiedCount} Issued</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Cryptographically verifiable
            </p>
          </div>
        </section>

        {/* TAB CONTROLS */}
        <div className="flex border-b border-nexa-border gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("courses")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "courses"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Course Library & Curriculum ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "assignments"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            Practical Assignments & Grading ({assignments.length})
          </button>
          <button
            onClick={() => setActiveTab("certifications")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "certifications"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <Award className="w-4 h-4" />
            Certifications & Verified Registry ({certificates.length})
          </button>
        </div>

        {/* TAB 1: COURSE LIBRARY */}
        {activeTab === "courses" && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
            {courses.map((course) => {
              const modulesForCourse = courseModules.filter((m) => m.courseId === course.id);
              const enrollmentsForCourse = courseEnrollments.filter((e) => e.courseId === course.id);
              const modulesCount = modulesForCourse.length > 0 ? modulesForCourse.length : course.modulesCount;
              const learnersCount = enrollmentsForCourse.length > 0 ? enrollmentsForCourse.length : course.enrolledLearners;

              return (
                <div
                  key={course.id}
                  className="p-6 bg-nexa-surface rounded-xl border border-nexa-border hover:border-purple-500/50 transition-all space-y-4 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {course.code} · {course.track}
                        </span>
                        <h3 className="text-base font-bold text-nexa-text-primary mt-2">{course.title}</h3>
                      </div>
                      <NexaBadge variant="secondary" className="capitalize text-[10px]">
                        {course.status}
                      </NexaBadge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-nexa-border/60 text-xs">
                      <div>
                        <span className="text-nexa-text-secondary text-[10px] block">Duration</span>
                        <span className="font-semibold text-nexa-text-primary">{course.durationWeeks} Weeks</span>
                      </div>
                      <div>
                        <span className="text-nexa-text-secondary text-[10px] block">Syllabus</span>
                        <span className="font-semibold text-nexa-text-primary">{modulesCount} Modules</span>
                      </div>
                      <div>
                        <span className="text-nexa-text-secondary text-[10px] block">Enrolled</span>
                        <span className="font-semibold text-nexa-text-primary">{learnersCount} Learners</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-semibold text-nexa-text-secondary">
                        Competencies Granted
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {course.competenciesGranted.map((c, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] bg-nexa-surface border border-nexa-border text-emerald-400 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" /> {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-nexa-border/60 flex items-center justify-between text-xs">
                    <span className="text-nexa-text-secondary">
                      Instructor: <strong className="text-nexa-text-primary">{course.instructor}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <NexaButton
                        size="sm"
                        variant="secondary"
                        className="text-[11px] py-1 px-2.5 gap-1"
                        onClick={() => {
                          setSelectedCourseForEnroll(course);
                          setIsEnrollModalOpen(true);
                        }}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Enroll Staff
                      </NexaButton>
                      <Link href={`/erp/admin/workforce/academy/${course.id}`}>
                        <NexaButton size="sm" variant="primary" className="text-[11px] py-1 px-3 gap-1">
                          View Syllabus &rarr;
                        </NexaButton>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* TAB 2: PRACTICAL ASSIGNMENTS & GRADING */}
        {activeTab === "assignments" && (
          <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-nexa-text-primary">Practical Learning Submissions</h3>
                <p className="text-xs text-nexa-text-secondary">
                  Evaluate real-world tasks submitted by interns. Scores $\ge 80\%$ automatically generate a verified cryptographic certificate.
                </p>
              </div>
            </div>

            <div className="divide-y divide-nexa-border/60">
              {assignments.map((asg) => (
                <div key={asg.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-nexa-text-primary">{asg.title}</h4>
                      <NexaBadge
                        variant={asg.status === "approved" ? "primary" : "secondary"}
                        className="text-[10px] uppercase font-mono py-0"
                      >
                        {asg.status.replace(/_/g, " ")}
                      </NexaBadge>
                    </div>
                    <p className="text-xs text-nexa-text-secondary">
                      Learner: <strong className="text-nexa-text-primary">{asg.assigneeName}</strong> ·{" "}
                      {asg.courseTitle}
                    </p>
                    {asg.feedback && (
                      <p className="text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 mt-1 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Supervisor Evaluation: &ldquo;{asg.feedback}&rdquo; <strong>(Score: {asg.score}%)</strong></span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      <span className="text-nexa-text-secondary block">Deadline:</span>
                      <span className="font-mono text-nexa-text-primary">{asg.deadline}</span>
                    </div>
                    {asg.status !== "approved" ? (
                      <NexaButton
                        size="sm"
                        variant="primary"
                        className="text-xs py-1 px-3"
                        onClick={() => setSelectedAssignment(asg)}
                      >
                        Grade Deliverable
                      </NexaButton>
                    ) : (
                      <NexaBadge variant="primary" className="text-[11px] gap-1 py-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Certified
                      </NexaBadge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: CERTIFICATIONS */}
        {activeTab === "certifications" && (
          <section className="space-y-6">
            <div className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-400" />
                    Cryptographic Verified Credentials Registry
                  </h3>
                  <p className="text-xs text-nexa-text-secondary">
                    Official certifications verified by Ofia Academy. Each credential contains a SHA-256 verification hash verifiable via public URLs without authentication.
                  </p>
                </div>
                <NexaButton
                  size="sm"
                  variant="primary"
                  className="gap-2 text-xs"
                  onClick={() => setIsIssueCertModalOpen(true)}
                >
                  <Plus className="w-4 h-4" /> Issue Certificate
                </NexaButton>
              </div>
            </div>

            <div className="overflow-x-auto bg-nexa-surface border border-nexa-border rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-nexa-surface/80 border-b border-nexa-border text-nexa-text-secondary uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Certificate ID</th>
                    <th className="py-3 px-4">Recipient Name</th>
                    <th className="py-3 px-4">Course Track & Programme</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Verification Hash</th>
                    <th className="py-3 px-4 text-right">Public Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nexa-border/60">
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-nexa-border/10 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-400">
                        {cert.certificateNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-nexa-text-primary">
                        {cert.personName}
                      </td>
                      <td className="py-3.5 px-4 text-nexa-text-secondary max-w-xs truncate">
                        {cert.courseTitle}
                      </td>
                      <td className="py-3.5 px-4 text-nexa-text-secondary font-mono">
                        {cert.issueDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {cert.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleCopyHash(cert.verificationHash)}
                          className="flex items-center gap-1.5 font-mono text-[10px] text-nexa-text-secondary hover:text-nexa-text-primary bg-black/30 px-2 py-1 rounded border border-nexa-border"
                          title="Click to copy full verification hash"
                        >
                          {copiedHash === cert.verificationHash ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{cert.verificationHash.substring(0, 16)}...</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/careers/verify-cert/${cert.verificationHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-semibold text-xs"
                        >
                          Verify Portal <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* GRADE DELIVERABLE MODAL */}
        {selectedAssignment && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Grade Practical Deliverable</h3>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleGrade} className="space-y-4 text-xs">
                <div>
                  <span className="text-nexa-text-secondary block">Learner</span>
                  <span className="font-bold text-nexa-text-primary">{selectedAssignment.assigneeName}</span>
                </div>
                <div>
                  <span className="text-nexa-text-secondary block">Assignment</span>
                  <span className="font-medium text-nexa-text-primary">{selectedAssignment.title}</span>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Score (0 - 100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradingScore}
                    onChange={(e) => setGradingScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                  {gradingScore >= 80 && (
                    <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Score qualifies for automated cryptographic certificate issuance!
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Evaluator Feedback</label>
                  <textarea
                    rows={3}
                    value={gradingFeedback}
                    onChange={(e) => setGradingFeedback(e.target.value)}
                    placeholder="Enter assessment notes and competency recommendation..."
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedAssignment(null)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Approve & Issue Grade
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE COURSE MODAL */}
        {isNewCourseModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Create Academy Course</h3>
                <button
                  onClick={() => setIsNewCourseModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Distributed Cloud Architecture"
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Track</label>
                    <select
                      value={newTrack}
                      onChange={(e) => setNewTrack(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Operations & IT">Operations & IT</option>
                      <option value="Compliance Hub">Compliance Hub</option>
                      <option value="Customer Success">Customer Success</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Course Code</label>
                    <input
                      type="text"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Modules Count</label>
                    <input
                      type="number"
                      value={newModules}
                      onChange={(e) => setNewModules(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Instructor</label>
                    <input
                      type="text"
                      value={newInstructor}
                      onChange={(e) => setNewInstructor(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsNewCourseModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Publish Course
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ENROLL LEARNER MODAL */}
        {isEnrollModalOpen && selectedCourseForEnroll && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Enroll Staff in Programme</h3>
                <button
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEnrollLearner} className="space-y-4 text-xs">
                <div>
                  <span className="text-nexa-text-secondary block">Programme</span>
                  <span className="font-bold text-purple-400">{selectedCourseForEnroll.title} ({selectedCourseForEnroll.code})</span>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Select Personnel / Intern</label>
                  <select
                    required
                    value={enrollPersonId}
                    onChange={(e) => setEnrollPersonId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  >
                    <option value="">-- Choose staff member --</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role.toUpperCase()} · {p.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsEnrollModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Confirm Enrollment
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ISSUE CERTIFICATE MODAL */}
        {isIssueCertModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  Grant Cryptographic Certificate
                </h3>
                <button
                  onClick={() => setIsIssueCertModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleIssueCert} className="space-y-3 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Candidate / Personnel</label>
                  <select
                    required
                    value={certPersonId}
                    onChange={(e) => setCertPersonId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  >
                    <option value="">-- Select Recipient --</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Academy Programme</label>
                  <select
                    required
                    value={certCourseId}
                    onChange={(e) => setCertCourseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} · {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Grade / Distinction</label>
                  <select
                    value={certGrade}
                    onChange={(e) => setCertGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  >
                    <option value="Distinction (95%)">Distinction (95%)</option>
                    <option value="Distinction (90%)">Distinction (90%)</option>
                    <option value="Merit (85%)">Merit (85%)</option>
                    <option value="Credit (80%)">Credit (80%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Competencies Awarded (comma separated)</label>
                  <input
                    type="text"
                    value={certCompetencies}
                    onChange={(e) => setCertCompetencies(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsIssueCertModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Issue & Cryptographically Seal
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ErpAdminShell>
  );
}
